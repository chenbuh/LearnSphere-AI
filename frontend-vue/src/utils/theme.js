export const THEME_DARK = 'dark'
export const THEME_LIGHT = 'light'
export const THEME_STORAGE_KEY = 'learnsphere-theme'
export const THEME_READY_ATTR = 'data-theme-ready'
export const THEME_SWITCHING_ATTR = 'data-theme-switching'

let themeSwitchResetHandle = null

export const normalizeThemeMode = (mode) => {
  return mode === THEME_LIGHT ? THEME_LIGHT : THEME_DARK
}

export const readStoredThemeMode = () => {
  if (typeof window === 'undefined') {
    return THEME_DARK
  }

  return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY))
}

export const applyThemeMode = (mode) => {
  if (typeof document === 'undefined') {
    return
  }

  const normalizedMode = normalizeThemeMode(mode)
  const isDark = normalizedMode === THEME_DARK
  const root = document.documentElement
  const hasRenderedTheme = root.getAttribute(THEME_READY_ATTR) === 'true'

  if (hasRenderedTheme) {
    root.setAttribute(THEME_SWITCHING_ATTR, 'true')

    if (typeof cancelAnimationFrame === 'function' && themeSwitchResetHandle !== null) {
      cancelAnimationFrame(themeSwitchResetHandle)
      themeSwitchResetHandle = null
    }
  }

  root.setAttribute('data-theme', normalizedMode)
  root.setAttribute(THEME_READY_ATTR, 'true')
  root.style.colorScheme = normalizedMode

  if (document.body) {
    document.body.classList.toggle('dark-mode', isDark)
    document.body.classList.toggle('light-mode', !isDark)
    document.body.setAttribute('data-theme', normalizedMode)
  }

  if (hasRenderedTheme) {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        themeSwitchResetHandle = requestAnimationFrame(() => {
          root.removeAttribute(THEME_SWITCHING_ATTR)
          themeSwitchResetHandle = null
        })
      })
    } else {
      root.removeAttribute(THEME_SWITCHING_ATTR)
    }
  }
}
