/**
 * 英语等级考试学习软件 - 主应用文件
 * 负责应用的初始化和全局状态管理
 */

class EnglishExamApp {
    constructor() {
        this.currentUser = null;
        this.currentExamType = null;
        this.settings = {};
        this.learningData = {};
        
        // AI智能推荐系统
        this.aiRecommendationManager = null;
        this.currentRecommendations = [];
        
        // 防止重复加载标志
        this._vocabularyPageLoading = false;
        this._grammarPageLoading = false;
        this._listeningPageLoading = false;
        this._readingPageLoading = false;
        this._writingPageLoading = false;
        this._errorBookPageLoading = false;
        this._statisticsPageLoading = false;
        
        // DOM元素缓存 - 性能优化
        this.domCache = {
            pages: null,
            navItems: null,
            body: null,
            root: null
        };
        
        // 性能优化: 防抖函数缓存
        this.debouncedFunctions = {};
        
        // 事件监听器管理 - 防止内存泄漏
        this.eventListeners = [];
        
        this.init();
    }

    /**
     * 应用初始化
     */
    async init() {
        try {
            // 显示加载动画
            this.showLoadingScreen();
            
            // 检查是否从个人中心返回，如果是则恢复状态
            this.checkAndRestoreState();
            
            // 加载用户设置
            await this.loadSettings();
            
            // 初始化主题
            this.initTheme();
            
            // 初始化路由
            this.initRouter();
            
            // 初始化DOM缓存 - 性能优化
            this.initDOMCache();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 初始化组件
            this.initComponents();
            
            // 初始化性能监控
            this.initPerformanceMonitoring();
            
            // 添加页面动画
            this.initPageAnimations();
            
            // 初始化新功能模块
            this.progressTracker = new ProgressTracker();
            this.chartComponents = new ChartComponents();
            this.vocabularyManager = new VocabularyManager();
            
            // 初始化真实数据统计管理器
            if (typeof RealDataStatistics !== 'undefined') {
                this.realDataStats = new RealDataStatistics();
                window.realDataStats = this.realDataStats;
            }
            
            // 初始化社交分享管理器
            if (typeof SocialSharing !== 'undefined') {
                this.socialSharing = new SocialSharing();
                window.logger?.info('社交分享管理器已初始化');
            }
            
            // 初始化学习动态管理器
            if (typeof LearningActivityManager !== 'undefined') {
                this.learningActivityManager = new LearningActivityManager();
                window.learningActivityManager = this.learningActivityManager;
                window.logger?.info('学习动态管理器已初始化');
            }
            
            // 初始化AI导师
            if (typeof AITutor !== 'undefined') {
                this.aiTutor = new AITutor();
                window.aiTutor = this.aiTutor;
                window.logger?.info('AI导师已初始化');
            }
            
            // 初始化AI内容生成器
            if (typeof AIContentGenerator !== 'undefined') {
                this.aiContentGenerator = new AIContentGenerator();
                window.aiContentGenerator = this.aiContentGenerator;
                window.logger?.info('AI内容生成器已初始化');
            }
            
            this.grammarManager = new GrammarManager();
            this.listeningManager = new ListeningManager();
            this.examStudyPlanner = new ExamStudyPlanner();
            this.examProgressDisplay = new ExamProgressDisplay();
            this.settingsManager = new SettingsManager();
            
            // 设置全局引用以供其他组件使用
            window.vocabularyManager = this.vocabularyManager;
            window.progressTracker = this.progressTracker;
            window.examStudyPlanner = this.examStudyPlanner;
            
            // 加载用户数据
            await this.loadUserData();
            
            // 初始化AI推荐系统
            await this.initAIRecommendationSystem();
            
            // 初始化游戏化系统
            await this.initGamificationSystem();
            
            // 延迟更新每日挑战显示，确保所有组件都已加载
            setTimeout(() => {
                this.updateDailyChallengesDisplay();
            }, 2000);
            
            // 应用启动完成
            this.onAppReady();
            
            window.logger?.info('英语等级考试学习软件启动成功！');
        } catch (error) {
            window.logger?.error('应用初始化失败:', error);
            this.showNotification('应用启动失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 加载用户设置
     */
    async loadSettings() {
        try {
            const savedSettings = await Storage.get('user_settings');
            this.settings = {
                theme: 'light',
                language: 'zh-CN',
                examType: 'cet4',
                dailyGoal: 30, // 分钟
                notifications: true,
                autoSave: true,
                fontSize: 'medium',
                ...savedSettings
            };
        } catch (error) {
            console.warn('加载设置失败，使用默认设置:', error);
        }
    }

    /**
     * 保存用户设置
     */
    async saveSettings() {
        try {
            await Storage.set('user_settings', this.settings);
            this.showNotification('设置已保存', 'success');
        } catch (error) {
            window.logger?.error('保存设置失败:', error);
            this.showNotification('设置保存失败', 'error');
        }
    }

    /**
     * 初始化主题 (委托给SettingsManager)
     */
    initTheme() {
        // 主题初始化由SettingsManager处理
        if (this.settingsManager) {
            this.settingsManager.applySettings();
        }
    }

    /**
     * 切换主题 (委托给SettingsManager)
     */
    toggleTheme() {
        if (this.settingsManager) {
            const currentDarkMode = this.settingsManager.settings.darkMode;
            this.settingsManager.toggleDarkMode(!currentDarkMode);
        }
    }

    /**
     * 初始化路由
     */
    initRouter() {
        this.router = new Router();
        
        // 注册路由
        this.router.addRoute('home', () => this.showPage('home'));
        this.router.addRoute('vocabulary', () => this.showPage('vocabulary'));
        this.router.addRoute('vocab-test', () => this.showPage('vocab-test'));
        this.router.addRoute('grammar', () => this.showPage('grammar'));
        this.router.addRoute('listening', () => this.showPage('listening'));
        this.router.addRoute('reading', () => this.showPage('reading'));
        this.router.addRoute('writing', () => this.showPage('writing'));
        this.router.addRoute('exam', () => this.showPage('exam'));
        this.router.addRoute('statistics', () => this.showPage('statistics'));
        this.router.addRoute('analytics', () => this.showPage('analytics'));
        this.router.addRoute('error-book', () => this.showPage('error-book'));
        this.router.addRoute('profile', () => this.showProfilePage());
        this.router.addRoute('settings', () => this.showPage('settings'));
        
        // 启动路由
        this.router.start();
        
        // 监听登录状态变化
        this.setupAuthListener();
    }

    /**
     * 设置登录状态监听器
     */
    setupAuthListener() {
        // 监听localStorage变化
        window.addEventListener('storage', (e) => {
            if (e.key === 'username' || e.key === 'token') {
                // 登录状态发生变化，更新显示
                this.currentUser = localStorage.getItem('username');
            }
        });
        
        // 定期检查登录状态（处理同一标签页的变化）
        setInterval(() => {
            const currentLoggedUser = localStorage.getItem('username');
            if (currentLoggedUser !== this.currentUser) {
                this.currentUser = currentLoggedUser;
            }
        }, 1000);
    }

    /**
     * 显示页面 - 性能优化版本
     */
    showPage(pageName) {
        // 缓存DOM查询以提高性能
        if (!this.domCache.pages) {
            this.domCache.pages = document.querySelectorAll('.page');
        }
        
        // 隐藏所有页面
        this.domCache.pages.forEach(page => page.classList.remove('active'));
        
        // 显示目标页面
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 更新导航状态
        this.updateNavigation(pageName);
        
        // 触发页面加载事件
        this.onPageLoad(pageName);
    }

    /**
     * 更新导航状态 - 性能优化版本
     */
    updateNavigation(activePage) {
        // 缓存导航项查询
        if (!this.domCache.navItems) {
            this.domCache.navItems = document.querySelectorAll('.nav-item');
        }
        
        this.domCache.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === activePage) {
                item.classList.add('active');
            }
        });
    }

    /**
     * 页面加载回调
     */
    onPageLoad(pageName) {
        switch (pageName) {
            case 'home':
                this.loadHomePage();
                break;
            case 'vocabulary':
                this.loadVocabularyPage();
                break;
            case 'vocab-test':
                this.loadVocabTestPage();
                break;
            case 'grammar':
                this.loadGrammarPage();
                break;
            case 'listening':
                this.loadListeningPage();
                break;
            case 'reading':
                this.loadReadingPage();
                break;
            case 'writing':
                this.loadWritingPage();
                break;
            case 'exam':
                this.loadExamPage();
                break;
            case 'statistics':
                this.loadStatisticsPage();
                break;
            case 'analytics':
                this.loadAnalyticsPage();
                break;
            case 'error-book':
                this.loadErrorBookPage();
                break;
            case 'settings':
                this.loadSettingsPage();
                break;
        }
    }

    /**
     * 清理DOM缓存 - 性能优化
     */
    clearDOMCache() {
        this.domCache.pages = null;
        this.domCache.navItems = null;
        this.domCache.body = null;
        this.domCache.root = null;
    }

    /**
     * 初始化DOM缓存 - 性能优化
     */
    initDOMCache() {
        this.domCache.body = document.body;
        this.domCache.root = document.documentElement;
        // 其他元素将在需要时延迟加载
    }

    /**
     * 添加事件监听器并记录 - 防止内存泄漏
     */
    addEventListenerTracked(element, event, handler, options = false) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }

    /**
     * 移除所有事件监听器 - 防止内存泄漏
     */
    removeAllEventListeners() {
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            try {
                element.removeEventListener(event, handler, options);
            } catch (error) {
                console.warn('移除事件监听器失败:', error);
            }
        });
        this.eventListeners = [];
    }

    /**
     * 显示确认模态框 - 现代化UI
     */
    showConfirmModal(title, message, type = 'info') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal fade show';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-${type === 'warning' ? 'warning' : 'info'}">
                                ${message}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove(); window.resolveConfirm(false);">
                                取消
                            </button>
                            <button type="button" class="btn btn-${type === 'warning' ? 'danger' : 'primary'}" onclick="this.closest('.modal').remove(); window.resolveConfirm(true);">
                                确认
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // 设置全局回调
            window.resolveConfirm = (result) => {
                delete window.resolveConfirm;
                resolve(result);
            };

            document.body.appendChild(modal);
        });
    }

    /**
     * 绑定全局事件 - 优化版本
     */
    bindGlobalEvents() {
        // 导航按钮事件 - 使用事件委托提高性能
        const globalClickHandler = (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.dataset.page) {
                e.preventDefault();
                this.router.navigate(navItem.dataset.page);
                return;
            }

            // 处理具有data-action属性的按钮
            const action = e.target.getAttribute('data-action');
            if (action) {
                e.preventDefault();
                this.handleGlobalAction(action, e);
            }

            // 考试类型选择事件
            const examCard = e.target.closest('.exam-card');
            if (examCard && examCard.dataset.exam) {
                this.selectExamType(examCard.dataset.exam);
            }
        };
        
        this.addEventListenerTracked(document, 'click', globalClickHandler);

        // 主题切换事件
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            this.addEventListenerTracked(themeToggle, 'click', () => this.toggleTheme());
        }

        // 键盘快捷键
        const keydownHandler = (e) => {
            this.handleKeyboardShortcuts(e);
        };
        this.addEventListenerTracked(document, 'keydown', keydownHandler);

        // 窗口关闭前保存数据
        const beforeUnloadHandler = () => {
            this.saveUserData();
        };
        this.addEventListenerTracked(window, 'beforeunload', beforeUnloadHandler);

        // 定期自动保存
        if (this.settings.autoSave) {
            setInterval(() => {
                this.saveUserData();
            }, 60000); // 每分钟保存一次
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + 数字键快速导航
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '8') {
            e.preventDefault();
            const pages = ['home', 'vocabulary', 'grammar', 'listening', 'reading', 'exam', 'statistics', 'settings'];
            const pageIndex = parseInt(e.key) - 1;
            if (pages[pageIndex]) {
                this.router.navigate(pages[pageIndex]);
            }
        }

        // ESC 键关闭模态框
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.show');
            if (modal) {
                Modal.hide();
            }
        }
    }

    /**
     * 选择考试类型
     */
    selectExamType(examType) {
        // 移除其他选中状态
        document.querySelectorAll('.exam-card').forEach(card => {
            card.classList.remove('selected');
        });

        // 添加选中状态
        const selectedCard = document.querySelector(`[data-exam="${examType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }

        // 保存选择
        this.currentExamType = examType;
        this.settings.examType = examType;
        this.saveSettings();

        // 显示选择结果
        const examNames = {
            'cet4': '大学英语四级',
            'cet6': '大学英语六级',
            'postgraduate': '考研英语',
            'ielts': '雅思考试',
            'toefl': '托福考试',
            'other': '其他考试'
        };

        this.showNotification(`已选择：${examNames[examType]}`, 'success');

        // 触发考试类型变化事件
        const event = new CustomEvent('examTypeChanged', {
            detail: { examType, examName: examNames[examType] }
        });
        document.dispatchEvent(event);

        // 更新相关数据
        this.updateExamTypeData();
    }

    /**
     * 更新考试类型相关数据
     */
    async updateExamTypeData() {
        try {
            // 使用考试配置系统
            const examConfig = window.examConfig;
            if (examConfig) {
                const currentExam = examConfig.getCurrentExam();
                if (currentExam) {
                    this.currentExamConfig = currentExam;
                    
                    // 显示考试信息
                    this.showExamInfo(currentExam);
                    
                    // 更新进度追踪器
                    if (this.progressTracker) {
                        this.progressTracker.updateExamTarget(currentExam);
                    }
                    
                    // 更新AI推荐系统
                    if (this.aiRecommendationManager) {
                        this.aiRecommendationManager.updateExamContext(currentExam);
                    }
                }
            }
            
            console.log(`正在加载 ${this.currentExamType} 相关数据...`);
        } catch (error) {
            console.error('更新考试数据失败:', error);
        }
    }

    /**
     * 显示考试信息
     */
    showExamInfo(examConfig) {
        const message = `
            <div class="exam-info">
                <h4>${examConfig.icon} ${examConfig.name}</h4>
                <p><strong>目标分数:</strong> ${examConfig.targetScore}/${examConfig.maxScore}</p>
                <p><strong>考试时长:</strong> ${examConfig.duration}分钟</p>
                <p><strong>词汇量要求:</strong> ${examConfig.vocabulary.total}词</p>
                <p><strong>难度等级:</strong> ${examConfig.vocabulary.difficulty}</p>
            </div>
        `;
        
        this.showNotification(message, 'info', 5000);
    }

    /**
     * 初始化组件
     */
    initComponents() {
        try {
        // 初始化模态框
            if (typeof Modal !== 'undefined') {
        Modal.init();
                console.log('✅ Modal组件已初始化');
            } else {
                console.warn('⚠️ Modal组件未找到');
            }
        
        // 初始化通知系统
            if (typeof Notification !== 'undefined') {
        Notification.init();
                console.log('✅ Notification组件已初始化');
            } else {
                console.warn('⚠️ Notification组件未找到');
            }
        
        // 初始化进度条
            if (typeof Progress !== 'undefined') {
        Progress.init();
                console.log('✅ Progress组件已初始化');
            } else {
                console.warn('⚠️ Progress组件未找到');
            }
        } catch (error) {
            console.error('组件初始化失败:', error);
        }
    }

    /**
     * 加载用户数据
     */
    async loadUserData() {
        try {
            this.learningData = await Storage.get('learning_data') || {
                vocabularyProgress: {},
                grammarProgress: {},
                listeningProgress: {},
                readingProgress: {},
                examRecords: [],
                dailyStats: {},
                totalStudyTime: 0,
                streakDays: 0,
                totalPoints: 0
            };

            // 更新界面显示
            this.updateProgressDisplay();
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    }

    /**
     * 保存用户数据
     */
    async saveUserData() {
        try {
            await Storage.set('learning_data', this.learningData);
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    }

    /**
     * 更新进度显示
     */
    updateProgressDisplay() {
        // 确保learningData已初始化
        if (!this.learningData) {
            this.learningData = {
                vocabularyProgress: { learned: 0, total: 0 },
                grammarProgress: { completed: 0, total: 40 },
                listeningProgress: { completed: 0, total: 40 },
                readingProgress: { completed: 0, total: 40 }
            };
        }

        // 获取真实的词汇数据
        let vocabStats = { learned: 0, total: 0 };
        if (this.vocabularyManager && window.vocabularyDatabase) {
            const learningStats = this.vocabularyManager.getLearningStats();
            const currentExam = this.currentExamType || 'basic';
            const examWords = window.vocabularyDatabase.getVocabularyByExam(currentExam);
            
            vocabStats = {
                learned: learningStats.totalLearned + learningStats.totalMastered,
                total: examWords.length || 2000
            };
        }

        // 更新词汇进度
        this.updateProgressBar('vocabulary', vocabStats.learned, vocabStats.total);

        // 更新语法进度
        const grammarProgress = this.learningData.grammarProgress || {};
        this.updateProgressBar('grammar', grammarProgress.completed || 0, grammarProgress.total || 40);

        // 更新听力进度
        const listeningProgress = this.learningData.listeningProgress || {};
        this.updateProgressBar('listening', listeningProgress.completed || 0, listeningProgress.total || 40);

        // 更新阅读进度
        const readingProgress = this.learningData.readingProgress || {};
        this.updateProgressBar('reading', readingProgress.completed || 0, readingProgress.total || 40);
    }

    /**
     * 更新进度条
     */
    updateProgressBar(type, current, total) {
        // 使用更可靠的选择器方法
        const progressItems = document.querySelectorAll('.progress-item');
        const targetIcon = this.getProgressIcon(type);
        
        for (const item of progressItems) {
            const iconElement = item.querySelector('.progress-icon');
            if (iconElement && iconElement.textContent.trim() === targetIcon) {
                const progressFill = item.querySelector('.progress-info .progress-fill');
                const progressText = item.querySelector('.progress-info .progress-text');
                
                if (progressFill && progressText) {
                    const percentage = Math.round((current / total) * 100);
                    progressFill.style.width = `${percentage}%`;
                    progressText.textContent = `${current} / ${total} ${this.getProgressUnit(type)}`;
                }
                break;
            }
        }
    }

    /**
     * 获取进度图标
     */
    getProgressIcon(type) {
        const icons = {
            vocabulary: '📚',
            grammar: '📝',
            listening: '🎵',
            reading: '📖'
        };
        return icons[type] || '📊';
    }

    /**
     * 获取进度单位
     */
    getProgressUnit(type) {
        const units = {
            vocabulary: '词汇',
            grammar: '章节',
            listening: '练习',
            reading: '文章'
        };
        return units[type] || '项目';
    }


    /**
     * 获取今日学习时间
     */
    getTodayStudyTime() {
        const today = new Date().toDateString();
        return this.learningData.dailyStats[today] || 0;
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        Notification.show(message, type);
    }

    /**
     * 应用准备就绪回调
     */
    onAppReady() {
        // 隐藏加载画面
        this.hideLoadingScreen();

        // 显示欢迎消息
        if (!this.currentExamType) {
            this.showNotification('欢迎使用英语等级考试学习软件！请先选择您的目标考试类型。', 'info');
        }
    }

    /**
     * 重置所有学习进度数据
     */
    async resetAllProgress() {
        console.log('🔄 resetAllProgress 方法被调用');
        
        const confirmation = await this.showConfirmModal(
            '确认重置',
            '确定要重置所有学习进度数据吗？这个操作无法撤销！',
            'warning'
        );
        
        if (!confirmation) {
            console.log('❌ 用户取消了重置操作');
            return false;
        }

        try {
            console.log('✅ 用户确认重置，开始执行重置操作');
            let resetCount = 0;
            const managers = [
                { name: 'vocabulary', manager: window.vocabularyManager },
                { name: 'vocabularyTest', manager: window.vocabularyTestManager },
                { name: 'grammar', manager: window.grammarManager },
                { name: 'listening', manager: window.listeningManager },
                { name: 'reading', manager: window.readingManager },
                { name: 'writing', manager: window.writingManager }
            ];

            console.log('🔍 检查可用的管理器:');
            managers.forEach(({ name, manager }) => {
                console.log(`- ${name}: ${manager ? '存在' : '不存在'}, resetProgress: ${manager && typeof manager.resetProgress === 'function' ? '可用' : '不可用'}`);
                
                if (manager && typeof manager.resetProgress === 'function') {
                    try {
                        manager.resetProgress();
                        resetCount++;
                        console.log(`✅ ${name} 进度已重置`);
                    } catch (error) {
                        console.error(`❌ 重置${name}进度失败:`, error);
                    }
                } else {
                    console.warn(`⚠️ ${name}Manager 不存在或没有resetProgress方法`);
                }
            });

            // 重置游戏化系统数据
            if (this.gamificationManager && typeof this.gamificationManager.resetPlayerData === 'function') {
                try {
                    this.gamificationManager.resetPlayerData();
                    resetCount++;
                    console.log('✅ 游戏化系统数据已重置');
                } catch (error) {
                    console.error('❌ 重置游戏化系统失败:', error);
                }
            } else {
                console.warn('⚠️ 游戏化管理器不存在或没有resetPlayerData方法');
            }

            // 重置其他相关数据
            const keysToRemove = [
                'user_settings', 'study_times', 'exam_history', 'learning_data',
                'gamification_data', 'gamification_player_data', 'ai_user_profile', 
                'vocabularyProgress', 'vocab_test_history', 'writingProgress', 
                'readingProgress', 'grammarProgress', 'listening_progress', 
                'lastVocabularyStudyDate', 'daily_challenges', 'player_achievements', 
                'player_badges', 'study_sessions'
            ];
            
            console.log('🗑️ 清除localStorage数据:');
            keysToRemove.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`✅ 已清除: ${key}`);
                } else {
                    console.log(`ℹ️ 键不存在: ${key}`);
                }
            });

            console.log(`🎯 总共重置了 ${resetCount} 个模块的进度`);
            
            // 立即更新游戏化显示
            if (this.gamificationManager) {
                try {
                    const playerSummary = this.gamificationManager.getPlayerSummary();
                    this.updateGamificationDisplay(playerSummary);
                    console.log('✅ 游戏化显示已更新');
                } catch (error) {
                    console.error('❌ 更新游戏化显示失败:', error);
                }
            }
            
            if (this.showNotification) {
                this.showNotification(`进度重置完成！已重置 ${resetCount} 个模块的数据`, 'success');
            } else {
                this.showNotification(`进度重置完成！已重置 ${resetCount} 个模块的数据`, 'success');
            }
            
            // 刷新页面以清除内存中的数据
            setTimeout(async () => {
                const refreshConfirm = await this.showConfirmModal(
                    '刷新页面',
                    '进度已重置，是否刷新页面以完全清除数据？'
                );
                if (refreshConfirm) {
                    window.location.reload();
                }
            }, 1000);

            return true;
        } catch (error) {
            console.error('❌ 重置进度时发生错误:', error);
            if (this.showNotification) {
                this.showNotification('重置进度时发生错误', 'error');
            } else {
                this.showNotification('重置进度时发生错误: ' + error.message, 'error');
            }
            return false;
        }
    }

    /**
     * 处理全局动作
     */
    handleGlobalAction(action, event) {
        console.log('🎯 处理全局动作:', action);
        
        switch (action) {
            case 'retry-ai':
                this.retryAIInitialization();
                break;
            case 'restart-writing':
                this.restartWriting();
                break;
            case 'back-to-config':
                this.backToWritingConfig();
                break;
            case 'show-exam-selection':
                this.showExamSelection();
                break;
            default:
                console.warn('未知的动作:', action);
        }
    }

    // ===== 状态管理方法 =====

    /**
     * 检查并恢复从个人中心返回的状态
     */
    checkAndRestoreState() {
        try {
            const previousPageState = sessionStorage.getItem('previousPageState');
            
            if (previousPageState) {
                const state = JSON.parse(previousPageState);
                
                // 检查状态是否过期（超过1小时）
                const now = Date.now();
                if (now - state.timestamp < 60 * 60 * 1000) {
                    console.log('恢复从个人中心返回的状态:', state);
                    
                    // 恢复当前页面
                    if (state.currentPage) {
                        this.currentPage = state.currentPage;
                    }
                    
                    // 恢复当前考试类型
                    if (state.currentExam) {
                        this.currentExam = state.currentExam;
                    }
                    
                    // 清除已使用的状态
                    sessionStorage.removeItem('previousPageState');
                    
                    console.log('✅ 状态恢复完成');
                } else {
                    // 状态过期，清除
                    sessionStorage.removeItem('previousPageState');
                    console.log('状态已过期，已清除');
                }
            }
        } catch (error) {
            console.error('恢复状态失败:', error);
            // 清除可能损坏的状态数据
            sessionStorage.removeItem('previousPageState');
        }
    }

    // ===== 页面加载方法 =====

    /**
     * 显示个人中心页面
     */
    showProfilePage() {
        // 检查登录状态
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        
        if (!token || !username) {
            // 未登录，显示登录提示
            this.showNotification('请先登录才能访问个人中心', 'warning');
            
            // 触发登录模态框
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.click();
            }
            return;
        }
        
        // 已登录，在当前窗口打开个人中心页面
        // 保存当前页面状态，以便返回时恢复
        sessionStorage.setItem('previousPage', window.location.href);
        sessionStorage.setItem('previousPageState', JSON.stringify({
            currentPage: this.currentPage,
            currentExam: this.currentExam,
            timestamp: Date.now()
        }));
        
        // 跳转到个人中心页面
        window.location.href = '/src/html/profile.html';
    }

    loadHomePage() {
        console.log('加载首页');
        this.updateProgressDisplay();
        
        // 加载AI推荐
        if (this.aiRecommendationManager) {
            this.loadAIRecommendations();
        }
        
        // 更新游戏化显示
        if (this.gamificationManager) {
            const playerSummary = this.gamificationManager.getPlayerSummary();
            this.updateGamificationDisplay(playerSummary);
        } else {
            // 如果游戏化管理器还没初始化，延迟更新
            setTimeout(() => {
                if (this.gamificationManager) {
                    const playerSummary = this.gamificationManager.getPlayerSummary();
                    this.updateGamificationDisplay(playerSummary);
                }
            }, 1000);
        }
    }

    loadVocabularyPage() {
        console.log('加载词汇学习页面');
        
        // 防止重复加载
        if (this._vocabularyPageLoading) {
            console.log('⚠️ 词汇页面正在加载中，跳过重复加载');
            return;
        }
        
        this._vocabularyPageLoading = true;
        
        // 绑定词汇学习模式卡片点击事件
        this.bindVocabularyModeEvents();
        
        // 显示当前用户的词汇学习统计
        this.updateVocabularyStats();
        
        this._vocabularyPageLoading = false;
    }

    /**
     * 加载词汇测试页面
     */
    loadVocabTestPage() {
        console.log('加载词汇测试页面');
        
        // 初始化词汇测试管理器
        if (typeof VocabularyTestManager !== 'undefined') {
            if (!window.vocabularyTestManager) {
                window.vocabularyTestManager = new VocabularyTestManager();
                console.log('✅ 词汇测试管理器已初始化');
            }
            
            // 更新测试历史显示
            if (window.vocabularyTestManager.updateTestHistoryDisplay) {
                window.vocabularyTestManager.updateTestHistoryDisplay();
            }
        } else {
            console.warn('⚠️ VocabularyTestManager 类未找到');
            this.showNotification('词汇测试功能加载失败', 'error');
        }
    }

    /**
     * 绑定词汇学习模式事件
     */
    bindVocabularyModeEvents() {
        // 只选择词汇学习页面中的模式卡片
        const vocabularyPage = document.getElementById('vocabulary');
        if (!vocabularyPage) return;
        
        const modeCards = vocabularyPage.querySelectorAll('.vocabulary-modes .mode-card[data-mode]');
        
        modeCards.forEach(card => {
            // 移除现有的事件监听器，防止重复绑定
            card.removeEventListener('click', this.handleVocabularyModeClick);
            card.addEventListener('click', this.handleVocabularyModeClick.bind(this));
        });
        
        console.log('✅ 词汇学习模式事件已绑定');
    }

    /**
     * 处理词汇学习模式点击
     */
    handleVocabularyModeClick(event) {
        const card = event.currentTarget;
        const mode = card.dataset.mode;
        
        // 检查是否已选择考试类型
        if (!this.isExamTypeSelected()) {
            this.showExamTypeSelectionPrompt('词汇学习');
            return;
        }
        
        // 移除其他卡片的选中状态
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
        
        // 添加当前卡片的选中状态
        card.classList.add('selected');
        
        window.logger?.info('选择词汇学习模式:', mode);
        
        switch (mode) {
            case 'learn':
                this.startVocabularyLearning();
                break;
            case 'review':
                this.startVocabularyReview();
                break;
            case 'game':
                this.startVocabularyGame();
                break;
            default:
                window.logger?.warn('未知的词汇学习模式:', mode);
        }
    }

    /**
     * 检查是否已选择考试类型
     */
    isExamTypeSelected() {
        return !!(this.currentExamType || this.settings?.examType);
    }

    /**
     * 显示考试类型选择提示
     */
    showExamTypeSelectionPrompt(featureName = '该功能') {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content exam-selection-prompt">
                <div class="modal-header">
                    <h3>📚 选择目标考试</h3>
                    <button class="close-btn" aria-label="关闭">&times;</button>
                </div>
                <div class="modal-body">
                    <p>使用 <strong>${featureName}</strong> 前，请先选择您的目标考试类型，以便为您提供最合适的学习内容。</p>
                    <div class="exam-type-grid">
                        <button class="exam-type-option" data-exam="cet4">
                            <div class="exam-icon">🎓</div>
                            <div class="exam-name">大学英语四级</div>
                            <div class="exam-desc">CET-4</div>
                        </button>
                        <button class="exam-type-option" data-exam="cet6">
                            <div class="exam-icon">🏆</div>
                            <div class="exam-name">大学英语六级</div>
                            <div class="exam-desc">CET-6</div>
                        </button>
                        <button class="exam-type-option" data-exam="postgraduate">
                            <div class="exam-icon">🎯</div>
                            <div class="exam-name">考研英语</div>
                            <div class="exam-desc">研究生入学考试</div>
                        </button>
                        <button class="exam-type-option" data-exam="ielts">
                            <div class="exam-icon">🌍</div>
                            <div class="exam-name">雅思考试</div>
                            <div class="exam-desc">IELTS</div>
                        </button>
                        <button class="exam-type-option" data-exam="toefl">
                            <div class="exam-icon">🇺🇸</div>
                            <div class="exam-name">托福考试</div>
                            <div class="exam-desc">TOEFL</div>
                        </button>
                        <button class="exam-type-option" data-exam="tem4">
                            <div class="exam-icon">📖</div>
                            <div class="exam-name">专业英语四级</div>
                            <div class="exam-desc">TEM-4</div>
                        </button>
                        <button class="exam-type-option" data-exam="tem8">
                            <div class="exam-icon">📚</div>
                            <div class="exam-name">专业英语八级</div>
                            <div class="exam-desc">TEM-8</div>
                        </button>
                        <button class="exam-type-option" data-exam="gre">
                            <div class="exam-icon">🎓</div>
                            <div class="exam-name">GRE考试</div>
                            <div class="exam-desc">研究生入学考试</div>
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelExamSelection">稍后选择</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('#cancelExamSelection');
        const examOptions = modal.querySelectorAll('.exam-type-option');
        
        const closeModal = () => {
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        examOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const examType = e.currentTarget.dataset.exam;
                this.selectExamType(examType);
                closeModal();
                
                // 显示成功消息并自动重试功能
                setTimeout(() => {
                    this.showNotification(`已选择考试类型，现在可以使用${featureName}了！`, 'success');
                }, 500);
            });
        });
        
        // 添加键盘支持
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // 聚焦第一个选项
        setTimeout(() => {
            const firstOption = modal.querySelector('.exam-type-option');
            if (firstOption) firstOption.focus();
        }, 100);
    }

    /**
     * 开始词汇学习
     */
    startVocabularyLearning() {
        this.showNotification('开始学习新词汇', 'success');
        
        if (!this.vocabularyManager) {
            this.showNotification('词汇学习系统正在初始化，请稍后再试', 'warning');
            return;
        }

        try {
            // 获取当前考试类型的推荐词汇
            const examType = this.currentExamType || 'cet4';
            const words = this.vocabularyManager.getRecommendedWords(examType, null, 20);
            
            if (words.length === 0) {
                this.showNotification('暂无新词汇需要学习', 'info');
                return;
            }

            // 开始学习会话
            const session = this.vocabularyManager.startLearningSession(words, 'learning');
            
            // 显示学习界面
            this.showVocabularyLearningInterface(session);
            
        } catch (error) {
            console.error('开始词汇学习失败:', error);
            this.showNotification('开始学习失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 开始词汇复习
     */
    startVocabularyReview() {
        this.showNotification('开始复习词汇', 'success');
        
        if (!this.vocabularyManager) {
            this.showNotification('词汇学习系统正在初始化，请稍后再试', 'warning');
            return;
        }

        try {
            // 获取需要复习的词汇
            const reviewWords = this.vocabularyManager.getReviewWords(15);
            
            if (reviewWords.length === 0) {
                this.showNotification('暂无词汇需要复习，可以学习新词汇', 'info');
                return;
            }

            // 开始复习会话
            const session = this.vocabularyManager.startLearningSession(reviewWords, 'review');
            
            // 显示复习界面
            this.showVocabularyLearningInterface(session);
            
        } catch (error) {
            console.error('开始词汇复习失败:', error);
            this.showNotification('开始复习失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 开始词汇游戏
     */
    startVocabularyGame() {
        console.log('🎮 开始词汇游戏');
        
        if (!this.vocabularyManager) {
            this.showNotification('词汇学习系统正在初始化，请稍后再试', 'warning');
            return;
        }

        try {
            // 生成词汇测试
            const examType = this.currentExamType || 'cet4';
            const testQuestions = this.vocabularyManager.generateVocabularyTest(examType, null, 10);
            
            if (testQuestions.length === 0) {
                this.showNotification('暂无词汇可用于游戏', 'warning');
                return;
            }

            // 显示游戏界面
            this.showVocabularyGameInterface(testQuestions);
            
        } catch (error) {
            console.error('开始词汇游戏失败:', error);
            this.showNotification('开始游戏失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 显示词汇学习界面
     */
    showVocabularyLearningInterface(session) {
        const currentWord = this.vocabularyManager.getCurrentWord();
        if (!currentWord) {
            this.showNotification('没有可学习的词汇', 'warning');
            return;
        }
        
        const learningContent = `
            <div class="vocabulary-learning-interface">
                <div class="learning-progress">
                    <div class="progress-text">
                        进度: ${session.currentIndex + 1}/${session.words.length}
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(session.currentIndex / session.words.length) * 100}%"></div>
                    </div>
                </div>
                
                <div class="current-word">
                    <div class="word-display">${currentWord.word}</div>
                    <div class="word-phonetic">${currentWord.phonetic || ''}</div>
                    <div class="word-category">${this.getCategoryName(currentWord.category)}</div>
                </div>
                
                <div class="word-meaning" style="display: none;">
                    <div class="meaning-text">${currentWord.meaning}</div>
                </div>
                
                <div class="learning-controls">
                    <button class="btn btn-primary" id="showMeaning">显示释义</button>
                    <button class="btn btn-success" id="knowWord" style="display: none;">认识</button>
                    <button class="btn btn-warning" id="dontKnowWord" style="display: none;">不认识</button>
                    <button class="btn btn-info" id="nextWord" style="display: none;">下一个</button>
                </div>
            </div>
        `;
        
        // 使用Modal.showContent显示模态框
        Modal.showContent(learningContent, {
            title: session.type === 'learning' ? '词汇学习' : '词汇复习',
            closable: false
        });
        
        // 延迟绑定事件，确保DOM已更新
        setTimeout(() => {
            this.bindLearningInterfaceEvents(session);
        }, 100);
    }

    /**
     * 显示词汇游戏界面
     */
    showVocabularyGameInterface(questions) {
        const gameContent = `
            <div class="vocabulary-game-interface">
                <div class="game-info">
                    <p>📝 测试你的词汇掌握程度</p>
                    <p>共 ${questions.length} 题</p>
                </div>
                <div class="game-controls">
                    <button class="btn btn-primary" id="startGame">开始游戏</button>
                </div>
            </div>
        `;
        
        // 使用Modal.showContent显示模态框
        Modal.showContent(gameContent, {
            title: '词汇游戏',
            closable: true
        });
        
        // 延迟绑定游戏开始事件
        setTimeout(() => {
            const modal = document.getElementById('modal');
            const startGameBtn = modal.querySelector('#startGame');
            if (startGameBtn) {
                startGameBtn.addEventListener('click', () => {
                    this.startVocabularyQuiz(questions);
                });
            }
        }, 100);
    }

    /**
     * 开始词汇测试
     */
    startVocabularyQuiz(questions) {
        console.log('🚀 开始词汇测试，共', questions.length, '题');
        
        // 初始化游戏状态
        this.gameState = {
            questions: questions,
            currentIndex: 0,
            score: 0,
            answers: [],
            startTime: Date.now(),
            timeLimit: 60000, // 60秒时间限制
            gameTimer: null
        };
        
        // 显示第一题
        this.showGameQuestion();
    }

    /**
     * 显示游戏题目
     */
    showGameQuestion() {
        const state = this.gameState;
        const question = state.questions[state.currentIndex];
        
        if (!question) {
            this.endVocabularyGame();
            return;
        }

        console.log(`🎯 显示第 ${state.currentIndex + 1} 题:`, question.word);

        // 生成选项（1个正确答案 + 3个干扰项）
        const options = this.generateGameOptions(question);
        
        const gameContent = `
            <div class="vocabulary-game-quiz">
                <!-- 游戏头部信息 -->
                <div class="game-header">
                    <div class="game-progress">
                        <div class="progress-info">
                            <span>题目 ${state.currentIndex + 1}/${state.questions.length}</span>
                            <span class="score">得分: ${state.score}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(state.currentIndex / state.questions.length) * 100}%"></div>
                        </div>
                    </div>
                    <div class="game-timer">
                        <span class="timer-icon">⏱️</span>
                        <span class="timer-text" id="gameTimer">60s</span>
                    </div>
                </div>

                <!-- 题目内容 -->
                <div class="question-content">
                    <div class="question-word">${question.word}</div>
                    <div class="question-phonetic">${question.phonetic || ''}</div>
                    <div class="question-prompt">选择正确的中文意思：</div>
                </div>

                <!-- 答案选项 -->
                <div class="game-options">
                    ${options.map((option, index) => `
                        <button class="game-option" data-index="${index}" data-answer="${option}">
                            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                            <span class="option-text">${option}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- 提示信息 -->
                <div class="game-hint">
                    <p>💡 仔细想想，选择最合适的答案</p>
                </div>
            </div>
        `;

        // 显示题目
        Modal.showContent(gameContent, {
            title: `词汇游戏 (${state.currentIndex + 1}/${state.questions.length})`,
            closable: false
        });

        // 绑定选项点击事件
        this.bindGameEvents(question, options);
        
        // 开始倒计时
        this.startGameTimer();
    }

    /**
     * 生成游戏选项
     */
    generateGameOptions(question) {
        const correctAnswer = question.meaning;
        const options = [correctAnswer];
        
        try {
            // 从词汇库中随机选择错误答案
            const examType = this.currentExamType || 'cet4';
            const randomWords = this.vocabularyManager.getRecommendedWords(examType, null, 50);
            const wrongAnswers = [];
            
            for (const word of randomWords) {
                if (word.meaning !== correctAnswer && 
                    !options.includes(word.meaning) && 
                    wrongAnswers.length < 3) {
                    wrongAnswers.push(word.meaning);
                }
            }
            
            // 添加错误答案
            options.push(...wrongAnswers);
            
            // 如果选项不够4个，补充一些常见的错误选项
            while (options.length < 4) {
                const commonMeanings = ['学习', '工作', '生活', '学生', '老师', '朋友', '家庭', '学校', '时间', '地方', '国家', '城市', '问题', '方法', '结果', '原因', '机会', '经验', '能力', '责任'];
                for (const meaning of commonMeanings) {
                    if (!options.includes(meaning)) {
                        options.push(meaning);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('生成选项时出错:', error);
            // 使用备用选项
            while (options.length < 4) {
                const backupMeanings = ['测试', '练习', '复习', '考试', '词汇', '语法', '阅读', '听力', '写作', '翻译'];
                for (const meaning of backupMeanings) {
                    if (!options.includes(meaning)) {
                        options.push(meaning);
                        break;
                    }
                }
            }
        }
        
        // 打乱选项顺序
        return this.shuffleArray(options.slice(0, 4));
    }

    /**
     * 打乱数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        // 使用基于数组内容的确定性洗牌
        const seed = this.generateArraySeed(array);
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = (seed + i) % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 基于数组内容生成种子
     */
    generateArraySeed(array) {
        let seed = 0;
        for (let i = 0; i < Math.min(array.length, 10); i++) {
            const item = array[i];
            if (typeof item === 'string') {
                seed += item.charCodeAt(0) || 0;
            } else if (typeof item === 'object' && item.word) {
                seed += item.word.charCodeAt(0) || 0;
            } else if (typeof item === 'number') {
                seed += item;
            }
        }
        return seed % 1000;
    }

    /**
     * 绑定游戏事件
     */
    bindGameEvents(question, options) {
        setTimeout(() => {
            const modal = document.getElementById('modal');
            const optionButtons = modal.querySelectorAll('.game-option');
            
            optionButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const selectedAnswer = e.currentTarget.dataset.answer;
                    this.handleGameAnswer(question, selectedAnswer, options);
                });
            });
        }, 100);
    }

    /**
     * 处理游戏答案
     */
    handleGameAnswer(question, selectedAnswer, options) {
        const isCorrect = selectedAnswer === question.meaning;
        const state = this.gameState;
        
        // 停止计时器
        if (state.gameTimer) {
            clearInterval(state.gameTimer);
            state.gameTimer = null;
        }
        
        // 记录答案
        state.answers.push({
            question: question,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.meaning,
            isCorrect: isCorrect,
            timeSpent: Date.now() - state.startTime
        });
        
        // 更新分数
        if (isCorrect) {
            state.score += 10; // 每题10分
        }
        
        console.log(`${isCorrect ? '✅' : '❌'} 答案：${selectedAnswer}，正确答案：${question.meaning}`);
        
        // 显示答案反馈
        this.showAnswerFeedback(question, selectedAnswer, isCorrect, () => {
            // 下一题
            state.currentIndex++;
            if (state.currentIndex < state.questions.length) {
                setTimeout(() => {
                    this.showGameQuestion();
                }, 1000);
            } else {
                setTimeout(() => {
                    this.endVocabularyGame();
                }, 1000);
            }
        });
    }

    /**
     * 显示答案反馈
     */
    showAnswerFeedback(question, selectedAnswer, isCorrect, callback) {
        const modal = document.getElementById('modal');
        const options = modal.querySelectorAll('.game-option');
        
        options.forEach(option => {
            const answer = option.dataset.answer;
            option.disabled = true;
            
            if (answer === selectedAnswer) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            
            if (answer === question.meaning && !isCorrect) {
                option.classList.add('correct');
            }
        });
        
        // 显示反馈信息
        const hintDiv = modal.querySelector('.game-hint');
        hintDiv.innerHTML = `
            <div class="answer-feedback">
                ${isCorrect ? 
                    '<p class="feedback-correct">🎉 回答正确！</p>' : 
                    `<p class="feedback-incorrect">❌ 回答错误</p>
                     <p class="correct-answer">正确答案是：${question.meaning}</p>`
                }
            </div>
        `;
        
        setTimeout(callback, 1500);
    }

    /**
     * 开始游戏计时器
     */
    startGameTimer() {
        const state = this.gameState;
        let timeLeft = 60;
        
        state.gameTimer = setInterval(() => {
            timeLeft--;
            
            const timerElement = document.getElementById('gameTimer');
            if (timerElement) {
                timerElement.textContent = `${timeLeft}s`;
                
                if (timeLeft <= 10) {
                    timerElement.style.color = '#e74c3c';
                }
            }
            
            if (timeLeft <= 0) {
                clearInterval(state.gameTimer);
                this.handleGameAnswer(state.questions[state.currentIndex], '', []);
            }
        }, 1000);
    }

    /**
     * 结束词汇游戏
     */
    endVocabularyGame() {
        const state = this.gameState;
        const totalQuestions = state.questions.length;
        const correctAnswers = state.answers.filter(a => a.isCorrect).length;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        const totalTime = Date.now() - state.startTime;
        
        console.log('🏁 游戏结束！得分：', state.score, '正确率：', accuracy + '%');
        
        // 清理计时器
        if (state.gameTimer) {
            clearInterval(state.gameTimer);
        }
        
        // 显示游戏结果
        const resultContent = `
            <div class="game-result">
                <div class="result-header">
                    <div class="result-icon">${accuracy >= 80 ? '🏆' : accuracy >= 60 ? '🥈' : '💪'}</div>
                    <h2 class="result-title">游戏完成！</h2>
                    <div class="result-score">${state.score} 分</div>
                </div>
                
                <div class="result-stats">
                    <div class="stat-item">
                        <div class="stat-value">${correctAnswers}</div>
                        <div class="stat-label">答对题数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${totalQuestions - correctAnswers}</div>
                        <div class="stat-label">答错题数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${accuracy}%</div>
                        <div class="stat-label">正确率</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.round(totalTime/1000)}s</div>
                        <div class="stat-label">用时</div>
                    </div>
                </div>
                
                <div class="result-message">
                    <p>${this.getGameResultMessage(accuracy)}</p>
                </div>
                
                <div class="result-actions">
                    <button class="btn btn-primary" id="playAgain">再玩一次</button>
                    <button class="btn btn-outline-secondary" id="backToMenu">返回菜单</button>
                </div>
            </div>
        `;
        
        Modal.showContent(resultContent, {
            title: '游戏结果',
            closable: true
        });
        
        // 绑定结果页面事件
        setTimeout(() => {
            const modal = document.getElementById('modal');
            const playAgainBtn = modal.querySelector('#playAgain');
            const backToMenuBtn = modal.querySelector('#backToMenu');
            
            if (playAgainBtn) {
                playAgainBtn.addEventListener('click', () => {
                    Modal.hide();
                    this.startVocabularyGame();
                });
            }
            
            if (backToMenuBtn) {
                backToMenuBtn.addEventListener('click', () => {
                    Modal.hide();
                });
            }
        }, 100);
        
        // 保存游戏结果
        this.saveGameResult(state);
    }

    /**
     * 获取游戏结果消息
     */
    getGameResultMessage(accuracy) {
        if (accuracy >= 90) {
            return '🌟 优秀！你的词汇掌握得非常好！';
        } else if (accuracy >= 80) {
            return '👍 很好！继续保持这个水准！';
        } else if (accuracy >= 60) {
            return '💪 还不错！多练习会更好！';
        } else {
            return '📚 加油！多学习词汇会有进步的！';
        }
    }

    /**
     * 保存游戏结果
     */
    saveGameResult(gameState) {
        try {
            // 获取历史记录
            const gameHistory = JSON.parse(localStorage.getItem('vocabularyGameHistory') || '[]');
            
            // 添加本次记录
            const gameRecord = {
                date: new Date().toISOString(),
                score: gameState.score,
                totalQuestions: gameState.questions.length,
                correctAnswers: gameState.answers.filter(a => a.isCorrect).length,
                accuracy: Math.round((gameState.answers.filter(a => a.isCorrect).length / gameState.questions.length) * 100),
                totalTime: Date.now() - gameState.startTime,
                examType: this.currentExamType || 'cet4'
            };
            
            gameHistory.unshift(gameRecord);
            
            // 只保留最近50次记录
            if (gameHistory.length > 50) {
                gameHistory.splice(50);
            }
            
            localStorage.setItem('vocabularyGameHistory', JSON.stringify(gameHistory));
            console.log('💾 游戏记录已保存');
            
        } catch (error) {
            console.error('保存游戏记录失败:', error);
        }
    }

    /**
     * 绑定学习界面事件
     */
    bindLearningInterfaceEvents(session) {
        const modal = document.getElementById('modal');
        const showMeaningBtn = modal.querySelector('#showMeaning');
        const knowBtn = modal.querySelector('#knowWord');
        const dontKnowBtn = modal.querySelector('#dontKnowWord');
        const nextBtn = modal.querySelector('#nextWord');
        const meaningDiv = modal.querySelector('.word-meaning');
        
        let startTime = Date.now();
        
        showMeaningBtn.addEventListener('click', () => {
            meaningDiv.style.display = 'block';
            showMeaningBtn.style.display = 'none';
            knowBtn.style.display = 'inline-block';
            dontKnowBtn.style.display = 'inline-block';
        });
        
        knowBtn.addEventListener('click', () => {
            const timeSpent = Date.now() - startTime;
            const currentWord = this.vocabularyManager.getCurrentWord();
            
            this.vocabularyManager.recordLearningResult(currentWord, true, timeSpent, 1);
            this.showNextWordOrFinish(session);
        });
        
        dontKnowBtn.addEventListener('click', () => {
            const timeSpent = Date.now() - startTime;
            const currentWord = this.vocabularyManager.getCurrentWord();
            
            this.vocabularyManager.recordLearningResult(currentWord, false, timeSpent, 1);
            this.showNextWordOrFinish(session);
        });
    }

    /**
     * 显示下一个词或完成学习
     */
    showNextWordOrFinish(session) {
        const nextWord = this.vocabularyManager.getCurrentWord();
        
        if (nextWord) {
            // 还有下一个词，更新界面
            this.showVocabularyLearningInterface(session);
        } else {
            // 完成学习
            const result = this.vocabularyManager.finishLearningSession();
            this.showLearningResult(result);
        }
    }

    /**
     * 显示学习结果
     */
    showLearningResult(result) {
        const { session, stats } = result;
        
        const resultContent = `
            <div class="learning-result">
                <div class="result-title">
                    <h3>🎉 学习完成！</h3>
                </div>
                <div class="result-stats">
                    <div class="stat-item">
                        <div class="stat-label">学习词汇</div>
                        <div class="stat-value">${stats.totalWords}个</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">正确率</div>
                        <div class="stat-value">${stats.accuracy}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">总用时</div>
                        <div class="stat-value">${Math.round(stats.sessionDuration / 1000)}秒</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">平均用时</div>
                        <div class="stat-value">${Math.round(stats.averageTime / 1000)}秒/词</div>
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" id="finishLearning">完成</button>
                    <button class="btn btn-secondary" id="continueStudy">继续学习</button>
                </div>
            </div>
        `;
        
        // 使用Modal.showContent显示结果
        Modal.showContent(resultContent, {
            title: '学习结果',
            closable: true
        });
        
        // 延迟绑定事件
        setTimeout(() => {
            const modal = document.getElementById('modal');
            
            const finishBtn = modal.querySelector('#finishLearning');
            if (finishBtn) {
                finishBtn.addEventListener('click', () => {
                    Modal.hide();
                });
            }
            
            const continueBtn = modal.querySelector('#continueStudy');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    Modal.hide();
                    this.startVocabularyLearning();
                });
            }
        }, 100);
        
        // 更新统计显示
        this.updateVocabularyStats();
    }

    /**
     * 更新词汇统计显示
     */
    updateVocabularyStats() {
        if (!this.vocabularyManager) return;
        
        const stats = this.vocabularyManager.getLearningStats();
        
        // 更新底部统计信息
        this.updateProgressDisplay();
        
        console.log('📊 词汇学习统计:', stats);
    }

    /**
     * 获取词性名称
     */
    getCategoryName(category) {
        const categoryNames = {
            'noun': '名词',
            'verb': '动词',
            'adjective': '形容词',
            'adverb': '副词',
            'preposition': '介词',
            'conjunction': '连词',
            'pronoun': '代词',
            'interjection': '感叹词'
        };
        return categoryNames[category] || category;
    }

    loadGrammarPage() {
        console.log('加载语法练习页面');
        
        // 防止重复加载
        if (this._grammarPageLoading) {
            console.log('⚠️ 语法页面正在加载中，跳过重复加载');
            return;
        }
        
        this._grammarPageLoading = true;
        
        // 延迟绑定事件，确保DOM已经渲染完成
        setTimeout(() => {
            this.bindGrammarEvents();
            this.updateGrammarProgress();
            this._grammarPageLoading = false;
        }, 100);
    }

    /**
     * 绑定语法练习事件
     */
    bindGrammarEvents() {
        // 只在语法练习页面绑定事件
        const grammarPage = document.getElementById('grammar');
        if (!grammarPage) return;

        // 类别选择事件
        const categoryCards = grammarPage.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.removeEventListener('click', this.handleCategorySelect);
            card.addEventListener('click', this.handleCategorySelect.bind(this));
        });

        // 模式选择事件 - 只选择语法页面中的模式卡片
        const modeCards = grammarPage.querySelectorAll('.practice-modes .mode-card');
        modeCards.forEach(card => {
            card.removeEventListener('click', this.handleModeSelect);
            card.addEventListener('click', this.handleModeSelect.bind(this));
        });

        // 开始练习按钮
        const startBtn = document.getElementById('startGrammarPractice');
        if (startBtn) {
            startBtn.removeEventListener('click', this.startGrammarPractice);
            startBtn.addEventListener('click', this.startGrammarPractice.bind(this));
        }

        // 重置进度按钮
        const resetBtn = document.getElementById('resetGrammarProgress');
        if (resetBtn) {
            resetBtn.removeEventListener('click', this.resetGrammarProgress);
            resetBtn.addEventListener('click', this.resetGrammarProgress.bind(this));
        }

        console.log('✅ 语法练习事件已绑定');
    }

    /**
     * 处理类别选择
     */
    handleCategorySelect(event) {
        const card = event.currentTarget;
        const category = card.dataset.category;

        // 更新选中状态
        document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // 保存选择
        if (this.grammarManager) {
            this.grammarManager.setCurrentCategory(category);
        }

        console.log('📝 选择语法类别:', category);
        this.showNotification(`已选择：${this.getGrammarCategoryName(category)}`, 'info');
    }

    /**
     * 处理模式选择
     */
    handleModeSelect(event) {
        const card = event.currentTarget;
        const mode = card.dataset.mode;

        // 更新选中状态
        document.querySelectorAll('.practice-modes .mode-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // 保存选择
        if (this.grammarManager) {
            this.grammarManager.setCurrentMode(mode);
        }

        console.log('📝 选择练习模式:', mode);
        this.showNotification(`已选择：${this.getGrammarModeName(mode)}`, 'info');
    }

    /**
     * 开始语法练习
     */
    startGrammarPractice() {
        if (!this.grammarManager) {
            this.showNotification('语法练习系统正在初始化，请稍后再试', 'warning');
            return;
        }

        try {
            // 获取难度选择
            const difficultyInput = document.querySelector('input[name="difficulty"]:checked');
            const difficulty = difficultyInput ? difficultyInput.value : 'basic';
            
            this.grammarManager.setCurrentDifficulty(difficulty);

            // 检查是否选择了类别
            if (!this.grammarManager.currentCategory) {
                this.showNotification('请先选择一个语法知识点', 'warning');
                return;
            }

            // 开始练习会话
            const session = this.grammarManager.startPractice();
            
            this.showNotification('开始语法练习', 'success');
            
            // 显示练习界面
            this.showGrammarPracticeInterface(session);

        } catch (error) {
            console.error('开始语法练习失败:', error);
            this.showNotification(error.message || '开始练习失败，请重试', 'error');
        }
    }

    /**
     * 显示语法练习界面
     */
    showGrammarPracticeInterface(session) {
        const currentQuestion = this.grammarManager.getCurrentQuestion();
        if (!currentQuestion) {
            this.showNotification('没有可用的题目', 'warning');
            return;
        }

        const practiceContent = this.generateQuestionHTML(currentQuestion, session);
        
        Modal.showContent(practiceContent, {
            title: `语法练习 - ${this.getGrammarCategoryName(session.category)}`,
            closable: false
        });

        // 延迟绑定事件
        setTimeout(() => {
            this.bindPracticeInterfaceEvents(session);
        }, 100);
    }

    /**
     * 生成题目HTML
     */
    generateQuestionHTML(question, session) {
        const progressPercent = Math.round((session.currentIndex / session.questions.length) * 100);
        
        let optionsHTML = '';
        if (question.type === 'multiple_choice') {
            optionsHTML = question.options.map((option, index) => `
                <label class="option-label">
                    <input type="radio" name="answer" value="${index}">
                    <span class="option-text">${option}</span>
                </label>
            `).join('');
        } else if (question.type === 'fill_blank') {
            optionsHTML = `
                <div class="fill-blank-input">
                    <input type="text" id="blankAnswer" class="form-control" placeholder="请输入答案">
                </div>
            `;
        }

        return `
            <div class="grammar-practice-interface">
                <div class="practice-progress">
                    <div class="progress-info">
                        <span>题目 ${session.currentIndex + 1} / ${session.questions.length}</span>
                        <span>难度: ${this.getGrammarDifficultyName(question.difficulty)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                </div>

                <div class="question-content">
                    <div class="question-type">${this.getGrammarQuestionTypeName(question.type)}</div>
                    <div class="question-text">${question.question}</div>
                </div>

                <div class="answer-options">
                    ${optionsHTML}
                </div>

                <div class="practice-controls">
                    <button class="btn btn-primary" id="submitAnswer">提交答案</button>
                </div>
            </div>
        `;
    }

    /**
     * 绑定练习界面事件
     */
    bindPracticeInterfaceEvents(session) {
        const modal = document.getElementById('modal');
        const submitBtn = modal.querySelector('#submitAnswer');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.handleAnswerSubmit(session);
            });
        }
    }

    /**
     * 处理答案提交
     */
    handleAnswerSubmit(session) {
        const modal = document.getElementById('modal');
        let userAnswer;

        const currentQuestion = this.grammarManager.getCurrentQuestion();
        
        if (currentQuestion.type === 'multiple_choice') {
            const selectedOption = modal.querySelector('input[name="answer"]:checked');
            if (!selectedOption) {
                this.showNotification('请选择一个答案', 'warning');
                return;
            }
            userAnswer = parseInt(selectedOption.value);
        } else if (currentQuestion.type === 'fill_blank') {
            const inputElement = modal.querySelector('#blankAnswer');
            userAnswer = inputElement ? inputElement.value.trim() : '';
            if (!userAnswer) {
                this.showNotification('请输入答案', 'warning');
                return;
            }
        }

        try {
            const result = this.grammarManager.submitAnswer(userAnswer);
            this.showGrammarAnswerFeedback(result, session);
        } catch (error) {
            console.error('提交答案失败:', error);
            this.showNotification('提交失败，请重试', 'error');
        }
    }

    /**
     * 显示答案反馈
     */
    showGrammarAnswerFeedback(result, session) {
        const modal = document.getElementById('modal');
        const { isCorrect, explanation, correctAnswer } = result;
        
        // 显示反馈
        const feedbackHTML = `
            <div class="answer-feedback ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="feedback-header">
                    <span class="feedback-icon">${isCorrect ? '✅' : '❌'}</span>
                    <span class="feedback-text">${isCorrect ? '回答正确！' : '回答错误'}</span>
                </div>
                ${!isCorrect ? `<div class="correct-answer">正确答案：${correctAnswer}</div>` : ''}
                <div class="explanation">${explanation}</div>
                <div class="feedback-actions">
                    <button class="btn btn-primary" id="nextQuestion">下一题</button>
                </div>
            </div>
        `;

        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = feedbackHTML;

        // 绑定下一题事件
        setTimeout(() => {
            const nextBtn = modal.querySelector('#nextQuestion');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.showNextGrammarQuestion(session);
                });
            }
        }, 100);
    }

    /**
     * 显示下一题或完成练习
     */
    showNextGrammarQuestion(session) {
        const nextQuestion = this.grammarManager.getCurrentQuestion();
        
        if (nextQuestion) {
            // 还有下一题
            const practiceContent = this.generateQuestionHTML(nextQuestion, session);
            const modal = document.getElementById('modal');
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = practiceContent;
            
            setTimeout(() => {
                this.bindPracticeInterfaceEvents(session);
            }, 100);
        } else {
            // 完成练习
            const result = this.grammarManager.finishPractice();
            this.showGrammarPracticeResult(result);
        }
    }

    /**
     * 显示练习结果
     */
    showGrammarPracticeResult(result) {
        const { session, stats } = result;
        
        const resultContent = `
            <div class="practice-result">
                <div class="result-header">
                    <h3>🎉 练习完成！</h3>
                    <div class="overall-score ${stats.accuracy >= 80 ? 'excellent' : stats.accuracy >= 60 ? 'good' : 'needs-improvement'}">
                        ${stats.accuracy}%
                    </div>
                </div>
                
                <div class="result-stats">
                    <div class="stat-item">
                        <div class="stat-label">答题总数</div>
                        <div class="stat-value">${stats.totalQuestions}题</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">正确数量</div>
                        <div class="stat-value">${stats.correctCount}题</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">正确率</div>
                        <div class="stat-value">${stats.accuracy}%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">用时</div>
                        <div class="stat-value">${Math.round(stats.duration / 1000)}秒</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">获得经验</div>
                        <div class="stat-value">+${stats.xpEarned} XP</div>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary" id="finishPractice">完成</button>
                    <button class="btn btn-secondary" id="practiceAgain">再次练习</button>
                </div>
            </div>
        `;

        Modal.showContent(resultContent, {
            title: '练习结果',
            closable: true
        });

        // 绑定结果页面事件
        setTimeout(() => {
            const modal = document.getElementById('modal');
            
            const finishBtn = modal.querySelector('#finishPractice');
            if (finishBtn) {
                finishBtn.addEventListener('click', () => {
                    Modal.hide();
                    this.updateGrammarProgress();
                });
            }
            
            const againBtn = modal.querySelector('#practiceAgain');
            if (againBtn) {
                againBtn.addEventListener('click', () => {
                    Modal.hide();
                    setTimeout(() => {
                        this.startGrammarPractice();
                    }, 300);
                });
            }
        }, 100);
    }

    /**
     * 更新语法进度显示
     */
    updateGrammarProgress() {
        if (!this.grammarManager) {
            console.log('⚠️ grammarManager未初始化，跳过进度更新');
            return;
        }

        try {
            const stats = this.grammarManager.getStats();
            console.log('📊 获取到语法统计:', stats);
            
            if (!stats || !stats.categoryProgress) {
                console.log('⚠️ 语法统计数据不完整，跳过更新');
                return;
            }

            const progressCategories = document.querySelectorAll('.progress-category');
            
            progressCategories.forEach((element, index) => {
                const categories = ['tenses', 'clauses', 'prepositions'];
                const category = categories[index];
                
                if (category && stats.categoryProgress[category]) {
                    const progress = stats.categoryProgress[category];
                    const progressBar = element.querySelector('.progress-fill');
                    const progressText = element.querySelector('.progress-text');
                    
                    // 添加更严格的数据检查
                    if (progressBar && progressText && 
                        progress && 
                        typeof progress.completed === 'number' && 
                        typeof progress.total === 'number' &&
                        progress.total > 0) {
                        
                        const percentage = Math.round((progress.completed / progress.total) * 100);
                        progressBar.style.width = `${percentage}%`;
                        progressText.textContent = `${percentage}% (${progress.completed}/${progress.total})`;
                    } else {
                        // 如果数据不完整，显示默认值
                        if (progressBar) progressBar.style.width = '0%';
                        if (progressText) progressText.textContent = '0% (0/0)';
                    }
                }
            });

            console.log('📊 语法学习进度已更新');
        } catch (error) {
            console.error('❌ 更新语法进度时出错:', error);
            // 不抛出错误，避免影响其他功能
        }
    }

    /**
     * 获取语法类别名称
     */
    getGrammarCategoryName(category) {
        const categoryNames = {
            'tenses': '时态语态',
            'clauses': '从句结构',
            'prepositions': '介词用法',
            'articles': '冠词用法',
            'modals': '情态动词',
            'conditionals': '条件句'
        };
        return categoryNames[category] || category;
    }

    /**
     * 获取语法模式名称
     */
    getGrammarModeName(mode) {
        const modeNames = {
            'quick': '快速练习',
            'comprehensive': '综合练习',
            'exam': '考试模拟'
        };
        return modeNames[mode] || mode;
    }

    /**
     * 获取语法难度名称
     */
    getGrammarDifficultyName(difficulty) {
        const difficultyNames = {
            'basic': '基础',
            'intermediate': '中级',
            'advanced': '高级'
        };
        return difficultyNames[difficulty] || difficulty;
    }

    /**
     * 获取语法题型名称
     */
    getGrammarQuestionTypeName(type) {
        const typeNames = {
            'multiple_choice': '选择题',
            'fill_blank': '填空题'
        };
        return typeNames[type] || type;
    }

    /**
     * 重置语法学习进度
     */
    async resetGrammarProgress() {
        if (!this.grammarManager) {
            this.showNotification('语法练习系统未初始化', 'error');
            return;
        }

        // 显示确认对话框
        const confirmed = await Modal.confirm(
            '确定要重置所有语法学习进度吗？此操作不可撤销。',
            {
                title: '确认重置',
                confirmText: '确定重置',
                cancelText: '取消'
            }
        );

        if (!confirmed) {
            return;
        }

        try {
            // 调用语法管理器的重置方法
            await this.grammarManager.resetProgress();
            
            // 更新进度显示
            this.updateGrammarProgress();
            
            // 显示成功消息
            this.showNotification('语法学习进度已成功重置', 'success');
            
            console.log('✅ 语法学习进度已重置');
        } catch (error) {
            console.error('重置语法进度失败:', error);
            this.showNotification('重置进度失败，请重试', 'error');
        }
    }

    loadListeningPage() {
        console.log('加载听力训练页面');
        
        // 防止重复加载
        if (this._listeningPageLoading) {
            console.log('⚠️ 听力页面正在加载中，跳过重复加载');
            return;
        }
        
        this._listeningPageLoading = true;
        
        // 延迟绑定事件，确保DOM已经渲染完成
        setTimeout(() => {
            this.bindListeningEvents();
            this.updateListeningProgress();
            this._listeningPageLoading = false;
        }, 100);
    }

    /**
     * 绑定听力训练事件
     */
    bindListeningEvents() {
        // 听力类型选择事件
        const categoryCards = document.querySelectorAll('.listening-categories .category-card');
        console.log('🎧 找到听力类型卡片:', categoryCards.length);
        categoryCards.forEach(card => {
            card.removeEventListener('click', this.handleListeningCategorySelect);
            card.addEventListener('click', this.handleListeningCategorySelect.bind(this));
        });

        // 听力技能选择事件
        const skillCards = document.querySelectorAll('.skill-card');
        console.log('🎯 找到听力技能卡片:', skillCards.length);
        skillCards.forEach(card => {
            card.removeEventListener('click', this.handleListeningSkillSelect);
            card.addEventListener('click', this.handleListeningSkillSelect.bind(this));
        });

        // 开始练习按钮
        const startBtn = document.getElementById('startListeningPractice');
        console.log('🚀 找到开始练习按钮:', startBtn ? '是' : '否');
        if (startBtn) {
            startBtn.removeEventListener('click', this.startListeningPractice);
            startBtn.addEventListener('click', this.startListeningPractice.bind(this));
        }

        // 重置进度按钮
        const resetBtn = document.getElementById('resetListeningProgress');
        if (resetBtn) {
            resetBtn.removeEventListener('click', this.resetListeningProgress);
            resetBtn.addEventListener('click', this.resetListeningProgress.bind(this));
        }

        console.log('✅ 听力训练事件已绑定');
    }

    /**
     * 处理听力类型选择
     */
    handleListeningCategorySelect(event) {
        console.log('🎧 听力类型卡片被点击');
        const card = event.currentTarget;
        const category = card.dataset.category;
        console.log('🎧 选择的类型:', category);

        // 更新选中状态
        document.querySelectorAll('.listening-categories .category-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // 保存选择
        if (this.listeningManager) {
            this.listeningManager.setCurrentCategory(category);
            console.log('🎧 已保存到listeningManager');
        } else {
            console.log('❌ listeningManager未初始化');
        }

        console.log('🎧 选择听力类型:', category);
        this.showNotification(`已选择：${this.getListeningCategoryName(category)}`, 'info');
    }

    /**
     * 处理听力技能选择
     */
    handleListeningSkillSelect(event) {
        console.log('🎯 听力技能卡片被点击');
        const card = event.currentTarget;
        const skill = card.dataset.skill;
        console.log('🎯 选择的技能:', skill);

        // 更新选中状态
        document.querySelectorAll('.skill-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        // 保存选择
        if (this.listeningManager) {
            this.listeningManager.setCurrentSkill(skill);
            console.log('🎯 已保存到listeningManager');
        } else {
            console.log('❌ listeningManager未初始化');
        }

        console.log('🎯 选择听力技能:', skill);
        this.showNotification(`已选择技能：${this.getListeningSkillName(skill)}`, 'info');
    }

    /**
     * 开始听力练习
     */
    startListeningPractice() {
        if (!this.listeningManager) {
            this.showNotification('听力训练系统正在初始化，请稍后再试', 'warning');
            return;
        }

        try {
            // 获取设置选项
            const speedInput = document.querySelector('input[name="speed"]:checked');
            const repeatInput = document.querySelector('input[name="repeat"]:checked');
            const difficultyInput = document.querySelector('input[name="listening-difficulty"]:checked');

            const speed = speedInput ? parseFloat(speedInput.value) : 1.0;
            const repeat = repeatInput ? parseInt(repeatInput.value) : 1;
            const difficulty = difficultyInput ? difficultyInput.value : 'basic';

            this.listeningManager.setPlaybackSpeed(speed);
            this.listeningManager.setRepeatCount(repeat);
            this.listeningManager.setCurrentDifficulty(difficulty);

            // 检查是否选择了类型
            if (!this.listeningManager.currentCategory) {
                this.showNotification('请先选择一个听力类型', 'warning');
                return;
            }

            // 开始练习会话
            const session = this.listeningManager.startPractice();
            
            this.showNotification('开始听力练习', 'success');
            
            // 显示练习界面
            this.showListeningPracticeInterface(session);

        } catch (error) {
            console.error('开始听力练习失败:', error);
            this.showNotification(error.message || '开始练习失败，请重试', 'error');
        }
    }

    /**
     * 显示听力练习界面
     */
    async showListeningPracticeInterface(session) {
        const currentContent = this.listeningManager.getCurrentContent();
        if (!currentContent) {
            this.showNotification('没有可用的听力内容', 'warning');
            return;
        }

        // 加载音频
        try {
            await this.listeningManager.loadAudio(currentContent);
        } catch (error) {
            console.error('加载音频失败:', error);
            this.showNotification('加载音频失败', 'error');
            return;
        }

        const practiceContent = `
            <div class="listening-practice-interface">
                <div class="practice-progress">
                    <div class="progress-info">
                        <span>内容 ${session.currentIndex + 1} / ${session.contents.length}</span>
                        <span>难度: ${this.getListeningDifficultyName(currentContent.difficulty)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.round((session.currentIndex / session.contents.length) * 100)}%"></div>
                    </div>
                </div>

                <div class="content-info">
                    <h4 class="content-title">${currentContent.title}</h4>
                    <div class="content-meta">
                        <span class="content-duration">时长: ${Math.floor(currentContent.duration / 60)}:${(currentContent.duration % 60).toString().padStart(2, '0')}</span>
                        <span class="content-category">${this.getListeningCategoryName(currentContent.category)}</span>
                    </div>
                </div>

                <div class="audio-player">
                    <div class="audio-controls">
                        <button class="btn btn-primary" id="playAudioBtn">
                            <span class="icon">▶️</span>
                            播放音频
                        </button>
                        <button class="btn btn-secondary" id="pauseAudioBtn" style="display: none;">
                            <span class="icon">⏸️</span>
                            暂停
                        </button>
                    </div>
                    <div class="audio-info">
                        <div class="play-count">播放次数: <span id="playCountText">0</span> / ${session.repeat === 3 ? '∞' : session.repeat}</div>
                        <div class="speed-info">播放速度: ${session.speed}x</div>
                    </div>
                    <div class="audio-tip">
                        <small>💡 点击播放按钮听取英文朗读内容</small>
                    </div>
                </div>

                <div class="questions-section">
                    <h4>请回答以下问题：</h4>
                    <div class="questions-container">
                        ${currentContent.questions.map((question, index) => `
                            <div class="question-item" data-index="${index}">
                                <div class="question-text">${index + 1}. ${question.question}</div>
                                <div class="question-options">
                                    ${question.type === 'multiple_choice' ? 
                                        question.options.map((option, optIndex) => `
                                            <label class="option-label">
                                                <input type="radio" name="question_${index}" value="${optIndex}">
                                                <span class="option-text">${option}</span>
                                            </label>
                                        `).join('') :
                                        question.type === 'true_false' ? `
                                            <label class="option-label">
                                                <input type="radio" name="question_${index}" value="true">
                                                <span class="option-text">正确</span>
                                            </label>
                                            <label class="option-label">
                                                <input type="radio" name="question_${index}" value="false">
                                                <span class="option-text">错误</span>
                                            </label>
                                        ` : ''
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="practice-controls">
                    <button class="btn btn-success" id="submitListeningAnswers">提交答案</button>
                </div>
            </div>
        `;
        
        Modal.showContent(practiceContent, {
            title: `听力练习 - ${this.getListeningCategoryName(session.category)}`,
            closable: false
        });

        // 延迟绑定事件
        setTimeout(() => {
            this.bindListeningInterfaceEvents(session);
        }, 100);
    }

    /**
     * 绑定听力练习界面事件
     */
    bindListeningInterfaceEvents(session) {
        const modal = document.getElementById('modal');
        const playBtn = modal.querySelector('#playAudioBtn');
        const pauseBtn = modal.querySelector('#pauseAudioBtn');
        const submitBtn = modal.querySelector('#submitListeningAnswers');

        // 播放按钮
        if (playBtn) {
            playBtn.addEventListener('click', async () => {
                try {
                    // 检查是否是从暂停状态恢复播放
                    if (window.speechSynthesis && window.speechSynthesis.paused) {
                        window.speechSynthesis.resume();
                        this.listeningManager.audioPlayer.isPlaying = true;
                        this.listeningManager.onAudioPlay();
                    } else {
                        // 全新播放
                        await this.listeningManager.playAudio();
                    }
                    
                    const playCountText = modal.querySelector('#playCountText');
                    if (playCountText) {
                        playCountText.textContent = this.listeningManager.audioPlayer.playCount;
                    }
                } catch (error) {
                    console.error('播放音频失败:', error);
                    this.showNotification(error.message, 'error');
                }
            });
        }

        // 暂停按钮
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.listeningManager.pauseAudio();
            });
        }

        // 提交答案按钮
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.handleListeningAnswersSubmit(session);
            });
        }

        // 监听音频播放状态变化
        document.addEventListener('listeningAudioPlay', () => {
            if (playBtn) playBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'inline-flex';
        });

        document.addEventListener('listeningAudioPause', () => {
            if (playBtn) playBtn.style.display = 'inline-flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
        });

        document.addEventListener('listeningAudioEnded', () => {
            if (playBtn) playBtn.style.display = 'inline-flex';
            if (pauseBtn) pauseBtn.style.display = 'none';
        });
    }

    /**
     * 处理听力答案提交
     */
    handleListeningAnswersSubmit(session) {
        const modal = document.getElementById('modal');
        const questionItems = modal.querySelectorAll('.question-item');
        const answers = [];

        questionItems.forEach((item, index) => {
            const selectedOption = item.querySelector('input:checked');
            if (selectedOption) {
                let answer = selectedOption.value;
                if (answer === 'true' || answer === 'false') {
                    answer = answer === 'true';
                } else {
                    answer = parseInt(answer);
                }
                answers[index] = answer;
            } else {
                answers[index] = null;
            }
        });

        // 检查是否所有题目都已回答
        const unanswered = answers.findIndex(answer => answer === null);
        if (unanswered !== -1) {
            this.showNotification(`请回答第${unanswered + 1}题`, 'warning');
            return;
        }

        try {
            const result = this.listeningManager.submitAnswers(answers);
            this.showListeningResult(result, session);
        } catch (error) {
            console.error('提交答案失败:', error);
            this.showNotification(error.message || '提交失败，请重试', 'error');
        }
    }

    /**
     * 显示听力练习结果
     */
    showListeningResult(result, session) {
        const resultHTML = `
            <div class="listening-result">
                <div class="result-header">
                    <h4>📊 答题结果</h4>
                    <div class="accuracy-score ${result.accuracy >= 80 ? 'excellent' : result.accuracy >= 60 ? 'good' : 'needs-improvement'}">
                        ${result.accuracy}%
                    </div>
                </div>

                <div class="result-summary">
                    <div class="summary-item">
                        <span class="summary-label">正确题数</span>
                        <span class="summary-value">${result.correctCount} / ${result.totalQuestions}</span>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary" id="nextListeningContent">下一个内容</button>
                </div>
            </div>
        `;

        const modal = document.getElementById('modal');
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = resultHTML;

        // 绑定下一个内容按钮
        setTimeout(() => {
            const nextBtn = modal.querySelector('#nextListeningContent');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    const nextContent = this.listeningManager.getCurrentContent();
                    if (nextContent) {
                        this.showListeningPracticeInterface(session);
                    } else {
                        const practiceResult = this.listeningManager.finishPractice();
                        Modal.showContent(`
                            <div class="final-result">
                                <h3>🎉 听力练习完成！</h3>
                                <p>总体正确率: ${practiceResult.stats.accuracy}%</p>
                                <button class="btn btn-primary" onclick="Modal.hide()">完成</button>
                            </div>
                        `, { title: '练习完成', closable: true });
                    }
                });
            }
        }, 100);
    }

    /**
     * 更新听力进度显示
     */
    updateListeningProgress() {
        if (!this.listeningManager) {
            console.log('⚠️ listeningManager未初始化，跳过进度更新');
            return;
        }

        try {
            const stats = this.listeningManager.getStats();
            console.log('📊 获取到听力统计:', stats);
            
            if (!stats || !stats.categoryProgress) {
                console.log('⚠️ 听力统计数据不完整，跳过更新');
                return;
            }

            const statCards = document.querySelectorAll('.listening-progress .stat-card');
            
            if (statCards.length >= 4) {
                // 更新统计卡片
                const statValues = statCards[0]?.querySelector('.stat-value');
                if (statValues) statValues.textContent = `${stats.overallAccuracy || 0}%`;
                
                const timeValues = statCards[1]?.querySelector('.stat-value');
                if (timeValues) timeValues.textContent = Math.round((stats.totalPracticeTime || 0) / 1000 / 60);
                
                // 计算完成的总段落数 - 添加更严格的空值检查
                let totalCompleted = 0;
                if (stats.categoryProgress && typeof stats.categoryProgress === 'object') {
                    totalCompleted = Object.values(stats.categoryProgress)
                        .filter(progress => progress !== null && 
                                          typeof progress === 'object' && 
                                          progress.completed !== undefined &&
                                          typeof progress.completed === 'number')
                        .reduce((sum, progress) => sum + progress.completed, 0);
                }
                
                const completedValues = statCards[2]?.querySelector('.stat-value');
                if (completedValues) completedValues.textContent = totalCompleted;
                
                const streakValues = statCards[3]?.querySelector('.stat-value');
                if (streakValues) streakValues.textContent = stats.streakDays || 0;
            }

            console.log('📊 听力学习进度已更新');
        } catch (error) {
            console.error('❌ 更新听力进度时出错:', error);
            // 不抛出错误，避免影响其他功能
        }
    }

    /**
     * 获取听力类型名称
     */
    getListeningCategoryName(category) {
        const categoryNames = {
            'conversation': '日常对话',
            'lecture': '学术讲座',
            'news': '新闻报道',
            'interview': '专访访谈',
            'monologue': '独白演讲',
            'mixed': '综合练习'
        };
        return categoryNames[category] || category;
    }

    /**
     * 获取听力技能名称
     */
    getListeningSkillName(skill) {
        const skillNames = {
            'main_idea': '主旨理解',
            'details': '细节捕捉',
            'inference': '推理判断',
            'attitude': '态度识别'
        };
        return skillNames[skill] || skill;
    }

    /**
     * 获取听力难度名称
     */
    getListeningDifficultyName(difficulty) {
        const difficultyNames = {
            'basic': '基础',
            'intermediate': '中级',
            'advanced': '高级'
        };
        return difficultyNames[difficulty] || difficulty;
    }

    /**
     * 重置听力训练进度
     */
    async resetListeningProgress() {
        if (!this.listeningManager) {
            this.showNotification('听力训练系统未初始化', 'error');
            return;
        }

        // 显示确认对话框
        const confirmed = await Modal.confirm(
            '确定要重置所有听力训练进度吗？此操作不可撤销。',
            {
                title: '确认重置',
                confirmText: '确定重置',
                cancelText: '取消'
            }
        );

        if (!confirmed) {
            return;
        }

        try {
            // 调用听力管理器的重置方法
            await this.listeningManager.resetProgress();
            
            // 更新进度显示
            this.updateListeningProgress();
            
            // 显示成功消息
            this.showNotification('听力训练进度已成功重置', 'success');
            
            console.log('✅ 听力训练进度已重置');
        } catch (error) {
            console.error('重置听力进度失败:', error);
            this.showNotification('重置进度失败，请重试', 'error');
        }
    }

    loadReadingPage() {
        console.log('加载阅读理解页面');
        
        // 防止重复加载
        if (this._readingPageLoading) {
            console.log('⚠️ 阅读页面正在加载中，跳过重复加载');
            return;
        }
        
        this._readingPageLoading = true;
        
        // 初始化阅读理解管理器
        if (typeof ReadingManager !== 'undefined') {
            if (!window.readingManager) {
                window.readingManager = new ReadingManager();
                console.log('✅ 阅读理解管理器已初始化');
            }
        } else {
            console.warn('⚠️ ReadingManager 类未找到');
        }
        
        // 延迟绑定事件，确保DOM已经渲染完成
        setTimeout(() => {
            this.bindReadingEvents();
            this.updateReadingStats();
            this._readingPageLoading = false;
        }, 100);
    }

    /**
     * 绑定阅读理解事件
     */
    bindReadingEvents() {
        const readingPage = document.getElementById('reading');
        if (!readingPage) return;

        console.log('📚 绑定阅读理解事件');

        // 开始阅读按钮
        const startBtn = document.getElementById('startReadingBtn');
        if (startBtn) {
            startBtn.removeEventListener('click', this.startReading);
            startBtn.addEventListener('click', this.startReading.bind(this));
        }

        // 配置选项事件
        this.bindReadingConfigEvents();

        console.log('✅ 阅读理解事件已绑定');
    }

    /**
     * 绑定阅读配置事件
     */
    bindReadingConfigEvents() {
        // 文章类型选择
        document.querySelectorAll('.type-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                const type = e.target.dataset.type;
                if (window.readingManager) {
                    window.readingManager.updateConfig({ articleType: type });
                }
                console.log('📰 选择文章类型:', type);
            });
        });

        // 其他配置选项的绑定...
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                const difficulty = e.target.dataset.difficulty;
                if (window.readingManager) {
                    window.readingManager.updateConfig({ difficulty: difficulty });
                }
                console.log('📊 选择阅读难度:', difficulty);
            });
        });
    }

    /**
     * 开始阅读练习
     */
    startReading() {
        if (!window.readingManager) {
            this.showNotification('阅读理解系统正在初始化，请稍后再试', 'warning');
            return;
        }

        console.log('🚀 开始阅读练习');

        try {
            const article = window.readingManager.startReadingPractice();
            if (!article) {
                this.showNotification('未找到合适的文章，请重试', 'error');
                return;
            }

            this.showReadingInterface(article);
            this.showNotification('阅读练习已开始', 'success');

        } catch (error) {
            console.error('开始阅读练习失败:', error);
            this.showNotification('开始阅读失败，请重试', 'error');
        }
    }

    /**
     * 显示阅读界面
     */
    showReadingInterface(article) {
        // 隐藏配置界面，显示阅读界面
        document.getElementById('readingConfig').classList.add('hidden');
        document.getElementById('readingInterface').classList.remove('hidden');
        
        // 显示文章内容
        this.displayArticle(article);
        
        // 开始计时
        window.readingManager.startTimer();
        
        console.log('📖 阅读界面已显示');
    }

    /**
     * 显示文章内容
     */
    displayArticle(article) {
        const contentContainer = document.getElementById('articleContent');
        
        const articleHtml = `
            <h3>${article.title}</h3>
            ${article.content.split('\n\n').map(paragraph => 
                `<p>${paragraph.trim()}</p>`
            ).join('')}
        `;
        
        contentContainer.innerHTML = articleHtml;

        // 更新头部信息
        document.getElementById('articleTypeIndicator').textContent = article.type;
        document.getElementById('difficultyIndicator').textContent = article.difficulty;
        document.getElementById('wordCount').textContent = `约 ${article.wordCount} 词`;
    }

    /**
     * 更新阅读统计
     */
    updateReadingStats() {
        if (!window.readingManager) return;

        const stats = window.readingManager.getReadingStats();
        
        document.getElementById('totalArticlesRead').textContent = stats.totalArticles || 0;
        document.getElementById('averageAccuracy').textContent = `${stats.averageAccuracy || 0}%`;
        document.getElementById('readingSpeed').textContent = stats.readingSpeed || 0;
        document.getElementById('totalReadingTime').textContent = stats.totalReadingTime || 0;

        console.log('📈 阅读统计已更新');
    }

    /**
     * 加载写作练习页面
     */
    loadWritingPage() {
        console.log('加载写作练习页面');
        
        // 防止重复加载
        if (this._writingPageLoading) {
            console.log('⚠️ 写作页面正在加载中，跳过重复加载');
            return;
        }
        
        this._writingPageLoading = true;
        
        // 初始化写作管理器
        console.log('🔍 检查 WritingManager 类:', typeof WritingManager);
        if (typeof WritingManager !== 'undefined') {
            if (!window.writingManager) {
                try {
                    window.writingManager = new WritingManager();
                    console.log('✅ 写作管理器已成功初始化');
                } catch (error) {
                    console.error('❌ 初始化写作管理器失败:', error);
                }
            } else {
                console.log('ℹ️ 写作管理器已存在');
            }
        } else {
            console.error('❌ WritingManager 类未找到 - 可能脚本加载失败');
        }
        
        // 延迟绑定事件，确保DOM已经渲染完成
        setTimeout(() => {
            this.bindWritingEvents();
            this.updateWritingStats();
            this._writingPageLoading = false;
        }, 100);
    }

    /**
     * 绑定写作练习事件
     */
    bindWritingEvents() {
        const writingPage = document.getElementById('writing');
        if (!writingPage) {
            console.error('❌ 写作页面元素未找到');
            return;
        }

        console.log('✍️ 绑定写作练习事件');

        // 写作类型选择
        const typeOptions = writingPage.querySelectorAll('.type-option');
        console.log('📝 找到写作类型选项:', typeOptions.length);
        typeOptions.forEach(option => {
            option.removeEventListener('click', this.handleWritingTypeSelect);
            option.addEventListener('click', this.handleWritingTypeSelect.bind(this));
        });

        // 难度选择
        const difficultyOptions = writingPage.querySelectorAll('.difficulty-option');
        console.log('📊 找到难度选项:', difficultyOptions.length);
        difficultyOptions.forEach(option => {
            option.removeEventListener('click', this.handleWritingDifficultySelect);
            option.addEventListener('click', this.handleWritingDifficultySelect.bind(this));
        });

        // 考试类型选择
        const examOptions = writingPage.querySelectorAll('.exam-option');
        console.log('🎯 找到考试类型选项:', examOptions.length);
        examOptions.forEach(option => {
            option.removeEventListener('click', this.handleWritingExamSelect);
            option.addEventListener('click', this.handleWritingExamSelect.bind(this));
        });

        // 开始写作按钮
        const startBtn = document.getElementById('startWritingBtn');
        if (startBtn) {
            console.log('🚀 找到开始写作按钮');
            startBtn.removeEventListener('click', this.startWriting);
            startBtn.addEventListener('click', this.startWriting.bind(this));
        } else {
            console.error('❌ 开始写作按钮未找到');
        }

        console.log('✅ 写作练习事件已绑定');
    }

    /**
     * 处理写作类型选择
     */
    handleWritingTypeSelect(event) {
        const option = event.currentTarget;
        const type = option.dataset.type;

        // 更新选中状态
        document.querySelectorAll('.writing-types .type-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // 更新配置
        if (window.writingManager) {
            window.writingManager.updateConfig({ writingType: type });
        }

        console.log('📝 选择写作类型:', type);
    }

    /**
     * 处理难度选择
     */
    handleWritingDifficultySelect(event) {
        const option = event.currentTarget;
        const difficulty = option.dataset.difficulty;

        // 更新选中状态
        document.querySelectorAll('.writing-config .difficulty-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // 更新配置
        if (window.writingManager) {
            window.writingManager.updateConfig({ difficulty: difficulty });
        }

        console.log('📊 选择写作难度:', difficulty);
    }

    /**
     * 处理考试类型选择
     */
    handleWritingExamSelect(event) {
        const option = event.currentTarget;
        const examType = option.dataset.exam;

        // 更新选中状态
        document.querySelectorAll('.writing-config .exam-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // 更新配置
        if (window.writingManager) {
            window.writingManager.updateConfig({ examType: examType });
        }

        console.log('🎯 选择考试类型:', examType);
    }

    /**
     * 开始写作练习
     */
    startWriting() {
        console.log('🚀 startWriting 方法被调用');
        
        if (!window.writingManager) {
            console.error('❌ WritingManager 未初始化');
            this.showNotification('写作系统正在初始化，请稍后再试', 'warning');
            return;
        }

        console.log('✅ WritingManager 已找到，开始写作练习');

        try {
            const topic = window.writingManager.startWritingPractice();
            console.log('📝 获取到题目:', topic);
            
            if (!topic) {
                console.error('❌ 未获取到写作题目');
                this.showNotification('未找到合适的写作题目，请重试', 'error');
                return;
            }

            this.showWritingInterface(topic);
            this.showNotification('写作练习已开始', 'success');

        } catch (error) {
            console.error('❌ 开始写作练习失败:', error);
            this.showNotification('开始写作失败，请重试', 'error');
        }
    }

    /**
     * 显示写作界面
     */
    showWritingInterface(topic) {
        // 隐藏配置界面，显示写作界面
        document.getElementById('writingConfig').classList.add('hidden');
        document.getElementById('writingInterface').classList.remove('hidden');
        
        // 更新头部信息
        this.updateWritingHeader(topic);
        
        // 显示题目信息
        this.displayWritingTopic(topic);
        
        // 绑定写作界面事件
        this.bindWritingInterfaceEvents();
        
        // 开始计时
        window.writingManager.startTimer();
        
        console.log('✍️ 写作界面已显示');
    }

    /**
     * 更新写作头部信息
     */
    updateWritingHeader(topic) {
        const typeNames = {
            'essay': '议论文',
            'letter': '书信',
            'report': '报告',
            'email': '邮件'
        };

        const difficultyNames = {
            'beginner': '初级',
            'intermediate': '中级',
            'advanced': '高级'
        };

        document.getElementById('writingTypeIndicator').textContent = typeNames[topic.type] || topic.type;
        document.getElementById('writingDifficulty').textContent = difficultyNames[topic.difficulty] || topic.difficulty;
        document.getElementById('wordLimit').textContent = `${topic.wordLimit}词`;
    }

    /**
     * 显示写作题目
     */
    displayWritingTopic(topic) {
        document.getElementById('topicTitle').textContent = topic.title;
        document.getElementById('topicPrompt').textContent = topic.prompt;

        // 显示要求列表
        const requirementsList = document.getElementById('requirementsList');
        requirementsList.innerHTML = topic.requirements.map(req => `<li>${req}</li>`).join('');

        // 显示关键词
        const keywordsList = document.getElementById('keywordsList');
        keywordsList.innerHTML = topic.keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
    }

    /**
     * 绑定写作界面事件
     */
    bindWritingInterfaceEvents() {
        // 文本区域事件
        const textarea = document.getElementById('writingTextarea');
        if (textarea) {
            textarea.removeEventListener('input', this.handleWritingInput);
            textarea.addEventListener('input', this.handleWritingInput.bind(this));
        }

        // 编辑器工具按钮
        const clearBtn = document.getElementById('clearText');
        if (clearBtn) {
            clearBtn.removeEventListener('click', this.clearWritingText);
            clearBtn.addEventListener('click', this.clearWritingText.bind(this));
        }

        const saveBtn = document.getElementById('saveText');
        if (saveBtn) {
            saveBtn.removeEventListener('click', this.saveWritingDraft);
            saveBtn.addEventListener('click', this.saveWritingDraft.bind(this));
        }

        const finishBtn = document.getElementById('finishWriting');
        if (finishBtn) {
            finishBtn.removeEventListener('click', this.finishWriting);
            finishBtn.addEventListener('click', this.finishWriting.bind(this));
        }
    }

    /**
     * 处理写作输入
     */
    handleWritingInput(event) {
        const content = event.target.value;
        if (window.writingManager) {
            window.writingManager.updateWritingContent(content);
        }
    }

    /**
     * 清空写作文本
     */
    clearWritingText() {
        const textarea = document.getElementById('writingTextarea');
        if (textarea) {
            textarea.value = '';
            if (window.writingManager) {
                window.writingManager.updateWritingContent('');
            }
        }
    }

    /**
     * 保存写作草稿
     */
    saveWritingDraft() {
        const textarea = document.getElementById('writingTextarea');
        if (textarea && textarea.value.trim()) {
            localStorage.setItem('writingDraft', textarea.value);
            this.showNotification('草稿已保存', 'success');
        } else {
            this.showNotification('没有内容可保存', 'warning');
        }
    }

    /**
     * 完成写作
     */
    finishWriting() {
        const textarea = document.getElementById('writingTextarea');
        if (!textarea || !textarea.value.trim()) {
            this.showNotification('请先完成写作内容', 'warning');
            return;
        }

        if (!window.writingManager) {
            this.showNotification('写作系统错误，请刷新重试', 'error');
            return;
        }

        const content = textarea.value.trim();
        const result = window.writingManager.finishWriting(content);
        
        if (result) {
            this.showWritingResult(result);
        } else {
            this.showNotification('完成写作失败，请重试', 'error');
        }
    }

    /**
     * 显示写作结果
     */
    showWritingResult(result) {
        // 隐藏写作界面，显示结果
        document.getElementById('writingInterface').classList.add('hidden');
        document.getElementById('writingResult').classList.remove('hidden');

        const resultHtml = `
            <div class="writing-result-content">
                <div class="result-header">
                    <h3>✍️ 写作完成！</h3>
                    <p>${this.getWritingResultMessage(result.score.total)}</p>
                </div>

                <div class="score-overview">
                    <div class="total-score">
                        <div class="score-value">${result.score.total}</div>
                        <div class="score-label">总分</div>
                    </div>
                    <div class="score-breakdown">
                        <div class="score-item">
                            <span class="score-category">内容</span>
                            <span class="score-points">${result.score.breakdown.content}/10</span>
                        </div>
                        <div class="score-item">
                            <span class="score-category">结构</span>
                            <span class="score-points">${result.score.breakdown.organization}/10</span>
                        </div>
                        <div class="score-item">
                            <span class="score-category">语言</span>
                            <span class="score-points">${result.score.breakdown.language}/10</span>
                        </div>
                        <div class="score-item">
                            <span class="score-category">语法</span>
                            <span class="score-points">${result.score.breakdown.mechanics}/10</span>
                        </div>
                    </div>
                </div>

                <div class="writing-stats">
                    <div class="stat-item">
                        <span class="stat-label">字数统计</span>
                        <span class="stat-value">${result.session.wordCount} 词</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">用时</span>
                        <span class="stat-value">${Math.round(result.session.timeSpent / 1000 / 60)} 分钟</span>
                    </div>
                </div>

                <div class="feedback-section">
                    <h4>📝 详细反馈</h4>
                    <div class="feedback-content">
                        <div class="overall-feedback">
                            <h5>总体评价</h5>
                            <p>${result.feedback.overall}</p>
                        </div>
                        
                        ${result.feedback.strengths.length > 0 ? `
                            <div class="strengths">
                                <h5>✅ 优点</h5>
                                <ul>
                                    ${result.feedback.strengths.map(strength => `<li>${strength}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${result.feedback.improvements.length > 0 ? `
                            <div class="improvements">
                                <h5>📈 改进建议</h5>
                                <ul>
                                    ${result.feedback.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="suggestions">
                            <h5>💡 学习建议</h5>
                            <ul>
                                ${result.feedback.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn btn-primary" data-action="restart-writing">再次练习</button>
                    <button class="btn btn-outline-secondary" data-action="back-to-config">返回配置</button>
                </div>
            </div>
        `;

        document.getElementById('writingResult').innerHTML = resultHtml;
        
        // 事件将通过全局事件委托处理
        
        // 更新统计数据
        this.updateWritingStats();

        console.log('📊 写作结果已显示');
    }

    /**
     * 获取写作结果评价
     */
    getWritingResultMessage(score) {
        if (score >= 9) {
            return '🌟 卓越的写作！您的英语写作水平非常高！';
        } else if (score >= 8) {
            return '👏 优秀的写作！继续保持这个水准！';
        } else if (score >= 7) {
            return '👍 很好的写作，有些地方还能改进！';
        } else if (score >= 6) {
            return '💪 不错的尝试，多练习会更好！';
        } else if (score >= 5) {
            return '📚 及格了！继续努力提升！';
        } else {
            return '💡 需要加强练习！建议多读多写！';
        }
    }


    /**
     * 重新开始写作练习
     */
    restartWriting() {
        if (window.writingManager) {
            window.writingManager.resetCurrentSession();
        }
        this.startWriting();
    }

    /**
     * 返回写作配置
     */
    backToWritingConfig() {
        if (window.writingManager) {
            window.writingManager.resetCurrentSession();
        }
        
        document.getElementById('writingConfig').classList.remove('hidden');
        document.getElementById('writingInterface').classList.add('hidden');
        document.getElementById('writingResult').classList.add('hidden');
        
        // 清空文本区域
        const textarea = document.getElementById('writingTextarea');
        if (textarea) {
            textarea.value = '';
        }
        
        this.updateWritingStats();
    }

    /**
     * 更新写作统计
     */
    updateWritingStats() {
        if (!window.writingManager) return;

        const stats = window.writingManager.getWritingStats();
        
        // 更新统计卡片
        const totalWritingsElement = document.getElementById('totalWritings');
        if (totalWritingsElement) {
            totalWritingsElement.textContent = stats.totalWritings;
        }

        const averageScoreElement = document.getElementById('averageScore');
        if (averageScoreElement) {
            averageScoreElement.textContent = stats.averageScore;
        }

        const totalWordsElement = document.getElementById('totalWords');
        if (totalWordsElement) {
            totalWordsElement.textContent = stats.totalWords;
        }

        const totalTimeElement = document.getElementById('totalTime');
        if (totalTimeElement) {
            totalTimeElement.textContent = stats.totalTime;
        }

        // 更新最近写作列表
        this.updateRecentWritings(stats.recentWritings);

        console.log('📈 写作统计已更新');
    }

    /**
     * 更新最近写作列表
     */
    updateRecentWritings(recentWritings) {
        const writingsList = document.getElementById('writingsList');
        if (!writingsList || !recentWritings) return;

        if (recentWritings.length === 0) {
            writingsList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">暂无写作记录</p>';
            return;
        }

        const typeNames = {
            'essay': '议论文',
            'letter': '书信',
            'report': '报告',
            'email': '邮件'
        };

        const writingsHtml = recentWritings.map(writing => `
            <div class="writing-item">
                <div class="writing-info">
                    <div class="writing-title">${writing.title}</div>
                    <div class="writing-meta">${typeNames[writing.type] || writing.type} · ${writing.wordCount}词 · ${new Date(writing.date).toLocaleDateString()}</div>
                </div>
                <div class="writing-score">${writing.score}分</div>
            </div>
        `).join('');

        writingsList.innerHTML = writingsHtml;
    }

    loadExamPage() {
        console.log('加载模拟考试页面');
        
        // 防止重复加载
        if (this._examPageLoading) {
            console.log('⚠️ 考试页面正在加载中，跳过重复加载');
            return;
        }
        
        this._examPageLoading = true;
        
        // 初始化模拟考试管理器
        if (typeof ExamSimulatorManager !== 'undefined') {
            if (!window.examSimulatorManager) {
                window.examSimulatorManager = new ExamSimulatorManager();
                this.examSimulatorManager = window.examSimulatorManager;
                console.log('✅ 模拟考试管理器已初始化');
            }
        } else {
            console.warn('⚠️ ExamSimulatorManager 类未找到');
        }
        
        // 延迟绑定事件，确保DOM已经渲染完成
        setTimeout(() => {
            this.bindExamEvents();
            this.updateExamHistory();
            // 预生成常见考试类型的本地100套题库（离线可用）
            try {
                // 一次性强制覆盖生成 CET-4 与 IELTS 的100套题库（含听力TTS脚本）
                const seedFlag = 'exam_seed_done_v1';
                if (!localStorage.getItem(seedFlag) && this.examSimulatorManager?.seedSets) {
                    this.examSimulatorManager.seedSets('cet4', 100, true);
                    this.examSimulatorManager.seedSets('ielts', 100, true);
                    // 其余类型按需生成（不覆盖）
                    ['cet6','toefl','tem4','tem8','gre','postgraduate'].forEach(t => {
                        this.examSimulatorManager.seedSets(t, 100, false);
                    });
                    localStorage.setItem(seedFlag, '1');
                    this.showNotification('已生成并落库多类型100套题库（含TTS听力脚本）', 'success');
                }
                const types = ['cet4','ielts','cet6','toefl','tem4','tem8','gre'];
                types.forEach(t => {
                    if (this.examSimulatorManager?.ensureSets) {
                        this.examSimulatorManager.ensureSets(t, 100);
                    }
                });
                // 更新选择卡片上的统计（最佳/平均）
                this.updateExamTypeStatsBadges();
            } catch (e) {}
            this._examPageLoading = false;
        }, 100);
    }

    /**
     * 绑定考试页面事件
     */
    bindExamEvents() {
        console.log('🎯 绑定考试页面事件');

        // 考试类型选择
        const examTypeCards = document.querySelectorAll('.exam-type-card');
        examTypeCards.forEach(card => {
            card.removeEventListener('click', this.handleExamTypeSelect.bind(this));
            card.addEventListener('click', this.handleExamTypeSelect.bind(this));
        });

        // 返回选择按钮
        const backButton = document.getElementById('backToSelection');
        if (backButton) {
            backButton.removeEventListener('click', this.showExamSelection.bind(this));
            backButton.addEventListener('click', this.showExamSelection.bind(this));
        }

        // 开始考试按钮
        const startExamBtn = document.getElementById('startExamBtn');
        if (startExamBtn) {
            startExamBtn.removeEventListener('click', this.startExam.bind(this));
            startExamBtn.addEventListener('click', this.startExam.bind(this));
        }
    }

    /**
     * 处理考试类型选择
     */
    handleExamTypeSelect(event) {
        const card = event.currentTarget;
        const examType = card.dataset.exam;
        
        if (!examType) return;

        console.log('📋 选择考试类型:', examType);
        
        // 更新选中状态
        document.querySelectorAll('.exam-type-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        this.selectedExamType = examType;
        this.showExamConfig(examType);
    }

    /**
     * 显示考试配置界面
     */
    showExamConfig(examType) {
        if (!this.examSimulatorManager) {
            this.showNotification('考试系统未初始化', 'error');
            return;
        }

        // 隐藏选择界面，显示配置界面
        const selectionEl = document.getElementById('examSelection');
        const configEl = document.getElementById('examConfig');
        
        if (selectionEl) selectionEl.classList.add('hidden');
        if (configEl) configEl.classList.remove('hidden');

        // 确保本地存在100套题库
        try { this.examSimulatorManager.ensureSets(examType, 100); } catch (e) {}

        // 获取考试配置
        const examTypes = this.examSimulatorManager.getSupportedExamTypes();
        const examConfig = examTypes.find(type => type.id === examType);
        
        if (!examConfig) {
            this.showNotification('不支持的考试类型', 'error');
            return;
        }

        // 更新考试名称
        const nameEl = document.getElementById('selectedExamName');
        if (nameEl) {
            nameEl.textContent = examConfig.name;
        }

        // 显示考试详情
        this.displayExamDetails(examConfig);
    }

    /**
     * 显示考试详情
     */
    displayExamDetails(examConfig) {
        const detailsEl = document.getElementById('examDetails');
        if (!detailsEl) return;

        const config = examConfig.config;
        const sections = config.sections.map(section => 
            `${section.name}(${section.questions}题, ${section.time}分钟)`
        ).join('、');

        detailsEl.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">考试时长</span>
                <span class="detail-value">${config.duration}分钟</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">总分</span>
                <span class="detail-value">${config.totalScore}分</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">及格分</span>
                <span class="detail-value">${config.passScore}分</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">考试板块</span>
                <span class="detail-value">${sections}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">总题数</span>
                <span class="detail-value">${config.sections.reduce((sum, s) => sum + s.questions, 0)}题</span>
            </div>
        `;
    }

    /**
     * 显示考试选择界面
     */
    showExamSelection() {
        const selectionEl = document.getElementById('examSelection');
        const configEl = document.getElementById('examConfig');
        const interfaceEl = document.getElementById('examInterface');
        const resultEl = document.getElementById('examResult');
        
        if (selectionEl) selectionEl.classList.remove('hidden');
        if (configEl) configEl.classList.add('hidden');
        if (interfaceEl) interfaceEl.classList.add('hidden');
        if (resultEl) resultEl.classList.add('hidden');

        // 清除选中状态
        document.querySelectorAll('.exam-type-card').forEach(card => {
            card.classList.remove('selected');
        });

        this.selectedExamType = null;
    }

    /**
     * 开始考试
     */
    startExam() {
        if (!this.examSimulatorManager || !this.selectedExamType) {
            this.showNotification('请先选择考试类型', 'warning');
            return;
        }

        try {
            // 获取考试设置
            const config = {
                examType: this.selectedExamType,
                showTimer: document.getElementById('showTimer')?.checked !== false,
                allowReview: document.getElementById('allowReview')?.checked !== false,
                shuffleQuestions: document.getElementById('shuffleQuestions')?.checked === true
            };

            console.log('🚀 开始考试:', config);

            // 创建考试
            const exam = this.examSimulatorManager.createExam(config);
            
            if (exam) {
                // 开始考试
                this.examSimulatorManager.startExam();
                this.showExamInterface();
                this.showNotification('考试已开始，祝您考试顺利！', 'success');
            }

        } catch (error) {
            console.error('❌ 开始考试失败:', error);
            this.showNotification('开始考试失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示考试界面
     */
    showExamInterface() {
        const selectionEl = document.getElementById('examSelection');
        const configEl = document.getElementById('examConfig');
        const interfaceEl = document.getElementById('examInterface');
        
        if (selectionEl) selectionEl.classList.add('hidden');
        if (configEl) configEl.classList.add('hidden');
        if (interfaceEl) interfaceEl.classList.remove('hidden');

        // 更新考试标题
        const titleEl = document.getElementById('examTitle');
        if (titleEl && this.examSimulatorManager) {
            const status = this.examSimulatorManager.getCurrentExamStatus();
            if (status) {
                titleEl.textContent = status.name;
            }
        }

        // 渲染真实题目与控制
        this.renderCurrentQuestion();
        this.bindExamControls();
    }

    /**
     * 绑定基本考试控制
     */
    bindExamControls() {
        const finishBtn = document.getElementById('finishExamBtn');
        if (finishBtn) {
            finishBtn.removeEventListener('click', this.finishExam.bind(this));
            finishBtn.addEventListener('click', this.finishExam.bind(this));
        }

        const prevBtn = document.getElementById('prevQuestionBtn');
        const nextBtn = document.getElementById('nextQuestionBtn');
        if (prevBtn) {
            prevBtn.removeEventListener('click', this.prevQuestion.bind(this));
            prevBtn.addEventListener('click', this.prevQuestion.bind(this));
        }
        if (nextBtn) {
            nextBtn.removeEventListener('click', this.nextQuestion.bind(this));
            nextBtn.addEventListener('click', this.nextQuestion.bind(this));
        }

        // 计时显示
        window.removeEventListener('examTimeUpdate', this.updateExamTimerHandler);
        this.updateExamTimerHandler = (e) => {
            const timeDisplay = document.getElementById('timeDisplay');
            if (!timeDisplay) return;
            const secs = e.detail.timeRemaining;
            const h = String(Math.floor(secs / 3600)).padStart(2, '0');
            const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
            const s = String(secs % 60).padStart(2, '0');
            timeDisplay.textContent = `${h}:${m}:${s}`;
        };
        window.addEventListener('examTimeUpdate', this.updateExamTimerHandler);
    }

    /**
     * 渲染当前题目
     */
    renderCurrentQuestion() {
        if (!this.examSimulatorManager) return;
        const q = this.examSimulatorManager.getCurrentQuestion();
        const all = this.examSimulatorManager.getQuestions();
        const contentEl = document.getElementById('questionContent');
        const progressSpan = document.getElementById('questionProgress');
        const fill = document.getElementById('examProgressFill');
        if (!q || !contentEl) return;

        const index = this.examSimulatorManager.getCurrentExamStatus()?.currentQuestionIndex || 0;
        const total = this.examSimulatorManager.getCurrentExamStatus()?.totalQuestions || 1;
        if (progressSpan) progressSpan.textContent = `${index + 1} / ${total}`;
        if (fill) fill.style.width = `${Math.round(((index + 1) / total) * 100)}%`;

        const answered = this.examSimulatorManager.getAnswer(q.id);

        if (q.type === 'passage') {
            contentEl.innerHTML = `
                <div class="reading-passage">
                    <h4>${q.title || ''}</h4>
                    <div class="passage">${q.content || ''}</div>
                </div>
            `;
            // 自动跳到下一题（展示段落后）
            return;
        }

        if (q.type === 'multiple_choice') {
            const optionsHtml = q.options.map((opt, i) => {
                const checked = answered === i ? 'checked' : '';
                return `
                    <label class="option-item">
                        <input type="radio" name="qopt" value="${i}" ${checked}>
                        <span class="opt-label">${String.fromCharCode(65 + i)}.</span>
                        <span class="opt-text">${opt}</span>
                    </label>`;
            }).join('');
            const audioBlock = q.section === 'listening'
                ? (q.audioUrl
                    ? `<div class="listening-audio"><audio controls src="${q.audioUrl}"></audio></div>`
                    : `<div class="listening-audio">
                         <button class="btn btn-outline-secondary" id="ttsPlay">▶ 朗读</button>
                         <button class="btn btn-outline-secondary" id="ttsStop">⏹ 停止</button>
                       </div>`)
                : '';
            contentEl.innerHTML = `
                <div class="question-text">${q.text}</div>
                ${audioBlock}
                <div class="options">${optionsHtml}</div>
            `;
            const radios = contentEl.querySelectorAll('input[name="qopt"]');
            radios.forEach(r => r.addEventListener('change', (e) => {
                const val = Number(e.target.value);
                this.examSimulatorManager.submitAnswer(q.id, val);
            }));
            if (q.section === 'listening' && !q.audioUrl && q.audioScript) {
                const playBtn = document.getElementById('ttsPlay');
                const stopBtn = document.getElementById('ttsStop');

                const handlePlay = () => {
                    const synth = window.speechSynthesis;
                    if (!synth) {
                        alert('您的浏览器不支持语音合成功能。');
                        return;
                    }

                    if (synth.speaking) {
                        console.log('⏹️ 语音正在播放，执行停止操作。');
                        synth.cancel();
                        return;
                    }

                    console.log('▶️ 准备开始朗读...');
                    const utterance = new SpeechSynthesisUtterance(q.audioScript);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.9;
                    utterance.volume = 1.0;

                    const cleanup = () => {
                        if (playBtn) playBtn.textContent = '▶ 朗读';
                    };

                    utterance.onstart = () => {
                        console.log('✅ TTS 已开始播放。');
                        if (playBtn) playBtn.textContent = '⏸ 播放中...';
                    };

                    utterance.onend = () => {
                        console.log('✅ TTS 已正常结束。');
                        cleanup();
                    };

                    utterance.onerror = (event) => {
                        console.error(`❌ TTS 发生错误: ${event.error}`);
                        cleanup();
                    };

                    const startSpeech = () => {
                        const voices = synth.getVoices();
                        if (voices.length > 0) {
                            const englishVoice = voices.find(v => v.lang && v.lang.startsWith('en'));
                            if (englishVoice) {
                                utterance.voice = englishVoice;
                                console.log('🎯 已选择语音:', englishVoice.name);
                            }
                        }
                        synth.speak(utterance);
                    };

                    // 由于音频上下文已由全局解锁器处理，这里可以简化逻辑
                    const voices = synth.getVoices();
                    if (voices.length === 0) {
                        console.log('⏳ 语音库未加载，等待 onvoiceschanged 事件...');
                        synth.onvoiceschanged = () => {
                            synth.onvoiceschanged = null;
                            startSpeech();
                        };
                    } else {
                        startSpeech();
                    }
                };
                
                // 简化事件绑定
                const newPlayBtn = playBtn.cloneNode(true);
                playBtn.parentNode.replaceChild(newPlayBtn, playBtn);
                newPlayBtn.addEventListener('click', handlePlay);

                if (stopBtn) {
                    const newStopBtn = stopBtn.cloneNode(true);
                    stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
                    newStopBtn.addEventListener('click', () => {
                        console.log('⏹️ 停止按钮被点击。');
                        window.speechSynthesis.cancel();
                    });
                }
            }
        } else if (q.type === 'speaking') {
            contentEl.innerHTML = `
                <div class="question-text"><strong>${q.title || 'Speaking'}</strong><br>${q.prompt || ''}</div>
                <div class="speaking-hint">准备时间: ${q.preparationTime || 0}s · 作答时间: ${q.timeLimit || 60}s</div>
                ${q.audioUrl ? `<audio controls src="${q.audioUrl}"></audio>` : ''}
            `;
        } else {
            contentEl.innerHTML = `<div class="question-text">${q.text || '（题目）'}</div>`;
        }
    }

    nextQuestion() {
        if (!this.examSimulatorManager) return;
        if (this.examSimulatorManager.nextQuestion()) {
            this.renderCurrentQuestion();
        }
    }

    prevQuestion() {
        if (!this.examSimulatorManager) return;
        if (this.examSimulatorManager.previousQuestion()) {
            this.renderCurrentQuestion();
        }
    }

    /**
     * 完成考试
     */
    finishExam() {
        if (!this.examSimulatorManager) return;

        // 确认交卷
        if (!confirm('确定要交卷吗？交卷后无法修改答案。')) {
            return;
        }

        try {
            const result = this.examSimulatorManager.finishExam();
            if (result) {
                this.showExamResult(result);
                this.showNotification('考试已完成！', 'success');
            }
        } catch (error) {
            console.error('❌ 完成考试失败:', error);
            this.showNotification('交卷失败: ' + error.message, 'error');
        }
    }

    /**
     * 显示考试结果
     */
    showExamResult(result) {
        const interfaceEl = document.getElementById('examInterface');
        const resultEl = document.getElementById('examResult');
        
        if (interfaceEl) interfaceEl.classList.add('hidden');
        if (resultEl) resultEl.classList.remove('hidden');

        // 渲染结果页面
        this.renderExamResult(result);

        // 更新历史记录
        this.updateExamHistory();
    }

    /**
     * 渲染考试结果
     */
    renderExamResult(result) {
        const resultEl = document.getElementById('examResult');
        if (!resultEl) return;

        const isPassed = result.overall.passed;
        const grade = result.overall.grade;

        resultEl.innerHTML = `
            <div class="result-header">
                <h2 class="result-title">${isPassed ? '恭喜通过！' : '继续努力！'}</h2>
                <p class="result-subtitle">${result.examName} - 考试完成</p>
            </div>

            <div class="result-overview">
                <div class="result-card primary">
                    <div class="result-card-icon">🏆</div>
                    <div class="result-card-value">${result.overall.totalScore}</div>
                    <div class="result-card-label">总分 (满分${result.overall.maxScore})</div>
                </div>
                <div class="result-card ${isPassed ? 'success' : 'warning'}">
                    <div class="result-card-icon">${isPassed ? '✅' : '❌'}</div>
                    <div class="result-card-value">${grade}</div>
                    <div class="result-card-label">等级评定</div>
                </div>
                <div class="result-card success">
                    <div class="result-card-icon">🎯</div>
                    <div class="result-card-value">${result.overall.accuracy.toFixed(1)}%</div>
                    <div class="result-card-label">正确率</div>
                </div>
                <div class="result-card warning">
                    <div class="result-card-icon">⏱️</div>
                    <div class="result-card-value">${Math.floor(result.duration / 60)}分钟</div>
                    <div class="result-card-label">用时</div>
                </div>
            </div>

            <div class="result-sections" id="resultSections"></div>

            <div class="question-review" id="questionReview"></div>

            <div class="result-actions">
                <button class="btn btn-primary" data-action="show-exam-selection">
                    <span class="icon">🔄</span>
                    重新考试
                </button>
                <button class="btn btn-outline-primary" data-action="show-exam-selection">
                    <span class="icon">📋</span>
                    选择其他考试
                </button>
                <button class="btn btn-secondary" id="exportReviewJson">
                    <span class="icon">💾</span>
                    导出批改结果
                </button>
            </div>
        `;

        // 渲染分板块统计
        const secBox = document.getElementById('resultSections');
        if (secBox && result.sections) {
            const secHtml = Object.entries(result.sections).map(([name, s]) => {
                return `
                    <div class="section-card">
                        <div class="section-title">${name}</div>
                        <div class="section-stats">
                            <span>得分: ${s.score}/${s.maxScore}</span>
                            <span>正确率: ${s.accuracy.toFixed(1)}%</span>
                            <span>用时: ${Math.floor((s.time||0)/60)}分</span>
                        </div>
                    </div>
                `;
            }).join('');
            secBox.innerHTML = `<h3>分板块表现</h3><div class="section-grid">${secHtml}</div>`;
        }

        // 渲染逐题回顾（交卷后才显示）
        const review = this.examSimulatorManager?.getReviewData?.() || [];
        const revBox = document.getElementById('questionReview');
        if (revBox && review.length) {
            const rows = review.map((r, idx) => {
                const ua = (typeof r.userAnswer === 'number') ? String.fromCharCode(65 + r.userAnswer) : (r.userAnswer ?? '-');
                const ca = (typeof r.correctAnswer === 'number') ? String.fromCharCode(65 + r.correctAnswer) : (r.correctAnswer ?? '-');
                const cls = r.correct ? 'correct' : 'wrong';
                return `
                    <tr class="${cls}">
                        <td>${idx + 1}</td>
                        <td>${r.section}</td>
                        <td class="qtext">${r.text}</td>
                        <td>${ua}</td>
                        <td>${ca}</td>
                        <td class="exp">${r.explanation || ''}</td>
                    </tr>
                `;
            }).join('');
            revBox.innerHTML = `
                <h3>逐题回顾（交卷后显示）</h3>
                <div class="review-table-wrap">
                    <table class="review-table">
                        <thead>
                            <tr><th>#</th><th>板块</th><th>题目</th><th>我的答案</th><th>正确答案</th><th>解析/脚本</th></tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        }

        // 导出批改结果
        const exportBtn = document.getElementById('exportReviewJson');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                try {
                    const data = {
                        summary: result,
                        review: this.examSimulatorManager?.getReviewData?.() || []
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `exam-review-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                } catch (e) {}
            });
        }
    }

    /**
     * 更新考试历史记录
     */
    updateExamHistory() {
        if (!this.examSimulatorManager) return;

        const stats = this.examSimulatorManager.getExamStats();
        const history = this.examSimulatorManager.getExamHistory(5);

        // 更新统计数据
        const totalExamsEl = document.getElementById('totalExams');
        const averageScoreEl = document.getElementById('averageScore');
        const bestScoreEl = document.getElementById('bestScore');
        const trendEl = document.getElementById('recentTrend');

        if (totalExamsEl) totalExamsEl.textContent = stats.totalExams;
        if (averageScoreEl) averageScoreEl.textContent = stats.averageScore + '%';
        if (bestScoreEl) bestScoreEl.textContent = stats.bestScore + '%';
        if (trendEl) {
            const trendText = {
                'improving': '📈 上升',
                'declining': '📉 下降',
                'stable': '➡️ 稳定'
            };
            trendEl.textContent = trendText[stats.recentTrend] || '-';
        }

        // 更新考试记录
        const recordsEl = document.getElementById('examRecords');
        if (recordsEl && history.length > 0) {
            recordsEl.innerHTML = history.map(exam => {
                const date = new Date(exam.timestamp).toLocaleDateString();
                const gradeClass = exam.overall.grade.toLowerCase().replace('+', '');
                
                return `
                    <div class="exam-record">
                        <div class="exam-record-info">
                            <div class="exam-record-name">${exam.examName}</div>
                            <div class="exam-record-meta">${date} · ${Math.floor(exam.duration / 60)}分钟</div>
                        </div>
                        <div class="exam-record-score">
                            <div class="exam-record-value">${exam.overall.totalScore}分</div>
                            <div class="exam-record-grade grade-${gradeClass.charAt(0)}">${exam.overall.grade}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 更新各考试类型的统计
        Object.entries(stats.examTypeStats).forEach(([examType, typeStats]) => {
            const bestScoreEl = document.getElementById(`${examType}BestScore`);
            const avgScoreEl = document.getElementById(`${examType}AvgScore`);
            
            if (bestScoreEl) bestScoreEl.textContent = Math.round(typeStats.bestScore) + '%';
            if (avgScoreEl) avgScoreEl.textContent = Math.round(typeStats.averageScore) + '%';
        });
    }

    loadStatisticsPage() {
        console.log('加载学习统计页面');
        
        // 防止重复加载
        if (this._statisticsPageLoading) {
            console.log('⚠️ 统计页面正在加载中，跳过重复加载');
            return;
        }
        
        this._statisticsPageLoading = true;
        
        // 确保学习报告管理器已初始化
        if (typeof LearningReportManager !== 'undefined' && window.learningReportManager) {
            console.log('✅ 学习报告管理器已就绪');
        } else {
            console.warn('⚠️ LearningReportManager 类未找到或未初始化');
        }
        
        // 延迟绑定事件和更新数据
        setTimeout(() => {
            this.bindStatisticsEvents();
            this.updateStatisticsOverview();
            this.updateModulesStatistics();
            this._statisticsPageLoading = false;
        }, 100);
    }

    loadAnalyticsPage() {
        console.log('加载学习分析页面');
        
        // 防止重复加载
        if (this._analyticsPageLoading) {
            console.log('⚠️ 分析页面正在加载中，跳过重复加载');
            return;
        }
        
        this._analyticsPageLoading = true;
        
        // 尝试加载AdvancedAnalytics，带重试机制
        const loadAnalytics = (retryCount = 0) => {
            console.log(`🔍 检查 AdvancedAnalytics (尝试 ${retryCount + 1}/${3})`);
            console.log('typeof AdvancedAnalytics:', typeof AdvancedAnalytics);
            console.log('window.AdvancedAnalytics:', !!window.AdvancedAnalytics);
            
            if (typeof AdvancedAnalytics !== 'undefined' && window.AdvancedAnalytics) {
                console.log('✅ 高级分析管理器已就绪');
                
                // 延迟创建分析界面，确保页面已加载
                setTimeout(() => {
                    try {
                        window.AdvancedAnalytics.createAnalyticsInterface();
                        console.log('✅ 学习分析页面加载成功');
                    } catch (error) {
                        console.error('❌ 创建分析界面失败:', error);
                    }
                    this._analyticsPageLoading = false;
                }, 200);
            } else if (retryCount < 3) {
                console.log(`⏳ AdvancedAnalytics 未就绪，${200 * (retryCount + 1)}ms后重试...`);
                setTimeout(() => {
                    loadAnalytics(retryCount + 1);
                }, 200 * (retryCount + 1));
            } else {
                console.error('❌ AdvancedAnalytics 类未找到，请检查脚本加载');
                
                // 尝试手动加载脚本作为最后手段
                console.log('🔄 尝试手动加载AdvancedAnalytics脚本...');
                const script = document.createElement('script');
                script.src = '/src/js/advanced-analytics.js';
                script.onload = () => {
                    console.log('✅ 手动加载成功，重新尝试...');
                    setTimeout(() => {
                        if (window.AdvancedAnalytics) {
                            window.AdvancedAnalytics.createAnalyticsInterface();
                            console.log('✅ 学习分析页面加载成功（手动加载）');
                        }
                    }, 100);
                };
                script.onerror = () => {
                    console.error('❌ 手动加载也失败，显示错误页面');
                    // 显示错误提示
                    const container = document.getElementById('analytics-content');
                    if (container) {
                        container.innerHTML = `
                            <div class="error-message">
                                <div class="error-icon">❌</div>
                                <h3>学习分析功能暂时不可用</h3>
                                <p>脚本文件加载失败，可能是网络问题或服务器配置问题。</p>
                                <button class="btn btn-primary" onclick="window.location.reload()">刷新页面</button>
                                <br><br>
                                <details>
                                    <summary>技术详情</summary>
                                    <p>无法加载 /src/js/advanced-analytics.js 脚本文件</p>
                                    <p>请检查服务器是否正常运行，或联系管理员</p>
                                </details>
                            </div>
                        `;
                    }
                };
                document.head.appendChild(script);
                this._analyticsPageLoading = false;
            }
        };
        
        loadAnalytics();
    }

    /**
     * 绑定统计页面事件
     */
    bindStatisticsEvents() {
        const statisticsPage = document.getElementById('statistics');
        if (!statisticsPage) return;

        console.log('📊 绑定统计页面事件');

        // 生成详细报告按钮
        const generateReportBtn = document.getElementById('generateReportBtn');
        if (generateReportBtn) {
            generateReportBtn.removeEventListener('click', this.generateDetailedReport);
            generateReportBtn.addEventListener('click', this.generateDetailedReport.bind(this));
        }

        // 导出数据按钮
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.removeEventListener('click', this.exportLearningData);
            exportDataBtn.addEventListener('click', this.exportLearningData.bind(this));
        }

        // 清除数据按钮
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.removeEventListener('click', this.clearAllLearningData);
            clearDataBtn.addEventListener('click', this.clearAllLearningData.bind(this));
        }

        // 关闭报告按钮
        const closeReportBtn = document.getElementById('closeReportBtn');
        if (closeReportBtn) {
            closeReportBtn.removeEventListener('click', this.closeDetailedReport);
            closeReportBtn.addEventListener('click', this.closeDetailedReport.bind(this));
        }

        console.log('✅ 统计页面事件已绑定');
    }

    /**
     * 更新统计概览
     */
    updateStatisticsOverview() {
        if (!window.learningReportManager) return;

        const overview = window.learningReportManager.getOverviewStats();
        
        // 更新概览卡片
        document.getElementById('totalStudyHours').textContent = Math.round(overview.totalStudyTime / 60) || 0;
        document.getElementById('averageAccuracy').textContent = `${overview.averageAccuracy || 0}%`;
        document.getElementById('totalQuestions').textContent = overview.totalQuestions || 0;
        document.getElementById('activeDays').textContent = overview.activeDays || 0;

        // 更新学习等级
        this.updateLearningLevel(overview.level);

        console.log('📈 统计概览已更新');
    }

    /**
     * 生成详细报告
     */
    generateDetailedReport() {
        if (!window.learningReportManager) {
            this.showNotification('学习报告系统未准备就绪', 'error');
            return;
        }

        console.log('📋 生成详细学习报告');
        this.showNotification('正在生成学习报告...', 'info');

        try {
            const report = window.learningReportManager.generateComprehensiveReport();
            this.showDetailedReport(report);
            this.showNotification('学习报告生成完成！', 'success');
        } catch (error) {
            console.error('生成学习报告失败:', error);
            this.showNotification('生成报告失败，请重试', 'error');
        }
    }

    /**
     * 更新考试类型卡片上的最高分与平均分徽标
     */
    updateExamTypeStatsBadges() {
        if (!this.examSimulatorManager) return;
        const stats = this.examSimulatorManager.getExamStats();
        const map = {
            cet4: { best: 'cet4BestScore', avg: 'cet4AvgScore' },
            cet6: { best: 'cet6BestScore', avg: 'cet6AvgScore' },
            ielts: { best: 'ieltsBestScore', avg: 'ieltsAvgScore' },
            toefl: { best: 'toeflBestScore', avg: 'toeflAvgScore' },
            postgraduate: { best: 'postgraduateBestScore', avg: 'postgraduateAvgScore' },
            tem4: { best: 'tem4BestScore', avg: 'tem4AvgScore' },
            tem8: { best: 'tem8BestScore', avg: 'tem8AvgScore' },
            gre: { best: 'greBestScore', avg: 'greAvgScore' }
        };
        Object.entries(map).forEach(([type, ids]) => {
            const s = stats.examTypeStats[type];
            const bestEl = document.getElementById(ids.best);
            const avgEl = document.getElementById(ids.avg);
            if (bestEl) bestEl.textContent = s ? (Math.round(s.bestScore) + '%') : '-';
            if (avgEl) avgEl.textContent = s ? (Math.round(s.averageScore) + '%') : '-';
        });
    }

    /**
     * 显示详细报告
     */
    showDetailedReport(report) {
        // 显示报告界面
        document.getElementById('detailedReport').classList.remove('hidden');
        
        // 更新报告生成时间
        document.getElementById('reportGeneratedAt').textContent = new Date(report.generatedAt).toLocaleString();
        
        // 滚动到报告区域
        document.getElementById('detailedReport').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 关闭详细报告
     */
    closeDetailedReport() {
        document.getElementById('detailedReport').classList.add('hidden');
    }

    /**
     * 导出学习数据
     */
    exportLearningData() {
        console.log('📤 导出学习数据');
        this.showNotification('数据导出功能开发中...', 'info');
    }

    /**
     * 清除所有学习数据
     */
    clearAllLearningData() {
        const confirmClear = confirm('⚠️ 确定要清除所有学习数据吗？此操作不可恢复！');
        
        if (!confirmClear) return;

        try {
            // 清除各模块数据
            if (window.vocabularyManager && window.vocabularyManager.resetProgress) {
                window.vocabularyManager.resetProgress();
            }
            if (window.grammarManager && window.grammarManager.resetProgress) {
                window.grammarManager.resetProgress();
            }
            if (window.listeningManager && window.listeningManager.resetProgress) {
                window.listeningManager.resetProgress();
            }
            if (window.errorBookManager && window.errorBookManager.clearAllErrors) {
                window.errorBookManager.clearAllErrors();
            }
            if (window.learningReportManager && window.learningReportManager.clearAllData) {
                window.learningReportManager.clearAllData();
            }

            this.showNotification('所有学习数据已清除！', 'success');
            
            // 重新更新统计显示
            setTimeout(() => {
                this.updateStatisticsOverview();
            }, 500);

        } catch (error) {
            console.error('清除数据失败:', error);
            this.showNotification('清除数据失败，请刷新页面重试', 'error');
        }
    }

    /**
     * 更新学习等级显示
     */
    updateLearningLevel(levelData) {
        const levelIcons = {
            'beginner': '🌱',
            'elementary': '🌿', 
            'intermediate': '🌳',
            'advanced': '🏆',
            'expert': '👑'
        };

        document.getElementById('levelIcon').textContent = levelIcons[levelData.level] || '🌱';
        document.getElementById('levelName').textContent = levelData.levelName || '初级学者';
        document.getElementById('levelProgress').style.width = `${levelData.progress || 0}%`;
        
        const nextLevel = levelData.nextLevel;
        if (nextLevel) {
            document.getElementById('progressText').textContent = `${levelData.progress}% 进度到${this.getLevelName(nextLevel)}`;
        } else {
            document.getElementById('progressText').textContent = '已达到最高等级！';
        }
    }

    /**
     * 获取等级名称
     */
    getLevelName(level) {
        const levelNames = {
            'elementary': '初中级',
            'intermediate': '中级',
            'advanced': '高级',
            'expert': '专家级'
        };
        return levelNames[level] || level;
    }

    /**
     * 更新模块统计
     */
    updateModulesStatistics() {
        if (!window.learningReportManager) return;

        window.learningReportManager.collectAllModuleData();
        const modules = window.learningReportManager.reportData.modules;
        const modulesGrid = document.getElementById('modulesGrid');
        
        const moduleNames = {
            vocabulary: '词汇学习',
            grammar: '语法练习',
            listening: '听力训练',
            reading: '阅读理解',
            vocabTest: '词汇测试',
            vocabGame: '词汇游戏'
        };

        const moduleIcons = {
            vocabulary: '📚',
            grammar: '📖',
            listening: '👂',
            reading: '📰',
            vocabTest: '✅',
            vocabGame: '🎮'
        };

        const modulesHtml = Object.entries(modules)
            .filter(([key, data]) => data.completed > 0 || data.time > 0)
            .map(([moduleKey, moduleData]) => {
                const accuracy = moduleData.accuracy || 0;
                const completedText = moduleKey === 'reading' ? `${moduleData.completed} 篇文章` : `${moduleData.completed} 道题`;
                
                return `
                    <div class="module-card">
                        <div class="module-header">
                            <div class="module-icon">${moduleIcons[moduleKey]}</div>
                            <div class="module-name">${moduleNames[moduleKey]}</div>
                        </div>
                        <div class="module-stats">
                            <div class="stat-item">
                                <span class="stat-label">学习时间</span>
                                <span class="stat-value">${moduleData.time || 0}分钟</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">准确率</span>
                                <span class="stat-value">${accuracy}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">完成数量</span>
                                <span class="stat-value">${completedText}</span>
                            </div>
                        </div>
                        <div class="module-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${accuracy}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        if (modulesHtml) {
            modulesGrid.innerHTML = modulesHtml;
        } else {
            modulesGrid.innerHTML = '<div class="no-data"><p>暂无学习数据</p></div>';
        }

        console.log('📚 模块统计已更新');
    }

    /**
     * 加载错题本页面
     */
    loadErrorBookPage() {
        console.log('加载智能错题本页面');
        
        // 防止重复加载
        if (this._errorBookPageLoading) {
            console.log('⚠️ 错题本页面正在加载中，跳过重复加载');
            return;
        }
        
        this._errorBookPageLoading = true;
        
        // 确保错题本管理器已初始化
        if (typeof ErrorBookManager !== 'undefined' && window.errorBookManager) {
            console.log('✅ 错题本管理器已就绪');
        } else {
            console.warn('⚠️ ErrorBookManager 类未找到或未初始化');
        }
        
        // 延迟绑定事件和更新数据
        setTimeout(() => {
            this.bindErrorBookEvents();
            this.updateErrorBookStats();
            
            // 如果没有错题数据，创建演示数据
            if (window.errorBookManager && window.errorBookManager.errorRecords.length === 0) {
                console.log('📝 检测到无错题数据，创建演示数据');
                this.createDemoErrors();
            }
            
            this._errorBookPageLoading = false;
        }, 100);
    }

    /**
     * 绑定错题本事件
     */
    bindErrorBookEvents() {
        const errorBookPage = document.getElementById('error-book');
        if (!errorBookPage) return;

        console.log('📝 绑定错题本事件');

        // 开始复习按钮
        const startReviewBtn = document.getElementById('startReviewBtn');
        if (startReviewBtn) {
            startReviewBtn.removeEventListener('click', this.startErrorReview);
            startReviewBtn.addEventListener('click', this.startErrorReview.bind(this));
        }

        // 查看分析按钮
        const viewAnalysisBtn = document.getElementById('viewAnalysisBtn');
        if (viewAnalysisBtn) {
            viewAnalysisBtn.removeEventListener('click', this.showErrorAnalysis);
            viewAnalysisBtn.addEventListener('click', this.showErrorAnalysis.bind(this));
        }

        // 搜索错题按钮
        const searchErrorsBtn = document.getElementById('searchErrorsBtn');
        if (searchErrorsBtn) {
            searchErrorsBtn.removeEventListener('click', this.showErrorSearch);
            searchErrorsBtn.addEventListener('click', this.showErrorSearch.bind(this));
        }

        console.log('✅ 错题本事件已绑定');
    }

    /**
     * 更新错题本统计
     */
    updateErrorBookStats() {
        if (!window.errorBookManager) return;

        const stats = window.errorBookManager.getErrorStats();
        
        document.getElementById('totalErrorCount').textContent = stats.totalErrors;
        document.getElementById('masteredCount').textContent = stats.masteredErrors;
        document.getElementById('needReviewCount').textContent = stats.needReview;
        document.getElementById('masteryRate').textContent = stats.masteryRate + '%';

        // 更新复习建议
        this.updateReviewSuggestions();
        
        // 更新最近错题列表
        this.updateRecentErrorsList();

        console.log('📊 错题本统计已更新');
    }

    /**
     * 更新复习建议
     */
    updateReviewSuggestions() {
        if (!window.errorBookManager) return;

        const analysis = window.errorBookManager.getErrorAnalysis();
        const suggestionsContainer = document.getElementById('suggestionsList');
        
        if (analysis.recommendations.length === 0) {
            suggestionsContainer.innerHTML = `
                <div class="suggestion-item">
                    <span class="suggestion-icon">🎉</span>
                    <div class="suggestion-content">
                        <h4>太棒了！</h4>
                        <p>暂时没有需要复习的错题，继续保持！</p>
                    </div>
                </div>
            `;
            return;
        }

        const suggestionsHtml = analysis.recommendations.map(rec => {
            const priorityClass = rec.priority === 'high' ? 'priority-high' : 
                                rec.priority === 'medium' ? 'priority-medium' : 'priority-low';
            
            return `
                <div class="suggestion-item ${priorityClass}">
                    <span class="suggestion-icon">${this.getSuggestionIcon(rec.type)}</span>
                    <div class="suggestion-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                    </div>
                </div>
            `;
        }).join('');

        suggestionsContainer.innerHTML = suggestionsHtml;
    }

    /**
     * 获取建议图标
     */
    getSuggestionIcon(type) {
        const icons = {
            'review': '⏰',
            'weakness': '⚠️',
            'mastery': '📈',
            'practice': '💪'
        };
        return icons[type] || '💡';
    }

    /**
     * 更新最近错题列表
     */
    updateRecentErrorsList() {
        if (!window.errorBookManager) return;

        const recentErrors = window.errorBookManager.getRecentErrors(7);
        const errorsList = document.getElementById('recentErrorsList');
        
        if (recentErrors.length === 0) {
            errorsList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">暂无最近错题记录</p>';
            return;
        }

        const moduleNames = {
            'vocabulary': '词汇学习',
            'grammar': '语法练习',
            'listening': '听力训练',
            'reading': '阅读理解',
            'vocabTest': '词汇测试',
            'vocabGame': '词汇游戏'
        };

        const errorsHtml = recentErrors.slice(0, 5).map(error => `
            <div class="error-item">
                <div class="error-info">
                    <div class="error-module">${moduleNames[error.module] || error.module}</div>
                    <div class="error-question">${error.question.substring(0, 60)}${error.question.length > 60 ? '...' : ''}</div>
                    <div class="error-meta">${new Date(error.date).toLocaleDateString()} · ${error.mastered ? '已掌握' : '待复习'}</div>
                </div>
                <div class="error-status ${error.mastered ? 'mastered' : 'pending'}">
                    ${error.mastered ? '✅' : '⏳'}
                </div>
            </div>
        `).join('');

        errorsList.innerHTML = errorsHtml;
    }

    /**
     * 开始错题复习
     */
    startErrorReview() {
        if (!window.errorBookManager) {
            this.showNotification('错题本系统未准备就绪', 'error');
            return;
        }

        const reviewSession = window.errorBookManager.startReviewSession(10);
        
        if (!reviewSession) {
            this.showNotification('暂无需要复习的错题', 'info');
            return;
        }

        this.currentReviewSession = reviewSession;
        this.showReviewInterface(reviewSession);
        
        console.log('🔄 开始错题复习会话:', reviewSession.id);
    }

    /**
     * 显示复习界面
     */
    showReviewInterface(session) {
        // 隐藏主界面，显示复习界面
        document.querySelector('.error-overview').classList.add('hidden');
        document.querySelector('.error-book-actions').classList.add('hidden');
        document.getElementById('recentErrors').classList.add('hidden');
        document.getElementById('reviewInterface').classList.remove('hidden');

        // 更新进度信息
        document.getElementById('totalReviewCount').textContent = session.errors.length;
        
        // 显示第一题
        this.showCurrentReviewError(session);
        
        // 绑定复习界面事件
        this.bindReviewInterfaceEvents();
        
        // 开始计时
        this.startReviewTimer();
    }

    /**
     * 显示当前复习错题
     */
    showCurrentReviewError(session) {
        const currentError = session.errors[session.currentIndex];
        const errorContent = document.getElementById('errorContent');
        
        // 更新进度
        document.getElementById('currentReviewIndex').textContent = session.currentIndex + 1;
        const progress = ((session.currentIndex + 1) / session.errors.length) * 100;
        document.getElementById('reviewProgressFill').style.width = progress + '%';

        const moduleNames = {
            'vocabulary': '词汇学习',
            'grammar': '语法练习',
            'listening': '听力训练',
            'reading': '阅读理解',
            'vocabTest': '词汇测试',
            'vocabGame': '词汇游戏'
        };

        const errorHtml = `
            <div class="review-error-card">
                <div class="error-header">
                    <span class="error-module-tag">${moduleNames[currentError.module]}</span>
                    <span class="error-date">${new Date(currentError.date).toLocaleDateString()}</span>
                </div>
                
                <div class="error-question">
                    <h4>📝 题目</h4>
                    <p>${currentError.question}</p>
                </div>

                <div class="error-answers" id="errorAnswers">
                    <div class="answer-section">
                        <h5>你的答案：</h5>
                        <p class="user-answer incorrect">${currentError.userAnswer || '未作答'}</p>
                    </div>
                </div>

                <div class="error-explanation hidden" id="errorExplanation">
                    <div class="answer-section">
                        <h5>正确答案：</h5>
                        <p class="correct-answer">${currentError.correctAnswer}</p>
                    </div>
                    
                    ${currentError.explanation ? `
                        <div class="explanation-section">
                            <h5>📖 解析：</h5>
                            <p>${currentError.explanation}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        errorContent.innerHTML = errorHtml;
    }

    /**
     * 显示错题分析
     */
    showErrorAnalysis() {
        console.log('📊 显示错题分析');
        this.showNotification('错题分析功能开发中，敬请期待！', 'info');
    }

    /**
     * 显示错题搜索
     */
    showErrorSearch() {
        console.log('🔍 显示错题搜索');
        this.showNotification('错题搜索功能开发中，敬请期待！', 'info');
    }

    /**
     * 记录错题到错题本
     * @param {Object} errorData - 错题数据
     */
    recordError(errorData) {
        if (window.errorBookManager) {
            const errorRecord = window.errorBookManager.recordError(errorData);
            console.log('📝 错题已记录到错题本:', errorRecord.id);
            return errorRecord;
        } else {
            console.warn('错题本管理器未初始化，无法记录错题');
            return null;
        }
    }

    /**
     * 创建演示错题数据（用于测试）
     */
    createDemoErrors() {
        if (!window.errorBookManager) {
            console.warn('错题本管理器未初始化');
            return;
        }

        const demoErrors = [
            {
                module: 'vocabulary',
                category: 'meaning',
                knowledgePoint: 'meaning',
                question: 'The word "ambitious" means:',
                userAnswer: 'lazy',
                correctAnswer: 'having a strong desire for success or achievement',
                explanation: '"Ambitious" describes someone who has strong desires to achieve success, wealth, or power.',
                difficulty: 'medium'
            },
            {
                module: 'grammar',
                category: 'tenses',
                knowledgePoint: 'tenses',
                question: 'Choose the correct tense: "By the time you arrive, I ____ (finish) my work."',
                userAnswer: 'will finish',
                correctAnswer: 'will have finished',
                explanation: 'This is a future perfect tense, showing an action that will be completed before another future action.',
                difficulty: 'hard'
            },
            {
                module: 'listening',
                category: 'main_idea',
                knowledgePoint: 'main_idea',
                question: 'What is the main topic of the conversation?',
                userAnswer: 'travel plans',
                correctAnswer: 'job interview preparation',
                explanation: 'The speakers discuss preparing for an upcoming job interview, including what to wear and potential questions.',
                difficulty: 'medium'
            },
            {
                module: 'reading',
                category: 'inference',
                knowledgePoint: 'inference',
                question: 'What can be inferred about the author\'s attitude towards renewable energy?',
                userAnswer: 'skeptical',
                correctAnswer: 'supportive',
                explanation: 'The author uses positive language and provides evidence supporting renewable energy benefits.',
                difficulty: 'hard'
            }
        ];

        demoErrors.forEach(error => {
            this.recordError(error);
        });

        this.showNotification('已添加演示错题数据！', 'success');
        
        // 如果当前在错题本页面，更新统计
        const currentPage = document.querySelector('.page:not(.hidden)');
        if (currentPage && currentPage.id === 'error-book') {
            this.updateErrorBookStats();
        }

        console.log('✅ 演示错题数据创建完成');
    }

    loadSettingsPage() {
        console.log('加载设置页面');
        
        // 绑定设置页面事件
        if (this.settingsManager) {
            this.settingsManager.bindSettingsEvents();
            console.log('✅ 设置页面事件已绑定');
        } else {
            console.error('❌ SettingsManager 未初始化');
        }
    }

    // ===== AI推荐系统相关方法 =====

    /**
     * 初始化AI推荐系统
     */
        async initAIRecommendationSystem() {
            try {
                console.log('🤖 初始化AI智能推荐系统...');
                
                // 创建AI推荐管理器实例
                if (typeof AIRecommendationManager !== 'undefined') {
                    this.aiRecommendationManager = new AIRecommendationManager();
                    window.aiRecommendationManager = this.aiRecommendationManager;
                    
                    console.log('✅ AI推荐系统初始化成功');
                    
                    // 延迟生成初始推荐，让用户看到加载过程
                    setTimeout(() => {
                        this.loadAIRecommendations();
                    }, 1500);
                } else {
                    console.warn('⚠️ AIRecommendationManager 类未找到');
                    this.showAIErrorState();
                }
                
            } catch (error) {
                console.error('AI推荐系统初始化错误:', error);
                this.showNotification('智能推荐功能暂时不可用', 'error');
                this.showAIErrorState();
            }
        }

    /**
     * 加载AI推荐内容
     */
    loadAIRecommendations() {
        console.log('📈 加载AI推荐...');
        
        if (!this.aiRecommendationManager) {
            console.warn('⚠️ AI推荐管理器未初始化');
            return;
        }

        try {
            // 获取推荐列表
            const recommendations = this.aiRecommendationManager.getRecommendations(5);
            
            // 显示推荐
            this.displayAIRecommendations(recommendations);
            
            console.log('✅ AI推荐已加载:', recommendations.length, '条');
        } catch (error) {
            console.error('❌ 加载AI推荐失败:', error);
            this.showAIErrorState();
        }
    }

    /**
     * 显示AI推荐
     */
    displayAIRecommendations(recommendations) {
        const container = document.getElementById('aiRecommendations');
        if (!container) {
            console.warn('⚠️ AI推荐容器未找到');
            return;
        }

        // 清空加载状态
        container.innerHTML = '';

        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = `
                <div class="ai-empty">
                    <div class="empty-icon">🤖</div>
                    <p>暂时没有可用的推荐，继续学习以获取个性化建议</p>
                </div>
            `;
            return;
        }

        // 创建推荐卡片
        recommendations.forEach((rec, index) => {
            const card = document.createElement('div');
            card.className = 'ai-recommendation-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            card.innerHTML = `
                <div class="recommendation-header">
                    <div class="recommendation-icon">${rec.icon}</div>
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-priority priority-${rec.priority}">${this.getPriorityText(rec.priority)}</div>
                </div>
                <div class="recommendation-description">${rec.description}</div>
                <div class="recommendation-action">
                    <button class="btn btn-primary btn-sm" onclick="app.handleRecommendationAction('${rec.action.type}', '${rec.action.target}')">
                        ${rec.action.label}
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const texts = {
            'high': '高优先级',
            'medium': '中优先级',
            'low': '建议'
        };
        return texts[priority] || '建议';
    }

    /**
     * 处理推荐操作
     */
    handleRecommendationAction(actionType, target) {
        console.log('🎯 执行推荐操作:', actionType, target);
        
        switch (actionType) {
            case 'navigate':
                // 导航到指定页面
                if (this.router) {
                    this.router.navigate(target);
                }
                break;
                
            case 'reminder':
                this.showNotification('学习提醒功能正在开发中', 'info');
                break;
                
            case 'tip':
                this.showLearningTip(target);
                break;
                
            case 'plan':
                this.showNotification('学习计划功能正在开发中', 'info');
                break;
                
            case 'habit':
                this.showNotification('学习习惯建议功能正在开发中', 'info');
                break;
                
            case 'motivate':
                this.showMotivationalMessage();
                break;
                
            case 'challenge':
                this.showNotification('挑战模式正在开发中', 'info');
                break;
                
            case 'upgrade':
                this.showNotification('难度升级建议已记录', 'success');
                break;
                
            case 'strategy':
                this.showNotification('学习策略调整建议功能正在开发中', 'info');
                break;
                
            case 'feature':
                this.showNotification('新功能即将推出', 'info');
                break;
                
            default:
                this.showNotification('功能正在开发中', 'info');
        }
    }

    /**
     * 显示学习提示
     */
    showLearningTip(tipType) {
        const tips = {
            duration: '建议每次学习15-30分钟，保持专注度',
            break: '学习45-60分钟后休息10-15分钟，有助于记忆巩固'
        };
        
        const tip = tips[tipType] || '继续保持良好的学习习惯！';
        this.showNotification(tip, 'info');
    }

    /**
     * 显示激励消息
     */
    showMotivationalMessage() {
        const messages = [
            '您的学习习惯非常棒！继续保持这种节奏！',
            '坚持就是胜利，您已经在正确的道路上！',
            '每天的努力都在积累，您一定会成功的！',
            '优秀的学习态度，让我们继续前进！'
        ];
        
        // 基于当前时间选择消息，确保每次会话中的一致性
        const timeBasedIndex = Math.floor(Date.now() / 60000) % messages.length;
        const selectedMessage = messages[timeBasedIndex];
        this.showNotification(selectedMessage, 'success');
    }

    /**
     * 显示AI错误状态
     */
    showAIErrorState() {
        const container = document.getElementById('aiRecommendations');
        if (container) {
            container.innerHTML = `
                <div class="ai-error">
                    <div class="error-icon">⚠️</div>
                    <p>AI推荐系统暂时不可用，请稍后再试</p>
                    <button class="btn btn-outline-primary btn-sm" onclick="app.loadAIRecommendations()">
                        重新加载
                    </button>
                </div>
            `;
        }
    }

    /**
     * 记录学习会话（供AI分析使用）
     */
    recordStudySession(module, duration, score = null) {
        console.log('📊 记录学习会话:', { module, duration, score });
        
        // 更新今日学习时间统计
        this.updateDailyStudyTime(duration);
        
        if (this.aiRecommendationManager) {
            this.aiRecommendationManager.recordStudySession(module, duration, score);
            console.log('📊 学习会话已记录给AI系统:', { module, duration, score });
        }
        
        // 同时记录到游戏化系统
        if (this.gamificationManager) {
            this.gamificationManager.recordActivity({
                type: module,
                duration: duration,
                score: score,
                count: 1,
                timestamp: Date.now()
            });
        }
    }

    /**
     * 更新今日学习时间
     */
    updateDailyStudyTime(durationInSeconds) {
        const today = new Date().toDateString();
        const durationInMinutes = Math.round(durationInSeconds / 60);
        
        // 确保dailyStats已初始化
        if (!this.learningData.dailyStats) {
            this.learningData.dailyStats = {};
        }
        
        // 累加今日学习时间
        this.learningData.dailyStats[today] = (this.learningData.dailyStats[today] || 0) + durationInMinutes;
        
        // 更新总学习时间
        this.learningData.totalStudyTime = (this.learningData.totalStudyTime || 0) + durationInMinutes;
        
        console.log(`📈 今日学习时间已更新: +${durationInMinutes}分钟, 总计: ${this.learningData.dailyStats[today]}分钟`);
        
        // 保存数据并更新显示
        this.saveUserData();
    }

    // ===== 游戏化系统相关方法 =====

    /**
     * 初始化游戏化系统
     */
    async initGamificationSystem() {
        try {
            console.log('🎮 初始化游戏化系统...');
            
            // 创建游戏化管理器实例
            if (typeof GamificationManager !== 'undefined') {
                this.gamificationManager = new GamificationManager();
                window.gamificationManager = this.gamificationManager;
                
                // 设置事件监听器
                this.setupGamificationEvents();
                
                // 立即更新每日挑战显示
                setTimeout(() => {
                    this.updateDailyChallengesDisplay();
                }, 500);
                
                console.log('✅ 游戏化系统初始化成功');
            } else {
                console.warn('⚠️ GamificationManager 类未找到');
            }
            
        } catch (error) {
            console.error('游戏化系统初始化错误:', error);
            this.showNotification('游戏化功能暂时不可用', 'error');
        }
    }

    /**
     * 设置游戏化事件监听器
     */
    setupGamificationEvents() {
        // 监听游戏化更新事件
        window.addEventListener('gamificationUpdate', (event) => {
            this.updateGamificationDisplay(event.detail);
        });

        // 监听庆祝事件
        window.addEventListener('gamificationCelebration', (event) => {
            this.showGamificationCelebration(event.detail);
        });
    }

    /**
     * 更新游戏化显示
     */
    updateGamificationDisplay(data) {
        console.log('🎮 更新游戏化显示:', data);
        
        // 更新等级和经验
        const levelBadge = document.getElementById('levelBadge');
        const levelTitle = document.getElementById('levelTitle');
        const playerExp = document.getElementById('playerExp');
        const playerCoins = document.getElementById('playerCoins');
        const streakDays = document.getElementById('streakDays');
        const achievementCount = document.getElementById('achievementCount');
        const expProgress = document.getElementById('expProgress');
        const expText = document.getElementById('expText');

        if (levelBadge) levelBadge.textContent = `Lv.${data.level}`;
        if (levelTitle) levelTitle.textContent = data.levelTitle;
        if (playerExp) playerExp.textContent = data.totalExp;
        if (playerCoins) playerCoins.textContent = data.coins;
        if (streakDays) streakDays.textContent = data.streakDays;
        if (achievementCount) achievementCount.textContent = data.achievementsCount;

        // 更新经验进度条
        if (expProgress && expText && this.gamificationManager) {
            const levelInfo = this.gamificationManager.getLevelInfo();
            const progressPercent = Math.min(100, (levelInfo.experience / levelInfo.requiredForNext) * 100);
            expProgress.style.width = `${progressPercent}%`;
            expText.textContent = `${levelInfo.experience} / ${levelInfo.requiredForNext}`;
        }

        // 更新每日挑战
        this.updateDailyChallengesDisplay();
    }

    /**
     * 更新每日挑战显示
     */
    updateDailyChallengesDisplay() {
        console.log('🎯 开始更新每日挑战显示');
        
        if (!this.gamificationManager) {
            console.warn('⚠️ gamificationManager 未初始化');
            return;
        }

        const container = document.getElementById('challengesContainer');
        if (!container) {
            console.warn('⚠️ challengesContainer 元素未找到');
            return;
        }

        const challenges = this.gamificationManager.getDailyChallenges();
        console.log('🎯 获取到的挑战数量:', challenges.length);
        
        if (challenges.length === 0) {
            container.innerHTML = '<div class="challenges-loading"><p>暂无挑战</p></div>';
            return;
        }
        
        container.innerHTML = '';
        
        challenges.forEach(challenge => {
            const card = document.createElement('div');
            card.className = `challenge-card ${challenge.completed ? 'completed' : ''}`;
            
            const progressPercent = Math.min(100, (challenge.current / challenge.target) * 100);
            
            card.innerHTML = `
                <div class="challenge-header">
                    <div class="challenge-icon">${challenge.icon}</div>
                    <div class="challenge-title">${challenge.title}</div>
                    <div class="challenge-status ${challenge.completed ? 'status-completed' : 'status-progress'}">
                        ${challenge.completed ? '已完成' : '进行中'}
                    </div>
                </div>
                <div class="challenge-description">${challenge.description}</div>
                <div class="challenge-progress">
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="challenge-progress-text">${challenge.current} / ${challenge.target}</div>
                </div>
                <div class="challenge-reward">
                    <div class="reward-label">奖励</div>
                    <div class="reward-values">
                        <div class="reward-item">
                            <span>⚡</span>
                            <span>${challenge.reward.exp}</span>
                        </div>
                        <div class="reward-item">
                            <span>💰</span>
                            <span>${challenge.reward.coins}</span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    /**
     * 显示游戏化庆祝动画
     */
    showGamificationCelebration(data) {
        console.log('🎉 显示庆祝动画:', data);
        
        if (!document.body) return;
        
        // 创建庆祝覆盖层
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        
        // 根据庆祝类型显示不同动画
        if (data.type === 'achievement') {
            this.showAchievementCelebration(overlay, data.data);
        } else if (data.type === 'levelup') {
            this.showLevelUpCelebration(overlay, data.data);
        } else if (data.type === 'challenge') {
            this.showChallengeCelebration(overlay, data.data);
        } else if (data.type === 'badge') {
            this.showBadgeCelebration(overlay, data.data);
        }
        
        document.body.appendChild(overlay);
        
        // 3秒后移除
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 3000);
    }

    /**
     * 显示成就庆祝
     */
    showAchievementCelebration(overlay, achievement) {
        // 创建烟花效果
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'fireworks';
                // 基于索引计算位置，创建均匀分布的烟花效果
                firework.style.left = ((i * 37) % 100) + '%';
                firework.style.top = ((i * 23) % 80 + 10) + '%';
                overlay.appendChild(firework);
            }, i * 100);
        }
        
        // 显示通知
        this.showNotification(`🏆 解锁成就：${achievement.title}！`, 'success');
    }

    /**
     * 显示升级庆祝
     */
    showLevelUpCelebration(overlay, data) {
        // 创建升级动画
        const animation = document.createElement('div');
        animation.className = 'celebration-animation';
        animation.style.left = '50%';
        animation.style.top = '50%';
        animation.style.transform = 'translate(-50%, -50%)';
        overlay.appendChild(animation);
        
        // 显示通知
        this.showNotification(`🎉 升级到 Lv.${data.newLevel} ${data.levelTitle}！`, 'success');
    }

    /**
     * 显示挑战完成庆祝
     */
    showChallengeCelebration(overlay, challenge) {
        // 创建彩带效果
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'fireworks';
                // 基于索引计算水平位置
                firework.style.left = ((i * 31) % 100) + '%';
                firework.style.top = '20%';
                overlay.appendChild(firework);
            }, i * 50);
        }
        
        // 显示通知
        this.showNotification(`🎯 完成挑战：${challenge.title}！`, 'success');
    }

    /**
     * 显示徽章获得庆祝
     */
    showBadgeCelebration(overlay, badge) {
        // 简单的庆祝动画
        const animation = document.createElement('div');
        animation.className = 'celebration-animation';
        animation.style.left = '25%';
        animation.style.top = '25%';
        overlay.appendChild(animation);
        
        // 显示通知
        this.showNotification(`🎖️ 获得徽章：${badge.name}！`, 'success');
    }

    /**
     * 设置AI事件监听器
     */
    setupAIEventListeners() {
        if (!this.aiRecommendationManager) return;

        // 监听推荐生成完成事件
        this.aiRecommendationManager.addEventListener('recommendationsGenerated', (event) => {
            const { recommendations, weaknessAnalysis } = event.detail;
            this.onRecommendationsGenerated(recommendations, weaknessAnalysis);
        });

        // 监听薄弱点分析完成事件
        this.aiRecommendationManager.addEventListener('weaknessAnalysisCompleted', (event) => {
            const { analysis } = event.detail;
            this.onWeaknessAnalysisCompleted(analysis);
        });

        // 监听学习路径生成事件
        this.aiRecommendationManager.addEventListener('learningPathGenerated', (event) => {
            const { learningPath } = event.detail;
            this.onLearningPathGenerated(learningPath);
        });

        // 监听错误事件
        this.aiRecommendationManager.addEventListener('error', (event) => {
            const { type, error } = event.detail;
            this.onAIError(type, error);
        });
    }

    /**
     * 生成初始推荐
     */
    async generateInitialRecommendations() {
        try {
            if (!this.aiRecommendationManager) return;

            // 构建学习上下文
            const context = {
                examType: this.currentExamType,
                timeOfDay: this.getTimeOfDay(),
                deviceType: this.getDeviceType(),
                availableTime: 30 // 默认30分钟
            };

            // 生成推荐
            const recommendations = await this.aiRecommendationManager.generateRecommendations(context);
            
            // 更新界面
            this.updateRecommendationsDisplay(recommendations);
            
        } catch (error) {
            console.error('生成初始推荐失败:', error);
        }
    }

    /**
     * 推荐生成完成处理
     */
    onRecommendationsGenerated(recommendations, weaknessAnalysis) {
        console.log('📋 收到新推荐:', recommendations.length, '个');
        
        // 更新当前推荐
        this.currentRecommendations = recommendations;
        
        // 更新界面显示
        this.updateRecommendationsDisplay(recommendations);
        
        // 更新薄弱点提示
        this.updateWeaknessDisplay(weaknessAnalysis);
        
        // 显示通知
        this.showNotification(`为您推荐了 ${recommendations.length} 个学习内容`, 'info');
    }

    /**
     * 薄弱点分析完成处理
     */
    onWeaknessAnalysisCompleted(analysis) {
        console.log('🔍 薄弱点分析完成:', analysis);
        
        // 更新薄弱点显示
        this.updateWeaknessDisplay(analysis);
        
        // 如果有严重薄弱点，显示特别提醒
        const criticalWeaknesses = analysis.overall.primaryWeaknesses?.filter(w => w.priority === 'high');
        if (criticalWeaknesses && criticalWeaknesses.length > 0) {
            const weaknessNames = criticalWeaknesses.map(w => this.getModuleName(w.module)).join('、');
            this.showNotification(`建议重点关注：${weaknessNames}`, 'warning');
        }
    }

    /**
     * 学习路径生成完成处理
     */
    onLearningPathGenerated(learningPath) {
        console.log('🛤️ 学习路径已生成:', learningPath);
        
        // 更新学习路径显示
        this.updateLearningPathDisplay(learningPath);
    }

    /**
     * AI错误处理
     */
    onAIError(errorType, error) {
        console.error(`AI系统错误 [${errorType}]:`, error);
        
        const errorMessages = {
            initialization: 'AI系统初始化失败',
            recommendation_generation: '推荐生成失败',
            weakness_analysis: '薄弱点分析失败',
            learning_path_generation: '学习路径生成失败'
        };
        
        const message = errorMessages[errorType] || 'AI系统发生未知错误';
        this.showNotification(message, 'error');
    }

    /**
     * 记录学习活动
     */
    recordLearningActivity(activityType, activityData) {
        if (!this.aiRecommendationManager) return;

        const activity = {
            type: activityType,
            ...activityData,
            timestamp: Date.now(),
            examType: this.currentExamType
        };

        // 发送到AI推荐系统
        this.aiRecommendationManager.recordLearningActivity(activity);

        // 更新本地学习数据
        this.updateLearningData(activity);
    }

    /**
     * 更新推荐显示
     */
    updateRecommendationsDisplay(recommendations) {
        // 查找推荐容器
        const recommendationContainer = document.getElementById('studyRecommendations');
        if (!recommendationContainer) {
            console.warn('未找到推荐显示容器');
            return;
        }

        // 清空现有内容
        recommendationContainer.innerHTML = '';

        // 添加标题
        const title = document.createElement('h3');
        title.textContent = '🤖 AI智能推荐';
        title.className = 'recommendation-title';
        recommendationContainer.appendChild(title);

        // 创建推荐列表
        const recommendationList = document.createElement('div');
        recommendationList.className = 'recommendation-list';

        recommendations.forEach((rec, index) => {
            const recItem = this.createRecommendationItem(rec, index);
            recommendationList.appendChild(recItem);
        });

        recommendationContainer.appendChild(recommendationList);
    }

    /**
     * 创建推荐项
     */
    createRecommendationItem(recommendation, index) {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.dataset.recommendationId = recommendation.content.id;

        const confidence = Math.round(recommendation.confidence * 100);
        const estimatedTime = recommendation.content.estimatedTime || 15;

        item.innerHTML = `
            <div class="recommendation-rank">#${index + 1}</div>
            <div class="recommendation-content">
                <div class="recommendation-header">
                    <h4 class="recommendation-title">${recommendation.content.title}</h4>
                    <div class="recommendation-meta">
                        <span class="confidence">置信度: ${confidence}%</span>
                        <span class="time">⏱️ ${estimatedTime}分钟</span>
                    </div>
                </div>
                <div class="recommendation-reason">${recommendation.explanation}</div>
                <div class="recommendation-actions">
                    <button class="btn btn-primary btn-sm" onclick="app.startRecommendedActivity('${recommendation.content.id}')">
                        开始学习
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="app.viewRecommendationDetails('${recommendation.content.id}')">
                        查看详情
                    </button>
                </div>
            </div>
        `;

        return item;
    }

    /**
     * 开始推荐的学习活动
     */
    startRecommendedActivity(contentId) {
        const recommendation = this.currentRecommendations.find(rec => rec.content.id === contentId);
        if (!recommendation) {
            console.error('未找到推荐内容:', contentId);
            return;
        }

        console.log('🎯 开始推荐的学习活动:', recommendation.content.title);

        // 记录活动开始
        this.recordLearningActivity('recommendation_started', {
            contentId: contentId,
            contentType: recommendation.content.type,
            confidence: recommendation.confidence,
            algorithm: recommendation.algorithm
        });

        // 根据内容类型跳转到相应页面
        switch (recommendation.content.type) {
            case 'vocabulary':
                this.router.navigate('vocabulary');
                break;
            case 'grammar':
                this.router.navigate('grammar');
                break;
            case 'listening':
                this.router.navigate('listening');
                break;
            case 'reading':
                this.router.navigate('reading');
                break;
            default:
                this.showNotification('该类型的学习内容即将上线', 'info');
        }

        // 显示开始学习通知
        this.showNotification(`开始学习：${recommendation.content.title}`, 'success');
    }

    /**
     * 查看推荐详情
     */
    viewRecommendationDetails(contentId) {
        const recommendation = this.currentRecommendations.find(rec => rec.content.id === contentId);
        if (!recommendation) return;

        // 显示详情模态框
        this.showRecommendationDetailsModal(recommendation);
    }

    /**
     * 显示推荐详情模态框
     */
    showRecommendationDetailsModal(recommendation) {
        const modal = document.getElementById('modal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');

        modalTitle.textContent = recommendation.content.title;

        modalBody.innerHTML = `
            <div class="recommendation-details">
                <div class="detail-section">
                    <h5>📊 推荐信息</h5>
                    <ul>
                        <li><strong>内容类型：</strong>${this.getContentTypeName(recommendation.content.type)}</li>
                        <li><strong>难度等级：</strong>${this.getDifficultyName(recommendation.content.difficulty)}</li>
                        <li><strong>预计时间：</strong>${recommendation.content.estimatedTime || 15}分钟</li>
                        <li><strong>置信度：</strong>${Math.round(recommendation.confidence * 100)}%</li>
                    </ul>
                </div>
                <div class="detail-section">
                    <h5>🎯 推荐理由</h5>
                    <p>${recommendation.explanation}</p>
                </div>
                <div class="detail-section">
                    <h5>📈 预期收益</h5>
                    <ul>
                        <li><strong>整体提升：</strong>${Math.round((recommendation.estimatedBenefit?.overall || 0.6) * 100)}%</li>
                        <li><strong>短期效果：</strong>${Math.round((recommendation.estimatedBenefit?.shortTerm || 0.5) * 100)}%</li>
                        <li><strong>长期效果：</strong>${Math.round((recommendation.estimatedBenefit?.longTerm || 0.7) * 100)}%</li>
                    </ul>
                </div>
            </div>
        `;

        Modal.show();
    }

    /**
     * 更新薄弱点显示
     */
    updateWeaknessDisplay(weaknessAnalysis) {
        // 查找薄弱点显示容器
        const weaknessContainer = document.querySelector('.weakness-analysis');
        if (!weaknessContainer) return;

        const primaryWeaknesses = weaknessAnalysis.overall.primaryWeaknesses || [];
        
        if (primaryWeaknesses.length === 0) {
            weaknessContainer.innerHTML = '<p class="no-weakness">🎉 暂未发现明显薄弱点，继续保持！</p>';
            return;
        }

        let html = '<h4>🔍 学习薄弱点分析</h4><div class="weakness-list">';
        
        primaryWeaknesses.slice(0, 3).forEach(weakness => {
            const moduleName = this.getModuleName(weakness.module);
            const severityClass = this.getSeverityClass(weakness.severity);
            const score = Math.round(weakness.score * 100);
            
            html += `
                <div class="weakness-item ${severityClass}">
                    <div class="weakness-module">${moduleName}</div>
                    <div class="weakness-score">${score}%</div>
                    <div class="weakness-priority">${this.getPriorityText(weakness.priority)}</div>
                </div>
            `;
        });
        
        html += '</div>';
        weaknessContainer.innerHTML = html;
    }

    /**
     * 更新学习路径显示
     */
    updateLearningPathDisplay(learningPath) {
        // 这里可以实现学习路径的可视化显示
        console.log('更新学习路径显示:', learningPath);
    }

    /**
     * 获取内容类型名称
     */
    getContentTypeName(type) {
        const typeNames = {
            vocabulary: '词汇学习',
            grammar: '语法练习',
            listening: '听力训练',
            reading: '阅读理解',
            writing: '写作练习',
            speaking: '口语练习'
        };
        return typeNames[type] || type;
    }

    /**
     * 获取难度名称
     */
    getDifficultyName(difficulty) {
        if (difficulty < 0.3) return '简单';
        if (difficulty < 0.6) return '中等';
        if (difficulty < 0.8) return '困难';
        return '极难';
    }

    /**
     * 获取模块名称
     */
    getModuleName(module) {
        const moduleNames = {
            vocabulary: '词汇',
            grammar: '语法',
            listening: '听力',
            reading: '阅读',
            writing: '写作',
            speaking: '口语'
        };
        return moduleNames[module] || module;
    }

    /**
     * 获取严重程度样式类
     */
    getSeverityClass(severity) {
        switch (severity) {
            case 'high': return 'severity-high';
            case 'medium': return 'severity-medium';
            case 'low': return 'severity-low';
            default: return '';
        }
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const priorityTexts = {
            high: '高优先级',
            medium: '中优先级',
            low: '低优先级'
        };
        return priorityTexts[priority] || priority;
    }

    /**
     * 获取时间段
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 6) return 'early_morning';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        if (hour < 22) return 'evening';
        return 'night';
    }

    /**
     * 获取设备类型
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    /**
     * 更新学习数据
     */
    updateLearningData(activity) {
        // 更新学习统计
        if (!this.learningData.activities) {
            this.learningData.activities = [];
        }
        
        this.learningData.activities.push(activity);
        
        // 保存数据
        this.saveUserData();
    }

    /**
     * 显示AI系统错误状态
     */
    showAIErrorState() {
        const recommendationContainer = document.querySelector('.ai-recommendations .recommendation-loading');
        const analysisContainer = document.querySelector('.weakness-analysis .analysis-loading');
        
        if (recommendationContainer) {
            recommendationContainer.innerHTML = `
                <div class="ai-error-state">
                    <p>⚠️ AI推荐系统暂时不可用</p>
                    <button class="retry-ai-btn" data-action="retry-ai">重试</button>
                </div>
            `;
        }
        
        if (analysisContainer) {
            analysisContainer.innerHTML = `
                <div class="ai-error-state">
                    <p>⚠️ 薄弱点分析暂时不可用</p>
                </div>
            `;
        }
    }

    /**
     * 重试AI系统初始化
     */
    async retryAIInitialization() {
        // 重置显示状态
        const recommendationContainer = document.querySelector('.ai-recommendations .recommendation-loading');
        const analysisContainer = document.querySelector('.weakness-analysis .analysis-loading');
        
        if (recommendationContainer) {
            recommendationContainer.innerHTML = '<p>🔄 正在重新初始化AI系统...</p>';
        }
        
        if (analysisContainer) {
            analysisContainer.innerHTML = '<p>📊 正在重新分析学习表现...</p>';
        }
        
        // 重新初始化AI系统
        await this.initAIRecommendationSystem();
    }

    /**
     * 刷新推荐内容
     */
    async refreshRecommendations() {
        if (!this.aiRecommendationManager) {
            this.showNotification('AI推荐系统未初始化', 'warning');
            return;
        }

        try {
            const container = document.querySelector('.ai-recommendations .recommendation-loading');
            if (container && !container.querySelector('.recommendation-list')) {
                container.innerHTML = '<p>🔄 正在刷新推荐...</p>';
            }

            await this.generateInitialRecommendations();
            this.showNotification('推荐内容已刷新', 'success');
        } catch (error) {
            console.error('刷新推荐失败:', error);
            this.showNotification('刷新推荐失败', 'error');
        }
    }

    /**
     * 添加学习活动记录（供其他模块调用）
     */
    async addLearningActivity(activity) {
        try {
            if (this.aiRecommendationManager) {
                await this.aiRecommendationManager.recordLearningActivity(activity);
                console.log('📝 学习活动已记录:', activity);
            }
        } catch (error) {
            console.error('记录学习活动失败:', error);
        }
    }

    /**
     * 获取学习统计信息
     */
    async getLearningStats() {
        try {
            const learningData = await Storage.get('learning_data', {});
            const activities = learningData.activities || [];
            
            const stats = {
                totalActivities: activities.length,
                moduleStats: {},
                recentPerformance: activities.slice(-10),
                averageScore: 0
            };

            // 计算各模块统计
            const modules = ['vocabulary', 'grammar', 'listening', 'reading'];
            modules.forEach(module => {
                const moduleActivities = activities.filter(a => a.module === module);
                const correctCount = moduleActivities.filter(a => a.isCorrect).length;
                
                stats.moduleStats[module] = {
                    total: moduleActivities.length,
                    correct: correctCount,
                    accuracy: moduleActivities.length > 0 ? (correctCount / moduleActivities.length * 100).toFixed(1) : 0,
                    averageTime: moduleActivities.length > 0 ? 
                        Math.round(moduleActivities.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / moduleActivities.length) : 0
                };
            });

            // 计算平均分数
            const scoresSum = activities.reduce((sum, a) => sum + (a.score || 0), 0);
            stats.averageScore = activities.length > 0 ? (scoresSum / activities.length).toFixed(1) : 0;

            return stats;
        } catch (error) {
            console.error('获取学习统计失败:', error);
            return null;
        }
    }

    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'app-loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <div class="loading-logo">
                    <div class="logo-animation">📚</div>
                    <h2>LearnSphere AI</h2>
                </div>
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">正在加载智能学习系统...</div>
            </div>
        `;

        const styles = `
            <style>
                #app-loading-screen {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000; opacity: 1; transition: opacity 0.5s ease;
                }
                .loading-content { text-align: center; color: white; }
                .loading-logo { margin-bottom: 2rem; }
                .logo-animation { font-size: 4rem; margin-bottom: 1rem; animation: bounce 2s infinite; }
                .loading-logo h2 { font-size: 2rem; font-weight: 300; margin: 0; opacity: 0.9; }
                .loading-spinner { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; }
                .spinner-ring { width: 12px; height: 12px; border-radius: 50%; background: rgba(255,255,255,0.8); animation: pulse 1.5s ease-in-out infinite; }
                .spinner-ring:nth-child(2) { animation-delay: 0.3s; }
                .spinner-ring:nth-child(3) { animation-delay: 0.6s; }
                .loading-text { font-size: 1.1rem; opacity: 0.8; }
                @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-20px); } 60% { transform: translateY(-10px); } }
                @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(loadingScreen);
    }

    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('app-loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.remove(), 500);
            }
        }, 1500);
    }

    /**
     * 初始化性能监控
     */
    initPerformanceMonitoring() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.timing;
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    console.log(`📊 页面加载时间: ${loadTime}ms`);
                    if (loadTime > 3000) this.showPerformanceHint();
                }, 0);
            });
        }
    }

    /**
     * 显示性能优化提示
     */
    showPerformanceHint() {
        const hint = document.createElement('div');
        hint.className = 'performance-hint';
        hint.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>⚡</span>
                <span style="flex: 1; font-size: 0.9rem;">检测到加载较慢，建议刷新页面</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer;">&times;</button>
            </div>
        `;

        const styles = `
            <style>
                .performance-hint {
                    position: fixed; top: 20px; right: 20px; background: #fff3cd;
                    border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem;
                    max-width: 300px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    animation: slideInRight 0.3s ease;
                }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(hint);
        setTimeout(() => hint.remove(), 5000);
    }

    /**
     * 初始化页面动画
     */
    initPageAnimations() {
        const cards = document.querySelectorAll('.card, .ai-tool-card, .mode-card, .exam-card');
        cards.forEach((card, index) => {
            card.classList.add('fade-in');
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    /**
     * 初始化音频解锁器，用于解决浏览器自动播放策略问题
     */
    initAudioUnlocker() {
        const unlocker = document.getElementById('audioUnlocker');
        if (!unlocker) return;

        const unlockAudio = () => {
            console.log('🔓 尝试解锁音频上下文...');
            // 定义一个极短的无声WAV文件
            const silentWav = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
            unlocker.src = silentWav;
            
            const promise = unlocker.play();
            if (promise !== undefined) {
                promise.then(() => {
                    console.log('✅ 音频上下文已成功解锁。');
                    // 成功后立即移除监听器，确保只执行一次
                    document.body.removeEventListener('click', unlockAudio, true);
                    document.body.removeEventListener('keydown', unlockAudio, true);
                }).catch(error => {
                    console.warn('⚠️ 音频解锁失败（这在某些情况下是正常的）:', error);
                });
            }
             // 无论成功与否都移除，避免重复触发
             document.body.removeEventListener('click', unlockAudio, true);
             document.body.removeEventListener('keydown', unlockAudio, true);
        };

        // 在捕获阶段监听，确保尽早触发
        document.body.addEventListener('click', unlockAudio, true);
        document.body.addEventListener('keydown', unlockAudio, true);
    }
}

// 全局应用实例
let app;

// DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    app = new EnglishExamApp();
    window.app = app; // 设置全局引用
    console.log('✅ 应用实例已设置为全局变量');
});

// 导出到全局作用域
window.EnglishExamApp = EnglishExamApp;
