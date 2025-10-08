<script setup>
import { ref, onMounted } from 'vue'
import { NCard, NSpin, NGrid, NGridItem, NStatistic, useMessage, NProgress, NDivider, NNumberAnimation } from 'naive-ui'
import { Users, BookOpen, TrendingUp, Activity, Cloud, Server, Database, BarChart3, Filter, Wallet, UserPlus } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(true)
const stats = ref({})
const contentStats = ref({})
const aiStats = ref({})
const funnelData = ref({})
const financeStats = ref({})
const retentionData = ref([])
const userGrowthData = ref([])

// Charts
const userChartRef = ref(null)
const retentionChartRef = ref(null)
const funnelChartRef = ref(null)
const financeChartRef = ref(null)

let userChart = null
let retentionChart = null
let funnelChart = null
let financeChart = null

// 获取统计数据
const fetchAllStats = async () => {
  try {
    const [statsRes, contentRes, aiRes, growthRes, funnelRes, financeRes, retentionRes] = await Promise.all([
      adminApi.getStats(),
      adminApi.getContentStats(),
      adminApi.getAIStats(),
      adminApi.getUserGrowth(),
      adminApi.getUserFunnel(),
      adminApi.getFinanceStats(),
      adminApi.getRetentionData()
    ])
    
    stats.value = statsRes.data
    contentStats.value = contentRes.data
    aiStats.value = aiRes.data
    userGrowthData.value = growthRes.data
    funnelData.value = funnelRes.data
    financeStats.value = financeRes.data
    retentionData.value = retentionRes.data
    
    renderCharts()
  } catch (error) {
    message.error('获取系统概览数据失败')
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderCharts = () => {
  // 1. 用户增长趋势
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value)
    userChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: userGrowthData.value.map(item => item.date.slice(5)), axisLabel: { color: '#71717a' } },
        yAxis: { type: 'value', axisLabel: { color: '#71717a' }, splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } } },
        series: [{
          data: userGrowthData.value.map(item => item.count),
          type: 'line', smooth: true,
          itemStyle: { color: '#667eea' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(102, 126, 234, 0.3)' }, { offset: 1, color: 'transparent' }]) }
        }]
    })
  }

  // 2. 留存曲线
  if (retentionChartRef.value) {
      retentionChart = echarts.init(retentionChartRef.value)
      retentionChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
          grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
          xAxis: { type: 'category', data: retentionData.value.map(item => item.day), axisLabel: { color: '#71717a' } },
          yAxis: { type: 'value', axisLabel: { color: '#71717a' }, splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } } },
          series: [{
              data: retentionData.value.map(item => item.rate),
              type: 'bar', barWidth: '40%',
              itemStyle: { color: '#8b5cf6', borderRadius: [4, 4, 0, 0] }
          }]
      })
  }

  // 3. 用户转化漏斗
  if (funnelChartRef.value) {
      funnelChart = echarts.init(funnelChartRef.value)
      funnelChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item' },
          series: [{
              name: '用户转化', type: 'funnel', left: '10%', width: '80%', sort: 'descending', gap: 4,
              label: { show: true, position: 'inside', color: '#fff' },
              data: [
                { value: funnelData.value.registered, name: '注册用户', itemStyle: { color: '#6366f1' } },
                { value: funnelData.value.active_plan, name: '开启计划', itemStyle: { color: '#8b5cf6' } },
                { value: funnelData.value.vip, name: 'VIP 会员', itemStyle: { color: '#10b981' } }
              ]
          }]
      })
  }

  // 4. 财务分布 (饼图)
  if (financeChartRef.value) {
      financeChart = echarts.init(financeChartRef.value)
      financeChart.setOption({
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item' },
          legend: { bottom: '0', textStyle: { color: '#a1a1aa' } },
          series: [{
              type: 'pie', radius: ['50%', '70%'], avoidLabelOverlap: false,
              itemStyle: { borderRadius: 10, borderColor: '#141419', borderWidth: 2 },
              label: { show: false },
              data: [
                  { value: financeStats.value.monthly || 0, name: '月度', itemStyle: { color: '#3b82f6' } },
                  { value: financeStats.value.quarterly || 0, name: '季度', itemStyle: { color: '#f59e0b' } },
                  { value: financeStats.value.yearly || 0, name: '年度', itemStyle: { color: '#10b981' } }
              ]
          }]
      })
  }
}

onMounted(() => {
  fetchAllStats()
  window.addEventListener('resize', () => {
    userChart?.resize(); retentionChart?.resize(); funnelChart?.resize(); financeChart?.resize();
  })
})
</script>

<template>
  <div class="dashboard">
    <header class="page-header">
      <h1>管理总览</h1>
      <p>LeanSphere AI 业务全链路漏斗与运营看板</p>
    </header>

    <n-spin :show="loading">
      <!-- 核心指标卡 -->
      <n-grid :cols="4" :x-gap="20" :y-gap="20" class="mb-6" responsive="screen">
        <n-grid-item>
          <n-card class="stat-card-gold" :bordered="false">
             <div class="flex justify-between items-start">
               <div>
                 <p class="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">总营收</p>
                 <h3 class="text-3xl font-black text-white">¥<n-number-animation :from="0" :to="financeStats.totalRevenue || 0" :precision="2" /></h3>
               </div>
               <div class="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Wallet :size="24" /></div>
             </div>
             <p class="mt-4 text-[10px] text-zinc-500 italic">基于已支付订单统计</p>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card" :bordered="false">
             <div class="flex justify-between items-start">
               <div>
                 <p class="text-zinc-400 text-xs font-bold mb-1">新增用户 (24h)</p>
                 <h3 class="text-3xl font-black text-white"><n-number-animation :from="0" :to="stats.todayNewUsers || 0" /></h3>
               </div>
               <div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><UserPlus :size="24" /></div>
             </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card" :bordered="false">
             <div class="flex justify-between items-start">
               <div>
                 <p class="text-zinc-400 text-xs font-bold mb-1">AI 响应成功率</p>
                 <h3 class="text-3xl font-black text-white">{{ aiStats.successRate?.toFixed(1) }}%</h3>
               </div>
               <div class="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Activity :size="24" /></div>
             </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card" :bordered="false">
             <div class="flex justify-between items-start">
               <div>
                 <p class="text-zinc-400 text-xs font-bold mb-1">活跃 VIP 占比</p>
                 <h3 class="text-3xl font-black text-white">{{ stats.totalUsers ? (funnelData.vip * 100 / stats.totalUsers).toFixed(1) : 0 }}%</h3>
               </div>
               <div class="p-2 bg-amber-500/20 rounded-lg text-amber-500"><Filter :size="24" /></div>
             </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 第二行：用户增长与留存 -->
      <n-grid :cols="2" :x-gap="20" class="mb-6">
        <n-grid-item>
          <n-card title="用户增长 (30D)" class="chart-card" :bordered="false" size="small">
            <div ref="userChartRef" style="height: 300px"></div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="用户留存率 (模拟)" class="chart-card" :bordered="false" size="small">
            <div ref="retentionChartRef" style="height: 300px"></div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 第三行：漏斗与财务 -->
      <n-grid :cols="2" :x-gap="20">
        <n-grid-item>
           <n-card title="核心转化漏斗" class="chart-card" :bordered="false" size="small">
              <div ref="funnelChartRef" style="height: 250px"></div>
              <div class="px-4 py-2 space-y-2">
                 <div class="flex justify-between text-xs"><span class="text-zinc-500">转化率 (Plan)</span><span class="text-indigo-400 font-bold">{{ (funnelData.active_plan*100/funnelData.registered || 0).toFixed(1) }}%</span></div>
                 <div class="flex justify-between text-xs"><span class="text-zinc-500">付费率 (VIP)</span><span class="text-emerald-400 font-bold">{{ (funnelData.vip*100/funnelData.active_plan || 0).toFixed(1) }}%</span></div>
              </div>
           </n-card>
        </n-grid-item>
        <n-grid-item>
           <n-card title="营收结构" class="chart-card" :bordered="false" size="small">
              <div ref="financeChartRef" style="height: 250px"></div>
              <div class="px-4 py-2 text-center">
                 <span class="text-xs text-zinc-500 uppercase">总成交 ¥</span>
                 <span class="text-xl font-black text-white ml-2">{{ financeStats.totalRevenue?.toLocaleString() }}</span>
              </div>
           </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>
  </div>
</template>

<style scoped>
.dashboard { padding: 20px; }
.page-header h1 { font-size: 2.2rem; font-weight: 900; background: linear-gradient(135deg, #fff 0%, #71717a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 4px; }
.page-header p { color: #52525b; font-size: 1rem; margin-bottom: 24px; }

.stat-card, .chart-card { background: rgba(24, 24, 27, 0.8) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important; border-radius: 20px; transition: all 0.3s; }
.stat-card:hover { border-color: rgba(255,255,255,0.1) !important; transform: translateY(-2px); }

.stat-card-gold { background: linear-gradient(145deg, #18181b, #27272a) !important; border: 1px solid rgba(234, 179, 8, 0.2) !important; border-radius: 24px; }

.nav-pill-small { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px; display: flex; align-items: center; cursor: pointer; transition: all 0.2s; }
.nav-pill-small:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
</style>
