import { BookMarked, Settings, ShieldAlert, Users } from 'lucide-vue-next'

export const dashboardQuickActions = [
  { label: '用户审计', icon: Users, path: '/users', color: '#6366f1' },
  { label: '词库更新', icon: BookMarked, path: '/vocabulary', color: '#10b981' },
  { label: '系统设置', icon: Settings, path: '/settings', color: '#f59e0b' },
  { label: '安全日志', icon: ShieldAlert, path: '/logs', color: '#f43f5e' }
]

const commonChartTheme = {
  labelColor: 'rgba(255, 255, 255, 0.4)',
  splitLine: 'rgba(255, 255, 255, 0.05)'
}

const contentRadarIndicators = [
  { name: '词汇', max: 10000 },
  { name: '听力', max: 10000 },
  { name: '阅读', max: 10000 },
  { name: '口语', max: 10000 },
  { name: '语法', max: 10000 },
  { name: '写作', max: 10000 }
]

export function getDashboardGreeting(currentTime) {
  const hour = currentTime.getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  if (hour < 22) return '晚上好'
  return '半夜好'
}

export function createUserGrowthChartOption(userGrowthData, echarts) {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', label: { backgroundColor: '#18181b' } },
      backgroundColor: 'rgba(24, 24, 27, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    grid: { left: '2%', right: '3%', bottom: '2%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: userGrowthData.map(item => item.date.slice(5)),
      axisLabel: { color: commonChartTheme.labelColor, fontSize: 10 },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      splitLine: { lineStyle: { color: commonChartTheme.splitLine, type: 'dashed' } },
      axisLabel: { color: commonChartTheme.labelColor }
    },
    series: [{
      name: '新增注册',
      data: userGrowthData.map(item => item.count),
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#6366f1' },
      lineStyle: { width: 3, shadowBlur: 10, shadowColor: 'rgba(99, 102, 241, 0.3)' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
          { offset: 1, color: 'transparent' }
        ])
      }
    }]
  }
}

export function createContentRadarChartOption(contentStats) {
  return {
    radar: {
      indicator: contentRadarIndicators,
      splitNumber: 5,
      axisName: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
      splitArea: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          contentStats.vocabulary || 0,
          contentStats.listening || 0,
          contentStats.reading || 0,
          contentStats.speaking || 0,
          contentStats.grammar || 0,
          contentStats.writing || 0
        ],
        name: '内容分布',
        symbol: 'none',
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
        lineStyle: { width: 2 }
      }]
    }]
  }
}

export function createRetentionChartOption(retentionData, echarts) {
  return {
    grid: { left: 0, right: 0, bottom: 0, top: 10, containLabel: false },
    xAxis: { type: 'category', data: retentionData.map(item => item.day), show: false },
    yAxis: { type: 'value', min: 0, show: false },
    series: [{
      data: retentionData.map(item => item.rate),
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#8b5cf6' },
          { offset: 1, color: '#6366f1' }
        ])
      }
    }]
  }
}

export function createFunnelChartOption(funnelData) {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: [{
      name: '转化漏斗',
      type: 'funnel',
      left: '15%',
      width: '70%',
      gap: 4,
      label: { show: true, position: 'inside', color: '#fff' },
      itemStyle: { borderRadius: 8, borderWidth: 0 },
      data: [
        { value: funnelData.registered || 0, name: '注册', itemStyle: { color: '#6366f1' } },
        { value: funnelData.active_plan || 0, name: '活跃', itemStyle: { color: '#a855f7' } },
        { value: funnelData.vip || 0, name: '付费', itemStyle: { color: '#14b8a6' } }
      ]
    }]
  }
}
