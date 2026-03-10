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
        color="#6366f1"
        rail-color="#3f3f46"
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
  max-width: 800px;
  margin: 0 auto;
}

.exit-trigger {
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.exit-trigger:hover {
  opacity: 1;
}

.progress-bar-container {
  margin-bottom: 32px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #a1a1aa;
  font-size: 0.9rem;
}

.question-card {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark-mode) .question-card {
  background: #18181c;
}

.question-header {
  padding: 20px 0 40px;
  text-align: center;
}

.word-display {
  margin-bottom: 12px;
  color: #18181b;
  font-size: 3.5rem;
  font-weight: 800;
}

:global(.dark-mode) .word-display {
  color: #fff;
}

.phonetic-display {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 99px;
  background: rgba(0, 0, 0, 0.05);
  color: #6366f1;
  font-family: monospace;
}

:global(.dark-mode) .phonetic-display {
  background: rgba(255, 255, 255, 0.05);
  color: #818cf8;
}

.answer-option {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.2s;
}

:global(.dark-mode) .answer-option {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.answer-option:hover {
  background: rgba(255, 255, 255, 0.07);
}

.answer-option.selected {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
}

.option-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 16px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  color: #52525b;
  font-weight: 700;
}

:global(.dark-mode) .option-index {
  background: rgba(0, 0, 0, 0.3);
  color: #a1a1aa;
}

.answer-option.selected .option-index {
  background: #6366f1;
  color: white;
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
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark-mode) .navigator-panel {
  background: rgba(30, 30, 35, 0.4);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  color: #52525b;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
}

:global(.dark-mode) .nav-item {
  background: rgba(255, 255, 255, 0.05);
  color: #71717a;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-item.active {
  background: #6366f1;
  border: 1px solid #818cf8;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.nav-item.answered:not(.active) {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
}

.usage-text {
  margin-bottom: 24px !important;
  padding: 0 40px;
  font-size: 1.8rem !important;
  line-height: 1.6;
}

.usage-translation {
  margin-top: 16px;
  color: #71717a;
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
</style>
