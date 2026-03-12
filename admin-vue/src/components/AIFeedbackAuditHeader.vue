<script setup>
import { MessageSquare } from 'lucide-vue-next'
import { NButton, NSelect, NSpace } from 'naive-ui'

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
  <header class="page-header">
    <div class="title-wrap">
      <div class="header-icon">
        <MessageSquare :size="28" />
      </div>
      <div>
        <h1>AI 内容反馈审核池</h1>
        <p>收集用户对 AI 生成内容的质量反馈，持续进化提示词</p>
      </div>
    </div>

    <n-space>
      <n-select
        :value="ratingFilter"
        :options="ratingOptions"
        style="width: 150px"
        @update:value="emit('update:rating-filter', $event)"
      />
      <n-select
        :value="statusFilter"
        :options="statusOptions"
        style="width: 150px"
        @update:value="emit('update:status-filter', $event)"
      />
      <n-button secondary @click="emit('refresh')">
        刷新
      </n-button>
    </n-space>
  </header>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  padding: 8px;
  border-radius: 12px;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.2);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.page-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
}

.page-header p {
  margin: 0;
  color: rgb(113, 113, 122);
}
</style>
