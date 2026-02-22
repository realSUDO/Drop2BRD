import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

export async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse();
  const data = await parser.parse(dataBuffer);

  return data.text
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 50);
}
