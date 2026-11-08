// Shared helpers for the check modules. A check returns candidate findings; Claude
// verifies each against the evidence before it goes into the report.

/**
 * @typedef {object} Finding
 * @property {string} check   checklist id, e.g. "IMP-01" (see references/checklist.md)
 * @property {'gap'|'hint'|'ok'} status  gap = likely violation, hint = needs manual review
 * @property {string} title   short English description
 * @property {string[]} pages page URLs concerned
 * @property {object} evidence machine-readable evidence (requests, screenshots, texts)
 */

/** @returns {Finding} */
export function finding(check, status, title, pages = [], evidence = {}) {
  return { check, status, title, pages, evidence };
}

/** Pages that loaded without error. */
export const okPages = (scan) => scan.pages.filter((p) => !p.error && !p.skipped && p.facts);

/** True when any link on the page matches the pattern by text or URL. */
export function hasLink(page, pattern) {
  return page.facts.links.some((l) => pattern.test(l.text) || pattern.test(safePath(l.href)));
}

/** Find the first scanned page of a type. */
export const pageOfType = (scan, type) => okPages(scan).find((p) => p.pageType === type) ?? null;

export function safePath(href) {
  try {
    const url = new URL(href);
    return decodeURIComponent(url.pathname + url.search);
  } catch {
    return String(href);
  }
}

/** Screenshot paths for a page, for the evidence column. */
export const shotsOf = (page) => Object.values(page.screenshots ?? {});

/** Signals that the site sells to consumers online (prices, cart, checkout). */
export function looksLikeShop(scan) {
  const pages = okPages(scan);
  const commercePage = pages.some((p) => ['cart', 'checkout', 'product', 'shop'].includes(p.pageType));
  const cartButton = pages.some((p) => p.facts.buttons.some((b) => /in den warenkorb|add to cart|jetzt kaufen|buy now/i.test(b.text)));
  const pricesOnPages = pages.filter((p) => p.facts.prices.length > 0).length;
  return commercePage || cartButton || pricesOnPages >= 2;
}

export const PATTERNS = {
  imprint: /impressum|imprint|anbieterkennzeichnung|legal notice/i,
  privacy: /datenschutz|privacy/i,
  withdrawal: /widerruf/i,
  terms: /\bagb\b|geschäftsbedingungen|geschaeftsbedingungen|terms/i,
  accessibility: /barrierefreiheit|accessibility/i,
  vatNote: /(inkl\.?|inklusive|incl\.?|enth(ält|\.)?)\s*(\d+\s*%\s*)?(der\s+)?(gesetzl(\.|ichen)?\s*)?(mwst|ust|mehrwertsteuer|umsatzsteuer)|§\s*19\s*UStG/i,
  netNote: /(zzgl\.?|zuzüglich|exkl\.?|netto)\s*(\d+\s*%\s*)?(gesetzl(\.|ichen)?\s*)?(mwst|ust|mehrwertsteuer|umsatzsteuer)/i,
  shippingNote: /versand|lieferkosten|shipping/i,
  reject: /ablehnen|nur (technisch )?notwendige|nur erforderliche|nicht zustimmen|alle ablehnen|reject|deny|decline|verweigern/i,
  accept: /akzeptieren|zustimmen|einverstanden|alle erlauben|alle zulassen|accept|allow all|\bok\b|verstanden/i,
};
