// ChatGPT - Temporary Chat Handler
;(function () {
  const KEY = 'temporary_chat'
  const PARAM = 'temporary-chat'

  const isMain = () => /^\/?$/.test(location.pathname)
  const isChat = () => isMain() || /\/c\//.test(location.pathname)
  const hasParam = () => new URLSearchParams(location.search).get(PARAM) === 'true'

  const enable = () => {
    if (!hasParam() && isChat()) {
      const p = new URLSearchParams(location.search)
      p.set(PARAM, 'true')
      location.href = `${location.origin}/?${p}`
    }
  }

  const disable = () => {
    if (hasParam()) {
      const p = new URLSearchParams(location.search)
      p.delete(PARAM)
      location.href = p.toString() ? `${location.origin}/?${p}` : `${location.origin}/`
    }
  }

  const get = cb => chrome.storage.local.get([KEY], r => cb(r[KEY] !== false))
  const set = v => chrome.storage.local.set({ [KEY]: v === true })

  const injectToggle = () => {
    if (document.getElementById('toggle-wrapper')) return
    fetch(chrome.runtime.getURL('toggle.html'))
      .then(r => r.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html)

        const toggle = document.getElementById('toggle-button')
        if (!toggle) return

        get(on => (toggle.checked = on))

        toggle.onchange = function () {
          set(this.checked)
          this.checked ? enable() : disable()
        }

        document.getElementById('new-chat-button').onclick = () =>
          get(on => (location.href = on ? 'https://chatgpt.com/?temporary-chat=true' : 'https://chatgpt.com/'))
      })
  }

  // URL watcher for SPA navigation
  let last = location.href
  new MutationObserver(() => {
    if (last === location.href) return
    last = location.href

    const w = document.getElementById('toggle-wrapper')
    if (w) w.style.display = isMain() ? 'block' : 'none'
    else if (isMain()) injectToggle()

    if (isChat() && !hasParam()) get(on => on && enable())
  }).observe(document.body, { childList: true, subtree: true })

  // Sync with popup
  chrome.storage.onChanged.addListener((c, a) => {
    if (a !== 'local' || !c[KEY]) return
    const on = c[KEY].newValue === true
    const t = document.getElementById('toggle-button')
    if (t) t.checked = on
    on ? enable() : disable()
  })

  // Init
  if (isMain()) setTimeout(injectToggle, 100)
  if (isChat()) get(on => on && enable())
})()
