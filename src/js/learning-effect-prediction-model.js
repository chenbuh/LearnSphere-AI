/**
 * 学习效果预测模型
 * 使用机器学习和统计学方法预测学习效果和表现
 */
class LearningEffectPredictionModel {
    constructor() {
        this.models = {
            performance: new PerformancePredictionModel(),
            retention: new RetentionPredictionModel(),
            engagement: new EngagementPredictionModel(),
            difficulty: new DifficultyAdaptationModel(),
            timeToMastery: new TimeToMasteryModel(),
            riskAssessment: new LearningRiskModel()
        };
        
        this.featureExtractor = new LearningFeatureExtractor();
        this.dataPreprocessor = new LearningDataPreprocessor();
        this.modelValidator = new ModelValidator();
        
        this.isInitialized = false;
        this.modelAccuracy = {};
        
        this.init();
    }

    async init() {
        console.log('🔮 学习效果预测模型初始化中...');
        
        try {
            // 初始化各个预测模型
            await this.initializeModels();
            
            // 加载历史数据进行模型训练
            await this.loadTrainingData();
            
            // 验证模型准确性
            await this.validateModels();
            
            this.isInitialized = true;
            console.log('✅ 学习效果预测模型初始化完成');
            
        } catch (error) {
            console.warn('⚠️ 预测模型初始化失败，将使用基础统计方法:', error);
            this.isInitialized = false;
        }
    }

    /**
     * 预测学习效果
     */
    async predictLearningEffects(learningData, predictionHorizon = '1week') {
        console.log('🔮 开始预测学习效果...');
        
        try {
            // 预处理数据
            const processedData = await this.dataPreprocessor.process(learningData);
            
            // 提取特征
            const features = await this.featureExtractor.extract(processedData);
            
            // 执行各种预测
            const predictions = {
                performance: await this.predictPerformance(features, predictionHorizon),
                retention: await this.predictRetention(features, predictionHorizon),
                engagement: await this.predictEngagement(features, predictionHorizon),
                difficultyAdaptation: await this.predictDifficultyAdaptation(features, predictionHorizon),
                timeToMastery: await this.predictTimeToMastery(features),
                riskAssessment: await this.assessLearningRisks(features, predictionHorizon),
                
                // 综合预测
                overallOutlook: null,
                recommendations: [],
                confidence: null
            };

            // 生成综合预测
            predictions.overallOutlook = this.generateOverallOutlook(predictions);
            
            // 基于预测生成建议
            predictions.recommendations = this.generatePredictionBasedRecommendations(predictions);
            
            // 计算预测置信度
            predictions.confidence = this.calculatePredictionConfidence(predictions, features);

            console.log('✅ 学习效果预测完成');
            return {
                predictions,
                metadata: {
                    predictionDate: new Date().toISOString(),
                    horizon: predictionHorizon,
                    modelVersion: this.getModelVersion(),
                    dataQuality: this.assessInputDataQuality(features),
                    reliability: this.assessPredictionReliability(predictions)
                }
            };

        } catch (error) {
            console.error('❌ 学习效果预测失败:', error);
            return this.generateFallbackPrediction(learningData, predictionHorizon);
        }
    }

    /**
     * 预测学习表现
     */
    async predictPerformance(features, horizon) {
        const prediction = {
            expectedAccuracy: 0.5,
            accuracyRange: { min: 0.3, max: 0.7 },
            trend: 'stable',
            trendStrength: 0.0,
            milestones: [],
            challenges: [],
            confidence: 0.5
        };

        try {
            if (this.isInitialized && this.models.performance) {
                // 使用训练好的模型进行预测
                const modelPrediction = await this.models.performance.predict(features, horizon);
                Object.assign(prediction, modelPrediction);
            } else {
                // 使用统计学方法进行预测
                prediction.expectedAccuracy = this.statisticalPerformancePrediction(features);
                prediction.trend = this.analyzeTrend(features.performanceHistory);
                prediction.accuracyRange = this.calculateConfidenceInterval(
                    prediction.expectedAccuracy, 
                    features.performanceVariability
                );
            }

            // 识别潜在里程碑
            prediction.milestones = this.identifyPerformanceMilestones(features, horizon);
            
            // 识别潜在挑战
            prediction.challenges = this.identifyPerformanceChallenges(features, horizon);

        } catch (error) {
            console.warn('性能预测使用默认值:', error);
        }

        return prediction;
    }

    /**
     * 预测知识保持
     */
    async predictRetention(features, horizon) {
        const prediction = {
            retentionRate: 0.7,
            forgettingCurve: [],
            criticalPeriods: [],
            reviewRecommendations: [],
            confidence: 0.5
        };

        try {
            // 基于艾宾浩斯遗忘曲线计算
            const initialRetention = features.currentRetentionRate || 0.8;
            const forgettingRate = this.calculateForgettingRate(features);
            
            // 生成遗忘曲线
            prediction.forgettingCurve = this.generateForgettingCurve(
                initialRetention, 
                forgettingRate, 
                horizon
            );
            
            // 计算预期保持率
            prediction.retentionRate = this.calculateExpectedRetention(
                prediction.forgettingCurve, 
                horizon
            );
            
            // 识别关键时期
            prediction.criticalPeriods = this.identifyCriticalRetentionPeriods(
                prediction.forgettingCurve
            );
            
            // 生成复习建议
            prediction.reviewRecommendations = this.generateReviewSchedule(
                prediction.forgettingCurve,
                features.reviewHistory
            );

        } catch (error) {
            console.warn('保持预测使用默认值:', error);
        }

        return prediction;
    }

    /**
     * 预测学习参与度
     */
    async predictEngagement(features, horizon) {
        const prediction = {
            engagementLevel: 0.6,
            motivationTrend: 'stable',
            burnoutRisk: 'low',
            engagementFactors: [],
            interventionPoints: [],
            confidence: 0.5
        };

        try {
            // 分析历史参与度模式
            const engagementHistory = features.engagementHistory || [];
            
            if (engagementHistory.length > 0) {
                prediction.engagementLevel = this.predictEngagementLevel(engagementHistory);
                prediction.motivationTrend = this.analyzeTrend(engagementHistory);
                prediction.burnoutRisk = this.assessBurnoutRisk(features);
            }

            // 识别影响参与度的因素
            prediction.engagementFactors = this.identifyEngagementFactors(features);
            
            // 确定干预点
            prediction.interventionPoints = this.identifyInterventionPoints(
                prediction.engagementLevel,
                prediction.motivationTrend,
                horizon
            );

        } catch (error) {
            console.warn('参与度预测使用默认值:', error);
        }

        return prediction;
    }

    /**
     * 预测难度适应性
     */
    async predictDifficultyAdaptation(features, horizon) {
        const prediction = {
            adaptationRate: 0.5,
            optimalDifficulty: 'medium',
            difficultyProgression: [],
            adaptationChallenges: [],
            confidence: 0.5
        };

        try {
            // 分析历史适应模式
            const adaptationHistory = features.difficultyAdaptationHistory || [];
            
            if (adaptationHistory.length > 0) {
                prediction.adaptationRate = this.calculateAdaptationRate(adaptationHistory);
                prediction.optimalDifficulty = this.determineOptimalDifficulty(features);
            }

            // 生成难度进阶路径
            prediction.difficultyProgression = this.generateDifficultyProgression(
                features.currentDifficulty,
                prediction.adaptationRate,
                horizon
            );
            
            // 识别适应挑战
            prediction.adaptationChallenges = this.identifyAdaptationChallenges(
                features,
                prediction.difficultyProgression
            );

        } catch (error) {
            console.warn('难度适应预测使用默认值:', error);
        }

        return prediction;
    }

    /**
     * 预测掌握时间
     */
    async predictTimeToMastery(features) {
        const prediction = {
            estimatedDays: 30,
            confidenceInterval: { min: 20, max: 45 },
            factors: [],
            accelerators: [],
            barriers: [],
            confidence: 0.5
        };

        try {
            // 基于学习速度和当前水平预测
            const learningRate = features.learningRate || 0.1;
            const currentMastery = features.currentMasteryLevel || 0.3;
            const targetMastery = 0.8; // 目标掌握水平

            // 计算预期天数
            prediction.estimatedDays = this.calculateTimeToMastery(
                currentMastery,
                targetMastery,
                learningRate
            );

            // 计算置信区间
            prediction.confidenceInterval = this.calculateMasteryTimeInterval(
                prediction.estimatedDays,
                features.learningConsistency || 0.5
            );

            // 识别影响因素
            prediction.factors = this.identifyMasteryFactors(features);
            prediction.accelerators = this.identifyMasteryAccelerators(features);
            prediction.barriers = this.identifyMasteryBarriers(features);

        } catch (error) {
            console.warn('掌握时间预测使用默认值:', error);
        }

        return prediction;
    }

    /**
     * 评估学习风险
     */
    async assessLearningRisks(features, horizon) {
        const assessment = {
            overallRisk: 'medium',
            riskFactors: [],
            mitigationStrategies: [],
            monitoringPoints: [],
            confidence: 0.5
        };

        try {
            const risks = [];

            // 评估各种风险
            const performanceRisk = this.assessPerformanceRisk(features);
            const motivationRisk = this.assessMotivationRisk(features);
            const burnoutRisk = this.assessBurnoutRisk(features);
            const consistencyRisk = this.assessConsistencyRisk(features);

            risks.push(performanceRisk, motivationRisk, burnoutRisk, consistencyRisk);

            // 计算综合风险等级
            assessment.overallRisk = this.calculateOverallRisk(risks);
            assessment.riskFactors = risks.filter(risk => risk.level !== 'low');

            // 生成缓解策略
            assessment.mitigationStrategies = this.generateMitigationStrategies(
                assessment.riskFactors
            );

            // 设置监控点
            assessment.monitoringPoints = this.setMonitoringPoints(
                assessment.riskFactors,
                horizon
            );

        } catch (error) {
            console.warn('风险评估使用默认值:', error);
        }

        return assessment;
    }

    /**
     * 生成综合预测展望
     */
    generateOverallOutlook(predictions) {
        const outlook = {
            summary: '',
            trajectory: 'stable',
            keyInsights: [],
            successProbability: 0.5,
            timeframe: '',
            criticalFactors: []
        };

        try {
            // 分析整体趋势
            const trends = [
                predictions.performance.trend,
                predictions.engagement.motivationTrend
            ];
            
            outlook.trajectory = this.synthesizeTrends(trends);

            // 计算成功概率
            outlook.successProbability = this.calculateSuccessProbability(predictions);

            // 生成关键洞察
            outlook.keyInsights = this.extractKeyInsights(predictions);

            // 识别关键因素
            outlook.criticalFactors = this.identifyCriticalFactors(predictions);

            // 生成摘要
            outlook.summary = this.generateOutlookSummary(outlook, predictions);

        } catch (error) {
            console.warn('综合展望生成失败:', error);
            outlook.summary = '预测数据不足，建议继续学习以获得更准确的预测';
        }

        return outlook;
    }

    /**
     * 基于预测生成建议
     */
    generatePredictionBasedRecommendations(predictions) {
        const recommendations = [];

        try {
            // 基于表现预测的建议
            if (predictions.performance.trend === 'declining') {
                recommendations.push({
                    type: 'performance_intervention',
                    priority: 'high',
                    title: '预防表现下降',
                    description: '预测显示表现可能下降，建议提前干预',
                    actions: [
                        '回顾最近的学习方法',
                        '适当调整学习难度',
                        '增加复习频率'
                    ],
                    timeline: '立即执行'
                });
            }

            // 基于保持预测的建议
            if (predictions.retention.criticalPeriods.length > 0) {
                recommendations.push({
                    type: 'retention_optimization',
                    priority: 'medium',
                    title: '优化知识保持',
                    description: '预测显示存在关键遗忘期，建议加强复习',
                    actions: predictions.retention.reviewRecommendations,
                    timeline: '按复习计划执行'
                });
            }

            // 基于参与度预测的建议
            if (predictions.engagement.burnoutRisk === 'high') {
                recommendations.push({
                    type: 'burnout_prevention',
                    priority: 'critical',
                    title: '预防学习倦怠',
                    description: '检测到高倦怠风险，建议立即调整',
                    actions: [
                        '减少学习强度',
                        '增加休息时间',
                        '寻找新的学习动机'
                    ],
                    timeline: '立即执行'
                });
            }

            // 基于风险评估的建议
            if (predictions.riskAssessment.overallRisk === 'high') {
                recommendations.push({
                    type: 'risk_mitigation',
                    priority: 'high',
                    title: '降低学习风险',
                    description: '检测到高风险因素，建议采取预防措施',
                    actions: predictions.riskAssessment.mitigationStrategies.map(s => s.action),
                    timeline: '尽快执行'
                });
            }

        } catch (error) {
            console.warn('预测建议生成失败:', error);
        }

        return recommendations.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
    }

    // 辅助计算方法

    /**
     * 统计学表现预测
     */
    statisticalPerformancePrediction(features) {
        const history = features.performanceHistory || [];
        if (history.length === 0) return 0.5;

        // 使用加权平均，最近的数据权重更高
        let weightedSum = 0;
        let totalWeight = 0;
        
        history.forEach((value, index) => {
            const weight = Math.pow(1.2, index); // 指数权重
            weightedSum += value * weight;
            totalWeight += weight;
        });

        return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    }

    /**
     * 分析趋势
     */
    analyzeTrend(history) {
        if (!history || history.length < 3) return 'stable';

        const trend = this.calculateTrend(history);
        
        if (trend > 0.1) return 'improving';
        if (trend < -0.1) return 'declining';
        return 'stable';
    }

    /**
     * 计算趋势
     */
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    /**
     * 计算置信区间
     */
    calculateConfidenceInterval(mean, variance, confidence = 0.95) {
        const z = confidence === 0.95 ? 1.96 : 1.645; // Z-score
        const margin = z * Math.sqrt(variance);
        
        return {
            min: Math.max(0, mean - margin),
            max: Math.min(1, mean + margin)
        };
    }

    /**
     * 计算遗忘率
     */
    calculateForgettingRate(features) {
        // 基于学习强度、复习频率等因素计算遗忘率
        const baseRate = 0.3; // 基础遗忘率
        const reviewFrequency = features.reviewFrequency || 0.1;
        const learningIntensity = features.learningIntensity || 0.5;
        
        // 复习频率高和学习强度高可以降低遗忘率
        return baseRate * (1 - reviewFrequency * 0.5) * (1 - learningIntensity * 0.3);
    }

    /**
     * 生成遗忘曲线
     */
    generateForgettingCurve(initialRetention, forgettingRate, horizon) {
        const curve = [];
        const days = this.parseDays(horizon);
        
        for (let day = 0; day <= days; day++) {
            const retention = initialRetention * Math.exp(-forgettingRate * day);
            curve.push({
                day,
                retention: Math.max(0.1, retention), // 最低保持10%
                date: new Date(Date.now() + day * 24 * 60 * 60 * 1000)
            });
        }
        
        return curve;
    }

    /**
     * 解析时间跨度为天数
     */
    parseDays(horizon) {
        const horizonMap = {
            '1day': 1,
            '3days': 3,
            '1week': 7,
            '2weeks': 14,
            '1month': 30,
            '3months': 90
        };
        
        return horizonMap[horizon] || 7;
    }

    /**
     * 评估倦怠风险
     */
    assessBurnoutRisk(features) {
        let riskScore = 0;
        
        // 学习强度过高
        if (features.learningIntensity > 0.8) riskScore += 0.3;
        
        // 学习时间过长
        if (features.averageSessionLength > 120) riskScore += 0.2; // 超过2小时
        
        // 休息不足
        if (features.restFrequency < 0.3) riskScore += 0.2;
        
        // 表现下降
        if (features.performanceTrend < -0.1) riskScore += 0.3;
        
        if (riskScore >= 0.7) return 'high';
        if (riskScore >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * 计算掌握时间
     */
    calculateTimeToMastery(current, target, rate) {
        if (rate <= 0) return 365; // 如果没有进步，设为一年
        
        // 使用指数学习模型
        const timeToMastery = Math.log(target / current) / rate;
        
        // 转换为天数，并设置合理范围
        return Math.max(7, Math.min(365, Math.round(timeToMastery)));
    }

    /**
     * 计算成功概率
     */
    calculateSuccessProbability(predictions) {
        let probability = 0.5; // 基础概率
        
        // 基于表现趋势调整
        if (predictions.performance.trend === 'improving') probability += 0.2;
        if (predictions.performance.trend === 'declining') probability -= 0.2;
        
        // 基于参与度调整
        if (predictions.engagement.engagementLevel > 0.7) probability += 0.15;
        if (predictions.engagement.engagementLevel < 0.4) probability -= 0.15;
        
        // 基于风险等级调整
        if (predictions.riskAssessment.overallRisk === 'low') probability += 0.1;
        if (predictions.riskAssessment.overallRisk === 'high') probability -= 0.1;
        
        return Math.max(0.1, Math.min(0.9, probability));
    }

    /**
     * 生成后备预测
     */
    generateFallbackPrediction(learningData, horizon) {
        return {
            predictions: {
                performance: {
                    expectedAccuracy: 0.6,
                    trend: 'stable',
                    confidence: 0.3
                },
                retention: {
                    retentionRate: 0.7,
                    confidence: 0.3
                },
                engagement: {
                    engagementLevel: 0.6,
                    burnoutRisk: 'medium',
                    confidence: 0.3
                },
                overallOutlook: {
                    summary: '数据不足，无法进行准确预测。建议继续学习以获得更好的预测结果。',
                    trajectory: 'unknown',
                    successProbability: 0.5
                },
                recommendations: [
                    {
                        type: 'data_collection',
                        priority: 'medium',
                        title: '积累学习数据',
                        description: '继续学习以获得更准确的预测',
                        actions: ['保持规律学习', '记录学习过程', '完成更多练习']
                    }
                ]
            },
            metadata: {
                predictionDate: new Date().toISOString(),
                horizon,
                reliability: 'low',
                note: '预测基于有限数据，仅供参考'
            }
        };
    }
}

/**
 * 学习特征提取器
 */
class LearningFeatureExtractor {
    async extract(learningData) {
        const features = {
            // 基础特征
            totalSessions: learningData.sessions.length,
            totalStudyTime: this.calculateTotalStudyTime(learningData.sessions),
            averageSessionLength: this.calculateAverageSessionLength(learningData.sessions),
            
            // 表现特征
            performanceHistory: this.extractPerformanceHistory(learningData.sessions),
            currentAccuracy: this.calculateCurrentAccuracy(learningData.sessions),
            performanceVariability: this.calculatePerformanceVariability(learningData.sessions),
            
            // 学习模式特征
            learningConsistency: this.calculateLearningConsistency(learningData.sessions),
            preferredDifficulty: this.identifyPreferredDifficulty(learningData.sessions),
            contentDiversity: this.calculateContentDiversity(learningData.sessions),
            
            // 时间特征
            learningFrequency: this.calculateLearningFrequency(learningData.sessions),
            timePreferences: this.extractTimePreferences(learningData.sessions),
            
            // 参与度特征
            engagementHistory: this.extractEngagementHistory(learningData.sessions),
            motivationIndicators: this.extractMotivationIndicators(learningData.sessions)
        };

        return features;
    }

    calculateTotalStudyTime(sessions) {
        return sessions.reduce((total, session) => total + (session.duration || 0), 0);
    }

    extractPerformanceHistory(sessions) {
        return sessions.map(session => {
            if (session.content && session.content.questionsAnswered > 0) {
                return session.content.correctAnswers / session.content.questionsAnswered;
            }
            return null;
        }).filter(acc => acc !== null);
    }

    calculateCurrentAccuracy(sessions) {
        const recentSessions = sessions.slice(-5);
        const accuracies = this.extractPerformanceHistory(recentSessions);
        return accuracies.length > 0 ? 
            accuracies.reduce((a, b) => a + b, 0) / accuracies.length : 0.5;
    }
}

/**
 * 学习数据预处理器
 */
class LearningDataPreprocessor {
    async process(learningData) {
        // 数据清洗和标准化
        const processed = {
            sessions: this.cleanSessions(learningData.sessions),
            statistics: this.normalizeStatistics(learningData.statistics),
            timeRange: learningData.timeRange
        };

        return processed;
    }

    cleanSessions(sessions) {
        return sessions.filter(session => 
            session.duration > 0 && 
            session.content && 
            session.content.questionsAnswered > 0
        );
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.LearningEffectPredictionModel = LearningEffectPredictionModel;
    console.log('🔮 学习效果预测模型已加载');
}
