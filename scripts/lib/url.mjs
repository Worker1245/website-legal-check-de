// URL helpers: validate the start URL and decide whether a URL belongs to the checked site.

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// Second-level public suffixes that need three labels for the registrable domain.
const TWO_LABEL_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gv.at', 'co.at', 'or.at', 'com.au', 'co.nz', 'com.br', 'co.jp',
]);

/**
 * Turn user input such as "www.xyz.de" into a validated URL object.
 * @param {string} input
 * @returns {URL}
 * @throws {Error} when the input is not an http(s) URL without credentials
 */
export function normalizeStartUrl(input) {
  const trimmed = String(input ?? '').trim();
  if (!trimmed) throw new Error('No URL given.');
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url;
  try {
    url = new URL(withScheme);
  } catch {
    throw new Error(`Not a valid URL: ${trimmed}`);
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) throw new Error(`Only http and https are allowed: ${trimmed}`);
  if (url.username || url.password) throw new Error('URLs with credentials are not allowed.');
  url.hash = '';
  return url;
}

/**
 * Registrable domain approximation ("shop.example.co.uk" -> "example.co.uk").
 * @param {string} hostname
 * @returns {string}
 */
export function baseDomain(hostname) {
  const labels = hostname.toLowerCase().replace(/\.$/, '').split('.');
  if (labels.length <= 2 || /^\d+$/.test(labels.at(-1))) return labels.join('.');
  const lastTwo = labels.slice(-2).join('.');
  return TWO_LABEL_SUFFIXES.has(lastTwo) ? labels.slice(-3).join('.') : lastTwo;
}

/**
 * True when the URL belongs to a different registrable domain than the site.
 * @param {string} requestUrl
 * @param {string} siteHostname
 */
export function isThirdParty(requestUrl, siteHostname) {
  let host;
  try {
    host = new URL(requestUrl).hostname;
  } catch {
    return false;
  }
  if (!host) return false;
  return baseDomain(host) !== baseDomain(siteHostname);
}

/**
 * Same site for crawling: same hostname, ignoring a leading "www.".
 * @param {string} candidate
 * @param {URL} start
 */
export function isSameSite(candidate, start) {
  try {
    const url = new URL(candidate, start);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return false;
    const strip = (h) => h.toLowerCase().replace(/^www\./, '');
    return strip(url.hostname) === strip(start.hostname);
  } catch {
    return false;
  }
}

/**
 * Canonical form used to de-duplicate crawl targets (no hash, no trailing slash).
 * @param {string} href
 * @param {URL} base
 * @returns {string|null}
 */
export function canonicalPageUrl(href, base) {
  try {
    const url = new URL(href, base);
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
    url.hash = '';
    const text = url.toString();
    return text.endsWith('/') && url.pathname !== '/' ? text.slice(0, -1) : text;
  } catch {
    return null;
  }
}

/** File types that are not HTML pages and are never crawled. */
export const NON_PAGE_EXTENSIONS = /\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4|mp3|docx?|xlsx?|pptx?|ics|vcf|xml|json|css|js)$/i;
