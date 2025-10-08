<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing, useMessage, NSpin, NPagination
} from 'naive-ui'
import { 
  Rocket, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Brain, Target, Clock, BookOpen, AlertCircle, History,
  Sparkles, Layers, Feather, Leaf, Users, Palette, HeartPulse, Dna, FileText
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { useTypewriter } from '@/composables/useTypewriter'

const message = useMessage()

// Typewriter Effect
const { displayedText, isTyping, startTyping, setImmediate } = useTypewriter('', 15)

// --- State ---
const step = ref('setup') // 'setup' | 'reading' | 'result'
const isLoading = ref(false)
const currentQuestionIndex = ref(0)
const answers = ref({})
const score = ref(0)
const article = ref(null)
const historyArticles = ref([])

// Pagination for history
const historyPage = ref(1)
const historyPageSize = ref(6)
const historyTotal = ref(0)

// --- Settings State ---
const settings = ref({
  source: 'economist',
  category: 'tech',
  difficulty: 'medium',
  length: 'medium'
})

// --- Options Constants ---
const sources = [
  { label: '经济学人', value: 'economist', icon: '📈' },
  { label: '纽约时报', value: 'nyt', icon: '📰' },
  { label: '科学美国人', value: 'scientific', icon: '🧬' },
  { label: '国家地理', value: 'natgeo', icon: '🌍' },
  { label: '经典名著', value: 'classic', icon: '📚' },
  { label: '现代小说', value: 'fiction', icon: '🖊️' }
]

const categories = [
  { label: '科技前沿', value: 'tech', icon: Sparkles, desc: 'AI, Space, Bio' },
  { label: '商业财经', value: 'business', icon: Layers, desc: 'Market, Economy' },
  { label: '人文历史', value: 'culture', icon: Feather, desc: 'History, Art' },
  { label: '自然环境', value: 'environment', icon: Leaf, desc: 'Nature, Climate' },
  { label: '社会生活', value: 'society', icon: Users, desc: 'Culture, People' },
  { label: '艺术文学', value: 'arts', icon: Palette, desc: 'Design, Literature' },
  { label: '健康医疗', value: 'health', icon: HeartPulse, desc: 'Medicine, Wellness' },
  { label: '基础科学', value: 'science', icon: Dna, desc: 'Physics, Chem' }
]

const difficulties = [
  { label: '入门', value: 'easy' },
  { label: '进阶', value: 'medium' },
  { label: '精通', value: 'hard' }
]

const lengths = [
  { label: '短篇', value: 'short' },
  { label: '中篇', value: 'medium' },
  { label: '长篇', value: 'long' }
]

// 是否正在阅读答题中（用于离开提醒）
const isReadingInProgress = computed(() => step.value === 'reading' && Object.keys(answers.value).length > 0)

// 离开页面提醒
const handleBeforeUnload = (e) => {
  if (isReadingInProgress.value) {
    e.preventDefault()
    e.returnValue = '阅读练习正在进行中，确定要离开吗？你的答题进度将会丢失。'
    return e.returnValue
  }
}

// --- Logic ---

const updateSetting = (key, value) => {
  settings.value[key] = value
}

// Paginated history
const paginatedHistory = computed(() => historyArticles.value)

watch([historyPage, historyPageSize], () => {
    fetchHistory()
})

onMounted(() => {
    fetchHistory()
    window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
})

const fetchHistory = async () => {
    try {
        const res = await aiApi.getReadingHistory(historyPage.value, historyPageSize.value)
        if (res.code === 200) {
            if (res.data.records) {
                historyArticles.value = res.data.records
                historyTotal.value = res.data.total
            } else {
                historyArticles.value = res.data || []
                historyTotal.value = historyArticles.value.length
            }
        }
    } catch (e) {
        console.error("Failed to fetch history", e)
    }
}

const loadArticle = (item) => {
    article.value = item
    answers.value = {}
    currentQuestionIndex.value = 0
    score.value = 0
    step.value = 'reading'
    // For history load, we can choose to type it fast or immediate
    // Let's do fast typing for consistency
    startTyping(item.content)
}

// Generate Reading Content
const generateReading = async () => {
    isLoading.value = true
    try {
        const res = await aiApi.generateReading(settings.value)
        if (res.code === 200 && res.data) {
            article.value = res.data
            
            if(!article.value.questions || article.value.questions.length === 0) {
                message.warning('未生成题目，使用模拟数据')
            }

            // Map passage field from backend (AI/Mock) to content field used by frontend
            if (!article.value.content && article.value.passage) {
                article.value.content = article.value.passage
            }

            currentQuestionIndex.value = 0
            answers.value = {}
            step.value = 'reading'
            
            // Start typewriter effect
            startTyping(article.value.content)
            
            message.success('阅读材料生成成功')
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
    if (currentQuestionIndex.value < article.value.questions.length - 1) {
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
    const questions = article.value.questions
    
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const userA = answers.value[i]
        const isCorrect = userA === q.correct
        
        if (isCorrect) correctCount++

        // Save learning record for each question, including original content (article content)
        try {
            await learningApi.createRecord({
                contentId: article.value.id || i,
                contentType: 'reading',
                isCorrect: isCorrect ? 1 : 0,
                answer: userA !== undefined ? String(userA) : '-1',
                correctAnswer: String(q.correct),
                masteryLevel: isCorrect ? 3 : 1,
                originalContent: JSON.stringify({
                    title: article.value.title,
                    content: article.value.content,
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
    article.value = null
}

const progressPercent = computed(() => {
    if (!article.value || article.value.questions.length === 0) return 0
    return ((currentQuestionIndex.value + 1) / article.value.questions.length) * 100
})

const skipTyping = () => {
    if (isTyping.value && article.value) {
        setImmediate(article.value.content)
    }
}
</script>

<template>
  <div class="page-container">
    
    <!-- Top Header -->
    <div class="page-header" v-if="step === 'setup'">
         <h1>阅读理解训练</h1>
         <p>精选全球外刊与经典名著，深度提升阅读理解能力</p>
    </div>

    <!-- Phase 1: Setup -->
    <div v-if="step === 'setup'" class="setup-container">
       <n-card class="setup-card" :bordered="false" size="huge">
          <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
             
             <!-- Left Column -->
             <n-grid-item span="2">
                 <!-- Source -->
                 <div class="setting-section">
                    <h3><n-icon :component="BookOpen" color="#6366f1" /> 阅读来源</h3>
                    <div class="grid-options source-grid">
                       <div 
                          v-for="src in sources" 
                          :key="src.value"
                          class="option-card"
                          :class="{ active: settings.source === src.value }"
                          @click="updateSetting('source', src.value)"
                       >
                          <span class="option-icon">{{ src.icon }}</span>
                          <span class="option-label">{{ src.label }}</span>
                       </div>
                    </div>
                 </div>

                 <!-- Category -->
                 <div class="setting-section">
                    <h3><n-icon :component="Target" color="#a855f7" /> 文章题材</h3>
                    <div class="grid-options category-grid">
                       <div 
                          v-for="cat in categories" 
                          :key="cat.value"
                          class="option-card category-card"
                          :class="{ active: settings.category === cat.value }"
                          @click="updateSetting('category', cat.value)"
                       >
                          <div class="icon-wrapper">
                              <n-icon :component="cat.icon" />
                          </div>
                          <div class="info">
                              <div class="option-label">{{ cat.label }}</div>
                              <div class="option-desc">{{ cat.desc }}</div>
                          </div>
                       </div>
                    </div>
                 </div>
             </n-grid-item>

             <!-- Right Column -->
             <n-grid-item>
                 <div class="side-settings">
                    <!-- Difficulty -->
                    <div class="setting-section">
                        <h3><n-icon :component="Brain" color="#eab308" /> 难度等级</h3>
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

                    <!-- Length -->
                    <div class="setting-section">
                        <h3><n-icon :component="FileText" color="#10b981" /> 文章篇幅</h3>
                        <div class="pill-options">
                           <div 
                              v-for="len in lengths" 
                              :key="len.value"
                              class="pill-option"
                              :class="{ active: settings.length === len.value }"
                              @click="updateSetting('length', len.value)"
                           >
                              {{ len.label }}
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
                        @click="generateReading"
                    >
                        <template #icon><n-icon :component="Rocket" /></template>
                        生成阅读任务
                    </n-button>
                 </div>
             </n-grid-item>
          </n-grid>
       </n-card>

       <!-- History Section -->
       <div v-if="historyArticles.length > 0" class="history-section">
            <div class="section-title">
                <n-icon :component="History" /> 最近生成
            </div>
            <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:3">
                <n-grid-item v-for="item in paginatedHistory" :key="item.id">
                    <n-card class="history-card" hoverable @click="loadArticle(item)">
                        <template #header>
                            <n-tag size="small" :bordered="false" type="success" class="mb-1">{{ item.source }}</n-tag>
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

    <!-- Phase 2: Reading -->
    <div v-else-if="step === 'reading'" class="reading-container" v-if="article">
       
       <!-- Back Button -->
       <div class="back-button-container mb-6">
           <n-button secondary @click="restart">
               <template #icon>
                   <n-icon :component="RotateCcw" />
               </template>
               返回设置
           </n-button>
       </div>

       <div class="reading-layout-container">
           <!-- Left Sidebar: Question Nav -->
           <div class="sidebar">
                <div class="sticky-nav">
                    <n-card class="nav-card mb-4" :bordered="false" title="题目导航" size="small">
                        <div class="question-grid">
                            <n-button 
                                v-for="(q, index) in article.questions" 
                                :key="index"
                                circle
                                class="nav-btn"
                                :class="{ 'current': currentQuestionIndex === index, 'answered': answers[index] != null && currentQuestionIndex !== index }"
                                :type="currentQuestionIndex === index ? 'primary' : (answers[index] != null ? 'success' : 'default')"
                                :secondary="currentQuestionIndex !== index"
                                @click="currentQuestionIndex = index"
                            >
                                {{ index + 1 }}
                            </n-button>
                        </div>
                    </n-card>

                    <div class="progress-card p-4">
                        <div class="text-xs text-gray-400 mb-2 flex justify-between">
                            <span>完成进度</span>
                            <span>{{ Math.round(progressPercent) }}%</span>
                        </div>
                        <n-progress 
                            type="line" 
                            :percentage="progressPercent" 
                            :show-indicator="false" 
                            color="#10b981"
                            rail-color="#3f3f46"
                            :height="6"
                        />
                    </div>
                </div>
           </div>

           <!-- Right Content: Article & Question -->
           <div class="main-content-area">
               <n-card class="question-card" :bordered="false" size="large">
                   <!-- Article Header -->
                   <div class="article-header">
                       <n-tag type="success" size="small">{{ settings.category.toUpperCase() }}</n-tag>
                       <h2>{{ article.title }}</h2>
                       <p class="meta">
                           <span>{{ article.source }}</span>
                           <span class="separator">•</span>
                           <span><n-icon :component="Clock" size="14" /> {{ article.word_count || 600 }} 词</span>
                       </p>
                   </div>

                   <n-divider />

                   <!-- Article Content -->
                   <div class="article-content" @click="isTyping ? skipTyping() : null">
                       <p v-for="(para, idx) in displayedText.split('\n')" :key="idx">
                           {{ para }}
                       </p>
                       <div v-if="isTyping" class="typing-cursor"></div>
                   </div>

                   <n-divider />

                   <!-- Current Question -->
                   <div class="question-content">
                       <h3 class="q-text">
                           <span class="q-num">Q{{ currentQuestionIndex + 1 }}</span>
                           {{ article.questions[currentQuestionIndex].text }}
                       </h3>
                       
                       <div class="options-container">
                           <n-grid x-gap="20" y-gap="20" cols="1">
                               <n-grid-item v-for="(option, idx) in article.questions[currentQuestionIndex].options" :key="idx">
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
                       
                       <n-button v-if="currentQuestionIndex < article.questions.length - 1" type="primary" @click="nextQuestion">下一题</n-button>
                       <n-button v-else type="success" @click="submitExam">提交答案</n-button>
                   </div>
               </n-card>
           </div>
       </div>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-container">
        <n-card class="score-card" :bordered="false">
            <n-result status="success" title="阅读完成" :description="'你的理解正确率：' + score + '%'">
                <template #icon>
                    <n-icon :component="Trophy" size="80" color="#eab308" />
                </template>
                <template #footer>
                    <n-space justify="center">
                        <n-button @click="restart">阅读下一篇</n-button>
                        <n-button type="primary" @click="step = 'review'">查看原文解析</n-button>
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

        <n-card v-if="article" class="review-card" title="详细解析" :bordered="false">
             <div class="article-preview mb-6">
                <h3 class="text-white mb-2">{{ article.title }}</h3>
                <div class="preview-text p-4 bg-black/20 rounded-lg">
                    <p v-for="(para, idx) in article.content.split('\n')" :key="idx" class="mb-2 text-zinc-400">
                        {{ para }}
                    </p>
                </div>
             </div>

             <n-divider />

             <n-list>
                 <n-list-item v-for="(q, idx) in article.questions" :key="idx">
                     <n-thing :title="'Q' + (idx + 1)">
                         <template #description>
                            <p class="mb-2 text-white">{{ q.text }}</p>
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
    max-width: 1400px;
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
    background: linear-gradient(120deg, #10b981, #06b6d4);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
.page-header p {
    color: #a1a1aa;
}

/* Setup Styles */
.setup-card {
    background: rgba(30,30,35, 0.6);
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
.source-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
.category-grid {
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
    background: rgba(16, 185, 129, 0.15);
    border-color: #10b981;
    color: #fff;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}
.option-icon { font-size: 2rem; margin-bottom: 8px; }
.option-label { font-weight: 600; font-size: 0.95rem; }

/* Category Card Specific */
.category-card {
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
.category-card.active .icon-wrapper {
    background: #10b981;
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
    background: #10b981;
    color: white;
    border-color: #10b981;
}

.start-btn {
    height: 56px;
    font-size: 1.1rem;
    font-weight: 700;
}

/* Reading Layout */
.reading-layout-container {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

.sidebar {
    width: 280px;
    flex-shrink: 0;
}

.sticky-nav {
    position: sticky;
    top: 24px;
}

.main-content-area {
    flex: 1;
    min-width: 0; /* Prevents flex item from overflowing */
}


/* Reading Styles */
/* .reading-container {
    max-width: 100%;
    margin: 0 auto;
} */
.back-button-container {
    margin-bottom: 20px;
}
/* Removed .progress-bar-container */
.question-card {
    background: #18181c;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
}

.article-header {
    margin-bottom: 16px;
}
.article-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 8px 0 12px;
    color: #fff;
}
.meta {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a1a1aa;
    font-size: 0.9rem;
}
.separator { color: #52525b; }

.article-content {
    font-family: 'Georgia', serif;
    font-size: 1.05rem;
    line-height: 1.8;
    color: #d4d4d8;
    max-height: 400px;
    overflow-y: auto;
    padding: 0 20px;
}
.article-content p {
    margin-bottom: 16px;
    text-indent: 2em;
}

.question-content { padding: 0 20px; }
.q-text { 
    font-size: 1.2rem; 
    margin-bottom: 24px; 
    color: #e4e4e7; 
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}
.q-num {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
}

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
    background: rgba(16, 185, 129, 0.15);
    border-color: #10b981;
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

.typing-cursor {
  display: inline-block;
  width: 10px;
  height: 18px;
  background-color: #10b981;
  animation: blink 0.8s infinite;
  vertical-align: middle;
  margin-left: 4px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.answer-option.selected .option-index {
    background: #10b981;
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
.preview-text { font-family: 'Georgia', serif; line-height: 1.6; }
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
.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 24px;
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
    border-color: #10b981;
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

.review-detail { margin-top: 12px; }
.text-white { color: #fff; }
.text-zinc-400 { color: #a1a1aa; }


.nav-card { 
    background: rgba(30, 30, 35, 0.6); 
    border: 1px solid rgba(255, 255, 255, 0.05); 
    border-radius: 16px; 
    margin-bottom: 24px;
}
.progress-card {
    background: rgba(30, 30, 35, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
}
.question-grid { 
    display: grid; 
    grid-template-columns: repeat(5, 1fr); 
    gap: 12px; 
}
.nav-btn { 
    font-weight: bold; 
    width: 36px; 
    height: 36px;
    margin: 0 auto; /* Center in grid cell */
}

/* Scrollbar */
.article-content::-webkit-scrollbar { width: 6px; }
.article-content::-webkit-scrollbar-track { background: transparent; }
.article-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
.article-content::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

/* ReadingView 专门的移动端优化 */
@media (max-width: 768px) {
  /* 阅读布局改为垂直 */
  .reading-layout-container {
    flex-direction: column !important;
  }
  
  /* 侧边栏全宽显示 */
  .sidebar {
    width: 100% !important;
    order: -1; /* 移到顶部 */
    margin-bottom: 20px;
  }
  
  /* 取消粘性定位 */
  .sticky-nav {
    position: static !important;
  }
  
  /* 题目网格调整 */
  .question-grid {
    grid-template-columns: repeat(6, 1fr) !important;
  }
  
  /* 主内容区域全宽 */
  .main-content-area {
    width: 100% !important;
  }
  
  /* 文章标题 */
  .article-header h2 {
    font-size: 1.4rem !important;
  }
  
  /* 文章内容 */
  .article-content {
    font-size: 1rem !important;
    max-height: 300px !important;
    padding: 0 12px !important;
  }
  
  /* 问题文本 */
  .q-text {
    font-size: 1.1rem !important;
  }
  
  /* 选项 */
  .answer-option {
    padding: 12px !important;
  }
  
  .option-text {
    font-size: 0.95rem !important;
  }
}

@media (max-width: 480px) {
  /* 题目网格进一步调整 */
  .question-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
  
  .article-header h2 {
    font-size: 1.2rem !important;
  }
  
  .article-content {
    font-size: 0.95rem !important;
  }
  
  .q-text {
    font-size: 1rem !important;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>