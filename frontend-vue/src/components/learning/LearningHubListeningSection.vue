<script setup>
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { NButton, NIcon, NTag } from 'naive-ui'
import AudioPlayer from '@/components/AudioPlayer.vue'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  currentAudioLesson: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'view-all',
  'speed-change',
  'position-change',
  'bookmark-add',
  'note-add',
  'select-answer'
])

const questionCount = computed(() => props.currentAudioLesson?.questions?.length || 0)
const durationText = computed(() => {
  const duration = Number(props.currentAudioLesson?.duration || 0)
  if (!duration) return '自由练习'
  return `约 ${Math.max(1, Math.round(duration / 60))} 分钟`
})
const practiceHint = computed(() => {
  if (!questionCount.value) return '先完整听一遍，再按自己的节奏复听。'
  return `先完整听一遍，再完成 ${questionCount.value} 道巩固题。`
})

function normalizeOptionText(option) {
  if (typeof option === 'string' || typeof option === 'number') {
    return String(option)
  }

  if (option && typeof option === 'object') {
    return option.text || option.content || option.label || option.value || ''
  }

  return ''
}

function normalizeCorrectIndex(question) {
  const correct = question?.correctAnswer

  if (typeof correct === 'number' && Number.isFinite(correct)) {
    return correct
  }

  if (typeof correct === 'string') {
    const trimmed = correct.trim()
    if (!trimmed) return -1

    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed)
    }

    const letter = trimmed.charCodeAt(0) - 65
    if (letter >= 0 && letter < 26) {
      return letter
    }
  }

  return -1
}

function isOptionSelected(question, optionIndex) {
  return question?.userAnswer === optionIndex
}

function isOptionCorrect(question, optionIndex) {
  return question?.answered && normalizeCorrectIndex(question) === optionIndex
}

function isOptionWrong(question, optionIndex) {
  return question?.answered && question?.userAnswer === optionIndex && normalizeCorrectIndex(question) !== optionIndex
}

function getQuestionMeta(question) {
  if (question?.answered) {
    return question.correct ? '已作答，回答正确' : '已作答，建议复听'
  }

  const optionCount = Array.isArray(question?.options) ? question.options.length : 0
  return optionCount ? `${optionCount} 个选项待作答` : '进入专项训练后继续作答'
}
</script>

<template>
  <section class="listening-section">
    <div class="section-header">
      <div>
        <p class="section-kicker">今日精听</p>
        <h2 class="section-title">听力练习</h2>
        <p class="section-caption">可直接播放并完成快速练习。</p>
      </div>
      <n-button text @click="emit('view-all')">
        专项训练
        <template #icon>
          <n-icon :component="ArrowRight" size="16" />
        </template>
      </n-button>
    </div>

    <div v-if="currentAudioLesson" class="listening-workspace">
      <div class="listening-main">
        <div class="lesson-brief">
          <div class="lesson-copy">
            <h3 class="lesson-title">{{ currentAudioLesson.title || '今日精听训练' }}</h3>
            <p class="lesson-description">{{ practiceHint }}</p>
          </div>
          <div class="lesson-meta">
            <n-tag size="small" :bordered="false" type="info">{{ durationText }}</n-tag>
            <n-tag v-if="questionCount" size="small" :bordered="false" type="success">{{ questionCount }} 题</n-tag>
          </div>
        </div>

        <SkeletonWrapper :loading="loading" type="audio-player">
          <AudioPlayer
            :src="currentAudioLesson.url"
            :audio-text="currentAudioLesson.script || currentAudioLesson.title"
            :fallback-duration="currentAudioLesson.duration || 0"
            :initial-speed="1.0"
            :prefer-native-text-playback="true"
            @speed-change="emit('speed-change', $event)"
            @position-change="emit('position-change', $event)"
            @bookmark-add="emit('bookmark-add', $event)"
            @note-add="emit('note-add', $event)"
          />
        </SkeletonWrapper>
      </div>

      <aside v-if="questionCount" class="listening-preview">
        <div class="preview-header">
          <div>
            <p class="preview-kicker">边听边测</p>
            <h3 class="preview-title">巩固题预览</h3>
          </div>
          <n-tag size="small" :bordered="false" type="success">{{ questionCount }} 题</n-tag>
        </div>

        <div class="preview-summary">
          <p class="preview-summary-text">可先快速作答，再进入专项训练。</p>
          <div class="preview-metrics">
            <span class="preview-metric">{{ durationText }}</span>
            <span class="preview-metric">建议先听后答</span>
          </div>
        </div>

        <div class="listening-outline">
          <article
            v-for="(question, index) in currentAudioLesson.questions"
            :key="index"
            class="question-glance"
          >
            <div class="question-glance-head">
              <span class="question-number">题目 {{ index + 1 }}</span>
              <n-tag v-if="question.answered" size="small" :type="question.correct ? 'success' : 'error'">
                {{ question.correct ? '正确' : '错误' }}
              </n-tag>
              <span v-else class="question-glance-meta">{{ getQuestionMeta(question) }}</span>
            </div>
            <div class="question-content">{{ question.question }}</div>
            <div v-if="Array.isArray(question.options) && question.options.length" class="question-options">
              <button
                v-for="(option, optionIndex) in question.options"
                :key="`${index}-${optionIndex}`"
                type="button"
                class="question-option"
                :class="{
                  'question-option--selected': isOptionSelected(question, optionIndex),
                  'question-option--correct': isOptionCorrect(question, optionIndex),
                  'question-option--wrong': isOptionWrong(question, optionIndex)
                }"
                @click="emit('select-answer', index, optionIndex)"
              >
                <span class="question-option-key">{{ String.fromCharCode(65 + optionIndex) }}</span>
                <span class="question-option-text">{{ normalizeOptionText(option) }}</span>
              </button>
            </div>
            <div class="question-glance-footer">
              <span class="question-glance-meta">{{ getQuestionMeta(question) }}</span>
              <button type="button" class="question-glance-link" @click="emit('view-all')">专项训练</button>
            </div>
          </article>
        </div>

        <div class="questions-entry">
          <span class="questions-entry-copy">更多记录在专项训练页查看。</span>
          <n-button quaternary size="small" @click="emit('view-all')">
            查看题目
          </n-button>
        </div>
      </aside>
    </div>

    <div v-else-if="!loading" class="empty-state">
      今天可用的不重复听力素材已经取完
    </div>
  </section>
</template>

<style scoped>
.listening-section {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.section-kicker {
  margin: 0 0 6px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-size: 1.22rem;
  font-weight: 700;
  color: #f8fafc;
}

.section-caption {
  max-width: 30rem;
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.listening-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.46fr) minmax(250px, 0.62fr);
  gap: 20px;
  align-items: start;
}

.listening-main {
  min-width: 0;
}

.lesson-brief {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 0 0 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.listening-preview {
  min-width: 0;
  padding-left: 2px;
  border-left: 1px solid rgba(148, 163, 184, 0.1);
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.preview-kicker {
  margin: 0 0 6px;
  color: #67e8f9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.lesson-copy {
  min-width: 0;
}

.lesson-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.lesson-description {
  margin: 8px 0 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.preview-summary {
  padding: 0 0 12px 14px;
}

.preview-summary-text {
  margin: 0;
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.preview-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.preview-metric {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.2);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
}

.listening-outline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.empty-state {
  padding: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  text-align: center;
}

.question-glance {
  padding: 14px 0 14px 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: transparent;
  color: inherit;
  text-align: left;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.question-glance:first-child {
  border-top: 0;
}

.question-glance-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.question-number {
  font-size: 12px;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.question-content {
  margin: 0;
  color: #f8fafc;
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow-wrap: anywhere;
}

.question-options {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.question-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.2);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.question-option:hover {
  border-color: rgba(103, 232, 249, 0.28);
  background: rgba(15, 23, 42, 0.32);
  transform: translateY(-1px);
}

.question-option--selected {
  border-color: rgba(96, 165, 250, 0.45);
  background: rgba(37, 99, 235, 0.12);
}

.question-option--correct {
  border-color: rgba(45, 212, 191, 0.42);
  background: rgba(13, 148, 136, 0.14);
}

.question-option--wrong {
  border-color: rgba(248, 113, 113, 0.4);
  background: rgba(127, 29, 29, 0.18);
}

.question-option-key {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(103, 232, 249, 0.14);
  color: #67e8f9;
  font-size: 11px;
  font-weight: 700;
}

.question-option--selected .question-option-key,
.question-option--correct .question-option-key {
  background: rgba(255, 255, 255, 0.14);
  color: #f8fafc;
}

.question-option--wrong .question-option-key {
  background: rgba(248, 113, 113, 0.16);
  color: #fca5a5;
}

.question-option-text {
  color: #dbe4f0;
  font-size: 12px;
  line-height: 1.55;
  min-width: 0;
  overflow-wrap: anywhere;
}

.question-glance-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.question-glance-meta {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.question-glance-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.questions-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
  padding: 14px 0 0 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.questions-entry-copy {
  color: #cbd5e1;
  font-size: 13px;
  line-height: 1.6;
}

:global(html[data-theme='light'] .section-title),
:global(html[data-theme='light'] .preview-title),
:global(html[data-theme='light'] .lesson-title),
:global(html[data-theme='light'] .question-content) {
  color: #0f172a;
}

:global(html[data-theme='light'] .section-caption),
:global(html[data-theme='light'] .lesson-description),
:global(html[data-theme='light'] .preview-summary-text),
:global(html[data-theme='light'] .question-glance-meta),
:global(html[data-theme='light'] .questions-entry-copy) {
  color: #64748b;
}

:global(html[data-theme='light'] .lesson-brief),
:global(html[data-theme='light'] .listening-preview),
:global(html[data-theme='light'] .question-glance),
:global(html[data-theme='light'] .questions-entry) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .preview-metric) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
  color: #475569;
}

:global(html[data-theme='light'] .empty-state) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.82);
  color: #64748b;
}

:global(html[data-theme='light'] .question-number) {
  color: #334155;
}

:global(html[data-theme='light'] .question-option) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
}

:global(html[data-theme='light'] .question-option:hover) {
  border-color: rgba(56, 189, 248, 0.28);
  background: rgba(255, 255, 255, 0.98);
}

:global(html[data-theme='light'] .question-option--selected) {
  background: rgba(219, 234, 254, 0.76);
  border-color: rgba(59, 130, 246, 0.32);
}

:global(html[data-theme='light'] .question-option--correct) {
  background: rgba(220, 252, 231, 0.82);
  border-color: rgba(16, 185, 129, 0.28);
}

:global(html[data-theme='light'] .question-option--wrong) {
  background: rgba(254, 226, 226, 0.9);
  border-color: rgba(239, 68, 68, 0.24);
}

:global(html[data-theme='light'] .question-option-key) {
  background: rgba(224, 242, 254, 0.9);
  color: #0f766e;
}

:global(html[data-theme='light'] .question-option--selected .question-option-key),
:global(html[data-theme='light'] .question-option--correct .question-option-key) {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

:global(html[data-theme='light'] .question-option-text) {
  color: #334155;
}

:global(html[data-theme='light'] .question-glance-link) {
  color: #0f766e;
}

@media (min-width: 1280px) {
  .listening-workspace {
    grid-template-columns: minmax(0, 1.58fr) minmax(260px, 0.54fr);
    gap: 22px;
  }
}

@media (max-width: 1279px) {
  .listening-workspace {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .lesson-brief {
    flex-direction: column;
  }

  .lesson-meta {
    justify-content: flex-start;
  }

  .listening-preview {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
    padding-top: 16px;
  }

  .preview-summary,
  .question-glance,
  .questions-entry {
    padding-left: 0;
  }

  .questions-entry {
    margin-top: 0;
    padding-top: 14px;
  }
}

@media (max-width: 768px) {
  .listening-section {
    margin-bottom: 28px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 14px;
  }

  .section-caption {
    margin-top: 6px;
    font-size: 13px;
  }

  .listening-workspace {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .lesson-brief {
    flex-direction: column;
  }

  .lesson-meta {
    justify-content: flex-start;
  }

  .listening-preview {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .preview-summary,
  .question-glance,
  .questions-entry {
    padding-left: 0;
  }

  .question-content {
    font-size: 14px;
  }

  .question-option {
    padding: 10px;
  }

  .question-option-text {
    font-size: 12px;
  }

  .questions-entry {
    margin-top: 0;
    align-items: center;
    padding-top: 14px;
  }
}

@media (max-width: 640px) {
  .section-header :deep(.n-button) {
    width: 100%;
    justify-content: space-between;
  }

  .lesson-brief,
  .preview-header,
  .question-glance-head,
  .question-glance-footer,
  .questions-entry {
    align-items: flex-start;
    flex-direction: column;
  }

  .lesson-meta,
  .preview-metrics {
    justify-content: flex-start;
  }

  .question-glance-link {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  .questions-entry :deep(.n-button) {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .listening-workspace {
    gap: 14px;
  }

  .lesson-brief {
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 12px;
  }

  .listening-preview {
    padding-top: 14px;
  }

  .preview-summary {
    padding-bottom: 10px;
  }

  .question-glance {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .question-option {
    gap: 8px;
    padding: 10px;
    border-radius: 12px;
  }

  .question-option-key {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .preview-metric {
    max-width: 100%;
  }
}

@media (max-width: 360px) {
  .lesson-title,
  .preview-title {
    font-size: 0.96rem;
  }

  .lesson-description,
  .preview-summary-text,
  .questions-entry-copy,
  .question-content,
  .question-option-text,
  .question-glance-meta {
    font-size: 12px;
  }

  .question-option {
    align-items: flex-start;
  }

  .question-option-key {
    margin-top: 1px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .listening-workspace {
    gap: 14px;
  }

  .lesson-brief {
    gap: 12px;
  }

  .question-glance-head,
  .question-glance-footer,
  .questions-entry {
    flex-wrap: wrap;
  }
}
</style>
