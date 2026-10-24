<script setup>
import { computed } from 'vue'
import { NButton, NCard, NIcon } from 'naive-ui'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-vue-next'

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
  <div class="question-card">
    <div class="question-header">
      <div class="q-kicker-badge">
        <span class="badge-dot"></span>
        <span class="q-num"
          >{{ props.translate('题目', 'Question') }} {{ props.currentGlobalIndex + 1 }} /
          {{ props.totalQuestionsCount }}</span
        >
      </div>
      <h3>
        {{
          props.currentQuestion?.question ||
          props.currentQuestion?.text ||
          props.translate('题目内容加载失败', 'Failed to load question content')
        }}
      </h3>
    </div>

    <div class="options-grid">
      <div
        v-for="(option, idx) in props.currentQuestion?.options"
        :key="idx"
        class="option-item"
        :class="{ selected: selectedAnswer === idx }"
        @click="emit('select-answer', props.currentQuestionInPassage, idx)"
      >
        <div class="option-idx">{{ String.fromCharCode(65 + idx) }}</div>
        <div class="option-text">{{ option }}</div>
        <div v-if="selectedAnswer === idx" class="check-icon-wrap">
          <n-icon :component="CheckCircle2" size="18" />
        </div>
      </div>
    </div>

    <div class="nav-actions">
      <n-button
        class="nav-button prev-btn"
        secondary
        @click="emit('prev-question')"
        :disabled="props.currentGlobalIndex === 0"
      >
        <template #icon><n-icon :component="ArrowLeft" /></template>
        {{ props.translate('上一题', 'Previous') }}
      </n-button>
      <n-button class="nav-button next-btn" type="primary" @click="emit('next-or-submit')">
        <span>{{
          props.currentGlobalIndex === props.totalQuestionsCount - 1
            ? props.translate('提交试卷', 'Submit')
            : props.translate('下一题', 'Next')
        }}</span>
        <template #icon
          ><n-icon
            :component="
              props.currentGlobalIndex === props.totalQuestionsCount - 1 ? CheckCircle2 : ArrowRight
            "
        /></template>
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.question-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.q-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fb923c;
}

.q-num {
  color: var(--tone-orange);
  font-weight: 800;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.question-header h3 {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.5;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.options-grid {
  display: grid;
  gap: 12px;
  margin: 28px 0;
}

.option-item {
  padding: 18px 20px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.option-item:hover {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(30, 107, 82, 0.35);
  transform: translateY(-2px);
}

.option-item.selected {
  border-color: rgba(30, 107, 82, 0.65);
  background: var(--card-bg);
}

.option-idx {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  font-weight: 800;
  color: var(--secondary-text);
  font-size: 0.95rem;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.option-item.selected .option-idx {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--brand-ink);
}

.option-text {
  flex: 1;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.55;
  font-weight: 500;
}

.option-item.selected .option-text {
  color: var(--text-color);
  font-weight: 600;
}

.check-icon-wrap {
  color: var(--brand);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-button {
  min-width: 130px;
  height: 44px;
  border-radius: var(--radius-md);
  font-weight: 700;
}

.next-btn {
  background: #fb923c !important;
  /* 实心橙底改用固定深色 ink，避免白字压亮底仅 2:1 */
  color: #40200a !important;
  border: none !important;
}

.next-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

:global(html[data-theme='light'] .question-card) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .question-header h3) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .option-item) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .option-item:hover) {
  background: #f8fafc;
  border-color: rgba(30, 107, 82, 0.45);
}

:global(html[data-theme='light'] .option-item.selected) {
  border-color: #0284c7;
}

:global(html[data-theme='light'] .option-idx) {
  background: #f1f5f9;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .option-text) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .option-item.selected .option-text) {
  color: #0369a1;
}

:global(html[data-theme='light'] .nav-actions) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

@media (max-width: 900px) {
  .question-card {
    padding: 20px 18px;
    border-radius: var(--radius-lg);
  }

  .question-header h3 {
    font-size: 1.15rem;
    line-height: 1.5;
  }

  .options-grid {
    margin: 20px 0;
    gap: 10px;
  }

  .option-item {
    padding: 14px;
    gap: 12px;
  }

  .nav-actions {
    flex-direction: column;
    gap: 10px;
  }

  .nav-button {
    width: 100%;
  }
}
</style>
