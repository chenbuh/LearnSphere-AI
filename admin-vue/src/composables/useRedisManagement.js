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

  const fetchDetail = async key => {
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

  const deleteKey = async key => {
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
      tooltip: {
        formatter: '{a} : {c}%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#0f172a', fontSize: 12 },
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);'
      },
      series: [
        {
          name: '内存占用率',
          type: 'gauge',
          center: ['50%', '62%'],
          radius: '95%',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          splitNumber: 5,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#4f46e5' },
              { offset: 1, color: '#06b6d4' }
            ])
          },
          progress: {
            show: true,
            width: 14,
            roundCap: true
          },
          pointer: {
            show: true,
            length: '55%',
            width: 4,
            itemStyle: {
              color: '#4f46e5'
            }
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 14,
              color: [[1, '#f1f5f9']]
            }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: {
            distance: 20,
            color: '#94a3b8',
            fontSize: 10
          },
          title: {
            show: true,
            offsetCenter: [0, '40%'],
            fontSize: 12,
            color: '#64748b'
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: '#0f172a',
            fontSize: 24,
            fontWeight: '750',
            fontFamily: 'inherit',
            offsetCenter: [0, '15%']
          },
          data: [{ value: 42, name: '轻载安全水位' }]
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
