<script setup>
import AdminVocabularyEditModal from '@/components/AdminVocabularyEditModal.vue'
import AdminVocabularyToolbar from '@/components/AdminVocabularyToolbar.vue'
import AdminVocabularyTableCard from '@/components/AdminVocabularyTableCard.vue'
import { useAdminVocabulary } from '@/composables/useAdminVocabulary'

const {
  applySuggestion,
  batchLoading,
  checkingQuality,
  deleteVocab,
  editVocab,
  examType,
  examTypeOptions,
  formData,
  handleAiFill,
  handleAICheck,
  handleBatchAiFill,
  handleDeduplicate,
  handleExamTypeChange,
  handlePageChange,
  handlePageSizeChange,
  handleSearch,
  handleSubmit,
  isEdit,
  keyword,
  loading,
  openAddModal,
  page,
  pageSize,
  qualityCheckResult,
  showModal,
  total,
  updateFormData,
  updateKeyword,
  vocabularyList
} = useAdminVocabulary()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <AdminVocabularyToolbar
      :exam-type="examType"
      :exam-type-options="examTypeOptions"
      :keyword="keyword"
      :batch-loading="batchLoading"
      @update:exam-type="handleExamTypeChange"
      @update:keyword="updateKeyword"
      @search="handleSearch"
      @batch-ai-fill="handleBatchAiFill"
      @deduplicate="handleDeduplicate"
      @add="openAddModal"
    />

    <AdminVocabularyTableCard
      :loading="loading"
      :vocabulary-list="vocabularyList"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @edit="editVocab"
      @delete="deleteVocab"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <AdminVocabularyEditModal
      v-model:show="showModal"
      :is-edit="isEdit"
      :form-data="formData"
      :exam-type-options="examTypeOptions"
      :checking-quality="checkingQuality"
      :quality-check-result="qualityCheckResult"
      @update:form-data="updateFormData"
      @ai-fill="handleAiFill"
      @ai-check="handleAICheck"
      @apply-suggestion="applySuggestion"
      @submit="handleSubmit"
    />
  </div>
</template>
