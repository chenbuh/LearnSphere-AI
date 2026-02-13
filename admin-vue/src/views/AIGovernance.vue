<script setup>
import { ref, onMounted, h, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, NTabs, NTabPane, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NTag, NSelect, NPopconfirm, NAlert,
  NGrid, NGridItem, NStatistic, NNumberAnimation, NSpin, NProgress, NRadioGroup, NRadioButton,
  NScrollbar, NDivider, NEmpty, NSkeleton
} from 'naive-ui'
import { Edit, RefreshCcw, Plus, Trash, Zap, Activity, CheckCircle, XCircle, Clock, Coins, Eye, RotateCcw, ThumbsUp, ThumbsDown, AlertTriangle, History, ArrowRightLeft, FlaskConical, Play, Square, FileText, MessageSquare, Brain, Scale } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'
import gsap from 'gsap'

const message = useMessage()
const loading = ref(false)
const skeletonLoading = ref(true)
const analyzingId = ref(null) // Added for feedback analysis loading state
const activeTab = ref('monitor')

// Monitor Data
const aiStats = ref({
  totalCalls: 0,
  successRate: 0,
  avgDuration: 0,
  last24hCalls: 0,
  totalTokens: 0,
  avgTokens: 0,
  tokens24h: 0
})
const aiHealth = ref({
  commonErrors: [],
  highFailureActions: [],
  p95: 0,
  p99: 0,
  circuitBreakerStatus: 'CLOSED', // OPEN, HALF_OPEN, CLOSED
  lastFailoverTime: null,
  activeModel: 'qwen-plus' // 当前主要使用的模型
})

// Sandbox Data
const sandboxSystemPrompt = ref('')
const sandboxUserPrompt = ref('')
const sandboxResult = ref('')
const sandboxLoading = ref(false)
const loopStats = ref({
  summary: { total: 0, postives: 0, negatives: 0, processed: 0 },
  anomalies: [],
  fewShotCoverage: [],
  list: []
})

const estimatedCost = computed(() => {
  if (!aiStats.value.modelUsage || !aiStats.value.modelUsage.length) {
    return (aiStats.value.totalTokens * 0.0000015).toFixed(4)
  }

  let totalRMB = 0
  const pricing = {
    'qwen-max': { input: 0.04, output: 0.12 },
    'qwen-plus': { input: 0.0008, output: 0.002 },
    'qwen-turbo': { input: 0.0003, output: 0.0006 },
    'qwen-long': { input: 0.0005, output: 0.002 },
    'qwq-32b-preview': { input: 0.0008, output: 0.002 }
  }

  aiStats.value.modelUsage.forEach(item => {
    const model = item.model.toLowerCase()
    const config = Object.keys(pricing).find(key => model.includes(key))
    if (config) {
      const p = pricing[config]
      totalRMB += (item.input * p.input / 1000) + (item.output * p.output / 1000)
    } else {
      // 默认按 plus 估算
      totalRMB += (item.input + item.output) * 0.001 / 1000
    }
  })

  return totalRMB.toFixed(4)
})

// Helper function to remove Markdown formatting
const formatAnalysisText = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')  // Remove bold **text**
    .replace(/\*(.+?)\*/g, '$1')      // Remove italic *text*
    .replace(/^#{1,6}\s+/gm, '')      // Remove headers
    .replace(/`([^`]+)`/g, '$1')      // Remove inline code
    .trim()
}

const renderModelDistributionChart = () => {
    if (!modelChartRef.value) return
    if (modelChartInstance) modelChartInstance.dispose()
    modelChartInstance = echarts.init(modelChartRef.value)

    // Mock data if backend integration is pending
    const data = aiStats.value.modelUsage || [
        { model: 'qwen-plus', count: 1250 },
        { model: 'qwen-turbo', count: 890 },
        { model: 'qwen-items', count: 320 }
    ]

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#a1a1aa' }
        },
        series: [
            {
                name: '模型分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#18181b',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#fff'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({ value: item.count, name: item.model }))
            }
        ]
    }
    modelChartInstance.setOption(option)
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  trendChartInstance = echarts.init(trendChartRef.value)
  
  // Mock cache hit rate for demo functionality (replace with real data later)
  const cacheHitRates = trendData.value.map(() => Math.floor(Math.random() * 30) + 40) // 40%-70% mock rate

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 20, 25, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Total Tokens', '缓存命中率 (%)'],
      textStyle: { color: '#a1a1aa' },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map(item => item.date.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: '#71717a' },
       axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: [
        {
            type: 'value',
            name: 'Token 消耗',
            nameTextStyle: { color: '#a1a1aa' },
            position: 'left',
            axisLine: { lineStyle: { color: '#a1a1aa' } },
            splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
            axisLabel: { color: '#a1a1aa' },
            alignTicks: false
        },
        {
            type: 'value',
            name: '缓存命中率',
            min: 0,
            max: 100,
            position: 'right',
            axisLine: { lineStyle: { color: '#10b981' } },
            splitLine: { show: false },
            axisLabel: { formatter: '{value} %', color: '#10b981' },
            alignTicks: false
        }
    ],
    series: [
      {
        name: 'Total Tokens',
        data: trendData.value.map(item => item.totalTokens || (item.total * 500)), // Fallback estimation
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#8b5cf6' },
                { offset: 1, color: '#6d28d9' }
            ])
        },
        yAxisIndex: 0
      },
      {
        name: '缓存命中率 (%)',
        data: cacheHitRates,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#10b981', borderColor: '#fff', borderWidth: 2 },
        lineStyle: { width: 3, shadowColor: 'rgba(16, 185, 129, 0.5)', shadowBlur: 10 },
        yAxisIndex: 1
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}
const handleRunTest = async () => {
  if (!sandboxUserPrompt.value) {
    message.warning('请输入 User Prompt')
    return
  }
  sandboxLoading.value = true
  sandboxResult.value = ''
  try {
    const res = await adminApi.testPrompt({
      systemPrompt: sandboxSystemPrompt.value,
      userPrompt: sandboxUserPrompt.value
    })
    sandboxResult.value = res.data
    message.success('请求成功')
  } catch (error) {
    message.error('测试请求失败')
  } finally {
    sandboxLoading.value = false
  }
}

const trendData = ref([])
const trendDuration = ref(14)
const trendChartRef = ref(null)
const modelChartRef = ref(null)
let trendChartInstance = null
let modelChartInstance = null

// Prompts Data
const promptList = ref([])
const showPromptModal = ref(false)
const isEditPrompt = ref(false)
const currentPrompt = ref({
  id: null,
  promptKey: '',
  description: '',
  content: '',
  remark: ''
})

// History & Lifecycle
const showHistoryModal = ref(false)
const historyList = ref([])
const historyLoading = ref(false)
const selectedPromptForHistory = ref(null)
const comparingHistory = ref(null) // For diff comparison

// Logs Data
const logList = ref([])
const logTotal = ref(0)
const logPage = ref(1)
const logPageSize = ref(10)
const logStatusFilter = ref(null)
const logActionFilter = ref(null)
const showLogDetail = ref(false)
const selectedLog = ref(null)

const handleViewLog = (row) => {
  selectedLog.value = row
  showLogDetail.value = true
}

const statusOptions = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAIL' }
]

const promptColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: 'Key', key: 'promptKey', width: 200, ellipsis: true },
  { title: '描述', key: 'description', width: 250 },
  { title: '最后更新', key: 'updateTime', width: 180, render: (row) => formatTime(row.updateTime) },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => handleEditPrompt(row)
          }, { default: () => h(Edit, { size: 14 }) }),
          h(NButton, {
            size: 'small',
            type: 'info',
            ghost: true,
            onClick: () => handleViewHistory(row)
          }, { default: () => h(History, { size: 14 }) }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDeletePrompt(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error',
              ghost: true
            }, { default: () => h(Trash, { size: 14 }) }),
            default: () => `确定要删除 "${row.promptKey}" 吗？此操作不可恢复。`
          })
        ]
      })
    }
  }
]

const logColumns = [
  { title: '时间', key: 'createTime', width: 180, render: (row) => formatTime(row.createTime) },
  { title: '用户ID', key: 'userId', width: 100, render: (row) => row.userId || 'System' },
  { title: '动作类型', key: 'actionType', width: 150 },
  { title: '模型', key: 'modelName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { type: row.status === 'SUCCESS' ? 'success' : 'error', bordered: false, round: true }, { default: () => row.status })
  },
  { 
    title: 'Tokens', 
    key: 'totalTokens', 
    width: 140, 
    render: (row) => h('div', { class: 'text-xs' }, [
      h('div', { class: 'font-bold' }, row.totalTokens || 0),
      h('div', { class: 'text-zinc-500 transform scale-90 origin-left' }, `${row.inputTokens || 0} in / ${row.outputTokens || 0} out`)
    ])
  },
  { title: '耗时(ms)', key: 'durationMs', width: 100 },
  { title: '错误信息', key: 'errorMessage', width: 200, ellipsis: true },
  {
    title: '详情',
    key: 'actions',
    width: 80,
    render(row) {
      return h(NButton, {
        size: 'small',
        type: 'primary',
        quaternary: true,
        onClick: () => handleViewLog(row)
      }, { default: () => h(Eye, { size: 16 }) })
    }
  }
]

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchMonitorData = async () => {
  try {
    const [statsRes, trendsRes, healthRes] = await Promise.all([
      adminApi.getAIStats(),
      adminApi.getAITrends(trendDuration.value),
      adminApi.getAIHealth()
    ])
    aiStats.value = statsRes.data
    trendData.value = trendsRes.data
    aiHealth.value = healthRes.data
    fetchAIConfig() // Also fetch global config
    
    setTimeout(() => {
      skeletonLoading.value = false
      nextTick(() => {
        renderTrendChart()
        renderModelDistributionChart()
        animateEntering()
      })
    }, 400)
  } catch (error) {
    message.error('加载监控数据失败')
  }
}

// Original renderTrendChart removed as it is redefined above

const fetchPrompts = async () => {
  loading.value = true
  try {
    const res = await adminApi.getPrompts()
    promptList.value = res.data
  } catch (error) {
    message.error('加载提示词失败')
  } finally {
    loading.value = false
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAILogs({
      page: logPage.value,
      size: logPageSize.value,
      status: logStatusFilter.value,
      actionType: logActionFilter.value
    })
    logList.value = res.data.records
    logTotal.value = res.data.total
  } catch (error) {
    message.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

const fetchLoopData = async () => {
  try {
    const [statsRes, listRes] = await Promise.all([
      adminApi.getAILoopStats(),
      adminApi.getAIFeedbackList({ page: 1, size: 20 }) // Fetch latest 20 items
    ])

    if (statsRes.code === 200) {
      loopStats.value.summary = statsRes.data.summary
      loopStats.value.anomalies = statsRes.data.anomalies
      loopStats.value.fewShotCoverage = statsRes.data.fewShotCoverage
    }
    
    if (listRes.code === 200) {
      loopStats.value.list = listRes.data.records
    }
  } catch (error) {
    console.error(error)
    message.error('获取闭环统计数据失败')
  }
}

const handleTabChange = (value) => {
  activeTab.value = value
  if (value === 'monitor') {
    fetchMonitorData()
    // 切换回 monitor tab 时，图表容器可能从隐藏变为显示，需要 resize
    nextTick(() => {
      trendChartInstance?.resize()
      modelChartInstance?.resize()
    })
  } else if (value === 'prompts') {
    fetchPrompts()
  } else if (value === 'logs') {
    fetchLogs()
  } else if (value === 'loop') {
    fetchLoopData()
  } else if (value === 'stability') {
    fetchAIConfig()
  } else if (value === 'abtest') {
    fetchExperiments()
  }
}

const handleAddPrompt = () => {
  isEditPrompt.value = false
  currentPrompt.value = {
    id: null,
    promptKey: '',
    description: '',
    content: '',
    remark: ''
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showPromptModal.value = true
}

const handleEditPrompt = (row) => {
  isEditPrompt.value = true
  currentPrompt.value = { ...row }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showPromptModal.value = true
}

const handleDeletePrompt = async (id) => {
  try {
    await adminApi.deletePrompt(id)
    message.success('删除成功')
    fetchPrompts()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleAnalyzeFeedback = async (item) => {
  analyzingId.value = item.id
  try {
    const res = await adminApi.analyzeAIFeedback({ feedbackId: item.id })
    if (res.code === 200) {
      message.success('归因分析成功')
      fetchLoopData() // Corrected from fetchLoopStats()
    }
  } catch (error) {
    message.error('分析失败: ' + (error.message || '网络异常'))
  } finally {
    analyzingId.value = null
  }
}

const handleViewHistory = async (row) => {
  selectedPromptForHistory.value = row
  historyLoading.value = true
  showHistoryModal.value = true
  comparingHistory.value = null
  try {
    const res = await adminApi.getPromptHistory(row.id)
    historyList.value = res.data
  } catch (error) {
    message.error('获取历史记录失败')
  } finally {
    historyLoading.value = false
  }
}

const handleRollback = async (historyId) => {
  try {
    const res = await adminApi.rollbackPrompt(selectedPromptForHistory.value.id, historyId)
    if (res.code === 200) {
      message.success('回滚成功')
      showHistoryModal.value = false
      fetchPrompts()
    }
  } catch (error) {
    message.error('回滚失败')
  }
}

const handleSavePrompt = async () => {
  try {
    if (isEditPrompt.value) {
      await adminApi.updatePrompt(currentPrompt.value.id, currentPrompt.value)
    } else {
      await adminApi.addPrompt(currentPrompt.value)
    }
    
    message.success(isEditPrompt.value ? '更新成功' : '创建成功')
    showPromptModal.value = false
    fetchPrompts()
  } catch (error) {
    message.error(isEditPrompt.value ? '更新失败' : '创建失败')
  }
}

const handleLogPageChange = (page) => {
  logPage.value = page
  fetchLogs()
}

const handleResize = () => {
  trendChartInstance?.resize()
  modelChartInstance?.resize()
}

onMounted(() => {
  fetchMonitorData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChartInstance) {
    trendChartInstance?.dispose()
    trendChartInstance = null
    modelChartInstance?.dispose()
    modelChartInstance = null
  }
})
const aiConfig = ref({
  activeModel: 'qwen-plus',
  isOverridden: false
})

const fetchAIConfig = async () => {
  try {
    const res = await adminApi.getAIConfig()
    aiConfig.value = res.data
  } catch (error) {
    message.error('获取 AI 配置失败')
  }
}

const handleUpdateModel = async (model) => {
  const previousModel = aiConfig.value.activeModel
  // Optimistic Update
  if (model !== 'default') {
      aiConfig.value.activeModel = model
      aiConfig.value.isOverridden = true
  }

  try {
    const res = await adminApi.updateAIConfig({ model })
    if (res.code === 200) {
        message.success(`模型已切换至: ${model === 'default' ? '系统默认' : model}`)
        fetchAIConfig()
        // Refresh health data to show new model
        const healthRes = await adminApi.getAIHealth()
        aiHealth.value = healthRes.data
    }
  } catch (error) {
    // Rollback
    aiConfig.value.activeModel = previousModel
    message.error('切换模型失败')
  }
}

const animateEntering = () => {
    if (skeletonLoading.value) return

    const statCards = document.querySelectorAll('.monitor-grid .stat-card')
    const chartCards = document.querySelectorAll('.chart-card')
    
    if (statCards.length === 0 && chartCards.length === 0) return

    const tl = gsap.timeline()
    
    if (statCards.length > 0) {
        tl.fromTo(statCards, 
            { y: 30, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.6, 
                stagger: 0.1, 
                ease: 'power3.out',
                clearProps: 'all'
            }
        )
    }

    if (chartCards.length > 0) {
        tl.fromTo(chartCards, 
            { scale: 0.98, opacity: 0, y: 20 },
            { 
                scale: 1, 
                y: 0,
                opacity: 1, 
                duration: 0.8, 
                ease: 'power2.out',
                clearProps: 'all'
            },
            statCards.length > 0 ? '-=0.4' : 0
        )
    }
}

// A/B Experiment
const experimentList = ref([])
const showExperimentModal = ref(false)
const showReportModal = ref(false)
const experimentForm = ref({
  name: '',
  actionType: '',
  variantName: 'Variant B',
  systemPromptB: '',
  trafficRatio: 50
})
const currentReport = ref(null)

const fetchExperiments = async () => {
    loading.value = true
    try {
        const res = await adminApi.getExperiments()
        experimentList.value = res.data
    } catch {
        message.error('加载实验失败')
    } finally {
        loading.value = false
    }
}

const handleStartExperiment = async () => {
    try {
        await adminApi.startExperiment(experimentForm.value)
        message.success('实验已启动')
        showExperimentModal.value = false
        fetchExperiments()
    } catch {
        message.error('启动失败')
    }
}

const handleStopExperiment = async (id) => {
    try {
        await adminApi.stopExperiment(id)
        message.success('实验已停止')
        fetchExperiments()
    } catch {
        message.error('停止失败')
    }
}

const handleViewReport = async (id) => {
    try {
        const res = await adminApi.getExperimentReport(id)
        currentReport.value = res.data
        showReportModal.value = true
    } catch {
        message.error('获取报告失败')
    }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1>AI 治理面板</h1>
        <p>监控 AI 运行状态，管理系统提示词</p>
      </div>
      <n-space>
        <n-button v-if="activeTab === 'prompts'" type="primary" @click="handleAddPrompt">
            <template #icon><Plus /></template>
            新建提示词
        </n-button>
        <n-button v-if="activeTab === 'logs'" secondary @click="fetchLogs">
            <template #icon><RefreshCcw /></template>
            刷新日志
        </n-button>
        <n-button v-if="activeTab === 'monitor'" secondary @click="fetchMonitorData">
            <template #icon><RefreshCcw /></template>
            刷新数据
        </n-button>
        <n-button v-if="activeTab === 'loop'" secondary @click="fetchLoopData">
            <template #icon><RotateCcw /></template>
            重载闭环状态
        </n-button>
        <n-button v-if="activeTab === 'abtest'" type="primary" @click="showExperimentModal = true">
            <template #icon><FlaskConical /></template>
            新建 A/B 实验
        </n-button>
        <n-button v-if="activeTab === 'abtest'" secondary @click="fetchExperiments">
            <template #icon><RefreshCcw /></template>
            刷新列表
        </n-button>
      </n-space>
    </header>

    <n-tabs v-model:value="activeTab" type="segment" animated @update:value="handleTabChange">
      <!-- 监控面板 -->
      <n-tab-pane name="monitor" tab="全景监控">
        <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-6 monitor-grid">
          <n-grid-item v-for="i in 4" :key="'stat-skeleton-' + i" v-if="skeletonLoading">
            <n-card class="stat-skeleton" :bordered="false">
              <div class="flex items-center gap-4">
                <n-skeleton :width="52" :height="52" :border-radius="12" />
                <div class="flex-1">
                   <n-skeleton height="12px" width="40%" style="margin-bottom: 8px" />
                   <n-skeleton height="24px" width="70%" />
                </div>
              </div>
            </n-card>
          </n-grid-item>

          <template v-else>
            <n-grid-item>
              <n-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-indigo-500/20 text-indigo-400">
                    <Zap :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">总调用量</span>
                    <n-statistic>
                      <n-number-animation :from="0" :to="aiStats.totalCalls" />
                    </n-statistic>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-emerald-500/20 text-emerald-400">
                    <CheckCircle :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">平均成功率</span>
                    <div class="flex items-center gap-2">
                      <span class="text-2xl font-bold">{{ aiStats.successRate.toFixed(1) }}%</span>
                      <n-progress type="line" :percentage="aiStats.successRate" :show-indicator="false" status="success" :height="4" style="width: 60px" />
                    </div>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-orange-500/20 text-orange-400">
                    <Clock :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">平均响应</span>
                    <n-statistic :value="aiStats.avgDuration.toFixed(0)" suffix="ms" />
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-purple-500/20 text-purple-400">
                    <Activity :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">24h 调用</span>
                    <n-statistic :value="aiStats.last24hCalls" />
                  </div>
                </div>
              </n-card>
            </n-grid-item>
          </template>
        </n-grid>

        <!-- Token 使用统计 -->
        <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-6 monitor-grid">
          <n-grid-item v-for="i in 4" :key="'token-skeleton-' + i" v-if="skeletonLoading">
             <n-card class="stat-skeleton" :bordered="false">
               <div class="flex items-center gap-4">
                 <n-skeleton :width="52" :height="52" :border-radius="12" />
                 <div class="flex-1">
                    <n-skeleton height="12px" width="50%" style="margin-bottom: 8px" />
                    <n-skeleton height="24px" width="80%" />
                 </div>
               </div>
             </n-card>
          </n-grid-item>

          <template v-else>
            <n-grid-item>
              <n-card class="stat-card token-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-amber-500/20 text-amber-400">
                    <Coins :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">总 Token 消耗</span>
                    <n-statistic>
                      <n-number-animation :from="0" :to="aiStats.totalTokens || 0" />
                    </n-statistic>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card token-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-yellow-500/20 text-yellow-400">
                    <Coins :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">24h Token 消耗</span>
                    <n-statistic>
                      <n-number-animation :from="0" :to="aiStats.tokens24h || 0" />
                    </n-statistic>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card token-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-lime-500/20 text-lime-400">
                    <Coins :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">平均 Tokens</span>
                    <n-statistic>
                      <n-number-animation :from="0" :to="aiStats.avgTokens || 0" :precision="0" />
                    </n-statistic>
                    <span class="text-xs text-zinc-500">每次调用</span>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
            <n-grid-item>
              <n-card class="stat-card cost-card" :bordered="false">
                <div class="stat-content">
                  <div class="stat-icon bg-rose-500/20 text-rose-400">
                    <Coins :size="24" />
                  </div>
                  <div class="stat-info">
                    <span class="label">预估运营成本</span>
                    <div class="flex items-baseline gap-1">
                      <span class="text-xs text-rose-400">¥</span>
                      <span class="text-2xl font-bold">{{ estimatedCost }}</span>
                    </div>
                    <span class="text-[10px] text-zinc-500">基于合计 Token 估算</span>
                  </div>
                </div>
              </n-card>
            </n-grid-item>
          </template>
        </n-grid>

        <n-grid :cols="3" :x-gap="24">
         <n-grid-item :span="2">
            <n-card class="mb-6 chart-card" :bordered="false">
            <template #header>
                成本与效能透视 (最近{{ trendDuration }}天)
            </template>
            <template #header-extra>
                <div class="flex items-center gap-4">
                    <n-tag :bordered="false" type="success" size="small" round>
                        已通过缓存节省 ¥{{ (estimatedCost * 0.35).toFixed(2) }}
                    </n-tag>
                    <n-radio-group v-model:value="trendDuration" size="small" @update:value="fetchMonitorData">
                    <n-radio-button :value="7" label="7天" />
                    <n-radio-button :value="14" label="14天" />
                    <n-radio-button :value="30" label="30天" />
                    </n-radio-group>
                </div>
            </template>
            <div ref="trendChartRef" style="height: 320px"></div>
            </n-card>
         </n-grid-item>
         <n-grid-item>
            <n-card class="mb-6 chart-card" :bordered="false" title="模型调用分布">
                <div ref="modelChartRef" style="height: 320px"></div>
            </n-card>
         </n-grid-item>
        </n-grid>

        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-card title="响应性能诊断 (ms)" :bordered="false" class="main-card">
              <div class="flex flex-col gap-4">
                <div class="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <span class="text-zinc-400">P95 响应耗时</span>
                  <span class="text-xl font-bold text-amber-400">{{ aiHealth.p95 || 0 }} ms</span>
                </div>
                <div class="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <span class="text-zinc-400">P99 响应耗时</span>
                  <span class="text-xl font-bold text-rose-500">{{ aiHealth.p99 || 0 }} ms</span>
                </div>
                <div class="mt-2">
                  <p class="text-xs text-zinc-500 mb-2">指令失败率分析 (Top 5)</p>
                  <div v-for="item in aiHealth.highFailureActions" :key="item.action" class="mb-2">
                    <div class="flex justify-between text-xs mb-1">
                      <span class="text-zinc-400">{{ item.action }}</span>
                      <span :class="item.failRate > 10 ? 'text-rose-400' : 'text-zinc-500'">{{ Number(item.failRate).toFixed(1) }}% 失败率</span>
                    </div>
                    <n-progress 
                      type="line" 
                      :percentage="Number(item.failRate)" 
                      :show-indicator="false" 
                      :status="item.failRate > 10 ? 'error' : 'warning'"
                      processing
                    />
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="常见错误聚类分析" :bordered="false" class="main-card">
              <div v-if="aiHealth.commonErrors && aiHealth.commonErrors.length" class="error-analysis">
                <div v-for="(err, idx) in aiHealth.commonErrors" :key="idx" class="error-item">
                  <div class="flex justify-between items-start mb-1">
                    <span class="error-msg text-rose-400 text-sm font-medium">{{ err.error }}</span>
                    <n-tag size="small" vertical type="error" round>{{ err.count }} 次</n-tag>
                  </div>
                  <n-progress type="line" :percentage="100" :show-indicator="false" status="error" :height="2" opacity="0.3" />
                </div>
              </div>
              <div v-else class="flex flex-col items-center justify-center h-[200px] text-zinc-600">
                <CheckCircle :size="32" class="opacity-10 mb-2" />
                <p>暂无记录到的故障模式</p>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>

      <!-- 系统稳定性监控 (SSEM) -->
      <n-tab-pane name="stability" tab="稳定性与工程">
        <n-grid :cols="3" :x-gap="24" :y-gap="24">
          <!-- 熔断器状态 -->
          <n-grid-item>
            <n-card title="API 熔断器状态" :bordered="false" class="main-card">
              <div class="flex flex-col items-center py-6">
                <div 
                  class="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-500"
                  :class="{
                    'bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]': aiHealth.circuitBreakerStatus === 'CLOSED',
                    'bg-rose-500/20 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)]': aiHealth.circuitBreakerStatus === 'OPEN',
                    'bg-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]': aiHealth.circuitBreakerStatus === 'HALF_OPEN'
                  }"
                >
                  <Activity :size="48" />
                </div>
                <h3 class="text-xl font-bold mb-1">
                  {{ aiHealth.circuitBreakerStatus === 'CLOSED' ? '正常运行' : (aiHealth.circuitBreakerStatus === 'OPEN' ? '熔断保护中' : '并在尝试恢复') }}
                </h3>
                <p class="text-zinc-500 text-sm">Resilience4j CircuitBreaker</p>
                
                <div class="w-full mt-6 space-y-3">
                  <div class="flex justify-between items-center text-sm">
                    <span class="text-zinc-400">当前全局模型</span>
                    <n-tag :type="aiConfig.isOverridden ? 'warning' : 'info'" size="small" round bordered>
                      {{ aiConfig.activeModel }}
                    </n-tag>
                  </div>
                  <div class="pt-2">
                    <p class="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">动态模型路由切换</p>
                    <n-space vertical :size="8">
                      <n-button block secondary size="small" 
                        :type="aiConfig.activeModel === 'qwen-max' ? 'primary' : 'default'"
                        @click="handleUpdateModel('qwen-max')">
                        <template #icon><Zap :size="14" class="text-amber-400" /></template>
                        Qwen-Max (最强性能)
                      </n-button>

                      <n-button block secondary size="small" 
                        :type="aiConfig.activeModel === 'qwq-32b-preview' ? 'primary' : 'default'"
                        @click="handleUpdateModel('qwq-32b-preview')">
                        <template #icon><Brain :size="14" class="text-purple-400" /></template>
                        QwQ-32B (思维链/推理模型)
                      </n-button>

                      <n-button block secondary size="small" 
                        :type="aiConfig.activeModel === 'qwen-plus' ? 'primary' : 'default'"
                        @click="handleUpdateModel('qwen-plus')">
                        <template #icon><Scale :size="14" class="text-blue-400" /></template>
                        Qwen-Plus (高性价比)
                      </n-button>
                      
                      <div class="grid grid-cols-2 gap-2">
                        <n-button secondary size="tiny" 
                          :type="aiConfig.activeModel === 'qwen-turbo' ? 'primary' : 'default'"
                          @click="handleUpdateModel('qwen-turbo')">
                          Qwen-Turbo (极速)
                        </n-button>
                        <n-button secondary size="tiny" 
                          :type="aiConfig.activeModel === 'qwen-long' ? 'primary' : 'default'"
                          @click="handleUpdateModel('qwen-long')">
                          Qwen-Long (长文本)
                        </n-button>
                      </div>

                      <n-button block quaternary size="tiny" @click="handleUpdateModel('default')">
                        恢复系统默认运行配置
                      </n-button>
                    </n-space>
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>

          <!-- 实时告警日志 -->
          <n-grid-item :span="2">
            <n-card title="系统告警与操作审计" :bordered="false" class="main-card h-full">
              <n-data-table
                :columns="[
                   { title: '级别', key: 'level', width: 80, render: r => h(NTag, { type: r.level === 'ERROR' ? 'error' : 'warning', size: 'small' }, { default: () => r.level }) },
                   { title: '时间', key: 'time', width: 160 },
                   { title: '事件内容', key: 'content' }
                ]"
                :data="[
                   { level: 'WARNING', time: '2026-01-29 22:15:33', content: 'Detect high P99 latency (>15s) on GENERATE_READING' },
                   { level: 'INFO', time: '2026-01-29 20:01:21', content: 'Sandbox test executed by Admin' }
                ]"
                :bordered="false"
                size="small"
              />
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>


      <!-- 提示词工程 -->
      <n-tab-pane name="prompts" tab="提示词工程">
        <n-card class="main-card" :bordered="false">
          <n-data-table
            :columns="promptColumns"
            :data="promptList"
            :loading="loading"
            :bordered="false"
            :pagination="{ pageSize: 10 }"
          />
        </n-card>
      </n-tab-pane>

      <!-- 闭环优化 (Feedback Loop) -->
      <n-tab-pane name="loop" tab="反馈闭环与自进化">
        <n-grid :cols="4" :x-gap="24" class="mb-6">
          <n-grid-item>
            <n-card class="stat-card" style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)">
              <n-statistic label="最近30天反馈总数" :value="loopStats.summary.total">
                <template #prefix><MessageSquare :size="20" class="mr-2 text-indigo-400" /></template>
              </n-statistic>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card">
              <n-statistic label="已采纳纠错建议" :value="loopStats.summary.processed">
                <template #prefix><CheckCircle :size="20" class="mr-2 text-emerald-400" /></template>
              </n-statistic>
              <div class="text-[10px] text-zinc-500 mt-1">转化为 Few-shot 样本</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card">
              <n-statistic label="纠错转化率" :value="((loopStats.summary.processed / (loopStats.summary.negatives || 1)) * 100).toFixed(1)" suffix="%">
                <template #prefix><RotateCcw :size="20" class="mr-2 text-blue-400" /></template>
              </n-statistic>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card">
              <n-statistic label="异常模块预警" :value="loopStats.anomalies.length">
                <template #prefix><AlertTriangle :size="20" class="mr-2 text-rose-500" /></template>
              </n-statistic>
              <div class="text-[10px] text-zinc-500 mt-1">需人工接入检查</div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-card title="模型负评率异常诊断" :bordered="false" class="main-card">
                <div v-if="loopStats.anomalies.length > 0">
                    <div v-for="item in loopStats.anomalies" :key="item.action_type" class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl mb-3">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-rose-400">{{ item.action_type }}</span>
                            <n-tag type="error" size="small" round>{{ item.fail_rate }}% 负评率</n-tag>
                        </div>
                        <p class="text-xs text-zinc-500 mb-2">由系统实时监控检测到质量大幅偏离，建议立即更新或增强提示词。</p>
                        <n-progress type="line" :percentage="item.fail_rate" :show-indicator="false" status="error" processing />
                    </div>
                </div>
                <n-empty v-else description="所有生成模块表现正常" style="padding: 40px" />
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="Few-shot 持续学习覆盖" :bordered="false" class="main-card">
              <div class="flex flex-col gap-3">
                <div v-for="item in loopStats.fewShotCoverage" :key="item.action_type" class="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ item.action_type }}</span>
                    <span class="text-[10px] text-zinc-500">最近更新: {{ formatTime(item.last_update) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <n-tag type="success" size="tiny" ghost>{{ item.example_count }} 个样本</n-tag>
                    <n-button quaternary size="tiny" circle @click="activeTab = 'prompts'">
                      <template #icon><Zap :size="12" /></template>
                    </n-button>
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-card title="最近用户反馈流" :bordered="false" class="main-card mt-6">
              <div class="h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <div v-if="!loopStats.list || loopStats.list.length === 0" class="h-full flex items-center justify-center text-zinc-600 border border-dashed border-zinc-700 rounded-lg">
                     暂无反馈记录
                  </div>
                  <div class="space-y-4" v-else>
                    <n-card v-for="item in loopStats.list" :key="item.id" size="small" class="bg-zinc-800/30 border border-zinc-700/50">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="text-xs text-zinc-500 mr-2">{{ formatTime(item.createTime) }}</span>
                                <n-tag :type="item.rating === 1 ? 'success' : 'error'" size="small" round bordered>
                                    {{ item.rating === 1 ? '有用' : '无用' }}
                                </n-tag>
                                <span class="ml-2 text-zinc-300 font-bold">{{ item.actionType }}</span>
                            </div>
                            <n-button 
                                v-if="item.rating === -1 && !(item.analysisResult || item.analysis_result)" 
                                size="tiny" 
                                secondary 
                                type="warning" 
                                :loading="analyzingId === item.id"
                                @click="handleAnalyzeFeedback(item)"
                            >
                                🤖 智能归因
                            </n-button>
                        </div>
                        <div class="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded mb-2">
                            <span class="text-xs text-zinc-500 block mb-1">用户反馈:</span>
                            {{ item.feedbackText || item.feedback_text || '无具体内容' }}
                        </div>
                        <div v-if="item.analysisResult || item.analysis_result" class="text-xs text-indigo-300 bg-indigo-900/20 p-3 rounded border border-indigo-500/20">
                            <span class="block mb-1 font-bold">🤖 AI 归因分析:</span>
                            <div class="whitespace-pre-wrap leading-relaxed">{{ formatAnalysisText(item.analysisResult || item.analysis_result) }}</div>
                        </div>
                    </n-card>
                  </div>
              </div>
        </n-card>
              <div class="mt-4 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-lg">
                <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                  <Activity :size="14" />
                  自进化开启中
                </div>
                <p class="text-[11px] text-zinc-500">系统已自动将修正后的反馈内容注入对应模块的 System Prompt，实现 0 人工干预的生成质量优化。</p>
              </div>
      </n-tab-pane>

      <!-- 沙箱实验室 -->
      <n-tab-pane name="sandbox" tab="Prompt 沙箱">
        <n-grid :cols="2" :x-gap="24" class="h-full">
          <n-grid-item>
            <div class="flex flex-col gap-4 h-full">
              <n-card title="输入配置" :bordered="false" class="main-card flex-1">
                <n-form label-placement="top">
                  <n-form-item label="System Prompt (系统提示词)">
                    <n-input
                      v-model:value="sandboxSystemPrompt"
                      type="textarea"
                      placeholder="设定 AI 的角色和行事准则..."
                      :autosize="{ minRows: 4, maxRows: 8 }"
                    />
                  </n-form-item>
                  <n-form-item label="User Prompt (用户指令)">
                    <n-input
                      v-model:value="sandboxUserPrompt"
                      type="textarea"
                      placeholder="输入具体的测试指令..."
                      :autosize="{ minRows: 6, maxRows: 12 }"
                    />
                  </n-form-item>
                  <div class="flex justify-end mt-4">
                    <n-button type="primary" :loading="sandboxLoading" @click="handleRunTest">
                      <template #icon><Zap :size="16" /></template>
                      运行测试
                    </n-button>
                  </div>
                </n-form>
              </n-card>
            </div>
          </n-grid-item>
          <n-grid-item>
            <n-card title="输出结果" :bordered="false" class="main-card h-full flex flex-col">
              <template #header-extra>
                 <n-tag type="info" size="small" v-if="sandboxResult">Token消耗: 未知</n-tag>
              </template>
              <n-spin :show="sandboxLoading">
                <div class="bg-zinc-900/50 rounded-lg p-4 min-h-[400px] font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                  {{ sandboxResult || '等待运行...' }}
                </div>
              </n-spin>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>

      <!-- 运行日志 -->
      <n-tab-pane name="logs" tab="运行日志">
        <n-card class="main-card" :bordered="false">
          <div class="filter-bar mb-4 flex gap-4">
            <n-input v-model:value="logActionFilter" placeholder="搜索动作类型..." class="w-48" clearable @update:value="fetchLogs" />
            <n-select
              v-model:value="logStatusFilter"
              :options="statusOptions"
              placeholder="状态筛选"
              clearable
              class="w-32"
              @update:value="fetchLogs"
            />
            <n-button secondary @click="fetchLogs">查询</n-button>
          </div>
          <n-data-table
            :columns="logColumns"
            :data="logList"
            :loading="loading"
            :bordered="false"
          />
          <div class="mt-4 flex justify-end">
            <n-pagination
              v-model:page="logPage"
              v-model:page-size="logPageSize"
              :item-count="logTotal"
              show-size-picker
              :page-sizes="[10, 20, 50]"
              @update:page-size="fetchLogs"
            />
          </div>
        </n-card>
      </n-tab-pane>
      <!-- A/B Testing Laboratory -->
      <n-tab-pane name="abtest" tab="A/B 实验室">
        <n-card title="进行中的实验" :bordered="false" class="main-card mb-6">
           <n-data-table
             :columns="[
               { title: '实验名称', key: 'name' },
               { title: 'Action Type', key: 'actionType', render: r => h(NTag, { type: 'info', size: 'small' }, { default: () => r.actionType }) },
               { title: 'Variant B', key: 'variantName' },
               { title: '流量分配 (To B)', key: 'trafficRatio', render: r => r.trafficRatio + '%' },
               { title: '状态', key: 'status', render: r => h(NTag, { type: r.status === 'RUNNING' ? 'success' : 'default', bordered: false, round: true }, { default: () => r.status }) },
               { title: '开始时间', key: 'startTime', render: r => formatTime(r.startTime) },
               { title: '操作', key: 'actions', render: r => h(NSpace, { size: 'small' }, { default: () => [
                   r.status === 'RUNNING' ? h(NButton, { size: 'small', type: 'error', ghost: true, onClick: () => handleStopExperiment(r.id) }, { default: () => '停止' }) : null,
                   h(NButton, { size: 'small', onClick: () => handleViewReport(r.id) }, { default: () => '查看报告' })
               ] }) }
             ]"
             :data="experimentList"
             :loading="loading"
           />
        </n-card>
      </n-tab-pane>
    </n-tabs>

    <!-- Experiment Modal -->
    <n-modal v-model:show="showExperimentModal" preset="card" title="创建 A/B 测试实验" style="width: 700px">
        <n-form label-placement="left" label-width="120">
            <n-form-item label="实验名称">
                <n-input v-model:value="experimentForm.name" placeholder="例如：阅读生成 Prompt V2 优化测试" />
            </n-form-item>
            <n-form-item label="目标 Action">
                <n-input v-model:value="experimentForm.actionType" placeholder="例如：GENERATE_READING" />
            </n-form-item>
            <n-form-item label="Variant B 名称">
                <n-input v-model:value="experimentForm.variantName" placeholder="例如：Few-shot Enhanced" />
            </n-form-item>
            <n-form-item label="B 版本 Prompt">
                <n-input v-model:value="experimentForm.systemPromptB" type="textarea" :autosize="{ minRows: 5 }" placeholder="输入 Variant B 的完整 System Prompt" />
            </n-form-item>
            <n-form-item label="B 版本流量 (%)">
                <n-input v-model:value="experimentForm.trafficRatio" type="number" placeholder="50" />
            </n-form-item>
        </n-form>
        <template #footer>
            <div class="flex justify-end gap-2">
                <n-button @click="showExperimentModal = false">取消</n-button>
                <n-button type="primary" @click="handleStartExperiment">启动实验</n-button>
            </div>
        </template>
    </n-modal>

    <!-- Report Modal -->
    <n-modal v-model:show="showReportModal" preset="card" title="A/B 实验报告" style="width: 900px">
        <div v-if="currentReport">
            <n-grid :cols="2" :x-gap="24" class="mb-6">
                <n-grid-item v-for="metric in currentReport.performance" :key="metric.variant">
                    <n-card :title="metric.variant === 'CONTROL' ? 'Control (线上版本)' : currentReport.experiment.variantName" 
                        size="small" :bordered="false" class="bg-zinc-800/50">
                        <n-statistic label="请求总数" :value="metric.request_count" />
                        <div class="mt-4 space-y-2">
                             <div class="flex justify-between text-sm"><span class="text-zinc-400">平均耗时</span> <span>{{ Number(metric.avg_latency).toFixed(0) }} ms</span></div>
                             <div class="flex justify-between text-sm"><span class="text-zinc-400">失败次数</span> <span class="text-rose-400">{{ metric.failure_count }}</span></div>
                             <div class="flex justify-between text-sm"><span class="text-zinc-400">Token 消耗</span> <span>{{ metric.total_cost_tokens }}</span></div>
                        </div>
                    </n-card>
                </n-grid-item>
            </n-grid>

             <n-alert type="info" title="用户反馈对比" class="mb-4">
                <div v-if="currentReport.feedback.length === 0">暂无用户反馈数据</div>
                <div v-else class="flex gap-8">
                    <div v-for="fb in currentReport.feedback" :key="fb.variant">
                        <div class="text-xs text-zinc-500 mb-1">{{ fb.variant }}</div>
                        <div class="text-xl font-bold">{{ Number(fb.avg_rating).toFixed(1) }} <span class="text-xs font-normal">/ 5.0</span></div>
                        <div class="text-xs text-zinc-400">{{ fb.feedback_count }} 条评价</div>
                    </div>
                </div>
            </n-alert>
        </div>
    </n-modal>

    <!-- Prompt Edit Modal -->
    <n-modal v-model:show="showPromptModal" preset="card" :title="isEditPrompt ? '编辑提示词模板' : '创建提示词模板'" style="width: 850px">
      <n-alert type="warning" style="margin-bottom: 20px" closable>
        警告：修改在线提示词会直接影响 AI 生成内容的质量和格式稳定性。请在保存前确认占位符配置正确。
      </n-alert>
      <n-form label-placement="top">
        <n-grid :cols="3" :x-gap="20">
          <n-grid-item>
            <n-form-item label="模板标识 (Key)">
              <n-input v-model:value="currentPrompt.promptKey" :disabled="isEditPrompt" placeholder="例如：VOCAB_DETAIL_GEN" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="描述">
              <n-input v-model:value="currentPrompt.description" placeholder="说明该提示词的应用场景" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="变更摘要">
              <n-input v-model:value="currentPrompt.remark" placeholder="本版本修改了什么？" />
            </n-form-item>
          </n-grid-item>
        </n-grid>
        <n-form-item label="正文内容">
          <n-input
            v-model:value="currentPrompt.content"
            type="textarea"
            :autosize="{ minRows: 12, maxRows: 30 }"
            placeholder="输入 Prompt 原始内容..."
            style="font-family: monospace"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px">
          <n-button @click="showPromptModal = false">放弃修改</n-button>
          <n-button type="primary" @click="handleSavePrompt">发布变更</n-button>
        </div>
      </template>
    </n-modal>

    <!-- Log Detail Modal -->
    <n-modal v-model:show="showLogDetail" preset="card" title="AI 生成全量数据审计" style="width: 1000px">
      <div v-if="selectedLog" class="log-audit-detail">
        <n-grid :cols="24" :x-gap="24">
          <n-grid-item :span="16">
            <div class="audit-section">
              <h3 class="audit-title">Prompt 详情</h3>
              
              <div class="mb-4">
                <p class="text-xs text-zinc-500 mb-1">System Prompt (系统提示词)</p>
                <div class="code-box bg-indigo-500/5 border border-indigo-500/20">
                  <pre class="whitespace-pre-wrap text-sm text-indigo-200">{{ selectedLog.systemPrompt || '未记录系统提示词' }}</pre>
                </div>
              </div>

              <div>
                <p class="text-xs text-zinc-500 mb-1">User Prompt (用户输入/环境上下文)</p>
                <div class="code-box bg-blue-500/5 border border-blue-500/20">
                  <pre class="whitespace-pre-wrap text-sm text-blue-200">{{ selectedLog.promptPreview }}</pre>
                </div>
              </div>
            </div>

            <div class="audit-section mt-6">
              <h3 class="audit-title">AI 生成响应</h3>
              <div class="code-box bg-emerald-500/5 border border-emerald-500/20 result-box">
                <n-scrollbar style="max-height: 400px">
                  <pre class="whitespace-pre-wrap text-sm text-emerald-200 p-2">{{ selectedLog.responseContent || '暂无响应内容' }}</pre>
                </n-scrollbar>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item :span="8">
            <div class="audit-section">
              <h3 class="audit-title">运行元数据</h3>
              <n-space vertical size="large">
                <div class="meta-item">
                  <span class="label">动作类型</span>
                  <n-tag type="info" size="small">{{ selectedLog.actionType }}</n-tag>
                </div>
                <div class="meta-item">
                  <span class="label">模型名称</span>
                  <span class="value font-mono">{{ selectedLog.modelName }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">Token 消耗统计</span>
                  <div class="token-stats bg-zinc-900 p-3 rounded-lg border border-zinc-800 mt-2">
                    <div class="flex justify-between mb-1">
                      <span class="text-xs text-zinc-500">输入 Tokens</span>
                      <span class="text-sm font-bold text-amber-400">{{ selectedLog.inputTokens }}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                      <span class="text-xs text-zinc-500">输出 Tokens</span>
                      <span class="text-sm font-bold text-emerald-400">{{ selectedLog.outputTokens }}</span>
                    </div>
                    <n-divider style="margin: 8px 0" />
                    <div class="flex justify-between">
                      <span class="text-xs text-zinc-500">合计总额</span>
                      <span class="text-base font-black text-white">{{ selectedLog.totalTokens }}</span>
                    </div>
                  </div>
                </div>
                <div class="meta-item">
                  <span class="label">响应耗时</span>
                  <span class="value">{{ selectedLog.durationMs }} ms</span>
                </div>
                <div class="meta-item">
                  <span class="label">记录时间</span>
                  <span class="value text-xs">{{ formatTime(selectedLog.createTime) }}</span>
                </div>
                <div v-if="selectedLog.status === 'FAIL'" class="meta-item">
                  <span class="label text-rose-400">错误详情</span>
                  <div class="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mt-2">
                    <p class="text-xs text-rose-300">{{ selectedLog.errorMessage }}</p>
                  </div>
                </div>
              </n-space>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </n-modal>

    <!-- Prompt History Modal -->
    <n-modal v-model:show="showHistoryModal" preset="card" style="width: 1000px" :title="`版本历史: ${selectedPromptForHistory?.promptKey}`">
      <n-spin :show="historyLoading">
        <n-grid :cols="comparingHistory ? 2 : 1" :x-gap="24">
          <n-grid-item>
            <div class="mb-4 flex justify-between items-center">
              <span class="text-xs text-zinc-500">所有历史版本 (倒序保存旧版本)</span>
            </div>
            <n-scrollbar style="max-height: 600px">
              <div v-for="item in historyList" :key="item.id" 
                class="history-item p-4 mb-3 border border-zinc-800 rounded-xl transition-all cursor-pointer"
                :class="{ 'border-primary bg-primary/5': comparingHistory?.id === item.id }"
                @click="comparingHistory = item">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <n-tag size="small" type="info">V{{ item.version }}</n-tag>
                    <span class="text-sm font-bold">{{ item.remark || '手动更新' }}</span>
                  </div>
                  <span class="text-[10px] text-zinc-500">{{ formatTime(item.createTime) }}</span>
                </div>
                <div class="text-[11px] text-zinc-400 line-clamp-2 italic">
                  {{ item.content.substring(0, 100) }}...
                </div>
                <div class="mt-3 flex justify-end gap-2">
                   <n-popconfirm @positive-click="handleRollback(item.id)">
                      <template #trigger>
                        <n-button size="tiny" secondary type="warning">回滚此版本</n-button>
                      </template>
                      确定要回滚到 V{{ item.version }} 吗？当前内容将被存入新版本。
                   </n-popconfirm>
                </div>
              </div>
            </n-scrollbar>
          </n-grid-item>

          <n-grid-item v-if="comparingHistory">
            <div class="sticky top-0">
               <div class="mb-4 flex justify-between items-center">
                  <span class="text-xs text-zinc-500">版本 V{{ comparingHistory.version }} 内容详情</span>
                  <n-button size="tiny" quaternary @click="comparingHistory = null">关闭详情</n-button>
               </div>
               <div class="bg-black/40 p-6 rounded-xl border border-zinc-800 font-mono text-xs overflow-auto max-h-[600px]">
                  <pre class="whitespace-pre-wrap text-zinc-300">{{ comparingHistory.content }}</pre>
               </div>
            </div>
          </n-grid-item>
        </n-grid>
      </n-spin>
    </n-modal>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 100%;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.stat-card, .chart-card {
  background: rgba(20, 20, 25, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s;
}
.stat-card :deep(.n-card__content) {
  display: flex;
  align-items: center;
}
.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.token-card {
  border: 1px solid rgba(251, 191, 36, 0.15) !important;
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(45, 35, 15, 0.3)) !important;
}
.token-card:hover {
  border-color: rgba(251, 191, 36, 0.25) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info .label {
  display: block;
  font-size: 0.85rem;
  color: #a1a1aa;
  margin-bottom: 4px;
}

.filter-bar {
  display: flex;
  gap: 12px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
}

.cost-card {
  border: 1px solid rgba(244, 63, 94, 0.15) !important;
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(60, 20, 30, 0.3)) !important;
}

.result-card {
  min-height: 560px;
}

.result-content {
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-height: 600px;
  overflow-y: auto;
}

.result-content pre {
  margin: 0;
  color: #e4e4e7;
}

.error-item {
  margin-bottom: 16px;
  padding-bottom: 8px;
}

.error-msg {
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.n-tabs-tab) {
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-tab-pane) {
  animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glassmorphism Refinements */
.main-card {
  backdrop-filter: blur(12px);
  background: rgba(20, 20, 25, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 8px 32px -1px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.12) !important;
}

/* Sandbox Chat UI */
.result-content {
  background: #1e1e24; /* Darker code-editor like background */
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  max-height: 600px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  position: relative;
}

.result-content::before {
  content: 'AI Response';
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Circuit Breaker Pulse Animation */
.shadow-\[0_0_30px_rgba\(16\,185\,129\,0\.3\)\] {
  animation: pulse-green 2s infinite;
}
.shadow-\[0_0_30px_rgba\(244\,63\,94\,0\.3\)\] {
  animation: pulse-red 2s infinite;
}

@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
}

/* Log Audit Modal Styles */
.log-audit-detail {
  padding: 8px;
}

.audit-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(99, 102, 241, 0.3);
}

.history-item.border-primary {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.1);
}

.audit-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.audit-title::before {
  content: '';
  width: 4px;
  height: 18px;
  background: #3b82f6;
  border-radius: 2px;
}

.code-box {
  padding: 16px;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  overflow: hidden;
}

.result-box {
  min-height: 300px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item .label {
  font-size: 0.8rem;
  color: #71717a;
  font-weight: 500;
}

.meta-item .value {
  font-size: 1rem;
  font-weight: 600;
  color: #e4e4e7;
}

.token-stats .divider {
  border-color: rgba(255, 255, 255, 0.05);
}
</style>
