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

  const fetchRecords = async () => {
    loading.value = true
    try {
      const res = await adminApi.getLearningRecords({
        page: page.value,
        size: pageSize.value,
        contentType: contentType.value
      })
      records.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('获取学习记录失败')
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = (newPage) => {
    page.value = newPage
    fetchRecords()
  }

  const handleContentTypeChange = (value) => {
    contentType.value = value
    page.value = 1
    fetchRecords()
  }

  onMounted(() => {
    fetchRecords()
  })

  return {
    contentType,
    contentTypeOptions,
    handleContentTypeChange,
    handlePageChange,
    loading,
    page,
    pageSize,
    records,
    total
  }
}
