<script setup>
import { computed } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { NButton, NIcon, NTag } from 'naive-ui'
import AudioPlayer from '@/components/AudioPlayer.vue'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'
import { useThemeStore } from '@/stores/theme'

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

const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.isLight)
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
const lessonPlaybackText = computed(() => {
  const lesson = props.currentAudioLesson
  if (!lesson) return ''

  return (
    [
      lesson.script,
      lesson.audioScript,
      lesson.transcript,
      lesson.transcription,
      lesson.passage,
      lesson.content,
      lesson.text,
      lesson.description,
      lesson.title
    ].find(value => typeof value === 'string' && value.trim()) || ''
  )
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
  return (
    question?.answered &&
    question?.userAnswer === optionIndex &&
    normalizeCorrectIndex(question) !== optionIndex
  )
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
  <section :class="['listening-section', { 'listening-section--light': isLightTheme }]">
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
            <n-tag v-if="questionCount" size="small" :bordered="false" type="success"
              >{{ questionCount }} 题</n-tag
            >
          </div>
        </div>

        <SkeletonWrapper :loading="loading" type="audio-player">
          <AudioPlayer
            :src="currentAudioLesson.url"
            :audio-text="lessonPlaybackText"
            :fallback-duration="currentAudioLesson.duration || 0"
            :initial-speed="1.0"
            :prefer-native-text-playback="false"
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
              <n-tag
                v-if="question.answered"
                size="small"
                :type="question.correct ? 'success' : 'error'"
              >
                {{ question.correct ? '正确' : '错误' }}
              </n-tag>
              <span v-else class="question-glance-meta">{{ getQuestionMeta(question) }}</span>
            </div>
            <div class="question-content">{{ question.question }}</div>
            <div
              v-if="Array.isArray(question.options) && question.options.length"
              class="question-options"
            >
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
              <button type="button" class="question-glance-link" @click="emit('view-all')">
                专项训练
              </button>
            </div>
          </article>
        </div>

        <div class="questions-entry">
          <span class="questions-entry-copy">更多记录在专项训练页查看。</span>
          <n-button quaternary size="small" @click="emit('view-all')"> 查看题目 </n-button>
        </div>
      </aside>
    </div>

    <div v-else-if="!loading" class="empty-state">今天可用的不重复听力素材已经取完</div>
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
  color: var(--text-color);
}

.section-caption {
  max-width: 30rem;
  margin: 8px 0 0;
  color: var(--secondary-text);
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.listening-workspace {
  display: grid;
  grid-template-columns: 1fr;
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
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
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
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.lesson-copy {
  min-width: 0;
}

.lesson-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.lesson-description {
  margin: 8px 0 0;
  color: var(--secondary-text);
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
  padding: 0 0 12px;
}

.preview-summary-text {
  margin: 0;
  color: var(--secondary-text);
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
  color: var(--secondary-text);
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
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  text-align: center;
}

.question-glance {
  padding: 14px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: transparent;
  color: inherit;
  text-align: left;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
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
  color: var(--text-color);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.question-content {
  margin: 0;
  color: var(--text-color);
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
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.2);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
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
  color: var(--text-color);
}

.question-option--wrong .question-option-key {
  background: rgba(248, 113, 113, 0.16);
  color: var(--tone-red);
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
  color: var(--secondary-text);
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
  padding: 14px 0 0;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.questions-entry-copy {
  color: var(--secondary-text);
  font-size: 13px;
  line-height: 1.6;
}

.listening-section--light .section-title,
.listening-section--light .preview-title,
.listening-section--light .lesson-title,
.listening-section--light .question-content {
  color: #0f172a;
}

.listening-section--light .section-caption,
.listening-section--light .lesson-description,
.listening-section--light .preview-summary-text,
.listening-section--light .question-glance-meta,
.listening-section--light .questions-entry-copy {
  color: var(--secondary-text);
}

.listening-section--light .lesson-brief,
.listening-section--light .listening-preview,
.listening-section--light .question-glance,
.listening-section--light .questions-entry {
  border-color: rgba(148, 163, 184, 0.16);
}

.listening-section--light .preview-metric {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
  color: #475569;
}

.listening-section--light .empty-state {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.82);
  color: var(--secondary-text);
}

.listening-section--light .question-number {
  color: #334155;
}

.listening-section--light .question-option {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
}

.listening-section--light .question-option:hover {
  border-color: rgba(30, 107, 82, 0.28);
  background: rgba(255, 255, 255, 0.98);
}

.listening-section--light .question-option--selected {
  background: rgba(219, 234, 254, 0.76);
  border-color: rgba(59, 130, 246, 0.32);
}

.listening-section--light .question-option--correct {
  background: rgba(220, 252, 231, 0.82);
  border-color: rgba(16, 185, 129, 0.28);
}

.listening-section--light .question-option--wrong {
  background: rgba(254, 226, 226, 0.9);
  border-color: rgba(239, 68, 68, 0.24);
}

.listening-section--light .question-option-key {
  background: rgba(224, 242, 254, 0.9);
  color: #0f766e;
}

.listening-section--light .question-option--selected .question-option-key,
.listening-section--light .question-option--correct .question-option-key {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.listening-section--light .question-option-text {
  color: #334155;
}

.listening-section--light .question-glance-link {
  color: #0f766e;
}

@media (min-width: 1280px) {
  .listening-workspace {
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
    padding-top: 16px;
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
    border-radius: var(--radius-md);
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
  /* 360px 段落原先会把标题压到 15px、正文压到 12px，这里按可读性下限兜底。 */
  .lesson-title,
  .preview-title {
    font-size: max(0.96rem, 16px);
  }

  .lesson-description,
  .preview-summary-text,
  .questions-entry-copy,
  .question-content,
  .question-option-text,
  .question-glance-meta,
  .question-number {
    font-size: max(0.75rem, 13px);
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

/*
 * 窄屏收口：
 * 1) 单列时 section-header 内的按钮不再撑满，与标题同行会挤压副标题；
 * 2) “专项训练”文字按钮实测 30px 高，补到 36px；
 * 3) 选项文本 12px 偏小，正文不低于 13px。
 */
@media (max-width: 900px) {
  .section-header {
    min-width: 0;
  }

  .section-header > div {
    min-width: 0;
  }

  .section-header :deep(.n-button) {
    min-height: 36px;
  }

  .section-title {
    overflow-wrap: anywhere;
  }

  .preview-header > div,
  .lesson-copy {
    min-width: 0;
  }

  /*
   * 根字号只有 14.08px，lesson-title / preview-title 的 1rem 实际约 13.5px，
   * 窄屏按标题下限补到 16px；正文与选项文本不低于 13px。
   */
  .lesson-title,
  .preview-title {
    font-size: max(1rem, 16px);
    line-height: 1.35;
  }

  .question-content,
  .question-option-text,
  .question-glance-meta,
  .question-number,
  .lesson-description,
  .preview-summary-text,
  .questions-entry-copy {
    font-size: max(0.8125rem, 13px);
  }
}

@media (max-width: 640px) {
  .preview-kicker {
    font-size: 12px;
  }
}
</style>
