import { computed, onMounted, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useVocabularyStore } from '@/stores/vocabulary'
import { fetchExampleFromApi, generateExampleByCategory, translateExampleToChinese } from '@/utils/dictionaryApi'
import { vocabularyApi } from '@/api/vocabulary'
import taskTracker from '@/utils/taskTracker'
import logger from '@/utils/logger'
import request from '@/utils/request'
import { decryptPayload } from '@/utils/crypto'
import { useTextAudio } from '@/composables/useTextAudio'

const examOptions = [
  { label: 'CET-4', value: 'cet4' },
  { label: 'CET-6', value: 'cet6' },
  { label: 'IELTS', value: 'ielts' },
  { label: 'TOEFL', value: 'toefl' },
  { label: 'GRE', value: 'gre' },
  { label: 'Postgraduate', value: 'postgraduate' },
  { label: 'TEM-4', value: 'tem4' },
  { label: 'TEM-8', value: 'tem8' }
]

const DEFINITION_PLACEHOLDERS = [
  'Detailed definition unavailable',
  'Definition unavailable',
  'unavailable offline'
]

export function useVocabularyPractice() {
  const vocabStore = useVocabularyStore()
  const message = useMessage()
  const { playAudio } = useTextAudio({
    logger,
    notifyWarning: (text) => message.warning(text)
  })

  const activeTab = ref('browse')
  const loading = ref(false)
  const dailyTask = ref(null)

  const searchText = ref('')
  const selectedExam = ref('cet4')
  const showDetailModal = ref(false)
  const currentDetailWord = ref(null)
  const browseWords = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = 12

  const sessionWords = ref([])
  const sessionIndex = ref(0)
  const isFlipped = ref(false)
  const sessionComplete = ref(false)
  const sessionStats = ref({ correct: 0, wrong: 0 })

  const mnemonicLoading = ref(false)
  const mnemonicText = ref('')
  const showTutor = ref(false)

  const lastBrowseQueryKey = ref('')

  const stats = computed(() => vocabStore.stats)
  const paginatedBrowseWords = computed(() => browseWords.value)
  const currentLearnWord = computed(() => {
    if (!sessionWords.value.length || sessionIndex.value >= sessionWords.value.length) {
      return null
    }
    return sessionWords.value[sessionIndex.value]
  })

  const tutorContext = computed(() => {
    const word = activeTab.value === 'learn' ? currentLearnWord.value : currentDetailWord.value
    if (!word) return null

    return {
      type: 'vocabulary_learning',
      word: word.word,
      phonetic: word.phonetic,
      meaning: word.meaning || word.translation,
      examples: word.examples,
      topic: 'Vocabulary Learning',
      examType: selectedExam.value,
      module: 'vocabulary'
    }
  })

  const getBrowseQueryKey = () => `${selectedExam.value}|${page.value}|${searchText.value.trim()}`

  const isPlaceholderDefinition = (text) => !text || DEFINITION_PLACEHOLDERS.some((placeholder) => text.includes(placeholder))

  const loadBrowseData = async () => {
    loading.value = true
    try {
      const params = {
        examType: selectedExam.value,
        page: page.value,
        pageSize,
        keyword: searchText.value
      }
      const response = await vocabularyApi.getVocabularyList(params)
      const decryptedData = decryptPayload(response.data)
      const { records, total: totalCount } = decryptedData

      browseWords.value = await Promise.all(records.map(async (item) => {
        const cleanDefinition = (text) => {
          if (!text) return null
          const placeholders = [
            'Detailed definition unavailable offline',
            'Definition unavailable',
            'unavailable offline',
            'Example unavailable'
          ]
          return placeholders.some((placeholder) => text.includes(placeholder)) ? null : text
        }

        const cnPlaceholders = [
          'This is related to',
          'This is related to',
          'This is an example sentence',
          'Translation unavailable',
          'Example translation unavailable'
        ]
        const cleanExampleCn = (text) => {
          if (!text) return ''
          return cnPlaceholders.some((placeholder) => text.includes(placeholder)) ? '' : text
        }

        const enGarbagePatterns = [
          /^This is useful for/i,
          /^This is an example/i,
          /^Example sentence/i,
          /^No example/i,
          /^Sample sentence/i,
          /^This sentence/i,
          /^Sentence unavailable/i,
          /^Example unavailable/i,
          /stuey/i,
          /Lorem ipsum/i
        ]
        const cleanExampleEn = (text) => {
          if (!text || text.trim().length < 8) return null
          if (enGarbagePatterns.some((pattern) => pattern.test(text.trim()))) return null
          return text
        }

        const exampleEn = cleanExampleEn(item.example)
        const rawCn = exampleEn ? cleanExampleCn(item.exampleTranslation) : ''

        let exampleCn = rawCn
        if (exampleEn && !exampleCn) {
          const category = item.partOfSpeech || item.examType || 'n'
          const meaning = item.translation || item.word
          try {
            exampleCn = await translateExampleToChinese(exampleEn)
            if (!exampleCn) {
              exampleCn = generateExampleByCategory(item.word, meaning, category).cn
            }
          } catch {
            exampleCn = ''
          }
        }

        return {
          ...item,
          meaning: item.translation,
          definition: cleanDefinition(item.definition),
          category: item.examType || 'General',
          examples: exampleEn ? [{ en: exampleEn, cn: exampleCn }] : []
        }
      }))
      total.value = totalCount
      lastBrowseQueryKey.value = getBrowseQueryKey()
    } catch (error) {
      logger.error('Failed to load vocabulary from API:', error)
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = (nextPage) => {
    page.value = nextPage
    loadBrowseData()
  }

  const handleSearch = () => {
    page.value = 1
    loadBrowseData()
  }

  const openWordDetail = async (word) => {
    if (!word) return

    currentDetailWord.value = word
    showDetailModal.value = true

    try {
      playAudio(word.word, true)
    } catch {
      logger.warn('[Vocabulary Detail] Auto play failed for word detail')
    }

    if (word.examples && word.examples.length > 0) {
      return
    }

    const category = word.partOfSpeech || word.category || 'n'
    const meaning = word.meaning || word.translation || word.word

    try {
      const apiResult = await fetchExampleFromApi(word.word)
      if (apiResult && apiResult.en) {
        const translatedCn = apiResult.cn || await translateExampleToChinese(apiResult.en)
        const cn = translatedCn || generateExampleByCategory(word.word, meaning, category).cn
        currentDetailWord.value = {
          ...currentDetailWord.value,
          examples: [{ en: apiResult.en, cn }]
        }
        return
      }
    } catch {
      logger.warn('[Vocabulary Detail] API example fetch failed, falling back to generated example')
    }

    const generated = generateExampleByCategory(word.word, meaning, category)
    const translatedCn = await translateExampleToChinese(generated.en)
    currentDetailWord.value = {
      ...currentDetailWord.value,
      examples: [{
        en: generated.en,
        cn: translatedCn || generated.cn
      }]
    }
  }

  const startSession = async () => {
    loading.value = true
    try {
      const words = await vocabStore.fetchRecommended(selectedExam.value, 15)
      sessionWords.value = words
      sessionIndex.value = 0
      isFlipped.value = false
      sessionComplete.value = false
      sessionStats.value = { correct: 0, wrong: 0 }
      mnemonicText.value = ''

      if (sessionWords.value.length > 0) {
        playAudio(sessionWords.value[0].word, true)
      }
    } finally {
      loading.value = false
    }
  }

  const handleResult = async (correct) => {
    const word = currentLearnWord.value
    if (!word) return

    if (correct) {
      sessionStats.value.correct += 1
    } else {
      sessionStats.value.wrong += 1
    }

    vocabStore.recordResult(word, correct)

    if (correct && dailyTask.value) {
      const newProgress = sessionStats.value.correct
      await taskTracker.updateProgress('vocabulary', newProgress)
      dailyTask.value = taskTracker.getTaskInfo('vocabulary')
    }

    if (sessionIndex.value < sessionWords.value.length - 1) {
      sessionIndex.value += 1
      isFlipped.value = false
      mnemonicText.value = ''
      setTimeout(() => {
        playAudio(currentLearnWord.value?.word, true)
      }, 300)
      return
    }

    sessionComplete.value = true
  }

  const flipCard = () => {
    isFlipped.value = !isFlipped.value
  }

  const handleGetMnemonic = async () => {
    if (!currentLearnWord.value) return

    mnemonicLoading.value = true
    mnemonicText.value = ''
    try {
      const response = await request({
        url: '/ai/vocab/detail',
        method: 'get',
        params: {
          word: currentLearnWord.value.word,
          examType: selectedExam.value
        }
      })

      if (response.code === 200 && response.data) {
        const details = response.data
        mnemonicText.value = details.mnemonics || 'AI mnemonic is being generated...'
        if (details.etymology) {
          logger.log('[AI Etymology]', details.etymology)
        }
        return
      }

      throw new Error('API Error')
    } catch (error) {
      logger.error('AI mnemonic generation failed', error)
      message.error('AI mnemonic generation failed')
      mnemonicText.value = 'AI mnemonic is temporarily unavailable, please try again later.'
    } finally {
      mnemonicLoading.value = false
    }
  }

  const openAITutor = () => {
    showTutor.value = true
  }

  watch(selectedExam, (nextExam, previousExam) => {
    if (nextExam === previousExam) return

    page.value = 1
    if (activeTab.value === 'browse') {
      loadBrowseData()
    }
  })

  watch(activeTab, (nextTab) => {
    if (nextTab !== 'browse') return
    if (lastBrowseQueryKey.value === getBrowseQueryKey()) return
    loadBrowseData()
  })

  onMounted(async () => {
    await loadBrowseData()

    taskTracker.setMessage(message)
    await taskTracker.init()
    dailyTask.value = taskTracker.getTaskInfo('vocabulary')

    if (dailyTask.value) {
      logger.log('[Vocabulary Daily Task]', dailyTask.value)
    }
  })

  return {
    activeTab,
    loading,
    dailyTask,
    searchText,
    selectedExam,
    showDetailModal,
    currentDetailWord,
    total,
    page,
    pageSize,
    examOptions,
    sessionWords,
    sessionIndex,
    isFlipped,
    sessionComplete,
    sessionStats,
    paginatedBrowseWords,
    currentLearnWord,
    mnemonicText,
    mnemonicLoading,
    showTutor,
    tutorContext,
    stats,
    playAudio,
    handlePageChange,
    handleSearch,
    isPlaceholderDefinition,
    openWordDetail,
    startSession,
    handleResult,
    flipCard,
    handleGetMnemonic,
    openAITutor
  }
}
