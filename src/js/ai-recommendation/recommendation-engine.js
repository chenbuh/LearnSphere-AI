/**
 * 智能推荐引擎 - 核心推荐算法
 * 基于协同过滤、内容过滤和混合推荐策略
 */

class RecommendationEngine {
    constructor() {
        // 推荐算法权重
        this.algorithmWeights = {
            collaborative: 0.4,    // 协同过滤
            contentBased: 0.35,    // 内容过滤
            knowledgeBased: 0.25   // 知识过滤
        };

        // 推荐类型
        this.recommendationTypes = {
            VOCABULARY: 'vocabulary',
            GRAMMAR: 'grammar',
            LISTENING: 'listening',
            READING: 'reading',
            EXERCISE: 'exercise',
            REVIEW: 'review'
        };

        // 相似度阈值
        this.similarityThreshold = 0.6;

        // 推荐数量限制
        this.maxRecommendations = 10;

        // 用户画像缓存
        this.userProfileCache = new Map();
        
        // 内容特征缓存
        this.contentFeatureCache = new Map();
    }

    /**
     * 生成个性化推荐
     * @param {Object} userProfile - 用户画像
     * @param {Object} weaknessAnalysis - 薄弱点分析结果
     * @param {Array} availableContent - 可用学习内容
     * @param {Object} context - 上下文信息
     * @returns {Array} 推荐结果
     */
    async generateRecommendations(userProfile, weaknessAnalysis, availableContent, context = {}) {
        console.log('🎯 开始生成个性化推荐...');

        try {
            // 1. 协同过滤推荐
            const collaborativeRecs = await this.collaborativeFiltering(userProfile, availableContent);

            // 2. 基于内容的推荐
            const contentBasedRecs = await this.contentBasedFiltering(userProfile, weaknessAnalysis, availableContent);

            // 3. 基于知识的推荐
            const knowledgeBasedRecs = await this.knowledgeBasedFiltering(userProfile, weaknessAnalysis, availableContent);

            // 4. 混合推荐
            const hybridRecs = this.hybridRecommendation(collaborativeRecs, contentBasedRecs, knowledgeBasedRecs);

            // 5. 上下文过滤
            const contextFilteredRecs = this.applyContextFiltering(hybridRecs, context);

            // 6. 多样性优化
            const diversifiedRecs = this.optimizeDiversity(contextFilteredRecs);

            // 7. 最终排序和限制数量
            const finalRecs = this.finalizeRecommendations(diversifiedRecs);

            console.log('✅ 推荐生成完成', finalRecs);
            return finalRecs;

        } catch (error) {
            console.error('❌ 推荐生成失败:', error);
            return this.getFallbackRecommendations(weaknessAnalysis);
        }
    }

    /**
     * 协同过滤推荐
     */
    async collaborativeFiltering(userProfile, availableContent) {
        console.log('📊 执行协同过滤推荐...');

        const recommendations = [];

        try {
            // 1. 寻找相似用户
            const similarUsers = await this.findSimilarUsers(userProfile);

            if (similarUsers.length === 0) {
                console.log('⚠️ 未找到相似用户，跳过协同过滤');
                return [];
            }

            // 2. 分析相似用户的学习偏好
            const learningPreferences = this.analyzeSimilarUsersPreferences(similarUsers);

            // 3. 基于相似用户经验生成推荐
            for (const content of availableContent) {
                const score = this.calculateCollaborativeScore(content, learningPreferences, userProfile);
                
                if (score > 0.5) {
                    recommendations.push({
                        content: content,
                        score: score,
                        reason: '基于相似学习者的成功经验',
                        algorithm: 'collaborative',
                        evidence: this.getCollaborativeEvidence(content, similarUsers)
                    });
                }
            }

            // 按分数排序
            recommendations.sort((a, b) => b.score - a.score);

            console.log(`📈 协同过滤生成 ${recommendations.length} 个推荐`);
            return recommendations.slice(0, this.maxRecommendations);

        } catch (error) {
            console.error('协同过滤推荐失败:', error);
            return [];
        }
    }

    /**
     * 基于内容的推荐
     */
    async contentBasedFiltering(userProfile, weaknessAnalysis, availableContent) {
        console.log('🎯 执行基于内容的推荐...');

        const recommendations = [];

        try {
            // 1. 分析用户学习历史偏好
            const userPreferences = this.extractUserPreferences(userProfile);

            // 2. 为每个内容计算匹配度
            for (const content of availableContent) {
                const contentFeatures = this.extractContentFeatures(content);
                const matchScore = this.calculateContentMatchScore(userPreferences, contentFeatures, weaknessAnalysis);

                if (matchScore > 0.4) {
                    recommendations.push({
                        content: content,
                        score: matchScore,
                        reason: this.generateContentBasedReason(contentFeatures, weaknessAnalysis),
                        algorithm: 'content_based',
                        features: contentFeatures
                    });
                }
            }

            // 按分数排序
            recommendations.sort((a, b) => b.score - a.score);

            console.log(`🎨 内容过滤生成 ${recommendations.length} 个推荐`);
            return recommendations.slice(0, this.maxRecommendations);

        } catch (error) {
            console.error('内容过滤推荐失败:', error);
            return [];
        }
    }

    /**
     * 基于知识的推荐
     */
    async knowledgeBasedFiltering(userProfile, weaknessAnalysis, availableContent) {
        console.log('🧠 执行基于知识的推荐...');

        const recommendations = [];

        try {
            // 1. 分析用户知识结构
            const knowledgeState = this.analyzeUserKnowledgeState(userProfile);

            // 2. 识别学习路径
            const learningPath = this.identifyOptimalLearningPath(knowledgeState, weaknessAnalysis);

            // 3. 基于教育理论生成推荐
            for (const content of availableContent) {
                const knowledgeScore = this.calculateKnowledgeBasedScore(content, knowledgeState, learningPath);

                if (knowledgeScore > 0.3) {
                    recommendations.push({
                        content: content,
                        score: knowledgeScore,
                        reason: this.generateKnowledgeBasedReason(content, knowledgeState),
                        algorithm: 'knowledge_based',
                        prerequisites: this.identifyPrerequisites(content),
                        difficulty: this.assessContentDifficulty(content, knowledgeState)
                    });
                }
            }

            // 按学习路径优先级排序
            recommendations.sort((a, b) => b.score - a.score);

            console.log(`🔬 知识过滤生成 ${recommendations.length} 个推荐`);
            return recommendations.slice(0, this.maxRecommendations);

        } catch (error) {
            console.error('知识过滤推荐失败:', error);
            return [];
        }
    }

    /**
     * 混合推荐算法
     */
    hybridRecommendation(collaborativeRecs, contentBasedRecs, knowledgeBasedRecs) {
        console.log('🔄 执行混合推荐算法...');

        const hybridRecs = new Map();

        // 合并不同算法的推荐结果
        [
            { recs: collaborativeRecs, weight: this.algorithmWeights.collaborative },
            { recs: contentBasedRecs, weight: this.algorithmWeights.contentBased },
            { recs: knowledgeBasedRecs, weight: this.algorithmWeights.knowledgeBased }
        ].forEach(({ recs, weight }) => {
            recs.forEach(rec => {
                const contentId = rec.content.id;
                const weightedScore = rec.score * weight;

                if (hybridRecs.has(contentId)) {
                    const existing = hybridRecs.get(contentId);
                    existing.score += weightedScore;
                    existing.algorithms.push(rec.algorithm);
                    existing.reasons.push(rec.reason);
                } else {
                    hybridRecs.set(contentId, {
                        content: rec.content,
                        score: weightedScore,
                        algorithms: [rec.algorithm],
                        reasons: [rec.reason],
                        features: rec.features || {},
                        evidence: rec.evidence || []
                    });
                }
            });
        });

        // 转换为数组并排序
        const recommendations = Array.from(hybridRecs.values())
            .sort((a, b) => b.score - a.score);

        console.log(`🎯 混合推荐生成 ${recommendations.length} 个推荐`);
        return recommendations;
    }

    /**
     * 应用上下文过滤
     */
    applyContextFiltering(recommendations, context) {
        console.log('📍 应用上下文过滤...');

        return recommendations.filter(rec => {
            // 时间上下文过滤
            if (context.timeOfDay && !this.isAppropriateForTime(rec.content, context.timeOfDay)) {
                return false;
            }

            // 设备上下文过滤
            if (context.deviceType && !this.isSuitableForDevice(rec.content, context.deviceType)) {
                return false;
            }

            // 学习环境过滤
            if (context.environment && !this.isSuitableForEnvironment(rec.content, context.environment)) {
                return false;
            }

            // 可用时间过滤
            if (context.availableTime && rec.content.estimatedTime > context.availableTime) {
                return false;
            }

            return true;
        }).map(rec => {
            // 根据上下文调整分数
            rec.score *= this.calculateContextBonus(rec.content, context);
            return rec;
        });
    }

    /**
     * 优化推荐多样性
     */
    optimizeDiversity(recommendations) {
        console.log('🌈 优化推荐多样性...');

        const diversifiedRecs = [];
        const typeCount = {};
        const maxPerType = Math.ceil(this.maxRecommendations / Object.keys(this.recommendationTypes).length);

        for (const rec of recommendations) {
            const contentType = rec.content.type || 'unknown';
            
            if (!typeCount[contentType]) {
                typeCount[contentType] = 0;
            }

            if (typeCount[contentType] < maxPerType) {
                diversifiedRecs.push(rec);
                typeCount[contentType]++;
            }

            if (diversifiedRecs.length >= this.maxRecommendations) {
                break;
            }
        }

        console.log(`🎨 多样性优化后保留 ${diversifiedRecs.length} 个推荐`);
        return diversifiedRecs;
    }

    /**
     * 最终确定推荐
     */
    finalizeRecommendations(recommendations) {
        return recommendations.slice(0, this.maxRecommendations).map((rec, index) => ({
            ...rec,
            rank: index + 1,
            confidence: this.calculateConfidence(rec),
            explanation: this.generateExplanation(rec),
            estimatedBenefit: this.estimateBenefit(rec),
            timestamp: Date.now()
        }));
    }

    /**
     * 寻找相似用户
     */
    async findSimilarUsers(userProfile) {
        // 模拟相似用户查找
        // 在实际实现中，这里会查询用户数据库
        const mockSimilarUsers = [
            {
                id: 'user_001',
                profile: { examType: userProfile.examType, level: userProfile.level },
                similarity: 0.85,
                successfulContent: ['vocab_001', 'grammar_002', 'listening_003']
            },
            {
                id: 'user_002',
                profile: { examType: userProfile.examType, level: userProfile.level },
                similarity: 0.78,
                successfulContent: ['vocab_002', 'reading_001', 'grammar_003']
            }
        ];

        return mockSimilarUsers.filter(user => user.similarity >= this.similarityThreshold);
    }

    /**
     * 分析相似用户偏好
     */
    analyzeSimilarUsersPreferences(similarUsers) {
        const preferences = {
            contentTypes: {},
            difficultyLevels: {},
            learningStyles: {},
            successfulPaths: []
        };

        similarUsers.forEach(user => {
            // 聚合偏好数据
            user.successfulContent.forEach(contentId => {
                // 分析成功内容的特征
                preferences.contentTypes[contentId] = (preferences.contentTypes[contentId] || 0) + user.similarity;
            });
        });

        return preferences;
    }

    /**
     * 计算协同过滤分数
     */
    calculateCollaborativeScore(content, preferences, userProfile) {
        let score = 0;

        // 基于相似用户的成功经验
        if (preferences.contentTypes[content.id]) {
            score += preferences.contentTypes[content.id];
        }

        // 根据内容特征调整
        score *= this.getContentPopularityBonus(content);

        return Math.min(1, score);
    }

    /**
     * 提取用户偏好
     */
    extractUserPreferences(userProfile) {
        const preferences = {
            preferredTypes: [],
            preferredDifficulty: userProfile.currentLevel || 'medium',
            learningStyle: userProfile.learningStyle || 'visual',
            timePreferences: userProfile.timePreferences || {},
            strongAreas: userProfile.strongAreas || [],
            weakAreas: userProfile.weakAreas || []
        };

        // 从学习历史中提取偏好
        if (userProfile.learningHistory) {
            preferences.preferredTypes = this.extractPreferredTypes(userProfile.learningHistory);
        }

        return preferences;
    }

    /**
     * 提取内容特征
     */
    extractContentFeatures(content) {
        if (this.contentFeatureCache.has(content.id)) {
            return this.contentFeatureCache.get(content.id);
        }

        const features = {
            type: content.type || 'unknown',
            difficulty: content.difficulty || 0.5,
            topics: content.topics || [],
            skills: content.skills || [],
            estimatedTime: content.estimatedTime || 10,
            interactivity: content.interactivity || 0.5,
            multimedia: content.multimedia || false,
            prerequisites: content.prerequisites || []
        };

        this.contentFeatureCache.set(content.id, features);
        return features;
    }

    /**
     * 计算内容匹配分数
     */
    calculateContentMatchScore(userPreferences, contentFeatures, weaknessAnalysis) {
        let score = 0;

        // 类型偏好匹配
        if (userPreferences.preferredTypes.includes(contentFeatures.type)) {
            score += 0.3;
        }

        // 难度匹配
        const difficultyMatch = 1 - Math.abs(this.getDifficultyValue(userPreferences.preferredDifficulty) - contentFeatures.difficulty);
        score += difficultyMatch * 0.25;

        // 薄弱点匹配
        const weaknessMatch = this.calculateWeaknessMatch(contentFeatures, weaknessAnalysis);
        score += weaknessMatch * 0.35;

        // 学习风格匹配
        const styleMatch = this.calculateStyleMatch(userPreferences.learningStyle, contentFeatures);
        score += styleMatch * 0.1;

        return Math.min(1, score);
    }

    /**
     * 生成基于内容的推荐理由
     */
    generateContentBasedReason(contentFeatures, weaknessAnalysis) {
        const reasons = [];

        if (weaknessAnalysis.overall.primaryWeaknesses.some(w => contentFeatures.skills.includes(w.module))) {
            reasons.push('针对您的薄弱环节');
        }

        if (contentFeatures.difficulty < 0.6) {
            reasons.push('适合当前水平');
        }

        if (contentFeatures.interactivity > 0.7) {
            reasons.push('互动性强，学习效果好');
        }

        return reasons.join('，') || '推荐给您';
    }

    /**
     * 分析用户知识状态
     */
    analyzeUserKnowledgeState(userProfile) {
        return {
            masteredConcepts: userProfile.masteredConcepts || [],
            learningConcepts: userProfile.learningConcepts || [],
            prerequisites: userProfile.prerequisites || {},
            knowledgeGaps: userProfile.knowledgeGaps || [],
            competencyLevel: userProfile.competencyLevel || 'beginner'
        };
    }

    /**
     * 识别最优学习路径
     */
    identifyOptimalLearningPath(knowledgeState, weaknessAnalysis) {
        const path = [];

        // 基于知识图谱确定学习顺序
        const priorityTopics = this.getPriorityTopics(knowledgeState, weaknessAnalysis);

        priorityTopics.forEach(topic => {
            path.push({
                topic: topic,
                prerequisites: this.getTopicPrerequisites(topic),
                difficulty: this.getTopicDifficulty(topic),
                estimatedTime: this.getTopicEstimatedTime(topic)
            });
        });

        return path;
    }

    /**
     * 计算基于知识的分数
     */
    calculateKnowledgeBasedScore(content, knowledgeState, learningPath) {
        let score = 0;

        // 检查前置条件
        const prerequisitesMet = this.checkPrerequisites(content, knowledgeState);
        if (!prerequisitesMet) {
            return 0; // 前置条件不满足，分数为0
        }

        // 学习路径匹配
        const pathMatch = this.calculatePathMatch(content, learningPath);
        score += pathMatch * 0.4;

        // 知识缺口填补
        const gapFilling = this.calculateGapFilling(content, knowledgeState);
        score += gapFilling * 0.3;

        // 认知负载适配
        const cognitiveLoad = this.assessCognitiveLoad(content, knowledgeState);
        score += (1 - cognitiveLoad) * 0.3;

        return Math.min(1, score);
    }

    /**
     * 获取回退推荐
     */
    getFallbackRecommendations(weaknessAnalysis) {
        console.log('🔄 生成回退推荐...');

        const fallbackRecs = [];

        // 基于薄弱点生成基础推荐
        if (weaknessAnalysis.overall.primaryWeaknesses.length > 0) {
            weaknessAnalysis.overall.primaryWeaknesses.forEach(weakness => {
                fallbackRecs.push({
                    content: {
                        id: `fallback_${weakness.module}`,
                        type: weakness.module,
                        title: `${this.getModuleName(weakness.module)}基础练习`,
                        difficulty: 0.3,
                        estimatedTime: 15
                    },
                    score: 1 - weakness.score,
                    reason: '基于薄弱点分析推荐',
                    algorithm: 'fallback',
                    rank: fallbackRecs.length + 1
                });
            });
        }

        return fallbackRecs;
    }

    /**
     * 计算推荐置信度
     */
    calculateConfidence(recommendation) {
        let confidence = recommendation.score;

        // 算法数量加成
        if (recommendation.algorithms && recommendation.algorithms.length > 1) {
            confidence += 0.1 * (recommendation.algorithms.length - 1);
        }

        // 证据支持加成
        if (recommendation.evidence && recommendation.evidence.length > 0) {
            confidence += 0.05 * recommendation.evidence.length;
        }

        return Math.min(1, confidence);
    }

    /**
     * 生成推荐解释
     */
    generateExplanation(recommendation) {
        const explanations = [];

        if (recommendation.reasons) {
            explanations.push(...recommendation.reasons);
        }

        if (recommendation.algorithms && recommendation.algorithms.includes('collaborative')) {
            explanations.push('相似学习者也选择了此内容');
        }

        if (recommendation.algorithms && recommendation.algorithms.includes('content_based')) {
            explanations.push('与您的学习偏好匹配');
        }

        if (recommendation.algorithms && recommendation.algorithms.includes('knowledge_based')) {
            explanations.push('符合您当前的知识水平');
        }

        return explanations.join('；') || '系统推荐';
    }

    /**
     * 估算学习收益
     */
    estimateBenefit(recommendation) {
        let benefit = recommendation.score;

        // 根据内容类型调整收益估算
        const contentType = recommendation.content.type;
        const typeBenefitMap = {
            vocabulary: 0.8,
            grammar: 0.7,
            listening: 0.9,
            reading: 0.8
        };

        benefit *= (typeBenefitMap[contentType] || 0.6);

        return {
            overall: benefit,
            shortTerm: benefit * 0.7,
            longTerm: benefit * 1.2,
            knowledgeGain: benefit * 0.8,
            skillImprovement: benefit * 0.9
        };
    }

    // 辅助方法
    getModuleName(module) {
        const names = {
            vocabulary: '词汇学习',
            grammar: '语法练习',
            listening: '听力训练',
            reading: '阅读理解'
        };
        return names[module] || module;
    }

    getDifficultyValue(difficulty) {
        const difficultyMap = {
            beginner: 0.2,
            easy: 0.3,
            medium: 0.5,
            hard: 0.7,
            expert: 0.9
        };
        return difficultyMap[difficulty] || 0.5;
    }

    getContentPopularityBonus(content) {
        // 模拟内容受欢迎程度
        return 1.0;
    }

    extractPreferredTypes(learningHistory) {
        // 从学习历史中提取偏好类型
        return ['vocabulary', 'grammar'];
    }

    calculateWeaknessMatch(contentFeatures, weaknessAnalysis) {
        // 计算与薄弱点的匹配度
        let match = 0;
        
        weaknessAnalysis.overall.primaryWeaknesses.forEach(weakness => {
            if (contentFeatures.skills && contentFeatures.skills.includes(weakness.module)) {
                match += (1 - weakness.score) * 0.5;
            }
        });

        return Math.min(1, match);
    }

    calculateStyleMatch(learningStyle, contentFeatures) {
        // 计算学习风格匹配度
        const styleMap = {
            visual: contentFeatures.multimedia ? 0.8 : 0.4,
            auditory: contentFeatures.type === 'listening' ? 0.9 : 0.3,
            kinesthetic: contentFeatures.interactivity || 0.5
        };

        return styleMap[learningStyle] || 0.5;
    }

    isAppropriateForTime(content, timeOfDay) {
        // 检查内容是否适合当前时间
        return true; // 简化实现
    }

    isSuitableForDevice(content, deviceType) {
        // 检查内容是否适合当前设备
        return true; // 简化实现
    }

    isSuitableForEnvironment(content, environment) {
        // 检查内容是否适合当前环境
        return true; // 简化实现
    }

    calculateContextBonus(content, context) {
        // 计算上下文奖励
        return 1.0; // 简化实现
    }

    getCollaborativeEvidence(content, similarUsers) {
        // 获取协同过滤证据
        return similarUsers.map(user => `用户${user.id}成功学习了此内容`);
    }

    generateKnowledgeBasedReason(content, knowledgeState) {
        // 生成基于知识的推荐理由
        return '符合您当前的学习进度';
    }

    identifyPrerequisites(content) {
        // 识别内容前置条件
        return content.prerequisites || [];
    }

    assessContentDifficulty(content, knowledgeState) {
        // 评估内容难度
        return content.difficulty || 0.5;
    }

    getPriorityTopics(knowledgeState, weaknessAnalysis) {
        // 获取优先学习主题
        return weaknessAnalysis.overall.primaryWeaknesses.map(w => w.module);
    }

    getTopicPrerequisites(topic) {
        // 获取主题前置条件
        return [];
    }

    getTopicDifficulty(topic) {
        // 获取主题难度
        return 0.5;
    }

    getTopicEstimatedTime(topic) {
        // 获取主题估计时间
        return 30;
    }

    checkPrerequisites(content, knowledgeState) {
        // 检查前置条件
        return true; // 简化实现
    }

    calculatePathMatch(content, learningPath) {
        // 计算路径匹配度
        return 0.5; // 简化实现
    }

    calculateGapFilling(content, knowledgeState) {
        // 计算知识缺口填补度
        return 0.5; // 简化实现
    }

    assessCognitiveLoad(content, knowledgeState) {
        // 评估认知负载
        return content.difficulty || 0.5;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecommendationEngine;
} else {
    window.RecommendationEngine = RecommendationEngine;
}
