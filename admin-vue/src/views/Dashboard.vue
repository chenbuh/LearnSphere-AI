<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NCard, NSpin, NGrid, NGridItem, NStatistic, useMessage, 
  NProgress, NDivider, NNumberAnimation, NAvatar, NTag, NTimeline, NTimelineItem, NButton, NSpace
} from 'naive-ui'
import { 
  Users, BookOpen, TrendingUp, Activity, Cloud, Server, 
  Database, BarChart3, Filter, Wallet, UserPlus, Zap, 
  Clock, ShieldCheck, ChevronRight, Bell, RefreshCw, Download
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()
const router = useRouter()
const loading = ref(true)
const refreshing = ref(false)
const stats = ref({})
const contentStats = ref({})
const aiStats = ref({})
const funnelData = ref({})
const financeStats = ref({})
const retentionData = ref([])
const userGrowthData = ref([])
const recentLogs = ref([])
const lastUpdateTime = ref(new Date())

// Runtime clock
const currentTime = ref(new Date())
setInterval(() => {
  currentTime.value = new Date()
}, 1000)

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('zh-CN', { hour12: false })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '凌晨好，早起的鸟儿有虫吃'
  if (hour < 9) return '早上好，又是充满活力的一天'
  if (hour < 12) return '上午好，保持专注，提高效率'
  if (hour < 14) return '中午好，休息一下，劳逸结合'
  if (hour < 17) return '下午好，来杯咖啡，继续加油'
  if (hour < 19) return '傍晚好，落日余晖，甚是美丽'
  if (hour < 22) return '晚上好，整理心得，复盘今日'
  return '夜深了，注意休息，晚安'
})

const systemHealth = ref(100)
const activeUsersCount = ref(0)

// Charts
const userChartRef = ref(null)
const retentionChartRef = ref(null)
const funnelChartRef = ref(null)
const financeChartRef = ref(null)

let userChart = null
let retentionChart = null
let funnelChart = null
let financeChart = null

// 获取统计数据
const fetchAllStats = async (showLoading = true) => {
  if (showLoading) {
    loading.value = true
  } else {
    refreshing.value = true
  }
  
  try {
    const [statsRes, contentRes, aiRes, growthRes, funnelRes, financeRes, retentionRes, logsRes] = await Promise.all([
      adminApi.getStats(),
      adminApi.getContentStats(),
      adminApi.getAIStats(),
      adminApi.getUserGrowth(),
      adminApi.getUserFunnel(),
      adminApi.getFinanceStats(),
      adminApi.getRetentionData(),
      adminApi.getOperationLogs({ page: 1, size: 8 })
    ])
    
    stats.value = statsRes.data
    contentStats.value = contentRes.data
    aiStats.value = aiRes.data
    userGrowthData.value = growthRes.data
    funnelData.value = funnelRes.data
    financeStats.value = financeRes.data
    retentionData.value = retentionRes.data
    recentLogs.value = logsRes.data.records
    lastUpdateTime.value = new Date()
    
    renderCharts()
    
    if (!showLoading) {
      message.success('数据已刷新')
    }
  } catch (error) {
    message.error('获取系统概览数据失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 手动刷新
const handleRefresh = () => {
  fetchAllStats(false)
}

// 自动刷新定时器
let autoRefreshTimer = null

const startAutoRefresh = () => {
  autoRefreshTimer = setInterval(() => {
    fetchAllStats(false)
  }, 5 * 60 * 1000) // 每5分钟自动刷新
}

// 渲染图表
const renderCharts = () => {
  const commonAxisLabel = { color: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }
  const commonSplitLine = { lineStyle: { color: 'rgba(255, 255, 255, 0.05)', type: 'dashed' } }

  // 1. 用户增长趋势
  if (userChartRef.value) {
    if (userChart) userChart.dispose()
    userChart = echarts.init(userChartRef.value)
    userChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { 
          trigger: 'axis',
          backgroundColor: 'rgba(24, 24, 27, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          textStyle: { color: '#fff' }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: userGrowthData.value.map(item => item.date.slice(5)), axisLabel: commonAxisLabel },
        yAxis: { type: 'value', axisLabel: commonAxisLabel, splitLine: commonSplitLine },
        series: [{
          name: '新增用户',
          data: userGrowthData.value.map(item => item.count),
          type: 'line', smooth: true,
          symbolSize: 8,
          showSymbol: false,
          emphasis: { showSymbol: true },
          itemStyle: { color: '#6366f1' },
          lineStyle: { width: 4, color: '#6366f1' },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.4)' }, 
              { offset: 1, color: 'transparent' }
            ]) 
          }
        }]
    })
  }

  // 2. 留存曲线
  if (retentionChartRef.value) {
      if (retentionChart) retentionChart.dispose()
      retentionChart = echarts.init(retentionChartRef.value)
      retentionChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: { type: 'category', data: retentionData.value.map(item => item.day), axisLabel: commonAxisLabel },
          yAxis: { type: 'value', axisLabel: commonAxisLabel, splitLine: commonSplitLine },
          series: [{
              data: retentionData.value.map(item => item.rate),
              type: 'bar', barWidth: '40%',
              itemStyle: { 
                borderRadius: [6, 6, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#a855f7' },
                  { offset: 1, color: '#6366f1' }
                ])
              }
          }]
      })
  }

  // 3. 用户转化漏斗
  if (funnelChartRef.value) {
      if (funnelChart) funnelChart.dispose()
      funnelChart = echarts.init(funnelChartRef.value)
      funnelChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item' },
          series: [{
              name: '用户转化', type: 'funnel', left: '10%', width: '80%', sort: 'descending', gap: 6,
              label: { show: true, position: 'inside', color: '#fff', fontSize: 12, fontWeight: 'bold' },
              itemStyle: { borderRadius: 8, borderWidth: 0 },
              data: [
                { value: funnelData.value.registered, name: '注册用户', itemStyle: { color: '#6366f1' } },
                { value: funnelData.value.active_plan, name: '开启计划', itemStyle: { color: '#8b5cf6' } },
                { value: funnelData.value.vip, name: 'VIP 会员', itemStyle: { color: '#10b981' } }
              ]
          }]
      })
  }

  // 4. 财务分布 (饼图)
  if (financeChartRef.value) {
      if (financeChart) financeChart.dispose()
      financeChart = echarts.init(financeChartRef.value)
      financeChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item' },
          legend: { 
            bottom: '0', 
            textStyle: { color: '#a1a1aa' },
            itemGap: 20
          },
          series: [{
              type: 'pie', radius: ['60%', '85%'], center: ['50%', '42%'], avoidLabelOverlap: false,
              itemStyle: { borderRadius: 12, borderColor: '#0f0f14', borderWidth: 4 },
              label: { show: false },
              emphasis: {
                label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' }
              },
              data: [
                  { value: financeStats.value.monthly || 0, name: '月度', itemStyle: { color: '#3b82f6' } },
                  { value: financeStats.value.quarterly || 0, name: '季度', itemStyle: { color: '#f59e0b' } },
                  { value: financeStats.value.yearly || 0, name: '年度', itemStyle: { color: '#10b981' } }
              ]
          }]
      })
  }
}

const handleResize = () => {
  userChart?.resize()
  retentionChart?.resize()
  funnelChart?.resize()
  financeChart?.resize()
}

onMounted(() => {
  fetchAllStats()
  startAutoRefresh()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
  window.removeEventListener('resize', handleResize)
  
  if (userChart) {
    userChart.dispose()
    userChart = null
  }
  if (retentionChart) {
    retentionChart.dispose()
    retentionChart = null
  }
  if (funnelChart) {
    funnelChart.dispose()
    funnelChart = null
  }
  if (financeChart) {
    financeChart.dispose()
    financeChart = null
  }
})
</script>

<template>
  <div class="dashboard-v2 overflow-hidden">
    <!-- 顶部玻璃拟态 Header -->
      <div class="header-glass mb-8">
        <div class="flex justify-between items-start md:items-center flex-col md:row-reverse md:flex-row gap-6">
          <div class="header-left">
            <h1 class="text-3xl font-black tracking-tight text-white mb-2 animate-slide-in">
              {{ greeting }}，<span class="text-indigo-500">管理员</span>
            </h1>
            <div class="flex items-center gap-3 text-zinc-500 animate-fade-in-delay">
              <span class="p-1.5 bg-zinc-800/80 rounded-lg flex items-center justify-center border border-zinc-700/50">
                <Zap :size="14" class="text-yellow-500" />
              </span>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>系统监控中</span>
                <span class="text-emerald-500 font-bold flex items-center gap-1">
                   健康度 {{ systemHealth }}% <div class="pulse-dot"></div>
                </span>
                <span class="opacity-20">|</span>
                <span class="text-xs">同步时间: {{ lastUpdateTime.toLocaleTimeString('zh-CN') }}</span>
              </div>
            </div>
          </div>

          <div class="header-right flex items-center gap-4">
            <div class="text-right hidden sm:block mr-2 animate-fade-in">
              <p class="text-2xl font-mono font-bold text-white leading-none mb-1 tracking-tighter tabular-nums">{{ formattedTime }}</p>
              <p class="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium">{{ formattedDate }}</p>
            </div>
            
            <n-space :size="12">
              <n-button 
                secondary 
                circle
                :loading="refreshing"
                @click="handleRefresh"
                class="glass-btn hover:rotate-180 transition-transform duration-500"
              >
                <template #icon><RefreshCw :size="20" /></template>
              </n-button>
              
              <div class="indicator-box glass-effect" @click="router.push('/notifications')">
                <Bell :size="20" class="text-zinc-300" />
                <span class="dot"></span>
              </div>
            </n-space>
          </div>
        </div>
      </div>

    <n-spin :show="loading">
      <div class="content-wrapper">
        <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-8" responsive="screen">
          <!-- 营收卡片 -->
          <n-grid-item>
            <div class="status-card-premium bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
              <div class="relative z-10">
                <div class="flex justify-between mb-4">
                  <div class="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 shadow-lg shadow-yellow-500/10">
                    <Wallet :size="24" />
                  </div>
                  <n-tag :bordered="false" type="warning" size="small" round>Total Revenue</n-tag>
                </div>
                <h3 class="text-3xl font-black text-white mb-1">
                  <span class="text-lg text-yellow-500 mr-1">¥</span>
                  <n-number-animation :from="0" :to="financeStats.totalRevenue || 0" :precision="2" />
                </h3>
                <p class="text-zinc-500 text-xs font-medium uppercase tracking-tighter">累计已入账金额</p>
              </div>
              <div class="card-bg-icon text-yellow-500/5"><Wallet :size="120" /></div>
            </div>
          </n-grid-item>

          <!-- 新用户卡片 -->
          <n-grid-item>
            <div class="status-card-premium bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <div class="relative z-10">
                <div class="flex justify-between mb-4">
                  <div class="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shadow-lg shadow-blue-500/10">
                    <UserPlus :size="24" />
                  </div>
                  <n-tag :bordered="false" type="info" size="small" round>24H Growth</n-tag>
                </div>
                <h3 class="text-3xl font-black text-white mb-1">
                  <n-number-animation :from="0" :to="stats.todayNewUsers || 0" />
                  <span class="text-lg text-blue-500 ml-1">+</span>
                </h3>
                <p class="text-zinc-500 text-xs font-medium uppercase tracking-tighter">今日新增注册会员</p>
              </div>
              <div class="card-bg-icon text-blue-500/5"><UserPlus :size="120" /></div>
            </div>
          </n-grid-item>

          <!-- 成功率卡片 -->
          <n-grid-item>
            <div class="status-card-premium bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
              <div class="relative z-10">
                <div class="flex justify-between mb-4">
                  <div class="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shadow-lg shadow-emerald-500/10">
                    <Activity :size="24" />
                  </div>
                  <n-tag :bordered="false" type="success" size="small" round>AI Stability</n-tag>
                </div>
                <h3 class="text-3xl font-black text-white mb-1">
                  {{ aiStats.successRate?.toFixed(1) }}<span class="text-lg text-emerald-500">%</span>
                </h3>
                <p class="text-zinc-500 text-xs font-medium uppercase tracking-tighter">AI 响应服务可用率</p>
              </div>
              <div class="card-bg-icon text-emerald-500/5"><ShieldCheck :size="120" /></div>
            </div>
          </n-grid-item>

          <!-- VIP卡片 -->
          <n-grid-item>
            <div class="status-card-premium bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <div class="relative z-10">
                <div class="flex justify-between mb-4">
                  <div class="p-3 bg-purple-500/10 rounded-2xl text-purple-500 shadow-lg shadow-purple-500/10">
                    <Zap :size="24" />
                  </div>
                  <n-tag :bordered="false" type="error" size="small" round>Power Conversion</n-tag>
                </div>
                <h3 class="text-3xl font-black text-white mb-1">
                  {{ stats.totalUsers ? (funnelData.vip * 100 / stats.totalUsers).toFixed(1) : 0 }}<span class="text-lg text-purple-500">%</span>
                </h3>
                <p class="text-zinc-500 text-xs font-medium uppercase tracking-tighter">活跃付费会员渗透率</p>
              </div>
              <div class="card-bg-icon text-purple-500/5"><Zap :size="120" /></div>
            </div>
          </n-grid-item>
        </n-grid>

        <n-grid :cols="12" :x-gap="24" :y-gap="24">
          <!-- 左侧：主要图表 -->
          <n-grid-item :span="8">
            <n-grid :cols="1" :y-gap="24">
              <n-grid-item>
                <div class="chart-container-premium p-6">
                  <div class="flex justify-between items-center mb-6">
                    <h4 class="text-lg font-bold text-white flex items-center gap-2">
                       <TrendingUp :size="20" class="text-indigo-400" />
                       用户活跃增长趋势 (30D)
                    </h4>
                  </div>
                  <div ref="userChartRef" style="height: 320px"></div>
                </div>
              </n-grid-item>
              
              <n-grid :cols="2" :x-gap="24">
                <n-grid-item>
                  <div class="chart-container-premium p-6">
                    <h4 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <BarChart3 :size="20" class="text-purple-400" />
                      核心转化漏斗
                    </h4>
                    <div ref="funnelChartRef" style="height: 240px"></div>
                    <div class="mt-4 grid grid-cols-2 gap-4">
                      <div class="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <p class="text-[10px] text-zinc-500 uppercase font-bold mb-1">活跃计划转化</p>
                        <p class="text-xl font-black text-indigo-400">{{ (funnelData.active_plan*100/funnelData.registered || 0).toFixed(1) }}%</p>
                      </div>
                      <div class="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                        <p class="text-[10px] text-zinc-500 uppercase font-bold mb-1">付费订单转化</p>
                        <p class="text-xl font-black text-emerald-400">{{ (funnelData.vip*100/funnelData.active_plan || 0).toFixed(1) }}%</p>
                      </div>
                    </div>
                  </div>
                </n-grid-item>
                <n-grid-item>
                  <div class="chart-container-premium p-6">
                    <h4 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <ShieldCheck :size="20" class="text-blue-400" />
                      用户留存深度
                    </h4>
                    <div ref="retentionChartRef" style="height: 320px"></div>
                  </div>
                </n-grid-item>
              </n-grid>
            </n-grid>
          </n-grid-item>

          <!-- 右侧：活动流与次要图表 -->
          <n-grid-item :span="4">
            <n-grid :cols="1" :y-gap="24">
              <n-grid-item>
                <div class="chart-container-premium p-6">
                  <h4 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Wallet :size="20" class="text-yellow-400" />
                    营收结构分布
                  </h4>
                  <div ref="financeChartRef" style="height: 220px"></div>
                  <div class="mt-4 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-center">
                    <p class="text-xs text-yellow-500 font-bold uppercase mb-1">总流水成交额</p>
                    <p class="text-3xl font-black text-white leading-none">¥ {{ (financeStats.totalRevenue || 0).toLocaleString() }}</p>
                  </div>
                </div>
              </n-grid-item>

              <n-grid-item>
                <div class="chart-container-premium p-6 h-full min-h-[400px]">
                  <div class="flex justify-between items-center mb-6">
                    <h4 
                      class="text-lg font-bold text-white flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors"
                      @click="router.push('/logs')"
                    >
                      <Clock :size="20" class="text-zinc-400" />
                      实时活动流
                    </h4>
                    <n-button 
                      quaternary 
                      circle 
                      size="small"
                      @click="router.push('/logs')"
                    >
                      <ChevronRight :size="16" />
                    </n-button>
                  </div>
                  
                  <n-timeline size="large">
                    <n-timeline-item
                      v-for="log in recentLogs"
                      :key="log.id"
                      :type="log.status === 1 ? 'success' : 'error'"
                      :title="log.action"
                      :content="log.adminUsername + ' @ ' + log.module"
                      :time="new Date(log.createTime).toLocaleTimeString()"
                    />
                  </n-timeline>

                  <div v-if="recentLogs.length === 0" class="flex flex-col items-center justify-center py-20 opacity-20">
                    <Server :size="48" />
                    <p class="mt-2 text-sm">暂无操作日志</p>
                  </div>
                </div>
              </n-grid-item>
            </n-grid>
          </n-grid-item>
        </n-grid>
      </div>
    </n-spin>

    <!-- 背景装饰 -->
    <div class="bg-blobs">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-v2 {
  min-height: 100vh;
  padding: 32px;
  background-color: #0f0f14;
  position: relative;
  z-index: 1;
}

.header-glass {
  background: linear-gradient(135deg, rgba(24, 24, 27, 0.6) 0%, rgba(20, 20, 25, 0.4) 100%);
  backdrop-filter: blur(24px);
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* 顶部指示器盒子 */
.indicator-box {
  height: 48px;
  width: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator-box:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.indicator-box .dot {
  position: absolute;
  top: 12px;
  right: 12px;
  height: 8px;
  width: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #0f0f14;
}

.status-card-premium {
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-card-premium:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.card-bg-icon {
  position: absolute;
  right: -15px;
  bottom: -15px;
  transform: rotate(-10deg);
  opacity: 0.15;
  filter: blur(1px);
  z-index: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-bg-icon svg {
  width: 100% !important;
  height: 100% !important;
}


.chart-container-premium {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.chart-container-premium:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Animations */
.animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-fade-in-delay {
  animation: fadeIn 0.8s ease-out 0.2s backwards;
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.glass-effect {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 动态背景背景 */
.bg-blobs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  filter: blur(120px);
  opacity: 0.15;
  border-radius: 50%;
  animation: move 20s infinite alternate;
}

.blob-1 {
  background: #6366f1;
  top: -100px;
  right: -100px;
}

.blob-2 {
  background: #a855f7;
  bottom: -150px;
  left: -100px;
  animation-duration: 30s;
}

.blob-3 {
  background: #f59e0b;
  top: 40%;
  left: 30%;
  width: 300px;
  height: 300px;
  animation-duration: 25s;
}

@keyframes move {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(100px, 100px) scale(1.1); }
}

:deep(.n-timeline-item-content__title) {
  color: #fff !important;
  font-weight: 700 !important;
  font-size: 14px !important;
}

:deep(.n-timeline-item-content__content) {
  color: #71717a !important;
  font-size: 12px !important;
}

:deep(.n-timeline-item-content__time) {
  color: #3f3f46 !important;
}

.refresh-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.refresh-btn:hover {
  transform: rotate(90deg);
}

.refresh-btn:active {
  transform: rotate(180deg);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.content-wrapper {
  animation: fade-in-up 0.6s ease-out;
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

