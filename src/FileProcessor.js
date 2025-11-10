//src/FileProcessor.js
//Minimal, stable setup for Vite + React

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

import Tesseract from 'tesseract.js';

export async function extractTextFromPDF(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  let out = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(it => it.str).join(' ');
    if (text.trim()) out += text + '\n';
  }
  return out.trim();
}

export async function extractTextFromImage(file) {
  const { data: { text } } = await Tesseract.recognize(file, 'eng', {
    logger: m => console.log('[OCR]', m),
  });
  return (text || '').trim();
}

//✅ Named export used by your UI
export async function extractText(file) {
  const name = (file.name || '').toLowerCase();
  const type = file.type || '';
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }
  if (type.startsWith('image/')) {
    return extractTextFromImage(file);
  }
  throw new Error('Unsupported file type. Please upload a PDF or an image.');
}
