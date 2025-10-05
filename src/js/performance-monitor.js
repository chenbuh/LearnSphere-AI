/**
 * 性能监控工具
 * 提供性能指标收集、分析和优化建议
 */

class PerformanceMonitor {
    static instance = null;

    constructor() {
        if (PerformanceMonitor.instance) {
            return PerformanceMonitor.instance;
        }

        // 性能指标
        this.metrics = {
            // 页面加载性能
            pageLoad: {
                domContentLoaded: 0,
                loadComplete: 0,
                firstPaint: 0,
                firstContentfulPaint: 0,
                largestContentfulPaint: 0,
                timeToInteractive: 0
            },
            
            // 资源加载性能
            resources: [],
            
            // 长任务
            longTasks: [],
            
            // 内存使用
            memory: {
                samples: [],
                maxSamples: 100
            },
            
            // 自定义指标
            custom: new Map(),
            
            // FPS监控
            fps: {
                samples: [],
                current: 0,
                average: 0
            }
        };

        // 性能观察器
        this.observers = {
            longTask: null,
            paint: null,
            resource: null,
            navigation: null,
            layoutShift: null
        };

        // 警告阈值
        this.thresholds = {
            longTask: 50, // 长任务阈值（ms）
            fps: 30, // 最低FPS
            memory: 100, // 内存增长警告（MB）
            resourceLoadTime: 3000, // 资源加载时间警告（ms）
            lcpThreshold: 2500 // LCP警告阈值（ms）
        };

        // FPS监控
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsInterval = null;

        // 内存监控
        this.memoryInterval = null;

        PerformanceMonitor.instance = this;
    }

    /**
     * 初始化性能监控
     */
    async init() {
        if (window.logger) {
            window.logger.info('PerformanceMonitor', '初始化性能监控系统...');
        }

        try {
            // 收集页面加载性能
            this.collectPageLoadMetrics();

            // 设置性能观察器
            this.setupPerformanceObservers();

            // 启动FPS监控
            this.startFPSMonitoring();

            // 启动内存监控
            this.startMemoryMonitoring();

            // 监听页面可见性变化
            this.setupVisibilityMonitoring();

            if (window.logger) {
                window.logger.info('PerformanceMonitor', '性能监控系统已启动');
            }
        } catch (error) {
            console.error('性能监控初始化失败:', error);
        }
    }

    /**
     * 收集页面加载性能指标
     */
    collectPageLoadMetrics() {
        if (!window.performance || !window.performance.timing) {
            return;
        }

        // 等待页面完全加载
        if (document.readyState === 'complete') {
            this._extractLoadMetrics();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this._extractLoadMetrics(), 0);
            });
        }
    }

    /**
     * 提取加载性能指标
     */
    _extractLoadMetrics() {
        const timing = performance.timing;
        const navigation = performance.getEntriesByType('navigation')[0];

        // 基础加载时间
        this.metrics.pageLoad = {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            loadComplete: timing.loadEventEnd - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnection: timing.connectEnd - timing.connectStart,
            serverResponse: timing.responseEnd - timing.requestStart,
            domParsing: timing.domComplete - timing.domInteractive,
            resourceLoading: timing.loadEventStart - timing.domContentLoadedEventEnd
        };

        // Paint Timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            if (entry.name === 'first-paint') {
                this.metrics.pageLoad.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
                this.metrics.pageLoad.firstContentfulPaint = entry.startTime;
            }
        });

        if (window.logger) {
            window.logger.info('PerformanceMonitor', '页面加载性能已收集', this.metrics.pageLoad);
        }

        // 分析并提供建议
        this.analyzePageLoad();
    }

    /**
     * 设置性能观察器
     */
    setupPerformanceObservers() {
        if (!window.PerformanceObserver) {
            return;
        }

        try {
            // 长任务观察
            if (PerformanceObserver.supportedEntryTypes.includes('longtask')) {
                this.observers.longTask = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics.longTasks.push({
                            duration: entry.duration,
                            startTime: entry.startTime,
                            name: entry.name
                        });

                        if (entry.duration > this.thresholds.longTask) {
                            if (window.logger) {
                                window.logger.warn('PerformanceMonitor', 
                                    `检测到长任务: ${entry.duration.toFixed(2)}ms`);
                            }
                        }
                    }
                });
                this.observers.longTask.observe({ entryTypes: ['longtask'] });
            }

            // LCP观察
            if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
                this.observers.paint = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.pageLoad.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;

                    if (this.metrics.pageLoad.largestContentfulPaint > this.thresholds.lcpThreshold) {
                        if (window.logger) {
                            window.logger.warn('PerformanceMonitor', 
                                `LCP性能较差: ${this.metrics.pageLoad.largestContentfulPaint.toFixed(2)}ms`);
                        }
                    }
                });
                this.observers.paint.observe({ entryTypes: ['largest-contentful-paint'] });
            }

            // 资源加载观察
            if (PerformanceObserver.supportedEntryTypes.includes('resource')) {
                this.observers.resource = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics.resources.push({
                            name: entry.name,
                            type: entry.initiatorType,
                            duration: entry.duration,
                            size: entry.transferSize,
                            startTime: entry.startTime
                        });

                        // 检测慢资源
                        if (entry.duration > this.thresholds.resourceLoadTime) {
                            if (window.logger) {
                                window.logger.warn('PerformanceMonitor', 
                                    `慢资源加载: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                            }
                        }
                    }
                });
                this.observers.resource.observe({ entryTypes: ['resource'] });
            }

            // Layout Shift观察
            if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
                let clsValue = 0;
                this.observers.layoutShift = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    }
                    this.metrics.pageLoad.cumulativeLayoutShift = clsValue;
                });
                this.observers.layoutShift.observe({ entryTypes: ['layout-shift'] });
            }

        } catch (error) {
            console.error('设置性能观察器失败:', error);
        }
    }

    /**
     * 启动FPS监控
     */
    startFPSMonitoring() {
        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                this.metrics.fps.current = fps;
                this.metrics.fps.samples.push(fps);

                // 保持最近100个样本
                if (this.metrics.fps.samples.length > 100) {
                    this.metrics.fps.samples.shift();
                }

                // 计算平均FPS
                this.metrics.fps.average = Math.round(
                    this.metrics.fps.samples.reduce((a, b) => a + b, 0) / this.metrics.fps.samples.length
                );

                // 警告低FPS
                if (fps < this.thresholds.fps && window.logger) {
                    window.logger.warn('PerformanceMonitor', `FPS过低: ${fps}`);
                }

                frames = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    /**
     * 启动内存监控
     */
    startMemoryMonitoring() {
        if (!performance.memory) {
            return;
        }

        this.memoryInterval = setInterval(() => {
            const memoryInfo = {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };

            this.metrics.memory.samples.push(memoryInfo);

            // 保持最近100个样本
            if (this.metrics.memory.samples.length > this.metrics.memory.maxSamples) {
                this.metrics.memory.samples.shift();
            }

            // 检测内存泄漏
            this.detectMemoryLeak();

        }, 10000); // 每10秒采样一次
    }

    /**
     * 检测内存泄漏
     */
    detectMemoryLeak() {
        const samples = this.metrics.memory.samples;
        if (samples.length < 5) return;

        // 获取最近5个样本
        const recent = samples.slice(-5);
        const first = recent[0].usedJSHeapSize;
        const last = recent[recent.length - 1].usedJSHeapSize;
        const growth = (last - first) / 1024 / 1024; // MB

        // 如果内存持续增长超过阈值
        if (growth > this.thresholds.memory) {
            if (window.logger) {
                window.logger.warn('PerformanceMonitor', 
                    `可能存在内存泄漏，内存增长: ${growth.toFixed(2)}MB`);
            }
        }
    }

    /**
     * 设置页面可见性监控
     */
    setupVisibilityMonitoring() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停一些监控
                if (window.logger) {
                    window.logger.debug('PerformanceMonitor', '页面隐藏，暂停部分监控');
                }
            } else {
                // 页面可见时恢复监控
                if (window.logger) {
                    window.logger.debug('PerformanceMonitor', '页面可见，恢复监控');
                }
            }
        });
    }

    /**
     * 分析页面加载性能
     */
    analyzePageLoad() {
        const suggestions = [];
        const metrics = this.metrics.pageLoad;

        if (metrics.domContentLoaded > 3000) {
            suggestions.push('DOM加载时间较长，建议减少同步脚本或优化HTML结构');
        }

        if (metrics.serverResponse > 600) {
            suggestions.push('服务器响应时间较慢，建议优化后端性能或使用CDN');
        }

        if (metrics.firstContentfulPaint > 1800) {
            suggestions.push('首次内容绘制较慢，建议优化关键渲染路径');
        }

        if (suggestions.length > 0 && window.logger) {
            window.logger.group('性能优化建议');
            suggestions.forEach(s => window.logger.info('PerformanceMonitor', s));
            window.logger.groupEnd();
        }

        return suggestions;
    }

    /**
     * 标记自定义性能指标
     * @param {string} name - 指标名称
     */
    mark(name) {
        performance.mark(name);
    }

    /**
     * 测量两个标记之间的时间
     * @param {string} name - 测量名称
     * @param {string} startMark - 开始标记
     * @param {string} endMark - 结束标记
     */
    measure(name, startMark, endMark) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            this.metrics.custom.set(name, {
                duration: measure.duration,
                startTime: measure.startTime
            });

            if (window.logger) {
                window.logger.debug('PerformanceMonitor', 
                    `${name}: ${measure.duration.toFixed(2)}ms`);
            }

            return measure.duration;
        } catch (error) {
            console.error('Performance measure error:', error);
            return null;
        }
    }

    /**
     * 获取性能报告
     * @returns {Object} 性能报告
     */
    getReport() {
        return {
            pageLoad: this.metrics.pageLoad,
            fps: {
                current: this.metrics.fps.current,
                average: this.metrics.fps.average,
                min: Math.min(...this.metrics.fps.samples),
                max: Math.max(...this.metrics.fps.samples)
            },
            memory: this.getMemoryReport(),
            resources: {
                total: this.metrics.resources.length,
                slowResources: this.metrics.resources.filter(r => 
                    r.duration > this.thresholds.resourceLoadTime
                ).length
            },
            longTasks: {
                total: this.metrics.longTasks.length,
                totalDuration: this.metrics.longTasks.reduce((sum, t) => sum + t.duration, 0)
            },
            custom: Object.fromEntries(this.metrics.custom)
        };
    }

    /**
     * 获取内存报告
     * @returns {Object} 内存报告
     */
    getMemoryReport() {
        if (this.metrics.memory.samples.length === 0) {
            return null;
        }

        const latest = this.metrics.memory.samples[this.metrics.memory.samples.length - 1];
        const usedMB = (latest.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const totalMB = (latest.totalJSHeapSize / 1024 / 1024).toFixed(2);
        const limitMB = (latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2);

        return {
            used: `${usedMB} MB`,
            total: `${totalMB} MB`,
            limit: `${limitMB} MB`,
            usage: `${((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100).toFixed(2)}%`
        };
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 停止观察器
        Object.values(this.observers).forEach(observer => {
            if (observer) {
                observer.disconnect();
            }
        });

        // 清除定时器
        if (this.fpsInterval) clearInterval(this.fpsInterval);
        if (this.memoryInterval) clearInterval(this.memoryInterval);

        if (window.logger) {
            window.logger.info('PerformanceMonitor', '性能监控已停止');
        }
    }

    /**
     * 获取实例
     * @returns {PerformanceMonitor}
     */
    static getInstance() {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }
}

// 创建全局实例
window.PerformanceMonitor = PerformanceMonitor;
window.performanceMonitor = PerformanceMonitor.getInstance();

// 自动初始化（页面加载完成后）
if (document.readyState === 'complete') {
    window.performanceMonitor.init();
} else {
    window.addEventListener('load', () => {
        window.performanceMonitor.init();
    });
}

console.log('📊 性能监控工具已加载');

