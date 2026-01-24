<script setup>
import { ref, onMounted, h, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, NTabs, NTabPane, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NTag, NSelect, NPopconfirm, NAlert,
  NGrid, NGridItem, NStatistic, NNumberAnimation, NSpin, NProgress, NRadioGroup, NRadioButton,
  NScrollbar, NDivider
} from 'naive-ui'
import { Edit, RefreshCcw, Plus, Trash, Zap, Activity, CheckCircle, XCircle, Clock, Coins, Eye } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(false)
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

const estimatedCost = computed(() => {
  if (!aiStats.value.modelUsage || !aiStats.value.modelUsage.length) {
    return (aiStats.value.totalTokens * 0.0000015).toFixed(4)
  }

  let totalRMB = 0
  const pricing = {
    'qwen-max': { input: 0.04, output: 0.12 },
    'qwen-plus': { input: 0.0008, output: 0.002 },
    'qwen-turbo': { input: 0.0003, output: 0.0006 },
    'qwen-long': { input: 0.0005, output: 0.002 }
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
let trendChartInstance = null

// Prompts Data
const promptList = ref([])
const showPromptModal = ref(false)
const isEditPrompt = ref(false)
const currentPrompt = ref({
  id: null,
  promptKey: '',
  description: '',
  content: ''
})

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
    nextTick(() => {
      renderTrendChart()
    })
  } catch (error) {
    message.error('加载监控数据失败')
  }
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  trendChartInstance = echarts.init(trendChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 20, 25, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['成功调用', '失败记录'],
      textStyle: { color: '#a1a1aa' },
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map(item => item.date.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: '#71717a' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#71717a' }
    },
    series: [
      {
        name: '成功调用',
        data: trendData.value.map(item => item.total - item.fail),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        itemStyle: { color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
            { offset: 1, color: 'transparent' }
          ])
        },
        lineStyle: { width: 3 }
      },
      {
        name: '失败记录',
        data: trendData.value.map(item => item.fail),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239, 68, 68, 0.1)' },
            { offset: 1, color: 'transparent' }
          ])
        },
        lineStyle: { width: 2, type: 'dashed' }
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

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

const handleTabChange = (value) => {
  activeTab.value = value
  if (value === 'monitor') {
    fetchMonitorData()
    // 切换回 monitor tab 时，图表容器可能从隐藏变为显示，需要 resize
    nextTick(() => {
      trendChartInstance?.resize()
    })
  } else if (value === 'prompts') {
    fetchPrompts()
  } else if (value === 'logs') {
    fetchLogs()
  }
}

const handleAddPrompt = () => {
  isEditPrompt.value = false
  currentPrompt.value = {
    id: null,
    promptKey: '',
    description: '',
    content: ''
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
}

onMounted(() => {
  fetchMonitorData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
})
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
      </n-space>
    </header>

    <n-tabs v-model:value="activeTab" type="segment" animated @update:value="handleTabChange">
      <!-- 监控面板 -->
      <n-tab-pane name="monitor" tab="全景监控">
        <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-6">
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
        </n-grid>

        <!-- Token 使用统计 -->
        <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-6">
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
        </n-grid>

        <n-card class="mb-6 chart-card" :bordered="false">
          <template #header>
            调用趋势 (最近{{ trendDuration }}天)
          </template>
          <template #header-extra>
            <n-radio-group v-model:value="trendDuration" size="small" @update:value="fetchMonitorData">
              <n-radio-button :value="7" label="7天" />
              <n-radio-button :value="14" label="14天" />
              <n-radio-button :value="30" label="30天" />
            </n-radio-group>
          </template>
          <div ref="trendChartRef" style="height: 400px"></div>
        </n-card>

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
                  <div class="flex justify-between text-sm">
                    <span class="text-zinc-400">当前活跃模型</span>
                    <span class="font-mono text-indigo-400">{{ aiHealth.activeModel }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-zinc-400">最近故障切换</span>
                    <span class="text-zinc-300">{{ aiHealth.lastFailoverTime ? formatTime(aiHealth.lastFailoverTime) : '无记录' }}</span>
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

      <!-- 提示词管理 -->
      <n-tab-pane name="prompts" tab="提示词工程">
        <n-card class="main-card" :bordered="false">
          <n-data-table
            :columns="promptColumns"
            :data="promptList"
            :loading="loading"
            :bordered="false"
          />
        </n-card>
      </n-tab-pane>

      <!-- 运行日志 -->
      <n-tab-pane name="logs" tab="运行日志">
        <n-card class="main-card" :bordered="false">
          <div class="filter-bar mb-4">
            <n-select
              v-model:value="logStatusFilter"
              :options="statusOptions"
              clearable
              placeholder="状态筛选"
              style="width: 150px"
              @update:value="() => { logPage = 1; fetchLogs() }"
            />
            <n-input
              v-model:value="logActionFilter"
              placeholder="动作类型 (如 GENERATE_READING)"
              clearable
              style="width: 250px"
              @change="() => { logPage = 1; fetchLogs() }"
            />
          </div>

          <n-data-table
            :columns="logColumns"
            :data="logList"
            :loading="loading"
            :bordered="false"
            striped
          />

          <div class="pagination mt-4">
            <n-pagination
              v-model:page="logPage"
              :page-count="Math.ceil(logTotal / logPageSize)"
              @update:page="handleLogPageChange"
            />
          </div>
        </n-card>
      </n-tab-pane>

      <!-- 沙箱实验室 -->
      <n-tab-pane name="sandbox" tab="沙箱实验室">
        <n-grid :cols="12" :x-gap="24">
          <n-grid-item :span="5">
            <n-card title="配置 Prompt" :bordered="false" class="main-card">
              <n-form label-placement="top">
                <n-form-item label="System Prompt (角色设定)">
                  <n-input
                    v-model:value="sandboxSystemPrompt"
                    type="textarea"
                    placeholder="例如：你是一个雅思老师..."
                    :autosize="{ minRows: 4, maxRows: 8 }"
                  />
                </n-form-item>
                <n-form-item label="User Prompt (具体输入)">
                  <n-input
                    v-model:value="sandboxUserPrompt"
                    type="textarea"
                    placeholder="输入要发送给 AI 的指令..."
                    :autosize="{ minRows: 10, maxRows: 15 }"
                  />
                </n-form-item>
                <n-button 
                  type="primary" 
                  block 
                  size="large" 
                  :loading="sandboxLoading"
                  @click="handleRunTest"
                >
                  <template #icon><Zap /></template>
                  立即执行测试
                </n-button>
              </n-form>
            </n-card>
          </n-grid-item>
          <n-grid-item :span="7">
            <n-card title="AI 响应结果" :bordered="false" class="main-card result-card">
              <div v-if="sandboxLoading" class="flex flex-col items-center justify-center h-[400px]">
                <n-spin size="large" />
                <p class="mt-4 text-zinc-500">正在与核心引擎进行深度计算...</p>
              </div>
              <div v-else-if="sandboxResult" class="result-content">
                <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed">{{ sandboxResult }}</pre>
              </div>
              <div v-else class="flex flex-col items-center justify-center h-[400px] text-zinc-600">
                <Activity :size="48" class="opacity-10 mb-4" />
                <p>在左侧配置完成后点击执行，结果将实时显示在此处</p>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>
    </n-tabs>

    <!-- Prompt Edit Modal -->
    <n-modal v-model:show="showPromptModal" preset="card" :title="isEditPrompt ? '编辑提示词模板' : '创建提示词模板'" style="width: 850px">
      <n-alert type="warning" style="margin-bottom: 20px" closable>
        警告：修改在线提示词会直接影响 AI 生成内容的质量和格式稳定性。请在保存前确认占位符配置正确。
      </n-alert>
      <n-form label-placement="top">
        <n-grid :cols="2" :x-gap="20">
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
