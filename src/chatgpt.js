// ChatGPT - Temporary Chat Handler

const STORAGE_KEY = 'temporary_chat'
const PARAM_KEY = 'temporary-chat'

const isOnChatPage =
  window.location.pathname === '/' ||
  window.location.pathname === '' ||
  /\/c\//.test(window.location.pathname)

function getParams () {
  return new URLSearchParams(window.location.search)
}

function hasTemporaryParam () {
  return getParams().get(PARAM_KEY) === 'true'
}

function hasTemporaryParamFalse () {
  return getParams().get(PARAM_KEY) === 'false'
}

function setTemporaryChatOn () {
  const params = getParams()
  if (!params.has(PARAM_KEY) || params.get(PARAM_KEY) === 'false') {
    params.delete(PARAM_KEY)
    params.set(PARAM_KEY, 'true')
    if (isOnChatPage) {
      window.location.href = `${window.location.origin}/?${params}`
    }
  }
}

function setTemporaryChatOff () {
  const params = getParams()
  if (params.has(PARAM_KEY)) {
    params.delete(PARAM_KEY)
    if (isOnChatPage) {
      window.location.href = `${window.location.origin}/?${params}`
    }
  }
}

function handleInitialLoad () {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, 'true')
    setTemporaryChatOn()
    return
  }

  if (stored === 'true' && !hasTemporaryParamFalse()) {
    setTemporaryChatOn()
    return
  }

  if (hasTemporaryParam()) {
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true')
      const toggle = document.getElementById('toggle-button')
      if (toggle) toggle.checked = true
    }, 100)
  } else if (hasTemporaryParamFalse()) {
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'false')
      const toggle = document.getElementById('toggle-button')
      if (toggle) toggle.checked = false
    }, 100)
  }
}

function handleButtonClick () {
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    setTimeout(setTemporaryChatOn, 2)
  }
}

function setupButtonObserver () {
  if (!document.body) return
  const observer = new MutationObserver(() => {
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', handleButtonClick)
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function watchUrlChanges () {
  if (!document.body) return
  let previousUrl = window.location.href

  const observer = new MutationObserver(() => {
    if (previousUrl !== window.location.href) {
      previousUrl = window.location.href

      if (localStorage.getItem(STORAGE_KEY) === 'true' && !getParams().has(PARAM_KEY)) {
        const toggle = document.getElementById('toggle-button')
        if (toggle) toggle.checked = true
        setTemporaryChatOn()
      }

      if (hasTemporaryParam()) {
        const toggle = document.getElementById('toggle-button')
        if (toggle) toggle.checked = true
        localStorage.setItem(STORAGE_KEY, 'true')
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href']
  })
}

function injectToggle () {
  if (!document.body) return

  fetch(chrome.runtime.getURL('toggle.html'))
    .then(response => response.text())
    .then(html => {
      const container = document.createElement('div')
      container.innerHTML = html
      document.body.appendChild(container)

      const toggle = document.getElementById('toggle-button')
      if (!toggle) return

      toggle.checked = localStorage.getItem(STORAGE_KEY) === 'true'
      toggle.addEventListener('change', function () {
        localStorage.setItem(STORAGE_KEY, this.checked ? 'true' : 'false')
        if (this.checked) {
          setTemporaryChatOn()
        } else {
          setTemporaryChatOff()
        }
      })

      const newChatBtn = document.getElementById('new-chat-button')
      if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
          const isTemporary = localStorage.getItem(STORAGE_KEY) === 'true'
          window.location.href = isTemporary
            ? 'https://chatgpt.com/?temporary-chat=true'
            : 'https://chatgpt.com/'
        })
      }
    })
    .catch(err => console.error('Error loading toggle:', err))
}

// Initialize
if (isOnChatPage) {
  handleInitialLoad()
  watchUrlChanges()
  setupButtonObserver()
  injectToggle()
}
