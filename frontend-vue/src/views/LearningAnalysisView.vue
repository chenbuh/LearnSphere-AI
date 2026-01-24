<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { 
  NCard, NGrid, NGridItem, NProgress, NTag, NSpace, NIcon, NDivider, NSpin, NEmpty, NButton, useMessage
} from 'naive-ui'
import { 
  Brain, TrendingUp, Target, Zap, AlertCircle, 
  BarChart2, ArrowUpRight, Activity, Sparkles,
  ShieldCheck, Lock, Fingerprint
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(true)
const generating = ref(false)
const reportData = ref(null)
const trendChartRef = ref(null)
const radarChartRef = ref(null)
let trendChart = null
let radarChart = null

import { useTypewriter } from '@/composables/useTypewriter'
const { displayedText: aiDisplayedAnalysis, startTyping: startAiTyping } = useTypewriter('', 15)

const stats = ref({
  overall: 0,
  growth: 0,
  gap: 0,
  predict: 0
})

const abilities = ref([])
const weakPoints = ref([])

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
            message.success('AI 深度分析报告已重新生成')
            // 生成成功后，刷新趋势图（解决首次生成无图表的问题）
            fetchTrendAndInitChart()
        }
    } catch (error) {
        message.error('分析生成失败，请稍后重试')
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

    // Start typewriter for AI analysis
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

const initTrendChart = (data) => {
    if (!trendChartRef.value) return
    
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
                        学习准确率: ${item.value}%`;
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
                name: '学习准确率',
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

const initRadarChart = () => {
    if (!radarChartRef.value || !abilities.value.length) return
    
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
                    name: '目标水平',
                    symbol: 'none',
                    lineStyle: { type: 'dashed', color: 'rgba(255, 255, 255, 0.3)', width: 1 },
                    areaStyle: { color: 'rgba(255, 255, 255, 0.02)' }
                },
                {
                    value: currentValues,
                    name: '当前水平',
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
          <h1>学习分析</h1>
          <p>基于 AI 的全方位能力评估报告</p>
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
          开启加密 AI 深度分析
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
                          <div class="label">综合能力值</div>
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
                          <div class="label">较上周提升</div>
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
                          <div class="label">距目标差距</div>
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
                          <div class="label">预测分值 (CET)</div>
                          <div class="value text-glow">{{ stats.predict }}</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
           </n-grid>
        </div>

        <!-- AI 导师综合点评 (新增) -->
        <div v-if="reportData.aiAnalysis" class="ai-analysis-section">
           <n-card class="ai-analysis-card" :bordered="false">
              <template #header>
                 <div class="ai-header-content">
                    <div class="ai-header-title">
                        <n-icon :component="Sparkles" size="20" color="#fbbf24" />
                        <span>LearnSphere Sentinel | AI 导师综合点评</span>
                    </div>
                    <div class="ai-security-badge">
                        <ShieldCheck :size="12" class="mr-1" /> 已通过本地隐私模型审计
                    </div>
                 </div>
              </template>
              <div class="ai-content">
                 {{ aiDisplayedAnalysis }}<span v-if="aiDisplayedAnalysis.length < (reportData.aiAnalysis || '').length" class="typing-cursor">_</span>
              </div>
           </n-card>
        </div>

        <!-- Main Analysis -->
        <div class="analysis-layout">
           <n-grid x-gap="24" y-gap="24" cols="1 900:3" responsive="screen">
              
              <!-- Left: Ability Radar/Progress -->
               <n-grid-item span="1">
                  <n-card title="六维能力态势" class="ability-card" :bordered="false">
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
                    <n-card title="薄弱项诊断 & 建议" class="advice-card" :bordered="false">
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
                                        得分: {{ wp.score }}
                                    </n-tag>
                                </div>
                                <div class="wp-advice">
                                    <span class="label">AI 建议:</span>
                                    {{ wp.advice }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="weakness-empty">
                            <n-icon :component="Sparkles" size="40" color="#fbbf24" style="margin-bottom: 12px" />
                            <div class="empty-title">太棒了！暂无明显薄弱项</div>
                            <div class="empty-desc">您的各项能力发展均衡，请继续保持当前的良好状态！</div>
                        </div>
                    </n-card>

                    <n-card class="trend-card" :bordered="false">
                        <template #header>
                             <div class="trend-header">
                                 <span>学习准确率趋势</span>
                                 <div class="trend-tabs">
                                     <span :class="{ active: trendDays === 7 }" @click="changeTrendDays(7)">近7天</span>
                                     <span :class="{ active: trendDays === 30 }" @click="changeTrendDays(30)">近30天</span>
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
        <n-empty description="尚未生成分析报告，点击上方按钮开启 AI 深度分析">
          <template #extra>
            <n-button type="primary" :loading="generating" @click="generateNewReport">
                <template #icon><n-icon><Sparkles /></n-icon></template>
                立即生成分析报告
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
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.05), rgba(139, 92, 246, 0.05));
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 16px;
    position: relative;
    overflow: hidden;
}
.ai-analysis-card::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
}
@keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
}
.ai-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}
.ai-header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 1.1rem;
    color: #fbbf24;
    letter-spacing: 0.05em;
}
.ai-security-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 99px;
    border: 1px solid rgba(16, 185, 129, 0.2);
}
.ai-content {
    font-size: 1rem;
    line-height: 1.8;
    color: #e4e4e7;
    padding: 12px;
    background: rgba(0,0,0,0.2);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.05);
    white-space: pre-wrap;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    position: relative;
}

.typing-cursor {
  color: #fbbf24;
  animation: blink 1s infinite;
  margin-left: 2px;
  font-weight: bold;
}

@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

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
