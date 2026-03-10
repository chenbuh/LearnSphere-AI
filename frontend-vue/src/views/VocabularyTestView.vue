<script setup>
import { defineAsyncComponent } from 'vue'
import { useVocabularyTest } from '@/composables/useVocabularyTest'

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
</script>

<template>
  <div class="page-container">
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
}
</style>
