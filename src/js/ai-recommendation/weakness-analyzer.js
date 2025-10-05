/**
 * 薄弱点分析器 - 核心AI算法模块
 * 实现多维度薄弱点识别和分析
 */

class WeaknessAnalyzer {
    constructor() {
        // 掌握度等级定义
        this.masteryLevels = {
            unknown: { score: 0, description: '完全不了解', color: '#f44336' },
            introduced: { score: 0.2, description: '已接触', color: '#ff9800' },
            developing: { score: 0.4, description: '发展中', color: '#ffc107' },
            proficient: { score: 0.7, description: '熟练', color: '#4caf50' },
            mastered: { score: 0.9, description: '精通', color: '#2196f3' },
            expert: { score: 1.0, description: '专家级', color: '#9c27b0' }
        };

        // 分析权重配置
        this.analysisWeights = {
            accuracy: 0.4,      // 准确率权重
            consistency: 0.3,   // 稳定性权重
            improvement: 0.2,   // 进步速度权重
            engagement: 0.1     // 参与度权重
        };

        // 薄弱点阈值
        this.weaknessThresholds = {
            accuracy: 0.7,      // 准确率低于70%
            consistency: 0.6,   // 稳定性低于60%
            improvement: 0.05   // 进步速度低于5%
        };

        // 遗忘曲线参数
        this.forgettingCurveParams = {
            initialStrength: 1.0,
            decayRate: 0.5,
            reviewBoost: 0.3
        };
        
        // 优化：性能统计
        this.stats = {
            analysesCompleted: 0,
            weaknessesIdentified: 0,
            avgAnalysisTime: 0,
            cacheHits: 0
        };
        
        // 优化：分析结果缓存
        this.analysisCache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10分钟
    }

    /**
     * 分析学习者薄弱点（优化版）
     * @param {Object} learnerData - 学习者数据
     * @returns {Object} 薄弱点分析结果
     */
    async analyzeWeaknesses(learnerData) {
        const logger = window.logger || console;
        const startTime = performance.now();
        
        logger.info('WeaknessAnalyzer', '开始分析学习薄弱点...');
        
        // 优化：检查缓存
        const cacheKey = this.generateCacheKey(learnerData);
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            this.stats.cacheHits++;
            logger.debug('WeaknessAnalyzer', '使用缓存的分析结果');
            return cached;
        }
        
        const analysis = {
            overall: {},
            vocabulary: {},
            grammar: {},
            listening: {},
            reading: {},
            recommendations: [],
            timestamp: Date.now()
        };

        try {
            // 优化：并行执行所有模块分析
            const [
                overall,
                vocabulary,
                grammar,
                listening,
                reading
            ] = await Promise.all([
                this.analyzeOverallWeaknesses(learnerData),
                this.analyzeVocabularyWeaknesses(learnerData.vocabulary || {}),
                this.analyzeGrammarWeaknesses(learnerData.grammar || {}),
                this.analyzeListeningWeaknesses(learnerData.listening || {}),
                this.analyzeReadingWeaknesses(learnerData.reading || {})
            ]);
            
            analysis.overall = overall;
            analysis.vocabulary = vocabulary;
            analysis.grammar = grammar;
            analysis.listening = listening;
            analysis.reading = reading;

            // 生成改进建议
            analysis.recommendations = this.generateRecommendations(analysis);
            
            // 统计薄弱点数量
            const weaknessCount = [vocabulary, grammar, listening, reading]
                .reduce((sum, module) => sum + (module.weaknesses?.length || 0), 0);
            this.stats.weaknessesIdentified += weaknessCount;
            
            // 缓存结果
            this.cacheResult(cacheKey, analysis);
            
            // 更新统计
            const duration = performance.now() - startTime;
            this.updateAvgAnalysisTime(duration);
            this.stats.analysesCompleted++;

            logger.info('WeaknessAnalyzer', `薄弱点分析完成，用时 ${duration.toFixed(2)}ms`);
            return analysis;

        } catch (error) {
            logger.error('WeaknessAnalyzer', '薄弱点分析失败:', error);
            throw error;
        }
    }

    /**
     * 生成缓存键
     */
    generateCacheKey(data) {
        const dataStr = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < dataStr.length; i++) {
            hash = ((hash << 5) - hash) + dataStr.charCodeAt(i);
            hash = hash & hash;
        }
        return `weakness_${Math.abs(hash).toString(16)}`;
    }

    /**
     * 获取缓存结果
     */
    getCachedResult(key) {
        const cached = this.analysisCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.result;
        }
        return null;
    }

    /**
     * 缓存分析结果
     */
    cacheResult(key, result) {
        if (this.analysisCache.size > 50) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
        
        this.analysisCache.set(key, {
            result,
            timestamp: Date.now()
        });
    }

    /**
     * 更新平均分析时间
     */
    updateAvgAnalysisTime(duration) {
        const count = this.stats.analysesCompleted;
        this.stats.avgAnalysisTime = (this.stats.avgAnalysisTime * count + duration) / (count + 1);
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const hitRate = (this.stats.analysesCompleted + this.stats.cacheHits) > 0
            ? ((this.stats.cacheHits / (this.stats.analysesCompleted + this.stats.cacheHits)) * 100).toFixed(2)
            : 0;
        
        return {
            ...this.stats,
            avgAnalysisTime: this.stats.avgAnalysisTime.toFixed(2) + 'ms',
            hitRate: `${hitRate}%`,
            cacheSize: this.analysisCache.size
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.analysisCache.clear();
        const logger = window.logger || console;
        logger.info('WeaknessAnalyzer', '资源已清理');
    }

    /**
     * 分析全局薄弱点
     */
    async analyzeOverallWeaknesses(learnerData) {
        const overall = {
            weaknessScore: 0,
            primaryWeaknesses: [],
            learningPatterns: {},
            cognitiveLoad: 0
        };

        // 计算各模块表现
        const modulePerformance = {
            vocabulary: this.calculateModulePerformance(learnerData.vocabulary || {}),
            grammar: this.calculateModulePerformance(learnerData.grammar || {}),
            listening: this.calculateModulePerformance(learnerData.listening || {}),
            reading: this.calculateModulePerformance(learnerData.reading || {})
        };

        // 识别主要薄弱点
        overall.primaryWeaknesses = Object.entries(modulePerformance)
            .filter(([module, score]) => score < this.weaknessThresholds.accuracy)
            .sort((a, b) => a[1] - b[1])
            .map(([module, score]) => ({
                module,
                score,
                severity: this.calculateSeverity(score),
                priority: this.calculatePriority(module, score)
            }));

        // 分析学习模式
        overall.learningPatterns = this.analyzeLearningPatterns(learnerData);

        // 评估认知负载
        overall.cognitiveLoad = this.assessCognitiveLoad(learnerData);

        // 计算综合薄弱度
        overall.weaknessScore = this.calculateOverallWeaknessScore(modulePerformance);

        return overall;
    }

    /**
     * 分析词汇薄弱点
     */
    async analyzeVocabularyWeaknesses(vocabularyData) {
        const analysis = {
            masteryDistribution: {},
            weaknessPatterns: [],
            forgettingRisk: {},
            improvementPriority: []
        };

        // 计算掌握度分布
        analysis.masteryDistribution = this.calculateMasteryDistribution(vocabularyData);

        // 识别薄弱模式
        analysis.weaknessPatterns = this.identifyVocabularyWeaknessPatterns(vocabularyData);

        // 预测遗忘风险
        analysis.forgettingRisk = this.predictForgettingRisk(vocabularyData);

        // 生成改进优先级
        analysis.improvementPriority = this.generateVocabularyImprovementPriority(vocabularyData);

        return analysis;
    }

    /**
     * 分析语法薄弱点
     */
    async analyzeGrammarWeaknesses(grammarData) {
        const analysis = {
            hierarchyMastery: {},
            errorAnalysis: {},
            prerequisiteGaps: [],
            learningPath: []
        };

        // 分析语法层次掌握度
        analysis.hierarchyMastery = this.analyzeGrammarHierarchy(grammarData);

        // 分析错误模式
        analysis.errorAnalysis = this.analyzeGrammarErrors(grammarData);

        // 识别前置知识缺口
        analysis.prerequisiteGaps = this.identifyPrerequisiteGaps(grammarData);

        // 生成学习路径
        analysis.learningPath = this.generateGrammarLearningPath(analysis);

        return analysis;
    }

    /**
     * 分析听力薄弱点
     */
    async analyzeListeningWeaknesses(listeningData) {
        const analysis = {
            skillBreakdown: {},
            difficultyAnalysis: {},
            speedAdaptation: {},
            comprehensionPatterns: {}
        };

        // 技能分解分析
        analysis.skillBreakdown = this.analyzeListeningSkills(listeningData);

        // 难度适应性分析
        analysis.difficultyAnalysis = this.analyzeListeningDifficulty(listeningData);

        // 语速适应分析
        analysis.speedAdaptation = this.analyzeSpeedAdaptation(listeningData);

        // 理解模式分析
        analysis.comprehensionPatterns = this.analyzeComprehensionPatterns(listeningData);

        return analysis;
    }

    /**
     * 分析阅读薄弱点
     */
    async analyzeReadingWeaknesses(readingData) {
        const analysis = {
            speedVsAccuracy: {},
            comprehensionLevels: {},
            vocabularyGaps: {},
            strategicReading: {}
        };

        // 速度与准确率分析
        analysis.speedVsAccuracy = this.analyzeReadingSpeedAccuracy(readingData);

        // 理解层次分析
        analysis.comprehensionLevels = this.analyzeComprehensionLevels(readingData);

        // 词汇缺口分析
        analysis.vocabularyGaps = this.analyzeReadingVocabularyGaps(readingData);

        // 策略性阅读分析
        analysis.strategicReading = this.analyzeStrategicReading(readingData);

        return analysis;
    }

    /**
     * 计算模块表现
     */
    calculateModulePerformance(moduleData) {
        if (!moduleData.responses || moduleData.responses.length === 0) {
            return 0.5; // 默认中等水平
        }

        const recentResponses = moduleData.responses.slice(-20); // 最近20次响应
        const accuracy = recentResponses.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0) / recentResponses.length;
        
        // 考虑时间衰减
        const timeDecay = this.calculateTimeDecay(recentResponses);
        
        return accuracy * timeDecay;
    }

    /**
     * 计算时间衰减
     */
    calculateTimeDecay(responses) {
        if (responses.length === 0) return 1;

        const now = Date.now();
        const weightedSum = responses.reduce((sum, response, index) => {
            const timeDiff = now - (response.timestamp || now);
            const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
            const timeWeight = Math.exp(-daysDiff / 7); // 7天半衰期
            return sum + timeWeight;
        }, 0);

        return Math.min(1, weightedSum / responses.length);
    }

    /**
     * 分析学习模式
     */
    analyzeLearningPatterns(learnerData) {
        const patterns = {
            consistency: 0,
            studyTimeDistribution: {},
            difficultyPreference: '',
            engagementLevel: 0
        };

        // 学习一致性分析
        patterns.consistency = this.calculateLearningConsistency(learnerData);

        // 学习时间分布
        patterns.studyTimeDistribution = this.analyzeStudyTimeDistribution(learnerData);

        // 难度偏好分析
        patterns.difficultyPreference = this.analyzeDifficultyPreference(learnerData);

        // 参与度分析
        patterns.engagementLevel = this.calculateEngagementLevel(learnerData);

        return patterns;
    }

    /**
     * 评估认知负载
     */
    assessCognitiveLoad(learnerData) {
        const loadFactors = {
            taskComplexity: this.calculateTaskComplexity(learnerData),
            responseTime: this.analyzeResponseTimes(learnerData),
            errorRate: this.calculateErrorRate(learnerData),
            helpRequests: this.analyzeHelpRequests(learnerData)
        };

        // 综合认知负载评分
        const cognitiveLoad = Object.values(loadFactors).reduce((sum, value) => sum + value, 0) / Object.keys(loadFactors).length;
        
        return Math.max(0, Math.min(1, cognitiveLoad));
    }

    /**
     * 识别词汇薄弱模式
     */
    identifyVocabularyWeaknessPatterns(vocabularyData) {
        const patterns = [];

        // 按词频分析
        const frequencyAnalysis = this.analyzeByFrequency(vocabularyData);
        if (frequencyAnalysis.weaknessDetected) {
            patterns.push({
                type: 'frequency',
                description: '高频词汇掌握不足',
                severity: frequencyAnalysis.severity,
                affectedWords: frequencyAnalysis.weakWords
            });
        }

        // 按词长分析
        const lengthAnalysis = this.analyzeByWordLength(vocabularyData);
        if (lengthAnalysis.weaknessDetected) {
            patterns.push({
                type: 'length',
                description: '长单词记忆困难',
                severity: lengthAnalysis.severity,
                affectedWords: lengthAnalysis.weakWords
            });
        }

        // 按词性分析
        const posAnalysis = this.analyzeByPartOfSpeech(vocabularyData);
        if (posAnalysis.weaknessDetected) {
            patterns.push({
                type: 'part_of_speech',
                description: `${posAnalysis.weakestPOS}词性掌握薄弱`,
                severity: posAnalysis.severity,
                affectedWords: posAnalysis.weakWords
            });
        }

        return patterns.sort((a, b) => b.severity - a.severity);
    }

    /**
     * 预测遗忘风险
     */
    predictForgettingRisk(vocabularyData) {
        const riskAnalysis = {};

        if (vocabularyData.words) {
            vocabularyData.words.forEach(word => {
                const timeSinceLastReview = Date.now() - (word.lastReviewTime || Date.now());
                const reviewCount = word.reviewHistory ? word.reviewHistory.length : 0;
                const averageAccuracy = this.calculateAverageAccuracy(word.reviewHistory || []);

                // 使用遗忘曲线模型
                const currentMemoryStrength = this.calculateMemoryStrength(
                    word.initialStrength || 0.5,
                    timeSinceLastReview,
                    reviewCount,
                    averageAccuracy
                );

                const forgettingTime = this.predictForgettingTime(currentMemoryStrength, word.difficulty || 0.5);

                riskAnalysis[word.id] = {
                    currentStrength: currentMemoryStrength,
                    forgettingTime: forgettingTime,
                    riskLevel: this.calculateRiskLevel(currentMemoryStrength, forgettingTime)
                };
            });
        }

        return riskAnalysis;
    }

    /**
     * 生成改进建议
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // 基于整体分析生成建议
        if (analysis.overall.weaknessScore > 0.6) {
            recommendations.push({
                type: 'overall',
                priority: 'high',
                title: '需要全面提升学习策略',
                description: '建议调整学习方法，专注于薄弱环节',
                actions: ['重新评估学习目标', '调整学习计划', '增加练习时间']
            });
        }

        // 基于各模块分析生成具体建议
        analysis.overall.primaryWeaknesses.forEach(weakness => {
            recommendations.push({
                type: weakness.module,
                priority: weakness.priority,
                title: `${this.getModuleName(weakness.module)}需要重点关注`,
                description: `当前掌握度较低，建议加强练习`,
                actions: this.getModuleSpecificActions(weakness.module, weakness.score)
            });
        });

        // 排序建议（按优先级）
        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    /**
     * 获取模块名称
     */
    getModuleName(module) {
        const names = {
            vocabulary: '词汇学习',
            grammar: '语法练习',
            listening: '听力训练',
            reading: '阅读理解'
        };
        return names[module] || module;
    }

    /**
     * 获取模块特定的改进行动
     */
    getModuleSpecificActions(module, score) {
        const actions = {
            vocabulary: [
                '增加单词学习频率',
                '使用记忆卡片练习',
                '在语境中学习词汇',
                '加强词汇复习'
            ],
            grammar: [
                '回顾基础语法规则',
                '增加语法练习量',
                '分析错误模式',
                '逐步提高练习难度'
            ],
            listening: [
                '从慢速听力开始',
                '重复听同一材料',
                '练习关键词捕捉',
                '结合字幕学习'
            ],
            reading: [
                '提高阅读词汇量',
                '练习快速阅读技巧',
                '加强理解策略',
                '分析文章结构'
            ]
        };

        return actions[module] || ['加强基础练习', '提高练习频率'];
    }

    /**
     * 计算严重程度
     */
    calculateSeverity(score) {
        if (score < 0.3) return 'high';
        if (score < 0.5) return 'medium';
        return 'low';
    }

    /**
     * 计算优先级
     */
    calculatePriority(module, score) {
        // 词汇和语法是基础，优先级更高
        const moduleWeight = {
            vocabulary: 1.2,
            grammar: 1.1,
            listening: 1.0,
            reading: 1.0
        };

        const adjustedScore = score * (moduleWeight[module] || 1.0);
        
        if (adjustedScore < 0.4) return 'high';
        if (adjustedScore < 0.6) return 'medium';
        return 'low';
    }

    /**
     * 计算记忆强度
     */
    calculateMemoryStrength(initialStrength, timeSinceReview, reviewCount, averageAccuracy) {
        const timeDays = timeSinceReview / (1000 * 60 * 60 * 24);
        const decayFactor = Math.exp(-this.forgettingCurveParams.decayRate * timeDays);
        const reviewBoost = Math.min(1, reviewCount * this.forgettingCurveParams.reviewBoost);
        
        return Math.min(1, Math.max(0, initialStrength * decayFactor * (1 + reviewBoost) * averageAccuracy));
    }

    /**
     * 计算平均准确率
     */
    calculateAverageAccuracy(reviewHistory) {
        if (!reviewHistory || reviewHistory.length === 0) return 0.5;
        
        const accuracySum = reviewHistory.reduce((sum, review) => sum + (review.correct ? 1 : 0), 0);
        return accuracySum / reviewHistory.length;
    }

    /**
     * 预测遗忘时间
     */
    predictForgettingTime(currentStrength, difficulty) {
        const baseTime = 24 * 60 * 60 * 1000; // 24小时基础时间
        const strengthFactor = Math.pow(currentStrength, 2);
        const difficultyFactor = 1 - difficulty;
        
        return baseTime * strengthFactor * difficultyFactor;
    }

    /**
     * 计算风险等级
     */
    calculateRiskLevel(currentStrength, forgettingTime) {
        const hoursToForget = forgettingTime / (1000 * 60 * 60);
        
        if (hoursToForget < 24 && currentStrength < 0.3) return 'high';
        if (hoursToForget < 72 && currentStrength < 0.5) return 'medium';
        return 'low';
    }

    // 辅助分析方法
    calculateMasteryDistribution(vocabularyData) {
        // 实现掌握度分布计算
        return {
            expert: 0,
            mastered: 0,
            proficient: 0,
            developing: 0,
            introduced: 0,
            unknown: 0
        };
    }

    analyzeByFrequency(vocabularyData) {
        // 实现按词频分析
        return {
            weaknessDetected: false,
            severity: 0,
            weakWords: []
        };
    }

    analyzeByWordLength(vocabularyData) {
        // 实现按词长分析
        return {
            weaknessDetected: false,
            severity: 0,
            weakWords: []
        };
    }

    analyzeByPartOfSpeech(vocabularyData) {
        // 实现按词性分析
        return {
            weaknessDetected: false,
            severity: 0,
            weakestPOS: '',
            weakWords: []
        };
    }

    generateVocabularyImprovementPriority(vocabularyData) {
        // 生成词汇改进优先级
        return [];
    }

    analyzeGrammarHierarchy(grammarData) {
        // 分析语法层次
        return {};
    }

    analyzeGrammarErrors(grammarData) {
        // 分析语法错误
        return {};
    }

    identifyPrerequisiteGaps(grammarData) {
        // 识别前置知识缺口
        return [];
    }

    generateGrammarLearningPath(analysis) {
        // 生成语法学习路径
        return [];
    }

    analyzeListeningSkills(listeningData) {
        // 分析听力技能
        return {};
    }

    analyzeListeningDifficulty(listeningData) {
        // 分析听力难度
        return {};
    }

    analyzeSpeedAdaptation(listeningData) {
        // 分析语速适应
        return {};
    }

    analyzeComprehensionPatterns(listeningData) {
        // 分析理解模式
        return {};
    }

    analyzeReadingSpeedAccuracy(readingData) {
        // 分析阅读速度准确率
        return {};
    }

    analyzeComprehensionLevels(readingData) {
        // 分析理解层次
        return {};
    }

    analyzeReadingVocabularyGaps(readingData) {
        // 分析阅读词汇缺口
        return {};
    }

    analyzeStrategicReading(readingData) {
        // 分析策略性阅读
        return {};
    }

    calculateLearningConsistency(learnerData) {
        // 计算学习一致性
        return 0.5;
    }

    analyzeStudyTimeDistribution(learnerData) {
        // 分析学习时间分布
        return {};
    }

    analyzeDifficultyPreference(learnerData) {
        // 分析难度偏好
        return 'medium';
    }

    calculateEngagementLevel(learnerData) {
        // 计算参与度
        return 0.5;
    }

    calculateTaskComplexity(learnerData) {
        // 计算任务复杂度
        return 0.5;
    }

    analyzeResponseTimes(learnerData) {
        // 分析响应时间
        return 0.5;
    }

    calculateErrorRate(learnerData) {
        // 计算错误率
        return 0.3;
    }

    analyzeHelpRequests(learnerData) {
        // 分析求助请求
        return 0.2;
    }

    calculateOverallWeaknessScore(modulePerformance) {
        // 计算总体薄弱度
        const scores = Object.values(modulePerformance);
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return 1 - averageScore; // 薄弱度 = 1 - 平均表现
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeaknessAnalyzer;
} else {
    window.WeaknessAnalyzer = WeaknessAnalyzer;
}
