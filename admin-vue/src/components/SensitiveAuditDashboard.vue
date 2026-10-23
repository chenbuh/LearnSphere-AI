<script setup>
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
  <div class="sensitive-dashboard">
    <section class="ls-panel dash-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">
          24 小时拦截趋势
          <span class="ls-panel__count">今日累计 {{ statsData.todayCount }} 次</span>
        </h2>
      </header>
      <div class="ls-panel__body dash-panel__body">
        <slot name="trend-chart" />
      </div>
    </section>

    <section class="ls-panel dash-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">高频违规词</h2>
      </header>
      <div class="ls-panel__body dash-panel__body">
        <slot name="pie-chart" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* 2:1 split; both panels stretch so their top and bottom edges line up. */
.sensitive-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

.dash-panel {
  display: flex;
  flex-direction: column;
}

.dash-panel__body {
  flex: 1;
}

@media (max-width: 1100px) {
  .sensitive-dashboard {
    grid-template-columns: 1fr;
  }
}
</style>
