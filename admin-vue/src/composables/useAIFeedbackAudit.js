import { computed, onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'
import {
  createAIFeedbackColumns,
  createAuditForm
} from '@/utils/aiFeedbackAuditConfig'

export function useAIFeedbackAudit() {
  const message = useMessage()
  const loading = ref(false)
  const list = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const statusFilter = ref(0)
  const ratingFilter = ref(null)
  const showAuditModal = ref(false)
  const auditLoading = ref(false)
  const currentFeedback = ref(null)
  const auditForm = ref(createAuditForm())

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await adminApi.getAIFeedbackList({
        page: page.value,
        size: pageSize.value,
        status: statusFilter.value,
        rating: ratingFilter.value
      })
      if (res.code === 200) {
        list.value = res.data.records || []
        total.value = res.data.total || 0
      }
    } catch (error) {
      message.error('加载反馈数据失败')
    } finally {
      loading.value = false
    }
  }

  const handleOpenAudit = (row) => {
    currentFeedback.value = row
    auditForm.value = createAuditForm(row)
    showAuditModal.value = true
  }

  const submitAudit = async () => {
    auditLoading.value = true
    try {
      const res = await adminApi.auditAIFeedback({
        id: currentFeedback.value.id,
        ...auditForm.value
      })
      if (res.code === 200) {
        message.success('审核处理成功')
        showAuditModal.value = false
        fetchData()
      }
    } catch (error) {
      message.error('处理失败')
    } finally {
      auditLoading.value = false
    }
  }

  const handlePageChange = (nextPage) => {
    page.value = nextPage
    fetchData()
  }

  const updateStatusFilter = (value) => {
    statusFilter.value = value
    page.value = 1
    fetchData()
  }

  const updateRatingFilter = (value) => {
    ratingFilter.value = value
    page.value = 1
    fetchData()
  }

  const columns = computed(() => createAIFeedbackColumns({ onOpenAudit: handleOpenAudit }))

  onMounted(() => {
    fetchData()
  })

  return {
    auditForm,
    auditLoading,
    columns,
    currentFeedback,
    fetchData,
    handlePageChange,
    list,
    loading,
    page,
    pageSize,
    ratingFilter,
    showAuditModal,
    statusFilter,
    submitAudit,
    total,
    updateRatingFilter,
    updateStatusFilter
  }
}
