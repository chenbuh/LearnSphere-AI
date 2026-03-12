<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue'
import { useMessage } from 'naive-ui'
import ShareModal from '@/components/ShareModal.vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import logger from '@/utils/logger'
import { useTextAudio } from '@/composables/useTextAudio'
import { useListeningStore } from '@/stores/listening'
import { decryptPayload } from '@/utils/crypto'
import { useI18n } from 'vue-i18n'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const ListeningPracticePanel = defineAsyncComponent(() => import('@/components/listening/ListeningPracticePanel.vue'))
const ListeningResultPanel = defineAsyncComponent(() => import('@/components/listening/ListeningResultPanel.vue'))
const ListeningSetupPanel = defineAsyncComponent(() => import('@/components/listening/ListeningSetupPanel.vue'))
const ListeningAnalysisPanel = defineAsyncComponent(() => import('@/components/listening/ListeningAnalysisPanel.vue'))
const ListeningTestingHeader = defineAsyncComponent(() => import('@/components/listening/ListeningTestingHeader.vue'))
const ListeningQuestionNavigator = defineAsyncComponent(() => import('@/components/listening/ListeningQuestionNavigator.vue'))

const message = useMessage()
const listeningStore = useListeningStore()
const { playAudio: playTextAudio, stopAudio: stopTextAudio } = useTextAudio({
  logger,
  notifyWarning: () => {}
})
const { locale } = useI18n()
const isEnglish = computed(() => locale.value === 'en-US')
const L = (zh, en) => (isEnglish.value ? en : zh)

// --- State ---
// 核心状态机：setup (设置) -> testing (考试中) -> result (结果展示)
const step = ref('setup') 
const isLoading = ref(false)
const passages = ref([]) // 存储当前生成的听力篇章列表
const currentPassageIndex = ref(0) // 当前正在做的篇章索引
const currentQuestionInPassage = ref(0) // 当前篇章内的题目索引
// 答案存储结构：{ passageIndex: { questionIndex: optionIndex } }
// 支持多篇章、多题目的稀疏存储
const answersPerPassage = ref({}) 
const score = ref(0)
const historyMaterials = ref([])
const isPlaying = ref(false)
const loadingTime = ref(Date.now())

// 音频播放进度相关
const audioProgress = ref(0) // 当前播放进度（秒）
const audioDuration = ref(0) // 音频总时长（秒）
const hasAudioMetadata = ref(false) // 是否已加载音频元数据

// 分享功能
const showShare = ref(false)
const shareContent = computed(() => {
  if (passages.value.length === 0) return {}
  
  const totalQuestions = passages.value.reduce((sum, p) => sum + (p.questions?.length || 0), 0)
  
  return {
    title: L('我在 LearnSphere AI 完成了听力练习！', 'I completed a listening practice on LearnSphere AI!'),
    description: isEnglish.value
      ? `I just completed ${passages.value.length} listening passages with ${totalQuestions} questions and scored ${score.value}!`
      : `刚刚完成了 ${passages.value.length} 篇听力练习，共 ${totalQuestions} 道题，得分 ${score.value} 分！快来一起学习吧！`,
    url: window.location.href
  }
})

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)

// --- Options Constants ---
const examTypes = [
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' }
]

const counts = [
  { label: L('2 篇', '2 passages'), value: 2 },
  { label: L('3 篇', '3 passages'), value: 3 },
  { label: L('4 篇', '4 passages'), value: 4 }
]

const difficulties = [
  { label: L('入门', 'Easy'), value: 'easy' },
  { label: L('进阶', 'Medium'), value: 'medium' },
  { label: L('精通', 'Hard'), value: 'hard' }
]

const speeds = [
  { label: L('慢速', 'Slow'), value: 'slow' },
  { label: L('正常', 'Normal'), value: 'normal' },
  { label: L('快速', 'Fast'), value: 'fast' }
]

// --- Settings State ---
const settings = ref({
  examType: 'cet4',
  count: 2,
  difficulty: 'medium',
  speed: 'normal'
})

// --- Computed ---

const clearPracticeState = () => {
  listeningStore.clearPersistedState()
}

const updateSetting = ({ key, value }) => {
  settings.value[key] = value
}

const updateListeningHistoryPage = (page) => {
  historyPage.value = page
}

const updateListeningHistoryPageSize = (pageSize) => {
  historyPageSize.value = pageSize
}
const currentPassage = computed(() => {
  if (passages.value.length === 0) return null
  const p = passages.value[currentPassageIndex.value]
  if (p && p.title && /[:]\d{2}[:]\d{2}/.test(p.title)) {
     p.title = 'Listening Comprehension'
  }
  return p
})

const currentQuestion = computed(() => {
  const p = currentPassage.value
  if (!p || !p.questions) return null
  return p.questions[currentQuestionInPassage.value]
})

const isListeningInProgress = computed(() => {
  return step.value === 'testing' && Object.keys(answersPerPassage.value).length > 0
})

const currentGlobalIndex = computed(() => {
  let idx = 0
  for (let i = 0; i < currentPassageIndex.value; i++) {
    idx += passages.value[i]?.questions?.length || 0
  }
  return idx + currentQuestionInPassage.value
})

const totalQuestionsCount = computed(() => {
  return passages.value.reduce((total, p) => total + (p.questions?.length || 0), 0)
})

const progressPercent = computed(() => {
  if (totalQuestionsCount.value === 0) return 0
  return Math.round(((currentGlobalIndex.value + 1) / totalQuestionsCount.value) * 100)
})

// --- Logic ---

const handleBeforeUnload = (e) => {
  if (isListeningInProgress.value) {
    e.preventDefault()
    e.returnValue = L('练习正在进行中，离开将丢失进度。', 'Practice is in progress. Leaving will lose your progress.')
    return e.returnValue
  }
}

/**
 * 组件挂载时的初始化逻辑
 * 1. 获取历史记录
 * 2. 绑定页面关闭防护
 * 3. [关键] 检查 Pinia Store 中是否有未完成的练习进度，如果有则恢复
 */
onMounted(() => {
  stopAudio() // 确保刷新页面后停止任何可能的遗留音频（特别是 Native TTS）
  fetchHistory()
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 从 Store 恢复进度逻辑
  if (listeningStore.currentMaterial && listeningStore.currentMode === 'practice') {
     // 检查数据是否过期 (超过 24 小时)
     if (listeningStore.isExpired()) {
        message.warning(L('检测到练习数据已过期，已为您清除', 'Detected expired practice data and cleared it.'))
        listeningStore.clearPersistedState()
     } else {
        // 恢复篇章数据和当前位置
        const material = listeningStore.currentMaterial
        
        // 增加安全校验：如果恢复的数据中包含时间戳格式 (含有 :00: 或 :30: 等)，说明是脏数据
        const badTitleRegex = /[:]\d{2}[:]\d{2}/
        const hasBadTitle = material.passages && material.passages.some(p => badTitleRegex.test(p.title || ''))
        
        if (hasBadTitle) {
           console.warn('Detected corrupted listening data with timestamps in store, clearing...')
           listeningStore.clearPersistedState()
           location.reload()
           return
        }
        
        console.log('Restoring passages from store:', material.passages)

        const decryptedPassages = decryptPayload(material.passages)
        passages.value = decryptedPassages
        currentPassageIndex.value = listeningStore.currentQuestionIndex // 实际上这里存储的是篇章索引
        
        // 重构答案 Map
        answersPerPassage.value = {}
        passages.value.forEach((_, idx) => {
            answersPerPassage.value[idx] = {}
        })
        
        // 将扁平化的用户答案数组 (Store) 映射回结构化的 answersPerPassage (Component)
        if (Array.isArray(listeningStore.userAnswers)) {
            let globalIdx = 0
            for (let i = 0; i < passages.value.length; i++) {
                for (let j = 0; j < passages.value[i].questions.length; j++) {
                    if (listeningStore.userAnswers[globalIdx] !== null) {
                        answersPerPassage.value[i][j] = listeningStore.userAnswers[globalIdx]
                    }
                    globalIdx++
                }
            }
        }
        
        step.value = 'testing' // 直接进入测试状态
        message.info(L('检测到未完成的练习，已为您恢复进度', 'Detected unfinished practice and restored your progress.'))
     }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  stopAudio()
  clearListeningAudioCache()
})

watch(currentPassageIndex, () => {
  stopAudio()
  preloadCurrentPassageAudio()
})

watch(() => settings.value.speed, () => {
  if (step.value !== 'testing') return
  preloadCurrentPassageAudio()
})

// Paginated history
const paginatedHistory = computed(() => historyMaterials.value)

watch([historyPage, historyPageSize], () => {
  fetchHistory()
})

const fetchHistory = async () => {
  try {
    const res = await aiApi.getListeningHistory(historyPage.value, historyPageSize.value)
    if (res.code === 200) {
      if (res.data.records) {
         historyMaterials.value = decryptPayload(res.data.records)
         historyTotal.value = res.data.total
      } else {
         historyMaterials.value = decryptPayload(res.data || [])
         historyTotal.value = historyMaterials.value.length
      }
    }
  } catch (e) {
    logger.error("Failed to fetch history", e)
  }
}

// 加载历史记录
const loadMaterial = (item) => {
  if (!item) return
  const decryptedItem = decryptPayload(item)
  try {
    let qData = decryptedItem.questions
    if (typeof qData === 'string') {
      try {
        qData = JSON.parse(qData)
      } catch (e) {
        logger.error('Failed to parse questions JSON', e)
        qData = []
      }
    }
    
    // 将历史记录（单篇）适配到新的多篇章结构中
    let cleanHistoryTitle = item.title || 'Historical Material'
    if (/^\d{2}:\d{2}:/.test(cleanHistoryTitle)) {
      cleanHistoryTitle = 'Listening Comprehension'
    }

    passages.value = [{
      id: decryptedItem.id || Date.now(),
      title: cleanHistoryTitle,
      script: decryptedItem.script || decryptedItem.audioScript || decryptedItem.content || '',
      questions: (Array.isArray(qData) ? qData : []).map(q => ({
        ...q,
        correct: q.correct !== undefined ? Number(q.correct) : 0
      }))
    }]

    // 重置答题状态
    currentPassageIndex.value = 0
    currentQuestionInPassage.value = 0
    answersPerPassage.value = { 0: {} }
    
    loadingTime.value = Date.now()
    step.value = 'testing'
    message.success(isEnglish.value ? `Reloaded: ${item.title}` : `已重新加载: ${item.title}`)
    
    listeningStore.startPractice({ passages: passages.value }, settings.value.examType, settings.value.difficulty)
  } catch (e) {
    message.error(L('加载历史数据失败', 'Failed to load history data.'))
    logger.error('Load Material Error', e)
  }
}

const generateQuestions = async () => {
  isLoading.value = true
  try {
    const res = await aiApi.generateListening({
      type: settings.value.examType,
      difficulty: settings.value.difficulty,
      count: settings.value.count
    })
    
    if (res.code === 200 && res.data) {
      const decryptedData = decryptPayload(res.data)
      if (decryptedData.exhausted || (Array.isArray(decryptedData.passages) && decryptedData.passages.length === 0)) {
        message.warning(
          decryptedData.message || (
            isEnglish.value
              ? 'No new listening materials are available for you today. Please come back tomorrow.'
              : '你今天可用的不重复听力素材已经取完，请明天再来。'
          )
        )
        return
      }

      if (decryptedData.passages) {
        // 后端返回篇章数组，每个篇章包含音频、标题、题目
        passages.value = decryptedData.passages.map((p, idx) => {
          // 修复：只要标题里包含时间戳格式 (如 22:06:00)，就进行清理
          let cleanTitle = p.title
          const timeRegex = /[:]\d{2}[:]\d{2}/
          if (!cleanTitle || cleanTitle.includes('null') || timeRegex.test(cleanTitle)) {
             const themes = ['Campus Life', 'Global Travel', 'Modern Technology', 'Healthy Living', 'Business English']
             cleanTitle = themes[idx % themes.length] || 'English Listening'
          }
          return {
            ...p,
            title: cleanTitle,
            script: p.audioScript || p.script || p.content || '',
            questions: (p.questions || []).map(q => ({
              ...q,
              correct: q.correct !== undefined ? Number(q.correct) : 0
            }))
          }
        })
      } else {
        // 旧版本兼容逻辑：后端返回单个篇章
        let cleanTitle = res.data.title
        if (!cleanTitle || cleanTitle.includes('null') || /^\d{2}:\d{2}:/.test(cleanTitle)) {
           cleanTitle = `${settings.value.examType.toUpperCase()} Practice Material`
        }
        passages.value = [{
          id: 1,
          title: cleanTitle,
          script: res.data.script || res.data.audioScript || res.data.content || '',
          questions: res.data.questions || []
        }]
      }

      currentPassageIndex.value = 0
      currentQuestionInPassage.value = 0
      answersPerPassage.value = {}
      passages.value.forEach((_, idx) => {
        answersPerPassage.value[idx] = {}
      })

      loadingTime.value = Date.now()
      step.value = 'testing'
      message.success(isEnglish.value
        ? `Listening generated: ${passages.value.length} passage(s)`
        : `听力生成成功：共 ${passages.value.length} 篇`)
      fetchHistory()
      
      listeningStore.startPractice({ passages: passages.value }, settings.value.examType, settings.value.difficulty)
    }
  } catch (e) {
    logger.error('Generation Error', e)
  } finally {
    isLoading.value = false
  }
}

let currentAudioElement = null
let currentAudioFetchController = null
let currentPlayRequestId = 0
let nativeProgressTimer = null

const LISTENING_TTS_VOICE = 'en-US-JennyNeural'
const LISTENING_TTS_PLAY_TIMEOUT_MS = 2500
const LISTENING_TTS_PRELOAD_TIMEOUT_MS = 10000
const LISTENING_AUDIO_CACHE_LIMIT = 12

const listeningAudioCache = new Map()
const listeningAudioRequestCache = new Map()

const getListeningPlaybackRate = () => {
  if (settings.value.speed === 'slow') return 0.8
  if (settings.value.speed === 'fast') return 1.2
  return 1.0
}

const buildListeningAudioCacheKey = (text, rate) => `${text}::${rate}`

const setListeningAudioCache = (cacheKey, audioUrl) => {
  if (listeningAudioCache.has(cacheKey)) {
    const previousUrl = listeningAudioCache.get(cacheKey)
    if (previousUrl && previousUrl !== audioUrl && previousUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousUrl)
    }
    listeningAudioCache.delete(cacheKey)
  }

  listeningAudioCache.set(cacheKey, audioUrl)

  if (listeningAudioCache.size > LISTENING_AUDIO_CACHE_LIMIT) {
    const oldestKey = listeningAudioCache.keys().next().value
    const oldestUrl = listeningAudioCache.get(oldestKey)
    if (oldestUrl && oldestUrl.startsWith('blob:')) {
      URL.revokeObjectURL(oldestUrl)
    }
    listeningAudioCache.delete(oldestKey)
  }
}

const clearListeningAudioCache = () => {
  listeningAudioCache.forEach((audioUrl) => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl)
    }
  })
  listeningAudioRequestCache.forEach((requestEntry) => {
    if (requestEntry?.controller) {
      requestEntry.controller.abort()
    }
  })
  listeningAudioCache.clear()
  listeningAudioRequestCache.clear()
}

const getListeningAuthToken = () => {
  if (typeof window === 'undefined') return ''
  const token = localStorage.getItem('learnsphere-token')
  if (!token || token === 'null' || token === 'undefined') return ''
  return token
}

const readTtsFailureMessage = async (response, contentType) => {
  try {
    const cloned = response.clone()
    if (contentType.includes('application/json')) {
      const payload = await cloned.json()
      return payload?.message || payload?.msg || payload?.error || JSON.stringify(payload)
    }
    const text = await cloned.text()
    return (text || '').trim().slice(0, 180)
  } catch {
    return ''
  }
}

const waitForListeningRequest = (requestPromise, timeoutMs, mode) => {
  if (!timeoutMs || timeoutMs <= 0) {
    return requestPromise
  }

  let timeoutId = null
  return Promise.race([
    requestPromise,
    new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        logger.debug(`[Listening Audio] Local TTS timeout (${mode})`)
        resolve(null)
      }, timeoutMs)
    })
  ]).finally(() => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  })
}

const clearNativeProgressTimer = () => {
  if (nativeProgressTimer) {
    clearInterval(nativeProgressTimer)
    nativeProgressTimer = null
  }
}

const estimateNativeSpeechDuration = (text, rate) => {
  const normalizedText = (text || '').trim()
  if (!normalizedText) return 0
  const words = normalizedText.split(/\s+/).filter(Boolean).length
  const effectiveRate = rate > 0 ? rate : 1
  const baseWpm = 160
  return Math.max(2, (words / (baseWpm * effectiveRate)) * 60)
}

const startNativeProgressTimer = (text, rate, playRequestId) => {
  clearNativeProgressTimer()

  const estimatedDuration = estimateNativeSpeechDuration(text, rate)
  if (estimatedDuration <= 0) return

  audioDuration.value = estimatedDuration
  hasAudioMetadata.value = true
  audioProgress.value = 0

  const startAt = Date.now()
  nativeProgressTimer = setInterval(() => {
    if (playRequestId !== currentPlayRequestId) {
      clearNativeProgressTimer()
      return
    }

    const elapsed = (Date.now() - startAt) / 1000
    audioProgress.value = Math.min(elapsed, estimatedDuration)
  }, 200)
}

const fetchListeningAudioUrl = async (text, options = {}) => {
  const normalizedText = (text || '').trim()
  if (!normalizedText) return null

  const playbackRate = getListeningPlaybackRate()
  const cacheKey = buildListeningAudioCacheKey(normalizedText, playbackRate)
  if (listeningAudioCache.has(cacheKey)) {
    return listeningAudioCache.get(cacheKey)
  }

  const mode = options.mode || 'play'
  const waitTimeoutMs = options.timeoutMs ?? LISTENING_TTS_PLAY_TIMEOUT_MS
  const networkTimeoutMs = options.networkTimeoutMs ?? LISTENING_TTS_PRELOAD_TIMEOUT_MS
  const trackPlaybackRequest = Boolean(options.trackPlaybackRequest)

  if (listeningAudioRequestCache.has(cacheKey)) {
    const existingEntry = listeningAudioRequestCache.get(cacheKey)
    if (trackPlaybackRequest && existingEntry?.controller) {
      currentAudioFetchController = existingEntry.controller
    }
    if (mode === 'play') {
      return waitForListeningRequest(existingEntry.promise, waitTimeoutMs, mode)
    }
    return existingEntry.promise
  }

  const controller = new AbortController()
  const requestPromise = (async () => {
    let networkTimeoutId = null

    if (trackPlaybackRequest) {
      currentAudioFetchController = controller
    }

    try {
      networkTimeoutId = setTimeout(() => controller.abort(), networkTimeoutMs)
      const authToken = getListeningAuthToken()
      const headers = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers.satoken = authToken
      }

      const response = await fetch('/api/tts/edge', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: normalizedText,
          voice: LISTENING_TTS_VOICE,
          rate: playbackRate
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase()
      if (!contentType.includes('audio')) {
        const detail = await readTtsFailureMessage(response, contentType)
        throw new Error(detail || `Non-audio response: ${contentType || 'unknown'}`)
      }

      const rawBlob = await response.blob()
      const audioBlob = rawBlob.type && rawBlob.type.startsWith('audio/')
        ? rawBlob
        : new Blob([rawBlob], { type: 'audio/mpeg' })

      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('Empty audio payload')
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      setListeningAudioCache(cacheKey, audioUrl)
      return audioUrl
    } catch (error) {
      if (error?.name === 'AbortError') {
        logger.debug(`[Listening Audio] Local TTS request aborted (${mode})`)
      } else {
        logger.warn(`[Listening Audio] Local TTS failed (${mode}):`, error?.message || error)
      }
      return null
    } finally {
      if (networkTimeoutId) {
        clearTimeout(networkTimeoutId)
      }
      listeningAudioRequestCache.delete(cacheKey)
      if (trackPlaybackRequest && currentAudioFetchController === controller) {
        currentAudioFetchController = null
      }
    }
  })()

  listeningAudioRequestCache.set(cacheKey, { promise: requestPromise, controller })

  if (mode === 'play') {
    return waitForListeningRequest(requestPromise, waitTimeoutMs, mode)
  }
  return requestPromise
}

const preloadCurrentPassageAudio = () => {
  if (step.value !== 'testing') return
  const script = currentPassage.value?.script
  if (!script) return

  fetchListeningAudioUrl(script, {
    mode: 'preload',
    timeoutMs: LISTENING_TTS_PRELOAD_TIMEOUT_MS
  }).catch((error) => {
    logger.debug('[Listening Audio] Preload skipped:', error?.message || error)
  })
}

const playListeningAudioFromUrl = (audioUrl, playRequestId) => {
  const playbackRate = getListeningPlaybackRate()
  clearNativeProgressTimer()

  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      audio.playbackRate = playbackRate
      currentAudioElement = audio

      audio.onloadedmetadata = () => {
        if (playRequestId !== currentPlayRequestId) return
        audioDuration.value = audio.duration
        hasAudioMetadata.value = true
      }

      audio.ontimeupdate = () => {
        if (playRequestId !== currentPlayRequestId) return
        audioProgress.value = audio.currentTime
      }

      audio.onplay = () => {
        if (playRequestId !== currentPlayRequestId) return
        isPlaying.value = true
      }

      audio.onended = () => {
        if (playRequestId !== currentPlayRequestId) return
        isPlaying.value = false
        audioProgress.value = 0
        currentAudioElement = null
        resolve()
      }

      audio.onerror = () => {
        if (playRequestId !== currentPlayRequestId) return
        currentAudioElement = null
        reject(new Error('Local audio playback failed'))
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(reject)
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Play listening audio with local voice engine first, then native fallback.
 */
const playAudio = async () => {
  const p = currentPassage.value
  if (!p) return

  if (!p.script) {
      message.warning(L('当前篇章暂无音频脚本，无法播放', 'No script for this passage. Unable to play audio.'))
      return
  }

  stopAudio()
  const playRequestId = ++currentPlayRequestId
  isPlaying.value = true
  audioProgress.value = 0
  audioDuration.value = 0
  hasAudioMetadata.value = false

  try {
    await playListeningAudioWithLocalFirst(p.script, playRequestId)
  } catch (error) {
    logger.error('[Listening Audio] Unexpected playback error:', error)
    isPlaying.value = false
  }
}

/**
 * Local edge TTS first. If unavailable, fallback to native speechSynthesis.
 */
const playListeningAudioWithLocalFirst = async (text, playRequestId) => {
    const audioUrl = await fetchListeningAudioUrl(text, {
      mode: 'play',
      timeoutMs: LISTENING_TTS_PLAY_TIMEOUT_MS,
      trackPlaybackRequest: true
    })

    if (playRequestId !== currentPlayRequestId) {
      return
    }

    if (audioUrl) {
      try {
        await playListeningAudioFromUrl(audioUrl, playRequestId)
        return
      } catch (error) {
        if (playRequestId !== currentPlayRequestId) {
          return
        }
        logger.warn('[Listening Audio] Local playback failed, fallback to native:', error?.message || error)
      }
    }

    playListeningNativeTTS(text, playRequestId)
}

/**
 * 原生 TTS 播放 - 听力专用（静默失败）
 * @param {string} text 
 */
const playListeningNativeTTS = (text, playRequestId = currentPlayRequestId) => {
    if (playRequestId !== currentPlayRequestId) return

    playTextAudio(text, {
        mode: 'native',
        nativeOptions: {
            lang: 'en-US',
            rate: getListeningPlaybackRate(),
            voiceSelector: (voices) => voices.find(v => v.name.includes('Google US English')) ||
                voices.find(v => v.lang === 'en-US') ||
                voices.find(v => v.lang.startsWith('en'))
        },
        onStart: () => {
            if (playRequestId !== currentPlayRequestId) {
                stopTextAudio()
                return
            }
            logger.debug('[Listening Audio] Native TTS started')
            isPlaying.value = true
            startNativeProgressTimer(text, getListeningPlaybackRate(), playRequestId)
        },
        onEnd: () => {
            if (playRequestId !== currentPlayRequestId) return
            logger.debug('[Listening Audio] Native TTS ended')
            isPlaying.value = false
            clearNativeProgressTimer()
            audioProgress.value = 0
        },
        onError: (error) => {
            if (playRequestId !== currentPlayRequestId) return
            const errorCode = error?.error || error?.message
            if (errorCode !== 'interrupted') {
                logger.error('[Listening Audio] Native TTS error:', errorCode || error)
            }
            clearNativeProgressTimer()
            isPlaying.value = false
        }
    })
}

/**
 * 停止音频播放
 */
const stopAudio = () => {
  currentPlayRequestId++
  clearNativeProgressTimer()

  if (currentAudioFetchController) {
    currentAudioFetchController.abort()
    currentAudioFetchController = null
  }

  // 停止在线音频
  if (currentAudioElement) {
    currentAudioElement.pause()
    currentAudioElement.currentTime = 0
    currentAudioElement.onloadedmetadata = null
    currentAudioElement.ontimeupdate = null
    currentAudioElement.onplay = null
    currentAudioElement.onended = null
    currentAudioElement.onerror = null
    currentAudioElement = null
  }

  // 停止原生 TTS
  stopTextAudio()

  isPlaying.value = false
  audioProgress.value = 0
  audioDuration.value = 0
  hasAudioMetadata.value = false
}

const selectAnswer = (qIndex, optionIndex) => {
  const pIdx = currentPassageIndex.value
  if (!answersPerPassage.value[pIdx]) {
    answersPerPassage.value[pIdx] = {}
  }
  answersPerPassage.value[pIdx][qIndex] = optionIndex
  
  // Save to store
  const flatAnswers = []
  passages.value.forEach((p, i) => {
    p.questions.forEach((q, j) => {
      flatAnswers.push(answersPerPassage.value[i]?.[j] ?? null)
    })
  })
  
  if (typeof listeningStore.saveDraft === 'function') {
    listeningStore.saveDraft(flatAnswers)
  }
  if (typeof listeningStore.updatePosition === 'function') {
    listeningStore.updatePosition(pIdx)
  }
}

const nextQuestion = () => {
  const p = currentPassage.value
  if (!p) return
  
  if (currentQuestionInPassage.value < p.questions.length - 1) {
    currentQuestionInPassage.value++
  } else if (currentPassageIndex.value < passages.value.length - 1) {
    currentPassageIndex.value++
    currentQuestionInPassage.value = 0
  }
}

const prevQuestion = () => {
  if (currentQuestionInPassage.value > 0) {
    currentQuestionInPassage.value--
  } else if (currentPassageIndex.value > 0) {
    currentPassageIndex.value--
    const p = passages.value[currentPassageIndex.value]
    currentQuestionInPassage.value = p.questions.length - 1
  }
}


/**
 * 提交试卷
 * 1. 计算总分
 * 2. 遍历所有题目，逐题调用 learningApi.createRecord 记录答题结果 (AI 训练数据)
 * 3. 切换到结果视图
 */
const submitExam = async () => {
  isLoading.value = true
  try {
    let correct = 0
    let total = 0
    
    // 遍历所有篇章和题目进行批改
    const recordPromises = []
    
    for (let i = 0; i < passages.value.length; i++) {
      const p = passages.value[i]
      const pAns = answersPerPassage.value[i] || {}
      for (let j = 0; j < p.questions.length; j++) {
        const q = p.questions[j]
        const isCorrect = pAns[j] === q.correct
        if (isCorrect) correct++
        total++
        
        // 收集保存任务，不在这里 await
        recordPromises.push(
          learningApi.createRecord({
            contentId: q.id || (i * 100 + j),
            contentType: 'listening',
            isCorrect: isCorrect ? 1 : 0,
            answer: pAns[j] !== undefined ? String(pAns[j]) : '-1',
            correctAnswer: String(q.correct),
            masteryLevel: isCorrect ? 3 : 1,
            timeSpent: Math.floor((Date.now() - (loadingTime.value || Date.now())) / 1000 / totalQuestionsCount.value) || 30,
            originalContent: JSON.stringify({ 
              passage: p.title, 
              question: {
                question: q.question || q.text,
                options: q.options,
                explanation: q.explanation // preserve explanation if exists
              }, 
              script: p.script 
            })
          }).catch(err => logger.error('Save error', err))
        )
      }
    }
    
    // 可以选择等待所有记录保存完毕，或者直接进入结果页（后台继续保存）
    // 为了用户体验，我们先计算分数并切换页面
    score.value = total > 0 ? Math.round((correct / total) * 100) : 0
    step.value = 'result'
    
    // 更新 Store 状态，标记已提交
    listeningStore.completePractice()
    
    // 在后台静默等待保存完成
    Promise.all(recordPromises).then(() => {
       logger.debug('All listening records saved')
    })
  } finally {
    isLoading.value = false
  }
}

const restart = () => {
  stopAudio() // 强制停止音频
  clearListeningAudioCache()
  step.value = 'setup'
  passages.value = []
  answersPerPassage.value = {}
  listeningStore.clearPersistedState()
}

// 监听练习步骤，离开测试环节时停止音频
watch(step, (newStep) => {
  if (newStep !== 'testing') {
    stopAudio()
    return
  }

  preloadCurrentPassageAudio()
})

// 格式化时间显示
const formatAudioTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 计算播放进度百分比
const audioProgressPercent = computed(() => {
  if (audioDuration.value === 0) return 0
  return Math.min((audioProgress.value / audioDuration.value) * 100, 100)
})

const goToQuestion = (pIdx, qIdx) => {
  currentPassageIndex.value = pIdx
  currentQuestionInPassage.value = qIdx
}

const getGlobalNum = (pIdx, qIdx) => {
  let num = 1
  for (let i = 0; i < pIdx; i++) num += passages.value[i].questions?.length || 0
  return num + qIdx
}

// --- AI Tutor State ---
const showTutor = ref(false)
const tutorContext = computed(() => {
  if (!currentQuestion.value) return null
  
  const pIdx = currentPassageIndex.value
  const qIdx = currentQuestionInPassage.value
  const userAnswerIdx = answersPerPassage.value[pIdx]?.[qIdx]
  
  return {
    question: currentQuestion.value.question || currentQuestion.value.text,
    options: currentQuestion.value.options,
    correctAnswer: currentQuestion.value.options[currentQuestion.value.correct] || '',
    userAnswer: userAnswerIdx !== undefined
      ? currentQuestion.value.options[userAnswerIdx]
      : null,
    explanation: currentQuestion.value.explanation,
    topic: currentPassage.value?.title || L('听力练习', 'Listening Practice'),
    content: currentPassage.value?.script,
    module: 'listening'
  }
})

const openAITutor = () => {
    showTutor.value = true
}
</script>

<template>
  <div class="listening-view">
    <!-- 1. Setup Phase -->
    <ListeningSetupPanel
      v-if="step === 'setup'"
      :translate="L"
      :settings="settings"
      :exam-types="examTypes"
      :counts="counts"
      :difficulties="difficulties"
      :speeds="speeds"
      :is-loading="isLoading"
      :history-total="historyTotal"
      :paginated-history="paginatedHistory"
      :history-page="historyPage"
      :history-page-size="historyPageSize"
      @clear-state="clearPracticeState"
      @set-setting="updateSetting"
      @generate="generateQuestions"
      @load-material="loadMaterial"
      @update:history-page="updateListeningHistoryPage"
      @update:history-page-size="updateListeningHistoryPageSize"
    />
    <div v-else-if="step === 'testing'" class="test-container">
      <ListeningTestingHeader
        :translate="L"
        :passage-title="currentPassage?.title"
        :current-passage-index="currentPassageIndex"
        :passages-length="passages.length"
        :progress-percent="progressPercent"
        :current-global-index="currentGlobalIndex"
        :total-questions-count="totalQuestionsCount"
        @restart="restart"
      />

      <div class="test-layout">
        <div class="main-content">
          <ListeningPracticePanel
            :translate="L"
            :is-playing="isPlaying"
            :current-passage-index="currentPassageIndex"
            :has-audio-metadata="hasAudioMetadata"
            :audio-progress-percent="audioProgressPercent"
            :audio-progress="audioProgress"
            :audio-duration="audioDuration"
            :format-audio-time="formatAudioTime"
            :current-global-index="currentGlobalIndex"
            :current-question="currentQuestion"
            :answers-per-passage="answersPerPassage"
            :current-question-in-passage="currentQuestionInPassage"
            :total-questions-count="totalQuestionsCount"
            @toggle-audio="isPlaying ? stopAudio() : playAudio()"
            @select-answer="selectAnswer"
            @prev-question="prevQuestion"
            @next-or-submit="currentGlobalIndex === totalQuestionsCount - 1 ? submitExam() : nextQuestion()"
          />

        </div>
        <div class="side-navigation">
          <ListeningQuestionNavigator
            :translate="L"
            :passages="passages"
            :current-passage-index="currentPassageIndex"
            :current-question-in-passage="currentQuestionInPassage"
            :answers-per-passage="answersPerPassage"
            :get-global-num="getGlobalNum"
            @go-to-question="goToQuestion"
          />
        </div>
      </div>
    </div><div v-else-if="step === 'result'" class="result-container">
       <ListeningResultPanel
         :translate="L"
         :is-english="isEnglish"
         :score="score"
         @restart="restart"
         @view-analysis="step = 'analysis'"
         @share="showShare = true"
       />

       <!-- 分享弹窗 -->
       <ShareModal
         v-model:show="showShare"
         :title="shareContent.title"
         :description="shareContent.description"
         :url="shareContent.url"
       />
    </div>
    <ListeningAnalysisPanel
      v-else-if="step === 'analysis'"
      :translate="L"
      :passages="passages"
      :answers-per-passage="answersPerPassage"
      :get-global-num="getGlobalNum"
      @back="step = 'result'"
      @restart="restart"
      @open-ai-tutor="openAITutor"
    />
     <!-- AI Tutor Component -->
     <AITutor 
       :context="tutorContext"
       :auto-open="showTutor"
       @close="showTutor = false"
     />
   </div>
</template>

<style scoped>
.listening-view {
  min-height: 100%;
  padding: 24px;
  background: radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.05) 0, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(219, 39, 119, 0.05) 0, transparent 50%);
}

/* Test Interface - Kept Original */
.test-container { max-width: 1200px; margin: 0 auto; }


.test-layout { display: flex; gap: 24px; }
.main-content { flex: 1; min-width: 0; }
.side-navigation { width: 300px; flex-shrink: 0; }



</style>

<style src="../assets/learning-mobile.css" scoped></style>


