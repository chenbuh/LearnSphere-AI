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
      <span class="header-kicker">
        <span class="kicker-dot"></span>
        词库浏览
      </span>
      <h3>按词库和关键词快速筛词</h3>
    </div>
    <div class="filters">
      <n-select :value="selectedExam" :options="examOptions" class="exam-select" @update:value="emit('update:selected-exam', $event)" />
      <n-input
        :value="searchText"
        placeholder="搜索单词或释义..."
        round
        class="search-input"
        @update:value="emit('update:search-text', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="16" class="search-icon" /></template>
      </n-input>
      <n-button type="primary" round class="search-btn" @click="emit('search')">
        搜索
      </n-button>
    </div>
    <div class="total-count-badge">
      <span>共</span>
      <strong class="total-number">{{ total }}</strong>
      <span>个词条</span>
    </div>
  </div>
</template>

<style scoped>
.browse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.header-copy {
  min-width: 0;
}

.header-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--tone-amber);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.kicker-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f59e0b;
}

.header-copy h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.12rem;
  font-weight: 750;
  letter-spacing: -0.01em;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 520px;
}

.exam-select {
  width: 170px;
}

.search-input {
  flex: 1;
}

.search-icon {
  color: var(--secondary-text);
}

.search-btn {
  font-weight: 600;
  padding: 0 20px;
  background: var(--brand) !important;
  transition: all 0.2s ease;
  /* 品牌实心底：必须用品牌前景色，否则继承正文色只有 ~2.5:1 */
  color: var(--brand-ink);
}

.search-btn:hover {
  transform: translateY(-1px);
}

.total-count-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--secondary-text);
  font-size: 0.82rem;
  white-space: nowrap;
}

.total-number {
  color: var(--tone-amber);
  font-size: 1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
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
