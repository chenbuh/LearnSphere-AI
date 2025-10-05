/**
 * 导航优化器
 * 提供智能导航和学习流程优化
 */

class NavigationOptimizer {
    constructor() {
        this.navigationHistory = [];
        this.userPreferences = {};
        this.learningPath = [];
        this.currentStep = 0;
        this.breadcrumbs = [];
        
        this.init();
    }

    init() {
        console.log('🧭 导航优化器已初始化');
        this.setupNavigationTracking();
        this.createSmartNavigation();
        this.setupLearningPathGuide();
        this.addNavigationEnhancements();
        this.optimizePerformance();
    }

    /**
     * 性能优化
     */
    optimizePerformance() {
        // 预加载常用页面资源
        this.preloadCommonResources();
        
        // 优化导航栏渲染
        this.optimizeNavbarRendering();
        
        // 添加防抖处理
        this.addDebouncing();
        
        // 优化布局稳定性
        this.optimizeLayoutStability();
        
        console.log('⚡ 导航栏性能优化已启用');
    }

    /**
     * 预加载常用资源
     */
    preloadCommonResources() {
        const commonPages = ['vocabulary', 'grammar', 'reading'];
        
        // 使用 Intersection Observer 检测导航栏是否可见
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 导航栏可见时开始预加载
                    this.startPreloading(commonPages);
                    observer.disconnect();
                }
            });
        });

        const navbar = document.querySelector('.navbar');
        if (navbar) {
            observer.observe(navbar);
        }
    }

    /**
     * 开始预加载
     */
    startPreloading(pages) {
        pages.forEach((page, index) => {
            // 延迟预加载，避免阻塞主线程
            setTimeout(() => {
                this.preloadPageResources(page);
            }, index * 100);
        });
    }

    /**
     * 预加载页面资源
     */
    preloadPageResources(pageId) {
        // 预加载现有的CSS文件
        const cssFiles = {
            'reading': '/src/css/reading-comprehension.css',
            'statistics': '/src/css/statistics.css',
            'profile': '/src/css/profile.css'
        };

        if (cssFiles[pageId]) {
            // 检查文件是否存在再预加载
            fetch(cssFiles[pageId], { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.href = cssFiles[pageId];
                        document.head.appendChild(link);
                        console.log(`🔗 预加载CSS: ${cssFiles[pageId]}`);
                    }
                })
                .catch(() => {
                    // 文件不存在，跳过预加载
                    console.log(`⚠️ CSS文件不存在，跳过预加载: ${cssFiles[pageId]}`);
                });
        }

        // 预加载现有的JS管理器文件
        const jsFiles = {
            'vocabulary': '/src/js/vocabulary-manager.js',
            'grammar': '/src/js/grammar-manager.js',
            'reading': '/src/js/reading-manager.js',
            'writing': '/src/js/writing-manager.js',
            'statistics': '/src/js/real-data-statistics.js'
        };

        if (jsFiles[pageId]) {
            // 检查文件是否存在再预加载
            fetch(jsFiles[pageId], { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.href = jsFiles[pageId];
                        document.head.appendChild(link);
                        console.log(`🔗 预加载JS: ${jsFiles[pageId]}`);
                    }
                })
                .catch(() => {
                    // 文件不存在，跳过预加载
                    console.log(`⚠️ JS文件不存在，跳过预加载: ${jsFiles[pageId]}`);
                });
        }
    }

    /**
     * 优化导航栏渲染
     */
    optimizeNavbarRendering() {
        // 使用 requestAnimationFrame 优化动画
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            let animationId = null;
            
            item.addEventListener('mouseenter', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                
                animationId = requestAnimationFrame(() => {
                    item.style.transform = 'translateY(-2px)';
                });
            });
            
            item.addEventListener('mouseleave', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                
                animationId = requestAnimationFrame(() => {
                    item.style.transform = 'translateY(0)';
                });
            });
        });
    }

    /**
     * 添加防抖处理
     */
    addDebouncing() {
        // 防抖导航历史记录
        let trackingTimeout = null;
        const originalTrackNavigation = this.trackNavigation.bind(this);
        
        this.trackNavigation = (fromPage, toPage) => {
            if (trackingTimeout) {
                clearTimeout(trackingTimeout);
            }
            
            trackingTimeout = setTimeout(() => {
                originalTrackNavigation(fromPage, toPage);
            }, 100);
        };

        // 防抖窗口滚动事件
        let scrollTimeout = null;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                this.updateScrollBasedFeatures();
            }, 16); // 约60fps
        }, { passive: true });
    }

    /**
     * 更新基于滚动的功能
     */
    updateScrollBasedFeatures() {
        const scrollY = window.scrollY;
        const header = document.querySelector('.header');
        
        if (header) {
            // 滚动时调整导航栏透明度
            const opacity = Math.min(1, scrollY / 100);
            header.style.setProperty('--header-opacity', opacity);
        }
    }

    /**
     * 减少布局偏移的优化
     */
    optimizeLayoutStability() {
        // 为动态内容预设尺寸
        this.presetDynamicContentSizes();
        
        // 使用骨架屏
        this.addSkeletonScreens();
        
        // 优化图片加载
        this.optimizeImageLoading();
        
        console.log('📐 布局稳定性优化已启用');
    }

    /**
     * 为动态内容预设尺寸
     */
    presetDynamicContentSizes() {
        const dynamicSections = document.querySelectorAll(
            '.ai-recommendations-section, .daily-challenges-section, .learning-progress-section'
        );
        
        dynamicSections.forEach(section => {
            if (!section.style.minHeight) {
                section.style.minHeight = '200px';
            }
        });
    }

    /**
     * 添加骨架屏
     */
    addSkeletonScreens() {
        const loadingElements = document.querySelectorAll('[data-loading="true"]');
        
        loadingElements.forEach(element => {
            if (!element.classList.contains('skeleton')) {
                element.classList.add('skeleton');
                
                // 内容加载完成后移除骨架屏
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && 
                            mutation.attributeName === 'data-loading' &&
                            element.getAttribute('data-loading') === 'false') {
                            element.classList.remove('skeleton');
                            observer.disconnect();
                        }
                    });
                });
                
                observer.observe(element, { attributes: true });
            }
        });
    }

    /**
     * 优化图片加载
     */
    optimizeImageLoading() {
        const images = document.querySelectorAll('img:not([width]):not([height])');
        
        images.forEach(img => {
            // 为没有尺寸的图片设置默认尺寸
            if (!img.width && !img.height) {
                img.style.aspectRatio = '16/9';
                img.style.backgroundColor = '#f0f0f0';
            }
            
            // 图片加载完成后移除背景色
            img.addEventListener('load', () => {
                img.style.backgroundColor = 'transparent';
            }, { once: true });
        });
    }

    /**
     * 设置导航追踪
     */
    setupNavigationTracking() {
        // 监听路由变化
        window.addEventListener('hashchange', (e) => {
            const newPage = window.location.hash.replace('#', '') || 'home';
            const oldPage = e.oldURL ? new URL(e.oldURL).hash.replace('#', '') : '';
            
            this.trackNavigation(oldPage, newPage);
            this.updateBreadcrumbs(newPage);
        });

        // 监听页面加载
        window.addEventListener('load', () => {
            const currentPage = window.location.hash.replace('#', '') || 'home';
            this.trackNavigation('', currentPage);
            this.updateBreadcrumbs(currentPage);
        });
    }

    /**
     * 追踪导航行为
     */
    trackNavigation(fromPage, toPage) {
        const navigationEvent = {
            from: fromPage,
            to: toPage,
            timestamp: Date.now(),
            method: this.getNavigationMethod()
        };

        this.navigationHistory.push(navigationEvent);
        this.analyzeNavigationPattern();
        
        console.log('🧭 导航追踪:', navigationEvent);

        // 限制历史记录大小
        if (this.navigationHistory.length > 100) {
            this.navigationHistory = this.navigationHistory.slice(-50);
        }
    }

    /**
     * 获取导航方式
     */
    getNavigationMethod() {
        // 简单的导航方式检测
        const performance = window.performance;
        const entries = performance.getEntriesByType('navigation');
        
        if (entries.length > 0) {
            return entries[0].type || 'unknown';
        }
        
        return 'hash_change';
    }

    /**
     * 分析导航模式
     */
    analyzeNavigationPattern() {
        if (this.navigationHistory.length < 5) return;

        const recentHistory = this.navigationHistory.slice(-10);
        const patterns = {};

        // 分析常用路径
        recentHistory.forEach(nav => {
            const pattern = `${nav.from}->${nav.to}`;
            patterns[pattern] = (patterns[pattern] || 0) + 1;
        });

        // 找出最常用的导航模式
        const mostCommon = Object.entries(patterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        if (mostCommon.length > 0) {
            console.log('🔍 常用导航模式:', mostCommon);
            this.suggestNavigationShortcuts(mostCommon);
        }
    }

    /**
     * 建议导航快捷方式
     */
    suggestNavigationShortcuts(patterns) {
        const shortcuts = patterns.map(([pattern, count]) => {
            const [from, to] = pattern.split('->');
            return {
                from,
                to,
                count,
                shortcut: this.generateShortcut(from, to)
            };
        });

        // 显示快捷方式建议
        this.showShortcutSuggestions(shortcuts);
    }

    /**
     * 生成快捷方式
     */
    generateShortcut(from, to) {
        const shortcuts = {
            'home->vocabulary': 'Alt+V',
            'home->grammar': 'Alt+G',
            'home->listening': 'Alt+L',
            'home->reading': 'Alt+R',
            'home->writing': 'Alt+W',
            'vocabulary->vocab-test': 'Alt+T',
            'grammar->grammar-test': 'Alt+T'
        };

        return shortcuts[`${from}->${to}`] || null;
    }

    /**
     * 显示快捷方式建议
     */
    showShortcutSuggestions(shortcuts) {
        if (shortcuts.length === 0) return;

        const suggestion = shortcuts[0];
        if (suggestion.shortcut && suggestion.count >= 3) {
            setTimeout(() => {
                if (window.Notification) {
                    window.Notification.info(
                        `💡 提示：您经常从${this.getPageName(suggestion.from)}跳转到${this.getPageName(suggestion.to)}，可以使用快捷键 ${suggestion.shortcut}`,
                        { duration: 5000, title: '导航优化建议' }
                    );
                }
            }, 2000);
        }
    }

    /**
     * 获取页面名称
     */
    getPageName(pageId) {
        const pageNames = {
            'home': '首页',
            'vocabulary': '词汇学习',
            'grammar': '语法练习',
            'listening': '听力训练',
            'reading': '阅读理解',
            'writing': '写作练习',
            'vocab-test': '词汇测试',
            'statistics': '学习统计'
        };

        return pageNames[pageId] || pageId;
    }

    /**
     * 创建智能导航
     */
    createSmartNavigation() {
        // this.createQuickAccessPanel();
        this.createNavigationAssistant();
        this.setupKeyboardShortcuts();
    }

    /**
     * 创建快速访问面板
     */
    createQuickAccessPanel() {
        const quickAccess = document.createElement('div');
        quickAccess.id = 'quick-access-panel';
        quickAccess.className = 'quick-access-panel';
        quickAccess.innerHTML = `
            <div class="quick-access-toggle">
                <button class="quick-access-btn" title="快速导航 (Alt+Q)">
                    🚀
                </button>
            </div>
            <div class="quick-access-content">
                <div class="quick-access-header">
                    <h4>快速导航</h4>
                    <button class="close-quick-access">&times;</button>
                </div>
                <div class="quick-access-items">
                    ${this.renderQuickAccessItems()}
                </div>
                <div class="recent-pages">
                    <h5>最近访问</h5>
                    <div class="recent-list" id="recent-pages-list">
                        <!-- 最近页面将动态添加 -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(quickAccess);
        this.bindQuickAccessEvents(quickAccess);
        this.addQuickAccessStyles();
    }

    /**
     * 渲染快速访问项目
     */
    renderQuickAccessItems() {
        const items = [
            { id: 'home', name: '首页', icon: '🏠', shortcut: 'Alt+H' },
            { id: 'vocabulary', name: '词汇学习', icon: '📚', shortcut: 'Alt+V' },
            { id: 'grammar', name: '语法练习', icon: '📝', shortcut: 'Alt+G' },
            { id: 'listening', name: '听力训练', icon: '🎧', shortcut: 'Alt+L' },
            { id: 'reading', name: '阅读理解', icon: '📖', shortcut: 'Alt+R' },
            { id: 'writing', name: '写作练习', icon: '✍️', shortcut: 'Alt+W' },
            { id: 'vocab-test', name: '词汇测试', icon: '📋', shortcut: 'Alt+T' },
            { id: 'statistics', name: '学习统计', icon: '📊', shortcut: 'Alt+S' }
        ];

        return items.map(item => `
            <div class="quick-access-item" data-page="${item.id}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-shortcut">${item.shortcut}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 绑定快速访问事件
     */
    bindQuickAccessEvents(panel) {
        const toggleBtn = panel.querySelector('.quick-access-btn');
        const content = panel.querySelector('.quick-access-content');
        const closeBtn = panel.querySelector('.close-quick-access');
        const items = panel.querySelectorAll('.quick-access-item');

        // 切换面板
        toggleBtn.addEventListener('click', () => {
            content.classList.toggle('show');
            this.updateRecentPages();
        });

        // 关闭面板
        closeBtn.addEventListener('click', () => {
            content.classList.remove('show');
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target)) {
                content.classList.remove('show');
            }
        });

        // 快速访问项目点击
        items.forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.page;
                this.navigateToPage(pageId);
                content.classList.remove('show');
            });
        });
    }

    /**
     * 导航到页面
     */
    navigateToPage(pageId) {
        if (window.app && typeof window.app.showPage === 'function') {
            window.app.showPage(pageId);
        } else {
            window.location.hash = pageId;
        }
    }

    /**
     * 更新最近页面
     */
    updateRecentPages() {
        const recentList = document.getElementById('recent-pages-list');
        if (!recentList) return;

        const recentPages = this.getRecentPages();
        recentList.innerHTML = recentPages.map(page => `
            <div class="recent-item" data-page="${page.id}">
                <span class="recent-icon">${this.getPageIcon(page.id)}</span>
                <span class="recent-name">${this.getPageName(page.id)}</span>
                <span class="recent-time">${this.formatTime(page.timestamp)}</span>
            </div>
        `).join('');

        // 绑定点击事件
        recentList.querySelectorAll('.recent-item').forEach(item => {
            item.addEventListener('click', () => {
                const pageId = item.dataset.page;
                this.navigateToPage(pageId);
                document.querySelector('.quick-access-content').classList.remove('show');
            });
        });
    }

    /**
     * 获取最近页面
     */
    getRecentPages() {
        const recent = this.navigationHistory
            .slice(-10)
            .reverse()
            .filter((nav, index, arr) => 
                arr.findIndex(n => n.to === nav.to) === index
            )
            .slice(0, 5)
            .map(nav => ({
                id: nav.to,
                timestamp: nav.timestamp
            }));

        return recent;
    }

    /**
     * 获取页面图标
     */
    getPageIcon(pageId) {
        const icons = {
            'home': '🏠',
            'vocabulary': '📚',
            'grammar': '📝',
            'listening': '🎧',
            'reading': '📖',
            'writing': '✍️',
            'vocab-test': '📋',
            'statistics': '📊'
        };

        return icons[pageId] || '📄';
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}小时前`;
        
        const days = Math.floor(hours / 24);
        return `${days}天前`;
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Alt+H': 'home',
            'Alt+V': 'vocabulary',
            'Alt+G': 'grammar',
            'Alt+L': 'listening',
            'Alt+R': 'reading',
            'Alt+W': 'writing',
            'Alt+T': 'vocab-test',
            'Alt+S': 'statistics',
            // 'Alt+Q': 'quick-access'
        };

        document.addEventListener('keydown', (e) => {
            if (!e.key) return; // Add guard clause to prevent error on undefined key
            const key = `${e.altKey ? 'Alt+' : ''}${e.ctrlKey ? 'Ctrl+' : ''}${e.key.toUpperCase()}`;
            
            if (shortcuts[key]) {
                e.preventDefault();
                this.navigateToPage(shortcuts[key]);
            }
            
            // 导航栏键盘导航
            this.handleNavKeyboardNavigation(e);
        });

        console.log('⌨️ 键盘快捷键已设置');
    }

    /**
     * 处理导航栏键盘导航
     */
    handleNavKeyboardNavigation(e) {
        const navItems = document.querySelectorAll('.nav-item');
        const currentFocus = document.activeElement;
        const currentIndex = Array.from(navItems).indexOf(currentFocus);
        
        if (currentIndex === -1) return;
        
        let nextIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                nextIndex = currentIndex > 0 ? currentIndex - 1 : navItems.length - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextIndex = currentIndex < navItems.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                nextIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                nextIndex = navItems.length - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                currentFocus.click();
                return;
        }
        
        if (nextIndex !== currentIndex) {
            navItems[nextIndex].focus();
        }
    }

    /**
     * 创建导航助手
     */
    createNavigationAssistant() {
        // 创建面包屑导航
        this.createBreadcrumbNavigation();
        
        // 创建进度指示器
        this.createProgressIndicator();
    }

    /**
     * 创建面包屑导航
     */
    createBreadcrumbNavigation() {
        const breadcrumb = document.createElement('div');
        breadcrumb.id = 'breadcrumb-navigation';
        breadcrumb.className = 'breadcrumb-nav';
        
        // 插入到页面顶部
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(breadcrumb);
        } else {
            document.body.insertBefore(breadcrumb, document.body.firstChild);
        }
    }

    /**
     * 更新面包屑
     */
    updateBreadcrumbs(currentPage) {
        const breadcrumb = document.getElementById('breadcrumb-navigation');
        if (!breadcrumb) return;

        // 构建面包屑路径
        const path = this.buildBreadcrumbPath(currentPage);
        
        breadcrumb.innerHTML = path.map((item, index) => `
            <span class="breadcrumb-item ${index === path.length - 1 ? 'active' : ''}" 
                  ${index < path.length - 1 ? `data-page="${item.id}"` : ''}>
                ${item.icon} ${item.name}
            </span>
            ${index < path.length - 1 ? '<span class="breadcrumb-separator">›</span>' : ''}
        `).join('');

        // 绑定点击事件
        breadcrumb.querySelectorAll('.breadcrumb-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateToPage(item.dataset.page);
            });
        });
    }

    /**
     * 构建面包屑路径
     */
    buildBreadcrumbPath(currentPage) {
        const path = [
            { id: 'home', name: '首页', icon: '🏠' }
        ];

        if (currentPage !== 'home') {
            path.push({
                id: currentPage,
                name: this.getPageName(currentPage),
                icon: this.getPageIcon(currentPage)
            });
        }

        return path;
    }

    /**
     * 创建页面加载进度指示器
     */
    createProgressIndicator() {
        if (document.getElementById('navigation-progress-indicator')) return;
        const indicator = document.createElement('div');
        indicator.id = 'navigation-progress-indicator';
        indicator.className = 'navigation-progress-indicator';
        document.body.appendChild(indicator);
    }

    /**
     * 设置学习路径指导
     */
    setupLearningPathGuide() {
        this.learningPath = [
            { id: 'home', name: '开始学习', completed: true },
            { id: 'vocabulary', name: '词汇学习', completed: false },
            { id: 'vocab-test', name: '词汇测试', completed: false },
            { id: 'grammar', name: '语法练习', completed: false },
            { id: 'listening', name: '听力训练', completed: false },
            { id: 'reading', name: '阅读理解', completed: false },
            { id: 'writing', name: '写作练习', completed: false },
            { id: 'statistics', name: '查看统计', completed: false }
        ];

        this.createLearningPathGuide();
    }

    /**
     * 创建学习路径指导
     */
    createLearningPathGuide() {
        const guide = document.createElement('div');
        guide.id = 'learning-path-guide';
        guide.className = 'learning-path-guide';
        guide.innerHTML = `
            <div class="guide-toggle">
                <button class="guide-btn" title="学习路径 (Alt+P)">
                    🗺️
                </button>
            </div>
            <div class="guide-content">
                <div class="guide-header">
                    <h4>学习路径</h4>
                    <button class="close-guide">&times;</button>
                </div>
                <div class="path-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculateProgress()}%"></div>
                    </div>
                    <div class="progress-text">${this.calculateProgress()}% 完成</div>
                </div>
                <div class="path-steps">
                    ${this.renderPathSteps()}
                </div>
                <div class="guide-actions">
                    <button class="next-step-btn">下一步</button>
                    <button class="reset-path-btn">重置路径</button>
                </div>
            </div>
        `;

        document.body.appendChild(guide);
        this.bindGuideEvents(guide);
    }

    /**
     * 渲染路径步骤
     */
    renderPathSteps() {
        return this.learningPath.map((step, index) => `
            <div class="path-step ${step.completed ? 'completed' : ''} ${index === this.currentStep ? 'current' : ''}" 
                 data-step="${index}" data-page="${step.id}">
                <div class="step-number">${index + 1}</div>
                <div class="step-info">
                    <div class="step-name">${step.name}</div>
                    <div class="step-status">
                        ${step.completed ? '✅ 已完成' : index === this.currentStep ? '🔄 进行中' : '⏳ 待完成'}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 计算进度
     */
    calculateProgress() {
        const completed = this.learningPath.filter(step => step.completed).length;
        return Math.round((completed / this.learningPath.length) * 100);
    }

    /**
     * 绑定指导事件
     */
    bindGuideEvents(guide) {
        const toggleBtn = guide.querySelector('.guide-btn');
        const content = guide.querySelector('.guide-content');
        const closeBtn = guide.querySelector('.close-guide');
        const nextBtn = guide.querySelector('.next-step-btn');
        const resetBtn = guide.querySelector('.reset-path-btn');
        const steps = guide.querySelectorAll('.path-step');

        // 切换指导面板
        toggleBtn.addEventListener('click', () => {
            content.classList.toggle('show');
        });

        // 关闭面板
        closeBtn.addEventListener('click', () => {
            content.classList.remove('show');
        });

        // 下一步
        nextBtn.addEventListener('click', () => {
            this.goToNextStep();
        });

        // 重置路径
        resetBtn.addEventListener('click', () => {
            this.resetLearningPath();
        });

        // 步骤点击
        steps.forEach(step => {
            step.addEventListener('click', () => {
                const pageId = step.dataset.page;
                this.navigateToPage(pageId);
                content.classList.remove('show');
            });
        });
    }

    /**
     * 前往下一步
     */
    goToNextStep() {
        const nextStep = this.learningPath.find(step => !step.completed);
        if (nextStep) {
            this.navigateToPage(nextStep.id);
            document.querySelector('.guide-content').classList.remove('show');
        }
    }

    /**
     * 重置学习路径
     */
    resetLearningPath() {
        this.learningPath.forEach((step, index) => {
            step.completed = index === 0; // 只保留第一步完成
        });
        
        this.currentStep = 1;
        this.updateLearningPathDisplay();
        
        if (window.Notification) {
            window.Notification.success('学习路径已重置', { duration: 3000 });
        }
    }

    /**
     * 更新学习路径显示
     */
    updateLearningPathDisplay() {
        const guide = document.getElementById('learning-path-guide');
        if (!guide) return;

        const pathSteps = guide.querySelector('.path-steps');
        const progressFill = guide.querySelector('.progress-fill');
        const progressText = guide.querySelector('.progress-text');

        if (pathSteps) {
            pathSteps.innerHTML = this.renderPathSteps();
            this.bindGuideEvents(guide);
        }

        if (progressFill && progressText) {
            const progress = this.calculateProgress();
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}% 完成`;
        }
    }

    /**
     * 添加导航增强功能
     */
    addNavigationEnhancements() {
        // 添加返回顶部按钮
        this.createBackToTopButton();
        
        // 添加页面切换动画
        this.setupPageTransitions();
        
        // 添加导航样式
        this.addNavigationStyles();
    }

    /**
     * 创建返回顶部按钮
     */
    createBackToTopButton() {
        const backToTop = document.createElement('button');
        backToTop.id = 'back-to-top';
        backToTop.className = 'back-to-top-btn';
        backToTop.innerHTML = '↑';
        backToTop.title = '返回顶部';

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // 滚动显示/隐藏
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });

        document.body.appendChild(backToTop);
    }

    /**
     * 设置页面切换动画
     */
    setupPageTransitions() {
        // 页面切换时的加载动画
        let isTransitioning = false;
        
        const originalShowPage = window.app?.showPage;
        if (originalShowPage && typeof originalShowPage === 'function') {
            window.app.showPage = (pageId) => {
                if (isTransitioning) return;
                
                isTransitioning = true;
                this.showTransitionAnimation();
                
                setTimeout(() => {
                    originalShowPage.call(window.app, pageId);
                    this.hideTransitionAnimation();
                    isTransitioning = false;
                }, 200);
            };
        }
    }

    /**
     * 显示切换动画
     */
    showTransitionAnimation() {
        const indicator = document.getElementById('navigation-progress-indicator');
        if (indicator) {
            indicator.style.opacity = '1';
            indicator.style.width = '0%';
            indicator.style.transition = 'width 4s cubic-bezier(0.25, 1, 0.5, 1)';
            setTimeout(() => { indicator.style.width = '80%'; }, 10);
        }

        const overlay = document.createElement('div');
        overlay.id = 'page-transition-overlay';
        overlay.className = 'page-transition-overlay';
        overlay.innerHTML = `
            <div class="transition-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-text">加载中...</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }

    /**
     * 隐藏切换动画
     */
    hideTransitionAnimation() {
        const indicator = document.getElementById('navigation-progress-indicator');
        if (indicator) {
            indicator.style.transition = 'width 0.3s ease-out, opacity 0.3s 0.2s ease';
            indicator.style.width = '100%';
            setTimeout(() => {
                indicator.style.opacity = '0';
                setTimeout(() => { 
                    indicator.style.width = '0%';
                }, 300);
            }, 300);
        }
        
        const overlay = document.getElementById('page-transition-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    /**
     * 添加导航样式
     */
    addNavigationStyles() {
        if (document.getElementById('navigation-optimizer-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'navigation-optimizer-styles';
        styles.textContent = `
            /* 导航进度指示器 */
            .navigation-progress-indicator {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                width: 0%;
                z-index: 10001;
                transition: width 0.4s ease, opacity 0.3s ease;
                opacity: 0;
            }

            /* 学习路径指导 */
            .learning-path-guide {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 9997;
            }

            .guide-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
            }

            .guide-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }

            .guide-content {
                position: absolute;
                bottom: 60px;
                left: 0;
                width: 320px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }

            .guide-content.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .guide-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border-radius: 12px 12px 0 0;
            }

            .guide-header h4 {
                margin: 0;
                font-size: 16px;
            }

            .close-guide {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }

            .close-guide:hover {
                background: rgba(255,255,255,0.2);
            }

            .path-progress {
                padding: 15px;
                border-bottom: 1px solid #dee2e6;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                border-radius: 4px;
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 12px;
                color: #666;
                text-align: center;
            }

            .path-steps {
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
            }

            .path-step {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }

            .path-step:hover {
                background: #f8f9fa;
            }

            .path-step.completed {
                background: #d4edda;
            }

            .path-step.current {
                background: #cce5ff;
                border: 1px solid #007bff;
            }

            .step-number {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #dee2e6;
                color: #666;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            .path-step.completed .step-number {
                background: #28a745;
                color: white;
            }

            .path-step.current .step-number {
                background: #007bff;
                color: white;
            }

            .step-info {
                flex: 1;
            }

            .step-name {
                font-size: 14px;
                color: #333;
                margin-bottom: 2px;
            }

            .step-status {
                font-size: 11px;
                color: #666;
            }

            .guide-actions {
                display: flex;
                gap: 8px;
                padding: 15px;
                border-top: 1px solid #dee2e6;
            }

            .guide-actions button {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #dee2e6;
                border-radius: 6px;
                background: white;
                color: #333;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .next-step-btn {
                background: #007bff !important;
                color: white !important;
                border-color: #007bff !important;
            }

            .guide-actions button:hover {
                background: #f8f9fa;
            }

            .next-step-btn:hover {
                background: #0056b3 !important;
            }

            /* 面包屑导航 */
            .breadcrumb-nav {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 0;
                font-size: 14px;
                color: #666;
            }

            .breadcrumb-item {
                cursor: pointer;
                transition: color 0.2s ease;
            }

            .breadcrumb-item:not(.active):hover {
                color: #007bff;
            }

            .breadcrumb-item.active {
                color: #333;
                font-weight: 500;
            }

            .breadcrumb-separator {
                color: #dee2e6;
                margin: 0 4px;
            }

            /* 返回顶部按钮 */
            .back-to-top-btn {
                position: fixed;
                bottom: 160px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
                color: white;
                border: none;
                font-size: 20px;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 1000;
            }

            .back-to-top-btn.show {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .back-to-top-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            }

            /* 页面切换动画 */
            .page-transition-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .page-transition-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .transition-spinner {
                text-align: center;
            }

            .spinner-ring {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            }

            .spinner-text {
                color: #666;
                font-size: 14px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .guide-content {
                    width: calc(100vw - 40px);
                    max-width: 320px;
                }

                .learning-path-guide {
                    left: 10px;
                    bottom: 10px;
                }

                .back-to-top-btn {
                    bottom: 80px;
                    right: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * 添加快速访问样式
     */
    addQuickAccessStyles() {
        // 样式已在 addNavigationStyles 中包含
    }

    /**
     * 获取导航统计
     */
    getNavigationStats() {
        return {
            totalNavigations: this.navigationHistory.length,
            uniquePages: [...new Set(this.navigationHistory.map(nav => nav.to))].length,
            mostVisitedPage: this.getMostVisitedPage(),
            averageSessionTime: this.getAverageSessionTime(),
            navigationPatterns: this.getNavigationPatterns()
        };
    }

    /**
     * 获取最常访问页面
     */
    getMostVisitedPage() {
        const pageCounts = {};
        this.navigationHistory.forEach(nav => {
            pageCounts[nav.to] = (pageCounts[nav.to] || 0) + 1;
        });

        const mostVisited = Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)[0];

        return mostVisited ? {
            page: mostVisited[0],
            count: mostVisited[1],
            name: this.getPageName(mostVisited[0])
        } : null;
    }

    /**
     * 获取平均会话时间
     */
    getAverageSessionTime() {
        if (this.navigationHistory.length < 2) return 0;

        const sessionTimes = [];
        for (let i = 1; i < this.navigationHistory.length; i++) {
            const timeDiff = this.navigationHistory[i].timestamp - this.navigationHistory[i-1].timestamp;
            if (timeDiff < 300000) { // 5分钟内的切换才算有效会话
                sessionTimes.push(timeDiff);
            }
        }

        return sessionTimes.length > 0 
            ? sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length 
            : 0;
    }

    /**
     * 获取导航模式
     */
    getNavigationPatterns() {
        const patterns = {};
        for (let i = 1; i < this.navigationHistory.length; i++) {
            const pattern = `${this.navigationHistory[i-1].to}->${this.navigationHistory[i].to}`;
            patterns[pattern] = (patterns[pattern] || 0) + 1;
        }

        return Object.entries(patterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([pattern, count]) => ({ pattern, count }));
    }
}

// 创建全局实例
window.NavigationOptimizer = new NavigationOptimizer();
