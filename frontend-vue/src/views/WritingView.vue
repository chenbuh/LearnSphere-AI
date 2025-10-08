<script setup>
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, NInput, useMessage
} from 'naive-ui'
import { 
  PenTool, BookOpen, Clock, Target, Rocket, Trophy, 
  FileEdit, SpellCheck, AlertTriangle, CheckCircle2,
  GraduationCap, MessageSquare
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'

const message = useMessage()

// --- State ---
const step = ref('setup') // 'setup' | 'writing' | 'result'
const isLoading = ref(false)
const essayContent = ref('')
const selectedTopic = ref(null)
const analysisResult = ref(null)

// --- Settings State ---
const settings = ref({
    examType: 'cet4',
    mode: 'essay',
    timeLimit: 30
})

// --- Options ---
const examTypes = [
    { value: 'cet4', label: 'CET-4', icon: '4' },
    { value: 'cet6', label: 'CET-6', icon: '6' },
    { value: 'ielts', label: 'IELTS', icon: 'I' },
    { value: 'toefl', label: 'TOEFL', icon: 'T' }
]

const writingModes = [
    { value: 'essay', label: '议论文', desc: 'Discuss both views & give opinion', icon: FileEdit },
    { value: 'chart', label: '图表作文', desc: 'Describe trends in charts/graphs', icon: Target },
    { value: 'letter', label: '应用文/书信', desc: 'Formal/Informal letters', icon: MessageSquare }
]

const timeLimits = [
    { value: 0, label: '不限时' },
    { value: 30, label: '30分钟' },
    { value: 45, label: '45分钟' },
    { value: 60, label: '60分钟' }
]

// --- Timer State ---
const timeLeft = ref(0) // in seconds
let timerInterval = null

// 是否正在写作中（用于离开提醒）
const isWritingInProgress = computed(() => step.value === 'writing' && essayContent.value.length > 0)

// 离开页面提醒
const handleBeforeUnload = (e) => {
  if (isWritingInProgress.value) {
    e.preventDefault()
    e.returnValue = '写作正在进行中，确定要离开吗？你的文章内容将会丢失。'
    return e.returnValue
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Watch step changes to start/stop timer
watch(step, (newStep) => {
    if (newStep === 'writing' && settings.value.timeLimit > 0) {
        // Start timer
        timeLeft.value = settings.value.timeLimit * 60
        startTimer()
    } else {
        // Stop timer
        stopTimer()
    }
})

const startTimer = () => {
    stopTimer() // Clear any existing timer
    timerInterval = setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value--
        } else {
            stopTimer()
            message.warning('时间到！')
        }
    }, 1000)
}

const stopTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
    }
}

// Cleanup on component unmount
onUnmounted(() => {
    stopTimer()
})

const timeLeftDisplay = computed(() => {
    if (timeLeft.value <= 0) return '00:00'
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})


// --- Logic ---

const updateSetting = (key, value) => {
  settings.value[key] = value
}

// Generate Topic
const generateTopic = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.generateWriting({
            examType: settings.value.examType,
            mode: settings.value.mode
        })
        if (res.code === 200 && res.data) {
            selectedTopic.value = res.data
            essayContent.value = ''
            step.value = 'writing'
            message.success('题目生成成功')
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

const submitEssay = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.evaluateWriting({
            topic: selectedTopic.value.title,
            content: essayContent.value
        })
        if (res.code === 200 && res.data) {
            analysisResult.value = res.data
            step.value = 'result'
            message.success('批改完成')

            // Save learning record
            try {
                await learningApi.createRecord({
                    contentId: selectedTopic.value.id || 0,
                    contentType: 'writing',
                    isCorrect: analysisResult.value.score >= 60 ? 1 : 0,
                    answer: essayContent.value,
                    correctAnswer: 'N/A',
                    score: analysisResult.value.score,
                    masteryLevel: Math.floor(analysisResult.value.score / 20),
                    originalContent: JSON.stringify({
                        topic: selectedTopic.value,
                        feedback: analysisResult.value.feedback
                    })
                })
            } catch (e) {
                console.error('Failed to save writing record', e)
            }
        } else {
            message.error('批改失败')
        }
    } catch (e) {
        console.error(e)
        message.error('请求失败')
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
}

const wordCount = computed(() => {
    if (!essayContent.value) return 0
    return essayContent.value.split(/\s+/).filter(w => w).length
})

</script>

<template>
  <div class="page-container">
    
    <!-- Top Header -->
    <div class="page-header" v-if="step === 'setup'">
         <h1>写作智能批改</h1>
         <p>模拟真实考试场景，AI 实时诊断语法与逻辑漏洞</p>
    </div>

    <!-- Phase 1: Setup -->
    <div v-if="step === 'setup'" class="setup-container">
       <n-card class="setup-card" :bordered="false" size="huge">
          <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
             
             <!-- Left Column -->
             <n-grid-item span="2">
                 <!-- Exam Type -->
                 <div class="setting-section">
                    <h3><n-icon :component="GraduationCap" color="#6366f1" /> 考试类型</h3>
                    <div class="grid-options exam-grid">
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

                 <!-- Writing Mode -->
                 <div class="setting-section">
                    <h3><n-icon :component="PenTool" color="#a855f7" /> 写作题型</h3>
                    <div class="grid-options mode-grid">
                       <div 
                          v-for="mode in writingModes" 
                          :key="mode.value"
                          class="option-card mode-card"
                          :class="{ active: settings.mode === mode.value }"
                          @click="updateSetting('mode', mode.value)"
                       >
                          <div class="icon-wrapper">
                              <n-icon :component="mode.icon" />
                          </div>
                          <div class="info">
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
                    <!-- Time Limit -->
                    <div class="setting-section">
                        <h3><n-icon :component="Clock" color="#eab308" /> 限时训练</h3>
                        <div class="pill-options">
                           <div 
                              v-for="time in timeLimits" 
                              :key="time.value"
                              class="pill-option"
                              :class="{ active: settings.timeLimit === time.value }"
                              @click="updateSetting('timeLimit', time.value)"
                           >
                              {{ time.label }}
                           </div>
                        </div>
                    </div>
                    
                    <div class="tips-box">
                        <h4>💡 训练贴士</h4>
                        <p>建议在电脑端进行写作训练，以模拟真实考场输入体验。AI 将从词汇、语法、逻辑三个维度提供评分。</p>
                    </div>

                    <n-divider />

                    <n-button 
                        type="primary" 
                        size="large" 
                        block 
                        round
                        class="start-btn"
                        @click="generateTopic"
                    >
                        <template #icon><n-icon :component="Rocket" /></template>
                        生成题目
                    </n-button>
                 </div>
             </n-grid-item>
          </n-grid>
       </n-card>
    </div>

    <!-- Phase 2: Writing -->
    <div v-else-if="step === 'writing'" class="writing-container">
       <!-- Back Button -->
       <div class="back-button-container">
           <n-button secondary @click="restart">
               <template #icon>
                   <n-icon :component="RotateCcw" />
               </template>
               返回设置
           </n-button>
       </div>

       <div class="writing-layout">
           
           <!-- Topic Panel -->
           <n-card class="topic-card" :bordered="false">
               <div class="topic-header">
                   <n-tag type="warning">Task 2</n-tag>
                   <span class="word-req">Min Words: {{ selectedTopic.minWords }}</span>
               </div>
               <h2>{{ selectedTopic.title }}</h2>
               <div class="topic-prompt">
                   {{ selectedTopic.prompt }}
               </div>
               <div class="topic-tips">
                   <strong>Hints:</strong>
                   <ul>
                       <li v-for="(tip, idx) in selectedTopic.tips" :key="idx">{{ tip }}</li>
                   </ul>
               </div>
           </n-card>

           <!-- Editor Panel -->
           <n-card class="editor-card" :bordered="false" content-style="display: flex; flex-direction: column; height: 100%;">
                <n-input
                    v-model:value="essayContent"
                    type="textarea"
                    placeholder="Start writing here..."
                    class="essay-editor"
                    :bordered="false"
                />
                
                <div class="editor-footer">
                    <div class="stats">
                        <span>Words: {{ wordCount }}</span>
                        <span v-if="settings.timeLimit > 0">Time Left: {{ timeLeftDisplay }}</span>
                    </div>
                    <div class="actions">
                        <n-button secondary size="large">存草稿</n-button>
                        <n-button type="primary" size="large" @click="submitEssay" :disabled="wordCount < 10">
                            提交批改
                        </n-button>
                    </div>
                </div>
           </n-card>

       </div>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-container">
        <n-card class="score-card" :bordered="false">
            <n-result status="success" title="批改完成" :description="'AI 预估分数：' + analysisResult.score">
                <template #icon>
                    <n-icon :component="Trophy" size="80" color="#eab308" />
                </template>
                <template #footer>
                    <n-space justify="center">
                        <n-button @click="restart">再写一篇</n-button>
                        <n-button type="primary">导出报告</n-button>
                    </n-space>
                </template>
            </n-result>
        </n-card>

        <n-card title="详细反馈" class="feedback-card" :bordered="false">
             <n-list>
                 <n-list-item v-for="(fb, idx) in analysisResult.feedback" :key="idx">
                     <n-thing>
                         <template #avatar>
                            <n-icon v-if="fb.type === 'grammar'" :component="SpellCheck" color="#ef4444" size="24" />
                            <n-icon v-else-if="fb.type === 'vocab'" :component="BookOpen" color="#3b82f6" size="24" />
                            <n-icon v-else :component="CheckCircle2" color="#10b981" size="24" />
                         </template>
                         <template #header>
                             {{ fb.type.toUpperCase() }}
                         </template>
                         <template #description>
                             {{ fb.text }}
                         </template>
                     </n-thing>
                 </n-list-item>
             </n-list>
        </n-card>
    </div>

  </div>
</template>

<style scoped>
.page-container {
    max-width: 1200px;
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
    background: linear-gradient(120deg, #f97316, #ec4899);
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
.exam-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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
    background: rgba(249, 115, 22, 0.15);
    border-color: #f97316;
    color: #fff;
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
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
.icon-wrapper {
    margin-right: 12px;
    padding: 8px;
    border-radius: 8px;
    background: rgba(255,255,255,0.05);
    display: flex;
}
.mode-card.active .icon-wrapper {
    background: #f97316;
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
    background: #f97316;
    color: white;
    border-color: #f97316;
}

.tips-box {
    margin-top: 24px;
    padding: 16px;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    font-size: 0.9rem;
    color: #a1a1aa;
}
.tips-box h4 { margin-bottom: 8px; color: #fff; }

.start-btn {
    height: 56px;
    font-size: 1.1rem;
    font-weight: 700;
}

/* Writing Layout */
.back-button-container {
    margin-bottom: 20px;
}
.writing-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: calc(100vh - 140px);
}

.topic-card {
    background: rgba(30, 30, 35, 0.6);
    border-radius: 16px;
}
.topic-header {
    display: flex; justify-content: space-between; margin-bottom: 12px;
}
.word-req { color: #52525b; font-size: 0.85rem; font-family: monospace; }
.topic-card h2 { font-size: 1.25rem; color: #fff; margin-bottom: 16px; line-height: 1.4; }
.topic-prompt {
    font-size: 1rem; color: #d4d4d8; background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; margin-bottom: 16px;
}
.topic-tips { font-size: 0.9rem; color: #a1a1aa; }
.topic-tips ul { margin-top: 4px; padding-left: 20px; }

.editor-card {
    flex: 1;
    background: rgba(30, 30, 35, 0.6);
    border-radius: 16px;
    display: flex; flex-direction: column;
}

:deep(.essay-editor) {
    flex: 1;
    font-family: 'Georgia', serif;
    font-size: 1.1rem;
    line-height: 1.8;
    background: transparent;
}
:deep(.n-input__textarea-el) {
    height: 100% !important;
}

.editor-footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 16px;
    margin-top: 16px;
}
.stats { font-family: monospace; color: #71717a; font-size: 0.9rem; }
.actions { display: flex; gap: 12px; }

/* Result Styles */
.score-card {
    max-width: 800px;
    margin: 0 auto 24px;
    text-align: center;
    padding: 40px;
    border-radius: 24px;
}
.feedback-card {
    max-width: 800px;
    margin: 0 auto;
    border-radius: 24px;
}
</style>
