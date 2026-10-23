<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NTabPane, NTabs } from 'naive-ui'
import { RefreshCw } from 'lucide-vue-next'
import { useAIGovernanceShell } from '@/composables/useAIGovernanceShell'

const {
  activeTab,
  governanceTabs,
  handleTabChange,
  refreshMonitorTab,
  showMonitorRefresh
} = useAIGovernanceShell()

// Render only the active tab outside v-for so the monitor tab ref stays a single instance.
const activeTabDef = computed(() => governanceTabs.value.find((tab) => tab.name === activeTab.value))
</script>

<template>
  <div class="admin-page admin-page--wide">
    <Teleport to="#page-actions" defer>
      <n-button v-if="showMonitorRefresh" secondary @click="refreshMonitorTab">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新
      </n-button>
    </Teleport>

    <n-tabs
      :value="activeTab"
      type="line"
      size="small"
      class="governance-tabs"
      @update:value="handleTabChange"
    >
      <n-tab-pane
        v-for="tab in governanceTabs"
        :key="tab.name"
        :name="tab.name"
      >
        <template #tab>
          <span class="tab-item">
            <component :is="tab.icon" v-if="tab.icon" :size="15" />
            <span>{{ tab.tab }}</span>
          </span>
        </template>
      </n-tab-pane>
    </n-tabs>

    <component
      :is="activeTabDef.component"
      v-if="activeTabDef"
      :key="activeTabDef.name"
      :ref="activeTabDef.componentRef"
      v-bind="activeTabDef.componentProps"
      v-on="activeTabDef.componentEvents"
    />
  </div>
</template>

<style scoped>
/* Tabs only switch content; the panes themselves render nothing. */
.governance-tabs :deep(.n-tab-pane),
.governance-tabs :deep(.n-tabs-pane-wrapper) {
  display: none;
}

/* The global theme adds 16px under every tab nav; the page grid already provides the 20px gap. */
.governance-tabs :deep(.n-tabs-nav) {
  margin-bottom: 0;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
}
</style>
