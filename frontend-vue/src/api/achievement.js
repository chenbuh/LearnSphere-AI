import request from '@/utils/request'

export const achievementApi = {
    // 获取我的成就列表及进度
    getMyAchievements() {
        return request({
            url: '/achievement/list',
            method: 'get'
        })
    }
}
