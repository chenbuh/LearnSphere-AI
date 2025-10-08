<script setup>
import { ref } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'

const router = useRouter()
const message = useMessage()
const loading = ref(false)

const formData = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    message.warning('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    const res = await adminApi.login(formData.value)
    
    // 保存token
    localStorage.setItem('admin-token', res.data.token)
    localStorage.setItem('admin-info', JSON.stringify(res.data.admin))
    
    message.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    message.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>📚 LearnSphere</h1>
        <p>管理后台登录</p>
      </div>

      <n-card class="login-card" :bordered="false">
        <n-form :model="formData" label-placement="left" size="large">
          <n-form-item label="账号">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入管理员账号"
              @keyup.enter="handleLogin"
            />
          </n-form-item>

          <n-form-item label="密码">
            <n-input
              v-model:value="formData.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            />
          </n-form-item>

          <n-button
            type="primary"
            block
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            登录
          </n-button>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  font-size: 1rem;
  color: #a1a1aa;
}

.login-card {
  background: rgba(30, 30, 35, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  padding: 10px;
}

.login-btn {
  margin-top: 12px;
  font-weight: 600;
}
</style>
