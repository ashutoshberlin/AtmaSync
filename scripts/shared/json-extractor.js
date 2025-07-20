// Utility to extract JSON from a text block (handles ```json ... ``` and plain {...})
export function extractJsonFromText(text) {
  // Try to extract from ```json ... ```
  const matchBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (matchBlock && matchBlock[1]) {
    try {
      return JSON.parse(matchBlock[1]);
    } catch {}
  }
  // Fallback: extract from first balanced {...} block
  const matchFallback = text.match(/{[\s\S]*}/);
  if (matchFallback) {
    try {
      return JSON.parse(matchFallback[0]);
    } catch {}
  }
  return null;
}
