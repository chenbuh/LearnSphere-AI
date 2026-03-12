<script setup>
import SystemMonitorHeader from '@/components/SystemMonitorHeader.vue'
import SystemMonitorSummaryGrid from '@/components/SystemMonitorSummaryGrid.vue'
import SystemMonitorResourceGrid from '@/components/SystemMonitorResourceGrid.vue'
import SystemMonitorRuntimeGrid from '@/components/SystemMonitorRuntimeGrid.vue'
import { useSystemMonitor } from '@/composables/useSystemMonitor'

const { fetchMonitorData, info, loading, uptimeLabel } = useSystemMonitor()
</script>

<template>
  <div class="page-container p-6">
    <SystemMonitorHeader :loading="loading" @refresh="fetchMonitorData" />
    <SystemMonitorSummaryGrid :info="info" :uptime-label="uptimeLabel" />
    <SystemMonitorResourceGrid :info="info" />
    <SystemMonitorRuntimeGrid :info="info" />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
