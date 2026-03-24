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
  min-width: 0;
}

.result-header-grid {
  display: grid;
  grid-template-columns: minmax(300px, 340px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  min-width: 0;
}

@media (max-width: 900px) {
  .result-header-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .result-container {
    max-width: 100%;
  }

  .result-header-grid {
    gap: 16px;
  }
}

@media (max-width: 360px) {
  .result-header-grid {
    gap: 12px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .result-header-grid {
    gap: 14px;
  }
}
</style>
