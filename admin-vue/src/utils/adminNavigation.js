import {
  Activity,
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
        label: '用户管理',
        summary: '管理学员账号、权限状态和批量运营动作。',
        group: '内容与学员',
        icon: Users
      },
      {
        key: '/vocabulary',
        label: '词汇库',
        summary: '维护词汇资源、批量补全与质量巡检。',
        group: '内容与学员',
        icon: BookOpen
      },
      {
        key: '/records',
        label: '学习记录',
        summary: '追踪学习行为、内容消费和阶段表现。',
        group: '内容与学员',
        icon: FileText
      },
      {
        key: '/content',
        label: '学习内容',
        summary: '编辑听力、阅读、语法和口语素材。',
        group: '内容与学员',
        icon: BarChart3
      },
      {
        key: '/writing',
        label: '写作管理',
        summary: '维护写作题库、作文素材和标准答案。',
        group: '内容与学员',
        icon: PenTool
      },
      {
        key: '/exams',
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
        label: 'AI 助教',
        summary: '查看对话流水、提示词配置与敏感审计。',
        group: 'AI 与审核',
        badge: 'AI',
        icon: MessageSquare
      },
      {
        key: '/ai-feedback',
        label: '反馈审计',
        summary: '审核用户反馈、评分信号与处理状态。',
        group: 'AI 与审核',
        icon: MessageSquare
      },
      {
        key: '/ai',
        label: 'AI 治理',
        summary: '监控模型稳定性、提示词配置和反馈处理。',
        group: 'AI 与审核',
        badge: '监控',
        icon: Bot
      },
      {
        key: '/sensitive',
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
        label: '通知管理',
        summary: '发送站内通知、查看历史消息和触达情况。',
        group: '系统与运维',
        icon: Bell
      },
      {
        key: '/logs',
        label: '操作日志',
        summary: '追踪后台操作行为、模块变更和结果状态。',
        group: '系统与运维',
        icon: FileClock
      },
      {
        key: '/user-logs',
        label: '用户日志',
        summary: '分析用户端行为轨迹、来源与状态分布。',
        group: '系统与运维',
        icon: History
      },
      {
        key: '/monitor',
        label: '系统监控',
        summary: '查看运行时资源、性能与运行健康状态。',
        group: '系统与运维',
        badge: '核心',
        icon: Activity
      },
      {
        key: '/redis',
        label: 'Redis 管理',
        summary: '搜索缓存键、查看 TTL 和内存占用。',
        group: '系统与运维',
        icon: Database
      },
      {
        key: '/settings',
        label: '系统设置',
        summary: '维护站点配置、配额和系统开关。',
        group: '系统与运维',
        icon: Settings
      }
    ]
  }
]

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
