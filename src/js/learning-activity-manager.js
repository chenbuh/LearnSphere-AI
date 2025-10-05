/**
 * 学习动态管理器
 * 负责记录和显示真实的学习活动
 */

class LearningActivityManager {
    constructor() {
        this.activities = [];
        this.maxActivities = 10; // 最多显示10条动态
        this.activityTypes = {
            vocabulary: { icon: '📚', name: '词汇学习' },
            grammar: { icon: '🎯', name: '语法练习' },
            listening: { icon: '🎧', name: '听力训练' },
            reading: { icon: '📖', name: '阅读理解' },
            writing: { icon: '✍️', name: '写作练习' },
            exam: { icon: '📝', name: '模拟考试' },
            achievement: { icon: '🏆', name: '成就达成' },
            streak: { icon: '🔥', name: '连续学习' },
            level: { icon: '⭐', name: '等级提升' }
        };
        
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        this.loadActivities();
        this.renderActivities();
        console.log('📈 学习动态管理器已初始化');
    }

    /**
     * 加载已保存的学习活动
     */
    loadActivities() {
        try {
            const savedActivities = localStorage.getItem('learning_activities');
            if (savedActivities) {
                this.activities = JSON.parse(savedActivities);
                // 按时间倒序排列
                this.activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
        } catch (error) {
            console.error('加载学习动态失败:', error);
            this.activities = [];
        }
    }

    /**
     * 保存学习活动到localStorage
     */
    saveActivities() {
        try {
            localStorage.setItem('learning_activities', JSON.stringify(this.activities));
        } catch (error) {
            console.error('保存学习动态失败:', error);
        }
    }

    /**
     * 添加新的学习活动
     */
    addActivity(type, description, details = {}) {
        const activity = {
            id: Date.now() + '_' + Math.floor(Math.random() * 1000),
            type: type,
            description: description,
            details: details,
            timestamp: new Date().toISOString()
        };

        // 添加到数组开头
        this.activities.unshift(activity);

        // 限制数组长度
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }

        // 保存并更新显示
        this.saveActivities();
        this.renderActivities();

        console.log('📈 新增学习动态:', activity);
    }

    /**
     * 记录词汇学习活动
     */
    recordVocabularyActivity(wordCount, examType = '') {
        const examText = examType ? `${examType} ` : '';
        this.addActivity('vocabulary', `学习了${wordCount}个${examText}单词`, {
            wordCount: wordCount,
            examType: examType
        });
    }

    /**
     * 记录语法练习活动
     */
    recordGrammarActivity(questionCount, accuracy = null) {
        let description = `完成了${questionCount}道语法题`;
        if (accuracy !== null) {
            description += `，正确率${Math.round(accuracy)}%`;
        }
        this.addActivity('grammar', description, {
            questionCount: questionCount,
            accuracy: accuracy
        });
    }

    /**
     * 记录听力训练活动
     */
    recordListeningActivity(duration, type = '') {
        const typeText = type ? `${type}` : '听力';
        this.addActivity('listening', `完成了${duration}分钟${typeText}训练`, {
            duration: duration,
            type: type
        });
    }

    /**
     * 记录阅读理解活动
     */
    recordReadingActivity(articleCount, accuracy = null) {
        let description = `完成了${articleCount}篇阅读理解`;
        if (accuracy !== null) {
            description += `，正确率${Math.round(accuracy)}%`;
        }
        this.addActivity('reading', description, {
            articleCount: articleCount,
            accuracy: accuracy
        });
    }

    /**
     * 记录写作练习活动
     */
    recordWritingActivity(wordCount, type = '') {
        const typeText = type ? `${type}` : '写作';
        this.addActivity('writing', `完成了${wordCount}字${typeText}练习`, {
            wordCount: wordCount,
            type: type
        });
    }

    /**
     * 记录模拟考试活动
     */
    recordExamActivity(examType, score, duration) {
        this.addActivity('exam', `完成了${examType}模拟考试，得分${score}分`, {
            examType: examType,
            score: score,
            duration: duration
        });
    }

    /**
     * 记录成就达成活动
     */
    recordAchievementActivity(achievementName) {
        this.addActivity('achievement', `达成了"${achievementName}"成就`, {
            achievementName: achievementName
        });
    }

    /**
     * 记录连续学习活动
     */
    recordStreakActivity(days) {
        this.addActivity('streak', `连续学习${days}天`, {
            days: days
        });
    }

    /**
     * 记录等级提升活动
     */
    recordLevelUpActivity(newLevel, module = '') {
        const moduleText = module ? `${module}` : '';
        this.addActivity('level', `${moduleText}等级提升至${newLevel}级`, {
            level: newLevel,
            module: module
        });
    }

    /**
     * 渲染学习活动列表
     */
    renderActivities() {
        const container = document.getElementById('activity-list');
        if (!container) return;

        if (this.activities.length === 0) {
            container.innerHTML = `
                <div class="activity-placeholder">
                    <div class="placeholder-icon">📝</div>
                    <div class="placeholder-text">开始学习后，您的学习动态将在这里显示</div>
                </div>
            `;
            return;
        }

        let html = '';
        this.activities.forEach(activity => {
            const activityType = this.activityTypes[activity.type] || { icon: '📝', name: '学习活动' };
            const timeAgo = this.getTimeAgo(activity.timestamp);
            
            html += `
                <div class="activity-item" data-activity-id="${activity.id}">
                    <div class="activity-icon">${activityType.icon}</div>
                    <div class="activity-content">
                        <div class="activity-text">${activity.description}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 计算时间差显示
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - activityTime) / 1000);

        if (diffInSeconds < 60) {
            return '刚刚';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}分钟前`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}小时前`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}天前`;
        }
    }

    /**
     * 清空所有学习活动
     */
    clearActivities() {
        this.activities = [];
        this.saveActivities();
        this.renderActivities();
        console.log('📈 学习动态已清空');
    }

    /**
     * 获取活动统计
     */
    getActivityStats() {
        const stats = {};
        this.activities.forEach(activity => {
            stats[activity.type] = (stats[activity.type] || 0) + 1;
        });
        return stats;
    }
}

// 全局实例
window.LearningActivityManager = LearningActivityManager;
