<script setup>
import ListeningAnalysisHeader from '@/components/listening/ListeningAnalysisHeader.vue'
import ListeningPassageAnalysisCard from '@/components/listening/ListeningPassageAnalysisCard.vue'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  passages: {
    type: Array,
    default: () => []
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  getGlobalNum: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['back', 'restart', 'open-ai-tutor'])
</script>

<template>
  <div class="analysis-container">
    <ListeningAnalysisHeader
      :translate="props.translate"
      @back="emit('back')"
      @restart="emit('restart')"
    />

    <ListeningPassageAnalysisCard
      v-for="(passage, passageIndex) in props.passages"
      :key="passageIndex"
      :translate="props.translate"
      :passage="passage"
      :passage-index="passageIndex"
      :answers-per-passage="props.answersPerPassage"
      :get-global-num="props.getGlobalNum"
      @open-ai-tutor="emit('open-ai-tutor', $event)"
    />
  </div>
</template>

<style scoped>
.analysis-container {
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>