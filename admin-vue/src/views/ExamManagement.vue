<script setup>
import AdminExamDetailModal from '@/components/AdminExamDetailModal.vue'
import AdminExamManagementToolbar from '@/components/AdminExamManagementToolbar.vue'
import AdminExamManagementTableTabs from '@/components/AdminExamManagementTableTabs.vue'
import { useExamManagement } from '@/composables/useExamManagement'

const {
  currentExam,
  examPage,
  examPageSize,
  exams,
  fetchExamDetail,
  handleDeleteExam,
  handleExamPageChange,
  handleExamPageSizeChange,
  handleRecordPageChange,
  handleRecordPageSizeChange,
  handleSearch,
  handleTabChange,
  keyword,
  loading,
  modalLoading,
  recordPage,
  recordPageSize,
  records,
  selectedTab,
  showDetailModal,
  totalExams,
  totalRecords,
  updateKeyword
} = useExamManagement()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <AdminExamManagementToolbar
      :selected-tab="selectedTab"
      :keyword="keyword"
      @update:keyword="updateKeyword"
      @search="handleSearch"
    />

    <AdminExamManagementTableTabs
      :selected-tab="selectedTab"
      :exams="exams"
      :records="records"
      :loading="loading"
      :exam-page="examPage"
      :exam-page-size="examPageSize"
      :total-exams="totalExams"
      :record-page="recordPage"
      :record-page-size="recordPageSize"
      :total-records="totalRecords"
      @tab-change="handleTabChange"
      @exam-detail="fetchExamDetail"
      @exam-delete="handleDeleteExam"
      @exam-page-change="handleExamPageChange"
      @exam-page-size-change="handleExamPageSizeChange"
      @record-page-change="handleRecordPageChange"
      @record-page-size-change="handleRecordPageSizeChange"
    />

    <AdminExamDetailModal
      v-model:show="showDetailModal"
      :loading="modalLoading"
      :exam="currentExam"
    />
  </div>
</template>
