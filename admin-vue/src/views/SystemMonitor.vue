<script setup>
import SystemMonitorHeader from '@/components/SystemMonitorHeader.vue'
import SystemMonitorSummaryGrid from '@/components/SystemMonitorSummaryGrid.vue'
import SystemMonitorResourceGrid from '@/components/SystemMonitorResourceGrid.vue'
import SystemMonitorRuntimeGrid from '@/components/SystemMonitorRuntimeGrid.vue'
import { useSystemMonitor } from '@/composables/useSystemMonitor'

const { fetchMonitorData, info, loading, uptimeLabel } = useSystemMonitor()
</script>

<template>
  <div class="admin-page admin-page--wide">
    <SystemMonitorHeader :loading="loading" @refresh="fetchMonitorData" />
    <SystemMonitorSummaryGrid :info="info" :uptime-label="uptimeLabel" />
    <div class="ls-grid-3 monitor-grid">
      <SystemMonitorResourceGrid :info="info" />
      <SystemMonitorRuntimeGrid :info="info" />
    </div>
  </div>
</template>

<style scoped>
.monitor-grid {
  align-items: stretch;
}
</style>
