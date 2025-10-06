/**
 * 学习目标管理器
 * 提供目标设定、进度追踪和成就系统
 */
class LearningGoalManager {
    constructor() {
        this.goals = new Map();
        this.achievements = new Map();
        this.milestones = new Map();
        this.dataKey = 'learning_goals_data';
        this.achievementsKey = 'learning_achievements_data';
        
        this.goalTypes = {
            daily_time: {
                name: '每日学习时长',
                description: '设定每天的学习时间目标',
                unit: '分钟',
                icon: '⏰',
                category: 'time'
            },
            weekly_time: {
                name: '每周学习时长',
                description: '设定每周的学习时间目标',
                unit: '小时',
                icon: '📅',
                category: 'time'
            },
            monthly_time: {
                name: '每月学习时长',
                description: '设定每月的学习时间目标',
                unit: '小时',
                icon: '📆',
                category: 'time'
            },
            streak_days: {
                name: '连续学习天数',
                description: '保持连续学习的天数',
                unit: '天',
                icon: '🔥',
                category: 'consistency'
            },
            vocabulary_words: {
                name: '词汇掌握数量',
                description: '学习新单词的数量目标',
                unit: '个',
                icon: '📚',
                category: 'content'
            },
            grammar_topics: {
                name: '语法主题完成',
                description: '完成语法主题的数量',
                unit: '个',
                icon: '📝',
                category: 'content'
            },
            reading_articles: {
                name: '阅读文章数量',
                description: '完成阅读练习的文章数',
                unit: '篇',
                icon: '📖',
                category: 'content'
            },
            listening_hours: {
                name: '听力练习时长',
                description: '累计听力练习时间',
                unit: '小时',
                icon: '🎧',
                category: 'content'
            },
            accuracy_rate: {
                name: '准确率目标',
                description: '达到指定的答题准确率',
                unit: '%',
                icon: '🎯',
                category: 'performance'
            },
            exam_score: {
                name: '考试分数目标',
                description: '在模拟考试中达到目标分数',
                unit: '分',
                icon: '📊',
                category: 'performance'
            },
            skill_level: {
                name: '技能等级提升',
                description: '将某项技能提升到指定等级',
                unit: '级',
                icon: '⭐',
                category: 'skill'
            }
        };

        this.init();
    }

    /**
     * 初始化目标管理器
     */
    async init() {
        console.log('🎯 初始化学习目标管理器...');
        
        await this.loadGoals();
        await this.loadAchievements();
        this.setupEventListeners();
        this.startProgressTracking();
        
        console.log('✅ 学习目标管理器初始化完成');
    }

    /**
     * 加载目标数据
     */
    async loadGoals() {
        try {
            const saved = localStorage.getItem(this.dataKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.goals = new Map(Object.entries(data.goals || {}));
                this.milestones = new Map(Object.entries(data.milestones || {}));
            }
        } catch (error) {
            console.error('加载目标数据失败:', error);
        }
    }

    /**
     * 保存目标数据
     */
    async saveGoals() {
        try {
            const data = {
                goals: Object.fromEntries(this.goals),
                milestones: Object.fromEntries(this.milestones),
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.dataKey, JSON.stringify(data));
        } catch (error) {
            console.error('保存目标数据失败:', error);
        }
    }

    /**
     * 加载成就数据
     */
    async loadAchievements() {
        try {
            const saved = localStorage.getItem(this.achievementsKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.achievements = new Map(Object.entries(data.achievements || {}));
            }
        } catch (error) {
            console.error('加载成就数据失败:', error);
        }
    }

    /**
     * 保存成就数据
     */
    async saveAchievements() {
        try {
            const data = {
                achievements: Object.fromEntries(this.achievements),
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.achievementsKey, JSON.stringify(data));
        } catch (error) {
            console.error('保存成就数据失败:', error);
        }
    }

    /**
     * 创建新目标
     */
    async createGoal(goalData) {
        const goalId = `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const goal = {
            id: goalId,
            type: goalData.type,
            title: goalData.title || this.goalTypes[goalData.type]?.name,
            description: goalData.description || this.goalTypes[goalData.type]?.description,
            target: goalData.target,
            current: 0,
            unit: goalData.unit || this.goalTypes[goalData.type]?.unit,
            icon: goalData.icon || this.goalTypes[goalData.type]?.icon,
            category: goalData.category || this.goalTypes[goalData.type]?.category,
            priority: goalData.priority || 'medium', // low, medium, high
            deadline: goalData.deadline || null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'active', // active, completed, paused, cancelled
            progress: 0,
            milestones: goalData.milestones || [],
            rewards: goalData.rewards || [],
            metadata: goalData.metadata || {}
        };

        this.goals.set(goalId, goal);
        await this.saveGoals();

        // 创建里程碑
        if (goal.milestones.length > 0) {
            this.createMilestones(goalId, goal.milestones);
        }

        // 触发目标创建事件
        this.dispatchEvent('goalCreated', { goal });

        console.log('🎯 新目标已创建:', goal.title);
        return goal;
    }

    /**
     * 更新目标进度
     */
    async updateGoalProgress(goalId, progress, metadata = {}) {
        const goal = this.goals.get(goalId);
        if (!goal || goal.status !== 'active') {
            return false;
        }

        const oldProgress = goal.current;
        goal.current = Math.max(0, progress);
        goal.progress = Math.min(100, (goal.current / goal.target) * 100);
        goal.updatedAt = Date.now();
        
        // 添加元数据
        Object.assign(goal.metadata, metadata);

        // 检查是否完成
        if (goal.current >= goal.target && goal.status === 'active') {
            await this.completeGoal(goalId);
        } else {
            // 检查里程碑
            await this.checkMilestones(goalId, oldProgress, goal.current);
        }

        await this.saveGoals();

        // 触发进度更新事件
        this.dispatchEvent('goalProgressUpdated', { 
            goal, 
            oldProgress, 
            newProgress: goal.current 
        });

        return true;
    }

    /**
     * 增量更新目标进度
     */
    async incrementGoalProgress(goalId, increment, metadata = {}) {
        const goal = this.goals.get(goalId);
        if (!goal) return false;

        return await this.updateGoalProgress(goalId, goal.current + increment, metadata);
    }

    /**
     * 完成目标
     */
    async completeGoal(goalId) {
        const goal = this.goals.get(goalId);
        if (!goal) return false;

        goal.status = 'completed';
        goal.completedAt = Date.now();
        goal.progress = 100;

        // 发放奖励
        if (goal.rewards.length > 0) {
            await this.grantRewards(goalId, goal.rewards);
        }

        // 创建成就
        await this.createAchievement({
            type: 'goal_completed',
            goalId,
            title: `完成目标: ${goal.title}`,
            description: `成功完成学习目标"${goal.title}"`,
            icon: goal.icon,
            points: this.calculateGoalPoints(goal),
            rarity: this.calculateGoalRarity(goal)
        });

        await this.saveGoals();

        // 触发目标完成事件
        this.dispatchEvent('goalCompleted', { goal });

        console.log('🎉 目标已完成:', goal.title);
        return true;
    }

    /**
     * 暂停目标
     */
    async pauseGoal(goalId, reason = '') {
        const goal = this.goals.get(goalId);
        if (!goal) return false;

        goal.status = 'paused';
        goal.pausedAt = Date.now();
        goal.pauseReason = reason;

        await this.saveGoals();

        this.dispatchEvent('goalPaused', { goal, reason });
        return true;
    }

    /**
     * 恢复目标
     */
    async resumeGoal(goalId) {
        const goal = this.goals.get(goalId);
        if (!goal || goal.status !== 'paused') return false;

        goal.status = 'active';
        goal.resumedAt = Date.now();
        delete goal.pausedAt;
        delete goal.pauseReason;

        await this.saveGoals();

        this.dispatchEvent('goalResumed', { goal });
        return true;
    }

    /**
     * 取消目标
     */
    async cancelGoal(goalId, reason = '') {
        const goal = this.goals.get(goalId);
        if (!goal) return false;

        goal.status = 'cancelled';
        goal.cancelledAt = Date.now();
        goal.cancelReason = reason;

        await this.saveGoals();

        this.dispatchEvent('goalCancelled', { goal, reason });
        return true;
    }

    /**
     * 创建里程碑
     */
    createMilestones(goalId, milestoneData) {
        milestoneData.forEach((milestone, index) => {
            const milestoneId = `${goalId}_milestone_${index}`;
            this.milestones.set(milestoneId, {
                id: milestoneId,
                goalId,
                title: milestone.title,
                description: milestone.description,
                target: milestone.target,
                reward: milestone.reward,
                completed: false,
                completedAt: null,
                order: index
            });
        });
    }

    /**
     * 检查里程碑
     */
    async checkMilestones(goalId, oldProgress, newProgress) {
        const goalMilestones = Array.from(this.milestones.values())
            .filter(m => m.goalId === goalId && !m.completed)
            .sort((a, b) => a.order - b.order);

        for (const milestone of goalMilestones) {
            if (newProgress >= milestone.target && oldProgress < milestone.target) {
                await this.completeMilestone(milestone.id);
            }
        }
    }

    /**
     * 完成里程碑
     */
    async completeMilestone(milestoneId) {
        const milestone = this.milestones.get(milestoneId);
        if (!milestone || milestone.completed) return false;

        milestone.completed = true;
        milestone.completedAt = Date.now();

        // 发放里程碑奖励
        if (milestone.reward) {
            await this.grantReward(milestone.reward);
        }

        // 创建里程碑成就
        await this.createAchievement({
            type: 'milestone_completed',
            milestoneId,
            title: `达成里程碑: ${milestone.title}`,
            description: milestone.description,
            icon: '🏁',
            points: 50,
            rarity: 'common'
        });

        await this.saveGoals();

        this.dispatchEvent('milestoneCompleted', { milestone });

        console.log('🏁 里程碑已达成:', milestone.title);
        return true;
    }

    /**
     * 创建成就
     */
    async createAchievement(achievementData) {
        const achievementId = `achievement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const achievement = {
            id: achievementId,
            type: achievementData.type,
            title: achievementData.title,
            description: achievementData.description,
            icon: achievementData.icon || '🏆',
            points: achievementData.points || 100,
            rarity: achievementData.rarity || 'common', // common, rare, epic, legendary
            category: achievementData.category || 'general',
            unlockedAt: Date.now(),
            metadata: achievementData.metadata || {}
        };

        this.achievements.set(achievementId, achievement);
        await this.saveAchievements();

        // 触发成就解锁事件
        this.dispatchEvent('achievementUnlocked', { achievement });

        console.log('🏆 新成就解锁:', achievement.title);
        return achievement;
    }

    /**
     * 发放奖励
     */
    async grantRewards(goalId, rewards) {
        for (const reward of rewards) {
            await this.grantReward(reward);
        }
    }

    /**
     * 发放单个奖励
     */
    async grantReward(reward) {
        switch (reward.type) {
            case 'points':
                await this.addPoints(reward.amount);
                break;
            case 'badge':
                await this.grantBadge(reward.badge);
                break;
            case 'title':
                await this.grantTitle(reward.title);
                break;
            case 'unlock':
                await this.unlockFeature(reward.feature);
                break;
        }

        this.dispatchEvent('rewardGranted', { reward });
    }

    /**
     * 添加积分
     */
    async addPoints(points) {
        // 这里可以与游戏化系统集成
        if (window.gamificationManager) {
            window.gamificationManager.addExperience(points);
        }
    }

    /**
     * 计算目标积分
     */
    calculateGoalPoints(goal) {
        let basePoints = 100;
        
        // 根据目标类型调整
        const typeMultipliers = {
            daily_time: 1.0,
            weekly_time: 1.2,
            monthly_time: 1.5,
            streak_days: 2.0,
            vocabulary_words: 1.3,
            accuracy_rate: 1.8,
            exam_score: 2.5
        };
        
        basePoints *= typeMultipliers[goal.type] || 1.0;
        
        // 根据优先级调整
        const priorityMultipliers = {
            low: 0.8,
            medium: 1.0,
            high: 1.3
        };
        
        basePoints *= priorityMultipliers[goal.priority] || 1.0;
        
        // 根据完成时间调整
        if (goal.deadline) {
            const timeSpent = goal.completedAt - goal.createdAt;
            const timeAllowed = goal.deadline - goal.createdAt;
            const timeRatio = timeSpent / timeAllowed;
            
            if (timeRatio <= 0.5) {
                basePoints *= 1.5; // 提前完成奖励
            } else if (timeRatio <= 0.8) {
                basePoints *= 1.2;
            }
        }
        
        return Math.round(basePoints);
    }

    /**
     * 计算目标稀有度
     */
    calculateGoalRarity(goal) {
        const difficultyScore = this.calculateGoalDifficulty(goal);
        
        if (difficultyScore >= 80) return 'legendary';
        if (difficultyScore >= 60) return 'epic';
        if (difficultyScore >= 40) return 'rare';
        return 'common';
    }

    /**
     * 计算目标难度
     */
    calculateGoalDifficulty(goal) {
        let difficulty = 0;
        
        // 基于目标类型
        const typeDifficulty = {
            daily_time: 20,
            weekly_time: 30,
            monthly_time: 40,
            streak_days: 60,
            vocabulary_words: 35,
            accuracy_rate: 70,
            exam_score: 80
        };
        
        difficulty += typeDifficulty[goal.type] || 30;
        
        // 基于目标大小
        const targetSize = goal.target;
        if (targetSize >= 1000) difficulty += 30;
        else if (targetSize >= 500) difficulty += 20;
        else if (targetSize >= 100) difficulty += 10;
        
        // 基于时间限制
        if (goal.deadline) {
            const timeAllowed = goal.deadline - goal.createdAt;
            const days = timeAllowed / (24 * 60 * 60 * 1000);
            
            if (days <= 7) difficulty += 20;
            else if (days <= 30) difficulty += 10;
        }
        
        return Math.min(100, difficulty);
    }

    /**
     * 获取目标列表
     */
    getGoals(filter = {}) {
        let goals = Array.from(this.goals.values());
        
        // 应用过滤器
        if (filter.status) {
            goals = goals.filter(goal => goal.status === filter.status);
        }
        
        if (filter.category) {
            goals = goals.filter(goal => goal.category === filter.category);
        }
        
        if (filter.type) {
            goals = goals.filter(goal => goal.type === filter.type);
        }
        
        if (filter.priority) {
            goals = goals.filter(goal => goal.priority === filter.priority);
        }
        
        // 排序
        goals.sort((a, b) => {
            // 首先按状态排序（活跃的在前）
            if (a.status !== b.status) {
                const statusOrder = { active: 0, paused: 1, completed: 2, cancelled: 3 };
                return statusOrder[a.status] - statusOrder[b.status];
            }
            
            // 然后按优先级排序
            if (a.priority !== b.priority) {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            // 最后按创建时间排序
            return b.createdAt - a.createdAt;
        });
        
        return goals;
    }

    /**
     * 获取成就列表
     */
    getAchievements(filter = {}) {
        let achievements = Array.from(this.achievements.values());
        
        if (filter.category) {
            achievements = achievements.filter(a => a.category === filter.category);
        }
        
        if (filter.rarity) {
            achievements = achievements.filter(a => a.rarity === filter.rarity);
        }
        
        // 按解锁时间倒序排列
        achievements.sort((a, b) => b.unlockedAt - a.unlockedAt);
        
        return achievements;
    }

    /**
     * 获取统计数据
     */
    getStatistics() {
        const goals = Array.from(this.goals.values());
        const achievements = Array.from(this.achievements.values());
        
        const stats = {
            goals: {
                total: goals.length,
                active: goals.filter(g => g.status === 'active').length,
                completed: goals.filter(g => g.status === 'completed').length,
                paused: goals.filter(g => g.status === 'paused').length,
                cancelled: goals.filter(g => g.status === 'cancelled').length,
                completionRate: goals.length > 0 ? 
                    (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0
            },
            achievements: {
                total: achievements.length,
                byRarity: {
                    common: achievements.filter(a => a.rarity === 'common').length,
                    rare: achievements.filter(a => a.rarity === 'rare').length,
                    epic: achievements.filter(a => a.rarity === 'epic').length,
                    legendary: achievements.filter(a => a.rarity === 'legendary').length
                },
                totalPoints: achievements.reduce((sum, a) => sum + a.points, 0)
            },
            milestones: {
                total: this.milestones.size,
                completed: Array.from(this.milestones.values()).filter(m => m.completed).length
            }
        };
        
        return stats;
    }

    /**
     * 获取推荐目标
     */
    getRecommendedGoals() {
        // 基于用户历史数据推荐合适的目标
        const recommendations = [];
        
        // 分析用户学习模式
        const userPattern = this.analyzeUserPattern();
        
        // 基于模式推荐目标
        if (userPattern.averageSessionTime > 0) {
            if (userPattern.consistency < 0.5) {
                recommendations.push({
                    type: 'streak_days',
                    title: '建立学习习惯',
                    target: 7,
                    reason: '提高学习一致性'
                });
            }
            
            if (userPattern.averageAccuracy < 70) {
                recommendations.push({
                    type: 'accuracy_rate',
                    title: '提高答题准确率',
                    target: 80,
                    reason: '提升学习效果'
                });
            }
        }
        
        // 基于缺失的目标类型推荐
        const existingTypes = new Set(Array.from(this.goals.values()).map(g => g.type));
        
        if (!existingTypes.has('daily_time')) {
            recommendations.push({
                type: 'daily_time',
                title: '每日学习目标',
                target: 30,
                reason: '建立稳定的学习节奏'
            });
        }
        
        return recommendations;
    }

    /**
     * 分析用户学习模式
     */
    analyzeUserPattern() {
        // 从学习数据收集器获取数据
        const pattern = {
            averageSessionTime: 0,
            consistency: 0,
            averageAccuracy: 0,
            preferredTime: null,
            strongSubjects: [],
            weakSubjects: []
        };
        
        // 这里可以集成实际的数据分析
        if (window.enhancedLearningDataCollector) {
            // 获取统计数据并分析
        }
        
        return pattern;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听学习数据更新
        window.addEventListener('studySessionCompleted', (event) => {
            this.handleStudySessionCompleted(event.detail);
        });
        
        window.addEventListener('learningProgress', (event) => {
            this.handleLearningProgress(event.detail);
        });
    }

    /**
     * 处理学习会话完成
     */
    async handleStudySessionCompleted(sessionData) {
        const { module, duration, accuracy } = sessionData;
        
        // 更新相关目标
        for (const goal of this.goals.values()) {
            if (goal.status !== 'active') continue;
            
            switch (goal.type) {
                case 'daily_time':
                    if (this.isToday(goal.updatedAt)) {
                        await this.incrementGoalProgress(goal.id, duration / 60000); // 转换为分钟
                    } else {
                        await this.updateGoalProgress(goal.id, duration / 60000);
                    }
                    break;
                    
                case 'weekly_time':
                    if (this.isThisWeek(goal.updatedAt)) {
                        await this.incrementGoalProgress(goal.id, duration / 3600000); // 转换为小时
                    } else {
                        await this.updateGoalProgress(goal.id, duration / 3600000);
                    }
                    break;
                    
                case 'accuracy_rate':
                    if (goal.metadata.module === module || !goal.metadata.module) {
                        await this.updateGoalProgress(goal.id, accuracy);
                    }
                    break;
            }
        }
    }

    /**
     * 处理学习进度更新
     */
    async handleLearningProgress(progressData) {
        const { type, amount, metadata } = progressData;
        
        for (const goal of this.goals.values()) {
            if (goal.status !== 'active') continue;
            
            if (goal.type === type) {
                await this.incrementGoalProgress(goal.id, amount, metadata);
            }
        }
    }

    /**
     * 开始进度追踪
     */
    startProgressTracking() {
        // 每小时检查一次目标状态
        setInterval(() => {
            this.checkGoalDeadlines();
        }, 60 * 60 * 1000);
        
        // 每天检查连续学习目标
        setInterval(() => {
            this.checkStreakGoals();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * 检查目标截止日期
     */
    async checkGoalDeadlines() {
        const now = Date.now();
        
        for (const goal of this.goals.values()) {
            if (goal.status === 'active' && goal.deadline && now > goal.deadline) {
                // 目标过期，自动设为失败
                await this.expireGoal(goal.id);
            }
        }
    }

    /**
     * 检查连续学习目标
     */
    async checkStreakGoals() {
        // 获取当前连续学习天数
        const currentStreak = await this.getCurrentStreak();
        
        for (const goal of this.goals.values()) {
            if (goal.status === 'active' && goal.type === 'streak_days') {
                await this.updateGoalProgress(goal.id, currentStreak);
            }
        }
    }

    /**
     * 获取当前连续学习天数
     */
    async getCurrentStreak() {
        // 这里应该从学习数据中计算
        if (window.realDataStatistics) {
            const stats = await window.realDataStatistics.getRealStatistics();
            return stats.overall.currentStreak || 0;
        }
        return 0;
    }

    /**
     * 目标过期处理
     */
    async expireGoal(goalId) {
        const goal = this.goals.get(goalId);
        if (!goal) return;

        goal.status = 'expired';
        goal.expiredAt = Date.now();

        await this.saveGoals();

        this.dispatchEvent('goalExpired', { goal });
        console.log('⏰ 目标已过期:', goal.title);
    }

    /**
     * 派发事件
     */
    dispatchEvent(eventType, detail) {
        window.dispatchEvent(new CustomEvent(`goal${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`, {
            detail
        }));
    }

    // 辅助方法
    isToday(timestamp) {
        const today = new Date();
        const date = new Date(timestamp);
        return today.toDateString() === date.toDateString();
    }

    isThisWeek(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return date >= weekStart;
    }

    /**
     * 导出目标数据
     */
    exportGoalsData() {
        return {
            goals: Object.fromEntries(this.goals),
            achievements: Object.fromEntries(this.achievements),
            milestones: Object.fromEntries(this.milestones),
            statistics: this.getStatistics(),
            exportTime: new Date().toISOString()
        };
    }

    /**
     * 清理过期数据
     */
    async cleanupExpiredData(daysToKeep = 90) {
        const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        
        // 清理过期的已完成目标
        for (const [goalId, goal] of this.goals.entries()) {
            if ((goal.status === 'completed' || goal.status === 'cancelled') && 
                goal.updatedAt < cutoffDate) {
                this.goals.delete(goalId);
            }
        }
        
        await this.saveGoals();
        console.log('🧹 已清理过期的目标数据');
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.LearningGoalManager = LearningGoalManager;
    console.log('🎯 学习目标管理器已加载');
}
