/**
 * 增强AI推荐引擎
 * 提供更智能的学习路径规划和个性化推荐
 */
class EnhancedAIEngine {
    constructor() {
        this.userModel = null;
        this.learningPatterns = {};
        this.knowledgeGraph = {};
        this.recommendations = [];
        this.adaptivePath = null;
        this.performancePredictor = null;
        
        // 优化：性能统计
        this.stats = {
            patternsAnalyzed: 0,
            recommendationsGenerated: 0,
            predictionsAccuracy: 0,
            avgProcessingTime: 0
        };
        
        // 优化：缓存常用计算结果
        this.computationCache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10分钟
        
        this.init();
    }

    init() {
        const logger = window.logger || console;
        logger.info('EnhancedAIEngine', '初始化增强AI推荐引擎...');
        
        try {
            // 性能标记
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('ai-engine-init-start');
            }
            
            this.initializeUserModel();
            this.buildKnowledgeGraph();
            this.initializePerformancePredictor();
            this.setupAdaptiveLearning();
            
            // 优化：设置缓存清理
            this.setupCacheCleanup();
            
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('ai-engine-init-end');
                window.performanceMonitor.measure(
                    'AI引擎初始化',
                    'ai-engine-init-start',
                    'ai-engine-init-end'
                );
            }
            
            logger.info('EnhancedAIEngine', '增强AI推荐引擎初始化完成');
        } catch (error) {
            logger.error('EnhancedAIEngine', '初始化失败:', error);
        }
    }

    /**
     * 初始化用户模型（优化版）
     */
    async initializeUserModel() {
        const logger = window.logger || console;
        
        try {
            // 优化：尝试从存储加载已有模型
            let savedModel = null;
            if (window.Storage) {
                savedModel = await window.Storage.get('ai_user_model');
            }
            
            this.userModel = savedModel || {
                // 认知特征
                cognitiveProfile: {
                    learningStyle: 'visual',
                    processingSpeed: 'medium',
                    workingMemoryCapacity: 'average',
                    attentionSpan: 'medium',
                    preferredDifficultyCurve: 'gradual'
                },
                
                // 学习偏好
                preferences: {
                    sessionLength: 30,
                    timeOfDay: 'morning',
                    breakFrequency: 15,
                    feedbackType: 'immediate',
                    motivationStyle: 'achievement'
                },
                
                // 知识状态（优化：使用对象避免Set序列化问题）
                knowledgeState: {
                    masteredConcepts: {},
                    partiallyMasteredConcepts: {},
                    weakConcepts: {},
                    forgottenConcepts: {},
                    conceptDependencies: {}
                },
                
                // 学习历史
                learningHistory: {
                    totalStudyTime: 0,
                    sessionsCompleted: 0,
                    averageSessionLength: 0,
                    performanceTrends: [],
                    errorPatterns: {},
                    learningVelocity: 1.0
                },
                
                // 目标和动机
                goals: {
                    shortTerm: [],
                    mediumTerm: [],
                    longTerm: [],
                    motivationLevel: 0.7
                },
                
                // 优化：添加时间戳
                lastUpdated: Date.now()
            };
            
            logger.info('EnhancedAIEngine', '用户模型已初始化' + (savedModel ? '(从存储加载)' : ''));
        } catch (error) {
            logger.error('EnhancedAIEngine', '用户模型初始化失败:', error);
            throw error;
        }
    }

    /**
     * 构建知识图谱
     */
    buildKnowledgeGraph() {
        this.knowledgeGraph = {
            // 词汇知识图谱
            vocabulary: {
                nodes: {
                    'basic_words': { level: 1, prerequisites: [], difficulty: 'easy' },
                    'intermediate_words': { level: 2, prerequisites: ['basic_words'], difficulty: 'medium' },
                    'advanced_words': { level: 3, prerequisites: ['intermediate_words'], difficulty: 'hard' },
                    'academic_words': { level: 4, prerequisites: ['advanced_words'], difficulty: 'expert' },
                    'idioms': { level: 3, prerequisites: ['intermediate_words'], difficulty: 'hard' },
                    'phrasal_verbs': { level: 2, prerequisites: ['basic_words'], difficulty: 'medium' },
                    'collocations': { level: 3, prerequisites: ['intermediate_words'], difficulty: 'hard' }
                },
                edges: [
                    ['basic_words', 'intermediate_words'],
                    ['intermediate_words', 'advanced_words'],
                    ['advanced_words', 'academic_words'],
                    ['intermediate_words', 'phrasal_verbs'],
                    ['intermediate_words', 'idioms'],
                    ['intermediate_words', 'collocations']
                ]
            },
            
            // 语法知识图谱
            grammar: {
                nodes: {
                    'basic_tenses': { level: 1, prerequisites: [], difficulty: 'easy' },
                    'perfect_tenses': { level: 2, prerequisites: ['basic_tenses'], difficulty: 'medium' },
                    'passive_voice': { level: 2, prerequisites: ['basic_tenses'], difficulty: 'medium' },
                    'conditional_sentences': { level: 3, prerequisites: ['basic_tenses'], difficulty: 'hard' },
                    'subjunctive_mood': { level: 4, prerequisites: ['conditional_sentences'], difficulty: 'expert' },
                    'modal_verbs': { level: 2, prerequisites: ['basic_tenses'], difficulty: 'medium' },
                    'relative_clauses': { level: 3, prerequisites: ['basic_tenses'], difficulty: 'hard' },
                    'infinitives_gerunds': { level: 3, prerequisites: ['basic_tenses'], difficulty: 'hard' }
                },
                edges: [
                    ['basic_tenses', 'perfect_tenses'],
                    ['basic_tenses', 'passive_voice'],
                    ['basic_tenses', 'modal_verbs'],
                    ['basic_tenses', 'conditional_sentences'],
                    ['conditional_sentences', 'subjunctive_mood'],
                    ['basic_tenses', 'relative_clauses'],
                    ['basic_tenses', 'infinitives_gerunds']
                ]
            },
            
            // 技能知识图谱
            skills: {
                nodes: {
                    'listening_basic': { level: 1, prerequisites: [], difficulty: 'easy' },
                    'listening_details': { level: 2, prerequisites: ['listening_basic'], difficulty: 'medium' },
                    'listening_inference': { level: 3, prerequisites: ['listening_details'], difficulty: 'hard' },
                    'reading_skimming': { level: 1, prerequisites: [], difficulty: 'easy' },
                    'reading_scanning': { level: 2, prerequisites: ['reading_skimming'], difficulty: 'medium' },
                    'reading_critical': { level: 3, prerequisites: ['reading_scanning'], difficulty: 'hard' },
                    'writing_sentences': { level: 1, prerequisites: [], difficulty: 'easy' },
                    'writing_paragraphs': { level: 2, prerequisites: ['writing_sentences'], difficulty: 'medium' },
                    'writing_essays': { level: 3, prerequisites: ['writing_paragraphs'], difficulty: 'hard' }
                },
                edges: [
                    ['listening_basic', 'listening_details'],
                    ['listening_details', 'listening_inference'],
                    ['reading_skimming', 'reading_scanning'],
                    ['reading_scanning', 'reading_critical'],
                    ['writing_sentences', 'writing_paragraphs'],
                    ['writing_paragraphs', 'writing_essays']
                ]
            }
        };
        
        const logger = window.logger || console;
        logger.info('EnhancedAIEngine', '知识图谱已构建');
    }

    /**
     * 设置缓存清理（优化）
     */
    setupCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            const keysToDelete = [];
            
            this.computationCache.forEach((value, key) => {
                if (now - value.timestamp > this.cacheTimeout) {
                    keysToDelete.push(key);
                }
            });
            
            keysToDelete.forEach(key => this.computationCache.delete(key));
            
            if (keysToDelete.length > 0 && window.logger) {
                window.logger.debug('EnhancedAIEngine', `清理了 ${keysToDelete.length} 个过期缓存`);
            }
        }, this.cacheTimeout);
    }

    /**
     * 生成缓存键
     */
    generateCacheKey(type, data) {
        const dataStr = JSON.stringify(data);
        // 简单哈希
        let hash = 0;
        for (let i = 0; i < dataStr.length; i++) {
            hash = ((hash << 5) - hash) + dataStr.charCodeAt(i);
            hash = hash & hash;
        }
        return `${type}_${Math.abs(hash).toString(16)}`;
    }

    /**
     * 获取缓存结果
     */
    getCachedResult(key) {
        const cached = this.computationCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.result;
        }
        return null;
    }

    /**
     * 缓存计算结果
     */
    cacheResult(key, result) {
        // 限制缓存大小
        if (this.computationCache.size > 100) {
            const firstKey = this.computationCache.keys().next().value;
            this.computationCache.delete(firstKey);
        }
        
        this.computationCache.set(key, {
            result,
            timestamp: Date.now()
        });
    }

    /**
     * 保存用户模型
     */
    async saveUserModel() {
        const logger = window.logger || console;
        try {
            if (window.Storage && this.userModel) {
                this.userModel.lastUpdated = Date.now();
                await window.Storage.set('ai_user_model', this.userModel);
                logger.debug('EnhancedAIEngine', '用户模型已保存');
            }
        } catch (error) {
            logger.error('EnhancedAIEngine', '保存用户模型失败:', error);
        }
    }

    /**
     * 获取引擎统计信息
     */
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.computationCache.size,
            knowledgeGraphSize: {
                vocabulary: Object.keys(this.knowledgeGraph.vocabulary?.nodes || {}).length,
                grammar: Object.keys(this.knowledgeGraph.grammar?.nodes || {}).length,
                skills: Object.keys(this.knowledgeGraph.skills?.nodes || {}).length
            },
            userModelUpdated: this.userModel?.lastUpdated 
                ? new Date(this.userModel.lastUpdated).toISOString()
                : 'never'
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.computationCache.clear();
        const logger = window.logger || console;
        logger.info('EnhancedAIEngine', '资源已清理');
    }

    /**
     * 初始化性能预测器
     */
    initializePerformancePredictor() {
        this.performancePredictor = {
            // 预测模型参数
            models: {
                shortTerm: { // 预测下次练习表现
                    weights: {
                        recentPerformance: 0.4,
                        practiceFrequency: 0.3,
                        difficultyProgression: 0.2,
                        timeGap: 0.1
                    }
                },
                mediumTerm: { // 预测本周表现
                    weights: {
                        overallTrend: 0.3,
                        consistencyScore: 0.25,
                        learningVelocity: 0.25,
                        motivationLevel: 0.2
                    }
                },
                longTerm: { // 预测考试表现
                    weights: {
                        masteryLevel: 0.35,
                        learningEfficiency: 0.25,
                        timeToExam: 0.2,
                        practiceIntensity: 0.2
                    }
                }
            },
            
            // 预测历史
            predictions: [],
            accuracy: 0.0 // 预测准确率
        };
        
        console.log('🔮 性能预测器已初始化');
    }

    /**
     * 设置自适应学习
     */
    setupAdaptiveLearning() {
        this.adaptivePath = {
            currentPath: [],
            alternativePaths: [],
            pathOptimizer: {
                // 路径优化算法
                algorithm: 'genetic', // genetic, hill_climbing, simulated_annealing
                generations: 50,
                populationSize: 20,
                mutationRate: 0.1,
                crossoverRate: 0.8
            },
            
            // 适应性触发器
            adaptationTriggers: {
                performanceThreshold: 0.6, // 当表现低于此值时调整
                stagnationPeriod: 3, // 连续多少次无进步时调整
                frustrationLevel: 0.7, // 挫折感阈值
                boredomLevel: 0.7 // 无聊感阈值
            }
        };
        
        console.log('🎯 自适应学习已设置');
    }

    /**
     * 分析学习模式（优化版）
     */
    async analyzeLearningPatterns(userActivity) {
        const logger = window.logger || console;
        const startTime = performance.now();
        
        try {
            // 优化：检查缓存
            const cacheKey = this.generateCacheKey('patterns', userActivity);
            const cached = this.getCachedResult(cacheKey);
            if (cached) {
                logger.debug('EnhancedAIEngine', '使用缓存的学习模式分析');
                return cached;
            }
            
            logger.info('EnhancedAIEngine', '开始分析学习模式...');
            
            // 优化：并行分析多个模式
            const [
                timePatterns,
                errorPatterns,
                velocityPatterns,
                attentionPatterns,
                motivationPatterns
            ] = await Promise.all([
                this.analyzeTimePatterns(userActivity),
                this.analyzeErrorPatterns(userActivity),
                this.analyzeVelocityPatterns(userActivity),
                this.analyzeAttentionPatterns(userActivity),
                this.analyzeMotivationPatterns(userActivity)
            ]);
            
            this.learningPatterns = {
                time: timePatterns,
                errors: errorPatterns,
                velocity: velocityPatterns,
                attention: attentionPatterns,
                motivation: motivationPatterns,
                lastUpdated: Date.now()
            };
            
            // 缓存结果
            this.cacheResult(cacheKey, this.learningPatterns);
            
            const duration = performance.now() - startTime;
            logger.info('EnhancedAIEngine', `学习模式分析完成，用时 ${duration.toFixed(2)}ms`);
            
            return this.learningPatterns;
            
        } catch (error) {
            logger.error('EnhancedAIEngine', '学习模式分析失败:', error);
            return {
                time: {},
                errors: {},
                velocity: {},
                attention: {},
                motivation: {},
                lastUpdated: Date.now()
            };
        }
    }

    /**
     * 分析时间模式
     */
    analyzeTimePatterns(userActivity) {
        const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        const sessionLengths = [];
        const breakPatterns = [];
        
        userActivity.forEach(activity => {
            const hour = new Date(activity.timestamp).getHours();
            const timeOfDay = hour < 6 ? 'night' : 
                            hour < 12 ? 'morning' : 
                            hour < 18 ? 'afternoon' : 'evening';
            
            timeDistribution[timeOfDay]++;
            sessionLengths.push(activity.duration);
            
            if (activity.breaks) {
                breakPatterns.push(...activity.breaks);
            }
        });
        
        return {
            preferredTime: Object.keys(timeDistribution).reduce((a, b) => 
                timeDistribution[a] > timeDistribution[b] ? a : b),
            averageSessionLength: sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length,
            optimalBreakInterval: this.calculateOptimalBreakInterval(breakPatterns),
            consistencyScore: this.calculateTimeConsistency(userActivity)
        };
    }

    /**
     * 分析错误模式
     */
    analyzeErrorPatterns(userActivity) {
        const errorTypes = {};
        const errorTrends = [];
        const conceptualErrors = {};
        
        userActivity.forEach(activity => {
            if (activity.errors) {
                activity.errors.forEach(error => {
                    errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
                    
                    if (error.concept) {
                        conceptualErrors[error.concept] = (conceptualErrors[error.concept] || 0) + 1;
                    }
                });
            }
            
            errorTrends.push({
                timestamp: activity.timestamp,
                errorRate: activity.errors ? activity.errors.length / activity.totalQuestions : 0
            });
        });
        
        return {
            commonErrorTypes: Object.entries(errorTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            problematicConcepts: Object.entries(conceptualErrors)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3),
            errorTrend: this.calculateErrorTrend(errorTrends),
            improvementAreas: this.identifyImprovementAreas(conceptualErrors)
        };
    }

    /**
     * 分析学习速度
     */
    analyzeVelocityPatterns(userActivity) {
        const velocityData = userActivity.map(activity => ({
            timestamp: activity.timestamp,
            velocity: activity.conceptsLearned / activity.duration,
            retention: activity.retentionRate || 0
        }));
        
        return {
            averageVelocity: velocityData.reduce((sum, d) => sum + d.velocity, 0) / velocityData.length,
            velocityTrend: this.calculateVelocityTrend(velocityData),
            optimalPace: this.calculateOptimalPace(velocityData),
            learningEfficiency: this.calculateLearningEfficiency(velocityData)
        };
    }

    /**
     * 分析注意力模式
     */
    analyzeAttentionPatterns(userActivity) {
        const attentionData = userActivity.filter(a => a.attentionMetrics);
        
        if (attentionData.length === 0) {
            return { averageAttention: 0.5, attentionSpan: 15, fatiguePattern: [] };
        }
        
        return {
            averageAttention: attentionData.reduce((sum, a) => sum + a.attentionMetrics.level, 0) / attentionData.length,
            attentionSpan: this.calculateAttentionSpan(attentionData),
            fatiguePattern: this.analyzeFatiguePattern(attentionData),
            optimalSessionLength: this.calculateOptimalSessionLength(attentionData)
        };
    }

    /**
     * 分析动机模式
     */
    analyzeMotivationPatterns(userActivity) {
        const motivationData = userActivity.filter(a => a.motivationMetrics);
        
        if (motivationData.length === 0) {
            return { averageMotivation: 0.5, motivationTrend: 'stable', triggers: [] };
        }
        
        return {
            averageMotivation: motivationData.reduce((sum, a) => sum + a.motivationMetrics.level, 0) / motivationData.length,
            motivationTrend: this.calculateMotivationTrend(motivationData),
            motivationalTriggers: this.identifyMotivationalTriggers(motivationData),
            demotivationalFactors: this.identifyDemotivationalFactors(motivationData)
        };
    }

    /**
     * 生成智能推荐
     */
    generateIntelligentRecommendations(userContext) {
        console.log('🧠 生成智能推荐...');
        
        const recommendations = [];
        
        // 基于知识图谱的内容推荐
        const contentRecs = this.generateContentRecommendations();
        
        // 基于学习模式的策略推荐
        const strategyRecs = this.generateStrategyRecommendations();
        
        // 基于性能预测的调整推荐
        const adjustmentRecs = this.generateAdjustmentRecommendations();
        
        // 基于动机的激励推荐
        const motivationRecs = this.generateMotivationRecommendations();
        
        return [
            ...contentRecs,
            ...strategyRecs,
            ...adjustmentRecs,
            ...motivationRecs
        ].sort((a, b) => b.priority - a.priority);
    }

    /**
     * 生成内容推荐
     */
    generateContentRecommendations() {
        const recommendations = [];
        const userLevel = this.estimateUserLevel();
        const knowledgeGaps = this.identifyKnowledgeGaps();
        
        knowledgeGaps.forEach(gap => {
            const recommendation = {
                type: 'content',
                category: gap.category,
                content: gap.content,
                reason: `基于知识图谱分析，您在${gap.area}方面需要加强`,
                priority: gap.importance,
                estimatedTime: gap.estimatedTime,
                difficulty: gap.difficulty,
                prerequisites: gap.prerequisites || []
            };
            
            recommendations.push(recommendation);
        });
        
        return recommendations;
    }

    /**
     * 生成策略推荐
     */
    generateStrategyRecommendations() {
        const recommendations = [];
        const patterns = this.learningPatterns;
        
        // 时间策略推荐
        if (patterns.time) {
            if (patterns.time.consistencyScore < 0.6) {
                recommendations.push({
                    type: 'strategy',
                    category: 'time_management',
                    title: '建立规律学习时间',
                    description: '建议在每天的同一时间进行学习，有助于形成学习习惯',
                    priority: 0.8,
                    actionItems: [
                        '选择一个固定的学习时间段',
                        '设置学习提醒',
                        '坚持21天养成习惯'
                    ]
                });
            }
        }
        
        // 错误策略推荐
        if (patterns.errors) {
            if (patterns.errors.errorTrend > 0.1) {
                recommendations.push({
                    type: 'strategy',
                    category: 'error_reduction',
                    title: '针对性错误练习',
                    description: '专门练习您经常出错的题型，提高准确率',
                    priority: 0.9,
                    actionItems: [
                        '分析错误原因',
                        '制作错题本',
                        '定期复习错题'
                    ]
                });
            }
        }
        
        return recommendations;
    }

    /**
     * 生成调整推荐
     */
    generateAdjustmentRecommendations() {
        const recommendations = [];
        const prediction = this.predictPerformance('shortTerm');
        
        if (prediction.expectedPerformance < 0.7) {
            recommendations.push({
                type: 'adjustment',
                category: 'difficulty',
                title: '降低学习难度',
                description: '当前内容可能过于困难，建议调整到更适合的难度',
                priority: 0.85,
                adjustments: {
                    difficulty: 'reduce',
                    amount: 0.2,
                    duration: '3-5天'
                }
            });
        }
        
        return recommendations;
    }

    /**
     * 生成动机推荐
     */
    generateMotivationRecommendations() {
        const recommendations = [];
        const motivationLevel = this.userModel.goals.motivationLevel;
        
        if (motivationLevel < 0.5) {
            recommendations.push({
                type: 'motivation',
                category: 'engagement',
                title: '增加学习趣味性',
                description: '尝试游戏化学习方式，提高学习兴趣',
                priority: 0.7,
                suggestions: [
                    '参与词汇挑战游戏',
                    '设置短期可达成的目标',
                    '加入学习小组互动'
                ]
            });
        }
        
        return recommendations;
    }

    /**
     * 预测学习表现
     */
    predictPerformance(timeframe = 'shortTerm') {
        const model = this.performancePredictor.models[timeframe];
        const userData = this.gatherUserData();
        
        let prediction = 0;
        
        Object.entries(model.weights).forEach(([factor, weight]) => {
            const factorValue = this.calculateFactor(factor, userData);
            prediction += factorValue * weight;
        });
        
        // 添加不确定性
        const uncertainty = this.calculateUncertainty(userData);
        
        return {
            expectedPerformance: Math.max(0, Math.min(1, prediction)),
            confidence: 1 - uncertainty,
            factors: this.getInfluentialFactors(model, userData),
            timeframe: timeframe
        };
    }

    /**
     * 优化学习路径
     */
    optimizeLearningPath() {
        console.log('🎯 优化学习路径...');
        
        const currentPath = this.adaptivePath.currentPath;
        const userGoals = this.userModel.goals;
        const learningConstraints = this.getLearningConstraints();
        
        // 使用遗传算法优化路径
        const optimizer = new PathOptimizer({
            algorithm: this.adaptivePath.pathOptimizer.algorithm,
            generations: this.adaptivePath.pathOptimizer.generations,
            populationSize: this.adaptivePath.pathOptimizer.populationSize
        });
        
        const optimizedPath = optimizer.optimize({
            currentPath,
            goals: userGoals,
            constraints: learningConstraints,
            knowledgeGraph: this.knowledgeGraph,
            userModel: this.userModel
        });
        
        return optimizedPath;
    }

    /**
     * 实时适应调整
     */
    adaptInRealTime(currentActivity) {
        const triggers = this.adaptivePath.adaptationTriggers;
        let shouldAdapt = false;
        let adaptationReason = '';
        
        // 检查表现阈值
        if (currentActivity.performance < triggers.performanceThreshold) {
            shouldAdapt = true;
            adaptationReason = 'performance_low';
        }
        
        // 检查停滞期
        if (this.detectStagnation(triggers.stagnationPeriod)) {
            shouldAdapt = true;
            adaptationReason = 'stagnation_detected';
        }
        
        // 检查挫折感
        if (currentActivity.frustrationLevel > triggers.frustrationLevel) {
            shouldAdapt = true;
            adaptationReason = 'frustration_high';
        }
        
        // 检查无聊感
        if (currentActivity.boredomLevel > triggers.boredomLevel) {
            shouldAdapt = true;
            adaptationReason = 'boredom_high';
        }
        
        if (shouldAdapt) {
            return this.performAdaptation(adaptationReason, currentActivity);
        }
        
        return null;
    }

    /**
     * 执行适应调整
     */
    performAdaptation(reason, context) {
        console.log(`🔄 执行适应调整: ${reason}`);
        
        const adaptations = {
            performance_low: () => ({
                action: 'reduce_difficulty',
                amount: 0.1,
                duration: 3
            }),
            stagnation_detected: () => ({
                action: 'change_approach',
                newApproach: this.suggestAlternativeApproach(),
                duration: 5
            }),
            frustration_high: () => ({
                action: 'provide_support',
                supportType: 'hints_and_encouragement',
                duration: 1
            }),
            boredom_high: () => ({
                action: 'increase_variety',
                varietyType: 'new_content_types',
                duration: 2
            })
        };
        
        return adaptations[reason] ? adaptations[reason]() : null;
    }

    /**
     * 计算学习效率
     */
    calculateLearningEfficiency(data) {
        if (!data || data.length === 0) return 0.5;
        
        const retentionWeighted = data.reduce((sum, d) => sum + (d.velocity * d.retention), 0);
        const totalVelocity = data.reduce((sum, d) => sum + d.velocity, 0);
        
        return totalVelocity > 0 ? retentionWeighted / totalVelocity : 0.5;
    }

    /**
     * 识别知识缺口
     */
    identifyKnowledgeGaps() {
        const gaps = [];
        const knowledgeState = this.userModel.knowledgeState;
        
        // 分析各个知识领域
        Object.entries(this.knowledgeGraph).forEach(([domain, graph]) => {
            Object.entries(graph.nodes).forEach(([concept, info]) => {
                // 检查前置条件是否满足
                const prerequisitesMet = info.prerequisites.every(prereq => 
                    knowledgeState.masteredConcepts.has(prereq)
                );
                
                // 如果前置条件满足但概念未掌握，则为知识缺口
                if (prerequisitesMet && !knowledgeState.masteredConcepts.has(concept)) {
                    gaps.push({
                        category: domain,
                        concept: concept,
                        area: concept.replace(/_/g, ' '),
                        importance: this.calculateConceptImportance(concept, domain),
                        difficulty: info.difficulty,
                        estimatedTime: this.estimateTimeToMaster(concept),
                        prerequisites: info.prerequisites
                    });
                }
            });
        });
        
        return gaps.sort((a, b) => b.importance - a.importance);
    }

    /**
     * 估算用户水平
     */
    estimateUserLevel() {
        const knowledgeState = this.userModel.knowledgeState;
        const totalConcepts = Object.values(this.knowledgeGraph)
            .reduce((total, domain) => total + Object.keys(domain.nodes).length, 0);
        
        const masteredCount = knowledgeState.masteredConcepts.size;
        const partialCount = knowledgeState.partiallyMasteredConcepts.size;
        
        const masteryScore = (masteredCount + partialCount * 0.5) / totalConcepts;
        
        return {
            overall: masteryScore,
            beginner: masteryScore < 0.25,
            intermediate: masteryScore >= 0.25 && masteryScore < 0.65,
            advanced: masteryScore >= 0.65 && masteryScore < 0.85,
            expert: masteryScore >= 0.85
        };
    }

    /**
     * 计算概念重要性
     */
    calculateConceptImportance(concept, domain) {
        // 基于概念在知识图谱中的连接度和用户目标计算重要性
        const graph = this.knowledgeGraph[domain];
        const connections = graph.edges.filter(edge => 
            edge.includes(concept)
        ).length;
        
        const goalRelevance = this.calculateGoalRelevance(concept);
        
        return (connections * 0.4 + goalRelevance * 0.6);
    }

    /**
     * 计算目标相关性
     */
    calculateGoalRelevance(concept) {
        // 根据用户目标计算概念的相关性
        const goals = this.userModel.goals;
        let relevance = 0.5; // 基础相关性
        
        // 检查短期目标
        goals.shortTerm.forEach(goal => {
            if (goal.relatedConcepts && goal.relatedConcepts.includes(concept)) {
                relevance += 0.3;
            }
        });
        
        // 检查中期目标
        goals.mediumTerm.forEach(goal => {
            if (goal.relatedConcepts && goal.relatedConcepts.includes(concept)) {
                relevance += 0.2;
            }
        });
        
        return Math.min(1.0, relevance);
    }

    /**
     * 获取用户数据
     */
    gatherUserData() {
        return {
            recentPerformance: this.calculateRecentPerformance(),
            practiceFrequency: this.calculatePracticeFrequency(),
            learningVelocity: this.userModel.learningHistory.learningVelocity,
            motivationLevel: this.userModel.goals.motivationLevel,
            masteryLevel: this.calculateMasteryLevel(),
            consistencyScore: this.calculateConsistencyScore()
        };
    }

    /**
     * 计算影响因子
     */
    calculateFactor(factor, userData) {
        const factors = {
            recentPerformance: () => userData.recentPerformance || 0.5,
            practiceFrequency: () => userData.practiceFrequency || 0.5,
            learningVelocity: () => userData.learningVelocity || 1.0,
            motivationLevel: () => userData.motivationLevel || 0.5,
            masteryLevel: () => userData.masteryLevel || 0.5,
            consistencyScore: () => userData.consistencyScore || 0.5
        };
        
        return factors[factor] ? factors[factor]() : 0.5;
    }

    /**
     * 获取学习约束
     */
    getLearningConstraints() {
        return {
            timeConstraints: {
                dailyTime: this.userModel.preferences.sessionLength,
                weeklyTime: this.userModel.preferences.sessionLength * 5,
                deadline: this.getUserDeadline()
            },
            difficultyConstraints: {
                maxDifficulty: this.getMaxSuitableDifficulty(),
                minDifficulty: this.getMinSuitableDifficulty()
            },
            resourceConstraints: {
                availableContent: this.getAvailableContent(),
                preferredTypes: this.getPreferredContentTypes()
            }
        };
    }

    /**
     * 保存AI状态
     */
    saveAIState() {
        const aiState = {
            userModel: this.userModel,
            learningPatterns: this.learningPatterns,
            recommendations: this.recommendations,
            adaptivePath: this.adaptivePath,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem('ai_enhanced_state', JSON.stringify(aiState));
        console.log('💾 AI状态已保存');
    }

    /**
     * 加载AI状态
     */
    loadAIState() {
        try {
            const savedState = localStorage.getItem('ai_enhanced_state');
            if (savedState) {
                const aiState = JSON.parse(savedState);
                this.userModel = { ...this.userModel, ...aiState.userModel };
                this.learningPatterns = aiState.learningPatterns || {};
                this.recommendations = aiState.recommendations || [];
                this.adaptivePath = { ...this.adaptivePath, ...aiState.adaptivePath };
                console.log('📥 AI状态已加载');
            }
        } catch (error) {
            console.error('❌ 加载AI状态失败:', error);
        }
    }
}

/**
 * 路径优化器类
 */
class PathOptimizer {
    constructor(config) {
        this.config = config;
    }
    
    optimize(params) {
        // 简化的路径优化实现
        console.log('🔧 正在优化学习路径...');
        
        const { currentPath, goals, constraints, knowledgeGraph } = params;
        
        // 生成候选路径
        const candidatePaths = this.generateCandidatePaths(currentPath, constraints);
        
        // 评估路径质量
        const evaluatedPaths = candidatePaths.map(path => ({
            path,
            score: this.evaluatePathQuality(path, goals, constraints)
        }));
        
        // 选择最优路径
        const bestPath = evaluatedPaths.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        return bestPath.path;
    }
    
    generateCandidatePaths(currentPath, constraints) {
        // 简化实现：生成几个候选路径
        return [
            currentPath, // 当前路径
            this.generateAlternativePath(currentPath, 'efficiency'),
            this.generateAlternativePath(currentPath, 'engagement'),
            this.generateAlternativePath(currentPath, 'difficulty_adjusted')
        ];
    }
    
    generateAlternativePath(basePath, strategy) {
        // 根据策略生成替代路径
        return basePath.map(item => ({
            ...item,
            modified: true,
            strategy
        }));
    }
    
    evaluatePathQuality(path, goals, constraints) {
        // 基于路径长度和目标匹配度的质量评估
        if (!path || !goals) return 0;
        
        const pathLength = path.length || 1;
        const goalAlignment = this.calculateGoalAlignment(path, goals);
        const constraintViolations = this.checkConstraintViolations(path, constraints);
        
        // 计算质量分数 (0-1)
        const lengthScore = Math.min(1, 1 / pathLength); // 路径越短越好
        const alignmentScore = goalAlignment; // 目标对齐度
        const constraintScore = 1 - constraintViolations; // 约束违反越少越好
        
        return (lengthScore * 0.3 + alignmentScore * 0.5 + constraintScore * 0.2);
    }
    
    /**
     * 计算目标对齐度
     */
    calculateGoalAlignment(path, goals) {
        if (!goals || Object.keys(goals).length === 0) return 0.5;
        
        let alignment = 0;
        const goalCount = Object.keys(goals).length;
        
        // 简单的对齐度计算
        if (goals.examType && path.some(step => step.includes(goals.examType))) {
            alignment += 0.4;
        }
        if (goals.timeframe && path.length <= (goals.timeframe / 7)) {
            alignment += 0.3;
        }
        if (goals.difficulty) {
            alignment += 0.3;
        }
        
        return Math.min(1, alignment);
    }
    
    /**
     * 检查约束违反
     */
    checkConstraintViolations(path, constraints) {
        if (!constraints) return 0;
        
        let violations = 0;
        const maxViolations = Object.keys(constraints).length;
        
        // 检查时间约束
        if (constraints.maxTime && path.length > constraints.maxTime) {
            violations++;
        }
        
        // 检查难度约束
        if (constraints.maxDifficulty) {
            violations += 0.1; // 假设有轻微违反
        }
        
        return maxViolations > 0 ? violations / maxViolations : 0;
    }
}

// 创建全局实例
window.EnhancedAIEngine = new EnhancedAIEngine();
