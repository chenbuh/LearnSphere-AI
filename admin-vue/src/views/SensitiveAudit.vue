<script setup>
import { NTabPane, NTabs } from 'naive-ui'
import { BookMarked, ShieldAlert } from 'lucide-vue-next'
import SensitiveAuditDashboard from '@/components/SensitiveAuditDashboard.vue'
import SensitiveAuditLogsTab from '@/components/SensitiveAuditLogsTab.vue'
import SensitiveAuditDictionaryTab from '@/components/SensitiveAuditDictionaryTab.vue'
import SensitiveAuditAddWordModal from '@/components/SensitiveAuditAddWordModal.vue'
import { useSensitiveAudit } from '@/composables/useSensitiveAudit'

const {
  activeTab,
  checkedRowKeys,
  columns,
  fetchData,
  fetchWords,
  handleAddWord,
  handleBatchDelete,
  handlePageChange,
  handleReloadWords,
  handleWordPageChange,
  keyword,
  list,
  loading,
  newWord,
  page,
  pageSize,
  showAddModal,
  statsData,
  total,
  trendChartRef,
  wordColumns,
  wordKeyword,
  wordList,
  wordLoading,
  wordPage,
  wordPageSize,
  wordPieChartRef,
  wordTotal
} = useSensitiveAudit()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <SensitiveAuditDashboard :stats-data="statsData">
      <template #trend-chart>
        <div ref="trendChartRef" class="chart-box"></div>
      </template>
      <template #pie-chart>
        <div ref="wordPieChartRef" class="chart-box"></div>
      </template>
    </SensitiveAuditDashboard>

    <section class="ls-panel sensitive-panel">
      <n-tabs
        v-model:value="activeTab"
        class="sensitive-tabs"
        type="line"
        size="small"
        pane-style="padding: 0"
      >
        <n-tab-pane name="logs">
          <template #tab>
            <span class="tab-item"><ShieldAlert :size="15" /><span>拦截审计日志</span></span>
          </template>
          <SensitiveAuditLogsTab
            :total="total"
            :checked-row-keys="checkedRowKeys"
            :keyword="keyword"
            :columns="columns"
            :list="list"
            :loading="loading"
            :page="page"
            :page-size="pageSize"
            @update:keyword="keyword = $event"
            @refresh="fetchData"
            @batch-delete="handleBatchDelete"
            @update:checked-row-keys="checkedRowKeys = $event"
            @update:page="handlePageChange"
          />
        </n-tab-pane>

        <n-tab-pane name="dictionary">
          <template #tab>
            <span class="tab-item"><BookMarked :size="15" /><span>敏感词库管理</span></span>
          </template>
          <SensitiveAuditDictionaryTab
            :word-keyword="wordKeyword"
            :word-columns="wordColumns"
            :word-list="wordList"
            :word-loading="wordLoading"
            :word-page="wordPage"
            :word-total="wordTotal"
            :word-page-size="wordPageSize"
            @update:word-keyword="wordKeyword = $event"
            @show-add-modal="showAddModal = true"
            @reload-words="handleReloadWords"
            @refresh-words="fetchWords"
            @update:word-page="handleWordPageChange"
          />
        </n-tab-pane>
      </n-tabs>
    </section>

    <SensitiveAuditAddWordModal
      v-model:show="showAddModal"
      :new-word="newWord"
      @submit="handleAddWord"
    />
  </div>
</template>

<style scoped>
.sensitive-panel {
  overflow: hidden;
}

/* Tab strip shares the panel's 20px gutter. */
.sensitive-tabs :deep(.n-tabs-nav) {
  margin: 0;
  padding: 4px 20px 0;
  border-bottom: 1px solid var(--line);
}

/* The panel rule above replaces Naive's own inset underline. */
.sensitive-tabs :deep(.n-tabs-nav-scroll-content) {
  border-bottom: 0 !important;
}

.sensitive-tabs :deep(.n-tabs-bar) {
  bottom: -1px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
}

.chart-box {
  height: 280px;
}
</style>
