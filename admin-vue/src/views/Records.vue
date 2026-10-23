<script setup>
import { useMessage } from 'naive-ui'
import AdminRecordsHeaderFilter from '@/components/AdminRecordsHeaderFilter.vue'
import AdminRecordsTableCard from '@/components/AdminRecordsTableCard.vue'
import { useAdminRecords } from '@/composables/useAdminRecords'

const message = useMessage()

const {
  contentType,
  contentTypeOptions,
  userId,
  handleContentTypeChange,
  handlePageChange,
  handleSearch,
  handleReset,
  fetchRecords,
  loading,
  page,
  pageSize,
  records,
  total
} = useAdminRecords()

const handleExport = () => {
  message.info('正在生成当前筛选范围的学习记录导出文件...')
}
</script>

<template>
  <div class="records-page admin-page admin-page--wide">
    <!-- 头部动作栏与 4 个 KPI 指标卡片 (结构与用户管理、学习内容保持一致) -->
    <AdminRecordsHeaderFilter
      :content-type="contentType"
      :content-type-options="contentTypeOptions"
      :user-id="userId"
      :records="records"
      :total="total"
      :loading="loading"
      @update:content-type="handleContentTypeChange"
      @update:user-id="userId = $event"
      @search="handleSearch"
      @reset="handleReset"
      @refresh="fetchRecords"
      @export="handleExport"
    />

    <!-- 数据主面板 -->
    <section class="ls-panel records-main-panel">
      <AdminRecordsTableCard
        :loading="loading"
        :records="records"
        :total="total"
        :page="page"
        :page-size="pageSize"
        @page-change="handlePageChange"
      />
    </section>
  </div>
</template>

<style scoped>
.records-page {
  gap: 16px;
}
.records-main-panel {
  overflow: hidden;
}
</style>
