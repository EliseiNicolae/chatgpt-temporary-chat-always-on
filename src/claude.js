// Claude.ai - Incognito Chat Handler
;(function () {
  const KEY = 'temporary_chat'

  const isMain = () => location.pathname === '/' || location.pathname === '/new'
  const isChat = () => isMain() || /\/chat\//.test(location.pathname)
  const hasParam = () => new URLSearchParams(location.search).has('incognito')

  const enable = () => {
    if (!hasParam() && isChat()) {
      location.href = `${location.origin}/new?incognito`
    }
  }

  const disable = () => {
    if (hasParam()) {
      const url = new URL(location.href)
      url.searchParams.delete('incognito')
      location.href = url.toString()
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
          get(on => (location.href = on ? 'https://claude.ai/new?incognito' : 'https://claude.ai/new'))
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
  if (isMain()) setTimeout(injectToggle, 500)
  if (isChat()) get(on => on && enable())
})()
