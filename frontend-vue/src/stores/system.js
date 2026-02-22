import { defineStore } from 'pinia'
import { commonApi } from '@/api/common'

export const useSystemStore = defineStore('system', {
    state: () => ({
        configs: {},
        isMaintenanceMode: false,
        maintenanceMessage: '',
        lastFetchedAt: 0
    }),
    actions: {
        async fetchSystemConfig(force = false) {
            const now = Date.now()
            const cacheTtlMs = 60 * 1000
            if (!force && this.lastFetchedAt && now - this.lastFetchedAt < cacheTtlMs) {
                return
            }
            try {
                const res = await commonApi.getPublicConfigs()
                if (res.code === 200) {
                    this.configs = res.data
                    // Check for maintenance mode string 'true' or boolean true
                    const mode = res.data['sys.maintenance_mode']
                    this.isMaintenanceMode = String(mode) === 'true'
                    this.maintenanceMessage = res.data['sys.maintenance_message'] || ''
                    this.lastFetchedAt = now
                }
            } catch (e) {
                console.error('Failed to fetch system config', e)
            }
        }
    },
    persist: true
})
