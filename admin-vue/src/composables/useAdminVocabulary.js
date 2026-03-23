import { onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'
import { ADMIN_VOCABULARY_EXAM_TYPE_OPTIONS } from '@/utils/examTypeMeta'

const createDefaultFormData = () => ({
  word: '',
  phonetic: '',
  definition: '',
  translation: '',
  example: '',
  exampleTranslation: '',
  examType: 'cet4',
  difficulty: 3,
  frequency: 50
})

const examTypeOptions = ADMIN_VOCABULARY_EXAM_TYPE_OPTIONS

export function useAdminVocabulary() {
  const message = useMessage()
  const loading = ref(false)
  const vocabularyList = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const examType = ref('')
  const batchLoading = ref(false)
  const showModal = ref(false)
  const isEdit = ref(false)
  const checkingQuality = ref(false)
  const qualityCheckResult = ref(null)
  const formData = ref(createDefaultFormData())

  const fetchVocabulary = async () => {
    loading.value = true
    try {
      const res = await adminApi.getVocabularyList({
        page: page.value,
        size: pageSize.value,
        keyword: keyword.value,
        examType: examType.value
      })
      vocabularyList.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('获取词汇列表失败')
    } finally {
      loading.value = false
    }
  }

  const resetQualityCheckResult = () => {
    qualityCheckResult.value = null
  }

  const handleSearch = () => {
    page.value = 1
    fetchVocabulary()
  }

  const handlePageChange = (newPage) => {
    page.value = newPage
    fetchVocabulary()
  }

  const handlePageSizeChange = (newPageSize) => {
    pageSize.value = newPageSize
    page.value = 1
    fetchVocabulary()
  }

  const handleExamTypeChange = (value) => {
    examType.value = value
    handleSearch()
  }

  const updateKeyword = (value) => {
    keyword.value = value
  }

  const openAddModal = () => {
    isEdit.value = false
    showModal.value = true
    formData.value = createDefaultFormData()
    resetQualityCheckResult()
  }

  const editVocab = (row) => {
    isEdit.value = true
    showModal.value = true
    formData.value = { ...row }
    resetQualityCheckResult()
  }

  const updateFormData = (nextFormData) => {
    formData.value = nextFormData
  }

  const handleSubmit = async () => {
    try {
      if (isEdit.value) {
        await adminApi.updateVocabulary(formData.value.id, formData.value)
        message.success('更新成功')
      } else {
        await adminApi.addVocabulary(formData.value)
        message.success('添加成功')
      }
      showModal.value = false
      fetchVocabulary()
    } catch (error) {
      message.error(isEdit.value ? '更新失败' : '添加失败')
    }
  }

  const deleteVocab = async (id) => {
    try {
      await adminApi.deleteVocabulary(id)
      message.success('删除成功')
      fetchVocabulary()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleAiFill = async () => {
    if (!formData.value.word) {
      message.warning('请先输入单词')
      return
    }

    const loadingMessage = message.loading('AI 正在思考中...', { duration: 0 })
    try {
      const res = await adminApi.generateVocabularyDetails(formData.value.word, formData.value.examType)
      if (res.code === 200) {
        const { id, examType: selectedExamType } = formData.value
        formData.value = {
          ...res.data,
          id,
          examType: selectedExamType || res.data.examType
        }
        resetQualityCheckResult()
        message.success('AI 补全成功')
      }
    } catch (error) {
      console.error('AI 补全失败:', error)
      message.error('AI 补全失败: ' + (error.response?.data?.msg || error.message))
    } finally {
      loadingMessage.destroy()
    }
  }

  const handleBatchAiFill = async () => {
    batchLoading.value = true
    const msg = message.loading('正在批量补全数据，请稍候...', { duration: 0 })
    try {
      const res = await adminApi.batchGenerateVocabularyDetails(20)
      message.success(res.data)
      fetchVocabulary()
    } catch (error) {
      message.error('批量补全失败')
    } finally {
      msg.destroy()
      batchLoading.value = false
    }
  }

  const handleDeduplicate = async () => {
    const msg = message.loading('正在全库排查重复词汇并清理中...', { duration: 0 })
    try {
      const res = await adminApi.deduplicateVocabulary()
      message.success(res.data)
      fetchVocabulary()
    } catch (error) {
      message.error('去重失败')
    } finally {
      msg.destroy()
    }
  }

  const handleAICheck = async () => {
    const contentToCheck = `
单词: ${formData.value.word || ''}
音标: ${formData.value.phonetic || ''}
翻译: ${formData.value.translation || ''}
释义: ${formData.value.definition || ''}
例句: ${formData.value.example || ''}
例句翻译: ${formData.value.exampleTranslation || ''}
    `.trim()

    if (!contentToCheck || contentToCheck.length < 10) {
      message.warning('请至少填写一些内容后再进行质检')
      return
    }

    checkingQuality.value = true
    try {
      const res = await adminApi.checkContentQuality({
        content: contentToCheck,
        contentType: 'vocabulary'
      })

      qualityCheckResult.value = res.data

      if (res.data.passed) {
        message.success(`质检通过！评分: ${res.data.score}/100`)
      } else {
        message.warning(`发现 ${res.data.issues.length} 个问题，评分: ${res.data.score}/100`)
      }
    } catch (error) {
      message.error('AI 质检失败: ' + (error.response?.data?.msg || error.message))
    } finally {
      checkingQuality.value = false
    }
  }

  const applySuggestion = (issue) => {
    for (const key in formData.value) {
      if (typeof formData.value[key] === 'string' && formData.value[key].includes(issue.originalText)) {
        formData.value = {
          ...formData.value,
          [key]: formData.value[key].replace(issue.originalText, issue.suggestion)
        }
        message.success('已应用修复建议')
        handleAICheck()
        return
      }
    }
    message.warning('未找到需要修复的内容')
  }

  onMounted(() => {
    fetchVocabulary()
  })

  return {
    applySuggestion,
    batchLoading,
    checkingQuality,
    deleteVocab,
    editVocab,
    examType,
    examTypeOptions,
    formData,
    handleAiFill,
    handleAICheck,
    handleBatchAiFill,
    handleDeduplicate,
    handleExamTypeChange,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleSubmit,
    isEdit,
    keyword,
    loading,
    openAddModal,
    page,
    pageSize,
    qualityCheckResult,
    showModal,
    total,
    updateFormData,
    updateKeyword,
    vocabularyList
  }
}
