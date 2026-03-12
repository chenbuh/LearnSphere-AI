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
    <div>
      <h1>学习内容管理</h1>
      <p>统一管理听力、阅读、语法、口语等核心学习素材</p>
    </div>
    <n-space>
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
</style>
