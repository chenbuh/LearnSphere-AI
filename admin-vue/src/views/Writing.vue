<script setup>
import AdminWritingHeader from '@/components/AdminWritingHeader.vue'
import AdminWritingTableCard from '@/components/AdminWritingTableCard.vue'
import AdminWritingEditModal from '@/components/AdminWritingEditModal.vue'
import { useAdminWriting } from '@/composables/useAdminWriting'

const {
  columns,
  dataList,
  formData,
  handleAdd,
  handlePageChange,
  handlePageSizeChange,
  handleSave,
  isEdit,
  loading,
  page,
  pageCount,
  pageSize,
  showModal
} = useAdminWriting()
</script>

<template>
  <div class="admin-page admin-page--content">
    <AdminWritingHeader @add="handleAdd" />
    <AdminWritingTableCard
      :columns="columns"
      :data-list="dataList"
      :loading="loading"
      :page="page"
      :page-count="pageCount"
      :page-size="pageSize"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
    <AdminWritingEditModal
      v-model:show="showModal"
      :is-edit="isEdit"
      :form-data="formData"
      @save="handleSave"
    />
  </div>
</template>
