// Each check gets its own folder: JJJJMMTT_<website>_<SPRACHE>, further runs on the same day
// …_Ref2, …_Ref3 in any language; file names JJJJMMTT_<projekt>_<Art>_<SPRACHE>[_RefN] (decisions 44a, 45a).

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createRunDir, filePrefix, fileSuffix, projectName, runDirName } from '../scripts/lib/run-dir.mjs';

test('folder name is date plus host without www, dots replaced by hyphens (decision 36a)', () => {
  assert.equal(runDirName(new URL('https://www.xyz.de/shop'), new Date(2026, 10, 7)), '20261107_xyz-de_DE');
  assert.equal(runDirName(new URL('https://xyz.de'), new Date(2026, 10, 7), 2, 'fr'), '20261107_xyz-de_FR_Ref2');
  // macOS treats folders ending in .app, .pkg … as packages; the name must never end like that.
  assert.equal(runDirName(new URL('https://beispiel.app'), new Date(2026, 10, 8)), '20261108_beispiel-app_DE');
  assert.equal(runDirName(new URL('https://shop.xyz.pkg'), new Date(2026, 10, 8), 1, 'en'), '20261108_shop-xyz-pkg_EN');
});

test('project name, file prefix and suffix with language and revision', () => {
  assert.equal(projectName(new URL('https://www.xyz.de')), 'xyz');
  assert.equal(projectName(new URL('https://shop.xyz.de')), 'shop-xyz');
  assert.equal(filePrefix(new URL('https://xyz.de'), new Date(2026, 10, 7)), '20261107_xyz');
  assert.equal(fileSuffix('de'), '_DE');
  assert.equal(fileSuffix('fr', 3), '_FR_Ref3');
  assert.equal(fileSuffix('pt-br', 2), '_PT-BR_Ref2');
  assert.throws(() => fileSuffix('Französisch'), /Invalid language code/);
});

test('further checks on the same day are revisions Ref2, Ref3 …', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-run-'));
  try {
    const day = new Date(2026, 10, 7);
    const start = new URL('https://xyz.de');
    const first = await createRunDir(parent, start, day);
    const second = await createRunDir(parent, start, day);
    await mkdir(path.join(parent, '20261107_xyz-de_DE_Ref4'));
    const third = await createRunDir(parent, start, day, 'fr');
    assert.deepEqual([first, second, third].map((r) => path.basename(r.dir)), ['20261107_xyz-de_DE', '20261107_xyz-de_DE_Ref2', '20261107_xyz-de_FR_Ref3']);
    assert.deepEqual([first, second, third].map((r) => r.prefix), ['20261107_xyz', '20261107_xyz', '20261107_xyz']);
    assert.deepEqual([first, second, third].map((r) => r.suffix), ['_DE', '_DE_Ref2', '_FR_Ref3']);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('revisions count folders of the old dotted scheme as the same website', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-run-'));
  try {
    await mkdir(path.join(parent, '20261108_beispiel.app'));
    const run = await createRunDir(parent, new URL('https://beispiel.app'), new Date(2026, 10, 8));
    assert.equal(path.basename(run.dir), '20261108_beispiel-app_DE_Ref2');
    assert.equal(run.suffix, '_DE_Ref2');
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('revisions also count folders with Ref in front (scheme until v1.9.2)', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-run-'));
  try {
    const day = new Date(2026, 10, 8);
    await mkdir(path.join(parent, '20261108_xyz-de'));
    await mkdir(path.join(parent, '20261108_Ref2_xyz-de'));
    const run = await createRunDir(parent, new URL('https://xyz.de'), day);
    assert.equal(path.basename(run.dir), '20261108_xyz-de_DE_Ref3');
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('revisions count folders without language code (scheme v1.9.3–v1.9.5)', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-run-'));
  try {
    await mkdir(path.join(parent, '20261108_xyz-de'));
    await mkdir(path.join(parent, '20261108_xyz-de_Ref2'));
    const run = await createRunDir(parent, new URL('https://xyz.de'), new Date(2026, 10, 8), 'en');
    assert.equal(path.basename(run.dir), '20261108_xyz-de_EN_Ref3');
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
