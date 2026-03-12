<script setup>
import { ref } from 'vue'
import { NCard, NGrid, NGridItem } from 'naive-ui'

const actionChartRef = ref(null)
const provinceChartRef = ref(null)

defineExpose({
  actionChartRef,
  provinceChartRef
})
</script>

<template>
  <n-card title="📈 数据可视化" class="mb-6" :bordered="false">
    <n-grid :cols="2" :x-gap="20">
      <n-grid-item>
        <div class="chart-container">
          <h3>操作类型分布</h3>
          <div ref="actionChartRef" style="height: 300px;"></div>
        </div>
      </n-grid-item>
      <n-grid-item>
        <div class="chart-container">
          <h3>地区分布 TOP 10</h3>
          <div ref="provinceChartRef" style="height: 300px;"></div>
        </div>
      </n-grid-item>
    </n-grid>
  </n-card>
</template>

<style scoped>
.chart-container {
  padding: 16px;
}

.chart-container h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

:global(.dark-mode) .chart-container h3 {
  color: #fff;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>
