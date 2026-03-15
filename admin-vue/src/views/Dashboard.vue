<script setup>
import { defineAsyncComponent } from 'vue'
import AdminDashboardAnalyticsPanel from '@/components/AdminDashboardAnalyticsPanel.vue'
import AdminDashboardHeroHeader from '@/components/AdminDashboardHeroHeader.vue'
import AdminDashboardKpiGrid from '@/components/AdminDashboardKpiGrid.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const AdminDashboardBriefingModal = defineAsyncComponent(() => import('@/components/AdminDashboardBriefingModal.vue'))

const {
  aiStats,
  briefingData,
  briefingLoading,
  contentRadarRef,
  setContentRadarRef,
  fetchAllStats,
  financeStats,
  formattedDate,
  formattedTime,
  funnelChartRef,
  setFunnelChartRef,
  generateBriefing,
  goToPath,
  greeting,
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
  userChartRef,
  setUserChartRef
} = useAdminDashboard()
</script>

<template>
  <div class="dashboard-v3">
    <div class="ambient-glow">
      <div class="blob b-purple"></div>
      <div class="blob b-blue"></div>
      <div class="blob b-gold"></div>
    </div>

    <AdminDashboardHeroHeader
      :formatted-date="formattedDate"
      :formatted-time="formattedTime"
      :greeting="greeting"
      :refreshing="refreshing"
      :today-new-users="stats.todayNewUsers"
      @briefing="generateBriefing"
      @navigate="goToPath"
      @refresh="fetchAllStats(false)"
    />

    <main class="dashboard-content">
      <AdminDashboardKpiGrid
        :skeleton-loading="skeletonLoading"
        :stats="stats"
        :finance-stats="financeStats"
        :ai-stats="aiStats"
        :online-users="onlineUsers"
      />

      <AdminDashboardAnalyticsPanel
        :content-radar-ref="contentRadarRef"
        :set-content-radar-ref="setContentRadarRef"
        :funnel-chart-ref="funnelChartRef"
        :set-funnel-chart-ref="setFunnelChartRef"
        :quick-actions="quickActions"
        :recent-logs="recentLogs"
        :retention-chart-ref="retentionChartRef"
        :set-retention-chart-ref="setRetentionChartRef"
        :retention-data="retentionData"
        :user-chart-ref="userChartRef"
        :set-user-chart-ref="setUserChartRef"
        @navigate="goToPath"
      />
    </main>

    <AdminDashboardBriefingModal
      v-model:show="showBriefingModal"
      :loading="briefingLoading"
      :briefing-data="briefingData"
    />
  </div>
</template>

<style scoped>
.dashboard-v3 {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  overflow-x: hidden;
  background: #09090b;
  color: #fff;
  font-family: 'Inter', -apple-system, sans-serif;
}

.ambient-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.12;
}

.b-purple {
  top: -10%;
  right: -5%;
  background: #8b5cf6;
}

.b-blue {
  bottom: -10%;
  left: -5%;
  background: #3b82f6;
}

.b-gold {
  top: 30%;
  left: 20%;
  width: 300px;
  height: 300px;
  background: #f59e0b;
}

@media (max-width: 768px) {
  .dashboard-v3 {
    padding: 16px;
  }
}
</style>
