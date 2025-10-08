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
    getReadingHistory() {
        return request({
            url: '/ai/reading/history',
            method: 'get'
        })
    },

    // 获取听力训练历史
    // 获取听力训练历史
    getListeningHistory() {
        return request({
            url: '/ai/listening/history',
            method: 'get'
        })
    },

    generateSpeaking(data) {
        return request({
            url: '/ai/generate/speaking',
            method: 'post',
            data
        })
    },

    evaluateSpeaking(data) {
        return request({
            url: '/ai/evaluate/speaking',
            method: 'post',
            data
        })
    }
}
