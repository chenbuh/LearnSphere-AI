<script setup>
import { computed } from 'vue'
import { NNumberAnimation, NSkeleton } from 'naive-ui'
import { Activity, Bot, Coins, ShieldCheck, UserPlus, Users, Wallet, Wifi } from 'lucide-vue-next'

const props = defineProps({
  skeletonLoading: {
    type: Boolean,
    default: true
  },
  stats: {
    type: Object,
    default: () => ({ totalUsers: 0, todayNewUsers: 0 })
  },
  financeStats: {
    type: Object,
    default: () => ({ totalRevenue: 0, monthly: 0, quarterly: 0 })
  },
  aiStats: {
    type: Object,
    default: () => ({ successRate: 0, avgDuration: 0, totalCalls: 0, totalTokens: 0 })
  },
  onlineUsers: {
    type: Number,
    default: 0
  },
  systemHealth: {
    type: Object,
    default: () => ({ level: 'unknown', label: '未知', hint: '' })
  },
  lastSyncLabel: {
    type: String,
    default: '--:--'
  }
})

const successRateValue = computed(() => Number(props.aiStats?.successRate || 0))
const successRate = computed(() => successRateValue.value.toFixed(1))
const tokenUsageInThousands = computed(() =>
  (Number(props.aiStats?.totalTokens || 0) / 1000).toFixed(1)
)
const avgDuration = computed(() => Number(props.aiStats?.avgDuration || 0))
const monthlyRevenue = computed(() => Number(props.financeStats?.monthly || 0))
const totalCalls = computed(() => Number(props.aiStats?.totalCalls || 0))

const successRateTone = computed(() => {
  if (!totalCalls.value) return 'accent'
  if (successRateValue.value >= 95) return 'ok'
  if (successRateValue.value >= 85) return 'warn'
  return 'danger'
})

const healthTone = computed(() => {
  const level = props.systemHealth?.level
  return level && level !== 'unknown' ? level : 'ok'
})
</script>

<template>
  <section class="kpi-deck" aria-label="核心指标看板">
    <!-- 1. 累计用户 -->
    <div class="kpi-card kpi-card--indigo">
      <div class="kpi-card__head">
        <span class="kpi-card__title">累计用户</span>
        <div class="kpi-card__badge kpi-badge--indigo">
          <Users :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="60%" />
        <strong v-else class="kpi-card__num">
          <n-number-animation :from="0" :to="stats.totalUsers || 0" />
        </strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-tag kpi-tag--neutral">全量注册</span>
      </div>
    </div>

    <!-- 2. 在线用户 -->
    <div class="kpi-card kpi-card--cyan">
      <div class="kpi-card__head">
        <span class="kpi-card__title">在线用户</span>
        <div class="kpi-card__badge kpi-badge--cyan">
          <Wifi :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="50%" />
        <strong v-else class="kpi-card__num">{{ onlineUsers }}</strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-live-dot"></span>
        <span class="kpi-card__hint">实时连接</span>
      </div>
    </div>

    <!-- 3. 今日新增 -->
    <div class="kpi-card kpi-card--violet">
      <div class="kpi-card__head">
        <span class="kpi-card__title">今日新增</span>
        <div class="kpi-card__badge kpi-badge--violet">
          <UserPlus :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="50%" />
        <strong v-else class="kpi-card__num">{{ stats.todayNewUsers || 0 }}</strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-card__hint">当日注册增长</span>
      </div>
    </div>

    <!-- 4. 累计成交额 -->
    <div class="kpi-card kpi-card--emerald">
      <div class="kpi-card__head">
        <span class="kpi-card__title">累计成交额</span>
        <div class="kpi-card__badge kpi-badge--emerald">
          <Wallet :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="70%" />
        <strong v-else class="kpi-card__num">
          <small class="kpi-card__curr">¥</small>
          <n-number-animation :from="0" :to="financeStats.totalRevenue || 0" :precision="2" />
        </strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-card__hint">本月 ¥{{ monthlyRevenue.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 5. AI 成功率 -->
    <div class="kpi-card" :class="`kpi-card--${successRateTone}`">
      <div class="kpi-card__head">
        <span class="kpi-card__title">AI 成功率</span>
        <div class="kpi-card__badge" :class="`kpi-badge--${successRateTone}`">
          <ShieldCheck :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="60%" />
        <strong v-else class="kpi-card__num" :class="`text-${successRateTone}`">
          {{ successRate }}<small class="kpi-card__unit">%</small>
        </strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-card__hint">平均响应 {{ avgDuration }}ms</span>
      </div>
    </div>

    <!-- 6. AI 调用总次 -->
    <div class="kpi-card kpi-card--blue">
      <div class="kpi-card__head">
        <span class="kpi-card__title">AI 调用总量</span>
        <div class="kpi-card__badge kpi-badge--blue">
          <Bot :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="50%" />
        <strong v-else class="kpi-card__num">{{ totalCalls }}</strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-card__hint">全场景会话与评测</span>
      </div>
    </div>

    <!-- 7. Token 消耗 -->
    <div class="kpi-card kpi-card--amber">
      <div class="kpi-card__head">
        <span class="kpi-card__title">Token 消耗</span>
        <div class="kpi-card__badge kpi-badge--amber">
          <Coins :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="60%" />
        <strong v-else class="kpi-card__num">
          {{ tokenUsageInThousands }}<small class="kpi-card__unit">k</small>
        </strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-card__hint">大模型算力消耗</span>
      </div>
    </div>

    <!-- 8. 系统健康 -->
    <div class="kpi-card" :class="`kpi-card--${healthTone}`">
      <div class="kpi-card__head">
        <span class="kpi-card__title">系统状态</span>
        <div class="kpi-card__badge" :class="`kpi-badge--${healthTone}`">
          <Activity :size="16" />
        </div>
      </div>
      <div class="kpi-card__body">
        <n-skeleton v-if="skeletonLoading" :height="32" width="60%" />
        <strong v-else class="kpi-card__num" :class="`text-${healthTone}`">
          {{ systemHealth.label }}
        </strong>
      </div>
      <div class="kpi-card__foot">
        <span class="kpi-live-dot" :class="`kpi-live-dot--${healthTone}`"></span>
        <span class="kpi-card__hint">{{ systemHealth.hint || `同步于 ${lastSyncLabel}` }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kpi-deck {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  width: 100%;
}

.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 20px;
  min-height: 128px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.04),
    0 4px 12px -2px rgba(15, 23, 42, 0.03);
  transition:
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.22s ease;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.22s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow:
    0 10px 24px -4px rgba(15, 23, 42, 0.08),
    0 3px 6px -2px rgba(15, 23, 42, 0.04);
}

.kpi-card--indigo:hover::before {
  background: linear-gradient(90deg, #4f46e5, #818cf8);
}
.kpi-card--cyan:hover::before {
  background: linear-gradient(90deg, #06b6d4, #38bdf8);
}
.kpi-card--violet:hover::before {
  background: linear-gradient(90deg, #8b5cf6, #c084fc);
}
.kpi-card--emerald:hover::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}
.kpi-card--blue:hover::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}
.kpi-card--amber:hover::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.kpi-card--ok:hover::before {
  background: #10b981;
}
.kpi-card--warn:hover::before {
  background: #f59e0b;
}
.kpi-card--danger:hover::before {
  background: #ef4444;
}

.kpi-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.kpi-card__title {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.kpi-card__badge {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.kpi-card:hover .kpi-card__badge {
  transform: scale(1.08);
}

.kpi-badge--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.kpi-badge--cyan {
  background: #ecfeff;
  color: #0891b2;
}
.kpi-badge--violet {
  background: #f5f3ff;
  color: #7c3aed;
}
.kpi-badge--emerald,
.kpi-badge--ok {
  background: #ecfdf5;
  color: #059669;
}
.kpi-badge--blue {
  background: #eff6ff;
  color: #2563eb;
}
.kpi-badge--amber,
.kpi-badge--warn {
  background: #fffbeb;
  color: #d97706;
}
.kpi-badge--danger {
  background: #fef2f2;
  color: #dc2626;
}

.kpi-card__body {
  margin: 10px 0 6px;
}

.kpi-card__num {
  display: flex;
  align-items: baseline;
  color: #0f172a;
  font-size: 27px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.kpi-card__curr {
  font-size: 16px;
  font-weight: 600;
  margin-right: 3px;
  color: #64748b;
}

.kpi-card__unit {
  font-size: 14px;
  font-weight: 600;
  margin-left: 2px;
  color: #64748b;
}

.text-ok {
  color: #059669 !important;
}
.text-warn {
  color: #d97706 !important;
}
.text-danger {
  color: #dc2626 !important;
}

.kpi-card__foot {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
}

.kpi-card__hint {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
}

.kpi-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
}

.kpi-tag--neutral {
  background: #f1f5f9;
  color: #64748b;
}

.kpi-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite ease-in-out;
  flex-shrink: 0;
}

.kpi-live-dot--warn {
  background: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
}

.kpi-live-dot--danger {
  background: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

@media (max-width: 1280px) {
  .kpi-deck {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .kpi-deck {
    grid-template-columns: 1fr;
  }
}
</style>
