// Review Prompt - Shows on day 1, 4, 10, 15, 25, 35, 50, 65, 70 if dismissed
;(function () {
  const KEYS = {
    installDate: 'reviewInstallDate',
    dismissCount: 'reviewDismissCount',
    reviewed: 'reviewClicked'
  }

  // Days to show prompt after each dismiss
  const SHOW_ON_DAYS = [1, 4, 10, 15, 25, 35, 50, 65, 70]

  function getDayToShow(dismissCount) {
    // Stop showing after all attempts exhausted
    if (dismissCount >= SHOW_ON_DAYS.length) return Infinity
    return SHOW_ON_DAYS[dismissCount]
  }

  function getDaysSinceInstall(installDate) {
    const now = Date.now()
    const diff = now - installDate
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  chrome.storage.local.get([KEYS.installDate, KEYS.dismissCount, KEYS.reviewed], data => {
    // If already reviewed, never show again
    if (data[KEYS.reviewed]) return

    // Set install date if not set
    if (!data[KEYS.installDate]) {
      chrome.storage.local.set({ [KEYS.installDate]: Date.now() })
      return
    }

    const dismissCount = data[KEYS.dismissCount] || 0
    const daysSinceInstall = getDaysSinceInstall(data[KEYS.installDate])
    const dayToShow = getDayToShow(dismissCount)

    // Not time to show yet
    if (daysSinceInstall < dayToShow) return

    // Show the prompt
    fetch(chrome.runtime.getURL('review-prompt.html'))
      .then(r => r.text())
      .then(html => {
        const container = document.createElement('div')
        container.innerHTML = html
        document.body.appendChild(container)

        const overlay = container.querySelector('.review-prompt-overlay')
        const closeBtn = document.getElementById('review-prompt-close')
        const reviewBtn = document.getElementById('review-prompt-btn')

        const onEsc = e => {
          if (e.key === 'Escape' || e.key === 'Esc') {
            dismiss()
          }
        }

        const cleanup = () => {
          document.removeEventListener('keydown', onEsc)
          container.remove()
        }

        const dismiss = () => {
          chrome.storage.local.set({ [KEYS.dismissCount]: dismissCount + 1 })
          cleanup()
        }

        // X button - dismiss and increase count
        closeBtn.onclick = dismiss

        // Review button - mark as reviewed (never show again)
        reviewBtn.onclick = () => {
          chrome.storage.local.set({ [KEYS.reviewed]: true })
          cleanup()
        }

        // Click outside modal to dismiss
        overlay.onclick = e => {
          if (e.target === overlay) dismiss()
        }

        document.addEventListener('keydown', onEsc)
      })
  })
})()
