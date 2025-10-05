/**
 * 阅读理解管理器
 * 负责处理阅读理解的所有功能
 */
class ReadingManager {
    constructor() {
        this.currentArticle = null;
        this.currentQuestions = [];
        this.userAnswers = [];
        this.readingSession = null;
        this.readingTimer = null;
        this.startTime = null;
        this.currentQuestionIndex = 0;
        
        // 配置选项
        this.config = {
            articleType: 'news',
            difficulty: 'medium',
            examType: 'cet4',
            goal: 'comprehension'
        };
        
        // 用户阅读数据
        this.readingProgress = {
            totalArticles: 0,
            totalReadingTime: 0,
            averageAccuracy: 0,
            readingSpeed: 0, // 词/分钟
            recentArticles: [],
            typeStats: {
                news: { completed: 0, accuracy: 0, totalTime: 0, errors: [], mastered: [] },
                academic: { completed: 0, accuracy: 0, totalTime: 0, errors: [], mastered: [] },
                story: { completed: 0, accuracy: 0, totalTime: 0, errors: [], mastered: [] },
                biography: { completed: 0, accuracy: 0, totalTime: 0, errors: [], mastered: [] },
                science: { completed: 0, accuracy: 0, totalTime: 0, errors: [], mastered: [] },
                travel: { completed: 0, accuracy: 0, totalTime: 0, errors: [], mastered: [] }
            },
            skillStats: {
                main_idea: { correct: 0, total: 0, accuracy: 0 },
                detail: { correct: 0, total: 0, accuracy: 0 },
                inference: { correct: 0, total: 0, accuracy: 0 },
                vocabulary: { correct: 0, total: 0, accuracy: 0 },
                attitude: { correct: 0, total: 0, accuracy: 0 }
            }
        };

        // 自适应系统
        this.adaptiveSystem = {
            enabled: true,
            performanceHistory: [],
            difficultyAdjustmentThreshold: 3,
            accuracyThresholds: {
                increase: 80, // 准确率超过80%提升难度
                decrease: 55  // 准确率低于55%降低难度
            },
            difficultyLevels: ['easy', 'medium', 'hard'],
            currentLevel: 'medium',
            readingSpeedThresholds: {
                slow: 150,    // 词/分钟
                normal: 200,  // 词/分钟
                fast: 250     // 词/分钟
            }
        };
        
        this.init();
    }

    /**
     * 初始化阅读管理器
     */
    async init() {
        window.logger?.info('初始化阅读理解管理器...');
        
        try {
            await this.loadReadingProgress();
            this.initializeArticleDatabase();
            this.initializeAdaptiveSystem();
            
            window.logger?.info('阅读理解管理器初始化完成');
        } catch (error) {
            window.logger?.error('阅读理解管理器初始化失败:', error);
        }
    }

    /**
     * 初始化自适应系统
     */
    initializeAdaptiveSystem() {
        // 从用户进度中恢复自适应设置
        if (this.readingProgress.adaptiveLevel) {
            this.adaptiveSystem.currentLevel = this.readingProgress.adaptiveLevel;
        }
        
        // 根据历史表现调整当前难度
        const recentPerformance = this.getRecentPerformance();
        if (recentPerformance.length > 0) {
            const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length;
            this.adjustDifficultyBasedOnPerformance(avgAccuracy);
        }
        
        window.logger?.info('自适应阅读系统已初始化，当前难度:', this.adaptiveSystem.currentLevel);
    }

    /**
     * 获取近期表现
     */
    getRecentPerformance() {
        return this.adaptiveSystem.performanceHistory.slice(-this.adaptiveSystem.difficultyAdjustmentThreshold);
    }

    /**
     * 基于表现调整难度
     */
    adjustDifficultyBasedOnPerformance(avgAccuracy) {
        const currentIndex = this.adaptiveSystem.difficultyLevels.indexOf(this.adaptiveSystem.currentLevel);
        
        if (avgAccuracy >= this.adaptiveSystem.accuracyThresholds.increase) {
            // 表现优秀，提升难度
            if (currentIndex < this.adaptiveSystem.difficultyLevels.length - 1) {
                this.adaptiveSystem.currentLevel = this.adaptiveSystem.difficultyLevels[currentIndex + 1];
                window.logger?.info(`阅读难度自动提升至: ${this.adaptiveSystem.currentLevel}`);
            }
        } else if (avgAccuracy < this.adaptiveSystem.accuracyThresholds.decrease) {
            // 表现较差，降低难度
            if (currentIndex > 0) {
                this.adaptiveSystem.currentLevel = this.adaptiveSystem.difficultyLevels[currentIndex - 1];
                window.logger?.info(`阅读难度自动降低至: ${this.adaptiveSystem.currentLevel}`);
            }
        }
    }

    /**
     * 获取推荐难度
     */
    getRecommendedDifficulty() {
        if (!this.adaptiveSystem.enabled) {
            return this.config.difficulty;
        }
        
        return this.adaptiveSystem.currentLevel;
    }

    /**
     * 智能文章选择
     */
    selectArticleIntelligently(type, difficulty, count = 1) {
        const articles = this.articleDatabase[type]?.[difficulty] || [];
        if (articles.length === 0) return [];

        // 获取用户在该类型的错误和掌握记录
        const typeStats = this.readingProgress.typeStats[type] || { errors: [], mastered: [] };
        const errorArticles = typeStats.errors || [];
        const masteredArticles = typeStats.mastered || [];

        // 分类文章
        const reviewArticles = []; // 需要复习的错误文章
        const newArticles = []; // 新文章
        const masteredArticlesFiltered = []; // 已掌握的文章

        articles.forEach(article => {
            if (errorArticles.includes(article.id)) {
                reviewArticles.push(article);
            } else if (masteredArticles.includes(article.id)) {
                masteredArticlesFiltered.push(article);
            } else {
                newArticles.push(article);
            }
        });

        // 智能分配：40%复习错误文章，50%新文章，10%已掌握文章（巩固）
        const reviewCount = Math.min(Math.floor(count * 0.4), reviewArticles.length);
        const newCount = Math.min(Math.floor(count * 0.5), newArticles.length);
        const masteredCount = count - reviewCount - newCount;

        const selectedArticles = [
            ...this.shuffleArray(reviewArticles).slice(0, reviewCount),
            ...this.shuffleArray(newArticles).slice(0, newCount),
            ...this.shuffleArray(masteredArticlesFiltered).slice(0, masteredCount)
        ];

        // 如果文章不够，从剩余文章中补充
        if (selectedArticles.length < count) {
            const remaining = articles.filter(a => !selectedArticles.includes(a));
            selectedArticles.push(...this.shuffleArray(remaining).slice(0, count - selectedArticles.length));
        }

        return this.shuffleArray(selectedArticles);
    }

    /**
     * 数组洗牌算法
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 初始化文章数据库
     */
    initializeArticleDatabase() {
        this.articleDatabase = {
            news: {
                easy: [
                    {
                        id: 'news_easy_001',
                        title: 'Local School Wins Science Fair',
                        content: `A local high school has won first place in the regional science fair this year. The students from Lincoln High School presented their project about renewable energy sources. Their solar-powered water purification system impressed the judges.

The winning team consisted of five students who worked together for six months. They built a device that uses solar energy to clean dirty water. This invention could help communities that don't have access to clean drinking water.

"We wanted to solve a real problem," said team captain Sarah Johnson. "Clean water is essential for everyone." The school will receive $5,000 to support future science projects.

The students plan to continue improving their invention. They hope to make it smaller and more efficient. Next year, they want to test it in a real community that needs clean water.`,
                        wordCount: 142,
                        difficulty: 'easy',
                        type: 'news',
                        questions: [
                            {
                                id: 1,
                                type: 'multiple_choice',
                                question: 'What did Lincoln High School win?',
                                options: [
                                    'A regional science fair',
                                    'A math competition',
                                    'A sports tournament',
                                    'An art contest'
                                ],
                                correct: 0,
                                skill: 'main_idea'
                            },
                            {
                                id: 2,
                                type: 'multiple_choice',
                                question: 'How many students were in the winning team?',
                                options: ['Three', 'Four', 'Five', 'Six'],
                                correct: 2,
                                skill: 'detail'
                            },
                            {
                                id: 3,
                                type: 'multiple_choice',
                                question: 'What does their invention do?',
                                options: [
                                    'Generates electricity',
                                    'Purifies water using solar power',
                                    'Grows plants faster',
                                    'Reduces air pollution'
                                ],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 4,
                                type: 'multiple_choice',
                                question: 'How long did the team work on their project?',
                                options: ['Three months', 'Four months', 'Five months', 'Six months'],
                                correct: 3,
                                skill: 'detail'
                            },
                            {
                                id: 5,
                                type: 'multiple_choice',
                                question: 'What do the students plan to do next?',
                                options: [
                                    'Stop working on the project',
                                    'Sell their invention',
                                    'Improve the invention and test it',
                                    'Start a new project'
                                ],
                                correct: 2,
                                skill: 'inference'
                            }
                        ]
                    }
                ],
                medium: [
                    {
                        id: 'news_medium_001',
                        title: 'Climate Change Affects Global Food Production',
                        content: `Recent studies show that climate change is significantly impacting global food production. Rising temperatures and changing precipitation patterns are affecting crop yields worldwide. Agricultural experts warn that these changes could lead to food shortages in vulnerable regions.

The research, conducted by the International Agricultural Research Institute, analyzed data from over 50 countries spanning two decades. The findings reveal that wheat production has decreased by 6% globally, while rice yields have fallen by 3.2%. However, some regions have seen improvements due to longer growing seasons and increased carbon dioxide levels.

Dr. Maria Rodriguez, lead researcher on the project, explains: "While some areas benefit from warmer temperatures, the overall trend is concerning. Extreme weather events like droughts and floods are becoming more frequent and severe, disrupting traditional farming practices."

The study also highlights the importance of developing climate-resilient crops and sustainable farming methods. Farmers are being encouraged to adopt new technologies and practices that can help them adapt to changing conditions.

Investment in agricultural research and development has become crucial for ensuring future food security. Governments and international organizations are increasing funding for projects aimed at developing drought-resistant crops and improving irrigation systems.`,
                        wordCount: 198,
                        difficulty: 'medium',
                        type: 'news',
                        questions: [
                            {
                                id: 1,
                                type: 'multiple_choice',
                                question: 'What is the main topic of the article?',
                                options: [
                                    'New farming technologies',
                                    'Climate change impact on food production',
                                    'Government funding for agriculture',
                                    'International trade agreements'
                                ],
                                correct: 1,
                                skill: 'main_idea'
                            },
                            {
                                id: 2,
                                type: 'multiple_choice',
                                question: 'According to the study, wheat production has decreased by:',
                                options: ['3.2%', '6%', '50%', '20%'],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 3,
                                type: 'multiple_choice',
                                question: 'Who conducted the research mentioned in the article?',
                                options: [
                                    'Dr. Maria Rodriguez alone',
                                    'The International Agricultural Research Institute',
                                    'Government organizations',
                                    'Local farmers'
                                ],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 4,
                                type: 'multiple_choice',
                                question: 'What can be inferred from the article about future farming?',
                                options: [
                                    'Traditional methods will remain unchanged',
                                    'All regions will experience decreased yields',
                                    'Adaptation and new technologies are necessary',
                                    'Climate change will stop affecting agriculture'
                                ],
                                correct: 2,
                                skill: 'inference'
                            },
                            {
                                id: 5,
                                type: 'multiple_choice',
                                question: 'According to Dr. Rodriguez, what makes the situation concerning?',
                                options: [
                                    'Lack of government funding',
                                    'Extreme weather events becoming more frequent',
                                    'Farmers refusing to adapt',
                                    'International conflicts over food'
                                ],
                                correct: 1,
                                skill: 'detail'
                            }
                        ]
                    }
                ]
            },
            academic: {
                medium: [
                    {
                        id: 'academic_medium_001',
                        title: 'The Role of Sleep in Memory Consolidation',
                        content: `Sleep plays a crucial role in memory consolidation, the process by which temporary memories are transformed into long-term storage. During sleep, the brain undergoes various physiological changes that facilitate this transformation, making sleep essential for effective learning and retention.

Research has identified two main stages of sleep that are particularly important for memory: slow-wave sleep (SWS) and rapid eye movement (REM) sleep. During SWS, which occurs in the deeper stages of non-REM sleep, the brain replays and strengthens neural connections formed during waking hours. This process helps consolidate declarative memories, such as facts and events.

REM sleep, characterized by vivid dreaming, appears to be crucial for procedural memory consolidation. This includes motor skills, habits, and emotional memories. Studies have shown that individuals who are deprived of REM sleep often struggle with learning new motor tasks and retaining emotional experiences.

The hippocampus, a brain region critical for memory formation, exhibits increased activity during both SWS and REM sleep. Neural pathways between the hippocampus and neocortex are strengthened, allowing for the integration of new information with existing knowledge structures.

Modern sleep research suggests that the optimal amount of sleep for memory consolidation varies among individuals but typically ranges from 7 to 9 hours per night for adults. Sleep quality, not just quantity, is equally important for effective memory processing.`,
                        wordCount: 234,
                        difficulty: 'medium',
                        type: 'academic',
                        questions: [
                            {
                                id: 1,
                                type: 'multiple_choice',
                                question: 'What is memory consolidation?',
                                options: [
                                    'The process of forgetting unnecessary information',
                                    'The transformation of temporary memories into long-term storage',
                                    'The ability to recall dreams',
                                    'The physical growth of brain tissue'
                                ],
                                correct: 1,
                                skill: 'main_idea'
                            },
                            {
                                id: 2,
                                type: 'multiple_choice',
                                question: 'Which type of sleep is important for declarative memories?',
                                options: ['REM sleep', 'Light sleep', 'Slow-wave sleep', 'Dream sleep'],
                                correct: 2,
                                skill: 'detail'
                            },
                            {
                                id: 3,
                                type: 'multiple_choice',
                                question: 'What happens to people deprived of REM sleep?',
                                options: [
                                    'They sleep longer the next night',
                                    'They struggle with learning motor tasks',
                                    'They have better declarative memory',
                                    'They require less sleep overall'
                                ],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 4,
                                type: 'multiple_choice',
                                question: 'According to the article, what is equally important as sleep quantity?',
                                options: ['Sleep timing', 'Sleep quality', 'Sleep position', 'Sleep environment'],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 5,
                                type: 'multiple_choice',
                                question: 'What can be inferred about the hippocampus from the article?',
                                options: [
                                    'It only works during waking hours',
                                    'It is not important for memory',
                                    'It is active during both main sleep stages',
                                    'It controls sleep patterns'
                                ],
                                correct: 2,
                                skill: 'inference'
                            }
                        ]
                    }
                ]
            },
            science: {
                easy: [
                    {
                        id: 'science_easy_001',
                        title: 'How Plants Make Food',
                        content: `Plants are amazing living things that can make their own food. This process is called photosynthesis. Unlike animals, plants don't need to hunt or search for food because they can create it themselves using simple materials from their environment.

To make food, plants need three basic things: sunlight, water, and carbon dioxide from the air. The leaves of plants contain a green substance called chlorophyll, which captures energy from sunlight. This energy is used to combine water and carbon dioxide to create sugar, which is the plant's food.

During photosynthesis, plants also produce oxygen as a waste product. This oxygen is released into the air through tiny holes in the leaves called stomata. The oxygen that plants produce is essential for animals and humans to breathe.

Plants usually make food during the day when there is sunlight. At night, when there's no sun, plants rest and use the food they made during the day for energy to grow and stay alive.

This process of photosynthesis is very important for life on Earth. Without plants making oxygen, animals and humans wouldn't be able to survive. Plants are like nature's food factories that keep our planet healthy.`,
                        wordCount: 195,
                        difficulty: 'easy',
                        type: 'science',
                        questions: [
                            {
                                id: 1,
                                type: 'multiple_choice',
                                question: 'What is photosynthesis?',
                                options: [
                                    'How plants sleep',
                                    'How plants make food',
                                    'How plants grow tall',
                                    'How plants change colors'
                                ],
                                correct: 1,
                                skill: 'main_idea'
                            },
                            {
                                id: 2,
                                type: 'multiple_choice',
                                question: 'What three things do plants need to make food?',
                                options: [
                                    'Soil, water, and air',
                                    'Sunlight, soil, and oxygen',
                                    'Sunlight, water, and carbon dioxide',
                                    'Water, oxygen, and sugar'
                                ],
                                correct: 2,
                                skill: 'detail'
                            },
                            {
                                id: 3,
                                type: 'multiple_choice',
                                question: 'What gives plants their green color?',
                                options: ['Oxygen', 'Chlorophyll', 'Water', 'Carbon dioxide'],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 4,
                                type: 'multiple_choice',
                                question: 'When do plants usually make food?',
                                options: ['At night', 'During the day', 'In the morning only', 'All the time'],
                                correct: 1,
                                skill: 'detail'
                            },
                            {
                                id: 5,
                                type: 'multiple_choice',
                                question: 'Why is photosynthesis important for animals and humans?',
                                options: [
                                    'It provides food for them',
                                    'It produces oxygen they need to breathe',
                                    'It makes water clean',
                                    'It creates soil'
                                ],
                                correct: 1,
                                skill: 'inference'
                            }
                        ]
                    }
                ]
            }
        };
        
        console.log('📖 文章数据库已初始化');
    }

    /**
     * 根据配置获取文章
     */
    getArticlesByConfig(type, difficulty) {
        const articles = this.articleDatabase[type]?.[difficulty];
        return articles || [];
    }

    /**
     * 随机选择一篇文章
     */
    selectRandomArticle() {
        const articles = this.getArticlesByConfig(this.config.articleType, this.config.difficulty);
        
        if (articles.length === 0) {
            // 如果没有找到对应文章，使用默认文章
            console.warn('未找到对应类型文章，使用默认文章');
            return this.articleDatabase.news.easy[0];
        }
        
        const randomIndex = Math.floor(Math.random() * articles.length);
        return articles[randomIndex];
    }

    /**
     * 开始阅读练习（增强版）
     */
    startReadingPractice() {
        window.logger?.info('开始阅读练习');
        window.logger?.info('配置:', this.config);
        
        // 使用智能选择文章
        const recommendedDifficulty = this.getRecommendedDifficulty();
        const selectedArticles = this.selectArticleIntelligently(
            this.config.articleType, 
            recommendedDifficulty, 
            1
        );
        
        if (selectedArticles.length === 0) {
            // 降级到随机选择
            this.currentArticle = this.selectRandomArticle();
        } else {
            this.currentArticle = selectedArticles[0];
        }
        
        // 为文章添加增强功能
        this.currentArticle = {
            ...this.currentArticle,
            startTime: Date.now(),
            readingStartTime: null,
            questionsStartTime: null,
            wordCount: this.currentArticle.wordCount || this.calculateWordCount(this.currentArticle.content),
            estimatedReadingTime: this.calculateEstimatedReadingTime(this.currentArticle.wordCount),
            actualReadingTime: 0,
            readingSpeed: 0,
            comprehensionScore: 0
        };
        
        this.currentQuestions = this.currentArticle.questions.map((q, index) => ({
            ...q,
            questionIndex: index + 1,
            totalQuestions: this.currentArticle.questions.length,
            startTime: null,
            endTime: null,
            timeSpent: 0,
            attempts: 0,
            isCorrect: null,
            userAnswer: null
        }));
        
        this.userAnswers = new Array(this.currentQuestions.length).fill(null);
        this.currentQuestionIndex = 0;
        
        // 创建增强的阅读会话
        this.readingSession = {
            id: `reading_${Date.now()}`,
            article: this.currentArticle,
            questions: this.currentQuestions,
            startTime: Date.now(),
            readingStartTime: null,
            questionsStartTime: null,
            endTime: null,
            readingTime: 0,
            questionTime: 0,
            totalTime: 0,
            answers: this.userAnswers,
            difficulty: recommendedDifficulty,
            articleType: this.config.articleType,
            score: 0,
            accuracy: 0,
            analysis: {
                strengths: [],
                weaknesses: [],
                recommendations: []
            }
        };
        
        window.logger?.info(`选择文章: ${this.currentArticle.title} (${recommendedDifficulty})`);
        window.logger?.info(`预估阅读时间: ${this.currentArticle.estimatedReadingTime}分钟`);
        
        return this.currentArticle;
    }

    /**
     * 计算单词数
     */
    calculateWordCount(content) {
        if (!content) return 0;
        return content.trim().split(/\s+/).length;
    }

    /**
     * 计算预估阅读时间（分钟）
     */
    calculateEstimatedReadingTime(wordCount) {
        const averageReadingSpeed = 200; // 词/分钟
        return Math.ceil(wordCount / averageReadingSpeed);
    }

    /**
     * 开始计时
     */
    startTimer() {
        this.startTime = Date.now();
        this.readingSession.readingStartTime = this.startTime;
        
        this.readingTimer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timerElement = document.getElementById('readingTimer');
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    /**
     * 停止计时
     */
    stopTimer() {
        if (this.readingTimer) {
            clearInterval(this.readingTimer);
            this.readingTimer = null;
        }
    }

    /**
     * 记录阅读完成，开始答题
     */
    startQuestions() {
        if (this.readingSession) {
            this.readingSession.questionsStartTime = Date.now();
            this.readingSession.readingTime = this.readingSession.questionsStartTime - this.readingSession.readingStartTime;
        }
        console.log('📝 开始答题阶段');
    }

    /**
     * 记录用户答案（增强版）
     */
    recordAnswer(questionIndex, answerIndex) {
        if (questionIndex < 0 || questionIndex >= this.currentQuestions.length) {
            window.logger?.error('无效的题目索引:', questionIndex);
            return false;
        }

        const question = this.currentQuestions[questionIndex];
        const previousAnswer = this.userAnswers[questionIndex];
        
        // 记录答题时间
        if (!question.startTime) {
            question.startTime = Date.now();
        }
        
        if (previousAnswer !== null) {
            question.attempts++;
        } else {
            question.attempts = 1;
        }

        // 记录答案
        this.userAnswers[questionIndex] = answerIndex;
        question.userAnswer = answerIndex;
        question.endTime = Date.now();
        question.timeSpent = question.endTime - question.startTime;
        question.isCorrect = answerIndex === question.correct;

        // 生成即时反馈
        const feedback = this.generateQuestionFeedback(question, questionIndex);

        window.logger?.info(`记录答案 - 题目 ${questionIndex + 1}: ${answerIndex} (${question.isCorrect ? '正确' : '错误'})`);

        return {
            isCorrect: question.isCorrect,
            feedback: feedback,
            timeSpent: question.timeSpent,
            attempts: question.attempts
        };
    }

    /**
     * 生成问题反馈
     */
    generateQuestionFeedback(question, questionIndex) {
        const feedback = {
            questionIndex: questionIndex + 1,
            isCorrect: question.isCorrect,
            correctAnswer: question.correct,
            userAnswer: question.userAnswer,
            skill: question.skill,
            timeSpent: question.timeSpent,
            attempts: question.attempts
        };

        // 根据技能类型生成解释
        feedback.explanation = this.generateSkillExplanation(question);
        
        // 生成学习建议
        feedback.suggestion = this.generateQuestionSuggestion(question);

        // 生成鼓励或改进建议
        if (question.isCorrect) {
            feedback.encouragement = this.generateEncouragement(question);
        } else {
            feedback.improvement = this.generateImprovementTip(question);
        }

        return feedback;
    }

    /**
     * 生成技能解释
     */
    generateSkillExplanation(question) {
        const explanations = {
            'main_idea': '这是一道主旨理解题。需要把握文章的中心思想和主要观点。',
            'detail': '这是一道细节理解题。需要仔细阅读文章，找出具体的事实信息。',
            'inference': '这是一道推理判断题。需要根据文章内容进行逻辑推理和分析。',
            'vocabulary': '这是一道词汇理解题。需要理解词汇在特定语境中的含义。',
            'attitude': '这是一道态度理解题。需要分析作者的观点、态度或情感倾向。'
        };

        return explanations[question.skill] || '请仔细阅读文章内容，理解题目要求。';
    }

    /**
     * 生成问题建议
     */
    generateQuestionSuggestion(question) {
        const suggestions = {
            'main_idea': [
                '注意文章的开头和结尾段落，通常包含主要观点',
                '寻找重复出现的关键词和概念',
                '关注段落的主题句，通常在段首或段尾'
            ],
            'detail': [
                '仔细阅读题目，明确需要查找的信息类型',
                '使用关键词定位法，在文章中快速找到相关段落',
                '注意数字、时间、地点等具体信息'
            ],
            'inference': [
                '结合文章上下文进行逻辑推理',
                '注意作者的暗示和言外之意',
                '避免过度推理，答案应基于文章内容'
            ],
            'vocabulary': [
                '结合上下文理解词汇含义',
                '注意词汇的搭配和用法',
                '考虑词汇在特定语境中的特殊含义'
            ],
            'attitude': [
                '注意作者使用的形容词和副词',
                '分析句子的语气和语调',
                '关注表达观点的关键句子'
            ]
        };

        const skillSuggestions = suggestions[question.skill] || ['仔细阅读文章，理解题目要求'];
        return skillSuggestions[Math.floor(Math.random() * skillSuggestions.length)];
    }

    /**
     * 生成鼓励语句
     */
    generateEncouragement(question) {
        const encouragements = [
            '回答正确！你很好地掌握了这个阅读技巧。',
            '很棒！继续保持这样的阅读理解水平。',
            '正确答案！你的阅读分析能力很强。',
            '优秀！你成功理解了文章的关键信息。'
        ];

        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }

    /**
     * 生成改进建议
     */
    generateImprovementTip(question) {
        const tips = [
            '再次仔细阅读相关段落，注意关键信息',
            '尝试理解文章的逻辑结构和论证方式',
            '练习快速定位关键信息的技巧',
            '加强对文章主旨和细节的理解能力'
        ];

        return tips[Math.floor(Math.random() * tips.length)];
    }

    /**
     * 完成阅读练习（增强版）
     */
    finishReading() {
        this.stopTimer();
        
        if (this.readingSession) {
            this.readingSession.endTime = Date.now();
            this.readingSession.questionTime = this.readingSession.endTime - this.readingSession.questionsStartTime;
            this.readingSession.totalTime = this.readingSession.endTime - this.readingSession.startTime;
        }
        
        // 计算详细结果和分析
        const result = this.calculateEnhancedResults();
        
        // 记录学习会话到应用级别
        if (window.app && window.app.recordStudySession && this.readingSession) {
            window.app.recordStudySession('reading', this.readingSession.totalTime / 1000, result.accuracy);
        }
        
        // 更新进度
        this.updateReadingProgress(result);
        
        // 更新自适应系统
        this.updateAdaptiveSystem(result);
        
        // 保存结果
        this.saveReadingResult(result);
        
        // 记录阅读活动
        this.recordReadingActivity(result);
        
        // 记录到学习动态管理器
        if (window.learningActivityManager) {
            window.learningActivityManager.recordReadingActivity(1, result.accuracy);
        }
        
        window.logger?.info('阅读练习完成', {
            accuracy: result.accuracy,
            readingSpeed: result.readingSpeed,
            totalTime: Math.round(result.totalTime / 1000)
        });
        
        return result;
    }

    /**
     * 计算阅读结果
     */
    calculateResults() {
        const totalQuestions = this.currentQuestions.length;
        let correctCount = 0;
        const results = [];
        
        // 检查每个答案
        this.currentQuestions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                correctCount++;
            }
            
            results.push({
                questionIndex: index,
                question: question,
                userAnswer: userAnswer,
                correctAnswer: question.correct,
                isCorrect: isCorrect
            });
        });
        
        const accuracy = Math.round((correctCount / totalQuestions) * 100);
        const readingSpeed = Math.round((this.currentArticle.wordCount / this.readingSession.readingTime) * 60000); // 词/分钟
        
        return {
            article: this.currentArticle,
            session: this.readingSession,
            results: results,
            totalQuestions: totalQuestions,
            correctCount: correctCount,
            accuracy: accuracy,
            readingSpeed: readingSpeed,
            readingTime: this.readingSession.readingTime,
            questionTime: this.readingSession.questionTime,
            totalTime: this.readingSession.totalTime
        };
    }

    /**
     * 更新阅读进度
     */
    updateReadingProgress(result) {
        this.readingProgress.totalArticles++;
        this.readingProgress.totalReadingTime += Math.round(result.totalTime / 1000 / 60); // 转换为分钟
        
        // 更新平均正确率
        const oldTotal = this.readingProgress.totalArticles - 1;
        const oldSum = this.readingProgress.averageAccuracy * oldTotal;
        this.readingProgress.averageAccuracy = Math.round((oldSum + result.accuracy) / this.readingProgress.totalArticles);
        
        // 更新阅读速度
        const oldSpeedSum = this.readingProgress.readingSpeed * oldTotal;
        this.readingProgress.readingSpeed = Math.round((oldSpeedSum + result.readingSpeed) / this.readingProgress.totalArticles);
        
        // 更新类型统计
        const typeStats = this.readingProgress.typeStats[this.currentArticle.type];
        typeStats.completed++;
        const typeOldSum = typeStats.accuracy * (typeStats.completed - 1);
        typeStats.accuracy = Math.round((typeOldSum + result.accuracy) / typeStats.completed);
        
        // 添加到最近阅读
        this.readingProgress.recentArticles.unshift({
            title: this.currentArticle.title,
            type: this.currentArticle.type,
            difficulty: this.currentArticle.difficulty,
            accuracy: result.accuracy,
            readingSpeed: result.readingSpeed,
            date: new Date().toISOString()
        });
        
        // 只保留最近20篇
        if (this.readingProgress.recentArticles.length > 20) {
            this.readingProgress.recentArticles = this.readingProgress.recentArticles.slice(0, 20);
        }
        
        this.saveReadingProgress();
    }

    /**
     * 保存阅读结果
     */
    saveReadingResult(result) {
        try {
            const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]');
            
            const historyItem = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                article: {
                    title: result.article.title,
                    type: result.article.type,
                    difficulty: result.article.difficulty,
                    wordCount: result.article.wordCount
                },
                accuracy: result.accuracy,
                readingSpeed: result.readingSpeed,
                totalTime: result.totalTime,
                config: { ...this.config }
            };
            
            readingHistory.unshift(historyItem);
            
            // 只保留最近50次记录
            if (readingHistory.length > 50) {
                readingHistory.splice(50);
            }
            
            localStorage.setItem('readingHistory', JSON.stringify(readingHistory));
            console.log('💾 阅读结果已保存');
            
        } catch (error) {
            console.error('保存阅读结果失败:', error);
        }
    }

    /**
     * 加载阅读进度
     */
    loadReadingProgress() {
        try {
            const saved = localStorage.getItem('readingProgress');
            if (saved) {
                this.readingProgress = { ...this.readingProgress, ...JSON.parse(saved) };
                console.log('📈 阅读进度已加载');
            }
        } catch (error) {
            console.error('加载阅读进度失败:', error);
        }
    }

    /**
     * 保存阅读进度
     */
    saveReadingProgress() {
        try {
            localStorage.setItem('readingProgress', JSON.stringify(this.readingProgress));
            console.log('💾 阅读进度已保存');
        } catch (error) {
            console.error('保存阅读进度失败:', error);
        }
    }

    /**
     * 获取阅读统计
     */
    getReadingStats() {
        return {
            totalArticles: this.readingProgress.totalArticles,
            averageAccuracy: this.readingProgress.averageAccuracy,
            readingSpeed: this.readingProgress.readingSpeed,
            totalReadingTime: this.readingProgress.totalReadingTime,
            recentArticles: this.readingProgress.recentArticles.slice(0, 5),
            typeStats: this.readingProgress.typeStats
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📝 阅读配置已更新:', this.config);
    }

    /**
     * 获取当前题目
     */
    getCurrentQuestion() {
        return this.currentQuestions[this.currentQuestionIndex];
    }

    /**
     * 下一题
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    /**
     * 上一题
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }

    /**
     * 重置当前会话
     */
    resetCurrentSession() {
        this.currentArticle = null;
        this.currentQuestions = [];
        this.userAnswers = [];
        this.readingSession = null;
        this.currentQuestionIndex = 0;
        this.stopTimer();
    }

    /**
     * 获取阅读练习统计信息
     */
    getStats() {
        const progress = this.readingProgress || {};
        
        return {
            accuracy: progress.averageAccuracy || 0,
            totalArticles: progress.totalArticles || 0,
            averageTime: Math.round((progress.totalReadingTime || 0) / Math.max(progress.totalArticles || 1, 1)), // 平均阅读时间（分钟）
            readingSpeed: progress.readingSpeed || 0,
            totalTime: Math.round((progress.totalReadingTime || 0) / 60), // 总时长（分钟）
            completionRate: progress.totalArticles > 0 ? 100 : 0,
            streakDays: this.calculateReadingStreak()
        };
    }

    /**
     * 计算阅读连击天数
     */
    calculateReadingStreak() {
        const recentArticles = this.readingProgress.recentArticles || [];
        if (recentArticles.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) { // 检查最近30天
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toDateString();
            
            const hasReading = recentArticles.some(a => 
                new Date(a.timestamp).toDateString() === dateStr
            );
            
            if (hasReading) {
                streak++;
            } else if (i > 0) { // 如果不是今天且没有阅读记录，则中断连击
                break;
            }
        }
        
        return streak;
    }

    /**
     * 重置阅读进度数据
     */
    resetProgress() {
        this.readingProgress = {
            totalArticles: 0,
            totalReadingTime: 0,
            averageAccuracy: 0,
            readingSpeed: 0,
            recentArticles: [],
            typeStats: {
                news: { completed: 0, averageAccuracy: 0, totalTime: 0 },
                academic: { completed: 0, averageAccuracy: 0, totalTime: 0 },
                story: { completed: 0, averageAccuracy: 0, totalTime: 0 },
                biography: { completed: 0, averageAccuracy: 0, totalTime: 0 },
                science: { completed: 0, averageAccuracy: 0, totalTime: 0 },
                travel: { completed: 0, averageAccuracy: 0, totalTime: 0 }
            }
        };
        
        localStorage.removeItem('readingProgress');
        window.logger?.info('阅读练习进度已重置');
        return true;
    }

    /**
     * 计算增强结果
     */
    calculateEnhancedResults() {
        const totalQuestions = this.currentQuestions.length;
        let correctCount = 0;
        const results = [];
        const skillStats = {};
        
        // 分析每个答案
        this.currentQuestions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                correctCount++;
            }
            
            // 统计技能表现
            if (!skillStats[question.skill]) {
                skillStats[question.skill] = { correct: 0, total: 0 };
            }
            skillStats[question.skill].total++;
            if (isCorrect) {
                skillStats[question.skill].correct++;
            }
            
            results.push({
                questionIndex: index,
                question: question,
                userAnswer: userAnswer,
                correctAnswer: question.correct,
                isCorrect: isCorrect,
                skill: question.skill,
                timeSpent: question.timeSpent || 0,
                attempts: question.attempts || 1
            });
        });
        
        // 计算各项指标
        const accuracy = Math.round((correctCount / totalQuestions) * 100);
        const readingSpeed = this.calculateReadingSpeed();
        const comprehensionLevel = this.assessComprehensionLevel(accuracy, skillStats);
        
        // 生成详细分析
        const analysis = this.generateDetailedAnalysis(results, skillStats, accuracy, readingSpeed);
        
        return {
            article: this.currentArticle,
            session: this.readingSession,
            results: results,
            totalQuestions: totalQuestions,
            correctCount: correctCount,
            accuracy: accuracy,
            readingSpeed: readingSpeed,
            readingTime: this.readingSession.readingTime,
            questionTime: this.readingSession.questionTime,
            totalTime: this.readingSession.totalTime,
            skillStats: skillStats,
            comprehensionLevel: comprehensionLevel,
            analysis: analysis
        };
    }

    /**
     * 计算阅读速度
     */
    calculateReadingSpeed() {
        if (!this.readingSession.readingTime || this.readingSession.readingTime === 0) {
            return 0;
        }
        
        const wordsPerMinute = Math.round((this.currentArticle.wordCount / this.readingSession.readingTime) * 60000);
        return wordsPerMinute;
    }

    /**
     * 评估理解水平
     */
    assessComprehensionLevel(accuracy, skillStats) {
        let level = 'beginner';
        
        if (accuracy >= 85) {
            level = 'advanced';
        } else if (accuracy >= 70) {
            level = 'intermediate';
        }
        
        // 考虑技能均衡性
        const skillAccuracies = Object.values(skillStats).map(stat => 
            Math.round((stat.correct / stat.total) * 100)
        );
        
        const minSkillAccuracy = Math.min(...skillAccuracies);
        if (minSkillAccuracy < 50) {
            level = 'beginner';
        } else if (minSkillAccuracy < 70 && level === 'advanced') {
            level = 'intermediate';
        }
        
        return level;
    }

    /**
     * 生成详细分析
     */
    generateDetailedAnalysis(results, skillStats, accuracy, readingSpeed) {
        const analysis = {
            overall: this.generateOverallAssessment(accuracy, readingSpeed),
            strengths: [],
            weaknesses: [],
            recommendations: [],
            skillAnalysis: {},
            readingSpeedAnalysis: this.analyzeReadingSpeed(readingSpeed),
            timeManagement: this.analyzeTimeManagement()
        };

        // 分析各技能表现
        Object.keys(skillStats).forEach(skill => {
            const stats = skillStats[skill];
            const skillAccuracy = Math.round((stats.correct / stats.total) * 100);
            
            analysis.skillAnalysis[skill] = {
                accuracy: skillAccuracy,
                correct: stats.correct,
                total: stats.total,
                level: this.getSkillLevel(skillAccuracy),
                feedback: this.getSkillFeedback(skill, skillAccuracy)
            };

            if (skillAccuracy >= 80) {
                analysis.strengths.push(`${this.getSkillName(skill)}: ${skillAccuracy}%`);
            } else if (skillAccuracy < 60) {
                analysis.weaknesses.push(`${this.getSkillName(skill)}: ${skillAccuracy}%`);
            }
        });

        // 生成学习建议
        analysis.recommendations = this.generateLearningRecommendations(accuracy, skillStats, readingSpeed);

        return analysis;
    }

    /**
     * 生成总体评估
     */
    generateOverallAssessment(accuracy, readingSpeed) {
        let assessment = '';
        
        if (accuracy >= 90) {
            assessment = '优秀！您的阅读理解能力很强，能够准确把握文章内容。';
        } else if (accuracy >= 80) {
            assessment = '很好！您已经具备了良好的阅读理解基础，继续保持。';
        } else if (accuracy >= 70) {
            assessment = '不错！您基本掌握了文章内容，但还有提升空间。';
        } else if (accuracy >= 60) {
            assessment = '需要加强练习。建议多读类似文章，提高理解能力。';
        } else {
            assessment = '阅读理解需要大量练习。建议从简单文章开始，逐步提高。';
        }

        // 考虑阅读速度
        if (readingSpeed > 250) {
            assessment += ' 您的阅读速度很快，这是一个优势。';
        } else if (readingSpeed < 150) {
            assessment += ' 建议适当提高阅读速度，这有助于考试时间管理。';
        }

        return assessment;
    }

    /**
     * 分析阅读速度
     */
    analyzeReadingSpeed(readingSpeed) {
        const thresholds = this.adaptiveSystem.readingSpeedThresholds;
        let level = 'normal';
        let feedback = '';

        if (readingSpeed < thresholds.slow) {
            level = 'slow';
            feedback = '阅读速度较慢，建议多练习快速阅读技巧。';
        } else if (readingSpeed > thresholds.fast) {
            level = 'fast';
            feedback = '阅读速度很快，注意保持理解准确性。';
        } else {
            feedback = '阅读速度适中，继续保持。';
        }

        return { level, speed: readingSpeed, feedback };
    }

    /**
     * 分析时间管理
     */
    analyzeTimeManagement() {
        const readingTimeRatio = this.readingSession.readingTime / this.readingSession.totalTime;
        const questionTimeRatio = this.readingSession.questionTime / this.readingSession.totalTime;

        let feedback = '';
        if (readingTimeRatio > 0.7) {
            feedback = '阅读时间占比较高，可以尝试提高阅读效率。';
        } else if (readingTimeRatio < 0.4) {
            feedback = '阅读时间较短，确保充分理解文章内容。';
        } else {
            feedback = '时间分配合理，阅读和答题时间平衡。';
        }

        return {
            readingTime: this.readingSession.readingTime,
            questionTime: this.readingSession.questionTime,
            readingTimeRatio: Math.round(readingTimeRatio * 100),
            questionTimeRatio: Math.round(questionTimeRatio * 100),
            feedback
        };
    }

    /**
     * 获取技能水平
     */
    getSkillLevel(accuracy) {
        if (accuracy >= 85) return '优秀';
        if (accuracy >= 70) return '良好';
        if (accuracy >= 60) return '一般';
        return '需要提高';
    }

    /**
     * 获取技能名称
     */
    getSkillName(skill) {
        const skillNames = {
            'main_idea': '主旨理解',
            'detail': '细节理解',
            'inference': '推理判断',
            'vocabulary': '词汇理解',
            'attitude': '态度理解'
        };
        return skillNames[skill] || skill;
    }

    /**
     * 获取技能反馈
     */
    getSkillFeedback(skill, accuracy) {
        if (accuracy >= 80) {
            return `${this.getSkillName(skill)}能力强，继续保持。`;
        } else if (accuracy >= 60) {
            return `${this.getSkillName(skill)}有待提高，多加练习。`;
        } else {
            return `${this.getSkillName(skill)}需要重点加强。`;
        }
    }

    /**
     * 生成学习建议
     */
    generateLearningRecommendations(accuracy, skillStats, readingSpeed) {
        const recommendations = [];

        // 基于总体准确率的建议
        if (accuracy < 60) {
            recommendations.push('建议从较简单的文章开始练习，逐步提高难度');
            recommendations.push('多练习基础阅读技巧，如快速定位关键信息');
        } else if (accuracy < 80) {
            recommendations.push('继续练习当前难度的文章，巩固理解能力');
            recommendations.push('注意分析错题，找出理解误区');
        } else {
            recommendations.push('可以尝试更高难度的文章，挑战自己');
            recommendations.push('关注阅读速度和效率的提升');
        }

        // 基于技能弱项的建议
        const weakSkills = Object.keys(skillStats).filter(skill => {
            const skillAccuracy = Math.round((skillStats[skill].correct / skillStats[skill].total) * 100);
            return skillAccuracy < 70;
        });

        if (weakSkills.length > 0) {
            recommendations.push(`重点练习：${weakSkills.map(s => this.getSkillName(s)).join('、')}`);
        }

        // 基于阅读速度的建议
        if (readingSpeed < 150) {
            recommendations.push('练习快速阅读技巧，提高阅读效率');
        } else if (readingSpeed > 300) {
            recommendations.push('阅读速度很快，注意保持理解准确性');
        }

        return recommendations;
    }

    /**
     * 更新自适应系统
     */
    updateAdaptiveSystem(result) {
        // 记录表现历史
        this.adaptiveSystem.performanceHistory.push({
            timestamp: Date.now(),
            accuracy: result.accuracy,
            difficulty: result.session.difficulty,
            articleType: result.session.articleType,
            readingSpeed: result.readingSpeed
        });

        // 保持历史记录在合理范围内
        if (this.adaptiveSystem.performanceHistory.length > 10) {
            this.adaptiveSystem.performanceHistory.shift();
        }

        // 调整难度
        const recentPerformance = this.getRecentPerformance();
        if (recentPerformance.length >= this.adaptiveSystem.difficultyAdjustmentThreshold) {
            const avgAccuracy = recentPerformance.reduce((sum, p) => sum + p.accuracy, 0) / recentPerformance.length;
            this.adjustDifficultyBasedOnPerformance(avgAccuracy);
        }

        // 保存自适应设置到用户进度
        this.readingProgress.adaptiveLevel = this.adaptiveSystem.currentLevel;
    }

    /**
     * 记录阅读活动
     */
    async recordReadingActivity(result) {
        try {
            const activity = {
                module: 'reading',
                type: 'reading_comprehension',
                articleType: result.session.articleType,
                difficulty: result.session.difficulty,
                duration: result.totalTime,
                accuracy: result.accuracy,
                readingSpeed: result.readingSpeed,
                comprehensionLevel: result.comprehensionLevel,
                details: {
                    articleTitle: result.article.title,
                    wordCount: result.article.wordCount,
                    questionsAnswered: result.totalQuestions,
                    correctAnswers: result.correctCount,
                    skillStats: result.skillStats,
                    timeBreakdown: {
                        readingTime: result.readingTime,
                        questionTime: result.questionTime
                    }
                }
            };

            // 这里可以保存到本地存储或发送到服务器
            if (window.Storage) {
                await window.Storage.addLearningActivity(activity);
            }
            
            window.logger?.info('阅读练习活动已记录');
        } catch (error) {
            window.logger?.error('记录阅读活动失败:', error);
        }
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reading')) {
        window.readingManager = new ReadingManager();
        window.logger?.info('阅读理解管理器已全局初始化');
    }
});
