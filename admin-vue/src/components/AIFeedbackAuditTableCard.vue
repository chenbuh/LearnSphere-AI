<script setup>
import { AlertCircle, ThumbsUp } from 'lucide-vue-next'
import { NCard, NDataTable, NGrid, NGridItem, NPagination } from 'naive-ui'

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
      <n-grid-item :span="2">
        <n-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <span class="stat-label">待处理反馈</span>
            <AlertCircle :size="18" class="icon-warning" />
          </div>
          <strong class="stat-value">{{ total }}</strong>
          <p class="stat-note">当前审核池累计待处理反馈，建议优先关注低评分与未处理项。</p>
        </n-card>
      </n-grid-item>

      <n-grid-item :span="2">
        <n-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <span class="stat-label">正向反馈率</span>
            <ThumbsUp :size="18" class="icon-success" />
          </div>
          <strong class="stat-value">85.4%</strong>
          <p class="stat-note">用于快速判断当前模型输出质量是否稳定，辅助安排审核优先级。</p>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card class="main-card" :bordered="false">
      <div class="table-toolbar">
        <div>
          <h2>反馈队列</h2>
          <p>表格按远程分页返回，适合逐条审阅并沉淀到后续提示词优化动作。</p>
        </div>
        <span class="table-meta">当前共 {{ total }} 条</span>
      </div>

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
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 22px;
  backdrop-filter: blur(12px);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.18);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stat-label {
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.stat-value {
  font-size: 2rem;
  line-height: 1;
  color: #f8fafc;
}

.stat-note {
  margin: 0;
  font-size: 0.83rem;
  line-height: 1.55;
  color: #94a3b8;
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
  max-width: 50ch;
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

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.icon-warning {
  color: #f3c172;
}

.icon-success {
  color: #6ee0d0;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #94a3b8 !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}
</style>
