// Images for the long report: evidence screenshots are shrunk to a readable JPEG and
// cropped to the visible area; mock-up pages are rendered to images. Everything is
// embedded as data URI, so no HTML or image files are left next to the PDFs (15a, 19a).

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const IMAGE_WIDTH = 1000;
const JPEG_QUALITY = 0.7;
const VIEWPORT_RATIO = 900 / 1366; // height/width of the scanner viewport
const MOCKUP_VIEWPORT = { width: 1200, height: 800 };

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

/**
 * Shrink one image in the browser: width IMAGE_WIDTH at most, height cropped to the
 * viewport ratio when crop is set (full-page screenshots show only the visible part).
 * @param {import('playwright').Page} page
 * @param {Buffer} bytes
 * @param {string} mime
 * @param {boolean} crop
 * @returns {Promise<string>} JPEG data URI
 */
async function shrink(page, bytes, mime, crop) {
  const source = `data:${mime};base64,${bytes.toString('base64')}`;
  return page.evaluate(async ({ source, width, ratio, quality, crop }) => {
    const img = new Image();
    img.src = source;
    await img.decode();
    const scale = Math.min(1, width / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const fullH = Math.round(img.naturalHeight * scale);
    const h = crop ? Math.min(fullH, Math.round(w * ratio)) : fullH;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, Math.round(img.naturalHeight * scale));
    return canvas.toDataURL('image/jpeg', quality);
  }, { source, width: IMAGE_WIDTH, ratio: VIEWPORT_RATIO, quality: JPEG_QUALITY, crop });
}

/**
 * @param {import('playwright').Browser} browser
 * @param {string} baseDir folder that figure and mock-up paths are relative to
 * @param {{figures: {src: string}[], mockup?: {file: string}}[]} findings
 * @returns {Promise<{figures: Map<string, string>, mockups: Map<string, string>}>} path -> data URI
 */
export async function prepareImages(browser, baseDir, findings) {
  const page = await browser.newPage();
  const figures = new Map();
  const mockups = new Map();
  try {
    for (const src of new Set(findings.flatMap((f) => f.figures.map((fig) => fig.src)))) {
      const file = path.resolve(baseDir, src);
      const mime = MIME[path.extname(file).toLowerCase()];
      if (!mime) throw new Error(`Unsupported image type: ${src}`);
      figures.set(src, await shrink(page, await readFile(file), mime, true));
    }
    for (const f of findings.filter((x) => x.mockup?.file)) {
      const view = await browser.newPage({ viewport: MOCKUP_VIEWPORT });
      try {
        await view.goto(pathToFileURL(path.resolve(baseDir, f.mockup.file)).toString(), { waitUntil: 'load' });
        mockups.set(f.mockup.file, await shrink(page, await view.screenshot({ fullPage: true }), 'image/png', false));
      } finally {
        await view.close();
      }
    }
  } finally {
    await page.close();
  }
  return { figures, mockups };
}
