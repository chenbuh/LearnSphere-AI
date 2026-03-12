<script setup>
import { NButton, NIcon, NProgress, NTag } from 'naive-ui'
import { ArrowLeft } from 'lucide-vue-next'

defineProps({
  translate: {
    type: Function,
    required: true
  },
  passageTitle: {
    type: String,
    default: ''
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  passagesLength: {
    type: Number,
    default: 0
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  currentGlobalIndex: {
    type: Number,
    default: 0
  },
  totalQuestionsCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['restart'])
</script>

<template>
  <div class="test-header">
    <n-button quaternary circle @click="$emit('restart')">
      <template #icon><n-icon :component="ArrowLeft" /></template>
    </n-button>
    <div class="passage-title">
      <h2>{{ passageTitle }}</h2>
      <n-tag size="small" type="primary">Passage {{ currentPassageIndex + 1 }} / {{ passagesLength }}</n-tag>
    </div>
    <div class="timer-box">
      <n-progress type="circle" :percentage="progressPercent" :show-indicator="false" :width="40" />
      <span class="count">{{ currentGlobalIndex + 1 }} / {{ totalQuestionsCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.test-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px 24px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.passage-title {
  flex: 1;
}

.passage-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer-box .count {
  font-weight: 700;
  font-family: monospace;
  color: #6366f1;
}
</style>
