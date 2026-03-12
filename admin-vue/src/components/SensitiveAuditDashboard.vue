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
        <slot name="trend-chart" />
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="main-card h-full" :bordered="false" title="高频违规词分布">
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
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(10px);
}
</style>
