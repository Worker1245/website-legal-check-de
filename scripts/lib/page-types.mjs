// Classify pages by URL path and link text. Used to find legal pages and to decide
// whether the sample misses page types that only a deeper scan would cover.

/** Ordered: the first matching type wins. Patterns cover German and English wording. */
export const PAGE_TYPE_PATTERNS = [
  ['imprint', /impressum|imprint|anbieterkennzeichnung|legal-notice|legal_notice/i],
  ['privacy', /datenschutz|privacy|dsgvo|gdpr/i],
  ['withdrawal', /widerruf|withdrawal|cancellation-policy|right-of-withdrawal/i],
  ['terms', /\bagb\b|agbs|allgemeine-geschaeftsbedingungen|gesch(ae|ä)ftsbedingungen|terms|nutzungsbedingungen/i],
  ['accessibility', /barrierefreiheit|accessibility/i],
  ['checkout', /checkout|kasse|bestellung-abschliessen|bezahlen/i],
  ['cart', /warenkorb|\bcart\b|basket|einkaufswagen/i],
  ['account', /\b(login|anmelden|konto|account|mein-konto|registrieren|register)\b/i],
  ['shop', /\/(shop|store|merch)\/?(\s|$)/i],
  ['product', /\/(produkt|product|products|produkte|artikel|item|p)\/|\b(order|bestellen|jetzt kaufen|buy now|in den warenkorb)\b/i],
  ['contact', /kontakt|contact/i],
  ['blog', /\/(blog|news|aktuelles|magazin|beitrag|posts?)\//i],
];

/** Page types worth one to three extra pages in the deep check (decision 15a). */
export const DEEP_CHECK_TYPES = ['product', 'cart', 'checkout', 'account', 'contact', 'blog'];

/** Legal page types the report needs; they are always added when linked. */
export const LEGAL_TYPES = ['imprint', 'privacy', 'withdrawal', 'terms', 'accessibility'];

/**
 * @param {string} url
 * @param {string} [linkText]
 * @returns {string} page type or "other"
 */
export function classifyPage(url, linkText = '') {
  let path = url;
  try {
    const parsed = new URL(url);
    path = `${parsed.pathname}${parsed.search}`;
  } catch {
    // keep raw string
  }
  const haystack = `${decodeSafe(path)} ${linkText}`;
  for (const [type, pattern] of PAGE_TYPE_PATTERNS) {
    if (pattern.test(haystack)) return type;
  }
  return 'other';
}

function decodeSafe(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/**
 * Pick extra URLs for page types that the sample does not cover yet.
 * @param {(string|{url: string, text?: string})[]} candidateUrls URLs from the sitemap and from links (with link text)
 * @param {Set<string>} coveredTypes types already in the sample
 * @param {Set<string>} visited canonical URLs already scanned
 * @param {number} perType maximum extra pages per missing type
 * @returns {{type: string, url: string}[]}
 */
export function selectDeepCheckUrls(candidateUrls, coveredTypes, visited, perType = 3) {
  const picked = [];
  const counts = new Map();
  for (const candidate of candidateUrls) {
    const { url, text = '' } = typeof candidate === 'string' ? { url: candidate } : candidate;
    if (visited.has(url) || picked.some((p) => p.url === url)) continue;
    const type = classifyPage(url, text);
    if (!DEEP_CHECK_TYPES.includes(type) || coveredTypes.has(type)) continue;
    const count = counts.get(type) ?? 0;
    if (count >= perType) continue;
    counts.set(type, count + 1);
    picked.push({ type, url });
  }
  return picked;
}
