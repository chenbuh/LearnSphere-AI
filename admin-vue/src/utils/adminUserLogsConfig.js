export const userLogModuleOptions = [
  { label: '阅读', value: 'reading' },
  { label: '听力', value: 'listening' },
  { label: '写作', value: 'writing' },
  { label: '口语', value: 'speaking' },
  { label: '语法', value: 'grammar' },
  { label: '词汇', value: 'vocabulary' },
  { label: '模拟考试', value: 'exam' },
  { label: '登录', value: 'auth' }
]

export const userLogActionOptions = [
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
  { label: '提交', value: 'submit' },
  { label: '查看', value: 'view' },
  { label: '分享', value: 'share' },
  { label: '生成', value: 'generate' }
]

export const userLogStatusOptions = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 }
]

export const countUniqueIps = (logs = []) => {
  const ips = new Set()
  logs.forEach((log) => {
    if (log.ip) {
      ips.add(log.ip)
    }
  })
  return ips.size
}

export const countActiveUsers = (logs = []) => {
  const users = new Set()
  logs.forEach((log) => {
    if (log.userId) {
      users.add(log.userId)
    }
  })
  return users.size
}

export const calculateMobileRate = (logs = []) => {
  if (logs.length === 0) {
    return 0
  }
  const mobileCount = logs.filter((log) => log.deviceType === 'Mobile').length
  return Math.round((mobileCount / logs.length) * 100)
}

export const createUserLogActionChartOption = (actionStats = []) => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: '70%',
      data: actionStats.map((item) => ({
        name: item.action,
        value: item.count
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

export const createUserLogProvinceChartOption = (provinceStats = [], echarts) => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  xAxis: {
    type: 'category',
    data: provinceStats.map((item) => item.province),
    axisLabel: { rotate: 45 }
  },
  yAxis: { type: 'value' },
  series: [
    {
      type: 'bar',
      data: provinceStats.map((item) => item.count),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#83bff6' },
          { offset: 1, color: '#188df0' }
        ])
      }
    }
  ]
})
