/**
 * 写作练习管理器
 * 负责处理英语写作练习的所有功能
 */
class WritingManager {
    constructor() {
        this.currentWriting = null;
        this.writingSession = null;
        this.startTime = null;
        this.timer = null;
        
        // 配置选项
        this.config = {
            writingType: 'essay',
            difficulty: 'intermediate',
            examType: 'ielts',
            wordLimit: 250
        };
        
        // 用户写作数据
        this.writingProgress = {
            totalWritings: 0,
            totalWords: 0,
            averageScore: 0,
            totalTime: 0,
            typeStats: {
                essay: { completed: 0, averageScore: 0, totalWords: 0 },
                letter: { completed: 0, averageScore: 0, totalWords: 0 },
                report: { completed: 0, averageScore: 0, totalWords: 0 },
                email: { completed: 0, averageScore: 0, totalWords: 0 }
            },
            recentWritings: []
        };
        
        this.init();
    }

    /**
     * 初始化写作管理器
     */
    init() {
        this.loadWritingProgress();
        this.initializeTopicsDatabase();
        console.log('✍️ 写作练习管理器已初始化');
    }

    /**
     * 初始化写作题目数据库
     */
    initializeTopicsDatabase() {
        this.topicsDatabase = {
            essay: {
                intermediate: [
                    {
                        id: 'essay_int_001',
                        type: 'argumentative',
                        title: '在线学习的优缺点',
                        prompt: '近年来，在线学习变得越来越流行。一些人认为在线学习是未来教育的趋势，而另一些人则认为传统课堂教学更有效。请讨论在线学习的优缺点，并给出你的观点。',
                        requirements: [
                            '写作字数：不少于250字',
                            '清楚表达观点并提供支持论据',
                            '结构清晰，逻辑连贯',
                            '使用适当的词汇和语法'
                        ],
                        keywords: ['在线学习', '传统教育', '优势', '劣势', '技术', '互动'],
                        difficulty: 'intermediate',
                        timeLimit: 40, // 分钟
                        wordLimit: 250,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_int_002',
                        type: 'opinion',
                        title: '社交媒体对年轻人的影响',
                        prompt: '社交媒体已成为现代生活的重要组成部分，特别是对年轻人而言。请论述社交媒体对年轻人生活的积极和消极影响，并表达你的看法。',
                        requirements: [
                            '写作字数：不少于250字',
                            '分析积极和消极影响',
                            '提供具体例子和论据',
                            '给出平衡的观点'
                        ],
                        keywords: ['社交媒体', '年轻人', '影响', '沟通', '心理健康', '信息传播'],
                        difficulty: 'intermediate',
                        timeLimit: 40,
                        wordLimit: 250,
                        examType: 'ielts'
                    },
                    {
                        id: 'essay_int_003',
                        type: 'problem_solution',
                        title: '城市交通拥堵问题',
                        prompt: '许多大城市都面临交通拥堵的严重问题，这不仅影响人们的日常生活，还对环境造成负面影响。请分析造成交通拥堵的主要原因，并提出可行的解决方案。',
                        requirements: [
                            '写作字数：不少于250字',
                            '分析问题的主要原因',
                            '提出切实可行的解决方案',
                            '逻辑清晰，论述充分'
                        ],
                        keywords: ['交通拥堵', '城市化', '公共交通', '环境污染', '解决方案'],
                        difficulty: 'intermediate',
                        timeLimit: 40,
                        wordLimit: 250,
                        examType: 'ielts'
                    }
                ],
                advanced: [
                    {
                        id: 'essay_adv_001',
                        type: 'argumentative',
                        title: '人工智能对就业市场的影响',
                        prompt: '随着人工智能技术的快速发展，许多人担心AI会取代人类的工作岗位，而另一些人认为AI会创造新的就业机会。请深入分析人工智能对就业市场的影响，并论述我们应该如何应对这一挑战。',
                        requirements: [
                            '写作字数：不少于300字',
                            '深入分析AI对就业的多方面影响',
                            '提出应对策略和建议',
                            '使用高级词汇和复杂句式',
                            '论证严密，逻辑性强'
                        ],
                        keywords: ['人工智能', '就业市场', '自动化', '技能转型', '未来工作', '教育培训'],
                        difficulty: 'advanced',
                        timeLimit: 45,
                        wordLimit: 300,
                        examType: 'ielts'
                    }
                ]
            },
            letter: {
                intermediate: [
                    {
                        id: 'letter_int_001',
                        type: 'formal',
                        title: '投诉信：在线购物问题',
                        prompt: '你在某在线商城购买了一台笔记本电脑，但收到的商品存在质量问题。请写一封投诉信给客服部门，说明问题并要求解决。',
                        requirements: [
                            '写作字数：不少于150字',
                            '使用正式的书信格式',
                            '清楚描述问题',
                            '提出合理的解决要求',
                            '语调礼貌但坚定'
                        ],
                        keywords: ['投诉', '产品质量', '退换货', '客服', '解决方案'],
                        difficulty: 'intermediate',
                        timeLimit: 20,
                        wordLimit: 150,
                        examType: 'ielts'
                    },
                    {
                        id: 'letter_int_002',
                        type: 'informal',
                        title: '邀请信：生日聚会',
                        prompt: '你将举办生日聚会，想邀请你的外国朋友参加。请写一封非正式的邀请信，包含聚会的详细信息。',
                        requirements: [
                            '写作字数：不少于150字',
                            '使用友好、轻松的语调',
                            '包含时间、地点、活动安排',
                            '表达期待朋友参加的心情'
                        ],
                        keywords: ['生日聚会', '邀请', '朋友', '庆祝', '活动安排'],
                        difficulty: 'intermediate',
                        timeLimit: 20,
                        wordLimit: 150,
                        examType: 'ielts'
                    }
                ]
            },
            report: {
                intermediate: [
                    {
                        id: 'report_int_001',
                        type: 'survey',
                        title: '学生课外活动调查报告',
                        prompt: '请根据以下数据写一份关于学生课外活动参与情况的调查报告。数据显示：体育活动60%，艺术活动25%，学术竞赛15%。',
                        requirements: [
                            '写作字数：不少于150字',
                            '客观描述数据',
                            '分析趋势和原因',
                            '使用正式的报告格式',
                            '提供结论和建议'
                        ],
                        keywords: ['调查报告', '数据分析', '课外活动', '趋势', '结论'],
                        difficulty: 'intermediate',
                        timeLimit: 20,
                        wordLimit: 150,
                        examType: 'ielts'
                    }
                ]
            },
            email: {
                intermediate: [
                    {
                        id: 'email_int_001',
                        type: 'business',
                        title: '商务邮件：会议安排',
                        prompt: '你需要给团队成员发送一封邮件，安排下周的项目讨论会议。请包含会议目的、时间、地点和议程。',
                        requirements: [
                            '写作字数：不少于120字',
                            '使用专业的商务语言',
                            '信息完整准确',
                            '结构清晰',
                            '语调正式礼貌'
                        ],
                        keywords: ['商务邮件', '会议安排', '议程', '团队沟通', '项目讨论'],
                        difficulty: 'intermediate',
                        timeLimit: 15,
                        wordLimit: 120,
                        examType: 'business'
                    }
                ]
            }
        };
        
        console.log('📝 写作题目数据库已初始化');
    }

    /**
     * 根据配置获取写作题目
     */
    getTopicsByConfig() {
        const topics = this.topicsDatabase[this.config.writingType]?.[this.config.difficulty];
        return topics || [];
    }

    /**
     * 随机选择一个写作题目
     */
    selectRandomTopic() {
        const topics = this.getTopicsByConfig();
        
        if (topics.length === 0) {
            console.warn('未找到对应类型的写作题目');
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * topics.length);
        return topics[randomIndex];
    }

    /**
     * 开始写作练习
     */
    startWritingPractice() {
        console.log('✍️ 开始写作练习');
        console.log('配置:', this.config);
        
        // 选择题目
        this.currentWriting = this.selectRandomTopic();
        
        if (!this.currentWriting) {
            return null;
        }
        
        // 创建写作会话
        this.writingSession = {
            topic: this.currentWriting,
            startTime: Date.now(),
            endTime: null,
            content: '',
            wordCount: 0,
            timeSpent: 0,
            completed: false
        };
        
        console.log('✅ 已选择写作题目:', this.currentWriting.title);
        return this.currentWriting;
    }

    /**
     * 开始计时
     */
    startTimer() {
        this.startTime = Date.now();
        
        this.timer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            // 更新界面显示
            const timerElement = document.getElementById('writingTimer');
            if (timerElement) {
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    /**
     * 停止计时
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * 更新写作内容
     */
    updateWritingContent(content) {
        if (!this.writingSession) return;
        
        this.writingSession.content = content;
        this.writingSession.wordCount = this.countWords(content);
        
        // 更新字数显示
        const wordCountElement = document.getElementById('wordCount');
        if (wordCountElement) {
            const target = this.currentWriting.wordLimit;
            const current = this.writingSession.wordCount;
            wordCountElement.textContent = `${current}/${target} 词`;
            
            // 根据字数变化颜色
            if (current < target * 0.5) {
                wordCountElement.className = 'word-count insufficient';
            } else if (current >= target) {
                wordCountElement.className = 'word-count sufficient';
            } else {
                wordCountElement.className = 'word-count approaching';
            }
        }
    }

    /**
     * 计算字数
     */
    countWords(text) {
        if (!text || text.trim().length === 0) return 0;
        
        // 简单的英文字数统计
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    /**
     * 完成写作练习
     */
    finishWriting(content) {
        if (!this.writingSession) {
            console.warn('没有活动的写作会话');
            return null;
        }

        this.stopTimer();
        
        this.writingSession.content = content;
        this.writingSession.wordCount = this.countWords(content);
        this.writingSession.endTime = Date.now();
        this.writingSession.timeSpent = this.writingSession.endTime - this.writingSession.startTime;
        this.writingSession.completed = true;
        
        // 评分
        const score = this.evaluateWriting(this.writingSession);
        
        const result = {
            session: this.writingSession,
            score: score,
            feedback: this.generateFeedback(score, this.writingSession)
        };
        
        // 记录学习会话
        if (window.app && window.app.recordStudySession) {
            window.app.recordStudySession('writing', this.writingSession.timeSpent / 1000, score.overall);
        }
        
        // 更新进度
        this.updateWritingProgress(result);
        
        // 保存结果
        this.saveWritingResult(result);
        
        console.log('✅ 写作练习完成');
        return result;
    }

    /**
     * 评估写作（简化版评分系统）
     */
    evaluateWriting(session) {
        let score = {
            total: 0,
            breakdown: {
                content: 0,    // 内容 (25%)
                organization: 0, // 结构 (25%)
                language: 0,   // 语言 (25%)
                mechanics: 0   // 语法拼写 (25%)
            }
        };
        
        const wordCount = session.wordCount;
        const targetWords = session.topic.wordLimit;
        const timeSpent = session.timeSpent / 1000 / 60; // 转换为分钟
        const timeLimit = session.topic.timeLimit;
        
        // 内容评分 (基于字数达标情况)
        if (wordCount >= targetWords) {
            score.breakdown.content = 8;
        } else if (wordCount >= targetWords * 0.8) {
            score.breakdown.content = 7;
        } else if (wordCount >= targetWords * 0.6) {
            score.breakdown.content = 6;
        } else if (wordCount >= targetWords * 0.4) {
            score.breakdown.content = 5;
        } else {
            score.breakdown.content = 4;
        }
        
        // 结构评分 (基于段落数量等)
        const paragraphs = session.content.split('\n\n').filter(p => p.trim().length > 0);
        if (paragraphs.length >= 4) {
            score.breakdown.organization = 8;
        } else if (paragraphs.length >= 3) {
            score.breakdown.organization = 7;
        } else if (paragraphs.length >= 2) {
            score.breakdown.organization = 6;
        } else {
            score.breakdown.organization = 5;
        }
        
        // 语言评分 (基于词汇多样性简化评估)
        const uniqueWords = new Set(session.content.toLowerCase().match(/\b\w+\b/g) || []);
        const vocabularyRatio = uniqueWords.size / wordCount;
        
        if (vocabularyRatio > 0.6) {
            score.breakdown.language = 8;
        } else if (vocabularyRatio > 0.5) {
            score.breakdown.language = 7;
        } else if (vocabularyRatio > 0.4) {
            score.breakdown.language = 6;
        } else {
            score.breakdown.language = 5;
        }
        
        // 语法机制评分 (基于简单规则)
        score.breakdown.mechanics = 7; // 默认给7分，实际应该有更复杂的语法检查
        
        // 计算总分
        score.total = Math.round(
            (score.breakdown.content + score.breakdown.organization + 
             score.breakdown.language + score.breakdown.mechanics) / 4 * 10
        ) / 10;
        
        return score;
    }

    /**
     * 生成反馈
     */
    generateFeedback(score, session) {
        const feedback = {
            overall: '',
            strengths: [],
            improvements: [],
            suggestions: []
        };
        
        // 总体评价
        if (score.total >= 8) {
            feedback.overall = '优秀的写作！你展现了很强的英语写作能力。';
        } else if (score.total >= 7) {
            feedback.overall = '很好的写作，有一些小的改进空间。';
        } else if (score.total >= 6) {
            feedback.overall = '不错的尝试，继续练习会有更大进步。';
        } else {
            feedback.overall = '需要更多练习来提高写作水平。';
        }
        
        // 具体反馈
        if (score.breakdown.content >= 7) {
            feedback.strengths.push('内容充实，观点表达清晰');
        } else {
            feedback.improvements.push('需要丰富文章内容，更好地展开观点');
        }
        
        if (score.breakdown.organization >= 7) {
            feedback.strengths.push('文章结构合理，逻辑清晰');
        } else {
            feedback.improvements.push('注意文章结构，确保逻辑连贯');
        }
        
        if (score.breakdown.language >= 7) {
            feedback.strengths.push('词汇运用恰当，表达多样');
        } else {
            feedback.improvements.push('可以尝试使用更多样的词汇和句式');
        }
        
        if (score.breakdown.mechanics >= 7) {
            feedback.strengths.push('语法和拼写基本准确');
        } else {
            feedback.improvements.push('注意语法规则和拼写准确性');
        }
        
        // 改进建议
        if (session.wordCount < session.topic.wordLimit * 0.8) {
            feedback.suggestions.push('增加文章长度，确保达到字数要求');
        }
        
        feedback.suggestions.push('多读优秀范文，学习不同的表达方式');
        feedback.suggestions.push('练习不同类型的写作题目');
        
        return feedback;
    }

    /**
     * 更新写作进度
     */
    updateWritingProgress(result) {
        this.writingProgress.totalWritings++;
        this.writingProgress.totalWords += result.session.wordCount;
        this.writingProgress.totalTime += Math.round(result.session.timeSpent / 1000 / 60);
        
        // 更新平均分数
        const oldTotal = this.writingProgress.totalWritings - 1;
        const oldSum = this.writingProgress.averageScore * oldTotal;
        this.writingProgress.averageScore = Math.round(((oldSum + result.score.total) / this.writingProgress.totalWritings) * 10) / 10;
        
        // 更新类型统计
        const writingType = result.session.topic.type;
        const topLevelType = result.session.topic.id.split('_')[0]; // essay, letter, report, email
        
        if (this.writingProgress.typeStats[topLevelType]) {
            const typeStats = this.writingProgress.typeStats[topLevelType];
            const oldCompleted = typeStats.completed;
            const oldScoreSum = typeStats.averageScore * oldCompleted;
            
            typeStats.completed++;
            typeStats.totalWords += result.session.wordCount;
            typeStats.averageScore = Math.round(((oldScoreSum + result.score.total) / typeStats.completed) * 10) / 10;
        }
        
        // 添加到最近写作
        this.writingProgress.recentWritings.unshift({
            title: result.session.topic.title,
            type: topLevelType,
            score: result.score.total,
            wordCount: result.session.wordCount,
            timeSpent: Math.round(result.session.timeSpent / 1000 / 60),
            date: new Date().toISOString()
        });
        
        // 只保留最近20篇
        if (this.writingProgress.recentWritings.length > 20) {
            this.writingProgress.recentWritings = this.writingProgress.recentWritings.slice(0, 20);
        }
        
        this.saveWritingProgress();
    }

    /**
     * 保存写作结果
     */
    saveWritingResult(result) {
        try {
            const writingHistory = JSON.parse(localStorage.getItem('writingHistory') || '[]');
            
            const historyItem = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                topic: {
                    title: result.session.topic.title,
                    type: result.session.topic.type,
                    difficulty: result.session.topic.difficulty
                },
                content: result.session.content,
                wordCount: result.session.wordCount,
                timeSpent: result.session.timeSpent,
                score: result.score,
                feedback: result.feedback
            };
            
            writingHistory.unshift(historyItem);
            
            // 只保留最近50次记录
            if (writingHistory.length > 50) {
                writingHistory.splice(50);
            }
            
            localStorage.setItem('writingHistory', JSON.stringify(writingHistory));
            console.log('💾 写作结果已保存');
            
        } catch (error) {
            console.error('保存写作结果失败:', error);
        }
    }

    /**
     * 获取写作统计
     */
    getWritingStats() {
        return {
            totalWritings: this.writingProgress.totalWritings,
            averageScore: this.writingProgress.averageScore,
            totalWords: this.writingProgress.totalWords,
            totalTime: this.writingProgress.totalTime,
            typeStats: this.writingProgress.typeStats,
            recentWritings: this.writingProgress.recentWritings.slice(0, 5)
        };
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📝 写作配置已更新:', this.config);
    }

    /**
     * 保存写作进度
     */
    saveWritingProgress() {
        try {
            localStorage.setItem('writingProgress', JSON.stringify(this.writingProgress));
            console.log('💾 写作进度已保存');
        } catch (error) {
            console.error('保存写作进度失败:', error);
        }
    }

    /**
     * 加载写作进度
     */
    loadWritingProgress() {
        try {
            const saved = localStorage.getItem('writingProgress');
            if (saved) {
                this.writingProgress = { ...this.writingProgress, ...JSON.parse(saved) };
                console.log('📈 写作进度已加载');
            }
        } catch (error) {
            console.error('加载写作进度失败:', error);
        }
    }

    /**
     * 重置写作进度
     */
    resetProgress() {
        this.writingProgress = {
            totalWritings: 0,
            totalWords: 0,
            averageScore: 0,
            totalTime: 0,
            typeStats: {
                essay: { completed: 0, averageScore: 0, totalWords: 0 },
                letter: { completed: 0, averageScore: 0, totalWords: 0 },
                report: { completed: 0, averageScore: 0, totalWords: 0 },
                email: { completed: 0, averageScore: 0, totalWords: 0 }
            },
            recentWritings: []
        };
        
        this.saveWritingProgress();
        console.log('🔄 写作进度已重置');
    }

    /**
     * 重置当前会话
     */
    resetCurrentSession() {
        this.currentWriting = null;
        this.writingSession = null;
        this.stopTimer();
    }

    /**
     * 获取写作历史
     */
    getWritingHistory() {
        try {
            return JSON.parse(localStorage.getItem('writingHistory') || '[]');
        } catch (error) {
            console.error('获取写作历史失败:', error);
            return [];
        }
    }

    /**
     * 获取写作练习统计信息
     */
    getStats() {
        const progress = this.writingProgress || {};
        
        return {
            averageScore: progress.averageScore || 0,
            totalWritings: progress.totalWritings || 0,
            totalTime: Math.round((progress.totalTime || 0) / 60), // 转换为分钟
            totalWords: progress.totalWords || 0,
            bestScore: Math.max(...(progress.recentWritings || []).map(w => w.score || 0), 0),
            completionRate: progress.totalWritings > 0 ? 100 : 0,
            streakDays: this.calculateWritingStreak()
        };
    }

    /**
     * 计算写作连击天数
     */
    calculateWritingStreak() {
        const recentWritings = this.writingProgress.recentWritings || [];
        if (recentWritings.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) { // 检查最近30天
            const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = checkDate.toDateString();
            
            const hasWriting = recentWritings.some(w => 
                new Date(w.timestamp).toDateString() === dateStr
            );
            
            if (hasWriting) {
                streak++;
            } else if (i > 0) { // 如果不是今天且没有写作记录，则中断连击
                break;
            }
        }
        
        return streak;
    }

    /**
     * 重置写作进度数据
     */
    resetProgress() {
        this.writingProgress = {
            totalWritings: 0,
            totalWords: 0,
            averageScore: 0,
            totalTime: 0,
            typeStats: {
                essay: { completed: 0, averageScore: 0, totalWords: 0 },
                letter: { completed: 0, averageScore: 0, totalWords: 0 },
                report: { completed: 0, averageScore: 0, totalWords: 0 },
                email: { completed: 0, averageScore: 0, totalWords: 0 }
            },
            recentWritings: []
        };
        
        localStorage.removeItem('writingProgress');
        console.log('✅ 写作练习进度已重置');
        return true;
    }
}

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('writing')) {
        window.writingManager = new WritingManager();
        console.log('✅ 写作练习管理器已全局初始化');
    }
});
