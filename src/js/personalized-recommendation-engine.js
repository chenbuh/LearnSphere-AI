/**
 * 个性化学习建议系统
 * 基于学习分析结果生成个性化的学习建议和优化方案
 */
class PersonalizedRecommendationEngine {
    constructor() {
        this.recommendationStrategies = {
            content: new ContentRecommendationStrategy(),
            timing: new TimingRecommendationStrategy(),
            difficulty: new DifficultyRecommendationStrategy(),
            method: new MethodRecommendationStrategy(),
            motivation: new MotivationRecommendationStrategy(),
            retention: new RetentionRecommendationStrategy()
        };
        
        this.adaptiveRules = new AdaptiveRecommendationRules();
        this.personalityModel = new LearnerPersonalityModel();
        this.contextAnalyzer = new LearningContextAnalyzer();
        
        this.init();
    }

    init() {
        console.log('🎯 个性化学习建议系统已初始化');
    }

    /**
     * 生成个性化学习建议
     */
    async generatePersonalizedRecommendations(learningData, analysisResults) {
        console.log('🎯 开始生成个性化学习建议...');
        
        try {
            // 分析学习者画像
            const learnerProfile = await this.createLearnerProfile(learningData, analysisResults);
            
            // 分析当前学习上下文
            const currentContext = await this.contextAnalyzer.analyzeCurrentContext(learningData);
            
            // 生成各类建议
            const recommendations = {
                immediate: await this.generateImmediateRecommendations(learnerProfile, currentContext),
                shortTerm: await this.generateShortTermRecommendations(learnerProfile, currentContext),
                longTerm: await this.generateLongTermRecommendations(learnerProfile, currentContext),
                adaptive: await this.generateAdaptiveRecommendations(learnerProfile, currentContext),
                emergency: await this.generateEmergencyRecommendations(learnerProfile, currentContext)
            };

            // 应用个性化过滤和排序
            const personalizedRecommendations = await this.personalizeRecommendations(
                recommendations, 
                learnerProfile, 
                currentContext
            );

            // 生成实施计划
            const implementationPlan = await this.createImplementationPlan(
                personalizedRecommendations, 
                learnerProfile
            );

            console.log('✅ 个性化学习建议生成完成');
            
            return {
                learnerProfile,
                currentContext,
                recommendations: personalizedRecommendations,
                implementationPlan,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天有效期
                    confidence: this.calculateRecommendationConfidence(learnerProfile, currentContext),
                    personalizationLevel: this.calculatePersonalizationLevel(learnerProfile)
                }
            };

        } catch (error) {
            console.error('❌ 生成个性化建议失败:', error);
            throw error;
        }
    }

    /**
     * 创建学习者画像
     */
    async createLearnerProfile(learningData, analysisResults) {
        const profile = {
            // 基本信息
            userId: learningData.userId,
            learningLevel: this.determineLearningLevel(analysisResults),
            experience: this.calculateLearningExperience(learningData),
            
            // 学习特征
            learningStyle: this.identifyLearningStyle(analysisResults),
            cognitiveStyle: this.identifyCognitiveStyle(analysisResults),
            motivationProfile: this.createMotivationProfile(analysisResults),
            
            // 行为模式
            timePreferences: this.extractTimePreferences(analysisResults),
            contentPreferences: this.extractContentPreferences(analysisResults),
            difficultyPreferences: this.extractDifficultyPreferences(analysisResults),
            
            // 学习能力
            strengths: this.identifyLearningStrengths(analysisResults),
            challenges: this.identifyLearningChallenges(analysisResults),
            adaptability: this.assessAdaptability(analysisResults),
            
            // 目标和需求
            goals: this.extractLearningGoals(learningData),
            priorities: this.identifyLearningPriorities(analysisResults),
            constraints: this.identifyLearningConstraints(learningData)
        };

        return profile;
    }

    /**
     * 生成立即行动建议
     */
    async generateImmediateRecommendations(learnerProfile, currentContext) {
        const recommendations = [];

        // 基于当前状态的紧急建议
        if (currentContext.recentPerformance && currentContext.recentPerformance.declining) {
            recommendations.push({
                id: 'performance_decline',
                type: 'performance_intervention',
                priority: 'critical',
                title: '学习效果下降预警',
                description: '您最近的学习效果有所下降，建议立即调整学习策略',
                actions: [
                    {
                        action: 'review_recent_mistakes',
                        description: '回顾最近的错题，找出问题模式',
                        estimatedTime: 15,
                        difficulty: 'easy'
                    },
                    {
                        action: 'reduce_difficulty',
                        description: '暂时降低学习难度，重建信心',
                        estimatedTime: 0,
                        difficulty: 'easy'
                    },
                    {
                        action: 'take_break',
                        description: '适当休息，避免学习疲劳',
                        estimatedTime: 30,
                        difficulty: 'easy'
                    }
                ],
                expectedOutcome: '恢复学习状态，提升学习效果',
                urgency: 'high'
            });
        }

        // 基于时间偏好的建议
        if (this.isOptimalLearningTime(learnerProfile.timePreferences)) {
            recommendations.push({
                id: 'optimal_time_window',
                type: 'timing_optimization',
                priority: 'high',
                title: '黄金学习时间',
                description: '现在是您的最佳学习时间，建议处理重要或困难的学习内容',
                actions: [
                    {
                        action: 'tackle_difficult_content',
                        description: '学习最具挑战性的内容',
                        estimatedTime: 45,
                        difficulty: 'hard'
                    },
                    {
                        action: 'focus_on_weaknesses',
                        description: '重点攻克薄弱环节',
                        estimatedTime: 30,
                        difficulty: 'medium'
                    }
                ],
                expectedOutcome: '最大化学习效率和效果',
                urgency: 'medium'
            });
        }

        // 基于动机状态的建议
        if (currentContext.motivationLevel && currentContext.motivationLevel < 0.5) {
            recommendations.push({
                id: 'motivation_boost',
                type: 'motivation_enhancement',
                priority: 'high',
                title: '提升学习动机',
                description: '您的学习动机较低，建议采取激励措施',
                actions: [
                    {
                        action: 'set_micro_goals',
                        description: '设置小而可达成的目标',
                        estimatedTime: 5,
                        difficulty: 'easy'
                    },
                    {
                        action: 'reward_system',
                        description: '为完成任务设置奖励',
                        estimatedTime: 2,
                        difficulty: 'easy'
                    },
                    {
                        action: 'gamify_learning',
                        description: '使用游戏化元素增加趣味性',
                        estimatedTime: 0,
                        difficulty: 'easy'
                    }
                ],
                expectedOutcome: '重新激发学习热情',
                urgency: 'high'
            });
        }

        return this.prioritizeRecommendations(recommendations);
    }

    /**
     * 生成短期建议（1-2周）
     */
    async generateShortTermRecommendations(learnerProfile, currentContext) {
        const recommendations = [];

        // 学习方法优化建议
        if (learnerProfile.learningStyle) {
            recommendations.push({
                id: 'learning_method_optimization',
                type: 'method_improvement',
                priority: 'medium',
                title: `优化${learnerProfile.learningStyle}学习方法`,
                description: `根据您的学习风格，调整学习方法以提高效率`,
                actions: this.getStyleSpecificActions(learnerProfile.learningStyle),
                expectedOutcome: '提升学习效率和满意度',
                timeframe: '1-2周',
                trackingMetrics: ['学习效率', '学习满意度', '知识保持率']
            });
        }

        // 知识结构优化建议
        if (learnerProfile.challenges.includes('knowledge_fragmentation')) {
            recommendations.push({
                id: 'knowledge_structure_building',
                type: 'knowledge_organization',
                priority: 'medium',
                title: '构建知识体系',
                description: '您的知识点较为分散，建议系统化整理',
                actions: [
                    {
                        action: 'create_mind_maps',
                        description: '为主要知识点创建思维导图',
                        estimatedTime: 60,
                        difficulty: 'medium'
                    },
                    {
                        action: 'establish_connections',
                        description: '建立知识点之间的联系',
                        estimatedTime: 45,
                        difficulty: 'medium'
                    },
                    {
                        action: 'regular_review_system',
                        description: '建立定期复习系统',
                        estimatedTime: 30,
                        difficulty: 'medium'
                    }
                ],
                expectedOutcome: '形成系统化的知识结构',
                timeframe: '2周',
                trackingMetrics: ['知识连接度', '复习效果', '应用能力']
            });
        }

        // 学习习惯改进建议
        if (currentContext.consistencyIssues) {
            recommendations.push({
                id: 'consistency_improvement',
                type: 'habit_formation',
                priority: 'high',
                title: '建立稳定的学习习惯',
                description: '您的学习一致性有待提高，建议建立规律的学习习惯',
                actions: [
                    {
                        action: 'fixed_schedule',
                        description: '制定固定的学习时间表',
                        estimatedTime: 15,
                        difficulty: 'easy'
                    },
                    {
                        action: 'habit_tracking',
                        description: '使用习惯追踪工具',
                        estimatedTime: 5,
                        difficulty: 'easy'
                    },
                    {
                        action: 'accountability_system',
                        description: '建立学习问责机制',
                        estimatedTime: 10,
                        difficulty: 'medium'
                    }
                ],
                expectedOutcome: '形成稳定的学习节奏',
                timeframe: '2周',
                trackingMetrics: ['学习频率', '学习时长', '目标完成率']
            });
        }

        return this.prioritizeRecommendations(recommendations);
    }

    /**
     * 生成长期建议（1-3个月）
     */
    async generateLongTermRecommendations(learnerProfile, currentContext) {
        const recommendations = [];

        // 学习能力发展建议
        recommendations.push({
            id: 'metacognitive_development',
            type: 'skill_development',
            priority: 'medium',
            title: '发展元认知能力',
            description: '提升学会学习的能力，增强自主学习效果',
            actions: [
                {
                    action: 'self_reflection_practice',
                    description: '定期进行学习反思',
                    estimatedTime: 20,
                    difficulty: 'medium',
                    frequency: 'weekly'
                },
                {
                    action: 'strategy_experimentation',
                    description: '尝试不同的学习策略',
                    estimatedTime: 0,
                    difficulty: 'medium',
                    frequency: 'monthly'
                },
                {
                    action: 'learning_journal',
                    description: '记录学习过程和心得',
                    estimatedTime: 10,
                    difficulty: 'easy',
                    frequency: 'daily'
                }
            ],
            expectedOutcome: '成为更高效的自主学习者',
            timeframe: '2-3个月',
            trackingMetrics: ['学习策略多样性', '自我调节能力', '学习效果稳定性']
        });

        // 知识深化建议
        if (learnerProfile.strengths.includes('breadth_learning')) {
            recommendations.push({
                id: 'knowledge_deepening',
                type: 'depth_enhancement',
                priority: 'medium',
                title: '深化核心知识',
                description: '您擅长广泛学习，现在可以专注于深化核心领域',
                actions: [
                    {
                        action: 'expert_level_study',
                        description: '选择1-2个领域进行专家级学习',
                        estimatedTime: 120,
                        difficulty: 'hard',
                        frequency: 'weekly'
                    },
                    {
                        action: 'practical_application',
                        description: '将知识应用到实际项目中',
                        estimatedTime: 60,
                        difficulty: 'hard',
                        frequency: 'bi-weekly'
                    },
                    {
                        action: 'teaching_others',
                        description: '通过教授他人来深化理解',
                        estimatedTime: 30,
                        difficulty: 'medium',
                        frequency: 'monthly'
                    }
                ],
                expectedOutcome: '在核心领域达到专家水平',
                timeframe: '3个月',
                trackingMetrics: ['专业深度', '应用能力', '教学效果']
            });
        }

        // 学习生态系统建设
        recommendations.push({
            id: 'learning_ecosystem',
            type: 'environment_optimization',
            priority: 'low',
            title: '构建学习生态系统',
            description: '建立支持长期学习的环境和网络',
            actions: [
                {
                    action: 'learning_community',
                    description: '加入或创建学习社群',
                    estimatedTime: 30,
                    difficulty: 'medium',
                    frequency: 'once'
                },
                {
                    action: 'mentor_relationship',
                    description: '寻找学习导师或成为他人导师',
                    estimatedTime: 60,
                    difficulty: 'hard',
                    frequency: 'once'
                },
                {
                    action: 'resource_curation',
                    description: '建立个人学习资源库',
                    estimatedTime: 45,
                    difficulty: 'medium',
                    frequency: 'monthly'
                }
            ],
            expectedOutcome: '建立可持续的学习支持系统',
            timeframe: '2-3个月',
            trackingMetrics: ['社交学习频率', '资源利用率', '学习满意度']
        });

        return this.prioritizeRecommendations(recommendations);
    }

    /**
     * 生成自适应建议
     */
    async generateAdaptiveRecommendations(learnerProfile, currentContext) {
        const recommendations = [];

        // 基于实时表现的自适应建议
        const adaptiveRules = [
            {
                condition: () => currentContext.recentAccuracy > 0.9,
                recommendation: {
                    id: 'increase_difficulty',
                    type: 'adaptive_difficulty',
                    title: '提升学习难度',
                    description: '您的表现优秀，可以尝试更有挑战性的内容',
                    actions: [
                        {
                            action: 'advanced_content',
                            description: '学习更高级的内容',
                            adaptiveParameter: 'difficulty',
                            adjustment: '+1'
                        }
                    ]
                }
            },
            {
                condition: () => currentContext.recentAccuracy < 0.6,
                recommendation: {
                    id: 'decrease_difficulty',
                    type: 'adaptive_difficulty',
                    title: '调整学习难度',
                    description: '建议暂时降低难度，巩固基础',
                    actions: [
                        {
                            action: 'foundational_review',
                            description: '回顾基础知识',
                            adaptiveParameter: 'difficulty',
                            adjustment: '-1'
                        }
                    ]
                }
            },
            {
                condition: () => currentContext.learningStreak > 7,
                recommendation: {
                    id: 'maintain_momentum',
                    type: 'adaptive_motivation',
                    title: '保持学习势头',
                    description: '您已连续学习多天，建议适当奖励自己',
                    actions: [
                        {
                            action: 'celebration_break',
                            description: '给自己一个小奖励',
                            adaptiveParameter: 'motivation',
                            adjustment: '+boost'
                        }
                    ]
                }
            }
        ];

        // 应用自适应规则
        adaptiveRules.forEach(rule => {
            if (rule.condition()) {
                recommendations.push(rule.recommendation);
            }
        });

        return recommendations;
    }

    /**
     * 生成紧急干预建议
     */
    async generateEmergencyRecommendations(learnerProfile, currentContext) {
        const recommendations = [];

        // 学习危机干预
        if (currentContext.criticalIssues) {
            currentContext.criticalIssues.forEach(issue => {
                switch (issue.type) {
                    case 'severe_performance_decline':
                        recommendations.push({
                            id: 'crisis_intervention',
                            type: 'emergency_support',
                            priority: 'critical',
                            title: '学习危机干预',
                            description: '检测到严重的学习问题，需要立即干预',
                            actions: [
                                {
                                    action: 'immediate_support',
                                    description: '寻求学习支持或辅导',
                                    urgency: 'immediate'
                                },
                                {
                                    action: 'reset_learning_plan',
                                    description: '重新制定学习计划',
                                    urgency: 'immediate'
                                }
                            ],
                            followUp: {
                                required: true,
                                timeframe: '24小时内',
                                actions: ['评估干预效果', '调整支持策略']
                            }
                        });
                        break;
                    
                    case 'burnout_risk':
                        recommendations.push({
                            id: 'burnout_prevention',
                            type: 'wellness_intervention',
                            priority: 'critical',
                            title: '学习倦怠预防',
                            description: '检测到学习倦怠风险，建议立即调整',
                            actions: [
                                {
                                    action: 'mandatory_break',
                                    description: '强制休息1-2天',
                                    urgency: 'immediate'
                                },
                                {
                                    action: 'workload_reduction',
                                    description: '减少学习负荷',
                                    urgency: 'immediate'
                                }
                            ]
                        });
                        break;
                }
            });
        }

        return recommendations;
    }

    /**
     * 个性化建议
     */
    async personalizeRecommendations(recommendations, learnerProfile, currentContext) {
        const personalizedRecommendations = {};

        // 为每个类别的建议进行个性化处理
        for (const [category, recs] of Object.entries(recommendations)) {
            personalizedRecommendations[category] = await Promise.all(
                recs.map(async rec => await this.personalizeRecommendation(rec, learnerProfile, currentContext))
            );
        }

        // 根据学习者偏好排序
        for (const category of Object.keys(personalizedRecommendations)) {
            personalizedRecommendations[category] = this.sortByPersonalPreferences(
                personalizedRecommendations[category], 
                learnerProfile
            );
        }

        return personalizedRecommendations;
    }

    /**
     * 个性化单个建议
     */
    async personalizeRecommendation(recommendation, learnerProfile, currentContext) {
        const personalized = { ...recommendation };

        // 根据学习风格调整行动建议
        if (learnerProfile.learningStyle && personalized.actions) {
            personalized.actions = personalized.actions.map(action => 
                this.adaptActionToLearningStyle(action, learnerProfile.learningStyle)
            );
        }

        // 根据时间偏好调整时间建议
        if (learnerProfile.timePreferences && personalized.timing) {
            personalized.timing = this.adaptTimingToPreferences(
                personalized.timing, 
                learnerProfile.timePreferences
            );
        }

        // 根据难度偏好调整难度
        if (learnerProfile.difficultyPreferences && personalized.difficulty) {
            personalized.difficulty = this.adaptDifficultyToPreferences(
                personalized.difficulty, 
                learnerProfile.difficultyPreferences
            );
        }

        // 添加个性化的成功指标
        personalized.personalizedMetrics = this.definePersonalizedMetrics(
            recommendation, 
            learnerProfile
        );

        // 添加个性化的激励元素
        personalized.motivationalElements = this.addMotivationalElements(
            recommendation, 
            learnerProfile.motivationProfile
        );

        return personalized;
    }

    /**
     * 创建实施计划
     */
    async createImplementationPlan(recommendations, learnerProfile) {
        const plan = {
            phases: [],
            timeline: this.createTimeline(recommendations),
            resources: this.identifyRequiredResources(recommendations),
            checkpoints: this.defineCheckpoints(recommendations),
            contingencyPlans: this.createContingencyPlans(recommendations, learnerProfile)
        };

        // 创建实施阶段
        plan.phases = [
            {
                name: '立即行动阶段',
                duration: '1-3天',
                recommendations: recommendations.immediate || [],
                success_criteria: ['完成紧急行动', '稳定学习状态'],
                priority: 'critical'
            },
            {
                name: '短期调整阶段',
                duration: '1-2周',
                recommendations: recommendations.shortTerm || [],
                success_criteria: ['建立新习惯', '看到初步改善'],
                priority: 'high'
            },
            {
                name: '长期发展阶段',
                duration: '1-3个月',
                recommendations: recommendations.longTerm || [],
                success_criteria: ['实现显著提升', '形成稳定模式'],
                priority: 'medium'
            }
        ];

        return plan;
    }

    // 辅助方法

    /**
     * 确定学习水平
     */
    determineLearningLevel(analysisResults) {
        const overallScore = analysisResults.overallAssessment?.overallScore || 0.5;
        
        if (overallScore >= 0.9) return 'expert';
        if (overallScore >= 0.8) return 'advanced';
        if (overallScore >= 0.6) return 'intermediate';
        if (overallScore >= 0.4) return 'beginner';
        return 'novice';
    }

    /**
     * 识别学习风格
     */
    identifyLearningStyle(analysisResults) {
        // 从分析结果中提取学习风格信息
        return analysisResults.learningStyle?.dominantStyle || 'mixed';
    }

    /**
     * 创建动机档案
     */
    createMotivationProfile(analysisResults) {
        const motivationData = analysisResults.motivation || {};
        
        return {
            level: motivationData.motivationLevel || 0.5,
            type: motivationData.motivationType || 'mixed',
            triggers: motivationData.motivationTriggers || [],
            barriers: motivationData.motivationBarriers || []
        };
    }

    /**
     * 提取时间偏好
     */
    extractTimePreferences(analysisResults) {
        const timeData = analysisResults.patterns?.temporal?.timePreference || {};
        
        return {
            preferredHours: timeData.preferredHours || [],
            preferredDays: timeData.preferredDays || [],
            sessionLength: timeData.preferredDuration || 30,
            consistency: timeData.consistency || 0.5
        };
    }

    /**
     * 获取学习风格特定的行动
     */
    getStyleSpecificActions(learningStyle) {
        const styleActions = {
            visual: [
                {
                    action: 'use_visual_aids',
                    description: '使用图表、图像和颜色来组织信息',
                    estimatedTime: 15,
                    difficulty: 'easy'
                },
                {
                    action: 'create_mind_maps',
                    description: '制作思维导图和概念图',
                    estimatedTime: 30,
                    difficulty: 'medium'
                }
            ],
            auditory: [
                {
                    action: 'read_aloud',
                    description: '大声朗读学习材料',
                    estimatedTime: 20,
                    difficulty: 'easy'
                },
                {
                    action: 'discuss_content',
                    description: '与他人讨论学习内容',
                    estimatedTime: 30,
                    difficulty: 'medium'
                }
            ],
            kinesthetic: [
                {
                    action: 'hands_on_practice',
                    description: '通过实践和操作来学习',
                    estimatedTime: 45,
                    difficulty: 'medium'
                },
                {
                    action: 'movement_learning',
                    description: '在学习时适当走动',
                    estimatedTime: 0,
                    difficulty: 'easy'
                }
            ]
        };

        return styleActions[learningStyle] || styleActions.visual;
    }

    /**
     * 优先级排序建议
     */
    prioritizeRecommendations(recommendations) {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        
        return recommendations.sort((a, b) => {
            const aPriority = priorityOrder[a.priority] || 0;
            const bPriority = priorityOrder[b.priority] || 0;
            return bPriority - aPriority;
        });
    }

    /**
     * 判断是否为最佳学习时间
     */
    isOptimalLearningTime(timePreferences) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();
        
        const isOptimalHour = timePreferences.preferredHours.includes(currentHour);
        const isOptimalDay = timePreferences.preferredDays.some(day => day.day === currentDay);
        
        return isOptimalHour && isOptimalDay;
    }

    /**
     * 计算建议置信度
     */
    calculateRecommendationConfidence(learnerProfile, currentContext) {
        let confidence = 0.5; // 基础置信度

        // 基于数据质量调整
        if (currentContext.dataQuality > 0.8) confidence += 0.2;
        if (currentContext.dataQuality < 0.5) confidence -= 0.2;

        // 基于学习历史长度调整
        if (learnerProfile.experience > 30) confidence += 0.1; // 30天以上经验
        if (learnerProfile.experience < 7) confidence -= 0.1; // 少于7天经验

        // 基于模式一致性调整
        if (currentContext.patternConsistency > 0.7) confidence += 0.1;
        if (currentContext.patternConsistency < 0.3) confidence -= 0.1;

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    /**
     * 计算个性化水平
     */
    calculatePersonalizationLevel(learnerProfile) {
        let level = 0;

        // 基于可用信息计算个性化程度
        if (learnerProfile.learningStyle) level += 0.2;
        if (learnerProfile.timePreferences.consistency > 0.5) level += 0.2;
        if (learnerProfile.strengths.length > 0) level += 0.2;
        if (learnerProfile.goals.length > 0) level += 0.2;
        if (learnerProfile.motivationProfile.level > 0.5) level += 0.2;

        return level;
    }
}

/**
 * 学习上下文分析器
 */
class LearningContextAnalyzer {
    async analyzeCurrentContext(learningData) {
        return {
            recentPerformance: this.analyzeRecentPerformance(learningData),
            motivationLevel: this.assessCurrentMotivation(learningData),
            learningStreak: this.calculateLearningStreak(learningData),
            dataQuality: this.assessDataQuality(learningData),
            criticalIssues: this.identifyCriticalIssues(learningData),
            consistencyIssues: this.identifyConsistencyIssues(learningData),
            patternConsistency: this.calculatePatternConsistency(learningData)
        };
    }

    analyzeRecentPerformance(learningData) {
        const recentSessions = learningData.sessions.slice(-5); // 最近5次学习
        if (recentSessions.length < 2) return null;

        const accuracies = recentSessions.map(s => this.calculateSessionAccuracy(s));
        const trend = this.calculateTrend(accuracies);

        return {
            declining: trend < -0.1,
            improving: trend > 0.1,
            stable: Math.abs(trend) <= 0.1,
            currentLevel: accuracies[accuracies.length - 1] || 0.5
        };
    }

    calculateSessionAccuracy(session) {
        if (!session.content) return null;
        const { questionsAnswered, correctAnswers } = session.content;
        return questionsAnswered > 0 ? correctAnswers / questionsAnswered : null;
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
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.PersonalizedRecommendationEngine = PersonalizedRecommendationEngine;
    console.log('🎯 个性化学习建议系统已加载');
}
