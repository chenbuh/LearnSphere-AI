<script setup>
import { h } from 'vue'
import { NButton, NCard, NDataTable, NIcon, NTag } from 'naive-ui'
import { Eye } from 'lucide-vue-next'
import { getUserLogActionLabel, getUserLogModuleLabel } from '@/utils/adminUserLogsConfig'

defineProps({
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

const columns = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '用户',
    key: 'username',
    width: 120,
    render: (row) => h('span', { style: { fontWeight: '500' } }, row.username || '-')
  },
  {
    title: '模块',
    key: 'module',
    width: 100,
    render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => getUserLogModuleLabel(row.module, row.module || '-') })
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: (row) => h(NTag, { type: 'success', size: 'small' }, { default: () => getUserLogActionLabel(row.action, row.action || '-') })
  },
  {
    title: '操作说明',
    key: 'details',
    minWidth: 280,
    ellipsis: { tooltip: true },
    render: (row) => row.details || '未记录具体说明'
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 140,
    render: (row) => h('code', row.ip || '-')
  },
  {
    title: '地理位置',
    key: 'location',
    width: 150,
    render: (row) => {
      const location = [row.ipProvince, row.ipCity].filter(Boolean).join(' ')
      return h('span', location || '-')
    }
  },
  {
    title: '设备',
    key: 'deviceType',
    width: 100,
    render: (row) => {
      if (row.deviceType === 'Mobile') {
        return h(NTag, { type: 'warning', size: 'small' }, { default: () => '移动端' })
      }
      if (row.deviceType === 'Tablet') {
        return h(NTag, { type: 'info', size: 'small' }, { default: () => '平板' })
      }
      return h(NTag, { size: 'small' }, { default: () => '桌面' })
    }
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 100,
    render: (row) => h('span', row.browser || '-')
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      row.status === 1
        ? h(NTag, { type: 'success', size: 'small' }, { default: () => '成功' })
        : h(NTag, { type: 'error', size: 'small' }, { default: () => '失败' })
  },
  {
    title: '时间',
    key: 'createTime',
    width: 160,
    render: (row) => h('span', row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          onClick: () => emit('view-detail', row)
        },
        {
          icon: () => h(NIcon, null, { default: () => h(Eye) }),
          default: () => '详情'
        }
      )
  }
]
</script>

<template>
  <n-card :bordered="false">
    <n-data-table
      :columns="columns"
      :data="logs"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row) => row.id"
      @update:page="emit('page-change', $event)"
      @update:page-size="emit('page-size-change', $event)"
    />
  </n-card>
</template>
