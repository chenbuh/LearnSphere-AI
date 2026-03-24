<template>
  <div class="reading-container">
    <div class="back-button-container">
      <n-button secondary @click="emit('restart')">
        <template #icon>
          <n-icon :component="RotateCcw" />
        </template>
        返回设置
      </n-button>
    </div>

    <div class="reading-layout-container">
      <div class="main-content-area">
        <section class="workspace-card">
          <div class="workspace-heading">
            <div class="workspace-copy">
              <p class="workspace-kicker">阅读作答</p>
              <h2 class="workspace-title">请根据原文完成题目并提交答案</h2>
              <p class="workspace-caption">先通读文章，再根据题目要求完成作答并提交答案。</p>
            </div>

            <div class="workspace-meta">
              <span class="workspace-chip">{{ settings.category.toUpperCase() }}</span>
              <span class="workspace-chip">{{ article.source }}</span>
            </div>
          </div>

          <div class="article-header">
            <h2>{{ article.title }}</h2>
            <p class="meta">
              <span>{{ article.source }}</span>
              <span class="separator">•</span>
              <span><n-icon :component="Clock" size="14" /> {{ realWordCount }} 词</span>
            </p>
          </div>

          <div class="article-content secure-content" @click="isTyping ? emit('skip-typing') : null">
            <p v-for="(para, idx) in displayedText.split('\n')" :key="idx">
              {{ para }}
            </p>
            <div v-if="isTyping" class="typing-cursor"></div>
          </div>

          <div class="question-content">
            <div class="question-head">
              <span class="question-index">Q{{ currentQuestionIndex + 1 }}</span>
              <h3 class="q-text">{{ currentQuestion?.text }}</h3>
            </div>

            <div class="options-container">
              <button
                v-for="(option, idx) in currentQuestion?.options || []"
                :key="idx"
                type="button"
                class="answer-option"
                :class="{ selected: answers[currentQuestionIndex] === idx }"
                @click="emit('select-answer', idx)"
              >
                <span class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                <span class="option-text">{{ option }}</span>
              </button>
            </div>
          </div>

          <div class="actions-footer">
            <n-button v-if="currentQuestionIndex > 0" secondary @click="emit('prev-question')">上一题</n-button>
            <n-button v-if="currentQuestionIndex < article.questions.length - 1" type="primary" @click="emit('next-question')">下一题</n-button>
            <n-button v-else type="success" @click="emit('submit')">提交答案</n-button>
          </div>
        </section>
      </div>

      <aside class="sidebar">
        <div class="sticky-nav">
          <section class="nav-panel">
            <div class="nav-head">
              <p class="nav-kicker">阅读导航</p>
              <h3 class="nav-title">进度和题号会同步显示，方便你专注完成阅读作答</h3>
            </div>

            <div class="meta-stack">
              <div class="meta-row">
                <span>完成进度</span>
                <strong>{{ Math.round(progressPercent) }}%</strong>
              </div>
              <div class="meta-row">
                <span>当前题号</span>
                <strong>{{ currentQuestionIndex + 1 }} / {{ article.questions.length }}</strong>
              </div>
              <div class="meta-row">
                <span>已答题数</span>
                <strong>{{ answeredCount }}</strong>
              </div>
            </div>

            <div class="progress-card">
              <div class="progress-label">
                <span>阅读进度</span>
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

            <div class="question-grid">
              <button
                v-for="(q, index) in article.questions"
                :key="index"
                type="button"
                class="nav-btn"
                :class="{
                  current: currentQuestionIndex === index,
                  answered: answers[index] != null && currentQuestionIndex !== index
                }"
                @click="emit('update:current-question-index', index)"
              >
                {{ index + 1 }}
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NProgress } from 'naive-ui'
import { Clock, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  displayedText: {
    type: String,
    default: ''
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  answers: {
    type: Object,
    default: () => ({})
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  realWordCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['restart', 'update:current-question-index', 'skip-typing', 'select-answer', 'prev-question', 'next-question', 'submit'])

const currentQuestion = computed(() => props.article?.questions?.[props.currentQuestionIndex] ?? null)
const answeredCount = computed(() => Object.values(props.answers || {}).filter(value => value !== null && value !== undefined).length)
</script>

<style scoped>
.reading-layout-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 276px;
  gap: 28px;
  align-items: flex-start;
}

.sidebar {
  min-width: 0;
}

.sticky-nav {
  position: sticky;
  top: 92px;
}

.main-content-area {
  min-width: 0;
}

.back-button-container {
  margin-bottom: 18px;
}

.workspace-card {
  display: grid;
  gap: 22px;
  padding: 24px 26px 26px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.2)),
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.06), transparent 42%);
}

.workspace-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.workspace-copy {
  display: grid;
  gap: 8px;
}

.workspace-kicker,
.nav-kicker {
  margin: 0 0 8px;
  color: #34d399;
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
}

.workspace-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
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

.article-header h2 {
  font-size: 1.86rem;
  margin: 0 0 12px;
  color: var(--text-color);
  line-height: 1.35;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.separator {
  opacity: 0.5;
}

.article-content {
  max-height: 44vh;
  overflow-y: auto;
  padding-right: 10px;
}

.article-content p {
  font-size: 1.02rem;
  line-height: 1.9;
  color: var(--text-color);
  margin-bottom: 1.4em;
}

.question-content {
  display: grid;
  gap: 18px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.question-head {
  display: grid;
  gap: 12px;
}

.question-index {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.14);
  color: #6ee7b7;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.q-text {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--text-color);
  margin: 0;
}

.options-container {
  display: grid;
  gap: 14px;
}

.answer-option {
  width: 100%;
  background: rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  padding: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.answer-option:hover {
  background: rgba(15, 23, 42, 0.28);
  border-color: rgba(52, 211, 153, 0.2);
  transform: translateY(-1px);
}

.answer-option.selected {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(52, 211, 153, 0.45);
}

.option-index {
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-weight: 700;
  color: var(--secondary-text);
  flex-shrink: 0;
}

.answer-option.selected .option-index {
  background: #10b981;
  color: white;
}

.option-text {
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.55;
}

.actions-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.nav-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
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
}

.meta-row strong {
  color: var(--text-color);
  font-size: 0.94rem;
}

.progress-card {
  padding: 16px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.nav-btn {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.24);
  color: var(--secondary-text);
  min-height: 44px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.nav-btn.current {
  background: #10b981;
  color: white;
  border-color: transparent;
}

.nav-btn.answered:not(.current) {
  border-color: rgba(52, 211, 153, 0.24);
  color: #6ee7b7;
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

.article-content::-webkit-scrollbar { width: 6px; }
.article-content::-webkit-scrollbar-track { background: transparent; }
.article-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
.article-content::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

:global(html[data-theme='light'] .workspace-card) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent 42%);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .workspace-heading),
:global(html[data-theme='light'] .question-content),
:global(html[data-theme='light'] .actions-footer),
:global(html[data-theme='light'] .nav-head),
:global(html[data-theme='light'] .progress-card) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .workspace-chip) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .question-index) {
  background: rgba(220, 252, 231, 0.9);
  color: #047857;
}

:global(html[data-theme='light'] .answer-option) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.03);
}

:global(html[data-theme='light'] .answer-option:hover) {
  background: rgba(248, 250, 252, 0.96);
  border-color: rgba(16, 185, 129, 0.28);
}

:global(html[data-theme='light'] .answer-option.selected) {
  background: rgba(220, 252, 231, 0.92);
  border-color: rgba(16, 185, 129, 0.36);
}

:global(html[data-theme='light'] .option-index) {
  background: rgba(226, 232, 240, 0.86);
  color: #475569;
}

:global(html[data-theme='light'] .nav-panel) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95)),
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.07), transparent 44%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .nav-btn) {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.88);
  color: #64748b;
}

:global(html[data-theme='light'] .nav-btn.answered:not(.current)) {
  border-color: rgba(16, 185, 129, 0.26);
  background: rgba(236, 253, 245, 0.96);
  color: #047857;
}

:global(html[data-theme='light'] .progress-card .n-progress-graph-line-rail) {
  background: rgba(226, 232, 240, 0.95) !important;
}

:global(html[data-theme='light'] .article-content::-webkit-scrollbar-thumb) {
  background: rgba(148, 163, 184, 0.34);
}

:global(html[data-theme='light'] .article-content::-webkit-scrollbar-thumb:hover) {
  background: rgba(100, 116, 139, 0.46);
}

@media (max-width: 900px) {
  .reading-layout-container {
    grid-template-columns: 1fr;
    gap: 16px;
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

  .workspace-caption {
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .workspace-meta {
    justify-content: flex-start;
  }

  .article-header h2 {
    font-size: 1.3rem;
  }

  .article-content {
    max-height: none;
  }

  .article-content p,
  .option-text {
    font-size: 0.95rem;
  }

  .question-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .actions-footer {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .actions-footer :deep(.n-button) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .workspace-card,
  .nav-panel {
    padding: 14px 12px;
    border-radius: 18px;
  }

  .workspace-heading {
    padding-bottom: 12px;
  }

  .article-header h2 {
    font-size: 1.15rem;
    line-height: 1.4;
  }

  .meta {
    flex-wrap: wrap;
    gap: 6px 10px;
  }

  .separator {
    display: none;
  }

  .question-content {
    gap: 14px;
    padding-top: 16px;
  }

  .q-text {
    font-size: 1rem;
    line-height: 1.5;
  }

  .answer-option {
    padding: 12px;
    gap: 10px;
    border-radius: 14px;
    align-items: flex-start;
  }

  .option-index {
    width: 30px;
    height: 30px;
    min-width: 30px;
    border-radius: 9px;
    font-size: 0.82rem;
  }

  .option-text {
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .question-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .nav-btn {
    min-height: 40px;
    border-radius: 10px;
    font-size: 0.84rem;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

