import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function classifyBatch(batch) {
  const prompt = `You are a business analyst.

Classify each item into ONE category:
Requirement, Decision, Constraint, Concern, ActionItem, Context, NotRelevant.

Return ONLY valid JSON array with this format:
[
  {"id": "...", "type": "...", "summary": "..."}
]

Items:
${batch.map((c, i) => `
${i + 1}. [id: ${c.chunkId}]
"""${c.text}"""
`).join('\n')}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1000,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON array from response (handle markdown code blocks)
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.split('```json')[1].split('```')[0];
    } else if (text.includes('```')) {
      jsonText = text.split('```')[1].split('```')[0];
    }
    
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response");
      return batch.map(c => ({ ...c, type: "NotRelevant", summary: "" }));
    }

    const classifications = JSON.parse(jsonMatch[0]);
    
    // Map back to chunks
    return batch.map(chunk => {
      const result = classifications.find(r => r.id === chunk.chunkId);
      return {
        ...chunk,
        type: result?.type || "NotRelevant",
        summary: result?.summary || ""
      };
    });
  } catch (error) {
    console.error("Batch classification error:", error.message);
    return batch.map(c => ({ ...c, type: "NotRelevant", summary: "" }));
  }
}
