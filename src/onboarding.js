// Onboarding Handler

const isClaude = window.location.hostname === 'claude.ai'

const isCorrectPath = isClaude
  ? (window.location.pathname === '/' || window.location.pathname === '/new')
  : (window.location.pathname === '/' || window.location.pathname === '')

const params = new URLSearchParams(window.location.search)

const hasActiveParam = isClaude
  ? params.has('incognito')
  : (params.has('temporary-chat') && params.get('temporary-chat') === 'true')

function showOnboarding () {
  fetch(chrome.runtime.getURL('onboarding.html'))
    .then(response => response.text())
    .then(html => {
      const div = document.createElement('div')
      div.innerHTML = html
      document.body.appendChild(div)

      document.getElementById('toggle-onboarding-image').src = chrome.runtime.getURL('icons/toggle_onboarding.png')
      document.getElementById('new-chat-onboarding').src = chrome.runtime.getURL('icons/new_chat_onboarding.png')

      const step1 = document.getElementById('step-1')
      const step2 = document.getElementById('step-2')

      document.getElementById('next-button').addEventListener('click', () => {
        step1.classList.remove('active')
        step2.classList.add('active')
      })

      document.getElementById('prev-button').addEventListener('click', () => {
        step2.classList.remove('active')
        step1.classList.add('active')
      })

      function closeOnboarding () {
        document.body.removeChild(div)
        document.removeEventListener('keydown', escKeyListener)
      }

      function escKeyListener (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
          closeOnboarding()
        }
      }

      document.getElementById('continue-button').addEventListener('click', closeOnboarding)
      document.addEventListener('keydown', escKeyListener)
    })
    .catch(err => console.error('Error loading onboarding:', err))
}

// Show onboarding on first visit (using chrome.storage to share state across domains)
if (isCorrectPath && (localStorage.getItem('temporary_chat') === 'true' || hasActiveParam)) {
  chrome.storage.local.get('onboardingDone', (result) => {
    if (!result.onboardingDone) {
      chrome.storage.local.set({ onboardingDone: true })
      showOnboarding()
    }
  })
}
