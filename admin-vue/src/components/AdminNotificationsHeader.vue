<script setup>
import { NButton, NSpace } from 'naive-ui'
import { RefreshCw, Send } from 'lucide-vue-next'

defineEmits(['refresh', 'send'])
</script>

<template>
  <header class="page-header">
    <div>
      <h1>通知管理</h1>
      <p>管理和发送系统通知、公告</p>
    </div>
    <n-space>
      <n-button secondary @click="$emit('refresh')">
        <template #icon><RefreshCw :size="18" /></template>
        刷新
      </n-button>
      <n-button type="primary" @click="$emit('send')">
        <template #icon><Send :size="18" /></template>
        发送通知
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
  margin-bottom: 4px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #71717a;
  font-size: 0.875rem;
}
</style>
