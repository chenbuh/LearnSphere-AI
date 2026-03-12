<script setup>
import AIFeedbackAuditHeader from '@/components/AIFeedbackAuditHeader.vue'
import AIFeedbackAuditTableCard from '@/components/AIFeedbackAuditTableCard.vue'
import AIFeedbackAuditModal from '@/components/AIFeedbackAuditModal.vue'
import {
  feedbackRatingOptions,
  feedbackStatusOptions
} from '@/utils/aiFeedbackAuditConfig'
import { useAIFeedbackAudit } from '@/composables/useAIFeedbackAudit'

const {
  auditForm,
  auditLoading,
  columns,
  currentFeedback,
  fetchData,
  handlePageChange,
  list,
  loading,
  page,
  pageSize,
  ratingFilter,
  showAuditModal,
  statusFilter,
  submitAudit,
  total,
  updateRatingFilter,
  updateStatusFilter
} = useAIFeedbackAudit()
</script>

<template>
  <div class="page-container">
    <AIFeedbackAuditHeader
      :rating-filter="ratingFilter"
      :status-filter="statusFilter"
      :rating-options="feedbackRatingOptions"
      :status-options="feedbackStatusOptions"
      @update:rating-filter="updateRatingFilter"
      @update:status-filter="updateStatusFilter"
      @refresh="fetchData"
    />

    <AIFeedbackAuditTableCard
      :total="total"
      :columns="columns"
      :list="list"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      @update:page="handlePageChange"
    />

    <AIFeedbackAuditModal
      :show="showAuditModal"
      :current-feedback="currentFeedback"
      :audit-form="auditForm"
      :audit-loading="auditLoading"
      :status-options="feedbackStatusOptions"
      @update:show="showAuditModal = $event"
      @submit="submitAudit"
    />
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}
</style>
