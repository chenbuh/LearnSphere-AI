import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { decryptPayload } from '@/utils/crypto'
import logger from '@/utils/logger'

export function useSpeakingPractice(options = {}) {
  const message = options.message
  const speakingStore = options.speakingStore
  const isEnglish = options.isEnglish
  const L = options.L || ((zhText, enText) => enText || zhText)

  const step = ref('setup')
  const isLoading = ref(false)
  const topicData = ref(null)

  const isRecording = ref(false)
  const transcript = ref('')
  const accumulatedTranscript = ref('')
  const recordingTime = ref(0)
  let recordTimer = null
  let recognition = null
  let recognitionRestartTimer = null

  const audioLevel = ref(0)
  const hasSoundDetected = ref(false)
  const visualizerCanvas = ref(null)
  let audioContext = null
  let analyser = null
  let microphone = null
  let animationFrameId = null
  let monitorStream = null
  let isStoppingRecording = false

  const evaluationResult = ref(null)
  const historyTopics = ref([])

  const historyPage = ref(1)
  const historyPageSize = ref(6)
  const historyTotal = ref(0)

  const settings = ref({
    type: 'daily',
    difficulty: 'medium'
  })

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
    } catch (error) {
      logger.error('Speaking evaluation failed', error)
    }
  }

  watch([historyPage, historyPageSize], () => {
    fetchHistory()
  })

  const loadHistoryTopic = (topic) => {
    const topicTitle = topic?.title || topic?.topic || L('口语话题', 'Speaking Topic')
    topicData.value = decryptPayload(topic)
    transcript.value = ''
    recordingTime.value = 0
    step.value = 'practice'
    message.success(isEnglish.value ? `Loaded topic: ${topicTitle}` : `已加载话题：${topicTitle}`)
    speakingStore.startPractice(topic, settings.value.type, settings.value.difficulty)
  }

  const updateSetting = (key, value) => {
    logger.log(`[Speaking] Updating ${key} to ${value}`)
    settings.value[key] = value
  }

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
    } catch (error) {
      logger.error(error)
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
        audioLevel.value = Math.max(audioLevel.value, 8)
      }

      recognition.onaudiostart = () => {
        logger.log('Speech recognition audio capture started')
        hasSoundDetected.value = true
        audioLevel.value = Math.max(audioLevel.value, 12)
      }

      recognition.onsoundstart = () => {
        logger.log('Speech recognition sound detected')
        hasSoundDetected.value = true
        audioLevel.value = 35
      }

      recognition.onspeechstart = () => {
        logger.log('Speech recognition speech detected')
        hasSoundDetected.value = true
        audioLevel.value = 55
      }

      recognition.onspeechend = () => {
        logger.log('Speech recognition speech ended')
        if (isRecording.value) {
          audioLevel.value = 10
        }
      }

      recognition.onsoundend = () => {
        if (isRecording.value) {
          audioLevel.value = 8
        }
      }

      recognition.onaudioend = () => {
        if (!isRecording.value) {
          audioLevel.value = 0
        }
      }

      recognition.onnomatch = () => {
        logger.warn('Speech recognition: No match found')
      }

      recognition.onresult = (event) => {
        logger.log('Speech recognition result received', event.results)
        const fullText = Array.from(event.results)
          .map(result => result?.[0]?.transcript || '')
          .join('')
          .trim()

        transcript.value = fullText
        accumulatedTranscript.value = Array.from(event.results)
          .filter(result => result.isFinal)
          .map(result => result?.[0]?.transcript || '')
          .join(' ')
          .trim()

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
            logger.warn('[Speech] 未检测到连续语音，识别器将自动重试。')
            if (isRecording.value) {
              audioLevel.value = 8
            }
            break
          case 'network':
            errorMsg = L('网络不可用，请检查网络后重试。', 'Network is unavailable. Please check your connection and retry.')
            message.warning(errorMsg, { duration: 8000 })
            break
          case 'service-not-allowed':
            errorMsg = L('语音识别服务不可用，请使用 HTTPS 或 localhost 后重试。', 'Speech recognition service is unavailable. Use HTTPS or localhost and retry.')
            message.error(errorMsg, { duration: 10000 })
            break
          case 'audio-capture':
            errorMsg = L('浏览器当前无法读取麦克风音频，请确认系统默认输入设备可用。', 'The browser cannot capture microphone audio. Please verify the system default input device.')
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
          clearTimeout(recognitionRestartTimer)
          recognitionRestartTimer = setTimeout(() => {
            try {
              recognition.start()
            } catch (error) {
              logger.error('Speaking evaluation failed', error)
            }
          }, 250)
        }
      }
    } else {
      message.warning(L('当前浏览器不支持语音识别，请使用 Chrome/Edge。', 'Current browser does not support speech recognition. Please use Chrome/Edge.'))
    }
  }

  const requestBrowserMicPermission = async () => {
    const tempStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1
      }
    })
    tempStream.getTracks().forEach(track => track.stop())
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

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!window.isSecureContext && !isLocalhost) {
      message.error(L('浏览器安全限制：免费语音识别需要 HTTPS 或 localhost。', 'Browser security restriction: free speech recognition requires HTTPS or localhost.'), { duration: 10000 })
      logger.error('[Speaking] Insecure context detected. Speech recognition requires HTTPS or localhost.')
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      message.error(L('当前浏览器无法访问麦克风接口，请使用最新版 Chrome/Edge。', 'The current browser cannot access microphone APIs. Please use the latest Chrome/Edge.'), { duration: 10000 })
      logger.error('[Speaking] MediaDevices API is unavailable in the current browser.')
      return
    }

    cleanupAudioMonitoring()
    hasSoundDetected.value = false
    audioLevel.value = 0
    isStoppingRecording = false

    try {
      await requestBrowserMicPermission()
    } catch (error) {
      logger.error('Microphone permission request failed:', error)
      message.error(L('麦克风初始化失败，请检查权限设置。', 'Unable to initialize microphone. Please check microphone permissions.'))
      return
    }

    if (!recognition) initRecognition()
    if (!recognition) {
      return
    }

    try {
      recognition.start()
      isRecording.value = true
      startTimer()
    } catch (error) {
      logger.error('Speaking evaluation failed', error)
      isRecording.value = false
      stopTimer()
      message.error(L('浏览器语音识别启动失败，请使用最新版 Chrome/Edge，并确认系统默认麦克风可用。', 'Failed to start browser speech recognition. Please use the latest Chrome/Edge and verify the system default microphone.'))
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
      } catch (error) {}
      microphone = null
    }

    if (analyser) {
      try {
        analyser.disconnect()
      } catch (error) {}
      analyser = null
    }

    if (monitorStream) {
      monitorStream.getTracks().forEach(track => track.stop())
      monitorStream = null
    }

    clearTimeout(recognitionRestartTimer)
    recognitionRestartTimer = null
    audioLevel.value = 0

    if (audioContext && typeof audioContext.close === 'function') {
      try {
        audioContext.close()
      } catch (error) {}
      audioContext = null
    }
  }

  const stopRecording = async () => {
    if (isStoppingRecording) {
      return
    }

    isStoppingRecording = true
    isRecording.value = false
    stopTimer()
    clearTimeout(recognitionRestartTimer)
    recognitionRestartTimer = null

    if (recognition) {
      try {
        recognition.stop()
      } catch (error) {}
    }

    cleanupAudioMonitoring()
    isStoppingRecording = false
  }

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
      for (let index = 0; index < dataArray.length; index += 1) {
        values += dataArray[index]
      }

      const average = values / dataArray.length
      audioLevel.value = average
      if (average > 10) {
        hasSoundDetected.value = true
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let index = 0; index < bufferLength; index += 1) {
        const barHeight = dataArray[index] / 2
        ctx.fillStyle = index % 2 === 0 ? '#f97316' : '#ec4899'
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }

    draw()
  }

  const startTimer = () => {
    clearInterval(recordTimer)
    recordTimer = setInterval(() => {
      recordingTime.value += 1
      speakingStore.updateProgress(transcript.value, recordingTime.value)
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(recordTimer)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${minutes}:${secs}`
  }

  onUnmounted(() => {
    void stopRecording()
  })

  const submitResponse = async () => {
    if (!transcript.value) {
      let advice = L('未检测到有效语音转写。', 'No speech transcription was detected.')
      if (hasSoundDetected.value) {
        advice += isEnglish.value
          ? '\n\nThe free mode relies on browser speech recognition. Please use the latest Chrome/Edge over HTTPS or localhost, or type your answer manually below.'
          : '\n\n当前免费方案依赖浏览器语音识别。请尽量使用最新版 Chrome/Edge，并通过 HTTPS 或 localhost 访问；如果仍然失败，可直接在下方文本框手动补充答案。'
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
        transcription: transcript.value || '(No speech detected, user submitted empty)'
      })
      if (res.code === 200 && res.data) {
        evaluationResult.value = decryptPayload(res.data)
        step.value = 'result'
        message.success(L('评估完成', 'Evaluation complete'))
        speakingStore.completePractice(res.data)

        try {
          await learningApi.createRecord({
            contentType: 'speaking',
            contentId: topicData.value.id || 0,
            isCorrect: evaluationResult.value.score > 60 ? 1 : 0,
            answer: transcript.value,
            correctAnswer: 'N/A',
            score: evaluationResult.value.score,
            masteryLevel: Math.floor(evaluationResult.value.score / 20),
            timeSpent: Math.max(10, recordingTime.value),
            originalContent: JSON.stringify({
              topic: topicData.value,
              feedback: evaluationResult.value
            })
          })
        } catch (error) {
          logger.error('Failed to save record', error)
        }
      } else {
        message.error(L('评估失败', 'Evaluation failed'))
      }
    } catch (error) {
      logger.error('Speaking evaluation failed', error)

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

  return {
    step,
    isLoading,
    topicData,
    isRecording,
    transcript,
    recordingTime,
    audioLevel,
    hasSoundDetected,
    visualizerCanvas,
    evaluationResult,
    paginatedHistory,
    historyPage,
    historyPageSize,
    historyTotal,
    settings,
    topicTypes,
    difficulties,
    loadHistoryTopic,
    updateSetting,
    generateTopic,
    toggleRecording,
    stopRecording,
    submitResponse,
    restart,
    formatTime,
    drawVisualizer
  }
}
