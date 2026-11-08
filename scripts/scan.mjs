#!/usr/bin/env node
// CLI: scan a website and write scan.json, findings.json and evidence screenshots.
// Usage: node scripts/scan.mjs --url www.example.de --parent <folder> [--max-extra 20] [--no-deep]
//   --parent creates a new run folder JJJJMMTT_<website> (later the same day JJJJMMTT_<website>_RefN) in <folder>;
//   --out <folder> writes into an exact folder instead.

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { runChecks } from './lib/checks/index.mjs';
import { createRunDir, filePrefix, fileSuffix, LANG_CODE } from './lib/run-dir.mjs';
import { findPreviousScan } from './lib/reuse.mjs';
import { DEFAULTS, scanSite } from './lib/scanner.mjs';
import { normalizeStartUrl } from './lib/url.mjs';

const DATA_DIR = 'daten';

const USAGE = [
  'Usage: node scripts/scan.mjs --url <website> (--parent <folder> | --out <folder>) [--max-extra <n>] [--no-deep] [--reuse <earlier run folder>] [--lang <document language, e.g. de>]',
  '       node scripts/scan.mjs --url <website> --parent <folder> --find-previous',
].join('\n');

function parseOptions() {
  const { values } = parseArgs({
    options: {
      url: { type: 'string' }, out: { type: 'string' }, parent: { type: 'string' },
      'max-extra': { type: 'string' }, 'no-deep': { type: 'boolean', default: false },
      reuse: { type: 'string' }, 'find-previous': { type: 'boolean', default: false }, lang: { type: 'string', default: 'de' },
      help: { type: 'boolean', default: false },
    },
  });
  const needsTarget = !values['find-previous'];
  if (values.help || !values.url || (needsTarget && Boolean(values.out) === Boolean(values.parent))) {
    console.log(USAGE);
    process.exit(values.help ? 0 : 2);
  }
  const maxExtra = values['max-extra'] === undefined ? DEFAULTS.maxExtraPages : Number(values['max-extra']);
  if (!Number.isInteger(maxExtra) || maxExtra < 0 || maxExtra > 200) {
    console.error('--max-extra must be an integer between 0 and 200');
    process.exit(2);
  }
  if (!LANG_CODE.test(values.lang)) {
    console.error('--lang must be an ISO 639-1 code such as de, en or fr');
    process.exit(2);
  }
  return {
    startUrl: values.url, out: values.out, parent: values.parent, maxExtraPages: maxExtra, deep: !values['no-deep'],
    reuseFrom: values.reuse ? path.resolve(values.reuse) : undefined, findPrevious: values['find-previous'], lang: values.lang,
  };
}

async function main() {
  const { out, parent, findPrevious, lang, ...options } = parseOptions();
  if (findPrevious) {
    // Only reports the candidate; the skill asks the user before reusing it (decision 31b).
    console.log(JSON.stringify({ previous: await findPreviousScan(path.resolve(parent ?? '.'), normalizeStartUrl(options.startUrl)) }));
    return;
  }
  const start = normalizeStartUrl(options.startUrl);
  const run = out
    ? { dir: path.resolve(out), prefix: filePrefix(start, new Date()), suffix: fileSuffix(lang) }
    : await createRunDir(path.resolve(parent), start, new Date(), lang);
  const runDir = run.dir;
  // Raw data and evidence go to daten/; the run folder itself only holds the PDFs and the prompt.
  options.outDir = path.join(runDir, DATA_DIR);
  const scan = await scanSite({ ...options, log: (msg) => console.error(msg) });
  const checks = runChecks(scan);
  await writeFile(path.join(options.outDir, 'findings.json'), JSON.stringify(checks, null, 2));
  const counts = checks.findings.reduce((acc, f) => ({ ...acc, [f.status]: (acc[f.status] ?? 0) + 1 }), {});
  console.log(JSON.stringify({
    runDir, dataDir: options.outDir, filePrefix: run.prefix, fileSuffix: run.suffix, pagesScanned: checks.siteProfile.pagesScanned,
    deepCheck: scan.deepCheck.decision ?? 'skipped', reuse: scan.reuse, counts,
  }));
}

main().catch((error) => {
  console.error(`Scan failed: ${error.message}`);
  process.exit(1);
});
