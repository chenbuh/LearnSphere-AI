<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, useMessage, NSpin, NIcon, NPagination
} from 'naive-ui'
import { 
  Rocket, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Brain, Target, Clock, BookOpen, AlertCircle, History,
  ArrowLeft, ChevronLeft, ChevronRight, PlayCircle, StopCircle
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import logger from '@/utils/logger'

const message = useMessage()

// --- State ---
const step = ref('setup') // 'setup' | 'testing' | 'result'
const isLoading = ref(false)
const passages = ref([])
const currentPassageIndex = ref(0)
const currentQuestionInPassage = ref(0)
const answersPerPassage = ref({}) // Format: { passageIndex: { questionIndex: optionIndex } }
const score = ref(0)
const historyMaterials = ref([])
const isPlaying = ref(false)

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(10)
const historyTotal = ref(0)
watch([historyPage, historyPageSize], () => {
    fetchHistory()
})

// --- Settings State ---
const settings = ref({
  examType: 'ted',
  mode: 'extensive',
  difficulty: 'normal',
  count: 3 // Default to 3 passages
})

// --- Options Constants ---
const examTypes = [
  { label: 'TED 演讲', value: 'ted', icon: '🎤' },
  { label: 'BBC 新闻', value: 'bbc', icon: '🌏' },
  { label: '日常对话', value: 'dialog', icon: '💬' },
  { label: '托福听力', value: 'toefl', icon: '🗽' },
  { label: '雅思听力', value: 'ielts', icon: '🇬🇧' },
  { label: '英语故事', value: 'stories', icon: '📖' }
]

const testModes = [
  { label: '精听训练', value: 'intensive', icon: Target, desc: '逐句听写/跟读' },
  { label: '泛听理解', value: 'extensive', icon: BookOpen, desc: '理解大意/答题' },
  { label: '听音辨词', value: 'dictation', icon: Brain, desc: '单词拼写/填空' }
]

const difficulties = [
  { label: '慢速', value: 'slow' },
  { label: '标准', value: 'normal' },
  { label: '快速', value: 'fast' }
]

const counts = [3, 5, 8, 10]

// --- Computed ---
const currentPassage = computed(() => passages.value[currentPassageIndex.value] || null)
const currentQuestion = computed(() => {
  const p = currentPassage.value
  if (!p || !p.questions) return null
  return p.questions[currentQuestionInPassage.value]
})

const totalQuestionsCount = computed(() => {
  return passages.value.reduce((acc, p) => acc + (p.questions?.length || 0), 0)
})

const currentGlobalIndex = computed(() => {
  let index = 0
  for (let i = 0; i < currentPassageIndex.value; i++) {
    index += passages.value[i]?.questions?.length || 0
  }
  return index + currentQuestionInPassage.value
})

const progressPercent = computed(() => {
  if (totalQuestionsCount.value === 0) return 0
  return ((currentGlobalIndex.value + 1) / totalQuestionsCount.value) * 100
})

const isListeningInProgress = computed(() => step.value === 'testing' && Object.keys(answersPerPassage.value).length > 0)

const paginatedHistory = computed(() => historyMaterials.value)

// --- Logic ---

const handleBeforeUnload = (e) => {
  if (isListeningInProgress.value) {
    e.preventDefault()
    e.returnValue = '练习正在进行中，离开将丢失进度。'
    return e.returnValue
  }
}

onMounted(() => {
  fetchHistory()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  stopAudio()
})

// 监听篇章切换，自动停止音频
watch(currentPassageIndex, () => {
  stopAudio()
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
      script: item.script || '',
      questions: Array.isArray(qData) ? qData : []
    }]

    // 重置答题状态
    currentPassageIndex.value = 0
    currentQuestionInPassage.value = 0
    answersPerPassage.value = { 0: {} }
    
    step.value = 'testing'
    message.success(`已重新加载: ${item.title}`)
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
        passages.value = res.data.passages
      } else {
        passages.value = [{
          id: 1,
          title: res.data.title || 'Passage 1',
          script: res.data.script || '',
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
    }
  } catch (e) {
    logger.error('Generation Error', e)
    message.error('生成失败')
  } finally {
    isLoading.value = false
  }
}

const playAudio = () => {
  const p = currentPassage.value
  if (!p || !p.script) return

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(p.script)
    utterance.lang = 'en-US'
    utterance.rate = settings.value.difficulty === 'slow' ? 0.8 : settings.value.difficulty === 'fast' ? 1.2 : 1.0
    
    utterance.onstart = () => { isPlaying.value = true }
    utterance.onend = () => { isPlaying.value = false }
    utterance.onerror = () => { isPlaying.value = false }
    
    window.speechSynthesis.speak(utterance)
  }
}

const stopAudio = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  isPlaying.value = false
}

const selectAnswer = (idx) => {
  if (!answersPerPassage.value[currentPassageIndex.value]) {
    answersPerPassage.value[currentPassageIndex.value] = {}
  }
  answersPerPassage.value[currentPassageIndex.value][currentQuestionInPassage.value] = idx
}

const nextQuestion = () => {
  const p = currentPassage.value
  if (!p) return

  if (currentQuestionInPassage.value < p.questions.length - 1) {
    currentQuestionInPassage.value++
  } else if (currentPassageIndex.value < passages.value.length - 1) {
    currentPassageIndex.value++
    currentQuestionInPassage.value = 0
    message.info(`进入下一篇: ${currentPassage.value.title}`)
  } else {
    submitExam()
  }
}

const prevQuestion = () => {
  if (currentQuestionInPassage.value > 0) {
    currentQuestionInPassage.value--
  } else if (currentPassageIndex.value > 0) {
    currentPassageIndex.value--
    const p = passages.value[currentPassageIndex.value]
    currentQuestionInPassage.value = (p.questions?.length || 1) - 1
  }
}

const goToQuestion = (pIdx, qIdx) => {
  currentPassageIndex.value = pIdx
  currentQuestionInPassage.value = qIdx
}

const submitExam = async () => {
  isLoading.value = true
  try {
    let correct = 0
    let total = 0
    
    for (let i = 0; i < passages.value.length; i++) {
      const p = passages.value[i]
      const pAns = answersPerPassage.value[i] || {}
      for (let j = 0; j < p.questions.length; j++) {
        const q = p.questions[j]
        const isCorrect = pAns[j] === q.correct
        if (isCorrect) correct++
        total++
        
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
      <div class="hero-section">
        <h1>AI 听力特训</h1>
        <p>基于先进 AI 技术的沉浸式英语听力环境</p>
      </div>

      <!-- Top Config Section -->
      <div class="setup-main-content">
          <n-card class="config-card" size="huge" :bordered="false">
            <template #header>
              <div class="card-header-styled">
                 <n-icon :component="Target" color="#6366f1" />
                 <span>配置您的生成方案</span>
              </div>
            </template>
            
            <n-grid x-gap="40" y-gap="24" cols="1 600:3" responsive="screen">
                <n-grid-item>
                    <div class="config-item">
                      <label>材料类型</label>
                      <div class="type-grid-vertical">
                        <div v-for="t in examTypes" :key="t.value" 
                             class="type-btn" :class="{ active: settings.examType === t.value }"
                             @click="settings.examType = t.value">
                          <span class="icon">{{ t.icon }}</span>
                          <span class="label">{{ t.label }}</span>
                        </div>
                      </div>
                    </div>
                </n-grid-item>
                
                <n-grid-item span="2">
                    <div class="config-right-panel">
                        <div class="config-item">
                          <label>篇章数量</label>
                          <n-space size="large">
                            <div v-for="c in counts" :key="c" 
                                class="pill-option" :class="{ active: settings.count === c }"
                                @click="settings.count = c">
                                {{ c }} 篇
                            </div>
                          </n-space>
                        </div>

                        <div class="config-item">
                          <label>语速控制</label>
                          <n-space size="large">
                            <div v-for="d in difficulties" :key="d.value" 
                                class="pill-option" :class="{ active: settings.difficulty === d.value }"
                                @click="settings.difficulty = d.value">
                                {{ d.label }}
                            </div>
                          </n-space>
                        </div>
                        
                        <div class="mt-8">
                             <n-button type="primary" block size="large" class="generate-btn" :loading="isLoading" @click="generateQuestions">
                                <template #icon><n-icon :component="Rocket" /></template>
                                生成听力材料
                              </n-button>
                        </div>
                    </div>
                </n-grid-item>
            </n-grid>
          </n-card>
      </div>

      <!-- History Section (Bottom) -->
      <div v-if="historyTotal > 0" class="history-section mt-12">
         <div class="section-title">
             <n-icon :component="History" /> 最近生成
         </div>
         <n-grid x-gap="20" y-gap="20" cols="1 600:2 900:3" responsive="screen">
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
            <div class="playback-visualizer" :class="{ isPlaying }">
              <div v-for="i in 8" :key="i" class="bar"></div>
            </div>
            <div class="play-btn">
              <n-icon :component="isPlaying ? StopCircle : PlayCircle" size="48" />
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
              <h3>{{ currentQuestion?.question }}</h3>
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
.hero-section p { color: #71717a; font-size: 1.1rem; }

.config-card, .history-card {
  height: 100%;
  background: rgba(30,30,35,0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.config-item { margin-bottom: 24px; }
.config-item label { display: block; font-size: 0.8rem; color: #a1a1aa; font-weight: 600; text-transform: uppercase; margin-bottom: 12px; }

/* New Config Layout Styles */
.card-header-styled {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.type-grid-vertical {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}
.type-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
}
.type-btn:hover { background: rgba(255, 255, 255, 0.06); }
.type-btn.active { border-color: #6366f1; background: rgba(99, 102, 241, 0.15); box-shadow: 0 0 15px rgba(99, 102, 241, 0.2); }
.type-btn .icon { font-size: 1.8rem; display: block; margin-bottom: 8px; }
.type-btn .label { font-size: 0.9rem; color: #d4d4d8; font-weight: 500; }

.pill-option {
    padding: 8px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 99px;
    cursor: pointer;
    transition: all 0.2s;
    color: #d4d4d8;
    font-size: 0.9rem;
}
.pill-option:hover { background: rgba(255,255,255,0.1); }
.pill-option.active { background: #6366f1; color: white; border-color: #6366f1; font-weight: 600; }

.generate-btn {
    height: 56px;
    font-size: 1.1rem;
    font-weight: 700;
}

.config-right-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}

/* History Card Items (Grid Style) */
.history-section { margin-top: 48px; }
.section-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #e4e4e7;
}

.history-card-item {
    background: rgba(40, 40, 45, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
    height: 100%;
}
.history-card-item:hover {
    background: rgba(50, 50, 55, 0.8);
    transform: translateY(-4px);
    border-color: #6366f1;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
.history-title {
    font-size: 1.05rem;
    font-weight: 700;
    margin-top: 8px;
    color: #fff;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    height: 2.8em; /* Fixed height for alignment */
}
.history-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 12px;
}
.word-count { font-size: 0.85rem; color: #a1a1aa; }

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

/* Test Interface */
.test-container { max-width: 1200px; margin: 0 auto; }
.test-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  background: rgba(30,30,35,0.6);
  padding: 16px 24px;
  border-radius: 16px;
}
.passage-title { flex: 1; }
.passage-title h2 { margin: 0; font-size: 1.25rem; font-weight: 700; }
.timer-box { display: flex; align-items: center; gap: 12px; }
.timer-box .count { font-weight: 700; font-family: monospace; color: #6366f1; }

.test-layout { display: flex; gap: 24px; }
.main-content { flex: 1; min-width: 0; }
.side-navigation { width: 300px; flex-shrink: 0; }

.audio-block {
  background: linear-gradient(135deg, #1e1e2e, #2d2d44);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s;
}
.audio-block:hover { transform: translateY(-2px); border-color: #6366f1; }

.playback-visualizer { display: flex; align-items: flex-end; gap: 3px; height: 32px; width: 40px; }
.playback-visualizer .bar { width: 4px; background: #6366f1; border-radius: 2px; height: 10%; transition: height 0.3s; }
.playback-visualizer.isPlaying .bar { animation: wave 1s infinite ease-in-out; }
@keyframes wave { 0%, 100% { height: 10% } 50% { height: 100% } }
.playback-visualizer .bar:nth-child(2n) { animation-delay: 0.2s; }
.playback-visualizer .bar:nth-child(3n) { animation-delay: 0.4s; }

.audio-info h4 { margin: 0; color: #fff; }
.audio-info p { margin: 4px 0 0; font-size: 0.8rem; color: #a1a1aa; }

.question-card { background: rgba(30,30,35,0.6); border-radius: 20px; }
.q-num { color: #6366f1; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
.question-header h3 { font-size: 1.5rem; margin-top: 8px; line-height: 1.4; }

.options-grid { display: grid; gap: 12px; margin: 32px 0; }
.option-item {
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.option-item:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(99, 102, 241, 0.5); }
.option-item.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.1); }
.option-idx { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 50%; font-weight: 700; color: #a1a1aa; }
.option-item.selected .option-idx { background: #6366f1; color: #fff; }

.nav-group { margin-bottom: 20px; }
.group-title { font-size: 0.75rem; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 12px; }
.num-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.num-box { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
.num-box.active { border-color: #6366f1; color: #6366f1; font-weight: 700; background: rgba(99, 102, 241, 0.1); }
.num-box.answered { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3); }

/* Result */
.score-circle { width: 120px; height: 120px; border: 8px solid #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 0 30px rgba(99, 102, 241, 0.3); }
.score-circle .val { font-size: 3rem; font-weight: 900; color: #fff; }

/* 修复 background-clip 兼容性 */
.hero-section h1 {
  -webkit-background-clip: text;
  background-clip: text;
}

/* ListeningView 专门的移动端优化 */
@media (max-width: 768px) {
  /* 页面容器 */
  .listening-view {
    padding: 12px !important;
  }
  
  /* 标题 */
  .hero-section h1 {
    font-size: 2rem !important;
  }
  
  /* 测试布局改为垂直 */
  .test-layout {
    flex-direction: column !important;
  }
  
  /* 侧边导航全宽显示并移到顶部 */
  .side-navigation {
    width: 100% !important;
    order: -1; /* 移到顶部 */
    margin-bottom: 20px;
  }
  
  /* 主内容区域 */
  .main-content {
    width: 100% !important;
  }
  
  /* 测试头部 */
  .test-header {
    padding: 12px 16px !important;
    flex-wrap: wrap;
  }
  
  .passage-title h2 {
    font-size: 1.1rem !important;
  }
  
  /* 音频块 */
  .audio-block {
    padding: 16px !important;
  }
  
  .play-btn {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .audio-info h4 {
    font-size: 1rem !important;
  }
  
  /* 问题卡片 */
  .question-header h3 {
    font-size: 1.2rem !important;
  }
  
  /* 选项 */
  .option-item {
    padding: 12px 16px !important;
  }
  
  .option-text {
    font-size: 0.95rem !important;
  }
  
  /* 题目网格调整为5列 */
  .num-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
  
  /* 配置网格 */
  .type-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 480px) {
  .hero-section h1 {
    font-size: 1.75rem !important;
  }
  
  .passage-title h2 {
    font-size: 1rem !important;
  }
  
  .question-header h3 {
    font-size: 1.1rem !important;
  }
  
  /* 题目网格改为4列 */
  .num-grid {
    grid-template-columns: repeat(4, 1fr) !important;
  }
  
  /* 音频块进一步简化 */
  .play-btn n-icon {
    font-size: 40px !important;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
