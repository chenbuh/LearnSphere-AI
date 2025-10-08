<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { 
  NCard, NTag, NButton, NInput, NCollapse, NCollapseItem, 
  NEmpty, NSpace, NIcon, NPopconfirm, NTabs, NTabPane, NPagination, NSpin, useMessage, useNotification,
  NModal, NDivider, NAlert
} from 'naive-ui'
import confetti from 'canvas-confetti'
import { 
  Trash2, RotateCw, Filter, BookOpen, AlertCircle, CheckCircle2,
  List as ListIcon, Mic, Headphones, FileText, Type, Sparkles, BrainCircuit, Bot
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import { aiApi } from '@/api/ai'

const message = useMessage()
const notification = useNotification()

// State
const loading = ref(false)
const errors = ref([])
const activeTab = ref('all')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// AI Analyze State
const analyzingId = ref(null)
const showAiModal = ref(false)
const aiAnalysisResult = ref(null)

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
  } catch (e) {}

  return {
    id: record.id,
    type: record.contentType,
    question: details.question || details.text || details.title || record.answer || '未知题目',
    userAnswer: record.answer,
    correctAnswer: record.correctAnswer,
    explanation: details.explanation || '暂无解析',
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

const removeError = (id) => {
  errors.value = errors.value.filter(e => e.id !== id)
  message.success('已移除')
}

const getTypeColor = (type) => {
  const map = { vocabulary: 'success', grammar: 'info', reading: 'warning', listening: 'error' }
  return map[type] || 'default'
}

const formatType = (type) => {
  const map = { vocabulary: '词汇', grammar: '语法', reading: '阅读', listening: '听力' }
  return map[type] || type
}

</script>

<template>
  <div class="page-container">
    <div class="page-header-row">
      <div class="header-text">
        <h1>错题智库 (AI Analytics)</h1>
        <p>基于错题记录，为您提供深度 RAG 分析与知识强化</p>
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
              </div>
              
              <div class="question-body">
                  <h3>{{ err.question }}</h3>
              </div>
              
              <div class="answer-comparison">
                 <div class="answer-box user">
                    <div class="label">曾经错误</div>
                    <div class="content">{{ err.userAnswer }}</div>
                 </div>
                 <div class="answer-box correct">
                    <div class="label">标准答案</div>
                    <div class="content">{{ err.correctAnswer }}</div>
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
               <n-pagination v-model:page="page" :item-count="total" :page-size="pageSize" />
           </div>
        </div>
        <div v-else class="empty-state">
           <n-empty description="暂无该分类下的错题记录" size="large" />
        </div>
    </n-spin>

    <!-- AI Analysis Modal -->
    <n-modal v-model:show="showAiModal" preset="card" title="AI 专家深度语义分析" style="width: 700px; border-radius: 20px;" class="ai-modal">
        <div v-if="aiAnalysisResult" class="ai-content">
            <div class="ai-section">
                <div class="section-title"><BrainCircuit :size="18" class="mr-2 text-indigo-400" /> 错因根源挖掘</div>
                <div class="section-body analysis-text">{{ aiAnalysisResult.analysis }}</div>
            </div>

            <n-divider class="my-4" />

            <div class="ai-section">
                <div class="section-title"><Sparkles :size="18" class="mr-2 text-amber-400" /> 核心知识铠甲 (RAG)</div>
                <n-alert :show-icon="false" type="warning" class="knowledge-card">
                    {{ aiAnalysisResult.knowledgeShield }}
                </n-alert>
            </div>

            <n-divider class="my-4" />

            <div class="ai-section">
                <div class="section-title"><Bot :size="18" class="mr-2 text-emerald-400" /> 举一反三：挑战题</div>
                <div class="challenge-box">
                    <p class="challenge-q">{{ aiAnalysisResult.challengeQuestion?.text }}</p>
                    <div class="options-grid">
                        <div v-for="(opt, idx) in aiAnalysisResult.challengeQuestion?.options" :key="idx" class="option-pill">
                            {{ String.fromCharCode(65 + idx) }}: {{ opt }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end"><n-button type="primary" @click="showAiModal = false">我会了，关闭</n-button></div>
        </template>
    </n-modal>
  </div>
</template>

<style scoped>
.page-container { max-width: 850px; margin: 40px auto; padding: 0 20px; }
.page-header-row { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; }
.header-text h1 { font-size: 2.2rem; font-weight: 900; background: linear-gradient(120deg, #6366f1, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.header-text p { color: #71717a; }

.error-card { background: rgba(24, 24, 27, 0.6); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 20px; transition: all 0.3s; padding: 20px; }
.error-card:hover { border-color: rgba(99, 102, 241, 0.3); transform: translateY(-2px); }

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.date-text { font-size: 0.75rem; color: #52525b; }

.question-body h3 { font-size: 1.1rem; color: #e4e4e7; line-height: 1.6; margin-bottom: 16px; }

.answer-comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.answer-box { padding: 12px; border-radius: 12px; background: rgba(0,0,0,0.2); }
.answer-box .label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.answer-box.user .label { color: #f87171; }
.answer-box.correct .label { color: #34d399; }
.answer-box .content { font-size: 0.9rem; font-weight: 600; }
.answer-box.user .content { color: #fca5a5; opacity: 0.7; text-decoration: line-through; }
.answer-box.correct .content { color: #6ee7b7; }

.card-footer { display: flex; justify-content: space-between; align-items: flex-start; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.03); }
.base-explanation { font-size: 0.85rem; color: #a1a1aa; line-height: 1.6; }

/* AI Modal */
.ai-section { margin-bottom: 20px; }
.section-title { font-size: 1rem; font-weight: 800; display: flex; align-items: center; margin-bottom: 12px; color: #fff; }
.analysis-text { color: #d4d4d8; line-height: 1.8; font-size: 0.95rem; }
.knowledge-card { border-radius: 12px; background: rgba(245, 158, 11, 0.05) !important; border: 1px solid rgba(245, 158, 11, 0.2) !important; color: #fcd34d; font-size: 0.9rem; }
.challenge-box { background: rgba(255,255,255,0.03); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
.challenge-q { color: #fff; margin-bottom: 12px; line-height: 1.5; }
.options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.option-pill { background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; color: #a1a1aa; border: 1px solid rgba(255,255,255,0.05); }

.pagination-footer { display: flex; justify-content: center; padding: 40px 0; }
.empty-state { padding: 80px 0; }
</style>
