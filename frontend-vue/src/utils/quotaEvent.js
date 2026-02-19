/**
 * 配额事件工具
 * 用于触发配额更新事件,实现实时刷新
 */

/**
 * 触发配额更新事件
 * 在 AI 功能调用成功后调用此方法,会通知所有监听器刷新配额
 */
export function triggerQuotaUpdate() {
    window.dispatchEvent(new CustomEvent('quota-updated'))
}

/**
 * 在 AI 请求完成后自动触发配额更新的包装器
 * @param {Function} apiCall - 返回 Promise 的 API 调用函数
 * @returns {Promise} 原始 API 调用的结果
 */
export async function withQuotaUpdate(apiCall) {
    try {
        const result = await apiCall()
        // API 调用成功后触发配额更新
        triggerQuotaUpdate()
        return result
    } catch (error) {
        // 即使失败也触发更新(可能已消耗配额)
        triggerQuotaUpdate()
        throw error
    }
}
