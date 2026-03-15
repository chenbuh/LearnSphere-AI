<script setup>
import { defineAsyncComponent } from 'vue'
import { NButton, NGrid, NGridItem, NIcon, NProgress, NRadioButton, NRadioGroup, NTag } from 'naive-ui'
import { Award, Bell, Check, TrendingUp } from 'lucide-vue-next'
import { useDashboardOverview } from '@/composables/useDashboardOverview'

const DashboardAiInsightPanel = defineAsyncComponent(() => import('@/components/dashboard/DashboardAiInsightPanel.vue'))
const DashboardSidebarPanel = defineAsyncComponent(() => import('@/components/dashboard/DashboardSidebarPanel.vue'))

const {
  aiLogId,
  aiRecLoading,
  aiRecommendations,
  bannerTransform,
  barChartRef,
  chartRange,
  fetchChartData,
  handleCheckIn,
  handleMouseMove,
  isCheckedIn,
  leaderboard,
  lineChartRef,
  nextLevelXP,
  recentActivity,
  stats,
  systemStore,
  t,
  userInfo,
  userLevel,
  userStore,
  xpProgress
} = useDashboardOverview()
</script>

<template>
  <div class="dashboard-container">
    <div v-if="systemStore.configs['sys.announcement']" class="announcement-bar mb-6">
      <div class="flex items-center gap-3">
        <n-icon :component="Bell" color="#f59e0b" :size="20" class="animate-pulse" />
        <div class="announcement-content text-sm" v-html="systemStore.configs['sys.announcement']"></div>
      </div>
    </div>

    <div class="welcome-banner mb-6 flex justify-between items-center flex-wrap gap-4" :style="{ transform: bannerTransform }" @mousemove="handleMouseMove">
      <div class="flex items-center gap-6">
        <div class="level-badge-container">
          <div class="level-ring shadow-glow-indigo"></div>
          <span class="level-num">{{ userLevel }}</span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="m-0 text-white">{{ t('dashboard.welcome', { name: userInfo?.nickname || t('dashboard.learner') }) }}</h2>
            <n-tag v-if="userStore.isVip()" type="success" size="small" round ghost :color="{ textColor: '#fcd34d', borderColor: '#fcd34d' }">
              {{ userStore.getVipLabel() }}
            </n-tag>
          </div>
          <p class="mt-1 opacity-80 text-white/90">{{ t('dashboard.welcomeSub') }}</p>
          <div class="xp-progress-bar mt-3">
            <div class="flex justify-between text-xs mb-1 text-white/70">
              <span>LV.{{ userLevel }}</span>
              <span>{{ userInfo?.points || 0 }} / {{ nextLevelXP }} XP</span>
            </div>
            <n-progress
              type="line"
              :percentage="xpProgress"
              :show-indicator="false"
              color="#fff"
              rail-color="rgba(255, 255, 255, 0.2)"
              :height="6"
              :border-radius="3"
            />
          </div>
        </div>
      </div>
      <n-button
        :type="isCheckedIn ? 'success' : 'warning'"
        secondary
        round
        size="large"
        :disabled="isCheckedIn"
        class="checkin-btn-glass"
        @click="handleCheckIn"
      >
        <template #icon>
          <n-icon :component="isCheckedIn ? Check : Award" />
        </template>
        {{ isCheckedIn ? t('dashboard.checkedIn') : t('dashboard.checkIn') }}
      </n-button>
    </div>

    <n-grid x-gap="24" y-gap="24" cols="1 900:3" responsive="screen">
      <n-grid-item span="2">
        <div class="dashboard-main flex flex-col gap-6">
          <DashboardAiInsightPanel :ai-rec-loading="aiRecLoading" :ai-recommendations="aiRecommendations" :ai-log-id="aiLogId" />

          <n-grid x-gap="16" y-gap="16" cols="2 600:3">
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-orange">
                <div class="stat-label">{{ t('dashboard.streak') }}</div>
                <div class="stat-value">
                  {{ stats.streak.value }}
                  <span class="stat-change info">{{ t('dashboard.days') }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-blue">
                <div class="stat-label">{{ t('dashboard.learningTime') }}</div>
                <div class="stat-value">
                  {{ stats.time.value }}
                  <span class="stat-change success">{{ stats.time.change }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card card-gradient-purple">
                <div class="stat-label">{{ t('dashboard.vocabCoverage') }}</div>
                <div class="stat-value">
                  {{ stats.vocab.value }}
                  <span class="stat-change success">{{ stats.vocab.change }}</span>
                </div>
              </div>
            </n-grid-item>
          </n-grid>

          <div class="chart-card">
            <div class="chart-header flex justify-between items-center">
              <span>{{ t('dashboard.timeDistribution') }}</span>
              <div class="chart-actions">
                <n-radio-group v-model:value="chartRange" size="small" @update:value="fetchChartData">
                  <n-radio-button :value="7" :label="t('dashboard.7days')" />
                  <n-radio-button :value="30" :label="t('dashboard.30days')" />
                </n-radio-group>
              </div>
            </div>
            <div ref="barChartRef" class="chart-body"></div>
          </div>

          <div class="chart-card">
            <div class="chart-header flex justify-between items-center">
              <div class="flex items-center gap-2">
                <n-icon :component="TrendingUp" color="#10b981" /> {{ t('dashboard.accuracyTrend') }}
              </div>
            </div>
            <div ref="lineChartRef" class="chart-body"></div>
          </div>
        </div>
      </n-grid-item>

      <n-grid-item>
        <DashboardSidebarPanel :leaderboard="leaderboard" :recent-activity="recentActivity" />
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.mb-6 {
  margin-bottom: 24px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-3 {
  margin-top: 12px;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}

.gap-6 {
  gap: 24px;
}

.m-0 {
  margin: 0;
}

.announcement-bar {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 16px;
  padding: 12px 20px;
  backdrop-filter: blur(10px);
}

.announcement-content :deep(p) {
  margin: 0;
}

.announcement-content :deep(a) {
  color: #f59e0b;
  text-decoration: underline;
}

.welcome-banner {
  background: linear-gradient(135deg, #4f46e5 0%, #a855f7 100%);
  padding: 32px;
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.2);
  transition: transform 0.1s ease-out;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.level-badge-container {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-ring {
  position: absolute;
  inset: 0;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: rotate 3s linear infinite;
}

.level-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  z-index: 1;
}

.xp-progress-bar {
  width: 300px;
  max-width: 100%;
}

.checkin-btn-glass {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
  font-weight: 600;
}

.checkin-btn-glass:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: translateY(-2px);
}

.dashboard-stat-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.dashboard-stat-card:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.25);
}

.stat-label {
  color: var(--secondary-text);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stat-value {
  color: var(--text-color);
  font-size: 1.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.stat-change.success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.stat-change.info {
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

.chart-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px;
}

.chart-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
  min-height: 32px;
}

.chart-body {
  width: 100%;
  height: 250px;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.card-gradient-orange::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.1), transparent 70%);
  pointer-events: none;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }

  .chart-header {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 10px;
  }

  .chart-actions {
    width: 100%;
    overflow-x: auto;
  }

  .chart-body {
    height: 220px;
  }

  .welcome-banner {
    padding: 24px 20px;
    border-radius: 20px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .welcome-banner > div:first-child {
    flex-direction: column;
    width: 100%;
    gap: 16px;
  }

  .level-badge-container {
    margin: 0 auto;
    transform: scale(1.1);
  }

  .welcome-banner > div:first-child > div:last-child > div:first-child {
    justify-content: center;
    flex-wrap: wrap;
  }

  .welcome-banner h2 {
    font-size: 1.4rem;
    margin-bottom: 4px;
    text-align: center;
  }

  .welcome-banner p {
    font-size: 0.95rem;
    opacity: 0.9;
    margin-bottom: 12px;
  }

  .xp-progress-bar {
    width: 100%;
    margin: 0 auto;
  }

  .checkin-btn-glass {
    width: 100%;
    justify-content: center;
    height: 48px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 8px;
  }

  .dashboard-main .n-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px !important;
  }

  .dashboard-main .n-grid > .n-grid-item:last-child {
    grid-column: span 2;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .welcome-banner h2 {
    font-size: 1.2rem;
  }

  .chart-card {
    padding: 14px;
  }
}

:deep(.n-radio-button.n-radio-button--checked) {
  --n-button-color-active: #6366f1;
  --n-button-text-color-active: white;
  background-color: #6366f1 !important;
  border-color: #6366f1 !important;
}
</style>
