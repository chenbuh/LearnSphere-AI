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
  const resolvedFilter = ref(null)

  const activeTab = ref('conversations')
  const sensitiveLogs = ref([])
  const sensitiveLoading = ref(false)
  const auditKeyword = ref('')
  const auditPage = ref(1)
  const auditPageSize = ref(10)
  const auditTotal = ref(0)

  const showSessionModal = ref(false)
  const sessionMessages = ref([])
  const sessionLoading = ref(false)
  const currentSessionId = ref('')
  const currentSessionMeta = ref(null)

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
        role: roleFilter.value,
        resolved: resolvedFilter.value
      })
      messages.value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('获取对话记录失败')
    } finally {
      loading.value = false
    }
  }

  const fetchSession = async (sessionId) => {
    sessionLoading.value = true
    try {
      const res = await adminApi.getAITutorSession(sessionId)
      sessionMessages.value = res.data || []
      if (!currentSessionMeta.value && sessionMessages.value.length > 0) {
        const latestMessage = sessionMessages.value[sessionMessages.value.length - 1]
        currentSessionMeta.value = {
          session_id: sessionId,
          username: latestMessage.username || '未知用户',
          topic: latestMessage.topic || '',
          resolved: Boolean(latestMessage.resolved)
        }
      }
    } catch (error) {
      message.error('获取会话详情失败')
    } finally {
      sessionLoading.value = false
    }
  }

  const viewSession = async (sessionId, row = null) => {
    currentSessionId.value = sessionId
    currentSessionMeta.value = row
      ? {
          session_id: row.session_id,
          username: row.username,
          topic: row.topic,
          resolved: Boolean(row.resolved)
        }
      : null
    showSessionModal.value = true
    await fetchSession(sessionId)
  }

  const fetchCleanupStats = async () => {
    try {
      const res = await adminApi.getAITutorCleanupStats()
      cleanupStats.value = {
        ...defaultAITutorCleanupStats,
        ...(res.data || {})
      }
    } catch (error) {
      console.warn('获取清理统计失败')
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const res = await adminApi.getAITutorStats()
      dashboardStats.value = {
        ...defaultAITutorDashboardStats,
        ...(res.data || {})
      }
    } catch (error) {
      console.error('获取统计数据失败')
    }
  }

  const fetchSensitiveLogs = async () => {
    sensitiveLoading.value = true

    const params = {
      page: auditPage.value,
      size: auditPageSize.value,
      keyword: auditKeyword.value
    }

    try {
      const res = await adminApi.getAITutorAuditLogs(params, { _silent: true })
      sensitiveLogs.value = res.data.records || []
      auditTotal.value = res.data.total || 0
    } catch (error) {
      try {
        // 兼容未上线 AI 助教专用审计接口的旧后端版本。
        const fallbackRes = await adminApi.getSensitiveLogs(params, { _silent: true })
        const fallbackRecords = (fallbackRes.data.records || []).filter((item) =>
          String(item?.action || '').includes('AITutorController')
        )

        sensitiveLogs.value = fallbackRecords
        auditTotal.value = fallbackRecords.length
      } catch (fallbackError) {
        sensitiveLogs.value = []
        auditTotal.value = 0
        message.error('获取审计日志失败')
      }
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

  const fetchAIConfig = async () => {
    try {
      const res = await adminApi.getAITutorConfig()
      aiConfig.value = {
        ...defaultAITutorConfig,
        ...(res.data || {})
      }
    } catch (error) {
      message.error('获取配置失败')
    }
  }

  const handleCleanup = async () => {
    try {
      const res = await adminApi.triggerAITutorCleanup(aiConfig.value.cleanupDaysToKeep)
      message.success(res.data.message || '清理完成')
      await Promise.all([fetchCleanupStats(), fetchDashboardStats(), fetchMessages()])
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

  const handleAuditSearch = () => {
    auditPage.value = 1
    fetchSensitiveLogs()
  }

  const handleAuditPageChange = (nextPage) => {
    auditPage.value = nextPage
    fetchSensitiveLogs()
  }

  const handleEditPrompt = (prompt) => {
    currentPrompt.value = { ...prompt, remark: '' }
    showPromptModal.value = true
  }

  const handleSavePrompt = async () => {
    try {
      await adminApi.updatePrompt(currentPrompt.value.id, currentPrompt.value)
      message.success('提示词已更新')
      showPromptModal.value = false
      fetchPrompts()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleUpdateModel = async (model) => {
    try {
      await adminApi.updateAITutorConfig({ model })
      message.success(`AI 助教模型已切换为 ${model === 'default' ? '系统默认' : model}`)
      fetchAIConfig()
    } catch (error) {
      message.error('切换模型失败')
    }
  }

  const handleSaveConfig = async () => {
    try {
      await adminApi.updateAITutorConfig({
        activeModel: aiConfig.value.activeModel,
        memoryDepth: aiConfig.value.memoryDepth,
        fewShotEnabled: aiConfig.value.fewShotEnabled,
        fallbackEnabled: aiConfig.value.fallbackEnabled,
        cleanupDaysToKeep: aiConfig.value.cleanupDaysToKeep,
        autoCleanup: aiConfig.value.autoCleanup
      })
      message.success('AI 助教策略已保存')
      await Promise.all([fetchAIConfig(), fetchCleanupStats()])
    } catch (error) {
      message.error('保存策略失败')
    }
  }

  const handleResolveSession = async (sessionId, resolved) => {
    try {
      await adminApi.updateAITutorSessionResolved(sessionId, resolved)
      message.success(resolved ? '会话已标记为已处理' : '会话已恢复为待处理')

      if (currentSessionId.value === sessionId && currentSessionMeta.value) {
        currentSessionMeta.value = {
          ...currentSessionMeta.value,
          resolved
        }
      }

      if (sessionMessages.value.length > 0 && currentSessionId.value === sessionId) {
        sessionMessages.value = sessionMessages.value.map((item) => ({
          ...item,
          resolved
        }))
      }

      fetchMessages()
    } catch (error) {
      message.error('更新会话状态失败')
    }
  }

  const handleDeleteSession = async (sessionId) => {
    try {
      await adminApi.deleteAITutorSession(sessionId)
      message.success('会话已删除')

      if (currentSessionId.value === sessionId) {
        showSessionModal.value = false
        sessionMessages.value = []
        currentSessionId.value = ''
        currentSessionMeta.value = null
      }

      fetchMessages()
      fetchDashboardStats()
      fetchCleanupStats()
    } catch (error) {
      message.error('删除会话失败')
    }
  }

  const handleRefresh = () => {
    const tasks = [fetchDashboardStats(), fetchCleanupStats()]

    if (activeTab.value === 'conversations') {
      tasks.push(fetchMessages())
    } else if (activeTab.value === 'audit') {
      tasks.push(fetchSensitiveLogs())
    } else if (activeTab.value === 'settings') {
      tasks.push(fetchPrompts(), fetchAIConfig())
    }

    Promise.all(tasks)
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
    router.push({ path: '/sensitive', query: { keyword: log.matchedWord || log.username } })
  }

  onMounted(() => {
    fetchMessages()
    fetchCleanupStats()
    fetchSensitiveLogs()
    fetchDashboardStats()
    fetchAIConfig()
  })

  return {
    activeTab,
    aiConfig,
    auditKeyword,
    auditPage,
    auditPageSize,
    auditTotal,
    cleanupStats,
    currentPrompt,
    currentSessionId,
    currentSessionMeta,
    dashboardStats,
    fetchPrompts,
    formatTime: formatAITutorTime,
    handleAuditPageChange,
    handleAuditSearch,
    handleCleanup,
    handleDeleteSession,
    handleEditPrompt,
    handleManageSensitive,
    handlePageChange,
    handleRefresh,
    handleResolveSession,
    handleSaveConfig,
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
    resolvedFilter,
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
