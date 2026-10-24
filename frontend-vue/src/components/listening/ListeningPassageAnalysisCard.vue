<script setup>
import { NButton, NCard, NDivider, NIcon, NTag } from 'naive-ui'
import { BookOpen, Brain, CheckCircle2, MessageCircle, XCircle } from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  passage: {
    type: Object,
    required: true
  },
  passageIndex: {
    type: Number,
    default: 0
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  getGlobalNum: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['open-ai-tutor'])
</script>

<template>
  <div class="passage-analysis-card">
    <div class="analysis-card-shell">
      <div class="passage-head-banner">
        <span class="passage-badge">Passage {{ passageIndex + 1 }}</span>
        <h3 class="passage-title">{{ passage.title }}</h3>
      </div>

      <div class="script-box">
        <div class="script-head">
          <n-icon :component="BookOpen" size="18" />
          <span>{{ translate('听力原声文本与对照', 'Listening Transcript') }}</span>
        </div>
        <p class="script-text">{{ passage.script }}</p>
      </div>

      <div class="analysis-divider">
        <span class="divider-line"></span>
        <span class="divider-text">{{
          translate('题目深度解析与考点归纳', 'In-Depth Question Analysis')
        }}</span>
        <span class="divider-line"></span>
      </div>

      <div class="analysis-questions">
        <div
          v-for="(question, questionIndex) in passage.questions"
          :key="questionIndex"
          class="analysis-q-item"
        >
          <div class="q-header">
            <div
              class="q-status-tag"
              :class="
                answersPerPassage[passageIndex]?.[questionIndex] === question.correct
                  ? 'is-correct'
                  : 'is-wrong'
              "
            >
              <n-icon
                :component="
                  answersPerPassage[passageIndex]?.[questionIndex] === question.correct
                    ? CheckCircle2
                    : XCircle
                "
                size="14"
              />
              <span
                >{{ translate('题目', 'Question') }}
                {{ getGlobalNum(passageIndex, questionIndex) }}</span
              >
            </div>
            <span class="q-text">{{ question.question || question.text }}</span>
          </div>

          <div class="analysis-options">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="opt-item"
              :class="{
                correct: optionIndex === question.correct,
                wrong:
                  optionIndex === answersPerPassage[passageIndex]?.[questionIndex] &&
                  optionIndex !== question.correct
              }"
            >
              <span class="opt-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
              <span class="opt-content">{{ option }}</span>
              <n-icon
                v-if="optionIndex === question.correct"
                :component="CheckCircle2"
                class="status-icon"
                color="#10b981"
              />
              <n-icon
                v-if="
                  optionIndex === answersPerPassage[passageIndex]?.[questionIndex] &&
                  optionIndex !== question.correct
                "
                :component="XCircle"
                class="status-icon"
                color="#ef4444"
              />
            </div>
          </div>

          <div class="explanation-box">
            <div class="exp-title-row">
              <div class="exp-title">
                <n-icon :component="Brain" size="18" />
                <span>{{ translate('AI 专家解析', 'AI Expert Explanation') }}</span>
              </div>
              <n-button
                size="small"
                secondary
                type="primary"
                class="tutor-btn"
                @click="emit('open-ai-tutor', { passageIndex, questionIndex })"
              >
                <template #icon><n-icon :component="MessageCircle" /></template>
                {{ translate('问问 AI 助手', 'Ask AI Tutor') }}
              </n-button>
            </div>
            <p>
              {{
                question.explanation ||
                translate(
                  '该题目暂无详细解析内容，请根据原文理解。',
                  'No detailed explanation is available yet. Please refer to the transcript.'
                )
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.passage-analysis-card {
  margin-bottom: 24px;
}

.analysis-card-shell {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.passage-head-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.passage-badge {
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  background: rgba(251, 146, 60, 0.15);
  color: var(--tone-orange);
  border: 1px solid rgba(251, 146, 60, 0.3);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.passage-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-color);
}

.script-box {
  background: rgba(15, 23, 42, 0.5);
  padding: 22px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 28px;
}

.script-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--brand);
  font-weight: 700;
  font-size: 0.95rem;
}

.script-text {
  line-height: 1.85;
  color: var(--text-color);
  font-size: 1.02rem;
  white-space: pre-wrap;
  margin: 0;
}

.analysis-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 28px 0 20px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.divider-text {
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.analysis-questions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-q-item {
  background: rgba(15, 23, 42, 0.45);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.q-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.q-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 800;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  flex-shrink: 0;
}

.q-status-tag.is-correct {
  /* R5：底色 alpha 由 .15 降到 .10，稳过 4.5:1 */
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: var(--tone-emerald);
}

.q-status-tag.is-wrong {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: var(--tone-red);
}

.q-text {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1.5;
}

.analysis-options {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.opt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 23, 42, 0.35);
  position: relative;
  transition: all 0.2s ease;
}

.opt-item.correct {
  border-color: rgba(16, 185, 129, 0.6);
  background: rgba(16, 185, 129, 0.12);
}

.opt-item.wrong {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.12);
}

.opt-label {
  font-weight: 800;
  color: var(--secondary-text);
  width: 24px;
}

.opt-content {
  flex: 1;
  color: var(--text-color);
  font-size: 0.95rem;
}

.status-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.explanation-box {
  background: rgba(30, 107, 82, 0.08);
  border: 1px solid rgba(30, 107, 82, 0.25);
  border-left: 4px solid #2b7a60;
  padding: 18px;
  border-radius: var(--radius-md);
}

.exp-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  color: var(--brand);
  font-size: 0.95rem;
}

.tutor-btn {
  font-weight: 700;
}

.explanation-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .analysis-card-shell) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .passage-title),
:global(html[data-theme='light'] .q-text) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .script-box) {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .script-text) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .divider-line) {
  background: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .analysis-q-item) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .opt-item) {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .opt-content) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .explanation-box) {
  background: rgba(239, 246, 255, 0.9);
  border-color: rgba(30, 107, 82, 0.3);
  border-left-color: #0284c7;
}

:global(html[data-theme='light'] .explanation-box p) {
  color: var(--secondary-text);
}
</style>
