<script setup>
import { NButton, NSpace } from 'naive-ui'
import { RefreshCw, Send } from 'lucide-vue-next'

defineEmits(['refresh', 'send'])
</script>

<template>
  <header class="page-header">
    <div class="heading-copy">
      <span class="eyebrow">消息通知</span>
      <h1>通知管理</h1>
      <p>发送站内通知并查看公告记录。</p>
      <div class="heading-meta">
        <span class="meta-pill">站内通知</span>
        <span class="meta-pill">发送记录</span>
      </div>
    </div>
    <n-space class="header-actions">
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
  margin: 0;
  color: #f7fbff;
  letter-spacing: -0.04em;
}

.page-header p {
  color: #8ea1ba;
  font-size: 0.875rem;
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

.header-actions {
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
