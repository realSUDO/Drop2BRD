import fs from "fs";
import { processData } from "../preprocess/index.js";
import { classifyChunk } from "./classifyChunk.js";

async function runClassification() {
  console.log("🔄 Processing data...");
  const filteredChunks = await processData();
  console.log(`✅ Got ${filteredChunks.length} filtered chunks`);

  console.log("\n🧠 Starting LLM classification...");
  const classifiedChunks = [];

  for (let i = 0; i < filteredChunks.length; i++) {
    const chunk = filteredChunks[i];
    
    console.log(`[${i + 1}/${filteredChunks.length}] Classifying chunk ${chunk.chunkId.slice(0, 20)}...`);
    
    const classification = await classifyChunk(chunk);
    
    classifiedChunks.push({
      ...chunk,
      ...classification
    });

    // Rate limit safety - 15 seconds delay (free tier: 5 requests/min)
    await new Promise(r => setTimeout(r, 15000));
  }

  // Save results
  const outputPath = "./data/classifiedChunks.json";
  fs.writeFileSync(outputPath, JSON.stringify(classifiedChunks, null, 2));
  
  console.log(`\n✅ Saved ${classifiedChunks.length} classified chunks to ${outputPath}`);
  
  // Show summary
  const summary = classifiedChunks.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log("\n📊 Classification Summary:");
  console.log(summary);
  
  console.log("\n🔍 Sample results:");
  console.log(classifiedChunks.slice(0, 3).map(c => ({
    type: c.type,
    summary: c.summary,
    text: c.text.slice(0, 60) + "..."
  })));
}

runClassification();
