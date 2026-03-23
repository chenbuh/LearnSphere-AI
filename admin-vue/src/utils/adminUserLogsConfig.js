export const userLogModuleOptions = [
  { label: '成就', value: 'achievement' },
  { label: '用户中心', value: 'user' },
  { label: '安全', value: 'security' },
  { label: '学习计划', value: 'study_plan' },
  { label: '学习记录', value: 'learning' },
  { label: 'AI 助教', value: 'ai_tutor' },
  { label: '推荐', value: 'recommendation' },
  { label: '阅读', value: 'reading' },
  { label: '听力', value: 'listening' },
  { label: '写作', value: 'writing' },
  { label: '口语', value: 'speaking' },
  { label: '语法', value: 'grammar' },
  { label: '词汇', value: 'vocabulary' },
  { label: '模拟考试', value: 'exam' },
  { label: '通知', value: 'notification' },
  { label: '支付', value: 'payment' },
  { label: '登录', value: 'auth' }
]

export const userLogActionOptions = [
  { label: '登录', value: 'login' },
  { label: '注册', value: 'register' },
  { label: '登出', value: 'logout' },
  { label: '打卡', value: 'checkin' },
  { label: '浏览', value: 'browse' },
  { label: '查看', value: 'view' },
  { label: '查看详情', value: 'view_detail' },
  { label: '查看历史', value: 'view_history' },
  { label: '查看报告', value: 'view_report' },
  { label: '查看统计', value: 'view_stats' },
  { label: '查看未读数', value: 'view_unread' },
  { label: '提交', value: 'submit' },
  { label: '更新', value: 'update' },
  { label: '删除', value: 'delete' },
  { label: '完成', value: 'complete' },
  { label: '创建', value: 'create' },
  { label: '生成', value: 'generate' },
  { label: '生成报告', value: 'generate_report' },
  { label: '评估', value: 'evaluate' },
  { label: '推荐', value: 'recommend' },
  { label: '对话', value: 'chat' },
  { label: '复习', value: 'review' },
  { label: '查看复习建议', value: 'review_suggestions' },
  { label: '领取每日词汇', value: 'daily' },
  { label: '记录练习', value: 'record_practice' },
  { label: '记录词汇练习', value: 'record_review' },
  { label: '关联知识点', value: 'related_topics' },
  { label: '学习建议', value: 'learning_advice' },
  { label: '查看薄弱点', value: 'view_weaknesses' },
  { label: '错题深析', value: 'analyze_error' },
  { label: '切换收藏', value: 'favorite' },
  { label: '保存笔记', value: 'notes' },
  { label: '标记已读', value: 'mark_read' },
  { label: '获取支付令牌', value: 'get_token' },
  { label: '购买 VIP', value: 'checkout' },
  { label: '绑定 MFA', value: 'mfa_bind' },
  { label: '初始化 MFA', value: 'mfa_setup' },
  { label: '风险解锁', value: 'unlock' },
  { label: '修改密码', value: 'change_password' },
  { label: '开始模考', value: 'mock_start' },
  { label: '继续模考', value: 'mock_continue' },
  { label: '模考报告', value: 'mock_report' }
]

export const userLogStatusOptions = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 }
]

export const userLogModuleLabelMap = {
  achievement: '成就',
  user: '用户中心',
  security: '安全',
  study_plan: '学习计划',
  learning: '学习记录',
  ai_tutor: 'AI 助教',
  recommendation: '推荐',
  reading: '阅读',
  listening: '听力',
  writing: '写作',
  speaking: '口语',
  grammar: '语法',
  vocabulary: '词汇',
  exam: '模拟考试',
  notification: '通知',
  payment: '支付',
  auth: '登录认证'
}

export const userLogActionLabelMap = {
  login: '登录',
  register: '注册',
  logout: '登出',
  checkin: '打卡',
  browse: '浏览',
  view: '查看',
  view_detail: '查看详情',
  view_history: '查看历史',
  view_report: '查看报告',
  view_stats: '查看统计',
  view_unread: '查看未读数',
  submit: '提交',
  update: '更新',
  delete: '删除',
  complete: '完成',
  create: '创建',
  generate: '生成',
  generate_fallback: '本地回退生成',
  evaluate: '评估',
  chat: '对话',
  review: '复习',
  review_suggestions: '查看复习建议',
  daily: '每日词汇',
  record_practice: '记录练习',
  related_topics: '关联知识点',
  learning_advice: '学习建议',
  view_weaknesses: '查看薄弱点',
  generate_report: '生成报告',
  analyze_error: '错题深析',
  recommend: '推荐',
  record_review: '记录词汇练习',
  favorite: '切换收藏',
  notes: '保存笔记',
  mark_read: '标记已读',
  get_token: '获取支付令牌',
  checkout: '购买 VIP',
  mfa_setup: '初始化 MFA',
  mfa_bind: '绑定 MFA',
  unlock: '风险解锁',
  change_password: '修改密码',
  mock_start: '开始模考',
  mock_continue: '继续模考',
  mock_report: '模考报告'
}

export const getUserLogModuleLabel = (value, fallback = '-') => userLogModuleLabelMap[value] || fallback
export const getUserLogActionLabel = (value, fallback = '-') => userLogActionLabelMap[value] || fallback

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
        name: getUserLogActionLabel(item.action, item.action),
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
