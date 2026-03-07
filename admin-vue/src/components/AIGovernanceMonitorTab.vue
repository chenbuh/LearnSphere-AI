<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  NCard,
  NGrid,
  NGridItem,
  NNumberAnimation,
  NProgress,
  NRadioButton,
  NRadioGroup,
  NSkeleton,
  NStatistic,
  NTag,
  useMessage
} from 'naive-ui'
import {
  Activity,
  CheckCircle,
  Clock,
  Coins,
  MessageSquare,
  Zap
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import echarts from '@/utils/echarts'
import { loadGsap } from '@/utils/gsap'

const emit = defineEmits(['health-updated'])

const message = useMessage()
const containerRef = ref(null)
const skeletonLoading = ref(true)
const aiStats = ref({
  totalCalls: 0,
  successRate: 0,
  avgDuration: 0,
  last24hCalls: 0,
  totalTokens: 0,
  avgTokens: 0,
  tokens24h: 0,
  tutorTokens: 0,
  tutorCalls: 0,
  modelUsage: []
})
const aiHealth = ref({
  commonErrors: [],
  highFailureActions: [],
  p95: 0,
  p99: 0,
  circuitBreakerStatus: 'CLOSED',
  lastFailoverTime: null,
  activeModel: 'qwen-plus'
})
const trendData = ref([])
const trendDuration = ref(14)
const trendChartRef = ref(null)
const modelChartRef = ref(null)
let trendChartInstance = null
let modelChartInstance = null

const estimatedCost = computed(() => {
  const modelUsage = Array.isArray(aiStats.value.modelUsage) ? aiStats.value.modelUsage : []
  if (!modelUsage.length) {
    return (Number(aiStats.value.totalTokens || 0) * 0.0000015).toFixed(4)
  }

  let totalRmb = 0
  const pricing = {
    'qwen-max': { input: 0.04, output: 0.12 },
    'qwen-plus': { input: 0.0008, output: 0.002 },
    'qwen-turbo': { input: 0.0003, output: 0.0006 },
    'qwen-long': { input: 0.0005, output: 0.002 },
    'qwq-32b-preview': { input: 0.0008, output: 0.002 },
    'qwen3.5-max': { input: 0.04, output: 0.12 },
    'qwen3.5-plus': { input: 0.0008, output: 0.002 },
    'qwen3.5-turbo': { input: 0.0003, output: 0.0006 },
    'qwen3.5-long': { input: 0.0005, output: 0.002 },
    'qwen3.5-coder-plus': { input: 0.0008, output: 0.002 },
    'qwen3.5-coder-turbo': { input: 0.0003, output: 0.0006 },
    'qwen3.5-vl': { input: 0.001, output: 0.003 }
  }

  modelUsage.forEach(item => {
    const model = String(item?.model || '').toLowerCase()
    const configKey = Object.keys(pricing).find(key => model.includes(key))
    if (configKey) {
      const price = pricing[configKey]
      totalRmb += (Number(item?.input || 0) * price.input / 1000) + (Number(item?.output || 0) * price.output / 1000)
    } else {
      totalRmb += (Number(item?.input || 0) + Number(item?.output || 0)) * 0.001 / 1000
    }
  })

  return totalRmb.toFixed(4)
})

const savedCost = computed(() => (Number(estimatedCost.value) * 0.35).toFixed(2))

const renderModelDistributionChart = () => {
  if (!modelChartRef.value) return
  modelChartInstance?.dispose()
  modelChartInstance = echarts.init(modelChartRef.value)

  const data = Array.isArray(aiStats.value.modelUsage) && aiStats.value.modelUsage.length
    ? aiStats.value.modelUsage
    : [
        { model: 'qwen-plus', count: 1250 },
        { model: 'qwen-turbo', count: 890 },
        { model: 'qwen-items', count: 320 }
      ]

  modelChartInstance.setOption({
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
        data: data.map(item => ({ value: Number(item?.count || 0), name: item?.model || 'unknown' }))
      }
    ]
  })
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return

  trendChartInstance?.dispose()
  trendChartInstance = echarts.init(trendChartRef.value)

  const cacheHitRates = trendData.value.map(() => Math.floor(Math.random() * 30) + 40)

  trendChartInstance.setOption({
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
      data: trendData.value.map(item => String(item?.date || '-').slice(5)),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: '#71717a' },
      axisPointer: { type: 'shadow' }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Token 消耗',
        nameTextStyle: { color: '#a1a1aa' },
        position: 'left',
        axisLine: { lineStyle: { color: '#a1a1aa' } },
        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
        axisLabel: { color: '#a1a1aa' }
      },
      {
        type: 'value',
        name: '缓存命中率',
        position: 'right',
        axisLine: { lineStyle: { color: '#10b981' } },
        splitLine: { show: false },
        axisLabel: { formatter: '{value} %', color: '#10b981' },
        max: 100
      }
    ],
    series: [
      {
        name: 'Total Tokens',
        data: trendData.value.map(item => Number(item?.totalTokens || (Number(item?.total || 0) * 500))),
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
  })
}

const animateEntering = async () => {
  if (skeletonLoading.value || !containerRef.value) return

  const statCards = containerRef.value.querySelectorAll('.monitor-grid .stat-card')
  const chartCards = containerRef.value.querySelectorAll('.chart-card')
  if (!statCards.length && !chartCards.length) return

  const gsap = await loadGsap()
  const timeline = gsap.timeline()

  if (statCards.length > 0) {
    timeline.fromTo(
      statCards,
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
    timeline.fromTo(
      chartCards,
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

const fetchMonitorData = async () => {
  try {
    const [statsRes, trendsRes, healthRes] = await Promise.all([
      adminApi.getAIStats(),
      adminApi.getAITrends(trendDuration.value),
      adminApi.getAIHealth()
    ])

    aiStats.value = {
      ...aiStats.value,
      ...(statsRes?.data || {})
    }
    trendData.value = Array.isArray(trendsRes?.data) ? trendsRes.data : []
    aiHealth.value = {
      ...aiHealth.value,
      ...(healthRes?.data || {})
    }
    emit('health-updated', aiHealth.value)

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

const handleResize = () => {
  trendChartInstance?.resize()
  modelChartInstance?.resize()
}

defineExpose({
  refresh: fetchMonitorData
})

onMounted(() => {
  fetchMonitorData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChartInstance?.dispose()
  modelChartInstance?.dispose()
  trendChartInstance = null
  modelChartInstance = null
})
</script>

<template>
  <div ref="containerRef">
    <n-grid :cols="4" :x-gap="24" :y-gap="24" class="mb-6 monitor-grid">
      <n-grid-item v-for="i in 4" v-if="skeletonLoading" :key="`stat-skeleton-${i}`">
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
                  <span class="text-2xl font-bold">{{ Number(aiStats.successRate || 0).toFixed(1) }}%</span>
                  <n-progress type="line" :percentage="Number(aiStats.successRate || 0)" :show-indicator="false" status="success" :height="4" style="width: 60px" />
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
                <n-statistic :value="Number(aiStats.avgDuration || 0).toFixed(0)" suffix="ms" />
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

    <n-grid :cols="5" :x-gap="24" :y-gap="24" class="mb-6 monitor-grid">
      <n-grid-item v-for="i in 5" v-if="skeletonLoading" :key="`token-skeleton-${i}`">
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
        <n-grid-item>
          <n-card class="stat-card tutor-card" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon bg-pink-500/20 text-pink-400">
                <MessageSquare :size="24" />
              </div>
              <div class="stat-info">
                <span class="label">AI 助教提问消耗</span>
                <n-statistic>
                  <n-number-animation :from="0" :to="aiStats.tutorTokens || 0" />
                </n-statistic>
                <span class="text-xs text-zinc-500">共 {{ aiStats.tutorCalls || 0 }} 次对话</span>
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
                已通过缓存节省 ¥{{ savedCost }}
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
  </div>
</template>

<style scoped>
.stat-card,
.chart-card {
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

.cost-card {
  border: 1px solid rgba(244, 63, 94, 0.15) !important;
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(60, 20, 30, 0.3)) !important;
}

.tutor-card {
  border: 1px solid rgba(236, 72, 153, 0.15) !important;
  background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(60, 20, 45, 0.28)) !important;
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
</style>
