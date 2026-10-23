<script setup>
import { computed } from 'vue'
import { NDataTable, NPagination } from 'naive-ui'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  dataList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    default: 0
  }
})

defineEmits(['update:page', 'update:page-size'])

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
  <section class="ls-panel writing-table">
    <header class="ls-panel__head">
      <div class="writing-head-left">
        <h2 class="ls-panel__title">写作题库话题列表</h2>
        <span class="writing-badge">共 {{ total }} 个题目</span>
      </div>
    </header>

    <n-data-table
      :columns="columns"
      :data="dataList"
      :loading="loading"
      :bordered="false"
      :scroll-x="1060"
    />

    <div class="ls-panel__foot writing-table__foot">
      <span class="writing-table__range">显示第 {{ pageRange }} 条，共 {{ total }} 个话题</span>
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="$emit('update:page', $event)"
        @update:page-size="$emit('update:page-size', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.writing-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.writing-badge {
  font-size: 11.5px;
  font-weight: 550;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.writing-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.writing-table__range {
  color: #64748b;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.writing-table :deep(.n-data-table-td[data-col-key='title']) {
  color: #0f172a;
  font-weight: 600;
}
</style>
