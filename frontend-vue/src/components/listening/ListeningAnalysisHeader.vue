<script setup>
import { NButton, NIcon } from 'naive-ui'
import { ArrowLeft, RotateCcw } from 'lucide-vue-next'

defineProps({
  translate: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['back', 'restart'])
</script>

<template>
  <div class="analysis-header">
    <div class="header-left">
      <n-button quaternary circle class="back-btn" @click="emit('back')" :title="translate('返回成绩单', 'Back to Report')">
        <template #icon><n-icon :component="ArrowLeft" size="18" /></template>
      </n-button>
      <div class="title-group">
        <span class="kicker">{{ translate('解析中心', 'Analysis Hub') }}</span>
        <h2>{{ translate('详细解析与原文对照', 'Detailed Analysis & Transcript') }}</h2>
      </div>
    </div>
    <n-button type="primary" secondary class="restart-btn" @click="emit('restart')">
      <template #icon><n-icon :component="RotateCcw" /></template>
      {{ translate('返回听力主页', 'Back to Home') }}
    </n-button>
  </div>
</template>

<style scoped>
.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kicker {
  color: var(--tone-orange);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.header-left h2 {
  margin: 0;
  font-size: 1.22rem;
  font-weight: 800;
  color: var(--text-color);
}

.back-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--secondary-text);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-color);
}

.restart-btn {
  border-radius: var(--radius-md);
  font-weight: 700;
}

:global(html[data-theme='light'] .analysis-header) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .back-btn) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

@media (max-width: 768px) {
  .analysis-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
  }

  .restart-btn {
    width: 100%;
  }
}
</style>