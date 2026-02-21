import { parseEmails } from "./parseEmails.js";
import { parseTranscripts } from "./parseTranscripts.js";
import { chunkText } from "./chunkText.js";
import { filterRelevant } from "./filterRelevant.js";

export async function processData() {
  // Step 1: Normalize
  const emails = await parseEmails("../Dataset/emails_sample.csv");
  const meetings = await parseTranscripts("../Dataset/transcripts.csv");
  const combined = [...emails, ...meetings];

  // Step 2: Semantic Chunking
  const chunks = chunkText(combined);

  // Step 3: Soft Filter
  const { filtered } = filterRelevant(chunks);

  return filtered;
}

// CLI mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await processData();
  console.log("Total chunks:", result.length);
  console.log("Sample:", result.slice(0, 2));
}
