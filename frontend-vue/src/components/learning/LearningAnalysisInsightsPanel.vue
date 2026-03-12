<script setup>
import { AlertCircle, Sparkles } from 'lucide-vue-next'
import { NCard, NGridItem, NIcon, NTag } from 'naive-ui'

defineProps({
  weakPoints: {
    type: Array,
    default: () => []
  },
  trendDays: {
    type: Number,
    default: 7
  },
  labels: {
    type: Object,
    required: true
  },
  trendChartRefSetter: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['change-trend-days'])
</script>

<template>
  <n-grid-item span="2">
    <div class="right-col-stack">
      <n-card :title="labels.weaknessTitle" class="advice-card" :bordered="false">
        <template #header-extra>
          <n-icon :component="AlertCircle" color="#ef4444" />
        </template>

        <div v-if="weakPoints.length > 0" class="weakness-list">
          <div v-for="(wp, idx) in weakPoints" :key="idx" class="weakness-item">
            <div class="wp-header">
              <div class="wp-title">
                <n-icon
                  :component="AlertCircle"
                  :color="wp.color"
                  class="mr-2"
                  style="margin-right: 8px"
                />
                {{ wp.title }}
              </div>
              <n-tag
                :color="{ color: 'rgba(239, 68, 68, 0.1)', textColor: '#ef4444' }"
                size="small"
                :bordered="false"
              >
                {{ labels.score }}: {{ wp.score }}
              </n-tag>
            </div>
            <div class="wp-advice">
              <span class="label">{{ labels.advice }}:</span>
              {{ wp.advice }}
            </div>
          </div>
        </div>

        <div v-else class="weakness-empty">
          <n-icon :component="Sparkles" size="40" color="#fbbf24" style="margin-bottom: 12px" />
          <div class="empty-title">{{ labels.noWeaknessTitle }}</div>
          <div class="empty-desc">{{ labels.noWeaknessDesc }}</div>
        </div>
      </n-card>

      <n-card class="trend-card" :bordered="false">
        <template #header>
          <div class="trend-header">
            <span>{{ labels.trendTitle }}</span>
            <div class="trend-tabs">
              <span :class="{ active: trendDays === 7 }" @click="emit('change-trend-days', 7)">
                {{ labels.last7Days }}
              </span>
              <span :class="{ active: trendDays === 30 }" @click="emit('change-trend-days', 30)">
                {{ labels.last30Days }}
              </span>
            </div>
          </div>
        </template>
        <div :ref="trendChartRefSetter" class="trend-chart"></div>
      </n-card>
    </div>
  </n-grid-item>
</template>

<style scoped>
.right-col-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.advice-card,
.trend-card {
  background: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  border-radius: 16px;
}

.weakness-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weakness-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.wp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.wp-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 700;
  color: #e4e4e7;
}

.wp-advice {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #d4d4d8;
}

.wp-advice .label {
  margin-right: 8px;
  color: #a1a1aa;
}

.weakness-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.weakness-empty .empty-title {
  margin-bottom: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fbbf24;
}

.weakness-empty .empty-desc {
  font-size: 0.9rem;
  color: #a1a1aa;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-tabs {
  display: flex;
  padding: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.trend-tabs span {
  padding: 4px 12px;
  font-size: 12px;
  color: #a1a1aa;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.trend-tabs span.active {
  color: #fff;
  background: #6366f1;
}

.trend-tabs span:hover:not(.active) {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.trend-chart {
  width: 100%;
  height: 240px;
}
</style>
