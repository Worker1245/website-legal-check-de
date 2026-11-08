// Chromium writes internal links as named destinations (catalog /Dests). Some viewers,
// e.g. macOS Preview, do not follow those reliably, so every internal link is rewritten
// to jump to its explicit page position.

import { PDFArray, PDFDict, PDFDocument, PDFName } from 'pdf-lib';

function explicitTarget(dests, name) {
  const target = dests.lookup(name);
  if (target instanceof PDFArray) return target;
  if (target instanceof PDFDict) return target.lookup(PDFName.of('D'), PDFArray);
  return undefined;
}

/**
 * @param {Uint8Array} bytes PDF from Chromium
 * @returns {Promise<{bytes: Uint8Array, resolved: number}>}
 */
export async function resolveNamedDestinations(bytes) {
  const doc = await PDFDocument.load(bytes);
  const dests = doc.catalog.lookupMaybe(PDFName.of('Dests'), PDFDict);
  if (!dests) return { bytes, resolved: 0 };
  let resolved = 0;
  for (const page of doc.getPages()) {
    const annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    for (let i = 0; i < (annots?.size() ?? 0); i += 1) {
      const annot = annots.lookup(i, PDFDict);
      const dest = annot.lookup(PDFName.of('Dest'));
      if (!(dest instanceof PDFName)) continue;
      const target = explicitTarget(dests, dest);
      if (!target) continue;
      annot.set(PDFName.of('Dest'), target);
      resolved += 1;
    }
  }
  // Plain object layout (no object streams) keeps the file readable for older viewers and checks.
  return { bytes: await doc.save({ useObjectStreams: false }), resolved };
}
