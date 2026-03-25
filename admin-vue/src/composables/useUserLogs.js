import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'
import echarts from '@/utils/echarts'
import {
  calculateMobileRate,
  countActiveUsers,
  countUniqueIps,
  createUserLogActionChartOption,
  createUserLogProvinceChartOption
} from '@/utils/adminUserLogsConfig'

export function useUserLogs() {
  const message = useMessage()

  const logs = ref([])
  const loading = ref(false)
  const stats = ref({})
  const showDetail = ref(false)
  const currentLog = ref(null)
  const chartsCardRef = ref(null)

  let actionChart = null
  let provinceChart = null

  const filters = reactive({
    username: '',
    module: null,
    action: null,
    ip: '',
    status: null
  })

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    itemCount: 0
  })

  const uniqueIps = computed(() => countUniqueIps(logs.value))
  const activeUsers = computed(() => countActiveUsers(logs.value))
  const mobileRate = computed(() => calculateMobileRate(logs.value))

  const loadLogs = async () => {
    loading.value = true
    try {
      const res = await adminApi.getUserLogs({
        page: pagination.page,
        size: pagination.pageSize,
        ...filters
      })
      if (res.code === 200) {
        logs.value = res.data.records || []
        pagination.itemCount = res.data.total || 0
        await loadStats()
      }
    } catch (error) {
      message.error('加载日志失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const renderCharts = async () => {
    try {
      const actionChartRef = chartsCardRef.value?.actionChartRef
      const provinceChartRef = chartsCardRef.value?.provinceChartRef

      const actionRes = await adminApi.getUserLogActionStats()
      if (actionRes.code === 200 && actionChartRef?.value) {
        if (!actionChart) {
          actionChart = echarts.init(actionChartRef.value)
        }
        actionChart.setOption(createUserLogActionChartOption(actionRes.data))
      }

      const provinceRes = await adminApi.getUserLogProvinceStats()
      if (provinceRes.code === 200 && provinceChartRef?.value) {
        if (!provinceChart) {
          provinceChart = echarts.init(provinceChartRef.value)
        }
        provinceChart.setOption(createUserLogProvinceChartOption(provinceRes.data, echarts))
      }
    } catch (error) {
      console.error('渲染图表失败', error)
    }
  }

  const loadStats = async () => {
    try {
      const res = await adminApi.getUserLogStats()
      if (res.code === 200) {
        stats.value = res.data || {}
        renderCharts()
      }
    } catch (error) {
      console.error('加载统计数据失败', error)
    }
  }

  const viewDetail = (log) => {
    currentLog.value = log
    showDetail.value = true
  }

  const refresh = () => {
    loadLogs()
  }

  const clearAll = async () => {
    try {
      const res = await adminApi.clearAllUserLogs()
      if (res.code === 200) {
        message.success('清空成功')
        refresh()
      }
    } catch (error) {
      message.error('清空失败')
    }
  }

  const handlePageChange = (page) => {
    pagination.page = page
    loadLogs()
  }

  const handlePageSizeChange = (pageSize) => {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadLogs()
  }

  onMounted(() => {
    loadLogs()
  })

  onBeforeUnmount(() => {
    actionChart?.dispose()
    provinceChart?.dispose()
    actionChart = null
    provinceChart = null
  })

  return {
    activeUsers,
    chartsCardRef,
    clearAll,
    currentLog,
    filters,
    handlePageChange,
    handlePageSizeChange,
    loadLogs,
    loading,
    logs,
    mobileRate,
    pagination,
    refresh,
    showDetail,
    stats,
    uniqueIps,
    viewDetail
  }
}
