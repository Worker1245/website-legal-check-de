// Each check gets its own folder: JJJJMMTT_<website>, further runs on the same day
// JJJJMMTT_<website>_Ref2, JJJJMMTT_<website>_Ref3 … (Ref at the end of folder names); file names keep JJJJMMTT_RefN_<projekt>.

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createRunDir, filePrefix, projectName, runDirName } from '../scripts/lib/run-dir.mjs';

test('folder name is date plus host without www, dots replaced by hyphens (decision 36a)', () => {
  assert.equal(runDirName(new URL('https://www.xyz.de/shop'), new Date(2026, 10, 7)), '20261107_xyz-de');
  assert.equal(runDirName(new URL('https://xyz.de'), new Date(2026, 10, 7), 2), '20261107_xyz-de_Ref2');
  // macOS treats folders ending in .app, .pkg … as packages; the name must never end like that.
  assert.equal(runDirName(new URL('https://beispiel.app'), new Date(2026, 10, 8)), '20261108_beispiel-app');
  assert.equal(runDirName(new URL('https://shop.xyz.pkg'), new Date(2026, 10, 8)), '20261108_shop-xyz-pkg');
});

test('project name and file prefix follow the revision', () => {
  assert.equal(projectName(new URL('https://www.xyz.de')), 'xyz');
  assert.equal(projectName(new URL('https://shop.xyz.de')), 'shop-xyz');
  assert.equal(filePrefix(new URL('https://xyz.de'), new Date(2026, 10, 7)), '20261107_xyz');
  assert.equal(filePrefix(new URL('https://xyz.de'), new Date(2026, 10, 7), 3), '20261107_Ref3_xyz');
});

test('further checks on the same day are revisions Ref2, Ref3 …', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-run-'));
  try {
    const day = new Date(2026, 10, 7);
    const start = new URL('https://xyz.de');
    const first = await createRunDir(parent, start, day);
    const second = await createRunDir(parent, start, day);
    await mkdir(path.join(parent, '20261107_xyz-de_Ref4'));
    const third = await createRunDir(parent, start, day);
    assert.deepEqual([first, second, third].map((r) => path.basename(r.dir)), ['20261107_xyz-de', '20261107_xyz-de_Ref2', '20261107_xyz-de_Ref3']);
    assert.deepEqual([first, second, third].map((r) => r.prefix), ['20261107_xyz', '20261107_Ref2_xyz', '20261107_Ref3_xyz']);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});

test('revisions count folders of the old dotted scheme as the same website', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'wlc-run-'));
  try {
    await mkdir(path.join(parent, '20261108_beispiel.app'));
    const run = await createRunDir(parent, new URL('https://beispiel.app'), new Date(2026, 10, 8));
    assert.equal(path.basename(run.dir), '20261108_beispiel-app_Ref2');
    assert.equal(run.prefix, '20261108_Ref2_beispiel');
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
    assert.equal(path.basename(run.dir), '20261108_xyz-de_Ref3');
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
