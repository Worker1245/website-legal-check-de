// Reusing an earlier scan (decisions 29b, 30a, 31b): find it, re-check every page quickly,
// keep unchanged pages with their screenshots, scan only changed pages again.

import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { findPreviousScan, pageFingerprint } from '../scripts/lib/reuse.mjs';
import { scanSite } from '../scripts/lib/scanner.mjs';
import { serveFixture } from './helpers.mjs';

const FIXTURE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'good-site');

async function fakeRun(parent, name, host, scannedAt) {
  await mkdir(path.join(parent, name, 'daten'), { recursive: true });
  await writeFile(path.join(parent, name, 'daten', 'scan.json'), JSON.stringify({ host, scannedAt, startUrl: `https://${host}/`, pages: [] }));
}

test('finds the newest earlier scan of the same site within 30 days', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-find-'));
  try {
    await fakeRun(parent, '20261101_example.de', 'www.example.de', '2026-11-01T10:00:00.000Z');
    await fakeRun(parent, '20261101_Ref2_example.de', 'example.de', '2026-11-01T12:00:00.000Z');
    await fakeRun(parent, '20260901_example.de', 'example.de', '2026-09-01T10:00:00.000Z');
    await fakeRun(parent, '20261105_other.de', 'other.de', '2026-11-05T10:00:00.000Z');
    const now = new Date('2026-11-08T10:00:00.000Z');
    const found = await findPreviousScan(parent, new URL('https://example.de'), now);
    assert.equal(path.basename(found.dir), '20261101_Ref2_example.de');
    assert.equal(found.scannedAt, '2026-11-01T12:00:00.000Z');
    assert.equal(await findPreviousScan(parent, new URL('https://example.de'), new Date('2026-12-15T00:00:00Z')), null);
    // New scheme with hyphens is found as well, and wins when it is newer.
    await fakeRun(parent, '20261107_example-de', 'example.de', '2026-11-07T09:00:00.000Z');
    assert.equal(path.basename((await findPreviousScan(parent, new URL('https://example.de'), now)).dir), '20261107_example-de');
    await fakeRun(parent, '20261108_beispiel-app', 'beispiel.app', '2026-11-08T08:00:00.000Z');
    await fakeRun(parent, '20261108_beispiel-app_Ref2', 'beispiel.app', '2026-11-08T09:00:00.000Z');
    assert.equal(path.basename((await findPreviousScan(parent, new URL('https://beispiel.app'), now)).dir), '20261108_beispiel-app_Ref2');
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('unchanged pages and their screenshots are reused, changed pages are scanned again', async () => {
  const site = await mkdtemp(path.join(tmpdir(), 'wlc-site-'));
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-runs-'));
  await cp(FIXTURE, site, { recursive: true });
  const server = await serveFixture(site);
  const fast = { delayMs: 0, settleMs: 300, launchArgs: server.launchArgs };
  try {
    const first = path.join(parent, 'run1', 'daten');
    const old = await scanSite({ startUrl: server.base, outDir: first, ...fast });
    const leistungen = old.pages.find((p) => p.url.endsWith('/leistungen.html'));
    await writeFile(path.join(site, 'leistungen.html'), (await readFile(path.join(site, 'leistungen.html'), 'utf8')).replace('Beratung und Schulung.', 'Neu: Workshops.'));
    const second = path.join(parent, 'run2', 'daten');
    const scan = await scanSite({ startUrl: server.base, outDir: second, reuseFrom: path.join(parent, 'run1'), ...fast });
    assert.deepEqual(scan.reuse.changedPages, [leistungen.url]);
    assert.ok(scan.reuse.unchangedPages.includes(old.pages[0].url));
    assert.equal(scan.pages.length, old.pages.length);
    const start = scan.pages[0];
    // Unchanged pages point to the earlier photos instead of copying them (decision 32a).
    for (const shot of Object.values(start.screenshots)) {
      assert.match(shot, /^\.\.\/\.\.\/run1\/daten\/belege\//, shot);
      await readFile(path.join(second, shot));
    }
    const copied = await readdir(path.join(second, 'belege')).catch(() => []);
    for (const shot of Object.values(old.pages[0].screenshots)) assert.ok(!copied.includes(path.basename(shot)), `not copied: ${shot}`);
    assert.match(scan.pages.find((p) => p.url === leistungen.url).facts.bodyText, /Neu: Workshops/);
  } finally {
    await server.close();
    await rm(site, { recursive: true, force: true });
    await rm(parent, { recursive: true, force: true });
  }
});

test('fingerprint ignores changing server numbers of the same service', () => {
  const facts = { title: 'T', bodyText: 'x', links: [], forms: [], prices: [], banner: null };
  const a = pageFingerprint(facts, [{ url: 'https://wix-engage-visitors-prod-9.firebaseio.com/a', thirdParty: true }]);
  const b = pageFingerprint(facts, [{ url: 'https://wix-engage-visitors-prod-12.firebaseio.com/b', thirdParty: true }]);
  assert.equal(a, b);
  const c = pageFingerprint(facts, [{ url: 'https://www.google-analytics.com/g', thirdParty: true }]);
  assert.notEqual(a, c);
});
