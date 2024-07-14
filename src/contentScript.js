// [START] ********************** Utils **********************

// Function to check and update the URL and reload the page if needed
function setTemporaryChatOn () {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  if (!params.has('temporary-chat') || params.get('temporary-chat') === 'false') {
    params.delete('temporary-chat')
    params.set('temporary-chat', 'true')
    // Update the URL including the path and parameters
    if (isOnChatPage) {
      window.location.href = `${url.origin}/?${params}`
    }
  }
}

function setTemporaryChatOff () {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  // Check if the 'temporary-chat' parameter is present
  if (params.has('temporary-chat') || params.get('temporary-chat') === 'true') {
    // Remove the 'temporary-chat' parameter
    params.delete('temporary-chat')
    // Update the URL including the path and parameters
    if (isOnChatPage) {
      window.location.href = `${url.origin}/?${params}`
    }
  }
}

// Function to handle the initial setting of localStorage and URL
function handleInitialLoad () {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)

  if (localStorage.getItem('temporary_chat') === null) {
    localStorage.setItem('temporary_chat', 'true')
    setTemporaryChatOn()
    return
  } else if (localStorage.getItem('temporary_chat') === 'true' && params.get('temporary-chat') !== 'false') {
    setTemporaryChatOn()
    return
  }
  if (params.has('temporary-chat') && params.get('temporary-chat') === 'true') {
    setTimeout(() => {
      localStorage.setItem('temporary_chat', 'true')
      const toggleButton = document.getElementById('toggle-button')
      toggleButton.checked = true
    }, 100)
  } else if (params.has('temporary-chat') && params.get('temporary-chat') === 'false') {
    setTimeout(() => {
      localStorage.setItem('temporary_chat', 'false')
      const toggleButton = document.getElementById('toggle-button')
      toggleButton.checked = false
    }, 100)
  }
}

// Handle the 'New chat' button specifically
function handleButtonClick () {
  if (localStorage.getItem('temporary_chat') === 'true') {
    setTimeout(setTemporaryChatOn, 2)
  }
}

// [END] ********************** Utils **********************


// [START] ********************** Observers **********************
// Observe changes in the document to reattach event listeners to new buttons
const observer = new MutationObserver(() => {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handleButtonClick)
  })
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})

// Function to check URL changes and log them
function checkUrlChange () {
  let previousUrl = window.location.href

  const observer = new MutationObserver((mutations, observer) => {
    const currentUrl = window.location.href
    if (previousUrl !== currentUrl) {
      previousUrl = currentUrl

      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)

      if (localStorage.getItem('temporary_chat') === 'true' && !params.has('temporary-chat')) {
        localStorage.setItem('temporary_chat', 'true')
        const toggleButton = document.getElementById('toggle-button')
        if (toggleButton) {
          toggleButton.checked = true
        }
        setTemporaryChatOn()
      }

      // check if temporary-chat param has value 'true' and set the toggle button to true and update the local storage
      if (params.has('temporary-chat') && params.get('temporary-chat') === 'true') {
        const toggleButton = document.getElementById('toggle-button')
        if (toggleButton) {
          toggleButton.checked = true
        }
        localStorage.setItem('temporary_chat', 'true')
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

// [END] ********************** Observers **********************

// Function to inject HTML content from toggle.html
function injectHTMLToggle () {
  fetch(chrome.runtime.getURL('toggle.html'))
      .then(response => response.text())
      .then(data => {
        const div = document.createElement('div')
        div.innerHTML = data
        document.body.appendChild(div)
        const url = new URL(window.location.href)
        const params = new URLSearchParams(url.search)

        const toggleButton = document.getElementById('toggle-button')
        toggleButton.checked = localStorage.getItem('temporary_chat') === 'true'
        toggleButton.addEventListener('change', function () {
          if (this.checked) {
            if (params.has('temporary-chat') && params.get('temporary-chat') === 'false') {
              params.set('temporary-chat', 'true')
              window.location.href = `${url.origin}/?${params}`
              return
            }
            localStorage.setItem('temporary_chat', 'true')
            setTemporaryChatOn()
          } else {
            localStorage.setItem('temporary_chat', 'false')
            setTemporaryChatOff()
          }
        })
      })
      .catch(error => console.error('Error fetching the HTML:', error))
}

const isOnChatPage = window.location.pathname === '/' ||
    window.location.pathname === '' ||
    /\/c\//.test(window.location.pathname)

if (isOnChatPage) {
// Initial load handling
  handleInitialLoad()

// Start checking for URL changes
  checkUrlChange()

// Inject HTML when the script is loaded
  injectHTMLToggle()
}
