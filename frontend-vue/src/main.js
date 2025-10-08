import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NIcon } from 'naive-ui'
import './style.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

// 全局注册NIcon组件
app.component('NIcon', NIcon)

app.use(pinia)
app.use(router)
app.mount('#app')
