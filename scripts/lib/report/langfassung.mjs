// Long report (PDF via Paged.js): table of contents with page numbers, abbreviations,
// chapters per priority (each finding on a new page), manual checks, upcoming rules,
// lists of figures, tables and sources, and the legal disclaimer.

import { readFileSync } from 'node:fs';
import { renderKiPrompt } from './ki-prompt.mjs';
import { ABMAHN_ICON, collectSources, esc, link, platformLine, toolLine } from './model.mjs';

const ABBREVIATIONS = JSON.parse(readFileSync(new URL('../../../data/abbreviations.json', import.meta.url), 'utf8')).entries;
const longOf = (a, t) => t.abbreviations?.[a.short] ?? (t.lang === 'en' && a.longEn ? a.longEn : a.long);

const css = (t, site) => `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm;
    @top-right { content: "${esc(t.long.running(site)).replace(/"/g, '')}"; font: 9pt "Source Sans 3", sans-serif; color: #555; }
    @bottom-center { content: "${t.long.page[0]}" counter(page) "${t.long.page[1]}" counter(pages); font: 9pt "Source Sans 3", sans-serif; color: #555; } }
  @page :first { @top-right { content: none; } @bottom-center { content: none; } }
  * { box-sizing: border-box; }
  body { font: 11pt/1.5 "Source Sans 3", sans-serif; color: #1a1a1a; text-align: left; }
  p, li, .draft { max-width: 150mm; }
  .chapter { break-before: page; }
  h1 { font-size: 20pt; margin: 0 0 3mm; }
  h2 { font-size: 14pt; margin: 0 0 3mm; }
  h3 { font-size: 12pt; margin: 4mm 0 1.5mm; }
  .cover h1 { font-size: 24pt; margin-top: 40mm; }
  .meta, .lead { color: #444; }
  .intro { margin: 0 0 5mm; }
  .notice { border: 1px solid #b45309; background: #fff7ed; padding: 3mm; font-size: 10pt; margin: 6mm 0; }
  .toc ol { list-style: none; padding: 0; margin: 0; }
  .toc ol ol { padding-left: 6mm; }
  .toc li { margin: 1mm 0; }
  .toc a { color: #1d4ed8; text-decoration: none; display: flex; }
  .toc a .t { text-decoration: underline; text-decoration-thickness: 0.5px; }
  .toc a::after { color: #1a1a1a; }
  .toc a .t { flex: 1; }
  .toc a::after { content: target-counter(attr(href url), page); padding-left: 3mm; }
  table { width: 100%; border-collapse: collapse; font-size: 11pt; margin: 2mm 0; }
  th, td { border: 1px solid #bbb; padding: 1.5mm 2mm; text-align: left; vertical-align: top; }
  th { background: #f0f0f0; }
  tbody th { width: 30mm; }
  caption { caption-side: top; text-align: left; font-size: 9.5pt; color: #444; padding-bottom: 1mm; break-after: avoid; }
  figure { margin: 3mm 0; break-inside: avoid; }
  figure img { max-width: 100%; max-height: 110mm; border: 1px solid #ccc; }
  figcaption { font-size: 9.5pt; color: #444; }
  .tag { font-size: 8pt; padding: 0.4mm 2mm; border-radius: 2mm; vertical-align: middle; font-weight: 600; }
  .tag.gap { background: #fde2e2; color: #8a1c1c; }
  .tag.check { background: #e8eefc; color: #1d3a8a; }
  .warnline { font-size: 10pt; color: #8a4b08; margin: 1mm 0 2mm; }
  .plain { margin-top: 1mm; }
  .warn { vertical-align: -1px; margin-right: 1mm; }
  .draft { border: 1px dashed #666; background: #fafafa; padding: 3mm; white-space: pre-wrap; font-size: 10.5pt; }
  .draft-label { margin: 0 0 2mm; font-weight: 600; color: #b45309; white-space: normal; }
  pre.prompt { font: 9.5pt/1.4 "Source Sans 3", sans-serif; white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid #bbb; background: #f7f7f7; padding: 3mm; margin: 2mm 0; }
  a { color: #1d4ed8; overflow-wrap: anywhere; }
  ol.steps, ul { padding-left: 6mm; }
  ol.sources li { margin-bottom: 1.5mm; overflow-wrap: anywhere; }
`;

/** Numbering state for figures and tables while the body is built. */
function createCounters(t) {
  const figures = [];
  const tables = [];
  return {
    figure(src, caption) {
      const no = figures.length + 1;
      figures.push({ no, caption, id: `abb-${no}` });
      return `<figure id="abb-${no}"><img src="${esc(src)}" alt="${esc(caption)}"><figcaption>${t.long.figure} ${no}: ${esc(caption)}</figcaption></figure>`;
    },
    table(caption, rowsHtml, head = '') {
      const no = tables.length + 1;
      tables.push({ no, caption, id: `tab-${no}` });
      // Caption above the table (decision: table captions belong above, figure captions below).
      return `<table id="tab-${no}"><caption>${t.long.table} ${no}: ${esc(caption)}</caption>${head}<tbody>${rowsHtml}</tbody></table>`;
    },
    figures, tables,
  };
}

function findingChapter(t, f, counters, sourceNo) {
  const tag = f.kind === 'gap' ? `<span class="tag gap">${t.gap}</span>` : `<span class="tag check">${t.check}</span>`;
  const warn = f.abmahnung ? `<p class="warnline">${ABMAHN_ICON}${esc(t.abmahnNote)}</p>` : '';
  // Plain-language summary after the location, and every other row with a short
  // explanation for laypeople (decision 28a): headings and legal terms alone are not enough.
  const plain = f.plain ?? {};
  const rows = [
    [t.long.rows[0], t.prio[f.prio].title, t.prio[f.prio].lead],
    [t.long.rows[1], f.where, plain.where],
    [t.long.rows[2], f.summary ?? f.what],
    [t.long.rows[3], f.law, plain.law],
    [t.long.rows[4], f.evidence, plain.evidence],
  ].map(([k, v, p]) => `<tr><th>${k}</th><td>${esc(v)}${p ? `<div class="plain">${esc(p)}</div>` : ''}</td></tr>`).join('');
  const parts = [
    `<section class="chapter" id="bef-${f.no}"><h2>${f.no}. ${esc(f.title)} ${tag}</h2>${warn}`,
    counters.table(t.long.profile(f.no), rows),
    ...f.figures.map((fig) => counters.figure(fig.src, fig.caption)),
    `<h3>${t.long.steps}</h3><ol class="steps">${f.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`,
  ];
  if (f.draft) {
    parts.push(`<h3>${t.long.draft}</h3><div class="draft"><p class="draft-label">${t.long.draftLabel}</p>${esc(f.draft)}</div>`);
  }
  if (f.mockupImage) {
    parts.push(`<h3>${t.long.mockup}</h3>${counters.figure(f.mockupImage, t.long.mockupCaption(f.mockup.description))}`);
  }
  if (f.sources.length > 0) {
    parts.push(`<h3>${t.long.officialSources}</h3><ul>${f.sources.map((s) => `<li>[${sourceNo(s)}] ${link(s.url, s.title)} – ${esc(s.use)} (${esc(t.retrieved(s.retrieved ?? ''))})</li>`).join('')}</ul>`);
  }
  parts.push('</section>');
  return parts.join('\n');
}

function prioChapters(model, counters, sourceNo) {
  const { t } = model;
  return model.byPrio.filter((g) => g.findings.length > 0).map(({ prio, findings }) => [
    `<section class="chapter" id="prio-${prio}"><h1>${t.prio[prio].title}</h1><p class="lead">${t.prio[prio].lead}</p>`,
    `<ul>${findings.map((f) => `<li>${f.no}. ${f.abmahnung ? ABMAHN_ICON : ''}${esc(f.title)}</li>`).join('')}</ul></section>`,
    ...findings.map((f) => findingChapter(t, f, counters, sourceNo)),
  ].join('\n')).join('\n');
}

/** Chapter only when the user answered Y to the AI question; file note only with the text file. */
function promptChapter(model, show, promptFile) {
  if (!show) return '';
  const { t } = model;
  const file = promptFile && /^[\w.-]+\.txt$/.test(promptFile) ? `<a href="${esc(promptFile)}">${esc(promptFile)}</a>` : esc(promptFile ?? '');
  return `<section class="chapter" id="ki-prompt"><h1>${t.long.prompt}</h1>
<p class="lead">${t.long.promptLead}</p>
${promptFile ? `<p>${t.long.promptFile(file)}</p>` : ''}
<pre class="prompt">${esc(renderKiPrompt(model))}</pre></section>`;
}

function manualChapter(model, counters) {
  const { t } = model;
  const checks = model.manualChecks.map((m) => `<li>${esc(m.question)} (${esc(m.law)})</li>`).join('');
  const rows = model.assumptions.map((a) => `<tr><td>${esc(a.question)}</td><td>${esc(a.assumption)}</td><td>${esc(a.evidence)}</td><td>${esc(a.consequence)}</td></tr>`).join('');
  const head = `<thead><tr>${t.long.assumptionsHead.map((h) => `<th>${h}</th>`).join('')}</tr></thead>`;
  return `<section class="chapter" id="manuell"><h1>${t.long.manual}</h1>
<p class="lead">${t.long.manualLead}</p><ul>${checks}</ul>
${rows ? `<h3>${t.long.assumptions}</h3><p>${t.long.assumptionsLead}</p>${counters.table(t.long.assumptions, rows, head)}` : ''}
</section>`;
}

/** Scope of the check, checks without finding, discarded hits and the monthly update check. */
function scopeChapter(model) {
  const { t } = model;
  const list = (items) => (items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : `<p>${t.none}</p>`);
  const u = model.sourceUpdate;
  const update = u ? `<h3>${t.long.update}</h3>
<p>${esc(t.long.updateLead(u.statusBefore, u.checked))}</p>
<p><strong>${t.long.changes}</strong></p>${list((u.changes ?? []).map((c) => `${c.what} – ${c.effect}`))}
<p><strong>${t.long.unverified}</strong></p>${list(u.unverified ?? [])}
<p><strong>${t.long.todo}</strong></p>${list(u.todo ?? [])}` : '';
  return `<section class="chapter" id="umfang"><h1>${t.long.scope}</h1>
<h3>${t.long.scopeScope}</h3>${list([t.long.pagesScanned(model.pagesScanned), platformLine(model), ...model.scanNotes])}
<h3>${t.long.okChecks}</h3>${list(model.okChecks)}
<h3>${t.long.dropped}</h3>${list(model.dropped)}
${update}</section>`;
}

function upcomingChapter(model, sourceNo) {
  const { t } = model;
  const items = model.upcoming.map((u) => `<h3>${esc(u.title)}</h3><p><strong>${t.long.status}:</strong> ${esc(u.status)}</p><p>${esc(u.detail ?? u.short)}</p>
<p><strong>${t.long.relevance}:</strong> ${esc(u.relevance ?? '')}</p>
${(u.sources ?? []).length ? `<ul>${u.sources.map((s) => `<li>[${sourceNo(s)}] ${link(s.url, s.title)} – ${esc(s.use)} (${esc(t.retrieved(s.retrieved ?? ''))})</li>`).join('')}</ul>` : ''}`).join('\n');
  return `<section class="chapter" id="kommend"><h1>${t.long.upcoming}</h1>
<p class="lead">${t.long.upcomingLead}</p>${items || `<p>${t.long.upcomingNone}</p>`}</section>`;
}

function listChapter(t, id, title, items, prefix) {
  const body = items.length
    ? `<ol class="toc-like">${items.map((i) => `<li><a href="#${i.id}"><span class="t">${prefix} ${i.no}: ${esc(i.caption)}</span></a></li>`).join('')}</ol>`
    : `<p>${t.noEntries}</p>`;
  return `<section class="chapter toc" id="${id}"><h1>${title}</h1>${body}</section>`;
}

function abbreviationChapter(t, text, counters) {
  const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const used = ABBREVIATIONS.filter((a) => new RegExp(`(^|[^\\p{L}])${escapeRe(a.short)}(?![\\p{L}])`, 'u').test(text));
  const rows = [`<tr><td>${ABMAHN_ICON}</td><td>${esc(t.abmahnNote)}</td></tr>`,
    `<tr><td>Prio 1–3</td><td>${t.long.prioLegend}</td></tr>`,
    ...used.map((a) => `<tr><td>${esc(a.short)}</td><td>${esc(longOf(a, t))}</td></tr>`)].join('');
  const head = `<thead><tr><th>${t.long.abbrevHead[0]}</th><th>${t.long.abbrevHead[1]}</th></tr></thead>`;
  return `<section class="chapter" id="kurzzeichen"><h1>${t.long.abbreviations}</h1>${counters.table(t.long.abbrevCaption, rows, head)}</section>`;
}

function tocEntries(model, withPrompt) {
  const { t } = model;
  const prios = model.byPrio.filter((g) => g.findings.length > 0).map((g) => `<li><a href="#prio-${g.prio}"><span class="t">${t.prio[g.prio].title}</span></a>
<ol>${g.findings.map((f) => `<li><a href="#bef-${f.no}"><span class="t">${f.no}. ${esc(f.title)}</span></a></li>`).join('')}</ol></li>`).join('');
  const simple = (id, t) => `<li><a href="#${id}"><span class="t">${t}</span></a></li>`;
  return `<ol>${simple('kurzzeichen', t.long.abbreviations)}${prios}${withPrompt ? simple('ki-prompt', t.long.prompt) : ''}${simple('manuell', t.long.manual)}${simple('umfang', t.long.scope)}${simple('kommend', t.long.upcoming)}
${simple('abbildungen', t.long.figures)}${simple('tabellen', t.long.tables)}${simple('quellen', t.long.sources)}${simple('rechtshinweis', t.long.disclaimer)}</ol>`;
}

/** Fixed intro; the sentences on mock-ups and the prompt appear only when the report has them. */
function introText(model, showPrompt) {
  const { long } = model.t;
  const hasMockups = model.findings.some((f) => f.mockupImage);
  return [long.intro, hasMockups ? long.introMockups : '', showPrompt ? long.introPrompt : '', long.introRest].filter(Boolean).join(' ');
}

/**
 * @param {ReturnType<import('./model.mjs').buildModel>} model
 * @param {{promptChapter?: boolean, promptFile?: string}} [options] chapter with the AI prompt; file name of the separate prompt file
 */
export function renderLangfassung(model, { promptChapter: withPrompt = false, promptFile } = {}) {
  const showPrompt = withPrompt || Boolean(promptFile);
  const sources = collectSources(model);
  const sourceNo = (s) => sources.find((x) => x.url === s.url)?.no ?? '?';
  const { t } = model;
  const counters = createCounters(t);
  // Abbreviations are chosen from all report text up front, so their table is table 1.
  const { t: _t, ...content } = model;
  const abbrev = abbreviationChapter(t, JSON.stringify(content), counters);
  const body = [prioChapters(model, counters, sourceNo), promptChapter(model, showPrompt, promptFile), manualChapter(model, counters), scopeChapter(model), upcomingChapter(model, sourceNo)].join('\n');
  const sourceList = `<section class="chapter" id="quellen"><h1>${t.long.sources}</h1><ol class="sources">${sources.map((s) => `<li id="q-${s.no}">${link(s.url, s.title)}<br>${esc(s.url)} – ${esc(t.retrieved(s.retrieved ?? ''))}</li>`).join('')}</ol></section>`;
  const disclaimer = `<section class="chapter" id="rechtshinweis"><h1>${t.long.disclaimer}</h1>${t.disclaimer.map((p) => `<p>${esc(p)}</p>`).join('')}</section>`;
  return `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><title>${t.files.long} ${esc(model.site)}</title><style>${css(t, model.site)}</style></head><body>
<section class="cover"><h1>${esc(t.long.title(model.site))}</h1>
<p class="meta">${esc(t.meta(model.date, model.time, model.pagesScanned, model.checklistStatus))}</p>
<p class="meta">${esc(platformLine(model))}</p>
<p class="meta">${toolLine(t)}</p>
<div class="notice">${t.long.notice}</div>${t.translated ? `<div class="notice">${esc(t.translatedNote)}</div>` : ''}
<p class="intro">${esc(introText(model, showPrompt)).replace('⚠', ABMAHN_ICON)}</p>
<section class="toc" id="inhalt"><h2>${t.long.toc}</h2>${tocEntries(model, showPrompt)}</section></section>
${abbrev}
${body}
${listChapter(t, 'abbildungen', t.long.figures, counters.figures, t.long.figure)}
${listChapter(t, 'tabellen', t.long.tables, counters.tables, t.long.table)}
${sourceList}
${disclaimer}
</body></html>`;
}
