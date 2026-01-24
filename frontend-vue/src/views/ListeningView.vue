<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, useMessage, NSpin, NIcon, NPagination
} from 'naive-ui'
import { 
  Rocket, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Brain, Target, Clock, BookOpen, AlertCircle, History,
  ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, StopCircle,
  Mic, Globe, MessageCircle, GraduationCap, Book, Layers
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import logger from '@/utils/logger'
import { useListeningStore } from '@/stores/listening'

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
  return passages.value[currentPassageIndex.value]
})

const currentQuestion = computed(() => {
  const p = currentPassage.value
  if (!p || !p.questions) return null
  return p.questions[currentQuestionInPassage.value]
})

const isListeningInProgress = computed(() => {
  return step.value === 'testing' && Object.keys(answersPerPassage.value).length > 0
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
        passages.value = material.passages
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
         historyMaterials.value = res.data.records
         historyTotal.value = res.data.total
      } else {
         historyMaterials.value = res.data || []
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
  try {
    let qData = item.questions
    if (typeof qData === 'string') {
      try {
        qData = JSON.parse(qData)
      } catch (e) {
        logger.error('Failed to parse questions JSON', e)
        qData = []
      }
    }
    
    // 将历史记录（单篇）适配到新的多篇章结构中
    passages.value = [{
      id: item.id || Date.now(),
      title: item.title || 'Historical Material',
      script: item.script || item.audioScript || item.content || '',
      questions: Array.isArray(qData) ? qData : []
    }]

    // 重置答题状态
    currentPassageIndex.value = 0
    currentQuestionInPassage.value = 0
    answersPerPassage.value = { 0: {} }
    
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
      if (res.data.passages) {
        // Backend returns passages array, each with audioScript field
        passages.value = res.data.passages.map(p => ({
          ...p,
          script: p.audioScript || p.script || p.content || ''
        }))
      } else {
        // Backend returns single passage data
        passages.value = [{
          id: 1,
          title: res.data.title || 'Passage 1',
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

      step.value = 'testing'
      message.success(`听力生成成功：共 ${passages.value.length} 篇`)
      fetchHistory()
      
      listeningStore.startPractice({ passages: passages.value }, settings.value.examType, settings.value.difficulty)
    }
  } catch (e) {
    logger.error('Generation Error', e)
    message.error('生成失败')
  } finally {
    isLoading.value = false
  }
}

// Keep utterance reference to prevent garbage collection
let currentUtterance = null

/**
 * 播放听力音频
 * 使用浏览器原生的 SpeechSynthesis API
 * 支持语速调节 (0.8x - 1.2x) 和 Google 优质语音自动选择
 */
const playAudio = () => {
  const p = currentPassage.value
  if (!p) return

  if (!p.script) {
      message.warning('当前篇章暂无音频脚本，无法播放')
      return
  }

  if ('speechSynthesis' in window) {
    // 停止当前任何正在播放的音频
    window.speechSynthesis.cancel()

    // 创建新的发声对象
    const utterance = new SpeechSynthesisUtterance(p.script)
    currentUtterance = utterance // 保持引用以防被垃圾回收

    utterance.lang = 'en-US'
    utterance.rate = settings.value.speed === 'slow' ? 0.8 : settings.value.speed === 'fast' ? 1.2 : 1.0
    
    // 尝试优先选择 Google 的高质量语音
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                           voices.find(v => v.lang === 'en-US') ||
                           voices.find(v => v.lang.startsWith('en'))
    if (preferredVoice) {
        utterance.voice = preferredVoice
    }
    
    utterance.onstart = () => { 
        logger.debug('Audio started')
        isPlaying.value = true 
    }
    utterance.onend = () => { 
        logger.debug('Audio ended')
        isPlaying.value = false 
        currentUtterance = null
    }
    utterance.onerror = (e) => { 
        if (e.error !== 'interrupted') {
             logger.error('Audio error', e)
             message.error('音频播放出错: ' + e.error)
        } else {
             logger.debug('Audio playback interrupted (user action)')
        }
        isPlaying.value = false 
    }
    
    // 开始播放
    window.speechSynthesis.speak(utterance)
    
    // 强制恢复 (兼容某些浏览器暂停后的 bug)
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
    }

  } else {
      message.error('您的浏览器不支持语音播放功能')
  }
}

/**
 * 停止音频播放
 */
const stopAudio = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    isPlaying.value = false
    currentUtterance = null
  }
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
  listeningStore.saveDraft(flatAnswers)
  listeningStore.updatePosition(pIdx)
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
    for (let i = 0; i < passages.value.length; i++) {
      const p = passages.value[i]
      const pAns = answersPerPassage.value[i] || {}
      for (let j = 0; j < p.questions.length; j++) {
        const q = p.questions[j]
        const isCorrect = pAns[j] === q.correct
        if (isCorrect) correct++
        total++
        
        // 异步保存答题记录 (为了不阻塞 UI，也可以改为 Promise.all 批量提交)
        await learningApi.createRecord({
          contentId: q.id || (i * 100 + j),
          contentType: 'listening',
          isCorrect: isCorrect ? 1 : 0,
          answer: pAns[j] !== undefined ? String(pAns[j]) : '-1',
          correctAnswer: String(q.correct),
          masteryLevel: isCorrect ? 3 : 1,
          originalContent: JSON.stringify({ passage: p.title, question: q.question, script: p.script })
        }).catch(err => logger.error('Save error', err))
      }
    }
    score.value = total > 0 ? Math.round((correct / total) * 100) : 0
    step.value = 'result'
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

const getGlobalNum = (pIdx, qIdx) => {
  let num = 1
  for (let i = 0; i < pIdx; i++) num += passages.value[i].questions?.length || 0
  return num + qIdx
}
</script>

<template>
  <div class="listening-view">
    <!-- 1. Setup Phase -->
    <div v-if="step === 'setup'" class="setup-container">
       <n-card class="setup-card" :bordered="false" size="huge">
          
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
                         <div class="history-title">{{ item.title }}</div>
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
    </div>

    <!-- 2. Testing Phase -->
    <div v-else-if="step === 'testing'" class="test-container">
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
                    @click="selectAnswer(idx)">
                  <span class="option-idx">{{ String.fromCharCode(65 + idx) }}</span>
                  <span class="option-text">{{ opt }}</span>
               </div>
            </div>
            <div class="nav-actions">
              <n-space justify="space-between" style="width: 100%">
                <n-button secondary @click="prevQuestion" :disabled="currentPassageIndex === 0 && currentQuestionInPassage === 0">
                   上一题
                </n-button>
                <n-button type="primary" @click="nextQuestion">
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
    </div>

    <!-- 3. Result Phase -->
    <div v-else class="result-container">
       <n-card class="result-card" :bordered="false">
          <n-result status="success" :title="`练习已完成! 得分: ${score}`" :description="score >= 60 ? '表现不错，继续保持！' : '还需要多加练习，加油！'">
            <template #icon>
              <div class="score-circle">
                <span class="val">{{ score }}</span>
              </div>
            </template>
            <template #footer>
               <n-space justify="center">
                 <n-button type="primary" @click="restart">重新开始项目</n-button>
                 <n-button secondary>查看详细解析</n-button>
               </n-space>
            </template>
          </n-result>
       </n-card>
    </div>
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
</style>

<style src="../assets/learning-mobile.css" scoped></style>
