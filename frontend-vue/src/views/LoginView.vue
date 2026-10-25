<script setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NCheckbox, NForm, NFormItem, NInput, NTag, useMessage } from 'naive-ui'
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Brain,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Smile,
  Target,
  User
} from 'lucide-vue-next'
import { authApi } from '@/api/auth'
import { buildAdminEntryUrl } from '@/utils/adminEntryBridge'
import { runLoginFlow } from '@/utils/loginFlow'
import { useUserStore } from '@/stores/user'
import { useEmailCode } from '@/composables/useEmailCode'
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

// 管理员账号在此登录后，可选择进入管理后台或用关联学习账号进入学习中心
const adminSession = ref(null)

const loginForm = reactive({
  username: '',
  password: '',
  captchaCode: ''
})

const registerForm = reactive({
  username: '',
  nickname: '',
  email: '',
  emailCode: '',
  password: '',
  confirmPassword: ''
})

// 找回密码：邮箱 + 验证码 + 新密码
const resetFormRef = ref(null)
const resetForm = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 后端未配置 SMTP 时注册不需要邮箱验证码，找回密码不可用
const emailEnabled = ref(false)

const registerCode = useEmailCode(email => authApi.sendEmailCode({ email, scene: 'register' }))
const resetCode = useEmailCode(email => authApi.sendEmailCode({ email, scene: 'reset' }))

const captchaState = reactive({
  required: false,
  image: '',
  key: '',
  checkedFor: '',
  loading: false
})

const highlightItems = [
  {
    title: '错题优先复习',
    description: '做错的题和没记住的词会优先安排',
    icon: Brain
  },
  {
    title: '训练自动续接',
    description: '词汇、语法与专项任务接着练',
    icon: Target
  },
  {
    title: '进度完整留存',
    description: '连续学习、错题与完成率持续保存',
    icon: BarChart2
  }
]

const isAdminPath = path => /^\/admin(?:\/|$|\?|#)/.test(path)

const rawRedirect = computed(() => {
  const raw = Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect
  return typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//') ? raw : ''
})

// 普通用户不能被带去后台，否则后台守卫又会把人送回这里
const redirectTarget = computed(() => {
  const raw = rawRedirect.value
  return raw && !isAdminPath(raw) ? raw : '/app/dashboard'
})

const adminEntryHref = computed(() => {
  if (!adminSession.value) return ''
  const target = isAdminPath(rawRedirect.value) ? rawRedirect.value : '/admin/dashboard'
  const url = new URL(
    buildAdminEntryUrl(target, {
      origin: window.location.origin,
      dev: import.meta.env.DEV,
      adminDevUrl: import.meta.env.VITE_ADMIN_DEV_URL
    })
  )
  // token 放在 hash 里，不会发送到服务器，后台读取后会立即从地址栏清除
  url.hash = new URLSearchParams({
    ls_admin_token: adminSession.value.token,
    ls_login_origin: window.location.origin
  }).toString()
  return url.href
})

const adminDisplayName = computed(() => {
  const admin = adminSession.value?.admin || {}
  return admin.nickname || admin.name || admin.username || '管理员'
})

const PANEL_COPY = {
  login: ['欢迎回来', '登录后继续之前的学习进度'],
  register: ['创建账号', '注册后同步保存学习记录、计划与分析结果'],
  forgot: ['找回密码', '验证注册邮箱后设置新密码']
}
const panelTitle = computed(() => PANEL_COPY[activeMode.value]?.[0] || PANEL_COPY.login[0])
const panelDescription = computed(() => PANEL_COPY[activeMode.value]?.[1] || PANEL_COPY.login[1])

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emailRule = {
  required: true,
  validator: (_rule, value) => {
    const email = String(value || '').trim()
    if (!email) {
      return new Error('请输入邮箱')
    }
    return EMAIL_PATTERN.test(email) ? true : new Error('请输入有效的邮箱地址')
  },
  trigger: ['blur', 'input']
}

const codeRule = {
  validator: (_rule, value) => {
    return /^\d{6}$/.test(String(value || '').trim()) ? true : new Error('请输入 6 位邮箱验证码')
  },
  trigger: ['blur', 'input']
}

const passwordRule = {
  required: true,
  validator: (_rule, value) => {
    return String(value || '').length >= 6 ? true : new Error('密码至少需要 6 位')
  },
  trigger: ['blur', 'input']
}

const confirmRule = form => ({
  required: true,
  validator: (_rule, value) => {
    if (!String(value || '')) {
      return new Error('请再次输入密码')
    }
    return value === form.password ? true : new Error('两次输入的密码不一致')
  },
  trigger: ['blur', 'input']
})

const resetRules = {
  email: emailRule,
  code: { ...codeRule, required: true },
  password: passwordRule,
  confirmPassword: confirmRule(resetForm)
}

const registerRules = {
  username: {
    required: true,
    message: '请输入用户名',
    trigger: ['blur', 'input']
  },
  email: emailRule,
  emailCode: {
    validator: (rule, value) => (emailEnabled.value ? codeRule.validator(rule, value) : true),
    trigger: ['blur', 'input']
  },
  password: passwordRule,
  confirmPassword: confirmRule(registerForm)
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

const tryAdminLogin = async () => {
  try {
    const response = await authApi.adminLogin({
      username: loginForm.username.trim(),
      password: loginForm.password
    })
    if (!response.data?.token) return false

    adminSession.value = response.data
    loginForm.password = ''
    message.success('管理员身份验证成功')
    return true
  } catch {
    return false
  }
}

const enteringLearner = ref(false)

// 管理员用关联的学习账号进入学习中心（首次进入时后端自动创建）
const enterLearner = async () => {
  enteringLearner.value = true
  try {
    await userStore.loginAsAdminLearner(adminSession.value.token)
    message.success('已进入学习中心')
    await goAfterAuth()
  } catch (error) {
    message.error(error.message || '进入学习中心失败')
  } finally {
    enteringLearner.value = false
  }
}

const enterAdmin = () => {
  window.location.assign(adminEntryHref.value)
}

const leaveAdminSession = () => {
  adminSession.value = null
  loginForm.password = ''
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
    const username = loginForm.username.trim()
    const outcome = await runLoginFlow({
      // 先问后端这个用户名是不是管理员，再决定走哪条登录路径。
      // 不先探测的话，管理员每次登录都会先发一次注定失败的学习账号登录请求，
      // 那次失败会给 Redis 的 login_fail_count 加一，累积 3 次后
      // 就会莫名要求输入验证码（密码明明是对的）。
      probeIsAdmin: async name => {
        const response = await authApi.probeAdmin(name)
        return Boolean(response.data?.isAdmin)
      },
      username,
      loginAsLearner: () =>
        userStore.login(
          username,
          loginForm.password,
          loginForm.captchaCode.trim(),
          captchaState.key
        ),
      tryAdminLogin,
      onError: error => {
        message.error(error.message || '登录失败，请检查账号信息')
      }
    })

    if (outcome === 'learner') {
      message.success('登录成功，正在进入学习中心')
      await goAfterAuth()
      return
    }

    // 管理员登录成功：停留在当前页，由用户点击「进入后台」或「进入学习中心」
    if (outcome === 'admin') {
      return
    }

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
  registerForm.emailCode = ''
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
      emailCode: emailEnabled.value ? registerForm.emailCode.trim() : undefined,
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

// 只校验邮箱字段后发送验证码
const sendCode = async (form, codeState) => {
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    message.warning('请先填写有效的邮箱地址')
    return
  }
  try {
    const res = await codeState.send(form.email.trim())
    if (res) message.success(res.message || '验证码已发送，请查收邮件')
  } catch (error) {
    message.error(error.message || '验证码发送失败，请稍后再试')
  }
}

const sendRegisterCode = () => sendCode(registerForm, registerCode)
const sendResetCode = () => sendCode(resetForm, resetCode)

const clearResetForm = () => {
  resetForm.code = ''
  resetForm.password = ''
  resetForm.confirmPassword = ''
}

const handleResetPassword = async () => {
  try {
    await resetFormRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true

  try {
    await authApi.resetPassword({
      email: resetForm.email.trim(),
      code: resetForm.code.trim(),
      password: resetForm.password
    })
    message.success('密码已重置，请使用新密码登录')
    loginForm.password = ''
    clearResetForm()
    activeMode.value = 'login'
  } catch (error) {
    message.error(error.message || '重置失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

const openForgot = () => {
  // 登录框里填的是邮箱时直接带过去
  const username = loginForm.username.trim()
  if (!resetForm.email && EMAIL_PATTERN.test(username)) {
    resetForm.email = username
  }
  activeMode.value = 'forgot'
}

const loadEmailStatus = async () => {
  try {
    const res = await authApi.getEmailStatus()
    emailEnabled.value = Boolean(res.data?.enabled)
  } catch {
    emailEnabled.value = false
  }
}

const AUTH_MODES = ['login', 'register', 'forgot']

watch(
  () => route.query.mode,
  mode => {
    const nextMode = AUTH_MODES.includes(mode) ? mode : 'login'
    if (activeMode.value !== nextMode) {
      activeMode.value = nextMode
    }
  },
  { immediate: true }
)

watch(activeMode, mode => {
  if (mode !== 'login') adminSession.value = null
  const currentMode = AUTH_MODES.includes(route.query.mode) ? route.query.mode : 'login'
  if (mode === currentMode) {
    return
  }

  const query = { ...route.query }

  if (mode !== 'login') {
    query.mode = mode
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
  loadEmailStatus()
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
          <div class="hero-copy">
            <span class="hero-kicker">LearnSphere</span>
            <h1>
              回到账号，<br />
              接着上次的进度学。
            </h1>
            <p class="hero-description">
              学习记录、错题与训练建议会自动续接，从上次停下的位置继续。
            </p>
          </div>

          <ul class="feature-list">
            <li v-for="item in highlightItems" :key="item.title" class="feature-item">
              <span class="feature-icon">
                <component :is="item.icon" :size="18" />
              </span>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </li>
          </ul>

          <div class="trust-strip">
            <ShieldCheck :size="15" />
            <span>学习数据加密保存，多端同步</span>
          </div>
        </div>

        <section class="auth-panel">
          <div class="panel-heading">
            <h2>{{ panelTitle }}</h2>
            <p class="panel-description">{{ panelDescription }}</p>

            <NTag v-if="hasCustomRedirect" type="info" round>
              登录后继续访问 {{ redirectTarget }}
            </NTag>
          </div>

          <div class="auth-surface">
            <div
              v-if="activeMode !== 'forgot'"
              class="mode-switch"
              :class="{ 'is-register': activeMode === 'register' }"
            >
              <span class="mode-indicator" aria-hidden="true"></span>
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

            <div v-if="activeMode === 'login' && adminSession" class="admin-session" role="status">
              <p class="admin-session__eyebrow">管理员身份已验证</p>
              <p class="admin-session__name">{{ adminDisplayName }}</p>
              <p class="admin-session__hint">
                该账号拥有后台管理权限，可进入管理后台，也可以使用关联的学习账号进入学习中心。
              </p>

              <NButton type="primary" block size="large" class="submit-button" @click="enterAdmin">
                进入管理后台
              </NButton>

              <NButton
                secondary
                block
                size="large"
                class="admin-session__learner"
                :loading="enteringLearner"
                @click="enterLearner"
              >
                进入学习中心
              </NButton>

              <NButton text class="admin-session__switch" @click="leaveAdminSession">
                使用其他账号登录
              </NButton>
            </div>

            <NForm
              v-else-if="activeMode === 'login'"
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
                >
                  <template #prefix><User :size="16" class="input-icon" /></template>
                </NInput>
              </NFormItem>

              <NFormItem label="密码" path="password">
                <NInput
                  v-model:value="loginForm.password"
                  type="password"
                  show-password-on="click"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  @keyup.enter="handleLogin"
                >
                  <template #prefix><Lock :size="16" class="input-icon" /></template>
                </NInput>
              </NFormItem>

              <div v-if="checkingCaptcha" class="captcha-hint">正在检查是否需要验证码...</div>

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
                    <img v-if="captchaState.image" :src="captchaState.image" alt="登录验证码" />
                    <span v-else>{{ captchaState.loading ? '加载中...' : '获取验证码' }}</span>
                  </button>

                  <NButton
                    text
                    type="primary"
                    :disabled="captchaState.loading"
                    @click="refreshCaptcha"
                  >
                    换一张
                  </NButton>
                </div>
              </div>

              <div class="forgot-row">
                <button type="button" class="footer-switch" @click="openForgot">忘记密码？</button>
              </div>

              <div class="agreement-row" :class="{ shake: showShake }">
                <NCheckbox v-model:checked="agreed">
                  我已阅读并同意
                  <a
                    href="javascript:void(0)"
                    class="agreement-link"
                    @click.stop.prevent="openAgreement('user')"
                  >
                    用户协议
                  </a>
                  和
                  <a
                    href="javascript:void(0)"
                    class="agreement-link"
                    @click.stop.prevent="openAgreement('privacy')"
                  >
                    隐私条款
                  </a>
                </NCheckbox>
              </div>

              <NButton
                type="primary"
                block
                size="large"
                class="submit-button"
                icon-placement="right"
                :loading="submitting"
                @click="handleLogin"
              >
                登录
                <template #icon><ArrowRight :size="18" /></template>
              </NButton>
            </NForm>

            <NForm
              v-else-if="activeMode === 'forgot'"
              ref="resetFormRef"
              :model="resetForm"
              :rules="resetRules"
              label-placement="top"
              size="large"
              class="auth-form"
            >
              <p v-if="!emailEnabled" class="forgot-disabled" role="status">
                邮件服务暂未开启，暂时无法通过邮箱找回密码，请联系管理员重置。
              </p>

              <NFormItem label="注册邮箱" path="email">
                <NInput
                  v-model:value="resetForm.email"
                  placeholder="请输入注册时填写的邮箱"
                  autocomplete="email"
                  :disabled="!emailEnabled"
                >
                  <template #prefix><Mail :size="16" class="input-icon" /></template>
                </NInput>
              </NFormItem>

              <NFormItem label="邮箱验证码" path="code">
                <div class="code-row">
                  <NInput
                    v-model:value="resetForm.code"
                    placeholder="6 位数字"
                    maxlength="6"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    :disabled="!emailEnabled"
                    @keyup.enter="handleResetPassword"
                  >
                    <template #prefix><KeyRound :size="16" class="input-icon" /></template>
                  </NInput>
                  <NButton
                    secondary
                    class="code-button"
                    :disabled="!emailEnabled || !resetCode.canSend.value"
                    :loading="resetCode.sending.value"
                    @click="sendResetCode"
                  >
                    {{ resetCode.buttonText.value }}
                  </NButton>
                </div>
              </NFormItem>

              <div class="form-row">
                <NFormItem label="新密码" path="password">
                  <NInput
                    v-model:value="resetForm.password"
                    type="password"
                    show-password-on="click"
                    placeholder="至少 6 位"
                    autocomplete="new-password"
                    :disabled="!emailEnabled"
                    @keyup.enter="handleResetPassword"
                  />
                </NFormItem>

                <NFormItem label="确认新密码" path="confirmPassword">
                  <NInput
                    v-model:value="resetForm.confirmPassword"
                    type="password"
                    show-password-on="click"
                    placeholder="再次输入"
                    autocomplete="new-password"
                    :disabled="!emailEnabled"
                    @keyup.enter="handleResetPassword"
                  />
                </NFormItem>
              </div>

              <NButton
                type="primary"
                block
                size="large"
                class="submit-button"
                icon-placement="right"
                :disabled="!emailEnabled"
                :loading="submitting"
                @click="handleResetPassword"
              >
                重置密码
                <template #icon><ArrowRight :size="18" /></template>
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
                >
                  <template #prefix><User :size="16" class="input-icon" /></template>
                </NInput>
              </NFormItem>

              <NFormItem label="昵称">
                <NInput
                  v-model:value="registerForm.nickname"
                  placeholder="学习社区中展示的昵称（选填）"
                  autocomplete="nickname"
                  @keyup.enter="handleRegister"
                >
                  <template #prefix><Smile :size="16" class="input-icon" /></template>
                </NInput>
              </NFormItem>

              <NFormItem label="邮箱" path="email">
                <NInput
                  v-model:value="registerForm.email"
                  placeholder="用于接收验证码和账号通知"
                  autocomplete="email"
                  @keyup.enter="handleRegister"
                >
                  <template #prefix><Mail :size="16" class="input-icon" /></template>
                </NInput>
              </NFormItem>

              <NFormItem v-if="emailEnabled" label="邮箱验证码" path="emailCode">
                <div class="code-row">
                  <NInput
                    v-model:value="registerForm.emailCode"
                    placeholder="6 位数字"
                    maxlength="6"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    @keyup.enter="handleRegister"
                  >
                    <template #prefix><KeyRound :size="16" class="input-icon" /></template>
                  </NInput>
                  <NButton
                    secondary
                    class="code-button"
                    :disabled="!registerCode.canSend.value"
                    :loading="registerCode.sending.value"
                    @click="sendRegisterCode"
                  >
                    {{ registerCode.buttonText.value }}
                  </NButton>
                </div>
              </NFormItem>

              <div class="form-row">
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
                    placeholder="再次输入"
                    autocomplete="new-password"
                    @keyup.enter="handleRegister"
                  />
                </NFormItem>
              </div>

              <div class="agreement-row" :class="{ shake: showShake }">
                <NCheckbox v-model:checked="agreed">
                  我已阅读并同意
                  <a
                    href="javascript:void(0)"
                    class="agreement-link"
                    @click.stop.prevent="openAgreement('user')"
                  >
                    用户协议
                  </a>
                  和
                  <a
                    href="javascript:void(0)"
                    class="agreement-link"
                    @click.stop.prevent="openAgreement('privacy')"
                  >
                    隐私条款
                  </a>
                </NCheckbox>
              </div>

              <NButton
                type="primary"
                block
                size="large"
                class="submit-button"
                icon-placement="right"
                :loading="submitting"
                @click="handleRegister"
              >
                创建账号
                <template #icon><ArrowRight :size="18" /></template>
              </NButton>
            </NForm>

            <div v-if="activeMode === 'forgot'" class="auth-switch-row">
              <button type="button" class="footer-switch back-link" @click="activeMode = 'login'">
                <ArrowLeft :size="14" />
                返回登录
              </button>
            </div>

            <div v-else class="auth-switch-row">
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
  --ls-accent: var(--brand);
  --ls-accent-2: var(--brand);
  --ls-line: var(--card-border);
  --ls-panel: var(--card-bg);
  --ls-field: var(--card-bg);
  min-height: 100vh;
  background: var(--bg-color);
}

.auth-main {
  box-sizing: border-box;
  min-height: calc(100svh - 64px);
  display: flex;
  align-items: center;
  padding: 24px;
}

.auth-shell {
  width: min(1080px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(400px, 440px);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--ls-line);
  background: var(--ls-panel);
}

/* ---------- 左侧品牌区 ---------- */
.auth-visual {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  padding: 56px 52px 44px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  background: var(--surface-muted);
  border-right: 1px solid var(--ls-line);
}

.hero-copy {
  display: grid;
  gap: 18px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: var(--brand);
  font-size: 0.9rem;
  font-weight: 700;
}

.hero-copy h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.9rem, 3vw, 2.4rem);
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--text-color);
}

.hero-description {
  margin: 0;
  max-width: 32ch;
  color: var(--secondary-text);
  font-size: 0.95rem;
  line-height: 1.7;
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0;
  border-top: 1px solid var(--ls-line);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--ls-line);
}

.feature-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-top: 1px;
  color: var(--brand);
}

.feature-item h3 {
  margin: 0 0 2px;
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--text-color);
}

.feature-item p {
  margin: 0;
  font-size: 0.84rem;
  color: var(--secondary-text);
}

.trust-strip {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.trust-strip svg {
  color: var(--brand);
}
/* ---------- 右侧表单区 ---------- */
.auth-panel {
  padding: 48px 44px 36px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.panel-heading {
  display: grid;
  gap: 8px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
}

.panel-description {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.92rem;
}

.panel-heading :deep(.n-tag) {
  justify-self: start;
  margin-top: 4px;
  /* 默认 n-tag 的蓝色 #2080f0 在浅蓝底上只有 3.44:1 */
  --n-text-color: var(--tone-blue) !important;
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
  /* 原 rgba(148,163,184,.2→.04) 渐隐发丝线，改用主题线色 + 透明 */
  background: linear-gradient(90deg, var(--ls-line), transparent);
}

.mode-switch {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--ls-line);
}

.mode-indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  border: 1px solid var(--ls-line);
  transition: transform 0.2s ease;
}

.mode-switch.is-register .mode-indicator {
  transform: translateX(100%);
}

.mode-button {
  position: relative;
  z-index: 1;
  appearance: none;
  border: none;
  min-height: 38px;
  background: transparent;
  color: var(--secondary-text);
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mode-button:hover {
  color: var(--text-color);
}

.mode-button.active {
  color: var(--text-color);
}

.mode-button:focus-visible {
  outline: 2px solid var(--ls-accent-2);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.auth-form :deep(.n-form-item) {
  --n-label-text-color: var(--secondary-text) !important;
}

.auth-form :deep(.n-form-item-label) {
  font-size: 0.86rem;
  font-weight: 500;
}

.auth-form :deep(.n-input) {
  --n-height: 44px !important;
  --n-border-radius: var(--radius-md) !important;
  --n-color: var(--ls-field) !important;
  --n-color-focus: var(--ls-field) !important;
  --n-border: 1px solid var(--ls-line) !important;
  --n-border-hover: 1px solid var(--secondary-text) !important;
  --n-border-focus: 1px solid var(--ls-accent) !important;
  --n-box-shadow-focus: 0 0 0 3px var(--brand-soft) !important;
}

.input-icon {
  color: var(--secondary-text);
  margin-right: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.captcha-hint {
  margin: -8px 0 12px;
  color: var(--secondary-text);
  font-size: 0.84rem;
}

.captcha-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 128px;
  gap: 12px;
  align-items: start;
}

.captcha-field {
  margin-bottom: 0;
}

.captcha-preview {
  display: grid;
  gap: 4px;
  padding-top: 30px;
  justify-items: center;
}

.captcha-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 44px;
  padding: 0;
  border: 1px solid var(--ls-line);
  border-radius: var(--radius-md);
  /* 写死 #fff 会让深色主题的次要文字压在白底上不足 3:1，改用主题浅底 */
  background: var(--surface-muted);
  overflow: hidden;
  cursor: pointer;
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.agreement-row {
  margin: 0 0 20px;
}

.agreement-row :deep(.n-checkbox__label) {
  color: var(--secondary-text);
  font-size: 0.84rem;
}

.agreement-link {
  color: var(--brand);
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

.submit-button {
  --n-height: 46px !important;
  --n-border-radius: var(--radius-md) !important;
  font-size: 0.96rem;
  font-weight: 600;
}

/* 不用 .panel-footer：global-mobile.css 会强制把它改成纵向 */
.auth-switch-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  color: var(--secondary-text);
  font-size: 0.88rem;
}

.footer-switch {
  appearance: none;
  border: none;
  padding: 0;
  background: transparent;
  color: var(--brand);
  font-weight: 600;
  cursor: pointer;
}

.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin: -12px 0 10px;
  font-size: 0.86rem;
}

.code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  width: 100%;
}

.code-button {
  --n-height: 40px !important;
  min-width: 116px;
}

.forgot-disabled {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(180, 84, 58, 0.3);
  background: rgba(180, 84, 58, 0.06);
  /* R5：--accent-warm 是单一深棕，深色主题下压在深底几乎不可读 */
  color: var(--tone-orange);
  font-size: 0.86rem;
  line-height: 1.5;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.footer-switch:hover {
  color: var(--brand-hover);
}

.admin-session {
  display: grid;
  gap: 8px;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--ls-line);
  background: var(--surface-muted);
}

.admin-session__eyebrow {
  margin: 0;
  color: var(--brand);
  font-size: 0.82rem;
  font-weight: 600;
}

.admin-session__name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
}

.admin-session__hint {
  margin: 0 0 8px;
  color: var(--secondary-text);
  font-size: 0.88rem;
}

.admin-session__learner {
  margin-top: 12px;
}

.admin-session__switch {
  justify-self: center;
  margin-top: 4px;
  color: var(--secondary-text);
}

.shake {
  animation: shake 0.42s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}
/* ---------- 响应式 ---------- */
@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
    max-width: 480px;
  }

  .auth-visual {
    display: none;
  }
}

@media (max-width: 480px) {
  .auth-main {
    padding: 12px;
    align-items: flex-start;
  }

  .auth-shell {
    border-radius: var(--radius-lg);
  }

  .auth-panel {
    padding: 32px 20px 24px;
  }

  .panel-heading h2 {
    font-size: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

/* ---------- 移动端触控目标（横幅 768px 及以下，与 MainLayout 抽屉断点一致） ---------- */
@media (max-width: 768px) {
  /* 「忘记密码？」「立即注册」原本 padding:0 + 行内字号，实测 67×19 / 53×19 */
  .footer-switch {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    min-width: 32px;
    padding: 6px 8px;
  }

  /* 协议链接是行内 <a>，实测 51×16 / 47×16；行内布局不便撑高，改用 inline-flex */
  .agreement-link {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 0 2px;
  }

  .agreement-row :deep(.n-checkbox) {
    min-height: 32px;
    align-items: center;
  }

  /* 「换一张」是 text 按钮，naive-ui 默认高度仅 22px */
  .captcha-preview :deep(.n-button) {
    min-height: 32px;
    min-width: 32px;
  }

  /* 两个小链接并排时保证 8px 间距，避免误触 */
  .auth-switch-row {
    gap: 8px;
    flex-wrap: wrap;
  }
}
</style>
