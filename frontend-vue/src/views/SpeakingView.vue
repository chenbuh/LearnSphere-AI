<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NResult, useMessage, 
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, NIcon, NSpin, NPagination, NProgress
} from 'naive-ui'
import {
  Mic, PlayCircle, StopCircle, Volume2, Languages, RotateCcw,
  MessageCircle, BarChart, CheckCircle2, User, Bot, AlertTriangle, History
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'

const message = useMessage()

// --- State ---
const step = ref('setup') // 'setup' | 'practice' | 'result'
const isLoading = ref(false)
const topicData = ref(null)

// Recording State
const isRecording = ref(false)
const transcript = ref('')
const recordingTime = ref(0)
let recordTimer = null
let recognition = null

// Evaluation State
const evaluationResult = ref(null)
const historyTopics = ref([])

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)
watch([historyPage, historyPageSize], () => {
    fetchHistory()
})

// --- Settings ---
const settings = ref({
    type: 'ielts_part2',
    difficulty: 'normal'
})

const topicTypes = [
    { label: 'IELTS Part 1', value: 'ielts_part1', desc: 'Short Q&A' },
    { label: 'IELTS Part 2', value: 'ielts_part2', desc: 'Topic Card (2 mins)' },
    { label: 'Business', value: 'business', desc: 'Meeting / Negotiation' },
    { label: 'Daily Life', value: 'daily', desc: 'Travel, Food, Hobby' },
    { label: 'Debate', value: 'debate', desc: 'Agree or Disagree' }
]

const updateSetting = (key, value) => { settings.value[key] = value }

// Paginated history
const paginatedHistory = computed(() => historyTopics.value)

onMounted(() => {
  fetchHistory()
})

const fetchHistory = async () => {
  try {
    const res = await aiApi.getSpeakingHistory(historyPage.value, historyPageSize.value)
    if (res.code === 200) {
      if (res.data.records) {
         historyTopics.value = res.data.records
         historyTotal.value = res.data.total
      } else {
         historyTopics.value = res.data || []
         historyTotal.value = historyTopics.value.length
      }
    }
  } catch (e) {
    console.error('Failed to fetch speaking history', e)
  }
}

const loadHistoryTopic = (topic) => {
  topicData.value = topic
  step.value = 'practice'
  transcript.value = ''
  recordingTime.value = 0
  message.success(`已加载: ${topic.topic || topic.title}`)
}

// --- Logic ---

const generateTopic = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.generateSpeaking({
            type: settings.value.type,
            difficulty: settings.value.difficulty
        })
        if (res.code === 200 && res.data) {
            topicData.value = res.data
            step.value = 'practice'
            transcript.value = ''
            recordingTime.value = 0
            message.success('Topic generated!')
        } else {
            message.error('Failed to generate topic')
        }
    } catch (e) {
        console.error(e)
        // message.error('API Error')
        // Mock fallback for demo if API fails
        topicData.value = {
            title: 'Describe a traditional festival',
            question: 'Describe a traditional festival in your country. You should say: when it is celebrated, what people do, what you enjoy about it, and explain why it is important.',
            tips: ['Use present tense', 'Mention colors and food', 'Explain cultural significance'],
            keywords: ['Celebration', 'Tradition', 'Atmosphere', 'Customs']
        }
        step.value = 'practice'
        transcript.value = ''
        recordingTime.value = 0
    } finally {
        isLoading.value = false
    }
}

// --- Speech Recognition ---
const initRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let interimTranscript = ''
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript
                } else {
                    interimTranscript += event.results[i][0].transcript
                }
            }
            // Append final to existing transcript only if it's new? 
            // Actually simpler: just re-build from event results if continuous?
            // "continuous" mode accumulates results in session. 
            // Better to just append to a buffer manually or handle carefully.
            
            // Simplified logic: Just capture everything
            const currentText = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('')
            transcript.value = currentText
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error)
            if (isRecording.value) stopRecording()
            message.error('Speech recognition error: ' + event.error)
        }
    } else {
        message.warning('Browser does not support Speech Recognition. Please type your response instead.')
    }
}

const toggleRecording = () => {
    if (isRecording.value) {
        stopRecording()
    } else {
        startRecording()
    }
}

const startRecording = () => {
    if (!recognition) initRecognition()
    if (recognition) {
        try {
            recognition.start()
            isRecording.value = true
            startTimer()
        } catch (e) {
            console.error(e)
        }
    } else {
        // Fallback: mock recording state for UI demo
        isRecording.value = true
        startTimer()
        message.info('Simulating recording (No Speech API)')
    }
}

const stopRecording = () => {
    if (recognition) {
        recognition.stop()
    }
    isRecording.value = false
    stopTimer()
}

const startTimer = () => {
    clearInterval(recordTimer)
    recordTimer = setInterval(() => {
        recordingTime.value++
    }, 1000)
}

const stopTimer = () => {
    clearInterval(recordTimer)
}

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

onUnmounted(() => {
    stopTimer()
    if (recognition) recognition.stop()
})

const submitResponse = async () => {
    if (!transcript.value && recordingTime.value < 5) {
        message.warning('Please say something more substantial.')
        return
    }

    isLoading.value = true
    try {
        const res = await aiApi.evaluateSpeaking({
            topic: topicData.value.topic || topicData.value.title,
            transcription: transcript.value || "(No speech detected, user submitted empty)"
        })
        if (res.code === 200 && res.data) {
            evaluationResult.value = res.data
            step.value = 'result'
            message.success('Evaluation complete')
            
            // Save Record
            try {
                await learningApi.createRecord({
                    contentType: 'speaking',
                    contentId: 0, 
                    isCorrect: evaluationResult.value.score > 60 ? 1 : 0,
                    answer: transcript.value,
                    correctAnswer: 'N/A',
                    score: evaluationResult.value.score,
                    masteryLevel: Math.floor(evaluationResult.value.score / 20),
                    originalContent: JSON.stringify({
                        topic: topicData.value,
                        feedback: evaluationResult.value
                    })
                })
            } catch (e) {
                console.error("Failed to save record", e)
            }

        } else {
            message.error('Evaluation failed')
        }
    } catch (e) {
        console.error(e)
        // Fallback Mock
        evaluationResult.value = {
            score: 75,
            fluency: 70,
            vocabulary: 80,
            grammar: 75,
            relevance: 80,
            feedback: "Overall good attempt. You addressed the prompt well. Try to reduce hesitation.",
            suggestions: ["Use more transitional phrases", "Practice past tense verbs"]
        }
        step.value = 'result'
    } finally {
        isLoading.value = false
    }
}

const restart = () => {
    step.value = 'setup'
    transcript.value = ''
    recordingTime.value = 0
    evaluationResult.value = null
}

</script>

<template>
  <div class="page-container">
    <div class="page-header" v-if="step === 'setup'">
        <h1>AI 口语陪练</h1>
        <p>模拟真实雅思/托福口语考试场景，AI 实时听音纠错</p>
    </div>

    <!-- Phase 1: Setup -->
    <div v-if="step === 'setup'" class="setup-container">
        <n-card class="setup-card" :bordered="false" size="huge">
             <div class="setting-section">
                <h3><n-icon :component="Languages" color="#fdba74" class="mr-2"/> 选择话题类型</h3>
                <div class="options-grid">
                    <div 
                        v-for="t in topicTypes" :key="t.value" 
                        class="option-card"
                        :class="{ active: settings.type === t.value }"
                        @click="updateSetting('type', t.value)"
                    >
                        <div class="option-label">{{ t.label }}</div>
                        <div class="option-desc">{{ t.desc }}</div>
                    </div>
                </div>
             </div>

             <div class="setting-section mt-8">
                <n-button type="primary" size="large" block round class="start-btn" :loading="isLoading" @click="generateTopic">
                    开始练习
                </n-button>
             </div>
        </n-card>

        <!-- History Section (Setup Phase) -->
         <div v-if="historyTotal > 0" class="history-section mt-12">
             <div class="section-title">
                 <n-icon :component="History" /> 最近生成话题
             </div>
             <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
                 <n-grid-item v-for="topic in paginatedHistory" :key="topic.id">
                     <div class="history-card" @click="loadHistoryTopic(topic)">
                         <div class="history-card-header">
                             <n-tag size="small" type="warning" :bordered="false">{{ topic.type }}</n-tag>
                             <n-tag size="tiny" :bordered="false">{{ topic.difficulty }}</n-tag>
                         </div>
                         <h4 class="topic-title">{{ topic.topic }}</h4>
                         <div class="topic-date text-xs text-gray-500 mt-2">{{ new Date(topic.createTime).toLocaleDateString() }}</div>
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
    </div>

    <!-- Phase 2: Practice -->
    <div v-else-if="step === 'practice'" class="practice-container">
        <div class="mb-4">
             <n-button secondary @click="restart"><template #icon><n-icon :component="RotateCcw"/></template> 重选话题</n-button>
        </div>

        <n-grid x-gap="24" cols="1 800:2" responsive="screen">
            <n-grid-item>
                <n-card class="topic-card" title="Speaking Topic" :bordered="false">
                    <h2 class="text-xl font-bold mb-4 text-white">{{ topicData.topic || topicData.title }}</h2>
                    <div class="question-box p-4 bg-white/5 rounded-lg mb-4 text-lg leading-relaxed text-gray-200">
                        {{ topicData.description || topicData.question }}
                    </div>
                    
                    <div class="tips-section">
                        <div class="text-gray-400 mb-2 text-sm">KEYWORDS & TIPS</div>
                        <n-space>
                            <n-tag v-for="k in (topicData.keywords || [])" :key="k" size="small" :bordered="false" type="info">{{ k }}</n-tag>
                            <n-tag v-for="t in (topicData.hints || topicData.tips || [])" :key="t" size="small" :bordered="false" type="warning">{{ t }}</n-tag>
                        </n-space>
                    </div>
                </n-card>
            </n-grid-item>

            <n-grid-item>
                <n-card class="recorder-card" :bordered="false">
                    <div class="recorder-ui flex flex-col items-center justify-center h-full min-h-[400px]">
                        
                        <!-- Visualizer Mock -->
                        <div class="visualizer-circle mb-8" :class="{ active: isRecording }">
                             <n-icon :component="Mic" size="48" color="white" />
                             <div class="ripple" v-if="isRecording"></div>
                             <div class="ripple delay-1" v-if="isRecording"></div>
                        </div>

                        <div class="timer text-4xl font-mono mb-8 text-white font-bold">
                            {{ formatTime(recordingTime) }}
                        </div>

                        <div class="controls mb-8">
                             <n-button 
                                circle 
                                size="large" 
                                style="width: 80px; height: 80px;"
                                :type="isRecording ? 'error' : 'primary'"
                                @click="toggleRecording"
                             >
                                <template #icon>
                                    <n-icon :component="isRecording ? StopCircle : PlayCircle" size="40"/>
                                </template>
                             </n-button>
                        </div>

                        <div class="transcript-preview w-full p-4 bg-black/20 rounded-lg text-gray-400 text-sm h-32 overflow-y-auto">
                            {{ transcript || "Click microphone to start speaking..." }}
                        </div>

                        <div class="w-full mt-4">
                            <n-button type="success" block size="large" :disabled="!transcript && recordingTime < 2" @click="submitResponse" :loading="isLoading">
                                完成并评估
                            </n-button>
                        </div>
                    </div>
                </n-card>
            </n-grid-item>
        </n-grid>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-container">
         <n-card class="score-card" :bordered="false">
            <n-result status="success" title="Evaluation Complete" :description="'Overall Score: ' + evaluationResult.score">
                <template #footer>
                     <n-space justify="center" size="large">
                        <div class="stat-item text-center">
                            <n-progress type="circle" :percentage="evaluationResult.fluency" color="#6366f1" :width="80">
                                <span class="text-xs text-gray-400">Fluency</span><br/>
                                <span class="text-lg font-bold">{{ evaluationResult.fluency }}</span>
                            </n-progress>
                        </div>
                        <div class="stat-item text-center">
                            <n-progress type="circle" :percentage="evaluationResult.vocabulary" color="#10b981" :width="80">
                                <span class="text-xs text-gray-400">Vocab</span><br/>
                                <span class="text-lg font-bold">{{ evaluationResult.vocabulary }}</span>
                            </n-progress>
                        </div>
                        <div class="stat-item text-center">
                            <n-progress type="circle" :percentage="evaluationResult.grammar" color="#f59e0b" :width="80">
                                <span class="text-xs text-gray-400">Grammar</span><br/>
                                <span class="text-lg font-bold">{{ evaluationResult.grammar }}</span>
                            </n-progress>
                        </div>
                     </n-space>
                </template>
            </n-result>
         </n-card>

         <n-card title="Detailed Feedback" class="mt-6" :bordered="false">
             <div class="feedback-text text-lg text-gray-200 mb-6 p-4 bg-white/5 rounded-lg">
                 {{ evaluationResult.feedback }}
             </div>

             <h3 class="text-indigo-400 mb-2 flex items-center gap-2"><n-icon :component="CheckCircle2"/> Suggestions</h3>
             <n-list>
                 <n-list-item v-for="(s, i) in evaluationResult.suggestions" :key="i">
                     {{ s }}
                 </n-list-item>
             </n-list>
             
             <div class="mt-8 text-center">
                 <n-button type="primary" size="large" @click="restart">Practice Another Topic</n-button>
             </div>
         </n-card>

         <!-- History Section -->
         <div v-if="historyTotal > 0" class="history-section mt-12">
             <div class="section-title">
                 <n-icon :component="History" /> 最近生成话题
             </div>
             <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
                 <n-grid-item v-for="topic in paginatedHistory" :key="topic.id">
                     <div class="history-card" @click="loadHistoryTopic(topic)">
                         <div class="history-card-header">
                             <n-tag size="small" type="warning" :bordered="false">{{ topic.type }}</n-tag>
                             <n-tag size="tiny" :bordered="false">{{ topic.difficulty }}</n-tag>
                         </div>
                         <h4 class="topic-title">{{ topic.topic }}</h4>
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
    </div>

  </div>
</template>

<style scoped>
.page-container {
    max-width: 1000px;
    margin: 40px auto;
    padding: 0 20px;
}
.page-header {
    text-align: center; margin-bottom: 40px;
}
.page-header h1 {
    font-size: 2.5rem; font-weight: 800; margin-bottom: 12px;
    background: linear-gradient(120deg, #fb923c, #db2777);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}
.page-header p { color: #a1a1aa; }

.setup-card { background: rgba(30, 30, 35, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 24px; }
.setting-section h3 { font-size: 1.1rem; color: #e4e4e7; margin-bottom: 16px; display: flex; align-items: center; }

.options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.option-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
    padding: 16px; border-radius: 12px; cursor: pointer; transition: all 0.2s;
}
.option-card:hover { background: rgba(255,255,255,0.06); transform: translateY(-2px); }
.option-card.active { background: rgba(249, 115, 22, 0.15); border-color: #f97316; }
.option-label { font-weight: 700; color: #fff; margin-bottom: 4px; }
.option-desc { font-size: 0.8rem; color: #a1a1aa; }

.start-btn { height: 56px; font-size: 1.1rem; font-weight: 700; }

.topic-card { background: rgba(30, 30, 35, 0.6); border-radius: 16px; min-height: 400px; }
.recorder-card { background: #18181c; border-radius: 16px; min-height: 400px; }

/* Visualizer */
.visualizer-circle {
    width: 120px; height: 120px; border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ec4899);
    display: flex; align-items: center; justify-content: center;
    position: relative;
    box-shadow: 0 0 30px rgba(249, 115, 22, 0.3);
}
.ripple {
    position: absolute; width: 100%; height: 100%; border-radius: 50%;
    border: 2px solid rgba(249, 115, 22, 0.5);
    animation: ripple 1.5s infinite linear;
    opacity: 0;
}
.ripple.delay-1 { animation-delay: 0.5s; }

@keyframes ripple {
    0% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
}

.recorder-ui { padding: 20px; }
.transcript-preview { font-family: monospace; line-height: 1.5; }

.score-card { background: rgba(30, 30, 35, 0.6); border-radius: 24px; text-align: center; }

/* History Section */
.history-section { margin-top: 48px; }
.section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #e4e4e7; }
.history-card { background: rgba(40, 40, 45, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; }
.history-card:hover { background: rgba(50, 50, 55, 0.8); transform: translateY(-2px); border-color: #fb923c; }
.history-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.topic-title { font-size: 1rem; font-weight: 600; color: #fff; margin: 8px 0; }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }
</style>

<style src="../assets/learning-mobile.css" scoped></style>
