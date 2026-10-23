<script setup>
import { NButton, NInput, NTabPane, NTabs } from 'naive-ui'
import { Layers, Plus, Search, Sparkles } from 'lucide-vue-next'

defineProps({
  examType: {
    type: String,
    default: ''
  },
  examTypeOptions: {
    type: Array,
    default: () => []
  },
  keyword: {
    type: String,
    default: ''
  },
  batchLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:exam-type',
  'update:keyword',
  'search',
  'batch-ai-fill',
  'deduplicate',
  'add'
])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button :loading="batchLoading" secondary @click="emit('batch-ai-fill')">
      <template #icon>
        <Sparkles :size="16" />
      </template>
      批量 AI 补全
    </n-button>
    <n-button secondary @click="emit('deduplicate')">
      <template #icon>
        <Layers :size="16" />
      </template>
      全库去重
    </n-button>
    <n-button type="primary" @click="emit('add')">
      <template #icon>
        <Plus :size="16" />
      </template>
      添加词汇
    </n-button>
  </Teleport>

  <div class="vocab-tabs">
    <n-tabs :value="examType" type="line" size="small" @update:value="emit('update:exam-type', $event)">
      <n-tab-pane v-for="opt in examTypeOptions" :key="opt.value" :name="opt.value" :tab="opt.label" />
    </n-tabs>
  </div>

  <div class="ls-filter">
    <n-input
      :value="keyword"
      placeholder="搜索单词或翻译，回车确认"
      clearable
      style="width: 320px"
      @update:value="emit('update:keyword', $event)"
      @keyup.enter="emit('search')"
      @clear="emit('update:keyword', ''); emit('search')"
    >
      <template #prefix>
        <Search :size="15" />
      </template>
    </n-input>
    <n-button @click="emit('search')">搜索</n-button>
  </div>
</template>

<style scoped>
.vocab-tabs {
  padding: 4px 20px 0;
  border-bottom: 1px solid var(--line);
}

.vocab-tabs :deep(.n-tabs-nav) {
  margin-bottom: -1px;
}

@media (max-width: 768px) {
  .ls-filter :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
