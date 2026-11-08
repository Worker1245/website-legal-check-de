// Transport security, accessibility (axe-core), AI chat disclosure, user content (DSA)
// and newsletter forms.

import { finding, okPages, shotsOf } from './helpers.mjs';

const url = (p) => p.finalUrl ?? p.url;
const SERIOUS = new Set(['critical', 'serious']);
const CHAT_TEXT = /chatbot|ki-assistent|ai assistant|virtuelle[rn]? assistent|chat with us|chatten sie/i;
export const COMMENT_TEXT = /kommentar|comment|bewertung schreiben|beitrag verfassen/i;

function https(scan) {
  const results = [];
  const startPage = scan.pages[0];
  if (startPage?.finalUrl?.startsWith('http:') || scan.transport.httpRedirectsToHttps === false) {
    results.push(finding('SEC-01', 'gap', 'Site is reachable without HTTPS or http:// does not redirect to https://', [scan.startUrl], { transport: scan.transport }));
  }
  const httpsPages = new Set(okPages(scan).filter((p) => url(p).startsWith('https:')).map((p) => p.index));
  const mixed = scan.requests.filter((r) => httpsPages.has(r.page) && r.url.startsWith('http:'));
  if (mixed.length > 0) {
    results.push(finding('SEC-02', 'gap', 'Mixed content: resources loaded over unencrypted http', [], { requests: mixed.slice(0, 5).map((r) => r.url) }));
  }
  const plainForms = okPages(scan).flatMap((p) => p.facts.forms.filter((f) => f.action.startsWith('http:')).map(() => url(p)));
  if (plainForms.length > 0) {
    results.push(finding('SEC-03', 'gap', 'Form sends data over unencrypted http', [...new Set(plainForms)]));
  }
  return results;
}

function accessibility(scan) {
  const byRule = new Map();
  for (const page of okPages(scan)) {
    for (const v of page.accessibility?.violations ?? []) {
      const entry = byRule.get(v.id) ?? { ...v, pages: [], total: 0 };
      entry.pages.push(url(page));
      entry.total += v.count;
      byRule.set(v.id, entry);
    }
  }
  return [...byRule.values()].map((v) => finding('BF-01', SERIOUS.has(v.impact) ? 'gap' : 'hint',
    `Accessibility: ${v.help} (${v.impact}, ${v.total} elements)`, v.pages,
    { rule: v.id, wcag: v.tags, helpUrl: v.helpUrl, targets: v.targets }));
}

function aiChat(scan) {
  const chatServices = [...new Set(scan.requests.filter((r) => r.category === 'chat').map((r) => r.service))];
  const chatPages = okPages(scan).filter((p) => CHAT_TEXT.test(p.facts.bodyText));
  if (chatServices.length === 0 && chatPages.length === 0) return [];
  return [finding('AI-01', 'hint', 'Chat widget or chatbot found; if AI answers, users must be told they talk to an AI',
    chatPages.map(url), { services: chatServices })];
}

function userContent(scan) {
  const pages = okPages(scan).filter((p) => p.facts.forms.some((f) => f.hasFile || (f.hasTextarea && COMMENT_TEXT.test(f.text))));
  if (pages.length === 0) return [];
  return [finding('DSA-01', 'hint', 'Users can publish content (comments/uploads); a notice-and-action mechanism is required', pages.map(url), { screenshots: pages.slice(0, 1).flatMap(shotsOf) })];
}

function newsletter(scan) {
  const pages = okPages(scan).filter((p) => p.facts.forms.some((f) => f.hasEmail && /newsletter/i.test(f.text)));
  if (pages.length === 0) return [];
  return [finding('UWG-01', 'hint', 'Newsletter sign-up found; consent must be documented (double opt-in) – not checkable from outside', pages.map(url))];
}

export function checkSite(scan) {
  return [...https(scan), ...accessibility(scan), ...aiChat(scan), ...userContent(scan), ...newsletter(scan)];
}
