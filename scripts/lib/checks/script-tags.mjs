// Shopify script tags (decisions 52a–54a): Shopify stops injecting them into storefronts on
// 1 March 2027 (SRC-95). Not a legal duty in itself, but a consent tool loaded this way
// would vanish while tracking in the theme keeps loading (§ 25 TDDDG), and widgets or
// tracking disappear silently. Shopify renders them as a URL list in an inline `asyncLoad`
// function; this is observed on live shops, not documented (UNVERIFIED).

import { matchService } from '../third-parties.mjs';
import { finding, okPages } from './helpers.mjs';

/** Date from which Shopify no longer injects script tags into storefronts. */
export const SCRIPT_TAG_CUTOFF = '2027-03-01';
const URL_LIST = /var\s+urls\s*=\s*(\[[\s\S]*?\])\s*;/;
/** Shopify's proxy: //cdn.shopify.com/proxy/<hash>/<host>/<path>. */
const SHOPIFY_PROXY = /^https:\/\/cdn\.shopify\.com\/proxy\/[0-9a-f]+\/(.+)$/i;
/** Consent apps not in data/third-parties.json are recognised by words in host or path. */
const CONSENT_WORDS = /consent|cookie|gdpr|dsgvo|\bcmp\b/i;

function normalise(raw) {
  const absolute = raw.startsWith('//') ? `https:${raw}` : raw;
  const proxied = SHOPIFY_PROXY.exec(absolute);
  return proxied ? `https://${proxied[1]}` : absolute;
}

function listEntries(arrayText) {
  try {
    const parsed = JSON.parse(arrayText);
    return Array.isArray(parsed) ? parsed.filter((u) => typeof u === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Script tag URLs from the inline `asyncLoad` script of a Shopify storefront.
 * @param {string|null|undefined} source inline script text
 * @returns {string[]}
 */
export function parseScriptTagUrls(source) {
  const match = URL_LIST.exec(String(source ?? ''));
  return match ? listEntries(match[1]).map(normalise) : [];
}

function isConsentTool(url) {
  if (matchService(url)?.category === 'consent') return true;
  try {
    const { hostname, pathname } = new URL(url);
    return CONSENT_WORDS.test(`${hostname}${pathname}`);
  } catch {
    return false;
  }
}

/** @param {object} scan result of scanSite() */
export function checkScriptTags(scan) {
  const pages = okPages(scan).filter((p) => parseScriptTagUrls(p.facts.asyncLoadScript).length > 0);
  if (pages.length === 0) return [];
  const urls = [...new Set(pages.flatMap((p) => parseScriptTagUrls(p.facts.asyncLoadScript)))];
  const where = pages.map((p) => p.finalUrl ?? p.url);
  const afterCutoff = String(scan.scannedAt ?? '').slice(0, 10) >= SCRIPT_TAG_CUTOFF;
  const base = { cutoff: SCRIPT_TAG_CUTOFF, afterCutoff };
  const consent = urls.filter(isConsentTool);
  const others = urls.filter((u) => !consent.includes(u));
  const results = [];
  if (consent.length > 0) {
    results.push(finding('TDD-08', 'hint', 'Consent tool loaded as a Shopify script tag (no longer injected from 1 March 2027)',
      where, { ...base, consentTool: true, scriptTags: consent }));
  }
  if (others.length > 0) {
    results.push(finding('TDD-08', 'hint', `${others.length} app script(s) loaded as Shopify script tags (no longer injected from 1 March 2027)`,
      where, { ...base, consentTool: false, scriptTags: others }));
  }
  return results;
}
