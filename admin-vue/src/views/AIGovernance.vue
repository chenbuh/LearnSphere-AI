<script setup>
import { ref, onMounted, h, watch, nextTick } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, NTabs, NTabPane, useMessage,
  NSpace, NModal, NForm, NFormItem, NInput, NTag, NSelect, NPopconfirm, NAlert,
  NGrid, NGridItem, NStatistic, NNumberAnimation, NSpin, NProgress
} from 'naive-ui'
import { Edit, RefreshCcw, Plus, Trash, Zap, Activity, CheckCircle, XCircle, Clock, Coins } from 'lucide-vue-next'
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
const trendData = ref([])
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
  { title: '耗时(ms)', key: 'durationMs', width: 100 },
  { title: '错误信息', key: 'errorMessage', width: 200, ellipsis: true }
]

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchMonitorData = async () => {
  try {
    const [statsRes, trendsRes] = await Promise.all([
      adminApi.getAIStats(),
      adminApi.getAITrends(14)
    ])
    aiStats.value = statsRes.data
    trendData.value = trendsRes.data
    renderTrendChart()
  } catch (error) {
    message.error('加载监控数据失败')
  }
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return
  if (!trendChartInstance) {
    trendChartInstance = echarts.init(trendChartRef.value)
  }
  
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
  } else if (value === 'prompts') {
    fetchPrompts()
  } else {
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
  showPromptModal.value = true
}

const handleEditPrompt = (row) => {
  isEditPrompt.value = true
  currentPrompt.value = { ...row }
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

onMounted(() => {
  fetchMonitorData()
  window.addEventListener('resize', () => trendChartInstance?.resize())
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
        <n-grid :cols="3" :x-gap="24" :y-gap="24" class="mb-6">
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
        </n-grid>

        <n-card title="调用趋势 (最近14天)" class="mb-6 chart-card" :bordered="false">
          <div ref="trendChartRef" style="height: 400px"></div>
        </n-card>
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

:deep(.n-tabs-tab) {
  font-size: 1rem;
  font-weight: 600;
}
</style>
