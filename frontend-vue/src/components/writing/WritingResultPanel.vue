<template>
  <div class="result-container">
    <div class="result-header-grid">
      <WritingResultScoreCard
        :display-score="displayScore"
        :analysis-result="analysisResult"
        @restart="emit('restart')"
        @open-tutor="emit('open-tutor')"
        @update:show-share="emit('update:show-share', $event)"
      />

      <WritingResultFeedbackList :analysis-result="analysisResult" />
    </div>

    <ShareModal
      :show="showShare"
      :title="shareContent?.title"
      :description="shareContent?.description"
      :url="shareContent?.url"
      @update:show="emit('update:show-share', $event)"
    />
  </div>
</template>

<script setup>
import ShareModal from '@/components/ShareModal.vue'
import WritingResultFeedbackList from '@/components/writing/WritingResultFeedbackList.vue'
import WritingResultScoreCard from '@/components/writing/WritingResultScoreCard.vue'

defineProps({
  displayScore: {
    type: Number,
    default: 0
  },
  analysisResult: {
    type: Object,
    default: null
  },
  showShare: {
    type: Boolean,
    default: false
  },
  shareContent: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['restart', 'open-tutor', 'update:show-share'])
</script>

<style scoped>
.result-container {
  max-width: 1240px;
  margin: 0 auto;
}

.result-header-grid {
  display: grid;
  grid-template-columns: minmax(300px, 340px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

@media (max-width: 900px) {
  .result-header-grid {
    grid-template-columns: 1fr;
  }
}
</style>
