// Semantic chunking - break text into idea-level chunks
export function chunkText(normalizedData) {
  const chunks = [];
  let globalChunkId = 0;

  for (const item of normalizedData) {
    const { source, text } = item;
    const parentId = `${source}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Split by paragraphs (double newline or single newline)
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();

      // Split long paragraphs into sentence groups (2-3 sentences max)
      const sentences = para.split(/(?<=[.!?])\s+/);

      if (sentences.length <= 3) {
        // Short paragraph - keep as one chunk
        chunks.push({
          parentId,
          chunkId: `${parentId}_${globalChunkId++}`,
          source,
          text: para
        });
      } else {
        // Long paragraph - split into groups of 2-3 sentences
        for (let j = 0; j < sentences.length; j += 3) {
          const group = sentences.slice(j, j + 3).join(" ");
          if (group.trim().length > 0) {
            chunks.push({
              parentId,
              chunkId: `${parentId}_${globalChunkId++}`,
              source,
              text: group.trim()
            });
          }
        }
      }
    }
  }

  return chunks;
}
