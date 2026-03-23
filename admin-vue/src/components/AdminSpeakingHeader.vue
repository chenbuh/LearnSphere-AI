<script setup>
import { Plus } from 'lucide-vue-next'
import { NButton } from 'naive-ui'

defineEmits(['add'])
</script>

<template>
  <header class="page-header">
    <div class="heading-copy">
      <span class="eyebrow">口语题库</span>
      <h1>口语话题管理</h1>
      <p>维护各考试阶段的口语话题、任务说明和练习要求。</p>
      <span class="meta-pill">话题与说明维护</span>
    </div>
    <n-button type="primary" @click="$emit('add')">
      <template #icon>
        <Plus />
      </template>
      添加话题
    </n-button>
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
  margin: 0;
  font-size: 2.1rem;
  font-weight: 800;
  color: #f7fbff;
  letter-spacing: -0.04em;
}

.page-header p {
  font-size: 0.95rem;
  color: #8ea1ba;
  margin: 0;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: #c7d3e3;
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
  }
}
</style>
