<script setup>
import { computed, h } from 'vue'
import { NButton, NCard, NDataTable, NPagination, NTag } from 'naive-ui'
import { Crown, KeyRound } from 'lucide-vue-next'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedUserIds: {
    type: Array,
    default: () => []
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:selected-user-ids',
  'page-change',
  'page-size-change',
  'detail',
  'edit',
  'vip',
  'toggle-status',
  'password',
  'delete'
])

const isVipUser = (row) => row.vipExpireTime && new Date(row.vipExpireTime) > new Date()

const rowActionsStyle = {
  display: 'grid',
  gap: '8px',
  width: 'min(100%, 320px)',
  minWidth: '296px'
}

const rowActionsLineStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '6px'
}

const rowActionButtonStyle = {
  width: '100%',
  justifyContent: 'center',
  fontWeight: '600'
}

const columns = computed(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 72 },
  { title: '用户名', key: 'username', width: 132 },
  { title: '昵称', key: 'nickname', width: 132 },
  {
    title: 'VIP',
    key: 'vipStatus',
    width: 110,
    render: (row) => {
      const isVip = isVipUser(row)
      return h(
        NTag,
        {
          type: isVip ? 'warning' : 'default',
          size: 'small',
          bordered: false,
          round: true
        },
        {
          default: () => (isVip ? `VIP${row.vipLevel || ''}` : '普通'),
          icon: isVip ? () => h(Crown, { size: 14 }) : undefined
        }
      )
    }
  },
  {
    title: 'VIP 到期时间',
    key: 'vipExpireTime',
    width: 180,
    render: (row) => {
      if (!row.vipExpireTime) return '-'
      const expireDate = new Date(row.vipExpireTime)
      const isExpired = expireDate < new Date()
      return h(
        'span',
        {
          style: { color: isExpired ? '#8ea1ba' : '#6ee0d0' }
        },
        expireDate.toLocaleString('zh-CN')
      )
    }
  },
  {
    title: '生成配额',
    key: 'dailyAiQuota',
    width: 110,
    render: (row) => {
      if (row.dailyAiQuota !== null && row.dailyAiQuota !== undefined) {
        return h('span', { style: { color: '#78bbff', fontWeight: '700' } }, row.dailyAiQuota)
      }

      if (!isVipUser(row)) return h('span', { style: { color: '#8ea1ba' } }, 5)

      const recommend = row.vipLevel === 1 ? 50 : row.vipLevel === 2 ? 100 : 200
      return h('span', { style: { color: '#f3c172', fontWeight: '700' } }, recommend)
    }
  },
  {
    title: '助教配额',
    key: 'dailyTutorQuota',
    width: 110,
    render: (row) => {
      if (row.dailyTutorQuota !== null && row.dailyTutorQuota !== undefined) {
        return h('span', { style: { color: '#f7a8c8', fontWeight: '700' } }, row.dailyTutorQuota)
      }

      if (!isVipUser(row)) return h('span', { style: { color: '#8ea1ba' } }, 200)

      const recommend = row.vipLevel === 1 ? 400 : row.vipLevel === 2 ? 800 : 1500
      return h('span', { style: { color: '#f7a8c8', fontWeight: '700' } }, recommend)
    }
  },
  { title: '邮箱', key: 'email', width: 220 },
  {
    title: '状态',
    key: 'status',
    width: 92,
    render: (row) =>
      h(
        NTag,
        {
          type: row.status === 1 ? 'success' : 'error',
          size: 'small',
          bordered: false,
          round: true
        },
        { default: () => (row.status === 1 ? '正常' : '禁用') }
      )
  },
  {
    title: '注册时间',
    key: 'createTime',
    width: 180,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 348,
    fixed: 'right',
    render: (row) => {
      const primaryActions = [
        h(
          NButton,
          {
            size: 'tiny',
            type: 'info',
            secondary: true,
            style: rowActionButtonStyle,
            onClick: () => emit('detail', row)
          },
          { default: () => '详情' }
        ),
        h(
          NButton,
          {
            size: 'tiny',
            secondary: true,
            style: rowActionButtonStyle,
            onClick: () => emit('edit', row)
          },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'warning',
            secondary: true,
            style: rowActionButtonStyle,
            onClick: () => emit('vip', row)
          },
          { default: () => 'VIP' }
        )
      ]

      const secondaryActions = [
        h(
          NButton,
          {
            size: 'tiny',
            type: row.status === 1 ? 'error' : 'success',
            secondary: true,
            style: rowActionButtonStyle,
            onClick: () => emit('toggle-status', row)
          },
          { default: () => (row.status === 1 ? '禁用' : '启用') }
        ),
        h(
          NButton,
          {
            size: 'tiny',
            secondary: true,
            style: rowActionButtonStyle,
            onClick: () => emit('password', row)
          },
          {
            icon: () => h(KeyRound, { size: 12 }),
            default: () => '密码'
          }
        ),
        h(
          NButton,
          {
            size: 'tiny',
            type: 'error',
            tertiary: true,
            style: rowActionButtonStyle,
            onClick: () => emit('delete', row)
          },
          { default: () => '删除' }
        )
      ]

      return h('div', { class: 'row-actions', style: rowActionsStyle }, [
        h('div', { style: rowActionsLineStyle }, primaryActions),
        h('div', { style: rowActionsLineStyle }, secondaryActions)
      ])
    }
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
const currentCount = computed(() => props.users.length)
const vipCount = computed(() => props.users.filter((row) => isVipUser(row)).length)
const disabledCount = computed(() => props.users.filter((row) => Number(row.status) !== 1).length)
const quotaAdjustedCount = computed(() =>
  props.users.filter(
    (row) =>
      (row.dailyAiQuota !== null && row.dailyAiQuota !== undefined) ||
      (row.dailyTutorQuota !== null && row.dailyTutorQuota !== undefined)
  ).length
)
const pageRange = computed(() => {
  if (!props.total) {
    return '0 - 0'
  }

  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})
</script>

<template>
  <n-card class="table-card" :bordered="false" style="overflow: hidden">
    <div class="table-head">
      <div class="table-copy">
        <span class="table-label">账号台账</span>
        <h2>账号、配额与状态</h2>
        <p>当前展示 {{ pageRange }} / {{ total }}，支持直接处理 VIP、配额和状态。</p>
      </div>
      <div class="table-meta">
        <span class="table-pill">已选 {{ selectedUserIds.length }} 人</span>
        <span class="table-pill">每页 {{ pageSize }} 条</span>
        <span class="table-pill" :class="{ active: loading }">
          {{ loading ? '数据刷新中' : '列表可操作' }}
        </span>
      </div>
    </div>

    <div class="table-summary">
      <article class="summary-chip">
        <span>当前页</span>
        <strong>{{ currentCount }}</strong>
      </article>
      <article class="summary-chip">
        <span>有效 VIP</span>
        <strong>{{ vipCount }}</strong>
      </article>
      <article class="summary-chip">
        <span>禁用</span>
        <strong>{{ disabledCount }}</strong>
      </article>
      <article class="summary-chip">
        <span>配额调整</span>
        <strong>{{ quotaAdjustedCount }}</strong>
      </article>
    </div>

    <div class="table-shell">
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :bordered="false"
        :single-line="false"
        size="small"
        scroll-x="1780"
        :row-key="(row) => row.id"
        :checked-row-keys="selectedUserIds"
        @update:checked-row-keys="emit('update:selected-user-ids', $event)"
      />
    </div>

    <div class="pagination">
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[10, 20, 30, 50]"
        @update:page="emit('page-change', $event)"
        @update:page-size="emit('page-size-change', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.table-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
}

.table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.table-copy {
  min-width: 0;
}

.table-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #8fe7dc;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-head h2 {
  margin: 0;
  color: #f7fbff;
  font-size: 1.14rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.table-head p {
  margin: 6px 0 0;
  color: #8ea1ba;
  font-size: 0.88rem;
}

.table-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.table-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.table-pill.active {
  border-color: rgba(62, 207, 188, 0.22);
  color: #8fe7dc;
}

.table-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.summary-chip {
  display: grid;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.summary-chip span {
  color: #68809c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-chip strong {
  color: #f7fbff;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1;
}

.table-shell {
  border-radius: 18px;
  overflow: hidden;
}

.row-actions {
  min-width: 0;
  position: relative;
  z-index: 1;
}

.table-shell :deep(td) {
  vertical-align: top;
}

.table-shell :deep(.n-data-table-th--fixed-right),
.table-shell :deep(.n-data-table-td--fixed-right) {
  background: linear-gradient(180deg, rgba(15, 23, 37, 0.98), rgba(11, 18, 30, 0.98));
}

.table-shell :deep(.n-data-table-th--first-fixed-right),
.table-shell :deep(.n-data-table-td--first-fixed-right) {
  box-shadow: -16px 0 28px rgba(4, 9, 18, 0.36);
}

.table-shell :deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02);
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .table-head {
    flex-direction: column;
  }

  .table-meta {
    justify-content: flex-start;
  }

  .table-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .table-summary {
    grid-template-columns: 1fr;
  }
}
</style>
