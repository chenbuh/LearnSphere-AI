/**
 * 智能学习分析引擎
 * 提供深度学习分析、模式识别和智能洞察
 */
class IntelligentLearningAnalyzer {
    constructor() {
        this.analysisModels = {
            learningCurve: new LearningCurveAnalyzer(),
            difficultyAdaptation: new DifficultyAdaptationAnalyzer(),
            retentionAnalyzer: new KnowledgeRetentionAnalyzer(),
            motivationTracker: new MotivationAnalyzer(),
            cognitiveLoad: new CognitiveLoadAnalyzer(),
            learningStyle: new LearningStyleDetector()
        };
        
        this.predictionModels = {
            performance: new PerformancePredictionModel(),
            retention: new RetentionPredictionModel(),
            difficulty: new DifficultyPredictionModel(),
            engagement: new EngagementPredictionModel()
        };
        
        this.dataProcessor = null;
        this.patternRecognizer = null;
        this.insightGenerator = null;
        
        this.init();
    }

    /**
     * 初始化分析引擎
     */
    async init() {
        console.log('🧠 初始化智能学习分析引擎...');
        
        this.dataProcessor = new AdvancedDataProcessor();
        this.patternRecognizer = new LearningPatternRecognizer();
        this.insightGenerator = new LearningInsightGenerator();
        
        // 初始化机器学习模型
        await this.initializeMLModels();
        
        console.log('✅ 智能学习分析引擎初始化完成');
    }

    /**
     * 初始化机器学习模型
     */
    async initializeMLModels() {
        try {
            // 加载预训练模型权重
            await Promise.all([
                this.predictionModels.performance.initialize(),
                this.predictionModels.retention.initialize(),
                this.predictionModels.difficulty.initialize(),
                this.predictionModels.engagement.initialize()
            ]);
            
            console.log('🤖 机器学习模型初始化完成');
        } catch (error) {
            console.warn('机器学习模型初始化失败，使用统计学方法:', error);
        }
    }

    /**
     * 执行全面学习分析
     */
    async performComprehensiveAnalysis(userId, timeRange = 'month') {
        console.log('🔍 开始执行全面学习分析...');
        
        try {
            // 获取用户学习数据
            const learningData = await this.collectLearningData(userId, timeRange);
            
            if (!learningData || learningData.sessions.length === 0) {
                return this.generateEmptyAnalysis();
            }

            // 并行执行各种分析
            const [
                learningCurveAnalysis,
                difficultyAnalysis,
                retentionAnalysis,
                motivationAnalysis,
                cognitiveAnalysis,
                styleAnalysis,
                patternAnalysis,
                predictionAnalysis
            ] = await Promise.all([
                this.analyzeLearningCurve(learningData),
                this.analyzeDifficultyAdaptation(learningData),
                this.analyzeKnowledgeRetention(learningData),
                this.analyzeMotivation(learningData),
                this.analyzeCognitiveLoad(learningData),
                this.detectLearningStyle(learningData),
                this.recognizePatterns(learningData),
                this.generatePredictions(learningData)
            ]);

            // 综合分析结果
            const comprehensiveAnalysis = {
                userId,
                timeRange,
                analysisDate: new Date().toISOString(),
                dataQuality: this.assessDataQuality(learningData),
                
                // 核心分析结果
                learningCurve: learningCurveAnalysis,
                difficultyAdaptation: difficultyAnalysis,
                knowledgeRetention: retentionAnalysis,
                motivation: motivationAnalysis,
                cognitiveLoad: cognitiveAnalysis,
                learningStyle: styleAnalysis,
                patterns: patternAnalysis,
                predictions: predictionAnalysis,
                
                // 综合评估
                overallAssessment: this.generateOverallAssessment(learningData, {
                    learningCurveAnalysis,
                    difficultyAnalysis,
                    retentionAnalysis,
                    motivationAnalysis,
                    cognitiveAnalysis,
                    styleAnalysis
                }),
                
                // 智能洞察
                insights: await this.insightGenerator.generateInsights({
                    learningData,
                    analyses: {
                        learningCurveAnalysis,
                        difficultyAnalysis,
                        retentionAnalysis,
                        motivationAnalysis,
                        cognitiveAnalysis,
                        styleAnalysis,
                        patternAnalysis
                    }
                }),
                
                // 个性化建议
                recommendations: await this.generatePersonalizedRecommendations(learningData, {
                    learningCurveAnalysis,
                    difficultyAnalysis,
                    retentionAnalysis,
                    motivationAnalysis,
                    cognitiveAnalysis,
                    styleAnalysis,
                    patternAnalysis,
                    predictionAnalysis
                })
            };

            console.log('✅ 全面学习分析完成');
            return comprehensiveAnalysis;

        } catch (error) {
            console.error('❌ 学习分析执行失败:', error);
            throw error;
        }
    }

    /**
     * 收集学习数据
     */
    async collectLearningData(userId, timeRange) {
        // 从统一数据管理器获取数据
        const statisticsManager = window.unifiedStatisticsManager;
        if (!statisticsManager) {
            throw new Error('统计数据管理器未初始化');
        }

        const sessions = await statisticsManager.getFilteredSessions(timeRange);
        const statistics = await statisticsManager.getStatistics({ timeRange, detailed: true });
        
        // 获取目标和成就数据
        const goalManager = window.learningGoalManager;
        const goals = goalManager ? goalManager.getGoals() : [];
        const achievements = goalManager ? goalManager.getAchievements() : [];

        return {
            userId,
            timeRange,
            sessions,
            statistics,
            goals,
            achievements,
            collectTime: Date.now()
        };
    }

    /**
     * 分析学习曲线
     */
    async analyzeLearningCurve(learningData) {
        return await this.analysisModels.learningCurve.analyze(learningData.sessions);
    }

    /**
     * 分析难度适应性
     */
    async analyzeDifficultyAdaptation(learningData) {
        return await this.analysisModels.difficultyAdaptation.analyze(learningData.sessions);
    }

    /**
     * 分析知识保持
     */
    async analyzeKnowledgeRetention(learningData) {
        return await this.analysisModels.retentionAnalyzer.analyze(learningData.sessions);
    }

    /**
     * 分析学习动机
     */
    async analyzeMotivation(learningData) {
        return await this.analysisModels.motivationTracker.analyze({
            sessions: learningData.sessions,
            goals: learningData.goals,
            achievements: learningData.achievements
        });
    }

    /**
     * 分析认知负荷
     */
    async analyzeCognitiveLoad(learningData) {
        return await this.analysisModels.cognitiveLoad.analyze(learningData.sessions);
    }

    /**
     * 检测学习风格
     */
    async detectLearningStyle(learningData) {
        return await this.analysisModels.learningStyle.detect(learningData.sessions);
    }

    /**
     * 识别学习模式
     */
    async recognizePatterns(learningData) {
        return await this.patternRecognizer.recognizePatterns(learningData);
    }

    /**
     * 生成预测分析
     */
    async generatePredictions(learningData) {
        const [
            performancePrediction,
            retentionPrediction,
            difficultyPrediction,
            engagementPrediction
        ] = await Promise.all([
            this.predictionModels.performance.predict(learningData),
            this.predictionModels.retention.predict(learningData),
            this.predictionModels.difficulty.predict(learningData),
            this.predictionModels.engagement.predict(learningData)
        ]);

        return {
            performance: performancePrediction,
            retention: retentionPrediction,
            difficulty: difficultyPrediction,
            engagement: engagementPrediction,
            confidence: this.calculatePredictionConfidence([
                performancePrediction,
                retentionPrediction,
                difficultyPrediction,
                engagementPrediction
            ])
        };
    }

    /**
     * 生成综合评估
     */
    generateOverallAssessment(learningData, analyses) {
        const assessment = {
            learningEfficiency: this.calculateLearningEfficiency(analyses),
            adaptability: this.calculateAdaptability(analyses),
            consistency: this.calculateConsistency(analyses),
            engagement: this.calculateEngagement(analyses),
            retention: this.calculateRetentionScore(analyses),
            overallScore: 0,
            level: 'beginner',
            strengths: [],
            challenges: []
        };

        // 计算综合分数
        assessment.overallScore = Math.round(
            (assessment.learningEfficiency * 0.25 +
             assessment.adaptability * 0.2 +
             assessment.consistency * 0.2 +
             assessment.engagement * 0.2 +
             assessment.retention * 0.15) * 100
        ) / 100;

        // 确定学习水平
        assessment.level = this.determineLearningLevel(assessment.overallScore);

        // 识别优势和挑战
        assessment.strengths = this.identifyStrengths(analyses);
        assessment.challenges = this.identifyChallenges(analyses);

        return assessment;
    }

    /**
     * 生成个性化建议
     */
    async generatePersonalizedRecommendations(learningData, analyses) {
        const recommendations = {
            immediate: [], // 立即行动建议
            shortTerm: [], // 短期建议（1-2周）
            longTerm: [], // 长期建议（1-3个月）
            adaptive: [] // 自适应建议
        };

        // 基于学习曲线的建议
        if (analyses.learningCurveAnalysis.trend === 'declining') {
            recommendations.immediate.push({
                type: 'learning_strategy',
                priority: 'high',
                title: '调整学习策略',
                description: '您的学习效果呈下降趋势，建议调整学习方法或降低难度',
                actions: [
                    '回顾最近的学习内容，找出困难点',
                    '适当降低学习难度，巩固基础',
                    '尝试不同的学习方法',
                    '增加休息时间，避免学习疲劳'
                ]
            });
        }

        // 基于难度适应的建议
        if (analyses.difficultyAnalysis.adaptationRate < 0.6) {
            recommendations.shortTerm.push({
                type: 'difficulty_adjustment',
                priority: 'medium',
                title: '优化难度设置',
                description: '您对难度变化的适应性较低，建议采用渐进式学习',
                actions: [
                    '使用自适应难度系统',
                    '每次只增加少量难度',
                    '在掌握当前难度后再进阶',
                    '多做同一难度的练习以建立信心'
                ]
            });
        }

        // 基于知识保持的建议
        if (analyses.retentionAnalysis.retentionRate < 0.7) {
            recommendations.longTerm.push({
                type: 'retention_improvement',
                priority: 'high',
                title: '提升知识保持',
                description: '您的知识保持率需要改善，建议采用间隔重复学习法',
                actions: [
                    '实施间隔重复复习计划',
                    '使用记忆卡片或闪卡',
                    '定期回顾之前学过的内容',
                    '将新知识与已知知识建立联系'
                ]
            });
        }

        // 基于学习动机的建议
        if (analyses.motivationAnalysis.motivationLevel < 0.6) {
            recommendations.immediate.push({
                type: 'motivation_boost',
                priority: 'high',
                title: '提升学习动机',
                description: '您的学习动机有所下降，建议重新设定目标和奖励机制',
                actions: [
                    '设定短期可达成的小目标',
                    '为完成目标设置奖励',
                    '寻找学习伙伴或加入学习群体',
                    '回顾学习的初衷和长远目标'
                ]
            });
        }

        // 基于认知负荷的建议
        if (analyses.cognitiveAnalysis.averageLoad > 0.8) {
            recommendations.immediate.push({
                type: 'cognitive_load',
                priority: 'medium',
                title: '降低认知负荷',
                description: '您的认知负荷较高，建议优化学习方式以提高效率',
                actions: [
                    '将复杂任务分解为小步骤',
                    '减少同时学习的主题数量',
                    '使用思维导图整理知识结构',
                    '增加学习间隔，给大脑休息时间'
                ]
            });
        }

        // 基于学习风格的建议
        const learningStyle = analyses.styleAnalysis.dominantStyle;
        if (learningStyle) {
            recommendations.adaptive.push({
                type: 'learning_style',
                priority: 'medium',
                title: `优化${learningStyle}学习方式`,
                description: `根据您的${learningStyle}学习风格，推荐以下学习方法`,
                actions: this.getStyleSpecificActions(learningStyle)
            });
        }

        return recommendations;
    }

    /**
     * 评估数据质量
     */
    assessDataQuality(learningData) {
        const sessions = learningData.sessions;
        
        if (sessions.length === 0) {
            return { score: 0, issues: ['无学习数据'], recommendations: ['开始学习以积累数据'] };
        }

        let qualityScore = 100;
        const issues = [];
        const recommendations = [];

        // 检查数据完整性
        const incompleteData = sessions.filter(s => 
            !s.duration || !s.content || s.content.questionsAnswered === 0
        ).length;
        
        if (incompleteData > sessions.length * 0.2) {
            qualityScore -= 20;
            issues.push('部分学习数据不完整');
            recommendations.push('确保完整记录学习过程');
        }

        // 检查数据时效性
        const recentSessions = sessions.filter(s => 
            Date.now() - (s.startTime || s.recordedAt || 0) < 7 * 24 * 60 * 60 * 1000
        ).length;
        
        if (recentSessions < sessions.length * 0.3) {
            qualityScore -= 15;
            issues.push('缺乏近期学习数据');
            recommendations.push('保持规律的学习习惯');
        }

        // 检查数据多样性
        const modules = new Set(sessions.map(s => s.module)).size;
        if (modules < 2) {
            qualityScore -= 10;
            issues.push('学习内容单一');
            recommendations.push('尝试多样化的学习内容');
        }

        return {
            score: Math.max(0, qualityScore),
            issues,
            recommendations
        };
    }

    /**
     * 生成空分析结果
     */
    generateEmptyAnalysis() {
        return {
            isEmpty: true,
            message: '暂无足够的学习数据进行分析',
            recommendations: [
                '开始学习以积累数据',
                '保持规律的学习习惯',
                '尝试不同类型的学习内容',
                '设定学习目标并跟踪进度'
            ]
        };
    }

    // 辅助计算方法

    /**
     * 计算学习效率
     */
    calculateLearningEfficiency(analyses) {
        const curveScore = analyses.learningCurveAnalysis.efficiency || 0.5;
        const retentionScore = analyses.retentionAnalysis.retentionRate || 0.5;
        const cognitiveScore = 1 - (analyses.cognitiveAnalysis.averageLoad || 0.5);
        
        return (curveScore * 0.4 + retentionScore * 0.4 + cognitiveScore * 0.2);
    }

    /**
     * 计算适应性
     */
    calculateAdaptability(analyses) {
        return analyses.difficultyAnalysis.adaptationRate || 0.5;
    }

    /**
     * 计算一致性
     */
    calculateConsistency(analyses) {
        return analyses.learningCurveAnalysis.consistency || 0.5;
    }

    /**
     * 计算参与度
     */
    calculateEngagement(analyses) {
        return analyses.motivationAnalysis.motivationLevel || 0.5;
    }

    /**
     * 计算保持分数
     */
    calculateRetentionScore(analyses) {
        return analyses.retentionAnalysis.retentionRate || 0.5;
    }

    /**
     * 确定学习水平
     */
    determineLearningLevel(overallScore) {
        if (overallScore >= 0.9) return 'expert';
        if (overallScore >= 0.8) return 'advanced';
        if (overallScore >= 0.6) return 'intermediate';
        if (overallScore >= 0.4) return 'beginner';
        return 'novice';
    }

    /**
     * 识别优势
     */
    identifyStrengths(analyses) {
        const strengths = [];
        
        if (analyses.learningCurveAnalysis.efficiency > 0.8) {
            strengths.push('学习效率高');
        }
        
        if (analyses.retentionAnalysis.retentionRate > 0.8) {
            strengths.push('知识保持能力强');
        }
        
        if (analyses.motivationAnalysis.motivationLevel > 0.8) {
            strengths.push('学习动机强烈');
        }
        
        if (analyses.difficultyAnalysis.adaptationRate > 0.8) {
            strengths.push('难度适应能力强');
        }
        
        return strengths;
    }

    /**
     * 识别挑战
     */
    identifyChallenges(analyses) {
        const challenges = [];
        
        if (analyses.learningCurveAnalysis.efficiency < 0.4) {
            challenges.push('学习效率有待提高');
        }
        
        if (analyses.retentionAnalysis.retentionRate < 0.4) {
            challenges.push('知识保持需要加强');
        }
        
        if (analyses.motivationAnalysis.motivationLevel < 0.4) {
            challenges.push('学习动机需要提升');
        }
        
        if (analyses.cognitiveAnalysis.averageLoad > 0.8) {
            challenges.push('认知负荷过高');
        }
        
        return challenges;
    }

    /**
     * 获取学习风格特定的行动建议
     */
    getStyleSpecificActions(style) {
        const styleActions = {
            visual: [
                '使用图表、图像和颜色来组织信息',
                '制作思维导图和流程图',
                '观看教学视频和演示',
                '使用高亮和标记来强调重点'
            ],
            auditory: [
                '大声朗读学习材料',
                '参与讨论和口头练习',
                '使用音频资料和播客',
                '向他人解释学过的内容'
            ],
            kinesthetic: [
                '通过实践和操作来学习',
                '使用手势和身体动作帮助记忆',
                '在学习时适当走动',
                '使用实物模型和教具'
            ],
            reading: [
                '大量阅读相关材料',
                '做详细的笔记和摘要',
                '使用文字卡片和列表',
                '通过写作来巩固学习'
            ]
        };
        
        return styleActions[style] || styleActions.visual;
    }

    /**
     * 计算预测置信度
     */
    calculatePredictionConfidence(predictions) {
        const confidences = predictions.map(p => p.confidence || 0.5);
        const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        
        return {
            overall: avgConfidence,
            reliability: avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low',
            factors: this.getConfidenceFactors(predictions)
        };
    }

    /**
     * 获取置信度因素
     */
    getConfidenceFactors(predictions) {
        const factors = [];
        
        const dataQuality = predictions[0].dataQuality || 0.5;
        if (dataQuality < 0.5) {
            factors.push('数据质量有限');
        }
        
        const sampleSize = predictions[0].sampleSize || 0;
        if (sampleSize < 10) {
            factors.push('样本数量较少');
        }
        
        const modelAccuracy = predictions.reduce((sum, p) => sum + (p.accuracy || 0.5), 0) / predictions.length;
        if (modelAccuracy < 0.6) {
            factors.push('模型准确性有限');
        }
        
        return factors;
    }

    /**
     * 导出分析结果
     */
    async exportAnalysis(analysis, format = 'json') {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `学习分析报告_${timestamp}.${format}`;
        
        let content;
        let mimeType;
        
        switch (format) {
            case 'json':
                content = JSON.stringify(analysis, null, 2);
                mimeType = 'application/json';
                break;
            case 'csv':
                content = this.convertToCSV(analysis);
                mimeType = 'text/csv';
                break;
            default:
                throw new Error('不支持的导出格式');
        }
        
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
     * 转换为CSV格式
     */
    convertToCSV(analysis) {
        // 简化的CSV转换，实际实现可能需要更复杂的逻辑
        const rows = [
            ['指标', '数值', '评级'],
            ['学习效率', analysis.overallAssessment.learningEfficiency, this.getGrade(analysis.overallAssessment.learningEfficiency)],
            ['适应性', analysis.overallAssessment.adaptability, this.getGrade(analysis.overallAssessment.adaptability)],
            ['一致性', analysis.overallAssessment.consistency, this.getGrade(analysis.overallAssessment.consistency)],
            ['参与度', analysis.overallAssessment.engagement, this.getGrade(analysis.overallAssessment.engagement)],
            ['保持率', analysis.overallAssessment.retention, this.getGrade(analysis.overallAssessment.retention)]
        ];
        
        return rows.map(row => row.join(',')).join('\n');
    }

    /**
     * 获取等级
     */
    getGrade(score) {
        if (score >= 0.9) return 'A+';
        if (score >= 0.8) return 'A';
        if (score >= 0.7) return 'B+';
        if (score >= 0.6) return 'B';
        if (score >= 0.5) return 'C+';
        return 'C';
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.IntelligentLearningAnalyzer = IntelligentLearningAnalyzer;
    console.log('🧠 智能学习分析引擎已加载');
}
