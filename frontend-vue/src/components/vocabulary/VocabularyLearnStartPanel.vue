<script setup>
import { NButton, NSelect } from 'naive-ui'
import { Brain } from 'lucide-vue-next'
import { computed } from 'vue'
import { getExamTypeLabel } from '@/constants/examTypes'

const props = defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
  },
  examOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selected-exam', 'start-session'])

const selectedExamLabel = computed(() => (
  getExamTypeLabel(props.selectedExam, '未选择')
))
</script>

<template>
  <div class="start-session-view">
    <div class="brain-icon-wrapper pulse-animation">
      <Brain :size="80" />
    </div>
    <span class="eyebrow">开始学习</span>
    <h2>开始一轮单词记忆训练</h2>
    <p>系统会为 {{ selectedExamLabel }} 生成 15 个单词，混合新词与待复习词，方便你连续完成本轮学习。</p>
    <div class="start-actions">
      <n-select :value="selectedExam" :options="examOptions" class="exam-select-learn" @update:value="emit('update:selected-exam', $event)" />
      <n-button type="primary" size="large" class="active-shrink" @click="emit('start-session')">开始本轮学习</n-button>
    </div>
  </div>
</template>

<style scoped>
.start-session-view {
  text-align: center;
  padding: 26px 20px;
}

.brain-icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: #fdba74;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.start-session-view h2 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 12px;
}

.start-session-view p {
  color: var(--secondary-text);
  margin-bottom: 32px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
}

.start-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.exam-select-learn {
  width: 160px;
  text-align: left;
}

.pulse-animation {
  animation: pulse-soft 2s infinite;
}

@keyframes pulse-soft {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.04);
    opacity: 0.85;
  }
}

@media (max-width: 768px) {
  .start-session-view {
    padding: 20px;
    text-align: center;
  }

  .brain-icon-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
  }

  .start-session-view h2 {
    font-size: 1.5rem;
  }

  .start-session-view p {
    font-size: 0.9rem;
  }

  .start-actions {
    flex-direction: column;
    width: 100%;
  }

  .exam-select-learn {
    width: 100% !important;
  }

  .start-actions :deep(.n-button) {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .start-session-view {
    padding: 12px 4px;
  }

  .start-session-view h2 {
    font-size: 1.25rem;
  }

  .start-session-view p {
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .brain-icon-wrapper {
    width: 72px;
    height: 72px;
  }
}
</style>
