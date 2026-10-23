import { BookMarked, Settings, ShieldAlert, Users } from 'lucide-vue-next'

export const dashboardQuickActions = [
  { label: '用户审计', icon: Users, path: '/users', color: '#4f46e5' },
  { label: '词库更新', icon: BookMarked, path: '/vocabulary', color: '#10b981' },
  { label: '系统设置', icon: Settings, path: '/settings', color: '#64748b' },
  { label: '安全日志', icon: ShieldAlert, path: '/logs', color: '#ef4444' }
]

// 现代化科技 SaaS 图表调色盘 (Indigo & Slate)
const commonChartTheme = {
  labelColor: '#94a3b8',
  splitLine: '#f1f5f9',
  tooltipBg: 'rgba(255, 255, 255, 0.95)',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#0f172a',
  series: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
}

const chartTooltip = {
  backgroundColor: commonChartTheme.tooltipBg,
  borderColor: commonChartTheme.tooltipBorder,
  borderWidth: 1,
  padding: [10, 14],
  textStyle: { color: commonChartTheme.tooltipText, fontSize: 12.5, fontFamily: 'inherit' },
  extraCssText:
    'box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.05); border-radius: 10px; backdrop-filter: blur(8px);'
}

const getContentRadarIndicators = (contentStats) => {
  const values = [
    contentStats.vocabulary || 0,
    contentStats.listening || 0,
    contentStats.reading || 0,
    contentStats.speaking || 0,
    contentStats.grammar || 0,
    contentStats.writing || 0
  ]
  const maxValue = Math.max(...values, 1)
  const indicatorMax = Math.max(5, Math.ceil(maxValue * 1.2))

  return [
    { name: '词汇', max: indicatorMax },
    { name: '听力', max: indicatorMax },
    { name: '阅读', max: indicatorMax },
    { name: '口语', max: indicatorMax },
    { name: '语法', max: indicatorMax },
    { name: '写作', max: indicatorMax }
  ]
}

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
      axisPointer: {
        type: 'line',
        lineStyle: { color: '#818cf8', width: 1.5, type: 'dashed' }
      },
      ...chartTooltip
    },
    grid: { left: '3%', right: '3%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category',
      data: userGrowthData.map(item => item.date.slice(5)),
      axisLabel: { color: commonChartTheme.labelColor, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      splitLine: { lineStyle: { color: commonChartTheme.splitLine, type: 'dashed' } },
      axisLabel: { color: commonChartTheme.labelColor, fontSize: 11 }
    },
    series: [{
      name: '新增注册',
      data: userGrowthData.map(item => item.count),
      type: 'line',
      smooth: 0.35,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#4f46e5',
        borderColor: '#ffffff',
        borderWidth: 2,
        shadowColor: 'rgba(79, 70, 229, 0.4)',
        shadowBlur: 8
      },
      lineStyle: {
        width: 3,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#4f46e5' },
          { offset: 1, color: '#818cf8' }
        ]),
        shadowColor: 'rgba(79, 70, 229, 0.25)',
        shadowBlur: 10,
        shadowOffsetY: 4
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(79, 70, 229, 0.22)' },
          { offset: 0.8, color: 'rgba(79, 70, 229, 0.02)' },
          { offset: 1, color: 'rgba(79, 70, 229, 0)' }
        ])
      }
    }]
  }
}

export function createContentRadarChartOption(contentStats) {
  return {
    radar: {
      indicator: getContentRadarIndicators(contentStats),
      splitNumber: 4,
      shape: 'polygon',
      axisName: { color: '#64748b', fontSize: 11.5, fontWeight: 550 },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(248, 250, 252, 0.5)', 'rgba(255, 255, 255, 0.8)']
        }
      },
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
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#4f46e5' },
        areaStyle: { color: 'rgba(79, 70, 229, 0.2)' },
        lineStyle: { width: 2.5, color: '#4f46e5' }
      }]
    }]
  }
}

export function createRetentionChartOption(retentionData, echarts) {
  return {
    grid: { left: 4, right: 4, bottom: 4, top: 12, containLabel: false },
    xAxis: { type: 'category', data: retentionData.map(item => item.day), show: false },
    yAxis: { type: 'value', min: 0, show: false },
    series: [{
      data: retentionData.map(item => item.rate),
      type: 'bar',
      barWidth: '55%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4f46e5' },
          { offset: 1, color: '#a5b4fc' }
        ])
      },
      emphasis: {
        itemStyle: {
          color: '#4338ca'
        }
      }
    }]
  }
}

export function createFunnelChartOption(funnelData) {
  const stages = [
    { name: '访问', value: funnelData.visits || 100 },
    { name: '注册', value: funnelData.signups || 80 },
    { name: '首练', value: funnelData.firstPractice || 50 },
    { name: '活跃', value: funnelData.active || 30 },
    { name: '付费', value: funnelData.conversions || 10 }
  ]

  const funnelColors = ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#1e1b4b']

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
      ...chartTooltip
    },
    series: [{
      name: '转化漏斗',
      type: 'funnel',
      left: '10%',
      top: 14,
      bottom: 14,
      width: '80%',
      min: 0,
      max: Math.max(...stages.map(s => s.value), 100),
      minSize: '15%',
      maxSize: '100%',
      sort: 'descending',
      gap: 3,
      label: {
        show: true,
        position: 'inside',
        formatter: '{b}',
        color: '#ffffff',
        fontSize: 11.5,
        fontWeight: 600
      },
      itemStyle: {
        borderColor: '#ffffff',
        borderWidth: 2,
        borderRadius: 4
      },
      data: stages.map((item, index) => ({
        ...item,
        itemStyle: { color: funnelColors[index] || '#4f46e5' }
      }))
    }]
  }
}
