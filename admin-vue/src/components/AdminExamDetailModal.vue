<script setup>
import { computed } from 'vue'
import { NCard, NModal, NSpace, NSpin, NTag } from 'naive-ui'

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
        <n-card v-if="questions.length" class="summary-card" :bordered="false">
          <n-space>
            <n-tag type="primary" :bordered="false">{{ exam.examType || '未知类型' }}</n-tag>
            <n-tag type="info" :bordered="false">时长 {{ exam.duration || 0 }} 分钟</n-tag>
            <n-tag type="success" :bordered="false">{{ exam.totalQuestions || questions.length }} 题</n-tag>
            <n-tag :type="exam.difficulty > 3 ? 'error' : 'warning'" :bordered="false">
              难度 {{ difficultyLabel }}
            </n-tag>
          </n-space>
        </n-card>

        <div v-if="questions.length" class="content-stack">
          <n-card
            v-if="getQuestionsBySection('Writing').length"
            title="Part I Writing"
            size="small"
            class="question-section"
          >
            <div v-for="question in getQuestionsBySection('Writing')" :key="question.id">
              <div class="question-text" v-html="renderRichText(question.text)"></div>
            </div>
          </n-card>

          <n-card
            v-if="getQuestionsBySection('Listening').length"
            title="Part II Listening"
            size="small"
            class="question-section"
          >
            <div
              v-for="(question, index) in getQuestionsBySection('Listening')"
              :key="question.id"
              class="stack-block"
            >
              <div
                v-if="index === 0 || question.audioScript !== getQuestionsBySection('Listening')[index - 1].audioScript"
                class="script-box"
              >
                <strong>(听力原文)</strong>
                <p>{{ question.audioScript }}</p>
              </div>
              <div class="question-item">
                <div class="q-title">{{ index + 1 }}. {{ question.text }}</div>
                <div class="options-grid">
                  <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    :class="{ 'correct-opt': optionIndex === question.correct }"
                  >
                    {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                  </div>
                </div>
                <div class="explanation">💡 {{ question.explanation }}</div>
              </div>
            </div>
          </n-card>

          <n-card
            v-if="getQuestionsBySection('Reading').length"
            title="Part III Reading"
            size="small"
            class="question-section"
          >
            <div
              v-for="(question, index) in getQuestionsBySection('Reading')"
              :key="question.id"
              class="stack-block"
            >
              <div
                v-if="index === 0 || question.passage !== getQuestionsBySection('Reading')[index - 1].passage"
                class="script-box"
              >
                <strong>(阅读文章)</strong>
                <p>{{ question.passage }}</p>
              </div>
              <div class="question-item">
                <div class="q-title">{{ index + 11 }}. {{ question.text }}</div>
                <div class="options-grid">
                  <div
                    v-for="(option, optionIndex) in question.options"
                    :key="optionIndex"
                    :class="{ 'correct-opt': optionIndex === question.correct }"
                  >
                    {{ String.fromCharCode(65 + optionIndex) }}. {{ option }}
                  </div>
                </div>
                <div class="explanation">💡 {{ question.explanation }}</div>
              </div>
            </div>
          </n-card>

          <n-card
            v-if="getQuestionsBySection('Translation').length"
            title="Part IV Translation"
            size="small"
            class="question-section"
          >
            <div v-for="question in getQuestionsBySection('Translation')" :key="question.id">
              <div class="question-text mb-2" v-html="renderRichText(question.text)"></div>
              <div class="script-box">
                <strong>参考译文：</strong>
                <p>{{ question.explanation }}</p>
              </div>
            </div>
          </n-card>
        </div>

        <div v-else class="empty-state"></div>
      </div>
    </n-spin>
  </n-modal>
</template>

<style scoped>
.modal-body {
  min-height: 200px;
}

.summary-card {
  margin-bottom: 16px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.content-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-section {
  background: transparent;
}

.stack-block {
  margin-bottom: 16px;
}

.stack-block:last-child {
  margin-bottom: 0;
}

.script-box {
  background: rgba(16, 185, 129, 0.1);
  border: 1px dashed rgba(16, 185, 129, 0.5);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.95em;
  color: #10b981;
  white-space: pre-wrap;
  line-height: 1.6;
}

.question-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
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

.options-grid > div {
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  color: #a1a1aa;
}

.options-grid > div:hover {
  background: rgba(255, 255, 255, 0.05);
}

.correct-opt {
  color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
  font-weight: 700;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.explanation {
  font-size: 0.9em;
  color: #a1a1aa;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 12px;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 6px;
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

:deep(.n-card) {
  background-color: rgba(30, 30, 35, 0.95);
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
