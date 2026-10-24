<script setup>
import { computed, h } from 'vue'
import {
  NButton,
  NDataTable,
  NInput,
  NPagination,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag
} from 'naive-ui'
import { Search } from 'lucide-vue-next'

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
  },
  resolvedFilter: {
    type: [Boolean, null],
    default: null
  }
})

const emit = defineEmits([
  'update:keyword',
  'update:role-filter',
  'update:resolved-filter',
  'search',
  'page-change',
  'view-session',
  'resolve-session',
  'delete-session'
])

const roleOptions = [
  { label: '全部角色', value: null },
  { label: '用户', value: 'user' },
  { label: '助教', value: 'assistant' }
]

const resolvedOptions = [
  { label: '全部状态', value: null },
  { label: '待处理', value: false },
  { label: '已处理', value: true }
]

const formatTime = time => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const pageRange = computed(() => {
  if (!props.total) return '0 - 0'
  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})

const columns = [
  {
    title: '时间',
    key: 'create_time',
    width: 170,
    render: row => formatTime(row.create_time)
  },
  {
    title: '用户',
    key: 'username',
    width: 140,
    ellipsis: { tooltip: true },
    render: row => h('span', { class: 'user-name' }, row.username || '未知用户')
  },
  {
    title: '角色',
    key: 'role',
    width: 96,
    render: row => {
      const isUser = row.role === 'user'
      return h(
        NTag,
        {
          type: isUser ? 'info' : 'success',
          bordered: false,
          size: 'small'
        },
        { default: () => (isUser ? '用户' : '助教') }
      )
    }
  },
  {
    title: '处理状态',
    key: 'resolved',
    width: 110,
    render: row =>
      h(
        NTag,
        {
          type: row.resolved ? 'success' : 'default',
          // Pending sessions wait on a human decision: highlighter marker colours.
          color: row.resolved
            ? undefined
            : { color: '#fdf3d0', textColor: '#7a5a00', borderColor: '#fdf3d0' },
          bordered: false,
          size: 'small'
        },
        { default: () => (row.resolved ? '已处理' : '待处理') }
      )
  },
  {
    title: '主题',
    key: 'topic',
    width: 160,
    ellipsis: { tooltip: true }
  },
  {
    title: '内容',
    key: 'content',
    minWidth: 320,
    ellipsis: { tooltip: true }
  },
  {
    title: '会话ID',
    key: 'session_id',
    width: 126,
    render: row =>
      h('span', { class: 'session-id' }, `${String(row.session_id || '').slice(0, 8)}...`)
  },
  {
    title: '操作',
    key: 'actions',
    width: 210,
    fixed: 'right',
    render: row =>
      h(
        NSpace,
        { size: 4, wrap: false },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                type: 'primary',
                onClick: () => emit('view-session', row.session_id, row)
              },
              { default: () => '查看' }
            ),
            h(
              NButton,
              {
                size: 'small',
                quaternary: true,
                onClick: () => emit('resolve-session', row.session_id, !row.resolved)
              },
              { default: () => (row.resolved ? '恢复待处理' : '标记已处理') }
            ),
            h(
              NPopconfirm,
              {
                onPositiveClick: () => emit('delete-session', row.session_id)
              },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      quaternary: true,
                      type: 'error'
                    },
                    { default: () => '删除' }
                  ),
                default: () => '删除后将隐藏整个会话，确认继续吗？'
              }
            )
          ]
        }
      )
  }
]
</script>

<template>
  <div class="conversation-tab">
    <div class="ls-filter">
      <n-input
        :value="keyword"
        placeholder="搜索用户名、提问内容或主题"
        class="filter-input"
        clearable
        @update:value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="15" /></template>
      </n-input>

      <n-select
        :value="roleFilter"
        placeholder="角色"
        :options="roleOptions"
        class="filter-select"
        @update:value="emit('update:role-filter', $event)"
      />

      <n-select
        :value="resolvedFilter"
        placeholder="处理状态"
        :options="resolvedOptions"
        class="filter-select"
        @update:value="emit('update:resolved-filter', $event)"
      />

      <n-button @click="emit('search')">搜索</n-button>
    </div>

    <n-data-table
      :loading="loading"
      :columns="columns"
      :data="messages"
      :bordered="false"
      :scroll-x="1300"
    />

    <div class="ls-panel__foot tab-foot">
      <span class="tab-foot__range">第 {{ pageRange }} 条，共 {{ total }} 条</span>
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
.filter-input {
  width: 320px;
}

.filter-select {
  width: 140px;
}

.tab-foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-foot__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.conversation-tab :deep(.n-data-table-td[data-col-key='create_time']) {
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}

.conversation-tab :deep(.session-id) {
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 12px;
}

.conversation-tab :deep(.user-name) {
  color: var(--ink);
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-input,
  .filter-select {
    width: 100%;
  }
}
</style>
