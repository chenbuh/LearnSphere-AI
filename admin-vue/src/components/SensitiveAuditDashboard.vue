<script setup>
import { NCard, NGrid, NGridItem, NTag } from 'naive-ui'

defineProps({
  statsData: {
    type: Object,
    default: () => ({
      todayCount: 0,
      topWords: [],
      trendTimes: [],
      trendCounts: []
    })
  }
})
</script>

<template>
  <n-grid :cols="3" :x-gap="24" class="dashboard-grid">
    <n-grid-item :span="2">
      <n-card class="main-card h-full" :bordered="false" title="24小时热点拦截趋势">
        <template #header-extra>
          <n-tag type="error" size="small" round bordered>今日累计拦截: {{ statsData.todayCount }} 次</n-tag>
        </template>
        <div class="panel-copy">
          <div class="panel-kicker">拦截趋势</div>
          <p>查看近 24 小时拦截变化，定位风险来源和波峰时段。</p>
        </div>
        <slot name="trend-chart" />
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="main-card h-full" :bordered="false" title="高频违规词分布">
        <div class="panel-copy">
          <div class="panel-kicker">风险分布</div>
          <p>查看高频违规词，判断规则更新优先级。</p>
        </div>
        <slot name="pie-chart" />
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<style scoped>
.dashboard-grid {
  margin-bottom: 24px;
}

.main-card {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(12, 18, 28, 0.84);
}

.panel-copy {
  margin-bottom: 16px;
}

.panel-kicker {
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #67e8f9;
}

.panel-copy p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.65;
  color: #94a3b8;
}
</style>
