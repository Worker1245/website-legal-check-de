// Short report (forwardable PDF): findings grouped by priority, one row each.

import { ABMAHN_ICON, esc, platformLine, TOOL_ROW_CSS, toolRow } from './model.mjs';

const css = (t) => `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm;
    @bottom-center { content: "${t.long.page[0]}" counter(page) "${t.long.page[1]}" counter(pages); font: 9pt "Source Sans 3", sans-serif; color: #555; } }
  * { box-sizing: border-box; }
  body { font: 11pt/1.5 "Source Sans 3", sans-serif; color: #1a1a1a; margin: 0; text-align: left; }
  p, li { max-width: 150mm; }
  h1 { font-size: 17pt; margin: 0 0 2mm; }
  h2 { font-size: 12.5pt; margin: 6mm 0 1mm; }
  .lead { margin: 0 0 2mm; color: #444; }
  .meta { color: #444; margin: 0 0 3mm; }
  .tool { font-size: 10pt; margin-top: -2mm; }
${TOOL_ROW_CSS}  a { color: #1d4ed8; }
  .notice { border: 1px solid #b45309; background: #fff7ed; padding: 2.5mm 3mm; font-size: 10pt; margin: 3mm 0; }
  .summary { display: flex; gap: 4mm; margin: 3mm 0; }
  .summary div { border: 1px solid #ccc; padding: 2mm 3mm; min-width: 30mm; }
  .summary strong { display: block; font-size: 14pt; }
  table { width: 100%; border-collapse: collapse; font-size: 11pt; }
  th, td { border: 1px solid #bbb; padding: 1.6mm 2mm; text-align: left; vertical-align: top; }
  th { background: #f0f0f0; }
  tr { page-break-inside: avoid; }
  td.no { width: 8mm; }
  .warn { vertical-align: -1px; margin-right: 1mm; }
  .legend, .foot { font-size: 9.5pt; color: #444; margin-top: 2mm; }
  ul.upcoming { margin: 1mm 0; padding-left: 5mm; }
`;

function row(f) {
  const warn = f.abmahnung ? ABMAHN_ICON : '';
  return `<tr><td class="no">${f.no}</td><td>${warn}${esc(f.what)}</td><td>${esc(f.where)}</td><td>${esc(f.law)}</td><td>${esc(f.fix)}</td></tr>`;
}

function prioSection(t, { prio, findings }) {
  if (findings.length === 0) return '';
  return `<h2>${t.prio[prio].title}</h2><p class="lead">${t.prio[prio].lead}</p>
<table><thead><tr>${t.short.columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead>
<tbody>${findings.map(row).join('\n')}</tbody></table>`;
}

function upcomingSection(t, upcoming) {
  if (upcoming.length === 0) return '';
  const items = upcoming.map((u) => `<li><strong>${esc(u.title)}</strong> (${esc(u.status)}): ${esc(u.short)}</li>`).join('\n');
  return `<h2>${t.short.upcoming}</h2><p class="lead">${t.short.upcomingLead}</p><ul class="upcoming">${items}</ul>`;
}

/** @param {ReturnType<import('./model.mjs').buildModel>} model */
export function renderKurzbericht(model, { withLong = true } = {}) {
  const { t } = model;
  const gaps = model.findings.filter((f) => f.kind === 'gap').length;
  const checks = model.findings.length - gaps;
  const assumptions = model.assumptions.length > 0
    ? model.assumptions.map((a) => `${esc(a.question)} ${esc(a.assumption)} (${esc(a.evidence)})`).join('; ')
    : t.short.noAssumptions;
  const hasWarn = model.findings.some((f) => f.abmahnung);
  return `<!doctype html><html lang="${t.lang}"><head><meta charset="utf-8"><title>${t.files.short} ${esc(model.site)}</title><style>${css(t)}</style></head><body>
<h1>${esc(t.short.title(model.site))}</h1>
<p class="meta">${esc(t.meta(model.date, model.time, model.pagesScanned, model.checklistStatus))}</p>
<p class="meta">${esc(platformLine(model))}</p>
${toolRow(t, 'meta tool')}
<div class="notice">${t.short.notice}</div>${t.translated ? `<div class="notice">${esc(t.translatedNote)}</div>` : ''}
<p class="intro">${esc([t.short.intro, withLong ? t.short.introLong : '', t.short.introStatus].filter(Boolean).join(' ')).replace('⚠', ABMAHN_ICON)}</p>
<div class="summary"><div><strong>${gaps}</strong>${t.short.gaps}</div><div><strong>${checks}</strong>${t.short.checks}</div></div>
<p class="meta"><strong>${t.short.assumptions}:</strong> ${assumptions}</p>
${model.byPrio.map((g) => prioSection(t, g)).join('\n')}
${hasWarn ? `<p class="legend">${ABMAHN_ICON}${esc(t.abmahnNote)}</p>` : ''}
${upcomingSection(t, model.upcoming)}
<p class="foot">${t.short.foot}</p>
</body></html>`;
}
