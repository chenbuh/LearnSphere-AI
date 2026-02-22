<script setup>
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue'
import { 
    NGrid, NGridItem, NCard, NButton, NSelect, NInput, NSpin, 
    NTag, NPagination, NModal, NProgress, NTabs, NTabPane, 
    NStatistic, NNumberAnimation, NSpace, NDivider, useMessage
} from 'naive-ui'
import { Search, Volume2, Trophy, Brain, Check, X, BookOpen, RotateCw, Layers, Zap, Target } from 'lucide-vue-next'
import { useVocabularyStore } from '../stores/vocabulary.js'
import { fetchExampleFromApi, generateExampleByCategory } from '../utils/dictionaryApi.js'
import { vocabularyApi } from '../api/vocabulary.js'
import { masteryApi } from '../api/mastery.js'
import taskTracker from '../utils/taskTracker.js'
import logger from '@/utils/logger'
import request from '@/utils/request'
import { decryptPayload } from '@/utils/crypto'
import { MessageCircle } from 'lucide-vue-next'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const vocabStore = useVocabularyStore()
const message = useMessage()

// --- State ---
const activeTab = ref('browse') // 当前激活的标签页：'browse' (浏览) | 'learn' (学习)
const loading = ref(false)

// --- 任务追踪 (Gamification) ---
const dailyTask = ref(null) // 每日任务进度数据

// --- Browse Mode State (浏览模式) ---
const searchText = ref('') // 搜索关键词
const selectedExam = ref('cet4') // 当前选择的考试类型
const showDetailModal = ref(false) // 详情弹窗可见性
const currentDetailWord = ref(null) // 当前查看的单词详情
const browseWords = ref([]) // 浏览模式下的单词列表
const page = ref(1) // 分页：当前页
const pageSize = 12 // 分页：每页数量

const examOptions = [
  { label: '大学英语四级 (CET-4)', value: 'cet4' },
  { label: '大学英语六级 (CET-6)', value: 'cet6' },
  { label: '雅思 (IELTS)', value: 'ielts' },
  { label: '托福 (TOEFL)', value: 'toefl' },
  { label: 'GRE', value: 'gre' },
  { label: '考研英语', value: 'postgraduate' },
  { label: '专业四级 (TEM-4)', value: 'tem4' },
  { label: '专业八级 (TEM-8)', value: 'tem8' }
]

// --- Learn Mode State (学习/闪卡模式) ---
const sessionWords = ref([]) // 当前学习会话的单词队列
const sessionIndex = ref(0) // 当前学习进度索引
const isFlipped = ref(false) // 卡片翻转状态 (背面可见时为 true)
const sessionComplete = ref(false) // 会话是否完成
const sessionStats = ref({ correct: 0, wrong: 0 }) // 当前会话统计 (掌握/未掌握)

// --- Common Logic ---

const currentAudio = ref(null)
const currentUtterance = ref(null)

/**
 * 播放音频
 * 优先使用在线 TTS API，失败则降级到浏览器原生 SpeechSynthesis。
 * @param {string} text 要播放的文本
 * @param {boolean} isAuto 是否为自动播放（自动播放会受系统设置影响）
 */
const playAudio = (text, isAuto = false) => {
  if (!text) return

  // 如果是自动播放，需检查用户设置
  if (isAuto) {
    const autoPlayEnabled = localStorage.getItem('user_autoplay_preference') !== 'false'
    if (!autoPlayEnabled) return
  }

  // 停止之前的播放
  if (currentAudio.value) {
    try {
      currentAudio.value.pause()
      currentAudio.value = null
    } catch (e) {}
  }
  
  if (typeof window !== 'undefined' && window.speechSynthesis) {
     window.speechSynthesis.cancel()
  }

  console.log(`[Vocab Audio] Playing: "${text}" (auto: ${isAuto})`)

  // 关键：用户点击必须立即执行，自动播放可以延迟
  if (isAuto) {
    setTimeout(() => tryPlayAudio(text), 100)
  } else {
    tryPlayAudio(text)
  }
}

/**
 * 尝试播放音频 - 优先在线API，失败回退原生TTS
 */
const tryPlayAudio = (text) => {
    const isSentence = text.includes(' ') || text.length > 30
    
    // 所有内容都先尝试在线API
    const sources = isSentence ? [
        // 句子专用API
        `https://api.frdic.com/api/v2/speech/speakweb?langid=en&txt=${encodeURIComponent(text)}`,
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`
    ] : [
        // 单词专用API
        `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`
    ]
    
    console.log(`[Vocab Audio] Trying ${isSentence ? 'sentence' : 'word'} with ${sources.length} online source(s)`)
    
    tryOnlineSource(text, sources, 0)
}

/**
 * 尝试在线音频源
 */
const tryOnlineSource = (text, sources, index) => {
    if (index >= sources.length) {
        // 所有在线源都失败，尝试原生TTS
        console.log('[Vocab Audio] All online sources failed, trying native TTS...')
        playNativeTTS(text)
        return
    }
    
    try {
        const audio = new Audio()
        currentAudio.value = audio
        
        let hasPlayed = false
        let hasErrored = false
        
        audio.oncanplay = () => {
            console.log(`[Vocab Audio] Source ${index} ready`)
        }
        
        audio.onplay = () => {
            hasPlayed = true
            console.log(`[Vocab Audio] ✓ Playing from online source ${index}`)
        }
        
        audio.onended = () => {
            console.log('[Vocab Audio] Playback completed')
            currentAudio.value = null
        }
        
        audio.onerror = (e) => {
            if (hasErrored) return
            hasErrored = true
            
            console.warn(`[Vocab Audio] Source ${index} failed: ${audio.error?.code}`)
            
            // 尝试下一个源
            tryOnlineSource(text, sources, index + 1)
        }
        
        // 设置音频源
        audio.src = sources[index]
        
        // 尝试播放
        const playPromise = audio.play()
        
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                if (hasPlayed || hasErrored) return
                hasErrored = true
                
                console.warn(`[Vocab Audio] Source ${index} play rejected: ${err.name}`)
                
                // 尝试下一个源
                tryOnlineSource(text, sources, index + 1)
            })
        }
        
        // 超时保护
        setTimeout(() => {
            if (!hasPlayed && !hasErrored) {
                console.warn(`[Vocab Audio] Source ${index} timeout`)
                hasErrored = true
                if (currentAudio.value) {
                    currentAudio.value.pause()
                    currentAudio.value = null
                }
                tryOnlineSource(text, sources, index + 1)
            }
        }, 2000)
        
    } catch (err) {
        console.error(`[Vocab Audio] Exception on source ${index}:`, err)
        tryOnlineSource(text, sources, index + 1)
    }
}

const playNativeTTS = (text) => {
    // 不检测是否支持，直接尝试（避免误判）
    try {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            throw new Error('speechSynthesis not available')
        }
        
        // 确保干净的状态
        window.speechSynthesis.cancel()
        
        // 有些浏览器需要等待voices加载完成
        const speakWithRetry = () => {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'en-US'
            utterance.rate = 0.9
            utterance.pitch = 1.0
            utterance.volume = 1.0
            
            // 尝试获取可用语音
            let voices = window.speechSynthesis.getVoices()
            
            // 如果还没有语音列表，等待加载
            if (voices.length === 0) {
                console.log('[Vocab Audio] Waiting for voices to load...')
                
                // 监听voiceschanged事件
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices()
                    console.log(`[Vocab Audio] Voices loaded: ${voices.length} voices available`)
                    selectVoiceAndSpeak(utterance, voices, text)
                }
                
                // 设置3秒超时，如果还没加载就直接用默认语音
                setTimeout(() => {
                    if (voices.length === 0) {
                        console.warn('[Vocab Audio] Timeout waiting for voices, using default')
                        selectVoiceAndSpeak(utterance, [], text)
                    }
                }, 3000)
            } else {
                selectVoiceAndSpeak(utterance, voices, text)
            }
        }
        
        // 给cancel一点时间
        setTimeout(speakWithRetry, 50)
        
    } catch (e) {
        console.error('[Vocab Audio] Native TTS not available:', e.message)
        // 真的没办法了，显示友好提示
        message.warning('抱歉，当前浏览器暂不支持语音播放')
    }
}

// 选择语音并播放的辅助函数
const selectVoiceAndSpeak = (utterance, voices, text) => {
    try {
        if (voices.length > 0) {
            const voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                         voices.find(v => v.lang === 'en-US') ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0]
            
            if (voice) {
                utterance.voice = voice
                console.log('[Vocab Audio] Using voice:', voice.name)
            }
        } else {
            console.log('[Vocab Audio] Using default voice (no voices available)')
        }
        
        let hasStarted = false
        
        utterance.onstart = () => {
            hasStarted = true
            console.log('[Vocab Audio] ✓ Native TTS playing')
        }
        
        utterance.onend = () => {
            console.log('[Vocab Audio] Native TTS ended')
        }
        
        utterance.onerror = (e) => {
            console.error('[Vocab Audio] Native TTS error:', e.error)
            if (!hasStarted) {
                message.error('语音播放失败: ' + e.error)
            }
        }

        console.log('[Vocab Audio] Speaking:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))
        window.speechSynthesis.speak(utterance)
        
        // 移动端特殊处理 - 确保播放
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isMobile) {
            // 多次检查并恢复播放
            let checkCount = 0
            const checkInterval = setInterval(() => {
                checkCount++
                if (checkCount > 10) {
                    clearInterval(checkInterval)
                    if (!hasStarted) {
                        console.error('[Vocab Audio] TTS failed to start after retries')
                        message.warning('语音播放未响应，请重试')
                    }
                    return
                }
                
                if (window.speechSynthesis.paused) {
                    console.log('[Vocab Audio] Resuming paused TTS')
                    window.speechSynthesis.resume()
                }
                
                if (hasStarted) {
                    clearInterval(checkInterval)
                }
            }, 100)
        }
    } catch (e) {
        console.error('[Vocab Audio] Error in selectVoiceAndSpeak:', e)
        message.error('语音配置错误: ' + e.message)
    }
}

// --- Browse Mode Logic ---

const loadBrowseData = async () => {
  loading.value = true
  try {
    const params = {
      examType: selectedExam.value,
      page: page.value,
      pageSize: pageSize,
      keyword: searchText.value
    }
    const res = await vocabularyApi.getVocabularyList(params)
    const decryptedData = decryptPayload(res.data)
    const { records, total: totalCount } = decryptedData
    
    browseWords.value = records.map((item) => {
      // 组装前台需要的格式
      return {
        ...item,
        meaning: item.translation, // 后端 translation 映射到前台 meaning
        category: item.examType || 'General', // 添加分类字段
        examples: item.example ? [{
          en: item.example,
          cn: item.exampleTranslation
        }] : []
      }
    })
    total.value = totalCount
  } catch (error) {
    console.error('Failed to load vocabulary from API:', error)
  } finally {
    loading.value = false
  }
}

// 增加总数响应式变量
const total = ref(0)
const handlePageChange = (p) => {
  page.value = p
  loadBrowseData()
}

const handleSearch = () => {
  page.value = 1
  loadBrowseData()
}

const filteredBrowseWords = computed(() => {
  if (!searchText.value) return browseWords.value
  return browseWords.value.filter(w => w.word.toLowerCase().includes(searchText.value.toLowerCase()))
})

const paginatedBrowseWords = computed(() => {
  return browseWords.value
})

const openWordDetail = (word) => {
  console.log('[词汇详情] 点击单词:', word)
  if (!word) {
    console.warn('[词汇详情] 单词数据为空')
    return
  }
  currentDetailWord.value = word
  showDetailModal.value = true
  console.log('[词汇详情] 模态框状态:', showDetailModal.value)
  try {
    playAudio(word.word, true)
  } catch (e) {
    console.error('[词汇详情] 音频播放失败:', e)
  }
}

watch(selectedExam, () => {
  if (activeTab.value === 'browse') {
    loadBrowseData()
  }
})

// --- Learn Mode Logic (智能学习模式) ---

/**
 * 开始一个新的学习会话
 * 从后端获取推荐词汇（Batch Size: 15），包含新词和复习词。
 */
const startSession = async () => {
  loading.value = true
  try {
    const words = await vocabStore.fetchRecommended(selectedExam.value, 15) // Batch size 15
    sessionWords.value = words
    sessionIndex.value = 0
    isFlipped.value = false
    sessionComplete.value = false
    sessionStats.value = { correct: 0, wrong: 0 }
    
    // 自动播放第一个单词的发音
    if (sessionWords.value.length > 0) {
      playAudio(sessionWords.value[0].word, true)
    }
  } finally {
    loading.value = false
  }
}

const currentLearnWord = computed(() => {
  if (!sessionWords.value.length || sessionIndex.value >= sessionWords.value.length) return null
  return sessionWords.value[sessionIndex.value]
})

/**
 * 处理用户对当前单词的反馈（认识/不认识）
 * @param {boolean} correct 是否掌握
 */
const handleResult = async (correct) => {
  const word = currentLearnWord.value
  if (!word) return

  // 1. 更新本地会话统计
  if (correct) sessionStats.value.correct++
  else sessionStats.value.wrong++

  // 2. 异步保存结果到 Store/Backend (用于艾宾浩斯算法更新)
  vocabStore.recordResult(word, correct)

  // 3. 更新每日任务进度 (Gamification)
  if (correct && dailyTask.value) {
    const newProgress = sessionStats.value.correct
    await taskTracker.updateProgress('vocabulary', newProgress)
    
    // 实时更新任务信息显示
    dailyTask.value = taskTracker.getTaskInfo('vocabulary')
  }

  // 4. 切换到下一个单词
  if (sessionIndex.value < sessionWords.value.length - 1) {
    sessionIndex.value++
    isFlipped.value = false
    // 延迟自动播放下一个单词发音，提升体验
    setTimeout(() => {
      playAudio(currentLearnWord.value?.word, true)
    }, 300)
  } else {
    sessionComplete.value = true
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// --- AI Mnemonic Logic ---
const mnemonicLoading = ref(false)
const mnemonicText = ref('')

const handleGetMnemonic = async () => {
  if (!currentLearnWord.value) return
  mnemonicLoading.value = true
  mnemonicText.value = ''
  try {
     // 调用后端 AI 词汇深度解析 API
     const res = await request({
        url: '/ai/vocab/detail',
        method: 'get',
        params: {
           word: currentLearnWord.value.word,
           examType: selectedExam.value
        }
     })
     
     if (res.code === 200 && res.data) {
        const details = res.data
        mnemonicText.value = details.mnemonics || 'AI 暂时没词儿了...'
        
        // 如果有词源，也可以显示在详情里，这里我们先更新助记
        if (details.etymology) {
           console.log('[AI 词源]', details.etymology)
        }
     } else {
        throw new Error('API Error')
     }
  } catch (e) {
    console.error('AI 助记生成失败:', e)
    message.error('AI 助记生成失败')
    mnemonicText.value = 'AI 助记暂时不可用，请稍后再试。'
  } finally {
    mnemonicLoading.value = false
  }
}

// --- AI Tutor State ---
const showTutor = ref(false)
const tutorContext = computed(() => {
  const word = activeTab.value === 'learn' ? currentLearnWord.value : currentDetailWord.value
  if (!word) return null
  
  return {
    type: 'vocabulary_learning',
    word: word.word,
    phonetic: word.phonetic,
    meaning: word.meaning || word.translation,
    examples: word.examples,
    topic: '单词学习',
    examType: selectedExam.value,
    module: 'vocabulary'
  }
})

const openAITutor = () => {
    showTutor.value = true
}

// Initialize
onMounted(async () => {
  loadBrowseData()
  
  // 初始化任务追踪
  taskTracker.setMessage(message)
  await taskTracker.init()
  dailyTask.value = taskTracker.getTaskInfo('vocabulary')
  
  if (dailyTask.value) {
    logger.log('[词汇学习] 今日任务:', dailyTask.value)
  }
})

</script>

<template>
  <div class="page-container">
    <!-- 每日任务进度条 -->
    <div v-if="dailyTask" class="daily-task-premium">
      <div class="flex justify-between items-end mb-2">
        <div class="flex items-center gap-2">
          <div class="task-icon-bg">
            <Target :size="18" />
          </div>
          <div>
            <div class="text-xs uppercase tracking-widest text-indigo-400 font-bold">Daily Mission</div>
            <div class="text-sm text-white font-medium">词汇达成: {{ dailyTask.completed }} / {{ dailyTask.target }}</div>
          </div>
        </div>
        <div class="text-xs text-indigo-300 font-mono">{{ Math.round((dailyTask.completed / dailyTask.target) * 100) }}%</div>
      </div>
      <n-progress
        type="line"
        :percentage="Math.round((dailyTask.completed / dailyTask.target) * 100)"
        :show-indicator="false"
        color="linear-gradient(90deg, #6366f1, #a855f7)"
        rail-color="rgba(255, 255, 255, 0.05)"
        :height="6"
        border-radius="3px"
      />
    </div>

    <!-- Stats Header -->
    <div class="stats-header">
       <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:4" responsive="screen">
          <n-grid-item>
             <n-card class="stat-card purple" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon purple"><Brain /></div>
                     <div class="stat-info">
                         <div class="stat-label">今日学习</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.todayCount" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
          <n-grid-item>
             <n-card class="stat-card green" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon green"><Trophy /></div>
                     <div class="stat-info">
                         <div class="stat-label">已掌握</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.totalMastered" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
          <n-grid-item>
             <n-card class="stat-card blue" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon blue"><Layers /></div>
                     <div class="stat-info">
                         <div class="stat-label">学习中</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.totalLearned" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
          <n-grid-item>
             <n-card class="stat-card red" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon red"><RotateCw /></div>
                     <div class="stat-info">
                         <div class="stat-label">需复习</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.totalFailed" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
       </n-grid>
    </div>

    <!-- Main Content Area -->
    <n-card :bordered="false" class="main-card">
      <n-tabs v-model:value="activeTab" type="segment" animated>
        
        <!-- Tab 1: Browse Mode -->
        <n-tab-pane name="browse" tab="词汇浏览">
          <div class="browse-header">
             <div class="filters">
               <n-select v-model:value="selectedExam" :options="examOptions" class="exam-select" @update:value="handleSearch" />
              <n-input v-model:value="searchText" placeholder="搜索单词..." round class="search-input" @keyup.enter="handleSearch">
                <template #prefix><Search :size="16" /></template>
              </n-input>
              <n-button type="primary" round @click="handleSearch">搜索</n-button>
            </div>
            <div class="total-count">
              共 {{ total }} 个单词
            </div>
          </div>

          <NSpin :show="loading">
            <div class="word-grid-container">
                <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:3 1200:4" responsive="screen">
                  <n-grid-item v-for="(word, index) in paginatedBrowseWords" :key="word.id" class="animate-slide-up" :style="{ animationDelay: `${index * 50}ms` }">
                    <div class="word-card hover-lift shine-effect" @click="openWordDetail(word)">
                      <div class="word-card-top">
                        <div class="word-main-info">
                          <h3>{{ word.word }}</h3>
                          <span class="phonetic">{{ word.phonetic }}</span>
                        </div>
                        <div class="play-btn" @click.stop="playAudio(word.word)">
                            <Volume2 :size="16" />
                        </div>
                      </div>
                      <div class="word-meaning secure-content">{{ word.meaning }}</div>
                    </div>
                  </n-grid-item>
                </n-grid>
            </div>
            
            <div class="pagination-container" v-if="total > 0">
              <n-pagination v-model:page="page" :item-count="total" :page-size="pageSize" @update:page="handlePageChange" />
            </div>
          </NSpin>
        </n-tab-pane>

        <!-- Tab 2: Learn Mode -->
        <n-tab-pane name="learn" tab="智能学习">
          <div class="learn-container">
            
            <!-- Not Started State -->
             <div v-if="sessionWords.length === 0 && !sessionComplete" class="start-session-view animate-zoom-in">
                <div class="brain-icon-wrapper pulse-animation">
                   <Brain :size="80" />
               </div>
               <h2>准备开始学习</h2>
               <p>我们将为您安排 {{ selectedExam }} 的 15 个单词，包含新词和需复习的词汇。</p>
                <div class="start-actions">
                  <n-select v-model:value="selectedExam" :options="examOptions" class="exam-select-learn" />
                  <n-button type="primary" size="large" class="active-shrink" @click="startSession">开始 Session</n-button>
                </div>
            </div>

            <!-- Learning State -->
            <div v-else-if="!sessionComplete" class="learning-view">
               <div class="learn-header">
                 <span>进度: {{ sessionIndex + 1 }} / {{ sessionWords.length }}</span>
                 <span>Exam: {{ selectedExam }}</span>
               </div>
               <n-progress type="line" :percentage="((sessionIndex) / sessionWords.length) * 100" :show-indicator="false" processing color="#6366f1" class="progress-bar" />

               <!-- Flashcard -->
               <div class="flashcard-scene" @click="flipCard">
                  <div class="flashcard-cube" :class="{ 'is-flipped': isFlipped }">
                    
                    <!-- Front -->
                    <div class="card-face front">
                       <h2 class="word-text">{{ currentLearnWord.word }}</h2>
                       <div class="phonetic-box">
                         <span class="phonetic-text">{{ currentLearnWord.phonetic }}</span>
                         <div class="sound-icon" @click.stop="playAudio(currentLearnWord.word)">
                            <Volume2 :size="20" />
                         </div>
                       </div>
                       <p class="hint-text">点击查看释义</p>
                    </div>

                     <!-- Back -->
                     <div class="card-face back">
                        <div class="card-glow-overlay"></div>
                        <div class="top-accent"></div>
                        <div class="tags-row">
                          <n-tag :type="currentLearnWord.difficulty > 3 ? 'warning' : 'success'" size="small" round ghost>{{ currentLearnWord.category }}</n-tag>
                        </div>
                        <h3 class="meaning-text secure-content">{{ currentLearnWord.meaning }}</h3>
                        
                        <div class="mnemonic-section" v-if="mnemonicText || mnemonicLoading">
                           <div class="mnemonic-box">
                             <div v-if="mnemonicLoading" class="flex items-center gap-2 text-indigo-400">
                               <n-spin size="small" /> <span>AI 正在联想中...</span>
                             </div>
                             <div v-else class="mnemonic-content secure-content">
                               {{ mnemonicText }}
                             </div>
                           </div>
                        </div>
                        <n-button v-else quaternary size="tiny" class="ai-hint-btn" @click.stop="handleGetMnemonic">
                           <template #icon><Zap :size="14" /></template>
                           求助 AI 助记
                        </n-button>
                        
                        <n-button quaternary size="tiny" class="ai-tutor-btn-inline mt-1" @click.stop="openAITutor">
                           <template #icon><n-icon :component="MessageCircle" :size="14" /></template>
                           问问 AI 导师
                        </n-button>

                        <div class="example-box-premium secure-content">
                           <div class="ex-row">
                              <p class="en-sent">"{{ currentLearnWord.examples[0].en }}"</p>
                              <div class="sound-icon-small" @click.stop="playAudio(currentLearnWord.examples[0].en)">
                                  <Volume2 :size="18" />
                              </div>
                           </div>
                           <p class="cn-sent">{{ currentLearnWord.examples[0].cn }}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <!-- Controls -->
               <div class="learn-controls">
                   <template v-if="isFlipped">
                      <n-button circle color="#ef4444" size="large" class="control-btn active-shrink feedback-wrong" @click="handleResult(false)">
                         <template #icon><X /></template>
                      </n-button>
                      <n-button circle color="#22c55e" size="large" class="control-btn active-shrink feedback-correct" @click="handleResult(true)">
                         <template #icon><Check /></template>
                      </n-button>
                   </template>
                   <div v-else class="thinking-text">思考一下...</div>
               </div>
            </div>

            <!-- Complete State -->
             <div v-else class="complete-view animate-zoom-in">
                <div class="trophy-wrapper trophy-bounce">
                  <Trophy class="trophy-icon" />
                </div>
                <h2 class="title-gradient">Session 完成!</h2>
               <p>本次学习 {{ sessionStats.correct }} 个新单词，需复习 {{ sessionStats.wrong }} 个。</p>
               
               <div class="result-stats-row">
                 <div class="stat-box">
                   <div class="val green">{{ sessionStats.correct }}</div>
                   <div class="lbl">掌握</div>
                 </div>
                 <div class="stat-box">
                   <div class="val red">{{ sessionStats.wrong }}</div>
                   <div class="lbl">待加强</div>
                 </div>
               </div>

               <n-button type="primary" size="large" @click="startSession">再来一组</n-button>
            </div>

          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Detail Modal -->
    <n-modal 
      v-model:show="showDetailModal"
      :trap-focus="true"
      :auto-focus="true"
      :close-on-esc="true"
      :mask-closable="true"
    >
       <n-card
        style="width: 500px; max-width: 90vw;"
        :title="currentDetailWord?.word"
        :bordered="false"
        role="dialog"
        aria-modal="true"
        class="detail-modal-card"
      >
        <template #header-extra>
           <div class="modal-sound" @click="playAudio(currentDetailWord?.word)">
               <Volume2 :size="24" />
           </div>
        </template>
        
        <div v-if="currentDetailWord" class="detail-content">
           <div class="modal-meta">
              <span class="modal-phonetic">{{ currentDetailWord.phonetic }}</span>
              <n-tag type="info" size="small">{{ currentDetailWord.category }}</n-tag>
              <n-button size="tiny" secondary type="primary" @click="openAITutor" class="ml-auto" style="margin-left: auto;">
                  <template #icon><n-icon :component="MessageCircle" /></template>
                  AI 导师
              </n-button>
           </div>
           
           <div class="modal-section">
              <h4>释义</h4>
              <p class="meaning-big">{{ currentDetailWord.meaning }}</p>
              <p v-if="currentDetailWord.definition" class="definition-text">{{ currentDetailWord.definition }}</p>
           </div>

           <div class="modal-section">
              <h4>例句</h4>
              <div v-for="(ex, idx) in currentDetailWord.examples" :key="idx" class="example-item">
                 <div class="ex-row">
                    <p class="ex-en">{{ ex.en }}</p>
                    <div class="sound-icon-small" @click="playAudio(ex.en)">
                       <Volume2 :size="16" />
                    </div>
                 </div>
                 <p class="ex-cn">{{ ex.cn }}</p>
              </div>
           </div>
        </div>
      </n-card>
    </n-modal>
    <!-- AI Tutor Component -->
    <AITutor 
      :context="tutorContext"
      :auto-open="showTutor"
      @close="showTutor = false"
    />
  </div>
</template>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

/* 每日任务横幅 */
.daily-task-premium {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 32px;
}
:global(.dark-mode) .daily-task-premium {
    background: rgba(30,30,35,0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.task-icon-bg {
    width: 36px; height: 36px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #6366f1;
}
/* Override Tailwind text colors for Daily Task in light mode */
.daily-task-premium .text-white { color: #18181b; }
:global(.dark-mode) .daily-task-premium .text-white { color: #fff; }
.daily-task-premium .text-indigo-400 { color: #6366f1; }
:global(.dark-mode) .daily-task-premium .text-indigo-400 { color: #818cf8; }
.daily-task-premium .text-indigo-300 { color: #818cf8; }
:global(.dark-mode) .daily-task-premium .text-indigo-300 { color: #a5b4fc; }

/* Stats Header */
.stats-header {
    margin-bottom: 24px;
}
.stat-card {
    background: rgba(0,0,0,0.03);
    border-radius: 16px;
    height: 100%;
}
:global(.dark-mode) .stat-card {
    background: rgba(30,30,35,0.6);
}
.stat-card.purple { background: rgba(168, 85, 247, 0.1); }
:global(.dark-mode) .stat-card.purple { background: rgba(88, 28, 135, 0.2); }
.stat-card.green { background: rgba(74, 222, 128, 0.1); }
:global(.dark-mode) .stat-card.green { background: rgba(6, 78, 59, 0.2); }
.stat-card.blue { background: rgba(96, 165, 250, 0.1); }
:global(.dark-mode) .stat-card.blue { background: rgba(30, 58, 138, 0.2); }
.stat-card.red { background: rgba(251, 113, 133, 0.1); }
:global(.dark-mode) .stat-card.red { background: rgba(136, 19, 55, 0.2); }

.stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
}
.stat-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
}
.stat-icon svg { width: 24px; height: 24px; }
.stat-icon.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.stat-icon.green { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
.stat-icon.blue { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.stat-icon.red { background: rgba(251, 113, 133, 0.2); color: #fb7185; }

.stat-info .stat-label { font-size: 0.85rem; color: #52525b; margin-bottom: 2px; }
:global(.dark-mode) .stat-info .stat-label { color: #a1a1aa; }
.stat-info .stat-value { font-size: 1.5rem; font-weight: 700; color: #18181b; line-height: 1; }
:global(.dark-mode) .stat-info .stat-value { color: #fff; }

/* Main Card */
.main-card {
    background: rgba(0,0,0,0.03);
    border-radius: 16px;
    min-height: 600px;
}
:global(.dark-mode) .main-card {
    background: rgba(30,30,35,0.6);
}

/* Browse Tab */
.filters {
    display: flex;
    gap: 16px;
    flex: 1;
}

@media (max-width: 768px) {
  .browse-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .filters {
    flex-direction: column;
    gap: 12px;
  }
  .exam-select, .search-input {
    width: 100%;
  }
  .total-count {
    text-align: right;
  }
}

.exam-select { width: 200px; }
.search-input { width: 200px; }
.total-count { color: #a1a1aa; font-size: 0.9rem; }

.word-card {
    background: rgba(0,0,0,0.03);
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
}
:global(.dark-mode) .word-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
}
.word-card:hover {
    background: rgba(0,0,0,0.06);
    border-color: #6366f1;
    transform: translateY(-2px);
}
:global(.dark-mode) .word-card:hover {
    background: rgba(255,255,255,0.06);
}
.word-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}
.word-main-info h3 { font-size: 1.1rem; color: #18181b; font-weight: 700; margin: 0 0 2px 0; }
:global(.dark-mode) .word-main-info h3 { color: #fff; }
.word-main-info .phonetic { font-size: 0.8rem; color: #52525b; font-family: monospace; }
:global(.dark-mode) .word-main-info .phonetic { color: #a1a1aa; }
.play-btn { color: #52525b; transition: color 0.2s; }
:global(.dark-mode) .play-btn { color: #71717a; }
.word-card:hover .play-btn { color: #6366f1; }
.word-meaning { font-size: 0.9rem; color: #3f3f46; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
:global(.dark-mode) .word-meaning { color: #d4d4d8; }

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 32px;
}

/* Learn Tab */
.learn-container {
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 400px;
}

@media (max-width: 768px) {
    .learn-container {
      padding: 10px 0;
    }
}

/* Not Started */
.start-session-view { text-center: center; }
.brain-icon-wrapper {
    width: 100px; height: 100px;
    margin: 0 auto 24px;
    display: flex; align-items: center; justify-content: center;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 50%;
}
.start-session-view h2 { font-size: 1.8rem; color: #18181b; margin-bottom: 12px; }
:global(.dark-mode) .start-session-view h2 { color: #fff; }
.start-session-view p { color: #52525b; margin-bottom: 32px; max-width: 400px; }
:global(.dark-mode) .start-session-view p { color: #a1a1aa; }
.start-actions { display: flex; gap: 16px; justify-content: center; }
.exam-select-learn { width: 160px; text-align: left; }

/* Learning View */
.learning-view { width: 100%; max-width: 600px; perspective: 1000px; }
.learn-header { display: flex; justify-content: space-between; color: #52525b; font-size: 0.9rem; margin-bottom: 8px; }
:global(.dark-mode) .learn-header { color: #a1a1aa; }
.progress-bar { margin-bottom: 32px; }

.flashcard-scene {
    width: 100%;
    height: 360px;
    cursor: pointer;
}
.flashcard-cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}
.flashcard-cube.is-flipped {
    transform: rotateY(180deg);
}
.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 32px;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
    overflow: hidden;
}
:global(.dark-mode) .card-face {
    background: #111115;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
}

.card-glow-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 120%, rgba(99, 102, 241, 0.15), transparent 70%);
  pointer-events: none;
}

.top-accent {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 6px;
  background: linear-gradient(to right, #6366f1, #a855f7);
}

.card-face.back {
    transform: rotateY(180deg);
    border-color: rgba(99, 102, 241, 0.3);
}

/* Front Face */
.word-text { font-size: 3rem; font-weight: 800; color: #18181b; margin-bottom: 24px; }
:global(.dark-mode) .word-text { color: #fff; }

@media (max-width: 768px) {
    .flashcard-scene {
        height: 300px;
    }
    .word-text {
        font-size: 2.2rem;
    }
    .card-face {
        padding: 20px;
    }
}

.phonetic-box {
    display: flex; align-items: center; gap: 12px;
    background: rgba(0,0,0,0.05);
    padding: 8px 16px;
    border-radius: 99px;
    margin-bottom: 40px;
}
:global(.dark-mode) .phonetic-box {
    background: rgba(255,255,255,0.05);
}
.phonetic-text { font-size: 1.2rem; color: #6366f1; font-family: monospace; }
:global(.dark-mode) .phonetic-text { color: #818cf8; }
.sound-icon { color: #6366f1; cursor: pointer; display: flex; }
.hint-text { color: #71717a; font-size: 0.9rem; }
:global(.dark-mode) .hint-text { color: #52525b; }

/* Back Face */
.meaning-text { font-size: 2.5rem; font-weight: 900; color: #18181b; margin: 16px 0 24px; text-align: center; }
:global(.dark-mode) .meaning-text { color: #fff; }

@media (max-width: 768px) {
  .meaning-text {
     font-size: 1.75rem;
  }
}

.mnemonic-section {
  width: 100%;
  margin-bottom: 24px;
}

.mnemonic-box {
  background: rgba(99, 102, 241, 0.05);
  border: 1px dashed rgba(99, 102, 241, 0.3);
  border-radius: 16px;
  padding: 16px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:global(.dark-mode) .mnemonic-box {
  background: rgba(99, 102, 241, 0.1);
  border: 1px dashed rgba(99, 102, 241, 0.4);
}

.mnemonic-content {
  font-size: 0.9rem;
  color: #4f46e5;
  line-height: 1.6;
  font-style: italic;
}
:global(.dark-mode) .mnemonic-content {
  color: #c7d2fe;
}

.ai-hint-btn {
  margin-bottom: 24px;
  color: #6366f1 !important;
  font-weight: 600;
}

.example-box-premium {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 20px;
    border-radius: 20px;
    width: 100%;
}
:global(.dark-mode) .example-box-premium {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
}
.en-sent { font-size: 1.15rem; color: #18181b; margin-bottom: 6px; font-family: 'Merriweather', serif; line-height: 1.5; }
:global(.dark-mode) .en-sent { color: #fff; }
.cn-sent { font-size: 0.9rem; color: #52525b; }
:global(.dark-mode) .cn-sent { color: #a1a1aa; }

/* Control Buttons */
.learn-controls {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 32px;
    height: 64px;
}

@media (max-width: 768px) {
    .learn-controls {
        gap: 20px;
        margin-top: 24px;
    }
}
.control-btn {
    width: 64px; height: 64px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.thinking-text { color: #71717a; line-height: 64px; }

/* Complete View */
.complete-view { text-center: center; animation: fadeIn 0.5s; padding-top: 40px; }
.trophy-wrapper {
    width: 80px; height: 80px;
    background: rgba(34, 197, 94, 0.1);
    color: #4ade80;
    border-radius: 50%;
    margin: 0 auto 24px;
    display: flex; align-items: center; justify-content: center;
}
.complete-view h2 { font-size: 2rem; color: #fff; margin-bottom: 8px; }
.complete-view p { color: #a1a1aa; margin-bottom: 40px; }
.result-stats-row { display: flex; gap: 16px; justify-content: center; margin-bottom: 40px; }
.stat-box {
    background: #f4f4f5;
    padding: 20px 40px;
    border-radius: 12px;
}
:global(.dark-mode) .stat-box {
    background: #1f1f23;
}
.stat-box .val { font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
.stat-box .val.green { color: #4ade80; }
.stat-box .val.red { color: #f87171; }
.stat-box .lbl { font-size: 0.8rem; color: #71717a; text-transform: uppercase; }

/* Modal Styles */
.detail-modal-card { background: #ffffff; }
:global(.dark-mode) .detail-modal-card { background: #1e1e23; }
.modal-sound { color: #6366f1; cursor: pointer; transition: color 0.2s; }
.modal-sound:hover { color: #818cf8; }
.detail-content { margin-top: 16px; }
.modal-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.modal-phonetic { 
    font-size: 1.25rem; 
    color: #6366f1; 
    font-family: 'Courier New', monospace; 
    font-weight: 500;
}
:global(.dark-mode) .modal-phonetic { color: #c7d2fe; }
.modal-section { margin-bottom: 32px; }
.modal-section h4 { 
    font-size: 0.8rem; 
    color: #71717a; 
    text-transform: uppercase; 
    margin-bottom: 12px; 
    font-weight: 700; 
    letter-spacing: 0.5px;
}
:global(.dark-mode) .modal-section h4 { color: #a1a1aa; }
.meaning-big { 
    font-size: 1.5rem; 
    color: #18181b; 
    font-weight: 600; 
    line-height: 1.4;
}
:global(.dark-mode) .meaning-big { color: #fafafa; }
.definition-text { 
    font-size: 1rem; 
    color: #52525b; 
    font-style: italic; 
    margin-top: 8px; 
    line-height: 1.6; 
}
:global(.dark-mode) .definition-text { color: #d4d4d8; }
.example-item {
    background: rgba(99, 102, 241, 0.05);
    border-left: 3px solid #6366f1;
    padding: 14px 18px;
    border-radius: 0 12px 12px 0;
    margin-bottom: 12px;
}
:global(.dark-mode) .example-item {
    background: rgba(99, 102, 241, 0.08);
    border-left-color: #818cf8;
}
.ex-en { 
    font-size: 1.05rem; 
    color: #18181b; 
    margin-bottom: 6px; 
    line-height: 1.6; 
    font-weight: 500;
}
:global(.dark-mode) .ex-en { color: #f4f4f5; }
.ex-cn { 
    font-size: 0.9rem; 
    color: #52525b; 
    line-height: 1.5;
}
:global(.dark-mode) .ex-cn { color: #d4d4d8; }

.ex-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}
.sound-icon-small {
    color: #6366f1;
    cursor: pointer;
    background: rgba(99, 102, 241, 0.1);
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-top: -2px;
}
.sound-icon-small:hover {
    background: #6366f1;
    color: white;
}
@media (max-width: 768px) {
    .page-container {
        padding: 12px;
    }
    
    /* 统计卡片优化 */
    .stats-header .n-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
    }
    
    .stat-card {
        padding: 12px !important;
    }
    
    .stat-content {
        gap: 12px !important;
    }
    
    .stat-icon {
        width: 40px !important;
        height: 40px !important;
    }
    
    .stat-icon svg {
        width: 20px !important;
        height: 20px !important;
    }
    
    .stat-info .stat-label {
        font-size: 0.75rem !important;
    }
    
    .stat-info .stat-value {
        font-size: 1.25rem !important;
    }
    
    /* 主卡片优化 */
    .main-card {
        min-height: auto !important;
    }
    
    /* Tab 标签优化 */
    .n-tabs .n-tabs-tab {
        padding: 8px 16px !important;
        font-size: 0.9rem !important;
    }
    
    /* 浏览模式优化 */
    .browse-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .filters {
        flex-direction: column;
        gap: 12px;
    }
    
    .exam-select, .search-input {
        width: 100% !important;
    }
    
    .filters .n-button {
        width: 100%;
    }
    
    /* 学习模式优化 */
    .start-session-view {
        padding: 20px;
        text-align: center;
    }
    
    .brain-icon-wrapper {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
    }
    
    .start-session-view h2 {
        font-size: 1.5rem;
    }
    
    .start-session-view p {
        font-size: 0.9rem;
    }
    
    .start-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .exam-select-learn {
        width: 100% !important;
    }
    
    .start-actions .n-button {
        width: 100% !important;
    }
    
    /* 卡片学习优化 */
    .flashcard-scene {
        height: 400px;
    }
    
    .word-text {
        font-size: 2rem;
    }
    
    .meaning-text {
        font-size: 1.4rem;
    }
    
    .learn-controls {
        margin-top: 20px;
        gap: 20px;
    }
    
    .control-btn {
        width: 56px;
        height: 56px;
    }
    
    /* 结果统计优化 */
    .stat-box {
        padding: 16px 20px;
    }
    
    .result-stats-row {
        flex-direction: column;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .page-container {
        padding: 8px;
    }
    
    /* 统计卡片改为单列 */
    .stats-header .n-grid {
        grid-template-columns: 1fr !important;
    }
    
    .flashcard-scene {
        height: 350px;
    }
    
    .word-text {
        font-size: 1.75rem;
    }
    
    .meaning-text {
        font-size: 1.2rem;
    }
    
    .start-session-view h2 {
        font-size: 1.25rem;
    }
}
/* --- Micro-interactions Additional CSS --- */
.pulse-animation {
    animation: pulse-soft 2s infinite;
}

.trophy-bounce {
    animation: trophy-float 3s ease-in-out infinite;
}

@keyframes trophy-float {
    0%, 100% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-15px) rotate(5deg); }
}

.title-gradient {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
}

.feedback-correct:hover {
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
}

.feedback-wrong:hover {
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
}

.play-btn:active {
    transform: scale(0.85);
}

.sound-icon:active, .sound-icon-small:active {
    transform: scale(0.8);
    transition: transform 0.1s;
}

/* Ensure smooth modal transition */
:deep(.n-modal-container) {
    backdrop-filter: blur(4px);
}
</style>