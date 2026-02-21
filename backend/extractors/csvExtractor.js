import fs from 'fs';
import csv from 'csv-parser';

export function extractTextFromCSV(filePath) {
  return new Promise((resolve) => {
    const texts = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Schema-agnostic: combine all column values
        const combined = Object.values(row)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (combined.length > 50) {
          texts.push(combined);
        }
      })
      .on('end', () => resolve(texts));
  });
}
