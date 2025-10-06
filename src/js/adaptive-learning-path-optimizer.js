/**
 * 自适应学习路径优化器
 * 根据学习分析结果动态调整和优化学习路径
 */
class AdaptiveLearningPathOptimizer {
    constructor() {
        this.pathStrategies = {
            sequential: new SequentialPathStrategy(),
            adaptive: new AdaptivePathStrategy(),
            personalized: new PersonalizedPathStrategy(),
            remedial: new RemedialPathStrategy(),
            accelerated: new AcceleratedPathStrategy()
        };
        
        this.difficultyAdjuster = new DifficultyAdjuster();
        this.contentSelector = new IntelligentContentSelector();
        this.paceController = new LearningPaceController();
        this.goalAligner = new GoalAlignmentEngine();
        
        this.currentPaths = new Map(); // 用户ID -> 学习路径
        this.pathHistory = new Map(); // 路径变更历史
        
        this.init();
    }

    init() {
        console.log('🛤️ 自适应学习路径优化器已初始化');
    }

    /**
     * 优化学习路径
     */
    async optimizeLearningPath(userId, learningData, analysisResults, userGoals = []) {
        console.log('🛤️ 开始优化学习路径...');
        
        try {
            // 分析当前学习状态
            const currentState = await this.analyzeLearningState(learningData, analysisResults);
            
            // 评估当前路径效果
            const pathEffectiveness = await this.evaluateCurrentPath(userId, currentState);
            
            // 确定优化策略
            const optimizationStrategy = this.determineOptimizationStrategy(
                currentState, 
                pathEffectiveness, 
                userGoals
            );
            
            // 生成优化后的学习路径
            const optimizedPath = await this.generateOptimizedPath(
                userId,
                currentState,
                optimizationStrategy,
                userGoals
            );
            
            // 应用个性化调整
            const personalizedPath = await this.applyPersonalization(
                optimizedPath,
                analysisResults.learnerProfile || {},
                currentState
            );
            
            // 设置自适应机制
            const adaptiveMechanisms = this.setupAdaptiveMechanisms(personalizedPath, currentState);
            
            // 创建路径监控系统
            const monitoringSystem = this.createPathMonitoring(personalizedPath, userId);

            const optimizedLearningPath = {
                userId,
                pathId: this.generatePathId(),
                version: this.getNextPathVersion(userId),
                createdAt: new Date().toISOString(),
                
                // 路径结构
                structure: personalizedPath,
                
                // 自适应机制
                adaptiveMechanisms,
                
                // 监控系统
                monitoring: monitoringSystem,
                
                // 优化信息
                optimization: {
                    strategy: optimizationStrategy,
                    improvements: this.identifyImprovements(pathEffectiveness),
                    expectedOutcomes: this.predictPathOutcomes(personalizedPath, currentState),
                    riskMitigation: this.identifyPathRisks(personalizedPath, currentState)
                },
                
                // 元数据
                metadata: {
                    basedOnData: this.summarizeDataBasis(learningData, analysisResults),
                    confidenceLevel: this.calculatePathConfidence(currentState, optimizationStrategy),
                    validityPeriod: this.calculateValidityPeriod(currentState),
                    nextReviewDate: this.scheduleNextReview(currentState)
                }
            };

            // 保存路径
            this.saveLearningPath(userId, optimizedLearningPath);
            
            console.log('✅ 学习路径优化完成');
            return optimizedLearningPath;

        } catch (error) {
            console.error('❌ 学习路径优化失败:', error);
            throw error;
        }
    }

    /**
     * 分析学习状态
     */
    async analyzeLearningState(learningData, analysisResults) {
        const state = {
            // 学习水平
            currentLevel: this.assessCurrentLevel(learningData, analysisResults),
            masteryAreas: this.identifyMasteryAreas(analysisResults),
            weaknessAreas: this.identifyWeaknessAreas(analysisResults),
            
            // 学习特征
            learningStyle: analysisResults.learningStyle?.dominantStyle || 'mixed',
            preferredPace: this.identifyPreferredPace(learningData),
            cognitiveLoad: this.assessCognitiveLoad(analysisResults),
            
            // 学习模式
            patterns: analysisResults.patterns || {},
            consistency: this.assessConsistency(learningData),
            motivation: analysisResults.motivation?.motivationLevel || 0.5,
            
            // 学习历史
            progressHistory: this.extractProgressHistory(learningData),
            difficultyHistory: this.extractDifficultyHistory(learningData),
            performanceHistory: this.extractPerformanceHistory(learningData),
            
            // 当前挑战
            currentChallenges: this.identifyCurrentChallenges(analysisResults),
            learningBarriers: this.identifyLearningBarriers(analysisResults),
            
            // 学习资源
            availableTime: this.estimateAvailableTime(learningData),
            resourceConstraints: this.identifyResourceConstraints(learningData)
        };

        return state;
    }

    /**
     * 评估当前路径效果
     */
    async evaluateCurrentPath(userId, currentState) {
        const currentPath = this.currentPaths.get(userId);
        
        if (!currentPath) {
            return {
                effectiveness: 0.5,
                issues: ['no_current_path'],
                strengths: [],
                recommendations: ['create_initial_path']
            };
        }

        const evaluation = {
            effectiveness: 0.5,
            issues: [],
            strengths: [],
            recommendations: [],
            
            // 详细评估
            progressRate: this.evaluateProgressRate(currentPath, currentState),
            engagementLevel: this.evaluateEngagementLevel(currentPath, currentState),
            difficultyAlignment: this.evaluateDifficultyAlignment(currentPath, currentState),
            goalAlignment: this.evaluateGoalAlignment(currentPath, currentState),
            timeEfficiency: this.evaluateTimeEfficiency(currentPath, currentState),
            
            // 路径适应性
            adaptability: this.evaluatePathAdaptability(currentPath, currentState),
            personalization: this.evaluatePersonalizationLevel(currentPath, currentState)
        };

        // 计算综合效果
        evaluation.effectiveness = this.calculateOverallEffectiveness(evaluation);
        
        // 识别问题和优势
        evaluation.issues = this.identifyPathIssues(evaluation);
        evaluation.strengths = this.identifyPathStrengths(evaluation);
        evaluation.recommendations = this.generatePathRecommendations(evaluation);

        return evaluation;
    }

    /**
     * 确定优化策略
     */
    determineOptimizationStrategy(currentState, pathEffectiveness, userGoals) {
        const strategy = {
            type: 'adaptive', // sequential, adaptive, personalized, remedial, accelerated
            focus: [], // areas to focus on
            adjustments: [], // specific adjustments to make
            timeline: 'medium', // short, medium, long
            intensity: 'moderate' // low, moderate, high
        };

        // 基于路径效果确定策略类型
        if (pathEffectiveness.effectiveness < 0.4) {
            strategy.type = 'remedial';
            strategy.focus.push('foundation_building', 'confidence_restoration');
            strategy.intensity = 'low';
        } else if (pathEffectiveness.effectiveness > 0.8 && currentState.motivation > 0.7) {
            strategy.type = 'accelerated';
            strategy.focus.push('advanced_challenges', 'skill_expansion');
            strategy.intensity = 'high';
        } else {
            strategy.type = 'adaptive';
            strategy.focus.push('balanced_improvement', 'personalization');
            strategy.intensity = 'moderate';
        }

        // 基于学习状态调整策略
        if (currentState.weaknessAreas.length > currentState.masteryAreas.length) {
            strategy.focus.push('weakness_targeting');
        }

        if (currentState.consistency < 0.5) {
            strategy.focus.push('habit_formation');
            strategy.timeline = 'long';
        }

        if (currentState.cognitiveLoad > 0.8) {
            strategy.adjustments.push('reduce_complexity', 'increase_scaffolding');
        }

        // 基于用户目标调整策略
        if (userGoals.some(goal => goal.urgent)) {
            strategy.timeline = 'short';
            strategy.intensity = 'high';
        }

        return strategy;
    }

    /**
     * 生成优化后的学习路径
     */
    async generateOptimizedPath(userId, currentState, strategy, userGoals) {
        const pathGenerator = this.pathStrategies[strategy.type];
        
        // 生成基础路径结构
        const basePath = await pathGenerator.generate(currentState, userGoals);
        
        // 应用策略调整
        const adjustedPath = this.applyStrategyAdjustments(basePath, strategy, currentState);
        
        // 优化路径结构
        const optimizedPath = {
            // 路径元信息
            id: this.generatePathId(),
            name: this.generatePathName(strategy, userGoals),
            description: this.generatePathDescription(strategy, currentState),
            
            // 路径结构
            phases: this.organizeLearningPhases(adjustedPath, strategy),
            milestones: this.defineMilestones(adjustedPath, userGoals),
            checkpoints: this.defineCheckpoints(adjustedPath, strategy),
            
            // 内容规划
            contentSequence: this.planContentSequence(adjustedPath, currentState),
            difficultyProgression: this.planDifficultyProgression(adjustedPath, currentState),
            practiceSchedule: this.planPracticeSchedule(adjustedPath, currentState),
            
            // 时间规划
            timeAllocation: this.planTimeAllocation(adjustedPath, currentState),
            pacing: this.determinePacing(adjustedPath, currentState, strategy),
            flexibility: this.defineFlexibility(adjustedPath, currentState),
            
            // 评估规划
            assessmentPlan: this.planAssessments(adjustedPath, strategy),
            feedbackMechanisms: this.defineFeedbackMechanisms(adjustedPath),
            
            // 支持系统
            supportResources: this.identifySupportResources(adjustedPath, currentState),
            interventionTriggers: this.defineInterventionTriggers(adjustedPath, strategy)
        };

        return optimizedPath;
    }

    /**
     * 应用个性化调整
     */
    async applyPersonalization(path, learnerProfile, currentState) {
        const personalizedPath = { ...path };

        // 基于学习风格个性化
        if (learnerProfile.learningStyle) {
            personalizedPath.contentSequence = this.personalizeForLearningStyle(
                personalizedPath.contentSequence,
                learnerProfile.learningStyle
            );
        }

        // 基于时间偏好个性化
        if (learnerProfile.timePreferences) {
            personalizedPath.timeAllocation = this.personalizeTimeAllocation(
                personalizedPath.timeAllocation,
                learnerProfile.timePreferences
            );
        }

        // 基于认知能力个性化
        if (currentState.cognitiveLoad) {
            personalizedPath.difficultyProgression = this.personalizeDifficultyProgression(
                personalizedPath.difficultyProgression,
                currentState.cognitiveLoad
            );
        }

        // 基于动机个性化
        if (learnerProfile.motivationProfile) {
            personalizedPath.milestones = this.personalizeMotivation(
                personalizedPath.milestones,
                learnerProfile.motivationProfile
            );
        }

        // 基于学习习惯个性化
        if (currentState.patterns) {
            personalizedPath.practiceSchedule = this.personalizeSchedule(
                personalizedPath.practiceSchedule,
                currentState.patterns
            );
        }

        return personalizedPath;
    }

    /**
     * 设置自适应机制
     */
    setupAdaptiveMechanisms(path, currentState) {
        return {
            // 难度自适应
            difficultyAdaptation: {
                enabled: true,
                triggers: [
                    { condition: 'accuracy > 0.9', action: 'increase_difficulty' },
                    { condition: 'accuracy < 0.6', action: 'decrease_difficulty' },
                    { condition: 'consecutive_errors > 3', action: 'provide_hint' }
                ],
                adjustmentRate: this.calculateAdjustmentRate(currentState),
                boundaries: { min: 1, max: 10 }
            },
            
            // 节奏自适应
            paceAdaptation: {
                enabled: true,
                triggers: [
                    { condition: 'completion_rate > 1.2', action: 'accelerate_pace' },
                    { condition: 'completion_rate < 0.8', action: 'slow_pace' },
                    { condition: 'stress_level > 0.8', action: 'add_break' }
                ],
                adjustmentFactor: 0.1,
                reviewInterval: '3days'
            },
            
            // 内容自适应
            contentAdaptation: {
                enabled: true,
                triggers: [
                    { condition: 'mastery_achieved', action: 'skip_redundant_content' },
                    { condition: 'weakness_detected', action: 'add_remedial_content' },
                    { condition: 'interest_declining', action: 'vary_content_type' }
                ],
                contentPool: this.buildContentPool(path),
                selectionCriteria: this.defineSelectionCriteria(currentState)
            },
            
            // 支持自适应
            supportAdaptation: {
                enabled: true,
                triggers: [
                    { condition: 'struggle_detected', action: 'increase_scaffolding' },
                    { condition: 'confidence_low', action: 'provide_encouragement' },
                    { condition: 'plateau_reached', action: 'introduce_challenge' }
                ],
                supportLevels: ['minimal', 'moderate', 'intensive'],
                escalationRules: this.defineEscalationRules(currentState)
            }
        };
    }

    /**
     * 创建路径监控系统
     */
    createPathMonitoring(path, userId) {
        return {
            // 实时监控指标
            realTimeMetrics: [
                'learning_progress',
                'engagement_level',
                'difficulty_alignment',
                'time_efficiency',
                'error_patterns',
                'motivation_indicators'
            ],
            
            // 监控频率
            monitoringFrequency: {
                realTime: ['engagement_level', 'error_patterns'],
                daily: ['learning_progress', 'time_efficiency'],
                weekly: ['difficulty_alignment', 'motivation_indicators'],
                monthly: ['overall_path_effectiveness']
            },
            
            // 预警系统
            alertSystem: {
                triggers: [
                    {
                        metric: 'engagement_level',
                        condition: '< 0.3',
                        severity: 'high',
                        action: 'immediate_intervention'
                    },
                    {
                        metric: 'error_rate',
                        condition: '> 0.7',
                        severity: 'medium',
                        action: 'difficulty_adjustment'
                    },
                    {
                        metric: 'progress_rate',
                        condition: '< 0.5',
                        severity: 'medium',
                        action: 'path_review'
                    }
                ],
                notificationChannels: ['in_app', 'email'],
                escalationProcedure: this.defineEscalationProcedure()
            },
            
            // 数据收集
            dataCollection: {
                sessionData: ['duration', 'completion_rate', 'accuracy', 'engagement_metrics'],
                behaviorData: ['click_patterns', 'time_spent_per_question', 'help_seeking'],
                feedbackData: ['user_ratings', 'difficulty_perception', 'satisfaction'],
                outcomeData: ['skill_improvement', 'knowledge_retention', 'goal_progress']
            },
            
            // 分析和报告
            analytics: {
                dashboards: this.createMonitoringDashboards(path),
                reports: {
                    daily: 'progress_summary',
                    weekly: 'detailed_analysis',
                    monthly: 'comprehensive_review'
                },
                insights: {
                    automated: true,
                    aiPowered: true,
                    humanReview: 'monthly'
                }
            }
        };
    }

    /**
     * 组织学习阶段
     */
    organizeLearningPhases(path, strategy) {
        const phases = [];

        // 基础阶段
        if (strategy.focus.includes('foundation_building')) {
            phases.push({
                name: '基础建设阶段',
                duration: '2-4周',
                objectives: ['建立基础知识', '培养学习习惯', '增强信心'],
                content: this.selectFoundationContent(path),
                assessments: ['基础知识测试', '学习习惯评估'],
                successCriteria: ['基础概念掌握率 > 80%', '学习一致性 > 70%']
            });
        }

        // 发展阶段
        phases.push({
            name: '技能发展阶段',
            duration: '4-8周',
            objectives: ['提升核心技能', '扩展知识面', '增强应用能力'],
            content: this.selectDevelopmentContent(path),
            assessments: ['技能测试', '应用练习', '项目作业'],
            successCriteria: ['技能掌握率 > 75%', '应用能力提升 > 60%']
        });

        // 强化阶段
        if (strategy.focus.includes('advanced_challenges')) {
            phases.push({
                name: '能力强化阶段',
                duration: '3-6周',
                objectives: ['挑战高难度内容', '培养专家思维', '实现突破'],
                content: this.selectAdvancedContent(path),
                assessments: ['高级测试', '综合项目', '创新挑战'],
                successCriteria: ['高级技能掌握率 > 70%', '创新能力提升 > 50%']
            });
        }

        // 巩固阶段
        phases.push({
            name: '知识巩固阶段',
            duration: '2-4周',
            objectives: ['巩固所学知识', '提升保持率', '准备实际应用'],
            content: this.selectConsolidationContent(path),
            assessments: ['综合测试', '保持率测试', '实际应用评估'],
            successCriteria: ['知识保持率 > 85%', '应用准备度 > 80%']
        });

        return phases;
    }

    /**
     * 规划内容序列
     */
    planContentSequence(path, currentState) {
        const sequence = [];

        // 基于依赖关系排序内容
        const contentGraph = this.buildContentDependencyGraph(path.content);
        const topologicalOrder = this.topologicalSort(contentGraph);

        // 应用个性化调整
        const personalizedOrder = this.personalizeContentOrder(
            topologicalOrder,
            currentState.learningStyle,
            currentState.preferences
        );

        // 添加复习和强化节点
        const sequenceWithReview = this.insertReviewPoints(
            personalizedOrder,
            currentState.retentionPatterns
        );

        // 平衡难度分布
        const balancedSequence = this.balanceDifficultyDistribution(
            sequenceWithReview,
            currentState.cognitiveLoad
        );

        return balancedSequence.map((contentId, index) => ({
            order: index + 1,
            contentId,
            estimatedDuration: this.estimateContentDuration(contentId, currentState),
            prerequisites: this.getContentPrerequisites(contentId),
            learningObjectives: this.getContentObjectives(contentId),
            assessmentPoints: this.getAssessmentPoints(contentId),
            adaptationRules: this.getContentAdaptationRules(contentId)
        }));
    }

    /**
     * 规划时间分配
     */
    planTimeAllocation(path, currentState) {
        const totalAvailableTime = currentState.availableTime || 60; // 分钟/天
        const phases = path.phases || [];
        
        const allocation = {
            daily: totalAvailableTime,
            weekly: totalAvailableTime * 7,
            distribution: {},
            flexibility: {
                buffer: 0.2, // 20% 缓冲时间
                adjustmentRange: 0.3 // 30% 调整范围
            }
        };

        // 按阶段分配时间
        const totalPhaseWeight = phases.reduce((sum, phase) => sum + (phase.weight || 1), 0);
        
        phases.forEach(phase => {
            const weight = phase.weight || 1;
            const phaseTime = Math.round((allocation.weekly * weight) / totalPhaseWeight);
            allocation.distribution[phase.name] = {
                weekly: phaseTime,
                daily: Math.round(phaseTime / 7),
                priority: phase.priority || 'medium'
            };
        });

        // 按内容类型分配时间
        allocation.contentTypes = {
            learning: 0.6, // 60% 学习新内容
            practice: 0.25, // 25% 练习
            review: 0.15 // 15% 复习
        };

        return allocation;
    }

    // 辅助方法

    /**
     * 生成路径ID
     */
    generatePathId() {
        return 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 评估当前水平
     */
    assessCurrentLevel(learningData, analysisResults) {
        const overallScore = analysisResults.overallAssessment?.overallScore || 0.5;
        
        if (overallScore >= 0.9) return 'expert';
        if (overallScore >= 0.8) return 'advanced';
        if (overallScore >= 0.6) return 'intermediate';
        if (overallScore >= 0.4) return 'beginner';
        return 'novice';
    }

    /**
     * 识别掌握领域
     */
    identifyMasteryAreas(analysisResults) {
        const areas = [];
        
        if (analysisResults.sectionPerformance) {
            Object.entries(analysisResults.sectionPerformance).forEach(([section, stats]) => {
                if (stats.accuracy > 80) {
                    areas.push({
                        area: section,
                        level: stats.accuracy > 90 ? 'expert' : 'proficient',
                        confidence: stats.accuracy / 100
                    });
                }
            });
        }
        
        return areas;
    }

    /**
     * 识别薄弱领域
     */
    identifyWeaknessAreas(analysisResults) {
        const areas = [];
        
        if (analysisResults.sectionPerformance) {
            Object.entries(analysisResults.sectionPerformance).forEach(([section, stats]) => {
                if (stats.accuracy < 60) {
                    areas.push({
                        area: section,
                        severity: stats.accuracy < 40 ? 'critical' : 'moderate',
                        priority: stats.accuracy < 40 ? 'high' : 'medium',
                        improvementNeeded: 80 - stats.accuracy
                    });
                }
            });
        }
        
        return areas;
    }

    /**
     * 保存学习路径
     */
    saveLearningPath(userId, path) {
        this.currentPaths.set(userId, path);
        
        // 保存到历史记录
        if (!this.pathHistory.has(userId)) {
            this.pathHistory.set(userId, []);
        }
        this.pathHistory.get(userId).push({
            pathId: path.pathId,
            version: path.version,
            createdAt: path.createdAt,
            strategy: path.optimization.strategy
        });

        // 持久化存储
        try {
            localStorage.setItem(`learning_path_${userId}`, JSON.stringify(path));
            localStorage.setItem(`path_history_${userId}`, 
                JSON.stringify(this.pathHistory.get(userId)));
        } catch (error) {
            console.warn('路径保存到本地存储失败:', error);
        }
    }

    /**
     * 获取下一个路径版本
     */
    getNextPathVersion(userId) {
        const history = this.pathHistory.get(userId) || [];
        return history.length + 1;
    }

    /**
     * 计算路径置信度
     */
    calculatePathConfidence(currentState, strategy) {
        let confidence = 0.5;

        // 基于数据质量
        if (currentState.progressHistory.length > 10) confidence += 0.2;
        if (currentState.progressHistory.length < 3) confidence -= 0.2;

        // 基于一致性
        if (currentState.consistency > 0.7) confidence += 0.15;
        if (currentState.consistency < 0.3) confidence -= 0.15;

        // 基于策略匹配度
        if (strategy.type === 'personalized') confidence += 0.1;
        if (strategy.type === 'remedial') confidence -= 0.05;

        return Math.max(0.1, Math.min(1.0, confidence));
    }
}

/**
 * 序列路径策略
 */
class SequentialPathStrategy {
    async generate(currentState, userGoals) {
        return {
            type: 'sequential',
            structure: 'linear',
            content: this.organizeSequentialContent(currentState, userGoals),
            pacing: 'steady',
            flexibility: 'low'
        };
    }

    organizeSequentialContent(currentState, userGoals) {
        // 实现序列内容组织逻辑
        return [];
    }
}

/**
 * 自适应路径策略
 */
class AdaptivePathStrategy {
    async generate(currentState, userGoals) {
        return {
            type: 'adaptive',
            structure: 'branching',
            content: this.organizeAdaptiveContent(currentState, userGoals),
            pacing: 'variable',
            flexibility: 'high'
        };
    }

    organizeAdaptiveContent(currentState, userGoals) {
        // 实现自适应内容组织逻辑
        return [];
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.AdaptiveLearningPathOptimizer = AdaptiveLearningPathOptimizer;
    console.log('🛤️ 自适应学习路径优化器已加载');
}
