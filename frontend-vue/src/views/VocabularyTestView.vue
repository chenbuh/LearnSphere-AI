<script setup>
import { ref, computed } from 'vue'
import { 
  NCard, NButton, NSpace, NTag, NProgress, NResult, NAvatar,
  NGrid, NGridItem, NDivider, NList, NListItem, NThing
} from 'naive-ui'
import { 
  Rocket, Trophy, RotateCcw, CheckCircle2, XCircle, 
  Brain, Target, Clock, BookOpen, AlertCircle
} from 'lucide-vue-next'
import { vocabularyDatabase } from '../data/vocabulary.js'
import confetti from 'canvas-confetti'

// --- State ---
const step = ref('setup') // 'setup' | 'testing' | 'result'
const currentQuestionIndex = ref(0)
const answers = ref({})
const score = ref(0)
const generatedQuestions = ref([])

// --- Settings State ---
const settings = ref({
  examType: 'cet4',
  mode: 'translation',
  difficulty: 'medium',
  count: 20
})

// --- Options Constants ---
const examTypes = [
  { label: '小学', value: 'primary', icon: '👶' },
  { label: '中考', value: 'middle', icon: '📝' },
  { label: '高考', value: 'high', icon: '🎓' },
  { label: 'CET-4', value: 'cet4', icon: '📘' },
  { label: 'CET-6', value: 'cet6', icon: '📙' },
  { label: 'IELTS', value: 'ielts', icon: '🌏' },
  { label: 'TOEFL', value: 'toefl', icon: '🗽' },
  { label: '考研', value: 'postgraduate', icon: '📚' }
]

const testModes = [
  { label: '中英互译', value: 'translation', icon: BookOpen, desc: '看英文选中文' },
  { label: '拼写测试', value: 'spelling', icon: Brain, desc: '根据释义拼写 (模拟)' },
  { label: '用法选择', value: 'usage', icon: Target, desc: '选词填空 (模拟)' }
]

const difficulties = [
  { label: '基础', value: 'easy' },
  { label: '中级', value: 'medium' },
  { label: '高级', value: 'hard' },
  { label: '混合', value: 'mixed' }
]

const counts = [10, 20, 30, 50]

// --- Logic ---

const updateSetting = (key, value) => {
  settings.value[key] = value
}

const generateQuestions = () => {
    // 1. Get words from DB
    const allWords = vocabularyDatabase.loadRealVocabularyData(settings.value.examType) || []
    
    // 2. Mock shuffle
    const shuffled = [...allWords].sort(() => 0.5 - Math.random())
    const selectedWords = shuffled.slice(0, settings.value.count)

    // 3. Create Questions
    generatedQuestions.value = selectedWords.map((word, idx) => {
        const otherWords = allWords.filter(w => w.word !== word.word)
        const randomSentences = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3)
        const options = [word.meaning, ...randomSentences.map(w => w.meaning)]
        
        return {
            id: idx,
            word: word.word,
            phonetic: word.phonetic,
            correct: word.meaning,
            options: options.sort(() => 0.5 - Math.random()), 
            type: 'choice'
        }
    })

    currentQuestionIndex.value = 0
    answers.value = {}
    step.value = 'testing'
}

const selectAnswer = (option) => {
   answers.value[currentQuestionIndex.value] = option
   if (currentQuestionIndex.value < generatedQuestions.value.length - 1) {
       setTimeout(() => {
           currentQuestionIndex.value++
       }, 300)
   }
}

const jumpToQuestion = (index) => {
    currentQuestionIndex.value = index
}

const submitExam = () => {
    let correctCount = 0
    generatedQuestions.value.forEach((q, idx) => {
        if (answers.value[idx] === q.correct) {
            correctCount++
        }
    })
    score.value = Math.round((correctCount / generatedQuestions.value.length) * 100)
    step.value = 'result'

    // Trigger celebration for high scores
    if (score.value >= 80) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#10b981']
        })
    }
}

const restart = () => {
    step.value = 'setup'
    answers.value = {}
    currentQuestionIndex.value = 0
    score.value = 0
}

const progressPercent = computed(() => {
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
         <h1>词汇能力测试</h1>
         <p>定制专属测试计划，精准定位词汇量等级</p>
    </div>

    <!-- Phase 1: Setup -->
    <div v-if="step === 'setup'" class="setup-container">
       <n-card class="setup-card" :bordered="false" size="huge">
          <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
             
             <!-- Left Column -->
             <n-grid-item span="2">
                 <!-- Exam Type -->
                 <div class="setting-section">
                    <h3><n-icon :component="BookOpen" color="#6366f1" /> 目标词汇库</h3>
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
                    <h3><n-icon :component="Target" color="#a855f7" /> 测试模式</h3>
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

                    <!-- Count -->
                    <div class="setting-section">
                        <h3><n-icon :component="Clock" color="#10b981" /> 题目数量</h3>
                        <div class="pill-options">
                           <div 
                              v-for="c in counts" 
                              :key="c"
                              class="pill-option"
                              :class="{ active: settings.count === c }"
                              @click="updateSetting('count', c)"
                           >
                              {{ c }}
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
                        @click="generateQuestions"
                    >
                        <template #icon><n-icon :component="Rocket" /></template>
                        开始挑战
                    </n-button>
                 </div>
             </n-grid-item>
          </n-grid>
       </n-card>
    </div>

    <!-- Phase 2: Testing -->
    <div v-else-if="step === 'testing'" class="testing-container">
       
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

       <n-card class="question-card" :bordered="false" size="large" v-if="generatedQuestions[currentQuestionIndex]">
           <div class="question-header">
               <div class="word-display">{{ generatedQuestions[currentQuestionIndex].word }}</div>
               <div class="phonetic-display">/ {{ generatedQuestions[currentQuestionIndex].phonetic }} /</div>
           </div>

           <div class="options-container">
               <n-grid x-gap="20" y-gap="20" cols="1 600:2">
                   <n-grid-item v-for="(option, idx) in generatedQuestions[currentQuestionIndex].options" :key="idx">
                       <div 
                            class="answer-option"
                            :class="{ selected: answers[currentQuestionIndex] === option }"
                            @click="selectAnswer(option)"
                       >
                           <span class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                           <span class="option-text">{{ option }}</span>
                       </div>
                   </n-grid-item>
               </n-grid>
           </div>
           
           <div class="actions-footer">
               <n-button v-if="currentQuestionIndex === generatedQuestions.length - 1" type="success" @click="submitExam">提交试卷</n-button>
               <n-button v-else secondary @click="submitExam">提前交卷</n-button>
           </div>
       </n-card>
       <div class="navigator-panel">
           <div 
               v-for="(q, idx) in generatedQuestions" 
               :key="idx"
               class="nav-item"
               :class="{ 
                   'active': currentQuestionIndex === idx,
                   'answered': answers[idx] !== undefined
               }"
               @click="jumpToQuestion(idx)"
           >
               {{ idx + 1 }}
           </div>
       </div>
    </div>

    <!-- Phase 3: Result -->
    <div v-else-if="step === 'result'" class="result-container">
        <n-card class="score-card" :bordered="false">
            <n-result status="success" title="测试完成" :description="'你的得分为：' + score">
                <template #icon>
                    <n-icon :component="Trophy" size="80" color="#eab308" />
                </template>
                <template #footer>
                    <n-space justify="center">
                        <n-button @click="restart">再测一次</n-button>
                        <n-button type="primary">查看详情</n-button>
                    </n-space>
                </template>
            </n-result>
        </n-card>

        <n-card v-if="wrongAnswers.length > 0" title="错题回顾" class="wrong-answers-card" :bordered="false">
             <n-list>
                 <n-list-item v-for="q in wrongAnswers" :key="q.id">
                     <n-thing :title="q.word">
                         <template #description>
                             <span class="phonetic">/{{ q.phonetic }}/</span>
                         </template>
                         <div class="wrong-detail">
                             <div class="your-answer">你的答案: <span class="error-text">{{ answers[q.id] || '未作答' }}</span></div>
                             <div class="correct-answer">正确释义: <span class="success-text">{{ q.correct }}</span></div>
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
    -webkit-text-fill-color: transparent;
}
.page-header p {
    color: #a1a1aa;
}

/* Setup Styles */
.setup-card {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 24px;
}
:global(.dark-mode) .setup-card {
    background: rgba(30, 30, 35, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
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
    color: #18181b;
}
:global(.dark-mode) .setting-section h3 {
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
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
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
:global(.dark-mode) .option-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
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
    background: rgba(0,0,0,0.05);
    display: flex;
}
:global(.dark-mode) .mode-icon-wrapper {
    background: rgba(255,255,255,0.05);
}
.mode-card.active .mode-icon-wrapper {
    background: #6366f1;
    color: white;
}
.option-desc { font-size: 0.75rem; color: #52525b; margin-top: 2px; }
:global(.dark-mode) .option-desc { color: #a1a1aa; }

/* Side Settings */
.side-settings {
    background: rgba(0,0,0,0.02);
    padding: 24px;
    border-radius: 16px;
}
:global(.dark-mode) .side-settings {
    background: rgba(255,255,255,0.02);
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
    background: rgba(0,0,0,0.03);
    border: 1px solid rgba(0,0,0,0.05);
    cursor: pointer;
    font-size: 0.9rem;
    color: #52525b;
    white-space: nowrap;
}
:global(.dark-mode) .pill-option {
    background: rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.05);
    color: #a1a1aa;
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
    background: rgba(0,0,0,0.03);
    border-radius: 20px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
}
:global(.dark-mode) .question-card {
    background: #18181c;
}
.question-header {
    text-align: center;
    padding: 20px 0 40px;
}
.word-display {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 12px;
    color: #18181b;
}
:global(.dark-mode) .word-display { color: #fff; }
.phonetic-display {
    background: rgba(0,0,0,0.05);
    display: inline-block;
    padding: 4px 16px;
    border-radius: 99px;
    color: #6366f1;
    font-family: monospace;
}
:global(.dark-mode) .phonetic-display {
    background: rgba(255,255,255,0.05);
    color: #818cf8;
}

.answer-option {
    background: rgba(0,0,0,0.03);
    border: 1px solid rgba(0,0,0,0.05);
    padding: 20px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.2s;
}
:global(.dark-mode) .answer-option {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
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
    background: rgba(0,0,0,0.06);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-weight: 700;
    color: #52525b;
}
:global(.dark-mode) .option-index {
    background: rgba(0,0,0,0.3);
    color: #a1a1aa;
}
.answer-option.selected .option-index {
    background: #6366f1;
    color: white;
}
.option-text {
    font-size: 1.1rem;
}
.actions-footer {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}

.navigator-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 32px;
    justify-content: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 16px;
}
:global(.dark-mode) .navigator-panel {
    background: rgba(30, 30, 35, 0.4);
}
.nav-item {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.05);
    border-radius: 10px;
    cursor: pointer;
    color: #52525b;
    font-weight: 700;
    transition: all 0.2s;
}
:global(.dark-mode) .nav-item {
    background: rgba(255,255,255,0.05);
    color: #71717a;
}
.nav-item:hover {
    background: rgba(255,255,255,0.1);
    transform: translateY(-2px);
}
.nav-item.active {
    background: #6366f1;
    color: white;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    border: 1px solid #818cf8;
}
.nav-item.answered:not(.active) {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.3);
}

/* Result Styles */
.score-card {
    text-align: center;
    padding: 40px;
    border-radius: 24px;
    margin-bottom: 24px;
    background: rgba(0,0,0,0.03);
}
:global(.dark-mode) .score-card {
    background: #18181c;
}
.wrong-answers-card {
    border-radius: 24px;
    background: rgba(0,0,0,0.03);
}
:global(.dark-mode) .wrong-answers-card {
    background: #18181c;
}
.wrong-detail {
    margin-top: 8px;
    font-size: 0.9rem;
    color: #52525b;
}
:global(.dark-mode) .wrong-detail { color: #a1a1aa; }
.error-text { color: #ef4444; }
.success-text { color: #10b981; }
</style>
