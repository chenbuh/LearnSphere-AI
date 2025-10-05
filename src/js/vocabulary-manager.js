/**
 * 词汇学习管理器
 * 提供词汇学习、测试、进度跟踪等功能
 */

class VocabularyManager {
    constructor() {
        this.currentWordList = [];
        this.learningSession = null;
        this.userProgress = {};
        
        // 性能优化：缓存和批处理
        this.wordCache = new Map();
        this.batchSize = 50; // 批处理大小
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存过期
        
        // 防抖操作
        this.debouncedSave = Utils.debounce(this.saveProgressToStorage.bind(this), 1000);
        
        this.init();
    }

    async init() {
        window.logger?.info('初始化词汇学习管理器...');
        
        try {
            // 加载用户词汇进度
            await this.loadUserProgress();
            
            // 设置事件监听
            this.setupEventListeners();
            
            // 监听词汇数据库加载完成事件
            document.addEventListener('vocabularyDatabaseLoaded', () => {
                window.logger?.info('词汇数据库已加载，词汇管理器就绪');
            });
            
            // 尝试初始化词汇数据库
            this.ensureVocabularyDatabase();
            
            // 测试获取推荐词汇以验证修复（使用requestIdleCallback优化性能）
            if (window.requestIdleCallback) {
                requestIdleCallback(() => {
                    this.validateVocabularyFunction();
                });
            } else {
                setTimeout(() => {
                    this.validateVocabularyFunction();
                }, 500);
            }
            
            window.logger?.info('词汇学习管理器初始化完成');
        } catch (error) {
            window.logger?.error('词汇学习管理器初始化失败:', error);
        }
    }

    /**
     * 验证词汇功能
     */
    validateVocabularyFunction() {
        const testWords = this.getRecommendedWords('cet4', null, 5);
        window.logger?.debug('测试获取推荐词汇结果:', testWords.length, '个词汇');
        if (testWords.length > 0) {
            window.logger?.info('词汇获取功能正常工作');
        } else {
            window.logger?.warn('词汇获取功能可能存在问题');
        }
    }

    /**
     * 加载用户词汇进度
     */
    async loadUserProgress() {
        try {
            const defaultProgress = {
                learned: new Set(),
                mastered: new Set(),
                reviewing: new Set(),
                failed: new Set(),
                lastStudied: {},
                studyStreak: 0,
                totalStudyTime: 0
            };
            
            this.userProgress = await Storage.get('vocabulary_progress', defaultProgress) || defaultProgress;

            // 将Set转换回来（存储时会序列化）
            if (Array.isArray(this.userProgress.learned)) {
                this.userProgress.learned = new Set(this.userProgress.learned);
            } else if (!this.userProgress.learned) {
                this.userProgress.learned = new Set();
            }
            
            if (Array.isArray(this.userProgress.mastered)) {
                this.userProgress.mastered = new Set(this.userProgress.mastered);
            } else if (!this.userProgress.mastered) {
                this.userProgress.mastered = new Set();
            }
            
            if (Array.isArray(this.userProgress.reviewing)) {
                this.userProgress.reviewing = new Set(this.userProgress.reviewing);
            } else if (!this.userProgress.reviewing) {
                this.userProgress.reviewing = new Set();
            }
            
            if (Array.isArray(this.userProgress.failed)) {
                this.userProgress.failed = new Set(this.userProgress.failed);
            } else if (!this.userProgress.failed) {
                this.userProgress.failed = new Set();
            }
            
            // 确保其他属性也有默认值
            this.userProgress.lastStudied = this.userProgress.lastStudied || {};
            this.userProgress.studyStreak = this.userProgress.studyStreak || 0;
            this.userProgress.totalStudyTime = this.userProgress.totalStudyTime || 0;

            window.logger?.info('用户词汇进度已加载');
        } catch (error) {
            window.logger?.error('加载词汇进度失败:', error);
        }
    }

    /**
     * 保存用户词汇进度
     */
    async saveUserProgress() {
        try {
            // 将Set转换为数组以便存储
            const progressToSave = {
                ...this.userProgress,
                learned: Array.from(this.userProgress.learned),
                mastered: Array.from(this.userProgress.mastered),
                reviewing: Array.from(this.userProgress.reviewing),
                failed: Array.from(this.userProgress.failed)
            };

            await Storage.set('vocabulary_progress', progressToSave);
            console.log('💾 词汇进度已保存');
        } catch (error) {
            console.error('保存词汇进度失败:', error);
        }
    }

    /**
     * 确保词汇数据库已加载
     */
    ensureVocabularyDatabase() {
        console.log('🔍 检查词汇数据库状态...');
        console.log('window.vocabularyDatabase:', !!window.vocabularyDatabase);
        console.log('VocabularyDatabase类型:', typeof VocabularyDatabase);
        console.log('document.readyState:', document.readyState);

        // 检查是否已经存在
        if (window.vocabularyDatabase && window.vocabularyDatabase.getVocabularyByExam) {
            console.log('✅ 词汇数据库已存在并可用');
            return true;
        }

        // 尝试初始化
        if (typeof VocabularyDatabase !== 'undefined') {
            try {
                console.log('🔄 尝试初始化词汇数据库...');
                window.vocabularyDatabase = new VocabularyDatabase();
                const isValid = window.vocabularyDatabase && typeof window.vocabularyDatabase.getVocabularyByExam === 'function';
                
                if (isValid) {
                    console.log('✅ 词汇数据库已成功初始化，词汇数量:', window.vocabularyDatabase.getTotalWordCount());
                    return true;
                } else {
                    console.error('❌ 词汇数据库初始化后无效');
                    return false;
                }
            } catch (error) {
                console.error('❌ 词汇数据库初始化失败:', error);
                return false;
            }
        }

        console.warn('⚠️ VocabularyDatabase类不可用, typeof:', typeof VocabularyDatabase);
        
        // 最后一次尝试：等待一小段时间后重试（有次数限制）
        if (!this.retryCount) {
            this.retryCount = 0;
        }
        
        if (this.retryCount < 3) {
            this.retryCount++;
            console.log(`🔄 延迟重试初始化词汇数据库... (${this.retryCount}/3)`);
            setTimeout(() => {
                this.ensureVocabularyDatabase();
            }, 200);
        } else {
            console.warn('⚠️ 词汇数据库重试次数已达上限，将使用默认词汇');
        }
        
        return false;
    }

    /**
     * 强制初始化词汇数据库
     */
    forceInitializeVocabularyDatabase() {
        console.log('🚀 强制初始化词汇数据库...');
        
        try {
            // 清除现有实例
            window.vocabularyDatabase = null;
            
            // 检查全局函数是否存在
            if (typeof window.initializeVocabularyDatabase === 'function') {
                console.log('🔄 调用全局初始化函数...');
                window.initializeVocabularyDatabase();
            }
            
            // 直接创建实例
            if (typeof VocabularyDatabase !== 'undefined') {
                window.vocabularyDatabase = new VocabularyDatabase();
                console.log('✅ 强制初始化成功');
                return true;
            }
            
            console.error('❌ VocabularyDatabase类仍然不可用');
            return false;
        } catch (error) {
            console.error('❌ 强制初始化失败:', error);
            return false;
        }
    }

    /**
     * 获取默认词汇（备用方案）
     */
    getDefaultVocabulary(examType, count = 20) {
        const defaultVocabulary = {
            cet4: [
                { word: "ability", meaning: "能力", phonetic: "/əˈbɪləti/", difficulty: 2, category: "noun", examType: "cet4" },
                { word: "about", meaning: "关于", phonetic: "/əˈbaʊt/", difficulty: 1, category: "preposition", examType: "cet4" },
                { word: "accept", meaning: "接受", phonetic: "/əkˈsept/", difficulty: 2, category: "verb", examType: "cet4" },
                { word: "account", meaning: "账户", phonetic: "/əˈkaʊnt/", difficulty: 2, category: "noun", examType: "cet4" },
                { word: "achieve", meaning: "达到", phonetic: "/əˈtʃiːv/", difficulty: 2, category: "verb", examType: "cet4" },
                { word: "across", meaning: "穿过", phonetic: "/əˈkrɒs/", difficulty: 1, category: "preposition", examType: "cet4" },
                { word: "action", meaning: "行动", phonetic: "/ˈækʃən/", difficulty: 1, category: "noun", examType: "cet4" },
                { word: "activity", meaning: "活动", phonetic: "/ækˈtɪvɪti/", difficulty: 1, category: "noun", examType: "cet4" },
                { word: "actually", meaning: "实际上", phonetic: "/ˈæktʃuəli/", difficulty: 1, category: "adverb", examType: "cet4" },
                { word: "address", meaning: "地址", phonetic: "/əˈdres/", difficulty: 1, category: "noun", examType: "cet4" },
                { word: "advance", meaning: "前进", phonetic: "/ədˈvɑːns/", difficulty: 2, category: "verb", examType: "cet4" },
                { word: "advantage", meaning: "优势", phonetic: "/ədˈvɑːntɪdʒ/", difficulty: 2, category: "noun", examType: "cet4" },
                { word: "advice", meaning: "建议", phonetic: "/ədˈvaɪs/", difficulty: 1, category: "noun", examType: "cet4" },
                { word: "affect", meaning: "影响", phonetic: "/əˈfekt/", difficulty: 2, category: "verb", examType: "cet4" },
                { word: "afford", meaning: "负担得起", phonetic: "/əˈfɔːrd/", difficulty: 2, category: "verb", examType: "cet4" },
                { word: "afraid", meaning: "害怕的", phonetic: "/əˈfreɪd/", difficulty: 1, category: "adjective", examType: "cet4" },
                { word: "against", meaning: "反对", phonetic: "/əˈɡenst/", difficulty: 1, category: "preposition", examType: "cet4" },
                { word: "agree", meaning: "同意", phonetic: "/əˈɡriː/", difficulty: 1, category: "verb", examType: "cet4" },
                { word: "ahead", meaning: "在前面", phonetic: "/əˈhed/", difficulty: 1, category: "adverb", examType: "cet4" },
                { word: "allow", meaning: "允许", phonetic: "/əˈlaʊ/", difficulty: 1, category: "verb", examType: "cet4" }
            ],
            cet6: [
                { word: "abandon", meaning: "放弃", phonetic: "/əˈbændən/", difficulty: 3, category: "verb", examType: "cet6" },
                { word: "abstract", meaning: "抽象的", phonetic: "/ˈæbstrækt/", difficulty: 4, category: "adjective", examType: "cet6" },
                { word: "academic", meaning: "学术的", phonetic: "/ˌækəˈdemɪk/", difficulty: 3, category: "adjective", examType: "cet6" },
                { word: "accelerate", meaning: "加速", phonetic: "/əkˈseləreɪt/", difficulty: 4, category: "verb", examType: "cet6" },
                { word: "accessible", meaning: "可接近的", phonetic: "/əkˈsesəbəl/", difficulty: 4, category: "adjective", examType: "cet6" },
                { word: "accommodate", meaning: "容纳", phonetic: "/əˈkɑːmədeɪt/", difficulty: 4, category: "verb", examType: "cet6" },
                { word: "accurate", meaning: "准确的", phonetic: "/ˈækjərət/", difficulty: 3, category: "adjective", examType: "cet6" },
                { word: "acquire", meaning: "获得", phonetic: "/əˈkwaɪər/", difficulty: 4, category: "verb", examType: "cet6" },
                { word: "adequate", meaning: "足够的", phonetic: "/ˈædɪkwət/", difficulty: 4, category: "adjective", examType: "cet6" },
                { word: "adjacent", meaning: "相邻的", phonetic: "/əˈdʒeɪsənt/", difficulty: 4, category: "adjective", examType: "cet6" }
            ],
            ielts: [
                { word: "acknowledge", meaning: "承认", phonetic: "/əkˈnɑːlɪdʒ/", difficulty: 4, category: "verb", examType: "ielts" },
                { word: "appropriate", meaning: "合适的", phonetic: "/əˈproʊpriət/", difficulty: 4, category: "adjective", examType: "ielts" },
                { word: "approximately", meaning: "大约", phonetic: "/əˈprɑːksɪmətli/", difficulty: 4, category: "adverb", examType: "ielts" },
                { word: "argument", meaning: "论点", phonetic: "/ˈɑːrɡjumənt/", difficulty: 3, category: "noun", examType: "ielts" },
                { word: "assess", meaning: "评估", phonetic: "/əˈses/", difficulty: 4, category: "verb", examType: "ielts" }
            ],
            toefl: [
                { word: "analyze", meaning: "分析", phonetic: "/ˈænəlaɪz/", difficulty: 4, category: "verb", examType: "toefl" },
                { word: "approach", meaning: "方法", phonetic: "/əˈproʊtʃ/", difficulty: 3, category: "noun", examType: "toefl" },
                { word: "aspect", meaning: "方面", phonetic: "/ˈæspekt/", difficulty: 3, category: "noun", examType: "toefl" },
                { word: "assume", meaning: "假设", phonetic: "/əˈsuːm/", difficulty: 4, category: "verb", examType: "toefl" },
                { word: "available", meaning: "可用的", phonetic: "/əˈveɪləbəl/", difficulty: 3, category: "adjective", examType: "toefl" }
            ]
        };

        const words = defaultVocabulary[examType] || defaultVocabulary.cet4;
        return words.slice(0, count);
    }

    /**
     * 根据考试类型获取推荐词汇
     */
    getRecommendedWords(examType, difficulty = null, count = 20) {
        console.log('📚 getRecommendedWords 被调用，examType:', examType);
        
        // 确保词汇数据库已加载
        if (!this.ensureVocabularyDatabase()) {
            console.warn('⚠️ 首次检查失败，尝试强制初始化...');
            
            // 尝试强制初始化
            if (this.forceInitializeVocabularyDatabase() && this.ensureVocabularyDatabase()) {
                console.log('✅ 强制初始化成功，继续获取词汇');
            } else {
                console.warn('⚠️ 所有初始化尝试都失败，使用默认词汇');
                return this.getDefaultVocabulary(examType, count);
            }
        }

        let words = window.vocabularyDatabase.getVocabularyByExam(examType);
        
        if (difficulty) {
            words = words.filter(word => word.difficulty <= difficulty);
        }

        // 过滤掉已掌握的词汇
        words = words.filter(word => !this.userProgress.mastered.has(word.word));

        // 优先返回失败过的词汇进行复习
        const failedWords = words.filter(word => this.userProgress.failed.has(word.word));
        const newWords = words.filter(word => 
            !this.userProgress.learned.has(word.word) && 
            !this.userProgress.failed.has(word.word)
        );

        // 组合词汇：1/3失败词汇，2/3新词汇
        const result = [];
        const failedCount = Math.min(failedWords.length, Math.floor(count / 3));
        const newCount = count - failedCount;

        result.push(...failedWords.slice(0, failedCount));
        result.push(...newWords.slice(0, newCount));

        // 基于单词内容的确定性排序
        return result.sort((a, b) => {
            const aHash = this.getWordHash(a);
            const bHash = this.getWordHash(b);
            return aHash - bHash;
        });
    }

    /**
     * 基于单词内容生成哈希值
     */
    getWordHash(word) {
        if (!word || !word.word) return 0;
        
        let hash = 0;
        const str = word.word + (word.meaning || '');
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }

    /**
     * 开始学习会话
     */
    startLearningSession(words, sessionType = 'learning') {
        this.learningSession = {
            id: `session_${Date.now()}`,
            type: sessionType,
            words: [...words],
            currentIndex: 0,
            startTime: Date.now(),
            results: [],
            totalTime: 0
        };

        console.log(`📖 开始${sessionType}会话，共${words.length}个单词`);
        return this.learningSession;
    }

    /**
     * 获取当前学习单词
     */
    getCurrentWord() {
        if (!this.learningSession || this.learningSession.currentIndex >= this.learningSession.words.length) {
            return null;
        }

        return this.learningSession.words[this.learningSession.currentIndex];
    }

    /**
     * 记录学习结果
     */
    recordLearningResult(word, isCorrect, timeSpent, attempts = 1) {
        if (!this.learningSession) {
            console.error('没有活跃的学习会话');
            return;
        }

        const result = {
            word: word.word,
            isCorrect,
            timeSpent,
            attempts,
            timestamp: Date.now()
        };

        this.learningSession.results.push(result);
        this.learningSession.totalTime += timeSpent;

        // 更新用户进度
        this.updateWordProgress(word, isCorrect, attempts);

        // 移动到下一个单词
        this.learningSession.currentIndex++;

        console.log(`📝 记录学习结果: ${word.word} - ${isCorrect ? '正确' : '错误'}`);
    }

    /**
     * 更新单词进度
     */
    updateWordProgress(word, isCorrect, attempts) {
        const wordText = word.word;

        // 更新最后学习时间
        this.userProgress.lastStudied[wordText] = Date.now();

        if (isCorrect) {
            if (attempts === 1) {
                // 一次正确，标记为已学习
                this.userProgress.learned.add(wordText);
                
                // 如果之前失败过，从失败集合中移除
                this.userProgress.failed.delete(wordText);
                
                // 检查是否可以标记为掌握
                if (this.isWordMastered(wordText)) {
                    this.userProgress.mastered.add(wordText);
                    this.userProgress.learned.delete(wordText);
                    this.userProgress.reviewing.delete(wordText);
                }
            } else {
                // 多次尝试后正确，标记为需要复习
                this.userProgress.reviewing.add(wordText);
                this.userProgress.failed.delete(wordText);
            }
        } else {
            // 答错了，标记为失败
            this.userProgress.failed.add(wordText);
            this.userProgress.mastered.delete(wordText);
        }

        // 保存进度
        this.saveUserProgress();
    }

    /**
     * 判断单词是否已掌握
     */
    isWordMastered(wordText) {
        // 简单的掌握判断逻辑：
        // 1. 在已学习集合中
        // 2. 最近7天内没有答错
        // 3. 累计正确次数 >= 3
        
        if (!this.userProgress.learned.has(wordText)) {
            return false;
        }

        const lastStudied = this.userProgress.lastStudied[wordText];
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        // 简化判断：如果学会了且不在失败集合中，就认为掌握了
        return !this.userProgress.failed.has(wordText) && lastStudied > weekAgo;
    }

    /**
     * 完成学习会话
     */
    finishLearningSession() {
        if (!this.learningSession) {
            console.error('没有活跃的学习会话');
            return null;
        }

        const session = this.learningSession;
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;

        // 计算会话统计
        const stats = this.calculateSessionStats(session);

        // 更新总学习时间
        this.userProgress.totalStudyTime += session.totalTime;

        // 记录学习活动
        this.recordLearningActivity(session, stats);

        // 记录学习会话到应用级别
        if (window.app && window.app.recordStudySession) {
            window.app.recordStudySession('vocabulary', session.duration / 1000, stats.accuracy);
        }

        // 清除当前会话
        this.learningSession = null;

        console.log('✅ 学习会话已完成', stats);
        return { session, stats };
    }

    /**
     * 计算会话统计
     */
    calculateSessionStats(session) {
        const results = session.results;
        const totalWords = results.length;
        const correctCount = results.filter(r => r.isCorrect).length;
        const accuracy = totalWords > 0 ? (correctCount / totalWords) * 100 : 0;
        const avgTime = totalWords > 0 ? session.totalTime / totalWords : 0;

        return {
            totalWords,
            correctCount,
            incorrectCount: totalWords - correctCount,
            accuracy: Math.round(accuracy),
            totalTime: session.totalTime,
            averageTime: Math.round(avgTime),
            sessionDuration: session.duration
        };
    }

    /**
     * 记录学习活动
     */
    async recordLearningActivity(session, stats) {
        try {
            const activity = {
                module: 'vocabulary',
                type: session.type,
                duration: session.duration,
                wordsStudied: stats.totalWords,
                accuracy: stats.accuracy,
                score: Math.round(stats.accuracy),
                xpEarned: this.calculateXP(stats),
                details: {
                    correctCount: stats.correctCount,
                    incorrectCount: stats.incorrectCount,
                    averageTime: stats.averageTime,
                    sessionType: session.type
                }
            };

            await Storage.addLearningActivity(activity);
            console.log('📊 学习活动已记录');
        } catch (error) {
            console.error('记录学习活动失败:', error);
        }
    }

    /**
     * 计算经验值
     */
    calculateXP(stats) {
        let xp = stats.correctCount * 5; // 每个正确答案5分
        
        // 准确率奖励
        if (stats.accuracy >= 90) xp += 20;
        else if (stats.accuracy >= 80) xp += 10;
        else if (stats.accuracy >= 70) xp += 5;

        // 连续学习奖励
        if (stats.totalWords >= 20) xp += 10;
        if (stats.totalWords >= 50) xp += 20;

        return xp;
    }

    /**
     * 获取复习单词
     */
    getReviewWords(count = 10) {
        if (!this.ensureVocabularyDatabase()) {
            console.warn('词汇数据库不可用，返回默认复习词汇');
            return this.getDefaultVocabulary('cet4', count);
        }

        const reviewWords = [];
        const allWords = Object.values(window.vocabularyDatabase.vocabularyData).flat();

        // 获取需要复习的单词
        const wordsToReview = allWords.filter(word => 
            this.userProgress.reviewing.has(word.word) || 
            this.userProgress.failed.has(word.word)
        );

        // 按最后学习时间排序，优先复习很久没学的
        wordsToReview.sort((a, b) => {
            const timeA = this.userProgress.lastStudied[a.word] || 0;
            const timeB = this.userProgress.lastStudied[b.word] || 0;
            return timeA - timeB;
        });

        return wordsToReview.slice(0, count);
    }

    /**
     * 生成词汇测试
     */
    generateVocabularyTest(examType, difficulty = null, count = 20) {
        const words = this.getRecommendedWords(examType, difficulty, count);
        
        return words.map(word => {
            // 基于单词长度决定测试类型
            const testType = word.word.length % 2 === 0 ? 'meaning' : 'spelling';
            
            if (testType === 'meaning') {
                // 选择题：给单词选择意思
                const correctMeaning = word.meaning;
                const wrongOptions = this.generateWrongOptions(word, 'meaning', 3);
                // 基于选项内容的确定性排序
                const options = [correctMeaning, ...wrongOptions].sort((a, b) => {
                    return a.length - b.length || a.localeCompare(b);
                });
                
                return {
                    type: 'multiple_choice',
                    question: `"${word.word}" 的意思是：`,
                    word: word.word,
                    phonetic: word.phonetic,
                    options,
                    correctAnswer: correctMeaning,
                    category: word.category,
                    difficulty: word.difficulty
                };
            } else {
                // 填空题：给意思写单词
                return {
                    type: 'fill_blank',
                    question: `请写出意思为"${word.meaning}"的单词：`,
                    correctAnswer: word.word,
                    phonetic: word.phonetic,
                    meaning: word.meaning,
                    category: word.category,
                    difficulty: word.difficulty
                };
            }
        });
    }

    /**
     * 获取默认错误选项（备用方案）
     */
    getDefaultWrongOptions(correctWord, type, count) {
        const defaultOptions = {
            meaning: [
                "学习", "工作", "生活", "思考", "问题", "方法", "时间", "地方", "人们", "社会",
                "发展", "教育", "文化", "经济", "政治", "技术", "环境", "健康", "安全", "未来"
            ],
            word: [
                "study", "work", "life", "think", "problem", "method", "time", "place", "people", "society",
                "develop", "education", "culture", "economy", "politics", "technology", "environment", "health", "safety", "future"
            ]
        };

        const options = defaultOptions[type] || defaultOptions.meaning;
        const wrongOptions = [];
        const used = new Set([correctWord[type]]);

        for (const option of options) {
            if (wrongOptions.length >= count) break;
            if (!used.has(option)) {
                wrongOptions.push(option);
                used.add(option);
            }
        }

        return wrongOptions.slice(0, count);
    }

    /**
     * 生成错误选项
     */
    generateWrongOptions(correctWord, type, count) {
        if (!this.ensureVocabularyDatabase()) {
            console.warn('词汇数据库不可用，返回默认错误选项');
            return this.getDefaultWrongOptions(correctWord, type, count);
        }

        const allWords = Object.values(window.vocabularyDatabase.vocabularyData).flat();
        const sameCategory = allWords.filter(word => 
            word.category === correctWord.category && 
            word.word !== correctWord.word
        );

        const options = [];
        const used = new Set([correctWord[type]]);

        // 优先从同词性中选择
        for (const word of sameCategory) {
            if (options.length >= count) break;
            if (!used.has(word[type])) {
                options.push(word[type]);
                used.add(word[type]);
            }
        }

        // 如果同词性不够，从其他词汇中选择
        if (options.length < count) {
            for (const word of allWords) {
                if (options.length >= count) break;
                if (!used.has(word[type])) {
                    options.push(word[type]);
                    used.add(word[type]);
                }
            }
        }

        return options.slice(0, count);
    }

    /**
     * 获取学习统计
     */
    getLearningStats() {
        // 确保所有属性都已初始化
        const learned = this.userProgress.learned || new Set();
        const mastered = this.userProgress.mastered || new Set();
        const reviewing = this.userProgress.reviewing || new Set();
        const failed = this.userProgress.failed || new Set();
        
        return {
            totalLearned: learned.size,
            totalMastered: mastered.size,
            totalReviewing: reviewing.size,
            totalFailed: failed.size,
            studyStreak: this.userProgress.studyStreak || 0,
            totalStudyTime: this.userProgress.totalStudyTime || 0,
            masteryRate: learned.size > 0 ? 
                (mastered.size / learned.size) * 100 : 0
        };
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 监听考试类型变化
        document.addEventListener('examTypeChanged', (event) => {
            console.log('📚 考试类型已变化，更新词汇推荐');
            this.updateVocabularyRecommendations(event.detail.examType);
        });

        // 监听学习完成事件
        document.addEventListener('learningCompleted', (event) => {
            this.handleLearningCompleted(event.detail);
        });
    }

    /**
     * 更新词汇推荐
     */
    updateVocabularyRecommendations(examType) {
        // 这里可以根据考试类型更新推荐词汇
        const recommendedWords = this.getRecommendedWords(examType, null, 10);
        
        // 触发词汇推荐更新事件
        const event = new CustomEvent('vocabularyRecommendationsUpdated', {
            detail: { examType, words: recommendedWords }
        });
        document.dispatchEvent(event);
    }

    /**
     * 重置词汇学习进度
     */
    async resetProgress() {
        try {
            console.log('🔄 重置词汇学习进度...');
            
            // 重置内存中的进度数据
            this.userProgress = {
                learned: {},
                mastered: {},
                reviewDates: {},
                streaks: {},
                totalLearned: 0,
                totalMastered: 0,
                studyTime: 0,
                lastStudyDate: null,
                weeklyGoal: 50,
                weeklyProgress: 0
            };
            
            // 清除存储中的数据
            await Storage.remove('vocabulary_progress');
            
            console.log('✅ 词汇学习进度已重置');
        } catch (error) {
            console.error('❌ 重置词汇进度失败:', error);
        }
    }

    /**
     * 处理学习完成
     */
    handleLearningCompleted(details) {
        console.log('🎉 学习完成:', details);
        
        // 记录学习动态
        if (window.learningActivityManager && details.wordsLearned) {
            const examType = details.examType || this.currentExamType || '';
            window.learningActivityManager.recordVocabularyActivity(details.wordsLearned, examType);
        }
        
        // 更新学习连击
        this.updateStudyStreak();
        
        // 保存进度
        this.saveUserProgress();
    }

    /**
     * 更新学习连击
     */
    updateStudyStreak() {
        const today = new Date().toDateString();
        const lastStudyDate = localStorage.getItem('lastVocabularyStudyDate');

        if (lastStudyDate === today) {
            // 今天已经学习过了
            return;
        }

        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (lastStudyDate === yesterday) {
            // 连续学习
            this.userProgress.studyStreak += 1;
        } else {
            // 中断了连击
            this.userProgress.studyStreak = 1;
        }

        localStorage.setItem('lastVocabularyStudyDate', today);
    }

    /**
     * 获取词汇学习统计信息
     */
    getStats() {
        const progress = this.userProgress || {};
        const totalStudied = Object.keys(progress.learnedWords || {}).length;
        const correctAnswers = Object.values(progress.learnedWords || {}).filter(w => w.correctCount > w.wrongCount).length;
        
        return {
            accuracy: totalStudied > 0 ? Math.round((correctAnswers / totalStudied) * 100) : 0,
            totalStudied: totalStudied,
            streakDays: progress.studyStreak || 0,
            masteredWords: Object.values(progress.learnedWords || {}).filter(w => w.masteryLevel >= 0.8).length,
            totalTime: progress.totalStudyTime || 0,
            averageAccuracy: progress.averageAccuracy || 0
        };
    }

    /**
     * 重置学习进度数据
     */
    resetProgress() {
        this.userProgress = {
            learnedWords: {},
            studyStreak: 0,
            totalStudyTime: 0,
            averageAccuracy: 0,
            lastReviewDate: null
        };
        
        localStorage.removeItem('vocabularyProgress');
        localStorage.removeItem('lastVocabularyStudyDate');
        
        console.log('✅ 词汇学习进度已重置');
        return true;
    }

    /**
     * 缓存词汇数据 - 性能优化
     */
    cacheWords(cacheKey, words) {
        this.wordCache.set(cacheKey, {
            words: words,
            timestamp: Date.now()
        });
        
        // 清理过期缓存
        this.cleanupExpiredCache();
    }

    /**
     * 从缓存获取词汇 - 性能优化
     */
    getCachedWords(cacheKey) {
        const cached = this.wordCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.cacheTimeout)) {
            return cached.words;
        }
        return null;
    }

    /**
     * 清理过期缓存 - 性能优化
     */
    cleanupExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.wordCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.wordCache.delete(key);
            }
        }
    }

    /**
     * 批量处理词汇操作 - 性能优化
     */
    async batchProcessWords(words, processor) {
        const results = [];
        for (let i = 0; i < words.length; i += this.batchSize) {
            const batch = words.slice(i, i + this.batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            // 让出控制权给其他任务
            if (i + this.batchSize < words.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        return results;
    }

    /**
     * 保存进度到存储 - 防抖版本
     */
    saveProgressToStorage() {
        try {
            Storage.set('vocabulary_progress', this.userProgress);
        } catch (error) {
            console.error('保存词汇进度失败:', error);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabularyManager;
} else {
    window.VocabularyManager = VocabularyManager;
}

console.log('📚 词汇学习管理器已加载');
