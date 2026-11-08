// Keeps code, checklist, sources, text drafts and templates in sync.

import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFile(path.join(ROOT, file), 'utf8');

async function checkIdsInCode() {
  const dir = path.join(ROOT, 'scripts/lib/checks');
  const ids = new Set();
  for (const file of await readdir(dir)) {
    const source = await readFile(path.join(dir, file), 'utf8');
    for (const match of source.matchAll(/finding\('([A-Z]+-\d{2})'/g)) ids.add(match[1]);
    for (const match of source.matchAll(/linkOnEveryPage\(scan, '([A-Z]+-\d{2})'/g)) ids.add(match[1]);
  }
  return [...ids].sort();
}

test('every check ID used in code is described in the checklist', async () => {
  const checklist = await read('references/checklist.md');
  const missing = (await checkIdsInCode()).filter((id) => !checklist.includes(id));
  assert.deepEqual(missing, []);
});

test('every source ID cited in the checklist exists in sources.md', async () => {
  const checklist = await read('references/checklist.md');
  const sources = await read('references/sources.md');
  const cited = [...new Set([...checklist.matchAll(/SRC-\d{2,3}/g)].map((m) => m[0]))];
  assert.deepEqual(cited.filter((id) => !sources.includes(id)), []);
});

test('every text draft named in the checklist exists and carries the draft notice', async () => {
  const checklist = await read('references/checklist.md');
  const named = [...new Set([...checklist.matchAll(/([a-z-]+\.md)/g)].map((m) => m[1]))]
    .filter((name) => !['checklist.md', 'sources.md', 'mockup-components.md', 'pruefbericht.md', 'regelwerk.md', 'update.md', 'upcoming.md', 'report-json.md'].includes(name));
  const existing = await readdir(path.join(ROOT, 'templates/texte'));
  assert.deepEqual(named.filter((name) => !existing.includes(name)), []);
  for (const file of existing) {
    const text = await read(`templates/texte/${file}`);
    assert.ok(text.includes('Entwurf – keine Rechtsberatung, vor Veröffentlichung prüfen lassen'), `${file} lacks the draft notice`);
  }
});

test('report templates carry the legal-advice notice', async () => {
  assert.match(await read('templates/mockup.html'), /keine Rechtsberatung/i);
  const i18n = await read('scripts/lib/report/i18n.mjs');
  assert.match(i18n, /Keine Rechtsberatung/);
  assert.match(i18n, /Not legal advice/);
});
