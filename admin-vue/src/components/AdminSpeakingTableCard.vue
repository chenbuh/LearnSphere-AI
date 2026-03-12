<script setup>
import { NCard, NDataTable, NPagination } from 'naive-ui'

defineProps({
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
  }
})

defineEmits(['update:page', 'update:page-size'])
</script>

<template>
  <n-card class="content-card">
    <n-data-table
      :columns="columns"
      :data="dataList"
      :loading="loading"
      :bordered="false"
      :single-line="false"
    />

    <div class="pagination">
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        show-size-picker
        @update:page="$emit('update:page', $event)"
        @update:page-size="$emit('update:page-size', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.content-card {
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
