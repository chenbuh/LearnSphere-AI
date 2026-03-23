<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NTag } from 'naive-ui'
import { ArrowLeft, CheckCircle2, MessageCircle, XCircle } from 'lucide-vue-next'

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

const articleParagraphs = computed(() => (
  String(props.article?.content || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)
))

const totalQuestions = computed(() => props.article?.questions?.length || 0)

const correctCount = computed(() => {
  if (!props.article?.questions?.length) return 0
  return props.article.questions.filter((question, index) => props.answers[index] === question.correct).length
})

const accuracy = computed(() => (
  totalQuestions.value ? Math.round((correctCount.value / totalQuestions.value) * 100) : 0
))
</script>

<template>
  <div class="review-shell">
    <div class="review-topbar">
      <n-button secondary @click="emit('back')">
        <template #icon><n-icon :component="ArrowLeft" /></template>
        返回报告
      </n-button>
    </div>

    <div v-if="article" class="review-grid">
      <section class="article-surface">
        <div class="surface-head">
          <p class="surface-kicker">Passage Review</p>
          <h2>{{ article.title }}</h2>
          <p>先回到原文，再结合右侧逐题解析定位错因、关键词和干扰项。</p>
        </div>

        <div class="surface-stats">
          <div class="stat-card">
            <span>正确率</span>
            <strong>{{ accuracy }}%</strong>
          </div>
          <div class="stat-card">
            <span>答对题数</span>
            <strong>{{ correctCount }}/{{ totalQuestions }}</strong>
          </div>
          <div class="stat-card">
            <span>文章段落</span>
            <strong>{{ articleParagraphs.length }}</strong>
          </div>
        </div>

        <div class="passage-panel secure-content">
          <p
            v-for="(paragraph, index) in articleParagraphs"
            :key="index"
            class="passage-paragraph"
          >
            {{ paragraph }}
          </p>
        </div>
      </section>

      <aside class="analysis-rail">
        <div class="rail-summary">
          <p class="surface-kicker">Question Notes</p>
          <h3>逐题定位错因与答案依据</h3>
          <p>右侧保留轻量的题目复盘清单，你可以直接按题号扫过自己的失分点。</p>
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
              <n-tag
                round
                size="small"
                :bordered="false"
                :type="answers[index] === question.correct ? 'success' : 'error'"
              >
                {{ answers[index] === question.correct ? '答对' : '待复盘' }}
              </n-tag>
            </div>

            <div class="answer-grid">
              <div class="answer-box">
                <span>你的选择</span>
                <strong :class="answers[index] === question.correct ? 'success-text' : 'error-text'">
                  {{ question.options?.[answers[index]] || '未作答' }}
                </strong>
                <n-icon
                  :component="answers[index] === question.correct ? CheckCircle2 : XCircle"
                  :color="answers[index] === question.correct ? '#10b981' : '#ef4444'"
                />
              </div>
              <div class="answer-box">
                <span>正确答案</span>
                <strong class="success-text">{{ question.options?.[question.correct] || '-' }}</strong>
              </div>
            </div>

            <div class="explanation-box secure-content">
              <div class="explanation-head">
                <span>解析</span>
                <n-button size="tiny" secondary type="primary" @click="emit('openAiTutor', index)">
                  <template #icon><n-icon :component="MessageCircle" /></template>
                  问问 AI 助手
                </n-button>
              </div>
              <p>{{ question.explanation || '暂无详细解析。' }}</p>
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
  gap: 18px;
}

.review-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: 24px;
  align-items: start;
}

.article-surface,
.analysis-rail {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.22)),
    rgba(15, 23, 42, 0.18);
}

.article-surface {
  padding: 26px 28px;
}

.surface-head {
  display: grid;
  gap: 10px;
}

.surface-kicker {
  margin: 0;
  color: #34d399;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.surface-head h2,
.rail-summary h3 {
  margin: 0;
  color: var(--text-color);
}

.surface-head h2 {
  font-size: clamp(1.45rem, 2vw, 1.95rem);
  line-height: 1.15;
}

.surface-head p,
.rail-summary p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.7;
}

.surface-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 22px;
}

.stat-card,
.answer-box,
.analysis-item {
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.16);
}

.stat-card {
  padding: 14px 16px;
  border-radius: 18px;
}

.stat-card span,
.answer-box span,
.analysis-index,
.explanation-head span {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-card strong {
  display: block;
  margin-top: 6px;
  color: var(--text-color);
  font-size: 1.08rem;
}

.passage-panel {
  margin-top: 22px;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(2, 6, 23, 0.24), rgba(15, 23, 42, 0.18)),
    rgba(15, 23, 42, 0.12);
}

.passage-paragraph {
  margin: 0;
  color: var(--text-color);
  line-height: 1.9;
  font-size: 1.02rem;
}

.passage-paragraph + .passage-paragraph {
  margin-top: 16px;
}

.analysis-rail {
  position: sticky;
  top: 92px;
  padding: 22px;
}

.analysis-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.analysis-item {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 22px;
}

.analysis-item.wrong {
  border-color: rgba(239, 68, 68, 0.18);
}

.analysis-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
}

.analysis-copy {
  min-width: 0;
}

.analysis-copy h4 {
  margin: 8px 0 0;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.6;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.answer-box {
  display: grid;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 18px;
}

.answer-box strong {
  color: var(--text-color);
  line-height: 1.5;
}

.explanation-box {
  padding: 14px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.2);
}

.explanation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.explanation-box p {
  margin: 0;
  color: var(--text-color);
  line-height: 1.7;
}

.success-text {
  color: #6ee7b7 !important;
}

.error-text {
  color: #fca5a5 !important;
}

:global(html[data-theme='light'] .article-surface),
:global(html[data-theme='light'] .analysis-rail) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 38px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .stat-card),
:global(html[data-theme='light'] .answer-box),
:global(html[data-theme='light'] .analysis-item),
:global(html[data-theme='light'] .passage-panel),
:global(html[data-theme='light'] .explanation-box) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .analysis-item.wrong) {
  border-color: rgba(239, 68, 68, 0.22);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(254, 242, 242, 0.82)),
    rgba(255, 255, 255, 0.92);
}

:global(html[data-theme='light'] .success-text) {
  color: #047857 !important;
}

:global(html[data-theme='light'] .error-text) {
  color: #b91c1c !important;
}

@media (max-width: 1100px) {
  .review-grid {
    grid-template-columns: 1fr;
  }

  .analysis-rail {
    position: static;
    top: auto;
  }
}

@media (max-width: 768px) {
  .article-surface,
  .analysis-rail {
    border-radius: 22px;
  }

  .article-surface,
  .analysis-rail {
    padding: 18px;
  }

  .surface-stats,
  .answer-grid {
    grid-template-columns: 1fr;
  }

  .passage-panel {
    padding: 16px;
    border-radius: 18px;
  }

  .analysis-head,
  .explanation-head {
    flex-direction: column;
    align-items: start;
  }
}
</style>

