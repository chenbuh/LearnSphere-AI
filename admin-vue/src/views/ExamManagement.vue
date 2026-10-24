<script setup>
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { ClipboardCheck, FileText, Plus } from 'lucide-vue-next'
import AdminExamDetailModal from '@/components/AdminExamDetailModal.vue'
import AdminExamEditModal from '@/components/AdminExamEditModal.vue'
import AdminExamManagementToolbar from '@/components/AdminExamManagementToolbar.vue'
import AdminExamManagementTableTabs from '@/components/AdminExamManagementTableTabs.vue'
import { useExamManagement } from '@/composables/useExamManagement'

const {
  currentExam,
  examPage,
  examPageSize,
  exams,
  fetchExamDetail,
  fetchExams,
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

const showEditModal = ref(false)
const editingExamId = ref(null)

const openEditor = (id = null) => {
  editingExamId.value = id
  showEditModal.value = true
}
</script>

<template>
  <div class="admin-page admin-page--wide">
    <Teleport to="#page-actions" defer>
      <n-button type="primary" @click="openEditor()">
        <template #icon><Plus :size="16" /></template>
        新建试卷
      </n-button>
    </Teleport>

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
      @exam-edit="openEditor"
      @exam-delete="handleDeleteExam"
      @exam-page-change="handleExamPageChange"
      @exam-page-size-change="handleExamPageSizeChange"
      @record-page-change="handleRecordPageChange"
      @record-page-size-change="handleRecordPageSizeChange"
    >
      <template #filter>
        <AdminExamManagementToolbar
          :selected-tab="selectedTab"
          :keyword="keyword"
          @update:keyword="updateKeyword"
          @search="handleSearch"
        />
      </template>
    </AdminExamManagementTableTabs>

    <AdminExamEditModal v-model:show="showEditModal" :exam-id="editingExamId" @saved="fetchExams" />

    <AdminExamDetailModal
      v-model:show="showDetailModal"
      :loading="modalLoading"
      :exam="currentExam"
    />
  </div>
</template>
