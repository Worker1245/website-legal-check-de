// Output folder per check: JJJJMMTT_<website>; further checks of the same site on the same
// day are revisions JJJJMMTT_<website>_Ref2, JJJJMMTT_<website>_Ref3 … (Ref at the end of the
// folder name), so earlier results are never overwritten. File names keep JJJJMMTT_RefN_<projekt>.

import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { baseDomain } from './url.mjs';

const MAX_RUNS_PER_DAY = 999;

const day = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};
const host = (start) => start.hostname.toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9.-]/g, '-');
// Dots become hyphens in folder names (decision 36a): macOS treats folders ending in .app,
// .pkg, .bundle … as packages, and some of these are real top-level domains.
const folderHost = (start) => host(start).replace(/\./g, '-');
const tag = (revision) => (revision > 1 ? `_Ref${revision}` : '');

/** "xyz.de" -> "xyz", "shop.xyz.de" -> "shop-xyz", "example.co.uk" -> "example". */
export function projectName(start) {
  const full = host(start);
  const base = baseDomain(full);
  const name = base.split('.')[0];
  const sub = full.slice(0, Math.max(0, full.length - base.length - 1));
  return sub ? `${sub.replace(/\./g, '-')}-${name}` : name;
}

/** e.g. "20261107_xyz-de" or, for revision 2, "20261107_xyz-de_Ref2" (Ref at the end). */
export function runDirName(start, date, revision = 1) {
  return `${day(date)}_${folderHost(start)}${tag(revision)}`;
}

/** Older folder names of the same revision, counted as the same website. */
function legacyDirNames(start, date, revision) {
  return [
    `${day(date)}${tag(revision)}_${folderHost(start)}`, // Ref in front, hyphens (v1.9.1–v1.9.2)
    `${day(date)}${tag(revision)}_${host(start)}`, // Ref in front, dots (until v1.9.0)
  ];
}

const exists = (file) => access(file).then(() => true, () => false);

/** File name prefix, e.g. "20261107_xyz" or "20261107_Ref2_xyz". */
export function filePrefix(start, date, revision = 1) {
  return `${day(date)}${tag(revision)}_${projectName(start)}`;
}

/**
 * Create the first free run folder below parent. Creation is atomic (mkdir without
 * "recursive"), so two checks started at once cannot share a folder.
 * @returns {Promise<{dir: string, prefix: string, revision: number}>}
 */
export async function createRunDir(parent, start, date = new Date()) {
  for (let revision = 1; revision <= MAX_RUNS_PER_DAY; revision += 1) {
    const dir = path.resolve(parent, runDirName(start, date, revision));
    const taken = await Promise.all(legacyDirNames(start, date, revision).map((name) => exists(path.resolve(parent, name))));
    if (taken.some(Boolean)) continue;
    try {
      await mkdir(dir);
      return { dir, prefix: filePrefix(start, date, revision), revision };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  throw new Error(`More than ${MAX_RUNS_PER_DAY} checks of ${start.hostname} today.`);
}
