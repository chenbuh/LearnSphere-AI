import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { authApi } from '@/api/auth'

const { message } = createDiscreteApi(['message'])

export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('learnsphere-token') || '')
    const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

    // 计算属性
    const username = ref(userInfo.value.username || '')
    const nickname = ref(userInfo.value.nickname || '')
    const email = ref(userInfo.value.email || '')
    const avatar = ref(userInfo.value.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${nickname.value || username.value || 'User'}`)
    const examType = ref(userInfo.value.examType || 'cet4')
    const currentLevel = ref(userInfo.value.currentLevel || 'beginner')
    const vipLevel = ref(userInfo.value.vipLevel || 0)
    const vipExpireTime = ref(userInfo.value.vipExpireTime || null)

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
     */
    const login = async (user, pwd) => {
        try {
            const response = await authApi.login({
                username: user,
                password: pwd
            })

            if (response.code === 200) {
                // 保存token和用户信息
                token.value = response.data.satoken
                userInfo.value = response.data.user
                username.value = response.data.user.username
                nickname.value = response.data.user.nickname
                email.value = response.data.user.email
                avatar.value = response.data.user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${response.data.user.nickname || response.data.user.username}`
                examType.value = response.data.user.examType || 'cet4'
                currentLevel.value = response.data.user.currentLevel || 'beginner'
                vipLevel.value = response.data.user.vipLevel || 0
                vipExpireTime.value = response.data.user.vipExpireTime || null

                // 保存到localStorage
                localStorage.setItem('learnsphere-token', token.value)
                localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

                message.success('登录成功')
                return { success: true, user: response.data.user }
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            message.error(error.message || '登录失败')
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
                message.success('注册成功，请登录')
                return { success: true }
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            message.error(error.message || '注册失败')
            throw error
        }
    }

    /**
     * 清除本地状态
     */
    const clearLocalState = () => {
        token.value = ''
        userInfo.value = {}
        username.value = ''
        nickname.value = ''
        email.value = ''
        avatar.value = ''
        examType.value = 'cet4'
        currentLevel.value = 'beginner'

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
                username.value = response.data.username
                nickname.value = response.data.nickname
                email.value = response.data.email
                avatar.value = response.data.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${response.data.nickname || response.data.username}`
                examType.value = response.data.examType || 'cet4'
                currentLevel.value = response.data.currentLevel || 'beginner'
                vipLevel.value = response.data.vipLevel || 0
                vipExpireTime.value = response.data.vipExpireTime || null

                localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
                return response.data
            }
        } catch (error) {
            console.error('获取用户信息失败:', error)
            // 如果获取用户信息失败，可能是token过期，清空本地数据
            // 静默清除，不提示消息
            clearLocalState()
        }
    }

    // 初始化时如果有token，务必校验用户信息有效性
    if (token.value) {
        getUserInfo()
    }

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
