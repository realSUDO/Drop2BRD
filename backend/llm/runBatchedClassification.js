import fs from "fs";
import { processData } from "../preprocess/index.js";
import { classifyBatch } from "./classifyBatch.js";

function batchArray(arr, size) {
  const batches = [];
  for (let i = 0; i < arr.length; i += size) {
    batches.push(arr.slice(i, i + size));
  }
  return batches;
}

async function runBatchedClassification() {
  console.log("🔄 Processing data...");
  const filteredChunks = await processData();
  console.log(`✅ Got ${filteredChunks.length} filtered chunks`);

  console.log("\n🧠 Starting BATCHED LLM classification...");
  console.log(`📦 Batch size: 5 chunks per request`);
  
  const batches = batchArray(filteredChunks, 5);
  console.log(`📊 Total batches: ${batches.length}`);
  console.log(`⏱️  Estimated time: ~${Math.ceil(batches.length * 12 / 60)} minutes\n`);

  const classifiedChunks = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    console.log(`[Batch ${i + 1}/${batches.length}] Classifying ${batch.length} chunks...`);
    
    const results = await classifyBatch(batch);
    classifiedChunks.push(...results);

    // Rate limit safety - 12 seconds = 5 RPM
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 12000));
    }
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
  Object.entries(summary).forEach(([type, count]) => {
    console.log(`   • ${type}: ${count}`);
  });
  
  console.log("\n🔍 Sample results:");
  classifiedChunks.slice(0, 3).forEach(c => {
    console.log(`   [${c.type}] ${c.summary}`);
  });
}

runBatchedClassification();
