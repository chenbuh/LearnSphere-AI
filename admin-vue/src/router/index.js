import { createRouter, createWebHistory } from 'vue-router'

// 使用显式导入,避免动态导入的路径解析问题
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录 - LearnSphere 管理后台' }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '数据概览 - LearnSphere 管理后台',
      icon: 'LayoutDashboard',
      keepAlive: false
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('../views/Users.vue'),
    meta: {
      requiresAuth: true,
      title: '用户管理 - LearnSphere 管理后台',
      icon: 'Users',
      keepAlive: true
    }
  },
  {
    path: '/vocabulary',
    name: 'Vocabulary',
    component: () => import('../views/Vocabulary.vue'),
    meta: {
      requiresAuth: true,
      title: '词汇库 - LearnSphere 管理后台',
      icon: 'BookOpen',
      keepAlive: true
    }
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('../views/Records.vue'),
    meta: {
      requiresAuth: true,
      title: '学习记录 - LearnSphere 管理后台',
      icon: 'FileText',
      keepAlive: true
    }
  },
  {
    path: '/content',
    name: 'Content',
    component: () => import('../views/Content.vue'),
    meta: {
      requiresAuth: true,
      title: '学习内容 - LearnSphere 管理后台',
      icon: 'BarChart3',
      keepAlive: true
    }
  },
  {
    path: '/writing',
    name: 'Writing',
    component: () => import('../views/Writing.vue'),
    meta: {
      requiresAuth: true,
      title: '写作管理 - LearnSphere 管理后台',
      icon: 'PenTool',
      keepAlive: false
    }
  },
  {
    path: '/exams',
    name: 'ExamManagement',
    component: () => import('../views/ExamManagement.vue'),
    meta: {
      requiresAuth: true,
      title: '试卷模考 - LearnSphere 管理后台',
      icon: 'GraduationCap',
      keepAlive: true
    }
  },
  {
    path: '/ai-tutor',
    name: 'AITutorManagement',
    component: () => import('../views/AITutorManagement.vue'),
    meta: {
      requiresAuth: true,
      title: 'AI 助教管理 - LearnSphere 管理后台',
      icon: 'MessageSquare',
      keepAlive: true
    }
  },
  {
    path: '/sensitive',
    name: 'SensitiveAudit',
    component: () => import('../views/SensitiveAudit.vue'),
    meta: {
      requiresAuth: true,
      title: '内容审核 - LearnSphere 管理后台',
      icon: 'ShieldAlert',
      keepAlive: true
    }
  },
  {
    path: '/logs',
    name: 'OperationLogs',
    component: () => import('../views/OperationLogs.vue'),
    meta: {
      requiresAuth: true,
      title: '操作日志 - LearnSphere 管理后台',
      icon: 'FileClock',
      keepAlive: true
    }
  },
  {
    path: '/user-logs',
    name: 'UserLogs',
    component: () => import('../views/UserLogs.vue'),
    meta: {
      requiresAuth: true,
      title: '用户日志 - LearnSphere 管理后台',
      icon: 'History',
      keepAlive: true
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/Notifications.vue'),
    meta: {
      requiresAuth: true,
      title: '通知管理 - LearnSphere 管理后台',
      icon: 'Bell',
      keepAlive: true
    }
  },
  {
    path: '/monitor',
    name: 'SystemMonitor',
    component: () => import('../views/SystemMonitor.vue'),
    meta: {
      requiresAuth: true,
      title: '系统监控 - LearnSphere 管理后台',
      icon: 'Activity',
      keepAlive: false
    }
  },
  {
    path: '/redis',
    name: 'RedisManagement',
    component: () => import('../views/RedisManagement.vue'),
    meta: {
      requiresAuth: true,
      title: 'Redis 管理 - LearnSphere 管理后台',
      icon: 'Database',
      keepAlive: false
    }
  },
  {
    path: '/ai',
    name: 'AIGovernance',
    component: () => import('../views/AIGovernance.vue'),
    meta: {
      requiresAuth: true,
      title: 'AI 治理 - LearnSphere 管理后台',
      icon: 'Bot',
      keepAlive: true
    }
  },
  {
    path: '/ai-feedback',
    name: 'AIFeedbackAudit',
    component: () => import('../views/AIFeedbackAudit.vue'),
    meta: {
      requiresAuth: true,
      title: 'AI 反馈审计 - LearnSphere 管理后台',
      icon: 'MessageSquare',
      keepAlive: true
    }
  },
  {
    path: '/settings',
    name: 'SystemSettings',
    component: () => import('../views/SystemSettings.vue'),
    meta: {
      requiresAuth: true,
      title: '系统设置 - LearnSphere 管理后台',
      icon: 'Settings',
      keepAlive: false
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 检查认证状态
  const token = localStorage.getItem('admin-token')

  if (to.meta.requiresAuth && !token) {
    // 未登录,跳转到登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && token) {
    // 已登录,跳转到首页
    next('/dashboard')
  } else {
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面访问统计(可选)
  if (process.env.NODE_ENV === 'production') {
    console.log(`Page visited: ${to.path}`)
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
})

export default router

// 导出路由配置供其他模块使用
export { routes }
