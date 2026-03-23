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
    <div class="table-toolbar">
      <div>
        <h2>缓存键列表</h2>
        <p>按分页展示当前检索结果，可查看键详情和 TTL。</p>
      </div>
      <span class="table-meta">每页 15 条</span>
    </div>

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
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.table-toolbar h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.02rem;
  font-weight: 700;
}

.table-toolbar p {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 0.84rem;
}

.table-meta {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(92, 168, 255, 0.12);
  border: 1px solid rgba(92, 168, 255, 0.18);
  color: #bfdbfe;
  font-size: 0.8rem;
  font-weight: 600;
}

:deep(.n-data-table-td) {
  padding: 12px 16px;
}
</style>
