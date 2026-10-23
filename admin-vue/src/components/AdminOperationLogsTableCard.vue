<script setup>
import { computed, h } from 'vue'
import {
  NDataTable,
  NIcon,
  NPagination,
  NTag,
  NTooltip
} from 'naive-ui'
import { CheckCircle, XCircle } from 'lucide-vue-next'

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
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'font-medium text-slate-100' }, row.adminUsername || '--')
  },
  {
    title: '模块',
    key: 'module',
    width: 120,
    render: (row) =>
      h(
        NTag,
        { bordered: false, size: 'small' },
        {
          default: () => row.module || '--'
        }
      )
  },
  {
    title: '动作',
    key: 'action',
    width: 160,
    render: (row) => h('span', { class: 'font-medium text-slate-100' }, row.action || '--')
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
  <div class="oplog-table">
    <n-data-table
      :columns="columns"
      :data="logs"
      :loading="loading"
      :bordered="false"
      :scroll-x="1100"
      remote
    />

    <div class="ls-panel__foot oplog-table__foot">
      <span class="oplog-table__range">第 {{ page }} 页，共 {{ total }} 条</span>
      <n-pagination
        :page="page"
        :item-count="total"
        :page-size="pageSize"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.oplog-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.oplog-table__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* Render-function cells carry utility class names that have no stylesheet; style them here. */
:deep(.n-data-table-td .text-slate-400) {
  color: var(--ink-3);
}

:deep(.n-data-table-td .text-slate-100) {
  color: var(--ink);
}

:deep(.n-data-table-td .font-medium) {
  font-weight: 500;
}

:deep(.n-data-table-td .font-semibold) {
  font-weight: 600;
}

:deep(.n-data-table-td code) {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink-2);
}

:deep(.n-data-table-td[data-col-key='ip']),
:deep(.n-data-table-td[data-col-key='createTime']) {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--ink-2);
}
</style>
