<template>
  <div class="history-list">
    <n-spin :show="loading">
      <!-- 零记录启航舱 / 搜索无结果 空状态 -->
      <div v-if="!records || records.length === 0" class="empty-shell orbit-deck">
        <div class="orbit-badge-hub" :class="hasFilters ? 'is-search' : 'is-clean'">
          <div class="orbit-ring orbit-ring--outer"></div>
          <div class="orbit-ring orbit-ring--inner"></div>
          <div class="orbit-icon-core">
            <Search v-if="hasFilters" :size="32" />
            <History v-else :size="32" />
          </div>
        </div>

        <div class="orbit-copy">
          <h3 class="orbit-title">{{ emptyDescription }}</h3>
          <p class="orbit-desc">{{ emptyHint }}</p>
        </div>

        <div class="orbit-actions">
          <button
            v-if="hasFilters"
            type="button"
            class="orbit-btn orbit-btn--primary"
            @click="$emit('clear-filter')"
          >
            <RotateCcw :size="15" />
            <span>清空筛选条件</span>
          </button>
          <template v-else>
            <button
              type="button"
              class="orbit-btn orbit-btn--primary"
              @click="$emit('start-practice')"
            >
              <span>立即开启「{{ moduleLabel }}」</span>
              <ArrowRight :size="15" />
            </button>
            <button
              type="button"
              class="orbit-btn orbit-btn--secondary"
              @click="$emit('go-error-book')"
            >
              <BookOpen :size="15" />
              <span>前往错题本</span>
            </button>
          </template>
        </div>
      </div>

      <div v-else class="records-grid">
        <n-card v-for="record in normalizedRecords" :key="record.id" class="record-card" hoverable>
          <div class="record-header">
            <div class="title-section">
              <p class="record-eyebrow">
                {{ moduleLabel }}
                <span>·</span>
                {{ formatTime(record.createTime) }}
              </p>
              <div class="record-title-row">
                <div class="record-title-copy">
                  <h3>{{ record.title || '练习题目' }}</h3>
                  <p v-if="record.contentPreview" class="record-preview">
                    {{ record.contentPreview }}
                  </p>
                </div>

                <div class="record-score" :class="`is-${getScoreType(record.score)}`">
                  <span>得分</span>
                  <strong>{{ record.score || 0 }}%</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="record-meta">
            <span class="meta-pill"> {{ record.summary.questionCount }} 题 </span>
            <span class="meta-pill"> {{ record.summary.correctCount }} 题正确 </span>
            <span class="meta-pill" :class="{ 'is-warn': record.summary.wrongCount > 0 }">
              {{ record.summary.wrongCount }} 题待复盘
            </span>
            <span class="meta-pill">
              {{ record.difficultyLabel }}
            </span>
          </div>

          <div class="record-note">展开后可查看每一道题的答案、选项对照与解析。</div>

          <n-collapse class="qa-collapse" arrow-placement="right">
            <n-collapse-item
              v-for="(qa, idx) in record.parsedQuestions"
              :key="idx"
              :title="`问题 ${idx + 1}`"
            >
              <div class="question-block">
                <p class="question-text">{{ qa.question }}</p>
                <n-space v-if="qa.options && qa.options.length > 0" vertical class="options-list">
                  <div
                    v-for="opt in formatOptions(qa.options)"
                    :key="opt.key"
                    class="option-item"
                    :class="{
                      correct: isOptionCorrect(opt.key, qa),
                      wrong: isOptionWrong(opt.key, qa),
                      selected: isOptionSelected(opt.key, qa)
                    }"
                  >
                    <span class="option-key">{{ opt.label }}.</span>
                    <span class="option-text">{{ opt.text }}</span>
                    <n-tag
                      v-if="isOptionCorrect(opt.key, qa)"
                      type="success"
                      size="tiny"
                      style="margin-left: 8px"
                    >
                      ✓ 正确答案
                    </n-tag>
                    <n-tag
                      v-else-if="isOptionSelected(opt.key, qa)"
                      type="error"
                      size="tiny"
                      style="margin-left: 8px"
                    >
                      ✗ 你的答案
                    </n-tag>
                  </div>
                </n-space>

                <div v-else class="text-answer-block">
                  <div class="answer-section">
                    <strong>你的答案：</strong>
                    <p class="user-answer">{{ qa.userAnswer || '未作答' }}</p>
                  </div>
                  <div v-if="qa.feedback" class="feedback-section">
                    <strong>AI 评价：</strong>
                    <p class="feedback-text">{{ qa.feedback }}</p>
                  </div>
                </div>

                <div v-if="qa.explanation" class="explanation-block">
                  <n-alert type="info" :bordered="false">
                    <template #header>
                      <strong>📖 解析</strong>
                    </template>
                    {{ qa.explanation }}
                  </n-alert>
                </div>
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-card>

        <div v-if="showPagination" class="pagination-footer">
          <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="total"
            show-size-picker
            :page-sizes="[10, 20, 30, 50]"
            @update:page="$emit('update:page', $event)"
            @update:page-size="$emit('update:page-size', $event)"
          />
        </div>
      </div>
    </n-spin>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NAlert, NCard, NCollapse, NCollapseItem, NPagination, NSpace, NSpin, NTag } from 'naive-ui'
import { ArrowRight, BookOpen, History, RotateCcw, Search, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  module: {
    type: String,
    required: true
  },
  records: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  total: {
    type: Number,
    default: 0
  },
  moduleLabel: {
    type: String,
    default: '练习模块'
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  emptyDescription: {
    type: String,
    default: '暂无练习记录'
  },
  emptyHint: {
    type: String,
    default: '完成练习后，这里会自动沉淀你的答题过程。'
  },
  hasFilters: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'update:page',
  'update:page-size',
  'load-more',
  'start-practice',
  'go-error-book',
  'clear-filter'
])

const difficultyMap = {
  easy: '初级',
  medium: '中级',
  hard: '高级',
  初级: '初级',
  中级: '中级',
  高级: '高级'
}

const getScoreType = score => {
  if (!score) return 'default'
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'error'
}

const normalizeAnswerValue = value => {
  if (value === undefined || value === null) {
    return null
  }

  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'undefined' || stringValue === 'null') {
    return null
  }

  return stringValue
}

const isQuestionCorrect = question => {
  if (question?.isCorrect === 1 || question?.isCorrect === true) {
    return true
  }

  if (question?.isCorrect === 0 || question?.isCorrect === false) {
    return false
  }

  const userAnswer = normalizeAnswerValue(question?.userAnswer)
  const correctAnswer = normalizeAnswerValue(question?.correctAnswer)

  return Boolean(userAnswer && correctAnswer && userAnswer === correctAnswer)
}

const formatTime = time => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  }
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const parseQuestionsAndAnswers = record => {
  try {
    let questions = []
    if (typeof record.questions === 'string') {
      try {
        const parsed = JSON.parse(record.questions)
        questions = Array.isArray(parsed) ? parsed : [parsed]
      } catch (error) {
        console.warn('Failed to parse questions JSON', error)
        questions = []
      }
    } else if (Array.isArray(record.questions)) {
      questions = record.questions
    } else if (record.questions) {
      questions = [record.questions]
    }

    let userAnswers = []
    if (typeof record.answer === 'string') {
      try {
        userAnswers = JSON.parse(record.answer)
      } catch {
        userAnswers = record.answer
      }
    } else {
      userAnswers = record.answer
    }

    return questions.map((question, idx) => {
      if (question && typeof question === 'object' && question.userAnswer !== undefined) {
        let actualQuestion = question
        if (question.question && typeof question.question === 'object') {
          actualQuestion = {
            ...question.question,
            userAnswer: question.userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: question.isCorrect
          }
        }

        return {
          question: actualQuestion.question || actualQuestion.text || '题目内容',
          options: actualQuestion.options || [],
          userAnswer: actualQuestion.userAnswer,
          correctAnswer:
            actualQuestion.correctAnswer || actualQuestion.answer || actualQuestion.correct,
          explanation: actualQuestion.explanation,
          feedback: actualQuestion.feedback,
          isCorrect: actualQuestion.isCorrect
        }
      }

      const userAnswer = Array.isArray(userAnswers) ? userAnswers[idx] : userAnswers
      let actualQuestion = question
      if (
        question &&
        typeof question === 'object' &&
        !question.text &&
        !question.options &&
        question.question
      ) {
        actualQuestion = question.question
      }

      return {
        question:
          actualQuestion?.question ||
          actualQuestion?.text ||
          (typeof actualQuestion === 'string' ? actualQuestion : '题目内容格式错误'),
        options: actualQuestion?.options || [],
        userAnswer,
        correctAnswer:
          actualQuestion?.answer || actualQuestion?.correct || actualQuestion?.correctAnswer,
        explanation: actualQuestion?.explanation,
        feedback: actualQuestion?.feedback,
        isCorrect: actualQuestion?.isCorrect
      }
    })
  } catch (error) {
    console.error('Failed to parse Q&A:', error)
    return [
      {
        question: '解析失败',
        userAnswer: record.answer,
        correctAnswer: record.correctAnswer
      }
    ]
  }
}

const getRecordSummary = questions => {
  const questionCount = questions.length
  const answeredCount = questions.filter(question =>
    normalizeAnswerValue(question.userAnswer)
  ).length
  const correctCount = questions.filter(question => isQuestionCorrect(question)).length
  const wrongCount = Math.max(answeredCount - correctCount, 0)

  return {
    questionCount,
    answeredCount,
    correctCount,
    wrongCount
  }
}

const createContentPreview = content => {
  if (!content) {
    return ''
  }

  const normalized = String(content).replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return ''
  }

  return normalized.length > 96 ? `${normalized.slice(0, 96)}...` : normalized
}

const normalizedRecords = computed(() => {
  return props.records.map(record => {
    const parsedQuestions = parseQuestionsAndAnswers(record)
    return {
      ...record,
      parsedQuestions,
      contentPreview: createContentPreview(record.content),
      difficultyLabel: difficultyMap[record.difficulty] || record.difficulty || '难度未标注',
      summary: getRecordSummary(parsedQuestions)
    }
  })
})

const formatOptions = options => {
  if (!Array.isArray(options)) return []
  return options.map((text, idx) => ({
    key: idx,
    text,
    label: String.fromCharCode(65 + idx)
  }))
}

const isOptionSelected = (optionKey, question) => {
  return normalizeAnswerValue(optionKey) === normalizeAnswerValue(question?.userAnswer)
}

const isOptionCorrect = (optionKey, question) => {
  return normalizeAnswerValue(optionKey) === normalizeAnswerValue(question?.correctAnswer)
}

const isOptionWrong = (optionKey, question) => {
  return isOptionSelected(optionKey, question) && !isOptionCorrect(optionKey, question)
}
</script>

<style scoped>
.history-list {
  min-height: 400px;
  margin-top: 18px;
  --history-card-bg: #ffffff;
  --history-card-border: rgba(226, 232, 240, 0.95);
  --history-card-shadow: 0 16px 36px -18px rgba(15, 23, 42, 0.08);
  --history-item-bg: rgba(248, 250, 252, 0.85);
  --history-item-border: rgba(226, 232, 240, 0.95);
  --history-title-color: #0f172a;
  --history-muted: #475569;
  --history-soft: rgba(30, 107, 82, 0.08);
}

:global(html[data-theme='dark'] .history-list) {
  --history-card-bg: rgba(15, 23, 42, 0.72);
  --history-card-border: rgba(148, 163, 184, 0.16);
  --history-card-shadow: 0 24px 48px -24px rgba(2, 6, 23, 0.7);
  --history-item-bg: rgba(30, 41, 59, 0.55);
  --history-item-border: rgba(148, 163, 184, 0.14);
  --history-title-color: #f8fafc;
  --history-muted: #94a3b8;
  --history-soft: rgba(30, 107, 82, 0.15);
}

/* ==========================================================================
   零记录启航舱 (Orbit Deck) 空状态
   ========================================================================== */
.empty-shell.orbit-deck {
  padding: 56px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: var(--radius-lg);
  background: var(--history-item-bg);
  border: 1px dashed var(--history-card-border);
}

.orbit-badge-hub {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.orbit-ring {
  position: absolute;
  border-radius: 999px;
  border: 1px dashed rgba(30, 107, 82, 0.3);
}

.orbit-ring--outer {
  inset: -14px;
  animation: rotate-slow 24s linear infinite;
}

.orbit-ring--inner {
  inset: -4px;
  border-style: solid;
  border-color: rgba(30, 107, 82, 0.18);
}

.orbit-icon-core {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-emerald);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.28);
  animation: float-gentle 4s ease-in-out infinite;
}

.orbit-badge-hub.is-search .orbit-icon-core {
  color: var(--tone-emerald);
  background: var(--card-bg);
  border-color: rgba(43, 122, 96, 0.28);
}

.orbit-badge-hub.is-search .orbit-ring {
  border-color: rgba(43, 122, 96, 0.28);
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.orbit-copy {
  max-width: 480px;
  margin-bottom: 24px;
}

.orbit-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--history-title-color);
  letter-spacing: -0.01em;
}

.orbit-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--history-muted);
}

.orbit-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.orbit-btn {
  height: 44px;
  padding: 0 22px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.22s ease;
}

.orbit-btn--primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.orbit-btn--primary:hover {
  transform: translateY(-2px);
}

.orbit-btn--secondary {
  color: var(--history-title-color);
  background: var(--history-card-bg);
  border: 1px solid var(--history-card-border);
}

.orbit-btn--secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.4);
}

/* ==========================================================================
   答题记录卡片 (Record Card)
   ========================================================================== */
.records-grid {
  display: grid;
  gap: 20px;
}

.record-card {
  transition: all 0.25s ease;
  border-radius: var(--radius-lg);
  background: var(--history-card-bg) !important;
  border: 1px solid var(--history-card-border) !important;
}

.record-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.3) !important;
}

.record-header {
  margin-bottom: 14px;
}

.record-eyebrow {
  margin: 0 0 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--history-muted);
  letter-spacing: 0.02em;
}

.record-title-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.record-title-copy {
  min-width: 0;
}

.title-section h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--history-title-color);
}

.record-preview {
  margin: 8px 0 0;
  color: var(--history-muted);
  line-height: 1.65;
  font-size: 14px;
}

.record-score {
  min-width: 96px;
  padding: 10px 16px;
  border-radius: var(--radius-lg);
  display: grid;
  gap: 3px;
  text-align: right;
  flex-shrink: 0;
}

.record-score span {
  font-size: 11px;
  font-weight: 600;
  color: var(--history-muted);
}

.record-score strong {
  font-size: 24px;
  font-weight: 800;
  line-height: 1;
}

.record-score.is-success {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.24);
}

.record-score.is-warning {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.24);
}

.record-score.is-error {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--history-title-color);
  background: var(--history-item-bg);
  border: 1px solid var(--history-item-border);
  font-size: 12px;
  font-weight: 600;
}

.meta-pill.is-warn {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.24);
}

.record-note {
  margin-bottom: 12px;
  color: var(--history-muted);
  font-size: 13px;
  line-height: 1.6;
}

.qa-collapse {
  margin-top: 4px;
}

.question-block {
  padding: 12px 0;
}

.question-text {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--history-title-color);
  line-height: 1.6;
}

.options-list {
  width: 100%;
}

.option-item {
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--history-item-border);
  background: var(--history-item-bg);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.option-item.correct {
  background: rgba(16, 185, 129, 0.12);
  border-color: var(--tone-emerald);
}

.option-item.wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.option-item.selected:not(.correct) {
  border-color: var(--tone-red);
}

.option-key {
  font-weight: 700;
  margin-right: 8px;
  color: var(--history-muted);
}

.option-text {
  flex: 1;
  color: var(--history-title-color);
}

.text-answer-block {
  margin-top: 12px;
  display: grid;
  gap: 12px;
}

.answer-section,
.feedback-section {
  margin-bottom: 0;
  padding: 14px;
  background: var(--history-item-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--history-item-border);
}

.answer-section strong,
.feedback-section strong {
  color: var(--history-title-color);
  font-size: 13px;
}

.user-answer,
.feedback-text {
  margin-top: 6px;
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--history-title-color);
}

.explanation-block {
  margin-top: 16px;
}

.pagination-footer {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

/* ==========================================================================
   响应式断点
   ========================================================================== */
@media (max-width: 768px) {
  .record-card {
    border-radius: var(--radius-lg);
  }

  :deep(.n-card__content) {
    padding: 14px !important;
  }

  .record-title-row {
    flex-direction: column;
  }

  .title-section h3 {
    font-size: 17px;
  }

  .record-score {
    width: 100%;
    min-width: 0;
    text-align: left;
  }

  .orbit-badge-hub {
    width: 80px;
    height: 80px;
  }

  .orbit-icon-core {
    width: 60px;
    height: 60px;
  }

  .orbit-actions {
    flex-direction: column;
    width: 100%;
  }

  .orbit-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .empty-shell.orbit-deck {
    padding: 36px 16px;
  }

  .meta-pill {
    min-height: 30px;
    padding: 0 10px;
    font-size: 11px;
  }

  .option-item {
    align-items: flex-start;
    gap: 6px;
    flex-wrap: wrap;
  }

  .option-text {
    min-width: 0;
    word-break: break-word;
  }

  .pagination-footer {
    justify-content: flex-start;
    overflow-x: auto;
    padding: 10px 0 2px;
    margin-top: 18px;
  }

  .pagination-footer :deep(.n-pagination) {
    min-width: max-content;
  }
}
</style>
