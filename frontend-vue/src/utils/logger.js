/**
 * 安全的日志工具
 * 生产环境不输出任何日志，避免泄露隐私信息
 */

const isDev = import.meta.env.DEV

export const logger = {
    /**
     * 开发环境信息日志
     */
    log(...args) {
        if (isDev) {
            console.log(...args)
        }
    },

    /**
     * 开发环境警告日志
     */
    warn(...args) {
        if (isDev) {
            console.warn(...args)
        }
    },

    /**
     * 开发环境错误日志（不包含敏感数据）
     */
    error(message, ...details) {
        if (isDev) {
            console.error(message, ...details)
        }
    },

    /**
     * 开发环境调试日志
     */
    debug(...args) {
        if (isDev) {
            console.debug(...args)
        }
    },

    /**
     * 永远显示的错误（用于关键错误，但不包含敏感信息）
     */
    criticalError(message) {
        console.error('[Error]', message)
    }
}

export default logger
