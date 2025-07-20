import { findInputBox, simulatePaste, sendInput } from '../shared/dom-utils.js';
import { getClaudePersonaPrompt } from '../shared/persona-templates.js';
import { extractJsonFromText } from '../shared/json-extractor.js';
import { saveToUserBrain } from '../shared/save-to-user-brain.js';

function fetchClaudePersona() {
  const inputBox = findInputBox();
  const personaPrompt = getClaudePersonaPrompt();

  if (!inputBox) {
    console.error('❌ Claude input or send button not found.');
    return;
  }

  inputBox.focus();
  simulatePaste(inputBox, personaPrompt);

  setTimeout(() => {
    sendInput({ sendButtonSelector: 'button[data-testid="send-button"]', inputBox });
  }, 500);
}

function isValidPersona(obj) {
  if (!obj || typeof obj !== 'object') {
    console.log('[ClaudePersona][isValidPersona] Not an object:', obj);
    return false;
  }
  // Must have at least these keys
  const required = ['name', 'role', 'background', 'goals', 'style_preferences'];
  for (const key of required) {
    if (!(key in obj)) {
      console.log(`[ClaudePersona][isValidPersona] Missing key: ${key}`);
      return false;
    }
  }
  // Skip fallback
  if (obj.name === 'New User' || obj.background === 'No interaction history available') {
    console.log('[ClaudePersona][isValidPersona] Fallback persona detected, skipping:', obj);
    return false;
  }
  return true;
}

function waitForClaudeResponseAndStore() {
  let lastValidPersona = null;
  let saveTimeout = null;
  const observer = new MutationObserver((mutations) => {
    let found = false;
    console.log('[ClaudePersona][Observer] Mutation observed:', mutations);
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (!(addedNode instanceof HTMLElement)) continue;
        console.log('[ClaudePersona][Observer] Scanning added node:', addedNode);
        // Scan all descendant elements for text containing '{'
        const allDescendants = addedNode.querySelectorAll('*');
        for (const el of allDescendants) {
          const text = el.innerText?.trim();
          if (!text) continue;
          if (!text.includes('{')) {
            console.log('[ClaudePersona][Observer] Skipping element (no JSON):', el);
            continue;
          }
          console.log('[ClaudePersona][Observer] Found text with \'{\':', text);
          // Try to extract JSON from any text block
          const parsed = extractJsonFromText(text);
          console.log('[ClaudePersona][Observer] Extraction attempt result:', parsed);
          if (isValidPersona(parsed)) {
            lastValidPersona = parsed;
            found = true;
            console.log('[ClaudePersona] Found valid persona candidate:', parsed);
          } else {
            console.log('[ClaudePersona][Observer] Not a valid persona:', parsed);
          }
        }
        // Also check the addedNode itself
        const selfText = addedNode.innerText?.trim();
        if (selfText && selfText.includes('{')) {
          console.log('[ClaudePersona][Observer] Checking addedNode self text:', selfText);
          const parsed = extractJsonFromText(selfText);
          console.log('[ClaudePersona][Observer] Extraction attempt result (self):', parsed);
          if (isValidPersona(parsed)) {
            lastValidPersona = parsed;
            found = true;
            console.log('[ClaudePersona] Found valid persona candidate (self):', parsed);
          } else {
            console.log('[ClaudePersona][Observer] Not a valid persona (self):', parsed);
          }
        }
      }
    }
    if (found) {
      if (saveTimeout) clearTimeout(saveTimeout);
      // Wait 2s after last mutation before saving
      saveTimeout = setTimeout(() => {
        if (lastValidPersona) {
          console.log('[ClaudePersona] Saving persona to user brain:', lastValidPersona);
          saveToUserBrain(lastValidPersona, 'claude');
          observer.disconnect();
          console.log('✅ Persona saved from Claude:', lastValidPersona);
        } else {
          console.log('[ClaudePersona] No valid persona to save after timeout.');
        }
      }, 2000);
    } else {
      console.log('[ClaudePersona][Observer] No valid persona found in this mutation batch.');
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('[ClaudePersona][Observer] Started observing DOM mutations for persona extraction.');
}

fetchClaudePersona();
waitForClaudeResponseAndStore();
