/**
 * 自适应学习路径系统
 * 基于教育心理学理论和AI算法动态生成个性化学习路径
 */

class AdaptiveLearningPath {
    constructor() {
        // ZPD (最近发展区) 参数
        this.zpdParameters = {
            currentLevel: 0,
            potentialLevel: 0,
            scaffoldingLevel: 0,
            challengeOptimal: 0.7 // 最优挑战度 (70%)
        };

        // 能力评估维度
        this.abilityDimensions = [
            'vocabulary_knowledge',
            'grammar_understanding', 
            'listening_comprehension',
            'reading_proficiency',
            'speaking_fluency',
            'writing_capability'
        ];

        // 学习路径优化算法
        this.pathOptimizer = new GeneticAlgorithmOptimizer();
        
        // 认知负载管理
        this.cognitiveLoadManager = new CognitiveLoadManager();

        // 多元智能适配器
        this.intelligenceAdaptor = new MultipleIntelligenceAdaptor();

        // 学习理论应用器
        this.learningTheories = {
            zpd: new ZPDManager(),
            constructivist: new ConstructivistLearningManager(),
            cognitiveLoad: new CognitiveLoadOptimizer()
        };

        // 路径缓存
        this.pathCache = new Map();
    }

    /**
     * 生成自适应学习路径
     * @param {Object} learnerProfile - 学习者画像
     * @param {Object} learningGoals - 学习目标
     * @param {Array} availableContent - 可用学习内容
     * @param {Object} weaknessAnalysis - 薄弱点分析结果
     * @returns {Object} 自适应学习路径
     */
    async generateAdaptivePath(learnerProfile, learningGoals, availableContent, weaknessAnalysis) {
        console.log('🛤️ 开始生成自适应学习路径...');

        try {
            // 1. 计算最近发展区
            const zpd = await this.calculateZPD(learnerProfile, weaknessAnalysis);

            // 2. 分析多元智能类型
            const intelligenceProfile = await this.analyzeIntelligenceProfile(learnerProfile);

            // 3. 设计建构主义学习路径
            const constructivistPath = await this.designConstructivistPath(learnerProfile, learningGoals);

            // 4. 优化认知负载
            const cognitiveOptimizedPath = await this.optimizeCognitiveLoad(constructivistPath, learnerProfile);

            // 5. 应用遗传算法优化
            const geneticOptimizedPath = await this.applyGeneticOptimization(cognitiveOptimizedPath, learnerProfile);

            // 6. 集成个性化因子
            const personalizedPath = await this.integratePersonalizationFactors(
                geneticOptimizedPath, 
                intelligenceProfile || { primaryIntelligences: [] }, 
                zpd || { currentLevel: 'beginner', targetLevel: 'intermediate' }
            );

            // 7. 验证和调整路径
            const finalPath = await this.validateAndAdjustPath(personalizedPath, learnerProfile);

            console.log('✅ 自适应学习路径生成完成', finalPath);
            return finalPath;

        } catch (error) {
            console.error('❌ 学习路径生成失败:', error);
            return this.generateFallbackPath(learnerProfile, weaknessAnalysis);
        }
    }

    /**
     * 计算最近发展区 (ZPD)
     */
    async calculateZPD(learnerProfile, assessmentData) {
        console.log('🎯 计算最近发展区...');

        const zpd = {
            currentZone: {},
            optimalChallengeLevel: {},
            scaffoldingNeeds: {},
            nextTargets: {}
        };

        // 为每个能力维度计算ZPD
        for (const dimension of this.abilityDimensions) {
            const currentLevel = this.assessCurrentLevel(assessmentData, dimension);
            const potentialLevel = this.estimatePotentialLevel(learnerProfile, dimension);

            zpd.currentZone[dimension] = {
                lower_bound: currentLevel,
                upper_bound: potentialLevel,
                width: potentialLevel - currentLevel,
                confidence: this.calculateConfidence(assessmentData, dimension)
            };

            zpd.optimalChallengeLevel[dimension] = this.calculateOptimalChallenge(
                currentLevel, 
                potentialLevel
            );

            zpd.scaffoldingNeeds[dimension] = this.determineScaffoldingNeeds(
                currentLevel,
                zpd.optimalChallengeLevel[dimension]
            );
        }

        return zpd;
    }

    /**
     * 分析多元智能类型
     */
    async analyzeIntelligenceProfile(learnerData) {
        console.log('🧠 分析多元智能类型...');

        const intelligenceTypes = {
            linguistic: 0,
            logical_mathematical: 0,
            spatial: 0,
            musical: 0,
            bodily_kinesthetic: 0,
            interpersonal: 0,
            intrapersonal: 0,
            naturalist: 0
        };

        // 计算各智能类型得分
        Object.keys(intelligenceTypes).forEach(type => {
            intelligenceTypes[type] = this.calculateIntelligenceScore(learnerData, type);
        });

        // 排序并分类
        const sortedIntelligences = Object.entries(intelligenceTypes)
            .sort(([,a], [,b]) => b - a);

        return {
            primaryIntelligences: sortedIntelligences.slice(0, 2).map(([type, score]) => ({ type, score })),
            secondaryIntelligences: sortedIntelligences.slice(2, 4).map(([type, score]) => ({ type, score })),
            intelligenceScores: intelligenceTypes,
            adaptationRecommendations: this.generateAdaptationRecommendations(intelligenceTypes)
        };
    }

    /**
     * 设计建构主义学习路径
     */
    async designConstructivistPath(learnerProfile, targetKnowledge) {
        console.log('🏗️ 设计建构主义学习路径...');

        const path = {
            knowledgeMapping: {},
            constructionSequence: [],
            scaffoldingStrategy: {},
            socialInteractionOpportunities: [],
            reflectionPoints: []
        };

        // 1. 映射现有知识结构
        path.knowledgeMapping = this.mapExistingKnowledge(learnerProfile);

        // 2. 设计知识建构序列
        path.constructionSequence = this.designConstructionSequence(
            path.knowledgeMapping,
            targetKnowledge
        );

        // 3. 制定脚手架策略
        path.scaffoldingStrategy = this.developScaffoldingStrategy(path.constructionSequence);

        // 4. 安排社会互动机会
        path.socialInteractionOpportunities = this.planSocialInteractions(path.constructionSequence);

        // 5. 设置反思节点
        path.reflectionPoints = this.designReflectionPoints(path.constructionSequence);

        return path;
    }

    /**
     * 优化认知负载
     */
    async optimizeCognitiveLoad(learningPath, learnerCapacity) {
        console.log('⚖️ 优化认知负载...');

        const optimizedPath = [];

        for (const step of learningPath.constructionSequence) {
            // 分析当前步骤的认知负载
            const loadAnalysis = this.analyzeCognitiveLoad(step);

            // 检查是否超过认知容量
            if (this.exceedsCognitiveCapacity(loadAnalysis, learnerCapacity)) {
                // 应用负载控制策略
                const optimizedSteps = this.applyCognitiveLoadControl(step, loadAnalysis);
                optimizedPath.push(...optimizedSteps);
            } else {
                optimizedPath.push(step);
            }
        }

        // 验证整体负载分布
        return this.validateOverallLoadDistribution(optimizedPath);
    }

    /**
     * 应用遗传算法优化
     */
    async applyGeneticOptimization(learningPath, learnerProfile) {
        console.log('🧬 应用遗传算法优化...');

        const geneticParams = {
            populationSize: 50,
            generations: 30,
            crossoverRate: 0.8,
            mutationRate: 0.1
        };

        // 初始化种群
        let population = this.initializePathPopulation(learningPath, geneticParams.populationSize);

        let bestFitness = 0;
        let bestPath = null;

        // 进化过程
        for (let generation = 0; generation < geneticParams.generations; generation++) {
            // 评估适应度
            const fitnessScores = population.map(path => this.evaluatePathFitness(path, learnerProfile));

            // 找到最佳个体
            const maxFitnessIndex = fitnessScores.indexOf(Math.max(...fitnessScores));
            if (fitnessScores[maxFitnessIndex] > bestFitness) {
                bestFitness = fitnessScores[maxFitnessIndex];
                bestPath = population[maxFitnessIndex];
            }

            // 选择、交叉、变异
            population = this.evolvePopulation(population, fitnessScores, geneticParams);
        }

        return bestPath || learningPath;
    }

    /**
     * 集成个性化因子
     */
    async integratePersonalizationFactors(path, intelligenceProfile, zpd) {
        console.log('🎨 集成个性化因子...');

        const personalizedPath = JSON.parse(JSON.stringify(path)); // 深拷贝

        // 根据多元智能调整学习活动
        if (personalizedPath.constructionSequence && Array.isArray(personalizedPath.constructionSequence)) {
            personalizedPath.constructionSequence = personalizedPath.constructionSequence.map(step => {
            const adaptedStep = { ...step };

            // 根据主要智能类型调整活动
            if (intelligenceProfile && intelligenceProfile.primaryIntelligences) {
                intelligenceProfile.primaryIntelligences.forEach(({ type, score }) => {
                    adaptedStep.activities = this.adaptActivitiesForIntelligence(step.activities, type, score);
                });
            }

            return adaptedStep;
            });
        }

        // 根据ZPD调整难度
        if (personalizedPath.constructionSequence && Array.isArray(personalizedPath.constructionSequence)) {
            personalizedPath.constructionSequence = this.adjustDifficultyBasedOnZPD(
                personalizedPath.constructionSequence,
                zpd
            );
        }

        // 添加个性化脚手架
        personalizedPath.scaffoldingStrategy = this.personalizeScaffolding(
            personalizedPath.scaffoldingStrategy,
            intelligenceProfile
        );

        return personalizedPath;
    }

    /**
     * 验证和调整路径
     */
    async validateAndAdjustPath(path, learnerProfile) {
        console.log('✅ 验证和调整路径...');

        const validatedPath = { ...path };

        // 1. 检查路径完整性
        validatedPath.isComplete = this.checkPathCompleteness(path);

        // 2. 估算学习时间
        validatedPath.estimatedDuration = this.estimatePathDuration(path);

        // 3. 评估路径难度
        validatedPath.difficultyProgression = this.evaluateDifficultyProgression(path);

        // 4. 添加检查点
        validatedPath.checkpoints = this.addProgressCheckpoints(path);

        // 5. 生成路径元数据
        validatedPath.metadata = {
            createdAt: Date.now(),
            learnerProfile: learnerProfile.id,
            version: '1.0',
            optimization: {
                zpdOptimized: true,
                cognitiveLoadOptimized: true,
                intelligenceAdapted: true,
                geneticallyOptimized: true
            }
        };

        return validatedPath;
    }

    /**
     * 评估当前能力水平
     */
    assessCurrentLevel(assessmentData, dimension) {
        const recentPerformance = this.getRecentPerformance(assessmentData, dimension);
        if (!recentPerformance || recentPerformance.length === 0) {
            return 0.3; // 默认初学者水平
        }

        const consistentPerformance = this.filterConsistentPerformance(recentPerformance);
        
        return {
            score: this.calculateWeightedAverage(consistentPerformance),
            stability: this.calculatePerformanceStability(consistentPerformance),
            trend: this.calculatePerformanceTrend(consistentPerformance),
            lastAssessment: this.getLastAssessmentDate(assessmentData, dimension)
        };
    }

    /**
     * 估算潜在发展水平
     */
    estimatePotentialLevel(learnerProfile, dimension) {
        const factors = {
            motivation: learnerProfile.motivation?.[dimension] || 0.5,
            priorExperience: learnerProfile.priorExperience?.[dimension] || 0.5,
            learningStyle: this.getLearningStyleFit(learnerProfile.learningStyle, dimension),
            cognitiveCapacity: learnerProfile.cognitiveCapacity || 0.5,
            timeAvailable: this.normalizeTimeAvailability(learnerProfile.timeAvailable)
        };

        // 使用加权模型估算潜在水平
        const weights = { 
            motivation: 0.25, 
            priorExperience: 0.2, 
            learningStyle: 0.2, 
            cognitiveCapacity: 0.2, 
            timeAvailable: 0.15 
        };

        const potentialBoost = Object.keys(factors).reduce((boost, factor) => {
            return boost + factors[factor] * weights[factor];
        }, 0);

        return potentialBoost;
    }

    /**
     * 计算智能类型得分
     */
    calculateIntelligenceScore(learnerData, intelligenceType) {
        let score = 0;
        let totalWeight = 0;

        // 基于学习行为数据计算得分
        const behaviorIndicators = this.extractBehaviorIndicators(learnerData, intelligenceType);
        behaviorIndicators.forEach(indicator => {
            score += indicator.value * indicator.weight;
            totalWeight += indicator.weight;
        });

        // 基于偏好数据计算得分
        const preferenceIndicators = this.extractPreferenceIndicators(learnerData, intelligenceType);
        preferenceIndicators.forEach(indicator => {
            score += indicator.value * indicator.weight;
            totalWeight += indicator.weight;
        });

        return totalWeight > 0 ? score / totalWeight : 0;
    }

    /**
     * 生成适应性建议
     */
    generateAdaptationRecommendations(intelligenceScores) {
        const recommendations = {
            learningActivities: [],
            contentPresentation: [],
            assessmentMethods: [],
            motivationStrategies: []
        };

        // 基于主要智能类型生成建议
        const sortedIntelligences = Object.entries(intelligenceScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2);

        sortedIntelligences.forEach(([type, score]) => {
            const adaptations = this.getIntelligenceAdaptations(type);
            
            recommendations.learningActivities.push(...adaptations.activities.map(activity => ({
                activity,
                intelligenceType: type,
                priority: 'high',
                expectedEffectiveness: score
            })));

            recommendations.contentPresentation.push(...adaptations.presentation);
            recommendations.assessmentMethods.push(...adaptations.assessment);
            recommendations.motivationStrategies.push(...adaptations.motivation);
        });

        return recommendations;
    }

    /**
     * 映射现有知识结构
     */
    mapExistingKnowledge(learnerProfile) {
        const knowledgeMap = {
            concepts: {},
            connections: [],
            misconceptions: [],
            gaps: []
        };

        // 分析概念掌握度
        if (learnerProfile.knowledgeState) {
            Object.entries(learnerProfile.knowledgeState).forEach(([concept, data]) => {
                knowledgeMap.concepts[concept] = {
                    mastery_level: data.masteryLevel || 0,
                    understanding_depth: data.understandingDepth || 0,
                    application_ability: data.applicationAbility || 0,
                    connection_strength: this.calculateConnectionStrength(concept, learnerProfile)
                };
            });
        }

        // 识别概念间连接
        knowledgeMap.connections = this.identifyConceptConnections(knowledgeMap.concepts);

        // 检测误解和知识缺口
        knowledgeMap.misconceptions = this.detectMisconceptions(learnerProfile);
        knowledgeMap.gaps = this.identifyKnowledgeGaps(knowledgeMap.concepts);

        return knowledgeMap;
    }

    /**
     * 设计知识建构序列
     */
    designConstructionSequence(currentKnowledge, targetKnowledge) {
        const sequence = [];
        const constructionGraph = this.buildConstructionGraph(currentKnowledge, targetKnowledge);

        // 使用拓扑排序确定建构顺序
        const topologicalOrder = this.topologicalSort(constructionGraph);

        topologicalOrder.forEach((knowledgeNode, index) => {
            const constructionStep = {
                step_number: index + 1,
                target_concept: knowledgeNode.concept,
                construction_type: this.determineConstructionType(knowledgeNode),
                prerequisites: knowledgeNode.prerequisites,
                activities: this.designLearningActivities(knowledgeNode),
                assessment_criteria: this.defineAssessmentCriteria(knowledgeNode),
                estimated_duration: this.estimateConstructionTime(knowledgeNode)
            };

            sequence.push(constructionStep);
        });

        return sequence;
    }

    /**
     * 制定脚手架策略
     */
    developScaffoldingStrategy(constructionSequence) {
        const strategy = {
            type: 'adaptive_scaffolding',
            levels: [],
            supports: {},
            fadingPlan: {}
        };

        constructionSequence.forEach((step, index) => {
            // 为每个步骤设计脚手架支持
            const scaffoldLevel = {
                step_number: step.step_number,
                support_type: this.determineScaffoldType(step),
                support_intensity: this.calculateSupportIntensity(step, index),
                fading_schedule: this.createFadingSchedule(step)
            };

            strategy.levels.push(scaffoldLevel);
            strategy.supports[step.step_number] = this.designSpecificSupports(step);
        });

        return strategy;
    }

    /**
     * 安排社会互动机会
     */
    planSocialInteractions(constructionSequence) {
        const interactions = [];

        constructionSequence.forEach((step, index) => {
            if (this.requiresSocialInteraction(step)) {
                interactions.push({
                    step_number: step.step_number,
                    interaction_type: 'peer_collaboration',
                    group_size: this.determineOptimalGroupSize(step),
                    interaction_goals: this.defineInteractionGoals(step),
                    facilitation_guidelines: this.createFacilitationGuidelines(step)
                });
            }
        });

        return interactions;
    }

    /**
     * 设置反思节点
     */
    designReflectionPoints(constructionSequence) {
        const reflectionPoints = [];

        constructionSequence.forEach((step, index) => {
            // 每3-4个步骤设置一个反思点
            if ((index + 1) % 3 === 0 || index === constructionSequence.length - 1) {
                reflectionPoints.push({
                    step_number: step.step_number,
                    reflection_type: 'metacognitive',
                    reflection_prompts: this.generateReflectionPrompts(step),
                    reflection_tools: this.selectReflectionTools(step)
                });
            }
        });

        return reflectionPoints;
    }

    // 辅助方法
    determineScaffoldType(step) {
        return 'guided_practice';
    }

    calculateSupportIntensity(step, index) {
        return Math.max(0.3, 1 - (index * 0.1));
    }

    createFadingSchedule(step) {
        return { initial: 'high', middle: 'medium', final: 'minimal' };
    }

    designSpecificSupports(step) {
        return {
            hints: [],
            examples: [],
            templates: []
        };
    }

    requiresSocialInteraction(step) {
        return Math.random() > 0.7; // 30% 的步骤需要社会互动
    }

    determineOptimalGroupSize(step) {
        return Math.floor(Math.random() * 3) + 2; // 2-4人小组
    }

    defineInteractionGoals(step) {
        return [`掌握${step.target_concept}`, '促进同伴学习'];
    }

    createFacilitationGuidelines(step) {
        return ['鼓励积极参与', '引导深度思考'];
    }

    generateReflectionPrompts(step) {
        return [
            `我在学习${step.target_concept}时遇到了什么困难？`,
            '我使用了哪些策略来解决问题？',
            '我学到了什么新知识？'
        ];
    }

    selectReflectionTools(step) {
        return ['学习日志', '思维导图', '自我评估量表'];
    }

    /**
     * 生成回退路径
     */
    generateFallbackPath(learnerProfile, weaknessAnalysis) {
        console.log('🔄 生成回退学习路径...');

        const fallbackPath = {
            constructionSequence: [],
            scaffoldingStrategy: {},
            isOptimized: false,
            fallbackReason: '优化算法失败，使用基础路径'
        };

        // 基于薄弱点生成基础学习步骤
        if (weaknessAnalysis.overall.primaryWeaknesses.length > 0) {
            weaknessAnalysis.overall.primaryWeaknesses.forEach((weakness, index) => {
                fallbackPath.constructionSequence.push({
                    step_number: index + 1,
                    target_concept: weakness.module,
                    construction_type: 'incremental_building',
                    activities: this.getBasicActivities(weakness.module),
                    estimated_duration: 30,
                    difficulty: 0.3
                });
            });
        }

        return fallbackPath;
    }

    // 辅助方法实现
    calculateOptimalChallenge(currentLevel, potentialLevel) {
        const zoneWidth = potentialLevel - currentLevel;
        return currentLevel + (zoneWidth * this.zpdParameters.challengeOptimal);
    }

    determineScaffoldingNeeds(currentLevel, optimalLevel) {
        const gap = optimalLevel - currentLevel;
        return {
            intensity: Math.min(1, gap * 2),
            type: gap > 0.3 ? 'intensive' : 'minimal',
            strategies: this.getScaffoldingStrategies(gap)
        };
    }

    calculateConfidence(assessmentData, dimension) {
        // 基于评估数据计算置信度
        return 0.8; // 简化实现
    }

    getRecentPerformance(assessmentData, dimension) {
        // 获取最近表现数据
        return [];
    }

    filterConsistentPerformance(performance) {
        // 过滤一致性表现
        return performance;
    }

    calculateWeightedAverage(performance) {
        // 计算加权平均
        return 0.5;
    }

    calculatePerformanceStability(performance) {
        // 计算表现稳定性
        return 0.7;
    }

    calculatePerformanceTrend(performance) {
        // 计算表现趋势
        return 'improving';
    }

    getLastAssessmentDate(assessmentData, dimension) {
        // 获取最后评估日期
        return Date.now();
    }

    getLearningStyleFit(learningStyle, dimension) {
        // 获取学习风格适配度
        return 0.6;
    }

    normalizeTimeAvailability(timeAvailable) {
        // 标准化可用时间
        return Math.min(1, (timeAvailable || 60) / 120);
    }

    extractBehaviorIndicators(learnerData, intelligenceType) {
        // 提取行为指标
        return [{ value: 0.5, weight: 1 }];
    }

    extractPreferenceIndicators(learnerData, intelligenceType) {
        // 提取偏好指标
        return [{ value: 0.5, weight: 1 }];
    }

    getIntelligenceAdaptations(intelligenceType) {
        // 获取智能类型适应策略
        const adaptations = {
            linguistic: {
                activities: ['词汇游戏', '语法分析', '文本阅读', '创意写作'],
                presentation: ['文本为主', '详细说明'],
                assessment: ['写作评估', '口语表达'],
                motivation: ['阅读奖励', '写作成就']
            },
            spatial: {
                activities: ['图像词汇', '思维导图', '视觉化语法', '场景学习'],
                presentation: ['图像展示', '视觉化'],
                assessment: ['图表分析', '视觉识别'],
                motivation: ['视觉奖励', '图像成就']
            }
        };

        return adaptations[intelligenceType] || adaptations.linguistic;
    }

    analyzeCognitiveLoad(step) {
        // 分析认知负载
        return {
            intrinsic: 0.5,
            extraneous: 0.3,
            germane: 0.4,
            total: 1.2
        };
    }

    exceedsCognitiveCapacity(loadAnalysis, learnerCapacity) {
        // 检查是否超过认知容量
        return loadAnalysis.total > (learnerCapacity.cognitiveLoad || 1.5);
    }

    applyCognitiveLoadControl(step, loadAnalysis) {
        // 应用认知负载控制
        return [step]; // 简化实现，实际中会拆分复杂步骤
    }

    validateOverallLoadDistribution(path) {
        // 验证整体负载分布
        return path;
    }

    initializePathPopulation(basePath, populationSize) {
        // 初始化路径种群
        const population = [];
        for (let i = 0; i < populationSize; i++) {
            population.push(this.mutatePathRandomly(basePath));
        }
        return population;
    }

    evaluatePathFitness(path, learnerProfile) {
        // 评估路径适应度
        let fitness = 0;
        
        // 学习效率 (30%)
        fitness += this.calculateLearningEfficiency(path, learnerProfile) * 0.3;
        
        // 知识连贯性 (25%)
        fitness += this.calculateKnowledgeCoherence(path) * 0.25;
        
        // 认知负载适配 (20%)
        fitness += this.calculateCognitiveLoadAdaptation(path, learnerProfile) * 0.2;
        
        // 参与度预期 (15%)
        fitness += this.calculateExpectedEngagement(path, learnerProfile) * 0.15;
        
        // 时间合理性 (10%)
        fitness += this.calculateTimeRationality(path, learnerProfile) * 0.1;
        
        return fitness;
    }

    evolvePopulation(population, fitnessScores, params) {
        // 进化种群
        const newPopulation = [];
        
        // 精英保留
        const eliteCount = Math.floor(population.length * 0.2);
        const eliteIndices = fitnessScores
            .map((score, index) => ({ score, index }))
            .sort((a, b) => b.score - a.score)
            .slice(0, eliteCount)
            .map(item => item.index);
        
        eliteIndices.forEach(index => {
            newPopulation.push(population[index]);
        });
        
        // 生成新个体
        while (newPopulation.length < population.length) {
            const parent1 = this.selectParent(population, fitnessScores);
            const parent2 = this.selectParent(population, fitnessScores);
            
            let offspring = this.crossoverPaths(parent1, parent2);
            
            if (Math.random() < params.mutationRate) {
                offspring = this.mutatePathRandomly(offspring);
            }
            
            newPopulation.push(offspring);
        }
        
        return newPopulation;
    }

    mutatePathRandomly(path) {
        // 随机变异路径
        const mutatedPath = JSON.parse(JSON.stringify(path));
        
        // 随机调整步骤顺序
        if (mutatedPath.constructionSequence && mutatedPath.constructionSequence.length > 1) {
            const i = Math.floor(Math.random() * mutatedPath.constructionSequence.length);
            const j = Math.floor(Math.random() * mutatedPath.constructionSequence.length);
            
            [mutatedPath.constructionSequence[i], mutatedPath.constructionSequence[j]] = 
            [mutatedPath.constructionSequence[j], mutatedPath.constructionSequence[i]];
        }
        
        return mutatedPath;
    }

    selectParent(population, fitnessScores) {
        // 选择父代（轮盘赌选择）
        const totalFitness = fitnessScores.reduce((sum, score) => sum + score, 0);
        const random = Math.random() * totalFitness;
        
        let accumulator = 0;
        for (let i = 0; i < population.length; i++) {
            accumulator += fitnessScores[i];
            if (accumulator >= random) {
                return population[i];
            }
        }
        
        return population[population.length - 1];
    }

    crossoverPaths(parent1, parent2) {
        // 路径交叉
        const child = JSON.parse(JSON.stringify(parent1));
        
        // 简单的单点交叉
        if (parent2.constructionSequence && parent1.constructionSequence) {
            const crossoverPoint = Math.floor(parent1.constructionSequence.length / 2);
            child.constructionSequence = [
                ...parent1.constructionSequence.slice(0, crossoverPoint),
                ...parent2.constructionSequence.slice(crossoverPoint)
            ];
        }
        
        return child;
    }

    adaptActivitiesForIntelligence(activities, intelligenceType, score) {
        // 根据智能类型适配活动
        const adaptedActivities = [...activities];
        
        const intelligenceActivities = this.getIntelligenceAdaptations(intelligenceType).activities;
        
        // 根据得分调整活动权重
        intelligenceActivities.forEach(activity => {
            if (score > 0.7) {
                adaptedActivities.push({
                    type: activity,
                    weight: score,
                    reason: `适合${intelligenceType}智能类型`
                });
            }
        });
        
        return adaptedActivities;
    }

    adjustDifficultyBasedOnZPD(sequence, zpd) {
        // 根据ZPD调整难度
        return sequence.map(step => {
            const dimension = this.mapStepToDimension(step);
            const optimalLevel = zpd.optimalChallengeLevel[dimension];
            
            if (optimalLevel) {
                step.difficulty = optimalLevel;
                step.zpdOptimized = true;
            }
            
            return step;
        });
    }

    personalizeScaffolding(scaffoldingStrategy, intelligenceProfile) {
        // 个性化脚手架
        const personalizedStrategy = { ...scaffoldingStrategy };
        
        intelligenceProfile.primaryIntelligences.forEach(({ type, score }) => {
            personalizedStrategy[type] = {
                intensity: score,
                strategies: this.getIntelligenceAdaptations(type).activities
            };
        });
        
        return personalizedStrategy;
    }

    checkPathCompleteness(path) {
        // 检查路径完整性
        return path.constructionSequence && 
               path.constructionSequence.length > 0 &&
               path.scaffoldingStrategy;
    }

    estimatePathDuration(path) {
        // 估算路径持续时间
        if (!path.constructionSequence) return 0;
        
        return path.constructionSequence.reduce((total, step) => {
            return total + (step.estimated_duration || 30);
        }, 0);
    }

    evaluateDifficultyProgression(path) {
        // 评估难度递进
        if (!path.constructionSequence) return [];
        
        return path.constructionSequence.map(step => ({
            step: step.step_number,
            difficulty: step.difficulty || 0.5,
            concept: step.target_concept
        }));
    }

    addProgressCheckpoints(path) {
        // 添加进度检查点
        const checkpoints = [];
        const sequenceLength = path.constructionSequence?.length || 0;
        
        for (let i = Math.floor(sequenceLength / 4); i < sequenceLength; i += Math.floor(sequenceLength / 4)) {
            checkpoints.push({
                position: i,
                type: 'progress_check',
                description: `第${i}步进度检查`,
                assessmentCriteria: ['理解度检查', '应用能力测试']
            });
        }
        
        return checkpoints;
    }

    // 其他辅助方法的简化实现
    getScaffoldingStrategies(gap) { return ['guided_practice', 'peer_support']; }
    calculateConnectionStrength(concept, profile) { return 0.5; }
    identifyConceptConnections(concepts) { return []; }
    detectMisconceptions(profile) { return []; }
    identifyKnowledgeGaps(concepts) { return []; }
    buildConstructionGraph(current, target) { return []; }
    topologicalSort(graph) { return []; }
    determineConstructionType(node) { return 'incremental_building'; }
    designLearningActivities(node) { return []; }
    defineAssessmentCriteria(node) { return []; }
    estimateConstructionTime(node) { return 30; }
    getBasicActivities(module) { return [`基础${module}练习`]; }
    calculateLearningEfficiency(path, profile) { return 0.7; }
    calculateKnowledgeCoherence(path) { return 0.8; }
    calculateCognitiveLoadAdaptation(path, profile) { return 0.6; }
    calculateExpectedEngagement(path, profile) { return 0.7; }
    calculateTimeRationality(path, profile) { return 0.8; }
    mapStepToDimension(step) { return 'vocabulary_knowledge'; }
}

// 辅助类定义
class GeneticAlgorithmOptimizer {
    constructor() {
        this.populationSize = 50;
        this.generations = 30;
    }
}

class CognitiveLoadManager {
    constructor() {
        this.maxLoad = 1.5;
    }
}

class MultipleIntelligenceAdaptor {
    constructor() {
        this.intelligenceTypes = 8;
    }
}

class ZPDManager {
    constructor() {
        this.optimalChallenge = 0.7;
    }
}

class ConstructivistLearningManager {
    constructor() {
        this.scaffoldingLevels = 5;
    }
}

class CognitiveLoadOptimizer {
    constructor() {
        this.loadThreshold = 1.2;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveLearningPath;
} else {
    window.AdaptiveLearningPath = AdaptiveLearningPath;
}
