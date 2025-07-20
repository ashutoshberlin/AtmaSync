import { findInputBox, simulatePaste, sendInput } from '../shared/dom-utils.js';

function injectPersonaIntoClaude() {
  chrome.storage.local.get('userBrain', (data) => {
    const brain = data.userBrain?.chatgptPersona;
    if (!brain) {
      console.warn('⚠️ No ChatGPT persona found in storage.');
      return;
    }

    const promptBox = findInputBox();
    if (!promptBox) {
      console.error('❌ Could not find Claude\'s prompt box.');
      return;
    }

    // Use the same persona format as Claude expects
    const prompt = `Here is my user persona to help you respond better. Store this context if there is something you do not know about me:\n\n\`\`\`json\n${JSON.stringify(brain, null, 2)}\n\`\`\``;

    promptBox.focus();
    simulatePaste(promptBox, prompt);

    setTimeout(() => {
      sendInput({ sendButtonSelector: 'button[data-testid="send-button"]', inputBox: promptBox });
    }, 500);
  });
}

injectPersonaIntoClaude();
