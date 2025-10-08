import request from '../utils/request'

/**
 * 词汇掌握度 API
 */
export const masteryApi = {
    /**
     * 记录学习结果
     * @param {number} vocabularyId - 词汇ID
     * @param {boolean} isCorrect - 是否答对
     */
    recordReview(vocabularyId, isCorrect) {
        return request.post('/vocabulary/mastery/record', {
            vocabularyId,
            isCorrect
        })
    },

    /**
     * 获取需要复习的单词列表
     * @param {number} limit - 数量限制
     */
    getReviewList(limit = 20) {
        return request.get('/vocabulary/mastery/review-list', {
            params: { limit }
        })
    },

    /**
     * 获取掌握统计
     */
    getStats() {
        return request.get('/vocabulary/mastery/stats')
    },

    /**
     * 收藏/取消收藏
     * @param {number} vocabularyId - 词汇ID
     * @param {boolean} favorite - 是否收藏
     */
    toggleFavorite(vocabularyId, favorite) {
        return request.post('/vocabulary/mastery/favorite', {
            vocabularyId,
            favorite
        })
    },

    /**
     * 添加笔记
     * @param {number} vocabularyId - 词汇ID
     * @param {string} notes - 笔记内容
     */
    addNotes(vocabularyId, notes) {
        return request.post('/vocabulary/mastery/notes', {
            vocabularyId,
            notes
        })
    },

    /**
     * 获取单词掌握详情
     * @param {number} vocabularyId - 词汇ID
     */
    getMasteryDetail(vocabularyId) {
        return request.get(`/vocabulary/mastery/detail/${vocabularyId}`)
    }
}
