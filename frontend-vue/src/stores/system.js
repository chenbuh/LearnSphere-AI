import { defineStore } from 'pinia'
import { commonApi } from '@/api/common'
import logger from '@/utils/logger'

const CACHE_TTL_MS = 60 * 1000
let pendingFetchPromise = null

export const useSystemStore = defineStore('system', {
    state: () => ({
        configs: {},
        isMaintenanceMode: false,
        maintenanceMessage: '',
        lastFetchedAt: 0
    }),
    getters: {
        hasConfig: (state) => Object.keys(state.configs || {}).length > 0,
        isConfigStale: (state) => !state.lastFetchedAt || Date.now() - state.lastFetchedAt >= CACHE_TTL_MS
    },
    actions: {
        async fetchSystemConfig(options = {}) {
            const normalizedOptions = typeof options === 'boolean'
                ? { force: options }
                : options

            const { force = false, background = false } = normalizedOptions
            if (!force && this.hasConfig && !this.isConfigStale) {
                return this.configs
            }

            if (pendingFetchPromise) {
                if (background) {
                    return this.configs
                }
                return pendingFetchPromise
            }

            const requestPromise = (async () => {
                const res = await commonApi.getPublicConfigs()
                if (res.code === 200 && res.data) {
                    this.configs = res.data
                    const mode = res.data['sys.maintenance_mode']
                    this.isMaintenanceMode = String(mode) === 'true'
                    this.maintenanceMessage = res.data['sys.maintenance_message'] || ''
                    this.lastFetchedAt = Date.now()
                }
                return this.configs
            })()

            pendingFetchPromise = requestPromise.finally(() => {
                pendingFetchPromise = null
            })

            if (background) {
                pendingFetchPromise.catch((error) => {
                    logger.warn('Failed to refresh system config in background', error)
                })
                return this.configs
            }

            try {
                return await pendingFetchPromise
            } catch (e) {
                logger.error('Failed to fetch system config', e)
                throw e
            }
        },
        refreshSystemConfigInBackground(force = false) {
            return this.fetchSystemConfig({ force, background: true })
        }
    },
    persist: true
})
