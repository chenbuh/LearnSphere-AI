import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import request from '@/utils/request'
import echarts from '@/utils/echarts'
import { createRedisColumns } from '@/utils/redisManagementConfig'

export function useRedisManagement() {
  const message = useMessage()
  const loading = ref(false)
  const searchPattern = ref('*')
  const keys = ref([])
  const showDetail = ref(false)
  const detailLoading = ref(false)
  const selectedKey = ref(null)
  const keyDetail = ref({
    key: '',
    value: null,
    ttl: -1,
    type: ''
  })

  const memoryChartRef = ref(null)
  let memoryChartInstance = null

  const fetchKeys = async () => {
    loading.value = true
    try {
      const res = await request.get('/admin/redis/keys', {
        params: { pattern: searchPattern.value }
      })
      keys.value = res.data || []
    } catch (error) {
      message.error('获取 Redis 键列表失败')
    } finally {
      loading.value = false
    }
  }

  const fetchDetail = async (key) => {
    selectedKey.value = key
    detailLoading.value = true
    showDetail.value = true
    try {
      const res = await request.get('/admin/redis/detail', {
        params: { key }
      })
      keyDetail.value = res.data
    } catch (error) {
      message.error('获取键详情失败')
    } finally {
      detailLoading.value = false
    }
  }

  const deleteKey = async (key) => {
    try {
      await request.delete('/admin/redis/key', {
        params: { key }
      })
      message.success('删除成功')
      fetchKeys()
      if (showDetail.value && selectedKey.value === key) {
        showDetail.value = false
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const clearKeys = async () => {
    if (searchPattern.value === '*' || searchPattern.value === '') {
      message.warning('出于安全考虑，禁止全局通配符清理，请输入具体前缀')
      return
    }

    try {
      const res = await request.delete('/admin/redis/clear', {
        params: { pattern: searchPattern.value }
      })
      message.success(res.data || '清理成功')
      fetchKeys()
    } catch (error) {
      message.error('清理失败')
    }
  }

  const renderMemoryChart = () => {
    if (!memoryChartRef.value) return
    if (!memoryChartInstance) memoryChartInstance = echarts.init(memoryChartRef.value)
    memoryChartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: { formatter: '{a} <br/>{b} : {c}%' },
      series: [
        {
          name: '内存水位',
          type: 'gauge',
          center: ['50%', '60%'],
          detail: { formatter: '{value}%', color: '#fff', fontSize: 24, padding: [40, 0, 0, 0] },
          data: [{ value: 42, name: 'Memory Usage' }],
          axisLine: {
            lineStyle: {
              width: 15,
              color: [
                [0.3, '#10b981'],
                [0.7, '#3b82f6'],
                [1, '#ef4444']
              ]
            }
          },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          pointer: { width: 5 },
          title: { color: '#a1a1aa', fontSize: 12, offsetCenter: [0, '20%'] }
        }
      ]
    })
  }

  const handleResize = () => {
    memoryChartInstance?.resize()
  }

  const columns = computed(() =>
    createRedisColumns({
      onDetail: fetchDetail,
      onDelete: deleteKey
    })
  )

  onMounted(() => {
    fetchKeys()
    nextTick(() => {
      renderMemoryChart()
    })
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    memoryChartInstance?.dispose()
  })

  return {
    clearKeys,
    columns,
    deleteKey,
    detailLoading,
    fetchKeys,
    keyDetail,
    keys,
    loading,
    memoryChartRef,
    searchPattern,
    showDetail
  }
}
