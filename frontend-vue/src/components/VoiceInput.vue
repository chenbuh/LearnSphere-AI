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
      <div v-if="isRecording" class="ripple-container">
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
let recognition = null
let currentTranscript = ''

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
          errorMsg = '请允许麦克风访问权限'
          break
        case 'no-speech':
          errorMsg = '未检测到声音，请重试'
          break
        case 'network':
          errorMsg = '网络连接异常导致语音识别失败'
          break
      }
      
      statusText.value = errorMsg
      emit('error', event.error)
    }

    recognition.onend = () => {
      if (isRecording.value) {
        // 如果是意外中断（如长时间停顿），尝试重启
        try {
          recognition.start()
        } catch (e) {
          isRecording.value = false
          statusText.value = '录音已结束'
          emit('end', currentTranscript)
          if (props.autoSubmit && currentTranscript) {
            emit('submit', currentTranscript)
          }
        }
      } else {
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
    try {
      currentTranscript = props.modelValue // 接续之前的内容
      recognition.start()
    } catch (e) {
      isStarting.value = false
      console.error('Failed to start recording', e)
    }
  }
}

const stopRecording = () => {
  if (recognition) {
    isRecording.value = false
    recognition.stop()
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
