import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { useTypewriter } from '@/composables/useTypewriter'
import { decryptPayload } from '@/utils/crypto'

export function useWritingPractice(options = {}) {
  const message = options.message
  const writingStore = options.writingStore

  const step = ref('setup')
  const isLoading = ref(false)
  const essayContent = ref('')

  const selectedTopic = ref(null)
  const analysisResult = ref(null)
  const historyTopics = ref([])

  const historyPage = ref(1)
  const historyPageSize = ref(6)
  const historyTotal = ref(0)
  const isFocusMode = ref(false)
  const showDraftSaved = ref(false)

  const displayScore = ref(0)
  const showShare = ref(false)

  const shareContent = computed(() => ({
    title: `我在 LearnSphere AI 完成了写作练习！`,
    description: `刚刚完成了「${selectedTopic.value?.title || '写作练习'}」，AI 评分：${analysisResult.value?.score || 0} 分！快来一起学习吧！`,
    url: window.location.href
  }))

  const countUpScore = (target) => {
    displayScore.value = 0
    const duration = 1500
    const startTime = performance.now()
    const stepTick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      displayScore.value = Math.floor(progress * target)
      if (progress < 1) {
        requestAnimationFrame(stepTick)
      }
    }
    requestAnimationFrame(stepTick)
  }

  watch([historyPage, historyPageSize], () => {
    fetchHistory()
  })

  const settings = ref({
    examType: 'cet4',
    mode: 'essay',
    timeLimit: 30
  })

  const examTypes = [
    { value: 'cet4', label: 'CET-4', icon: '4' },
    { value: 'cet6', label: 'CET-6', icon: '6' },
    { value: 'ielts', label: 'IELTS', icon: 'I' },
    { value: 'toefl', label: 'TOEFL', icon: 'T' }
  ]

  const writingModes = [
    { value: 'essay', label: '议论文', desc: 'Discuss both views & give opinion', icon: 'FileEdit' },
    { value: 'chart', label: '图表作文', desc: 'Describe trends in charts/graphs', icon: 'Target' },
    { value: 'letter', label: '应用文/书信', desc: 'Formal/Informal letters', icon: 'MessageSquare' }
  ]

  const writingIconMap = options.writingIconMap || {}
  const writingModeOptions = computed(() => writingModes.map(item => ({
    ...item,
    icon: writingIconMap[item.icon] || null
  })))

  const timeLimits = [
    { value: 0, label: '不限时' },
    { value: 30, label: '30分钟' },
    { value: 45, label: '45分钟' },
    { value: 60, label: '60分钟' }
  ]

  const timeLeft = ref(0)
  let timerInterval = null

  const isWritingInProgress = computed(() => step.value === 'writing' && essayContent.value.length > 0)

  const handleBeforeUnload = (event) => {
    if (isWritingInProgress.value) {
      event.preventDefault()
      event.returnValue = '写作正在进行中，确定要离开吗？你的文章内容将会丢失。'
      return event.returnValue
    }
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    fetchHistory()

    if (writingStore?.currentPrompt && writingStore.currentMode === 'writing') {
      if (writingStore.isExpired()) {
        message.warning('检测到练习数据已过期，已为您清除')
        writingStore.clearPersistedState()
      } else {
        selectedTopic.value = decryptPayload(writingStore.currentPrompt)
        essayContent.value = writingStore.userEssay
        step.value = 'writing'
        setPromptImmediate(selectedTopic.value.prompt)
        message.info('检测到未完成的练习，已为您恢复进度')
      }
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

  watch(step, (newStep) => {
    if (newStep === 'writing' && settings.value.timeLimit > 0) {
      timeLeft.value = settings.value.timeLimit * 60
      startTimer()
    } else {
      stopTimer()
    }
  })

  const startTimer = () => {
    stopTimer()
    timerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        stopTimer()
        message.warning('时间到！请尽快停止写作。')
      }
    }, 1000)
  }

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  onUnmounted(() => {
    stopTimer()
  })

  const timeLeftDisplay = computed(() => {
    if (timeLeft.value <= 0) return '00:00'
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  const updateSetting = (key, value) => {
    settings.value[key] = value
  }

  const paginatedHistory = computed(() => historyTopics.value)

  const fetchHistory = async () => {
    try {
      const res = await aiApi.getWritingHistory(historyPage.value, historyPageSize.value)
      if (res.code === 200) {
        if (res.data.records) {
          historyTopics.value = decryptPayload(res.data.records)
          historyTotal.value = res.data.total
        } else {
          historyTopics.value = decryptPayload(res.data || [])
          historyTotal.value = historyTopics.value.length
        }
      }
    } catch (e) {
      console.error('Failed to fetch writing history', e)
    }
  }

  const {
    displayedText: displayedPrompt,
    isTyping: isPromptTyping,
    startTyping: startPromptTyping,
    setImmediate: setPromptImmediate
  } = useTypewriter('', 20)

  const startTime = ref(Date.now())

  const loadHistoryTopic = (topic) => {
    selectedTopic.value = decryptPayload(topic)
    essayContent.value = ''
    step.value = 'writing'
    startTime.value = Date.now()
    message.success(`已加载: ${topic.title}`)
    startPromptTyping(topic.prompt)

    writingStore.startWriting(topic, settings.value.examType, settings.value.mode)
  }

  const generateTopic = async () => {
    isLoading.value = true
    try {
      const res = await aiApi.generateWriting({
        examType: settings.value.examType,
        mode: settings.value.mode
      })
      if (res.code === 200 && res.data) {
        selectedTopic.value = decryptPayload(res.data)
        essayContent.value = ''
        step.value = 'writing'
        startTime.value = Date.now()
        startPromptTyping(selectedTopic.value.prompt)
        message.success('题目生成成功')

        writingStore.startWriting(selectedTopic.value, settings.value.examType, settings.value.mode)
      } else {
        message.error('生成失败')
      }
    } catch (e) {
      console.error('生成题目失败', e)
    } finally {
      isLoading.value = false
    }
  }

  const submitEssay = async () => {
    isLoading.value = true
    try {
      const res = await aiApi.evaluateWriting({
        topic: selectedTopic.value.title,
        content: essayContent.value
      })
      if (res.code === 200 && res.data) {
        analysisResult.value = decryptPayload(res.data)
        step.value = 'result'
        message.success('批改完成')

        try {
          let spentTime = Math.floor((Date.now() - startTime.value) / 1000)
          if (settings.value.timeLimit > 0) {
            const usedTime = (settings.value.timeLimit * 60) - timeLeft.value
            if (usedTime > 0) spentTime = usedTime
          }

          await learningApi.createRecord({
            contentId: selectedTopic.value.id || 0,
            contentType: 'writing',
            isCorrect: analysisResult.value.score >= 60 ? 1 : 0,
            answer: essayContent.value,
            correctAnswer: 'N/A',
            score: analysisResult.value.score,
            masteryLevel: Math.floor(analysisResult.value.score / 20),
            timeSpent: Math.max(10, spentTime),
            originalContent: JSON.stringify({
              topic: selectedTopic.value,
              feedback: analysisResult.value.feedback
            })
          })
        } catch (e) {
          console.error('Failed to save writing record', e)
        }

        writingStore.submitEvaluation(res.data)

        nextTick(() => {
          countUpScore(res.data.score)
        })
      } else {
        message.error('批改失败')
      }
    } catch (e) {
      console.error('提交作文失败', e)
    } finally {
      isLoading.value = false
    }
  }

  const restart = () => {
    step.value = 'setup'
    essayContent.value = ''
    selectedTopic.value = null
    analysisResult.value = null
    timeLeft.value = 0
    stopTimer()
    writingStore.clearPersistedState()
  }

  const wordCount = computed(() => {
    if (!essayContent.value) return 0
    const text = essayContent.value
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text ? text.split(/\s+/).filter((w) => w).length : 0
  })

  let saveTimeout = null
  watch(essayContent, () => {
    if (step.value === 'writing') {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        showDraftSaved.value = true
        setTimeout(() => { showDraftSaved.value = false }, 2000)
      }, 1000)
    }
  })

  watch(essayContent, (newVal) => {
    if (step.value === 'writing') {
      writingStore.saveDraft(newVal)
    }
  })

  const showTutor = ref(false)
  const tutorContext = computed(() => {
    if (!selectedTopic.value) return null

    return {
      question: selectedTopic.value.prompt,
      topic: selectedTopic.value.title || '写作练习',
      userAnswer: essayContent.value,
      explanation: analysisResult.value ? JSON.stringify(analysisResult.value.feedback) : null,
      module: 'writing'
    }
  })

  const openAITutor = () => {
    showTutor.value = true
  }

  return {
    step,
    isLoading,
    essayContent,
    selectedTopic,
    analysisResult,
    historyPage,
    historyPageSize,
    historyTotal,
    paginatedHistory,
    isFocusMode,
    showDraftSaved,
    displayScore,
    showShare,
    shareContent,
    settings,
    examTypes,
    writingModes: writingModeOptions,
    timeLimits,
    timeLeft,
    timeLeftDisplay,
    displayedPrompt,
    isPromptTyping,
    setPromptImmediate,
    wordCount,
    showTutor,
    tutorContext,
    updateSetting,
    loadHistoryTopic,
    generateTopic,
    submitEssay,
    restart,
    openAITutor
  }
}
