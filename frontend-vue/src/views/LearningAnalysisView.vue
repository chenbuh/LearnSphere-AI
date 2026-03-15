<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { NButton, NCard, NEmpty, NGrid, NGridItem, NIcon, NSpin, useMessage } from 'naive-ui'
import { Activity, Sparkles } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { learningApi } from '@/api/learning'
import LearningAnalysisAiCard from '@/components/learning/LearningAnalysisAiCard.vue'
import LearningAnalysisHeader from '@/components/learning/LearningAnalysisHeader.vue'
import LearningAnalysisInsightsPanel from '@/components/learning/LearningAnalysisInsightsPanel.vue'
import LearningAnalysisOverviewSection from '@/components/learning/LearningAnalysisOverviewSection.vue'
import { useTypewriter } from '@/composables/useTypewriter'

const message = useMessage()
const { locale } = useI18n()
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
}

const overviewLabels = computed(() => ({
  overall: L('综合能力值', 'Overall Score'),
  growth: L('较上周提升', 'Week-over-Week Growth'),
  gap: L('距目标差距', 'Gap to Target'),
  predict: L('预测分值 (CET)', 'Predicted CET Score')
}))

const aiCardLabels = computed(() => ({
  title: L('AI 导师专属点评', 'AI Tutor Personalized Commentary'),
  badge: L('基于真实数据', 'Based on Real Data'),
  generatingHint: L('AI 正在分析中...', 'AI is analyzing...'),
  readyHint: L('基于真实数据生成', 'Generated from real data'),
  spinDescription: L(
    'AI 正在根据你的学习数据生成个性化点评...',
    'AI is generating personalized commentary from your learning data...'
  ),
  generatingText: L(
    'AI 正在深度分析你的学习数据...',
    'AI is deeply analyzing your learning data...'
  )
}))

const insightLabels = computed(() => ({
  weaknessTitle: L('薄弱项诊断 & 建议', 'Weakness Diagnosis & Suggestions'),
  score: L('得分', 'Score'),
  advice: L('AI 建议', 'AI Advice'),
  noWeaknessTitle: L('太棒了！暂无明显薄弱项', 'Great work! No obvious weak points for now.'),
  noWeaknessDesc: L(
    '您的各项能力发展均衡，请继续保持当前的良好状态！',
    'Your abilities are developing in a balanced way. Keep it up!'
  ),
  trendTitle: L('学习准确率趋势', 'Learning Accuracy Trend'),
  last7Days: L('近7天', 'Last 7 Days'),
  last30Days: L('近30天', 'Last 30 Days')
}))

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
      message.success(L('AI 深度分析报告已重新生成', 'AI deep analysis report has been regenerated.'))
      fetchTrendAndInitChart()
    }
  } catch (error) {
    message.error(L('分析生成失败，请稍后重试', 'Failed to generate analysis. Please try again later.'))
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

  if (data.aiAnalysis) {
    startAiTyping(data.aiAnalysis)
  }

  nextTick(() => {
    initRadarChart()
  })
}

const fetchTrendAndInitChart = async () => {
  try {
    const res = await learningApi.getTrends(trendDays.value)
    if (res.code === 200) {
      nextTick(() => {
        initTrendChart(res.data)
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
  if (!trendChartRef.value) return
  const echarts = await getEcharts()

  if (trendChart && !trendChart.isDisposed()) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value, 'dark')

  const trendStats = data.trendStats || []
  const dates = trendStats.map((item) => item.date.split('-').slice(1).join('/'))
  const accuracies = trendStats.map((item) => (
    item.accuracy === null ? null : parseFloat(item.accuracy).toFixed(1)
  ))

  trendChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#27272a',
      borderColor: '#3f3f46',
      textStyle: { color: '#fff' },
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
      axisLine: { lineStyle: { color: '#3f3f46' } },
      axisLabel: { color: '#a1a1aa' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: '#a1a1aa', formatter: '{value}%' }
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
            { offset: 0, color: 'rgba(129, 140, 248, 0.3)' },
            { offset: 1, color: 'rgba(129, 140, 248, 0)' }
          ])
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  })
}

const initRadarChart = async () => {
  if (!radarChartRef.value || !abilities.value.length) return
  const echarts = await getEcharts()

  if (radarChart && !radarChart.isDisposed()) {
    radarChart.dispose()
  }

  radarChart = echarts.init(radarChartRef.value, 'dark')

  const indicators = abilities.value.map((item) => ({ name: item.name, max: 100 }))
  const currentValues = abilities.value.map((item) => item.current)
  const targetValues = abilities.value.map((item) => item.target)

  radarChart.setOption({
    backgroundColor: 'transparent',
    radar: {
      indicator: indicators,
      shape: 'circle',
      splitNumber: 5,
      axisName: { color: '#a1a1aa' },
      splitLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.1)' } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: 'rgba(99, 102, 241, 0.1)' } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: targetValues,
            name: L('目标水平', 'Target Level'),
            symbol: 'none',
            lineStyle: { type: 'dashed', color: 'rgba(255, 255, 255, 0.3)', width: 1 },
            areaStyle: { color: 'rgba(255, 255, 255, 0.02)' }
          },
          {
            value: currentValues,
            name: L('当前水平', 'Current Level'),
            itemStyle: { color: '#6366f1' },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                { offset: 0, color: 'rgba(99, 102, 241, 0.6)' },
                { offset: 1, color: 'rgba(168, 85, 247, 0.2)' }
              ])
            }
          }
        ]
      }
    ]
  })
}

const handleResize = () => {
  if (trendChart && !trendChart.isDisposed()) {
    trendChart.resize()
  }
  if (radarChart && !radarChart.isDisposed()) {
    radarChart.resize()
  }
}

onMounted(() => {
  fetchLastReport()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)

  if (trendChart && !trendChart.isDisposed()) {
    trendChart.dispose()
    trendChart = null
  }
  if (radarChart && !radarChart.isDisposed()) {
    radarChart.dispose()
    radarChart = null
  }
})
</script>

<template>
  <div class="page-container">
    <learning-analysis-header
      :title="L('学习分析', 'Learning Analysis')"
      :subtitle="L('基于 AI 的全方位能力评估报告', 'Comprehensive AI-powered capability assessment report')"
      :button-text="`${reportData ? L('重新生成', 'Regenerate') : L('开启', 'Start')} AI ${L('深度分析', 'Deep Analysis')}`"
      :generating="generating"
      @regenerate="generateNewReport"
    />

    <n-spin :show="loading">
      <div v-if="reportData" class="analysis-content">
        <learning-analysis-overview-section :stats="stats" :labels="overviewLabels" />

        <learning-analysis-ai-card
          v-if="reportData.aiAnalysis"
          :generating="generating"
          :formatted-analysis="formattedAiAnalysis"
          :displayed-length="aiDisplayedAnalysis.length"
          :full-length="(reportData.aiAnalysis || '').length"
          :labels="aiCardLabels"
        />

        <div class="analysis-layout">
          <n-grid x-gap="24" y-gap="24" cols="1 900:3" responsive="screen">
            <n-grid-item span="1">
              <n-card :title="L('六维能力态势', 'Six-Dimension Ability Profile')" class="ability-card" :bordered="false">
                <template #header-extra>
                  <n-icon :component="Activity" color="#6366f1" />
                </template>
                <div ref="radarChartRef" class="radar-container"></div>
                <div class="ability-compact-list mt-4">
                  <div v-for="item in abilities" :key="item.name" class="ability-mini">
                    <span class="dot" :style="{ background: item.color }"></span>
                    <span class="name">{{ item.name }}</span>
                    <span class="val">{{ item.current }}%</span>
                  </div>
                </div>
              </n-card>
            </n-grid-item>

            <learning-analysis-insights-panel
              :weak-points="weakPoints"
              :trend-days="trendDays"
              :labels="insightLabels"
              :trend-chart-ref-setter="trendChartRefSetter"
              @change-trend-days="changeTrendDays"
            />
          </n-grid>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <n-empty :description="L('尚未生成分析报告，点击上方按钮开启 AI 深度分析', 'No analysis report yet. Click the button above to start AI deep analysis.')">
          <template #extra>
            <n-button type="primary" :loading="generating" @click="generateNewReport">
              <template #icon>
                <n-icon><Sparkles /></n-icon>
              </template>
              {{ L('立即生成分析报告', 'Generate Analysis Report Now') }}
            </n-button>
          </template>
        </n-empty>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.radar-container {
  width: 100%;
  height: 300px;
}

.ability-compact-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ability-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  font-size: 0.8rem;
  color: #a1a1aa;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.ability-mini .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.ability-mini .val {
  margin-left: auto;
  font-weight: 600;
  color: #fff;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.ability-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 16px;
}

@media (max-width: 768px) {
  .page-container {
    margin: 24px auto;
    padding: 0 12px;
  }

  .radar-container {
    height: 260px;
  }

  .ability-compact-list {
    grid-template-columns: 1fr;
  }

  .empty-state {
    padding: 48px 16px;
  }
}

@media (max-width: 480px) {
  .page-container {
    margin: 16px auto;
    padding: 0 8px;
  }

  .radar-container {
    height: 220px;
  }

  .ability-mini {
    padding: 8px 10px;
    font-size: 0.78rem;
  }
}
</style>
