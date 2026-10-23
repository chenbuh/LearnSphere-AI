import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { consumeAdminHandoff } from './utils/adminSession'
import './style.css'
import './assets/fluid-adaptive.css'
import './assets/global-mobile.css'
import './assets/admin-theme.css'
import './assets/admin-utilities.css'

// 先接收前台登录页交接的 token，再安装路由守卫
consumeAdminHandoff()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
