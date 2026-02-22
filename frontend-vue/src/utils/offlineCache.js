/**
 * OfflineCache 机制基于 IndexedDB 为学习平台提供离线能力
 * 在网络不佳或离线状态下，可以使用此工具缓存练习题、单词等数据。
 */
export class OfflineCache {
    constructor(dbName = 'LearnSphereOffline', version = 1) {
        this.dbName = dbName
        this.version = version
        this.db = null
    }

    initDB() {
        return new Promise((resolve, reject) => {
            // 避免重复初始化
            if (this.db) {
                resolve(this.db)
                return
            }

            const request = indexedDB.open(this.dbName, this.version)

            request.onerror = (event) => {
                console.error('IndexedDB open error:', event.target.error)
                reject(request.error)
            }

            request.onsuccess = (event) => {
                this.db = event.target.result
                resolve(this.db)
            }

            request.onupgradeneeded = (event) => {
                const db = event.target.result
                console.log(`Upgrading IndexedDB from version ${event.oldVersion} to ${event.newVersion}`)

                // 存储通用学习内容缓存
                if (!db.objectStoreNames.contains('contents')) {
                    db.createObjectStore('contents', { keyPath: 'id' })
                }

                // 存储未同步的离线学习记录 (如答题记录、录音记录等)
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'taskId', autoIncrement: true })
                }
            }
        })
    }

    // ---- Contents Cache (缓存读取) ----

    async cacheContent(contentId, payload) {
        const db = await this.initDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('contents', 'readwrite')
            const store = tx.objectStore('contents')

            const item = {
                id: contentId,
                data: payload,
                timestamp: new Date().getTime()
            }

            const request = store.put(item)
            request.onsuccess = () => resolve(true)
            request.onerror = () => reject(request.error)
        })
    }

    async getCachedContent(contentId) {
        const db = await this.initDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('contents', 'readonly')
            const store = tx.objectStore('contents')

            const request = store.get(contentId)
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data)
                } else {
                    resolve(null)
                }
            }
            request.onerror = () => reject(request.error)
        })
    }

    // ---- Sync Queue (离线写入同步) ----

    async addToSyncQueue(taskType, payload) {
        const db = await this.initDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('syncQueue', 'readwrite')
            const store = tx.objectStore('syncQueue')

            const item = {
                type: taskType,
                payload: payload,
                createdAt: new Date().toISOString(),
                status: 'pending'
            }

            const request = store.add(item)
            request.onsuccess = () => resolve(request.result) // Returns the auto-incremented taskId
            request.onerror = () => reject(request.error)
        })
    }

    async getSyncQueue() {
        const db = await this.initDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('syncQueue', 'readonly')
            const store = tx.objectStore('syncQueue')

            const request = store.getAll()
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }

    async removeFromSyncQueue(taskId) {
        const db = await this.initDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('syncQueue', 'readwrite')
            const store = tx.objectStore('syncQueue')

            const request = store.delete(taskId)
            request.onsuccess = () => resolve(true)
            request.onerror = () => reject(request.error)
        })
    }
}

// 导出单例，方便全局使用
export const offlineCache = new OfflineCache()
