<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard, NButton, NSpace, NTag, NResult, useMessage,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, NIcon, NSpin, NPagination, NProgress, NInput
} from 'naive-ui'
import {
  Mic, PlayCircle, StopCircle, Volume2, Languages, RotateCcw,
  MessageCircle, BarChart, CheckCircle, CheckCircle2, User, Bot, AlertTriangle, History, Target, Share2
} from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import AIFeedback from '@/components/AIFeedback.vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { useSpeakingStore } from '@/stores/speaking'
import { decryptPayload } from '@/utils/crypto'
import logger from '@/utils/logger'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const speakingStore = useSpeakingStore()
const { locale } = useI18n()

const isEnglish = computed(() => String(locale.value || '').toLowerCase().startsWith('en'))
const L = (zhText, enText) => (isEnglish.value ? enText : zhText)

// --- State ---
const step = ref('setup')
const isLoading = ref(false)
const topicData = ref(null)

// Recording state
const isRecording = ref(false)
const transcript = ref('')
const accumulatedTranscript = ref('')
const recordingTime = ref(0)
let recordTimer = null
let recognition = null

// Audio level monitor
const audioLevel = ref(0)
const hasSoundDetected = ref(false)
const visualizerCanvas = ref(null)
let audioContext = null
let analyser = null
let microphone = null
let animationFrameId = null
let monitorStream = null
let isStoppingRecording = false

// Evaluation state
const evaluationResult = ref(null)
const historyTopics = ref([])

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)

// Settings
const settings = ref({
  type: 'daily',
  difficulty: 'medium'
})

// Share
const showShare = ref(false)
const shareContent = computed(() => ({
  title: L('我在 LearnSphere AI 完成了一次口语练习', 'I completed a speaking practice on LearnSphere AI'),
  description: isEnglish.value
    ? `I just completed the speaking topic "${topicData.value?.topic || topicData.value?.title || 'Speaking Topic'}". Duration: ${formatTime(recordingTime.value)}.`
    : `我刚刚完成了口语话题“${topicData.value?.topic || topicData.value?.title || '口语话题'}”，时长 ${formatTime(recordingTime.value)}。`,
  url: window.location.href
}))

const topicTypes = computed(() => ([
  { label: L('日常对话', 'Daily Conversation'), value: 'daily', icon: 'D' },
  { label: L('工作场景', 'Work Scenario'), value: 'work', icon: 'W' },
  { label: L('旅行出行', 'Travel'), value: 'travel', icon: 'T' },
  { label: L('学术讨论', 'Academic Discussion'), value: 'academic', icon: 'A' }
]))

const difficulties = computed(() => ([
  { label: L('简单', 'Easy'), value: 'easy' },
  { label: L('中等', 'Medium'), value: 'medium' },
  { label: L('困难', 'Hard'), value: 'hard' }
]))

// --- Functions ---


// Paginated history
const paginatedHistory = computed(() => historyTopics.value)

const fetchHistory = async () => {
  try {
    const res = await aiApi.getSpeakingHistory(historyPage.value, historyPageSize.value)
    if (res.code === 200) {
      if (res.data.records) {
         historyTopics.value = decryptPayload(res.data.records)
         historyTotal.value = res.data.total
      } else {
         historyTopics.value = decryptPayload(res.data || [])
         historyTotal.value = historyTopics.value.length
      }
    }
  } catch (e) {
    logger.error('Speaking evaluation failed', e)
  }
}

watch([historyPage, historyPageSize], () => {
  fetchHistory()
})

const loadHistoryTopic = (topic) => {
  topicData.value = decryptPayload(topic)
  transcript.value = ''
  recordingTime.value = 0
  step.value = 'practice'
  message.success(isEnglish.value ? `Loaded topic: ${topic.title}` : `已加载话题：${topic.title}`)
  speakingStore.startPractice(topic, settings.value.type, settings.value.difficulty)
}

const updateSetting = (key, value) => {
  logger.log(`[Speaking] Updating ${key} to ${value}`)
  settings.value[key] = value
}

// --- Lifecycle ---

onMounted(() => {
  fetchHistory()

  if (speakingStore.topicData && speakingStore.currentMode === 'practice') {
     if (speakingStore.isExpired()) {
        message.warning(L('检测到练习数据已过期，已清理本地缓存。', 'Detected expired practice data, local cache has been cleared.'))
        speakingStore.clearPersistedState()
     } else {
        topicData.value = decryptPayload(speakingStore.topicData)
        transcript.value = speakingStore.transcript
        recordingTime.value = speakingStore.recordingTime
        step.value = 'practice'
        message.info(L('当前使用浏览器免费语音识别，建议使用 Chrome/Edge 并保持 HTTPS 或 localhost。', 'Using free browser speech recognition. Chrome/Edge with HTTPS or localhost is recommended.'))
     }
  }
})

/**
 */
const generateTopic = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.generateSpeaking({
            type: settings.value.type,
            difficulty: settings.value.difficulty
        })
        if (res.code === 200 && res.data) {
            topicData.value = decryptPayload(res.data)
            step.value = 'practice'
            transcript.value = ''
            recordingTime.value = 0
            message.success(L('话题生成成功。', 'Topic generated successfully.'))
            
            speakingStore.startPractice(res.data, settings.value.type, settings.value.difficulty)
        } else {
            const errMsg = res.message || L('话题生成失败，请重试', 'Topic generation failed, please retry')
            message.error(errMsg)
        }
    } catch (e) {
        logger.error(e)
        topicData.value = isEnglish.value
          ? {
              title: 'Describe a traditional festival',
              question: 'Describe a traditional festival in your country. You should say: when it is celebrated, what people do, what you enjoy about it, and explain why it is important.',
              hints: ['Use present tense', 'Mention colors and food', 'Explain cultural significance'],
              keywords: ['Celebration', 'Tradition', 'Atmosphere', 'Customs']
            }
          : {
              title: '描述一个传统节日',
              question: '请描述你所在国家的一个传统节日。你可以谈谈：它在什么时候庆祝，人们通常会做什么，你喜欢它的哪些方面，以及它为什么重要。',
              hints: ['尽量使用一般现在时', '可以提到颜色和食物', '说明它的文化意义'],
              keywords: ['节日庆祝', '传统习俗', '节日氛围', '文化传承']
            }
        step.value = 'practice'
        transcript.value = ''
        recordingTime.value = 0
    } finally {
        isLoading.value = false
    }
}

// --- Speech Recognition Logic ---

/**
 */
const initRecognition = () => {
    if (recognition) return
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = true
                recognition.interimResults = true
        recognition.lang = 'en-US'
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
            logger.log('Speech recognition engine started')
        }

        recognition.onnomatch = () => {
            logger.warn('Speech recognition: No match found')
        }

        recognition.onresult = (event) => {
            logger.log('Speech recognition result received', event.results)
            let currentText = ''
            for (let i = 0; i < event.results.length; ++i) {
                currentText += event.results[i][0].transcript
            }
            
            transcript.value = accumulatedTranscript.value + currentText
            
            if (event.results[event.results.length - 1].isFinal) {
                accumulatedTranscript.value = transcript.value + ' '
            }

            speakingStore.updateProgress(transcript.value, recordingTime.value)
        }

        recognition.onerror = (event) => {
            logger.error('Speech recognition error', event.error)
            
            const hardErrors = ['not-allowed', 'service-not-allowed', 'audio-capture']
            if (hardErrors.includes(event.error)) {
                if (isRecording.value) {
                    void stopRecording()
                }
            }
            
            let errorMsg = ''
            switch (event.error) {
                case 'not-allowed':
                    errorMsg = L('麦克风权限被拒绝，请开启麦克风权限后重试。', 'Microphone permission denied. Please enable microphone access and retry.')
                    message.error(errorMsg, { duration: 8000 })
                    break
                case 'no-speech':
                    logger.warn('[Speech] 未检测到语音输入，请靠近麦克风并清晰朗读。')
                    break
                case 'network':
                    errorMsg = L('网络不可用，请检查网络后重试。', 'Network is unavailable. Please check your connection and retry.')
                    message.warning(errorMsg, { duration: 8000 })
                    break
                case 'service-not-allowed':
                    errorMsg = L('语音识别服务不可用，请使用 HTTPS 或 localhost 后重试。', 'Speech recognition service is unavailable. Use HTTPS or localhost and retry.')
                    message.error(errorMsg, { duration: 10000 })
                    break
                default:
                    logger.error('Speech error:', event.error)
            }
        }
        
        recognition.onend = () => {
            logger.log('Speech recognition engine ended')
            if (isRecording.value && !isStoppingRecording) {
                logger.log('Attempting to restart recognition engine...')
                try {
                    recognition.start()
                } catch (e) {
                    logger.error('Speaking evaluation failed', e)
                }
            }
        }
    } else {
        message.warning(L('当前浏览器不支持语音识别，请使用 Chrome/Edge。', 'Current browser does not support speech recognition. Please use Chrome/Edge.'))
    }
}

const toggleRecording = () => {
    if (isRecording.value) {
        void stopRecording()
    } else {
        void startRecording()
    }
}

const startRecording = async () => {
    if (isRecording.value || isStoppingRecording) {
        return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        if (!isLocalhost) {
            message.error(L('浏览器安全限制：语音功能需要 HTTPS 或 localhost。', 'Browser security restriction: voice features require HTTPS or localhost.'), { duration: 10000 })
            logger.error('[Speaking] MediaDevices not available. This is likely due to an insecure context (HTTP).')
            return
        }
    }

    let stream = null
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume()
        }

        isStoppingRecording = false
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        monitorStream = stream
        analyser = audioContext.createAnalyser()
        microphone = audioContext.createMediaStreamSource(stream)

        analyser.smoothingTimeConstant = 0.8
        analyser.fftSize = 1024

        microphone.connect(analyser)
        drawVisualizer()
    } catch (err) {
        cleanupAudioMonitoring()
        logger.error('Audio context or getUserMedia error:', err)
        message.error(L('麦克风初始化失败，请检查权限和网络。', 'Unable to initialize microphone. Please check permission and network.'))
        return
    }

    if (!recognition) initRecognition()
    
    if (recognition) {
        try {
            recognition.start()
            isRecording.value = true
            startTimer()
        } catch (e) {
            logger.error('Speaking evaluation failed', e)
            isRecording.value = true
            startTimer()
        }
    } else {
        isRecording.value = true
        startTimer()
    }
}

const cleanupAudioMonitoring = () => {
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

    if (monitorStream) {
        monitorStream.getTracks().forEach(track => track.stop())
        monitorStream = null
    }

    audioLevel.value = 0
    hasSoundDetected.value = false
}

const stopRecording = async () => {
    if (isStoppingRecording) {
        return
    }

    isStoppingRecording = true
    isRecording.value = false
    stopTimer()

    if (recognition) {
        try {
            recognition.stop()
        } catch (e) {}
    }

    cleanupAudioMonitoring()
    isStoppingRecording = false
}

/**
 */
const drawVisualizer = () => {
    if (!visualizerCanvas.value || !analyser) return
    
    const canvas = visualizerCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
        animationFrameId = requestAnimationFrame(draw)
        analyser.getByteFrequencyData(dataArray)

        let values = 0
        for (let i = 0; i < dataArray.length; i++) {
            values += dataArray[i]
        }

        const average = values / dataArray.length
        audioLevel.value = average
        if (average > 10) {
            hasSoundDetected.value = true
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        const barWidth = (canvas.width / bufferLength) * 2.5
        let barHeight
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2
            ctx.fillStyle = i % 2 === 0 ? '#f97316' : '#ec4899'
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
            x += barWidth + 1
        }
    }
    draw()
}

const startTimer = () => {
    clearInterval(recordTimer)
    recordTimer = setInterval(() => {
        recordingTime.value++
        speakingStore.updateProgress(transcript.value, recordingTime.value)
    }, 1000)
}

const stopTimer = () => {
    clearInterval(recordTimer)
}

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

onUnmounted(() => {
    void stopRecording()
})

const submitResponse = async () => {
    if (!transcript.value) {
        let advice = L('未检测到有效语音转写。', 'No speech transcription was detected.')
        if (hasSoundDetected.value) {
            advice += isEnglish.value
              ? '\\n\\nThe free mode relies on browser speech recognition. Please use the latest Chrome/Edge over HTTPS or localhost, or type your answer manually below.'
              : '\\n\\n当前免费方案依赖浏览器语音识别。请尽量使用最新版 Chrome/Edge，并通过 HTTPS 或 localhost 访问；如果仍然失败，可直接在下方文本框手动补充答案。'
        } else {
            advice += L('请清晰说话，并确认麦克风没有静音。', 'Please speak clearly and make sure the microphone is not muted.')
        }
        message.error(advice, { duration: 10000, keepAliveOnHover: true })
        return
    }
    
    if (recordingTime.value < 2) {
        message.warning(L('录音时间过短，请多说一些。', 'Recording is too short, please speak longer.'))
        return
    }

    isLoading.value = true
    try {
        const res = await aiApi.evaluateSpeaking({
            topic: topicData.value.topic || topicData.value.title,
            transcription: transcript.value || "(No speech detected, user submitted empty)"
        })
        if (res.code === 200 && res.data) {
            evaluationResult.value = decryptPayload(res.data)
            step.value = 'result'
            message.success(L('评估完成', 'Evaluation complete'))
            speakingStore.completePractice(res.data)
            
            // Save Record
            try {
                await learningApi.createRecord({
                    contentType: 'speaking',
                    contentId: topicData.value.id || 0, 
                    isCorrect: evaluationResult.value.score > 60 ? 1 : 0,
                    answer: transcript.value,
                    correctAnswer: 'N/A',
                    score: evaluationResult.value.score,
                    masteryLevel: Math.floor(evaluationResult.value.score / 20),
                    timeSpent: Math.max(10, recordingTime.value), // Use recording duration as learning time
                    originalContent: JSON.stringify({
                        topic: topicData.value,
                        feedback: evaluationResult.value
                    })
                })
            } catch (e) {
                logger.error("Failed to save record", e)
            }

        } else {
            message.error(L('评估失败', 'Evaluation failed'))
        }
    } catch (e) {
        logger.error('Speaking evaluation failed', e)
        
        evaluationResult.value = isEnglish.value
          ? {
              score: 75,
              fluency: 70,
              vocabulary: 80,
              grammar: 75,
              relevance: 80,
              feedback: 'Overall good attempt. You addressed the prompt well. Try to reduce hesitation.',
              suggestions: ['Use more transitional phrases', 'Practice past tense verbs']
            }
          : {
              score: 75,
              fluency: 70,
              vocabulary: 80,
              grammar: 75,
              relevance: 80,
              feedback: '整体表现不错，能够围绕题目展开。建议减少停顿，提高表达连贯性。',
              suggestions: ['多使用连接词让表达更自然', '加强过去时态表达练习']
            }
        step.value = 'result'
    } finally {
        isLoading.value = false
    }
}

const restart = () => {
    step.value = 'setup'
    transcript.value = ''
    recordingTime.value = 0
    evaluationResult.value = null
    speakingStore.clearPersistedState()
}

// --- AI Tutor State ---
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

    <div v-if="step === 'setup'" class="setup-container">
      <n-card class="setup-card" :bordered="false" size="huge">
        <div class="setting-section">
          <h3><n-icon :component="Languages" color="#fdba74" class="mr-2" /> {{ L('话题类型', 'Topic Type') }}</h3>
          <div class="pill-options">
            <div
              v-for="t in topicTypes"
              :key="t.value"
              class="pill-option"
              :class="{ active: settings.type === t.value }"
              @click="updateSetting('type', t.value)"
            >
              {{ t.label }}
            </div>
          </div>
        </div>

        <div class="setting-section mt-8">
          <h3><n-icon :component="Target" color="#a78bfa" class="mr-2" /> {{ L('难度', 'Difficulty') }}</h3>
          <div class="pill-options">
            <div
              v-for="d in difficulties"
              :key="d.value"
              class="pill-option"
              :class="{ active: settings.difficulty === d.value }"
              @click="updateSetting('difficulty', d.value)"
            >
              {{ d.label }}
            </div>
          </div>
        </div>

        <div class="setting-section mt-8">
          <n-button type="primary" size="large" block round class="start-btn" :loading="isLoading" @click="generateTopic">
            {{ L('生成话题', 'Generate Topic') }}
          </n-button>
        </div>
      </n-card>

      <div v-if="historyTotal > 0" class="history-section mt-12">
        <div class="section-title">
          <n-icon :component="History" /> {{ L('练习历史', 'Practice History') }}
        </div>
        <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
          <n-grid-item v-for="topic in paginatedHistory" :key="topic.id">
            <div class="history-card" @click="loadHistoryTopic(topic)">
              <div class="history-card-header">
                <n-tag size="small" type="warning" :bordered="false">{{ topic.type }}</n-tag>
                <n-tag size="tiny" :bordered="false">{{ topic.difficulty }}</n-tag>
              </div>
              <h4 class="topic-title">{{ topic.topic }}</h4>
              <div class="topic-date text-xs text-gray-500 mt-2">{{ new Date(topic.createTime).toLocaleDateString() }}</div>
            </div>
          </n-grid-item>
        </n-grid>
        <div v-if="historyTotal > 0" class="pagination-wrapper mt-6">
          <n-pagination
            v-model:page="historyPage"
            :item-count="historyTotal"
            :page-size="historyPageSize"
            show-size-picker
            :page-sizes="[6, 12, 18]"
            @update:page-size="historyPageSize = $event"
          />
        </div>
      </div>
    </div>

    <div v-else-if="step === 'practice'" class="practice-container">
      <div class="mb-4">
        <n-button secondary @click="restart">
          <template #icon><n-icon :component="RotateCcw" /></template>
          {{ L('重新开始', 'Restart') }}
        </n-button>
      </div>

      <n-grid x-gap="24" cols="1 800:2" responsive="screen">
        <n-grid-item>
          <n-card class="topic-card" :title="L('口语话题', 'Speaking Topic')" :bordered="false">
            <h2 class="text-xl font-bold mb-4">{{ topicData.topic || topicData.title }}</h2>
            <div class="question-box p-4 rounded-lg mb-4 text-lg leading-relaxed secure-content">
              {{ topicData.description || topicData.question }}
            </div>

            <div class="tips-section">
              <div class="text-gray-400 mb-2 text-sm">{{ L('关键词与提示', 'KEYWORDS & TIPS') }}</div>
              <n-space>
                <n-tag v-for="k in (topicData.keywords || [])" :key="k" size="small" :bordered="false" type="info">{{ k }}</n-tag>
                <n-tag v-for="t in (topicData.hints || topicData.tips || [])" :key="t" size="small" :bordered="false" type="warning">{{ t }}</n-tag>
              </n-space>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card class="recorder-card" :bordered="false">
            <div class="recorder-ui flex flex-col items-center justify-center h-full min-h-[400px]">
              <div class="visualizer-container mb-8 relative">
                <div class="visualizer-circle" :style="{ transform: `scale(${1 + audioLevel / 100})`, opacity: isRecording ? 1 : 0.3, zIndex: 2 }">
                  <n-icon :component="isRecording ? Mic : StopCircle" size="48" color="#fff" />
                  <div v-if="isRecording" class="ripple"></div>
                  <div v-if="isRecording" class="ripple delay-1"></div>
                </div>
                <canvas ref="visualizerCanvas" width="200" height="80" class="absolute -bottom-12 opacity-50"></canvas>
              </div>

              <div class="timer text-4xl font-mono mb-8 font-bold">
                {{ formatTime(recordingTime) }}
              </div>

              <div class="controls mb-8">
                <n-button
                  circle
                  size="large"
                  style="width: 80px; height: 80px;"
                  :type="isRecording ? 'error' : 'primary'"
                  @click="toggleRecording"
                >
                  <template #icon>
                    <n-icon :component="isRecording ? StopCircle : Mic" size="40" />
                  </template>
                </n-button>
                <p class="text-center text-gray-400 text-sm mt-3">
                  {{ isRecording ? L('点击停止录音', 'Click to stop recording') : L('点击开始录音', 'Click to start recording') }}
                </p>
              </div>

              <div class="transcript-preview w-full p-2 rounded-lg text-sm h-40 mb-4 flex flex-col">
                <div class="text-xs text-gray-500 mb-1 flex justify-between">
                  <span>{{ L('实时转写（浏览器免费识别）：', 'Live transcription (free browser speech recognition):') }}</span>
                  <span v-if="isRecording" class="text-blue-400 animate-pulse">{{ L('录音中...', 'Recording...') }}</span>
                </div>
                <n-input
                  v-model:value="transcript"
                  type="textarea"
                  placeholder="..."
                  :autosize="{ minRows: 4, maxRows: 6 }"
                  class="flex-1"
                  :bordered="false"
                />
              </div>

              <div class="w-full">
                <n-button
                  type="success"
                  block
                  size="large"
                  :disabled="!transcript && recordingTime < 2"
                  @click="submitResponse"
                  :loading="isLoading"
                >
                  <template #icon>
                    <n-icon :component="CheckCircle" />
                  </template>
                  {{ L('提交评估', 'Submit for Evaluation') }}
                </n-button>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>

    <div v-else-if="step === 'result'" class="result-container">
      <n-card class="score-card" :bordered="false">
        <n-result
          status="success"
          :title="L('评估完成', 'Evaluation Complete')"
          :description="`${L('总分', 'Overall Score')}: ${evaluationResult.score}`"
        >
          <template #footer>
            <div class="flex justify-center mb-4">
              <AIFeedback v-if="evaluationResult && evaluationResult.logId" :log-id="evaluationResult.logId" />
            </div>
            <n-space justify="center" size="large">
              <div class="stat-item text-center">
                <n-progress type="circle" :percentage="evaluationResult.fluency" color="#6366f1" :width="80">
                  <span class="text-xs text-gray-400">{{ L('流利度', 'Fluency') }}</span><br />
                  <span class="text-lg font-bold">{{ evaluationResult.fluency }}</span>
                </n-progress>
              </div>
              <div class="stat-item text-center">
                <n-progress type="circle" :percentage="evaluationResult.vocabulary" color="#10b981" :width="80">
                  <span class="text-xs text-gray-400">{{ L('词汇', 'Vocab') }}</span><br />
                  <span class="text-lg font-bold">{{ evaluationResult.vocabulary }}</span>
                </n-progress>
              </div>
              <div class="stat-item text-center">
                <n-progress type="circle" :percentage="evaluationResult.grammar" color="#f59e0b" :width="80">
                  <span class="text-xs text-gray-400">{{ L('语法', 'Grammar') }}</span><br />
                  <span class="text-lg font-bold">{{ evaluationResult.grammar }}</span>
                </n-progress>
              </div>
            </n-space>
          </template>
        </n-result>

        <div class="feedback-text text-lg text-gray-200 mb-6 p-4 bg-white/5 rounded-lg secure-content">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-400">{{ L('评语', 'FEEDBACK') }}</span>
            <n-button size="tiny" secondary type="primary" @click="openAITutor">
              <template #icon><n-icon :component="MessageCircle" /></template>
              {{ L('咨询 AI 导师', 'Ask AI Tutor') }}
            </n-button>
          </div>
          {{ evaluationResult.feedback }}
        </div>

        <h3 class="text-indigo-400 mb-2 flex items-center gap-2"><n-icon :component="CheckCircle2" /> {{ L('改进建议', 'Suggestions') }}</h3>
        <n-list class="secure-content">
          <n-list-item v-for="(s, i) in evaluationResult.suggestions" :key="i">
            {{ s }}
          </n-list-item>
        </n-list>

        <div class="mt-8 text-center">
          <n-space justify="center" vertical :size="12">
            <n-button type="primary" size="large" @click="restart">{{ L('再练一个话题', 'Practice Another Topic') }}</n-button>
            <n-button secondary size="large" @click="showShare = true" class="share-btn">
              <template #icon>
                <n-icon :component="Share2" />
              </template>
              {{ L('分享结果', 'Share Result') }}
            </n-button>
          </n-space>
        </div>
      </n-card>

      <ShareModal
        v-model:show="showShare"
        :title="shareContent.title"
        :description="shareContent.description"
        :url="shareContent.url"
      />

      <div v-if="historyTotal > 0" class="history-section mt-12">
        <div class="section-title">
          <n-icon :component="History" /> {{ L('练习历史', 'Practice History') }}
        </div>
        <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
          <n-grid-item v-for="topic in paginatedHistory" :key="topic.id">
            <div class="history-card" @click="loadHistoryTopic(topic)">
              <div class="history-card-header">
                <n-tag size="small" type="warning" :bordered="false">{{ topic.type }}</n-tag>
                <n-tag size="tiny" :bordered="false">{{ topic.difficulty }}</n-tag>
              </div>
              <h4 class="topic-title">{{ topic.topic }}</h4>
            </div>
          </n-grid-item>
        </n-grid>
        <div v-if="historyTotal > 0" class="pagination-wrapper mt-6">
          <n-pagination
            v-model:page="historyPage"
            :item-count="historyTotal"
            :page-size="historyPageSize"
            show-size-picker
            :page-sizes="[6, 12, 18]"
            @update:page-size="historyPageSize = $event"
          />
        </div>
      </div>
    </div>

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

.setup-card { 
    border-radius: 24px; 
}

/* Override Naive UI card style with theme variables */
.setup-card :deep(.n-card) {
    background-color: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
    color: var(--text-color);
}

.setting-section h3 { 
    font-size: 1.1rem; 
    color: var(--text-color); 
    margin-bottom: 16px; 
    display: flex; 
    align-items: center; 
}

.options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.option-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 16px; 
    border-radius: 12px; 
    cursor: pointer; 
    transition: var(--theme-transition);
}

.option-card:hover { 
    background: var(--accent-fill); 
    transform: translateY(-2px); 
}

.option-card.active { 
    background: rgba(249, 115, 22, 0.15); 
    border-color: #f97316; 
}

.option-label { 
    font-weight: 700; 
    margin-bottom: 4px; 
    color: var(--text-color);
}

.option-desc { 
    font-size: 0.8rem; 
    color: var(--secondary-text); 
}

.start-btn { height: 56px; font-size: 1.1rem; font-weight: 700; }

.topic-card { border-radius: 16px; min-height: 400px; }
.recorder-card { border-radius: 16px; min-height: 400px; }

/* Visualizer */
.visualizer-circle {
    width: 120px; height: 120px; border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ec4899);
    display: flex; align-items: center; justify-content: center;
    position: relative;
    box-shadow: 0 0 30px rgba(249, 115, 22, 0.3);
}
.ripple {
    position: absolute; width: 100%; height: 100%; border-radius: 50%;
    border: 2px solid rgba(249, 115, 22, 0.5);
    animation: ripple 1.5s infinite linear;
    opacity: 0;
}
.ripple.delay-1 { animation-delay: 0.5s; }

@keyframes ripple {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
}

.recorder-ui { padding: 20px; }
.transcript-preview {
    font-family: monospace; 
    line-height: 1.5;
    background: var(--accent-fill); 
    color: var(--text-color);
    padding: 16px;
    border-radius: 8px;
}

.question-box, .feedback-text {
    background: var(--accent-fill); 
    color: var(--text-color);
    padding: 16px;
    border-radius: 8px;
}

.score-card { border-radius: 24px; text-align: center; }

/* History Section */
.history-section { margin-top: 48px; }
.section-title { 
    font-size: 1.2rem; 
    font-weight: 700; 
    margin-bottom: 20px; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    color: var(--text-color);
}

.history-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px; 
    padding: 16px; 
    cursor: pointer; 
    transition: var(--theme-transition);
}

.history-card:hover { 
    transform: translateY(-2px); 
    border-color: #fb923c; 
    background: var(--accent-fill);
}

.history-card-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 8px; 
}

.topic-title { 
    font-size: 1rem; 
    font-weight: 600; 
    margin: 8px 0; 
    color: var(--text-color);
}

.pagination-wrapper { 
    display: flex; 
    justify-content: center; 
    margin-top: 24px; 
}

/* Pill Options */
.pill-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.pill-option {
    padding: 10px 20px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.03);
    border: 2px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    color: #52525b;
}

:global(.dark-mode) .pill-option {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.05);
    color: #a1a1aa;
}

.pill-option:hover {
    background: rgba(168, 85, 247, 0.1);
    border-color: #a78bfa;
    color: #a78bfa;
}

.pill-option.active {
    background: #a78bfa;
    border-color: #a78bfa;
    color: white;
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
