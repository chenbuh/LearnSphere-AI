<script setup>
import { defineAsyncComponent } from 'vue'
import { useMessage } from 'naive-ui'
import {
  Dna,
  Feather,
  HeartPulse,
  Layers,
  Leaf,
  Palette,
  Sparkles,
  Users
} from 'lucide-vue-next'
import { useReadingStore } from '@/stores/reading'
import { useReadingPractice } from '@/composables/useReadingPractice'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const ReadingExamPanel = defineAsyncComponent(() => import('@/components/reading/ReadingExamPanel.vue'))
const ReadingHistoryPanel = defineAsyncComponent(() => import('@/components/reading/ReadingHistoryPanel.vue'))
const ReadingResultPanel = defineAsyncComponent(() => import('@/components/reading/ReadingResultPanel.vue'))
const ReadingReviewPanel = defineAsyncComponent(() => import('@/components/reading/ReadingReviewPanel.vue'))
const ReadingSetupPanel = defineAsyncComponent(() => import('@/components/reading/ReadingSetupPanel.vue'))

const message = useMessage()
const readingStore = useReadingStore()

const {
  displayedText,
  isTyping,
  step,
  isLoading,
  currentQuestionIndex,
  answers,
  score,
  article,
  currentLogId,
  showShare,
  shareContent,
  paginatedHistory,
  historyPage,
  historyPageSize,
  historyTotal,
  settings,
  sources,
  categories,
  difficulties,
  lengths,
  progressPercent,
  realWordCount,
  showTutor,
  tutorContext,
  updateSetting,
  loadArticle,
  generateReading,
  selectAnswer,
  nextQuestion,
  prevQuestion,
  submitExam,
  restart,
  skipTyping,
  calculateWordCount,
  openAITutor
} = useReadingPractice({
  message,
  readingStore,
  categoryIconMap: {
    Sparkles,
    Layers,
    Feather,
    Leaf,
    Users,
    Palette,
    HeartPulse,
    Dna
  }
})
</script>

<template>
  <div class="page-container">
    <div class="page-header" v-if="step === 'setup'">
      <h1>阅读理解训练</h1>
      <p>精选全球外刊与经典名著，深度提升阅读理解能力</p>
    </div>

    <ReadingSetupPanel
      v-if="step === 'setup'"
      :settings="settings"
      :sources="sources"
      :categories="categories"
      :difficulties="difficulties"
      :lengths="lengths"
      :items="paginatedHistory"
      :total="historyTotal"
      :page="historyPage"
      :page-size="historyPageSize"
      :is-loading="isLoading"
      :calculate-word-count="calculateWordCount"
      @update-setting="updateSetting"
      @generate="generateReading"
      @select="loadArticle"
      @update:page="historyPage = $event"
      @update:page-size="historyPageSize = $event"
    />

    <ReadingExamPanel
      v-else-if="step === 'reading' && article"
      :article="article"
      :settings="settings"
      :displayed-text="displayedText"
      :is-typing="isTyping"
      :current-question-index="currentQuestionIndex"
      :answers="answers"
      :progress-percent="progressPercent"
      :real-word-count="realWordCount"
      @restart="restart"
      @update:current-question-index="currentQuestionIndex = $event"
      @skip-typing="skipTyping"
      @select-answer="selectAnswer"
      @prev-question="prevQuestion"
      @next-question="nextQuestion"
      @submit="submitExam"
    />

    <ReadingResultPanel
      v-else-if="step === 'result'"
      :score="score"
      :current-log-id="currentLogId"
      :show-share="showShare"
      :share-content="shareContent"
      @restart="restart"
      @review="step = 'review'"
      @update:show-share="showShare = $event"
    />

    <ReadingReviewPanel
      v-else-if="step === 'review'"
      :article="article"
      :answers="answers"
      @back="step = 'result'"
      @open-ai-tutor="openAITutor"
    />

    <AITutor
      :context="tutorContext"
      :auto-open="showTutor"
      @close="showTutor = false"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  background: linear-gradient(120deg, #10b981, #14b8a6);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: var(--secondary-text);
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>