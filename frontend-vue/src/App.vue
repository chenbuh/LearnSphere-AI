<script setup>
import {
  NConfigProvider,
  NGlobalStyle,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  darkTheme
} from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'
import { commonApi } from '@/api/common'
import { useThemeStore } from '@/stores/theme'
import { applyThemeMode } from '@/utils/theme'

const themeStore = useThemeStore()
const primaryColor = ref('#6366f1')

const theme = computed(() => (themeStore.isDark ? darkTheme : null))

const themePalette = computed(() => {
  if (themeStore.isDark) {
    return {
      bgColor: '#1a1d2e',
      textColor: '#e8eaf0',
      textColorSecondary: '#a8aec1',
      cardBg: '#242836',
      cardBorder: 'rgba(255, 255, 255, 0.08)',
      surfaceMuted: 'rgba(36, 40, 54, 0.72)',
      sidebarBg: '#242836',
      headerBg: 'rgba(26, 29, 46, 0.9)'
    }
  }

  return {
    bgColor: '#f4f7fb',
    textColor: '#182132',
    textColorSecondary: '#64748b',
    cardBg: '#ffffff',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    surfaceMuted: 'rgba(241, 245, 249, 0.88)',
    sidebarBg: '#f8faff',
    headerBg: 'rgba(255, 255, 255, 0.82)'
  }
})

const themeOverrides = computed(() => ({
  common: {
    primaryColor: primaryColor.value,
    primaryColorHover: primaryColor.value,
    primaryColorPressed: primaryColor.value,
    bodyColor: themePalette.value.bgColor,
    cardColor: themePalette.value.cardBg,
    modalColor: themePalette.value.cardBg,
    popoverColor: themePalette.value.cardBg,
    tableColor: themePalette.value.cardBg,
    borderColor: themePalette.value.cardBorder,
    textColorBase: themePalette.value.textColor,
    textColor1: themePalette.value.textColor,
    textColor2: themePalette.value.textColorSecondary,
    textColor3: themePalette.value.textColorSecondary,
    placeholderColor: themePalette.value.textColorSecondary,
    placeholderColorDisabled: themePalette.value.textColorSecondary,
    closeIconColor: themePalette.value.textColorSecondary
  },
  Button: {
    borderRadius: '10px'
  },
  Card: {
    borderRadius: '16px',
    color: themePalette.value.cardBg,
    colorEmbedded: themePalette.value.cardBg,
    borderColor: themePalette.value.cardBorder
  },
  Input: {
    color: themePalette.value.cardBg,
    colorFocus: themePalette.value.cardBg,
    colorDisabled: themePalette.value.surfaceMuted,
    textColor: themePalette.value.textColor,
    placeholderColor: themePalette.value.textColorSecondary,
    border: `1px solid ${themePalette.value.cardBorder}`,
    borderFocus: `1px solid ${primaryColor.value}`,
    borderHover: `1px solid ${primaryColor.value}`
  },
  Select: {
    peers: {
      InternalSelection: {
        color: themePalette.value.cardBg,
        textColor: themePalette.value.textColor,
        placeholderColor: themePalette.value.textColorSecondary,
        border: `1px solid ${themePalette.value.cardBorder}`
      }
    }
  },
  Layout: {
    color: themePalette.value.bgColor,
    colorEmbedded: themePalette.value.bgColor,
    siderColor: themePalette.value.sidebarBg,
    headerColor: themePalette.value.headerBg
  },
  Drawer: {
    color: themePalette.value.cardBg
  }
}))

watch(
  () => themeStore.mode,
  (mode) => {
    applyThemeMode(mode)
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    const res = await commonApi.getPublicConfigs()
    if (res.code === 200) {
      const config = res.data
      
      // 设置主色调
      if (config['ui.theme.primary_color']) {
         primaryColor.value = config['ui.theme.primary_color']
      }
      
      // 设置网站名称
      if (config['sys.site_name']) {
         document.title = config['sys.site_name']
      }
    }
  } catch (e) {
    console.error('[App] Failed to load config:', e)
  }
})
</script>

<template>
  <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
    <NGlobalStyle />
    <NNotificationProvider>
      <NMessageProvider>
        <NDialogProvider>
          <router-view />
        </NDialogProvider>
      </NMessageProvider>
    </NNotificationProvider>
  </NConfigProvider>
</template>

<style>
body {
  margin: 0;
  font-family: var(--app-font-family);
  background-color: var(--bg-color);
  color: var(--text-color);
}

body.dark-mode .n-card,
body.light-mode .n-card {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--card-border) !important;
}

body.dark-mode .n-card__content,
body.light-mode .n-card__content {
  color: var(--text-color) !important;
}

body.dark-mode .n-card:not(.n-card--bordered),
body.light-mode .n-card:not(.n-card--bordered) {
  border: 1px solid var(--card-border) !important;
}

body.dark-mode .n-button__content,
body.light-mode .n-button__content {
  color: inherit;
}

body.dark-mode .n-input,
body.dark-mode .n-input__input-el,
body.dark-mode .n-base-selection,
body.light-mode .n-input,
body.light-mode .n-input__input-el,
body.light-mode .n-base-selection {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--card-border) !important;
}

body.dark-mode .n-drawer,
body.dark-mode .n-modal,
body.light-mode .n-drawer,
body.light-mode .n-modal {
  color: var(--text-color);
}

/* 安全内容保护：防止复制粘贴、文本选择（基础防爬） */
.secure-content {
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
  cursor: default;
}

/* 允许输入框内的文字被选择 */
.secure-content input, 
.secure-content textarea {
  -webkit-user-select: text !important;
  user-select: text !important;
}
</style>
