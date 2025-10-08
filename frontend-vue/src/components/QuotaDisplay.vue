<template>
  <div class="quota-display" @click="showDetails = !showDetails">
    <n-popover trigger="hover" placement="bottom">
      <template #trigger>
        <div class="quota-badge" :class="{ warning: isLowQuota, danger: isOutOfQuota }">
          <n-icon size="16" :color="badgeColor">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10h-2V8h2m0 6h-2v-2h2m-1-9C6.48 3 2 7.48 2 13s4.48 10 10 10 10-4.48 10-10S17.52 3 12 3z"/>
            </svg>
          </n-icon>
          <span class="quota-text">{{ remaining }}/{{ total }}</span>
        </div>
      </template>
      
      <div class="quota-popover">
        <div class="popover-header">
          <div class="header-title">今日AI额度</div>
          <n-tag :type="tagType" size="small" round>
            {{ vipLabel }}
          </n-tag>
        </div>

        <div class="quota-progress">
          <n-progress
            type="line"
            :percentage="usagePercent"
            :color="progressColor"
            :rail-color="'rgba(255, 255, 255, 0.1)'"
            :show-indicator="false"
          />
          <div class="progress-text">
            已使用 {{ used }} / {{ total }} 次 ({{ usagePercent }}%)
          </div>
        </div>

        <div class="quota-stats">
          <div class="stat-item">
            <span class="stat-label">剩余</span>
            <span class="stat-value" :style="{ color: badgeColor }">{{ remaining }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总额</span>
            <span class="stat-value">{{ total }}</span>
          </div>
        </div>

        <div v-if="!isVip" class="upgrade-hint">
          <n-button type="warning" size="small" ghost block @click="goToUpgrade">
            升级 VIP 获取更多额度
          </n-button>
        </div>

        <div class="reset-time">
          明日0点重置
        </div>
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
const { quotaInfo, fetchQuotaInfo, isVip, vipLevelLabel } = useVipPermission()

const showDetails = ref(false)

// 计算属性
const used = computed(() => quotaInfo.value.usedToday || 0)
const total = computed(() => quotaInfo.value.dailyQuota || 5)
const remaining = computed(() => quotaInfo.value.remainingToday || 0)
const usagePercent = computed(() => Math.round(quotaInfo.value.usagePercent || 0))

const isLowQuota = computed(() => remaining.value <= 2 && remaining.value > 0)
const isOutOfQuota = computed(() => remaining.value === 0)

const vipLabel = computed(() => vipLevelLabel.value)

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
  // 每5分钟刷新一次
  setInterval(() => {
    fetchQuotaInfo()
  }, 5 * 60 * 1000)
})
</script>

<style scoped>
.quota-display {
  cursor: pointer;
  user-select: none;
}

.quota-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.quota-badge:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
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
  color: #fff;
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
  color: #333;
}

.quota-progress {
  margin-bottom: 16px;
}

.progress-text {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

.quota-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.upgrade-hint {
  margin-bottom: 12px;
}

.reset-time {
  text-align: center;
  font-size: 11px;
  color: #999;
  padding-top: 8px;
  border-top: 1px solid #eee;
}
</style>
