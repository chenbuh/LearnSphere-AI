/**
 * 语法练习管理器
 * 提供语法练习、测试、进度跟踪等功能
 */

class GrammarManager {
    constructor() {
        this.currentCategory = null;
        this.currentMode = 'quick';
        this.currentDifficulty = 'basic';
        this.practiceSession = null;
        this.userProgress = {};
        this.grammarQuestions = {}; // Will be loaded from external file
        this.init();
    }

    async init() {
        window.logger?.info('初始化语法练习管理器...');
        
        try {
            // 初始化语法题库
            this.initializeGrammarDatabase();
            
            // 加载用户进度
            await this.loadUserProgress();
            
            window.logger?.info('语法练习管理器初始化完成');
        } catch (error) {
            window.logger?.error('语法练习管理器初始化失败:', error);
        }
    }

    /**
     * 初始化语法题库
     */
    initializeGrammarDatabase() {
        // Now loads from the generated data file
        if (typeof grammarQuestions !== 'undefined' && Object.keys(grammarQuestions).length > 0) {
            this.grammarQuestions = grammarQuestions;
            window.logger?.info('语法题库已从外部文件加载，共', this.getTotalQuestionCount(), '道题目');
        } else {
            window.logger?.error('错误: 未能加载 grammarQuestions 数据。请确保 `src/data/grammar-exercises.js` 文件已正确加载。');
            // Fallback to a minimal structure to avoid crashing
            this.grammarQuestions = { tenses: [], clauses: [], prepositions: [], articles: [], modals: [], conditionals: [] };
        }
    }

    /**
     * 获取题目总数
     */
    getTotalQuestionCount() {
        let total = 0;
        Object.values(this.grammarQuestions).forEach(category => {
            if (Array.isArray(category)) {
            total += category.length;
            }
        });
        return total;
    }

    /**
     * 加载用户进度
     */
    async loadUserProgress() {
        try {
            const defaultProgress = {
                tenses: { completed: 0, total: 48, correct: 0 },
                clauses: { completed: 0, total: 36, correct: 0 },
                prepositions: { completed: 0, total: 32, correct: 0 },
                articles: { completed: 0, total: 24, correct: 0 },
                modals: { completed: 0, total: 28, correct: 0 },
                conditionals: { completed: 0, total: 20, correct: 0 },
                totalPracticeTime: 0,
                streakDays: 0,
                lastPracticeDate: null
            };

            this.userProgress = await Storage.get('grammar_progress', defaultProgress) || defaultProgress;
            window.logger?.info('语法学习进度已加载');
        } catch (error) {
            window.logger?.error('加载语法进度失败:', error);
        }
    }

    /**
     * 保存用户进度
     */
    async saveUserProgress() {
        try {
            await Storage.set('grammar_progress', this.userProgress);
            window.logger?.debug('语法进度已保存');
        } catch (error) {
            window.logger?.error('保存语法进度失败:', error);
        }
    }

    /**
     * 获取指定类别的题目
     */
    getQuestionsByCategory(category, difficulty = null, count = 10) {
        let questions = this.grammarQuestions[category] || [];
        
        if (difficulty && difficulty !== 'all') {
            questions = questions.filter(q => q.difficulty === difficulty);
        }

        // 智能题目选择
        questions = this.intelligentQuestionSelection(questions, category, count);
        
        return questions.slice(0, count);
    }

    /**
     * 智能题目选择
     */
    intelligentQuestionSelection(questions, category, count) {
        if (questions.length <= count) {
            return this.shuffleArray([...questions]);
        }

        // 获取用户在该类别的历史错误
        const categoryProgress = this.userProgress[category] || {};
        const errorQuestions = categoryProgress.errors || [];
        const masteredQuestions = categoryProgress.mastered || [];

        // 分类题目
        const reviewQuestions = []; // 需要复习的错题
        const newQuestions = []; // 新题目
        const masteredQuestionsFiltered = []; // 已掌握的题目

        questions.forEach(q => {
            const questionId = q.id || this.getQuestionHash(q);
            if (errorQuestions.includes(questionId)) {
                reviewQuestions.push(q);
            } else if (masteredQuestions.includes(questionId)) {
                masteredQuestionsFiltered.push(q);
            } else {
                newQuestions.push(q);
            }
        });

        // 智能分配：40%复习错题，50%新题目，10%已掌握题目（用于巩固）
        const reviewCount = Math.min(Math.floor(count * 0.4), reviewQuestions.length);
        const newCount = Math.min(Math.floor(count * 0.5), newQuestions.length);
        const masteredCount = count - reviewCount - newCount;

        const selectedQuestions = [
            ...this.shuffleArray(reviewQuestions).slice(0, reviewCount),
            ...this.shuffleArray(newQuestions).slice(0, newCount),
            ...this.shuffleArray(masteredQuestionsFiltered).slice(0, masteredCount)
        ];

        // 如果题目不够，从剩余题目中补充
        if (selectedQuestions.length < count) {
            const remaining = questions.filter(q => !selectedQuestions.includes(q));
            selectedQuestions.push(...this.shuffleArray(remaining).slice(0, count - selectedQuestions.length));
        }

        return this.shuffleArray(selectedQuestions);
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
     * 基于题目内容生成哈希值
     */
    getQuestionHash(question) {
        if (!question || !question.question) return 0;
        
        let hash = 0;
        const str = question.question + (question.type || '');
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }

    /**
     * 开始语法练习
     */
    startPractice(options = {}) {
        const {
            category = this.currentCategory,
            mode = this.currentMode,
            difficulty = this.currentDifficulty
        } = options;

        // 验证参数
        if (!category) {
            throw new Error('请选择语法类别');
        }

        let questionCount;
        switch (mode) {
            case 'quick': questionCount = 10; break;
            case 'comprehensive': questionCount = 20; break;
            case 'exam': questionCount = 30; break;
            default: questionCount = 10;
        }

        let questions;
        if (category && category !== 'mixed') {
            questions = this.getQuestionsByCategory(category, difficulty, questionCount);
        } else {
            // 混合模式：从所有类别中选择题目
            questions = this.getMixedQuestions(difficulty, questionCount);
        }

        if (questions.length === 0) {
            throw new Error('没有找到符合条件的题目');
        }

        // 为每个题目添加额外信息
        questions = questions.map((q, index) => ({
            ...q,
            questionIndex: index + 1,
            totalQuestions: questions.length,
            startTime: null,
            endTime: null,
            userAnswer: null,
            isCorrect: null,
            timeSpent: 0,
            hintsUsed: 0,
            attempts: 0
        }));

        this.practiceSession = {
            id: `practice_${Date.now()}`,
            category,
            mode,
            difficulty,
            questions,
            currentIndex: 0,
            answers: [],
            startTime: Date.now(),
            timeLimit: mode === 'exam' ? questionCount * 90 * 1000 : null, // 考试模式限时
            isTimerRunning: mode === 'exam',
            score: 0,
            correctCount: 0,
            hintsUsed: 0,
            totalTimeSpent: 0,
            analysis: {
                strengths: [],
                weaknesses: [],
                recommendations: []
            }
        };

        window.logger?.info(`开始语法练习: ${category || 'mixed'} - ${mode} - ${difficulty}`);
        window.logger?.info(`题目数量: ${questions.length}`);
        
        return this.practiceSession;
    }

    /**
     * 回答问题
     */
    answerQuestion(answerIndex, useHint = false) {
        if (!this.practiceSession) {
            throw new Error('没有活动的练习会话');
        }

        const currentQuestion = this.practiceSession.questions[this.practiceSession.currentIndex];
        if (!currentQuestion) {
            throw new Error('没有当前题目');
        }

        // 记录答题时间
        if (currentQuestion.startTime) {
            currentQuestion.endTime = Date.now();
            currentQuestion.timeSpent = currentQuestion.endTime - currentQuestion.startTime;
        }

        // 记录答案
        currentQuestion.userAnswer = answerIndex;
        currentQuestion.attempts++;
        
        if (useHint) {
            currentQuestion.hintsUsed++;
            this.practiceSession.hintsUsed++;
        }

        // 判断正确性
        const isCorrect = answerIndex === currentQuestion.correct;
        currentQuestion.isCorrect = isCorrect;

        if (isCorrect) {
            this.practiceSession.correctCount++;
        }

        // 记录答案到会话中
        this.practiceSession.answers.push({
            questionIndex: this.practiceSession.currentIndex,
            questionId: currentQuestion.id,
            userAnswer: answerIndex,
            correctAnswer: currentQuestion.correct,
            isCorrect,
            timeSpent: currentQuestion.timeSpent,
            hintsUsed: currentQuestion.hintsUsed,
            attempts: currentQuestion.attempts,
            category: currentQuestion.category,
            subcategory: currentQuestion.subcategory,
            difficulty: currentQuestion.difficulty
        });

        // 更新总时间
        this.practiceSession.totalTimeSpent += currentQuestion.timeSpent;

        // 生成详细反馈
        const feedback = this.generateDetailedFeedback(currentQuestion, isCorrect);

        window.logger?.debug(`答题结果: ${isCorrect ? '正确' : '错误'}, 用时: ${currentQuestion.timeSpent}ms`);

        return {
            isCorrect,
            correctAnswer: currentQuestion.correct,
            explanation: currentQuestion.explanation,
            feedback,
            timeSpent: currentQuestion.timeSpent,
            currentScore: Math.round((this.practiceSession.correctCount / (this.practiceSession.currentIndex + 1)) * 100)
        };
    }

    /**
     * 生成详细反馈
     */
    generateDetailedFeedback(question, isCorrect) {
        const feedback = {
            type: isCorrect ? 'success' : 'error',
            title: isCorrect ? '回答正确！' : '回答错误',
            message: question.explanation || '',
            grammarPoint: this.getGrammarPoint(question),
            examples: this.getRelatedExamples(question),
            tips: this.getGrammarTips(question),
            relatedRules: this.getRelatedRules(question)
        };

        // 根据错误类型提供针对性建议
        if (!isCorrect) {
            feedback.suggestion = this.generateErrorSuggestion(question);
        } else {
            feedback.encouragement = this.generateEncouragement(question);
        }

        return feedback;
    }

    /**
     * 获取语法知识点
     */
    getGrammarPoint(question) {
        const grammarPoints = {
            'tenses': {
                'present_simple': '一般现在时',
                'present_continuous': '现在进行时',
                'present_perfect': '现在完成时',
                'past_simple': '一般过去时',
                'past_continuous': '过去进行时',
                'future_simple': '一般将来时'
            },
            'clauses': {
                'relative_clauses': '定语从句',
                'noun_clauses': '名词性从句',
                'adverbial_clauses': '状语从句'
            },
            'prepositions': {
                'time_prepositions': '时间介词',
                'place_prepositions': '地点介词',
                'direction_prepositions': '方向介词'
            },
            'articles': {
                'definite_article': '定冠词',
                'indefinite_article': '不定冠词',
                'zero_article': '零冠词'
            },
            'modals': {
                'ability': '能力情态动词',
                'permission': '许可情态动词',
                'obligation': '义务情态动词'
            },
            'conditionals': {
                'zero_conditional': '零条件句',
                'first_conditional': '第一条件句',
                'second_conditional': '第二条件句',
                'third_conditional': '第三条件句'
            }
        };

        const category = question.category || 'tenses';
        const subcategory = question.subcategory || 'present_simple';
        
        return {
            name: grammarPoints[category]?.[subcategory] || subcategory,
            category: category,
            subcategory: subcategory
        };
    }

    /**
     * 获取相关例句
     */
    getRelatedExamples(question) {
        const examples = [];
        const category = question.category;
        const subcategory = question.subcategory;

        // 根据语法类别提供相关例句
        if (category === 'tenses' && subcategory === 'present_simple') {
            examples.push(
                'I work in an office. (我在办公室工作)',
                'She speaks English fluently. (她英语说得很流利)',
                'The sun rises in the east. (太阳从东方升起)'
            );
        } else if (category === 'tenses' && subcategory === 'present_continuous') {
            examples.push(
                'I am working now. (我现在正在工作)',
                'She is studying English. (她正在学英语)',
                'They are playing football. (他们正在踢足球)'
            );
        } else if (category === 'conditionals') {
            examples.push(
                'If it rains, I will stay home. (如果下雨，我就待在家)',
                'If I were you, I would study harder. (如果我是你，我会更努力学习)',
                'If I had known, I would have come earlier. (如果我知道的话，我会早点来)'
            );
        }

        return examples;
    }

    /**
     * 获取语法小贴士
     */
    getGrammarTips(question) {
        const tips = [];
        const category = question.category;
        const subcategory = question.subcategory;

        if (category === 'tenses') {
            tips.push('注意时态的时间标志词，如：always, now, yesterday, tomorrow等');
            tips.push('观察句子结构，判断动作发生的时间和状态');
        } else if (category === 'prepositions') {
            tips.push('介词的使用往往需要记忆，多做练习形成语感');
            tips.push('注意介词与动词、形容词的固定搭配');
        } else if (category === 'articles') {
            tips.push('可数名词单数前通常需要冠词');
            tips.push('特指时用the，泛指时用a/an');
        }

        return tips;
    }

    /**
     * 获取相关语法规则
     */
    getRelatedRules(question) {
        const rules = [];
        const category = question.category;

        if (category === 'tenses') {
            rules.push('动词时态表示动作发生的时间和状态');
            rules.push('每种时态都有其特定的构成形式和使用场合');
        } else if (category === 'conditionals') {
            rules.push('条件句用来表达假设和可能的结果');
            rules.push('不同类型的条件句表达不同的可能性');
        }

        return rules;
    }

    /**
     * 生成错误建议
     */
    generateErrorSuggestion(question) {
        const suggestions = [
            '仔细阅读题目，理解语境和时间线索',
            '复习相关语法规则，加强理解',
            '多做类似题目，提高熟练度',
            '注意区分相似语法点的差异'
        ];

        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }

    /**
     * 生成鼓励语句
     */
    generateEncouragement(question) {
        const encouragements = [
            '很好！继续保持这样的水平',
            '回答正确！你对这个语法点掌握得很好',
            '优秀！你的语法基础很扎实',
            '太棒了！继续努力学习'
        ];

        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }

    /**
     * 获取混合题目
     */
    getMixedQuestions(difficulty, count) {
        let allQuestions = [];
        Object.values(this.grammarQuestions).forEach(categoryQuestions => {
            if (Array.isArray(categoryQuestions)) {
                allQuestions.push(...categoryQuestions);
            }
        });

        if (difficulty && difficulty !== 'all') {
            allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
        }

        return this.shuffleArray(allQuestions).slice(0, count);
    }

    /**
     * 获取当前题目
     */
    getCurrentQuestion() {
        if (!this.practiceSession) {
            return null;
        }

        const { questions, currentIndex } = this.practiceSession;
        return currentIndex < questions.length ? questions[currentIndex] : null;
    }

    /**
     * 完成练习会话
     */
    completePracticeSession() {
        if (!this.practiceSession) {
            throw new Error('没有活动的练习会话');
        }

        const session = this.practiceSession;
        const endTime = Date.now();
        const totalTime = endTime - session.startTime;

        // 计算最终得分
        const finalScore = Math.round((session.correctCount / session.questions.length) * 100);
        
        // 生成详细分析
        const analysis = this.generateSessionAnalysis(session);
        
        // 更新用户进度
        this.updateUserProgress(session, analysis);

        // 保存会话记录
        const completedSession = {
            ...session,
            endTime,
            totalTime,
            finalScore,
            analysis,
            completed: true
        };

        window.logger?.info(`语法练习完成: 得分 ${finalScore}%, 用时 ${Math.round(totalTime/1000)}秒`);

        // 清除当前会话
        this.practiceSession = null;

        return completedSession;
    }

    /**
     * 生成会话分析
     */
    generateSessionAnalysis(session) {
        const analysis = {
            totalQuestions: session.questions.length,
            correctCount: session.correctCount,
            incorrectCount: session.questions.length - session.correctCount,
            accuracy: Math.round((session.correctCount / session.questions.length) * 100),
            averageTime: Math.round(session.totalTimeSpent / session.questions.length),
            hintsUsed: session.hintsUsed,
            categoryPerformance: {},
            difficultyPerformance: {},
            strengths: [],
            weaknesses: [],
            recommendations: []
        };

        // 按类别分析表现
        const categoryStats = {};
        const difficultyStats = {};

        session.answers.forEach(answer => {
            // 类别统计
            if (!categoryStats[answer.category]) {
                categoryStats[answer.category] = { total: 0, correct: 0 };
            }
            categoryStats[answer.category].total++;
            if (answer.isCorrect) {
                categoryStats[answer.category].correct++;
            }

            // 难度统计
            if (!difficultyStats[answer.difficulty]) {
                difficultyStats[answer.difficulty] = { total: 0, correct: 0 };
            }
            difficultyStats[answer.difficulty].total++;
            if (answer.isCorrect) {
                difficultyStats[answer.difficulty].correct++;
            }
        });

        // 计算类别表现
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            const accuracy = Math.round((stats.correct / stats.total) * 100);
            analysis.categoryPerformance[category] = {
                total: stats.total,
                correct: stats.correct,
                accuracy
            };

            if (accuracy >= 80) {
                analysis.strengths.push(`${this.getCategoryName(category)}: ${accuracy}%`);
            } else if (accuracy < 60) {
                analysis.weaknesses.push(`${this.getCategoryName(category)}: ${accuracy}%`);
            }
        });

        // 计算难度表现
        Object.keys(difficultyStats).forEach(difficulty => {
            const stats = difficultyStats[difficulty];
            const accuracy = Math.round((stats.correct / stats.total) * 100);
            analysis.difficultyPerformance[difficulty] = {
                total: stats.total,
                correct: stats.correct,
                accuracy
            };
        });

        // 生成建议
        analysis.recommendations = this.generateRecommendations(analysis);

        return analysis;
    }

    /**
     * 获取类别中文名称
     */
    getCategoryName(category) {
        const categoryNames = {
            'tenses': '时态',
            'clauses': '从句',
            'prepositions': '介词',
            'articles': '冠词',
            'modals': '情态动词',
            'conditionals': '条件句'
        };
        return categoryNames[category] || category;
    }

    /**
     * 生成学习建议
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        // 基于准确率的建议
        if (analysis.accuracy >= 90) {
            recommendations.push('表现优秀！可以尝试更高难度的练习');
        } else if (analysis.accuracy >= 70) {
            recommendations.push('基础掌握良好，继续练习巩固知识点');
        } else if (analysis.accuracy >= 50) {
            recommendations.push('需要加强基础练习，建议复习相关语法规则');
        } else {
            recommendations.push('基础较薄弱，建议从简单题目开始系统学习');
        }

        // 基于弱项的建议
        if (analysis.weaknesses.length > 0) {
            recommendations.push(`重点关注：${analysis.weaknesses.join('、')}`);
        }

        // 基于用时的建议
        if (analysis.averageTime > 60000) { // 超过1分钟
            recommendations.push('答题速度较慢，建议多做练习提高熟练度');
        } else if (analysis.averageTime < 10000) { // 少于10秒
            recommendations.push('答题速度很快，注意仔细思考避免粗心错误');
        }

        // 基于提示使用的建议
        if (analysis.hintsUsed > analysis.totalQuestions * 0.3) {
            recommendations.push('提示使用较多，建议加强相关知识点的学习');
        }

        return recommendations;
    }

    /**
     * 更新用户进度
     */
    updateUserProgress(session, analysis) {
        // 更新类别进度
        Object.keys(analysis.categoryPerformance).forEach(category => {
            if (!this.userProgress[category]) {
                this.userProgress[category] = { 
                    completed: 0, 
                    total: 0, 
                    correct: 0,
                    errors: [],
                    mastered: []
                };
            }

            const categoryProgress = this.userProgress[category];
            const performance = analysis.categoryPerformance[category];
            
            categoryProgress.completed += performance.total;
            categoryProgress.correct += performance.correct;

            // 更新错题和掌握的题目
            session.answers.forEach(answer => {
                if (answer.category === category) {
                    const questionId = answer.questionId || this.getQuestionHash(answer);
                    
                    if (answer.isCorrect) {
                        // 移出错题列表
                        const errorIndex = categoryProgress.errors.indexOf(questionId);
                        if (errorIndex > -1) {
                            categoryProgress.errors.splice(errorIndex, 1);
                        }
                        // 添加到掌握列表
                        if (!categoryProgress.mastered.includes(questionId)) {
                            categoryProgress.mastered.push(questionId);
                        }
                    } else {
                        // 添加到错题列表
                        if (!categoryProgress.errors.includes(questionId)) {
                            categoryProgress.errors.push(questionId);
                        }
                        // 从掌握列表移除
                        const masteredIndex = categoryProgress.mastered.indexOf(questionId);
                        if (masteredIndex > -1) {
                            categoryProgress.mastered.splice(masteredIndex, 1);
                        }
                    }
                }
            });
        });

        // 更新总体统计
        this.userProgress.totalPracticeTime += session.totalTimeSpent;
        
        // 更新连续学习天数
        const today = new Date().toDateString();
        const lastDate = this.userProgress.lastPracticeDate;
        
        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate === yesterday.toDateString()) {
                this.userProgress.streakDays++;
            } else if (lastDate !== today) {
                this.userProgress.streakDays = 1;
            }
            
            this.userProgress.lastPracticeDate = today;
        }

        // 保存进度
        this.saveUserProgress();
    }

    /**
     * 下一题
     */
    nextQuestion() {
        if (!this.practiceSession) {
            throw new Error('没有活动的练习会话');
        }

        const currentQuestion = this.practiceSession.questions[this.practiceSession.currentIndex];
        if (currentQuestion && !currentQuestion.startTime) {
            currentQuestion.startTime = Date.now();
        }

        this.practiceSession.currentIndex++;
        
        // 检查是否完成所有题目
        if (this.practiceSession.currentIndex >= this.practiceSession.questions.length) {
            return this.completePracticeSession();
        }

        return this.getCurrentQuestion();
    }

    /**
     * 计算统计信息
     */
    calculateStats(session) {
        const { answers, duration } = session;
        const totalQuestions = answers.length;
        const correctCount = answers.filter(a => a.isCorrect).length;
        const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        
        // 按类别统计
        const categoryStats = {};
        answers.forEach(answer => {
            const question = session.questions.find(q => q.id === answer.questionId);
            if (question) {
                if (!categoryStats[question.category]) {
                    categoryStats[question.category] = { correct: 0, total: 0 };
                }
                categoryStats[question.category].total++;
                if (answer.isCorrect) {
                    categoryStats[question.category].correct++;
                }
            }
        });

        return {
            totalQuestions,
            correctCount,
            incorrectCount: totalQuestions - correctCount,
            accuracy: Math.round(accuracy),
            duration,
            averageTime: totalQuestions > 0 ? Math.round(duration / totalQuestions) : 0,
            categoryStats,
            xpEarned: this.calculateXP(correctCount, accuracy, session.difficulty)
        };
    }

    /**
     * 计算经验值
     */
    calculateXP(correctCount, accuracy, difficulty) {
        let baseXP = correctCount * 5;
        
        // 难度奖励
        const difficultyMultiplier = {
            'basic': 1,
            'intermediate': 1.2,
            'advanced': 1.5
        };
        baseXP *= difficultyMultiplier[difficulty] || 1;

        // 准确率奖励
        if (accuracy >= 90) baseXP += 30;
        else if (accuracy >= 80) baseXP += 20;
        else if (accuracy >= 70) baseXP += 10;

        return Math.round(baseXP);
    }

    /**
     * 更新进度
     */
    updateProgress(session, stats) {
        // 更新类别进度
        Object.entries(stats.categoryStats).forEach(([category, categoryStats]) => {
            if (this.userProgress[category]) {
                this.userProgress[category].completed += categoryStats.total;
                this.userProgress[category].correct += categoryStats.correct;
            }
        });

        // 更新总体统计
        this.userProgress.totalPracticeTime += session.duration;
        this.userProgress.lastPracticeDate = new Date().toDateString();

        // 保存进度
        this.saveUserProgress();
    }

    /**
     * 记录学习活动
     */
    async recordActivity(session, stats) {
        try {
            const activity = {
                module: 'grammar',
                type: session.mode,
                category: session.category,
                difficulty: session.difficulty,
                duration: session.duration,
                questionsAnswered: stats.totalQuestions,
                accuracy: stats.accuracy,
                score: Math.round(stats.accuracy),
                xpEarned: stats.xpEarned,
                details: {
                    correctCount: stats.correctCount,
                    incorrectCount: stats.incorrectCount,
                    categoryStats: stats.categoryStats
                }
            };

            await Storage.addLearningActivity(activity);
            
            // 记录到学习动态管理器
            if (window.learningActivityManager) {
                window.learningActivityManager.recordGrammarActivity(
                    stats.totalQuestions, 
                    stats.accuracy
                );
            }
            
            console.log('📊 语法练习活动已记录');
        } catch (error) {
            console.error('记录学习活动失败:', error);
        }
    }

    /**
     * 获取学习统计
     */
    getStats() {
        const categoryProgress = {};
        let totalCompleted = 0;
        let totalQuestions = 0;
        let totalCorrect = 0;

        Object.entries(this.userProgress).forEach(([key, value]) => {
            if (value !== null && 
                typeof value === 'object' && 
                value.total !== undefined &&
                typeof value.total === 'number' &&
                typeof value.completed === 'number' &&
                typeof value.correct === 'number') {
                
                const accuracy = value.completed > 0 ? Math.round((value.correct / value.completed) * 100) : 0;
                const progress = value.total > 0 ? Math.round((value.completed / value.total) * 100) : 0;
                
                categoryProgress[key] = {
                    ...value,
                    accuracy,
                    progress
                };
                
                totalCompleted += value.completed;
                totalQuestions += value.total;
                totalCorrect += value.correct;
            }
        });

        const overallAccuracy = totalCompleted > 0 ? Math.round((totalCorrect / totalCompleted) * 100) : 0;
        const overallProgress = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;

        return {
            categoryProgress,
            overall: {
                completed: totalCompleted,
                total: totalQuestions,
                correct: totalCorrect,
                accuracy: overallAccuracy,
                progress: overallProgress
            },
            totalPracticeTime: this.userProgress.totalPracticeTime || 0,
            streakDays: this.userProgress.streakDays || 0
        };
    }

    /**
     * 重置进度
     */
    async resetProgress() {
        try {
            this.userProgress = {
                tenses: { completed: 0, total: 48, correct: 0 },
                clauses: { completed: 0, total: 36, correct: 0 },
                prepositions: { completed: 0, total: 32, correct: 0 },
                articles: { completed: 0, total: 24, correct: 0 },
                modals: { completed: 0, total: 28, correct: 0 },
                conditionals: { completed: 0, total: 20, correct: 0 },
                totalPracticeTime: 0,
                streakDays: 0,
                lastPracticeDate: null
            };

            // 删除旧数据并保存新的初始数据
            await Storage.remove('grammar_progress');
            await Storage.set('grammar_progress', this.userProgress);
            console.log('✅ 语法学习进度已重置');
        } catch (error) {
            console.error('重置语法进度失败:', error);
        }
    }

    /**
     * 设置当前选择
     */
    setCurrentCategory(category) {
        this.currentCategory = category;
    }

    setCurrentMode(mode) {
        this.currentMode = mode;
    }

    setCurrentDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
    }

}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarManager;
} else {
    window.GrammarManager = GrammarManager;
}

console.log('📝 语法练习管理器已加载');
