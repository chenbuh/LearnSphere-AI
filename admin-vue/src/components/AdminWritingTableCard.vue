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
    <div class="table-head">
      <div>
        <span class="table-label">写作清单</span>
        <h2>题目、提示与训练素材</h2>
        <p>当前页 {{ dataList.length }} 条，重点检查题型、难度和提示语一致性。</p>
      </div>
      <span class="table-pill">每页 {{ pageSize }} 条</span>
    </div>

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
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
}

.table-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.table-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #8fe7dc;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.table-head h2 {
  margin: 0;
  color: #f7fbff;
  font-size: 1.08rem;
  font-weight: 700;
}

.table-head p {
  margin: 6px 0 0;
  color: #8ea1ba;
  font-size: 0.88rem;
}

.table-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .table-head {
    flex-direction: column;
  }
}
</style>
