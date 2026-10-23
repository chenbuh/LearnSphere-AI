<template>
  <div class="reading-container">
    <div class="back-button-container">
      <n-button secondary class="top-back-btn" @click="emit('restart')">
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
              <div class="kicker-wrap">
                <span class="kicker-dot"></span>
                <p class="workspace-kicker">阅读作答 · 正在进行</p>
              </div>
              <h2 class="workspace-title">请通读原文，沉浸解析题目并提交答案</h2>
            </div>

            <div class="workspace-meta">
              <span class="workspace-chip category-chip">{{ settings.category?.toUpperCase() }}</span>
              <span class="workspace-chip source-chip">{{ article.source }}</span>
            </div>
          </div>

          <div class="reading-cabin">
            <div class="article-header">
              <h2>{{ article.title }}</h2>
              <div class="meta-row">
                <span class="source-badge">{{ article.source }}</span>
                <span class="separator">•</span>
                <span class="length-badge"><n-icon :component="Clock" size="14" /> {{ realWordCount }} 词</span>
                <span class="separator">•</span>
                <span class="mode-badge">精读模式</span>
              </div>
            </div>

            <div class="article-content secure-content" @click="isTyping ? emit('skip-typing') : null">
              <p v-for="(para, idx) in displayedText.split('\n')" :key="idx" class="reading-paragraph">
                {{ para }}
              </p>
              <div v-if="isTyping" class="typing-cursor"></div>
            </div>
          </div>

          <div class="question-content">
            <div class="question-head">
              <div class="q-kicker-badge">
                <span class="badge-dot"></span>
                <span class="question-index">Question {{ currentQuestionIndex + 1 }} / {{ article.questions?.length }}</span>
              </div>
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
                <div class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</div>
                <div class="option-text">{{ option }}</div>
                <div v-if="answers[currentQuestionIndex] === idx" class="check-badge">
                  <n-icon :component="CheckCircle2" size="18" />
                </div>
              </button>
            </div>
          </div>

          <div class="actions-footer">
            <n-button v-if="currentQuestionIndex > 0" secondary class="nav-act-btn" @click="emit('prev-question')">上一题</n-button>
            <n-button v-if="currentQuestionIndex < article.questions.length - 1" type="primary" class="nav-act-btn next-btn" @click="emit('next-question')">下一题</n-button>
            <n-button v-else type="success" class="nav-act-btn submit-btn" @click="emit('submit')">提交答案</n-button>
          </div>
        </section>
      </div>

      <aside class="sidebar">
        <div class="sticky-nav">
          <section class="nav-panel">
            <div class="nav-head">
              <div class="kicker-wrap">
                <span class="kicker-dot"></span>
                <p class="nav-kicker">阅读导航</p>
              </div>
              <h3 class="nav-title">作答进度控制台</h3>
            </div>

            <div class="meta-stack">
              <div class="meta-item-card">
                <span class="meta-label">完成进度</span>
                <strong class="meta-val highlight">{{ Math.round(progressPercent) }}%</strong>
              </div>
              <div class="meta-item-card">
                <span class="meta-label">当前题号</span>
                <strong class="meta-val">{{ currentQuestionIndex + 1 }} / {{ article.questions.length }}</strong>
              </div>
              <div class="meta-item-card">
                <span class="meta-label">已答题数</span>
                <strong class="meta-val">{{ answeredCount }} 题</strong>
              </div>
            </div>

            <div class="progress-card">
              <div class="progress-label">
                <span>答题进度</span>
                <span class="rate-num">{{ Math.round(progressPercent) }}%</span>
              </div>
              <n-progress
                type="line"
                :percentage="progressPercent"
                :show-indicator="false"
                color="#10b981"
                rail-color="rgba(255, 255, 255, 0.08)"
                :height="6"
                border-radius="9999px"
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
import { CheckCircle2, Clock, RotateCcw } from 'lucide-vue-next'

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
  grid-template-columns: minmax(0, 1fr) 280px;
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
  margin-bottom: 20px;
}

.top-back-btn {
  border-radius: var(--radius-md);
  font-weight: 600;
}

.workspace-card {
  display: grid;
  gap: 24px;
  padding: 30px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.workspace-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.workspace-copy {
  display: grid;
  gap: 6px;
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.workspace-kicker,
.nav-kicker {
  margin: 0;
  color: var(--tone-emerald);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.workspace-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.35;
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
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.category-chip {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  /* 绿字压淡绿底仅 4.7 边缘，改蓝色令牌留足余量 */
  color: var(--tone-blue);
}

.source-chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--secondary-text);
}

.reading-cabin {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 26px;
}

.article-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.article-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 10px;
  color: var(--text-color);
  line-height: 1.35;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--secondary-text);
  font-size: 0.85rem;
}

.source-badge,
.length-badge,
.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.separator {
  /* R8：分隔符是文本字符，去掉 0.4 透明度改用次级文字色 */
  color: var(--secondary-text);
}

.article-content {
  max-height: 46vh;
  overflow-y: auto;
  padding-right: 12px;
}

.reading-paragraph {
  font-size: 1.05rem;
  line-height: 1.95;
  color: var(--text-color);
  margin-bottom: 1.5em;
  text-align: justify;
}

.question-content {
  display: grid;
  gap: 20px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.question-head {
  display: grid;
  gap: 10px;
}

.q-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.question-index {
  color: var(--tone-emerald);
  font-size: 0.74rem;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.q-text {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.55;
  color: var(--text-color);
  margin: 0;
}

.options-container {
  display: grid;
  gap: 12px;
}

.answer-option {
  width: 100%;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.answer-option:hover {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(52, 211, 153, 0.35);
  transform: translateY(-2px);
}

.answer-option.selected {
  background: var(--card-bg);
  border-color: rgba(52, 211, 153, 0.65);
}

.option-index {
  width: 36px;
  height: 36px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--secondary-text);
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.answer-option.selected .option-index {
  background: #10b981;
  border-color: var(--tone-emerald);
  /* 实心绿底用固定深色 ink（R4），白字仅 2.4:1 */
  color: #04321f;
}

.option-text {
  flex: 1;
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.55;
  font-weight: 500;
}

.answer-option.selected .option-text {
  color: var(--text-color);
  font-weight: 600;
}

.check-badge {
  color: var(--tone-emerald);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.actions-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-act-btn {
  min-width: 120px;
  height: 44px;
  border-radius: var(--radius-md);
  font-weight: 700;
}

.next-btn {
  background: #34d399 !important;
  /* 实心亮绿底固定深色 ink，修正白字 1.6:1 */
  color: #04321f !important;
  border: none !important;
}

.submit-btn {
  background: #10b981 !important;
  /* 实心绿底固定深色 ink */
  color: #04321f !important;
  border: none !important;
}

.nav-panel {
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.nav-head {
  display: grid;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 800;
}

.meta-stack {
  display: grid;
  gap: 8px;
}

.meta-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.meta-label {
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.meta-val {
  color: var(--text-color);
  font-size: 0.95rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.meta-val.highlight {
  color: var(--tone-emerald);
}

.progress-card {
  padding: 14px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--secondary-text);
  font-size: 0.8rem;
}

.rate-num {
  color: var(--tone-emerald);
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.nav-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.5);
  color: var(--secondary-text);
  min-height: 40px;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-btn:hover {
  background: rgba(30, 41, 59, 0.8);
  color: var(--text-color);
  border-color: rgba(52, 211, 153, 0.35);
  transform: translateY(-1px);
}

.nav-btn.current {
  background: #10b981;
  /* 实心绿底固定深色 ink */
  color: #04321f;
  border-color: transparent;
}

.nav-btn.answered:not(.current) {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.35);
  color: var(--tone-emerald);
}

.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 18px;
  background-color: var(--tone-emerald);
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

:global(html[data-theme='light'] .workspace-card),
:global(html[data-theme='light'] .nav-panel) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .reading-cabin) {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .workspace-title),
:global(html[data-theme='light'] .article-header h2),
:global(html[data-theme='light'] .q-text),
:global(html[data-theme='light'] .nav-title) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .reading-paragraph) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .answer-option) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .answer-option:hover) {
  background: #f8fafc;
  border-color: rgba(16, 185, 129, 0.4);
}

:global(html[data-theme='light'] .answer-option.selected) {
  border-color: #059669;
}

:global(html[data-theme='light'] .option-index) {
  background: #f1f5f9;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .option-text) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .answer-option.selected .option-text) {
  color: #065f46;
}

:global(html[data-theme='light'] .meta-item-card) {
  background: #f1f5f9;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .meta-val) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .nav-btn) {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

:global(html[data-theme='light'] .nav-btn:hover) {
  /* R6：hover 沿用深色玻璃底，正文在浅色主题仅 2.1:1，改浅底 */
  background: #f1f5f9;
  color: var(--text-color);
}

@media (max-width: 900px) {
  .reading-layout-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .workspace-card {
    padding: 20px 18px;
  }

  .reading-cabin {
    padding: 18px;
  }

  .article-header h2 {
    font-size: 1.28rem;
  }

  .q-text {
    font-size: 1.08rem;
  }

  .actions-footer {
    flex-direction: column;
  }

  .nav-act-btn {
    width: 100%;
  }
}
</style>
