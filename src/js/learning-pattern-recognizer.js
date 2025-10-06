/**
 * 学习模式识别系统
 * 分析用户学习行为，识别学习模式和习惯
 */
class LearningPatternRecognizer {
    constructor() {
        this.patterns = {
            temporal: new TemporalPatternAnalyzer(),
            behavioral: new BehaviorPatternAnalyzer(),
            performance: new PerformancePatternAnalyzer(),
            engagement: new EngagementPatternAnalyzer(),
            difficulty: new DifficultyPatternAnalyzer()
        };
        
        this.recognitionModels = {
            timePreference: new TimePreferenceModel(),
            sessionLength: new SessionLengthModel(),
            contentPreference: new ContentPreferenceModel(),
            learningRhythm: new LearningRhythmModel(),
            errorPattern: new ErrorPatternModel()
        };
        
        this.init();
    }

    init() {
        console.log('🔍 学习模式识别系统已初始化');
    }

    /**
     * 识别所有学习模式
     */
    async recognizePatterns(learningData) {
        console.log('🔍 开始识别学习模式...');
        
        const patterns = {
            temporal: await this.recognizeTemporalPatterns(learningData),
            behavioral: await this.recognizeBehavioralPatterns(learningData),
            performance: await this.recognizePerformancePatterns(learningData),
            engagement: await this.recognizeEngagementPatterns(learningData),
            difficulty: await this.recognizeDifficultyPatterns(learningData),
            summary: null
        };

        // 生成模式摘要
        patterns.summary = this.generatePatternSummary(patterns);
        
        console.log('✅ 学习模式识别完成');
        return patterns;
    }

    /**
     * 识别时间模式
     */
    async recognizeTemporalPatterns(learningData) {
        const sessions = learningData.sessions;
        
        // 分析学习时间偏好
        const timePreference = this.analyzeTimePreference(sessions);
        
        // 分析学习持续时间模式
        const durationPatterns = this.analyzeDurationPatterns(sessions);
        
        // 分析学习频率模式
        const frequencyPatterns = this.analyzeFrequencyPatterns(sessions);
        
        // 分析学习间隔模式
        const intervalPatterns = this.analyzeIntervalPatterns(sessions);

        return {
            timePreference,
            durationPatterns,
            frequencyPatterns,
            intervalPatterns,
            insights: this.generateTemporalInsights({
                timePreference,
                durationPatterns,
                frequencyPatterns,
                intervalPatterns
            })
        };
    }

    /**
     * 识别行为模式
     */
    async recognizeBehavioralPatterns(learningData) {
        const sessions = learningData.sessions;
        
        // 分析内容选择模式
        const contentSelection = this.analyzeContentSelectionPattern(sessions);
        
        // 分析答题行为模式
        const answeringBehavior = this.analyzeAnsweringBehavior(sessions);
        
        // 分析错误处理模式
        const errorHandling = this.analyzeErrorHandlingPattern(sessions);
        
        // 分析复习模式
        const reviewBehavior = this.analyzeReviewBehavior(sessions);

        return {
            contentSelection,
            answeringBehavior,
            errorHandling,
            reviewBehavior,
            insights: this.generateBehavioralInsights({
                contentSelection,
                answeringBehavior,
                errorHandling,
                reviewBehavior
            })
        };
    }

    /**
     * 识别表现模式
     */
    async recognizePerformancePatterns(learningData) {
        const sessions = learningData.sessions;
        
        // 分析准确率趋势
        const accuracyTrends = this.analyzeAccuracyTrends(sessions);
        
        // 分析进步模式
        const progressPatterns = this.analyzeProgressPatterns(sessions);
        
        // 分析瓶颈模式
        const bottleneckPatterns = this.analyzeBottleneckPatterns(sessions);
        
        // 分析突破模式
        const breakthroughPatterns = this.analyzeBreakthroughPatterns(sessions);

        return {
            accuracyTrends,
            progressPatterns,
            bottleneckPatterns,
            breakthroughPatterns,
            insights: this.generatePerformanceInsights({
                accuracyTrends,
                progressPatterns,
                bottleneckPatterns,
                breakthroughPatterns
            })
        };
    }

    /**
     * 识别参与度模式
     */
    async recognizeEngagementPatterns(learningData) {
        const sessions = learningData.sessions;
        
        // 分析专注度模式
        const focusPatterns = this.analyzeFocusPatterns(sessions);
        
        // 分析动机波动模式
        const motivationFluctuations = this.analyzeMotivationFluctuations(sessions);
        
        // 分析疲劳模式
        const fatiguePatterns = this.analyzeFatiguePatterns(sessions);
        
        // 分析恢复模式
        const recoveryPatterns = this.analyzeRecoveryPatterns(sessions);

        return {
            focusPatterns,
            motivationFluctuations,
            fatiguePatterns,
            recoveryPatterns,
            insights: this.generateEngagementInsights({
                focusPatterns,
                motivationFluctuations,
                fatiguePatterns,
                recoveryPatterns
            })
        };
    }

    /**
     * 识别难度模式
     */
    async recognizeDifficultyPatterns(learningData) {
        const sessions = learningData.sessions;
        
        // 分析难度偏好
        const difficultyPreference = this.analyzeDifficultyPreference(sessions);
        
        // 分析挑战接受模式
        const challengeAcceptance = this.analyzeChallengeAcceptance(sessions);
        
        // 分析适应速度模式
        const adaptationSpeed = this.analyzeAdaptationSpeed(sessions);
        
        // 分析舒适区模式
        const comfortZonePatterns = this.analyzeComfortZonePatterns(sessions);

        return {
            difficultyPreference,
            challengeAcceptance,
            adaptationSpeed,
            comfortZonePatterns,
            insights: this.generateDifficultyInsights({
                difficultyPreference,
                challengeAcceptance,
                adaptationSpeed,
                comfortZonePatterns
            })
        };
    }

    // 时间模式分析方法

    /**
     * 分析时间偏好
     */
    analyzeTimePreference(sessions) {
        const hourCounts = new Array(24).fill(0);
        const dayOfWeekCounts = new Array(7).fill(0);
        
        sessions.forEach(session => {
            const date = new Date(session.startTime || session.recordedAt);
            const hour = date.getHours();
            const dayOfWeek = date.getDay();
            
            hourCounts[hour]++;
            dayOfWeekCounts[dayOfWeek]++;
        });

        const preferredHours = this.findPeakHours(hourCounts);
        const preferredDays = this.findPeakDays(dayOfWeekCounts);
        
        return {
            hourDistribution: hourCounts,
            dayDistribution: dayOfWeekCounts,
            preferredHours,
            preferredDays,
            timeType: this.classifyTimeType(preferredHours),
            consistency: this.calculateTimeConsistency(hourCounts, dayOfWeekCounts)
        };
    }

    /**
     * 分析持续时间模式
     */
    analyzeDurationPatterns(sessions) {
        const durations = sessions.map(s => s.duration || 0).filter(d => d > 0);
        
        if (durations.length === 0) {
            return { pattern: 'insufficient_data' };
        }

        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const medianDuration = this.calculateMedian(durations);
        const stdDev = this.calculateStandardDeviation(durations);
        
        // 识别持续时间类型
        const durationType = this.classifyDurationType(avgDuration);
        
        // 分析持续时间趋势
        const trend = this.analyzeDurationTrend(sessions);
        
        return {
            average: avgDuration,
            median: medianDuration,
            standardDeviation: stdDev,
            type: durationType,
            trend,
            consistency: stdDev / avgDuration, // 变异系数
            distribution: this.createDurationDistribution(durations)
        };
    }

    /**
     * 分析学习频率模式
     */
    analyzeFrequencyPatterns(sessions) {
        if (sessions.length === 0) {
            return { pattern: 'no_data' };
        }

        // 按日期分组
        const dailySessions = this.groupSessionsByDay(sessions);
        const weeklyPattern = this.analyzeWeeklyPattern(dailySessions);
        const monthlyPattern = this.analyzeMonthlyPattern(dailySessions);
        
        return {
            dailyAverage: sessions.length / Math.max(1, Object.keys(dailySessions).length),
            weeklyPattern,
            monthlyPattern,
            consistency: this.calculateFrequencyConsistency(dailySessions),
            streaks: this.findLearningStreaks(dailySessions)
        };
    }

    /**
     * 分析学习间隔模式
     */
    analyzeIntervalPatterns(sessions) {
        if (sessions.length < 2) {
            return { pattern: 'insufficient_data' };
        }

        const intervals = [];
        for (let i = 1; i < sessions.length; i++) {
            const prevTime = sessions[i-1].startTime || sessions[i-1].recordedAt;
            const currTime = sessions[i].startTime || sessions[i].recordedAt;
            intervals.push(currTime - prevTime);
        }

        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const medianInterval = this.calculateMedian(intervals);
        
        return {
            average: avgInterval,
            median: medianInterval,
            distribution: this.createIntervalDistribution(intervals),
            regularity: this.calculateIntervalRegularity(intervals),
            optimalInterval: this.suggestOptimalInterval(intervals)
        };
    }

    // 行为模式分析方法

    /**
     * 分析内容选择模式
     */
    analyzeContentSelectionPattern(sessions) {
        const modulePreferences = {};
        const difficultyPreferences = {};
        const sequencePatterns = [];
        
        sessions.forEach((session, index) => {
            // 模块偏好
            const module = session.module || 'unknown';
            modulePreferences[module] = (modulePreferences[module] || 0) + 1;
            
            // 难度偏好
            const difficulty = session.difficulty || 'medium';
            difficultyPreferences[difficulty] = (difficultyPreferences[difficulty] || 0) + 1;
            
            // 序列模式
            if (index > 0) {
                const prevModule = sessions[index-1].module || 'unknown';
                const transition = `${prevModule}->${module}`;
                sequencePatterns.push(transition);
            }
        });

        return {
            modulePreferences: this.sortPreferences(modulePreferences),
            difficultyPreferences: this.sortPreferences(difficultyPreferences),
            sequencePatterns: this.analyzeSequencePatterns(sequencePatterns),
            diversity: this.calculateContentDiversity(modulePreferences),
            exploration: this.calculateExplorationTendency(sessions)
        };
    }

    /**
     * 分析答题行为模式
     */
    analyzeAnsweringBehavior(sessions) {
        let totalQuestions = 0;
        let totalCorrect = 0;
        let totalTime = 0;
        let hastinesses = [];
        let hesitations = [];
        
        sessions.forEach(session => {
            if (session.content && session.content.questionsAnswered) {
                totalQuestions += session.content.questionsAnswered;
                totalCorrect += session.content.correctAnswers || 0;
                
                // 分析答题速度模式
                if (session.content.averageTimePerQuestion) {
                    const avgTime = session.content.averageTimePerQuestion;
                    totalTime += avgTime;
                    
                    if (avgTime < 10) hastinesses.push(session);
                    if (avgTime > 60) hesitations.push(session);
                }
            }
        });

        const avgAccuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
        const avgTimePerQuestion = sessions.length > 0 ? totalTime / sessions.length : 0;
        
        return {
            accuracy: avgAccuracy,
            averageTimePerQuestion: avgTimePerQuestion,
            hastyBehavior: hastinesses.length / sessions.length,
            hesitantBehavior: hesitations.length / sessions.length,
            speedAccuracyBalance: this.calculateSpeedAccuracyBalance(avgTimePerQuestion, avgAccuracy),
            answeringStyle: this.classifyAnsweringStyle(avgTimePerQuestion, avgAccuracy)
        };
    }

    /**
     * 分析错误处理模式
     */
    analyzeErrorHandlingPattern(sessions) {
        let totalErrors = 0;
        let repeatedErrors = 0;
        let errorTypes = {};
        let recoveryTimes = [];
        
        sessions.forEach(session => {
            if (session.content && session.content.incorrectAnswers) {
                const errors = session.content.incorrectAnswers;
                totalErrors += errors;
                
                // 分析错误类型（如果有详细数据）
                if (session.content.errorDetails) {
                    session.content.errorDetails.forEach(error => {
                        errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
                    });
                }
                
                // 分析恢复时间
                if (session.content.recoveryTime) {
                    recoveryTimes.push(session.content.recoveryTime);
                }
            }
        });

        return {
            errorRate: totalErrors / Math.max(1, sessions.length),
            errorTypes: this.sortPreferences(errorTypes),
            repeatErrorRate: repeatedErrors / Math.max(1, totalErrors),
            averageRecoveryTime: recoveryTimes.length > 0 ? 
                recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length : 0,
            errorHandlingStyle: this.classifyErrorHandlingStyle(totalErrors, recoveryTimes),
            improvement: this.analyzeErrorImprovement(sessions)
        };
    }

    /**
     * 分析复习模式
     */
    analyzeReviewBehavior(sessions) {
        const reviewSessions = sessions.filter(s => s.type === 'review' || s.isReview);
        const totalSessions = sessions.length;
        
        if (reviewSessions.length === 0) {
            return {
                reviewRate: 0,
                pattern: 'no_review',
                recommendation: '建议增加复习环节以巩固学习效果'
            };
        }

        const reviewRate = reviewSessions.length / totalSessions;
        const reviewIntervals = this.calculateReviewIntervals(reviewSessions);
        const reviewEffectiveness = this.calculateReviewEffectiveness(reviewSessions);
        
        return {
            reviewRate,
            averageInterval: reviewIntervals.average,
            effectiveness: reviewEffectiveness,
            pattern: this.classifyReviewPattern(reviewRate, reviewIntervals),
            consistency: this.calculateReviewConsistency(reviewSessions)
        };
    }

    // 表现模式分析方法

    /**
     * 分析准确率趋势
     */
    analyzeAccuracyTrends(sessions) {
        const accuracyData = sessions.map((session, index) => ({
            index,
            accuracy: this.calculateSessionAccuracy(session),
            timestamp: session.startTime || session.recordedAt
        })).filter(data => data.accuracy !== null);

        if (accuracyData.length < 3) {
            return { trend: 'insufficient_data' };
        }

        const trend = this.calculateTrend(accuracyData.map(d => d.accuracy));
        const volatility = this.calculateVolatility(accuracyData.map(d => d.accuracy));
        const peaks = this.findPeaks(accuracyData);
        const valleys = this.findValleys(accuracyData);
        
        return {
            trend,
            volatility,
            peaks,
            valleys,
            currentLevel: accuracyData[accuracyData.length - 1].accuracy,
            improvement: this.calculateImprovement(accuracyData),
            stability: this.calculateStability(accuracyData)
        };
    }

    /**
     * 分析进步模式
     */
    analyzeProgressPatterns(sessions) {
        // 计算各种进步指标
        const scoreProgress = this.analyzeScoreProgress(sessions);
        const speedProgress = this.analyzeSpeedProgress(sessions);
        const difficultyProgress = this.analyzeDifficultyProgress(sessions);
        
        return {
            score: scoreProgress,
            speed: speedProgress,
            difficulty: difficultyProgress,
            overall: this.calculateOverallProgress({
                scoreProgress,
                speedProgress,
                difficultyProgress
            }),
            milestones: this.identifyProgressMilestones(sessions),
            plateaus: this.identifyProgressPlateaus(sessions)
        };
    }

    // 生成洞察方法

    /**
     * 生成时间模式洞察
     */
    generateTemporalInsights(patterns) {
        const insights = [];
        
        // 时间偏好洞察
        if (patterns.timePreference.timeType === 'morning') {
            insights.push({
                type: 'time_preference',
                title: '晨型学习者',
                description: '您倾向于在上午时段学习，这时精力充沛，注意力集中',
                recommendation: '继续保持晨间学习习惯，可以安排较难的内容在上午完成'
            });
        } else if (patterns.timePreference.timeType === 'evening') {
            insights.push({
                type: 'time_preference',
                title: '夜型学习者',
                description: '您更喜欢在晚上学习，这时思维活跃',
                recommendation: '合理安排晚间学习时间，注意不要影响睡眠质量'
            });
        }
        
        // 持续时间洞察
        if (patterns.durationPatterns.type === 'short_burst') {
            insights.push({
                type: 'duration',
                title: '短时高频学习',
                description: '您倾向于进行短时间但高频率的学习',
                recommendation: '这种模式有利于保持专注，可以配合番茄工作法'
            });
        }
        
        return insights;
    }

    /**
     * 生成行为模式洞察
     */
    generateBehavioralInsights(patterns) {
        const insights = [];
        
        // 内容选择洞察
        if (patterns.contentSelection.diversity < 0.3) {
            insights.push({
                type: 'content_diversity',
                title: '学习内容单一',
                description: '您倾向于专注于特定类型的内容',
                recommendation: '适当增加学习内容的多样性，有助于全面发展'
            });
        }
        
        // 答题行为洞察
        if (patterns.answeringBehavior.answeringStyle === 'hasty') {
            insights.push({
                type: 'answering_style',
                title: '答题速度较快',
                description: '您答题速度快，但可能需要注意准确性',
                recommendation: '适当放慢答题速度，仔细审题以提高准确率'
            });
        }
        
        return insights;
    }

    /**
     * 生成表现模式洞察
     */
    generatePerformanceInsights(patterns) {
        const insights = [];
        
        // 准确率趋势洞察
        if (patterns.accuracyTrends.trend > 0.1) {
            insights.push({
                type: 'accuracy_trend',
                title: '准确率持续提升',
                description: '您的答题准确率呈现上升趋势，学习效果显著',
                recommendation: '继续保持当前的学习方法和节奏'
            });
        } else if (patterns.accuracyTrends.trend < -0.1) {
            insights.push({
                type: 'accuracy_trend',
                title: '准确率有所下降',
                description: '最近的准确率出现下降趋势，需要注意调整',
                recommendation: '检查学习方法，可能需要降低难度或增加复习'
            });
        }
        
        return insights;
    }

    /**
     * 生成参与度模式洞察
     */
    generateEngagementInsights(patterns) {
        const insights = [];
        
        // 专注度洞察
        if (patterns.focusPatterns.averageFocus < 0.6) {
            insights.push({
                type: 'focus',
                title: '专注度有待提升',
                description: '学习过程中的专注度相对较低',
                recommendation: '尝试减少干扰因素，使用专注技巧如番茄工作法'
            });
        }
        
        return insights;
    }

    /**
     * 生成难度模式洞察
     */
    generateDifficultyInsights(patterns) {
        const insights = [];
        
        // 难度偏好洞察
        if (patterns.difficultyPreference.comfort > 0.8) {
            insights.push({
                type: 'difficulty_preference',
                title: '偏好舒适区学习',
                description: '您倾向于选择较为熟悉的难度水平',
                recommendation: '适当挑战更高难度，有助于突破学习瓶颈'
            });
        }
        
        return insights;
    }

    /**
     * 生成模式摘要
     */
    generatePatternSummary(patterns) {
        const summary = {
            dominantPatterns: [],
            keyInsights: [],
            recommendations: [],
            learnerProfile: this.createLearnerProfile(patterns)
        };

        // 识别主导模式
        if (patterns.temporal.timePreference.consistency > 0.7) {
            summary.dominantPatterns.push('时间规律性强');
        }
        
        if (patterns.behavioral.contentSelection.diversity > 0.7) {
            summary.dominantPatterns.push('学习内容多样化');
        }
        
        if (patterns.performance.accuracyTrends.trend > 0.1) {
            summary.dominantPatterns.push('持续进步');
        }

        // 提取关键洞察
        const allInsights = [
            ...patterns.temporal.insights,
            ...patterns.behavioral.insights,
            ...patterns.performance.insights,
            ...patterns.engagement.insights,
            ...patterns.difficulty.insights
        ];
        
        summary.keyInsights = allInsights.slice(0, 5); // 取前5个最重要的洞察
        
        // 生成综合建议
        summary.recommendations = this.generateComprehensiveRecommendations(patterns);
        
        return summary;
    }

    /**
     * 创建学习者画像
     */
    createLearnerProfile(patterns) {
        const profile = {
            timeType: patterns.temporal.timePreference.timeType,
            sessionStyle: patterns.temporal.durationPatterns.type,
            learningStyle: this.inferLearningStyle(patterns),
            strengthAreas: this.identifyStrengthAreas(patterns),
            growthAreas: this.identifyGrowthAreas(patterns),
            motivation: this.assessMotivationLevel(patterns),
            consistency: this.assessConsistency(patterns)
        };
        
        return profile;
    }

    // 辅助计算方法

    findPeakHours(hourCounts) {
        const maxCount = Math.max(...hourCounts);
        const threshold = maxCount * 0.8;
        return hourCounts.map((count, hour) => ({ hour, count }))
                        .filter(item => item.count >= threshold)
                        .map(item => item.hour);
    }

    findPeakDays(dayOfWeekCounts) {
        const maxCount = Math.max(...dayOfWeekCounts);
        const threshold = maxCount * 0.8;
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return dayOfWeekCounts.map((count, day) => ({ day, count, name: dayNames[day] }))
                            .filter(item => item.count >= threshold);
    }

    classifyTimeType(preferredHours) {
        const avgHour = preferredHours.reduce((a, b) => a + b, 0) / preferredHours.length;
        if (avgHour < 12) return 'morning';
        if (avgHour < 18) return 'afternoon';
        return 'evening';
    }

    calculateMedian(numbers) {
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculateStandardDeviation(numbers) {
        const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
        const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
        return Math.sqrt(avgSquaredDiff);
    }

    classifyDurationType(avgDuration) {
        if (avgDuration < 900) return 'short_burst'; // < 15分钟
        if (avgDuration < 2700) return 'medium_session'; // 15-45分钟
        return 'long_session'; // > 45分钟
    }

    sortPreferences(preferences) {
        return Object.entries(preferences)
                    .sort(([,a], [,b]) => b - a)
                    .map(([key, value]) => ({ type: key, count: value }));
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    calculateVolatility(values) {
        if (values.length < 2) return 0;
        return this.calculateStandardDeviation(values) / (values.reduce((a, b) => a + b, 0) / values.length);
    }
}

/**
 * 时间模式分析器
 */
class TemporalPatternAnalyzer {
    analyze(sessions) {
        // 实现时间模式分析逻辑
        return {
            pattern: 'temporal_analysis_result'
        };
    }
}

/**
 * 行为模式分析器
 */
class BehaviorPatternAnalyzer {
    analyze(sessions) {
        // 实现行为模式分析逻辑
        return {
            pattern: 'behavior_analysis_result'
        };
    }
}

/**
 * 表现模式分析器
 */
class PerformancePatternAnalyzer {
    analyze(sessions) {
        // 实现表现模式分析逻辑
        return {
            pattern: 'performance_analysis_result'
        };
    }
}

/**
 * 参与度模式分析器
 */
class EngagementPatternAnalyzer {
    analyze(sessions) {
        // 实现参与度模式分析逻辑
        return {
            pattern: 'engagement_analysis_result'
        };
    }
}

/**
 * 难度模式分析器
 */
class DifficultyPatternAnalyzer {
    analyze(sessions) {
        // 实现难度模式分析逻辑
        return {
            pattern: 'difficulty_analysis_result'
        };
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.LearningPatternRecognizer = LearningPatternRecognizer;
    console.log('🔍 学习模式识别系统已加载');
}
