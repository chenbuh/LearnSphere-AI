<script setup>
import { computed } from 'vue'
import { RefreshCw, Search, Trash } from 'lucide-vue-next'
import { NButton, NDataTable, NInput, NPagination, NPopconfirm } from 'naive-ui'

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  checkedRowKeys: {
    type: Array,
    default: () => []
  },
  keyword: {
    type: String,
    default: ''
  },
  columns: {
    type: Array,
    default: () => []
  },
  list: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'update:keyword',
  'refresh',
  'batch-delete',
  'update:checked-row-keys',
  'update:page'
])

const pageRange = computed(() => {
  if (!props.total) return '0 - 0'
  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})

const handleSearchEnter = () => {
  emit('update:page', 1)
  emit('refresh')
}
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="emit('refresh')">
      <template #icon><RefreshCw :size="16" /></template>
      刷新
    </n-button>
  </Teleport>

  <div class="ls-filter">
    <n-input
      :value="keyword"
      placeholder="搜索用户名 / 内容 / 敏感词"
      clearable
      style="width: 320px"
      @update:value="emit('update:keyword', $event)"
      @keyup.enter="handleSearchEnter"
    >
      <template #prefix><Search :size="15" /></template>
    </n-input>
    <n-button @click="handleSearchEnter">搜索</n-button>

    <span class="ls-filter__grow" />

    <n-popconfirm v-if="checkedRowKeys.length > 0" @positive-click="emit('batch-delete')">
      <template #trigger>
        <n-button type="error" secondary>
          <template #icon><Trash :size="15" /></template>
          批量删除 ({{ checkedRowKeys.length }})
        </n-button>
      </template>
      确定要删除选中的 {{ checkedRowKeys.length }} 条记录吗？
    </n-popconfirm>
  </div>

  <n-data-table
    class="log-table"
    :columns="columns"
    :data="list"
    :loading="loading"
    :bordered="false"
    :scroll-x="1100"
    remote
    :row-key="(row) => row.id"
    :checked-row-keys="checkedRowKeys"
    @update:checked-row-keys="emit('update:checked-row-keys', $event)"
  />

  <div class="ls-panel__foot tab-foot">
    <span class="tab-foot__range">第 {{ pageRange }} 条，共 {{ total }} 条</span>
    <n-pagination
      :page="page"
      :item-count="total"
      :page-size="pageSize"
      @update:page="emit('update:page', $event)"
    />
  </div>
</template>

<style scoped>
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

/* Render-function cells carry utility class names; style them here. */
.log-table :deep(.n-data-table-td .font-medium) {
  color: var(--ink);
  font-weight: 500;
}

.log-table :deep(.n-data-table-td[data-col-key='content']) {
  color: var(--ink-2);
}

.log-table :deep(.n-data-table-td code) {
  color: var(--ink-3);
  font-family: var(--font-mono);
  font-size: 12px;
}

.log-table :deep(.n-data-table-td[data-col-key='createTime']) {
  color: var(--ink-2);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .ls-filter :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
