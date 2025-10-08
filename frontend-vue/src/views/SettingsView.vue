<script setup>
import { ref, watch } from 'vue'
import { 
  NCard, NSwitch, NSelect, NSlider, NButton, NAvatar, 
  NTabs, NTabPane, NList, NListItem, NThing, NInput,
  useMessage
} from 'naive-ui'
import { 
  Settings, User, Bell, Shield, Moon, Monitor, 
  Volume2, Trash2, LogOut, Check
} from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const message = useMessage()
const userStore = useUserStore()
const router = useRouter()

// --- State ---
const activeTab = ref('general')

const generalSettings = ref({
  theme: 'dark',
  language: 'zh-CN',
  autoPlayAudio: true,
  soundEffects: true
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
const themeOptions = [
  { label: '深色模式 (Dark)', value: 'dark' },
  { label: '浅色模式 (Light)', value: 'light' },
  { label: '跟随系统', value: 'system' }
]

const langOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

// --- Actions ---
const saveGeneral = () => {
    message.success('通用设置已保存')
}

const saveNotifications = () => {
    message.success('通知设置已更新')
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

const clearCache = () => {
    localStorage.removeItem('learnsphere-cache')
    message.success('本地缓存已清理')
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
      <h1>系统设置</h1>
      <p>管理您的偏好设置与账户信息</p>
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
                <span>通用设置</span>
            </div>
            <div 
                class="nav-item" 
                :class="{ active: activeTab === 'account' }"
                @click="activeTab = 'account'"
            >
                <div class="icon-box"><User /></div>
                <span>账户安全</span>
            </div>
            <div 
                class="nav-item" 
                :class="{ active: activeTab === 'notifications' }"
                @click="activeTab = 'notifications'"
            >
                <div class="icon-box"><Bell /></div>
                <span>通知提醒</span>
            </div>
            <div class="divider"></div>
            <div class="nav-item danger" @click="logout">
                <div class="icon-box"><LogOut /></div>
                <span>退出登录</span>
            </div>
        </n-card>

        <!-- Content Area -->
        <n-card class="settings-content-card" :bordered="false">
            
            <!-- General Settings -->
            <div v-if="activeTab === 'general'" class="settings-panel">
                <div class="panel-header">
                    <h2>通用设置</h2>
                    <p>自定义界面外观与交互体验</p>
                </div>

                <div class="setting-group">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">界面主题</div>
                            <div class="desc">选择您喜欢的界面风格</div>
                        </div>
                        <div class="control">
                            <n-select v-model:value="generalSettings.theme" :options="themeOptions" class="w-40" />
                        </div>
                    </div>

                    <div class="setting-item">
                        <div class="label">
                            <div class="title">系统语言</div>
                            <div class="desc">切换系统显示语言</div>
                        </div>
                        <div class="control">
                             <n-select v-model:value="generalSettings.language" :options="langOptions" class="w-40" />
                        </div>
                    </div>
                </div>

                <div class="setting-group">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">自动播放音频</div>
                            <div class="desc">在查看单词或例句时自动朗读</div>
                        </div>
                        <div class="control">
                            <n-switch v-model:value="generalSettings.autoPlayAudio" />
                        </div>
                    </div>
                </div>

                <div class="setting-group no-border">
                    <div class="setting-item">
                        <div class="label">
                            <div class="title">清除缓存</div>
                            <div class="desc">释放本地存储空间，不影响账号数据</div>
                        </div>
                        <div class="control">
                            <n-button secondary type="warning" @click="clearCache">
                                <template #icon><Trash2 class="w-4 h-4" /></template>
                                立即清除
                            </n-button>
                        </div>
                    </div>
                </div>

                <div class="panel-footer">
                    <n-button type="primary" size="large" @click="saveGeneral">保存更改</n-button>
                </div>
            </div>

            <!-- Account Settings -->
            <div v-if="activeTab === 'account'" class="settings-panel">
                <div class="panel-header">
                    <h2>账户安全</h2>
                    <p>更新您的个人信息与密码</p>
                </div>

                <div class="setting-group">
                    <div class="profile-preview">
                        <n-avatar :size="80" :src="userStore.avatar" />
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
                    <h2>通知提醒</h2>
                    <p>管理您的消息推送偏好</p>
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
                    <n-button type="primary" size="large" @click="saveNotifications">保存设置</n-button>
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
    background: rgba(30, 30, 35, 0.6);
    border-radius: 16px;
    height: fit-content;
}
.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    color: #a1a1aa;
    transition: all 0.2s;
    margin-bottom: 4px;
    font-weight: 500;
}
.nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: #e4e4e7;
}
.nav-item.active {
    background: #6366f1;
    color: white;
}
.nav-item.danger { color: #f87171; }
.nav-item.danger:hover { background: rgba(248, 113, 113, 0.1); }

.icon-box { display: flex; align-items: center; }
.icon-box svg { width: 18px; height: 18px; }

.divider { height: 1px; background: rgba(255,255,255,0.05); margin: 12px 0; }

/* Content Area */
.settings-content-card {
    flex: 1;
    background: rgba(30, 30, 35, 0.6);
    border-radius: 16px;
}

.panel-header { margin-bottom: 32px; }
.panel-header h2 { font-size: 1.5rem; color: #fff; margin-bottom: 4px; }
.panel-header p { color: #71717a; font-size: 0.9rem; }

.setting-group {
    border-bottom: 1px solid rgba(255,255,255,0.05);
    padding-bottom: 24px;
    margin-bottom: 24px;
}
.setting-group.no-border { border-bottom: none; margin-bottom: 0; }
.setting-group h3 { font-size: 1.1rem; color: #fff; margin-bottom: 16px; }

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.setting-item:last-child { margin-bottom: 0; }
.label .title { font-size: 1rem; color: #e4e4e7; margin-bottom: 2px; }
.label .desc { font-size: 0.85rem; color: #71717a; }

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
.profile-info .username { font-size: 1.25rem; font-weight: 700; color: #fff; }
.profile-info .email { color: #a1a1aa; margin-bottom: 8px; }

.form-item { margin-bottom: 16px; }
.form-item label { display: block; color: #a1a1aa; margin-bottom: 6px; font-size: 0.9rem; }
</style>
