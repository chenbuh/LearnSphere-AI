/**
 * 增强版模拟考试管理器
 * 提供完整的考试模拟功能，包括AI题目生成、智能计时、高级评分和深度分析
 */
class ExamSimulatorManager {
    constructor() {
        this.currentExam = null;
        this.examTimer = null;
        this.autosaveInterval = null;
        this.examEndTimestamp = null; // ms epoch when exam should end
        this.lastTickMs = null;
        this._lastAutosaveAt = 0;
        this.autosaveDebounceMs = 2000;
        this.examHistory = [];
        this.questionBank = new Map();
        this.examConfigs = new Map();
        this.dataProvider = new ExamDataProvider();
        this.examSetTrackerKey = 'exam_set_tracker';
        this.examSetTracker = this.loadExamSetTracker();
        
        // 新增功能模块
        this.aiScoringEngine = new ExamAIScoringEngine();
        this.adaptiveEngine = new AdaptiveTestingEngine();
        this.feedbackGenerator = new ExamFeedbackGenerator();
        this.performanceAnalyzer = new ExamPerformanceAnalyzer();
        this.uiController = new ExamUIController();
        this.resultAnalyzer = new ExamResultAnalyzer();
        
        // 考试状态管理
        this.examState = {
            isFullscreen: false,
            showTimer: true,
            allowReview: true,
            autoSave: true,
            currentSection: null,
            sectionTimeRemaining: 0,
            pauseCount: 0,
            warningShown: false
        };
        
        this.init();
    }

    init() {
        console.log('📝 初始化模拟考试系统...');
        this.loadExamHistory();
        this.initializeQuestionBank();
        this.initializeExamConfigs();
        this.setupEventListeners();
        // 尝试恢复未完成考试
        this.tryRestoreExam();
    }

    /**
     * 加载考试历史
     */
    loadExamHistory() {
        try {
            const saved = localStorage.getItem('exam_history');
            this.examHistory = saved ? JSON.parse(saved) : [];
            console.log('📚 考试历史已加载:', this.examHistory.length, '次考试');
        } catch (error) {
            console.error('❌ 加载考试历史失败:', error);
            this.examHistory = [];
        }
    }

    /**
     * 保存考试历史
     */
    saveExamHistory() {
        try {
            localStorage.setItem('exam_history', JSON.stringify(this.examHistory));
            console.log('💾 考试历史已保存');
        } catch (error) {
            console.error('❌ 保存考试历史失败:', error);
        }
    }

    /**
     * 初始化题库
     */
    initializeQuestionBank() {
        // 优先尝试加载外部/本地数据提供器（真实题库）
        const loaded = this.dataProvider.loadAllSync();
        if (loaded && Object.keys(loaded).length) {
            Object.entries(loaded).forEach(([examType, sections]) => {
                this.questionBank.set(examType, sections);
            });
            console.log('📚 题库已通过数据提供器加载');
        }

        // 如无外部题库，使用内置题库兜底
        // CET-4 题库
        this.questionBank.set('cet4', {
            listening: this.generateListeningQuestions('cet4', 25),
            reading: this.generateReadingQuestions('cet4', 20),
            writing: this.generateWritingQuestions('cet4', 1),
            translation: this.generateTranslationQuestions('cet4', 1)
        });

        // CET-6 题库
        this.questionBank.set('cet6', {
            listening: this.generateListeningQuestions('cet6', 25),
            reading: this.generateReadingQuestions('cet6', 20),
            writing: this.generateWritingQuestions('cet6', 1),
            translation: this.generateTranslationQuestions('cet6', 1)
        });

        // IELTS 题库
        this.questionBank.set('ielts', {
            listening: this.generateListeningQuestions('ielts', 40),
            reading: this.generateReadingQuestions('ielts', 40),
            writing: this.generateWritingQuestions('ielts', 2),
            speaking: this.generateSpeakingQuestions('ielts', 3)
        });

        // TOEFL 题库
        this.questionBank.set('toefl', {
            listening: this.generateListeningQuestions('toefl', 28),
            reading: this.generateReadingQuestions('toefl', 30),
            writing: this.generateWritingQuestions('toefl', 2),
            speaking: this.generateSpeakingQuestions('toefl', 4)
        });

        // 考研英语题库
        this.questionBank.set('postgraduate', {
            reading: this.generateReadingQuestions('postgraduate', 25),
            knowledge: this.generateLanguageKnowledgeQuestions('postgraduate', 20),
            writing: this.generateWritingQuestions('postgraduate', 2),
            translation: this.generateTranslationQuestions('postgraduate', 5)
        });

        // TEM-4 题库
        this.questionBank.set('tem4', {
            listening: this.generateListeningQuestions('tem4', 20),
            reading: this.generateReadingQuestions('tem4', 20),
            language: this.generateLanguageKnowledgeQuestions('tem4', 30),
            writing: this.generateWritingQuestions('tem4', 1),
            dictation: this.generateDictationQuestions('tem4', 1)
        });

        // TEM-8 题库
        this.questionBank.set('tem8', {
            listening: this.generateListeningQuestions('tem8', 15),
            reading: this.generateReadingQuestions('tem8', 22),
            language: this.generateHumanitiesQuestions('tem8', 10),
            translation: this.generateTranslationQuestions('tem8', 1),
            writing: this.generateWritingQuestions('tem8', 1)
        });

        // GRE 题库
        this.questionBank.set('gre', {
            verbal: this.generateVerbalReasoningQuestions('gre', 40),
            quantitative: this.generateQuantitativeQuestions('gre', 40),
            writing: this.generateWritingQuestions('gre', 2)
        });

        console.log('📊 题库已初始化');
    }

    /**
     * 初始化考试配置
     */
    initializeExamConfigs() {
        this.examConfigs.set('cet4', {
            name: '大学英语四级',
            duration: 130, // 分钟
            totalScore: 710,
            sections: [
                { name: '听力理解', type: 'listening', questions: 25, time: 30, score: 249 },
                { name: '阅读理解', type: 'reading', questions: 20, time: 40, score: 249 },
                { name: '翻译', type: 'translation', questions: 1, time: 30, score: 106 },
                { name: '写作', type: 'writing', questions: 1, time: 30, score: 106 }
            ],
            passScore: 425
        });

        this.examConfigs.set('cet6', {
            name: '大学英语六级',
            duration: 130,
            totalScore: 710,
            sections: [
                { name: '听力理解', type: 'listening', questions: 25, time: 30, score: 249 },
                { name: '阅读理解', type: 'reading', questions: 20, time: 40, score: 249 },
                { name: '翻译', type: 'translation', questions: 1, time: 30, score: 106 },
                { name: '写作', type: 'writing', questions: 1, time: 30, score: 106 }
            ],
            passScore: 425
        });

        this.examConfigs.set('ielts', {
            name: '雅思考试',
            duration: 165,
            totalScore: 9,
            sections: [
                { name: '听力', type: 'listening', questions: 40, time: 30, score: 9 },
                { name: '阅读', type: 'reading', questions: 40, time: 60, score: 9 },
                { name: '写作', type: 'writing', questions: 2, time: 60, score: 9 },
                { name: '口语', type: 'speaking', questions: 3, time: 15, score: 9 }
            ],
            passScore: 6.0
        });

        this.examConfigs.set('toefl', {
            name: '托福考试',
            duration: 180,
            totalScore: 120,
            sections: [
                { name: '阅读', type: 'reading', questions: 30, time: 54, score: 30 },
                { name: '听力', type: 'listening', questions: 28, time: 41, score: 30 },
                { name: '口语', type: 'speaking', questions: 4, time: 17, score: 30 },
                { name: '写作', type: 'writing', questions: 2, time: 50, score: 30 }
            ],
            passScore: 80
        });

        this.examConfigs.set('postgraduate', {
            name: '考研英语',
            duration: 180,
            totalScore: 100,
            sections: [
                { name: '阅读理解', type: 'reading', questions: 25, time: 70, score: 40 },
                { name: '英语知识运用', type: 'knowledge', questions: 20, time: 20, score: 10 },
                { name: '写作', type: 'writing', questions: 2, time: 60, score: 30 },
                { name: '翻译', type: 'translation', questions: 5, time: 30, score: 20 }
            ],
            passScore: 60
        });

        this.examConfigs.set('tem4', {
            name: '专业英语四级',
            duration: 130,
            totalScore: 100,
            sections: [
                { name: '听力理解', type: 'listening', questions: 20, time: 25, score: 20 },
                { name: '阅读理解', type: 'reading', questions: 20, time: 25, score: 20 },
                { name: '语言知识', type: 'language', questions: 30, time: 25, score: 20 },
                { name: '写作', type: 'writing', questions: 1, time: 45, score: 20 },
                { name: '听写', type: 'dictation', questions: 1, time: 10, score: 20 }
            ],
            passScore: 60
        });

        this.examConfigs.set('tem8', {
            name: '专业英语八级',
            duration: 195,
            totalScore: 100,
            sections: [
                { name: '听力理解', type: 'listening', questions: 15, time: 25, score: 15 },
                { name: '阅读理解', type: 'reading', questions: 22, time: 45, score: 30 },
                { name: '人文知识', type: 'language', questions: 10, time: 10, score: 10 },
                { name: '汉译英', type: 'translation', questions: 1, time: 60, score: 20 },
                { name: '写作', type: 'writing', questions: 1, time: 45, score: 25 }
            ],
            passScore: 60
        });

        this.examConfigs.set('gre', {
            name: 'GRE考试',
            duration: 225,
            totalScore: 340,
            sections: [
                { name: '语文推理', type: 'verbal', questions: 40, time: 90, score: 170 },
                { name: '数量推理', type: 'quantitative', questions: 40, time: 90, score: 170 },
                { name: '分析性写作', type: 'writing', questions: 2, time: 60, score: 0 }
            ],
            passScore: 300
        });

        console.log('⚙️ 考试配置已初始化');
    }

    /**
     * 生成听力题目
     */
    generateListeningQuestions(examType, count) {
        const questions = [];
        
        const templates = [
            {
                text: "What is the main topic of the conversation?",
                options: ["Travel plans", "Work schedule", "Study methods", "Weekend activities"],
                answer: 0,
                difficulty: 'easy'
            },
            {
                text: "Where does this conversation most likely take place?",
                options: ["In a library", "At a restaurant", "In a classroom", "At home"],
                answer: 1,
                difficulty: 'medium'
            },
            {
                text: "What does the speaker suggest about the new policy?",
                options: ["It's too strict", "It's very helpful", "It needs improvement", "It's confusing"],
                answer: 2,
                difficulty: 'hard'
            }
        ];

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            questions.push({
                id: `${examType}_listening_${i + 1}`,
                type: 'multiple_choice',
                section: 'listening',
                text: `Question ${i + 1}: ${template.text}`,
                options: template.options,
                correctAnswer: template.answer,
                difficulty: template.difficulty,
                audioUrl: null, // 在实际实现中会有音频文件
                audioScript: this.generateAudioScript(examType, template)
            });
        }

        return questions;
    }

    /**
     * 生成阅读题目
     */
    generateReadingQuestions(examType, count) {
        const questions = [];
        
        const passages = [
            {
                title: "The Impact of Technology on Education",
                content: "Technology has revolutionized the way we learn and teach. From online courses to interactive whiteboards, digital tools have become integral to modern education. Students can now access vast amounts of information instantly, collaborate with peers globally, and learn at their own pace. However, this digital transformation also presents challenges such as digital divide and the need for digital literacy skills.",
                questions: [
                    {
                        text: "According to the passage, technology in education has:",
                        options: ["Only positive effects", "Revolutionized learning methods", "Replaced traditional teaching", "Caused more problems than benefits"],
                        answer: 1
                    },
                    {
                        text: "What challenge does the passage mention?",
                        options: ["Lack of internet", "Digital divide", "High costs", "Teacher resistance"],
                        answer: 1
                    }
                ]
            },
            {
                title: "Climate Change and Renewable Energy",
                content: "As climate change continues to pose significant challenges, the world is increasingly turning to renewable energy sources. Solar and wind power have become more cost-effective, while governments worldwide are implementing policies to reduce carbon emissions. The transition to clean energy is not just an environmental necessity but also an economic opportunity, creating new jobs and industries.",
                questions: [
                    {
                        text: "The main focus of this passage is:",
                        options: ["Economic benefits", "Environmental challenges", "Renewable energy transition", "Government policies"],
                        answer: 2
                    }
                ]
            }
        ];

        let questionIndex = 0;
        for (let i = 0; i < Math.ceil(count / 3); i++) {
            const passage = passages[i % passages.length];
            
            // 添加段落信息
            questions.push({
                id: `${examType}_reading_passage_${i + 1}`,
                type: 'passage',
                section: 'reading',
                title: passage.title,
                content: passage.content
            });

            // 添加相关问题
            for (const q of passage.questions) {
                if (questionIndex >= count) break;
                
                questions.push({
                    id: `${examType}_reading_${questionIndex + 1}`,
                    type: 'multiple_choice',
                    section: 'reading',
                    passageId: `${examType}_reading_passage_${i + 1}`,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.answer,
                    difficulty: 'medium'
                });
                
                questionIndex++;
            }
        }

        return questions.slice(0, count + Math.ceil(count / 3)); // 包含段落
    }

    /**
     * 生成写作题目
     */
    generateWritingQuestions(examType, count) {
        const questions = [];
        
        const topics = {
            cet4: [
                {
                    title: "Online Learning vs Traditional Learning",
                    prompt: "With the rapid development of technology, online learning has become increasingly popular. Some people believe that online learning is more effective than traditional classroom learning, while others disagree. Write an essay expressing your opinion on this topic.",
                    requirements: [
                        "Write at least 120 words",
                        "Express your opinion clearly",
                        "Support your argument with examples",
                        "Use proper essay structure"
                    ],
                    timeLimit: 30,
                    wordLimit: { min: 120, max: 180 }
                }
            ],
            ielts: [
                {
                    title: "Task 1: Line Graph Analysis",
                    prompt: "The graph below shows the number of tourists visiting a particular country between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
                    requirements: [
                        "Write at least 150 words",
                        "Describe the main trends",
                        "Make relevant comparisons",
                        "Use appropriate academic language"
                    ],
                    timeLimit: 20,
                    wordLimit: { min: 150, max: 200 }
                },
                {
                    title: "Task 2: Essay Writing",
                    prompt: "Some people think that governments should spend money on building new railway lines, while others believe that money should be spent on improving existing public transport. Discuss both views and give your own opinion.",
                    requirements: [
                        "Write at least 250 words",
                        "Discuss both viewpoints",
                        "Give your own opinion",
                        "Use examples and evidence"
                    ],
                    timeLimit: 40,
                    wordLimit: { min: 250, max: 350 }
                }
            ]
        };

        const examTopics = topics[examType] || topics.cet4;
        
        for (let i = 0; i < count; i++) {
            const topic = examTopics[i % examTopics.length];
            questions.push({
                id: `${examType}_writing_${i + 1}`,
                type: 'essay',
                section: 'writing',
                title: topic.title,
                prompt: topic.prompt,
                requirements: topic.requirements,
                timeLimit: topic.timeLimit,
                wordLimit: topic.wordLimit,
                difficulty: examType === 'ielts' || examType === 'toefl' ? 'hard' : 'medium'
            });
        }

        return questions;
    }

    /**
     * 生成翻译题目
     */
    generateTranslationQuestions(examType, count) {
        const questions = [];
        
        const translations = [
            {
                chinese: "中国的教育制度一直在不断改革和发展。近年来，政府加大了对教育的投入，提高了教学质量，促进了教育公平。",
                difficulty: 'medium'
            },
            {
                chinese: "随着科技的快速发展，人工智能已经开始影响我们生活的方方面面，从智能手机到自动驾驶汽车。",
                difficulty: 'medium'
            },
            {
                chinese: "环境保护已成为全球关注的重要议题。各国政府正在采取措施减少污染，保护我们共同的地球家园。",
                difficulty: 'hard'
            }
        ];

        for (let i = 0; i < count; i++) {
            const translation = translations[i % translations.length];
            questions.push({
                id: `${examType}_translation_${i + 1}`,
                type: 'translation',
                section: 'translation',
                chineseText: translation.chinese,
                difficulty: translation.difficulty,
                timeLimit: 30,
                referenceAnswer: null // 实际实现中会有参考答案
            });
        }

        return questions;
    }

    /**
     * 生成口语题目
     */
    generateSpeakingQuestions(examType, count) {
        const questions = [];
        
        const topics = [
            {
                title: "Personal Introduction",
                prompt: "Please introduce yourself, including your name, background, and current situation.",
                timeLimit: 2,
                preparationTime: 1
            },
            {
                title: "Describe a memorable experience",
                prompt: "Describe a memorable experience you had recently. You should say: what it was, when it happened, who was involved, and explain why it was memorable.",
                timeLimit: 3,
                preparationTime: 1
            },
            {
                title: "Opinion on technology",
                prompt: "Do you think technology has improved our quality of life? Give reasons and examples to support your answer.",
                timeLimit: 3,
                preparationTime: 1
            }
        ];

        for (let i = 0; i < count; i++) {
            const topic = topics[i % topics.length];
            questions.push({
                id: `${examType}_speaking_${i + 1}`,
                type: 'speaking',
                section: 'speaking',
                title: topic.title,
                prompt: topic.prompt,
                timeLimit: topic.timeLimit,
                preparationTime: topic.preparationTime,
                difficulty: 'medium'
            });
        }

        return questions;
    }

    /**
     * 生成音频脚本
     */
    generateAudioScript(examType, template) {
        return `[Audio Script for ${examType}]\nSpeaker: ${template.text}\n[End of audio]`;
    }

    /**
     * 创建新考试
     */
    createExam(config) {
        console.log('📝 创建新考试:', config);
        
        const examConfig = this.examConfigs.get(config.examType);
        if (!examConfig) {
            throw new Error('不支持的考试类型');
        }

        // 应用自定义配置
        const customConfig = this.applyCustomConfig(examConfig, config);

        const questionBank = this.pickExamSet(config.examType);
        if (!questionBank) {
            throw new Error('题库未找到');
        }

        // 生成考试题目
        const examQuestions = [];
        for (const section of customConfig.sections) {
            if (questionBank[section.type]) {
                const sectionQuestions = questionBank[section.type]
                    .slice(0, section.questions)
                    .map(q => ({ ...q, sectionName: section.name }));
                examQuestions.push(...sectionQuestions);
            }
        }

        this.currentExam = {
            id: 'exam_' + Date.now(),
            type: config.examType,
            name: customConfig.name,
            config: customConfig,
            originalConfig: examConfig, // 保留原始配置用于对比
            questions: examQuestions,
            answers: new Map(),
            startTime: null,
            endTime: null,
            currentQuestionIndex: 0,
            currentSection: 0,
            timeRemaining: customConfig.duration * 60, // 转换为秒
            status: 'created', // created, started, paused, completed
            settings: {
                showTimer: config.showTimer !== false,
                allowReview: config.allowReview !== false,
                shuffleQuestions: config.shuffleQuestions || false,
                customized: this.isCustomized(examConfig, customConfig)
            }
        };

        // 如果启用了题目乱序
        if (this.currentExam.settings.shuffleQuestions) {
            this.shuffleArray(this.currentExam.questions);
        }

        return this.currentExam;
    }

    /**
     * 应用自定义配置
     */
    applyCustomConfig(originalConfig, userConfig) {
        const customConfig = JSON.parse(JSON.stringify(originalConfig)); // 深拷贝

        // 自定义考试时长
        if (userConfig.customDuration && userConfig.customDuration > 0) {
            customConfig.duration = userConfig.customDuration;
            customConfig.name += ' (自定义时长)';
        }

        // 自定义题目数量
        if (userConfig.customQuestions) {
            customConfig.sections = customConfig.sections.map(section => {
                const customCount = userConfig.customQuestions[section.type];
                if (customCount && customCount > 0 && customCount !== section.questions) {
                    return {
                        ...section,
                        questions: customCount,
                        // 按比例调整分数
                        score: Math.round((section.score / section.questions) * customCount)
                    };
                }
                return section;
            });

            // 重新计算总分
            customConfig.totalScore = customConfig.sections.reduce((sum, section) => sum + section.score, 0);
            customConfig.name += ' (自定义题量)';
        }

        // 自定义难度
        if (userConfig.difficulty && userConfig.difficulty !== 'standard') {
            customConfig.difficulty = userConfig.difficulty;
            customConfig.name += ` (${this.getDifficultyName(userConfig.difficulty)})`;
            
            // 根据难度调整时间和及格分数
            const difficultyMultipliers = {
                easy: { time: 1.2, pass: 0.9 },
                hard: { time: 0.8, pass: 1.1 },
                expert: { time: 0.7, pass: 1.2 }
            };
            
            const multiplier = difficultyMultipliers[userConfig.difficulty];
            if (multiplier) {
                customConfig.duration = Math.round(customConfig.duration * multiplier.time);
                customConfig.passScore = Math.round(customConfig.passScore * multiplier.pass);
            }
        }

        return customConfig;
    }

    /**
     * 检查是否为自定义配置
     */
    isCustomized(originalConfig, customConfig) {
        return originalConfig.duration !== customConfig.duration ||
               originalConfig.totalScore !== customConfig.totalScore ||
               customConfig.difficulty;
    }

    /**
     * 获取难度名称
     */
    getDifficultyName(difficulty) {
        const names = {
            easy: '简单',
            standard: '标准',
            hard: '困难',
            expert: '专家'
        };
        return names[difficulty] || '标准';
    }

    /**
     * 获取自定义配置选项
     */
    getCustomConfigOptions(examType) {
        const baseConfig = this.examConfigs.get(examType);
        if (!baseConfig) return null;

        return {
            examType,
            baseConfig,
            options: {
                duration: {
                    min: Math.round(baseConfig.duration * 0.5),
                    max: Math.round(baseConfig.duration * 2),
                    default: baseConfig.duration,
                    step: 5
                },
                difficulty: {
                    options: [
                        { value: 'easy', label: '简单', description: '时间充裕，题目相对简单' },
                        { value: 'standard', label: '标准', description: '标准难度和时间' },
                        { value: 'hard', label: '困难', description: '时间紧张，题目较难' },
                        { value: 'expert', label: '专家', description: '极具挑战性' }
                    ],
                    default: 'standard'
                },
                sections: baseConfig.sections.map(section => ({
                    type: section.type,
                    name: section.name,
                    defaultQuestions: section.questions,
                    minQuestions: Math.max(1, Math.round(section.questions * 0.3)),
                    maxQuestions: Math.round(section.questions * 1.5)
                }))
            }
        };
    }

    /**
     * 随机抽取未做过的题库套题（100套循环）
     */
    pickExamSet(examType) {
        // 允许两种来源：数据提供器返回的按套组织的数组，或当前questionBank静态对象
        let bank = this.dataProvider.loadAllSync?.()[examType] || this.questionBank.get(examType);
        // 若不存在按套题库，则动态生成100套
        if (!bank) {
            bank = this.generateSetsForExam(examType, 100);
            if (bank && bank.length) {
                // 缓存在questionBank里，后续可复用
                this.questionBank.set(examType, bank);
            }
        }
        if (!bank) return null;

        // 情况A：已经是按套数组，如 [{listening:[], reading:[], ...}, ...]
        if (Array.isArray(bank)) {
            const used = this.examSetTracker[examType] || [];
            const pool = bank.map((_, i) => i).filter(i => !used.includes(i));
            // 使用基于时间戳的伪随机选择，确保可重现性
            const timeBasedSeed = Date.now() % 1000;
            const idx = pool.length ? pool[timeBasedSeed % pool.length] : timeBasedSeed % bank.length;
            this.markSetUsed(examType, idx, bank.length);
            return bank[idx];
        }

        // 情况B：是单一对象（老结构），直接返回
        return bank;
    }

    /**
     * 动态生成指定考试类型的N套题（OER等价难度模板）
     */
    generateSetsForExam(examType, n = 100) {
        const cfg = this.examConfigs.get(examType);
        if (!cfg) return [];
        const sets = [];
        for (let i = 0; i < n; i++) {
            const sections = {};
            for (const sec of cfg.sections) {
                const count = sec.questions;
                switch (sec.type) {
                    case 'listening':
                        sections[sec.type] = this.generateListeningQuestions(examType, count);
                        break;
                    case 'reading':
                        sections[sec.type] = this.generateReadingQuestions(examType, count);
                        break;
                    case 'writing':
                        sections[sec.type] = this.generateWritingQuestions(examType, count);
                        break;
                    case 'translation':
                        sections[sec.type] = this.generateTranslationQuestions(examType, count);
                        break;
                    case 'speaking':
                        sections[sec.type] = this.generateSpeakingQuestions(examType, count);
                        break;
                    case 'knowledge':
                        sections[sec.type] = this.generateLanguageKnowledgeQuestions(examType, count);
                        break;
                    case 'language':
                        sections[sec.type] = this.generateHumanitiesQuestions(examType, count);
                        break;
                    case 'dictation':
                        sections[sec.type] = this.generateDictationQuestions(examType, count);
                        break;
                    case 'verbal':
                        sections[sec.type] = this.generateVerbalReasoningQuestions(examType, count);
                        break;
                    case 'quantitative':
                        sections[sec.type] = this.generateQuantitativeQuestions(examType, count);
                        break;
                    default:
                        sections[sec.type] = [];
                }
            }
            sets.push(sections);
        }
        // 生成后落地本地存储，便于离线使用
        try {
            if (this.dataProvider && this.dataProvider.saveSetsToLocal) {
                this.dataProvider.saveSetsToLocal(examType, sets);
            }
        } catch (e) {}
        return sets;
    }

    markSetUsed(examType, index, total) {
        if (!this.examSetTracker[examType]) this.examSetTracker[examType] = [];
        if (!this.examSetTracker[examType].includes(index)) {
            this.examSetTracker[examType].push(index);
            // 若达到总量（默认100），下次自动清空，允许再次随机
            const limit = total || 100;
            if (this.examSetTracker[examType].length >= limit) {
                this.examSetTracker[examType] = [];
            }
            this.saveExamSetTracker();
        }
    }

    loadExamSetTracker() {
        try {
            const raw = localStorage.getItem(this.examSetTrackerKey);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    saveExamSetTracker() {
        try {
            localStorage.setItem(this.examSetTrackerKey, JSON.stringify(this.examSetTracker));
        } catch (e) {}
    }

    /**
     * 确保本地存在指定考试类型的N套题库（若不存在则生成并保存）
     */
    ensureSets(examType, n = 100) {
        try {
			// 通过计数判断是否已具备足量题库（支持IndexedDB/LocalStorage）
			const count = this.dataProvider.getLocalCount(examType);
			if (count >= n) return;
            const sets = this.generateSetsForExam(examType, n);
            if (sets && sets.length) {
                this.dataProvider.saveSetsToLocal(examType, sets);
                this.questionBank.set(examType, sets);
            }
        } catch (e) {
            console.warn('ensureSets failed:', e);
        }
    }

    /**
     * 批量生成并落库（可覆盖）
     */
    seedSets(examType, n = 100, overwrite = false) {
        try {
            if (overwrite) {
                this.dataProvider.clearLocal(examType);
                // 重置随机抽题记录
                if (this.examSetTracker[examType]) {
                    this.examSetTracker[examType] = [];
                    this.saveExamSetTracker();
                }
            } else {
                const count = this.dataProvider.getLocalCount(examType);
                if (count >= n) return;
            }
            const sets = this.generateSetsForExam(examType, n);
            if (sets && sets.length) {
                this.dataProvider.saveSetsToLocal(examType, sets);
                this.questionBank.set(examType, sets);
                console.log(`✅ 已生成并落库 ${examType} 题库 ${sets.length} 套`);
            }
        } catch (e) {
            console.warn('seedSets failed:', e);
        }
    }

    /**
     * 开始考试
     */
    startExam() {
        if (!this.currentExam || this.currentExam.status !== 'created') {
            throw new Error('没有可开始的考试');
        }

        this.currentExam.status = 'started';
        this.currentExam.startTime = Date.now();
        // 以结束时间戳为准，避免计时漂移
        this.examEndTimestamp = this.currentExam.startTime + (this.currentExam.timeRemaining * 1000);
        
        // 启动计时器
        this.startTimer();
        // 立即保存一次进度
        this.saveExamProgress();
        
        // 初始化UI
        if (this.uiController) {
            this.uiController.initializeExamUI(this.getCurrentExamStatus());
        }
        
        console.log('▶️ 考试已开始');
        return this.currentExam;
    }

    /**
     * 启动计时器
     */
    startTimer() {
        if (this.examTimer) {
            clearInterval(this.examTimer);
        }
        this.lastTickMs = Date.now();
        this.examTimer = setInterval(() => {
            if (!this.currentExam || this.currentExam.status !== 'started') return;
            const now = Date.now();
            // 基于结束时间戳计算剩余秒数，避免累计误差
            if (typeof this.examEndTimestamp === 'number') {
                const remainingSec = Math.max(0, Math.round((this.examEndTimestamp - now) / 1000));
                this.currentExam.timeRemaining = remainingSec;
            } else {
                // 兜底：按秒递减
                this.currentExam.timeRemaining = Math.max(0, (this.currentExam.timeRemaining || 0) - 1);
            }

            // 广播时间更新
            this.broadcastTimeUpdate();

            // 定时自动保存（每5秒或节流后）
            if (now - this._lastAutosaveAt >= 5000) {
                this.saveExamProgress();
            }

            if (this.currentExam.timeRemaining <= 0) {
                this.finishExam(true); // 时间到强制结束
            }
            this.lastTickMs = now;
        }, 1000);
    }

    /**
     * 暂停考试
     */
    pauseExam() {
        if (this.currentExam && this.currentExam.status === 'started') {
            this.currentExam.status = 'paused';
            this.currentExam.pauseTime = Date.now();
            this.examState.pauseCount++;
            
            if (this.examTimer) {
                clearInterval(this.examTimer);
                this.examTimer = null;
            }
            // 保持当前剩余时间并保存进度
            this.saveExamProgress();
            
            // 显示暂停提示
            this.showPauseNotification();
            
            console.log('⏸️ 考试已暂停');
        }
    }

    /**
     * 恢复考试
     */
    resumeExam() {
        if (this.currentExam && this.currentExam.status === 'paused') {
            this.currentExam.status = 'started';
            this.currentExam.resumeTime = Date.now();
            
            // 重新计算结束时间戳
            this.examEndTimestamp = Date.now() + (this.currentExam.timeRemaining * 1000);
            this.startTimer();
            this.saveExamProgress();
            
            // 显示恢复提示
            this.showResumeNotification();
            
            console.log('▶️ 考试已恢复');
        }
    }

    /**
     * 显示暂停通知
     */
    showPauseNotification() {
        const pauseCount = this.examState.pauseCount;
        let message = '考试已暂停';
        
        if (pauseCount === 1) {
            message += '\n\n💡 温馨提示：\n• 暂停期间不会消耗考试时间\n• 您可以随时点击"恢复"继续考试\n• 建议适当休息后再继续';
        } else if (pauseCount <= 3) {
            message += '\n\n⚠️ 注意：\n• 这是您第' + pauseCount + '次暂停考试\n• 频繁暂停可能影响考试状态\n• 建议尽快完成考试';
        } else {
            message += '\n\n🚨 提醒：\n• 您已暂停考试' + pauseCount + '次\n• 请尽量保持考试的连续性\n• 如有困难请寻求帮助';
        }
        
        this.showNotification(message, 'warning');
        
        // 广播暂停事件
        this.broadcastExamStateChange('paused');
    }

    /**
     * 显示恢复通知
     */
    showResumeNotification() {
        const timeRemaining = this.formatTimeRemaining(this.currentExam.timeRemaining);
        let message = '考试已恢复';
        
        if (this.currentExam.timeRemaining > 1800) { // 超过30分钟
            message += `\n\n✅ 状态良好：\n• 剩余时间：${timeRemaining}\n• 继续保持专注完成考试`;
        } else if (this.currentExam.timeRemaining > 600) { // 10-30分钟
            message += `\n\n⏰ 时间提醒：\n• 剩余时间：${timeRemaining}\n• 请合理安排答题节奏`;
        } else {
            message += `\n\n🔥 时间紧迫：\n• 剩余时间：${timeRemaining}\n• 建议优先完成有把握的题目`;
        }
        
        this.showNotification(message, 'info');
        
        // 广播恢复事件
        this.broadcastExamStateChange('resumed');
    }

    /**
     * 格式化剩余时间
     */
    formatTimeRemaining(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * 广播考试状态变化
     */
    broadcastExamStateChange(action) {
        try {
            window.dispatchEvent(new CustomEvent('examStateChange', {
                detail: {
                    action,
                    examStatus: this.getCurrentExamStatus(),
                    timestamp: Date.now()
                }
            }));
        } catch (error) {
            console.warn('广播考试状态变化失败:', error);
        }
    }

    /**
     * 提交答案
     */
    submitAnswer(questionId, answer) {
        if (!this.currentExam || this.currentExam.status !== 'started') {
            throw new Error('考试未开始或已结束');
        }

        this.currentExam.answers.set(questionId, {
            answer: answer,
            timestamp: Date.now(),
            questionIndex: this.currentExam.currentQuestionIndex
        });

        console.log('✏️ 答案已提交:', questionId, answer);
        
        // 广播答案更新
        this.broadcastAnswerUpdate(questionId, answer);
        // 答题后保存进度（节流）
        this.saveExamProgress();
    }

    /**
     * 获取题目作答（若已作答）
     */
    getAnswer(questionId) {
        if (!this.currentExam) return null;
        const rec = this.currentExam.answers.get(questionId);
        return rec ? rec.answer : null;
    }

    /**
     * 获取当前题目
     */
    getCurrentQuestion() {
        if (!this.currentExam) {
            return null;
        }

        const index = this.currentExam.currentQuestionIndex;
        return this.currentExam.questions[index] || null;
    }

    /**
     * 获取当前考试的全部题目（包含段落）
     */
    getQuestions() {
        if (!this.currentExam) return [];
        return this.currentExam.questions || [];
    }

    /**
     * 判断题目是否已作答
     */
    isAnswered(questionId) {
        if (!this.currentExam) return false;
        return this.currentExam.answers.has(questionId);
    }

    /**
     * 下一题
     */
    nextQuestion() {
        if (!this.currentExam) {
            return false;
        }

        if (this.currentExam.currentQuestionIndex < this.currentExam.questions.length - 1) {
            this.currentExam.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    /**
     * 上一题
     */
    previousQuestion() {
        if (!this.currentExam) {
            return false;
        }

        if (this.currentExam.currentQuestionIndex > 0) {
            this.currentExam.currentQuestionIndex--;
            return true;
        }
        return false;
    }

    /**
     * 跳转到指定题目
     */
    goToQuestion(index) {
        if (!this.currentExam || index < 0 || index >= this.currentExam.questions.length) {
            return false;
        }

        this.currentExam.currentQuestionIndex = index;
        return true;
    }

    /**
     * 完成考试
     */
    finishExam(forced = false) {
        if (!this.currentExam) {
            throw new Error('没有正在进行的考试');
        }

        this.currentExam.status = 'completed';
        this.currentExam.endTime = Date.now();

        // 停止计时器
        if (this.examTimer) {
            clearInterval(this.examTimer);
            this.examTimer = null;
        }
        this.examEndTimestamp = null;
        // 清理已保存的进度
        this.clearSavedProgress();

        // 计算成绩
        const result = this.calculateScore();
        
        // 获取详细的错题分析数据
        const reviewData = this.getReviewData();
        
        // 进行深度分析
        if (this.resultAnalyzer) {
            const analysis = this.resultAnalyzer.analyzeExamResult(result, reviewData);
            result.analysis = analysis;
        }
        
        // 保存到历史记录
        this.saveExamResult(result, forced);
        
        // 记录到学习动态管理器
        if (window.learningActivityManager) {
            const examType = this.currentExam.type || '模拟考试';
            const duration = Math.round((this.currentExam.endTime - this.currentExam.startTime) / 60000);
            window.learningActivityManager.recordExamActivity(examType, result.totalScore, duration);
        }

        // 清理UI
        if (this.uiController) {
            this.uiController.cleanup();
        }

        console.log('🏁 考试已结束', forced ? '(时间到)' : '');
        return result;
    }

    /**
     * 计算成绩
     */
    calculateScore() {
        if (!this.currentExam) {
            return null;
        }

        const exam = this.currentExam;
        const results = {
            examId: exam.id,
            examType: exam.type,
            examName: exam.name,
            startTime: exam.startTime,
            endTime: exam.endTime,
            duration: Math.floor((exam.endTime - exam.startTime) / 1000), // 秒
            totalQuestions: exam.questions.filter(q => q.type !== 'passage').length,
            answeredQuestions: exam.answers.size,
            sections: {},
            overall: {}
        };

        // 按题型统计
        const sectionStats = {};
        let totalCorrect = 0;
        let totalAnswered = 0;

        for (const question of exam.questions) {
            if (question.type === 'passage') continue; // 跳过段落

            const section = question.section;
            if (!sectionStats[section]) {
                sectionStats[section] = {
                    name: question.sectionName || section,
                    total: 0,
                    answered: 0,
                    correct: 0,
                    score: 0,
                    maxScore: 0
                };
            }

            sectionStats[section].total++;
            
            // 获取该题型的满分
            const sectionConfig = exam.config.sections.find(s => s.type === section);
            if (sectionConfig) {
                sectionStats[section].maxScore = sectionConfig.score;
            }

            const userAnswer = exam.answers.get(question.id);
            if (userAnswer !== undefined) {
                sectionStats[section].answered++;
                totalAnswered++;

                // 检查答案是否正确（仅适用于选择题）
                if (question.type === 'multiple_choice' && userAnswer.answer === question.correctAnswer) {
                    sectionStats[section].correct++;
                    totalCorrect++;
                }
            }
        }

        // 计算各部分分数
        for (const [sectionType, stats] of Object.entries(sectionStats)) {
            if (stats.total > 0) {
                stats.accuracy = stats.answered > 0 ? (stats.correct / stats.answered) * 100 : 0;
                
                // 计算分数（选择题部分）
                if (stats.maxScore > 0) {
                    if (sectionType === 'listening' || sectionType === 'reading') {
                        // 客观题按正确率计算
                        stats.score = (stats.correct / stats.total) * stats.maxScore;
                    } else {
                        // 主观题给一个基准分数（实际需要人工评分）
                        stats.score = stats.answered > 0 ? stats.maxScore * 0.7 : 0;
                    }
                }
            }
            results.sections[sectionType] = stats;
        }

        // 计算总分
        const totalPossibleScore = exam.config.totalScore;
        let totalScore = 0;
        for (const stats of Object.values(sectionStats)) {
            totalScore += stats.score;
        }

        results.overall = {
            totalScore: Math.round(totalScore),
            maxScore: totalPossibleScore,
            accuracy: totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0,
            completionRate: (totalAnswered / results.totalQuestions) * 100,
            passed: totalScore >= exam.config.passScore,
            grade: this.calculateGrade(exam.type, totalScore, totalPossibleScore)
        };

        return results;
    }

    /**
     * 获取批改所需的逐题回顾数据（仅在考试完成后调用）
     */
    getReviewData() {
        if (!this.currentExam || this.currentExam.status !== 'completed') return [];
        const review = [];
        for (const q of this.currentExam.questions) {
            if (q.type === 'passage') continue;
            const rec = this.currentExam.answers.get(q.id);
            const userAnswer = rec ? rec.answer : null;
            const correctAnswer = typeof q.correctAnswer !== 'undefined' ? q.correctAnswer : null;
            const correct = (userAnswer === correctAnswer);
            review.push({
                id: q.id,
                section: q.section,
                text: q.text || q.title || '',
                options: q.options || [],
                userAnswer,
                correctAnswer,
                correct,
                explanation: q.explanation || q.audioScript || ''
            });
        }
        return review;
    }

    /**
     * 计算等级
     */
    calculateGrade(examType, score, maxScore) {
        const percentage = (score / maxScore) * 100;

        if (examType === 'ielts') {
            // 雅思9分制
            if (score >= 8.5) return 'A+';
            if (score >= 7.5) return 'A';
            if (score >= 6.5) return 'B+';
            if (score >= 5.5) return 'B';
            if (score >= 4.5) return 'C+';
            return 'C';
        } else if (examType === 'toefl') {
            // 托福等级
            if (score >= 100) return 'A+';
            if (score >= 90) return 'A';
            if (score >= 80) return 'B+';
            if (score >= 70) return 'B';
            if (score >= 60) return 'C+';
            return 'C';
        } else {
            // CET等级
            if (percentage >= 85) return 'A+';
            if (percentage >= 75) return 'A';
            if (percentage >= 65) return 'B+';
            if (percentage >= 60) return 'B';
            if (percentage >= 55) return 'C+';
            return 'C';
        }
    }

    /**
     * 保存考试结果
     */
    saveExamResult(result, forced = false) {
        const examRecord = {
            ...result,
            forced,
            timestamp: Date.now()
        };

        this.examHistory.unshift(examRecord);
        
        // 只保留最近50次考试记录
        if (this.examHistory.length > 50) {
            this.examHistory = this.examHistory.slice(0, 50);
        }

        this.saveExamHistory();

        // 记录到游戏化系统
        if (window.gamificationManager) {
            window.gamificationManager.recordActivity({
                type: 'exam',
                examType: result.examType,
                score: result.overall.accuracy,
                duration: Math.floor(result.duration / 60), // 转换为分钟
                count: 1,
                timestamp: Date.now()
            });
        }

        // 记录到AI推荐系统
        if (window.app && window.app.recordStudySession) {
            window.app.recordStudySession('exam', result.duration / 60, result.overall.accuracy);
        }
    }

    /**
     * 获取考试历史
     */
    getExamHistory(limit = 10) {
        return this.examHistory.slice(0, limit);
    }

    /**
     * 获取考试统计
     */
    getExamStats() {
        if (this.examHistory.length === 0) {
            return {
                totalExams: 0,
                averageScore: 0,
                bestScore: 0,
                recentTrend: 'stable',
                examTypeStats: {}
            };
        }

        const stats = {
            totalExams: this.examHistory.length,
            averageScore: 0,
            bestScore: 0,
            recentTrend: 'stable',
            examTypeStats: {}
        };

        let totalScore = 0;
        let bestScore = 0;

        // 按考试类型统计
        const typeStats = {};
        
        for (const exam of this.examHistory) {
            const score = exam.overall.totalScore;
            const maxScore = exam.overall.maxScore;
            const percentage = (score / maxScore) * 100;

            totalScore += percentage;
            bestScore = Math.max(bestScore, percentage);

            // 按类型统计
            if (!typeStats[exam.examType]) {
                typeStats[exam.examType] = {
                    count: 0,
                    totalScore: 0,
                    bestScore: 0,
                    averageScore: 0
                };
            }

            typeStats[exam.examType].count++;
            typeStats[exam.examType].totalScore += percentage;
            typeStats[exam.examType].bestScore = Math.max(typeStats[exam.examType].bestScore, percentage);
        }

        stats.averageScore = Math.round(totalScore / this.examHistory.length);
        stats.bestScore = Math.round(bestScore);

        // 计算各类型平均分
        for (const [type, data] of Object.entries(typeStats)) {
            data.averageScore = Math.round(data.totalScore / data.count);
            stats.examTypeStats[type] = data;
        }

        // 计算趋势（最近5次vs之前5次）
        if (this.examHistory.length >= 10) {
            const recent5 = this.examHistory.slice(0, 5);
            const previous5 = this.examHistory.slice(5, 10);
            
            const recentAvg = recent5.reduce((sum, exam) => 
                sum + (exam.overall.totalScore / exam.overall.maxScore) * 100, 0) / 5;
            const previousAvg = previous5.reduce((sum, exam) => 
                sum + (exam.overall.totalScore / exam.overall.maxScore) * 100, 0) / 5;
            
            if (recentAvg > previousAvg + 5) {
                stats.recentTrend = 'improving';
            } else if (recentAvg < previousAvg - 5) {
                stats.recentTrend = 'declining';
            } else {
                stats.recentTrend = 'stable';
            }
        }

        return stats;
    }

    /**
     * 数组乱序
     */
    shuffleArray(array) {
        // 使用基于数组内容的确定性洗牌算法
        const seed = this.generateSeedFromArray(array);
        for (let i = array.length - 1; i > 0; i--) {
            const j = (seed + i) % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * 基于数组内容生成种子
     */
    generateSeedFromArray(array) {
        let seed = 0;
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            if (typeof item === 'string') {
                seed += item.charCodeAt(0) || 0;
            } else if (typeof item === 'object' && item.word) {
                seed += item.word.charCodeAt(0) || 0;
            }
        }
        return seed % 1000;
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 页面关闭前保存状态
        window.addEventListener('beforeunload', () => {
            if (this.currentExam && this.currentExam.status === 'started') {
                this.pauseExam();
            }
        });
    }

    /**
     * 将当前考试序列化为可存储对象
     */
    serializeCurrentExam() {
        if (!this.currentExam) return null;
        const answersArray = Array.from(this.currentExam.answers.entries());
        return {
            ...this.currentExam,
            answers: answersArray,
            examEndTimestamp: this.examEndTimestamp
        };
    }

    /**
     * 从存储对象反序列化为运行时结构
     */
    deserializeExam(saved) {
        const exam = { ...saved };
        exam.answers = new Map(saved.answers || []);
        return exam;
    }

    /**
     * 保存考试进度（带简单节流）
     */
    saveExamProgress() {
        try {
            const now = Date.now();
            if (now - this._lastAutosaveAt < this.autosaveDebounceMs) return;
            this._lastAutosaveAt = now;
            if (!this.currentExam) return;
            const payload = this.serializeCurrentExam();
            localStorage.setItem('current_exam_state', JSON.stringify(payload));
        } catch (e) {
            console.warn('保存考试进度失败:', e);
        }
    }

    /**
     * 清除保存的考试进度
     */
    clearSavedProgress() {
        try {
            localStorage.removeItem('current_exam_state');
        } catch (e) {}
    }

    /**
     * 启动时尝试恢复未完成考试
     */
    tryRestoreExam() {
        try {
            const raw = localStorage.getItem('current_exam_state');
            if (!raw) return false;
            const saved = JSON.parse(raw);
            const status = saved?.status;
            if (!status || status === 'completed') {
                this.clearSavedProgress();
                return false;
            }
            this.currentExam = this.deserializeExam(saved);
            this.examEndTimestamp = typeof saved.examEndTimestamp === 'number' ? saved.examEndTimestamp : null;
            // 如果本应处于进行中，检查是否已经超时
            if (status === 'started') {
                const now = Date.now();
                if (this.examEndTimestamp && now >= this.examEndTimestamp) {
                    // 已过期，直接结束
                    this.finishExam(true);
                    return false;
                }
                // 重新计算剩余秒数以防不一致
                if (this.examEndTimestamp) {
                    this.currentExam.timeRemaining = Math.max(0, Math.round((this.examEndTimestamp - now) / 1000));
                }
                this.startTimer();
            }
            // 通知外部UI已恢复
            try {
                window.dispatchEvent(new CustomEvent('examRestored', { detail: this.getCurrentExamStatus() }));
            } catch (_) {}
            console.log('♻️ 已恢复未完成的考试');
            return true;
        } catch (e) {
            console.warn('恢复考试进度失败:', e);
            return false;
        }
    }

    /**
     * 广播时间更新
     */
    broadcastTimeUpdate() {
        if (window.app) {
            window.dispatchEvent(new CustomEvent('examTimeUpdate', {
                detail: {
                    timeRemaining: this.currentExam.timeRemaining,
                    totalTime: this.currentExam.config.duration * 60
                }
            }));
        }
    }

    /**
     * 广播答案更新
     */
    broadcastAnswerUpdate(questionId, answer) {
        if (window.app) {
            window.dispatchEvent(new CustomEvent('examAnswerUpdate', {
                detail: {
                    questionId,
                    answer,
                    totalAnswered: this.currentExam.answers.size,
                    totalQuestions: this.currentExam.questions.filter(q => q.type !== 'passage').length
                }
            }));
        }
    }

    /**
     * 获取支持的考试类型
     */
    getSupportedExamTypes() {
        return Array.from(this.examConfigs.keys()).map(key => ({
            id: key,
            name: this.examConfigs.get(key).name,
            config: this.examConfigs.get(key)
        }));
    }

    /**
     * 重置当前考试
     */
    resetCurrentExam() {
        if (this.examTimer) {
            clearInterval(this.examTimer);
            this.examTimer = null;
        }
        this.currentExam = null;
    }

    /**
     * 获取当前考试状态
     */
    getCurrentExamStatus() {
        if (!this.currentExam) {
            return null;
        }

        return {
            id: this.currentExam.id,
            type: this.currentExam.type,
            name: this.currentExam.name,
            status: this.currentExam.status,
            currentQuestionIndex: this.currentExam.currentQuestionIndex,
            totalQuestions: this.currentExam.questions.filter(q => q.type !== 'passage').length,
            timeRemaining: this.currentExam.timeRemaining,
            totalTime: this.currentExam.config.duration * 60,
            answeredCount: this.currentExam.answers.size
        };
    }

    /**
     * 生成语言知识运用题目
     */
    generateLanguageKnowledgeQuestions(examType, count) {
        const questions = [];
        
        const templates = [
            {
                text: "The company has _____ significant progress in developing new products.",
                options: ["made", "done", "taken", "given"],
                answer: 0,
                explanation: "make progress 是固定搭配"
            },
            {
                text: "_____ the weather was terrible, we decided to go camping anyway.",
                options: ["Despite", "Although", "However", "Because"],
                answer: 1,
                explanation: "although 引导让步状语从句"
            },
            {
                text: "The project requires _____ attention to detail.",
                options: ["careful", "carefully", "carefulness", "care"],
                answer: 0,
                explanation: "需要形容词修饰名词attention"
            }
        ];

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            questions.push({
                id: `${examType}_knowledge_${i + 1}`,
                type: 'multiple_choice',
                section: 'knowledge',
                text: `${i + 1}. ${template.text}`,
                options: template.options,
                correctAnswer: template.answer,
                explanation: template.explanation,
                difficulty: 'medium'
            });
        }

        return questions;
    }

    /**
     * 生成听写题目
     */
    generateDictationQuestions(examType, count) {
        const questions = [];
        
        const passages = [
            {
                title: "Environmental Protection",
                content: "Environmental protection has become one of the most important issues in modern society. Governments and individuals must work together to preserve our planet for future generations.",
                words: 150
            }
        ];

        for (let i = 0; i < count; i++) {
            const passage = passages[i % passages.length];
            questions.push({
                id: `${examType}_dictation_${i + 1}`,
                type: 'dictation',
                section: 'dictation',
                title: passage.title,
                content: passage.content,
                wordCount: passage.words,
                timeLimit: 10,
                difficulty: 'hard'
            });
        }

        return questions;
    }

    /**
     * 生成人文知识题目
     */
    generateHumanitiesQuestions(examType, count) {
        const questions = [];
        
        const templates = [
            {
                text: "Which of the following works was written by William Shakespeare?",
                options: ["Pride and Prejudice", "Jane Eyre", "Hamlet", "Wuthering Heights"],
                answer: 2,
                category: "literature"
            },
            {
                text: "The capital of Australia is:",
                options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
                answer: 3,
                category: "geography"
            },
            {
                text: "The American Civil War ended in:",
                options: ["1863", "1864", "1865", "1866"],
                answer: 2,
                category: "history"
            }
        ];

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            questions.push({
                id: `${examType}_humanities_${i + 1}`,
                type: 'multiple_choice',
                section: 'language',
                text: `${i + 1}. ${template.text}`,
                options: template.options,
                correctAnswer: template.answer,
                category: template.category,
                difficulty: 'hard'
            });
        }

        return questions;
    }

    /**
     * 生成语文推理题目
     */
    generateVerbalReasoningQuestions(examType, count) {
        const questions = [];
        
        const templates = [
            {
                text: "ABANDONMENT : DESERTION ::",
                options: ["a) recluse : hermit", "b) dereliction : duty", "c) abdication : throne", "d) resignation : position"],
                answer: 0,
                explanation: "同义词关系"
            },
            {
                text: "Choose the word that best completes the sentence: The professor's lecture was so _____ that even the most attentive students found it difficult to follow.",
                options: ["a) lucid", "b) abstruse", "c) elementary", "d) coherent"],
                answer: 1,
                explanation: "abstruse means difficult to understand"
            }
        ];

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            questions.push({
                id: `${examType}_verbal_${i + 1}`,
                type: 'multiple_choice',
                section: 'verbal',
                text: template.text,
                options: template.options,
                correctAnswer: template.answer,
                explanation: template.explanation,
                difficulty: 'expert'
            });
        }

        return questions;
    }

    /**
     * 生成数量推理题目
     */
    generateQuantitativeQuestions(examType, count) {
        const questions = [];
        
        const templates = [
            {
                text: "If x + 3 = 7, what is the value of 2x?",
                options: ["a) 4", "b) 6", "c) 8", "d) 10"],
                answer: 2,
                explanation: "x = 4, so 2x = 8"
            },
            {
                text: "What is 25% of 80?",
                options: ["a) 15", "b) 20", "c) 25", "d) 30"],
                answer: 1,
                explanation: "25% × 80 = 0.25 × 80 = 20"
            }
        ];

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            questions.push({
                id: `${examType}_quantitative_${i + 1}`,
                type: 'multiple_choice',
                section: 'quantitative',
                text: `${i + 1}. ${template.text}`,
                options: template.options,
                correctAnswer: template.answer,
                explanation: template.explanation,
                difficulty: 'medium'
            });
        }

        return questions;
    }
}

/**
 * 题库数据提供器
 * 从本地JSON或内存中提供真实题库
 */
class ExamDataProvider {
    constructor() {
        this.cache = {};
        this.sources = {
            cet4: 'src/data/exams/cet4.json',
            cet6: 'src/data/exams/cet6.json',
            ielts: 'src/data/exams/ielts.json',
            toefl: 'src/data/exams/toefl.json'
        };
        this.localKeyPrefix = 'exam_sets_';
    }

    // 同步加载（优先使用预嵌入的全局变量，其次使用本地缓存对象）
    loadAllSync() {
        const result = {};
        try {
            Object.keys(this.sources).forEach(key => {
                const globalSingle = `EXAM_DATA_${key.toUpperCase()}`; // 单套结构
                const globalSets = `EXAM_SETS_${key.toUpperCase()}`;   // 多套数组结构
                const localSets = this.loadFromLocal(key);
                if (localSets && Array.isArray(localSets) && localSets.length) {
                    result[key] = localSets;
                } else if (window[globalSets] && Array.isArray(window[globalSets])) {
                    result[key] = window[globalSets];
                } else if (window[globalSingle]) {
                    result[key] = window[globalSingle];
                } else if (this.cache[key]) {
                    result[key] = this.cache[key];
                }
            });
        } catch (e) {
            console.warn('题库同步加载失败:', e);
        }
        return result;
    }

    loadFromLocal(type) {
		try {
			// 优先读取meta（避免同步加载超大数据）
			const metaRaw = localStorage.getItem(this.localKeyPrefix + type + '_meta');
			if (metaRaw) {
				const meta = JSON.parse(metaRaw);
				// 如果标记为存于IndexedDB，则不同步返回大对象
				if (meta && meta.storage === 'idb') {
					return null;
				}
			}
			// 兼容旧版：localStorage 中直接存放完整数组
			const raw = localStorage.getItem(this.localKeyPrefix + type);
			return raw ? JSON.parse(raw) : null;
		} catch (e) { return null; }
    }

	saveSetsToLocal(type, sets) {
		try {
			// 优先写入 IndexedDB（通过全局 Storage 管理器）
			if (window.Storage && typeof window.Storage.set === 'function') {
				// 异步写入，不阻塞主线程
				window.Storage.set(this.localKeyPrefix + type, sets);
				// 在 localStorage 写入精简 meta，避免超配额
				localStorage.setItem(
					this.localKeyPrefix + type + '_meta',
					JSON.stringify({ count: Array.isArray(sets) ? sets.length : 0, storage: 'idb', ts: Date.now() })
				);
				return;
			}

			// 无 IndexedDB 时，尽量避免大对象写入 localStorage
			const json = JSON.stringify(sets);
			if (json.length < 800000) { // ~0.8MB 安全阈值（不同浏览器配额不同）
				localStorage.setItem(this.localKeyPrefix + type, json);
				localStorage.setItem(
					this.localKeyPrefix + type + '_meta',
					JSON.stringify({ count: Array.isArray(sets) ? sets.length : 0, storage: 'ls', ts: Date.now() })
				);
			} else {
				// 过大则仅写 meta，提示数据存在但需要运行时再生成/拉取
				localStorage.setItem(
					this.localKeyPrefix + type + '_meta',
					JSON.stringify({ count: Array.isArray(sets) ? sets.length : 0, storage: 'ls-meta-only', ts: Date.now() })
				);
			}
		} catch (e) {
			console.warn('保存本地题库失败:', e);
		}
	}

	clearLocal(type) {
		try {
			localStorage.removeItem(this.localKeyPrefix + type);
			localStorage.removeItem(this.localKeyPrefix + type + '_meta');
		} catch (e) {}
		// 同时清理 IndexedDB
		try {
			if (window.Storage && typeof window.Storage.remove === 'function') {
				window.Storage.remove(this.localKeyPrefix + type);
			}
		} catch (e) {}
	}

	getLocalCount(type) {
		// 先读 meta，避免解析大对象
		try {
			const metaRaw = localStorage.getItem(this.localKeyPrefix + type + '_meta');
			if (metaRaw) {
				const meta = JSON.parse(metaRaw);
				if (meta && typeof meta.count === 'number') return meta.count;
			}
		} catch (e) {}
		const data = this.loadFromLocal(type);
		return Array.isArray(data) ? data.length : 0;
	}
}

// 导出管理器
if (typeof window !== 'undefined') {
    window.ExamSimulatorManager = ExamSimulatorManager;
    console.log('📝 模拟考试管理器已加载');
}
