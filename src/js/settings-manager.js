/**
 * 设置管理器
 * 处理应用设置和用户偏好
 */

class SettingsManager {
    constructor() {
        this.settings = {
            darkMode: false,
            language: 'zh-CN',
            notifications: true,
            autoSave: true,
            analyticsAutoRefresh: true
        };
        this.init();
    }

    /**
     * 初始化设置管理器
     */
    async init() {
        try {
            console.log('⚙️ 初始化设置管理器...');
            
            // 加载设置
            await this.loadSettings();
            
            // 初始化事件监听器
            this.initEventListeners();
            
            // 应用当前设置
            this.applySettings();
            
            console.log('✅ 设置管理器初始化完成');
        } catch (error) {
            console.error('设置管理器初始化失败:', error);
        }
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        try {
            const savedSettings = await Storage.get('app_settings', {});
            this.settings = { ...this.settings, ...savedSettings };
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    /**
     * 保存设置
     */
    async saveSettings() {
        try {
            await Storage.set('app_settings', this.settings);
            console.log('💾 设置已保存');
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 设置页面切换时绑定事件
        document.addEventListener('routeChanged', (e) => {
            if (e.detail && e.detail.page === 'settings') {
                this.bindSettingsEvents();
            }
        });
        
        // 立即尝试绑定一次
        setTimeout(() => this.bindSettingsEvents(), 1000);
    }

    /**
     * 绑定设置页面的事件监听器
     */
    bindSettingsEvents() {
        // 加载实验性功能
        if (window.AdvancedFeatures && typeof window.AdvancedFeatures.renderFeaturesTo === 'function') {
            const container = document.getElementById('experimental-features-container');
            if (container) {
                window.AdvancedFeatures.renderFeaturesTo(container);
            }
        }

        // 重置进度按钮
        const resetBtn = document.getElementById('resetProgressBtn');
        if (resetBtn && !resetBtn.dataset.bound) {
            resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 重置按钮被点击');
                
                // 直接调用应用的重置方法，而不是显示确认对话框
                if (window.app && typeof window.app.resetAllProgress === 'function') {
                    window.app.resetAllProgress();
                } else {
                    alert('应用未初始化，请刷新页面重试');
                }
            });
            resetBtn.dataset.bound = 'true';
            console.log('✅ 重置按钮事件已绑定');
        }

        // 导出数据按钮
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn && !exportBtn.dataset.bound) {
            exportBtn.addEventListener('click', () => this.exportUserData());
            exportBtn.dataset.bound = 'true';
            console.log('✅ 导出按钮事件已绑定');
        }

        // 深色模式切换
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle && !darkModeToggle.dataset.bound) {
            // 确保开关状态与当前主题同步
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const isDarkMode = currentTheme === 'dark' || this.settings.darkMode;
            
            // 同步设置对象和开关状态
            this.settings.darkMode = isDarkMode;
            darkModeToggle.checked = isDarkMode;
            
            darkModeToggle.addEventListener('change', (e) => {
                console.log('🎨 深色模式开关被点击:', e.target.checked);
                this.toggleDarkMode(e.target.checked);
            });
            darkModeToggle.dataset.bound = 'true';
            console.log('✅ 深色模式开关事件已绑定, 当前状态:', isDarkMode);
        }

        // 学习分析自动刷新开关
        const analyticsToggle = document.getElementById('analyticsAutoRefreshToggle');
        if (analyticsToggle && !analyticsToggle.dataset.bound) {
            analyticsToggle.checked = !!this.settings.analyticsAutoRefresh;
            analyticsToggle.addEventListener('change', async (e) => {
                this.settings.analyticsAutoRefresh = !!e.target.checked;
                await this.saveSettings();
                // 通知学习分析模块
                document.dispatchEvent(new CustomEvent('settings:analyticsAutoRefresh', { detail: { enabled: this.settings.analyticsAutoRefresh } }));
                this.showSuccessMessage(this.settings.analyticsAutoRefresh ? '学习分析自动刷新已开启' : '学习分析自动刷新已关闭');
            });
            analyticsToggle.dataset.bound = 'true';
            console.log('✅ 学习分析自动刷新开关已绑定');
        }
    }

    /**
     * 显示重置确认对话框
     */
    showResetConfirmDialog() {
        const modal = document.getElementById('modal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        const confirmBtn = modal.querySelector('[data-action="confirm"]');
        const cancelBtn = modal.querySelector('[data-action="cancel"]');

        // 设置对话框内容
        modalTitle.innerHTML = `
            <span class="warning-icon">⚠️</span>
            重置学习进度
        `;

        modalBody.innerHTML = `
            <p>您即将删除所有学习进度数据，包括：</p>
            <ul style="margin: 16px 0; padding-left: 20px; color: var(--text-secondary);">
                <li>所有考试类型的学习进度</li>
                <li>词汇学习记录和成绩</li>
                <li>学习统计和成就记录</li>
                <li>个人学习偏好设置</li>
            </ul>
            <div class="warning-text">
                <span class="warning-icon">🔔</span>
                <strong>注意：</strong>此操作无法撤销！建议在重置前先导出数据备份。
            </div>
            <p style="margin-top: 16px;">请确认您真的要重置所有学习进度吗？</p>
        `;

        // 设置按钮样式
        confirmBtn.textContent = '确认重置';
        confirmBtn.className = 'btn btn-danger';
        cancelBtn.textContent = '取消';
        cancelBtn.className = 'btn btn-secondary';

        // 添加确认事件
        const handleConfirm = async () => {
            try {
                await this.resetAllProgress();
                modal.style.display = 'none';
                this.showSuccessMessage('学习进度已重置');
                // 刷新页面以更新显示
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } catch (error) {
                console.error('重置进度失败:', error);
                this.showErrorMessage('重置进度失败，请稍后重试');
            }
            // 清理事件监听器
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        const handleCancel = () => {
            modal.style.display = 'none';
            // 清理事件监听器
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);

        // 显示模态框
        modal.style.display = 'flex';
        modal.classList.add('confirm-modal');
    }

    /**
     * 重置所有进度数据
     */
    async resetAllProgress() {
        console.log('🔄 开始重置所有学习进度...');
        
        // 调用app的重置方法
        if (window.app && typeof window.app.resetAllProgress === 'function') {
            return window.app.resetAllProgress();
        }

        // 如果app方法不可用，则使用备用方案
        const progressKeys = [
            'exam_study_progress',    // 考试学习进度
            'vocabulary_progress',    // 词汇学习进度  
            'vocabularyProgress',     // 词汇学习进度(新格式)
            'writingProgress',        // 写作进度
            'readingProgress',        // 阅读进度
            'grammarProgress',        // 语法进度
            'listening_progress',     // 听力进度
            'progress_data',          // 总体进度数据
            'user_preferences',       // 用户偏好
            'learning_streaks',       // 学习连击记录
            'achievements',           // 成就记录
            'daily_goals',           // 每日目标
            'study_sessions',        // 学习会话
            'performance_data',      // 性能数据
            'recommendation_history', // 推荐历史
            'quiz_results',          // 测验结果
            'error_logs',            // 错误日志（学习相关）
            'custom_word_lists',     // 自定义词汇表
            'study_notes',           // 学习笔记
            'user_settings',         // 用户设置
            'study_times',           // 学习时间
            'exam_history',          // 考试历史
            'gamification_data',     // 游戏化数据
            'gamification_player_data', // 游戏化玩家数据
            'ai_user_profile',       // AI用户画像
            'lastVocabularyStudyDate', // 最后词汇学习日期
            'daily_challenges',      // 每日挑战
            'player_achievements',   // 玩家成就
            'player_badges'          // 玩家徽章
        ];

        let successCount = 0;
        let failCount = 0;

        for (const key of progressKeys) {
            try {
                localStorage.removeItem(key);
                successCount++;
                console.log(`✅ 已清除: ${key}`);
            } catch (error) {
                failCount++;
                console.warn(`⚠️ 清除失败: ${key}`, error);
            }
        }

        // 重新初始化应用状态
        try {
            // 触发应用重新初始化相关组件
            if (window.vocabularyManager) {
                window.vocabularyManager.resetProgress?.();
            }
            if (window.progressTracker) {
                window.progressTracker.resetProgress?.();
            }
            if (window.examStudyPlanner) {
                window.examStudyPlanner.resetProgress?.();
            }
        } catch (error) {
            console.warn('重新初始化组件失败:', error);
        }

        console.log(`🎯 重置完成: 成功清除 ${successCount} 项，失败 ${failCount} 项`);
        
        // 记录重置事件
        const resetInfo = {
            timestamp: new Date().toISOString(),
            itemsCleared: successCount,
            itemsFailed: failCount,
            version: '1.0.0'
        };
        
        await Storage.set('last_reset_info', resetInfo);
    }

    /**
     * 导出用户数据
     */
    async exportUserData() {
        try {
            console.log('📥 开始导出用户数据...');
            
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: {}
            };

            // 收集所有进度数据
            const dataKeys = [
                'exam_study_progress',
                'vocabulary_progress', 
                'progress_data',
                'app_settings',
                'user_preferences',
                'achievements',
                'learning_streaks',
                'study_sessions'
            ];

            for (const key of dataKeys) {
                try {
                    const data = await Storage.get(key);
                    if (data) {
                        exportData.data[key] = data;
                    }
                } catch (error) {
                    console.warn(`导出 ${key} 失败:`, error);
                }
            }

            // 创建下载链接
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = url;
            link.download = `英语学习数据备份_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理URL对象
            URL.revokeObjectURL(url);
            
            this.showSuccessMessage('数据导出成功');
            console.log('✅ 用户数据导出完成');
            
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showErrorMessage('数据导出失败，请稍后重试');
        }
    }

    /**
     * 切换深色模式
     */
    async toggleDarkMode(enabled) {
        this.settings.darkMode = enabled;
        await this.saveSettings();
        this.applyDarkMode(enabled);
        
        this.showSuccessMessage(enabled ? '已切换到深色模式' : '已切换到浅色模式');
    }

    /**
     * 应用深色模式
     */
    applyDarkMode(enabled) {
        if (enabled) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // 同时更新导航栏的主题切换按钮
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.icon');
            if (icon) {
                icon.textContent = enabled ? '☀️' : '🌙';
            }
        }
    }

    /**
     * 应用所有设置
     */
    applySettings() {
        // 应用深色模式
        this.applyDarkMode(this.settings.darkMode);
        
        // 应用语言设置
        if (this.settings.language) {
            document.documentElement.lang = this.settings.language;
        }

        // 将设置广播给学习分析模块
        try {
            document.dispatchEvent(new CustomEvent('settings:analyticsAutoRefresh', { detail: { enabled: !!this.settings.analyticsAutoRefresh } }));
        } catch (err) { /* 忽略 */ }
    }

    /**
     * 显示成功消息
     */
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
        this.showToast(message, 'error');
    }

    /**
     * 显示提示消息
     */
    showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        // 添加样式
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 获取toast图标
     */
    getToastIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
}

// 导出和全局初始化
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
} else {
    window.SettingsManager = SettingsManager;
}
