import { openDB } from 'idb'

/**
 * IndexedDB 工具类 - 存储大型历史记录
 * 相比 localStorage (5-10MB)，IndexedDB 可存储更多数据 (50MB+)
 */

const DB_NAME = 'learnsphere-db'
const DB_VERSION = 1

// 初始化数据库
async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // 创建 stores (类似表)
            if (!db.objectStoreNames.contains('grammarHistory')) {
                db.createObjectStore('grammarHistory', { keyPath: 'id', autoIncrement: true })
            }
            if (!db.objectStoreNames.contains('readingHistory')) {
                db.createObjectStore('readingHistory', { keyPath: 'id', autoIncrement: true })
            }
            if (!db.objectStoreNames.contains('writingHistory')) {
                db.createObjectStore('writingHistory', { keyPath: 'id', autoIncrement: true })
            }
            if (!db.objectStoreNames.contains('listeningHistory')) {
                db.createObjectStore('listeningHistory', { keyPath: 'id', autoIncrement: true })
            }
        },
    })
}

/**
 * 保存历史记录
 * @param {string} storeName - 'grammarHistory' | 'readingHistory' | 'writingHistory' | 'listeningHistory'
 * @param {object} data - 要保存的数据
 */
export async function saveHistory(storeName, data) {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)

        // 添加时间戳
        const record = {
            ...data,
            timestamp: Date.now(),
            date: new Date().toISOString()
        }

        await store.add(record)
        await tx.done

        // 自动清理：保留最近 100 条记录
        await cleanOldRecords(storeName, 100)

        return true
    } catch (error) {
        console.error('Save history failed:', error)
        return false
    }
}

/**
 * 获取历史记录列表
 * @param {string} storeName
 * @param {number} limit - 返回最近 N 条
 */
export async function getHistory(storeName, limit = 50) {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)

        let allRecords = await store.getAll()

        // 按时间戳倒序排序
        allRecords.sort((a, b) => b.timestamp - a.timestamp)

        // 返回最近的 N 条
        return allRecords.slice(0, limit)
    } catch (error) {
        console.error('Get history failed:', error)
        return []
    }
}

/**
 * 删除过期记录（超过 24 小时）
 * @param {string} storeName
 */
export async function cleanExpiredRecords(storeName) {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)

        const allRecords = await store.getAll()
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        for (const record of allRecords) {
            if (record.timestamp && (now - record.timestamp) > twentyFourHours) {
                await store.delete(record.id)
            }
        }

        await tx.done
    } catch (error) {
        console.error('Clean expired records failed:', error)
    }
}

/**
 * 保留最近 N 条记录，删除其余
 * @param {string} storeName
 * @param {number} keepCount
 */
async function cleanOldRecords(storeName, keepCount) {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)

        let allRecords = await store.getAll()

        // 按时间戳倒序排序
        allRecords.sort((a, b) => b.timestamp - a.timestamp)

        // 删除超过 keepCount 的旧记录
        if (allRecords.length > keepCount) {
            const toDelete = allRecords.slice(keepCount)
            for (const record of toDelete) {
                await store.delete(record.id)
            }
        }

        await tx.done
    } catch (error) {
        console.error('Clean old records failed:', error)
    }
}

/**
 * 清空所有历史记录
 * @param {string} storeName
 */
export async function clearHistory(storeName) {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readwrite')
        const store = tx.objectStore(storeName)

        await store.clear()
        await tx.done

        return true
    } catch (error) {
        console.error('Clear history failed:', error)
        return false
    }
}

/**
 * 获取历史记录总数
 * @param {string} storeName
 */
export async function getHistoryCount(storeName) {
    try {
        const db = await initDB()
        const tx = db.transaction(storeName, 'readonly')
        const store = tx.objectStore(storeName)

        return await store.count()
    } catch (error) {
        console.error('Get history count failed:', error)
        return 0
    }
}

// 在应用启动时清理过期数据
export function initCleanup() {
    const stores = ['grammarHistory', 'readingHistory', 'writingHistory', 'listeningHistory']

    stores.forEach(store => {
        cleanExpiredRecords(store)
    })
}
