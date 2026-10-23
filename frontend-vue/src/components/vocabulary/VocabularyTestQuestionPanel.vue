<script setup>
import { computed } from 'vue'
import { NButton, NCard, NGrid, NGridItem, NIcon, NInput, NProgress } from 'naive-ui'
import { ChevronLeft } from 'lucide-vue-next'

const props = defineProps({
  currentQuestion: {
    type: Object,
    default: null
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  generatedQuestions: {
    type: Array,
    default: () => []
  },
  answers: {
    type: Object,
    default: () => ({})
  },
  progressPercent: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'exit',
  'jump-to-question',
  'next-question',
  'select-answer',
  'spelling-keyup',
  'submit',
  'update-answer'
])

const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F']
const currentAnswer = computed(() => props.answers[props.currentQuestionIndex] || '')
const isLastQuestion = computed(() => props.currentQuestionIndex === props.generatedQuestions.length - 1)
</script>

<template>
  <div class="testing-container">
    <div class="test-header mb-4 flex items-center gap-2">
      <n-button quaternary circle @click="emit('exit')">
        <template #icon><n-icon :component="ChevronLeft" /></template>
      </n-button>
      <span class="exit-trigger" @click="emit('exit')">退出测试</span>
    </div>

    <div class="progress-bar-container">
      <div class="progress-info">
        <span>进度</span>
        <span>{{ currentQuestionIndex + 1 }} / {{ generatedQuestions.length }}</span>
      </div>
      <n-progress
        type="line"
        :percentage="progressPercent"
        :show-indicator="false"
        color="#1e6b52"
        rail-color="var(--vocab-test-progress-rail)"
        :height="8"
      />
    </div>

    <n-card v-if="currentQuestion" class="question-card" :bordered="false" size="large">
      <div class="question-header secure-content">
        <div class="word-display" :class="{ 'usage-text': currentQuestion.type === 'usage' }">
          {{ currentQuestion.display }}
        </div>
        <div class="phonetic-display">/ {{ currentQuestion.phonetic }} /</div>
        <div v-if="currentQuestion.type === 'usage'" class="usage-translation">
          {{ currentQuestion.translation }}
        </div>
      </div>

      <div class="options-container secure-content">
        <n-grid v-if="currentQuestion.type !== 'spelling'" x-gap="20" y-gap="20" cols="1 600:2">
          <n-grid-item v-for="(option, index) in currentQuestion.options" :key="`${currentQuestion.id}-${index}`">
            <div
              class="answer-option"
              :class="{ selected: answers[currentQuestionIndex] === option }"
              @click="emit('select-answer', option)"
            >
              <span class="option-index">{{ optionLabels[index] || index + 1 }}</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </n-grid-item>
        </n-grid>

        <div v-else class="spelling-input-wrapper">
          <n-input
            :value="currentAnswer"
            placeholder="请输入拼写..."
            size="large"
            round
            clearable
            autofocus
            class="spelling-input"
            @update:value="value => emit('update-answer', value)"
            @keyup="emit('spelling-keyup', $event)"
          />
          <div class="spelling-actions">
            <n-button
              v-if="!isLastQuestion"
              type="primary"
              secondary
              round
              @click="emit('next-question')"
            >
              下一题
            </n-button>
          </div>
        </div>
      </div>

      <div class="actions-footer">
        <n-button v-if="isLastQuestion" type="success" @click="emit('submit')">提交试卷</n-button>
        <n-button v-else secondary @click="emit('submit')">提前交卷</n-button>
      </div>
    </n-card>

    <div class="navigator-panel">
      <div
        v-for="(_, index) in generatedQuestions"
        :key="index"
        class="nav-item"
        :class="{
          active: currentQuestionIndex === index,
          answered: answers[index] !== undefined && answers[index] !== ''
        }"
        @click="emit('jump-to-question', index)"
      >
        {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.testing-container {
  --vocab-test-progress-rail: rgba(15, 23, 42, 0.6);
  --vocab-test-surface: rgba(17, 24, 39, 0.78);
  --vocab-test-surface-muted: rgba(30, 41, 59, 0.35);
  --vocab-test-border: rgba(255, 255, 255, 0.08);
  --vocab-test-hover-bg: rgba(30, 41, 59, 0.65);
  --vocab-test-index-bg: rgba(30, 107, 82, 0.16);
  --vocab-test-nav-bg: rgba(30, 41, 59, 0.4);
  /* R2/R3：这三个值直接当文字色用，统一走主题令牌，避免硬编码灰/浅色外溢 */
  --vocab-test-text: var(--text-color);
  --vocab-test-muted: var(--secondary-text);
  --vocab-test-nav-text: var(--secondary-text);
  max-width: 860px;
  margin: 0 auto;
}

html[data-theme='light'] .testing-container {
  --vocab-test-progress-rail: rgba(148, 163, 184, 0.26);
  --vocab-test-surface: rgba(255, 255, 255, 0.96);
  --vocab-test-surface-muted: rgba(248, 250, 252, 0.95);
  --vocab-test-border: rgba(148, 163, 184, 0.18);
  --vocab-test-hover-bg: rgba(241, 245, 249, 0.98);
  --vocab-test-index-bg: rgba(226, 232, 240, 0.9);
  --vocab-test-nav-bg: rgba(241, 245, 249, 0.96);
}

.exit-trigger {
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--vocab-test-muted);
  transition: color 0.2s;
}

.exit-trigger:hover {
  color: var(--vocab-test-text);
}

.progress-bar-container {
  margin-bottom: 28px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--vocab-test-muted);
  font-size: 0.9rem;
  font-weight: 600;
}

.question-card {
  display: flex;
  flex-direction: column;
  min-height: 420px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--vocab-test-border) !important;
  background: var(--vocab-test-surface);
}

.question-header {
  padding: 24px 0 36px;
  text-align: center;
}

.word-display {
  margin-bottom: 12px;
  color: var(--vocab-test-text);
  font-size: clamp(2.4rem, 4vw, 3.4rem);
  font-weight: 850;
  letter-spacing: -0.02em;
}

.phonetic-display {
  display: inline-block;
  padding: 4px 18px;
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.2);
  color: var(--brand);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.05rem;
}

.answer-option {
  display: flex;
  align-items: center;
  padding: 20px 22px;
  border: 1px solid var(--vocab-test-border);
  border-radius: var(--radius-lg);
  background: var(--vocab-test-surface-muted);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.answer-option:hover {
  transform: translateY(-2px);
  background: var(--vocab-test-hover-bg);
  border-color: rgba(30, 107, 82, 0.35);
}

.answer-option.selected {
  background: transparent;
  border-color: rgba(30, 107, 82, 0.55);
}

.option-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 16px;
  border-radius: 6px;
  background: var(--vocab-test-index-bg);
  color: var(--vocab-test-nav-text);
  font-weight: 700;
}

.answer-option.selected .option-index {
  /* R4：实心品牌底配 brand-ink，深色主题下品牌色变浅 */
  background: var(--brand);
  color: var(--brand-ink);
}

.option-text {
  font-size: 1.1rem;
}

.actions-footer {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.navigator-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 32px;
  padding: 20px;
  border-radius: var(--radius-lg);
  background: var(--vocab-test-nav-bg);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--vocab-test-index-bg);
  color: var(--vocab-test-nav-text);
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--vocab-test-hover-bg);
  transform: translateY(-2px);
}

.nav-item.active {
  background: var(--brand);
  border: 1px solid #5fa88b;
  color: var(--brand-ink);
}

.nav-item.answered:not(.active) {
  /* R5：底色透明度 .15→.10，文字改用品牌色，两种主题均 ≥4.5:1 */
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.3);
  color: var(--brand);
}

.usage-text {
  margin-bottom: 24px !important;
  padding: 0 40px;
  font-size: 1.8rem !important;
  line-height: 1.6;
}

.usage-translation {
  margin-top: 16px;
  color: var(--vocab-test-muted);
  font-size: 1.1rem;
  font-style: italic;
}

.spelling-input-wrapper {
  max-width: 400px;
  margin: 40px auto 0;
  padding-bottom: 40px;
}

.spelling-input :deep(.n-input) {
  height: 64px;
  font-size: 1.5rem;
  text-align: center;
}

.spelling-input :deep(.n-input__input-el) {
  height: 100%;
}

.spelling-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .progress-bar-container {
    margin-bottom: 22px;
  }

  .question-card {
    min-height: 0;
    border-radius: var(--radius-lg);
  }

  .question-header {
    padding: 12px 0 28px;
  }

  .word-display {
    font-size: clamp(2.2rem, 11vw, 3rem);
  }

  .usage-text {
    padding: 0 12px;
    font-size: 1.32rem !important;
    line-height: 1.45;
  }

  .usage-translation {
    font-size: 0.95rem;
  }

  .answer-option {
    padding: 14px;
  }

  .option-index {
    width: 30px;
    height: 30px;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .option-text {
    font-size: 0.98rem;
    line-height: 1.45;
  }

  .actions-footer {
    margin-top: 28px;
  }

  .actions-footer :deep(.n-button) {
    width: 100%;
  }

  .navigator-panel {
    justify-content: flex-start;
    gap: 8px;
    padding: 14px;
  }

  .spelling-input-wrapper {
    max-width: 100%;
    margin-top: 24px;
    padding-bottom: 24px;
  }

  .spelling-input :deep(.n-input) {
    height: 54px;
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .progress-info {
    font-size: 0.82rem;
  }

  .question-header {
    padding: 6px 0 20px;
  }

  .word-display {
    font-size: clamp(1.9rem, 12vw, 2.6rem);
  }

  .phonetic-display {
    max-width: 100%;
    padding: 4px 12px;
    font-size: 0.82rem;
    overflow-wrap: anywhere;
  }

  .usage-text {
    margin-bottom: 18px !important;
    padding: 0;
    font-size: 1.1rem !important;
  }

  .usage-translation {
    font-size: 0.9rem;
  }

  .answer-option {
    padding: 12px;
    border-radius: var(--radius-md);
  }

  .option-text {
    font-size: 0.92rem;
  }

  .navigator-panel {
    padding: 12px 10px;
  }

  .nav-item {
    width: 36px;
    height: 36px;
    border-radius: 9px;
  }

  .spelling-input :deep(.n-input) {
    height: 48px;
    font-size: 1.05rem;
  }

  .spelling-actions,
  .actions-footer {
    width: 100%;
  }

  .spelling-actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
