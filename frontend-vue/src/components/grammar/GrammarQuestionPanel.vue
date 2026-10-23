<script setup>
import { computed } from 'vue'
import { NButton, NCard, NSpace } from 'naive-ui'
import { BookOpen, MessageCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-vue-next'
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
            <span class="counter">第 {{ props.currentQuestionIndex + 1 }} / {{ props.totalQuestions }} 题</span>
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
          <BookOpen :size="20" />
        </div>
        <div class="exp-text">
          <h4>考点深度解析</h4>
          <p>{{ props.currentQuestion.explanation }}</p>
          <n-button @click="emit('open-ai-tutor')" type="primary" ghost size="medium" class="ask-ai-btn">
            <template #icon>
              <Sparkles :size="16" />
            </template>
            还有疑问？召唤 AI 助教深入剖析
          </n-button>
        </div>
      </div>
      <div class="exp-action-footer">
        <n-space justify="end" align="center">
          <n-button
            v-if="props.currentQuestionIndex > 0"
            secondary
            class="prev-btn"
            @click="emit('go-to-question', props.currentQuestionIndex - 1)"
          >
            <template #icon><ChevronLeft :size="16" /></template>
            上一题
          </n-button>
          <n-button
            type="primary"
            size="large"
            class="next-btn glow-btn"
            @click="emit('next-question')"
          >
            {{ nextButtonText }}
            <template #icon><ChevronRight :size="16" /></template>
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
  gap: 20px;
}

.question-box {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.progress-bar-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
}

.progress-fill {
  height: 100%;
  background: #f97316;
  transition: width 0.35s ease;
}

.question-inner {
  padding: 36px 40px;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.topic-badge {
  background: rgba(249, 115, 22, 0.14);
  color: var(--tone-orange);
  border: 1px solid rgba(249, 115, 22, 0.25);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.counter {
  font-size: 0.8rem;
  color: var(--secondary-text);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.question-text {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--text-color);
  margin-bottom: 34px;
  line-height: 1.5;
  letter-spacing: -0.01em;
}

.options-list {
  display: grid;
  gap: 14px;
}

.option-item {
  position: relative;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.option-item:hover:not(.disabled) {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.06);
  transform: translateY(-2px);
}

.option-item.selected {
  border-color: rgba(249, 115, 22, 0.65);
  background: rgba(249, 115, 22, 0.12);
}

.option-item.correct {
  border-color: rgba(52, 211, 153, 0.7) !important;
  background: rgba(52, 211, 153, 0.14) !important;
}

.option-item.wrong {
  border-color: rgba(248, 113, 113, 0.7) !important;
  background: rgba(248, 113, 113, 0.14) !important;
}

.option-item.disabled {
  cursor: default;
}

.option-index {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--secondary-text);
  flex-shrink: 0;
}

.option-item.selected .option-index {
  border-color: var(--tone-orange);
  background: #f97316;
  color: #40200a;
}

.option-item.correct .option-index {
  border-color: var(--tone-emerald);
  background: #34d399;
  color: #04321f;
}

.option-item.wrong .option-index {
  border-color: var(--tone-red);
  background: #f87171;
  color: #450a0a;
}

.option-content {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.5;
}

.option-item.correct .option-content {
  color: var(--tone-emerald);
  font-weight: 700;
}

.option-item.wrong .option-content {
  color: var(--tone-red);
  font-weight: 700;
}

.no-question-message {
  text-align: center;
  color: var(--text-color);
  padding: 40px 0;
}

.no-question-subtitle {
  font-size: 0.9rem;
  color: var(--secondary-text);
  margin-top: 8px;
}

/* ================== 解析卡片 (Explanation) ================== */
.explanation-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.explanation-content {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.05);
  border: 1px solid rgba(30, 107, 82, 0.15);
}

.exp-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(30, 107, 82, 0.15);
  color: var(--brand);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.exp-text {
  flex: 1;
}

.exp-text h4 {
  font-size: 0.85rem;
  color: var(--brand);
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.exp-text p {
  font-size: 0.98rem;
  color: var(--text-color);
  line-height: 1.65;
  margin: 0;
}

.ask-ai-btn {
  margin-top: 14px;
  border-radius: var(--radius-md);
  font-weight: 700;
}

.exp-action-footer {
  padding-top: 12px;
}

.glow-btn {
  background: #f97316 !important;
  border: none !important;
  color: #40200a !important;
  border-radius: var(--radius-lg);
  font-weight: 800;
  transition: all 0.25s ease;
}

.glow-btn:hover {
  transform: translateY(-2px);
}

.prev-btn {
  border-radius: var(--radius-lg);
  font-weight: 700;
}

/* ================== 浅色模式适配 (Light Theme) ================== */
html[data-theme='light'] .question-box,
html[data-theme='light'] .explanation-card {
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .question-text {
  color: var(--text-color);
}

html[data-theme='light'] .option-item {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.94);
}

html[data-theme='light'] .option-item:hover:not(.disabled) {
  background: #ffffff;
}

html[data-theme='light'] .option-content {
  color: var(--text-color);
}

html[data-theme='light'] .option-index {
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.8);
}

html[data-theme='light'] .exp-text p {
  color: var(--text-color);
}

@media (max-width: 768px) {
  .question-inner {
    padding: 20px !important;
  }

  .question-text {
    font-size: 1.25rem !important;
  }

  .option-item {
    padding: 13px 16px !important;
  }
}
</style>
