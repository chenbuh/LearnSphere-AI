<script setup>
import { computed, h } from 'vue'
import { NButton, NDataTable, NDropdown, NPagination, NSpace, NTag } from 'naive-ui'
import { Crown, KeyRound, MoreHorizontal, Trash2 } from 'lucide-vue-next'

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

const isVipUser = row => row.vipExpireTime && new Date(row.vipExpireTime) > new Date()

// 未单独设置配额时，按会员等级展示推荐值
const resolveQuota = (row, key, base, levels) => {
  if (row[key] !== null && row[key] !== undefined) {
    return { value: row[key], tone: 'custom' }
  }
  if (!isVipUser(row)) return { value: base, tone: 'default' }
  const value = row.vipLevel === 1 ? levels[0] : row.vipLevel === 2 ? levels[1] : levels[2]
  return { value, tone: 'vip' }
}

const renderQuota = quota =>
  h('span', { class: `users-quota users-quota--${quota.tone}` }, quota.value)

const formatTime = value => (value ? new Date(value).toLocaleString('zh-CN') : '-')

const moreOptions = [
  { label: '重置密码', key: 'password', icon: () => h(KeyRound, { size: 14 }) },
  { label: '删除账号', key: 'delete', icon: () => h(Trash2, { size: 14 }) }
]

const handleMore = (key, row) => {
  if (key === 'password') emit('password', row)
  if (key === 'delete') emit('delete', row)
}

const actionButton = (label, onClick, type = 'default', extraClass = '') =>
  h(
    NButton,
    {
      size: 'tiny',
      secondary: true,
      type,
      class: `user-action-btn ${extraClass}`,
      onClick
    },
    { default: () => label }
  )

const columns = computed(() => [
  { type: 'selection', width: 44, fixed: 'left' },
  { title: 'ID', key: 'id', width: 68 },
  {
    title: '用户名',
    key: 'username',
    width: 170,
    render: row => {
      const initial = (row.username || 'U').slice(0, 1).toUpperCase()
      return h('div', { class: 'user-cell' }, [
        h('div', { class: 'user-avatar-tiny' }, initial),
        h('span', { class: 'user-name-text', title: row.username }, row.username)
      ])
    }
  },
  { title: '昵称', key: 'nickname', width: 130, ellipsis: { tooltip: true } },
  { title: '邮箱', key: 'email', minWidth: 190, ellipsis: { tooltip: true } },
  {
    title: 'VIP',
    key: 'vipStatus',
    width: 96,
    render: row => {
      const isVip = isVipUser(row)
      return h(
        NTag,
        {
          type: isVip ? 'warning' : 'default',
          size: 'small',
          round: true,
          bordered: false
        },
        {
          default: () => (isVip ? `VIP${row.vipLevel || ''}` : '普通'),
          icon: isVip ? () => h(Crown, { size: 12 }) : undefined
        }
      )
    }
  },
  {
    title: 'VIP 到期',
    key: 'vipExpireTime',
    width: 160,
    render: row => {
      if (!row.vipExpireTime) return h('span', { class: 'users-muted' }, '-')
      const isExpired = new Date(row.vipExpireTime) < new Date()
      return h(
        'span',
        { class: isExpired ? 'users-muted' : 'users-ok' },
        formatTime(row.vipExpireTime)
      )
    }
  },
  {
    title: '生成配额',
    key: 'dailyAiQuota',
    width: 90,
    align: 'right',
    render: row => renderQuota(resolveQuota(row, 'dailyAiQuota', 5, [50, 100, 200]))
  },
  {
    title: '助教配额',
    key: 'dailyTutorQuota',
    width: 90,
    align: 'right',
    render: row => renderQuota(resolveQuota(row, 'dailyTutorQuota', 200, [400, 800, 1500]))
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: row =>
      h(
        NTag,
        {
          type: row.status === 1 ? 'success' : 'error',
          size: 'small',
          round: true,
          bordered: false
        },
        { default: () => (row.status === 1 ? '正常' : '禁用') }
      )
  },
  {
    title: '注册时间',
    key: 'createTime',
    width: 165,
    render: row => formatTime(row.createTime)
  },
  {
    title: '操作',
    key: 'actions',
    width: 236,
    fixed: 'right',
    render: row =>
      h(
        NSpace,
        { size: 6, wrap: false, align: 'center' },
        {
          default: () => [
            actionButton('详情', () => emit('detail', row), 'info'),
            actionButton('编辑', () => emit('edit', row), 'default'),
            actionButton('VIP', () => emit('vip', row), 'warning'),
            actionButton(
              row.status === 1 ? '禁用' : '启用',
              () => emit('toggle-status', row),
              row.status === 1 ? 'error' : 'success'
            ),
            h(
              NDropdown,
              {
                trigger: 'click',
                options: moreOptions,
                onSelect: key => handleMore(key, row)
              },
              {
                default: () =>
                  h(
                    NButton,
                    { size: 'tiny', secondary: true, circle: true, 'aria-label': '更多操作' },
                    { icon: () => h(MoreHorizontal, { size: 14 }) }
                  )
              }
            )
          ]
        }
      )
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
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
  <div class="users-table">
    <n-data-table
      :columns="columns"
      :data="users"
      :loading="loading"
      :bordered="false"
      :scroll-x="1540"
      :row-key="row => row.id"
      :checked-row-keys="selectedUserIds"
      @update:checked-row-keys="emit('update:selected-user-ids', $event)"
    />

    <div class="ls-panel__foot users-table__foot">
      <span class="users-table__range">显示第 {{ pageRange }} 条，共 {{ total }} 位用户</span>
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
  </div>
</template>

<style scoped>
.users-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.users-table__range {
  color: #64748b;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.user-avatar-tiny {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.user-name-text {
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.users-muted {
  color: #94a3b8;
}

.users-ok {
  color: #10b981;
  font-weight: 550;
}

.users-quota {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.users-quota--default {
  color: #64748b;
  background: #f1f5f9;
}

.users-quota--custom {
  color: #4f46e5;
  background: #eef2ff;
}

.users-quota--vip {
  color: #d97706;
  background: #fffbeb;
}

.user-action-btn {
  font-weight: 600;
  border-radius: 6px;
}
</style>
