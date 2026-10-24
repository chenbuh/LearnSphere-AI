<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { NCard, NTabs, NTabPane } from 'naive-ui'
import { useVocabularyPractice } from '@/composables/useVocabularyPractice'
import PracticeStageHeader from '@/components/learning/PracticeStageHeader.vue'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const VocabularyOverviewHeader = defineAsyncComponent(
  () => import('@/components/vocabulary/VocabularyOverviewHeader.vue')
)
const VocabularyBrowsePanel = defineAsyncComponent(
  () => import('@/components/vocabulary/VocabularyBrowsePanel.vue')
)
const VocabularyLearnPanel = defineAsyncComponent(
  () => import('@/components/vocabulary/VocabularyLearnPanel.vue')
)
const VocabularyDetailModal = defineAsyncComponent(
  () => import('@/components/vocabulary/VocabularyDetailModal.vue')
)

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

const handleActiveTabChange = value => {
  activeTab.value = value
}

const handleSelectedExamChange = value => {
  selectedExam.value = value
}

const handleSearchTextChange = value => {
  searchText.value = value
}

const handleDetailModalShowChange = value => {
  showDetailModal.value = value
  if (!value) {
    currentDetailWord.value = null
  }
}

const handleTutorClose = () => {
  showTutor.value = false
}

const currentExamLabel = computed(
  () => examOptions.find(item => item.value === selectedExam.value)?.label || selectedExam.value
)

const currentStageDescription = computed(() =>
  activeTab.value === 'learn'
    ? '先选择词库并完成记忆训练，结果会在当前页面直接更新。'
    : '可按条件筛选并浏览词条，方便快速查找需要学习的单词。'
)

const stageSummary = computed(() => {
  if (activeTab.value === 'learn') {
    return [
      { label: '当前词库', value: currentExamLabel.value },
      {
        label: '学习进度',
        value: sessionWords.value.length
          ? `${sessionIndex.value + 1}/${sessionWords.value.length}`
          : '未开始'
      },
      { label: '已掌握', value: `${sessionStats.value.correct}` },
      { label: '待复习', value: `${sessionStats.value.wrong}` }
    ]
  }

  return [
    { label: '当前词库', value: currentExamLabel.value },
    { label: '检索结果', value: `${total.value}` },
    { label: '今日完成', value: `${stats.value.todayCount}` },
    { label: '累计掌握', value: `${stats.value.totalMastered}` }
  ]
})
</script>

<template>
  <div class="page-container">
    <PracticeStageHeader
      kicker="词汇学习"
      title="词汇学习中心"
      :description="currentStageDescription"
      :summary-items="stageSummary"
      accent-start="#fbbf24"
      accent-end="#f59e0b"
    />

    <div class="overview-band">
      <VocabularyOverviewHeader :daily-task="dailyTask" :stats="stats" />
    </div>

    <n-card :bordered="false" class="main-card">
      <n-tabs
        class="vocabulary-tabs"
        :value="activeTab"
        type="segment"
        animated
        @update:value="handleActiveTabChange"
      >
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

    <VocabularyDetailModal
      v-if="currentDetailWord"
      :show="showDetailModal"
      @update:show="handleDetailModalShowChange"
      :current-detail-word="currentDetailWord"
      :is-placeholder-definition="isPlaceholderDefinition"
      @play-audio="playAudio"
      @open-ai-tutor="openAITutor"
    />
    <AITutor :context="tutorContext" :auto-open="showTutor" @close="handleTutorClose" />
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  max-width: 1480px;
  margin: 28px auto 56px;
  padding: 0 28px;
  padding-right: max(28px, env(safe-area-inset-right));
  padding-left: max(28px, env(safe-area-inset-left));
  padding-bottom: env(safe-area-inset-bottom);
}

.page-container,
.overview-band,
.main-card {
  min-width: 0;
  box-sizing: border-box;
}

.overview-band {
  margin-bottom: 20px;
}

.main-card {
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  width: 100%;
  overflow: visible;
}

:deep(.browse-panel),
:deep(.browse-main),
:deep(.browse-rail),
:deep(.learn-container),
:deep(.learn-main),
:deep(.learn-rail),
:deep(.rail-card),
:deep(.rail-metric),
:deep(.word-row),
:deep(.word-leading),
:deep(.word-main-info),
:deep(.word-grid-container),
:deep(.pagination-container),
:deep(.browse-header),
:deep(.header-copy),
:deep(.filters),
:deep(.total-count) {
  min-width: 0;
  box-sizing: border-box;
}

:deep(.header-copy h3),
:deep(.total-count),
:deep(.rail-card h3),
:deep(.rail-card p),
:deep(.rail-metric span),
:deep(.rail-metric strong),
:deep(.word-main-info h3),
:deep(.word-main-info .phonetic),
:deep(.word-meaning),
:deep(.empty-state h3),
:deep(.empty-state p) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

:deep(.rail-metric strong),
:deep(.word-main-info h3) {
  min-width: 0;
}

:deep(.main-card .n-card__content) {
  padding: 22px 24px 26px;
}

:deep(.vocabulary-tabs .n-tabs-nav) {
  margin-bottom: 20px;
}

:deep(.vocabulary-tabs .n-tabs-rail) {
  /* R6：导轨原本是写死的深色底，改用主题表面色，避免浅色主题下深底压深字 */
  background: var(--surface-muted) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: var(--radius-lg) !important;
  padding: 5px !important;
}

:deep(.vocabulary-tabs .n-tabs-capsule) {
  background: var(--card-bg) !important;
  border: 1px solid rgba(95, 168, 139, 0.35) !important;
  border-radius: var(--radius-md) !important;
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
  min-height: 42px;
  border-radius: var(--radius-md);
  color: var(--secondary-text) !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.vocabulary-tabs .n-tabs-tab:hover) {
  color: var(--text-color) !important;
}

:deep(.vocabulary-tabs .n-tabs-tab.n-tabs-tab--active) {
  color: var(--text-color) !important;
  font-weight: 700;
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
  /* 颜色继承标签自身状态色，避免覆盖选中态 */
  color: inherit;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.tab-label--compact {
  display: none;
}

:global(html[data-theme='light'] .main-card) {
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .main-card .n-card__content) {
  background: transparent;
}

:global(html[data-theme='light'] .vocabulary-tabs .n-tabs-nav) {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .vocabulary-tabs .n-tabs-rail) {
  /* 导轨改为浅色表面后，原白色描边在浅色主题不可见，补一条浅灰描边 */
  border-color: rgba(148, 163, 184, 0.18) !important;
}

:global(html[data-theme='light'] .vocabulary-tabs .n-tabs-tab) {
  color: var(--secondary-text) !important;
}

:global(html[data-theme='light'] .vocabulary-tabs .n-tabs-tab:hover) {
  color: var(--text-color) !important;
}

:global(html[data-theme='light'] .vocabulary-tabs .n-tabs-tab.n-tabs-tab--active) {
  color: var(--text-color) !important;
}

:global(html[data-theme='light'] .tab-label) {
  color: inherit;
}

:global(html[data-theme='light'] .vocabulary-tabs .n-tabs-tab.n-tabs-tab--active .tab-label) {
  /* 原 #c2410c 与浅色胶囊底几乎同亮度，改用正文令牌 */
  color: var(--text-color);
}

@media (max-width: 768px) {
  .page-container {
    margin: 18px auto 24px;
    padding: 0 10px calc(24px + env(safe-area-inset-bottom));
    padding-right: max(10px, env(safe-area-inset-right));
    padding-left: max(10px, env(safe-area-inset-left));
  }

  .main-card {
    min-height: auto;
    border-radius: var(--radius-lg);
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

  :deep(.browse-panel),
  :deep(.learn-container) {
    gap: 14px;
  }

  :deep(.browse-main),
  :deep(.learn-main),
  :deep(.rail-card) {
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 0 10px calc(18px + env(safe-area-inset-bottom));
  }

  .main-card {
    border-radius: var(--radius-md);
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

  :deep(.browse-panel),
  :deep(.learn-container) {
    gap: 12px;
  }

  :deep(.browse-main),
  :deep(.learn-main) {
    padding: 12px;
  }

  :deep(.rail-card) {
    padding: 14px;
    border-radius: var(--radius-lg);
  }

  :deep(.rail-metric) {
    flex-wrap: wrap;
    gap: 6px 10px;
    padding: 10px 0;
  }

  :deep(.word-row) {
    border-radius: var(--radius-lg);
  }

  :deep(.word-main-info h3) {
    font-size: 0.98rem;
    line-height: 1.3;
  }

  :deep(.word-meaning) {
    font-size: 0.86rem;
    line-height: 1.5;
  }

  :deep(.pagination-container) {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  :deep(.pagination-container .n-pagination) {
    flex-wrap: nowrap;
  }

  .tab-label--full {
    display: none;
  }

  .tab-label--compact {
    display: inline-flex;
  }
}

@media (max-width: 360px) {
  .page-container {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }

  .main-card {
    border-radius: var(--radius-md);
  }

  :deep(.vocabulary-tabs .n-tabs-tab) {
    padding: 10px 6px !important;
    font-size: 0.78rem !important;
  }

  :deep(.vocabulary-tabs .n-tabs-nav) {
    padding: 4px;
    border-radius: var(--radius-lg);
  }

  :deep(.browse-main),
  :deep(.learn-main) {
    padding: 10px;
  }

  :deep(.rail-card) {
    padding: 12px;
    border-radius: var(--radius-lg);
  }

  :deep(.rail-card h3) {
    font-size: 1rem;
  }

  :deep(.word-row) {
    gap: 8px;
    padding: 10px;
  }

  :deep(.word-index) {
    width: 32px;
    height: 32px;
    border-radius: 9px;
    font-size: 0.72rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .page-container {
    margin-top: 12px;
    margin-bottom: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }

  :deep(.browse-panel),
  :deep(.learn-container) {
    gap: 12px;
  }

  :deep(.browse-main),
  :deep(.learn-main) {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  :deep(.rail-card) {
    padding-top: 14px;
    padding-bottom: 14px;
  }
}
</style>
