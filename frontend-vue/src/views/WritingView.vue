<script setup>
import { defineAsyncComponent } from 'vue'
import { useMessage } from 'naive-ui'
import { FileEdit, MessageSquare, Target } from 'lucide-vue-next'
import { useWritingStore } from '@/stores/writing'
import { useWritingPractice } from '@/composables/useWritingPractice'

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
</script>

<template>
  <div class="page-container">
    <div class="page-header" v-if="step === 'setup'">
      <h1>写作练习</h1>
      <p>模拟真实考试场景，AI 实时诊断语法与逻辑漏洞</p>
    </div>

    <transition name="fade-slide" mode="out-in">
      <WritingSetupPanel
        v-if="step === 'setup'"
        :settings="settings"
        :exam-types="examTypes"
        :writing-modes="writingModes"
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
    </transition>

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
  background: linear-gradient(120deg, #f97316, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: var(--secondary-text);
}

:global(.fade-slide-enter-active),
:global(.fade-slide-leave-active) {
  transition: all 0.5s ease;
}

:global(.fade-slide-enter-from) {
  opacity: 0;
  transform: translateY(30px);
}

:global(.fade-slide-leave-to) {
  opacity: 0;
  transform: translateY(-30px);
}










</style>

<style src="../assets/learning-mobile.css" scoped></style>