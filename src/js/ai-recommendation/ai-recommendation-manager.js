/**
 * AI智能推荐系统管理器
 * 统一管理和协调各个AI推荐模块
 */

class AIRecommendationManager {
    constructor() {
        // 初始化各个核心模块
        this.weaknessAnalyzer = new WeaknessAnalyzer();
        this.recommendationEngine = new RecommendationEngine();
        this.adaptiveLearningPath = new AdaptiveLearningPath();
        this.performanceTracker = new PerformanceTracker();

        // 系统状态
        this.isInitialized = false;
        this.isAnalyzing = false;
        this.currentRecommendations = [];
        this.userProfile = null;
        this.learningContext = {};

        // 配置选项
        this.config = {
            enableRealTimeAnalysis: true,
            enablePerformanceTracking: true,
            recommendationRefreshInterval: 300000, // 5分钟
            weaknessAnalysisInterval: 600000, // 10分钟
            maxRecommendations: 8,
            minConfidenceThreshold: 0.6
        };

        // 事件系统
        this.eventEmitter = new EventTarget();

        // 缓存系统
        this.cache = {
            weaknessAnalysis: null,
            recommendations: null,
            learningPath: null,
            lastUpdate: null
        };

        // 定时器
        this.refreshTimer = null;
        this.analysisTimer = null;
    }

    /**
     * 初始化AI推荐系统
     * @param {Object} options - 配置选项
     */
    async initialize(options = {}) {
        console.log('🤖 初始化AI智能推荐系统...');

        try {
            // 合并配置
            this.config = { ...this.config, ...options };

            // 启动性能追踪
            if (this.config.enablePerformanceTracking) {
                this.performanceTracker.startTracking();
            }

            // 设置定时刷新
            this.setupAutoRefresh();

            // 加载用户画像
            await this.loadUserProfile();

            // 标记为已初始化
            this.isInitialized = true;

            // 触发初始化完成事件
            this.emitEvent('initialized', { timestamp: Date.now() });

            console.log('✅ AI推荐系统初始化完成');
            return true;

        } catch (error) {
            console.error('❌ AI推荐系统初始化失败:', error);
            this.emitEvent('error', { type: 'initialization', error });
            return false;
        }
    }

    /**
     * 生成智能推荐
     * @param {Object} context - 学习上下文
     * @returns {Array} 推荐结果
     */
    async generateRecommendations(context = {}) {
        console.log('🎯 生成智能推荐...');

        if (!this.isInitialized) {
            console.warn('⚠️ AI推荐系统未初始化');
            return [];
        }

        if (this.isAnalyzing) {
            console.log('⏳ 分析正在进行中，返回缓存推荐');
            return this.currentRecommendations;
        }

        this.isAnalyzing = true;

        try {
            // 更新学习上下文
            this.learningContext = { ...this.learningContext, ...context };

            // 获取用户学习数据
            const learnerData = await this.getUserLearningData();

            // 1. 薄弱点分析
            const weaknessAnalysis = await this.analyzeWeaknesses(learnerData);

            // 2. 获取可用学习内容
            const availableContent = await this.getAvailableContent();

            // 3. 生成推荐
            const recommendations = await this.recommendationEngine.generateRecommendations(
                this.userProfile,
                weaknessAnalysis,
                availableContent,
                this.learningContext
            );

            // 4. 过滤和优化推荐
            const optimizedRecommendations = this.optimizeRecommendations(recommendations);

            // 5. 生成自适应学习路径
            const learningPath = await this.generateLearningPath(
                this.userProfile,
                weaknessAnalysis,
                optimizedRecommendations
            );

            // 6. 更新缓存
            this.updateCache({
                weaknessAnalysis,
                recommendations: optimizedRecommendations,
                learningPath
            });

            // 7. 更新当前推荐
            this.currentRecommendations = optimizedRecommendations;

            // 8. 触发推荐生成事件
            this.emitEvent('recommendationsGenerated', {
                recommendations: optimizedRecommendations,
                weaknessAnalysis,
                learningPath,
                timestamp: Date.now()
            });

            console.log(`✅ 生成 ${optimizedRecommendations.length} 个推荐`);
            return optimizedRecommendations;

        } catch (error) {
            console.error('❌ 推荐生成失败:', error);
            this.emitEvent('error', { type: 'recommendation_generation', error });
            return this.getFallbackRecommendations();

        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * 分析学习薄弱点
     * @param {Object} learnerData - 学习者数据
     * @returns {Object} 薄弱点分析结果
     */
    async analyzeWeaknesses(learnerData) {
        console.log('🔍 分析学习薄弱点...');

        try {
            // 检查缓存
            if (this.cache.weaknessAnalysis && this.isCacheValid('weaknessAnalysis')) {
                console.log('📋 使用缓存的薄弱点分析');
                return this.cache.weaknessAnalysis;
            }

            // 执行薄弱点分析
            const analysis = await this.weaknessAnalyzer.analyzeWeaknesses(learnerData);

            // 触发薄弱点分析完成事件
            this.emitEvent('weaknessAnalysisCompleted', {
                analysis,
                timestamp: Date.now()
            });

            return analysis;

        } catch (error) {
            console.error('薄弱点分析失败:', error);
            this.emitEvent('error', { type: 'weakness_analysis', error });
            return this.getDefaultWeaknessAnalysis();
        }
    }

    /**
     * 生成自适应学习路径
     * @param {Object} userProfile - 用户画像
     * @param {Object} weaknessAnalysis - 薄弱点分析
     * @param {Array} recommendations - 推荐内容
     * @returns {Object} 学习路径
     */
    async generateLearningPath(userProfile, weaknessAnalysis, recommendations) {
        console.log('🛤️ 生成自适应学习路径...');

        try {
            // 检查缓存
            if (this.cache.learningPath && this.isCacheValid('learningPath')) {
                console.log('📋 使用缓存的学习路径');
                return this.cache.learningPath;
            }

            // 构建学习目标
            const learningGoals = this.extractLearningGoals(weaknessAnalysis, this.learningContext);

            // 准备可用内容
            const availableContent = recommendations.map(rec => rec.content);

            // 生成自适应路径
            const learningPath = await this.adaptiveLearningPath.generateAdaptivePath(
                userProfile,
                learningGoals,
                availableContent,
                weaknessAnalysis
            );

            // 触发学习路径生成事件
            this.emitEvent('learningPathGenerated', {
                learningPath,
                timestamp: Date.now()
            });

            return learningPath;

        } catch (error) {
            console.error('学习路径生成失败:', error);
            this.emitEvent('error', { type: 'learning_path_generation', error });
            return this.getDefaultLearningPath();
        }
    }

    /**
     * 记录学习活动
     * @param {Object} activity - 学习活动数据
     */
    recordLearningActivity(activity) {
        console.log('📝 记录学习活动...', activity.type);

        try {
            // 添加时间戳
            const enrichedActivity = {
                ...activity,
                timestamp: Date.now(),
                sessionId: this.getCurrentSessionId()
            };

            // 发送到性能追踪器
            if (this.config.enablePerformanceTracking) {
                this.performanceTracker.collectData('learning_activity', enrichedActivity);
            }

            // 更新用户画像
            this.updateUserProfile(enrichedActivity);

            // 检查是否需要重新分析
            if (this.shouldTriggerReanalysis(enrichedActivity)) {
                this.scheduleReanalysis();
            }

            // 触发活动记录事件
            this.emitEvent('activityRecorded', {
                activity: enrichedActivity,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('学习活动记录失败:', error);
            this.emitEvent('error', { type: 'activity_recording', error });
        }
    }

    /**
     * 获取当前推荐
     * @returns {Array} 当前推荐列表
     */
    getCurrentRecommendations() {
        return this.currentRecommendations;
    }

    /**
     * 获取薄弱点分析结果
     * @returns {Object} 薄弱点分析结果
     */
    getWeaknessAnalysis() {
        return this.cache.weaknessAnalysis;
    }

    /**
     * 获取学习路径
     * @returns {Object} 学习路径
     */
    getLearningPath() {
        return this.cache.learningPath;
    }

    /**
     * 获取用户画像
     * @returns {Object} 用户画像
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        console.log('⚙️ 更新AI推荐系统配置...');

        this.config = { ...this.config, ...newConfig };

        // 重新设置定时器
        this.setupAutoRefresh();

        // 触发配置更新事件
        this.emitEvent('configUpdated', {
            config: this.config,
            timestamp: Date.now()
        });
    }

    /**
     * 销毁AI推荐系统
     */
    destroy() {
        console.log('🗑️ 销毁AI推荐系统...');

        // 停止性能追踪
        if (this.performanceTracker.isTracking) {
            this.performanceTracker.stopTracking();
        }

        // 清除定时器
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
        }

        // 清除缓存
        this.cache = {
            weaknessAnalysis: null,
            recommendations: null,
            learningPath: null,
            lastUpdate: null
        };

        // 重置状态
        this.isInitialized = false;
        this.isAnalyzing = false;
        this.currentRecommendations = [];

        // 触发销毁事件
        this.emitEvent('destroyed', { timestamp: Date.now() });

        console.log('✅ AI推荐系统已销毁');
    }

    /**
     * 添加事件监听器
     * @param {String} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     */
    addEventListener(eventType, listener) {
        this.eventEmitter.addEventListener(eventType, listener);
    }

    /**
     * 移除事件监听器
     * @param {String} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     */
    removeEventListener(eventType, listener) {
        this.eventEmitter.removeEventListener(eventType, listener);
    }

    // ===== 私有方法 =====

    /**
     * 设置自动刷新
     */
    setupAutoRefresh() {
        // 清除现有定时器
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
        }

        // 设置推荐刷新定时器
        this.refreshTimer = setInterval(() => {
            this.refreshRecommendations();
        }, this.config.recommendationRefreshInterval);

        // 设置薄弱点分析定时器
        this.analysisTimer = setInterval(() => {
            this.refreshWeaknessAnalysis();
        }, this.config.weaknessAnalysisInterval);
    }

    /**
     * 刷新推荐
     */
    async refreshRecommendations() {
        console.log('🔄 自动刷新推荐...');
        
        try {
            await this.generateRecommendations();
        } catch (error) {
            console.error('自动刷新推荐失败:', error);
        }
    }

    /**
     * 刷新薄弱点分析
     */
    async refreshWeaknessAnalysis() {
        console.log('🔄 自动刷新薄弱点分析...');

        try {
            // 清除缓存以强制重新分析
            this.cache.weaknessAnalysis = null;
            
            const learnerData = await this.getUserLearningData();
            await this.analyzeWeaknesses(learnerData);
        } catch (error) {
            console.error('自动刷新薄弱点分析失败:', error);
        }
    }

    /**
     * 加载用户画像
     */
    async loadUserProfile() {
        try {
            // 从存储中加载用户画像
            const savedProfile = await Storage.get('user_profile');
            
            if (savedProfile) {
                this.userProfile = savedProfile;
            } else {
                // 创建默认用户画像
                this.userProfile = this.createDefaultUserProfile();
                await this.saveUserProfile();
            }

            console.log('👤 用户画像已加载');
        } catch (error) {
            console.error('用户画像加载失败:', error);
            this.userProfile = this.createDefaultUserProfile();
        }
    }

    /**
     * 保存用户画像
     */
    async saveUserProfile() {
        try {
            await Storage.set('user_profile', this.userProfile);
        } catch (error) {
            console.error('用户画像保存失败:', error);
        }
    }

    /**
     * 创建默认用户画像
     */
    createDefaultUserProfile() {
        return {
            id: 'user_' + Date.now(),
            examType: 'cet4',
            currentLevel: 'beginner',
            learningStyle: 'visual',
            learningGoals: [],
            strongAreas: [],
            weakAreas: [],
            timePreferences: {},
            motivation: {},
            priorExperience: {},
            cognitiveCapacity: 0.5,
            timeAvailable: 60, // 分钟/天
            createdAt: Date.now(),
            lastUpdated: Date.now()
        };
    }

    /**
     * 获取用户学习数据
     */
    async getUserLearningData() {
        try {
            const learningData = await Storage.get('learning_data') || {};
            
            // 添加用户画像信息
            learningData.userProfile = this.userProfile;
            
            return learningData;
        } catch (error) {
            console.error('获取学习数据失败:', error);
            return { userProfile: this.userProfile };
        }
    }

    /**
     * 获取可用学习内容
     */
    async getAvailableContent() {
        // 模拟获取可用内容
        // 在实际实现中，这里会从内容库或API获取
        return [
            {
                id: 'vocab_001',
                type: 'vocabulary',
                title: '四级核心词汇',
                difficulty: 0.4,
                estimatedTime: 20,
                skills: ['vocabulary'],
                topics: ['cet4', 'basic'],
                interactivity: 0.7,
                multimedia: true
            },
            {
                id: 'grammar_001',
                type: 'grammar',
                title: '时态语法练习',
                difficulty: 0.5,
                estimatedTime: 25,
                skills: ['grammar'],
                topics: ['tenses', 'basic'],
                interactivity: 0.8,
                multimedia: false
            },
            {
                id: 'listening_001',
                type: 'listening',
                title: '日常对话听力',
                difficulty: 0.3,
                estimatedTime: 15,
                skills: ['listening'],
                topics: ['conversation', 'daily'],
                interactivity: 0.9,
                multimedia: true
            },
            // 更多内容...
        ];
    }

    /**
     * 优化推荐结果
     */
    optimizeRecommendations(recommendations) {
        return recommendations
            .filter(rec => rec.confidence >= this.config.minConfidenceThreshold)
            .slice(0, this.config.maxRecommendations)
            .map((rec, index) => ({
                ...rec,
                optimized: true,
                finalRank: index + 1
            }));
    }

    /**
     * 提取学习目标
     */
    extractLearningGoals(weaknessAnalysis, context) {
        const goals = [];

        // 基于薄弱点生成目标
        if (weaknessAnalysis.overall.primaryWeaknesses) {
            weaknessAnalysis.overall.primaryWeaknesses.forEach(weakness => {
                goals.push({
                    type: 'improvement',
                    target: weakness.module,
                    currentLevel: weakness.score,
                    targetLevel: Math.min(1, weakness.score + 0.3),
                    priority: weakness.priority,
                    deadline: context.deadline || null
                });
            });
        }

        // 添加用户自定义目标
        if (this.userProfile.learningGoals) {
            goals.push(...this.userProfile.learningGoals);
        }

        return goals;
    }

    /**
     * 更新用户画像
     */
    updateUserProfile(activity) {
        // 更新最后活动时间
        this.userProfile.lastUpdated = Date.now();
        this.userProfile.lastActivity = activity.timestamp;

        // 根据活动类型更新画像
        switch (activity.type) {
            case 'vocabulary_practice':
                this.updateVocabularyProfile(activity);
                break;
            case 'grammar_exercise':
                this.updateGrammarProfile(activity);
                break;
            case 'listening_practice':
                this.updateListeningProfile(activity);
                break;
            case 'reading_practice':
                this.updateReadingProfile(activity);
                break;
        }

        // 保存更新后的画像
        this.saveUserProfile();
    }

    /**
     * 更新词汇画像
     */
    updateVocabularyProfile(activity) {
        if (!this.userProfile.vocabulary) {
            this.userProfile.vocabulary = {};
        }

        // 更新词汇相关统计
        if (activity.result) {
            const accuracy = activity.result.accuracy || 0;
            this.userProfile.vocabulary.averageAccuracy = 
                (this.userProfile.vocabulary.averageAccuracy || 0) * 0.9 + accuracy * 0.1;
        }
    }

    /**
     * 检查是否需要重新分析
     */
    shouldTriggerReanalysis(activity) {
        // 如果用户表现有显著变化，触发重新分析
        if (activity.result && activity.result.accuracy) {
            const accuracy = activity.result.accuracy;
            // 如果准确率极高或极低，可能需要调整推荐
            return accuracy > 0.9 || accuracy < 0.3;
        }
        return false;
    }

    /**
     * 安排重新分析
     */
    scheduleReanalysis() {
        // 延迟执行重新分析，避免频繁分析
        setTimeout(() => {
            this.refreshRecommendations();
        }, 5000); // 5秒后执行
    }

    /**
     * 检查缓存是否有效
     */
    isCacheValid(cacheKey) {
        const cacheTime = this.cache.lastUpdate;
        if (!cacheTime) return false;

        const maxAge = {
            weaknessAnalysis: 10 * 60 * 1000, // 10分钟
            recommendations: 5 * 60 * 1000,   // 5分钟
            learningPath: 15 * 60 * 1000      // 15分钟
        };

        const age = Date.now() - cacheTime;
        return age < (maxAge[cacheKey] || 5 * 60 * 1000);
    }

    /**
     * 更新缓存
     */
    updateCache(data) {
        Object.assign(this.cache, data);
        this.cache.lastUpdate = Date.now();
    }

    /**
     * 触发事件
     */
    emitEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        this.eventEmitter.dispatchEvent(event);
    }

    /**
     * 获取当前会话ID
     */
    getCurrentSessionId() {
        return 'session_' + Date.now();
    }

    /**
     * 获取回退推荐
     */
    getFallbackRecommendations() {
        return [
            {
                content: {
                    id: 'fallback_001',
                    type: 'vocabulary',
                    title: '基础词汇练习',
                    difficulty: 0.3
                },
                score: 0.7,
                reason: '系统推荐',
                algorithm: 'fallback'
            }
        ];
    }

    /**
     * 获取默认薄弱点分析
     */
    getDefaultWeaknessAnalysis() {
        return {
            overall: {
                weaknessScore: 0.5,
                primaryWeaknesses: [],
                learningPatterns: {},
                cognitiveLoad: 0.5
            },
            vocabulary: {},
            grammar: {},
            listening: {},
            reading: {},
            recommendations: []
        };
    }

    /**
     * 获取默认学习路径
     */
    getDefaultLearningPath() {
        return {
            constructionSequence: [],
            scaffoldingStrategy: {},
            isOptimized: false,
            fallbackReason: '使用默认学习路径'
        };
    }

    // 其他画像更新方法的简化实现
    updateGrammarProfile(activity) {
        // 更新语法相关画像
    }

    updateListeningProfile(activity) {
        // 更新听力相关画像
    }

    updateReadingProfile(activity) {
        // 更新阅读相关画像
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIRecommendationManager;
} else {
    window.AIRecommendationManager = AIRecommendationManager;
}
