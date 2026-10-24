<script setup>
import { computed, h } from 'vue'
import { NButton, NDataTable, NPagination, NTag } from 'naive-ui'
import {
  formatUserLogLocation,
  getUserLogActionLabel,
  getUserLogModuleLabel
} from '@/utils/adminUserLogsConfig'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view-detail', 'page-change', 'page-size-change'])

const pageCount = computed(() =>
  Math.max(1, Math.ceil((props.pagination.itemCount || 0) / props.pagination.pageSize))
)

const pageRange = computed(() => {
  const total = props.pagination.itemCount || 0
  if (!total) {
    return '0 - 0'
  }
  const start = (props.pagination.page - 1) * props.pagination.pageSize + 1
  const end = Math.min(props.pagination.page * props.pagination.pageSize, total)
  return `${start} - ${end}`
})

const tag = (label, type) =>
  h(NTag, { size: 'small', bordered: false, ...(type ? { type } : {}) }, { default: () => label })

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '用户',
    key: 'username',
    width: 120,
    render: row => h('span', { style: { fontWeight: '500' } }, row.username || '-')
  },
  {
    title: '模块',
    key: 'module',
    width: 100,
    render: row => tag(getUserLogModuleLabel(row.module, row.module || '-'))
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: row => tag(getUserLogActionLabel(row.action, row.action || '-'))
  },
  {
    title: '操作说明',
    key: 'details',
    minWidth: 280,
    ellipsis: { tooltip: true },
    render: row => row.details || '未记录具体说明'
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 140,
    render: row => h('code', row.ip || '-')
  },
  {
    title: '地理位置',
    key: 'location',
    width: 150,
    ellipsis: { tooltip: true },
    render: row => formatUserLogLocation(row)
  },
  {
    title: '设备',
    key: 'deviceType',
    width: 100,
    render: row => {
      if (row.deviceType === 'Mobile') {
        return '移动端'
      }
      if (row.deviceType === 'Tablet') {
        return '平板'
      }
      return '桌面'
    }
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 110,
    ellipsis: { tooltip: true },
    render: row => row.browser || '-'
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: row => (row.status === 1 ? tag('成功', 'success') : tag('失败', 'error'))
  },
  {
    title: '时间',
    key: 'createTime',
    width: 180,
    render: row => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right',
    render: row =>
      h(
        NButton,
        {
          size: 'small',
          quaternary: true,
          type: 'primary',
          onClick: () => emit('view-detail', row)
        },
        { default: () => '详情' }
      )
  }
]
</script>

<template>
  <div class="user-log-table">
    <n-data-table
      :columns="columns"
      :data="logs"
      :loading="loading"
      :bordered="false"
      :row-key="row => row.id"
      :scroll-x="1540"
      remote
    />

    <div class="ls-panel__foot user-log-table__foot">
      <span class="user-log-table__range"
        >第 {{ pageRange }} 条，共 {{ pagination.itemCount || 0 }} 条</span
      >
      <n-pagination
        :page="pagination.page"
        :page-count="pageCount"
        :page-size="pagination.pageSize"
        show-size-picker
        :page-sizes="pagination.pageSizes || [10, 20, 50, 100]"
        @update:page="emit('page-change', $event)"
        @update:page-size="emit('page-size-change', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.user-log-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.user-log-table__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.user-log-table :deep(.n-data-table-td[data-col-key='username']) {
  color: var(--ink);
  font-weight: 500;
}

.user-log-table :deep(.n-data-table-td code),
.user-log-table :deep(.n-data-table-td[data-col-key='createTime']),
.user-log-table :deep(.n-data-table-td[data-col-key='ip']) {
  font-family: var(--font-mono);
  font-size: 12px;
}

.user-log-table :deep(.n-data-table-td[data-col-key='createTime']) {
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}

.user-log-table :deep(.n-data-table-td code) {
  background: none;
  padding: 0;
  color: var(--ink-2);
}
</style>
