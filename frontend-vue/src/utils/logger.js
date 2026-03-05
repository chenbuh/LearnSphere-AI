/**
 * Centralized frontend logger.
 * In production: keep warn/error, silence log/info/debug.
 */

const isDev = import.meta.env.DEV

export const logger = {
    log(...args) {
        if (isDev) {
            console.log(...args)
        }
    },

    info(...args) {
        if (isDev) {
            console.info(...args)
        }
    },

    warn(...args) {
        console.warn(...args)
    },

    error(message, ...details) {
        console.error(message, ...details)
    },

    debug(...args) {
        if (isDev) {
            console.debug(...args)
        }
    },

    criticalError(message) {
        console.error('[Error]', message)
    }
}

export default logger
