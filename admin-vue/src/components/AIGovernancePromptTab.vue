<script setup>
import { defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NPopconfirm,
  NSpace,
  useMessage
} from 'naive-ui'
import { Edit, History, Plus, RefreshCcw, Trash } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const AIGovernancePromptEditorModal = defineAsyncComponent(() => import('@/components/AIGovernancePromptEditorModal.vue'))
const AIGovernancePromptHistoryModal = defineAsyncComponent(() => import('@/components/AIGovernancePromptHistoryModal.vue'))

const message = useMessage()
const loading = ref(false)
const promptList = ref([])
const showPromptModal = ref(false)
const isEditPrompt = ref(false)
const currentPrompt = ref({
  id: null,
  promptKey: '',
  description: '',
  content: '',
  remark: ''
})
const showHistoryModal = ref(false)
const selectedPromptForHistory = ref(null)

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchPrompts = async () => {
  loading.value = true
  try {
    const res = await adminApi.getPrompts()
    promptList.value = res.data
  } catch (error) {
    message.error('加载提示词失败')
  } finally {
    loading.value = false
  }
}

const handleAddPrompt = () => {
  isEditPrompt.value = false
  currentPrompt.value = {
    id: null,
    promptKey: '',
    description: '',
    content: '',
    remark: ''
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showPromptModal.value = true
}

const handleEditPrompt = (row) => {
  isEditPrompt.value = true
  currentPrompt.value = { ...row }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showPromptModal.value = true
}

const handleDeletePrompt = async (id) => {
  try {
    await adminApi.deletePrompt(id)
    message.success('删除成功')
    fetchPrompts()
  } catch (error) {
    message.error('删除失败')
  }
}

const handleViewHistory = (row) => {
  selectedPromptForHistory.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showHistoryModal.value = true
}

const promptColumns = [
  { title: 'ID', key: 'id', width: 60 },
  { title: 'Key', key: 'promptKey', width: 200, ellipsis: true },
  { title: '描述', key: 'description', width: 250 },
  { title: '最后更新', key: 'updateTime', width: 180, render: (row) => formatTime(row.updateTime) },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'primary',
            ghost: true,
            onClick: () => handleEditPrompt(row)
          }, { default: () => h(Edit, { size: 14 }) }),
          h(NButton, {
            size: 'small',
            type: 'info',
            ghost: true,
            onClick: () => handleViewHistory(row)
          }, { default: () => h(History, { size: 14 }) }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDeletePrompt(row.id)
          }, {
            trigger: () => h(NButton, {
              size: 'small',
              type: 'error',
              ghost: true
            }, { default: () => h(Trash, { size: 14 }) }),
            default: () => `确定要删除 "${row.promptKey}" 吗？此操作不可恢复。`
          })
        ]
      })
    }
  }
]

onMounted(() => {
  fetchPrompts()
})
</script>

<template>
  <n-card class="governance-card" :bordered="false">
    <div class="section-toolbar">
      <n-space>
        <n-button secondary @click="fetchPrompts">
          <template #icon><RefreshCcw :size="16" /></template>
          刷新列表
        </n-button>
        <n-button type="primary" @click="handleAddPrompt">
          <template #icon><Plus :size="16" /></template>
          新建提示词
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="promptColumns"
      :data="promptList"
      :loading="loading"
      :bordered="false"
      :pagination="{ pageSize: 10 }"
    />
  </n-card>

  <AIGovernancePromptEditorModal
    v-if="showPromptModal"
    v-model:show="showPromptModal"
    :prompt-data="currentPrompt"
    :is-edit="isEditPrompt"
    @saved="fetchPrompts"
  />

  <AIGovernancePromptHistoryModal
    v-if="showHistoryModal"
    v-model:show="showHistoryModal"
    :prompt="selectedPromptForHistory"
    @rolled-back="fetchPrompts"
  />
</template>

<style scoped>
.section-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>