<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { ArrowLeft } from 'lucide-vue-next'
import GrammarSidebarPanel from '@/components/grammar/GrammarSidebarPanel.vue'
import GrammarSetupPanel from '@/components/grammar/GrammarSetupPanel.vue'
import { useGrammarPractice } from '@/composables/useGrammarPractice'
import PracticeStageHeader from '@/components/learning/PracticeStageHeader.vue'

const AITutorEnhanced = defineAsyncComponent(() => import('@/components/AITutorEnhanced.vue'))
const GrammarQuestionPanel = defineAsyncComponent(() => import('@/components/grammar/GrammarQuestionPanel.vue'))
const GrammarResultPanel = defineAsyncComponent(() => import('@/components/grammar/GrammarResultPanel.vue'))

const {
  grammarTopics,
  practiceModes,
  difficulties,
  selectedTopic,
  selectedMode,
  selectedDifficulty,
  isLoading,
  currentLogId,
  isStarted,
  isSubmitted,
  currentQuestionIndex,
  userAnswers,
  score,
  showResult,
  earnedXP,
  stats,
  showTutor,
  tutorSessionId,
  learningAdvice,
  relatedTopics,
  handleSessionCreated,
  tutorContext,
  historyPage,
  historyPageSize,
  historyTotal,
  paginatedHistory,
  selectedAnswer,
  hasAnswered,
  totalQuestions,
  currentQuestion,
  selectTopic,
  selectMode,
  selectDifficulty,
  startPractice,
  loadHistoryExercise,
  selectAnswerIdx,
  goToQuestion,
  submitPractice,
  nextQuestion,
  restart,
  openAITutor
} = useGrammarPractice()

const selectedTopicInfo = computed(() => (
  grammarTopics.find(topic => topic.id === selectedTopic.value) || null
))

const selectedModeInfo = computed(() => (
  practiceModes.find(mode => mode.id === selectedMode.value) || null
))

const selectedDifficultyInfo = computed(() => (
  difficulties.find(level => level.id === selectedDifficulty.value) || null
))

const answeredCount = computed(() => (
  userAnswers.value.filter(answer => answer?.selected !== null && answer?.selected !== undefined).length
))

const headerTitle = computed(() => {
  if (showResult.value) return '语法结果'
  if (isStarted.value) return '语法作答'
  return '语法特训'
})

const headerDescription = computed(() => {
  if (showResult.value) {
    return '先看正确率、相关知识点和学习建议，再决定回顾解析还是重新开始。'
  }
  if (isStarted.value) {
    return '题目生成后可直接开始作答，并实时查看练习进度。'
  }
  return '先选择语法主题、模式和难度，再开始本次语法训练。'
})

const headerSummary = computed(() => {
  if (showResult.value) {
    return [
      { label: '得分', value: `${score.value}/${totalQuestions.value}` },
      { label: '正确率', value: totalQuestions.value ? `${Math.round((score.value / totalQuestions.value) * 100)}%` : '0%' },
      { label: 'XP', value: `${earnedXP.value}` },
      { label: '主题', value: selectedTopicInfo.value?.title || '-' }
    ]
  }

  if (isStarted.value) {
    return [
      { label: '主题', value: selectedTopicInfo.value?.title || '-' },
      { label: '模式', value: selectedModeInfo.value?.title || '-' },
      { label: '难度', value: selectedDifficultyInfo.value?.title || '-' },
      { label: '进度', value: `${answeredCount.value}/${totalQuestions.value}` }
    ]
  }

  return [
    { label: '主题', value: selectedTopicInfo.value?.title || '-' },
    { label: '模式', value: selectedModeInfo.value?.title || '-' },
    { label: '难度', value: selectedDifficultyInfo.value?.title || '-' },
    { label: '历史练习', value: `${historyTotal.value}` }
  ]
})
</script>

<template>
  <div class="page-container">
    <PracticeStageHeader
      kicker="语法特训"
      :title="headerTitle"
      :description="headerDescription"
      :summary-items="headerSummary"
      accent-start="#f97316"
      accent-end="#ea580c"
      :compact="isStarted || showResult"
    >
      <template #actions>
        <n-button
          v-if="isStarted && !showResult"
          secondary
          class="exit-btn"
          @click="isStarted = false"
        >
          <template #icon><n-icon :component="ArrowLeft" /></template>
          退出练习
        </n-button>
      </template>
    </PracticeStageHeader>

    <div class="main-layout">
      <div class="content-panel">
        <GrammarSetupPanel
          v-if="!isStarted"
          :grammar-topics="grammarTopics"
          :selected-topic="selectedTopic"
          :history-total="historyTotal"
          :history-page="historyPage"
          :history-page-size="historyPageSize"
          :paginated-history="paginatedHistory"
          @select-topic="selectTopic"
          @load-history="loadHistoryExercise"
          @update:history-page="historyPage = $event"
          @update:history-page-size="historyPageSize = $event"
        />

        <!-- PRACTICE VIEW: Active Question -->
        <GrammarQuestionPanel
          v-else-if="!showResult"
          :is-loading="isLoading"
          :current-question-index="currentQuestionIndex"
          :total-questions="totalQuestions"
          :current-question="currentQuestion"
          :grammar-topics="grammarTopics"
          :selected-topic="selectedTopic"
          :is-submitted="isSubmitted"
          :selected-answer="selectedAnswer"
          @select-answer="selectAnswerIdx"
          @go-to-question="goToQuestion"
          @next-question="nextQuestion"
          @open-ai-tutor="openAITutor"
        />

        <!-- RESULT VIEW: Performance Summary -->
        <GrammarResultPanel
          v-else
          :score="score"
          :total-questions="totalQuestions"
          :current-log-id="currentLogId"
          :earned-x-p="earnedXP"
          :related-topics="relatedTopics"
          :learning-advice="learningAdvice"
          @restart="restart"
          @review="showResult = false"
          @open-ai-tutor="openAITutor"
        />
      </div>

      <!-- RIGHT PANEL: Sidebar -->
      <div class="sidebar-panel">
        <GrammarSidebarPanel
          :stats="stats"
          :is-started="isStarted"
          :show-result="showResult"
          :is-submitted="isSubmitted"
          :selected-topic="selectedTopic"
          :grammar-topics="grammarTopics"
          :total-questions="totalQuestions"
          :current-question-index="currentQuestionIndex"
          :user-answers="userAnswers"
          :practice-modes="practiceModes"
          :selected-mode="selectedMode"
          :difficulties="difficulties"
          :selected-difficulty="selectedDifficulty"
          :is-loading="isLoading"
          @select-mode="selectMode"
          @select-difficulty="selectDifficulty"
          @start-practice="startPractice"
          @submit-practice="submitPractice"
          @go-to-question="goToQuestion"
        />
      </div>
    </div>

    <!-- AI Tutor Component -->
    <AITutorEnhanced 
      :context="tutorContext"
      v-model:show="showTutor"
      :session-id="tutorSessionId"
      @session-created="handleSessionCreated"
    />
  </div>
</template>

<style scoped>
.page-container {
  min-height: calc(100vh - 100px);
  max-width: 1480px;
  margin: 24px auto 56px;
  padding: 0 28px;
  box-sizing: border-box;
  animation: pageFadeIn 0.45s ease-out;
}

.main-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 92px;
  padding-bottom: 24px;
}

.exit-btn {
  border-radius: 12px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-color);
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1180px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar-panel {
    width: 100%;
    position: static;
    top: auto;
  }
}

@media (max-width: 768px) {
  .page-container {
    margin: 16px auto 32px;
    padding: 0 16px;
  }

  .main-layout {
    gap: 20px;
  }

  /* 语法面板 secondary、tiny 按钮在窄屏不足 32px */
  :deep(.n-button.n-button--small-type),
  :deep(.n-button.n-button--tiny-type) {
    min-height: 32px;
    min-width: 32px;
  }

  /* 历史列表分页控件 */
  :deep(.n-pagination .n-pagination-item) {
    min-width: 32px;
    min-height: 32px;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
