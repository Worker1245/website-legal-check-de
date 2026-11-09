// Imprint, privacy policy, withdrawal, terms and accessibility statement: present and
// reachable from every scanned page.

import { matchService, policyMentions } from '../third-parties.mjs';
import { finding, hasLink, looksLikeShop, okPages, pageOfType, PATTERNS, shotsOf } from './helpers.mjs';

const url = (p) => p.finalUrl ?? p.url;

/** A legal link must be on every page; report pages without it. */
function linkOnEveryPage(scan, check, pattern, label) {
  const pages = okPages(scan);
  const missing = pages.filter((p) => !hasLink(p, pattern));
  if (missing.length === 0) return finding(check, 'ok', `${label} link on every scanned page`, []);
  const title = missing.length === pages.length
    ? `No ${label} link found on any scanned page`
    : `${label} link missing on ${missing.length} of ${pages.length} pages`;
  return finding(check, 'gap', title, missing.map(url), {
    screenshots: missing.slice(0, 3).flatMap(shotsOf),
    footerText: missing[0].facts.footerText.slice(0, 400),
  });
}

/** Minimal content signals on the imprint page (§ 5 DDG): e-mail and postal address. */
function imprintContent(scan) {
  const page = pageOfType(scan, 'imprint');
  if (!page) return [];
  const text = page.facts.bodyText;
  const results = [];
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+|\[at\]|\(at\)|@/i.test(text);
  const hasAddress = /\b\d{5}\s+[A-ZÄÖÜ][\wäöüß-]+/.test(text) || /\bA-\d{4}\b|\b\d{4}\s+[A-ZÄÖÜ][\wäöüß-]+/.test(text);
  if (!hasEmail) results.push(finding('IMP-02', 'gap', 'Imprint page shows no e-mail address', [url(page)], { screenshots: shotsOf(page) }));
  if (!hasAddress) results.push(finding('IMP-02', 'hint', 'Imprint page: no postal code and town recognised', [url(page)], { screenshots: shotsOf(page) }));
  if (!/umsatzsteuer|ust-?id|ust\.?-?idnr|vat/i.test(text)) {
    results.push(finding('IMP-03', 'hint', 'Imprint page names no VAT ID (required only if one exists)', [url(page)]));
  }
  return results;
}

/** Third-party services seen in requests but not named in the privacy policy. */
function servicesMissingInPolicy(scan) {
  // The privacy policy may share a page with the imprint (e.g. "Impressum & Datenschutz").
  const policy = pageOfType(scan, 'privacy') ?? okPages(scan).find((p) => PATTERNS.privacy.test(`${p.finalUrl} ${p.facts.title}`));
  if (!policy) return [];
  // Before consent and after "accept" (decision 47b): everything that loads must be named.
  const services = new Map();
  const collect = (requests, when) => {
    for (const request of requests) {
      const service = request.thirdParty ? matchService(request.url) : null;
      if (service && service.category !== 'consent' && !services.has(service.name)) services.set(service.name, { service, when });
    }
  };
  collect(scan.requests, 'before consent');
  collect(scan.consentRuns?.accept?.requests ?? [], 'after accept');
  const missing = [...services.values()].filter(({ service }) => !policyMentions(service, policy.facts.bodyText));
  if (missing.length === 0) return [];
  return [finding('DSE-02', 'hint', 'Third-party services loaded but not named in the privacy policy',
    [url(policy)], { services: missing.map(({ service }) => service.name), loaded: Object.fromEntries(missing.map(({ service, when }) => [service.name, when])) })];
}

function shopLegalPages(scan) {
  if (!looksLikeShop(scan)) return [];
  const pages = okPages(scan);
  const any = (pattern) => pages.some((p) => hasLink(p, pattern));
  const results = [];
  if (!any(PATTERNS.withdrawal) && !pageOfType(scan, 'withdrawal')) {
    results.push(finding('WID-01', 'gap', 'Shop signals found, but no withdrawal policy (Widerrufsbelehrung) linked', []));
  }
  if (!any(PATTERNS.terms)) results.push(finding('AGB-01', 'hint', 'Shop signals found, but no terms (AGB) linked', []));
  if (!any(PATTERNS.accessibility)) {
    results.push(finding('BF-02', 'hint', 'No accessibility statement linked (BFSG; micro-enterprises providing services are exempt)', []));
  }
  return results;
}

export function checkLegalPages(scan) {
  return [
    linkOnEveryPage(scan, 'IMP-01', PATTERNS.imprint, 'Imprint (Impressum)'),
    linkOnEveryPage(scan, 'DSE-01', PATTERNS.privacy, 'Privacy policy (Datenschutzerklärung)'),
    ...imprintContent(scan),
    ...servicesMissingInPolicy(scan),
    ...shopLegalPages(scan),
  ];
}
