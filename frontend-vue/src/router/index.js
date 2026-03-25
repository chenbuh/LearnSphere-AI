import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'
import { reportRouteMetric } from '../utils/metricsReporter'
import { collectPreloadLoaders } from '../utils/routePreload'
import logger from '../utils/logger'
import { syncSystemConfigForGuard } from '../utils/systemConfigGuard'
import i18n from '../i18n'

const routeTitleKeyMap = {
  Dashboard: 'menu.dashboard',
  Vocabulary: 'menu.vocabulary',
  VocabularyNew: 'menu.vocabulary',
  VocabularyTest: 'menu.vocabularyTest',
  Review: 'menu.review',
  DailyTasks: 'menu.dailyTasks',
  DailyPlan: 'menu.dailyTasks',
  StudyPlanCreate: 'menu.dailyTasks',
  Grammar: 'menu.grammar',
  Listening: 'menu.listening',
  Speaking: 'menu.speaking',
  Reading: 'menu.reading',
  Writing: 'menu.writing',
  MockExam: 'menu.mockExam',
  Analysis: 'menu.analysis',
  ErrorBook: 'menu.errorBook',
  AnswerHistory: 'menu.answerHistory',
  Notifications: 'menu.notifications',
  SpeakingMock: 'menu.speaking',
  Profile: 'menu.profile',
  Settings: 'menu.settings',
  LearningHub: 'menu.learningHub'
}

// 核心页面（立即加载）
const LandingPage = () => import('../views/LandingPage.vue')
const LoginView = () => import('../views/LoginView.vue')
const MainLayout = () => import('../layouts/MainLayout.vue')

// ⚠️ 重要：所有动态导入必须使用静态字面量路径（不能用模板字符串变量）
// Vite 构建时会静态分析 import() 调用，模板字符串路径无法被分析，
// 导致组件不被打包，浏览器直接请求 .vue 源文件（返回 403/404）

const debugRoutes = import.meta.env.DEV
  ? [
    {
      path: 'api-test',
      name: 'ApiTest',
      component: () => import('../views/ApiTest.vue'),
      meta: { title: 'API测试', requiresAuth: false, priority: 'low' }
    },
    {
      path: 'debug-test',
      name: 'DebugTest',
      component: () => import('../views/DebugTest.vue'),
      meta: { title: '调试测试', requiresAuth: false, priority: 'low' }
    },
    {
      path: 'integration-test',
      name: 'IntegrationTest',
      component: () => import('../views/IntegrationTest.vue'),
      meta: { title: '集成测试', requiresAuth: false, priority: 'low' }
    },
    {
      path: 'share-demo',
      name: 'ShareDemo',
      component: () => import('../views/ShareDemo.vue'),
      meta: { title: '分享功能演示', requiresAuth: false, priority: 'low' }
    },
    {
      path: 'audio-debug',
      name: 'AudioDebug',
      component: () => import('../views/AudioDebugView.vue'),
      meta: { title: '音频播放诊断', requiresAuth: false, priority: 'low' }
    },
    {
      path: 'mobile-audio-test',
      name: 'MobileAudioTest',
      component: () => import('../views/MobileAudioTestView.vue'),
      meta: { title: '移动端音频测试', requiresAuth: false, priority: 'low' }
    }
  ]
  : []

// 学习模块路由配置（懒加载 + 预加载提示）
const learningRoutes = [
  {
    path: 'dashboard',
    alias: ['home', '/home'],
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: '学习仪表盘', requiresAuth: true, preload: true, priority: 'high' }
  },
  {
    path: 'vocabulary',
    alias: '/vocabulary',
    name: 'Vocabulary',
    component: () => import('../views/VocabularyView.vue'),
    meta: { title: '词汇学习', requiresAuth: true, preload: true, priority: 'high' }
  },
  {
    path: 'vocabulary-new',
    alias: '/vocabulary-new',
    name: 'VocabularyNew',
    component: () => import('../views/VocabularyViewNew.vue'),
    meta: { title: '词汇学习（新版）', requiresAuth: true }
  },
  {
    path: 'vocabulary-test',
    alias: '/vocabulary-test',
    name: 'VocabularyTest',
    component: () => import('../views/VocabularyTestView.vue'),
    meta: { title: '词汇测试', requiresAuth: true }
  },
  {
    path: 'review',
    alias: '/review',
    name: 'Review',
    component: () => import('../views/ReviewView.vue'),
    meta: { title: '智能复习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'daily-tasks',
    alias: '/daily-tasks',
    name: 'DailyTasks',
    component: () => import('../views/DailyTaskBoard.vue'),
    meta: { title: '每日任务', requiresAuth: true, preload: true, priority: 'high' }
  },
  {
    path: 'study-plan',
    alias: '/study-plan',
    name: 'DailyPlan',
    component: () => import('../views/StudyPlanView.vue'),
    meta: { title: '学习计划', requiresAuth: true }
  },
  {
    path: 'study-plan/create',
    alias: '/study-plan/create',
    name: 'StudyPlanCreate',
    component: () => import('../views/StudyPlanCreateView.vue'),
    meta: { title: '创建学习计划', requiresAuth: true }
  },
  {
    path: 'grammar',
    alias: '/grammar',
    name: 'Grammar',
    component: () => import('../views/GrammarView.vue'),
    meta: { title: '语法练习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'listening',
    alias: '/listening',
    name: 'Listening',
    component: () => import('../views/ListeningView.vue'),
    meta: { title: '听力训练', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'reading',
    alias: '/reading',
    name: 'Reading',
    component: () => import('../views/ReadingView.vue'),
    meta: { title: '阅读理解', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'writing',
    alias: '/writing',
    name: 'Writing',
    component: () => import('../views/WritingView.vue'),
    meta: { title: '写作练习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'speaking',
    alias: '/speaking',
    name: 'Speaking',
    component: () => import('../views/SpeakingView.vue'),
    meta: { title: '口语练习', requiresAuth: true, preload: true, priority: 'medium' }
  },
  {
    path: 'mock-exam',
    alias: '/mock-exam',
    name: 'MockExam',
    component: () => import('../views/MockExamView.vue'),
    meta: { title: '模拟考试', requiresAuth: true }
  },
  {
    path: 'analysis',
    alias: '/analysis',
    name: 'Analysis',
    component: () => import('../views/LearningAnalysisView.vue'),
    meta: { title: '学习分析', requiresAuth: true }
  },
  {
    path: 'error-book',
    alias: '/error-book',
    name: 'ErrorBook',
    component: () => import('../views/ErrorBookView.vue'),
    meta: { title: '错题本', requiresAuth: true }
  },
  {
    path: 'achievements',
    alias: '/achievements',
    name: 'Achievements',
    component: () => import('../views/AchievementsView.vue'),
    meta: { title: '荣誉勋章', requiresAuth: true }
  },
  {
    path: 'answer-history',
    alias: '/answer-history',
    name: 'AnswerHistory',
    component: () => import('../views/AnswerHistoryView.vue'),
    meta: { title: '答题历史', requiresAuth: true }
  },
  {
    path: 'speaking-mock',
    alias: '/speaking-mock',
    name: 'SpeakingMock',
    component: () => import('../views/SpeakingMockView.vue'),
    meta: { title: 'AI 口语模考', requiresAuth: true }
  },
  {
    path: 'notifications',
    alias: '/notifications',
    name: 'Notifications',
    component: () => import('../views/NotificationsView.vue'),
    meta: { title: '通知中心', requiresAuth: true }
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
    component: () => import('../views/SettingsView.vue'),
    meta: { title: '设置', requiresAuth: true }
  },
  {
    path: 'learning-hub',
    alias: '/learning-hub',
    name: 'LearningHub',
    component: () => import('../views/LearningHubView.vue'),
    meta: { title: '学习中心', requiresAuth: true, preload: true, priority: 'high' }
  },
  ...debugRoutes
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
    component: () => import('../views/FeaturesPage.vue'),
    meta: { preload: true }
  },
  {
    path: '/exams',
    name: 'Exams',
    component: () => import('../views/ExamsPage.vue'),
    meta: { preload: true }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: () => import('../views/PricingPage.vue'),
    meta: { preload: true }
  },
  {
    path: '/leaderboard',
    name: 'PublicLeaderboard',
    component: () => import('../views/LeaderboardView.vue'),
    meta: { preload: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { preload: true, title: '登录 / 注册' }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('../views/MaintenanceView.vue')
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
    document.body.classList.add('page-loading')
  }

  // 跳过维护模式检查
  if (to.name === 'Maintenance') {
    next()
    return
  }

  // 获取系统配置
  await syncSystemConfigForGuard(systemStore, logger)

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
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
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
  const routeName = router.currentRoute.value.name ? String(router.currentRoute.value.name) : ''
  const titleKey = routeTitleKeyMap[routeName]
  if (titleKey) {
    document.title = `${i18n.global.t(titleKey)} - LearnSphere AI`
    return
  }

  const title = router.currentRoute.value.meta.title
  if (typeof title === 'string' && title.trim()) {
    document.title = `${title} - LearnSphere AI`
  }
})

// 预加载高优先级路由
function preloadRoutes() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const saveData = connection?.saveData
  const effectiveType = connection?.effectiveType || ''
  const deviceMemory = Number(navigator.deviceMemory || 0)
  const hardwareConcurrency = Number(navigator.hardwareConcurrency || 0)
  const isSlowNetwork = saveData || effectiveType.includes('2g') || effectiveType.includes('3g')
  const isLowEndDevice = (deviceMemory > 0 && deviceMemory <= 2) || (hardwareConcurrency > 0 && hardwareConcurrency <= 2)
  const shouldOnlyPreloadHighPriority = isSlowNetwork || isLowEndDevice

  if (isSlowNetwork && isLowEndDevice) {
    return
  }

  const highPriorityRoutes = collectPreloadLoaders(routes, 'high')
  const mediumPriorityRoutes = shouldOnlyPreloadHighPriority
    ? []
    : collectPreloadLoaders(routes, 'medium')

  // 立即预加载高优先级路由
  highPriorityRoutes.forEach(loader => {
    if (typeof loader === 'function') {
      loader().catch(() => { })
    }
  })

  // 延迟预加载中优先级路由（空闲时）
  if (mediumPriorityRoutes.length > 0 && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      mediumPriorityRoutes.forEach(loader => {
        if (typeof loader === 'function') {
          loader().catch(() => { })
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
