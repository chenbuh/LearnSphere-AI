<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NGrid, NGridItem, NCard, NStatistic, NProgress, NButton, NIcon, NList, NListItem, NTag, NSpace, NRadioGroup, NRadioButton, useMessage } from 'naive-ui'
import { Activity, Clock, Award, Target, TrendingUp, Book, Check, Zap, Bell } from 'lucide-vue-next'
import * as echarts from 'echarts'
import gsap from 'gsap'

import { userApi } from '../api/user'
import { recommendationApi } from '../api/recommendation'
import { learningApi } from '../api/learning'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'

const router = useRouter()
const { t, tm } = useI18n()
const userStore = useUserStore()
const systemStore = useSystemStore()

const stats = ref({
    time: { value: '0h', change: '+0%' },
    vocab: { value: '0', change: '+0' },
    streak: { value: '0', change: 'days' } // Streak info
})
const recentActivity = ref([])
const leaderboard = ref([]) // Leaderboard data
const aiStep = ref(0)
const recData = ref(null)
const aiRecommendations = ref([])
const userInfo = ref(null) // User info
const isCheckedIn = ref(false) // Check-in status
const aiRecLoading = ref(true)

// Leveling System Data
const userLevel = computed(() => {
  const points = userInfo.value?.points || 0
  return Math.floor(Math.sqrt(points / 10)) + 1
})

const xpProgress = computed(() => {
  const points = userInfo.value?.points || 0
  const currentLevel = userLevel.value
  const currentLevelMinPoints = Math.pow(currentLevel - 1, 2) * 10
  const nextLevelMinPoints = Math.pow(currentLevel, 2) * 10
  const progress = ((points - currentLevelMinPoints) / (nextLevelMinPoints - currentLevelMinPoints)) * 100
  return Math.min(Math.max(progress, 0), 100)
})

const nextLevelXP = computed(() => {
  const currentLevel = userLevel.value
  return Math.pow(currentLevel, 2) * 10
})

// Mouse Parallax for Welcome Banner
const bannerTransform = ref('translate(0, 0)')
const handleMouseMove = (e) => {
  const { clientX, clientY } = e
  const moveX = (clientX - window.innerWidth / 2) / 50
  const moveY = (clientY - window.innerHeight / 2) / 50
  bannerTransform.value = `translate(${moveX}px, ${moveY}px)`
}

const barChartRef = ref(null)
const lineChartRef = ref(null)
let barChartInstance = null
let lineChartInstance = null

const chartRange = ref(7)

const fetchUserData = async () => {
    try {
        const { code, data } = await userApi.getUserInfo()
        if (code === 200 && data) {
            userInfo.value = data
            stats.value.streak.value = data.realConsecutiveDays != null ? data.realConsecutiveDays : (data.consecutiveDays || 0)
            
            // Check if checked in today
            const lastDate = data.lastCheckinDate
            const now = new Date()
            const y = now.getFullYear()
            const m = String(now.getMonth() + 1).padStart(2, '0')
            const d = String(now.getDate()).padStart(2, '0')
            const today = `${y}-${m}-${d}`
            isCheckedIn.value = lastDate === today
        }
    } catch (e) {
        console.error("Failed to fetch user info", e)
    }
}

const fetchLeaderboard = async () => {
    try {
        const { code, data } = await userApi.getLeaderboard()
        if (code === 200) {
            leaderboard.value = data
        }
    } catch (e) {
        console.error("Failed to fetch leaderboard", e)
    }
}

const message = useMessage()

const handleCheckIn = async () => {
    if (isCheckedIn.value) return
    try {
        const { code, data } = await userApi.checkin()
        if (code === 200) {
            stats.value.streak.value = data
            isCheckedIn.value = true
            message.success(t('dashboard.checkInSuccess'))
        } else {
            message.error(t('dashboard.checkInFail'))
        }
    } catch (e) {
        console.error("Checkin failed", e)
    }
}

const fetchDashboardStats = async () => {
    fetchUserData() // Load user stats
    fetchLeaderboard() // Load leaderboard
    try {
        const { code, data } = await learningApi.getStatistics() 
        if (code === 200 && data) {
            // ... (rest of the logic remains)
            const overall = data.overall || {}
            const byType = data.byType || [] 
            
            const weeklyStats = data.weeklyStats || []
            const trendStats = data.trendStats || []

            // Top Cards
            // Vocab
            const vocabStats = byType.find(t => t.content_type === 'vocabulary')
            const vocabCount = vocabStats ? vocabStats.count : 0
            stats.value.vocab.value = (vocabCount > 1000 ? (vocabCount/1000).toFixed(1) + 'k' : vocabCount)
            
            const growthVocab = data.growthVocab || 0
            stats.value.vocab.change = (growthVocab >= 0 ? '+' : '') + growthVocab

            // Time
            const totalSeconds = overall.totalTimeSpent || 0
            const totalHours = (totalSeconds / 3600).toFixed(1)
            stats.value.time.value = totalHours + 'h'
            
            const growthTimeSeconds = data.growthTime || 0
            let timeChangeText = ''
            if (growthTimeSeconds < 3600) {
                 timeChangeText = '+' + (growthTimeSeconds / 60).toFixed(0) + 'm'
            } else {
                 timeChangeText = '+' + (growthTimeSeconds / 3600).toFixed(1) + 'h'
            }
            stats.value.time.change = timeChangeText

            // Initial Chart Render
            updateBarChart(weeklyStats)
            updateLineChart(trendStats)
        }
    } catch (e) {
        console.error("Failed to fetch statistics", e)
    }
}

const fetchChartData = async () => {
    try {
        const days = chartRange.value
        const { code, data } = await learningApi.getTrends(days)
        if (code === 200 && data) {
            updateBarChart(data.weeklyStats || [])
            updateLineChart(data.trendStats || [])
        }
    } catch (e) {
        console.error("Failed to fetch chart data", e)
    }
}

const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr)
    const days = tm('dashboard.weekdays')
    // If range is 30, use MM-DD
    // If range is 7, use Weekday
    // We can infer context or pass param.
    // Simple heuristic: check current range ref? But function is generic.
    // Let's formatting based on context or just return smart label.
    // actually, for 7 days, weekday is good. for 30, date is better.
    return date.getMonth()+1 + '-' + date.getDate() // MM-DD default
}

const getWeekday = (dateStr) => {
    const date = new Date(dateStr)
    const days = tm('dashboard.weekdays')
    return days[date.getDay()]
}

const getLocalYMD = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const updateBarChart = (dataList) => {
    if (!barChartInstance) return
    
    let labels = []
    let values = []
    
    const count = chartRange.value
    
    const dataMap = {}
    if (dataList && dataList.length > 0) {
        dataList.forEach(d => {
             // 假设后端返回 yyyy-MM-dd 格式
             // 如果是完整时间戳，则 new Date(d.date) 解析
             // 为了稳妥，直接取 create_time 的日期部分或者直接使用 date 字段
             let dateKey = '';
             if (d.date && d.date.length >= 10) {
                 dateKey = d.date.substring(0, 10);
             } else {
                 dateKey = getLocalYMD(new Date(d.date));
             }
             dataMap[dateKey] = d.timeSpent
        })
    }

    const today = new Date()
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        // 使用本地日期字符串作为 Key
        const dateStr = getLocalYMD(d)
        
        labels.push(count === 7 ? getWeekday(dateStr) : formatDateLabel(dateStr))
        
        const val = dataMap[dateStr] || 0
        values.push((val / 60).toFixed(0))
    }

    barChartInstance.setOption({
        xAxis: { data: labels },
        series: [{ data: values }]
    })
}

const updateLineChart = (dataList) => {
    if (!lineChartInstance) return
    
    let labels = []
    let values = []
    const count = chartRange.value
    
    const dataMap = {}
    if (dataList && dataList.length > 0) {
        dataList.forEach(d => {
             let dateKey = '';
             if (d.date && d.date.length >= 10) {
                 dateKey = d.date.substring(0, 10);
             } else {
                 dateKey = getLocalYMD(new Date(d.date));
             }
             dataMap[dateKey] = d.accuracy
        })
    }
    
    const today = new Date()
    for (let i = count - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(today.getDate() - i)
        const dateStr = getLocalYMD(d)
        
        labels.push(count === 7 ? getWeekday(dateStr) : formatDateLabel(dateStr))
        
        const val = dataMap[dateStr] || 0
        values.push(parseFloat(val).toFixed(1))
    }

    lineChartInstance.setOption({
        xAxis: { data: labels },
        series: [{ data: values }]
    })
}

const initCharts = () => {
    // Bar Chart
    if (barChartRef.value) {
        barChartInstance = echarts.init(barChartRef.value)
        barChartInstance.setOption({
            backgroundColor: 'transparent',
            grid: { top: 30, right: 20, bottom: 20, left: 30, containLabel: true },
            tooltip: { 
                trigger: 'axis',
                formatter: '{b}: {c} ' + t('dashboard.learningTime')
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#71717a' }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: { show: false }
            },
            series: [{
                type: 'bar',
                barWidth: '30%',
                data: [],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#6366f1' },
                        { offset: 1, color: 'rgba(99, 102, 241, 0.1)' }
                    ]),
                    borderRadius: [4, 4, 0, 0]
                }
            }]
        })
    }

    // Line Chart
    if (lineChartRef.value) {
        lineChartInstance = echarts.init(lineChartRef.value)
        lineChartInstance.setOption({
            backgroundColor: 'transparent',
            grid: { top: 30, right: 20, bottom: 20, left: 30, containLabel: true },
            tooltip: { 
                trigger: 'axis',
                formatter: '{b}: {c}%'
            },
            xAxis: {
                type: 'category',
                data: [],
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#71717a' }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: { color: '#71717a' },
                max: 100
            },
            series: [{
                type: 'line',
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 4, color: '#10b981' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0)' }
                    ])
                },
                data: []
            }]
        })
    }
}

// ... existing fetchRecentActivity and helpers ...
const fetchRecentActivity = async () => {
    try {
        const { code, data } = await learningApi.getRecords({ page: 1, pageSize: 5 })
        if (code === 200 && data && data.records) {
            recentActivity.value = data.records.map(record => ({
                type: record.contentType,
                title: formatRecordTitle(record),
                score: record.score != null ? record.score + '' : (record.isCorrect ? 'Correct' : 'Incorrect'),
                time: simplifyTime(record.createTime)
            }))
        }
    } catch (e) {
        console.error("Failed to fetch records", e)
    }
}
const formatRecordTitle = (r) => { /* Same as before or simplified */ 
    const map = { 
        'vocabulary': t('dashboard.activityVocab'), 
        'grammar': t('dashboard.activityGrammar'), 
        'reading': t('dashboard.activityReading'), 
        'listening': t('dashboard.activityListening'), 
        'exam': t('dashboard.activityExam') 
    }
    return map[r.contentType] || t('dashboard.activityNormal')
}
const simplifyTime = (isoStr) => { /* Same as before */ 
    if(!isoStr) return ''
    const date = new Date(isoStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return diffMins + t('dashboard.minutesAgo')
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return diffHours + t('dashboard.hoursAgo')
    return Math.floor(diffHours / 24) + t('dashboard.daysAgo')
}
const handleActivityClick = (type) => {
  const map = {
    'vocab': '/vocabulary',
    'vocabulary': '/vocabulary',
    'grammar': '/grammar',
    'reading': '/reading',
    'listening': '/listening',
    'exam': '/mock-exam'
  }
  const path = map[type] || '/dashboard' // Default stay or handled elsewhere
  router.push(path)
}
const handleStatClick = (label) => { router.push('/analysis') } // simplified

let timer = null

onMounted(async () => {
  timer = setInterval(() => { aiStep.value = (aiStep.value + 1) % 3 }, 3000)

  // Load AI Recommendations in background
  try {
    aiRecLoading.value = true
    const res = await recommendationApi.getPersonalized(1)
    if (res.code === 200 && res.data && res.data.length > 0) {
      recData.value = res.data[0]
    }
    
    // 获取 AI 智能分析推荐
    const aiRes = await recommendationApi.getAIRecommendations()
    if (aiRes.code === 200 && aiRes.data && aiRes.data.length > 0) {
      aiRecommendations.value = aiRes.data
    } else {
      aiRecommendations.value = []
    }
  } catch (e) {
    console.error('Failed to fetch recommendations', e)
    aiRecommendations.value = [
      { title: t('dashboard.activityNormal'), content: t('dashboard.aiFallbackContent'), action: t('dashboard.aiFallbackAction'), path: '/daily-tasks' }
    ]
  } finally {
    aiRecLoading.value = false
  }

  nextTick(() => {
    initCharts()
    
    // Fetch data after charts are initialized
    fetchDashboardStats()
    fetchRecentActivity()
    
    // GSAP Entrance Animations with safer configuration
    const tl = gsap.timeline({ 
      defaults: { 
        ease: 'power2.out', 
        duration: 0.6,
        clearProps: 'all' // Clear inline styles after animation completes
      } 
    })
    
    // Use autoAlpha instead of opacity for safer visibility control
    tl.from('.welcome-banner', { autoAlpha: 0, y: 20 })
      .from('.ai-feature-card', { autoAlpha: 0, y: 15 }, '-=0.3')
      .from('.dashboard-stat-card', { 
        autoAlpha: 0,
        y: 15,
        stagger: 0.08
      }, '-=0.3')
      .from('.chart-card', { 
        autoAlpha: 0,
        y: 15,
        stagger: 0.1 
      }, '-=0.2')
      
    // Resize charts after animation completes
    setTimeout(() => {
        handleResize()
    }, 800)
  })
  
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
    barChartInstance && barChartInstance.resize()
    lineChartInstance && lineChartInstance.resize()
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  window.removeEventListener('resize', handleResize)
  barChartInstance && barChartInstance.dispose()
  lineChartInstance && lineChartInstance.dispose()
})
</script>

<template>
  <div class="dashboard-container">
    <div v-if="systemStore.configs['sys.announcement']" class="announcement-bar mb-6">
      <div class="flex items-center gap-3">
        <n-icon :component="Bell" color="#f59e0b" :size="20" class="animate-pulse" />
        <div class="announcement-content text-sm" v-html="systemStore.configs['sys.announcement']"></div>
      </div>
    </div>

    <div 
      class="welcome-banner mb-6 flex justify-between items-center flex-wrap gap-4"
      @mousemove="handleMouseMove"
      :style="{ transform: bannerTransform }"
    >
      <div class="flex items-center gap-6">
        <div class="level-badge-container">
          <div class="level-ring shadow-glow-indigo"></div>
          <span class="level-num">{{ userLevel }}</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="m-0 text-white">{{ t('dashboard.welcome', { name: userInfo?.nickname || t('dashboard.learner') }) }}</h2>
            <n-tag v-if="userStore.isVip()" type="success" size="small" round ghost :color="{ textColor: '#fcd34d', borderColor: '#fcd34d' }">
              {{ userStore.getVipLabel() }}
            </n-tag>
          </div>
          <p class="mt-1 opacity-80 text-white/90">{{ t('dashboard.welcomeSub') }}</p>
          <div class="xp-progress-bar mt-3">
             <div class="flex justify-between text-xs mb-1 text-white/70">
                <span>LV.{{ userLevel }}</span>
                <span>{{ userInfo?.points || 0 }} / {{ nextLevelXP }} XP</span>
             </div>
             <n-progress
                type="line"
                :percentage="xpProgress"
                :show-indicator="false"
                color="#fff"
                rail-color="rgba(255, 255, 255, 0.2)"
                :height="6"
                :border-radius="3"
             />
          </div>
        </div>
      </div>
      <n-button 
        :type="isCheckedIn ? 'success' : 'warning'" 
        secondary 
        round 
        size="large"
        @click="handleCheckIn"
        :disabled="isCheckedIn"
        class="checkin-btn-glass"
      >
        <template #icon>
          <n-icon :component="isCheckedIn ? Check : Award" />
        </template>
        {{ isCheckedIn ? t('dashboard.checkedIn') : t('dashboard.checkIn') }}
      </n-button>
    </div>

    <n-grid x-gap="24" y-gap="24" cols="1 900:3" responsive="screen">
      <!-- Main Dashboard Column (2/3 width) -->
      <n-grid-item span="2">
        <div class="dashboard-main flex flex-col gap-6">
          
          <!-- AI Recommendation Engine -->
           <n-card class="ai-feature-card" content-style="padding: 0;" :bordered="false">
            <div class="ai-feature-row">
                <!-- Neural Scan Animation Background -->
                <div class="neural-pulse-bg">
                    <div class="pulse-ring ring-1"></div>
                    <div class="pulse-ring ring-2"></div>
                    <div class="pulse-ring ring-3"></div>
                </div>
                
                <div class="feature-content p-6 z-10">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="ai-icon-pulse">
                          <n-icon :component="Zap" :size="32" color="#6366f1" />
                        </div>
                        <div>
                          <h3 class="m-0 text-xl font-bold text-white">{{ t('dashboard.aiInsight') }}</h3>
                          <div class="scanning-text text-xs text-indigo-400 font-mono">{{ t('dashboard.aiAnalyzing') }}</div>
                        </div>
                    </div>
                    <p class="text-gray-400 mb-6 text-sm">{{ t('dashboard.aiDesc') }}</p>
                    <div class="ai-features-list">
                        <template v-if="aiRecLoading">
                            <div v-for="i in 2" :key="i" class="premium-rec-item skeleton">
                                <div class="rec-icon skeleton-element"></div>
                                <div class="flex-1">
                                    <div class="skeleton-title mb-2"></div>
                                    <div class="skeleton-text"></div>
                                </div>
                            </div>
                        </template>
                        <template v-else-if="aiRecommendations && aiRecommendations.length > 0">
                            <div v-for="(item, index) in aiRecommendations" :key="index" class="premium-rec-item" @click="router.push(item.path)">
                                <div class="rec-icon">
                                    <n-icon :component="TrendingUp" color="#6366f1" size="20" />
                                </div>
                                <div class="flex-1">
                                    <div class="rec-title">{{ item.title }}</div>
                                    <div class="rec-desc">{{ item.content }}</div>
                                </div>
                                <div class="rec-action">{{ item.action }} <n-icon :component="Check" /></div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="empty-ai-state">
                                <div class="p-4 text-center border-dashed border-1 border-white/10 rounded-2xl bg-white/2">
                                    <p class="text-zinc-500 text-sm m-0">{{ t('dashboard.aiEmpty') }}</p>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
          </n-card>

          <!-- Top Stats Row -->
          <n-grid x-gap="16" y-gap="16" cols="2 600:3">
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-orange">
                <div class="stat-label">{{ t('dashboard.streak') }}</div>
                <div class="stat-value">
                   {{ stats.streak.value }} 
                   <span class="stat-change info">{{ t('dashboard.days') }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-blue">
                <div class="stat-label">{{ t('dashboard.learningTime') }}</div>
                <div class="stat-value">
                   {{ stats.time.value }} 
                   <span class="stat-change success">{{ stats.time.change }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-purple">
                <div class="stat-label">{{ t('dashboard.vocabCoverage') }}</div>
                <div class="stat-value">
                   {{ stats.vocab.value }} 
                   <span class="stat-change success">{{ stats.vocab.change }}</span>
                </div>
              </div>
            </n-grid-item>
          </n-grid>

          <!-- Bar Chart Section -->
          <div class="chart-card">
             <div class="chart-header flex justify-between items-center">
                 <span>{{ t('dashboard.timeDistribution') }}</span>
                 <div class="chart-actions">
                     <n-radio-group v-model:value="chartRange" size="small" @update:value="fetchChartData">
                        <n-radio-button :value="7" :label="t('dashboard.7days')" />
                        <n-radio-button :value="30" :label="t('dashboard.30days')" />
                    </n-radio-group>
                 </div>
             </div>
             <div class="chart-body" ref="barChartRef"></div>
          </div>

          <!-- Line Chart Section -->
          <div class="chart-card">
             <div class="chart-header flex justify-between items-center">
                 <div class="flex items-center gap-2">
                    <n-icon :component="TrendingUp" color="#10b981" /> {{ t('dashboard.accuracyTrend') }}
                 </div>
                 <!-- Removed redundant toggle -->
             </div>
             <div class="chart-body" ref="lineChartRef"></div>
          </div>

        </div>
      </n-grid-item>

      <!-- Right Column: Activity (1/3 width) -->
      <n-grid-item>
        <!-- Leaderboard -->
        <n-card :title="t('dashboard.leaderboard')" class="mb-6 chart-card" :bordered="false">
          <n-list>
            <n-list-item v-for="(user, index) in leaderboard" :key="user.id">
              <template #prefix>
                 <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              </template>
              <div class="leaderboard-user">
                  <div class="user-avatar-small">{{ user.nickname?.charAt(0) }}</div>
                  <div class="user-info">
                      <div class="user-name">{{ user.nickname }}</div>
                      <div class="user-points flex items-center">
                          <n-icon :component="Zap" size="12" color="#eab308" class="mr-1"/>
                          <span>{{ user.points || 0 }} {{ t('dashboard.xp') }}</span>
                      </div>
                  </div>
              </div>
            </n-list-item>
          </n-list>
        </n-card>

         <n-card :title="t('dashboard.recentActivity')" class="h-full chart-card" :bordered="false">
          <n-list>
            <n-list-item v-for="(item, index) in recentActivity" :key="index" class="cursor-pointer hover:bg-white/5" @click="handleActivityClick(item.type)">
              <template #prefix>
                 <div class="activity-icon bg-primary-soft">
                   <n-icon :component="item.type === 'vocab' ? Book : item.type === 'exam' ? Award : Activity" />
                 </div>
              </template>
              <div class="activity-content">
                <div class="activity-title">{{ item.title }}</div>
                <div class="activity-meta">
                  <n-tag size="small" :type="item.score.includes('9') ? 'success' : 'info'" round>{{ item.score }}</n-tag>
                  <span class="time">{{ item.time }}</span>
                </div>
              </div>
            </n-list-item>
          </n-list>
          <div class="mt-4 text-center">
             <n-button secondary type="primary" size="small" @click="router.push('/answer-history')">{{ t('dashboard.viewHistory') }}</n-button>
          </div>
        </n-card>
      </n-grid-item>

    </n-grid>
  </div>
</template>

<style scoped>
/* Previous Styles */
.dashboard-container { max-width: 1400px; margin: 0 auto; }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.mt-6 { margin-top: 24px; }
.mt-4 { margin-top: 16px; }
.p-6 { padding: 24px; }
.gap-6 { gap: 24px; }
.gap-3 { gap: 12px; }
.gap-2 { gap: 8px; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.font-bold { font-weight: 700; }
.text-xl { font-size: 1.25rem; }
.text-gray-400 { color: var(--secondary-text); }
.m-0 { margin: 0; }

@media (max-width: 768px) {
  .welcome-banner {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }
}

.announcement-bar {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 16px;
  padding: 12px 20px;
  backdrop-filter: blur(10px);
}

.announcement-content :deep(p) { margin: 0; }
.announcement-content :deep(a) { color: #f59e0b; text-decoration: underline; }

.welcome-banner {
  background: linear-gradient(135deg, #4f46e5 0%, #a855f7 100%);
  padding: 32px;
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.2);
  transition: transform 0.1s ease-out;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.level-badge-container {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-ring {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rotate 3s linear infinite;
}

.level-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  z-index: 1;
}

.xp-progress-bar {
  width: 300px;
  max-width: 100%;
}

.checkin-btn-glass {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
  font-weight: 600;
}

.checkin-btn-glass:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-2px);
}

.dashboard-stat-card {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.dashboard-stat-card:hover { 
  transform: translateY(-5px) scale(1.02); 
  box-shadow: 0 20px 40px rgba(0,0,0,0.3); 
  border-color: rgba(99, 102, 241, 0.4); 
}

.stat-label { 
  font-size: 0.85rem; 
  color: var(--secondary-text); 
  margin-bottom: 8px; 
  text-transform: uppercase; 
  letter-spacing: 1px; 
}

.stat-value { 
  font-size: 2.25rem; 
  font-weight: 800; 
  color: var(--text-color); 
  display: flex; 
  align-items: baseline; 
  gap: 8px; 
}

.stat-change { font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: 6px; }
.stat-change.success { color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.2); }

/* Charts */
.chart-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 20px;
}

/* 强制覆盖 NCard 内部样式 */
.chart-card :deep(.n-card) {
  background-color: var(--card-bg) !important;
  border-color: var(--card-border) !important;
}

.chart-card :deep(.n-card__content) {
  background-color: transparent !important;
}

.chart-header {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 16px;
    min-height: 32px;
}

.chart-body { width: 100%; height: 250px; }
.chart-actions { display: flex; gap: 8px; }

/* Activity */
.activity-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.bg-primary-soft { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
.activity-title { font-weight: 500; margin-bottom: 4px; color: var(--text-color); }
.activity-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.time { font-size: 0.75rem; color: var(--secondary-text); }

/* AI Feature Card */
.ai-feature-card {
  border-radius: 24px;
  background: rgba(0,0,0,0.85); /* Dark background for AI card even in light mode for contrast with glowing effects, or adapt? */
  /* Let's keep AI card dark-themed for "tech" feel or adapt. The prompt implies full adaptation. */
  /* Let's try to adapt it but keep the gradient vibe. */
  background: #111115; /* Keep dark for now as it has complex glow effects designed for dark */
  border: 1px solid rgba(99, 102, 241, 0.2);
  position: relative;
  overflow: hidden;
}

.neural-pulse-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.4;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

.ring-1 { width: 200px; height: 200px; animation: pulse-expand 4s infinite; }
.ring-2 { width: 400px; height: 400px; animation: pulse-expand 4s infinite 1s; }
.ring-3 { width: 600px; height: 600px; animation: pulse-expand 4s infinite 2s; }

@keyframes pulse-expand {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.ai-icon-pulse {
  position: relative;
  animation: float-slow 3s ease-in-out infinite;
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.scanning-text {
  letter-spacing: 2px;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.premium-rec-item {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.premium-rec-item:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
  transform: scale(1.02);
}

.rec-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rec-title { font-weight: 700; color: #fff; font-size: 0.95rem; }
.rec-desc { font-size: 0.8rem; color: #cbd5e1; margin-top: 2px; }
.rec-action { font-size: 0.8rem; font-weight: 600; color: #6366f1; display: flex; align-items: center; gap: 4px; }

.ai-features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Skeleton Styles */
.skeleton {
  cursor: default !important;
  pointer-events: none;
}
.skeleton-element { background: rgba(255, 255, 255, 0.05); overflow: hidden; position: relative; }
.skeleton-title { width: 40%; height: 18px; background: rgba(255, 255, 255, 0.05); border-radius: 4px; position: relative; overflow: hidden; }
.skeleton-text { width: 80%; height: 14px; background: rgba(255, 255, 255, 0.03); border-radius: 4px; position: relative; overflow: hidden; }

.skeleton-element::after, .skeleton-title::after, .skeleton-text::after {
  content: "";
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.ai-feature-row { display: flex; min-height: 280px; position: relative; }
.feature-content { flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; }
@media (max-width: 768px) { 
    .dashboard-container { padding: 12px; }
    
    /* Welcome Banner Mobile Optimization */
    .welcome-banner { 
        padding: 24px 20px; 
        border-radius: 20px;
        flex-direction: column;
        align-items: center; /* Center align everything */
        text-align: center;
        gap: 20px;
    }

    /* Inner Wrapper: Badge + Text */
    .welcome-banner > div:first-child {
        flex-direction: column;
        width: 100%;
        gap: 16px;
    }

    /* Badge centering */
    .level-badge-container {
        margin: 0 auto;
        transform: scale(1.1); /* Slightly larger on mobile for visual focus */
    }

    /* Greeting Text Row centering */
    .welcome-banner > div:first-child > div:last-child > div:first-child {
        justify-content: center;
        flex-wrap: wrap;
    }

    .welcome-banner h2 { 
        font-size: 1.4rem; 
        margin-bottom: 4px; 
        text-align: center;
    }
    
    .welcome-banner p { 
        font-size: 0.95rem; 
        opacity: 0.9;
        margin-bottom: 12px;
    }
    
    /* Progress bar full width */
    .xp-progress-bar {
        width: 100%;
        margin: 0 auto;
    }

    .checkin-btn-glass { 
        width: 100%; 
        justify-content: center; 
        height: 48px;
        font-size: 1rem;
    }
    
    .ai-feature-row { flex-direction: column; min-height: auto; padding-bottom: 24px; }
    .feature-content { padding: 20px; text-align: center; }
    .ai-features-list { align-items: stretch; }
    .premium-rec-item { text-align: left; }
    
    /* Center AI header on mobile */
    .ai-feature-card .flex.items-center.gap-3 {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .n-grid { display: flex; flex-direction: column; gap: 16px !important; }
    .n-grid-item { width: 100% !important; }
    
    /* Force stats to be grid 2 cols */
    .dashboard-main .n-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px !important;
    }
    /* Let the 3rd stat take full width or fit in graph */
    .dashboard-main .n-grid > .n-grid-item:last-child {
        grid-column: span 2;
    }
    
    .stat-value { font-size: 1.25rem; }
    .welcome-banner h2 { font-size: 1.2rem; }
}

/* Toggle Override */
:deep(.n-radio-button.n-radio-button--checked) {
    --n-button-color-active: #6366f1;
    --n-button-text-color-active: white;
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
.card-gradient-orange::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.1), transparent 70%); pointer-events: none; }
.stat-change.info { color: #f97316; background: rgba(249, 115, 22, 0.1); }

@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.stats-card-bg {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 20px !important;
  backdrop-filter: blur(10px);
}

/* 强制覆盖 NCard 内部样式 */
.stats-card-bg :deep(.n-card) {
  background-color: var(--card-bg) !important;
  border-color: var(--card-border) !important;
}

.stats-card-bg :deep(.n-card__content) {
  background-color: transparent !important;
}

.stats-card-bg :deep(.n-card-header) {
  background-color: transparent !important;
}

.stats-card-bg :deep(.n-card-header__main) {
  color: var(--text-color) !important;
}

.rank-badge {
    width: 28px; height: 28px; border-radius: 50%; background: #3f3f46; color: #a1a1aa;
    display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800;
}
.rank-1 { background: linear-gradient(135deg, #fcd34d, #f59e0b); color: #78350f; box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4); }
.rank-2 { background: linear-gradient(135deg, #e5e7eb, #9ca3af); color: #374151; }
.rank-3 { background: linear-gradient(135deg, #fdba74, #fb923c); color: #7c2d12; }

.leaderboard-user { display: flex; align-items: center; gap: 12px; }
.user-avatar-small {
    width: 32px; height: 32px; border-radius: 50%; background: #6366f1; color: white;
    display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.9rem;
}
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 0.9rem; color: #18181b; font-weight: 500; }
.user-name { color: var(--text-color); }
.user-points { font-size: 0.8rem; color: #fbbf24; font-weight: 600; }
.mr-1 { margin-right: 4px; }
</style>
