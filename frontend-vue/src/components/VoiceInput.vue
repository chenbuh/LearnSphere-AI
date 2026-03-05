<template>
  <div class="voice-input-container">
    <div class="voice-controls" :class="{ recording: isRecording }">
      <n-button
        circle
        :size="size"
        :type="isRecording ? 'error' : 'primary'"
        @click="toggleRecording"
        :loading="isStarting"
      >
        <template #icon>
          <n-icon :component="isRecording ? StopCircle : Mic" :size="iconSize" />
        </template>
      </n-button>
      
      <!-- 语音波纹效果 -->
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
    default: true 
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
let currentTranscript = ''

// 音频录制相关 (用于 Whisper)
let mobileRecorder = null

// 音频分析相关
let audioContext = null
let analyser = null
let microphone = null
let javascriptNode = null

const initRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = props.lang

    recognition.onresult = (event) => {
      const newText = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      
      currentTranscript = newText
      emit('update:modelValue', newText)
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition interim error', event.error)
      if (!props.useWhisper && event.error !== 'no-speech') {
          statusText.value = `请求错误: ${event.error}`
      }
    }
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = async () => {
  if (!recognition && !props.useWhisper) {
    initRecognition()
  }

  isStarting.value = true
  statusText.value = '正在准备麦克风...'

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    if (props.useWhisper) {
        mobileRecorder = new MobileAudioRecorder()
        await mobileRecorder.init()
        const recordingInfo = await mobileRecorder.startRecording()

        console.log('[VoiceInput] Recording started with MIME type:', recordingInfo.mimeType)

        const browserInfo = MobileAudioRecorder.getBrowserInfo()
        if (browserInfo.isIOS) {
            message.info('iOS 检测：已优化录音格式', { duration: 2000 })
        }
    }

    if (recognition) {
        try {
            recognition.start()
        } catch (e) {
            console.warn('Could not start interim recognition', e)
        }
    }

    isRecording.value = true
    isStarting.value = false
    statusText.value = props.useWhisper ? '正在倾听 (Whisper 高精模式)...' : '正在倾听...'
    emit('start')
    startAudioAnalysis(stream)

  } catch (e) {
    isStarting.value = false
    console.error('Failed to start recording', e)

    if (e.message.includes('Permission')) {
        message.error('麦克风权限被拒绝，请在浏览器设置中允许访问')
    } else {
        message.error('无法启动录音：' + e.message)
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
        message.warning('Whisper 识别失败，保留实时识别结果')
    } finally {
        isTranscribing.value = false
        emit('end', currentTranscript)
    }
}

const stopRecording = async () => {
  if (isRecording.value) {
    isRecording.value = false
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
        }
    }

    stopAudioAnalysis()
    statusText.value = '录音已停止'
  }
}

const startAudioAnalysis = async (stream) => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        analyser = audioContext.createAnalyser()
        microphone = audioContext.createMediaStreamSource(stream)
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1)

        analyser.smoothingTimeConstant = 0.8
        analyser.fftSize = 1024

        microphone.connect(analyser)
        analyser.connect(javascriptNode)
        javascriptNode.connect(audioContext.destination)
        
        javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(array)
            let values = 0
            for (let i = 0; i < array.length; i++) {
                values += array[i]
            }
            audioLevel.value = values / array.length
        }
    } catch (err) {
        console.error('Audio analysis failed:', err)
    }
}

const stopAudioAnalysis = () => {
    if (javascriptNode) {
        javascriptNode.onaudioprocess = null
        javascriptNode.disconnect()
    }
    if (microphone) {
        microphone.disconnect()
    }
    audioLevel.value = 0
}

onUnmounted(() => {
    stopRecording()
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

@keyframes pulse-text {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}
</style>
