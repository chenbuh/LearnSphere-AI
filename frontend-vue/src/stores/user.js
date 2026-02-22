import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { authApi } from '@/api/auth'

const { message } = createDiscreteApi(['message'])

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('learnsphere-token') || '')
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

    // 计算属性 (全部改为从 userInfo.value 动态计算)
    const username = computed(() => userInfo.value?.username || '')
    const nickname = computed(() => userInfo.value?.nickname || '')
    const email = computed(() => userInfo.value?.email || '')
    const avatar = computed(() => userInfo.value?.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(nickname.value || username.value || 'User')}`)
    const examType = computed(() => userInfo.value?.examType || 'cet4')
    const currentLevel = computed(() => userInfo.value?.currentLevel || 'beginner')
    const vipLevel = computed(() => userInfo.value?.vipLevel || 0)
    const vipExpireTime = computed(() => userInfo.value?.vipExpireTime || null)

    // 辅助计算：判断当前是否是有效的 VIP
    const isVip = () => {
        if (!vipExpireTime.value) return false
        return new Date(vipExpireTime.value) > new Date()
    }

    const getVipLabel = () => {
        if (!isVip()) return '普通用户'
        const levels = {
            1: '月度会员',
            2: '季度会员',
            3: '年度会员'
        }
        return levels[vipLevel.value] || '专业会员'
    }

    /**
     * 用户登录
     * @param {string} user - 用户名
     * @param {string} pwd - 密码
     * @param {string} captchaCode - 验证码（可选）
     * @param {string} captchaKey - 验证码Key（可选）
     */
    const login = async (user, pwd, captchaCode = '', captchaKey = '') => {
        try {
            const response = await authApi.login({
                username: user,
                password: pwd,
                captchaCode,
                captchaKey
            })

            if (response.code === 200) {
                console.log('[UserStore] Login success, saving token.')
                // 保存token和用户信息
                token.value = response.data.satoken
                userInfo.value = response.data.user

                // 保存到localStorage
                localStorage.setItem('learnsphere-token', token.value)
                localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

                // 不在这里显示消息,由调用方处理
                return { success: true, user: response.data.user }
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            // 不在这里显示错误消息,由调用方处理
            throw error
        }
    }

    /**
     * 用户注册
     * @param {Object} registerData - 注册数据
     */
    const register = async (registerData) => {
        try {
            const response = await authApi.register(registerData)
            if (response.code === 200) {
                // 不在这里显示消息,由调用方处理
                return { success: true }
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            // 不在这里显示错误消息,由调用方处理
            throw error
        }
    }

    /**
     * 清除本地状态
     */
    const clearLocalState = () => {
        console.log('[UserStore] Clearing local state...')
        token.value = ''
        userInfo.value = {}
        localStorage.removeItem('learnsphere-token')
        localStorage.removeItem('userInfo')
    }

    /**
     * 用户登出
     */
    const logout = async () => {
        try {
            if (token.value) {
                await authApi.logout()
            }
        } catch (error) {
            console.error('登出请求失败:', error)
        } finally {
            clearLocalState()

            message.success('已退出登录')
            // 如果已经在首页，不要重新刷新页面，只重置状态即可
            if (window.location.pathname === '/') {
                // state already reset
            } else {
                window.location.href = '/'
            }
        }
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = async () => {
        try {
            const response = await authApi.getUserInfo()
            if (response.code === 200) {
                userInfo.value = response.data
                localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
                return response.data
            }
        } catch (error) {
            console.error('获取用户信息失败:', error)
            // 如果获取用户信息失败，可能是token过期，清空本地数据并跳转
            clearLocalState()
            message.warning('登录已过期，请重新登录')
            // 使用 window.location 跳转以确保完全重置状态
            window.location.href = '/login'
        }
    }

    // 状态初始化逻辑已移至各页面挂载钩子或按需调用，避免初始化竞态导致的误退出

    return {
        token,
        userInfo,
        username,
        nickname,
        email,
        avatar,
        examType,
        currentLevel,
        vipLevel,
        vipExpireTime,
        isVip,
        getVipLabel,
        login,
        register,
        logout,
        getUserInfo
    }
})
