<script setup>
import { authApi } from '../api/auth'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { NCard, NTabs, NTabPane, NForm, NFormItem, NInput, NButton, NCheckbox, useMessage, NProgress, NModal, NSpace, NAlert, NDivider } from 'naive-ui'
import AgreementModal from '../components/AgreementModal.vue'
import { ShieldCheck, Mail, User, Lock, KeyRound, AlertCircle } from 'lucide-vue-next'
import confetti from 'canvas-confetti'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const activeTab = ref('login')
const loading = ref(false)
const agreed = ref(false)
const showShake = ref(false)

// 协议弹窗状态
const showModal = ref(false)
const modalTitle = ref('')
const modalType = ref('user')

// 重置密码弹窗状态
const showResetModal = ref(false)
const resetLoading = ref(false)
const resetForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const openAgreement = (type) => {
  modalType.value = type
  modalTitle.value = type === 'user' ? '用户协议' : '隐私政策'
  showModal.value = true
}

const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = ref({
  username: '',
  password: '',
  captchaCode: '',
  captchaKey: ''
})

const captchaRequired = ref(false)
const captchaImage = ref('')

const fetchCaptcha = async () => {
  try {
    const res = await authApi.getCaptcha()
    if (res.code === 200) {
      captchaImage.value = res.data.captchaImage
      loginForm.value.captchaKey = res.data.captchaKey
    }
  } catch (e) {
    console.error('获取验证码失败:', e)
  }
}

const checkCaptcha = async () => {
  if (!loginForm.value.username) return
  try {
    const res = await authApi.checkCaptchaRequired(loginForm.value.username)
    if (res.code === 200) {
      captchaRequired.value = res.data.required
      if (captchaRequired.value) {
        fetchCaptcha()
      }
    }
  } catch (e) {
    console.error('检查验证码需求失败:', e)
  }
}

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 表单校验规则
const rules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input']
  },
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: ['blur', 'input']
    },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'input']
    }
  ],
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['blur', 'input']
  },
  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: ['blur', 'input']
    },
    {
      validator: (rule, value) => {
        return value === registerForm.value.password
      },
      message: '两次输入的密码不一致',
      trigger: ['blur', 'input']
    }
  ]
}

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = registerForm.value.password
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 6) score += 20
  if (pwd.length >= 10) score += 20
  if (/[A-Z]/.test(pwd)) score += 20
  if (/[0-9]/.test(pwd)) score += 20
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20
  return score
})

const strengthStatus = computed(() => {
  const s = passwordStrength.value
  if (s <= 40) return 'error'
  if (s <= 80) return 'warning'
  return 'success'
})

const strengthText = computed(() => {
  const s = passwordStrength.value
  if (s === 0) return ''
  if (s <= 40) return '强度：弱'
  if (s <= 80) return '强度：中'
  return '强度：强'
})

// 抖动效果逻辑
const triggerShake = () => {
  showShake.value = true
  setTimeout(() => {
    showShake.value = false
  }, 500)
}

const handleLogin = async () => {
  if (!agreed.value) {
    message.warning('请阅读并同意用户协议和隐私政策')
    triggerShake()
    return
  }

  loginFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        await userStore.login(
          loginForm.value.username, 
          loginForm.value.password,
          loginForm.value.captchaCode,
          loginForm.value.captchaKey
        )
        message.success('欢迎回来！')
        router.push('/')
      } catch (e) {
        // 如果登录失败，重新检查是否需要验证码
        checkCaptcha()
        message.error('登录失败: ' + (e.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }
  })
}

const handleRegister = async () => {
  if (!agreed.value) {
    message.warning('请阅读并同意用户协议和隐私政策')
    triggerShake()
    return
  }

  registerFormRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true
      try {
        const res = await authApi.register({
          username: registerForm.value.username,
          email: registerForm.value.email,
          password: registerForm.value.password
        })
        
        if (res.code === 200) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#10b981']
          })
          
          message.success('注册成功！赶紧登录开启学习旅程吧 ✨')
          activeTab.value = 'login'
          loginForm.value.username = registerForm.value.username
        } else {
          message.error(res.message || '注册失败，请重试')
        }
      } catch (e) {
        console.error('注册失败:', e)
        message.error(e.message || '注册请求异常')
      } finally {
        loading.value = false
      }
    }
  })
}
const handleResetPassword = async () => {
  if (!resetForm.value.username || !resetForm.value.email || !resetForm.value.password) {
     message.error('请填写完整的重置信息')
     return
  }
  if (resetForm.value.password !== resetForm.value.confirmPassword) {
     message.error('两次输入的密码不一致')
     return
  }

  resetLoading.value = true
  try {
     const res = await authApi.resetPassword(resetForm.value)
     if (res.code === 200) {
        message.success('密码重置成功，请重新登录')
        showResetModal.value = false
        activeTab.value = 'login'
        loginForm.value.username = resetForm.value.username
     } else {
        message.error(res.message || '重置失败')
     }
  } catch (e) {
     message.error('重置请求异常')
  } finally {
     resetLoading.value = false
  }
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
            <n-form ref="loginFormRef" :model="loginForm" :rules="rules">
              <n-form-item label="用户名" path="username">
                <n-input v-model:value="loginForm.username" placeholder="请输入用户名" @blur="checkCaptcha" @keyup.enter="handleLogin" />
              </n-form-item>
              <n-form-item label="密码" path="password">
                <n-input type="password" v-model:value="loginForm.password" placeholder="请输入密码" show-password-on="click" @keyup.enter="handleLogin" />
              </n-form-item>
              
              <n-form-item v-if="captchaRequired" label="验证码" path="captchaCode">
                <div class="captcha-row">
                  <n-input v-model:value="loginForm.captchaCode" placeholder="请输入验证码" @keyup.enter="handleLogin" />
                  <div class="captcha-img" @click="fetchCaptcha" title="点击刷新">
                    <img :src="captchaImage" alt="验证码" />
                  </div>
                </div>
              </n-form-item>

              <div class="form-actions">
                <n-checkbox>记住我</n-checkbox>
                <a href="javascript:void(0)" class="forgot-link" @click="showResetModal = true">忘记密码？</a>
              </div>
              <div class="agreement-section" :class="{ shake: showShake }">
                <n-checkbox v-model:checked="agreed">
                  我已阅读并同意 <a href="javascript:void(0)" class="link" @click="openAgreement('user')">用户协议</a> 和 <a href="javascript:void(0)" class="link" @click="openAgreement('privacy')">隐私政策</a>
                </n-checkbox>
              </div>
              <n-button type="primary" block size="large" :loading="loading" @click="handleLogin" class="mt-4">
                登录
              </n-button>
            </n-form>
          </n-tab-pane>
          
          <n-tab-pane name="register" tab="注册">
            <n-form ref="registerFormRef" :model="registerForm" :rules="rules">
              <n-form-item label="用户名" path="username">
                <n-input v-model:value="registerForm.username" placeholder="请设置用户名" @keyup.enter="handleRegister" />
              </n-form-item>
              
              <n-form-item label="邮箱" path="email">
                <n-input v-model:value="registerForm.email" placeholder="用于找回密码（必填）" @keyup.enter="handleRegister">
                  <template #prefix><Mail :size="16" /></template>
                </n-input>
              </n-form-item>

              <n-form-item label="密码" path="password">
                <n-input type="password" v-model:value="registerForm.password" placeholder="至少6位字符" show-password-on="click" @keyup.enter="handleRegister" />
              </n-form-item>
              
              <!-- 密码强度 -->
              <div v-if="registerForm.password" class="strength-meter">
                <div class="strength-text">{{ strengthText }}</div>
                <n-progress
                  type="line"
                  :percentage="passwordStrength"
                  :status="strengthStatus"
                  :show-indicator="false"
                  :height="4"
                  border-radius="2px"
                />
              </div>

              <n-form-item label="确认密码" path="confirmPassword">
                <n-input type="password" v-model:value="registerForm.confirmPassword" placeholder="请再次输入密码" show-password-on="click" @keyup.enter="handleRegister" />
              </n-form-item>
              <div class="agreement-section" :class="{ shake: showShake }">
                <n-checkbox v-model:checked="agreed">
                  我已阅读并同意 <a href="javascript:void(0)" class="link" @click="openAgreement('user')">用户协议</a> 和 <a href="javascript:void(0)" class="link" @click="openAgreement('privacy')">隐私政策</a>
                </n-checkbox>
              </div>
              <n-button type="primary" block size="large" :loading="loading" @click="handleRegister" class="mt-4">
                创建账户
              </n-button>
            </n-form>
          </n-tab-pane>
        </n-tabs>
      </n-card>
    </div>

    <!-- 协议弹窗 -->
    <AgreementModal
      v-model:show="showModal"
      :title="modalTitle"
      :type="modalType"
    />

    <!-- Forgot Password Modal -->
    <n-modal v-model:show="showResetModal" preset="card" style="width: 450px; border-radius: 24px;" :bordered="false" :trap-focus="true" :auto-focus="true" class="reset-password-modal">
        <template #header>
            <div class="reset-header">
                <div class="reset-icon bg-indigo-500/20 text-indigo-400 p-2 rounded-xl">
                    <KeyRound :size="20" />
                </div>
                <span>重置您的密码</span>
            </div>
        </template>
        
        <div class="reset-body">
            <n-alert type="warning" class="mb-6" :show-icon="false">
                为确保安全，我们需要验证您的<strong>用户名</strong>及<strong>注册邮箱</strong>。
            </n-alert>
            
            <n-form label-placement="left" label-width="80">
                <n-form-item label="用户名">
                    <n-input v-model:value="resetForm.username" placeholder="注册时的用户名">
                        <template #prefix><User :size="14" /></template>
                    </n-input>
                </n-form-item>
                <n-form-item label="注册邮箱">
                    <n-input v-model:value="resetForm.email" placeholder="注册时的邮箱地址">
                        <template #prefix><Mail :size="14" /></template>
                    </n-input>
                </n-form-item>
                <n-divider title-placement="center" class="my-4">设置新密码</n-divider>
                <n-form-item label="新密码">
                    <n-input type="password" v-model:value="resetForm.password" placeholder="至少6位字符">
                        <template #prefix><Lock :size="14" /></template>
                    </n-input>
                </n-form-item>
                <n-form-item label="确认密码">
                    <n-input type="password" v-model:value="resetForm.confirmPassword" placeholder="再次确认新密码">
                        <template #prefix><ShieldCheck :size="14" /></template>
                    </n-input>
                </n-form-item>
            </n-form>

            <n-button 
                type="primary" 
                block 
                round 
                size="large" 
                class="mt-4 reset-final-btn" 
                :loading="resetLoading"
                @click="handleResetPassword"
            >
                验证并立即重置
            </n-button>
            <p class="text-[10px] text-center mt-4 text-zinc-500 uppercase tracking-tighter">
                <ShieldCheck :size="10" /> Protected by LearnSphere Security Tunnel
            </p>
        </div>
    </n-modal>
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

.agreement-section {
  margin-top: 16px;
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

.strength-meter {
  margin-bottom: 12px;
  margin-top: -12px;
}

.strength-text {
  font-size: 0.75rem;
  color: #71717a;
  margin-bottom: 4px;
  text-align: right;
}

.agreement-section :deep(.n-checkbox__label) {
  font-size: 0.85rem;
  color: #71717a;
}

.link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
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

.reset-password-modal {
    background: rgba(20, 20, 25, 0.98) !important;
    backdrop-filter: blur(30px) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.reset-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 800;
    color: #fff;
}
.reset-final-btn {
    height: 50px;
    font-weight: 700;
    box-shadow: 0 8px 20px -5px rgba(99, 102, 241, 0.4);
}
.forgot-link {
    color: #71717a;
    font-size: 0.85rem;
    text-decoration: none;
    transition: color 0.2s;
}
.forgot-link:hover {
    color: #6366f1;
}

.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-img {
  width: 120px;
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
