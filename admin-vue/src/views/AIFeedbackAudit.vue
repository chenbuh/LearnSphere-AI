<script setup>
import { AlertCircle, ThumbsUp } from 'lucide-vue-next'
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
  refreshAll,
  showAuditModal,
  statusFilter,
  submitAudit,
  summary,
  total,
  updateRatingFilter,
  updateStatusFilter
} = useAIFeedbackAudit()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <section class="ls-stats" aria-label="反馈摘要">
      <div class="ls-stat" :class="{ 'ls-stat--warn': summary.pending > 0 }">
        <span class="ls-stat__label"><AlertCircle :size="14" />待处理反馈</span>
        <strong class="ls-stat__value">{{ summary.pending }}</strong>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><ThumbsUp :size="14" />正向反馈率</span>
        <strong v-if="summary.positiveRate != null" class="ls-stat__value">{{ summary.positiveRate }}<small>%</small></strong>
        <strong v-else class="ls-stat__value">—</strong>
      </div>
    </section>

    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">反馈队列 <span class="ls-panel__count">共 {{ total }} 条</span></h2>
      </header>

      <AIFeedbackAuditHeader
        :rating-filter="ratingFilter"
        :status-filter="statusFilter"
        :rating-options="feedbackRatingOptions"
        :status-options="feedbackStatusOptions"
        @update:rating-filter="updateRatingFilter"
        @update:status-filter="updateStatusFilter"
        @refresh="refreshAll"
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
    </section>

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
