import { findInputBox, simulatePaste, sendInput } from '../shared/dom-utils.js';

(async function injectToChatGPT() {
  const inputBox = findInputBox();
  if (!inputBox) {
    console.error('❌ ChatGPT input box not found.');
    return;
  }

  // Fetch Claude persona from chrome storage
  chrome.storage.local.get(['userBrain'], (result) => {
    const persona = result.userBrain?.claudePersona;
    if (!persona) {
      console.error('❌ No Claude persona found in storage.');
      return;
    }

    // Inject as plain JSON
    const personaText = `Here is my user persona to help you respond better. Store this context if there is something you do not know about me:\n\`\`\`json\n${JSON.stringify(persona, null, 2)}\n\`\`\``;

    inputBox.focus();
    simulatePaste(inputBox, personaText);

    // Wait briefly, then trigger send
    setTimeout(() => {
      sendInput({ sendButtonSelector: 'button[data-testid="send-button"]', inputBox });
      console.log('✅ Claude persona injected into ChatGPT');
    }, 600);
  });
})();
