// Visit one page in the shared, never-consented browser context and record evidence.

import { createRequire } from 'node:module';
import path from 'node:path';
import { collectPageFacts } from './collect-page.mjs';

const require = createRequire(import.meta.url);
const AXE_SOURCE = require('axe-core').source;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const MAX_AXE_TARGETS = 3;
/** JPEG quality for evidence screenshots: readable, much smaller than PNG. */
const SCREENSHOT_QUALITY = 80;

/**
 * @param {import('playwright').BrowserContext} context
 * @param {string} url
 * @param {{index: number, evidenceDir: string, timeoutMs: number, settleMs: number, light?: boolean}} options
 */
export async function visitPage(context, url, { index, evidenceDir, timeoutMs, settleMs, light = false }) {
  const page = await context.newPage();
  const label = `seite-${String(index).padStart(2, '0')}`;
  try {
    const response = await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    await page.waitForTimeout(settleMs);
    const facts = await page.evaluate(collectPageFacts);
    const storage = await readStorage(page);
    // light = quick re-check of an earlier scan: no screenshots, no accessibility test.
    const screenshots = light ? {} : await takeScreenshots(page, facts, label, evidenceDir);
    const accessibility = light ? null : await runAxe(page);
    return {
      index, url, finalUrl: page.url(), status: response?.status() ?? null,
      headers: pickHeaders(response?.headers() ?? {}),
      facts, storage, screenshots, accessibility,
    };
  } catch (error) {
    const message = error.message.split('\n')[0];
    if (/Download is starting/i.test(message)) return { index, url, skipped: 'download' };
    return { index, url, error: message };
  } finally {
    await page.close();
  }
}

function pickHeaders(headers) {
  const keep = ['strict-transport-security', 'content-security-policy', 'content-type'];
  return Object.fromEntries(keep.filter((k) => headers[k]).map((k) => [k, headers[k]]));
}

async function readStorage(page) {
  return page.evaluate(() => {
    const keys = (store) => {
      try {
        return Object.keys(store);
      } catch {
        return [];
      }
    };
    return { localStorage: keys(window.localStorage), sessionStorage: keys(window.sessionStorage) };
  });
}

async function takeScreenshots(page, facts, label, evidenceDir) {
  const shots = {};
  const save = async (name, target) => {
    const file = `${label}-${name}.jpg`;
    try {
      await target.screenshot({ path: path.join(evidenceDir, file), type: 'jpeg', quality: SCREENSHOT_QUALITY, timeout: 10_000 });
      shots[name] = `belege/${file}`;
    } catch {
      // element not capturable (e.g. zero size); evidence is then the page screenshot
    }
  };
  await save('ansicht', page);
  if (facts.banner) await save('cookieabfrage', page.locator('[data-wlc-banner="1"]').first());
  if (facts.hasFooterElement) await save('fusszeile', page.locator('footer, [role="contentinfo"]').last());
  return shots;
}

async function runAxe(page) {
  try {
    await page.addScriptTag({ content: AXE_SOURCE });
    const result = await page.evaluate(async (tags) => {
      const res = await window.axe.run(document, { runOnly: { type: 'tag', values: tags }, resultTypes: ['violations'] });
      return res.violations;
    }, AXE_TAGS);
    return {
      violations: result.map((v) => ({
        id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, tags: v.tags.filter((t) => t.startsWith('wcag')),
        count: v.nodes.length, targets: v.nodes.slice(0, MAX_AXE_TARGETS).map((n) => n.target.join(' ')),
      })),
    };
  } catch (error) {
    return { error: error.message.split('\n')[0] };
  }
}
