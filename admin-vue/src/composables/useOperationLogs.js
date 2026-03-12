import { computed, onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'

export function useOperationLogs() {
  const message = useMessage()
  const loading = ref(false)
  const list = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')

  const overviewStats = computed(() => {
    const logs = list.value
    const successCount = logs.filter((item) => Number(item.status) === 1).length
    const failureCount = logs.filter((item) => Number(item.status) !== 1).length
    const operatorCount = new Set(logs.map((item) => item.adminUsername).filter(Boolean)).size
    const moduleCount = new Set(logs.map((item) => item.module).filter(Boolean)).size

    return {
      currentCount: logs.length,
      successCount,
      failureCount,
      operatorCount,
      moduleCount
    }
  })

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await adminApi.getOperationLogs({
        page: page.value,
        size: pageSize.value,
        keyword: keyword.value
      })
      if (res.code === 200) {
        list.value = res.data.records || []
        total.value = res.data.total || 0
      }
    } catch (error) {
      message.error('加载操作日志失败')
    } finally {
      loading.value = false
    }
  }

  const updateKeyword = (value) => {
    keyword.value = value
  }

  const handleSearch = () => {
    page.value = 1
    fetchData()
  }

  const handleRefresh = () => {
    fetchData()
  }

  const handlePageChange = (nextPage) => {
    page.value = nextPage
    fetchData()
  }

  onMounted(() => {
    fetchData()
  })

  return {
    handlePageChange,
    handleRefresh,
    handleSearch,
    keyword,
    list,
    loading,
    overviewStats,
    page,
    pageSize,
    total,
    updateKeyword
  }
}
