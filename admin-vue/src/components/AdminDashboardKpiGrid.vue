<script setup>
import { NGrid, NGridItem, NNumberAnimation, NSkeleton, NTag } from 'naive-ui'
import { Activity, ShieldCheck, Users, Wallet } from 'lucide-vue-next'

defineProps({
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
    default: () => ({ totalRevenue: 0 })
  },
  aiStats: {
    type: Object,
    default: () => ({ successRate: 0, avgDuration: 0, totalTokens: 0 })
  },
  onlineUsers: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <n-grid :cols="4" :x-gap="20" :y-gap="20" class="kpi-grid mb-6" responsive="screen">
    <n-grid-item v-if="skeletonLoading" v-for="i in 4" :key="`kpi-skeleton-${i}`">
      <div class="p-card kpi-card">
        <div class="flex justify-between mb-8">
          <n-skeleton :width="44" :height="44" :border-radius="14" />
          <n-skeleton :width="80" :height="24" :border-radius="12" />
        </div>
        <n-skeleton :height="40" width="60%" style="margin-bottom: 20px" />
        <n-skeleton :height="24" width="30%" />
      </div>
    </n-grid-item>

    <template v-else>
      <n-grid-item>
        <div class="p-card kpi-card blue">
          <div class="kpi-header">
            <div class="kpi-icon"><Users :size="24" /></div>
            <n-tag size="small" :bordered="false" round type="info">较昨日 +{{ stats.todayNewUsers }}</n-tag>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">
              <n-number-animation :from="0" :to="stats.totalUsers || 0" />
            </div>
            <div class="kpi-label">累计用户规模</div>
          </div>
          <div class="kpi-footer">
            <div class="sparkline-mini">
              <div class="bar" style="height: 30%"></div>
              <div class="bar" style="height: 50%"></div>
              <div class="bar" style="height: 40%"></div>
              <div class="bar" style="height: 80%"></div>
              <div class="bar" style="height: 60%"></div>
              <div class="bar" style="height: 90%"></div>
            </div>
            <div class="kpi-meta">DAU: {{ onlineUsers }}</div>
          </div>
        </div>
      </n-grid-item>

      <n-grid-item>
        <div class="p-card kpi-card gold">
          <div class="kpi-header">
            <div class="kpi-icon"><Wallet :size="24" /></div>
            <n-tag size="small" :bordered="false" round type="warning">已确认收支</n-tag>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">
              <span class="curr">¥</span>
              <n-number-animation :from="0" :to="financeStats.totalRevenue || 0" :precision="2" />
            </div>
            <div class="kpi-label">平台总交易总额</div>
          </div>
          <div class="kpi-footer">
            <div class="progress-simple">
              <div class="progress-inner" :style="{ width: '75%' }"></div>
            </div>
            <div class="kpi-meta">目标达成: 75%</div>
          </div>
        </div>
      </n-grid-item>

      <n-grid-item>
        <div class="p-card kpi-card green">
          <div class="kpi-header">
            <div class="kpi-icon"><ShieldCheck :size="24" /></div>
            <n-tag size="small" :bordered="false" round type="success">实时可用性</n-tag>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ aiStats.successRate?.toFixed(1) || 0 }}<span class="unit">%</span></div>
            <div class="kpi-label">AI 服务成功率</div>
          </div>
          <div class="kpi-footer">
            <div class="kpi-meta text-emerald-400">平均时延: {{ aiStats.avgDuration }}ms</div>
          </div>
        </div>
      </n-grid-item>

      <n-grid-item>
        <div class="p-card kpi-card purple">
          <div class="kpi-header">
            <div class="kpi-icon"><Activity :size="24" /></div>
            <n-tag size="small" :bordered="false" round type="error">全站指标</n-tag>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ (aiStats.totalTokens / 1000).toFixed(1) }}<span class="unit">k</span></div>
            <div class="kpi-label">AI Token 消耗量</div>
          </div>
          <div class="kpi-footer">
            <div class="kpi-meta">资源负载: 中等</div>
          </div>
        </div>
      </n-grid-item>
    </template>
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

.kpi-card {
  position: relative;
  min-height: 204px;
  overflow: hidden;
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-value {
  display: flex;
  align-items: flex-end;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.2;
  color: #fff;
}

.kpi-value .unit {
  font-size: 16px;
  margin-left: 2px;
}

.kpi-value .curr {
  margin-right: 4px;
  font-size: 18px;
  color: #f59e0b;
}

.kpi-label {
  margin-top: 2px;
  color: #71717a;
  font-size: 12px;
  font-weight: 600;
}

.kpi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.kpi-meta {
  color: #71717a;
  font-size: 11px;
  font-weight: 700;
}

.kpi-card.blue .kpi-icon {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.kpi-card.gold .kpi-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.kpi-card.green .kpi-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.kpi-card.purple .kpi-icon {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

.sparkline-mini {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 24px;
}

.sparkline-mini .bar {
  width: 3px;
  border-radius: 1px;
  background: #6366f1;
}

.progress-simple {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #fbbf24;
}

@media (max-width: 768px) {
  .kpi-value {
    font-size: 28px;
  }
}
</style>
