<script setup>
import VocabularyOverviewDailyTask from './VocabularyOverviewDailyTask.vue'
import VocabularyOverviewStatsGrid from './VocabularyOverviewStatsGrid.vue'

const props = defineProps({
  dailyTask: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: () => ({
      todayCount: 0,
      totalMastered: 0,
      totalLearned: 0,
      totalFailed: 0
    })
  }
})
</script>

<template>
  <div class="overview-header">
    <VocabularyOverviewDailyTask :daily-task="props.dailyTask" />
    <VocabularyOverviewStatsGrid :stats="props.stats" />
  </div>
</template>

<style scoped>
.overview-header {
  display: grid;
  grid-template-columns: minmax(300px, 0.86fr) minmax(0, 1.14fr);
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .overview-header {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
