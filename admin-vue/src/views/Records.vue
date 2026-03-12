<script setup>
import AdminRecordsHeaderFilter from '@/components/AdminRecordsHeaderFilter.vue'
import AdminRecordsTableCard from '@/components/AdminRecordsTableCard.vue'
import { useAdminRecords } from '@/composables/useAdminRecords'

const {
  contentType,
  contentTypeOptions,
  handleContentTypeChange,
  handlePageChange,
  loading,
  page,
  pageSize,
  records,
  total
} = useAdminRecords()
</script>

<template>
  <div class="records-page">
    <AdminRecordsHeaderFilter
      :content-type="contentType"
      :content-type-options="contentTypeOptions"
      @update:content-type="handleContentTypeChange"
    />

    <AdminRecordsTableCard
      :loading="loading"
      :records="records"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.records-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
