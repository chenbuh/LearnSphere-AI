/**
 * 学习报告管理器
 * 收集和分析所有模块的学习数据，生成详细的学习报告
 */
class LearningReportManager {
    constructor() {
        this.reportData = {
            overview: {
                totalStudyTime: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                streakDays: 0,
                level: 'beginner'
            },
            modules: {
                vocabulary: { time: 0, accuracy: 0, completed: 0 },
                grammar: { time: 0, accuracy: 0, completed: 0 },
                listening: { time: 0, accuracy: 0, completed: 0 },
                reading: { time: 0, accuracy: 0, completed: 0 },
                vocabTest: { time: 0, accuracy: 0, completed: 0 },
                vocabGame: { time: 0, accuracy: 0, completed: 0 }
            },
            dailyStats: {},
            weaknesses: [],
            achievements: [],
            goals: []
        };

        this.moduleNames = {
            vocabulary: '词汇学习',
            grammar: '语法练习',
            listening: '听力训练',
            reading: '阅读理解',
            vocabTest: '词汇测试',
            vocabGame: '词汇游戏'
        };

        this.init();
    }

    /**
     * 初始化学习报告管理器
     */
    init() {
        this.loadReportData();
        console.log('📊 学习报告管理器已初始化');
    }

    /**
     * 生成综合学习报告
     * @returns {Object} 学习报告数据
     */
    generateComprehensiveReport() {
        console.log('📋 生成综合学习报告');
        
        // 收集所有模块数据
        this.collectAllModuleData();
        
        // 分析学习趋势
        const trendAnalysis = this.analyzeLearningTrend();
        
        // 计算学习等级
        const levelAnalysis = this.calculateLearningLevel();
        
        // 生成个性化建议
        const recommendations = this.generatePersonalizedRecommendations();
        
        // 分析薄弱环节
        const weaknessAnalysis = this.analyzeWeaknesses();
        
        // 计算成就
        const achievements = this.calculateAchievements();

        const report = {
            generatedAt: new Date().toISOString(),
            overview: {
                ...this.reportData.overview,
                ...levelAnalysis
            },
            modules: this.reportData.modules,
            trends: trendAnalysis,
            recommendations: recommendations,
            weaknesses: weaknessAnalysis,
            achievements: achievements,
            dailyStats: this.reportData.dailyStats
        };

        this.saveReportData();
        return report;
    }

    /**
     * 收集所有模块的学习数据
     */
    collectAllModuleData() {
        // 词汇学习数据
        if (window.vocabularyManager) {
            const vocabStats = window.vocabularyManager.getStats();
            this.reportData.modules.vocabulary = {
                time: vocabStats.totalStudyTime || 0,
                accuracy: vocabStats.averageAccuracy || 0,
                completed: vocabStats.totalWordsPracticed || 0,
                wordsLearned: vocabStats.learnedWords || 0,
                reviewedWords: vocabStats.reviewedWords || 0
            };
        }

        // 语法练习数据
        if (window.grammarManager) {
            const grammarStats = window.grammarManager.getStats();
            this.reportData.modules.grammar = {
                time: grammarStats.totalPracticeTime || 0,
                accuracy: grammarStats.overall?.accuracy || 0,
                completed: grammarStats.overall?.completed || 0,
                categories: Object.keys(grammarStats.categoryProgress || {}).length
            };
        }

        // 听力训练数据
        if (window.listeningManager) {
            const listeningStats = window.listeningManager.getStats();
            this.reportData.modules.listening = {
                time: listeningStats.totalPracticeTime || 0,
                accuracy: listeningStats.averageAccuracy || 0,
                completed: listeningStats.totalCompleted || 0,
                categories: Object.keys(listeningStats.categoryProgress || {}).length
            };
        }

        // 阅读理解数据
        if (window.readingManager) {
            const readingStats = window.readingManager.getReadingStats();
            this.reportData.modules.reading = {
                time: readingStats.totalReadingTime || 0,
                accuracy: readingStats.averageAccuracy || 0,
                completed: readingStats.totalArticles || 0,
                readingSpeed: readingStats.readingSpeed || 0
            };
        }

        // 词汇测试数据
        if (window.vocabularyTestManager) {
            const testStats = window.vocabularyTestManager.getTestHistory();
            if (testStats && testStats.length > 0) {
                const totalTests = testStats.length;
                const avgAccuracy = testStats.reduce((sum, test) => sum + test.accuracy, 0) / totalTests;
                const totalTime = testStats.reduce((sum, test) => sum + (test.totalTime || 0), 0);
                
                this.reportData.modules.vocabTest = {
                    time: Math.round(totalTime / 1000 / 60), // 转换为分钟
                    accuracy: Math.round(avgAccuracy),
                    completed: totalTests
                };
            }
        }

        // 计算总体统计
        this.calculateOverallStats();
    }

    /**
     * 计算总体统计数据
     */
    calculateOverallStats() {
        const modules = this.reportData.modules;
        
        // 总学习时间（分钟）
        this.reportData.overview.totalStudyTime = Object.values(modules)
            .reduce((sum, module) => sum + (module.time || 0), 0);
        
        // 总完成数量
        this.reportData.overview.totalQuestions = Object.values(modules)
            .reduce((sum, module) => sum + (module.completed || 0), 0);
        
        // 平均准确率
        const validModules = Object.values(modules).filter(m => m.accuracy > 0);
        this.reportData.overview.averageAccuracy = validModules.length > 0 ?
            Math.round(validModules.reduce((sum, m) => sum + m.accuracy, 0) / validModules.length) : 0;
        
        // 活跃天数（简化计算）
        this.reportData.overview.activeDays = Object.keys(this.reportData.dailyStats).length;
    }

    /**
     * 分析学习趋势
     * @returns {Object} 趋势分析数据
     */
    analyzeLearningTrend() {
        const last7Days = this.getLast7DaysData();
        const last30Days = this.getLast30DaysData();
        
        return {
            recent: {
                days: 7,
                totalTime: last7Days.totalTime,
                avgAccuracy: last7Days.avgAccuracy,
                trend: this.calculateTrend(last7Days.daily)
            },
            monthly: {
                days: 30,
                totalTime: last30Days.totalTime,
                avgAccuracy: last30Days.avgAccuracy,
                trend: this.calculateTrend(last30Days.daily)
            },
            prediction: this.predictFuturePerformance()
        };
    }

    /**
     * 获取最近7天数据
     */
    getLast7DaysData() {
        const last7Days = this.getLastNDaysKeys(7);
        let totalTime = 0;
        let totalAccuracy = 0;
        let validDays = 0;
        const daily = {};

        last7Days.forEach(day => {
            const dayData = this.reportData.dailyStats[day];
            if (dayData) {
                totalTime += dayData.time || 0;
                if (dayData.accuracy > 0) {
                    totalAccuracy += dayData.accuracy;
                    validDays++;
                }
                daily[day] = dayData;
            }
        });

        return {
            totalTime,
            avgAccuracy: validDays > 0 ? Math.round(totalAccuracy / validDays) : 0,
            daily
        };
    }

    /**
     * 获取最近30天数据
     */
    getLast30DaysData() {
        const last30Days = this.getLastNDaysKeys(30);
        let totalTime = 0;
        let totalAccuracy = 0;
        let validDays = 0;
        const daily = {};

        last30Days.forEach(day => {
            const dayData = this.reportData.dailyStats[day];
            if (dayData) {
                totalTime += dayData.time || 0;
                if (dayData.accuracy > 0) {
                    totalAccuracy += dayData.accuracy;
                    validDays++;
                }
                daily[day] = dayData;
            }
        });

        return {
            totalTime,
            avgAccuracy: validDays > 0 ? Math.round(totalAccuracy / validDays) : 0,
            daily
        };
    }

    /**
     * 获取最近N天的日期键
     */
    getLastNDaysKeys(n) {
        const keys = [];
        for (let i = 0; i < n; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            keys.push(date.toDateString());
        }
        return keys.reverse();
    }

    /**
     * 计算趋势
     */
    calculateTrend(dailyData) {
        const values = Object.values(dailyData)
            .filter(d => d && d.accuracy > 0)
            .map(d => d.accuracy);
        
        if (values.length < 2) return 'stable';
        
        const firstHalf = values.slice(0, Math.ceil(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        const diff = secondAvg - firstAvg;
        
        if (diff > 5) return 'improving';
        if (diff < -5) return 'declining';
        return 'stable';
    }

    /**
     * 计算学习等级
     */
    calculateLearningLevel() {
        const totalTime = this.reportData.overview.totalStudyTime;
        const avgAccuracy = this.reportData.overview.averageAccuracy;
        const totalQuestions = this.reportData.overview.totalQuestions;
        
        // 基于学习时间、准确率和完成数量计算等级
        let score = 0;
        
        // 时间分数（最多30分）
        if (totalTime >= 1000) score += 30;
        else if (totalTime >= 500) score += 25;
        else if (totalTime >= 200) score += 20;
        else if (totalTime >= 100) score += 15;
        else if (totalTime >= 50) score += 10;
        else if (totalTime >= 20) score += 5;
        
        // 准确率分数（最多40分）
        if (avgAccuracy >= 90) score += 40;
        else if (avgAccuracy >= 80) score += 35;
        else if (avgAccuracy >= 70) score += 30;
        else if (avgAccuracy >= 60) score += 25;
        else if (avgAccuracy >= 50) score += 20;
        else if (avgAccuracy >= 40) score += 15;
        else if (avgAccuracy >= 30) score += 10;
        
        // 完成数量分数（最多30分）
        if (totalQuestions >= 1000) score += 30;
        else if (totalQuestions >= 500) score += 25;
        else if (totalQuestions >= 200) score += 20;
        else if (totalQuestions >= 100) score += 15;
        else if (totalQuestions >= 50) score += 10;
        else if (totalQuestions >= 20) score += 5;
        
        let level, levelName, nextLevel, progress;
        
        if (score >= 80) {
            level = 'expert';
            levelName = '专家级';
            nextLevel = null;
            progress = 100;
        } else if (score >= 60) {
            level = 'advanced';
            levelName = '高级';
            nextLevel = 'expert';
            progress = Math.round(((score - 60) / 20) * 100);
        } else if (score >= 40) {
            level = 'intermediate';
            levelName = '中级';
            nextLevel = 'advanced';
            progress = Math.round(((score - 40) / 20) * 100);
        } else if (score >= 20) {
            level = 'elementary';
            levelName = '初中级';
            nextLevel = 'intermediate';
            progress = Math.round(((score - 20) / 20) * 100);
        } else {
            level = 'beginner';
            levelName = '初级';
            nextLevel = 'elementary';
            progress = Math.round((score / 20) * 100);
        }

        return {
            level,
            levelName,
            nextLevel,
            progress,
            score,
            maxScore: 100
        };
    }

    /**
     * 生成个性化学习建议
     */
    generatePersonalizedRecommendations() {
        const recommendations = [];
        const modules = this.reportData.modules;
        const overview = this.reportData.overview;

        // 基于学习时间的建议
        if (overview.totalStudyTime < 30) {
            recommendations.push({
                type: 'time',
                priority: 'high',
                title: '增加学习时间',
                description: '建议每天至少学习30分钟，养成良好的学习习惯。',
                action: 'increasePractice'
            });
        }

        // 基于准确率的建议
        if (overview.averageAccuracy < 60) {
            recommendations.push({
                type: 'accuracy',
                priority: 'high',
                title: '提高答题准确率',
                description: '当前准确率偏低，建议重点复习基础知识点。',
                action: 'reviewBasics'
            });
        }

        // 基于模块表现的建议
        Object.entries(modules).forEach(([moduleKey, moduleData]) => {
            if (moduleData.accuracy > 0 && moduleData.accuracy < 50) {
                recommendations.push({
                    type: 'module',
                    priority: 'medium',
                    title: `加强${this.moduleNames[moduleKey]}练习`,
                    description: `${this.moduleNames[moduleKey]}的表现需要提升，建议增加练习时间。`,
                    action: 'practiceModule',
                    module: moduleKey
                });
            }
        });

        // 基于错题的建议
        if (window.errorBookManager) {
            const errorStats = window.errorBookManager.getErrorStats();
            if (errorStats.needReview > 0) {
                recommendations.push({
                    type: 'review',
                    priority: 'high',
                    title: '复习错题',
                    description: `您有 ${errorStats.needReview} 道错题需要复习。`,
                    action: 'reviewErrors'
                });
            }
        }

        // 鼓励性建议
        if (overview.averageAccuracy >= 80) {
            recommendations.push({
                type: 'encouragement',
                priority: 'low',
                title: '表现优秀！',
                description: '您的学习表现很棒，继续保持这个势头！',
                action: 'maintainPace'
            });
        }

        return recommendations.slice(0, 5); // 限制最多5个建议
    }

    /**
     * 分析薄弱环节
     */
    analyzeWeaknesses() {
        const weaknesses = [];
        const modules = this.reportData.modules;

        // 分析模块薄弱环节
        Object.entries(modules).forEach(([moduleKey, moduleData]) => {
            if (moduleData.accuracy > 0 && moduleData.accuracy < 60) {
                weaknesses.push({
                    type: 'module',
                    name: this.moduleNames[moduleKey],
                    accuracy: moduleData.accuracy,
                    severity: moduleData.accuracy < 40 ? 'high' : 'medium'
                });
            }
        });

        // 分析错题薄弱环节
        if (window.errorBookManager) {
            const errorAnalysis = window.errorBookManager.getErrorAnalysis();
            if (errorAnalysis.weakPoints && errorAnalysis.weakPoints.length > 0) {
                errorAnalysis.weakPoints.slice(0, 3).forEach(weakPoint => {
                    weaknesses.push({
                        type: 'knowledge',
                        name: `${this.moduleNames[weakPoint.module]} - ${weakPoint.point}`,
                        count: weakPoint.count,
                        severity: weakPoint.count > 5 ? 'high' : 'medium'
                    });
                });
            }
        }

        return weaknesses;
    }

    /**
     * 计算成就
     */
    calculateAchievements() {
        const achievements = [];
        const overview = this.reportData.overview;
        const modules = this.reportData.modules;

        // 时间成就
        if (overview.totalStudyTime >= 100) {
            achievements.push({
                id: 'time_100',
                name: '学习达人',
                description: '累计学习时间达到100小时',
                icon: '⏰',
                unlocked: true
            });
        }

        if (overview.totalStudyTime >= 500) {
            achievements.push({
                id: 'time_500',
                name: '学习专家',
                description: '累计学习时间达到500小时',
                icon: '🎓',
                unlocked: true
            });
        }

        // 准确率成就
        if (overview.averageAccuracy >= 80) {
            achievements.push({
                id: 'accuracy_80',
                name: '准确之星',
                description: '平均准确率达到80%',
                icon: '🎯',
                unlocked: true
            });
        }

        if (overview.averageAccuracy >= 90) {
            achievements.push({
                id: 'accuracy_90',
                name: '完美主义者',
                description: '平均准确率达到90%',
                icon: '⭐',
                unlocked: true
            });
        }

        // 练习数量成就
        if (overview.totalQuestions >= 1000) {
            achievements.push({
                id: 'questions_1000',
                name: '千题斩',
                description: '累计完成1000道练习题',
                icon: '📝',
                unlocked: true
            });
        }

        // 全模块成就
        const activeModules = Object.values(modules).filter(m => m.completed > 0);
        if (activeModules.length >= 4) {
            achievements.push({
                id: 'all_modules',
                name: '全能学者',
                description: '在所有学习模块都有练习',
                icon: '🌟',
                unlocked: true
            });
        }

        return achievements;
    }

    /**
     * 预测未来表现
     */
    predictFuturePerformance() {
        const recentTrend = this.analyzeLearningTrend().recent.trend;
        
        let prediction = {
            accuracy: this.reportData.overview.averageAccuracy,
            confidence: 'medium'
        };

        switch (recentTrend) {
            case 'improving':
                prediction.accuracy = Math.min(100, prediction.accuracy + 10);
                prediction.trend = 'positive';
                prediction.message = '根据最近的表现趋势，您的成绩有望继续提升！';
                break;
            case 'declining':
                prediction.accuracy = Math.max(0, prediction.accuracy - 5);
                prediction.trend = 'negative';
                prediction.message = '最近表现有所下滑，建议加强练习。';
                break;
            default:
                prediction.trend = 'stable';
                prediction.message = '表现稳定，继续保持当前的学习节奏。';
        }

        return prediction;
    }

    /**
     * 记录每日学习数据
     */
    recordDailyStats(moduleKey, time, accuracy, completed) {
        const today = new Date().toDateString();
        
        if (!this.reportData.dailyStats[today]) {
            this.reportData.dailyStats[today] = {
                date: today,
                time: 0,
                accuracy: 0,
                completed: 0,
                modules: {}
            };
        }

        const dayStats = this.reportData.dailyStats[today];
        
        // 更新每日总计
        dayStats.time += time;
        dayStats.completed += completed;
        
        // 更新模块数据
        if (!dayStats.modules[moduleKey]) {
            dayStats.modules[moduleKey] = { time: 0, accuracy: 0, completed: 0 };
        }
        
        dayStats.modules[moduleKey].time += time;
        dayStats.modules[moduleKey].completed += completed;
        
        // 更新平均准确率
        const moduleAccuracies = Object.values(dayStats.modules)
            .filter(m => m.accuracy > 0)
            .map(m => m.accuracy);
        
        if (moduleAccuracies.length > 0) {
            dayStats.accuracy = Math.round(
                moduleAccuracies.reduce((sum, acc) => sum + acc, 0) / moduleAccuracies.length
            );
        }

        this.saveReportData();
    }

    /**
     * 获取学习统计概览
     */
    getOverviewStats() {
        this.collectAllModuleData();
        return {
            totalStudyTime: this.reportData.overview.totalStudyTime,
            averageAccuracy: this.reportData.overview.averageAccuracy,
            totalQuestions: this.reportData.overview.totalQuestions,
            activeDays: this.reportData.overview.activeDays,
            level: this.calculateLearningLevel()
        };
    }

    /**
     * 保存报告数据
     */
    saveReportData() {
        try {
            localStorage.setItem('learningReportData', JSON.stringify(this.reportData));
        } catch (error) {
            console.error('保存学习报告数据失败:', error);
        }
    }

    /**
     * 加载报告数据
     */
    loadReportData() {
        try {
            const saved = localStorage.getItem('learningReportData');
            if (saved) {
                this.reportData = { ...this.reportData, ...JSON.parse(saved) };
                console.log('📊 学习报告数据已加载');
            }
        } catch (error) {
            console.error('加载学习报告数据失败:', error);
        }
    }

    /**
     * 清除所有报告数据
     */
    clearAllData() {
        this.reportData = {
            overview: {
                totalStudyTime: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                streakDays: 0,
                level: 'beginner'
            },
            modules: {
                vocabulary: { time: 0, accuracy: 0, completed: 0 },
                grammar: { time: 0, accuracy: 0, completed: 0 },
                listening: { time: 0, accuracy: 0, completed: 0 },
                reading: { time: 0, accuracy: 0, completed: 0 },
                vocabTest: { time: 0, accuracy: 0, completed: 0 },
                vocabGame: { time: 0, accuracy: 0, completed: 0 }
            },
            dailyStats: {},
            weaknesses: [],
            achievements: [],
            goals: []
        };
        
        this.saveReportData();
        console.log('🗑️ 学习报告数据已清除');
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.learningReportManager = new LearningReportManager();
    console.log('✅ 学习报告管理器已全局初始化');
});
