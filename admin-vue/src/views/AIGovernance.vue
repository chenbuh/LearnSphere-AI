<script setup>
import { NButton, NSpace, NTabPane, NTabs } from 'naive-ui'
import { RefreshCcw } from 'lucide-vue-next'
import { useAIGovernanceShell } from '@/composables/useAIGovernanceShell'

const {
  activeTab,
  governanceTabs,
  handleTabChange,
  refreshMonitorTab,
  showMonitorRefresh
} = useAIGovernanceShell()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <header class="page-header">
      <div>
        <h1>AI 治理</h1>
        <p>查看模型运行状态、提示词配置和反馈处理。</p>
      </div>
      <n-space>
        <n-button v-if="showMonitorRefresh" secondary @click="refreshMonitorTab">
          <template #icon><RefreshCcw /></template>
          刷新数据
        </n-button>
      </n-space>
    </header>

    <n-tabs v-model:value="activeTab" type="segment" animated @update:value="handleTabChange">
      <n-tab-pane
        v-for="tab in governanceTabs"
        :key="tab.name"
        :name="tab.name"
        :tab="tab.tab"
      >
        <component
          :is="tab.component"
          v-if="activeTab === tab.name"
          :ref="tab.componentRef"
          v-bind="tab.componentProps"
          v-on="tab.componentEvents"
        />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

:deep(.n-tabs-tab) {
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-tab-pane) {
  animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  height: auto !important;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
