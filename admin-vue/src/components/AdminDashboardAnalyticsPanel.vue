<script setup>
// Renders three panels as siblings; Dashboard.vue places them in its grid
// through the `dash-area--*` classes.
defineProps({
  contentRadarRef: {
    type: Object,
    default: null
  },
  setContentRadarRef: {
    type: Function,
    default: null
  },
  funnelChartRef: {
    type: Object,
    default: null
  },
  setFunnelChartRef: {
    type: Function,
    default: null
  },
  userChartRef: {
    type: Object,
    default: null
  },
  setUserChartRef: {
    type: Function,
    default: null
  }
})
</script>

<template>
  <section class="ls-panel dash-panel dash-area--trend">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">用户活跃趋势 <span class="ls-panel__count">近 30 天</span></h2>
    </header>
    <div class="ls-panel__body dash-panel__body">
      <div :ref="setUserChartRef" class="chart-box chart-box--large"></div>
    </div>
  </section>

  <section class="ls-panel dash-panel dash-area--radar">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">内容库结构</h2>
    </header>
    <div class="ls-panel__body dash-panel__body">
      <div :ref="setContentRadarRef" class="chart-box chart-box--medium"></div>
    </div>
  </section>

  <section class="ls-panel dash-panel dash-area--funnel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">转化漏斗</h2>
    </header>
    <div class="ls-panel__body dash-panel__body">
      <div :ref="setFunnelChartRef" class="chart-box chart-box--medium"></div>
    </div>
  </section>
</template>

<style scoped>
.dash-panel {
  display: flex;
  flex-direction: column;
}

.dash-panel__body {
  flex: 1;
}

.dash-area--trend { grid-area: trend; }
.dash-area--radar { grid-area: radar; }
.dash-area--funnel { grid-area: funnel; }

.chart-box {
  width: 100%;
}

.chart-box--large {
  height: 320px;
}

.chart-box--medium {
  height: 240px;
}

@media (max-width: 768px) {
  .chart-box--large {
    height: 260px;
  }

  .chart-box--medium {
    height: 220px;
  }
}
</style>
