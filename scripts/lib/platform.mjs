// Detect the system a site is built with (decision 22a), so fix instructions can use the
// platform's own click paths (references/platforms.md). Signals are observed conventions
// (generator meta, asset hosts and paths, HTML classes) and can be wrong: the report names
// the evidence and treats the result as a hint.

/** Main platforms in priority order; the first with a signal wins. */
const PLATFORMS = [
  { name: 'WordPress', generator: /^wordpress/i, request: /\/wp-(content|includes)\// },
  { name: 'Shopify', generator: /shopify/i, request: /\/\/(cdn\.shopify\.com|[^/]+\.myshopify\.com)\// },
  { name: 'Wix', generator: /wix\.com/i, request: /\/\/(static\.wixstatic\.com|static\.parastorage\.com)\// },
  { name: 'Jimdo', generator: /jimdo/i, request: /\/\/[^/]*(jimstatic\.com|jimdo\.com|jimdosite\.com)\// },
  { name: 'Squarespace', generator: /squarespace/i, request: /\/\/[^/]*squarespace(-cdn)?\.com\// },
  { name: 'Webflow', generator: /^webflow/i, request: /\/\/[^/]*(website-files\.com|webflow\.com)\//, dataAttr: 'data-wf-site' },
  { name: 'TYPO3', generator: /typo3/i, request: /\/typo3(conf|temp)\// },
  { name: 'Shopware', generator: /shopware/i, request: /\/bundles\/storefront\// },
];

/** Add-ons worth naming because instructions differ (shop plugin, page builders). */
const EXTRAS = [
  { name: 'WooCommerce', classes: /\bwoocommerce\b/i, request: /\/plugins\/woocommerce\// },
  { name: 'Divi', classes: /\bet_(divi_theme|pb_\w+)\b/i, request: /\/themes\/Divi\// },
  { name: 'Elementor', classes: /\belementor\b/i, request: /\/plugins\/elementor\// },
];

function signals(scan) {
  const facts = scan.pages.map((p) => p.facts).filter(Boolean);
  return {
    generators: [...new Set(facts.map((f) => f.generator).filter(Boolean))],
    classes: facts.map((f) => f.htmlClasses ?? '').join(' '),
    dataAttrs: new Set(facts.flatMap((f) => f.htmlDataAttributes ?? [])),
    requests: scan.requests.map((r) => r.url),
  };
}

function evidenceFor(platform, s) {
  const evidence = [];
  const generator = s.generators.find((g) => platform.generator?.test(g));
  if (generator) evidence.push(`meta generator „${generator}“`);
  const request = s.requests.find((u) => platform.request?.test(u));
  if (request) evidence.push(`request ${request.slice(0, 120)}`);
  if (platform.dataAttr && s.dataAttrs.has(platform.dataAttr)) evidence.push(`HTML attribute ${platform.dataAttr}`);
  return evidence;
}

/**
 * @param {{pages: {facts?: object}[], requests: {url: string}[]}} scan
 * @returns {{name: string|null, confidence: 'high'|'medium'|'none', evidence: string[], extras: string[]}}
 */
export function detectPlatform(scan) {
  const s = signals(scan);
  for (const platform of PLATFORMS) {
    const evidence = evidenceFor(platform, s);
    if (evidence.length === 0) continue;
    const extras = platform.name === 'WordPress'
      ? EXTRAS.filter((e) => e.classes.test(s.classes) || s.requests.some((u) => e.request.test(u))).map((e) => e.name)
      : [];
    return { name: platform.name, confidence: evidence.length > 1 ? 'high' : 'medium', evidence, extras };
  }
  return { name: null, confidence: 'none', evidence: [], extras: [] };
}
