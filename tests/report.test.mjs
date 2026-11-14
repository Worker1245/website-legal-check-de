// Report builder: priority order, escaping, safe links, both PDFs with the open font.

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildReports } from '../scripts/build-reports.mjs';
import { renderKurzbericht } from '../scripts/lib/report/kurzbericht.mjs';
import { renderLangfassung } from '../scripts/lib/report/langfassung.mjs';
import { buildModel, link } from '../scripts/lib/report/model.mjs';

const finding = (over) => ({
  prio: 1, kind: 'gap', title: 'T', what: 'W', where: 'X', law: '§ 25 TDDDG', fix: 'F', evidence: 'E', ...over,
});
const data = (findings) => ({ site: 'example.de', date: '07.11.2026', pagesScanned: 3, checklistStatus: '07.11.2026', findings });

test('findings are sorted by priority and numbered in that order', () => {
  const model = buildModel(data([finding({ prio: 3, title: 'C' }), finding({ prio: 1, title: 'A' }), finding({ prio: 2, title: 'B' })]));
  assert.deepEqual(model.findings.map((f) => `${f.no}${f.title}`), ['1A', '2B', '3C']);
});

test('invalid priority and missing fields are rejected', () => {
  assert.throws(() => buildModel(data([finding({ prio: 4 })])), /prio/);
  assert.throws(() => buildModel(data([finding({ law: '' })])), /law/);
});

test('website text is escaped and only http(s) links are linked', () => {
  const html = renderKurzbericht(buildModel(data([finding({ what: '<script>alert(1)</script>' })])));
  assert.ok(!html.includes('<script>alert'));
  assert.equal(link('javascript:alert(1)', 'x'), 'x');
  assert.match(link('https://a.de', 'a'), /^<a href="https:\/\/a.de">/);
});

test('long report has priority chapters, all lists and the disclaimer, same order as short report', () => {
  const model = buildModel(data([finding({ prio: 2, title: 'Zwei', what: 'Zwei', abmahnung: true }), finding({ prio: 1, title: 'Eins', what: 'Eins' })]));
  const long = renderLangfassung(model);
  for (const id of ['inhalt', 'kurzzeichen', 'prio-1', 'prio-2', 'manuell', 'kommend', 'abbildungen', 'tabellen', 'quellen', 'rechtshinweis']) {
    assert.ok(long.includes(`id="${id}"`), id);
  }
  assert.ok(long.indexOf('1. Eins') < long.indexOf('2. Zwei'));
  assert.match(long, /Häufiger Abmahngrund/);
  const short = renderKurzbericht(model);
  assert.ok(short.indexOf('Eins') < short.indexOf('Zwei'));
});

test('builds both PDFs with only the open-licence font embedded', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'wlc-rep-'));
  try {
    const file = path.join(dir, 'report.json');
    await writeFile(file, JSON.stringify(data([finding({})])));
    const result = await buildReports(file, '20261107_example', { short: true, long: true });
    for (const name of ['Kurzbericht', 'Langfassung']) {
      const pdf = await readFile(result[name].pdf, 'latin1');
      const fonts = [...new Set([...pdf.matchAll(/\/BaseFont\s*\/[A-Z]{6}\+([A-Za-z0-9-]+)/g)].map((m) => m[1]))];
      assert.ok(fonts.length > 0 && fonts.every((f) => f.startsWith('SourceSans3')), `${name}: ${fonts}`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('long report has a scope chapter; the update section appears only when the check ran', () => {
  const base = { ...data([finding({})]), okChecks: ['Impressum vorhanden'], dropped: ['UWG-02: Fachartikel'], scanNotes: ['Sitemap ausgewertet'] };
  const without = renderLangfassung(buildModel(base));
  assert.match(without, /id="umfang"[\s\S]*Impressum vorhanden[\s\S]*UWG-02: Fachartikel/);
  assert.ok(!without.includes('Aktualität der Prüfgrundlagen'));
  const withUpdate = renderLangfassung(buildModel({ ...base, sourceUpdate: { checked: '07.12.2026', statusBefore: '07.11.2026', changes: [{ what: 'Neue Fassung X', effect: 'Befund 1 angepasst' }], unverified: ['Y'], todo: ['references/checklist.md, TDD-04: Z'] } }));
  assert.match(withUpdate, /Aktualität der Prüfgrundlagen[\s\S]*Neue Fassung X – Befund 1 angepasst[\s\S]*TDD-04: Z/);
});

test('English reports use English fixed texts and file names; text drafts stay as written', async () => {
  const en = { ...data([finding({ prio: 1, draft: 'Widerrufsbelehrung [Name]' })]), language: 'en', platform: { name: 'WordPress', extras: ['WooCommerce'] } };
  const model = buildModel(en);
  const long = renderLangfassung(model);
  assert.match(long, /<html lang="en">/);
  assert.match(long, /Table of contents[\s\S]*Priority 1[\s\S]*Detected system: WordPress \(WooCommerce\)/);
  assert.match(long, /Widerrufsbelehrung \[Name\]/);
  assert.ok(!long.includes('Inhaltsverzeichnis'));
  assert.match(renderKurzbericht(model), /Short report: technical check of example\.de/);
  const dir = await mkdtemp(path.join(tmpdir(), 'wlc-en-'));
  try {
    const file = path.join(dir, 'report.json');
    await writeFile(file, JSON.stringify(en));
    const result = await buildReports(file, '20261107_example', { short: true, long: true, kiPrompt: true });
    assert.equal(path.basename(result.Kurzbericht.pdf), '20261107_example_ShortReport.pdf');
    assert.equal(path.basename(result.Langfassung.pdf), '20261107_example_LongReport.pdf');
    assert.equal(path.basename(result['KI-Prompt'].txt), '20261107_example_AI-Prompt.txt');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('fact sheet starts with a plain-language summary (German and English)', () => {
  const summary = 'Ihre Website lädt Schriften von Google, bevor Besucher zustimmen. Dabei erfährt Google die IP-Adresse.';
  const de = renderLangfassung(buildModel(data([finding({ summary })])));
  assert.match(de, /<tbody><tr><th>Priorität<\/th>[\s\S]*?<\/tr><tr><th>Fundstelle<\/th>[\s\S]*?<\/tr><tr><th>Kurzbeschreibung<\/th><td>Ihre Website lädt Schriften von Google/);
  const en = renderLangfassung(buildModel({ ...data([finding({ summary: 'Your site loads fonts from Google.' })]), language: 'en' }));
  assert.match(en, /<tr><th>Location<\/th>[\s\S]*?<\/tr><tr><th>Summary<\/th><td>Your site loads fonts from Google\./);
  const fallback = renderLangfassung(buildModel(data([finding({ what: 'Kurz gesagt' })])));
  assert.match(fallback, /<tr><th>Kurzbeschreibung<\/th><td>Kurz gesagt<\/td>/);
});

test('every fact-sheet row has a plain-language explanation', () => {
  const plain = { where: 'Das betrifft jede Seite Ihrer Website.', law: 'Dieses Gesetz erlaubt Cookies nur nach Zustimmung.', evidence: 'Beim ersten Besuch wurde ohne Klick ein Zähl-Cookie gespeichert.' };
  const html = renderLangfassung(buildModel(data([finding({ prio: 1, plain })])));
  const sheet = html.match(/<table id="tab-2">[\s\S]*?<\/table>/)[0];
  for (const text of ['Sofort erledigen', plain.where, plain.law, plain.evidence]) {
    assert.ok(sheet.includes(text), text);
  }
  assert.equal((sheet.match(/class="plain"/g) ?? []).length, 4);
  const en = renderLangfassung(buildModel({ ...data([finding({ plain: { law: 'Cookies only after consent.' } })]), language: 'en' }));
  assert.match(en, /class="plain">Cookies only after consent\./);
  assert.ok(!en.includes('In plain words') && !html.includes('Einfach erklärt'), 'no label before the explanation');
});

test('table captions stand above the table', () => {
  const html = renderLangfassung(buildModel(data([finding({})])));
  assert.match(html, /caption \{ caption-side: top;/);
  for (const table of html.match(/<table id="tab-\d+">[\s\S]*?<\/table>/g)) {
    assert.match(table, /^<table id="tab-\d+"><caption>/, 'caption is the first element of the table');
  }
});

test('first page of both PDFs explains with a fixed text what the document contains', async () => {
  const { texts } = await import('../scripts/lib/report/i18n.mjs');
  for (const language of ['de', 'en']) {
    const t = texts(language);
    const model = buildModel({ ...data([finding({})]), language });
    const short = renderKurzbericht(model);
    const long = renderLangfassung(model);
    assert.ok(short.includes(t.short.intro.split('⚠')[0]), `${language} short intro`);
    assert.ok(!short.includes('⚠'), 'warning sign drawn as icon, not as a font glyph');
    assert.ok(long.indexOf(t.long.intro) > 0 && long.indexOf(t.long.intro) < long.indexOf('id="inhalt"'), `${language} long intro before TOC`);
  }
});

test('German typography: protected spaces after § and before %, narrow space in z. B.', async () => {
  const { esc } = await import('../scripts/lib/report/model.mjs');
  assert.equal(esc('§ 25 TDDDG, 19 %, z. B. <b>'), '§ 25 TDDDG, 19 %, z. B. &lt;b&gt;');
  assert.equal(esc('§§ 312g, 355 BGB'), '§§ 312g, 355 BGB');
});

test('layout follows the researched legibility rules', () => {
  const model = buildModel(data([finding({})]));
  for (const html of [renderKurzbericht(model), renderLangfassung(model)]) {
    assert.match(html, /body \{ font: 11pt\/1\.5 /, 'body 11 pt, line spacing 1.5');
    assert.match(html, /text-align: left/, 'ragged right, no justified text');
    assert.match(html, /margin: 20mm 20mm 20mm 25mm/, 'left margin 25 mm');
  }
});

test('date is followed by the time HH:MM in both PDFs; time comes from the scan when missing', async () => {
  const model = buildModel({ ...data([finding({})]), time: '14:35' });
  assert.match(renderKurzbericht(model), /Geprüft am 07\.11\.2026 14:35 Uhr/);
  assert.match(renderLangfassung(model), /Geprüft am 07\.11\.2026 14:35 Uhr/);
  assert.match(renderLangfassung(buildModel({ ...data([finding({})]), time: '14:35', language: 'en' })), /Checked on 07\.11\.2026 14:35 ·/);
  const { scanTime } = await import('../scripts/build-reports.mjs');
  assert.match(scanTime('2026-11-08T13:05:00.000Z'), /^\d{2}:\d{2}$/);
});

test('without the time (answer N) only the date is shown', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'wlc-time-'));
  try {
    const file = path.join(dir, 'report.json');
    await writeFile(file, JSON.stringify({ ...data([finding({})]), time: '14:35' }));
    const { buildReports: build } = await import('../scripts/build-reports.mjs');
    const pdfWith = await build(file, '20261107_example', { short: true });
    assert.ok(pdfWith.Kurzbericht);
    const { renderKurzbericht: short } = await import('../scripts/lib/report/kurzbericht.mjs');
    const html = short(buildModel({ ...data([finding({})]), time: null }));
    assert.match(html, /Geprüft am 07\.11\.2026 ·/);
    const { resolveTime } = await import('../scripts/build-reports.mjs');
    assert.equal(await resolveTime({ time: '14:35' }, dir, false), null);
    assert.equal(await resolveTime({ time: '14:35' }, dir, true), '14:35');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('intro names mock-ups, prompt and long report only when the reader gets them', async () => {
  const { texts } = await import('../scripts/lib/report/i18n.mjs');
  for (const language of ['de', 'en']) {
    const t = texts(language);
    const plain = buildModel({ ...data([finding({})]), language });
    const long = renderLangfassung(plain);
    assert.ok(!long.includes(t.long.introMockups) && !long.includes(t.long.introPrompt), `${language}: nothing announced that is missing`);
    assert.ok(long.includes(t.long.introRest), `${language}: rest of the intro stays`);
    const full = buildModel({ ...data([finding({})]), language });
    Object.assign(full.findings[0], { mockup: { description: 'Cookie-Abfrage' }, mockupImage: 'data:image/png;base64,AA==' });
    const withAll = renderLangfassung(full, { promptChapter: true });
    assert.ok(withAll.includes(t.long.introMockups) && withAll.includes(t.long.introPrompt), `${language}: mock-ups and prompt announced`);
    assert.ok(renderKurzbericht(plain).includes(t.short.introLong), `${language}: long report announced by default`);
    const shortOnly = renderKurzbericht(plain, { withLong: false });
    assert.ok(!shortOnly.includes(t.short.introLong) && shortOnly.includes(t.short.introStatus), `${language}: short report without long report`);
  }
});

test('legal status is named "Rechtsstand" and explained on page 1', () => {
  const de = buildModel({ ...data([finding({})]), time: null });
  for (const html of [renderKurzbericht(de), renderLangfassung(de)]) {
    assert.match(html, /Rechtsstand: 07\.11\.2026/);
    assert.ok(!html.includes('Stand der Prüfliste'));
    assert.match(html, /Der Rechtsstand gibt an, bis zu welchem Datum Gesetze, Urteile und Leitlinien/);
  }
  const en = buildModel({ ...data([finding({})]), language: 'en' });
  assert.match(renderKurzbericht(en), /Legal status: 07\.11\.2026[\s\S]*The legal status states up to which date/);
});

test('both reports name the repository copyright next to the repository link, not in the page footer', () => {
  const model = buildModel(data([finding()]));
  for (const html of [renderKurzbericht(model), renderLangfassung(model)]) {
    assert.match(html, /github\.com\/[^<]+<\/a> · © 2026 Dario Lanz · GPL-3\.0-or-later<\/p>/);
    assert.ok(!html.includes('@bottom-left'), 'no copyright in the page footer');
  }
});

test('both reports show a small clickable LinkedIn QR code with caption next to the repository line', () => {
  const model = buildModel(data([finding()]));
  for (const html of [renderKurzbericht(model), renderLangfassung(model)]) {
    assert.match(html, /<a class="qr" href="https:\/\/www\.linkedin\.com\/in\/dario-lanz-30731a154\/"><svg[^>]*>[\s\S]*?<\/svg><span>LinkedIn<\/span><\/a>/);
    assert.equal(html.match(/class="qr"/g).length, 1, 'QR code appears once');
  }
});
