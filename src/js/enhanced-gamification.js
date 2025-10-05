/**
 * 增强游戏化学习系统
 * 提供丰富的游戏元素和激励机制
 */
class EnhancedGamification {
    constructor() {
        this.player = null;
        this.achievements = [];
        this.dailyChallenges = [];
        this.seasonalEvents = [];
        this.leaderboards = {};
        this.socialFeatures = {};
        this.rewardSystem = null;
        this.progressSystem = null;
        this.init();
    }

    init() {
        console.log('🎮 初始化增强游戏化系统...');
        this.initializePlayer();
        this.setupAchievementSystem();
        this.setupChallengeSystem();
        this.setupRewardSystem();
        this.setupProgressSystem();
        this.setupSocialFeatures();
        this.loadGameData();
    }

    /**
     * 初始化玩家系统
     */
    initializePlayer() {
        this.player = {
            // 基础信息
            id: this.generatePlayerId(),
            username: '学习者',
            avatar: '👤',
            joinDate: Date.now(),
            
            // 等级系统
            level: 1,
            experience: 0,
            experienceToNext: 100,
            totalExperience: 0,
            
            // 统计数据
            stats: {
                totalStudyTime: 0,
                sessionsCompleted: 0,
                questionsAnswered: 0,
                correctAnswers: 0,
                streakDays: 0,
                maxStreak: 0,
                challengesCompleted: 0,
                achievementsUnlocked: 0,
                wordsLearned: 0,
                booksRead: 0,
                testsCompleted: 0
            },
            
            // 货币系统
            currencies: {
                coins: 0,        // 金币 - 基础货币
                gems: 0,         // 宝石 - 高级货币
                energy: 100,     // 能量 - 限制系统
                knowledge: 0     // 知识点 - 特殊货币
            },
            
            // 道具系统
            inventory: {
                boosts: {
                    'exp_boost': 0,      // 经验加成
                    'coin_boost': 0,     // 金币加成
                    'streak_freeze': 0,  // 连击冻结
                    'energy_refill': 0   // 能量恢复
                },
                cosmetics: {
                    'avatars': ['👤'],
                    'themes': ['default'],
                    'badges': [],
                    'titles': ['新手学者']
                },
                consumables: {
                    'hint_cards': 3,     // 提示卡
                    'skip_tokens': 1,    // 跳过令牌
                    'double_exp': 0      // 双倍经验
                }
            },
            
            // 偏好设置
            preferences: {
                notifications: true,
                sounds: true,
                animations: true,
                competitiveMode: false,
                privacyMode: false
            },
            
            // 社交数据
            social: {
                friends: [],
                guilds: [],
                achievements_shared: [],
                privacy_level: 'friends' // public, friends, private
            }
        };
        
        console.log('👤 玩家系统已初始化');
    }

    /**
     * 设置成就系统
     */
    setupAchievementSystem() {
        this.achievements = [
            // 学习成就
            {
                id: 'first_session',
                title: '初来乍到',
                description: '完成你的第一次学习',
                icon: '🌟',
                category: 'learning',
                type: 'milestone',
                condition: { type: 'sessions_completed', value: 1 },
                rewards: { experience: 50, coins: 10 },
                rarity: 'common',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'study_streak_7',
                title: '坚持不懈',
                description: '连续学习7天',
                icon: '🔥',
                category: 'consistency',
                type: 'streak',
                condition: { type: 'streak_days', value: 7 },
                rewards: { experience: 200, coins: 50, gems: 1 },
                rarity: 'uncommon',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'perfect_score',
                title: '完美无缺',
                description: '在一次测试中获得100%正确率',
                icon: '💯',
                category: 'performance',
                type: 'achievement',
                condition: { type: 'perfect_test', value: 1 },
                rewards: { experience: 100, coins: 25, gems: 2 },
                rarity: 'rare',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'vocabulary_master',
                title: '词汇大师',
                description: '学会1000个单词',
                icon: '📚',
                category: 'learning',
                type: 'milestone',
                condition: { type: 'words_learned', value: 1000 },
                rewards: { experience: 500, coins: 100, gems: 5 },
                rarity: 'epic',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'speed_demon',
                title: '闪电快手',
                description: '在1分钟内正确回答20道题',
                icon: '⚡',
                category: 'speed',
                type: 'challenge',
                condition: { type: 'speed_answers', value: 20, time_limit: 60 },
                rewards: { experience: 150, coins: 30, gems: 3 },
                rarity: 'rare',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'night_owl',
                title: '夜猫子',
                description: '在晚上11点后学习',
                icon: '🦉',
                category: 'special',
                type: 'hidden',
                condition: { type: 'study_time', hour_range: [23, 5] },
                rewards: { experience: 75, coins: 15 },
                rarity: 'uncommon',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'social_butterfly',
                title: '社交达人',
                description: '添加10个好友',
                icon: '🦋',
                category: 'social',
                type: 'social',
                condition: { type: 'friends_count', value: 10 },
                rewards: { experience: 100, coins: 20, gems: 2 },
                rarity: 'uncommon',
                unlocked: false,
                unlockedAt: null
            },
            {
                id: 'legend',
                title: '传奇学者',
                description: '达到50级',
                icon: '👑',
                category: 'progression',
                type: 'milestone',
                condition: { type: 'level', value: 50 },
                rewards: { experience: 1000, coins: 500, gems: 50 },
                rarity: 'legendary',
                unlocked: false,
                unlockedAt: null
            }
        ];
        
        console.log('🏆 成就系统已设置，共', this.achievements.length, '个成就');
    }

    /**
     * 设置挑战系统
     */
    setupChallengeSystem() {
        this.dailyChallenges = [
            {
                id: 'daily_vocab',
                title: '每日词汇',
                description: '学习20个新单词',
                icon: '📖',
                type: 'daily',
                category: 'vocabulary',
                target: 20,
                progress: 0,
                rewards: { experience: 100, coins: 25 },
                expires: this.getTomorrowMidnight(),
                difficulty: 'normal'
            },
            {
                id: 'daily_accuracy',
                title: '精准射手',
                description: '保持85%以上的正确率',
                icon: '🎯',
                type: 'daily',
                category: 'accuracy',
                target: 0.85,
                progress: 0,
                rewards: { experience: 150, coins: 30 },
                expires: this.getTomorrowMidnight(),
                difficulty: 'hard'
            },
            {
                id: 'daily_streak',
                title: '连击保持',
                description: '保持学习连击不断',
                icon: '🔥',
                type: 'daily',
                category: 'consistency',
                target: 1,
                progress: 0,
                rewards: { experience: 50, coins: 15 },
                expires: this.getTomorrowMidnight(),
                difficulty: 'easy'
            }
        ];
        
        this.generateWeeklyChallenges();
        this.generateSeasonalEvents();
        
        console.log('🎯 挑战系统已设置');
    }

    /**
     * 设置奖励系统
     */
    setupRewardSystem() {
        this.rewardSystem = {
            // 经验值计算
            experienceCalculator: {
                baseExperience: {
                    'question_correct': 10,
                    'question_incorrect': 2,
                    'lesson_complete': 50,
                    'test_complete': 100,
                    'daily_login': 20,
                    'streak_bonus': 5
                },
                multipliers: {
                    'perfect_score': 2.0,
                    'streak_active': 1.5,
                    'difficulty_hard': 1.3,
                    'first_attempt': 1.2,
                    'speed_bonus': 1.1
                }
            },
            
            // 金币奖励
            coinRewards: {
                'question_correct': 2,
                'lesson_complete': 10,
                'test_complete': 25,
                'achievement_unlock': 50,
                'daily_challenge': 15,
                'weekly_challenge': 100
            },
            
            // 每日奖励
            dailyRewards: [
                { day: 1, rewards: { coins: 10, experience: 20 } },
                { day: 2, rewards: { coins: 15, experience: 30 } },
                { day: 3, rewards: { coins: 20, experience: 40, gems: 1 } },
                { day: 4, rewards: { coins: 25, experience: 50 } },
                { day: 5, rewards: { coins: 30, experience: 60, gems: 1 } },
                { day: 6, rewards: { coins: 40, experience: 80, gems: 2 } },
                { day: 7, rewards: { coins: 100, experience: 200, gems: 5, special: 'streak_freeze' } }
            ],
            
            // 等级奖励
            levelRewards: (level) => ({
                experience: 0,
                coins: level * 10,
                gems: Math.floor(level / 5),
                special: level % 10 === 0 ? 'title' : null
            })
        };
        
        console.log('🎁 奖励系统已设置');
    }

    /**
     * 设置进度系统
     */
    setupProgressSystem() {
        this.progressSystem = {
            // 等级计算
            calculateLevel: (totalExp) => {
                return Math.floor(Math.sqrt(totalExp / 100)) + 1;
            },
            
            // 下一级所需经验
            experienceToNextLevel: (currentLevel) => {
                return Math.pow(currentLevel, 2) * 100 - this.player.totalExperience;
            },
            
            // 技能树
            skillTrees: {
                vocabulary: {
                    nodes: [
                        { id: 'basic_words', level: 1, unlocked: true },
                        { id: 'advanced_words', level: 5, unlocked: false },
                        { id: 'expert_words', level: 15, unlocked: false },
                        { id: 'master_words', level: 30, unlocked: false }
                    ]
                },
                grammar: {
                    nodes: [
                        { id: 'basic_grammar', level: 1, unlocked: true },
                        { id: 'complex_grammar', level: 8, unlocked: false },
                        { id: 'advanced_grammar', level: 20, unlocked: false }
                    ]
                },
                listening: {
                    nodes: [
                        { id: 'basic_listening', level: 3, unlocked: false },
                        { id: 'advanced_listening', level: 12, unlocked: false },
                        { id: 'native_listening', level: 25, unlocked: false }
                    ]
                }
            },
            
            // 专精系统
            masteries: {
                'vocabulary_novice': { threshold: 100, unlocked: false },
                'vocabulary_expert': { threshold: 500, unlocked: false },
                'vocabulary_master': { threshold: 1000, unlocked: false },
                'speed_learner': { threshold: 50, unlocked: false },
                'perfectionist': { threshold: 10, unlocked: false },
                'marathoner': { threshold: 1000, unlocked: false }
            }
        };
        
        console.log('📈 进度系统已设置');
    }

    /**
     * 设置社交功能
     */
    setupSocialFeatures() {
        this.socialFeatures = {
            // 排行榜
            leaderboards: {
                weekly_exp: { type: 'experience', period: 'week', players: [] },
                monthly_streak: { type: 'streak', period: 'month', players: [] },
                vocabulary_masters: { type: 'words_learned', period: 'all_time', players: [] }
            },
            
            // 公会系统
            guilds: {
                available: [
                    { id: 'study_warriors', name: '学习战士', description: '专注高强度学习', level: 1, members: 0 },
                    { id: 'word_wizards', name: '单词法师', description: '词汇专家聚集地', level: 1, members: 0 },
                    { id: 'grammar_guardians', name: '语法守护者', description: '语法知识分享', level: 1, members: 0 }
                ],
                userGuild: null
            },
            
            // 好友系统
            friends: {
                list: [],
                requests: [],
                maxFriends: 50
            },
            
            // 分享系统
            sharing: {
                achievements: true,
                milestones: true,
                challenges: false
            }
        };
        
        console.log('👥 社交功能已设置');
    }

    /**
     * 添加经验值
     */
    addExperience(amount, source = 'unknown', multipliers = []) {
        // 应用倍数
        let finalAmount = amount;
        multipliers.forEach(multiplier => {
            if (this.rewardSystem.experienceCalculator.multipliers[multiplier]) {
                finalAmount *= this.rewardSystem.experienceCalculator.multipliers[multiplier];
            }
        });
        
        finalAmount = Math.round(finalAmount);
        
        // 更新经验值
        this.player.experience += finalAmount;
        this.player.totalExperience += finalAmount;
        
        // 检查升级
        const newLevel = this.progressSystem.calculateLevel(this.player.totalExperience);
        if (newLevel > this.player.level) {
            this.levelUp(newLevel);
        }
        
        // 更新下一级所需经验
        this.player.experienceToNext = this.progressSystem.experienceToNextLevel(this.player.level);
        
        // 显示经验获得动画
        this.showExperienceGain(finalAmount, source);
        
        console.log(`✨ 获得 ${finalAmount} 经验值 (来源: ${source})`);
        
        return finalAmount;
    }

    /**
     * 升级处理
     */
    levelUp(newLevel) {
        const oldLevel = this.player.level;
        this.player.level = newLevel;
        
        // 获得升级奖励
        const rewards = this.rewardSystem.levelRewards(newLevel);
        this.giveRewards(rewards, '升级奖励');
        
        // 解锁新内容
        this.unlockContentByLevel(newLevel);
        
        // 显示升级动画
        this.showLevelUpAnimation(oldLevel, newLevel, rewards);
        
        console.log(`🎉 恭喜升级! ${oldLevel} → ${newLevel}`);
        
        // 检查成就
        this.checkAchievements('level', newLevel);
    }

    /**
     * 给予奖励
     */
    giveRewards(rewards, source = 'unknown') {
        if (rewards.experience) {
            this.addExperience(rewards.experience, source);
        }
        
        if (rewards.coins) {
            this.player.currencies.coins += rewards.coins;
        }
        
        if (rewards.gems) {
            this.player.currencies.gems += rewards.gems;
        }
        
        if (rewards.knowledge) {
            this.player.currencies.knowledge += rewards.knowledge;
        }
        
        if (rewards.special) {
            this.giveSpecialReward(rewards.special);
        }
        
        // 显示奖励通知
        this.showRewardNotification(rewards, source);
        
        console.log('🎁 奖励已发放:', rewards);
    }

    /**
     * 检查成就
     */
    checkAchievements(action, value = 1) {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            const condition = achievement.condition;
            let conditionMet = false;
            
            switch (condition.type) {
                case 'sessions_completed':
                    conditionMet = this.player.stats.sessionsCompleted >= condition.value;
                    break;
                case 'streak_days':
                    conditionMet = this.player.stats.streakDays >= condition.value;
                    break;
                case 'words_learned':
                    conditionMet = this.player.stats.wordsLearned >= condition.value;
                    break;
                case 'level':
                    conditionMet = this.player.level >= condition.value;
                    break;
                case 'perfect_test':
                    conditionMet = action === 'perfect_test' && value >= condition.value;
                    break;
                // 添加更多条件类型...
            }
            
            if (conditionMet) {
                this.unlockAchievement(achievement.id);
            }
        });
    }

    /**
     * 解锁成就
     */
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        this.player.stats.achievementsUnlocked++;
        
        // 给予奖励
        this.giveRewards(achievement.rewards, '成就奖励');
        
        // 显示成就解锁动画
        this.showAchievementUnlock(achievement);
        
        console.log(`🏆 成就解锁: ${achievement.title}`);
        
        // 分享成就（如果设置允许）
        if (this.socialFeatures.sharing.achievements) {
            this.shareAchievement(achievement);
        }
    }

    /**
     * 完成每日挑战
     */
    completeDailyChallenge(challengeId) {
        const challenge = this.dailyChallenges.find(c => c.id === challengeId);
        if (!challenge || challenge.completed) return;
        
        challenge.completed = true;
        challenge.completedAt = Date.now();
        this.player.stats.challengesCompleted++;
        
        // 给予奖励
        this.giveRewards(challenge.rewards, '每日挑战');
        
        // 显示完成动画
        this.showChallengeComplete(challenge);
        
        console.log(`🎯 每日挑战完成: ${challenge.title}`);
    }

    /**
     * 更新挑战进度
     */
    updateChallengeProgress(challengeType, amount = 1) {
        this.dailyChallenges.forEach(challenge => {
            if (challenge.category === challengeType && !challenge.completed) {
                challenge.progress += amount;
                
                // 检查是否完成
                if (challenge.progress >= challenge.target) {
                    this.completeDailyChallenge(challenge.id);
                }
                
                // 更新UI显示
                this.updateChallengeUI(challenge);
            }
        });
    }

    /**
     * 生成每周挑战
     */
    generateWeeklyChallenges() {
        this.weeklyChallenges = [
            {
                id: 'weekly_master',
                title: '本周大师',
                description: '本周内学习500个单词',
                icon: '🎓',
                type: 'weekly',
                target: 500,
                progress: 0,
                rewards: { experience: 500, coins: 100, gems: 10 },
                expires: this.getNextSunday(),
                difficulty: 'legendary'
            },
            {
                id: 'weekly_consistent',
                title: '持之以恒',
                description: '连续7天保持学习',
                icon: '💪',
                type: 'weekly',
                target: 7,
                progress: 0,
                rewards: { experience: 300, coins: 75, gems: 5 },
                expires: this.getNextSunday(),
                difficulty: 'hard'
            }
        ];
    }

    /**
     * 生成季节性活动
     */
    generateSeasonalEvents() {
        this.seasonalEvents = [
            {
                id: 'spring_festival',
                title: '春季学习节',
                description: '在春季学习活动中获得额外奖励',
                icon: '🌸',
                type: 'seasonal',
                startDate: new Date('2024-03-01'),
                endDate: new Date('2024-05-31'),
                bonuses: {
                    experience: 1.2,
                    coins: 1.5
                },
                active: false
            }
        ];
    }

    /**
     * 显示经验获得动画
     */
    showExperienceGain(amount, source) {
        // 创建浮动经验值显示
        const expFloat = document.createElement('div');
        expFloat.className = 'exp-float';
        expFloat.textContent = `+${amount} EXP`;
        expFloat.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #FFD700;
            font-size: 1.5rem;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            pointer-events: none;
            z-index: 10000;
            animation: expFloat 2s ease-out forwards;
        `;
        
        // 添加动画样式
        if (!document.getElementById('exp-float-styles')) {
            const styles = document.createElement('style');
            styles.id = 'exp-float-styles';
            styles.textContent = `
                @keyframes expFloat {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 1; transform: translate(-50%, -80px) scale(1.2); }
                    100% { opacity: 0; transform: translate(-50%, -120px) scale(0.8); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(expFloat);
        
        // 2秒后移除
        setTimeout(() => {
            if (expFloat.parentNode) {
                expFloat.parentNode.removeChild(expFloat);
            }
        }, 2000);
    }

    /**
     * 显示升级动画
     */
    showLevelUpAnimation(oldLevel, newLevel, rewards) {
        // 创建升级模态框
        const modal = document.createElement('div');
        modal.className = 'level-up-modal';
        modal.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-header">
                    <h2>🎉 恭喜升级!</h2>
                    <div class="level-change">
                        <span class="old-level">Lv.${oldLevel}</span>
                        <span class="arrow">→</span>
                        <span class="new-level">Lv.${newLevel}</span>
                    </div>
                </div>
                <div class="level-up-rewards">
                    <h3>升级奖励</h3>
                    <div class="rewards-list">
                        ${rewards.coins ? `<div class="reward-item">💰 ${rewards.coins} 金币</div>` : ''}
                        ${rewards.gems ? `<div class="reward-item">💎 ${rewards.gems} 宝石</div>` : ''}
                        ${rewards.special ? `<div class="reward-item">🎁 特殊奖励</div>` : ''}
                    </div>
                </div>
                <button class="btn btn-primary level-up-close">继续学习</button>
            </div>
        `;
        
        // 添加样式
        modal.style.cssText = `
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
            animation: modalFadeIn 0.3s ease-out;
        `;
        
        document.body.appendChild(modal);
        
        // 绑定关闭事件
        modal.querySelector('.level-up-close').addEventListener('click', () => {
            modal.remove();
        });
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 5000);
    }

    /**
     * 显示成就解锁动画
     */
    showAchievementUnlock(achievement) {
        // 创建成就通知
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">成就解锁!</div>
                    <div class="achievement-name">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
                <div class="achievement-rarity ${achievement.rarity}">
                    ${achievement.rarity.toUpperCase()}
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #333;
            padding: 1rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
            z-index: 10000;
            animation: achievementSlideIn 0.5s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // 5秒后移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'achievementSlideOut 0.5s ease-in forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }
        }, 5000);
    }

    /**
     * 获取明天午夜时间
     */
    getTomorrowMidnight() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.getTime();
    }

    /**
     * 获取下周日时间
     */
    getNextSunday() {
        const nextSunday = new Date();
        nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
        nextSunday.setHours(23, 59, 59, 999);
        return nextSunday.getTime();
    }

    /**
     * 生成玩家ID
     */
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 保存游戏数据
     */
    saveGameData() {
        const gameData = {
            player: this.player,
            achievements: this.achievements,
            dailyChallenges: this.dailyChallenges,
            weeklyChallenges: this.weeklyChallenges || [],
            seasonalEvents: this.seasonalEvents,
            socialFeatures: this.socialFeatures,
            lastSaved: Date.now()
        };
        
        localStorage.setItem('enhanced_gamification_data', JSON.stringify(gameData));
        console.log('💾 游戏数据已保存');
    }

    /**
     * 加载游戏数据
     */
    loadGameData() {
        try {
            const savedData = localStorage.getItem('enhanced_gamification_data');
            if (savedData) {
                const gameData = JSON.parse(savedData);
                
                // 合并保存的数据
                this.player = { ...this.player, ...gameData.player };
                this.mergeAchievements(gameData.achievements);
                this.dailyChallenges = gameData.dailyChallenges || this.dailyChallenges;
                this.weeklyChallenges = gameData.weeklyChallenges || [];
                this.seasonalEvents = gameData.seasonalEvents || this.seasonalEvents;
                this.socialFeatures = { ...this.socialFeatures, ...gameData.socialFeatures };
                
                console.log('📥 游戏数据已加载');
                
                // 检查是否需要重置每日挑战
                this.checkDailyChallengeReset();
            }
        } catch (error) {
            console.error('❌ 加载游戏数据失败:', error);
        }
    }

    /**
     * 合并成就数据
     */
    mergeAchievements(savedAchievements) {
        if (!savedAchievements) return;
        
        savedAchievements.forEach(saved => {
            const achievement = this.achievements.find(a => a.id === saved.id);
            if (achievement) {
                achievement.unlocked = saved.unlocked;
                achievement.unlockedAt = saved.unlockedAt;
            }
        });
    }

    /**
     * 检查每日挑战重置
     */
    checkDailyChallengeReset() {
        const now = Date.now();
        this.dailyChallenges.forEach(challenge => {
            if (now > challenge.expires) {
                // 重置挑战
                challenge.progress = 0;
                challenge.completed = false;
                challenge.expires = this.getTomorrowMidnight();
            }
        });
    }

    /**
     * 获取玩家统计信息
     */
    getPlayerStats() {
        return {
            ...this.player.stats,
            level: this.player.level,
            totalExperience: this.player.totalExperience,
            currencies: this.player.currencies,
            achievementsUnlocked: this.achievements.filter(a => a.unlocked).length,
            totalAchievements: this.achievements.length
        };
    }

    /**
     * 获取排行榜数据
     */
    getLeaderboardData(type = 'weekly_exp', limit = 10) {
        // 模拟排行榜数据
        const mockData = [];
        for (let i = 0; i < limit; i++) {
            mockData.push({
                rank: i + 1,
                username: `学习者${i + 1}`,
                avatar: ['👤', '👨', '👩', '🧑', '👦', '👧'][Math.floor(Math.random() * 6)],
                value: Math.floor(Math.random() * 10000) + 1000,
                level: Math.floor(Math.random() * 30) + 1
            });
        }
        
        return mockData.sort((a, b) => b.value - a.value);
    }

    /**
     * 销毁游戏化系统
     */
    destroy() {
        this.saveGameData();
        console.log('🎮 增强游戏化系统已销毁');
    }
}

// 创建全局实例
window.EnhancedGamification = new EnhancedGamification();
