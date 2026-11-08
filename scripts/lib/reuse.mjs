// Reuse of an earlier scan (decisions 29b, 30a, 31b): find the newest earlier scan of the
// same site (at most 30 days old) and compare pages by a fingerprint, so unchanged pages
// keep their data and screenshots and only changed pages are scanned again.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { baseDomain } from './url.mjs';

export const MAX_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const stripWww = (host) => host.toLowerCase().replace(/^www\./, '');
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Newest earlier scan of the site in parent (folders JJJJMMTT_<website>_<SPRACHE>[_RefN] with daten/scan.json; older schemes accepted).
 * @param {string} parent
 * @param {URL} start
 * @param {Date} [now]
 * @returns {Promise<{dir: string, scannedAt: string} | null>}
 */
export async function findPreviousScan(parent, start, now = new Date(), maxAgeDays = MAX_AGE_DAYS) {
  const host = stripWww(start.hostname);
  // Old scheme keeps the dots ("xyz.de"), the new one uses hyphens ("xyz-de", decision 36a).
  const hostPattern = host.split('.').map(escapeRe).join('[.-]');
  // Language code since v1.9.6 (decision 44a), e.g. 20261108_xyz-de_FR_Ref2.
  const pattern = new RegExp(`^\\d{8}(_Ref\\d+)?_${hostPattern}(_[a-z]{2,3}(-[a-z0-9]{2,8})?)?(_Ref\\d+|_\\d+)?$`, 'i');
  let best = null;
  for (const entry of await readdir(parent, { withFileTypes: true })) {
    if (!entry.isDirectory() || !pattern.test(entry.name)) continue;
    const dir = path.join(parent, entry.name);
    let scan;
    try {
      scan = JSON.parse(await readFile(path.join(dir, 'daten', 'scan.json'), 'utf8'));
    } catch {
      continue;
    }
    const at = new Date(scan.scannedAt);
    if (stripWww(scan.host ?? '') !== host || Number.isNaN(at.getTime())) continue;
    if (now - at > maxAgeDays * DAY_MS || at > now) continue;
    if (!best || at > new Date(best.scannedAt)) best = { dir, scannedAt: scan.scannedAt };
  }
  return best;
}

/**
 * Everything that matters for the checks on one page; equal fingerprints mean the page
 * can be taken over from the earlier scan.
 * @param {object} facts page facts from collect-page.mjs
 * @param {{url: string, thirdParty: boolean}[]} requests requests made while loading the page
 */
export function pageFingerprint(facts, requests) {
  // Registrable domains, not host names: services rotate servers (e.g. …-prod-9.firebaseio.com).
  const thirdParty = [...new Set(requests.filter((r) => r.thirdParty).map((r) => baseDomain(new URL(r.url).hostname)))].sort();
  return JSON.stringify({
    title: facts.title, text: facts.bodyText, generator: facts.generator ?? null,
    links: facts.links.map((l) => l.href).sort(),
    banner: facts.banner ? facts.banner.buttons : null,
    forms: facts.forms.map((f) => `${f.action} ${f.text}`),
    prices: facts.prices.map((p) => p.text),
    thirdParty,
  });
}

/**
 * Screenshots of an unchanged page are not copied (decision 32a): the paths are rewritten
 * to point from the new data folder to the files of the earlier scan.
 */
export function linkScreenshots(screenshots, oldDataDir, newDataDir) {
  return Object.fromEntries(Object.entries(screenshots ?? {}).map(([name, rel]) => [
    name, path.relative(newDataDir, path.resolve(oldDataDir, rel)).split(path.sep).join('/'),
  ]));
}
