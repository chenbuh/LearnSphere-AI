<script setup>
import { NConfigProvider, NGlobalStyle, NMessageProvider, NDialogProvider, NNotificationProvider, darkTheme } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { commonApi } from '@/api/common'


document.body.classList.add('dark-mode')
document.documentElement.setAttribute('data-theme', 'dark')

// 永久使用深色主题
const theme = ref(darkTheme)

const themeOverrides = ref({
  common: {
    primaryColor: '#6366f1',
    primaryColorHover: '#818cf8',
    primaryColorPressed: '#4f46e5',
  },
  Button: {
    borderRadius: '8px',
  },
  Card: {
    borderRadius: '16px',
    color: 'var(--text-color)',
    colorEmbedded: 'var(--card-bg)',
    borderColor: 'var(--card-border)',
  }
})

onMounted(async () => {
  try {
    const res = await commonApi.getPublicConfigs()
    if (res.code === 200) {
      const config = res.data
      
      // 设置主色调
      if (config['ui.theme.primary_color']) {
         const color = config['ui.theme.primary_color']
         themeOverrides.value.common.primaryColor = color
         themeOverrides.value.common.primaryColorHover = color
         themeOverrides.value.common.primaryColorPressed = color
         themeOverrides.value.LoadingBar = { colorLoading: color }
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
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  /* background-color 由 n-global-style 接管，此处移除硬编码 */
}



/* 强制深色模式下的 Naive UI 组件样式 */
body.dark-mode .n-card {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--card-border) !important;
}

body.dark-mode .n-card__content {
  color: var(--text-color) !important;
}

body.dark-mode .n-card:not(.n-card--bordered) {
  border: 1px solid var(--card-border) !important;
}

/* 确保按钮文字可见 */
body.dark-mode .n-button__content {
  color: inherit;
}

/* 确保输入框在深色模式下可见 */
body.dark-mode .n-input,
body.dark-mode .n-input__input-el,
body.dark-mode .n-base-selection {
  background-color: var(--card-bg) !important;
  color: var(--text-color) !important;
  border-color: var(--card-border) !important;
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
