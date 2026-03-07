<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton, NCheckbox, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'

const AgreementModal = defineAsyncComponent(() => import('@/components/AgreementModal.vue'))

const router = useRouter()
const message = useMessage()
const loading = ref(false)
const agreed = ref(false)
const showShake = ref(false)
const loginFormRef = ref(null)

// 协议弹窗状态
const showModal = ref(false)
const modalTitle = ref('')
const modalType = ref('admin')

const openAgreement = (type) => {
  modalType.value = type
  modalTitle.value = type === 'admin' ? '管理协议' : '隐私条款'
  showModal.value = true
}

const formData = ref({
  username: '',
  password: ''
})

const rules = {
  username: {
    required: true,
    message: '请输入管理员账号',
    trigger: ['blur', 'input']
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['blur', 'input']
  }
}

const triggerShake = () => {
  showShake.value = true
  setTimeout(() => {
    showShake.value = false
  }, 500)
}

const handleLogin = async () => {
  if (!agreed.value) {
    message.warning('请阅读并同意系统管理协议和隐私政策')
    triggerShake()
    return
  }

  loginFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const res = await adminApi.login(formData.value)
        localStorage.setItem('admin-token', res.data.token)
        localStorage.setItem('admin-info', JSON.stringify(res.data.admin))
        message.success('登录成功，欢迎进入管理系统')
        router.push('/dashboard')
      } catch (error) {
        message.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
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
        <n-form ref="loginFormRef" :model="formData" :rules="rules" label-placement="left" size="large">
          <n-form-item label="账号" path="username">
            <n-input
              v-model:value="formData.username"
              placeholder="请输入管理员账号"
              @keyup.enter="handleLogin"
            />
          </n-form-item>

          <n-form-item label="密码" path="password">
            <n-input
              v-model:value="formData.password"
              type="password"
              show-password-on="click"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            />
          </n-form-item>

          <div class="agreement-section" :class="{ shake: showShake }">
            <n-checkbox v-model:checked="agreed">
              我已阅读并同意 <a href="javascript:void(0)" class="link" @click.stop.prevent="openAgreement('admin')">管理协议</a> 和 <a href="javascript:void(0)" class="link" @click.stop.prevent="openAgreement('privacy')">隐私条款</a>
            </n-checkbox>
          </div>

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

    <!-- 协议弹窗 -->
    <AgreementModal
      v-if="showModal"
      v-model:show="showModal"
      :title="modalTitle"
      :type="modalType"
    />
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

.agreement-section {
  margin-top: -8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  transition: transform 0.1s;
}

.agreement-section.shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  transform: translate3d(0, 0, 0);
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.agreement-section :deep(.n-checkbox__label) {
  font-size: 0.85rem;
  color: #a1a1aa;
}

.link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.login-btn {
  font-weight: 600;
}
</style>
