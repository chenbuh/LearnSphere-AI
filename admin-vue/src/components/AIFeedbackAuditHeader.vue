<script setup>
import { NButton, NIcon, NSelect } from 'naive-ui'
import { RefreshCw } from 'lucide-vue-next'

defineProps({
  ratingFilter: {
    type: [Number, null],
    default: null
  },
  statusFilter: {
    type: Number,
    default: 0
  },
  ratingOptions: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:rating-filter', 'update:status-filter', 'refresh'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary @click="emit('refresh')">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
  </Teleport>

  <div class="ls-filter">
    <n-select
      :value="ratingFilter"
      :options="ratingOptions"
      style="width: 150px"
      aria-label="评分筛选"
      @update:value="emit('update:rating-filter', $event)"
    />
    <n-select
      :value="statusFilter"
      :options="statusOptions"
      style="width: 150px"
      aria-label="处理状态筛选"
      @update:value="emit('update:status-filter', $event)"
    />
  </div>
</template>
