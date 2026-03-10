<template>
  <div v-if="items.length > 0" class="history-section">
    <div class="section-title">
      <n-icon :component="History" /> 最近生成
    </div>
    <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:3">
      <n-grid-item v-for="item in items" :key="item.id">
        <n-card class="history-card" hoverable @click="emit('select', item)">
          <template #header>
            <n-tag size="small" :bordered="false" type="success" class="mb-1">{{ item.source }}</n-tag>
            <div class="history-title">{{ item.title }}</div>
          </template>
          <template #footer>
            <div class="history-footer">
              <n-tag size="tiny" :bordered="false">{{ item.difficulty }}</n-tag>
              <span class="word-count">{{ item.questions?.length || 0 }} 题 · {{ calculateWordCount(item.content) }} 词</span>
            </div>
          </template>
        </n-card>
      </n-grid-item>
    </n-grid>
    <div v-if="total > 0" class="pagination-wrapper mt-6">
      <n-pagination
        :page="page"
        :item-count="total"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[6, 12, 18]"
        @update:page="emit('update:page', $event)"
        @update:page-size="emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { NCard, NGrid, NGridItem, NIcon, NPagination, NTag } from 'naive-ui'
import { History } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  },
  calculateWordCount: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['select', 'update:page', 'update:pageSize'])
</script>

<style scoped>
.history-section {
  margin-top: 40px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.history-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  transition: var(--theme-transition);
}

:global(.dark-mode) .history-card {
  background: rgba(40, 40, 45, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.history-card:hover {
  transform: translateY(-2px);
  border-color: #10b981;
  background: var(--accent-fill);
}

.history-title {
  font-size: 1rem;
  font-weight: 700;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-color);
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
</style>
