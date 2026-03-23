<script setup>
import { computed, defineAsyncComponent } from 'vue'
import AdminDashboardAnalyticsPanel from '@/components/AdminDashboardAnalyticsPanel.vue'
import AdminDashboardHeroHeader from '@/components/AdminDashboardHeroHeader.vue'
import AdminDashboardKpiGrid from '@/components/AdminDashboardKpiGrid.vue'
import AdminDashboardSidebarPanel from '@/components/AdminDashboardSidebarPanel.vue'
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
  <div class="dashboard-v3 admin-page admin-page--dashboard">
    <div class="ambient-glow">
      <div class="blob b-mint"></div>
      <div class="blob b-blue"></div>
      <div class="blob b-ice"></div>
    </div>

    <section class="dashboard-shell">
      <div class="dashboard-main">
        <section class="dashboard-stage">
          <AdminDashboardHeroHeader
            :formatted-date="formattedDate"
            :formatted-time="formattedTime"
            :greeting="greeting"
            :last-sync-label="lastSyncLabel"
            :refreshing="refreshing"
            :system-health="systemHealth"
            :today-new-users="stats.todayNewUsers"
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
          />
        </section>

        <main class="dashboard-content">
          <AdminDashboardAnalyticsPanel
            :content-radar-ref="contentRadarRef"
            :set-content-radar-ref="setContentRadarRef"
            :funnel-chart-ref="funnelChartRef"
            :set-funnel-chart-ref="setFunnelChartRef"
            :user-chart-ref="userChartRef"
            :set-user-chart-ref="setUserChartRef"
          />
        </main>
      </div>

      <aside class="dashboard-aside">
        <AdminDashboardSidebarPanel
          :quick-actions="quickActions"
          :retention-chart-ref="retentionChartRef"
          :set-retention-chart-ref="setRetentionChartRef"
          :retention-data="retentionData"
          :recent-logs="recentLogs"
          @navigate="goToPath"
        />
      </aside>
    </section>

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
  display: grid;
  gap: 24px;
  overflow-x: hidden;
  color: #fff;
}

.dashboard-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 0.9fr);
  gap: 20px;
  align-items: start;
}

.dashboard-main {
  display: grid;
  gap: 20px;
  min-width: 0;
}

.dashboard-aside {
  min-width: 0;
  position: sticky;
  top: 132px;
}

.ambient-glow {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  mask-image: radial-gradient(circle at center, black 40%, transparent 88%);
}

.blob {
  position: absolute;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  filter: blur(160px);
  opacity: 0.12;
}

.b-mint {
  top: -10%;
  right: -4%;
  background: rgba(62, 207, 188, 0.88);
}

.b-blue {
  bottom: -10%;
  left: -5%;
  background: rgba(92, 168, 255, 0.84);
}

.b-ice {
  top: 24%;
  left: 26%;
  width: 280px;
  height: 280px;
  background: rgba(129, 231, 255, 0.64);
}

.dashboard-stage,
.dashboard-content {
  display: grid;
  gap: 20px;
}

@media (max-width: 1200px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .dashboard-aside {
    position: static;
  }
}

@media (max-width: 768px) {
  .blob {
    width: 380px;
    height: 380px;
  }
}
</style>
