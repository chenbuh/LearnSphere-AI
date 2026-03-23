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
    <div class="table-head">
      <div>
        <span class="table-label">通知记录</span>
        <h2>发送历史与投放结果</h2>
        <p>当前页 {{ data.length }} 条，累计 {{ total }} 条通知记录。</p>
      </div>
      <div class="table-meta">
        <span class="table-pill">第 {{ page }} 页</span>
        <span class="table-pill">每页 {{ pageSize }} 条</span>
      </div>
    </div>

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

.table-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
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

@media (max-width: 768px) {
  .table-head {
    flex-direction: column;
  }

  .table-meta {
    justify-content: flex-start;
  }
}
</style>
