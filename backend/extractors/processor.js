import { chunkText } from '../preprocess/chunkText.js';
import { filterRelevant } from '../preprocess/filterRelevant.js';

export function processExtractedTexts(texts, projectId, sourceType) {
  console.log('\n⏳ Step 1: Normalizing text...');
  
  // Normalize: convert to standard format
  const normalized = texts.map(text => ({
    source: sourceType,
    text: text.replace(/\s+/g, ' ').trim()
  }));
  
  console.log(`   ✓ Normalized ${normalized.length} text entries`);

  console.log('\n⏳ Step 2: Semantic chunking...');
  const chunks = chunkText(normalized);
  console.log(`   ✓ Created ${chunks.length} semantic chunks`);

  console.log('\n⏳ Step 3: Filtering noise...');
  const { filtered } = filterRelevant(chunks);
  console.log(`   ✓ Kept ${filtered.length} relevant chunks`);

  // Attach metadata
  const withMetadata = filtered.map(chunk => ({
    ...chunk,
    projectId,
    datasetId: `ds_${Date.now()}`,
    sourceType
  }));

  return withMetadata;
}
