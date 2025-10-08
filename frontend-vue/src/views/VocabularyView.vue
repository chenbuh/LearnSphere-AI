<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { 
    NGrid, NGridItem, NCard, NButton, NSelect, NInput, NSpin, 
    NTag, NPagination, NModal, NProgress, NTabs, NTabPane, 
    NStatistic, NNumberAnimation, NSpace, NDivider, useMessage
} from 'naive-ui'
import { Search, Volume2, Trophy, Brain, Check, X, BookOpen, RotateCw, Layers, Zap, Target } from 'lucide-vue-next'
import { vocabularyDatabase } from '../data/vocabulary.js'
import { useVocabularyStore } from '../stores/vocabulary.js'
import { getExampleSentence } from '../data/example-sentences.js'
import { fetchExampleFromApi, generateExampleByCategory } from '../utils/dictionaryApi.js'
import { vocabularyApi } from '../api/vocabulary.js'
import { masteryApi } from '../api/mastery.js'
import taskTracker from '../utils/taskTracker.js'
import logger from '@/utils/logger'

const vocabStore = useVocabularyStore()
const message = useMessage()

// State
const activeTab = ref('browse') // 'browse' | 'learn'
const loading = ref(false)

// --- 任务追踪 ---
const dailyTask = ref(null)

// --- Browse Mode State ---
const searchText = ref('')
const selectedExam = ref('cet4')
const showDetailModal = ref(false)
const currentDetailWord = ref(null)
const browseWords = ref([])
const page = ref(1)
const pageSize = 12

const examOptions = [
  { label: '大学英语四级 (CET-4)', value: 'cet4' },
  { label: '大学英语六级 (CET-6)', value: 'cet6' },
  { label: '雅思 (IELTS)', value: 'ielts' },
  { label: '托福 (TOEFL)', value: 'toefl' },
  { label: 'GRE', value: 'gre' },
  { label: '考研英语', value: 'postgraduate' },
  { label: '专业四级 (TEM-4)', value: 'tem4' },
  { label: '专业八级 (TEM-8)', value: 'tem8' }
]

// --- Learn Mode State ---
const sessionWords = ref([])
const sessionIndex = ref(0)
const isFlipped = ref(false)
const sessionComplete = ref(false)
const sessionStats = ref({ correct: 0, wrong: 0 })

// --- Common Logic ---

const currentAudio = ref(null)
const currentUtterance = ref(null)

const playAudio = (text) => {
  if (!text) {
    console.warn('[Audio] No text provided')
    return
  }

  console.log(`[Audio] Play request for: "${text}"`)

  // 完全停止之前的播放
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value = null
  }
  
  // 停止所有正在进行的语音合成
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel()
      // 等待取消完成
      setTimeout(() => startPlayback(text), 150)
      return
  }
  
  startPlayback(text)
}

const startPlayback = (text) => {
  // 单词用有道，句子用必应TTS
  const isSentence = text.includes(' ') || text.length > 30
  
  if (isSentence) {
      // 使用必应TTS播放句子
      const url = `https://api.frdic.com/api/v2/speech/speakweb?langid=en&txt=${encodeURIComponent(text)}`
      const audio = new Audio(url)
      currentAudio.value = audio
      
      audio.onplay = () => logger.log('[Audio] ✓ Sentence playing')
      audio.onerror = () => {
          logger.log('[Audio] Trying backup TTS...')
          // 备选：使用系统TTS
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = 'en-US'
          utterance.rate = 0.9
          window.speechSynthesis.speak(utterance)
      }
      
      audio.play().catch(() => {
          // 备选：使用系统TTS
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = 'en-US'
          utterance.rate = 0.9
          window.speechSynthesis.speak(utterance)
      })
  } else {
      // 单词用有道
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`
      const audio = new Audio(url)
      currentAudio.value = audio
      audio.onplay = () => logger.log('[Audio] ✓ Word playing')
      audio.play().catch(e => console.warn("[Audio] Failed:", e))
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
    const { records, total: totalCount } = res.data
    
    browseWords.value = records.map((item) => {
      // 组装前台需要的格式
      return {
        ...item,
        meaning: item.translation, // 后端 translation 映射到前台 meaning
        examples: item.example ? [{
          en: item.example,
          cn: item.exampleTranslation
        }] : []
      }
    })
    total.value = totalCount
  } catch (error) {
    console.error('Failed to load vocabulary from API:', error)
  } finally {
    loading.value = false
  }
}

// 增加总数响应式变量
const total = ref(0)
const handlePageChange = (p) => {
  page.value = p
  loadBrowseData()
}

const handleSearch = () => {
  page.value = 1
  loadBrowseData()
}

const filteredBrowseWords = computed(() => {
  if (!searchText.value) return browseWords.value
  return browseWords.value.filter(w => w.word.toLowerCase().includes(searchText.value.toLowerCase()))
})

const paginatedBrowseWords = computed(() => {
  return browseWords.value
})

const openWordDetail = (word) => {
  currentDetailWord.value = word
  showDetailModal.value = true
  playAudio(word.word)
}

watch(selectedExam, () => {
  if (activeTab.value === 'browse') {
    loadBrowseData()
  }
})

// --- Learn Mode Logic ---

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
      playAudio(sessionWords.value[0].word)
    }
  } finally {
    loading.value = false
  }
}

const currentLearnWord = computed(() => {
  if (!sessionWords.value.length || sessionIndex.value >= sessionWords.value.length) return null
  return sessionWords.value[sessionIndex.value]
})

const handleResult = async (correct) => {
  const word = currentLearnWord.value
  if (!word) return

  // Record stats
  if (correct) sessionStats.value.correct++
  else sessionStats.value.wrong++

  // Save to store
  vocabStore.recordResult(word, correct)

  // 更新每日任务进度
  if (correct && dailyTask.value) {
    const newProgress = sessionStats.value.correct
    await taskTracker.updateProgress('vocabulary', newProgress)
    
    // 更新任务信息显示
    dailyTask.value = taskTracker.getTaskInfo('vocabulary')
  }

  // Move next
  if (sessionIndex.value < sessionWords.value.length - 1) {
    sessionIndex.value++
    isFlipped.value = false
    // Auto play audio for next word
    setTimeout(() => {
      playAudio(currentLearnWord.value?.word)
    }, 300)
  } else {
    sessionComplete.value = true
  }
}

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// Initialize
onMounted(async () => {
  loadBrowseData()
  
  // 初始化任务追踪
  taskTracker.setMessage(message)
  await taskTracker.init()
  dailyTask.value = taskTracker.getTaskInfo('vocabulary')
  
  if (dailyTask.value) {
    logger.log('[词汇学习] 今日任务:', dailyTask.value)
  }
})

</script>

<template>
  <div class="page-container">
    <!-- 每日任务进度条 -->
    <div v-if="dailyTask" class="daily-task-banner">
      <div class="task-info">
        <Target :size="20" class="task-icon" />
        <span class="task-text">今日词汇任务: {{ dailyTask.completed }} / {{ dailyTask.target }}</span>
      </div>
      <n-progress
        type="line"
        :percentage="Math.round((dailyTask.completed / dailyTask.target) * 100)"
        :show-indicator="false"
        color="#8b5cf6"
        rail-color="rgba(255, 255, 255, 0.1)"
        :height="8"
        class="task-progress"
      />
    </div>

    <!-- Stats Header -->
    <div class="stats-header">
       <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:4" responsive="screen">
          <n-grid-item>
             <n-card class="stat-card purple" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon purple"><Brain /></div>
                     <div class="stat-info">
                         <div class="stat-label">今日学习</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.todayCount" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
          <n-grid-item>
             <n-card class="stat-card green" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon green"><Trophy /></div>
                     <div class="stat-info">
                         <div class="stat-label">已掌握</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.totalMastered" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
          <n-grid-item>
             <n-card class="stat-card blue" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon blue"><Layers /></div>
                     <div class="stat-info">
                         <div class="stat-label">学习中</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.totalLearned" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
          <n-grid-item>
             <n-card class="stat-card red" :bordered="false">
                 <div class="stat-content">
                     <div class="stat-icon red"><RotateCw /></div>
                     <div class="stat-info">
                         <div class="stat-label">需复习</div>
                         <div class="stat-value">
                             <n-number-animation :from="0" :to="vocabStore.stats.totalFailed" />
                         </div>
                     </div>
                 </div>
             </n-card>
          </n-grid-item>
       </n-grid>
    </div>

    <!-- Main Content Area -->
    <n-card :bordered="false" class="main-card">
      <n-tabs v-model:value="activeTab" type="segment" animated>
        
        <!-- Tab 1: Browse Mode -->
        <n-tab-pane name="browse" tab="词汇浏览">
          <div class="browse-header">
             <div class="filters">
               <n-select v-model:value="selectedExam" :options="examOptions" class="exam-select" @update:value="handleSearch" />
              <n-input v-model:value="searchText" placeholder="搜索单词..." round class="search-input" @keyup.enter="handleSearch">
                <template #prefix><Search :size="16" /></template>
              </n-input>
              <n-button type="primary" round @click="handleSearch">搜索</n-button>
            </div>
            <div class="total-count">
              共 {{ total }} 个单词
            </div>
          </div>

          <NSpin :show="loading">
            <div class="word-grid-container">
                <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:3 1200:4" responsive="screen">
                  <n-grid-item v-for="word in paginatedBrowseWords" :key="word.id">
                    <div class="word-card" @click="openWordDetail(word)">
                      <div class="word-card-top">
                        <div class="word-main-info">
                          <h3>{{ word.word }}</h3>
                          <span class="phonetic">{{ word.phonetic }}</span>
                        </div>
                        <div class="play-btn" @click.stop="playAudio(word.word)">
                            <Volume2 :size="16" />
                        </div>
                      </div>
                      <div class="word-meaning">{{ word.meaning }}</div>
                    </div>
                  </n-grid-item>
                </n-grid>
            </div>
            
            <div class="pagination-container" v-if="total > 0">
              <n-pagination v-model:page="page" :item-count="total" :page-size="pageSize" @update:page="handlePageChange" />
            </div>
          </NSpin>
        </n-tab-pane>

        <!-- Tab 2: Learn Mode -->
        <n-tab-pane name="learn" tab="智能学习">
          <div class="learn-container">
            
            <!-- Not Started State -->
            <div v-if="sessionWords.length === 0 && !sessionComplete" class="start-session-view">
               <div class="brain-icon-wrapper">
                  <Brain :size="80" />
               </div>
               <h2>准备开始学习</h2>
               <p>我们将为您安排 {{ selectedExam }} 的 15 个单词，包含新词和需复习的词汇。</p>
               <div class="start-actions">
                 <n-select v-model:value="selectedExam" :options="examOptions" class="exam-select-learn" />
                 <n-button type="primary" size="large" @click="startSession">开始 Session</n-button>
               </div>
            </div>

            <!-- Learning State -->
            <div v-else-if="!sessionComplete" class="learning-view">
               <div class="learn-header">
                 <span>进度: {{ sessionIndex + 1 }} / {{ sessionWords.length }}</span>
                 <span>Exam: {{ selectedExam }}</span>
               </div>
               <n-progress type="line" :percentage="((sessionIndex) / sessionWords.length) * 100" :show-indicator="false" processing color="#6366f1" class="progress-bar" />

               <!-- Flashcard -->
               <div class="flashcard-scene" @click="flipCard">
                  <div class="flashcard-cube" :class="{ 'is-flipped': isFlipped }">
                    
                    <!-- Front -->
                    <div class="card-face front">
                       <h2 class="word-text">{{ currentLearnWord.word }}</h2>
                       <div class="phonetic-box">
                         <span class="phonetic-text">{{ currentLearnWord.phonetic }}</span>
                         <div class="sound-icon" @click.stop="playAudio(currentLearnWord.word)">
                            <Volume2 :size="20" />
                         </div>
                       </div>
                       <p class="hint-text">点击查看释义</p>
                    </div>

                    <!-- Back -->
                    <div class="card-face back">
                       <div class="top-bar"></div>
                       <div class="tags-row">
                         <n-tag :type="currentLearnWord.difficulty > 3 ? 'warning' : 'success'" size="small" round>{{ currentLearnWord.category }}</n-tag>
                       </div>
                       <h3 class="meaning-text">{{ currentLearnWord.meaning }}</h3>
                       
                       <div class="example-box">
                         <div class="ex-row">
                            <p class="en-sent">"{{ currentLearnWord.examples[0].en }}"</p>
                            <div class="sound-icon-small" @click.stop="playAudio(currentLearnWord.examples[0].en)">
                                <Volume2 :size="18" />
                            </div>
                         </div>
                         <p class="cn-sent">{{ currentLearnWord.examples[0].cn }}</p>
                       </div>
                    </div>
                  </div>
               </div>

               <!-- Controls -->
               <div class="learn-controls">
                   <template v-if="isFlipped">
                     <n-button circle color="#ef4444" size="large" class="control-btn" @click="handleResult(false)">
                        <template #icon><X /></template>
                     </n-button>
                     <n-button circle color="#22c55e" size="large" class="control-btn" @click="handleResult(true)">
                        <template #icon><Check /></template>
                     </n-button>
                   </template>
                   <div v-else class="thinking-text">思考一下...</div>
               </div>
            </div>

            <!-- Complete State -->
            <div v-else class="complete-view">
               <div class="trophy-wrapper">
                 <Trophy class="trophy-icon" />
               </div>
               <h2>Session 完成!</h2>
               <p>本次学习 {{ sessionStats.correct }} 个新单词，需复习 {{ sessionStats.wrong }} 个。</p>
               
               <div class="result-stats-row">
                 <div class="stat-box">
                   <div class="val green">{{ sessionStats.correct }}</div>
                   <div class="lbl">掌握</div>
                 </div>
                 <div class="stat-box">
                   <div class="val red">{{ sessionStats.wrong }}</div>
                   <div class="lbl">待加强</div>
                 </div>
               </div>

               <n-button type="primary" size="large" @click="startSession">再来一组</n-button>
            </div>

          </div>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- Detail Modal -->
    <n-modal v-model:show="showDetailModal">
       <n-card
        style="width: 500px; max-width: 90vw;"
        :title="currentDetailWord?.word"
        :bordered="false"
        role="dialog"
        aria-modal="true"
        class="detail-modal-card"
      >
        <template #header-extra>
           <div class="modal-sound" @click="playAudio(currentDetailWord?.word)">
               <Volume2 :size="24" />
           </div>
        </template>
        
        <div v-if="currentDetailWord" class="detail-content">
           <div class="modal-meta">
              <span class="modal-phonetic">{{ currentDetailWord.phonetic }}</span>
              <n-tag type="info" size="small">{{ currentDetailWord.category }}</n-tag>
           </div>
           
           <div class="modal-section">
              <h4>释义</h4>
              <p class="meaning-big">{{ currentDetailWord.meaning }}</p>
              <p v-if="currentDetailWord.definition" class="definition-text">{{ currentDetailWord.definition }}</p>
           </div>

           <div class="modal-section">
              <h4>例句</h4>
              <div v-for="(ex, idx) in currentDetailWord.examples" :key="idx" class="example-item">
                 <div class="ex-row">
                    <p class="ex-en">{{ ex.en }}</p>
                    <div class="sound-icon-small" @click="playAudio(ex.en)">
                       <Volume2 :size="16" />
                    </div>
                 </div>
                 <p class="ex-cn">{{ ex.cn }}</p>
              </div>
           </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped>
.page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
}

/* 每日任务横幅 */
.daily-task-banner {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.task-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    font-weight: 600;
}

.task-icon {
    color: #8b5cf6;
}

.task-progress {
    width: 100%;
}

/* Stats Header */
.stats-header {
    margin-bottom: 24px;
}
.stat-card {
    background: rgba(30,30,35,0.6);
    border-radius: 16px;
    height: 100%;
}
.stat-card.purple { background: rgba(88, 28, 135, 0.2); }
.stat-card.green { background: rgba(6, 78, 59, 0.2); }
.stat-card.blue { background: rgba(30, 58, 138, 0.2); }
.stat-card.red { background: rgba(136, 19, 55, 0.2); }

.stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
}
.stat-icon {
    width: 48px; height: 48px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
}
.stat-icon svg { width: 24px; height: 24px; }
.stat-icon.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.stat-icon.green { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
.stat-icon.blue { background: rgba(96, 165, 250, 0.2); color: #60a5fa; }
.stat-icon.red { background: rgba(251, 113, 133, 0.2); color: #fb7185; }

.stat-info .stat-label { font-size: 0.85rem; color: #a1a1aa; margin-bottom: 2px; }
.stat-info .stat-value { font-size: 1.5rem; font-weight: 700; color: #fff; line-height: 1; }

/* Main Card */
.main-card {
    background: rgba(30,30,35,0.6);
    border-radius: 16px;
    min-height: 600px;
}

/* Browse Tab */
.filters {
    display: flex;
    gap: 16px;
    flex: 1;
}

@media (max-width: 768px) {
  .browse-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .filters {
    flex-direction: column;
    gap: 12px;
  }
  .exam-select, .search-input {
    width: 100%;
  }
  .total-count {
    text-align: right;
  }
}

.exam-select { width: 200px; }
.search-input { width: 200px; }
.total-count { color: #a1a1aa; font-size: 0.9rem; }

.word-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
}
.word-card:hover {
    background: rgba(255,255,255,0.06);
    border-color: #6366f1;
    transform: translateY(-2px);
}
.word-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}
.word-main-info h3 { font-size: 1.1rem; color: #fff; font-weight: 700; margin: 0 0 2px 0; }
.word-main-info .phonetic { font-size: 0.8rem; color: #a1a1aa; font-family: monospace; }
.play-btn { color: #71717a; transition: color 0.2s; }
.word-card:hover .play-btn { color: #6366f1; }
.word-meaning { font-size: 0.9rem; color: #d4d4d8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 32px;
}

/* Learn Tab */
.learn-container {
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 400px;
}

@media (max-width: 768px) {
    .learn-container {
      padding: 10px 0;
    }
}

/* Not Started */
.start-session-view { text-center: center; }
.brain-icon-wrapper {
    width: 100px; height: 100px;
    margin: 0 auto 24px;
    display: flex; align-items: center; justify-content: center;
    color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 50%;
}
.start-session-view h2 { font-size: 1.8rem; color: #fff; margin-bottom: 12px; }
.start-session-view p { color: #a1a1aa; margin-bottom: 32px; max-width: 400px; }
.start-actions { display: flex; gap: 16px; justify-content: center; }
.exam-select-learn { width: 160px; text-align: left; }

/* Learning View */
.learning-view { width: 100%; max-width: 600px; perspective: 1000px; }
.learn-header { display: flex; justify-content: space-between; color: #a1a1aa; font-size: 0.9rem; margin-bottom: 8px; }
.progress-bar { margin-bottom: 32px; }

.flashcard-scene {
    width: 100%;
    height: 360px;
    cursor: pointer;
}
.flashcard-cube {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}
.flashcard-cube.is-flipped {
    transform: rotateY(180deg);
}
.card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 20px;
    background: #1f1f23;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.card-face.back {
    transform: rotateY(180deg);
    border-color: rgba(99, 102, 241, 0.4);
}

/* Front Face */
.word-text { font-size: 3rem; font-weight: 800; color: #fff; margin-bottom: 24px; }

@media (max-width: 768px) {
    .flashcard-scene {
        height: 300px;
    }
    .word-text {
        font-size: 2.2rem;
    }
    .card-face {
        padding: 20px;
    }
}

.phonetic-box {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.05);
    padding: 8px 16px;
    border-radius: 99px;
    margin-bottom: 40px;
}
.phonetic-text { font-size: 1.2rem; color: #818cf8; font-family: monospace; }
.sound-icon { color: #6366f1; cursor: pointer; display: flex; }
.hint-text { color: #52525b; font-size: 0.9rem; }

/* Back Face */
.top-bar { position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, #6366f1, #d946ef); }
.tags-row { margin-bottom: 12px; }
.meaning-text { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 24px; text-align: center; }

@media (max-width: 768px) {
  .meaning-text {
     font-size: 1.5rem;
  }
}
.example-box {
    background: rgba(0,0,0,0.2);
    padding: 16px;
    border-radius: 12px;
    width: 100%;
}
.en-sent { font-size: 1.1rem; color: #e4e4e7; margin-bottom: 4px; font-style: italic; }
.cn-sent { font-size: 0.9rem; color: #71717a; }

/* Control Buttons */
.learn-controls {
    display: flex;
    justify-content: center;
    gap: 32px;
    margin-top: 32px;
    height: 64px;
}

@media (max-width: 768px) {
    .learn-controls {
        gap: 20px;
        margin-top: 24px;
    }
}
.control-btn {
    width: 64px; height: 64px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.thinking-text { color: #71717a; line-height: 64px; }

/* Complete View */
.complete-view { text-center: center; animation: fadeIn 0.5s; padding-top: 40px; }
.trophy-wrapper {
    width: 80px; height: 80px;
    background: rgba(34, 197, 94, 0.1);
    color: #4ade80;
    border-radius: 50%;
    margin: 0 auto 24px;
    display: flex; align-items: center; justify-content: center;
}
.complete-view h2 { font-size: 2rem; color: #fff; margin-bottom: 8px; }
.complete-view p { color: #a1a1aa; margin-bottom: 40px; }
.result-stats-row { display: flex; gap: 16px; justify-content: center; margin-bottom: 40px; }
.stat-box {
    background: #1f1f23;
    padding: 20px 40px;
    border-radius: 12px;
}
.stat-box .val { font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
.stat-box .val.green { color: #4ade80; }
.stat-box .val.red { color: #f87171; }
.stat-box .lbl { font-size: 0.8rem; color: #71717a; text-transform: uppercase; }

/* Modal Styles */
.detail-modal-card { background: #18181b; }
.modal-sound { color: #6366f1; cursor: pointer; }
.detail-content { margin-top: 16px; }
.modal-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
.modal-phonetic { font-size: 1.25rem; color: #a1a1aa; font-family: monospace; }
.modal-section { margin-bottom: 32px; }
.modal-section h4 { font-size: 0.8rem; color: #71717a; text-transform: uppercase; margin-bottom: 8px; font-weight: 700; }
.meaning-big { font-size: 1.5rem; color: #fff; font-weight: 500; }
.definition-text { font-size: 1rem; color: #a1a1aa; font-style: italic; margin-top: 8px; line-height: 1.4; }
.example-item {
    background: rgba(255,255,255,0.03);
    border-left: 3px solid #6366f1;
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 12px;
}
.ex-en { font-size: 1.05rem; color: #e4e4e7; margin-bottom: 4px; line-height: 1.5; }
.ex-cn { font-size: 0.9rem; color: #71717a; }

.ex-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}
.sound-icon-small {
    color: #6366f1;
    cursor: pointer;
    background: rgba(99, 102, 241, 0.1);
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-top: -2px;
}
.sound-icon-small:hover {
    background: #6366f1;
    color: white;
}
@media (max-width: 768px) {
    .page-container {
        padding: 12px;
    }
    
    /* 统计卡片优化 */
    .stats-header .n-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 12px !important;
    }
    
    .stat-card {
        padding: 12px !important;
    }
    
    .stat-content {
        gap: 12px !important;
    }
    
    .stat-icon {
        width: 40px !important;
        height: 40px !important;
    }
    
    .stat-icon svg {
        width: 20px !important;
        height: 20px !important;
    }
    
    .stat-info .stat-label {
        font-size: 0.75rem !important;
    }
    
    .stat-info .stat-value {
        font-size: 1.25rem !important;
    }
    
    /* 主卡片优化 */
    .main-card {
        min-height: auto !important;
    }
    
    /* Tab 标签优化 */
    .n-tabs .n-tabs-tab {
        padding: 8px 16px !important;
        font-size: 0.9rem !important;
    }
    
    /* 浏览模式优化 */
    .browse-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .filters {
        flex-direction: column;
        gap: 12px;
    }
    
    .exam-select, .search-input {
        width: 100% !important;
    }
    
    .filters .n-button {
        width: 100%;
    }
    
    /* 学习模式优化 */
    .start-session-view {
        padding: 20px;
        text-align: center;
    }
    
    .brain-icon-wrapper {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
    }
    
    .start-session-view h2 {
        font-size: 1.5rem;
    }
    
    .start-session-view p {
        font-size: 0.9rem;
    }
    
    .start-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .exam-select-learn {
        width: 100% !important;
    }
    
    .start-actions .n-button {
        width: 100% !important;
    }
    
    /* 卡片学习优化 */
    .flashcard-scene {
        height: 400px;
    }
    
    .word-text {
        font-size: 2rem;
    }
    
    .meaning-text {
        font-size: 1.4rem;
    }
    
    .learn-controls {
        margin-top: 20px;
        gap: 20px;
    }
    
    .control-btn {
        width: 56px;
        height: 56px;
    }
    
    /* 结果统计优化 */
    .stat-box {
        padding: 16px 20px;
    }
    
    .result-stats-row {
        flex-direction: column;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .page-container {
        padding: 8px;
    }
    
    /* 统计卡片改为单列 */
    .stats-header .n-grid {
        grid-template-columns: 1fr !important;
    }
    
    .flashcard-scene {
        height: 350px;
    }
    
    .word-text {
        font-size: 1.75rem;
    }
    
    .meaning-text {
        font-size: 1.2rem;
    }
    
    .start-session-view h2 {
        font-size: 1.25rem;
    }
}
</style>
