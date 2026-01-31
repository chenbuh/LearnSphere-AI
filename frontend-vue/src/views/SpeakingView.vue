<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NResult, useMessage, 
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, NIcon, NSpin, NPagination, NProgress
} from 'naive-ui'
import {
  Mic, PlayCircle, StopCircle, Volume2, Languages, RotateCcw,
  MessageCircle, BarChart, CheckCircle, CheckCircle2, User, Bot, AlertTriangle, History, Target, Share2
} from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'

import { useSpeakingStore } from '@/stores/speaking'
import { decryptPayload } from '@/utils/crypto'

const message = useMessage()
const speakingStore = useSpeakingStore()

// --- State ---
// 核心状态机：setup (设置) -> practice (练习/录音) -> result (评估结果)
const step = ref('setup') 
const isLoading = ref(false)
const topicData = ref(null)

// 录音相关状态
const isRecording = ref(false)
const transcript = ref('') // 实时语音转录文本
const recordingTime = ref(0) // 录音时长(秒)
let recordTimer = null
let recognition = null // 浏览器 SpeechRecognition 实例

// 评估结果状态
const evaluationResult = ref(null)
const historyTopics = ref([])

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)

// --- Settings State ---
const settings = ref({
  type: 'daily',
  difficulty: 'medium'
})

// 分享功能
const showShare = ref(false)
const shareContent = computed(() => ({
  title: `我在 LearnSphere AI 完成了口语练习！`,
  description: `刚刚完成了口语练习「${topicData.value?.topic || topicData.value?.title || '口语话题'}」，练习时长：${formatTime(recordingTime.value)}！快来一起学习吧！`,
  url: window.location.href
}))

const topicTypes = [
  { label: '日常对话', value: 'daily', icon: '💬' },
  { label: '工作场景', value: 'work', icon: '💼' },
  { label: '旅游出行', value: 'travel', icon: '✈️' },
  { label: '学术讨论', value: 'academic', icon: '📚' }
]

const difficulties = [
  { label: '入门', value: 'easy' },
  { label: '进阶', value: 'medium' },
  { label: '精通', value: 'hard' }
]

// --- Functions ---

// Paginated history
const paginatedHistory = computed(() => historyTopics.value)

const fetchHistory = async () => {
  try {
    const res = await aiApi.getSpeakingHistory(historyPage.value, historyPageSize.value)
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
    console.error('Failed to fetch speaking history', e)
  }
}

watch([historyPage, historyPageSize], () => {
  fetchHistory()
})

const loadHistoryTopic = (topic) => {
  topicData.value = decryptPayload(topic)
  transcript.value = ''
  recordingTime.value = 0
  step.value = 'practice'
  message.success(`已加载话题: ${topic.title}`)
  speakingStore.startPractice(topic, settings.value.type, settings.value.difficulty)
}

const updateSetting = (key, value) => {
  console.log(`[Speaking] Updating ${key} to ${value}`)
  settings.value[key] = value
}

// --- Lifecycle ---

onMounted(() => {
  fetchHistory()

  // 恢复进度逻辑
  if (speakingStore.topicData && speakingStore.currentMode === 'practice') {
     if (speakingStore.isExpired()) {
        message.warning('检测到练习数据已过期，已为您清除')
        speakingStore.clearPersistedState()
     } else {
        topicData.value = decryptPayload(speakingStore.topicData)
        transcript.value = speakingStore.transcript
        recordingTime.value = speakingStore.recordingTime
        step.value = 'practice' // 直接进入练习状态
        message.info('检测到未完成的练习，已为您恢复进度')
     }
  }
})

/**
 * 生成口语话题
 * 调用 AI 接口生成全新的口语题目，包含关键词和提示。
 */
const generateTopic = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.generateSpeaking({
            type: settings.value.type,
            difficulty: settings.value.difficulty
        })
        if (res.code === 200 && res.data) {
            topicData.value = decryptPayload(res.data)
            step.value = 'practice'
            transcript.value = ''
            recordingTime.value = 0
            message.success('话题生成成功！')
            
            speakingStore.startPractice(res.data, settings.value.type, settings.value.difficulty)
        } else {
            const errMsg = res.message || '话题生成失败，请重试'
            message.error(errMsg)
        }
    } catch (e) {
        console.error(e)
        // 降级 Mock 数据 (演示用)
        topicData.value = {
            title: 'Describe a traditional festival',
            question: 'Describe a traditional festival in your country. You should say: when it is celebrated, what people do, what you enjoy about it, and explain why it is important.',
            hints: ['Use present tense', 'Mention colors and food', 'Explain cultural significance'],
            keywords: ['Celebration', 'Tradition', 'Atmosphere', 'Customs']
        }
        step.value = 'practice'
        transcript.value = ''
        recordingTime.value = 0
    } finally {
        isLoading.value = false
    }
}

// --- Speech Recognition Logic ---

/**
 * 初始化语音识别引擎
 * 使用 Web Speech API (webkitSpeechRecognition)
 * 注意：此 API 需要浏览器支持 (Chrome/Edge) 且必须在 HTTPS 环境下运行。
 */
const initRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        recognition = new SpeechRecognition()
        recognition.continuous = true // 开启连续录音模式
        recognition.interimResults = true // 开启实时中间结果返回 (展示打字机效果)
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            let interimTranscript = ''
            let finalTranscript = ''

            // 遍历所有结果
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript
                } else {
                    interimTranscript += event.results[i][0].transcript
                }
            }
            
            // 简化逻辑：直接拼接所有结果以展示
            const currentText = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('')
            transcript.value = currentText
            
            // 实时同步到 Store
            speakingStore.updateProgress(currentText, recordingTime.value)
        }

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error)
            if (isRecording.value) stopRecording()
            message.error('语音识别出错: ' + event.error)
        }
    } else {
        message.warning('您的浏览器不支持语音识别功能，请尝试使用 Chrome 浏览器。')
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
        // 降级：如果不支持，模拟录音状态
        isRecording.value = true
        startTimer()
        message.info('模拟录音模式 (无语音 API)')
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
        speakingStore.updateProgress(transcript.value, recordingTime.value)
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
            evaluationResult.value = decryptPayload(res.data)
            step.value = 'result'
            message.success('Evaluation complete')
            speakingStore.completePractice(res.data)
            
            // Save Record
            try {
                await learningApi.createRecord({
                    contentType: 'speaking',
                    contentId: topicData.value.id || 0, 
                    isCorrect: evaluationResult.value.score > 60 ? 1 : 0,
                    answer: transcript.value,
                    correctAnswer: 'N/A',
                    score: evaluationResult.value.score,
                    masteryLevel: Math.floor(evaluationResult.value.score / 20),
                    timeSpent: Math.max(10, recordingTime.value), // Use recording duration as learning time
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
        console.error('评估失败', e)
        
        // Fallback Mock (由降级方案兜底，即便 AI 配额不足也尝试提供模拟结果)
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
    speakingStore.clearPersistedState()
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
                <div class="pill-options">
                    <div 
                        v-for="t in topicTypes" :key="t.value" 
                        class="pill-option"
                        :class="{ active: settings.type === t.value }"
                        @click="updateSetting('type', t.value)"
                    >
                        {{ t.label }}
                    </div>
                 </div>
             </div>

             <div class="setting-section mt-8">
                <h3><n-icon :component="Target" color="#a78bfa" class="mr-2"/> 选择难度等级</h3>
                <div class="pill-options">
                   <div 
                       v-for="d in difficulties" :key="d.value" 
                       class="pill-option"
                       :class="{ active: settings.difficulty === d.value }"
                       @click="updateSetting('difficulty', d.value)"
                   >
                       {{ d.label }}
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
                    <h2 class="text-xl font-bold mb-4">{{ topicData.topic || topicData.title }}</h2>
                    <div class="question-box p-4 rounded-lg mb-4 text-lg leading-relaxed secure-content">
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
                        
                        <div class="timer text-4xl font-mono mb-8 font-bold">
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
                                    <n-icon :component="isRecording ? StopCircle : Mic" size="40"/>
                                </template>
                             </n-button>
                             <p class="text-center text-gray-400 text-sm mt-3">
                                {{ isRecording ? '⏸️ 点击停止录音' : '🎤 点击开始录音' }}
                             </p>
                        </div>

                        <div class="transcript-preview w-full p-4 rounded-lg text-sm h-32 overflow-y-auto mb-4">
                            <div v-if="!transcript && !isRecording" class="text-center text-gray-500">
                                等待录音...
                            </div>
                            <div v-else-if="!transcript && isRecording" class="text-center text-blue-400">
                                🎙️ 正在聆听...
                            </div>
                            <div v-else class="whitespace-pre-wrap">{{ transcript }}</div>
                        </div>

                        <div class="w-full">
                            <n-button 
                                type="success" 
                                block 
                                size="large" 
                                :disabled="!transcript && recordingTime < 2" 
                                @click="submitResponse" 
                                :loading="isLoading"
                            >
                                <template #icon>
                                    <n-icon :component="CheckCircle" />
                                </template>
                                完成练习，提交评估
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
             <div class="feedback-text text-lg text-gray-200 mb-6 p-4 bg-white/5 rounded-lg secure-content">
                 {{ evaluationResult.feedback }}
             </div>

             <h3 class="text-indigo-400 mb-2 flex items-center gap-2"><n-icon :component="CheckCircle2"/> Suggestions</h3>
             <n-list class="secure-content">
                 <n-list-item v-for="(s, i) in evaluationResult.suggestions" :key="i">
                     {{ s }}
                 </n-list-item>
             </n-list>
              
              <div class="mt-8 text-center">
                  <n-space justify="center" vertical :size="12">
                    <n-button type="primary" size="large" @click="restart">Practice Another Topic</n-button>
                    <n-button secondary size="large" @click="showShare = true" class="share-btn">
                      <template #icon>
                        <n-icon :component="Share2" />
                      </template>
                      分享学习成果
                    </n-button>
                  </n-space>
              </div>
          </n-card>

          <!-- 分享弹窗 -->
          <ShareModal
            v-model:show="showShare"
            :title="shareContent.title"
            :description="shareContent.description"
            :url="shareContent.url"
          />

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
.page-header p {
    color: var(--secondary-text);
}

.setup-card { 
    border-radius: 24px; 
}

/* 强制覆盖 Naive UI NCard 的样式 */
.setup-card :deep(.n-card) {
    background-color: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
    color: var(--text-color);
}

.setting-section h3 { 
    font-size: 1.1rem; 
    color: var(--text-color); 
    margin-bottom: 16px; 
    display: flex; 
    align-items: center; 
}

.options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.option-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 16px; 
    border-radius: 12px; 
    cursor: pointer; 
    transition: var(--theme-transition);
}

.option-card:hover { 
    background: var(--accent-fill); 
    transform: translateY(-2px); 
}

.option-card.active { 
    background: rgba(249, 115, 22, 0.15); 
    border-color: #f97316; 
}

.option-label { 
    font-weight: 700; 
    margin-bottom: 4px; 
    color: var(--text-color);
}

.option-desc { 
    font-size: 0.8rem; 
    color: var(--secondary-text); 
}

.start-btn { height: 56px; font-size: 1.1rem; font-weight: 700; }

.topic-card { border-radius: 16px; min-height: 400px; }
.recorder-card { border-radius: 16px; min-height: 400px; }

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
.transcript-preview {
    font-family: monospace; 
    line-height: 1.5;
    background: var(--accent-fill); 
    color: var(--text-color);
    padding: 16px;
    border-radius: 8px;
}

.question-box, .feedback-text {
    background: var(--accent-fill); 
    color: var(--text-color);
    padding: 16px;
    border-radius: 8px;
}

.score-card { border-radius: 24px; text-align: center; }

/* History Section */
.history-section { margin-top: 48px; }
.section-title { 
    font-size: 1.2rem; 
    font-weight: 700; 
    margin-bottom: 20px; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    color: var(--text-color);
}

.history-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px; 
    padding: 16px; 
    cursor: pointer; 
    transition: var(--theme-transition);
}

.history-card:hover { 
    transform: translateY(-2px); 
    border-color: #fb923c; 
    background: var(--accent-fill);
}

.history-card-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 8px; 
}

.topic-title { 
    font-size: 1rem; 
    font-weight: 600; 
    margin: 8px 0; 
    color: var(--text-color);
}

.pagination-wrapper { 
    display: flex; 
    justify-content: center; 
    margin-top: 24px; 
}

/* Pill Options */
.pill-options {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.pill-option {
    padding: 10px 20px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.03);
    border: 2px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    color: #52525b;
}

:global(.dark-mode) .pill-option {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.05);
    color: #a1a1aa;
}

.pill-option:hover {
    background: rgba(168, 85, 247, 0.1);
    border-color: #a78bfa;
    color: #a78bfa;
}

.pill-option.active {
    background: #a78bfa;
    border-color: #a78bfa;
    color: white;
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
