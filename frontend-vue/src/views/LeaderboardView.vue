<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NLayout, NLayoutContent, NCard, NTable, NAvatar, NTag, NSpin, 
  NIcon, NTabs, NTabPane, NStatistic, NGrid, NGridItem, NInput,
  NButton, NBadge, NDivider, NProgress
} from 'naive-ui'
import { 
  Trophy, Flame, TrendingUp, Users, 
  Search, Target, Crown, ChevronRight,
  Sparkles, Clock, User
} from 'lucide-vue-next'
import { userApi } from '../api/user'
import { useUserStore } from '../stores/user'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const leaderboard = ref([])
const searchQuery = ref('')
const stats = ref({
  totalUsers: 0,
  activeToday: 0,
  avgStreak: 0
})

const myRankData = ref(null)
const lastUpdated = ref(null)
const nextUpdateIn = ref(0) 

const SYNC_INTERVAL = 300 // 5 minutes in seconds

const fetchStats = async () => {
    try {
        const { code, data } = await userApi.getPublicStats()
        if (code === 200) stats.value = data
    } catch (e) {
        console.error("Failed to fetch statistics", e)
    }
}

const fetchMyRank = async () => {
    if (!userStore.token) return
    try {
        const { code, data } = await userApi.getMyRank()
        if (code === 200) myRankData.value = data
    } catch (e) {
        console.error("Failed to fetch my rank", e)
    }
}

const fetchLeaderboard = async (isResetTimer = true) => {
    if (leaderboard.value.length === 0) loading.value = true
    try {
        const { code, data } = await userApi.getLeaderboard()
        if (code === 200) {
            leaderboard.value = data
            if (isResetTimer) {
                const now = new Date()
                lastUpdated.value = now
                nextUpdateIn.value = SYNC_INTERVAL
                localStorage.setItem('leaderboard_last_sync', now.getTime().toString())
            }
        }
    } catch (e) {
        console.error("Failed to fetch leaderboard", e)
    } finally {
        loading.value = false
    }
}

const fetchAllData = () => {
    fetchLeaderboard(true)
    fetchStats()
    fetchMyRank()
}

const filteredLeaderboard = computed(() => {
    const list = leaderboard.value || []
    if (!searchQuery.value) return list
    return list.filter(u => 
        u.nickname.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const timeToNextUpdate = computed(() => {
    const mins = Math.floor(nextUpdateIn.value / 60)
    const secs = nextUpdateIn.value % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
})

let countdownInterval = null

const initSyncState = () => {
    const savedTime = localStorage.getItem('leaderboard_last_sync')
    const now = new Date().getTime()
    
    if (savedTime) {
        const last = parseInt(savedTime)
        const diffSeconds = Math.floor((now - last) / 1000)
        
        if (diffSeconds < SYNC_INTERVAL) {
            // Within 5 minutes, restore state
            nextUpdateIn.value = SYNC_INTERVAL - diffSeconds
            lastUpdated.value = new Date(last)
            // Fetch leaderboard data once to populate, but don't reset timer
            fetchLeaderboard(false)
            fetchStats()
            fetchMyRank()
        } else {
            // Expired, fetch immediately
            fetchAllData()
        }
    } else {
        // No saved state, fetch immediately
        fetchAllData()
    }
}

onMounted(() => {
    initSyncState()
    
    // Unified countdown and sync loop
    countdownInterval = setInterval(() => {
        if (nextUpdateIn.value > 0) {
            nextUpdateIn.value--
        } else {
            // Timer hit zero, perform full sync
            fetchAllData()
        }
    }, 1000)
})

onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <n-layout class="min-h-screen bg-dark">
    <SiteHeader />
    
    <n-layout-content>
      <!-- Hero Header -->
      <div class="leaderboard-hero relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-indigo-600/10 to-transparent"></div>
        <div class="container relative py-20 text-center">
            <div class="hero-badge mb-6 mx-auto flex items-center gap-3">
                <div class="flex items-center gap-1.5">
                    <Crown :size="16" class="text-yellow-400" />
                    <span>下次同步: {{ timeToNextUpdate }}</span>
                </div>
                <n-divider vertical style="background-color: rgba(255,255,255,0.1)" />
                <div class="flex items-center gap-1.5 opacity-80">
                    <Clock :size="14" />
                    <span>更新于 {{ lastUpdated ? lastUpdated.toLocaleTimeString() : '---' }}</span>
                </div>
            </div>
            <h1 class="text-6xl font-black mb-6 tracking-tight text-white glow-text">
               巅峰<span class="text-indigo-500">学习榜</span>
            </h1>
            <p class="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                自律是通往卓越的必经之路。记录每一位语海征途中的先行者，见证知识改变命运的力量。
            </p>
        </div>
      </div>

      <div class="container pb-40">
        <!-- Quick Stats Cards -->
        <n-grid x-gap="24" y-gap="24" cols="1 768:3" class="mb-20 -mt-10 relative z-20">
          <n-grid-item v-for="(val, key) in { totalUsers: '累计学员', activeToday: '今日活跃', avgStreak: '平均打卡' }" :key="key">
            <div class="stat-glass-card">
                <n-statistic :label="val" :value="stats[key]" class="white-stats text-center">
                    <template #prefix>
                        <Users v-if="key === 'totalUsers'" :size="24" class="text-indigo-400 mr-2" />
                        <Flame v-else-if="key === 'activeToday'" :size="24" class="text-orange-400 mr-2" />
                        <TrendingUp v-else :size="24" class="text-emerald-400 mr-2" />
                    </template>
                    <template #suffix v-if="key === 'avgStreak'"><span class="text-base ml-1">天</span></template>
                </n-statistic>
            </div>
          </n-grid-item>
        </n-grid>

        <!-- Podium Section (Top 3 Showcase) -->
        <div v-if="!loading && leaderboard.length >= 3" class="podium-section mb-20 animate-fade-in">
            <div class="podium-grid">
                <!-- Rank 2 -->
                <div v-if="leaderboard[1]" class="podium-spot rank-2-spot">
                    <div class="podium-user">
                        <n-badge :value="2" color="#94a3b8" class="rank-badge-top">
                            <n-avatar round :size="80" :src="leaderboard[1].avatar" class="border-4 border-slate-400 shadow-2xl">
                                <n-icon :component="User" />
                            </n-avatar>
                        </n-badge>
                        <div class="podium-info text-center mt-4">
                            <div class="font-bold text-white text-lg">{{ leaderboard[1].nickname }}</div>
                            <div class="text-slate-400 text-sm">连胜 {{ leaderboard[1].consecutiveDays }} 天</div>
                        </div>
                    </div>
                    <div class="podium-base base-2"><div class="base-number">2</div></div>
                </div>

                <!-- Rank 1 -->
                <div class="podium-spot rank-1-spot">
                    <div class="podium-user">
                        <div class="crown-svg mb-2"><Trophy :size="32" class="text-yellow-500" /></div>
                        <n-badge :value="1" color="#f59e0b" class="rank-badge-top">
                            <n-avatar round :size="110" :src="leaderboard[0].avatar" class="border-4 border-yellow-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                <n-icon :component="User" />
                            </n-avatar>
                        </n-badge>
                        <div class="podium-info text-center mt-4">
                            <div class="font-black text-white text-xl">{{ leaderboard[0].nickname }}</div>
                            <div class="text-yellow-500 font-bold">领跑 {{ leaderboard[0].consecutiveDays }} 天</div>
                        </div>
                    </div>
                    <div class="podium-base base-1"><div class="base-number">1</div></div>
                </div>

                <!-- Rank 3 -->
                <div v-if="leaderboard[2]" class="podium-spot rank-3-spot">
                    <div class="podium-user">
                        <n-badge :value="3" color="#b45309" class="rank-badge-top">
                            <n-avatar round :size="70" :src="leaderboard[2].avatar" class="border-4 border-amber-700 shadow-2xl">
                                <n-icon :component="User" />
                            </n-avatar>
                        </n-badge>
                        <div class="podium-info text-center mt-4">
                            <div class="font-bold text-white text-base">{{ leaderboard[2].nickname }}</div>
                            <div class="text-amber-700 text-sm">连胜 {{ leaderboard[2].consecutiveDays }} 天</div>
                        </div>
                    </div>
                    <div class="podium-base base-3"><div class="base-number">3</div></div>
                </div>
            </div>
        </div>

        <!-- Personal Status Header (Repositioned to TOP of the table section) -->
        <div class="personal-status-header mb-8">
            <n-card class="personal-info-card" :bordered="false">
                <div class="info-layout">
                    <template v-if="userStore.token && myRankData">
                        <div class="user-main">
                            <div class="rank-indicator">
                                <span class="label">我的排名</span>
                                <span class="value">#{{ myRankData.rank }}</span>
                            </div>
                            <n-divider vertical />
                            <div class="user-detail">
                                <n-avatar round :size="44" :src="myRankData.avatar" class="border-2 border-indigo-500">
                                    <n-icon :component="User" />
                                </n-avatar>
                                <div class="name-box">
                                    <div class="nickname">{{ myRankData.nickname }}</div>
                                    <div class="motto text-xs text-gray-400">持续进步，正在全力冲刺巅峰</div>
                                </div>
                            </div>
                        </div>
                        <div class="user-actions">
                            <div class="streak-badge">
                                <span class="label">连续打卡</span>
                                <span class="value">{{ myRankData.consecutiveDays }} 天</span>
                            </div>
                            <n-button type="primary" size="large" round class="action-btn" @click="router.push('/app/dashboard')">
                                进入学习
                            </n-button>
                        </div>
                    </template>
                    <template v-else>
                        <div class="guest-msg">
                            <div class="flex items-center gap-4">
                                <div class="msg-icon"><Target :size="20" class="text-indigo-400" /></div>
                                <div>
                                    <div class="msg-title">开启你的巅峰学习之旅</div>
                                    <div class="msg-desc">登录后即可在此查看你的实时排名与打卡成就</div>
                                </div>
                            </div>
                        </div>
                        <n-button type="primary" size="large" round class="action-btn px-8" @click="router.push('/login')">
                            立即加入
                        </n-button>
                    </template>
                </div>
            </n-card>
        </div>

        <!-- Filters and Table -->
        <div class="ranking-content-container">
            <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
                <n-tabs type="segment" class="rank-filter-tabs w-full md:w-auto">
                    <n-tab-pane name="overall" tab="全站功勋榜" />
                    <n-tab-pane name="weekly" tab="本周之星" />
                    <n-tab-pane name="monthly" tab="月度黑马" />
                </n-tabs>
                <div class="search-box w-full md:w-64">
                    <n-input v-model:value="searchQuery" placeholder="搜索学员..." round size="large" class="glass-input">
                        <template #prefix><Search :size="18" class="text-gray-500" /></template>
                    </n-input>
                </div>
            </div>

            <n-card class="rank-card glass-card">
                <n-spin :show="loading">
                    <n-table :bordered="false" :single-line="false" class="main-rank-table">
                        <thead>
                            <tr>
                                <th width="100">排名</th>
                                <th>学员详情</th>
                                <th>连续打卡</th>
                                <th width="140">累计学习</th>
                                <th width="180" class="hidden md:table-cell">学术勋章</th>
                                <th width="80"></th>
                            </tr>
                        </thead>
                        <tbody v-if="filteredLeaderboard.length > 0">
                            <tr v-for="(user, index) in (leaderboard.length >= 3 ? filteredLeaderboard.slice(3) : filteredLeaderboard)" 
                                :key="user.id" class="rank-row">
                                <td><div class="rank-index">#{{ leaderboard.length >= 3 ? index + 4 : index + 1 }}</div></td>
                                <td>
                                    <div class="flex items-center gap-4">
                                        <n-avatar round :size="48" :src="user.avatar || 'https://ui-avatars.com/api/?background=random&name=' + encodeURIComponent(user.nickname)">
                                            <n-icon :component="User" />
                                        </n-avatar>
                                        <div>
                                            <div class="font-bold text-gray-100">{{ user.nickname }}</div>
                                            <div class="text-xs text-gray-500">{{ user.bio || '持之以恒，金石为开' }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="flex items-center gap-2">
                                        <Flame :size="16" class="text-orange-500" />
                                        <span class="text-white font-black text-lg">{{ user.consecutiveDays }}</span>
                                    </div>
                                </td>
                                <td><div class="text-indigo-400 font-bold">{{ user.totalDays }} 天</div></td>
                                <td class="hidden md:table-cell">
                                    <n-tag size="small" type="success" ghost round>
                                        <template #icon><TrendingUp :size="12" /></template>稳步上升
                                    </n-tag>
                                </td>
                                <td><ChevronRight :size="18" class="text-gray-700" /></td>
                            </tr>
                        </tbody>
                    </n-table>
                </n-spin>
            </n-card>
        </div>
      </div>

      <SiteFooter />
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.bg-dark { background-color: #020617; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
.hero-badge { display: inline-flex; align-items: center; background: rgba(99, 102, 241, 0.1); color: #818cf8; padding: 6px 16px; border-radius: 99px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(99, 102, 241, 0.2); }
.glow-text { text-shadow: 0 0 30px rgba(99, 102, 241, 0.2); }

/* Quick Stats */
.stat-glass-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 28px; padding: 24px; }
.white-stats :deep(.n-statistic-label) { color: #94a3b8; font-weight: 600; }
.white-stats :deep(.n-statistic-value__content) { color: #fff; font-weight: 900; font-size: 2rem; font-family: 'JetBrains Mono', monospace; }

/* Podium */
.podium-section { min-height: 480px; display: flex; align-items: flex-end; }
.podium-grid { display: flex; justify-content: center; align-items: flex-end; gap: 32px; width: 100%; }
.podium-spot { display: flex; flex-direction: column; align-items: center; flex: 1; max-width: 200px; }
.podium-user { margin-bottom: 20px; display: flex; flex-direction: column; align-items: center; }
.podium-base { width: 100%; border-radius: 16px 16px 0 0; display: flex; justify-content: center; align-items: center; background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%); }
.base-number { font-size: 3rem; font-weight: 900; opacity: 0.1; color: #fff; }
.base-1 { height: 180px; border-top: 3px solid #f59e0b; background: linear-gradient(180deg, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%); }
.base-2 { height: 130px; border-top: 3px solid #94a3b8; }
.base-3 { height: 100px; border-top: 3px solid #b45309; }

/* Personal Status Card - NOW AT THE TOP */
.personal-info-card {
    background: rgba(99, 102, 241, 0.05) !important;
    border: 1px solid rgba(99, 102, 241, 0.2) !important;
    border-radius: 24px !important;
    padding: 8px;
}
.info-layout { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; }
.user-main { display: flex; align-items: center; gap: 24px; }
.rank-indicator { display: flex; flex-direction: column; }
.rank-indicator .label { font-size: 10px; color: #818cf8; font-weight: bold; text-transform: uppercase; }
.rank-indicator .value { font-size: 28px; font-weight: 900; color: #fff; line-height: 1; }
.user-detail { display: flex; align-items: center; gap: 16px; }
.name-box .nickname { font-weight: bold; color: #fff; font-size: 1.1rem; }
.user-actions { display: flex; align-items: center; gap: 32px; }
.streak-badge { text-align: right; }
.streak-badge .label { font-size: 10px; color: #fb923c; font-weight: bold; text-transform: uppercase; }
.streak-badge .value { font-size: 20px; font-weight: 900; color: #fff; line-height: 1; }
.guest-msg .msg-title { font-weight: bold; color: #fff; font-size: 1.1rem; }
.guest-msg .msg-desc { font-size: 13px; color: #64748b; }
.msg-icon { padding: 8px; background: rgba(99, 102, 241, 0.1); border-radius: 12px; }

/* Table */
.rank-card { background: rgba(15, 23, 42, 0.4) !important; backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); }
.main-rank-table { background: transparent !important; }
:deep(.main-rank-table th) { background: rgba(255, 255, 255, 0.02) !important; color: #64748b !important; font-size: 0.75rem; font-weight: 800; padding: 16px !important; }
:deep(.main-rank-table td) { padding: 18px 16px !important; border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important; vertical-align: middle; }
.rank-row:hover td { background: rgba(99, 102, 241, 0.03) !important; }
.rank-index { font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #475569; font-weight: 700; }

.action-btn { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
.animate-fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

@media (max-width: 768px) {
    .container { padding: 0 12px; }
    .text-6xl { font-size: 2.5rem; }
    .leaderboard-hero { padding: 20px 0; }
    .info-layout { flex-direction: column; gap: 20px; text-align: center; }
    .user-main { flex-direction: column; gap: 16px; }
    .user-actions { flex-direction: column; gap: 16px; }
    .streak-badge { text-align: center; }
    .podium-grid { gap: 12px; }
    .base-1 { height: 140px; }
    .base-2 { height: 100px; }
    .base-3 { height: 80px; }
    .rank-badge-top :deep(.n-avatar) { width: 60px !important; height: 60px !important; }
    .rank-1-spot :deep(.n-avatar) { width: 80px !important; height: 80px !important; }
}

@media (max-width: 600px) {
    .main-rank-table th:nth-child(3), 
    .main-rank-table td:nth-child(3),
    .main-rank-table th:nth-child(4), 
    .main-rank-table td:nth-child(4) {
        display: none;
    }
}
</style>
