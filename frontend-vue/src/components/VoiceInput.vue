<template>
  <div class="voice-input-container">
    <div class="voice-controls" :class="{ recording: isRecording }">
      <n-button
        circle
        :size="size"
        :type="isRecording ? 'error' : 'primary'"
        @click="toggleRecording"
        :loading="isStarting || isTranscribing"
      >
        <template #icon>
          <n-icon :component="isRecording ? StopCircle : Mic" :size="iconSize" />
        </template>
      </n-button>

      <div v-if="isRecording" class="ripple-container" :style="{ '--scale': 1 + audioLevel / 80 }">
        <div class="ripple"></div>
        <div class="ripple delay-1"></div>
        <div class="ripple delay-2"></div>
      </div>
    </div>

    <div v-if="showStatus" class="status-text mt-2">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { NButton, NIcon, useMessage } from 'naive-ui'
import { Mic, StopCircle } from 'lucide-vue-next'
import MobileAudioRecorder from '@/utils/mobileAudioRecorder'
import { BrowserSpeechRecognizer, isBrowserSpeechRecognitionSupported } from '@/utils/browserSpeechRecognizer'
import { ensureVoskModel, isVoskLanguageSupported, transcribeAudioBlobWithVosk, VoskSpeechRecognizer } from '@/utils/voskSpeechRecognizer'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  lang: {
    type: String,
    default: 'en-US'
  },
  autoSubmit: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'large'
  },
  iconSize: {
    type: Number,
    default: 24
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  useWhisper: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'error', 'start', 'end'])

const message = useMessage()
const isRecording = ref(false)
const isStarting = ref(false)
const isTranscribing = ref(false)
const statusText = ref('点击麦克风开始说话')
const audioLevel = ref(0)

let currentTranscript = props.modelValue || ''
let finalTranscript = props.modelValue || ''
let mobileRecorder = null
let browserRecognizer = null
let voskRecognizer = null
let recordingStartedAt = 0
let audioContext = null
let analyser = null
let microphone = null
let animationFrameId = null
let analysisStream = null
let recognitionStream = null

const mergeTranscriptText = (baseText, nextSegment) => {
  const normalizedBase = String(baseText || '').replace(/\s+/g, ' ').trim()
  const normalizedSegment = String(nextSegment || '').replace(/\s+/g, ' ').trim()

  if (!normalizedSegment) {
    return normalizedBase
  }

  if (!normalizedBase) {
    return normalizedSegment
  }

  if (
    normalizedBase === normalizedSegment ||
    normalizedBase.endsWith(` ${normalizedSegment}`) ||
    normalizedBase.endsWith(normalizedSegment) ||
    normalizedBase.includes(normalizedSegment)
  ) {
    return normalizedBase
  }

  if (
    normalizedSegment.startsWith(`${normalizedBase} `) ||
    normalizedSegment.startsWith(normalizedBase) ||
    normalizedSegment.includes(normalizedBase)
  ) {
    return normalizedSegment
  }

  const maxOverlap = Math.min(normalizedBase.length, normalizedSegment.length)
  for (let size = maxOverlap; size > 0; size -= 1) {
    if (normalizedBase.slice(-size) === normalizedSegment.slice(0, size)) {
      return `${normalizedBase}${normalizedSegment.slice(size)}`.replace(/\s+/g, ' ').trim()
    }
  }

  return `${normalizedBase} ${normalizedSegment}`.replace(/\s+/g, ' ').trim()
}

watch(
  () => props.modelValue,
  (value) => {
    currentTranscript = value || ''
    finalTranscript = value || ''
  }
)

const cloneMediaStream = (stream) => {
  if (!stream || typeof stream.clone !== 'function') {
    return stream || null
  }

  try {
    return stream.clone()
  } catch (error) {
    console.warn('[VoiceInput] Failed to clone MediaStream, falling back to the original stream.', error)
    return stream
  }
}

const resetAudioLevel = () => {
  audioLevel.value = 0
}

const stopAudioAnalysis = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (microphone) {
    try {
      microphone.disconnect()
    } catch (e) {}
    microphone = null
  }
  if (analyser) {
    try {
      analyser.disconnect()
    } catch (e) {}
    analyser = null
  }
  if (analysisStream) {
    analysisStream.getTracks().forEach(track => track.stop())
    analysisStream = null
  }
  if (recognitionStream) {
    recognitionStream.getTracks().forEach(track => track.stop())
    recognitionStream = null
  }
  if (audioContext) {
    try {
      audioContext.close()
    } catch (e) {}
    audioContext = null
  }
  resetAudioLevel()
}

const startAudioAnalysis = async (stream) => {
  try {
    analysisStream = cloneMediaStream(stream)
    if (!analysisStream) {
      return
    }
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(analysisStream)
    analyser.smoothingTimeConstant = 0.8
    analyser.fftSize = 1024
    microphone.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)
    const updateLevel = () => {
      if (!analyser) return
      animationFrameId = requestAnimationFrame(updateLevel)
      analyser.getByteFrequencyData(data)
      let values = 0
      for (let i = 0; i < data.length; i += 1) {
        values += data[i]
      }
      audioLevel.value = values / data.length
    }

    updateLevel()
  } catch (err) {
    console.error('Audio analysis failed:', err)
  }
}

const updateTranscript = (value) => {
  currentTranscript = value
  emit('update:modelValue', value)
}

const startRecording = async () => {
  if (isRecording.value || isStarting.value || isTranscribing.value) {
    return
  }

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (!window.isSecureContext && !isLocalhost) {
    message.error('浏览器安全限制：Vosk 识别需要 HTTPS 或 localhost。')
    return
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    message.error('当前浏览器无法访问麦克风接口，请使用最新版 Chrome/Edge。')
    return
  }

  isStarting.value = true
  statusText.value = '正在准备 Vosk 模型与麦克风...'
  resetAudioLevel()

  try {
    mobileRecorder?.destroy?.()
    mobileRecorder = new MobileAudioRecorder()
    await mobileRecorder.init()
    await mobileRecorder.startRecording()
    if (mobileRecorder.stream) {
      await startAudioAnalysis(mobileRecorder.stream)
      recognitionStream = cloneMediaStream(mobileRecorder.stream)
    }

    if (!isVoskLanguageSupported(props.lang)) {
      message.warning('当前超轻量 Vosk 模型仅支持英文识别，请尽量使用英文语音输入。', { duration: 7000 })
    }

    finalTranscript = currentTranscript.trim()
    if (isBrowserSpeechRecognitionSupported()) {
      statusText.value = '正在使用浏览器语音识别...'
      browserRecognizer = new BrowserSpeechRecognizer({
        lang: props.lang,
        onStatusChange: (status) => {
          statusText.value = status === 'listening' ? '正在使用浏览器语音识别...' : '录音已停止'
        },
        onPartialResult: (partial) => {
          updateTranscript(mergeTranscriptText(finalTranscript, partial))
        },
        onFinalResult: (text) => {
          if (!text) {
            return
          }
          finalTranscript = mergeTranscriptText(finalTranscript, text)
          updateTranscript(finalTranscript)
        },
        onError: (error) => {
          const errorCode = String(error?.error || '').toLowerCase()
          if (errorCode && errorCode !== 'aborted') {
            console.warn(`Browser speech recognition error: ${errorCode}`)
          }
        }
      })
      await browserRecognizer.start()
    } else {
      await ensureVoskModel()
      statusText.value = '正在使用 Vosk 实时识别...'
      voskRecognizer = new VoskSpeechRecognizer({
        lang: props.lang,
        onStatusChange: (status) => {
          statusText.value = status === 'listening' ? '正在使用 Vosk 实时识别...' : '录音已停止'
        },
        onPartialResult: (partial) => {
          updateTranscript(mergeTranscriptText(finalTranscript, partial))
        },
        onFinalResult: (text) => {
          if (!text) {
            return
          }
          finalTranscript = mergeTranscriptText(finalTranscript, text)
          updateTranscript(finalTranscript)
        },
        onError: (error) => {
          console.error('Vosk recognition error:', error)
          emit('error', error)
        }
      })

      await voskRecognizer.start(recognitionStream || mobileRecorder.stream)
    }

    isRecording.value = true
    recordingStartedAt = Date.now()
    isStarting.value = false
    statusText.value = '正在使用 Vosk 实时识别...'
    emit('start')
  } catch (e) {
    isStarting.value = false
    console.error('Failed to start recording', e)
    const errorMessage = e?.message || ''
    if (errorMessage.includes('Permission') || e?.name === 'NotAllowedError') {
      message.error('麦克风权限被拒绝，请在浏览器设置中允许访问')
    } else {
      message.error(`无法启动 Vosk 识别：${errorMessage}`)
    }
  }
}

const stopRecording = async (reason = 'unknown') => {
  if (!isRecording.value) {
    return
  }

  console.log(`[VoiceInput] stopRecording called. reason=${reason}, transcriptLength=${currentTranscript.trim().length}, recorderActive=${Boolean(mobileRecorder?.isRecording)}`)
  isRecording.value = false
  isTranscribing.value = true
  recordingStartedAt = 0

  if (browserRecognizer) {
    const browserRecognitionResult = await browserRecognizer.stop()
    if (!currentTranscript.trim() && browserRecognitionResult?.finalText) {
      finalTranscript = browserRecognitionResult.finalText
      updateTranscript(browserRecognitionResult.finalText)
    }
    browserRecognizer = null
  }

  if (voskRecognizer) {
    await voskRecognizer.stop()
    voskRecognizer = null
  }

  if (mobileRecorder?.isRecording) {
    try {
      const recordingResult = await mobileRecorder.stopRecording()
      if (!currentTranscript.trim() && recordingResult?.blob) {
        statusText.value = '正在使用 Vosk 离线补全转写...'
        const offlineTranscript = await transcribeAudioBlobWithVosk(recordingResult.blob)
        if (offlineTranscript) {
          finalTranscript = offlineTranscript
          updateTranscript(offlineTranscript)
        }
      }
    } catch (e) {
      console.error('MobileRecorder stop error:', e)
    } finally {
      mobileRecorder.destroy()
      mobileRecorder = null
    }
  }

  stopAudioAnalysis()
  isTranscribing.value = false
  statusText.value = '识别完成'

  if (props.autoSubmit && currentTranscript.trim()) {
    emit('submit', currentTranscript)
  }
  emit('end', currentTranscript)
}

const toggleRecording = () => {
  if (isRecording.value) {
    if (Date.now() - recordingStartedAt < 1200) {
      console.warn('[VoiceInput] Ignored duplicate stop trigger during recorder warm-up window.')
      return
    }
    void stopRecording('toggle')
  } else {
    void startRecording()
  }
}

onUnmounted(() => {
  void stopRecording('unmount')
})
</script>

<style scoped>
.voice-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.voice-controls {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.status-text {
  font-size: 0.85rem;
  color: var(--secondary-text, #a1a1aa);
  margin-top: 12px;
  text-align: center;
  transition: color 0.3s;
}

.recording .status-text {
  color: #3b82f6;
  animation: pulse-text 2s infinite;
}

.recording .ripple {
  animation: ripple 1.2s infinite ease-out;
  transform: scale(var(--scale, 1));
}

.ripple-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.ripple {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(239, 68, 68, 0.4);
  animation: ripple-animation 1.5s linear infinite;
  opacity: 0;
}

.delay-1 {
  animation-delay: 0.5s;
}

.delay-2 {
  animation-delay: 1s;
}

@keyframes ripple-animation {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
