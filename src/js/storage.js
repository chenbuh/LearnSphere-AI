/**
 * 数据存储管理器
 * 支持 LocalStorage、IndexedDB 和内存存储
 */

class Storage {
    static instance = null;
    
    constructor() {
        if (Storage.instance) {
            return Storage.instance;
        }
        
        this.dbName = 'EnglishExamDB';
        this.dbVersion = 1;
        this.db = null;
        
        // 性能优化：使用LRU缓存
        this.cache = this.createLRUCache(100);
        this.storageType = 'auto'; // auto, localStorage, indexedDB, memory
        
        // 性能优化：错误重试机制
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 毫秒
        
        // 性能优化：缓存管理
        this.maxCacheSize = 100;
        this.cacheCleanupInterval = 5 * 60 * 1000; // 5分钟
        
        // 性能监控
        this.stats = {
            hits: 0,
            misses: 0,
            reads: 0,
            writes: 0,
            errors: 0
        };
        
        this.init();
        Storage.instance = this;
    }

    /**
     * 创建LRU缓存
     * @param {number} capacity - 缓存容量
     * @returns {Map} LRU缓存对象
     */
    createLRUCache(capacity) {
        const cache = new Map();
        
        // 扩展Map以支持LRU
        cache.maxSize = capacity;
        
        cache.getWithLRU = function(key) {
            if (!this.has(key)) return undefined;
            
            // 更新访问顺序：删除后重新插入
            const value = this.get(key);
            this.delete(key);
            this.set(key, value);
            return value;
        };
        
        cache.setWithLRU = function(key, value) {
            // 如果已存在，先删除
            if (this.has(key)) {
                this.delete(key);
            }
            // 如果超过容量，删除最旧的项（Map的第一项）
            else if (this.size >= this.maxSize) {
                const firstKey = this.keys().next().value;
                this.delete(firstKey);
            }
            
            this.set(key, value);
        };
        
        return cache;
    }

    /**
     * 初始化存储系统
     */
    async init() {
        try {
            // 检测存储支持情况
            this.detectStorageSupport();
            
            // 根据支持情况选择存储方式
            if (this.storageType === 'auto') {
                if (this.isIndexedDBSupported()) {
                    await this.initIndexedDB();
                    this.storageType = 'indexedDB';
                } else if (this.isLocalStorageSupported()) {
                    this.storageType = 'localStorage';
                } else {
                    this.storageType = 'memory';
                }
            }
            
            console.log(`📦 存储系统已初始化 (${this.storageType})`);
            
            // 启动缓存清理
            this.startCacheCleanup();
            
        } catch (error) {
            console.error('存储系统初始化失败:', error);
            this.storageType = 'memory';
        }
    }

    /**
     * 启动缓存清理机制 - 性能优化
     */
    startCacheCleanup() {
        setInterval(() => {
            this.cleanupCache();
        }, this.cacheCleanupInterval);
    }

    /**
     * 清理过期缓存 - 性能优化（使用LRU算法自动管理）
     */
    cleanupCache() {
        // LRU算法会自动清理，这里只记录统计信息
        const hitRate = this.stats.reads > 0 
            ? ((this.stats.hits / this.stats.reads) * 100).toFixed(2)
            : 0;
        
        if (window.logger) {
            window.logger.debug('Storage', `缓存统计 - 大小: ${this.cache.size}, 命中率: ${hitRate}%`);
        }
    }

    /**
     * 重试机制包装器 - 性能优化
     */
    async withRetry(operation, context = '') {
        for (let i = 0; i < this.retryAttempts; i++) {
            try {
                return await operation();
            } catch (error) {
                const isLastAttempt = i === this.retryAttempts - 1;
                
                if (isLastAttempt) {
                    console.error(`${context} 操作失败，已重试 ${this.retryAttempts} 次:`, error);
                    throw error;
                } else {
                    console.warn(`${context} 操作失败，第 ${i + 1} 次重试:`, error.message);
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
                }
            }
        }
    }

    /**
     * 检测存储支持情况
     */
    detectStorageSupport() {
        // 检测 IndexedDB 支持
        this.indexedDBSupported = 'indexedDB' in window;
        
        // 检测 LocalStorage 支持
        this.localStorageSupported = this.testLocalStorage();
        
        console.log('存储支持情况:', {
            indexedDB: this.indexedDBSupported,
            localStorage: this.localStorageSupported
        });
    }

    /**
     * 测试 LocalStorage 是否可用
     */
    testLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 检查 IndexedDB 是否支持
     */
    isIndexedDBSupported() {
        return this.indexedDBSupported;
    }

    /**
     * 检查 LocalStorage 是否支持
     */
    isLocalStorageSupported() {
        return this.localStorageSupported;
    }

    /**
     * 初始化 IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                reject(new Error('IndexedDB 打开失败'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储空间
                if (!db.objectStoreNames.contains('user_data')) {
                    const userStore = db.createObjectStore('user_data', { keyPath: 'key' });
                    userStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('learning_data')) {
                    const learningStore = db.createObjectStore('learning_data', { keyPath: 'key' });
                    learningStore.createIndex('type', 'type', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('cache_data')) {
                    const cacheStore = db.createObjectStore('cache_data', { keyPath: 'key' });
                    cacheStore.createIndex('expiry', 'expiry', { unique: false });
                }

                // AI推荐系统相关存储
                if (!db.objectStoreNames.contains('ai_learning_activities')) {
                    const aiActivitiesStore = db.createObjectStore('ai_learning_activities', { keyPath: 'id', autoIncrement: true });
                    aiActivitiesStore.createIndex('timestamp', 'timestamp', { unique: false });
                    aiActivitiesStore.createIndex('module', 'module', { unique: false });
                    aiActivitiesStore.createIndex('contentId', 'contentId', { unique: false });
                }

                if (!db.objectStoreNames.contains('ai_recommendations')) {
                    const aiRecommendationsStore = db.createObjectStore('ai_recommendations', { keyPath: 'id', autoIncrement: true });
                    aiRecommendationsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    aiRecommendationsStore.createIndex('type', 'type', { unique: false });
                }

                if (!db.objectStoreNames.contains('ai_weakness_analysis')) {
                    const aiWeaknessStore = db.createObjectStore('ai_weakness_analysis', { keyPath: 'id', autoIncrement: true });
                    aiWeaknessStore.createIndex('timestamp', 'timestamp', { unique: false });
                    aiWeaknessStore.createIndex('examType', 'examType', { unique: false });
                }
            };
        });
    }

    /**
     * 获取数据
     * @param {string} key - 键名
     * @param {*} defaultValue - 默认值
     * @returns {Promise<*>} 数据值
     */
    async get(key, defaultValue = null) {
        try {
            this.stats.reads++;
            
            // 先从LRU缓存获取
            const cachedValue = this.cache.getWithLRU(key);
            if (cachedValue !== undefined) {
                this.stats.hits++;
                return cachedValue;
            }
            
            this.stats.misses++;
            let value;
            
            switch (this.storageType) {
                case 'indexedDB':
                    value = await this.getFromIndexedDB(key);
                    break;
                case 'localStorage':
                    value = this.getFromLocalStorage(key);
                    break;
                case 'memory':
                    value = this.getFromMemory(key);
                    break;
            }
            
            // 使用LRU策略缓存结果
            if (value !== null) {
                this.cache.setWithLRU(key, value);
            }
            
            return value !== null ? value : defaultValue;
        } catch (error) {
            this.stats.errors++;
            if (window.logger) {
                window.logger.error('Storage', `获取数据失败 (${key}):`, error);
            } else {
                console.error(`获取数据失败 (${key}):`, error);
            }
            return defaultValue;
        }
    }

    /**
     * 设置数据
     * @param {string} key - 键名
     * @param {*} value - 数据值
     * @returns {Promise<boolean>} 是否成功
     */
    async set(key, value) {
        try {
            this.stats.writes++;
            
            // 使用LRU策略更新缓存
            this.cache.setWithLRU(key, value);
            
            let success = false;
            
            switch (this.storageType) {
                case 'indexedDB':
                    success = await this.setToIndexedDB(key, value);
                    break;
                case 'localStorage':
                    success = this.setToLocalStorage(key, value);
                    break;
                case 'memory':
                    success = this.setToMemory(key, value);
                    break;
            }
            
            return success;
        } catch (error) {
            this.stats.errors++;
            if (window.logger) {
                window.logger.error('Storage', `保存数据失败 (${key}):`, error);
            } else {
                console.error(`保存数据失败 (${key}):`, error);
            }
            return false;
        }
    }

    /**
     * 删除数据
     * @param {string} key - 键名
     * @returns {Promise<boolean>} 是否成功
     */
    async remove(key) {
        try {
            // 从缓存删除
            this.cache.delete(key);
            
            let success = false;
            
            switch (this.storageType) {
                case 'indexedDB':
                    success = await this.removeFromIndexedDB(key);
                    break;
                case 'localStorage':
                    success = this.removeFromLocalStorage(key);
                    break;
                case 'memory':
                    success = this.removeFromMemory(key);
                    break;
            }
            
            return success;
        } catch (error) {
            console.error(`删除数据失败 (${key}):`, error);
            return false;
        }
    }

    /**
     * 清空所有数据
     * @returns {Promise<boolean>} 是否成功
     */
    async clear() {
        try {
            // 清空缓存
            this.cache.clear();
            
            switch (this.storageType) {
                case 'indexedDB':
                    return await this.clearIndexedDB();
                case 'localStorage':
                    return this.clearLocalStorage();
                case 'memory':
                    return this.clearMemory();
            }
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    /**
     * 获取所有键名
     * @returns {Promise<Array>} 键名数组
     */
    async keys() {
        try {
            switch (this.storageType) {
                case 'indexedDB':
                    return await this.getKeysFromIndexedDB();
                case 'localStorage':
                    return this.getKeysFromLocalStorage();
                case 'memory':
                    return this.getKeysFromMemory();
            }
        } catch (error) {
            console.error('获取键名失败:', error);
            return [];
        }
    }

    // ===== IndexedDB 相关方法 =====

    async getFromIndexedDB(key) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_data'], 'readonly');
            const store = transaction.objectStore('user_data');
            const request = store.get(key);
            
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async setToIndexedDB(key, value) {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_data'], 'readwrite');
            const store = transaction.objectStore('user_data');
            const data = {
                key,
                value,
                timestamp: Date.now()
            };
            const request = store.put(data);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async removeFromIndexedDB(key) {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_data'], 'readwrite');
            const store = transaction.objectStore('user_data');
            const request = store.delete(key);
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async clearIndexedDB() {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_data'], 'readwrite');
            const store = transaction.objectStore('user_data');
            const request = store.clear();
            
            request.onsuccess = () => {
                resolve(true);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    async getKeysFromIndexedDB() {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_data'], 'readonly');
            const store = transaction.objectStore('user_data');
            const request = store.getAllKeys();
            
            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // ===== LocalStorage 相关方法 =====

    getFromLocalStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('LocalStorage 读取失败:', error);
            return null;
        }
    }

    setToLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('LocalStorage 写入失败:', error);
            return false;
        }
    }

    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('LocalStorage 删除失败:', error);
            return false;
        }
    }

    clearLocalStorage() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('LocalStorage 清空失败:', error);
            return false;
        }
    }

    getKeysFromLocalStorage() {
        try {
            return Object.keys(localStorage);
        } catch (error) {
            console.error('LocalStorage 获取键名失败:', error);
            return [];
        }
    }

    // ===== 内存存储相关方法 =====

    getFromMemory(key) {
        return this.memoryStorage ? this.memoryStorage.get(key) : null;
    }

    setToMemory(key, value) {
        if (!this.memoryStorage) {
            this.memoryStorage = new Map();
        }
        this.memoryStorage.set(key, value);
        return true;
    }

    removeFromMemory(key) {
        if (!this.memoryStorage) {
            return true;
        }
        this.memoryStorage.delete(key);
        return true;
    }

    clearMemory() {
        if (this.memoryStorage) {
            this.memoryStorage.clear();
        }
        return true;
    }

    getKeysFromMemory() {
        return this.memoryStorage ? Array.from(this.memoryStorage.keys()) : [];
    }

    // ===== 工具方法 =====

    /**
     * 获取存储使用情况
     * @returns {Object} 存储信息
     */
    async getStorageInfo() {
        const hitRate = this.stats.reads > 0 
            ? ((this.stats.hits / this.stats.reads) * 100).toFixed(2)
            : 0;

        const info = {
            type: this.storageType,
            cacheSize: this.cache.size,
            maxCacheSize: this.maxCacheSize,
            keys: await this.keys(),
            performance: {
                ...this.stats,
                hitRate: `${hitRate}%`
            }
        };

        if (this.storageType === 'localStorage' && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                info.quota = estimate.quota;
                info.usage = estimate.usage;
                info.usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2) + '%';
            } catch (error) {
                if (window.logger) {
                    window.logger.warn('Storage', '无法获取存储配额信息:', error);
                } else {
                    console.warn('无法获取存储配额信息:', error);
                }
            }
        }

        return info;
    }

    /**
     * 导出数据
     * @returns {Promise<Object>} 所有数据
     */
    async exportData() {
        const keys = await this.keys();
        const data = {};
        
        for (const key of keys) {
            data[key] = await this.get(key);
        }
        
        return data;
    }

    /**
     * 导入数据
     * @param {Object} data - 要导入的数据
     * @returns {Promise<boolean>} 是否成功
     */
    async importData(data) {
        try {
            for (const [key, value] of Object.entries(data)) {
                await this.set(key, value);
            }
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    // ===== 静态方法 =====

    static getInstance() {
        if (!Storage.instance) {
            Storage.instance = new Storage();
        }
        return Storage.instance;
    }

    // 便捷的静态方法
    static async get(key, defaultValue) {
        const instance = Storage.getInstance();
        return await instance.get(key, defaultValue);
    }

    static async set(key, value) {
        const instance = Storage.getInstance();
        return await instance.set(key, value);
    }

    static async remove(key) {
        const instance = Storage.getInstance();
        return await instance.remove(key);
    }

    static async clear() {
        const instance = Storage.getInstance();
        return await instance.clear();
    }

    static async keys() {
        const instance = Storage.getInstance();
        return await instance.keys();
    }

    // ===== AI推荐系统专用方法 =====

    /**
     * 保存学习活动到AI专用存储
     * @param {Object} activity - 学习活动数据
     * @returns {Promise<boolean>} - 是否成功
     */
    async saveAIActivity(activity) {
        if (this.storageType === 'indexedDB' && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['ai_learning_activities'], 'readwrite');
                const store = transaction.objectStore('ai_learning_activities');
                const request = store.add(activity);
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
            });
        } else {
            // 降级到普通存储
            const activities = await this.get('ai_learning_activities', []);
            // 使用时间戳和计数器生成ID
            const counter = (this.activityCounter || 0) + 1;
            this.activityCounter = counter;
            activities.push({ ...activity, id: `${Date.now()}_${counter}` });
            return await this.set('ai_learning_activities', activities);
        }
    }

    /**
     * 获取AI学习活动数据
     * @param {Object} options - 查询选项
     * @returns {Promise<Array>} - 活动列表
     */
    async getAIActivities(options = {}) {
        if (this.storageType === 'indexedDB' && this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['ai_learning_activities'], 'readonly');
                const store = transaction.objectStore('ai_learning_activities');
                const request = store.getAll();
                
                request.onsuccess = () => {
                    let activities = request.result || [];
                    
                    // 应用过滤选项
                    if (options.module) {
                        activities = activities.filter(a => a.module === options.module);
                    }
                    if (options.limit) {
                        activities = activities.slice(-options.limit);
                    }
                    
                    resolve(activities);
                };
                request.onerror = () => resolve([]);
            });
        } else {
            // 降级到普通存储
            const activities = await this.get('ai_learning_activities', []);
            let filtered = activities;
            
            if (options.module) {
                filtered = filtered.filter(a => a.module === options.module);
            }
            if (options.limit) {
                filtered = filtered.slice(-options.limit);
            }
            
            return filtered;
        }
    }

    /**
     * 保存AI推荐数据
     * @param {Array} recommendations - 推荐列表
     * @returns {Promise<boolean>} - 是否成功
     */
    async saveAIRecommendations(recommendations) {
        const timestamp = Date.now();
        const data = { recommendations, timestamp };
        return await this.set('ai_current_recommendations', data);
    }

    /**
     * 获取AI推荐数据
     * @returns {Promise<Object|null>} - 推荐数据
     */
    async getAIRecommendations() {
        return await this.get('ai_current_recommendations', null);
    }

    /**
     * 保存薄弱点分析结果
     * @param {Object} analysis - 分析结果
     * @returns {Promise<boolean>} - 是否成功
     */
    async saveWeaknessAnalysis(analysis) {
        const timestamp = Date.now();
        const data = { analysis, timestamp };
        return await this.set('ai_weakness_analysis', data);
    }

    /**
     * 获取薄弱点分析结果
     * @returns {Promise<Object|null>} - 分析结果
     */
    async getWeaknessAnalysis() {
        return await this.get('ai_weakness_analysis', null);
    }

    /**
     * 初始化真实学习数据结构
     */
    async initRealLearningData() {
        const existingData = await this.get('learning_data');
        if (existingData) {
            console.log('📚 学习数据已存在');
            return;
        }

        console.log('🎯 正在初始化学习数据结构...');
        
        const learningData = {
            activities: [],
            progress: {
                vocabulary: { learned: 0, mastered: 0, total: 0 },
                grammar: { completed: 0, total: 20, accuracy: 0 },
                listening: { completed: 0, total: 50, hoursListened: 0 },
                reading: { completed: 0, total: 30, articlesRead: 0 }
            },
            statistics: {
                totalStudyTime: 0,
                studyDays: 0,
                currentStreak: 0,
                longestStreak: 0,
                xp: 0,
                level: 'beginner'
            },
            lastUpdated: Date.now(),
            examType: null
        };

        await this.set('learning_data', learningData);
        console.log('✅ 学习数据结构初始化完成');
    }

    /**
     * 添加真实学习活动
     * @param {Object} activityData - 活动数据
     */
    async addLearningActivity(activityData) {
        try {
            const learningData = await this.get('learning_data') || { activities: [] };
            
            const activity = {
                id: `activity_${Date.now()}_${this.getNextActivityId()}`,
                timestamp: Date.now(),
                ...activityData
            };
            
            learningData.activities.push(activity);
            learningData.lastUpdated = Date.now();
            
            await this.set('learning_data', learningData);
            console.log('✅ 学习活动已记录');
            
            return activity;
        } catch (error) {
            console.error('记录学习活动失败:', error);
            throw error;
        }
    }

    /**
     * 获取下一个活动ID
     */
    getNextActivityId() {
        const counter = (this.learningActivityCounter || 0) + 1;
        this.learningActivityCounter = counter;
        return counter.toString(36);
    }

    /**
     * 更新学习进度
     * @param {string} module - 学习模块
     * @param {Object} progressData - 进度数据
     */
    async updateLearningProgress(module, progressData) {
        try {
            const learningData = await this.get('learning_data') || {};
            
            if (!learningData.progress) {
                learningData.progress = {};
            }
            
            if (!learningData.progress[module]) {
                learningData.progress[module] = {};
            }
            
            Object.assign(learningData.progress[module], progressData);
            learningData.lastUpdated = Date.now();
            
            await this.set('learning_data', learningData);
            console.log(`✅ ${module} 进度已更新`);
        } catch (error) {
            console.error('更新学习进度失败:', error);
            throw error;
        }
    }

    // 静态方法版本的AI专用方法
    static async saveAIActivity(activity) {
        const instance = Storage.getInstance();
        return await instance.saveAIActivity(activity);
    }

    static async getAIActivities(options) {
        const instance = Storage.getInstance();
        return await instance.getAIActivities(options);
    }

    static async initRealLearningData() {
        const instance = Storage.getInstance();
        return await instance.initRealLearningData();
    }
}

// 导出Storage类
window.Storage = Storage;
