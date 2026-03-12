import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'
import {
  defaultAITutorCleanupStats,
  defaultAITutorConfig,
  defaultAITutorDashboardStats,
  defaultAITutorPrompt,
  filterAITutorPrompts,
  formatAITutorTime
} from '@/utils/adminAITutorConfig'

export function useAITutorManagement() {
  const message = useMessage()
  const router = useRouter()

  const loading = ref(false)
  const messages = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const roleFilter = ref(null)

  const activeTab = ref('conversations')
  const sensitiveLogs = ref([])
  const sensitiveLoading = ref(false)

  const showSessionModal = ref(false)
  const sessionMessages = ref([])
  const sessionLoading = ref(false)
  const currentSessionId = ref('')

  const cleanupStats = ref({ ...defaultAITutorCleanupStats })
  const dashboardStats = ref({ ...defaultAITutorDashboardStats })

  const promptList = ref([])
  const promptLoading = ref(false)
  const showPromptModal = ref(false)
  const currentPrompt = ref({ ...defaultAITutorPrompt })

  const aiConfig = ref({ ...defaultAITutorConfig })

  const fetchMessages = async () => {
    loading.value = true
    try {
      const res = await adminApi.getAITutorMessages({
        page: page.value,
        size: pageSize.value,
        keyword: keyword.value,
        role: roleFilter.value
      })
      messages.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('获取对话记录失败')
    } finally {
      loading.value = false
    }
  }

  const viewSession = async (sessionId) => {
    currentSessionId.value = sessionId
    showSessionModal.value = true
    sessionLoading.value = true
    try {
      const res = await adminApi.getAITutorSession(sessionId)
      sessionMessages.value = res.data || []
    } catch (error) {
      message.error('获取会话详情失败')
    } finally {
      sessionLoading.value = false
    }
  }

  const fetchCleanupStats = async () => {
    try {
      const res = await adminApi.getAITutorCleanupStats()
      cleanupStats.value = res.data || { ...defaultAITutorCleanupStats }
    } catch (error) {
      console.warn('获取清理统计失败')
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const res = await adminApi.getAITutorStats()
      dashboardStats.value = res.data || { ...defaultAITutorDashboardStats }
    } catch (error) {
      console.error('获取统计数据失败')
    }
  }

  const handleCleanup = async () => {
    try {
      const res = await adminApi.triggerAITutorCleanup(30)
      message.success(res.data.message)
      fetchCleanupStats()
    } catch (error) {
      message.error('触发清理失败')
    }
  }

  const handlePageChange = (nextPage) => {
    page.value = nextPage
    fetchMessages()
  }

  const handleSearch = () => {
    page.value = 1
    fetchMessages()
  }

  const fetchSensitiveLogs = async () => {
    sensitiveLoading.value = true
    try {
      const res = await adminApi.getSensitiveLogs({
        page: 1,
        size: 10,
        keyword: 'AITutorController'
      })
      sensitiveLogs.value = res.data.records || []
    } catch (error) {
      console.error('获取违规记录失败')
    } finally {
      sensitiveLoading.value = false
    }
  }

  const fetchPrompts = async () => {
    promptLoading.value = true
    try {
      const res = await adminApi.getPrompts()
      promptList.value = filterAITutorPrompts(res.data || [])
    } catch (error) {
      message.error('加载提示词失败')
    } finally {
      promptLoading.value = false
    }
  }

  const handleEditPrompt = (prompt) => {
    currentPrompt.value = { ...prompt }
    showPromptModal.value = true
  }

  const handleSavePrompt = async () => {
    try {
      await adminApi.updatePrompt(currentPrompt.value.id, currentPrompt.value)
      message.success('更新成功')
      showPromptModal.value = false
      fetchPrompts()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const fetchAIConfig = async () => {
    try {
      const res = await adminApi.getAITutorConfig()
      aiConfig.value = res.data || { ...defaultAITutorConfig }
    } catch (error) {
      message.error('获取配置失败')
    }
  }

  const handleUpdateModel = async (model) => {
    try {
      await adminApi.updateAITutorConfig({ model })
      message.success(`模型已切换至: ${model === 'default' ? '系统默认' : model}（已同步全站 AI 功能）`)
      fetchAIConfig()
    } catch (error) {
      message.error('切换模型失败')
    }
  }

  const handleRefresh = () => {
    if (activeTab.value === 'conversations') {
      fetchMessages()
    } else {
      fetchSensitiveLogs()
    }
    fetchDashboardStats()
  }

  const handleTabChange = (tab) => {
    activeTab.value = tab
    if (tab === 'conversations') {
      fetchMessages()
    } else if (tab === 'audit') {
      fetchSensitiveLogs()
    } else if (tab === 'settings') {
      fetchPrompts()
      fetchAIConfig()
    }
  }

  const handleManageSensitive = (log) => {
    router.push({ path: '/sensitive', query: { keyword: log.username } })
  }

  onMounted(() => {
    fetchMessages()
    fetchCleanupStats()
    fetchSensitiveLogs()
    fetchDashboardStats()
  })

  return {
    activeTab,
    aiConfig,
    cleanupStats,
    currentPrompt,
    currentSessionId,
    dashboardStats,
    fetchAIConfig,
    fetchPrompts,
    formatTime: formatAITutorTime,
    handleCleanup,
    handleEditPrompt,
    handleManageSensitive,
    handlePageChange,
    handleRefresh,
    handleSavePrompt,
    handleSearch,
    handleTabChange,
    handleUpdateModel,
    keyword,
    loading,
    messages,
    page,
    pageSize,
    promptList,
    promptLoading,
    roleFilter,
    sensitiveLoading,
    sensitiveLogs,
    sessionLoading,
    sessionMessages,
    showPromptModal,
    showSessionModal,
    total,
    viewSession
  }
}
