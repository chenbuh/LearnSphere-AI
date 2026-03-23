<script setup>
import { computed } from 'vue'
import { NBadge, NButton, NTooltip } from 'naive-ui'
import { Activity, Bell, Clock3, RefreshCw, ShieldCheck, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  formattedDate: {
    type: String,
    default: ''
  },
  formattedTime: {
    type: String,
    default: ''
  },
  greeting: {
    type: String,
    default: ''
  },
  refreshing: {
    type: Boolean,
    default: false
  },
  lastSyncLabel: {
    type: String,
    default: '--:--'
  },
  systemHealth: {
    type: Number,
    default: 0
  },
  todayNewUsers: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['briefing', 'navigate', 'refresh'])

const healthStatusLabel = computed(() => {
  const health = Number(props.systemHealth || 0)
  if (health >= 95) return '系统正常'
  if (health >= 85) return '需要关注'
  return '需尽快处理'
})
</script>

<template>
  <header class="dashboard-header animate-slide-down">
    <div class="overview-strip">
      <div class="overview-strip__main">
        <div class="overview-strip__eyebrow">运行状态</div>
        <div class="overview-strip__title-row">
          <h2>当前运行状态</h2>
          <span class="overview-strip__status">
            <span class="status-dot"></span>
            {{ healthStatusLabel }}
          </span>
        </div>
        <p class="overview-strip__summary">
          {{ greeting }}。先看系统健康、最后同步和今日新增，再到下方指标区判断是否需要继续排查。
        </p>
        <div class="overview-strip__meta">
          <span class="overview-meta-pill">
            <ShieldCheck :size="14" />
            系统健康 {{ systemHealth }}%
          </span>
          <span class="overview-meta-pill">
            <Clock3 :size="14" />
            最后同步 {{ lastSyncLabel }}
          </span>
          <span class="overview-meta-pill">
            <Activity :size="14" />
            今日新增 {{ todayNewUsers }}
          </span>
        </div>
      </div>

      <div class="overview-strip__side">
        <div class="overview-metric-board">
          <div class="overview-stat overview-stat--time">
            <span class="overview-stat__label">当前时间</span>
            <strong>{{ formattedTime }}</strong>
            <span class="overview-stat__hint">{{ formattedDate }}</span>
          </div>

          <div class="overview-stat overview-stat--health">
            <span class="overview-stat__label">同步状态</span>
            <strong>{{ systemHealth }}%</strong>
            <span class="overview-stat__hint">最后同步 {{ lastSyncLabel }}</span>
          </div>
        </div>

        <div class="overview-actions">
          <n-button type="primary" round class="briefing-btn" @click="emit('briefing')">
            <template #icon><Sparkles :size="16" /></template>
            生成简报
          </n-button>

          <div class="icon-row">
            <n-tooltip trigger="hover">
              <template #trigger>
                <div class="icon-trigger" @click="emit('refresh')">
                  <RefreshCw :size="18" :class="refreshing ? 'animate-spin' : ''" />
                </div>
              </template>
              刷新全局数据
            </n-tooltip>
            <n-badge dot color="#ef4444">
              <div class="icon-trigger" @click="emit('navigate', '/notifications')">
                <Bell :size="18" />
              </div>
            </n-badge>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  margin-bottom: 2px;
}

.overview-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 430px);
  gap: 24px;
  padding: 24px 26px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(180deg, rgba(10, 17, 27, 0.94), rgba(8, 14, 24, 0.86)),
    rgba(8, 15, 24, 0.82);
  box-shadow: 0 22px 64px rgba(3, 6, 14, 0.24);
  backdrop-filter: blur(18px);
}

.overview-strip__main {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 12px;
}

.overview-strip__eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  color: #87e9dc;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.overview-strip__title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.overview-strip__title-row h2 {
  margin: 0;
  font-size: clamp(1.28rem, 1.5vw, 1.72rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #f7fbff;
}

.overview-strip__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(62, 207, 188, 0.12);
  border: 1px solid rgba(62, 207, 188, 0.16);
  color: #87e9dc;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3ecfbc;
  box-shadow: 0 0 0 6px rgba(62, 207, 188, 0.12);
}

.overview-strip__summary {
  max-width: 60ch;
  margin: 0;
  color: #8ea1ba;
  font-size: 0.9rem;
  line-height: 1.65;
}

.overview-strip__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.overview-meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #d7e2f1;
  font-size: 0.8rem;
  font-weight: 700;
}

.overview-strip__side {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.overview-metric-board {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
  gap: 12px;
}

.overview-stat {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.overview-stat--time {
  min-height: 104px;
}

.overview-stat--health {
  align-content: center;
}

.overview-stat strong {
  display: block;
  font-size: 1.95rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: #f7fbff;
}

.overview-stat__label {
  color: #68809c;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.overview-stat__hint {
  color: #8ea1ba;
  font-size: 0.8rem;
  line-height: 1.45;
}

.overview-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.briefing-btn {
  flex: 1 1 auto;
  height: 46px;
  border-color: rgba(62, 207, 188, 0.22);
  background: linear-gradient(135deg, rgba(62, 207, 188, 0.22), rgba(92, 168, 255, 0.2));
}

.icon-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.icon-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(148, 163, 184, 0.12);
  transition: all 0.2s ease;
  color: #d7e2f1;
}

.icon-trigger:hover,
.briefing-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(62, 207, 188, 0.2);
}

@media (max-width: 1500px) {
  .overview-strip {
    grid-template-columns: 1fr;
  }

  .overview-metric-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .overview-strip {
    padding: 20px;
    border-radius: 24px;
  }

  .overview-metric-board {
    grid-template-columns: 1fr;
  }

  .overview-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .icon-row {
    justify-content: flex-end;
  }
}
</style>
