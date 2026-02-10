import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory('/admin/'),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login.vue')
        },
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('@/views/Dashboard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/users',
            name: 'Users',
            component: () => import('@/views/Users.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/vocabulary',
            name: 'Vocabulary',
            component: () => import('@/views/Vocabulary.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/records',
            name: 'Records',
            component: () => import('@/views/Records.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/content',
            name: 'Content',
            component: () => import('@/views/Content.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/writing',
            name: 'Writing',
            component: () => import('@/views/Writing.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/exams',
            name: 'ExamManagement',
            component: () => import('@/views/ExamManagement.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/sensitive',
            name: 'SensitiveAudit',
            component: () => import('@/views/SensitiveAudit.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/logs',
            name: 'OperationLogs',
            component: () => import('@/views/OperationLogs.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/ai',
            name: 'AIGovernance',
            component: () => import('@/views/AIGovernance.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/ai-feedback',
            name: 'AIFeedbackAudit',
            component: () => import('@/views/AIFeedbackAudit.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'SystemSettings',
            component: () => import('@/views/SystemSettings.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/notifications',
            name: 'Notifications',
            component: () => import('@/views/Notifications.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/user-logs',
            name: 'UserLogs',
            component: () => import('@/views/UserLogs.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/monitor',
            name: 'SystemMonitor',
            component: () => import('@/views/SystemMonitor.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/redis',
            name: 'RedisManagement',
            component: () => import('@/views/RedisManagement.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('admin-token')

    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else if (to.path === '/login' && token) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
