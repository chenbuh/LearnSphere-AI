<script setup>
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, NInput, useMessage, NPagination, NModal
} from 'naive-ui'
import { 
  PenTool, BookOpen, Clock, Target, Rocket, Trophy, 
  FileEdit, SpellCheck, AlertTriangle, CheckCircle2,
  GraduationCap, MessageSquare, RotateCcw, History, Zap, Share2
} from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { useTypewriter } from '@/composables/useTypewriter'

import { useWritingStore } from '@/stores/writing'
import { decryptPayload } from '@/utils/crypto'

const message = useMessage()
const writingStore = useWritingStore()

// --- State ---
// 步骤状态机：setup (选题) -> writing (写作/倒计时) -> result (AI 批改报告)
const step = ref('setup') 
const isLoading = ref(false)
const essayContent = ref('')

// 监听作文内容变化，调用 Store 进行自动保存 (Auto-save)
watch(essayContent, (newVal) => {
    if (step.value === 'writing') {
        writingStore.saveDraft(newVal)
    }
})

const selectedTopic = ref(null) // 当前题目对象
const analysisResult = ref(null) // AI 批改结果
const historyTopics = ref([])

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)
const isFocusMode = ref(false)
const showDraftSaved = ref(false)

// Score counting for result card
const displayScore = ref(0)

// 分享功能
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
    const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1)
        displayScore.value = Math.floor(progress * target)
        if (progress < 1) {
            requestAnimationFrame(step)
        }
    }
    requestAnimationFrame(step)
}

watch([historyPage, historyPageSize], () => {
    fetchHistory()
})

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
const timeLeft = ref(0) // 剩余秒数
let timerInterval = null

// 是否正在写作中（用于离开页面时的浏览器弹窗提醒）
const isWritingInProgress = computed(() => step.value === 'writing' && essayContent.value.length > 0)

// 离开页面提醒 (Browser Native Event)
const handleBeforeUnload = (e) => {
  if (isWritingInProgress.value) {
    e.preventDefault()
    e.returnValue = '写作正在进行中，确定要离开吗？你的文章内容将会丢失。'
    return e.returnValue
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  fetchHistory()

  // 恢复进度逻辑 (Persistence Restoration)
  // 如果 Store 中有未过期的草稿，自动恢复
  if (writingStore.currentPrompt && writingStore.currentMode === 'writing') {
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

// 监听步骤变化，自动启动/停止计时器
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

// 组件卸载时清理计时器
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

// Paginated history
const paginatedHistory = computed(() => historyTopics.value)

/**
 * 获取历史写作题目
 */
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

// Typewriter Effect (用于题目 Prompt 的逐字显示)
const { displayedText: displayedPrompt, isTyping: isPromptTyping, startTyping: startPromptTyping, setImmediate: setPromptImmediate } = useTypewriter('', 20)

const startTime = ref(Date.now())

const loadHistoryTopic = (topic) => {
  selectedTopic.value = decryptPayload(topic)
  essayContent.value = ''
  step.value = 'writing'
  startTime.value = Date.now() // Reset timer
  message.success(`已加载: ${topic.title}`)
  startPromptTyping(topic.prompt)
  
  writingStore.startWriting(topic, settings.value.examType, settings.value.mode)
}

// Generate Topic (调用 AI 生成新题目)
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
            startTime.value = Date.now() // Reset timer
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

/**
 * 提交作文并获取 AI 评估
 */
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

            // 保存到学习记录 (Learning Record)
            try {
                // Determine time spent
                let spentTime = Math.floor((Date.now() - startTime.value) / 1000);
                if (settings.value.timeLimit > 0) {
                     // If using timer, calculate based on time limit used
                     const usedTime = (settings.value.timeLimit * 60) - timeLeft.value;
                     if (usedTime > 0) spentTime = usedTime;
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
            
            // 触发分数动画
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
    // Strip HTML tags and normalize whitespace for accurate counting
    const text = essayContent.value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    return text ? text.split(/\s+/).filter(w => w).length : 0
})

// Auto-save feedback (防抖保存 draft 到 Store 已由 watch(essayContent) 处理，这里仅处理 UI 提示)
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

</script>

<template>
  <div class="page-container">
    
    <!-- Top Header -->
    <div class="page-header" v-if="step === 'setup'">
         <h1>Writing Lab</h1>
         <p>模拟真实考试场景，AI 实时诊断语法与逻辑漏洞</p>
    </div>

    <transition name="fade-slide" mode="out-in">

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
                          class="option-card"
                          :class="{ active: settings.mode === mode.value }"
                          @click="updateSetting('mode', mode.value)"
                       >
                          <div class="option-icon">
                              <n-icon :component="mode.icon" />
                          </div>
                          <div class="option-label">{{ mode.label }}</div>
                          <div class="option-desc">{{ mode.desc }}</div>
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

        <!-- History Section -->
        <div v-if="historyTotal > 0" class="history-section mt-12">
            <div class="section-title">
                <n-icon :component="History" /> 最近生成题目
            </div>
            <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
                <n-grid-item v-for="topic in paginatedHistory" :key="topic.id">
                    <div class="history-card" @click="loadHistoryTopic(topic)">
                        <div class="history-card-header">
                            <n-tag size="small" type="warning" :bordered="false">{{ topic.examType?.toUpperCase() }}</n-tag>
                            <n-tag size="tiny" :bordered="false">{{ topic.mode }}</n-tag>
                        </div>
                        <h4 class="topic-title">{{ topic.title }}</h4>
                        <div class="topic-preview">{{ topic.prompt?.substring(0, 60) }}...</div>
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

    <!-- Phase 2: Writing -->
    <div v-else-if="step === 'writing'" class="writing-container" :class="{ 'focus-mode': isFocusMode }">
       <!-- Back Button -->
       <div class="back-button-container flex justify-between items-center">
           <n-button secondary @click="restart" class="glass-btn">
               <template #icon><n-icon :component="RotateCcw" /></template>
               返回设置
           </n-button>
           <div class="flex items-center gap-3">
              <span v-if="showDraftSaved" class="text-xs text-green-400 opacity-80 animate-pulse">
                已保存到草稿箱
              </span>
              <n-button secondary @click="isFocusMode = !isFocusMode" class="glass-btn">
                  <template #icon><n-icon :component="Target" /></template>
                  {{ isFocusMode ? '退出沉浸模式' : '开启沉浸模式' }}
              </n-button>
           </div>
       </div>

       <div class="writing-layout">
           
           <!-- Topic Panel -->
           <n-card class="topic-card" :bordered="false" v-if="!isFocusMode">
               <div class="topic-header">
                   <n-tag type="warning" round ghost>{{ settings.examType?.toUpperCase() }} Task</n-tag>
                   <span class="word-req">建议字数: {{ selectedTopic.minWords || 150 }}+</span>
               </div>
               <h2>{{ selectedTopic.title }}</h2>
               <div class="topic-prompt-fancy" @click="isPromptTyping ? setPromptImmediate(selectedTopic.prompt) : null">
                   <div class="prompt-decoration"></div>
                   <div class="prompt-content">
                    {{ displayedPrompt }}
                    <span v-if="isPromptTyping" class="typing-cursor">_</span>
                   </div>
               </div>
               <div class="topic-tips secure-content">
                   <div class="flex items-center gap-2 mb-2 text-indigo-400 font-bold">
                    <n-icon :component="BookOpen" /> 核心要点 / Hints
                   </div>
                   <ul class="fancy-list">
                       <li v-for="(tip, idx) in selectedTopic.tips" :key="idx">{{ tip }}</li>
                   </ul>
               </div>
           </n-card>

           <!-- Editor Panel -->
            <n-card class="editor-card" :bordered="false" content-style="display: flex; flex-direction: column; height: 100%;">
                <n-input
                    v-model:value="essayContent"
                    type="textarea"
                    placeholder="在这里开始你的创作..."
                    :autosize="{ minRows: 20, maxRows: 30 }"
                    class="essay-editor-wrapper"
                />
                
                <div class="editor-footer">
                    <div class="stats flex items-center gap-6">
                        <div class="stat-item">
                            <span class="label">WORDS</span>
                            <span class="value">{{ wordCount }}</span>
                        </div>
                        <div class="stat-item" v-if="settings.timeLimit > 0">
                            <span class="label">TIME</span>
                            <span class="value" :class="{ 'text-red-500': timeLeft < 60 }">{{ timeLeftDisplay }}</span>
                        </div>
                    </div>
                    <div class="actions">
                        <n-button 
                          type="primary" 
                          size="large" 
                          @click="submitEssay" 
                          :disabled="wordCount < 10"
                          class="submit-btn-premium"
                          :loading="isLoading"
                        >
                            提交 AI 深度分析
                        </n-button>
                    </div>
                </div>
           </n-card>

       </div>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-container">
        <div class="result-header-grid">
          <n-card class="score-card-premium" :bordered="false">
            <div class="score-dial">
              <n-progress
                type="circle"
                :percentage="displayScore"
                :color="displayScore >= 80 ? '#10b981' : displayScore >= 60 ? '#6366f1' : '#f43f5e'"
                :stroke-width="8"
                class="score-circle"
              >
                <div class="score-inner">
                  <span class="score-num">{{ displayScore }}</span>
                  <span class="score-label">OVERALL</span>
                </div>
              </n-progress>
            </div>
            <div class="score-feedback">
               <h3>评估完成</h3>
               <p v-if="displayScore >= 80">精彩的表现！你的文章逻辑清晰，词汇使用非常地道。</p>
               <p v-else-if="displayScore >= 60">良好的开端，你的表达很清晰，但在某些语法细节上仍有进步空间。</p>
               <p v-else>别担心，这是成长必经之路。参考下方的 AI 建议进行针对性修改。</p>
               <n-space justify="center" vertical :size="12" class="mt-4">
                  <n-space justify="center">
                    <n-button @click="restart" secondary round>重新开始</n-button>
                    <n-button type="primary" round class="export-btn shadow-glow-indigo">保存报告</n-button>
                  </n-space>
                  <n-button secondary round @click="showShare = true" class="share-btn">
                    <template #icon>
                      <n-icon :component="Share2" />
                    </template>
                    分享学习成果
                  </n-button>
               </n-space>
            </div>
          </n-card>

          <div class="feedback-stack">
            <div class="section-badge">CRITICAL INSIGHTS</div>
            <div 
              v-for="(fb, idx) in analysisResult.feedback" 
              :key="idx" 
              class="feedback-item-premium secure-content"
              :class="'type-' + fb.type"
              :style="{ animationDelay: (idx * 0.1) + 's' }"
            >
              <div class="fb-icon">
                <n-icon v-if="fb.type === 'grammar'" :component="SpellCheck" />
                <n-icon v-else-if="fb.type === 'vocab'" :component="BookOpen" />
                <n-icon v-else :component="AlertTriangle" />
              </div>
              <div class="fb-info">
                <div class="fb-type">{{ fb.type?.toUpperCase() }}</div>
                <div class="fb-text">{{ fb.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分享弹窗 -->
        <ShareModal
          v-model:show="showShare"
          :title="shareContent.title"
          :description="shareContent.description"
          :url="shareContent.url"
        />
    </div>
    </transition>

    <!-- AI Evaluating Overlay -->
    <n-modal v-model:show="isLoading" :mask-closable="false">
      <div class="ai-evaluating-overlay">
         <div class="brain-loader">
            <div class="core-brain">
              <Zap :size="48" class="zap-pulse" />
            </div>
            <div class="orbit ring-1"></div>
            <div class="orbit ring-2"></div>
         </div>
         <div class="loading-status">
            <h3>LearnSphere AI 正在分析...</h3>
            <p>正在从语法连贯性、词汇多样性、逻辑连贯度进行深度建模</p>
         </div>
      </div>
    </n-modal>

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
    color: var(--secondary-text);
}

/* Setup Styles */
.setup-card {
    border-radius: 24px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
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
.setting-section {
    margin-bottom: 32px;
}
.setting-section h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
    margin-bottom: 16px;
    color: var(--text-color);
}

/* Grid Options */
.grid-options {
    display: grid;
    gap: 16px;
}
.exam-grid, .mode-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}

.option-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: var(--theme-transition);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}
.option-card:hover {
    background: var(--accent-fill);
    transform: translateY(-2px);
}
.option-card.active {
    background: rgba(249, 115, 22, 0.1);
    border-color: #f97316;
    color: var(--text-color);
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.2);
}
.option-icon { font-size: 2rem; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; }
.option-label { font-weight: 600; font-size: 0.95rem; }
.option-desc { font-size: 0.7rem; color: var(--secondary-text); margin-top: 4px; opacity: 0.8; }

/* Side Settings */
.side-settings {
    background: var(--accent-fill);
    padding: 24px;
    border-radius: 16px;
    border: 1px solid var(--card-border);
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
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--secondary-text);
    white-space: nowrap;
    transition: var(--theme-transition);
}
.pill-option.active {
    background: #f97316;
    color: white;
    border-color: #f97316;
}

.tips-box {
    margin-top: 24px;
    padding: 16px;
    background: var(--accent-fill);
    border-radius: 12px;
    font-size: 0.9rem;
    color: var(--secondary-text);
}
.tips-box h4 { margin-bottom: 8px; color: var(--text-color); }

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
    border-radius: 16px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    transition: var(--theme-transition);
}
.topic-header {
    display: flex; justify-content: space-between; margin-bottom: 12px;
}
.word-req { color: var(--secondary-text); font-size: 0.85rem; font-family: monospace; }
.topic-card h2 { font-size: 1.25rem; margin-bottom: 16px; line-height: 1.4; color: var(--text-color); }
.topic-prompt {
    font-size: 1rem; color: var(--text-color); background: var(--accent-fill); padding: 16px; border-radius: 8px; margin-bottom: 16px;
}
.topic-tips { font-size: 0.9rem; color: var(--secondary-text); }
.topic-tips ul { margin-top: 4px; padding-left: 20px; }

.editor-card {
    flex: 1;
    border-radius: 16px;
    display: flex; flex-direction: column;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    transition: var(--theme-transition);
}

.essay-editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

:deep(.w-e-text-container) {
    font-family: 'Georgia', serif;
    font-size: 1.1rem;
    line-height: 1.8;
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

/* History Section */
.history-section { margin-top: 48px; }
.section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: var(--text-color); }
.history-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; cursor: pointer; transition: var(--theme-transition); }
.history-card:hover { background: var(--accent-fill); transform: translateY(-2px); border-color: #f97316; }
.history-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.topic-title { font-size: 1rem; font-weight: 600; color: var(--text-color); margin: 8px 0; }
.topic-preview { color: var(--secondary-text); font-size: 0.85rem; line-height: 1.4; }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }

.typing-cursor {
  display: inline-block;
  color: #6366f1;
  animation: blink 0.8s infinite;
  margin-left: 2px;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.5s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateY(30px); }
.fade-slide-leave-to { opacity: 0; transform: translateY(-30px); }

/* Writing Experience Enhancements */
.writing-container.focus-mode .topic-card { display: none; }
.writing-container.focus-mode .writing-layout { height: calc(100vh - 100px); }
.writing-container.focus-mode .editor-card { max-width: 900px; margin: 0 auto; }

.glass-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
}

.topic-prompt-fancy {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  border: 1px solid var(--card-border);
  cursor: pointer;
  overflow: hidden;
  transition: var(--theme-transition);
}

.prompt-decoration {
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: linear-gradient(to bottom, #6366f1, #a855f7);
}

.fancy-list { list-style: none; padding: 0; }
.fancy-list li {
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 0.85rem;
  color: var(--secondary-text);
}
.fancy-list li::before { content: '→'; margin-right: 8px; color: #6366f1; }

.submit-btn-premium {
  height: 50px;
  padding: 0 40px;
  font-weight: 700;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s;
}
.submit-btn-premium:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4); }

.stat-item { display: flex; flex-direction: column; gap: 4px; }
.stat-item .label { font-size: 0.65rem; color: var(--secondary-text); letter-spacing: 1px; }
.stat-item .value { font-size: 1.1rem; font-weight: 800; color: var(--text-color); font-family: 'JetBrains Mono', monospace; }

/* AI Loader Overlay */
.ai-evaluating-overlay {
  background: rgba(15, 23, 42, 0.9);
  padding: 60px;
  border-radius: 32px;
  text-align: center;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.brain-loader { position: relative; width: 120px; height: 120px; margin: 0 auto 40px; }
.core-brain { 
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(99, 102, 241, 0.1); border-radius: 50%; border: 2px solid #6366f1;
}
.zap-pulse { color: #6366f1; animation: zap-glow 1.5s ease-in-out infinite; }
@keyframes zap-glow { 0%, 100% { filter: drop-shadow(0 0 5px #6366f1); opacity: 0.8; } 50% { filter: drop-shadow(0 0 20px #6366f1); opacity: 1; } }

.orbit { position: absolute; border: 1px dashed rgba(99, 102, 241, 0.3); border-radius: 50%; }
.orbit.ring-1 { inset: -20px; animation: rotate 10s linear infinite; }
.orbit.ring-2 { inset: -40px; animation: rotate 15s linear reverse infinite; opacity: 0.5; }

.loading-status h3 { margin: 0 0 8px; font-size: 1.5rem; color: #fff; }
.loading-status p { color: #a1a1aa; font-size: 0.9rem; }

/* Result Premium */
.result-header-grid { display: grid; grid-template-columns: 350px 1fr; gap: 32px; max-width: 1000px; margin: 0 auto; }
.score-card-premium { background: var(--card-bg); border-radius: 24px; text-align: center; border: 1px solid var(--card-border); transition: var(--theme-transition); }
.score-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.score-num { font-size: 3rem; font-weight: 900; color: var(--text-color); line-height: 1; }
.score-label { font-size: 0.75rem; color: var(--secondary-text); margin-top: 5px; font-weight: bold; }

.score-feedback h3 { margin-bottom: 12px; font-size: 1.5rem; color: var(--text-color); }
.score-feedback p { color: var(--secondary-text); line-height: 1.6; }

.feedback-stack { display: flex; flex-direction: column; gap: 16px; }
.section-badge { font-size: 0.75rem; font-weight: 800; color: #6366f1; letter-spacing: 2px; margin-bottom: 8px; }

.feedback-item-premium {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-left-width: 4px;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  animation: slide-in 0.5s forwards;
  opacity: 0;
  transition: var(--theme-transition);
}

@keyframes slide-in { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

.type-grammar { border-left-color: #f43f5e; background: linear-gradient(to right, rgba(244, 63, 94, 0.05), transparent); }
.type-vocab { border-left-color: #3b82f6; background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent); }

.fb-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; background: var(--accent-fill); }
.type-grammar .fb-icon { color: #f43f5e; }
.type-vocab .fb-icon { color: #3b82f6; }

.fb-type { font-size: 0.7rem; font-weight: 700; opacity: 0.6; margin-bottom: 4px; color: var(--text-color); }
.fb-text { font-size: 0.95rem; color: var(--text-color); line-height: 1.5; }

.shadow-glow-indigo { box-shadow: 0 0 15px rgba(99, 102, 241, 0.4); }

@media (max-width: 900px) {
  .result-header-grid { grid-template-columns: 1fr; }
  .score-card-premium { padding: 32px; }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>
