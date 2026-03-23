<script setup>
import { computed, h } from 'vue'
import {
  NCard,
  NDataTable,
  NIcon,
  NPagination,
  NSpace,
  NTag,
  NTooltip
} from 'naive-ui'
import { CheckCircle, User, XCircle } from 'lucide-vue-next'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  logs: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['page-change'])

const formatDateTime = (value) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

const renderStatusTag = (row) => {
  const isSuccess = Number(row.status) === 1
  const tagNode = h(
    NTag,
    {
      type: isSuccess ? 'success' : 'error',
      bordered: false,
      size: 'small'
    },
    {
      default: () => (isSuccess ? '成功' : '失败'),
      icon: () => h(NIcon, { component: isSuccess ? CheckCircle : XCircle })
    }
  )

  if (isSuccess || !row.errorMsg) {
    return tagNode
  }

  return h(
    NTooltip,
    null,
    {
      trigger: () => tagNode,
      default: () => row.errorMsg
    }
  )
}

const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  {
    title: '操作人',
    key: 'adminUsername',
    width: 140,
    render: (row) =>
      h(
        NSpace,
        { align: 'center', size: 6 },
        {
          default: () => [
            h(NIcon, { component: User, size: 14, class: 'text-slate-400' }),
            h('span', { class: 'font-medium text-slate-100' }, row.adminUsername || '--')
          ]
        }
      )
  },
  {
    title: '模块',
    key: 'module',
    width: 120,
    render: (row) =>
      h(
        NTag,
        { type: 'info', bordered: false, size: 'small' },
        {
          default: () => row.module || '--'
        }
      )
  },
  {
    title: '动作',
    key: 'action',
    width: 160,
    render: (row) => h('span', { class: 'font-semibold text-slate-100' }, row.action || '--')
  },
  {
    title: '详情',
    key: 'details',
    ellipsis: { tooltip: true },
    render: (row) =>
      h(
        'code',
        { class: 'text-xs text-slate-400' },
        row.details || row.errorMsg || '--'
      )
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row) => renderStatusTag(row)
  },
  {
    title: '时间',
    key: 'createTime',
    width: 180,
    render: (row) => formatDateTime(row.createTime)
  },
  {
    title: 'IP',
    key: 'ip',
    width: 140,
    render: (row) => row.ip || '--'
  }
])
</script>

<template>
  <n-card class="table-card" :bordered="false">
    <div class="table-toolbar">
      <div>
        <h2>日志列表</h2>
        <p>第 {{ page }} 页，累计 {{ total }} 条记录</p>
      </div>
      <div class="meta-group">
        <span class="table-meta">当前页 {{ logs.length }} 条</span>
        <span class="table-meta table-meta--soft">远程分页</span>
      </div>
    </div>

    <n-data-table
      :columns="columns"
      :data="logs"
      :loading="loading"
      :bordered="false"
      striped
      remote
      size="large"
    />

    <div class="pagination-wrapper">
      <n-pagination
        :page="page"
        :item-count="total"
        :page-size="pageSize"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.table-card {
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 22px;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.table-toolbar h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.02rem;
  font-weight: 700;
}

.table-toolbar p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.84rem;
}

.meta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-meta {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.16);
  color: #bfdbfe;
  font-size: 0.82rem;
}

.table-meta--soft {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #94a3b8 !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.n-data-table-td) {
  background: transparent !important;
  color: #e2e8f0 !important;
}

:deep(.n-data-table .n-data-table-tr--striped .n-data-table-td) {
  background: rgba(255, 255, 255, 0.01) !important;
  color: #e2e8f0 !important;
}
</style>
