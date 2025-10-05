/**
 * 个人中心管理类
 */
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.learningData = {};
        this.achievements = [];
        this.activities = [];
        
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            // 首先检查登录状态
            if (!this.checkLoginStatus()) {
                return; // 未登录，已重定向
            }
            
            await this.loadUserData();
            this.initializeAchievements();
            this.renderProfile();
            this.bindEvents();
            console.log('✅ 个人中心初始化完成');
        } catch (error) {
            console.error('❌ 个人中心初始化失败:', error);
            this.showNotification('个人中心加载失败', 'error');
        }
    }

    /**
     * 检查登录状态
     */
    checkLoginStatus() {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        
        if (!token || !username) {
            // 未登录，重定向到主页面并显示登录提示
            alert('请先登录才能访问个人中心');
            
            // 如果是从主应用打开的，关闭当前窗口
            if (window.opener) {
                window.close();
            } else {
                // 否则重定向到主页面
                window.location.href = '/src/html/index.html';
            }
            return false;
        }
        
        return true;
    }

    /**
     * 加载用户数据
     */
    async loadUserData() {
        try {
            // 从localStorage获取登录用户信息
            this.currentUser = localStorage.getItem('username');
            
            // 优先从主应用获取数据
            if (window.opener && window.opener.app) {
                const mainApp = window.opener.app;
                // 确保主应用也使用正确的用户信息
                mainApp.currentUser = this.currentUser;
                
                // 同步最新的学习数据
                await this.syncDataFromMainApp(mainApp);
                console.log('从主应用获取用户数据:', this.currentUser);
            } else {
                // 从localStorage获取数据
                this.learningData = JSON.parse(localStorage.getItem('learning_data') || '{}');
                console.log('从localStorage获取用户数据:', this.currentUser);
            }
            
            // 确保数据结构完整
            this.ensureDataStructure();
            
            // 加载活动记录
            this.activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
            
            // 添加访问个人中心的活动记录
            this.addActivity('profile', '访问个人中心', '查看个人学习数据和统计信息');
            
        } catch (error) {
            console.error('加载用户数据失败:', error);
            // 使用登录用户作为默认数据
            this.currentUser = localStorage.getItem('username') || '用户';
            this.learningData = {};
            this.ensureDataStructure();
            this.activities = [];
        }
    }

    /**
     * 从主应用同步学习数据
     */
    async syncDataFromMainApp(mainApp) {
        try {
            // 获取主应用的最新数据
            this.learningData = { ...mainApp.learningData };
            
            // 如果主应用有更新进度的方法，调用它来获取最新数据
            if (typeof mainApp.updateProgressDisplay === 'function') {
                mainApp.updateProgressDisplay();
                // 重新获取更新后的数据
                this.learningData = { ...mainApp.learningData };
            }
            
            console.log('同步的学习数据:', {
                totalPoints: this.learningData.totalPoints,
                streakDays: this.learningData.streakDays,
                totalStudyTime: this.learningData.totalStudyTime,
                vocabProgress: Object.keys(this.learningData.vocabProgress || {}).length,
                grammarProgress: this.learningData.grammarProgress,
                readingProgress: this.learningData.readingProgress,
                listeningProgress: this.learningData.listeningProgress
            });
            
        } catch (error) {
            console.error('同步主应用数据失败:', error);
            // 降级到localStorage数据
            this.learningData = JSON.parse(localStorage.getItem('learning_data') || '{}');
        }
    }

    /**
     * 确保数据结构完整
     */
    ensureDataStructure() {
        const defaultData = {
            totalPoints: 0,
            streakDays: 0,
            totalStudyTime: 0,
            wordsLearned: 0,
            dailyStats: {},
            vocabProgress: {},
            grammarProgress: {},
            readingProgress: {},
            listeningProgress: {},
            correctAnswers: 0,
            totalAnswers: 0,
            weeklyGoal: 300, // 分钟
            joinDate: new Date().toISOString(),
            level: '初学者',
            avatar: null
        };

        this.learningData = { ...defaultData, ...this.learningData };
    }

    /**
     * 初始化成就系统
     */
    initializeAchievements() {
        // 计算实际的学习数据
        const wordsLearned = this.calculateWordsLearned();
        const totalPoints = this.learningData.totalPoints || 0;
        const streakDays = this.learningData.streakDays || 0;
        const totalStudyTime = this.learningData.totalStudyTime || 0;
        const accuracyRate = this.getAccuracyRate();
        
        this.achievements = [
            {
                id: 'first_word',
                name: '初学者',
                description: '学习第一个单词',
                icon: '🌱',
                unlocked: wordsLearned > 0,
                progress: wordsLearned,
                target: 1
            },
            {
                id: 'word_master_10',
                name: '词汇新手',
                description: '学习10个单词',
                icon: '📚',
                unlocked: wordsLearned >= 10,
                progress: wordsLearned,
                target: 10
            },
            {
                id: 'word_master_50',
                name: '词汇达人',
                description: '学习50个单词',
                icon: '📖',
                unlocked: wordsLearned >= 50,
                progress: wordsLearned,
                target: 50
            },
            {
                id: 'word_master_100',
                name: '词汇专家',
                description: '学习100个单词',
                icon: '🎓',
                unlocked: wordsLearned >= 100,
                progress: wordsLearned,
                target: 100
            },
            {
                id: 'streak_3',
                name: '坚持不懈',
                description: '连续学习3天',
                icon: '🔥',
                unlocked: streakDays >= 3,
                progress: streakDays,
                target: 3
            },
            {
                id: 'streak_7',
                name: '一周达人',
                description: '连续学习7天',
                icon: '⭐',
                unlocked: streakDays >= 7,
                progress: streakDays,
                target: 7
            },
            {
                id: 'streak_30',
                name: '月度冠军',
                description: '连续学习30天',
                icon: '👑',
                unlocked: streakDays >= 30,
                progress: streakDays,
                target: 30
            },
            {
                id: 'points_1000',
                name: '积分新星',
                description: '获得1000积分',
                icon: '💎',
                unlocked: totalPoints >= 1000,
                progress: totalPoints,
                target: 1000
            },
            {
                id: 'accuracy_90',
                name: '精准射手',
                description: '正确率达到90%',
                icon: '🎯',
                unlocked: accuracyRate >= 90,
                progress: accuracyRate,
                target: 90
            },
            {
                id: 'study_time_600',
                name: '学习达人',
                description: '累计学习10小时',
                icon: '⏰',
                unlocked: totalStudyTime >= 600,
                progress: totalStudyTime,
                target: 600
            }
        ];
        
        console.log('成就系统初始化完成:', {
            wordsLearned,
            totalPoints,
            streakDays,
            totalStudyTime,
            accuracyRate,
            unlockedAchievements: this.achievements.filter(a => a.unlocked).length
        });
    }

    /**
     * 计算实际学习的单词数
     */
    calculateWordsLearned() {
        const vocabProgress = this.learningData.vocabProgress || {};
        
        // 计算掌握程度 >= 2 的单词数（认为已学会）
        let learnedCount = 0;
        for (const word in vocabProgress) {
            const progress = vocabProgress[word];
            if (progress && progress.masteryLevel >= 2) {
                learnedCount++;
            }
        }
        
        // 如果没有词汇进度数据，使用存储的数值
        if (learnedCount === 0 && this.learningData.wordsLearned) {
            learnedCount = this.learningData.wordsLearned;
        }
        
        return learnedCount;
    }

    /**
     * 渲染个人中心
     */
    renderProfile() {
        this.renderUserInfo();
        this.renderStats();
        this.renderProgress();
        this.renderAchievements();
        this.renderActivities();
    }

    /**
     * 渲染用户信息
     */
    renderUserInfo() {
        // 更新头像
        const avatarText = document.getElementById('avatarText');
        if (avatarText) {
            avatarText.textContent = this.currentUser.charAt(0).toUpperCase();
        }

        // 更新用户名
        const username = document.getElementById('username');
        if (username) {
            username.textContent = this.currentUser;
        }

        // 更新用户等级
        const userLevel = document.getElementById('userLevel');
        if (userLevel) {
            userLevel.textContent = this.getUserLevel();
        }

        // 更新加入时间
        const joinDate = document.getElementById('joinDate');
        if (joinDate) {
            const date = new Date(this.learningData.joinDate);
            joinDate.textContent = `加入时间：${date.getFullYear()}年${date.getMonth() + 1}月`;
        }
    }

    /**
     * 渲染统计数据
     */
    renderStats() {
        // 计算真实数据
        const wordsLearned = this.calculateWordsLearned();
        
        // 主要统计
        this.updateElement('totalPoints', this.learningData.totalPoints || 0);
        this.updateElement('streakDays', this.learningData.streakDays || 0);
        this.updateElement('totalStudyTime', this.learningData.totalStudyTime || 0);
        this.updateElement('wordsLearned', wordsLearned);

        // 详细统计
        this.updateElement('todayStudyTime', this.getTodayStudyTime());
        this.updateElement('todayWords', this.getTodayWords());
        this.updateElement('correctRate', `${this.getAccuracyRate()}%`);
        this.updateElement('weeklyGoal', `${this.getWeeklyProgress()}%`);
        
        // 更新learningData中的wordsLearned以保持同步
        this.learningData.wordsLearned = wordsLearned;
    }

    /**
     * 渲染学习进度
     */
    renderProgress() {
        const progressData = [
            { id: 'vocab', progress: this.getVocabProgress() },
            { id: 'grammar', progress: this.getGrammarProgress() },
            { id: 'reading', progress: this.getReadingProgress() },
            { id: 'listening', progress: this.getListeningProgress() }
        ];

        progressData.forEach(item => {
            const percentElement = document.getElementById(`${item.id}Progress`);
            const barElement = document.getElementById(`${item.id}ProgressBar`);
            
            if (percentElement) {
                percentElement.textContent = `${item.progress}%`;
            }
            if (barElement) {
                barElement.style.width = `${item.progress}%`;
            }
        });
    }

    /**
     * 渲染成就徽章
     */
    renderAchievements() {
        const container = document.getElementById('achievementsGrid');
        if (!container) return;

        container.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            // 为未解锁的成就显示进度
            let progressText = achievement.description;
            if (!achievement.unlocked && achievement.progress !== undefined && achievement.target !== undefined) {
                progressText = `${achievement.description} (${achievement.progress}/${achievement.target})`;
            }
            
            achievementElement.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${progressText}</div>
            `;
            
            achievementElement.addEventListener('click', () => {
                this.showAchievementDetails(achievement);
            });
            
            container.appendChild(achievementElement);
        });
        
        // 显示成就统计
        const unlockedCount = this.achievements.filter(a => a.unlocked).length;
        console.log(`🏆 成就进度: ${unlockedCount}/${this.achievements.length} 已解锁`);
    }

    /**
     * 渲染最近活动
     */
    renderActivities() {
        const container = document.getElementById('activityList');
        if (!container) return;

        if (this.activities.length === 0) {
            container.innerHTML = '<div class="activity-item"><div class="activity-content"><div class="activity-title">暂无学习记录</div><div class="activity-desc">开始学习来记录你的进步吧！</div></div></div>';
            return;
        }

        container.innerHTML = '';
        
        // 显示最近10条活动
        const recentActivities = this.activities.slice(-10).reverse();
        
        recentActivities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-desc">${activity.description}</div>
                </div>
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
            `;
            container.appendChild(activityElement);
        });
    }


    /**
     * 绑定事件
     */
    bindEvents() {
        // 主题切换
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * 获取用户等级
     */
    getUserLevel() {
        const points = this.learningData.totalPoints || 0;
        if (points < 100) return '初学者';
        if (points < 500) return '进步者';
        if (points < 1000) return '学习者';
        if (points < 2000) return '熟练者';
        if (points < 5000) return '专家';
        return '大师';
    }

    /**
     * 获取今日学习时间
     */
    getTodayStudyTime() {
        const today = new Date().toDateString();
        return this.learningData.dailyStats?.[today] || 0;
    }

    /**
     * 获取今日新学单词数
     */
    getTodayWords() {
        const today = new Date().toDateString();
        const todayStats = this.learningData.dailyStats || {};
        
        // 检查是否有今日新学单词的记录
        if (todayStats[today] && todayStats[today].newWords) {
            return todayStats[today].newWords;
        }
        
        // 否则基于今日学习时间估算（每5分钟约学1个单词）
        const todayStudyTime = this.getTodayStudyTime();
        return Math.floor(todayStudyTime / 5);
    }

    /**
     * 获取正确率
     */
    getAccuracyRate() {
        const correctAnswers = this.learningData.correctAnswers || 0;
        const totalAnswers = this.learningData.totalAnswers || 0;
        
        if (totalAnswers === 0) {
            // 如果没有答题记录，检查各模块的正确率
            const vocabProgress = this.learningData.vocabProgress || {};
            let totalQuestions = 0;
            let correctCount = 0;
            
            Object.values(vocabProgress).forEach(progress => {
                if (progress && progress.attempts) {
                    totalQuestions += progress.attempts;
                    correctCount += progress.correct || 0;
                }
            });
            
            if (totalQuestions > 0) {
                return Math.round((correctCount / totalQuestions) * 100);
            }
            
            return 0;
        }
        
        return Math.round((correctAnswers / totalAnswers) * 100);
    }

    /**
     * 获取周目标完成度
     */
    getWeeklyProgress() {
        const weeklyStudyTime = this.getWeeklyStudyTime();
        return Math.min(Math.round((weeklyStudyTime / this.learningData.weeklyGoal) * 100), 100);
    }

    /**
     * 获取本周学习时间
     */
    getWeeklyStudyTime() {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        let weeklyTime = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = date.toDateString();
            weeklyTime += this.learningData.dailyStats?.[dateStr] || 0;
        }

        return weeklyTime;
    }

    /**
     * 获取词汇学习进度
     */
    getVocabProgress() {
        const vocabProgress = this.learningData.vocabProgress || {};
        
        // 如果有具体的词汇进度数据
        if (Object.keys(vocabProgress).length > 0) {
            const totalWords = Object.keys(vocabProgress).length;
            const learnedWords = Object.values(vocabProgress)
                .filter(progress => progress.masteryLevel >= 2).length;
            return totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
        }
        
        // 否则基于已学单词数估算
        const wordsLearned = this.calculateWordsLearned();
        const estimatedTotal = Math.max(wordsLearned * 2, 100); // 估算总词汇量
        return Math.min(Math.round((wordsLearned / estimatedTotal) * 100), 100);
    }

    /**
     * 获取语法学习进度
     */
    getGrammarProgress() {
        const grammarData = this.learningData.grammarProgress || {};
        
        // 检查是否有completed和total字段
        if (grammarData.completed !== undefined && grammarData.total !== undefined) {
            const completed = grammarData.completed || 0;
            const total = grammarData.total || 40;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        }
        
        // 否则检查对象形式的进度数据
        const totalExercises = Object.keys(grammarData).length;
        if (totalExercises > 0) {
            const completedExercises = Object.values(grammarData)
                .filter(progress => progress && progress.completed).length;
            return Math.round((completedExercises / totalExercises) * 100);
        }
        
        return 0;
    }

    /**
     * 获取阅读理解进度
     */
    getReadingProgress() {
        const readingData = this.learningData.readingProgress || {};
        
        // 检查是否有completed和total字段
        if (readingData.completed !== undefined && readingData.total !== undefined) {
            const completed = readingData.completed || 0;
            const total = readingData.total || 40;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        }
        
        // 否则检查对象形式的进度数据
        const totalArticles = Object.keys(readingData).length;
        if (totalArticles > 0) {
            const completedArticles = Object.values(readingData)
                .filter(progress => progress && progress.completed).length;
            return Math.round((completedArticles / totalArticles) * 100);
        }
        
        return 0;
    }

    /**
     * 获取听力练习进度
     */
    getListeningProgress() {
        const listeningData = this.learningData.listeningProgress || {};
        
        // 检查是否有completed和total字段
        if (listeningData.completed !== undefined && listeningData.total !== undefined) {
            const completed = listeningData.completed || 0;
            const total = listeningData.total || 40;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
        }
        
        // 否则检查对象形式的进度数据
        const totalExercises = Object.keys(listeningData).length;
        if (totalExercises > 0) {
            const completedExercises = Object.values(listeningData)
                .filter(progress => progress && progress.completed).length;
            return Math.round((completedExercises / totalExercises) * 100);
        }
        
        return 0;
    }

    /**
     * 获取活动图标
     */
    getActivityIcon(type) {
        const icons = {
            'vocab': '📚',
            'grammar': '📝',
            'reading': '📖',
            'listening': '🎧',
            'achievement': '🏆',
            'login': '👋',
            'streak': '🔥'
        };
        return icons[type] || '📊';
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        
        return date.toLocaleDateString();
    }

    /**
     * 更新元素内容
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * 显示成就详情
     */
    showAchievementDetails(achievement) {
        const modal = document.getElementById('profileModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = achievement.name;
            
            let progressHtml = '';
            if (achievement.progress !== undefined && achievement.target !== undefined) {
                const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);
                progressHtml = `
                    <div style="margin: 20px 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: var(--text-color);">进度</span>
                            <span style="color: var(--primary-color); font-weight: bold;">${achievement.progress}/${achievement.target}</span>
                        </div>
                        <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--primary-color); height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
                        </div>
                    </div>
                `;
            }
            
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 64px; margin-bottom: 20px; ${achievement.unlocked ? '' : 'filter: grayscale(100%); opacity: 0.6;'}">${achievement.icon}</div>
                    <h3 style="margin-bottom: 10px; color: var(--text-color);">${achievement.name}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">${achievement.description}</p>
                    ${progressHtml}
                    <div style="padding: 15px; background: var(--background-color); border-radius: 8px; border: 1px solid var(--border-color);">
                        <strong style="color: ${achievement.unlocked ? 'var(--success-color, #28a745)' : 'var(--text-secondary)'};">
                            ${achievement.unlocked ? '🎉 已解锁' : '🔒 未解锁'}
                        </strong>
                    </div>
                </div>
            `;
            modal.classList.add('show');
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        if (typeof Notification !== 'undefined' && Notification.show) {
            Notification.show(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
        
        // 更新主题切换按钮图标
        const themeToggle = document.querySelector('.theme-toggle .icon');
        if (themeToggle) {
            themeToggle.textContent = isDark ? '🌙' : '☀️';
        }
    }

    /**
     * 添加活动记录
     */
    addActivity(type, title, description) {
        const activity = {
            id: Date.now(),
            type,
            title,
            description,
            timestamp: Date.now()
        };
        
        this.activities.push(activity);
        
        // 只保留最近100条记录
        if (this.activities.length > 100) {
            this.activities = this.activities.slice(-100);
        }
        
        // 保存到localStorage
        localStorage.setItem('user_activities', JSON.stringify(this.activities));
        
        // 重新渲染活动列表
        this.renderActivities();
    }

    /**
     * 检查并更新成就状态
     */
    checkAndUpdateAchievements() {
        const oldUnlockedCount = this.achievements.filter(a => a.unlocked).length;
        
        // 重新初始化成就系统
        this.initializeAchievements();
        
        const newUnlockedCount = this.achievements.filter(a => a.unlocked).length;
        
        // 如果有新成就解锁，显示通知
        if (newUnlockedCount > oldUnlockedCount) {
            const newAchievements = this.achievements.filter(a => a.unlocked);
            const latestAchievement = newAchievements[newAchievements.length - 1];
            
            this.showNotification(`🎉 恭喜！解锁新成就：${latestAchievement.name}`, 'success');
            this.addActivity('achievement', '解锁成就', `获得成就：${latestAchievement.name}`);
        }
        
        // 重新渲染成就
        this.renderAchievements();
        
        return newUnlockedCount > oldUnlockedCount;
    }
}

// 全局函数
function goBack() {
    try {
        // 首先检查是否有保存的前一个页面
        const previousPage = sessionStorage.getItem('previousPage');
        const previousPageState = sessionStorage.getItem('previousPageState');
        
        if (previousPage) {
            // 清除保存的状态
            sessionStorage.removeItem('previousPage');
            sessionStorage.removeItem('previousPageState');
            
            // 返回到之前的页面
            window.location.href = previousPage;
            return;
        }
        
        // 检查是否有历史记录可以返回
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // 如果没有历史记录，尝试关闭窗口或重定向到主页
            if (window.opener) {
                // 如果是从主应用打开的弹窗，关闭窗口
                window.close();
            } else {
                // 否则重定向到主页面
                window.location.href = '/src/html/index.html';
            }
        }
    } catch (error) {
        console.error('返回操作失败:', error);
        // 兜底方案：直接重定向到主页面
        window.location.href = '/src/html/index.html';
    }
}

function closeModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function changeAvatar() {
    // 这里可以实现头像更换功能
    profileManager.showNotification('头像更换功能开发中...', 'info');
}

function editProfile() {
    const modal = document.getElementById('profileModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modal && modalTitle && modalBody) {
        modalTitle.textContent = '编辑个人信息';
        modalBody.innerHTML = `
            <form id="profileForm">
                <div class="form-group">
                    <label class="form-label">用户名</label>
                    <input type="text" class="form-input" id="editUsername" value="${profileManager.currentUser}">
                </div>
                <div class="form-group">
                    <label class="form-label">学习目标 (分钟/周)</label>
                    <input type="number" class="form-input" id="editWeeklyGoal" value="${profileManager.learningData.weeklyGoal}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                    <button type="submit" class="btn btn-primary">保存</button>
                </div>
            </form>
        `;
        
        // 绑定表单提交事件
        const form = document.getElementById('profileForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProfile();
        });
        
        modal.classList.add('show');
    }
}

function saveProfile() {
    const username = document.getElementById('editUsername').value.trim();
    const weeklyGoal = parseInt(document.getElementById('editWeeklyGoal').value);
    
    if (username) {
        profileManager.currentUser = username;
        localStorage.setItem('currentUser', username);
    }
    
    if (weeklyGoal > 0) {
        profileManager.learningData.weeklyGoal = weeklyGoal;
        localStorage.setItem('learning_data', JSON.stringify(profileManager.learningData));
    }
    
    profileManager.renderProfile();
    profileManager.showNotification('个人信息已更新', 'success');
    closeModal();
}

function changePassword() {
    profileManager.showNotification('密码修改功能开发中...', 'info');
}

function studySettings() {
    profileManager.showNotification('学习设置功能开发中...', 'info');
}

function notificationSettings() {
    profileManager.showNotification('通知设置功能开发中...', 'info');
}

function exportData() {
    const data = {
        user: profileManager.currentUser,
        learningData: profileManager.learningData,
        activities: profileManager.activities,
        exportTime: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `学习数据_${profileManager.currentUser}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    profileManager.showNotification('学习数据已导出', 'success');
}

function clearData() {
    if (confirm('确定要清除所有学习数据吗？此操作不可恢复！')) {
        localStorage.removeItem('learning_data');
        localStorage.removeItem('user_activities');
        profileManager.showNotification('学习数据已清除', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

function refreshData() {
    if (profileManager) {
        profileManager.showNotification('正在刷新数据...', 'info');
        
        // 重新加载用户数据
        profileManager.loadUserData().then(() => {
            // 重新渲染所有内容
            profileManager.renderProfile();
            profileManager.showNotification('数据已刷新', 'success');
        }).catch(error => {
            console.error('刷新数据失败:', error);
            profileManager.showNotification('刷新数据失败', 'error');
        });
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle .icon');
    
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        if (themeToggle) themeToggle.textContent = '🌙';
    }
}

// 页面加载完成后初始化
let profileManager;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    profileManager = new ProfileManager();
});

// 监听点击模态框外部关闭
document.addEventListener('click', (e) => {
    const modal = document.getElementById('profileModal');
    if (e.target === modal) {
        closeModal();
    }
});
