<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  NNumberAnimation,
  NProgress,
  NRadioButton,
  NRadioGroup,
  NSkeleton,
  NTag,
  useMessage
} from 'naive-ui'
import {
  Activity,
  CheckCircle,
  Clock,
  Coins,
  Gauge,
  MessageSquare,
  Wallet,
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
      totalRmb +=
        (Number(item?.input || 0) * price.input) / 1000 +
        (Number(item?.output || 0) * price.output) / 1000
    } else {
      totalRmb += ((Number(item?.input || 0) + Number(item?.output || 0)) * 0.001) / 1000
    }
  })

  return totalRmb.toFixed(4)
})

const renderModelDistributionChart = () => {
  if (!modelChartRef.value) return
  modelChartInstance?.dispose()
  modelChartInstance = echarts.init(modelChartRef.value)

  const data =
    Array.isArray(aiStats.value.modelUsage) && aiStats.value.modelUsage.length
      ? aiStats.value.modelUsage
      : [
          { model: 'qwen-plus', count: 1250 },
          { model: 'qwen-turbo', count: 890 },
          { model: 'qwen-items', count: 320 }
        ]

  modelChartInstance.setOption({
    backgroundColor: 'transparent',
    color: ['#3445c4', '#2f6fb8', '#1d8a5b', '#b86a00', '#c53b3b', '#7a8396'],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: '#ffffff',
      borderColor: '#e2e5ea',
      textStyle: { color: '#1a2130' }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#687184' }
    },
    series: [
      {
        name: '模型分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#ffffff',
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
            fontWeight: 600,
            color: '#1a2130'
          }
        },
        labelLine: {
          show: false
        },
        data: data.map(item => ({
          value: Number(item?.count || 0),
          name: item?.model || 'unknown'
        }))
      }
    ]
  })
}

const renderTrendChart = () => {
  if (!trendChartRef.value) return

  trendChartInstance?.dispose()
  trendChartInstance = echarts.init(trendChartRef.value)

  // 每日成功率 = (调用数 - 失败数) / 调用数，没有调用的日期留空
  const successRates = trendData.value.map(item => {
    const total = Number(item?.total || 0)
    if (!total) return null
    return Number((((total - Number(item?.fail || 0)) / total) * 100).toFixed(1))
  })

  trendChartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e2e5ea',
      textStyle: { color: '#1a2130' },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Token 消耗', '成功率 (%)'],
      textStyle: { color: '#687184' },
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
      axisLine: { lineStyle: { color: '#e2e5ea' } },
      axisLabel: { color: '#687184' },
      axisPointer: { type: 'shadow' }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Token 消耗',
        alignTicks: false,
        min: 0,
        nameTextStyle: { color: '#687184', align: 'left' },
        position: 'left',
        axisLine: { lineStyle: { color: '#e2e5ea' } },
        splitLine: { lineStyle: { color: '#e2e5ea' } },
        axisLabel: { color: '#687184' }
      },
      {
        type: 'value',
        name: '成功率',
        position: 'right',
        nameTextStyle: { color: '#687184', align: 'right' },
        axisLine: { lineStyle: { color: '#e2e5ea' } },
        splitLine: { show: false },
        axisLabel: { formatter: '{value} %', color: '#687184' },
        alignTicks: false,
        min: 0,
        max: 100,
        interval: 20
      }
    ],
    series: [
      {
        name: 'Token 消耗',
        data: trendData.value.map(item => Number(item?.totalTokens || 0)),
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: '#3445c4',
          borderRadius: [3, 3, 0, 0]
        },
        yAxisIndex: 0
      },
      {
        name: '成功率 (%)',
        data: successRates,
        connectNulls: true,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#1d8a5b', borderColor: '#ffffff', borderWidth: 2 },
        lineStyle: { width: 2, color: '#1d8a5b' },
        yAxisIndex: 1
      }
    ]
  })
}

const animateEntering = async () => {
  if (skeletonLoading.value || !containerRef.value) return

  const statCards = containerRef.value.querySelectorAll('.ls-stat')
  const chartCards = containerRef.value.querySelectorAll('.chart-panel')
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
  <div ref="containerRef" class="monitor-tab">
    <section class="ls-stats monitor-stats" aria-label="运行与成本指标">
      <template v-if="skeletonLoading">
        <div v-for="i in 10" :key="`stat-skeleton-${i}`" class="ls-stat">
          <n-skeleton height="12px" width="50%" />
          <n-skeleton height="26px" width="70%" />
        </div>
      </template>

      <template v-else>
        <div class="ls-stat">
          <span class="ls-stat__label"><Zap :size="14" />总调用量</span>
          <strong class="ls-stat__value"
            ><n-number-animation :from="0" :to="aiStats.totalCalls || 0"
          /></strong>
        </div>
        <div class="ls-stat">
          <span class="ls-stat__label"><Activity :size="14" />24h 调用</span>
          <strong class="ls-stat__value">{{ aiStats.last24hCalls || 0 }}</strong>
        </div>
        <div class="ls-stat ls-stat--ok">
          <span class="ls-stat__label"><CheckCircle :size="14" />平均成功率</span>
          <strong class="ls-stat__value"
            >{{ Number(aiStats.successRate || 0).toFixed(1) }}<small>%</small></strong
          >
        </div>
        <div class="ls-stat">
          <span class="ls-stat__label"><Clock :size="14" />平均响应</span>
          <strong class="ls-stat__value"
            >{{ Number(aiStats.avgDuration || 0).toFixed(0) }}<small>ms</small></strong
          >
        </div>
        <div class="ls-stat" :class="{ 'ls-stat--warn': Number(aiHealth.p95 || 0) > 8000 }">
          <span class="ls-stat__label"><Gauge :size="14" />P95 / P99</span>
          <strong class="ls-stat__value"
            >{{ aiHealth.p95 || 0 }}<small>/ {{ aiHealth.p99 || 0 }} ms</small></strong
          >
        </div>

        <div class="ls-stat">
          <span class="ls-stat__label"><Coins :size="14" />总 Token</span>
          <strong class="ls-stat__value"
            ><n-number-animation :from="0" :to="aiStats.totalTokens || 0"
          /></strong>
        </div>
        <div class="ls-stat">
          <span class="ls-stat__label"><Coins :size="14" />24h Token</span>
          <strong class="ls-stat__value"
            ><n-number-animation :from="0" :to="aiStats.tokens24h || 0"
          /></strong>
        </div>
        <div class="ls-stat">
          <span class="ls-stat__label"><Coins :size="14" />平均 Token</span>
          <strong class="ls-stat__value"
            ><n-number-animation :from="0" :to="aiStats.avgTokens || 0" :precision="0" /><small
              >/ 次</small
            ></strong
          >
        </div>
        <div class="ls-stat">
          <span class="ls-stat__label"><Wallet :size="14" />预估成本</span>
          <strong class="ls-stat__value"
            ><small class="currency">¥</small>{{ estimatedCost }}</strong
          >
        </div>
        <div class="ls-stat">
          <span class="ls-stat__label"><MessageSquare :size="14" />助教消耗</span>
          <strong class="ls-stat__value"
            ><n-number-animation :from="0" :to="aiStats.tutorTokens || 0"
          /></strong>
          <span class="ls-stat__hint">{{ aiStats.tutorCalls || 0 }} 次对话</span>
        </div>
      </template>
    </section>

    <div class="monitor-charts">
      <section class="ls-panel chart-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">
            Token 趋势 <span class="ls-panel__count">近 {{ trendDuration }} 天</span>
          </h2>
          <div class="ls-panel__tools">
            <n-radio-group
              v-model:value="trendDuration"
              size="small"
              @update:value="fetchMonitorData"
            >
              <n-radio-button :value="7" label="7天" />
              <n-radio-button :value="14" label="14天" />
              <n-radio-button :value="30" label="30天" />
            </n-radio-group>
          </div>
        </header>
        <div class="ls-panel__body chart-panel__body">
          <div ref="trendChartRef" class="chart-canvas"></div>
        </div>
      </section>

      <section class="ls-panel chart-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">模型调用分布</h2>
        </header>
        <div class="ls-panel__body chart-panel__body">
          <div ref="modelChartRef" class="chart-canvas"></div>
        </div>
      </section>
    </div>

    <div class="ls-grid-2 monitor-diagnosis">
      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">
            高失败动作
            <span class="ls-panel__count"
              >Top {{ (aiHealth.highFailureActions || []).length }}</span
            >
          </h2>
        </header>
        <ul
          v-if="aiHealth.highFailureActions && aiHealth.highFailureActions.length"
          class="diag-list"
        >
          <li v-for="item in aiHealth.highFailureActions" :key="item.action" class="diag-row">
            <div class="diag-row__line">
              <span class="diag-row__name" :title="item.action">{{ item.action }}</span>
              <span class="diag-row__num" :class="{ 'is-danger': item.failRate > 10 }"
                >{{ Number(item.failRate).toFixed(1) }}%</span
              >
            </div>
            <n-progress
              type="line"
              :percentage="Number(item.failRate)"
              :show-indicator="false"
              :status="item.failRate > 10 ? 'error' : 'warning'"
              :height="4"
            />
          </li>
        </ul>
        <div v-else class="ls-empty">暂无失败动作数据</div>
      </section>

      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">
            常见错误
            <span class="ls-panel__count">{{ (aiHealth.commonErrors || []).length }} 类</span>
          </h2>
        </header>
        <ul v-if="aiHealth.commonErrors && aiHealth.commonErrors.length" class="diag-list">
          <li v-for="(err, idx) in aiHealth.commonErrors" :key="idx" class="diag-row">
            <div class="diag-row__line">
              <span class="diag-row__name diag-row__name--error" :title="err.error">{{
                err.error
              }}</span>
              <n-tag size="small" :bordered="false" type="error">{{ err.count }} 次</n-tag>
            </div>
          </li>
        </ul>
        <div v-else class="ls-empty">暂无记录到的故障模式</div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.monitor-tab {
  display: grid;
  gap: 20px;
  min-width: 0;
}

/* Ten metrics in two even rows of five. */
.monitor-stats {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.monitor-stats .ls-stat {
  align-content: start;
}

.currency {
  margin: 0 2px 0 0 !important;
}

/* 2:1 split for the trend chart and the distribution donut. */
.monitor-charts {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

.chart-panel,
.monitor-diagnosis > .ls-panel {
  display: flex;
  flex-direction: column;
}

.chart-panel__body {
  flex: 1;
}

.chart-canvas {
  height: 320px;
}

.monitor-diagnosis {
  align-items: stretch;
}

.diag-list {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.diag-row {
  display: grid;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
}

.diag-row:last-child {
  border-bottom: none;
}

.diag-row__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}

.diag-row__name {
  min-width: 0;
  overflow: hidden;
  color: var(--ink);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diag-row__name--error {
  color: var(--danger);
}

.diag-row__num {
  flex-shrink: 0;
  color: var(--ink-2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.diag-row__num.is-danger {
  color: var(--danger);
}

@media (max-width: 1280px) {
  .monitor-stats {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }
}

@media (max-width: 1100px) {
  .monitor-charts {
    grid-template-columns: 1fr;
  }
}
</style>
