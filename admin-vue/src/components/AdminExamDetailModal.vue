<script setup>
import { computed } from 'vue'
import { NCard, NModal, NSpin, NTag } from 'naive-ui'
import { getExamTypeLabel } from '@/utils/examTypeMeta'

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

const getQuestionsBySection = (section) => {
  return questions.value.filter((question) => question.section && question.section.includes(section))
}

const renderRichText = (value) => String(value || '').replace(/\n/g, '<br/>')

const getQuestionNumber = (question, index) => {
  const candidates = [
    question?.questionNumber,
    question?.questionNo,
    question?.sortOrder,
    question?.displayOrder
  ]
  const resolved = candidates.find((value) => Number.isFinite(Number(value)) && Number(value) > 0)
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
    .map((section) => ({
      ...section,
      count: getQuestionsBySection(section.key).length
    }))
    .filter((section) => section.count > 0)
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
            <div class="summary-eyebrow">试卷摘要</div>
            <div class="summary-title-row">
              <h3 class="summary-title">{{ exam.title || '试卷详情' }}</h3>
              <n-tag type="primary" :bordered="false">
                {{ getExamTypeLabel(exam.examType, exam.examType || '未知类型') }}
              </n-tag>
            </div>
            <p class="summary-description">
              先确认题型结构与难度，再查看各分区题面、材料和参考说明。
            </p>
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
            <div class="section-intro">
              <div class="section-intro-title">作答重点</div>
              <p>优先查看写作要求，再对照题干中的约束条件与输出目标。</p>
            </div>
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
            <div class="section-intro">
              <div class="section-intro-title">查看顺序</div>
              <p>先核对听力材料，再看题目选项，最后参考解析确认标准答案依据。</p>
            </div>
            <div v-for="(question, index) in getQuestionsBySection('Listening')" :key="question.id" class="stack-block">
              <div
                v-if="index === 0 || question.audioScript !== getQuestionsBySection('Listening')[index - 1].audioScript"
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
            <div class="section-intro">
              <div class="section-intro-title">阅读顺序</div>
              <p>先通读文章材料，再逐题查看选项和解析，减少信息跳读带来的负担。</p>
            </div>
            <div v-for="(question, index) in getQuestionsBySection('Reading')" :key="question.id" class="stack-block">
              <div
                v-if="index === 0 || question.passage !== getQuestionsBySection('Reading')[index - 1].passage"
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
              <span class="section-count">{{ getQuestionsBySection('Translation').length }} 题</span>
            </template>
            <div class="section-intro">
              <div class="section-intro-title">查看顺序</div>
              <p>先读原题，再对照参考译文，便于快速检查答案要求与语言风格。</p>
            </div>
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
            <p>请先确认题目是否已生成并保存成功，再重新打开详情弹窗查看。</p>
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
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.76), rgba(15, 23, 42, 0.46));
  border: 1px solid rgba(148, 163, 184, 0.16);
  display: grid;
  gap: 16px;
}

.summary-main {
  display: grid;
  gap: 8px;
}

.summary-eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
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
  font-size: 22px;
  font-weight: 700;
  color: #f8fafc;
}

.summary-description {
  margin: 0;
  line-height: 1.6;
  color: #cbd5e1;
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-item {
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.44);
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: grid;
  gap: 6px;
}

.metric-label {
  font-size: 12px;
  color: #94a3b8;
}

.metric-item strong {
  font-size: 16px;
  color: #f8fafc;
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
  background: transparent;
}

.section-count {
  font-size: 12px;
  color: #94a3b8;
}

.section-intro {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.38);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.section-intro-title {
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #93c5fd;
}

.section-intro p {
  margin: 0;
  color: #cbd5e1;
  line-height: 1.6;
}

.stack-block {
  margin-bottom: 16px;
}

.stack-block:last-child {
  margin-bottom: 0;
}

.script-box {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.18);
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 0.95em;
  color: #dbeafe;
  white-space: pre-wrap;
  line-height: 1.6;
}

.script-box p,
.explanation p {
  margin: 0;
}

.evidence-label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #93c5fd;
}

.question-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.question-item-text {
  display: grid;
  gap: 12px;
}

.question-index {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}

.q-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 12px;
  color: #e4e4e7;
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
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(148, 163, 184, 0.08);
  transition: all 0.2s;
  color: #cbd5e1;
}

.option-item:hover {
  background: rgba(30, 41, 59, 0.6);
}

.correct-opt {
  color: #86efac !important;
  background: rgba(22, 101, 52, 0.28) !important;
  font-weight: 700;
  border: 1px solid rgba(34, 197, 94, 0.24);
}

.explanation {
  font-size: 0.92em;
  color: #cbd5e1;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  margin-top: 12px;
  background: rgba(15, 23, 42, 0.4);
  padding: 12px;
  border-radius: 10px;
}

.mb-2 {
  margin-bottom: 12px;
}

.question-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #e4e4e7;
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
  border-radius: 16px;
  border: 1px dashed rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.3);
  text-align: center;
}

.empty-state__title {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
}

.empty-state__panel p {
  margin: 10px 0 0;
  color: #94a3b8;
  line-height: 1.6;
}

:deep(.n-card) {
  background-color: rgba(30, 30, 35, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}

@media (max-width: 720px) {
  .summary-metrics {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>
