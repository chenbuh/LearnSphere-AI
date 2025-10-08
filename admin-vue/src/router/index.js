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
            path: '/grammar',
            name: 'Grammar',
            component: () => import('@/views/Grammar.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/speaking',
            name: 'Speaking',
            component: () => import('@/views/Speaking.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/exams',
            name: 'ExamManagement',
            component: () => import('@/views/ExamManagement.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/ai',
            name: 'AIGovernance',
            component: () => import('@/views/AIGovernance.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',
            name: 'SystemSettings',
            component: () => import('@/views/SystemSettings.vue'),
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
