<script setup>
import { computed } from 'vue'
import { NDataTable, NPagination } from 'naive-ui'

const props = defineProps({
  total: {
    type: Number,
    default: 0
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

const emit = defineEmits(['update:page'])

const pageRange = computed(() => {
  if (!props.total) return '0 - 0'
  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})
</script>

<template>
  <div class="feedback-table">
    <n-data-table
      :columns="columns"
      :data="list"
      :loading="loading"
      :bordered="false"
      :scroll-x="960"
      remote
    />

    <div class="ls-panel__foot feedback-table__foot">
      <span class="feedback-table__range">第 {{ pageRange }} 条，共 {{ total }} 条</span>
      <n-pagination
        :page="page"
        :item-count="total"
        :page-size="pageSize"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.feedback-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.feedback-table__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* Cells rendered from aiFeedbackAuditConfig.js carry utility class names; tint them here. */
.feedback-table :deep(.text-emerald-500) {
  color: var(--ok);
}

.feedback-table :deep(.text-rose-500) {
  color: var(--danger);
}

.feedback-table :deep(.text-zinc-500) {
  color: var(--ink-3);
}

.feedback-table :deep(.font-medium) {
  font-weight: 500;
  color: var(--ink);
}

.feedback-table :deep(.n-data-table-td[data-col-key='create_time']) {
  color: var(--ink-2);
  font-family: var(--font-mono);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
</style>
