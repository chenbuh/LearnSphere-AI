import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { useTypewriter } from '@/composables/useTypewriter'
import { decryptPayload } from '@/utils/crypto'

export function useReadingPractice(options = {}) {
  const message = options.message
  const readingStore = options.readingStore

  const { displayedText, isTyping, startTyping, setImmediate } = useTypewriter('', 15)

  const step = ref('setup')
  const isLoading = ref(false)
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const score = ref(0)
  const article = ref(null)
  const currentLogId = ref(null)

  const showShare = ref(false)
  const shareContent = computed(() => {
    if (!article.value) return {}

    return {
      title: '我在 LearnSphere AI 完成了阅读练习！',
      description: `刚刚阅读了《${article.value.title}》，来源：${article.value.source}，答对率 ${score.value}%！快来一起学习吧！`,
      url: window.location.href
    }
  })

  const historyArticles = ref([])
  const historyPage = ref(1)
  const historyPageSize = ref(6)
  const historyTotal = ref(0)

  const settings = ref({
    source: 'economist',
    category: 'tech',
    difficulty: 'medium',
    length: 'medium'
  })

  const sources = [
    { label: '经济学人', value: 'economist', icon: '📈' },
    { label: '纽约时报', value: 'nyt', icon: '📰' },
    { label: '科学美国人', value: 'scientific', icon: '🧬' },
    { label: '国家地理', value: 'natgeo', icon: '🌍' },
    { label: '经典名著', value: 'classic', icon: '📚' },
    { label: '现代小说', value: 'fiction', icon: '🖊️' }
  ]

  const categories = [
    { label: '科技前沿', value: 'tech', icon: 'Sparkles', desc: 'AI, Space, Bio' },
    { label: '商业财经', value: 'business', icon: 'Layers', desc: 'Market, Economy' },
    { label: '人文历史', value: 'culture', icon: 'Feather', desc: 'History, Art' },
    { label: '自然环境', value: 'environment', icon: 'Leaf', desc: 'Nature, Climate' },
    { label: '社会生活', value: 'society', icon: 'Users', desc: 'Culture, People' },
    { label: '艺术文学', value: 'arts', icon: 'Palette', desc: 'Design, Literature' },
    { label: '健康医疗', value: 'health', icon: 'HeartPulse', desc: 'Medicine, Wellness' },
    { label: '基础科学', value: 'science', icon: 'Dna', desc: 'Physics, Chem' }
  ]

  const difficulties = [
    { label: '入门', value: 'easy' },
    { label: '进阶', value: 'medium' },
    { label: '精通', value: 'hard' }
  ]

  const lengths = [
    { label: '短篇', value: 'short' },
    { label: '中篇', value: 'medium' },
    { label: '长篇', value: 'long' }
  ]

  const isReadingInProgress = computed(() => step.value === 'reading' && Object.keys(answers.value).length > 0)

  const handleBeforeUnload = (event) => {
    if (isReadingInProgress.value) {
      event.preventDefault()
      event.returnValue = '阅读练习正在进行中，确定要离开吗？你的答题进度将会丢失。'
      return event.returnValue
    }
  }

  const updateSetting = (key, value) => {
    settings.value[key] = value
  }

  const paginatedHistory = computed(() => historyArticles.value)

  watch([historyPage, historyPageSize], () => {
    fetchHistory()
  })

  const handleKeydown = (event) => {
    if (step.value !== 'reading') return

    if (event.key === 'ArrowRight') {
      nextQuestion()
    } else if (event.key === 'ArrowLeft') {
      prevQuestion()
    } else if (event.key >= '1' && event.key <= '4') {
      const index = parseInt(event.key, 10) - 1
      selectAnswer(index)
    }
  }

  onMounted(() => {
    fetchHistory()
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeydown)

    if (readingStore.currentArticle && readingStore.currentMode === 'reading') {
      if (readingStore.isExpired()) {
        message.warning('检测到练习数据已过期，已为您清除')
        readingStore.clearPersistedState()
      } else if (readingStore.isSubmitted) {
        readingStore.clearPersistedState()
      } else {
        article.value = decryptPayload(readingStore.currentArticle)
        if (!article.value.content && article.value.passage) {
          article.value.content = article.value.passage
        }
        answers.value = {}
        if (Array.isArray(readingStore.userAnswers)) {
          readingStore.userAnswers.forEach((answer, index) => {
            if (answer !== null) answers.value[index] = answer
          })
        }
        currentQuestionIndex.value = readingStore.currentQuestionIndex

        step.value = 'reading'
        message.info('检测到未完成的练习，已为您恢复进度')
        setImmediate(article.value.content)
      }
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('keydown', handleKeydown)
  })

  const fetchHistory = async () => {
    try {
      const res = await aiApi.getReadingHistory(historyPage.value, historyPageSize.value)
      if (res.code === 200) {
        if (res.data.records) {
          historyArticles.value = decryptPayload(res.data.records)
          historyTotal.value = res.data.total
        } else {
          historyArticles.value = decryptPayload(res.data || [])
          historyTotal.value = historyArticles.value.length
        }
      }
    } catch (error) {
      console.error('Failed to fetch history', error)
    }
  }

  const startTime = ref(Date.now())

  const loadArticle = (item) => {
    startTime.value = Date.now()
    article.value = decryptPayload(item)
    if (!article.value.content && article.value.passage) {
      article.value.content = article.value.passage
    }
    answers.value = {}
    currentQuestionIndex.value = 0
    score.value = 0
    step.value = 'reading'
    startTyping(article.value.content || '')

    readingStore.startReading(item, settings.value.difficulty, settings.value.category)
  }

  const generateReading = async () => {
    isLoading.value = true
    try {
      const res = await aiApi.generateReading(settings.value)
      if (res.code === 200 && res.data) {
        const decryptedData = decryptPayload(res.data)
        article.value = decryptedData
        currentLogId.value = decryptedData.logId

        if (!article.value.questions || article.value.questions.length === 0) {
          message.warning('未生成题目，使用模拟数据')
        }

        if (!article.value.content && article.value.passage) {
          article.value.content = article.value.passage
        }

        startTime.value = Date.now()
        currentQuestionIndex.value = 0
        answers.value = {}
        step.value = 'reading'

        startTyping(article.value.content || '')

        message.success('阅读材料生成成功')
        fetchHistory()

        readingStore.startReading(article.value, settings.value.difficulty, settings.value.category)
      } else {
        message.error('生成失败')
      }
    } catch (error) {
      console.error('生成失败', error)
    } finally {
      isLoading.value = false
    }
  }

  const selectAnswer = (optionIndex) => {
    answers.value[currentQuestionIndex.value] = optionIndex

    const questionCount = article.value?.questions?.length || 0
    const flattenedAnswers = new Array(questionCount).fill(null)
    Object.keys(answers.value).forEach((index) => {
      flattenedAnswers[index] = answers.value[index]
    })
    readingStore.userAnswers = flattenedAnswers
    readingStore.timestamp = Date.now()
  }

  const nextQuestion = () => {
    if (currentQuestionIndex.value < article.value.questions.length - 1) {
      currentQuestionIndex.value += 1
      readingStore.currentQuestionIndex = currentQuestionIndex.value
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value -= 1
      readingStore.currentQuestionIndex = currentQuestionIndex.value
    }
  }

  const submitExam = async () => {
    let correctCount = 0
    const questions = article.value.questions
    const totalDuration = Math.floor((Date.now() - startTime.value) / 1000)
    const timePerQuestion = Math.max(1, Math.floor(totalDuration / questions.length))

    for (let index = 0; index < questions.length; index += 1) {
      const question = questions[index]
      const userAnswer = answers.value[index]
      const isCorrect = userAnswer === question.correct

      if (isCorrect) correctCount += 1

      try {
        const payload = {
          contentId: article.value.id || index,
          contentType: 'reading',
          isCorrect: isCorrect ? 1 : 0,
          answer: userAnswer !== undefined ? String(userAnswer) : '-1',
          correctAnswer: String(question.correct),
          masteryLevel: isCorrect ? 3 : 1,
          timeSpent: timePerQuestion,
          originalContent: JSON.stringify({
            title: article.value.title,
            content: article.value.content.substring(0, 500),
            question
          })
        }
        await learningApi.createRecord(payload)
        console.log(`Record ${index + 1} saved successfully`)
      } catch (error) {
        console.error(`Failed to save record ${index + 1}`, error)
      }
    }

    score.value = Math.round((correctCount / questions.length) * 100)
    step.value = 'result'
    readingStore.submitReading()
  }

  const restart = () => {
    step.value = 'setup'
    answers.value = {}
    currentQuestionIndex.value = 0
    score.value = 0
    article.value = null
    currentLogId.value = null
    showShare.value = false
    readingStore.clearPersistedState()
  }

  const progressPercent = computed(() => {
    if (!article.value || article.value.questions.length === 0) return 0
    return ((currentQuestionIndex.value + 1) / article.value.questions.length) * 100
  })

  const skipTyping = () => {
    if (isTyping.value && article.value) {
      setImmediate(article.value.content)
    }
  }

  const calculateWordCount = (content) => {
    if (!content) return 0
    const text = content.replace(/<[^>]*>/g, ' ')
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const realWordCount = computed(() => {
    if (!article.value || !article.value.content) return 0
    return calculateWordCount(article.value.content)
  })

  const showTutor = ref(false)
  const tutorContext = computed(() => {
    if (!article.value || !article.value.questions || !article.value.questions[currentQuestionIndex.value]) return null

    const questionIndex = currentQuestionIndex.value
    const question = article.value.questions[questionIndex]
    const userAnswerIndex = answers.value[questionIndex]

    return {
      question: question.text,
      options: question.options,
      correctAnswer: question.options[question.correct] || '',
      userAnswer: userAnswerIndex !== undefined ? question.options[userAnswerIndex] : null,
      explanation: question.explanation,
      topic: article.value.title || '阅读理解',
      content: article.value.content,
      module: 'reading'
    }
  })

  const openAITutor = (index = null) => {
    if (index !== null) {
      currentQuestionIndex.value = index
    }
    showTutor.value = true
  }

  const categoryIconMap = options.categoryIconMap || {}
  const categoryOptions = computed(() => categories.map(item => ({
    ...item,
    icon: categoryIconMap[item.icon] || null
  })))

  return {
    displayedText,
    isTyping,
    step,
    isLoading,
    currentQuestionIndex,
    answers,
    score,
    article,
    currentLogId,
    showShare,
    shareContent,
    historyArticles,
    paginatedHistory,
    historyPage,
    historyPageSize,
    historyTotal,
    settings,
    sources,
    categories: categoryOptions,
    difficulties,
    lengths,
    progressPercent,
    realWordCount,
    showTutor,
    tutorContext,
    updateSetting,
    loadArticle,
    generateReading,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitExam,
    restart,
    skipTyping,
    calculateWordCount,
    openAITutor
  }
}
