// Onboarding - Shows once across all domains
;(function () {
  const KEY = 'onboardingDone'
  const isClaude = location.hostname === 'claude.ai'

  const isMain = isClaude
    ? location.pathname === '/' || location.pathname === '/new'
    : /^\/?$/.test(location.pathname)

  const hasParam = isClaude
    ? new URLSearchParams(location.search).has('incognito')
    : new URLSearchParams(location.search).get('temporary-chat') === 'true'

  if (!isMain || !hasParam) return

  chrome.storage.local.get([KEY], r => {
    if (r[KEY]) return

    chrome.storage.local.set({ [KEY]: true })

    fetch(chrome.runtime.getURL('onboarding.html'))
      .then(r => r.text())
      .then(html => {
        const div = document.createElement('div')
        div.innerHTML = html
        document.body.appendChild(div)

        document.getElementById('toggle-onboarding-image').src = chrome.runtime.getURL('icons/toggle_onboarding.png')
        document.getElementById('new-chat-onboarding').src = chrome.runtime.getURL('icons/new_chat_onboarding.png')

        const step1 = document.getElementById('step-1')
        const step2 = document.getElementById('step-2')

        document.getElementById('next-button').onclick = () => {
          step1.classList.remove('active')
          step2.classList.add('active')
        }

        document.getElementById('prev-button').onclick = () => {
          step2.classList.remove('active')
          step1.classList.add('active')
        }

        const close = () => {
          div.remove()
          document.removeEventListener('keydown', onEsc)
        }

        const onEsc = e => (e.key === 'Escape' || e.key === 'Esc') && close()

        document.getElementById('continue-button').onclick = close
        document.addEventListener('keydown', onEsc)
      })
  })
})()
