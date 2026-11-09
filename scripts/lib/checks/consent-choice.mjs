// What happens after the visitor clicks "reject" (decision 46a): nothing that needs consent
// may load (§ 25 TDDDG). Google Consent Mode pings sent with a denied state (gcs=G100) are
// reported separately as a hint until an official source settles them (decision 48a).

import { TRACKER_COOKIE, TRACKING_CATEGORIES } from './consent.mjs';
import { finding, okPages } from './helpers.mjs';

const MAX_EXAMPLES = 3;
/** gcs=G1<ad_storage><analytics_storage>, 1 = granted, 0 = denied. */
const GCS = /^G1([01])([01])$/;

/** 'denied', 'granted' or null (no or unknown gcs parameter). */
export function consentModeState(requestUrl) {
  let value;
  try {
    value = new URL(requestUrl).searchParams.get('gcs');
  } catch {
    return null;
  }
  const match = GCS.exec(value ?? '');
  if (!match) return null;
  return match[1] === '0' && match[2] === '0' ? 'denied' : 'granted';
}

function byService(requests) {
  const groups = new Map();
  for (const r of requests) groups.set(r.service, [...(groups.get(r.service) ?? []), r]);
  return [...groups.entries()];
}

function notRun(scan, run) {
  // The runs click on the start page, so only a dialog there counts (cookie tables on the
  // privacy page look like one); a successful accept click proves a dialog the page scan missed (e.g. in an iframe).
  const startPage = okPages(scan)[0];
  const hadBanner = Boolean(startPage?.facts.banner) || Boolean(scan.consentRuns?.accept?.clicked);
  if (!hadBanner) return [];
  return [finding('TDD-06', 'hint', 'Reject could not be clicked automatically; check manually what loads after reject',
    [scan.pages[0]?.finalUrl].filter(Boolean), { reason: run?.reason ?? 'not run' })];
}

/** @param {object} scan result of scanSite() */
export function checkConsentChoice(scan) {
  const run = scan.consentRuns?.reject;
  if (!run?.clicked) return notRun(scan, run);
  const base = { button: run.button, bannerGone: run.bannerGone, pagesAfterClick: run.visited };
  const results = [];
  const tracking = run.requests.filter((r) => r.thirdParty && TRACKING_CATEGORIES.has(r.category));
  for (const [service, requests] of byService(tracking)) {
    const states = requests.map((r) => consentModeState(r.url));
    const examples = requests.slice(0, MAX_EXAMPLES).map((r) => r.url);
    if (states.every((s) => s === 'denied')) {
      results.push(finding('TDD-07', 'hint', `${service} sends Consent Mode pings after reject (gcs=G100)`, run.visited, { ...base, requests: examples }));
    } else {
      const granted = states.some((s) => s === 'granted');
      results.push(finding('TDD-06', 'gap', `${service} loaded after reject${granted ? ' (Consent Mode reports consent granted)' : ''}`,
        run.visited, { ...base, requests: examples }));
    }
  }
  const cookies = run.newCookies.filter((c) => c.thirdParty || TRACKER_COOKIE.test(c.name));
  if (cookies.length > 0) {
    results.push(finding('TDD-06', 'gap', 'Tracking or third-party cookies set after reject', run.visited,
      { ...base, cookies: cookies.map(({ name, domain }) => ({ name, domain })) }));
  }
  if (results.length === 0) results.push(finding('TDD-06', 'ok', 'Nothing that needs consent loaded after reject', run.visited, base));
  return results;
}
