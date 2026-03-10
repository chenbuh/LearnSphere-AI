<script setup>
import ListeningAudioBlock from '@/components/listening/ListeningAudioBlock.vue'
import ListeningQuestionCard from '@/components/listening/ListeningQuestionCard.vue'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  hasAudioMetadata: {
    type: Boolean,
    default: false
  },
  audioProgressPercent: {
    type: Number,
    default: 0
  },
  audioProgress: {
    type: Number,
    default: 0
  },
  audioDuration: {
    type: Number,
    default: 0
  },
  formatAudioTime: {
    type: Function,
    required: true
  },
  currentGlobalIndex: {
    type: Number,
    default: 0
  },
  currentQuestion: {
    type: Object,
    default: null
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  currentQuestionInPassage: {
    type: Number,
    default: 0
  },
  totalQuestionsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-audio', 'select-answer', 'prev-question', 'next-or-submit'])
</script>

<template>
  <div class="practice-panel">
    <ListeningAudioBlock
      :translate="props.translate"
      :is-playing="props.isPlaying"
      :current-passage-index="props.currentPassageIndex"
      :has-audio-metadata="props.hasAudioMetadata"
      :audio-progress-percent="props.audioProgressPercent"
      :audio-progress="props.audioProgress"
      :audio-duration="props.audioDuration"
      :format-audio-time="props.formatAudioTime"
      @toggle-audio="emit('toggle-audio')"
    />

    <ListeningQuestionCard
      :translate="props.translate"
      :current-global-index="props.currentGlobalIndex"
      :current-question="props.currentQuestion"
      :answers-per-passage="props.answersPerPassage"
      :current-passage-index="props.currentPassageIndex"
      :current-question-in-passage="props.currentQuestionInPassage"
      :total-questions-count="props.totalQuestionsCount"
      @select-answer="(questionIndex, optionIndex) => emit('select-answer', questionIndex, optionIndex)"
      @prev-question="emit('prev-question')"
      @next-or-submit="emit('next-or-submit')"
    />
  </div>
</template>

<style scoped>
.practice-panel {
  display: flex;
  flex-direction: column;
}
</style>