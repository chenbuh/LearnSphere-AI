<script setup>
import { computed, defineAsyncComponent } from 'vue'
import AdminDashboardAnalyticsPanel from '@/components/AdminDashboardAnalyticsPanel.vue'
import AdminDashboardHeroHeader from '@/components/AdminDashboardHeroHeader.vue'
import AdminDashboardKpiGrid from '@/components/AdminDashboardKpiGrid.vue'
import AdminDashboardSidebarPanel from '@/components/AdminDashboardSidebarPanel.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const AdminDashboardBriefingModal = defineAsyncComponent(
  () => import('@/components/AdminDashboardBriefingModal.vue')
)

const {
  aiStats,
  briefingData,
  briefingLoading,
  contentRadarRef,
  setContentRadarRef,
  fetchAllStats,
  financeStats,
  funnelChartRef,
  setFunnelChartRef,
  generateBriefing,
  goToPath,
  lastUpdateTime,
  onlineUsers,
  quickActions,
  recentLogs,
  refreshing,
  retentionChartRef,
  setRetentionChartRef,
  retentionData,
  showBriefingModal,
  skeletonLoading,
  stats,
  systemHealth,
  userChartRef,
  setUserChartRef
} = useAdminDashboard()

const lastSyncLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(lastUpdateTime.value)
)
</script>

<template>
  <div class="admin-page admin-page--wide">
    <AdminDashboardHeroHeader
      :refreshing="refreshing"
      @briefing="generateBriefing"
      @navigate="goToPath"
      @refresh="fetchAllStats(false)"
    />

    <AdminDashboardKpiGrid
      :skeleton-loading="skeletonLoading"
      :stats="stats"
      :finance-stats="financeStats"
      :ai-stats="aiStats"
      :online-users="onlineUsers"
      :system-health="systemHealth"
      :last-sync-label="lastSyncLabel"
    />

    <!-- One 3-column grid: every panel edge snaps to the same column lines. -->
    <div class="dash-grid">
      <AdminDashboardAnalyticsPanel
        :content-radar-ref="contentRadarRef"
        :set-content-radar-ref="setContentRadarRef"
        :funnel-chart-ref="funnelChartRef"
        :set-funnel-chart-ref="setFunnelChartRef"
        :user-chart-ref="userChartRef"
        :set-user-chart-ref="setUserChartRef"
      />

      <AdminDashboardSidebarPanel
        :quick-actions="quickActions"
        :retention-chart-ref="retentionChartRef"
        :set-retention-chart-ref="setRetentionChartRef"
        :retention-data="retentionData"
        :recent-logs="recentLogs"
        @navigate="goToPath"
      />
    </div>

    <AdminDashboardBriefingModal
      v-model:show="showBriefingModal"
      :loading="briefingLoading"
      :briefing-data="briefingData"
    />
  </div>
</template>

<style scoped>
.dash-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    'trend trend actions'
    'radar funnel retention'
    'logs logs logs';
  gap: 20px;
  align-items: stretch;
}

@media (max-width: 1100px) {
  .dash-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'trend trend'
      'actions retention'
      'radar funnel'
      'logs logs';
  }
}

@media (max-width: 768px) {
  .dash-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'trend'
      'actions'
      'retention'
      'radar'
      'funnel'
      'logs';
  }
}
</style>
