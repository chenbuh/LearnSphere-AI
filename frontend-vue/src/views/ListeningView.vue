<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, useMessage, NSpin, NIcon, NPagination
} from 'naive-ui'
import { 
  Rocket, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Brain, Target, Clock, BookOpen, AlertCircle, History,
  ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, StopCircle,
  Mic, Globe, MessageCircle, GraduationCap, Book, Layers, Share2
} from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import logger from '@/utils/logger'
import { useListeningStore } from '@/stores/listening'
import { decryptPayload } from '@/utils/crypto'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const listeningStore = useListeningStore()

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

// 分享功能
const showShare = ref(false)
const shareContent = computed(() => {
  if (passages.value.length === 0) return {}
  
  const totalQuestions = passages.value.reduce((sum, p) => sum + (p.questions?.length || 0), 0)
  
  return {
    title: `我在 LearnSphere AI 完成了听力练习！`,
    description: `刚刚完成了 ${passages.value.length} 篇听力练习，共 ${totalQuestions} 道题，得分 ${score.value} 分！快来一起学习吧！`,
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
  { label: '2 篇', value: 2 },
  { label: '3 篇', value: 3 },
  { label: '4 篇', value: 4 }
]

const difficulties = [
  { label: '入门', value: 'easy' },
  { label: '进阶', value: 'medium' },
  { label: '精通', value: 'hard' }
]

const speeds = [
  { label: '慢速', value: 'slow' },
  { label: '正常', value: 'normal' },
  { label: '快速', value: 'fast' }
]

// --- Settings State ---
const settings = ref({
  examType: 'cet4',
  count: 2,
  difficulty: 'medium',
  speed: 'normal'
})

// --- Computed ---
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
    e.returnValue = '练习正在进行中，离开将丢失进度。'
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
  fetchHistory()
  window.addEventListener('beforeunload', handleBeforeUnload)
  
  // 从 Store 恢复进度逻辑
  if (listeningStore.currentMaterial && listeningStore.currentMode === 'practice') {
     // 检查数据是否过期 (超过 24 小时)
     if (listeningStore.isExpired()) {
        message.warning('检测到练习数据已过期，已为您清除')
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
        message.info('检测到未完成的练习，已为您恢复进度')
     }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  stopAudio()
})

watch(currentPassageIndex, () => {
  stopAudio()
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
    message.success(`已重新加载: ${item.title}`)
    
    listeningStore.startPractice({ passages: passages.value }, settings.value.examType, settings.value.difficulty)
  } catch (e) {
    message.error('加载历史数据失败')
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
      message.success(`听力生成成功：共 ${passages.value.length} 篇`)
      fetchHistory()
      
      listeningStore.startPractice({ passages: passages.value }, settings.value.examType, settings.value.difficulty)
    }
  } catch (e) {
    logger.error('Generation Error', e)
  } finally {
    isLoading.value = false
  }
}

// Keep utterance reference to prevent garbage collection
let currentUtterance = null
let currentAudioElement = null

/**
 * 播放听力音频
 * 优先使用在线TTS API（高质量），失败时回退到原生 speechSynthesis
 * 支持语速调节和多源备份，完全兼容移动端浏览器
 */
const playAudio = () => {
  const p = currentPassage.value
  if (!p) return

  if (!p.script) {
      message.warning('当前篇章暂无音频脚本，无法播放')
      return
  }

  // 停止之前的播放
  stopAudio()
  isPlaying.value = true

  // 使用多源回退策略播放
  playListeningAudioWithFallbacks(p.script, 0)
}

/**
 * 多源回退播放 - 听力专用
 * @param {string} text 要播放的文本
 * @param {number} sourceIndex 当前尝试的源索引
 */
const playListeningAudioWithFallbacks = (text, sourceIndex) => {
    const speed = settings.value.speed === 'slow' ? 0.8 : settings.value.speed === 'fast' ? 1.2 : 1.0
    
    // 在线TTS源（长文本使用在线服务质量更好）
    const sources = [
        // Source 0: 欧路词典 (支持长文本，自然语流)
        `https://api.frdic.com/api/v2/speech/speakweb?langid=en&txt=${encodeURIComponent(text)}`,
        // Source 1: Google TTS
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`,
        // Source 2: 百度翻译
        `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(text)}&spd=${Math.round(speed * 3)}&source=web`
    ]

    if (sourceIndex < sources.length) {
        try {
            const audio = new Audio(sources[sourceIndex])
            currentAudioElement = audio
            
            // 尝试根据设置调整播放速度（部分浏览器支持）
            audio.playbackRate = speed
            
            audio.onplay = () => {
                logger.log(`[Listening Audio] ✓ Source ${sourceIndex} playing`)
                isPlaying.value = true
            }
            
            audio.onended = () => {
                logger.debug('[Listening Audio] Playback ended')
                isPlaying.value = false
                currentAudioElement = null
            }
            
            audio.onerror = () => {
                logger.warn(`[Listening Audio] Source ${sourceIndex} failed, trying next...`)
                playListeningAudioWithFallbacks(text, sourceIndex + 1)
            }
            
            const playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    logger.warn(`[Listening Audio] Source ${sourceIndex} rejected:`, err.message || err)
                    playListeningAudioWithFallbacks(text, sourceIndex + 1)
                })
            }
        } catch (err) {
            logger.error(`[Listening Audio] Exception on source ${sourceIndex}:`, err)
            playListeningAudioWithFallbacks(text, sourceIndex + 1)
        }
    } else {
        // 所有在线源失败，回退到原生 TTS
        playListeningNativeTTS(text)
    }
}

/**
 * 原生 TTS 播放 - 听力专用（静默失败）
 * @param {string} text 
 */
const playListeningNativeTTS = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        logger.warn('[Listening Audio] Native TTS not available')
        isPlaying.value = false
        return
    }

    try {
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        currentUtterance = utterance

        utterance.lang = 'en-US'
        utterance.rate = settings.value.speed === 'slow' ? 0.8 : settings.value.speed === 'fast' ? 1.2 : 1.0
        
        // 尝试选择高质量语音
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                               voices.find(v => v.lang === 'en-US') ||
                               voices.find(v => v.lang.startsWith('en'))
        if (preferredVoice) {
            utterance.voice = preferredVoice
        }
        
        utterance.onstart = () => { 
            logger.debug('[Listening Audio] Native TTS started')
            isPlaying.value = true 
        }
        
        utterance.onend = () => { 
            logger.debug('[Listening Audio] Native TTS ended')
            isPlaying.value = false 
            currentUtterance = null
        }
        
        utterance.onerror = (e) => { 
            if (e.error !== 'interrupted') {
                logger.error('[Listening Audio] Native TTS error:', e.error)
                // 静默失败，不显示给用户
            }
            isPlaying.value = false 
        }
        
        window.speechSynthesis.speak(utterance)
        
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
        }
    } catch (e) {
        logger.error('[Listening Audio] Native TTS exception:', e)
        isPlaying.value = false
    }
}

/**
 * 停止音频播放
 */
const stopAudio = () => {
  // 停止在线音频
  if (currentAudioElement) {
    currentAudioElement.pause()
    currentAudioElement = null
  }
  
  // 停止原生 TTS
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    currentUtterance = null
  }
  
  isPlaying.value = false
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

const updateSetting = (key, value) => {
  settings.value[key] = value
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
  step.value = 'setup'
  passages.value = []
  answersPerPassage.value = {}
  listeningStore.clearPersistedState()
}

// 监听练习步骤，离开测试环节时停止音频
watch(step, (newStep) => {
  if (newStep !== 'testing') {
    stopAudio()
  }
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
    topic: currentPassage.value?.title || '听力练习',
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
    <div v-if="step === 'setup'" class="setup-container">
       <n-card class="setup-card" :bordered="false" size="huge">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>练耳空间 · 英语听力训练</span>
              <n-button size="tiny" quaternary @click="listeningStore.clearPersistedState()">
                <template #icon><n-icon :component="RotateCcw" /></template>
                重置练习状态
              </n-button>
            </div>
          </template>
          
          <!-- 1. Material Type (Source) -->
          <div class="setting-section">
               <h3><n-icon :component="Target" color="#6366f1" /> 听力来源</h3>
               <div class="grid-options source-grid">
                  <div 
                     v-for="t in examTypes" 
                     :key="t.value"
                     class="option-card"
                     :class="{ active: settings.examType === t.value }"
                     @click="settings.examType = t.value"
                  >
                     <div class="icon-box">
                         <n-icon v-if="t.value === 'ted'" :component="Mic" />
                         <n-icon v-else-if="t.value === 'bbc'" :component="Globe" />
                         <n-icon v-else-if="t.value === 'dialog'" :component="MessageCircle" />
                         <n-icon v-else-if="t.value === 'toefl'" :component="GraduationCap" />
                         <n-icon v-else-if="t.value === 'ielts'" :component="BookOpen" />
                         <n-icon v-else :component="Book" />
                     </div>
                     <span class="option-label">{{ t.label }}</span>
                  </div>
               </div>
          </div>

          <!-- 2. Configuration Box -->
          <div class="settings-box">
             <n-grid x-gap="40" y-gap="24" cols="1 800:3">
                <n-grid-item>
                    <div class="setting-sub-section">
                        <h4><n-icon :component="Layers" size="16" /> 篇章数量</h4>
                        <div class="pill-options">
                           <div v-for="c in counts" :key="c.value" 
                                class="pill-option" :class="{ active: settings.count === c.value }"
                                @click="settings.count = c.value">
                                {{ c.label }}
                           </div>
                        </div>
                    </div>
                </n-grid-item>

                <n-grid-item>
                    <div class="setting-sub-section">
                        <h4><n-icon :component="Target" size="16" /> 难度等级</h4>
                        <div class="pill-options">
                           <div v-for="d in difficulties" :key="d.value" 
                                class="pill-option" :class="{ active: settings.difficulty === d.value }"
                                @click="settings.difficulty = d.value">
                                {{ d.label }}
                           </div>
                        </div>
                    </div>
                </n-grid-item>

                <n-grid-item>
                    <div class="setting-sub-section">
                        <h4><n-icon :component="Clock" size="16" /> 语速控制</h4>
                        <div class="pill-options">
                           <div v-for="s in speeds" :key="s.value" 
                                class="pill-option" :class="{ active: settings.speed === s.value }"
                                @click="settings.speed = s.value">
                                {{ s.label }}
                           </div>
                        </div>
                    </div>
                </n-grid-item>
             </n-grid>

             <n-divider style="margin: 24px 0; opacity: 0.1" />

             <n-button 
                 type="primary" 
                 size="large" 
                 block 
                 round
                 class="start-btn"
                 :loading="isLoading"
                 @click="generateQuestions"
                 color="#6366f1"
             >
                 <template #icon><n-icon :component="Rocket" /></template>
                 生成听力材料
             </n-button>
          </div>

       </n-card>

       <!-- History Section (Bottom) -->
       <div v-if="historyTotal > 0" class="history-section mt-12">
          <div class="section-title">
              <n-icon :component="History" /> 最近生成
          </div>
          <n-grid x-gap="20" y-gap="20" cols="1 600:2 900:3">
             <n-grid-item v-for="item in paginatedHistory" :key="item.id">
                 <n-card class="history-card-item" hoverable @click="loadMaterial(item)">
                     <template #header>
                         <n-tag size="small" :bordered="false" type="info" class="mb-2">{{ item.type }}</n-tag>
                         <div class="history-title">{{ (item.title && /[:]\d{2}[:]\d{2}/.test(item.title)) ? 'Listening Practice' : item.title }}</div>
                     </template>
                     <template #footer>
                         <div class="history-footer">
                             <n-tag size="tiny" :bordered="false" :type="item.difficulty === 'fast' ? 'error' : 'success'">
                                 {{ item.difficulty }}
                             </n-tag>
                             <span class="word-count">{{ Array.isArray(item.questions) ? item.questions.length : 0 }} 题</span>
                         </div>
                     </template>
                 </n-card>
             </n-grid-item>
          </n-grid>
          
          <div class="pagination-wrapper mt-8">
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
    </div><div v-else-if="step === 'testing'" class="test-container">
      <div class="test-header">
        <n-button quaternary circle @click="restart">
          <template #icon><n-icon :component="ArrowLeft" /></template>
        </n-button>
        <div class="passage-title">
          <h2>{{ currentPassage?.title }}</h2>
          <n-tag size="small" type="primary">Passage {{ currentPassageIndex + 1 }} / {{ passages.length }}</n-tag>
        </div>
        <div class="timer-box">
           <n-progress type="circle" :percentage="progressPercent" :show-indicator="false" :width="40" />
           <span class="count">{{ currentGlobalIndex + 1 }} / {{ totalQuestionsCount }}</span>
        </div>
      </div>

      <div class="test-layout">
        <div class="main-content">
          <!-- Audio Player Block -->
          <div class="audio-block" @click="isPlaying ? stopAudio() : playAudio()">
            <div class="playback-controls">
               <div class="play-btn">
                  <n-icon :component="isPlaying ? StopCircle : PlayCircle" size="48" />
               </div>
               <div class="playback-visualizer" :class="{ isPlaying }">
                  <div v-for="i in 8" :key="i" class="bar"></div>
               </div>
            </div>
            
            <div class="audio-info">
              <h4>{{ isPlaying ? '音频播放中...' : '点击播放当前篇章音频' }}</h4>
              <p>Passage {{ currentPassageIndex + 1 }} 正在朗读</p>
            </div>
          </div>

          <!-- Question Block -->
          <n-card class="question-card" :bordered="false">
            <div class="question-header">
              <span class="q-num">Question {{ currentGlobalIndex + 1 }}</span>
              <h3>{{ currentQuestion?.question || currentQuestion?.text || '题目内容加载失败' }}</h3>
            </div>
            <div class="options-grid">
               <div v-for="(opt, idx) in currentQuestion?.options" :key="idx"
                    class="option-item" :class="{ selected: answersPerPassage[currentPassageIndex]?.[currentQuestionInPassage] === idx }"
                    @click="selectAnswer(currentQuestionInPassage, idx)">
                  <span class="option-idx">{{ String.fromCharCode(65 + idx) }}</span>
                  <span class="option-text">{{ opt }}</span>
               </div>
            </div>
            <div class="nav-actions">
              <n-space justify="space-between" style="width: 100%">
                <n-button secondary @click="prevQuestion" :disabled="currentPassageIndex === 0 && currentQuestionInPassage === 0">
                   上一题
                </n-button>
                <n-button type="primary" @click="currentGlobalIndex === totalQuestionsCount - 1 ? submitExam() : nextQuestion()">
                   {{ currentGlobalIndex === totalQuestionsCount - 1 ? '提交试卷' : '下一题' }}
                </n-button>
              </n-space>
            </div>
          </n-card>
        </div>

        <div class="side-navigation">
          <n-card title="题目导航" :bordered="false" size="small">
             <div v-for="(p, pIdx) in passages" :key="pIdx" class="nav-group">
                <div class="group-title">Passage {{ pIdx + 1 }}</div>
                <div class="num-grid">
                   <div v-for="(q, qIdx) in p.questions" :key="qIdx"
                        class="num-box" :class="{ 
                          active: pIdx === currentPassageIndex && qIdx === currentQuestionInPassage,
                          answered: answersPerPassage[pIdx]?.[qIdx] !== undefined
                        }"
                        @click="goToQuestion(pIdx, qIdx)">
                     {{ getGlobalNum(pIdx, qIdx) }}
                   </div>
                </div>
             </div>
          </n-card>
        </div>
      </div>
    </div><div v-else-if="step === 'result'" class="result-container">
       <n-card class="result-card" :bordered="false">
          <n-result status="success" :title="`练习已完成! 得分: ${score}`" :description="score >= 60 ? '表现不错，继续保持！' : '还需要多加练习，加油！'">
            <template #icon>
              <div class="score-circle">
                <span class="val">{{ score }}</span>
              </div>
            </template>
            <template #footer>
               <n-space justify="center" vertical :size="16">
                 <!-- 主要操作 -->
                 <n-space justify="center">
                   <n-button type="primary" @click="restart">重新开始练习</n-button>
                   <n-button secondary @click="step = 'analysis'">查看详细解析</n-button>
                 </n-space>
                 
                 <!-- 分享按钮 -->
                 <n-button 
                   secondary 
                   @click="showShare = true"
                   class="share-btn"
                 >
                   <template #icon>
                     <n-icon :component="Share2" />
                   </template>
                   分享学习成果
                 </n-button>
               </n-space>
            </template>
          </n-result>
       </n-card>

       <!-- 分享弹窗 -->
       <ShareModal
         v-model:show="showShare"
         :title="shareContent.title"
         :description="shareContent.description"
         :url="shareContent.url"
       />
    </div><div v-else-if="step === 'analysis'" class="analysis-container">
       <div class="analysis-header">
         <n-button quaternary circle @click="step = 'result'">
           <template #icon><n-icon :component="ArrowLeft" /></template>
         </n-button>
         <h2>详细解析汇报</h2>
         <n-button type="primary" secondary @click="restart">
            <template #icon><n-icon :component="RotateCcw" /></template>
            返回主页
         </n-button>
       </div>

       <div v-for="(p, pIdx) in passages" :key="pIdx" class="passage-analysis-card">
          <n-card :title="`Passage ${pIdx + 1}: ${p.title}`" class="mb-6" style="border-radius: 16px;">
             <div class="script-box">
                <h4><n-icon :component="BookOpen" /> 听力原文</h4>
                <p class="script-text">{{ p.script }}</p>
             </div>
             
             <n-divider title-placement="left">题目深度解析</n-divider>
             
             <div class="analysis-questions">
                <div v-for="(q, qIdx) in p.questions" :key="qIdx" class="analysis-q-item">
                   <div class="q-header">
                      <n-tag :type="answersPerPassage[pIdx]?.[qIdx] === q.correct ? 'success' : 'error'" size="small" round>
                         Question {{ getGlobalNum(pIdx, qIdx) }}
                      </n-tag>
                      <span class="q-text">{{ q.question || q.text }}</span>
                   </div>
                   
                   <div class="analysis-options">
                      <div v-for="(opt, oIdx) in q.options" :key="oIdx" 
                           class="opt-item"
                           :class="{
                              correct: oIdx === q.correct,
                              wrong: oIdx === answersPerPassage[pIdx]?.[qIdx] && oIdx !== q.correct
                           }">
                         <span class="opt-label">{{ String.fromCharCode(65 + oIdx) }}</span>
                         <span class="opt-content">{{ opt }}</span>
                         <n-icon v-if="oIdx === q.correct" :component="CheckCircle2" class="status-icon" color="#10b981" />
                         <n-icon v-if="oIdx === answersPerPassage[pIdx]?.[qIdx] && oIdx !== q.correct" :component="XCircle" class="status-icon" color="#ef4444" />
                      </div>
                   </div>
                   
                    <div class="explanation-box">
                       <div class="exp-title-row">
                          <div class="exp-title">
                             <n-icon :component="Brain" /> 专家解析
                          </div>
                          <n-button size="tiny" secondary type="primary" @click="openAITutor(pIdx, qIdx)">
                             <template #icon><n-icon :component="MessageCircle" /></template>
                             问问 AI 助手
                          </n-button>
                       </div>
                       <p>{{ q.explanation || '该题目暂无详细解析内容，请根据原文理解。' }}</p>
                    </div>
                </div>
             </div>
          </n-card>
        </div>
     </div>
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

/* Setup Styles */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
}
.hero-section h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #6366f1, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}
.hero-section p { color: var(--secondary-text); font-size: 1.1rem; }

/* Refactored Setup Card */
.setup-card {
    border-radius: 24px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
}

/* 强制覆盖 Naive UI NCard 的样式 */
.setup-card :deep(.n-card) {
    background-color: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
    color: var(--text-color);
}

.setting-section { margin-bottom: 32px; }
.setting-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    margin-bottom: 16px;
    color: var(--text-color);
    font-weight: 700;
}

/* Option Cards (Square) */
.grid-options.source-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); /* Adaptive Grid */
    gap: 16px;
}

.option-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: var(--theme-transition);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    aspect-ratio: 1; /* Makes them square */
}
.option-card:hover {
    background: var(--accent-fill);
    transform: translateY(-4px);
}
.option-card.active {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
    color: var(--text-color);
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
}

.icon-box {
    font-size: 2.5rem;
    margin-bottom: 12px;
    color: #c4b5fd;
    display: flex;
    align-items: center;
    justify-content: center;
}
.option-card.active .icon-box { color: #fff; }
.option-label { font-weight: 600; font-size: 1rem; }

/* Configuration Box (Bottom) */
.settings-box {
    background: var(--accent-fill);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--card-border);
}

.setting-sub-section h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    color: var(--secondary-text);
    margin-bottom: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.pill-options {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.pill-option {
    flex: 1;
    min-width: 80px;
    text-align: center;
    padding: 10px 16px;
    border-radius: 10px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    cursor: pointer;
    font-size: 0.95rem;
    color: var(--secondary-text);
    white-space: nowrap;
    transition: var(--theme-transition);
}
.pill-option:hover { background: var(--accent-fill); }
.pill-option.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.start-btn {
    height: 56px;
    font-size: 1.1rem;
    font-weight: 700;
}

/* History Styles (Reused from ReadingView but purple) */
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
.history-card-item {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    cursor: pointer;
    transition: var(--theme-transition);
    height: 100%;
}
.history-card-item:hover {
    transform: translateY(-4px);
    border-color: #6366f1;
    background: var(--accent-fill);
}
.history-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin-top: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    height: 2.8em;
    color: var(--text-color);
}
.history-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 12px;
}
.word-count { font-size: 0.85rem; color: var(--secondary-text); }

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}


/* Test Interface - Kept Original */
.test-container { max-width: 1200px; margin: 0 auto; }
.test-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px 24px;
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}
.passage-title { flex: 1; }
.passage-title h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
.timer-box { display: flex; align-items: center; gap: 12px; }
.timer-box .count { font-weight: 700; font-family: monospace; color: #6366f1; }

.test-layout { display: flex; gap: 24px; }
.main-content { flex: 1; min-width: 0; }
.side-navigation { width: 300px; flex-shrink: 0; }

/* Audio Block */
.audio-block {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  margin-bottom: 24px;
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}
.audio-block:hover { transform: translateY(-2px); border-color: #6366f1; }

.playback-controls {
    display: flex;
    align-items: center;
    gap: 16px;
}

.playback-visualizer { display: flex; align-items: flex-end; gap: 3px; height: 32px; width: 40px; }
.playback-visualizer .bar { width: 4px; background: #6366f1; border-radius: 2px; height: 10%; transition: height 0.3s; }
.playback-visualizer.isPlaying .bar { animation: wave 1s infinite ease-in-out; }
@keyframes wave { 0%, 100% { height: 10% } 50% { height: 100% } }
.playback-visualizer .bar:nth-child(2n) { animation-delay: 0.2s; }
.playback-visualizer .bar:nth-child(3n) { animation-delay: 0.4s; }

.audio-info { flex: 1; }
.audio-info h4 { margin: 0; color: var(--text-color); font-size: 1.1rem; }
.audio-info p { margin: 4px 0 0; font-size: 0.9rem; color: var(--secondary-text); }

.question-card { background: var(--card-bg); border-radius: 20px; border: 1px solid var(--card-border); transition: var(--theme-transition); }
.q-num { color: #6366f1; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
.question-header h3 { font-size: 1.5rem; margin-top: 8px; line-height: 1.4; color: var(--text-color); }

.options-grid { display: grid; gap: 12px; margin: 32px 0; }
.option-item {
  padding: 16px 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
}
.option-item:hover { 
  background: var(--accent-fill); 
}
.option-item.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.1); }
.option-idx { 
  width: 32px; 
  height: 32px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: var(--accent-fill); 
  border-radius: 50%; 
  font-weight: 700; 
  color: var(--secondary-text); 
}
.option-item.selected .option-idx { background: #6366f1; color: #fff; }

.nav-group { margin-bottom: 20px; }
.group-title { font-size: 0.75rem; font-weight: 700; color: var(--secondary-text); text-transform: uppercase; margin-bottom: 12px; }
.num-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.num-box { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: var(--theme-transition); color: var(--secondary-text); }
.num-box.active { border-color: #6366f1; color: #6366f1; font-weight: 700; background: rgba(99, 102, 241, 0.1); }
.num-box.answered { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3); }

/* Result */
.score-circle { width: 120px; height: 120px; border: 8px solid #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 0 30px rgba(99, 102, 241, 0.3); }
.score-circle .val { font-size: 3rem; font-weight: 900; color: var(--text-color); }
.result-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    transition: var(--theme-transition);
}

/* 修复 background-clip 兼容性 */
.hero-section h1 {
  -webkit-background-clip: text;
  background-clip: text;
}
/* Analysis Phase Styles */
.analysis-container {
  max-width: 1000px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 12px;
}

.passage-analysis-card {
  margin-bottom: 24px;
}

.script-box {
  background: var(--accent-fill);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  margin-bottom: 24px;
}

.script-box h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  color: #6366f1;
}

.script-text {
  line-height: 1.8;
  color: var(--text-color);
  font-size: 1.05rem;
  white-space: pre-wrap;
}

.analysis-q-item {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  margin-bottom: 20px;
}

.q-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.q-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
}

.analysis-options {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.opt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  background: var(--accent-fill);
  position: relative;
}

.opt-item.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.opt-item.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.opt-label {
  font-weight: 700;
  color: var(--secondary-text);
  width: 24px;
}

.opt-content {
  flex: 1;
  color: var(--text-color);
}

.status-icon {
  font-size: 1.2rem;
}

.explanation-box {
  background: rgba(99, 102, 241, 0.05);
  border-left: 4px solid #6366f1;
  padding: 16px;
  border-radius: 0 8px 8px 0;
}

.exp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #6366f1;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.exp-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.explanation-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--secondary-text);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>