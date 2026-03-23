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
    <div class="heading-copy">
      <span class="eyebrow">词汇资源</span>
      <h1>词汇库管理</h1>
      <p>维护词汇条目、考试归属和批量处理任务。</p>
      <div class="heading-meta">
        <span class="meta-pill">当前题库 {{ examType || '全部考试' }}</span>
        <span class="meta-pill" :class="{ active: batchLoading }">
          {{ batchLoading ? 'AI 补全处理中' : '批量工具可用' }}
        </span>
      </div>
    </div>
    <n-space class="header-actions">
      <n-button :loading="batchLoading" secondary type="primary" @click="emit('batch-ai-fill')">
        <template #icon>
          <Sparkles :size="16" />
        </template>
        批量 AI 补全 20 条
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
    <div class="search-top">
      <div>
        <span class="card-label">筛选与检索</span>
        <p>先切换考试范围，再搜索词条或释义，减少大表扫读成本。</p>
      </div>
    </div>
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
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.heading-copy {
  display: grid;
  gap: 8px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  color: #8fe7dc;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.page-header h1 {
  font-size: 2.1rem;
  font-weight: 800;
  color: #f7fbff;
  letter-spacing: -0.04em;
  margin: 0;
}

.page-header p {
  color: #8ea1ba;
  font-size: 0.95rem;
  margin: 0;
}

.heading-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

.meta-pill.active {
  border-color: rgba(62, 207, 188, 0.22);
  color: #8fe7dc;
}

.header-actions {
  justify-content: flex-end;
}

.search-card {
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.92), rgba(10, 16, 26, 0.82));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  margin-bottom: 24px;
}

.search-top {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.card-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #f7fbff;
  font-size: 0.85rem;
  font-weight: 700;
}

.search-top p {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.88rem;
}

.search-row {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
