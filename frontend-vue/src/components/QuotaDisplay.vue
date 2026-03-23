<template>
        <div class="quota-container">
          <!-- 内容生成配额 -->
          <n-popover trigger="hover" placement="bottom">
            <template #trigger>
              <div class="quota-badge content-badge" :class="{ warning: isLowQuota, danger: isOutOfQuota }">
                <n-icon size="16" color="#f59e0b">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 10h-2V8h2m0 6h-2v-2h2m-1-9C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3z"/>
                  </svg>
                </n-icon>
                <span class="quota-text">{{ remaining }}/{{ total }}</span>
              </div>
            </template>
            <div class="quota-popover">
              <div class="popover-header">
                <div class="header-title">今日内容生成配额</div>
                <n-tag :type="tagType" size="small" round>{{ vipLabel }}</n-tag>
              </div>
              <div class="quota-progress">
                <n-progress type="line" :percentage="usagePercent" :color="progressColor" :rail-color="'rgba(148, 163, 184, 0.22)'" :show-indicator="false" />
                <div class="progress-text">已使用 {{ used }} / {{ total }} 点 ({{ usagePercent }}%)</div>
              </div>
              <div class="reset-time">内容消耗与题目质量挂钩</div>
            </div>
          </n-popover>

          <!-- AI 助教提问配额 -->
          <n-popover trigger="hover" placement="bottom">
            <template #trigger>
              <div class="quota-badge tutor-badge" :class="{ warning: isTutorLow, danger: isTutorEmpty }">
                <n-icon size="16" color="#ec4899">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
                  </svg>
                </n-icon>
                <span class="quota-text">{{ tutorRemaining }}/{{ tutorTotal }}</span>
              </div>
            </template>
            <div class="quota-popover">
              <div class="popover-header">
                <div class="header-title">今日助教提问配额</div>
                <n-tag type="info" size="small" round>对话次数</n-tag>
              </div>
              <div class="quota-progress">
                <n-progress type="line" :percentage="tutorUsagePercent" color="#ec4899" :rail-color="'rgba(148, 163, 184, 0.22)'" :show-indicator="false" />
                <div class="progress-text">已使用 {{ tutorUsed }}/{{ tutorTotal }} 次 ({{ tutorUsagePercent }}%)</div>
              </div>
              <div class="reset-time">每日 0 点重置提问次数</div>
            </div>
          </n-popover>
        </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NPopover, NProgress, NTag, NButton } from 'naive-ui'
import { useVipPermission } from '@/composables/useVipPermission'

const router = useRouter()
const { quotaInfo, fetchQuotaInfo, setupQuotaListener, isVip, vipLevelLabel } = useVipPermission()

const showDetails = ref(false)

// 计算属性
const used = computed(() => quotaInfo.value.usedToday || 0)
const total = computed(() => quotaInfo.value.dailyQuota || 5)
const remaining = computed(() => quotaInfo.value.remainingToday || 0)
const usagePercent = computed(() => Math.round(quotaInfo.value.usagePercent || 0))

const isLowQuota = computed(() => remaining.value <= 2 && remaining.value > 0)
const isOutOfQuota = computed(() => remaining.value === 0)

const vipLabel = computed(() => vipLevelLabel.value)

// 助教配额计算属性
const tutorUsed = computed(() => quotaInfo.value.tutorUsedToday || 0)
const tutorTotal = computed(() => quotaInfo.value.dailyTutorQuota || 3)
const tutorRemaining = computed(() => quotaInfo.value.tutorRemainingToday || 0)
const tutorUsagePercent = computed(() => Math.round(quotaInfo.value.tutorUsagePercent || 0))

const isTutorLow = computed(() => tutorRemaining.value <= 1 && tutorRemaining.value > 0)
const isTutorEmpty = computed(() => tutorRemaining.value === 0)

const tagType = computed(() => {
  if (isVip.value) return 'success'
  return 'default'
})

const badgeColor = computed(() => {
  if (isOutOfQuota.value) return '#f56c6c'
  if (isLowQuota.value) return '#e6a23c'
  if (isVip.value) return '#f59e0b'
  return '#67c23a'
})

const progressColor = computed(() => {
  const percent = usagePercent.value
  if (percent >= 90) return '#f56c6c'
  if (percent >= 70) return '#e6a23c'
  if (isVip.value) return '#f59e0b'
  return '#67c23a'
})

const goToUpgrade = () => {
  router.push('/pricing')
}

// 定期刷新配额信息
onMounted(() => {
  fetchQuotaInfo()
  
  // 设置事件监听器以实现实时更新
  setupQuotaListener()
  
  // 每 30 秒刷新一次（更频繁）
  setInterval(() => {
    fetchQuotaInfo()
  }, 30 * 1000)
})
</script>

<style scoped>
.quota-display {
  cursor: pointer;
  user-select: none;
}

.quota-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  row-gap: 8px;
  max-width: 100%;
}

.quota-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;
}

.quota-badge:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tutor-badge {
  border-color: rgba(236, 72, 153, 0.3);
}

.tutor-badge:hover {
  border-color: rgba(236, 72, 153, 0.6);
  background: rgba(236, 72, 153, 0.1);
}

.quota-badge.warning {
  background: rgba(230, 162, 60, 0.1);
  border-color: #e6a23c;
}

.quota-badge.danger {
  background: rgba(245, 108, 108, 0.1);
  border-color: #f56c6c;
}

.quota-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
}

.quota-popover {
  min-width: 260px;
  padding: 4px;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.quota-progress {
  margin-bottom: 16px;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: var(--secondary-text);
  text-align: center;
}

.quota-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: var(--surface-muted);
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid var(--card-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--secondary-text);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
}

.upgrade-hint {
  margin-bottom: 12px;
}

.reset-time {
  text-align: center;
  font-size: 11px;
  color: var(--secondary-text);
  padding-top: 8px;
  border-top: 1px solid var(--card-border);
}

:global(html[data-theme='light'] .quota-badge) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 252, 0.95));
  border-color: rgba(203, 213, 225, 0.94);
  box-shadow: 0 12px 24px -18px rgba(15, 23, 42, 0.18);
}

:global(html[data-theme='light'] .quota-badge:hover) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(241, 245, 249, 0.99));
  box-shadow: 0 16px 28px -20px rgba(15, 23, 42, 0.24);
}

:global(html[data-theme='light'] .content-badge) {
  background:
    linear-gradient(180deg, rgba(255, 247, 214, 0.96), rgba(255, 252, 244, 0.98));
  border-color: rgba(245, 158, 11, 0.36);
  box-shadow: 0 14px 24px -20px rgba(245, 158, 11, 0.28);
}

:global(html[data-theme='light'] .content-badge:hover) {
  background:
    linear-gradient(180deg, rgba(255, 241, 224, 0.99), rgba(255, 250, 240, 0.99));
  border-color: rgba(245, 158, 11, 0.48);
}

:global(html[data-theme='light'] .tutor-badge) {
  background:
    linear-gradient(180deg, rgba(253, 236, 245, 0.96), rgba(255, 248, 251, 0.98));
  border-color: rgba(236, 72, 153, 0.34);
  box-shadow: 0 14px 24px -20px rgba(236, 72, 153, 0.24);
}

:global(html[data-theme='light'] .tutor-badge:hover) {
  background:
    linear-gradient(180deg, rgba(251, 226, 239, 0.98), rgba(255, 244, 249, 0.99));
  border-color: rgba(236, 72, 153, 0.42);
}

:global(html[data-theme='light'] .quota-badge.warning) {
  background:
    linear-gradient(180deg, rgba(255, 243, 224, 0.99), rgba(255, 250, 240, 0.98));
  border-color: rgba(245, 158, 11, 0.5);
}

:global(html[data-theme='light'] .quota-badge.danger) {
  background:
    linear-gradient(180deg, rgba(254, 233, 233, 0.98), rgba(255, 246, 246, 0.97));
  border-color: rgba(239, 68, 68, 0.44);
}

:global(html[data-theme='light'] .quota-text) {
  color: #0f172a;
}

:global(html[data-theme='light'] .quota-popover) {
  color: #182132;
}

:global(html[data-theme='light'] .header-title) {
  color: #182132;
}

:global(html[data-theme='light'] .progress-text),
:global(html[data-theme='light'] .reset-time),
:global(html[data-theme='light'] .stat-label) {
  color: #64748b;
}

:global(html[data-theme='light'] .stat-value) {
  color: #182132;
}

:global(html[data-theme='light'] .quota-stats) {
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(226, 232, 240, 0.9);
}

:global(html[data-theme='light'] .reset-time) {
  border-top-color: rgba(226, 232, 240, 0.9);
}
</style>
