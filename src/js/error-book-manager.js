/**
 * 智能错题本管理器
 * 自动收集和分析各模块错题，提供个性化复习建议
 */
class ErrorBookManager {
    constructor() {
        this.errorRecords = [];
        this.reviewSchedule = {};
        this.categories = {
            vocabulary: '词汇学习',
            grammar: '语法练习', 
            listening: '听力训练',
            reading: '阅读理解',
            writing: '写作练习',
            vocabTest: '词汇测试',
            vocabGame: '词汇游戏',
            exam: '模拟考试'
        };

        // 知识点分类
        this.knowledgePoints = {
            vocabulary: {
                meaning: '词义理解',
                spelling: '拼写掌握',
                usage: '用法运用',
                pronunciation: '发音掌握',
                collocation: '词汇搭配'
            },
            grammar: {
                tenses: '时态语态',
                clauses: '从句结构',
                prepositions: '介词搭配',
                articles: '冠词用法',
                modals: '情态动词',
                conditionals: '条件句',
                subjunctive: '虚拟语气',
                passive: '被动语态'
            },
            listening: {
                main_idea: '主旨大意',
                details: '细节理解',
                inference: '推理判断',
                attitude: '态度观点',
                function: '功能识别',
                connection: '逻辑关系'
            },
            reading: {
                main_idea: '主旨大意',
                detail: '细节理解',
                inference: '推理判断',
                vocabulary: '词汇理解',
                structure: '文章结构',
                attitude: '作者态度'
            },
            writing: {
                structure: '文章结构',
                grammar: '语法运用',
                vocabulary: '词汇使用',
                coherence: '连贯性',
                content: '内容完整性'
            }
        };

        // 统一统计管理器引用
        this.statsManager = null;

        this.init();
    }

    /**
     * 初始化错题本
     */
    async init() {
        this.loadErrorRecords();
        this.loadReviewSchedule();
        
        // 等待统一统计管理器初始化
        this.waitForStatsManager();
        
        // 自动收集历史错题数据
        await this.collectHistoricalErrors();
        
        console.log('📚 智能错题本管理器已初始化');
    }

    /**
     * 等待统一统计管理器初始化
     */
    waitForStatsManager() {
        const checkStatsManager = () => {
            if (window.unifiedStatisticsManager) {
                this.statsManager = window.unifiedStatisticsManager;
                console.log('✅ 错题本已连接到统一统计管理器');
                return;
            }
            setTimeout(checkStatsManager, 100);
        };
        checkStatsManager();
    }

    /**
     * 收集历史错题数据
     */
    async collectHistoricalErrors() {
        if (!this.statsManager) return;

        try {
            // 从统一统计管理器获取所有学习会话
            const allSessions = await this.statsManager.getFilteredSessions('all');
            
            if (allSessions && allSessions.length > 0) {
                let collectedErrors = 0;
                
                allSessions.forEach(session => {
                    // 检查会话中是否有错误信息
                    if (session.content && session.content.errors) {
                        session.content.errors.forEach(error => {
                            // 避免重复收集
                            if (!this.errorRecords.find(record => 
                                record.sessionId === session.id && 
                                record.questionId === error.questionId)) {
                                
                                this.recordErrorFromSession(session, error);
                                collectedErrors++;
                            }
                        });
                    }
                    
                    // 从准确率推断可能的错题
                    if (session.content && session.content.questionsAnswered && session.content.correctAnswers) {
                        const wrongCount = session.content.questionsAnswered - session.content.correctAnswers;
                        if (wrongCount > 0 && !session.content.errors) {
                            // 创建通用错题记录
                            this.recordGenericError(session, wrongCount);
                            collectedErrors++;
                        }
                    }
                });
                
                if (collectedErrors > 0) {
                    this.saveErrorRecords();
                    console.log(`📊 已从历史数据收集 ${collectedErrors} 个错题`);
                }
            }
        } catch (error) {
            console.warn('收集历史错题数据失败:', error);
        }
    }

    /**
     * 从学习会话记录错题
     */
    recordErrorFromSession(session, error) {
        const errorRecord = {
            id: this.generateErrorId(),
            sessionId: session.id,
            questionId: error.questionId,
            timestamp: session.startTime || Date.now(),
            date: new Date(session.startTime || Date.now()).toISOString(),
            module: session.module || 'unknown',
            category: this.categories[session.module] || '其他',
            knowledgePoint: error.knowledgePoint || 'general',
            question: error.question || '题目内容',
            userAnswer: error.userAnswer || '',
            correctAnswer: error.correctAnswer || '',
            explanation: error.explanation || '暂无解析',
            difficulty: error.difficulty || 'medium',
            reviewCount: 0,
            lastReviewed: null,
            nextReview: this.calculateNextReview(0),
            mastered: false,
            reviewHistory: [],
            source: 'historical' // 标记为历史数据
        };

        this.errorRecords.unshift(errorRecord);
        this.scheduleReview(errorRecord);
    }

    /**
     * 记录通用错题（从准确率推断）
     */
    recordGenericError(session, wrongCount) {
        for (let i = 0; i < Math.min(wrongCount, 3); i++) {
            const errorRecord = {
                id: this.generateErrorId(),
                sessionId: session.id,
                questionId: `generic_${i}`,
                timestamp: session.startTime || Date.now(),
                date: new Date(session.startTime || Date.now()).toISOString(),
                module: session.module || 'unknown',
                category: this.categories[session.module] || '其他',
                knowledgePoint: 'general',
                question: `${this.categories[session.module]}练习题`,
                userAnswer: '错误答案',
                correctAnswer: '正确答案',
                explanation: '请重新学习相关知识点',
                difficulty: 'medium',
                reviewCount: 0,
                lastReviewed: null,
                nextReview: this.calculateNextReview(0),
                mastered: false,
                reviewHistory: [],
                source: 'inferred' // 标记为推断数据
            };

            this.errorRecords.unshift(errorRecord);
            this.scheduleReview(errorRecord);
        }
    }

    /**
     * 记录错题
     * @param {Object} errorData - 错题数据
     */
    recordError(errorData) {
        const errorRecord = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            date: new Date().toISOString(),
            module: errorData.module, // 'vocabulary', 'grammar', 'listening', 'reading'
            category: errorData.category,
            knowledgePoint: errorData.knowledgePoint,
            question: errorData.question,
            userAnswer: errorData.userAnswer,
            correctAnswer: errorData.correctAnswer,
            explanation: errorData.explanation,
            difficulty: errorData.difficulty || 'medium',
            reviewCount: 0,
            lastReviewed: null,
            nextReview: this.calculateNextReview(0),
            mastered: false,
            reviewHistory: [],
            source: 'realtime' // 标记为实时数据
        };

        this.errorRecords.unshift(errorRecord);
        this.scheduleReview(errorRecord);
        this.saveErrorRecords();

        // 同时记录到统一统计管理器
        if (this.statsManager) {
            try {
                this.statsManager.recordSession({
                    module: errorData.module,
                    duration: 30000, // 30秒估算
                    startTime: Date.now() - 30000,
                    content: {
                        questionsAnswered: 1,
                        correctAnswers: 0,
                        errors: [errorData]
                    },
                    performance: {
                        accuracy: 0
                    }
                });
            } catch (error) {
                console.warn('记录错题到统一统计管理器失败:', error);
            }
        }

        console.log('📝 已记录错题:', errorRecord.id);
        return errorRecord;
    }

    /**
     * 记录复习结果
     * @param {String} errorId - 错题ID
     * @param {Boolean} isCorrect - 是否答对
     */
    recordReviewResult(errorId, isCorrect) {
        const errorRecord = this.errorRecords.find(record => record.id === errorId);
        if (!errorRecord) {
            console.warn('未找到错题记录:', errorId);
            return;
        }

        errorRecord.reviewCount++;
        errorRecord.lastReviewed = Date.now();
        
        // 添加复习历史
        errorRecord.reviewHistory.push({
            date: new Date().toISOString(),
            isCorrect: isCorrect,
            reviewCount: errorRecord.reviewCount
        });

        // 根据复习结果计算下次复习时间
        if (isCorrect) {
            errorRecord.nextReview = this.calculateNextReview(errorRecord.reviewCount);
            
            // 如果连续答对3次，标记为已掌握
            const recentCorrect = errorRecord.reviewHistory.slice(-3).every(h => h.isCorrect);
            if (errorRecord.reviewCount >= 3 && recentCorrect) {
                errorRecord.mastered = true;
                console.log('🎉 错题已掌握:', errorRecord.id);
            }
        } else {
            // 答错了，重置复习间隔
            errorRecord.nextReview = this.calculateNextReview(0);
        }

        this.saveErrorRecords();
        this.updateReviewSchedule();

        console.log('📊 复习结果已记录:', errorId, isCorrect);
    }

    /**
     * 计算下次复习时间（基于遗忘曲线）
     * @param {Number} reviewCount - 复习次数
     * @returns {Number} 下次复习时间戳
     */
    calculateNextReview(reviewCount) {
        const intervals = [
            1 * 60 * 1000,      // 1分钟（立即复习）
            20 * 60 * 1000,     // 20分钟
            1 * 24 * 60 * 60 * 1000,    // 1天
            2 * 24 * 60 * 60 * 1000,    // 2天
            4 * 24 * 60 * 60 * 1000,    // 4天
            7 * 24 * 60 * 60 * 1000,    // 1周
            15 * 24 * 60 * 60 * 1000,   // 15天
            30 * 24 * 60 * 60 * 1000    // 30天
        ];

        const intervalIndex = Math.min(reviewCount, intervals.length - 1);
        return Date.now() + intervals[intervalIndex];
    }

    /**
     * 获取需要复习的错题
     * @param {Number} limit - 限制数量
     * @returns {Array} 需要复习的错题列表
     */
    getReviewErrors(limit = 10) {
        const now = Date.now();
        
        return this.errorRecords
            .filter(record => !record.mastered && record.nextReview <= now)
            .sort((a, b) => a.nextReview - b.nextReview)
            .slice(0, limit);
    }

    /**
     * 获取错题统计
     * @returns {Object} 错题统计信息
     */
    getErrorStats() {
        const totalErrors = this.errorRecords.length;
        const masteredErrors = this.errorRecords.filter(record => record.mastered).length;
        const needReview = this.getReviewErrors(100).length;
        
        // 按模块统计
        const moduleStats = {};
        Object.keys(this.categories).forEach(module => {
            const moduleErrors = this.errorRecords.filter(record => record.module === module);
            moduleStats[module] = {
                total: moduleErrors.length,
                mastered: moduleErrors.filter(record => record.mastered).length,
                needReview: moduleErrors.filter(record => !record.mastered && record.nextReview <= Date.now()).length
            };
        });

        // 按知识点统计
        const knowledgePointStats = {};
        this.errorRecords.forEach(record => {
            if (!knowledgePointStats[record.module]) {
                knowledgePointStats[record.module] = {};
            }
            
            const point = record.knowledgePoint || 'other';
            if (!knowledgePointStats[record.module][point]) {
                knowledgePointStats[record.module][point] = 0;
            }
            
            if (!record.mastered) {
                knowledgePointStats[record.module][point]++;
            }
        });

        return {
            totalErrors,
            masteredErrors,
            needReview,
            masteryRate: totalErrors > 0 ? Math.round((masteredErrors / totalErrors) * 100) : 0,
            moduleStats,
            knowledgePointStats
        };
    }

    /**
     * 获取错题分析报告
     * @returns {Object} 详细的错题分析报告
     */
    async getErrorAnalysis() {
        const stats = this.getErrorStats();
        const recentErrors = this.getRecentErrors(30); // 最近30天
        
        // 分析错题趋势
        const trendData = this.analyzeTrend(recentErrors);
        
        // 分析薄弱知识点
        const weakPoints = this.analyzeWeakPoints();
        
        // 生成复习建议
        const recommendations = this.generateRecommendations(stats, weakPoints);

        // 获取学习会话数据进行深度分析
        let sessionAnalysis = null;
        if (this.statsManager) {
            try {
                const recentSessions = await this.statsManager.getFilteredSessions('month');
                sessionAnalysis = this.analyzeSessionData(recentSessions);
            } catch (error) {
                console.warn('获取会话数据失败:', error);
            }
        }

        return {
            stats,
            trend: trendData,
            weakPoints,
            recommendations,
            sessionAnalysis,
            recentErrors: recentErrors.slice(0, 10) // 最近10个错题
        };
    }

    /**
     * 分析学习会话数据
     * @param {Array} sessions - 学习会话数据
     * @returns {Object} 会话分析结果
     */
    analyzeSessionData(sessions) {
        if (!sessions || sessions.length === 0) return null;

        const moduleAccuracy = {};
        const timeDistribution = {};
        const difficultyTrends = { easy: 0, medium: 0, hard: 0 };

        sessions.forEach(session => {
            // 模块准确率分析
            if (session.module && session.content) {
                if (!moduleAccuracy[session.module]) {
                    moduleAccuracy[session.module] = {
                        total: 0,
                        correct: 0,
                        sessions: 0
                    };
                }
                
                moduleAccuracy[session.module].total += session.content.questionsAnswered || 0;
                moduleAccuracy[session.module].correct += session.content.correctAnswers || 0;
                moduleAccuracy[session.module].sessions++;
            }

            // 时间分布分析
            const hour = new Date(session.startTime).getHours();
            const timeSlot = this.getTimeSlot(hour);
            if (!timeDistribution[timeSlot]) {
                timeDistribution[timeSlot] = { sessions: 0, accuracy: 0, totalQuestions: 0, correctAnswers: 0 };
            }
            timeDistribution[timeSlot].sessions++;
            timeDistribution[timeSlot].totalQuestions += session.content?.questionsAnswered || 0;
            timeDistribution[timeSlot].correctAnswers += session.content?.correctAnswers || 0;
        });

        // 计算各时段准确率
        Object.keys(timeDistribution).forEach(slot => {
            const data = timeDistribution[slot];
            data.accuracy = data.totalQuestions > 0 ? 
                Math.round((data.correctAnswers / data.totalQuestions) * 100) : 0;
        });

        // 计算各模块准确率
        Object.keys(moduleAccuracy).forEach(module => {
            const data = moduleAccuracy[module];
            data.accuracy = data.total > 0 ? 
                Math.round((data.correct / data.total) * 100) : 0;
        });

        return {
            moduleAccuracy,
            timeDistribution,
            bestTimeSlot: this.getBestTimeSlot(timeDistribution),
            worstModule: this.getWorstModule(moduleAccuracy)
        };
    }

    /**
     * 获取时间段
     * @param {Number} hour - 小时
     * @returns {String} 时间段
     */
    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    /**
     * 获取最佳学习时段
     * @param {Object} timeDistribution - 时间分布数据
     * @returns {String} 最佳时段
     */
    getBestTimeSlot(timeDistribution) {
        let bestSlot = null;
        let bestAccuracy = 0;

        Object.entries(timeDistribution).forEach(([slot, data]) => {
            if (data.accuracy > bestAccuracy && data.sessions >= 2) {
                bestAccuracy = data.accuracy;
                bestSlot = slot;
            }
        });

        const slotNames = {
            morning: '上午',
            afternoon: '下午',
            evening: '晚上',
            night: '深夜'
        };

        return bestSlot ? slotNames[bestSlot] : '暂无数据';
    }

    /**
     * 获取最薄弱模块
     * @param {Object} moduleAccuracy - 模块准确率数据
     * @returns {String} 最薄弱模块
     */
    getWorstModule(moduleAccuracy) {
        let worstModule = null;
        let worstAccuracy = 100;

        Object.entries(moduleAccuracy).forEach(([module, data]) => {
            if (data.accuracy < worstAccuracy && data.sessions >= 2) {
                worstAccuracy = data.accuracy;
                worstModule = module;
            }
        });

        return worstModule ? this.categories[worstModule] : '暂无数据';
    }

    /**
     * 获取最近的错题
     * @param {Number} days - 天数
     * @returns {Array} 最近的错题列表
     */
    getRecentErrors(days = 7) {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        return this.errorRecords
            .filter(record => record.timestamp >= cutoffTime)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * 分析错题趋势
     * @param {Array} recentErrors - 最近错题
     * @returns {Object} 趋势分析数据
     */
    analyzeTrend(recentErrors) {
        const dailyErrors = {};
        const moduleDaily = {};

        recentErrors.forEach(error => {
            const date = new Date(error.timestamp).toDateString();
            
            if (!dailyErrors[date]) {
                dailyErrors[date] = 0;
                moduleDaily[date] = {};
            }
            
            dailyErrors[date]++;
            
            if (!moduleDaily[date][error.module]) {
                moduleDaily[date][error.module] = 0;
            }
            moduleDaily[date][error.module]++;
        });

        return {
            dailyErrors,
            moduleDaily
        };
    }

    /**
     * 分析薄弱知识点
     * @returns {Array} 薄弱知识点列表
     */
    analyzeWeakPoints() {
        const pointCounts = {};
        
        this.errorRecords
            .filter(record => !record.mastered)
            .forEach(record => {
                const key = `${record.module}-${record.knowledgePoint}`;
                if (!pointCounts[key]) {
                    pointCounts[key] = {
                        module: record.module,
                        point: record.knowledgePoint,
                        count: 0,
                        errors: []
                    };
                }
                pointCounts[key].count++;
                pointCounts[key].errors.push(record);
            });

        return Object.values(pointCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    /**
     * 生成复习建议
     * @param {Object} stats - 错题统计
     * @param {Array} weakPoints - 薄弱知识点
     * @returns {Array} 复习建议列表
     */
    generateRecommendations(stats, weakPoints) {
        const recommendations = [];

        // 需要复习的错题建议
        if (stats.needReview > 0) {
            recommendations.push({
                type: 'review',
                priority: 'high',
                title: '有错题需要复习',
                description: `您有 ${stats.needReview} 道错题需要复习，建议优先完成。`,
                action: 'startReview'
            });
        }

        // 薄弱知识点建议
        if (weakPoints.length > 0) {
            const topWeakPoint = weakPoints[0];
            const moduleName = this.categories[topWeakPoint.module];
            const pointName = this.knowledgePoints[topWeakPoint.module]?.[topWeakPoint.point] || topWeakPoint.point;
            
            recommendations.push({
                type: 'weakness',
                priority: 'medium',
                title: '重点关注薄弱知识点',
                description: `在${moduleName}的${pointName}方面错误较多，建议加强练习。`,
                action: 'practiceWeakPoint',
                data: topWeakPoint
            });
        }

        // 掌握率建议
        if (stats.masteryRate < 50) {
            recommendations.push({
                type: 'mastery',
                priority: 'medium',
                title: '提高错题掌握率',
                description: `当前错题掌握率为 ${stats.masteryRate}%，建议加强复习频率。`,
                action: 'increasePractice'
            });
        }

        return recommendations;
    }

    /**
     * 开始错题复习会话
     * @param {Number} limit - 复习题目数量限制
     * @returns {Object} 复习会话数据
     */
    startReviewSession(limit = 10) {
        const reviewErrors = this.getReviewErrors(limit);
        
        if (reviewErrors.length === 0) {
            return null;
        }

        const session = {
            id: this.generateSessionId(),
            startTime: Date.now(),
            errors: reviewErrors,
            currentIndex: 0,
            results: [],
            completed: false
        };

        console.log('🔄 开始错题复习会话:', session.id);
        return session;
    }

    /**
     * 完成复习会话
     * @param {Object} session - 复习会话
     * @param {Array} results - 复习结果
     */
    completeReviewSession(session, results) {
        session.completed = true;
        session.endTime = Date.now();
        session.results = results;

        // 更新每个错题的复习结果
        results.forEach((result, index) => {
            const error = session.errors[index];
            if (error) {
                this.recordReviewResult(error.id, result.isCorrect);
            }
        });

        const accuracy = Math.round((results.filter(r => r.isCorrect).length / results.length) * 100);
        
        console.log('✅ 复习会话完成:', session.id, '正确率:', accuracy + '%');
        
        return {
            session,
            accuracy,
            totalTime: session.endTime - session.startTime
        };
    }

    /**
     * 安排复习计划
     * @param {Object} errorRecord - 错题记录
     */
    scheduleReview(errorRecord) {
        const reviewDate = new Date(errorRecord.nextReview).toDateString();
        
        if (!this.reviewSchedule[reviewDate]) {
            this.reviewSchedule[reviewDate] = [];
        }
        
        this.reviewSchedule[reviewDate].push(errorRecord.id);
        this.saveReviewSchedule();
    }

    /**
     * 更新复习计划
     */
    updateReviewSchedule() {
        this.reviewSchedule = {};
        
        this.errorRecords
            .filter(record => !record.mastered)
            .forEach(record => {
                this.scheduleReview(record);
            });
        
        this.saveReviewSchedule();
    }

    /**
     * 获取今日复习计划
     * @returns {Array} 今日需要复习的错题
     */
    getTodayReview() {
        const today = new Date().toDateString();
        const todayErrorIds = this.reviewSchedule[today] || [];
        
        return todayErrorIds
            .map(id => this.errorRecords.find(record => record.id === id))
            .filter(record => record && !record.mastered);
    }

    /**
     * 搜索错题
     * @param {String} keyword - 关键词
     * @param {Object} filters - 筛选条件
     * @returns {Array} 搜索结果
     */
    searchErrors(keyword = '', filters = {}) {
        return this.errorRecords.filter(record => {
            // 关键词搜索
            if (keyword) {
                const searchText = `${record.question} ${record.explanation}`.toLowerCase();
                if (!searchText.includes(keyword.toLowerCase())) {
                    return false;
                }
            }

            // 模块筛选
            if (filters.module && record.module !== filters.module) {
                return false;
            }

            // 知识点筛选
            if (filters.knowledgePoint && record.knowledgePoint !== filters.knowledgePoint) {
                return false;
            }

            // 掌握状态筛选
            if (filters.mastered !== undefined && record.mastered !== filters.mastered) {
                return false;
            }

            // 难度筛选
            if (filters.difficulty && record.difficulty !== filters.difficulty) {
                return false;
            }

            return true;
        });
    }

    /**
     * 生成错题ID
     * @returns {String} 错题ID
     */
    generateErrorId() {
        return 'error_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 生成会话ID
     * @returns {String} 会话ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 保存错题记录
     */
    saveErrorRecords() {
        try {
            localStorage.setItem('errorBookRecords', JSON.stringify(this.errorRecords));
            console.log('💾 错题记录已保存');
        } catch (error) {
            console.error('保存错题记录失败:', error);
        }
    }

    /**
     * 加载错题记录
     */
    loadErrorRecords() {
        try {
            const saved = localStorage.getItem('errorBookRecords');
            if (saved) {
                this.errorRecords = JSON.parse(saved);
                console.log(`📚 已加载 ${this.errorRecords.length} 条错题记录`);
            }
        } catch (error) {
            console.error('加载错题记录失败:', error);
            this.errorRecords = [];
        }
    }

    /**
     * 保存复习计划
     */
    saveReviewSchedule() {
        try {
            localStorage.setItem('reviewSchedule', JSON.stringify(this.reviewSchedule));
        } catch (error) {
            console.error('保存复习计划失败:', error);
        }
    }

    /**
     * 加载复习计划
     */
    loadReviewSchedule() {
        try {
            const saved = localStorage.getItem('reviewSchedule');
            if (saved) {
                this.reviewSchedule = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载复习计划失败:', error);
            this.reviewSchedule = {};
        }
    }

    /**
     * 导出错题本数据
     * @param {String} format - 导出格式 ('json', 'csv', 'txt')
     * @param {Object} filters - 筛选条件
     * @returns {String} 导出的数据
     */
    exportErrorBook(format = 'json', filters = {}) {
        const errors = this.searchErrors('', filters);
        
        switch (format.toLowerCase()) {
            case 'json':
                return this.exportAsJSON(errors);
            case 'csv':
                return this.exportAsCSV(errors);
            case 'txt':
                return this.exportAsText(errors);
            default:
                throw new Error('不支持的导出格式');
        }
    }

    /**
     * 导出为JSON格式
     * @param {Array} errors - 错题数据
     * @returns {String} JSON字符串
     */
    exportAsJSON(errors) {
        const exportData = {
            exportTime: new Date().toISOString(),
            totalErrors: errors.length,
            errors: errors.map(error => ({
                id: error.id,
                date: error.date,
                module: error.module,
                category: error.category,
                knowledgePoint: error.knowledgePoint,
                question: error.question,
                userAnswer: error.userAnswer,
                correctAnswer: error.correctAnswer,
                explanation: error.explanation,
                difficulty: error.difficulty,
                reviewCount: error.reviewCount,
                mastered: error.mastered,
                source: error.source
            }))
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * 导出为CSV格式
     * @param {Array} errors - 错题数据
     * @returns {String} CSV字符串
     */
    exportAsCSV(errors) {
        const headers = [
            '日期', '模块', '知识点', '题目', '我的答案', '正确答案', 
            '解析', '难度', '复习次数', '是否掌握', '数据来源'
        ];
        
        const rows = errors.map(error => [
            new Date(error.timestamp).toLocaleDateString(),
            this.categories[error.module] || error.module,
            this.knowledgePoints[error.module]?.[error.knowledgePoint] || error.knowledgePoint,
            `"${error.question.replace(/"/g, '""')}"`,
            `"${error.userAnswer.replace(/"/g, '""')}"`,
            `"${error.correctAnswer.replace(/"/g, '""')}"`,
            `"${error.explanation.replace(/"/g, '""')}"`,
            error.difficulty,
            error.reviewCount,
            error.mastered ? '是' : '否',
            error.source === 'realtime' ? '实时' : error.source === 'historical' ? '历史' : '推断'
        ]);
        
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    /**
     * 导出为文本格式
     * @param {Array} errors - 错题数据
     * @returns {String} 文本字符串
     */
    exportAsText(errors) {
        let text = `错题本导出报告\n`;
        text += `导出时间: ${new Date().toLocaleString()}\n`;
        text += `错题总数: ${errors.length}\n`;
        text += `${'='.repeat(50)}\n\n`;
        
        errors.forEach((error, index) => {
            text += `${index + 1}. ${this.categories[error.module] || error.module}\n`;
            text += `   知识点: ${this.knowledgePoints[error.module]?.[error.knowledgePoint] || error.knowledgePoint}\n`;
            text += `   题目: ${error.question}\n`;
            text += `   我的答案: ${error.userAnswer}\n`;
            text += `   正确答案: ${error.correctAnswer}\n`;
            text += `   解析: ${error.explanation}\n`;
            text += `   难度: ${error.difficulty} | 复习次数: ${error.reviewCount} | 掌握状态: ${error.mastered ? '已掌握' : '未掌握'}\n`;
            text += `   记录时间: ${new Date(error.timestamp).toLocaleString()}\n`;
            text += `${'-'.repeat(30)}\n`;
        });
        
        return text;
    }

    /**
     * 生成错题分享摘要
     * @returns {String} 分享摘要
     */
    generateShareSummary() {
        const stats = this.getErrorStats();
        const recentErrors = this.getRecentErrors(7);
        
        let summary = `📚 我的学习错题本统计\n\n`;
        summary += `📊 总体情况:\n`;
        summary += `• 累计错题: ${stats.totalErrors} 道\n`;
        summary += `• 已掌握: ${stats.masteredErrors} 道\n`;
        summary += `• 掌握率: ${stats.masteryRate}%\n`;
        summary += `• 待复习: ${stats.needReview} 道\n\n`;
        
        summary += `📈 模块分布:\n`;
        Object.entries(stats.moduleStats).forEach(([module, data]) => {
            if (data.total > 0) {
                const moduleName = this.categories[module];
                const rate = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
                summary += `• ${moduleName}: ${data.total}道 (掌握率${rate}%)\n`;
            }
        });
        
        summary += `\n🕐 最近一周: 新增${recentErrors.length}道错题\n`;
        summary += `\n💪 继续加油，攻克每一个知识难点！`;
        
        return summary;
    }

    /**
     * 创建学习报告
     * @returns {Object} 学习报告数据
     */
    async createLearningReport() {
        const analysis = await this.getErrorAnalysis();
        const stats = analysis.stats;
        
        const report = {
            reportId: `report_${Date.now()}`,
            generateTime: new Date().toISOString(),
            period: '最近30天',
            summary: {
                totalErrors: stats.totalErrors,
                masteredErrors: stats.masteredErrors,
                masteryRate: stats.masteryRate,
                needReview: stats.needReview
            },
            moduleAnalysis: this.generateModuleAnalysis(stats.moduleStats),
            weaknessAnalysis: analysis.weakPoints.slice(0, 5),
            recommendations: analysis.recommendations,
            sessionAnalysis: analysis.sessionAnalysis,
            improvement: this.calculateImprovement()
        };
        
        return report;
    }

    /**
     * 生成模块分析
     * @param {Object} moduleStats - 模块统计数据
     * @returns {Array} 模块分析结果
     */
    generateModuleAnalysis(moduleStats) {
        return Object.entries(moduleStats).map(([module, data]) => {
            const masteryRate = data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0;
            
            let level = 'excellent';
            if (masteryRate < 50) level = 'needs_improvement';
            else if (masteryRate < 80) level = 'good';
            
            return {
                module,
                moduleName: this.categories[module],
                totalErrors: data.total,
                masteredErrors: data.mastered,
                masteryRate,
                needReview: data.needReview,
                level,
                recommendation: this.getModuleRecommendation(module, masteryRate)
            };
        }).filter(item => item.totalErrors > 0);
    }

    /**
     * 获取模块建议
     * @param {String} module - 模块名
     * @param {Number} masteryRate - 掌握率
     * @returns {String} 建议内容
     */
    getModuleRecommendation(module, masteryRate) {
        const moduleName = this.categories[module];
        
        if (masteryRate < 50) {
            return `${moduleName}掌握率较低，建议加强基础练习，重点复习错题`;
        } else if (masteryRate < 80) {
            return `${moduleName}掌握情况良好，建议继续巩固，提高复习频率`;
        } else {
            return `${moduleName}掌握情况优秀，建议适当复习，保持水平`;
        }
    }

    /**
     * 计算学习进步情况
     * @returns {Object} 进步分析
     */
    calculateImprovement() {
        const recentErrors = this.getRecentErrors(30);
        const olderErrors = this.errorRecords.filter(error => {
            const errorTime = error.timestamp;
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
            const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
            return errorTime >= sixtyDaysAgo && errorTime < thirtyDaysAgo;
        });
        
        const recentMasteryRate = recentErrors.length > 0 ? 
            Math.round((recentErrors.filter(e => e.mastered).length / recentErrors.length) * 100) : 0;
        const olderMasteryRate = olderErrors.length > 0 ? 
            Math.round((olderErrors.filter(e => e.mastered).length / olderErrors.length) * 100) : 0;
        
        const improvement = recentMasteryRate - olderMasteryRate;
        
        return {
            recentPeriod: '最近30天',
            comparisonPeriod: '前30天',
            recentMasteryRate,
            olderMasteryRate,
            improvement,
            trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable'
        };
    }

    /**
     * 清空所有错题记录
     */
    clearAllErrors() {
        console.log('🔄 开始清空所有错题记录...');
        
        const beforeCount = this.errorRecords.length;
        
        // 清空错题记录
        this.errorRecords = [];
        this.reviewSchedule = {};
        
        // 保存到本地存储
        this.saveErrorRecords();
        this.saveReviewSchedule();
        
        // 同时清除统一统计管理器中的相关数据（如果需要的话）
        if (this.statsManager) {
            try {
                // 注意：这里不直接清除统计管理器的数据，因为那些是学习会话数据
                // 错题本重置不应该影响学习统计数据
                console.log('📊 保持统一统计管理器数据不变（学习会话数据）');
            } catch (error) {
                console.warn('处理统计管理器数据时出错:', error);
            }
        }
        
        console.log(`🗑️ 已清空所有错题记录 (共${beforeCount}条)`);
        
        // 返回清空的记录数量
        return beforeCount;
    }

    /**
     * 下载导出文件
     * @param {String} content - 文件内容
     * @param {String} filename - 文件名
     * @param {String} mimeType - MIME类型
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 导出错题本文件
     * @param {String} format - 导出格式
     * @param {Object} filters - 筛选条件
     */
    async exportToFile(format = 'json', filters = {}) {
        try {
            const content = this.exportErrorBook(format, filters);
            const timestamp = new Date().toISOString().split('T')[0];
            
            const filenames = {
                json: `错题本_${timestamp}.json`,
                csv: `错题本_${timestamp}.csv`,
                txt: `错题本_${timestamp}.txt`
            };
            
            const mimeTypes = {
                json: 'application/json',
                csv: 'text/csv',
                txt: 'text/plain'
            };
            
            this.downloadFile(content, filenames[format], mimeTypes[format]);
            console.log(`✅ 错题本已导出为 ${format.toUpperCase()} 格式`);
            
            return true;
        } catch (error) {
            console.error('导出错题本失败:', error);
            return false;
        }
    }

    /**
     * 复制分享摘要到剪贴板
     */
    async copyShareSummary() {
        try {
            const summary = this.generateShareSummary();
            await navigator.clipboard.writeText(summary);
            console.log('✅ 分享摘要已复制到剪贴板');
            return true;
        } catch (error) {
            console.error('复制分享摘要失败:', error);
            return false;
        }
    }

    /**
     * 生成错题统计图表数据
     * @returns {Object} 图表数据
     */
    generateChartData() {
        const stats = this.getErrorStats();
        const recentErrors = this.getRecentErrors(30);
        
        // 模块分布饼图数据
        const moduleChartData = Object.entries(stats.moduleStats)
            .filter(([_, data]) => data.total > 0)
            .map(([module, data]) => ({
                label: this.categories[module],
                value: data.total,
                mastered: data.mastered,
                masteryRate: Math.round((data.mastered / data.total) * 100)
            }));
        
        // 每日错题趋势数据
        const dailyTrend = {};
        recentErrors.forEach(error => {
            const date = new Date(error.timestamp).toLocaleDateString();
            dailyTrend[date] = (dailyTrend[date] || 0) + 1;
        });
        
        const trendData = Object.entries(dailyTrend)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([date, count]) => ({ date, count }));
        
        // 知识点分布数据
        const knowledgePointData = {};
        this.errorRecords.forEach(error => {
            if (!error.mastered) {
                const key = `${error.module}-${error.knowledgePoint}`;
                if (!knowledgePointData[key]) {
                    knowledgePointData[key] = {
                        module: this.categories[error.module],
                        point: this.knowledgePoints[error.module]?.[error.knowledgePoint] || error.knowledgePoint,
                        count: 0
                    };
                }
                knowledgePointData[key].count++;
            }
        });
        
        const weakPointsData = Object.values(knowledgePointData)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        
        return {
            moduleDistribution: moduleChartData,
            dailyTrend: trendData,
            weakPoints: weakPointsData,
            masteryOverview: {
                mastered: stats.masteredErrors,
                unmastered: stats.totalErrors - stats.masteredErrors,
                masteryRate: stats.masteryRate
            }
        };
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.errorBookManager = new ErrorBookManager();
    console.log('✅ 智能错题本管理器已全局初始化');
});
