import request from '@/utils/request'

/**
 * 学习记录相关API
 */
export const learningApi = {
  /**
   * 创建学习记录
   * @param {Object} data - 学习记录数据
   * @param {number} data.contentId - 内容ID
   * @param {string} data.contentType - 内容类型（vocabulary/grammar/reading）
   * @param {number} data.isCorrect - 是否正确（0-错误，1-正确）
   * @param {number} data.timeSpent - 耗时（秒）
   * @param {number} data.score - 得分
   * @param {string} data.answer - 用户答案
   * @param {string} data.correctAnswer - 正确答案
   * @param {number} data.masteryLevel - 掌握程度（0-5）
   */
  createRecord(data) {
    return request({
      url: '/learning/record',
      method: 'post',
      data
    })
  },

  /**
   * 获取学习记录列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认1）
   * @param {number} params.pageSize - 每页数量（默认20）
   * @param {string} params.contentType - 内容类型（可选）
   */
  getRecords(params) {
    return request({
      url: '/learning/records',
      method: 'get',
      params
    })
  },

  /**
   * 获取学习统计
   */
  getStatistics() {
    return request({
      url: '/learning/statistics',
      method: 'get'
    })
  },

  /**
   * 获取复习列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认1）
   * @param {number} params.pageSize - 每页数量（默认20）
   */
  getReviewList(params) {
    return request({
      url: '/learning/review',
      method: 'get',
      params
    })
  },

  /**
   * 获取趋势统计
   * @param {number} days - 天数
   */
  getTrends(days) {
    return request({
      url: '/learning/trends',
      method: 'get',
      params: { days }
    })
  },

  /**
   * 获取分析报告 (生成新的)
   */
  generateAnalysis() {
    return request({
      url: '/learning/analysis/generate',
      method: 'get'
    })
  },

  /**
   * 获取最近一次分析报告
   */
  getLastAnalysis() {
    return request({
      url: '/learning/analysis/last',
      method: 'get'
    })
  }
}
