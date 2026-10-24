import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'

const contentTypeOptions = [
  { label: '全部', value: null },
  { label: '词汇', value: 'vocabulary' },
  { label: '语法', value: 'grammar' },
  { label: '阅读', value: 'reading' }
]

export function useAdminRecords() {
  const message = useMessage()
  const loading = ref(false)
  const records = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const contentType = ref(null)
  const userId = ref('')

  const fetchRecords = async () => {
    loading.value = true
    try {
      const params = {
        page: page.value,
        size: pageSize.value,
        contentType: contentType.value
      }
      if (userId.value && !isNaN(Number(userId.value))) {
        params.userId = Number(userId.value)
      }
      const res = await adminApi.getLearningRecords(params)
      records.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('获取学习记录失败')
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = newPage => {
    page.value = newPage
    fetchRecords()
  }

  const handleContentTypeChange = value => {
    contentType.value = value
    page.value = 1
    fetchRecords()
  }

  const handleSearch = () => {
    page.value = 1
    fetchRecords()
  }

  const handleReset = () => {
    userId.value = ''
    contentType.value = null
    page.value = 1
    fetchRecords()
  }

  onMounted(() => {
    fetchRecords()
  })

  return {
    contentType,
    contentTypeOptions,
    userId,
    handleContentTypeChange,
    handlePageChange,
    handleSearch,
    handleReset,
    fetchRecords,
    loading,
    page,
    pageSize,
    records,
    total
  }
}
