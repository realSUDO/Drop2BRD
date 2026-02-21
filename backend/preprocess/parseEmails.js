import fs from "fs";
import csv from "csv-parser";

export function parseEmails(filePath, limit = 50) {
  return new Promise((resolve) => {
    const results = [];
    let count = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (count >= limit) return;

        const raw = row.message;

        // Remove email headers
        const body = raw.split("\n\n").slice(1).join("\n\n");

        if (body && body.trim().length > 20) {
          results.push({
            source: "email",
            text: body.trim(),
          });
          count++;
        }
      })
      .on("end", () => resolve(results));
  });
}
