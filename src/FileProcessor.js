// src/FileProcessor.js
// ONE pdfjs import is enough – delete any duplicate lines.
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Point pdf.js at the worker that actually exists:
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import Tesseract from 'tesseract.js';

/* … rest of file unchanged … */

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(i => i.str).join(' ') + '\n';
  }
  return fullText;
}

export async function extractTextFromImage(file) {
  // Uses the default CDN worker & eng language data.
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: m => console.log('[OCR]', m)
  });
  return text;
}