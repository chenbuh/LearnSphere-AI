<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NButton, NIcon, NSpin, useMessage } from 'naive-ui'
import { Activity, Sparkles } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { learningApi } from '@/api/learning'
import LearningAnalysisAiCard from '@/components/learning/LearningAnalysisAiCard.vue'
import LearningAnalysisHeader from '@/components/learning/LearningAnalysisHeader.vue'
import LearningAnalysisInsightsPanel from '@/components/learning/LearningAnalysisInsightsPanel.vue'
import LearningAnalysisOverviewSection from '@/components/learning/LearningAnalysisOverviewSection.vue'
import { useTypewriter } from '@/composables/useTypewriter'
import { useThemeStore } from '@/stores/theme'

const message = useMessage()
const { locale } = useI18n()
const themeStore = useThemeStore()
const isDarkTheme = computed(() => themeStore.isDark)
const isEnglish = computed(() => locale.value === 'en-US')
const L = (zh, en) => (isEnglish.value ? en : zh)

const loading = ref(true)
const generating = ref(false)
const reportData = ref(null)
const trendChartRef = ref(null)
const radarChartRef = ref(null)
const trendDays = ref(7)

let trendChart = null
let radarChart = null
let echartsModule = null
let currentTrendData = null
let chartResizeObserver = null
let chartInitFrame = null

const { displayedText: aiDisplayedAnalysis, startTyping: startAiTyping } = useTypewriter('', 10)

const stats = ref({
  overall: 0,
  growth: 0,
  gap: 0,
  predict: 0
})
const abilities = ref([])
const weakPoints = ref([])

const getEcharts = async () => {
  if (!echartsModule) {
    const mod = await import('@/utils/echarts')
    echartsModule = mod.default
  }
  return echartsModule
}

const getChartThemeTokens = () => (
  isDarkTheme.value
    ? {
        mode: 'dark',
        tooltipBackground: '#27272a',
        tooltipBorder: '#3f3f46',
        tooltipText: '#ffffff',
        tooltipShadow: '0 18px 36px rgba(2, 6, 23, 0.32)',
        axisLine: '#3f3f46',
        axisLabel: '#a1a1aa',
        splitLine: 'rgba(255, 255, 255, 0.05)',
        radarAxisName: '#a1a1aa',
        radarGridLine: 'rgba(99, 102, 241, 0.1)',
        radarTargetLine: 'rgba(255, 255, 255, 0.3)',
        radarTargetArea: 'rgba(255, 255, 255, 0.02)',
        trendAreaStart: 'rgba(129, 140, 248, 0.3)',
        trendAreaEnd: 'rgba(129, 140, 248, 0)',
        radarCurrentAreaStart: 'rgba(99, 102, 241, 0.6)',
        radarCurrentAreaEnd: 'rgba(168, 85, 247, 0.2)'
      }
    : {
        mode: null,
        tooltipBackground: 'rgba(255, 255, 255, 0.96)',
        tooltipBorder: 'rgba(148, 163, 184, 0.24)',
        tooltipText: '#0f172a',
        tooltipShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
        axisLine: 'rgba(148, 163, 184, 0.46)',
        axisLabel: '#64748b',
        splitLine: 'rgba(148, 163, 184, 0.2)',
        radarAxisName: '#475569',
        radarGridLine: 'rgba(99, 102, 241, 0.18)',
        radarTargetLine: 'rgba(71, 85, 105, 0.28)',
        radarTargetArea: 'rgba(255, 255, 255, 0.36)',
        trendAreaStart: 'rgba(129, 140, 248, 0.2)',
        trendAreaEnd: 'rgba(129, 140, 248, 0.02)',
        radarCurrentAreaStart: 'rgba(99, 102, 241, 0.38)',
        radarCurrentAreaEnd: 'rgba(168, 85, 247, 0.08)'
      }
)

const formatAiAnalysis = (text) => {
  const source = text || ''
  const escaped = source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<span class="ai-emphasis">$1</span>')
    .replace(/\n/g, '<br />')
}

const formattedAiAnalysis = computed(() => formatAiAnalysis(aiDisplayedAnalysis.value))

const trendChartRefSetter = (el) => {
  trendChartRef.value = el

  if (el) {
    observeChartContainers()
    if (currentTrendData) {
      scheduleChartRender({ recreate: true })
    }
  }
}

const isChartContainerReady = (el) => Boolean(el && el.clientWidth > 0 && el.clientHeight > 0)

const isChartActive = (instance) => Boolean(instance && typeof instance.isDisposed === 'function' && !instance.isDisposed())

const disposeTrendChart = () => {
  if (isChartActive(trendChart)) {
    trendChart.dispose()
  }
  trendChart = null
}

const disposeRadarChart = () => {
  if (isChartActive(radarChart)) {
    radarChart.dispose()
  }
  radarChart = null
}

const strongestAbility = computed(() => (
  [...abilities.value].sort((left, right) => Number(right.current || 0) - Number(left.current || 0))[0] || null
))

const weakestAbility = computed(() => (
  [...abilities.value].sort((left, right) => Number(left.current || 0) - Number(right.current || 0))[0] || null
))

const priorityWeakPoint = computed(() => weakPoints.value[0] || null)
const dataSummary = computed(() => reportData.value?.dataSummary || {})
const dataStatus = computed(() => reportData.value?.dataStatus || null)
const totalRecordCount = computed(() => Number(dataSummary.value.totalRecords || 0))
const recentRecordCount = computed(() => Number(dataSummary.value.recent7DaysRecords || 0))
const comparisonWindowDays = computed(() => Number(dataSummary.value.comparisonWindowDays || 7))
const consecutiveDays = computed(() => Number(dataSummary.value.consecutiveDays || 0))
const recentActiveDays = computed(() => Number(dataSummary.value.recent7DaysActiveDays || 0))
const reportVersion = computed(() => Number(reportData.value?.reportVersion || 0))
const isDataGrounded = computed(() => Boolean(reportData.value?.dataGrounded))

const dataSampleText = computed(() => {
  if (totalRecordCount.value > 0) {
    return L(`${totalRecordCount.value} 条真实记录`, `${totalRecordCount.value} real records`)
  }
  return L('暂无真实记录', 'No real records yet')
})

const sampleBasisNote = computed(() => {
  if (recentRecordCount.value > 0) {
    return L(
      `近 ${comparisonWindowDays.value} 天新增 ${recentRecordCount.value} 条，活跃 ${recentActiveDays.value} 天${consecutiveDays.value > 0 ? `，已连续学习 ${consecutiveDays.value} 天` : ''}`,
      `${recentRecordCount.value} new records in the last ${comparisonWindowDays.value} days across ${recentActiveDays.value} active days${consecutiveDays.value > 0 ? `, with a ${consecutiveDays.value}-day streak` : ''}`
    )
  }
    return L('仅基于真实答题记录统计。', 'Only real answer records are counted.')
})

const reportModeText = computed(() => {
  if (dataStatus.value === 'empty') {
    return L('真实样本不足，暂不输出推测性结论', 'Not enough real data, so no speculative conclusion is shown')
  }
  if (dataStatus.value === 'limited') {
    return L('当前为小样本诊断，建议继续累积记录', 'This is an early diagnosis based on a small sample')
  }
  return L('已切换为真实数据诊断模式', 'Real-data diagnosis mode is active')
})

const reportTimestampText = computed(() => {
  const rawTimestamp = reportData.value?.timestamp
  if (!rawTimestamp) {
    return L('等待生成', 'Waiting')
  }

  const parsedDate = new Date(rawTimestamp)
  if (Number.isNaN(parsedDate.getTime())) {
    return L('最近生成', 'Recently generated')
  }

  return new Intl.DateTimeFormat(isEnglish.value ? 'en-US' : 'zh-CN', {
    month: isEnglish.value ? 'short' : 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate)
})

const headerMetaItems = computed(() => [
  {
    label: L('报告时间', 'Report Time'),
    value: reportTimestampText.value,
    note: reportVersion.value > 0
      ? L(`报告版本 v${reportVersion.value} · ${reportModeText.value}`, `Report v${reportVersion.value} · ${reportModeText.value}`)
      : reportModeText.value
  },
  {
    label: L('数据依据', 'Data Basis'),
    value: dataSampleText.value,
    note: totalRecordCount.value > 0
      ? sampleBasisNote.value
      : L('生成后会直接展示本次诊断到底用了多少真实记录。', 'This will show how many real records were used once the diagnosis is generated.')
  },
  {
    label: L('优先补强', 'Priority Focus'),
    value: priorityWeakPoint.value?.title || weakestAbility.value?.name || L('暂无', 'None'),
    note: priorityWeakPoint.value?.advice
      || (weakestAbility.value
        ? L(`当前最低能力值为 ${weakestAbility.value.current}，建议先补这项`, `Current lowest score is ${weakestAbility.value.current}, worth reinforcing first.`)
        : L('待分析完成后再给出优先动作', 'Priority actions will appear once analysis is ready.'))
  }
])

const headerStatusText = computed(() => {
  if (generating.value) {
    return L('正在根据真实记录刷新诊断', 'Refreshing the diagnosis from real records')
  }

  if (reportData.value) {
    if (dataStatus.value === 'empty') {
      return L('当前还没有足够样本，系统不会给出推测性分析', 'There is not enough data yet, so no speculative analysis is shown')
    }
    return L(
      `最近更新：${reportTimestampText.value} · ${dataSampleText.value}`,
      `Last refreshed: ${reportTimestampText.value} · ${dataSampleText.value}`
    )
  }

  return L('等待生成第一份真实数据分析', 'Waiting for the first real-data analysis')
})

const headerBadgeText = computed(() => (
  !reportData.value
    ? L('真实记录分析', 'Real Record Analysis')
    : dataStatus.value === 'empty'
      ? L('等待样本', 'Awaiting Data')
      : dataStatus.value === 'limited'
        ? L('小样本诊断', 'Small-Sample Diagnosis')
        : L('真实数据诊断', 'Real-Data Diagnosis')
))

const decisionRailTitle = computed(() => L('今天先看这三件事', 'Three things to scan first'))
const decisionRailCaption = computed(() => (
  priorityWeakPoint.value?.advice
  || (weakestAbility.value
    ? L(
      `先补 ${weakestAbility.value.name}，再把优势项继续维持在目标线附近。`,
      `Reinforce ${weakestAbility.value.name} first, then keep your strongest area close to target.`
    )
    : L('生成报告后，这里会给出今天最值得执行的动作顺序。', 'This rail will show the clearest next actions after a report is generated.'))
))

const decisionRailItems = computed(() => [
  {
    label: L('先处理', 'Start with'),
    value: priorityWeakPoint.value?.title || weakestAbility.value?.name || L('等待诊断', 'Awaiting report'),
    note: priorityWeakPoint.value?.advice
      || (weakestAbility.value
        ? L(`当前值 ${weakestAbility.value.current}，离目标还有 ${getAbilityGap(weakestAbility.value)}。`, `Current score ${weakestAbility.value.current}, with ${getAbilityGap(weakestAbility.value)} left to target.`)
        : L('报告生成后会显示最值得优先投入的一项。', 'Your highest-priority reinforcement item will appear here once the report is ready.'))
  },
  {
    label: L('保持优势', 'Keep warm'),
    value: strongestAbility.value?.name || L('等待诊断', 'Awaiting report'),
    note: strongestAbility.value
      ? L(`当前 ${strongestAbility.value.current} / 目标 ${strongestAbility.value.target}，适合低成本持续保温。`, `Currently ${strongestAbility.value.current} / target ${strongestAbility.value.target}, ideal for low-effort maintenance.`)
      : L('最稳定的能力项会在这里显示。', 'Your most stable area will show here.')
  },
  {
    label: L('学习势头', 'Momentum'),
    value: `${Number(stats.value.growth) > 0 ? '+' : ''}${stats.value.growth}%`,
    note: Number(stats.value.growth) > 0
      ? L('最近一周在上扬，适合趁热推进重点题型。', 'Momentum is improving this week, which is a good time to push the priority task.')
      : L('最近一周节奏偏平，建议先做一组可快速见效的补强训练。', 'Momentum is flat this week, so start with one targeted drill that can produce a quick win.')
  }
])

const overviewLabels = computed(() => ({
  overall: L('综合能力值', 'Overall Score'),
  growth: L('近7天变化', 'Last 7-Day Change'),
  gap: L('距目标差距', 'Gap to Target'),
  predict: L('预测分值 (CET)', 'Projected CET Score')
}))

const overviewHints = computed(() => ({
  primaryKicker: L('能力总览', 'Capability Overview'),
  overall: strongestAbility.value
    ? L(`当前最稳的模块是 ${strongestAbility.value.name}，先稳住优势，再补最低项。`, `Your most stable area is ${strongestAbility.value.name}. Hold that strength, then reinforce the weakest area.`)
    : L('综合能力值会把真实练习表现折算成一张更容易执行的诊断快照。', 'The overall score turns real practice into an actionable diagnosis snapshot.'),
      growth: L(`对比近 ${comparisonWindowDays.value} 天与前 ${comparisonWindowDays.value} 天的正确率变化。`, `Compares answer accuracy across the latest ${comparisonWindowDays.value}-day window and the previous one.`),
  gap: priorityWeakPoint.value
    ? L(`目前最值得优先处理的是 ${priorityWeakPoint.value.title}。`, `The clearest priority right now is ${priorityWeakPoint.value.title}.`)
    : weakestAbility.value
      ? L(`${weakestAbility.value.name} 仍有明显补强空间。`, `${weakestAbility.value.name} still has room to grow.`)
      : L('看离阶段目标还有多少空间。', 'Shows how far you are from the current target.'),
  predict: totalRecordCount.value > 0
    ? L('只根据当前真实训练表现估算 CET 成绩区间。', 'Estimated CET performance only from your current real training data.')
    : L('暂无真实样本时不做分值估算。', 'No score estimate is shown until real data is available.')
}))

const aiCardLabels = computed(() => ({
  sectionLabel: L('真实数据', 'Data Memo'),
  title: L('真实学习数据解读', 'Real Learning Data Readout'),
  badge: isDataGrounded.value ? L('无随机值', 'No Random Values') : L('待校验', 'Pending Check'),
  generatingHint: L('正在核对真实记录...', 'Verifying real records...'),
  readyHint: totalRecordCount.value > 0
    ? L(`基于 ${totalRecordCount.value} 条真实记录`, `Built from ${totalRecordCount.value} real records`)
    : L('等待真实记录', 'Waiting for real records'),
  spinDescription: L(
    '系统正在根据你的真实学习记录生成诊断摘要...',
    'Building a diagnosis summary from your real learning records...'
  ),
  generatingText: L(
      '正在整理真实数据...',
    'Organizing real data without generating speculative conclusions...'
  )
}))

const insightLabels = computed(() => ({
  weaknessKicker: L('薄弱项', 'Weakness Review'),
  weaknessTitle: L('薄弱项诊断 & 建议', 'Weakness Diagnosis & Suggestions'),
  weaknessCaption: L(
    '只展示真实练习中命中率偏低的模块，先看最影响当前分数的一项。',
    'Only shows lower-performing areas from real practice, so start with the one that affects your score most.'
  ),
  priorityTag: L('优先处理', 'Priority'),
  priorityLabel: L('当前最该补的一项', 'Top item to reinforce'),
  score: L('得分', 'Score'),
  advice: L('数据建议', 'Data Advice'),
  noWeaknessTitle: L('太棒了！暂无明显薄弱项', 'Great work! No obvious weak points for now.'),
  noWeaknessDesc: L(
    '当前真实记录里没有持续偏低的模块，继续保持现在的训练质量即可。',
    'No area is consistently underperforming in the current real records. Keep the training quality steady.'
  ),
  trendKicker: L('趋势变化', 'Trend Monitor'),
  trendTitle: L('学习准确率趋势', 'Learning Accuracy Trend'),
  trendCaption: L(
    '切换 7 天和 30 天窗口，看准确率是短期波动还是持续改善。',
    'Switch between 7-day and 30-day windows to see whether accuracy is fluctuating or steadily improving.'
  ),
  last7Days: L('近7天', 'Last 7 Days'),
  last30Days: L('近30天', 'Last 30 Days')
}))

const getAbilityProgress = (item) => Math.max(8, Math.min(Number(item?.current || 0), 100))

const getAbilityGap = (item) => Math.max(0, Number(item?.target || 0) - Number(item?.current || 0))

const getAbilityStatus = (item) => {
  const gap = getAbilityGap(item)

  if (gap <= 0) {
    return L('已达到当前目标', 'On target')
  }
  if (gap <= 8) {
    return L('接近目标线', 'Near target')
  }
  if (gap <= 18) {
    return L('还有提升空间', 'Needs reinforcement')
  }
  return L('建议优先投入', 'Needs attention')
}

const getAbilityGapLabel = (item) => {
  const gap = getAbilityGap(item)
  if (gap <= 0) {
    return L('已超过目标线', 'Above target')
  }
  return L(`距目标 ${gap}`, `Gap ${gap}`)
}

const fetchLastReport = async () => {
  loading.value = true
  try {
    const res = await learningApi.getLastAnalysis()
    if (res.code === 200 && res.data) {
      updateUI(res.data)
    } else {
      reportData.value = null
    }
  } catch (error) {
    console.error('Failed to fetch last report:', error)
  } finally {
    loading.value = false
    fetchTrendAndInitChart()
  }
}

const generateNewReport = async () => {
  generating.value = true
  try {
    const res = await learningApi.generateAnalysis()
    if (res.code === 200) {
      updateUI(res.data)
      message.success(L('真实数据诊断已重新生成', 'The real-data diagnosis has been regenerated.'))
      fetchTrendAndInitChart()
    }
  } catch (error) {
    message.error(L('真实数据诊断生成失败，请稍后重试', 'Failed to generate the real-data diagnosis. Please try again later.'))
  } finally {
    generating.value = false
  }
}

const updateUI = (data) => {
  reportData.value = data
  stats.value = {
    overall: data.overall,
    growth: data.growth,
    gap: data.gap,
    predict: data.predict
  }
  abilities.value = data.abilities || []
  weakPoints.value = data.weakPoints || []

  startAiTyping(data.aiAnalysis || '')

  nextTick(() => {
    observeChartContainers()
    scheduleChartRender({ recreate: true })
  })
}

const fetchTrendAndInitChart = async () => {
  try {
    const res = await learningApi.getTrends(trendDays.value)
    if (res.code === 200) {
      currentTrendData = res.data
      nextTick(() => {
        observeChartContainers()
        scheduleChartRender({ trendData: res.data, recreate: true })
      })
    }
  } catch (error) {
    console.error('Trend data fail:', error)
  }
}

const changeTrendDays = (days) => {
  if (trendDays.value === days) return
  trendDays.value = days
  fetchTrendAndInitChart()
}

const initTrendChart = async (data) => {
  currentTrendData = data
  if (!trendChartRef.value || !currentTrendData || !isChartContainerReady(trendChartRef.value)) return
  const echarts = await getEcharts()
  const chartTheme = getChartThemeTokens()

  if (!isChartActive(trendChart)) {
    trendChart = echarts.init(trendChartRef.value, chartTheme.mode)
  }

  const trendStats = currentTrendData.trendStats || []
  const dates = trendStats.map((item) => item.date.split('-').slice(1).join('/'))
  const accuracies = trendStats.map((item) => (
    item.accuracy === null ? null : parseFloat(item.accuracy).toFixed(1)
  ))

  trendChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartTheme.tooltipBackground,
      borderColor: chartTheme.tooltipBorder,
      textStyle: { color: chartTheme.tooltipText },
      extraCssText: `box-shadow:${chartTheme.tooltipShadow};border-radius:14px;`,
      formatter: (params) => {
        const item = params[0]
        if (!item || item.value == null) return ''
        return `${item.name}<br/>
          <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
          ${L('学习准确率', 'Learning Accuracy')}: ${item.value}%`
      }
    },
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLine: { lineStyle: { color: chartTheme.axisLine } },
      axisLabel: { color: chartTheme.axisLabel }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: chartTheme.splitLine } },
      axisLabel: { color: chartTheme.axisLabel, formatter: '{value}%' }
    },
    series: [
      {
        name: L('学习准确率', 'Learning Accuracy'),
        type: 'line',
        smooth: true,
        connectNulls: true,
        data: accuracies,
        lineStyle: { width: 3, color: '#818cf8' },
        itemStyle: { color: '#818cf8' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: chartTheme.trendAreaStart },
            { offset: 1, color: chartTheme.trendAreaEnd }
          ])
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  })
}

const initRadarChart = async () => {
  if (!radarChartRef.value || !abilities.value.length || !isChartContainerReady(radarChartRef.value)) return
  const echarts = await getEcharts()
  const chartTheme = getChartThemeTokens()

  if (!isChartActive(radarChart)) {
    radarChart = echarts.init(radarChartRef.value, chartTheme.mode)
  }

  const indicators = abilities.value.map((item) => ({ name: item.name, max: 100 }))
  const currentValues = abilities.value.map((item) => item.current)
  const targetValues = abilities.value.map((item) => item.target)

  radarChart.setOption({
    backgroundColor: 'transparent',
    radar: {
      indicator: indicators,
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: chartTheme.radarAxisName },
      splitLine: { lineStyle: { color: chartTheme.radarGridLine } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: chartTheme.radarGridLine } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: targetValues,
            name: L('目标水平', 'Target Level'),
            symbol: 'none',
            lineStyle: { type: 'dashed', color: chartTheme.radarTargetLine, width: 1 },
            areaStyle: { color: chartTheme.radarTargetArea }
          },
          {
            value: currentValues,
            name: L('当前水平', 'Current Level'),
            itemStyle: { color: '#6366f1' },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: chartTheme.radarCurrentAreaStart },
                { offset: 1, color: chartTheme.radarCurrentAreaEnd }
              ])
            }
          }
        ]
      }
    ]
  })
}

const scheduleChartRender = ({ trendData = currentTrendData, recreate = false } = {}) => {
  if (typeof window === 'undefined') return

  if (chartInitFrame !== null) {
    cancelAnimationFrame(chartInitFrame)
  }

  chartInitFrame = requestAnimationFrame(async () => {
    chartInitFrame = null

    if (recreate) {
      disposeTrendChart()
      disposeRadarChart()
    }

    if (trendData) {
      await initTrendChart(trendData)
    }

    if (abilities.value.length) {
      await initRadarChart()
    }

    handleResize()
  })
}

const observeChartContainers = () => {
  if (typeof ResizeObserver === 'undefined') return

  if (!chartResizeObserver) {
    chartResizeObserver = new ResizeObserver((entries) => {
      const hasVisibleChart = entries.some((entry) => entry.contentRect.width > 0 && entry.contentRect.height > 0)
      if (!hasVisibleChart) return

      scheduleChartRender()
    })
  } else {
    chartResizeObserver.disconnect()
  }

  if (trendChartRef.value) {
    chartResizeObserver.observe(trendChartRef.value)
  }

  if (radarChartRef.value) {
    chartResizeObserver.observe(radarChartRef.value)
  }
}

const handleResize = () => {
  if (isChartActive(trendChart) && isChartContainerReady(trendChartRef.value)) {
    trendChart.resize()
  }
  if (isChartActive(radarChart) && isChartContainerReady(radarChartRef.value)) {
    radarChart.resize()
  }
}

watch(isDarkTheme, () => {
  nextTick(() => {
    observeChartContainers()
    scheduleChartRender({ recreate: true })
  })
})

watch(radarChartRef, (el) => {
  if (!el) return

  observeChartContainers()

  if (abilities.value.length) {
    scheduleChartRender({ recreate: true })
  }
})

onMounted(() => {
  fetchLastReport()
  nextTick(() => {
    observeChartContainers()
  })
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartResizeObserver) {
    chartResizeObserver.disconnect()
    chartResizeObserver = null
  }
  if (chartInitFrame !== null) {
    cancelAnimationFrame(chartInitFrame)
    chartInitFrame = null
  }
  disposeTrendChart()
  disposeRadarChart()
})
</script>

<template>
  <div class="analysis-page">
    <learning-analysis-header
      :title="L('学习分析', 'Learning Analysis')"
      :subtitle="L(
        '把真实练习记录整理成一张可操作的诊断桌面，先看样本依据，再决定今天优先补哪一项。',
        'Turn real practice records into an actionable diagnosis desk: verify the evidence first, then decide what to reinforce today.'
      )"
      :button-text="reportData ? L('刷新真实诊断', 'Refresh Real-Data Diagnosis') : L('生成首份真实诊断', 'Generate First Real-Data Diagnosis')"
      :generating="generating"
      :meta-items="headerMetaItems"
      :badge-text="headerBadgeText"
      :status-text="headerStatusText"
      @regenerate="generateNewReport"
    />

    <n-spin :show="loading">
      <div v-if="reportData" class="analysis-workbench">
        <learning-analysis-overview-section
          :stats="stats"
          :labels="overviewLabels"
          :hints="overviewHints"
        />

        <div class="analysis-main-grid">
          <section class="analysis-panel analysis-panel--abilities">
            <div class="panel-head">
              <div>
                <p class="panel-kicker">{{ L('能力概览', 'Ability Surface') }}</p>
                <h2 class="panel-title">{{ L('六维能力态势', 'Six-Dimension Ability Profile') }}</h2>
                <p class="panel-caption">
                  {{ L(
                    '同时展示当前表现、目标水平和需要加强的项目，方便快速查看。',
                    'See current levels, targets, and gaps together in one surface for clearer desktop review.'
                  ) }}
                </p>
              </div>

              <div class="panel-chip">
                <n-icon :component="Activity" size="14" />
                <span>
                  {{
                    strongestAbility
                      ? `${strongestAbility.name} ${strongestAbility.current}`
                      : L('等待数据', 'Waiting for data')
                  }}
                </span>
              </div>
            </div>

            <div class="abilities-layout">
              <div class="chart-surface">
                <div ref="radarChartRef" class="radar-container"></div>
                <div class="chart-surface__legend">
                  <div class="legend-item">
                    <span class="legend-dot legend-dot--current"></span>
                    <span>{{ L('当前水平', 'Current Level') }}</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-line"></span>
                    <span>{{ L('目标水平', 'Target Level') }}</span>
                  </div>
                </div>
              </div>

              <div class="ability-column">
                <div class="ability-spotlight-grid">
                  <article class="spotlight-card">
                    <span class="spotlight-label">{{ L('当前优势', 'Strongest Area') }}</span>
                    <strong class="spotlight-title">
                      {{ strongestAbility?.name || L('暂无', 'N/A') }}
                    </strong>
                    <span class="spotlight-meta">
                      {{
                        strongestAbility
                          ? `${strongestAbility.current} / ${strongestAbility.target}`
                          : L('等待生成诊断', 'Waiting for report')
                      }}
                    </span>
                  </article>

                  <article class="spotlight-card spotlight-card--alert">
                    <span class="spotlight-label">{{ L('优先补强', 'Needs Attention') }}</span>
                    <strong class="spotlight-title">
                      {{ priorityWeakPoint?.title || weakestAbility?.name || L('暂无', 'N/A') }}
                    </strong>
                    <span class="spotlight-meta">
                      {{
                        priorityWeakPoint?.score != null
                          ? `${L('得分', 'Score')} ${priorityWeakPoint.score}`
                          : weakestAbility
                            ? `${L('当前', 'Current')} ${weakestAbility.current}`
                            : L('状态稳定', 'Stable')
                      }}
                    </span>
                  </article>
                </div>

                <div class="ability-list">
                  <article
                    v-for="item in abilities"
                    :key="item.name"
                    class="ability-row"
                  >
                    <div class="ability-row__top">
                      <div class="ability-row__title">
                        <span class="ability-row__dot" :style="{ background: item.color }"></span>
                        <div>
                          <strong>{{ item.name }}</strong>
                          <span>{{ getAbilityStatus(item) }}</span>
                        </div>
                      </div>

                      <div class="ability-row__score">
                        <strong>{{ item.current }}</strong>
                        <span>/{{ item.target }}</span>
                      </div>
                    </div>

                    <div class="ability-row__track">
                      <span
                        class="ability-row__fill"
                        :style="{ width: `${getAbilityProgress(item)}%`, background: item.color }"
                      ></span>
                    </div>

                    <div class="ability-row__foot">
                      <span>{{ L('当前', 'Current') }} {{ item.current }}</span>
                      <span>{{ getAbilityGapLabel(item) }}</span>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          <aside class="analysis-side-rail">
            <section class="analysis-brief">
              <div class="analysis-brief__head">
                <p class="analysis-brief__kicker">{{ L('今日建议', 'Decision Rail') }}</p>
                <h3 class="analysis-brief__title">{{ decisionRailTitle }}</h3>
                <p class="analysis-brief__caption">{{ decisionRailCaption }}</p>
              </div>

              <div class="analysis-brief__list">
                <article
                  v-for="item in decisionRailItems"
                  :key="item.label"
                  class="analysis-brief__item"
                >
                  <span class="analysis-brief__label">{{ item.label }}</span>
                  <strong class="analysis-brief__value">{{ item.value }}</strong>
                  <p class="analysis-brief__note">{{ item.note }}</p>
                </article>
              </div>
            </section>

            <learning-analysis-ai-card
              v-if="reportData.aiAnalysis"
              :generating="generating"
              :formatted-analysis="formattedAiAnalysis"
              :displayed-length="aiDisplayedAnalysis.length"
              :full-length="(reportData.aiAnalysis || '').length"
              :labels="aiCardLabels"
            />
          </aside>
        </div>

        <learning-analysis-insights-panel
          :weak-points="weakPoints"
          :trend-days="trendDays"
          :labels="insightLabels"
          :trend-chart-ref-setter="trendChartRefSetter"
          @change-trend-days="changeTrendDays"
        />
      </div>

      <div v-else-if="!loading" class="analysis-empty">
        <div class="analysis-empty__body">
          <div class="analysis-empty__icon">
            <n-icon :component="Sparkles" />
          </div>
          <h2>{{ L('还没有分析报告', 'No analysis report yet') }}</h2>
          <p>
            {{
              L(
                '先生成一份基于真实数据的诊断结果，再查看依据、总览和趋势变化。',
                'Generate the first real-data diagnosis to review evidence, overview, and trend changes.'
              )
            }}
          </p>
          <n-button type="primary" size="large" :loading="generating" @click="generateNewReport">
            <template #icon>
              <n-icon :component="Sparkles" />
            </template>
            {{ L('立即生成真实数据诊断', 'Generate Real-Data Diagnosis') }}
          </n-button>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.analysis-page {
  position: relative;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 28px 64px;
}

.analysis-page::before,
.analysis-page::after {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 360px;
  height: 360px;
  border-radius: 999px;
  pointer-events: none;
}

.analysis-page::before {
  top: 8px;
  left: -150px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.12), transparent 70%);
}

.analysis-page::after {
  top: 420px;
  right: -180px;
  left: auto;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%);
}

.analysis-workbench {
  display: grid;
  gap: 24px;
}

.analysis-workbench > * {
  animation: analysis-rise 0.55s ease both;
}

.analysis-workbench > *:nth-child(2) {
  animation-delay: 0.06s;
}

.analysis-workbench > *:nth-child(3) {
  animation-delay: 0.12s;
}

.analysis-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.34fr) minmax(300px, 0.66fr);
  gap: 24px;
  align-items: start;
}

.analysis-side-rail {
  position: sticky;
  top: 88px;
  display: grid;
  gap: 16px;
  align-self: start;
}

.analysis-main-grid > *,
.abilities-layout > *,
.ability-column,
.chart-surface,
.ability-list,
.ability-row,
.analysis-side-rail,
.analysis-brief__item {
  min-width: 0;
}

.analysis-panel {
  position: relative;
  padding: 22px 22px 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.44), rgba(7, 14, 29, 0.22)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.05), transparent 38%);
  box-shadow: 0 18px 38px rgba(2, 6, 23, 0.14);
}

.analysis-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent 28%);
  pointer-events: none;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-kicker {
  margin: 0 0 8px;
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.3rem;
  font-weight: 700;
}

.panel-caption {
  max-width: 40rem;
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.6;
}

.panel-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  color: #cbd5e1;
  font-size: 0.78rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.4);
}

.abilities-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 22px;
  align-items: start;
}

.analysis-brief {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.74), rgba(7, 14, 29, 0.46)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), transparent 34%);
  box-shadow: 0 16px 34px rgba(2, 6, 23, 0.14);
}

.analysis-brief__head {
  display: grid;
  gap: 8px;
}

.analysis-brief__kicker {
  margin: 0;
  color: #67e8f9;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.analysis-brief__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.18rem;
  line-height: 1.25;
}

.analysis-brief__caption {
  margin: 0;
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.65;
}

.analysis-brief__list {
  display: grid;
  gap: 10px;
}

.analysis-brief__item {
  display: grid;
  gap: 6px;
  padding: 14px 14px 13px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.34);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.analysis-brief__item:hover {
  transform: translateY(-2px);
  border-color: rgba(125, 211, 252, 0.16);
  background: rgba(15, 23, 42, 0.42);
}

.analysis-brief__label {
  color: #7dd3fc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.analysis-brief__value {
  color: #f8fafc;
  font-size: 1.04rem;
  line-height: 1.35;
}

.analysis-brief__note {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.6;
}

.chart-surface {
  padding: 16px 18px 14px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.24);
}

.radar-container {
  width: 100%;
  height: 360px;
}

.chart-surface__legend {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  padding: 4px 6px 0;
  color: #94a3b8;
  font-size: 0.78rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-dot,
.legend-line {
  display: inline-block;
  flex: 0 0 auto;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-dot--current {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.legend-line {
  width: 18px;
  height: 0;
  border-top: 2px dashed rgba(255, 255, 255, 0.55);
}

.ability-column {
  display: grid;
  gap: 14px;
}

.ability-spotlight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.spotlight-card {
  display: grid;
  gap: 6px;
  padding: 15px 16px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.28);
}

.spotlight-card--alert {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.38), rgba(15, 23, 42, 0.2)),
    radial-gradient(circle at top right, rgba(248, 113, 113, 0.08), transparent 48%);
}

.spotlight-label {
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.spotlight-title {
  color: #f8fafc;
  font-size: 1.06rem;
  line-height: 1.35;
}

.spotlight-meta {
  color: #94a3b8;
  font-size: 0.82rem;
}

.ability-list {
  display: grid;
  gap: 10px;
}

.ability-row {
  padding: 14px 15px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.22);
}

.ability-row__top,
.ability-row__foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.ability-row__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ability-row__title strong,
.ability-row__score strong {
  color: #f8fafc;
}

.ability-row__title span,
.ability-row__score span,
.ability-row__foot {
  color: #94a3b8;
}

.ability-row__title > div {
  display: grid;
  gap: 2px;
}

.ability-row__title > div span {
  font-size: 0.78rem;
}

.ability-row__score {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 0.84rem;
}

.ability-row__score strong {
  font-size: 1.2rem;
  line-height: 1;
}

.ability-row__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgba(15, 23, 42, 0.65);
}

.ability-row__track {
  height: 7px;
  margin: 12px 0 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(51, 65, 85, 0.7);
}

.ability-row__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.ability-row__foot {
  font-size: 0.76rem;
}

.analysis-empty {
  padding: 12px 0 0;
}

.analysis-empty__body {
  display: grid;
  justify-items: center;
  gap: 14px;
  padding: 54px 24px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(8, 15, 30, 0.9), rgba(8, 15, 30, 0.72)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent 34%);
}

.analysis-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  color: #f8fafc;
  font-size: 32px;
  border-radius: 22px;
  background: rgba(56, 189, 248, 0.16);
}

.analysis-empty__body h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.6rem;
}

.analysis-empty__body p {
  max-width: 34rem;
  margin: 0;
  color: #94a3b8;
  line-height: 1.7;
}

:global(html[data-theme='light'] .analysis-page) {
  color: #0f172a;
  background:
    linear-gradient(180deg, rgba(253, 254, 255, 0.96), rgba(244, 248, 252, 0.98) 52%, rgba(248, 250, 252, 0.98)),
    radial-gradient(circle at top left, rgba(186, 230, 253, 0.32), transparent 30%),
    radial-gradient(circle at top right, rgba(196, 181, 253, 0.18), transparent 26%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 40px;
  box-shadow:
    0 28px 60px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

:global(html[data-theme='light'] .analysis-page::before) {
  top: -18px;
  left: -112px;
  width: 430px;
  height: 430px;
  background: radial-gradient(circle, rgba(125, 211, 252, 0.26), transparent 72%);
}

:global(html[data-theme='light'] .analysis-page::after) {
  top: 330px;
  right: -120px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(191, 219, 254, 0.24), transparent 72%);
}

:global(html[data-theme='light'] .analysis-workbench) {
  position: relative;
  gap: 28px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 34px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(248, 250, 252, 0.88)),
    radial-gradient(circle at top right, rgba(224, 242, 254, 0.7), transparent 32%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 18px 44px rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(18px);
}

:global(html[data-theme='light'] .analysis-panel) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.86)),
    radial-gradient(circle at top right, rgba(186, 230, 253, 0.28), transparent 38%);
  box-shadow:
    0 16px 34px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

:global(html[data-theme='light'] .analysis-panel::before) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), transparent 34%);
}

:global(html[data-theme='light'] .panel-kicker),
:global(html[data-theme='light'] .analysis-brief__kicker),
:global(html[data-theme='light'] .analysis-brief__label) {
  color: #0284c7;
}

:global(html[data-theme='light'] .panel-title),
:global(html[data-theme='light'] .analysis-brief__title),
:global(html[data-theme='light'] .spotlight-title),
:global(html[data-theme='light'] .ability-row__title strong),
:global(html[data-theme='light'] .ability-row__score strong),
:global(html[data-theme='light'] .analysis-empty__body h2) {
  color: #0f172a;
}

:global(html[data-theme='light'] .panel-caption),
:global(html[data-theme='light'] .analysis-brief__caption),
:global(html[data-theme='light'] .analysis-brief__note),
:global(html[data-theme='light'] .spotlight-meta),
:global(html[data-theme='light'] .spotlight-label),
:global(html[data-theme='light'] .chart-surface__legend),
:global(html[data-theme='light'] .ability-row__title span),
:global(html[data-theme='light'] .ability-row__score span),
:global(html[data-theme='light'] .ability-row__foot),
:global(html[data-theme='light'] .analysis-empty__body p) {
  color: #64748b;
}

:global(html[data-theme='light'] .panel-chip) {
  color: #334155;
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

:global(html[data-theme='light'] .analysis-brief) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    radial-gradient(circle at top right, rgba(186, 230, 253, 0.3), transparent 34%);
  box-shadow:
    0 16px 34px rgba(15, 23, 42, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

:global(html[data-theme='light'] .analysis-brief__item),
:global(html[data-theme='light'] .spotlight-card),
:global(html[data-theme='light'] .ability-row),
:global(html[data-theme='light'] .chart-surface) {
  border-color: rgba(148, 163, 184, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(241, 245, 249, 0.72));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 10px 22px rgba(148, 163, 184, 0.08);
}

:global(html[data-theme='light'] .analysis-brief__item:hover) {
  border-color: rgba(56, 189, 248, 0.24);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(239, 246, 255, 0.82));
}

:global(html[data-theme='light'] .spotlight-card--alert) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 241, 242, 0.88)),
    radial-gradient(circle at top right, rgba(251, 191, 36, 0.16), transparent 48%);
}

:global(html[data-theme='light'] .legend-line) {
  border-top-color: rgba(71, 85, 105, 0.34);
}

:global(html[data-theme='light'] .ability-row__dot) {
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.9);
}

:global(html[data-theme='light'] .ability-row__track) {
  background: rgba(203, 213, 225, 0.72);
}

:global(html[data-theme='light'] .analysis-empty__body) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    radial-gradient(circle at top right, rgba(186, 230, 253, 0.24), transparent 36%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 18px 38px rgba(148, 163, 184, 0.12);
}

:global(html[data-theme='light'] .analysis-empty__icon) {
  color: #0284c7;
  background: rgba(186, 230, 253, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

@media (min-width: 1101px) {
  :global(html[data-theme='light'] .analysis-page) {
    padding: 28px 32px 72px;
  }

  :global(html[data-theme='light'] .analysis-workbench) {
    padding: 28px;
    border-radius: 36px;
  }
}

@keyframes analysis-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1350px) {
  .analysis-main-grid {
    grid-template-columns: minmax(0, 1.12fr) minmax(288px, 0.88fr);
  }

  .abilities-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1280px) and (min-width: 721px) {
  .analysis-main-grid {
    grid-template-columns: 1fr;
  }

  .analysis-side-rail {
    position: relative;
    top: 0;
  }
}

@media (max-width: 1100px) {
  .analysis-page {
    padding: 20px 20px 42px;
  }

  .analysis-main-grid {
    grid-template-columns: 1fr;
  }

  .analysis-side-rail {
    position: relative;
    top: 0;
  }
}

@media (max-width: 720px) {
  .analysis-page {
    padding: 16px 12px 28px;
  }

  .analysis-workbench,
  .analysis-main-grid {
    gap: 18px;
  }

  .analysis-side-rail {
    gap: 14px;
  }

  .analysis-panel {
    padding: 18px 16px;
    border-radius: 22px;
  }

  .analysis-brief {
    padding: 18px 16px;
    border-radius: 22px;
  }

  .panel-head,
  .ability-row__top,
  .ability-row__foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .ability-spotlight-grid {
    grid-template-columns: 1fr;
  }

  .chart-surface {
    padding: 12px 12px 10px;
    border-radius: 18px;
  }

  .radar-container {
    height: 260px;
  }

  .ability-row {
    padding: 13px 13px 12px;
    border-radius: 16px;
  }

  .analysis-empty__body {
    padding: 40px 18px;
    border-radius: 22px;
  }

  .analysis-empty__body h2 {
    font-size: 1.32rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .analysis-workbench > *,
  .analysis-brief__item {
    animation: none;
    transition: none;
  }
}
</style>
