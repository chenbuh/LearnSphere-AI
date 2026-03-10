<script setup>
import { defineAsyncComponent } from 'vue'
import { NBadge, NButton, NDivider, NGrid, NGridItem, NSpace, NTooltip } from 'naive-ui'
import { Bell, Brain, Filter, RefreshCw, Sparkles, TrendingUp } from 'lucide-vue-next'
import AdminDashboardKpiGrid from '@/components/AdminDashboardKpiGrid.vue'
import AdminDashboardSidebarPanel from '@/components/AdminDashboardSidebarPanel.vue'
import { useAdminDashboard } from '@/composables/useAdminDashboard'

const AdminDashboardBriefingModal = defineAsyncComponent(() => import('@/components/AdminDashboardBriefingModal.vue'))

const {
  aiStats,
  briefingData,
  briefingLoading,
  contentRadarRef,
  fetchAllStats,
  financeStats,
  formattedDate,
  formattedTime,
  funnelChartRef,
  generateBriefing,
  goToPath,
  greeting,
  onlineUsers,
  quickActions,
  recentLogs,
  refreshing,
  retentionChartRef,
  retentionData,
  showBriefingModal,
  skeletonLoading,
  stats,
  userChartRef
} = useAdminDashboard()

const bindRetentionChartRef = element => {
  retentionChartRef.value = element
}
</script>

<template>
  <div class="dashboard-v3">
    <div class="ambient-glow">
      <div class="blob b-purple"></div>
      <div class="blob b-blue"></div>
      <div class="blob b-gold"></div>
    </div>

    <header class="dashboard-header animate-slide-down">
      <div class="header-content">
        <div class="left-hero">
          <div class="status-indicator">
            <div class="pulse-ring"></div>
            <div class="pulse-dot"></div>
          </div>
          <div class="greeting-box">
            <h1 class="hero-title">{{ greeting }}，<span>管理员</span></h1>
            <p class="hero-subtitle">系统运行状态良好，今日已有 {{ stats.todayNewUsers }} 位新学员加入</p>
          </div>
        </div>

        <div class="right-info">
          <n-button type="primary" secondary round class="glass-btn" @click="generateBriefing">
            <template #icon><Sparkles :size="16" /></template>
            AI 简报
          </n-button>
          <div class="realtime-clock">
            <span class="time">{{ formattedTime }}</span>
            <span class="date">{{ formattedDate }}</span>
          </div>
          <n-divider vertical />
          <n-space :size="12">
            <n-tooltip trigger="hover">
              <template #trigger>
                <div class="icon-trigger glass-effect" @click="fetchAllStats(false)">
                  <RefreshCw :size="18" :class="refreshing ? 'animate-spin' : ''" />
                </div>
              </template>
              刷新全局数据
            </n-tooltip>
            <n-badge dot color="#ef4444">
              <div class="icon-trigger glass-effect" @click="goToPath('/notifications')">
                <Bell :size="18" />
              </div>
            </n-badge>
          </n-space>
        </div>
      </div>
    </header>

    <main class="dashboard-content">
      <AdminDashboardKpiGrid
        :skeleton-loading="skeletonLoading"
        :stats="stats"
        :finance-stats="financeStats"
        :ai-stats="aiStats"
        :online-users="onlineUsers"
      />

      <n-grid :cols="12" :x-gap="20" :y-gap="20">
        <n-grid-item :span="8">
          <div class="p-card chart-main">
            <div class="card-title">
              <TrendingUp :size="18" />
              <span>用户活跃趋势分析</span>
              <n-space :size="8" class="ml-auto">
                <n-button quaternary size="tiny" round>15天</n-button>
                <n-button secondary type="primary" size="tiny" round>30天</n-button>
              </n-space>
            </div>
            <div ref="userChartRef" class="chart-box-large"></div>
          </div>

          <n-grid :cols="2" :x-gap="20" class="mt-5">
            <n-grid-item>
              <div class="p-card chart-sub">
                <div class="card-title"><Brain :size="18" /><span>内容库分布图</span></div>
                <div ref="contentRadarRef" class="chart-box-medium"></div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="p-card chart-sub">
                <div class="card-title"><Filter :size="18" /><span>核心转化漏斗</span></div>
                <div ref="funnelChartRef" class="chart-box-medium"></div>
              </div>
            </n-grid-item>
          </n-grid>
        </n-grid-item>

        <n-grid-item :span="4">
          <AdminDashboardSidebarPanel
            :quick-actions="quickActions"
            :retention-data="retentionData"
            :recent-logs="recentLogs"
            :bind-retention-chart-ref="bindRetentionChartRef"
            @navigate="goToPath"
          />
        </n-grid-item>
      </n-grid>
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

.dashboard-header {
  margin-bottom: 28px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.left-hero {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.hero-title span {
  background: linear-gradient(to right, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  margin-top: 4px;
  color: #71717a;
  font-size: 14px;
}

.right-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.realtime-clock {
  margin-right: 4px;
  text-align: right;
}

.realtime-clock .time {
  display: block;
  font-size: 24px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.realtime-clock .date {
  color: #71717a;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.p-card {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.p-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #e4e4e7;
  font-size: 15px;
  font-weight: 700;
}

.chart-box-large {
  height: 320px;
}

.chart-box-medium {
  height: 260px;
}

.status-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.pulse-dot {
  position: relative;
  z-index: 2;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
}

.pulse-ring {
  position: absolute;
  width: 24px;
  height: 24px;
  background: rgba(16, 185, 129, 0.3);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.icon-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  cursor: pointer;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.glass-effect:hover,
.glass-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.glass-btn {
  border-color: rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.12);
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

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }

  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .header-content {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .right-info {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .dashboard-v3 {
    padding: 16px;
  }

  .hero-title {
    font-size: 24px;
  }

  .right-info {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .realtime-clock {
    margin-right: 0;
    text-align: left;
  }

  .chart-box-large {
    height: 280px;
  }

  .chart-box-medium {
    height: 220px;
  }
}
</style>
