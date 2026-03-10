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

    <div class="status-text mt-2" v-if="showStatus">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { NButton, NIcon, useMessage } from 'naive-ui'
import { Mic, StopCircle } from 'lucide-vue-next'
import MobileAudioRecorder from '@/utils/mobileAudioRecorder'

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

let recognition = null
let recognitionRestartTimer = null
let currentTranscript = props.modelValue || ''
let mobileRecorder = null
let audioContext = null
let analyser = null
let microphone = null
let animationFrameId = null
let analysisStream = null

watch(
  () => props.modelValue,
  (value) => {
    currentTranscript = value || ''
  }
)

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
  resetAudioLevel()
}

const startAudioAnalysis = async (stream) => {
  try {
    analysisStream = stream
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    analyser = audioContext.createAnalyser()
    microphone = audioContext.createMediaStreamSource(stream)
    analyser.smoothingTimeConstant = 0.8
    analyser.fftSize = 1024
    microphone.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)
    const updateLevel = () => {
      if (!analyser) return
      animationFrameId = requestAnimationFrame(updateLevel)
      analyser.getByteFrequencyData(data)
      let values = 0
      for (let i = 0; i < data.length; i++) {
        values += data[i]
      }
      audioLevel.value = values / data.length
    }

    updateLevel()
  } catch (err) {
    console.error('Audio analysis failed:', err)
  }
}

const handleRecognitionResult = (event) => {
  const newText = Array.from(event.results)
    .map(result => result?.[0]?.transcript || '')
    .join('')
    .trim()

  currentTranscript = newText
  emit('update:modelValue', newText)
  statusText.value = props.useWhisper ? '正在倾听（实时转写中）...' : '正在识别中...'
}

const initRecognition = () => {
  if (recognition) return

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    message.warning('您的浏览器不支持语音识别，请手动输入文字。')
    return
  }

  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = props.lang
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    audioLevel.value = Math.max(audioLevel.value, 8)
    statusText.value = props.useWhisper ? '正在倾听（浏览器实时转写 + 本地录音）...' : '正在倾听（浏览器免费识别）...'
  }

  recognition.onaudiostart = () => {
    audioLevel.value = Math.max(audioLevel.value, 12)
  }

  recognition.onsoundstart = () => {
    audioLevel.value = 35
  }

  recognition.onspeechstart = () => {
    audioLevel.value = 55
  }

  recognition.onspeechend = () => {
    if (isRecording.value) {
      audioLevel.value = 8
    }
  }

  recognition.onresult = handleRecognitionResult

  recognition.onerror = (event) => {
    console.warn('Speech recognition interim error', event.error)
    if (event.error === 'no-speech') {
      statusText.value = '暂未检测到连续语音，正在自动重试...'
      return
    }
    if (!props.useWhisper) {
      statusText.value = `请求错误: ${event.error}`
      emit('error', event.error)
    }
  }

  recognition.onend = () => {
    if (isRecording.value && !props.useWhisper) {
      clearTimeout(recognitionRestartTimer)
      recognitionRestartTimer = setTimeout(() => {
        try {
          recognition.start()
        } catch (e) {
          console.warn('Recognition auto restart failed', e)
        }
      }, 250)
    }
  }
}

const handleWhisperTranscription = async (blob) => {
  isTranscribing.value = true
  statusText.value = '正在高精识别中...'

  try {
    const { aiApi } = await import('@/api/ai')
    const res = await aiApi.transcribe(blob)
    if (res.code === 200) {
      currentTranscript = res.data
      emit('update:modelValue', res.data)
      statusText.value = '识别完成'
      if (props.autoSubmit) {
        emit('submit', res.data)
      }
    } else {
      throw new Error(res.message)
    }
  } catch (e) {
    console.error('Whisper transcription failed', e)
    message.warning('高精识别失败，已保留浏览器实时识别结果')
  } finally {
    isTranscribing.value = false
    emit('end', currentTranscript)
  }
}

const startRecording = async () => {
  if (isRecording.value || isStarting.value || isTranscribing.value) {
    return
  }

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (!window.isSecureContext && !isLocalhost) {
    message.error('浏览器安全限制：免费语音识别需要 HTTPS 或 localhost。')
    return
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    message.error('当前浏览器无法访问麦克风接口，请使用最新版 Chrome/Edge。')
    return
  }

  if (!recognition) {
    initRecognition()
  }

  isStarting.value = true
  statusText.value = '正在准备麦克风...'
  clearTimeout(recognitionRestartTimer)
  recognitionRestartTimer = null
  resetAudioLevel()

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1
      }
    })

    if (props.useWhisper) {
      mobileRecorder = new MobileAudioRecorder()
      await mobileRecorder.init()
      const recordingInfo = await mobileRecorder.startRecording()
      console.log('[VoiceInput] Recording started with MIME type:', recordingInfo.mimeType)
      await startAudioAnalysis(stream)
    } else {
      stream.getTracks().forEach(track => track.stop())
    }

    if (recognition) {
      recognition.start()
    }

    isRecording.value = true
    isStarting.value = false
    statusText.value = props.useWhisper ? '正在倾听（浏览器实时转写 + 本地录音）...' : '正在倾听（浏览器免费识别）...'
    emit('start')
  } catch (e) {
    isStarting.value = false
    console.error('Failed to start recording', e)
    const errorMessage = e?.message || ''
    if (errorMessage.includes('Permission') || e?.name === 'NotAllowedError') {
      message.error('麦克风权限被拒绝，请在浏览器设置中允许访问')
    } else {
      message.error('无法启动录音：' + errorMessage)
    }
  }
}

const stopRecording = async () => {
  if (!isRecording.value) {
    return
  }

  isRecording.value = false
  clearTimeout(recognitionRestartTimer)
  recognitionRestartTimer = null

  if (recognition) {
    try {
      recognition.stop()
    } catch (e) {}
  }

  if (mobileRecorder && mobileRecorder.isRecording) {
    try {
      const result = await mobileRecorder.stopRecording()
      console.log('[VoiceInput] Audio recorded:', result)
      await handleWhisperTranscription(result.blob)
    } catch (e) {
      console.error('MobileRecorder stop error:', e)
      emit('end', currentTranscript)
    }
  } else {
    if (props.autoSubmit && currentTranscript) {
      emit('submit', currentTranscript)
    }
    emit('end', currentTranscript)
  }

  stopAudioAnalysis()
  statusText.value = '录音已停止'
}

const toggleRecording = () => {
  if (isRecording.value) {
    void stopRecording()
  } else {
    void startRecording()
  }
}

onUnmounted(() => {
  clearTimeout(recognitionRestartTimer)
  recognitionRestartTimer = null
  void stopRecording()
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
