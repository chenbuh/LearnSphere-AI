<script setup>
import { ref, watch, computed } from 'vue'
import { 
  NCard, NSwitch, NSelect, NButton, NAvatar, 
  NIcon, NInput, useMessage, NPopconfirm, NTag, NTooltip
} from 'naive-ui'
import { 
  Settings, User, Bell, Shield, Volume2, 
  Trash2, LogOut, Check, Sparkles, Globe, 
  Mail, Lock, ArrowRight, CheckCircle2, FileText, 
  ShieldCheck, KeyRound, ExternalLink, Zap, RefreshCw
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { clearHistory } from '@/utils/indexedDB'

const message = useMessage()
const userStore = useUserStore()
const router = useRouter()
const { t, locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en-US')
const L = (zh, en) => (isEnglish.value ? en : zh)

// --- State ---
const activeTab = ref('general')
const isClearingCache = ref(false)
const isSaving = ref(false)

const generalSettings = ref({
  language: localStorage.getItem('user_language_preference') || 'zh-CN',
  autoPlayAudio: localStorage.getItem('user_autoplay_preference') !== 'false', // 默认开启
  soundEffects: localStorage.getItem('user_sfx_preference') !== 'false' // 默认开启
})

// 监听语言切换（即时预览，并在点击保存时固化）
watch(() => generalSettings.value.language, (newLang) => {
  locale.value = newLang
})

const notificationSettings = ref({
  emailAlerts: true,
  studyReminders: true,
  weeklyReport: true
})

const accountSettings = ref({
  username: userStore.username || '',
  email: userStore.email || '',
  currentPassword: '',
  newPassword: ''
})

// 同步 Store 状态
watch(() => userStore.username, (newVal) => {
  accountSettings.value.username = newVal || ''
})
watch(() => userStore.email, (newVal) => {
  accountSettings.value.email = newVal || ''
})

// 语言选项
const langOptions = computed(() => [
  { label: isEnglish.value ? 'Chinese (Simplified) · 简体中文' : '简体中文 (Chinese)', value: 'zh-CN' },
  { label: 'English (US)', value: 'en-US' }
])

// Bento 态势指标
const activeNotificationCount = computed(() => {
  let count = 0
  if (notificationSettings.value.emailAlerts) count++
  if (notificationSettings.value.studyReminders) count++
  if (notificationSettings.value.weeklyReport) count++
  return count
})

const bentoStats = computed(() => [
  {
    key: 'lang',
    label: L('界面语言环境', 'UI Language'),
    value: generalSettings.value.language === 'en-US' ? 'English (US)' : '简体中文',
    badge: L('实时生效', 'Live Sync'),
    tone: 'cyan',
    icon: Globe,
    caption: L('全局中英双语自适应', 'Instant bilingual support')
  },
  {
    key: 'audio',
    label: L('音频朗读引擎', 'Audio Engine'),
    value: generalSettings.value.autoPlayAudio ? L('自动朗读开启', 'Autoplay On') : L('手动朗读模式', 'Manual Trigger'),
    badge: 'WebSpeech',
    tone: 'emerald',
    icon: Volume2,
    caption: generalSettings.value.soundEffects ? L('操作反馈音效已激活', 'SFX feedback active') : L('静音免打扰模式', 'Muted mode')
  },
  {
    key: 'notify',
    label: L('消息推送通道', 'Push Channels'),
    value: activeNotificationCount.value === 3 ? L('3 个通道全部激活', '3 Active') : `${activeNotificationCount.value} ${L('个通道已开启', 'Channels Active')}`,
    badge: L('通道畅通', 'Healthy'),
    tone: 'indigo',
    icon: Bell,
    caption: L('邮件 / 打卡 / 学情周报', 'Email, Reminders & Digest')
  }
])

// --- Actions ---
const saveGeneral = () => {
  isSaving.value = true
  localStorage.setItem('user_language_preference', generalSettings.value.language)
  localStorage.setItem('user_autoplay_preference', String(generalSettings.value.autoPlayAudio))
  localStorage.setItem('user_sfx_preference', String(generalSettings.value.soundEffects))
  
  locale.value = generalSettings.value.language
  
  setTimeout(() => {
    isSaving.value = false
    message.success(L('通用偏好设置已成功保存', 'General preferences saved successfully.'))
  }, 350)
}

const saveNotifications = () => {
  isSaving.value = true
  setTimeout(() => {
    isSaving.value = false
    message.success(L('通知偏好设置已更新', 'Notification preferences updated.'))
  }, 350)
}

const updatePassword = () => {
  if (!accountSettings.value.currentPassword || !accountSettings.value.newPassword) {
    message.warning(L('请完整填写当前密码与新密码', 'Please fill in both current and new passwords.'))
    return
  }
  if (accountSettings.value.newPassword.length < 6) {
    message.warning(L('新密码长度不能少于 6 位', 'New password must be at least 6 characters.'))
    return
  }
  
  // 模拟更新
  message.success(L('密码凭据修改成功，请牢记您的新密码', 'Password updated successfully.'))
  accountSettings.value.currentPassword = ''
  accountSettings.value.newPassword = ''
}

const clearCache = async () => {
  isClearingCache.value = true
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    const essentialKeys = [
      'learnsphere-token', 
      'userInfo', 
      'user_language_preference', 
      'user_autoplay_preference',
      'user_sfx_preference',
      'loglevel'
    ]

    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !essentialKeys.includes(key)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))

    const dbStores = ['grammarHistory', 'readingHistory', 'writingHistory', 'listeningHistory']
    await Promise.all(dbStores.map(store => clearHistory(store)))

    localStorage.removeItem('learnsphere-cache')
    
    console.log('[Settings] Cache cleared. Removed keys:', keysToRemove, 'and IndexedDB stores')
    message.success(L('本地离线缓存与临时历史记录已彻底清理', 'Local cache and temporary history have been cleared.'))
  } catch (e) {
    console.error('[Settings] Failed to clear cache:', e)
    message.error(L('缓存清理过程中出现异常', 'Failed to clear cache.'))
  } finally {
    isClearingCache.value = false
  }
}

const logout = async () => {
  try {
    await userStore.logout()
    message.success(L('已安全退出登录', 'Logged out successfully.'))
    router.push('/')
  } catch (err) {
    router.push('/')
  }
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <div class="settings-container">
    <!-- 系统设置 Hero 中枢控制舱 -->
    <header class="settings-hero">
      <div class="settings-hero__copy">
        <div class="hero-topline">
          <div class="hero-kicker">
            <Sparkles :size="15" />
            <span>{{ L('系统设置与中枢控制台', 'SYSTEM PREFERENCES & CONSOLE HUB') }}</span>
          </div>
          <div class="hero-status-pill">
            <span class="status-dot"></span>
            <span>{{ L('客户端运行就绪 · 存储健康', 'Client Engine Ready · Storage Healthy') }}</span>
          </div>
        </div>

        <h1 class="hero-title">
          {{ t('settings.title') }}
        </h1>
        <p class="hero-subtitle">
          {{ L('全维调控界面语言、音频朗读引擎、本地离线缓存、账户安全凭据及多端推送通道。', 'Configure interface language, speech engines, offline storage, security credentials and notification channels.') }}
        </p>

        <!-- 快捷态势行动条 -->
        <div class="hero-action-strip">
          <button class="hero-action-btn primary" @click="goToProfile">
            <User :size="15" />
            <span>{{ L('前往个人中心档案', 'View Profile Center') }}</span>
            <ArrowRight :size="14" class="arrow-icon" />
          </button>
          
          <n-popconfirm
            @positive-click="clearCache"
            :positive-text="L('确认清理', 'Clear')"
            :negative-text="L('取消', 'Cancel')"
          >
            <template #trigger>
              <button class="hero-action-btn secondary" :disabled="isClearingCache">
                <Trash2 :size="15" />
                <span>{{ isClearingCache ? L('清理中...', 'Clearing...') : L('一键清理缓存', 'Clear Cache') }}</span>
              </button>
            </template>
            {{ L('清理将释放本地题库缓存与临时记录，保留登录状态与关键配置，确定继续吗？', 'This will clear offline cache and temporary history while keeping your login session. Continue?') }}
          </n-popconfirm>

          <div class="hero-version-tag">
            <span class="version-dot"></span>
            <span>{{ L('客户端 v2.4.0 · 运行平稳', 'Client v2.4.0 · Stable') }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧 3 大 Bento 独立微光晶体卡片 -->
      <div class="hero-bento-grid">
        <article 
          v-for="card in bentoStats" 
          :key="card.key" 
          class="bento-card"
          :class="`is-${card.tone}`"
        >
          <div class="bento-card__head">
            <div class="bento-icon-box">
              <component :is="card.icon" :size="18" />
            </div>
            <span class="bento-badge">{{ card.badge }}</span>
          </div>
          <div class="bento-card__body">
            <div class="bento-value">{{ card.value }}</div>
            <div class="bento-label">{{ card.label }}</div>
            <div class="bento-caption">{{ card.caption }}</div>
          </div>
        </article>
      </div>
    </header>

    <!-- 主体分栏工作台 -->
    <div class="settings-layout">
      <!-- 左侧极客导航侧栏 -->
      <aside class="settings-nav-card">
        <div class="nav-section-title">
          <span>{{ L('偏好设定导航', 'PREFERENCE NAVIGATION') }}</span>
        </div>

        <nav class="nav-menu">
          <!-- 通用设置 -->
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'general' }"
            @click="activeTab = 'general'"
          >
            <div class="nav-icon-badge is-cyan">
              <Settings :size="18" />
            </div>
            <div class="nav-text-col">
              <span class="nav-title">{{ t('settings.general.tab') }}</span>
              <span class="nav-desc">{{ L('语言 · 音频 · 缓存管理', 'Language · Audio · Cache') }}</span>
            </div>
            <div class="nav-glow-indicator"></div>
          </div>

          <!-- 账户安全 -->
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            <div class="nav-icon-badge is-indigo">
              <Shield :size="18" />
            </div>
            <div class="nav-text-col">
              <span class="nav-title">{{ t('settings.account.tab') }}</span>
              <span class="nav-desc">{{ L('用户名 · 邮箱 · 密码防护', 'Profile · Security') }}</span>
            </div>
            <div class="nav-glow-indicator"></div>
          </div>

          <!-- 通知提醒 -->
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 'notifications' }"
            @click="activeTab = 'notifications'"
          >
            <div class="nav-icon-badge is-amber">
              <Bell :size="18" />
            </div>
            <div class="nav-text-col">
              <span class="nav-title">{{ t('settings.notifications.tab') }}</span>
              <span class="nav-desc">{{ L('邮件推送 · 备考打卡', 'Email · Study Reminders') }}</span>
            </div>
            <div class="nav-glow-indicator"></div>
          </div>
        </nav>

        <div class="nav-divider"></div>

        <!-- 侧栏快捷与危险操作区 -->
        <div class="nav-footer-actions">
          <n-popconfirm
            @positive-click="clearCache"
            :positive-text="L('确认清理', 'Clear')"
            :negative-text="L('取消', 'Cancel')"
          >
            <template #trigger>
              <div class="nav-action-pill warning">
                <Trash2 :size="16" />
                <span>{{ L('清除本地临时缓存', 'Clear Local Cache') }}</span>
              </div>
            </template>
            {{ L('确认清空离线缓存数据吗？', 'Confirm clearing offline cache?') }}
          </n-popconfirm>

          <n-popconfirm
            @positive-click="logout"
            :positive-text="L('退出登录', 'Logout')"
            :negative-text="L('取消', 'Cancel')"
          >
            <template #trigger>
              <div class="nav-action-pill danger">
                <LogOut :size="16" />
                <span>{{ t('menu.logout') }}</span>
              </div>
            </template>
            {{ L('确认退出当前登录状态吗？', 'Are you sure you want to log out?') }}
          </n-popconfirm>
        </div>
      </aside>

      <!-- 右侧设置主工作台 -->
      <main class="settings-content-card">
        
        <!-- ==================== Tab 1: 通用设置 ==================== -->
        <section v-if="activeTab === 'general'" class="settings-panel animate-fade-in">
          <div class="panel-header">
            <div class="panel-header__info">
              <h2>{{ t('settings.general.title') }}</h2>
              <p>{{ t('settings.general.subtitle') }}</p>
            </div>
            <span class="panel-tag cyan">{{ L('界面交互', 'Interface') }}</span>
          </div>

          <!-- 设置卡片网格 -->
          <div class="settings-group-list">
            <!-- 语言偏好 -->
            <div class="setting-unit-card">
              <div class="unit-left">
                <div class="unit-icon is-cyan">
                  <Globe :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ t('settings.general.language.title') }}</div>
                  <div class="unit-desc">{{ t('settings.general.language.desc') }} · {{ L('切换全局界面文本与提示词', 'Switch global interface language') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-select 
                  v-model:value="generalSettings.language" 
                  :options="langOptions" 
                  class="custom-select language-select"
                />
              </div>
            </div>

            <!-- 自动朗读 -->
            <div class="setting-unit-card">
              <div class="unit-left">
                <div class="unit-icon is-emerald">
                  <Volume2 :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ t('settings.general.autoPlay.title') }}</div>
                  <div class="unit-desc">{{ t('settings.general.autoPlay.desc') }} · {{ L('翻阅单词卡或题目时智能朗读', 'Auto pronounce on word cards') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-switch v-model:value="generalSettings.autoPlayAudio" size="medium" />
              </div>
            </div>

            <!-- 音效反馈 -->
            <div class="setting-unit-card">
              <div class="unit-left">
                <div class="unit-icon is-indigo">
                  <Sparkles :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ L('操作与答题音效反馈', 'Sound Effects Feedback') }}</div>
                  <div class="unit-desc">{{ L('答题提交正确、签到打卡完成时的清脆声效提示', 'Audio cues on correct answers, check-ins and streaks') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-switch v-model:value="generalSettings.soundEffects" size="medium" />
              </div>
            </div>

            <!-- 缓存管理 -->
            <div class="setting-unit-card highlight-border">
              <div class="unit-left">
                <div class="unit-icon is-amber">
                  <Trash2 :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ t('settings.general.clearCache.title') }}</div>
                  <div class="unit-desc">{{ t('settings.general.clearCache.desc') }} · {{ L('释放浏览器本地临时题库缓存', 'Frees local cache without affecting account data') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-popconfirm
                  @positive-click="clearCache"
                  :positive-text="L('立即清理', 'Clear Now')"
                  :negative-text="L('取消', 'Cancel')"
                >
                  <template #trigger>
                    <n-button secondary type="warning" :loading="isClearingCache" class="action-btn">
                      <template #icon><Trash2 :size="15" /></template>
                      {{ t('settings.general.clearCache.button') }}
                    </n-button>
                  </template>
                  {{ L('将重置离线题库与浏览器本地临时记录，确定执行吗？', 'Reset local offline database cache?') }}
                </n-popconfirm>
              </div>
            </div>
          </div>

          <!-- 保存底栏 -->
          <div class="panel-footer">
            <button class="glow-submit-btn" :disabled="isSaving" @click="saveGeneral">
              <Check :size="16" />
              <span>{{ isSaving ? L('正在固化...', 'Saving...') : t('settings.general.save') }}</span>
            </button>
          </div>
        </section>

        <!-- ==================== Tab 2: 账户安全 ==================== -->
        <section v-if="activeTab === 'account'" class="settings-panel animate-fade-in">
          <div class="panel-header">
            <div class="panel-header__info">
              <h2>{{ t('settings.account.title') }}</h2>
              <p>{{ t('settings.account.subtitle') }}</p>
            </div>
            <span class="panel-tag indigo">{{ L('凭据保护', 'Credentials') }}</span>
          </div>

          <!-- 学员身份预览徽章舱 -->
          <div class="account-profile-deck">
            <div class="deck-avatar-box">
              <n-avatar round :size="72" :src="userStore.avatar" class="avatar-glow">
                <n-icon :component="User" :size="36" />
              </n-avatar>
            </div>
            <div class="deck-user-info">
              <div class="deck-name-row">
                <span class="deck-username">{{ accountSettings.username || L('未命名学习者', 'Learner') }}</span>
                <span v-if="userStore.isVip?.()" class="badge-vip">PRO VIP</span>
                <span v-else class="badge-standard">{{ L('标准学员', 'Standard') }}</span>
              </div>
              <div class="deck-email-row">
                <Mail :size="14" />
                <span>{{ accountSettings.email || L('未绑定邮箱', 'No email') }}</span>
              </div>
            </div>
            <div class="deck-cta">
              <button class="deck-link-btn" @click="goToProfile">
                <span>{{ L('管理专属档案与头像', 'Manage Full Profile') }}</span>
                <ArrowRight :size="14" />
              </button>
            </div>
          </div>

          <!-- 表单分区 1：基础信息 -->
          <div class="section-card">
            <div class="section-card__title">
              <User :size="16" class="text-cyan" />
              <span>{{ L('核心身份信息', 'Basic Identity') }}</span>
            </div>

            <div class="form-grid">
              <div class="form-item">
                <label>{{ L('学员用户名', 'Username') }}</label>
                <n-input 
                  v-model:value="accountSettings.username" 
                  :placeholder="L('请输入用户名', 'Username')" 
                  size="large"
                >
                  <template #prefix><User :size="15" class="input-icon" /></template>
                </n-input>
              </div>

              <div class="form-item">
                <div class="label-with-tip">
                  <label>{{ L('安全绑定邮箱', 'Security Email') }}</label>
                  <span class="readonly-badge">
                    <Lock :size="11" />
                    {{ L('只读保护', 'Protected') }}
                  </span>
                </div>
                <n-input 
                  v-model:value="accountSettings.email" 
                  placeholder="Email" 
                  disabled 
                  size="large"
                >
                  <template #prefix><Mail :size="15" class="input-icon" /></template>
                </n-input>
              </div>
            </div>
          </div>

          <!-- 表单分区 2：密码安全防护 -->
          <div class="section-card">
            <div class="section-card__title">
              <KeyRound :size="16" class="text-indigo" />
              <span>{{ L('修改安全密码', 'Change Password') }}</span>
            </div>

            <div class="form-grid">
              <div class="form-item">
                <label>{{ L('当前密码', 'Current Password') }}</label>
                <n-input 
                  type="password" 
                  show-password-on="click" 
                  v-model:value="accountSettings.currentPassword" 
                  :placeholder="L('输入当前密码进行安全校验', 'Enter current password')" 
                  size="large"
                >
                  <template #prefix><Lock :size="15" class="input-icon" /></template>
                </n-input>
              </div>

              <div class="form-item">
                <label>{{ L('新密码', 'New Password') }}</label>
                <n-input 
                  type="password" 
                  show-password-on="click" 
                  v-model:value="accountSettings.newPassword" 
                  :placeholder="L('输入新密码 (至少 6 位)', 'Enter new password (min 6 chars)')" 
                  size="large"
                >
                  <template #prefix><ShieldCheck :size="15" class="input-icon" /></template>
                </n-input>
              </div>
            </div>
            <div class="password-hint">
              <Shield :size="13" />
              <span>{{ L('密码建议包含大小写字母与数字组合，保障学习资产安全。', 'We recommend mixing uppercase, lowercase and numbers for maximum security.') }}</span>
            </div>
          </div>

          <!-- 账户保存底栏 -->
          <div class="panel-footer">
            <button class="glow-submit-btn" @click="updatePassword">
              <ShieldCheck :size="16" />
              <span>{{ L('保存密码修改', 'Update Security Password') }}</span>
            </button>
          </div>
        </section>

        <!-- ==================== Tab 3: 通知提醒 ==================== -->
        <section v-if="activeTab === 'notifications'" class="settings-panel animate-fade-in">
          <div class="panel-header">
            <div class="panel-header__info">
              <h2>{{ t('settings.notifications.title') }}</h2>
              <p>{{ t('settings.notifications.subtitle') }}</p>
            </div>
            <span class="panel-tag amber">{{ L('推送通道', 'Push Sync') }}</span>
          </div>

          <div class="settings-group-list">
            <!-- 邮件通知 -->
            <div class="setting-unit-card">
              <div class="unit-left">
                <div class="unit-icon is-cyan">
                  <Mail :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ L('重要安全与更新邮件', 'Email Alerts') }}</div>
                  <div class="unit-desc">{{ L('接收异地登录提醒、密保凭据校验与核心功能版本更新', 'Receive security alerts and major platform updates') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-switch v-model:value="notificationSettings.emailAlerts" size="medium" />
              </div>
            </div>

            <!-- 每日学习打卡提醒 -->
            <div class="setting-unit-card">
              <div class="unit-left">
                <div class="unit-icon is-emerald">
                  <CheckCircle2 :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ L('每日备考打卡提醒', 'Study Reminders') }}</div>
                  <div class="unit-desc">{{ L('每日根据您的学习计划定时发送提醒，维持打卡连续性', 'Daily notifications to maintain your study streak') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-switch v-model:value="notificationSettings.studyReminders" size="medium" />
              </div>
            </div>

            <!-- 每周学情周报 -->
            <div class="setting-unit-card">
              <div class="unit-left">
                <div class="unit-icon is-indigo">
                  <FileText :size="20" />
                </div>
                <div class="unit-info">
                  <div class="unit-title">{{ L('学情深度分析周报', 'Weekly Digest Report') }}</div>
                  <div class="unit-desc">{{ L('每周一清晨自动汇总上周词汇积累量、薄弱知识点及提分建议', 'Weekly progress summary and smart AI recommendations') }}</div>
                </div>
              </div>
              <div class="unit-control">
                <n-switch v-model:value="notificationSettings.weeklyReport" size="medium" />
              </div>
            </div>
          </div>

          <!-- 保存底栏 -->
          <div class="panel-footer">
            <button class="glow-submit-btn" :disabled="isSaving" @click="saveNotifications">
              <Check :size="16" />
              <span>{{ isSaving ? L('正在保存...', 'Saving...') : t('settings.general.save') }}</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 1. 主题变量与全局容器 ==================== */
.settings-container {
  --st-primary: #1e6b52;
  --st-primary-rgb: 99, 102, 241;
  --st-cyan: #2b7a60;
  --st-emerald: #10b981;
  --st-amber: #f59e0b;
  --st-rose: #f43f5e;
  
  /* 深色主题默认 (Dark Default) */
  --st-bg: #0b0f19;
  --st-card-bg: rgba(15, 23, 42, 0.72);
  --st-card-sub: rgba(30, 41, 59, 0.55);
  --st-card-hover: rgba(30, 41, 59, 0.75);
  --st-border: rgba(148, 163, 184, 0.16);
  --st-border-focus: rgba(30, 107, 82, 0.4);
  --st-text-primary: #f8fafc;
  --st-text-secondary: #94a3b8;
  --st-text-muted: #94a3b8;
  --st-hero-bg: var(--card-bg);
  --st-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.45);

  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  min-height: calc(100vh - 80px);
  color: var(--st-text-primary);
  font-family: inherit;
  box-sizing: border-box;
}

/* 浅色主题精准自适应 (Light Theme Override) */
html[data-theme='light'] .settings-container,
body[data-theme='light'] .settings-container {
  --st-bg: #f8fafc;
  --st-card-bg: rgba(255, 255, 255, 0.95);
  --st-card-sub: rgba(241, 245, 249, 0.85);
  --st-card-hover: rgba(248, 250, 252, 1);
  --st-border: rgba(203, 213, 225, 0.75);
  --st-border-focus: rgba(30, 107, 82, 0.6);
  --st-text-primary: #0f172a;
  --st-text-secondary: #475569;
  --st-text-muted: #52606f;
  --st-hero-bg: var(--card-bg);
  --st-shadow: 0 14px 30px -10px rgba(15, 23, 42, 0.08);
}

/* ==================== 2. Hero 控制舱 ==================== */
.settings-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1.6fr);
  gap: 28px;
  align-items: center;
  padding: 32px 36px;
  margin-bottom: 28px;
  border-radius: var(--radius-lg);
  background: var(--st-hero-bg);
  border: 1px solid var(--st-border);
  overflow: hidden;
}

.settings-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 500px;
  height: 500px;
  background: transparent;
  pointer-events: none;
  z-index: 0;
}

.settings-hero__copy {
  position: relative;
  z-index: 1;
}

.hero-topline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0 0 10px 0;
  background: none;
  color: inherit;
}

html[data-theme='light'] .hero-title,
body[data-theme='light'] .hero-title {
  background: none;
  color: inherit;
}

.hero-subtitle {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--st-text-secondary);
  margin: 0 0 20px 0;
  max-width: 580px;
}

.hero-action-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.hero-action-btn.primary {
  background: var(--brand);
  color: var(--brand-ink);
}

.hero-action-btn.primary:hover {
  transform: translateY(-2px);
}

.hero-action-btn.primary:hover .arrow-icon {
  transform: translateX(3px);
}

.arrow-icon {
  transition: transform 0.2s ease;
}

.hero-action-btn.secondary {
  background: var(--st-card-sub);
  color: var(--st-text-primary);
  border-color: var(--st-border);
}

.hero-action-btn.secondary:hover:not(:disabled) {
  background: var(--st-card-hover);
  border-color: rgba(245, 158, 11, 0.4);
  color: var(--tone-amber);
  transform: translateY(-2px);
}

.hero-version-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--st-text-muted);
  padding: 0 6px;
}

.version-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--st-text-muted);
}

/* ==================== 3. 右侧 Bento 网格 ==================== */
.hero-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  position: relative;
  z-index: 1;
}

.bento-card {
  padding: 18px;
  border-radius: var(--radius-lg);
  background: var(--st-card-sub);
  border: 1px solid var(--st-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
}

.bento-card:hover {
  transform: translateY(-3px);
  border-color: rgba(30, 107, 82, 0.35);
}

.bento-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bento-icon-box {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.bento-card:hover .bento-icon-box {
  transform: scale(1.08);
}

.bento-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  letter-spacing: 0.02em;
  /* 半透明底会把 --tone-emerald 拉到 4.28~4.43，压淡一档并用不可透明底 */
  background: transparent;
  color: var(--tone-emerald);
  border: 1px solid var(--tone-emerald-soft);
}

/* Tone Variants */
.bento-card.is-cyan .bento-icon-box {
  background: rgba(43, 122, 96, 0.15);
  color: var(--tone-emerald);
  border: 1px solid rgba(43, 122, 96, 0.3);
}
.bento-card.is-emerald .bento-icon-box {
  background: rgba(16, 185, 129, 0.08);
  color: var(--tone-emerald);
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.bento-card.is-indigo .bento-icon-box {
  background: rgba(30, 107, 82, 0.15);
  color: var(--tone-emerald);
  border: 1px solid rgba(30, 107, 82, 0.3);
}
.bento-value {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--st-text-primary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bento-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--st-text-secondary);
  margin-bottom: 4px;
}

.bento-caption {
  font-size: 0.72rem;
  color: var(--st-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ==================== 4. 主体布局与侧栏导航 ==================== */
.settings-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.settings-nav-card {
  width: 290px;
  flex-shrink: 0;
  padding: 20px 16px;
  border-radius: var(--radius-lg);
  background: var(--st-card-bg);
  border: 1px solid var(--st-border);
}

.nav-section-title {
  padding: 4px 12px 12px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--st-text-muted);
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: var(--st-card-sub);
  transform: translateX(3px);
}

.nav-item.active {
  background: rgba(30, 107, 82, 0.12);
  border-color: rgba(30, 107, 82, 0.3);
}

.nav-icon-badge {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-icon-badge {
  transform: scale(1.06);
}

.nav-icon-badge.is-cyan {
  background: rgba(43, 122, 96, 0.14);
  color: var(--tone-emerald);
  border: 1px solid rgba(43, 122, 96, 0.25);
}

.nav-icon-badge.is-indigo {
  background: rgba(30, 107, 82, 0.14);
  color: var(--tone-emerald);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.nav-icon-badge.is-amber {
  background: rgba(245, 158, 11, 0.14);
  color: var(--tone-amber);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.nav-text-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.nav-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--st-text-primary);
}

.nav-desc {
  font-size: 0.75rem;
  color: var(--st-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-glow-indicator {
  position: absolute;
  right: 10px;
  width: 4px;
  height: 18px;
  border-radius: 4px;
  background: #1e6b52;
  opacity: 0;
  transform: scaleY(0.4);
  transition: all 0.25s ease;
}

.nav-item.active .nav-glow-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.nav-divider {
  height: 1px;
  background: var(--st-border);
  margin: 16px 8px;
}

.nav-footer-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-action-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-action-pill.warning {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.nav-action-pill.warning:hover {
  background: rgba(245, 158, 11, 0.16);
  transform: translateX(2px);
}

.nav-action-pill.danger {
  color: var(--tone-red);
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.2);
}

.nav-action-pill.danger:hover {
  background: rgba(248, 113, 113, 0.16);
  transform: translateX(2px);
}

/* ==================== 5. 右侧面板与设置单元卡 ==================== */
.settings-content-card {
  flex: 1;
  min-width: 0;
  border-radius: var(--radius-lg);
  background: var(--st-card-bg);
  border: 1px solid var(--st-border);
  padding: 28px 32px;
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--st-border);
}

.panel-header__info h2 {
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: var(--st-text-primary);
}

.panel-header__info p {
  font-size: 0.88rem;
  color: var(--st-text-secondary);
  margin: 0;
}

.panel-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.panel-tag.cyan {
  background: rgba(43, 122, 96, 0.12);
  color: var(--tone-emerald);
  border: 1px solid rgba(43, 122, 96, 0.25);
}

.panel-tag.indigo {
  background: rgba(30, 107, 82, 0.12);
  /* R1：同上，随主题切换的 emerald 令牌替代固定深绿 */
  color: var(--tone-emerald);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.panel-tag.amber {
  background: rgba(245, 158, 11, 0.12);
  color: var(--tone-amber);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* 设置单元卡列表 */
.settings-group-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.setting-unit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-radius: var(--radius-lg);
  background: var(--st-card-sub);
  border: 1px solid var(--st-border);
  transition: all 0.25s ease;
  gap: 20px;
}

.setting-unit-card:hover {
  background: var(--st-card-hover);
  border-color: rgba(30, 107, 82, 0.3);
  transform: translateY(-2px);
}

.setting-unit-card.highlight-border {
  border-color: rgba(245, 158, 11, 0.25);
}

.setting-unit-card.highlight-border:hover {
  border-color: rgba(245, 158, 11, 0.5);
}

.unit-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.unit-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unit-icon.is-cyan {
  background: rgba(43, 122, 96, 0.14);
  color: var(--tone-emerald);
  border: 1px solid rgba(43, 122, 96, 0.28);
}

.unit-icon.is-emerald {
  background: rgba(16, 185, 129, 0.08);
  color: var(--tone-emerald);
  border: 1px solid rgba(16, 185, 129, 0.28);
}

.unit-icon.is-indigo {
  background: rgba(30, 107, 82, 0.14);
  color: var(--tone-emerald);
  border: 1px solid rgba(30, 107, 82, 0.28);
}

.unit-icon.is-amber {
  background: rgba(245, 158, 11, 0.14);
  color: var(--tone-amber);
  border: 1px solid rgba(245, 158, 11, 0.28);
}

.unit-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.unit-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--st-text-primary);
}

.unit-desc {
  font-size: 0.83rem;
  color: var(--st-text-secondary);
  line-height: 1.5;
}

.unit-control {
  flex-shrink: 0;
}

.language-select {
  width: 220px;
}

/* ==================== 6. 账户模块专属风格 ==================== */
.account-profile-deck {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.25);
  margin-bottom: 24px;
}

.deck-avatar-box {
  flex-shrink: 0;
}

.avatar-glow {
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.deck-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.deck-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.deck-username {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--st-text-primary);
}

.badge-vip {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 9999px;
  background: #f59e0b;
  /* R4：实心琥珀底固定使用深色 ink，避免纯黑/主题浅字压亮底 */
  color: #3b2600;
}

.badge-standard {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.15);
  color: var(--st-text-secondary);
}

.deck-email-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--st-text-secondary);
}

.deck-cta {
  flex-shrink: 0;
}

.deck-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--brand-ink);
  background: var(--brand);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.deck-link-btn:hover {
  transform: translateY(-2px);
}

.section-card {
  padding: 22px;
  border-radius: var(--radius-lg);
  background: var(--st-card-sub);
  border: 1px solid var(--st-border);
  margin-bottom: 20px;
}

.section-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--st-text-primary);
  margin-bottom: 18px;
}

.text-cyan { color: var(--tone-emerald); }
.text-indigo { color: var(--tone-emerald); }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-item label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--st-text-secondary);
}

.label-with-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.readonly-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: var(--st-text-muted);
  background: rgba(148, 163, 184, 0.12);
  padding: 2px 7px;
  border-radius: 6px;
}

.input-icon {
  color: var(--st-text-muted);
}

.password-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--st-text-muted);
  margin-top: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
}

/* ==================== 7. 底部保存操作栏 ==================== */
.panel-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--st-border);
}

.glow-submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 28px;
  border-radius: var(--radius-md);
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--brand-ink);
  background: var(--brand);
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glow-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.08);
}

.glow-submit-btn:disabled {
  /* R8：禁用态最低 0.75，保证按钮文字仍达 4.5:1 */
  opacity: 0.75;
  cursor: not-allowed;
}

/* ==================== 8. 响应式与移动端适配 ==================== */
@media (max-width: 1100px) {
  .settings-hero {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 26px 24px;
  }
  
  .settings-layout {
    flex-direction: column;
  }

  .settings-nav-card {
    width: 100%;
  }

  .nav-menu {
    flex-direction: row;
  }

  .nav-item {
    flex: 1;
  }

  .nav-glow-indicator {
    display: none;
  }
}

@media (max-width: 768px) {
  .settings-container {
    padding: 16px 12px 36px;
  }

  .hero-title {
    font-size: 1.65rem;
  }

  .hero-bento-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .nav-menu {
    flex-direction: column;
  }

  .settings-content-card {
    padding: 20px 16px;
  }

  .setting-unit-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .unit-control {
    width: 100%;
  }

  /* naive-ui 开关轨道默认 40×22，触控目标高度不足；只补触控盒高度，不改轨道视觉 */
  :deep(.n-switch) {
    min-height: 32px;
  }

  .language-select {
    width: 100% !important;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .account-profile-deck {
    flex-direction: column;
    text-align: center;
  }

  .deck-name-row {
    justify-content: center;
  }

  .deck-email-row {
    justify-content: center;
  }

  .panel-footer {
    justify-content: stretch;
  }

  .glow-submit-btn {
    width: 100%;
  }
}
</style>
