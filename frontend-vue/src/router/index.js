import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import VocabularyView from '../views/VocabularyView.vue'
import ProfileView from '../views/ProfileView.vue'
import { useUserStore } from '../stores/user'
import { useSystemStore } from '../stores/system'

const routes = [
    {
        path: '/',
        name: 'Landing',
        component: LandingPage
    },
    {
        path: '/home',
        redirect: '/'
    },
    {
        path: '/features',
        name: 'Features',
        component: () => import('../views/FeaturesPage.vue')
    },
    {
        path: '/exams',
        name: 'Exams',
        component: () => import('../views/ExamsPage.vue')
    },
    {
        path: '/pricing',
        name: 'Pricing',
        component: () => import('../views/PricingPage.vue')
    },
    {
        path: '/leaderboard',
        name: 'PublicLeaderboard',
        component: () => import('../views/LeaderboardView.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/maintenance',
        name: 'Maintenance',
        component: () => import('../views/MaintenanceView.vue')
    },
    {
        path: '/app',
        component: MainLayout,
        children: [
            {
                path: '',
                redirect: '/app/dashboard'
            },
            {
                path: 'dashboard',
                alias: ['home', '/home'],
                name: 'Dashboard',
                component: DashboardView,
                meta: { title: '学习仪表盘', requiresAuth: true }
            },
            {
                path: 'vocabulary',
                alias: '/vocabulary',
                name: 'Vocabulary',
                component: VocabularyView,
                meta: { title: '词汇学习', requiresAuth: true }
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
                meta: { title: '智能复习', requiresAuth: true }
            },
            {
                path: 'daily-tasks',
                alias: '/daily-tasks',
                name: 'DailyTasks',
                component: () => import('../views/DailyTaskBoard.vue'),
                meta: { title: '每日任务', requiresAuth: true }
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
                meta: { title: '语法练习', requiresAuth: true }
            },
            {
                path: 'listening',
                alias: '/listening',
                name: 'Listening',
                component: () => import('../views/ListeningView.vue'),
                meta: { title: '听力训练', requiresAuth: true }
            },
            {
                path: 'reading',
                alias: '/reading',
                name: 'Reading',
                component: () => import('../views/ReadingView.vue'),
                meta: { title: '阅读理解', requiresAuth: true }
            },
            {
                path: 'writing',
                alias: '/writing',
                name: 'Writing',
                component: () => import('../views/WritingView.vue'),
                meta: { title: '写作练习', requiresAuth: true }
            },
            {
                path: 'speaking',
                alias: '/speaking',
                name: 'Speaking',
                component: () => import('../views/SpeakingView.vue'),
                meta: { title: '口语练习', requiresAuth: true }
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
                path: 'profile',
                alias: '/profile',
                name: 'Profile',
                component: ProfileView,
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
                path: 'api-test',
                name: 'ApiTest',
                component: () => import('../views/ApiTest.vue'),
                meta: { title: 'API测试', requiresAuth: false }
            },
            {
                path: 'debug-test',
                name: 'DebugTest',
                component: () => import('../views/DebugTest.vue'),
                meta: { title: '调试测试', requiresAuth: false }
            },
            {
                path: 'integration-test',
                name: 'IntegrationTest',
                component: () => import('../views/IntegrationTest.vue'),
                meta: { title: '集成测试', requiresAuth: false }
            },
            {
                path: 'share-demo',
                name: 'ShareDemo',
                component: () => import('../views/ShareDemo.vue'),
                meta: { title: '分享功能演示', requiresAuth: false }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore()
    const systemStore = useSystemStore()

    // Skip maintenance check if already heading there
    if (to.name === 'Maintenance') {
        next()
        return
    }

    // Always fetch system config to ensure we catch maintenance mode changes immediately
    await systemStore.fetchSystemConfig()

    // If maintenance mode is active, redirect to maintenance page
    // Bypass for admin users if role is available
    if (systemStore.isMaintenanceMode) {
        // basic bypass check if we have role info
        const role = userStore.userInfo?.role
        if (role !== 'admin' && role !== 'ADMIN') {
            next('/maintenance')
            return
        }
    }

    if (to.meta.requiresAuth && !userStore.token) {
        next('/login')
    } else {
        next()
    }
})

export default router
