<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAvatar,
  NButton,
  NCard,
  NIcon,
  NInput,
  NSelect,
  NSpin,
  NTabPane,
  NTabs,
  NTag,
  NUpload
} from 'naive-ui'
import {
  ArrowRight,
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  Crown,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Zap
} from 'lucide-vue-next'
import { useProfileSettings } from '@/composables/useProfileSettings'
import { PROFILE_EXAM_TYPE_OPTIONS, getExamTypeLabel } from '@/constants/examTypes'

const router = useRouter()

const ProfileAchievementPanel = defineAsyncComponent(
  () => import('@/components/profile/ProfileAchievementPanel.vue')
)
const ProfileMfaModal = defineAsyncComponent(
  () => import('@/components/profile/ProfileMfaModal.vue')
)
const ProfileSecurityPanel = defineAsyncComponent(
  () => import('@/components/profile/ProfileSecurityPanel.vue')
)
const ProfileVipPanel = defineAsyncComponent(
  () => import('@/components/profile/ProfileVipPanel.vue')
)

const {
  achievements,
  handleAvatarBeforeUpload,
  handleAvatarError,
  handleAvatarFinish,
  handleBindMfa,
  isBindingMfa,
  isScanning,
  isUploading,
  mfaCode,
  mfaSetupData,
  openMfaSetup,
  passwordForm,
  profileForm,
  quotaInfo,
  riskStatus,
  runSecurityScan,
  securityLogs,
  securityScore,
  showMfaModal,
  updatePassword,
  updateProfile,
  emailChanged,
  emailCode,
  bindEmailCode,
  sendBindEmailCode,
  uploadUrl,
  userStore
} = useProfileSettings()

const activeTab = ref('general')

const switchTab = tabName => {
  activeTab.value = tabName
}

const goToLearningHub = () => {
  router.push('/learning-hub')
}

const handleMfaCodeChange = value => {
  mfaCode.value = value
}

const handleMfaModalShowChange = value => {
  showMfaModal.value = value
}

const heroActivityStatus = computed(() => {
  const isVip = userStore.isVip?.()
  return {
    isVip,
    title: isVip ? 'VIP 旗舰特权已就绪 · 全功能畅行' : '当前为标准学习者账号 · 状态稳定',
    subtitle: isVip
      ? '享受无限量 AI 全真题库生成、母语级写作深度批改与 1V1 模考。'
      : '已开放基础训练与练习题库，升级 VIP 可立即解锁全部 AI 高阶功能。',
    badge: isVip ? 'VIP 尊享' : '标准用户',
    tone: isVip ? 'emerald' : 'indigo'
  }
})

const bentoStats = computed(() => [
  {
    key: 'xp',
    label: '经验值与成长',
    value: `${userStore.userInfo?.points || 0} XP`,
    badge: userStore.userInfo?.currentLevel
      ? `评级 ${userStore.userInfo.currentLevel.toUpperCase()}`
      : '持续突破',
    tone: 'amber',
    icon: Zap,
    caption: '跨学科练习持续积累'
  },
  {
    key: 'membership',
    label: '会员尊享身份',
    value: userStore.getVipLabel?.() || '普通用户',
    badge: userStore.isVip?.() ? '尊贵特权' : '标准权益',
    tone: userStore.isVip?.() ? 'emerald' : 'indigo',
    icon: userStore.isVip?.() ? Crown : ShieldCheck,
    caption: userStore.vipExpireTime
      ? `${userStore.isVip?.() ? '有效期至' : '过期于'} ${new Date(userStore.vipExpireTime).toLocaleDateString()}`
      : '畅享智能学习体验'
  },
  {
    key: 'exam',
    label: '当前备考方向',
    value: getExamTypeLabel(userStore.examType, '未设置目标'),
    badge: userStore.examType ? '目标锁定' : '待设定',
    tone: 'cyan',
    icon: Target,
    caption: '已绑定专项真题词库'
  }
])
</script>

<template>
  <div class="profile-container">
    <!-- 学员档案 Hero 主舱 -->
    <section class="profile-hero">
      <div class="profile-hero__copy">
        <div class="hero-topline">
          <div class="hero-kicker">
            <Sparkles :size="15" />
            <span>学员专属档案控制台</span>
          </div>
          <div class="hero-status-pill" :class="`is-${heroActivityStatus.tone}`">
            <span class="status-dot"></span>
            <span>{{ heroActivityStatus.badge }}</span>
          </div>
        </div>

        <div class="hero-profile-row">
          <div class="avatar-capsule">
            <n-upload
              :action="uploadUrl"
              :headers="{ satoken: userStore.token }"
              :show-file-list="false"
              @before-upload="handleAvatarBeforeUpload"
              @finish="handleAvatarFinish"
              @error="handleAvatarError"
            >
              <div class="avatar-interactive-deck">
                <n-avatar round :size="88" :src="userStore.avatar" class="profile-avatar">
                  <n-icon :component="User" :size="40" />
                </n-avatar>
                <div class="avatar-hover-lens">
                  <n-spin v-if="isUploading" size="small" stroke="white" />
                  <Camera v-else class="text-white" :size="22" />
                </div>
                <span v-if="userStore.isVip?.()" class="avatar-vip-crown" title="VIP 尊享会员">
                  <Crown :size="14" />
                </span>
              </div>
            </n-upload>
          </div>

          <div class="user-meta-summary">
            <div class="user-name-line">
              <h1 class="user-display-name">{{ userStore.nickname || userStore.username }}</h1>
              <span class="user-id-tag">@{{ userStore.username }}</span>
            </div>

            <div class="tags-row">
              <n-tag
                :type="userStore.isVip?.() ? 'success' : 'default'"
                round
                size="small"
                class="pill-tag"
              >
                {{ userStore.getVipLabel?.() }}
              </n-tag>
              <n-tag
                v-if="userStore.vipLevel > 0 && !userStore.isVip?.()"
                type="error"
                round
                size="small"
                class="pill-tag"
              >
                已过期
              </n-tag>
              <n-tag type="warning" round size="small" class="pill-tag xp-tag">
                <template #icon><n-icon :component="Zap" /></template>
                {{ userStore.userInfo?.points || 0 }} XP
              </n-tag>
              <n-tag
                v-if="userStore.userInfo?.currentLevel"
                type="info"
                round
                size="small"
                class="pill-tag"
              >
                LEVEL {{ userStore.userInfo.currentLevel.toUpperCase() }}
              </n-tag>
              <n-tag type="primary" round size="small" class="pill-tag exam-tag">
                {{ getExamTypeLabel(userStore.examType, '未设置考试') }}
              </n-tag>
            </div>

            <p class="user-bio-quote">
              “{{ profileForm.bio || '这家伙很低调，还没有写下个性签名。' }}”
            </p>
          </div>
        </div>

        <div class="hero-mastery-strip" :class="`is-${heroActivityStatus.tone}`">
          <div class="mastery-copy">
            <div class="mastery-title-row">
              <component
                :is="heroActivityStatus.isVip ? Crown : CheckCircle2"
                :size="18"
                class="mastery-icon"
              />
              <strong>{{ heroActivityStatus.title }}</strong>
            </div>
            <p>{{ heroActivityStatus.subtitle }}</p>
          </div>

          <div class="hero-action-group">
            <button type="button" class="hero-cta-btn is-primary" @click="goToLearningHub">
              <span>前往学习中心</span>
              <ArrowRight :size="15" />
            </button>
            <button type="button" class="hero-cta-btn is-secondary" @click="switchTab('vip')">
              <Crown :size="15" />
              <span>会员权益</span>
            </button>
            <button
              type="button"
              class="hero-cta-btn is-secondary"
              @click="switchTab('achievements')"
            >
              <Award :size="15" />
              <span>我的成就</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧 3 大 Bento 独立晶体卡片 -->
      <div class="profile-hero__stats">
        <article
          v-for="item in bentoStats"
          :key="item.key"
          class="bento-stat-card"
          :class="`tone-${item.tone}`"
        >
          <div class="bento-top">
            <span class="bento-icon-box">
              <component :is="item.icon" :size="18" />
            </span>
            <span class="bento-badge">{{ item.badge }}</span>
          </div>
          <div class="bento-metric">
            <span class="bento-label">{{ item.label }}</span>
            <strong class="bento-value">{{ item.value }}</strong>
          </div>
          <small class="bento-caption">{{ item.caption }}</small>
        </article>
      </div>
    </section>

    <!-- 主体设置工作台 -->
    <n-card class="profile-workbench" :bordered="false">
      <n-tabs v-model:value="activeTab" type="line" animated class="workbench-tabs">
        <n-tab-pane name="general" tab="通用设置">
          <div class="general-settings-grid">
            <div class="settings-col">
              <div class="section-title-line">
                <User :size="18" />
                <h3>核心身份档案</h3>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span>用户名</span>
                  <small class="label-hint">(系统核心标识，不可更改)</small>
                </label>
                <div class="readonly-input-shell">
                  <Lock :size="15" class="lock-icon" />
                  <input :value="userStore.username" disabled class="readonly-input" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">昵称</label>
                <n-input
                  v-model:value="profileForm.nickname"
                  size="large"
                  placeholder="请输入昵称"
                  class="custom-field"
                >
                  <template #prefix><User :size="16" class="text-indigo-400" /></template>
                </n-input>
              </div>

              <div class="form-group">
                <label class="form-label">电子邮箱</label>
                <n-input
                  v-model:value="profileForm.email"
                  size="large"
                  placeholder="请输入电子邮箱"
                  class="custom-field"
                >
                  <template #prefix><Mail :size="16" class="text-indigo-400" /></template>
                </n-input>
              </div>

              <div v-if="emailChanged" class="form-group">
                <label class="form-label">新邮箱验证码</label>
                <div class="email-code-row">
                  <n-input
                    v-model:value="emailCode"
                    size="large"
                    maxlength="6"
                    placeholder="发送到新邮箱的 6 位验证码"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    class="custom-field"
                  />
                  <n-button
                    size="large"
                    secondary
                    :disabled="!bindEmailCode.canSend.value"
                    :loading="bindEmailCode.sending.value"
                    @click="sendBindEmailCode"
                  >
                    {{ bindEmailCode.buttonText.value }}
                  </n-button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">目标备考类型</label>
                <n-select
                  v-model:value="profileForm.examType"
                  size="large"
                  :options="PROFILE_EXAM_TYPE_OPTIONS"
                  placeholder="请选择目标备考类型"
                  class="custom-select"
                />
              </div>
            </div>

            <div class="settings-col">
              <div class="section-title-line">
                <Sparkles :size="18" />
                <h3>学习偏好与个性表达</h3>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span>个人简介与座右铭</span>
                  <small class="label-hint">(展示在个人主页与排行榜中)</small>
                </label>
                <n-input
                  v-model:value="profileForm.bio"
                  type="textarea"
                  :rows="6"
                  placeholder="介绍一下自己，或者写下一句鼓舞学习的座右铭..."
                  class="custom-textarea"
                />
              </div>

              <div class="profile-tip-card">
                <BookOpen :size="18" class="tip-icon" />
                <div class="tip-copy">
                  <strong>科学备考小贴士</strong>
                  <p>
                    设置准确的备考类型将自动为你量身定制词库难度、AI 作文评分基准与真题听力配比。
                  </p>
                </div>
              </div>

              <div class="form-actions-row">
                <button type="button" class="save-profile-btn" @click="updateProfile">
                  <Save :size="16" />
                  <span>保存设置修改</span>
                </button>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <n-tab-pane name="security" tab="安全设置">
          <ProfileSecurityPanel
            :is-scanning="isScanning"
            :password-form="passwordForm"
            :risk-status="riskStatus"
            :security-logs="securityLogs"
            :security-score="securityScore"
            @open-mfa-setup="openMfaSetup"
            @run-security-scan="runSecurityScan"
            @update-password="updatePassword"
          />
        </n-tab-pane>

        <n-tab-pane name="vip" tab="会员权益">
          <ProfileVipPanel :user-store="userStore" :quota-info="quotaInfo" />
        </n-tab-pane>

        <n-tab-pane name="achievements" tab="我的成就">
          <ProfileAchievementPanel :achievements="achievements" />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <ProfileMfaModal
      :show="showMfaModal"
      :is-binding-mfa="isBindingMfa"
      :mfa-code="mfaCode"
      :mfa-setup-data="mfaSetupData"
      @bind="handleBindMfa"
      @update:mfa-code="handleMfaCodeChange"
      @update:show="handleMfaModalShowChange"
    />
  </div>
</template>

<style scoped>
.email-code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.profile-container {
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--text-color);
  --profile-panel-bg: rgba(255, 255, 255, 0.9);
  --profile-panel-strong: #ffffff;
  --profile-panel-border: rgba(226, 232, 240, 0.95);
  --profile-panel-shadow: 0 20px 48px -24px rgba(15, 23, 42, 0.08);
  --profile-title-color: #0f172a;
  --profile-muted: #475569;
  --profile-soft: rgba(30, 107, 82, 0.08);
  --profile-item-bg: rgba(248, 250, 252, 0.85);
  --profile-item-border: rgba(226, 232, 240, 0.95);
}

:global(html[data-theme='dark'] .profile-container) {
  --profile-panel-bg: rgba(15, 23, 42, 0.72);
  --profile-panel-strong: rgba(30, 41, 59, 0.76);
  --profile-panel-border: rgba(148, 163, 184, 0.16);
  --profile-panel-shadow: 0 32px 56px -40px rgba(2, 6, 23, 0.72);
  --profile-title-color: #f8fafc;
  --profile-muted: #94a3b8;
  --profile-soft: rgba(30, 107, 82, 0.15);
  --profile-item-bg: rgba(30, 41, 59, 0.55);
  --profile-item-border: rgba(148, 163, 184, 0.14);
}

/* ==========================================================================
   学员档案 Hero 主舱
   ========================================================================== */
.profile-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 1fr);
  gap: 20px;
  align-items: stretch;
}

.profile-hero__copy,
.bento-stat-card,
.profile-workbench {
  border: 1px solid var(--profile-panel-border);
  background: var(--card-bg);
}

.profile-hero__copy {
  padding: 28px 30px;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 22px;
}

.profile-hero__copy::after {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.hero-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--profile-soft);
  color: var(--tone-emerald);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid rgba(30, 107, 82, 0.18);
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: inherit;
  opacity: 0.6;
  animation: pulse-ring 2s infinite ease-out;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.hero-status-pill.is-emerald {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.hero-status-pill.is-emerald .status-dot {
  background: #10b981;
}

.hero-status-pill.is-indigo {
  /* R1：品牌深绿在深色主题下对比度不足，改用随主题切换的 emerald 令牌 */
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.22);
}

.hero-status-pill.is-indigo .status-dot {
  background: #1e6b52;
}

.hero-profile-row {
  display: flex;
  align-items: center;
  gap: 22px;
}

.avatar-capsule {
  position: relative;
  flex-shrink: 0;
}

.avatar-interactive-deck {
  position: relative;
  cursor: pointer;
  border-radius: 999px;
}

.profile-avatar {
  border: 3px solid rgba(30, 107, 82, 0.35) !important;
  transition: all 0.3s ease;
  background: var(--brand);
}

.avatar-interactive-deck:hover .profile-avatar {
  transform: scale(1.04);
  border-color: #1e6b52 !important;
}

.avatar-hover-lens {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.avatar-interactive-deck:hover .avatar-hover-lens {
  opacity: 1;
}

.avatar-vip-crown {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: #f59e0b;
  /* R4：实心亮琥珀底固定使用深色 ink，避免深色主题浅字压亮底 */
  color: #3b2600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--profile-panel-strong);
}

.user-meta-summary {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.user-name-line {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.user-display-name {
  margin: 0;
  font-size: clamp(24px, 2.6vw, 32px);
  font-weight: 800;
  color: var(--profile-title-color);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.user-id-tag {
  font-size: 13px;
  color: var(--profile-muted);
  font-family: monospace;
}

.tags-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-tag {
  font-weight: 600;
}

.user-bio-quote {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--profile-muted);
  font-style: italic;
  max-width: 580px;
}

/* 态势条与黄金行动跳板 */
.hero-mastery-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(30, 107, 82, 0.2);
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.hero-mastery-strip.is-emerald {
  border-color: rgba(16, 185, 129, 0.24);
  background: var(--card-bg);
}

.mastery-copy {
  display: grid;
  gap: 4px;
}

.mastery-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--profile-title-color);
}

.hero-mastery-strip.is-emerald .mastery-icon {
  color: var(--tone-emerald);
}
.hero-mastery-strip.is-indigo .mastery-icon {
  color: var(--tone-emerald);
}

.mastery-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--profile-muted);
}

.hero-action-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.hero-cta-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.22s ease;
}

.hero-cta-btn.is-primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.hero-cta-btn.is-primary:hover {
  transform: translateY(-2px);
}

.hero-cta-btn.is-secondary {
  color: var(--profile-title-color);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--profile-panel-border);
}

:global(html[data-theme='dark'] .hero-cta-btn.is-secondary) {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.2);
}

.hero-cta-btn.is-secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.4);
}

/* ==========================================================================
   右侧 3 大 Bento 独立晶体卡片
   ========================================================================== */
.profile-hero__stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.bento-stat-card {
  padding: 18px 22px;
  border-radius: var(--radius-lg);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.bento-stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.3);
}

.bento-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bento-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.bento-stat-card.tone-amber .bento-icon-box {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.bento-stat-card.tone-emerald .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.bento-stat-card.tone-cyan .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(43, 122, 96, 0.12);
  border: 1px solid rgba(43, 122, 96, 0.25);
}

.bento-stat-card.tone-indigo .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.bento-metric {
  display: grid;
  gap: 3px;
}

.bento-label {
  font-size: 12px;
  color: var(--profile-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.bento-value {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--profile-title-color);
  letter-spacing: -0.02em;
}

.bento-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.bento-stat-card.tone-amber .bento-badge {
  /* R5：亮色 accent 改为深色档令牌，浅底上也能达标 */
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.bento-stat-card.tone-emerald .bento-badge {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.bento-stat-card.tone-cyan .bento-badge {
  color: var(--tone-cyan);
  background: rgba(43, 122, 96, 0.12);
  border: 1px solid rgba(43, 122, 96, 0.2);
}

.bento-stat-card.tone-indigo .bento-badge {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.2);
}

.bento-caption {
  font-size: 12px;
  line-height: 1.45;
  color: var(--profile-muted);
  text-align: right;
  max-width: 140px;
}

/* ==========================================================================
   工作台与通用设置表单 (Workbench & General Form)
   ========================================================================== */
.profile-workbench {
  border-radius: var(--radius-lg);
  padding: 10px 14px 20px;
}

:deep(.n-tabs-tab__label) {
  font-size: 15px;
  font-weight: 700;
}

:deep(.n-tabs-tab) {
  min-height: 48px;
  color: var(--profile-muted);
  transition: all 0.2s ease;
}

:deep(.n-tabs-tab.n-tabs-tab--active) {
  /* R1：激活标签文字用品牌令牌，深色主题自动切到浅绿 */
  color: var(--brand) !important;
}

:deep(.n-tabs-bar) {
  background-color: var(--brand);
  height: 3px;
  border-radius: 999px;
}

.general-settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 36px;
  padding: 24px 10px 10px;
}

.settings-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--profile-panel-border);
  color: var(--tone-emerald);
}

.section-title-line h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--profile-title-color);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--profile-title-color);
}

.label-hint {
  font-size: 12px;
  color: var(--profile-muted);
  font-weight: normal;
}

.readonly-input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: var(--radius-lg);
  background: var(--profile-item-bg);
  border: 1px dashed var(--profile-item-border);
}

.lock-icon {
  color: var(--profile-muted);
  flex-shrink: 0;
}

.readonly-input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: var(--profile-muted);
  cursor: not-allowed;
}

.profile-tip-card {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  background: var(--profile-item-bg);
  border: 1px solid var(--profile-item-border);
  margin-top: 4px;
}

.tip-icon {
  color: var(--tone-emerald);
  flex-shrink: 0;
  margin-top: 2px;
}

.tip-copy {
  display: grid;
  gap: 4px;
}

.tip-copy strong {
  font-size: 13px;
  color: var(--profile-title-color);
}

.tip-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: var(--profile-muted);
}

.form-actions-row {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.save-profile-btn {
  height: 44px;
  padding: 0 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  color: var(--brand-ink);
  background: var(--brand);
  transition: all 0.22s ease;
}

.save-profile-btn:hover {
  transform: translateY(-2px);
}

/* ==========================================================================
   响应式断点
   ========================================================================== */
@media (max-width: 1200px) {
  .profile-hero {
    grid-template-columns: 1fr;
  }

  .profile-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bento-stat-card {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 10px;
  }

  .bento-top {
    flex-direction: row;
    justify-content: center;
  }

  .bento-caption {
    text-align: center;
    max-width: none;
  }

  .general-settings-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 16px 12px 32px;
  }

  .profile-hero__copy,
  .profile-workbench {
    padding: 20px 18px;
    border-radius: var(--radius-lg);
  }

  .hero-profile-row {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .user-name-line {
    justify-content: center;
  }

  .tags-row {
    justify-content: center;
  }

  .user-bio-quote {
    text-align: center;
  }

  .hero-mastery-strip {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .hero-action-group {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta-btn {
    width: 100%;
    justify-content: center;
  }

  .profile-hero__stats {
    grid-template-columns: 1fr;
  }

  .bento-stat-card {
    grid-template-columns: auto 1fr auto;
    text-align: left;
  }

  .bento-top {
    flex-direction: column;
  }

  .bento-caption {
    text-align: right;
    max-width: 120px;
  }

  .form-actions-row {
    justify-content: stretch;
  }

  .save-profile-btn {
    width: 100%;
    justify-content: center;
  }

  /* 子面板里的小号按钮默认 28px 高，移动端统一抬到 32px 触控下限 */
  .profile-workbench :deep(.n-button) {
    min-height: 32px;
  }

  .workbench-tabs :deep(.n-tabs-nav) {
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .user-display-name {
    font-size: 22px;
  }

  /* 4 个标签 + naive-ui 默认 36px 间距会撑出卡片（360px 下 316px > 230px），
     收紧间距与字号让整组落在容器内；间距变量是内联样式，只能直接改占位块宽度 */
  .workbench-tabs :deep(.n-tabs-tab-pad) {
    width: 6px;
  }

  .workbench-tabs :deep(.n-tabs-tab__label) {
    font-size: 13px;
  }

  .bento-stat-card {
    grid-template-columns: auto 1fr;
    gap: 12px;
  }

  .bento-caption {
    grid-column: 1 / -1;
    text-align: left;
    max-width: none;
  }
}

/* n-tag 的 type 由 naive-ui 内部配色决定，warning/error 的默认组合只有 2.0/4.4:1。
   这里统一把 .pill-tag 的底与字拉到主题令牌上，覆盖 naive-ui 的 --n-* 变量。 */
.pill-tag {
  --n-text-color: var(--tone-emerald) !important;
  --n-color: var(--tone-emerald-soft) !important;
  --n-border: 1px solid transparent !important;
}
.pill-tag.xp-tag {
  --n-text-color: var(--tone-amber) !important;
  --n-color: var(--tone-amber-soft) !important;
}
</style>
