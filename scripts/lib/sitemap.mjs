// Read the site's sitemap(s) to see which page types exist beyond the crawled sample.

import { isSameSite } from './url.mjs';

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BYTES = 5_000_000;
const MAX_URLS = 5_000;
const MAX_CHILD_SITEMAPS = 10;
const USER_AGENT = 'website-legal-check-de (technical website check)';

/**
 * Fetch a text resource with timeout and size limit.
 * @param {string} url
 * @returns {Promise<string|null>} body or null when unavailable
 */
export async function fetchText(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT },
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const length = Number(response.headers.get('content-length') ?? 0);
    if (length > MAX_BYTES) return null;
    const text = await response.text();
    return text.length > MAX_BYTES ? text.slice(0, MAX_BYTES) : text;
  } catch {
    return null;
  }
}

/**
 * Extract <loc> entries from sitemap XML.
 * @param {string} xml
 * @returns {{isIndex: boolean, locs: string[]}}
 */
export function parseSitemap(xml) {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const locs = [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)\s*(?:\]\]>)?\s*<\/loc>/gi)]
    .map((match) => match[1].replace(/&amp;/g, '&'));
  return { isIndex, locs };
}

/**
 * Sitemap URLs named in robots.txt.
 * @param {string} robots
 * @returns {string[]}
 */
export function sitemapsFromRobots(robots) {
  return [...robots.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((match) => match[1]);
}

/**
 * Collect page URLs from robots.txt sitemaps or /sitemap.xml (one index level deep).
 * @param {URL} start
 * @returns {Promise<{source: string[], urls: string[]}>}
 */
export async function discoverSitemapUrls(start) {
  const robots = await fetchText(new URL('/robots.txt', start).toString());
  const roots = robots ? sitemapsFromRobots(robots).map((u) => resolveUrl(u, start)).filter(Boolean) : [];
  if (roots.length === 0) roots.push(new URL('/sitemap.xml', start).toString());

  const urls = new Set();
  const source = [];
  for (const root of roots.slice(0, MAX_CHILD_SITEMAPS)) {
    await collectFromSitemap(root, start, urls, source, 0);
    if (urls.size >= MAX_URLS) break;
  }
  return { source, urls: [...urls].slice(0, MAX_URLS) };
}

function resolveUrl(candidate, base) {
  try {
    return new URL(candidate, base).toString();
  } catch {
    return null;
  }
}

async function collectFromSitemap(sitemapUrl, start, urls, source, depth) {
  if (!isSameSite(sitemapUrl, start) && depth > 0) return;
  const xml = await fetchText(sitemapUrl);
  if (!xml) return;
  source.push(sitemapUrl);
  const { isIndex, locs } = parseSitemap(xml);
  if (isIndex && depth === 0) {
    for (const child of locs.slice(0, MAX_CHILD_SITEMAPS)) {
      await collectFromSitemap(child, start, urls, source, depth + 1);
      if (urls.size >= MAX_URLS) return;
    }
    return;
  }
  for (const loc of locs) {
    if (urls.size >= MAX_URLS) return;
    if (isSameSite(loc, start)) urls.add(loc);
  }
}
