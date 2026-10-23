<script setup>
import { ref } from 'vue'

const actionChartRef = ref(null)
const provinceChartRef = ref(null)

defineExpose({
  actionChartRef,
  provinceChartRef
})
</script>

<template>
  <div class="ls-grid-2 user-log-charts">
    <section class="ls-panel user-log-chart">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">操作类型分布</h2>
      </header>
      <div class="ls-panel__body user-log-chart__body">
        <div ref="actionChartRef" class="user-log-chart__canvas"></div>
      </div>
    </section>
    <section class="ls-panel user-log-chart">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">地区分布 <span class="ls-panel__count">TOP 10</span></h2>
      </header>
      <div class="ls-panel__body user-log-chart__body">
        <div ref="provinceChartRef" class="user-log-chart__canvas"></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.user-log-charts {
  align-items: stretch;
}

.user-log-chart {
  display: flex;
  flex-direction: column;
}

.user-log-chart__body {
  flex: 1;
}

.user-log-chart__canvas {
  height: 280px;
}
</style>
