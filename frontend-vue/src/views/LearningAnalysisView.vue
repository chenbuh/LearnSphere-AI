<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick, computed } from 'vue'
import {
  NCard, NGrid, NGridItem, NProgress, NTag, NSpace, NIcon, NDivider, NSpin, NEmpty, NButton, useMessage
} from 'naive-ui'
import {
  Brain, TrendingUp, Target, Zap, AlertCircle,
  BarChart2, ArrowUpRight, Activity, Sparkles,
  ShieldCheck, Lock, Fingerprint
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import { useI18n } from 'vue-i18n'

const message = useMessage()
const { locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en-US')
const L = (zh, en) => (isEnglish.value ? en : zh)
const loading = ref(true)
const generating = ref(false)
const reportData = ref(null)
const trendChartRef = ref(null)
const radarChartRef = ref(null)
let trendChart = null
let radarChart = null
let echartsModule = null

const getEcharts = async () => {
    if (!echartsModule) {
        const mod = await import('@/utils/echarts')
        echartsModule = mod.default
    }
    return echartsModule
}

import { useTypewriter } from '@/composables/useTypewriter'
const { displayedText: aiDisplayedAnalysis, startTyping: startAiTyping } = useTypewriter('', 10)

const stats = ref({
  overall: 0,
  growth: 0,
  gap: 0,
  predict: 0
})

const abilities = ref([])
const weakPoints = ref([])

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

// 获取上次生成的报告
const fetchLastReport = async () => {
    loading.value = true
    try {
        const res = await learningApi.getLastAnalysis()
        if (res.code === 200 && res.data) {
            updateUI(res.data)
        } else {
            // 如果没有历史报告，也不报错，显示空状态或提示生成
            reportData.value = null
        }
    } catch (error) {
        console.error('Failed to fetch last report:', error)
    } finally {
        loading.value = false
        // 获取趋势数据并初始化图表
        fetchTrendAndInitChart()
    }
}

// 触发 AI 生成新报告
const generateNewReport = async () => {
    generating.value = true
    try {
        const res = await learningApi.generateAnalysis()
        if (res.code === 200) {
            updateUI(res.data)
            message.success(L('AI 深度分析报告已重新生成', 'AI deep analysis report has been regenerated.'))
            // 生成成功后，刷新趋势图（解决首次生成无图表的问题）
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

    // Start typewriter for AI analysis with emotion
    if (data.aiAnalysis) {
        startAiTyping(data.aiAnalysis)
    }

    // Refresh charts
    nextTick(() => {
        initRadarChart()
    })
}

const trendDays = ref(7) // 7 or 30

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
    
    // 安全地销毁旧实例
    if (trendChart && !trendChart.isDisposed()) {
        trendChart.dispose()
    }
    
    trendChart = echarts.init(trendChartRef.value, 'dark')
    
    // 安全处理数据
    const trendStats = data.trendStats || []
    const dates = trendStats.map(d => d.date.split('-').slice(1).join('/'))
    const accuracies = trendStats.map(d => d.accuracy === null ? null : parseFloat(d.accuracy).toFixed(1))
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#27272a',
            borderColor: '#3f3f46',
            textStyle: { color: '#fff' },
            formatter: (params) => {
                const item = params[0];
                if (!item || item.value == null) return '';
                return `${item.name}<br/>
                        <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${item.color};"></span>
                        ${L('学习准确率', 'Learning Accuracy')}: ${item.value}%`;
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
    }
    
    trendChart.setOption(option)
}

const initRadarChart = async () => {
    if (!radarChartRef.value || !abilities.value.length) return
    const echarts = await getEcharts()
    
    // 安全地销毁旧实例
    if (radarChart && !radarChart.isDisposed()) {
        radarChart.dispose()
    }
    
    radarChart = echarts.init(radarChartRef.value, 'dark')
    
    const indicators = abilities.value.map(a => ({ name: a.name, max: 100 }))
    const currentValues = abilities.value.map(a => a.current)
    const targetValues = abilities.value.map(a => a.target)
    
    const option = {
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
        series: [{
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
        }]
    }
    radarChart.setOption(option)
}

onMounted(() => {
    fetchLastReport()
    window.addEventListener('resize', () => {
        if (trendChart && !trendChart.isDisposed()) {
            trendChart.resize()
        }
        if (radarChart && !radarChart.isDisposed()) {
            radarChart.resize()
        }
    })
})

onBeforeUnmount(() => {
    // 安全地销毁图表实例
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
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1>{{ L('学习分析', 'Learning Analysis') }}</h1>
          <p>{{ L('基于 AI 的全方位能力评估报告', 'Comprehensive AI-powered capability assessment report') }}</p>
        </div>
        <n-button
          type="primary"
          secondary
          round
          :loading="generating"
          @click="generateNewReport"
          class="secure-btn"
        >
          <template #icon>
            <n-icon><Lock /></n-icon>
          </template>
          {{ reportData ? L('重新生成', 'Regenerate') : L('开启', 'Start') }} AI {{ L('深度分析', 'Deep Analysis') }}
        </n-button>
      </div>
    </div>

    <n-spin :show="loading">
      <div v-if="reportData" class="analysis-content">
        <!-- Overview Stats -->
        <div class="overview-section">
           <n-grid x-gap="20" y-gap="20" cols="1 600:2 1000:4" responsive="screen">
               <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box purple shadow-glow-purple">
                          <n-icon :component="Brain" />
                       </div>
                       <div class="stat-text">
                          <div class="label">{{ L('综合能力值', 'Overall Score') }}</div>
                          <div class="value text-glow">{{ stats.overall }}</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
              <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box green shadow-glow-green">
                          <n-icon :component="TrendingUp" />
                       </div>
                       <div class="stat-text">
                          <div class="label">{{ L('较上周提升', 'Week-over-Week Growth') }}</div>
                          <div class="value green text-glow">+{{ stats.growth }}%</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
              <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box orange shadow-glow-orange">
                          <n-icon :component="Target" />
                       </div>
                       <div class="stat-text">
                          <div class="label">{{ L('距目标差距', 'Gap to Target') }}</div>
                          <div class="value orange text-glow">{{ stats.gap }}%</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
              <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box blue shadow-glow-blue">
                          <n-icon :component="Zap" />
                       </div>
                       <div class="stat-text">
                          <div class="label">{{ L('预测分值 (CET)', 'Predicted CET Score') }}</div>
                          <div class="value text-glow">{{ stats.predict }}</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
           </n-grid>
        </div>

        <!-- AI 导师综合点评 -->
        <div v-if="reportData.aiAnalysis" class="ai-analysis-section">
           <n-card class="ai-analysis-card" :bordered="false">
              <template #header>
                 <div class="ai-header-content">
                    <div class="ai-header-title">
                        <n-icon :component="Sparkles" size="22" color="#fbbf24" class="sparkle-icon" />
                        <span>{{ L('AI 导师专属点评', 'AI Tutor Personalized Commentary') }}</span>
                        <n-tag type="success" size="small" :bordered="false" style="margin-left: 12px;">
                            <template #icon><n-icon :component="ShieldCheck" :size="12" /></template>
                            {{ L('基于真实数据', 'Based on Real Data') }}
                        </n-tag>
                    </div>
                    <div class="ai-refresh-hint">
                        <n-icon v-if="generating" :component="Activity" :size="14" color="#a78bfa" class="spin-icon" />
                        <span>{{ generating ? L('AI 正在分析中...', 'AI is analyzing...') : L('基于真实数据生成', 'Generated from real data') }}</span>
                    </div>
                 </div>
              </template>
              <div class="ai-content-wrapper">
                 <div class="ai-content">
                    <n-spin :show="generating" :description="L('AI 正在根据你的学习数据生成个性化点评...', 'AI is generating personalized commentary from your learning data...')" size="small">
                        <span v-html="formattedAiAnalysis"></span><span v-if="aiDisplayedAnalysis.length < (reportData.aiAnalysis || '').length && !generating" class="typing-cursor">✍️</span>
                        <span v-if="generating" class="generating-text">{{ L('AI 正在深度分析你的学习数据...', 'AI is deeply analyzing your learning data...') }}</span>
                    </n-spin>
                 </div>
              </div>
           </n-card>
        </div>

        <!-- Main Analysis -->
        <div class="analysis-layout">
           <n-grid x-gap="24" y-gap="24" cols="1 900:3" responsive="screen">
              
              <!-- Left: Ability Radar/Progress -->
               <n-grid-item span="1">
                  <n-card :title="L('六维能力态势', 'Six-Dimension Ability Profile')" class="ability-card" :bordered="false">
                     <template #header-extra>
                        <n-icon :component="Activity" color="#6366f1" />
                     </template>
                     <div class="radar-container" ref="radarChartRef"></div>
                     <div class="ability-compact-list mt-4">
                        <div v-for="item in abilities" :key="item.name" class="ability-mini">
                           <span class="dot" :style="{ background: item.color }"></span>
                           <span class="name">{{ item.name }}</span>
                           <span class="val">{{ item.current }}%</span>
                        </div>
                     </div>
                  </n-card>
               </n-grid-item>

              <!-- Right: Weak Points & Trend -->
              <n-grid-item span="2">
                 <div class="right-col-stack">
                    <n-card :title="L('薄弱项诊断 & 建议', 'Weakness Diagnosis & Suggestions')" class="advice-card" :bordered="false">
                        <template #header-extra>
                            <n-icon :component="AlertCircle" color="#ef4444" />
                        </template>
                        
                        <div class="weakness-list" v-if="weakPoints.length > 0">
                            <div v-for="(wp, idx) in weakPoints" :key="idx" class="weakness-item">
                                <div class="wp-header">
                                    <div class="wp-title">
                                        <n-icon :component="AlertCircle" :color="wp.color" class="mr-2" style="margin-right: 8px" />
                                        {{ wp.title }}
                                    </div>
                                    <n-tag :color="{ color: 'rgba(239, 68, 68, 0.1)', textColor: '#ef4444' }" size="small" :bordered="false">
                                        {{ L('得分', 'Score') }}: {{ wp.score }}
                                    </n-tag>
                                </div>
                                <div class="wp-advice">
                                    <span class="label">{{ L('AI 建议', 'AI Advice') }}:</span>
                                    {{ wp.advice }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="weakness-empty">
                            <n-icon :component="Sparkles" size="40" color="#fbbf24" style="margin-bottom: 12px" />
                            <div class="empty-title">{{ L('太棒了！暂无明显薄弱项', 'Great work! No obvious weak points for now.') }}</div>
                            <div class="empty-desc">{{ L('您的各项能力发展均衡，请继续保持当前的良好状态！', 'Your abilities are developing in a balanced way. Keep it up!') }}</div>
                        </div>
                    </n-card>

                    <n-card class="trend-card" :bordered="false">
                        <template #header>
                             <div class="trend-header">
                                 <span>{{ L('学习准确率趋势', 'Learning Accuracy Trend') }}</span>
                                 <div class="trend-tabs">
                                     <span :class="{ active: trendDays === 7 }" @click="changeTrendDays(7)">{{ L('近7天', 'Last 7 Days') }}</span>
                                     <span :class="{ active: trendDays === 30 }" @click="changeTrendDays(30)">{{ L('近30天', 'Last 30 Days') }}</span>
                                 </div>
                             </div>
                        </template>
                        <div ref="trendChartRef" class="trend-chart"></div>
                    </n-card>
                 </div>
              </n-grid-item>

           </n-grid>
        </div>
      </div>
      <div v-else-if="!loading" class="empty-state">
        <n-empty :description="L('尚未生成分析报告，点击上方按钮开启 AI 深度分析', 'No analysis report yet. Click the button above to start AI deep analysis.')">
          <template #extra>
            <n-button type="primary" :loading="generating" @click="generateNewReport">
                <template #icon><n-icon><Sparkles /></n-icon></template>
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

.page-header {
    margin-bottom: 32px;
}
.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}
.page-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.page-header p { color: #71717a; font-size: 1.1rem; }

/* Overview Stats */
.overview-section { margin-bottom: 24px; }
.stat-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-2px); }

.stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
}
.stat-icon-box {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px;
}
.stat-icon-box.purple { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
.stat-icon-box.green { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.stat-icon-box.orange { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.stat-icon-box.blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }

.stat-text .label { font-size: 0.8rem; color: #a1a1aa; margin-bottom: 2px; }
.stat-text .value { font-size: 1.5rem; font-weight: 700; color: #fff; line-height: 1; }
.stat-text .value.green { color: #34d399; }
.stat-text .value.orange { color: #fbbf24; }

/* AI 导师点评卡片 */
.ai-analysis-section { margin-bottom: 24px; }
.ai-analysis-card {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(139, 92, 246, 0.06));
    border: 1.5px solid rgba(251, 191, 36, 0.25);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15);
    transition: all 0.3s ease;
}
.ai-analysis-card:hover {
    box-shadow: 0 12px 40px rgba(251, 191, 36, 0.25);
    transform: translateY(-2px);
}
.ai-analysis-card::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
    animation: gentle-pulse 6s ease-in-out infinite;
    pointer-events: none;
}
@keyframes gentle-pulse {
    0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
    50% { opacity: 0.6; transform: scale(1.02) rotate(1deg); }
}
.ai-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: relative;
    z-index: 1;
}
.ai-header-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 800;
    font-size: 1.15rem;
    background: linear-gradient(90deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.08em;
}
.sparkle-icon {
    animation: sparkle-rotate 3s ease-in-out infinite;
}
@keyframes sparkle-rotate {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(10deg) scale(1.1); }
    75% { transform: rotate(-10deg) scale(1.05); }
}
.ai-refresh-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(234, 179, 8, 0.15);
    color: #eab308;
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 99px;
    border: 1px solid rgba(234, 179, 8, 0.3);
}
.spin-icon {
    animation: spin 1s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.ai-content-wrapper {
    position: relative;
    z-index: 1;
}
.ai-content {
    font-size: 1.05rem;
    line-height: 1.9;
    color: #e4e4e7;
    padding: 20px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    white-space: pre-wrap;
    font-family: 'Inter', 'system-ui', -apple-system, sans-serif;
    position: relative;
    min-height: 100px;
    letter-spacing: 0.02em;
}
/* 生成中的文本样式 */
.generating-text {
    color: #fbbf24;
    font-style: italic;
    animation: pulse-text 1.5s ease-in-out infinite;
}
@keyframes pulse-text {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
.ai-content :deep(.ai-emphasis) {
    font-weight: 700;
    color: #fbbf24;
}

.typing-cursor {
    color: #fbbf24;
    animation: cursor-blink 1s infinite;
    margin-left: 2px;
    font-size: 1.2em;
    font-weight: bold;
    display: inline-block;
}
@keyframes cursor-blink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
}

.ai-actions {
    display: flex;
    gap: 12px;
    margin-top: 16px;
    justify-content: flex-end;
}

.right-col-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Ability Card */
.radar-container {
    height: 300px;
    width: 100%;
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
    font-size: 0.8rem;
    color: #a1a1aa;
    background: rgba(255,255,255,0.02);
    padding: 6px 10px;
    border-radius: 8px;
}
.ability-mini .dot { width: 6px; height: 6px; border-radius: 50%; }
.ability-mini .val { margin-left: auto; color: #fff; font-weight: 600; }

/* Weakness List */
.weakness-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.weakness-item {
    background: rgba(255,255,255,0.03);
    border-radius: 12px;
    padding: 16px;
    border: 1px solid rgba(255,255,255,0.05);
}
.wp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.wp-title { display: flex; align-items: center; font-weight: 700; color: #e4e4e7; font-size: 1rem; }
.wp-advice { font-size: 0.9rem; color: #d4d4d8; line-height: 1.5; }
.wp-advice .label { color: #a1a1aa; margin-right: 8px; }

.trend-chart {
    height: 240px;
    width: 100%;
}


.empty-state {
    padding: 80px 0;
    text-align: center;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
}

.weakness-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    text-align: center;
}
.weakness-empty .empty-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #fbbf24;
    margin-bottom: 8px;
}
.weakness-empty .empty-desc {
    font-size: 0.9rem;
    color: #a1a1aa;
}
/* Glow Utilities */
.shadow-glow-purple { box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); }
.shadow-glow-green { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
.shadow-glow-orange { box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
.shadow-glow-blue { box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); }

.text-glow { color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.3); }
.mt-4 { margin-top: 16px; }

.advice-card, .trend-card, .ability-card {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-radius: 16px;
}

.trend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.trend-tabs {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 2px;
}
.trend-tabs span {
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 6px;
    color: #a1a1aa;
    transition: all 0.2s;
}
.trend-tabs span.active {
    background: #6366f1;
    color: #fff;
}
.trend-tabs span:hover:not(.active) {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
}
</style>
