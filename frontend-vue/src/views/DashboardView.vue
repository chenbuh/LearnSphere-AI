<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { NGrid, NGridItem, NCard, NStatistic, NProgress, NButton, NIcon, NList, NListItem, NTag, NSpace, NRadioGroup, NRadioButton } from 'naive-ui'
import { Activity, Clock, Award, Target, TrendingUp, Book, Check } from 'lucide-vue-next'
import * as echarts from 'echarts'

import { userApi } from '../api/user'
import { recommendationApi } from '../api/recommendation'
import { learningApi } from '../api/learning'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

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

const barChartRef = ref(null)
const lineChartRef = ref(null)
let barChartInstance = null
let lineChartInstance = null

const timeRange = ref(7)
const trendRange = ref(7)

const fetchUserData = async () => {
    try {
        const { code, data } = await userApi.getUserInfo()
        if (code === 200 && data) {
            userInfo.value = data
            stats.value.streak.value = data.realConsecutiveDays || 0
            
            // Check if checked in today
            const lastDate = data.lastCheckinDate
            const today = new Date().toISOString().split('T')[0]
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

const handleCheckIn = async () => {
    if (isCheckedIn.value) return
    try {
        const { code, data } = await userApi.checkin()
        if (code === 200) {
            stats.value.streak.value = data
            isCheckedIn.value = true
            window.$message.success('打卡成功！坚持就是胜利！')
        } else {
            window.$message.error('打卡失败')
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

const fetchChartData = async (type) => {
    try {
        const days = type === 'time' ? timeRange.value : trendRange.value
        const { code, data } = await learningApi.getTrends(days)
        if (code === 200 && data) {
            if (type === 'time') {
                updateBarChart(data.weeklyStats || [])
            } else {
                updateLineChart(data.trendStats || [])
            }
        }
    } catch (e) {
        console.error("Failed to fetch chart data", e)
    }
}

const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
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
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
}

const updateBarChart = (dataList) => {
    if (!barChartInstance) return
    
    let labels = []
    let values = []
    
    const count = timeRange.value
    
    if (dataList && dataList.length > 0) {
        // Sort
        dataList.sort((a,b) => new Date(a.date) - new Date(b.date))
        // We need to fill in missing days maybe? prefer showing what we have or mock.
        // If data exists but gaps? 
        // For simple robust display:
        dataList.forEach(d => {
            labels.push(count === 7 ? getWeekday(d.date) : formatDateLabel(d.date))
            values.push((d.timeSpent / 60).toFixed(0)) 
        })
    } else {
        // Fallback Mock Data if empty
        const today = new Date()
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dateStr = d.toISOString()
            labels.push(count === 7 ? getWeekday(dateStr) : formatDateLabel(dateStr))
            // Mock values: random between 10 and 60 mins
            values.push(Math.floor(Math.random() * 50) + 10) 
        }
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
    const count = trendRange.value
    
    if (dataList && dataList.length > 0) {
        dataList.sort((a,b) => new Date(a.date) - new Date(b.date))
        dataList.forEach(d => {
            labels.push(count === 7 ? getWeekday(d.date) : formatDateLabel(d.date))
            values.push(d.accuracy ? parseFloat(d.accuracy).toFixed(1) : 0)
        })
    } else {
        // Fallback Mock Data
        const today = new Date()
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dateStr = d.toISOString()
            labels.push(count === 7 ? getWeekday(dateStr) : formatDateLabel(dateStr))
            // Mock values: ascending trend 60 -> 90
            const base = 60 + (30 * (1 - i/count))
            values.push((base + Math.random() * 10 - 5).toFixed(1))
        }
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
                formatter: '{b}: {c} 分钟'
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
    const map = { 'vocabulary': '单词强化', 'grammar': '语法练习', 'reading': '阅读理解', 'listening': '听力训练', 'exam': '模拟考试' }
    return map[r.contentType] || '日常练习'
}
const simplifyTime = (isoStr) => { /* Same as before */ 
    if(!isoStr) return ''
    const date = new Date(isoStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return diffMins + '分钟前'
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return diffHours + '小时前'
    return Math.floor(diffHours / 24) + '天前'
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
  
  await fetchDashboardStats()
  fetchRecentActivity()
  
  try {
    const res = await recommendationApi.getPersonalized(1)
    if (res.code === 200 && res.data && res.data.length > 0) {
      recData.value = res.data[0]
    }
    
    // 获取 AI 智能分析推荐
    const aiRes = await recommendationApi.getAIRecommendations()
    if (aiRes.code === 200 && aiRes.data) {
      aiRecommendations.value = aiRes.data
    }
  } catch (e) {
    console.error('Failed to fetch recommendations', e)
  }

  nextTick(() => {
    initCharts()
    // Trigger update again to fill charts if data was loaded and charts weren't ready
    fetchDashboardStats()
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
    <div class="welcome-banner mb-6 flex justify-between items-center">
      <div>
        <h2>你好, {{ userInfo?.nickname || '学习者' }}! 👋</h2>
        <p>准备好开始今天的学习了吗？AI 助手建议您先进行一轮词汇复习。</p>
      </div>
      <n-button 
        :type="isCheckedIn ? 'success' : 'warning'" 
        secondary 
        round 
        size="large"
        @click="handleCheckIn"
        :disabled="isCheckedIn"
      >
        <template #icon>
          <n-icon :component="isCheckedIn ? Check : Award" />
        </template>
        {{ isCheckedIn ? '已打卡' : '立即打卡' }}
      </n-button>
    </div>

    <n-grid x-gap="24" y-gap="24" cols="1 1000:3" responsive="screen">
      <!-- Main Dashboard Column (2/3 width) -->
      <n-grid-item span="2">
        <div class="dashboard-main flex flex-col gap-6">
          
          <!-- AI Recommendation Engine -->
           <n-card class="ai-feature-card" content-style="padding: 0;">
            <div class="ai-feature-row">
                <div class="feature-content p-6">
                    <div class="flex items-center gap-3 mb-4">
                       <div class="feature-icon-box">
                          <n-icon :component="Target" :size="24" color="#6366f1" />
                      </div>
                      <h3 class="m-0 text-xl font-bold">AI 智能推荐</h3>
                    </div>
                    <p class="text-gray-400 mb-6">基于您的学习数据，系统为您实时生成的个性化提升方案。</p>
                    <div class="ai-features-list">
                        <template v-if="aiRecommendations && aiRecommendations.length > 0">
                            <div v-for="(item, index) in aiRecommendations" :key="index" class="ai-feature-item cursor-pointer hover:opacity-80" @click="router.push(item.path)">
                                <n-icon :component="Check" color="#6366f1" size="18" />
                                <div class="flex-1">
                                    <div class="font-bold text-sm">{{ item.title }}: {{ item.content }}</div>
                                    <div class="text-xs text-indigo-300">{{ item.action }} →</div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="ai-feature-item">
                                <n-icon :component="Check" color="#6366f1" size="18" />
                                <span>发现薄弱点: {{ recData ? '词汇 · ' + recData.word : '核心词汇巩固' }}</span>
                            </div>
                            <div class="ai-feature-item">
                                <n-icon :component="Check" color="#6366f1" size="18" />
                                <span>推荐练习: {{ recData ? '单词强化 (' + recData.translation + ')' : '专项突击' }}</span>
                            </div>
                        </template>
                    </div>
                    <n-button type="primary" class="mt-6 w-full" color="#6366f1" @click="router.push(aiRecommendations.length > 0 ? aiRecommendations[0].path : '/vocabulary')">
                      {{ aiRecommendations.length > 0 ? '前往第一项练习' : '立即开始推荐练习' }}
                    </n-button>
                </div>
            </div>
          </n-card>

          <!-- Top Stats Row -->
          <n-grid x-gap="16" y-gap="16" cols="1 600:3">
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-orange">
                <div class="stat-label">连续打卡</div>
                <div class="stat-value">
                   {{ stats.streak.value }} 
                   <span class="stat-change info">天</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-blue">
                <div class="stat-label">总学习时长</div>
                <div class="stat-value">
                   {{ stats.time.value }} 
                   <span class="stat-change success">{{ stats.time.change }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-purple">
                <div class="stat-label">词汇量覆盖</div>
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
                 <span>学习时长分布</span>
                 <div class="chart-actions">
                     <n-radio-group v-model:value="timeRange" size="small" @update:value="fetchChartData('time')">
                        <n-radio-button :value="7" label="7天" />
                        <n-radio-button :value="30" label="30天" />
                    </n-radio-group>
                 </div>
             </div>
             <div class="chart-body" ref="barChartRef"></div>
          </div>

          <!-- Line Chart Section -->
          <div class="chart-card">
             <div class="chart-header flex justify-between items-center">
                 <div class="flex items-center gap-2">
                    <n-icon :component="TrendingUp" color="#10b981" /> 正确率趋势
                 </div>
                 <div class="chart-actions">
                     <n-radio-group v-model:value="trendRange" size="small" @update:value="fetchChartData('trend')">
                        <n-radio-button :value="7" label="7天" />
                        <n-radio-button :value="30" label="30天" />
                    </n-radio-group>
                 </div>
             </div>
             <div class="chart-body" ref="lineChartRef"></div>
          </div>

        </div>
      </n-grid-item>

      <!-- Right Column: Activity (1/3 width) -->
      <n-grid-item>
        <!-- Leaderboard -->
        <n-card title="学习排行榜" class="mb-6 stats-card-bg">
          <n-list>
            <n-list-item v-for="(user, index) in leaderboard" :key="user.id">
              <template #prefix>
                 <div class="rank-badge" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              </template>
              <div class="leaderboard-user">
                  <div class="user-avatar-small">{{ user.nickname?.charAt(0) }}</div>
                  <div class="user-info">
                      <div class="user-name">{{ user.nickname }}</div>
                      <div class="user-days">坚持 {{ user.totalDays }} 天</div>
                  </div>
              </div>
            </n-list-item>
          </n-list>
        </n-card>

         <n-card title="最近活动" class="h-full stats-card-bg">
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
             <n-button secondary type="primary" size="small" @click="router.push('/analysis')">查看所有历史</n-button>
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
.text-gray-400 { color: #a1a1aa; }
.m-0 { margin: 0; }

.welcome-banner {
  background: linear-gradient(to right, #6366f1, #a855f7);
  padding: 24px;
  border-radius: 16px;
  color: white;
}
.welcome-banner h2 { margin: 0 0 8px; font-size: 1.5rem; }
.welcome-banner p { margin: 0; opacity: 0.9; }

.dashboard-stat-card {
    background: rgba(30, 30, 35, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
}
.dashboard-stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-color: rgba(99, 102, 241, 0.3); }
.card-gradient-blue::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 70%); pointer-events: none; }
.card-gradient-purple::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(168, 85, 247, 0.1), transparent 70%); pointer-events: none; }
.stat-label { font-size: 0.9rem; color: #a1a1aa; margin-bottom: 8px; }
.stat-value { font-size: 2rem; font-weight: 700; color: #fff; display: flex; align-items: baseline; gap: 8px; }
.stat-change { font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); }
.stat-change.success { color: #10b981; background: rgba(16, 185, 129, 0.1); }

/* Charts */
.chart-card { background: rgba(20, 20, 25, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; }
.chart-header { font-size: 1rem; font-weight: 600; color: #d4d4d8; margin-bottom: 16px; min-height: 32px; }
.chart-body { width: 100%; height: 250px; }
.chart-actions { display: flex; gap: 8px; }

/* Activity */
.activity-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.bg-primary-soft { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
.activity-title { font-weight: 500; margin-bottom: 4px; }
.activity-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.time { font-size: 0.75rem; color: #71717a; }

/* AI Demo */
.ai-features-list { display: flex; flex-direction: column; gap: 12px; }
.ai-feature-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #d4d4d8; }
.feature-icon-box { width: 40px; height: 40px; border-radius: 8px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; }
.ai-feature-row { display: flex; min-height: 320px; }
.feature-content { flex: 1; display: flex; flex-direction: column; justify-content: center; }
@media (max-width: 768px) { .ai-feature-row { flex-direction: column; } }

/* Toggle Override */
:deep(.n-radio-button.n-radio-button--checked) {
    --n-button-color-active: #6366f1;
    --n-button-text-color-active: white;
    background-color: #6366f1 !important;
    border-color: #6366f1 !important;
}
.card-gradient-orange::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.1), transparent 70%); pointer-events: none; }
.stat-change.info { color: #f97316; background: rgba(249, 115, 22, 0.1); }

/* Leaderboard */
.rank-badge {
    width: 24px; height: 24px; border-radius: 50%; background: #3f3f46; color: #a1a1aa;
    display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;
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
.user-name { font-size: 0.9rem; color: #e4e4e7; font-weight: 500; }
.user-days { font-size: 0.75rem; color: #71717a; }
</style>
