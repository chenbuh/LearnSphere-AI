/**
 * 真实数据统计管理器
 * 确保所有统计数据都基于真实的学习活动
 */

class RealDataStatistics {
    constructor() {
        this.dataKeys = {
            studySessions: 'study_sessions',
            learningActivities: 'learning_activities',
            vocabularyProgress: 'vocabulary_progress',
            grammarProgress: 'grammar_progress',
            listeningProgress: 'listening_progress',
            readingProgress: 'reading_progress',
            progressData: 'progress_data'
        };
        
        // ID计数器
        this.sessionCounter = 0;
        this.activityCounter = 0;
        
        this.init();
    }

    async init() {
        window.logger?.info('初始化真实数据统计管理器...');
        
        // 确保数据结构存在
        await this.ensureDataStructure();
        
        window.logger?.info('真实数据统计管理器初始化完成');
    }

    /**
     * 确保数据结构存在
     */
    async ensureDataStructure() {
        // 确保学习会话数据结构
        const sessions = await this.getStudySessions();
        if (!Array.isArray(sessions)) {
            await this.saveStudySessions([]);
        }

        // 确保学习活动数据结构
        const activities = await this.getLearningActivities();
        if (!Array.isArray(activities)) {
            await this.saveLearningActivities([]);
        }
    }

    /**
     * 获取学习会话数据
     */
    async getStudySessions() {
        try {
            const sessions = localStorage.getItem(this.dataKeys.studySessions);
            return sessions ? JSON.parse(sessions) : [];
        } catch (error) {
            window.logger?.error('获取学习会话数据失败:', error);
            return [];
        }
    }

    /**
     * 保存学习会话数据
     */
    async saveStudySessions(sessions) {
        try {
            localStorage.setItem(this.dataKeys.studySessions, JSON.stringify(sessions));
            return true;
        } catch (error) {
            console.error('保存学习会话数据失败:', error);
            return false;
        }
    }

    /**
     * 获取学习活动数据
     */
    async getLearningActivities() {
        try {
            const activities = localStorage.getItem(this.dataKeys.learningActivities);
            return activities ? JSON.parse(activities) : [];
        } catch (error) {
            console.error('获取学习活动数据失败:', error);
            return [];
        }
    }

    /**
     * 保存学习活动数据
     */
    async saveLearningActivities(activities) {
        try {
            localStorage.setItem(this.dataKeys.learningActivities, JSON.stringify(activities));
            return true;
        } catch (error) {
            console.error('保存学习活动数据失败:', error);
            return false;
        }
    }

    /**
     * 记录学习会话
     */
    async recordStudySession(sessionData) {
        try {
            const sessions = await this.getStudySessions();

            const session = {
                id: `session_${Date.now()}_${this.getNextSessionId()}`,
                startTime: sessionData.startTime || Date.now(),
                endTime: sessionData.endTime || Date.now(),
                duration: sessionData.duration || 0,
                module: sessionData.module || 'unknown',
                accuracy: sessionData.accuracy || 0,
                score: sessionData.score || 0,
                wordsStudied: sessionData.wordsStudied || 0,
                questionsAnswered: sessionData.questionsAnswered || 0,
                correctAnswers: sessionData.correctAnswers || 0,
                timestamp: Date.now()
            };

            sessions.push(session);
            await this.saveStudySessions(sessions);

            // 同时记录到统一统计管理器
            if (window.unifiedStatisticsManager) {
                try {
                    await window.unifiedStatisticsManager.recordSession(session);
                } catch (error) {
                    console.warn('记录到统一统计管理器失败:', error);
                }
            }

            console.log('✅ 学习会话已记录:', session.id);
            return session;
        } catch (error) {
            console.error('记录学习会话失败:', error);
            return null;
        }
    }

    /**
     * 记录学习活动
     */
    async recordLearningActivity(activityData) {
        try {
            const activities = await this.getLearningActivities();
            
            const activity = {
                id: `activity_${Date.now()}_${this.getNextActivityId()}`,
                type: activityData.type || 'unknown',
                module: activityData.module || 'unknown',
                content: activityData.content || '',
                result: activityData.result || {},
                duration: activityData.duration || 0,
                timestamp: Date.now(),
                ...activityData
            };

            activities.push(activity);
            await this.saveLearningActivities(activities);
            
            console.log('✅ 学习活动已记录:', activity.id);
            return activity;
        } catch (error) {
            console.error('记录学习活动失败:', error);
            return null;
        }
    }

    /**
     * 获取下一个会话ID
     */
    getNextSessionId() {
        this.sessionCounter++;
        return this.sessionCounter.toString(36);
    }

    /**
     * 获取下一个活动ID
     */
    getNextActivityId() {
        this.activityCounter++;
        return this.activityCounter.toString(36);
    }

    /**
     * 获取真实统计数据
     */
    async getRealStatistics() {
        const sessions = await this.getStudySessions();
        const activities = await this.getLearningActivities();
        
        // 计算总学习时间
        const totalStudyTime = sessions.reduce((sum, session) => {
            return sum + (session.duration || 0);
        }, 0);

        // 计算平均准确率
        const accuracySessions = sessions.filter(s => s.accuracy !== undefined && s.accuracy > 0);
        const averageAccuracy = accuracySessions.length > 0
            ? accuracySessions.reduce((sum, s) => sum + s.accuracy, 0) / accuracySessions.length
            : 0;

        // 计算学习天数
        const studyDates = new Set();
        sessions.forEach(session => {
            if (session.startTime) {
                const date = new Date(session.startTime);
                studyDates.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
            }
        });

        // 计算连续学习天数
        const currentStreak = this.calculateCurrentStreak(sessions);

        // 按模块统计
        const moduleStats = this.calculateModuleStatistics(sessions, activities);

        // 计算经验值
        const totalXP = sessions.reduce((sum, session) => {
            return sum + (session.score || 0) + (session.correctAnswers || 0) * 10;
        }, 0);

        return {
            overall: {
                totalStudyTime: Math.round(totalStudyTime),
                studyDays: studyDates.size,
                currentStreak: currentStreak,
                averageAccuracy: Math.round(averageAccuracy),
                totalSessions: sessions.length,
                totalActivities: activities.length,
                xp: totalXP,
                level: this.calculateLevel(totalXP)
            },
            modules: moduleStats,
            sessions: sessions.slice(-10), // 最近10次会话
            activities: activities.slice(-20) // 最近20个活动
        };
    }

    /**
     * 计算当前连续学习天数
     */
    calculateCurrentStreak(sessions) {
        if (sessions.length === 0) return 0;

        // 按日期分组
        const dateGroups = new Map();
        sessions.forEach(session => {
            if (session.startTime) {
                const date = new Date(session.startTime);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                if (!dateGroups.has(dateKey)) {
                    dateGroups.set(dateKey, []);
                }
                dateGroups.get(dateKey).push(session);
            }
        });

        // 获取所有学习日期并排序
        const studyDates = Array.from(dateGroups.keys()).sort();
        if (studyDates.length === 0) return 0;

        // 从最近的日期开始计算连续天数
        let streak = 1;
        const today = new Date();
        const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        
        // 检查今天是否学习了
        let currentDate = studyDates[studyDates.length - 1];
        if (currentDate !== todayKey) {
            // 如果今天没学习，检查是否是昨天
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;
            
            if (currentDate !== yesterdayKey) {
                return 0; // 连续性已断
            }
        }

        // 向前计算连续天数
        for (let i = studyDates.length - 2; i >= 0; i--) {
            const prevDate = new Date(studyDates[i + 1].split('-').map(Number));
            const currDate = new Date(studyDates[i].split('-').map(Number));
            
            const dayDiff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * 按模块计算统计数据
     */
    calculateModuleStatistics(sessions, activities) {
        const modules = {};
        
        // 处理会话数据
        sessions.forEach(session => {
            const module = session.module || 'unknown';
            if (!modules[module]) {
                modules[module] = {
                    sessions: 0,
                    totalTime: 0,
                    totalAccuracy: 0,
                    accuracyCount: 0,
                    wordsStudied: 0,
                    questionsAnswered: 0,
                    correctAnswers: 0
                };
            }
            
            const stats = modules[module];
            stats.sessions++;
            stats.totalTime += session.duration || 0;
            stats.wordsStudied += session.wordsStudied || 0;
            stats.questionsAnswered += session.questionsAnswered || 0;
            stats.correctAnswers += session.correctAnswers || 0;
            
            if (session.accuracy !== undefined && session.accuracy > 0) {
                stats.totalAccuracy += session.accuracy;
                stats.accuracyCount++;
            }
        });

        // 处理活动数据
        activities.forEach(activity => {
            const module = activity.module || 'unknown';
            if (!modules[module]) {
                modules[module] = {
                    sessions: 0,
                    totalTime: 0,
                    totalAccuracy: 0,
                    accuracyCount: 0,
                    wordsStudied: 0,
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    activities: 0
                };
            }
            
            modules[module].activities = (modules[module].activities || 0) + 1;
        });

        // 计算平均值
        Object.keys(modules).forEach(module => {
            const stats = modules[module];
            stats.averageAccuracy = stats.accuracyCount > 0 
                ? Math.round(stats.totalAccuracy / stats.accuracyCount)
                : 0;
            stats.averageTime = stats.sessions > 0 
                ? Math.round(stats.totalTime / stats.sessions)
                : 0;
        });

        return modules;
    }

    /**
     * 计算等级
     */
    calculateLevel(xp) {
        if (xp >= 10000) return 'expert';
        if (xp >= 5000) return 'advanced';
        if (xp >= 2000) return 'intermediate';
        if (xp >= 500) return 'elementary';
        return 'beginner';
    }

    /**
     * 获取学习热力图数据
     */
    async getHeatmapData() {
        const sessions = await this.getStudySessions();
        const activities = await this.getLearningActivities();
        
        // 创建日期到活动数量的映射
        const activityMap = new Map();
        
        // 处理会话数据
        sessions.forEach(session => {
            if (session.startTime) {
                const date = new Date(session.startTime);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
            }
        });
        
        // 处理活动数据
        activities.forEach(activity => {
            if (activity.timestamp) {
                const date = new Date(activity.timestamp);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
            }
        });

        return activityMap;
    }

    /**
     * 清理旧数据
     */
    async cleanupOldData(daysToKeep = 365) {
        try {
            const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
            
            // 清理旧会话
            const sessions = await this.getStudySessions();
            const filteredSessions = sessions.filter(session => 
                (session.startTime || session.timestamp || 0) > cutoffDate
            );
            
            // 清理旧活动
            const activities = await this.getLearningActivities();
            const filteredActivities = activities.filter(activity => 
                (activity.timestamp || 0) > cutoffDate
            );
            
            await this.saveStudySessions(filteredSessions);
            await this.saveLearningActivities(filteredActivities);
            
            console.log(`✅ 已清理 ${sessions.length - filteredSessions.length} 个旧会话和 ${activities.length - filteredActivities.length} 个旧活动`);
        } catch (error) {
            console.error('清理旧数据失败:', error);
        }
    }

    /**
     * 导出统计数据
     */
    async exportStatistics() {
        const statistics = await this.getRealStatistics();
        const heatmapData = await this.getHeatmapData();
        
        return {
            statistics,
            heatmapData,
            exportTime: new Date().toISOString(),
            version: '1.0'
        };
    }
}

// 创建全局实例
window.RealDataStatistics = RealDataStatistics;

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealDataStatistics;
}

console.log('📊 真实数据统计管理器已加载');
