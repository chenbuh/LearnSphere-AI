<script setup>
import { h } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NPagination,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag
} from 'naive-ui'
import { CheckCheck, Eye, Search, Trash2, User } from 'lucide-vue-next'

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

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const columns = [
  {
    title: '时间',
    key: 'create_time',
    width: 170,
    render: (row) => formatTime(row.create_time)
  },
  {
    title: '用户',
    key: 'username',
    width: 140,
    render: (row) =>
      h(
        NSpace,
        { align: 'center', inline: true, size: 8 },
        {
          default: () => [
            h(User, { size: 14, class: 'user-icon' }),
            h('span', { class: 'user-name' }, row.username || '未知用户')
          ]
        }
      )
  },
  {
    title: '角色',
    key: 'role',
    width: 96,
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
    title: '处理状态',
    key: 'resolved',
    width: 110,
    render: (row) =>
      h(
        NTag,
        {
          type: row.resolved ? 'success' : 'warning',
          bordered: false,
          size: 'small',
          round: true
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
    render: (row) => h('span', { class: 'session-id' }, `${String(row.session_id || '').slice(0, 8)}...`)
  },
  {
    title: '操作',
    key: 'actions',
    width: 258,
    fixed: 'right',
    render: (row) =>
      h('div', { class: 'row-actions' }, [
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: 'primary',
            onClick: () => emit('view-session', row.session_id, row)
          },
          {
            default: () =>
              h(NSpace, { align: 'center', size: 4 }, { default: () => [h(Eye, { size: 15 }), h('span', '查看')] })
          }
        ),
        h(
          NButton,
          {
            size: 'small',
            quaternary: true,
            type: row.resolved ? 'warning' : 'success',
            onClick: () => emit('resolve-session', row.session_id, !row.resolved)
          },
          {
            default: () =>
              h(
                NSpace,
                { align: 'center', size: 4 },
                { default: () => [h(CheckCheck, { size: 15 }), h('span', row.resolved ? '恢复待处理' : '标记已处理')] }
              )
          }
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
                {
                  default: () =>
                    h(NSpace, { align: 'center', size: 4 }, { default: () => [h(Trash2, { size: 15 }), h('span', '删除')] })
                }
              ),
            default: () => '删除后将隐藏整个会话，确认继续吗？'
          }
        )
      ])
  }
]
</script>

<template>
  <n-card class="conversation-card" :bordered="false">
    <div class="toolbar">
      <div class="toolbar-main">
        <n-input
          :value="keyword"
          placeholder="搜索用户名、提问内容或主题"
          class="toolbar-input"
          clearable
          @update:value="emit('update:keyword', $event)"
          @keyup.enter="emit('search')"
        >
          <template #prefix><Search :size="16" /></template>
        </n-input>

        <n-select
          :value="roleFilter"
          placeholder="角色"
          :options="roleOptions"
          class="toolbar-select"
          @update:value="emit('update:role-filter', $event)"
        />

        <n-select
          :value="resolvedFilter"
          placeholder="处理状态"
          :options="resolvedOptions"
          class="toolbar-select"
          @update:value="emit('update:resolved-filter', $event)"
        />

        <n-button type="primary" @click="emit('search')">查询会话</n-button>
      </div>

      <div class="toolbar-meta">
        <span class="meta-pill">当前 {{ messages.length }} 条</span>
        <span class="meta-pill">总计 {{ total }} 条</span>
      </div>
    </div>

    <div class="table-shell">
      <n-data-table
        :loading="loading"
        :columns="columns"
        :data="messages"
        :bordered="false"
        size="small"
        scroll-x="1360"
        class="custom-table"
      />
    </div>

    <div class="pagination">
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
.conversation-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
}

.toolbar {
  display: grid;
  gap: 14px;
  margin-bottom: 16px;
}

.toolbar-main {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-input {
  width: min(100%, 340px);
}

.toolbar-select {
  width: 140px;
}

.toolbar-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #8ea1ba;
  font-size: 0.78rem;
  font-weight: 600;
}

.table-shell {
  overflow: hidden;
  border-radius: 18px;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.session-id {
  color: #8ea1ba;
  font-size: 12px;
}

.user-icon {
  color: #8ea1ba;
}

.user-name {
  color: #e2e8f0;
  font-weight: 600;
}

.custom-table :deep(.n-data-table-th--fixed-right),
.custom-table :deep(.n-data-table-td--fixed-right) {
  background: linear-gradient(180deg, rgba(15, 23, 37, 0.98), rgba(11, 18, 30, 0.98));
}

.custom-table :deep(.n-data-table-th--first-fixed-right),
.custom-table :deep(.n-data-table-td--first-fixed-right) {
  box-shadow: -16px 0 28px rgba(4, 9, 18, 0.32);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 768px) {
  .toolbar-input,
  .toolbar-select {
    width: 100%;
  }

  .pagination {
    justify-content: flex-start;
  }
}
</style>
