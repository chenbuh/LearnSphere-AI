<script setup>
import AdminOperationLogsHeader from '@/components/AdminOperationLogsHeader.vue'
import AdminOperationLogsOverview from '@/components/AdminOperationLogsOverview.vue'
import AdminOperationLogsTableCard from '@/components/AdminOperationLogsTableCard.vue'
import { useOperationLogs } from '@/composables/useOperationLogs'

const {
  handlePageChange,
  handleRefresh,
  handleSearch,
  keyword,
  list,
  loading,
  overviewStats,
  page,
  pageSize,
  total,
  updateKeyword
} = useOperationLogs()
</script>

<template>
  <div class="page-container">
    <AdminOperationLogsHeader
      :keyword="keyword"
      :loading="loading"
      @update:keyword="updateKeyword"
      @search="handleSearch"
      @refresh="handleRefresh"
    />

    <AdminOperationLogsOverview
      :total="total"
      :keyword="keyword"
      :current-count="overviewStats.currentCount"
      :success-count="overviewStats.successCount"
      :failure-count="overviewStats.failureCount"
      :operator-count="overviewStats.operatorCount"
      :module-count="overviewStats.moduleCount"
    />

    <AdminOperationLogsTableCard
      :loading="loading"
      :logs="list"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}
</style>
