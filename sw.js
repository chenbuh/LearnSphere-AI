/**
 * Service Worker for LearnSphere AI
 * 提供离线支持和缓存管理
 */

const CACHE_NAME = 'learnsphere-ai-v1';
const STATIC_CACHE = 'learnsphere-static-v1';
const DYNAMIC_CACHE = 'learnsphere-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/src/html/index.html',
    '/src/css/main.css',
    '/src/css/ai-tools.css',
    '/src/js/app.js',
    '/src/js/ai-response-optimizer.js',
    '/src/js/ai-tutor.js',
    '/src/js/adaptive-testing.js',
    '/src/js/performance-optimizer.js',
    '/src/js/ai-content-generator.js',
    '/src/js/advanced-analytics.js',
    '/src/js/accessibility-enhancer.js'
];

// 安装事件
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: 安装中...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 Service Worker: 缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('❌ Service Worker: 缓存失败', error);
            })
    );
    
    // 强制激活新的 Service Worker
    self.skipWaiting();
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: 已激活');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // 删除旧版本缓存
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ Service Worker: 删除旧缓存', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );
    
    // 立即控制所有页面
    self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }
    
    // 对于导航请求，总是尝试网络优先
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // 如果网络请求成功，更新缓存
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                    return response;
                })
                .catch(() => {
                    // 网络失败时，从缓存中获取
                    return caches.match('/src/html/index.html');
                })
        );
        return;
    }
    
    // 对于静态资源，使用缓存优先策略
    if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    return fetch(request)
                        .then((response) => {
                            const responseClone = response.clone();
                            caches.open(STATIC_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseClone);
                                });
                            return response;
                        });
                })
        );
        return;
    }
    
    // 对于其他资源，使用网络优先策略
    event.respondWith(
        fetch(request)
            .then((response) => {
                // 只缓存成功的响应
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then((cache) => {
                            cache.put(request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                // 网络失败时，尝试从缓存获取
                return caches.match(request);
            })
    );
});

// 后台同步事件
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 Service Worker: 后台同步');
        event.waitUntil(doBackgroundSync());
    }
});

// 推送通知事件
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/src/assets/icon-192x192.png',
            badge: '/src/assets/badge-72x72.png',
            vibrate: [200, 100, 200],
            data: data.data || {},
            actions: data.actions || []
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// 后台同步函数
async function doBackgroundSync() {
    try {
        // 同步离线时的学习数据
        const offlineData = await getOfflineData();
        if (offlineData.length > 0) {
            await syncLearningData(offlineData);
            await clearOfflineData();
        }
    } catch (error) {
        console.error('❌ 后台同步失败:', error);
    }
}

// 获取离线数据
async function getOfflineData() {
    return new Promise((resolve) => {
        // 这里应该从 IndexedDB 获取离线数据
        resolve([]);
    });
}

// 同步学习数据
async function syncLearningData(data) {
    // 将离线数据同步到服务器
    console.log('📤 同步学习数据:', data.length, '条记录');
}

// 清理离线数据
async function clearOfflineData() {
    // 清理已同步的离线数据
    console.log('🧹 清理离线数据');
}

// 缓存管理
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then((size) => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// 获取缓存大小
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// 清理所有缓存
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('🧹 所有缓存已清理');
}
