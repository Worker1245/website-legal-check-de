// Machine-readable AI marking (Art. 50(2) AI Act, cautious reading): the report texts are
// written with Claude, so both PDFs say so in their document properties.

import { readFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const PACKAGE = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

/** Document properties that mark the PDF as created with AI assistance. */
export const AI_MARKING = {
  creator: `${PACKAGE.name} ${PACKAGE.version} with Claude (AI)`,
  keywords: ['AI-generated', 'KI-generiert', 'AI-assisted', 'Claude'],
};

/**
 * @param {Uint8Array} bytes finished PDF
 * @returns {Promise<Uint8Array>} the same PDF with creator and keywords naming the AI assistance
 */
export async function markAiAssisted(bytes) {
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  doc.setCreator(AI_MARKING.creator);
  doc.setKeywords(AI_MARKING.keywords);
  // Plain object layout, as in pdf-links.mjs; keep Chromium's producer and dates.
  return doc.save({ useObjectStreams: false, updateFieldAppearances: false });
}
