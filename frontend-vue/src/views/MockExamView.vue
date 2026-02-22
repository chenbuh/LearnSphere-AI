<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, defineAsyncComponent } from 'vue'
import { 
  NCard, NButton, NTag, NGrid, NGridItem, NRadioGroup, NRadio,
  NSpace, NProgress, NSpin, NResult, NSelect, useMessage, NDivider, NAvatar,
  NList, NListItem, NThing, NIcon, NInput, NPagination
} from 'naive-ui'
import { 
  Timer, FileCheck, Users, Play, Trophy, Clock, ChevronLeft, ChevronRight,
  Rocket, GraduationCap, Brain, History, Target, Zap, BookOpen, PenTool,
  Sparkles, Layers, ShieldCheck, Volume2, StopCircle, Share2, ArrowLeft
} from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import request from '@/utils/request'
import { useMockExamStore } from '@/stores/mockExam'
import { MessageCircle } from 'lucide-vue-next'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const mockExamStore = useMockExamStore()
const speaking = ref(false)
const currentAudioScript = ref(null)

const playAudio = (text) => {
    if (!text) return
    if (speaking.value) {
        window.speechSynthesis.cancel()
        speaking.value = false
        currentAudioScript.value = null
        return
    }
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.onend = () => {
        speaking.value = false
        currentAudioScript.value = null
    }
    
    speaking.value = true
    currentAudioScript.value = text
    window.speechSynthesis.speak(utterance)
}

const stopAudio = () => {
    if (speaking.value) {
        window.speechSynthesis.cancel()
        speaking.value = false
        currentAudioScript.value = null
    }
}

// --- State ---
const step = ref('setup') // 'setup' | 'testing' | 'result' | 'review'
const loading = ref(false)
const generating = ref(false)
const exams = ref([])
const activeExam = ref(null)
const examQuestions = ref([])
const currentQuestionIndex = ref(0)
const userAnswers = ref([])
const examStartTime = ref(null)
const examResult = ref(null)

// AI Tutor state
const showTutor = ref(false)
const selectedQuestionForTutor = ref(null)

const tutorContext = computed(() => {
  // 识别当前题目：优先使用回顾模式点击的题目，否则使用测试模式目前的题目
  const source = selectedQuestionForTutor.value || 
                 (step.value === 'testing' && currentQuestion.value ? { question: currentQuestion.value, index: currentQuestionIndex.value } : null)

  if (!source || !source.question) return null
  
  const { question, index } = source
  const isReview = step.value === 'review'
  
  return {
    type: isReview ? 'mock_exam_review' : 'mock_exam_practice',
    examType: settings.value.examType,
    question: question.text,
    options: question.options,
    userAnswer: userAnswers.value[index] !== null ? ['A', 'B', 'C', 'D'][userAnswers.value[index]] : '未作答',
    // 即使在考试中也提供正确答案和解析给 AI，以便 AI 能准确回答关于题目的技术问题
    correctAnswer: ['A', 'B', 'C', 'D'][question.correct],
    explanation: question.explanation,
    topic: '全真模拟考',
    module: question.type || 'exam'
  }
})

const openAITutor = (question, index) => {
    selectedQuestionForTutor.value = { question, index }
    showTutor.value = true
}

// Pagination for exam history
const currentPage = ref(1)
const pageSize = ref(6)

// --- Settings State ---
const settings = ref({
  examType: 'cet4',
  difficulty: 'medium',
  duration: 120
})

// 分享功能
const showShare = ref(false)
const shareContent = computed(() => {
  if (!examResult.value) return {}
  const examTypeName = settings.value.examType?.toUpperCase() || '模拟考试'
  return {
    title: `我在 LearnSphere AI 完成了${examTypeName}模拟考试！`,
    description: `刚刚完成了${examTypeName}模拟考试，答对 ${examResult.value.correctCount}/${examResult.value.totalCount} 道题，得分 ${examResult.value.score} 分！快来一起学习吧！`,
    url: window.location.href
  }
})

// --- Options Constants ---
const examTypes = [
  { label: '大学英语四级', value: 'cet4', icon: '4', desc: 'College English Test Band 4', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  { label: '大学英语六级', value: 'cet6', icon: '6', desc: 'College English Test Band 6', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  { label: '雅思学术类', value: 'ielts', icon: 'I', desc: 'International English Language Testing System', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  { label: '托福考试', value: 'toefl', icon: 'T', desc: 'Test of English as a Foreign Language', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  { label: 'GRE 考试', value: 'gre', icon: 'G', desc: 'Graduate Record Examination', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
]

const difficulties = [
  { label: '初级', value: 'easy', icon: '🌱' },
  { label: '中级', value: 'medium', icon: '🔥' },
  { label: '高级', value: 'hard', icon: '💀' }
]

// --- Computed ---
const currentQuestion = computed(() => examQuestions.value[currentQuestionIndex.value])

// 处理阅读文章显示（兼容多种格式）
const displayPassage = computed(() => {
  const q = currentQuestion.value
  if (!q || q.type !== 'reading') return null
  
  // 优先使用 passage 字段
  if (q.passage) return q.passage
  
  // 兜底：尝试从 text 中提取（假设格式为：文章\n\n问题）
  if (q.text && q.text.includes('\n\n')) {
    const parts = q.text.split('\n\n')
    if (parts.length >= 2) return parts.slice(0, -1).join('\n\n')
  }
  
  return null
})

// 处理问题文本显示
const displayQuestion = computed(() => {
  const q = currentQuestion.value
  if (!q) return ''
  
  // 阅读题：如果 text 包含文章+问题，提取问题部分
  if (q.type === 'reading' && q.text && q.text.includes('\n\n') && !q.passage) {
    const parts = q.text.split('\n\n')
    return parts[parts.length - 1]
  }
  
  return q.text
})

// Paginated exams for history
const paginatedExams = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return exams.value.slice(start, end)
})

// 获取当前听力材料的 Passage 编号
const listeningPassageNumber = computed(() => {
  const q = currentQuestion.value
  if (!q || q.type !== 'listening' || !q.audioScript) return null
  
  // 查找所有听力题，按 audioScript 分组
  const listeningQuestions = examQuestions.value.filter(item => item.type === 'listening')
  const uniqueScripts = []
  const scriptMap = new Map()
  
  listeningQuestions.forEach(item => {
    if (!scriptMap.has(item.audioScript)) {
      scriptMap.set(item.audioScript, uniqueScripts.length + 1)
      uniqueScripts.push(item.audioScript)
    }
  })
  
  return scriptMap.get(q.audioScript) || 1
})

const progress = computed(() => {
  if (examQuestions.value.length === 0) return 0
  return Math.round((currentQuestionIndex.value + 1) / examQuestions.value.length * 100)
})
const answeredCount = computed(() => userAnswers.value.filter(a => a !== null).length)

// 离开提醒
const isExamInProgress = computed(() => step.value === 'testing' && activeExam.value !== null)

const handleBeforeUnload = (e) => {
  if (isExamInProgress.value) {
    e.preventDefault()
    e.returnValue = '考试正在进行中，确定要离开吗？你的答题进度将会丢失。'
    return e.returnValue
  }
}

// --- Logic ---

const updateSetting = (key, value) => {
  settings.value[key] = value
}

const loadExams = async () => {
  loading.value = true
  try {
    const res = await request.get('/exam/list', { params: { examType: '' } })
    if (res.code === 200) {
      exams.value = res.data || []
    }
  } catch (e) {
    console.error('加载考试列表失败', e)
  } finally {
    loading.value = false
  }
}

const generateNewExam = async () => {
  generating.value = true
  try {
    const res = await request.post('/exam/generate', {
      examType: settings.value.examType,
      difficulty: settings.value.difficulty
    })
    if (res.code === 200) {
      message.success('新考卷已生成')
      await loadExams()
      // 自动开始新生成的考试
      if (res.data && res.data.id) {
          startExam(res.data)
      }
    }
  } catch (e) {
    console.error('生成考卷失败', e)
  } finally {
    generating.value = false
  }
}

const startExam = async (exam) => {
  loading.value = true
  try {
    const res = await request.get(`/exam/detail/${exam.id}`)
    if (res.code === 200 && res.data) {
      activeExam.value = res.data
      examQuestions.value = res.data.questions || []
      userAnswers.value = new Array(examQuestions.value.length).fill(null)
      currentQuestionIndex.value = 0
      examStartTime.value = Date.now()
      examResult.value = null
      step.value = 'testing'
      
      mockExamStore.startExam(activeExam.value, examQuestions.value)
    }
  } catch (e) {
    console.error('加载考试详情失败', e)
  } finally {
    loading.value = false
  }
}

const selectAnswer = (index) => {
  if (step.value !== 'testing') return
  userAnswers.value[currentQuestionIndex.value] = index
  mockExamStore.updateProgress(currentQuestionIndex.value, index, currentQuestionIndex.value)
}

const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
        mockExamStore.currentQuestionIndex = currentQuestionIndex.value
        // 自动重置选择，使其跟踪当前题目
        selectedQuestionForTutor.value = null
    }
}
const nextQuestion = () => {
    if (currentQuestionIndex.value < examQuestions.value.length - 1) {
        currentQuestionIndex.value++
        mockExamStore.currentQuestionIndex = currentQuestionIndex.value
        // 自动重置选择，使其跟踪当前题目
        selectedQuestionForTutor.value = null
    }
}

// 监听题目切换
watch(currentQuestionIndex, (newIdx, oldIdx) => {
  // 切换题目时，重置 AI 助教的选择，使其默认跟踪当前呈现的题目
  if (step.value === 'testing') {
    selectedQuestionForTutor.value = null
  }
  
  const newQ = examQuestions.value[newIdx]
  const oldQ = examQuestions.value[oldIdx]
  
  // 如果切换到非听力题，停止播放
  if (newQ?.type !== 'listening') {
    stopAudio()
    return
  }
  
  // 如果切换到不同的听力材料，停止播放
  if (oldQ?.type === 'listening' && newQ?.type === 'listening') {
    if (oldQ.audioScript !== newQ.audioScript) {
      stopAudio()
    }
  }
})

const submitExam = async () => {
  const timeSpent = Math.round((Date.now() - examStartTime.value) / 1000)
  loading.value = true
  try {
    const res = await request.post('/exam/submit', {
      examId: activeExam.value.id,
      answers: userAnswers.value.map(a => (a === null || a === undefined) ? -1 : a),
      timeSpent
    })
    if (res.code === 200) {
      examResult.value = res.data
      step.value = 'result'
      message.success('提交成功！成绩已存入档案')
      mockExamStore.clearPersistedState()
    }
  } catch (e) {
    console.error('提交考试失败', e)
  } finally {
    loading.value = false
  }
}

const exitExam = () => {
  step.value = 'setup'
  activeExam.value = null
  examQuestions.value = []
  examResult.value = null
  mockExamStore.clearPersistedState()
  loadExams()
}

onMounted(() => {
  loadExams()
  window.addEventListener('beforeunload', handleBeforeUnload)

  // 恢复进度逻辑
  if (mockExamStore.activeExam && mockExamStore.step === 'testing') {
     if (mockExamStore.isExpired()) {
        message.warning('检测到练习数据已过期，已为您清除')
        mockExamStore.clearPersistedState()
     } else {
        activeExam.value = mockExamStore.activeExam
        examQuestions.value = mockExamStore.examQuestions
        userAnswers.value = mockExamStore.userAnswers
        currentQuestionIndex.value = mockExamStore.currentQuestionIndex
        examStartTime.value = mockExamStore.examStartTime
        step.value = 'testing'
        message.info('检测到未完成的考试，已为您恢复进度')
     }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="page-container">
    
    <!-- Phase 1: Setup -->
    <div v-if="step === 'setup'" class="setup-view">
        <div class="page-header">
            <h1>全真模拟考试</h1>
            <p>由 AI 驱动的高保真考场模拟，全方位检测学习成效</p>
        </div>

        <n-card class="setup-card" :bordered="false">
            <n-grid x-gap="40" y-gap="40" cols="1 900:3" responsive="screen">
                <!-- Left: Exam Selection -->
                <n-grid-item span="2">
                    <div class="setting-section">
                        <h3><n-icon :component="GraduationCap" color="#6366f1" /> 选择考试项目</h3>
                        <div class="pill-options">
                            <div 
                                v-for="type in examTypes" 
                                :key="type.value"
                                class="pill-option"
                                :class="{ active: settings.examType === type.value }"
                                @click="updateSetting('examType', type.value)"
                            >
                                <span class="pill-icon-tag" :style="{ color: type.color }">{{ type.icon }}</span>
                                {{ type.label }}
                            </div>
                        </div>
                    </div>

                    <div class="setting-section mt-8">
                        <h3><n-icon :component="ShieldCheck" color="#10b981" /> 考场纪律说明</h3>
                        <div class="rules-box">
                            <div class="rule-item">模拟考试开启后将进入全屏/沉浸模式。</div>
                            <div class="rule-item">中途离开页面或刷新将导致考试强制结束并不计分。</div>
                            <div class="rule-item">AI 根据您的水平动态出题（含短篇阅读）。</div>
                            <div class="rule-item" style="color: #fbbf24;">注：听力与口语考试请前往对应的专项训练模块。</div>
                        </div>
                    </div>
                </n-grid-item>

                <!-- Right: Side Config -->
                <n-grid-item>
                    <div class="side-panel">
                        <div class="setting-section">
                            <h3><n-icon :component="Brain" color="#f59e0b" /> 难度选择</h3>
                            <div class="pill-options">
                                <div 
                                    v-for="d in difficulties" 
                                    :key="d.value"
                                    class="pill-option"
                                    :class="{ active: settings.difficulty === d.value }"
                                    @click="updateSetting('difficulty', d.value)"
                                >
                                    {{ d.icon }} {{ d.label }}
                                </div>
                            </div>
                        </div>

                        <div class="setting-section mt-8">
                            <h3><n-icon :component="Clock" color="#ef4444" /> 时间设定</h3>
                            <div class="duration-selector">
                                <div class="val">120 分钟</div>
                                <p class="desc">标准考试时长，请确保有充足时间。</p>
                            </div>
                        </div>

                        <n-divider />

                        <n-button 
                            type="primary" 
                            size="large" 
                            block 
                            round
                            class="start-btn"
                            :loading="generating"
                            @click="generateNewExam"
                        >
                            <template #icon><Rocket :size="20" /></template>
                            进入模拟考场
                        </n-button>
                    </div>
                </n-grid-item>
            </n-grid>
        </n-card>

        <!-- History / Recent Section -->
        <div v-if="exams.length > 0" class="history-section mt-12">
            <div class="section-title">
                <n-icon :component="History" /> 最近生成考卷
            </div>
            <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
                <n-grid-item v-for="exam in paginatedExams" :key="exam.id">
                    <n-card class="history-card" hoverable @click="startExam(exam)">
                        <div class="h-card-header">
                            <n-tag size="small" :bordered="false" round :color="{ color: '#6366f1', textColor: '#fff' }">
                                {{ exam.examType?.toUpperCase() }}
                            </n-tag>
                            <span class="exam-date">{{ new Date().toLocaleDateString() }}</span>
                        </div>
                        <h4 class="exam-title">{{ exam.title }}</h4>
                        <div class="h-card-footer">
                            <span><Timer :size="14" /> {{ exam.duration }}m</span>
                            <span><Target :size="14" /> {{ exam.totalQuestions }} 题</span>
                        </div>
                    </n-card>
                </n-grid-item>
            </n-grid>
            <div class="pagination-wrapper mt-6" v-if="exams.length > pageSize">
                <n-pagination 
                    v-model:page="currentPage" 
                    :page-count="Math.ceil(exams.length / pageSize)" 
                    :page-size="pageSize"
                    show-size-picker
                    :page-sizes="[6, 12, 18, 24]"
                    @update:page-size="pageSize = $event"
                />
            </div>
        </div>
    </div>

    <!-- Phase 2: Testing -->
    <div v-else-if="step === 'testing'" class="testing-view">
        <div class="testing-header mb-4 flex items-center gap-2">
            <n-button quaternary circle @click="exitExam">
                <template #icon><n-icon :component="ArrowLeft" /></template>
            </n-button>
            <span class="text-lg font-bold text-gray-200 cursor-pointer" @click="exitExam">返回考试大厅</span>
        </div>
        
        <div class="testing-layout">
            <!-- Left: Sidebar Info -->
            <div class="test-sidebar">
                <n-card class="info-widget" :bordered="false">
                    <div class="active-exam-info">
                        <div class="exam-name">{{ activeExam.title }}</div>
                        <n-tag type="info" size="small">{{ activeExam.examType?.toUpperCase() }} PRO</n-tag>
                    </div>
                    <n-divider />
                    <div class="progress-container">
                        <div class="prog-labels">
                            <span>考试进度</span>
                            <span>{{ currentQuestionIndex + 1 }} / {{ examQuestions.length }}</span>
                        </div>
                        <n-progress type="line" :percentage="progress" color="#6366f1" :show-indicator="false" circle />
                    </div>
                    <div class="question-map">
                        <div class="map-label">答题卡</div>
                        <div class="map-grid">
                            <div 
                                v-for="i in examQuestions.length" 
                                :key="i"
                                class="map-item"
                                :class="{ 
                                    'active': i-1 === currentQuestionIndex,
                                    'filled': userAnswers[i-1] !== null 
                                }"
                                @click="currentQuestionIndex = i-1"
                            >
                                {{ i }}
                            </div>
                        </div>
                    </div>
                    <n-button block secondary class="mt-8" @click="exitExam">放弃此次考试</n-button>
                </n-card>
            </div>

            <!-- Main: Question Area -->
            <div class="main-question-panel">
                <n-card class="question-card" :bordered="false">
                    <div class="question-header">
                        <div class="flex justify-between items-start mb-4">
                            <n-tag type="primary" size="small">{{ currentQuestion?.section || 'Section' }}</n-tag>
                            <n-button 
                                size="tiny" 
                                secondary 
                                type="primary" 
                                @click="showTutor = true"
                            >
                                <template #icon><n-icon :component="MessageCircle" /></template>
                                问问 AI
                            </n-button>
                        </div>
                        
                        <!-- Listening Audio -->
                        <div v-if="currentQuestion?.type === 'listening'" class="listening-section mb-4">
                            <div class="passage-label">📻 Listening Passage {{ listeningPassageNumber }}</div>
                            <div class="audio-player">
                                <n-button secondary circle type="primary" size="large" @click="playAudio(currentQuestion.audioScript)">
                                    <template #icon><Volume2 v-if="!speaking" /><StopCircle v-else /></template>
                                </n-button>
                                <span class="ml-4 text-gray-400">点击播放听力材料 (TTS)</span>
                            </div>
                        </div>

                        <!-- Reading Passage -->
                        <div v-if="displayPassage" class="reading-passage mb-4">
                            <n-card embedded :bordered="false" class="passage-card">
                                {{ displayPassage }}
                            </n-card>
                        </div>

                        <h3 class="question-text">{{ displayQuestion }}</h3>
                    </div>

                    <!-- Options for Choice Questions -->
                    <div v-if="['vocabulary', 'grammar', 'reading', 'listening'].includes(currentQuestion?.type || 'vocabulary')" class="options-container">
                        <div 
                            v-for="(option, idx) in currentQuestion?.options" 
                            :key="idx"
                            class="option-item"
                            :class="{ selected: userAnswers[currentQuestionIndex] === idx }"
                            @click="selectAnswer(idx)"
                        >
                            <div class="letter">{{ ['A', 'B', 'C', 'D'][idx] }}</div>
                            <div class="text">{{ option }}</div>
                        </div>
                    </div>

                    <!-- Input for Writing/Translation -->
                    <div v-else class="text-input-container">
                        <n-input
                            v-model:value="userAnswers[currentQuestionIndex]"
                            type="textarea"
                            placeholder="请输入您的答案..."
                            :autosize="{ minRows: 8, maxRows: 25 }"
                            class="essay-editor-wrapper"
                        />
                    </div>

                    <div class="action-footer">
                        <n-button :disabled="currentQuestionIndex === 0" quaternary @click="prevQuestion">
                             <template #icon><ChevronLeft /></template>
                             PREV
                        </n-button>
                        <n-space>
                            <span class="status-msg">已答 {{ answeredCount }} / {{ examQuestions.length }}</span>
                            <n-button 
                                v-if="currentQuestionIndex < examQuestions.length - 1" 
                                type="primary"
                                color="#6366f1"
                                size="large"
                                @click="nextQuestion"
                            >
                                NEXT QUESTION
                            </n-button>
                            <n-button v-else type="error" size="large" :loading="loading" @click="submitExam">
                                提交试卷
                            </n-button>
                        </n-space>
                    </div>
                </n-card>
            </div>
        </div>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-view">
        <n-card class="result-card" :bordered="false">
            <template #header>
                <div class="score-header">
                    <Trophy :size="80" color="#f59e0b" />
                    <h2>考试成绩报告</h2>
                </div>
            </template>
            
            <div class="score-circle-container">
                <div class="score-circle">
                    <div class="score-val">{{ examResult.score }}</div>
                    <div class="score-unit">TOTAL SCORE</div>
                </div>
            </div>

            <n-grid cols="3" x-gap="20" class="stat-summary">
                <n-grid-item>
                    <div class="stat-box">
                        <div class="v success">{{ examResult.correctCount }}</div>
                        <div class="l">正确题目</div>
                    </div>
                </n-grid-item>
                <n-grid-item>
                    <div class="stat-box">
                        <div class="v error">{{ examResult.totalCount - examResult.correctCount }}</div>
                        <div class="l">错误题目</div>
                    </div>
                </n-grid-item>
                <n-grid-item>
                    <div class="stat-box">
                        <div class="v">{{ Math.floor(examResult.timeSpent / 60) }}m</div>
                        <div class="l">所用时间</div>
                    </div>
                </n-grid-item>
            </n-grid>

            <n-divider />
            
            <div class="result-actions">
                 <n-space justify="center" vertical :size="12">
                   <n-space justify="center">
                     <n-button type="primary" color="#6366f1" size="large" round @click="exitExam">
                        返回列表
                     </n-button>
                     <n-button secondary size="large" round @click="step = 'review'">
                        详细解析
                     </n-button>
                   </n-space>
                   <n-button secondary size="large" round @click="showShare = true" class="share-btn">
                     <template #icon>
                       <n-icon :component="Share2" />
                     </template>
                     分享考试成绩
                   </n-button>
                 </n-space>
            </div>
        </n-card>

        <!-- 分享弹窗 -->
        <ShareModal
          v-model:show="showShare"
          :title="shareContent.title"
          :description="shareContent.description"
          :url="shareContent.url"
        />
    </div>

    <!-- Phase 4: Review -->
    <div v-else-if="step === 'review'" class="review-view">
        <div class="back-bar mb-6">
            <n-button secondary round @click="step = 'result'">
                <template #icon><ChevronLeft /></template>
                返回报告
            </n-button>
        </div>

        <n-card class="review-card" title="考试题目回顾" :bordered="false">
            <n-list>
                <n-list-item v-for="(q, idx) in examQuestions" :key="idx">
                    <n-thing :title="'第 ' + (idx + 1) + ' 题'">
                        <template #description>
                            <p class="question-text-review">{{ q.text }}</p>
                        </template>
                            <div class="review-body">
                                <div class="review-header-row flex justify-between items-center mb-2">
                                    <div class="ans-grid flex-1">
                                        <div class="ans-item inline-block mr-6">
                                            <span class="lbl font-bold">你的答案：</span>
                                            <span :class="userAnswers[idx] === q.correct ? 'success' : 'error'">
                                                {{ userAnswers[idx] !== null ? ['A', 'B', 'C', 'D'][userAnswers[idx]] : '未作答' }}
                                            </span>
                                        </div>
                                        <div class="ans-item inline-block">
                                            <span class="lbl font-bold">正确答案：</span>
                                            <span class="success">{{ ['A', 'B', 'C', 'D'][q.correct] }}</span>
                                        </div>
                                    </div>
                                    <n-button size="tiny" secondary type="primary" @click="openAITutor(q, idx)">
                                        <template #icon><n-icon :component="MessageCircle" /></template>
                                        问问 AI 导师
                                    </n-button>
                                </div>
                                <div class="explanation-box" v-if="q.explanation">
                                <strong>解析：</strong> {{ q.explanation }}
                            </div>
                        </div>
                    </n-thing>
                </n-list-item>
            </n-list>
        </n-card>
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
.page-container {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
}

/* Page Header */
.page-header {
    text-align: center;
    margin-bottom: 48px;
}
.page-header h1 {
    font-size: 2.8rem;
    font-weight: 800;
    background: linear-gradient(120deg, #6366f1, #d946ef);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
}
.page-header p {
    color: #a1a1aa;
    font-size: 1.1rem;
}

/* Setup Card */
.setup-card {
    background: rgba(30, 30, 35, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 12px;
}

.setting-section h3 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.15rem;
    color: #e4e4e7;
    margin-bottom: 20px;
}

/* Exam Options Grid */
.grid-options.exam-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
}

.option-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s;
}
.option-card:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
}
.option-card.active {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
}

.card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 800;
}
.card-info .label { font-weight: 700; color: #fff; font-size: 1rem; }
.card-info .desc { font-size: 0.75rem; color: #71717a; margin-top: 2px; line-height: 1.2; }

/* Rules Box */
.rules-box {
    background: rgba(0, 0, 0, 0.2);
    padding: 20px;
    border-radius: 16px;
}
.rule-item {
    color: #a1a1aa;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.rule-item::before {
    content: "•";
    color: #10b981;
    font-size: 1.5rem;
}

/* Side Panel */
.side-panel {
    background: rgba(255, 255, 255, 0.02);
    padding: 24px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.03);
}

.pill-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}
.pill-option {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    color: #a1a1aa;
    font-size: 0.9rem;
    transition: all 0.2s;
    gap: 8px;
}
.pill-option.active {
    background: #6366f1;
    color: #fff;
    border-color: #6366f1;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.pill-icon-tag {
    font-weight: 900;
    font-size: 1.1rem;
    opacity: 0.8;
    background: rgba(0,0,0,0.2);
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.pill-option.active .pill-icon-tag {
    background: rgba(255,255,255,0.2);
    color: #fff !important;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 24px;
}

.duration-selector {
    background: rgba(255,255,255,0.03);
    padding: 16px;
    border-radius: 12px;
}
.duration-selector .val { font-size: 1.5rem; font-weight: 800; color: #fff; }
.duration-selector .desc { font-size: 0.8rem; color: #71717a; margin-top: 4px; }

.start-btn { height: 60px; font-weight: 800; font-size: 1.1rem; }

/* History Section */
.section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; color: #fff; }
.history-card { background: rgba(30, 30, 35, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; transition: all 0.2s; cursor: pointer; }
.history-card:hover { border-color: #6366f1; background: rgba(50, 50, 55, 0.8); }
.h-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.exam-date { font-size: 0.75rem; color: #71717a; }
.exam-title { font-size: 1.1rem; color: #fff; margin-bottom: 16px; }
.h-card-footer { display: flex; gap: 16px; color: #a1a1aa; font-size: 0.85rem; }

/* Testing View Layout */
.testing-view {
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}
.testing-header {
    flex-shrink: 0;
}
.testing-layout {
    display: flex;
    gap: 24px;
    height: 100%;
    overflow: hidden;
}

.test-sidebar { width: 300px; flex-shrink: 0; }
.info-widget { background: rgba(30, 30, 35, 0.6); border-radius: 20px; height: 100%; overflow-y: auto; }
.active-exam-info .exam-name { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 8px; }

.prog-labels { display: flex; justify-content: space-between; font-size: 0.85rem; color: #a1a1aa; margin-bottom: 8px; }
.question-map { margin-top: 32px; }
.reading-passage { font-size: 1rem; line-height: 1.6; color: #d4d4d8; max-height: 300px; overflow-y: auto; margin-bottom: 20px; }
.passage-card { background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px; border-left: 4px solid #6366f1; }
.essay-input { font-size: 1.1rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); }
.listening-section { }
.passage-label { font-size: 0.9rem; color: #a78bfa; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; }
.audio-player { display: flex; align-items: center; background: rgba(99, 102, 241, 0.1); padding: 12px 20px; border-radius: 12px; width: fit-content; }
.map-label { font-size: 0.8rem; color: #71717a; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; }
.map-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.map-item { 
    aspect-ratio: 1; border-radius: 6px; background: rgba(255,255,255,0.05); 
    display: flex; align-items: center; justify-content: center; 
    font-size: 0.85rem; color: #71717a; cursor: pointer; transition: all 0.2s;
}
.map-item.filled { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
.map-item.active { border: 2px solid #6366f1; color: #fff; }

.main-question-panel { flex: 1; display: flex; flex-direction: column; }
.question-card { background: #18181b; border-radius: 24px; padding: 24px; height: 100%; display: flex; flex-direction: column; overflow-y: auto; }

.question-header { margin-bottom: 32px; }
.question-text { font-size: 1.35rem; color: #fff; line-height: 1.6; font-family: 'Times New Roman', serif; margin-top: 12px; white-space: pre-wrap; }

.text-input-container { flex: 1; display: flex; flex-direction: column; min-height: 300px; margin-bottom: 20px; }
.essay-editor-wrapper { flex: 1; display: flex; flex-direction: column; }
:deep(.w-e-text-container) {
    font-family: 'Times New Roman', serif;
    font-size: 1.2rem;
    line-height: 1.8;
}
.options-container { display: flex; flex-direction: column; gap: 16px; flex: 1; }
.option-item {
    display: flex; align-items: center; gap: 20px; padding: 20px 24px; background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; cursor: pointer; transition: all 0.2s;
}
.option-item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
.option-item.selected { background: rgba(99, 102, 241, 0.1); border-color: #6366f1; box-shadow: 0 0 15px rgba(99, 102, 241, 0.1); }
.option-item .letter { 
    width: 36px; height: 36px; border-radius: 8px; background: rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center; font-weight: 700; color: #a1a1aa;
}
.option-item.selected .letter { background: #6366f1; color: #fff; }
.option-item .text { color: #e4e4e7; font-size: 1.1rem; }

.action-footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
.status-msg { font-size: 0.9rem; color: #71717a; }

/* Result View */
.result-view { max-width: 600px; margin: 0 auto; }
.result-card { background: #18181b; border-radius: 32px; padding: 40px; text-align: center; }
.score-header { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 24px; }
.score-header h2 { font-size: 2rem; color: #fff; }

.score-circle-container { margin: 40px 0; display: flex; justify-content: center; }
.score-circle { 
    width: 200px; height: 200px; border-radius: 50%; border: 8px solid #6366f1; 
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.2);
}
.score-val { font-size: 5rem; font-weight: 800; color: #fff; line-height: 1; }
.score-unit { color: #71717a; font-size: 0.8rem; letter-spacing: 2px; }

.stat-summary { margin-bottom: 40px; }
.stat-box { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; }
.stat-box .v { font-size: 1.5rem; font-weight: 700; color: #fff; }
.stat-box .v.success { color: #10b981; }
.stat-box .v.error { color: #ef4444; }
.stat-box .l { font-size: 0.8rem; color: #71717a; }

/* Review Styles */
.review-view { max-width: 900px; margin: 0 auto; }
.question-text-review { font-size: 1.1rem; color: #fff; margin: 8px 0; }
.ans-grid { display: flex; gap: 24px; margin: 12px 0; }
.ans-item { font-size: 0.95rem; }
.ans-item .lbl { color: #71717a; }
.ans-item .success { color: #10b981; font-weight: 700; }
.ans-item .error { color: #ef4444; font-weight: 700; }
.explanation-box { background: rgba(255,255,255,0.03); padding: 16px; border-radius: 12px; color: #a1a1aa; line-height: 1.6; }
.mb-6 { margin-bottom: 24px; }

@media (max-width: 768px) {
    .page-container {
        padding: 0 16px;
        margin: 24px auto;
    }
    .page-header h1 {
        font-size: 2rem;
    }
    
    /* Setup View */
    .pill-options {
        grid-template-columns: repeat(2, 1fr) !important;
    }
    .start-btn {
        height: 50px;
        font-size: 1rem;
    }
    
    /* Testing View */
    .testing-view {
        height: auto;
        min-height: calc(100vh - 80px);
    }
    .testing-layout {
        flex-direction: column-reverse; /* Sidebar at bottom for navigation */
        gap: 20px;
        height: auto;
        overflow: visible;
    }
    .test-sidebar {
        width: 100%;
        height: auto;
    }
    .info-widget {
        max-height: 300px; /* Limit height of nav on mobile */
    }
    .map-grid {
        grid-template-columns: repeat(8, 1fr); /* More condensed */
    }
    
    .question-text {
        font-size: 1.15rem;
    }
    .option-item {
        padding: 16px;
        gap: 12px;
    }
    .option-item .text {
        font-size: 1rem;
    }
    .action-footer {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    .status-msg {
        text-align: center;
        margin-bottom: 8px;
    }
    .action-footer .n-space {
        justify-content: space-between;
        width: 100%;
    }
    
    /* Result View */
    .score-circle {
        width: 160px;
        height: 160px;
    }
    .score-val {
        font-size: 3.5rem;
    }
    .result-card {
        padding: 24px 16px;
    }
    
    /* Stat Summary - Force stack or 2 cols */
    .stat-summary {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
    }
    
    /* Review View */
    .ans-grid {
        flex-direction: column;
        gap: 8px;
    }
}</style>