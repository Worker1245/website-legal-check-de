// PDFs name the skill with a clickable GitHub link; internal links jump to explicit pages
// (named destinations are not followed by every PDF viewer).

import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { PDFArray, PDFDocument, PDFName } from 'pdf-lib';
import { buildReports } from '../scripts/build-reports.mjs';

const REPO = 'https://github.com/Dario-Lanz/website-legal-check-de';
const data = {
  site: 'example.de', date: '07.11.2026', pagesScanned: 3, checklistStatus: '07.11.2026',
  findings: [{ prio: 1, kind: 'gap', title: 'T', what: 'W', where: '/x/', law: '§ 25 TDDDG', fix: 'F', evidence: 'E' }],
};

async function links(pdfFile) {
  const doc = await PDFDocument.load(await readFile(pdfFile));
  const all = [];
  for (const page of doc.getPages()) {
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i += 1) {
      const annot = annots.lookup(i);
      const action = annot.lookup(PDFName.of('A'));
      all.push({ dest: annot.lookup(PDFName.of('Dest')), uri: action?.lookup?.(PDFName.of('URI'))?.decodeText?.() ?? action?.lookup?.(PDFName.of('URI'))?.asString?.() });
    }
  }
  return all;
}

test('both PDFs name the skill with a clickable GitHub link; long report links are explicit', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'wlc-links-'));
  try {
    const file = path.join(dir, 'report.json');
    await writeFile(file, JSON.stringify(data));
    const result = await buildReports(file, '20261107_example', { short: true, long: true });
    for (const name of ['Kurzbericht', 'Langfassung']) {
      const all = await links(result[name].pdf);
      assert.ok(all.some((l) => l.uri === REPO), `${name}: GitHub link`);
    }
    const internal = (await links(result.Langfassung.pdf)).filter((l) => l.dest);
    assert.ok(internal.length >= 8, 'table of contents and lists have links');
    assert.ok(internal.every((l) => l.dest instanceof PDFArray), 'every internal link points to an explicit page');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
