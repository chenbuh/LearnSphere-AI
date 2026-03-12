<script setup>
import { Brain, Target, TrendingUp, Zap } from 'lucide-vue-next'
import { NCard, NGrid, NGridItem, NIcon } from 'naive-ui'

defineProps({
  stats: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  }
})

const statItems = [
  { key: 'overall', icon: Brain, tone: 'purple', glow: 'shadow-glow-purple' },
  { key: 'growth', icon: TrendingUp, tone: 'green', glow: 'shadow-glow-green', prefix: '+' },
  { key: 'gap', icon: Target, tone: 'orange', glow: 'shadow-glow-orange' },
  { key: 'predict', icon: Zap, tone: 'blue', glow: 'shadow-glow-blue' }
]
</script>

<template>
  <div class="overview-section">
    <n-grid x-gap="20" y-gap="20" cols="1 600:2 1000:4" responsive="screen">
      <n-grid-item v-for="item in statItems" :key="item.key">
        <n-card class="stat-card" :bordered="false">
          <div class="stat-content">
            <div class="stat-icon-box" :class="[item.tone, item.glow]">
              <n-icon :component="item.icon" />
            </div>
            <div class="stat-text">
              <div class="label">{{ labels[item.key] }}</div>
              <div class="value text-glow" :class="item.tone">
                {{ item.prefix || '' }}{{ stats[item.key] }}
                <template v-if="item.key === 'growth' || item.key === 'gap'">%</template>
              </div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.overview-section {
  margin-bottom: 24px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;
}

.stat-icon-box.purple {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
}

.stat-icon-box.green {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.stat-icon-box.orange {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.stat-icon-box.blue {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.stat-text .label {
  margin-bottom: 2px;
  font-size: 0.8rem;
  color: #a1a1aa;
}

.stat-text .value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
}

.stat-text .value.green {
  color: #34d399;
}

.stat-text .value.orange {
  color: #fbbf24;
}

.shadow-glow-purple {
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.shadow-glow-green {
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
}

.shadow-glow-orange {
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}

.shadow-glow-blue {
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.text-glow {
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}
</style>
