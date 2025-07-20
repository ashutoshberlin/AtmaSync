// Unified persona prompt template for all providers

export function getUnifiedPersonaPrompt() {
  return `Hi! Please generate a structured JSON that represents my user persona based on our recent interactions. Use this format exactly and respond with **only the JSON block** (no explanation or text):\n\n{\n  "name": "",\n  "role": "",\n  "background": "",\n  "tone": "",\n  "learning_style": "",\n  "confidence_level": "",\n  "language": "",\n  "interests": [],\n  "goals": [],\n  "style_preferences": {\n    "response_format": "",\n    "response_length": "",\n    "likes_bullet_points": true,\n    "prefers_code_examples_in": ""\n  }\n}`;
}

// For backward compatibility, export for both ChatGPT and Claude
export const getChatGPTPersonaPrompt = getUnifiedPersonaPrompt;
export const getClaudePersonaPrompt = getUnifiedPersonaPrompt;
