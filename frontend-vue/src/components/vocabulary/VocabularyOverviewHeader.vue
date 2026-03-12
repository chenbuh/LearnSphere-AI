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
  margin-bottom: 24px;
}
</style>
