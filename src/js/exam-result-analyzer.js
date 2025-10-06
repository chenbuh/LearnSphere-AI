/**
 * 考试结果分析器
 * 提供详细的错题分析和学习建议
 */
class ExamResultAnalyzer {
    constructor() {
        this.analysisCache = new Map();
        this.difficultyWeights = {
            easy: 1,
            medium: 1.5,
            hard: 2,
            expert: 2.5
        };
        this.init();
    }

    init() {
        console.log('📊 考试结果分析器已初始化');
    }

    /**
     * 分析考试结果
     */
    analyzeExamResult(examResult, reviewData = []) {
        if (!examResult) return null;

        const analysis = {
            basic: this.calculateBasicStats(examResult),
            detailed: this.analyzeBySection(examResult),
            mistakes: this.analyzeMistakes(reviewData),
            strengths: this.identifyStrengths(examResult, reviewData),
            weaknesses: this.identifyWeaknesses(examResult, reviewData),
            recommendations: this.generateRecommendations(examResult, reviewData),
            trends: this.analyzeTrends(examResult),
            timeAnalysis: this.analyzeTimeUsage(examResult),
            difficultyAnalysis: this.analyzeDifficulty(reviewData),
            improvement: this.calculateImprovement(examResult)
        };

        // 缓存分析结果
        this.analysisCache.set(examResult.examId, analysis);

        return analysis;
    }

    /**
     * 计算基础统计信息
     */
    calculateBasicStats(examResult) {
        const { overall, sections } = examResult;
        
        return {
            totalScore: overall.totalScore,
            maxScore: overall.maxScore,
            percentage: Math.round((overall.totalScore / overall.maxScore) * 100),
            accuracy: Math.round(overall.accuracy),
            completionRate: Math.round(overall.completionRate),
            grade: overall.grade,
            passed: overall.passed,
            duration: this.formatDuration(examResult.duration),
            averageTimePerQuestion: Math.round(examResult.duration / examResult.totalQuestions),
            sectionsCount: Object.keys(sections).length
        };
    }

    /**
     * 按部分分析
     */
    analyzeBySection(examResult) {
        const { sections } = examResult;
        const sectionAnalysis = {};

        for (const [sectionType, stats] of Object.entries(sections)) {
            const accuracy = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
            const completionRate = stats.total > 0 ? (stats.answered / stats.total) * 100 : 0;
            
            sectionAnalysis[sectionType] = {
                name: stats.name,
                score: Math.round(stats.score),
                maxScore: stats.maxScore,
                percentage: stats.maxScore > 0 ? Math.round((stats.score / stats.maxScore) * 100) : 0,
                accuracy: Math.round(accuracy),
                completionRate: Math.round(completionRate),
                correct: stats.correct,
                total: stats.total,
                answered: stats.answered,
                performance: this.categorizePerformance(accuracy),
                recommendations: this.getSectionRecommendations(sectionType, accuracy, completionRate)
            };
        }

        return sectionAnalysis;
    }

    /**
     * 分析错题
     */
    analyzeMistakes(reviewData) {
        const mistakes = reviewData.filter(item => !item.correct);
        
        if (mistakes.length === 0) {
            return {
                count: 0,
                percentage: 0,
                bySection: {},
                byDifficulty: {},
                commonPatterns: [],
                suggestions: ['恭喜！本次考试全部答对，继续保持！']
            };
        }

        const bySection = {};
        const byDifficulty = {};
        const patterns = [];

        mistakes.forEach(mistake => {
            // 按部分统计
            if (!bySection[mistake.section]) {
                bySection[mistake.section] = { count: 0, questions: [] };
            }
            bySection[mistake.section].count++;
            bySection[mistake.section].questions.push(mistake);

            // 按难度统计
            const difficulty = mistake.difficulty || 'medium';
            if (!byDifficulty[difficulty]) {
                byDifficulty[difficulty] = { count: 0, questions: [] };
            }
            byDifficulty[difficulty].count++;
            byDifficulty[difficulty].questions.push(mistake);

            // 错误模式分析
            if (mistake.userAnswer !== null && mistake.correctAnswer !== null) {
                patterns.push({
                    section: mistake.section,
                    difficulty: difficulty,
                    type: this.classifyMistakeType(mistake)
                });
            }
        });

        const totalQuestions = reviewData.length;
        const mistakePercentage = Math.round((mistakes.length / totalQuestions) * 100);

        return {
            count: mistakes.length,
            percentage: mistakePercentage,
            bySection,
            byDifficulty,
            commonPatterns: this.identifyCommonPatterns(patterns),
            suggestions: this.generateMistakeSuggestions(bySection, byDifficulty, patterns)
        };
    }

    /**
     * 识别优势
     */
    identifyStrengths(examResult, reviewData) {
        const { sections } = examResult;
        const strengths = [];

        // 分析各部分表现
        for (const [sectionType, stats] of Object.entries(sections)) {
            const accuracy = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
            
            if (accuracy >= 80) {
                strengths.push({
                    type: 'section',
                    section: sectionType,
                    name: stats.name,
                    accuracy: Math.round(accuracy),
                    description: `${stats.name}表现优秀，正确率达到${Math.round(accuracy)}%`
                });
            }
        }

        // 分析难度掌握情况
        const difficultyStats = this.analyzeDifficultyPerformance(reviewData);
        for (const [difficulty, stats] of Object.entries(difficultyStats)) {
            if (stats.accuracy >= 75 && stats.count >= 3) {
                strengths.push({
                    type: 'difficulty',
                    difficulty,
                    accuracy: Math.round(stats.accuracy),
                    count: stats.count,
                    description: `${this.getDifficultyName(difficulty)}题目掌握良好，正确率${Math.round(stats.accuracy)}%`
                });
            }
        }

        // 时间管理分析
        const avgTimePerQuestion = examResult.duration / examResult.totalQuestions;
        if (avgTimePerQuestion <= 90 && examResult.overall.accuracy >= 70) { // 平均每题90秒以内且准确率不低
            strengths.push({
                type: 'time',
                description: '时间管理能力强，能够在有限时间内保持较高准确率'
            });
        }

        return strengths;
    }

    /**
     * 识别弱点
     */
    identifyWeaknesses(examResult, reviewData) {
        const { sections } = examResult;
        const weaknesses = [];

        // 分析各部分表现
        for (const [sectionType, stats] of Object.entries(sections)) {
            const accuracy = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
            const completionRate = stats.total > 0 ? (stats.answered / stats.total) * 100 : 0;
            
            if (accuracy < 60) {
                weaknesses.push({
                    type: 'accuracy',
                    section: sectionType,
                    name: stats.name,
                    accuracy: Math.round(accuracy),
                    severity: accuracy < 40 ? 'high' : 'medium',
                    description: `${stats.name}正确率偏低(${Math.round(accuracy)}%)，需要重点加强`
                });
            }

            if (completionRate < 80) {
                weaknesses.push({
                    type: 'completion',
                    section: sectionType,
                    name: stats.name,
                    completionRate: Math.round(completionRate),
                    severity: completionRate < 60 ? 'high' : 'medium',
                    description: `${stats.name}完成度不足(${Math.round(completionRate)}%)，可能存在时间管理问题`
                });
            }
        }

        // 分析难度掌握情况
        const difficultyStats = this.analyzeDifficultyPerformance(reviewData);
        for (const [difficulty, stats] of Object.entries(difficultyStats)) {
            if (stats.accuracy < 50 && stats.count >= 3) {
                weaknesses.push({
                    type: 'difficulty',
                    difficulty,
                    accuracy: Math.round(stats.accuracy),
                    count: stats.count,
                    severity: stats.accuracy < 30 ? 'high' : 'medium',
                    description: `${this.getDifficultyName(difficulty)}题目掌握不足，正确率仅${Math.round(stats.accuracy)}%`
                });
            }
        }

        return weaknesses;
    }

    /**
     * 生成学习建议
     */
    generateRecommendations(examResult, reviewData) {
        const recommendations = [];
        const { overall, sections } = examResult;

        // 整体表现建议
        if (overall.accuracy < 60) {
            recommendations.push({
                priority: 'high',
                category: 'overall',
                title: '基础知识巩固',
                description: '整体正确率偏低，建议系统复习基础知识，加强基本概念的理解',
                actions: [
                    '制定详细的复习计划',
                    '重点复习错题涉及的知识点',
                    '增加基础练习的频率',
                    '寻求老师或同学的帮助'
                ]
            });
        } else if (overall.accuracy < 80) {
            recommendations.push({
                priority: 'medium',
                category: 'overall',
                title: '提升解题技巧',
                description: '基础掌握尚可，但需要提高解题准确率和效率',
                actions: [
                    '分析错题原因，总结解题规律',
                    '练习更多同类型题目',
                    '提高审题仔细程度',
                    '掌握常见题型的解题技巧'
                ]
            });
        }

        // 分部分建议
        for (const [sectionType, stats] of Object.entries(sections)) {
            const accuracy = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
            const sectionRec = this.getSectionSpecificRecommendations(sectionType, stats, accuracy);
            if (sectionRec) {
                recommendations.push(sectionRec);
            }
        }

        // 时间管理建议
        const avgTimePerQuestion = examResult.duration / examResult.totalQuestions;
        if (overall.completionRate < 90) {
            recommendations.push({
                priority: 'medium',
                category: 'time',
                title: '时间管理优化',
                description: '考试完成度不足，需要改善时间分配策略',
                actions: [
                    '练习在限定时间内答题',
                    '学会合理分配各部分时间',
                    '优先完成有把握的题目',
                    '避免在难题上花费过多时间'
                ]
            });
        }

        // 难度适应建议
        const difficultyStats = this.analyzeDifficultyPerformance(reviewData);
        const hardQuestionAccuracy = difficultyStats.hard?.accuracy || 0;
        if (hardQuestionAccuracy < 40 && difficultyStats.hard?.count > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'difficulty',
                title: '挑战性题目训练',
                description: '高难度题目表现不佳，需要针对性提升',
                actions: [
                    '逐步增加练习题目难度',
                    '深入理解解题思路和方法',
                    '多做综合性和应用性题目',
                    '培养逻辑分析能力'
                ]
            });
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * 分析学习趋势
     */
    analyzeTrends(examResult) {
        // 从历史记录中获取趋势数据
        const history = this.getExamHistory(examResult.examType);
        
        if (history.length < 2) {
            return {
                available: false,
                message: '需要更多考试记录才能分析趋势'
            };
        }

        const recent = history.slice(0, 5); // 最近5次
        const scores = recent.map(exam => (exam.overall.totalScore / exam.overall.maxScore) * 100);
        
        const trend = this.calculateTrend(scores);
        const improvement = scores[0] - scores[scores.length - 1]; // 最新 - 最旧

        return {
            available: true,
            trend: trend,
            improvement: Math.round(improvement),
            recentScores: scores.map(s => Math.round(s)),
            analysis: this.interpretTrend(trend, improvement),
            suggestions: this.getTrendSuggestions(trend, improvement)
        };
    }

    /**
     * 分析时间使用
     */
    analyzeTimeUsage(examResult) {
        const totalTime = examResult.duration;
        const totalQuestions = examResult.totalQuestions;
        const avgTimePerQuestion = totalTime / totalQuestions;

        // 理想时间分配（基于考试类型）
        const idealTime = this.getIdealTimePerQuestion(examResult.examType);
        const timeEfficiency = idealTime / avgTimePerQuestion;

        return {
            totalTime: this.formatDuration(totalTime),
            avgTimePerQuestion: Math.round(avgTimePerQuestion),
            idealTimePerQuestion: idealTime,
            efficiency: Math.round(timeEfficiency * 100),
            evaluation: this.evaluateTimeUsage(timeEfficiency),
            suggestions: this.getTimeUsageSuggestions(timeEfficiency, examResult.overall.completionRate)
        };
    }

    /**
     * 分析难度表现
     */
    analyzeDifficulty(reviewData) {
        const difficultyStats = this.analyzeDifficultyPerformance(reviewData);
        const analysis = {};

        for (const [difficulty, stats] of Object.entries(difficultyStats)) {
            analysis[difficulty] = {
                name: this.getDifficultyName(difficulty),
                accuracy: Math.round(stats.accuracy),
                count: stats.count,
                performance: this.categorizePerformance(stats.accuracy),
                weight: this.difficultyWeights[difficulty] || 1
            };
        }

        return analysis;
    }

    /**
     * 计算进步情况
     */
    calculateImprovement(examResult) {
        const history = this.getExamHistory(examResult.examType);
        
        if (history.length < 2) {
            return {
                available: false,
                message: '需要更多考试记录才能计算进步情况'
            };
        }

        const current = (examResult.overall.totalScore / examResult.overall.maxScore) * 100;
        const previous = (history[1].overall.totalScore / history[1].overall.maxScore) * 100;
        const improvement = current - previous;

        const bestScore = Math.max(...history.map(exam => 
            (exam.overall.totalScore / exam.overall.maxScore) * 100
        ));

        return {
            available: true,
            currentScore: Math.round(current),
            previousScore: Math.round(previous),
            improvement: Math.round(improvement),
            bestScore: Math.round(bestScore),
            isPersonalBest: current >= bestScore,
            improvementType: this.categorizeImprovement(improvement),
            message: this.getImprovementMessage(improvement, current >= bestScore)
        };
    }

    // 辅助方法

    /**
     * 分类错误类型
     */
    classifyMistakeType(mistake) {
        // 基于选项分析错误类型
        const userAnswer = mistake.userAnswer;
        const correctAnswer = mistake.correctAnswer;
        
        if (userAnswer === null || userAnswer === undefined) {
            return 'unanswered';
        }
        
        // 这里可以根据具体题目类型进行更详细的分类
        return 'incorrect_choice';
    }

    /**
     * 识别常见错误模式
     */
    identifyCommonPatterns(patterns) {
        const patternCount = {};
        
        patterns.forEach(pattern => {
            const key = `${pattern.section}_${pattern.type}`;
            patternCount[key] = (patternCount[key] || 0) + 1;
        });

        return Object.entries(patternCount)
            .filter(([, count]) => count >= 2)
            .map(([pattern, count]) => ({
                pattern,
                count,
                description: this.getPatternDescription(pattern)
            }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * 生成错题建议
     */
    generateMistakeSuggestions(bySection, byDifficulty, patterns) {
        const suggestions = [];

        // 基于部分的建议
        const worstSection = Object.entries(bySection)
            .sort((a, b) => b[1].count - a[1].count)[0];
        
        if (worstSection) {
            suggestions.push(`重点复习${worstSection[0]}部分，错误率较高`);
        }

        // 基于难度的建议
        const difficultyIssues = Object.entries(byDifficulty)
            .filter(([, data]) => data.count >= 3);
        
        if (difficultyIssues.length > 0) {
            const mainDifficulty = difficultyIssues[0][0];
            suggestions.push(`加强${this.getDifficultyName(mainDifficulty)}题目的练习`);
        }

        return suggestions;
    }

    /**
     * 分析难度表现
     */
    analyzeDifficultyPerformance(reviewData) {
        const stats = {};
        
        reviewData.forEach(item => {
            const difficulty = item.difficulty || 'medium';
            if (!stats[difficulty]) {
                stats[difficulty] = { correct: 0, total: 0 };
            }
            
            stats[difficulty].total++;
            if (item.correct) {
                stats[difficulty].correct++;
            }
        });

        const result = {};
        for (const [difficulty, data] of Object.entries(stats)) {
            result[difficulty] = {
                accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0,
                count: data.total,
                correct: data.correct
            };
        }

        return result;
    }

    /**
     * 获取部分特定建议
     */
    getSectionSpecificRecommendations(sectionType, stats, accuracy) {
        if (accuracy >= 75) return null;

        const recommendations = {
            listening: {
                title: '听力理解提升',
                description: '听力部分需要加强，建议多练习听力材料',
                actions: [
                    '每天坚持听英语材料30分钟以上',
                    '练习不同口音和语速的听力内容',
                    '提高对关键信息的捕捉能力',
                    '学习常见听力题型的解题技巧'
                ]
            },
            reading: {
                title: '阅读理解强化',
                description: '阅读理解能力有待提高',
                actions: [
                    '增加英语阅读量，提高阅读速度',
                    '学习快速定位关键信息的方法',
                    '练习不同类型文章的阅读策略',
                    '扩大词汇量，减少生词障碍'
                ]
            },
            writing: {
                title: '写作能力提升',
                description: '写作表达需要进一步完善',
                actions: [
                    '学习和掌握各种写作结构和模板',
                    '提高语法准确性和词汇丰富度',
                    '多练习不同类型的写作题目',
                    '注重逻辑性和连贯性的表达'
                ]
            }
        };

        const rec = recommendations[sectionType];
        if (rec) {
            return {
                priority: accuracy < 50 ? 'high' : 'medium',
                category: 'section',
                section: sectionType,
                ...rec
            };
        }

        return null;
    }

    /**
     * 格式化时长
     */
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    }

    /**
     * 分类表现水平
     */
    categorizePerformance(accuracy) {
        if (accuracy >= 90) return 'excellent';
        if (accuracy >= 80) return 'good';
        if (accuracy >= 70) return 'average';
        if (accuracy >= 60) return 'below_average';
        return 'poor';
    }

    /**
     * 获取难度名称
     */
    getDifficultyName(difficulty) {
        const names = {
            easy: '简单',
            medium: '中等',
            hard: '困难',
            expert: '专家级'
        };
        return names[difficulty] || '未知';
    }

    /**
     * 获取考试历史
     */
    getExamHistory(examType) {
        // 这里应该从实际的历史记录中获取数据
        if (window.examSimulatorManager) {
            return window.examSimulatorManager.getExamHistory()
                .filter(exam => exam.examType === examType);
        }
        return [];
    }

    /**
     * 计算趋势
     */
    calculateTrend(scores) {
        if (scores.length < 2) return 'stable';
        
        let increases = 0;
        let decreases = 0;
        
        for (let i = 1; i < scores.length; i++) {
            if (scores[i-1] > scores[i]) increases++;
            else if (scores[i-1] < scores[i]) decreases++;
        }
        
        if (increases > decreases) return 'improving';
        if (decreases > increases) return 'declining';
        return 'stable';
    }

    /**
     * 解释趋势
     */
    interpretTrend(trend, improvement) {
        const messages = {
            improving: `成绩呈上升趋势，平均提升${Math.abs(improvement)}分`,
            declining: `成绩有所下降，平均下降${Math.abs(improvement)}分`,
            stable: '成绩保持稳定，波动较小'
        };
        return messages[trend] || '趋势不明确';
    }

    /**
     * 获取趋势建议
     */
    getTrendSuggestions(trend, improvement) {
        const suggestions = {
            improving: [
                '保持当前的学习方法和节奏',
                '继续巩固已掌握的知识点',
                '适当增加练习难度',
                '保持学习的积极性和信心'
            ],
            declining: [
                '分析最近学习中的问题',
                '调整学习方法和策略',
                '增加复习时间和频率',
                '寻求帮助解决薄弱环节'
            ],
            stable: [
                '尝试新的学习方法突破瓶颈',
                '增加练习的多样性',
                '重点攻克薄弱知识点',
                '设定更具挑战性的目标'
            ]
        };
        return suggestions[trend] || [];
    }

    /**
     * 获取理想答题时间
     */
    getIdealTimePerQuestion(examType) {
        const idealTimes = {
            cet4: 90,
            cet6: 90,
            ielts: 120,
            toefl: 105,
            postgraduate: 180
        };
        return idealTimes[examType] || 90;
    }

    /**
     * 评估时间使用
     */
    evaluateTimeUsage(efficiency) {
        if (efficiency > 1.2) return 'too_fast';
        if (efficiency > 0.8) return 'optimal';
        if (efficiency > 0.6) return 'acceptable';
        return 'too_slow';
    }

    /**
     * 获取时间使用建议
     */
    getTimeUsageSuggestions(efficiency, completionRate) {
        if (efficiency > 1.2) {
            return ['答题速度较快，可以多花时间检查答案', '注意审题仔细程度'];
        } else if (efficiency < 0.6) {
            return ['提高答题速度', '学会快速排除明显错误选项', '合理分配时间'];
        } else if (completionRate < 90) {
            return ['改善时间管理', '优先完成有把握的题目'];
        }
        return ['时间控制良好，继续保持'];
    }

    /**
     * 分类进步情况
     */
    categorizeImprovement(improvement) {
        if (improvement >= 10) return 'significant';
        if (improvement >= 5) return 'moderate';
        if (improvement >= -5) return 'stable';
        if (improvement >= -10) return 'slight_decline';
        return 'significant_decline';
    }

    /**
     * 获取进步信息
     */
    getImprovementMessage(improvement, isPersonalBest) {
        if (isPersonalBest) {
            return '恭喜！这是您的最佳成绩！';
        } else if (improvement >= 5) {
            return '成绩有明显提升，继续加油！';
        } else if (improvement >= 0) {
            return '成绩保持稳定，可以尝试更大的突破';
        } else {
            return '成绩有所下降，建议调整学习策略';
        }
    }

    /**
     * 获取模式描述
     */
    getPatternDescription(pattern) {
        const descriptions = {
            'listening_incorrect_choice': '听力选择题错误较多',
            'reading_incorrect_choice': '阅读理解选择错误',
            'writing_unanswered': '写作题目未完成',
            'translation_incorrect_choice': '翻译理解有误'
        };
        return descriptions[pattern] || '未知错误模式';
    }

    /**
     * 获取分析缓存
     */
    getCachedAnalysis(examId) {
        return this.analysisCache.get(examId);
    }

    /**
     * 清理分析缓存
     */
    clearAnalysisCache() {
        this.analysisCache.clear();
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.ExamResultAnalyzer = ExamResultAnalyzer;
    console.log('📊 考试结果分析器已加载');
}
