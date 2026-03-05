import fs from 'fs/promises';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse'); // WORKS in v1.1.1

export const parseResume = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    const lower = filePath.toLowerCase();
    let text = '';

    if (lower.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      text = data.text;
    } 
    else if (lower.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } 
    else {
      throw new Error('Unsupported file format. Upload PDF or DOCX only.');
    }

    text = text.trim();

    if (!text || text.length < 10) {
      throw new Error('No readable text found (scanned or empty file).');
    }

    return text;
  } catch (err) {
    console.error('Resume parse error:', err);
    throw new Error(`Failed to parse resume: ${err.message}`);
  }
};