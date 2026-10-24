<script setup>
import { computed } from 'vue'
import { DatabaseBackup, Plus, RefreshCw, Search } from 'lucide-vue-next'
import { NButton, NDataTable, NInput, NPagination } from 'naive-ui'

const props = defineProps({
  wordKeyword: {
    type: String,
    default: ''
  },
  wordColumns: {
    type: Array,
    default: () => []
  },
  wordList: {
    type: Array,
    default: () => []
  },
  wordLoading: {
    type: Boolean,
    default: false
  },
  wordPage: {
    type: Number,
    default: 1
  },
  wordTotal: {
    type: Number,
    default: 0
  },
  wordPageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'update:word-keyword',
  'show-add-modal',
  'reload-words',
  'refresh-words',
  'update:word-page'
])

const pageRange = computed(() => {
  if (!props.wordTotal) return '0 - 0'
  const start = (props.wordPage - 1) * props.wordPageSize + 1
  const end = Math.min(props.wordPage * props.wordPageSize, props.wordTotal)
  return `${start} - ${end}`
})

const handleSearchEnter = () => {
  emit('update:word-page', 1)
  emit('refresh-words')
}
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="wordLoading" @click="emit('refresh-words')">
      <template #icon><RefreshCw :size="16" /></template>
      刷新
    </n-button>
    <n-button secondary @click="emit('reload-words')">
      <template #icon><DatabaseBackup :size="16" /></template>
      重载内存词库
    </n-button>
    <n-button type="primary" @click="emit('show-add-modal')">
      <template #icon><Plus :size="16" /></template>
      添加敏感词
    </n-button>
  </Teleport>

  <div class="ls-filter">
    <n-input
      :value="wordKeyword"
      placeholder="搜索敏感词，回车确认"
      clearable
      style="width: 320px"
      @update:value="emit('update:word-keyword', $event)"
      @keyup.enter="handleSearchEnter"
    >
      <template #prefix><Search :size="15" /></template>
    </n-input>
    <n-button @click="handleSearchEnter">搜索</n-button>
  </div>

  <n-data-table
    :columns="wordColumns"
    :data="wordList"
    :loading="wordLoading"
    :bordered="false"
    remote
    :row-key="row => row.id"
  />

  <div class="ls-panel__foot tab-foot">
    <span class="tab-foot__range">第 {{ pageRange }} 条，共 {{ wordTotal }} 条</span>
    <n-pagination
      :page="wordPage"
      :item-count="wordTotal"
      :page-size="wordPageSize"
      @update:page="emit('update:word-page', $event)"
    />
  </div>
</template>

<style scoped>
.tab-foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-foot__range {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .ls-filter :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
