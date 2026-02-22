import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { NIcon } from 'naive-ui'
import './style.css'
import './assets/theme-text-enhancement.css'
import './assets/fluid-adaptive.css'
import './assets/global-mobile.css'
import App from './App.vue'
import router from './router'
import { initCleanup } from './utils/indexedDB'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

// 全局注册NIcon组件
app.component('NIcon', NIcon)

import i18n from './i18n'

app.use(pinia)
app.use(router)
app.use(i18n)
app.mount('#app')

// 初始化 IndexedDB 清理（删除过期数据）
initCleanup()
