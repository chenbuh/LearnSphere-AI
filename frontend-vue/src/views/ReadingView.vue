<script setup>
import { computed, defineAsyncComponent } from 'vue'
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
import PracticeStageHeader from '@/components/learning/PracticeStageHeader.vue'

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

const headerTitle = computed(() => {
  if (step.value === 'reading') return '阅读任务'
  if (step.value === 'result') return '阅读结果'
  if (step.value === 'review') return '原文复盘'
  return '阅读理解训练'
})

const headerDescription = computed(() => {
  if (step.value === 'reading') {
    return '开始后可直接阅读原文、完成题目并查看进度。'
  }
  if (step.value === 'result') {
    return '先看整体正确率，再决定进入原文复盘还是直接开始下一篇。'
  }
  if (step.value === 'review') {
    return '回到原文和答案解析，集中看错因、定位段落和题目陷阱。'
  }
  return '先确定来源、题材和难度，再开始本次阅读练习。'
})

const headerSummary = computed(() => {
  if (step.value === 'reading') {
    return [
      { label: '来源', value: article.value?.source || settings.value.source?.toUpperCase() || 'N/A' },
      { label: '题材', value: settings.value.category?.toUpperCase() || 'N/A' },
      { label: '篇幅', value: `${realWordCount.value} 词` },
      { label: '进度', value: `${Math.round(progressPercent.value)}%` }
    ]
  }

  if (step.value === 'result' || step.value === 'review') {
    return [
      { label: '得分', value: `${score.value}` },
      { label: '来源', value: article.value?.source || 'N/A' },
      { label: '题目数', value: `${article.value?.questions?.length || 0}` },
      { label: '文章长度', value: `${realWordCount.value} 词` }
    ]
  }

  return [
    { label: '来源', value: settings.value.source?.toUpperCase() || 'N/A' },
    { label: '题材', value: settings.value.category?.toUpperCase() || 'N/A' },
    { label: '难度', value: settings.value.difficulty || 'medium' },
    { label: '历史任务', value: `${historyTotal.value}` }
  ]
})
</script>

<template>
  <div class="page-container" :class="`page-container--${step}`">
    <PracticeStageHeader
      kicker="阅读练习"
      :title="headerTitle"
      :description="headerDescription"
      :summary-items="headerSummary"
      accent-start="#34d399"
      accent-end="#0f766e"
      :compact="step !== 'setup'"
    />

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
  position: relative;
  max-width: 1480px;
  margin: 28px auto 56px;
  padding: 0 28px;
}

:global(html[data-theme='light'] .page-container--setup) {
  padding-top: 8px;
}

:global(html[data-theme='light'] .page-container--reading),
:global(html[data-theme='light'] .page-container--result),
:global(html[data-theme='light'] .page-container--review) {
  border-radius: 36px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.7)),
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.08), transparent 34%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

@media (max-width: 900px) {
  .page-container {
    margin: 18px auto 24px;
    padding:
      0
      calc(10px + env(safe-area-inset-right))
      calc(18px + env(safe-area-inset-bottom))
      calc(10px + env(safe-area-inset-left));
  }

  :global(html[data-theme='light'] .page-container--reading),
  :global(html[data-theme='light'] .page-container--result),
  :global(html[data-theme='light'] .page-container--review) {
    border-radius: 24px;
  }
}

@media (max-width: 900px) and (orientation: landscape) and (max-height: 520px) {
  .page-container {
    margin: 12px auto 18px;
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  :global(html[data-theme='light'] .page-container--reading),
  :global(html[data-theme='light'] .page-container--result),
  :global(html[data-theme='light'] .page-container--review) {
    border-radius: 20px;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>

