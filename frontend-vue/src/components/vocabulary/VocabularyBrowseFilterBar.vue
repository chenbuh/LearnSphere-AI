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
    <div class="filters">
      <n-select :value="selectedExam" :options="examOptions" class="exam-select" @update:value="emit('update:selected-exam', $event)" />
      <n-input
        :value="searchText"
        placeholder="Search words..."
        round
        class="search-input"
        @update:value="emit('update:search-text', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="16" /></template>
      </n-input>
      <n-button type="primary" round @click="emit('search')">Search</n-button>
    </div>
    <div class="total-count">Total {{ total }} words</div>
  </div>
</template>

<style scoped>
.browse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 16px;
  flex: 1;
}

.exam-select {
  width: 200px;
}

.search-input {
  width: 200px;
}

.total-count {
  color: #a1a1aa;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .browse-header {
    flex-direction: column;
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
</style>