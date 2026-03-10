<template>
  <div v-if="total > 0" class="history-section mt-12">
    <div class="section-title">
      <n-icon :component="History" /> {{ translate('练习历史', 'Practice History') }}
    </div>
    <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
      <n-grid-item v-for="topic in topics" :key="topic.id">
        <div class="history-card" @click="emit('select', topic)">
          <div class="history-card-header">
            <n-tag size="small" type="warning" :bordered="false">{{ topic.type }}</n-tag>
            <n-tag size="tiny" :bordered="false">{{ topic.difficulty }}</n-tag>
          </div>
          <h4 class="topic-title">{{ topic.topic }}</h4>
          <div v-if="showDate && formatDate(topic.createTime)" class="topic-date text-xs text-gray-500 mt-2">
            {{ formatDate(topic.createTime) }}
          </div>
        </div>
      </n-grid-item>
    </n-grid>
    <div class="pagination-wrapper mt-6">
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
import { NGrid, NGridItem, NIcon, NPagination, NTag } from 'naive-ui'
import { History } from 'lucide-vue-next'

defineProps({
  topics: {
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
  translate: {
    type: Function,
    required: true
  },
  showDate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update:page', 'update:pageSize'])

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
}
</script>

<style scoped>
.history-section { margin-top: 48px; }
.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.history-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
}

.history-card:hover {
  transform: translateY(-2px);
  border-color: #fb923c;
  background: var(--accent-fill);
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.topic-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 8px 0;
  color: var(--text-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
