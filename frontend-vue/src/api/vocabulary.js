import request from '@/utils/request'

/**
 * 词汇学习相关API
 */
export const vocabularyApi = {
  /**
   * 获取词汇列表
   * @param {Object} params - 查询参数
   * @param {string} params.examType - 考试类型（必填）
   * @param {number} params.difficulty - 难度等级（可选，1-5）
   * @param {number} params.page - 页码（默认1）
   * @param {number} params.pageSize - 每页数量（默认20）
   * @param {string} params.keyword - 搜索关键词（可选）
   */
  getVocabularyList(params) {
    return request({
      url: '/vocabulary/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取单词详情
   * @param {number} id - 单词ID
   */
  getVocabularyDetail(id) {
    return request({
      url: `/vocabulary/${id}`,
      method: 'get'
    })
  },

  /**
   * 获取每日单词
   * @param {Object} params - 查询参数
   * @param {string} params.examType - 考试类型
   * @param {number} params.count - 单词数量（默认50）
   */
  getDailyWords(params) {
    return request({
      url: '/vocabulary/daily',
      method: 'get',
      params
    })
  }
}