/**
 * 自适应测试系统
 * 基于Item Response Theory (IRT) 的智能测试引擎
 */
class AdaptiveTestingSystem {
    constructor() {
        this.currentTest = null;
        this.questionBank = {};
        this.studentAbility = 0; // 学生能力值 (-3 to +3)
        this.testHistory = [];
        this.adaptiveAlgorithm = 'CAT'; // CAT (Computer Adaptive Testing)
        this.confidenceInterval = 0.95;
        this.standardError = 0.3;
        this.maxQuestions = 30;
        this.minQuestions = 10;
        
        // 优化：性能统计
        this.stats = {
            testsCompleted: 0,
            totalQuestions: 0,
            avgQuestionsPerTest: 0,
            avgTestDuration: 0,
            abilityEstimationAccuracy: 0
        };
        
        // 优化：缓存IRT计算结果
        this.irtCache = new Map();
        this.maxCacheSize = 500;
        
        this.init();
    }

    init() {
        const logger = window.logger || console;
        logger.info('AdaptiveTestingSystem', '初始化自适应测试系统...');
        
        try {
            // 性能标记
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('adaptive-test-init-start');
            }
            
            this.initializeQuestionBank();
            this.loadStudentHistory();
            this.setupTestingInterface();
            
            if (window.performanceMonitor) {
                window.performanceMonitor.mark('adaptive-test-init-end');
                window.performanceMonitor.measure(
                    '自适应测试初始化',
                    'adaptive-test-init-start',
                    'adaptive-test-init-end'
                );
            }
            
            logger.info('AdaptiveTestingSystem', '自适应测试系统初始化完成');
        } catch (error) {
            logger.error('AdaptiveTestingSystem', '初始化失败:', error);
        }
    }

    /**
     * 设置测试界面（优化版）
     */
    setupTestingInterface() {
        const logger = window.logger || console;
        logger.debug('AdaptiveTestingSystem', '设置自适应测试界面...');
        
        try {
            // 测试界面已在页面中集成，这里只需要绑定事件
            this.bindTestEvents();
            logger.debug('AdaptiveTestingSystem', '测试界面设置完成');
        } catch (error) {
            logger.error('AdaptiveTestingSystem', '设置测试界面失败:', error);
        }
    }

    /**
     * 绑定测试事件
     */
    bindTestEvents() {
        // 监听测试启动事件
        document.addEventListener('start-adaptive-test', (event) => {
            const { testType } = event.detail;
            this.startAdaptiveTest({ type: testType });
        });
    }

    /**
     * 初始化题库（优化版）
     */
    initializeQuestionBank() {
        const logger = window.logger || console;
        
        try {
            // 优化：延迟加载题库，只加载需要的题目类型
            this.questionBank = {
                vocabulary: this.generateVocabularyQuestions(),
                grammar: this.generateGrammarQuestions(),
                reading: this.generateReadingQuestions(),
                listening: this.generateListeningQuestions()
            };
            
            const totalQuestions = Object.values(this.questionBank)
                .reduce((sum, questions) => sum + questions.length, 0);
            
            logger.info('AdaptiveTestingSystem', `自适应题库已初始化，共 ${totalQuestions} 道题目`);
        } catch (error) {
            logger.error('AdaptiveTestingSystem', '题库初始化失败:', error);
            throw error;
        }
    }

    /**
     * 获取测试统计信息
     */
    getStats() {
        const avgQuestions = this.stats.testsCompleted > 0
            ? this.stats.totalQuestions / this.stats.testsCompleted
            : 0;
        
        return {
            ...this.stats,
            avgQuestionsPerTest: avgQuestions.toFixed(1),
            cacheSize: this.irtCache.size,
            currentAbility: this.studentAbility.toFixed(2),
            questionBankSize: {
                vocabulary: this.questionBank.vocabulary?.length || 0,
                grammar: this.questionBank.grammar?.length || 0,
                reading: this.questionBank.reading?.length || 0,
                listening: this.questionBank.listening?.length || 0
            }
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.irtCache.clear();
        if (this.currentTest) {
            this.currentTest = null;
        }
        
        const logger = window.logger || console;
        logger.info('AdaptiveTestingSystem', '资源已清理');
    }

    /**
     * 获取当前测试状态
     */
    getCurrentTestStatus() {
        if (!this.currentTest) {
            return { active: false };
        }
        
        return {
            active: true,
            questionsAnswered: this.currentTest.responses.length,
            currentAbility: this.currentTest.studentAbility.toFixed(2),
            standardError: this.currentTest.standardError.toFixed(3),
            isComplete: this.currentTest.isComplete
        };
    }

    /**
     * 生成词汇题目
     */
    generateVocabularyQuestions() {
        return [
            // 简单题目 (difficulty: -2 to -1)
            {
                id: 'vocab_001',
                type: 'vocabulary',
                difficulty: -1.5, // IRT难度参数
                discrimination: 1.2, // IRT区分度参数
                guessing: 0.25, // 猜测参数
                question: 'What does "happy" mean?',
                options: ['快乐的', '悲伤的', '愤怒的', '害怕的'],
                correct: 0,
                explanation: '"Happy" means feeling joy or pleasure.',
                tags: ['basic', 'emotion', 'adjective']
            },
            {
                id: 'vocab_002',
                type: 'vocabulary',
                difficulty: -1.2,
                discrimination: 1.1,
                guessing: 0.25,
                question: 'Choose the correct meaning of "book":',
                options: ['书', '笔', '桌子', '椅子'],
                correct: 0,
                explanation: '"Book" is a written or printed work consisting of pages.',
                tags: ['basic', 'object', 'noun']
            },

            // 中等题目 (difficulty: -0.5 to 0.5)
            {
                id: 'vocab_003',
                type: 'vocabulary',
                difficulty: 0.2,
                discrimination: 1.5,
                guessing: 0.25,
                question: 'What does "sophisticated" mean?',
                options: ['复杂的，精密的', '简单的', '普通的', '便宜的'],
                correct: 0,
                explanation: '"Sophisticated" means having great knowledge or experience.',
                tags: ['intermediate', 'adjective', 'abstract']
            },
            {
                id: 'vocab_004',
                type: 'vocabulary',
                difficulty: 0.1,
                discrimination: 1.3,
                guessing: 0.25,
                question: 'Select the synonym of "enormous":',
                options: ['tiny', 'huge', 'medium', 'normal'],
                correct: 1,
                explanation: '"Enormous" means extremely large, so "huge" is the synonym.',
                tags: ['intermediate', 'synonym', 'adjective']
            },

            // 困难题目 (difficulty: 1.0 to 2.5)
            {
                id: 'vocab_005',
                type: 'vocabulary',
                difficulty: 1.8,
                discrimination: 2.0,
                guessing: 0.25,
                question: 'What does "ubiquitous" mean?',
                options: ['rare', 'present everywhere', 'ancient', 'expensive'],
                correct: 1,
                explanation: '"Ubiquitous" means present, appearing, or found everywhere.',
                tags: ['advanced', 'adjective', 'academic']
            },
            {
                id: 'vocab_006',
                type: 'vocabulary',
                difficulty: 2.1,
                discrimination: 1.8,
                guessing: 0.25,
                question: 'Choose the correct meaning of "perspicacious":',
                options: ['confused', 'having keen insight', 'lazy', 'talkative'],
                correct: 1,
                explanation: '"Perspicacious" means having a ready insight into things.',
                tags: ['advanced', 'adjective', 'formal']
            }
        ];
    }

    /**
     * 生成语法题目
     */
    generateGrammarQuestions() {
        return [
            {
                id: 'gram_001',
                type: 'grammar',
                difficulty: -1.0,
                discrimination: 1.4,
                guessing: 0.25,
                question: 'Choose the correct form: "I ___ to school every day."',
                options: ['go', 'goes', 'going', 'gone'],
                correct: 0,
                explanation: 'Use the base form "go" with first person singular in present simple.',
                tags: ['basic', 'present_simple', 'verb']
            },
            {
                id: 'gram_002',
                type: 'grammar',
                difficulty: 0.5,
                discrimination: 1.6,
                guessing: 0.25,
                question: 'If I ___ rich, I would travel around the world.',
                options: ['am', 'was', 'were', 'will be'],
                correct: 2,
                explanation: 'Use "were" in the second conditional for all persons.',
                tags: ['intermediate', 'conditional', 'subjunctive']
            },
            {
                id: 'gram_003',
                type: 'grammar',
                difficulty: 1.5,
                discrimination: 2.2,
                guessing: 0.25,
                question: 'The report ___ by the committee before the meeting.',
                options: ['should have reviewed', 'should have been reviewed', 'should review', 'should be reviewing'],
                correct: 1,
                explanation: 'Use passive voice with modal perfect: should have been + past participle.',
                tags: ['advanced', 'passive_voice', 'modal_perfect']
            }
        ];
    }

    /**
     * 生成阅读题目
     */
    generateReadingQuestions() {
        return [
            {
                id: 'read_001',
                type: 'reading',
                difficulty: -0.5,
                discrimination: 1.3,
                guessing: 0.25,
                passage: 'Tom likes to play basketball. He plays every afternoon after school. His favorite team is the Lakers.',
                question: 'What does Tom like to do?',
                options: ['Play football', 'Play basketball', 'Watch TV', 'Read books'],
                correct: 1,
                explanation: 'The passage clearly states "Tom likes to play basketball."',
                tags: ['basic', 'main_idea', 'sports']
            },
            {
                id: 'read_002',
                type: 'reading',
                difficulty: 1.2,
                discrimination: 1.8,
                guessing: 0.25,
                passage: 'The phenomenon of climate change has become increasingly evident in recent decades. Scientists have observed rising global temperatures, melting ice caps, and changing weather patterns. These changes are primarily attributed to human activities, particularly the emission of greenhouse gases from fossil fuel combustion.',
                question: 'According to the passage, what is the primary cause of climate change?',
                options: ['Natural weather cycles', 'Solar radiation changes', 'Human activities', 'Ocean currents'],
                correct: 2,
                explanation: 'The passage states that changes are "primarily attributed to human activities."',
                tags: ['advanced', 'cause_effect', 'science']
            }
        ];
    }

    /**
     * 生成听力题目
     */
    generateListeningQuestions() {
        return [
            {
                id: 'listen_001',
                type: 'listening',
                difficulty: -0.8,
                discrimination: 1.2,
                guessing: 0.25,
                audioUrl: '/assets/audio/simple_conversation.mp3',
                transcript: 'A: Hello, how are you? B: I\'m fine, thank you. How about you? A: I\'m good too.',
                question: 'How is person B feeling?',
                options: ['Bad', 'Fine', 'Tired', 'Sick'],
                correct: 1,
                explanation: 'Person B says "I\'m fine, thank you."',
                tags: ['basic', 'conversation', 'greeting']
            }
        ];
    }

    /**
     * 开始自适应测试
     */
    startAdaptiveTest(testConfig) {
        this.currentTest = {
            id: this.generateTestId(),
            type: testConfig.type || 'mixed',
            startTime: Date.now(),
            questions: [],
            responses: [],
            currentQuestionIndex: 0,
            studentAbility: this.studentAbility,
            standardError: 2.0, // 初始标准误
            isComplete: false,
            config: testConfig
        };

        // 选择第一题
        const firstQuestion = this.selectNextQuestion();
        this.currentTest.questions.push(firstQuestion);

        console.log('🎯 自适应测试已开始');
        this.displayQuestion(firstQuestion);

        return this.currentTest.id;
    }

    /**
     * 选择下一题
     */
    selectNextQuestion() {
        const usedQuestions = this.currentTest.questions.map(q => q.id);
        const availableQuestions = this.getAllQuestions().filter(q => 
            !usedQuestions.includes(q.id) && 
            this.matchesTestType(q, this.currentTest.type)
        );

        if (availableQuestions.length === 0) {
            return null;
        }

        // 使用IRT选择最优题目
        const optimalQuestion = this.selectOptimalQuestion(availableQuestions);
        return optimalQuestion;
    }

    /**
     * 使用IRT选择最优题目
     */
    selectOptimalQuestion(availableQuestions) {
        let bestQuestion = null;
        let maxInformation = 0;

        availableQuestions.forEach(question => {
            const information = this.calculateInformation(
                question.difficulty,
                question.discrimination,
                question.guessing,
                this.currentTest.studentAbility
            );

            if (information > maxInformation) {
                maxInformation = information;
                bestQuestion = question;
            }
        });

        return bestQuestion || availableQuestions[0];
    }

    /**
     * 计算Fisher信息量（优化版 - 带缓存）
     */
    calculateInformation(difficulty, discrimination, guessing, ability) {
        // 优化：使用缓存
        const cacheKey = `info_${difficulty}_${discrimination}_${guessing}_${ability.toFixed(2)}`;
        const cached = this.irtCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        
        const probability = this.calculateProbability(difficulty, discrimination, guessing, ability);
        const q = 1 - probability;
        
        // Fisher信息量公式
        const numerator = Math.pow(discrimination, 2) * Math.pow(probability - guessing, 2);
        const denominator = probability * q * Math.pow(1 - guessing, 2);
        
        // 优化：避免除零错误
        const information = denominator > 0.0001 ? numerator / denominator : 0;
        
        // 缓存结果
        this.cacheIRTResult(cacheKey, information);
        
        return information;
    }

    /**
     * 计算正确回答概率 (3PL IRT模型)（优化版 - 带缓存）
     */
    calculateProbability(difficulty, discrimination, guessing, ability) {
        // 优化：使用缓存
        const cacheKey = `prob_${difficulty}_${discrimination}_${guessing}_${ability.toFixed(2)}`;
        const cached = this.irtCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        
        const exponent = discrimination * (ability - difficulty);
        
        // 优化：防止指数溢出
        const clampedExponent = Math.max(-20, Math.min(20, exponent));
        const probability = guessing + (1 - guessing) / (1 + Math.exp(-clampedExponent));
        
        // 缓存结果
        this.cacheIRTResult(cacheKey, probability);
        
        return probability;
    }

    /**
     * 缓存IRT计算结果
     */
    cacheIRTResult(key, value) {
        // 限制缓存大小
        if (this.irtCache.size >= this.maxCacheSize) {
            const firstKey = this.irtCache.keys().next().value;
            this.irtCache.delete(firstKey);
        }
        this.irtCache.set(key, value);
    }

    /**
     * 处理学生回答
     */
    handleStudentResponse(questionId, selectedOption, responseTime) {
        const question = this.currentTest.questions.find(q => q.id === questionId);
        if (!question) return;

        const isCorrect = selectedOption === question.correct;
        
        const response = {
            questionId: questionId,
            selectedOption: selectedOption,
            isCorrect: isCorrect,
            responseTime: responseTime,
            timestamp: Date.now()
        };

        this.currentTest.responses.push(response);

        // 更新学生能力估计
        this.updateAbilityEstimate();

        // 检查是否应该结束测试
        if (this.shouldEndTest()) {
            this.completeTest();
        } else {
            // 选择下一题
            const nextQuestion = this.selectNextQuestion();
            if (nextQuestion) {
                this.currentTest.questions.push(nextQuestion);
                this.displayQuestion(nextQuestion);
            } else {
                this.completeTest();
            }
        }

        return {
            isCorrect: isCorrect,
            explanation: question.explanation,
            nextQuestion: !this.currentTest.isComplete
        };
    }

    /**
     * 更新能力估计 (Maximum Likelihood Estimation)（优化版）
     */
    updateAbilityEstimate() {
        const logger = window.logger || console;
        const startTime = performance.now();
        
        try {
            const responses = this.currentTest.responses;
            const questions = this.currentTest.questions;

            // 使用牛顿-拉夫逊法优化能力估计
            let ability = this.currentTest.studentAbility;
            const maxIterations = 10;
            const tolerance = 0.001;

            for (let i = 0; i < maxIterations; i++) {
                const { firstDerivative, secondDerivative } = this.calculateDerivatives(ability, responses, questions);
                
                if (Math.abs(firstDerivative) < tolerance) {
                    logger.debug('AdaptiveTestingSystem', `能力估计收敛于第 ${i + 1} 次迭代`);
                    break;
                }
                
                // 优化：防止除零错误
                if (Math.abs(secondDerivative) < 0.0001) {
                    logger.warn('AdaptiveTestingSystem', '二阶导数接近零，停止迭代');
                    break;
                }
                
                const newAbility = ability - firstDerivative / secondDerivative;
                
                // 限制能力值范围
                ability = Math.max(-4, Math.min(4, newAbility));
            }

            this.currentTest.studentAbility = ability;
            this.currentTest.standardError = this.calculateStandardError(ability, questions);

            const duration = performance.now() - startTime;
            logger.info('AdaptiveTestingSystem', `能力估计更新: ${ability.toFixed(2)} (SE: ${this.currentTest.standardError.toFixed(2)})，用时 ${duration.toFixed(2)}ms`);
            
        } catch (error) {
            logger.error('AdaptiveTestingSystem', '能力估计失败:', error);
        }
    }

    /**
     * 计算对数似然函数的一阶和二阶导数
     */
    calculateDerivatives(ability, responses, questions) {
        let firstDerivative = 0;
        let secondDerivative = 0;

        responses.forEach((response, index) => {
            const question = questions[index];
            const { difficulty, discrimination, guessing } = question;
            
            const probability = this.calculateProbability(difficulty, discrimination, guessing, ability);
            const q = 1 - probability;

            // 一阶导数
            const term1 = discrimination * (probability - guessing) / (probability * (1 - guessing));
            const term2 = discrimination * (probability - guessing) / (q * (1 - guessing));
            
            if (response.isCorrect) {
                firstDerivative += term1;
            } else {
                firstDerivative -= term2;
            }

            // 二阶导数
            const commonTerm = Math.pow(discrimination, 2) * Math.pow(probability - guessing, 2);
            const denominator = probability * q * Math.pow(1 - guessing, 2);
            secondDerivative -= commonTerm / denominator;
        });

        return { firstDerivative, secondDerivative };
    }

    /**
     * 计算标准误
     */
    calculateStandardError(ability, questions) {
        let totalInformation = 0;

        questions.forEach(question => {
            const information = this.calculateInformation(
                question.difficulty,
                question.discrimination,
                question.guessing,
                ability
            );
            totalInformation += information;
        });

        return totalInformation > 0 ? 1 / Math.sqrt(totalInformation) : 2.0;
    }

    /**
     * 判断是否应该结束测试
     */
    shouldEndTest() {
        const questionCount = this.currentTest.questions.length;
        const standardError = this.currentTest.standardError;

        // 达到最大题目数
        if (questionCount >= this.maxQuestions) {
            return true;
        }

        // 达到最小题目数且精度足够
        if (questionCount >= this.minQuestions && standardError <= this.standardError) {
            return true;
        }

        // 没有更多可用题目
        const usedQuestions = this.currentTest.questions.map(q => q.id);
        const availableQuestions = this.getAllQuestions().filter(q => 
            !usedQuestions.includes(q.id) && 
            this.matchesTestType(q, this.currentTest.type)
        );

        if (availableQuestions.length === 0) {
            return true;
        }

        return false;
    }

    /**
     * 完成测试
     */
    completeTest() {
        this.currentTest.endTime = Date.now();
        this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
        this.currentTest.isComplete = true;

        // 生成测试报告
        const report = this.generateTestReport();
        this.currentTest.report = report;

        // 保存到历史记录
        this.testHistory.push(this.currentTest);
        this.saveTestHistory();

        // 更新全局学生能力
        this.studentAbility = this.currentTest.studentAbility;

        console.log('✅ 自适应测试已完成');
        this.displayTestResults(report);
    }

    /**
     * 生成测试报告
     */
    generateTestReport() {
        const responses = this.currentTest.responses;
        const questions = this.currentTest.questions;
        
        const correctCount = responses.filter(r => r.isCorrect).length;
        const totalQuestions = responses.length;
        const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;

        // 计算能力等级
        const abilityLevel = this.getAbilityLevel(this.currentTest.studentAbility);
        
        // 分析薄弱环节
        const weakAreas = this.analyzeWeakAreas(responses, questions);
        
        // 计算各题型表现
        const performanceByType = this.calculatePerformanceByType(responses, questions);

        // 生成建议
        const recommendations = this.generateRecommendations(this.currentTest.studentAbility, weakAreas);

        return {
            summary: {
                totalQuestions: totalQuestions,
                correctAnswers: correctCount,
                accuracy: accuracy,
                abilityEstimate: this.currentTest.studentAbility,
                standardError: this.currentTest.standardError,
                abilityLevel: abilityLevel,
                duration: this.currentTest.duration
            },
            performance: {
                byType: performanceByType,
                weakAreas: weakAreas,
                strengths: this.analyzeStrengths(responses, questions)
            },
            recommendations: recommendations,
            detailedResults: this.generateDetailedResults(responses, questions)
        };
    }

    /**
     * 获取能力等级
     */
    getAbilityLevel(ability) {
        if (ability >= 2.0) return { level: 'Expert', description: '专家级' };
        if (ability >= 1.0) return { level: 'Advanced', description: '高级' };
        if (ability >= 0.0) return { level: 'Intermediate', description: '中级' };
        if (ability >= -1.0) return { level: 'Elementary', description: '初级' };
        return { level: 'Beginner', description: '入门级' };
    }

    /**
     * 分析薄弱环节
     */
    analyzeWeakAreas(responses, questions) {
        const typePerformance = {};
        
        responses.forEach((response, index) => {
            const question = questions[index];
            const type = question.type;
            
            if (!typePerformance[type]) {
                typePerformance[type] = { correct: 0, total: 0 };
            }
            
            typePerformance[type].total++;
            if (response.isCorrect) {
                typePerformance[type].correct++;
            }
        });

        const weakAreas = [];
        Object.entries(typePerformance).forEach(([type, performance]) => {
            const accuracy = performance.correct / performance.total;
            if (accuracy < 0.6) { // 准确率低于60%视为薄弱环节
                weakAreas.push({
                    area: type,
                    accuracy: accuracy,
                    questionsCount: performance.total
                });
            }
        });

        return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
    }

    /**
     * 分析优势领域
     */
    analyzeStrengths(responses, questions) {
        const typePerformance = {};
        
        responses.forEach((response, index) => {
            const question = questions[index];
            const type = question.type;
            
            if (!typePerformance[type]) {
                typePerformance[type] = { correct: 0, total: 0 };
            }
            
            typePerformance[type].total++;
            if (response.isCorrect) {
                typePerformance[type].correct++;
            }
        });

        const strengths = [];
        Object.entries(typePerformance).forEach(([type, performance]) => {
            const accuracy = performance.correct / performance.total;
            if (accuracy >= 0.8) { // 准确率80%以上视为优势
                strengths.push({
                    area: type,
                    accuracy: accuracy,
                    questionsCount: performance.total
                });
            }
        });

        return strengths.sort((a, b) => b.accuracy - a.accuracy);
    }

    /**
     * 生成学习建议
     */
    generateRecommendations(ability, weakAreas) {
        const recommendations = [];

        // 基于能力水平的建议
        if (ability < -1.0) {
            recommendations.push({
                type: 'foundation',
                title: '加强基础',
                description: '建议从基础词汇和简单语法开始，循序渐进地提高',
                priority: 'high'
            });
        } else if (ability > 1.5) {
            recommendations.push({
                type: 'advanced',
                title: '挑战更高难度',
                description: '您的水平很高，可以尝试更复杂的阅读材料和高级语法',
                priority: 'medium'
            });
        }

        // 基于薄弱环节的建议
        weakAreas.forEach(area => {
            const areaRecommendations = this.getAreaSpecificRecommendations(area.area);
            recommendations.push(...areaRecommendations);
        });

        return recommendations;
    }

    /**
     * 获取特定领域的建议
     */
    getAreaSpecificRecommendations(area) {
        const areaRecommendations = {
            vocabulary: [
                {
                    type: 'vocabulary',
                    title: '词汇记忆策略',
                    description: '使用词根词缀记忆法，制作单词卡片，每天复习',
                    priority: 'high'
                }
            ],
            grammar: [
                {
                    type: 'grammar',
                    title: '语法专项练习',
                    description: '重点练习时态、语态和句型结构，多做语法填空题',
                    priority: 'high'
                }
            ],
            reading: [
                {
                    type: 'reading',
                    title: '阅读技巧提升',
                    description: '练习快速浏览和精读技巧，增加阅读量',
                    priority: 'medium'
                }
            ],
            listening: [
                {
                    type: 'listening',
                    title: '听力强化训练',
                    description: '每天听英语材料，从慢速开始逐步提高',
                    priority: 'medium'
                }
            ]
        };

        return areaRecommendations[area] || [];
    }

    /**
     * 显示题目
     */
    displayQuestion(question) {
        const container = this.getOrCreateTestContainer();
        
        container.innerHTML = `
            <div class="adaptive-test-interface">
                <div class="test-header">
                    <div class="test-progress">
                        <div class="progress-info">
                            <span>题目 ${this.currentTest.questions.length}</span>
                            <span class="ability-estimate">能力估计: ${this.currentTest.studentAbility.toFixed(2)}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(this.currentTest.questions.length / this.minQuestions * 100, 100)}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="question-container">
                    <div class="question-type">${this.getTypeLabel(question.type)}</div>
                    <div class="question-difficulty">难度: ${this.getDifficultyLabel(question.difficulty)}</div>
                    
                    ${question.passage ? `<div class="passage">${question.passage}</div>` : ''}
                    
                    <div class="question-text">${question.question}</div>
                    
                    <div class="options-container">
                        ${question.options.map((option, index) => `
                            <button class="option-btn" data-option="${index}">
                                <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                                <span class="option-text">${option}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="test-controls">
                    <button class="btn btn-outline-secondary" id="skipQuestion">跳过</button>
                    <button class="btn btn-primary" id="submitAnswer" disabled>提交答案</button>
                </div>
            </div>
        `;

        this.bindQuestionEvents(question);
    }

    /**
     * 绑定题目事件
     */
    bindQuestionEvents(question) {
        const optionBtns = document.querySelectorAll('.option-btn');
        const submitBtn = document.getElementById('submitAnswer');
        const skipBtn = document.getElementById('skipQuestion');
        
        let selectedOption = null;
        const startTime = Date.now();

        optionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // 清除之前的选择
                optionBtns.forEach(b => b.classList.remove('selected'));
                
                // 选择当前选项
                btn.classList.add('selected');
                selectedOption = index;
                submitBtn.disabled = false;
            });
        });

        submitBtn.addEventListener('click', () => {
            if (selectedOption !== null) {
                const responseTime = Date.now() - startTime;
                this.handleStudentResponse(question.id, selectedOption, responseTime);
            }
        });

        skipBtn.addEventListener('click', () => {
            const responseTime = Date.now() - startTime;
            this.handleStudentResponse(question.id, -1, responseTime); // -1 表示跳过
        });
    }

    /**
     * 显示测试结果
     */
    displayTestResults(report) {
        const container = this.getOrCreateTestContainer();
        
        container.innerHTML = `
            <div class="test-results">
                <div class="results-header">
                    <h2>🎯 自适应测试完成</h2>
                    <div class="completion-badge">
                        <span class="badge ${this.getAbilityBadgeClass(report.summary.abilityLevel.level)}">
                            ${report.summary.abilityLevel.description}
                        </span>
                    </div>
                </div>
                
                <div class="results-summary">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-value">${report.summary.totalQuestions}</div>
                            <div class="summary-label">题目总数</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${(report.summary.accuracy * 100).toFixed(1)}%</div>
                            <div class="summary-label">正确率</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${report.summary.abilityEstimate.toFixed(2)}</div>
                            <div class="summary-label">能力估计</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${Math.round(report.summary.duration / 1000)}s</div>
                            <div class="summary-label">用时</div>
                        </div>
                    </div>
                </div>
                
                <div class="results-details">
                    <div class="performance-analysis">
                        <h3>📊 表现分析</h3>
                        ${this.renderPerformanceChart(report.performance)}
                    </div>
                    
                    <div class="recommendations">
                        <h3>💡 学习建议</h3>
                        ${this.renderRecommendations(report.recommendations)}
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary" id="retakeTest">重新测试</button>
                    <button class="btn btn-outline-primary" id="viewDetailedResults">详细结果</button>
                    <button class="btn btn-outline-secondary" id="closeResults">关闭</button>
                </div>
            </div>
        `;

        this.bindResultEvents();
    }

    /**
     * 获取或创建测试容器
     */
    getOrCreateTestContainer() {
        let container = document.getElementById('adaptive-test-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'adaptive-test-container';
            container.className = 'adaptive-test-modal';
            
            // 添加样式
            this.addTestStyles();
            
            document.body.appendChild(container);
        }
        
        return container;
    }

    /**
     * 添加测试样式
     */
    addTestStyles() {
        if (document.getElementById('adaptive-test-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'adaptive-test-styles';
        styles.textContent = `
            .adaptive-test-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 2rem;
            }

            .adaptive-test-interface,
            .test-results {
                background: white;
                border-radius: 15px;
                padding: 2rem;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            }

            .test-header {
                margin-bottom: 2rem;
                border-bottom: 1px solid #e0e0e0;
                padding-bottom: 1rem;
            }

            .progress-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            .ability-estimate {
                color: #007bff;
                font-size: 0.9rem;
            }

            .progress-bar {
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3);
                transition: width 0.3s ease;
            }

            .question-container {
                margin-bottom: 2rem;
            }

            .question-type {
                display: inline-block;
                background: #e3f2fd;
                color: #1976d2;
                padding: 0.3rem 0.8rem;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
            }

            .question-difficulty {
                color: #6c757d;
                font-size: 0.9rem;
                margin-bottom: 1rem;
            }

            .passage {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                line-height: 1.6;
                font-style: italic;
            }

            .question-text {
                font-size: 1.1rem;
                font-weight: 500;
                margin-bottom: 1.5rem;
                color: #333;
            }

            .options-container {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }

            .option-btn {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }

            .option-btn:hover {
                border-color: #007bff;
                background: #e3f2fd;
            }

            .option-btn.selected {
                border-color: #007bff;
                background: #e3f2fd;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }

            .option-letter {
                width: 30px;
                height: 30px;
                background: #007bff;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 0.9rem;
                flex-shrink: 0;
            }

            .option-text {
                flex: 1;
                font-size: 1rem;
            }

            .test-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 1rem;
                border-top: 1px solid #e0e0e0;
            }

            .results-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .completion-badge {
                margin-top: 1rem;
            }

            .badge {
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-weight: bold;
                font-size: 1rem;
            }

            .badge.beginner { background: #ffc107; color: #333; }
            .badge.elementary { background: #28a745; color: white; }
            .badge.intermediate { background: #007bff; color: white; }
            .badge.advanced { background: #6f42c1; color: white; }
            .badge.expert { background: #dc3545; color: white; }

            .summary-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .summary-item {
                text-align: center;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 10px;
            }

            .summary-value {
                font-size: 2rem;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 0.5rem;
            }

            .summary-label {
                color: #6c757d;
                font-size: 0.9rem;
            }

            .results-details {
                margin-bottom: 2rem;
            }

            .performance-analysis,
            .recommendations {
                margin-bottom: 2rem;
            }

            .recommendation-item {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 10px;
                margin-bottom: 1rem;
                border-left: 4px solid #007bff;
            }

            .recommendation-title {
                font-weight: bold;
                margin-bottom: 0.5rem;
                color: #333;
            }

            .recommendation-description {
                color: #6c757d;
                line-height: 1.5;
            }

            .results-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }

            @media (max-width: 768px) {
                .adaptive-test-modal {
                    padding: 1rem;
                }
                
                .adaptive-test-interface,
                .test-results {
                    padding: 1rem;
                }
                
                .summary-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .results-actions {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * 渲染性能图表
     */
    renderPerformanceChart(performance) {
        let html = '<div class="performance-chart">';
        
        if (performance.weakAreas.length > 0) {
            html += '<h4>📉 需要改进的领域</h4>';
            performance.weakAreas.forEach(area => {
                html += `
                    <div class="performance-item weak">
                        <div class="performance-label">${this.getTypeLabel(area.area)}</div>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: ${area.accuracy * 100}%; background: #dc3545;"></div>
                        </div>
                        <div class="performance-value">${(area.accuracy * 100).toFixed(1)}%</div>
                    </div>
                `;
            });
        }
        
        if (performance.strengths.length > 0) {
            html += '<h4>📈 优势领域</h4>';
            performance.strengths.forEach(area => {
                html += `
                    <div class="performance-item strong">
                        <div class="performance-label">${this.getTypeLabel(area.area)}</div>
                        <div class="performance-bar">
                            <div class="performance-fill" style="width: ${area.accuracy * 100}%; background: #28a745;"></div>
                        </div>
                        <div class="performance-value">${(area.accuracy * 100).toFixed(1)}%</div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        return html;
    }

    /**
     * 渲染建议
     */
    renderRecommendations(recommendations) {
        return recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-description">${rec.description}</div>
            </div>
        `).join('');
    }

    /**
     * 辅助方法
     */
    getTypeLabel(type) {
        const labels = {
            vocabulary: '词汇',
            grammar: '语法',
            reading: '阅读',
            listening: '听力'
        };
        return labels[type] || type;
    }

    getDifficultyLabel(difficulty) {
        if (difficulty <= -1.0) return '简单';
        if (difficulty <= 0.5) return '中等';
        if (difficulty <= 1.5) return '困难';
        return '很困难';
    }

    getAbilityBadgeClass(level) {
        return level.toLowerCase();
    }

    getAllQuestions() {
        const allQuestions = [];
        Object.values(this.questionBank).forEach(questions => {
            allQuestions.push(...questions);
        });
        return allQuestions;
    }

    matchesTestType(question, testType) {
        if (testType === 'mixed') return true;
        return question.type === testType;
    }

    generateTestId() {
        // 基于时间戳和计数器生成唯一ID
        const timestamp = Date.now();
        const counter = (this.testCounter || 0) + 1;
        this.testCounter = counter;
        return `test_${timestamp}_${counter.toString(36)}`;
    }

    bindResultEvents() {
        const retakeBtn = document.getElementById('retakeTest');
        const detailsBtn = document.getElementById('viewDetailedResults');
        const closeBtn = document.getElementById('closeResults');

        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => {
                this.closeTestInterface();
                this.startAdaptiveTest({ type: 'mixed' });
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeTestInterface();
            });
        }
    }

    closeTestInterface() {
        const container = document.getElementById('adaptive-test-container');
        if (container) {
            container.remove();
        }
    }

    calculatePerformanceByType(responses, questions) {
        const performance = {};
        
        responses.forEach((response, index) => {
            const question = questions[index];
            const type = question.type;
            
            if (!performance[type]) {
                performance[type] = { correct: 0, total: 0, accuracy: 0 };
            }
            
            performance[type].total++;
            if (response.isCorrect) {
                performance[type].correct++;
            }
        });

        // 计算准确率
        Object.keys(performance).forEach(type => {
            const perf = performance[type];
            perf.accuracy = perf.total > 0 ? perf.correct / perf.total : 0;
        });

        return performance;
    }

    generateDetailedResults(responses, questions) {
        return responses.map((response, index) => ({
            question: questions[index],
            response: response,
            isCorrect: response.isCorrect,
            timeSpent: response.responseTime
        }));
    }

    saveTestHistory() {
        try {
            localStorage.setItem('adaptive_test_history', JSON.stringify(this.testHistory));
        } catch (error) {
            console.error('❌ 保存测试历史失败:', error);
        }
    }

    loadStudentHistory() {
        try {
            const history = localStorage.getItem('adaptive_test_history');
            if (history) {
                this.testHistory = JSON.parse(history);
                
                // 更新学生能力基于历史记录
                if (this.testHistory.length > 0) {
                    const lastTest = this.testHistory[this.testHistory.length - 1];
                    this.studentAbility = lastTest.studentAbility || 0;
                }
            }
        } catch (error) {
            console.error('❌ 加载测试历史失败:', error);
        }
    }

    /**
     * 获取学生能力趋势
     */
    getAbilityTrend() {
        return this.testHistory.map(test => ({
            date: new Date(test.startTime),
            ability: test.studentAbility,
            accuracy: test.report?.summary.accuracy || 0
        }));
    }

    /**
     * 销毁自适应测试系统
     */
    destroy() {
        this.closeTestInterface();
        console.log('🧠 自适应测试系统已销毁');
    }
}

// 创建全局实例
window.AdaptiveTestingSystem = new AdaptiveTestingSystem();
