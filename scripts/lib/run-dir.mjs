// Output folder per check: JJJJMMTT_<website>_<SPRACHE>; further checks of the same site on the
// same day are revisions JJJJMMTT_<website>_<SPRACHE>_Ref2, _Ref3 … in any language. File names
// follow the same order: JJJJMMTT_<projekt>_<Art>_<SPRACHE>[_RefN] (decisions 44a, 45a), so
// earlier results are never overwritten.

import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { baseDomain } from './url.mjs';

const MAX_RUNS_PER_DAY = 999;
export const LANG_CODE = /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/i;

const day = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
};
const host = (start) => start.hostname.toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9.-]/g, '-');
// Dots become hyphens in folder names (decision 36a): macOS treats folders ending in .app,
// .pkg, .bundle … as packages, and some of these are real top-level domains.
const folderHost = (start) => host(start).replace(/\./g, '-');
const tag = (revision) => (revision > 1 ? `_Ref${revision}` : '');
const escapeRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Language code for names: ISO 639-1 in capitals, e.g. "de" -> "DE", "pt-br" -> "PT-BR". */
export function langTag(lang = 'de') {
  if (!LANG_CODE.test(lang)) throw new Error(`Invalid language code: ${lang}`);
  return lang.toUpperCase();
}

/** "xyz.de" -> "xyz", "shop.xyz.de" -> "shop-xyz", "example.co.uk" -> "example". */
export function projectName(start) {
  const full = host(start);
  const base = baseDomain(full);
  const name = base.split('.')[0];
  const sub = full.slice(0, Math.max(0, full.length - base.length - 1));
  return sub ? `${sub.replace(/\./g, '-')}-${name}` : name;
}

/** e.g. "20261107_xyz-de_DE" or, for revision 2 in French, "20261107_xyz-de_FR_Ref2". */
export function runDirName(start, date, revision = 1, lang = 'de') {
  return `${day(date)}_${folderHost(start)}_${langTag(lang)}${tag(revision)}`;
}

/** Folder names that count as the same website and revision: any language, or an older scheme. */
function sameRevision(start, date, revision) {
  const d = day(date);
  const r = tag(revision);
  return new RegExp([
    `^${d}_${escapeRe(folderHost(start))}(_[A-Z]{2,3}(-[A-Z0-9]{2,8})?)?${r}$`, // since v1.9.3, language since v1.9.6
    `^${d}${r}_${escapeRe(folderHost(start))}$`, // Ref in front, hyphens (v1.9.1–v1.9.2)
    `^${d}${r}_${escapeRe(host(start))}$`, // Ref in front, dots (until v1.9.0)
  ].join('|'));
}

/** File name prefix, e.g. "20261107_xyz". */
export function filePrefix(start, date) {
  return `${day(date)}_${projectName(start)}`;
}

/** File name suffix after the kind of file, e.g. "_DE" or "_FR_Ref2". */
export function fileSuffix(lang = 'de', revision = 1) {
  return `_${langTag(lang)}${tag(revision)}`;
}

/**
 * Create the first free run folder below parent. Creation is atomic (mkdir without
 * "recursive"), so two checks started at once cannot share a folder.
 * @returns {Promise<{dir: string, prefix: string, suffix: string, revision: number}>}
 */
export async function createRunDir(parent, start, date = new Date(), lang = 'de') {
  for (let revision = 1; revision <= MAX_RUNS_PER_DAY; revision += 1) {
    const dir = path.resolve(parent, runDirName(start, date, revision, lang));
    const pattern = sameRevision(start, date, revision);
    const entries = await readdir(parent).catch(() => []);
    if (entries.some((name) => pattern.test(name))) continue;
    try {
      await mkdir(dir);
      return { dir, prefix: filePrefix(start, date), suffix: fileSuffix(lang, revision), revision };
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
  throw new Error(`More than ${MAX_RUNS_PER_DAY} checks of ${start.hostname} today.`);
}
