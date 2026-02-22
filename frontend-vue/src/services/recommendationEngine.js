/**
 * 个性化学习路径推荐引擎
 * 基于用户学习数据和 AI 算法生成个性化学习建议
 */

import { aiApi } from '@/api/ai'

// 用户画像数据结构
export interface UserProfile {
  userId: number
  level: string // 'beginner', 'intermediate', 'advanced'
  strongPoints: string[] // 强项
  weakPoints: string[] // 弱项
  learningStyle: string // 'visual', 'auditory', 'kinesthetic', 'mixed'
  studyTimePreference: string // 'morning', 'afternoon', 'evening', 'night'
  goalType: string // 'exam', 'communication', 'business', 'academic'
  motivationLevel: number // 1-5
}

// 学习数据统计
export interface LearningStatistics {
  totalStudyTime: number // 总学习时长（分钟）
  studyDays: number // 学习天数
  averageAccuracy: number // 平均正确率
  completionRate: number // 完成率
  sessionCount: number // 学习次数
  lastStudyDate: Date // 最后学习日期
  streakDays: number // 连续学习天数
}

// 模块学习数据
export interface ModuleData {
  moduleId: string
  moduleName: string
  accuracy: number // 正确率
  timeSpent: number // 学习时长
  completionRate: number // 完成度
  difficulty: string // 当前难度
  lastPracticeDate: Date
}

// 推荐的学习路径
export interface LearningPath {
  pathId: string
  title: string
  description: string
  estimatedDuration: number // 预计时长（分钟）
  difficulty: string
  modules: PathModule[]
  priority: 'high' | 'medium' | 'low'
  reason: string // 推荐理由
  expectedOutcome: string // 预期效果
}

export interface PathModule {
  moduleId: string
  moduleName: string
  duration: number
  tasks: PathTask[]
}

export interface PathTask {
  taskId: string
  taskName: string
  type: 'study' | 'practice' | 'review' | 'test'
  quantity: number
  estimatedTime: number
}

class RecommendationEngine {
  /**
   * 生成个性化学习路径
   */
  async generateLearningPath(userProfile: UserProfile): Promise<LearningPath[]> {
    // 1. 获取用户学习统计数据
    const stats = await this.getUserStatistics(userProfile.userId)

    // 2. 获取各模块学习数据
    const moduleData = await this.getModuleData(userProfile.userId)

    // 3. 分析用户学习数据
    const analysis = this.analyzeLearningData(userProfile, stats, moduleData)

    // 4. 生成推荐路径
    const paths = await this.createRecommendationPaths(userProfile, analysis)

    return paths
  }

  /**
   * 获取用户学习统计
   */
  private async getUserStatistics(userId: number): Promise<LearningStatistics> {
    // 这里应该调用后端 API 获取真实数据
    // 暂时返回模拟数据
    return {
      totalStudyTime: 1250, // 分钟
      studyDays: 15,
      averageAccuracy: 0.72,
      completionRate: 0.65,
      sessionCount: 28,
      lastStudyDate: new Date(),
      streakDays: 5
    }
  }

  /**
   * 获取模块学习数据
   */
  private async getModuleData(userId: number): Promise<ModuleData[]> {
    // 暂时返回模拟数据
    return [
      {
        moduleId: 'vocabulary',
        moduleName: '词汇学习',
        accuracy: 0.85,
        timeSpent: 450,
        completionRate: 0.70,
        difficulty: 'intermediate',
        lastPracticeDate: new Date(Date.now() - 86400000)
      },
      {
        moduleId: 'listening',
        moduleName: '听力训练',
        accuracy: 0.65,
        timeSpent: 300,
        completionRate: 0.50,
        difficulty: 'intermediate',
        lastPracticeDate: new Date(Date.now() - 172800000)
      },
      {
        moduleId: 'grammar',
        moduleName: '语法练习',
        accuracy: 0.78,
        timeSpent: 380,
        completionRate: 0.75,
        difficulty: 'intermediate',
        lastPracticeDate: new Date(Date.now() - 259200000)
      },
      {
        moduleId: 'reading',
        moduleName: '阅读理解',
        accuracy: 0.70,
        timeSpent: 120,
        completionRate: 0.40,
        difficulty: 'beginner',
        lastPracticeDate: new Date(Date.now() - 432000000)
      }
    ]
  }

  /**
   * 分析学习数据
   */
  private analyzeLearningData(
    profile: UserProfile,
    stats: LearningStatistics,
    moduleData: ModuleData[]
  ) {
    // 识别薄弱模块（正确率低于 70% 或完成度低于 50%）
    const weakModules = moduleData.filter(
      m => m.accuracy < 0.7 || m.completionRate < 0.5
    )

    // 识别优势模块（正确率高于 85% 且完成度高于 70%）
    const strongModules = moduleData.filter(
      m => m.accuracy > 0.85 && m.completionRate > 0.7
    )

    // 计算学习效率（正确率/学习时长）
    const efficiency = moduleData.map(m => ({
      module: m.moduleId,
      efficiency: m.accuracy / (m.timeSpent / 60) // 每小时的正确率
    }))

    // 识别需要复习的模块（超过 3 天未练习）
    const needsReview = moduleData.filter(
      m => (Date.now() - m.lastPracticeDate.getTime()) > 3 * 24 * 60 * 60 * 1000
    )

    return {
      weakModules,
      strongModules,
      efficiency,
      needsReview,
      overallProgress: stats.completionRate,
      learningVelocity: stats.averageAccuracy
    }
  }

  /**
   * 创建推荐路径
   */
  private async createRecommendationPaths(profile: UserProfile, analysis: any): Promise<LearningPath[]> {
    const paths: LearningPath[] = []

    // 路径 1: 针对薄弱模块的强化训练
    if (analysis.weakModules.length > 0) {
      paths.push({
        pathId: 'weakness-improvement',
        title: '薄弱项强化训练',
        description: `重点提升你的薄弱项：${analysis.weakModules.map(m => m.moduleName).join('、')}`,
        estimatedDuration: 45,
        difficulty: profile.level,
        priority: 'high',
        reason: '根据你的学习数据，这些模块需要重点加强',
        expectedOutcome: '提升薄弱项的正确率和完成度',
        modules: this.createWeaknessModules(analysis.weakModules)
      })
    }

    // 路径 2: 巩固优势模块
    if (analysis.strongModules.length > 0) {
      paths.push({
        pathId: 'strength-consolidation',
        title: '优势巩固提升',
        description: `在保持优势的同时，挑战更高难度：${analysis.strongModules.map(m => m.moduleName).join('、')}`,
        estimatedDuration: 30,
        difficulty: this.getNextLevel(profile.level),
        priority: 'medium',
        reason: '巩固你的优势，向更高难度挑战',
        expectedOutcome: '提高优势模块的熟练度和应用能力',
        modules: this.createStrengthModules(analysis.strongModules)
      })
    }

    // 路径 3: 复习遗忘内容
    if (analysis.needsReview.length > 0) {
      paths.push({
        pathId: 'review-path',
        title: '复习巩固计划',
        description: `复习已学内容：${analysis.needsReview.map(m => m.moduleName).join('、')}`,
        estimatedDuration: 25,
        difficulty: profile.level,
        priority: 'medium',
        reason: '这些内容已超过 3 天未练习，建议复习巩固',
        expectedOutcome: '保持学习记忆，提高长期保留率',
        modules: this.createReviewModules(analysis.needsReview)
      })
    }

    // 路径 4: 基于目标的定制路径
    const goalBasedPath = this.createGoalBasedPath(profile)
    if (goalBasedPath) {
      paths.push(goalBasedPath)
    }

    // 使用 AI 优化路径描述和推荐理由
    const optimizedPaths = await this.optimizePathsWithAI(profile, paths)

    return optimizedPaths
  }

  /**
   * 创建薄弱模块训练
   */
  private createWeaknessModules(weakModules: ModuleData[]): PathModule[] {
    return weakModules.map(module => ({
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      duration: 20,
      tasks: [
        {
          taskId: `${module.moduleId}-study`,
          taskName: '基础学习',
          type: 'study',
          quantity: 10,
          estimatedTime: 8
        },
        {
          taskId: `${module.moduleId}-practice`,
          taskName: '针对性练习',
          type: 'practice',
          quantity: 15,
          estimatedTime: 12
        }
      ]
    }))
  }

  /**
   * 创建优势巩固模块
   */
  private createStrengthModules(strongModules: ModuleData[]): PathModule[] {
    return strongModules.map(module => ({
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      duration: 15,
      tasks: [
        {
          taskId: `${module.moduleId}-advanced`,
          taskName: '高级练习',
          type: 'practice',
          quantity: 10,
          estimatedTime: 10
        },
        {
          taskId: `${module.moduleId}-challenge`,
          taskName: '挑战任务',
          type: 'test',
          quantity: 5,
          estimatedTime: 5
        }
      ]
    }))
  }

  /**
   * 创建复习模块
   */
  private createReviewModules(modules: ModuleData[]): PathModule[] {
    return modules.map(module => ({
      moduleId: module.moduleId,
      moduleName: module.moduleName,
      duration: 12,
      tasks: [
        {
          taskId: `${module.moduleId}-review`,
          taskName: '快速复习',
          type: 'review',
          quantity: 15,
          estimatedTime: 8
        },
        {
          taskId: `${module.moduleId}-test`,
          taskName: '复习测试',
          type: 'test',
          quantity: 5,
          estimatedTime: 4
        }
      ]
    }))
  }

  /**
   * 创建基于目标的路径
   */
  private createGoalBasedPath(profile: UserProfile): LearningPath | null {
    const goalPaths = {
      exam: {
        pathId: 'exam-prep',
        title: '考试冲刺计划',
        description: '针对考试的专项训练',
        estimatedDuration: 60,
        difficulty: profile.level,
        priority: 'high',
        reason: '根据你的考试目标制定的强化训练',
        expectedOutcome: '提高考试成绩',
        modules: [
          {
            moduleId: 'vocabulary',
            moduleName: '高频词汇',
            duration: 20,
            tasks: [
              { taskId: 'vocab-exam', taskName: '考试词汇', type: 'study', quantity: 50, estimatedTime: 20 }
            ]
          },
          {
            moduleId: 'reading',
            moduleName: '阅读理解',
            duration: 20,
            tasks: [
              { taskId: 'reading-exam', taskName: '阅读练习', type: 'practice', quantity: 10, estimatedTime: 20 }
            ]
          },
          {
            moduleId: 'listening',
            moduleName: '听力理解',
            duration: 20,
            tasks: [
              { taskId: 'listening-exam', taskName: '听力练习', type: 'practice', quantity: 10, estimatedTime: 20 }
            ]
          }
        ]
      },
      communication: {
        pathId: 'communication-skills',
        title: '口语表达提升',
        description: '提高实际交流能力',
        estimatedDuration: 45,
        difficulty: profile.level,
        priority: 'medium',
        reason: '增强口语交流能力',
        expectedOutcome: '提高口语流利度和准确度',
        modules: [
          {
            moduleId: 'speaking',
            moduleName: '口语练习',
            duration: 25,
            tasks: [
              { taskId: 'speaking-practice', taskName: '对话练习', type: 'practice', quantity: 8, estimatedTime: 15 },
              { taskId: 'pronunciation', taskName: '发音训练', type: 'study', quantity: 5, estimatedTime: 10 }
            ]
          },
          {
            moduleId: 'listening',
            moduleName: '听力理解',
            duration: 20,
            tasks: [
              { taskId: 'listening-daily', taskName: '日常对话', type: 'practice', quantity: 5, estimatedTime: 20 }
            ]
          }
        ]
      }
    }

    return goalPaths[profile.goalType] || null
  }

  /**
   * 获取下一个难度等级
   */
  private getNextLevel(currentLevel: string): string {
    const levels = ['beginner', 'intermediate', 'advanced']
    const currentIndex = levels.indexOf(currentLevel)
    return levels[Math.min(currentIndex + 1, levels.length - 1)]
  }

  /**
   * 使用 AI 优化路径描述
   */
  private async optimizePathsWithAI(profile: UserProfile, paths: LearningPath[]): Promise<LearningPath[]> {
    try {
      // 构建提示词
      const prompt = this.buildOptimizationPrompt(profile, paths)

      // 调用 AI API
      const response = await aiApi.chat({
        message: prompt,
        context: {
          type: 'learning_path_optimization',
          userProfile: profile
        }
      })

      if (response.code === 200 && response.data.answer) {
        // 解析 AI 返回的优化建议
        const optimization = JSON.parse(response.data.answer)

        // 应用优化
        return paths.map((path, index) => ({
          ...path,
          description: optimization.descriptions?.[index] || path.description,
          reason: optimization.reasons?.[index] || path.reason
        }))
      }
    } catch (error) {
      console.error('AI optimization failed:', error)
    }

    return paths
  }

  /**
   * 构建优化提示词
   */
  private buildOptimizationPrompt(profile: UserProfile, paths: LearningPath[]): string {
    return `你是一个专业的英语学习顾问。请根据以下用户信息，优化学习路径的描述和推荐理由，使其更具个性化和说服力。

用户信息：
- 当前水平：${profile.level}
- 强项：${profile.strongPoints.join('、')}
- 弱项：${profile.weakPoints.join('、')}
- 学习风格：${profile.learningStyle}
- 学习目标：${profile.goalType}
- 动力水平：${profile.motivationLevel}/5

学习路径：
${paths.map((p, i) => `
路径 ${i + 1}：${p.title}
当前描述：${p.description}
当前理由：${p.reason}
`).join('\n')}

请返回 JSON 格式的优化建议：
{
  "descriptions": ["优化后的描述1", "优化后的描述2", ...],
  "reasons": ["优化后的理由1", "优化后的理由2", ...]
}

要求：
1. 描述要更具吸引力和个性化
2. 理由要具体，说明为什么这个路径适合该用户
3. 使用鼓励性和激励性的语言
4. 考虑用户的学习风格和目标`
  }
}

// 导出单例
export const recommendationEngine = new RecommendationEngine()

// 导出类型
export type { UserProfile, LearningStatistics, ModuleData, LearningPath, PathModule, PathTask }
