<script setup>
import { computed, defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui'
import { Edit, History, Plus, RefreshCw, Search, Trash } from 'lucide-vue-next'
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
    width: 260,
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
          bordered: false
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
          bordered: false
        },
        { default: () => row.kind.label }
      )
  },
  {
    title: '说明',
    key: 'description',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row) => row.description || row.displayDescription
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
    width: 120,
    render(row) {
      return h(NSpace, { size: 4, wrap: false }, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              quaternary: true,
              'aria-label': '编辑',
              title: '编辑',
              onClick: () => handleEditPrompt(row)
            },
            { default: () => h(Edit, { size: 14 }) }
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              quaternary: true,
              'aria-label': '历史版本',
              title: '历史版本',
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
                    quaternary: true,
                    'aria-label': '删除',
                    title: '删除'
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
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="fetchPrompts">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
    <n-button type="primary" @click="handleAddPrompt">
      <template #icon>
        <n-icon :component="Plus" />
      </template>
      新建提示词
    </n-button>
  </Teleport>

  <section class="ls-panel prompt-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">
        系统提示词
        <span class="ls-panel__count">共 {{ totalPromptCount }} 条 · 学段模板 {{ stagePromptCount }} 条</span>
      </h2>
    </header>

    <div class="ls-filter">
      <n-input
        v-model:value="keyword"
        clearable
        placeholder="搜索 key、说明、模块或学段"
        style="width: 320px"
      >
        <template #prefix>
          <n-icon :component="Search" />
        </template>
      </n-input>
      <n-select
        v-model:value="selectedModule"
        :options="aiPromptModuleOptions"
        style="width: 160px"
        aria-label="模块筛选"
      />
      <n-select
        v-model:value="selectedStage"
        :options="aiPromptStageOptions"
        style="width: 160px"
        aria-label="学段筛选"
      />
    </div>

    <template v-if="groupedPrompts.length">
      <div v-for="group in groupedPrompts" :key="group.id" class="prompt-group">
        <div class="prompt-group__head" :title="group.description">
          <span class="prompt-group__name">{{ group.label }}</span>
          <span class="prompt-group__count">{{ group.prompts.length }} 条</span>
        </div>
        <n-data-table
          :columns="promptColumns"
          :data="group.prompts"
          :loading="loading"
          :bordered="false"
          :pagination="false"
          :scroll-x="1000"
          size="small"
        />
      </div>
    </template>

    <div v-else class="ls-empty">当前筛选条件下没有可展示的提示词</div>
  </section>

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
.prompt-group + .prompt-group {
  border-top: 1px solid var(--line);
}

/* Module sub-heading: same 20px gutter as the panel head and table cells. */
.prompt-group__head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 14px 20px 10px;
  background: var(--surface);
}

.prompt-group__name {
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}

.prompt-group__count {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.prompt-panel :deep(.key-cell) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.prompt-panel :deep(.key-main) {
  overflow: hidden;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-panel :deep(.key-sub) {
  overflow: hidden;
  color: var(--ink-3);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prompt-panel :deep(.n-data-table-td[data-col-key='description']) {
  color: var(--ink-2);
}

.prompt-panel :deep(.n-data-table-td[data-col-key='updateTime']) {
  color: var(--ink-2);
  font-family: var(--font-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .ls-filter :deep(.n-input),
  .ls-filter :deep(.n-base-selection) {
    width: 100% !important;
  }
}
</style>
