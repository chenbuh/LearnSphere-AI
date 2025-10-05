/**
 * 离线学习管理器
 * 提供离线缓存和同步功能
 */
class OfflineManager {
    constructor() {
        this.isOnline = navigator.onLine;
        this.cache = null;
        this.syncQueue = [];
        this.offlineData = {};
        this.syncInProgress = false;
        this.init();
    }

    async init() {
        console.log('📱 初始化离线学习管理器...');
        
        try {
            await this.initializeCache();
            this.setupEventListeners();
            this.loadOfflineData();
            
            if ('serviceWorker' in navigator) {
                await this.registerServiceWorker();
            }
            
            console.log('✅ 离线学习管理器初始化完成');
        } catch (error) {
            console.error('❌ 离线管理器初始化失败:', error);
        }
    }

    /**
     * 初始化缓存
     */
    async initializeCache() {
        if ('caches' in window) {
            this.cache = await caches.open('learnsphere-v1');
            
            // 缓存核心资源
            const coreResources = [
                '/',
                '/src/css/main.css',
                '/src/css/components.css',
                '/src/css/themes.css',
                '/src/js/app.js',
                '/src/js/utils.js',
                '/src/js/storage.js'
            ];
            
            await this.cache.addAll(coreResources);
            console.log('📦 核心资源已缓存');
        }
    }

    /**
     * 注册Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('🔧 Service Worker已注册:', registration);
        } catch (error) {
            console.error('❌ Service Worker注册失败:', error);
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onNetworkChange('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onNetworkChange('offline');
        });

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isOnline) {
                this.syncData();
            }
        });
    }

    /**
     * 网络状态变化处理
     */
    onNetworkChange(status) {
        console.log(`🌐 网络状态: ${status}`);
        
        if (status === 'online') {
            this.showNetworkStatus('已连接到网络', 'success');
            this.syncData();
        } else {
            this.showNetworkStatus('离线模式', 'warning');
        }
        
        this.updateUI();
    }

    /**
     * 显示网络状态
     */
    showNetworkStatus(message, type) {
        // 创建状态通知
        const statusBar = document.createElement('div');
        statusBar.className = `network-status ${type}`;
        statusBar.innerHTML = `
            <div class="status-content">
                <span class="status-icon">${type === 'success' ? '🌐' : '📱'}</span>
                <span class="status-text">${message}</span>
                <button class="status-close">&times;</button>
            </div>
        `;
        
        statusBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: ${type === 'success' ? '#28a745' : '#ffc107'};
            color: ${type === 'success' ? 'white' : '#333'};
            padding: 0.5rem;
            z-index: 10000;
            text-align: center;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.insertBefore(statusBar, document.body.firstChild);
        
        // 绑定关闭事件
        statusBar.querySelector('.status-close').addEventListener('click', () => {
            statusBar.remove();
        });
        
        // 5秒后自动移除
        setTimeout(() => {
            if (statusBar.parentNode) {
                statusBar.remove();
            }
        }, 5000);
    }

    /**
     * 缓存学习内容
     */
    async cacheContent(contentType, contentId, data) {
        try {
            const cacheKey = `${contentType}_${contentId}`;
            
            // 缓存到localStorage
            this.offlineData[cacheKey] = {
                data: data,
                timestamp: Date.now(),
                type: contentType,
                id: contentId
            };
            
            this.saveOfflineData();
            
            // 缓存到Cache API（如果支持）
            if (this.cache) {
                const response = new Response(JSON.stringify(data));
                await this.cache.put(`/offline/${cacheKey}`, response);
            }
            
            console.log(`📦 内容已缓存: ${cacheKey}`);
        } catch (error) {
            console.error('❌ 缓存内容失败:', error);
        }
    }

    /**
     * 获取缓存内容
     */
    async getCachedContent(contentType, contentId) {
        try {
            const cacheKey = `${contentType}_${contentId}`;
            
            // 优先从内存缓存获取
            if (this.offlineData[cacheKey]) {
                return this.offlineData[cacheKey].data;
            }
            
            // 从Cache API获取
            if (this.cache) {
                const response = await this.cache.match(`/offline/${cacheKey}`);
                if (response) {
                    const data = await response.json();
                    return data;
                }
            }
            
            return null;
        } catch (error) {
            console.error('❌ 获取缓存内容失败:', error);
            return null;
        }
    }

    /**
     * 添加到同步队列
     */
    addToSyncQueue(action, data) {
        const syncItem = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            action: action,
            data: data,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: 3
        };
        
        this.syncQueue.push(syncItem);
        this.saveSyncQueue();
        
        console.log(`📤 已添加到同步队列: ${action}`);
        
        // 如果在线，立即尝试同步
        if (this.isOnline) {
            this.syncData();
        }
    }

    /**
     * 同步数据
     */
    async syncData() {
        if (!this.isOnline || this.syncInProgress || this.syncQueue.length === 0) {
            return;
        }
        
        this.syncInProgress = true;
        console.log('🔄 开始同步数据...');
        
        const itemsToSync = [...this.syncQueue];
        const successfulSyncs = [];
        
        for (const item of itemsToSync) {
            try {
                const success = await this.syncItem(item);
                if (success) {
                    successfulSyncs.push(item.id);
                } else {
                    item.retries++;
                    if (item.retries >= item.maxRetries) {
                        console.error(`❌ 同步失败，已达到最大重试次数: ${item.action}`);
                        successfulSyncs.push(item.id); // 移除失败的项目
                    }
                }
            } catch (error) {
                console.error(`❌ 同步项目失败: ${item.action}`, error);
                item.retries++;
            }
        }
        
        // 移除成功同步的项目
        this.syncQueue = this.syncQueue.filter(item => !successfulSyncs.includes(item.id));
        this.saveSyncQueue();
        
        this.syncInProgress = false;
        console.log(`✅ 同步完成，成功: ${successfulSyncs.length}, 剩余: ${this.syncQueue.length}`);
    }

    /**
     * 同步单个项目
     */
    async syncItem(item) {
        try {
            switch (item.action) {
                case 'update_progress':
                    return await this.syncProgress(item.data);
                case 'submit_answer':
                    return await this.syncAnswer(item.data);
                case 'complete_lesson':
                    return await this.syncLessonCompletion(item.data);
                case 'unlock_achievement':
                    return await this.syncAchievement(item.data);
                default:
                    console.warn(`⚠️ 未知的同步动作: ${item.action}`);
                    return true; // 移除未知动作
            }
        } catch (error) {
            console.error(`❌ 同步项目失败: ${item.action}`, error);
            return false;
        }
    }

    /**
     * 同步学习进度
     */
    async syncProgress(progressData) {
        // 模拟API调用
        console.log('📊 同步学习进度:', progressData);
        
        // 实际实现中，这里会调用真实的API
        await this.simulateAPICall('/api/progress', progressData);
        
        return true;
    }

    /**
     * 同步答题记录
     */
    async syncAnswer(answerData) {
        console.log('✅ 同步答题记录:', answerData);
        
        await this.simulateAPICall('/api/answers', answerData);
        
        return true;
    }

    /**
     * 同步课程完成情况
     */
    async syncLessonCompletion(lessonData) {
        console.log('📚 同步课程完成:', lessonData);
        
        await this.simulateAPICall('/api/lessons/complete', lessonData);
        
        return true;
    }

    /**
     * 同步成就解锁
     */
    async syncAchievement(achievementData) {
        console.log('🏆 同步成就解锁:', achievementData);
        
        await this.simulateAPICall('/api/achievements', achievementData);
        
        return true;
    }

    /**
     * 模拟API调用
     */
    async simulateAPICall(endpoint, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 模拟90%的成功率
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('模拟API错误'));
                }
            }, 1000 + Math.random() * 2000);
        });
    }

    /**
     * 预缓存学习内容
     */
    async precacheContent() {
        const contentToPrecache = [
            // 词汇数据
            { type: 'vocabulary', id: 'cet4_words', url: '/src/data/cet4_words.js' },
            { type: 'vocabulary', id: 'cet6_words', url: '/src/data/cet6_words.js' },
            { type: 'vocabulary', id: 'ielts_words', url: '/src/data/ielts_words.js' },
            
            // 语法练习
            { type: 'grammar', id: 'basic_grammar', url: '/api/grammar/basic' },
            { type: 'grammar', id: 'advanced_grammar', url: '/api/grammar/advanced' },
            
            // 听力材料（元数据）
            { type: 'listening', id: 'basic_listening', url: '/api/listening/basic' },
            
            // 阅读文章
            { type: 'reading', id: 'sample_articles', url: '/api/reading/articles' }
        ];
        
        for (const content of contentToPrecache) {
            try {
                const data = await this.fetchContent(content.url);
                await this.cacheContent(content.type, content.id, data);
            } catch (error) {
                console.error(`❌ 预缓存失败: ${content.type}/${content.id}`, error);
            }
        }
        
        console.log('📦 内容预缓存完成');
    }

    /**
     * 获取内容
     */
    async fetchContent(url) {
        // 模拟内容获取
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ 
                    content: `模拟内容 for ${url}`,
                    timestamp: Date.now()
                });
            }, 500);
        });
    }

    /**
     * 清理过期缓存
     */
    cleanExpiredCache() {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
        
        Object.keys(this.offlineData).forEach(key => {
            const item = this.offlineData[key];
            if (now - item.timestamp > maxAge) {
                delete this.offlineData[key];
                console.log(`🗑️ 清理过期缓存: ${key}`);
            }
        });
        
        this.saveOfflineData();
    }

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        const stats = {
            totalItems: Object.keys(this.offlineData).length,
            totalSize: 0,
            byType: {},
            oldestItem: null,
            newestItem: null
        };
        
        Object.entries(this.offlineData).forEach(([key, item]) => {
            const itemSize = JSON.stringify(item).length;
            stats.totalSize += itemSize;
            
            if (!stats.byType[item.type]) {
                stats.byType[item.type] = { count: 0, size: 0 };
            }
            stats.byType[item.type].count++;
            stats.byType[item.type].size += itemSize;
            
            if (!stats.oldestItem || item.timestamp < stats.oldestItem.timestamp) {
                stats.oldestItem = item;
            }
            if (!stats.newestItem || item.timestamp > stats.newestItem.timestamp) {
                stats.newestItem = item;
            }
        });
        
        return stats;
    }

    /**
     * 更新UI状态
     */
    updateUI() {
        // 更新网络状态指示器
        const networkIndicators = document.querySelectorAll('.network-indicator');
        networkIndicators.forEach(indicator => {
            indicator.className = `network-indicator ${this.isOnline ? 'online' : 'offline'}`;
            indicator.textContent = this.isOnline ? '🌐 在线' : '📱 离线';
        });
        
        // 更新同步状态
        const syncIndicators = document.querySelectorAll('.sync-indicator');
        syncIndicators.forEach(indicator => {
            if (this.syncQueue.length > 0) {
                indicator.textContent = `📤 待同步: ${this.syncQueue.length}`;
                indicator.className = 'sync-indicator pending';
            } else {
                indicator.textContent = '✅ 已同步';
                indicator.className = 'sync-indicator synced';
            }
        });
    }

    /**
     * 保存离线数据
     */
    saveOfflineData() {
        try {
            localStorage.setItem('offline_data', JSON.stringify(this.offlineData));
        } catch (error) {
            console.error('❌ 保存离线数据失败:', error);
        }
    }

    /**
     * 加载离线数据
     */
    loadOfflineData() {
        try {
            const saved = localStorage.getItem('offline_data');
            if (saved) {
                this.offlineData = JSON.parse(saved);
                console.log('📥 离线数据已加载');
            }
        } catch (error) {
            console.error('❌ 加载离线数据失败:', error);
            this.offlineData = {};
        }
    }

    /**
     * 保存同步队列
     */
    saveSyncQueue() {
        try {
            localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
        } catch (error) {
            console.error('❌ 保存同步队列失败:', error);
        }
    }

    /**
     * 加载同步队列
     */
    loadSyncQueue() {
        try {
            const saved = localStorage.getItem('sync_queue');
            if (saved) {
                this.syncQueue = JSON.parse(saved);
                console.log('📥 同步队列已加载');
            }
        } catch (error) {
            console.error('❌ 加载同步队列失败:', error);
            this.syncQueue = [];
        }
    }

    /**
     * 强制同步
     */
    async forcSync() {
        if (!this.isOnline) {
            throw new Error('离线状态下无法同步');
        }
        
        this.syncInProgress = false; // 重置同步状态
        await this.syncData();
    }

    /**
     * 清空缓存
     */
    async clearCache() {
        // 清空本地存储
        this.offlineData = {};
        this.saveOfflineData();
        
        // 清空Cache API
        if (this.cache) {
            const keys = await this.cache.keys();
            await Promise.all(keys.map(key => this.cache.delete(key)));
        }
        
        console.log('🗑️ 缓存已清空');
    }

    /**
     * 获取离线学习建议
     */
    getOfflineLearningTips() {
        return [
            '📱 离线模式下，您可以继续学习已缓存的内容',
            '💾 完成的练习将在重新连接网络时自动同步',
            '⚡ 建议在WiFi环境下预先下载更多学习内容',
            '🔄 重新连接网络后，系统会自动同步您的学习进度',
            '📊 离线学习的统计数据会在同步后更新到云端'
        ];
    }

    /**
     * 销毁离线管理器
     */
    destroy() {
        this.saveOfflineData();
        this.saveSyncQueue();
        console.log('📱 离线学习管理器已销毁');
    }
}

// 创建全局实例
window.OfflineManager = new OfflineManager();
