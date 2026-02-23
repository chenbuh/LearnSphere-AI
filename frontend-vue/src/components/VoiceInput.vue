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
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'error', 'start', 'end'])

const message = useMessage()
const isRecording = ref(false)
const isStarting = ref(false)
const statusText = ref('点击麦克风开始说话')
const audioLevel = ref(0) // 音量分贝
let recognition = null
let currentTranscript = ''

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

    recognition.onstart = () => {
      isRecording.value = true
      isStarting.value = false
      statusText.value = '正在倾听...'
      emit('start')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }

      const newText = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      
      currentTranscript = newText
      emit('update:modelValue', newText)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      isRecording.value = false
      isStarting.value = false
      let errorMsg = '语音识别失败'
      
      switch (event.error) {
        case 'not-allowed':
          errorMsg = '请允许麦克风访问权限。如果已禁止，请在浏览器地址栏左侧点击“设置”图标重新开启。'
          message.error(errorMsg)
          break
        case 'no-speech':
          errorMsg = '未检测到声音，请打大声一点重试'
          break
        case 'network':
          errorMsg = '网络连接异常，语音识别需要网络支持'
          message.error(errorMsg)
          break
        case 'service-not-allowed':
          errorMsg = '语音识别服务暂时不可用'
          message.error(errorMsg)
          break
        default:
          errorMsg = `语音错误: ${event.error}`
      }
      
      statusText.value = errorMsg
      emit('error', event.error)
    }

    recognition.onend = () => {
      console.log('Speech recognition ended')
      if (isRecording.value) {
        // 如果是意外中断（如长时间停顿），尝试重启
        try {
          recognition.start()
        } catch (e) {
          isRecording.value = false
          isStarting.value = false
          statusText.value = '录音已结束'
          emit('end', currentTranscript)
        }
      } else {
        isStarting.value = false
        statusText.value = '录音已结束'
        emit('end', currentTranscript)
        if (props.autoSubmit && currentTranscript) {
           emit('submit', currentTranscript)
        }
      }
    }
  } else {
    message.warning('您的浏览器不支持语音识别功能，请使用 Chrome/Edge 浏览器')
    emit('error', 'not-supported')
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = () => {
  if (!recognition) {
    initRecognition()
  }
  
  if (recognition) {
    isStarting.value = true
    statusText.value = '正在准备麦克风...'
    
    // 设置一个超时，如果 5 秒后还没开始录音，重置状态
    const startTimeout = setTimeout(() => {
      if (isStarting.value && !isRecording.value) {
        isStarting.value = false
        message.warning('启动语音识别超时，请检查麦克风权限或刷新页面')
      }
    }, 5000)

    try {
      // 预检：检查安全上下文
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (!window.isSecureContext && !isLocalhost) {
        clearTimeout(startTimeout)
        const devUrl = `${window.location.protocol}//${window.location.host}`
        message.error(`Chrome 安全限制：语音识别仅支持 HTTPS 或 localhost。
        若需在当前 IP 使用，请访问 chrome://flags/#unsafely-treat-insecure-origin-as-secure 
        并将 ${devUrl} 添加到白名单。`, { duration: 10000 })
        isStarting.value = false
        return
      }

      currentTranscript = props.modelValue 
      recognition.start()
      
      // 注意：recognition.onstart 会负责清除 startTimeout 并设置 isRecording=true
      recognition.onstart = () => {
        clearTimeout(startTimeout)
        isRecording.value = true
        isStarting.value = false
        statusText.value = '正在倾听...'
        emit('start')
        startAudioAnalysis() // 启动音量分析
      }
    } catch (e) {
      clearTimeout(startTimeout)
      isStarting.value = false
      console.error('Failed to start recording', e)
    }
  }
}

/**
 * 启动音量实时分析
 */
const startAudioAnalysis = async () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
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

const stopRecording = () => {
  if (recognition) {
    isRecording.value = false
    recognition.stop()
    stopAudioAnalysis()
  }
}

onUnmounted(() => {
  if (recognition) {
    isRecording.value = false
    recognition.stop()
  }
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
