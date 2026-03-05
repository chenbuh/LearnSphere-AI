import logger from './logger'

/**
 * Sync system config for route guard with minimal navigation blocking:
 * 1) first load: blocking fetch
 * 2) subsequent navigations: background refresh
 */
export async function syncSystemConfigForGuard(systemStore, customLogger = logger) {
  if (!systemStore.hasConfig) {
    try {
      await systemStore.fetchSystemConfig()
    } catch (error) {
      customLogger.warn('System config bootstrap failed, fallback to local defaults', error)
    }
    return
  }

  systemStore.refreshSystemConfigInBackground().catch((error) => {
    customLogger.warn('System config background refresh failed', error)
  })
}

export default syncSystemConfigForGuard
