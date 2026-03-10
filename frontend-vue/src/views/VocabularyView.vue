<script setup>
import { defineAsyncComponent } from 'vue'
import { NCard, NTabs, NTabPane } from 'naive-ui'
import { useVocabularyPractice } from '@/composables/useVocabularyPractice'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const VocabularyOverviewHeader = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyOverviewHeader.vue'))
const VocabularyBrowsePanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyBrowsePanel.vue'))
const VocabularyLearnPanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyLearnPanel.vue'))
const VocabularyDetailModal = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyDetailModal.vue'))

const {
  activeTab,
  loading,
  dailyTask,
  searchText,
  selectedExam,
  showDetailModal,
  currentDetailWord,
  total,
  page,
  pageSize,
  examOptions,
  sessionWords,
  sessionIndex,
  isFlipped,
  sessionComplete,
  sessionStats,
  paginatedBrowseWords,
  currentLearnWord,
  mnemonicText,
  mnemonicLoading,
  showTutor,
  tutorContext,
  stats,
  playAudio,
  handlePageChange,
  handleSearch,
  isPlaceholderDefinition,
  openWordDetail,
  startSession,
  handleResult,
  flipCard,
  handleGetMnemonic,
  openAITutor
} = useVocabularyPractice()

const handleActiveTabChange = (value) => {
  activeTab.value = value
}

const handleSelectedExamChange = (value) => {
  selectedExam.value = value
}

const handleSearchTextChange = (value) => {
  searchText.value = value
}

const handleDetailModalShowChange = (value) => {
  showDetailModal.value = value
  if (!value) {
    currentDetailWord.value = null
  }
}

const handleTutorClose = () => {
  showTutor.value = false
}
</script>

<template>
  <div class="page-container">
    <VocabularyOverviewHeader
      :daily-task="dailyTask"
      :stats="stats"
    />

    <!-- Main Content Area -->
    <n-card :bordered="false" class="main-card">
      <n-tabs :value="activeTab" type="segment" animated @update:value="handleActiveTabChange">
        
        <!-- Tab 1: Browse Mode -->
        <n-tab-pane name="browse" tab="Browse Vocabulary">
          <VocabularyBrowsePanel
            :selected-exam="selectedExam"
            :exam-options="examOptions"
            :search-text="searchText"
            :total="total"
            :loading="loading"
            :paginated-browse-words="paginatedBrowseWords"
            :page="page"
            :page-size="pageSize"
            @update:selected-exam="handleSelectedExamChange"
            @update:search-text="handleSearchTextChange"
            @search="handleSearch"
            @change-page="handlePageChange"
            @open-word-detail="openWordDetail"
            @play-audio="playAudio"
          />
        </n-tab-pane>

        <!-- Tab 2: Learn Mode -->
        <n-tab-pane name="learn" tab="Learn Session">
          <VocabularyLearnPanel
            :selected-exam="selectedExam"
            :exam-options="examOptions"
            :session-words="sessionWords"
            :session-index="sessionIndex"
            :is-flipped="isFlipped"
            :session-complete="sessionComplete"
            :session-stats="sessionStats"
            :current-learn-word="currentLearnWord"
            :mnemonic-text="mnemonicText"
            :mnemonic-loading="mnemonicLoading"
            @update:selected-exam="handleSelectedExamChange"
            @start-session="startSession"
            @flip-card="flipCard"
            @play-audio="playAudio"
            @get-mnemonic="handleGetMnemonic"
            @open-ai-tutor="openAITutor"
            @handle-result="handleResult"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      v-if="currentDetailWord"
      :show="showDetailModal"
      @update:show="handleDetailModalShowChange"
      :current-detail-word="currentDetailWord"
      :is-placeholder-definition="isPlaceholderDefinition"
      @play-audio="playAudio"
      @open-ai-tutor="openAITutor"
    />
    <!-- AI Tutor Component -->
    <AITutor 
      :context="tutorContext"
      :auto-open="showTutor"
      @close="handleTutorClose"
    />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.main-card {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  min-height: 600px;
}

:global(.dark-mode) .main-card {
  background: rgba(30, 30, 35, 0.6);
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .main-card {
    min-height: auto;
  }

  :deep(.n-tabs .n-tabs-tab) {
    padding: 8px 16px !important;
    font-size: 0.9rem !important;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
}
</style>
