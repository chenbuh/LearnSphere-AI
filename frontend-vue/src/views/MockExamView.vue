<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, defineAsyncComponent } from 'vue'
import { 
  NCard, NButton, NTag,
  NSpace, NProgress, useMessage, NDivider,
  NList, NListItem, NThing, NIcon, NInput
} from 'naive-ui'
import { ChevronLeft, Volume2, StopCircle, ArrowLeft } from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import MockExamSetupPanel from '@/components/mockexam/MockExamSetupPanel.vue'
import MockExamResultPanel from '@/components/mockexam/MockExamResultPanel.vue'
import request from '@/utils/request'
import { useMockExamStore } from '@/stores/mockExam'
import { useTextAudio } from '@/composables/useTextAudio'
import { MessageCircle } from 'lucide-vue-next'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const mockExamStore = useMockExamStore()
const { playAudio: playTextAudio, stopAudio: stopTextAudio } = useTextAudio({
  notifyWarning: (text) => message.warning(text)
})
const speaking = ref(false)
const currentAudioScript = ref(null)

const resetAudioState = () => {
    speaking.value = false
    currentAudioScript.value = null
}

const playAudio = (text) => {
    if (!text) return
    if (speaking.value) {
        stopAudio()
        return
    }

    speaking.value = true
    currentAudioScript.value = text

    playTextAudio(text, {
        mode: 'native',
        nativeOptions: {
            lang: 'en-US',
            rate: 0.9
        },
        onStart: () => {
            speaking.value = true
            currentAudioScript.value = text
        },
        onEnd: resetAudioState,
        onError: resetAudioState
    })
}

const stopAudio = () => {
    stopTextAudio()
    resetAudioState()
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
  stopAudio()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="page-container">
    
    <MockExamSetupPanel
      v-if="step === 'setup'"
      :settings="settings"
      :exam-types="examTypes"
      :difficulties="difficulties"
      :generating="generating"
      :exams="exams"
      :paginated-exams="paginatedExams"
      :current-page="currentPage"
      :page-size="pageSize"
      @update-setting="updateSetting"
      @generate="generateNewExam"
      @start-exam="startExam"
      @update:page="currentPage = $event"
      @update:page-size="pageSize = $event"
    />

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

    <div v-else-if="step === 'result'">
      <MockExamResultPanel
        :exam-result="examResult"
        @back-list="exitExam"
        @review="step = 'review'"
        @share="showShare = true"
      />

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

    .question-card {
        padding: 18px;
        border-radius: 18px;
    }

    .reading-passage {
        max-height: none;
    }

    .audio-player {
        width: 100%;
        justify-content: center;
        padding: 12px 14px;
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
}

@media (max-width: 480px) {
    .page-container {
        padding: 0 8px;
        margin: 16px auto 24px;
    }

    .pill-options {
        grid-template-columns: 1fr !important;
    }

    .map-grid {
        grid-template-columns: repeat(5, 1fr);
    }

    .question-card {
        padding: 14px;
    }

    .question-text {
        font-size: 1rem;
        line-height: 1.5;
    }

    .option-item {
        padding: 14px 12px;
        align-items: flex-start;
    }

    .option-item .letter {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
    }

    .option-item .text {
        font-size: 0.95rem;
        line-height: 1.5;
    }

    .action-footer .n-space {
        flex-direction: column;
        align-items: stretch;
    }

    .action-footer .n-space :deep(.n-button) {
        width: 100%;
    }

    .review-header-row {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }
}
</style>

