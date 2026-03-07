import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { fireConfetti, fireFireworks } from '@/utils/confetti'
import { useGrammarStore } from '@/stores/grammar'
import { decryptPayload } from '@/utils/crypto'
import { grammarTopics, practiceModes, difficulties } from '@/constants/grammarPractice'

export function useGrammarPractice() {
  const message = useMessage()
  // --- Pinia Store ---
  const grammarStore = useGrammarStore()
  
  // --- State ---
  const selectedTopic = ref(grammarStore.selectedTopic || grammarTopics[0].id)
  const selectedMode = ref('comprehensive')
  const selectedDifficulty = ref(grammarStore.selectedDifficulty || 'medium')
  const isLoading = ref(false)
  const currentLogId = ref(null)
  
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
  const tutorSessionId = ref(null)
  const learningAdvice = ref(null)
  const relatedTopics = ref([])
  
  const handleSessionCreated = (sessionId) => {
      tutorSessionId.value = sessionId
      console.log('AI Tutor session created:', sessionId)
  }
  
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
      topic: grammarTopics.find(t => t.id === selectedTopic.value)?.title || '语法',
      module: 'grammar'
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
              currentLogId.value = decryptedData.logId
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
      
      // 更新 Store 状态
      grammarStore.submitExercise()
      
      // Check performance and get learning advice & related topics
      const accuracyRate = correctCount / questions.value.length
      const topicName = grammarTopics.find(t => t.id === selectedTopic.value)?.title
      
      // Record practice
      try {
          await aiApi.recordPractice({
              topic: topicName,
              category: 'grammar',
              isCorrect: accuracyRate >= 0.6
          })
      } catch (e) {
          console.error('Failed to record practice', e)
      }
  
      if (accuracyRate < 0.8) {
          // Less than 80% correct, show related topics
          try {
              const resTopics = await aiApi.getRelatedTopics(topicName)
              if (resTopics.code === 200) relatedTopics.value = resTopics.data || []
          } catch (e) { console.error('Failed to get related topics', e) }
          
          // Show learning advice
          try {
              const resAdvice = await aiApi.getLearningAdvice(topicName)
              if (resAdvice.code === 200 && resAdvice.data) learningAdvice.value = resAdvice.data
          } catch (e) { console.error('Failed to get learning advice', e) }
      } else {
          relatedTopics.value = []
          learningAdvice.value = null
      }
      
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
      learningAdvice.value = null
      relatedTopics.value = []
  }
  
  // Open AI Tutor
  const openAITutor = () => {
      showTutor.value = true
  }

  return {
    grammarTopics,
    practiceModes,
    difficulties,
    selectedTopic,
    selectedMode,
    selectedDifficulty,
    isLoading,
    currentLogId,
    isStarted,
    isSubmitted,
    currentQuestionIndex,
    userAnswers,
    questions,
    score,
    showResult,
    historyExercises,
    earnedXP,
    stats,
    showTutor,
    tutorSessionId,
    learningAdvice,
    relatedTopics,
    handleSessionCreated,
    tutorContext,
    historyPage,
    historyPageSize,
    historyTotal,
    paginatedHistory,
    selectedAnswer,
    hasAnswered,
    totalQuestions,
    currentQuestion,
    selectTopic,
    selectMode,
    selectDifficulty,
    fetchHistory,
    fetchStats,
    loadHistoryExercise,
    startPractice,
    selectAnswerIdx,
    goToQuestion,
    submitPractice,
    nextQuestion,
    restart,
    openAITutor
  }
}
