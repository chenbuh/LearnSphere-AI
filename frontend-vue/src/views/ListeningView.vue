<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, useMessage, NSpin
} from 'naive-ui'
import { 
  Rocket, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Brain, Target, Clock, BookOpen, AlertCircle, History,
  ArrowLeft
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'

const message = useMessage()

// --- State ---
const step = ref('setup') // 'setup' | 'testing' | 'result'
const isLoading = ref(false)
const currentQuestionIndex = ref(0)
const answers = ref({})
const score = ref(0)
const generatedQuestions = ref([])
const audioScript = ref('')
const historyMaterials = ref([])
const materialTitle = ref('')

// --- Settings State ---
const settings = ref({
  examType: 'ted',
  mode: 'extensive',
  difficulty: 'normal',
  count: 10
})

// --- Options Constants ---
const examTypes = [
  { label: 'TED 演讲', value: 'ted', icon: '🎤' },
  { label: 'BBC 新闻', value: 'bbc', icon: '🌏' },
  { label: '日常对话', value: 'dialog', icon: '💬' },
  { label: '托福听力', value: 'toefl', icon: '🗽' },
  { label: '雅思听力', value: 'ielts', icon: '🇬🇧' },
  { label: '英语故事', value: 'stories', icon: '📖' }
]

const testModes = [
  { label: '精听训练', value: 'intensive', icon: Target, desc: '逐句听写/跟读' },
  { label: '泛听理解', value: 'extensive', icon: BookOpen, desc: '理解大意/答题' },
  { label: '听音辨词', value: 'dictation', icon: Brain, desc: '单词拼写/填空' }
]

const difficulties = [
  { label: '慢速', value: 'slow' },
  { label: '标准', value: 'normal' },
  { label: '快速', value: 'fast' },
  { label: '混合', value: 'mixed' }
]

const counts = [5, 10, 15, 20]

// 是否正在听力练习中（用于离开提醒）
const isListeningInProgress = computed(() => step.value === 'testing' && Object.keys(answers.value).length > 0)

// 离开页面提醒
const handleBeforeUnload = (e) => {
  if (isListeningInProgress.value) {
    e.preventDefault()
    e.returnValue = '听力练习正在进行中，确定要离开吗？你的答题进度将会丢失。'
    return e.returnValue
  }
}

// --- Logic ---

const updateSetting = (key, value) => {
  settings.value[key] = value
}

onMounted(() => {
    fetchHistory()
    window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
})

const fetchHistory = async () => {
    try {
        const res = await aiApi.getListeningHistory()
        if (res.code === 200) {
            historyMaterials.value = res.data || []
        }
    } catch (e) {
        console.error("Failed to fetch history", e)
    }
}

const loadMaterial = (item) => {
    generatedQuestions.value = item.questions
    audioScript.value = item.script
    materialTitle.value = item.title
    answers.value = {}
    currentQuestionIndex.value = 0
    score.value = 0
    step.value = 'testing'
}

// Generate Listening Questions
const generateQuestions = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.generateListening({
            type: settings.value.examType,
            difficulty: settings.value.difficulty
        })
        if (res.code === 200 && res.data) {
           generatedQuestions.value = res.data.questions || []
           audioScript.value = res.data.script || ''
           materialTitle.value = res.data.title || 'Listening Material'
           
           if(generatedQuestions.value.length === 0) {
               message.warning('未生成题目，使用模拟数据')
           }

           currentQuestionIndex.value = 0
           answers.value = {}
           step.value = 'testing'
           message.success('听力生成成功')
           fetchHistory()
        } else {
             message.error('生成失败')
        }
    } catch (e) {
        console.error(e)
        message.error('网络请求失败')
    } finally {
        isLoading.value = false
    }
}

const selectAnswer = (optionIndex) => {
   answers.value[currentQuestionIndex.value] = optionIndex
}

const nextQuestion = () => {
    if (currentQuestionIndex.value < generatedQuestions.value.length - 1) {
       currentQuestionIndex.value++
    }
}

const prevQuestion = () => {
    if (currentQuestionIndex.value > 0) {
       currentQuestionIndex.value--
    }
}

const submitExam = async () => {
    let correctCount = 0
    const questions = generatedQuestions.value
    
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const userA = answers.value[i]
        const isCorrect = userA === q.correct
        
        if (isCorrect) correctCount++

        // Save learning record for each question, including original content (audio script)
        try {
            await learningApi.createRecord({
                contentId: i, // Use index or ID if available
                contentType: 'listening',
                isCorrect: isCorrect ? 1 : 0,
                answer: userA !== undefined ? String(userA) : '-1',
                correctAnswer: String(q.correct),
                masteryLevel: isCorrect ? 3 : 1,
                originalContent: JSON.stringify({
                    title: materialTitle.value,
                    script: audioScript.value,
                    question: q
                })
            })
        } catch (e) {
            console.error('Failed to save record', e)
        }
    }

    score.value = Math.round((correctCount / questions.length) * 100)
    step.value = 'result'
}

const restart = () => {
    step.value = 'setup'
    answers.value = {}
    currentQuestionIndex.value = 0
    score.value = 0
    generatedQuestions.value = []
}

const progressPercent = computed(() => {
    if (generatedQuestions.value.length === 0) return 0
    return ((currentQuestionIndex.value + 1) / generatedQuestions.value.length) * 100
})

const wrongAnswers = computed(() => {
    return generatedQuestions.value.filter((q, idx) => answers.value[idx] !== q.correct)
})
</script>

<template>
  <div class="page-container">
    
    <!-- Top Header -->
    <div class="page-header" v-if="step === 'setup'">
         <h1>听力专项测试</h1>
         <p>定制个性化听力训练计划，提升听音辨义能力</p>
    </div>

    <!-- Phase 1: Setup -->
    <div v-if="step === 'setup'" class="setup-container">
       <n-card class="setup-card" :bordered="false" size="huge">
          <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
             
             <!-- Left Column -->
             <n-grid-item span="2">
                 <!-- Exam Type (Material Type) -->
                 <div class="setting-section">
                    <h3><n-icon :component="BookOpen" color="#6366f1" /> 听力素材</h3>
                    <div class="grid-options exam-type-grid">
                       <div 
                          v-for="type in examTypes" 
                          :key="type.value"
                          class="option-card"
                          :class="{ active: settings.examType === type.value }"
                          @click="updateSetting('examType', type.value)"
                       >
                          <span class="option-icon">{{ type.icon }}</span>
                          <span class="option-label">{{ type.label }}</span>
                       </div>
                    </div>
                 </div>

                 <!-- Test Mode -->
                 <div class="setting-section">
                    <h3><n-icon :component="Target" color="#a855f7" /> 训练模式</h3>
                    <div class="grid-options mode-grid">
                       <div 
                          v-for="mode in testModes" 
                          :key="mode.value"
                          class="option-card mode-card"
                          :class="{ active: settings.mode === mode.value }"
                          @click="updateSetting('mode', mode.value)"
                       >
                          <div class="mode-icon-wrapper">
                              <n-icon :component="mode.icon" />
                          </div>
                          <div class="mode-info">
                              <div class="option-label">{{ mode.label }}</div>
                              <div class="option-desc">{{ mode.desc }}</div>
                          </div>
                       </div>
                    </div>
                 </div>
             </n-grid-item>

             <!-- Right Column -->
             <n-grid-item>
                 <div class="side-settings">
                    <!-- Difficulty (Speed) -->
                    <div class="setting-section">
                        <h3><n-icon :component="Clock" color="#eab308" /> 语速设置</h3>
                        <div class="pill-options">
                           <div 
                              v-for="diff in difficulties" 
                              :key="diff.value"
                              class="pill-option"
                              :class="{ active: settings.difficulty === diff.value }"
                              @click="updateSetting('difficulty', diff.value)"
                           >
                              {{ diff.label }}
                           </div>
                        </div>
                    </div>

                    <!-- Count -->
                    <div class="setting-section">
                        <h3><n-icon :component="Brain" color="#10b981" /> 篇章数量</h3>
                        <div class="pill-options">
                           <div 
                              v-for="c in counts" 
                              :key="c"
                              class="pill-option"
                              :class="{ active: settings.count === c }"
                              @click="updateSetting('count', c)"
                           >
                              {{ c }} 篇
                           </div>
                        </div>
                    </div>

                    <n-divider />

                    <n-button 
                        type="primary" 
                        size="large" 
                        block 
                        round
                        class="start-btn"
                        :loading="isLoading"
                        @click="generateQuestions"
                    >
                        <template #icon><n-icon :component="Rocket" /></template>
                        开始训练
                    </n-button>
                 </div>
             </n-grid-item>
          </n-grid>
       </n-card>

       <!-- History Section -->
       <div v-if="historyMaterials.length > 0" class="history-section">
           <div class="section-title">
                <n-icon :component="History" /> 最近生成
           </div>
           <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:3">
                <n-grid-item v-for="item in historyMaterials" :key="item.id">
                    <n-card class="history-card" hoverable @click="loadMaterial(item)">
                        <template #header>
                            <n-tag size="small" :bordered="false" type="info" class="mb-1">{{ (item.type || 'N/A').toUpperCase() }}</n-tag>
                            <div class="history-title">{{ item.title }}</div>
                        </template>
                        <template #footer>
                            <div class="history-footer">
                                <n-tag size="tiny" :bordered="false">{{ item.difficulty }}</n-tag>
                                <span class="word-count">{{ item.questions?.length || 0 }} 题</span>
                            </div>
                        </template>
                    </n-card>
                </n-grid-item>
           </n-grid>
       </div>
    </div>

    <!-- Phase 2: Testing -->
    <div v-else-if="step === 'testing'" class="testing-container">
       
       <!-- Back Button -->
       <div class="back-button-container">
           <n-button secondary @click="restart">
               <template #icon>
                   <n-icon :component="RotateCcw" />
               </template>
               返回设置
           </n-button>
       </div>

       <div class="progress-bar-container">
            <div class="progress-info">
                <span>进度</span>
                <span>{{ currentQuestionIndex + 1 }} / {{ generatedQuestions.length }}</span>
            </div>
            <n-progress 
                type="line" 
                :percentage="progressPercent" 
                :show-indicator="false" 
                color="#6366f1"
                rail-color="#3f3f46"
                :height="8"
            />
       </div>

       <n-card class="question-card" :bordered="false" size="large">
           <!-- Audio Player Placeholder -->
           <div class="audio-player-mock">
               <div class="visualizer">
                   <div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
               </div>
               <div class="play-btn-circle">
                   <n-icon :component="Target" size="32" class="ml-1" />
               </div>
               <div class="track-info">
                   <h4>{{ materialTitle }}</h4>
                   <p>Click to play audio</p>
               </div>
           </div>

           <div class="question-content">
               <h3 class="q-text">{{ generatedQuestions[currentQuestionIndex].question }}</h3>
               
               <div class="options-container">
                   <n-grid x-gap="20" y-gap="20" cols="1">
                       <n-grid-item v-for="(option, idx) in generatedQuestions[currentQuestionIndex].options" :key="idx">
                           <div 
                                class="answer-option"
                                :class="{ selected: answers[currentQuestionIndex] === idx }"
                                @click="selectAnswer(idx)"
                           >
                               <span class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                               <span class="option-text">{{ option }}</span>
                           </div>
                       </n-grid-item>
                   </n-grid>
               </div>
           </div>
           
           <div class="actions-footer">
               <n-button v-if="currentQuestionIndex > 0" secondary @click="prevQuestion" class="mr-4">上一题</n-button>
               
               <n-button v-if="currentQuestionIndex < generatedQuestions.length - 1" type="primary" @click="nextQuestion">下一题</n-button>
               <n-button v-else type="success" @click="submitExam">提交试卷</n-button>
           </div>
       </n-card>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-container">
        <n-card class="score-card" :bordered="false">
            <n-result status="success" title="训练完成" :description="'你的正确率：' + score + '%'">
                <template #icon>
                    <n-icon :component="Trophy" size="80" color="#eab308" />
                </template>
                <template #footer>
                    <n-space justify="center">
                        <n-button @click="restart">重新再练</n-button>
                        <n-button type="primary" @click="step = 'review'">查看详细解析</n-button>
                    </n-space>
                </template>
            </n-result>
        </n-card>
    </div>

    <!-- Review Phase -->
    <div v-else-if="step === 'review'" class="review-container">
        <div class="back-button-container">
            <n-button secondary @click="step = 'result'">
                <template #icon><n-icon :component="ArrowLeft" /></template>
                返回报告
            </n-button>
        </div>

        <n-card class="review-card" title="详细解析与原文" :bordered="false">
             <div class="audio-script-preview mb-6">
                <h3 class="text-white mb-2">听力原文 (Script)</h3>
                <div class="preview-text p-4 bg-black/20 rounded-lg text-zinc-300 leading-relaxed font-serif">
                    {{ audioScript }}
                </div>
             </div>

             <n-divider />

             <n-list>
                 <n-list-item v-for="(q, idx) in generatedQuestions" :key="idx">
                     <n-thing :title="'Q' + (idx + 1)">
                         <template #description>
                            <p class="mb-2 text-white">{{ q.question }}</p>
                         </template>
                         <div class="review-detail">
                             <div class="your-answer mb-1">
                                你的选择: 
                                <span :class="answers[idx] === q.correct ? 'success-text' : 'error-text'">
                                    {{ q.options[answers[idx]] || '未作答' }}
                                </span>
                                <n-icon v-if="answers[idx] === q.correct" :component="CheckCircle2" color="#10b981" />
                                <n-icon v-else :component="XCircle" color="#ef4444" />
                             </div>
                             <div class="correct-answer mb-2">正确答案: <span class="success-text">{{ q.options[q.correct] }}</span></div>
                             <div class="explanation p-3 bg-zinc-800/50 rounded text-zinc-300">
                                <strong>解析：</strong> {{ q.explanation || '暂无详细解析。' }}
                             </div>
                         </div>
                     </n-thing>
                 </n-list-item>
             </n-list>
        </n-card>
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
    text-align: center;
    margin-bottom: 40px;
}
.page-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 12px;
    background: linear-gradient(120deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.page-header p {
    color: #a1a1aa;
}

/* Setup Styles */
.setup-card {
    background: rgba(30, 30, 35, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 24px;
}
.setting-section {
    margin-bottom: 32px;
}
.setting-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    margin-bottom: 16px;
    color: #e4e4e7;
}

/* Grid Options */
.grid-options {
    display: grid;
    gap: 16px;
}
.exam-type-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
.mode-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.option-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
.option-card:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
}
.option-card.active {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
    color: #fff;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}
.option-icon { font-size: 2rem; margin-bottom: 8px; }
.option-label { font-weight: 600; font-size: 0.95rem; }

/* Mode Card Specific */
.mode-card {
    flex-direction: row;
    text-align: left;
    justify-content: flex-start;
    padding: 12px 16px;
}
.mode-icon-wrapper {
    margin-right: 12px;
    padding: 8px;
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    display: flex;
}
.mode-card.active .mode-icon-wrapper {
    background: #6366f1;
    color: white;
}
.option-desc { font-size: 0.75rem; color: #a1a1aa; margin-top: 2px; }

/* Side Settings */
.side-settings {
    background: rgba(255,255,255,0.02);
    padding: 24px;
    border-radius: 16px;
}
.pill-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}
.pill-option {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    font-size: 0.9rem;
    color: #a1a1aa;
    white-space: nowrap;
}
.pill-option.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
}

.start-btn {
    height: 56px;
    font-size: 1.1rem;
    font-weight: 700;
}

/* Testing Styles */
.back-button-container {
    margin-bottom: 20px;
}
.testing-container {
    max-width: 800px;
    margin: 0 auto;
}
.progress-bar-container {
    margin-bottom: 32px;
}
.progress-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #a1a1aa;
    font-size: 0.9rem;
}
.question-card {
    background: #18181c;
    border-radius: 20px;
    min-height: 500px;
    display: flex;
    flex-direction: column;
}

/* Audio Player Mock */
.audio-player-mock {
    background: linear-gradient(135deg, #1e1b4b, #312e81);
    padding: 24px;
    border-radius: 16px 16px 0 0;
    display: flex;
    align-items: center;
    gap: 24px;
    margin: -24px -24px 24px -24px;
}
.play-btn-circle {
    width: 56px; height: 56px;
    border-radius: 50%;
    background: #6366f1;
    display: flex; align-items: center; justify-content: center;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    cursor: pointer;
}
.track-info h4 { margin: 0; color: white; font-size: 1.1rem; }
.track-info p { margin: 0; color: #a1a1aa; font-size: 0.85rem; }
.visualizer { display: flex; gap: 4px; align-items: flex-end; height: 24px; }
.bar { width: 4px; height: 10px; background: rgba(255,255,255,0.5); border-radius: 2px; }

.question-content { padding: 0 20px; flex: 1; }
.q-text { font-size: 1.3rem; margin-bottom: 24px; color: #e4e4e7; line-height: 1.5; }

.answer-option {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 16px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
}
.answer-option:hover {
    background: rgba(255,255,255,0.07);
}
.answer-option.selected {
    background: rgba(99, 102, 241, 0.15);
    border-color: #6366f1;
}
.option-index {
    width: 32px;
    height: 32px;
    background: rgba(0,0,0,0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-weight: 700;
    color: #a1a1aa;
}
.answer-option.selected .option-index {
    background: #6366f1;
    color: white;
}
.option-text {
    font-size: 1.05rem;
}
.actions-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
    padding: 0 20px 20px;
}

/* Result Styles */
.score-card {
    text-align: center;
    padding: 40px;
    border-radius: 24px;
    margin-bottom: 24px;
}
.review-card {
    background: #18181c;
    border-radius: 24px;
}
.error-text { color: #ef4444; font-weight: bold; }
.success-text { color: #10b981; font-weight: bold; }

/* History Section */
.history-section {
    margin-top: 40px;
}
.section-title {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #e4e4e7;
}
.history-card {
    background: rgba(40, 40, 45, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
}
.history-card:hover {
    background: rgba(50, 50, 55, 0.7);
    transform: translateY(-2px);
    border-color: #6366f1;
}
.history-title {
    font-size: 1rem;
    font-weight: 700;
    margin-top: 4px;
    color: #fff;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.history-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}
.word-count {
    font-size: 0.8rem;
    color: #a1a1aa;
}
</style>
