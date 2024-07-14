// Function to show the onboarding HTML content
function showOnboarding () {
  fetch(chrome.runtime.getURL('onboarding.html'))
      .then(response => response.text())
      .then(data => {
        const div = document.createElement('div')
        div.innerHTML = data
        document.body.appendChild(div)

        const toggle_img_element = document.getElementById('toggle-onboarding-image')
        toggle_img_element.src = chrome.runtime.getURL('icons/toggle_onboarding.png')

        const new_chat_onboarding = document.getElementById('new-chat-onboarding')
        new_chat_onboarding.src = chrome.runtime.getURL('icons/new_chat_onboarding.png')

        const step1 = document.getElementById('step-1')
        const step2 = document.getElementById('step-2')
        const nextButton = document.getElementById('next-button')
        const prevButton = document.getElementById('prev-button')
        const continueButton = document.getElementById('continue-button')

        nextButton.addEventListener('click', () => {
          step1.classList.remove('active')
          step2.classList.add('active')
        })

        prevButton.addEventListener('click', () => {
          step2.classList.remove('active')
          step1.classList.add('active')
        })

        continueButton.addEventListener('click', () => {
          setTemporaryChatOn()
          document.body.removeChild(div)
          document.removeEventListener('keydown', escKeyListener)
        })

        function escKeyListener (event) {
          if (event.key === 'Escape' || event.key === 'Esc') {
            document.body.removeChild(div)
            document.removeEventListener('keydown', escKeyListener)
          }
        }

        document.addEventListener('keydown', escKeyListener)
      })
      .catch(error => console.error('Error fetching the onboarding HTML:', error))
}

const isCorrectPath = window.location.pathname === '/' ||
    window.location.pathname === '' ||
    /\/c\//.test(window.location.pathname)
const url = new URL(window.location.href)
const params = new URLSearchParams(url.search)

if (isCorrectPath &&
    localStorage.getItem('gpt_onboardingDone_chrExt') === null &&
    (localStorage.getItem('temporary_chat') === 'true' ||
        params.has('temporary-chat') && params.get('temporary-chat') === 'true')) {
  localStorage.setItem('gpt_onboardingDone_chrExt', 'true')
  showOnboarding()
}
