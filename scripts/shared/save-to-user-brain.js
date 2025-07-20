// shared/user-brain-utils.js

function saveToUserBrain(persona, vendor) {
  if (!vendor) {
    console.error('❌ Vendor must be specified (e.g., chatgpt or claude)');
    return;
  }
  chrome.storage.local.get(["userBrain"], (data) => {
    const existing = data.userBrain || {};
    const updated = {
      ...existing,
      [`${vendor}Persona`]: persona,
      metadata: {
        ...existing.metadata,
        last_updated: new Date().toISOString()
      }
    };
    chrome.storage.local.set({ userBrain: updated }, () => {
      console.log(`✅ Persona for ${vendor} saved`);
    });
  });
}

export { saveToUserBrain };
