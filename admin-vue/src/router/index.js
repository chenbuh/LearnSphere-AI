import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { title: 'Login - LearnSphere Admin' }
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
      title: 'Dashboard - LearnSphere Admin',
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
      title: 'Users - LearnSphere Admin',
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
      title: 'Vocabulary - LearnSphere Admin',
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
      title: 'Records - LearnSphere Admin',
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
      title: 'Content - LearnSphere Admin',
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
      title: 'Writing - LearnSphere Admin',
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
      title: 'Exam Management - LearnSphere Admin',
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
      title: 'AI Tutor Management - LearnSphere Admin',
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
      title: 'Sensitive Audit - LearnSphere Admin',
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
      title: 'Operation Logs - LearnSphere Admin',
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
      title: 'User Logs - LearnSphere Admin',
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
      title: 'Notifications - LearnSphere Admin',
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
      title: 'System Monitor - LearnSphere Admin',
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
      title: 'Redis Management - LearnSphere Admin',
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
      title: 'AI Governance - LearnSphere Admin',
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
      title: 'AI Feedback Audit - LearnSphere Admin',
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
      title: 'System Settings - LearnSphere Admin',
      icon: 'Settings',
      keepAlive: false
    }
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const token = localStorage.getItem('admin-token')

  if (to.meta.requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  if (to.path === '/login' && token) {
    next('/dashboard')
    return
  }

  next()
})

router.afterEach((to) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`Page visited: ${to.path}`)
  }
})

router.onError((error) => {
  console.error('Router error:', error)
})

export default router
export { routes }
