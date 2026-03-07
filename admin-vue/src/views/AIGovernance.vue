<script setup>
import { defineAsyncComponent, ref } from 'vue'
import { NButton, NSpace, NTabPane, NTabs } from 'naive-ui'
import { RefreshCcw } from 'lucide-vue-next'

const AIGovernanceMonitorTab = defineAsyncComponent(() => import('@/components/AIGovernanceMonitorTab.vue'))
const AIGovernancePromptTab = defineAsyncComponent(() => import('@/components/AIGovernancePromptTab.vue'))
const AIGovernanceLogsTab = defineAsyncComponent(() => import('@/components/AIGovernanceLogsTab.vue'))
const AIGovernanceExperimentTab = defineAsyncComponent(() => import('@/components/AIGovernanceExperimentTab.vue'))
const AIGovernanceLoopTab = defineAsyncComponent(() => import('@/components/AIGovernanceLoopTab.vue'))
const AIGovernanceSandboxTab = defineAsyncComponent(() => import('@/components/AIGovernanceSandboxTab.vue'))
const AIGovernanceStabilityTab = defineAsyncComponent(() => import('@/components/AIGovernanceStabilityTab.vue'))

const activeTab = ref('monitor')
const monitorTabRef = ref(null)
const latestAiHealth = ref({
  commonErrors: [],
  highFailureActions: [],
  p95: 0,
  p99: 0,
  circuitBreakerStatus: 'CLOSED',
  lastFailoverTime: null,
  activeModel: 'qwen-plus'
})

const handleTabChange = (value) => {
  activeTab.value = value
}

const refreshMonitorTab = () => {
  monitorTabRef.value?.refresh?.()
}

const handleMonitorHealthUpdated = (value) => {
  latestAiHealth.value = value || latestAiHealth.value
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1>AI 治理面板</h1>
        <p>监控 AI 运行状态，管理系统提示词</p>
      </div>
      <n-space>
        <n-button v-if="activeTab === 'monitor'" secondary @click="refreshMonitorTab">
          <template #icon><RefreshCcw /></template>
          刷新数据
        </n-button>
      </n-space>
    </header>

    <n-tabs v-model:value="activeTab" type="segment" animated @update:value="handleTabChange">
      <n-tab-pane name="monitor" tab="全景监控">
        <AIGovernanceMonitorTab
          v-if="activeTab === 'monitor'"
          ref="monitorTabRef"
          @health-updated="handleMonitorHealthUpdated"
        />
      </n-tab-pane>

      <n-tab-pane name="stability" tab="稳定性与工程">
        <AIGovernanceStabilityTab v-if="activeTab === 'stability'" :ai-health="latestAiHealth" />
      </n-tab-pane>

      <n-tab-pane name="prompts" tab="提示词工程">
        <AIGovernancePromptTab v-if="activeTab === 'prompts'" />
      </n-tab-pane>

      <n-tab-pane name="loop" tab="反馈闭环与自进化">
        <AIGovernanceLoopTab v-if="activeTab === 'loop'" />
      </n-tab-pane>

      <n-tab-pane name="sandbox" tab="Prompt 沙箱">
        <AIGovernanceSandboxTab v-if="activeTab === 'sandbox'" />
      </n-tab-pane>

      <n-tab-pane name="logs" tab="运行日志">
        <AIGovernanceLogsTab v-if="activeTab === 'logs'" />
      </n-tab-pane>

      <n-tab-pane name="abtest" tab="A/B 实验室">
        <AIGovernanceExperimentTab v-if="activeTab === 'abtest'" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 100%;
}

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
