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
      <n-tabs class="vocabulary-tabs" :value="activeTab" type="segment" animated @update:value="handleActiveTabChange">
        
        <!-- Tab 1: Browse Mode -->
        <n-tab-pane name="browse">
          <template #tab>
            <span class="tab-label tab-label--full">Browse Vocabulary</span>
            <span class="tab-label tab-label--compact">Browse</span>
          </template>
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
        <n-tab-pane name="learn">
          <template #tab>
            <span class="tab-label tab-label--full">Learn Session</span>
            <span class="tab-label tab-label--compact">Learn</span>
          </template>
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
  max-width: 1160px;
  margin: 0 auto;
  padding: 20px 24px 28px;
}

.main-card {
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.08), transparent 36%),
    linear-gradient(180deg, rgba(39, 45, 63, 0.92), rgba(32, 37, 52, 0.94));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 28px;
  width: min(100%, 1040px);
  margin: 0 auto;
  overflow: visible;
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.34);
}

:global(.dark-mode) .main-card {
  background:
    radial-gradient(circle at top, rgba(99, 102, 241, 0.08), transparent 36%),
    linear-gradient(180deg, rgba(39, 45, 63, 0.92), rgba(32, 37, 52, 0.94));
  box-shadow: 0 28px 72px rgba(2, 6, 23, 0.4);
}

:deep(.main-card .n-card__content) {
  padding: 18px 22px 22px;
}

:deep(.vocabulary-tabs .n-tabs-nav) {
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  padding: 6px;
}

:deep(.vocabulary-tabs .n-tabs-nav-scroll-wrapper),
:deep(.vocabulary-tabs .n-tabs-nav-scroll-content) {
  width: 100%;
}

:deep(.vocabulary-tabs .n-tabs-nav-scroll-content) {
  display: flex;
}

:deep(.vocabulary-tabs .n-tabs-tab) {
  flex: 1 1 0;
  min-width: 0;
  justify-content: center;
  min-height: 38px;
  border-radius: 12px;
}

:deep(.vocabulary-tabs .n-tabs-tab.n-tabs-tab--active) {
  background: linear-gradient(180deg, rgba(107, 114, 128, 0.34), rgba(71, 85, 105, 0.42));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

:deep(.vocabulary-tabs .n-tabs-bar) {
  display: none;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #e5e7eb;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.tab-label--compact {
  display: none;
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px 12px 28px;
  }

  .main-card {
    min-height: auto;
    border-radius: 18px;
    box-shadow: none;
  }

  :deep(.main-card .n-card__content) {
    padding: 16px 14px 18px;
  }

  :deep(.vocabulary-tabs .n-tabs-nav) {
    margin-bottom: 6px;
  }

  :deep(.vocabulary-tabs .n-tabs-tab) {
    padding: 10px 14px !important;
    font-size: 0.88rem !important;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 10px 10px 24px;
  }

  .main-card {
    border-radius: 12px;
  }

  :deep(.main-card .n-card__content) {
    padding: 12px 10px 14px;
  }

  :deep(.vocabulary-tabs .n-tabs-nav) {
    margin-bottom: 4px;
  }

  :deep(.vocabulary-tabs .n-tabs-tab) {
    padding: 10px 8px !important;
    font-size: 0.82rem !important;
  }

  .tab-label--full {
    display: none;
  }

  .tab-label--compact {
    display: inline-flex;
  }
}
</style>
