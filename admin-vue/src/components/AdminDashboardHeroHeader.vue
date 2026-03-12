<script setup>
import { NBadge, NButton, NDivider, NSpace, NTooltip } from 'naive-ui'
import { Bell, RefreshCw, Sparkles } from 'lucide-vue-next'

defineProps({
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
  todayNewUsers: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['briefing', 'navigate', 'refresh'])
</script>

<template>
  <header class="dashboard-header animate-slide-down">
    <div class="header-content">
      <div class="left-hero">
        <div class="status-indicator">
          <div class="pulse-ring"></div>
          <div class="pulse-dot"></div>
        </div>
        <div class="greeting-box">
          <h1 class="hero-title">{{ greeting }}，<span>管理员</span></h1>
          <p class="hero-subtitle">系统运行状态良好，今日已有 {{ todayNewUsers }} 位新学员加入</p>
        </div>
      </div>

      <div class="right-info">
        <n-button type="primary" secondary round class="glass-btn" @click="emit('briefing')">
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
              <div class="icon-trigger glass-effect" @click="emit('refresh')">
                <RefreshCw :size="18" :class="refreshing ? 'animate-spin' : ''" />
              </div>
            </template>
            刷新全局数据
          </n-tooltip>
          <n-badge dot color="#ef4444">
            <div class="icon-trigger glass-effect" @click="emit('navigate', '/notifications')">
              <Bell :size="18" />
            </div>
          </n-badge>
        </n-space>
      </div>
    </div>
  </header>
</template>

<style scoped>
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
}
</style>
