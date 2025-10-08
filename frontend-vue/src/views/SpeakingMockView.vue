<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { 
  NCard, NButton, NInput, NSpace, NAvatar, NTag, NSpin, 
  useMessage, useNotification, NIcon, NScrollbar, NDivider, NModal, NEmpty, NTooltip, NSlider, NProgress, NNumberAnimation
} from 'naive-ui'
import confetti from 'canvas-confetti'
import { 
  Mic, MicOff, Send, Phone, PhoneOff, User, Bot, Sparkles, 
  ChevronLeft, History, Trophy, MessageSquare, Volume2, VolumeX, Settings,
  CheckCircle2, AlertCircle, FileText, Download, Share2
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { useUserStore } from '@/store/user'

const message = useMessage()
const notification = useNotification()
const userStore = useUserStore()

// Session State
const isStarted = ref(false)
const isEnding = ref(false)
const loading = ref(false)
const sessionId = ref(null)
const selectedTopic = ref('Work & Study')
const selectedDifficulty = ref('Medium')

// AI Voice Settings
const isAutoPlay = ref(true)
const voiceVolume = ref(80)

// Conversation
const messages = ref([])
const userInput = ref('')
const scrollRef = ref(null)

// Report State
const showReport = ref(false)
const reportLoading = ref(false)
const reportData = ref(null)

// Leaderboard State
const leaderboardData = ref([])
const fetchLeaderboard = async () => {
    try {
        const res = await aiApi.getSpeakingLeaderboard()
        if (res.code === 200) leaderboardData.value = res.data
    } catch (e) {}
}

// Web Speech API
let recognition = null
const isRecording = ref(false)
const interleavedText = ref('') 

const topics = ['Work & Study', 'Hobbies', 'Technology', 'Culture', 'Travel', 'Daily Life']
const difficulties = [
  { label: '简单', value: 'Easy' },
  { label: '中等', value: 'Medium' },
  { label: '困难', value: 'Hard' }
]

// Initialize Speech Recognition
const initRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
        message.warning('您的浏览器不支持语音识别，请手动输入文字。')
        return
    }

    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => { isRecording.value = true; interleavedText.value = '' }
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('')
        interleavedText.value = transcript
        userInput.value = transcript
    }
    recognition.onerror = (event) => {
        isRecording.value = false
        if (event.error !== 'no-speech') message.error('语音识别出错: ' + event.error)
    }
    recognition.onend = () => { isRecording.value = false }
}

const toggleRecording = () => {
    if (!recognition) { initRecognition(); if (!recognition) return }
    if (isRecording.value) recognition.stop()
    else { try { recognition.start() } catch (e) {} }
}

const speak = (text) => {
    if (!isAutoPlay.value) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.volume = voiceVolume.value / 100
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'))
    if (preferredVoice) utterance.voice = preferredVoice
    window.speechSynthesis.speak(utterance)
}

const startMock = async () => {
    loading.value = true
    try {
        const res = await aiApi.startSpeakingMock({ topic: selectedTopic.value, difficulty: selectedDifficulty.value })
        if (res.code === 200) {
            sessionId.value = res.data.sessionId
            isStarted.value = true
            messages.value = [
                { role: 'assistant', content: res.data.greeting },
                { role: 'assistant', content: res.data.firstQuestion }
            ]
            setTimeout(() => speak(res.data.greeting + ". " + res.data.firstQuestion), 500)
        }
    } catch (e) {
        message.error('启动失败')
    } finally {
        loading.value = false
        scrollToBottom()
    }
}

const handleSend = async () => {
    if (!userInput.value.trim() || loading.value) return
    const text = userInput.value
    userInput.value = ''; interleavedText.value = ''
    messages.value.push({ role: 'user', content: text })
    scrollToBottom()
    loading.value = true
    try {
        const res = await aiApi.continueSpeakingMock({ sessionId: sessionId.value, transcription: text })
        if (res.code === 200) {
            messages.value.push({ role: 'assistant', content: res.data.nextQuestion, feedback: res.data.feedback })
            speak(res.data.nextQuestion)
        }
    } catch (e) {
        message.error('信号中断...')
    } finally {
        loading.value = false
        scrollToBottom()
    }
}

const handleFinish = async () => {
    if (messages.value.length < 4) {
        message.warning('对话轮数太少，建议至少进行3轮对话后再生成报告。')
        return
    }
    reportLoading.value = true
    showReport.value = true
    try {
        const res = await aiApi.generateSpeakingReport(messages.value)
        if (res.code === 200) {
            reportData.value = res.data
            
            // Check for new achievements
            if (res.data.newAchievements?.length > 0) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#fbbf24'] })
                setTimeout(() => { confetti({ particleCount: 100, spread: 100, origin: { x: 0.3, y: 0.7 } }) }, 200)
                setTimeout(() => { confetti({ particleCount: 100, spread: 100, origin: { x: 0.7, y: 0.7 } }) }, 400)

                res.data.newAchievements.forEach(achv => {
                    notification.success({
                        title: '✨ 荣获新成就！',
                        content: `恭喜！您已点亮勋章：【${achv.name}】。${achv.description}`,
                        duration: 8000,
                        meta: new Date().toLocaleString()
                    })
                })
            }
        }
    } catch (e) {
        message.error('生成报告失败')
        showReport.value = false
    } finally {
        reportLoading.value = false
    }
}

const scrollToBottom = () => {
    nextTick(() => { if (scrollRef.value) scrollRef.value.scrollTo({ top: 999999, behavior: 'smooth' }) })
}

const endSession = () => {
    window.speechSynthesis.cancel()
    if (recognition) recognition.stop()
    isStarted.value = false
    sessionId.value = null
    messages.value = []
    showReport.value = false
    reportData.value = null
}

onMounted(() => {
    initRecognition()
    window.speechSynthesis.getVoices()
    fetchLeaderboard()
})

onUnmounted(() => {
    window.speechSynthesis.cancel()
    if (recognition) recognition.stop()
})

</script>

<template>
  <div class="mock-container">
    <!-- Header -->
    <header class="view-header">
       <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <n-button quaternary circle @click="$router.back()"><ChevronLeft /></n-button>
            <div>
                <h1>AI 1V1 口语智能模考</h1>
                <p>沉浸式全英对话，AI 考官实时追踪你的表达质量</p>
            </div>
          </div>

          <div v-if="isStarted" class="flex items-center gap-4 voice-controls">
             <n-button type="primary" secondary round @click="handleFinish">
                <template #icon><FileText :size="16" /></template>
                生成结课报告
             </n-button>
             <n-tooltip trigger="hover">
                <template #trigger>
                   <n-button quaternary circle @click="isAutoPlay = !isAutoPlay">
                      <n-icon :component="isAutoPlay ? Volume2 : VolumeX" :color="isAutoPlay ? '#10b981' : '#71717a'" />
                   </n-button>
                </template>
                {{ isAutoPlay ? 'AI 语音已开启' : 'AI 语音已静音' }}
             </n-tooltip>
             <div class="volume-slider w-24">
                <n-slider v-model:value="voiceVolume" :step="10" />
             </div>
          </div>
       </div>
    </header>

    <main class="main-content">
      <n-card v-if="!isStarted" class="setup-card" :bordered="false">
         <div class="setup-content">
            <div class="icon-hero">
                <div class="blob indigo"></div>
                <div class="pulse-ring"></div>
                <Mic :size="48" class="relative z-10 text-indigo-400" />
            </div>
            <h2>开启一场高阶口语实战</h2>
            <p>本次模考将记录您的发音、词汇及逻辑，完成后可一键生成 360° AI 分析报告。</p>

            <div class="form-grid">
               <div class="form-group"><label>选择话题</label><n-space><n-tag v-for="t in topics" :key="t" :checked="selectedTopic === t" checkable @update:checked="selectedTopic = t">{{ t }}</n-tag></n-space></div>
               <div class="form-group mt-6"><label>难度等级</label><n-space><n-button v-for="d in difficulties" :key="d.value" round :secondary="selectedDifficulty !== d.value" :type="selectedDifficulty === d.value ? 'primary' : 'default'" @click="selectedDifficulty = d.value">{{ d.label }}</n-button></n-space></div>
            </div>
            <n-button type="primary" size="large" round block class="mt-8 start-btn" :loading="loading" @click="startMock">立即开启训练</n-button>
         </div>
      </n-card>

      <div v-else class="exam-view-container flex gap-6 h-[75vh]">
          <div class="exam-view flex-1 flex flex-col">
             <div class="exam-header">
                 <div class="flex items-center gap-3"><div class="pulse-red"></div><span class="text-zinc-400 font-mono tracking-tighter">IELTS SIMULATION • ACTIVE</span></div>
                 <n-button size="small" type="error" quaternary round @click="endSession">终止会话</n-button>
             </div>

             <div class="chat-wrapper">
                 <n-scrollbar ref="scrollRef" class="chat-area">
                    <div class="messages-list">
                        <div v-for="(msg, idx) in messages" :key="idx" :class="['msg-bubble', msg.role]">
                            <div class="avatar-wrap">
                                <n-avatar round size="small" :src="msg.role === 'assistant' ? '' : userStore.userInfo?.avatar" :style="{ background: msg.role === 'assistant' ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#3f3f46' }">
                                    <template v-if="msg.role === 'assistant'" #icon><Bot /></template>
                                    <template v-else #icon><User /></template>
                                </n-avatar>
                            </div>
                            <div class="msg-content">
                                <div v-if="msg.feedback" class="ai-feedback"><div class="feedback-tag"><Sparkles :size="10" /> Real-time feedback</div>{{ msg.feedback }}</div>
                                <div class="text">{{ msg.content }}</div>
                            </div>
                        </div>
                    </div>
                 </n-scrollbar>
                 <div v-if="interleavedText" class="interim-overlay"><div class="wave-lines"><div v-for="i in 5" :key="i" class="line"></div></div><span class="interim-text">{{ interleavedText }}</span></div>
                 <div class="input-area"><div class="flex gap-4 items-end"><div class="recorder-btn-wrap"><button :class="['recorder-btn', { recording: isRecording }]" @mousedown="toggleRecording"><Mic v-if="!isRecording" :size="24" /><div v-else class="recording-bars"><span></span><span></span><span></span><span></span></div></button></div><div class="flex-1"><n-input-group><n-input v-model:value="userInput" placeholder="点击麦克风或直接回复..." round :disabled="loading" @keyup.enter="handleSend"/><n-button type="primary" circle :disabled="!userInput.trim() || loading" @click="handleSend" style="width: 44px; height: 44px;"><Send :size="18" /></n-button></n-input-group></div></div></div>
             </div>
          </div>

          <!-- Leaderboard Sidebar -->
          <div class="leaderboard-sidebar w-72">
             <n-card :bordered="false" class="sidebar-card h-full">
                <div class="sidebar-header flex items-center gap-2 mb-4">
                    <Trophy :size="20" class="text-yellow-500" />
                    <span class="font-black text-lg">口语高分榜</span>
                </div>
                <div v-if="leaderboardData.length" class="leaderboard-list">
                    <div v-for="(item, idx) in leaderboardData" :key="idx" class="leader-item">
                        <div class="rank" :class="'rank-' + (idx + 1)">{{ idx + 1 }}</div>
                        <n-avatar round size="small" :src="item.avatar" class="avatar" />
                        <div class="info">
                            <div class="name">{{ item.username }}</div>
                            <div class="score">{{ item.score }} pts</div>
                        </div>
                    </div>
                </div>
                <n-empty v-else description="暂无记录" />
             </n-card>
          </div>
      </div>
    </main>

    <!-- Post-Exam Analysis Modal -->
    <n-modal v-model:show="showReport" :mask-closable="false" class="report-modal">
        <n-card style="width: 800px; border-radius: 32px;" :bordered="false" class="premium-dark-card">
            <template #header>
                <div class="p-4 flex justify-between items-center">
                    <h2 class="text-2xl font-black text-white flex items-center gap-2"><Trophy class="text-yellow-500" /> AI 结课深度评估报告</h2>
                    <n-button quaternary circle @click="showReport = false"><ChevronLeft /></n-button>
                </div>
            </template>
            
            <n-spin :show="reportLoading">
                <div v-if="reportData" class="report-content p-6">
                    <!-- Score Overview -->
                    <div class="score-hero">
                        <div class="main-score">
                            <div class="score-circle">
                                <n-progress 
                                  type="circle" 
                                  :percentage="reportData.score" 
                                  :stroke-width="10" 
                                  color="#6366f1"
                                >
                                    <div class="text-center">
                                        <p class="text-zinc-500 text-xs font-bold uppercase">Overall</p>
                                        <h3 class="text-4xl font-black text-white"><n-number-animation :from="0" :to="reportData.score" /></h3>
                                    </div>
                                </n-progress>
                            </div>
                        </div>
                        <div class="dimension-stats grid grid-cols-2 gap-4 flex-1">
                            <div v-for="(val, key) in reportData.dimensions" :key="key" class="dim-item">
                                <div class="flex justify-between mb-1">
                                    <span class="text-xs text-zinc-400 uppercase font-bold">{{ key }}</span>
                                    <span class="text-xs text-white font-bold">{{ val }}</span>
                                </div>
                                <n-progress type="line" :percentage="val" :show-indicator="false" :height="4" :color="val > 80 ? '#10b981' : '#f59e0b'" />
                            </div>
                        </div>
                    </div>

                    <n-divider />

                    <!-- Detailed Feedback -->
                    <div class="grid grid-cols-2 gap-8 mt-6">
                        <div class="feedback-col">
                            <h4 class="flex items-center gap-2 text-emerald-400 mb-4 font-bold"><CheckCircle2 :size="18" /> 核心亮点</h4>
                            <ul class="feedback-list highlight">
                                <li v-for="s in reportData.strengths" :key="s">{{ s }}</li>
                            </ul>
                        </div>
                        <div class="feedback-col">
                            <h4 class="flex items-center gap-2 text-amber-400 mb-4 font-bold"><AlertCircle :size="18" /> 改进空间</h4>
                            <ul class="feedback-list warning">
                                <li v-for="w in reportData.weaknesses" :key="w">{{ w }}</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Model Answer -->
                    <div class="model-answer-section mt-8">
                        <h4 class="flex items-center gap-2 text-indigo-400 mb-4 font-bold"><Sparkles :size="18" /> AI 之选 (Model Answer)</h4>
                        <div class="model-bubble">
                            {{ reportData.modelAnswer }}
                        </div>
                    </div>
                </div>
                <div v-else class="h-80 flex flex-col items-center justify-center gap-4">
                    <n-spin size="large" />
                    <p class="text-zinc-500 italic">智囊团正在深度复盘您的表现...</p>
                </div>
            </n-spin>

            <template #footer>
                <div class="flex justify-between p-4 bg-black/20 rounded-b-3xl">
                    <n-space>
                       <n-button secondary round @click="endSession">重新模考</n-button>
                       <n-button quaternary round><Share2 :size="16" class="mr-1" /> 分享战绩</n-button>
                    </n-space>
                    <n-button type="primary" round style="padding: 0 30px" @click="showReport = false">掌握并返回</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
  </div>
</template>

<style scoped>
.mock-container { max-width: 1000px; margin: 0 auto; padding: 20px; min-height: 90vh; display: flex; flex-direction: column; }
.view-header { margin-bottom: 32px; }
.view-header h1 { font-size: 2.2rem; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 8px; }
.view-header p { color: #71717a; }

.setup-card { background: rgba(24, 24, 27, 0.6) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important; border-radius: 32px; padding: 40px; }
.setup-content { text-align: center; max-width: 500px; margin: 0 auto; }
.icon-hero { position: relative; width: 120px; height: 120px; margin: 0 auto 32px; display: flex; align-items: center; justify-content: center; }
.blob { position: absolute; width: 100px; height: 100px; border-radius: 40%; filter: blur(25px); opacity: 0.3; animation: rotate 10s infinite linear; background: #6366f1; }
.pulse-ring { position: absolute; width: 100%; height: 100%; border: 2px solid #6366f1; border-radius: 50%; opacity: 0; animation: pulse-ring 2s infinite; }
@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.5); opacity: 0; } }
@keyframes rotate { from { transform: rotate(0deg) scale(1); } to { transform: rotate(360deg) scale(1.2); } }

.setup-content h2 { font-size: 1.8rem; font-weight: 800; margin-bottom: 12px; }
.setup-content p { color: #a1a1aa; margin-bottom: 32px; }

.form-grid { text-align: left; }
.form-grid label { display: block; font-size: 0.8rem; font-weight: 700; color: #52525b; text-transform: uppercase; margin-bottom: 12px; }
.start-btn { height: 54px; font-weight: 800; font-size: 1.1rem; box-shadow: 0 10px 20px -10px #6366f1; transition: all 0.3s; }

/* Exam View */
.exam-view { flex: 1; display: flex; flex-direction: column; background: rgba(24, 24, 27, 0.4); border-radius: 28px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; height: 75vh; box-shadow: 0 20px 50px -20px black; }
.exam-header { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); }
.pulse-red { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2); animation: pulse 1.5s infinite; }

.chat-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.chat-area { flex: 1; padding: 24px; }
.messages-list { display: flex; flex-direction: column; gap: 24px; }

.msg-bubble { display: flex; gap: 12px; max-width: 80%; }
.msg-bubble.user { align-self: flex-end; flex-direction: row-reverse; }
.avatar-wrap { flex-shrink: 0; padding-top: 4px; }

.msg-content { background: rgba(255,255,255,0.04); padding: 14px 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
.assistant .msg-content { border-top-left-radius: 4px; }
.user .msg-content { background: linear-gradient(135deg, #4f46e5, #6366f1); border-color: rgba(255,255,255,0.1); border-top-right-radius: 4px; }
.msg-content .text { line-height: 1.6; font-size: 0.95rem; color: #e4e4e7; }

.ai-feedback { margin-bottom: 12px; padding: 12px; background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; border-radius: 8px; font-size: 0.85rem; color: #6ee7b7; }
.feedback-tag { display: flex; align-items: center; gap: 6px; font-weight: 900; font-size: 0.6rem; text-transform: uppercase; margin-bottom: 6px; }

/* Interim Overlay */
.interim-overlay { position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); width: 80%; background: rgba(16, 185, 129, 0.95); padding: 12px 24px; border-radius: 100px; display: flex; align-items: center; gap: 16px; color: #fff; z-index: 100; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.wave-lines { display: flex; gap: 3px; }
.wave-lines .line { width: 3px; height: 12px; background: #fff; border-radius: 10px; animation: wave-grow 0.5s infinite alternate; }
@keyframes wave-grow { to { height: 24px; } }

/* Input area */
.input-area { padding: 24px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); }
.recorder-btn { width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
.recorder-btn.recording { background: #ef4444; border-color: #f87171; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }

.recording-bars { display: flex; gap: 2px; align-items: flex-end; height: 20px; }
.recording-bars span { width: 3px; background: #fff; border-radius: 2px; height: 20%; animation: rec-grow 0.6s infinite alternate; }
@keyframes rec-grow { to { height: 100%; } }

/* Report Modal & Card Style */
.premium-dark-card { background: radial-gradient(circle at top left, #1f1f23, #111114) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #fff; }
.score-hero { display: flex; align-items: center; gap: 40px; background: rgba(255,255,255,0.03); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); }
.dim-item { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px; }

.feedback-list { list-style: none; padding: 0; }
.feedback-list li { padding: 8px 12px; margin-bottom: 8px; border-radius: 8px; font-size: 0.85rem; line-height: 1.5; }
.feedback-list.highlight li { background: rgba(16, 185, 129, 0.05); border-left: 2px solid #10b981; color: #d1fae5; }
.feedback-list.warning li { background: rgba(245, 158, 11, 0.05); border-left: 2px solid #f59e0b; color: #fef3c7; }

.model-bubble { background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 1px solid rgba(99, 102, 241, 0.2); padding: 20px; border-radius: 20px; line-height: 1.8; color: #e4e4e7; font-style: italic; border-bottom-left-radius: 4px; }

:deep(.n-input) { background: rgba(15, 15, 20, 0.8) !important; border-color: rgba(255,255,255,0.08) !important; color: #fff !important; height: 44px; border-radius: 22px; }

/* Leaderboard Styles */
.sidebar-card { background: rgba(24, 24, 27, 0.6) !important; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05) !important; }
.leaderboard-list { display: flex; flex-direction: column; gap: 12px; }
.leader-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
.rank { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; background: #3f3f46; color: #a1a1aa; }
.rank-1 { background: linear-gradient(135deg, #fbbf24, #d97706); color: #fff; }
.rank-2 { background: linear-gradient(135deg, #94a3b8, #475569); color: #fff; }
.rank-3 { background: linear-gradient(135deg, #b45309, #78350f); color: #fff; }

.leader-item .info { flex: 1; }
.leader-item .name { font-size: 0.8rem; font-weight: 700; color: #e4e4e7; }
.leader-item .score { font-size: 0.7rem; color: #10b981; font-weight: 800; font-family: monospace; }
</style>
