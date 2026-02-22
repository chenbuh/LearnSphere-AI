import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import './assets/fluid-adaptive.css'
import './assets/global-mobile.css'
import './assets/scroll-fix.css' // 滚动修复样式
import './assets/content-display-fix.css' // 内容显示修复

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
