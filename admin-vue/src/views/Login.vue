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
      <section class="login-hero">
        <div class="login-brand">
          <img src="@/assets/logo.svg" alt="LearnSphere logo" class="login-logo" />
          <span>LearnSphere Admin</span>
        </div>

        <div class="login-copy">
          <span class="login-kicker">管理员入口</span>
          <h1>进入 LearnSphere 管理后台。</h1>
          <p>
            登录后可处理用户、内容、AI 审核、通知与系统配置等后台事务。
          </p>
        </div>

        <div class="login-feature-grid">
          <div class="login-feature">
            <strong>内容资产</strong>
            <span>维护词汇、写作、模考和学习内容。</span>
          </div>
          <div class="login-feature">
            <strong>AI 治理</strong>
            <span>查看提示词、反馈审核和稳定性状态。</span>
          </div>
          <div class="login-feature">
            <strong>系统运维</strong>
            <span>检查日志、缓存、配额和运行指标。</span>
          </div>
        </div>
      </section>

      <section class="login-panel">
        <div class="login-header">
          <h1>后台登录</h1>
          <p>使用管理员账号进入 LearnSphere 管理后台。</p>
        </div>

        <n-card class="login-card" :bordered="false">
          <n-form
            ref="loginFormRef"
            :model="formData"
            :rules="rules"
            label-placement="top"
            size="large"
          >
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
                我已阅读并同意
                <a
                  href="javascript:void(0)"
                  class="link"
                  @click.stop.prevent="openAgreement('admin')"
                >
                  管理协议
                </a>
                和
                <a
                  href="javascript:void(0)"
                  class="link"
                  @click.stop.prevent="openAgreement('privacy')"
                >
                  隐私条款
                </a>
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
              登录后台
            </n-button>
          </n-form>

          <div class="login-footer">
            <span>安全会话</span>
            <span>协议确认</span>
            <span>后台审计日志</span>
          </div>
        </n-card>
      </section>
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
  display: grid;
  place-items: center;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 20%, rgba(62, 207, 188, 0.14), transparent 24%),
    radial-gradient(circle at 82% 14%, rgba(92, 168, 255, 0.16), transparent 22%),
    radial-gradient(circle at 50% 85%, rgba(129, 231, 255, 0.08), transparent 18%);
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 420px);
  gap: 28px;
  align-items: stretch;
}

.login-hero,
.login-panel {
  border-radius: 30px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(11, 18, 29, 0.92), rgba(9, 15, 24, 0.84));
  box-shadow: 0 24px 80px rgba(3, 6, 14, 0.34);
  backdrop-filter: blur(22px);
}

.login-hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 640px;
  padding: 36px;
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: #f7fbff;
  font-size: 0.94rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-logo {
  width: 42px;
  height: 42px;
  padding: 8px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(62, 207, 188, 0.2), rgba(92, 168, 255, 0.18));
  border: 1px solid rgba(92, 168, 255, 0.16);
}

.login-copy {
  display: grid;
  gap: 16px;
  max-width: 620px;
}

.login-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  color: #7ee6d8;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.login-copy h1 {
  max-width: 11ch;
  font-size: clamp(2.5rem, 4vw, 4.4rem);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.06em;
  color: #f7fbff;
}

.login-copy p {
  max-width: 58ch;
  color: #9fb0c6;
  font-size: 1.02rem;
  line-height: 1.7;
}

.login-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.login-feature {
  display: grid;
  gap: 10px;
  min-height: 152px;
  padding: 20px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.login-feature strong {
  font-size: 1rem;
  font-weight: 700;
  color: #f7fbff;
}

.login-feature span {
  color: #90a3bb;
  line-height: 1.6;
}

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 28px;
}

.login-header {
  margin-bottom: 24px;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #f7fbff;
}

.login-header p {
  margin-top: 10px;
  color: #9fb0c6;
  line-height: 1.6;
}

.login-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: none;
  padding: 8px;
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
  color: #90a3bb;
}

.link {
  color: #7ee6d8;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.login-btn {
  font-weight: 600;
}

.login-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.login-footer span {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #9fb0c6;
  font-size: 0.76rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .login-page {
    padding: 20px;
  }

  .login-container {
    grid-template-columns: 1fr;
  }

  .login-hero {
    min-height: auto;
    gap: 28px;
  }

  .login-copy h1 {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 16px;
  }

  .login-hero,
  .login-panel {
    padding: 20px;
    border-radius: 24px;
  }

  .login-feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
