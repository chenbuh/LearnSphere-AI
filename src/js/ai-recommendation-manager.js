/**
 * AI推荐系统管理器
 * 提供基于用户学习数据的智能推荐服务
 */
class AIRecommendationManager {
    constructor() {
        this.recommendations = [];
        this.userProfile = null;
        this.learningPatterns = {};
        
        // 性能优化：缓存系统
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10分钟缓存
        this.maxCacheSize = 50;
        
        // 性能优化：防抖处理
        this.debouncedAnalyze = Utils.debounce(this.analyzeLearningPatterns.bind(this), 2000);
        this.debouncedSave = Utils.debounce(this.saveUserProfile.bind(this), 1000);
        
        // 批处理设置
        this.batchSize = 20;
        this.pendingUpdates = new Set();
        
        this.init();
    }

    init() {
        window.logger?.info('初始化AI推荐系统...');
        
        // 使用requestIdleCallback优化初始化性能
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                this.performInitialization();
            });
        } else {
            setTimeout(() => {
                this.performInitialization();
            }, 100);
        }
    }

    /**
     * 执行初始化任务
     */
    performInitialization() {
        this.loadUserProfile();
        this.analyzeLearningPatterns();
        this.generateRecommendations();
        this.generateWeaknessAnalysis();
    }

    /**
     * 加载用户档案
     */
    loadUserProfile() {
        try {
            const profile = localStorage.getItem('ai_user_profile');
            this.userProfile = profile ? JSON.parse(profile) : {
                level: 'intermediate',
                preferences: {
                    learningStyle: 'visual', // visual, auditory, kinesthetic
                    studyTime: 'morning', // morning, afternoon, evening, night
                    difficulty: 'medium', // easy, medium, hard
                    focus: ['vocabulary', 'grammar'] // 学习重点
                },
                weaknesses: [],
                strengths: [],
                goals: {
                    examType: 'ielts',
                    targetScore: 7.0,
                    timeframe: 90 // 天数
                },
                lastUpdated: Date.now()
            };
            window.logger?.info('用户档案已加载:', this.userProfile.level);
        } catch (error) {
            window.logger?.error('加载用户档案失败:', error);
            this.userProfile = this.getDefaultProfile();
        }
    }

    /**
     * 获取默认用户档案
     */
    getDefaultProfile() {
        return {
            level: 'intermediate',
            preferences: {
                learningStyle: 'visual',
                studyTime: 'morning',
                difficulty: 'medium',
                focus: ['vocabulary', 'grammar']
            },
            weaknesses: [],
            strengths: [],
            goals: {
                examType: 'ielts',
                targetScore: 7.0,
                timeframe: 90
            },
            lastUpdated: Date.now()
        };
    }

    /**
     * 分析学习模式
     */
    analyzeLearningPatterns() {
        // 获取各模块的学习数据
        const vocabStats = this.getModuleStats('vocabulary');
        const grammarStats = this.getModuleStats('grammar');
        const listeningStats = this.getModuleStats('listening');
        const readingStats = this.getModuleStats('reading');
        const writingStats = this.getModuleStats('writing');

        // 分析学习模式
        this.learningPatterns = {
            preferredTime: this.analyzeStudyTime(),
            strongestSkill: this.findStrongestSkill({ vocabStats, grammarStats, listeningStats, readingStats, writingStats }),
            weakestSkill: this.findWeakestSkill({ vocabStats, grammarStats, listeningStats, readingStats, writingStats }),
            learningFrequency: this.analyzeLearningFrequency(),
            averageSessionLength: this.analyzeSessionLength(),
            improvementRate: this.analyzeImprovementRate(),
            consistencyScore: this.analyzeConsistency()
        };

        console.log('📊 学习模式分析完成:', this.learningPatterns);
    }

    /**
     * 获取模块统计数据
     */
    getModuleStats(module) {
        try {
            switch (module) {
                case 'vocabulary':
                    return window.vocabularyManager?.getStats() || { accuracy: 0, totalStudied: 0, streakDays: 0 };
                case 'grammar':
                    return window.grammarManager?.getStats() || { overall: { accuracy: 0, totalQuestions: 0, streakDays: 0 } };
                case 'listening':
                    return window.listeningManager?.getStats() || { overall: { accuracy: 0, totalQuestions: 0, streakDays: 0 } };
                case 'reading':
                    return window.readingManager?.getStats() || { accuracy: 0, totalArticles: 0, averageTime: 0 };
                case 'writing':
                    return window.writingManager?.getStats() || { averageScore: 0, totalWritings: 0, totalTime: 0 };
                default:
                    return {};
            }
        } catch (error) {
            console.warn(`⚠️ 获取${module}统计失败:`, error);
            return {};
        }
    }

    /**
     * 分析学习时间偏好
     */
    analyzeStudyTime() {
        const studyTimes = JSON.parse(localStorage.getItem('study_times') || '[]');
        if (studyTimes.length === 0) return this.userProfile.preferences.studyTime;

        const timeStats = {};
        studyTimes.forEach(timestamp => {
            const hour = new Date(timestamp).getHours();
            let period;
            if (hour >= 6 && hour < 12) period = 'morning';
            else if (hour >= 12 && hour < 18) period = 'afternoon';
            else if (hour >= 18 && hour < 22) period = 'evening';
            else period = 'night';

            timeStats[period] = (timeStats[period] || 0) + 1;
        });

        return Object.keys(timeStats).reduce((a, b) => timeStats[a] > timeStats[b] ? a : b) || 'morning';
    }

    /**
     * 找出最强技能
     */
    findStrongestSkill(stats) {
        const skillScores = {
            vocabulary: this.calculateSkillScore(stats.vocabStats, 'vocabulary'),
            grammar: this.calculateSkillScore(stats.grammarStats, 'grammar'),
            listening: this.calculateSkillScore(stats.listeningStats, 'listening'),
            reading: this.calculateSkillScore(stats.readingStats, 'reading'),
            writing: this.calculateSkillScore(stats.writingStats, 'writing')
        };

        return Object.keys(skillScores).reduce((a, b) => skillScores[a] > skillScores[b] ? a : b) || 'vocabulary';
    }

    /**
     * 找出最弱技能
     */
    findWeakestSkill(stats) {
        const skillScores = {
            vocabulary: this.calculateSkillScore(stats.vocabStats, 'vocabulary'),
            grammar: this.calculateSkillScore(stats.grammarStats, 'grammar'),
            listening: this.calculateSkillScore(stats.listeningStats, 'listening'),
            reading: this.calculateSkillScore(stats.readingStats, 'reading'),
            writing: this.calculateSkillScore(stats.writingStats, 'writing')
        };

        // 过滤掉得分为0的技能（表示没有数据）
        const validSkills = Object.keys(skillScores).filter(skill => skillScores[skill] > 0);
        if (validSkills.length === 0) return 'vocabulary';

        return validSkills.reduce((a, b) => skillScores[a] < skillScores[b] ? a : b);
    }

    /**
     * 计算技能得分
     */
    calculateSkillScore(stats, skill) {
        if (!stats || Object.keys(stats).length === 0) return 0;

        switch (skill) {
            case 'vocabulary':
                return (stats.accuracy || 0) * 0.6 + Math.min(stats.totalStudied / 100, 1) * 0.4;
            case 'grammar':
                const grammarAccuracy = stats.overall?.accuracy || 0;
                const grammarTotal = stats.overall?.totalQuestions || 0;
                return grammarAccuracy * 0.6 + Math.min(grammarTotal / 50, 1) * 0.4;
            case 'listening':
                const listeningAccuracy = stats.overall?.accuracy || 0;
                const listeningTotal = stats.overall?.totalQuestions || 0;
                return listeningAccuracy * 0.6 + Math.min(listeningTotal / 30, 1) * 0.4;
            case 'reading':
                return (stats.accuracy || 0) * 0.6 + Math.min(stats.totalArticles / 20, 1) * 0.4;
            case 'writing':
                const avgScore = stats.averageScore || 0;
                const totalWritings = stats.totalWritings || 0;
                return (avgScore / 100) * 0.6 + Math.min(totalWritings / 10, 1) * 0.4;
            default:
                return 0;
        }
    }

    /**
     * 分析学习频率
     */
    analyzeLearningFrequency() {
        const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
        if (studySessions.length === 0) return 0;

        const now = Date.now();
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const recentSessions = studySessions.filter(session => session.timestamp > weekAgo);
        
        return recentSessions.length / 7; // 每天平均学习次数
    }

    /**
     * 分析会话长度
     */
    analyzeSessionLength() {
        const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
        if (studySessions.length === 0) return 0;

        const totalDuration = studySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        return totalDuration / studySessions.length / 60000; // 平均分钟数
    }

    /**
     * 分析进步速度
     */
    analyzeImprovementRate() {
        // 简化的进步分析，可以根据实际需要优化
        const recentScores = JSON.parse(localStorage.getItem('recent_scores') || '[]');
        if (recentScores.length < 3) return 0;

        const recent = recentScores.slice(-5);
        const older = recentScores.slice(-10, -5);
        
        const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
        const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length || recentAvg;
        
        return (recentAvg - olderAvg) / olderAvg;
    }

    /**
     * 分析学习一致性
     */
    analyzeConsistency() {
        const studyTimes = JSON.parse(localStorage.getItem('study_times') || '[]');
        if (studyTimes.length < 7) return 0;

        // 计算过去30天的学习天数
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const recentStudyDays = new Set();

        studyTimes.forEach(timestamp => {
            if (timestamp > thirtyDaysAgo) {
                const day = new Date(timestamp).toDateString();
                recentStudyDays.add(day);
            }
        });

        return recentStudyDays.size / 30; // 30天内学习天数比例
    }

    /**
     * 生成推荐
     */
    generateRecommendations() {
        this.recommendations = [];

        // 基于最弱技能的推荐
        this.addWeaknessRecommendations();

        // 基于学习模式的推荐
        this.addPatternRecommendations();

        // 基于目标的推荐
        this.addGoalRecommendations();

        // 基于一致性的推荐
        this.addConsistencyRecommendations();

        // 高级推荐
        this.addAdvancedRecommendations();

        console.log('🎯 AI推荐生成完成:', this.recommendations);
    }

    /**
     * 添加弱项推荐
     */
    addWeaknessRecommendations() {
        const weakestSkill = this.learningPatterns.weakestSkill;
        const skillNames = {
            vocabulary: '词汇',
            grammar: '语法',
            listening: '听力',
            reading: '阅读理解',
            writing: '写作练习'
        };

        this.recommendations.push({
            type: 'weakness',
            priority: 'high',
            title: `加强${skillNames[weakestSkill]}练习`,
            description: `根据您的学习数据分析，${skillNames[weakestSkill]}是您目前需要重点改进的技能。`,
            action: {
                type: 'navigate',
                target: weakestSkill,
                label: `开始${skillNames[weakestSkill]}练习`
            },
            icon: this.getSkillIcon(weakestSkill)
        });
    }

    /**
     * 添加学习模式推荐
     */
    addPatternRecommendations() {
        const frequency = this.learningPatterns.learningFrequency;
        const sessionLength = this.learningPatterns.averageSessionLength;

        if (frequency < 0.5) {
            this.recommendations.push({
                type: 'frequency',
                priority: 'high',
                title: '增加学习频率',
                description: '您最近的学习频率较低，建议每天至少学习一次以保持学习效果。',
                action: {
                    type: 'reminder',
                    target: 'daily',
                    label: '设置学习提醒'
                },
                icon: '⏰'
            });
        }

        if (sessionLength < 10) {
            this.recommendations.push({
                type: 'duration',
                priority: 'medium',
                title: '适当延长学习时间',
                description: '您的平均学习时长较短，适当延长能够获得更好的学习效果。',
                action: {
                    type: 'tip',
                    target: 'duration',
                    label: '查看学习建议'
                },
                icon: '📈'
            });
        } else if (sessionLength > 60) {
            this.recommendations.push({
                type: 'break',
                priority: 'medium',
                title: '注意劳逸结合',
                description: '您的学习时长较长，建议适当休息以保持学习效率。',
                action: {
                    type: 'tip',
                    target: 'break',
                    label: '查看休息建议'
                },
                icon: '☕'
            });
        }
    }

    /**
     * 添加目标推荐
     */
    addGoalRecommendations() {
        const goals = this.userProfile.goals;
        const remainingDays = Math.max(0, goals.timeframe - Math.floor((Date.now() - this.userProfile.lastUpdated) / (24 * 60 * 60 * 1000)));

        if (remainingDays > 0) {
            this.recommendations.push({
                type: 'goal',
                priority: 'medium',
                title: `${goals.examType.toUpperCase()}考试倒计时`,
                description: `距离您的${goals.examType.toUpperCase()}目标还有${remainingDays}天，目标分数${goals.targetScore}分。`,
                action: {
                    type: 'plan',
                    target: 'study-plan',
                    label: '查看学习计划'
                },
                icon: '🎯'
            });
        }

        // 根据考试类型推荐特定内容
        const examRecommendations = this.getExamSpecificRecommendations(goals.examType);
        this.recommendations.push(...examRecommendations);
    }

    /**
     * 添加一致性推荐
     */
    addConsistencyRecommendations() {
        const consistency = this.learningPatterns.consistencyScore;

        if (consistency < 0.3) {
            this.recommendations.push({
                type: 'consistency',
                priority: 'high',
                title: '建立学习习惯',
                description: '保持规律的学习习惯对提高英语水平非常重要，建议制定固定的学习时间。',
                action: {
                    type: 'habit',
                    target: 'schedule',
                    label: '制定学习计划'
                },
                icon: '📅'
            });
        } else if (consistency > 0.7) {
            this.recommendations.push({
                type: 'praise',
                priority: 'low',
                title: '学习习惯优秀！',
                description: '您保持了很好的学习习惯，继续保持这种学习节奏。',
                action: {
                    type: 'motivate',
                    target: 'continue',
                    label: '继续努力'
                },
                icon: '🌟'
            });
        }
    }

    /**
     * 添加高级推荐
     */
    addAdvancedRecommendations() {
        const strongestSkill = this.learningPatterns.strongestSkill;
        const improvementRate = this.learningPatterns.improvementRate;

        // 基于优势技能的推荐
        if (strongestSkill) {
            const skillNames = {
                vocabulary: '词汇',
                grammar: '语法',
                listening: '听力',
                reading: '阅读理解',
                writing: '写作练习'
            };

            this.recommendations.push({
                type: 'strength',
                priority: 'low',
                title: `发挥${skillNames[strongestSkill]}优势`,
                description: `${skillNames[strongestSkill]}是您的优势技能，可以尝试更具挑战性的内容。`,
                action: {
                    type: 'challenge',
                    target: strongestSkill,
                    label: '挑战高级内容'
                },
                icon: '💪'
            });
        }

        // 基于进步速度的推荐
        if (improvementRate > 0.1) {
            this.recommendations.push({
                type: 'progress',
                priority: 'low',
                title: '进步显著！',
                description: '您最近的学习进步很快，可以考虑提高学习难度。',
                action: {
                    type: 'upgrade',
                    target: 'difficulty',
                    label: '提升难度'
                },
                icon: '🚀'
            });
        } else if (improvementRate < -0.05) {
            this.recommendations.push({
                type: 'adjustment',
                priority: 'medium',
                title: '调整学习策略',
                description: '最近的进步有所放缓，建议调整学习方法或内容重点。',
                action: {
                    type: 'strategy',
                    target: 'method',
                    label: '调整策略'
                },
                icon: '🔄'
            });
        }
    }

    /**
     * 获取技能图标
     */
    getSkillIcon(skill) {
        const icons = {
            vocabulary: '📚',
            grammar: '📝',
            listening: '👂',
            reading: '📖',
            writing: '✍️'
        };
        return icons[skill] || '📚';
    }

    /**
     * 获取考试特定推荐
     */
    getExamSpecificRecommendations(examType) {
        const recommendations = [];
        
        switch (examType.toLowerCase()) {
            case 'ielts':
                recommendations.push({
                    type: 'exam-specific',
                    priority: 'medium',
                    title: 'IELTS口语练习',
                    description: 'IELTS考试重视口语交流，建议增加口语练习。',
                    action: {
                        type: 'feature',
                        target: 'speaking',
                        label: '口语练习（即将推出）'
                    },
                    icon: '🗣️'
                });
                break;
            case 'toefl':
                recommendations.push({
                    type: 'exam-specific',
                    priority: 'medium',
                    title: 'TOEFL学术词汇',
                    description: 'TOEFL考试需要掌握大量学术词汇，建议重点学习。',
                    action: {
                        type: 'navigate',
                        target: 'vocabulary',
                        label: '学术词汇练习'
                    },
                    icon: '🎓'
                });
                break;
            case 'cet4':
            case 'cet6':
                recommendations.push({
                    type: 'exam-specific',
                    priority: 'medium',
                    title: 'CET阅读理解',
                    description: 'CET考试阅读理解占分较高，建议加强练习。',
                    action: {
                        type: 'navigate',
                        target: 'reading',
                        label: '阅读理解练习'
                    },
                    icon: '📰'
                });
                break;
        }
        
        return recommendations;
    }

    /**
     * 获取推荐列表
     */
    getRecommendations(limit = 5) {
        // 按优先级排序
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const sorted = this.recommendations.sort((a, b) => {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        return sorted.slice(0, limit);
    }

    /**
     * 记录学习会话
     */
    recordStudySession(module, duration, score = null) {
        try {
            // 记录学习时间
            const studyTimes = JSON.parse(localStorage.getItem('study_times') || '[]');
            studyTimes.push(Date.now());
            localStorage.setItem('study_times', JSON.stringify(studyTimes.slice(-100))); // 保留最近100次

            // 记录学习会话
            const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
            studySessions.push({
                module,
                duration,
                score,
                timestamp: Date.now()
            });
            localStorage.setItem('study_sessions', JSON.stringify(studySessions.slice(-100))); // 保留最近100次

            // 记录分数
            if (score !== null) {
                const recentScores = JSON.parse(localStorage.getItem('recent_scores') || '[]');
                recentScores.push(score);
                localStorage.setItem('recent_scores', JSON.stringify(recentScores.slice(-50))); // 保留最近50次
            }

            console.log('📊 学习会话已记录:', { module, duration, score });
        } catch (error) {
            console.error('❌ 记录学习会话失败:', error);
        }
    }

    /**
     * 更新用户偏好
     */
    updateUserPreferences(preferences) {
        try {
            this.userProfile.preferences = { ...this.userProfile.preferences, ...preferences };
            this.userProfile.lastUpdated = Date.now();
            localStorage.setItem('ai_user_profile', JSON.stringify(this.userProfile));
            console.log('✅ 用户偏好已更新:', preferences);
            
            // 重新生成推荐
            this.analyzeLearningPatterns();
            this.generateRecommendations();
        } catch (error) {
            console.error('❌ 更新用户偏好失败:', error);
        }
    }

    /**
     * 获取个性化学习建议
     */
    getPersonalizedTips() {
        const tips = [];
        const preferredTime = this.learningPatterns.preferredTime;
        const consistency = this.learningPatterns.consistencyScore;

        // 基于学习时间的建议
        const timeAdvice = {
            morning: '早晨是记忆力最好的时候，适合学习新词汇和语法规则。',
            afternoon: '下午思维较为活跃，适合进行阅读理解和听力练习。',
            evening: '晚上适合复习和巩固当天学习的内容。',
            night: '深夜学习需要注意休息，建议控制学习时长。'
        };

        tips.push({
            category: '学习时间',
            content: timeAdvice[preferredTime] || timeAdvice.morning,
            icon: '⏰'
        });

        // 基于一致性的建议
        if (consistency < 0.5) {
            tips.push({
                category: '学习习惯',
                content: '建议每天固定时间学习15-30分钟，比长时间不规律学习更有效。',
                icon: '📅'
            });
        }

        // 基于最弱技能的建议
        const weakestSkill = this.learningPatterns.weakestSkill;
        const skillAdvice = {
            vocabulary: '词汇学习要结合语境，建议通过阅读文章来记忆单词。',
            grammar: '语法学习重在理解规则，建议多做练习题并总结错误。',
            listening: '听力需要大量练习，建议从慢速材料开始逐步提高。',
            reading: '阅读理解要训练快速获取信息的能力，先看问题再读文章。',
            writing: '写作需要多练习不同类型的文章，注意结构和逻辑。'
        };

        tips.push({
            category: '技能提升',
            content: skillAdvice[weakestSkill] || skillAdvice.vocabulary,
            icon: this.getSkillIcon(weakestSkill)
        });

        return tips;
    }

    /**
     * 获取学习报告
     */
    getInsightsReport() {
        return {
            userProfile: this.userProfile,
            learningPatterns: this.learningPatterns,
            recommendations: this.getRecommendations(),
            personalizedTips: this.getPersonalizedTips(),
            generatedAt: Date.now()
        };
    }

    /**
     * 生成薄弱点分析
     */
    generateWeaknessAnalysis() {
        console.log('🔍 开始生成薄弱点分析...');
        
        try {
            // 获取各模块统计数据
            const moduleStats = {
                vocabulary: this.getModuleStats('vocabulary'),
                grammar: this.getModuleStats('grammar'),
                listening: this.getModuleStats('listening'),
                reading: this.getModuleStats('reading'),
                writing: this.getModuleStats('writing')
            };

            // 计算每个模块的薄弱程度
            const weaknesses = [];
            
            Object.keys(moduleStats).forEach(module => {
                const stats = moduleStats[module];
                const weakness = this.analyzeModuleWeakness(module, stats);
                if (weakness.score < 0.7) { // 得分低于70%认为是薄弱点
                    weaknesses.push(weakness);
                }
            });

            // 按薄弱程度排序
            weaknesses.sort((a, b) => a.score - b.score);

            // 构建分析结果
            const analysis = {
                overall: {
                    totalWeaknesses: weaknesses.length,
                    primaryWeaknesses: weaknesses.slice(0, 3),
                    hasWeaknesses: weaknesses.length > 0,
                    averageScore: weaknesses.length > 0 ? 
                        weaknesses.reduce((sum, w) => sum + w.score, 0) / weaknesses.length : 0.8
                },
                details: {
                    moduleStats: moduleStats,
                    allWeaknesses: weaknesses,
                    suggestions: this.generateWeaknessSuggestions(weaknesses)
                },
                timestamp: Date.now()
            };

            console.log('✅ 薄弱点分析完成:', analysis);

            // 触发事件，通知应用更新显示
            if (typeof window !== 'undefined' && window.app) {
                setTimeout(() => {
                    window.app.onWeaknessAnalysisCompleted(analysis);
                }, 1000); // 延迟1秒显示，让用户看到加载过程
            }

            return analysis;
        } catch (error) {
            console.error('❌ 薄弱点分析失败:', error);
            
            // 显示错误状态
            if (typeof window !== 'undefined' && window.app) {
                window.app.showAIErrorState();
            }
            
            return null;
        }
    }

    /**
     * 分析单个模块的薄弱程度
     */
    analyzeModuleWeakness(module, stats) {
        let score = 0.5; // 默认中等水平
        let severity = 'low';
        let reasons = [];

        switch (module) {
            case 'vocabulary':
                if (stats.accuracy < 60) {
                    reasons.push('词汇准确率偏低');
                    score = 0.3;
                } else if (stats.accuracy < 80) {
                    score = 0.6;
                } else {
                    score = 0.9;
                }
                
                if (stats.totalStudied < 50) {
                    reasons.push('学习词汇量不足');
                    score -= 0.2;
                }
                break;

            case 'grammar':
                const grammarAccuracy = stats.overall?.accuracy || 0;
                if (grammarAccuracy < 60) {
                    reasons.push('语法练习准确率偏低');
                    score = 0.3;
                } else if (grammarAccuracy < 80) {
                    score = 0.6;
                } else {
                    score = 0.9;
                }
                break;

            case 'writing':
                if (stats.averageScore < 60) {
                    reasons.push('写作平均分偏低');
                    score = 0.3;
                } else if (stats.averageScore < 80) {
                    score = 0.6;
                } else {
                    score = 0.9;
                }
                
                if (stats.totalWritings < 3) {
                    reasons.push('写作练习次数不足');
                    score -= 0.2;
                }
                break;

            case 'reading':
                if (stats.accuracy < 60) {
                    reasons.push('阅读理解准确率偏低');
                    score = 0.3;
                } else if (stats.accuracy < 80) {
                    score = 0.6;
                } else {
                    score = 0.9;
                }
                break;

            case 'listening':
                const listeningAccuracy = stats.overall?.accuracy || 0;
                if (listeningAccuracy < 60) {
                    reasons.push('听力练习准确率偏低');
                    score = 0.3;
                } else if (listeningAccuracy < 80) {
                    score = 0.6;
                } else {
                    score = 0.9;
                }
                break;
        }

        // 确保得分在0-1范围内
        score = Math.max(0, Math.min(1, score));

        // 确定严重程度
        if (score < 0.4) severity = 'high';
        else if (score < 0.6) severity = 'medium';

        return {
            module: module,
            score: score,
            severity: severity,
            reasons: reasons,
            priority: severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low'
        };
    }

    /**
     * 生成薄弱点改进建议
     */
    generateWeaknessSuggestions(weaknesses) {
        const suggestions = [];

        weaknesses.forEach(weakness => {
            const moduleName = {
                vocabulary: '词汇',
                grammar: '语法', 
                listening: '听力',
                reading: '阅读',
                writing: '写作'
            }[weakness.module];

            suggestions.push({
                module: weakness.module,
                title: `加强${moduleName}学习`,
                priority: weakness.priority,
                actions: this.getModuleActions(weakness.module)
            });
        });

        return suggestions;
    }

    /**
     * 获取模块改进行动建议
     */
    getModuleActions(module) {
        const actions = {
            vocabulary: [
                '每天学习20-30个新单词',
                '复习已学单词，提高记忆牢固度',
                '通过阅读文章积累词汇'
            ],
            grammar: [
                '重点练习错误率高的语法点',
                '通过语法练习题巩固基础',
                '阅读语法书加深理解'
            ],
            writing: [
                '增加写作练习频率',
                '学习写作模板和句型',
                '多阅读优秀范文'
            ],
            reading: [
                '每天坚持阅读练习',
                '提高阅读速度和理解能力',
                '多做阅读理解题目'
            ],
            listening: [
                '增加听力练习时间',
                '从慢速听力开始逐步提高',
                '多听不同口音的英语'
            ]
        };

        return actions[module] || ['建议多加练习'];
    }

    /**
     * 缓存管理 - 性能优化
     */
    setCache(key, value) {
        // 清理过期缓存
        this.cleanupCache();
        
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
        
        // 限制缓存大小
        if (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.value;
        }
        this.cache.delete(key);
        return null;
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 批量处理学习数据更新 - 性能优化
     */
    addToBatch(updateData) {
        this.pendingUpdates.add(updateData);
        
        // 达到批处理大小时自动处理
        if (this.pendingUpdates.size >= this.batchSize) {
            this.processBatch();
        }
    }

    async processBatch() {
        if (this.pendingUpdates.size === 0) return;
        
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        
        try {
            // 批量处理更新
            await this.batchProcessUpdates(updates);
            console.log(`📊 批量处理完成: ${updates.length} 个更新`);
        } catch (error) {
            console.error('批量处理失败:', error);
            // 重新添加失败的更新
            updates.forEach(update => this.pendingUpdates.add(update));
        }
    }

    async batchProcessUpdates(updates) {
        // 按类型分组处理
        const grouped = updates.reduce((acc, update) => {
            const type = update.type || 'default';
            if (!acc[type]) acc[type] = [];
            acc[type].push(update);
            return acc;
        }, {});

        // 并行处理不同类型的更新
        const promises = Object.entries(grouped).map(([type, typeUpdates]) => {
            return this.processUpdatesByType(type, typeUpdates);
        });

        await Promise.all(promises);
    }

    async processUpdatesByType(type, updates) {
        switch (type) {
            case 'learning_activity':
                return this.processLearningActivities(updates);
            case 'progress_update':
                return this.processProgressUpdates(updates);
            case 'preference_change':
                return this.processPreferenceChanges(updates);
            default:
                return this.processGenericUpdates(updates);
        }
    }

    async processLearningActivities(activities) {
        // 处理学习活动数据
        activities.forEach(activity => {
            this.updateLearningPattern(activity);
        });
        
        // 触发分析更新（防抖）
        this.debouncedAnalyze();
    }

    async processProgressUpdates(updates) {
        // 处理进度更新
        updates.forEach(update => {
            this.updateUserProgress(update);
        });
    }

    async processPreferenceChanges(changes) {
        // 处理偏好设置变化
        changes.forEach(change => {
            this.updateUserPreferences(change);
        });
        
        // 保存用户档案（防抖）
        this.debouncedSave();
    }

    async processGenericUpdates(updates) {
        // 处理通用更新
        updates.forEach(update => {
            console.log('处理通用更新:', update);
        });
    }

    /**
     * 保存用户档案 - 优化版本
     */
    saveUserProfile() {
        try {
            localStorage.setItem('ai_user_profile', JSON.stringify(this.userProfile));
            console.log('💾 用户档案已保存');
        } catch (error) {
            console.error('保存用户档案失败:', error);
        }
    }

    /**
     * 更新学习模式数据
     */
    updateLearningPattern(activity) {
        // 实现学习模式更新逻辑
        if (activity.module && activity.score !== undefined) {
            if (!this.learningPatterns.moduleScores) {
                this.learningPatterns.moduleScores = {};
            }
            
            if (!this.learningPatterns.moduleScores[activity.module]) {
                this.learningPatterns.moduleScores[activity.module] = [];
            }
            
            this.learningPatterns.moduleScores[activity.module].push({
                score: activity.score,
                timestamp: activity.timestamp || Date.now()
            });
            
            // 保持最近100条记录
            if (this.learningPatterns.moduleScores[activity.module].length > 100) {
                this.learningPatterns.moduleScores[activity.module] = 
                    this.learningPatterns.moduleScores[activity.module].slice(-100);
            }
        }
    }

    /**
     * 更新用户进度
     */
    updateUserProgress(update) {
        if (update.module && update.progress !== undefined) {
            if (!this.userProfile.moduleProgress) {
                this.userProfile.moduleProgress = {};
            }
            this.userProfile.moduleProgress[update.module] = update.progress;
        }
    }

    /**
     * 更新用户偏好
     */
    updateUserPreferences(change) {
        if (change.key && change.value !== undefined) {
            if (!this.userProfile.preferences) {
                this.userProfile.preferences = {};
            }
            this.userProfile.preferences[change.key] = change.value;
        }
    }
}

// 导出管理器
if (typeof window !== 'undefined') {
    window.AIRecommendationManager = AIRecommendationManager;
    console.log('🤖 AI推荐系统管理器已加载');
}
