// Run all automatic checks on a scan result. Output is a list of candidate findings
// that Claude verifies against the evidence before writing the report.

import { checkConsent } from './consent.mjs';
import { checkConsentChoice } from './consent-choice.mjs';
import { checkLegalPages } from './legal-pages.mjs';
import { checkScriptTags } from './script-tags.mjs';
import { checkShop } from './shop.mjs';
import { checkSite } from './site.mjs';
import { looksLikeShop } from './helpers.mjs';
import { detectPlatform } from '../platform.mjs';

const STATUS_ORDER = { gap: 0, hint: 1, ok: 2 };

/**
 * @param {object} scan result of scanSite()
 * @returns {{siteProfile: object, findings: import('./helpers.mjs').Finding[]}}
 */
export function runChecks(scan) {
  const findings = [
    ...checkLegalPages(scan),
    ...checkConsent(scan),
    ...checkConsentChoice(scan),
    ...checkShop(scan),
    ...checkScriptTags(scan),
    ...checkSite(scan),
  ].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const pages = scan.pages.filter((p) => !p.error && !p.skipped);
  return {
    siteProfile: {
      shopSignals: looksLikeShop(scan),
      platform: detectPlatform(scan),
      pagesScanned: pages.length,
      pagesFailed: scan.pages.filter((p) => p.error).map((p) => ({ url: p.url, error: p.error })),
      pagesSkipped: scan.pages.filter((p) => p.skipped).map((p) => ({ url: p.url, reason: p.skipped })),
      pageTypes: [...new Set(pages.map((p) => p.pageType))],
    },
    findings,
  };
}
