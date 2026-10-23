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
// 主色必须跟随主题：
// 深色主题下 --brand 是浅绿 #5fa88b（配深色前景 #10241c）；
// 浅色主题下 --brand 是深绿 #1e6b52（配白色前景）。
// 原来钉死 #1e6b52，深色主题里按钮仍是深绿底 + 深色字，只有 2.5:1。
// 后台若配置了自定义主色则以此覆盖（浅色主题用，深色主题仍走浅绿保证对比度）。
const customPrimary = ref(null)
const primaryColor = computed(() => {
  if (themeStore.isDark) return '#5fa88b'
  return customPrimary.value || '#1e6b52'
})

const theme = computed(() => (themeStore.isDark ? darkTheme : null))

const themePalette = computed(() => {
  if (themeStore.isDark) {
    return {
      bgColor: '#141615',
      textColor: '#e8e6e1',
      textColorSecondary: '#9c9a93',
      cardBg: '#1c1f1d',
      cardBorder: 'rgba(255, 255, 255, 0.08)',
      surfaceMuted: '#222523',
      sidebarBg: '#171a18',
      headerBg: '#141615'
    }
  }

  return {
    bgColor: '#f7f6f2',
    textColor: '#1f2421',
    textColorSecondary: '#5f625c',
    cardBg: '#ffffff',
    cardBorder: '#e4e1d9',
    surfaceMuted: '#f1efe9',
    sidebarBg: '#f1efe9',
    headerBg: '#f7f6f2'
  }
})

const themeOverrides = computed(() => ({
  common: {
    primaryColor: primaryColor.value,
    primaryColorHover: themeStore.isDark ? '#8cc3ad' : '#174f3d',
    primaryColorPressed: themeStore.isDark ? '#8cc3ad' : '#133f31',
    primaryColorSuppl: primaryColor.value,
    borderRadius: '6px',
    borderRadiusSmall: '4px',
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
    borderRadiusMedium: '6px',
    borderRadiusLarge: '6px',
    borderRadiusSmall: '4px',
    fontWeight: '500'
  },
  Card: {
    borderRadius: '8px',
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
         customPrimary.value = config['ui.theme.primary_color']
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
  background-color: var(--card-bg);
  color: var(--text-color);
  border-color: var(--card-border);
}

body.dark-mode .n-card__content,
body.light-mode .n-card__content {
  color: var(--text-color);
}

body.dark-mode .n-card:not(.n-card--bordered),
body.light-mode .n-card:not(.n-card--bordered) {
  border: 1px solid var(--card-border);
}

/* 按钮文字色：
   naive-ui 把每个按钮的文字色放在行内 CSS 变量 --n-text-color 上，
   .n-button 自身用 color: var(--n-text-color)，而 .n-button__content
   是独立元素，默认不继承，反而拿到了 body 的正文色 —— 于是：
     · 实心 primary 按钮 -> 深绿底 + 深灰字（2.79:1）
     · quaternary/ghost 透明按钮 -> 浅底 + 白字（1.08:1）
   这里让内容层直接读按钮自己的 --n-text-color，两种类型就都对了。
   （不能用 inherit：.n-button__content 的父级不是 .n-button 本身。） */
body.dark-mode .n-button .n-button__content,
body.light-mode .n-button .n-button__content,
body.dark-mode .n-button .n-button__icon,
body.light-mode .n-button .n-button__icon {
  color: var(--n-text-color) !important;
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
