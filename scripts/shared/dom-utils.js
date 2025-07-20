// Utility: Find input box by selector
export function findInputBox(selector = 'div.ProseMirror[contenteditable="true"]') {
  return document.querySelector(selector);
}

// Utility: Simulate paste event
export function simulatePaste(inputBox, text) {
  if (!inputBox) return;
  const pasteEvent = new ClipboardEvent('paste', {
    clipboardData: new DataTransfer(),
    bubbles: true,
    cancelable: true
  });
  pasteEvent.clipboardData.setData('text/plain', text);
  inputBox.dispatchEvent(pasteEvent);
}

// Utility: Click send button or fallback to Enter
export function sendInput({ sendButtonSelector, inputBox }) {
  const sendButton = document.querySelector(sendButtonSelector);
  if (sendButton && !sendButton.disabled) {
    sendButton.click();
    return true;
  } else if (inputBox) {
    inputBox.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      bubbles: true
    }));
    return false;
  }
}

// Utility: Observe for JSON response in DOM
export function observeForJsonResponse({ responseSelector, onJson, extractJson }) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const responseBlock = mutation.target.querySelector(responseSelector);
      if (responseBlock && responseBlock.innerText.includes('{')) {
        const text = responseBlock.innerText.trim();
        try {
          const json = extractJson(text);
          if (json) {
            onJson(json);
            observer.disconnect();
          }
        } catch (err) {
          console.error('⚠️ Could not parse JSON:', err);
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
