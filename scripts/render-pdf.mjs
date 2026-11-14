#!/usr/bin/env node
// CLI: render a local HTML report to an A4 PDF with the bundled open-licence font
// (Source Sans 3, SIL OFL 1.1). With --paged, Paged.js lays out the pages so that
// the table of contents gets page numbers and every chapter can start on a new page.
// Usage: node scripts/render-pdf.mjs --in report.html --out report.pdf [--paged]

import { access, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { markAiAssisted } from './lib/pdf-ai-marking.mjs';
import { resolveNamedDestinations } from './lib/pdf-links.mjs';

const require = createRequire(import.meta.url);
const RENDER_TIMEOUT_MS = 120_000;
const FONT_DIR = path.dirname(require.resolve('@fontsource/source-sans-3/package.json'));
const PAGED_DIR = path.dirname(path.dirname(require.resolve('pagedjs')));
const PAGED_POLYFILL = path.join(PAGED_DIR, 'dist', 'paged.polyfill.js');
const FONT_FACES = [['400', 'normal'], ['400', 'italic'], ['600', 'normal'], ['700', 'normal']];

/** @font-face rules pointing at the local font files. */
export function fontCss() {
  return FONT_FACES.map(([weight, style]) => {
    const file = pathToFileURL(path.join(FONT_DIR, 'files', `source-sans-3-latin-${weight}-${style}.woff2`));
    return `@font-face{font-family:"Source Sans 3";font-style:${style};font-weight:${weight};src:url("${file}") format("woff2");}`;
  }).join('\n');
}

async function layoutWithPagedJs(page) {
  await page.evaluate(() => { window.PagedConfig = { auto: false }; });
  await page.addScriptTag({ path: PAGED_POLYFILL });
  await page.evaluate(async () => { await window.PagedPolyfill.preview(); });
}

/**
 * @param {string} htmlFile local HTML file
 * @param {string} pdfFile target PDF file
 * @param {{paged?: boolean}} [options]
 * @returns {Promise<number>} number of pages
 */
export async function renderPdf(htmlFile, pdfFile, { paged = false } = {}) {
  await access(htmlFile);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.resolve(htmlFile)).toString(), { waitUntil: 'load', timeout: RENDER_TIMEOUT_MS });
    await page.addStyleTag({ content: fontCss() });
    await page.evaluate(() => document.fonts.ready);
    if (paged) await layoutWithPagedJs(page);
    const raw = await page.pdf(paged
      ? { printBackground: true, preferCSSPageSize: true }
      : { format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '16mm', left: '14mm', right: '14mm' } });
    const pages = (raw.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    const { bytes } = await resolveNamedDestinations(raw);
    await writeFile(pdfFile, await markAiAssisted(bytes));
    return pages;
  } finally {
    await browser.close();
  }
}

async function main() {
  const { values } = parseArgs({ options: { in: { type: 'string' }, out: { type: 'string' }, paged: { type: 'boolean', default: false } } });
  if (!values.in || !values.out) {
    console.log('Usage: node scripts/render-pdf.mjs --in <report.html> --out <report.pdf> [--paged]');
    process.exit(2);
  }
  const pages = await renderPdf(values.in, values.out, { paged: values.paged });
  console.log(JSON.stringify({ pdf: path.resolve(values.out), pages }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).toString()) {
  main().catch((error) => {
    console.error(`PDF rendering failed: ${error.message}`);
    process.exit(1);
  });
}
