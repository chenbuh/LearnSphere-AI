/**
 * 学习进度追踪系统
 * 提供详细的学习进度分析和可视化
 */

class ProgressTracker {
    constructor() {
        this.progressData = {};
        this.milestones = {};
        this.achievements = [];
        this.streaks = {};
        this.init();
    }

    async init() {
        await this.loadProgressData();
        this.initializeMilestones();
        console.log('📊 学习进度追踪系统已初始化');
    }

    /**
     * 加载进度数据
     */
    async loadProgressData() {
        try {
            const savedData = await Storage.get('progress_data', {}) || {};
            this.progressData = {
                vocabulary: {
                    learned: 0,
                    mastered: 0,
                    reviewing: 0,
                    total: 4000,
                    dailyGoal: 50,
                    weeklyProgress: Array(7).fill(0),
                    categories: {},
                    ...(savedData.vocabulary || {})
                },
                grammar: {
                    topicsCompleted: 0,
                    totalTopics: 20,
                    accuracy: 0,
                    practiceCount: 0,
                    weeklyProgress: Array(7).fill(0),
                    topicProgress: {},
                    ...(savedData.grammar || {})
                },
                listening: {
                    hoursListened: 0,
                    accuracy: 0,
                    speed: 'normal',
                    completedExercises: 0,
                    totalExercises: 100,
                    weeklyProgress: Array(7).fill(0),
                    skillLevels: {},
                    ...(savedData.listening || {})
                },
                reading: {
                    articlesRead: 0,
                    wordsPerMinute: 200,
                    comprehensionRate: 0,
                    totalArticles: 50,
                    weeklyProgress: Array(7).fill(0),
                    genres: {},
                    ...(savedData.reading || {})
                },
                writing: {
                    essaysWritten: 0,
                    averageScore: 0,
                    totalEssays: 20,
                    wordCount: 0,
                    weeklyProgress: Array(7).fill(0),
                    skills: {},
                    ...(savedData.writing || {})
                },
                speaking: {
                    sessionsCompleted: 0,
                    averageScore: 0,
                    totalSessions: 30,
                    practiceMinutes: 0,
                    weeklyProgress: Array(7).fill(0),
                    skills: {},
                    ...(savedData.speaking || {})
                },
                overall: {
                    studyDays: 0,
                    totalStudyTime: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    level: 'beginner',
                    xp: 0,
                    ...(savedData.overall || {})
                }
            };
        } catch (error) {
            console.error('加载进度数据失败:', error);
        }
    }

    /**
     * 保存进度数据
     */
    async saveProgressData() {
        try {
            await Storage.set('progress_data', this.progressData);
        } catch (error) {
            console.error('保存进度数据失败:', error);
        }
    }

    /**
     * 初始化里程碑
     */
    initializeMilestones() {
        this.milestones = {
            vocabulary: [
                { threshold: 100, title: '词汇新手', reward: 'badge', icon: '📚' },
                { threshold: 500, title: '词汇达人', reward: 'badge', icon: '📖' },
                { threshold: 1000, title: '词汇专家', reward: 'badge', icon: '🎓' },
                { threshold: 2000, title: '词汇大师', reward: 'badge', icon: '👑' }
            ],
            grammar: [
                { threshold: 5, title: '语法入门', reward: 'badge', icon: '📝' },
                { threshold: 10, title: '语法熟手', reward: 'badge', icon: '✍️' },
                { threshold: 15, title: '语法专家', reward: 'badge', icon: '🏆' }
            ],
            listening: [
                { threshold: 10, title: '听力新手', reward: 'badge', icon: '👂' },
                { threshold: 50, title: '听力达人', reward: 'badge', icon: '🎧' },
                { threshold: 100, title: '听力专家', reward: 'badge', icon: '🎵' }
            ],
            overall: [
                { threshold: 7, title: '坚持一周', reward: 'streak', icon: '🔥' },
                { threshold: 30, title: '坚持一月', reward: 'streak', icon: '💪' },
                { threshold: 100, title: '百日坚持', reward: 'streak', icon: '🌟' }
            ]
        };
    }

    /**
     * 更新词汇进度
     */
    updateVocabularyProgress(learned, mastered, category = 'general') {
        const vocab = this.progressData.vocabulary;
        vocab.learned = Math.max(vocab.learned, learned);
        vocab.mastered = Math.max(vocab.mastered, mastered);
        
        if (!vocab.categories[category]) {
            vocab.categories[category] = { learned: 0, mastered: 0 };
        }
        vocab.categories[category].learned = learned;
        vocab.categories[category].mastered = mastered;

        // 更新今日进度
        const today = new Date().getDay();
        vocab.weeklyProgress[today] += 1;

        this.checkMilestones('vocabulary', vocab.learned);
        this.addXP(learned * 2 + mastered * 5);
        this.saveProgressData();
    }

    /**
     * 更新语法进度
     */
    updateGrammarProgress(topic, accuracy, practiceCount) {
        const grammar = this.progressData.grammar;
        
        if (!grammar.topicProgress[topic]) {
            grammar.topicProgress[topic] = { accuracy: 0, count: 0, mastered: false };
            grammar.topicsCompleted += 1;
        }

        grammar.topicProgress[topic].accuracy = accuracy;
        grammar.topicProgress[topic].count = practiceCount;
        grammar.topicProgress[topic].mastered = accuracy >= 0.8 && practiceCount >= 10;

        // 计算总体准确率
        const topics = Object.values(grammar.topicProgress);
        grammar.accuracy = topics.reduce((sum, t) => sum + t.accuracy, 0) / topics.length;
        grammar.practiceCount += 1;

        const today = new Date().getDay();
        grammar.weeklyProgress[today] += 1;

        this.checkMilestones('grammar', grammar.topicsCompleted);
        this.addXP(Math.floor(accuracy * 10));
        this.saveProgressData();
    }

    /**
     * 更新听力进度
     */
    updateListeningProgress(duration, accuracy, exerciseType) {
        const listening = this.progressData.listening;
        listening.hoursListened += duration / 60; // 转换为小时
        listening.completedExercises += 1;
        
        // 更新准确率（移动平均）
        const alpha = 0.1; // 学习率
        listening.accuracy = listening.accuracy * (1 - alpha) + accuracy * alpha;

        if (!listening.skillLevels[exerciseType]) {
            listening.skillLevels[exerciseType] = { accuracy: 0, count: 0 };
        }
        listening.skillLevels[exerciseType].accuracy = accuracy;
        listening.skillLevels[exerciseType].count += 1;

        const today = new Date().getDay();
        listening.weeklyProgress[today] += 1;

        this.checkMilestones('listening', listening.completedExercises);
        this.addXP(Math.floor(accuracy * 8 + duration * 0.5));
        this.saveProgressData();
    }

    /**
     * 更新阅读进度
     */
    updateReadingProgress(wordsRead, timeSpent, comprehension, genre = 'general') {
        const reading = this.progressData.reading;
        reading.articlesRead += 1;
        
        // 计算阅读速度
        const wpm = Math.floor(wordsRead / (timeSpent / 60));
        reading.wordsPerMinute = Math.floor((reading.wordsPerMinute + wpm) / 2);
        
        // 更新理解率
        const alpha = 0.1;
        reading.comprehensionRate = reading.comprehensionRate * (1 - alpha) + comprehension * alpha;

        if (!reading.genres[genre]) {
            reading.genres[genre] = { articles: 0, avgComprehension: 0 };
        }
        reading.genres[genre].articles += 1;
        reading.genres[genre].avgComprehension = comprehension;

        const today = new Date().getDay();
        reading.weeklyProgress[today] += 1;

        this.addXP(Math.floor(comprehension * 10 + wordsRead * 0.01));
        this.saveProgressData();
    }

    /**
     * 更新写作进度
     */
    updateWritingProgress(wordCount, score, skillType = 'general') {
        const writing = this.progressData.writing;
        writing.essaysWritten += 1;
        writing.wordCount += wordCount;
        
        // 更新平均分数
        writing.averageScore = (writing.averageScore * (writing.essaysWritten - 1) + score) / writing.essaysWritten;

        if (!writing.skills[skillType]) {
            writing.skills[skillType] = { count: 0, avgScore: 0 };
        }
        writing.skills[skillType].count += 1;
        writing.skills[skillType].avgScore = score;

        const today = new Date().getDay();
        writing.weeklyProgress[today] += 1;

        this.addXP(Math.floor(score * 5 + wordCount * 0.02));
        this.saveProgressData();
    }

    /**
     * 更新口语进度
     */
    updateSpeakingProgress(duration, score, skillType = 'general') {
        const speaking = this.progressData.speaking;
        speaking.sessionsCompleted += 1;
        speaking.practiceMinutes += duration;
        
        // 更新平均分数
        speaking.averageScore = (speaking.averageScore * (speaking.sessionsCompleted - 1) + score) / speaking.sessionsCompleted;

        if (!speaking.skills[skillType]) {
            speaking.skills[skillType] = { sessions: 0, avgScore: 0 };
        }
        speaking.skills[skillType].sessions += 1;
        speaking.skills[skillType].avgScore = score;

        const today = new Date().getDay();
        speaking.weeklyProgress[today] += 1;

        this.addXP(Math.floor(score * 4 + duration * 0.3));
        this.saveProgressData();
    }

    /**
     * 更新学习连击
     */
    updateStreak() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        const lastStudyDate = localStorage.getItem('lastStudyDate');

        if (lastStudyDate === today) {
            // 今天已经学习过了
            return;
        }

        if (lastStudyDate === yesterday) {
            // 连续学习
            this.progressData.overall.currentStreak += 1;
        } else {
            // 中断了连击
            this.progressData.overall.currentStreak = 1;
        }

        this.progressData.overall.longestStreak = Math.max(
            this.progressData.overall.longestStreak,
            this.progressData.overall.currentStreak
        );

        localStorage.setItem('lastStudyDate', today);
        this.checkMilestones('overall', this.progressData.overall.currentStreak);
        this.saveProgressData();
    }

    /**
     * 添加经验值
     */
    addXP(amount) {
        this.progressData.overall.xp += amount;
        this.updateLevel();
    }

    /**
     * 更新等级
     */
    updateLevel() {
        const xp = this.progressData.overall.xp;
        let level = 'beginner';
        
        if (xp >= 10000) level = 'expert';
        else if (xp >= 5000) level = 'advanced';
        else if (xp >= 2000) level = 'intermediate';
        else if (xp >= 500) level = 'elementary';

        if (level !== this.progressData.overall.level) {
            this.progressData.overall.level = level;
            this.triggerLevelUp(level);
        }
    }

    /**
     * 触发升级事件
     */
    triggerLevelUp(newLevel) {
        const event = new CustomEvent('levelUp', {
            detail: { 
                newLevel, 
                xp: this.progressData.overall.xp,
                message: `恭喜！您已升级到 ${this.getLevelName(newLevel)} 级别！`
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取等级名称
     */
    getLevelName(level) {
        const names = {
            'beginner': '初学者',
            'elementary': '入门',
            'intermediate': '中级',
            'advanced': '高级',
            'expert': '专家'
        };
        return names[level] || '未知';
    }

    /**
     * 检查里程碑
     */
    checkMilestones(category, currentValue) {
        const milestones = this.milestones[category] || [];
        
        milestones.forEach(milestone => {
            if (currentValue >= milestone.threshold && !this.isAchievementUnlocked(milestone.title)) {
                this.unlockAchievement(milestone);
            }
        });
    }

    /**
     * 解锁成就
     */
    unlockAchievement(milestone) {
        const achievement = {
            id: Date.now(),
            title: milestone.title,
            icon: milestone.icon,
            reward: milestone.reward,
            unlockedAt: new Date().toISOString()
        };

        this.achievements.push(achievement);
        
        const event = new CustomEvent('achievementUnlocked', {
            detail: achievement
        });
        document.dispatchEvent(event);

        this.saveProgressData();
    }

    /**
     * 检查成就是否已解锁
     */
    isAchievementUnlocked(title) {
        return this.achievements.some(achievement => achievement.title === title);
    }

    /**
     * 获取进度统计
     */
    getProgressStats() {
        return {
            vocabulary: {
                completion: (this.progressData.vocabulary.learned / this.progressData.vocabulary.total) * 100,
                weeklyAvg: this.progressData.vocabulary.weeklyProgress.reduce((a, b) => a + b, 0) / 7,
                ...this.progressData.vocabulary
            },
            grammar: {
                completion: (this.progressData.grammar.topicsCompleted / this.progressData.grammar.totalTopics) * 100,
                weeklyAvg: this.progressData.grammar.weeklyProgress.reduce((a, b) => a + b, 0) / 7,
                ...this.progressData.grammar
            },
            listening: {
                completion: (this.progressData.listening.completedExercises / this.progressData.listening.totalExercises) * 100,
                weeklyAvg: this.progressData.listening.weeklyProgress.reduce((a, b) => a + b, 0) / 7,
                ...this.progressData.listening
            },
            reading: {
                completion: (this.progressData.reading.articlesRead / this.progressData.reading.totalArticles) * 100,
                weeklyAvg: this.progressData.reading.weeklyProgress.reduce((a, b) => a + b, 0) / 7,
                ...this.progressData.reading
            },
            overall: {
                ...this.progressData.overall,
                levelProgress: this.getLevelProgress(),
                achievements: this.achievements.length
            }
        };
    }

    /**
     * 获取等级进度
     */
    getLevelProgress() {
        const xp = this.progressData.overall.xp;
        const thresholds = { beginner: 0, elementary: 500, intermediate: 2000, advanced: 5000, expert: 10000 };
        const currentLevel = this.progressData.overall.level;
        const levels = Object.keys(thresholds);
        const currentIndex = levels.indexOf(currentLevel);
        
        if (currentIndex === levels.length - 1) {
            return { current: xp, next: xp, progress: 100 };
        }

        const currentThreshold = thresholds[currentLevel];
        const nextThreshold = thresholds[levels[currentIndex + 1]];
        const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

        return {
            current: xp - currentThreshold,
            next: nextThreshold - currentThreshold,
            progress: Math.min(100, Math.max(0, progress))
        };
    }

    /**
     * 生成学习报告
     */
    generateReport(period = 'week') {
        const stats = this.getProgressStats();
        const report = {
            period,
            generatedAt: new Date().toISOString(),
            summary: {
                totalXP: stats.overall.xp,
                currentLevel: stats.overall.level,
                currentStreak: stats.overall.currentStreak,
                achievements: stats.overall.achievements
            },
            modules: {
                vocabulary: {
                    progress: Math.round(stats.vocabulary.completion),
                    weeklyActivity: stats.vocabulary.weeklyAvg,
                    learned: stats.vocabulary.learned,
                    mastered: stats.vocabulary.mastered
                },
                grammar: {
                    progress: Math.round(stats.grammar.completion),
                    accuracy: Math.round(stats.grammar.accuracy * 100),
                    topicsCompleted: stats.grammar.topicsCompleted
                },
                listening: {
                    progress: Math.round(stats.listening.completion),
                    hoursListened: Math.round(stats.listening.hoursListened * 10) / 10,
                    accuracy: Math.round(stats.listening.accuracy * 100)
                },
                reading: {
                    progress: Math.round(stats.reading.completion),
                    articlesRead: stats.reading.articlesRead,
                    wpm: stats.reading.wordsPerMinute
                }
            },
            recommendations: this.generateRecommendations(stats)
        };

        return report;
    }

    /**
     * 生成学习建议
     */
    generateRecommendations(stats) {
        const recommendations = [];

        // 基于完成度的建议
        if (stats.vocabulary.completion < 50) {
            recommendations.push({
                type: 'vocabulary',
                priority: 'high',
                message: '建议加强词汇学习，每日目标50个新单词'
            });
        }

        if (stats.grammar.accuracy < 0.7) {
            recommendations.push({
                type: 'grammar',
                priority: 'high',
                message: '语法准确率较低，建议重点复习基础语法'
            });
        }

        if (stats.listening.hoursListened < 1) {
            recommendations.push({
                type: 'listening',
                priority: 'medium',
                message: '听力练习时间不足，建议每日至少30分钟'
            });
        }

        // 基于连击的建议
        if (stats.overall.currentStreak === 0) {
            recommendations.push({
                type: 'habit',
                priority: 'high',
                message: '保持学习习惯很重要，建议制定每日学习计划'
            });
        }

        return recommendations;
    }

    /**
     * 重置学习进度
     */
    async resetProgress() {
        try {
            console.log('🔄 重置学习进度追踪数据...');
            
            // 重置内存中的进度数据，但保持合理的默认值
            this.progressData = {
                overall: {
                    xp: 0,
                    level: 'beginner',
                    currentStreak: 0,
                    longestStreak: 0,
                    totalStudyTime: 0,
                    studyDays: 0,
                    achievements: 0
                },
                vocabulary: {
                    learned: 0,
                    mastered: 0,
                    reviewing: 0,
                    total: 4000,
                    dailyGoal: 50,
                    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
                    categories: {},
                    accuracy: 0
                },
                grammar: {
                    topicsCompleted: 0,
                    totalTopics: 20,
                    accuracy: 0,
                    practiceCount: 0,
                    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
                    topicProgress: {}
                },
                listening: {
                    hoursListened: 0,
                    accuracy: 0,
                    speed: 'normal',
                    completedExercises: 0,
                    totalExercises: 100,
                    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
                    skillLevels: {}
                },
                reading: {
                    articlesRead: 0,
                    wordsPerMinute: 200,
                    comprehensionRate: 0,
                    totalArticles: 50,
                    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
                    genres: {}
                },
                writing: {
                    essaysWritten: 0,
                    averageScore: 0,
                    totalEssays: 20,
                    wordCount: 0,
                    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
                    skills: {}
                },
                speaking: {
                    sessionsCompleted: 0,
                    averageScore: 0,
                    totalSessions: 30,
                    practiceMinutes: 0,
                    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
                    skills: {}
                }
            };
            
            // 清除存储中的数据
            await Storage.remove('progress_data');
            
            // 重新保存默认进度数据
            await this.saveProgressData();
            
            console.log('✅ 学习进度追踪数据已重置');
        } catch (error) {
            console.error('❌ 重置进度追踪数据失败:', error);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
} else {
    window.ProgressTracker = ProgressTracker;
}

console.log('📈 学习进度追踪系统已加载');
