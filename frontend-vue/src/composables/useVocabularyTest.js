import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import confetti from 'canvas-confetti'
import { BookOpen, Brain, Target } from 'lucide-vue-next'
import { useVocabularyStore } from '@/stores/vocabulary'
import { useUserStore } from '@/stores/user'
import { saveWrongQuestion, saveCorrectRecord } from '@/utils/errorBookHelper'
import { VOCABULARY_EXAM_TYPE_OPTIONS, resolvePreferredExamType } from '@/constants/examTypes'

const examTypeIconMap = {
  primary: '👶',
  middle: '📝',
  high: '🎓',
  cet4: '📘',
  cet6: '📙',
  ielts: '🌏',
  toefl: '🗽',
  postgraduate: '📚',
  gre: '🧠',
  tem4: '🎯',
  tem8: '🏅'
}

const examTypes = VOCABULARY_EXAM_TYPE_OPTIONS.map((item) => ({
  ...item,
  icon: examTypeIconMap[item.value] || '📖'
}))

const testModes = [
  { label: '中英互译', value: 'translation', icon: BookOpen, desc: '看英文选中文' },
  { label: '拼写测试', value: 'spelling', icon: Brain, desc: '根据释义拼写单词' },
  { label: '用法选择', value: 'usage', icon: Target, desc: '根据语境选词填空' }
]

const difficulties = [
  { label: '基础', value: 'easy' },
  { label: '中级', value: 'medium' },
  { label: '高级', value: 'hard' },
  { label: '混合', value: 'mixed' }
]

const counts = [10, 20, 30, 50]

const shuffleItems = items => [...items].sort(() => 0.5 - Math.random())
const normalizeAnswer = value => (value ?? '').toString().toLowerCase().trim()
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const uniqueValues = items => [...new Set(items.filter(item => item !== undefined && item !== null && item !== ''))]

export function useVocabularyTest() {
  const router = useRouter()
  const message = useMessage()
  const vocabularyStore = useVocabularyStore()
  const userStore = useUserStore()

  const step = ref('setup')
  const currentQuestionIndex = ref(0)
  const answers = ref({})
  const score = ref(0)
  const generatedQuestions = ref([])
  const loading = ref(false)
  const showTutor = ref(false)
  const showAll = ref(false)

  const settings = ref({
    examType: resolvePreferredExamType(examTypes, userStore.examType),
    mode: 'translation',
    difficulty: 'medium',
    count: 20
  })

  const currentQuestion = computed(() => generatedQuestions.value[currentQuestionIndex.value] || null)

  const progressPercent = computed(() => {
    if (!generatedQuestions.value.length) {
      return 0
    }
    return ((currentQuestionIndex.value + 1) / generatedQuestions.value.length) * 100
  })

  const tutorContext = computed(() => {
    if (!currentQuestion.value) {
      return null
    }

    return {
      question: currentQuestion.value.display,
      options: currentQuestion.value.options,
      correctAnswer: currentQuestion.value.correct,
      userAnswer: answers.value[currentQuestionIndex.value],
      topic: '词汇测试',
      word: currentQuestion.value.word,
      phonetic: currentQuestion.value.phonetic,
      type: currentQuestion.value.type,
      module: 'vocabulary'
    }
  })

  const createReviewItem = (question, index) => {
    const userAnswer = answers.value[index]
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(question.correct)

    return {
      ...question,
      sourceIndex: index,
      isCorrect,
      userAnswerDisplay: userAnswer || '未作答'
    }
  }

  const wrongAnswers = computed(() => {
    return generatedQuestions.value
      .map((question, index) => createReviewItem(question, index))
      .filter(question => !question.isCorrect)
  })

  const reviewQuestions = computed(() => {
    if (showAll.value) {
      return generatedQuestions.value.map((question, index) => createReviewItem(question, index))
    }
    return wrongAnswers.value
  })

  const updateSetting = (key, value) => {
    settings.value[key] = value
  }

  const pickDistractors = (allWords, currentWord, selector) => {
    return uniqueValues(
      shuffleItems(allWords.filter(word => word.word !== currentWord.word)).map(selector)
    ).slice(0, 3)
  }

  const createQuestion = (word, index, allWords) => {
    if (settings.value.mode === 'spelling') {
      return {
        id: index,
        word: word.word,
        phonetic: word.phonetic,
        display: word.meaning,
        correct: word.word,
        options: [],
        type: 'spelling'
      }
    }

    if (settings.value.mode === 'usage') {
      let displaySentence = word.example || `Study the word "${word.word}" to improve your vocabulary.`
      if (word.example) {
        displaySentence = word.example.replace(new RegExp(escapeRegExp(word.word), 'gi'), '____')
      }

      return {
        id: index,
        word: word.word,
        phonetic: word.phonetic,
        display: displaySentence,
        translation: word.exampleTranslation || word.exampleCn || word.meaning,
        correct: word.word,
        options: shuffleItems(uniqueValues([word.word, ...pickDistractors(allWords, word, item => item.word)])),
        type: 'usage'
      }
    }

    return {
      id: index,
      word: word.word,
      phonetic: word.phonetic,
      display: word.word,
      correct: word.meaning,
      options: shuffleItems(uniqueValues([word.meaning, ...pickDistractors(allWords, word, item => item.meaning)])),
      type: 'choice'
    }
  }

  const resetSession = () => {
    step.value = 'setup'
    currentQuestionIndex.value = 0
    answers.value = {}
    score.value = 0
    generatedQuestions.value = []
    showAll.value = false
  }

  const generateQuestions = async () => {
    loading.value = true

    try {
      const fetchCount = Math.max(settings.value.count * 4, 20)
      let allWords = await vocabularyStore.fetchRecommended(settings.value.examType, fetchCount)
      allWords = (allWords || []).filter(word => word?.word && (word.meaning || word.example || word.exampleTranslation || word.exampleCn))

      if (!allWords.length) {
        message.error('暂无该类型词汇数据，请联系管理员导入')
        return
      }

      const shuffledWords = shuffleItems(allWords)
      let selectedWords = []

      if (settings.value.mode === 'usage') {
        const wordsWithExample = shuffledWords.filter(word => word.example && word.example.length > 5)
        if (wordsWithExample.length >= settings.value.count) {
          selectedWords = wordsWithExample.slice(0, settings.value.count)
        } else {
          const otherWords = shuffledWords.filter(word => !wordsWithExample.includes(word))
          selectedWords = [...wordsWithExample, ...otherWords.slice(0, settings.value.count - wordsWithExample.length)]
        }
      } else {
        selectedWords = shuffledWords.slice(0, settings.value.count)
      }

      if (!selectedWords.length) {
        message.error('当前条件下暂时无法生成测试题目')
        return
      }

      generatedQuestions.value = selectedWords.map((word, index) => createQuestion(word, index, allWords))
      currentQuestionIndex.value = 0
      answers.value = {}
      showAll.value = false
      step.value = 'testing'
    } catch (error) {
      console.error('Failed to generate questions:', error)
      message.error('生成试卷失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const updateAnswer = value => {
    answers.value[currentQuestionIndex.value] = value
  }

  const nextQuestion = () => {
    if (currentQuestionIndex.value < generatedQuestions.value.length - 1) {
      currentQuestionIndex.value += 1
    }
  }

  const handleSpellingKeyup = event => {
    if (event.key === 'Enter') {
      nextQuestion()
    }
  }

  const selectAnswer = option => {
    updateAnswer(option)
    if (currentQuestionIndex.value < generatedQuestions.value.length - 1) {
      setTimeout(() => {
        nextQuestion()
      }, 300)
    }
  }

  const jumpToQuestion = index => {
    currentQuestionIndex.value = index
  }

  const submitExam = async () => {
    if (!generatedQuestions.value.length) {
      return
    }

    let correctCount = 0
    const wrongQuestions = []
    const correctQuestions = []

    generatedQuestions.value.forEach((question, index) => {
      const userAnswer = answers.value[index]
      const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(question.correct)
      const payload = {
        contentId: 0,
        contentType: 'vocabulary',
        question: `${question.word} (${question.phonetic})`,
        userAnswer: userAnswer || '未作答',
        correctAnswer: question.correct,
        timeSpent: 0,
        score: isCorrect ? 100 : 0,
        originalContent: {
          word: question.word,
          phonetic: question.phonetic,
          options: question.options || []
        }
      }

      if (isCorrect) {
        correctCount += 1
        correctQuestions.push(payload)
      } else {
        wrongQuestions.push({
          ...payload,
          originalContent: {
            ...payload.originalContent,
            explanation: `正确释义是：${question.correct}`
          }
        })
      }
    })

    score.value = Math.round((correctCount / generatedQuestions.value.length) * 100)
    showAll.value = false
    step.value = 'result'

    setTimeout(async () => {
      console.log(`[词汇测试] 保存: ${wrongQuestions.length} 错 | ${correctQuestions.length} 对`)
      for (const question of wrongQuestions) {
        await saveWrongQuestion(question)
      }
      for (const question of correctQuestions) {
        await saveCorrectRecord(question)
      }
    }, 500)

    if (score.value >= 80) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#10b981']
      })
    }
  }

  const exitTest = () => {
    resetSession()
  }

  const restart = () => {
    resetSession()
  }

  const goHome = () => {
    router.push('/dashboard')
  }

  const openAITutor = (index = null) => {
    if (index !== null) {
      currentQuestionIndex.value = index
    }
    showTutor.value = true
  }

  const closeAITutor = () => {
    showTutor.value = false
  }

  const toggleShowAll = () => {
    showAll.value = !showAll.value
    if (showAll.value) {
      nextTick(() => {
        const card = document.querySelector('.wrong-answers-card')
        card?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return {
    answers,
    closeAITutor,
    counts,
    currentQuestion,
    currentQuestionIndex,
    difficulties,
    examTypes,
    exitTest,
    generateQuestions,
    generatedQuestions,
    goHome,
    handleSpellingKeyup,
    jumpToQuestion,
    loading,
    nextQuestion,
    openAITutor,
    progressPercent,
    restart,
    reviewQuestions,
    score,
    selectAnswer,
    settings,
    showAll,
    showTutor,
    step,
    submitExam,
    testModes,
    toggleShowAll,
    tutorContext,
    updateAnswer,
    updateSetting,
    wrongAnswers
  }
}
