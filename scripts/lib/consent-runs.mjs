// Consent choice runs (decisions 46a, 47b): after the main scan, which never touches the
// consent dialog, a fresh browser opens the start page, clicks "reject" (resp. "accept")
// and records what is loaded and stored from that click on, on a reload and on a few
// more pages. Many tags only fire on the next page view, hence the extra pages.

import { collectPageFacts } from './collect-page.mjs';
import { LEGAL_TYPES } from './page-types.mjs';
import { matchService } from './third-parties.mjs';
import { isThirdParty } from './url.mjs';
import { PATTERNS } from './checks/helpers.mjs';

export const CHOICES = ['reject', 'accept'];
/** Pages visited after the click besides the reload of the start page. */
const EXTRA_PAGES = 2;
const CLICK_TIMEOUT_MS = 5_000;
const SETTINGS = /einstellung|anpassen|individuell|mehr optionen|details|settings|customi[sz]e|manage|preferences/i;
/** Stricter than PATTERNS.accept for buttons found outside a recognised banner ("OK" is too common). */
const ACCEPT_STRICT = /akzeptieren|zustimmen|einwilligen|einverstanden|alle erlauben|alle zulassen|accept|allow all/i;
/** Accept labels not in PATTERNS.accept (which also drives TDD-04 and stays unchanged). */
const ACCEPT_EXTRA = /einwilligen/i;

/** Label test per choice. Reject wins when a label matches both ("Nur notwendige akzeptieren"). */
export function matchesChoice(label, choice, strict = false) {
  const text = String(label ?? '').trim();
  if (!text || SETTINGS.test(text) && !PATTERNS.reject.test(text)) return false;
  if (choice === 'reject') return PATTERNS.reject.test(text);
  const accept = strict ? ACCEPT_STRICT.test(text) : PATTERNS.accept.test(text) || ACCEPT_EXTRA.test(text);
  return accept && !PATTERNS.reject.test(text);
}

/** Button to click: inside the recognised banner first, then any button in any frame (open shadow DOM included). */
async function findChoiceButton(page, choice) {
  const named = (root) => root.getByRole('button', { name: /./ }).filter({ visible: true });
  const pick = async (locator, strict) => {
    const count = Math.min(await locator.count(), 40);
    const candidates = [];
    for (let i = 0; i < count; i += 1) {
      const item = locator.nth(i);
      const label = (await item.innerText({ timeout: 1_000 }).catch(() => ''))
        || (await item.getAttribute('aria-label').catch(() => '')) || (await item.getAttribute('value').catch(() => '')) || '';
      if (matchesChoice(label, choice, strict)) candidates.push({ item, label: label.trim().slice(0, 80) });
    }
    // Prefer "Alle akzeptieren" over "Auswahl akzeptieren" (the latter may save nothing).
    return candidates.find((c) => /alle|all/i.test(c.label)) ?? candidates[0] ?? null;
  };
  // In the banner a reject link counts too (same element list as collect-page.mjs).
  const bannerControls = page.locator('[data-wlc-banner="1"]').first()
    .locator('button, a, [role="button"], input[type="button"], input[type="submit"]').filter({ visible: true });
  const inBanner = await pick(bannerControls, false);
  if (inBanner) return inBanner;
  for (const frame of page.frames()) {
    const found = await pick(named(frame), true);
    if (found) return found;
  }
  return null;
}

/**
 * URLs for the runs: the start page, then content pages; legal pages (imprint, privacy …)
 * only as a fallback, because they often load fewer tags (decision 50a).
 * @param {{url: string, finalUrl?: string, pageType?: string, error?: string, skipped?: string}[]} pages scanned pages, start page first
 */
export function consentRunUrls(pages) {
  const ok = pages.filter((p) => !p.error && !p.skipped);
  const [first, ...rest] = ok;
  if (!first) return [];
  const isLegal = (p) => LEGAL_TYPES.includes(p.pageType);
  return [first, ...rest.filter((p) => !isLegal(p)), ...rest.filter(isLegal)].map((p) => p.finalUrl ?? p.url);
}

/**
 * @param {import('playwright').Browser} browser
 * @param {URL} start
 * @param {string[]} pageUrls scanned pages (start page first); the run reloads the start page and visits a few of the others
 * @param {{contextOptions: object, timeoutMs: number, settleMs: number}} options
 * @returns {Promise<Record<string, object>>} one result per choice
 */
export async function runConsentChoices(browser, start, pageUrls, options) {
  const results = {};
  for (const choice of CHOICES) results[choice] = await runChoice(browser, start, pageUrls, choice, options);
  return results;
}

async function runChoice(browser, start, pageUrls, choice, { contextOptions, timeoutMs, settleMs }) {
  const context = await browser.newContext(contextOptions);
  const requests = [];
  let phase = 'before';
  context.on('request', (request) => {
    if (phase === 'before' || !/^https?:/i.test(request.url())) return;
    const service = matchService(request.url());
    requests.push({
      url: request.url().slice(0, 500), thirdParty: isThirdParty(request.url(), start.hostname),
      service: service?.name ?? null, category: service?.category ?? null, step: phase,
    });
  });
  try {
    const page = await context.newPage();
    await page.goto(pageUrls[0], { waitUntil: 'load', timeout: timeoutMs });
    await page.waitForTimeout(settleMs);
    await page.evaluate(collectPageFacts); // marks the banner element
    const cookiesBefore = new Set((await context.cookies()).map((c) => `${c.name}@${c.domain}`));
    const button = await findChoiceButton(page, choice);
    if (!button) return { choice, clicked: false, reason: 'no matching button found' };
    phase = 'click';
    await button.item.click({ timeout: CLICK_TIMEOUT_MS });
    await page.waitForTimeout(settleMs);
    const bannerGone = !(await page.locator('[data-wlc-banner="1"]').first().isVisible().catch(() => false));
    const visited = [];
    for (const url of [pageUrls[0], ...pageUrls.slice(1, 1 + EXTRA_PAGES)]) {
      phase = url;
      await page.goto(url, { waitUntil: 'load', timeout: timeoutMs }).catch(() => null);
      await page.waitForTimeout(settleMs);
      visited.push(url);
    }
    const cookies = (await context.cookies())
      .filter((c) => !cookiesBefore.has(`${c.name}@${c.domain}`))
      .map((c) => ({ name: c.name, domain: c.domain, thirdParty: isThirdParty(`https://${c.domain.replace(/^\./, '')}/`, start.hostname) }));
    return { choice, clicked: true, button: button.label, bannerGone, visited, requests, newCookies: cookies };
  } catch (error) {
    return { choice, clicked: false, reason: error.message.split('\n')[0] };
  } finally {
    await context.close();
  }
}
