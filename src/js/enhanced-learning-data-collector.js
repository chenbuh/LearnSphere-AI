/**
 * 增强学习数据收集器
 * 统一收集、处理和分析所有学习数据
 */
class EnhancedLearningDataCollector {
    constructor() {
        this.dataKeys = {
            studySessions: 'enhanced_study_sessions',
            learningMetrics: 'enhanced_learning_metrics',
            performanceData: 'enhanced_performance_data',
            goalProgress: 'learning_goal_progress',
            streakData: 'learning_streak_data',
            skillAssessment: 'skill_assessment_data'
        };
        
        this.sessionId = null;
        this.currentSession = null;
        this.metricsBuffer = [];
        this.autoSaveInterval = null;
        
        this.init();
    }

    /**
     * 初始化收集器
     */
    async init() {
        console.log('📊 初始化增强学习数据收集器...');
        
        // 确保数据结构
        await this.ensureDataStructure();
        
        // 启动自动保存
        this.startAutoSave();
        
        // 设置事件监听
        this.setupEventListeners();
        
        console.log('✅ 增强学习数据收集器初始化完成');
    }

    /**
     * 确保数据结构完整性
     */
    async ensureDataStructure() {
        const defaultStructures = {
            [this.dataKeys.studySessions]: [],
            [this.dataKeys.learningMetrics]: {
                daily: {},
                weekly: {},
                monthly: {},
                yearly: {}
            },
            [this.dataKeys.performanceData]: {
                vocabulary: { accuracy: [], speed: [], retention: [] },
                grammar: { accuracy: [], speed: [], retention: [] },
                listening: { accuracy: [], speed: [], retention: [] },
                reading: { accuracy: [], speed: [], retention: [] },
                writing: { quality: [], speed: [], creativity: [] },
                speaking: { fluency: [], pronunciation: [], confidence: [] }
            },
            [this.dataKeys.goalProgress]: {},
            [this.dataKeys.streakData]: {
                current: 0,
                longest: 0,
                history: []
            },
            [this.dataKeys.skillAssessment]: {
                overall: 0,
                skills: {},
                lastAssessment: null
            }
        };

        for (const [key, defaultValue] of Object.entries(defaultStructures)) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify(defaultValue));
            }
        }
    }

    /**
     * 开始学习会话
     */
    startSession(sessionData = {}) {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.currentSession = {
            id: this.sessionId,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            module: sessionData.module || 'unknown',
            activity: sessionData.activity || 'general',
            metadata: {
                userAgent: navigator.userAgent,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language,
                ...sessionData.metadata
            },
            metrics: {
                interactions: 0,
                keystrokes: 0,
                mouseClicks: 0,
                focusTime: 0,
                idleTime: 0,
                errors: 0,
                corrections: 0
            },
            performance: {
                accuracy: 0,
                speed: 0,
                consistency: 0,
                improvement: 0
            },
            content: {
                itemsStudied: 0,
                questionsAnswered: 0,
                correctAnswers: 0,
                topics: [],
                difficulty: sessionData.difficulty || 'medium'
            },
            engagement: {
                attentionScore: 0,
                motivationLevel: 0,
                frustrationEvents: 0,
                satisfactionRating: 0
            }
        };

        // 开始监控用户行为
        this.startBehaviorMonitoring();
        
        console.log('🎯 学习会话已开始:', this.sessionId);
        return this.sessionId;
    }

    /**
     * 结束学习会话
     */
    async endSession(sessionResult = {}) {
        if (!this.currentSession) {
            console.warn('没有活动的学习会话');
            return null;
        }

        this.currentSession.endTime = Date.now();
        this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;

        // 更新性能数据
        Object.assign(this.currentSession.performance, sessionResult.performance || {});
        Object.assign(this.currentSession.content, sessionResult.content || {});
        Object.assign(this.currentSession.engagement, sessionResult.engagement || {});

        // 计算派生指标
        this.calculateDerivedMetrics();

        // 保存会话
        await this.saveSession();

        // 更新聚合指标
        await this.updateAggregatedMetrics();

        // 更新技能评估
        await this.updateSkillAssessment();

        // 检查目标进度
        await this.updateGoalProgress();

        // 停止行为监控
        this.stopBehaviorMonitoring();

        const completedSession = { ...this.currentSession };
        this.currentSession = null;
        this.sessionId = null;

        console.log('✅ 学习会话已结束:', completedSession.id);
        return completedSession;
    }

    /**
     * 记录学习事件
     */
    recordEvent(eventType, eventData = {}) {
        if (!this.currentSession) return;

        const event = {
            type: eventType,
            timestamp: Date.now(),
            sessionTime: Date.now() - this.currentSession.startTime,
            data: eventData
        };

        if (!this.currentSession.events) {
            this.currentSession.events = [];
        }
        this.currentSession.events.push(event);

        // 更新相关指标
        this.updateSessionMetrics(eventType, eventData);
    }

    /**
     * 更新会话指标
     */
    updateSessionMetrics(eventType, eventData) {
        if (!this.currentSession) return;

        const metrics = this.currentSession.metrics;
        const content = this.currentSession.content;

        switch (eventType) {
            case 'answer_submitted':
                content.questionsAnswered++;
                if (eventData.correct) {
                    content.correctAnswers++;
                }
                if (eventData.error) {
                    metrics.errors++;
                }
                break;

            case 'word_learned':
                content.itemsStudied++;
                if (eventData.topic && !content.topics.includes(eventData.topic)) {
                    content.topics.push(eventData.topic);
                }
                break;

            case 'user_interaction':
                metrics.interactions++;
                if (eventData.type === 'click') {
                    metrics.mouseClicks++;
                } else if (eventData.type === 'keypress') {
                    metrics.keystrokes++;
                }
                break;

            case 'error_made':
                metrics.errors++;
                break;

            case 'error_corrected':
                metrics.corrections++;
                break;

            case 'focus_gained':
                this.currentSession._focusStartTime = Date.now();
                break;

            case 'focus_lost':
                if (this.currentSession._focusStartTime) {
                    metrics.focusTime += Date.now() - this.currentSession._focusStartTime;
                    delete this.currentSession._focusStartTime;
                }
                break;

            case 'idle_detected':
                metrics.idleTime += eventData.duration || 0;
                break;

            case 'frustration_detected':
                this.currentSession.engagement.frustrationEvents++;
                break;
        }

        // 实时计算准确率
        if (content.questionsAnswered > 0) {
            this.currentSession.performance.accuracy = 
                (content.correctAnswers / content.questionsAnswered) * 100;
        }
    }

    /**
     * 计算派生指标
     */
    calculateDerivedMetrics() {
        if (!this.currentSession) return;

        const session = this.currentSession;
        const duration = session.duration / 1000; // 转换为秒

        // 计算速度指标
        if (session.content.questionsAnswered > 0 && duration > 0) {
            session.performance.speed = session.content.questionsAnswered / (duration / 60); // 每分钟答题数
        }

        // 计算专注度
        const totalTime = session.duration;
        const focusTime = session.metrics.focusTime;
        const idleTime = session.metrics.idleTime;
        
        if (totalTime > 0) {
            session.engagement.attentionScore = Math.max(0, 
                ((focusTime - idleTime) / totalTime) * 100
            );
        }

        // 计算一致性（基于答题时间方差）
        if (session.events) {
            const answerTimes = session.events
                .filter(e => e.type === 'answer_submitted')
                .map(e => e.data.responseTime)
                .filter(t => t > 0);

            if (answerTimes.length > 1) {
                const mean = answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length;
                const variance = answerTimes.reduce((sum, time) => 
                    sum + Math.pow(time - mean, 2), 0) / answerTimes.length;
                const stdDev = Math.sqrt(variance);
                
                // 一致性分数：标准差越小，一致性越高
                session.performance.consistency = Math.max(0, 100 - (stdDev / mean) * 100);
            }
        }

        // 计算错误率
        const totalInteractions = session.metrics.interactions;
        const errors = session.metrics.errors;
        session.performance.errorRate = totalInteractions > 0 ? 
            (errors / totalInteractions) * 100 : 0;

        // 计算纠错率
        session.performance.correctionRate = errors > 0 ? 
            (session.metrics.corrections / errors) * 100 : 0;
    }

    /**
     * 保存会话数据
     */
    async saveSession() {
        try {
            const sessions = JSON.parse(localStorage.getItem(this.dataKeys.studySessions) || '[]');
            sessions.push(this.currentSession);

            // 保持最近1000个会话
            if (sessions.length > 1000) {
                sessions.splice(0, sessions.length - 1000);
            }

            localStorage.setItem(this.dataKeys.studySessions, JSON.stringify(sessions));
            
            // 如果有高级存储可用，也保存到那里
            if (window.Storage && typeof window.Storage.set === 'function') {
                await window.Storage.set(this.dataKeys.studySessions, sessions);
            }

        } catch (error) {
            console.error('保存学习会话失败:', error);
        }
    }

    /**
     * 更新聚合指标
     */
    async updateAggregatedMetrics() {
        if (!this.currentSession) return;

        try {
            const metrics = JSON.parse(localStorage.getItem(this.dataKeys.learningMetrics) || '{}');
            const now = new Date();
            const dateKeys = {
                daily: `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`,
                weekly: `${now.getFullYear()}-W${this.getWeekNumber(now)}`,
                monthly: `${now.getFullYear()}-${now.getMonth()}`,
                yearly: `${now.getFullYear()}`
            };

            // 更新各个时间维度的指标
            Object.entries(dateKeys).forEach(([period, key]) => {
                if (!metrics[period]) metrics[period] = {};
                if (!metrics[period][key]) {
                    metrics[period][key] = {
                        sessions: 0,
                        totalTime: 0,
                        totalQuestions: 0,
                        totalCorrect: 0,
                        totalErrors: 0,
                        modules: {},
                        averageAccuracy: 0,
                        averageSpeed: 0,
                        averageEngagement: 0
                    };
                }

                const periodData = metrics[period][key];
                const session = this.currentSession;

                periodData.sessions++;
                periodData.totalTime += session.duration;
                periodData.totalQuestions += session.content.questionsAnswered;
                periodData.totalCorrect += session.content.correctAnswers;
                periodData.totalErrors += session.metrics.errors;

                // 模块统计
                const module = session.module;
                if (!periodData.modules[module]) {
                    periodData.modules[module] = {
                        sessions: 0,
                        time: 0,
                        accuracy: 0,
                        questions: 0
                    };
                }
                periodData.modules[module].sessions++;
                periodData.modules[module].time += session.duration;
                periodData.modules[module].questions += session.content.questionsAnswered;

                // 计算平均值
                periodData.averageAccuracy = periodData.totalQuestions > 0 ?
                    (periodData.totalCorrect / periodData.totalQuestions) * 100 : 0;
                
                periodData.averageSpeed = periodData.sessions > 0 ?
                    (periodData.totalQuestions / (periodData.totalTime / 60000)) : 0; // 每分钟答题数
                
                periodData.averageEngagement = session.engagement.attentionScore;
            });

            localStorage.setItem(this.dataKeys.learningMetrics, JSON.stringify(metrics));

        } catch (error) {
            console.error('更新聚合指标失败:', error);
        }
    }

    /**
     * 更新技能评估
     */
    async updateSkillAssessment() {
        if (!this.currentSession) return;

        try {
            const assessment = JSON.parse(localStorage.getItem(this.dataKeys.skillAssessment) || '{}');
            const session = this.currentSession;
            const module = session.module;

            if (!assessment.skills) assessment.skills = {};
            if (!assessment.skills[module]) {
                assessment.skills[module] = {
                    level: 0,
                    confidence: 0,
                    recentPerformance: [],
                    strengths: [],
                    weaknesses: [],
                    lastUpdated: null
                };
            }

            const skill = assessment.skills[module];
            
            // 添加最新表现
            skill.recentPerformance.push({
                accuracy: session.performance.accuracy,
                speed: session.performance.speed,
                consistency: session.performance.consistency,
                engagement: session.engagement.attentionScore,
                timestamp: session.endTime
            });

            // 保持最近20次表现记录
            if (skill.recentPerformance.length > 20) {
                skill.recentPerformance.splice(0, skill.recentPerformance.length - 20);
            }

            // 计算技能水平（基于最近表现的加权平均）
            const recentScores = skill.recentPerformance.slice(-10); // 最近10次
            if (recentScores.length > 0) {
                const weights = recentScores.map((_, index) => index + 1); // 越新权重越高
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                
                skill.level = recentScores.reduce((sum, perf, index) => {
                    const compositeScore = (
                        perf.accuracy * 0.4 +
                        Math.min(100, perf.speed * 10) * 0.3 +
                        perf.consistency * 0.2 +
                        perf.engagement * 0.1
                    );
                    return sum + (compositeScore * weights[index]);
                }, 0) / totalWeight;

                // 计算信心度（基于表现的稳定性）
                const accuracies = recentScores.map(p => p.accuracy);
                const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
                const variance = accuracies.reduce((sum, acc) => 
                    sum + Math.pow(acc - avgAccuracy, 2), 0) / accuracies.length;
                
                skill.confidence = Math.max(0, 100 - Math.sqrt(variance));
            }

            skill.lastUpdated = Date.now();

            // 计算整体技能水平
            const skillLevels = Object.values(assessment.skills).map(s => s.level).filter(l => l > 0);
            if (skillLevels.length > 0) {
                assessment.overall = skillLevels.reduce((a, b) => a + b, 0) / skillLevels.length;
            }

            assessment.lastAssessment = Date.now();
            localStorage.setItem(this.dataKeys.skillAssessment, JSON.stringify(assessment));

        } catch (error) {
            console.error('更新技能评估失败:', error);
        }
    }

    /**
     * 更新目标进度
     */
    async updateGoalProgress() {
        try {
            const goals = JSON.parse(localStorage.getItem(this.dataKeys.goalProgress) || '{}');
            const session = this.currentSession;

            // 更新各种目标的进度
            Object.values(goals).forEach(goal => {
                if (goal.active && this.isGoalRelevant(goal, session)) {
                    this.updateGoalFromSession(goal, session);
                }
            });

            localStorage.setItem(this.dataKeys.goalProgress, JSON.stringify(goals));

        } catch (error) {
            console.error('更新目标进度失败:', error);
        }
    }

    /**
     * 判断目标是否与当前会话相关
     */
    isGoalRelevant(goal, session) {
        switch (goal.type) {
            case 'daily_time':
            case 'weekly_time':
            case 'monthly_time':
                return true;
            
            case 'module_accuracy':
            case 'module_sessions':
                return goal.module === session.module;
            
            case 'skill_level':
                return goal.skill === session.module;
            
            case 'streak':
                return true;
            
            default:
                return false;
        }
    }

    /**
     * 从会话更新目标
     */
    updateGoalFromSession(goal, session) {
        const now = new Date();
        
        switch (goal.type) {
            case 'daily_time':
                if (this.isSameDay(new Date(goal.lastUpdated || 0), now)) {
                    goal.progress += session.duration;
                } else {
                    goal.progress = session.duration;
                    goal.lastUpdated = now.getTime();
                }
                break;
            
            case 'weekly_time':
                if (this.isSameWeek(new Date(goal.lastUpdated || 0), now)) {
                    goal.progress += session.duration;
                } else {
                    goal.progress = session.duration;
                    goal.lastUpdated = now.getTime();
                }
                break;
            
            case 'module_sessions':
                if (goal.module === session.module) {
                    goal.progress++;
                }
                break;
            
            case 'module_accuracy':
                if (goal.module === session.module) {
                    goal.progress = session.performance.accuracy;
                }
                break;
        }

        // 检查目标是否完成
        if (goal.progress >= goal.target && !goal.completed) {
            goal.completed = true;
            goal.completedAt = Date.now();
            this.triggerGoalCompletion(goal);
        }
    }

    /**
     * 开始行为监控
     */
    startBehaviorMonitoring() {
        // 监听焦点事件
        window.addEventListener('focus', this.handleFocusGain.bind(this));
        window.addEventListener('blur', this.handleFocusLoss.bind(this));
        
        // 监听用户交互
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keypress', this.handleKeypress.bind(this));
        
        // 监听鼠标移动（用于检测空闲）
        let idleTimer = null;
        const resetIdleTimer = () => {
            if (idleTimer) {
                clearTimeout(idleTimer);
            }
            idleTimer = setTimeout(() => {
                this.recordEvent('idle_detected', { duration: 30000 });
            }, 30000); // 30秒无操作视为空闲
        };
        
        document.addEventListener('mousemove', resetIdleTimer);
        document.addEventListener('keypress', resetIdleTimer);
        
        this.behaviorListeners = {
            focusGain: this.handleFocusGain.bind(this),
            focusLoss: this.handleFocusLoss.bind(this),
            click: this.handleClick.bind(this),
            keypress: this.handleKeypress.bind(this),
            mousemove: resetIdleTimer,
            idleTimer
        };
    }

    /**
     * 停止行为监控
     */
    stopBehaviorMonitoring() {
        if (this.behaviorListeners) {
            window.removeEventListener('focus', this.behaviorListeners.focusGain);
            window.removeEventListener('blur', this.behaviorListeners.focusLoss);
            document.removeEventListener('click', this.behaviorListeners.click);
            document.removeEventListener('keypress', this.behaviorListeners.keypress);
            document.removeEventListener('mousemove', this.behaviorListeners.mousemove);
            
            if (this.behaviorListeners.idleTimer) {
                clearTimeout(this.behaviorListeners.idleTimer);
            }
            
            this.behaviorListeners = null;
        }
    }

    /**
     * 处理焦点获得
     */
    handleFocusGain() {
        this.recordEvent('focus_gained');
    }

    /**
     * 处理焦点丢失
     */
    handleFocusLoss() {
        this.recordEvent('focus_lost');
    }

    /**
     * 处理点击事件
     */
    handleClick(event) {
        this.recordEvent('user_interaction', {
            type: 'click',
            target: event.target.tagName,
            x: event.clientX,
            y: event.clientY
        });
    }

    /**
     * 处理按键事件
     */
    handleKeypress(event) {
        this.recordEvent('user_interaction', {
            type: 'keypress',
            key: event.key,
            code: event.code
        });
    }

    /**
     * 启动自动保存
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.currentSession) {
                this.saveCurrentSessionState();
            }
        }, 30000); // 每30秒保存一次状态
    }

    /**
     * 保存当前会话状态
     */
    saveCurrentSessionState() {
        if (this.currentSession) {
            try {
                localStorage.setItem('current_learning_session', JSON.stringify(this.currentSession));
            } catch (error) {
                console.warn('保存当前会话状态失败:', error);
            }
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 页面关闭前保存数据
        window.addEventListener('beforeunload', () => {
            if (this.currentSession) {
                this.saveCurrentSessionState();
            }
        });

        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.recordEvent('focus_lost');
            } else {
                this.recordEvent('focus_gained');
            }
        });
    }

    /**
     * 获取学习统计数据
     */
    async getStatistics(timeRange = 'all') {
        try {
            const sessions = JSON.parse(localStorage.getItem(this.dataKeys.studySessions) || '[]');
            const metrics = JSON.parse(localStorage.getItem(this.dataKeys.learningMetrics) || '{}');
            const assessment = JSON.parse(localStorage.getItem(this.dataKeys.skillAssessment) || '{}');
            const goals = JSON.parse(localStorage.getItem(this.dataKeys.goalProgress) || '{}');

            // 根据时间范围过滤数据
            const filteredSessions = this.filterSessionsByTimeRange(sessions, timeRange);

            return {
                overview: this.calculateOverviewStats(filteredSessions),
                performance: this.calculatePerformanceStats(filteredSessions),
                engagement: this.calculateEngagementStats(filteredSessions),
                skills: assessment,
                goals: goals,
                trends: this.calculateTrends(sessions),
                insights: this.generateInsights(filteredSessions),
                timeRange
            };

        } catch (error) {
            console.error('获取学习统计失败:', error);
            return null;
        }
    }

    // 辅助方法
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    isSameWeek(date1, date2) {
        return this.getWeekNumber(date1) === this.getWeekNumber(date2) &&
               date1.getFullYear() === date2.getFullYear();
    }

    triggerGoalCompletion(goal) {
        // 触发目标完成事件
        window.dispatchEvent(new CustomEvent('goalCompleted', {
            detail: { goal }
        }));
        
        console.log('🎉 目标完成:', goal.name);
    }

    filterSessionsByTimeRange(sessions, timeRange) {
        const now = Date.now();
        let cutoffTime;

        switch (timeRange) {
            case 'today':
                cutoffTime = now - 24 * 60 * 60 * 1000;
                break;
            case 'week':
                cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case 'month':
                cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
                break;
            case 'year':
                cutoffTime = now - 365 * 24 * 60 * 60 * 1000;
                break;
            default:
                return sessions;
        }

        return sessions.filter(session => session.startTime >= cutoffTime);
    }

    calculateOverviewStats(sessions) {
        const totalSessions = sessions.length;
        const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalQuestions = sessions.reduce((sum, s) => sum + s.content.questionsAnswered, 0);
        const totalCorrect = sessions.reduce((sum, s) => sum + s.content.correctAnswers, 0);

        return {
            totalSessions,
            totalTime,
            totalQuestions,
            totalCorrect,
            averageAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
            averageSessionTime: totalSessions > 0 ? totalTime / totalSessions : 0,
            averageSpeed: totalTime > 0 ? (totalQuestions / (totalTime / 60000)) : 0
        };
    }

    calculatePerformanceStats(sessions) {
        const moduleStats = {};
        
        sessions.forEach(session => {
            const module = session.module;
            if (!moduleStats[module]) {
                moduleStats[module] = {
                    sessions: 0,
                    totalTime: 0,
                    totalQuestions: 0,
                    totalCorrect: 0,
                    accuracyTrend: [],
                    speedTrend: []
                };
            }
            
            const stats = moduleStats[module];
            stats.sessions++;
            stats.totalTime += session.duration;
            stats.totalQuestions += session.content.questionsAnswered;
            stats.totalCorrect += session.content.correctAnswers;
            stats.accuracyTrend.push(session.performance.accuracy);
            stats.speedTrend.push(session.performance.speed);
        });

        // 计算每个模块的平均值和趋势
        Object.values(moduleStats).forEach(stats => {
            stats.averageAccuracy = stats.totalQuestions > 0 ? 
                (stats.totalCorrect / stats.totalQuestions) * 100 : 0;
            stats.averageSpeed = stats.sessions > 0 ? 
                stats.speedTrend.reduce((a, b) => a + b, 0) / stats.sessions : 0;
        });

        return moduleStats;
    }

    calculateEngagementStats(sessions) {
        const engagementScores = sessions.map(s => s.engagement.attentionScore).filter(s => s > 0);
        const frustrationEvents = sessions.reduce((sum, s) => sum + s.engagement.frustrationEvents, 0);
        
        return {
            averageAttention: engagementScores.length > 0 ? 
                engagementScores.reduce((a, b) => a + b, 0) / engagementScores.length : 0,
            totalFrustrationEvents: frustrationEvents,
            engagementTrend: engagementScores.slice(-10) // 最近10次的专注度趋势
        };
    }

    calculateTrends(sessions) {
        // 计算最近30天的趋势
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const recentSessions = sessions.filter(s => s.startTime >= thirtyDaysAgo);
        
        // 按天分组
        const dailyStats = {};
        recentSessions.forEach(session => {
            const date = new Date(session.startTime).toDateString();
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    sessions: 0,
                    time: 0,
                    accuracy: 0,
                    questions: 0,
                    correct: 0
                };
            }
            
            const dayStats = dailyStats[date];
            dayStats.sessions++;
            dayStats.time += session.duration;
            dayStats.questions += session.content.questionsAnswered;
            dayStats.correct += session.content.correctAnswers;
        });

        // 计算每日平均准确率
        Object.values(dailyStats).forEach(dayStats => {
            dayStats.accuracy = dayStats.questions > 0 ? 
                (dayStats.correct / dayStats.questions) * 100 : 0;
        });

        return {
            daily: dailyStats,
            overall: {
                sessionsPerDay: recentSessions.length / 30,
                timePerDay: recentSessions.reduce((sum, s) => sum + s.duration, 0) / 30,
                accuracyTrend: Object.values(dailyStats).map(d => d.accuracy)
            }
        };
    }

    generateInsights(sessions) {
        const insights = [];
        
        if (sessions.length === 0) {
            return ['开始您的学习之旅吧！'];
        }

        // 学习频率洞察
        const totalDays = Math.ceil((Date.now() - sessions[0].startTime) / (24 * 60 * 60 * 1000));
        const studyFrequency = sessions.length / totalDays;
        
        if (studyFrequency >= 1) {
            insights.push('🔥 您保持了很好的学习频率，每天都在进步！');
        } else if (studyFrequency >= 0.5) {
            insights.push('👍 您的学习很规律，建议保持这个节奏。');
        } else {
            insights.push('💪 建议增加学习频率，每天学习效果更佳。');
        }

        // 准确率洞察
        const recentSessions = sessions.slice(-10);
        const recentAccuracy = recentSessions.reduce((sum, s) => 
            sum + s.performance.accuracy, 0) / recentSessions.length;
        
        if (recentAccuracy >= 90) {
            insights.push('🎯 您的准确率非常高，可以尝试更有挑战性的内容。');
        } else if (recentAccuracy >= 70) {
            insights.push('📈 您的准确率不错，继续保持！');
        } else {
            insights.push('🎓 建议多复习基础知识，提高准确率。');
        }

        // 学习时长洞察
        const avgSessionTime = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
        const idealTime = 25 * 60 * 1000; // 25分钟
        
        if (avgSessionTime > idealTime * 2) {
            insights.push('⏰ 学习时间较长，建议适当休息，避免疲劳。');
        } else if (avgSessionTime < idealTime * 0.5) {
            insights.push('⏳ 建议适当延长学习时间，加深理解。');
        }

        return insights;
    }

    /**
     * 清理资源
     */
    cleanup() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.stopBehaviorMonitoring();
        
        if (this.currentSession) {
            this.endSession();
        }
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.EnhancedLearningDataCollector = EnhancedLearningDataCollector;
    console.log('📊 增强学习数据收集器已加载');
}
