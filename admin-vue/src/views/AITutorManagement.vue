<script setup>
import { NTabs, NTabPane } from 'naive-ui'
import { MessageSquareCode, ShieldAlert, Sliders } from 'lucide-vue-next'
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
  auditKeyword,
  auditPage,
  auditPageSize,
  auditTotal,
  cleanupStats,
  currentPrompt,
  currentSessionId,
  currentSessionMeta,
  dashboardStats,
  fetchPrompts,
  formatTime,
  handleAuditPageChange,
  handleAuditSearch,
  handleCleanup,
  handleDeleteSession,
  handleEditPrompt,
  handleManageSensitive,
  handlePageChange,
  handleRefresh,
  handleResolveSession,
  handleSaveConfig,
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
  resolvedFilter,
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
  <div class="admin-page admin-page--wide">
    <AITutorManagementHeader
      :cleanup-stats="cleanupStats"
      :dashboard-stats="dashboardStats"
      @refresh="handleRefresh"
      @cleanup="handleCleanup"
    />

    <section class="ls-panel tutor-panel">
      <n-tabs
        v-model:value="activeTab"
        class="tutor-tabs"
        type="line"
        size="small"
        pane-style="padding: 0"
        @update:value="handleTabChange"
      >
        <n-tab-pane name="conversations">
          <template #tab>
            <span class="tab-item"><MessageSquareCode :size="15" /><span>对话流水</span></span>
          </template>
          <AITutorConversationTab
            :loading="loading"
            :messages="messages"
            :total="total"
            :page="page"
            :page-size="pageSize"
            :keyword="keyword"
            :role-filter="roleFilter"
            :resolved-filter="resolvedFilter"
            @update:keyword="keyword = $event"
            @update:role-filter="roleFilter = $event"
            @update:resolved-filter="resolvedFilter = $event"
            @search="handleSearch"
            @page-change="handlePageChange"
            @view-session="viewSession"
            @resolve-session="handleResolveSession"
            @delete-session="handleDeleteSession"
          />
        </n-tab-pane>

        <n-tab-pane name="audit">
          <template #tab>
            <span class="tab-item"><ShieldAlert :size="15" /><span>敏感内容审计</span></span>
          </template>
          <AITutorAuditTab
            :sensitive-logs="sensitiveLogs"
            :sensitive-loading="sensitiveLoading"
            :audit-keyword="auditKeyword"
            :audit-page="auditPage"
            :audit-page-size="auditPageSize"
            :audit-total="auditTotal"
            @update:audit-keyword="auditKeyword = $event"
            @search="handleAuditSearch"
            @page-change="handleAuditPageChange"
            @manage-sensitive="handleManageSensitive"
          />
        </n-tab-pane>

        <n-tab-pane name="settings">
          <template #tab>
            <span class="tab-item"><Sliders :size="15" /><span>提示词与配置</span></span>
          </template>
          <AITutorSettingsTab
            :prompt-list="promptList"
            :prompt-loading="promptLoading"
            :ai-config="aiConfig"
            @refresh-prompts="fetchPrompts"
            @edit-prompt="handleEditPrompt"
            @update-model="handleUpdateModel"
            @save-config="handleSaveConfig"
          />
        </n-tab-pane>
      </n-tabs>
    </section>

    <AITutorSessionModal
      v-model:show="showSessionModal"
      :session-messages="sessionMessages"
      :session-loading="sessionLoading"
      :current-session-id="currentSessionId"
      :current-session-meta="currentSessionMeta"
      :format-time="formatTime"
      @refresh="viewSession(currentSessionId, currentSessionMeta)"
      @resolve-session="handleResolveSession"
      @delete-session="handleDeleteSession"
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
.tutor-panel {
  overflow: hidden;
}

/* Tab strip sits at the top of the panel with the same 20px gutter as the content below. */
.tutor-tabs :deep(.n-tabs-nav) {
  margin: 0;
  padding: 4px 20px 0;
  border-bottom: 1px solid var(--line);
}

/* The panel rule above replaces Naive's own inset underline. */
.tutor-tabs :deep(.n-tabs-nav-scroll-content) {
  border-bottom: 0 !important;
}

.tutor-tabs :deep(.n-tabs-bar) {
  bottom: -1px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
}
</style>
