<script setup>
import { NButton, NInput, NSelect } from 'naive-ui'
import { Search } from 'lucide-vue-next'

defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
  },
  examOptions: {
    type: Array,
    default: () => []
  },
  searchText: {
    type: String,
    default: ''
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:selected-exam', 'update:search-text', 'search'])
</script>

<template>
  <div class="browse-header">
    <div class="header-copy">
      <span class="header-kicker">词库浏览</span>
      <h3>按词库和关键词快速筛词</h3>
    </div>
    <div class="filters">
      <n-select :value="selectedExam" :options="examOptions" class="exam-select" @update:value="emit('update:selected-exam', $event)" />
      <n-input
        :value="searchText"
        placeholder="搜索单词或释义"
        round
        class="search-input"
        @update:value="emit('update:search-text', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="16" /></template>
      </n-input>
      <n-button type="primary" round @click="emit('search')">搜索</n-button>
    </div>
    <div class="total-count">共 {{ total }} 个单词</div>
  </div>
</template>

<style scoped>
.browse-header {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr) auto;
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.header-copy {
  min-width: 0;
}

.header-kicker {
  display: inline-block;
  margin-bottom: 8px;
  color: #fdba74;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.header-copy h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.08rem;
}

.filters {
  display: flex;
  gap: 12px;
  flex: 1;
}

.exam-select {
  width: 200px;
}

.search-input {
  width: 200px;
}

.total-count {
  color: var(--secondary-text);
  font-size: 0.84rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .browse-header {
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 12px;
  }

  .filters {
    flex-direction: column;
    gap: 12px;
  }

  .exam-select,
  .search-input {
    width: 100%;
  }

  .filters :deep(.n-button) {
    width: 100%;
  }

  .total-count {
    text-align: right;
  }
}

@media (max-width: 480px) {
  .browse-header {
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .header-copy h3 {
    font-size: 1rem;
    line-height: 1.45;
  }

  .header-kicker {
    margin-bottom: 6px;
    font-size: 0.68rem;
  }

  .filters {
    gap: 10px;
  }

  .filters :deep(.n-input),
  .filters :deep(.n-base-selection),
  .filters :deep(.n-button) {
    min-height: 44px;
  }

  .total-count {
    text-align: left;
    white-space: normal;
    line-height: 1.45;
  }
}

@media (max-width: 360px) {
  .header-copy h3 {
    font-size: 0.95rem;
  }
}
</style>
