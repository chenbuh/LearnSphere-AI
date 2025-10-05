/**
 * 统计页面脚本
 * 负责展示学习数据的可视化
 */

class StatisticsPage {
    constructor() {
        this.progressTracker = null;
        this.chartComponents = null;
        this.init();
    }

    async init() {
        console.log('📊 初始化统计页面...');
        
        try {
            // 等待依赖加载
            await this.waitForDependencies();
            
            // 初始化组件
            this.progressTracker = new ProgressTracker();
            this.chartComponents = new ChartComponents();
            
            // 加载数据并渲染
            await this.loadAndRenderData();
            
            // 设置事件监听
            this.setupEventListeners();
            
            console.log('✅ 统计页面初始化完成');
        } catch (error) {
            console.error('统计页面初始化失败:', error);
            this.showError('统计页面加载失败，请刷新重试');
        }
    }

    /**
     * 等待依赖加载
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (window.ProgressTracker && window.ChartComponents && window.Storage) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * 加载数据并渲染
     */
    async loadAndRenderData() {
        try {
            // 获取进度统计
            const stats = this.progressTracker.getProgressStats();
            
            // 渲染各个部分
            this.renderOverviewStats(stats);
            this.renderProgressRings(stats);
            this.renderActivityCharts(stats);
            this.renderSkillRadar(stats);
            this.renderLearningHeatmap();
            this.renderAchievements();
            this.renderRecommendations(stats);
            
        } catch (error) {
            console.error('数据加载失败:', error);
            this.showError('数据加载失败');
        }
    }

    /**
     * 渲染概览统计
     */
    renderOverviewStats(stats) {
        document.getElementById('totalXP').textContent = stats.overall.xp.toLocaleString();
        document.getElementById('currentStreak').textContent = stats.overall.currentStreak;
        document.getElementById('currentLevel').textContent = this.getLevelName(stats.overall.level);
        document.getElementById('achievementsCount').textContent = stats.overall.achievements;
    }

    /**
     * 渲染进度环形图
     */
    renderProgressRings(stats) {
        // 词汇进度环
        this.chartComponents.createProgressRing('vocabularyRing', {
            percentage: stats.vocabulary.completion,
            label: `${stats.vocabulary.learned}/${stats.vocabulary.total}`
        }, {
            size: 120,
            foregroundColor: '#007bff',
            animationDuration: 1500
        });

        // 语法进度环
        this.chartComponents.createProgressRing('grammarRing', {
            percentage: stats.grammar.completion,
            label: `${stats.grammar.topicsCompleted}/${stats.grammar.totalTopics}`
        }, {
            size: 120,
            foregroundColor: '#28a745',
            animationDuration: 1600
        });

        // 听力进度环
        this.chartComponents.createProgressRing('listeningRing', {
            percentage: stats.listening.completion,
            label: `${stats.listening.completedExercises}/${stats.listening.totalExercises}`
        }, {
            size: 120,
            foregroundColor: '#ffc107',
            animationDuration: 1700
        });

        // 阅读进度环
        this.chartComponents.createProgressRing('readingRing', {
            percentage: stats.reading.completion,
            label: `${stats.reading.articlesRead}/${stats.reading.totalArticles}`
        }, {
            size: 120,
            foregroundColor: '#dc3545',
            animationDuration: 1800
        });
    }

    /**
     * 渲染活动图表
     */
    renderActivityCharts(stats) {
        // 每周活动柱状图
        const weeklyData = this.generateWeeklyData(stats);
        this.chartComponents.createBarChart('weeklyActivityChart', weeklyData, {
            height: 200,
            barColor: '#007bff',
            showValues: true
        });

        // 模块活动对比
        const moduleData = [
            { label: '词汇', value: stats.vocabulary.weeklyAvg },
            { label: '语法', value: stats.grammar.weeklyAvg },
            { label: '听力', value: stats.listening.weeklyAvg },
            { label: '阅读', value: stats.reading.weeklyAvg }
        ];
        this.chartComponents.createBarChart('moduleActivityChart', moduleData, {
            height: 200,
            barColor: '#28a745',
            showValues: true
        });
    }

    /**
     * 渲染技能雷达图
     */
    renderSkillRadar(stats) {
        const skillData = [
            { label: '词汇量', value: stats.vocabulary.completion },
            { label: '语法', value: stats.grammar.completion },
            { label: '听力', value: stats.listening.completion },
            { label: '阅读', value: stats.reading.completion },
            { label: '写作', value: stats.writing?.completion || 30 },
            { label: '口语', value: stats.speaking?.completion || 25 }
        ];

        this.chartComponents.createRadarChart('skillRadarChart', skillData, {
            size: 300,
            strokeColor: '#007bff',
            fillColor: '#007bff40'
        });
    }

    /**
     * 渲染学习热力图
     */
    renderLearningHeatmap() {
        // 生成模拟热力图数据（52周，每周7天）
        const heatmapData = this.generateHeatmapData();
        
        this.chartComponents.createHeatmap('learningHeatmap', heatmapData, {
            cellSize: 12,
            cellSpacing: 2,
            colorScale: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
        });
    }

    /**
     * 渲染成就展示
     */
    renderAchievements() {
        const achievements = this.generateAchievements();
        const container = document.getElementById('achievementsGrid');
        
        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-progress">${achievement.progress}</div>
                ${achievement.unlocked && achievement.date ? 
                    `<div class="achievement-date">${achievement.date}</div>` : ''
                }
            </div>
        `).join('');
    }

    /**
     * 渲染学习建议
     */
    renderRecommendations(stats) {
        const report = this.progressTracker.generateReport();
        const recommendations = report.recommendations;
        const container = document.getElementById('recommendationsList');
        
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item ${rec.priority}-priority">
                <div class="recommendation-priority ${rec.priority}">${this.getPriorityText(rec.priority)}</div>
                <div class="recommendation-message">${rec.message}</div>
            </div>
        `).join('');
    }

    /**
     * 生成每周数据
     */
    generateWeeklyData(stats) {
        const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const totalWeekly = [
            stats.vocabulary.weeklyProgress,
            stats.grammar.weeklyProgress,
            stats.listening.weeklyProgress,
            stats.reading.weeklyProgress
        ];

        return days.map((day, index) => ({
            label: day,
            value: totalWeekly.reduce((sum, weekly) => sum + (weekly[index] || 0), 0)
        }));
    }

    /**
     * 生成热力图数据（基于真实学习记录）
     */
    generateHeatmapData() {
        const weeks = 52;
        const days = 7;
        const data = [];
        
        // 获取真实的学习会话数据
        const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
        const learningActivities = JSON.parse(localStorage.getItem('learning_activities') || '[]');
        
        // 创建日期到活动数量的映射
        const activityMap = new Map();
        
        // 处理学习会话
        studySessions.forEach(session => {
            if (session.startTime) {
                const date = new Date(session.startTime);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
            }
        });
        
        // 处理学习活动
        learningActivities.forEach(activity => {
            if (activity.timestamp) {
                const date = new Date(activity.timestamp);
                const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
            }
        });

        // 生成过去52周的数据
        const today = new Date();
        for (let week = 0; week < weeks; week++) {
            const weekData = [];
            for (let day = 0; day < days; day++) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() - (weeks - week - 1) * 7 - (days - day - 1));
                
                const dateKey = `${targetDate.getFullYear()}-${targetDate.getMonth()}-${targetDate.getDate()}`;
                const activityCount = Math.min(5, activityMap.get(dateKey) || 0); // 限制在0-5范围内
                
                weekData.push(activityCount);
            }
            data.push(weekData);
        }

        return data;
    }

    /**
     * 生成成就数据（基于真实学习数据）
     */
    generateAchievements() {
        const stats = this.progressTracker.getProgressStats();
        const achievements = [];
        
        // 获取真实数据
        const vocabLearned = stats.vocabulary.learned || 0;
        const grammarCompleted = stats.grammar.topicsCompleted || 0;
        const listeningHours = stats.listening.hoursListened || 0;
        const currentStreak = stats.overall.currentStreak || 0;
        const totalXP = stats.overall.xp || 0;
        const studySessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
        
        // 学习新手成就
        const hasFirstSession = studySessions.length > 0;
        achievements.push({
            icon: '🎓',
            title: '学习新手',
            description: '完成首次学习',
            progress: hasFirstSession ? '100%' : '0%',
            unlocked: hasFirstSession,
            date: hasFirstSession ? new Date(studySessions[0].startTime).toLocaleDateString() : null
        });
        
        // 词汇达人成就
        const vocabTarget = 500;
        const vocabProgress = Math.min(100, Math.round((vocabLearned / vocabTarget) * 100));
        achievements.push({
            icon: '📚',
            title: '词汇达人',
            description: '掌握500个单词',
            progress: `${vocabProgress}% (${vocabLearned}/${vocabTarget})`,
            unlocked: vocabLearned >= vocabTarget,
            date: vocabLearned >= vocabTarget ? new Date().toLocaleDateString() : null
        });
        
        // 坚持一周成就
        const weekStreak = currentStreak >= 7;
        achievements.push({
            icon: '🔥',
            title: '坚持一周',
            description: '连续学习7天',
            progress: weekStreak ? '100%' : `${Math.min(100, Math.round((currentStreak / 7) * 100))}% (${currentStreak}/7)`,
            unlocked: weekStreak,
            date: weekStreak ? new Date().toLocaleDateString() : null
        });
        
        // 语法专家成就
        const grammarTarget = 10;
        const grammarProgress = Math.min(100, Math.round((grammarCompleted / grammarTarget) * 100));
        achievements.push({
            icon: '⭐',
            title: '语法专家',
            description: '完成10个语法主题',
            progress: `${grammarProgress}% (${grammarCompleted}/${grammarTarget})`,
            unlocked: grammarCompleted >= grammarTarget,
            date: grammarCompleted >= grammarTarget ? new Date().toLocaleDateString() : null
        });
        
        // 听力高手成就
        const listeningTarget = 50;
        const listeningProgress = Math.min(100, Math.round((listeningHours / listeningTarget) * 100));
        achievements.push({
            icon: '🎯',
            title: '听力高手',
            description: '听力练习50小时',
            progress: `${listeningProgress}% (${listeningHours.toFixed(1)}/${listeningTarget})`,
            unlocked: listeningHours >= listeningTarget,
            date: listeningHours >= listeningTarget ? new Date().toLocaleDateString() : null
        });
        
        // 学习大师成就
        const xpTarget = 10000;
        const xpProgress = Math.min(100, Math.round((totalXP / xpTarget) * 100));
        achievements.push({
            icon: '👑',
            title: '学习大师',
            description: '获得10000经验值',
            progress: `${xpProgress}% (${totalXP}/${xpTarget})`,
            unlocked: totalXP >= xpTarget,
            date: totalXP >= xpTarget ? new Date().toLocaleDateString() : null
        });
        
        return achievements;
    }

    /**
     * 获取等级名称
     */
    getLevelName(level) {
        const names = {
            'beginner': '初学者',
            'elementary': '入门级',
            'intermediate': '中级',
            'advanced': '高级',
            'expert': '专家级'
        };
        return names[level] || '未知';
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const texts = {
            'high': '高优先级',
            'medium': '中优先级',
            'low': '低优先级'
        };
        return texts[priority] || priority;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 成就点击事件
        document.addEventListener('click', (e) => {
            const achievement = e.target.closest('.achievement-item');
            if (achievement) {
                this.showAchievementDetails(achievement);
            }
        });

        // 定期更新数据
        setInterval(() => {
            this.updateRealTimeData();
        }, 60000); // 每分钟更新一次
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新主题图标
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * 显示成就详情
     */
    showAchievementDetails(achievementElement) {
        const title = achievementElement.querySelector('.achievement-title').textContent;
        const desc = achievementElement.querySelector('.achievement-desc').textContent;
        const progress = achievementElement.querySelector('.achievement-progress').textContent;
        const unlocked = achievementElement.classList.contains('unlocked');
        
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <h3>${title}</h3>
                    <p>${desc}</p>
                    <p><strong>进度:</strong> ${progress}</p>
                    <p><strong>状态:</strong> ${unlocked ? '已解锁 🎉' : '未解锁 🔒'}</p>
                    <button class="close-modal">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * 更新实时数据
     */
    updateRealTimeData() {
        try {
            const stats = this.progressTracker.getProgressStats();
            this.renderOverviewStats(stats);
        } catch (error) {
            console.error('实时数据更新失败:', error);
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsPage();
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsPage;
} else {
    window.StatisticsPage = StatisticsPage;
}

console.log('📊 统计页面脚本已加载');
