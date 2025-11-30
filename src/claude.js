// Claude.ai - Incognito Chat Handler

const STORAGE_KEY = 'temporary_chat'

function isOnChatPage () {
  return window.location.pathname === '/' ||
    window.location.pathname === '/new' ||
    /\/chat\//.test(window.location.pathname)
}

function shouldShowToggle () {
  return window.location.pathname === '/' || window.location.pathname === '/new'
}

function hasIncognitoParam () {
  return new URLSearchParams(window.location.search).has('incognito')
}

function setIncognitoOn () {
  if (!hasIncognitoParam() && isOnChatPage()) {
    window.location.href = `${window.location.origin}/new?incognito`
  }
}

function setIncognitoOff () {
  if (hasIncognitoParam() && isOnChatPage()) {
    const url = new URL(window.location.href)
    url.searchParams.delete('incognito')
    window.location.href = url.toString()
  }
}

function handleInitialLoad () {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIncognitoOn()
    return
  }

  if (stored === 'true') {
    setIncognitoOn()
    return
  }

  if (hasIncognitoParam()) {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
}

function setupButtonObserver () {
  if (!document.body) return
  const observer = new MutationObserver(() => {
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
          setTimeout(setIncognitoOn, 2)
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

      if (isOnChatPage() && localStorage.getItem(STORAGE_KEY) === 'true' && !hasIncognitoParam()) {
        setIncognitoOn()
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
        this.checked ? setIncognitoOn() : setIncognitoOff()
      })

      const newChatBtn = document.getElementById('new-chat-button')
      if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
          window.location.href = localStorage.getItem(STORAGE_KEY) === 'true'
            ? 'https://claude.ai/new?incognito'
            : 'https://claude.ai/new'
        })
      }
    })
    .catch(err => console.error('Error loading toggle:', err))
}

// Initialize
watchUrlChanges()
if (shouldShowToggle()) setTimeout(injectToggle, 500)
if (isOnChatPage()) {
  handleInitialLoad()
  setupButtonObserver()
}
