import { defineStore } from 'pinia'
import { commonApi } from '@/api/common'

export const useSystemStore = defineStore('system', {
    state: () => ({
        configs: {},
        isMaintenanceMode: false,
        maintenanceMessage: ''
    }),
    actions: {
        async fetchSystemConfig() {
            try {
                const res = await commonApi.getPublicConfigs()
                if (res.code === 200) {
                    this.configs = res.data
                    // Check for maintenance mode string 'true' or boolean true
                    const mode = res.data['sys.maintenance_mode']
                    this.isMaintenanceMode = String(mode) === 'true'
                    this.maintenanceMessage = res.data['sys.maintenance_message'] || ''
                }
            } catch (e) {
                console.error('Failed to fetch system config', e)
            }
        }
    },
    persist: true
})
