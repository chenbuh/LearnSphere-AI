<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  NCard, NButton, NProgress, NTag, NAvatar, NResult, 
  NGrid, NGridItem, NSpace, NDivider, NList, NListItem, NThing, useMessage, NPagination
} from 'naive-ui'
import { 
  Clock, Link, MapPin, FileText, Drama, Stamp, Zap, BookOpen, 
  Target, Rocket, CheckCircle2, XCircle, Trophy, RotateCcw, 
  ArrowLeft, Settings, BarChart3, HelpCircle, History, Star, Award, MessageCircle
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { fireConfetti, fireFireworks } from '@/utils/confetti'
import { useGrammarStore } from '@/stores/grammar'
import { decryptPayload } from '@/utils/crypto'
import GrammarSkeleton from '@/components/GrammarSkeleton.vue'
import AITutor from '@/components/AITutor.vue'

const message = useMessage()

// --- Data Constants ---
const grammarTopics = [
  { id: 1, title: '时态语态', desc: '现在时、过去时、被动语态等', count: 42, icon: Clock, color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)' },
  { id: 2, title: '从句结构', desc: '定语从句、状语从句、名词性从句', count: 36, icon: Link, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)' },
  { id: 3, title: '介词用法', desc: '时间、地点、方位介词', count: 32, icon: MapPin, color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
  { id: 4, title: '冠词用法', desc: '定冠词、不定冠词、零冠词', count: 24, icon: FileText, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  { id: 5, title: '情态动词', desc: 'can, must, should 等用法', count: 28, icon: Drama, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
  { id: 6, title: '条件句', desc: '真实条件句、虚拟条件句', count: 30, icon: Stamp, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)' },
  { id: 7, title: '倒装句', desc: '完全倒装、部分倒装', count: 18, icon: RotateCcw, color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)' },
  { id: 8, title: '非谓语', desc: '不定式、动名词、分词', count: 45, icon: Zap, color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)' }
]

const practiceModes = [
  { id: 'quick', title: '快速练习', desc: '10道题快速测试', icon: Zap, color: '#f97316' },
  { id: 'comprehensive', title: '综合练习', desc: '20道题全面检测', icon: BookOpen, color: '#22c55e' },
  { id: 'exam', title: '考试模拟', desc: '限时模拟考试', icon: Target, color: '#ef4444' }
]

const difficulties = [
  { id: 'easy', title: '基础', desc: '适合初学者', stars: 1, color: '#4ade80' },
  { id: 'medium', title: '中级', desc: '有一定挑战', stars: 2, color: '#facc15' },
  { id: 'hard', title: '高级', desc: '挑战高难度', stars: 3, color: '#f87171' }
]

// --- Pinia Store ---
const grammarStore = useGrammarStore()

// --- State ---
const selectedTopic = ref(grammarStore.selectedTopic || grammarTopics[0].id)
const selectedMode = ref('comprehensive')
const selectedDifficulty = ref(grammarStore.selectedDifficulty || 'medium')
const isLoading = ref(false)

// Restore from store if exists
const isStarted = ref(grammarStore.currentMode === 'quiz')
const isSubmitted = ref(grammarStore.isSubmitted)
const currentQuestionIndex = ref(grammarStore.currentQuestionIndex)
const userAnswers = ref(grammarStore.userAnswers.length > 0 ? grammarStore.userAnswers : [])
const questions = ref(grammarStore.currentExercise?.questions || [])
const startTime = ref(Date.now())

// --- Quiz State ---
const score = ref(0)
const showResult = ref(false)
const historyExercises = ref([])
const earnedXP = ref(0)
const stats = ref({
    timeSpentToday: 0,
    grammarMastery: 0,
    grammarLevel: 1,
    totalQuestions: 0,
    averageAccuracy: 0
})

// --- AI Tutor State ---
const showTutor = ref(false)
const tutorContext = computed(() => {
  if (!currentQuestion.value || !currentQuestion.value.text || !currentQuestion.value.options) return null
  
  return {
    question: currentQuestion.value.text,
    options: currentQuestion.value.options,
    correctAnswer: currentQuestion.value.options[currentQuestion.value.correct] || '',
    userAnswer: selectedAnswer.value !== null 
      ? currentQuestion.value.options[selectedAnswer.value]
      : null,
    explanation: currentQuestion.value.explanation,
    topic: grammarTopics.find(t => t.id === selectedTopic.value)?.title || '语法'
  }
})

// Watch and sync to store
watch([currentQuestionIndex, userAnswers, isSubmitted], () => {
  if (isStarted.value && questions.value.length > 0) {
    grammarStore.currentQuestionIndex = currentQuestionIndex.value
    grammarStore.userAnswers = userAnswers.value
    grammarStore.isSubmitted = isSubmitted.value
  }
}) 

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)
/* Watch pagination changes */
watch([historyPage, historyPageSize], () => {
    fetchHistory()
})

// 是否正在练习中（用于离开提醒）
const isPracticeInProgress = computed(() => isStarted.value && !isSubmitted.value)

// 恢复提示（带过期检测）
if (grammarStore.currentExercise && grammarStore.currentMode === 'quiz' && !grammarStore.isSubmitted) {
  // 检查数据是否过期
  if (grammarStore.isExpired()) {
    message.warning('检测到练习数据已过期（超过24小时），已为您清除')
    grammarStore.clearPersistedState()
    isStarted.value = false
  } else {
    message.info('检测到未完成的练习，已为您恢复进度')
  }
}

// 离开页面提醒
const handleBeforeUnload = (e) => {
  if (isPracticeInProgress.value) {
    e.preventDefault()
    e.returnValue = '练习正在进行中，确定要离开吗？你的答题进度将会丢失。'
    return e.returnValue
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  fetchHistory()
  fetchStats()
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const paginatedHistory = computed(() => historyExercises.value)

const fetchHistory = async () => {
  try {
    const res = await aiApi.getGrammarHistory(historyPage.value, historyPageSize.value)
    if (res.code === 200) {
      if (res.data.records) {
         historyExercises.value = decryptPayload(res.data.records)
         historyTotal.value = res.data.total
      } else {
         historyExercises.value = decryptPayload(res.data || [])
         historyTotal.value = historyExercises.value.length
      }
    } else {
      // API返回错误，使用空数组
      console.warn('Grammar history API returned error:', res.message)
      historyExercises.value = []
      historyTotal.value = 0
    }
  } catch (e) {
    // API调用失败，静默处理
    console.warn('Failed to fetch grammar history, using empty array:', e.message)
    historyExercises.value = []
    historyTotal.value = 0
  }
}

const fetchStats = async () => {
    try {
        const res = await learningApi.getStatistics()
        if (res.code === 200 && res.data) {
            const d = res.data
            // Calculate today's time spent from weeklyStats if available
            let todayTime = 0
            if (d.weeklyStats && d.weeklyStats.length > 0) {
                const todayStr = new Date().toISOString().split('T')[0]
                const todayStat = d.weeklyStats.find(s => s.date === todayStr)
                if (todayStat) todayTime = Math.round(todayStat.timeSpent / 60) // to minutes
            }
            
            const grammarStat = d.abilityStats?.grammar || { count: 0, avgScore: 0, mastery: 0 }
            
            stats.value = {
                timeSpentToday: todayTime,
                grammarMastery: Math.round(grammarStat.avgScore || 0),
                grammarLevel: Math.max(1, Math.floor((grammarStat.avgScore || 0) / 20) + 1),
                totalQuestions: grammarStat.count || 0,
                averageAccuracy: Math.round(grammarStat.avgScore || 0)
            }
        } else {
            // API返回失败，使用默认值
            console.warn('Statistics API returned error, using defaults')
            useDefaultStats()
        }
    } catch (e) {
        // API调用失败，静默使用默认值
        console.warn('Failed to fetch statistics, using defaults:', e.message)
        useDefaultStats()
    }
}

// 使用默认统计值
const useDefaultStats = () => {
    stats.value = {
        timeSpentToday: 0,
        grammarMastery: 0,
        grammarLevel: 1,
        totalQuestions: 0,
        averageAccuracy: 0
    }
}

const loadHistoryExercise = (exercise) => {
  const decryptedExercise = decryptPayload(exercise)
  questions.value = decryptedExercise.questions || []
  if (questions.value.length === 0) {
    message.warning('此练习没有题目')
    return
  }
  isStarted.value = true
  isSubmitted.value = false
  currentQuestionIndex.value = 0
  userAnswers.value = new Array(questions.value.length).fill(null).map(() => ({ selected: null, correct: null }))
  score.value = 0
  showResult.value = false
  startTime.value = Date.now()
  message.success(`已加载: ${exercise.topic}`)
}

const selectedAnswer = computed({
    get: () => userAnswers.value[currentQuestionIndex.value]?.selected ?? null,
    set: (val) => {
        if (isSubmitted.value) return
        if (!userAnswers.value[currentQuestionIndex.value]) {
            userAnswers.value[currentQuestionIndex.value] = { selected: val, correct: null }
        } else {
            userAnswers.value[currentQuestionIndex.value].selected = val
        }
    }
})

const hasAnswered = computed(() => {
    return userAnswers.value[currentQuestionIndex.value]?.selected !== undefined && 
           userAnswers.value[currentQuestionIndex.value]?.selected !== null
})

const totalQuestions = computed(() => questions.value.length)

const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || {}
})

// --- Actions ---

const selectTopic = (id) => selectedTopic.value = id
const selectMode = (id) => selectedMode.value = id
const selectDifficulty = (id) => selectedDifficulty.value = id

const startPractice = async () => {
    isLoading.value = true
    try {
        const topicName = grammarTopics.find(t => t.id === selectedTopic.value)?.title
        const res = await aiApi.generateGrammar({
            topic: topicName,
            difficulty: selectedDifficulty.value
        })
        
        if (res.code === 200 && res.data) {
            const decryptedData = decryptPayload(res.data)
            if (decryptedData.questions && decryptedData.questions.length > 0) {
                questions.value = decryptedData.questions
            } else {
                console.warn('AI生成题目为空，使用模拟数据')
                questions.value = generateFallbackQuestions(topicName)
            }
        }
    } catch (e) {
        // API调用失败，由全局拦截器展示错误。此处仅记录并执行降级逻辑
        console.warn('AI服务请求失败，切换至本地降级方案:', e.message)
        
        // 仍然尝试使用模拟数据作为降级方案
        const topicName = grammarTopics.find(t => t.id === selectedTopic.value)?.title
        questions.value = generateFallbackQuestions(topicName)
    } finally {
        isLoading.value = false
        
        // 启动练习
        if (questions.value.length > 0) {
            isStarted.value = true
            isSubmitted.value = false
            currentQuestionIndex.value = 0
            userAnswers.value = new Array(questions.value.length).fill(null).map(() => ({ selected: null, correct: null }))
            score.value = 0
            score.value = 0
            showResult.value = false
            
            startTime.value = Date.now()
            
            // Save to store for persistence
            const topicName = grammarTopics.find(t => t.id === selectedTopic.value)?.title
            grammarStore.startExercise(
              { questions: questions.value },
              topicName,
              selectedDifficulty.value,
              questions.value.length
            )
        } else {
            message.error('题目生成失败，请稍后重试')
        }
    }
}

// 添加模拟题目生成函数
const generateFallbackQuestions = (topic) => {
    return [
        {
            id: 1,
            text: "By the time he arrives, we ______ dinner.",
            options: ["will finish", "will have finished", "are finishing", "have finished"],
            correct: 1,
            explanation: "'By the time' 引导的时间状语从句通常与将来完成时连用，表示在将来某时之前已经完成的动作。"
        },
        {
            id: 2,
            text: "She ______ to the gym every Monday.",
            options: ["go", "goes", "going", "gone"],
            correct: 1,
            explanation: "第三人称单数在一般现在时中动词需要加-s或-es。"
        },
        {
            id: 3,
            text: "If I ______ you, I would accept the offer.",
            options: ["am", "was", "were", "be"],
            correct: 2,
            explanation: "虚拟语气中，if引导的非真实条件句，be动词统一使用were，不论主语是什么人称。"
        },
        {
            id: 4,
            text: "The book ______ by millions of people worldwide.",
            options: ["reads", "is read", "was read", "has read"],
            correct: 1,
            explanation: "这里需要被动语态，表示'这本书被数百万人阅读'。一般现在时的被动语态用'is/are + 过去分词'。"
        },
        {
            id: 5,
            text: "I wish I ______ more time to travel.",
            options: ["have", "had", "will have", "would have"],
            correct: 1,
            explanation: "wish后面的从句表示与现在事实相反的愿望，需要用过去时（had）。"
        },
        {
            id: 6,
            text: "The movie was ______ interesting that I watched it twice.",
            options: ["very", "too", "so", "such"],
            correct: 2,
            explanation: "so...that结构表示'如此...以至于'，so修饰形容词或副词。"
        },
        {
            id: 7,
            text: "Neither John nor his friends ______ going to the party.",
            options: ["is", "are", "was", "been"],
            correct: 1,
            explanation: "neither...nor连接主语时，谓语动词遵循'就近原则'，与friends一致，用are。"
        },
        {
            id: 8,
            text: "He asked me ______ I could help him with the project.",
            options: ["that", "if", "what", "which"],
            correct: 1,
            explanation: "ask后面接宾语从句表示'是否'时，用if或whether引导。"
        },
        {
            id: 9,
            text: "The house ______ we visited yesterday belongs to my uncle.",
            options: ["which", "where", "what", "who"],
            correct: 0,
            explanation: "这是定语从句，先行词是house（物），关系代词用which或that，且在从句中作宾语。"
        },
        {
            id: 10,
            text: "She ______ English for five years before she moved to Canada.",
            options: ["studied", "has studied", "had studied", "studies"],
            correct: 2,
            explanation: "过去完成时表示'过去的过去'，她搬到加拿大之前已经学了五年英语。"
        }
    ]
}

const selectAnswerIdx = (idx) => {
    if (isSubmitted.value) return
    selectedAnswer.value = idx
}

const goToQuestion = (idx) => {
    if (idx >= 0 && idx < totalQuestions.value) {
        currentQuestionIndex.value = idx
    }
}

const submitPractice = async () => {
    if (isSubmitted.value) return
    

    
    // Check if all answered
    const unansweredCount = userAnswers.value.filter(a => a.selected === null).length
    if (unansweredCount > 0) {
        message.warning(`还有 ${unansweredCount} 道题未完成，请确认后提交`)
    }

    let totalPoints = 0
    let correctCount = 0
    const timePerQuestion = Math.max(1, Math.floor((Date.now() - startTime.value) / 1000 / questions.value.length))
    
    // Record results and save to backend
    for (let i = 0; i < questions.value.length; i++) {
        const q = questions.value[i]
        const userA = userAnswers.value[i]
        const isCorrect = userA.selected === q.correct
        
        userA.correct = isCorrect
        if (isCorrect) correctCount++

        // Save learning record for each question (especially wrong ones)
        try {
            const res = await learningApi.createRecord({
                contentId: q.id || i, // Use index if no ID
                contentType: 'grammar',
                isCorrect: isCorrect ? 1 : 0,
                answer: String(userA.selected),
                correctAnswer: String(q.correct),
                masteryLevel: isCorrect ? 3 : 1,
                timeSpent: timePerQuestion,
                originalContent: JSON.stringify(q) // Save the full question for notebook
            })
            if (res.code === 200 && res.data && res.data.points) {
                totalPoints += res.data.points
            }
        } catch (e) {
            console.error('Failed to save record', e)
        }
    }

    score.value = correctCount
    earnedXP.value = totalPoints
    isSubmitted.value = true
    showResult.value = true
    
    // Refresh stats after submission
    fetchStats()
    
    // Gamification Effects
    const percentage = correctCount / totalQuestions.value
    if (percentage === 1.0) {
        fireFireworks()
        message.success('完美通关！太棒了！')
    } else if (percentage >= 0.6) {
        fireConfetti()
        message.success('恭喜完成！继续保持！')
    } else {
        message.info('批改完成' + (totalPoints > 0 ? `，获得 ${totalPoints} 积分` : ''))
    }
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < totalQuestions.value - 1) {
        currentQuestionIndex.value++
    } else if (!isSubmitted.value) {
        submitPractice()
    } else {
        showResult.value = true
    }
}

const restart = () => {
    isStarted.value = false
    isSubmitted.value = false
    showResult.value = false
    questions.value = []
    
    // Clear persisted state
    grammarStore.clearPersistedState()
}

// Open AI Tutor
const openAITutor = () => {
    showTutor.value = true
}
</script>

<template>
  <div class="page-container">
    <div class="main-layout">
        
        <!-- LEFT PANEL: Main Content -->
        <div class="content-panel">
            
            <!-- Header -->
            <n-card class="header-card" :bordered="false">
                 <div class="header-content">
                     <div>
                        <h1>
                            {{ isStarted ? (showResult ? '练习报告' : '语法特训中') : '语法专项特训' }}
                        </h1>
                        <p class="subtitle">
                            {{ isStarted ? '保持专注，攻克难点' : '系统化梳理语法脉络' }}
                        </p>
                     </div>
                     <div v-if="isStarted && !showResult">
                         <n-button secondary @click="isStarted = false">
                            <template #icon><n-icon :component="ArrowLeft" /></template>
                            退出练习
                        </n-button>
                     </div>
                 </div>
            </n-card>

            <!-- SETUP VIEW: Topic Selection & History -->
            <template v-if="!isStarted">
                <!-- VIEW 1: Topic Selection Grid -->
                <div class="topics-grid-container">
                     <n-grid x-gap="20" y-gap="20" cols="1 800:2 1200:3" responsive="screen">
                        <n-grid-item v-for="topic in grammarTopics" :key="topic.id">
                            <div 
                                class="topic-card"
                                :class="{ active: selectedTopic === topic.id }"
                                @click="selectTopic(topic.id)"
                            >
                                <div class="card-top">
                                    <div class="icon-box" :style="{ backgroundColor: topic.bg, color: topic.color }">
                                        <n-icon :component="topic.icon" size="24" />
                                    </div>
                                    <div v-if="selectedTopic === topic.id" class="check-icon">
                                        <n-icon :component="CheckCircle2" color="#ec4899" />
                                    </div>
                                </div>
                                <h3>{{ topic.title }}</h3>
                                <p>{{ topic.desc }}</p>
                                <div class="card-footer">
                                     <n-tag size="small" round :bordered="false" type="default">
                                        {{ topic.count }} Questions
                                    </n-tag>
                                </div>
                            </div>
                        </n-grid-item>
                     </n-grid>
                </div>

                <!-- History Section -->
                <div v-if="historyTotal > 0" class="history-section mt-12">
                    <div class="section-title">
                        <n-icon :component="History" /> 最近生成练习
                    </div>
                    <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
                        <n-grid-item v-for="exercise in paginatedHistory" :key="exercise.id">
                            <div class="history-card" @click="loadHistoryExercise(exercise)">
                                <div class="history-card-header">
                                    <n-tag size="small" type="warning" :bordered="false">{{ exercise.topic || 'Grammar' }}</n-tag>
                                    <n-tag size="tiny" :bordered="false">{{ exercise.difficulty || 'medium' }}</n-tag>
                                </div>
                                <div class="history-card-body">
                                    <span class="question-count">{{ exercise.questions?.length || 0 }} 题</span>
                                </div>
                            </div>
                        </n-grid-item>
                    </n-grid>
                    <div v-if="historyTotal > 0" class="pagination-wrapper mt-6">
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
            </template>


            <!-- PRACTICE VIEW: Active Question -->
            <div v-else-if="!showResult" class="question-container">
                <!-- Show Skeleton during loading -->
                <template v-if="isLoading">
                    <GrammarSkeleton />
                </template>
                
                <!-- Show actual question when loaded -->
                <n-card v-else class="question-box" :bordered="false" size="huge">
                    <!-- Progress -->
                    <div class="progress-bar-wrapper">
                        <div class="progress-fill" :style="{ width: ((currentQuestionIndex + 1) / totalQuestions) * 100 + '%' }"></div>
                    </div>

                    <div class="question-inner">
                        <div v-if="currentQuestion && currentQuestion.text" class="question-content-wrapper">
                            <div class="meta-info">
                                <span class="topic-badge">
                                    {{ grammarTopics.find(t => t.id === selectedTopic)?.title }}
                                </span>
                                <span class="counter">Question {{ currentQuestionIndex + 1 }} of {{ totalQuestions }}</span>
                            </div>
                            
                            <h2 class="question-text secure-content">
                                {{ currentQuestion.text }}
                            </h2>

                            <div class="options-list">
                                <div 
                                    v-for="(option, idx) in currentQuestion.options" 
                                    :key="idx"
                                    class="option-item"
                                    :class="{
                                        'correct': isSubmitted && idx === currentQuestion.correct,
                                        'wrong': isSubmitted && selectedAnswer === idx && idx !== currentQuestion.correct,
                                        'disabled': isSubmitted,
                                        'selected': selectedAnswer === idx
                                    }"
                                    @click="selectAnswerIdx(idx)"
                                >
                                    <div class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</div>
                                    <span class="option-content">{{ option }}</span>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-question-message">
                            <p>题目加载中或未生成...</p>
                            <p style="font-size: 0.9rem; color: #71717a;">请返回重新生成练习</p>
                        </div>
                    </div>
                </n-card>

                <!-- Explanation Panel (Always show if submitted, or show navigation if not) -->
                <n-card class="explanation-card" :bordered="false" size="large">
                    <div class="explanation-content secure-content" v-if="isSubmitted">
                        <div class="exp-icon">
                            <n-icon :component="BookOpen" />
                        </div>
                         <div class="exp-text">
                            <h4>语法解析</h4>
                            <p>{{ currentQuestion.explanation }}</p>
                            
                            <!-- AI Tutor Button -->
                            <n-button 
                                @click="openAITutor" 
                                type="primary"
                                ghost
                                size="medium"
                                style="margin-top: 12px;"
                            >
                                <template #icon>
                                    <n-icon :component="MessageCircle" />
                                </template>
                                还有疑问？问问 AI 助手
                            </n-button>
                         </div>
                    </div>
                    <div class="exp-action-footer">
                        <n-space justify="end">
                            <n-button v-if="currentQuestionIndex > 0" secondary @click="goToQuestion(currentQuestionIndex - 1)">上一题</n-button>
                            <n-button type="primary" color="#db2777" size="large" @click="nextQuestion">
                                {{ currentQuestionIndex === totalQuestions - 1 ? (isSubmitted ? '查看结果' : '检查并提交') : '下一题' }}
                            </n-button>
                        </n-space>
                    </div>
                </n-card>
            </div>

            <!-- VIEW 3: Result -->
            <div v-else class="result-container">
                <n-card class="result-card" :bordered="false">
                     <div class="result-icon-wrapper">
                        <n-icon :component="score/totalQuestions >= 0.8 ? Trophy : (score/totalQuestions >= 0.6 ? Award : Target)" size="100" :color="score/totalQuestions >= 0.6 ? '#f59e0b' : '#9ca3af'" />
                     </div>
                     <h2 class="result-title">{{ score/totalQuestions >= 0.9 ? '完美表现！' : (score/totalQuestions >= 0.6 ? '练习完成!' : '继续加油！') }}</h2>
                     <p class="result-subtitle">
                        {{ score/totalQuestions >= 0.8 ? '你的语法水平简直不可思议！' : '掌握度稳步提升中，再接再厉' }}
                     </p>

                     <!-- Gamification Stars -->
                     <div class="stars-row" v-if="score > 0">
                        <n-icon v-for="i in 3" :key="i" :component="Star" :size="32" 
                            :color="i <= Math.ceil((score/totalQuestions)*3) ? '#f59e0b' : '#3f3f46'" 
                            :class="{ 'star-filled': i <= Math.ceil((score/totalQuestions)*3) }" 
                        />
                     </div>

                     <n-grid x-gap="24" cols="2" class="stats-grid">
                         <n-grid-item>
                             <div class="stat-box">
                                 <div class="stat-value correct-rate">{{ Math.round((score/totalQuestions)*100) }}%</div>
                                 <div class="stat-label">正确率</div>
                             </div>
                         </n-grid-item>
                         <n-grid-item>
                             <div class="stat-box">
                                 <div class="stat-value">{{ score }} <span class="dim">/{{ totalQuestions }}</span></div>
                                 <div class="stat-label">得分</div>
                             </div>
                         </n-grid-item>
                     </n-grid>

                     <div class="xp-reward" v-if="earnedXP > 0">
                        <div class="xp-badge">+{{ earnedXP }} XP</div>
                        <div class="xp-label">获得经验值</div>
                     </div>

                     <n-space justify="center" size="large">
                        <n-button size="large" @click="restart">
                            <template #icon><n-icon :component="RotateCcw" /></template>
                            返回首页
                        </n-button>
                        <n-button type="primary" color="#db2777" size="large" @click="showResult = false">
                            回顾详细解析
                        </n-button>
                    </n-space>
                </n-card>
            </div>

        </div>

        <!-- RIGHT PANEL: Sidebar -->
        <div class="sidebar-panel">
            
            <!-- User Stats Widget -->
            <n-card class="sidebar-card user-stats" :bordered="false" size="small">
                 <div class="widget-header">
                     <div class="icon-wrap purple">
                         <n-icon :component="BarChart3" />
                     </div>
                      <div>
                          <h3>学习状态</h3>
                          <p>今日已练习 {{ stats.timeSpentToday }} 分钟</p>
                      </div>
                  </div>
                  <div class="stats-body">
                      <div class="progress-section">
                          <div class="labels">
                              <span>语法掌握度</span>
                              <span>Level {{ stats.grammarLevel }}</span>
                          </div>
                          <n-progress type="line" :percentage="stats.grammarMastery" :height="6" color="#d946ef" rail-color="rgba(255,255,255,0.1)" :show-indicator="false" />
                      </div>
                      <div class="mini-stats">
                          <div class="mini-stat">
                              <div class="num">{{ stats.totalQuestions }}</div>
                              <div class="lbl">累计答题</div>
                          </div>
                          <div class="mini-stat">
                              <div class="num success">{{ stats.averageAccuracy }}%</div>
                              <div class="lbl">平均正确率</div>
                          </div>
                      </div>
                  </div>
            </n-card>

            <!-- Configuration Panel (Visible only in Setup) -->
            <n-card v-if="!isStarted" class="sidebar-card config-panel" :bordered="false" size="small">
                 <h3>
                    <n-icon :component="Settings" class="title-icon" />
                    练习配置
                 </h3>
                 
                 <div class="config-group">
                     <label>模式选择</label>
                     <div class="mode-list">
                         <div 
                            v-for="mode in practiceModes" 
                            :key="mode.id"
                            class="mode-item"
                            :class="{ active: selectedMode === mode.id }"
                            @click="selectMode(mode.id)"
                         >
                             <n-icon :component="mode.icon" :color="mode.color" />
                             <span>{{ mode.title }}</span>
                             <div class="radio-dot" v-if="selectedMode === mode.id"></div>
                         </div>
                     </div>
                 </div>

                 <div class="config-group">
                     <label>难度设定</label>
                     <div class="diff-tabs">
                         <div 
                            v-for="diff in difficulties" 
                            :key="diff.id"
                            class="diff-tab"
                            :class="{ active: selectedDifficulty === diff.id }"
                            @click="selectDifficulty(diff.id)"
                         >
                             {{ diff.title }}
                         </div>
                     </div>
                 </div>

                 <n-button 
                    block 
                    type="primary" 
                    color="#db2777" 
                    size="large" 
                    class="start-btn"
                    :loading="isLoading"
                    @click="startPractice"
                >
                    开始练习
                 </n-button>
            </n-card>

            <!-- Help/Tips Panel (Visible in Practice) -->
            <n-card v-else class="sidebar-card current-task" :bordered="false" size="small">
                 <div class="sidebar-title-row">
                    <h3>
                        <n-icon :component="HelpCircle" class="title-icon" />
                        当前任务
                    </h3>
                    <n-button v-if="!isSubmitted && !showResult" size="tiny" type="primary" color="#db2777" @click="submitPractice">
                        提交批改
                    </n-button>
                 </div>
                 <div class="task-info">
                     <div class="info-box">
                         <span class="lbl">正在攻克知识点</span>
                         <span class="val">{{ grammarTopics.find(t => t.id === selectedTopic)?.title }}</span>
                     </div>
                     
                     <div class="question-nav">
                         <span class="lbl">本组题目</span>
                         <div class="nav-grid">
                             <div 
                                v-for="n in totalQuestions" 
                                :key="n"
                                class="nav-item"
                                :class="{
                                    'active': n - 1 === currentQuestionIndex,
                                    'answered': userAnswers[n-1]?.selected !== null,
                                    'is-correct': isSubmitted && userAnswers[n-1]?.correct === true,
                                    'is-wrong': isSubmitted && userAnswers[n-1]?.correct === false
                                }"
                                @click="goToQuestion(n - 1)"
                             >
                                 {{ n }}
                             </div>
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
.page-container {
    height: calc(100vh - 100px);
    padding: 24px;
    box-sizing: border-box;
}
.main-layout {
    display: flex;
    gap: 24px;
    height: 100%;
}

.content-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-y: auto;
}

.sidebar-panel {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    padding-bottom: 20px;
}

/* Header */
.header-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    margin-bottom: 24px;
    border-radius: 16px;
}
.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header-content h1 {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(120deg, #c084fc, #db2777);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
}
.header-content .subtitle {
    font-size: 0.9rem;
    color: var(--secondary-text);
}

/* Topic Selection */
.topics-grid-container {
    padding-bottom: 20px;
}
.topic-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: var(--theme-transition);
    height: 100%;
    display: flex;
    flex-direction: column;
}
.topic-card:hover {
    background: var(--accent-fill);
    transform: translateY(-2px);
}
.topic-card.active {
    border-color: #db2777;
    background: rgba(219, 39, 119, 0.1);
    box-shadow: 0 0 0 1px #db2777;
}

.card-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
}
.icon-box {
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.topic-card h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-color);
}
.topic-card p {
    font-size: 0.9rem;
    color: var(--secondary-text);
    line-height: 1.4;
    flex-grow: 1;
}
.card-footer {
    margin-top: 16px;
}

/* Sidebar Widgets */
.sidebar-card {
    background: var(--card-bg);
    border-radius: 16px;
    border: 1px solid var(--card-border);
}
.widget-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.icon-wrap {
    padding: 8px;
    border-radius: 8px;
    background: var(--accent-fill);
}
.icon-wrap.purple { color: #d946ef; background: rgba(217, 70, 239, 0.1); }
.widget-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.widget-header p { font-size: 0.8rem; color: #a1a1aa; margin: 0; }

.labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: #a1a1aa; margin-bottom: 4px; }
.mini-stats { display: flex; gap: 12px; margin-top: 16px; }
.mini-stat { flex: 1; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px; text-align: center; }
.mini-stat .num { font-size: 1.1rem; font-weight: 700; color: #fff; }
.mini-stat .num.success { color: #4ade80; }
.mini-stat .lbl { font-size: 0.7rem; color: #71717a; text-transform: uppercase; }

.config-panel h3, .current-task h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    color: var(--text-color);
}
.sidebar-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.config-group { margin-bottom: 24px; }
.config-group label {
    display: block;
    font-size: 0.75rem;
    color: var(--secondary-text);
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
}
.mode-item {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-color);
    transition: var(--theme-transition);
    margin-bottom: 8px;
}
.mode-item:hover { background: var(--accent-fill); }
.mode-item.active { background: var(--accent-fill); border-color: rgba(99, 102, 241, 0.4); }
.radio-dot { width: 6px; height: 6px; border-radius: 50%; background: #db2777; margin-left: auto; }

.diff-tabs { display: flex; gap: 8px; }
.diff-tab { 
    flex: 1; 
    text-align: center; 
    padding: 8px; 
    border-radius: 6px; 
    font-size: 0.9rem; 
    cursor: pointer; 
    color: var(--secondary-text);
    border: 1px solid transparent;
    transition: var(--theme-transition);
}
.diff-tab:hover { background: var(--accent-fill); }
.diff-tab.active { background: var(--accent-fill); border-color: rgba(99, 102, 241, 0.4); color: var(--text-color); }

.start-btn { font-weight: 700; margin-top: 16px; }

/* Question Mode */
.question-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-box { background: var(--card-bg); border-radius: 20px; overflow: hidden; position: relative; border: 1px solid var(--card-border); transition: var(--theme-transition); }
.progress-bar-wrapper { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--card-border); }
.progress-fill { height: 100%; background: #db2777; transition: width 0.3s; }

.question-inner { padding: 40px; }
.meta-info { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.topic-badge { 
    background: rgba(219, 39, 119, 0.15); 
    color: #f472b6; 
    padding: 2px 8px; 
    border-radius: 4px; 
    font-size: 0.75rem; 
    font-weight: 700; 
}
.counter { font-size: 0.75rem; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }

.question-text { font-size: 1.8rem; font-weight: 500; color: var(--text-color); margin-bottom: 40px; line-height: 1.4; font-family: serif; }
.options-list { display: grid; gap: 16px; }

/* Gamification Styles */
.stars-row {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;
}
.star-filled {
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.xp-reward {
    text-align: center;
    margin: 20px 0;
}
.xp-badge {
    display: inline-block;
    background: linear-gradient(135deg, #fcd34d, #f59e0b);
    color: #78350f;
    padding: 4px 16px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    animation: slideUp 0.6s ease-out;
}
.xp-label {
    font-size: 0.8rem;
    color: #a1a1aa;
    margin-top: 4px;
}
@keyframes slideUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
.option-item {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 16px 20px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: var(--theme-transition);
}
.option-item:hover:not(.disabled) { border-color: #db2777; background: rgba(219, 39, 119, 0.05); }
.option-item.selected { border-color: #db2777; background: rgba(219, 39, 119, 0.1); }
.option-item.correct { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.option-item.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); opacity: 0.8; }
.option-item.disabled { cursor: default; }

.option-index {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    margin-right: 16px;
    font-size: 0.8rem; color: #a1a1aa;
}
.option-item.selected .option-index { border-color: #db2777; color: #db2777; }
.option-item.correct .option-index { border-color: #22c55e; color: #22c55e; }
.option-item.wrong .option-index { border-color: #ef4444; color: #ef4444; }
.option-content { font-size: 1.1rem; color: var(--text-color); }
.option-item.correct .option-content { color: #4ade80; font-weight: 500; }

.explanation-card { margin-top: 16px; background: var(--accent-fill); }
.explanation-content { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px;}
.exp-icon { padding: 8px; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-radius: 8px; }
.exp-text { flex: 1; }
.exp-text h4 { font-size: 0.85rem; color: var(--secondary-text); text-transform: uppercase; margin-bottom: 4px; }
.exp-text p { font-size: 1rem; color: var(--text-color); line-height: 1.5; }

/* Result */
.result-container { height: 100%; display: flex; align-items: center; justify-content: center; }
.result-card { width: 100%; max-width: 600px; text-align: center; background: var(--card-bg); padding: 40px; border-radius: 20px; border: 1px solid var(--card-border); }
.result-title { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
.result-subtitle { color: #a1a1aa; margin-bottom: 40px; }
.stats-grid { margin-bottom: 40px; }
.stat-box { background: var(--accent-fill); border-radius: 12px; padding: 20px; }
.stat-value { font-size: 2.5rem; font-weight: 800; color: var(--text-color); line-height: 1; margin-bottom: 8px; }
.stat-value.correct-rate { color: #4ade80; }
.stat-label { font-size: 0.8rem; color: #71717a; text-transform: uppercase; }
.dim { font-size: 1.2rem; color: var(--secondary-text); }

/* Task Sidebar Elements */
.info-box { background: var(--accent-fill); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border); margin-bottom: 16px; }
.info-box .lbl { display: block; font-size: 0.75rem; color: var(--secondary-text); margin-bottom: 4px; }
.info-box .val { font-size: 1rem; color: var(--text-color); font-weight: 700; }

.nav-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 8px; }
.nav-item { 
    aspect-ratio: 1; 
    border-radius: 6px; 
    background: var(--card-bg); 
    border: 1px solid var(--card-border);
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 0.8rem; 
    color: var(--secondary-text); 
    cursor: pointer;
    transition: var(--theme-transition);
}
.nav-item:hover { background: var(--accent-fill); color: var(--text-color); }
.nav-item.active { border: 2px solid #db2777; color: var(--text-color); z-index: 1; }
.nav-item.answered { background: var(--accent-fill); color: var(--text-color); }
.nav-item.is-correct { background: rgba(34, 197, 94, 0.4) !important; color: #fff; border: none; }
.nav-item.is-wrong { background: rgba(239, 68, 68, 0.4) !important; color: #fff; border: none; }

/* History Section */
.history-section { margin-top: 48px; }
.section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #e4e4e7; }
.history-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; cursor: pointer; transition: var(--theme-transition); }
.history-card:hover { background: var(--accent-fill); transform: translateY(-2px); border-color: #db2777; }
.history-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.history-card-body { color: var(--secondary-text); font-size: 0.9rem; }
.question-count { font-weight: 600; color: var(--text-color); }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }

/* GrammarView 专门的移动端优化 */
@media (max-width: 768px) {
  /* 页面容器 */
  .page-container {
    height: auto !important;
    padding: 12px !important;
  }
  
  /* 主布局改为垂直 */
  .main-layout {
    flex-direction: column !important;
    height: auto !important;
  }
  
  /* 侧边栏全宽并移到内容之后 - 话题选择优先 */
  .sidebar-panel {
    width: 100% !important;
    order: 1; /* 移到下方 */
    margin-top: 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column !important;
    gap: 16px !important;
  }
  
  /* 隐藏学习状态卡片，节省空间 */
  .user-stats {
    display: none !important;
  }
  
  /* 配置面板更紧凑 */
  .config-panel {
    padding: 12px !important;
  }
  
  .config-group {
    margin-bottom: 12px !important;
  }
  
  /* 当前任务卡片优化 */
  .current-task {
    padding: 12px !important;
  }
  
  .nav-grid {
    grid-template-columns: repeat(6, 1fr) !important;
    gap: 6px !important;
  }
  
  .nav-item {
    font-size: 0.75rem !important;
    padding: 4px !important;
  }
  
  /* 内容面板 */
  .content-panel {
    width: 100% !important;
    overflow-y: visible !important;
  }
  
  /* 头部卡片 */
  .header-card {
    margin-bottom: 12px !important;
  }
  
  .header-card :deep(.n-card__content) {
      padding: 12px 16px !important;
  }
  
  .header-content h1 {
    font-size: 1.25rem !important;
  }
  
  /* 题目网格在不同移动尺寸下的表现 */
  .topics-grid-container .n-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
    gap: 12px !important;
  }
  
  .topic-card {
      padding: 12px !important;
      border-radius: 12px !important;
  }
  
  .topic-card h3 {
      font-size: 0.95rem !important;
      margin-bottom: 4px !important;
  }
  
  .topic-card p {
      font-size: 0.75rem !important;
      line-height: 1.2 !important;
  }
  
  .card-top {
      margin-bottom: 8px !important;
  }
  
  .icon-box {
      padding: 6px !important;
  }
  
  .icon-box .n-icon {
      size: 20px !important;
  }
  
  /* 问题卡片 */
  .question-box {
    margin-bottom: 12px;
  }
  
  .question-inner {
    padding: 16px !important;
  }
  
  .question-text {
    font-size: 1.2rem !important;
  }
  
  /* 选项 */
  .option-item {
    padding: 12px !important;
  }
  
  .option-content {
    font-size: 0.95rem !important;
  }
  
  /* 解释卡片 */
  .explanation-card {
    margin-top: 12px !important;
  }
  
  /* 结果卡片 */
  .result-card {
    padding: 20px !important;
  }
  
  .result-title {
    font-size: 1.5rem !important;
  }
  
  .stat-value {
    font-size: 2rem !important;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.1rem !important;
  }
  
  .question-text {
    font-size: 1.1rem !important;
  }
  
  /* 题目导航改为5列 */
  .nav-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
  
  .option-content {
    font-size: 0.9rem !important;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
