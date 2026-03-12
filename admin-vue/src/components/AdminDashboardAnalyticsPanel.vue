<script setup>
import { NButton, NGrid, NGridItem, NSpace } from 'naive-ui'
import { Brain, Filter, TrendingUp } from 'lucide-vue-next'
import AdminDashboardSidebarPanel from '@/components/AdminDashboardSidebarPanel.vue'

defineProps({
  contentRadarRef: {
    type: Object,
    default: null
  },
  funnelChartRef: {
    type: Object,
    default: null
  },
  quickActions: {
    type: Array,
    default: () => []
  },
  recentLogs: {
    type: Array,
    default: () => []
  },
  retentionChartRef: {
    type: Object,
    default: null
  },
  retentionData: {
    type: Array,
    default: () => []
  },
  userChartRef: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['navigate'])
</script>

<template>
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
        <div :ref="userChartRef" class="chart-box-large"></div>
      </div>

      <n-grid :cols="2" :x-gap="20" class="mt-5">
        <n-grid-item>
          <div class="p-card chart-sub">
            <div class="card-title"><Brain :size="18" /><span>内容库分布图</span></div>
            <div :ref="contentRadarRef" class="chart-box-medium"></div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="p-card chart-sub">
            <div class="card-title"><Filter :size="18" /><span>核心转化漏斗</span></div>
            <div :ref="funnelChartRef" class="chart-box-medium"></div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-grid-item>

    <n-grid-item :span="4">
      <AdminDashboardSidebarPanel
        :quick-actions="quickActions"
        :retention-chart-ref="retentionChartRef"
        :retention-data="retentionData"
        :recent-logs="recentLogs"
        @navigate="emit('navigate', $event)"
      />
    </n-grid-item>
  </n-grid>
</template>

<style scoped>
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

@media (max-width: 768px) {
  .chart-box-large {
    height: 280px;
  }

  .chart-box-medium {
    height: 220px;
  }
}
</style>
