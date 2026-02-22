/**
 * 自适应难度系统
 * 根据用户表现动态调整题目难度
 */

// 难度等级定义
export interface DifficultyLevel {
  level: number // 1-10
  name: string
  description: string
  accuracyThreshold: number // 正确率阈值
  timeThreshold: number // 时间阈值（秒）
}

// 用户表现数据
export interface UserPerformance {
  accuracy: number // 正确率 0-1
  averageTime: number // 平均用时（秒）
  consecutiveCorrect: number // 连续正确数
  consecutiveWrong: number // 连续错误数
  totalAnswered: number // 总答题数
  recentPerformance: number[] // 最近10题的表现 [1, 0, 1, 1, 0, ...]
}

// 难度调节策略
export interface AdjustmentStrategy {
  shouldIncrease: boolean
  shouldDecrease: boolean
  newLevel?: number
  reason: string
  confidence: number // 置信度 0-1
}

class AdaptiveDifficulty {
  private currentLevel: number = 5
  private readonly minLevel: number = 1
  private readonly maxLevel: number = 10
  private readonly levels: DifficultyLevel[] = [
    { level: 1, name: '入门', description: '基础练习', accuracyThreshold: 0.5, timeThreshold: 60 },
    { level: 2, name: '简单', description: '简单练习', accuracyThreshold: 0.6, timeThreshold: 50 },
    { level: 3, name: '较简单', description: '较简单练习', accuracyThreshold: 0.65, timeThreshold: 45 },
    { level: 4, name: '中等偏易', description: '中等偏易', accuracyThreshold: 0.7, timeThreshold: 40 },
    { level: 5, name: '中等', description: '中等难度', accuracyThreshold: 0.75, timeThreshold: 35 },
    { level: 6, name: '中等偏难', description: '中等偏难', accuracyThreshold: 0.8, timeThreshold: 30 },
    { level: 7, name: '较难', description: '较难练习', accuracyThreshold: 0.85, timeThreshold: 25 },
    { level: 8, name: '困难', description: '困难练习', accuracyThreshold: 0.9, timeThreshold: 20 },
    { level: 9, name: '很困难', description: '很困难', accuracyThreshold: 0.95, timeThreshold: 15 },
    { level: 10, name: '专家', description: '专家级', accuracyThreshold: 0.98, timeThreshold: 10 }
  ]

  constructor(initialLevel?: number) {
    if (initialLevel !== undefined) {
      this.currentLevel = Math.min(Math.max(initialLevel, this.minLevel), this.maxLevel)
    }
  }

  /**
   * 根据用户表现调整难度
   */
  adjustDifficulty(performance: UserPerformance): AdjustmentStrategy {
    const level = this.getCurrentLevel()
    const strategy: AdjustmentStrategy = {
      shouldIncrease: false,
      shouldDecrease: false,
      reason: '',
      confidence: 0.5
    }

    // 判断是否需要调整难度
    const shouldIncrease = this.evaluateIncrease(performance, level)
    const shouldDecrease = this.evaluateDecrease(performance, level)

    if (shouldIncrease.result && !shouldDecrease.result) {
      // 提高难度
      const newLevel = Math.min(this.currentLevel + 1, this.maxLevel)
      strategy.shouldIncrease = true
      strategy.newLevel = newLevel
      strategy.reason = shouldIncrease.reason
      strategy.confidence = shouldIncrease.confidence

      if (newLevel > this.currentLevel) {
        this.currentLevel = newLevel
      }
    } else if (shouldDecrease.result && !shouldIncrease.result) {
      // 降低难度
      const newLevel = Math.max(this.currentLevel - 1, this.minLevel)
      strategy.shouldDecrease = true
      strategy.newLevel = newLevel
      strategy.reason = shouldDecrease.reason
      strategy.confidence = shouldDecrease.confidence

      if (newLevel < this.currentLevel) {
        this.currentLevel = newLevel
      }
    } else if (shouldIncrease.result && shouldDecrease.result) {
      // 两者都满足，保持当前难度
      strategy.reason = '你的表现很稳定，继续保持！'
      strategy.confidence = 0.8
    } else {
      // 保持当前难度
      strategy.reason = '继续当前难度的练习，提升熟练度'
      strategy.confidence = 0.7
    }

    return strategy
  }

  /**
   * 评估是否应该提高难度
   */
  private evaluateIncrease(performance: UserPerformance, level: DifficultyLevel) {
    const reasons = []
    let confidence = 0

    // 条件1: 正确率高
    if (performance.accuracy >= level.accuracyThreshold) {
      reasons.push(`正确率 ${Math.floor(performance.accuracy * 100)}% 超过阈值`)
      confidence += 0.4
    }

    // 条件2: 速度快
    if (performance.averageTime < level.timeThreshold) {
      reasons.push(`平均用时 ${Math.floor(performance.averageTime)}秒 小于阈值`)
      confidence += 0.3
    }

    // 条件3: 连续正确
    if (performance.consecutiveCorrect >= 3) {
      reasons.push(`连续答对 ${performance.consecutiveCorrect} 题`)
      confidence += 0.2
    }

    // 条件4: 最近表现好
    if (performance.recentPerformance.length >= 5) {
      const recentAccuracy = performance.recentPerformance.slice(-5)
        .reduce((a, b) => a + b, 0) / 5
      if (recentAccuracy >= 0.8) {
        reasons.push('最近 5 题正确率高')
        confidence += 0.1
      }
    }

    // 条件5: 总答题数足够
    if (performance.totalAnswered >= 10) {
      confidence += 0.1
    }

    return {
      result: confidence >= 0.7,
      reason: reasons.join('；'),
      confidence: Math.min(confidence, 1)
    }
  }

  /**
   * 评估是否应该降低难度
   */
  private evaluateDecrease(performance: UserPerformance, level: DifficultyLevel) {
    const reasons = []
    let confidence = 0

    // 条件1: 正确率低
    if (performance.accuracy < level.accuracyThreshold - 0.15) {
      reasons.push(`正确率 ${Math.floor(performance.accuracy * 100)}% 低于阈值`)
      confidence += 0.4
    }

    // 条件2: 速度慢
    if (performance.averageTime > level.timeThreshold * 1.5) {
      reasons.push(`平均用时 ${Math.floor(performance.averageTime)}秒 超过阈值`)
      confidence += 0.3
    }

    // 条件3: 连续错误
    if (performance.consecutiveWrong >= 3) {
      reasons.push(`连续答错 ${performance.consecutiveWrong} 题`)
      confidence += 0.2
    }

    // 条件4: 最近表现差
    if (performance.recentPerformance.length >= 5) {
      const recentAccuracy = performance.recentPerformance.slice(-5)
        .reduce((a, b) => a + b, 0) / 5
      if (recentAccuracy < 0.4) {
        reasons.push('最近 5 题正确率低')
        confidence += 0.1
      }
    }

    return {
      result: confidence >= 0.7,
      reason: reasons.join('；'),
      confidence: Math.min(confidence, 1)
    }
  }

  /**
   * 获取当前难度等级
   */
  getCurrentLevel(): DifficultyLevel {
    return this.levels[this.currentLevel - 1]
  }

  /**
   * 设置难度等级
   */
  setLevel(level: number): void {
    this.currentLevel = Math.min(Math.max(level, this.minLevel), this.maxLevel)
  }

  /**
   * 获取所有难度等级
   */
  getAllLevels(): DifficultyLevel[] {
    return [...this.levels]
  }

  /**
   * 计算难度分数 (0-100)
   */
  getDifficultyScore(): number {
    return ((this.currentLevel - this.minLevel) / (this.maxLevel - this.minLevel)) * 100
  }
}

// 导出
export const adaptiveDifficulty = new AdaptiveDifficulty()
export { AdaptiveDifficulty }
