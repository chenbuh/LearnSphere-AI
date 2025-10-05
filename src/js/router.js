/**
 * 简单的前端路由管理器
 * 支持哈希路由和历史记录管理
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.historyIndex = -1;
        
        // 性能优化：路由缓存和预加载
        this.routeCache = new Map();
        this.preloadedRoutes = new Set();
        this.routeMetrics = new Map();
        
        // 防抖导航
        this.debouncedNavigate = Utils.debounce(this._navigate.bind(this), 100);
        
        // 路由守卫
        this.beforeHooks = [];
        this.afterHooks = [];
        
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定路由事件
     */
    bindEvents() {
        // 监听哈希变化
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });

        // 监听页面加载
        window.addEventListener('load', () => {
            this.handleRouteChange();
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigate(e.state.route, false);
            }
        });
    }

    /**
     * 添加路由
     * @param {string} path - 路由路径
     * @param {Function} handler - 路由处理函数
     * @param {Object} options - 路由选项
     */
    addRoute(path, handler, options = {}) {
        this.routes.set(path, {
            handler,
            options,
            middleware: options.middleware || []
        });
    }

    /**
     * 移除路由
     * @param {string} path - 路由路径
     */
    removeRoute(path) {
        this.routes.delete(path);
    }

    /**
     * 导航到指定路由
     * @param {string} path - 目标路径
     * @param {boolean} addToHistory - 是否添加到历史记录
     * @param {Object} state - 路由状态数据
     */
    navigate(path, addToHistory = true, state = {}) {
        const route = this.routes.get(path);
        
        if (!route) {
            console.warn(`路由 "${path}" 未找到`);
            return;
        }

        try {
            // 执行中间件
            for (const middleware of route.middleware) {
                const result = middleware(path, state);
                if (result === false) {
                    console.log('路由被中间件拦截');
                    return;
                }
            }

            // 更新URL
            if (addToHistory) {
                window.location.hash = `#${path}`;
                
                // 添加到历史记录
                this.addToHistory(path, state);
                
                // 更新浏览器历史
                const stateData = { route: path, ...state };
                history.pushState(stateData, `Page: ${path}`, `#${path}`);
            }

            // 更新当前路由
            this.currentRoute = path;

            // 执行路由处理函数
            route.handler(state);

            // 触发路由变化事件
            this.onRouteChange(path, state);

        } catch (error) {
            console.error('路由导航错误:', error);
            this.handleRouteError(path, error);
        }
    }

    /**
     * 处理路由变化
     */
    handleRouteChange() {
        let path = this.getCurrentPath();
        
        // 如果没有路由，默认跳转到首页
        if (!path) {
            path = 'home';
        }

        this.navigate(path, false);
    }

    /**
     * 获取当前路径
     * @returns {string} 当前路径
     */
    getCurrentPath() {
        const hash = window.location.hash;
        return hash ? hash.substring(1) : '';
    }

    /**
     * 添加到历史记录
     * @param {string} path - 路径
     * @param {Object} state - 状态数据
     */
    addToHistory(path, state = {}) {
        // 如果当前不在历史记录的末尾，删除后面的记录
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // 添加新记录
        this.history.push({ path, state, timestamp: Date.now() });
        this.historyIndex = this.history.length - 1;

        // 限制历史记录长度
        if (this.history.length > 50) {
            this.history.shift();
            this.historyIndex--;
        }
    }

    /**
     * 后退
     */
    back() {
        if (this.canGoBack()) {
            this.historyIndex--;
            const record = this.history[this.historyIndex];
            this.navigate(record.path, false, record.state);
        }
    }

    /**
     * 前进
     */
    forward() {
        if (this.canGoForward()) {
            this.historyIndex++;
            const record = this.history[this.historyIndex];
            this.navigate(record.path, false, record.state);
        }
    }

    /**
     * 是否可以后退
     * @returns {boolean}
     */
    canGoBack() {
        return this.historyIndex > 0;
    }

    /**
     * 是否可以前进
     * @returns {boolean}
     */
    canGoForward() {
        return this.historyIndex < this.history.length - 1;
    }

    /**
     * 替换当前路由（不添加到历史记录）
     * @param {string} path - 目标路径
     * @param {Object} state - 状态数据
     */
    replace(path, state = {}) {
        const route = this.routes.get(path);
        
        if (!route) {
            console.warn(`路由 "${path}" 未找到`);
            return;
        }

        // 更新URL但不添加到历史记录
        window.location.replace(`#${path}`);
        
        // 更新当前路由
        this.currentRoute = path;
        
        // 执行路由处理函数
        route.handler(state);
        
        // 触发路由变化事件
        this.onRouteChange(path, state);
    }

    /**
     * 获取路由参数
     * @param {string} path - 路径模式
     * @param {string} actualPath - 实际路径
     * @returns {Object} 参数对象
     */
    getRouteParams(path, actualPath) {
        const pathParts = path.split('/');
        const actualParts = actualPath.split('/');
        const params = {};

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (part.startsWith(':')) {
                const paramName = part.substring(1);
                params[paramName] = actualParts[i];
            }
        }

        return params;
    }

    /**
     * 添加路由中间件
     * @param {string} path - 路由路径
     * @param {Function} middleware - 中间件函数
     */
    addMiddleware(path, middleware) {
        const route = this.routes.get(path);
        if (route) {
            route.middleware.push(middleware);
        }
    }

    /**
     * 启动路由器
     */
    start() {
        // 处理初始路由
        this.handleRouteChange();
        
        console.log('🔗 路由器已启动');
    }

    /**
     * 停止路由器
     */
    stop() {
        // 移除事件监听器
        window.removeEventListener('hashchange', this.handleRouteChange);
        window.removeEventListener('load', this.handleRouteChange);
        
        console.log('🔗 路由器已停止');
    }

    /**
     * 路由变化回调
     * @param {string} path - 新路径
     * @param {Object} state - 状态数据
     */
    onRouteChange(path, state) {
        // 触发自定义事件
        const event = new CustomEvent('routechange', {
            detail: { path, state, previous: this.currentRoute }
        });
        window.dispatchEvent(event);

        console.log(`🔗 路由变化: ${path}`);
    }

    /**
     * 路由错误处理
     * @param {string} path - 出错的路径
     * @param {Error} error - 错误对象
     */
    handleRouteError(path, error) {
        console.error(`路由 "${path}" 执行出错:`, error);
        
        // 可以在这里实现错误页面跳转
        // this.navigate('error', false, { error, originalPath: path });
    }

    /**
     * 获取所有路由
     * @returns {Array} 路由列表
     */
    getRoutes() {
        return Array.from(this.routes.keys());
    }

    /**
     * 获取历史记录
     * @returns {Array} 历史记录列表
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * 清空历史记录
     */
    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
    }

    /**
     * 预加载路由
     * @param {string} path - 要预加载的路径
     */
    preload(path) {
        const route = this.routes.get(path);
        if (route && route.options.preload) {
            route.options.preload();
        }
    }

    /**
     * 检查路由是否存在
     * @param {string} path - 路径
     * @returns {boolean}
     */
    hasRoute(path) {
        return this.routes.has(path);
    }

    /**
     * 获取当前路由信息
     * @returns {Object} 当前路由信息
     */
    getCurrentRoute() {
        return {
            path: this.currentRoute,
            canGoBack: this.canGoBack(),
            canGoForward: this.canGoForward(),
            historyLength: this.history.length
        };
    }

    /**
     * 路由缓存管理 - 性能优化
     */
    cacheRoute(path, data) {
        this.routeCache.set(path, {
            data: data,
            timestamp: Date.now(),
            accessCount: (this.routeCache.get(path)?.accessCount || 0) + 1
        });
        
        // 限制缓存大小
        if (this.routeCache.size > 20) {
            this.cleanupRouteCache();
        }
    }

    getCachedRoute(path) {
        const cached = this.routeCache.get(path);
        if (cached) {
            cached.accessCount++;
            cached.lastAccess = Date.now();
            return cached.data;
        }
        return null;
    }

    cleanupRouteCache() {
        // 按访问频率和时间清理缓存
        const entries = Array.from(this.routeCache.entries());
        entries.sort((a, b) => {
            const scoreA = a[1].accessCount * (Date.now() - a[1].timestamp);
            const scoreB = b[1].accessCount * (Date.now() - b[1].timestamp);
            return scoreA - scoreB;
        });
        
        // 删除最少使用的缓存
        const toDelete = entries.slice(0, Math.floor(entries.length / 2));
        toDelete.forEach(([path]) => this.routeCache.delete(path));
    }

    /**
     * 路由预加载 - 性能优化
     */
    preloadRoute(path) {
        if (this.preloadedRoutes.has(path) || !this.routes.has(path)) {
            return;
        }

        const route = this.routes.get(path);
        if (route.options.preloadable !== false) {
            // 预加载路由资源
            this.preloadRouteResources(path);
            this.preloadedRoutes.add(path);
            console.log(`🚀 路由预加载完成: ${path}`);
        }
    }

    preloadRouteResources(path) {
        // 预加载CSS和JS资源
        const resourceHints = document.createElement('link');
        resourceHints.rel = 'prefetch';
        resourceHints.href = `#${path}`;
        document.head.appendChild(resourceHints);
    }

    /**
     * 路由性能监控
     */
    startRouteMetrics(path) {
        this.routeMetrics.set(path, {
            startTime: performance.now(),
            path: path
        });
    }

    endRouteMetrics(path) {
        const metrics = this.routeMetrics.get(path);
        if (metrics) {
            const endTime = performance.now();
            const duration = endTime - metrics.startTime;
            
            console.log(`📊 路由 ${path} 加载时间: ${duration.toFixed(2)}ms`);
            
            // 存储性能数据
            this.storeRoutePerformance(path, duration);
            this.routeMetrics.delete(path);
        }
    }

    storeRoutePerformance(path, duration) {
        const performanceData = JSON.parse(localStorage.getItem('route_performance') || '{}');
        
        if (!performanceData[path]) {
            performanceData[path] = {
                totalTime: 0,
                count: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0
            };
        }
        
        const data = performanceData[path];
        data.totalTime += duration;
        data.count++;
        data.avgTime = data.totalTime / data.count;
        data.minTime = Math.min(data.minTime, duration);
        data.maxTime = Math.max(data.maxTime, duration);
        
        localStorage.setItem('route_performance', JSON.stringify(performanceData));
    }

    /**
     * 路由守卫 - 增强功能
     */
    beforeEach(hook) {
        this.beforeHooks.push(hook);
    }

    afterEach(hook) {
        this.afterHooks.push(hook);
    }

    async runBeforeHooks(to, from) {
        for (const hook of this.beforeHooks) {
            try {
                const result = await hook(to, from);
                if (result === false) {
                    return false; // 阻止导航
                }
            } catch (error) {
                console.error('路由守卫执行失败:', error);
                return false;
            }
        }
        return true;
    }

    async runAfterHooks(to, from) {
        for (const hook of this.afterHooks) {
            try {
                await hook(to, from);
            } catch (error) {
                console.error('路由后置钩子执行失败:', error);
            }
        }
    }

    /**
     * 优化后的导航方法
     */
    async _navigate(path, addToHistory = true) {
        const from = this.currentRoute;
        
        // 运行前置守卫
        const canNavigate = await this.runBeforeHooks(path, from);
        if (!canNavigate) {
            return false;
        }

        // 开始性能监控
        this.startRouteMetrics(path);

        try {
            // 检查缓存
            const cachedData = this.getCachedRoute(path);
            if (cachedData) {
                console.log(`⚡ 使用缓存路由: ${path}`);
            }

            // 执行原有导航逻辑
            const result = await this.executeNavigation(path, addToHistory);
            
            // 结束性能监控
            this.endRouteMetrics(path);
            
            // 运行后置钩子
            await this.runAfterHooks(path, from);
            
            // 预加载相关路由
            this.preloadRelatedRoutes(path);
            
            return result;
            
        } catch (error) {
            this.endRouteMetrics(path);
            console.error('路由导航失败:', error);
            return false;
        }
    }

    async executeNavigation(path, addToHistory) {
        if (!this.routes.has(path)) {
            console.warn(`路由不存在: ${path}`);
            return false;
        }

        const route = this.routes.get(path);
        
        // 执行中间件
        for (const middleware of route.middleware) {
            try {
                const result = await middleware(path);
                if (result === false) {
                    return false;
                }
            } catch (error) {
                console.error('路由中间件执行失败:', error);
                return false;
            }
        }

        // 执行路由处理器
        try {
            await route.handler();
            
            // 更新当前路由
            this.currentRoute = path;
            
            // 添加到历史记录
            if (addToHistory) {
                this.addToHistory(path);
            }
            
            // 更新URL哈希
            if (window.location.hash !== `#${path}`) {
                window.location.hash = path;
            }
            
            return true;
        } catch (error) {
            console.error('路由处理器执行失败:', error);
            return false;
        }
    }

    preloadRelatedRoutes(currentPath) {
        // 预加载相关路由（比如导航菜单中的其他路由）
        const relatedRoutes = this.getRelatedRoutes(currentPath);
        relatedRoutes.forEach(route => {
            setTimeout(() => this.preloadRoute(route), 100);
        });
    }

    getRelatedRoutes(currentPath) {
        // 简单的相关路由策略：返回导航中的常用路由
        const commonRoutes = ['home', 'vocabulary', 'grammar', 'statistics'];
        return commonRoutes.filter(route => route !== currentPath);
    }

    /**
     * 获取路由性能报告
     */
    getPerformanceReport() {
        const performanceData = JSON.parse(localStorage.getItem('route_performance') || '{}');
        return performanceData;
    }
}

// 导出Router类
window.Router = Router;
