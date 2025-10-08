import request from '@/utils/request'

export const recommendationApi = {
    // 获取个性化推荐
    getPersonalized(limit = 10) {
        return request({
            url: '/recommendations/personalized',
            method: 'get',
            params: { limit }
        })
    },

    // 获取今日推荐
    getDaily() {
        return request({
            url: '/recommendations/daily',
            method: 'get'
        })
    },

    // 获取复习推荐
    getReview(limit = 10) {
        return request({
            url: '/recommendations/review',
            method: 'get',
            params: { limit }
        })
    },

    // 获取基于难度的推荐
    getByDifficulty(difficulty, limit = 10) {
        return request({
            url: '/recommendations/by-difficulty',
            method: 'get',
            params: { difficulty, limit }
        })
    },

    // 获取基于考试类型的推荐
    getByExamType(examType, limit = 10) {
        return request({
            url: '/recommendations/by-exam-type',
            method: 'get',
            params: { examType, limit }
        })
    },

    // 获取 AI 智能建议 (从分析报告中提取)
    getAIRecommendations() {
        return request({
            url: '/recommendations/ai',
            method: 'get'
        })
    }
}
