import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { createDiscreteApi, darkTheme, lightTheme } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import request from '@/utils/request'

/**
 * VIP权限检查和配额管理
 */
export function useVipPermission() {
    const userStore = useUserStore()
    const themeStore = useThemeStore()
    const { message, dialog } = createDiscreteApi(['message', 'dialog'], {
        configProviderProps: {
            theme: themeStore.isDark ? darkTheme : lightTheme
        }
    })
    const quotaInfo = ref({
        dailyQuota: 5,
        usedToday: 0,
        remainingToday: 5,
        usagePercent: 0,
        dailyTutorQuota: 200,
        tutorUsedToday: 0,
        tutorRemainingToday: 200,
        tutorUsagePercent: 0,
        isVip: false,
        vipLevel: 0
    })

    // 是否是VIP用户
    const isVip = computed(() => userStore.isVip())

    // VIP等级标签
    const vipLevelLabel = computed(() => {
        const levels = {
            0: '普通用户',
            1: '月度会员',
            2: '季度会员',
            3: '年度会员'
        }
        return levels[userStore.vipLevel] || '普通用户'
    })

    // 获取配额信息
    const fetchQuotaInfo = async () => {
        try {
            const response = await request.get('/user/quota')
            if (response.code === 200) {
                quotaInfo.value = response.data
                return response.data
            }
        } catch (error) {
            console.error('获取配额信息失败:', error)
        }
    }

    // 检查是否有权限使用功能
    const checkPermission = (featureName, quotaCost = 1) => {
        if (!isVip.value) {
            showUpgradeDialog(featureName)
            return false
        }
        return true
    }

    // 检查配额是否足够
    const checkQuota = async (quotaCost = 1) => {
        await fetchQuotaInfo()

        if (quotaInfo.value.remainingToday < quotaCost) {
            if (quotaInfo.value.isVip) {
                message.warning(
                    `今日AI调用次数已用完 (${quotaInfo.value.usedToday}/${quotaInfo.value.dailyQuota})，请明天再试`
                )
            } else {
                dialog.warning({
                    title: '免费额度已用完',
                    content: `您今日的免费额度已用完 (${quotaInfo.value.usedToday}/${quotaInfo.value.dailyQuota})。升级 VIP 可获得每日 50-200 次额度！`,
                    positiveText: '立即升级',
                    negativeText: '取消',
                    onPositiveClick: () => {
                        window.location.href = '/pricing'
                    }
                })
            }
            return false
        }

        return true
    }

    // 显示升级对话框
    const showUpgradeDialog = (featureName = 'AI 生成') => {
        dialog.warning({
            title: 'VIP 专属功能',
            content: `【${featureName}】是 VIP 专属功能。升级 VIP 即可解锁所有 AI 增强功能，享受智能学习体验！
      
✨ VIP 会员特权：
• 每日 50-200 次 AI 调用额度
• 所有 AI 生成功能无限制访问
• 智能批改和评测
• 个性化学习计划
• 无广告纯净体验
• 专属客服支持


💎 会员价格：
• 月度会员：¥10/月 (50次/天)
• 季度会员：¥25/季 (100次/天)
• 年度会员：¥88/年 (200次/天)`,
            positiveText: '立即升级',
            negativeText: '暂不升级',
            onPositiveClick: () => {
                window.location.href = '/pricing'
            }
        })
    }

    // 显示配额不足提示
    const showQuotaWarning = () => {
        const remaining = quotaInfo.value.remainingToday
        const total = quotaInfo.value.dailyQuota

        if (remaining <= 2 && remaining > 0) {
            message.warning(`今日剩余额度不足：${remaining}/${total}`)
        }
    }

    // 获取配额使用百分比的状态类型
    const getQuotaStatus = computed(() => {
        const percent = quotaInfo.value.usagePercent
        if (percent >= 90) return 'error'
        if (percent >= 70) return 'warning'
        return 'success'
    })

    // 获取配额颜色
    const getQuotaColor = computed(() => {
        const percent = quotaInfo.value.usagePercent
        if (percent >= 90) return '#f56c6c'
        if (percent >= 70) return '#e6a23c'
        return '#67c23a'
    })

    // 监听配额变化事件（用于实时更新）
    const setupQuotaListener = () => {
        // 监听自定义事件
        window.addEventListener('quota-updated', () => {
            fetchQuotaInfo()
        })
    }

    // 触发配额刷新（供其他组件调用）
    const refreshQuota = () => {
        return fetchQuotaInfo()
    }

    return {
        isVip,
        vipLevelLabel,
        quotaInfo,
        fetchQuotaInfo,
        refreshQuota,
        setupQuotaListener,
        checkPermission,
        checkQuota,
        showUpgradeDialog,
        showQuotaWarning,
        getQuotaStatus,
        getQuotaColor
    }
}
