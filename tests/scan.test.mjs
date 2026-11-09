// End-to-end: scan local fixture sites in headless Chromium and check the findings.

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { runChecks } from '../scripts/lib/checks/index.mjs';
import { scanSite } from '../scripts/lib/scanner.mjs';
import { renderPdf } from '../scripts/render-pdf.mjs';
import { serveFixture } from './helpers.mjs';

const FAST = { delayMs: 0, settleMs: 300 };
const statusOf = (findings, check) => findings.filter((f) => f.check === check).map((f) => f.status);

async function scanFixture(name) {
  const server = await serveFixture(name);
  const outDir = await mkdtemp(path.join(tmpdir(), 'wlc-'));
  try {
    const scan = await scanSite({ startUrl: server.base, outDir, launchArgs: server.launchArgs, ...FAST });
    return { scan, checks: runChecks(scan), outDir };
  } finally {
    await server.close();
  }
}

describe('shop with built-in gaps', () => {
  let result;
  before(async () => { result = await scanFixture('bad-shop'); });
  after(() => rm(result.outDir, { recursive: true, force: true }));

  test('finds missing legal links and imprint content', () => {
    const { findings } = result.checks;
    assert.deepEqual(statusOf(findings, 'IMP-01'), ['gap']);
    assert.deepEqual(statusOf(findings, 'DSE-01'), ['gap']);
    assert.ok(statusOf(findings, 'IMP-02').includes('gap'));
    assert.deepEqual(statusOf(findings, 'WID-01'), ['gap']);
  });

  test('finds trackers, fonts and cookies before consent and a missing reject button', () => {
    const { findings } = result.checks;
    assert.ok(findings.some((f) => f.check === 'TDD-01' && f.title.includes('Google Analytics')));
    assert.ok(findings.some((f) => f.check === 'TDD-02' && f.status === 'gap' && f.title.includes('Google Fonts')));
    assert.ok(statusOf(findings, 'TDD-03').includes('gap'));
    assert.deepEqual(statusOf(findings, 'TDD-04'), ['gap']);
  });

  test('without a reject button the reject run is reported as not possible; accept is clicked', () => {
    assert.equal(result.scan.consentRuns.reject.clicked, false);
    assert.deepEqual(statusOf(result.checks.findings, 'TDD-06'), ['hint']);
    assert.equal(result.scan.consentRuns.accept.clicked, true);
    assert.equal(result.scan.consentRuns.accept.button, 'Akzeptieren');
  });

  test('finds shop duties: VAT note, order button, outdated ODR link', () => {
    const { findings } = result.checks;
    assert.ok(statusOf(findings, 'PRC-01').includes('gap'));
    assert.deepEqual(statusOf(findings, 'BTN-01'), ['gap']);
    assert.deepEqual(statusOf(findings, 'ODR-01'), ['gap']);
  });

  test('deep check adds the checkout page from the sitemap', () => {
    assert.deepEqual(result.scan.deepCheck.added.map((a) => a.type), ['checkout']);
  });

  test('records evidence screenshots and writes scan.json', async () => {
    const banner = result.scan.pages[0].screenshots.cookieabfrage;
    assert.equal(banner, 'belege/seite-01-cookieabfrage.jpg');
    const json = JSON.parse(await readFile(path.join(result.outDir, 'scan.json'), 'utf8'));
    assert.equal(json.consentGiven, false);
  });

  test('accessibility check reports the image without alt text', () => {
    assert.ok(result.checks.findings.some((f) => f.check === 'BF-01' && f.evidence.rule === 'image-alt'));
  });
});

describe('site without gaps in the checked areas', () => {
  let result;
  before(async () => { result = await scanFixture('good-site'); });
  after(() => rm(result.outDir, { recursive: true, force: true }));

  test('reports legal links and consent dialog as ok', () => {
    const { findings } = result.checks;
    assert.deepEqual(statusOf(findings, 'IMP-01'), ['ok']);
    assert.deepEqual(statusOf(findings, 'DSE-01'), ['ok']);
    assert.deepEqual(statusOf(findings, 'TDD-04'), ['ok']);
    assert.deepEqual(statusOf(findings, 'TDD-06'), ['ok']);
    assert.equal(result.scan.consentRuns.reject.button, 'Ablehnen');
  });

  test('raises no gap except missing HTTPS on the local test server', () => {
    const gaps = result.checks.findings.filter((f) => f.status === 'gap').map((f) => f.check);
    assert.deepEqual(gaps, ['SEC-01']);
    assert.equal(result.checks.siteProfile.shopSignals, false);
    assert.equal(result.checks.siteProfile.platform.name, 'WordPress');
  });
});

describe('consent tool that keeps tracking after reject', () => {
  let result;
  before(async () => { result = await scanFixture('consent-choice'); });
  after(() => rm(result.outDir, { recursive: true, force: true }));

  test('the main scan sees nothing before consent', () => {
    const before = result.checks.findings.filter((f) => ['TDD-01', 'TDD-03'].includes(f.check) && f.status === 'gap');
    assert.deepEqual(before, []);
  });

  test('after reject: Meta pixel and its cookie are gaps, the gcs=G100 ping is a hint', () => {
    const { findings } = result.checks;
    const reject = result.scan.consentRuns.reject;
    assert.equal(reject.button, 'Alle ablehnen');
    assert.equal(reject.bannerGone, true);
    assert.ok(findings.some((f) => f.check === 'TDD-06' && f.status === 'gap' && f.title.startsWith('Meta Pixel')));
    assert.ok(findings.some((f) => f.check === 'TDD-06' && f.status === 'gap' && f.evidence.cookies?.some((c) => c.name === '_fbp')));
    const ping = findings.filter((f) => f.check === 'TDD-07');
    assert.equal(ping.length, 1);
    assert.equal(ping[0].status, 'hint');
    assert.ok(ping[0].title.startsWith('Google Analytics'));
    assert.ok(!findings.some((f) => f.check === 'TDD-06' && f.title.startsWith('Google Analytics')));
  });

  test('after accept: services missing in the privacy policy are listed with when they loaded', () => {
    const policy = result.checks.findings.find((f) => f.check === 'DSE-02');
    assert.deepEqual(policy.evidence.services.sort(), ['Google Tag Manager', 'Meta Pixel / Facebook']);
    assert.equal(policy.evidence.loaded['Google Tag Manager'], 'after accept');
  });
});

test('renders an HTML report to PDF', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'wlc-pdf-'));
  try {
    const html = path.join(dir, 'r.html');
    const { writeFile } = await import('node:fs/promises');
    await writeFile(html, '<!doctype html><meta charset="utf-8"><h1>Kurzbericht</h1><p>Test</p>');
    const pages = await renderPdf(html, path.join(dir, 'r.pdf'));
    assert.equal(pages, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
