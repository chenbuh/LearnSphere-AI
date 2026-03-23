<script setup>
import { h } from 'vue'
import { NAlert, NButton, NCard, NDataTable, NInput, NPagination, NTag } from 'naive-ui'
import { Search, ShieldAlert } from 'lucide-vue-next'

defineProps({
  sensitiveLogs: {
    type: Array,
    default: () => []
  },
  sensitiveLoading: {
    type: Boolean,
    default: false
  },
  auditKeyword: {
    type: String,
    default: ''
  },
  auditPage: {
    type: Number,
    default: 1
  },
  auditPageSize: {
    type: Number,
    default: 10
  },
  auditTotal: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:audit-keyword',
  'search',
  'page-change',
  'manage-sensitive'
])

const columns = [
  {
    title: '时间',
    key: 'createTime',
    width: 180,
    render: (row) => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  { title: '用户', key: 'username', width: 140 },
  {
    title: '命中词',
    key: 'matchedWord',
    width: 120,
    render: (row) =>
      h(
        NTag,
        { type: 'error', size: 'small', bordered: false, round: true },
        { default: () => row.matchedWord || '-' }
      )
  },
  { title: '拦截内容', key: 'content', minWidth: 360, ellipsis: { tooltip: true } },
  { title: '来源动作', key: 'action', width: 180, ellipsis: { tooltip: true } },
  {
    title: '处理',
    key: 'actions',
    width: 110,
    fixed: 'right',
    render: (row) =>
      h(
        NButton,
        {
          size: 'small',
          type: 'error',
          quaternary: true,
          onClick: () => emit('manage-sensitive', row)
        },
        { default: () => '管理违规' }
      )
  }
]
</script>

<template>
  <n-card class="audit-card" :bordered="false">
    <div class="audit-header">
      <n-alert title="违规内容说明" type="error" :bordered="false">
        这里展示 AI 助教提问阶段命中的敏感内容。可直接跳转到敏感词后台继续排查命中词和处理规则。
      </n-alert>

      <div class="audit-toolbar">
        <n-input
          :value="auditKeyword"
          placeholder="搜索用户名、命中词或拦截内容"
          class="audit-input"
          clearable
          @update:value="emit('update:audit-keyword', $event)"
          @keyup.enter="emit('search')"
        >
          <template #prefix><Search :size="16" /></template>
        </n-input>

        <n-button type="primary" @click="emit('search')">
          <template #icon><ShieldAlert :size="16" /></template>
          查询审计
        </n-button>
      </div>
    </div>

    <n-data-table
      :loading="sensitiveLoading"
      :data="sensitiveLogs"
      :columns="columns"
      :bordered="false"
      size="small"
      scroll-x="1120"
    />

    <div class="pagination">
      <n-pagination
        :page="auditPage"
        :item-count="auditTotal"
        :page-size="auditPageSize"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.audit-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
}

.audit-header {
  display: grid;
  gap: 14px;
  margin-bottom: 16px;
}

.audit-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.audit-input {
  width: min(100%, 360px);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

@media (max-width: 768px) {
  .audit-input {
    width: 100%;
  }

  .pagination {
    justify-content: flex-start;
  }
}
</style>
