import request from '@/utils/request'

export const aiApi = {
    generateReading(data) {
        return request({
            url: '/ai/generate/reading',
            method: 'post',
            data
        })
    },

    generateWriting(data) {
        return request({
            url: '/ai/generate/writing',
            method: 'post',
            data
        })
    },

    evaluateWriting(data) {
        return request({
            url: '/ai/evaluate/writing',
            method: 'post',
            data
        })
    },

    generateGrammar(data) {
        return request({
            url: '/ai/generate/grammar',
            method: 'post',
            data
        })
    },

    generateListening(data) {
        return request({
            url: '/ai/generate/listening',
            method: 'post',
            data
        })
    },



    // 获取阅读理解历史
    getReadingHistory(page = 1, size = 10) {
        return request({
            url: '/ai/reading/history',
            method: 'get',
            params: { page, size }
        })
    },

    // 获取听力训练历史
    getListeningHistory(page = 1, size = 10) {
        return request({
            url: '/ai/listening/history',
            method: 'get',
            params: { page, size }
        })
    },

    generateSpeaking(data) {
        return request({
            url: '/ai/generate/speaking',
            method: 'post',
            data
        })
    },

    // 获取语法练习历史
    getGrammarHistory(page = 1, size = 10) {
        return request({
            url: '/ai/grammar/history',
            method: 'get',
            params: { page, size }
        })
    },

    // 获取口语练习历史  
    getSpeakingHistory(page = 1, size = 10) {
        return request({
            url: '/ai/speaking/history',
            method: 'get',
            params: { page, size }
        })
    },

    // 获取写作练习历史
    getWritingHistory(page = 1, size = 10) {
        return request({
            url: '/ai/writing/history',
            method: 'get',
            params: { page, size }
        })
    },

    evaluateSpeaking(data) {
        return request({
            url: '/ai/evaluate/speaking',
            method: 'post',
            data
        })
    },

    // AI Tutor 智能会话
    chatWithTutor(data) {
        return request({
            url: '/ai/tutor/chat',
            method: 'post',
            data
        })
    },

    // AI Tutor 带历史记录的对话
    chatWithHistory(data) {
        return request({
            url: '/ai/tutor/chat/history',
            method: 'post',
            data
        })
    },

    // 获取对话历史
    getConversationHistory(sessionId) {
        return request({
            url: `/ai/tutor/history/${sessionId}`,
            method: 'get'
        })
    },

    // 获取用户薄弱知识点
    getUserWeaknesses(needsReview = null) {
        return request({
            url: '/ai/tutor/weaknesses',
            method: 'get',
            params: needsReview !== null ? { needsReview } : {}
        })
    },

    // 获取个性化复习建议
    getReviewSuggestions(limit = 5) {
        return request({
            url: '/ai/tutor/review-suggestions',
            method: 'get',
            params: { limit }
        })
    },

    // 记录答题情况
    recordPractice(data) {
        return request({
            url: '/ai/tutor/record-practice',
            method: 'post',
            data
        })
    },

    // 获取相关知识点推荐
    getRelatedTopics(topic) {
        return request({
            url: '/ai/tutor/related-topics',
            method: 'get',
            params: { topic }
        })
    },

    // 获取 AI 学习建议
    getLearningAdvice(topic) {
        return request({
            url: '/ai/tutor/learning-advice',
            method: 'get',
            params: { topic }
        })
    },

    // 个性化错题深度解析
    deepAnalyzeError(id) {
        return request({
            url: `/ai/analyze-error/${id}`,
            method: 'post'
        })
    },

    // 开启 1V1 口语模考
    startSpeakingMock(data) {
        return request({
            url: '/ai/speaking-mock/start',
            method: 'post',
            data
        })
    },

    // 继续 1V1 口语模考
    continueSpeakingMock(data) {
        return request({
            url: '/ai/speaking-mock/continue',
            method: 'post',
            data
        })
    },

    // 生成口语模考分析报告
    generateSpeakingReport(conversation) {
        return request({
            url: '/ai/speaking-mock/report',
            method: 'post',
            data: conversation
        })
    },

    // 获取口语排行榜
    getSpeakingLeaderboard() {
        return request({
            url: '/admin/speaking-leaderboard',
            method: 'get'
        })
    },

    // 提交 AI 内容反馈
    submitFeedback(data) {
        return request({
            url: '/ai/feedback/submit',
            method: 'post',
            data
        })
    }
}
