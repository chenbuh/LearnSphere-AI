<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { useSpeakingStore } from '@/stores/speaking'
import { useSpeakingPractice } from '@/composables/useSpeakingPractice'
import PracticeStageHeader from '@/components/learning/PracticeStageHeader.vue'

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

const transcriptWordCount = computed(() => {
  const text = String(transcript.value || '').trim()
  return text ? text.split(/\s+/).filter(Boolean).length : 0
})

const currentDifficultyLabel = computed(() => {
  return difficulties.value.find(item => item.value === settings.value.difficulty)?.label || settings.value.difficulty
})

const currentTopicTypeLabel = computed(() => {
  return topicTypes.value.find(item => item.value === settings.value.type)?.label || settings.value.type
})

const headerTitle = computed(() => {
  if (step.value === 'practice') return L('口语作答', 'Speaking Response')
  if (step.value === 'result') return L('评估结果', 'Evaluation Result')
  return L('AI 口语练习', 'AI Speaking Practice')
})

const headerDescription = computed(() => {
  if (step.value === 'practice') {
    return L(
      '请根据题目完成录音，系统会同步显示转写内容。',
      'Record your response based on the prompt, and the transcript will appear as you go.'
    )
  }
  if (step.value === 'result') {
    return L(
      '先看整体得分和维度反馈，再决定继续追问 AI 助手还是重新开一题。',
      'Review the overall score and dimension feedback first, then decide whether to ask the AI tutor or start a new topic.'
    )
  }
  return L(
    '先确定话题类型、难度和输入设备，再开始本次口语练习。',
    'Choose topic type, difficulty, and input device first, then start the speaking practice.'
  )
})

const headerSummary = computed(() => {
  if (step.value === 'practice') {
    return [
      { label: L('话题类型', 'Topic'), value: currentTopicTypeLabel.value },
      { label: L('难度', 'Difficulty'), value: currentDifficultyLabel.value },
      { label: L('时长', 'Duration'), value: formatTime(recordingTime.value) },
      { label: L('转写词数', 'Transcript'), value: `${transcriptWordCount.value}` }
    ]
  }

  if (step.value === 'result') {
    return [
      { label: L('总分', 'Score'), value: `${Math.round(Number(evaluationResult.value?.score || 0))}` },
      { label: L('流利度', 'Fluency'), value: `${Math.round(Number(evaluationResult.value?.fluency || 0))}` },
      { label: L('语法', 'Grammar'), value: `${Math.round(Number(evaluationResult.value?.grammar || 0))}` },
      { label: L('切题度', 'Relevance'), value: `${Math.round(Number(evaluationResult.value?.relevance || 0))}` }
    ]
  }

  return [
    { label: L('话题类型', 'Topic'), value: currentTopicTypeLabel.value },
    { label: L('难度', 'Difficulty'), value: currentDifficultyLabel.value },
    { label: L('设备', 'Input'), value: selectedAudioInputDeviceId.value ? L('已选择麦克风', 'Selected mic') : L('默认麦克风', 'Default mic') },
    { label: L('历史题目', 'History'), value: `${historyTotal.value}` }
  ]
})
</script>

<template>
  <div class="page-container">
    <PracticeStageHeader
      kicker="口语练习"
      :title="headerTitle"
      :description="headerDescription"
      :summary-items="headerSummary"
      accent-start="#fb923c"
      accent-end="#ea580c"
      :compact="step !== 'setup'"
    />

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
  position: relative;
  max-width: 1480px;
  margin: 28px auto 56px;
  padding: 0 28px;
}

@media (max-width: 900px) {
  .page-container {
    margin: 18px auto 24px;
    padding: 0 10px;
  }
}
</style>
