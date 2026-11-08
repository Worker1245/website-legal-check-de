// Report data (written by Claude as report.json) -> validated, sorted model shared by
// the short and the long PDF, so both list the findings in the same order.

import { readFileSync } from 'node:fs';
import { texts } from './i18n.mjs';

const PACKAGE = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));

/** Name, version and repository of this skill, shown at the top of both PDFs. */
export const TOOL = { name: PACKAGE.name, version: PACKAGE.version, url: PACKAGE.homepage };

const PRIORITIES = [1, 2, 3];
const KINDS = new Set(['gap', 'check']);
const SAFE_URL = /^https?:\/\//i;

/** Escape text for HTML element content and attribute values. */
export function esc(value) {
  return typography(String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
}

/**
 * German typography per DIN 5008 (as summarised in references/formatting.md): protected
 * space after § and before %, narrow protected space inside abbreviations like „z. B.“.
 */
export function typography(text) {
  return text
    .replace(/(§§?) (?=\S)/g, '$1\u00A0')
    .replace(/(\d) %/g, '$1\u00A0%')
    .replace(/\b([A-Za-zÄÖÜäöü])\. ([A-Za-zÄÖÜäöü])\./g, '$1.\u202F$2.');
}

/** Link only for http(s) URLs; anything else is shown as plain text. */
export function link(url, text) {
  return SAFE_URL.test(String(url ?? '')) ? `<a href="${esc(url)}">${esc(text ?? url)}</a>` : esc(text ?? url ?? '');
}

function requireFields(object, fields, where) {
  for (const field of fields) {
    if (object[field] === undefined || object[field] === null || object[field] === '') {
      throw new Error(`report.json: missing "${field}" in ${where}`);
    }
  }
}

function checkFinding(f, index) {
  const where = `findings[${index}]`;
  requireFields(f, ['prio', 'kind', 'title', 'what', 'where', 'law', 'fix', 'evidence'], where);
  if (!PRIORITIES.includes(f.prio)) throw new Error(`report.json: ${where}.prio must be 1, 2 or 3`);
  if (!KINDS.has(f.kind)) throw new Error(`report.json: ${where}.kind must be "gap" or "check"`);
  for (const s of f.sources ?? []) requireFields(s, ['title', 'url', 'use'], `${where}.sources`);
}

/**
 * Validate and normalise report data. Findings are sorted by priority, keeping the
 * given order within a priority, and numbered 1..n.
 * @param {object} data parsed report.json
 * @param {object} [customTexts] translated text set for another document language (decision 41a)
 */
export function buildModel(data, customTexts) {
  requireFields(data, ['site', 'date', 'pagesScanned', 'checklistStatus', 'findings'], 'report');
  data.findings.forEach(checkFinding);
  const findings = PRIORITIES.flatMap((prio) => data.findings.filter((f) => f.prio === prio))
    .map((f, i) => ({ ...f, no: i + 1, steps: f.steps ?? [], figures: f.figures ?? [], sources: f.sources ?? [], abmahnung: Boolean(f.abmahnung) }));
  const language = customTexts ? customTexts.lang : (data.language === 'en' ? 'en' : 'de');
  return {
    language, t: customTexts ?? texts(language), platform: data.platform ?? null,
    site: data.site, date: data.date, time: data.time ?? null, pagesScanned: data.pagesScanned, checklistStatus: data.checklistStatus,
    assumptions: data.assumptions ?? [], manualChecks: data.manualChecks ?? [], upcoming: data.upcoming ?? [],
    scanNotes: data.scanNotes ?? [], okChecks: data.okChecks ?? [], dropped: data.dropped ?? [], sourceUpdate: data.sourceUpdate ?? null,
    findings, byPrio: PRIORITIES.map((prio) => ({ prio, findings: findings.filter((f) => f.prio === prio) })),
  };
}

/** All sources cited anywhere in the report, de-duplicated by URL, in order of first use. */
export function collectSources(model) {
  const seen = new Map();
  const add = (s) => { if (!seen.has(s.url)) seen.set(s.url, { ...s, no: seen.size + 1 }); };
  model.findings.forEach((f) => f.sources.forEach(add));
  model.upcoming.forEach((u) => (u.sources ?? []).forEach(add));
  return [...seen.values()];
}

export const ABMAHN_ICON = '<svg class="warn" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 2 1 21h22L12 2z" fill="#b45309"/><path d="M11 9h2v6h-2zM11 17h2v2h-2z" fill="#fff"/></svg>';


/** One line naming the skill with a clickable link to its repository. */
export function toolLine(t) {
  return t.tool(esc(TOOL.name), esc(TOOL.version), link(TOOL.url, TOOL.url.replace(/^https:\/\//, '')));
}

/** Detected system as one line, e.g. "Erkanntes System: WordPress (WooCommerce, Divi)". */
export function platformLine(model) {
  const p = model.platform;
  return p?.name ? model.t.platform(p.name, (p.extras ?? []).join(', ')) : model.t.platformUnknown;
}
