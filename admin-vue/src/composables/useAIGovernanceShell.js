import { computed, defineAsyncComponent, ref } from 'vue'
import {
  aiGovernanceTabDefs,
  defaultAiGovernanceHealth,
  getAIGovernanceTabBindings
} from '@/utils/aiGovernanceConfig'

const tabComponents = {
  monitor: defineAsyncComponent(() => import('@/components/AIGovernanceMonitorTab.vue')),
  stability: defineAsyncComponent(() => import('@/components/AIGovernanceStabilityTab.vue')),
  prompts: defineAsyncComponent(() => import('@/components/AIGovernancePromptTab.vue')),
  loop: defineAsyncComponent(() => import('@/components/AIGovernanceLoopTab.vue')),
  sandbox: defineAsyncComponent(() => import('@/components/AIGovernanceSandboxTab.vue')),
  logs: defineAsyncComponent(() => import('@/components/AIGovernanceLogsTab.vue')),
  abtest: defineAsyncComponent(() => import('@/components/AIGovernanceExperimentTab.vue'))
}

export function useAIGovernanceShell() {
  const activeTab = ref('monitor')
  const monitorTabRef = ref(null)
  const latestAiHealth = ref({ ...defaultAiGovernanceHealth })

  const showMonitorRefresh = computed(() => activeTab.value === 'monitor')

  const governanceTabs = computed(() =>
    aiGovernanceTabDefs.map((tab) => ({
      ...tab,
      component: tabComponents[tab.componentKey],
      ...getAIGovernanceTabBindings(tab.name, {
        latestAiHealth: latestAiHealth.value,
        monitorTabRef,
        onHealthUpdated: handleMonitorHealthUpdated
      })
    }))
  )

  const handleTabChange = (value) => {
    activeTab.value = value
  }

  const refreshMonitorTab = () => {
    monitorTabRef.value?.refresh?.()
  }

  const handleMonitorHealthUpdated = (value) => {
    latestAiHealth.value = value || latestAiHealth.value
  }

  return {
    activeTab,
    governanceTabs,
    handleTabChange,
    refreshMonitorTab,
    showMonitorRefresh
  }
}
