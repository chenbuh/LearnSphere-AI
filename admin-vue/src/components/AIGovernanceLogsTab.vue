<script setup>
import { computed, defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NPagination,
  NSelect,
  NTag,
  useMessage
} from 'naive-ui'
import { Eye, RefreshCw, Search } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const AIGovernanceLogDetailModal = defineAsyncComponent(
  () => import('@/components/AIGovernanceLogDetailModal.vue')
)

const message = useMessage()
const loading = ref(false)
const logList = ref([])
const logTotal = ref(0)
const logPage = ref(1)
const logPageSize = ref(10)
const logStatusFilter = ref(null)
const logActionFilter = ref(null)
const showLogDetail = ref(false)
const selectedLog = ref(null)

const statusOptions = [
  { label: '成功', value: 'SUCCESS' },
  { label: '失败', value: 'FAIL' }
]

const formatTime = time => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAILogs({
      page: logPage.value,
      size: logPageSize.value,
      status: logStatusFilter.value,
      actionType: logActionFilter.value
    })
    logList.value = res.data.records
    logTotal.value = res.data.total
  } catch (error) {
    message.error('加载日志失败')
  } finally {
    loading.value = false
  }
}

const handleViewLog = row => {
  selectedLog.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showLogDetail.value = true
}

const handleFilterChange = () => {
  logPage.value = 1
  fetchLogs()
}

const handlePageChange = page => {
  logPage.value = page
  fetchLogs()
}

const handlePageSizeChange = pageSize => {
  logPageSize.value = pageSize
  logPage.value = 1
  fetchLogs()
}

const logColumns = [
  { title: '时间', key: 'createTime', width: 180, render: row => formatTime(row.createTime) },
  { title: '用户ID', key: 'userId', width: 100, render: row => row.userId || 'System' },
  { title: '动作类型', key: 'actionType', width: 160, ellipsis: { tooltip: true } },
  { title: '模型', key: 'modelName', width: 140, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: row =>
      h(
        NTag,
        { type: row.status === 'SUCCESS' ? 'success' : 'error', bordered: false, size: 'small' },
        { default: () => row.status }
      )
  },
  {
    title: 'Tokens',
    key: 'totalTokens',
    width: 140,
    align: 'right',
    render: row =>
      h('div', { class: 'token-cell' }, [
        h('div', { class: 'token-cell__total' }, row.totalTokens || 0),
        h(
          'div',
          { class: 'token-cell__split' },
          `${row.inputTokens || 0} in / ${row.outputTokens || 0} out`
        )
      ])
  },
  { title: '耗时(ms)', key: 'durationMs', width: 100, align: 'right' },
  {
    title: '错误信息',
    key: 'errorMessage',
    minWidth: 200,
    ellipsis: { tooltip: true },
    render: row => row.errorMessage || '--'
  },
  {
    title: '详情',
    key: 'actions',
    width: 80,
    render(row) {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          quaternary: true,
          'aria-label': '查看详情',
          title: '查看详情',
          onClick: () => handleViewLog(row)
        },
        { default: () => h(Eye, { size: 16 }) }
      )
    }
  }
]

const pageRange = computed(() => {
  if (!logTotal.value) return '0 - 0'
  const start = (logPage.value - 1) * logPageSize.value + 1
  const end = Math.min(logPage.value * logPageSize.value, logTotal.value)
  return `${start} - ${end}`
})

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="fetchLogs">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
  </Teleport>

  <section class="ls-panel logs-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">
        运行日志 <span class="ls-panel__count">共 {{ logTotal }} 条</span>
      </h2>
    </header>

    <div class="ls-filter">
      <n-input
        v-model:value="logActionFilter"
        placeholder="搜索动作类型，回车确认"
        clearable
        style="width: 280px"
        @keyup.enter="handleFilterChange"
      >
        <template #prefix>
          <n-icon :component="Search" />
        </template>
      </n-input>
      <n-select
        v-model:value="logStatusFilter"
        :options="statusOptions"
        placeholder="状态筛选"
        clearable
        style="width: 140px"
        @update:value="handleFilterChange"
      />
      <n-button @click="handleFilterChange">搜索</n-button>
    </div>

    <n-data-table
      :columns="logColumns"
      :data="logList"
      :loading="loading"
      :bordered="false"
      :scroll-x="1240"
    />

    <div class="ls-panel__foot logs-panel__foot">
      <span class="logs-panel__range">第 {{ pageRange }} 条，共 {{ logTotal }} 条</span>
      <n-pagination
        v-model:page="logPage"
        v-model:page-size="logPageSize"
        :item-count="logTotal"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </section>

  <AIGovernanceLogDetailModal
    v-if="showLogDetail"
    v-model:show="showLogDetail"
    :log="selectedLog"
  />
</template>

<style scoped>
.logs-panel__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.logs-panel__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.logs-panel :deep(.n-data-table-td[data-col-key='createTime']),
.logs-panel :deep(.n-data-table-td[data-col-key='durationMs']) {
  color: var(--ink-2);
  font-family: var(--font-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.logs-panel :deep(.token-cell) {
  font-variant-numeric: tabular-nums;
}

.logs-panel :deep(.token-cell__total) {
  color: var(--ink);
  font-weight: 600;
}

.logs-panel :deep(.token-cell__split) {
  color: var(--ink-3);
  font-size: 12px;
}

.logs-panel :deep(.n-data-table-td[data-col-key='errorMessage']) {
  color: var(--ink-3);
}
</style>
