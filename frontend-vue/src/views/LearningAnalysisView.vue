<script setup>
import { onMounted, ref, watch, nextTick } from 'vue'
import { 
  NCard, NGrid, NGridItem, NProgress, NTag, NSpace, NIcon, NDivider, NSpin, NEmpty, NButton, useMessage
} from 'naive-ui'
import { 
  Brain, TrendingUp, Target, Zap, AlertCircle, 
  BarChart2, ArrowUpRight, Activity, Sparkles
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(true)
const generating = ref(false)
const reportData = ref(null)
const trendChartRef = ref(null)
let trendChart = null

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
}

const fetchTrendAndInitChart = async () => {
    try {
        const res = await learningApi.getTrends(7)
        if (res.code === 200) {
            nextTick(() => {
                initTrendChart(res.data)
            })
        }
    } catch (error) {
        console.error('Trend data fail:', error)
    }
}

const initTrendChart = (data) => {
    if (!trendChartRef.value) return
    if (trendChart) trendChart.dispose()
    
    trendChart = echarts.init(trendChartRef.value, 'dark')
    
    // 安全处理数据
    const trendStats = data.trendStats || []
    const dates = trendStats.map(d => d.date.split('-').slice(1).join('/'))
    const accuracies = trendStats.map(d => (d.accuracy * 100).toFixed(1))
    
    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#27272a',
            borderColor: '#3f3f46',
            textStyle: { color: '#fff' }
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

onMounted(() => {
    fetchLastReport()
    window.addEventListener('resize', () => trendChart?.resize())
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
        >
          <template #icon>
            <n-icon><Sparkles /></n-icon>
          </template>
          重新进行 AI 深度分析
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
                       <div class="stat-icon-box purple">
                          <n-icon :component="Brain" />
                       </div>
                       <div class="stat-text">
                          <div class="label">综合能力值</div>
                          <div class="value">{{ stats.overall }}</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
              <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box green">
                          <n-icon :component="TrendingUp" />
                       </div>
                       <div class="stat-text">
                          <div class="label">较上周提升</div>
                          <div class="value green">+{{ stats.growth }}%</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
              <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box orange">
                          <n-icon :component="Target" />
                       </div>
                       <div class="stat-text">
                          <div class="label">距目标差距</div>
                          <div class="value orange">{{ stats.gap }}%</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
              <n-grid-item>
                 <n-card class="stat-card" :bordered="false">
                    <div class="stat-content">
                       <div class="stat-icon-box blue">
                          <n-icon :component="Zap" />
                       </div>
                       <div class="stat-text">
                          <div class="label">预测分值 (CET)</div>
                          <div class="value">{{ stats.predict }}</div>
                       </div>
                    </div>
                 </n-card>
              </n-grid-item>
           </n-grid>
        </div>

        <!-- Main Analysis -->
        <div class="analysis-layout">
           <n-grid x-gap="24" y-gap="24" cols="1 900:3" responsive="screen">
              
              <!-- Left: Ability Radar/Progress -->
              <n-grid-item span="1">
                 <n-card title="能力分布" class="ability-card" :bordered="false">
                    <template #header-extra>
                       <n-icon :component="Activity" color="#a1a1aa" />
                    </template>
                    <div class="ability-list">
                       <div v-for="item in abilities" :key="item.name" class="ability-item">
                          <div class="item-header">
                             <span class="name">{{ item.name }}</span>
                             <span class="score" :style="{ color: item.color }">{{ item.current }}%</span>
                          </div>
                          <n-progress 
                             type="line" 
                             :percentage="item.current" 
                             :color="item.color"
                             :rail-color="'rgba(255,255,255,0.1)'"
                             :height="6"
                             :show-indicator="false"
                          />
                          <div class="target-line" :style="{ left: item.target + '%' }"></div>
                          <div class="item-footer">
                             目标: {{ item.target }}%
                          </div>
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
                        
                        <div class="weakness-list">
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
                    </n-card>

                    <n-card title="学习准确率趋势" class="trend-card" :bordered="false">
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
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(120deg, #818cf8, #c084fc);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.page-header p { color: #a1a1aa; }

/* Overview Stats */
.overview-section { margin-bottom: 24px; }
.stat-card {
    background: rgba(30,30,35,0.6);
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

.right-col-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* Ability Card */
.ability-card, .advice-card, .trend-card {
    background: rgba(30,30,35,0.6);
    border-radius: 16px;
}

.ability-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-top: 12px;
}
.ability-item { position: relative; }
.item-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.95rem; color: #e4e4e7; font-weight: 500; }
.item-footer { font-size: 0.75rem; color: #71717a; margin-top: 4px; text-align: right; }
.target-line {
    position: absolute;
    top: 28px;
    height: 6px;
    width: 2px;
    background: #fff;
    opacity: 0.5;
    z-index: 10;
}

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
    background: rgba(30,30,35,0.6);
    border-radius: 16px;
}
</style>
