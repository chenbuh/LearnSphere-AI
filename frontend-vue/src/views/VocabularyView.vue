<script setup>
import { ref, onMounted, computed, watch, defineAsyncComponent } from 'vue'
import { NCard, NTabs, NTabPane, useMessage } from 'naive-ui'
import { useVocabularyStore } from '../stores/vocabulary.js'
import { fetchExampleFromApi, generateExampleByCategory, translateExampleToChinese } from '../utils/dictionaryApi.js'
import { vocabularyApi } from '../api/vocabulary.js'
import taskTracker from '../utils/taskTracker.js'
import logger from '@/utils/logger'
import request from '@/utils/request'
import { decryptPayload } from '@/utils/crypto'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
const VocabularyOverviewHeader = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyOverviewHeader.vue'))
const VocabularyBrowsePanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyBrowsePanel.vue'))
const VocabularyLearnPanel = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyLearnPanel.vue'))
const VocabularyDetailModal = defineAsyncComponent(() => import('@/components/vocabulary/VocabularyDetailModal.vue'))

const vocabStore = useVocabularyStore()
const message = useMessage()

// --- State ---
const activeTab = ref('browse')
const loading = ref(false)

const dailyTask = ref(null)

const searchText = ref('')
const selectedExam = ref('cet4')
const showDetailModal = ref(false)
const currentDetailWord = ref(null)
const browseWords = ref([])
const page = ref(1)
const pageSize = 12

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

const sessionWords = ref([])
const sessionIndex = ref(0)
const isFlipped = ref(false)
const sessionComplete = ref(false)
const sessionStats = ref({ correct: 0, wrong: 0 })

// --- Common Logic ---

const currentAudio = ref(null)

/**
 */
const playAudio = (text, isAuto = false) => {
  if (!text) return

  if (isAuto) {
    const autoPlayEnabled = localStorage.getItem('user_autoplay_preference') !== 'false'
    if (!autoPlayEnabled) return
  }

  if (currentAudio.value) {
    try {
      currentAudio.value.pause()
      currentAudio.value = null
    } catch (e) {}
  }
  
  if (typeof window !== 'undefined' && window.speechSynthesis) {
     window.speechSynthesis.cancel()
  }



  if (isAuto) {
    setTimeout(() => tryPlayAudio(text), 100)
  } else {
    tryPlayAudio(text)
  }
}

/**
 */
const tryPlayAudio = (text) => {
    const isSentence = text.includes(' ') || text.length > 30
    
    const sources = isSentence ? [
        `https://api.frdic.com/api/v2/speech/speakweb?langid=en&txt=${encodeURIComponent(text)}`,
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`
    ] : [
        `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`
    ]
    
    
    tryOnlineSource(text, sources, 0)
}

/**
 */
const tryOnlineSource = (text, sources, index) => {
    if (index >= sources.length) {
        playNativeTTS(text)
        return
    }
    
    try {
        const audio = new Audio()
        currentAudio.value = audio
        
        let hasPlayed = false
        let hasErrored = false

        audio.onplay = () => {
            hasPlayed = true
        }

        audio.onended = () => {
            currentAudio.value = null
        }
        
        audio.onerror = (e) => {
            if (hasErrored) return
            hasErrored = true
            
            tryOnlineSource(text, sources, index + 1)
        }
        
        audio.src = sources[index]
        
        const playPromise = audio.play()
        
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                if (hasPlayed || hasErrored) return
                hasErrored = true
                
                tryOnlineSource(text, sources, index + 1)
            })
        }
        
        setTimeout(() => {
            if (!hasPlayed && !hasErrored) {
                hasErrored = true
                if (currentAudio.value) {
                    currentAudio.value.pause()
                    currentAudio.value = null
                }
                tryOnlineSource(text, sources, index + 1)
            }
        }, 2000)
        
    } catch (err) {
        tryOnlineSource(text, sources, index + 1)
    }
}

const playNativeTTS = (text) => {
    try {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            throw new Error('speechSynthesis not available')
        }
        
        window.speechSynthesis.cancel()
        
        const speakWithRetry = () => {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'en-US'
            utterance.rate = 0.9
            utterance.pitch = 1.0
            utterance.volume = 1.0
            
            let voices = window.speechSynthesis.getVoices()
            
            if (voices.length === 0) {
                logger.log('[Vocab Audio] Waiting for voices to load...')
                
                window.speechSynthesis.onvoiceschanged = () => {
                    voices = window.speechSynthesis.getVoices()
                    logger.log(`[Vocab Audio] Voices loaded: ${voices.length} voices available`)
                    selectVoiceAndSpeak(utterance, voices, text)
                }
                
                setTimeout(() => {
                    if (voices.length === 0) {
                        logger.warn('[Vocab Audio] Timeout waiting for voices, using default')
                        selectVoiceAndSpeak(utterance, [], text)
                    }
                }, 3000)
            } else {
                selectVoiceAndSpeak(utterance, voices, text)
            }
        }
        
        setTimeout(speakWithRetry, 50)
        
    } catch (e) {
        logger.error('[Vocab Audio] Native TTS not available:', e.message)
        message.warning('Audio playback is unavailable. Please check browser permissions and try again.')
    }
}

const selectVoiceAndSpeak = (utterance, voices, text) => {
    try {
        if (voices.length > 0) {
            const voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                         voices.find(v => v.lang === 'en-US') ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0]
            
            if (voice) {
                utterance.voice = voice
                logger.log('[Vocab Audio] Using voice:', voice.name)
            }
        } else {
            logger.log('[Vocab Audio] Using default voice (no voices available)')
        }
        
        let hasStarted = false
        
        utterance.onstart = () => {
            hasStarted = true
            logger.log('[Vocab Audio] Native TTS playing')
        }
        
        utterance.onend = () => {
            logger.log('[Vocab Audio] Native TTS ended')
        }
        
        utterance.onerror = (e) => {
            logger.error('[Vocab Audio] Native TTS error:', e.error)
            if (!hasStarted) {
    message.warning('Audio playback is unavailable. Please try again.')
            }
        }

        logger.log('[Vocab Audio] Speaking:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))
        window.speechSynthesis.speak(utterance)
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isMobile) {
            let checkCount = 0
            const checkInterval = setInterval(() => {
                checkCount++
                if (checkCount > 10) {
                    clearInterval(checkInterval)
                    if (!hasStarted) {
                        logger.error('[Vocab Audio] TTS failed to start after retries')
                        message.warning('Voice playback did not respond, please try again.')
                    }
                    return
                }
                
                if (window.speechSynthesis.paused) {
                    logger.log('[Vocab Audio] Resuming paused TTS')
                    window.speechSynthesis.resume()
                }
                
                if (hasStarted) {
                    clearInterval(checkInterval)
                }
            }, 100)
        }
    } catch (e) {
        logger.error('[Vocab Audio] Error in selectVoiceAndSpeak:', e)
    message.warning('Audio playback is unavailable. Please try again.')
    }
}

// --- Browse Mode Logic ---

const loadBrowseData = async () => {
  loading.value = true
  try {
    const params = {
      examType: selectedExam.value,
      page: page.value,
      pageSize: pageSize,
      keyword: searchText.value
    }
    const res = await vocabularyApi.getVocabularyList(params)
    const decryptedData = decryptPayload(res.data)
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
        return placeholders.some(p => text.includes(p)) ? null : text
      }

      const cnPlaceholders = [
        'This is related to',
        'This is related to',
        'This is an example sentence',
        'Translation unavailable',
        'Example translation unavailable',
      ]
      const cleanExampleCn = (text) => {
        if (!text) return ''
        return cnPlaceholders.some(p => text.includes(p)) ? '' : text
      }

      const EN_GARBAGE_PATTERNS = [
        /^This is useful for/i,       // "This is useful for stuey."
        /^This is an example/i,       // "This is an example sentence."
        /^Example sentence/i,
        /^No example/i,
        /^Sample sentence/i,
        /^This sentence/i,
        /^Sentence unavailable/i,
        /^Example unavailable/i,
        /stuey/i,
        /Lorem ipsum/i,
      ]
      const cleanExampleEn = (text) => {
        if (!text || text.trim().length < 8) return null
        if (EN_GARBAGE_PATTERNS.some(re => re.test(text.trim()))) return null
        return text
      }

      const exampleEn = cleanExampleEn(item.example)
      const rawCn = exampleEn ? cleanExampleCn(item.exampleTranslation) : ''

      let exampleCn = rawCn
      if (exampleEn && !exampleCn) {
        const cat = item.partOfSpeech || item.examType || 'n'
        const meaning = item.translation || item.word
        try {
          exampleCn = await translateExampleToChinese(exampleEn)
          if (!exampleCn) {
            exampleCn = generateExampleByCategory(item.word, meaning, cat).cn
          }
        } catch (_) { exampleCn = '' }
      }

      return {
        ...item,
        meaning: item.translation,
        definition: cleanDefinition(item.definition),
        category: item.examType || 'General',
        examples: exampleEn ? [{
          en: exampleEn,
          cn: exampleCn
        }] : []
      }
    }))
    total.value = totalCount
  } catch (error) {
    logger.error('Failed to load vocabulary from API:', error)
  } finally {
    loading.value = false
  }
}

const total = ref(0)
const handlePageChange = (p) => {
  page.value = p
  loadBrowseData()
}

const handleSearch = () => {
  page.value = 1
  loadBrowseData()
}


const paginatedBrowseWords = computed(() => {
  return browseWords.value
})

const DEFINITION_PLACEHOLDERS = [
  'Detailed definition unavailable',
  'Definition unavailable',
  'unavailable offline'
]
const isPlaceholderDefinition = (text) =>
  !text || DEFINITION_PLACEHOLDERS.some(p => text.includes(p))

const openWordDetail = async (word) => {
  if (!word) return
  currentDetailWord.value = word
  showDetailModal.value = true
  try {
    playAudio(word.word, true)
  } catch (e) {}

  if (!word.examples || word.examples.length === 0) {
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
    } catch (e) {}

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
}

watch(selectedExam, () => {
  if (activeTab.value === 'browse') {
    loadBrowseData()
  }
})


/**
 */
const startSession = async () => {
  loading.value = true
  try {
    const words = await vocabStore.fetchRecommended(selectedExam.value, 15) // Batch size 15
    sessionWords.value = words
    sessionIndex.value = 0
    isFlipped.value = false
    sessionComplete.value = false
    sessionStats.value = { correct: 0, wrong: 0 }
    
    if (sessionWords.value.length > 0) {
      playAudio(sessionWords.value[0].word, true)
    }
  } finally {
    loading.value = false
  }
}

const currentLearnWord = computed(() => {
  if (!sessionWords.value.length || sessionIndex.value >= sessionWords.value.length) return null
  return sessionWords.value[sessionIndex.value]
})

/**
 */
const handleResult = async (correct) => {
  const word = currentLearnWord.value
  if (!word) return

  if (correct) sessionStats.value.correct++
  else sessionStats.value.wrong++

  vocabStore.recordResult(word, correct)

  if (correct && dailyTask.value) {
    const newProgress = sessionStats.value.correct
    await taskTracker.updateProgress('vocabulary', newProgress)
    
    dailyTask.value = taskTracker.getTaskInfo('vocabulary')
  }

  if (sessionIndex.value < sessionWords.value.length - 1) {
    sessionIndex.value++
    isFlipped.value = false
    setTimeout(() => {
      playAudio(currentLearnWord.value?.word, true)
    }, 300)
  } else {
    sessionComplete.value = true
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// --- AI Mnemonic Logic ---
const mnemonicLoading = ref(false)
const mnemonicText = ref('')

const handleGetMnemonic = async () => {
  if (!currentLearnWord.value) return
  mnemonicLoading.value = true
  mnemonicText.value = ''
  try {
     const res = await request({
        url: '/ai/vocab/detail',
        method: 'get',
        params: {
           word: currentLearnWord.value.word,
           examType: selectedExam.value
        }
     })
     
     if (res.code === 200 && res.data) {
        const details = res.data
        mnemonicText.value = details.mnemonics || 'AI mnemonic is being generated...'
        
        if (details.etymology) {
           logger.log('[AI Etymology]', details.etymology)
        }
     } else {
        throw new Error('API Error')
     }
  } catch (e) {
    logger.error('AI mnemonic generation failed', e)
    message.error('AI mnemonic generation failed')
    mnemonicText.value = 'AI mnemonic is temporarily unavailable, please try again later.'
  } finally {
    mnemonicLoading.value = false
  }
}

// --- AI Tutor State ---
const showTutor = ref(false)
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

const openAITutor = () => {
    showTutor.value = true
}

// Initialize
onMounted(async () => {
  loadBrowseData()
  
  taskTracker.setMessage(message)
  await taskTracker.init()
  dailyTask.value = taskTracker.getTaskInfo('vocabulary')
  
  if (dailyTask.value) {
    logger.log('[Vocabulary Daily Task]', dailyTask.value)
  }
})

</script>

<template>
  <div class="page-container">
    <VocabularyOverviewHeader
      :daily-task="dailyTask"
      :stats="vocabStore.stats"
    />

    <!-- Main Content Area -->
    <n-card :bordered="false" class="main-card">
      <n-tabs v-model:value="activeTab" type="segment" animated>
        
        <!-- Tab 1: Browse Mode -->
        <n-tab-pane name="browse" tab="Browse Vocabulary">
          <VocabularyBrowsePanel
            :selected-exam="selectedExam"
            :exam-options="examOptions"
            :search-text="searchText"
            :total="total"
            :loading="loading"
            :paginated-browse-words="paginatedBrowseWords"
            :page="page"
            :page-size="pageSize"
            @update:selected-exam="selectedExam = $event"
            @update:search-text="searchText = $event"
            @search="handleSearch"
            @change-page="handlePageChange"
            @open-word-detail="openWordDetail"
            @play-audio="playAudio"
          />
        </n-tab-pane>

        <!-- Tab 2: Learn Mode -->
        <n-tab-pane name="learn" tab="Learn Session">
          <VocabularyLearnPanel
            :selected-exam="selectedExam"
            :exam-options="examOptions"
            :session-words="sessionWords"
            :session-index="sessionIndex"
            :is-flipped="isFlipped"
            :session-complete="sessionComplete"
            :session-stats="sessionStats"
            :current-learn-word="currentLearnWord"
            :mnemonic-text="mnemonicText"
            :mnemonic-loading="mnemonicLoading"
            @update:selected-exam="selectedExam = $event"
            @start-session="startSession"
            @flip-card="flipCard"
            @play-audio="playAudio"
            @get-mnemonic="handleGetMnemonic"
            @open-ai-tutor="openAITutor"
            @handle-result="handleResult"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      v-if="showDetailModal || currentDetailWord"
      v-model:show="showDetailModal"
      :current-detail-word="currentDetailWord"
      :is-placeholder-definition="isPlaceholderDefinition"
      @play-audio="playAudio"
      @open-ai-tutor="openAITutor"
    />
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
  margin: 0 auto;
  padding: 24px;
}

.main-card {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  min-height: 600px;
}

:global(.dark-mode) .main-card {
  background: rgba(30, 30, 35, 0.6);
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }

  .main-card {
    min-height: auto;
  }

  :deep(.n-tabs .n-tabs-tab) {
    padding: 8px 16px !important;
    font-size: 0.9rem !important;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
}
</style>
