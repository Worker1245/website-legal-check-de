// Prompt for AI coding agents (Claude Code, Codex …) that fix the findings in the website's
// code without asking back (decisions 11a–14a). Plain Markdown; used in the long report
// and written as its own file so it can be copied cleanly.

import { platformLine } from './model.mjs';

const FENCE = '````';

/** Quote text line by line so website content stays recognisable as data. */
const quote = (text) => String(text ?? '').split(/\r?\n/).map((line) => `> ${line}`).join('\n');
const fenced = (text) => `${FENCE}text\n${String(text).replaceAll(FENCE, '```')}\n${FENCE}`;

function findingBlock(p, f) {
  const lines = [
    p.finding(f.no, f.title), '',
    p.prioLine(f.prio, f.kind === 'gap' ? p.gapKind : p.checkKind),
    `- ${p.where}: ${f.where}`,
    `- ${p.law}: ${f.law}`,
    `- ${p.target}: ${f.fix}`, '',
    p.observed, '', quote(f.evidence), '',
  ];
  if (f.aiTask) lines.push(p.task, '', f.aiTask, '');
  if (f.steps.length) lines.push(p.steps, '', ...f.steps.map((s, i) => `${i + 1}. ${s}`), '');
  if (f.draft) lines.push(p.draft, '', fenced(f.draft), '');
  const done = f.done?.length ? f.done : p.doneFallback(f.fix);
  lines.push(p.done, '', ...done.map((d) => `- ${d}`), '');
  return lines.join('\n');
}

/** @param {ReturnType<import('./model.mjs').buildModel>} model */
export function renderKiPrompt(model) {
  const { t } = model;
  const p = t.prompt;
  const groups = model.byPrio.filter((g) => g.findings.length).map((g) => [`## ${t.prio[g.prio].title}`, '', ...g.findings.map((f) => findingBlock(p, f))].join('\n'));
  const assumptions = model.assumptions.map((a) => `- ${a.question} ${a.assumption}`);
  const outside = model.manualChecks.map((m) => `- ${m.question} (${m.law})`);
  const platform = model.platform?.name ? [p.platform(platformLine(model).replace(/^[^:]+:\s*/, '')), ''] : [];
  return [
    p.heading(model.site), '',
    p.intro(model.site, model.time ? `${model.date} ${model.time}` : model.date, model.checklistStatus), '',
    ...platform,
    `## ${p.rules}`, '', ...p.ruleList.map((r, i) => `${i + 1}. ${r}`), '',
    ...(assumptions.length ? [`## ${p.assumptions}`, '', p.assumptionsLead, '', ...assumptions, ''] : []),
    ...groups,
    ...(outside.length ? [`## ${p.outside}`, '', p.outsideLead, '', ...outside, ''] : []),
    `## ${p.report}`, '',
    p.reportLead, '',
    ...p.reportItems, '',
  ].join('\n');
}
