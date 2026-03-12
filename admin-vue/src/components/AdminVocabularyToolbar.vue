<script setup>
import { NButton, NCard, NInput, NSpace, NTabPane, NTabs } from 'naive-ui'
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
  <header class="page-header">
    <div>
      <h1>词汇库管理</h1>
      <p>管理平台词汇资源</p>
    </div>
    <n-space>
      <n-button :loading="batchLoading" secondary type="primary" @click="emit('batch-ai-fill')">
        <template #icon>
          <Sparkles :size="16" />
        </template>
        批量 AI 补全 (20条)
      </n-button>
      <n-button secondary type="warning" @click="emit('deduplicate')">
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
    </n-space>
  </header>

  <n-card class="search-card">
    <n-tabs :value="examType" type="line" animated @update:value="emit('update:exam-type', $event)">
      <n-tab-pane v-for="opt in examTypeOptions" :key="opt.value" :name="opt.value" :tab="opt.label" />
    </n-tabs>

    <div class="search-row">
      <n-space align="center">
        <n-input
          :value="keyword"
          placeholder="搜索单词或翻译"
          style="width: 300px"
          @update:value="emit('update:keyword', $event)"
          @keyup.enter="emit('search')"
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        <n-button type="primary" @click="emit('search')">搜索</n-button>
      </n-space>
    </div>
  </n-card>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.search-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
}

.search-row {
  margin-top: 16px;
}
</style>
