import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function generateBRDFromChunks(filteredChunks) {
  // Take fewer chunks to leave more room for output
  const sampleSize = Math.min(10, filteredChunks.length);
  const step = Math.floor(filteredChunks.length / sampleSize);
  const sampleChunks = [];
  
  for (let i = 0; i < sampleSize; i++) {
    const index = i * step;
    if (index < filteredChunks.length) {
      sampleChunks.push(filteredChunks[index]);
    }
  }
  
  console.log(`   📊 Sampled ${sampleChunks.length} chunks from ${filteredChunks.length} total`);
  const totalInputChars = sampleChunks.reduce((sum, c) => sum + c.text.length, 0);
  console.log(`   📝 Total input characters: ${totalInputChars}`);
  
//   const prompt = `You are a Senior Business Analyst producing an enterprise-grade
// Business Requirements Document (BRD) for internal and executive stakeholders.
//
// You will be given extracted, classified project information.
// The information may be incomplete, fragmented, or noisy.
//
// Your responsibility is to synthesize this into a clear, structured,
// and actionable BRD that supports business decision-making.
//
// ────────────────────────
// GLOBAL RULES (MANDATORY)
// ────────────────────────
// - Write in a professional, confident, and neutral business tone
// - NEVER describe the document itself (no phrases like "this document outlines")
// - NEVER quote or repeat the input verbatim
// - Infer missing details using realistic business assumptions
// - Clearly label all assumptions as assumptions
// - Prioritize business value and clarity over technical detail
// - Avoid generic or vague statements
// - No section may contain more than 10 bullet points
// - Use nested bullet points where they improve clarity
// - Output MUST be valid Markdown (.md)
//
// ────────────────────────
// REQUIRED STRUCTURE
// ────────────────────────
//
// ## 1. Executive Summary
// Provide a concise, executive-level summary that:
// - States the core business problem
// - Describes the proposed direction or solution
// - Highlights expected business outcomes
//
// Do NOT reference data sources, communications, or analysis steps.
//
// ## 2. Business Objectives
// List 3–6 concrete, outcome-oriented objectives.
// - Use action-driven language
// - Focus on measurable business impact
//
// ## 3. Stakeholders
// Present stakeholders in a Markdown table with the following columns:
// - Role
// - Responsibility
// - Level of Involvement
//
// Infer realistic roles where names are unavailable.
//
// ## 4. Scope
// ### In Scope
// Clearly define what the project will deliver.
// - Group related items using nested bullets where appropriate
//
// ### Out of Scope
// Explicitly state exclusions to prevent scope creep.
//
// ## 5. Functional Requirements
// List clear, testable requirements.
// - Each requirement MUST begin with "The system shall"
// - Focus on behavior, not implementation
// - Group related requirements using nested bullets if helpful
//
// ## 6. Non-Functional Requirements
// Define quality attributes, including but not limited to:
// - Performance
// - Usability
// - Scalability
// - Reliability
// Use precise, verifiable language.
//
// ## 7. Assumptions and Constraints
// ### Assumptions
// List assumptions that influence the solution design or scope.
//
// ### Constraints
// List known limitations such as time, budget, policy, or resources.
//
// ## 8. Risks and Mitigations
// Identify at least 3 realistic risks.
// For each risk:
// - Clearly describe the risk
// - Provide a practical mitigation strategy
//
// ## 9. Success Metrics
// Define measurable criteria that indicate success.
// - Prefer quantitative metrics where possible
//
// ## 10. High-Level Timeline
// Provide a phased delivery timeline.
// - Use logical phases (e.g., Discovery, Build, Validation, Rollout)
// - Durations may be inferred if not provided
//
// ────────────────────────
// INPUT DATA
// ────────────────────────
// ${sampleChunks.map(c => c.text).join('\n\n')}`;

const prompt = `You are a Senior Business Analyst producing an enterprise-grade
Business Requirements Document (BRD) for internal and executive stakeholders.

You will be given extracted, classified project information.
The information may be incomplete, fragmented, or noisy.

Your responsibility is to synthesize this information into a clear,
decision-oriented, and actionable BRD that enables executive approval
and downstream engineering execution.

────────────────────────
GLOBAL RULES (MANDATORY)
────────────────────────
- Write in a professional, confident, and neutral business tone
- Use decisive, outcome-oriented language (avoid descriptive narration)
- NEVER describe the document itself
  (e.g., no phrases like "this document outlines" or "this BRD describes")
- NEVER quote or repeat the input verbatim
- Infer missing details using realistic business assumptions
- Clearly label all assumptions as assumptions
- Prioritize business value and operational clarity over technical detail
- Avoid generic statements (each bullet must convey specific intent or impact)
- Optimize for executive scanability and clarity
- No section may contain more than 10 bullet points
- Use nested bullet points where they improve structure or readability
- Output MUST be valid Markdown (.md)

────────────────────────
REQUIRED STRUCTURE
────────────────────────

## 1. Executive Summary
Provide a concise, executive-level summary that:
- States the core business problem in concrete terms
- Describes the proposed direction or intervention
- Highlights expected business outcomes and value

Do NOT reference data sources, communications, or analysis steps.

## 2. Business Objectives
List 3–6 concrete, outcome-oriented objectives.
- Use action-driven, measurable language
- Focus on customer, operational, or financial impact

## 3. Stakeholders
Present stakeholders in a Markdown table with the following columns:
- Role
- Responsibility
- Level of Involvement

Infer realistic roles where names are unavailable.

## 4. Scope
### In Scope
Clearly define what the project will deliver.
- Group related items using nested bullets where appropriate

### Out of Scope
Explicitly state exclusions to prevent scope creep.

## 5. Functional Requirements
List clear, testable requirements.
- Each requirement MUST begin with "The system shall"
- Focus on observable behavior and business capability
- Avoid implementation or technology-specific language
- Group related requirements using nested bullets if helpful

## 6. Non-Functional Requirements
Define quality attributes using precise, verifiable language.
Include (where applicable):
- Performance
- Usability
- Scalability
- Reliability

## 7. Assumptions and Constraints
### Assumptions
List assumptions that influence solution design, scope, or feasibility.

### Constraints
List known limitations such as time, budget, policy, or resource constraints.

## 8. Risks and Mitigations
Identify at least 3 realistic risks.
For each risk:
- Clearly describe the risk
- Provide a practical, actionable mitigation strategy

## 9. Success Metrics
Define measurable criteria that indicate success.
- Prefer quantitative or observable metrics
- Align metrics to stated business objectives

## 10. High-Level Timeline
Provide a phased delivery timeline.
- Use logical phases (e.g., Discovery, Build, Validation, Rollout)
- Durations may be inferred if not explicitly provided

────────────────────────
INPUT DATA
────────────────────────
${sampleChunks.map(c => c.text).join('\n\n')}`

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
          maxOutputTokens: 20000,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    // Check finish reason
    const finishReason = data.candidates[0].finishReason;
    console.log(`   ℹ️  Finish reason: ${finishReason}`);
    
    if (finishReason === 'MAX_TOKENS') {
      console.log(`   ⚠️  Warning: Response was truncated due to token limit`);
    }

    const brd = data.candidates[0].content.parts[0].text;
    
    // Remove markdown code blocks if present
    return brd.replace(/```markdown\n?/g, '').replace(/```\n?/g, '').trim();
  } catch (error) {
    console.error("BRD generation error:", error.message);
    throw error;
  }
}
