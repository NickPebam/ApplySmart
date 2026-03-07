import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

// Accepts a buffer + original filename instead of a file path
export const parseResume = async (buffer, originalName) => {
  try {
    const lower = originalName.toLowerCase();
    let text = '';

    if (lower.endsWith('.pdf')) {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
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