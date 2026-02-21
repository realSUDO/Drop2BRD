// Soft relevance filter - removes obvious noise
export function filterRelevant(chunks) {
  const businessKeywords = [
    "project", "requirement", "meeting", "decision", "timeline", "deadline",
    "budget", "stakeholder", "objective", "goal", "deliverable", "scope",
    "proposal", "approval", "schedule", "forecast", "plan", "strategy",
    "implementation", "development", "design", "feature", "functionality",
    "client", "customer", "vendor", "contract", "agreement", "policy"
  ];

  const noiseKeywords = [
    "test successful", "thanks", "thank you", "congrats", "happy birthday",
    "lunch", "dinner", "party", "vacation", "holiday", "joke", "lol"
  ];

  const filtered = [];
  const dropped = [];

  for (const chunk of chunks) {
    const text = chunk.text.toLowerCase();
    const wordCount = chunk.text.split(/\s+/).length;

    // Drop if too short
    if (wordCount < 10) {
      dropped.push({ reason: "too short", text: chunk.text.slice(0, 50) });
      continue;
    }

    // Drop if contains obvious noise
    const hasNoise = noiseKeywords.some(kw => text.includes(kw));
    if (hasNoise) {
      dropped.push({ reason: "noise keyword", text: chunk.text.slice(0, 50) });
      continue;
    }

    // Keep if has business keywords
    const hasSignal = businessKeywords.some(kw => text.includes(kw));
    if (hasSignal || wordCount > 30) {
      filtered.push(chunk);
    } else {
      dropped.push({ reason: "no business signal", text: chunk.text.slice(0, 50) });
    }
  }

  return { filtered, dropped };
}
