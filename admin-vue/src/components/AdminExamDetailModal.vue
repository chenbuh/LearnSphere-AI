<script setup>
import { computed } from 'vue'
import { NCard, NModal, NSpin, NTag } from 'naive-ui'
import { getExamTypeLabel } from '@/utils/examTypeMeta'
import { renderSafeLineBreaks } from '@/utils/safeHtml'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  exam: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:show'])

const questions = computed(() => (Array.isArray(props.exam?.questions) ? props.exam.questions : []))

const difficultyLabel = computed(() => {
  const diffMap = { 2: '简单', 3: '中等', 4: '困难' }
  return diffMap[props.exam?.difficulty] || '未知'
})

const getQuestionsBySection = section => {
  return questions.value.filter(question => question.section && question.section.includes(section))
}

/**
 * 渲染题目正文。
 *
 * 必须转义：question.text 来自题库（AI 生成或管理员录入），
 * 直接拼进 v-html 时若内容含 `<img onerror=...>` 会在管理后台执行，
 * 而管理后台的会话权限远高于前台，风险更大。
 */
const renderRichText = value => renderSafeLineBreaks(value)

const getQuestionNumber = (question, index) => {
  const candidates = [
    question?.questionNumber,
    question?.questionNo,
    question?.sortOrder,
    question?.displayOrder
  ]
  const resolved = candidates.find(value => Number.isFinite(Number(value)) && Number(value) > 0)
  return resolved ? Number(resolved) : index + 1
}

const sectionSummary = computed(() => {
  const sections = [
    { key: 'Writing', label: '写作' },
    { key: 'Listening', label: '听力' },
    { key: 'Reading', label: '阅读' },
    { key: 'Translation', label: '翻译' }
  ]

  return sections
    .map(section => ({
      ...section,
      count: getQuestionsBySection(section.key).length
    }))
    .filter(section => section.count > 0)
})
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="exam.title || '试卷详情'"
    style="width: 900px; max-height: 800px; overflow-y: auto"
    :bordered="false"
    size="huge"
    @update:show="emit('update:show', $event)"
  >
    <n-spin :show="loading">
      <div class="modal-body">
        <div v-if="questions.length" class="summary-panel">
          <div class="summary-main">
            <div class="summary-title-row">
              <h3 class="summary-title">{{ exam.title || '试卷详情' }}</h3>
              <n-tag type="primary" :bordered="false">
                {{ getExamTypeLabel(exam.examType, exam.examType || '未知类型') }}
              </n-tag>
            </div>
          </div>
          <div class="summary-metrics">
            <div class="metric-item">
              <span class="metric-label">时长</span>
              <strong>{{ exam.duration || 0 }} 分钟</strong>
            </div>
            <div class="metric-item">
              <span class="metric-label">总题数</span>
              <strong>{{ exam.totalQuestions || questions.length }} 题</strong>
            </div>
            <div class="metric-item">
              <span class="metric-label">难度</span>
              <strong>{{ difficultyLabel }}</strong>
            </div>
          </div>
          <div class="summary-tags">
            <n-tag
              v-for="section in sectionSummary"
              :key="section.key"
              size="small"
              round
              :bordered="false"
              type="info"
            >
              {{ section.label }} {{ section.count }} 题
            </n-tag>
          </div>
        </div>

        <div v-if="questions.length" class="content-stack">
          <n-card
            v-if="getQuestionsBySection('Writing').length"
            title="写作部分"
            size="small"
            class="question-section"
          >
            <template #header-extra>
              <span class="section-count">{{ getQuestionsBySection('Writing').length }} 题</span>
            </template>
            <div
              v-for="(question, index) in getQuestionsBySection('Writing')"
              :key="question.id"
              class="question-item question-item-text"
            >
              <div class="question-index">题目 {{ getQuestionNumber(question, index) }}</div>
              <div class="question-text" v-html="renderRichText(question.text)"></div>
            </div>
          </n-card>

          <n-card
            v-if="getQuestionsBySection('Listening').length"
            title="听力部分"
            size="small"
            class="question-section"
          >
            <template #header-extra>
              <span class="section-count">{{ getQuestionsBySection('Listening').length }} 题</span>
            </template>
            <div
              v-for="(question, index) in getQuestionsBySection('Listening')"
              :key="question.id"
              class="stack-block"
            >
              <div
                v-if="
                  index === 0 ||
                  question.audioScript !== getQuestionsBySection('Listening')[index - 1].audioScript
                "
                class="script-box"
              >
                <div class="evidence-label">听力原文</div>
                <p>{{ question.audioScript }}</p>
              </div>
              <div class="question-item">
                <div class="question-index">题目 {{ getQuestionNumber(question, index) }}</div>
                <div class="q-title">{{ question.text }}</div>
                <div class="options-grid">
                  <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    class="option-item"
                    :class="{ 'correct-opt': optionIndex === question.correct }"
                  >
                    {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                  </div>
                </div>
                <div v-if="question.explanation" class="explanation">
                  <div class="evidence-label">解析说明</div>
                  <p>{{ question.explanation }}</p>
                </div>
              </div>
            </div>
          </n-card>

          <n-card
            v-if="getQuestionsBySection('Reading').length"
            title="阅读部分"
            size="small"
            class="question-section"
          >
            <template #header-extra>
              <span class="section-count">{{ getQuestionsBySection('Reading').length }} 题</span>
            </template>
            <div
              v-for="(question, index) in getQuestionsBySection('Reading')"
              :key="question.id"
              class="stack-block"
            >
              <div
                v-if="
                  index === 0 ||
                  question.passage !== getQuestionsBySection('Reading')[index - 1].passage
                "
                class="script-box"
              >
                <div class="evidence-label">阅读文章</div>
                <p>{{ question.passage }}</p>
              </div>
              <div class="question-item">
                <div class="question-index">题目 {{ getQuestionNumber(question, index) }}</div>
                <div class="q-title">{{ question.text }}</div>
                <div class="options-grid">
                  <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    class="option-item"
                    :class="{ 'correct-opt': optionIndex === question.correct }"
                  >
                    {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                  </div>
                </div>
                <div v-if="question.explanation" class="explanation">
                  <div class="evidence-label">解析说明</div>
                  <p>{{ question.explanation }}</p>
                </div>
              </div>
            </div>
          </n-card>

          <n-card
            v-if="getQuestionsBySection('Translation').length"
            title="翻译部分"
            size="small"
            class="question-section"
          >
            <template #header-extra>
              <span class="section-count"
                >{{ getQuestionsBySection('Translation').length }} 题</span
              >
            </template>
            <div
              v-for="(question, index) in getQuestionsBySection('Translation')"
              :key="question.id"
              class="question-item question-item-text"
            >
              <div class="question-index">题目 {{ getQuestionNumber(question, index) }}</div>
              <div class="question-text mb-2" v-html="renderRichText(question.text)"></div>
              <div class="script-box">
                <div class="evidence-label">参考译文</div>
                <p>{{ question.explanation }}</p>
              </div>
            </div>
          </n-card>
        </div>

        <div v-else class="empty-state">
          <div class="empty-state__panel">
            <div class="empty-state__title">当前试卷没有可展示的题目内容</div>
          </div>
        </div>
      </div>
    </n-spin>
  </n-modal>
</template>

<style scoped>
.modal-body {
  min-height: 200px;
}

.summary-panel {
  margin-bottom: 18px;
  padding: 20px 22px;
  border-radius: var(--r-lg);
  background: var(--paper-sunken);
  display: grid;
  gap: 16px;
}

.summary-main {
  display: grid;
  gap: 8px;
}

.summary-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-title {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: var(--ink);
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-item {
  padding: 14px 16px;
  border-radius: var(--r-md);
  background: var(--surface);
  border: 1px solid var(--line);
  display: grid;
  gap: 6px;
}

.metric-label {
  font-size: 12px;
  color: var(--ink-3);
}

.metric-item strong {
  font-size: 16px;
  font-weight: 650;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-section {
  background: var(--surface);
}

.section-count {
  font-size: 12px;
  color: var(--ink-3);
  font-variant-numeric: tabular-nums;
}

.stack-block {
  margin-bottom: 16px;
}

.stack-block:last-child {
  margin-bottom: 0;
}

/* Listening scripts, reading passages and reference translations: long-form reading area. */
.script-box {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 16px 18px;
  border-radius: var(--r-md);
  margin-bottom: 16px;
  font-size: 0.95em;
  color: var(--ink);
  white-space: pre-wrap;
  line-height: 1.7;
}

.script-box p,
.explanation p {
  margin: 0;
}

.evidence-label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
}

.question-item {
  padding: 16px;
  background: var(--surface);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
}

.question-item-text {
  display: grid;
  gap: 12px;
}

.question-index {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
}

.q-title {
  font-weight: 600;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 12px;
  color: var(--ink);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

@media (min-width: 640px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.option-item {
  padding: 8px 12px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  border: 1px solid transparent;
  transition: background-color 0.2s;
  color: var(--ink);
  line-height: 1.6;
}

.option-item:hover {
  background: rgba(26, 33, 48, 0.07);
}

.correct-opt {
  color: var(--ok) !important;
  background: var(--ok-soft) !important;
  font-weight: 600;
  border-color: var(--ok);
}

.explanation {
  font-size: 0.92em;
  line-height: 1.7;
  color: var(--ink-2);
  margin-top: 12px;
  background: var(--paper-sunken);
  padding: 12px;
  border-radius: var(--r-md);
}

.mb-2 {
  margin-bottom: 12px;
}

.question-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--ink);
}

.empty-state {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state__panel {
  max-width: 420px;
  padding: 24px 28px;
  border-radius: var(--r-lg);
  border: 1px dashed var(--line-strong);
  background: var(--paper-sunken);
  text-align: center;
}

.empty-state__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

@media (max-width: 720px) {
  .summary-metrics {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .option-item {
    transition: none;
  }
}
</style>
