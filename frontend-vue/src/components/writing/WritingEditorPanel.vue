<template>
  <div class="writing-container" :class="{ 'focus-mode': isFocusMode }">
    <WritingEditorToolbar
      :is-focus-mode="isFocusMode"
      :show-draft-saved="showDraftSaved"
      @restart="emit('restart')"
      @toggle-focus="emit('toggle-focus')"
    />

    <div class="writing-layout-container">
      <div class="main-content-area">
        <section class="workspace-card">
          <div class="workspace-heading">
            <div class="workspace-copy">
              <p class="workspace-kicker">写作练习</p>
              <h2 class="workspace-title">根据题目要求完成写作并逐步完善正文</h2>
              <p class="workspace-caption">先完成审题，再结合要点提示起草正文并持续修改完善。</p>
            </div>

            <div class="workspace-meta">
              <span class="workspace-chip">{{ selectedExamLabel }}</span>
              <span class="workspace-chip">{{ selectedModeLabel || '未选择' }}</span>
              <span class="workspace-chip">{{ selectedDifficultyLabel || '标准' }}</span>
            </div>
          </div>

          <WritingTopicCard
            v-if="selectedTopic"
            :settings="settings"
            :selected-topic="selectedTopic"
            :displayed-prompt="displayedPrompt"
            :is-prompt-typing="isPromptTyping"
            @prompt-skip="emit('prompt-skip')"
          />

          <WritingEditorCard
            class="editor-shell"
            :settings="settings"
            :essay-content="essayContent"
            :word-count="wordCount"
            :time-left="timeLeft"
            :time-left-display="timeLeftDisplay"
            @update:essay-content="emit('update:essay-content', $event)"
          />
        </section>
      </div>

      <aside v-if="!isFocusMode" class="sidebar">
        <div class="sticky-nav">
          <section class="nav-panel">
            <div class="nav-head">
              <p class="nav-kicker">练习摘要</p>
              <h3 class="nav-title">进度检查</h3>
              <p class="nav-caption">确认进度后即可提交本次写作。</p>
            </div>

            <div class="meta-stack">
              <div class="meta-row">
                <span>写作题型</span>
                <strong>{{ selectedModeLabel || '未选择' }}</strong>
              </div>
              <div class="meta-row">
                <span>写作难度</span>
                <strong>{{ selectedDifficultyLabel || '标准' }}</strong>
              </div>
              <div class="meta-row">
                <span>建议字数</span>
                <strong>{{ minWordsTarget }}+</strong>
              </div>
              <div class="meta-row">
                <span>要点数量</span>
                <strong>{{ tipsCount }} 条</strong>
              </div>
              <div class="meta-row" v-if="settings.timeLimit > 0">
                <span>剩余时间</span>
                <strong :class="{ danger: timeLeft < 60 }">{{ timeLeftDisplay }}</strong>
              </div>
            </div>

            <div class="progress-card">
              <div class="progress-label">
                <span>完成进度</span>
                <span>{{ Math.round(progressPercent) }}%</span>
              </div>
              <n-progress
                type="line"
                :percentage="progressPercent"
                :show-indicator="false"
                color="#f97316"
                rail-color="#3f3f46"
                :height="6"
              />
            </div>

            <div class="metric-stack">
              <div class="metric-row">
                <span>当前字数</span>
                <strong>{{ wordCount }}</strong>
              </div>
              <div class="metric-row">
                <span>目标状态</span>
                <strong :class="{ 'metric-emphasis': remainingWords === 0 }">
                  {{ remainingWords > 0 ? `还差 ${remainingWords} 词` : '已达到建议字数' }}
                </strong>
              </div>
            </div>

            <n-button
              type="primary"
              size="large"
              block
              class="submit-btn"
              :loading="isLoading"
              :disabled="wordCount < 10"
              @click="emit('submit')"
            >
              提交 AI 深度分析
            </n-button>

            <p class="nav-note">提交后会从词汇、语法与逻辑三个维度生成写作反馈。</p>
          </section>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NProgress } from 'naive-ui'
import WritingEditorCard from '@/components/writing/WritingEditorCard.vue'
import WritingEditorToolbar from '@/components/writing/WritingEditorToolbar.vue'
import WritingTopicCard from '@/components/writing/WritingTopicCard.vue'
import { getExamTypeLabel } from '@/constants/examTypes'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  selectedModeLabel: {
    type: String,
    default: ''
  },
  selectedDifficultyLabel: {
    type: String,
    default: '标准'
  },
  selectedTopic: {
    type: Object,
    default: null
  },
  displayedPrompt: {
    type: String,
    default: ''
  },
  isPromptTyping: {
    type: Boolean,
    default: false
  },
  isFocusMode: {
    type: Boolean,
    default: false
  },
  showDraftSaved: {
    type: Boolean,
    default: false
  },
  essayContent: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  timeLeft: {
    type: Number,
    default: 0
  },
  timeLeftDisplay: {
    type: String,
    default: '00:00'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['restart', 'toggle-focus', 'prompt-skip', 'update:essay-content', 'submit'])

const minWordsTarget = computed(() => Number(props.selectedTopic?.minWords || 150))
const selectedExamLabel = computed(() => (
  getExamTypeLabel(props.settings.examType, '未选择')
))
const tipsCount = computed(() => props.selectedTopic?.tips?.length || 0)
const progressPercent = computed(() => {
  if (!minWordsTarget.value) {
    return 0
  }
  return Math.min((props.wordCount / minWordsTarget.value) * 100, 100)
})
const remainingWords = computed(() => Math.max(minWordsTarget.value - props.wordCount, 0))
</script>

<style scoped>
.writing-layout-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 276px;
  grid-template-areas: 'main sidebar';
  gap: 28px;
  align-items: flex-start;
}

.writing-layout-container,
.workspace-heading,
.workspace-copy,
.workspace-meta,
.nav-head,
.meta-stack,
.progress-card {
  min-width: 0;
}

.sidebar {
  grid-area: sidebar;
  min-width: 0;
}

.sticky-nav {
  position: sticky;
  top: 92px;
}

.nav-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.main-content-area {
  grid-area: main;
  min-width: 0;
}

.workspace-card {
  display: grid;
  gap: 22px;
  padding: 24px 26px 26px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.2)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.06), transparent 42%);
}

.workspace-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.workspace-copy {
  display: grid;
  gap: 8px;
  flex: 1 1 240px;
}

.workspace-kicker,
.nav-kicker {
  margin: 0 0 8px;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
  line-height: 1.38;
  overflow-wrap: anywhere;
}

.workspace-caption,
.nav-caption,
.nav-note {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.workspace-chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.26);
  color: var(--text-color);
  font-size: 0.8rem;
  font-weight: 700;
}

.nav-head {
  display: grid;
  gap: 4px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.nav-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.02rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.meta-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--secondary-text);
  font-size: 0.92rem;
  overflow-wrap: anywhere;
}

.meta-row strong {
  color: var(--text-color);
  font-size: 0.94rem;
  overflow-wrap: anywhere;
}

.meta-row .danger {
  color: #ef4444;
}

.progress-card {
  padding: 16px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.progress-label span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.metric-stack {
  display: grid;
  gap: 10px;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  color: var(--secondary-text);
  font-size: 0.88rem;
  overflow-wrap: anywhere;
}

.metric-row strong {
  color: var(--text-color);
  font-size: 0.92rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.metric-row .metric-emphasis {
  color: #fb923c;
}

.submit-btn {
  height: 48px;
  font-weight: 700;
  border-radius: 16px;
  background: linear-gradient(135deg, #fb923c, #f97316) !important;
  box-shadow: none;
}

.nav-note {
  padding-top: 4px;
}

.writing-container.focus-mode .editor-shell {
  max-width: none;
}

.writing-container.focus-mode .workspace-card {
  max-width: 1100px;
  margin: 0 auto;
}

:global(html[data-theme='light'] .workspace-card) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .workspace-heading),
:global(html[data-theme='light'] .nav-head),
:global(html[data-theme='light'] .progress-card),
:global(html[data-theme='light'] .metric-row) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .workspace-chip) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .nav-panel) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 44%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .metric-row .metric-emphasis) {
  color: #ea580c;
}

:global(html[data-theme='light'] .progress-card .n-progress-graph-line-rail) {
  background: rgba(226, 232, 240, 0.95) !important;
}

@media (max-width: 768px) {
  .writing-layout-container {
    grid-template-columns: 1fr;
    grid-template-areas:
      'main'
      'sidebar';
  }

  .sidebar {
    width: 100%;
  }

  .sticky-nav {
    position: static;
  }

  .workspace-card {
    padding: 16px 14px;
    border-radius: 22px;
  }

  .workspace-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .workspace-title {
    font-size: 1.02rem;
  }

  .workspace-caption,
  .nav-caption,
  .nav-note {
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .workspace-meta {
    justify-content: flex-start;
  }

  .nav-panel {
    padding: 14px;
    border-radius: 18px;
  }
}

@media (max-width: 480px) {
  .writing-layout-container {
    gap: 14px;
  }

  .workspace-card {
    gap: 16px;
    padding: 14px 12px;
    border-radius: 18px;
  }

  .workspace-heading {
    gap: 8px;
    padding-bottom: 12px;
  }

  .workspace-title {
    font-size: 0.94rem;
  }

  .workspace-caption,
  .nav-caption,
  .nav-note,
  .meta-row,
  .metric-row {
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .workspace-meta {
    gap: 6px;
    width: 100%;
  }

  .workspace-chip {
    width: 100%;
    justify-content: flex-start;
  }

  .nav-panel {
    gap: 12px;
    padding: 12px;
    border-radius: 16px;
  }

  .meta-row,
  .metric-row,
  .progress-label {
    flex-direction: column;
    align-items: flex-start;
  }

  .submit-btn {
    height: 44px;
    width: 100%;
  }
}

@media (max-width: 360px) {
  .workspace-card {
    padding: 12px 10px;
  }

  .nav-panel {
    padding: 10px;
  }

  .workspace-chip {
    font-size: 0.74rem;
  }

  .meta-row strong,
  .metric-row strong {
    font-size: 0.86rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .writing-layout-container {
    gap: 12px;
  }

  .workspace-card {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .nav-panel {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

