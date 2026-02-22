import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { reportRouteMetric } from '../utils/metricsReporter'

// 路由导入辅助函数 - 支持预加载
const lazyLoad = (componentPath, preloadChunks = []) => {
  return () => import(/* @vite-ignore */ `../views/${componentPath}`)
}

// 核心页面（立即加载）
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/LoginView.vue')
const MainLayout = () => import('../layouts/MainLayout.vue')

// 学习模块路由配置（懒加载 + 预加载提示）
const learningRoutes = [
  {
    path: 'dashboard',
    alias: ['home', '/home'],
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      title: '学习仪表盘',
      requiresAuth: true,
      preload: true, // 预加载
      priority: 'high' // 高优先级
    }
  },
  {
    path: 'vocabulary',
    alias: '/vocabulary',
    name: 'Vocabulary',
    component: () => import('../views/VocabularyView.vue'),
    meta: {
      title: '词汇学习',
      requiresAuth: true,
      preload: true,
      priority: 'high'
    }
  },
  {
    path: 'vocabulary-new',
    alias: '/vocabulary-new',
    name: 'VocabularyNew',
    component: lazyLoad('VocabularyViewNew.vue'),
    meta: { title: '词汇学习（新版）', requiresAuth: true }
  },
  {
    path: 'vocabulary-test',
    alias: '/vocabulary-test',
    name: 'VocabularyTest',
    component: lazyLoad('VocabularyTestView.vue'),
    meta: { title: '词汇测试', requiresAuth: true }
  },
  {
    path: 'review',
    alias: '/review',
    name: 'Review',
    component: lazyLoad('ReviewView.vue'),
    meta: { title: '智能复习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'daily-tasks',
    alias: '/daily-tasks',
    name: 'DailyTasks',
    component: lazyLoad('DailyTaskBoard.vue'),
    meta: { title: '每日任务', requiresAuth: true, preload: true, priority: 'high' }
  },
  {
    path: 'study-plan',
    alias: '/study-plan',
    name: 'DailyPlan',
    component: lazyLoad('StudyPlanView.vue'),
    meta: { title: '学习计划', requiresAuth: true }
  },
  {
    path: 'study-plan/create',
    alias: '/study-plan/create',
    name: 'StudyPlanCreate',
    component: lazyLoad('StudyPlanCreateView.vue'),
    meta: { title: '创建学习计划', requiresAuth: true }
  },
  {
    path: 'grammar',
    alias: '/grammar',
    name: 'Grammar',
    component: lazyLoad('GrammarView.vue'),
    meta: { title: '语法练习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'listening',
    alias: '/listening',
    name: 'Listening',
    component: lazyLoad('ListeningView.vue'),
    meta: { title: '听力训练', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'reading',
    alias: '/reading',
    name: 'Reading',
    component: lazyLoad('ReadingView.vue'),
    meta: { title: '阅读理解', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'writing',
    alias: '/writing',
    name: 'Writing',
    component: lazyLoad('WritingView.vue'),
    meta: { title: '写作练习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'speaking',
    alias: '/speaking',
    name: 'Speaking',
    component: lazyLoad('SpeakingView.vue'),
    meta: { title: '口语练习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'mock-exam',
    alias: '/mock-exam',
    name: 'MockExam',
    component: lazyLoad('MockExamView.vue'),
    meta: { title: '模拟考试', requiresAuth: true }
  },
  {
    path: 'analysis',
    alias: '/analysis',
    name: 'Analysis',
    component: lazyLoad('LearningAnalysisView.vue'),
    meta: { title: '学习分析', requiresAuth: true }
  },
  {
    path: 'error-book',
    alias: '/error-book',
    name: 'ErrorBook',
    component: lazyLoad('ErrorBookView.vue'),
    meta: { title: '错题本', requiresAuth: true }
  },
  {
    path: 'achievements',
    alias: '/achievements',
    name: 'Achievements',
    component: lazyLoad('AchievementsView.vue'),
    meta: { title: '荣誉勋章', requiresAuth: true }
  },
  {
    path: 'answer-history',
    alias: '/answer-history',
    name: 'AnswerHistory',
    component: lazyLoad('AnswerHistoryView.vue'),
    meta: { title: '答题历史', requiresAuth: true }
  },
  {
    path: 'speaking-mock',
    alias: '/speaking-mock',
    name: 'SpeakingMock',
    component: lazyLoad('SpeakingMockView.vue'),
    meta: { title: 'AI 口语模考', requiresAuth: true }
  },
  {
    path: 'profile',
    alias: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: 'settings',
    alias: '/settings',
    name: 'Settings',
    component: lazyLoad('SettingsView.vue'),
    meta: { title: '设置', requiresAuth: true }
  },
  {
    path: 'learning-hub',
    alias: '/learning-hub',
    name: 'LearningHub',
    component: lazyLoad('LearningHubView.vue'),
    meta: { title: '学习中心', requiresAuth: true, preload: true, priority: 'high' }
  },
  // 测试路由（低优先级）
  {
    path: 'api-test',
    name: 'ApiTest',
    component: lazyLoad('ApiTest.vue'),
    meta: { title: 'API测试', requiresAuth: false, priority: 'low' }
  },
  {
    path: 'debug-test',
    name: 'DebugTest',
    component: lazyLoad('DebugTest.vue'),
    meta: { title: '调试测试', requiresAuth: false, priority: 'low' }
  },
  {
    path: 'integration-test',
    name: 'IntegrationTest',
    component: lazyLoad('IntegrationTest.vue'),
    meta: { title: '集成测试', requiresAuth: false, priority: 'low' }
  },
  {
    path: 'share-demo',
    name: 'ShareDemo',
    component: lazyLoad('ShareDemo.vue'),
    meta: { title: '分享功能演示', requiresAuth: false, priority: 'low' }
  }
]

let routeStartTime = 0
let lastRouteFrom = ""

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingPage,
    meta: { preload: true }
  },
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/features',
    name: 'Features',
    component: lazyLoad('FeaturesPage.vue'),
    meta: { preload: true }
  },
  {
    path: '/exams',
    name: 'Exams',
    component: lazyLoad('ExamsPage.vue'),
    meta: { preload: true }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: lazyLoad('PricingPage.vue'),
    meta: { preload: true }
  },
  {
    path: '/leaderboard',
    name: 'PublicLeaderboard',
    component: lazyLoad('LeaderboardView.vue'),
    meta: { preload: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { preload: true }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: lazyLoad('MaintenanceView.vue')
  },
  {
    path: '/app',
    component: MainLayout,
    children: learningRoutes
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  routeStartTime = performance.now()
  lastRouteFrom = from.fullPath || ""
  const userStore = useUserStore()
  const systemStore = useSystemStore()

  // 显示加载状态
  if (to.meta.requiresAuth) {
    // 这里可以触发全局加载状态
    document.body.classList.add('page-loading')
  }

  // 跳过维护模式检查
  if (to.name === 'Maintenance') {
    next()
    return
  }

  // 获取系统配置
  await systemStore.fetchSystemConfig()

  // 维护模式检查
  if (systemStore.isMaintenanceMode) {
    const role = userStore.userInfo?.role
    if (role !== 'admin' && role !== 'ADMIN') {
      next('/maintenance')
      return
    }
  }

  // 认证检查
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

// 路由加载后
router.afterEach((to, from) => {
  if (routeStartTime) {
    reportRouteMetric({
      from: from.fullPath || lastRouteFrom || "",
      to: to.fullPath || "",
      durationMs: performance.now() - routeStartTime
    })
    routeStartTime = 0
  }
  // 隐藏加载状态
  document.body.classList.remove('page-loading')

  // 设置页面标题
  const title = router.currentRoute.value.meta.title
  if (title) {
    document.title = `${title} - LearnSphere AI`
  }
})

// 预加载高优先级路由
function preloadRoutes() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const saveData = connection?.saveData
  const effectiveType = connection?.effectiveType || ''
  const isSlowNetwork = saveData || effectiveType.includes('2g')

  if (isSlowNetwork) {
    return
  }

  const highPriorityRoutes = routes
    .filter(route => route.meta?.preload && route.meta?.priority === 'high')
    .map(route => route.component)

  const mediumPriorityRoutes = routes
    .filter(route => route.meta?.preload && route.meta?.priority === 'medium')
    .map(route => route.component)

  // 立即预加载高优先级路由
  highPriorityRoutes.forEach(loader => {
    if (typeof loader === 'function') {
      loader().catch(() => {})
    }
  })

  // 延迟预加载中优先级路由（空闲时）
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      mediumPriorityRoutes.forEach(loader => {
        if (typeof loader === 'function') {
          loader().catch(() => {})
        }
      })
    })
  }
}

// 在页面空闲时预加载路由
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') {
    setTimeout(preloadRoutes, 1000)
  } else {
    window.addEventListener('load', () => {
      setTimeout(preloadRoutes, 1000)
    })
  }
}

export default router
