<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, defineAsyncComponent } from 'vue'
import {
  NButton,
  NIcon,
  NInput,
  NProgress,
  useMessage
} from 'naive-ui'
import {
  ArrowLeft,
  ChevronLeft,
  MessageCircle,
  StopCircle,
  Volume2
} from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import PracticeStageHeader from '@/components/learning/PracticeStageHeader.vue'
import MockExamSetupPanel from '@/components/mockexam/MockExamSetupPanel.vue'
import MockExamResultPanel from '@/components/mockexam/MockExamResultPanel.vue'
import request from '@/utils/request'
import { useMockExamStore } from '@/stores/mockExam'
import { useUserStore } from '@/stores/user'
import { useTextAudio } from '@/composables/useTextAudio'
import {
  getExamTypeDescription,
  getExamTypeLabel,
  MOCK_EXAM_TYPE_VALUES,
  resolvePreferredExamType
} from '@/constants/examTypes'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const mockExamStore = useMockExamStore()
const userStore = useUserStore()
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

const step = ref('setup')
const loading = ref(false)
const generating = ref(false)
const exams = ref([])
const activeExam = ref(null)
const examQuestions = ref([])
const currentQuestionIndex = ref(0)
const userAnswers = ref([])
const examStartTime = ref(null)
const examResult = ref(null)

const showTutor = ref(false)
const selectedQuestionForTutor = ref(null)

const currentPage = ref(1)
const pageSize = ref(6)

const settings = ref({
  examType: resolvePreferredExamType(MOCK_EXAM_TYPE_VALUES, userStore.examType),
  difficulty: 'medium',
  duration: 120
})

const showShare = ref(false)
const shareContent = computed(() => {
  if (!examResult.value) return {}
  const examTypeName = currentExamTypeLabel.value || '模拟考试'
  return {
    title: `我在 LearnSphere AI 完成了${examTypeName}模拟考试！`,
    description: `刚刚完成了${examTypeName}模拟考试，答对 ${examResult.value.correctCount}/${examResult.value.totalCount} 道题，得分 ${examResult.value.score} 分！快来一起学习吧！`,
    url: window.location.href
  }
})

const examTypeThemeMap = {
  primary: { icon: 'P', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
  middle: { icon: 'M', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  high: { icon: 'H', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
  cet4: { icon: '4', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  cet6: { icon: '6', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
  ielts: { icon: 'I', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  toefl: { icon: 'T', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  gre: { icon: 'G', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' }
}

const examTypes = MOCK_EXAM_TYPE_VALUES.map((value) => ({
  value,
  label: getExamTypeLabel(value, value.toUpperCase()),
  desc: getExamTypeDescription(value, ''),
  ...(examTypeThemeMap[value] || { icon: value.slice(0, 1).toUpperCase(), color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)' })
}))

const difficulties = [
  { label: '初级', value: 'easy', icon: 'E' },
  { label: '中级', value: 'medium', icon: 'M' },
  { label: '高级', value: 'hard', icon: 'H' }
]

const choiceLetters = ['A', 'B', 'C', 'D']

const currentQuestion = computed(() => examQuestions.value[currentQuestionIndex.value] || null)
const activeExamType = computed(() => activeExam.value?.examType || settings.value.examType)
const activeDifficulty = computed(() => activeExam.value?.difficulty || settings.value.difficulty)
const currentExamTypeLabel = computed(() => (
  getExamTypeLabel(activeExamType.value, activeExamType.value?.toUpperCase())
  || '模拟考试'
))
const currentDifficultyLabel = computed(() => (
  difficulties.find(item => item.value === activeDifficulty.value)?.label
  || '中级'
))
const currentSectionLabel = computed(() => (
  currentQuestion.value?.section
  || currentQuestion.value?.type
  || '综合试题'
))
const progress = computed(() => {
  if (examQuestions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / examQuestions.value.length) * 100)
})
const answeredCount = computed(() => userAnswers.value.filter(answer => answer !== null && answer !== undefined && answer !== '').length)
const paginatedExams = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return exams.value.slice(start, end)
})
const spentMinutes = computed(() => Math.max(1, Math.floor((examResult.value?.timeSpent || 0) / 60)))
const isChoiceQuestion = computed(() => ['vocabulary', 'grammar', 'reading', 'listening'].includes(currentQuestion.value?.type || 'vocabulary'))

const getQuestionPassage = (question) => {
  if (!question || question.type !== 'reading') return null

  if (question.passage) return question.passage

  if (question.text && question.text.includes('\n\n')) {
    const parts = question.text.split('\n\n')
    if (parts.length >= 2) return parts.slice(0, -1).join('\n\n')
  }

  return null
}

const displayPassage = computed(() => getQuestionPassage(currentQuestion.value))

const getQuestionText = (question) => {
  if (!question) return ''

  if (question.type === 'reading' && question.text && question.text.includes('\n\n') && !question.passage) {
    const parts = question.text.split('\n\n')
    return parts[parts.length - 1]
  }

  return question.text
}

const displayQuestion = computed(() => getQuestionText(currentQuestion.value))

const listeningPassageNumber = computed(() => {
  const question = currentQuestion.value
  if (!question || question.type !== 'listening' || !question.audioScript) return null

  const listeningQuestions = examQuestions.value.filter(item => item.type === 'listening')
  const uniqueScripts = []
  const scriptMap = new Map()

  listeningQuestions.forEach(item => {
    if (!scriptMap.has(item.audioScript)) {
      scriptMap.set(item.audioScript, uniqueScripts.length + 1)
      uniqueScripts.push(item.audioScript)
    }
  })

  return scriptMap.get(question.audioScript) || 1
})

const headerTitle = computed(() => {
  if (step.value === 'testing') return '考试进行中'
  if (step.value === 'result') return '考试结果'
  if (step.value === 'review') return '试卷复盘'
  return '模拟考试'
})

const headerDescription = computed(() => {
  if (step.value === 'testing') {
    return '开始后可直接查看题目、完成作答并通过题号导航切换。'
  }
  if (step.value === 'result') {
    return '先看总分和完成情况，再决定回到考试大厅还是进入试卷复盘。'
  }
  if (step.value === 'review') {
    return '回到每一道题和解析，集中看错因、正确答案和需要继续追问的地方。'
  }
  return '先确认考试项目和难度，再进入更接近真实节奏的模拟考场。'
})

const headerSummary = computed(() => {
  if (step.value === 'testing') {
    return [
      { label: '考试', value: currentExamTypeLabel.value },
      { label: '进度', value: `${currentQuestionIndex.value + 1} / ${examQuestions.value.length}` },
      { label: '已作答', value: `${answeredCount.value}` },
      { label: '当前模块', value: currentSectionLabel.value }
    ]
  }

  if (step.value === 'result' || step.value === 'review') {
    return [
      { label: '总分', value: `${examResult.value?.score || 0}` },
      { label: '正确', value: `${examResult.value?.correctCount || 0}` },
      { label: '总题数', value: `${examResult.value?.totalCount || examQuestions.value.length}` },
      { label: '用时', value: `${spentMinutes.value} 分钟` }
    ]
  }

  return [
    { label: '考试', value: currentExamTypeLabel.value },
    { label: '难度', value: currentDifficultyLabel.value },
    { label: '时长', value: `${settings.value.duration} 分钟` },
    { label: '历史考卷', value: `${exams.value.length}` }
  ]
})

const tutorContext = computed(() => {
  const source = selectedQuestionForTutor.value
    || (step.value === 'testing' && currentQuestion.value ? { question: currentQuestion.value, index: currentQuestionIndex.value } : null)

  if (!source || !source.question) return null

  const { question, index } = source
  const isReview = step.value === 'review'

  return {
    type: isReview ? 'mock_exam_review' : 'mock_exam_practice',
    examType: settings.value.examType,
    question: question.text,
    options: question.options,
    userAnswer: typeof userAnswers.value[index] === 'number'
      ? choiceLetters[userAnswers.value[index]]
      : (userAnswers.value[index] || '未作答'),
    correctAnswer: typeof question.correct === 'number'
      ? choiceLetters[question.correct]
      : (question.correctAnswer || question.correct || '参考答案'),
    explanation: question.explanation,
    topic: '全真模拟考',
    module: question.type || 'exam'
  }
})

const normalizeAnswer = (answer) => {
  if (answer === null || answer === undefined) return ''
  return String(answer).trim().toLowerCase()
}

const getCorrectAnswerValue = (question) => {
  if (Array.isArray(question?.options) && typeof question?.correct === 'number') {
    return question.correct
  }

  if (Array.isArray(question?.correctAnswer) && question.correctAnswer.length > 0) {
    return question.correctAnswer
  }

  if (question?.correctAnswer !== undefined && question?.correctAnswer !== null && question.correctAnswer !== '') {
    return question.correctAnswer
  }

  if (question?.correct !== undefined && question?.correct !== null && question.correct !== '') {
    return question.correct
  }

  return null
}

const formatUserAnswer = (question, index) => {
  const answer = userAnswers.value[index]
  if (answer === null || answer === undefined || answer === '') return '未作答'
  if (Array.isArray(question?.options) && typeof answer === 'number') {
    return choiceLetters[answer] || String(answer)
  }
  return String(answer)
}

const formatCorrectAnswer = (question) => {
  const correctValue = getCorrectAnswerValue(question)

  if (Array.isArray(question?.options) && typeof correctValue === 'number') {
    return choiceLetters[correctValue] || String(correctValue)
  }

  if (Array.isArray(correctValue)) {
    return correctValue.join(' / ')
  }

  return correctValue || '参考答案'
}

const getAnswerStatus = (question, index) => {
  const answer = userAnswers.value[index]

  if (answer === null || answer === undefined || answer === '') {
    return 'empty'
  }

  if (Array.isArray(question?.options) && typeof question?.correct === 'number') {
    return answer === question.correct ? 'correct' : 'wrong'
  }

  const correctValue = getCorrectAnswerValue(question)
  if (correctValue === null) return 'neutral'

  const normalizedAnswer = normalizeAnswer(answer)
  if (!normalizedAnswer) return 'empty'

  if (Array.isArray(correctValue)) {
    return correctValue.some(item => normalizeAnswer(item) === normalizedAnswer) ? 'correct' : 'wrong'
  }

  return normalizeAnswer(correctValue) === normalizedAnswer ? 'correct' : 'wrong'
}

const openAITutor = (question, index) => {
  selectedQuestionForTutor.value = { question, index }
  showTutor.value = true
}

const closeTutor = () => {
  showTutor.value = false
  selectedQuestionForTutor.value = null
}

const openReview = () => {
  closeTutor()
  step.value = 'review'
}

const backToResult = () => {
  closeTutor()
  step.value = 'result'
}

const syncSettingsFromExam = (exam) => {
  if (!exam) return

  settings.value.examType = exam.examType || settings.value.examType
  settings.value.difficulty = exam.difficulty || settings.value.difficulty
  settings.value.duration = exam.duration || settings.value.duration
}

const isExamInProgress = computed(() => step.value === 'testing' && activeExam.value !== null)

const handleBeforeUnload = (event) => {
  if (isExamInProgress.value) {
    event.preventDefault()
    event.returnValue = '考试正在进行中，确定要离开吗？你的答题进度将会丢失。'
    return event.returnValue
  }
}

const updateSetting = (key, value) => {
  settings.value[key] = value
}

const updateTextAnswer = (value) => {
  userAnswers.value[currentQuestionIndex.value] = value
  mockExamStore.updateProgress(currentQuestionIndex.value, value, currentQuestionIndex.value)
}

const loadExams = async () => {
  loading.value = true
  try {
    const res = await request.get('/exam/list', { params: { examType: '' } })
    if (res.code === 200) {
      exams.value = res.data || []
    }
  } catch (error) {
    console.error('加载考试列表失败', error)
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
      if (res.data?.id) {
        startExam(res.data)
      }
    }
  } catch (error) {
    console.error('生成考卷失败', error)
  } finally {
    generating.value = false
  }
}

const startExam = async (exam) => {
  loading.value = true
  try {
    const res = await request.get(`/exam/detail/${exam.id}`)
    if (res.code === 200 && res.data) {
      const questions = Array.isArray(res.data.questions) ? res.data.questions : []
      if (questions.length === 0) {
        message.warning('这套考卷暂时没有可用题目，请重新生成或换一套试试。')
        return
      }

      activeExam.value = res.data
      syncSettingsFromExam(activeExam.value)
      examQuestions.value = questions
      userAnswers.value = new Array(examQuestions.value.length).fill(null)
      currentQuestionIndex.value = 0
      examStartTime.value = Date.now()
      examResult.value = null
      step.value = 'testing'
      showTutor.value = false
      selectedQuestionForTutor.value = null
      showShare.value = false

      mockExamStore.startExam(activeExam.value, examQuestions.value)
    }
  } catch (error) {
    console.error('加载考试详情失败', error)
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
    selectedQuestionForTutor.value = null
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < examQuestions.value.length - 1) {
    currentQuestionIndex.value++
    mockExamStore.currentQuestionIndex = currentQuestionIndex.value
    selectedQuestionForTutor.value = null
  }
}

const jumpToQuestion = (index) => {
  currentQuestionIndex.value = index
  mockExamStore.currentQuestionIndex = index
  selectedQuestionForTutor.value = null
}

watch(currentQuestionIndex, (newIndex, oldIndex) => {
  if (step.value === 'testing') {
    selectedQuestionForTutor.value = null
  }

  const newQuestion = examQuestions.value[newIndex]
  const oldQuestion = examQuestions.value[oldIndex]

  if (newQuestion?.type !== 'listening') {
    stopAudio()
    return
  }

  if (oldQuestion?.type === 'listening' && newQuestion?.type === 'listening' && oldQuestion.audioScript !== newQuestion.audioScript) {
    stopAudio()
  }
})

const submitExam = async () => {
  const timeSpent = Math.round((Date.now() - examStartTime.value) / 1000)
  loading.value = true
  try {
    const res = await request.post('/exam/submit', {
      examId: activeExam.value.id,
      answers: userAnswers.value.map(answer => (answer === null || answer === undefined) ? -1 : answer),
      timeSpent
    })
    if (res.code === 200) {
      examResult.value = res.data
      showTutor.value = false
      selectedQuestionForTutor.value = null
      step.value = 'result'
      message.success('提交成功！成绩已存入档案')
      mockExamStore.clearPersistedState()
    }
  } catch (error) {
    console.error('提交考试失败', error)
  } finally {
    loading.value = false
  }
}

const exitExam = () => {
  stopAudio()
  step.value = 'setup'
  activeExam.value = null
  examQuestions.value = []
  examResult.value = null
  userAnswers.value = []
  currentQuestionIndex.value = 0
  selectedQuestionForTutor.value = null
  showTutor.value = false
  showShare.value = false
  mockExamStore.clearPersistedState()
  loadExams()
}

onMounted(() => {
  loadExams()
  window.addEventListener('beforeunload', handleBeforeUnload)

  if (mockExamStore.activeExam && mockExamStore.step === 'testing') {
    if (mockExamStore.isExpired()) {
      message.warning('检测到练习数据已过期，已为您清除')
      mockExamStore.clearPersistedState()
    } else {
      activeExam.value = mockExamStore.activeExam
      syncSettingsFromExam(activeExam.value)
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
  <div class="page-container" :class="`page-container--${step}`">
    <PracticeStageHeader
      kicker="模拟考试"
      :title="headerTitle"
      :description="headerDescription"
      :summary-items="headerSummary"
      accent-start="#60a5fa"
      accent-end="#2563eb"
      :compact="step !== 'setup'"
    />

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

    <div v-else-if="step === 'testing'" class="exam-shell">
      <div class="back-button-container">
        <n-button secondary @click="exitExam">
          <template #icon>
            <n-icon :component="ArrowLeft" />
          </template>
          返回考试大厅
        </n-button>
      </div>

      <div class="exam-layout-container">
        <div class="main-content-area">
          <section class="workspace-card">
            <div class="workspace-heading">
              <div class="workspace-copy">
                <p class="workspace-kicker">模拟考试</p>
                <h2 class="workspace-title">请根据题目完成作答，并留意当前进度</h2>
                <p class="workspace-caption">题号导航会跟随你的作答进度实时更新。</p>
              </div>

              <div class="workspace-meta">
                <span class="workspace-chip">{{ currentExamTypeLabel }}</span>
                <span class="workspace-chip">{{ currentDifficultyLabel }}</span>
                <span class="workspace-chip">{{ currentSectionLabel }}</span>
              </div>
            </div>

            <div class="exam-header">
              <div class="exam-header-copy">
                <h2>{{ activeExam?.title || '模拟考试' }}</h2>
                <p class="exam-meta">
                  <span>{{ currentExamTypeLabel }}</span>
                  <span class="separator">•</span>
                  <span>{{ currentQuestionIndex + 1 }} / {{ examQuestions.length }}</span>
                  <span class="separator">•</span>
                  <span>已答 {{ answeredCount }} 题</span>
                </p>
              </div>

              <n-button secondary type="primary" @click="showTutor = true">
                <template #icon>
                  <n-icon :component="MessageCircle" />
                </template>
                问问 AI
              </n-button>
            </div>

            <div v-if="currentQuestion?.type === 'listening'" class="audio-callout">
              <div class="audio-copy">
                <span class="callout-label">Listening Passage {{ listeningPassageNumber }}</span>
                <strong>{{ speaking && currentAudioScript === currentQuestion.audioScript ? '正在播放听力材料' : '点击播放当前听力材料' }}</strong>
              </div>

              <n-button
                type="primary"
                secondary
                class="audio-button"
                @click="playAudio(currentQuestion.audioScript)"
              >
                <template #icon>
                  <n-icon :component="speaking && currentAudioScript === currentQuestion.audioScript ? StopCircle : Volume2" />
                </template>
                {{ speaking && currentAudioScript === currentQuestion.audioScript ? '停止播放' : '播放音频' }}
              </n-button>
            </div>

            <div v-if="displayPassage" class="passage-shell">
              <div class="passage-label">Reading Passage</div>
              <div class="passage-content">
                {{ displayPassage }}
              </div>
            </div>

            <div class="question-shell">
              <div class="question-head">
                <span class="question-index">Q{{ currentQuestionIndex + 1 }}</span>
                <h3 class="question-text">{{ displayQuestion }}</h3>
              </div>

              <div v-if="isChoiceQuestion" class="options-container">
                <button
                  v-for="(option, index) in currentQuestion?.options || []"
                  :key="index"
                  type="button"
                  class="answer-option"
                  :class="{ selected: userAnswers[currentQuestionIndex] === index }"
                  @click="selectAnswer(index)"
                >
                  <span class="option-index">{{ choiceLetters[index] }}</span>
                  <span class="option-text">{{ option }}</span>
                </button>
              </div>

              <div v-else class="text-input-container">
                <n-input
                  :value="typeof userAnswers[currentQuestionIndex] === 'string' ? userAnswers[currentQuestionIndex] : ''"
                  type="textarea"
                  placeholder="请输入您的答案..."
                  :autosize="{ minRows: 8, maxRows: 24 }"
                  @update:value="updateTextAnswer"
                />
              </div>
            </div>

            <div class="actions-footer">
              <div class="footer-status">
                <span>答题进度</span>
                <strong>{{ answeredCount }} / {{ examQuestions.length }}</strong>
              </div>

              <div class="footer-actions">
                <n-button :disabled="currentQuestionIndex === 0" secondary @click="prevQuestion">
                  上一题
                </n-button>
                <n-button
                  v-if="currentQuestionIndex < examQuestions.length - 1"
                  type="primary"
                  @click="nextQuestion"
                >
                  下一题
                </n-button>
                <n-button v-else type="error" :loading="loading" @click="submitExam">
                  提交试卷
                </n-button>
              </div>
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <div class="sticky-nav">
            <section class="nav-panel">
              <div class="nav-head">
                <p class="nav-kicker">考试导航</p>
                <h3 class="nav-title">当前题号、进度和跳转入口</h3>
                <p class="nav-caption">可随时查看状态，并快速切换到指定题目。</p>
              </div>

              <div class="meta-stack">
                <div class="meta-row">
                  <span>考试项目</span>
                  <strong>{{ currentExamTypeLabel }}</strong>
                </div>
                <div class="meta-row">
                  <span>考试难度</span>
                  <strong>{{ currentDifficultyLabel }}</strong>
                </div>
                <div class="meta-row">
                  <span>当前模块</span>
                  <strong>{{ currentSectionLabel }}</strong>
                </div>
              </div>

              <div class="progress-card">
                <div class="progress-label">
                  <span>完成进度</span>
                  <span>{{ progress }}%</span>
                </div>
                <n-progress
                  type="line"
                  :percentage="progress"
                  :show-indicator="false"
                  color="#2563eb"
                  rail-color="#3f3f46"
                  :height="6"
                />
              </div>

              <div class="meta-stack compact">
                <div class="meta-row">
                  <span>当前题号</span>
                  <strong>{{ currentQuestionIndex + 1 }} / {{ examQuestions.length }}</strong>
                </div>
                <div class="meta-row">
                  <span>已作答</span>
                  <strong>{{ answeredCount }}</strong>
                </div>
              </div>

              <div class="question-grid">
                <button
                  v-for="(question, index) in examQuestions"
                  :key="index"
                  type="button"
                  class="nav-btn"
                 :class="{
                    current: currentQuestionIndex === index,
                    answered: userAnswers[index] !== null && userAnswers[index] !== undefined && userAnswers[index] !== '' && currentQuestionIndex !== index
                  }"
                  @click="jumpToQuestion(index)"
                >
                  {{ index + 1 }}
                </button>
              </div>

              <p class="nav-note">完成本页后再统一提交，结果页会整理总分、正误和复盘入口。</p>
            </section>
          </div>
        </aside>
      </div>
    </div>

    <div v-else-if="step === 'result'" class="result-shell">
      <MockExamResultPanel
        :exam-result="examResult"
        @back-list="exitExam"
        @review="openReview"
        @share="showShare = true"
      />

      <ShareModal
        v-model:show="showShare"
        :title="shareContent.title"
        :description="shareContent.description"
        :url="shareContent.url"
      />
    </div>

    <div v-else-if="step === 'review'" class="review-view">
      <div class="back-button-container">
        <n-button secondary @click="backToResult">
          <template #icon>
            <n-icon :component="ChevronLeft" />
          </template>
          返回报告
        </n-button>
      </div>

      <section class="review-shell">
        <div class="review-head">
          <div>
            <p class="review-kicker">Exam Review</p>
            <h2 class="review-title">逐题回顾答案与解析，集中看错因和可追问的地方</h2>
          </div>
          <span class="review-count">{{ examQuestions.length }} 题</span>
        </div>

        <div class="review-list">
          <article
            v-for="(question, index) in examQuestions"
            :key="index"
            class="review-item"
          >
              <div class="review-item-head">
                <div>
                  <span class="review-index">Q{{ index + 1 }}</span>
                  <h3>{{ getQuestionText(question) }}</h3>
                </div>
                <n-button size="small" secondary type="primary" @click="openAITutor(question, index)">
                  <template #icon>
                  <n-icon :component="MessageCircle" />
                </template>
                问问 AI 导师
              </n-button>
            </div>

              <div class="review-answer-grid">
                <div class="answer-block">
                  <span>你的答案</span>
                  <strong
                    :class="{
                      correct: getAnswerStatus(question, index) === 'correct',
                      wrong: getAnswerStatus(question, index) === 'wrong',
                      neutral: getAnswerStatus(question, index) === 'neutral' || getAnswerStatus(question, index) === 'empty'
                    }"
                  >
                    {{ formatUserAnswer(question, index) }}
                  </strong>
                </div>
              <div class="answer-block">
                <span>正确答案</span>
                <strong class="correct">{{ formatCorrectAnswer(question) }}</strong>
              </div>
            </div>

            <div v-if="question.explanation" class="explanation-box">
              <strong>解析：</strong>
              <span>{{ question.explanation }}</span>
            </div>
          </article>
        </div>
      </section>
    </div>

    <AITutor
      :context="tutorContext"
      :auto-open="showTutor"
      @close="closeTutor"
    />
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  max-width: 1480px;
  margin: 28px auto 56px;
  padding: 0 28px;
}

:global(html[data-theme='light'] .page-container--testing),
:global(html[data-theme='light'] .page-container--result),
:global(html[data-theme='light'] .page-container--review) {
  border-radius: 36px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.74)),
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.08), transparent 34%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.exam-shell,
.result-shell,
.review-view {
  min-width: 0;
}

.exam-layout-container,
.main-content-area,
.sidebar,
.workspace-card,
.workspace-heading,
.workspace-copy,
.workspace-meta,
.exam-header,
.audio-callout,
.audio-copy,
.question-shell,
.question-head,
.actions-footer,
.footer-status,
.footer-actions,
.nav-panel,
.nav-head,
.meta-stack,
.meta-row,
.progress-label,
.question-grid,
.review-shell,
.review-head,
.review-item,
.review-item-head,
.review-answer-grid,
.answer-block,
.explanation-box {
  min-width: 0;
}

.back-button-container {
  margin-bottom: 18px;
}

.exam-layout-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 286px;
  gap: 28px;
  align-items: flex-start;
}

.main-content-area,
.sidebar {
  min-width: 0;
}

.sticky-nav {
  position: sticky;
  top: 92px;
}

.workspace-card,
.review-shell {
  display: grid;
  gap: 22px;
  padding: 24px 26px 26px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.2)),
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.08), transparent 44%);
}

.workspace-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.workspace-copy {
  display: grid;
  gap: 8px;
}

.workspace-kicker,
.nav-kicker,
.review-kicker {
  margin: 0 0 8px;
  color: #60a5fa;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-title,
.review-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
  line-height: 1.38;
  overflow-wrap: anywhere;
}

.workspace-caption,
.nav-caption,
.nav-note {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.workspace-chip {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.26);
  color: var(--text-color);
  font-size: 0.8rem;
  font-weight: 700;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.exam-header-copy {
  min-width: 0;
}

.exam-header-copy h2 {
  margin: 0 0 10px;
  font-size: 1.84rem;
  line-height: 1.28;
  color: var(--text-color);
  overflow-wrap: anywhere;
}

.exam-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.separator {
  opacity: 0.5;
}

.audio-callout {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(96, 165, 250, 0.12);
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(15, 23, 42, 0.18)),
    rgba(15, 23, 42, 0.16);
}

.audio-copy {
  display: grid;
  gap: 6px;
}

.audio-copy strong {
  color: var(--text-color);
  font-size: 0.98rem;
  overflow-wrap: anywhere;
}

.callout-label,
.passage-label,
.question-index,
.review-index {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.12);
  color: #93c5fd;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.passage-shell,
.question-shell {
  display: grid;
  gap: 18px;
}

.passage-content {
  max-height: 42vh;
  overflow-y: auto;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.18);
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.85;
  white-space: pre-wrap;
}

.question-shell {
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.question-head {
  display: grid;
  gap: 12px;
}

.question-text {
  margin: 0;
  font-size: 1.16rem;
  line-height: 1.62;
  color: var(--text-color);
  overflow-wrap: anywhere;
}

.options-container {
  display: grid;
  gap: 14px;
}

.answer-option {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 18px;
  background: rgba(15, 23, 42, 0.18);
  cursor: pointer;
  display: flex;
  align-items: center;
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.answer-option:hover {
  background: rgba(15, 23, 42, 0.28);
  border-color: rgba(96, 165, 250, 0.2);
  transform: translateY(-1px);
}

.answer-option.selected {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(96, 165, 250, 0.45);
}

.option-index {
  width: 34px;
  height: 34px;
  margin-right: 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-text);
  font-weight: 700;
  flex-shrink: 0;
}

.answer-option.selected .option-index {
  background: #2563eb;
  color: white;
}

.option-text {
  font-size: 1rem;
  line-height: 1.55;
  color: var(--text-color);
  overflow-wrap: anywhere;
}

.text-input-container {
  min-height: 300px;
}

.actions-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.footer-status {
  display: grid;
  gap: 4px;
  color: var(--secondary-text);
  font-size: 0.88rem;
}

.footer-status strong {
  color: var(--text-color);
  font-size: 0.98rem;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.nav-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.nav-head {
  display: grid;
  gap: 4px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.nav-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.02rem;
  line-height: 1.35;
}

.meta-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-stack.compact {
  gap: 8px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--secondary-text);
  font-size: 0.92rem;
}

.meta-row strong {
  color: var(--text-color);
  font-size: 0.94rem;
  overflow-wrap: anywhere;
}

.progress-card {
  padding: 16px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--secondary-text);
  font-size: 0.82rem;
  gap: 10px;
  flex-wrap: wrap;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.nav-btn {
  min-height: 44px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.24);
  color: var(--secondary-text);
  cursor: pointer;
  font-weight: 700;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.nav-btn.current {
  background: #2563eb;
  color: white;
  border-color: transparent;
}

.nav-btn.answered:not(.current) {
  border-color: rgba(96, 165, 250, 0.24);
  color: #93c5fd;
}

.nav-note {
  padding-top: 4px;
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.review-count {
  color: var(--secondary-text);
  font-size: 0.86rem;
  font-weight: 700;
}

.review-list {
  display: grid;
  gap: 18px;
}

.review-item {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.18);
}

.review-item-head {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 16px;
}

.review-item-head h3 {
  margin: 10px 0 0;
  color: var(--text-color);
  font-size: 1.02rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.review-answer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.answer-block {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
}

.answer-block span {
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.answer-block strong {
  color: var(--text-color);
  font-size: 1rem;
  overflow-wrap: anywhere;
}

.answer-block strong.correct {
  color: #34d399;
}

.answer-block strong.wrong {
  color: #f87171;
}

.answer-block strong.neutral {
  color: var(--text-color);
}

.explanation-box {
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--secondary-text);
  line-height: 1.65;
  display: flex;
  gap: 8px;
  overflow-wrap: anywhere;
}

.explanation-box strong {
  color: var(--text-color);
  flex-shrink: 0;
}

.passage-content::-webkit-scrollbar {
  width: 6px;
}

.passage-content::-webkit-scrollbar-track {
  background: transparent;
}

.passage-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
}

.passage-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

:global(html[data-theme='light'] .workspace-card),
:global(html[data-theme='light'] .review-shell),
:global(html[data-theme='light'] .nav-panel) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.08), transparent 42%);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .workspace-heading),
:global(html[data-theme='light'] .question-shell),
:global(html[data-theme='light'] .actions-footer),
:global(html[data-theme='light'] .nav-head),
:global(html[data-theme='light'] .progress-card),
:global(html[data-theme='light'] .review-head) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .workspace-chip),
:global(html[data-theme='light'] .answer-option),
:global(html[data-theme='light'] .passage-content),
:global(html[data-theme='light'] .review-item),
:global(html[data-theme='light'] .answer-block),
:global(html[data-theme='light'] .explanation-box),
:global(html[data-theme='light'] .nav-btn) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .workspace-chip),
:global(html[data-theme='light'] .answer-option),
:global(html[data-theme='light'] .review-item),
:global(html[data-theme='light'] .answer-block),
:global(html[data-theme='light'] .explanation-box),
:global(html[data-theme='light'] .nav-btn),
:global(html[data-theme='light'] .passage-content) {
  background: rgba(255, 255, 255, 0.86);
}

:global(html[data-theme='light'] .workspace-chip) {
  color: #334155;
}

:global(html[data-theme='light'] .audio-callout) {
  border-color: rgba(96, 165, 250, 0.18);
  background:
    linear-gradient(180deg, rgba(239, 246, 255, 0.96), rgba(248, 250, 252, 0.92)),
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.12), transparent 40%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

:global(html[data-theme='light'] .callout-label),
:global(html[data-theme='light'] .passage-label),
:global(html[data-theme='light'] .question-index),
:global(html[data-theme='light'] .review-index) {
  background: rgba(219, 234, 254, 0.92);
  color: #2563eb;
}

:global(html[data-theme='light'] .passage-content) {
  color: #334155;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

:global(html[data-theme='light'] .answer-option:hover),
:global(html[data-theme='light'] .nav-btn:hover) {
  background: rgba(248, 250, 252, 0.98);
}

:global(html[data-theme='light'] .answer-option:hover) {
  border-color: rgba(96, 165, 250, 0.24);
}

:global(html[data-theme='light'] .answer-option.selected) {
  background:
    linear-gradient(180deg, rgba(219, 234, 254, 0.92), rgba(239, 246, 255, 0.84)),
    rgba(255, 255, 255, 0.96);
  border-color: rgba(59, 130, 246, 0.38);
}

:global(html[data-theme='light'] .option-index) {
  background: rgba(241, 245, 249, 0.96);
  color: #475569;
}

:global(html[data-theme='light'] .meta-row),
:global(html[data-theme='light'] .progress-label),
:global(html[data-theme='light'] .review-count),
:global(html[data-theme='light'] .footer-status),
:global(html[data-theme='light'] .workspace-caption),
:global(html[data-theme='light'] .nav-caption),
:global(html[data-theme='light'] .nav-note),
:global(html[data-theme='light'] .exam-meta),
:global(html[data-theme='light'] .answer-block span),
:global(html[data-theme='light'] .explanation-box) {
  color: #64748b;
}

:global(html[data-theme='light'] .question-text),
:global(html[data-theme='light'] .option-text),
:global(html[data-theme='light'] .audio-copy strong),
:global(html[data-theme='light'] .meta-row strong),
:global(html[data-theme='light'] .footer-status strong),
:global(html[data-theme='light'] .review-item-head h3),
:global(html[data-theme='light'] .explanation-box strong) {
  color: #0f172a;
}

:global(html[data-theme='light'] .nav-btn) {
  color: #64748b;
}

:global(html[data-theme='light'] .nav-btn.answered:not(.current)) {
  border-color: rgba(96, 165, 250, 0.26);
  color: #2563eb;
  background: rgba(239, 246, 255, 0.96);
}

:global(html[data-theme='light'] .passage-content::-webkit-scrollbar-thumb) {
  background: rgba(148, 163, 184, 0.28);
}

:global(html[data-theme='light'] .passage-content::-webkit-scrollbar-thumb:hover) {
  background: rgba(100, 116, 139, 0.36);
}

@media (max-width: 900px) {
  .page-container {
    margin: 18px auto 24px;
    padding:
      0
      max(10px, env(safe-area-inset-right))
      calc(20px + env(safe-area-inset-bottom))
      max(10px, env(safe-area-inset-left));
  }

  .exam-layout-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .sticky-nav {
    position: static;
  }

  .workspace-card,
  .review-shell {
    padding: 16px 14px;
    border-radius: 22px;
  }

  .workspace-heading,
  .review-head,
  .exam-header,
  .review-item-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .workspace-title,
  .review-title {
    font-size: 1.02rem;
  }

  .workspace-caption,
  .nav-caption,
  .nav-note {
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .workspace-meta {
    justify-content: flex-start;
  }

  .workspace-chip {
    justify-content: center;
  }

  .exam-header-copy h2 {
    font-size: 1.34rem;
  }

  .audio-callout,
  .actions-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .audio-button,
  .footer-actions,
  .footer-actions :deep(.n-button) {
    width: 100%;
  }

  .footer-actions {
    flex-direction: column;
  }

  .passage-content {
    max-height: none;
    font-size: 0.95rem;
  }

  .question-text,
  .option-text {
    font-size: 0.96rem;
  }

  .question-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .review-answer-grid {
    grid-template-columns: 1fr;
  }

  .explanation-box {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    padding-bottom: calc(18px + env(safe-area-inset-bottom));
  }

  .workspace-card,
  .review-shell,
  .nav-panel {
    padding: 14px 12px;
    border-radius: 18px;
  }

  .nav-panel {
    gap: 14px;
  }

  .workspace-title,
  .review-title {
    font-size: 0.98rem;
  }

  .workspace-caption,
  .nav-caption,
  .nav-note,
  .footer-status {
    font-size: 0.8rem;
  }

  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .meta-row strong {
    font-size: 0.88rem;
    line-height: 1.35;
  }

  .question-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .nav-btn {
    min-height: 40px;
    border-radius: 10px;
  }

  .workspace-meta {
    width: 100%;
  }

  .workspace-chip {
    width: 100%;
    justify-content: flex-start;
  }

  .exam-header-copy h2 {
    font-size: 1.2rem;
    line-height: 1.32;
  }

  .audio-callout {
    padding: 14px 12px;
    border-radius: 16px;
  }

  .answer-option {
    padding: 15px 14px;
    border-radius: 14px;
  }

  .option-index {
    width: 30px;
    height: 30px;
    margin-right: 12px;
    border-radius: 9px;
  }

  .review-item-head :deep(.n-button) {
    width: 100%;
  }

  .passage-content {
    font-size: 0.92rem;
    line-height: 1.75;
  }

  .review-item {
    padding: 16px 14px;
    border-radius: 18px;
  }

  .answer-block,
  .explanation-box {
    padding: 13px 14px;
    border-radius: 14px;
  }
}

@media (max-width: 360px) {
  .page-container {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }

  .workspace-card,
  .review-shell,
  .nav-panel {
    padding: 12px 10px;
    border-radius: 16px;
  }

  .workspace-title,
  .review-title {
    font-size: 0.94rem;
  }

  .exam-header-copy h2 {
    font-size: 1.08rem;
  }

  .question-text,
  .option-text {
    font-size: 0.9rem;
  }

  .question-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .nav-btn {
    min-height: 38px;
    font-size: 0.82rem;
  }

  .answer-option {
    padding: 13px 12px;
  }

  .option-index {
    width: 28px;
    height: 28px;
    margin-right: 10px;
    font-size: 0.84rem;
  }

  .footer-status strong,
  .meta-row strong {
    font-size: 0.84rem;
  }

  .review-item {
    gap: 12px;
    padding: 14px 12px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .page-container {
    margin: 12px auto 18px;
    padding-left: max(10px, env(safe-area-inset-left));
    padding-right: max(10px, env(safe-area-inset-right));
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  .workspace-card,
  .review-shell,
  .nav-panel {
    padding: 14px 12px;
  }

  .workspace-heading,
  .review-head,
  .exam-header,
  .review-item-head {
    gap: 8px;
  }

  .passage-content {
    max-height: none;
    font-size: 0.92rem;
  }

  .question-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .footer-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .footer-actions :deep(.n-button) {
    flex: 1 1 160px;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>

