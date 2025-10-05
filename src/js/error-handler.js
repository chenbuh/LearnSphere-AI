/**
 * 全局错误处理器
 * 提供统一的错误捕获、报告和恢复机制
 */

class GlobalErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.maxErrorQueueSize = 100;
        this.errorFrequency = new Map();
        this.errorThresholds = {
            frequency: 5, // 5分钟内同类错误超过阈值
            timeWindow: 5 * 60 * 1000 // 5分钟时间窗口
        };
        
        // 错误分类
        this.errorCategories = {
            NETWORK: 'network',
            JAVASCRIPT: 'javascript',
            RESOURCE: 'resource',
            PROMISE: 'promise',
            STORAGE: 'storage',
            API: 'api',
            USER: 'user'
        };

        // 错误聚合（相似错误分组）
        this.errorGroups = new Map();
        this.groupingEnabled = true;
        
        // 错误过滤规则
        this.filterRules = [
            // 过滤常见的浏览器扩展错误
            { pattern: /chrome-extension:\/\//, reason: 'Browser extension error' },
            { pattern: /^Script error\.?$/, reason: 'Cross-origin script error' },
            // 过滤已知的第三方库错误（可配置）
            { pattern: /gtag|analytics/, reason: 'Analytics error' }
        ];

        // 恢复策略
        this.recoveryStrategies = new Map();
        
        // 错误统计增强
        this.stats = {
            total: 0,
            filtered: 0,
            grouped: 0,
            recovered: 0,
            bySeverity: { low: 0, medium: 0, high: 0 },
            byCategory: {}
        };
        
        this.init();
    }

    init() {
        console.log('🛡️ 初始化全局错误处理器...');
        this.setupErrorListeners();
        this.setupRecoveryStrategies();
        this.startErrorReporting();
    }

    /**
     * 设置错误监听器
     */
    setupErrorListeners() {
        // JavaScript错误
        window.addEventListener('error', (event) => {
            this.handleError({
                type: this.errorCategories.JAVASCRIPT,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Promise拒绝错误
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: this.errorCategories.PROMISE,
                message: event.reason?.message || '未处理的Promise拒绝',
                reason: event.reason,
                stack: event.reason?.stack,
                timestamp: Date.now()
            });
        });

        // 资源加载错误
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: this.errorCategories.RESOURCE,
                    message: `资源加载失败: ${event.target.src || event.target.href}`,
                    target: event.target,
                    timestamp: Date.now()
                });
            }
        }, true);

        // 网络错误（通过fetch包装）
        this.wrapFetch();
        
        // 存储错误
        this.wrapStorage();

        console.log('✅ 错误监听器已设置');
    }

    /**
     * 包装fetch以捕获网络错误
     */
    wrapFetch() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch.apply(window, args);
                
                if (!response.ok) {
                    this.handleError({
                        type: this.errorCategories.NETWORK,
                        message: `网络请求失败: ${response.status} ${response.statusText}`,
                        url: args[0],
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: Date.now()
                    });
                }
                
                return response;
            } catch (error) {
                this.handleError({
                    type: this.errorCategories.NETWORK,
                    message: `网络请求异常: ${error.message}`,
                    url: args[0],
                    error: error,
                    stack: error.stack,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }

    /**
     * 包装localStorage以捕获存储错误
     */
    wrapStorage() {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = (key, value) => {
            try {
                return originalSetItem.call(localStorage, key, value);
            } catch (error) {
                this.handleError({
                    type: this.errorCategories.STORAGE,
                    message: `存储操作失败: ${error.message}`,
                    key: key,
                    error: error,
                    timestamp: Date.now()
                });
                throw error;
            }
        };
    }

    /**
     * 处理错误（增强版）
     */
    handleError(errorInfo) {
        this.stats.total++;

        // 应用过滤规则
        if (this.shouldFilterError(errorInfo)) {
            this.stats.filtered++;
            return; // 过滤掉不需要的错误
        }

        // 标准化错误信息
        const standardizedError = this.standardizeError(errorInfo);
        
        // 错误聚合
        if (this.groupingEnabled) {
            const grouped = this.groupError(standardizedError);
            if (grouped) {
                this.stats.grouped++;
                // 如果是已知错误组的新实例，只更新计数
                return;
            }
        }

        // 检查错误频率
        if (this.isErrorFrequent(standardizedError)) {
            if (window.logger) {
                window.logger.warn('GlobalErrorHandler', '检测到频繁错误:', standardizedError.message);
            } else {
                console.warn('⚠️ 检测到频繁错误，可能需要紧急处理:', standardizedError);
            }
        }

        // 更新统计
        this.stats.bySeverity[standardizedError.severity]++;
        this.stats.byCategory[standardizedError.type] = 
            (this.stats.byCategory[standardizedError.type] || 0) + 1;

        // 添加到错误队列
        this.addToErrorQueue(standardizedError);
        
        // 尝试恢复
        if (this.attemptRecovery(standardizedError)) {
            this.stats.recovered++;
        }
        
        // 记录错误
        this.logError(standardizedError);
        
        // 用户通知（严重错误）
        if (this.isSevereError(standardizedError)) {
            this.notifyUser(standardizedError);
        }
    }

    /**
     * 检查是否应该过滤错误
     * @param {Object} errorInfo - 错误信息
     * @returns {boolean}
     */
    shouldFilterError(errorInfo) {
        const message = errorInfo.message || '';
        const url = errorInfo.url || errorInfo.filename || '';

        for (const rule of this.filterRules) {
            if (rule.pattern.test(message) || rule.pattern.test(url)) {
                if (window.logger) {
                    window.logger.debug('GlobalErrorHandler', `过滤错误: ${rule.reason}`);
                }
                return true;
            }
        }

        return false;
    }

    /**
     * 错误聚合（将相似错误分组）
     * @param {Object} errorInfo - 错误信息
     * @returns {boolean} 是否为已存在组的错误
     */
    groupError(errorInfo) {
        const groupKey = this.generateGroupKey(errorInfo);
        
        if (this.errorGroups.has(groupKey)) {
            // 更新现有错误组
            const group = this.errorGroups.get(groupKey);
            group.count++;
            group.lastOccurrence = Date.now();
            group.instances.push({
                timestamp: errorInfo.timestamp,
                stack: errorInfo.stack
            });

            // 限制实例数量
            if (group.instances.length > 10) {
                group.instances.shift();
            }

            return true; // 已存在的错误组
        } else {
            // 创建新错误组
            this.errorGroups.set(groupKey, {
                key: groupKey,
                type: errorInfo.type,
                message: errorInfo.message,
                severity: errorInfo.severity,
                count: 1,
                firstOccurrence: Date.now(),
                lastOccurrence: Date.now(),
                instances: [{
                    timestamp: errorInfo.timestamp,
                    stack: errorInfo.stack
                }]
            });

            return false; // 新的错误组
        }
    }

    /**
     * 生成错误分组键
     * @param {Object} errorInfo - 错误信息
     * @returns {string}
     */
    generateGroupKey(errorInfo) {
        // 基于错误类型、消息和位置生成键
        const normalizedMessage = this.normalizeErrorMessage(errorInfo.message);
        const location = errorInfo.url ? errorInfo.url.split('?')[0] : 'unknown';
        return `${errorInfo.type}:${normalizedMessage}:${location}`;
    }

    /**
     * 标准化错误消息（移除动态部分）
     * @param {string} message - 原始消息
     * @returns {string}
     */
    normalizeErrorMessage(message) {
        if (!message) return 'unknown';
        
        // 移除数字、URL等动态内容
        return message
            .replace(/\d+/g, 'N') // 数字替换为N
            .replace(/https?:\/\/[^\s]+/g, 'URL') // URL替换
            .replace(/['"].*?['"]/g, 'STR') // 字符串字面量替换
            .substring(0, 100); // 限制长度
    }

    /**
     * 标准化错误信息
     */
    standardizeError(errorInfo) {
        return {
            id: this.generateErrorId(errorInfo),
            type: errorInfo.type,
            message: errorInfo.message,
            stack: errorInfo.stack,
            url: errorInfo.url || errorInfo.filename,
            timestamp: errorInfo.timestamp,
            userAgent: navigator.userAgent,
            url_current: window.location.href,
            severity: this.calculateSeverity(errorInfo),
            metadata: this.extractMetadata(errorInfo)
        };
    }

    /**
     * 生成错误ID（修复中文编码问题）
     */
    generateErrorId(errorInfo) {
        const key = `${errorInfo.type}_${errorInfo.message}_${errorInfo.url || ''}`;
        
        // 优化：使用安全的哈希方法，支持中文
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 返回16进制字符串
        return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
    }

    /**
     * 计算错误严重程度
     */
    calculateSeverity(errorInfo) {
        switch (errorInfo.type) {
            case this.errorCategories.JAVASCRIPT:
                return errorInfo.message.includes('is not defined') ? 'high' : 'medium';
            case this.errorCategories.NETWORK:
                return errorInfo.status >= 500 ? 'high' : 'medium';
            case this.errorCategories.RESOURCE:
                return 'low';
            case this.errorCategories.PROMISE:
                return 'medium';
            case this.errorCategories.STORAGE:
                return 'medium';
            default:
                return 'low';
        }
    }

    /**
     * 提取元数据
     */
    extractMetadata(errorInfo) {
        const metadata = {
            timestamp: errorInfo.timestamp,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: this.getMemoryInfo(),
            connection: this.getConnectionInfo()
        };

        if (errorInfo.target) {
            metadata.element = {
                tagName: errorInfo.target.tagName,
                src: errorInfo.target.src,
                href: errorInfo.target.href
            };
        }

        return metadata;
    }

    /**
     * 获取内存信息
     */
    getMemoryInfo() {
        if ('memory' in performance) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * 获取连接信息
     */
    getConnectionInfo() {
        if ('connection' in navigator) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            };
        }
        return null;
    }

    /**
     * 检查错误频率
     */
    isErrorFrequent(errorInfo) {
        const now = Date.now();
        const errorKey = errorInfo.id;
        
        if (!this.errorFrequency.has(errorKey)) {
            this.errorFrequency.set(errorKey, []);
        }
        
        const timestamps = this.errorFrequency.get(errorKey);
        
        // 清理过期时间戳
        const validTimestamps = timestamps.filter(ts => 
            now - ts < this.errorThresholds.timeWindow
        );
        
        validTimestamps.push(now);
        this.errorFrequency.set(errorKey, validTimestamps);
        
        return validTimestamps.length >= this.errorThresholds.frequency;
    }

    /**
     * 添加到错误队列
     */
    addToErrorQueue(errorInfo) {
        this.errorQueue.push(errorInfo);
        
        if (this.errorQueue.length > this.maxErrorQueueSize) {
            this.errorQueue.shift(); // 移除最老的错误
        }
    }

    /**
     * 设置恢复策略
     */
    setupRecoveryStrategies() {
        // 网络错误恢复
        this.recoveryStrategies.set(this.errorCategories.NETWORK, (error) => {
            if (error.metadata?.connection?.effectiveType === 'slow-2g') {
                console.log('🔄 检测到慢速网络，启用离线模式');
                this.enableOfflineMode();
            }
        });

        // JavaScript错误恢复
        this.recoveryStrategies.set(this.errorCategories.JAVASCRIPT, (error) => {
            if (error.message.includes('is not defined')) {
                console.log('🔄 尝试重新加载缺失的资源');
                this.reloadMissingResources();
            }
        });

        // 资源错误恢复
        this.recoveryStrategies.set(this.errorCategories.RESOURCE, (error) => {
            if (error.metadata?.element?.src) {
                console.log('🔄 尝试重新加载失败的资源');
                this.retryResourceLoad(error.metadata.element);
            }
        });

        // 存储错误恢复
        this.recoveryStrategies.set(this.errorCategories.STORAGE, (error) => {
            console.log('🔄 切换到内存存储模式');
            this.switchToMemoryStorage();
        });
    }

    /**
     * 尝试恢复
     * @returns {boolean} 是否成功恢复
     */
    attemptRecovery(errorInfo) {
        const strategy = this.recoveryStrategies.get(errorInfo.type);
        if (strategy) {
            try {
                strategy(errorInfo);
                if (window.logger) {
                    window.logger.info('GlobalErrorHandler', `成功应用恢复策略: ${errorInfo.type}`);
                }
                return true;
            } catch (recoveryError) {
                if (window.logger) {
                    window.logger.error('GlobalErrorHandler', '恢复策略执行失败:', recoveryError);
                } else {
                    console.error('恢复策略执行失败:', recoveryError);
                }
                return false;
            }
        }
        return false;
    }

    /**
     * 启用离线模式
     */
    enableOfflineMode() {
        if (window.app && window.app.enableOfflineMode) {
            window.app.enableOfflineMode();
        }
    }

    /**
     * 重新加载缺失资源
     */
    reloadMissingResources() {
        // 实现资源重新加载逻辑
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.dataset.loaded) {
                const newScript = script.cloneNode(true);
                script.parentNode.replaceChild(newScript, script);
            }
        });
    }

    /**
     * 重试资源加载
     */
    retryResourceLoad(element) {
        if (element.src || element.href) {
            const url = element.src || element.href;
            const retryUrl = `${url}?retry=${Date.now()}`;
            
            if (element.src) {
                element.src = retryUrl;
            } else {
                element.href = retryUrl;
            }
        }
    }

    /**
     * 切换到内存存储
     */
    switchToMemoryStorage() {
        if (window.Storage) {
            window.Storage.prototype.storageType = 'memory';
        }
    }

    /**
     * 判断是否为严重错误
     */
    isSevereError(errorInfo) {
        return errorInfo.severity === 'high' || 
               this.isErrorFrequent(errorInfo);
    }

    /**
     * 通知用户
     */
    notifyUser(errorInfo) {
        if (window.app && window.app.showNotification) {
            const message = this.getUserFriendlyMessage(errorInfo);
            window.app.showNotification(message, 'error');
        }
    }

    /**
     * 获取用户友好的错误消息
     */
    getUserFriendlyMessage(errorInfo) {
        switch (errorInfo.type) {
            case this.errorCategories.NETWORK:
                return '网络连接出现问题，请检查您的网络设置';
            case this.errorCategories.STORAGE:
                return '存储空间不足或浏览器限制，某些功能可能受限';
            case this.errorCategories.RESOURCE:
                return '某些资源加载失败，正在尝试重新加载';
            default:
                return '应用出现了一些问题，我们正在努力修复';
        }
    }

    /**
     * 记录错误（使用Logger）
     */
    logError(errorInfo) {
        if (window.logger) {
            window.logger.group(`🚨 ${errorInfo.type.toUpperCase()} 错误`);
            window.logger.error('GlobalErrorHandler', '消息:', errorInfo.message);
            window.logger.error('GlobalErrorHandler', '严重程度:', errorInfo.severity);
            window.logger.error('GlobalErrorHandler', 'URL:', errorInfo.url);
            window.logger.error('GlobalErrorHandler', '时间:', new Date(errorInfo.timestamp));
            if (errorInfo.stack) {
                window.logger.error('GlobalErrorHandler', '堆栈:', errorInfo.stack);
            }
            window.logger.error('GlobalErrorHandler', '元数据:', errorInfo.metadata);
            window.logger.groupEnd();
        } else {
            // 降级到console
            console.group(`🚨 ${errorInfo.type.toUpperCase()} 错误`);
            console.error('消息:', errorInfo.message);
            console.error('严重程度:', errorInfo.severity);
            console.error('URL:', errorInfo.url);
            console.error('时间:', new Date(errorInfo.timestamp));
            if (errorInfo.stack) {
                console.error('堆栈:', errorInfo.stack);
            }
            console.error('元数据:', errorInfo.metadata);
            console.groupEnd();
        }
    }

    /**
     * 开始错误报告
     */
    startErrorReporting() {
        // 定期发送错误报告
        setInterval(() => {
            this.sendErrorReport();
        }, 60000); // 每分钟发送一次

        // 页面卸载时发送剩余错误
        window.addEventListener('beforeunload', () => {
            this.sendErrorReport();
        });
    }

    /**
     * 发送错误报告
     */
    sendErrorReport() {
        if (this.errorQueue.length === 0) return;

        const report = {
            errors: [...this.errorQueue],
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        };

        try {
            // 存储到本地用于分析
            const existingReports = JSON.parse(localStorage.getItem('error_reports') || '[]');
            existingReports.push(report);
            
            // 保持最近50个报告
            const recentReports = existingReports.slice(-50);
            localStorage.setItem('error_reports', JSON.stringify(recentReports));
            
            console.log('📊 错误报告已保存:', report.errors.length, '个错误');
            
            // 清空错误队列
            this.errorQueue = [];
            
        } catch (error) {
            console.error('发送错误报告失败:', error);
        }
    }

    /**
     * 获取会话ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('error_session_id');
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            sessionStorage.setItem('error_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * 获取错误统计（增强版）
     */
    getErrorStats() {
        const stats = {
            summary: {
                ...this.stats,
                queueSize: this.errorQueue.length,
                groupCount: this.errorGroups.size
            },
            errorsByType: { ...this.stats.byCategory },
            errorsBySeverity: { ...this.stats.bySeverity },
            frequentErrors: [],
            errorGroups: []
        };

        // 频繁错误
        for (const [errorId, timestamps] of this.errorFrequency.entries()) {
            if (timestamps.length >= this.errorThresholds.frequency) {
                stats.frequentErrors.push({
                    id: errorId,
                    count: timestamps.length
                });
            }
        }

        // 错误组（按发生次数排序）
        const groups = Array.from(this.errorGroups.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // 取前10个

        stats.errorGroups = groups.map(group => ({
            message: group.message,
            type: group.type,
            count: group.count,
            severity: group.severity,
            firstSeen: new Date(group.firstOccurrence).toISOString(),
            lastSeen: new Date(group.lastOccurrence).toISOString()
        }));

        return stats;
    }

    /**
     * 添加自定义过滤规则
     * @param {RegExp} pattern - 匹配模式
     * @param {string} reason - 过滤原因
     */
    addFilterRule(pattern, reason) {
        this.filterRules.push({ pattern, reason });
        if (window.logger) {
            window.logger.info('GlobalErrorHandler', `添加过滤规则: ${reason}`);
        }
    }

    /**
     * 获取错误组详情
     * @param {string} groupKey - 错误组键
     * @returns {Object|null}
     */
    getErrorGroup(groupKey) {
        return this.errorGroups.get(groupKey) || null;
    }

    /**
     * 清除特定错误组
     * @param {string} groupKey - 错误组键
     */
    clearErrorGroup(groupKey) {
        this.errorGroups.delete(groupKey);
    }

    /**
     * 清理错误数据
     */
    cleanup() {
        this.errorQueue = [];
        this.errorFrequency.clear();
        localStorage.removeItem('error_reports');
        console.log('🧹 错误处理器数据已清理');
    }
}

// 创建全局实例
window.GlobalErrorHandler = new GlobalErrorHandler();

console.log('🛡️ 全局错误处理器已加载');
