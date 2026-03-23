<script setup>
import { computed, defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  NText,
  useMessage
} from 'naive-ui'
import { Edit, History, Plus, RefreshCcw, Trash } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import {
  aiPromptModuleOptions,
  aiPromptStageOptions,
  buildPromptMeta,
  groupPromptsByModule,
  matchPromptKeyword
} from '@/utils/aiPromptMeta'

const AIGovernancePromptEditorModal = defineAsyncComponent(() => import('@/components/AIGovernancePromptEditorModal.vue'))
const AIGovernancePromptHistoryModal = defineAsyncComponent(() => import('@/components/AIGovernancePromptHistoryModal.vue'))

const message = useMessage()
const loading = ref(false)
const promptList = ref([])
const keyword = ref('')
const selectedModule = ref('all')
const selectedStage = ref('all')
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
    promptList.value = (res.data || []).map(buildPromptMeta)
  } catch (error) {
    console.error(error)
    message.error('加载提示词失败')
  } finally {
    loading.value = false
  }
}

const filteredPrompts = computed(() =>
  promptList.value.filter((prompt) => {
    if (selectedModule.value !== 'all' && prompt.module.id !== selectedModule.value) {
      return false
    }
    if (selectedStage.value !== 'all' && prompt.stage.key !== selectedStage.value) {
      return false
    }
    return matchPromptKeyword(prompt, keyword.value)
  })
)

const groupedPrompts = computed(() => groupPromptsByModule(filteredPrompts.value))
const totalPromptCount = computed(() => promptList.value.length)
const stagePromptCount = computed(() => promptList.value.filter((prompt) => prompt.stage.key !== 'general').length)

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
    console.error(error)
    message.error('删除失败')
  }
}

const handleViewHistory = (row) => {
  selectedPromptForHistory.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showHistoryModal.value = true
}

const promptColumns = [
  {
    title: 'Prompt Key',
    key: 'promptKey',
    width: 240,
    ellipsis: true,
    render: (row) =>
      h('div', { class: 'key-cell' }, [
        h('div', { class: 'key-main' }, row.promptKey),
        h('div', { class: 'key-sub' }, row.displayDescription)
      ])
  },
  {
    title: '学段',
    key: 'stage',
    width: 90,
    render: (row) =>
      h(
        NTag,
        {
          size: 'small',
          bordered: false,
          type: row.stage.color
        },
        { default: () => row.stage.label }
      )
  },
  {
    title: '类型',
    key: 'kind',
    width: 110,
    render: (row) =>
      h(
        NTag,
        {
          size: 'small',
          bordered: false,
          type: row.kind.color
        },
        { default: () => row.kind.label }
      )
  },
  {
    title: '说明',
    key: 'description',
    minWidth: 220,
    render: (row) => h(NText, { depth: 3 }, { default: () => row.description || row.displayDescription })
  },
  {
    title: '最后更新',
    key: 'updateTime',
    width: 180,
    render: (row) => formatTime(row.updateTime)
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              ghost: true,
              onClick: () => handleEditPrompt(row)
            },
            { default: () => h(Edit, { size: 14 }) }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              ghost: true,
              onClick: () => handleViewHistory(row)
            },
            { default: () => h(History, { size: 14 }) }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => handleDeletePrompt(row.id)
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
              default: () => `确定要删除 "${row.promptKey}" 吗？此操作不可恢复。`
            }
          )
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
    <div class="overview-panel">
      <div>
        <div class="overview-kicker">提示词管理</div>
        <div class="overview-title">系统提示词</div>
        <div class="overview-subtitle">按模块、学段和用途维护系统提示词。</div>
      </div>
      <n-space>
        <div class="metric-chip">
          <span class="metric-label">总模板</span>
          <strong>{{ totalPromptCount }}</strong>
        </div>
        <div class="metric-chip accent">
          <span class="metric-label">学段模板</span>
          <strong>{{ stagePromptCount }}</strong>
        </div>
      </n-space>
    </div>

    <div class="section-toolbar">
      <div class="filter-row">
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="搜索 key、说明、模块或学段"
          class="filter-input"
        />
        <n-select
          v-model:value="selectedModule"
          :options="aiPromptModuleOptions"
          class="filter-select"
        />
        <n-select
          v-model:value="selectedStage"
          :options="aiPromptStageOptions"
          class="filter-select"
        />
      </div>
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

    <div v-if="groupedPrompts.length" class="prompt-group-list">
      <n-card
        v-for="group in groupedPrompts"
        :key="group.id"
        class="prompt-group-card"
        :bordered="false"
      >
        <div class="group-header">
          <div>
            <div class="group-title-row">
              <n-tag size="small" :type="group.color" :bordered="false">{{ group.label }}</n-tag>
              <span class="group-count">{{ group.prompts.length }} 条</span>
            </div>
            <div class="group-description">{{ group.description }}</div>
          </div>
        </div>

        <n-data-table
          :columns="promptColumns"
          :data="group.prompts"
          :loading="loading"
          :bordered="false"
          :pagination="false"
          size="small"
        />
      </n-card>
    </div>

    <n-empty
      v-else
      description="当前筛选条件下没有可展示的提示词"
      class="empty-state"
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
.overview-panel {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 20px 22px;
  margin-bottom: 18px;
  border-radius: 20px;
  background: rgba(12, 18, 28, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.overview-kicker {
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #67e8f9;
  text-transform: uppercase;
}

.overview-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
}

.overview-subtitle {
  margin-top: 8px;
  max-width: 680px;
  color: rgba(226, 232, 240, 0.72);
  line-height: 1.7;
}

.metric-chip {
  min-width: 96px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.48);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
}

.metric-chip.accent {
  background: rgba(30, 41, 59, 0.72);
  border-color: rgba(34, 211, 238, 0.14);
}

.metric-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.66);
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.filter-row {
  display: flex;
  gap: 12px;
  flex: 1;
}

.filter-input {
  max-width: 360px;
}

.filter-select {
  width: 160px;
}

.prompt-group-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.prompt-group-card {
  border-radius: 20px;
  background: rgba(12, 18, 28, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.group-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-count {
  color: rgba(148, 163, 184, 0.86);
  font-size: 12px;
}

.group-description {
  margin-top: 8px;
  color: rgba(203, 213, 225, 0.72);
  font-size: 13px;
}

.key-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.key-main {
  font-family: Consolas, 'SFMono-Regular', monospace;
  font-size: 13px;
  color: #f8fafc;
}

.key-sub {
  font-size: 12px;
  color: rgba(148, 163, 184, 0.8);
}

.empty-state {
  padding: 48px 0;
}

@media (max-width: 1024px) {
  .overview-panel,
  .section-toolbar,
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-input,
  .filter-select {
    max-width: none;
    width: 100%;
  }
}
</style>
