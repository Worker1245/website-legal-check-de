// Document languages other than German and English (decisions 41a, 43a): template, check
// of the translated file and use in the reports.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { customTexts, translationTemplate } from '../scripts/translation.mjs';
import { renderKurzbericht } from '../scripts/lib/report/kurzbericht.mjs';
import { renderLangfassung } from '../scripts/lib/report/langfassung.mjs';
import { buildModel } from '../scripts/lib/report/model.mjs';

/** Fake translation: every text gets a marker, placeholders and tags stay. */
function fakeTranslation() {
  const mark = (value) => {
    if (typeof value === 'string') return `«${value}»`;
    if (Array.isArray(value)) return value.map(mark);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mark(v)]));
    return value;
  };
  const { _comment, ...rest } = translationTemplate();
  return { ...mark(rest), lang: 'fr', languageName: 'Français' };
}

const report = {
  site: 'example.de', date: '08.11.2026', pagesScanned: 3, checklistStatus: '07.11.2026',
  findings: [{ prio: 1, kind: 'gap', title: 'T', what: 'W', where: '/x/', law: '§ 25 TDDDG', fix: 'F', evidence: 'E' }],
};

test('template: functions become placeholders, optional parts are marked, abbreviations included', () => {
  const tpl = translationTemplate();
  assert.equal(tpl.meta, 'Checked on {date} [[{time} ]]· {pages} pages examined · Legal status: {status}');
  assert.equal(tpl.platform, 'Detected system: {name}[[ ({extras})]]');
  assert.ok(tpl.abbreviations['DSGVO']);
  assert.equal(tpl.files, undefined, 'file names are not translated');
});

test('translated file becomes a text set; empty optional parts disappear', () => {
  const t = customTexts(fakeTranslation());
  assert.equal(t.lang, 'fr');
  assert.equal(t.files.short, 'ShortReport');
  assert.equal(t.meta('08.11.2026', '', 3, '07.11.2026'), '«Checked on 08.11.2026 · 3 pages examined · Legal status: 07.11.2026»');
  assert.equal(t.meta('08.11.2026', '10:30', 3, '07.11.2026'), '«Checked on 08.11.2026 10:30 · 3 pages examined · Legal status: 07.11.2026»');
  assert.equal(t.platform('Wix', ''), '«Detected system: Wix»');
  assert.deepEqual(t.prompt.doneFallback('X'), ['«The target state is reached: X»', '«The observation above no longer occurs.»']);
});

test('missing texts, changed placeholders and a wrong language code are reported', () => {
  const broken = fakeTranslation();
  delete broken.long.toc;
  broken.meta = 'Vérifié le {datum}';
  broken.short.notice = 'sans balises';
  broken.lang = 'Französisch';
  assert.throws(() => customTexts(broken), (error) => ['long.toc: missing', 'meta: placeholders', 'short.notice: HTML tags', 'lang:']
    .every((part) => error.message.includes(part)));
});

test('reports in the translated language carry the AI translation note and the language code', () => {
  const t = customTexts(fakeTranslation());
  const model = buildModel(report, t);
  for (const html of [renderKurzbericht(model), renderLangfassung(model, {})]) {
    assert.match(html, /<html lang="fr">/);
    assert.ok(html.includes('This document was translated by AI'));
  }
  const german = renderKurzbericht(buildModel(report));
  assert.ok(!german.includes('Dieses Dokument wurde von einer KI'), 'no note in German or English reports');
});
