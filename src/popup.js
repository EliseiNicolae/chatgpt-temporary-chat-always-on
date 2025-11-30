const KEY = 'temporary_chat'
const toggle = document.getElementById('toggle-button')

// Load state
chrome.storage.local.get([KEY], r => (toggle.checked = r[KEY] !== false))

// Save on change
toggle.onchange = () => chrome.storage.local.set({ [KEY]: toggle.checked })

// Sync with content scripts
chrome.storage.onChanged.addListener((c, a) => {
  if (a === 'local' && c[KEY]) toggle.checked = c[KEY].newValue === true
})
