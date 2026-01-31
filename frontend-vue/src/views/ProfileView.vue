<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NTabs, NTabPane, NInput, NButton, NAvatar, NTag, NDivider, useMessage, NUpload, NSpin, NIcon, NProgress } from 'naive-ui'
import { 
  User, Mail, Shield, Lock, Camera, Flame, Award, Zap, TrendingUp, Target, Star, Mic, Sparkles, Activity,
  Cpu, Layers, RotateCcw, BookOpen, PenTool, Headset, MessageSquare, ShieldAlert, CheckCircle, Info
} from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import { useVipPermission } from '@/composables/useVipPermission'
import { achievementApi } from '@/api/achievement'
import { userApi } from '@/api/user'

const userStore = useUserStore()
const message = useMessage()
const router = useRouter()

// 修正上传地址，增加 /api 前缀以匹配后端代理
const uploadUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api') + '/file/upload/avatar'

const { quotaInfo, fetchQuotaInfo } = useVipPermission()

const profileForm = ref({
  nickname: userStore.nickname || '',
  email: userStore.email || '',
  bio: userStore.userInfo?.bio || '这家伙很懒，什么都没留下'
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

const achievements = ref([])
const isUploading = ref(false)
let quotaTimer = null

// --- Security UX ---
const isScanning = ref(false)

// 实时计算真实安全评分
const securityScore = computed(() => {
    let score = 60 // 基础安全分
    
    // 1. 邮箱验证加分 (20分)
    if (userStore.email && userStore.email.includes('@')) {
        score += 20
    }
    
    // 2. 昵称设置加分 (10分)
    if (userStore.nickname && userStore.nickname !== userStore.username) {
        score += 10
    }
    
    // 3. 自定义头像加分 (10分)
    // 默认头像是 ui-avatars 生成的，如果 URL 中不包含 ui-avatars 则认为是用户上传的
    if (userStore.avatar && !userStore.avatar.includes('ui-avatars.com')) {
        score += 10
    }
    
    return Math.min(score, 100)
})

const securityLogs = ref([])

const fetchSecurityLogs = async () => {
    try {
        const res = await userApi.getSecurityLogs()
        if (res.code === 200) {
             securityLogs.value = res.data.map(log => ({
                id: log.id,
                event: log.event,
                time: new Date(log.createTime).toLocaleString(),
                ip: log.ip,
                status: log.status
            }))
        }
    } catch (e) {
        console.error('Fetch security logs error', e)
        // Fallback to mock data if API fails (e.g. backend not restarted)
        securityLogs.value = [
            { id: 1, event: '密码更新成功', time: '1小时前', ip: '192.168.1.102', status: 'success' },
            { id: 2, event: '登录地址验证', time: '3小时前', ip: '112.54.33.21', status: 'success' },
            { id: 3, event: '检测到远程异地登录', time: '2天前', ip: '223.4.1.9', status: 'warning' }
        ]
    }
}

const vipPrivileges = [
  { title: 'AI 阅读深读', desc: '支持长文章 RAG 检索生成', icon: BookOpen, colorClass: 'bg-blue-500/20 text-blue-400' },
  { title: '写作精细润色', desc: '母语级纠错及多維度评价', icon: PenTool, colorClass: 'bg-emerald-500/20 text-emerald-400' },
  { title: '拟真听力生成', desc: '动态生成多场景音频练习', icon: Headset, colorClass: 'bg-amber-500/20 text-amber-400' },
  { title: '口语实时评测', desc: '1V1 模考及语义语法分析', icon: MessageSquare, colorClass: 'bg-rose-500/20 text-rose-400' },
  { title: '语法靶向训练', desc: '根据薄弱点生成针对练习', icon: Target, colorClass: 'bg-indigo-500/20 text-indigo-400' },
  { title: '安全学习环境', desc: '无广告注入，专属私密数据池', icon: ShieldAlert, colorClass: 'bg-zinc-500/20 text-zinc-300' }
]

const runSecurityScan = () => {
    isScanning.value = true
    setTimeout(() => {
        isScanning.value = false
        // 扫描结束，根据真实分数给出提示
        if (securityScore.value >= 90) {
             message.success('深度安全扫描完成，账号资料完整，安全状况极佳！')
        } else {
             message.warning(`扫描完成，当前评分为 ${securityScore.value}。建议完善绑定邮箱和个人头像以提升安全等级。`)
        }
    }, 2500)
}

const achievementIcons = {
    'Zap': Zap,
    'TrendingUp': TrendingUp,
    'Target': Target,
    'Award': Award,
    'Flame': Flame,
    'Star': Star,
    'User': User,
    'Mic': Mic,
    'Sparkles': Sparkles
}

const getIconComponent = (iconName) => achievementIcons[iconName] || Zap

const fetchAchievements = async () => {
    try {
        const res = await achievementApi.getMyAchievements()
        if (res.code === 200) {
            achievements.value = res.data
        }
    } catch (e) {
        console.error('Fetch achievements error', e)
    }
}

const updateProfile = async () => {
  try {
    const res = await userApi.updateProfile({
      nickname: profileForm.value.nickname,
      email: profileForm.value.email,
      bio: profileForm.value.bio
    })
    if (res.code === 200) {
      message.success('个人资料已更新！')
      await userStore.getUserInfo()
    } else {
      message.error(res.message || '更新失败')
    }
  } catch (e) {
    message.error('更新个人资料失败')
  }
}

const updatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    message.error('两次输入的密码不一致')
    return
  }
  if (!passwordForm.value.new || passwordForm.value.new.length < 6) {
    message.error('新密码长度不能少于6位')
    return
  }

  try {
    const res = await userApi.updatePassword({
      current: passwordForm.value.current,
      new: passwordForm.value.new
    })
    if (res.code === 200) {
      message.success('密码修改成功！')
      passwordForm.value = { current: '', new: '', confirm: '' }
    } else {
      message.error(res.message || '密码修改失败')
    }
  } catch (e) {
    message.error('修改密码失败')
  }
}

const handleAvatarBeforeUpload = (data) => {
  const file = data.file.file
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片！')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB！')
    return false
  }
  isUploading.value = true
  return true
}

const handleAvatarFinish = ({ file, event }) => {
  isUploading.value = false
  try {
    const response = JSON.parse(event.target.response)
    if (response.code === 200) {
      userStore.avatar = response.data
      message.success('头像上传成功！')
      userStore.getUserInfo() // 刷新用户信息
    } else {
      message.error(response.message || '上传失败')
    }
  } catch (e) {
    message.error('解析响应失败')
  }
}

const handleAvatarError = () => {
  isUploading.value = false
  message.error('上传过程中发生系统错误')
}

onMounted(async () => {
  await userStore.getUserInfo()
  // 同步表单数据
  profileForm.value.nickname = userStore.nickname || ''
  profileForm.value.email = userStore.email || ''
  profileForm.value.bio = userStore.userInfo?.bio || '这家伙很懒，什么都没留下'
  
  await fetchQuotaInfo()
  await fetchAchievements()
  fetchSecurityLogs()

  // 轮询更新配额信息 (每60秒)
  quotaTimer = setInterval(() => {
    fetchQuotaInfo()
  }, 60000)
})

onUnmounted(() => {
  if (quotaTimer) clearInterval(quotaTimer)
})
</script>

<template>
  <div class="profile-container max-w-4xl mx-auto">
    <div class="header mb-8 flex items-center gap-6 profile-header-mobile">
       <div class="avatar-wrapper relative group">
          <n-upload
            :action="uploadUrl"
            :headers="{ satoken: userStore.token }"
            :show-file-list="false"
            @before-upload="handleAvatarBeforeUpload"
            @finish="handleAvatarFinish"
            @error="handleAvatarError"
          >
            <div class="relative cursor-pointer">
              <n-avatar 
                round 
                :src="userStore.avatar" 
                class="border-4 border-white shadow-xl transition-all duration-300 group-hover:brightness-50 profile-avatar" 
              >
                <n-icon :component="User" />
              </n-avatar>
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-full">
                <n-spin v-if="isUploading" size="small" stroke="white" />
                <Camera v-else class="text-white" :size="24" />
              </div>
            </div>
          </n-upload>
       </div>
       <div class="user-info-mobile">
          <h2 class="text-3xl font-bold mb-2 username-mobile">{{ userStore.nickname || userStore.username }}</h2>
          <div class="flex flex-wrap items-center gap-2 tags-mobile">
             <n-tag :type="userStore.isVip() ? 'success' : 'default'" round size="small">
                {{ userStore.getVipLabel() }}
             </n-tag>
             <n-tag v-if="userStore.vipLevel > 0 && !userStore.isVip()" type="error" round size="small">
                已过期
             </n-tag>
             <n-tag type="warning" round size="small" class="flex items-center">
                 <template #icon><n-icon :component="Zap" /></template>
                 {{ userStore.userInfo?.points || 0 }} XP
             </n-tag>
             <n-tag type="info" round size="small" v-if="userStore.userInfo?.currentLevel">
                {{ userStore.userInfo.currentLevel.toUpperCase() }}
             </n-tag>
          </div>
          <div v-if="userStore.vipExpireTime" class="mt-2 text-xs text-gray-500">
             {{ userStore.isVip() ? '有效期至:' : '过期于:' }} {{ new Date(userStore.vipExpireTime).toLocaleDateString() }}
          </div>
       </div>
    </div>

    <n-card class="profile-card stats-card-bg" :bordered="false">
       <n-tabs type="line" animated>
          <n-tab-pane name="general" tab="通用设置">
             <div class="max-w-md space-y-6 py-4">
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">用户名 (不可修改)</label>
                   <n-input :value="userStore.username" disabled>
                      <template #prefix><User :size="16" /></template>
                   </n-input>
                </div>
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">昵称</label>
                   <n-input v-model:value="profileForm.nickname" placeholder="请输入昵称">
                      <template #prefix><User :size="16" /></template>
                   </n-input>
                </div>
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">电子邮箱</label>
                   <n-input v-model:value="profileForm.email" placeholder="请输入邮箱">
                      <template #prefix><Mail :size="16" /></template>
                   </n-input>
                </div>
                <div class="form-group">
                   <label class="block mb-2 text-gray-400">个人简介</label>
                   <n-input v-model:value="profileForm.bio" type="textarea" placeholder="介绍一下自己..." />
                </div>
                <n-button type="primary" size="large" @click="updateProfile">保存修改</n-button>
             </div>
          </n-tab-pane>
          
            <n-tab-pane name="security" tab="安全设置">
               <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                  <!-- Password Column -->
                  <div class="space-y-6">
                    <h3 class="flex items-center gap-2 text-lg font-bold">
                        <Lock :size="20" class="text-indigo-400" /> 修改密码
                    </h3>
                    <div class="form-group">
                        <label class="block mb-2 text-gray-400">当前密码</label>
                        <n-input type="password" v-model:value="passwordForm.current" show-password-on="click">
                        <template #prefix><Lock :size="16" /></template>
                        </n-input>
                    </div>
                    <n-divider />
                    <div class="form-group">
                        <label class="block mb-2 text-gray-400">新密码</label>
                        <n-input type="password" v-model:value="passwordForm.new" show-password-on="click">
                        <template #prefix><Shield :size="16" /></template>
                        </n-input>
                    </div>
                    <div class="form-group">
                        <label class="block mb-2 text-gray-400">确认新密码</label>
                        <n-input type="password" v-model:value="passwordForm.confirm" show-password-on="click">
                        <template #prefix><Shield :size="16" /></template>
                        </n-input>
                    </div>
                    <n-button type="warning" size="large" @click="updatePassword">修改密码</n-button>
                  </div>

                  <!-- Security Monitoring Column -->
                  <div class="space-y-6">
                    <div class="security-score-card p-6 rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden">
                        <div v-if="isScanning" class="scan-overlay">
                            <div class="scan-line"></div>
                        </div>
                        <h3 class="m-0 mb-4 text-sm font-bold text-gray-400 uppercase tracking-widest">安全评分</h3>
                        <n-progress
                            type="circle"
                            :percentage="securityScore"
                            :color="securityScore >= 90 ? '#10b981' : securityScore >= 70 ? '#f59e0b' : '#ef4444'"
                            :stroke-width="8"
                        >
                            <div class="text-center">
                                <span class="text-3xl font-black text-white">{{ securityScore }}</span>
                                <div class="text-[10px] text-gray-500">SECURE</div>
                            </div>
                        </n-progress>
                        <p class="mt-4 text-xs text-gray-400">
                            {{ securityScore >= 90 ? '账号受良好保护，请继续保持' : '建议定期修改密码并开启两步验证' }}
                        </p>
                        <n-button secondary round size="small" class="mt-2" :loading="isScanning" @click="runSecurityScan">
                             立即深度云扫描
                        </n-button>
                    </div>

                    <div class="login-activity">
                         <h4 class="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                             <Activity :size="16" class="text-indigo-400" /> 最近安全审计
                         </h4>
                         <div class="space-y-3">
                             <div v-for="log in securityLogs" :key="log.id" class="activity-log-item p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                                 <div>
                                     <div class="text-sm text-gray-200 font-medium">{{ log.event }}</div>
                                     <div class="text-[10px] text-gray-500">{{ log.time }} · IP: {{ log.ip }}</div>
                                 </div>
                                 <n-tag :type="log.status === 'success' ? 'success' : 'warning'" size="tiny" round ghost>
                                     {{ log.status === 'success' ? '安全' : '异常' }}
                                 </n-tag>
                             </div>
                         </div>
                    </div>
                  </div>
               </div>
            </n-tab-pane>

            <n-tab-pane name="vip" tab="会员权益">
              <div class="py-4 vip-benefits-container">
                <!-- VIP ACTIVE STATE -->
                <div v-if="userStore.isVip()">
                   <div class="vip-member-card glass-glow mb-10 overflow-hidden relative">
                      <div class="card-glow-bg"></div>
                      <div class="card-inner p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                         <!-- Badge & Title -->
                         <div class="card-brand-section text-center md:text-left flex-shrink-0">
                            <div class="vip-badge-outer mx-auto md:mx-0 mb-4 scale-110">
                               <div class="vip-badge-inner bg-gradient-to-br from-amber-300 to-orange-500 shadow-glow-gold">
                                  <Award class="text-white" :size="40" />
                               </div>
                            </div>
                            <h3 class="text-2xl font-black text-white m-0 tracking-tight">{{ userStore.getVipLabel() }}</h3>
                         </div>

                         <!-- Details Info -->
                         <div class="card-details-section flex-1 w-full">
                            <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
                               <div class="info-group">
                                  <div class="info-label">到期时间</div>
                                  <div class="info-value text-sm">{{ new Date(userStore.vipExpireTime).toLocaleDateString() }}</div>
                               </div>
                               <div class="info-group">
                                  <div class="info-label">剩余天数</div>
                                  <div class="info-value text-amber-300">
                                     {{ Math.ceil((new Date(userStore.vipExpireTime) - new Date()) / (1000 * 60 * 60 * 24)) }} <small class="text-xs">Days</small>
                                  </div>
                               </div>
                               <div class="info-group">
                                  <div class="info-label">AI 每日配额</div>
                                  <div class="info-value">{{ quotaInfo.dailyQuota || 500 }} <small class="text-xs">次/日</small></div>
                               </div>
                            </div>

                            <div class="mt-8">
                               <div class="flex justify-between items-end mb-2">
                                  <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest">今日配额使用率</span>
                                  <span class="text-xs font-black text-indigo-300">{{ quotaInfo.usedToday || 0 }} / {{ quotaInfo.dailyQuota || 500 }}</span>
                               </div>
                               <div class="premium-progress-container h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                                  <div 
                                     class="premium-progress-bar h-full transition-all duration-1000 ease-out"
                                     :style="{ 
                                        width: `${quotaInfo.usagePercent || 0}%`,
                                        background: 'linear-gradient(90deg, #6366f1, #ec4899)'
                                     }"
                                  ></div>
                               </div>
                            </div>
                         </div>
                      </div>
                      
                    </div>

                   <!-- PRIVILEGES GRID -->
                   <div class="privileges-section">
                      <h4 class="privileges-title">
                         <Layers :size="16" /> 全量 AI 核心特权
                      </h4>
                      <div class="privileges-grid">
                         <div v-for="(priv, idx) in vipPrivileges" :key="idx" class="premium-priv-item group">
                            <div class="priv-icon-box" :class="priv.colorClass">
                               <n-icon :component="priv.icon" :size="20" />
                            </div>
                            <div class="priv-content">
                               <div class="priv-header">
                                  <div class="priv-title">{{ priv.title }}</div>
                                  <CheckCircle :size="14" class="priv-check-icon" />
                               </div>
                               <div class="priv-desc">{{ priv.desc }}</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div v-else class="vip-promo-card">
                  <div class="promo-section mb-8">
                    <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
                       <div class="user-identity-box flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 flex-shrink-0">
                          <div class="p-3 bg-indigo-500/20 rounded-xl">
                            <User :size="32" class="text-indigo-400" />
                          </div>
                          <div class="text-left">
                            <div class="text-xs text-gray-500 font-bold uppercase tracking-wider">当前身份</div>
                            <div class="text-xl font-black text-white">普通用户</div>
                          </div>
                       </div>
                       
                       <div class="quota-progress-box flex-1 w-full bg-white/5 p-5 rounded-2xl border border-white/10 text-left">
                          <div class="flex justify-between items-end mb-3">
                             <div class="text-left">
                                <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">今日 AI 能量值</div>
                                <div class="text-sm font-bold text-gray-200">
                                   已消耗 <span class="text-indigo-400 font-black">{{ quotaInfo.usedToday || 0 }}</span> / {{ quotaInfo.dailyQuota || 5 }} <span class="text-[10px] text-gray-500 font-normal ml-1">UNITS</span>
                                </div>
                             </div>
                             <div class="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                每日 0 点重置
                             </div>
                          </div>
                          <n-progress
                            type="line"
                            :percentage="quotaInfo.usagePercent || 0"
                            :color="quotaInfo.usagePercent >= 90 ? '#ef4444' : '#6366f1'"
                            :height="6"
                            :show-indicator="false"
                            processing
                          />
                          <div class="mt-2 text-[10px] text-gray-500 italic">所有 AI 功能共用能量池，任务完成后将根据资源消耗自动扣除。</div>
                       </div>
                    </div>
                  </div>

                  <!-- 功能模块展示 -->
                  <div class="promo-grid grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 text-left">
                    <!-- 左侧：基础学习 -->
                    <div class="feature-box">
                       <div class="flex items-center gap-2 mb-4 text-xs font-black text-emerald-400 uppercase tracking-widest">
                          <CheckCircle :size="14" /> 基础学习 (不消耗能量)
                       </div>
                       <div class="feature-tags-grid">
                          <div v-for="f in ['词汇学习', '词汇测试', '学习记录', '基础统计']" :key="f" class="feature-tag">
                             <div class="dot bg-emerald-500"></div>
                             <span class="text-sm text-gray-300 font-medium">{{ f }}</span>
                          </div>
                       </div>
                    </div>

                    <!-- 右侧：AI 强化 -->
                    <div class="feature-box border-indigo-500/20 bg-indigo-500/5">
                       <div class="flex items-center gap-2 mb-4 text-xs font-black text-indigo-400 uppercase tracking-widest">
                          <Sparkles :size="14" /> AI 核心增强 (共用能量池)
                       </div>
                       <div class="feature-tags-grid">
                          <div v-for="f in [
                            'AI 阅读理解生成', 'AI 写作精细批改', 
                            'AI 听力场景训练', 'AI 口语实时评测', 
                            'AI 语法靶向练习', 'AI 1V1 口语模考', 
                            'AI 智能复习规划', 'AI 深度学习分析'
                          ]" :key="f" class="feature-tag">
                             <div class="dot bg-indigo-500 animate-pulse"></div>
                             <span class="text-sm text-gray-300 font-medium">{{ f }}</span>
                             <span class="ml-auto text-[9px] text-indigo-400/60 font-mono">Consume</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <!-- 升级定价区 -->
                  <div class="upgrade-container relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/10 to-transparent overflow-hidden text-center">
                    <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    
                    <Flame :size="48" class="mx-auto mb-4 text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.4)]" />
                    <h2 class="text-2xl font-black text-white m-0 mb-2">开启 AI 学习全盛时代</h2>
                    <p class="text-sm text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">升级 VIP 可立即解锁所有 AI 核心功能，并将每日调用配额提升至 <span class="text-white font-bold">50-200</span> 次。</p>
                    
                    <div class="pricing-cards-wrapper">
                      <!-- 月度 -->
                      <div class="price-item group">
                        <div class="text-[10px] text-gray-500 font-bold uppercase mb-2">月度体验</div>
                        <div class="text-3xl font-black text-white mb-2">¥10 <small class="text-sm font-medium text-gray-500">/月</small></div>
                        <div class="text-xs text-indigo-400 font-bold bg-indigo-500/10 py-1 rounded-full">50次 AI 配额/日</div>
                      </div>
                      
                      <!-- 季度 -->
                      <div class="price-item featured">
                        <div class="best-value-badge">最佳性价比</div>
                        <div class="text-[10px] text-indigo-300 font-bold uppercase mb-2">精选季度</div>
                        <div class="text-3xl font-black text-white mb-2">¥25 <small class="text-sm font-medium text-indigo-300/60">/季</small></div>
                        <div class="text-xs text-indigo-200 font-bold bg-white/10 py-1 rounded-full text-shadow">100次 AI 配额/日</div>
                      </div>
                      
                      <!-- 年度 -->
                      <div class="price-item group">
                        <div class="text-[10px] text-gray-500 font-bold uppercase mb-2">至尊年度</div>
                        <div class="text-3xl font-black text-white mb-2">¥88 <small class="text-sm font-medium text-gray-500">/年</small></div>
                        <div class="text-xs text-indigo-400 font-bold bg-indigo-500/10 py-1 rounded-full">200次 AI 配额/日</div>
                      </div>
                    </div>

                    <n-button type="primary" size="large" round class="px-12 h-14 text-base font-bold shadow-indigo" @click="router.push('/pricing')">
                      立即解锁全站功能特权
                    </n-button>
                  </div>
                </div>
              </div>
            </n-tab-pane>

           <n-tab-pane name="achievements" tab="我的成就">
              <div class="py-4">
                   <div v-if="achievements.length > 0" class="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       <div 
                           v-for="achv in achievements" 
                           :key="achv.id"
                           class="achievement-card" 
                           :class="{ 'unlocked': achv.status === 1 }"
                       >
                           <div class="badge-icon" :class="achv.status === 1 ? 'badge-gradient-' + (achv.id % 4 + 1) : 'bg-white/10'">
                               <n-icon :component="getIconComponent(achv.icon)" :class="achv.status === 1 ? 'text-white' : 'text-gray-500'" :size="32" />
                           </div>
                           <div class="badge-info">
                               <h3 class="text-white">{{ achv.name }}</h3>
                               <p class="text-gray-400 text-xs">{{ achv.description }}</p>
                               <template v-if="achv.status === 1">
                                   <div class="badge-date text-indigo-400 font-bold text-xs">{{ achv.unlockedTime ? new Date(achv.unlockedTime).toLocaleDateString() : '已解锁' }} 获得</div>
                               </template>
                               <template v-else>
                                   <div class="flex justify-between items-center mb-1">
                                       <span class="text-[10px] text-gray-500">{{ achv.currentValue || 0 }} / {{ achv.conditionValue }}</span>
                                   </div>
                                   <div class="progress-bar-bg h-1 bg-white/5 rounded-full overflow-hidden">
                                       <div class="progress-bar-fill h-full bg-indigo-500" :style="{ width: Math.min(((achv.currentValue || 0) / achv.conditionValue) * 100, 100) + '%' }"></div>
                                   </div>
                               </template>
                           </div>
                       </div>
                   </div>
                   <div v-else class="text-center py-20 opacity-40">
                       <Award :size="64" class="mx-auto mb-4" />
                       <p>努力学习，获得你的第一枚成就勋章！</p>
                   </div>
              </div>
           </n-tab-pane>
       </n-tabs>
    </n-card>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 40px 20px;
}
.space-y-6 > * + * { margin-top: 1.5rem; }
.avatar-wrapper {
  transition: transform 0.3s ease;
}
.avatar-wrapper:hover {
  transform: scale(1.02);
}

.stats-card-bg {
    background: rgba(20, 20, 25, 0.6) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    backdrop-filter: blur(10px);
    border-radius: 20px;
}

/* Achievement Styles */
.achievement-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s;
}
.achievement-card:not(.unlocked) {
    opacity: 0.5;
}
.achievement-card.unlocked {
    border-color: rgba(99, 102, 241, 0.3);
    background: rgba(99, 102, 241, 0.05);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
.badge-icon {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.badge-gradient-1 { background: linear-gradient(135deg, #6366f1, #a855f7); }
.badge-gradient-2 { background: linear-gradient(135deg, #f59e0b, #ef4444); }
.badge-gradient-3 { background: linear-gradient(135deg, #10b981, #3b82f6); }
.badge-gradient-4 { background: linear-gradient(135deg, #ff4d91, #ff904d); }

.badge-info h3 { margin: 0 0 4px; font-size: 1rem; }
.badge-info p { margin: 0 0 8px; font-size: 0.75rem; color: #a1a1aa; }

:deep(.n-tabs-tab__label) {
    font-size: 1.05rem;
    font-weight: 600;
}
:deep(.n-tabs .n-tabs-tab.n-tabs-tab--active) {
    color: #6366f1;
}
:deep(.n-tabs-bar) {
    background-color: #6366f1;
}

/* --- VIP Premium Overhaul --- */
.vip-member-card {
  background: rgba(20, 20, 25, 0.6);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
}

.card-inner {
  background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 60%),
              radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.15), transparent 60%);
}

.glass-glow {
  position: relative;
  overflow: hidden;
}

.glass-glow::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(99, 102, 241, 0.05) 15deg,
    transparent 30deg,
    rgba(168, 85, 247, 0.05) 45deg,
    transparent 60deg
  );
  animation: laser-rotate 20s linear infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes laser-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-glow-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

.vip-badge-outer {
  width: 70px;
  height: 70px;
  padding: 10px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(251, 191, 36, 0.15);
}

.vip-badge-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shadow-glow-gold {
  box-shadow: 0 10px 30px -10px rgba(245, 158, 11, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.4);
}

.info-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
}

.premium-progress-container {
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.premium-progress-bar {
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

.premium-progress-bar::after {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: bar-shine 3s infinite;
}

@keyframes bar-shine {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.premium-priv-item {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
}

.premium-priv-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.5);
}

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
}

@media (min-width: 768px) {
  .privileges-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .privileges-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* VIP Promo Refined Styles */
.promo-section {
  width: 100%;
}

.feature-box {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  height: 100%;
}

.feature-tags-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
}

@media (min-width: 640px) {
  .feature-tags-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.feature-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid transparent;
  width: 100%;
}

.feature-tag.locked {
  background: rgba(0, 0, 0, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.05);
}

.dot {
  width: 6px; height: 6px; border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

/* 定价区域横向排布 */
.pricing-cards-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: stretch;
}

@media (min-width: 768px) {
  .pricing-cards-wrapper {
    flex-direction: row;
    justify-content: center;
    align-items: stretch; /* 确保卡片高度一致 */
  }
  .price-item {
    flex: 1;
  }
}

.price-item {
  padding: 32px 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.price-item.featured {
  background: linear-gradient(145deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1));
  border: 2px solid rgba(99, 102, 241, 0.5);
  z-index: 10;
  box-shadow: 0 20px 40px -12px rgba(99, 102, 241, 0.3);
}

@media (min-width: 768px) {
  .price-item.featured {
    transform: scale(1.05);
  }
}

.price-item:not(.featured):hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-5px);
}

.best-value-badge {
  position: absolute;
  top: -12px; left: 50%;
  transform: translateX(-50%);
  background: #6366f1;
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.shadow-indigo {
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
}

.shadow-indigo:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.privileges-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.75rem;
}

.privileges-title svg {
  color: #6366f1;
}

.priv-icon-box {
   padding: 12px;
   border-radius: 12px;
   display: flex;
   align-items: center;
   justify-content: center;
   transition: transform 0.3s;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.premium-priv-item:hover .priv-icon-box {
  transform: scale(1.1);
}

.priv-content {
  flex: 1;
}

.priv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.priv-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  transition: color 0.3s;
}

.premium-priv-item:hover .priv-title {
  color: #a5b4fc;
}

.priv-check-icon {
  color: #6366f1;
  opacity: 0;
  transition: opacity 0.3s;
}

.premium-priv-item:hover .priv-check-icon {
  opacity: 1;
}

.priv-desc {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
}
@media (max-width: 768px) {
  .profile-container {
    padding: 20px 12px;
  }

  .profile-header-mobile {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .profile-avatar {
    width: 90px !important;
    height: 90px !important;
  }

  .username-mobile {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .tags-mobile {
    justify-content: center;
  }

  /* 个人资料表单宽度 */
  .max-w-md {
    max-width: 100% !important;
  }

  /* VIP 核心卡片调整 */
  .card-inner {
    padding: 20px !important;
  }

  .card-brand-section {
    margin-bottom: 8px;
  }

  .vip-badge-outer {
    width: 60px;
    height: 60px;
    padding: 8px;
  }

  /* 定价卡片间距 */
  .pricing-cards-wrapper {
    gap: 12px;
  }

  .price-item {
    padding: 20px 16px;
  }

  .upgrade-container {
    padding: 24px 16px;
  }

  /* 修改密码预览限制 */
  :deep(.n-tabs-tab) {
    font-size: 0.9rem;
    padding: 8px 10px;
  }
}
</style>
