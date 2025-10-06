/**
 * 增强学习分析管理器
 * 整合所有学习分析功能，提供统一的分析接口
 */
class EnhancedLearningAnalysisManager {
    constructor() {
        // 核心分析引擎
        this.intelligentAnalyzer = new IntelligentLearningAnalyzer();
        this.patternRecognizer = new LearningPatternRecognizer();
        this.recommendationEngine = new PersonalizedRecommendationEngine();
        this.predictionModel = new LearningEffectPredictionModel();
        this.pathOptimizer = new AdaptiveLearningPathOptimizer();
        this.dataMiningEngine = new LearningDataMiningEngine();
        
        // 统一数据管理
        this.dataManager = null;
        this.cacheManager = new AnalysisCacheManager();
        this.reportGenerator = new AnalysisReportGenerator();
        
        // 分析状态
        this.analysisState = {
            isAnalyzing: false,
            lastAnalysis: null,
            scheduledAnalysis: null,
            analysisHistory: []
        };
        
        this.init();
    }

    async init() {
        console.log('🧠 增强学习分析管理器初始化中...');
        
        try {
            // 获取统一数据管理器
            this.dataManager = window.unifiedStatisticsManager;
            
            if (!this.dataManager) {
                throw new Error('统一数据管理器未初始化');
            }

            // 初始化各个分析引擎
            await this.initializeAnalysisEngines();
            
            // 设置自动分析调度
            this.setupAnalysisScheduling();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            console.log('✅ 增强学习分析管理器初始化完成');
            
        } catch (error) {
            console.error('❌ 增强学习分析管理器初始化失败:', error);
            throw error;
        }
    }

    /**
     * 执行全面学习分析
     */
    async performComprehensiveAnalysis(options = {}) {
        if (this.analysisState.isAnalyzing) {
            console.warn('分析正在进行中，请稍后再试');
            return null;
        }

        console.log('🧠 开始执行全面学习分析...');
        this.analysisState.isAnalyzing = true;

        try {
            const analysisOptions = {
                userId: options.userId || 'current_user',
                timeRange: options.timeRange || 'month',
                includePredictons: options.includePredictons !== false,
                includeMining: options.includeMining !== false,
                includePathOptimization: options.includePathOptimization !== false,
                cacheResults: options.cacheResults !== false,
                ...options
            };

            // 显示分析进度
            this.showAnalysisProgress('正在收集学习数据...', 10);

            // 收集学习数据
            const learningData = await this.collectComprehensiveLearningData(analysisOptions);
            
            this.showAnalysisProgress('正在执行智能分析...', 25);

            // 执行核心智能分析
            const intelligentAnalysis = await this.intelligentAnalyzer.performComprehensiveAnalysis(
                analysisOptions.userId, 
                analysisOptions.timeRange
            );

            this.showAnalysisProgress('正在识别学习模式...', 40);

            // 识别学习模式
            const patterns = await this.patternRecognizer.recognizePatterns(learningData);

            this.showAnalysisProgress('正在生成个性化建议...', 55);

            // 生成个性化建议
            const recommendations = await this.recommendationEngine.generatePersonalizedRecommendations(
                learningData, 
                intelligentAnalysis
            );

            let predictions = null;
            let pathOptimization = null;
            let dataMiningResults = null;

            // 可选的预测分析
            if (analysisOptions.includePredictons) {
                this.showAnalysisProgress('正在进行效果预测...', 70);
                predictions = await this.predictionModel.predictLearningEffects(
                    learningData, 
                    analysisOptions.predictionHorizon || '1week'
                );
            }

            // 可选的路径优化
            if (analysisOptions.includePathOptimization) {
                this.showAnalysisProgress('正在优化学习路径...', 80);
                pathOptimization = await this.pathOptimizer.optimizeLearningPath(
                    analysisOptions.userId,
                    learningData,
                    intelligentAnalysis,
                    options.userGoals || []
                );
            }

            // 可选的数据挖掘
            if (analysisOptions.includeMining && learningData.sessions.length > 20) {
                this.showAnalysisProgress('正在执行数据挖掘...', 90);
                dataMiningResults = await this.dataMiningEngine.performComprehensiveDataMining(
                    learningData,
                    options.miningScope || 'full'
                );
            }

            this.showAnalysisProgress('正在生成分析报告...', 95);

            // 综合分析结果
            const comprehensiveAnalysis = {
                // 基础信息
                analysisId: this.generateAnalysisId(),
                userId: analysisOptions.userId,
                timestamp: new Date().toISOString(),
                options: analysisOptions,
                
                // 核心分析结果
                intelligentAnalysis,
                patterns,
                recommendations,
                
                // 可选分析结果
                predictions,
                pathOptimization,
                dataMiningResults,
                
                // 综合评估
                overallAssessment: this.generateOverallAssessment({
                    intelligentAnalysis,
                    patterns,
                    recommendations,
                    predictions,
                    pathOptimization,
                    dataMiningResults
                }),
                
                // 关键洞察
                keyInsights: this.extractKeyInsights({
                    intelligentAnalysis,
                    patterns,
                    dataMiningResults
                }),
                
                // 行动计划
                actionPlan: this.createActionPlan({
                    recommendations,
                    predictions,
                    pathOptimization
                }),
                
                // 元数据
                metadata: {
                    dataQuality: this.assessOverallDataQuality(learningData),
                    analysisDepth: this.calculateAnalysisDepth(analysisOptions),
                    confidenceLevel: this.calculateOverallConfidence({
                        intelligentAnalysis,
                        patterns,
                        recommendations,
                        predictions
                    }),
                    nextAnalysisRecommended: this.scheduleNextAnalysis(intelligentAnalysis)
                }
            };

            // 缓存结果
            if (analysisOptions.cacheResults) {
                await this.cacheManager.cacheAnalysis(comprehensiveAnalysis);
            }

            // 更新分析状态
            this.analysisState.lastAnalysis = comprehensiveAnalysis;
            this.analysisState.analysisHistory.push({
                id: comprehensiveAnalysis.analysisId,
                timestamp: comprehensiveAnalysis.timestamp,
                type: 'comprehensive',
                dataPoints: learningData.sessions.length
            });

            this.showAnalysisProgress('分析完成！', 100);
            
            // 延迟隐藏进度条
            setTimeout(() => this.hideAnalysisProgress(), 2000);

            console.log('✅ 全面学习分析完成');
            
            // 触发分析完成事件
            this.triggerAnalysisCompleteEvent(comprehensiveAnalysis);
            
            return comprehensiveAnalysis;

        } catch (error) {
            console.error('❌ 全面学习分析失败:', error);
            this.showAnalysisError('分析过程中出现错误，请稍后重试');
            throw error;
        } finally {
            this.analysisState.isAnalyzing = false;
        }
    }

    /**
     * 快速学习分析（轻量级）
     */
    async performQuickAnalysis(options = {}) {
        console.log('⚡ 开始快速学习分析...');

        try {
            const quickOptions = {
                userId: options.userId || 'current_user',
                timeRange: options.timeRange || 'week',
                focusAreas: options.focusAreas || ['performance', 'patterns'],
                ...options
            };

            // 收集基础数据
            const learningData = await this.collectBasicLearningData(quickOptions);
            
            const quickAnalysis = {
                analysisId: this.generateAnalysisId(),
                type: 'quick',
                timestamp: new Date().toISOString(),
                
                // 基础分析
                basicStats: this.calculateBasicStatistics(learningData),
                recentTrends: this.analyzeRecentTrends(learningData),
                quickInsights: this.generateQuickInsights(learningData),
                
                // 快速建议
                quickRecommendations: this.generateQuickRecommendations(learningData),
                
                // 元数据
                metadata: {
                    dataPoints: learningData.sessions.length,
                    analysisDepth: 'basic',
                    processingTime: Date.now() - Date.now() // 实际实现中会计算真实时间
                }
            };

            console.log('✅ 快速学习分析完成');
            return quickAnalysis;

        } catch (error) {
            console.error('❌ 快速学习分析失败:', error);
            throw error;
        }
    }

    /**
     * 生成学习分析报告
     */
    async generateAnalysisReport(analysisResult, reportType = 'comprehensive') {
        console.log('📊 生成学习分析报告...');

        try {
            const report = await this.reportGenerator.generate(analysisResult, {
                type: reportType,
                includeVisualizations: true,
                includeRecommendations: true,
                format: 'html'
            });

            return report;

        } catch (error) {
            console.error('❌ 报告生成失败:', error);
            throw error;
        }
    }

    /**
     * 导出分析结果
     */
    async exportAnalysisResults(analysisResult, format = 'json') {
        console.log(`📤 导出分析结果 (${format})...`);

        try {
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `学习分析报告_${timestamp}.${format}`;
            
            let content;
            let mimeType;
            
            switch (format.toLowerCase()) {
                case 'json':
                    content = JSON.stringify(analysisResult, null, 2);
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    content = this.convertAnalysisToCSV(analysisResult);
                    mimeType = 'text/csv';
                    break;
                case 'pdf':
                    content = await this.generatePDFReport(analysisResult);
                    mimeType = 'application/pdf';
                    break;
                default:
                    throw new Error('不支持的导出格式');
            }
            
            // 创建下载
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('✅ 分析结果导出完成');

        } catch (error) {
            console.error('❌ 导出失败:', error);
            throw error;
        }
    }

    /**
     * 获取分析历史
     */
    getAnalysisHistory(limit = 10) {
        return this.analysisState.analysisHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    /**
     * 获取缓存的分析结果
     */
    async getCachedAnalysis(analysisId) {
        return await this.cacheManager.getAnalysis(analysisId);
    }

    /**
     * 清除分析缓存
     */
    async clearAnalysisCache() {
        await this.cacheManager.clearCache();
        console.log('分析缓存已清除');
    }

    // 私有方法

    /**
     * 初始化分析引擎
     */
    async initializeAnalysisEngines() {
        const engines = [
            { name: '智能分析器', engine: this.intelligentAnalyzer },
            { name: '模式识别器', engine: this.patternRecognizer },
            { name: '推荐引擎', engine: this.recommendationEngine },
            { name: '预测模型', engine: this.predictionModel },
            { name: '路径优化器', engine: this.pathOptimizer },
            { name: '数据挖掘引擎', engine: this.dataMiningEngine }
        ];

        for (const { name, engine } of engines) {
            try {
                if (engine.init && typeof engine.init === 'function') {
                    await engine.init();
                }
                console.log(`✅ ${name}初始化完成`);
            } catch (error) {
                console.warn(`⚠️ ${name}初始化失败:`, error);
            }
        }
    }

    /**
     * 收集全面学习数据
     */
    async collectComprehensiveLearningData(options) {
        const data = {
            userId: options.userId,
            timeRange: options.timeRange,
            sessions: [],
            statistics: {},
            goals: [],
            achievements: [],
            socialData: null,
            collectTime: Date.now()
        };

        try {
            // 获取学习会话数据
            data.sessions = await this.dataManager.getFilteredSessions(options.timeRange);
            
            // 获取统计数据
            data.statistics = await this.dataManager.getStatistics({ 
                timeRange: options.timeRange, 
                detailed: true 
            });
            
            // 获取目标和成就数据
            if (window.learningGoalManager) {
                data.goals = window.learningGoalManager.getGoals();
                data.achievements = window.learningGoalManager.getAchievements();
            }
            
            // 获取社交学习数据（如果可用）
            if (window.socialLearningManager) {
                data.socialData = await window.socialLearningManager.getUserSocialData(options.userId);
            }

        } catch (error) {
            console.warn('数据收集部分失败:', error);
        }

        return data;
    }

    /**
     * 设置分析调度
     */
    setupAnalysisScheduling() {
        // 每周自动分析
        setInterval(async () => {
            try {
                console.log('执行定期学习分析...');
                await this.performQuickAnalysis({ 
                    timeRange: 'week',
                    automated: true 
                });
            } catch (error) {
                console.warn('定期分析失败:', error);
            }
        }, 7 * 24 * 60 * 60 * 1000); // 7天
    }

    /**
     * 绑定事件监听器
     */
    bindEventListeners() {
        // 监听学习数据更新
        window.addEventListener('learningDataUpdate', async (event) => {
            if (event.detail.significant) {
                console.log('检测到重要学习数据更新，触发快速分析');
                await this.performQuickAnalysis({ 
                    timeRange: 'week',
                    triggered: 'data_update' 
                });
            }
        });

        // 监听用户目标变更
        window.addEventListener('learningGoalUpdate', async (event) => {
            console.log('学习目标更新，重新分析学习路径');
            // 可以触发路径重新优化
        });
    }

    /**
     * 显示分析进度
     */
    showAnalysisProgress(message, percentage) {
        // 显示进度条和消息
        if (window.app && typeof window.app.showProgress === 'function') {
            window.app.showProgress(message, percentage);
        } else {
            console.log(`[${percentage}%] ${message}`);
        }
    }

    /**
     * 隐藏分析进度
     */
    hideAnalysisProgress() {
        if (window.app && typeof window.app.hideProgress === 'function') {
            window.app.hideProgress();
        }
    }

    /**
     * 显示分析错误
     */
    showAnalysisError(message) {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }

    /**
     * 生成分析ID
     */
    generateAnalysisId() {
        return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 触发分析完成事件
     */
    triggerAnalysisCompleteEvent(analysisResult) {
        const event = new CustomEvent('learningAnalysisComplete', {
            detail: {
                analysisId: analysisResult.analysisId,
                type: 'comprehensive',
                timestamp: analysisResult.timestamp,
                keyInsights: analysisResult.keyInsights,
                recommendations: analysisResult.recommendations?.immediate || []
            }
        });
        
        window.dispatchEvent(event);
    }

    /**
     * 生成综合评估
     */
    generateOverallAssessment(analysisResults) {
        const assessment = {
            overallScore: 0.5,
            level: 'intermediate',
            strengths: [],
            challenges: [],
            progress: 'stable',
            recommendations: []
        };

        try {
            // 基于智能分析结果
            if (analysisResults.intelligentAnalysis?.overallAssessment) {
                const ia = analysisResults.intelligentAnalysis.overallAssessment;
                assessment.overallScore = ia.overallScore;
                assessment.level = ia.level;
                assessment.strengths = ia.strengths;
                assessment.challenges = ia.challenges;
            }

            // 整合其他分析结果
            if (analysisResults.patterns?.summary) {
                assessment.strengths.push(...analysisResults.patterns.summary.dominantPatterns);
            }

            if (analysisResults.predictions?.overallOutlook) {
                assessment.progress = analysisResults.predictions.overallOutlook.trajectory;
            }

        } catch (error) {
            console.warn('综合评估生成失败:', error);
        }

        return assessment;
    }

    /**
     * 提取关键洞察
     */
    extractKeyInsights(analysisResults) {
        const insights = [];

        try {
            // 从智能分析中提取洞察
            if (analysisResults.intelligentAnalysis?.insights) {
                insights.push(...analysisResults.intelligentAnalysis.insights.slice(0, 3));
            }

            // 从模式识别中提取洞察
            if (analysisResults.patterns?.summary?.keyInsights) {
                insights.push(...analysisResults.patterns.summary.keyInsights.slice(0, 2));
            }

            // 从数据挖掘中提取洞察
            if (analysisResults.dataMiningResults?.insights?.strategic) {
                insights.push(...analysisResults.dataMiningResults.insights.strategic.slice(0, 2));
            }

        } catch (error) {
            console.warn('关键洞察提取失败:', error);
        }

        return insights.slice(0, 5); // 最多5个关键洞察
    }

    /**
     * 创建行动计划
     */
    createActionPlan(analysisResults) {
        const plan = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            timeline: this.createTimeline(analysisResults)
        };

        try {
            // 从推荐引擎获取建议
            if (analysisResults.recommendations?.recommendations) {
                const recs = analysisResults.recommendations.recommendations;
                plan.immediate = recs.immediate || [];
                plan.shortTerm = recs.shortTerm || [];
                plan.longTerm = recs.longTerm || [];
            }

            // 从预测结果获取建议
            if (analysisResults.predictions?.predictions?.recommendations) {
                plan.immediate.push(...analysisResults.predictions.predictions.recommendations);
            }

        } catch (error) {
            console.warn('行动计划创建失败:', error);
        }

        return plan;
    }

    /**
     * 计算整体置信度
     */
    calculateOverallConfidence(analysisResults) {
        const confidences = [];

        try {
            if (analysisResults.intelligentAnalysis?.metadata?.confidenceLevel) {
                confidences.push(analysisResults.intelligentAnalysis.metadata.confidenceLevel);
            }

            if (analysisResults.recommendations?.metadata?.confidence) {
                confidences.push(analysisResults.recommendations.metadata.confidence);
            }

            if (analysisResults.predictions?.metadata?.reliability) {
                const reliability = analysisResults.predictions.metadata.reliability;
                const reliabilityScore = reliability === 'high' ? 0.8 : reliability === 'medium' ? 0.6 : 0.4;
                confidences.push(reliabilityScore);
            }

        } catch (error) {
            console.warn('置信度计算失败:', error);
        }

        return confidences.length > 0 ? 
            confidences.reduce((a, b) => a + b, 0) / confidences.length : 0.5;
    }
}

/**
 * 分析缓存管理器
 */
class AnalysisCacheManager {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 10;
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24小时
    }

    async cacheAnalysis(analysis) {
        if (this.cache.size >= this.maxCacheSize) {
            // 清除最旧的缓存
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(analysis.analysisId, {
            data: analysis,
            timestamp: Date.now()
        });

        // 同时保存到localStorage
        try {
            localStorage.setItem(`analysis_cache_${analysis.analysisId}`, 
                JSON.stringify({ data: analysis, timestamp: Date.now() }));
        } catch (error) {
            console.warn('缓存保存到localStorage失败:', error);
        }
    }

    async getAnalysis(analysisId) {
        // 先从内存缓存获取
        if (this.cache.has(analysisId)) {
            const cached = this.cache.get(analysisId);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.data;
            } else {
                this.cache.delete(analysisId);
            }
        }

        // 从localStorage获取
        try {
            const cached = localStorage.getItem(`analysis_cache_${analysisId}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < this.cacheExpiry) {
                    this.cache.set(analysisId, parsed);
                    return parsed.data;
                } else {
                    localStorage.removeItem(`analysis_cache_${analysisId}`);
                }
            }
        } catch (error) {
            console.warn('从localStorage读取缓存失败:', error);
        }

        return null;
    }

    async clearCache() {
        this.cache.clear();
        
        // 清除localStorage中的缓存
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('analysis_cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
}

/**
 * 分析报告生成器
 */
class AnalysisReportGenerator {
    async generate(analysisResult, options = {}) {
        const report = {
            title: '学习分析报告',
            generatedAt: new Date().toISOString(),
            type: options.type || 'comprehensive',
            sections: []
        };

        // 生成报告内容
        report.sections = [
            this.generateExecutiveSummary(analysisResult),
            this.generateDetailedAnalysis(analysisResult),
            this.generateRecommendations(analysisResult),
            this.generateActionPlan(analysisResult)
        ];

        return report;
    }

    generateExecutiveSummary(analysisResult) {
        return {
            title: '执行摘要',
            content: {
                overallScore: analysisResult.overallAssessment?.overallScore || 0.5,
                level: analysisResult.overallAssessment?.level || 'intermediate',
                keyInsights: analysisResult.keyInsights || [],
                topRecommendations: (analysisResult.recommendations?.recommendations?.immediate || []).slice(0, 3)
            }
        };
    }

    generateDetailedAnalysis(analysisResult) {
        return {
            title: '详细分析',
            content: {
                intelligentAnalysis: analysisResult.intelligentAnalysis,
                patterns: analysisResult.patterns,
                predictions: analysisResult.predictions
            }
        };
    }

    generateRecommendations(analysisResult) {
        return {
            title: '建议和推荐',
            content: analysisResult.recommendations
        };
    }

    generateActionPlan(analysisResult) {
        return {
            title: '行动计划',
            content: analysisResult.actionPlan
        };
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.EnhancedLearningAnalysisManager = EnhancedLearningAnalysisManager;
    console.log('🧠 增强学习分析管理器已加载');
}
