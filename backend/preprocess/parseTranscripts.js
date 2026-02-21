import fs from "fs";
import csv from "csv-parser";

export function parseTranscripts(filePath, limit = 20) {
  return new Promise((resolve) => {
    const results = [];
    let count = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (count >= limit) return;

        const text = row.Transcript;

        if (text && text.length > 50) {
          results.push({
            source: "meeting",
            text: text.replace(/Speaker \d+:/g, "").trim(),
          });
          count++;
        }
      })
      .on("end", () => resolve(results));
  });
}
