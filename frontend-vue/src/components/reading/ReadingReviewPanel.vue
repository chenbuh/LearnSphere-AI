<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NTag } from 'naive-ui'
import { ArrowLeft, CheckCircle2, MessageCircle, Sparkles, XCircle } from 'lucide-vue-next'

const props = defineProps({
  answers: {
    type: Array,
    default: () => []
  },
  article: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['back', 'openAiTutor'])

const articleParagraphs = computed(() =>
  String(props.article?.content || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
)

const totalQuestions = computed(() => props.article?.questions?.length || 0)

const correctCount = computed(() => {
  if (!props.article?.questions?.length) return 0
  return props.article.questions.filter(
    (question, index) => props.answers[index] === question.correct
  ).length
})

const accuracy = computed(() =>
  totalQuestions.value ? Math.round((correctCount.value / totalQuestions.value) * 100) : 0
)
</script>

<template>
  <div class="review-shell">
    <div class="review-topbar">
      <n-button secondary class="top-back-btn" @click="emit('back')">
        <template #icon><n-icon :component="ArrowLeft" /></template>
        返回成果报告
      </n-button>
    </div>

    <div v-if="article" class="review-grid">
      <section class="article-surface">
        <div class="surface-head">
          <div class="kicker-wrap">
            <span class="kicker-dot"></span>
            <p class="surface-kicker">Passage Review · 原文对照精读</p>
          </div>
          <h2>{{ article.title }}</h2>
          <p class="surface-caption">
            先通览原文逻辑脉络，再结合右侧题目证据链回溯失分陷阱与考点依据。
          </p>
        </div>

        <div class="surface-stats">
          <div class="stat-card">
            <span class="stat-label">综合正确率</span>
            <strong class="stat-val stat-val--accent">{{ accuracy }}%</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">答对题数</span>
            <strong class="stat-val">{{ correctCount }}/{{ totalQuestions }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">文章总段落</span>
            <strong class="stat-val">{{ articleParagraphs.length }} 段</strong>
          </div>
        </div>

        <div class="passage-panel secure-content">
          <p v-for="(paragraph, index) in articleParagraphs" :key="index" class="passage-paragraph">
            <span class="para-index">P{{ index + 1 }}</span>
            {{ paragraph }}
          </p>
        </div>
      </section>

      <aside class="analysis-rail">
        <div class="rail-summary">
          <div class="rail-kicker-badge">
            <n-icon :component="Sparkles" size="13" color="#34d399" />
            <span class="surface-kicker">逐题定位剖析</span>
          </div>
          <h3>考点归纳与陷阱还原</h3>
          <p class="rail-caption">实时对照选项偏差，点击“问问 AI 助手”深度获取语义与句法精讲。</p>
        </div>

        <div class="analysis-list">
          <article
            v-for="(question, index) in article.questions"
            :key="index"
            class="analysis-item"
            :class="{ wrong: answers[index] !== question.correct }"
          >
            <div class="analysis-head">
              <div class="analysis-copy">
                <span class="analysis-index">Q{{ index + 1 }}</span>
                <h4 class="secure-content">{{ question.text }}</h4>
              </div>
              <span
                class="status-pill"
                :class="answers[index] === question.correct ? 'is-correct' : 'is-wrong'"
              >
                {{ answers[index] === question.correct ? '答对' : '待复盘' }}
              </span>
            </div>

            <div class="answer-grid">
              <div class="answer-box">
                <span class="ans-label">你的选择</span>
                <div class="ans-content">
                  <strong
                    :class="answers[index] === question.correct ? 'success-text' : 'error-text'"
                  >
                    {{ question.options?.[answers[index]] || '未作答' }}
                  </strong>
                  <n-icon
                    :component="answers[index] === question.correct ? CheckCircle2 : XCircle"
                    :color="answers[index] === question.correct ? '#34d399' : '#f87171'"
                    size="16"
                  />
                </div>
              </div>
              <div class="answer-box">
                <span class="ans-label">正确答案</span>
                <div class="ans-content">
                  <strong class="success-text">{{
                    question.options?.[question.correct] || '-'
                  }}</strong>
                  <n-icon :component="CheckCircle2" color="#34d399" size="16" />
                </div>
              </div>
            </div>

            <div class="explanation-box secure-content">
              <div class="explanation-head">
                <span class="exp-title">名师/AI 解析</span>
                <n-button
                  size="tiny"
                  secondary
                  type="primary"
                  class="ai-ask-btn"
                  @click="emit('openAiTutor', index)"
                >
                  <template #icon><n-icon :component="MessageCircle" /></template>
                  问问 AI 助手
                </n-button>
              </div>
              <p>{{ question.explanation || '暂无详细解析，请对照原文理解考查意图。' }}</p>
            </div>
          </article>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.review-shell {
  display: grid;
  gap: 20px;
}

.review-topbar {
  display: flex;
  justify-content: flex-start;
}

.top-back-btn {
  border-radius: var(--radius-md);
  font-weight: 600;
}

.review-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  gap: 24px;
  align-items: flex-start;
}

.article-surface,
.analysis-rail {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.article-surface {
  padding: 30px;
  display: grid;
  gap: 24px;
}

.surface-head {
  display: grid;
  gap: 8px;
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

.surface-kicker {
  margin: 0;
  color: var(--tone-emerald);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.surface-head h2 {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.35;
}

.surface-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.9rem;
  line-height: 1.6;
}

.surface-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-label {
  color: var(--secondary-text);
  font-size: 0.76rem;
}

.stat-val {
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.stat-val--accent {
  color: var(--tone-emerald);
}

.passage-panel {
  max-height: 58vh;
  overflow-y: auto;
  padding: 24px;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.passage-paragraph {
  font-size: 1.05rem;
  line-height: 1.95;
  color: var(--text-color);
  margin-bottom: 1.5em;
  text-align: justify;
  position: relative;
}

.para-index {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--tone-emerald);
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(52, 211, 153, 0.12);
  margin-right: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.analysis-rail {
  padding: 26px;
  display: grid;
  gap: 20px;
}

.rail-summary {
  display: grid;
  gap: 6px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.rail-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rail-summary h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-color);
}

.rail-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.85rem;
  line-height: 1.55;
}

.analysis-list {
  display: grid;
  gap: 16px;
}

.analysis-item {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.analysis-item.wrong {
  border-color: rgba(239, 68, 68, 0.3);
}

.analysis-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.analysis-copy {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.analysis-index {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(52, 211, 153, 0.14);
  color: var(--tone-emerald);
  font-size: 0.74rem;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  flex-shrink: 0;
}

.analysis-copy h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.5;
}

.status-pill {
  padding: 3px 8px;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  flex-shrink: 0;
}

.status-pill.is-correct {
  /* R5：底色 alpha 0.15→0.10，4.74 边缘留出余量 */
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: var(--tone-emerald);
}

.status-pill.is-wrong {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: var(--tone-red);
}

.answer-grid {
  display: grid;
  gap: 8px;
}

.answer-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.ans-label {
  color: var(--secondary-text);
  font-size: 0.78rem;
}

.ans-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-text {
  color: var(--tone-emerald);
  font-weight: 700;
  font-size: 0.92rem;
}

.error-text {
  color: var(--tone-red);
  font-weight: 700;
  font-size: 0.92rem;
}

.explanation-box {
  padding: 14px;
  border-radius: var(--radius-lg);
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-left: 3px solid #34d399;
}

.explanation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.exp-title {
  color: var(--tone-emerald);
  font-size: 0.8rem;
  font-weight: 800;
}

.ai-ask-btn {
  font-weight: 700;
}

.explanation-box p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
}

html[data-theme='light'] .article-surface,
html[data-theme='light'] .analysis-rail {
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .surface-head h2,
html[data-theme='light'] .rail-summary h3,
html[data-theme='light'] .analysis-copy h4 {
  color: var(--text-color);
}

html[data-theme='light'] .surface-caption,
html[data-theme='light'] .rail-caption {
  color: var(--secondary-text);
}

html[data-theme='light'] .stat-card {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .stat-val {
  color: var(--text-color);
}

html[data-theme='light'] .passage-panel {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .passage-paragraph {
  color: var(--text-color);
}

html[data-theme='light'] .analysis-item {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .answer-box {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.16);
}

html[data-theme='light'] .explanation-box {
  background: rgba(236, 253, 245, 0.85);
  border-color: rgba(16, 185, 129, 0.3);
  border-left-color: #059669;
}

html[data-theme='light'] .explanation-box p {
  color: var(--secondary-text);
}

@media (max-width: 900px) {
  .review-grid {
    grid-template-columns: 1fr;
  }

  .article-surface,
  .analysis-rail {
    padding: 20px 18px;
  }
}
</style>
