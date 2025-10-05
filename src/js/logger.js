/**
 * 统一日志管理系统
 * 提供分级日志、日志过滤、性能追踪等功能
 */

class Logger {
    static instance = null;

    constructor() {
        if (Logger.instance) {
            return Logger.instance;
        }

        // 日志级别
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            SILENT: 4
        };

        // 当前日志级别（生产环境默认WARN，开发环境INFO）
        this.currentLevel = this.isProduction() ? this.levels.WARN : this.levels.INFO;
        
        // 日志历史（循环缓冲区）
        this.maxLogHistory = 1000;
        this.logHistory = [];
        
        // 日志分组
        this.groups = new Map();
        
        // 性能监控
        this.performanceMarks = new Map();
        
        // 日志统计
        this.stats = {
            debug: 0,
            info: 0,
            warn: 0,
            error: 0
        };

        // 是否启用控制台输出
        this.enableConsole = true;
        
        // 是否启用历史记录
        this.enableHistory = true;

        // 模块过滤器（可以控制特定模块的日志）
        this.moduleFilters = new Map();

        Logger.instance = this;
    }

    /**
     * 检查是否为生产环境
     * @returns {boolean}
     */
    isProduction() {
        return location.hostname !== 'localhost' && 
               location.hostname !== '127.0.0.1' && 
               !location.hostname.includes('dev');
    }

    /**
     * 设置日志级别
     * @param {string} level - 日志级别名称
     */
    setLevel(level) {
        if (typeof level === 'string' && this.levels[level.toUpperCase()] !== undefined) {
            this.currentLevel = this.levels[level.toUpperCase()];
            this.info('Logger', `日志级别设置为: ${level.toUpperCase()}`);
        }
    }

    /**
     * 检查是否应该输出日志
     * @param {number} level - 日志级别
     * @param {string} module - 模块名称
     * @returns {boolean}
     */
    shouldLog(level, module) {
        // 检查全局级别
        if (level < this.currentLevel) {
            return false;
        }

        // 检查模块过滤器
        if (module && this.moduleFilters.has(module)) {
            return level >= this.moduleFilters.get(module);
        }

        return true;
    }

    /**
     * 设置模块日志级别
     * @param {string} module - 模块名称
     * @param {string} level - 日志级别
     */
    setModuleLevel(module, level) {
        if (typeof level === 'string' && this.levels[level.toUpperCase()] !== undefined) {
            this.moduleFilters.set(module, this.levels[level.toUpperCase()]);
        }
    }

    /**
     * 格式化日志消息
     * @param {string} level - 日志级别
     * @param {string} module - 模块名称
     * @param {Array} args - 日志参数
     * @returns {Object}
     */
    formatMessage(level, module, args) {
        const timestamp = new Date().toISOString();
        const icon = this.getLevelIcon(level);
        
        return {
            timestamp,
            level,
            module,
            icon,
            message: args,
            formatted: `[${timestamp}] ${icon} [${module}]`
        };
    }

    /**
     * 获取日志级别图标
     * @param {string} level - 日志级别
     * @returns {string}
     */
    getLevelIcon(level) {
        const icons = {
            DEBUG: '🔍',
            INFO: '📘',
            WARN: '⚠️',
            ERROR: '❌'
        };
        return icons[level] || '📝';
    }

    /**
     * 记录日志到历史
     * @param {Object} logEntry - 日志条目
     */
    addToHistory(logEntry) {
        if (!this.enableHistory) return;

        this.logHistory.push(logEntry);
        
        // 保持历史记录在限制内
        if (this.logHistory.length > this.maxLogHistory) {
            this.logHistory.shift();
        }
    }

    /**
     * DEBUG级别日志
     * @param {string} module - 模块名称
     * @param {...any} args - 日志内容
     */
    debug(module, ...args) {
        if (!this.shouldLog(this.levels.DEBUG, module)) return;

        const logEntry = this.formatMessage('DEBUG', module, args);
        this.addToHistory(logEntry);
        this.stats.debug++;

        if (this.enableConsole) {
            console.log(logEntry.formatted, ...args);
        }
    }

    /**
     * INFO级别日志
     * @param {string} module - 模块名称
     * @param {...any} args - 日志内容
     */
    info(module, ...args) {
        if (!this.shouldLog(this.levels.INFO, module)) return;

        const logEntry = this.formatMessage('INFO', module, args);
        this.addToHistory(logEntry);
        this.stats.info++;

        if (this.enableConsole) {
            console.log(logEntry.formatted, ...args);
        }
    }

    /**
     * WARN级别日志
     * @param {string} module - 模块名称
     * @param {...any} args - 日志内容
     */
    warn(module, ...args) {
        if (!this.shouldLog(this.levels.WARN, module)) return;

        const logEntry = this.formatMessage('WARN', module, args);
        this.addToHistory(logEntry);
        this.stats.warn++;

        if (this.enableConsole) {
            console.warn(logEntry.formatted, ...args);
        }
    }

    /**
     * ERROR级别日志
     * @param {string} module - 模块名称
     * @param {...any} args - 日志内容
     */
    error(module, ...args) {
        if (!this.shouldLog(this.levels.ERROR, module)) return;

        const logEntry = this.formatMessage('ERROR', module, args);
        this.addToHistory(logEntry);
        this.stats.error++;

        if (this.enableConsole) {
            console.error(logEntry.formatted, ...args);
        }
    }

    /**
     * 日志分组开始
     * @param {string} groupName - 分组名称
     */
    group(groupName) {
        if (this.enableConsole) {
            console.group(groupName);
        }
        this.groups.set(groupName, Date.now());
    }

    /**
     * 日志分组结束
     */
    groupEnd() {
        if (this.enableConsole) {
            console.groupEnd();
        }
    }

    /**
     * 性能标记开始
     * @param {string} markName - 标记名称
     */
    time(markName) {
        this.performanceMarks.set(markName, performance.now());
    }

    /**
     * 性能标记结束并输出
     * @param {string} markName - 标记名称
     * @param {string} module - 模块名称
     */
    timeEnd(markName, module = 'Performance') {
        const startTime = this.performanceMarks.get(markName);
        if (startTime !== undefined) {
            const duration = performance.now() - startTime;
            this.info(module, `⏱️ ${markName}: ${duration.toFixed(2)}ms`);
            this.performanceMarks.delete(markName);
        }
    }

    /**
     * 表格输出
     * @param {Array|Object} data - 数据
     */
    table(data) {
        if (this.enableConsole && this.currentLevel <= this.levels.INFO) {
            console.table(data);
        }
    }

    /**
     * 获取日志历史
     * @param {Object} options - 过滤选项
     * @returns {Array}
     */
    getHistory(options = {}) {
        let history = [...this.logHistory];

        if (options.level) {
            history = history.filter(log => log.level === options.level);
        }

        if (options.module) {
            history = history.filter(log => log.module === options.module);
        }

        if (options.limit) {
            history = history.slice(-options.limit);
        }

        return history;
    }

    /**
     * 导出日志
     * @param {string} format - 导出格式 ('json' | 'text')
     * @returns {string}
     */
    export(format = 'json') {
        if (format === 'json') {
            return JSON.stringify({
                stats: this.stats,
                history: this.logHistory
            }, null, 2);
        } else {
            return this.logHistory.map(log => 
                `${log.timestamp} ${log.icon} [${log.module}] ${log.message.join(' ')}`
            ).join('\n');
        }
    }

    /**
     * 清空日志历史
     */
    clear() {
        this.logHistory = [];
        this.stats = {
            debug: 0,
            info: 0,
            warn: 0,
            error: 0
        };
        if (this.enableConsole) {
            console.clear();
        }
        this.info('Logger', '日志已清空');
    }

    /**
     * 获取日志统计
     * @returns {Object}
     */
    getStats() {
        return {
            ...this.stats,
            total: this.stats.debug + this.stats.info + this.stats.warn + this.stats.error,
            historySize: this.logHistory.length
        };
    }

    /**
     * 批量日志（用于避免日志风暴）
     * @param {string} module - 模块名称
     * @param {Array} messages - 消息数组
     * @param {string} level - 日志级别
     */
    batch(module, messages, level = 'INFO') {
        if (!Array.isArray(messages) || messages.length === 0) return;

        this.group(`📦 ${module} - 批量日志 (${messages.length}条)`);
        messages.forEach((msg, index) => {
            this[level.toLowerCase()](module, `[${index + 1}/${messages.length}]`, msg);
        });
        this.groupEnd();
    }

    /**
     * 获取实例（单例模式）
     * @returns {Logger}
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // 静态便捷方法
    static debug(module, ...args) {
        return Logger.getInstance().debug(module, ...args);
    }

    static info(module, ...args) {
        return Logger.getInstance().info(module, ...args);
    }

    static warn(module, ...args) {
        return Logger.getInstance().warn(module, ...args);
    }

    static error(module, ...args) {
        return Logger.getInstance().error(module, ...args);
    }

    static time(markName) {
        return Logger.getInstance().time(markName);
    }

    static timeEnd(markName, module) {
        return Logger.getInstance().timeEnd(markName, module);
    }

    static group(groupName) {
        return Logger.getInstance().group(groupName);
    }

    static groupEnd() {
        return Logger.getInstance().groupEnd();
    }
}

// 创建全局实例
const logger = Logger.getInstance();

// 根据环境设置默认日志级别
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    logger.setLevel('DEBUG');
} else {
    logger.setLevel('INFO');
}

// 导出
window.Logger = Logger;
window.logger = logger;

console.log('📝 统一日志系统已加载');

