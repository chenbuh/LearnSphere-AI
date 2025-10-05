/**
 * 性能优化管理器
 * 提供应用性能监控、优化和加载速度提升
 */
class PerformanceOptimizer {
    constructor() {
        this.metrics = {};
        this.observers = {};
        this.lazyLoadElements = new Set();
        this.resourceCache = new Map();
        this.performanceEntries = [];
        this.optimizations = {};
        this.isMonitoring = false;
        
        // 性能优化增强
        this.metricsBuffer = [];
        this.bufferSize = 100;
        this.reportingInterval = 30000; // 30秒报告一次
        this.performanceThresholds = {
            lcp: 2500,  // 2.5秒
            fid: 100,   // 100毫秒
            cls: 0.1,   // 0.1
            memory: 0.8 // 80%内存使用率
        };
        
        // 自适应优化
        this.adaptiveOptimizations = new Map();
        this.optimizationHistory = [];
        
        this.init();
    }

    init() {
        if (window.logger) {
            window.logger.info('PerformanceOptimizer', '⚡ 初始化性能优化管理器...');
        }
        this.setupPerformanceMonitoring();
        this.initializeLazyLoading();
        this.setupResourceOptimization();
        this.implementCodeSplitting();
        this.optimizeRenderPerformance();
        this.startPerformanceMonitoring();
    }

    /**
     * 设置性能监控
     */
    setupPerformanceMonitoring() {
        // Web Vitals 监控
        this.observeWebVitals();
        
        // 资源加载监控
        this.observeResourceLoading();
        
        // 用户交互监控
        this.observeUserInteractions();
        
        // 内存使用监控
        this.observeMemoryUsage();

        if (window.logger) {
            window.logger.debug('PerformanceOptimizer', '📊 性能监控已设置');
        }
    }

    /**
     * 观察Web Vitals
     */
    observeWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                this.analyzeMetric('lcp', lastEntry.startTime);
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.lcp = lcpObserver;
            } catch (e) {
                console.warn('LCP observer not supported');
            }
        }

        // First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    this.analyzeMetric('fid', entry.processingStart - entry.startTime);
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.fid = fidObserver;
            } catch (e) {
                console.warn('FID observer not supported');
            }
        }

        // Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
                this.analyzeMetric('cls', clsValue);
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.cls = clsObserver;
            } catch (e) {
                console.warn('CLS observer not supported');
            }
        }
    }

    /**
     * 观察资源加载
     */
    observeResourceLoading() {
        if ('PerformanceObserver' in window) {
            const resourceObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    this.analyzeResourcePerformance(entry);
                });
            });
            
            try {
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.resource = resourceObserver;
            } catch (e) {
                console.warn('Resource observer not supported');
            }
        }
    }

    /**
     * 观察用户交互
     */
    observeUserInteractions() {
        const interactionEvents = ['click', 'keydown', 'scroll', 'touchstart'];
        
        interactionEvents.forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.measureInteractionPerformance(eventType, event);
            }, { passive: true });
        });
    }

    /**
     * 观察内存使用
     */
    observeMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                this.metrics.memory = {
                    used: memInfo.usedJSHeapSize,
                    total: memInfo.totalJSHeapSize,
                    limit: memInfo.jsHeapSizeLimit,
                    usage: memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit
                };
                
                // 内存使用率过高时优化
                if (this.metrics.memory.usage > 0.8) {
                    this.optimizeMemoryUsage();
                }
            }, 5000);
        }
    }

    /**
     * 兜底交互优化：将重任务延后并节流高频事件
     */
    fallbackOptimizeInteraction(eventType, duration) {
        // 简单节流：对于scroll/keydown，短期内忽略进一步处理
        if (!this._interactionLocks) this._interactionLocks = new Map();
        const lockKey = `${eventType}`;
        if (this._interactionLocks.get(lockKey)) return;
        this._interactionLocks.set(lockKey, true);
        setTimeout(() => this._interactionLocks.delete(lockKey), 150);

        // 将可能的重任务延后到空闲时间
        const run = () => {
            try {
                // 收敛样式与布局抖动
                if (document.body) {
                    document.body.offsetHeight; // 强制合并，避免连续回流
                }
            } catch (e) {}
        };
        if ('requestIdleCallback' in window) {
            requestIdleCallback(run, { timeout: 500 });
        } else {
            setTimeout(run, 64);
        }
    }

    /**
     * 分析性能指标
     */
    analyzeMetric(metricName, value) {
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 }
        };

        const threshold = thresholds[metricName];
        if (!threshold) return;

        let status = 'good';
        if (value > threshold.poor) {
            status = 'poor';
        } else if (value > threshold.good) {
            status = 'needs-improvement';
        }

        window.logger?.debug(`${metricName.toUpperCase()}: ${value.toFixed(2)} (${status})`);

        // 触发优化建议
        if (status !== 'good') {
            this.suggestOptimizations(metricName, status, value);
        }
    }

    /**
     * 分析资源性能
     */
    analyzeResourcePerformance(entry) {
        const duration = entry.responseEnd - entry.startTime;
        const size = entry.transferSize || entry.encodedBodySize || 0;

        // 慢资源检测
        if (duration > 1000) {
            console.warn(`🐌 慢资源检测: ${entry.name} (${duration.toFixed(2)}ms)`);
            this.optimizeSlowResource(entry);
        }

        // 大资源检测
        if (size > 100000) { // 100KB
            window.logger?.info(`大资源检测: ${entry.name} (${(size / 1024).toFixed(2)}KB)`);
            this.optimizeLargeResource(entry);
        }

        // 缓存未命中检测
        if (entry.transferSize > entry.encodedBodySize) {
            this.suggestCaching(entry);
        }
    }

    /**
     * 优化大资源
     */
    optimizeLargeResource(entry) {
        const suggestions = [];
        
        if (entry.name.endsWith('.css')) {
            suggestions.push('考虑压缩CSS文件');
            suggestions.push('移除未使用的CSS规则');
        } else if (entry.name.endsWith('.js')) {
            suggestions.push('考虑代码分割和懒加载');
            suggestions.push('压缩JavaScript文件');
        } else if (entry.name.match(/\.(jpg|jpeg|png|gif)$/)) {
            suggestions.push('优化图片格式和大小');
            suggestions.push('使用WebP格式');
        }

        if (suggestions.length > 0) {
            window.logger?.debug(`${entry.name} 优化建议:`, suggestions);
        }
    }

    /**
     * 建议缓存策略
     */
    suggestCaching(entry) {
        const cacheStrategies = [];
        
        if (entry.name.match(/\.(css|js)$/)) {
            cacheStrategies.push('设置长期缓存头');
            cacheStrategies.push('使用版本号或哈希值');
        } else if (entry.name.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
            cacheStrategies.push('设置图片缓存策略');
        }

        if (cacheStrategies.length > 0) {
            window.logger?.debug(`${entry.name} 缓存建议:`, cacheStrategies);
        }
    }

    /**
     * 测量交互性能
     */
    measureInteractionPerformance(eventType, event) {
        const startTime = performance.now();
        
        // 使用requestAnimationFrame测量到下一帧的时间
        requestAnimationFrame(() => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            if (duration > 16) { // 超过一帧时间(16ms)
                console.warn(`🐌 慢交互检测: ${eventType} (${duration.toFixed(2)}ms)`);
                if (typeof this.optimizeInteractionPerformance === 'function') {
                    this.optimizeInteractionPerformance(eventType, duration);
                } else {
                    // 兜底优化：降级为简单的任务切片与节流
                    this.fallbackOptimizeInteraction(eventType, duration);
                }
            }
        });
    }

    /**
     * 初始化懒加载
     */
    initializeLazyLoading() {
        // 图片懒加载
        this.setupImageLazyLoading();
        
        // 组件懒加载
        this.setupComponentLazyLoading();
        
        // 脚本懒加载
        this.setupScriptLazyLoading();

        window.logger?.info('懒加载已初始化');
    }

    /**
     * 设置图片懒加载
     */
    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src;
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // 观察所有带有data-src的图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });

            this.observers.images = imageObserver;
        }
    }

    /**
     * 设置组件懒加载
     */
    setupComponentLazyLoading() {
        if ('IntersectionObserver' in window) {
            const componentObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const componentName = element.dataset.lazyComponent;
                        if (componentName) {
                            this.loadComponent(componentName, element);
                            componentObserver.unobserve(element);
                        }
                    }
                });
            }, {
                rootMargin: '100px 0px'
            });

            document.querySelectorAll('[data-lazy-component]').forEach(element => {
                componentObserver.observe(element);
            });

            this.observers.components = componentObserver;
        }
    }

    /**
     * 设置脚本懒加载
     */
    setupScriptLazyLoading() {
        // 延迟加载非关键脚本
        window.addEventListener('load', () => {
            this.loadNonCriticalScripts();
        });
    }

    /**
     * 加载非关键脚本
     */
    loadNonCriticalScripts() {
        const scripts = [
            '/src/js/analytics.js',
            '/src/js/social-sharing.js',
        ];

        scripts.forEach(src => {
            this.loadScriptAsync(src);
        });
    }

    /**
     * 异步加载脚本
     */
    loadScriptAsync(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * 设置资源优化
     */
    setupResourceOptimization() {
        // 预加载关键资源
        this.preloadCriticalResources();
        
        // 预连接外部域名
        this.preconnectExternalDomains();
        
        // 设置资源缓存策略
        this.setupResourceCaching();

        window.logger?.info('资源优化已设置');
    }

    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        const criticalResources = [
            // { href: '/src/css/main.css', as: 'style' },
            // { href: '/src/js/app.js', as: 'script' },
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            Object.assign(link, resource);
            document.head.appendChild(link);
        });
    }

    /**
     * 预连接外部域名
     */
    preconnectExternalDomains() {
        const domains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://api.example.com'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = '';
            document.head.appendChild(link);
        });
    }

    /**
     * 设置资源缓存
     */
    setupResourceCaching() {
        // Service Worker缓存策略
        if ('serviceWorker' in navigator) {
            // this.registerServiceWorker();
        }

        // 内存缓存
        this.setupMemoryCache();
    }

    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            window.logger?.info('Service Worker注册成功:', registration);
        } catch (error) {
            window.logger?.error('Service Worker注册失败:', error);
        }
    }

    /**
     * 设置内存缓存
     */
    setupMemoryCache() {
        // 初始化缓存统计
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        
        // 缓存API响应
        const originalFetch = window.fetch;
        window.fetch = async (url, options) => {
            const cacheKey = url + JSON.stringify(options);
            
            // 检查缓存
            if (this.resourceCache.has(cacheKey)) {
                const cached = this.resourceCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5分钟缓存
                    this.cacheStats.hits++;
                    return Promise.resolve(cached.response.clone());
                } else {
                    // 缓存过期，删除
                    this.resourceCache.delete(cacheKey);
                    this.cacheStats.evictions++;
                }
            }

            // 发起请求
            this.cacheStats.misses++;
            const response = await originalFetch(url, options);
            
            // 缓存响应（仅缓存成功的GET请求）
            if (response.ok && (!options || !options.method || options.method === 'GET')) {
                // 检查缓存大小限制
                if (this.resourceCache.size >= 50) {
                    // 删除最旧的缓存项
                    const firstKey = this.resourceCache.keys().next().value;
                    this.resourceCache.delete(firstKey);
                    this.cacheStats.evictions++;
                }
                
                this.resourceCache.set(cacheKey, {
                    response: response.clone(),
                    timestamp: Date.now()
                });
            }
            
            return response;
        };
        
        // 定期报告缓存统计
        setInterval(() => {
            this.reportCacheStats();
        }, 5 * 60 * 1000); // 每5分钟报告一次
    }

    /**
     * 报告缓存统计
     */
    reportCacheStats() {
        const total = this.cacheStats.hits + this.cacheStats.misses;
        if (total > 0) {
            const hitRate = (this.cacheStats.hits / total * 100).toFixed(2);
            window.logger?.debug(`API缓存命中率: ${hitRate}% (${this.cacheStats.hits}/${total})`);
        }
    }

    /**
     * 实现代码分割
     */
    implementCodeSplitting() {
        // 动态导入模块
        this.setupDynamicImports();
        
        // 路由级代码分割
        this.setupRouteBasedSplitting();

        window.logger?.info('代码分割已实现');
    }

    /**
     * 设置动态导入
     */
    setupDynamicImports() {
        // 创建模块加载器
        window.loadModule = async (moduleName) => {
            try {
                const module = await import(`/src/js/${moduleName}.js`);
                return module.default || module;
            } catch (error) {
                window.logger?.error(`模块加载失败: ${moduleName}`, error);
                return null;
            }
        };
    }

    /**
     * 设置基于路由的代码分割
     */
    setupRouteBasedSplitting() {
        // 监听路由变化
        window.addEventListener('popstate', () => {
            this.loadRouteModule(window.location.pathname);
        });

        // 拦截导航链接
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            if (link && link.origin === window.location.origin) {
                event.preventDefault();
                this.navigateWithCodeSplitting(link.pathname);
            }
        });
    }

    /**
     * 带代码分割的导航
     */
    async navigateWithCodeSplitting(path) {
        // 显示加载指示器
        this.showLoadingIndicator();

        try {
            // 加载路由模块
            await this.loadRouteModule(path);
            
            // 更新URL
            history.pushState(null, '', path);
            
            // 隐藏加载指示器
            this.hideLoadingIndicator();
        } catch (error) {
            window.logger?.error('路由加载失败:', error);
            this.hideLoadingIndicator();
        }
    }

    /**
     * 加载路由模块
     */
    async loadRouteModule(path) {
        const routeModules = {
            '/vocabulary': 'vocabulary-manager',
            '/grammar': 'grammar-manager',
            '/listening': 'listening-manager',
            '/reading': 'reading-manager',
            '/statistics': 'statistics-manager'
        };

        const moduleName = routeModules[path];
        if (moduleName) {
            await window.loadModule(moduleName);
        }
    }

    /**
     * 优化渲染性能
     */
    optimizeRenderPerformance() {
        // 虚拟滚动
        this.implementVirtualScrolling();
        
        // 防抖和节流
        this.setupDebounceThrottle();
        
        // 减少重绘重排
        this.optimizeReflowRepaint();

        console.log('🎨 渲染性能已优化');
    }

    /**
     * 实现虚拟滚动
     */
    implementVirtualScrolling() {
        const virtualScrollContainers = document.querySelectorAll('[data-virtual-scroll]');
        
        virtualScrollContainers.forEach(container => {
            this.setupVirtualScroll(container);
        });
    }

    /**
     * 设置虚拟滚动
     */
    setupVirtualScroll(container) {
        const itemHeight = parseInt(container.dataset.itemHeight) || 50;
        const items = Array.from(container.children);
        const totalHeight = items.length * itemHeight;
        
        // 创建虚拟滚动包装器
        const wrapper = document.createElement('div');
        wrapper.style.height = `${totalHeight}px`;
        wrapper.style.position = 'relative';
        
        const viewport = document.createElement('div');
        viewport.style.height = container.clientHeight + 'px';
        viewport.style.overflow = 'auto';
        
        container.parentNode.insertBefore(viewport, container);
        viewport.appendChild(wrapper);
        wrapper.appendChild(container);
        
        // 滚动事件处理
        let ticking = false;
        viewport.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateVirtualScroll(container, viewport, items, itemHeight);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * 更新虚拟滚动
     */
    updateVirtualScroll(container, viewport, items, itemHeight) {
        const scrollTop = viewport.scrollTop;
        const viewportHeight = viewport.clientHeight;
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + Math.ceil(viewportHeight / itemHeight) + 1, items.length);
        
        // 隐藏所有项目
        items.forEach(item => item.style.display = 'none');
        
        // 显示可见项目
        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i];
            item.style.display = 'block';
            item.style.position = 'absolute';
            item.style.top = `${i * itemHeight}px`;
            item.style.width = '100%';
        }
    }

    /**
     * 设置防抖和节流
     */
    setupDebounceThrottle() {
        // 防抖函数
        window.debounce = (func, wait, immediate = false) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(this, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(this, args);
            };
        };

        // 节流函数
        window.throttle = (func, limit) => {
            let inThrottle;
            return function executedFunction(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };

        // 应用到常见事件
        this.applyDebounceThrottle();
    }

    /**
     * 应用防抖节流
     */
    applyDebounceThrottle() {
        // 搜索输入防抖
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        searchInputs.forEach(input => {
            const originalHandler = input.oninput;
            if (originalHandler) {
                input.oninput = window.debounce(originalHandler, 300);
            }
        });

        // 滚动事件节流
        const scrollElements = document.querySelectorAll('[data-scroll-handler]');
        scrollElements.forEach(element => {
            const originalHandler = element.onscroll;
            if (originalHandler) {
                element.onscroll = window.throttle(originalHandler, 16);
            }
        });

        // 窗口大小调整防抖
        const originalResize = window.onresize;
        if (originalResize) {
            window.onresize = window.debounce(originalResize, 250);
        }
    }

    /**
     * 优化重绘重排
     */
    optimizeReflowRepaint() {
        // 批量DOM操作
        this.setupBatchedDOMOperations();
        
        // CSS优化
        this.optimizeCSS();
        
        // 避免强制同步布局
        this.avoidForcedReflow();
    }

    /**
     * 设置批量DOM操作
     */
    setupBatchedDOMOperations() {
        let pendingOperations = [];
        let rafId = null;

        window.batchDOMUpdate = (operation) => {
            pendingOperations.push(operation);
            
            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    pendingOperations.forEach(op => op());
                    pendingOperations = [];
                    rafId = null;
                });
            }
        };
    }

    /**
     * 优化CSS
     */
    optimizeCSS() {
        // 启用GPU加速
        const animatedElements = document.querySelectorAll('.animate, .transition');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
            element.style.transform = 'translateZ(0)';
        });

        // 优化字体渲染
        document.documentElement.style.textRendering = 'optimizeLegibility';
        document.documentElement.style.webkitFontSmoothing = 'antialiased';
        document.documentElement.style.mozOsxFontSmoothing = 'grayscale';
    }

    /**
     * 避免强制重排
     */
    avoidForcedReflow() {
        // 缓存DOM查询结果
        const domCache = new Map();
        
        window.getCachedElement = (selector) => {
            if (!domCache.has(selector)) {
                domCache.set(selector, document.querySelector(selector));
            }
            return domCache.get(selector);
        };

        // 批量读取布局属性
        window.batchLayoutRead = (elements, properties) => {
            const results = [];
            elements.forEach(element => {
                const result = {};
                properties.forEach(prop => {
                    result[prop] = element[prop];
                });
                results.push(result);
            });
            return results;
        };
    }

    /**
     * 开始性能监控
     */
    startPerformanceMonitoring() {
        this.isMonitoring = true;
        
        // 定期收集性能数据
        setInterval(() => {
            this.collectPerformanceData();
        }, 10000); // 每10秒收集一次

        // 页面卸载时发送数据
        window.addEventListener('beforeunload', () => {
            this.sendPerformanceData();
        });

        console.log('📈 性能监控已启动');
    }

    /**
     * 收集性能数据
     */
    collectPerformanceData() {
        const now = performance.now();
        const navigation = performance.getEntriesByType('navigation')[0];
        
        const data = {
            timestamp: Date.now(),
            metrics: { ...this.metrics },
            navigation: {
                domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
                loadComplete: navigation?.loadEventEnd - navigation?.navigationStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint()
            },
            resources: this.getResourceSummary(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.performanceEntries.push(data);
        
        // 限制条目数量
        if (this.performanceEntries.length > 100) {
            this.performanceEntries.shift();
        }
    }

    /**
     * 获取First Paint时间
     */
    getFirstPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
        return fpEntry ? fpEntry.startTime : null;
    }

    /**
     * 获取First Contentful Paint时间
     */
    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : null;
    }

    /**
     * 获取资源摘要
     */
    getResourceSummary() {
        const resources = performance.getEntriesByType('resource');
        
        return {
            total: resources.length,
            totalSize: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
            averageLoadTime: resources.reduce((sum, resource) => sum + resource.duration, 0) / resources.length,
            slowResources: resources.filter(resource => resource.duration > 1000).length
        };
    }

    /**
     * 发送性能数据
     */
    sendPerformanceData() {
        if (this.performanceEntries.length === 0) return;

        // 使用sendBeacon发送数据（如果支持）
        if ('sendBeacon' in navigator) {
            const data = JSON.stringify({
                entries: this.performanceEntries,
                sessionId: this.getSessionId()
            });
            
            navigator.sendBeacon('/api/performance', data);
        }
    }

    /**
     * 获取会话ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('performance_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('performance_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * 建议优化措施
     */
    suggestOptimizations(metric, status, value) {
        const suggestions = {
            lcp: {
                'needs-improvement': [
                    '优化关键渲染路径',
                    '压缩图片资源',
                    '使用CDN加速',
                    '预加载关键资源'
                ],
                'poor': [
                    '启用服务器端渲染',
                    '优化服务器响应时间',
                    '移除阻塞渲染的资源',
                    '实施关键CSS内联'
                ]
            },
            fid: {
                'needs-improvement': [
                    '减少JavaScript执行时间',
                    '分割长任务',
                    '使用Web Workers',
                    '优化第三方脚本'
                ],
                'poor': [
                    '延迟非关键JavaScript',
                    '移除未使用的代码',
                    '实施代码分割',
                    '优化事件监听器'
                ]
            },
            cls: {
                'needs-improvement': [
                    '为图片和视频设置尺寸',
                    '避免在现有内容上方插入内容',
                    '使用CSS transform而不是改变布局属性'
                ],
                'poor': [
                    '预留广告位空间',
                    '避免使用不确定尺寸的字体',
                    '确保动画只影响合成层'
                ]
            }
        };

        const metricSuggestions = suggestions[metric]?.[status] || [];
        
        if (metricSuggestions.length > 0) {
            console.log(`💡 ${metric.toUpperCase()}优化建议:`, metricSuggestions);
            
            // 显示优化建议通知
            // this.showOptimizationSuggestion(metric, metricSuggestions);
        }
    }

    /**
     * 优化慢资源
     */
    optimizeSlowResource(entry) {
        const url = new URL(entry.name);
        const extension = url.pathname.split('.').pop().toLowerCase();

        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
                this.optimizeImage(entry);
                break;
            case 'js':
                this.optimizeScript(entry);
                break;
            case 'css':
                this.optimizeStylesheet(entry);
                break;
            default:
                console.log(`🔧 考虑优化资源: ${entry.name}`);
        }
    }

    /**
     * 优化图片
     */
    optimizeImage(entry) {
        console.log(`🖼️ 图片优化建议: ${entry.name}`);
        // 实际项目中可以实施图片压缩、格式转换等
    }

    /**
     * 优化脚本
     */
    optimizeScript(entry) {
        console.log(`📜 脚本优化建议: ${entry.name}`);
        // 实际项目中可以实施代码压缩、分割等
    }

    /**
     * 优化样式表
     */
    optimizeStylesheet(entry) {
        console.log(`🎨 样式表优化建议: ${entry.name}`);
        // 实际项目中可以实施CSS压缩、关键CSS提取等
    }

    /**
     * 优化内存使用
     */
    optimizeMemoryUsage() {
        console.log('🧹 执行内存优化...');
        
        // 清理缓存
        this.cleanupCache();
        
        // 移除未使用的事件监听器
        this.cleanupEventListeners();
        
        // 强制垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * 清理缓存
     */
    cleanupCache() {
        const now = Date.now();
        const maxAge = 600000; // 10分钟

        for (const [key, value] of this.resourceCache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.resourceCache.delete(key);
            }
        }
    }

    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        // 移除已分离元素的事件监听器
        // 这需要根据具体应用实现
        console.log('🧹 清理事件监听器');
    }

    /**
     * 显示加载指示器
     */
    showLoadingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'performance-loading';
        indicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">加载中...</div>
        `;
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255,255,255,0.9);
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(indicator);
    }

    /**
     * 隐藏加载指示器
     */
    hideLoadingIndicator() {
        const indicator = document.getElementById('performance-loading');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            optimizations: this.optimizations,
            suggestions: this.generateOptimizationSuggestions(),
            resourceSummary: this.getResourceSummary(),
            timestamp: Date.now()
        };
    }

    /**
     * 生成优化建议
     */
    generateOptimizationSuggestions() {
        const suggestions = [];
        
        // 基于当前指标生成建议
        if (this.metrics.lcp > 2500) {
            suggestions.push({
                type: 'lcp',
                priority: 'high',
                description: 'Largest Contentful Paint过慢，建议优化关键渲染路径'
            });
        }
        
        if (this.metrics.fid > 100) {
            suggestions.push({
                type: 'fid',
                priority: 'high',
                description: 'First Input Delay过长，建议优化JavaScript执行'
            });
        }
        
        if (this.metrics.cls > 0.1) {
            suggestions.push({
                type: 'cls',
                priority: 'medium',
                description: 'Cumulative Layout Shift过大，建议稳定页面布局'
            });
        }
        
        return suggestions;
    }

    /**
     * 自适应性能优化 - 增强功能
     */
    enableAdaptiveOptimization() {
        // 监控关键指标，自动调整优化策略
        setInterval(() => {
            this.evaluateAndAdaptOptimizations();
        }, this.reportingInterval);
    }

    evaluateAndAdaptOptimizations() {
        const currentMetrics = this.getCurrentMetrics();
        
        // 检查性能阈值
        Object.entries(this.performanceThresholds).forEach(([metric, threshold]) => {
            if (currentMetrics[metric] > threshold) {
                this.triggerAdaptiveOptimization(metric, currentMetrics[metric]);
            }
        });
        
        // 记录优化历史
        this.optimizationHistory.push({
            timestamp: Date.now(),
            metrics: { ...currentMetrics },
            optimizations: Array.from(this.adaptiveOptimizations.keys())
        });
        
        // 保持历史记录在合理范围内
        if (this.optimizationHistory.length > 50) {
            this.optimizationHistory = this.optimizationHistory.slice(-50);
        }
    }

    triggerAdaptiveOptimization(metric, value) {
        switch (metric) {
            case 'lcp':
                this.optimizeLCP();
                break;
            case 'fid':
                this.optimizeFID();
                break;
            case 'cls':
                this.optimizeCLS();
                break;
            case 'memory':
                this.optimizeMemoryUsage();
                break;
        }
        
        this.adaptiveOptimizations.set(metric, {
            triggeredAt: Date.now(),
            value: value,
            applied: true
        });
    }

    optimizeLCP() {
        // LCP优化策略
        const optimizations = [
            () => this.preloadCriticalResources(),
            () => this.optimizeImageLoading(),
            () => this.enableResourceHints(),
            () => this.reduceServerResponseTime()
        ];
        
        optimizations.forEach(optimize => {
            try {
                optimize();
            } catch (error) {
                console.warn('LCP优化失败:', error);
            }
        });
    }

    optimizeFID() {
        // FID优化策略
        const optimizations = [
            () => this.deferNonCriticalJavaScript(),
            () => this.implementCodeSplitting(),
            () => this.optimizeEventHandlers(),
            () => this.useWebWorkers()
        ];
        
        optimizations.forEach(optimize => {
            try {
                optimize();
            } catch (error) {
                console.warn('FID优化失败:', error);
            }
        });
    }

    optimizeCLS() {
        // CLS优化策略
        const optimizations = [
            () => this.setDimensionsForImages(),
            () => this.reserveSpaceForAds(),
            () => this.preloadFonts(),
            () => this.avoidDynamicContent()
        ];
        
        optimizations.forEach(optimize => {
            try {
                optimize();
            } catch (error) {
                console.warn('CLS优化失败:', error);
            }
        });
    }

    optimizeMemoryUsage() {
        // 内存优化策略
        const optimizations = [
            () => this.garbageCollectCache(),
            () => this.unloadUnusedModules(),
            () => this.optimizeImageMemory(),
            () => this.clearEventListeners()
        ];
        
        optimizations.forEach(optimize => {
            try {
                optimize();
            } catch (error) {
                console.warn('内存优化失败:', error);
            }
        });
    }

    // 具体优化实现
    preloadCriticalResources() {
        const criticalResources = document.querySelectorAll('link[rel="stylesheet"], script[src]');
        criticalResources.forEach(resource => {
            if (!resource.hasAttribute('data-preloaded')) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource.href || resource.src;
                link.as = resource.tagName === 'SCRIPT' ? 'script' : 'style';
                document.head.appendChild(link);
                resource.setAttribute('data-preloaded', 'true');
            }
        });
    }

    deferNonCriticalJavaScript() {
        const scripts = document.querySelectorAll('script[src]:not([defer]):not([async])');
        scripts.forEach(script => {
            if (!script.hasAttribute('data-critical')) {
                script.defer = true;
            }
        });
    }

    setDimensionsForImages() {
        const images = document.querySelectorAll('img:not([width]):not([height])');
        images.forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;
            }
        });
    }

    garbageCollectCache() {
        // 清理各种缓存
        if (this.resourceCache.size > 100) {
            const entries = Array.from(this.resourceCache.entries());
            const toDelete = entries.slice(0, entries.length - 50);
            toDelete.forEach(([key]) => this.resourceCache.delete(key));
        }
        
        // 触发垃圾回收（如果支持）
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * 性能指标缓冲区管理
     */
    addMetricToBuffer(metric) {
        this.metricsBuffer.push({
            ...metric,
            timestamp: Date.now()
        });
        
        if (this.metricsBuffer.length > this.bufferSize) {
            this.flushMetricsBuffer();
        }
    }

    flushMetricsBuffer() {
        if (this.metricsBuffer.length === 0) return;
        
        // 发送缓冲的指标数据
        const metricsToSend = [...this.metricsBuffer];
        this.metricsBuffer = [];
        
        this.sendMetricsData(metricsToSend);
    }

    sendMetricsData(metrics) {
        // 可以发送到分析服务器或本地存储
        try {
            console.log('📊 发送性能指标:', metrics.length, '条记录');
            
            // 存储到本地用于分析
            const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
            const combinedMetrics = [...existingMetrics, ...metrics];
            
            // 保持最近1000条记录
            const recentMetrics = combinedMetrics.slice(-1000);
            localStorage.setItem('performance_metrics', JSON.stringify(recentMetrics));
            
        } catch (error) {
            console.error('发送性能指标失败:', error);
        }
    }

    getCurrentMetrics() {
        return {
            lcp: this.metrics.lcp || 0,
            fid: this.metrics.fid || 0,
            cls: this.metrics.cls || 0,
            memory: this.getMemoryUsagePercent()
        };
    }

    getMemoryUsagePercent() {
        if ('memory' in performance) {
            return (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit);
        }
        return 0;
    }

    /**
     * 销毁性能优化器
     */
    destroy() {
        // 断开所有观察器
        Object.values(this.observers).forEach(observer => {
            if (observer && observer.disconnect) {
                observer.disconnect();
            }
        });
        
        // 发送最终性能数据
        this.sendPerformanceData();
        
        this.isMonitoring = false;
        console.log('⚡ 性能优化管理器已销毁');
    }
}

// 创建全局实例
window.PerformanceOptimizer = new PerformanceOptimizer();
