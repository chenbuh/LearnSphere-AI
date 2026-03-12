<script setup>
import { NTabs, NCard } from 'naive-ui'
import SensitiveAuditHeader from '@/components/SensitiveAuditHeader.vue'
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
  <div class="page-container">
    <SensitiveAuditHeader />

    <SensitiveAuditDashboard :stats-data="statsData">
      <template #trend-chart>
        <div ref="trendChartRef" class="chart-box"></div>
      </template>
      <template #pie-chart>
        <div ref="wordPieChartRef" class="chart-box"></div>
      </template>
    </SensitiveAuditDashboard>

    <n-card class="main-card" :bordered="false">
      <n-tabs v-model:value="activeTab" type="line" size="large" animated>
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
      </n-tabs>
    </n-card>

    <SensitiveAuditAddWordModal
      v-model:show="showAddModal"
      :new-word="newWord"
      @submit="handleAddWord"
    />
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}

.main-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(10px);
}

.chart-box {
  height: 280px;
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #71717a !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.n-data-table-td) {
  background: transparent !important;
  color: #e4e4e7 !important;
}

:deep(.n-data-table .n-data-table-tr--striped .n-data-table-td) {
  background: rgba(255, 255, 255, 0.01) !important;
}
</style>
