<script setup>
import { computed } from 'vue'
import { NButton, NCard, NSpace } from 'naive-ui'
import { BookOpen, MessageCircle } from 'lucide-vue-next'
import GrammarSkeleton from '@/components/GrammarSkeleton.vue'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  currentQuestion: {
    type: Object,
    default: () => ({})
  },
  grammarTopics: {
    type: Array,
    default: () => []
  },
  selectedTopic: {
    type: Number,
    default: 0
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  selectedAnswer: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['select-answer', 'go-to-question', 'next-question', 'open-ai-tutor'])

const selectedTopicTitle = computed(() => {
  return props.grammarTopics.find(topic => topic.id === props.selectedTopic)?.title || '-'
})

const progressWidth = computed(() => {
  if (!props.totalQuestions) return '0%'
  return `${((props.currentQuestionIndex + 1) / props.totalQuestions) * 100}%`
})

const nextButtonText = computed(() => {
  return props.currentQuestionIndex === props.totalQuestions - 1
    ? (props.isSubmitted ? '查看结果' : '检查并提交')
    : '下一题'
})
</script>

<template>
  <div class="question-container">
    <template v-if="props.isLoading">
      <GrammarSkeleton />
    </template>

    <n-card v-else class="question-box" :bordered="false" size="huge">
      <div class="progress-bar-wrapper">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>

      <div class="question-inner">
        <div v-if="props.currentQuestion && props.currentQuestion.text" class="question-content-wrapper">
          <div class="meta-info">
            <span class="topic-badge">{{ selectedTopicTitle }}</span>
            <span class="counter">Question {{ props.currentQuestionIndex + 1 }} of {{ props.totalQuestions }}</span>
          </div>

          <h2 class="question-text secure-content">
            {{ props.currentQuestion.text }}
          </h2>

          <div class="options-list">
            <div
              v-for="(option, idx) in props.currentQuestion.options"
              :key="idx"
              class="option-item"
              :class="{
                correct: props.isSubmitted && idx === props.currentQuestion.correct,
                wrong: props.isSubmitted && props.selectedAnswer === idx && idx !== props.currentQuestion.correct,
                disabled: props.isSubmitted,
                selected: props.selectedAnswer === idx
              }"
              @click="emit('select-answer', idx)"
            >
              <div class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</div>
              <span class="option-content">{{ option }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-question-message">
          <p>题目加载中或未生成...</p>
          <p class="no-question-subtitle">请返回重新生成练习</p>
        </div>
      </div>
    </n-card>

    <n-card class="explanation-card" :bordered="false" size="large">
      <div v-if="props.isSubmitted" class="explanation-content secure-content">
        <div class="exp-icon">
          <n-icon :component="BookOpen" />
        </div>
        <div class="exp-text">
          <h4>语法解析</h4>
          <p>{{ props.currentQuestion.explanation }}</p>
          <n-button @click="emit('open-ai-tutor')" type="primary" ghost size="medium" style="margin-top: 12px;">
            <template #icon>
              <n-icon :component="MessageCircle" />
            </template>
            还有疑问？问问 AI 助手
          </n-button>
        </div>
      </div>
      <div class="exp-action-footer">
        <n-space justify="end">
          <n-button v-if="props.currentQuestionIndex > 0" secondary @click="emit('go-to-question', props.currentQuestionIndex - 1)">
            上一题
          </n-button>
          <n-button type="primary" color="#db2777" size="large" @click="emit('next-question')">
            {{ nextButtonText }}
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.question-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-box {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.progress-bar-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-border);
}

.progress-fill {
  height: 100%;
  background: #db2777;
  transition: width 0.3s;
}

.question-inner {
  padding: 40px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.topic-badge {
  background: rgba(219, 39, 119, 0.15);
  color: #f472b6;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.counter {
  font-size: 0.75rem;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.question-text {
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 40px;
  line-height: 1.4;
  font-family: serif;
}

.options-list {
  display: grid;
  gap: 16px;
}

.option-item {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: var(--theme-transition);
}

.option-item:hover:not(.disabled) {
  border-color: #db2777;
  background: rgba(219, 39, 119, 0.05);
}

.option-item.selected {
  border-color: #db2777;
  background: rgba(219, 39, 119, 0.1);
}

.option-item.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.option-item.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  opacity: 0.8;
}

.option-item.disabled {
  cursor: default;
}

.option-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 0.8rem;
  color: #a1a1aa;
}

.option-item.selected .option-index {
  border-color: #db2777;
  color: #db2777;
}

.option-item.correct .option-index {
  border-color: #22c55e;
  color: #22c55e;
}

.option-item.wrong .option-index {
  border-color: #ef4444;
  color: #ef4444;
}

.option-content {
  font-size: 1.1rem;
  color: var(--text-color);
}

.option-item.correct .option-content {
  color: #4ade80;
  font-weight: 500;
}

.no-question-message {
  text-align: center;
  color: var(--text-color);
}

.no-question-subtitle {
  font-size: 0.9rem;
  color: #71717a;
}

.explanation-card {
  margin-top: 16px;
  background: var(--accent-fill);
}

.explanation-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.exp-icon {
  padding: 8px;
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border-radius: 8px;
}

.exp-text {
  flex: 1;
}

.exp-text h4 {
  font-size: 0.85rem;
  color: var(--secondary-text);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.exp-text p {
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .question-box {
    margin-bottom: 12px;
  }

  .question-inner {
    padding: 16px !important;
  }

  .question-text {
    font-size: 1.2rem !important;
  }

  .option-item {
    padding: 12px !important;
  }

  .option-content {
    font-size: 0.95rem !important;
  }

  .explanation-card {
    margin-top: 12px !important;
  }
}

@media (max-width: 480px) {
  .question-text {
    font-size: 1.1rem !important;
    line-height: 1.5 !important;
  }

  .option-index {
    width: 30px !important;
    height: 30px !important;
    font-size: 0.9rem !important;
  }

  .option-content {
    font-size: 0.9rem !important;
    line-height: 1.4 !important;
  }
}
</style>
