<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NTabs, NTabPane, NInput, NButton, NAvatar, NTag, NDivider, useMessage, NUpload, NSpin, NIcon, NProgress } from 'naive-ui'
import { User, Mail, Shield, Lock, Camera, Flame, Award, Zap, TrendingUp, Target, Star, Mic, Sparkles } from 'lucide-vue-next'
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
})
</script>

<template>
  <div class="profile-container max-w-4xl mx-auto">
    <div class="header mb-8 flex items-center gap-6">
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
                :size="110" 
                :src="userStore.avatar" 
                class="border-4 border-white shadow-xl transition-all duration-300 group-hover:brightness-50" 
              />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 rounded-full">
                <n-spin v-if="isUploading" size="small" stroke="white" />
                <Camera v-else class="text-white" :size="28" />
              </div>
            </div>
          </n-upload>
       </div>
       <div>
          <h2 class="text-3xl font-bold mb-2">{{ userStore.nickname || userStore.username }}</h2>
          <div class="flex items-center gap-3">
             <n-tag :type="userStore.isVip() ? 'success' : 'default'" round>
                {{ userStore.getVipLabel() }}
             </n-tag>
             <n-tag v-if="userStore.vipLevel > 0 && !userStore.isVip()" type="error" round size="small">
                已过期
             </n-tag>
             <n-tag type="warning" round class="flex items-center">
                 <template #icon><n-icon :component="Zap" /></template>
                 {{ userStore.userInfo?.points || 0 }} XP
             </n-tag>
             <span v-if="userStore.vipExpireTime" class="text-xs text-gray-500">
               {{ userStore.isVip() ? '有效期至:' : '过期于:' }} {{ new Date(userStore.vipExpireTime).toLocaleDateString() }}
             </span>
             <n-tag type="info" round v-if="userStore.userInfo?.currentLevel">
                {{ userStore.userInfo.currentLevel.toUpperCase() }}
             </n-tag>
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
              <div class="max-w-md space-y-6 py-4">
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
           </n-tab-pane>

           <n-tab-pane name="vip" tab="会员权益">
              <div class="py-4">
                <div v-if="userStore.isVip()" class="vip-active-card mb-6 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-3">
                      <div class="p-3 bg-indigo-500 rounded-xl">
                        <Award class="text-white" :size="32" />
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-indigo-400 m-0">{{ userStore.getVipLabel() }}</h3>
                        <p class="text-indigo-300/80 m-0 text-sm">尊享全站 AI 学习加速</p>
                      </div>
                    </div>
                    <n-button type="primary" tertiary round size="small" @click="router.push('/pricing')">续费会员</n-button>
                  </div>
                  
                  <n-divider dashed class="my-6 opacity-20" />
                  
                  <!-- 配额使用情况 -->
                  <div class="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm font-semibold text-indigo-300">今日AI配额使用</span>
                      <span class="text-xs text-indigo-200">{{ quotaInfo.usedToday || 0 }} / {{ quotaInfo.dailyQuota || 200 }} 次</span>
                    </div>
                    <n-progress
                      type="line"
                      :percentage="quotaInfo.usagePercent || 0"
                      :color="quotaInfo.usagePercent >= 90 ? '#f56c6c' : quotaInfo.usagePercent >= 70 ? '#e6a23c' : '#6366f1'"
                      :height="8"
                      :show-indicator="false"
                    />
                    <div class="text-xs text-gray-500 mt-2 flex justify-between">
                        <span>已使用 {{ quotaInfo.usagePercent }}%</span>
                        <span>明日0点重置</span>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="benefit-item text-center p-4 bg-white/5 rounded-xl border border-white/5">
                      <div class="text-xs text-gray-500 uppercase mb-1">每日配额</div>
                      <div class="text-2xl font-black text-white">{{ quotaInfo.dailyQuota || 200 }} <span class="text-sm font-normal text-gray-400">次</span></div>
                    </div>
                    <div class="benefit-item text-center p-4 bg-white/5 rounded-xl border border-white/5">
                      <div class="text-xs text-gray-500 uppercase mb-1">到期时间</div>
                      <div class="text-md font-bold text-white">{{ new Date(userStore.vipExpireTime).toLocaleDateString() }}</div>
                    </div>
                    <div class="benefit-item text-center p-4 bg-white/5 rounded-xl border border-white/5">
                      <div class="text-xs text-gray-500 uppercase mb-1">剩余天数</div>
                      <div class="text-2xl font-black text-white">{{ Math.ceil((new Date(userStore.vipExpireTime) - new Date()) / (1000 * 60 * 60 * 24)) }} <span class="text-sm font-normal text-gray-400">天</span></div>
                    </div>
                  </div>

                  <!-- VIP特权列表 -->
                  <div class="vip-privileges">
                    <h4 class="text-md font-bold text-indigo-300 mb-4">专属特权</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div class="privilege-item flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span class="text-indigo-400">✓</span>
                        <span class="text-sm text-gray-300">AI 阅读理解生成</span>
                      </div>
                      <div class="privilege-item flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span class="text-indigo-400">✓</span>
                        <span class="text-sm text-gray-300">AI 写作批改</span>
                      </div>
                      <div class="privilege-item flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span class="text-indigo-400">✓</span>
                        <span class="text-sm text-gray-300">AI 听力材料生成</span>
                      </div>
                      <div class="privilege-item flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span class="text-indigo-400">✓</span>
                        <span class="text-sm text-gray-300">AI 语法练习</span>
                      </div>
                      <div class="privilege-item flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span class="text-indigo-400">✓</span>
                        <span class="text-sm text-gray-300">AI 口语评测</span>
                      </div>
                      <div class="privilege-item flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <span class="text-indigo-400">✓</span>
                        <span class="text-sm text-gray-300">无广告体验</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="vip-promo-card">
                  <!-- 普通用户提示 -->
                  <div class="free-user-info mb-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div class="flex items-center gap-3 mb-4">
                      <div class="p-3 bg-white/10 rounded-xl">
                        <User :size="28" class="text-gray-400" />
                      </div>
                      <div>
                        <h3 class="text-lg font-bold text-gray-200 m-0">普通用户</h3>
                        <p class="text-gray-500 m-0 text-sm">基础学习功能</p>
                      </div>
                    </div>
                    
                    <div class="quota-info p-4 bg-white/5 rounded-xl mb-4 border border-white/5">
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-semibold text-gray-300">今日免费额度</span>
                        <span class="text-xs text-gray-400">{{ quotaInfo.usedToday || 0 }} / {{ quotaInfo.dailyQuota || 5 }} 次</span>
                      </div>
                      <n-progress
                        type="line"
                        :percentage="quotaInfo.usagePercent || 0"
                        :color="quotaInfo.usagePercent >= 90 ? '#f56c6c' : '#10b981'"
                        :height="8"
                        :show-indicator="false"
                      />
                      <div class="text-xs text-gray-500 mt-2">升级 VIP 可获得每日 50-200 次大模型调用额度</div>
                    </div>

                    <div class="available-features">
                      <h4 class="text-sm font-bold text-gray-300 mb-3">您可以使用</h4>
                      <div class="grid grid-cols-2 gap-2 mb-6">
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg text-gray-400">
                          <span class="text-green-500">✓</span>
                          <span class="text-xs">词汇学习</span>
                        </div>
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg text-gray-400">
                          <span class="text-green-500">✓</span>
                          <span class="text-xs">词汇测试</span>
                        </div>
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg text-gray-400">
                          <span class="text-green-500">✓</span>
                          <span class="text-xs">学习记录</span>
                        </div>
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg text-gray-400">
                          <span class="text-green-500">✓</span>
                          <span class="text-xs">基础统计</span>
                        </div>
                      </div>

                      <h4 class="text-sm font-bold text-gray-400 mb-3">VIP 专属 (已锁定)</h4>
                      <div class="grid grid-cols-2 gap-2">
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg opacity-40 border border-dashed border-white/10">
                          <span class="text-gray-500">🔒</span>
                          <span class="text-xs text-gray-500">AI 阅读生成</span>
                        </div>
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg opacity-40 border border-dashed border-white/10">
                          <span class="text-gray-500">🔒</span>
                          <span class="text-xs text-gray-500">AI 写作批改</span>
                        </div>
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg opacity-40 border border-dashed border-white/10">
                          <span class="text-gray-500">🔒</span>
                          <span class="text-xs text-gray-500">AI 听力生成</span>
                        </div>
                        <div class="feature-item flex items-center gap-2 p-2 bg-white/5 rounded-lg opacity-40 border border-dashed border-white/10">
                          <span class="text-gray-500">🔒</span>
                          <span class="text-xs text-gray-500">AI 口语评测</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 升级提示 -->
                  <div class="upgrade-prompt p-8 rounded-2xl border-2 border-dashed border-indigo-500/30 text-center bg-indigo-500/5">
                    <Flame :size="48" class="mx-auto mb-4 text-indigo-400" />
                    <h3 class="text-xl font-bold mb-2 text-white">升级为 VIP 会员</h3>
                    <p class="text-gray-400 mb-8">解锁所有 AI 学习方案，开启极速进步模式</p>
                    
                    <div class="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div class="pricing-card p-4 bg-white/5 rounded-xl border border-white/10">
                        <div class="text-xs text-gray-500 mb-1">月度会员</div>
                        <div class="text-2xl font-bold text-white mb-1">¥10<span class="text-sm text-gray-500">/月</span></div>
                        <div class="text-xs text-indigo-400">50次/天</div>
                      </div>
                      <div class="pricing-card p-4 bg-indigo-500/10 rounded-xl border-2 border-indigo-500/50 relative">
                        <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">最佳选择</div>
                        <div class="text-xs text-gray-400 mb-1">季度会员</div>
                        <div class="text-2xl font-bold text-white mb-1">¥25<span class="text-sm text-gray-400">/季</span></div>
                        <div class="text-xs text-indigo-400">100次/天</div>
                      </div>
                      <div class="pricing-card p-4 bg-white/5 rounded-xl border border-white/10">
                        <div class="text-xs text-gray-500 mb-1">年度会员</div>
                        <div class="text-2xl font-bold text-white mb-1">¥88<span class="text-sm text-gray-500">/年</span></div>
                        <div class="text-xs text-indigo-400">200次/天</div>
                      </div>
                    </div>

                    <n-button type="primary" size="large" round @click="router.push('/pricing')" class="px-10">
                      立即解锁全站功能
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

.vip-active-card, .free-user-info {
    position: relative;
    overflow: hidden;
}

.pricing-card {
    transition: transform 0.2s;
}
.pricing-card:hover {
    transform: translateY(-4px);
}
</style>
