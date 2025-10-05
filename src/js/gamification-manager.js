/**
 * 游戏化系统管理器
 * 提供成就、等级、徽章、挑战等游戏化功能
 */
class GamificationManager {
    constructor() {
        this.playerData = null;
        this.achievements = [];
        this.badges = [];
        this.challenges = [];
        this.levelSystem = null;
        this.streakSystem = null;
        this.init();
    }

    init() {
        console.log('🎮 初始化游戏化系统...');
        this.loadPlayerData();
        this.initializeAchievements();
        this.initializeBadges();
        this.initializeLevelSystem();
        this.initializeStreakSystem();
        this.initializeDailyChallenges();
        this.checkForNewAchievements();
    }

    /**
     * 加载玩家数据
     */
    loadPlayerData() {
        try {
            const saved = localStorage.getItem('gamification_player_data');
            this.playerData = saved ? JSON.parse(saved) : {
                level: 1,
                experience: 0,
                totalExp: 0,
                coins: 0,
                streakDays: 0,
                lastStudyDate: null,
                unlockedAchievements: [],
                earnedBadges: [],
                completedChallenges: [],
                stats: {
                    totalStudyTime: 0,
                    totalSessions: 0,
                    perfectScores: 0,
                    wordsLearned: 0,
                    articlesRead: 0,
                    writingsCompleted: 0,
                    errorsReviewed: 0
                },
                preferences: {
                    showNotifications: true,
                    soundEffects: true,
                    animations: true
                },
                lastUpdated: Date.now()
            };
            console.log('👤 玩家数据已加载:', this.playerData);
        } catch (error) {
            console.error('❌ 加载玩家数据失败:', error);
            this.playerData = this.getDefaultPlayerData();
        }
    }

    /**
     * 获取默认玩家数据
     */
    getDefaultPlayerData() {
        return {
            level: 1,
            experience: 0,
            totalExp: 0,
            coins: 0,
            streakDays: 0,
            lastStudyDate: null,
            unlockedAchievements: [],
            earnedBadges: [],
            completedChallenges: [],
            stats: {
                totalStudyTime: 0,
                totalSessions: 0,
                perfectScores: 0,
                wordsLearned: 0,
                articlesRead: 0,
                writingsCompleted: 0,
                errorsReviewed: 0
            },
            preferences: {
                showNotifications: true,
                soundEffects: true,
                animations: true
            },
            lastUpdated: Date.now()
        };
    }

    /**
     * 保存玩家数据
     */
    savePlayerData() {
        try {
            this.playerData.lastUpdated = Date.now();
            localStorage.setItem('gamification_player_data', JSON.stringify(this.playerData));
            console.log('💾 玩家数据已保存');
        } catch (error) {
            console.error('❌ 保存玩家数据失败:', error);
        }
    }

    /**
     * 初始化成就系统
     */
    initializeAchievements() {
        this.achievements = [
            // 学习频率成就
            {
                id: 'first_study',
                title: '初来乍到',
                description: '完成第一次学习',
                icon: '🎯',
                type: 'milestone',
                condition: (stats) => stats.totalSessions >= 1,
                reward: { exp: 10, coins: 5 },
                rarity: 'common'
            },
            {
                id: 'streak_3',
                title: '坚持不懈',
                description: '连续学习3天',
                icon: '🔥',
                type: 'streak',
                condition: (stats, player) => player.streakDays >= 3,
                reward: { exp: 50, coins: 20 },
                rarity: 'common'
            },
            {
                id: 'streak_7',
                title: '一周达人',
                description: '连续学习7天',
                icon: '⭐',
                type: 'streak',
                condition: (stats, player) => player.streakDays >= 7,
                reward: { exp: 100, coins: 50 },
                rarity: 'uncommon'
            },
            {
                id: 'streak_30',
                title: '月度学霸',
                description: '连续学习30天',
                icon: '🏆',
                type: 'streak',
                condition: (stats, player) => player.streakDays >= 30,
                reward: { exp: 500, coins: 200 },
                rarity: 'rare'
            },

            // 学习成果成就
            {
                id: 'words_100',
                title: '词汇入门',
                description: '学习100个单词',
                icon: '📚',
                type: 'progress',
                condition: (stats) => stats.wordsLearned >= 100,
                reward: { exp: 100, coins: 30 },
                rarity: 'common'
            },
            {
                id: 'words_500',
                title: '词汇达人',
                description: '学习500个单词',
                icon: '📖',
                type: 'progress',
                condition: (stats) => stats.wordsLearned >= 500,
                reward: { exp: 300, coins: 100 },
                rarity: 'uncommon'
            },
            {
                id: 'words_1000',
                title: '词汇大师',
                description: '学习1000个单词',
                icon: '🎓',
                type: 'progress',
                condition: (stats) => stats.wordsLearned >= 1000,
                reward: { exp: 500, coins: 200 },
                rarity: 'rare'
            },

            // 阅读成就
            {
                id: 'articles_10',
                title: '阅读新手',
                description: '完成10篇阅读理解',
                icon: '📰',
                type: 'progress',
                condition: (stats) => stats.articlesRead >= 10,
                reward: { exp: 80, coins: 25 },
                rarity: 'common'
            },
            {
                id: 'articles_50',
                title: '阅读高手',
                description: '完成50篇阅读理解',
                icon: '📑',
                type: 'progress',
                condition: (stats) => stats.articlesRead >= 50,
                reward: { exp: 200, coins: 75 },
                rarity: 'uncommon'
            },

            // 写作成就
            {
                id: 'writings_5',
                title: '笔耕不辍',
                description: '完成5篇写作练习',
                icon: '✍️',
                type: 'progress',
                condition: (stats) => stats.writingsCompleted >= 5,
                reward: { exp: 120, coins: 40 },
                rarity: 'common'
            },
            {
                id: 'writings_20',
                title: '写作能手',
                description: '完成20篇写作练习',
                icon: '📝',
                type: 'progress',
                condition: (stats) => stats.writingsCompleted >= 20,
                reward: { exp: 300, coins: 100 },
                rarity: 'uncommon'
            },

            // 完美表现成就
            {
                id: 'perfect_10',
                title: '完美十次',
                description: '获得10次满分',
                icon: '💯',
                type: 'performance',
                condition: (stats) => stats.perfectScores >= 10,
                reward: { exp: 200, coins: 80 },
                rarity: 'uncommon'
            },
            {
                id: 'perfect_50',
                title: '完美主义者',
                description: '获得50次满分',
                icon: '🌟',
                type: 'performance',
                condition: (stats) => stats.perfectScores >= 50,
                reward: { exp: 500, coins: 200 },
                rarity: 'rare'
            },

            // 时间成就
            {
                id: 'time_10h',
                title: '努力学习',
                description: '累计学习10小时',
                icon: '⏰',
                type: 'time',
                condition: (stats) => stats.totalStudyTime >= 600, // 10小时 = 600分钟
                reward: { exp: 150, coins: 50 },
                rarity: 'common'
            },
            {
                id: 'time_100h',
                title: '学习之星',
                description: '累计学习100小时',
                icon: '⭐',
                type: 'time',
                condition: (stats) => stats.totalStudyTime >= 6000, // 100小时
                reward: { exp: 800, coins: 300 },
                rarity: 'rare'
            },

            // 特殊成就
            {
                id: 'error_master',
                title: '错题克星',
                description: '复习100个错题',
                icon: '🎯',
                type: 'special',
                condition: (stats) => stats.errorsReviewed >= 100,
                reward: { exp: 200, coins: 80 },
                rarity: 'uncommon'
            },
            {
                id: 'all_modules',
                title: '全能学者',
                description: '尝试所有学习模块',
                icon: '🏅',
                type: 'special',
                condition: (stats) => stats.wordsLearned > 0 && stats.articlesRead > 0 && stats.writingsCompleted > 0,
                reward: { exp: 300, coins: 150 },
                rarity: 'rare'
            }
        ];

        console.log('🏆 成就系统已初始化:', this.achievements.length, '个成就');
    }

    /**
     * 初始化徽章系统
     */
    initializeBadges() {
        this.badges = [
            {
                id: 'early_bird',
                name: '早鸟学者',
                description: '在早上6-9点学习',
                icon: '🌅',
                condition: () => {
                    const hour = new Date().getHours();
                    return hour >= 6 && hour < 9;
                }
            },
            {
                id: 'night_owl',
                name: '夜猫学者',
                description: '在晚上9-12点学习',
                icon: '🦉',
                condition: () => {
                    const hour = new Date().getHours();
                    return hour >= 21 || hour < 1;
                }
            },
            {
                id: 'weekend_warrior',
                name: '周末勇士',
                description: '在周末学习',
                icon: '⚔️',
                condition: () => {
                    const day = new Date().getDay();
                    return day === 0 || day === 6;
                }
            },
            {
                id: 'speed_learner',
                name: '速度学者',
                description: '30分钟内完成多项练习',
                icon: '⚡',
                condition: null // 需要特殊检测
            },
            {
                id: 'perfectionist',
                name: '完美主义',
                description: '连续5次获得满分',
                icon: '💎',
                condition: null // 需要特殊检测
            }
        ];

        console.log('🎖️ 徽章系统已初始化:', this.badges.length, '个徽章');
    }

    /**
     * 初始化等级系统
     */
    initializeLevelSystem() {
        this.levelSystem = {
            getRequiredExp: (level) => {
                // 指数增长公式：每级所需经验值递增
                return Math.floor(100 * Math.pow(1.5, level - 1));
            },
            getLevelFromExp: (totalExp) => {
                let level = 1;
                let requiredExp = 0;
                while (totalExp >= requiredExp) {
                    requiredExp += this.levelSystem.getRequiredExp(level);
                    if (totalExp >= requiredExp) {
                        level++;
                    }
                }
                return level;
            },
            getExpForNextLevel: (currentLevel, currentExp) => {
                return this.levelSystem.getRequiredExp(currentLevel + 1) - currentExp;
            },
            getLevelTitle: (level) => {
                if (level < 5) return '新手学者';
                if (level < 10) return '初级学者';
                if (level < 20) return '中级学者';
                if (level < 35) return '高级学者';
                if (level < 50) return '专家学者';
                if (level < 75) return '大师学者';
                return '传奇学者';
            }
        };

        console.log('📊 等级系统已初始化');
    }

    /**
     * 初始化连续学习系统
     */
    initializeStreakSystem() {
        this.streakSystem = {
            updateStreak: () => {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const lastStudy = this.playerData.lastStudyDate ? new Date(this.playerData.lastStudyDate) : null;
                
                if (!lastStudy) {
                    // 第一次学习
                    this.playerData.streakDays = 1;
                    this.playerData.lastStudyDate = today.getTime();
                    console.log('🔥 开始连续学习记录：第1天');
                    return true;
                }

                const lastStudyDate = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());
                const daysDiff = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));

                if (daysDiff === 0) {
                    // 今天已经学习过了
                    return false;
                } else if (daysDiff === 1) {
                    // 连续学习
                    this.playerData.streakDays++;
                    this.playerData.lastStudyDate = today.getTime();
                    console.log('🔥 连续学习记录更新：第' + this.playerData.streakDays + '天');
                    return true;
                } else {
                    // 中断了连续学习
                    console.log('💔 连续学习中断，重新开始');
                    this.playerData.streakDays = 1;
                    this.playerData.lastStudyDate = today.getTime();
                    return true;
                }
            },
            getStreakReward: (streakDays) => {
                const rewards = {
                    3: { exp: 30, coins: 10, message: '连续3天学习奖励！' },
                    7: { exp: 100, coins: 50, message: '连续一周学习奖励！' },
                    14: { exp: 250, coins: 100, message: '连续两周学习奖励！' },
                    30: { exp: 500, coins: 200, message: '连续一月学习奖励！' }
                };
                return rewards[streakDays] || null;
            }
        };

        console.log('🔥 连续学习系统已初始化');
    }

    /**
     * 初始化每日挑战
     */
    initializeDailyChallenges() {
        const today = new Date().toDateString();
        const savedChallenges = localStorage.getItem('daily_challenges');
        const lastGenerated = localStorage.getItem('challenges_date');

        if (lastGenerated === today && savedChallenges) {
            this.challenges = JSON.parse(savedChallenges);
        } else {
            this.generateDailyChallenges();
        }

        console.log('🎯 每日挑战已初始化:', this.challenges.length, '个挑战');
    }

    /**
     * 获取玩家统计数据
     */
    getPlayerStats() {
        const defaultStats = {
            experience: 0,
            level: 1,
            totalStudyTime: 0,
            wordsLearned: 0,
            testsCompleted: 0,
            streak: 0,
            achievements: [],
            badges: []
        };

        try {
            const saved = localStorage.getItem('gamification_player_stats');
            if (saved) {
                const stats = JSON.parse(saved);
                return { ...defaultStats, ...stats };
            }
        } catch (error) {
            console.warn('⚠️ 无法加载玩家统计数据，使用默认值:', error);
        }

        return defaultStats;
    }

    /**
     * 保存玩家统计数据
     */
    savePlayerStats(stats) {
        try {
            localStorage.setItem('gamification_player_stats', JSON.stringify(stats));
        } catch (error) {
            console.error('❌ 无法保存玩家统计数据:', error);
        }
    }

    /**
     * 获取用户等级
     */
    getUserLevel() {
        const stats = this.getPlayerStats();
        const totalExp = stats.experience || 0;
        
        // 根据经验值计算等级
        if (totalExp < 100) return 1;
        if (totalExp < 300) return 2;
        if (totalExp < 600) return 3;
        if (totalExp < 1000) return 4;
        if (totalExp < 1500) return 5;
        return Math.min(10, Math.floor(totalExp / 300) + 1);
    }

    /**
     * 生成每日挑战
     */
    generateDailyChallenges() {
        const challengePool = [
            {
                id: 'vocab_challenge',
                title: '词汇挑战',
                description: '今天学习20个新单词',
                icon: '📚',
                type: 'vocabulary',
                target: 20,
                current: 0,
                reward: { exp: 50, coins: 20 }
            },
            {
                id: 'reading_challenge',
                title: '阅读挑战',
                description: '完成3篇阅读理解',
                icon: '📖',
                type: 'reading',
                target: 3,
                current: 0,
                reward: { exp: 60, coins: 25 }
            },
            {
                id: 'grammar_challenge',
                title: '语法挑战',
                description: '完成10道语法题',
                icon: '📝',
                type: 'grammar',
                target: 10,
                current: 0,
                reward: { exp: 40, coins: 15 }
            },
            {
                id: 'listening_challenge',
                title: '听力挑战',
                description: '完成5个听力练习',
                icon: '🎧',
                type: 'listening',
                target: 5,
                current: 0,
                reward: { exp: 45, coins: 18 }
            },
            {
                id: 'perfect_challenge',
                title: '完美挑战',
                description: '获得3次满分',
                icon: '💯',
                type: 'perfect',
                target: 3,
                current: 0,
                reward: { exp: 80, coins: 35 }
            },
            {
                id: 'time_challenge',
                title: '时间挑战',
                description: '学习45分钟',
                icon: '⏱️',
                type: 'time',
                target: 45,
                current: 0,
                reward: { exp: 55, coins: 22 }
            }
        ];

        // 基于用户进度选择3个挑战
        this.challenges = [];
        const userLevel = this.getUserLevel();
        const shuffled = challengePool.sort((a, b) => {
            // 基于用户等级和挑战难度排序
            const aScore = Math.abs(a.difficulty - userLevel);
            const bScore = Math.abs(b.difficulty - userLevel);
            return aScore - bScore;
        });
        for (let i = 0; i < 3; i++) {
            this.challenges.push({ ...shuffled[i] });
        }

        // 保存挑战
        const today = new Date().toDateString();
        localStorage.setItem('daily_challenges', JSON.stringify(this.challenges));
        localStorage.setItem('challenges_date', today);

        console.log('🎯 每日挑战已生成');
    }

    /**
     * 记录学习活动
     */
    recordActivity(activity) {
        console.log('📊 记录游戏化活动:', activity);

        // 更新连续学习
        const streakUpdated = this.streakSystem.updateStreak();
        if (streakUpdated) {
            const reward = this.streakSystem.getStreakReward(this.playerData.streakDays);
            if (reward) {
                this.awardReward(reward.exp, reward.coins, reward.message);
            }
        }

        // 更新统计数据
        this.updateStats(activity);

        // 更新每日挑战
        this.updateChallenges(activity);

        // 检查新成就
        this.checkForNewAchievements();

        // 检查新徽章
        this.checkForNewBadges(activity);

        // 保存数据
        this.savePlayerData();

        // 广播更新事件
        this.broadcastUpdate();
    }

    /**
     * 更新统计数据
     */
    updateStats(activity) {
        const stats = this.playerData.stats;
        
        switch (activity.type) {
            case 'vocabulary':
                stats.wordsLearned += activity.count || 1;
                if (activity.score === 100) stats.perfectScores++;
                break;
            case 'grammar':
                if (activity.score === 100) stats.perfectScores++;
                break;
            case 'listening':
                if (activity.score === 100) stats.perfectScores++;
                break;
            case 'reading':
                stats.articlesRead += activity.count || 1;
                if (activity.score >= 90) stats.perfectScores++;
                break;
            case 'writing':
                stats.writingsCompleted += activity.count || 1;
                if (activity.score >= 90) stats.perfectScores++;
                break;
            case 'error_review':
                stats.errorsReviewed += activity.count || 1;
                break;
        }

        if (activity.duration) {
            stats.totalStudyTime += activity.duration;
        }
        
        stats.totalSessions++;
    }

    /**
     * 更新每日挑战进度
     */
    updateChallenges(activity) {
        this.challenges.forEach(challenge => {
            if (challenge.completed) return;

            let progress = 0;
            switch (challenge.type) {
                case 'vocabulary':
                    if (activity.type === 'vocabulary') {
                        progress = activity.count || 1;
                    }
                    break;
                case 'reading':
                    if (activity.type === 'reading') {
                        progress = activity.count || 1;
                    }
                    break;
                case 'grammar':
                    if (activity.type === 'grammar') {
                        progress = activity.count || 1;
                    }
                    break;
                case 'listening':
                    if (activity.type === 'listening') {
                        progress = activity.count || 1;
                    }
                    break;
                case 'perfect':
                    if (activity.score === 100) {
                        progress = 1;
                    }
                    break;
                case 'time':
                    if (activity.duration) {
                        progress = Math.floor(activity.duration / 60); // 转换为分钟
                    }
                    break;
            }

            if (progress > 0) {
                challenge.current = Math.min(challenge.current + progress, challenge.target);
                
                if (challenge.current >= challenge.target && !challenge.completed) {
                    challenge.completed = true;
                    this.completeDailyChallenge(challenge);
                }
            }
        });

        // 保存挑战进度
        localStorage.setItem('daily_challenges', JSON.stringify(this.challenges));
    }

    /**
     * 完成每日挑战
     */
    completeDailyChallenge(challenge) {
        console.log('🎯 完成每日挑战:', challenge.title);
        
        // 给予奖励
        this.awardReward(
            challenge.reward.exp,
            challenge.reward.coins,
            `完成挑战"${challenge.title}"！`
        );

        // 记录完成的挑战
        this.playerData.completedChallenges.push({
            id: challenge.id,
            completedAt: Date.now()
        });

        // 显示庆祝动画
        this.showCelebration('challenge', challenge);
    }

    /**
     * 检查新成就
     */
    checkForNewAchievements() {
        const unlockedBefore = this.playerData.unlockedAchievements.length;
        
        this.achievements.forEach(achievement => {
            if (this.playerData.unlockedAchievements.includes(achievement.id)) {
                return; // 已解锁
            }

            if (achievement.condition(this.playerData.stats, this.playerData)) {
                this.unlockAchievement(achievement);
            }
        });

        const unlockedAfter = this.playerData.unlockedAchievements.length;
        if (unlockedAfter > unlockedBefore) {
            console.log('🏆 解锁了', unlockedAfter - unlockedBefore, '个新成就');
        }
    }

    /**
     * 解锁成就
     */
    unlockAchievement(achievement) {
        console.log('🏆 解锁成就:', achievement.title);
        
        this.playerData.unlockedAchievements.push(achievement.id);
        
        // 给予奖励
        this.awardReward(
            achievement.reward.exp,
            achievement.reward.coins,
            `解锁成就"${achievement.title}"！`
        );

        // 显示庆祝动画
        this.showCelebration('achievement', achievement);
    }

    /**
     * 检查新徽章
     */
    checkForNewBadges(activity) {
        this.badges.forEach(badge => {
            if (this.playerData.earnedBadges.some(b => b.id === badge.id)) {
                return; // 已获得
            }

            let earned = false;
            
            if (badge.condition && badge.condition()) {
                earned = true;
            } else if (badge.id === 'speed_learner' && activity.fastCompletion) {
                earned = true;
            } else if (badge.id === 'perfectionist' && this.checkConsecutivePerfects()) {
                earned = true;
            }

            if (earned) {
                this.earnBadge(badge);
            }
        });
    }

    /**
     * 检查连续完美表现
     */
    checkConsecutivePerfects() {
        // 这里可以实现检查最近是否有连续5次满分的逻辑
        // 简化实现：检查最近的完美分数数量
        return this.playerData.stats.perfectScores >= 5;
    }

    /**
     * 获得徽章
     */
    earnBadge(badge) {
        console.log('🎖️ 获得徽章:', badge.name);
        
        this.playerData.earnedBadges.push({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            earnedAt: Date.now()
        });

        // 徽章奖励
        this.awardReward(25, 10, `获得徽章"${badge.name}"！`);

        // 显示庆祝动画
        this.showCelebration('badge', badge);
    }

    /**
     * 给予奖励
     */
    awardReward(exp, coins, message) {
        const oldLevel = this.playerData.level;
        
        // 添加经验值
        this.playerData.experience += exp;
        this.playerData.totalExp += exp;
        
        // 添加金币
        this.playerData.coins += coins;
        
        // 检查升级
        const newLevel = this.levelSystem.getLevelFromExp(this.playerData.totalExp);
        if (newLevel > oldLevel) {
            this.playerData.level = newLevel;
            this.showLevelUp(oldLevel, newLevel);
        }

        console.log(`💰 获得奖励: +${exp}经验 +${coins}金币`);
        
        // 显示奖励通知
        if (window.app && message) {
            window.app.showNotification(message, 'success');
        }
    }

    /**
     * 显示升级动画
     */
    showLevelUp(oldLevel, newLevel) {
        console.log('🎉 等级提升:', oldLevel, '->', newLevel);
        
        const levelTitle = this.levelSystem.getLevelTitle(newLevel);
        const message = `恭喜升级到 Lv.${newLevel} ${levelTitle}！`;
        
        if (window.app) {
            window.app.showNotification(message, 'success');
        }

        // 升级奖励
        const levelBonus = newLevel * 20; // 每级20金币奖励
        this.playerData.coins += levelBonus;
        
        this.showCelebration('levelup', { newLevel, levelTitle });
    }

    /**
     * 显示庆祝动画
     */
    showCelebration(type, data) {
        if (!this.playerData.preferences.animations) return;

        // 这里可以实现具体的庆祝动画
        console.log('🎊 显示庆祝动画:', type, data);
        
        // 广播庆祝事件
        if (window.app) {
            window.dispatchEvent(new CustomEvent('gamificationCelebration', {
                detail: { type, data }
            }));
        }
    }

    /**
     * 广播更新事件
     */
    broadcastUpdate() {
        if (window.app) {
            window.dispatchEvent(new CustomEvent('gamificationUpdate', {
                detail: this.getPlayerSummary()
            }));
        }
    }

    /**
     * 获取玩家概要信息
     */
    getPlayerSummary() {
        return {
            level: this.playerData.level,
            levelTitle: this.levelSystem.getLevelTitle(this.playerData.level),
            experience: this.playerData.experience,
            totalExp: this.playerData.totalExp,
            coins: this.playerData.coins,
            streakDays: this.playerData.streakDays,
            achievementsCount: this.playerData.unlockedAchievements.length,
            badgesCount: this.playerData.earnedBadges.length,
            completedChallenges: this.challenges.filter(c => c.completed).length,
            totalChallenges: this.challenges.length
        };
    }

    /**
     * 获取玩家详细信息
     */
    getPlayerData() {
        return { ...this.playerData };
    }

    /**
     * 获取成就列表
     */
    getAchievements() {
        return this.achievements.map(achievement => ({
            ...achievement,
            unlocked: this.playerData.unlockedAchievements.includes(achievement.id),
            progress: this.getAchievementProgress(achievement)
        }));
    }

    /**
     * 获取成就进度
     */
    getAchievementProgress(achievement) {
        // 根据不同类型的成就计算进度
        const stats = this.playerData.stats;
        const player = this.playerData;
        
        switch (achievement.type) {
            case 'milestone':
                return stats.totalSessions >= 1 ? 1 : 0;
            case 'streak':
                if (achievement.id === 'streak_3') return Math.min(player.streakDays / 3, 1);
                if (achievement.id === 'streak_7') return Math.min(player.streakDays / 7, 1);
                if (achievement.id === 'streak_30') return Math.min(player.streakDays / 30, 1);
                break;
            case 'progress':
                if (achievement.id.includes('words')) {
                    const target = parseInt(achievement.id.split('_')[1]);
                    return Math.min(stats.wordsLearned / target, 1);
                }
                if (achievement.id.includes('articles')) {
                    const target = parseInt(achievement.id.split('_')[1]);
                    return Math.min(stats.articlesRead / target, 1);
                }
                if (achievement.id.includes('writings')) {
                    const target = parseInt(achievement.id.split('_')[1]);
                    return Math.min(stats.writingsCompleted / target, 1);
                }
                break;
            case 'performance':
                if (achievement.id.includes('perfect')) {
                    const target = parseInt(achievement.id.split('_')[1]);
                    return Math.min(stats.perfectScores / target, 1);
                }
                break;
            case 'time':
                if (achievement.id === 'time_10h') return Math.min(stats.totalStudyTime / 600, 1);
                if (achievement.id === 'time_100h') return Math.min(stats.totalStudyTime / 6000, 1);
                break;
        }
        
        return achievement.condition(stats, player) ? 1 : 0;
    }

    /**
     * 获取徽章列表
     */
    getBadges() {
        return this.badges.map(badge => ({
            ...badge,
            earned: this.playerData.earnedBadges.some(b => b.id === badge.id),
            earnedAt: this.playerData.earnedBadges.find(b => b.id === badge.id)?.earnedAt
        }));
    }

    /**
     * 获取每日挑战
     */
    getDailyChallenges() {
        return [...this.challenges];
    }

    /**
     * 获取等级信息
     */
    getLevelInfo() {
        const level = this.playerData.level;
        const exp = this.playerData.experience;
        const totalExp = this.playerData.totalExp;
        
        return {
            level,
            levelTitle: this.levelSystem.getLevelTitle(level),
            experience: exp,
            totalExp,
            requiredForNext: this.levelSystem.getRequiredExp(level + 1),
            expForNextLevel: this.levelSystem.getExpForNextLevel(level, exp),
            progressPercent: (exp / this.levelSystem.getRequiredExp(level + 1)) * 100
        };
    }

    /**
     * 重置每日挑战（测试用）
     */
    resetDailyChallenges() {
        localStorage.removeItem('daily_challenges');
        localStorage.removeItem('challenges_date');
        this.initializeDailyChallenges();
    }

    /**
     * 重置玩家数据（测试用）
     */
    resetPlayerData() {
        localStorage.removeItem('gamification_player_data');
        this.loadPlayerData();
        this.broadcastUpdate();
    }
}

// 导出管理器
if (typeof window !== 'undefined') {
    window.GamificationManager = GamificationManager;
    console.log('🎮 游戏化系统管理器已加载');
}
