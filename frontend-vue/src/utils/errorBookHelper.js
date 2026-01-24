/**
 * 错题记录工具
 * 统一保存各模块的错题到错题本
 */
import { learningApi } from '@/api/learning'
import { useMessage } from 'naive-ui'

/**
 * 保存错题记录
 * @param {Object} options 配置参数
 * @param {number} options.contentId - 内容ID（词汇ID、题目ID等）
 * @param {string} options.contentType - 内容类型：vocabulary/grammar/reading/listening/writing/speaking
 * @param {string} options.question - 题目内容
 * @param {string} options.userAnswer - 用户答案
 * @param {string} options.correctAnswer - 正确答案
 * @param {number} options.timeSpent - 耗时（秒）
 * @param {number} options.score - 得分（0-100）
 * @param {Object} options.originalContent - 原始内容（完整题目数据，会被JSON序列化）
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function saveWrongQuestion(options) {
    try {
        const {
            contentId = 0,
            contentType,
            question = '',
            userAnswer = '',
            correctAnswer = '',
            timeSpent = 0,
            score = 0,
            originalContent = {}
        } = options

        // 构建学习记录数据
        const recordData = {
            contentId,
            contentType,
            isCorrect: 0, // 错题标记
            answer: userAnswer,
            correctAnswer,
            timeSpent,
            score,
            masteryLevel: 0, // 错题默认掌握程度为0
            originalContent: JSON.stringify({
                question,
                ...originalContent
            })
        }

        console.log('[错题本] 保存错题:', {
            type: contentType,
            question: question.substring(0, 50) + '...'
        })

        const res = await learningApi.createRecord(recordData)

        if (res.code === 200) {
            console.log('[错题本] ✅ 错题已保存')
            return true
        } else {
            console.warn('[错题本] ⚠️ 保存失败:', res.message)
            return false
        }
    } catch (error) {
        console.error('[错题本] ❌ 保存异常:', error)
        return false
    }
}

/**
 * 批量保存错题
 * @param {Array} wrongQuestions 错题数组
 * @returns {Promise<{success: number, failed: number}>} 成功和失败的数量
 */
export async function batchSaveWrongQuestions(wrongQuestions) {
    let success = 0
    let failed = 0

    for (const question of wrongQuestions) {
        const result = await saveWrongQuestion(question)
        if (result) {
            success++
        } else {
            failed++
        }
    }

    console.log(`[错题本] 批量保存完成: 成功 ${success}, 失败 ${failed}`)

    return { success, failed }
}

/**
 * 保存正确答案记录（用于统计学习进度）
 * @param {Object} options - 同 saveWrongQuestion 的参数
 * @returns {Promise<boolean>}
 */
export async function saveCorrectRecord(options) {
    try {
        const {
            contentId = 0,
            contentType,
            question = '',
            userAnswer = '',
            correctAnswer = '',
            timeSpent = 0,
            score = 100,
            originalContent = {}
        } = options

        const recordData = {
            contentId,
            contentType,
            isCorrect: 1, // 正确答案标记
            answer: userAnswer,
            correctAnswer,
            timeSpent,
            score,
            masteryLevel: 3, // 正确答案默认掌握程度为3
            originalContent: JSON.stringify({
                question,
                ...originalContent
            })
        }

        const res = await learningApi.createRecord(recordData)
        return res.code === 200
    } catch (error) {
        console.error('[学习记录] 保存异常:', error)
        return false
    }
}
