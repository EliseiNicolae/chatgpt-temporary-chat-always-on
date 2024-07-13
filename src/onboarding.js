// Function to show the onboarding HTML content
function showOnboarding () {
  fetch(chrome.runtime.getURL('onboarding.html'))
      .then(response => response.text())
      .then(data => {
        const div = document.createElement('div');
        div.innerHTML = data;
        document.body.appendChild(div);

        const toggle_img_element = document.getElementById('toggle-onboarding-image');
        toggle_img_element.src = chrome.runtime.getURL('icons/toggle_onboarding.png');

        const new_chat_onboarding = document.getElementById('new-chat-onboarding');
        new_chat_onboarding.src = chrome.runtime.getURL('icons/new_chat_onboarding.png');

        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');
        const nextButton = document.getElementById('next-button');
        const prevButton = document.getElementById('prev-button');
        const continueButton = document.getElementById('continue-button');

        nextButton.addEventListener('click', () => {
          step1.classList.remove('active');
          step2.classList.add('active');
        });

        prevButton.addEventListener('click', () => {
          step2.classList.remove('active');
          step1.classList.add('active');
        });

        continueButton.addEventListener('click', () => {
          setTemporaryChatOn();
          document.body.removeChild(div);
        });
      })
      .catch(error => console.error('Error fetching the onboarding HTML:', error));
}

if ((window.location.pathname === '/' || window.location.pathname === '') && localStorage.getItem('temporary_chat') === null) {
  localStorage.setItem('temporary_chat', 'true');
  showOnboarding();
}
