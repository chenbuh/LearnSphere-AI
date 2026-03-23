<script setup>
import { computed } from 'vue'
import { NButton, NCard } from 'naive-ui'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  currentGlobalIndex: {
    type: Number,
    default: 0
  },
  currentQuestion: {
    type: Object,
    default: null
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  currentQuestionInPassage: {
    type: Number,
    default: 0
  },
  totalQuestionsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select-answer', 'prev-question', 'next-or-submit'])

const selectedAnswer = computed(() => {
  return props.answersPerPassage?.[props.currentPassageIndex]?.[props.currentQuestionInPassage]
})
</script>

<template>
  <n-card class="question-card" :bordered="false">
    <div class="question-header">
      <span class="q-num">{{ props.translate('题目', 'Question') }} {{ props.currentGlobalIndex + 1 }}</span>
      <h3>{{ props.currentQuestion?.question || props.currentQuestion?.text || props.translate('题目内容加载失败', 'Failed to load question content') }}</h3>
    </div>
    <div class="options-grid">
      <div
        v-for="(option, idx) in props.currentQuestion?.options"
        :key="idx"
        class="option-item"
        :class="{ selected: selectedAnswer === idx }"
        @click="emit('select-answer', props.currentQuestionInPassage, idx)"
      >
        <span class="option-idx">{{ String.fromCharCode(65 + idx) }}</span>
        <span class="option-text">{{ option }}</span>
      </div>
    </div>
    <div class="nav-actions">
      <n-button class="nav-button" secondary @click="emit('prev-question')" :disabled="props.currentGlobalIndex === 0">
        {{ props.translate('上一题', 'Previous') }}
      </n-button>
      <n-button class="nav-button" type="primary" @click="emit('next-or-submit')">
        {{ props.currentGlobalIndex === props.totalQuestionsCount - 1 ? props.translate('提交试卷', 'Submit') : props.translate('下一题', 'Next') }}
      </n-button>
    </div>
  </n-card>
</template>

<style scoped>
.question-card {
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.q-num {
  color: #6366f1;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.question-header h3 {
  font-size: 1.5rem;
  margin-top: 8px;
  line-height: 1.4;
  color: var(--text-color);
}

.options-grid {
  display: grid;
  gap: 12px;
  margin: 32px 0;
}

.option-item {
  padding: 16px 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
}

.option-item:hover {
  background: var(--accent-fill);
}

.option-item.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.option-idx {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-fill);
  border-radius: 50%;
  font-weight: 700;
  color: var(--secondary-text);
}

.option-item.selected .option-idx {
  background: #6366f1;
  color: #fff;
}

.option-text {
  color: var(--text-color);
}

.nav-actions {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.nav-button {
  min-width: 124px;
}

@media (max-width: 900px) {
  .question-card {
    border-radius: 18px;
  }

  .question-header h3 {
    font-size: 1.15rem;
    line-height: 1.55;
  }

  .options-grid {
    margin: 20px 0;
    gap: 10px;
  }

  .option-item {
    padding: 14px 14px 14px 12px;
    gap: 12px;
    align-items: flex-start;
  }

  .option-idx {
    width: 28px;
    height: 28px;
    font-size: 0.82rem;
    margin-top: 1px;
  }

  .option-text {
    line-height: 1.55;
    font-size: 0.94rem;
  }

  .nav-actions {
    flex-direction: column;
  }

  .nav-button {
    width: 100%;
  }
}
</style>
