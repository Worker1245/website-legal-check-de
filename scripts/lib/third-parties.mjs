// Match request URLs against the list of well-known third-party services.

import { readFileSync } from 'node:fs';

const DATA_URL = new URL('../../data/third-parties.json', import.meta.url);

/** @type {{name: string, category: string, hosts: string[], paths?: string[], keywords: string[]}[]} */
export const SERVICES = JSON.parse(readFileSync(DATA_URL, 'utf8')).services;

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
