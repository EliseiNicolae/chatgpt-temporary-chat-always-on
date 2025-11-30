// ChatGPT - Temporary Chat Handler

const STORAGE_KEY = 'temporary_chat'
const PARAM_KEY = 'temporary-chat'

function isOnChatPage () {
  return window.location.pathname === '/' ||
    window.location.pathname === '' ||
    /\/c\//.test(window.location.pathname)
}

function shouldShowToggle () {
  return window.location.pathname === '/' || window.location.pathname === ''
}

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
  if ((!params.has(PARAM_KEY) || params.get(PARAM_KEY) === 'false') && isOnChatPage()) {
    params.set(PARAM_KEY, 'true')
    window.location.href = `${window.location.origin}/?${params}`
  }
}

function setTemporaryChatOff () {
  const params = getParams()
  if (params.has(PARAM_KEY) && isOnChatPage()) {
    params.delete(PARAM_KEY)
    window.location.href = `${window.location.origin}/?${params}`
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
    localStorage.setItem(STORAGE_KEY, 'true')
  } else if (hasTemporaryParamFalse()) {
    localStorage.setItem(STORAGE_KEY, 'false')
  }
}

function setupButtonObserver () {
  if (!document.body) return
  const observer = new MutationObserver(() => {
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
          setTimeout(setTemporaryChatOn, 2)
        }
      })
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

      const toggleWrapper = document.getElementById('toggle-wrapper')
      if (toggleWrapper) {
        toggleWrapper.style.display = shouldShowToggle() ? 'block' : 'none'
      } else if (shouldShowToggle()) {
        injectToggle()
      }

      if (isOnChatPage() && localStorage.getItem(STORAGE_KEY) === 'true' && !hasTemporaryParam()) {
        setTemporaryChatOn()
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] })
}

function injectToggle () {
  if (!document.body || document.getElementById('toggle-wrapper')) return

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
        this.checked ? setTemporaryChatOn() : setTemporaryChatOff()
      })

      const newChatBtn = document.getElementById('new-chat-button')
      if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
          window.location.href = localStorage.getItem(STORAGE_KEY) === 'true'
            ? 'https://chatgpt.com/?temporary-chat=true'
            : 'https://chatgpt.com/'
        })
      }
    })
    .catch(err => console.error('Error loading toggle:', err))
}

// Initialize
watchUrlChanges()
if (shouldShowToggle()) setTimeout(injectToggle, 100)
if (isOnChatPage()) {
  handleInitialLoad()
  setupButtonObserver()
}
