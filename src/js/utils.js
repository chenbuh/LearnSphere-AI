/**
 * 工具函数库
 * 包含常用的工具函数和辅助方法
 */

const Utils = {
    /**
     * 参数验证辅助方法
     */
    _validateParam(value, type, paramName) {
        if (type === 'function' && typeof value !== 'function') {
            throw new TypeError(`${paramName} must be a function`);
        }
        if (type === 'number' && (typeof value !== 'number' || isNaN(value))) {
            throw new TypeError(`${paramName} must be a valid number`);
        }
        if (type === 'string' && typeof value !== 'string') {
            throw new TypeError(`${paramName} must be a string`);
        }
        if (type === 'array' && !Array.isArray(value)) {
            throw new TypeError(`${paramName} must be an array`);
        }
        if (type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
            throw new TypeError(`${paramName} must be an object`);
        }
    },

    /**
     * 防抖函数（增强版，添加参数验证）
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @param {boolean} immediate - 是否立即执行
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait, immediate = false) {
        try {
            this._validateParam(func, 'function', 'func');
            this._validateParam(wait, 'number', 'wait');
            
            if (wait < 0) {
                throw new RangeError('wait time must be positive');
            }
        } catch (error) {
            console.error('Debounce validation error:', error);
            return func; // 返回原函数作为降级方案
        }

        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) {
                    try {
                        func.apply(this, args);
                    } catch (error) {
                        console.error('Debounce execution error:', error);
                    }
                }
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                try {
                    func.apply(this, args);
                } catch (error) {
                    console.error('Debounce immediate execution error:', error);
                }
            }
        };
    },

    /**
     * 节流函数（增强版，添加参数验证）
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, limit) {
        try {
            this._validateParam(func, 'function', 'func');
            this._validateParam(limit, 'number', 'limit');
            
            if (limit < 0) {
                throw new RangeError('limit time must be positive');
            }
        } catch (error) {
            console.error('Throttle validation error:', error);
            return func; // 返回原函数作为降级方案
        }

        let inThrottle;
        let lastResult;
        return function(...args) {
            if (!inThrottle) {
                try {
                    lastResult = func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                } catch (error) {
                    console.error('Throttle execution error:', error);
                }
            }
            return lastResult;
        };
    },

    /**
     * 深拷贝对象（增强版，添加大小限制和错误处理）
     * @param {*} obj - 要拷贝的对象
     * @param {WeakMap} visited - 访问记录（防止循环引用）
     * @param {number} maxDepth - 最大深度限制
     * @param {number} currentDepth - 当前深度
     * @returns {*} 拷贝后的对象
     */
    deepClone(obj, visited = new WeakMap(), maxDepth = 100, currentDepth = 0) {
        try {
            // 防止过深的递归
            if (currentDepth > maxDepth) {
                console.warn('Deep clone reached maximum depth, returning original object');
                return obj;
            }

            // 处理原始类型和null
            if (obj === null || typeof obj !== "object") {
                return obj;
            }
            
            // 防止循环引用
            if (visited.has(obj)) {
                return visited.get(obj);
            }
            
            // 处理日期对象
            if (obj instanceof Date) {
                return new Date(obj.getTime());
            }
            
            // 处理正则表达式
            if (obj instanceof RegExp) {
                return new RegExp(obj.source, obj.flags);
            }
            
            // 处理Map
            if (obj instanceof Map) {
                const cloned = new Map();
                visited.set(obj, cloned);
                obj.forEach((value, key) => {
                    cloned.set(key, this.deepClone(value, visited, maxDepth, currentDepth + 1));
                });
                return cloned;
            }
            
            // 处理Set
            if (obj instanceof Set) {
                const cloned = new Set();
                visited.set(obj, cloned);
                obj.forEach(value => {
                    cloned.add(this.deepClone(value, visited, maxDepth, currentDepth + 1));
                });
                return cloned;
            }
            
            // 处理数组
            if (Array.isArray(obj)) {
                const cloned = [];
                visited.set(obj, cloned);
                obj.forEach((item, index) => {
                    cloned[index] = this.deepClone(item, visited, maxDepth, currentDepth + 1);
                });
                return cloned;
            }
            
            // 处理普通对象
            if (typeof obj === "object") {
                const cloned = {};
                visited.set(obj, cloned);
                
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        cloned[key] = this.deepClone(obj[key], visited, maxDepth, currentDepth + 1);
                    }
                }
                return cloned;
            }
            
            return obj;
        } catch (error) {
            console.error('Deep clone error:', error);
            return obj; // 返回原对象作为降级方案
        }
    },

    /**
     * 合并对象
     * @param {Object} target - 目标对象
     * @param {...Object} sources - 源对象
     * @returns {Object} 合并后的对象
     */
    merge(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.merge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.merge(target, ...sources);
    },

    /**
     * 判断是否为对象
     * @param {*} item - 要判断的项
     * @returns {boolean} 是否为对象
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /**
     * 生成随机ID
     * @param {number} length - ID长度
     * @returns {string} 随机ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * 生成UUID
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 格式化日期
     * @param {Date|string|number} date - 日期
     * @param {string} format - 格式字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 格式化时间间隔
     * @param {number} milliseconds - 毫秒数
     * @returns {string} 格式化后的时间
     */
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
        } else if (hours > 0) {
            return `${hours}小时 ${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟 ${seconds % 60}秒`;
        } else {
            return `${seconds}秒`;
        }
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 获取URL参数
     * @param {string} param - 参数名
     * @param {string} url - URL（可选，默认当前页面）
     * @returns {string|null} 参数值
     */
    getUrlParam(param, url = window.location.href) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get(param);
    },

    /**
     * 设置URL参数
     * @param {string} param - 参数名
     * @param {string} value - 参数值
     * @param {boolean} pushState - 是否更新历史记录
     */
    setUrlParam(param, value, pushState = false) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        
        if (pushState) {
            window.history.pushState({}, '', url);
        } else {
            window.history.replaceState({}, '', url);
        }
    },

    /**
     * 验证邮箱格式
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否有效
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * 验证手机号格式（中国）
     * @param {string} phone - 手机号
     * @returns {boolean} 是否有效
     */
    isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    },

    /**
     * 转义HTML字符
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * 反转义HTML字符
     * @param {string} text - 要反转义的文本
     * @returns {string} 反转义后的文本
     */
    unescapeHtml(text) {
        const map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
    },

    /**
     * 截断文本
     * @param {string} text - 原文本
     * @param {number} length - 最大长度
     * @param {string} suffix - 后缀
     * @returns {string} 截断后的文本
     */
    truncateText(text, length, suffix = '...') {
        if (text.length <= length) {
            return text;
        }
        return text.substring(0, length) + suffix;
    },

    /**
     * 数组去重
     * @param {Array} array - 原数组
     * @returns {Array} 去重后的数组
     */
    uniqueArray(array) {
        return [...new Set(array)];
    },

    /**
     * 数组分组
     * @param {Array} array - 原数组
     * @param {Function|string} key - 分组依据
     * @returns {Object} 分组后的对象
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = typeof key === 'function' ? key(item) : item[key];
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    },

    /**
     * 数组随机排序
     * @param {Array} array - 原数组
     * @returns {Array} 随机排序后的数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * 获取随机数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机数
     */
    randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 获取随机元素
     * @param {Array} array - 数组
     * @returns {*} 随机元素
     */
    randomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    /**
     * 延迟执行
     * @param {number} ms - 延迟时间（毫秒）
     * @returns {Promise} Promise对象
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * 重试函数
     * @param {Function} fn - 要重试的函数
     * @param {number} retries - 重试次数
     * @param {number} delay - 重试间隔（毫秒）
     * @returns {Promise} Promise对象
     */
    async retry(fn, retries = 3, delay = 1000) {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0) {
                await this.delay(delay);
                return this.retry(fn, retries - 1, delay);
            }
            throw error;
        }
    },

    /**
     * 检测设备类型
     * @returns {string} 设备类型
     */
    detectDevice() {
        const userAgent = navigator.userAgent;
        
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    },

    /**
     * 检测浏览器类型
     * @returns {string} 浏览器类型
     */
    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';
        return 'Unknown';
    },

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 是否成功
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                return result;
            }
        } catch (error) {
            console.error('复制失败:', error);
            return false;
        }
    },

    /**
     * 下载文件
     * @param {string} url - 文件URL
     * @param {string} filename - 文件名
     */
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    /**
     * 下载JSON数据
     * @param {Object} data - 数据对象
     * @param {string} filename - 文件名
     */
    downloadJSON(data, filename = 'data.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        this.downloadFile(url, filename);
        URL.revokeObjectURL(url);
    },

    /**
     * 颜色转换
     */
    color: {
        /**
         * HEX转RGB
         * @param {string} hex - HEX颜色值
         * @returns {Object} RGB对象
         */
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        /**
         * RGB转HEX
         * @param {number} r - 红色值
         * @param {number} g - 绿色值
         * @param {number} b - 蓝色值
         * @returns {string} HEX颜色值
         */
        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
    },

    /**
     * 本地化相关
     */
    i18n: {
        /**
         * 获取浏览器语言
         * @returns {string} 语言代码
         */
        getLanguage() {
            return navigator.language || navigator.userLanguage || 'en';
        },

        /**
         * 格式化数字
         * @param {number} number - 数字
         * @param {string} locale - 语言代码
         * @returns {string} 格式化后的数字
         */
        formatNumber(number, locale = 'zh-CN') {
            return new Intl.NumberFormat(locale).format(number);
        },

        /**
         * 格式化货币
         * @param {number} amount - 金额
         * @param {string} currency - 货币代码
         * @param {string} locale - 语言代码
         * @returns {string} 格式化后的货币
         */
        formatCurrency(amount, currency = 'CNY', locale = 'zh-CN') {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(amount);
        }
    },

    /**
     * 性能优化相关工具方法
     */
    performance: {
        /**
         * 创建防抖函数的缓存版本
         * @param {Function} func - 要缓存的函数
         * @param {number} wait - 等待时间
         * @param {string} key - 缓存键
         * @returns {Function} 缓存的防抖函数
         */
        cachedDebounce(func, wait, key) {
            if (!this._debouncedCache) {
                this._debouncedCache = new Map();
            }
            
            if (!this._debouncedCache.has(key)) {
                this._debouncedCache.set(key, Utils.debounce(func, wait));
            }
            
            return this._debouncedCache.get(key);
        },

        /**
         * 批量DOM操作优化
         * @param {Function} operations - DOM操作函数
         * @returns {*} 操作结果
         */
        batchDOMOperations(operations) {
            const fragment = document.createDocumentFragment();
            const result = operations(fragment);
            return result;
        },

        /**
         * 延迟执行优化
         * @param {Function} callback - 回调函数
         * @param {number} delay - 延迟时间，默认为下一帧
         * @returns {Promise}
         */
        defer(callback, delay = 0) {
            return new Promise(resolve => {
                if (delay === 0 && window.requestAnimationFrame) {
                    requestAnimationFrame(() => {
                        const result = callback();
                        resolve(result);
                    });
                } else {
                    setTimeout(() => {
                        const result = callback();
                        resolve(result);
                    }, delay);
                }
            });
        },

        /**
         * 内存使用监控
         * @returns {Object} 内存使用情况
         */
        getMemoryUsage() {
            if ('memory' in performance) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    usage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
                };
            }
            return null;
        }
    }
};

// 导出Utils对象
window.Utils = Utils;
