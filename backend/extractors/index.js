import { extractTextFromCSV } from './csvExtractor.js';
import { extractTextFromPDF } from './pdfExtractor.js';

export async function extractText(filePath, fileType) {
  console.log(`📄 File type detected: ${fileType}`);

  if (fileType === 'csv') {
    console.log('📊 Getting CSV schema...');
    const texts = await extractTextFromCSV(filePath);
    console.log(`✓ Extracted ${texts.length} text entries from CSV`);
    return texts;
  }

  if (fileType === 'pdf') {
    console.log('📑 Extracting text from PDF...');
    const texts = await extractTextFromPDF(filePath);
    console.log(`✓ Extracted ${texts.length} paragraphs from PDF`);
    return texts;
  }

  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
    throw new Error('🖼️ Image support coming soon');
  }

  throw new Error(`❌ Unsupported file type: ${fileType}`);
}

export function detectFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  return ext;
}
