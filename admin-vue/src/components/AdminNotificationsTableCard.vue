<script setup>
import { NCard, NDataTable } from 'naive-ui'

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:page'])

const handlePageChange = (nextPage) => {
  emit('update:page', nextPage)
}
</script>

<template>
  <n-card class="main-card">
    <n-data-table
      :columns="props.columns"
      :data="props.data"
      :loading="props.loading"
      :pagination="{
        page: props.page,
        pageSize: props.pageSize,
        itemCount: props.total,
        onChange: handlePageChange
      }"
    />
  </n-card>
</template>

<style scoped>
.main-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
</style>
