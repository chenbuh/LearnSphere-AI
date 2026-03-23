import { defineStore } from 'pinia'
import {
  THEME_DARK,
  THEME_STORAGE_KEY,
  applyThemeMode,
  normalizeThemeMode,
  readStoredThemeMode
} from '@/utils/theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: readStoredThemeMode()
  }),
  getters: {
    isDark: (state) => state.mode === THEME_DARK,
    isLight: (state) => state.mode !== THEME_DARK
  },
  actions: {
    setTheme(mode) {
      const normalizedMode = normalizeThemeMode(mode)
      this.mode = normalizedMode
      applyThemeMode(normalizedMode)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, normalizedMode)
      }
    },
    toggleTheme() {
      this.setTheme(this.isDark ? 'light' : THEME_DARK)
    }
  }
})
