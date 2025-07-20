import { findInputBox, simulatePaste, sendInput, observeForJsonResponse } from '../shared/dom-utils.js';
import { getChatGPTPersonaPrompt } from '../shared/persona-templates.js';
import { extractJsonFromText } from '../shared/json-extractor.js';
import { saveToUserBrain } from '../shared/save-to-user-brain.js';

function injectPersonaPrompt() {
  const inputBox = findInputBox();
  const prompt = getChatGPTPersonaPrompt();

  if (!inputBox) {
    console.error('❌ Could not find input box.');
    return;
  }

  inputBox.focus();
  simulatePaste(inputBox, prompt);

  setTimeout(() => {
    sendInput({ sendButtonSelector: '#composer-submit-button', inputBox });
  }, 700);
}

function waitForChatGPTResponse() {
  observeForJsonResponse({
    responseSelector: '.markdown',
    extractJson: extractJsonFromText,
    onJson: (json) => {
      saveToUserBrain(json, 'chatgpt');
      console.log('✅ Persona JSON saved from ChatGPT:', json);
    }
  });
}

injectPersonaPrompt();
waitForChatGPTResponse();

