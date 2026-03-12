<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { useSpeakingStore } from '@/stores/speaking'
import { useSpeakingPractice } from '@/composables/useSpeakingPractice'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const SpeakingPracticePanel = defineAsyncComponent(() => import('@/components/speaking/SpeakingPracticePanel.vue'))
const SpeakingResultPanel = defineAsyncComponent(() => import('@/components/speaking/SpeakingResultPanel.vue'))
const SpeakingSetupPanel = defineAsyncComponent(() => import('@/components/speaking/SpeakingSetupPanel.vue'))

const message = useMessage()
const speakingStore = useSpeakingStore()
const { locale } = useI18n()

const isEnglish = computed(() => String(locale.value || '').toLowerCase().startsWith('en'))
const L = (zhText, enText) => (isEnglish.value ? enText : zhText)

const {
  step,
  isLoading,
  isPreparingRecording,
  topicData,
  isRecording,
  transcript,
  recordingTime,
  audioLevel,
  visualizerCanvas,
  evaluationResult,
  paginatedHistory,
  historyPage,
  historyPageSize,
  historyTotal,
  settings,
  topicTypes,
  difficulties,
  audioInputOptions,
  selectedAudioInputDeviceId,
  loadHistoryTopic,
  updateSetting,
  refreshAudioInputDevices,
  updateAudioInputDevice,
  generateTopic,
  toggleRecording,
  setTranscript,
  submitResponse,
  restart,
  formatTime
} = useSpeakingPractice({
  message,
  speakingStore,
  isEnglish,
  L
})

const showShare = ref(false)
const shareContent = computed(() => ({
  title: L('我在 LearnSphere AI 完成了一次口语练习', 'I completed a speaking practice on LearnSphere AI'),
  description: isEnglish.value
    ? `I just completed the speaking topic "${topicData.value?.topic || topicData.value?.title || 'Speaking Topic'}". Duration: ${formatTime(recordingTime.value)}.`
    : `我刚刚完成了口语话题“${topicData.value?.topic || topicData.value?.title || '口语话题'}”，时长 ${formatTime(recordingTime.value)}。`,
  url: window.location.href
}))

const showTutor = ref(false)
const tutorContext = computed(() => {
  if (!topicData.value) return null

  return {
    question: topicData.value.description || topicData.value.question,
    topic: topicData.value.topic || topicData.value.title || L('口语话题', 'Speaking Topic'),
    userAnswer: transcript.value,
    explanation: evaluationResult.value ? evaluationResult.value.feedback : null,
    suggestions: evaluationResult.value ? evaluationResult.value.suggestions : null,
    module: 'speaking'
  }
})

const openAITutor = () => {
  showTutor.value = true
}
</script>

<template>
  <div class="page-container">
    <div class="page-header" v-if="step === 'setup'">
      <h1>{{ L('AI 口语练习', 'AI Speaking Practice') }}</h1>
      <p>{{ L('选择话题和难度，开始带实时转写与 AI 评估的引导式口语练习。', 'Choose topic and difficulty, then start a guided speaking session with real-time transcription and AI evaluation.') }}</p>
    </div>

    <SpeakingSetupPanel
      v-if="step === 'setup'"
      :settings="settings"
      :topic-types="topicTypes"
      :difficulties="difficulties"
      :audio-input-options="audioInputOptions"
      :selected-audio-input-device-id="selectedAudioInputDeviceId"
      :topics="paginatedHistory"
      :total="historyTotal"
      :page="historyPage"
      :page-size="historyPageSize"
      :is-loading="isLoading"
      :translate="L"
      @update-setting="updateSetting"
      @refresh-audio-input-devices="refreshAudioInputDevices"
      @update:audio-input-device-id="updateAudioInputDevice"
      @generate="generateTopic"
      @select="loadHistoryTopic"
      @update:page="historyPage = $event"
      @update:page-size="historyPageSize = $event"
    />

    <SpeakingPracticePanel
      v-else-if="step === 'practice' && topicData"
      :topic-data="topicData"
      :is-recording="isRecording"
      :is-preparing-recording="isPreparingRecording"
      :transcript="transcript"
      :recording-time="recordingTime"
      :audio-level="audioLevel"
      :visualizer-canvas="visualizerCanvas"
      :is-loading="isLoading"
      :audio-input-options="audioInputOptions"
      :selected-audio-input-device-id="selectedAudioInputDeviceId"
      :format-time="formatTime"
      :translate="L"
      @restart="restart"
      @toggle-recording="toggleRecording"
      @refresh-audio-input-devices="refreshAudioInputDevices"
      @update:audio-input-device-id="updateAudioInputDevice"
      @update:transcript="setTranscript"
      @submit="submitResponse"
    />

    <SpeakingResultPanel
      v-else-if="step === 'result'"
      :evaluation-result="evaluationResult"
      :show-share="showShare"
      :share-content="shareContent"
      :history-topics="paginatedHistory"
      :history-total="historyTotal"
      :history-page="historyPage"
      :history-page-size="historyPageSize"
      :translate="L"
      @restart="restart"
      @open-tutor="openAITutor"
      @update:show-share="showShare = $event"
      @select-history="loadHistoryTopic"
      @update:history-page="historyPage = $event"
      @update:history-page-size="historyPageSize = $event"
    />

    <AITutor
      :context="tutorContext"
      :auto-open="showTutor"
      @close="showTutor = false"
    />
  </div>
</template>
<style scoped>
.page-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
}
.page-header {
    text-align: center; margin-bottom: 40px;
}
.page-header h1 {
    font-size: 2.5rem; font-weight: 800; margin-bottom: 12px;
    background: linear-gradient(120deg, #fb923c, #db2777);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.page-header p {
    color: var(--secondary-text);
}
</style>
