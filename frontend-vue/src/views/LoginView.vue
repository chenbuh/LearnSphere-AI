<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { NCard, NTabs, NTabPane, NForm, NFormItem, NInput, NButton, NCheckbox, useMessage } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const activeTab = ref('login')
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    message.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    await userStore.login(loginForm.value.username, loginForm.value.password)
    message.success('欢迎回来！')
    router.push('/')
  } catch (e) {
    message.error('登录失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.value.username || !registerForm.value.password) {
    message.warning('请填写完整信息')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  // Mock registration
  loading.value = true
  setTimeout(() => {
    loading.value = false
    message.success('注册成功！请登录。')
    activeTab.value = 'login'
    loginForm.value.username = registerForm.value.username
  }, 1000)
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="brand">
        <h1>LearnSphere AI</h1>
        <p>智能英语学习平台</p>
      </div>
      
      <n-card class="login-card">
        <n-tabs v-model:value="activeTab" size="large" animated>
          <n-tab-pane name="login" tab="登录">
            <n-form>
              <n-form-item label="用户名">
                <n-input v-model:value="loginForm.username" placeholder="请输入用户名" />
              </n-form-item>
              <n-form-item label="密码">
                <n-input type="password" v-model:value="loginForm.password" placeholder="请输入密码" show-password-on="click" />
              </n-form-item>
              <div class="form-actions">
                <n-checkbox>记住我</n-checkbox>
                <a href="#" class="forgot-link">忘记密码？</a>
              </div>
              <n-button type="primary" block size="large" :loading="loading" @click="handleLogin" class="mt-4">
                登录
              </n-button>
            </n-form>
          </n-tab-pane>
          
          <n-tab-pane name="register" tab="注册">
            <n-form>
              <n-form-item label="用户名">
                <n-input v-model:value="registerForm.username" placeholder="请设置用户名" />
              </n-form-item>
              <n-form-item label="密码">
                <n-input type="password" v-model:value="registerForm.password" placeholder="至少6位字符" show-password-on="click" />
              </n-form-item>
              <n-form-item label="确认密码">
                <n-input type="password" v-model:value="registerForm.confirmPassword" placeholder="请再次输入密码" show-password-on="click" />
              </n-form-item>
              <n-button type="primary" block size="large" :loading="loading" @click="handleRegister" class="mt-4">
                创建账户
              </n-button>
            </n-form>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at center, #1e1e24 0%, #101014 100%);
  position: relative;
  overflow: hidden;
}

.login-wrapper::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%);
  top: -100px;
  left: -100px;
  border-radius: 50%;
  filter: blur(60px);
}

.login-wrapper::after {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0) 70%);
  bottom: -50px;
  right: -50px;
  border-radius: 50%;
  filter: blur(60px);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  z-index: 10;
}

.brand {
  text-align: center;
  margin-bottom: 32px;
}

.brand h1 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand p {
  color: #71717a;
}

.login-card {
  border-radius: 16px;
  background: rgba(30, 30, 35, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.forgot-link {
  color: #6366f1;
  text-decoration: none;
  font-size: 0.875rem;
}

.mt-4 {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }
  
  .brand h1 {
    font-size: 1.5rem;
  }
  
  .login-card {
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .brand h1 {
    font-size: 1.25rem;
  }
  
  .brand p {
    font-size: 0.85rem;
  }
}
</style>
