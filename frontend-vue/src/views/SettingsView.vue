<script setup>
import { ref, watch } from 'vue'
import { 
  NCard, NSwitch, NSelect, NSlider, NButton, NAvatar, 
  NTabs, NTabPane, NList, NListItem, NThing, NInput,
  useMessage, NIcon
} from 'naive-ui'
import { 
  Settings, User, Bell, Shield, Moon, Monitor, 
  Volume2, Trash2, LogOut, Check
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ttsManager } from '@/utils/tts'
import { clearHistory } from '@/utils/indexedDB'

const message = useMessage()
const userStore = useUserStore()
const router = useRouter()
const { t, locale } = useI18n()

// --- State ---
const activeTab = ref('general')

const generalSettings = ref({
  language: localStorage.getItem('user_language_preference') || 'zh-CN',
  autoPlayAudio: localStorage.getItem('user_autoplay_preference') !== 'false', // Default true
  soundEffects: true
})

// Watch for language changes (Preview only, persistent save in saveGeneral)
watch(() => generalSettings.value.language, (newLang) => {
    locale.value = newLang
})

const notificationSettings = ref({
  emailAlerts: true,
  studyReminders: true,
  weeklyReport: true
})

const accountSettings = ref({
  username: userStore.username,
  email: userStore.email,
  currentPassword: '',
  newPassword: ''
})

// Watch for store changes to update local state if needed
watch(() => userStore.username, (newVal) => {
    accountSettings.value.username = newVal
})
watch(() => userStore.email, (newVal) => {
    accountSettings.value.email = newVal
})

// --- Options ---
const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// --- Actions ---
const saveGeneral = () => {
    // 固化设置到 localStorage
    localStorage.setItem('user_language_preference', generalSettings.value.language)
    localStorage.setItem('user_autoplay_preference', generalSettings.value.autoPlayAudio)
    
    // 确保 i18n 实例同步更新
    locale.value = generalSettings.value.language
    
    message.success(t('settings.general.save'))
}

const saveNotifications = () => {
    message.success(t('settings.general.save'))
}

const updatePassword = () => {
    if (!accountSettings.value.currentPassword || !accountSettings.value.newPassword) {
        message.warning('请填写完整密码信息')
        return
    }
    // TODO: Call API to update password
    message.success('密码修改成功')
    accountSettings.value.currentPassword = ''
    accountSettings.value.newPassword = ''
}

const clearCache = async () => {
    try {
        // 1. 清理 TTS 语音缓存
        if (ttsManager && typeof ttsManager.clearCache === 'function') {
            ttsManager.clearCache()
        }

        // 2. 清理 localStorage 中的冗余数据，但保留关键配置和登录信息
        const essentialKeys = [
          'learnsphere-token', 
          'userInfo', 
          'user_language_preference', 
          'user_autoplay_preference',
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

        // 3. 清理 IndexedDB 中的历史记录
        const dbStores = ['grammarHistory', 'readingHistory', 'writingHistory', 'listeningHistory']
        await Promise.all(dbStores.map(store => clearHistory(store)))

        // 4. 清理一些特定的过时 Key (如果有)
        localStorage.removeItem('learnsphere-cache')
        
        console.log('[Settings] Cache cleared. Removed keys:', keysToRemove, 'and IndexedDB stores')
        message.success('系统缓存已清理')
    } catch (e) {
        console.error('[Settings] Failed to clear cache:', e)
        message.error('缓存清理过程中出现错误')
    }
}

const logout = async () => {
    await userStore.logout()
    // userStore.logout includes redirection, but for safety:
    router.push('/')
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ t('settings.title') }}</h1>
      <p>{{ t('settings.subtitle') }}</p>
    </div>

    <div class="settings-layout">
        <!-- Sidebar Navigation -->
        <n-card class="settings-nav-card" :bordered="false">
            <div 
                class="nav-item" 
                :class="{ active: activeTab === 'general' }"
                @click="activeTab = 'general'"
            >
                <div class="icon-box"><Settings /></div>
                <span>{{ t('settings.general.tab') }}</span>
            </div>
            <div 
                class="nav-item" 
                :class="{ active: activeTab === 'account' }"
                @click="activeTab = 'account'"
            >
                <div class="icon-box"><User /></div>
                <span>{{ t('settings.account.tab') }}</span>
            </div>
            <div 
                class="nav-item" 
                :class="{ active: activeTab === 'notifications' }"
                @click="activeTab = 'notifications'"
            >
                <div class="icon-box"><Bell /></div>
                <span>{{ t('settings.notifications.tab') }}</span>
            </div>
            <div class="divider"></div>
            <div class="nav-item danger" @click="logout">
                <div class="icon-box"><LogOut /></div>
                <span>{{ t('menu.logout') }}</span>
            </div>
        </n-card>

        <!-- Content Area -->
        <n-card class="settings-content-card" :bordered="false">
            
            <!-- General Settings -->
            <div v-if="activeTab === 'general'" class="settings-panel">
                <div class="panel-header">
                    <h2>{{ t('settings.general.title') }}</h2>
                    <p>{{ t('settings.general.subtitle') }}</p>
                </div>

                <div class="setting-group">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">{{ t('settings.general.language.title') }}</div>
                            <div class="desc">{{ t('settings.general.language.desc') }}</div>
                        </div>
                        <div class="control">
                             <n-select v-model:value="generalSettings.language" :options="langOptions" class="language-select" />
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">{{ t('settings.general.autoPlay.title') }}</div>
                            <div class="desc">{{ t('settings.general.autoPlay.desc') }}</div>
                        </div>
                        <div class="control">
                            <n-switch v-model:value="generalSettings.autoPlayAudio" />
                        </div>
                    </div>
                </div>

                <div class="setting-group no-border">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">{{ t('settings.general.clearCache.title') }}</div>
                            <div class="desc">{{ t('settings.general.clearCache.desc') }}</div>
                        </div>
                        <div class="control">
                            <n-button secondary type="warning" @click="clearCache">
                                <template #icon><Trash2 class="w-4 h-4" /></template>
                                {{ t('settings.general.clearCache.button') }}
                            </n-button>
                        </div>
                    </div>
                </div>

                <div class="panel-footer">
                    <n-button type="primary" size="large" @click="saveGeneral">{{ t('settings.general.save') }}</n-button>
                </div>
            </div>

            <!-- Account Settings -->
            <div v-if="activeTab === 'account'" class="settings-panel">
                <div class="panel-header">
                    <h2>{{ t('settings.account.title') }}</h2>
                    <p>{{ t('settings.account.subtitle') }}</p>
                </div>

                <div class="setting-group">
                    <div class="profile-preview">
                        <n-avatar :size="80" :src="userStore.avatar">
                            <n-icon :component="User" />
                        </n-avatar>
                        <div class="profile-info">
                             <div class="username">{{ accountSettings.username }}</div>
                             <div class="email">{{ accountSettings.email }}</div>
                             <n-button text type="primary">更换头像</n-button>
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <div class="form-item">
                        <label>用户名</label>
                        <n-input v-model:value="accountSettings.username" placeholder="Username" />
                    </div>
                    <div class="form-item">
                        <label>邮箱地址</label>
                        <n-input v-model:value="accountSettings.email" placeholder="Email" disabled />
                    </div>
                </div>

                <div class="setting-group">
                    <h3>修改密码</h3>
                    <div class="form-item">
                        <label>当前密码</label>
                        <n-input type="password" show-password-on="click" v-model:value="accountSettings.currentPassword" placeholder="Current Password" />
                    </div>
                    <div class="form-item">
                        <label>新密码</label>
                        <n-input type="password" show-password-on="click" v-model:value="accountSettings.newPassword" placeholder="New Password" />
                    </div>
                </div>

                <div class="panel-footer">
                     <n-button type="primary" size="large" @click="updatePassword">更新信息</n-button>
                </div>
            </div>

            <!-- Notifications -->
            <div v-if="activeTab === 'notifications'" class="settings-panel">
                <div class="panel-header">
                    <h2>{{ t('settings.notifications.title') }}</h2>
                    <p>{{ t('settings.notifications.subtitle') }}</p>
                </div>

                <div class="setting-group">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">邮件通知</div>
                            <div class="desc">接收账号安全与重要更新邮件</div>
                        </div>
                        <div class="control">
                            <n-switch v-model:value="notificationSettings.emailAlerts" />
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="label">
                            <div class="title">学习提醒</div>
                            <div class="desc">每日定时提醒背单词</div>
                        </div>
                        <div class="control">
                             <n-switch v-model:value="notificationSettings.studyReminders" />
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="label">
                            <div class="title">周报推送</div>
                            <div class="desc">每周一发送上周学习总结</div>
                        </div>
                        <div class="control">
                             <n-switch v-model:value="notificationSettings.weeklyReport" />
                        </div>
                    </div>
                </div>
                
                <div class="panel-footer">
                    <n-button type="primary" size="large" @click="saveNotifications">{{ t('settings.general.save') }}</n-button>
                </div>
            </div>

        </n-card>
    </div>
  </div>
</template>

<style scoped>
.page-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
}

.page-header {
    margin-bottom: 32px;
}
.page-header h1 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(120deg, #94a3b8, #cbd5e1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.page-header p { color: #a1a1aa; }

.settings-layout {
    display: flex;
    gap: 24px;
    min-height: 600px;
}

/* Navigation Sidebar */
.settings-nav-card {
    width: 240px;
    height: fit-content;
    border-radius: 16px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 4px;
    font-weight: 500;
    opacity: 0.8;
}

.nav-item:hover {
    background-color: var(--n-close-color-hover);
    opacity: 1;
}

.nav-item.active {
    background-color: var(--n-primary-color);
    color: var(--n-base-color);
}

.nav-item.danger { color: #f87171; }
.nav-item.danger:hover { background: rgba(248, 113, 113, 0.1); }

.icon-box { display: flex; align-items: center; }
.icon-box svg { width: 18px; height: 18px; }

.divider { height: 1px; background-color: var(--n-border-color); margin: 12px 0; }

/* Content Area */
.settings-content-card {
    flex: 1;
    border-radius: 16px;
}

.language-select {
  width: 160px;
}

.panel-header { margin-bottom: 32px; }
.panel-header h2 { font-size: 1.5rem; margin-bottom: 4px; margin-top: 0; }
.panel-header p { opacity: 0.7; font-size: 0.9rem; margin: 0; }

.setting-group {
    border-bottom: 1px solid var(--n-border-color);
    padding-bottom: 24px;
    margin-bottom: 24px;
}
.setting-group.no-border { border-bottom: none; margin-bottom: 0; }
.setting-group h3 { font-size: 1.1rem; margin-bottom: 16px; }

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.setting-item:last-child { margin-bottom: 0; }
.label .title { font-size: 1rem; margin-bottom: 2px; font-weight: 500; }
.label .desc { font-size: 0.85rem; opacity: 0.7; }

.panel-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 32px;
}

/* Account specific */
.profile-preview {
    display: flex;
    align-items: center;
    gap: 20px;
}
.profile-info .username { font-size: 1.25rem; font-weight: 700; }
.profile-info .email { opacity: 0.7; margin-bottom: 8px; }

.form-item { margin-bottom: 16px; }
.form-item label { display: block; opacity: 0.7; margin-bottom: 6px; font-size: 0.9rem; }

@media (max-width: 768px) {
  .page-container {
    margin: 20px auto;
    padding: 0 12px;
  }

  .page-header {
    margin-bottom: 24px;
    text-align: center;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .settings-layout {
    flex-direction: column;
    gap: 16px;
  }

  .settings-nav-card {
    width: 100%;
  }

  :deep(.n-card__content) {
    padding: 12px !important;
  }

  .nav-item {
    padding: 10px 12px;
    font-size: 0.95rem;
  }

  .panel-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .panel-header h2 {
    font-size: 1.25rem;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .control {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .language-select {
    width: 100% !important;
  }

  .control :deep(.n-button) {
    width: 100% !important;
  }

  .profile-preview {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .panel-footer {
    justify-content: center;
  }

  .panel-footer :deep(.n-button) {
    width: 100%;
  }
}
</style>
