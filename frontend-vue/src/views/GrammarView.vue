<script setup>
import { defineAsyncComponent } from 'vue'
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
  NPagination,
  NSpace,
  NTag
} from 'naive-ui'
import {
  ArrowLeft,
  CheckCircle2,
  History
} from 'lucide-vue-next'
import GrammarSidebarPanel from '@/components/grammar/GrammarSidebarPanel.vue'
import { useGrammarPractice } from '@/composables/useGrammarPractice'

const AITutorEnhanced = defineAsyncComponent(() => import('@/components/AITutorEnhanced.vue'))
const GrammarQuestionPanel = defineAsyncComponent(() => import('@/components/grammar/GrammarQuestionPanel.vue'))
const GrammarResultPanel = defineAsyncComponent(() => import('@/components/grammar/GrammarResultPanel.vue'))

const {
  grammarTopics,
  practiceModes,
  difficulties,
  selectedTopic,
  selectedMode,
  selectedDifficulty,
  isLoading,
  currentLogId,
  isStarted,
  isSubmitted,
  currentQuestionIndex,
  userAnswers,
  score,
  showResult,
  earnedXP,
  stats,
  showTutor,
  tutorSessionId,
  learningAdvice,
  relatedTopics,
  handleSessionCreated,
  tutorContext,
  historyPage,
  historyPageSize,
  historyTotal,
  paginatedHistory,
  selectedAnswer,
  hasAnswered,
  totalQuestions,
  currentQuestion,
  selectTopic,
  selectMode,
  selectDifficulty,
  startPractice,
  loadHistoryExercise,
  selectAnswerIdx,
  goToQuestion,
  submitPractice,
  nextQuestion,
  restart,
  openAITutor
} = useGrammarPractice()
</script>
<template>
  <div class="page-container">
    <div class="main-layout">
        
        <!-- LEFT PANEL: Main Content -->
        <div class="content-panel">
            
            <!-- Header -->
            <n-card class="header-card" :bordered="false">
                 <div class="header-content">
                     <div>
                        <h1>
                            {{ isStarted ? (showResult ? '练习报告' : '语法特训中') : '语法专项特训' }}
                        </h1>
                        <p class="subtitle">
                            {{ isStarted ? '保持专注，攻克难点' : '系统化梳理语法脉络' }}
                        </p>
                     </div>
                     <div v-if="isStarted && !showResult">
                         <n-button secondary @click="isStarted = false">
                            <template #icon><n-icon :component="ArrowLeft" /></template>
                            退出练习
                        </n-button>
                     </div>
                 </div>
            </n-card>

            <!-- SETUP VIEW: Topic Selection & History -->
            <template v-if="!isStarted">
                <!-- VIEW 1: Topic Selection Grid -->
                <div class="topics-grid-container">
                     <n-grid x-gap="20" y-gap="20" cols="1 800:2 1200:3" responsive="screen">
                        <n-grid-item v-for="topic in grammarTopics" :key="topic.id">
                            <div 
                                class="topic-card"
                                :class="{ active: selectedTopic === topic.id }"
                                @click="selectTopic(topic.id)"
                            >
                                <div class="card-top">
                                    <div class="icon-box" :style="{ backgroundColor: topic.bg, color: topic.color }">
                                        <n-icon :component="topic.icon" size="24" />
                                    </div>
                                    <div v-if="selectedTopic === topic.id" class="check-icon">
                                        <n-icon :component="CheckCircle2" color="#ec4899" />
                                    </div>
                                </div>
                                <h3>{{ topic.title }}</h3>
                                <p>{{ topic.desc }}</p>
                                <div class="card-footer">
                                     <n-tag size="small" round :bordered="false" type="default">
                                        {{ topic.count }} Questions
                                    </n-tag>
                                </div>
                            </div>
                        </n-grid-item>
                     </n-grid>
                </div>

                <!-- History Section -->
                <div v-if="historyTotal > 0" class="history-section mt-12">
                    <div class="section-title">
                        <n-icon :component="History" /> 最近生成练习
                    </div>
                    <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
                        <n-grid-item v-for="exercise in paginatedHistory" :key="exercise.id">
                            <div class="history-card" @click="loadHistoryExercise(exercise)">
                                <div class="history-card-header">
                                    <n-tag size="small" type="warning" :bordered="false">{{ exercise.topic || 'Grammar' }}</n-tag>
                                    <n-tag size="tiny" :bordered="false">{{ exercise.difficulty || 'medium' }}</n-tag>
                                </div>
                                <div class="history-card-body">
                                    <span class="question-count">{{ exercise.questions?.length || 0 }} 题</span>
                                </div>
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
            </template>


            <!-- PRACTICE VIEW: Active Question -->
            <GrammarQuestionPanel
              v-else-if="!showResult"
              :is-loading="isLoading"
              :current-question-index="currentQuestionIndex"
              :total-questions="totalQuestions"
              :current-question="currentQuestion"
              :grammar-topics="grammarTopics"
              :selected-topic="selectedTopic"
              :is-submitted="isSubmitted"
              :selected-answer="selectedAnswer"
              @select-answer="selectAnswerIdx"
              @go-to-question="goToQuestion"
              @next-question="nextQuestion"
              @open-ai-tutor="openAITutor"
            />

            <GrammarResultPanel
              v-else
              :score="score"
              :total-questions="totalQuestions"
              :current-log-id="currentLogId"
              :earned-x-p="earnedXP"
              :related-topics="relatedTopics"
              :learning-advice="learningAdvice"
              @restart="restart"
              @review="showResult = false"
              @open-ai-tutor="openAITutor"
            />
        </div>

        <!-- RIGHT PANEL: Sidebar -->
        <div class="sidebar-panel">
            <GrammarSidebarPanel
              :stats="stats"
              :is-started="isStarted"
              :show-result="showResult"
              :is-submitted="isSubmitted"
              :selected-topic="selectedTopic"
              :grammar-topics="grammarTopics"
              :total-questions="totalQuestions"
              :current-question-index="currentQuestionIndex"
              :user-answers="userAnswers"
              :practice-modes="practiceModes"
              :selected-mode="selectedMode"
              :difficulties="difficulties"
              :selected-difficulty="selectedDifficulty"
              :is-loading="isLoading"
              @select-mode="selectMode"
              @select-difficulty="selectDifficulty"
              @start-practice="startPractice"
              @submit-practice="submitPractice"
              @go-to-question="goToQuestion"
            />
        </div>
    </div>
    <!-- AI Tutor Component -->
    <AITutorEnhanced 
      :context="tutorContext"
      v-model:show="showTutor"
      :session-id="tutorSessionId"
      @session-created="handleSessionCreated"
    />
  </div>
</template>

<style scoped>
.page-container {
    height: calc(100vh - 100px);
    padding: 24px;
    box-sizing: border-box;
}
.main-layout {
    display: flex;
    gap: 24px;
    height: 100%;
}

.content-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow-y: auto;
}

.sidebar-panel {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    padding-bottom: 20px;
}

/* Header */
.header-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    margin-bottom: 24px;
    border-radius: 16px;
}
.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.header-content h1 {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(120deg, #c084fc, #db2777);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
}
.header-content .subtitle {
    font-size: 0.9rem;
    color: var(--secondary-text);
}

/* Topic Selection */
.topics-grid-container {
    padding-bottom: 20px;
}
.topic-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 20px;
    cursor: pointer;
    transition: var(--theme-transition);
    height: 100%;
    display: flex;
    flex-direction: column;
}
.topic-card:hover {
    background: var(--accent-fill);
    transform: translateY(-2px);
}
.topic-card.active {
    border-color: #db2777;
    background: rgba(219, 39, 119, 0.1);
    box-shadow: 0 0 0 1px #db2777;
}

.card-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
}
.icon-box {
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.topic-card h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-color);
}
.topic-card p {
    font-size: 0.9rem;
    color: var(--secondary-text);
    line-height: 1.4;
    flex-grow: 1;
}
.card-footer {
    margin-top: 16px;
}

/* Sidebar Widgets */
.sidebar-card {
    background: var(--card-bg);
    border-radius: 16px;
    border: 1px solid var(--card-border);
}
.widget-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}
.icon-wrap {
    padding: 8px;
    border-radius: 8px;
    background: var(--accent-fill);
}
.icon-wrap.purple { color: #d946ef; background: rgba(217, 70, 239, 0.1); }
.widget-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.widget-header p { font-size: 0.8rem; color: #a1a1aa; margin: 0; }

.labels { display: flex; justify-content: space-between; font-size: 0.8rem; color: #a1a1aa; margin-bottom: 4px; }
.mini-stats { display: flex; gap: 12px; margin-top: 16px; }
.mini-stat { flex: 1; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 8px; text-align: center; }
.mini-stat .num { font-size: 1.1rem; font-weight: 700; color: #fff; }
.mini-stat .num.success { color: #4ade80; }
.mini-stat .lbl { font-size: 0.7rem; color: #71717a; text-transform: uppercase; }

.config-panel h3, .current-task h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1rem;
    color: var(--text-color);
}
.sidebar-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.config-group { margin-bottom: 24px; }
.config-group label {
    display: block;
    font-size: 0.75rem;
    color: var(--secondary-text);
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
}
.mode-item {
    padding: 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--text-color);
    transition: var(--theme-transition);
    margin-bottom: 8px;
}
.mode-item:hover { background: var(--accent-fill); }
.mode-item.active { background: var(--accent-fill); border-color: rgba(99, 102, 241, 0.4); }
.radio-dot { width: 6px; height: 6px; border-radius: 50%; background: #db2777; margin-left: auto; }

.diff-tabs { display: flex; gap: 8px; }
.diff-tab { 
    flex: 1; 
    text-align: center; 
    padding: 8px; 
    border-radius: 6px; 
    font-size: 0.9rem; 
    cursor: pointer; 
    color: var(--secondary-text);
    border: 1px solid transparent;
    transition: var(--theme-transition);
}
.diff-tab:hover { background: var(--accent-fill); }
.diff-tab.active { background: var(--accent-fill); border-color: rgba(99, 102, 241, 0.4); color: var(--text-color); }

.start-btn { font-weight: 700; margin-top: 16px; }

/* Question Mode */
.question-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-box { background: var(--card-bg); border-radius: 20px; overflow: hidden; position: relative; border: 1px solid var(--card-border); transition: var(--theme-transition); }
.progress-bar-wrapper { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--card-border); }
.progress-fill { height: 100%; background: #db2777; transition: width 0.3s; }

.question-inner { padding: 40px; }
.meta-info { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.topic-badge { 
    background: rgba(219, 39, 119, 0.15); 
    color: #f472b6; 
    padding: 2px 8px; 
    border-radius: 4px; 
    font-size: 0.75rem; 
    font-weight: 700; 
}
.counter { font-size: 0.75rem; color: #71717a; text-transform: uppercase; letter-spacing: 1px; }

.question-text { font-size: 1.8rem; font-weight: 500; color: var(--text-color); margin-bottom: 40px; line-height: 1.4; font-family: serif; }
.options-list { display: grid; gap: 16px; }

/* Gamification Styles */
.stars-row {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 20px 0;
}
.star-filled {
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.xp-reward {
    text-align: center;
    margin: 20px 0;
}
.xp-badge {
    display: inline-block;
    background: linear-gradient(135deg, #fcd34d, #f59e0b);
    color: #78350f;
    padding: 4px 16px;
    border-radius: 20px;
    font-weight: 800;
    font-size: 1.2rem;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    animation: slideUp 0.6s ease-out;
}
.xp-label {
    font-size: 0.8rem;
    color: #a1a1aa;
    margin-top: 4px;
}
@keyframes slideUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
}
.option-item {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    padding: 16px 20px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: var(--theme-transition);
}
.option-item:hover:not(.disabled) { border-color: #db2777; background: rgba(219, 39, 119, 0.05); }
.option-item.selected { border-color: #db2777; background: rgba(219, 39, 119, 0.1); }
.option-item.correct { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.option-item.wrong { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); opacity: 0.8; }
.option-item.disabled { cursor: default; }

.option-index {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    margin-right: 16px;
    font-size: 0.8rem; color: #a1a1aa;
}
.option-item.selected .option-index { border-color: #db2777; color: #db2777; }
.option-item.correct .option-index { border-color: #22c55e; color: #22c55e; }
.option-item.wrong .option-index { border-color: #ef4444; color: #ef4444; }
.option-content { font-size: 1.1rem; color: var(--text-color); }
.option-item.correct .option-content { color: #4ade80; font-weight: 500; }

.explanation-card { margin-top: 16px; background: var(--accent-fill); }
.explanation-content { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px;}
.exp-icon { padding: 8px; background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-radius: 8px; }
.exp-text { flex: 1; }
.exp-text h4 { font-size: 0.85rem; color: var(--secondary-text); text-transform: uppercase; margin-bottom: 4px; }
.exp-text p { font-size: 1rem; color: var(--text-color); line-height: 1.5; }

/* Result */
.result-container { height: 100%; display: flex; align-items: center; justify-content: center; }
.result-card { width: 100%; max-width: 600px; text-align: center; background: var(--card-bg); padding: 40px; border-radius: 20px; border: 1px solid var(--card-border); }
.result-title { font-size: 2rem; font-weight: 800; margin-bottom: 8px; }
.result-subtitle { color: #a1a1aa; margin-bottom: 40px; }
.stats-grid { margin-bottom: 40px; }
.stat-box { background: var(--accent-fill); border-radius: 12px; padding: 20px; }
.stat-value { font-size: 2.5rem; font-weight: 800; color: var(--text-color); line-height: 1; margin-bottom: 8px; }
.stat-value.correct-rate { color: #4ade80; }
.stat-label { font-size: 0.8rem; color: #71717a; text-transform: uppercase; }
.dim { font-size: 1.2rem; color: var(--secondary-text); }

/* Task Sidebar Elements */
.info-box { background: var(--accent-fill); padding: 12px; border-radius: 8px; border: 1px solid var(--card-border); margin-bottom: 16px; }
.info-box .lbl { display: block; font-size: 0.75rem; color: var(--secondary-text); margin-bottom: 4px; }
.info-box .val { font-size: 1rem; color: var(--text-color); font-weight: 700; }

.nav-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 8px; }
.nav-item { 
    aspect-ratio: 1; 
    border-radius: 6px; 
    background: var(--card-bg); 
    border: 1px solid var(--card-border);
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 0.8rem; 
    color: var(--secondary-text); 
    cursor: pointer;
    transition: var(--theme-transition);
}
.nav-item:hover { background: var(--accent-fill); color: var(--text-color); }
.nav-item.active { border: 2px solid #db2777; color: var(--text-color); z-index: 1; }
.nav-item.answered { background: var(--accent-fill); color: var(--text-color); }
.nav-item.is-correct { background: rgba(34, 197, 94, 0.4) !important; color: #fff; border: none; }
.nav-item.is-wrong { background: rgba(239, 68, 68, 0.4) !important; color: #fff; border: none; }

/* History Section */
.history-section { margin-top: 48px; }
.section-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #e4e4e7; }
.history-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; cursor: pointer; transition: var(--theme-transition); }
.history-card:hover { background: var(--accent-fill); transform: translateY(-2px); border-color: #db2777; }
.history-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.history-card-body { color: var(--secondary-text); font-size: 0.9rem; }
.question-count { font-weight: 600; color: var(--text-color); }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }

/* GrammarView 专门的移动端优化 */
@media (max-width: 768px) {
  /* 页面容器 */
  .page-container {
    height: auto !important;
    padding: 12px !important;
  }
  
  /* 主布局改为垂直 */
  .main-layout {
    flex-direction: column !important;
    height: auto !important;
  }
  
  /* 侧边栏全宽并移到内容之后 - 话题选择优先 */
  .sidebar-panel {
    width: 100% !important;
    order: 1; /* 移到下方 */
    margin-top: 16px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column !important;
    gap: 16px !important;
  }
  
  /* 隐藏学习状态卡片，节省空间 */
  .user-stats {
    display: none !important;
  }
  
  /* 配置面板更紧凑 */
  .config-panel {
    padding: 12px !important;
  }
  
  .config-group {
    margin-bottom: 12px !important;
  }
  
  /* 当前任务卡片优化 */
  .current-task {
    padding: 12px !important;
  }
  
  .nav-grid {
    grid-template-columns: repeat(6, 1fr) !important;
    gap: 6px !important;
  }
  
  .nav-item {
    font-size: 0.75rem !important;
    padding: 4px !important;
  }
  
  /* 内容面板 */
  .content-panel {
    width: 100% !important;
    overflow-y: visible !important;
  }
  
  /* 头部卡片 */
  .header-card {
    margin-bottom: 12px !important;
  }
  
  .header-card :deep(.n-card__content) {
      padding: 12px 16px !important;
  }
  
  .header-content h1 {
    font-size: 1.25rem !important;
  }
  
  /* 题目网格在不同移动尺寸下的表现 */
  .topics-grid-container .n-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
    gap: 12px !important;
  }
  
  .topic-card {
      padding: 12px !important;
      border-radius: 12px !important;
  }
  
  .topic-card h3 {
      font-size: 0.95rem !important;
      margin-bottom: 4px !important;
  }
  
  .topic-card p {
      font-size: 0.75rem !important;
      line-height: 1.2 !important;
  }
  
  .card-top {
      margin-bottom: 8px !important;
  }
  
  .icon-box {
      padding: 6px !important;
  }
  
  .icon-box .n-icon {
      size: 20px !important;
  }
  
  /* 问题卡片 */
  .question-box {
    margin-bottom: 12px;
  }
  
  .question-inner {
    padding: 16px !important;
  }
  
  .question-text {
    font-size: 1.2rem !important;
  }
  
  /* 选项 */
  .option-item {
    padding: 12px !important;
  }
  
  .option-content {
    font-size: 0.95rem !important;
  }
  
  /* 解释卡片 */
  .explanation-card {
    margin-top: 12px !important;
  }
  
  /* 结果卡片 */
  .result-card {
    padding: 20px !important;
  }
  
  .result-title {
    font-size: 1.5rem !important;
  }
  
  .stat-value {
    font-size: 2rem !important;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.1rem !important;
  }

  .question-text {
    font-size: 1.1rem !important;
  }

  /* 题目导航改为5列 */
  .nav-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }

  .option-content {
    font-size: 0.9rem !important;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 主题卡片内容优化 */
  .topic-card,
  .mode-card {
    min-height: 100px !important;
    padding: 16px !important;
  }

  .card-top {
    margin-bottom: 12px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1.05rem !important;
    margin-bottom: 8px !important;
    line-height: 1.3 !important;
    /* 允许换行但限制2行 */
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.85rem !important;
    line-height: 1.4 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    margin-bottom: 0 !important;
    color: var(--secondary-text) !important;
  }

  .topic-count,
  .mode-desc {
    font-size: 0.8rem !important;
  }

  /* 历史记录卡片 */
  .history-card {
    padding: 14px !important;
  }

  .history-title {
    font-size: 0.95rem !important;
    line-height: 1.4 !important;
    margin-bottom: 8px !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .history-footer {
    font-size: 0.8rem !important;
  }

  /* 按钮全宽 */
  .action-btn {
    width: 100% !important;
    padding: 14px 20px !important;
    font-size: 1rem !important;
    margin-bottom: 10px !important;
  }

  /* 题目选项 */
  .answer-option {
    padding: 14px 12px !important;
  }

  .option-index {
    width: 32px !important;
    height: 32px !important;
    font-size: 0.9rem !important;
  }

  .option-content {
    font-size: 0.95rem !important;
    line-height: 1.5 !important;
  }

  /* 导航按钮 */
  .nav-item {
    min-width: 38px !important;
    height: 38px !important;
    font-size: 0.85rem !important;
  }
}

/* 超小屏幕 (360px 及以下) - 小屏手机 */
@media (max-width: 360px) {
  .page-container {
    padding: 8px !important;
  }

  .header-card {
    padding: 12px !important;
  }

  .header-content h1 {
    font-size: 1rem !important;
  }

  .header-content .subtitle {
    font-size: 0.75rem !important;
  }

  .topic-card,
  .mode-card {
    padding: 10px !important;
    min-height: 95px !important;
  }

  .icon-box :deep(svg) {
    width: 18px !important;
    height: 18px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 0.95rem !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.75rem !important;
  }

  .action-btn {
    padding: 12px 16px !important;
    font-size: 0.9rem !important;
  }

  .nav-item {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 0.8rem !important;
  }
}

/* 安卓小屏手机 (320px - 360px) */
@media (max-width: 360px) {
  /* 安卓系统状态栏占用更多空间 */
  .page-container {
    padding-top: 8px !important;
  }

  /* 安卓字体渲染优化 */
  .topic-card h3,
  .mode-card h3 {
    -webkit-text-stroke: 0.01px transparent !important;
    text-rendering: optimizeLegibility !important;
  }

  /* 触摸反馈优化 */
  .topic-card:active,
  .mode-card:active,
  .answer-option:active {
    transform: scale(0.98) !important;
    transition: transform 0.1s !important;
  }
}

/* 安卓标准屏 (361px - 412px) - Samsung, Xiaomi, OPPO 等 */
@media (min-width: 361px) and (max-width: 412px) {
  .topic-card,
  .mode-card {
    padding: 12px !important;
    min-height: 105px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1.02rem !important;
    line-height: 1.35 !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.82rem !important;
    line-height: 1.45 !important;
  }

  /* 安卓返回按钮区域预留 */
  .page-container {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  /* 安卓导航栏适配 */
  .action-btn {
    margin-bottom: 12px !important;
    /* 为安卓底部导航栏留出空间 */
  }

  .nav-item {
    min-width: 35px !important;
    height: 35px !important;
    font-size: 0.88rem !important;
  }
}

/* 安卓大屏 (413px - 480px) - OnePlus, Samsung S系列 */
@media (min-width: 413px) and (max-width: 480px) {
  .topic-card,
  .mode-card {
    padding: 14px !important;
    min-height: 112px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1.08rem !important;
    line-height: 1.4 !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.85rem !important;
    line-height: 1.5 !important;
  }

  /* 大屏卡片间距 */
  .topics-grid-container :deep(.n-grid),
  .modes-grid-container :deep(.n-grid) {
    gap: 12px !important;
  }

  .action-btn {
    padding: 15px 20px !important;
    font-size: 1.02rem !important;
  }
}

/* 安卓超大屏 + 折叠屏 (481px - 768px) */
@media (min-width: 481px) and (max-width: 768px) {
  .topic-card,
  .mode-card {
    padding: 16px !important;
    min-height: 120px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1.12rem !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.9rem !important;
  }

  /* 折叠屏横屏优化 */
  @media (orientation: landscape) {
    .topic-card,
    .mode-card {
      min-height: 90px !important;
    }
  }
}

/* 小屏手机 (375px - iPhone SE) */
@media (min-width: 361px) and (max-width: 375px) {
  .topic-card,
  .mode-card {
    padding: 11px !important;
    min-height: 100px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 0.98rem !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.78rem !important;
  }
}

/* 标准手机 (390px - iPhone 12/13/14) */
@media (min-width: 376px) and (max-width: 390px) {
  .topic-card,
  .mode-card {
    padding: 12px !important;
    min-height: 105px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1rem !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.8rem !important;
  }
}

/* 大屏手机 (391px - 414px, iPhone Pro Max) */
@media (min-width: 391px) and (max-width: 414px) {
  .topic-card,
  .mode-card {
    padding: 13px !important;
    min-height: 108px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1.02rem !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.82rem !important;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 10px !important;
  }

  .header-card {
    padding: 14px !important;
    margin-bottom: 12px !important;
  }

  .header-content h1 {
    font-size: 1.15rem !important;
  }

  .header-content .subtitle {
    font-size: 0.8rem !important;
  }

  /* 卡片优化 */
  .topic-card,
  .mode-card {
    padding: 12px !important;
    min-height: 110px !important;
  }

  .icon-box {
    padding: 8px !important;
  }

  .icon-box :deep(svg) {
    width: 20px !important;
    height: 20px !important;
  }

  .topic-card h3,
  .mode-card h3 {
    font-size: 1rem !important;
    line-height: 1.3 !important;
    margin-bottom: 6px !important;
  }

  .topic-card p,
  .mode-card p {
    font-size: 0.8rem !important;
    line-height: 1.4 !important;
  }

  /* 题目 */
  .question-text {
    font-size: 1.1rem !important;
    line-height: 1.5 !important;
  }

  .answer-option {
    padding: 12px 10px !important;
  }

  .option-index {
    width: 30px !important;
    height: 30px !important;
    font-size: 0.9rem !important;
  }

  .option-content {
    font-size: 0.9rem !important;
    line-height: 1.4 !important;
  }

  /* 历史记录 */
  .history-card {
    padding: 12px !important;
  }

  .history-title {
    font-size: 0.9rem !important;
    line-height: 1.4 !important;
  }

  .history-footer {
    font-size: 0.75rem !important;
  }

  /* 按钮 */
  .action-btn {
    padding: 13px 18px !important;
    font-size: 0.95rem !important;
  }

  /* 导航 */
  .nav-item {
    min-width: 36px !important;
    height: 36px !important;
    font-size: 0.85rem !important;
  }

  /* 统计 */
  .stat-value {
    font-size: 1.4rem !important;
  }

  .stat-label {
    font-size: 0.8rem !important;
  }
}
</style>

<style src="../assets/learning-mobile.css" scoped></style>



