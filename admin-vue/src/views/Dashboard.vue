<script setup>
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NCard, NSpin, NGrid, NGridItem, NStatistic, useMessage, 
  NProgress, NDivider, NNumberAnimation, NAvatar, NTag, NTimeline, 
  NTimelineItem, NButton, NSpace, NTooltip, NBadge
} from 'naive-ui'
import { 
  Users, BookOpen, TrendingUp, Activity, Cloud, Server, 
  Database, BarChart3, Filter, Wallet, UserPlus, Zap, 
  Clock, ShieldCheck, ChevronRight, Bell, RefreshCw, 
  Download, MoreHorizontal, MousePointer2, LayoutDashboard,
  Brain, Mic2, PenTool, BookMarked, Settings, ShieldAlert
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()
const router = useRouter()
const loading = ref(true)
const refreshing = ref(false)
const stats = ref({
  totalUsers: 0,
  todayNewUsers: 0
})
const contentStats = ref({
  vocabulary: 0,
  reading: 0,
  listening: 0,
  grammar: 0,
  writing: 0,
  speaking: 0
})
const aiStats = ref({
  totalCalls: 0,
  successRate: 0,
  avgDuration: 0,
  totalTokens: 0
})
const funnelData = ref({
  registered: 0,
  active_plan: 0,
  vip: 0
})
const financeStats = ref({
  totalRevenue: 0,
  monthly: 0,
  quarterly: 0,
  yearly: 0
})
const retentionData = ref([])
const userGrowthData = ref([])
const recentLogs = ref([])
const lastUpdateTime = ref(new Date())

// 运行时状态
const currentTime = ref(new Date())
const systemHealth = ref(98)
const onlineUsers = ref(Math.floor(Math.random() * 50) + 120)

// 自动更新时间
let timeTimer = null
onMounted(() => {
  timeTimer = setInterval(() => {
    currentTime.value = new Date()
    // 模拟在线人数波动
    if (Math.random() > 0.8) {
      onlineUsers.value += Math.floor(Math.random() * 5) - 2
    }
  }, 1000)
})

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('zh-CN', { hour12: false })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
})

const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '半夜好'
})

// 图表实例
const userChartRef = ref(null)
const retentionChartRef = ref(null)
const funnelChartRef = ref(null)
const contentRadarRef = ref(null)
const financeChartRef = ref(null)

let charts = {
  user: null,
  retention: null,
  funnel: null,
  radar: null,
  finance: null
}

// 获取统计数据
const fetchAllStats = async (showLoading = true) => {
  if (showLoading) loading.value = true
  else refreshing.value = true
  
  try {
    const [statsRes, contentRes, aiRes, growthRes, funnelRes, financeRes, retentionRes, logsRes] = await Promise.all([
      adminApi.getStats(),
      adminApi.getContentStats(),
      adminApi.getAIStats(),
      adminApi.getUserGrowth(),
      adminApi.getUserFunnel(),
      adminApi.getFinanceStats(),
      adminApi.getRetentionData(),
      adminApi.getOperationLogs({ page: 1, size: 6 })
    ])
    
    stats.value = statsRes.data || stats.value
    contentStats.value = contentRes.data || contentStats.value
    aiStats.value = aiRes.data || aiStats.value
    userGrowthData.value = growthRes.data || []
    funnelData.value = funnelRes.data || funnelData.value
    financeStats.value = financeRes.data || financeStats.value
    retentionData.value = retentionRes.data || []
    recentLogs.value = logsRes.data?.records || []
    lastUpdateTime.value = new Date()
    
    setTimeout(() => renderCharts(), 100)
    
    if (!showLoading) message.success('数据同步成功')
  } catch (error) {
    message.error('概览数据加载失败')
    console.error(error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 快速操作
const quickActions = [
  { label: '用户审计', icon: Users, path: '/users', color: '#6366f1' },
  { label: '词库更新', icon: BookMarked, path: '/vocabulary', color: '#10b981' },
  { label: '系统设置', icon: Settings, path: '/settings', color: '#f59e0b' },
  { label: '安全日志', icon: ShieldAlert, path: '/logs', color: '#f43f5e' }
]

// 渲染图表
const renderCharts = async () => {
    await nextTick()
    // 延迟一小段时间确保布局稳定 (解决 Can't get DOM width 报错)
    await new Promise(resolve => setTimeout(resolve, 300))
    
  const commonTheme = {
    textStyle: { fontFamily: 'Inter, sans-serif' },
    labelColor: 'rgba(255, 255, 255, 0.4)',
    splitLine: 'rgba(255, 255, 255, 0.05)'
  }

  // 1. 用户增长 (多维)
  if (userChartRef.value && userChartRef.value.clientWidth > 0 && userChartRef.value.clientHeight > 0) {
    if (charts.user) charts.user.dispose()
    charts.user = echarts.init(userChartRef.value)
    charts.user.setOption({
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { backgroundColor: '#18181b' } },
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' }
      },
      grid: { left: '2%', right: '3%', bottom: '2%', top: '15%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: userGrowthData.value.map(item => item.date.slice(5)),
        axisLabel: { color: commonTheme.labelColor, fontSize: 10 },
        axisLine: { show: false }
      },
      yAxis: { 
        type: 'value', 
        min: 0, // 明确设定最小值
        splitLine: { lineStyle: { color: commonTheme.splitLine, type: 'dashed' } },
        axisLabel: { color: commonTheme.labelColor },
        alignTicks: false
      },
      series: [{
        name: '新增注册',
        data: userGrowthData.value.map(item => item.count),
        type: 'line', smooth: true,
        symbol: 'circle', symbolSize: 6,
        itemStyle: { color: '#6366f1' },
        lineStyle: { width: 3, shadowBlur: 10, shadowColor: 'rgba(99, 102, 241, 0.3)' },
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(99, 102, 241, 0.3)' }, 
            { offset: 1, color: 'transparent' }
          ]) 
        }
      }]
    })
  }

  // 2. 内容雷达图
  if (contentRadarRef.value && contentRadarRef.value.clientWidth > 0 && contentRadarRef.value.clientHeight > 0) {
    if (charts.radar) charts.radar.dispose()
    charts.radar = echarts.init(contentRadarRef.value)
    
    // 动态计算 Max 值，并不设定最小值，避免 ECharts 警告
    let rawMax = Math.max(
      ...Object.values(contentStats.value).filter(v => typeof v === 'number'),
      100
    ) * 1.2
    
    // 向上取整为“漂亮的”数字 (为了通过 ECharts 的刻度检测)
    // 例如: 7879.2 -> 8000
    const order = Math.floor(Math.log10(rawMax))
    const power = Math.pow(10, order)
    const step = power / 2
    const maxVal = Math.ceil(rawMax / step) * step

    charts.radar.setOption({
      radar: {
        indicator: [
          { name: '词汇', max: maxVal, min: 0 },
          { name: '听力', max: maxVal, min: 0 },
          { name: '阅读', max: maxVal, min: 0 },
          { name: '口语', max: maxVal, min: 0 },
          { name: '语法', max: maxVal, min: 0 },
          { name: '写作', max: maxVal, min: 0 }
        ],
        // splitNumber: 4, // 移除固定分割数，交给 ECharts 自动计算
        axisName: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        splitArea: { show: false }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [
            contentStats.value.vocabulary || 0,
            contentStats.value.listening || 0,
            contentStats.value.reading || 0,
            contentStats.value.speaking || 0,
            contentStats.value.grammar || 0,
            contentStats.value.writing || 0
          ],
          name: '内容分布',
          symbol: 'none',
          itemStyle: { color: '#10b981' },
          areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
          lineStyle: { width: 2 }
        }]
      }]
    })
  }

  // 3. 留存柱状图 (迷你风格)
  if (retentionChartRef.value && retentionChartRef.value.clientWidth > 0 && retentionChartRef.value.clientHeight > 0) {
    if (charts.retention) charts.retention.dispose()
    charts.retention = echarts.init(retentionChartRef.value)
    charts.retention.setOption({
      grid: { left: 0, right: 0, bottom: 0, top: 10, containLabel: false },
      xAxis: { type: 'category', data: retentionData.value.map(i => i.day), show: false },
      yAxis: { type: 'value', min: 0, show: false, alignTicks: false },
      series: [{
        data: retentionData.value.map(i => i.rate),
        type: 'bar', barWidth: '60%',
        itemStyle: { 
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' }, { offset: 1, color: '#6366f1' }
          ])
        }
      }]
    })
  }

  // 4. 用户漏斗 (极简设计)
  if (funnelChartRef.value && funnelChartRef.value.clientWidth > 0 && funnelChartRef.value.clientHeight > 0) {
    if (charts.funnel) charts.funnel.dispose()
    charts.funnel = echarts.init(funnelChartRef.value)
    charts.funnel.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [{
        name: '转化漏斗', type: 'funnel', left: '15%', width: '70%', gap: 4,
        label: { show: true, position: 'inside', color: '#fff' },
        itemStyle: { borderRadius: 8, borderWidth: 0 },
        data: [
          { value: funnelData.value.registered || 0, name: '注册', itemStyle: { color: '#6366f1' } },
          { value: funnelData.value.active_plan || 0, name: '活跃', itemStyle: { color: '#a855f7' } },
          { value: funnelData.value.vip || 0, name: '付费', itemStyle: { color: '#14b8a6' } }
        ]
      }]
    })
  }
}

const handleResize = () => {
  Object.values(charts).forEach(chart => chart?.resize())
}

onMounted(() => {
  fetchAllStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearInterval(timeTimer)
  window.removeEventListener('resize', handleResize)
  Object.values(charts).forEach(chart => chart?.dispose())
})
</script>

<template>
  <div class="dashboard-v3">
    <!-- 背景流光 -->
    <div class="ambient-glow">
      <div class="blob b-purple"></div>
      <div class="blob b-blue"></div>
      <div class="blob b-gold"></div>
    </div>

    <!-- 顶部导航条 -->
    <header class="dashboard-header animate-slide-down">
      <div class="header-content">
        <div class="left-hero">
          <div class="status-indicator">
            <div class="pulse-ring"></div>
            <div class="pulse-dot"></div>
          </div>
          <div class="greeting-box">
            <h1 class="hero-title">{{ greeting }}，<span>管理员</span></h1>
            <p class="hero-subtitle">系统运行状态良好，今日已有 {{ stats.todayNewUsers }} 位新学员加入</p>
          </div>
        </div>

        <div class="right-info">
          <div class="realtime-clock">
            <span class="time">{{ formattedTime }}</span>
            <span class="date">{{ formattedDate }}</span>
          </div>
          <n-divider vertical />
          <n-space :size="12">
            <n-tooltip trigger="hover">
              <template #trigger>
                <div class="icon-trigger glass-effect" @click="fetchAllStats(false)">
                  <RefreshCw :size="18" :class="refreshing ? 'animate-spin' : ''" />
                </div>
              </template>
              刷新全局数据
            </n-tooltip>
            <n-badge dot color="#ef4444" @click="router.push('/notifications')">
              <div class="icon-trigger glass-effect">
                <Bell :size="18" />
              </div>
            </n-badge>
          </n-space>
        </div>
      </div>
    </header>

    <n-spin :show="loading">
      <main class="dashboard-content">
        <!-- 核心指标卡片组 -->
        <n-grid :cols="4" :x-gap="20" :y-gap="20" class="mb-6" responsive="screen">
          <n-grid-item>
            <div class="p-card kpi-card blue">
              <div class="kpi-header">
                <div class="kpi-icon"><Users :size="24" /></div>
                <n-tag size="small" :bordered="false" round type="info">较昨日 +{{ stats.todayNewUsers }}</n-tag>
              </div>
              <div class="kpi-body">
                <div class="kpi-value">
                  <n-number-animation :from="0" :to="stats.totalUsers || 0" />
                </div>
                <div class="kpi-label">累计用户规模</div>
              </div>
              <div class="kpi-footer">
                <div class="sparkline-mini">
                  <div class="bar" style="height: 30%"></div>
                  <div class="bar" style="height: 50%"></div>
                  <div class="bar" style="height: 40%"></div>
                  <div class="bar" style="height: 80%"></div>
                  <div class="bar" style="height: 60%"></div>
                  <div class="bar" style="height: 90%"></div>
                </div>
                <div class="kpi-meta">DAU: {{ onlineUsers }}</div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="p-card kpi-card gold">
              <div class="kpi-header">
                <div class="kpi-icon"><Wallet :size="24" /></div>
                <n-tag size="small" :bordered="false" round type="warning">已确认收支</n-tag>
              </div>
              <div class="kpi-body">
                <div class="kpi-value">
                  <span class="curr">¥</span>
                  <n-number-animation :from="0" :to="financeStats.totalRevenue || 0" :precision="2" />
                </div>
                <div class="kpi-label">平台总交易总额</div>
              </div>
              <div class="kpi-footer">
                <div class="progress-simple">
                  <div class="progress-inner" :style="{ width: '75%' }"></div>
                </div>
                <div class="kpi-meta">目标达成: 75%</div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="p-card kpi-card green">
              <div class="kpi-header">
                <div class="kpi-icon"><ShieldCheck :size="24" /></div>
                <n-tag size="small" :bordered="false" round type="success">实时可用性</n-tag>
              </div>
              <div class="kpi-body">
                <div class="kpi-value">{{ aiStats.successRate?.toFixed(1) || 0 }}<span class="unit">%</span></div>
                <div class="kpi-label">AI 服务成功率</div>
              </div>
              <div class="kpi-footer">
                <div class="kpi-meta text-emerald-400">平均时延: {{ aiStats.avgDuration }}ms</div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="p-card kpi-card purple">
              <div class="kpi-header">
                <div class="kpi-icon"><Activity :size="24" /></div>
                <n-tag size="small" :bordered="false" round type="error">全站指标</n-tag>
              </div>
              <div class="kpi-body">
                <div class="kpi-value">{{ (aiStats.totalTokens / 1000).toFixed(1) }}<span class="unit">k</span></div>
                <div class="kpi-label">AI Token 消耗量</div>
              </div>
              <div class="kpi-footer">
                <div class="kpi-meta">资源负载: 中等</div>
              </div>
            </div>
          </n-grid-item>
        </n-grid>

        <!-- 主图表区 -->
        <n-grid :cols="12" :x-gap="20" :y-gap="20">
          <n-grid-item :span="8">
            <div class="p-card chart-main">
              <div class="card-title">
                <TrendingUp :size="18" />
                <span>用户活跃趋势分析</span>
                <n-space :size="8" class="ml-auto">
                  <n-button quaternary size="tiny" round>15天</n-button>
                  <n-button secondary type="primary" size="tiny" round>30天</n-button>
                </n-space>
              </div>
              <div ref="userChartRef" class="chart-box-large"></div>
            </div>

            <n-grid :cols="2" :x-gap="20" class="mt-5">
              <n-grid-item>
                <div class="p-card chart-sub">
                  <div class="card-title"><Brain :size="18" /><span>内容库分布图</span></div>
                  <div ref="contentRadarRef" class="chart-box-medium"></div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="p-card chart-sub">
                  <div class="card-title"><Filter :size="18" /><span>核心转化漏斗</span></div>
                  <div ref="funnelChartRef" class="chart-box-medium"></div>
                </div>
              </n-grid-item>
            </n-grid>
          </n-grid-item>

          <!-- 右侧边栏 -->
          <n-grid-item :span="4">
            <!-- 快速操作 -->
            <div class="p-card mb-5">
              <div class="card-title"><LayoutDashboard :size="18" /><span>快速导航</span></div>
              <div class="grid grid-cols-2 gap-3 mt-4">
                <div 
                  v-for="action in quickActions" 
                  :key="action.label"
                  class="action-item glass-effect"
                  @click="router.push(action.path)"
                >
                  <div class="action-icon" :style="{ backgroundColor: action.color + '20', color: action.color }">
                    <component :is="action.icon" :size="20" />
                  </div>
                  <span class="action-label">{{ action.label }}</span>
                </div>
              </div>
            </div>

            <!-- 数据监测 -->
            <div class="p-card mb-5">
              <div class="card-title"><MousePointer2 :size="18" /><span>用户留存分析</span></div>
              <div class="flex items-center gap-4 mt-6">
                <div class="retention-value">
                  <div class="val">{{ retentionData[0]?.rate || 0 }}%</div>
                  <div class="lab">次日留存</div>
                </div>
                <div ref="retentionChartRef" class="flex-1 h-20"></div>
              </div>
            </div>

            <!-- 活动流 -->
            <div class="p-card flex-1 min-h-0 relative">
              <div class="card-title">
                <Clock :size="18" />
                <span>实时操作审计</span>
                <n-button quaternary circle size="tiny" class="ml-auto" @click="router.push('/logs')">
                  <ChevronRight :size="14" />
                </n-button>
              </div>
              <div class="scroll-v mt-4 pr-2 max-h-[380px]">
                <n-timeline>
                  <n-timeline-item
                    v-for="log in recentLogs"
                    :key="log.id"
                    :type="log.status === 1 ? 'success' : 'error'"
                    :title="log.action"
                    :content="log.adminUsername + ' @ ' + log.module"
                    :time="new Date(log.createTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})"
                  />
                </n-timeline>
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </main>
    </n-spin>
  </div>
</template>

<style scoped>
.dashboard-v3 {
  min-height: 100vh;
  background: #09090b;
  color: #fff;
  padding: 24px;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* 玻璃卡片基类 */
.p-card {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.p-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* 顶部导航 */
.dashboard-header {
  margin-bottom: 28px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.hero-title span {
  background: linear-gradient(to right, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  color: #71717a;
  font-size: 14px;
  margin-top: 4px;
}

.left-hero {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.realtime-clock {
  text-align: right;
  margin-right: 12px;
}

.realtime-clock .time {
  display: block;
  font-size: 24px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.realtime-clock .date {
  font-size: 11px;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* KPI 卡片特效 */
.kpi-card {
  position: relative;
  overflow: hidden;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-value {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
}

.kpi-value .unit {
  font-size: 16px;
  margin-left: 2px;
}

.kpi-value .curr {
  font-size: 18px;
  margin-right: 4px;
  color: #f59e0b;
}

.kpi-label {
  font-size: 12px;
  color: #71717a;
  font-weight: 600;
  margin-top: 2px;
}

.kpi-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-meta {
  font-size: 11px;
  color: #3f3f46;
  font-weight: 700;
}

/* 颜色变体 */
.kpi-card.blue .kpi-icon { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.kpi-card.gold .kpi-icon { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.kpi-card.green .kpi-icon { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.kpi-card.purple .kpi-icon { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

/* 图表容器 */
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #e4e4e7;
  margin-bottom: 20px;
}

.chart-box-large { height: 320px; }
.chart-box-medium { height: 260px; }

/* 快速导航 */
.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.05);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.action-label {
  font-size: 12px;
  font-weight: 600;
}

/* 状态组件 */
.pulse-dot {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.status-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.pulse-ring {
  position: absolute;
  width: 24px;
  height: 24px;
  background: rgba(16, 185, 129, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* 背景虚化 */
.ambient-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  filter: blur(140px);
  opacity: 0.12;
  border-radius: 50%;
}

.b-purple { background: #8b5cf6; top: -10%; right: -5%; }
.b-blue { background: #3b82f6; bottom: -10%; left: -5%; }
.b-gold { background: #f59e0b; top: 30%; left: 20%; width: 300px; height: 300px; }

/* 迷你图形组件 */
.sparkline-mini {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
}

.sparkline-mini .bar {
  width: 3px;
  background: #6366f1;
  border-radius: 1px;
}

.progress-simple {
  height: 6px;
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #fbbf24;
}

.retention-value .val {
  font-size: 28px;
  font-weight: 800;
  color: #8b5cf6;
}

.retention-value .lab {
  font-size: 11px;
  color: #a1a1aa;
}

.icon-trigger {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.scroll-v {
  overflow-y: auto;
}

.scroll-v::-webkit-scrollbar { width: 4px; }
.scroll-v::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

/* 进场动画 */
.animate-slide-down {
  animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 响应式调整 */
@media screen and (max-width: 1280px) {
  .hero-title { font-size: 22px; }
  .kpi-value { font-size: 26px; }
}
</style>
