// Gemini Persona Injector
// This script injects the user persona schema into Gemini's input box

import { findInputBox, simulatePaste, sendInput } from '../shared/dom-utils.js';

function injectPersonaIntoGemini() {
  chrome.storage.local.get('userBrain', (data) => {
    let brain = data.userBrain?.geminiPersona;
    let usedFallback = false;
    if (!brain) {
      console.warn('[GeminiInjector] ⚠️ No Gemini persona found in storage. Attempting to use ChatGPT persona as fallback.');
      brain = data.userBrain?.chatgptPersona;
      usedFallback = true;
    }
    if (!brain) {
      console.warn('[GeminiInjector] ⚠️ No persona (Gemini or ChatGPT) found in storage. Injection aborted.');
      return;
    }
    // Updated selector for Gemini's input box
    const promptBox = findInputBox('div.ql-editor[contenteditable="true"][aria-label="Enter a prompt here"]');
    if (!promptBox) {
      console.error('[GeminiInjector] ❌ Could not find Gemini\'s prompt box.');
      return;
    }
    // Format persona as JSON code block
    const prompt = `Here is my user persona to help you respond better. Store this context if there is something you do not know about me:\n\n\`\`\`json\n${JSON.stringify(brain, null, 2)}\n\`\`\``;
    promptBox.focus();
    simulatePaste(promptBox, prompt);
    setTimeout(() => {
      sendInput({ sendButtonSelector: 'button[aria-label="Send message"]', inputBox: promptBox });
    }, 500);
  });
}

injectPersonaIntoGemini(); 