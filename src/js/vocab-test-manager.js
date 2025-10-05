/**
 * 词汇测试管理器
 * 负责处理词汇测试的所有功能
 */
class VocabularyTestManager {
    constructor() {
        this.currentTest = null;
        this.testHistory = [];
        this.testTimer = null;
        this.startTime = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testConfig = {
            examType: 'cet4',
            testMode: 'meaning',
            difficulty: 'intermediate',
            questionCount: 20
        };
        
        this.init();
    }

    /**
     * 初始化词汇测试管理器
     */
    init() {
        this.loadTestHistory();
        this.bindEvents();
        console.log('📝 词汇测试管理器已初始化');
    }

    /**
     * 绑定事件处理程序
     */
    bindEvents() {
        // 配置选项事件绑定
        this.bindConfigEvents();
        
        // 测试控制事件绑定
        this.bindTestControlEvents();
    }

    /**
     * 绑定配置选项事件
     */
    bindConfigEvents() {
        // 考试类型选择
        document.querySelectorAll('.exam-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.exam-option').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.testConfig.examType = e.target.dataset.exam;
                console.log('📚 选择考试类型:', this.testConfig.examType);
            });
        });

        // 测试模式选择
        document.querySelectorAll('.test-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.test-mode').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.testConfig.testMode = e.target.dataset.mode;
                console.log('🎯 选择测试模式:', this.testConfig.testMode);
            });
        });

        // 难度选择
        document.querySelectorAll('.difficulty-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-option').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.testConfig.difficulty = e.target.dataset.difficulty;
                console.log('⭐ 选择测试难度:', this.testConfig.difficulty);
            });
        });

        // 题目数量选择
        document.querySelectorAll('.count-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.count-option').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.testConfig.questionCount = parseInt(e.target.dataset.count);
                console.log('🔢 选择题目数量:', this.testConfig.questionCount);
            });
        });

        // 开始测试按钮
        const startBtn = document.getElementById('startTestBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startTest();
            });
        }
    }

    /**
     * 绑定测试控制事件
     */
    bindTestControlEvents() {
        // 上一题按钮
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousQuestion();
            });
        }

        // 下一题按钮
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        // 跳过按钮
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.skipQuestion();
            });
        }

        // 完成测试按钮
        const finishBtn = document.getElementById('finishBtn');
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                this.finishTest();
            });
        }
    }

    /**
     * 开始测试
     */
    async startTest() {
        try {
            // 检查是否已选择考试类型（从全局应用状态获取）
            const appExamType = window.app?.currentExamType || window.app?.settings?.examType;
            if (!appExamType && !this.testConfig.examType) {
                // 显示考试类型选择提示
                if (window.app && typeof window.app.showExamTypeSelectionPrompt === 'function') {
                    window.app.showExamTypeSelectionPrompt('词汇测试');
                    return;
                } else {
                    this.showNotification('请先选择考试类型', 'warning');
                    return;
                }
            }
            
            // 使用全局考试类型（如果本地未设置）
            if (!this.testConfig.examType && appExamType) {
                this.testConfig.examType = appExamType;
            }
            
            window.logger?.info('开始词汇测试...');
            window.logger?.debug('测试配置:', this.testConfig);

            // 生成测试题目
            const questions = await this.generateTestQuestions();
            
            if (!questions || questions.length === 0) {
                throw new Error('无法生成测试题目');
            }

            // 创建测试会话
            this.currentTest = {
                id: this.generateTestId(),
                config: { ...this.testConfig },
                questions: questions,
                startTime: new Date(),
                endTime: null,
                userAnswers: [],
                score: 0,
                completed: false
            };

            this.currentQuestionIndex = 0;
            this.userAnswers = [];
            this.startTime = Date.now();

            // 隐藏配置界面，显示测试界面
            this.showTestInterface();
            
            // 开始计时
            this.startTimer();
            
            // 显示第一题
            this.showCurrentQuestion();

            window.logger?.info('测试开始成功');

        } catch (error) {
            window.logger?.error('开始测试失败:', error);
            this.showNotification('开始测试失败: ' + error.message, 'error');
        }
    }

    /**
     * 生成测试题目
     */
    async generateTestQuestions() {
        try {
            // 获取词汇数据库
            if (!window.vocabularyDatabase) {
                throw new Error('词汇数据库未加载');
            }

            const vocabularyDb = window.vocabularyDatabase;
            const words = vocabularyDb.getWordsByExamType(this.testConfig.examType);
            
            if (!words || words.length === 0) {
                throw new Error('找不到对应考试类型的词汇');
            }

            window.logger?.info(`找到 ${words.length} 个 ${this.testConfig.examType} 词汇`);

            // 智能词汇筛选
            let filteredWords = this.intelligentWordSelection(words);
            
            window.logger?.info(`智能筛选后有 ${filteredWords.length} 个词汇`);

            if (filteredWords.length < this.testConfig.questionCount) {
                window.logger?.warn('可用词汇数量不足，使用所有可用词汇');
                this.testConfig.questionCount = filteredWords.length;
            }

            // 智能选择词汇（考虑用户历史表现）
            const selectedWords = this.selectWordsIntelligently(filteredWords);

            // 为每个词汇生成测试题目
            const questions = selectedWords.map((word, index) => {
                return this.generateQuestion(word, index + 1, selectedWords);
            });

            window.logger?.info(`成功生成 ${questions.length} 道测试题目`);
            return questions;

        } catch (error) {
            window.logger?.error('生成测试题目失败:', error);
            throw error;
        }
    }

    /**
     * 智能词汇筛选
     */
    intelligentWordSelection(words) {
        let filteredWords = [...words];

        // 根据难度筛选
        if (this.testConfig.difficulty !== 'mixed') {
            const difficultyMap = {
                'basic': [1, 2, 3],
                'intermediate': [3, 4, 5],
                'advanced': [5, 6]
            };
            
            const difficultyRange = difficultyMap[this.testConfig.difficulty] || [1, 6];
            filteredWords = filteredWords.filter(word => 
                word.difficulty && difficultyRange.includes(word.difficulty)
            );
        }

        // 过滤掉过于简单的词汇（如果用户水平较高）
        const userLevel = this.getUserLevel();
        if (userLevel > 3) {
            filteredWords = filteredWords.filter(word => 
                !word.word || word.word.length > 3
            );
        }

        // 优先选择用户容易出错的词汇类型
        const errorPatterns = this.getUserErrorPatterns();
        if (errorPatterns.length > 0) {
            const priorityWords = filteredWords.filter(word => 
                this.matchesErrorPattern(word, errorPatterns)
            );
            
            if (priorityWords.length >= this.testConfig.questionCount) {
                return priorityWords;
            }
        }

        return filteredWords;
    }

    /**
     * 智能选择词汇
     */
    selectWordsIntelligently(words) {
        const questionCount = Math.min(this.testConfig.questionCount, words.length);
        
        // 获取用户历史错误词汇
        const userErrors = this.getUserErrorWords();
        const reviewWords = [];
        const newWords = [];

        words.forEach(word => {
            if (userErrors.includes(word.word)) {
                reviewWords.push(word);
            } else {
                newWords.push(word);
            }
        });

        // 智能分配：30%复习词汇，70%新词汇
        const reviewCount = Math.min(Math.floor(questionCount * 0.3), reviewWords.length);
        const newCount = questionCount - reviewCount;

        const selectedReviewWords = this.shuffleArray(reviewWords).slice(0, reviewCount);
        const selectedNewWords = this.shuffleArray(newWords).slice(0, newCount);

        return this.shuffleArray([...selectedReviewWords, ...selectedNewWords]);
    }

    /**
     * 获取用户水平
     */
    getUserLevel() {
        const history = this.getTestHistory();
        if (history.length === 0) return 3; // 默认中等水平

        const recentTests = history.slice(-5); // 最近5次测试
        const avgScore = recentTests.reduce((sum, test) => sum + test.score, 0) / recentTests.length;

        if (avgScore >= 90) return 6;
        if (avgScore >= 80) return 5;
        if (avgScore >= 70) return 4;
        if (avgScore >= 60) return 3;
        if (avgScore >= 50) return 2;
        return 1;
    }

    /**
     * 获取用户错误模式
     */
    getUserErrorPatterns() {
        const history = this.getTestHistory();
        const errorTypes = [];

        history.forEach(test => {
            if (test.questions) {
                test.questions.forEach(q => {
                    if (!q.isCorrect && q.word) {
                        if (q.word.word && q.word.word.length > 8) {
                            errorTypes.push('long_words');
                        }
                        if (q.word.phonetic && q.word.phonetic.includes('θ')) {
                            errorTypes.push('difficult_pronunciation');
                        }
                        if (q.type === 'spelling') {
                            errorTypes.push('spelling_difficulty');
                        }
                    }
                });
            }
        });

        return [...new Set(errorTypes)];
    }

    /**
     * 检查词汇是否匹配错误模式
     */
    matchesErrorPattern(word, patterns) {
        return patterns.some(pattern => {
            switch (pattern) {
                case 'long_words':
                    return word.word && word.word.length > 8;
                case 'difficult_pronunciation':
                    return word.phonetic && (
                        word.phonetic.includes('θ') || 
                        word.phonetic.includes('ð') ||
                        word.phonetic.includes('ʃ')
                    );
                case 'spelling_difficulty':
                    return word.word && (
                        word.word.includes('ie') || 
                        word.word.includes('ei') ||
                        word.word.includes('ough')
                    );
                default:
                    return false;
            }
        });
    }

    /**
     * 获取用户历史错误词汇
     */
    getUserErrorWords() {
        const history = this.getTestHistory();
        const errorWords = [];

        history.forEach(test => {
            if (test.questions) {
                test.questions.forEach(q => {
                    if (!q.isCorrect && q.word && q.word.word) {
                        errorWords.push(q.word.word);
                    }
                });
            }
        });

        return [...new Set(errorWords)];
    }

    /**
     * 生成单个测试题目
     */
    generateQuestion(word, questionNumber, allWords) {
        const question = {
            id: questionNumber,
            word: word,
            type: this.testConfig.testMode,
            options: [],
            correctAnswer: 0,
            userAnswer: null,
            isCorrect: false,
            timeSpent: 0
        };

        switch (this.testConfig.testMode) {
            case 'meaning':
                question.prompt = `"${word.word}" 的中文意思是？`;
                question.options = this.generateMeaningOptions(word, allWords);
                break;
            
            case 'spelling':
                question.prompt = `根据中文意思 "${word.meaning}"，选择正确的英文拼写：`;
                question.options = this.generateSpellingOptions(word, allWords);
                break;
            
            case 'usage':
                question.prompt = '选择最适合的句子用法：';
                question.options = this.generateUsageOptions(word, allWords);
                break;
            
            case 'mixed':
                // 随机选择一种模式
                const modes = ['meaning', 'spelling', 'usage'];
                const randomMode = modes[Math.floor(Math.random() * modes.length)];
                return this.generateQuestion({ ...word, testMode: randomMode }, questionNumber, allWords);
        }

        return question;
    }

    /**
     * 生成中英互译选项
     */
    generateMeaningOptions(correctWord, allWords) {
        const options = [correctWord.meaning];
        
        // 从其他词汇中随机选择3个作为干扰项
        const otherWords = allWords.filter(w => 
            w.word !== correctWord.word && 
            w.meaning !== correctWord.meaning
        );
        
        while (options.length < 4 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            const randomWord = otherWords[randomIndex];
            
            if (!options.includes(randomWord.meaning)) {
                options.push(randomWord.meaning);
            }
            
            otherWords.splice(randomIndex, 1);
        }

        // 打乱选项顺序
        return this.shuffleArray(options);
    }

    /**
     * 生成拼写选项
     */
    generateSpellingOptions(correctWord, allWords) {
        const options = [correctWord.word];
        
        // 生成相似的错误拼写
        const similarWords = allWords.filter(w => 
            w.word !== correctWord.word && 
            w.word.length >= correctWord.word.length - 2 &&
            w.word.length <= correctWord.word.length + 2
        );

        while (options.length < 4 && similarWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * similarWords.length);
            const randomWord = similarWords[randomIndex];
            
            if (!options.includes(randomWord.word)) {
                options.push(randomWord.word);
            }
            
            similarWords.splice(randomIndex, 1);
        }

        // 如果相似词汇不足，生成人工错误拼写
        while (options.length < 4) {
            const fakeSpelling = this.generateFakeSpelling(correctWord.word);
            if (!options.includes(fakeSpelling)) {
                options.push(fakeSpelling);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * 生成用法选项
     */
    generateUsageOptions(correctWord, allWords) {
        const options = [];
        
        // 生成正确的用法句子
        const correctSentence = this.generateSentence(correctWord, true);
        options.push(correctSentence);

        // 生成错误的用法句子
        while (options.length < 4) {
            const wrongWord = allWords[Math.floor(Math.random() * allWords.length)];
            const wrongSentence = this.generateSentence(wrongWord, false);
            
            if (!options.includes(wrongSentence)) {
                options.push(wrongSentence);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * 生成错误拼写
     */
    generateFakeSpelling(correctWord) {
        const word = correctWord.toLowerCase();
        const mutations = [
            // 交换相邻字母
            (w) => {
                if (w.length < 2) return w;
                const i = Math.floor(Math.random() * (w.length - 1));
                const arr = w.split('');
                [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                return arr.join('');
            },
            // 删除一个字母
            (w) => {
                if (w.length < 2) return w + 'x';
                const i = Math.floor(Math.random() * w.length);
                return w.slice(0, i) + w.slice(i + 1);
            },
            // 添加一个字母
            (w) => {
                const letters = 'abcdefghijklmnopqrstuvwxyz';
                const i = Math.floor(Math.random() * (w.length + 1));
                const letter = letters[Math.floor(Math.random() * letters.length)];
                return w.slice(0, i) + letter + w.slice(i);
            },
            // 替换一个字母
            (w) => {
                if (w.length < 1) return 'word';
                const letters = 'abcdefghijklmnopqrstuvwxyz';
                const i = Math.floor(Math.random() * w.length);
                const letter = letters[Math.floor(Math.random() * letters.length)];
                return w.slice(0, i) + letter + w.slice(i + 1);
            }
        ];

        const mutation = mutations[Math.floor(Math.random() * mutations.length)];
        return mutation(word);
    }

    /**
     * 生成例句
     */
    generateSentence(word, isCorrect) {
        const templates = {
            noun: [
                `The ${word.word} is very important.`,
                `I saw a beautiful ${word.word} yesterday.`,
                `This ${word.word} belongs to me.`
            ],
            verb: [
                `I ${word.word} every day.`,
                `They will ${word.word} tomorrow.`,
                `She ${word.word}s very well.`
            ],
            adjective: [
                `The weather is very ${word.word}.`,
                `This book is ${word.word}.`,
                `I feel ${word.word} today.`
            ],
            adverb: [
                `He speaks ${word.word}.`,
                `She works ${word.word}.`,
                `They move ${word.word}.`
            ]
        };

        const category = word.category || 'noun';
        const categoryTemplates = templates[category] || templates.noun;
        const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
        
        return isCorrect ? template : template.replace(word.word, 'PLACEHOLDER');
    }

    /**
     * 打乱数组顺序
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
     * 显示测试界面
     */
    showTestInterface() {
        document.getElementById('testConfig').classList.add('hidden');
        document.getElementById('testInterface').classList.remove('hidden');
        document.getElementById('testResult').classList.add('hidden');
        
        // 更新题目总数显示
        document.getElementById('totalQuestions').textContent = this.testConfig.questionCount;
    }

    /**
     * 显示当前题目
     */
    showCurrentQuestion() {
        const question = this.currentTest.questions[this.currentQuestionIndex];
        if (!question) return;

        window.logger?.debug(`显示第 ${this.currentQuestionIndex + 1} 题:`, question.word.word);

        // 记录题目开始时间
        question.startTime = Date.now();

        // 更新进度显示
        this.updateProgress();

        // 构建题目HTML
        const questionHtml = this.buildQuestionHTML(question);
        
        // 显示题目（添加动画效果）
        const questionContainer = document.getElementById('testQuestion');
        questionContainer.style.opacity = '0';
        questionContainer.innerHTML = questionHtml;
        
        // 淡入动画
        setTimeout(() => {
            questionContainer.style.opacity = '1';
        }, 100);

        // 绑定答案选项事件
        this.bindAnswerEvents();

        // 更新按钮状态
        this.updateButtonStates();

        // 添加键盘快捷键支持
        this.bindKeyboardShortcuts();
    }

    /**
     * 构建题目HTML
     */
    buildQuestionHTML(question) {
        const word = question.word;
        const questionNumber = this.currentQuestionIndex + 1;
        const totalQuestions = this.currentTest.questions.length;
        
        let html = `
            <div class="question-content">
                <div class="question-header">
                    <div class="question-number">第 ${questionNumber} 题 / 共 ${totalQuestions} 题</div>
                    <div class="question-difficulty">
                        ${this.getDifficultyStars(word.difficulty || 3)}
                    </div>
                </div>
                
                <div class="question-main">
                    <div class="question-prompt">${question.prompt}</div>
                    
                    ${this.buildWordInfo(word, question.type)}
                </div>
                
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <button class="answer-option" data-index="${index}">
                            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${option}</span>
                        </button>
                    `).join('')}
                </div>
                
                <div class="question-footer">
                    <div class="question-tips">
                        💡 提示：可以使用键盘 A、B、C、D 键快速选择答案
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * 构建单词信息
     */
    buildWordInfo(word, questionType) {
        let html = '';
        
        if (questionType === 'meaning') {
            html = `
                <div class="word-display">
                    <div class="word-text">${word.word}</div>
                    ${word.phonetic ? `<div class="word-phonetic">[${word.phonetic}]</div>` : ''}
                    ${this.shouldShowAudio(word) ? `
                        <button class="word-audio-btn" onclick="this.playWordAudio('${word.word}')">
                            🔊 发音
                        </button>
                    ` : ''}
                </div>
            `;
        } else if (questionType === 'spelling') {
            html = `
                <div class="meaning-display">
                    <div class="meaning-text">${word.meaning}</div>
                    ${word.example ? `
                        <div class="word-example">
                            <strong>例句：</strong>${word.example}
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (questionType === 'usage') {
            html = `
                <div class="usage-display">
                    <div class="word-context">${word.word}</div>
                    <div class="context-sentence">${question.contextSentence}</div>
                </div>
            `;
        }
        
        return html;
    }

    /**
     * 获取难度星级显示
     */
    getDifficultyStars(difficulty) {
        const stars = '★'.repeat(difficulty) + '☆'.repeat(6 - difficulty);
        const difficultyText = ['', '入门', '基础', '中等', '中高', '高级', '专家'][difficulty] || '中等';
        return `<span class="difficulty-stars" title="${difficultyText}">${stars}</span>`;
    }

    /**
     * 判断是否显示音频按钮
     */
    shouldShowAudio(word) {
        // 只对英文单词显示音频按钮
        return word.word && /^[a-zA-Z\s-']+$/.test(word.word);
    }

    /**
     * 播放单词音频
     */
    playWordAudio(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            this.showNotification('您的浏览器不支持语音播放', 'warning');
        }
    }

    /**
     * 绑定键盘快捷键
     */
    bindKeyboardShortcuts() {
        const handleKeyPress = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // 如果在输入框中，不处理快捷键
            }
            
            const key = e.key.toLowerCase();
            const keyMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
            
            if (keyMap.hasOwnProperty(key)) {
                e.preventDefault();
                const optionIndex = keyMap[key];
                const option = document.querySelector(`[data-index="${optionIndex}"]`);
                if (option) {
                    option.click();
                }
            } else if (key === 'enter') {
                e.preventDefault();
                const nextBtn = document.getElementById('nextBtn');
                if (nextBtn && !nextBtn.disabled) {
                    nextBtn.click();
                }
            } else if (key === ' ') {
                e.preventDefault();
                const skipBtn = document.getElementById('skipBtn');
                if (skipBtn) {
                    skipBtn.click();
                }
            }
        };
        
        // 移除之前的事件监听器
        document.removeEventListener('keydown', this.keyboardHandler);
        this.keyboardHandler = handleKeyPress;
        document.addEventListener('keydown', this.keyboardHandler);
    }

    /**
     * 绑定答案选项事件
     */
    bindAnswerEvents() {
        document.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', (e) => {
                // 清除之前的选择
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // 标记当前选择
                e.target.classList.add('selected');
                
                // 记录答案
                const answerIndex = parseInt(e.target.dataset.index);
                this.recordAnswer(answerIndex);
            });
        });
    }

    /**
     * 记录答案
     */
    recordAnswer(answerIndex) {
        const question = this.currentTest.questions[this.currentQuestionIndex];
        const correctAnswerText = question.word.meaning;
        const userAnswerText = question.options[answerIndex];
        
        question.userAnswer = answerIndex;
        question.isCorrect = userAnswerText === correctAnswerText;
        
        console.log(`📝 用户选择: ${userAnswerText}, 正确答案: ${correctAnswerText}, 是否正确: ${question.isCorrect}`);
    }

    /**
     * 上一题
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showCurrentQuestion();
        }
    }

    /**
     * 下一题
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentTest.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showCurrentQuestion();
        } else {
            // 已经是最后一题，显示完成按钮
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('finishBtn').style.display = 'block';
        }
    }

    /**
     * 跳过题目
     */
    skipQuestion() {
        const question = this.currentTest.questions[this.currentQuestionIndex];
        question.userAnswer = -1; // 标记为跳过
        question.isCorrect = false;
        
        console.log(`⏭️ 跳过第 ${this.currentQuestionIndex + 1} 题`);
        
        this.nextQuestion();
    }

    /**
     * 更新进度显示
     */
    updateProgress() {
        const current = this.currentQuestionIndex + 1;
        const total = this.currentTest.questions.length;
        const percentage = (current / total) * 100;
        
        document.getElementById('currentQuestion').textContent = current;
        document.getElementById('progressFill').style.width = `${percentage}%`;
    }

    /**
     * 更新按钮状态
     */
    updateButtonStates() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const finishBtn = document.getElementById('finishBtn');
        
        // 上一题按钮
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        // 下一题/完成按钮
        if (this.currentQuestionIndex === this.currentTest.questions.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            finishBtn.style.display = 'none';
        }
    }

    /**
     * 开始计时
     */
    startTimer() {
        let seconds = 0;
        this.testTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            document.getElementById('testTimer').textContent = timeString;
        }, 1000);
    }

    /**
     * 停止计时
     */
    stopTimer() {
        if (this.testTimer) {
            clearInterval(this.testTimer);
            this.testTimer = null;
        }
    }

    /**
     * 完成测试
     */
    finishTest() {
        this.stopTimer();
        
        const endTime = Date.now();
        const totalTime = endTime - this.startTime;
        
        // 计算得分和详细分析
        const result = this.calculateDetailedScore();
        
        // 完善测试结果
        this.currentTest.endTime = new Date();
        this.currentTest.totalTime = totalTime;
        this.currentTest.score = result.score;
        this.currentTest.accuracy = result.accuracy;
        this.currentTest.completed = true;
        this.currentTest.analysis = result.analysis;
        
        // 记录学习会话
        if (window.app && window.app.recordStudySession) {
            window.app.recordStudySession('vocabulary_test', totalTime / 1000, result.accuracy);
        }
        
        // 保存测试历史
        this.saveTestResult();
        
        // 显示测试结果
        this.showEnhancedTestResult(result);
        
        // 移除键盘事件监听器
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
        
        window.logger?.info('测试完成！得分:', result.score);
    }

    /**
     * 计算详细得分和分析
     */
    calculateDetailedScore() {
        const questions = this.currentTest.questions;
        let correctCount = 0;
        let totalTime = 0;
        const errorsByType = {};
        const errorsByDifficulty = {};
        const timeByQuestion = [];
        
        questions.forEach((question, index) => {
            if (question.isCorrect) {
                correctCount++;
            } else {
                // 分析错误类型
                const errorType = question.type || 'unknown';
                errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
                
                // 分析错误难度分布
                const difficulty = question.word?.difficulty || 3;
                errorsByDifficulty[difficulty] = (errorsByDifficulty[difficulty] || 0) + 1;
            }
            
            // 计算答题时间
            const questionTime = question.timeSpent || 0;
            totalTime += questionTime;
            timeByQuestion.push({
                questionIndex: index + 1,
                word: question.word?.word || '',
                time: questionTime,
                isCorrect: question.isCorrect
            });
        });
        
        const score = Math.round((correctCount / questions.length) * 100);
        const accuracy = correctCount / questions.length;
        const avgTimePerQuestion = totalTime / questions.length;
        
        // 生成学习建议
        const suggestions = this.generateStudySuggestions(errorsByType, errorsByDifficulty, avgTimePerQuestion);
        
        // 水平评估
        const levelAssessment = this.assessUserLevel(score, avgTimePerQuestion, errorsByDifficulty);
        
        return {
            score,
            accuracy,
            correctCount,
            totalQuestions: questions.length,
            totalTime,
            avgTimePerQuestion,
            errorsByType,
            errorsByDifficulty,
            timeByQuestion,
            suggestions,
            levelAssessment,
            analysis: {
                strengths: this.identifyStrengths(questions),
                weaknesses: this.identifyWeaknesses(questions),
                improvement: suggestions
            }
        };
    }

    /**
     * 生成学习建议
     */
    generateStudySuggestions(errorsByType, errorsByDifficulty, avgTime) {
        const suggestions = [];
        
        // 基于错误类型的建议
        if (errorsByType.meaning > 0) {
            suggestions.push({
                type: 'meaning',
                priority: 'high',
                title: '词汇意思理解',
                description: '建议加强词汇意思的记忆，可以通过词根词缀学习法提高效率',
                action: '进行更多词汇意思练习'
            });
        }
        
        if (errorsByType.spelling > 0) {
            suggestions.push({
                type: 'spelling',
                priority: 'high',
                title: '单词拼写',
                description: '拼写错误较多，建议通过抄写和默写练习加强记忆',
                action: '进行拼写专项训练'
            });
        }
        
        // 基于答题时间的建议
        if (avgTime > 30000) { // 超过30秒
            suggestions.push({
                type: 'speed',
                priority: 'medium',
                title: '答题速度',
                description: '答题速度较慢，建议增加练习频率，提高词汇熟练度',
                action: '进行快速反应训练'
            });
        }
        
        // 基于难度分布的建议
        const highDifficultyErrors = Object.keys(errorsByDifficulty)
            .filter(key => parseInt(key) >= 5)
            .reduce((sum, key) => sum + errorsByDifficulty[key], 0);
            
        if (highDifficultyErrors > 0) {
            suggestions.push({
                type: 'difficulty',
                priority: 'medium',
                title: '高难度词汇',
                description: '高难度词汇掌握不够，建议循序渐进，先巩固中等难度词汇',
                action: '调整学习难度，重点攻克'
            });
        }
        
        return suggestions;
    }

    /**
     * 评估用户水平
     */
    assessUserLevel(score, avgTime, errorsByDifficulty) {
        let level = 'intermediate';
        let description = '';
        
        if (score >= 90 && avgTime < 15000) {
            level = 'advanced';
            description = '您的词汇水平很高，建议挑战更高难度的词汇';
        } else if (score >= 80 && avgTime < 20000) {
            level = 'upper-intermediate';
            description = '您的词汇基础很好，可以适当增加学习难度';
        } else if (score >= 70) {
            level = 'intermediate';
            description = '您的词汇水平中等，建议继续巩固和扩展';
        } else if (score >= 60) {
            level = 'lower-intermediate';
            description = '您的词汇基础需要加强，建议多做基础练习';
        } else {
            level = 'beginner';
            description = '建议从基础词汇开始，循序渐进地学习';
        }
        
        return { level, description };
    }

    /**
     * 识别优势
     */
    identifyStrengths(questions) {
        const strengths = [];
        const correctByType = {};
        const correctByDifficulty = {};
        
        questions.forEach(q => {
            if (q.isCorrect) {
                const type = q.type || 'unknown';
                const difficulty = q.word?.difficulty || 3;
                
                correctByType[type] = (correctByType[type] || 0) + 1;
                correctByDifficulty[difficulty] = (correctByDifficulty[difficulty] || 0) + 1;
            }
        });
        
        // 找出表现最好的类型
        const bestType = Object.keys(correctByType).reduce((a, b) => 
            correctByType[a] > correctByType[b] ? a : b, 'meaning');
        
        if (correctByType[bestType] > 0) {
            const typeNames = {
                'meaning': '词汇理解',
                'spelling': '拼写能力',
                'usage': '用法掌握'
            };
            strengths.push(`${typeNames[bestType] || bestType}表现优秀`);
        }
        
        return strengths;
    }

    /**
     * 识别弱点
     */
    identifyWeaknesses(questions) {
        const weaknesses = [];
        const errorByType = {};
        
        questions.forEach(q => {
            if (!q.isCorrect) {
                const type = q.type || 'unknown';
                errorByType[type] = (errorByType[type] || 0) + 1;
            }
        });
        
        Object.keys(errorByType).forEach(type => {
            if (errorByType[type] > 1) {
                const typeNames = {
                    'meaning': '词汇理解',
                    'spelling': '拼写能力',
                    'usage': '用法掌握'
                };
                weaknesses.push(`${typeNames[type] || type}需要加强`);
            }
        });
        
        return weaknesses;
    }

    /**
     * 显示增强的测试结果
     */
    showEnhancedTestResult(result) {
        // 隐藏测试界面，显示结果界面
        document.getElementById('testInterface').classList.add('hidden');
        document.getElementById('testResult').classList.remove('hidden');
        
        // 构建结果HTML
        const resultHtml = this.buildEnhancedResultHTML(result);
        document.getElementById('resultContent').innerHTML = resultHtml;
        
        // 绑定结果页面事件
        this.bindResultEvents();
        
        // 添加结果动画
        this.animateResults();
    }

    /**
     * 构建增强的结果HTML
     */
    buildEnhancedResultHTML(result) {
        const { score, correctCount, totalQuestions, totalTime, levelAssessment, suggestions, analysis } = result;
        
        const formatTime = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            return minutes > 0 ? `${minutes}分${seconds % 60}秒` : `${seconds}秒`;
        };
        
        const getScoreColor = (score) => {
            if (score >= 90) return '#28a745';
            if (score >= 80) return '#17a2b8';
            if (score >= 70) return '#ffc107';
            if (score >= 60) return '#fd7e14';
            return '#dc3545';
        };
        
        const getLevelBadge = (level) => {
            const badges = {
                'advanced': { text: '高级', color: '#28a745', icon: '🏆' },
                'upper-intermediate': { text: '中高级', color: '#17a2b8', icon: '🥈' },
                'intermediate': { text: '中级', color: '#ffc107', icon: '🥉' },
                'lower-intermediate': { text: '中低级', color: '#fd7e14', icon: '📚' },
                'beginner': { text: '初级', color: '#dc3545', icon: '🌱' }
            };
            const badge = badges[level] || badges['intermediate'];
            return `<span class="level-badge" style="background-color: ${badge.color}">
                ${badge.icon} ${badge.text}
            </span>`;
        };
        
        return `
            <div class="test-result-enhanced">
                <!-- 主要得分显示 -->
                <div class="score-section">
                    <div class="score-circle" style="border-color: ${getScoreColor(score)}">
                        <div class="score-number" style="color: ${getScoreColor(score)}">${score}</div>
                        <div class="score-label">分</div>
                    </div>
                    <div class="score-details">
                        <div class="score-item">
                            <span class="label">正确率</span>
                            <span class="value">${correctCount}/${totalQuestions}</span>
                        </div>
                        <div class="score-item">
                            <span class="label">用时</span>
                            <span class="value">${formatTime(totalTime)}</span>
                        </div>
                        <div class="score-item">
                            <span class="label">水平评估</span>
                            <span class="value">${getLevelBadge(levelAssessment.level)}</span>
                        </div>
                    </div>
                </div>

                <!-- 详细分析 -->
                <div class="analysis-section">
                    <h3>📊 详细分析</h3>
                    
                    <!-- 优势和弱点 -->
                    <div class="strengths-weaknesses">
                        <div class="strengths">
                            <h4>✅ 优势</h4>
                            <ul>
                                ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                                ${analysis.strengths.length === 0 ? '<li>继续努力，发现更多优势！</li>' : ''}
                            </ul>
                        </div>
                        <div class="weaknesses">
                            <h4>❌ 需改进</h4>
                            <ul>
                                ${analysis.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                                ${analysis.weaknesses.length === 0 ? '<li>表现很好，没有明显弱点！</li>' : ''}
                            </ul>
                        </div>
                    </div>

                    <!-- 学习建议 -->
                    <div class="suggestions-section">
                        <h4>💡 学习建议</h4>
                        <div class="suggestions-grid">
                            ${suggestions.map(suggestion => `
                                <div class="suggestion-card priority-${suggestion.priority}">
                                    <div class="suggestion-header">
                                        <span class="suggestion-title">${suggestion.title}</span>
                                        <span class="suggestion-priority">${
                                            suggestion.priority === 'high' ? '🔴 重要' :
                                            suggestion.priority === 'medium' ? '🟡 中等' : '🟢 一般'
                                        }</span>
                                    </div>
                                    <div class="suggestion-description">${suggestion.description}</div>
                                    <div class="suggestion-action">
                                        <strong>建议行动：</strong>${suggestion.action}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 水平评估说明 -->
                    <div class="level-assessment">
                        <h4>🎯 水平评估</h4>
                        <div class="level-description">
                            ${levelAssessment.description}
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="result-actions">
                    <button class="btn btn-primary" id="retestBtn">
                        🔄 再次测试
                    </button>
                    <button class="btn btn-secondary" id="viewErrorsBtn">
                        📝 查看错题
                    </button>
                    <button class="btn btn-outline" id="backToConfigBtn">
                        ⚙️ 返回设置
                    </button>
                    <button class="btn btn-success" id="startPracticeBtn">
                        📚 开始针对练习
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 添加结果动画
     */
    animateResults() {
        // 分数圆圈动画
        const scoreCircle = document.querySelector('.score-circle');
        if (scoreCircle) {
            scoreCircle.style.transform = 'scale(0)';
            setTimeout(() => {
                scoreCircle.style.transition = 'transform 0.5s ease-out';
                scoreCircle.style.transform = 'scale(1)';
            }, 200);
        }

        // 分析卡片逐个显示
        const cards = document.querySelectorAll('.suggestion-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 500 + index * 100);
        });
    }

    /**
     * 计算得分
     */
    calculateScore() {
        const questions = this.currentTest.questions;
        const total = questions.length;
        let correct = 0;
        let skipped = 0;
        
        questions.forEach(question => {
            if (question.userAnswer === -1) {
                skipped++;
            } else if (question.isCorrect) {
                correct++;
            }
        });
        
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const score = Math.round((correct / total) * 100);
        
        return {
            total,
            correct,
            incorrect: total - correct - skipped,
            skipped,
            accuracy,
            score,
            totalTime: this.currentTest.totalTime || 0
        };
    }

    /**
     * 显示测试结果
     */
    showTestResult(result) {
        document.getElementById('testInterface').classList.add('hidden');
        document.getElementById('testResult').classList.remove('hidden');
        
        const resultHtml = this.buildResultHTML(result);
        document.getElementById('testResult').innerHTML = resultHtml;
        
        // 绑定结果页面事件
        this.bindResultEvents();
    }

    /**
     * 构建结果HTML
     */
    buildResultHTML(result) {
        const examTypeNames = {
            'cet4': 'CET-4',
            'cet6': 'CET-6',
            'tem4': 'TEM-4',
            'tem8': 'TEM-8',
            'ielts': 'IELTS',
            'toefl': 'TOEFL',
            'gre': 'GRE'
        };

        const examTypeName = examTypeNames[this.testConfig.examType] || this.testConfig.examType.toUpperCase();
        const minutes = Math.floor(result.totalTime / 60000);
        const seconds = Math.floor((result.totalTime % 60000) / 1000);
        
        let performanceMessage = '';
        let performanceClass = '';
        
        if (result.accuracy >= 90) {
            performanceMessage = '优秀！您的词汇掌握程度很高！';
            performanceClass = 'excellent';
        } else if (result.accuracy >= 80) {
            performanceMessage = '良好！继续加油！';
            performanceClass = 'good';
        } else if (result.accuracy >= 70) {
            performanceMessage = '及格！还需要继续努力！';
            performanceClass = 'pass';
        } else {
            performanceMessage = '需要加强！建议多多练习！';
            performanceClass = 'need-improvement';
        }

        return `
            <div class="result-header">
                <div class="result-score ${performanceClass}">${result.score}分</div>
                <div class="result-title">${examTypeName} 词汇测试完成</div>
                <div class="result-subtitle">${performanceMessage}</div>
            </div>
            
            <div class="result-stats">
                <div class="stat-item">
                    <span class="stat-value">${result.correct}</span>
                    <span class="stat-label">答对题数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.incorrect}</span>
                    <span class="stat-label">答错题数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.skipped}</span>
                    <span class="stat-label">跳过题数</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.accuracy}%</span>
                    <span class="stat-label">正确率</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${minutes}:${seconds.toString().padStart(2, '0')}</span>
                    <span class="stat-label">用时</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${result.total}</span>
                    <span class="stat-label">题目总数</span>
                </div>
            </div>
            
            <div class="result-actions">
                <button class="btn btn-primary" id="retestBtn">重新测试</button>
                <button class="btn btn-outline-primary" id="viewErrorsBtn">查看错题</button>
                <button class="btn btn-outline-secondary" id="backToConfigBtn">返回配置</button>
            </div>
        `;
    }

    /**
     * 绑定结果页面事件
     */
    bindResultEvents() {
        const retestBtn = document.getElementById('retestBtn');
        if (retestBtn) {
            retestBtn.addEventListener('click', () => {
                this.startTest();
            });
        }

        const viewErrorsBtn = document.getElementById('viewErrorsBtn');
        if (viewErrorsBtn) {
            viewErrorsBtn.addEventListener('click', () => {
                this.showErrorAnalysis();
            });
        }

        const backToConfigBtn = document.getElementById('backToConfigBtn');
        if (backToConfigBtn) {
            backToConfigBtn.addEventListener('click', () => {
                this.backToConfig();
            });
        }
    }

    /**
     * 显示错题分析
     */
    showErrorAnalysis() {
        const wrongAnswers = this.currentTest.answers.filter(answer => !answer.correct);
        
        if (wrongAnswers.length === 0) {
            this.showNotification('恭喜！没有错题需要分析', 'success');
            return;
        }

        // 创建错题分析弹窗
        const modal = document.createElement('div');
        modal.className = 'modal fade show';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">📊 错题分析</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="error-summary mb-4">
                            <h6>📈 统计概览</h6>
                            <p>错题数量: <span class="text-danger">${wrongAnswers.length}</span> / ${this.currentTest.answers.length}</p>
                            <p>错误率: <span class="text-danger">${Math.round((wrongAnswers.length / this.currentTest.answers.length) * 100)}%</span></p>
                        </div>
                        <div class="error-details">
                            <h6>❌ 详细分析</h6>
                            ${wrongAnswers.map((answer, index) => `
                                <div class="error-item card mb-3">
                                    <div class="card-body">
                                        <h6 class="card-title">第 ${answer.questionIndex + 1} 题</h6>
                                        <p><strong>单词:</strong> ${answer.question.word}</p>
                                        <p><strong>正确释义:</strong> <span class="text-success">${answer.question.meaning}</span></p>
                                        <p><strong>你的答案:</strong> <span class="text-danger">${answer.userAnswer}</span></p>
                                        <p><strong>分析:</strong> ${this.generateErrorAnalysis(answer)}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="window.vocabTestManager.addErrorsToReview(); this.closest('.modal').remove();">
                            加入复习计划
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * 生成错题分析 - 新功能
     */
    generateErrorAnalysis(answer) {
        const analyses = [
            '建议重点记忆这个单词的释义',
            '可能是对相似单词产生了混淆',
            '建议多做相关练习巩固记忆',
            '注意区分词性和语境用法',
            '可以通过造句练习加深印象'
        ];
        
        return analyses[Math.floor(Math.random() * analyses.length)];
    }

    /**
     * 将错题加入复习计划 - 新功能
     */
    addErrorsToReview() {
        const wrongAnswers = this.currentTest.answers.filter(answer => !answer.correct);
        const errorWords = wrongAnswers.map(answer => answer.question.word);
        
        // 保存到错题本
        let errorBook = JSON.parse(localStorage.getItem('vocabulary_error_book') || '[]');
        errorWords.forEach(word => {
            if (!errorBook.some(item => item.word === word)) {
                errorBook.push({
                    word: word,
                    addedDate: new Date().toISOString(),
                    reviewCount: 0,
                    lastReview: null
                });
            }
        });
        
        localStorage.setItem('vocabulary_error_book', JSON.stringify(errorBook));
        this.showNotification(`已将 ${errorWords.length} 个错题加入复习计划`, 'success');
    }

    /**
     * 返回配置页面
     */
    backToConfig() {
        document.getElementById('testResult').classList.add('hidden');
        document.getElementById('testConfig').classList.remove('hidden');
        
        // 清理当前测试
        this.currentTest = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        
        // 更新历史记录显示
        this.updateTestHistoryDisplay();
    }

    /**
     * 保存测试结果
     */
    saveTestResult() {
        if (!this.currentTest) return;
        
        try {
            this.testHistory.unshift({
                id: this.currentTest.id,
                examType: this.currentTest.config.examType,
                testMode: this.currentTest.config.testMode,
                difficulty: this.currentTest.config.difficulty,
                questionCount: this.currentTest.config.questionCount,
                score: this.currentTest.score,
                accuracy: this.currentTest.accuracy,
                totalTime: this.currentTest.totalTime,
                date: this.currentTest.endTime,
                completed: this.currentTest.completed
            });

            // 只保留最近的50次测试记录
            if (this.testHistory.length > 50) {
                this.testHistory = this.testHistory.slice(0, 50);
            }

            // 保存到本地存储
            localStorage.setItem('vocabularyTestHistory', JSON.stringify(this.testHistory));
            
            console.log('💾 测试结果已保存');

        } catch (error) {
            console.error('❌ 保存测试结果失败:', error);
        }
    }

    /**
     * 加载测试历史
     */
    loadTestHistory() {
        try {
            const saved = localStorage.getItem('vocabularyTestHistory');
            if (saved) {
                this.testHistory = JSON.parse(saved);
                console.log(`📚 加载了 ${this.testHistory.length} 条测试历史记录`);
            }
            
            // 更新历史记录显示
            this.updateTestHistoryDisplay();

        } catch (error) {
            console.error('❌ 加载测试历史失败:', error);
            this.testHistory = [];
        }
    }

    /**
     * 更新测试历史显示
     */
    updateTestHistoryDisplay() {
        const historyContainer = document.getElementById('testHistory');
        if (!historyContainer) return;

        if (this.testHistory.length === 0) {
            historyContainer.innerHTML = '<p class="no-history">暂无测试记录</p>';
            return;
        }

        const examTypeNames = {
            'cet4': 'CET-4',
            'cet6': 'CET-6', 
            'tem4': 'TEM-4',
            'tem8': 'TEM-8',
            'ielts': 'IELTS',
            'toefl': 'TOEFL',
            'gre': 'GRE'
        };

        const historyHtml = this.testHistory.slice(0, 10).map(test => {
            const examName = examTypeNames[test.examType] || test.examType.toUpperCase();
            const date = new Date(test.date).toLocaleDateString('zh-CN');
            const time = new Date(test.date).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });

            return `
                <div class="history-item" data-test-id="${test.id}">
                    <div class="history-info">
                        <div class="history-exam">${examName} - ${test.questionCount}题</div>
                        <div class="history-details">${date} ${time} | 正确率: ${test.accuracy}%</div>
                    </div>
                    <div class="history-score">${test.score}分</div>
                </div>
            `;
        }).join('');

        historyContainer.innerHTML = historyHtml;
    }

    /**
     * 生成测试ID
     */
    generateTestId() {
        return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 获取测试历史记录
     */
    getTestHistory() {
        return this.testHistory || [];
    }

    /**
     * 获取测试统计信息
     */
    getStats() {
        const history = this.getTestHistory();
        if (history.length === 0) {
            return {
                totalTests: 0,
                averageAccuracy: 0,
                totalTime: 0,
                bestScore: 0,
                recentTests: []
            };
        }

        const totalTests = history.length;
        const totalAccuracy = history.reduce((sum, test) => sum + (test.accuracy || 0), 0);
        const averageAccuracy = Math.round(totalAccuracy / totalTests);
        const totalTime = history.reduce((sum, test) => sum + (test.totalTime || 0), 0);
        const bestScore = Math.max(...history.map(test => test.score || 0));
        const recentTests = history.slice(0, 5); // 最近5次测试

        return {
            totalTests,
            averageAccuracy,
            totalTime: Math.round(totalTime / 60), // 转换为分钟
            bestScore,
            recentTests,
            streakDays: this.calculateTestStreak()
        };
    }

    /**
     * 计算测试连击天数
     */
    calculateTestStreak() {
        const history = this.getTestHistory();
        if (history.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) { // 检查最近30天
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toDateString();
            
            const hasTest = history.some(test => 
                new Date(test.date).toDateString() === dateStr
            );
            
            if (hasTest) {
                streak++;
            } else if (i > 0) { // 如果不是今天且没有测试记录，则中断连击
                break;
            }
        }
        
        return streak;
    }

    /**
     * 重置测试进度数据
     */
    resetProgress() {
        this.testHistory = [];
        localStorage.removeItem('vocab_test_history');
        console.log('✅ 词汇测试进度已重置');
        return true;
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vocab-test')) {
        window.vocabularyTestManager = new VocabularyTestManager();
        console.log('✅ 词汇测试管理器已全局初始化');
    }
});
