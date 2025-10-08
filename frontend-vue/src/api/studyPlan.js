import request from '../utils/request'

/**
 * 学习计划 API
 */
export const studyPlanApi = {
    /**
     * 创建学习计划
     * @param {Object} data - 计划数据
     * @param {string} data.examType - 考试类型
     * @param {number} data.targetScore - 目标分数
     * @param {number} data.durationDays - 计划天数
     */
    createPlan(data) {
        return request.post('/study-plan/create', data)
    },

    /**
     * 获取当前计划
     */
    getCurrentPlan() {
        return request.get('/study-plan/current')
    },

    /**
     * 获取今日任务
     */
    getTodayTasks() {
        return request.get('/study-plan/tasks/today')
    },

    /**
     * 完成任务
     * @param {number} taskId - 任务ID
     * @param {number} completedCount - 完成数量
     */
    completeTask(taskId, completedCount) {
        return request.post(`/study-plan/tasks/${taskId}/complete`, {
            completedCount
        })
    }
}
