// Orchestrates a scan: sample pages (decision 3a), then a short deep check (15a).
// The main browser context never interacts with consent dialogs, so everything recorded
// there happened before any consent; afterwards fresh contexts click reject and accept.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { canonicalPageUrl, isSameSite, isThirdParty, normalizeStartUrl, NON_PAGE_EXTENSIONS } from './url.mjs';
import { classifyPage, LEGAL_TYPES, selectDeepCheckUrls } from './page-types.mjs';
import { discoverSitemapUrls } from './sitemap.mjs';
import { matchService } from './third-parties.mjs';
import { checkTransport } from './transport.mjs';
import { linkScreenshots, pageFingerprint } from './reuse.mjs';
import { visitPage } from './visit-page.mjs';
import { runConsentChoices } from './consent-runs.mjs';

const CONTEXT_OPTIONS = { bypassCSP: true, locale: 'de-DE', viewport: { width: 1366, height: 900 } };

export const DEFAULTS = {
  maxNavPages: 40, maxExtraPages: 20, deepPerType: 3, deep: true,
  delayMs: 500, pageTimeoutMs: 45_000, settleMs: 2_500, maxTotalMs: 20 * 60_000,
};

/**
 * @param {{startUrl: string, outDir: string, launchArgs?: string[], log?: (msg: string) => void} & Partial<typeof DEFAULTS>} options
 * @returns {Promise<object>} the scan result (also written to outDir/scan.json)
 */
export async function scanSite(options) {
  const opts = { ...DEFAULTS, log: () => {}, launchArgs: [], ...options };
  const start = normalizeStartUrl(opts.startUrl);
  const evidenceDir = path.join(opts.outDir, 'belege');
  await mkdir(evidenceDir, { recursive: true });

  const startedAt = Date.now();
  const transport = await checkTransport(start);
  const browser = await chromium.launch({ args: opts.launchArgs });
  const state = { pages: [], requests: [], cookieFirstSeen: new Map(), visited: new Set(), notes: [] };
  try {
    const context = await browser.newContext(CONTEXT_OPTIONS);
    context.on('request', (request) => recordRequest(state, request.url(), request.resourceType(), start));
    const crawl = (url) => crawlPage(context, url, state, opts, evidenceDir, startedAt);

    let deepCheck;
    if (opts.reuseFrom) {
      state.reuse = await reuseEarlierScan(context, state, opts, evidenceDir);
      deepCheck = { skipped: true, decision: 'Earlier scan reused; pages of that scan re-checked.' };
    } else {
      await crawl(start.toString());
      const firstPage = state.pages[0];
      if (firstPage?.error) throw new Error(`Start page not reachable: ${firstPage.error}`);
      for (const url of sampleTargets(state, start, opts)) await crawl(url);
      deepCheck = opts.deep ? await runDeepCheck(state, start, opts, crawl) : { skipped: true };
    }

    const cookies = (await context.cookies()).map((c) => describeCookie(c, start, state.cookieFirstSeen));
    await context.close();
    const pageUrls = state.pages.filter((p) => !p.error && !p.skipped).map((p) => p.finalUrl ?? p.url);
    opts.log('Consent choices: reject and accept');
    const consentRuns = pageUrls.length > 0
      ? await runConsentChoices(browser, start, pageUrls, { contextOptions: CONTEXT_OPTIONS, timeoutMs: opts.pageTimeoutMs, settleMs: opts.settleMs })
      : null;
    const result = buildResult({ start, transport, state, cookies, deepCheck, consentRuns, startedAt });
    await writeFile(path.join(opts.outDir, 'scan.json'), JSON.stringify(result, null, 2));
    return result;
  } finally {
    await browser.close();
  }
}

/**
 * Re-check every page of an earlier scan without screenshots; take unchanged pages over
 * (data and screenshots), scan changed or previously failed pages fully again.
 */
async function reuseEarlierScan(context, state, opts, evidenceDir) {
  const oldDataDir = path.join(opts.reuseFrom, 'daten');
  const old = JSON.parse(await readFile(path.join(oldDataDir, 'scan.json'), 'utf8'));
  const reuse = { from: path.basename(opts.reuseFrom), scannedAt: old.scannedAt, unchangedPages: [], changedPages: [] };
  const visitOptions = (index) => ({ index, evidenceDir, timeoutMs: opts.pageTimeoutMs, settleMs: opts.settleMs });
  for (const oldPage of old.pages) {
    state.currentIndex = oldPage.index;
    state.visited.add(oldPage.url);
    opts.log(`[${oldPage.index}] ${oldPage.url} (re-check)`);
    const mark = state.requests.length;
    const quick = oldPage.error || oldPage.skipped ? null : await visitPage(context, oldPage.url, { ...visitOptions(oldPage.index), light: true });
    const same = quick && !quick.error
      && pageFingerprint(quick.facts, state.requests.slice(mark)) === pageFingerprint(oldPage.facts, old.requests.filter((r) => r.page === oldPage.index));
    if (same) {
      state.pages.push({ ...oldPage, screenshots: linkScreenshots(oldPage.screenshots, oldDataDir, path.dirname(evidenceDir)) });
      reuse.unchangedPages.push(oldPage.url);
    } else {
      state.requests.splice(mark);
      const full = await visitPage(context, oldPage.url, visitOptions(oldPage.index));
      full.pageType = classifyPage(full.finalUrl ?? oldPage.url, full.facts?.title);
      state.pages.push(full);
      reuse.changedPages.push(oldPage.url);
    }
    await noteNewCookies(context, state);
    await new Promise((resolve) => setTimeout(resolve, opts.delayMs));
  }
  return reuse;
}

async function crawlPage(context, url, state, opts, evidenceDir, startedAt) {
  const canonical = canonicalPageUrl(url, url);
  if (!canonical || state.visited.has(canonical)) return;
  if (Date.now() - startedAt > opts.maxTotalMs) {
    state.notes.push(`Time limit reached, skipped: ${canonical}`);
    return;
  }
  state.visited.add(canonical);
  state.currentIndex = state.pages.length + 1;
  opts.log(`[${state.currentIndex}] ${canonical}`);
  const result = await visitPage(context, canonical, {
    index: state.currentIndex, evidenceDir, timeoutMs: opts.pageTimeoutMs, settleMs: opts.settleMs,
  });
  result.pageType = classifyPage(result.finalUrl ?? canonical, result.facts?.title);
  if (result.finalUrl) state.visited.add(canonicalPageUrl(result.finalUrl, result.finalUrl));
  state.pages.push(result);
  await noteNewCookies(context, state);
  await new Promise((resolve) => setTimeout(resolve, opts.delayMs));
}

function recordRequest(state, url, resourceType, start) {
  if (!/^https?:/i.test(url)) return;
  const service = matchService(url);
  state.requests.push({
    page: state.currentIndex ?? 1, url: url.slice(0, 500), resourceType,
    thirdParty: isThirdParty(url, start.hostname), service: service?.name ?? null, category: service?.category ?? null,
  });
}

async function noteNewCookies(context, state) {
  for (const cookie of await context.cookies()) {
    const key = `${cookie.name}@${cookie.domain}`;
    if (!state.cookieFirstSeen.has(key)) state.cookieFirstSeen.set(key, state.currentIndex);
  }
}

function describeCookie(cookie, start, firstSeen) {
  const host = cookie.domain.replace(/^\./, '');
  return {
    name: cookie.name, domain: cookie.domain, path: cookie.path,
    expires: cookie.expires > 0 ? new Date(cookie.expires * 1000).toISOString() : 'session',
    httpOnly: cookie.httpOnly, secure: cookie.secure, sameSite: cookie.sameSite,
    thirdParty: isThirdParty(`https://${host}/`, start.hostname),
    firstSeenOnPage: firstSeen.get(`${cookie.name}@${cookie.domain}`) ?? null,
  };
}

/** Header/footer/nav links and legal pages first, then other internal links. */
function sampleTargets(state, start, opts) {
  const links = state.pages[0]?.facts?.links ?? [];
  const usable = links.filter((l) => isSameSite(l.href, start) && !NON_PAGE_EXTENSIONS.test(new URL(l.href).pathname));
  const nav = unique(usable.filter((l) => l.region !== 'main' || LEGAL_TYPES.includes(classifyPage(l.href, l.text))));
  const other = unique(usable.filter((l) => l.region === 'main')).filter((u) => !nav.includes(u));
  return [...nav.slice(0, opts.maxNavPages), ...other.slice(0, opts.maxExtraPages)];
}

function unique(links) {
  return [...new Set(links.map((l) => canonicalPageUrl(l.href, l.href)).filter(Boolean))];
}

async function runDeepCheck(state, start, opts, crawl) {
  const sitemap = await discoverSitemapUrls(start);
  const linked = state.pages.flatMap((p) => p.facts?.links ?? [])
    .filter((l) => isSameSite(l.href, start))
    .map((l) => ({ url: canonicalPageUrl(l.href, l.href), text: l.text })).filter((c) => c.url);
  const candidates = [...linked, ...sitemap.urls.map((u) => ({ url: canonicalPageUrl(u, u) })).filter((c) => c.url)];
  const coveredTypes = new Set(state.pages.filter((p) => !p.error).map((p) => p.pageType));
  const added = selectDeepCheckUrls(candidates, coveredTypes, state.visited, opts.deepPerType);
  for (const { url } of added) await crawl(url);
  return {
    sitemapSources: sitemap.source, sitemapUrlCount: sitemap.urls.length,
    coveredTypesBefore: [...coveredTypes], added,
    decision: added.length > 0 ? 'Sample missed page types; extra pages scanned.' : 'Sample covers all relevant page types; no deeper scan needed.',
  };
}

function buildResult({ start, transport, state, cookies, deepCheck, consentRuns, startedAt }) {
  return {
    tool: 'website-legal-check-de', scannedAt: new Date(startedAt).toISOString(),
    durationSeconds: Math.round((Date.now() - startedAt) / 1000),
    startUrl: start.toString(), host: start.hostname, consentGiven: false,
    transport, deepCheck, reuse: state.reuse ?? null, notes: state.notes, cookies,
    requests: state.requests, pages: state.pages, consentRuns,
  };
}
