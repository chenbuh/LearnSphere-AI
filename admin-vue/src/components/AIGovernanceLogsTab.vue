<script setup>
import { defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NPagination,
  NSelect,
  NTag,
  NSpace,
  useMessage
} from 'naive-ui'
import { Eye, RefreshCcw } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const AIGovernanceLogDetailModal = defineAsyncComponent(() => import('@/components/AIGovernanceLogDetailModal.vue'))

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

const formatTime = (time) => {
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

const handleViewLog = (row) => {
  selectedLog.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showLogDetail.value = true
}

const handleFilterChange = () => {
  logPage.value = 1
  fetchLogs()
}

const handlePageChange = (page) => {
  logPage.value = page
  fetchLogs()
}

const handlePageSizeChange = (pageSize) => {
  logPageSize.value = pageSize
  logPage.value = 1
  fetchLogs()
}

const logColumns = [
  { title: '时间', key: 'createTime', width: 180, render: (row) => formatTime(row.createTime) },
  { title: '用户ID', key: 'userId', width: 100, render: (row) => row.userId || 'System' },
  { title: '动作类型', key: 'actionType', width: 150 },
  { title: '模型', key: 'modelName', width: 120 },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => h(NTag, { type: row.status === 'SUCCESS' ? 'success' : 'error', bordered: false, round: true }, { default: () => row.status })
  },
  {
    title: 'Tokens',
    key: 'totalTokens',
    width: 140,
    render: (row) => h('div', { class: 'text-xs' }, [
      h('div', { class: 'font-bold' }, row.totalTokens || 0),
      h('div', { class: 'text-zinc-500 transform scale-90 origin-left' }, `${row.inputTokens || 0} in / ${row.outputTokens || 0} out`)
    ])
  },
  { title: '耗时(ms)', key: 'durationMs', width: 100 },
  { title: '错误信息', key: 'errorMessage', width: 200, ellipsis: true },
  {
    title: '详情',
    key: 'actions',
    width: 80,
    render(row) {
      return h(NButton, {
        size: 'small',
        type: 'primary',
        quaternary: true,
        onClick: () => handleViewLog(row)
      }, { default: () => h(Eye, { size: 16 }) })
    }
  }
]

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <n-card class="governance-card" :bordered="false">
    <div class="section-toolbar">
      <div class="filter-bar">
        <n-input
          v-model:value="logActionFilter"
          placeholder="搜索动作类型..."
          class="w-48"
          clearable
          @keyup.enter="handleFilterChange"
        />
        <n-select
          v-model:value="logStatusFilter"
          :options="statusOptions"
          placeholder="状态筛选"
          clearable
          class="w-32"
          @update:value="handleFilterChange"
        />
        <n-button secondary @click="handleFilterChange">查询</n-button>
      </div>
      <n-button secondary @click="fetchLogs">
        <template #icon><RefreshCcw :size="16" /></template>
        刷新日志
      </n-button>
    </div>

    <n-data-table
      :columns="logColumns"
      :data="logList"
      :loading="loading"
      :bordered="false"
    />
    <div class="pagination-wrap">
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
  </n-card>

  <AIGovernanceLogDetailModal
    v-if="showLogDetail"
    v-model:show="showLogDetail"
    :log="selectedLog"
  />
</template>

<style scoped>
.section-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>