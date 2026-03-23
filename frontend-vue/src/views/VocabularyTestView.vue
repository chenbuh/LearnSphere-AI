<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useVocabularyTest } from '@/composables/useVocabularyTest'
import PracticeStageHeader from '@/components/learning/PracticeStageHeader.vue'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const VocabularyTestSetupPanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyTestSetupPanel.vue'))
const VocabularyTestQuestionPanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyTestQuestionPanel.vue'))
const VocabularyTestResultPanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyTestResultPanel.vue'))

const {
  answers,
  closeAITutor,
  counts,
  currentQuestion,
  currentQuestionIndex,
  difficulties,
  examTypes,
  exitTest,
  generateQuestions,
  generatedQuestions,
  goHome,
  handleSpellingKeyup,
  jumpToQuestion,
  loading,
  nextQuestion,
  openAITutor,
  progressPercent,
  restart,
  reviewQuestions,
  score,
  selectAnswer,
  settings,
  showAll,
  showTutor,
  step,
  submitExam,
  testModes,
  toggleShowAll,
  tutorContext,
  updateAnswer,
  updateSetting
} = useVocabularyTest()

const currentExamLabel = computed(() => (
  examTypes.find(item => item.value === settings.value.examType)?.label || settings.value.examType
))

const currentModeLabel = computed(() => (
  testModes.find(item => item.value === settings.value.mode)?.label || settings.value.mode
))

const currentDifficultyLabel = computed(() => (
  difficulties.find(item => item.value === settings.value.difficulty)?.label || settings.value.difficulty
))

const answeredCount = computed(() => (
  Object.keys(answers.value).filter(key => answers.value[key] !== '').length
))

const headerTitle = computed(() => {
  if (step.value === 'testing') return '词汇作答'
  if (step.value === 'result') return '测试结果'
  return '词汇能力测试'
})

const headerDescription = computed(() => {
  if (step.value === 'testing') {
    return '开始后可直接答题，并随时查看测试进度。'
  }
  if (step.value === 'result') {
    return '先看总分和回顾结果，再决定重新开测还是继续追问 AI。'
  }
  return '先确定词库、模式、难度和题量，再开始本次词汇测试。'
})

const headerSummary = computed(() => {
  if (step.value === 'testing') {
    return [
      { label: '词库', value: currentExamLabel.value },
      { label: '模式', value: currentModeLabel.value },
      { label: '难度', value: currentDifficultyLabel.value },
      { label: '进度', value: `${answeredCount.value}/${generatedQuestions.value.length}` }
    ]
  }

  if (step.value === 'result') {
    return [
      { label: '得分', value: `${score.value}` },
      { label: '词库', value: currentExamLabel.value },
      { label: '模式', value: currentModeLabel.value },
      { label: '回顾题目', value: `${reviewQuestions.value.length}` }
    ]
  }

  return [
    { label: '词库', value: currentExamLabel.value },
    { label: '模式', value: currentModeLabel.value },
    { label: '难度', value: currentDifficultyLabel.value },
    { label: '题量', value: `${settings.value.count}` }
  ]
})
</script>

<template>
  <div class="page-container" :class="`page-container--${step}`">
    <PracticeStageHeader
      kicker="词汇测试"
      :title="headerTitle"
      :description="headerDescription"
      :summary-items="headerSummary"
      accent-start="#f59e0b"
      accent-end="#f97316"
      :compact="step !== 'setup'"
    />

    <VocabularyTestSetupPanel
      v-if="step === 'setup'"
      :loading="loading"
      :settings="settings"
      :exam-types="examTypes"
      :test-modes="testModes"
      :difficulties="difficulties"
      :counts="counts"
      @update-setting="updateSetting"
      @start="generateQuestions"
    />

    <VocabularyTestQuestionPanel
      v-else-if="step === 'testing'"
      :current-question="currentQuestion"
      :current-question-index="currentQuestionIndex"
      :generated-questions="generatedQuestions"
      :answers="answers"
      :progress-percent="progressPercent"
      @exit="exitTest"
      @jump-to-question="jumpToQuestion"
      @next-question="nextQuestion"
      @select-answer="selectAnswer"
      @spelling-keyup="handleSpellingKeyup"
      @submit="submitExam"
      @update-answer="updateAnswer"
    />

    <VocabularyTestResultPanel
      v-else-if="step === 'result'"
      :score="score"
      :show-all="showAll"
      :review-questions="reviewQuestions"
      @go-home="goHome"
      @open-ai-tutor="openAITutor"
      @restart="restart"
      @toggle-show-all="toggleShowAll"
    />

    <AITutor :context="tutorContext" :auto-open="showTutor" @close="closeAITutor" />
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  max-width: 1480px;
  margin: 28px auto 56px;
  padding: 0 28px;
}

.page-container--testing,
.page-container--result {
  max-width: 1440px;
}

@media (max-width: 900px) {
  .page-container {
    margin: 18px auto 24px;
    padding: 0 10px;
  }
}
</style>
