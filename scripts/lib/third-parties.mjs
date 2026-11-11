// Match request URLs against the list of well-known third-party services.

import { readFileSync } from 'node:fs';

const DATA_URL = new URL('../../data/third-parties.json', import.meta.url);

/**
 * provider: legal entity and country from the vendor's own imprint or privacy page (decision 58a);
 * null where it was not verified.
 * @type {{name: string, category: string, hosts: string[], paths?: string[], keywords: string[],
 *   provider?: {entity: string, country: string, source: string} | null}[]}
 */
export const SERVICES = JSON.parse(readFileSync(DATA_URL, 'utf8')).services;
const BY_NAME = new Map(SERVICES.map((s) => [s.name, s]));

/** @param {string} name */
export const serviceByName = (name) => BY_NAME.get(name) ?? null;

/**
 * @param {string} requestUrl
 * @returns {typeof SERVICES[number] | null}
 */
export function matchService(requestUrl) {
  let url;
  try {
    url = new URL(requestUrl);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  for (const service of SERVICES) {
    const hostMatch = service.hosts.some((h) => host === h || host.endsWith(`.${h}`));
    if (!hostMatch) continue;
    const paths = service.paths ?? [];
    if (paths.length === 0 || paths.some((p) => url.pathname.startsWith(p))) return service;
  }
  return null;
}

/**
 * True when the privacy policy text mentions the service.
 * @param {typeof SERVICES[number]} service
 * @param {string} policyText
 */
export function policyMentions(service, policyText) {
  const text = policyText.toLowerCase();
  return service.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}
