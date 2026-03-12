import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { decryptPayload } from '@/utils/crypto'
import MobileAudioRecorder from '@/utils/mobileAudioRecorder'
import logger from '@/utils/logger'
import { BrowserSpeechRecognizer, isBrowserSpeechRecognitionSupported } from '@/utils/browserSpeechRecognizer'
import { ensureVoskModel, isVoskLanguageSupported, transcribeAudioBlobWithVosk, transcribePCMWithVosk, VoskSpeechRecognizer } from '@/utils/voskSpeechRecognizer'

export function useSpeakingPractice(options = {}) {
  const MIN_RECORDING_DURATION_MS = 3000
  const message = options.message
  const speakingStore = options.speakingStore
  const isEnglish = options.isEnglish
  const L = options.L || ((zhText, enText) => enText || zhText)

  const step = ref('setup')
  const isLoading = ref(false)
  const topicData = ref(null)

  const isRecording = ref(false)
  const isPreparingRecording = ref(false)
  const transcript = ref('')
  const accumulatedTranscript = ref('')
  const recordingTime = ref(0)
  let recordTimer = null
  let browserRecognizer = null
  let voskRecognizer = null
  let fallbackRecorder = null
  let recordingStartedAt = 0
  let lastRecordedAudioBlob = null
  let lastRecordedPCM = null
  let lastRecordedSampleRate = 16000

  const audioLevel = ref(0)
  const hasSoundDetected = ref(false)
  const visualizerCanvas = ref(null)
  let audioContext = null
  let analyser = null
  let microphone = null
  let animationFrameId = null
  let monitorStream = null
  let recognitionSourceStream = null
  let isStoppingRecording = false

  const evaluationResult = ref(null)
  const historyTopics = ref([])
  const audioInputDevices = ref([])
  const selectedAudioInputDeviceId = ref('')

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
      logger.error('Speaking history fetch failed', error)
    }
  }

  watch([historyPage, historyPageSize], () => {
    fetchHistory()
  })

  const audioInputOptions = computed(() => (
    [
      {
        label: L('浏览器默认麦克风', 'Browser default microphone'),
        value: ''
      },
      ...audioInputDevices.value.map((device, index) => ({
        label: device.label || `${L('麦克风', 'Microphone')} ${index + 1}`,
        value: device.deviceId
      }))
    ]
  ))

  const refreshAudioInputDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      audioInputDevices.value = []
      return
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(device => device.kind === 'audioinput')
      audioInputDevices.value = audioInputs

      const hasSelected = audioInputs.some(device => device.deviceId === selectedAudioInputDeviceId.value)
      if (!hasSelected) {
        selectedAudioInputDeviceId.value = ''
      }
    } catch (error) {
      logger.warn('[Speaking] Failed to enumerate audio input devices.', error)
    }
  }

  const updateAudioInputDevice = (deviceId) => {
    selectedAudioInputDeviceId.value = String(deviceId || '')
    try {
      if (selectedAudioInputDeviceId.value) {
        localStorage.setItem('learnsphere:speaking-audio-input-device', selectedAudioInputDeviceId.value)
      } else {
        localStorage.removeItem('learnsphere:speaking-audio-input-device')
      }
    } catch (error) {}
  }

  const loadHistoryTopic = (topic) => {
    const topicTitle = topic?.title || topic?.topic || L('口语话题', 'Speaking Topic')
    topicData.value = decryptPayload(topic)
    transcript.value = ''
    accumulatedTranscript.value = ''
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
    try {
      selectedAudioInputDeviceId.value = localStorage.getItem('learnsphere:speaking-audio-input-device') || ''
    } catch (error) {}
    void refreshAudioInputDevices()

    if (speakingStore.topicData && speakingStore.currentMode === 'practice') {
      if (speakingStore.isExpired()) {
        message.warning(L('检测到练习数据已过期，已清理本地缓存。', 'Detected expired practice data, local cache has been cleared.'))
        speakingStore.clearPersistedState()
      } else {
        topicData.value = decryptPayload(speakingStore.topicData)
        transcript.value = speakingStore.transcript
        accumulatedTranscript.value = speakingStore.transcript || ''
        recordingTime.value = speakingStore.recordingTime
        step.value = 'practice'
      }
    }
  })

  const getRecognitionLanguage = () => 'en-US'

  const shouldUseBrowserRecognition = () => (
    isBrowserSpeechRecognitionSupported() && !selectedAudioInputDeviceId.value
  )

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
        accumulatedTranscript.value = ''
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
      accumulatedTranscript.value = ''
      recordingTime.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const cloneMediaStream = (stream) => {
    if (!stream || typeof stream.clone !== 'function') {
      return stream || null
    }

    try {
      return stream.clone()
    } catch (error) {
      logger.warn('[Speaking] Failed to clone MediaStream, falling back to the original stream.', error)
      return stream
    }
  }

  const startAudioMonitoring = async (stream) => {
    monitorStream = cloneMediaStream(stream)
    if (!monitorStream) {
      return
    }

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    analyser = audioContext.createAnalyser()
    analyser.smoothingTimeConstant = 0.8
    analyser.fftSize = 1024
    microphone = audioContext.createMediaStreamSource(monitorStream)
    microphone.connect(analyser)
    drawVisualizer()
  }

  const toggleRecording = () => {
    if (isPreparingRecording.value) {
      logger.warn('[Speaking] Ignored toggle while recorder/model is still preparing.')
      return
    }

    if (isRecording.value) {
      logger.warn('[Speaking] Ignored recorder toggle during active recording. Use submit to stop and evaluate.')
      return
    } else {
      void startRecording()
    }
  }

  const startRecording = async () => {
    if (isRecording.value || isStoppingRecording || isPreparingRecording.value) {
      return
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!window.isSecureContext && !isLocalhost) {
      message.error(L('浏览器安全限制：语音识别需要 HTTPS 或 localhost。', 'Browser security restriction: speech recognition requires HTTPS or localhost.'), { duration: 10000 })
      logger.error('[Speaking] Insecure context detected. Vosk recognition requires HTTPS or localhost.')
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
    isPreparingRecording.value = true
    recordingStartedAt = 0

    try {
      fallbackRecorder?.destroy?.()
      fallbackRecorder = new MobileAudioRecorder()
      await fallbackRecorder.init({ deviceId: selectedAudioInputDeviceId.value || undefined })
      await fallbackRecorder.startRecording()
      const recognitionTrack = fallbackRecorder.stream?.getAudioTracks?.()?.[0] || null
      logger.log(`[Speaking] Recognition stream ready. muted=${Boolean(recognitionTrack?.muted)}, enabled=${Boolean(recognitionTrack?.enabled)}, readyState=${recognitionTrack?.readyState || 'unknown'}`)
      try {
        logger.log(`[Speaking] Recognition track settings: ${JSON.stringify(recognitionTrack?.getSettings?.() || {})}`)
      } catch (error) {}
      await refreshAudioInputDevices()
      await startAudioMonitoring(fallbackRecorder.stream)
    } catch (error) {
      logger.error('Microphone permission request failed:', error)
      message.error(L('麦克风初始化失败，请检查权限设置。', 'Unable to initialize microphone. Please check microphone permissions.'))
      return
    }

    const recognitionLang = getRecognitionLanguage()
    logger.log(`[Speaking] Recognition language set to ${recognitionLang}`)

    if (!isVoskLanguageSupported(recognitionLang)) {
      message.warning(
        L(
          '当前超轻量 Vosk 模型仅支持英文识别，请直接使用英文回答。',
          'The current ultra-light Vosk model only supports English recognition. Please answer in English.'
        ),
        { duration: 7000 }
      )
    }

    accumulatedTranscript.value = transcript.value.trim()

    try {
      const handlePartialTranscript = (partial) => {
        const mergedTranscript = [accumulatedTranscript.value, partial]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        transcript.value = mergedTranscript
        speakingStore.updateProgress(transcript.value, recordingTime.value)
      }

      const handleFinalTranscript = (text) => {
        if (!text) {
          return
        }

        accumulatedTranscript.value = [accumulatedTranscript.value, text]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
        transcript.value = accumulatedTranscript.value
        logger.log(`[Speaking] Transcript updated (${recognitionLang}, final=true): ${transcript.value}`)
        speakingStore.updateProgress(transcript.value, recordingTime.value)
      }

      if (shouldUseBrowserRecognition()) {
        logger.log('[Speaking] Using browser-native speech recognition as the primary engine for better accuracy.')
        browserRecognizer = new BrowserSpeechRecognizer({
          lang: recognitionLang,
          onStatusChange: (status) => {
            if (status === 'listening') {
              logger.log('Speech recognition engine started')
              logger.log('Speech recognition audio capture started')
              audioLevel.value = Math.max(audioLevel.value, 8)
            } else if (status === 'stopped') {
              logger.log('Speech recognition engine ended')
            }
          },
          onPartialResult: handlePartialTranscript,
          onFinalResult: handleFinalTranscript,
          onError: (error) => {
            const errorCode = String(error?.error || '').toLowerCase()
            if (errorCode && errorCode !== 'aborted') {
              logger.warn(`[Speaking] Browser speech recognition error: ${errorCode}`)
            }
          }
        })
        await browserRecognizer.start()
      } else {
        await ensureVoskModel()
        voskRecognizer = new VoskSpeechRecognizer({
          lang: recognitionLang,
          onStatusChange: (status) => {
            if (status === 'listening') {
              logger.log('Speech recognition engine started')
              logger.log('Speech recognition audio capture started')
              audioLevel.value = Math.max(audioLevel.value, 8)
            } else if (status === 'stopped') {
              logger.log('Speech recognition engine ended')
            }
          },
          onPartialResult: handlePartialTranscript,
          onFinalResult: handleFinalTranscript,
          onError: (error) => {
            logger.error('[Speaking] Vosk recognition failed', error)
          }
        })

        await voskRecognizer.start(fallbackRecorder?.stream || null)
      }

      isRecording.value = true
      recordingStartedAt = Date.now()
      startTimer()
    } catch (error) {
      logger.error('[Speaking] Failed to start Vosk recognition', error)
      try {
        if (fallbackRecorder?.isRecording) {
          await fallbackRecorder.stopRecording()
        }
      } catch (stopError) {
        logger.warn('[Speaking] Failed to stop recorder after Vosk startup failure', stopError)
      } finally {
        fallbackRecorder?.destroy?.()
        fallbackRecorder = null
        cleanupAudioMonitoring()
      }
      message.warning(
        L(
          'Vosk 语音识别启动失败，请检查麦克风权限，或直接手动输入答案。',
          'Failed to start Vosk recognition. Please check microphone access or type your answer manually.'
        ),
        { duration: 8000 }
      )
    } finally {
      isPreparingRecording.value = false
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

    if (recognitionSourceStream) {
      recognitionSourceStream.getTracks().forEach(track => track.stop())
      recognitionSourceStream = null
    }

    audioLevel.value = 0

    if (audioContext && typeof audioContext.close === 'function') {
      try {
        audioContext.close()
      } catch (error) {}
      audioContext = null
    }
  }

  const stopRecording = async (reason = 'unknown') => {
    if (isStoppingRecording) {
      logger.log(`[Speaking] stopRecording ignored because a stop is already in progress. reason=${reason}`)
      return
    }

    logger.log(`[Speaking] stopRecording called. reason=${reason}, transcriptLength=${transcript.value.trim().length}, hasRecorder=${Boolean(fallbackRecorder)}, recorderActive=${Boolean(fallbackRecorder?.isRecording)}`)
    isStoppingRecording = true
    isPreparingRecording.value = false
    isRecording.value = false
    stopTimer()
    recordingStartedAt = 0

    if (browserRecognizer) {
      const browserRecognitionResult = await browserRecognizer.stop()
      browserRecognizer = null
      if (!transcript.value.trim() && browserRecognitionResult?.finalText) {
        accumulatedTranscript.value = browserRecognitionResult.finalText
        transcript.value = browserRecognitionResult.finalText
        speakingStore.updateProgress(transcript.value, recordingTime.value)
      }
      logger.log(`[Speaking] Browser speech stop result. finalLength=${browserRecognitionResult?.finalText?.length || 0}`)
    }

    if (voskRecognizer) {
      const recognitionResult = await voskRecognizer.stop()
      lastRecordedPCM = recognitionResult?.pcmData || null
      lastRecordedSampleRate = recognitionResult?.sampleRate || 16000
      logger.log(`[Speaking] Vosk stop result. finalLength=${recognitionResult?.finalResultText?.length || 0}, pcmSamples=${lastRecordedPCM?.length || 0}, sampleRate=${lastRecordedSampleRate}`)
      voskRecognizer = null
    }

    if (fallbackRecorder?.isRecording) {
      try {
        const recordingResult = await fallbackRecorder.stopRecording()
        lastRecordedAudioBlob = recordingResult?.blob || null
      } catch (error) {
        logger.error('[Speaking] Recording stop failed', error)
      } finally {
        isLoading.value = false
        fallbackRecorder?.destroy?.()
        fallbackRecorder = null
      }
    }

    cleanupAudioMonitoring()

    if (!transcript.value.trim() && lastRecordedPCM?.length) {
      try {
        isLoading.value = true
        logger.log(`[Speaking] Running PCM-based Vosk fallback. samples=${lastRecordedPCM.length}, sampleRate=${lastRecordedSampleRate}`)
        const pcmTranscript = await transcribePCMWithVosk(lastRecordedPCM, lastRecordedSampleRate)
        if (pcmTranscript) {
          accumulatedTranscript.value = pcmTranscript
          transcript.value = pcmTranscript
          logger.log(`[Speaking] PCM fallback updated transcript: ${pcmTranscript}`)
          speakingStore.updateProgress(transcript.value, recordingTime.value)
        }
      } catch (error) {
        logger.error('[Speaking] PCM-based Vosk fallback failed', error)
      } finally {
        isLoading.value = false
      }
    }

    if (!transcript.value.trim() && lastRecordedAudioBlob) {
      try {
        isLoading.value = true
        logger.log(`[Speaking] Running offline Vosk transcription fallback. size=${lastRecordedAudioBlob.size}`)
        const offlineTranscript = await transcribeAudioBlobWithVosk(lastRecordedAudioBlob)
        if (offlineTranscript) {
          accumulatedTranscript.value = offlineTranscript
          transcript.value = offlineTranscript
          logger.log(`[Speaking] Offline transcription updated transcript: ${offlineTranscript}`)
          speakingStore.updateProgress(transcript.value, recordingTime.value)
        }
      } catch (error) {
        logger.error('[Speaking] Offline Vosk transcription fallback failed', error)
      } finally {
        isLoading.value = false
      }
    }

    if (!transcript.value.trim() && !hasSoundDetected.value && selectedAudioInputDeviceId.value) {
      const previousDevice = audioInputDevices.value.find(device => device.deviceId === selectedAudioInputDeviceId.value)
      logger.warn(`[Speaking] Selected microphone produced silent audio. Resetting to browser default. previousDeviceId=${selectedAudioInputDeviceId.value}`)
      updateAudioInputDevice('')
      message.warning(
        L(
          `当前所选麦克风“${previousDevice?.label || 'Unknown'}”没有采集到有效声音，已自动切回浏览器默认麦克风，请重试。`,
          `The selected microphone "${previousDevice?.label || 'Unknown'}" captured only silence. Switched back to the browser default microphone. Please try again.`
        ),
        { duration: 9000 }
      )
    }

    isStoppingRecording = false
  }

  const drawVisualizer = () => {
    if (!analyser) return

    const canvas = visualizerCanvas.value
    const ctx = canvas?.getContext?.('2d') || null
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

      if (!ctx || !canvas) {
        return
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

  const buildEvaluationTopicContext = () => {
    if (!topicData.value) {
      return ''
    }

    const title = topicData.value.topic || topicData.value.title || ''
    const question = topicData.value.description || topicData.value.question || ''
    const keywords = Array.isArray(topicData.value.keywords) && topicData.value.keywords.length
      ? `${L('关键词', 'Keywords')}: ${topicData.value.keywords.join(', ')}`
      : ''
    const hintsSource = topicData.value.hints || topicData.value.tips || []
    const hints = Array.isArray(hintsSource) && hintsSource.length
      ? `${L('提示', 'Hints')}: ${hintsSource.join(', ')}`
      : ''

    return [
      title ? `${L('题目', 'Topic')}: ${title}` : '',
      question ? `${L('题干', 'Prompt')}: ${question}` : '',
      keywords,
      hints
    ]
      .filter(Boolean)
      .join('\n')
  }

  onUnmounted(() => {
    void stopRecording('unmount')
  })

  const submitResponse = async () => {
    if (isPreparingRecording.value) {
      message.warning(L('录音仍在准备中，请稍候。', 'Recorder is still preparing. Please wait a moment.'))
      return
    }

    if (isRecording.value && recordingTime.value < Math.ceil(MIN_RECORDING_DURATION_MS / 1000)) {
      message.warning(
        L(
          '请先连续说满 3 秒，再停止并评估。',
          'Please keep speaking for at least 3 seconds before stopping and evaluating.'
        )
      )
      return
    }

    if (isRecording.value || fallbackRecorder?.isRecording) {
      await stopRecording('submit')
    }

    if (!transcript.value) {
      let advice = L('未检测到有效语音转写。', 'No speech transcription was detected.')
      if (hasSoundDetected.value) {
        advice += isEnglish.value
          ? '\n\nSpeech was captured, but no transcript was produced. Please check microphone access, then manually refine the text below.'
          : '\n\n已经检测到麦克风有输入，但没有得到转写结果。请检查麦克风权限，或直接在下方手动补充答案。'
      } else {
        advice += L('请清晰说话，并确认麦克风没有静音。', 'Please speak clearly and make sure the microphone is not muted.')
      }
      if (audioInputOptions.value.length > 1) {
        advice += isEnglish.value
          ? '\n\nIf the waveform remains flat, switch the microphone device from the selector and try again.'
          : '\n\n如果波形一直没有变化，请从麦克风选择器里切换到正确的输入设备后再试。'
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
        topic: buildEvaluationTopicContext(),
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
    accumulatedTranscript.value = ''
    recordingTime.value = 0
    evaluationResult.value = null
    recordingStartedAt = 0
    lastRecordedAudioBlob = null
    lastRecordedPCM = null
    lastRecordedSampleRate = 16000
    speakingStore.clearPersistedState()
  }

  const setTranscript = (value) => {
    transcript.value = String(value || '')
    accumulatedTranscript.value = transcript.value
    speakingStore.updateProgress(transcript.value, recordingTime.value)
  }

  return {
    step,
    isLoading,
    isPreparingRecording,
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
    audioInputOptions,
    selectedAudioInputDeviceId,
    loadHistoryTopic,
    updateSetting,
    refreshAudioInputDevices,
    updateAudioInputDevice,
    generateTopic,
    toggleRecording,
    stopRecording,
    setTranscript,
    submitResponse,
    restart,
    formatTime,
    drawVisualizer
  }
}
