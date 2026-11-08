// Output of a run: PDFs (and the prompt as .txt) in the run folder, raw data in daten/,
// no HTML files left, screenshots shrunk, mock-ups embedded as images.

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { chromium } from 'playwright';
import { buildReports, resultDir } from '../scripts/build-reports.mjs';
import { prepareImages, IMAGE_WIDTH } from '../scripts/lib/report/images.mjs';

const finding = (over) => ({ prio: 1, kind: 'gap', title: 'T', what: 'W', where: '/x/', law: '§ 25 TDDDG', fix: 'F', evidence: 'E', ...over });

async function fixtureRun() {
  const run = await mkdtemp(path.join(tmpdir(), 'wlc-out-'));
  const daten = path.join(run, 'daten');
  await mkdir(path.join(daten, 'belege'), { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 3000 } });
    await page.setContent('<body style="margin:0;background:linear-gradient(#08f,#f80);height:3000px"></body>');
    await page.screenshot({ path: path.join(daten, 'belege', 'seite-01-ansicht.png'), fullPage: true });
  } finally {
    await browser.close();
  }
  await writeFile(path.join(daten, 'mock.html'), '<!doctype html><meta charset="utf-8"><h1>Vorschlag</h1>');
  const report = path.join(daten, 'report.json');
  await writeFile(report, JSON.stringify({
    site: 'example.de', date: '07.11.2026', pagesScanned: 1, checklistStatus: '07.11.2026',
    findings: [finding({ figures: [{ src: 'belege/seite-01-ansicht.png', caption: 'Startseite' }], mockup: { file: 'mock.html', description: 'Korrektur' } })],
  }));
  return { run, daten, report };
}

test('results go to the run folder, raw data stays in daten/, no HTML is left', async () => {
  const { run, daten, report } = await fixtureRun();
  try {
    assert.equal(resultDir(report), run);
    await buildReports(report, '20261107_example', { long: true, kiPrompt: true });
    const top = (await readdir(run)).sort();
    assert.deepEqual(top, ['20261107_example_KI-Prompt.txt', '20261107_example_Langfassung.pdf', 'daten']);
    assert.ok(!(await readdir(daten)).some((f) => f.endsWith('.html')), 'mock-up page removed after embedding');
  } finally {
    await rm(run, { recursive: true, force: true });
  }
});

test('only the short report when only that was requested; nothing without any PDF', async () => {
  const { run, report } = await fixtureRun();
  try {
    await buildReports(report, '20261107_example', { short: true });
    assert.deepEqual((await readdir(run)).sort(), ['20261107_example_Kurzbericht.pdf', 'daten']);
    await assert.rejects(buildReports(report, '20261107_example', {}), /Neither short nor long/);
  } finally {
    await rm(run, { recursive: true, force: true });
  }
});

test('screenshots are shrunk and cropped, mock-ups become images', async () => {
  const { run, daten } = await fixtureRun();
  const browser = await chromium.launch();
  try {
    const original = (await stat(path.join(daten, 'belege', 'seite-01-ansicht.png'))).size;
    const { figures, mockups } = await prepareImages(browser, daten, [{ figures: [{ src: 'belege/seite-01-ansicht.png' }], mockup: { file: 'mock.html' } }]);
    const shot = figures.get('belege/seite-01-ansicht.png');
    assert.match(shot, /^data:image\/jpeg;base64,/);
    const page = await browser.newPage();
    const size = await page.evaluate(async (src) => { const i = new Image(); i.src = src; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, shot);
    assert.equal(size[0], IMAGE_WIDTH);
    assert.ok(size[1] <= Math.round(IMAGE_WIDTH * 900 / 1366), `cropped height, got ${size[1]}`);
    assert.ok(Buffer.from(shot.split(',')[1], 'base64').length < original, 'smaller than the original');
    assert.match(mockups.get('mock.html'), /^data:image\/jpeg;base64,/);
  } finally {
    await browser.close();
    await rm(run, { recursive: true, force: true });
  }
});

test('AI question answered with U: the detected system decides and becomes an assumption (decision 38a)', async () => {
  const { resolveKiPrompt } = await import('../scripts/build-reports.mjs');
  const { texts } = await import('../scripts/lib/report/i18n.mjs');
  const t = texts('de');
  assert.deepEqual(resolveKiPrompt(true, {}, t), { kiPrompt: true, assumption: null });
  assert.deepEqual(resolveKiPrompt(false, { platform: null }, t), { kiPrompt: false, assumption: null });
  const builder = resolveKiPrompt('unknown', { platform: { name: 'Wix' } }, t);
  assert.equal(builder.kiPrompt, false);
  assert.equal(builder.assumption.evidence, 'Erkanntes System: Wix');
  const custom = resolveKiPrompt('unknown', { platform: null }, t);
  assert.equal(custom.kiPrompt, true);
  assert.match(custom.assumption.consequence, /Prompt/);
  assert.equal(resolveKiPrompt('unknown', {}, texts('en')).assumption.question, 'Website built with AI (vibe coding)?');
});

test('U without detected system writes the prompt file', async () => {
  const { run, report } = await fixtureRun();
  try {
    await buildReports(report, '20261107_example', { long: true, kiPrompt: 'unknown' });
    assert.ok((await readdir(run)).includes('20261107_example_KI-Prompt.txt'));
  } finally {
    await rm(run, { recursive: true, force: true });
  }
});

test('language code and revision follow the kind of file (decisions 44a, 45a)', async () => {
  const { run, report } = await fixtureRun();
  try {
    await buildReports(report, '20261107_example', { short: true, long: true, kiPrompt: true, suffix: '_DE_Ref2' });
    assert.deepEqual((await readdir(run)).sort(), [
      '20261107_example_KI-Prompt_DE_Ref2.txt', '20261107_example_Kurzbericht_DE_Ref2.pdf', '20261107_example_Langfassung_DE_Ref2.pdf', 'daten',
    ]);
    await assert.rejects(buildReports(report, '20261107_example', { short: true, suffix: '_Ref2_DE' }), /--suffix/);
  } finally {
    await rm(run, { recursive: true, force: true });
  }
});
