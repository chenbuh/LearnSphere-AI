import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { adminApi } from '@/api/admin'

export function useSystemMonitor() {
  const loading = ref(false)
  const info = ref({})
  let timer = null

  const formatUptime = (ms) => {
    if (!ms) return '-'
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    return `${days}天 ${hours % 24}小时 ${minutes % 60}分 ${seconds % 60}秒`
  }

  const uptimeLabel = computed(() => formatUptime(info.value.uptime).split(' ')[0] || '-')

  const updateMonitorInfo = async ({ silent = false } = {}) => {
    if (!silent) {
      loading.value = true
    }

    try {
      const res = await adminApi.getSystemMonitor()
      if (res.data) {
        info.value = res.data
      }
    } catch (error) {
      console.error(error)
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  const fetchMonitorData = () => updateMonitorInfo()

  onMounted(() => {
    fetchMonitorData()
    timer = setInterval(() => {
      updateMonitorInfo({ silent: true })
    }, 5000)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  return {
    fetchMonitorData,
    info,
    loading,
    uptimeLabel
  }
}
