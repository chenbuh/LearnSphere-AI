import { studyPlanApi } from '@/api/studyPlan'
import { useMessage } from 'naive-ui'

/**
 * 任务追踪工具
 * 用于在各个学习模块中追踪和完成每日任务
 */
class TaskTracker {
  constructor() {
    this.currentTasks = []
    this.message = null
  }

  /**
   * 初始化 - 获取今日任务
   */
  async init() {
    try {
      const res = await studyPlanApi.getTodayTasks()
      this.currentTasks = res.data || []
      return this.currentTasks
    } catch (error) {
      console.error('[TaskTracker] 获取任务失败:', error)
      return []
    }
  }

  /**
   * 查找指定类型的未完成任务
   * @param {string} taskType - 任务类型 (vocabulary/grammar/listening/reading/writing/speaking)
   */
  findTask(taskType) {
    return this.currentTasks.find(
      task => task.taskType === taskType && !task.isCompleted
    )
  }

  /**
   * 更新任务进度
   * @param {string} taskType - 任务类型
   * @param {number} progress - 当前进度
   */
  async updateProgress(taskType, progress) {
    const task = this.findTask(taskType)
    if (!task) return false

    // 如果达到目标，自动完成任务
    if (progress >= task.targetCount) {
      return await this.completeTask(taskType, progress)
    }

    return false
  }

  /**
   * 完成任务
   * @param {string} taskType - 任务类型
   * @param {number} completedCount - 完成数量
   */
  async completeTask(taskType, completedCount) {
    const task = this.findTask(taskType)
    if (!task) {
      console.log('[TaskTracker] 未找到对应任务或任务已完成')
      return false
    }

    try {
      await studyPlanApi.completeTask(task.id, completedCount)
      task.isCompleted = true
      task.completedCount = completedCount

      // 显示完成提示
      if (this.message) {
        this.message.success(`✨ 任务完成！获得 50 积分`, {
          duration: 3000
        })
      }

      return true
    } catch (error) {
      console.error('[TaskTracker] 完成任务失败:', error)
      return false
    }
  }

  /**
   * 检查是否有对应类型的任务
   * @param {string} taskType - 任务类型
   */
  hasTask(taskType) {
    return !!this.findTask(taskType)
  }

  /**
   * 获取任务进度信息
   * @param {string} taskType - 任务类型
   */
  getTaskInfo(taskType) {
    const task = this.findTask(taskType)
    if (!task) return null

    return {
      id: task.id,
      name: task.taskName,
      target: task.targetCount,
      completed: task.completedCount || 0,
      isCompleted: task.isCompleted
    }
  }

  /**
   * 设置消息提示实例
   */
  setMessage(messageInstance) {
    this.message = messageInstance
  }
}

// 创建单例
const taskTracker = new TaskTracker()

export default taskTracker
