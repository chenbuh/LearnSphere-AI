<script setup>
import { NButton, NSpace } from 'naive-ui'
import { Bot, Plus } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    default: 'listening'
  },
  loading: {
    type: Boolean,
    default: false
  },
  moduleName: {
    type: String,
    default: '内容'
  }
})

const emit = defineEmits(['batch-audit', 'add'])
</script>

<template>
  <header class="page-header">
    <div class="heading-copy">
      <span class="eyebrow">内容管理</span>
      <h1>学习内容管理</h1>
      <p>管理听力、阅读、语法、口语等学习素材。</p>
      <div class="heading-meta">
        <span class="meta-pill">当前模块 {{ moduleName }}</span>
        <span class="meta-pill" :class="{ active: activeTab === 'listening' || activeTab === 'reading' }">
          {{ activeTab === 'listening' || activeTab === 'reading' ? 'AI 审查可用' : '手动维护模式' }}
        </span>
      </div>
    </div>
    <n-space class="header-actions">
      <n-button
        v-if="activeTab === 'listening' || activeTab === 'reading'"
        secondary
        type="info"
        :loading="loading"
        @click="emit('batch-audit')"
      >
        <template #icon><Bot /></template>
        AI 批量审查
      </n-button>
      <n-button type="primary" @click="emit('add')">
        <template #icon><Plus /></template>
        添加{{ moduleName }}
      </n-button>
    </n-space>
  </header>
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
