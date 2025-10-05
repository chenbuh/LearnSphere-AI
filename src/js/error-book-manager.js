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
            vocabTest: '词汇测试',
            vocabGame: '词汇游戏'
        };

        // 知识点分类
        this.knowledgePoints = {
            vocabulary: {
                meaning: '词义理解',
                spelling: '拼写掌握',
                usage: '用法运用',
                pronunciation: '发音掌握'
            },
            grammar: {
                tenses: '时态语态',
                clauses: '从句结构',
                prepositions: '介词搭配',
                articles: '冠词用法',
                modals: '情态动词',
                conditionals: '条件句'
            },
            listening: {
                main_idea: '主旨大意',
                details: '细节理解',
                inference: '推理判断',
                attitude: '态度观点'
            },
            reading: {
                main_idea: '主旨大意',
                detail: '细节理解',
                inference: '推理判断',
                vocabulary: '词汇理解'
            }
        };

        this.init();
    }

    /**
     * 初始化错题本
     */
    init() {
        this.loadErrorRecords();
        this.loadReviewSchedule();
        console.log('📚 智能错题本管理器已初始化');
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
            reviewHistory: []
        };

        this.errorRecords.unshift(errorRecord);
        this.scheduleReview(errorRecord);
        this.saveErrorRecords();

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
    getErrorAnalysis() {
        const stats = this.getErrorStats();
        const recentErrors = this.getRecentErrors(30); // 最近30天
        
        // 分析错题趋势
        const trendData = this.analyzeTrend(recentErrors);
        
        // 分析薄弱知识点
        const weakPoints = this.analyzeWeakPoints();
        
        // 生成复习建议
        const recommendations = this.generateRecommendations(stats, weakPoints);

        return {
            stats,
            trend: trendData,
            weakPoints,
            recommendations,
            recentErrors: recentErrors.slice(0, 10) // 最近10个错题
        };
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
     * 清空所有错题记录
     */
    clearAllErrors() {
        this.errorRecords = [];
        this.reviewSchedule = {};
        this.saveErrorRecords();
        this.saveReviewSchedule();
        console.log('🗑️ 已清空所有错题记录');
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.errorBookManager = new ErrorBookManager();
    console.log('✅ 智能错题本管理器已全局初始化');
});
