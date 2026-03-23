<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useMessage } from 'naive-ui'
import { FileEdit, MessageSquare, Target } from 'lucide-vue-next'
import { useWritingStore } from '@/stores/writing'
import { useWritingPractice } from '@/composables/useWritingPractice'
import { getExamTypeLabel } from '@/constants/examTypes'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const WritingSetupPanel = defineAsyncComponent(() => import('@/components/writing/WritingSetupPanel.vue'))
const WritingEditorPanel = defineAsyncComponent(() => import('@/components/writing/WritingEditorPanel.vue'))
const WritingResultPanel = defineAsyncComponent(() => import('@/components/writing/WritingResultPanel.vue'))
const AiEvaluatingOverlay = defineAsyncComponent(() => import('@/components/AiEvaluatingOverlay.vue'))

const message = useMessage()
const writingStore = useWritingStore()

const {
  step,
  isLoading,
  essayContent,
  selectedTopic,
  analysisResult,
  historyPage,
  historyPageSize,
  historyTotal,
  paginatedHistory,
  isFocusMode,
  showDraftSaved,
  displayScore,
  showShare,
  shareContent,
  settings,
  examTypes,
  writingModes,
  difficulties,
  timeLimits,
  timeLeft,
  timeLeftDisplay,
  displayedPrompt,
  isPromptTyping,
  setPromptImmediate,
  wordCount,
  showTutor,
  tutorContext,
  updateSetting,
  loadHistoryTopic,
  generateTopic,
  submitEssay,
  restart,
  openAITutor
} = useWritingPractice({
  message,
  writingStore,
  writingIconMap: {
    FileEdit,
    Target,
    MessageSquare
  }
})

const feedbackCount = computed(() => analysisResult.value?.feedback?.length || 0)

const examTypeOptions = computed(() => (
  Array.isArray(examTypes) ? examTypes : (examTypes?.value || [])
))

const writingModeOptions = computed(() => (
  Array.isArray(writingModes) ? writingModes : (writingModes?.value || [])
))

const selectedExamLabel = computed(() => (
  examTypeOptions.value.find(item => item.value === settings.value.examType)?.label
  || getExamTypeLabel(settings.value.examType, settings.value.examType?.toUpperCase?.() || 'CET-4')
  || 'CET-4'
))

const selectedModeLabel = computed(() => (
  writingModeOptions.value.find(item => item.value === settings.value.mode)?.label
  || '图表作文'
))

const selectedDifficultyLabel = computed(() => (
  (Array.isArray(difficulties) ? difficulties : (difficulties?.value || []))
    .find(item => item.value === settings.value.difficulty)?.label
  || '标准'
))

const scoreBand = computed(() => {
  if (displayScore.value >= 85) return '优秀'
  if (displayScore.value >= 70) return '良好'
  if (displayScore.value >= 60) return '合格'
  return '待加强'
})

const nextAction = computed(() => {
  if (displayScore.value >= 80) return '继续精修'
  if (displayScore.value >= 60) return '补强语法'
  return '先稳结构'
})

const headerTitle = computed(() => {
  if (step.value === 'writing') return '正文写作'
  if (step.value === 'result') return '结果分析'
  return '写作练习'
})

const headerDescription = computed(() => {
  if (step.value === 'writing') {
    return '开始后可直接查看题目、写作要点和正文编辑区。'
  }
  if (step.value === 'result') {
    return '先看整体得分和重点反馈，再决定要继续改稿还是直接追问 AI 助手。'
  }
  return '先确定考试语境和题型，再开始本次写作练习。'
})

const headerSummary = computed(() => {
  if (step.value === 'writing') {
    return [
      { label: '考试', value: selectedExamLabel.value },
      { label: '题型', value: selectedModeLabel.value },
      { label: '难度', value: selectedDifficultyLabel.value },
      { label: '限时', value: settings.value.timeLimit > 0 ? `${settings.value.timeLimit} 分钟` : '不限时' },
      { label: '当前字数', value: `${wordCount.value}` }
    ]
  }

  if (step.value === 'result') {
    return [
      { label: '总分', value: `${displayScore.value}` },
      { label: '等级', value: scoreBand.value },
      { label: '反馈数', value: `${feedbackCount.value} 条` },
      { label: '后续动作', value: nextAction.value }
    ]
  }

  return [
    { label: '考试', value: selectedExamLabel.value },
    { label: '题型', value: selectedModeLabel.value },
    { label: '难度', value: selectedDifficultyLabel.value },
    { label: '限时', value: settings.value.timeLimit > 0 ? `${settings.value.timeLimit} 分钟` : '不限时' },
    { label: '历史题目', value: `${historyTotal.value}` }
  ]
})
</script>

<template>
  <div class="page-container" :class="`page-container--${step}`">
    <header class="page-header" :class="`page-header--${step}`">
      <div class="page-header-main">
        <h1>{{ headerTitle }}</h1>
        <p>{{ headerDescription }}</p>
      </div>

      <div class="page-summary">
        <div
          v-for="item in headerSummary"
          :key="item.label"
          class="summary-item"
        >
          <span class="summary-label">{{ item.label }}</span>
          <strong class="summary-value">{{ item.value }}</strong>
        </div>
      </div>
    </header>

    <WritingSetupPanel
      v-if="step === 'setup'"
      :settings="settings"
      :exam-types="examTypes"
      :writing-modes="writingModes"
      :difficulties="difficulties"
      :selected-mode-label="selectedModeLabel"
      :selected-difficulty-label="selectedDifficultyLabel"
      :time-limits="timeLimits"
      :items="paginatedHistory"
      :total="historyTotal"
      :page="historyPage"
      :page-size="historyPageSize"
      @update-setting="updateSetting"
      @generate="generateTopic"
      @select="loadHistoryTopic"
      @update:page="historyPage = $event"
      @update:page-size="historyPageSize = $event"
    />

    <WritingEditorPanel
      v-else-if="step === 'writing'"
      :settings="settings"
      :selected-mode-label="selectedModeLabel"
      :selected-difficulty-label="selectedDifficultyLabel"
      :selected-topic="selectedTopic"
      :displayed-prompt="displayedPrompt"
      :is-prompt-typing="isPromptTyping"
      :is-focus-mode="isFocusMode"
      :show-draft-saved="showDraftSaved"
      :essay-content="essayContent"
      :word-count="wordCount"
      :time-left="timeLeft"
      :time-left-display="timeLeftDisplay"
      :is-loading="isLoading"
      @restart="restart"
      @toggle-focus="isFocusMode = !isFocusMode"
      @prompt-skip="setPromptImmediate(selectedTopic?.prompt || '')"
      @update:essay-content="essayContent = $event"
      @submit="submitEssay"
    />

    <WritingResultPanel
      v-else-if="step === 'result'"
      :display-score="displayScore"
      :analysis-result="analysisResult"
      :show-share="showShare"
      :share-content="shareContent"
      @restart="restart"
      @open-tutor="openAITutor"
      @update:show-share="showShare = $event"
    />

    <AiEvaluatingOverlay :show="isLoading" />

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

.page-header {
  display: grid;
  grid-template-columns: minmax(0, 1.24fr) minmax(300px, 0.76fr);
  gap: 24px;
  align-items: end;
  margin-bottom: 28px;
  padding: 0 0 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.page-kicker {
  margin: 0 0 10px;
  color: #fb923c;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: none;
}

.page-header h1 {
  margin: 0 0 12px;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 0.98;
  background: linear-gradient(120deg, #fb923c, #f97316 55%, #ea580c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header--writing h1,
.page-header--result h1 {
  font-size: clamp(1.9rem, 3vw, 2.6rem);
}

.page-header p {
  color: var(--secondary-text);
  max-width: 44rem;
  line-height: 1.7;
}

.page-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.summary-item {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.3)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
}

.summary-label {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-value {
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
}

:global(html[data-theme='light'] .page-header) {
  border-bottom-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .page-header--setup) {
  padding: 8px 0 24px;
}

:global(html[data-theme='light'] .page-container--writing),
:global(html[data-theme='light'] .page-container--result) {
  border-radius: 36px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(248, 250, 252, 0.72)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 34%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

:global(html[data-theme='light'] .summary-item) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

@media (max-width: 1180px) {
  .page-header {
    grid-template-columns: 1fr;
    align-items: start;
  }
}

@media (max-width: 900px) {
  .page-container {
    margin: 18px auto 24px;
    padding: 0 10px;
  }

  .page-header {
    margin-bottom: 16px;
    text-align: left;
    padding: 6px 4px 0;
    border-bottom: 0;
  }

  .page-header h1 {
    font-size: 1.65rem;
    margin-bottom: 8px;
  }

  .page-header p {
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .page-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .summary-item {
    padding: 12px;
    border-radius: 16px;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
