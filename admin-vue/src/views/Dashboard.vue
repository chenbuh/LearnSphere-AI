<script setup>
import { ref, onMounted } from 'vue'
import { NCard, NSpin, NGrid, NGridItem, NStatistic, useMessage } from 'naive-ui'
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(true)
const stats = ref({})
const userGrowthData = ref([])

// 获取统计数据
const fetchStats = async () => {
  try {
    const res = await adminApi.getStats()
    stats.value = res.data
  } catch (error) {
    message.error('获取统计数据失败')
  }
}

// 获取用户增长趋势
const fetchUserGrowth = async () => {
  try {
    const res = await adminApi.getUserGrowth()
    userGrowthData.value = res.data
    renderChart()
  } catch (error) {
    message.error('获取趋势数据失败')
  }
}

// 渲染图表
const renderChart = () => {
  const chartDom = document.getElementById('user-growth-chart')
  const myChart = echarts.init(chartDom)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 20, 25, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: userGrowthData.value.map(item => item.date.slice(5)),
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      axisLabel: { color: '#71717a' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      axisLabel: { color: '#71717a' }
    },
    series: [{
      data: userGrowthData.value.map(item => item.count),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0)' }
          ]
        }
      },
      lineStyle: { color: '#667eea', width: 3 },
      itemStyle: { color: '#667eea' }
    }]
  }
  
  myChart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => {
    myChart.resize()
  })
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchStats(), fetchUserGrowth()])
  loading.value = false
})
</script>

<template>
  <div class="dashboard">
    <header class="page-header">
      <h1>数据概览</h1>
      <p>系统运营数据实时监控</p>
    </header>

    <n-spin :show="loading">
      <!-- 统计卡片 -->
      <n-grid :cols="4" :x-gap="24" :y-gap="24" class="stats-grid" responsive="screen">
        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
                <Users />
              </div>
              <div class="stat-info">
                <p class="stat-label">总用户数</p>
                <n-statistic :value="stats.totalUsers || 0" />
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
                <Activity />
              </div>
              <div class="stat-info">
                <p class="stat-label">活跃用户</p>
                <n-statistic :value="stats.activeUsers || 0" />
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
                <BookOpen />
              </div>
              <div class="stat-info">
                <p class="stat-label">词汇总数</p>
                <n-statistic :value="stats.totalVocabulary || 0" />
              </div>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
                <TrendingUp />
              </div>
              <div class="stat-info">
                <p class="stat-label">学习记录</p>
                <n-statistic :value="stats.totalRecords || 0" />
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 用户增长趋势图 -->
      <n-card class="chart-card" title="用户增长趋势（最近30天）">
        <div id="user-growth-chart" style="height: 400px"></div>
      </n-card>

      <!-- 今日数据 -->
      <n-grid :cols="2" :x-gap="24" :y-gap="24" class="today-stats">
        <n-grid-item>
          <n-card title="今日新增用户" class="info-card">
            <n-statistic :value="stats.todayNewUsers || 0">
              <template #suffix>
                <span style="font-size: 18px; color: #71717a">人</span>
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card title="今日学习次数" class="info-card">
            <n-statistic :value="stats.todayLearning || 0">
              <template #suffix>
                <span style="font-size: 18px; color: #71717a">次</span>
              </template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 32px;
  height: 32px;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #a1a1aa;
  margin-bottom: 8px;
}

.chart-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
}

.today-stats {
  margin-bottom: 24px;
}

.info-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
</style>
