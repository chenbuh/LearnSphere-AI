import request from '@/utils/request'

export const userApi = {
    // 获取用户信息及统计
    getUserInfo() {
        return request({
            url: '/user/info',
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
    }
}
