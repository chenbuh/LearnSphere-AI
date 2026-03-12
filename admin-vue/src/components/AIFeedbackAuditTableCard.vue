<script setup>
import { AlertCircle, ThumbsUp } from 'lucide-vue-next'
import { NCard, NDataTable, NGrid, NGridItem, NPagination, NStatistic } from 'naive-ui'

defineProps({
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
</script>

<template>
  <div class="table-card-wrap">
    <n-grid :cols="4" :x-gap="24" class="stats-grid">
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <n-statistic label="待处理反馈" :value="total">
            <template #prefix>
              <AlertCircle :size="20" class="icon-warning" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <n-statistic label="正向反馈率" value="85.4" suffix="%">
            <template #prefix>
              <ThumbsUp :size="20" class="icon-success" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card class="main-card" :bordered="false">
      <n-data-table
        :columns="columns"
        :data="list"
        :loading="loading"
        :bordered="false"
        striped
        remote
        size="large"
      />

      <div class="pagination-wrapper">
        <n-pagination
          :page="page"
          :item-count="total"
          :page-size="pageSize"
          @update:page="emit('update:page', $event)"
        />
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.stats-grid {
  margin-bottom: 24px;
}

.main-card,
.stat-card {
  background: rgba(24, 24, 27, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.icon-warning {
  margin-right: 8px;
  color: #f59e0b;
}

.icon-success {
  margin-right: 8px;
  color: #10b981;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #71717a !important;
  font-weight: 700 !important;
}
</style>
