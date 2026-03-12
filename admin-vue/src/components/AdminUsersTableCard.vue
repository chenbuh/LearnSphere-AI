<script setup>
import { computed, h } from 'vue'
import { NButton, NCard, NDataTable, NPagination, NSpace, NTag } from 'naive-ui'
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
  'password'
])

const columns = computed(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  {
    title: 'VIP',
    key: 'vipStatus',
    width: 100,
    render: (row) => {
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      return h(
        NTag,
        {
          type: isVip ? 'warning' : 'default',
          size: 'small',
          bordered: false
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
    width: 160,
    render: (row) => {
      if (!row.vipExpireTime) return '-'
      const expireDate = new Date(row.vipExpireTime)
      const isExpired = expireDate < new Date()
      return h(
        'span',
        {
          style: { color: isExpired ? '#999' : '#18a058' }
        },
        expireDate.toLocaleString('zh-CN')
      )
    }
  },
  {
    title: '生成配额',
    key: 'dailyAiQuota',
    width: 100,
    render: (row) => {
      if (row.dailyAiQuota !== null && row.dailyAiQuota !== undefined) {
        return h('span', { style: { color: '#6366f1', fontWeight: 'bold' } }, row.dailyAiQuota)
      }

      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      if (!isVip) return h('span', { style: { color: '#999' } }, 5)

      const recommend = row.vipLevel === 1 ? 50 : row.vipLevel === 2 ? 100 : 200
      return h('span', { style: { color: '#f59e0b' } }, recommend)
    }
  },
  {
    title: '助教配额',
    key: 'dailyTutorQuota',
    width: 100,
    render: (row) => {
      if (row.dailyTutorQuota !== null && row.dailyTutorQuota !== undefined) {
        return h('span', { style: { color: '#ec4899', fontWeight: 'bold' } }, row.dailyTutorQuota)
      }

      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      if (!isVip) return h('span', { style: { color: '#999' } }, 200)

      const recommend = row.vipLevel === 1 ? 400 : row.vipLevel === 2 ? 800 : 1500
      return h('span', { style: { color: '#f472b6' } }, recommend)
    }
  },
  { title: '邮箱', key: 'email', width: 180 },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: (row) =>
      h(
        NTag,
        {
          type: row.status === 1 ? 'success' : 'error',
          size: 'small'
        },
        { default: () => (row.status === 1 ? '正常' : '禁用') }
      )
  },
  {
    title: '注册时间',
    key: 'createTime',
    width: 160,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  {
    key: 'actions',
    width: 320,
    fixed: 'right',
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'info',
                secondary: true,
                onClick: () => emit('detail', row)
              },
              { default: () => '详情' }
            ),
            h(
              NButton,
              {
                size: 'small',
                secondary: true,
                onClick: () => emit('edit', row)
              },
              { default: () => '编辑' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'warning',
                secondary: true,
                onClick: () => emit('vip', row)
              },
              { default: () => h(Crown, { size: 14 }) }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: row.status === 1 ? 'error' : 'success',
                secondary: true,
                onClick: () => emit('toggle-status', row)
              },
              { default: () => (row.status === 1 ? '禁用' : '启用') }
            ),
            h(
              NButton,
              {
                size: 'small',
                secondary: true,
                onClick: () => emit('password', row)
              },
              { default: () => h(KeyRound, { size: 14 }) }
            )
          ]
        }
      )
  }
])

const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
</script>

<template>
  <n-card class="table-card" :bordered="false" style="overflow: hidden">
    <n-data-table
      :columns="columns"
      :data="users"
      :loading="loading"
      :bordered="false"
      :single-line="false"
      scroll-x="100%"
      :row-key="(row) => row.id"
      :checked-row-keys="selectedUserIds"
      @update:checked-row-keys="emit('update:selected-user-ids', $event)"
    />

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
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
