<script setup>
import { computed } from 'vue'
import { NDataTable, NPagination } from 'naive-ui'

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
    default: 0
  }
})

const emit = defineEmits(['update:page'])

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

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
  <section class="ls-panel notification-table">
    <header class="ls-panel__head">
      <div class="notify-head-left">
        <h2 class="ls-panel__title">系统通知与推送历史</h2>
        <span class="notify-badge">共 {{ total }} 条记录</span>
      </div>
    </header>

    <n-data-table
      :columns="props.columns"
      :data="props.data"
      :loading="props.loading"
      :bordered="false"
      :scroll-x="1040"
      remote
    />

    <div class="ls-panel__foot notification-table__foot">
      <span class="notification-table__range"
        >显示第 {{ pageRange }} 条，共 {{ total }} 条通知</span
      >
      <n-pagination
        :page="page"
        :page-count="pageCount"
        :page-size="pageSize"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.notify-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notify-badge {
  font-size: 11.5px;
  font-weight: 550;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.notification-table__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.notification-table__range {
  color: #64748b;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.notification-table :deep(.n-data-table-td[data-col-key='title']) {
  color: #0f172a;
  font-weight: 600;
}

.notification-table :deep(.n-data-table-td[data-col-key='createTime']),
.notification-table :deep(.n-data-table-td[data-col-key='expireTime']) {
  color: #64748b;
  font-variant-numeric: tabular-nums;
}
</style>
