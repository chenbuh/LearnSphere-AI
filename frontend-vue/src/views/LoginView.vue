<script setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCheckbox,
  NForm,
  NFormItem,
  NInput,
  NTag,
  useMessage
} from 'naive-ui'
import { BarChart2, Brain, Target, Zap } from 'lucide-vue-next'
import { authApi } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import SiteHeader from '@/components/SiteHeader.vue'

const AgreementModal = defineAsyncComponent(() => import('@/components/AgreementModal.vue'))

const router = useRouter()
const route = useRoute()
const message = useMessage()
const userStore = useUserStore()

const loginFormRef = ref(null)
const registerFormRef = ref(null)
const activeMode = ref('login')
const submitting = ref(false)
const checkingCaptcha = ref(false)
const showShake = ref(false)

const showAgreementModal = ref(false)
const agreementTitle = ref('')
const agreementType = ref('user')

const agreed = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const captchaState = reactive({
  required: false,
  image: '',
  key: '',
  checkedFor: '',
  loading: false
})

const highlightItems = [
  {
    title: 'AI 定位',
    description: '先补最值得处理的知识点。',
    accent: '当前短板',
    icon: Brain
  },
  {
    title: '训练续接',
    description: '词汇、语法与专项任务自动续上。',
    accent: '推荐节奏',
    icon: Target
  },
  {
    title: '进度留存',
    description: '连续学习、错题与完成率持续保存。',
    accent: '学习反馈',
    icon: BarChart2
  }
]

const heroProofs = [
  {
    label: '学习记录',
    value: '保留上次进度、答题与错题'
  },
  {
    label: '推荐路径',
    value: '登录后直接回到当前训练节奏'
  }
]

const trustSignals = [
  '记录同步',
  '登录校验',
  '数据保存'
]

const redirectTarget = computed(() => {
  const raw = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return typeof raw === 'string' && raw.startsWith('/') ? raw : '/app/dashboard'
})

const hasCustomRedirect = computed(() => redirectTarget.value !== '/app/dashboard')

const loginRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input']
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['blur', 'input']
  },
  captchaCode: {
    validator: (_rule, value) => {
      if (!captchaState.required) {
        return true
      }

      if (String(value || '').trim()) {
        return true
      }

      return new Error('请输入验证码')
    },
    trigger: ['blur', 'input']
  }
}

const registerRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input']
  },
  email: {
    required: true,
    validator: (_rule, value) => {
      const email = String(value || '').trim()
      if (!email) {
        return new Error('请输入邮箱')
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(email) ? true : new Error('请输入有效的邮箱地址')
    },
    trigger: ['blur', 'input']
  },
  password: {
    required: true,
    validator: (_rule, value) => {
      return String(value || '').length >= 6 ? true : new Error('密码至少需要 6 位')
    },
    trigger: ['blur', 'input']
  },
  confirmPassword: {
    required: true,
    validator: (_rule, value) => {
      if (!String(value || '')) {
        return new Error('请再次输入密码')
      }

      return value === registerForm.password ? true : new Error('两次输入的密码不一致')
    },
    trigger: ['blur', 'input']
  }
}

const triggerShake = () => {
  showShake.value = true
  window.setTimeout(() => {
    showShake.value = false
  }, 420)
}

const openAgreement = type => {
  agreementType.value = type
  agreementTitle.value = type === 'privacy' ? '隐私条款' : '用户协议'
  showAgreementModal.value = true
}

const resetCaptcha = (checkedFor = '') => {
  captchaState.required = false
  captchaState.image = ''
  captchaState.key = ''
  captchaState.checkedFor = checkedFor
  loginForm.captchaCode = ''
}

const refreshCaptcha = async () => {
  if (!loginForm.username.trim()) {
    return
  }

  captchaState.loading = true

  try {
    const res = await authApi.getCaptcha()
    captchaState.image = res.data.captchaImage
    captchaState.key = res.data.captchaKey
  } catch (error) {
    message.error(error.message || '验证码加载失败，请稍后再试')
  } finally {
    captchaState.loading = false
  }
}

const syncCaptchaRequirement = async (force = false) => {
  const username = loginForm.username.trim()

  if (!username) {
    resetCaptcha()
    return
  }

  if (!force && captchaState.checkedFor === username) {
    return
  }

  checkingCaptcha.value = true

  try {
    const res = await authApi.checkCaptchaRequired(username)
    const required = Boolean(res.data?.required)

    captchaState.checkedFor = username

    if (required) {
      captchaState.required = true
      await refreshCaptcha()
      return
    }

    resetCaptcha(username)
  } catch (error) {
    message.warning(error.message || '验证码状态检查失败，请稍后再试')
  } finally {
    checkingCaptcha.value = false
  }
}

const goAfterAuth = async (replace = false) => {
  const navigationTarget = redirectTarget.value
  if (replace) {
    await router.replace(navigationTarget)
    return
  }

  await router.push(navigationTarget)
}

const ensureAgreementAccepted = () => {
  if (agreed.value) {
    return true
  }

  message.warning('请先阅读并同意用户协议和隐私条款')
  triggerShake()
  return false
}

const handleLogin = async () => {
  if (!ensureAgreementAccepted()) {
    return
  }

  await syncCaptchaRequirement()

  try {
    await loginFormRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true

  try {
    await userStore.login(
      loginForm.username.trim(),
      loginForm.password,
      loginForm.captchaCode.trim(),
      captchaState.key
    )

    message.success('登录成功，正在进入学习中心')
    await goAfterAuth()
  } catch (error) {
    message.error(error.message || '登录失败，请检查账号信息')

    if (captchaState.required) {
      loginForm.captchaCode = ''
      await refreshCaptcha()
    }
  } finally {
    submitting.value = false
  }
}

const clearRegisterForm = () => {
  registerForm.username = ''
  registerForm.nickname = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.confirmPassword = ''
}

const handleRegister = async () => {
  if (!ensureAgreementAccepted()) {
    return
  }

  try {
    await registerFormRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true

  try {
    await userStore.register({
      username: registerForm.username.trim(),
      nickname: registerForm.nickname.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password
    })

    message.success('注册成功，请使用新账号登录')
    loginForm.username = registerForm.username.trim()
    loginForm.password = ''
    activeMode.value = 'login'
    clearRegisterForm()
  } catch (error) {
    message.error(error.message || '注册失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

watch(
  () => route.query.mode,
  mode => {
    const nextMode = mode === 'register' ? 'register' : 'login'
    if (activeMode.value !== nextMode) {
      activeMode.value = nextMode
    }
  },
  { immediate: true }
)

watch(activeMode, mode => {
  const currentMode = route.query.mode === 'register' ? 'register' : 'login'
  if (mode === currentMode) {
    return
  }

  const query = { ...route.query }

  if (mode === 'register') {
    query.mode = 'register'
  } else {
    delete query.mode
  }

  router.replace({ path: route.path, query }).catch(() => {})
})

watch(
  () => loginForm.username,
  value => {
    const username = value.trim()
    if (!username) {
      resetCaptcha()
      return
    }

    if (captchaState.checkedFor && captchaState.checkedFor !== username) {
      resetCaptcha()
    }
  }
)

onMounted(async () => {
  if (userStore.token) {
    await goAfterAuth(true)
  }
})
</script>

<template>
  <div class="login-page">
    <SiteHeader />

    <main class="auth-main">
      <section class="auth-shell">
        <div class="auth-visual">
          <div class="visual-orb visual-orb--primary"></div>
          <div class="visual-orb visual-orb--secondary"></div>

          <div class="hero-stage">
            <div class="hero-kicker">
              <span class="kicker-dot"></span>
              LearnSphere 账户中心
            </div>

            <div class="hero-copy">
              <p class="hero-overline">LearnSphere AI</p>
              <h1>
                <span class="hero-line">回到账号后，</span>
                <span class="hero-line hero-line--accent">继续你的学习轨迹</span>
              </h1>
              <p class="hero-description">
                学习记录、错题与训练建议会自动续接，打开后就能从上次停下的位置继续。
              </p>
            </div>
          </div>

          <div class="hero-proof-strip">
            <article
              v-for="proof in heroProofs"
              :key="proof.label"
              class="proof-item"
            >
              <span class="proof-label">{{ proof.label }}</span>
              <strong>{{ proof.value }}</strong>
            </article>
          </div>

          <div class="feature-rail">
            <article
              v-for="(item, index) in highlightItems"
              :key="item.title"
              class="feature-item"
            >
              <div class="feature-mark">
                <span class="feature-icon">
                  <component :is="item.icon" :size="15" />
                </span>
                <span class="feature-index">{{ `0${index + 1}` }}</span>
              </div>

              <div class="feature-copy">
                <div class="feature-meta">
                  <span>{{ item.accent }}</span>
                </div>
                <h2>{{ item.title }}</h2>
                <p>{{ item.description }}</p>
              </div>
            </article>
          </div>

          <div class="trust-strip">
            <span
              v-for="signal in trustSignals"
              :key="signal"
              class="trust-item"
            >
              {{ signal }}
            </span>
          </div>
        </div>

        <section class="auth-panel">
          <div class="panel-heading">
            <div>
              <p class="panel-kicker">{{ activeMode === 'login' ? '欢迎回来' : '创建账号' }}</p>
              <h2>{{ activeMode === 'login' ? '进入你的学习空间' : '开始建立你的学习档案' }}</h2>
              <p class="panel-description">
                {{ activeMode === 'login'
                  ? '输入账号后即可继续之前的学习进度。'
                  : '注册后可同步保存学习记录、计划和分析结果。' }}
              </p>
            </div>

            <NTag v-if="hasCustomRedirect" type="info" round>
              登录后继续访问 {{ redirectTarget }}
            </NTag>
          </div>

          <div class="auth-surface">
            <div class="mode-switch">
              <button
                type="button"
                class="mode-button"
                :class="{ active: activeMode === 'login' }"
                @click="activeMode = 'login'"
              >
                登录
              </button>
              <button
                type="button"
                class="mode-button"
                :class="{ active: activeMode === 'register' }"
                @click="activeMode = 'register'"
              >
                注册
              </button>
            </div>

            <NForm
              v-if="activeMode === 'login'"
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              label-placement="top"
              size="large"
              class="auth-form"
            >
              <NFormItem label="用户名" path="username">
                <NInput
                  v-model:value="loginForm.username"
                  placeholder="请输入用户名"
                  autocomplete="username"
                  @blur="syncCaptchaRequirement()"
                  @keyup.enter="handleLogin"
                />
              </NFormItem>

              <NFormItem label="密码" path="password">
                <NInput
                  v-model:value="loginForm.password"
                  type="password"
                  show-password-on="click"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  @keyup.enter="handleLogin"
                />
              </NFormItem>

              <div v-if="checkingCaptcha" class="captcha-hint">
                正在检查是否需要验证码...
              </div>

              <div v-if="captchaState.required" class="captcha-block">
                <NFormItem label="验证码" path="captchaCode" class="captcha-field">
                  <NInput
                    v-model:value="loginForm.captchaCode"
                    placeholder="请输入图片中的验证码"
                    autocomplete="off"
                    @keyup.enter="handleLogin"
                  />
                </NFormItem>

                <div class="captcha-preview">
                  <button
                    type="button"
                    class="captcha-image"
                    :disabled="captchaState.loading"
                    @click="refreshCaptcha"
                  >
                    <img
                      v-if="captchaState.image"
                      :src="captchaState.image"
                      alt="登录验证码"
                    >
                    <span v-else>{{ captchaState.loading ? '加载中...' : '获取验证码' }}</span>
                  </button>

                  <NButton text type="primary" :disabled="captchaState.loading" @click="refreshCaptcha">
                    换一张
                  </NButton>
                </div>
              </div>

              <div class="agreement-row" :class="{ shake: showShake }">
                <NCheckbox v-model:checked="agreed">
                  我已阅读并同意
                  <a href="javascript:void(0)" class="agreement-link" @click.stop.prevent="openAgreement('user')">
                    用户协议
                  </a>
                  和
                  <a href="javascript:void(0)" class="agreement-link" @click.stop.prevent="openAgreement('privacy')">
                    隐私条款
                  </a>
                </NCheckbox>
              </div>

              <NButton
                type="primary"
                block
                size="large"
                class="submit-button"
                :loading="submitting"
                @click="handleLogin"
              >
                登录并继续学习
              </NButton>
            </NForm>

            <NForm
              v-else
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              label-placement="top"
              size="large"
              class="auth-form"
            >
              <NFormItem label="用户名" path="username">
                <NInput
                  v-model:value="registerForm.username"
                  placeholder="用于登录的用户名"
                  autocomplete="username"
                  @keyup.enter="handleRegister"
                />
              </NFormItem>

              <NFormItem label="昵称">
                <NInput
                  v-model:value="registerForm.nickname"
                  placeholder="学习社区中展示的昵称（选填）"
                  autocomplete="nickname"
                  @keyup.enter="handleRegister"
                />
              </NFormItem>

              <NFormItem label="邮箱" path="email">
                <NInput
                  v-model:value="registerForm.email"
                  placeholder="用于接收账号通知"
                  autocomplete="email"
                  @keyup.enter="handleRegister"
                />
              </NFormItem>

              <NFormItem label="密码" path="password">
                <NInput
                  v-model:value="registerForm.password"
                  type="password"
                  show-password-on="click"
                  placeholder="至少 6 位"
                  autocomplete="new-password"
                  @keyup.enter="handleRegister"
                />
              </NFormItem>

              <NFormItem label="确认密码" path="confirmPassword">
                <NInput
                  v-model:value="registerForm.confirmPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="请再次输入密码"
                  autocomplete="new-password"
                  @keyup.enter="handleRegister"
                />
              </NFormItem>

              <div class="agreement-row" :class="{ shake: showShake }">
                <NCheckbox v-model:checked="agreed">
                  我已阅读并同意
                  <a href="javascript:void(0)" class="agreement-link" @click.stop.prevent="openAgreement('user')">
                    用户协议
                  </a>
                  和
                  <a href="javascript:void(0)" class="agreement-link" @click.stop.prevent="openAgreement('privacy')">
                    隐私条款
                  </a>
                </NCheckbox>
              </div>

              <NButton
                type="primary"
                block
                size="large"
                class="submit-button"
                :loading="submitting"
                @click="handleRegister"
              >
                创建账号并开始学习
              </NButton>
            </NForm>

            <div class="panel-footer">
              <span>{{ activeMode === 'login' ? '还没有账号？' : '已经有账号？' }}</span>
              <button
                type="button"
                class="footer-switch"
                @click="activeMode = activeMode === 'login' ? 'register' : 'login'"
              >
                {{ activeMode === 'login' ? '立即注册' : '返回登录' }}
              </button>
            </div>
          </div>

          <div class="panel-note">
            <Zap :size="16" />
            <span>首次进入后，系统会自动续接训练路径与个性建议。</span>
          </div>
        </section>
      </section>
    </main>

    <AgreementModal
      v-if="showAgreementModal"
      v-model:show="showAgreementModal"
      :title="agreementTitle"
      :type="agreementType"
    />
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 16%, rgba(99, 102, 241, 0.16), transparent 30%),
    radial-gradient(circle at 84% 12%, rgba(56, 189, 248, 0.12), transparent 24%),
    radial-gradient(circle at 18% 86%, rgba(45, 212, 191, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.16), transparent 20%),
    var(--bg-color);
}

.auth-main {
  box-sizing: border-box;
  min-height: calc(100svh - 64px);
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 12px 24px 18px;
}

.auth-shell {
  position: relative;
  width: min(1248px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(452px, 492px);
  gap: 0;
  align-items: stretch;
  border-radius: 36px;
  overflow: hidden;
  border: 1px solid var(--glass-border);
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.22));
  box-shadow: 0 32px 84px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(26px);
}

.auth-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(120deg, rgba(99, 102, 241, 0.1), transparent 34%),
    radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.12), transparent 24%),
    linear-gradient(90deg, transparent 0%, transparent 64%, rgba(255, 255, 255, 0.035) 64%, rgba(255, 255, 255, 0.02) 100%);
}

.auth-visual {
  position: relative;
  overflow: hidden;
  min-height: clamp(468px, calc(100svh - 184px), 552px);
  padding: 32px 38px 28px;
  display: grid;
  grid-template-rows: repeat(4, auto);
  align-content: start;
  gap: 14px;
  isolation: isolate;
}

.auth-visual::before,
.auth-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-visual::before {
  background:
    linear-gradient(140deg, rgba(99, 102, 241, 0.1), transparent 42%),
    radial-gradient(circle at 78% 26%, rgba(59, 130, 246, 0.16), transparent 18%);
}

.visual-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.9;
}

.visual-orb--primary {
  width: 240px;
  height: 240px;
  top: 72px;
  right: -32px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.34), rgba(99, 102, 241, 0));
}

.visual-orb--secondary {
  width: 180px;
  height: 180px;
  left: -40px;
  bottom: 90px;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.2), rgba(45, 212, 191, 0));
}

.auth-panel {
  position: relative;
  width: 100%;
  padding: 34px 34px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.32));
  border-left: 1px solid rgba(148, 163, 184, 0.12);
}

.auth-panel::before {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent 18%),
    radial-gradient(circle at 28% 0%, rgba(56, 189, 248, 0.08), transparent 28%);
}

.hero-stage {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  position: relative;
  z-index: 1;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kicker-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 18px rgba(129, 140, 248, 0.7);
}

.hero-copy {
  position: relative;
  max-width: 520px;
  display: grid;
  gap: 10px;
}

.hero-overline {
  margin: 0;
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  max-width: 11.2ch;
  font-size: clamp(2.24rem, 3.05vw, 3.48rem);
  line-height: 0.96;
  letter-spacing: -0.055em;
  color: var(--text-color);
}

.hero-line {
  display: block;
}

.hero-line--accent {
  background: linear-gradient(92deg, #38bdf8 0%, #818cf8 48%, #34d399 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  margin: 0;
  max-width: 33ch;
  color: var(--secondary-text);
  font-size: 0.92rem;
  line-height: 1.62;
}

.hero-proof-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  position: relative;
  z-index: 1;
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.proof-item {
  display: grid;
  gap: 6px;
  padding-right: 22px;
}

.proof-item + .proof-item {
  padding-left: 22px;
  border-left: 1px solid rgba(148, 163, 184, 0.14);
}

.proof-label {
  color: #93c5fd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.proof-item strong {
  color: var(--text-color);
  font-size: 0.94rem;
  line-height: 1.55;
  font-weight: 600;
}

.feature-rail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  position: relative;
  z-index: 1;
  margin-top: 2px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.feature-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  align-content: start;
  min-height: 128px;
  padding: 16px 22px 0 0;
  border-bottom: none;
}

.feature-item + .feature-item {
  padding-left: 22px;
  border-left: 1px solid rgba(148, 163, 184, 0.12);
}

.feature-mark {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
}

.feature-index {
  color: #93c5fd;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.feature-copy {
  min-width: 0;
}

.feature-meta {
  display: inline-flex;
  align-items: center;
  margin-bottom: 6px;
  color: #a78bfa;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.feature-item h2 {
  margin: 0 0 7px;
  font-size: 0.96rem;
  color: var(--text-color);
}

.feature-item p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.58;
  font-size: 0.85rem;
}

.trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  position: relative;
  z-index: 1;
  align-items: center;
  padding-top: 12px;
}

.trust-item {
  display: inline-flex;
  align-items: center;
  position: relative;
  color: #a5b4fc;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.trust-item + .trust-item {
  margin-left: 18px;
}

.trust-item + .trust-item::before {
  content: '';
  position: absolute;
  left: -11px;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.5);
  transform: translateY(-50%);
}

.panel-heading {
  display: grid;
  gap: 8px;
  width: min(100%, 396px);
  margin: 0 auto;
}

.panel-kicker {
  margin: 0 0 10px;
  color: #22c55e;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.panel-heading h2 {
  margin: 0;
  font-size: 1.66rem;
  line-height: 1.08;
  letter-spacing: -0.04em;
  color: var(--text-color);
}

.panel-description {
  margin: 8px 0 0;
  max-width: 30ch;
  color: var(--secondary-text);
  line-height: 1.56;
  font-size: 0.92rem;
}

.auth-surface {
  position: relative;
  width: min(100%, 396px);
  margin: 0 auto;
  padding: 18px 0 0;
}

.auth-surface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.2), rgba(148, 163, 184, 0.04));
}

.mode-switch {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 8px;
  margin-bottom: 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.mode-button {
  appearance: none;
  border: none;
  border-radius: 14px;
  min-height: 44px;
  background: transparent;
  color: var(--secondary-text);
  font-size: 0.96rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.mode-button:hover {
  color: var(--text-color);
}

.mode-button.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.24), rgba(59, 130, 246, 0.18));
  color: #eef2ff;
  transform: translateY(-1px);
}

.auth-form {
  display: grid;
}

.auth-form :deep(.n-form-item) {
  margin-bottom: 16px;
}

.auth-form :deep(.n-form-item .n-form-item-label) {
  padding-bottom: 8px;
}

.auth-form :deep(.n-input) {
  --n-height: 40px;
}

.captcha-hint {
  margin: -4px 0 16px;
  color: var(--secondary-text);
  font-size: 0.86rem;
}

.captcha-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 14px;
  align-items: end;
}

.captcha-field {
  margin-bottom: 0;
}

.captcha-preview {
  display: grid;
  justify-items: stretch;
  gap: 8px;
}

.captcha-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  aspect-ratio: 3 / 1;
  padding: 0;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  overflow: hidden;
  cursor: pointer;
  color: var(--secondary-text);
}

.captcha-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.agreement-row {
  margin-top: 6px;
  margin-bottom: 18px;
  transition: transform 0.12s ease;
}

.agreement-row :deep(.n-checkbox__label) {
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.8;
}

.agreement-link {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
}

.agreement-link:hover {
  text-decoration: underline;
}

.submit-button {
  min-height: 48px;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(99, 102, 241, 0.22);
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
  color: var(--secondary-text);
  font-size: 0.92rem;
}

.footer-switch {
  appearance: none;
  border: none;
  background: transparent;
  color: #60a5fa;
  font-weight: 700;
  cursor: pointer;
}

.panel-note {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  width: min(100%, 396px);
  margin-left: auto;
  margin-right: auto;
  padding: 8px 0 0;
  color: var(--secondary-text);
  font-size: 0.82rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.shake {
  animation: shake 0.42s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

:global(html[data-theme='light'] .auth-shell) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(248, 250, 252, 0.92));
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 24px 70px rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .auth-panel) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.76), rgba(248, 250, 252, 0.7));
  border-left-color: rgba(148, 163, 184, 0.16);
  border-top-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .mode-switch) {
  background: rgba(226, 232, 240, 0.5);
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .mode-button.active) {
  color: #1e1b4b;
}

:global(html[data-theme='light'] .trust-item) {
  color: #4f46e5;
}

:global(html[data-theme='light'] .panel-note) {
  border-top-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .hero-proof-strip),
:global(html[data-theme='light'] .proof-item + .proof-item),
:global(html[data-theme='light'] .feature-item) {
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .trust-item + .trust-item::before) {
  background: rgba(148, 163, 184, 0.6);
}

:global(html[data-theme='light'] .auth-surface::before) {
  background: linear-gradient(90deg, rgba(148, 163, 184, 0.22), rgba(148, 163, 184, 0.05));
}

:global(html[data-theme='light'] .captcha-image) {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(148, 163, 184, 0.2);
}

@media (max-width: 1080px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    min-height: auto;
  }

  .auth-panel {
    border-left: none;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
  }

  .panel-heading,
  .auth-surface,
  .panel-note {
    width: 100%;
  }

  .hero-copy h1 {
    max-width: 12ch;
  }

  .hero-proof-strip {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .auth-main {
    min-height: auto;
    align-items: flex-start;
    overflow: visible;
    padding: 12px 12px 28px;
  }

  .auth-shell {
    border-radius: 24px;
  }

  .auth-panel {
    padding: 22px 18px 18px;
  }

  .auth-panel {
    order: -1;
    border-top: none;
  }

  .auth-visual {
    order: 1;
    padding: 18px 18px 20px;
    gap: 12px;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
  }

  .hero-stage {
    gap: 12px;
  }

  .hero-kicker {
    gap: 8px;
    padding: 8px 12px;
    font-size: 0.74rem;
    letter-spacing: 0.1em;
  }

  .hero-copy {
    gap: 8px;
  }

  .hero-copy h1 {
    max-width: none;
    font-size: 1.96rem;
    line-height: 1.02;
  }

  .hero-overline {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
  }

  .hero-description {
    max-width: none;
    font-size: 0.88rem;
    line-height: 1.56;
  }

  .panel-heading {
    gap: 6px;
  }

  .panel-kicker {
    margin-bottom: 6px;
  }

  .panel-heading h2 {
    font-size: 1.5rem;
  }

  .panel-description {
    max-width: none;
    margin-top: 6px;
  }

  .auth-surface {
    padding-top: 14px;
  }

  .mode-switch {
    margin-bottom: 14px;
    padding: 6px;
    border-radius: 16px;
  }

  .mode-button {
    min-height: 42px;
    font-size: 0.94rem;
  }

  .hero-proof-strip {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 10px 0 0;
    border-bottom: none;
  }

  .proof-item {
    gap: 4px;
    padding-right: 0;
  }

  .proof-item + .proof-item {
    padding-left: 0;
    padding-top: 12px;
    margin-top: 12px;
    border-left: none;
    border-top: 1px solid rgba(148, 163, 184, 0.14);
  }

  .feature-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 4px;
    border-top: none;
  }

  .feature-item {
    min-height: 0;
    gap: 8px;
    padding: 12px 0 0;
    border-bottom: none;
  }

  .feature-item + .feature-item {
    padding-left: 0;
    border-left: none;
  }

  .feature-item:last-child {
    grid-column: 1 / -1;
    padding-top: 12px;
    border-top: 1px solid rgba(148, 163, 184, 0.12);
  }

  .feature-icon {
    width: 30px;
    height: 30px;
    border-radius: 10px;
  }

  .feature-index {
    font-size: 0.74rem;
  }

  .feature-meta {
    margin-bottom: 4px;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
  }

  .feature-item h2 {
    margin-bottom: 4px;
    font-size: 0.9rem;
  }

  .feature-item p {
    font-size: 0.8rem;
    line-height: 1.46;
  }

  .trust-strip {
    gap: 8px 14px;
    padding-top: 10px;
  }

  .trust-item + .trust-item {
    margin-left: 0;
  }

  .trust-item + .trust-item::before {
    display: none;
  }

  .captcha-block {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .captcha-preview {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
  }

  .captcha-image {
    min-height: 0;
    border-radius: 16px;
  }

  .agreement-row {
    margin: 4px 0 16px;
  }

  .agreement-row :deep(.n-checkbox) {
    align-items: flex-start;
  }

  .agreement-row :deep(.n-checkbox__label) {
    line-height: 1.68;
  }

  .panel-footer {
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .panel-note {
    width: 100%;
    margin-top: 4px;
    align-items: flex-start;
    padding: 10px 0 0;
    line-height: 1.5;
  }

  .visual-orb--primary {
    width: 180px;
    height: 180px;
    top: 52px;
    right: -26px;
  }

  .visual-orb--secondary {
    width: 128px;
    height: 128px;
    left: -24px;
    bottom: 68px;
  }
}

@media (max-width: 480px) {
  .auth-main {
    padding: 10px 10px 24px;
  }

  .auth-shell {
    border-radius: 20px;
  }

  .auth-panel,
  .auth-visual {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero-copy h1 {
    font-size: 1.72rem;
  }

  .panel-heading h2 {
    font-size: 1.34rem;
  }

  .hero-description,
  .panel-description {
    font-size: 0.84rem;
  }

  .feature-item {
    gap: 6px;
    padding-top: 10px;
  }

  .feature-item:last-child {
    padding-top: 10px;
  }

  .feature-item p {
    display: none;
  }

  .trust-strip {
    gap: 8px 12px;
  }

  .trust-item {
    font-size: 0.72rem;
    letter-spacing: 0.04em;
  }

  .panel-footer {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
