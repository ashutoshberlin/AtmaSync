// content.js

function generatePrompt(brain) {
  const persona = brain.persona;
  const style = brain.style_preferences;
  const memory = brain.memory_snippets.map(m => `- ${m.title}: ${m.summary}`).join('\n');
  const goals = brain.goals.join(', ');
  const tips = brain.chat_context_hints.join(' ');

  return `You are talking to ${persona.name}, a ${persona.role}. Tone: ${persona.tone}. He prefers ${style.response_format} responses, typically ${style.response_length} in length. He values clarity, bullet points, and analogies.

His goals include: ${goals}.
Background: ${persona.background}.
Topics of interest: ${persona.interests.join(', ')}.

Previous work:
${memory}

Guidance: ${tips}`;
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        resolve(el);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error("Timeout: Element not found"));
      }
    }, 300);
  });
}

function loadBrain() {
  return new Promise(resolve => {
    chrome.storage.local.get(["userBrain"], (result) => {
      if (result.userBrain) {
        resolve(result.userBrain);
      } else {
        fetch(chrome.runtime.getURL("user-brain.json"))
          .then(resp => resp.json())
          .then(resolve);
      }
    });
  });
}

function injectPersonaIntoClaude() {
  chrome.storage.local.get('userBrain', (data) => {
    const brain = data.userBrain;

    if (!brain) {
      console.warn("⚠️ No user persona found in storage.");
      return;
    }

    const promptBox = document.querySelector('div.ProseMirror[contenteditable="true"]');

    if (!promptBox) {
      console.error("❌ Could not find Claude's prompt box.");
      return;
    }

    const prompt = `Here is my user persona to help you respond better. Store this context for this session:\n\n` +
      "```json\n" +
      JSON.stringify(brain, null, 2) +
      "\n```";

    promptBox.focus();

    // Simulate paste
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
      bubbles: true,
      cancelable: true
    });
    pasteEvent.clipboardData.setData('text/plain', prompt);
    promptBox.dispatchEvent(pasteEvent);

    console.log("✅ Injected persona into Claude.");
  });
}


// Start after delay to give page time to settle
setTimeout(() => {
  if (window.location.hostname.includes("claude.ai")) {
    injectPromptToClaude();
  }
}, 2000);
