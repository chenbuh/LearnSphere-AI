import { computed, h, onMounted, ref } from 'vue'
import { NButton, NPopconfirm, NSpace, useMessage } from 'naive-ui'
import { Edit, Trash, Bot } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import {
  MODULE_NAME_MAP,
  createContentColumns,
  createDefaultFormData
} from '@/utils/adminContentConfig'

export function useAdminContent() {
  const message = useMessage()
  const loading = ref(false)
  const activeTab = ref('listening')
  const listeningList = ref([])
  const readingList = ref([])
  const grammarList = ref([])
  const speakingList = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)

  const showAuditModal = ref(false)
  const auditResult = ref(null)
  const auditingId = ref(null)

  const showModal = ref(false)
  const isEdit = ref(false)
  const formData = ref(createDefaultFormData('listening'))

  const getModuleName = (type) => MODULE_NAME_MAP[type] || '内容'

  const handleAudit = async (row, type) => {
    auditingId.value = row.id
    try {
      const res = await adminApi.auditContent({ type, id: row.id })
      if (res.code === 200) {
        auditResult.value = res.data
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        showAuditModal.value = true
      }
    } catch (error) {
      message.error('审查请求失败')
    } finally {
      auditingId.value = null
    }
  }

  const getCurrentList = () => {
    const lists = {
      listening: listeningList.value,
      reading: readingList.value,
      grammar: grammarList.value,
      speaking: speakingList.value
    }
    return lists[activeTab.value] || []
  }

  const handleBatchAudit = async () => {
    loading.value = true
    try {
      const list = getCurrentList()
      let count = 0
      for (const item of list) {
        await adminApi.auditContent({ type: activeTab.value, id: item.id })
        count++
      }
      message.success(`已批量审查 ${count} 条内容`)
    } catch (error) {
      message.error('批量审查过程中出错')
    } finally {
      loading.value = false
    }
  }

  const handleAiToolSelect = async (key) => {
    if (!formData.value.content && !formData.value.script && !formData.value.question) {
      message.warning('请先输入正文内容')
      return
    }

    const text = formData.value.content || formData.value.script || formData.value.question
    loading.value = true

    try {
      if (key === 'gen-summary') {
        formData.value.title = '[AI] ' + text.slice(0, 20) + '...'
        message.success('已生成简介')
      } else if (key === 'extract-keywords') {
        formData.value.keywords = JSON.stringify(['AI', 'Technology', 'Future'])
        message.success('关键词已提取')
      }
    } catch (error) {
      message.error('AI 工具调用失败')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (id, type) => {
    try {
      const apiMap = {
        listening: () => adminApi.deleteListening(id),
        reading: () => adminApi.deleteReading(id),
        grammar: () => adminApi.deleteGrammar(id),
        speaking: () => adminApi.deleteSpeaking(id)
      }
      await apiMap[type]()
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const renderActions = (row, type) =>
    h(NSpace, null, {
      default: () => [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => handleEdit(row)
          },
          { default: () => h(Edit, { size: 14 }) }
        ),
        ...(type === 'listening' || type === 'reading'
          ? [
              h(
                NButton,
                {
                  size: 'small',
                  type: 'info',
                  ghost: true,
                  loading: auditingId.value === row.id,
                  onClick: () => handleAudit(row, type)
                },
                { default: () => h(Bot, { size: 14 }) }
              )
            ]
          : []),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id, type)
          },
          {
            trigger: () =>
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  ghost: true
                },
                { default: () => h(Trash, { size: 14 }) }
              ),
            default: () => `确定要删除此${getModuleName(type)}吗？`
          }
        )
      ]
    })

  const columns = computed(() => createContentColumns({ renderActions }))

  const fetchData = async () => {
    loading.value = true
    try {
      const apiMap = {
        listening: () => adminApi.getListeningList({ page: page.value, size: pageSize.value }),
        reading: () => adminApi.getReadingList({ page: page.value, size: pageSize.value }),
        grammar: () => adminApi.getGrammarList({ page: page.value, size: pageSize.value }),
        speaking: () => adminApi.getSpeakingList({ page: page.value, size: pageSize.value })
      }

      const res = await apiMap[activeTab.value]()

      const listMap = {
        listening: listeningList,
        reading: readingList,
        grammar: grammarList,
        speaking: speakingList
      }
      listMap[activeTab.value].value = res.data.records || []
      total.value = res.data.total || 0
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      loading.value = false
    }
  }

  const handleAdd = () => {
    isEdit.value = false
    formData.value = createDefaultFormData(activeTab.value)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    showModal.value = true
  }

  const handleEdit = (row) => {
    isEdit.value = true
    formData.value = { ...row }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    showModal.value = true
  }

  const handleSave = async () => {
    try {
      const apiMap = {
        listening: {
          add: (data) => adminApi.addListening(data),
          update: (id, data) => adminApi.updateListening(id, data)
        },
        reading: {
          add: (data) => adminApi.addReading(data),
          update: (id, data) => adminApi.updateReading(id, data)
        },
        grammar: {
          add: (data) => adminApi.addGrammar(data),
          update: (id, data) => adminApi.updateGrammar(id, data)
        },
        speaking: {
          add: (data) => adminApi.addSpeaking(data),
          update: (id, data) => adminApi.updateSpeaking(id, data)
        }
      }

      if (isEdit.value) {
        await apiMap[activeTab.value].update(formData.value.id, formData.value)
      } else {
        await apiMap[activeTab.value].add(formData.value)
      }
      message.success('保存成功')
      showModal.value = false
      fetchData()
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handleTabChange = (value) => {
    activeTab.value = value
    page.value = 1
    fetchData()
  }

  const handlePageChange = (newPage) => {
    page.value = newPage
    fetchData()
  }

  onMounted(() => {
    fetchData()
  })

  return {
    activeTab,
    auditResult,
    columns,
    fetchData,
    formData,
    getModuleName,
    grammarList,
    handleAdd,
    handleAiToolSelect,
    handleBatchAudit,
    handlePageChange,
    handleSave,
    handleTabChange,
    isEdit,
    listeningList,
    loading,
    page,
    pageSize,
    readingList,
    showAuditModal,
    showModal,
    speakingList,
    total
  }
}
