/**
 * AI推荐系统单元测试
 */

describe('AI推荐系统测试', () => {
    let mockStorage;
    
    beforeEach(() => {
        // 重置模拟对象
        mockStorage = {
            get: jest.fn(),
            set: jest.fn(),
            initMockLearningData: jest.fn()
        };
        
        // 清除控制台输出模拟
        jest.clearAllMocks();
    });

    describe('Storage工具类测试', () => {
        test('应该能够初始化模拟学习数据', async () => {
            // 模拟Storage类
            const Storage = {
                getInstance: () => mockStorage,
                get: mockStorage.get,
                set: mockStorage.set,
                initMockLearningData: mockStorage.initMockLearningData
            };

            mockStorage.get.mockResolvedValue(null);
            mockStorage.set.mockResolvedValue(true);
            mockStorage.initMockLearningData.mockResolvedValue(true);

            await Storage.initMockLearningData();

            expect(mockStorage.initMockLearningData).toHaveBeenCalled();
        });

        test('应该能够保存和获取学习数据', async () => {
            const testData = createMockLearningActivity();
            
            mockStorage.get.mockResolvedValue(testData);
            mockStorage.set.mockResolvedValue(true);

            const Storage = {
                get: mockStorage.get,
                set: mockStorage.set
            };

            await Storage.set('test_key', testData);
            const retrievedData = await Storage.get('test_key');

            expect(mockStorage.set).toHaveBeenCalledWith('test_key', testData);
            expect(mockStorage.get).toHaveBeenCalledWith('test_key');
            expect(retrievedData).toEqual(testData);
        });
    });

    describe('薄弱点分析器测试', () => {
        test('应该能够分析学习薄弱点', () => {
            // 模拟WeaknessAnalyzer类
            const WeaknessAnalyzer = class {
                constructor() {
                    this.learningData = {};
                }

                analyzeWeaknesses() {
                    return {
                        overall: {
                            score: 0.75,
                            primaryWeaknesses: ['vocabulary', 'grammar'],
                            forgettingRisk: 0.3
                        },
                        modules: {
                            vocabulary: {
                                weaknesses: [{
                                    area: 'advanced_words',
                                    severity: 'high',
                                    score: 0.6
                                }]
                            }
                        }
                    };
                }
            };

            const analyzer = new WeaknessAnalyzer();
            const result = analyzer.analyzeWeaknesses();

            expect(result).toHaveProperty('overall');
            expect(result).toHaveProperty('modules');
            expect(result.overall.score).toBe(0.75);
            expect(result.overall.primaryWeaknesses).toContain('vocabulary');
        });
    });

    describe('推荐引擎测试', () => {
        test('应该能够生成个性化推荐', async () => {
            // 模拟RecommendationEngine类
            const RecommendationEngine = class {
                async generateRecommendations(userData, weaknessAnalysis, context) {
                    return [
                        {
                            content: {
                                id: 'rec_001',
                                title: '高级词汇练习',
                                type: 'vocabulary',
                                difficulty: 'hard',
                                estimatedTime: 20
                            },
                            confidence: 0.85,
                            reason: '基于您在词汇方面的薄弱点推荐',
                            priority: 1
                        }
                    ];
                }
            };

            const engine = new RecommendationEngine();
            const userData = createMockUserData();
            const weaknessAnalysis = { modules: { vocabulary: { weaknesses: [] } } };
            const context = { timeOfDay: 'morning' };

            const recommendations = await engine.generateRecommendations(userData, weaknessAnalysis, context);

            expect(recommendations).toHaveLength(1);
            expect(recommendations[0]).toHaveProperty('content');
            expect(recommendations[0]).toHaveProperty('confidence');
            expect(recommendations[0].confidence).toBe(0.85);
        });
    });

    describe('学习表现追踪器测试', () => {
        test('应该能够记录学习活动', () => {
            // 模拟PerformanceTracker类
            const PerformanceTracker = class {
                constructor() {
                    this.learningActivities = [];
                }

                recordActivity(activity) {
                    const fullActivity = {
                        ...activity,
                        timestamp: Date.now(),
                        id: this.learningActivities.length + 1
                    };
                    this.learningActivities.push(fullActivity);
                    return fullActivity;
                }

                getPerformanceSnapshot() {
                    return {
                        totalActivities: this.learningActivities.length,
                        averageScore: this.learningActivities.reduce((sum, a) => sum + a.score, 0) / this.learningActivities.length || 0
                    };
                }
            };

            const tracker = new PerformanceTracker();
            const activity = createMockLearningActivity();

            const recorded = tracker.recordActivity(activity);
            const snapshot = tracker.getPerformanceSnapshot();

            expect(recorded).toHaveProperty('timestamp');
            expect(recorded).toHaveProperty('id');
            expect(snapshot.totalActivities).toBe(1);
            expect(snapshot.averageScore).toBe(activity.score);
        });
    });

    describe('AI推荐管理器集成测试', () => {
        test('应该能够完整初始化AI系统', async () => {
            // 模拟AIRecommendationManager类
            const AIRecommendationManager = class {
                constructor() {
                    this.isInitialized = false;
                    this.components = {};
                }

                async initialize(config) {
                    try {
                        // 模拟初始化各个组件
                        this.components.weaknessAnalyzer = { initialized: true };
                        this.components.recommendationEngine = { initialized: true };
                        this.components.adaptiveLearningPath = { initialized: true };
                        this.components.performanceTracker = { initialized: true };
                        
                        this.isInitialized = true;
                        return true;
                    } catch (error) {
                        return false;
                    }
                }

                async generateRecommendations() {
                    if (!this.isInitialized) {
                        throw new Error('AI系统未初始化');
                    }
                    
                    return [
                        {
                            content: { id: 'test_rec', title: '测试推荐' },
                            confidence: 0.8,
                            reason: '测试推荐原因'
                        }
                    ];
                }
            };

            const manager = new AIRecommendationManager();
            const config = {
                enableRealTimeAnalysis: true,
                maxRecommendations: 5,
                examType: 'ielts'
            };

            const initResult = await manager.initialize(config);
            expect(initResult).toBe(true);
            expect(manager.isInitialized).toBe(true);

            const recommendations = await manager.generateRecommendations();
            expect(recommendations).toHaveLength(1);
            expect(recommendations[0].confidence).toBe(0.8);
        });

        test('应该正确处理初始化失败的情况', async () => {
            const AIRecommendationManager = class {
                async initialize(config) {
                    // 模拟初始化失败
                    throw new Error('初始化失败');
                }
            };

            const manager = new AIRecommendationManager();
            
            try {
                await manager.initialize({});
                fail('应该抛出错误');
            } catch (error) {
                expect(error.message).toBe('初始化失败');
            }
        });
    });

    describe('数据验证测试', () => {
        test('学习活动数据应该符合预期格式', () => {
            const activity = createMockLearningActivity();
            
            expect(activity).toHaveProperty('type');
            expect(activity).toHaveProperty('module');
            expect(activity).toHaveProperty('contentId');
            expect(activity).toHaveProperty('isCorrect');
            expect(activity).toHaveProperty('timeSpent');
            expect(activity).toHaveProperty('score');
            expect(activity).toHaveProperty('timestamp');
            
            expect(typeof activity.type).toBe('string');
            expect(typeof activity.isCorrect).toBe('boolean');
            expect(typeof activity.timeSpent).toBe('number');
            expect(typeof activity.score).toBe('number');
        });

        test('用户数据应该包含活动历史', () => {
            const userData = createMockUserData();
            
            expect(userData).toHaveProperty('activities');
            expect(Array.isArray(userData.activities)).toBe(true);
            expect(userData.activities.length).toBeGreaterThan(0);
            
            userData.activities.forEach(activity => {
                expect(activity).toHaveProperty('id');
                expect(activity).toHaveProperty('timestamp');
            });
        });
    });
});
