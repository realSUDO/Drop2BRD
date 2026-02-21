import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function classifyChunk(chunk) {
  const prompt = `You are a business analyst.

Classify the following text into ONE category from:
- Requirement
- Decision
- Constraint
- Concern
- ActionItem
- Context
- NotRelevant

Return ONLY valid JSON in this format:
{
  "type": "",
  "summary": ""
}

Text:
"""${chunk.text}"""`;

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
          maxOutputTokens: 100,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { type: "NotRelevant", summary: "" };
    }

    const classification = JSON.parse(jsonMatch[0]);
    
    return {
      type: classification.type || "NotRelevant",
      summary: classification.summary || ""
    };
  } catch (error) {
    console.error("Classification error:", error.message);
    return { type: "NotRelevant", summary: "" };
  }
}
