<script setup>
import { NCard, NDataTable } from 'naive-ui'

defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <n-card :bordered="false" class="table-card">
    <n-data-table
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="{ pageSize: 15 }"
      max-height="650"
    />
  </n-card>
</template>

<style scoped>
.table-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

:deep(.n-data-table-td) {
  padding: 12px 16px;
}
</style>
