<script setup>
import AdminContentHeader from '@/components/AdminContentHeader.vue'
import AdminContentTablePanel from '@/components/AdminContentTablePanel.vue'
import AdminContentEditModal from '@/components/AdminContentEditModal.vue'
import AdminContentAuditReport from '@/components/AdminContentAuditReport.vue'
import {
  aiToolOptions,
  difficultyOptions,
  grammarTopicOptions,
  listeningTypeOptions,
  readingCategoryOptions,
  speakingTypeOptions
} from '@/utils/adminContentConfig'
import { useAdminContent } from '@/composables/useAdminContent'

const {
  activeTab,
  auditResult,
  columns,
  fetchData,
  formData,
  getModuleName,
  grammarList,
  handleAdd,
  handleAiToolSelect,
  handleBatchAudit,
  handlePageChange,
  handleSave,
  handleTabChange,
  isEdit,
  listeningList,
  loading,
  page,
  pageSize,
  readingList,
  showAuditModal,
  showModal,
  speakingList,
  total
} = useAdminContent()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <AdminContentHeader
      :active-tab="activeTab"
      :loading="loading"
      :module-name="getModuleName(activeTab)"
      @batch-audit="handleBatchAudit"
      @add="handleAdd"
    />

    <AdminContentTablePanel
      :active-tab="activeTab"
      :listening-list="listeningList"
      :reading-list="readingList"
      :grammar-list="grammarList"
      :speaking-list="speakingList"
      :listening-columns="columns.listening"
      :reading-columns="columns.reading"
      :grammar-columns="columns.grammar"
      :speaking-columns="columns.speaking"
      :loading="loading"
      :page="page"
      :page-count="Math.ceil(total / pageSize)"
      @tab-change="handleTabChange"
      @page-change="handlePageChange"
    />

    <AdminContentEditModal
      :show="showModal"
      :title="isEdit ? `编辑${getModuleName(activeTab)}` : `添加${getModuleName(activeTab)}`"
      :active-tab="activeTab"
      :form-data="formData"
      :ai-tool-options="aiToolOptions"
      :listening-type-options="listeningTypeOptions"
      :reading-category-options="readingCategoryOptions"
      :grammar-topic-options="grammarTopicOptions"
      :speaking-type-options="speakingTypeOptions"
      :difficulty-options="difficultyOptions"
      @update:show="showModal = $event"
      @ai-tool-select="handleAiToolSelect"
      @save="handleSave"
    />

    <AdminContentAuditReport
      :show="showAuditModal"
      :audit-result="auditResult"
      @update:show="showAuditModal = $event"
    />
  </div>
</template>
