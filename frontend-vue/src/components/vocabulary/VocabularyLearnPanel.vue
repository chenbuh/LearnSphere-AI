<script setup>
import VocabularyLearnResultPanel from '@/components/vocabulary/VocabularyLearnResultPanel.vue'
import VocabularyLearnSessionPanel from '@/components/vocabulary/VocabularyLearnSessionPanel.vue'
import VocabularyLearnStartPanel from '@/components/vocabulary/VocabularyLearnStartPanel.vue'

defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
  },
  examOptions: {
    type: Array,
    default: () => []
  },
  sessionWords: {
    type: Array,
    default: () => []
  },
  sessionIndex: {
    type: Number,
    default: 0
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  sessionComplete: {
    type: Boolean,
    default: false
  },
  sessionStats: {
    type: Object,
    default: () => ({ correct: 0, wrong: 0 })
  },
  currentLearnWord: {
    type: Object,
    default: null
  },
  mnemonicText: {
    type: String,
    default: ''
  },
  mnemonicLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:selected-exam',
  'start-session',
  'flip-card',
  'play-audio',
  'get-mnemonic',
  'open-ai-tutor',
  'handle-result'
])
</script>

<template>
  <div class="learn-container">
    <VocabularyLearnStartPanel
      v-if="sessionWords.length === 0 && !sessionComplete"
      :selected-exam="selectedExam"
      :exam-options="examOptions"
      @update:selected-exam="emit('update:selected-exam', $event)"
      @start-session="emit('start-session')"
    />

    <VocabularyLearnSessionPanel
      v-else-if="!sessionComplete"
      :selected-exam="selectedExam"
      :session-words="sessionWords"
      :session-index="sessionIndex"
      :is-flipped="isFlipped"
      :current-learn-word="currentLearnWord"
      :mnemonic-text="mnemonicText"
      :mnemonic-loading="mnemonicLoading"
      @flip-card="emit('flip-card')"
      @play-audio="emit('play-audio', $event)"
      @get-mnemonic="emit('get-mnemonic')"
      @open-ai-tutor="emit('open-ai-tutor')"
      @handle-result="emit('handle-result', $event)"
    />

    <VocabularyLearnResultPanel
      v-else
      :session-stats="sessionStats"
      @start-session="emit('start-session')"
    />
  </div>
</template>

<style scoped>
.learn-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 400px;
}

@media (max-width: 768px) {
  .learn-container {
    padding: 10px 0;
  }
}
</style>