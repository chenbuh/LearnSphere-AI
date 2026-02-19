import request from '@/utils/request'

export const userApi = {
    // 获取用户信息及统计
    getUserInfo() {
        return request({
            url: '/user/info',
            method: 'get'
        })
    },

    // 获取配额信息
    getQuotaInfo() {
        return request({
            url: '/user/quota',
            method: 'get'
        })
    },

    // 每日打卡
    checkin() {
        return request({
            url: '/user/checkin',
            method: 'post'
        })
    },

    // 获取排行榜
    getLeaderboard() {
        return request({
            url: '/user/leaderboard',
            method: 'get'
        })
    },

    // 获取全站统计
    getPublicStats() {
        return request({
            url: '/user/stats',
            method: 'get'
        })
    },

    // 获取我的排名
    getMyRank() {
        return request({
            url: '/user/my-rank',
            method: 'get'
        })
    },

    // 更新个人资料
    updateProfile(data) {
        return request({
            url: '/user/update',
            method: 'post',
            data
        })
    },

    // 修改密码
    updatePassword(data) {
        return request({
            url: '/user/password',
            method: 'post',
            data
        })
    },

    // 获取安全日志
    getSecurityLogs() {
        return request({
            url: '/user/security/logs',
            method: 'get'
        })
    },

    // --- MFA 相关 ---
    setupMfa() {
        return request({
            url: '/security/mfa/setup',
            method: 'get'
        })
    },

    bindMfa(data) {
        return request({
            url: '/security/mfa/bind',
            method: 'post',
            data
        })
    },

    getRiskStatus() {
        return request({
            url: '/security/risk-status',
            method: 'get'
        })
    }
}
