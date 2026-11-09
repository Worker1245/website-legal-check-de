#!/usr/bin/env node
// CLI: build the requested PDFs (short and/or long report) and, on request, the prompt
// for AI coding agents from report.json. report.json lives in <run folder>/daten/; the
// results go to the run folder. No HTML files stay behind.
// Usage: node scripts/build-reports.mjs --data <run folder>/daten/report.json --prefix 20261107_xyz [--short] [--long [--ki-prompt | --ki-unknown] [--prompt-txt]] [--texts <translated.json>] [--suffix _DE]

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { prepareImages } from './lib/report/images.mjs';
import { renderKiPrompt } from './lib/report/ki-prompt.mjs';
import { renderKurzbericht } from './lib/report/kurzbericht.mjs';
import { renderLangfassung } from './lib/report/langfassung.mjs';
import { buildModel } from './lib/report/model.mjs';
import { renderPdf } from './render-pdf.mjs';
import { loadCustomTexts } from './translation.mjs';

const PREFIX_PATTERN = /^\d{8}_[\w.-]+$/;
// After the kind of file: language code and revision, e.g. "_DE" or "_FR_Ref2" (decisions 44a, 45a).
const SUFFIX_PATTERN = /^(_[A-Z]{2,3}(-[A-Z0-9]{2,8})?)?(_Ref\d+)?$/;
const DATA_DIR = 'daten';

/** Local time HH:MM of an ISO timestamp (time of the scan, shown after the date). */
export function scanTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Time of the scan from daten/scan.json, when report.json does not give one. */
async function timeFromScan(dataDir) {
  try {
    const scan = JSON.parse(await readFile(path.join(dataDir, 'scan.json'), 'utf8'));
    return scan.scannedAt ? scanTime(scan.scannedAt) : null;
  } catch {
    return null;
  }
}

/**
 * Time shown after the date: none if the user answered N to the time question,
 * otherwise report.json "time" or the time of the scan.
 */
export async function resolveTime(data, dataDir, showTime) {
  if (!showTime) return null;
  return data.time ?? await timeFromScan(dataDir);
}

/** Results go to the run folder: the parent of daten/, or the data folder itself. */
export function resultDir(dataFile) {
  const dir = path.dirname(path.resolve(dataFile));
  return path.basename(dir) === DATA_DIR ? path.dirname(dir) : dir;
}

/** Replace figure paths by shrunk data URIs and add rendered mock-ups as images. */
async function withImages(model, baseDir) {
  const browser = await chromium.launch();
  try {
    const { figures, mockups } = await prepareImages(browser, baseDir, model.findings);
    for (const f of model.findings) {
      f.figures = f.figures.map((fig) => ({ ...fig, src: figures.get(fig.src) }));
      if (f.mockup?.file) f.mockupImage = mockups.get(f.mockup.file);
    }
    return [...mockups.keys()].map((file) => path.resolve(baseDir, file));
  } finally {
    await browser.close();
  }
}

/**
 * Answer to the AI question: true (Y), false (N) or 'unknown' (U, decision 38a). With U the
 * detected system decides: a website builder or CMS means no prompt chapter, none detected
 * (probably custom-coded or built with AI) means the chapter; the decision becomes an assumption.
 * @param {boolean|'unknown'} kiPrompt
 * @param {{platform?: {name?: string} | null}} data
 * @param {object} t texts of the report language
 * @returns {{kiPrompt: boolean, assumption: object | null}}
 */
export function resolveKiPrompt(kiPrompt, data, t) {
  if (kiPrompt !== 'unknown') return { kiPrompt: Boolean(kiPrompt), assumption: null };
  const name = data.platform?.name;
  const a = t.aiUnknown;
  return {
    kiPrompt: !name,
    assumption: {
      question: a.question, assumption: name ? a.no : a.yes,
      evidence: name ? a.evidenceSystem(name) : a.evidenceNone,
      consequence: name ? a.consequenceNo : a.consequenceYes,
    },
  };
}

/**
 * @param {string} dataFile report.json (normally <run folder>/daten/report.json)
 * @param {string} prefix file name prefix, e.g. "20261107_xyz"
 * @param {{short?: boolean, long?: boolean, kiPrompt?: boolean|'unknown', promptFile?: boolean, showTime?: boolean, textsFile?: string, suffix?: string}} options answers to the Y/N questions
 *   (kiPrompt: chapter in the long report, 'unknown' lets the detected system decide; promptFile: the prompt also as text file, default true;
 *   showTime: time HH:MM after the date, default true; textsFile: translated text set from
 *   scripts/translation.mjs for a document language other than German or English; suffix: language code and revision after the kind of file, e.g. "_DE_Ref2")
 */
export async function buildReports(dataFile, prefix, { short = false, long = false, kiPrompt = false, promptFile: withFile = true, showTime = true, textsFile, suffix = '' } = {}) {
  if (!PREFIX_PATTERN.test(prefix)) throw new Error('--prefix must look like JJJJMMTT_<projekt>');
  if (!SUFFIX_PATTERN.test(suffix)) throw new Error('--suffix must look like _DE or _FR_Ref2');
  if (!short && !long) throw new Error('Neither short nor long report requested.');
  const data = JSON.parse(await readFile(dataFile, 'utf8'));
  const dataDir = path.dirname(path.resolve(dataFile));
  const custom = textsFile ? await loadCustomTexts(textsFile) : undefined;
  const model = buildModel({ ...data, time: await resolveTime(data, dataDir, showTime) }, custom);
  const ki = resolveKiPrompt(kiPrompt, data, model.t);
  if (ki.assumption && long) model.assumptions.push(ki.assumption);
  const outDir = resultDir(dataFile);
  const results = {};
  const work = await mkdtemp(path.join(tmpdir(), 'wlc-build-'));
  try {
    // Result keys stay fixed; file names follow the report language (decision 25a).
    const build = async (name, html) => {
      const htmlFile = path.join(work, `${name}.html`);
      const fileName = name === 'Kurzbericht' ? model.t.files.short : model.t.files.long;
      const pdfFile = path.join(outDir, `${prefix}_${fileName}${suffix}.pdf`);
      await writeFile(htmlFile, html);
      results[name] = { pdf: pdfFile, pages: await renderPdf(htmlFile, pdfFile, { paged: true }) };
    };
    if (short) await build('Kurzbericht', renderKurzbericht(model, { withLong: Boolean(long) }));
    if (long) {
      const mockupFiles = await withImages(model, dataDir);
      const promptFile = ki.kiPrompt && withFile ? `${prefix}_${model.t.files.prompt}${suffix}.txt` : undefined;
      if (promptFile) {
        await writeFile(path.join(outDir, promptFile), renderKiPrompt(model));
        results['KI-Prompt'] = { txt: path.join(outDir, promptFile) };
      }
      await build('Langfassung', renderLangfassung(model, { promptChapter: ki.kiPrompt, promptFile }));
      // Mock-up pages are only a source for the images in the PDF (decision 15a).
      await Promise.all(mockupFiles.map((file) => rm(file, { force: true })));
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
  return results;
}

async function main() {
  const { values } = parseArgs({
    options: {
      data: { type: 'string' }, prefix: { type: 'string' },
      short: { type: 'boolean', default: false }, long: { type: 'boolean', default: false },
      'ki-prompt': { type: 'boolean', default: false }, 'prompt-txt': { type: 'boolean', default: false }, 'no-time': { type: 'boolean', default: false },
      'ki-unknown': { type: 'boolean', default: false }, texts: { type: 'string' }, suffix: { type: 'string', default: '' },
    },
  });
  if (!values.data || !values.prefix || (!values.short && !values.long)) {
    console.log('Usage: node scripts/build-reports.mjs --data <daten/report.json> --prefix <JJJJMMTT_projekt> [--short] [--long [--ki-prompt | --ki-unknown] [--prompt-txt]] [--no-time] [--texts <translated.json>] [--suffix <_DE_Ref2>]');
    process.exit(2);
  }
  const options = { short: values.short, long: values.long, kiPrompt: values['ki-unknown'] ? 'unknown' : values['ki-prompt'], promptFile: values['prompt-txt'], showTime: !values['no-time'], textsFile: values.texts, suffix: values.suffix };
  console.log(JSON.stringify(await buildReports(values.data, values.prefix, options)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).toString()) {
  main().catch((error) => {
    console.error(`Building reports failed: ${error.message}`);
    process.exit(1);
  });
}
