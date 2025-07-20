// Global variables
let currentPersona = null;
let currentVendor = null;
let personaHistory = [];

// UI Helper Functions
function updateStatus(message, type = 'idle') {
  const statusEl = document.getElementById('status');
  const statusText = statusEl.querySelector('.status-text');
  const statusIcon = statusEl.querySelector('.icon');

  // Remove all status classes
  statusEl.classList.remove('idle', 'loading', 'success', 'error');
  statusEl.classList.add(type);

  // Update icon based on type
  const icons = {
    idle: 'icons/idle.png',
    loading: 'icons/loading.png',
    success: 'icons/success.png',
    error: 'icons/error.png'
  };

  // Update icon to use image instead of emoji
  statusIcon.innerHTML = `<img src="${icons[type] || icons.idle}" alt="${type} status" style="width: 16px; height: 16px; vertical-align: middle;">`;

  statusText.textContent = message;
}

function setButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

function showProgress(show = true) {
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');

  if (show) {
    progressBar.classList.add('show');
    progressFill.style.width = '0%';
    // Animate progress
    setTimeout(() => progressFill.style.width = '30%', 100);
    setTimeout(() => progressFill.style.width = '60%', 500);
    setTimeout(() => progressFill.style.width = '90%', 1000);
  } else {
    progressBar.classList.remove('show');
    progressFill.style.width = '0%';
  }
}

function updateVendorInfo(vendor) {
  const vendorInfo = document.getElementById('vendor-info');
  const vendorName = document.getElementById('vendor-name');

  if (vendor && vendor !== 'unknown') {
    vendorName.textContent = vendor.charAt(0).toUpperCase() + vendor.slice(1);
    vendorInfo.style.display = 'block';
  } else {
    vendorInfo.style.display = 'none';
  }
  setFetchButtonsEnabled(true, vendor);
}

function setFetchButtonsEnabled(enabled, vendor) {
  const fetchBtn = document.getElementById('generate-persona');
  const quickFetchBtn = document.getElementById('quick-generate');
  const injectBtn = document.getElementById('inject-persona');
  const quickInjectBtn = document.getElementById('quick-inject');
  if (vendor === 'claude') {
    fetchBtn.disabled = true;
    fetchBtn.classList.add('disabled');
    fetchBtn.querySelector('.btn-text').textContent = 'Fetch Not Supported';
    quickFetchBtn.disabled = true;
    quickFetchBtn.classList.add('disabled');
    quickFetchBtn.querySelector('.btn-text').textContent = 'Fetch Not Supported';
    injectBtn.disabled = false;
    injectBtn.classList.remove('disabled');
    injectBtn.querySelector('.btn-text').textContent = 'Inject Persona';
    quickInjectBtn.disabled = false;
    quickInjectBtn.classList.remove('disabled');
    quickInjectBtn.querySelector('.btn-text').textContent = 'Quick Inject';
  } else if (vendor === 'gemini') {
    fetchBtn.disabled = true;
    fetchBtn.classList.add('disabled');
    fetchBtn.querySelector('.btn-text').textContent = 'Not Supported';
    quickFetchBtn.disabled = true;
    quickFetchBtn.classList.add('disabled');
    quickFetchBtn.querySelector('.btn-text').textContent = 'Not Supported';
    injectBtn.disabled = true;
    injectBtn.classList.add('disabled');
    injectBtn.querySelector('.btn-text').textContent = 'Not Supported';
    quickInjectBtn.disabled = true;
    quickInjectBtn.classList.add('disabled');
    quickInjectBtn.querySelector('.btn-text').textContent = 'Not Supported';
    updateStatus('Not supported for Gemini yet. Coming soon.', 'idle');
  } else {
    fetchBtn.disabled = !enabled;
    fetchBtn.classList.remove('disabled');
    fetchBtn.querySelector('.btn-text').textContent = 'Generate Persona';
    quickFetchBtn.disabled = !enabled;
    quickFetchBtn.classList.remove('disabled');
    quickFetchBtn.querySelector('.btn-text').textContent = 'Quick Generate';
    injectBtn.disabled = !enabled;
    injectBtn.classList.remove('disabled');
    injectBtn.querySelector('.btn-text').textContent = 'Inject Persona';
    quickInjectBtn.disabled = !enabled;
    quickInjectBtn.classList.remove('disabled');
    quickInjectBtn.querySelector('.btn-text').textContent = 'Quick Inject';
  }
}

// URL Validation Function
function isRestrictedURL(url) {
  const restrictedProtocols = ['chrome://', 'chrome-extension://', 'moz-extension://', 'edge://', 'about:', 'data:', 'file://'];
  return restrictedProtocols.some(protocol => url.startsWith(protocol));
}

function canExecuteScript(tab) {
  if (!tab || !tab.url) {
    return false;
  }

  if (isRestrictedURL(tab.url)) {
    return false;
  }

  return true;
}

// Modal Functions
function showModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function showPersonaPreview(persona, vendor) {
  currentPersona = persona;
  currentVendor = vendor;

  const previewContent = document.getElementById('persona-preview-content');
  previewContent.innerHTML = `
    <div style="margin-bottom: 10px;">
      <strong style="color: #FFC107;">Name:</strong> ${persona.name || 'Not specified'}
    </div>
    <div style="margin-bottom: 10px;">
      <strong style="color: #FFC107;">Role:</strong> ${persona.role || 'Not specified'}
    </div>
    <div style="margin-bottom: 10px;">
      <strong style="color: #FFC107;">Background:</strong> ${persona.background || 'Not specified'}
    </div>
    <div style="margin-bottom: 10px;">
      <strong style="color: #FFC107;">Communication Style:</strong> ${persona.communicationStyle || 'Not specified'}
    </div>
    <div style="margin-bottom: 10px;">
      <strong style="color: #FFC107;">Expertise:</strong> ${persona.expertise || 'Not specified'}
    </div>
    <div style="margin-bottom: 10px;">
      <strong style="color: #FFC107;">Goals:</strong> ${persona.goals || 'Not specified'}
    </div>
  `;

  showModal('preview-modal');
}

function showEditPersona(persona) {
  document.getElementById('edit-name').value = persona.name || '';
  document.getElementById('edit-role').value = persona.role || '';
  document.getElementById('edit-background').value = persona.background || '';
  document.getElementById('edit-tone').value = persona.tone || '';
  document.getElementById('edit-learning-style').value = persona.learning_style || '';
  document.getElementById('edit-confidence-level').value = persona.confidence_level || '';
  document.getElementById('edit-language').value = persona.language || '';
  document.getElementById('edit-interests').value = Array.isArray(persona.interests) ? persona.interests.join(', ') : '';
  document.getElementById('edit-goals').value = Array.isArray(persona.goals) ? persona.goals.join(', ') : '';
  // Style preferences
  const style = persona.style_preferences || {};
  document.getElementById('edit-style-response-format').value = style.response_format || '';
  document.getElementById('edit-style-response-length').value = style.response_length || '';
  document.getElementById('edit-style-likes-bullet-points').value = String(style.likes_bullet_points ?? 'true');
  document.getElementById('edit-style-prefers-code-examples-in').value = style.prefers_code_examples_in || '';
  hideModal('preview-modal');
  showModal('edit-modal');
}

function saveEditedPersona() {
  const editedPersona = {
    name: document.getElementById('edit-name').value,
    role: document.getElementById('edit-role').value,
    background: document.getElementById('edit-background').value,
    tone: document.getElementById('edit-tone').value,
    learning_style: document.getElementById('edit-learning-style').value,
    confidence_level: document.getElementById('edit-confidence-level').value,
    language: document.getElementById('edit-language').value,
    interests: document.getElementById('edit-interests').value.split(',').map(s => s.trim()).filter(Boolean),
    goals: document.getElementById('edit-goals').value.split(',').map(s => s.trim()).filter(Boolean),
    style_preferences: {
      response_format: document.getElementById('edit-style-response-format').value,
      response_length: document.getElementById('edit-style-response-length').value,
      likes_bullet_points: document.getElementById('edit-style-likes-bullet-points').value === 'true',
      prefers_code_examples_in: document.getElementById('edit-style-prefers-code-examples-in').value
    }
  };
  // Save to storage
  chrome.storage.local.get(['userBrain'], (result) => {
    const userBrain = result.userBrain || {};
    userBrain[currentVendor] = editedPersona;
    chrome.storage.local.set({ userBrain }, () => {
      hideModal('edit-modal');
      updateStatus('Persona updated successfully!', 'success');
      loadPersonaHistory();
      setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
    });
  });
}

// History Functions
function loadPersonaHistory() {
  chrome.storage.local.get(['personaHistory'], (result) => {
    personaHistory = result.personaHistory || [];
    displayPersonaHistory();
  });
}

function displayPersonaHistory() {
  const historyContainer = document.getElementById('history-container');
  if (personaHistory.length === 0) {
    historyContainer.innerHTML = '<div style="text-align: center; opacity: 0.7; padding: 20px;">No persona history yet</div>';
    return;
  }
  historyContainer.innerHTML = personaHistory.map((item, index) => {
    const d = new Date(item.timestamp);
    const dateStr = d.toLocaleDateString();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `
      <div class="history-item">
        <div class="history-item-header">
          <span class="history-vendor">${item.vendor.charAt(0).toUpperCase() + item.vendor.slice(1)}</span>
          <span class="history-date">${dateStr} ${timeStr}</span>
        </div>
        <div style="font-size: 11px; opacity: 0.8; margin-bottom: 8px;">
          ${item.persona.name || 'Unnamed Persona'}
        </div>
        <div class="history-actions">
          <button class="btn btn-primary btn-small" onclick="loadPersonaFromHistory(${index})">Load</button>
          <button class="btn btn-secondary btn-small" onclick="editPersonaFromHistory(${index})">Edit</button>
          <button class="btn btn-secondary btn-small" onclick="deletePersonaFromHistory(${index})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function addToHistory(persona, vendor) {
  const historyItem = {
    persona: persona,
    vendor: vendor,
    timestamp: Date.now()
  };

  personaHistory.unshift(historyItem);

  // Keep only last 10 items
  if (personaHistory.length > 10) {
    personaHistory = personaHistory.slice(0, 10);
  }

  chrome.storage.local.set({ personaHistory }, () => {
    displayPersonaHistory();
  });
}

// Make functions globally available for onclick handlers
window.loadPersonaFromHistory = function(index) {
  const item = personaHistory[index];
  chrome.storage.local.get(['userBrain'], (result) => {
    const userBrain = result.userBrain || {};
    userBrain[item.vendor] = item.persona;

    chrome.storage.local.set({ userBrain }, () => {
      updateStatus(`Loaded ${item.vendor} persona from history`, 'success');
      setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
    });
  });
};

window.editPersonaFromHistory = function(index) {
  const item = personaHistory[index];
  currentPersona = item.persona;
  currentVendor = item.vendor;
  showEditPersona(item.persona);
};

window.deletePersonaFromHistory = function(index) {
  personaHistory.splice(index, 1);
  chrome.storage.local.set({ personaHistory }, () => {
    displayPersonaHistory();
    updateStatus('Persona removed from history', 'success');
    setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
  });
};

// Tab Functions
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Main Functions
function fetchPersona(aiVendor, showPreview = true) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!canExecuteScript(tab)) {
      updateStatus('Cannot execute on this page (chrome://, settings, etc.)', 'error');
      return;
    }

    let filename;
    if (aiVendor === 'chatgpt') filename = "dist/chagpt_persona.bundle.js";
    else if (aiVendor === 'claude') filename = "dist/claude_persona.bundle.js";
    else if (aiVendor === 'gemini') filename = "dist/gemini_persona.bundle.js";
    else return updateStatus("Unsupported vendor.", 'error');

    updateStatus(`Generating persona for ${aiVendor}...`, 'loading');
    showProgress(true);

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [filename, "dist/inject-save-to-brain.bundle.js"]
    }, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Script execution error:', chrome.runtime.lastError);
        updateStatus('Failed to execute script', 'error');
        showProgress(false);
        return;
      }

      setTimeout(() => {
        showProgress(false);

        // Get the generated persona from storage
        chrome.storage.local.get(['userBrain'], (result) => {
          const userBrain = result.userBrain || {};
          // Try both keys for compatibility
          const persona = userBrain[aiVendor + 'Persona'] || userBrain[aiVendor];
          if (persona && showPreview) {
            showPersonaPreview(persona, aiVendor);
            addToHistory(persona, aiVendor);
          } else {
            updateStatus(`Persona generated for ${aiVendor}!`, 'success');
            setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
          }
        });
      }, 2000);
    });
  });
}

function injectPersona(vendor) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (!canExecuteScript(tab)) {
      updateStatus('Cannot execute on this page (chrome://, settings, etc.)', 'error');
      return;
    }

    let injectFile;
    if (vendor === 'chatgpt') injectFile = 'dist/chatgpt-injector.bundle.js';
    else if (vendor === 'claude') injectFile = 'dist/claude-injector.bundle.js';
    else if (vendor === 'gemini') injectFile = 'dist/gemini-injector.bundle.js';
    else return updateStatus('Not on a supported AI site', 'error');

    updateStatus(`Injecting persona into ${vendor}...`, 'loading');
    showProgress(true);

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [injectFile]
    }, (result) => {
      if (chrome.runtime.lastError) {
        console.error('Script execution error:', chrome.runtime.lastError);
        updateStatus('Failed to execute script', 'error');
        showProgress(false);
        return;
      }

      setTimeout(() => {
        showProgress(false);
        updateStatus(`Persona injected to ${vendor.charAt(0).toUpperCase() + vendor.slice(1)}!`, 'success');
        setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
      }, 1500);
    });
  });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Load persona history
  loadPersonaHistory();

  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Modal close handlers
  document.getElementById('close-preview').addEventListener('click', () => {
    hideModal('preview-modal');
  });

  document.getElementById('close-edit').addEventListener('click', () => {
    hideModal('edit-modal');
  });

  document.getElementById('cancel-preview').addEventListener('click', () => {
    hideModal('preview-modal');
  });

  document.getElementById('cancel-edit').addEventListener('click', () => {
    hideModal('edit-modal');
  });

  // Persona actions
  document.getElementById('save-persona').addEventListener('click', () => {
    if (currentPersona && currentVendor) {
      chrome.storage.local.get(['userBrain'], (result) => {
        const userBrain = result.userBrain || {};
        userBrain[currentVendor] = currentPersona;

        chrome.storage.local.set({ userBrain }, () => {
          hideModal('preview-modal');
          updateStatus('Persona saved successfully!', 'success');
          setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
        });
      });
    }
  });

  document.getElementById('edit-persona').addEventListener('click', () => {
    if (currentPersona) {
      showEditPersona(currentPersona);
    }
  });

  document.getElementById('save-edited-persona').addEventListener('click', () => {
    saveEditedPersona();
  });

  // Check current vendor on load
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (!canExecuteScript(tab)) {
      updateStatus('Cannot access this page type', 'error');
      updateVendorInfo('unknown');
      setFetchButtonsEnabled(false, 'unknown');
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const url = window.location.hostname;
        if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
        if (url.includes('claude.ai')) return 'claude';
        if (url.includes('gemini.google.com')) return 'gemini';
        return 'unknown';
      }
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error('Vendor detection error:', chrome.runtime.lastError);
        updateStatus('Cannot detect AI site on this page', 'error');
        updateVendorInfo('unknown');
        setFetchButtonsEnabled(false, 'unknown');
        return;
      }

      const vendor = results && results[0] && results[0].result;
      updateVendorInfo(vendor);
      setFetchButtonsEnabled(true, vendor);
      if (vendor === 'unknown') {
        updateStatus('Not on a supported AI site', 'error');
      }
    });
  });

  // Generate Persona Button
  document.getElementById("generate-persona").addEventListener("click", () => {
    setButtonLoading('generate-persona', true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!canExecuteScript(tab)) {
        updateStatus('Cannot execute on this page (chrome://, settings, etc.)', 'error');
        setButtonLoading('generate-persona', false);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const url = window.location.hostname;
          if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
          if (url.includes('claude.ai')) return 'claude';
          if (url.includes('gemini.google.com')) return 'gemini';
          return 'unknown';
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('Vendor detection error:', chrome.runtime.lastError);
          updateStatus('Cannot detect AI site on this page', 'error');
          setButtonLoading('generate-persona', false);
          return;
        }

        const vendor = results && results[0] && results[0].result;
        if (vendor === 'unknown') {
          updateStatus('Not on a supported AI site', 'error');
          setButtonLoading('generate-persona', false);
        } else {
          fetchPersona(vendor, true);
          setTimeout(() => setButtonLoading('generate-persona', false), 3000);
        }
      });
    });
  });

  // Inject Persona Button
  document.getElementById('inject-persona').addEventListener('click', () => {
    setButtonLoading('inject-persona', true);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!canExecuteScript(tab)) {
        updateStatus('Cannot execute on this page (chrome://, settings, etc.)', 'error');
        setButtonLoading('inject-persona', false);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const url = window.location.hostname;
          if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
          if (url.includes('claude.ai')) return 'claude';
          if (url.includes('gemini.google.com')) return 'gemini';
          return 'unknown';
        }
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error('Vendor detection error:', chrome.runtime.lastError);
          updateStatus('Cannot detect AI site on this page', 'error');
          setButtonLoading('inject-persona', false);
          return;
        }

        const vendor = results && results[0] && results[0].result;
        if (vendor === 'unknown') {
          updateStatus('Not on a supported AI site', 'error');
          setButtonLoading('inject-persona', false);
        } else {
          injectPersona(vendor);
          setTimeout(() => setButtonLoading('inject-persona', false), 2000);
        }
      });
    });
  });

  // Quick Actions
  document.getElementById('quick-generate').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!canExecuteScript(tab)) {
        updateStatus('Cannot execute on this page (chrome://, settings, etc.)', 'error');
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const url = window.location.hostname;
          if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
          if (url.includes('claude.ai')) return 'claude';
          if (url.includes('gemini.google.com')) return 'gemini';
          return 'unknown';
        }
      }, (results) => {
        const vendor = results && results[0] && results[0].result;
        if (vendor !== 'unknown') {
          fetchPersona(vendor, false); // Quick generate without preview
        } else {
          updateStatus('Not on a supported AI site', 'error');
        }
      });
    });
  });

  document.getElementById('quick-inject').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      if (!canExecuteScript(tab)) {
        updateStatus('Cannot execute on this page (chrome://, settings, etc.)', 'error');
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const url = window.location.hostname;
          if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
          if (url.includes('claude.ai')) return 'claude';
          if (url.includes('gemini.google.com')) return 'gemini';
          return 'unknown';
        }
      }, (results) => {
        const vendor = results && results[0] && results[0].result;
        if (vendor !== 'unknown') {
          injectPersona(vendor);
        } else {
          updateStatus('Not on a supported AI site', 'error');
        }
      });
    });
  });

  // History actions event delegation
  document.getElementById('history-container').addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('btn')) {
      const parent = target.closest('.history-item');
      const index = Array.from(document.querySelectorAll('.history-item')).indexOf(parent);
      if (target.textContent.trim() === 'Load') {
        // Show preview modal for this persona
        const item = personaHistory[index];
        showPersonaPreview(item.persona, item.vendor);
      } else if (target.textContent.trim() === 'Edit') {
        const item = personaHistory[index];
        currentPersona = item.persona;
        currentVendor = item.vendor;
        showEditPersona(item.persona);
      } else if (target.textContent.trim() === 'Delete') {
        personaHistory.splice(index, 1);
        chrome.storage.local.set({ personaHistory }, () => {
          displayPersonaHistory();
          updateStatus('Persona removed from history', 'success');
          setTimeout(() => updateStatus('Ready to generate or inject personas', 'idle'), 2000);
        });
      }
    }
  });
});

