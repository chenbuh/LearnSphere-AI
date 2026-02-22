<script setup>
import { ref, onMounted, watch, computed, defineAsyncComponent } from 'vue'
import { 
  NCard, NTag, NButton, NInput, NCollapse, NCollapseItem, 
  NEmpty, NSpace, NIcon, NPopconfirm, NTabs, NTabPane, NPagination, NSpin, useMessage, useNotification,
  NModal, NDivider, NAlert
} from 'naive-ui'
import confetti from 'canvas-confetti'
import { 
  Trash2, RotateCw, Filter, BookOpen, AlertCircle, CheckCircle2,
  List as ListIcon, Mic, Headphones, FileText, Type, Sparkles, BrainCircuit, Bot,
  ShieldCheck, Fingerprint, Lock, Activity, Zap
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import { aiApi } from '@/api/ai'
import { MessageCircle } from 'lucide-vue-next'
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const notification = useNotification()

// State
const loading = ref(false)
const errors = ref([])
const activeTab = ref('all')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// AI Tutor State
const showTutor = ref(false)
const selectedErrorForTutor = ref(null)

const tutorContext = computed(() => {
  if (!selectedErrorForTutor.value) return null
  
  const err = selectedErrorForTutor.value
  return {
    type: 'error_analysis',
    contentType: err.type,
    question: err.question,
    options: err.options,
    userAnswer: formatAnswer(err.userAnswer, err.options),
    correctAnswer: formatAnswer(err.correctAnswer, err.options),
    explanation: err.explanation,
    topic: '错题回顾',
    module: err.type
  }
})

const openAITutor = (error) => {
    selectedErrorForTutor.value = error
    showTutor.value = true
}

// Filter Options
const tabs = [
  { name: 'all', label: '全部错题', icon: ListIcon },
  { name: 'vocabulary', label: '词汇', icon: Type },
  { name: 'grammar', label: '语法', icon: FileText },
  { name: 'reading', label: '阅读', icon: BookOpen },
  { name: 'listening', label: '听力', icon: Headphones }
]

// Fetch Data
const fetchErrors = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      isCorrect: 0,
      contentType: activeTab.value === 'all' ? undefined : activeTab.value
    }
    const res = await learningApi.getRecords(params)
    if (res.code === 200) {
      errors.value = res.data.records.map(processRecord)
      total.value = res.data.total
    }
  } catch (e) {
    message.error('加载错题失败')
  } finally {
    loading.value = false
  }
}

// Data Processing
const processRecord = (record) => {
  let details = {}
  try {
    if (record.originalContent) {
      details = JSON.parse(record.originalContent)
    }
  } catch (e) {
    console.error('Failed to parse originalContent:', e)
  }

  // 深度解析 question 对象
  let questionText = '未知题目'
  let questionOptions = []
  let explanation = '暂无解析'
  
  // 处理嵌套的 question 对象（如阅读/听力模块）
  if (details.question && typeof details.question === 'object') {
    questionText = details.question.question || details.question.text || details.question.title || '未知题目'
    questionOptions = details.question.options || []
    explanation = details.question.explanation || '暂无解析'
  } 
  // 处理直接包含 question 字段的情况（如语法/词汇）
  else if (details.text || details.question) {
    questionText = details.text || details.question || '未知题目'
    questionOptions = details.options || []
    explanation = details.explanation || '暂无解析'
  }
  // 处理其他格式
  else {
    questionText = details.title || details.content || record.answer || '未知题目'
    explanation = details.explanation || details.answer || '暂无解析'
  }

  return {
    id: record.id,
    type: record.contentType,
    question: questionText,
    options: questionOptions,
    userAnswer: record.answer,
    correctAnswer: record.correctAnswer,
    explanation: explanation,
    note: '',
    date: new Date(record.createTime).toLocaleDateString(),
    details: details
  }
}

// AI Deep Analyze
const handleAiAnalyze = async (record) => {
    analyzingId.value = record.id
    try {
        const res = await aiApi.deepAnalyzeError(record.id)
        if (res.code === 200) {
            aiAnalysisResult.value = res.data
            showAiModal.value = true
            
            // Check for new achievements
            if (res.data.newAchievements?.length > 0) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#fbbf24'] })
                setTimeout(() => { confetti({ particleCount: 100, spread: 100, origin: { x: 0.3, y: 0.7 } }) }, 200)

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
    } catch (error) {
        message.error('AI 分析失败，请检查 VIP 权益或 API 余额')
    } finally {
        analyzingId.value = null
    }
}

// Watchers
watch([activeTab, pageSize], () => {
  page.value = 1
  fetchErrors()
})

watch(page, () => {
  fetchErrors()
})

onMounted(() => {
  fetchErrors()
})

const removeError = async (id) => {
  try {
    const res = await learningApi.deleteRecord(id)
    if (res.code === 200) {
      errors.value = errors.value.filter(e => e.id !== id)
      message.success('已移出错题本')
    } else {
      message.error(res.message || '移除失败')
    }
  } catch (e) {
    message.error('请求失败')
  }
}

const formatAnswer = (answer, options) => {
  // 如果没有选项，直接返回答案
  if (!options || options.length === 0) {
    return answer || 'undefined'
  }
  
  // 尝试将答案转换为数字索引
  const answerIdx = parseInt(answer)
  
  // 如果是有效的索引，返回字母标签
  if (!isNaN(answerIdx) && answerIdx >= 0 && answerIdx < options.length) {
    return String.fromCharCode(65 + answerIdx) // A, B, C, D...
  }
  
  // 否则返回原始答案
  return answer || 'undefined'
}

const getTypeColor = (type) => {
  const map = { vocabulary: 'success', grammar: 'info', reading: 'warning', listening: 'error' }
  return map[type] || 'default'
}

const formatType = (type) => {
  const map = { vocabulary: '词汇', grammar: '语法', reading: '阅读', listening: '听力' }
  return map[type] || type
}

onMounted(() => {
  fetchErrors()
})</script>

<template>
  <div class="page-container">
    <div class="page-header-row">
      <div class="header-text">
        <div class="header-title-flex">
            <h1>错题智库 <span class="ai-badge">AI ANALYTICS</span></h1>
            <div class="security-stamp">
                <ShieldCheck :size="12" /> SECURED BY SENTINEL
            </div>
        </div>
        <p>基于 RAG 引擎的深度错因挖掘与知识铠甲强化</p>
      </div>
      
      <div class="header-actions">
         <n-button secondary type="primary" @click="fetchErrors">
             <template #icon><n-icon :component="RotateCw" /></template>
             同步云端
         </n-button>
      </div>
    </div>

    <!-- Tabs Filter -->
    <div class="tabs-container">
        <n-tabs v-model:value="activeTab" type="segment" animated>
            <n-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name">
                <template #tab>
                    <div class="tab-label">
                        <n-icon :component="tab.icon" size="16" />
                        <span>{{ tab.label }}</span>
                    </div>
                </template>
            </n-tab-pane>
        </n-tabs>
    </div>

    <!-- Error List -->
    <n-spin :show="loading">
        <div v-if="errors.length > 0" class="error-list">
           <n-card 
             v-for="err in errors" 
             :key="err.id" 
             class="error-card" 
             :bordered="false"
           >
              <div class="card-top">
                 <n-space>
                    <n-tag :type="getTypeColor(err.type)" size="small" round :bordered="false">{{ formatType(err.type) }}</n-tag>
                    <span class="date-text">{{ err.date }}</span>
                 </n-space>
                 <n-button 
                   size="tiny" 
                   type="primary" 
                   secondary 
                   round 
                   :loading="analyzingId === err.id"
                   @click="handleAiAnalyze(err)"
                 >
                    <template #icon><Sparkles :size="12" /></template>
                    AI 深度解析
                 </n-button>
                 <n-button 
                   size="tiny" 
                   type="primary" 
                   quaternary 
                   round 
                   @click="openAITutor(err)"
                 >
                    <template #icon><n-icon :component="MessageCircle" :size="12" /></template>
                    问问 AI
                 </n-button>
              </div>
              
              <div class="question-body">
                  <h3>{{ err.question }}</h3>
                  
                  <!-- 显示选项 (如果有) -->
                  <div v-if="err.options && err.options.length > 0" class="options-display">
                    <div 
                      v-for="(opt, idx) in err.options" 
                      :key="idx"
                      class="option-item-display"
                      :class="{
                        'is-correct': idx == err.correctAnswer,
                        'is-user': idx == err.userAnswer,
                        'is-wrong': idx == err.userAnswer && idx != err.correctAnswer
                      }"
                    >
                      <span class="opt-label">{{ String.fromCharCode(65 + idx) }}.</span>
                      <span class="opt-content">{{ opt }}</span>
                      <n-tag v-if="idx == err.correctAnswer" type="success" size="tiny" style="margin-left: auto;">✓ 正确</n-tag>
                      <n-tag v-else-if="idx == err.userAnswer" type="error" size="tiny" style="margin-left: auto;">✗ 你选的</n-tag>
                    </div>
                  </div>
              </div>
              
              <div class="answer-comparison">
                 <div class="answer-box user">
                    <div class="label">曾经错误</div>
                    <div class="content">{{ formatAnswer(err.userAnswer, err.options) }}</div>
                 </div>
                 <div class="answer-box correct">
                    <div class="label">标准答案</div>
                    <div class="content">{{ formatAnswer(err.correctAnswer, err.options) }}</div>
                 </div>
              </div>

              <div class="card-footer">
                 <n-collapse arrow-placement="right">
                     <n-collapse-item title="基础解析" name="1">
                        <div class="base-explanation">{{ err.explanation }}</div>
                     </n-collapse-item>
                 </n-collapse>
                 <n-popconfirm @positive-click="removeError(err.id)">
                    <template #trigger>
                        <n-button size="tiny" quaternary circle type="error"><Trash2 :size="14" /></n-button>
                    </template>
                    移出错题本？
                 </n-popconfirm>
              </div>
           </n-card>

           <div class="pagination-footer">
               <n-pagination 
                 v-model:page="page" 
                 v-model:page-size="pageSize"
                 :item-count="total" 
                 show-size-picker
                 :page-sizes="[10, 20, 30, 50]"
               />
           </div>
        </div>
        <div v-else class="empty-state">
           <n-empty description="暂无该分类下的错题记录" size="large" />
        </div>
    </n-spin>

    <!-- AI Analysis Modal -->
    <n-modal v-model:show="showAiModal" preset="card" style="width: 720px; border-radius: 28px;" :bordered="false" :trap-focus="true" :auto-focus="true" class="ai-analytics-modal">
        <template #header>
            <div class="ai-modal-header">
                <div class="title-main">
                    <Fingerprint class="text-indigo-400" :size="24" />
                    <span>AI 错因 DNA 根源分析</span>
                </div>
                <div class="modal-status-badge">
                    <div class="pulse-dot"></div>
                    REAL-TIME ANALYSIS
                </div>
            </div>
        </template>

        <div v-if="aiAnalysisResult" class="ai-analysis-container">
            <!-- Root Cause DNA -->
            <div class="analysis-segment">
                <div class="segment-label">
                    <Activity :size="14" /> ROOT CAUSE DNA
                </div>
                <div class="analysis-box">
                    <div class="dna-decoration"></div>
                    <p class="analysis-text">{{ aiAnalysisResult.analysis }}</p>
                </div>
            </div>

            <!-- Knowledge Shield -->
            <div class="analysis-segment mt-6">
                <div class="segment-label text-amber-500">
                    <ShieldCheck :size="14" /> KNOWLEDGE ARMOR (RAG)
                </div>
                <div class="armor-container">
                    <div class="armor-glow"></div>
                    <div class="armor-content">
                        {{ aiAnalysisResult.knowledgeShield }}
                    </div>
                </div>
            </div>

            <!-- AI Challenge -->
            <div class="analysis-segment mt-6">
                <div class="segment-label text-emerald-500">
                    <Zap :size="14" /> AI COGNITIVE CHALLENGE
                </div>
                <div class="challenge-wrapper">
                    <div class="challenge-q">{{ aiAnalysisResult.challengeQuestion?.text }}</div>
                    <div class="options-layout">
                        <div v-for="(opt, idx) in aiAnalysisResult.challengeQuestion?.options" :key="idx" class="modern-option">
                            <span class="opt-prefix">{{ String.fromCharCode(65 + idx) }}</span>
                            <span class="opt-text">{{ opt }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-security-footer">
                <Lock :size="10" /> 
                ENCRYPTED AUDIT COMPLETED BY LEARNSPHERE SENTINEL v2
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between items-center">
                <div class="points-earned text-xs text-zinc-500" v-if="aiAnalysisResult?.points">
                    奖励积分: <span class="text-amber-500 font-bold">+{{ aiAnalysisResult.points }}</span>
                </div>
                <n-button type="primary" round class="solve-btn" @click="showAiModal = false">
                    深度掌握，继续学习
                </n-button>
            </div>
        </template>
    </n-modal>

    <!-- AI Tutor Component -->
    <AITutor 
      :context="tutorContext"
      :auto-open="showTutor"
      @close="showTutor = false"
    />
  </div>
</template>

<style scoped>
.page-container { max-width: 850px; margin: 40px auto; padding: 0 20px; }
.page-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.header-text h1 { font-size: 2.2rem; font-weight: 900; background: linear-gradient(120deg, #6366f1, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.header-text p { color: #71717a; }

.header-title-flex { display: flex; align-items: baseline; gap: 16px; }
.ai-badge { font-size: 0.8rem; font-weight: 400; color: #a1a1aa; letter-spacing: 2px; }
.security-stamp { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #34d399; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 99px; font-weight: 700; }

.error-card { 
  background: rgba(255, 255, 255, 0.6); 
  border-radius: 24px; 
  border: 1px solid rgba(0, 0, 0, 0.05); 
  margin-bottom: 24px; 
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
  padding: 24px; 
  overflow: hidden; 
  position: relative; 
}
:global(.dark-mode) .error-card { 
  background: rgba(20, 20, 25, 0.45); 
  border: 1px solid rgba(255, 255, 255, 0.05); 
}
.error-card:hover { 
  border-color: rgba(99, 102, 241, 0.4); 
  transform: translateY(-4px); 
  box-shadow: 0 12px 40px -10px rgba(0,0,0,0.1); 
}
:global(.dark-mode) .error-card:hover { 
  background: rgba(24, 24, 27, 0.7); 
  box-shadow: 0 12px 40px -10px rgba(0,0,0,0.5); 
}

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.date-text { font-size: 0.75rem; color: #71717a; font-family: 'JetBrains Mono', monospace; }

.question-body h3 { 
  font-size: 1.15rem; 
  color: #ffffff; 
  line-height: 1.7; 
  margin-bottom: 20px; 
  font-weight: 600; 
}

.options-display {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item-display {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  transition: all 0.25s ease;
  gap: 12px;
}

.option-item-display.is-correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.option-item-display.is-wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.option-item-display.is-user:not(.is-correct) {
  background: rgba(239, 68, 68, 0.08);
}

.opt-label {
  font-weight: 800;
  font-size: 0.9rem;
  color: #a5b4fc;
  font-family: 'JetBrains Mono', monospace;
  min-width: 24px;
}

.option-item-display.is-correct .opt-label {
  color: #10b981;
}

.option-item-display.is-wrong .opt-label {
  color: #ef4444;
}

.opt-content {
  flex: 1;
  color: #ffffff;
  line-height: 1.6;
  font-weight: 500;
}

.answer-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.answer-box { 
  padding: 16px; 
  border-radius: 16px; 
  background: rgba(0,0,0,0.3); 
  border: 1px solid rgba(255,255,255,0.05); 
}
.answer-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; font-weight: 800; display: block; opacity: 0.8; }
.answer-box.user .label { color: #f87171; }
.answer-box.correct .label { color: #10b981; }
.answer-box .content { font-size: 1rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.answer-box.user .content { color: #fca5a5; opacity: 0.9; text-decoration: line-through; }
.answer-box.correct .content { color: #34d399; }

.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); }

/* AI Analytics Modal */
:deep(.ai-analytics-modal .n-card) { 
  background: rgba(255, 255, 255, 0.98) !important; 
  backdrop-filter: blur(25px) !important; 
  box-shadow: 0 0 100px -20px rgba(99, 102, 241, 0.2) !important; 
}
:global(.dark-mode) :deep(.ai-analytics-modal .n-card) { 
  background: rgba(15, 15, 20, 0.98) !important; 
  box-shadow: 0 0 100px -20px rgba(99, 102, 241, 0.3) !important; 
}
.ai-modal-header { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; }
.title-main { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  font-size: 1.25rem; 
  font-weight: 800; 
  color: #ffffff; 
}
.modal-status-badge { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; color: #6366f1; letter-spacing: 1px; }
.pulse-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; animation: pulse-radar 2s infinite; }

@keyframes pulse-radar { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }

.segment-label { font-size: 11px; font-weight: 900; letter-spacing: 0.2em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; color: #a5b4fc; }
.analysis-box { 
  background: rgba(255, 255, 255, 0.02); 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  border-radius: 20px; 
  padding: 24px; 
  position: relative; 
  overflow: hidden; 
}
.dna-decoration { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #6366f1, transparent); }
.analysis-text { 
  color: #f3f4f6 !important; 
  line-height: 1.8; 
  font-size: 1.05rem; 
  opacity: 1 !important;
}

.armor-container { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(0,0,0,0)); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 20px; padding: 24px; position: relative; }
.armor-content { font-size: 1rem; color: #fcd34d !important; font-weight: 600; line-height: 1.7; }
.armor-glow { position: absolute; top: 0; right: 0; width: 80px; height: 80px; background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%); }

.challenge-wrapper { background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 20px; padding: 24px; }
.challenge-q { 
  font-size: 1.1rem; 
  color: #ffffff !important; 
  margin-bottom: 20px; 
  font-weight: 600; 
  opacity: 1 !important;
}
.options-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modern-option { 
  background: rgba(0,0,0,0.3); 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  padding: 12px 16px; 
  border-radius: 12px; 
  display: flex; 
  gap: 12px; 
  transition: all 0.2s; 
}
.modern-option:hover { 
  background: rgba(0,0,0,0.06); 
  transform: translateX(4px); 
}
:global(.dark-mode) .modern-option:hover { 
  background: rgba(255,255,255,0.05); 
}
.opt-prefix { font-weight: 800; color: #10b981; font-family: 'JetBrains Mono', monospace; }
.opt-text { color: #ffffff !important; font-weight: 500; opacity: 1 !important; }

.modal-security-footer { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 9px; color: rgba(255,255,255,0.2); font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 32px; }
.solve-btn { height: 48px; padding: 0 32px; font-weight: 700; box-shadow: 0 8px 24px -6px rgba(99, 102, 241, 0.5); }

.pagination-footer { display: flex; justify-content: center; padding: 60px 0; }
</style>