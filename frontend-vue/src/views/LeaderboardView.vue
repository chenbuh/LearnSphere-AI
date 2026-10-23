<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NLayout, NLayoutContent, NCard, NTable, NAvatar, NTag, NSpin, 
  NIcon, NInput, NButton, NBadge, NDivider, NTooltip
} from 'naive-ui'
import { 
  Trophy, Flame, TrendingUp, Users, 
  Search, Target, Crown, ChevronRight,
  Sparkles, Clock, User, Heart, Shield, Award, Zap, CheckCircle2
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
const activeTab = ref('overall') // 'overall' | 'streak' | 'breakthrough'

const stats = ref({
  totalUsers: 0,
  activeToday: 0,
  avgStreak: 0
})

const myRankData = ref(null)
const lastUpdated = ref(null)
const nextUpdateIn = ref(0) 

// 本地点赞/助威状态记录
const kudosMap = ref({})

const SYNC_INTERVAL = 300 // 5 minutes in seconds

const fetchStats = async () => {
  try {
    const { code, data } = await userApi.getPublicStats()
    if (code === 200 && data) {
      stats.value = {
        totalUsers: data.totalUsers || 0,
        activeToday: data.activeToday || 0,
        avgStreak: data.avgStreak ? Number(data.avgStreak).toFixed(1) : 0
      }
    }
  } catch (e) {
    console.error('Failed to fetch statistics', e)
  }
}

const fetchMyRank = async () => {
  if (!userStore.token) return
  try {
    const { code, data } = await userApi.getMyRank()
    if (code === 200) myRankData.value = data
  } catch (e) {
    console.error('Failed to fetch my rank', e)
  }
}

const fetchLeaderboard = async (isResetTimer = true) => {
  if (leaderboard.value.length === 0) loading.value = true
  try {
    const { code, data } = await userApi.getLeaderboard()
    if (code === 200 && Array.isArray(data)) {
      leaderboard.value = data
      if (isResetTimer) {
        const now = new Date()
        lastUpdated.value = now
        nextUpdateIn.value = SYNC_INTERVAL
        localStorage.setItem('leaderboard_last_sync', now.getTime().toString())
      }
    }
  } catch (e) {
    console.error('Failed to fetch leaderboard', e)
  } finally {
    loading.value = false
  }
}

const fetchAllData = () => {
  fetchLeaderboard(true)
  fetchStats()
  fetchMyRank()
}

// 多维榜单切换与计算
const sortedLeaderboard = computed(() => {
  const list = [...(leaderboard.value || [])]
  if (activeTab.value === 'streak') {
    return list.sort((a, b) => (b.consecutiveDays || 0) - (a.consecutiveDays || 0))
  } else if (activeTab.value === 'breakthrough') {
    return list.sort((a, b) => (b.totalDays || 0) - (a.totalDays || 0))
  }
  // 默认综合战力 (积分优先，其次连续天数)
  return list.sort((a, b) => {
    if ((b.points || 0) !== (a.points || 0)) {
      return (b.points || 0) - (a.points || 0)
    }
    return (b.consecutiveDays || 0) - (a.consecutiveDays || 0)
  })
})

const filteredLeaderboard = computed(() => {
  const list = sortedLeaderboard.value
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.toLowerCase().trim()
  return list.filter(u => 
    (u.nickname && u.nickname.toLowerCase().includes(q)) ||
    (u.bio && u.bio.toLowerCase().includes(q))
  )
})

// 领奖台前三名（智能优雅兜底，杜绝页面空洞死黑）
const podiumTop3 = computed(() => {
  const list = sortedLeaderboard.value
  return {
    first: list[0] || null,
    second: list[1] || null,
    third: list[2] || null
  }
})

// 表格展示数据（如果前三展示在领奖台上，表格只展示第 4 名及以后；如果总人数不足 4 人，表格展示全部便于查看）
const tableDisplayList = computed(() => {
  const filtered = filteredLeaderboard.value
  if (filtered.length >= 3 && !searchQuery.value.trim()) {
    return filtered.slice(3)
  }
  return filtered
})

const timeToNextUpdate = computed(() => {
  const mins = Math.floor(nextUpdateIn.value / 60)
  const secs = nextUpdateIn.value % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

// 点赞/助威互动
const handleKudos = (userId) => {
  kudosMap.value[userId] = (kudosMap.value[userId] || 0) + 1
}

// 学术段位计算辅助函数
// R7：color 直接作为文字色渲染在 12% 同色底上，必须随主题切换，返回语义令牌
const getTierInfo = (points = 0, consecutiveDays = 0) => {
  const score = points + consecutiveDays * 20
  if (score >= 2000) {
    return { name: '巅峰宗师', color: 'var(--tone-amber)', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' }
  } else if (score >= 1000) {
    return { name: '钻石领航', color: 'var(--tone-emerald)', bg: 'rgba(43, 122, 96, 0.12)', border: 'rgba(43, 122, 96, 0.3)' }
  } else if (score >= 400) {
    return { name: '黄金破局', color: 'var(--tone-blue)', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' }
  } else if (score >= 100) {
    return { name: '白银精进', color: 'var(--tone-emerald)', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' }
  }
  return { name: '青铜笃行', color: 'var(--secondary-text)', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' }
}

// 学力阶梯体系元数据
// R7：color 供边框/描边等装饰用，保留原亮色；ink 供文字与图标用，随主题深浅切换
const leagueTiers = [
  { name: '青铜·笃行者', exp: '0 - 100 XP', desc: '开启系统学习，完成首场专项测评', color: '#94a3b8', ink: 'var(--secondary-text)' },
  { name: '白银·精进者', exp: '101 - 400 XP', desc: '连续打卡 7 天，构建核心高频词库', color: '#10b981', ink: 'var(--tone-emerald)' },
  { name: '黄金·破局者', exp: '401 - 1,000 XP', desc: '全真模考突破及格线，错题归因清零', color: '#3b82f6', ink: 'var(--tone-blue)' },
  { name: '钻石·领航员', exp: '1,001 - 2,000 XP', desc: '掌握全科长难句树，各模块成绩稳定 85%+', color: 'var(--tone-emerald)', ink: 'var(--tone-emerald)' },
  { name: '巅峰·宗师霸主', exp: '2,000+ XP', desc: '稳居全站荣誉榜 TOP 10，解锁学术荣誉勋章', color: '#f59e0b', ink: 'var(--tone-amber)' }
]

let countdownInterval = null

const initSyncState = () => {
  const savedTime = localStorage.getItem('leaderboard_last_sync')
  const now = new Date().getTime()
  
  if (savedTime) {
    const last = parseInt(savedTime)
    const diffSeconds = Math.floor((now - last) / 1000)
    
    if (diffSeconds < SYNC_INTERVAL) {
      nextUpdateIn.value = SYNC_INTERVAL - diffSeconds
      lastUpdated.value = new Date(last)
      fetchLeaderboard(false)
      fetchStats()
      fetchMyRank()
    } else {
      fetchAllData()
    }
  } else {
    fetchAllData()
  }
}

onMounted(() => {
  initSyncState()
  
  countdownInterval = setInterval(() => {
    if (nextUpdateIn.value > 0) {
      nextUpdateIn.value--
    } else {
      fetchAllData()
    }
  }, 1000)
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<template>
  <div class="leaderboard-page min-h-screen">
    <SiteHeader />
    
    <main class="leaderboard-main">
      <!-- 1. Hero 展厅看板与同步倒计时 -->
      <section class="leaderboard-hero relative overflow-hidden">
        <div class="leaderboard-container text-center">
          <div class="hero-sync-kicker">
            <div class="sync-item">
              <Crown class="w-4 h-4 text-amber-400" />
              <span>下次自动同步: <strong>{{ timeToNextUpdate }}</strong></span>
            </div>
            <span class="sync-dot-divider">·</span>
            <div class="sync-item opacity-80">
              <Clock class="w-3.5 h-3.5 text-indigo-400" />
              <span>数据更新于 {{ lastUpdated ? lastUpdated.toLocaleTimeString() : '实时' }}</span>
            </div>
          </div>

          <h1 class="hero-main-title">
            巅峰<span class="gradient-text">学习功勋榜</span>
          </h1>

          <p class="hero-subtext">
            自律是通往卓越的必经之路。记录每一位语海征途中的先行者，见证知识改变命运的坚韧力量。
          </p>

          <!-- 2. 三大核心战力概览微晶卡片 -->
          <div class="stats-cards-grid">
            <div class="stat-glass-card">
              <div class="stat-icon-wrapper user-icon">
                <Users class="stat-icon" />
              </div>
              <div class="stat-data-col">
                <div class="stat-number">{{ stats.totalUsers || 1 }}</div>
                <div class="stat-title">全站学员入驻</div>
                <div class="stat-trend-tag text-blue">真实同步在册</div>
              </div>
            </div>

            <div class="stat-glass-card">
              <div class="stat-icon-wrapper flame-icon">
                <Flame class="stat-icon" />
              </div>
              <div class="stat-data-col">
                <div class="stat-number">{{ stats.activeToday || 0 }}</div>
                <div class="stat-title">今日打卡先锋</div>
                <div class="stat-trend-tag text-orange">自律领跑中</div>
              </div>
            </div>

            <div class="stat-glass-card">
              <div class="stat-icon-wrapper trend-icon">
                <TrendingUp class="stat-icon" />
              </div>
              <div class="stat-data-col">
                <div class="stat-number">{{ stats.avgStreak || 0 }} <span class="unit">天</span></div>
                <div class="stat-title">平均连续打卡</div>
                <div class="stat-trend-tag text-emerald">坚持成就卓越</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="leaderboard-container pb-28">
        <!-- 3. 个人位次浮动透视舱 (Personal Standing Deck) -->
        <div class="personal-standing-deck mb-10">
          <div class="standing-glass-panel">
            <template v-if="userStore.token && myRankData">
              <div class="user-rank-info">
                <div class="rank-badge-box">
                  <span class="rank-label">我的当前排位</span>
                  <span class="rank-number">#{{ myRankData.rank || '-' }}</span>
                </div>
                <div class="rank-vertical-line"></div>
                <div class="user-meta-group">
                  <n-avatar round :size="48" :src="myRankData.avatar" class="border-2 border-indigo-500">
                    <n-icon :component="User" />
                  </n-avatar>
                  <div>
                    <div class="user-name-text">{{ myRankData.nickname || '正在备考的学员' }}</div>
                    <div class="user-motto-text">持之以恒，金石为开 · 距离上一名还差 1 组练习</div>
                  </div>
                </div>
              </div>

              <div class="user-stats-actions">
                <div class="streak-pill-box">
                  <Flame class="w-4 h-4 text-orange-400" />
                  <span>连续打卡 <strong>{{ myRankData.consecutiveDays || 0 }}</strong> 天</span>
                </div>
                <button class="dash-action-btn" @click="router.push('/dashboard')">
                  <Zap class="w-4 h-4" />
                  <span>开启今日刷题冲榜</span>
                </button>
              </div>
            </template>

            <template v-else>
              <div class="guest-prompt-layout">
                <div class="guest-icon-box">
                  <Target class="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div class="guest-headline">开启你的巅峰学习排位之旅</div>
                  <div class="guest-subtext">登录后即可在此激活专属战力档案，查看实时全国排位与打卡成就勋章</div>
                </div>
              </div>
              <button class="guest-join-btn" @click="router.push('/login')">
                <span>立即加入挑战</span>
                <ChevronRight class="w-4 h-4" />
              </button>
            </template>
          </div>
        </div>

        <!-- 4. 智能自适应荣誉殿堂领奖台 (Top 3 Champions Showcase) -->
        <div class="champions-podium-section mb-14">
          <div class="podium-section-header">
            <div class="season-kicker-pill">
              <Trophy class="w-4 h-4 text-amber-400" />
              <span>2026 S1 赛季 · 每周巅峰荣誉殿堂（每周日 24:00 结算）</span>
            </div>
            <div class="reward-preview-tag">
              <Sparkles class="w-3.5 h-3.5 text-indigo-400" />
              <span>榜首尊享：专属【巅峰星芒】头像框 + 7天 VIP 特权</span>
            </div>
          </div>

          <div class="podium-three-pillars">
            <!-- 亚军 Rank 2 -->
            <div class="podium-col col-rank-2">
              <div class="podium-user-card" :class="{ empty: !podiumTop3.second }">
                <template v-if="podiumTop3.second">
                  <div class="rank-crown-badge silver">2</div>
                  <n-avatar round :size="76" :src="podiumTop3.second.avatar" class="avatar-border-silver">
                    <n-icon :component="User" />
                  </n-avatar>
                  <h4 class="podium-username">{{ podiumTop3.second.nickname }}</h4>
                  <div class="podium-streak-tag silver-tag">
                    <Flame class="w-3.5 h-3.5" />
                    <span>连续 {{ podiumTop3.second.consecutiveDays || 0 }} 天</span>
                  </div>
                  <div class="podium-score-text">{{ podiumTop3.second.points || 0 }} 积分</div>
                </template>
                <template v-else>
                  <div class="empty-throne-box">
                    <Shield class="w-8 h-8 text-slate-500 mb-2" />
                    <span class="empty-throne-title">虚位以待 · 冲榜亚军</span>
                    <span class="empty-throne-desc">累计打卡 3 天即可竞逐此席</span>
                  </div>
                </template>
              </div>
              <div class="podium-pedestal pedestal-2">
                <span class="pedestal-rank-num" aria-hidden="true">2</span>
                <span class="pedestal-label">RUNNER-UP</span>
              </div>
            </div>

            <!-- 冠军 Rank 1 -->
            <div class="podium-col col-rank-1">
              <div class="podium-user-card champion-card" :class="{ empty: !podiumTop3.first }">
                <template v-if="podiumTop3.first">
                  <div class="champion-halo"></div>
                  <div class="crown-icon-floater">
                    <Crown class="w-7 h-7 text-amber-400 animate-bounce" />
                  </div>
                  <div class="rank-crown-badge gold">1</div>
                  <n-avatar round :size="96" :src="podiumTop3.first.avatar" class="avatar-border-gold">
                    <n-icon :component="User" />
                  </n-avatar>
                  <h4 class="podium-username champion-name">{{ podiumTop3.first.nickname }}</h4>
                  <div class="podium-streak-tag gold-tag">
                    <Flame class="w-3.5 h-3.5" />
                    <span>领跑 {{ podiumTop3.first.consecutiveDays || 0 }} 天</span>
                  </div>
                  <div class="podium-score-text gold-score">{{ podiumTop3.first.points || 0 }} 荣誉积分</div>
                  <div class="champion-motto">“{{ podiumTop3.first.bio || '持之以恒，金石为开' }}”</div>
                </template>
                <template v-else>
                  <div class="empty-throne-box">
                    <Crown class="w-10 h-10 text-amber-500 mb-2" />
                    <span class="empty-throne-title">黄金王座 · 等待王者</span>
                    <span class="empty-throne-desc">今日完成测试即可首发登顶</span>
                  </div>
                </template>
              </div>
              <div class="podium-pedestal pedestal-1">
                <span class="pedestal-rank-num" aria-hidden="true">1</span>
                <span class="pedestal-label">CHAMPION</span>
              </div>
            </div>

            <!-- 季军 Rank 3 -->
            <div class="podium-col col-rank-3">
              <div class="podium-user-card" :class="{ empty: !podiumTop3.third }">
                <template v-if="podiumTop3.third">
                  <div class="rank-crown-badge bronze">3</div>
                  <n-avatar round :size="72" :src="podiumTop3.third.avatar" class="avatar-border-bronze">
                    <n-icon :component="User" />
                  </n-avatar>
                  <h4 class="podium-username">{{ podiumTop3.third.nickname }}</h4>
                  <div class="podium-streak-tag bronze-tag">
                    <Flame class="w-3.5 h-3.5" />
                    <span>连续 {{ podiumTop3.third.consecutiveDays || 0 }} 天</span>
                  </div>
                  <div class="podium-score-text">{{ podiumTop3.third.points || 0 }} 积分</div>
                </template>
                <template v-else>
                  <div class="empty-throne-box">
                    <Award class="w-8 h-8 text-amber-700 mb-2" />
                    <span class="empty-throne-title">虚位以待 · 冲榜季军</span>
                    <span class="empty-throne-desc">连续打卡 2 天即可跻身前三</span>
                  </div>
                </template>
              </div>
              <div class="podium-pedestal pedestal-3">
                <span class="pedestal-rank-num" aria-hidden="true">3</span>
                <span class="pedestal-label">THIRD PLACE</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. 多维榜单控制条与学员大名单 -->
        <div class="roster-section-container">
          <div class="roster-toolbar">
            <div class="roster-tabs-deck">
              <button
                class="roster-tab-btn"
                :class="{ active: activeTab === 'overall' }"
                @click="activeTab = 'overall'"
              >
                <Trophy class="w-4 h-4" />
                <span>全站功勋总榜</span>
              </button>

              <button
                class="roster-tab-btn"
                :class="{ active: activeTab === 'streak' }"
                @click="activeTab = 'streak'"
              >
                <Flame class="w-4 h-4" />
                <span>连续打卡榜</span>
              </button>

              <button
                class="roster-tab-btn"
                :class="{ active: activeTab === 'breakthrough' }"
                @click="activeTab = 'breakthrough'"
              >
                <TrendingUp class="w-4 h-4" />
                <span>累计天数黑马</span>
              </button>
            </div>

            <div class="roster-search-box">
              <n-input
                v-model:value="searchQuery"
                placeholder="搜索学员昵称或签名..."
                round
                size="medium"
                class="glass-search-input"
              >
                <template #prefix>
                  <Search class="w-4 h-4 text-slate-400" />
                </template>
              </n-input>
            </div>
          </div>

          <!-- 学员排行榜卡片表格 -->
          <div class="roster-card-wrapper">
            <n-spin :show="loading">
              <div class="table-responsive-wrapper">
                <table class="roster-table">
                  <thead>
                    <tr>
                      <th class="th-rank">排名</th>
                      <th class="th-user">学员详情</th>
                      <th class="th-streak">连续自律</th>
                      <th class="th-total">累计打卡</th>
                      <th class="th-tier">学力段位</th>
                      <th class="th-kudos">为 Ta 助威</th>
                      <th class="th-arrow"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(user, idx) in tableDisplayList"
                      :key="user.id || idx"
                      class="roster-row"
                    >
                      <td class="td-rank">
                        <div class="rank-number-cell">
                          <span v-if="idx === 0 && tableDisplayList === filteredLeaderboard" class="medal-tag gold">#1</span>
                          <span v-else-if="idx === 1 && tableDisplayList === filteredLeaderboard" class="medal-tag silver">#2</span>
                          <span v-else-if="idx === 2 && tableDisplayList === filteredLeaderboard" class="medal-tag bronze">#3</span>
                          <span v-else class="rank-plain-num">
                            #{{ tableDisplayList === filteredLeaderboard ? idx + 1 : idx + 4 }}
                          </span>
                        </div>
                      </td>

                      <td class="td-user">
                        <div class="user-cell-wrapper">
                          <n-avatar
                            round
                            :size="44"
                            :src="user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user.nickname || 'U')}`"
                            class="user-table-avatar"
                          >
                            <n-icon :component="User" />
                          </n-avatar>
                          <div class="user-table-info">
                            <div class="user-table-name">
                              {{ user.nickname || '这名用户很低调' }}
                              <span v-if="user.points >= 1000" class="pro-badge">PRO</span>
                            </div>
                            <div class="user-table-bio">
                              {{ user.bio || '持之以恒，金石为开' }}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td class="td-streak">
                        <div class="streak-data-pill">
                          <Flame class="w-4 h-4 text-orange-500" />
                          <span class="streak-days-num">{{ user.consecutiveDays || 0 }}</span>
                          <span class="streak-unit">天</span>
                        </div>
                      </td>

                      <td class="td-total">
                        <div class="total-days-pill">
                          <Clock class="w-3.5 h-3.5 text-indigo-400" />
                          <span>{{ user.totalDays || 0 }} 天</span>
                        </div>
                      </td>

                      <td class="td-tier">
                        <span
                          class="tier-badge-pill"
                          :style="{
                            color: getTierInfo(user.points, user.consecutiveDays).color,
                            backgroundColor: getTierInfo(user.points, user.consecutiveDays).bg,
                            borderColor: getTierInfo(user.points, user.consecutiveDays).border
                          }"
                        >
                          <Award class="w-3 h-3 mr-1" />
                          {{ getTierInfo(user.points, user.consecutiveDays).name }}
                        </span>
                      </td>

                      <td class="td-kudos">
                        <button
                          class="kudos-btn"
                          :class="{ active: (kudosMap[user.id] || 0) > 0 }"
                          @click="handleKudos(user.id)"
                        >
                          <Heart class="w-3.5 h-3.5" />
                          <span>{{ (user.points || 0) + (kudosMap[user.id] || 0) }}</span>
                        </button>
                      </td>

                      <td class="td-arrow">
                        <ChevronRight class="w-4 h-4 text-slate-500 opacity-60" />
                      </td>
                    </tr>

                    <tr v-if="tableDisplayList.length === 0">
                      <td colspan="7" class="text-center py-12 text-slate-400">
                        暂无匹配的学员排位记录
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </n-spin>
          </div>
        </div>

        <!-- 6. 学力段位阶梯与晋级指南舱 -->
        <div class="league-tiers-section mt-14">
          <div class="tiers-header text-center mb-8">
            <span class="tiers-kicker">GROWTH ROADMAP</span>
            <h3 class="tiers-title">学力段位阶梯体系</h3>
            <p class="tiers-sub">每一次坚持打卡与模考通关，都在积累通往巅峰的荣耀经验</p>
          </div>

          <div class="tiers-roadmap-grid">
            <div
              v-for="(tier, tIdx) in leagueTiers"
              :key="tIdx"
              class="tier-step-card"
              :style="{ '--tier-color': tier.color, '--tier-ink': tier.ink }"
            >
              <div class="tier-card-top">
                <span class="tier-step-num">0{{ tIdx + 1 }}</span>
                <div class="tier-badge-circle">
                  <Award class="w-5 h-5" />
                </div>
              </div>
              <h4 class="tier-name">{{ tier.name }}</h4>
              <div class="tier-exp-range">{{ tier.exp }}</div>
              <p class="tier-desc">{{ tier.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
/* ========================================================
   1. 统一设计系统 CSS 变量与基础画布
   ======================================================== */
.leaderboard-page {
  --lb-bg: #060813;
  --lb-card-bg: rgba(15, 23, 42, 0.72);
  --lb-card-border: rgba(255, 255, 255, 0.08);
  --lb-text-primary: #f8fafc;
  --lb-text-secondary: #94a3b8;
  --lb-text-muted: #94a3b8;
  --lb-surface-muted: rgba(255, 255, 255, 0.04);
  --lb-accent: #1e6b52;
  --lb-accent-glow: rgba(30, 107, 82, 0.25);
  --lb-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6);

  min-height: 100vh;
  background-color: var(--lb-bg);
  color: var(--lb-text-primary);
  background-image: transparent;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 浅色白金极光主题适配 (WCAG AA 高对比度) */
html[data-theme='light'] .leaderboard-page {
  --lb-bg: #f8fafc;
  --lb-card-bg: rgba(255, 255, 255, 0.94);
  --lb-card-border: rgba(203, 213, 225, 0.85);
  --lb-text-primary: #0f172a;
  --lb-text-secondary: #475569;
  --lb-text-muted: #52606f;
  --lb-surface-muted: rgba(241, 245, 249, 0.85);
  --lb-accent: #1e6b52;
  --lb-accent-glow: rgba(30, 107, 82, 0.15);
  --lb-shadow: 0 16px 36px -10px rgba(148, 163, 184, 0.22);

  background-color: var(--lb-bg);
}

.leaderboard-container {
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 0 clamp(16px, 3.5vw, 40px);
}

.leaderboard-main {
  position: relative;
  z-index: 1;
}

/* ========================================================
   2. Hero 展厅看板与同步指示
   ======================================================== */
.leaderboard-hero {
  padding: 56px 0 32px;
}

.hero-sync-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 18px;
  background: var(--lb-surface-muted);
  border: 1px solid var(--lb-card-border);
  border-radius: 9999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--lb-text-secondary);
  margin-bottom: 20px;
}

.sync-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sync-dot-divider {
  color: var(--lb-text-muted);
}

.hero-main-title {
  font-size: clamp(2.4rem, 4.2vw, 3.6rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--lb-text-primary);
  margin-bottom: 16px;
}

.gradient-text {
  background: none;
  color: inherit;
}

html[data-theme='light'] .gradient-text {
  background: none;
  color: inherit;
}

.hero-subtext {
  font-size: clamp(1rem, 1.3vw, 1.15rem);
  line-height: 1.65;
  color: var(--lb-text-secondary);
  max-width: 740px;
  margin: 0 auto 36px;
}

/* 三大核心战力概览卡片 */
.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 16px;
}

.stat-glass-card {
  background: var(--lb-card-bg);
  border: 1px solid var(--lb-card-border);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.stat-glass-card:hover {
  transform: translateY(-4px);
  border-color: var(--lb-accent);
}

.stat-icon-wrapper {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-icon-wrapper.user-icon {
  background: rgba(30, 107, 82, 0.12);
  color: var(--tone-emerald);
}

.stat-icon-wrapper.flame-icon {
  background: rgba(245, 158, 11, 0.12);
  color: var(--tone-amber);
}

.stat-icon-wrapper.trend-icon {
  background: rgba(16, 185, 129, 0.12);
  color: var(--tone-emerald);
}

.stat-icon {
  width: 26px;
  height: 26px;
}

.stat-data-col {
  text-align: left;
}

.stat-number {
  font-size: 1.9rem;
  font-weight: 900;
  color: var(--lb-text-primary);
  line-height: 1.1;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.stat-number .unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--lb-text-muted);
  margin-left: 2px;
}

.stat-title {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--lb-text-secondary);
  margin-top: 4px;
}

.stat-trend-tag {
  font-size: 0.72rem;
  font-weight: 700;
  margin-top: 2px;
}

.stat-trend-tag.text-blue { color: var(--tone-blue); }
.stat-trend-tag.text-orange { color: var(--tone-orange); }
.stat-trend-tag.text-emerald { color: var(--tone-emerald); }

/* ========================================================
   3. 个人位次浮动透视舱 (Standing Deck)
   ======================================================== */
.personal-standing-deck {
  width: 100%;
}

.standing-glass-panel {
  background: var(--lb-card-bg);
  border: 1px solid rgba(30, 107, 82, 0.3);
  border-radius: var(--radius-lg);
  padding: 18px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.user-rank-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rank-badge-box {
  display: flex;
  flex-direction: column;
}

.rank-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--tone-emerald);
}

.rank-number {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--lb-text-primary);
  line-height: 1;
  font-family: ui-monospace, monospace;
}

.rank-vertical-line {
  width: 1px;
  height: 38px;
  background: var(--lb-card-border);
}

.user-meta-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-name-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--lb-text-primary);
}

.user-motto-text {
  font-size: 0.8rem;
  color: var(--lb-text-muted);
  margin-top: 2px;
}

.user-stats-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.streak-pill-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 9999px;
  font-size: 0.86rem;
  color: var(--tone-amber);
}

.dash-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--brand-ink);
  border: none;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.dash-action-btn:hover {
  transform: translateY(-2px);
}

/* 游客未登录提示 */
.guest-prompt-layout {
  display: flex;
  align-items: center;
  gap: 16px;
}

.guest-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(30, 107, 82, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guest-headline {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--lb-text-primary);
}

.guest-subtext {
  font-size: 0.84rem;
  color: var(--lb-text-secondary);
}

.guest-join-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius-md);
  background: var(--brand);
  color: var(--brand-ink);
  border: none;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
}

.guest-join-btn:hover {
  transform: translateY(-2px);
}

/* ========================================================
   4. 智能自适应荣誉殿堂领奖台 (Podium)
   ======================================================== */
.champions-podium-section {
  background: var(--lb-card-bg);
  border: 1px solid var(--lb-card-border);
  border-radius: var(--radius-lg);
  padding: 36px 32px 0;
}

.podium-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 36px;
  flex-wrap: wrap;
  gap: 12px;
}

.season-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--tone-amber);
}

.reward-preview-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(30, 107, 82, 0.08);
  border: 1px solid rgba(30, 107, 82, 0.2);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--tone-emerald);
}

.podium-three-pillars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 24px;
}

.podium-col {
  flex: 1;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.podium-user-card {
  width: 100%;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid var(--lb-card-border);
  border-radius: var(--radius-lg);
  padding: 24px 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  margin-bottom: -10px;
  z-index: 2;
}

html[data-theme='light'] .podium-user-card {
  background: rgba(255, 255, 255, 0.9);
}

.podium-user-card.champion-card {
  padding-top: 32px;
  border-color: rgba(245, 158, 11, 0.4);
  background: var(--card-bg);
}

/* 浅色主题补兜底：琥珀描边在白卡上太淡，压深一档保证轮廓可见 */
html[data-theme='light'] .podium-user-card.champion-card {
  border-color: rgba(180, 83, 9, 0.45);
}

.crown-icon-floater {
  position: absolute;
  top: -20px;
}

.rank-crown-badge {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-color);
}

/* 徽章是实心亮色底 + 深色字，不能沿用主题正文色
   （深色主题下正文是浅色，压在 #f59e0b 上只有 1.72:1） */
.rank-crown-badge.gold { background: #f59e0b; color: #3b2600; }
.rank-crown-badge.silver { background: #94a3b8; color: #1c2431; }
.rank-crown-badge.bronze { background: #b45309; color: #fff7ed; }

.avatar-border-gold {
  border: 4px solid #f59e0b !important;
}

.avatar-border-silver {
  border: 3px solid #94a3b8 !important;
}

.avatar-border-bronze {
  border: 3px solid #b45309 !important;
}

.podium-username {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--lb-text-primary);
  margin: 12px 0 6px;
}

.champion-name {
  font-size: 1.25rem;
  color: var(--tone-amber);
}

.podium-streak-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 9999px;
  margin-bottom: 8px;
}

.gold-tag { background: rgba(245, 158, 11, 0.15); color: var(--tone-amber); }
.silver-tag { background: rgba(148, 163, 184, 0.15); color: var(--secondary-text); }
/* R5：#d97706 压在 15% 棕底上浅色主题只有 3.1:1，改用随主题切换的琥珀令牌 */
.bronze-tag { background: rgba(180, 83, 9, 0.15); color: var(--tone-amber); }

.podium-score-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--lb-text-secondary);
}

.gold-score {
  color: var(--tone-amber);
  font-weight: 800;
}

.champion-motto {
  font-size: 0.75rem;
  color: var(--lb-text-muted);
  margin-top: 6px;
  font-style: italic;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 虚位以待卡片 */
.empty-throne-box {
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-throne-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--lb-text-secondary);
  margin-bottom: 4px;
}

.empty-throne-desc {
  font-size: 0.76rem;
  color: var(--lb-text-muted);
}

/* 领奖台基座 (Pedestals) */
.podium-pedestal {
  width: 100%;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.pedestal-rank-num {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  /* R8：纯装饰水印数字，模板已加 aria-hidden，可保留低透明度 */
  opacity: 0.15;
  color: var(--text-color);
}

.pedestal-label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--lb-text-muted);
  margin-top: 2px;
}

.pedestal-1 {
  height: 190px;
  background: var(--card-bg);
  border-top: 3px solid #f59e0b;
}

.pedestal-2 {
  height: 140px;
  background: var(--card-bg);
  border-top: 3px solid #94a3b8;
}

.pedestal-3 {
  height: 110px;
  background: var(--card-bg);
  border-top: 3px solid #b45309;
}

/* ========================================================
   5. 多维榜单控制条与表格
   ======================================================== */
.roster-section-container {
  margin-top: 28px;
}

.roster-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.roster-tabs-deck {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  background: var(--lb-surface-muted);
  border: 1px solid var(--lb-card-border);
  border-radius: var(--radius-lg);
}

.roster-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid transparent;
  color: var(--lb-text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.roster-tab-btn:hover {
  color: var(--lb-text-primary);
}

.roster-tab-btn.active {
  background: var(--lb-card-bg);
  border-color: var(--lb-accent);
  color: var(--lb-text-primary);
}

.roster-search-box {
  width: 280px;
}

.glass-search-input :deep(.n-input__input-el) {
  font-size: 0.88rem;
}

/* 表格卡片容器 */
.roster-card-wrapper {
  background: var(--lb-card-bg);
  border: 1px solid var(--lb-card-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-responsive-wrapper {
  width: 100%;
  overflow-x: auto;
}

.roster-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.roster-table th {
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--lb-card-border);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--lb-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.roster-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--lb-card-border);
  vertical-align: middle;
}

.roster-row {
  transition: background-color 0.2s ease;
}

.roster-row:hover {
  background-color: rgba(30, 107, 82, 0.04);
}

.rank-number-cell {
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  font-weight: 800;
}

.rank-plain-num {
  color: var(--lb-text-muted);
}

.medal-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-weight: 800;
}

.medal-tag.gold { background: rgba(245, 158, 11, 0.15); color: var(--tone-amber); }
.medal-tag.silver { background: rgba(148, 163, 184, 0.15); color: var(--secondary-text); }
.medal-tag.bronze { background: rgba(180, 83, 9, 0.15); color: var(--tone-amber); }

.user-cell-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-table-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--lb-text-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pro-badge {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 4px;
  background: #f59e0b;
  /* R4：实心琥珀底配固定深棕 ink，深色主题下不再用浅色正文 */
  color: #3b2600;
}

.user-table-bio {
  font-size: 0.78rem;
  color: var(--lb-text-muted);
  margin-top: 2px;
}

.streak-data-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.streak-days-num {
  font-family: ui-monospace, monospace;
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--lb-text-primary);
}

.streak-unit {
  font-size: 0.78rem;
  color: var(--lb-text-muted);
}

.total-days-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--tone-emerald);
}

.tier-badge-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 700;
  border: 1px solid;
}

.kudos-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: var(--lb-surface-muted);
  border: 1px solid var(--lb-card-border);
  color: var(--lb-text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kudos-btn:hover,
.kudos-btn.active {
  background: rgba(180, 84, 58, 0.12);
  border-color: rgba(180, 84, 58, 0.3);
  /* R5：原 #b4543a 在浅色主题低透明底上不足 4.5:1 */
  color: var(--tone-orange);
}

/* ========================================================
   6. 学力段位阶梯与晋级指南舱 (Roadmap)
   ======================================================== */
.league-tiers-section {
  padding-top: 24px;
}

.tiers-kicker {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--tone-emerald);
  text-transform: uppercase;
  display: block;
  margin-bottom: 6px;
}

.tiers-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--lb-text-primary);
  margin-bottom: 8px;
}

.tiers-sub {
  font-size: 0.92rem;
  color: var(--lb-text-secondary);
}

.tiers-roadmap-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.tier-step-card {
  background: var(--lb-card-bg);
  border: 1px solid var(--lb-card-border);
  border-radius: var(--radius-lg);
  padding: 20px 16px;
  transition: transform 0.25s ease, border-color 0.25s ease;
  position: relative;
}

.tier-step-card:hover {
  transform: translateY(-4px);
  border-color: var(--tier-color);
}

.tier-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tier-step-num {
  font-family: ui-monospace, monospace;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--lb-text-muted);
}

.tier-badge-circle {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--lb-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tier-ink);
}

.tier-name {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--lb-text-primary);
  margin-bottom: 4px;
}

.tier-exp-range {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--tier-ink);
  margin-bottom: 8px;
}

.tier-desc {
  font-size: 0.78rem;
  line-height: 1.5;
  color: var(--lb-text-secondary);
  margin: 0;
}

/* ========================================================
   7. 响应式适配
   ======================================================== */
@media (max-width: 1024px) {
  .tiers-roadmap-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .podium-three-pillars {
    flex-direction: column;
    align-items: stretch;
  }
  .podium-col {
    max-width: none;
  }
  .podium-pedestal {
    display: none;
  }
  .roster-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .roster-search-box {
    width: 100%;
  }
  .roster-tabs-deck {
    width: 100%;
    justify-content: space-between;
  }
  .tiers-roadmap-grid {
    grid-template-columns: 1fr;
  }
  /* 领奖台改为纵向堆叠后，冠军卡上方的皇冠浮标需要留出间距，避免压住上一张卡 */
  .podium-three-pillars {
    gap: 24px;
  }
  .champions-podium-section {
    padding: 28px 20px 0;
  }
  .podium-section-header {
    margin-bottom: 24px;
  }
}

@media (max-width: 640px) {
  .th-total, .td-total,
  .th-tier, .td-tier {
    display: none;
  }

  /* 表格横向溢出修复：定宽列 + 压缩内边距，把可见 5 列压进 338px 容器。
     用 table-layout: fixed 锁住列宽，否则长昵称 / 多位数积分会把整表顶宽
     （实测 382px > 338px 容器，右侧助威列被裁掉） */
  .table-responsive-wrapper {
    -webkit-overflow-scrolling: touch;
  }
  .roster-table {
    table-layout: fixed;
  }
  .roster-table th,
  .roster-table td {
    padding: 10px 8px;
  }
  .roster-table th {
    font-size: 13px;
    letter-spacing: 0;
    white-space: nowrap;
  }
  /* 尾列箭头纯装饰（行本身无点击交互），小屏隐藏可省出 40px 给学员详情列 */
  .th-arrow,
  .td-arrow {
    display: none;
  }
  .th-rank { width: 50px; }
  .th-user { width: auto; }
  .th-streak { width: 68px; }
  .th-kudos { width: 66px; }

  .rank-number-cell {
    font-size: 14px;
  }
  .user-cell-wrapper {
    gap: 8px;
    min-width: 0;
  }
  .user-table-avatar {
    --n-avatar-size-override: 36px;
    flex-shrink: 0;
  }
  .user-table-info {
    min-width: 0;
    flex: 1;
  }
  .user-table-name {
    font-size: 13px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* 学员详情列仅 ~166px：签名再占一行会把昵称挤到 ~90px，
     窄屏隐藏签名（桌面 / 平板仍展示），宽度让给昵称 */
  .user-table-bio {
    display: none;
  }
  .streak-data-pill {
    gap: 4px;
    white-space: nowrap;
  }
  .streak-days-num {
    font-size: 14px;
  }
  .streak-unit {
    font-size: 13px;
  }
  .kudos-btn {
    padding: 6px 8px;
    font-size: 13px;
  }
  .roster-tab-btn {
    flex: 1;
    justify-content: center;
    padding: 8px 6px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  /* 领奖台在 360px 下左右各 32px 内边距挤压卡片，收窄后卡片可用宽度 +56px */
  .champions-podium-section {
    padding: 22px 14px 0;
  }
  .podium-section-header {
    margin-bottom: 20px;
  }
  .season-kicker-pill {
    font-size: 13px;
    line-height: 1.5;
  }
  .reward-preview-tag {
    font-size: 13px;
    line-height: 1.5;
  }
  .podium-three-pillars {
    gap: 18px;
  }
  /* 冠军卡顶部有 -20px 的皇冠浮标，堆叠排版时会压进上方亚军卡 11px，额外让出空间 */
  .podium-col.col-rank-1 {
    margin-top: 16px;
  }
  .podium-user-card {
    padding: 18px 12px 16px;
  }
  .podium-user-card.champion-card {
    padding-top: 28px;
  }
  .podium-username {
    font-size: 16px;
    margin: 10px 0 6px;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .champion-name {
    font-size: 17px;
  }
  .podium-streak-tag {
    font-size: 13px;
  }
  .podium-score-text {
    font-size: 13px;
  }
  /* 冠军宣言原为 nowrap + 200px 上限，窄屏会被裁成半句，改为两行截断 */
  .champion-motto {
    font-size: 13px;
    max-width: 100%;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .empty-throne-title {
    font-size: 16px;
  }
  .empty-throne-desc {
    font-size: 13px;
  }
  .roster-table th,
  .roster-table td {
    padding: 9px 6px;
  }
  .th-rank { width: 46px; }
  .th-streak { width: 64px; }
  .th-kudos { width: 62px; }
  .kudos-btn {
    padding: 5px 6px;
  }
}

@media (max-width: 390px) {
  .user-table-avatar {
    --n-avatar-size-override: 32px;
  }
  .user-cell-wrapper {
    gap: 6px;
  }
}
</style>
