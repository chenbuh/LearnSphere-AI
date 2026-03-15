<template>
  <div v-if="total > 0" class="history-section mt-12">
    <div class="section-title">
      <n-icon :component="History" /> 最近生成题目
    </div>
    <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
      <n-grid-item v-for="topic in items" :key="topic.id">
        <div class="history-card" @click="emit('select', topic)">
          <div class="history-card-header">
            <n-tag size="small" type="warning" :bordered="false">{{ topic.examType?.toUpperCase() }}</n-tag>
            <n-tag size="tiny" :bordered="false">{{ topic.mode }}</n-tag>
          </div>
          <h4 class="topic-title">{{ topic.title }}</h4>
          <div class="topic-preview">{{ topic.prompt?.substring(0, 60) }}...</div>
        </div>
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
import { NGrid, NGridItem, NIcon, NPagination, NTag } from 'naive-ui'
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
  }
})

const emit = defineEmits(['select', 'update:page', 'update:pageSize'])
</script>

<style scoped>
.history-section {
  margin-top: 48px;
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

.history-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
}

.history-card:hover {
  background: var(--accent-fill);
  transform: translateY(-2px);
  border-color: #f97316;
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
  color: var(--text-color);
  margin: 8px 0;
}

.topic-preview {
  color: var(--secondary-text);
  font-size: 0.85rem;
  line-height: 1.4;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 900px) {
  .history-section {
    margin-top: 28px;
  }

  .section-title {
    font-size: 1.05rem;
    margin-bottom: 14px;
  }

  .history-card {
    border-radius: 16px;
    padding: 14px;
  }

  .topic-title {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .topic-preview {
    font-size: 0.8rem;
    line-height: 1.45;
  }

  .pagination-wrapper {
    justify-content: flex-start;
    overflow-x: auto;
    margin-top: 16px;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>
