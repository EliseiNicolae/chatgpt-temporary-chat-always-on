// Claude.ai - Incognito Chat Handler

const STORAGE_KEY = 'temporary_chat'

const isOnChatPage =
  window.location.pathname === '/' ||
  window.location.pathname === '/new' ||
  /\/chat\//.test(window.location.pathname)

function hasIncognitoParam () {
  return new URLSearchParams(window.location.search).has('incognito')
}

function setIncognitoOn () {
  if (!hasIncognitoParam() && isOnChatPage) {
    window.location.href = `${window.location.origin}/new?incognito`
  }
}

function setIncognitoOff () {
  if (hasIncognitoParam() && isOnChatPage) {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete('incognito')
    const newParams = params.toString()
    window.location.href = `${url.origin}${url.pathname}${newParams ? '?' + newParams : ''}`
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
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true')
      const toggle = document.getElementById('toggle-button')
      if (toggle) toggle.checked = true
    }, 100)
  }
}

function handleButtonClick () {
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    setTimeout(setIncognitoOn, 2)
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

      if (localStorage.getItem(STORAGE_KEY) === 'true' && !hasIncognitoParam()) {
        const toggle = document.getElementById('toggle-button')
        if (toggle) toggle.checked = true
        setIncognitoOn()
      }

      if (hasIncognitoParam()) {
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
          setIncognitoOn()
        } else {
          setIncognitoOff()
        }
      })

      const newChatBtn = document.getElementById('new-chat-button')
      if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
          const isTemporary = localStorage.getItem(STORAGE_KEY) === 'true'
          window.location.href = isTemporary
            ? 'https://claude.ai/new?incognito'
            : 'https://claude.ai/new'
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
  setTimeout(injectToggle, 500)
}
