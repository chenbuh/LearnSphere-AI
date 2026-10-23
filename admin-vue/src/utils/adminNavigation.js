import {
  Activity,
  BarChart2,
  CreditCard,
  ShieldCheck,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Database,
  FileClock,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  MessageSquare,
  PenTool,
  Settings,
  ShieldAlert,
  Users
} from 'lucide-vue-next'

export const adminMenuGroups = [
  {
    id: 'overview',
    title: '运营总览',
    items: [
      {
        key: '/dashboard',
        roles: ['super_admin', 'content', 'operator'],
        label: '数据概览',
        summary: '查看核心运营指标、增长趋势与实时动态。',
        group: '运营总览',
        badge: '实时',
        icon: LayoutDashboard
      }
    ]
  },
  {
    id: 'content',
    title: '内容与学员',
    items: [
      {
        key: '/users',
        roles: ['super_admin', 'operator'],
        label: '用户管理',
        summary: '管理学员账号、权限状态和批量运营动作。',
        group: '内容与学员',
        icon: Users
      },
      {
        key: '/vocabulary',
        roles: ['super_admin', 'content'],
        label: '词汇库',
        summary: '维护词汇资源、批量补全与质量巡检。',
        group: '内容与学员',
        icon: BookOpen
      },
      {
        key: '/records',
        roles: ['super_admin', 'content', 'operator'],
        label: '学习记录',
        summary: '追踪学习行为、内容消费和阶段表现。',
        group: '内容与学员',
        icon: FileText
      },
      {
        key: '/content',
        roles: ['super_admin', 'content'],
        label: '学习内容',
        summary: '编辑听力、阅读、语法和口语素材。',
        group: '内容与学员',
        icon: BarChart3
      },
      {
        key: '/writing',
        roles: ['super_admin', 'content'],
        label: '写作管理',
        summary: '维护写作题库、作文素材和标准答案。',
        group: '内容与学员',
        icon: PenTool
      },
      {
        key: '/learning',
        roles: ['super_admin', 'content', 'operator'],
        label: '学习统计',
        summary: '查看学习计划、每日任务和词汇掌握情况。',
        group: '内容与学员',
        icon: BarChart2
      },
      {
        key: '/orders',
        roles: ['super_admin', 'operator'],
        label: '会员订单',
        summary: '查看 VIP 订单、处理退款并维护套餐价格。',
        group: '内容与学员',
        icon: CreditCard
      },
      {
        key: '/exams',
        roles: ['super_admin', 'content', 'operator'],
        label: '试卷模考',
        summary: '管理试卷结构、模考记录和题卷详情。',
        group: '内容与学员',
        icon: GraduationCap
      }
    ]
  },
  {
    id: 'ai',
    title: 'AI 与审核',
    items: [
      {
        key: '/ai-tutor',
        roles: ['super_admin', 'content'],
        label: 'AI 助教',
        summary: '查看对话流水、提示词配置与敏感审计。',
        group: 'AI 与审核',
        badge: 'AI',
        icon: MessageSquare
      },
      {
        key: '/ai-feedback',
        roles: ['super_admin', 'content'],
        label: '反馈审计',
        summary: '审核用户反馈、评分信号与处理状态。',
        group: 'AI 与审核',
        icon: MessageSquare
      },
      {
        key: '/ai',
        roles: ['super_admin', 'content'],
        label: 'AI 治理',
        summary: '监控模型稳定性、提示词配置和反馈处理。',
        group: 'AI 与审核',
        badge: '监控',
        icon: Bot
      },
      {
        key: '/sensitive',
        roles: ['super_admin', 'content'],
        label: '内容审核',
        summary: '巡检敏感词、拦截日志和审计词库。',
        group: 'AI 与审核',
        icon: ShieldAlert
      }
    ]
  },
  {
    id: 'system',
    title: '系统与运维',
    items: [
      {
        key: '/notifications',
        roles: ['super_admin', 'operator'],
        label: '通知管理',
        summary: '发送站内通知、查看历史消息和触达情况。',
        group: '系统与运维',
        icon: Bell
      },
      {
        key: '/logs',
        roles: ['super_admin'],
        label: '操作日志',
        summary: '追踪后台操作行为、模块变更和结果状态。',
        group: '系统与运维',
        icon: FileClock
      },
      {
        key: '/user-logs',
        roles: ['super_admin', 'operator'],
        label: '用户日志',
        summary: '分析用户端行为轨迹、来源与状态分布。',
        group: '系统与运维',
        icon: History
      },
      {
        key: '/monitor',
        roles: ['super_admin'],
        label: '系统监控',
        summary: '查看运行时资源、性能与运行健康状态。',
        group: '系统与运维',
        badge: '核心',
        icon: Activity
      },
      {
        key: '/redis',
        roles: ['super_admin'],
        label: 'Redis 管理',
        summary: '搜索缓存键、查看 TTL 和内存占用。',
        group: '系统与运维',
        icon: Database
      },
      {
        key: '/accounts',
        roles: ['super_admin'],
        label: '管理员账号',
        summary: '新增后台账号、分配角色和停用账号。',
        group: '系统与运维',
        icon: ShieldCheck
      },
      {
        key: '/settings',
        roles: ['super_admin'],
        label: '系统设置',
        summary: '维护站点配置、配额和系统开关。',
        group: '系统与运维',
        icon: Settings
      }
    ]
  }
]

/**
 * 角色可见的菜单分组。没有角色信息（老会话）时按超级管理员处理，
 * 真正的权限由后端校验，这里只负责隐藏无权限的入口。
 */
export const getMenuGroupsForRole = (role) => {
  const effectiveRole = role || 'super_admin'
  return adminMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(effectiveRole))
    }))
    .filter((group) => group.items.length > 0)
}

export const canRoleAccessPath = (role, path) => {
  const effectiveRole = role || 'super_admin'
  const item = adminMenuGroups.flatMap((group) => group.items).find((entry) => entry.key === path)
  return !item || !item.roles || item.roles.includes(effectiveRole)
}

export const adminMenuItems = adminMenuGroups.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupId: group.id,
    groupTitle: group.title
  }))
)

const routeMetaMap = adminMenuItems.reduce((acc, item) => {
  acc[item.key] = item
  return acc
}, {})

export const getAdminRouteMeta = (path) =>
  routeMetaMap[path] || {
    key: path,
    label: '后台页面',
    summary: '查看当前页面数据并执行管理操作。',
    group: '后台管理',
    badge: null
  }
