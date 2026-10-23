<script setup>
import { defineAsyncComponent } from 'vue'
import { NButton, NGrid, NGridItem, NIcon, NProgress, NRadioButton, NRadioGroup, NTag } from 'naive-ui'
import { Award, Bell, BookOpen, Check, Clock, Flame, TrendingUp } from 'lucide-vue-next'
import { useDashboardOverview } from '@/composables/useDashboardOverview'

const DashboardAiInsightPanel = defineAsyncComponent(() => import('@/components/dashboard/DashboardAiInsightPanel.vue'))
const DashboardSidebarPanel = defineAsyncComponent(() => import('@/components/dashboard/DashboardSidebarPanel.vue'))

const {
  aiLogId,
  aiRecLoading,
  aiRecommendations,
  barChartRef,
  chartRange,
  fetchChartData,
  handleCheckIn,
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
        <n-icon :component="Bell" :size="18" class="announcement-icon" />
        <div class="announcement-content text-sm" v-html="systemStore.configs['sys.announcement']"></div>
      </div>
    </div>

    <div class="welcome-banner mb-6 flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-6">
        <div class="level-badge-container">
          <span class="level-caption">LV</span>
          <span class="level-num">{{ userLevel }}</span>
        </div>
        <div class="welcome-copy">
          <div class="flex items-center gap-2">
            <h2 class="m-0 welcome-title">{{ t('dashboard.welcome', { name: userInfo?.nickname || t('dashboard.learner') }) }}</h2>
            <n-tag v-if="userStore.isVip()" type="success" size="small" :bordered="false">
              {{ userStore.getVipLabel() }}
            </n-tag>
          </div>
          <p class="mt-1 opacity-80 welcome-subtitle">{{ t('dashboard.welcomeSub') }}</p>
          <div class="xp-progress-bar mt-3">
            <div class="welcome-progress-meta flex justify-between text-xs mb-1">
              <span>LV.{{ userLevel }}</span>
              <span>{{ userInfo?.points || 0 }} / {{ nextLevelXP }} XP</span>
            </div>
            <n-progress
              type="line"
              :percentage="xpProgress"
              :show-indicator="false"
              color="var(--brand)"
              rail-color="var(--surface-muted)"
              :height="6"
              :border-radius="3"
            />
          </div>
        </div>
      </div>
      <n-button
        :type="isCheckedIn ? 'default' : 'primary'"
        :secondary="isCheckedIn"
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

          <n-grid x-gap="12" y-gap="12" cols="3">
            <n-grid-item>
              <div class="dashboard-stat-card">
                <div class="stat-header-row">
                  <span class="stat-label">{{ t('dashboard.streak') }}</span>
                  <span class="stat-icon-badge stat-icon-badge--orange"><Flame :size="15" /></span>
                </div>
                <div class="stat-value">
                  {{ stats.streak.value }}
                  <span class="stat-change info">{{ t('dashboard.days') }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card">
                <div class="stat-header-row">
                  <span class="stat-label">{{ t('dashboard.learningTime') }}</span>
                  <span class="stat-icon-badge stat-icon-badge--blue"><Clock :size="15" /></span>
                </div>
                <div class="stat-value">
                  {{ stats.time.value }}
                  <span class="stat-change success">{{ stats.time.change }}</span>
                </div>
              </div>
            </n-grid-item>
            <n-grid-item>
              <div class="dashboard-stat-card">
                <div class="stat-header-row">
                  <span class="stat-label">{{ t('dashboard.vocabCoverage') }}</span>
                  <span class="stat-icon-badge stat-icon-badge--purple"><BookOpen :size="15" /></span>
                </div>
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
                <n-icon :component="TrendingUp" class="chart-title-icon" /> {{ t('dashboard.accuracyTrend') }}
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
  padding-inline: max(0px, env(safe-area-inset-left)) max(0px, env(safe-area-inset-right));
  padding-bottom: env(safe-area-inset-bottom);
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
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-left: 3px solid var(--accent-warm);
  border-radius: var(--radius-md);
  padding: 10px 16px;
}

.announcement-icon {
  color: var(--accent-warm);
  flex-shrink: 0;
}

.announcement-content :deep(p) {
  margin: 0;
}

.announcement-content {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--text-color);
}

.announcement-content :deep(a) {
  color: var(--brand);
  text-decoration: underline;
  font-weight: 600;
}

.welcome-banner {
  background: var(--card-bg);
  padding: 24px 28px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  color: var(--text-color);
}

.level-badge-container {
  width: 56px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  background: var(--brand-soft);
  color: var(--brand);
}

.level-caption {
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1;
}

.level-num {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}

.welcome-title {
  color: var(--text-color);
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.welcome-subtitle {
  color: var(--secondary-text);
  font-size: 0.92rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
  opacity: 1;
}

.welcome-progress-meta {
  color: var(--secondary-text);
  font-variant-numeric: tabular-nums;
}

.welcome-copy {
  min-width: 0;
}

.xp-progress-bar {
  width: 320px;
  max-width: 100%;
}

.checkin-btn-glass {
  font-weight: 600;
}

.dashboard-stat-card,
.chart-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
}

.dashboard-stat-card {
  padding: 18px 20px;
}

.stat-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-label {
  color: var(--secondary-text);
  font-size: 0.85rem;
}

.stat-icon-badge {
  display: inline-flex;
  color: var(--secondary-text);
}

.stat-icon-badge--orange {
  color: var(--accent-warm);
}

.stat-value {
  color: var(--text-color);
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--secondary-text);
  font-variant-numeric: tabular-nums;
}

.stat-change.success {
  color: var(--brand);
}

.chart-card {
  padding: 20px 24px;
}

.chart-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
  min-height: 32px;
}

.chart-title-icon {
  color: var(--brand);
}

.chart-body {
  width: 100%;
  height: 250px;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px max(12px, env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
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

  .announcement-bar {
    padding: 12px 14px;
  }

  .announcement-bar > div {
    align-items: flex-start;
  }

  .chart-body {
    height: 220px;
  }

  .welcome-banner {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .welcome-banner > div:first-child {
    width: 100%;
    gap: 14px;
    align-items: flex-start;
  }

  .welcome-copy {
    flex: 1;
    min-width: 0;
  }

  .dashboard-stat-card {
    min-height: 0;
    padding: 12px;
  }

  .stat-icon-badge {
    display: none;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 1.25rem;
    margin-top: 6px;
  }

  .welcome-banner h2 {
    font-size: 1.15rem;
  }

  .welcome-banner p {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .xp-progress-bar {
    width: 100%;
  }

  .welcome-progress-meta {
    gap: 10px;
    flex-wrap: wrap;
  }

  .checkin-btn-glass {
    width: 100%;
    justify-content: center;
    height: 44px;
  }

  /* 「查看所有历史」在侧栏子组件里，size="small" 实测仅 28px 高，补足触控目标 */
  :deep(.mt-4.text-center) > .n-button {
    min-height: 32px;
    min-width: 32px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 8px max(8px, env(safe-area-inset-right)) calc(12px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
  }

  .announcement-bar {
    padding: 10px 12px;
  }

  .stat-change {
    display: block;
    margin: 2px 0 0;
    font-size: 11px;
  }

  .welcome-banner {
    padding: 14px;
    gap: 14px;
  }

  .chart-card {
    padding: 14px 12px;
  }

  .chart-header {
    gap: 8px;
  }

  .chart-actions {
    width: calc(100% + 4px);
    margin-inline: -2px;
    padding-bottom: 4px;
  }

}

@media (max-width: 420px) {
  .level-badge-container {
    width: 48px;
    height: 48px;
  }

  .level-num {
    font-size: 1.25rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .dashboard-container {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }

  .welcome-banner {
    padding: 20px 18px;
    gap: 14px;
  }

  .chart-body {
    height: 200px;
  }
}

:deep(.n-radio-button.n-radio-button--checked) {
  --n-button-color-active: var(--brand);
  --n-button-text-color-active: var(--brand-ink);
  background-color: var(--brand) !important;
  border-color: var(--brand) !important;
}
</style>

