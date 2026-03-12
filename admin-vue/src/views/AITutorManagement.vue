<script setup>
import { NTabs, NTabPane } from 'naive-ui'
import AITutorManagementHeader from '@/components/AITutorManagementHeader.vue'
import AITutorConversationTab from '@/components/AITutorConversationTab.vue'
import AITutorAuditTab from '@/components/AITutorAuditTab.vue'
import AITutorSettingsTab from '@/components/AITutorSettingsTab.vue'
import AITutorSessionModal from '@/components/AITutorSessionModal.vue'
import AITutorPromptModal from '@/components/AITutorPromptModal.vue'
import { useAITutorManagement } from '@/composables/useAITutorManagement'

const {
  activeTab,
  aiConfig,
  cleanupStats,
  currentPrompt,
  currentSessionId,
  dashboardStats,
  fetchPrompts,
  formatTime,
  handleCleanup,
  handleEditPrompt,
  handleManageSensitive,
  handlePageChange,
  handleRefresh,
  handleSavePrompt,
  handleSearch,
  handleTabChange,
  handleUpdateModel,
  keyword,
  loading,
  messages,
  page,
  pageSize,
  promptList,
  promptLoading,
  roleFilter,
  sensitiveLoading,
  sensitiveLogs,
  sessionLoading,
  sessionMessages,
  showPromptModal,
  showSessionModal,
  total,
  viewSession
} = useAITutorManagement()
</script>

<template>
  <div class="page-container">
    <AITutorManagementHeader
      :cleanup-stats="cleanupStats"
      :dashboard-stats="dashboardStats"
      @refresh="handleRefresh"
      @cleanup="handleCleanup"
    />

    <n-tabs v-model:value="activeTab" type="line" animated @update:value="handleTabChange">
      <n-tab-pane name="conversations" tab="对话流水">
        <AITutorConversationTab
          :loading="loading"
          :messages="messages"
          :total="total"
          :page="page"
          :page-size="pageSize"
          :keyword="keyword"
          :role-filter="roleFilter"
          @update:keyword="keyword = $event"
          @update:role-filter="roleFilter = $event"
          @search="handleSearch"
          @page-change="handlePageChange"
          @view-session="viewSession"
        />
      </n-tab-pane>

      <n-tab-pane name="audit" tab="敏感内容审计">
        <AITutorAuditTab
          :sensitive-logs="sensitiveLogs"
          :sensitive-loading="sensitiveLoading"
          :format-time="formatTime"
          @manage-sensitive="handleManageSensitive"
        />
      </n-tab-pane>

      <n-tab-pane name="settings" tab="提示词与配置">
        <AITutorSettingsTab
          :prompt-list="promptList"
          :prompt-loading="promptLoading"
          :ai-config="aiConfig"
          @refresh-prompts="fetchPrompts"
          @edit-prompt="handleEditPrompt"
          @update-model="handleUpdateModel"
        />
      </n-tab-pane>
    </n-tabs>

    <AITutorSessionModal
      v-model:show="showSessionModal"
      :session-messages="sessionMessages"
      :session-loading="sessionLoading"
      :current-session-id="currentSessionId"
      :format-time="formatTime"
      @refresh="viewSession(currentSessionId)"
    />

    <AITutorPromptModal
      v-model:show="showPromptModal"
      :current-prompt="currentPrompt"
      @update:prompt="currentPrompt = $event"
      @save="handleSavePrompt"
    />
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}
</style>
