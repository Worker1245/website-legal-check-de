// § 25 TDDDG: nothing non-essential may be stored, read or loaded from third parties
// before consent; the consent dialog must offer reject as easily as accept.

import { finding, okPages, PATTERNS } from './helpers.mjs';

const TRACKING_CATEGORIES = new Set(['analytics', 'ads', 'tagmanager', 'social', 'video', 'maps', 'chat', 'captcha']);
const TRACKER_COOKIE = /^(_ga|_gid|_gat|_gcl_|_fbp|_fbc|_hj|_clck|_clsk|_uetsid|_uetvid|_pk_|_tt_|_pin_|IDE$|NID$|fr$|li_|bcookie|_ttp)/i;
const MAX_EXAMPLES = 3;

function groupByService(requests) {
  const groups = new Map();
  for (const r of requests) {
    const group = groups.get(r.service) ?? { service: r.service, category: r.category, pages: new Set(), examples: [] };
    group.pages.add(r.page);
    if (group.examples.length < MAX_EXAMPLES) group.examples.push(r.url);
    groups.set(r.service, group);
  }
  return [...groups.values()].map((g) => ({ ...g, pages: [...g.pages] }));
}

const pageUrls = (scan, indexes) => indexes.map((i) => scan.pages.find((p) => p.index === i)?.finalUrl).filter(Boolean);

function trackersBeforeConsent(scan) {
  const known = scan.requests.filter((r) => r.thirdParty && r.service);
  const tracking = groupByService(known.filter((r) => TRACKING_CATEGORIES.has(r.category)));
  const fonts = groupByService(known.filter((r) => r.category === 'fonts'));
  const cdn = groupByService(known.filter((r) => r.category === 'cdn'));
  const unknownHosts = [...new Set(scan.requests.filter((r) => r.thirdParty && !r.service).map((r) => new URL(r.url).hostname))];
  const results = [];
  for (const g of tracking) {
    results.push(finding('TDD-01', 'gap', `${g.service} loaded before consent`, pageUrls(scan, g.pages), { requests: g.examples }));
  }
  for (const g of fonts) {
    results.push(finding('TDD-02', 'gap', `${g.service} loaded from a third-party server before consent`, pageUrls(scan, g.pages), { requests: g.examples }));
  }
  for (const g of cdn) {
    results.push(finding('TDD-02', 'hint', `Files loaded from ${g.service} (IP address goes to a third party)`, pageUrls(scan, g.pages), { requests: g.examples }));
  }
  if (unknownHosts.length > 0) {
    results.push(finding('TDD-05', 'hint', 'Other third-party hosts contacted before consent (purpose unknown)', [], { hosts: unknownHosts.slice(0, 30) }));
  }
  return results;
}

function storageBeforeConsent(scan) {
  const results = [];
  const trackerCookies = scan.cookies.filter((c) => c.thirdParty || TRACKER_COOKIE.test(c.name));
  const otherCookies = scan.cookies.filter((c) => !trackerCookies.includes(c));
  if (trackerCookies.length > 0) {
    results.push(finding('TDD-03', 'gap', 'Tracking or third-party cookies set before consent',
      pageUrls(scan, [...new Set(trackerCookies.map((c) => c.firstSeenOnPage))]),
      { cookies: trackerCookies.map(({ name, domain, expires }) => ({ name, domain, expires })) }));
  }
  if (otherCookies.length > 0) {
    results.push(finding('TDD-03', 'hint', 'First-party cookies set before consent (allowed only if strictly necessary)', [],
      { cookies: otherCookies.map(({ name, domain, expires }) => ({ name, domain, expires })) }));
  }
  const keys = [...new Set(okPages(scan).flatMap((p) => p.storage?.localStorage ?? []))];
  if (keys.length > 0) {
    results.push(finding('TDD-03', 'hint', 'localStorage entries written before consent (allowed only if strictly necessary)', [], { localStorageKeys: keys.slice(0, 40) }));
  }
  return results;
}

function consentDialog(scan, needsConsent) {
  const withBanner = okPages(scan).find((p) => p.facts.banner);
  if (!withBanner) {
    return needsConsent ? [finding('TDD-04', 'gap', 'No consent dialog found although trackers or cookies were detected', [scan.pages[0].finalUrl])] : [];
  }
  const { buttons, text } = withBanner.facts.banner;
  const evidence = { bannerButtons: buttons, bannerText: text.slice(0, 300), screenshots: [withBanner.screenshots?.cookieabfrage].filter(Boolean) };
  const hasReject = buttons.some((b) => PATTERNS.reject.test(b));
  const hasAccept = buttons.some((b) => PATTERNS.accept.test(b));
  if (hasAccept && !hasReject) {
    return [finding('TDD-04', 'gap', 'Consent dialog: no reject option on the first layer', [withBanner.finalUrl], evidence)];
  }
  return [finding('TDD-04', 'ok', 'Consent dialog offers accept and reject on the first layer', [withBanner.finalUrl], evidence)];
}

export function checkConsent(scan) {
  const trackerFindings = trackersBeforeConsent(scan);
  const storageFindings = storageBeforeConsent(scan);
  const needsConsent = [...trackerFindings, ...storageFindings].some((f) => f.status === 'gap');
  return [...trackerFindings, ...storageFindings, ...consentDialog(scan, needsConsent)];
}
