import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'

export function useExamManagement() {
  const message = useMessage()
  const loading = ref(false)
  const modalLoading = ref(false)
  const exams = ref([])
  const records = ref([])
  const totalExams = ref(0)
  const totalRecords = ref(0)
  const examPage = ref(1)
  const examPageSize = ref(10)
  const recordPage = ref(1)
  const recordPageSize = ref(10)
  const keyword = ref('')
  const selectedTab = ref('exams')
  const showDetailModal = ref(false)
  const currentExam = ref({})

  const fetchExams = async () => {
    loading.value = true
    try {
      const res = await adminApi.getExamList({
        page: examPage.value,
        size: examPageSize.value,
        keyword: keyword.value
      })
      exams.value = res.data.records || []
      totalExams.value = res.data.total || 0
    } catch (error) {
      message.error('获取试卷列表失败')
    } finally {
      loading.value = false
    }
  }

  const fetchRecords = async () => {
    loading.value = true
    try {
      const res = await adminApi.getExamRecords({
        page: recordPage.value,
        size: recordPageSize.value
      })
      records.value = res.data.records || []
      totalRecords.value = res.data.total || 0
    } catch (error) {
      message.error('获取考试记录失败')
    } finally {
      loading.value = false
    }
  }

  const updateKeyword = (value) => {
    keyword.value = value
  }

  const handleSearch = () => {
    if (selectedTab.value === 'exams') {
      examPage.value = 1
      fetchExams()
      return
    }

    recordPage.value = 1
    fetchRecords()
  }

  const handleDeleteExam = async (id) => {
    try {
      await adminApi.deleteExam(id)
      message.success('试卷已删除')
      fetchExams()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const fetchExamDetail = async (id) => {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur()
    }

    currentExam.value = { title: '加载中...' }
    showDetailModal.value = true
    modalLoading.value = true

    try {
      const res = await adminApi.getExamDetail(id)
      currentExam.value = res.data || {}
    } catch (error) {
      message.error('获取试卷详情失败')
      showDetailModal.value = false
    } finally {
      modalLoading.value = false
    }
  }

  const handleTabChange = (value) => {
    selectedTab.value = value
    if (value === 'exams' && exams.value.length === 0) {
      fetchExams()
    }
    if (value === 'records' && records.value.length === 0) {
      fetchRecords()
    }
  }

  const handleExamPageChange = (value) => {
    examPage.value = value
    fetchExams()
  }

  const handleExamPageSizeChange = (value) => {
    examPageSize.value = value
    examPage.value = 1
    fetchExams()
  }

  const handleRecordPageChange = (value) => {
    recordPage.value = value
    fetchRecords()
  }

  const handleRecordPageSizeChange = (value) => {
    recordPageSize.value = value
    recordPage.value = 1
    fetchRecords()
  }

  onMounted(() => {
    fetchExams()
  })

  return {
    currentExam,
    exams,
    fetchExamDetail,
    handleDeleteExam,
    handleExamPageChange,
    handleExamPageSizeChange,
    handleRecordPageChange,
    handleRecordPageSizeChange,
    handleSearch,
    handleTabChange,
    keyword,
    loading,
    modalLoading,
    recordPage,
    recordPageSize,
    records,
    selectedTab,
    showDetailModal,
    totalExams,
    totalRecords,
    examPage,
    examPageSize,
    updateKeyword
  }
}
