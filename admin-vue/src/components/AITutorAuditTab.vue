<script setup>
import { computed, h } from 'vue'
import { NButton, NDataTable, NInput, NPagination, NTag } from 'naive-ui'
import { Search } from 'lucide-vue-next'

const props = defineProps({
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

const emit = defineEmits(['update:audit-keyword', 'search', 'page-change', 'manage-sensitive'])

const pageRange = computed(() => {
  if (!props.auditTotal) return '0 - 0'
  const start = (props.auditPage - 1) * props.auditPageSize + 1
  const end = Math.min(props.auditPage * props.auditPageSize, props.auditTotal)
  return `${start} - ${end}`
})

const columns = [
  {
    title: '时间',
    key: 'createTime',
    width: 180,
    render: row => (row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  { title: '用户', key: 'username', width: 140, ellipsis: { tooltip: true } },
  {
    title: '命中词',
    key: 'matchedWord',
    width: 120,
    render: row =>
      h(
        NTag,
        { type: 'error', size: 'small', bordered: false },
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
    render: row =>
      h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          quaternary: true,
          onClick: () => emit('manage-sensitive', row)
        },
        { default: () => '管理违规' }
      )
  }
]
</script>

<template>
  <div class="audit-tab">
    <div class="ls-filter">
      <n-input
        :value="auditKeyword"
        placeholder="搜索用户名、命中词或拦截内容"
        class="filter-input"
        clearable
        @update:value="emit('update:audit-keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="15" /></template>
      </n-input>
      <n-button @click="emit('search')">搜索</n-button>
    </div>

    <n-data-table
      :loading="sensitiveLoading"
      :data="sensitiveLogs"
      :columns="columns"
      :bordered="false"
      :scroll-x="1120"
    />

    <div class="ls-panel__foot tab-foot">
      <span class="tab-foot__range">第 {{ pageRange }} 条，共 {{ auditTotal }} 条</span>
      <n-pagination
        :page="auditPage"
        :item-count="auditTotal"
        :page-size="auditPageSize"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.filter-input {
  width: 320px;
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

.audit-tab :deep(.n-data-table-td[data-col-key='createTime']) {
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}

.audit-tab :deep(.n-data-table-td[data-col-key='action']) {
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 12px;
}

@media (max-width: 768px) {
  .filter-input {
    width: 100%;
  }
}
</style>
