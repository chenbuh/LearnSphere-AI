<script setup>
import { h } from 'vue'
import { NButton, NCard, NDataTable, NInput, NPagination, NSelect, NSpace, NTag } from 'naive-ui'
import { Eye, Search, User } from 'lucide-vue-next'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  messages: {
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
  },
  keyword: {
    type: String,
    default: ''
  },
  roleFilter: {
    type: [String, null],
    default: null
  }
})

const emit = defineEmits([
  'update:keyword',
  'update:role-filter',
  'search',
  'page-change',
  'view-session'
])

const roleOptions = [
  { label: '全部', value: null },
  { label: '用户', value: 'user' },
  { label: '助教', value: 'assistant' }
]

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const columns = [
  {
    title: '日期',
    key: 'create_time',
    width: 170,
    render: (row) => formatTime(row.create_time)
  },
  {
    title: '用户',
    key: 'username',
    width: 120,
    render: (row) =>
      h(NSpace, { align: 'center', inline: true }, {
        default: () => [
          h(User, { size: 14, class: 'text-zinc-500' }),
          h('span', { class: 'font-medium' }, row.username || '未知用户')
        ]
      })
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    render: (row) => {
      const isUser = row.role === 'user'
      return h(
        NTag,
        {
          type: isUser ? 'info' : 'success',
          bordered: false,
          size: 'small',
          round: true
        },
        { default: () => (isUser ? '用户' : '助教') }
      )
    }
  },
  {
    title: '主题',
    key: 'topic',
    width: 150,
    ellipsis: true
  },
  {
    title: '内容',
    key: 'content',
    minWidth: 300,
    ellipsis: { tooltip: true }
  },
  {
    title: '会话ID',
    key: 'session_id',
    width: 100,
    render: (row) => h('span', { class: 'text-xs text-zinc-500' }, `${row.session_id.slice(0, 8)}...`)
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
          quaternary: true,
          type: 'primary',
          onClick: () => emit('view-session', row.session_id)
        },
        {
          default: () =>
            h(NSpace, { align: 'center', size: 4 }, {
              default: () => [h(Eye, { size: 16 }), h('span', '查看会话')]
            })
        }
      )
  }
]
</script>

<template>
  <n-card :bordered="false" class="shadow-sm">
    <n-space vertical :size="20">
      <div class="flex justify-between items-center">
        <n-space>
          <n-input
            :value="keyword"
            placeholder="搜索用户名、提问内容或主题..."
            style="width: 320px"
            @update:value="emit('update:keyword', $event)"
            @keyup.enter="emit('search')"
          >
            <template #prefix><Search :size="16" /></template>
          </n-input>
          <n-select
            :value="roleFilter"
            placeholder="角色筛选"
            :options="roleOptions"
            style="width: 140px"
            @update:value="emit('update:role-filter', $event); emit('search')"
          />
          <n-button type="primary" @click="emit('search')">搜索</n-button>
        </n-space>
      </div>

      <n-data-table
        :loading="loading"
        :columns="columns"
        :data="messages"
        :bordered="false"
        class="custom-table"
      />

      <div class="flex justify-end p-4">
        <n-pagination
          :page="page"
          :item-count="total"
          :page-size="pageSize"
          @update:page="emit('page-change', $event)"
        />
      </div>
    </n-space>
  </n-card>
</template>

<style scoped>
.custom-table :deep(.n-data-table-thead) {
  background-color: transparent;
}
</style>
