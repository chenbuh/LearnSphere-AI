<script setup>
import AdminSpeakingHeader from '@/components/AdminSpeakingHeader.vue'
import AdminSpeakingTableCard from '@/components/AdminSpeakingTableCard.vue'
import AdminSpeakingEditModal from '@/components/AdminSpeakingEditModal.vue'
import { useAdminSpeaking } from '@/composables/useAdminSpeaking'

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
} = useAdminSpeaking()
</script>

<template>
  <div class="admin-page admin-page--content">
    <AdminSpeakingHeader @add="handleAdd" />
    <AdminSpeakingTableCard
      :columns="columns"
      :data-list="dataList"
      :loading="loading"
      :page="page"
      :page-count="pageCount"
      :page-size="pageSize"
      @update:page="handlePageChange"
      @update:page-size="handlePageSizeChange"
    />
    <AdminSpeakingEditModal
      v-model:show="showModal"
      :is-edit="isEdit"
      :form-data="formData"
      @save="handleSave"
    />
  </div>
</template>
