<template>
  <div class="result-container">
    <n-card v-if="evaluationResult" class="score-card" :bordered="false">
      <n-result
        status="success"
        :title="translate('评估完成', 'Evaluation Complete')"
        :description="`${translate('总分', 'Overall Score')}: ${normalizedScore}`"
      >
        <template #footer>
          <div class="flex justify-center mb-4">
            <AIFeedback v-if="evaluationResult.logId" :log-id="evaluationResult.logId" />
          </div>
          <n-space justify="center" size="large">
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="normalizedFluency" color="#6366f1" :width="80">
                <span class="text-xs text-gray-400">{{ translate('流利度', 'Fluency') }}</span><br />
                <span class="text-lg font-bold">{{ normalizedFluency }}</span>
              </n-progress>
            </div>
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="normalizedVocabulary" color="#10b981" :width="80">
                <span class="text-xs text-gray-400">{{ translate('词汇', 'Vocab') }}</span><br />
                <span class="text-lg font-bold">{{ normalizedVocabulary }}</span>
              </n-progress>
            </div>
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="normalizedGrammar" color="#f59e0b" :width="80">
                <span class="text-xs text-gray-400">{{ translate('语法', 'Grammar') }}</span><br />
                <span class="text-lg font-bold">{{ normalizedGrammar }}</span>
              </n-progress>
            </div>
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="normalizedRelevance" color="#ef4444" :width="80">
                <span class="text-xs text-gray-400">{{ translate('切题度', 'Relevance') }}</span><br />
                <span class="text-lg font-bold">{{ normalizedRelevance }}</span>
              </n-progress>
            </div>
          </n-space>
        </template>
      </n-result>

      <n-alert
        v-if="normalizedRelevance <= 40"
        type="warning"
        class="mb-6 text-left"
        :bordered="false"
      >
        {{ relevanceWarningText }}
      </n-alert>

      <div class="feedback-text text-lg text-gray-200 mb-6 p-4 bg-white/5 rounded-lg secure-content">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-400">{{ translate('评语', 'FEEDBACK') }}</span>
          <n-button size="tiny" secondary type="primary" @click="emit('open-tutor')">
            <template #icon><n-icon :component="MessageCircle" /></template>
            {{ translate('咨询 AI 导师', 'Ask AI Tutor') }}
          </n-button>
        </div>
        {{ normalizedFeedback }}
      </div>

      <h3 class="text-indigo-400 mb-2 flex items-center gap-2"><n-icon :component="CheckCircle2" /> {{ translate('改进建议', 'Suggestions') }}</h3>
      <n-list class="secure-content">
        <n-list-item v-for="(suggestion, index) in normalizedSuggestions" :key="index">
          {{ suggestion }}
        </n-list-item>
      </n-list>

      <div class="mt-8 text-center">
        <n-space justify="center" vertical :size="12">
          <n-button type="primary" size="large" @click="emit('restart')">{{ translate('再练一个话题', 'Practice Another Topic') }}</n-button>
          <n-button secondary size="large" class="share-btn" @click="shareVisible = true">
            <template #icon>
              <n-icon :component="Share2" />
            </template>
            {{ translate('分享结果', 'Share Result') }}
          </n-button>
        </n-space>
      </div>
    </n-card>

    <ShareModal
      v-model:show="shareVisible"
      :title="shareContent.title"
      :description="shareContent.description"
      :url="shareContent.url"
    />

    <SpeakingHistoryPanel
      :topics="historyTopics"
      :total="historyTotal"
      :page="historyPage"
      :page-size="historyPageSize"
      :translate="translate"
      :show-date="false"
      @select="emit('select-history', $event)"
      @update:page="emit('update:historyPage', $event)"
      @update:page-size="emit('update:historyPageSize', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NAlert, NButton, NCard, NIcon, NList, NListItem, NProgress, NResult, NSpace } from 'naive-ui'
import { CheckCircle2, MessageCircle, Share2 } from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import AIFeedback from '@/components/AIFeedback.vue'
import SpeakingHistoryPanel from '@/components/speaking/SpeakingHistoryPanel.vue'

const props = defineProps({
  evaluationResult: {
    type: Object,
    default: null
  },
  showShare: {
    type: Boolean,
    default: false
  },
  shareContent: {
    type: Object,
    default: () => ({ title: '', description: '', url: '' })
  },
  historyTopics: {
    type: Array,
    default: () => []
  },
  historyTotal: {
    type: Number,
    default: 0
  },
  historyPage: {
    type: Number,
    default: 1
  },
  historyPageSize: {
    type: Number,
    default: 6
  },
  translate: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'restart',
  'open-tutor',
  'update:showShare',
  'select-history',
  'update:historyPage',
  'update:historyPageSize'
])

const normalizeScore = (value, fallback = 0) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }
  return Math.max(0, Math.min(100, Math.round(parsed)))
}

const normalizeFeedback = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }
  if (Array.isArray(value)) {
    const merged = value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim()
        }
        return item?.text ? String(item.text).trim() : ''
      })
      .filter(Boolean)
      .join(' ')
    return merged.trim()
  }
  return ''
}

const normalizeSuggestions = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim()
        }
        return item?.text ? String(item.text).trim() : ''
      })
      .filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/[\r\n;；]+/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

const normalizedScore = computed(() => normalizeScore(props.evaluationResult?.score, 75))
const normalizedFluency = computed(() => normalizeScore(props.evaluationResult?.fluency, normalizedScore.value))
const normalizedVocabulary = computed(() => normalizeScore(props.evaluationResult?.vocabulary, normalizedScore.value))
const normalizedGrammar = computed(() => normalizeScore(props.evaluationResult?.grammar, normalizedScore.value))
const normalizedRelevance = computed(() => normalizeScore(props.evaluationResult?.relevance, normalizedScore.value))
const relevanceWarningText = computed(() => {
  if (normalizedRelevance.value <= 0 || normalizedScore.value <= 0) {
    return props.translate(
      '本次回答与题目完全不相干，系统已按 0 分处理。请先直接回应题干核心要求，再补充细节。',
      'This response is completely off-topic, so it has been scored as 0. Address the core prompt first, then add details.'
    )
  }

  return props.translate(
    '本次回答与题目相关性偏低，系统已按跑题情况压低总分。建议先紧扣题干核心要求，再展开细节。',
    'This response is weakly related to the prompt, so the score has been reduced for being off-topic. Answer the core prompt first, then add details.'
  )
})
const normalizedFeedback = computed(() => {
  if (normalizedRelevance.value <= 0 || normalizedScore.value <= 0) {
    return props.translate(
      '你的回答与题目要求完全不相干，本次作答按 0 分处理。当前最核心的问题不是语言形式，而是没有回应题目本身。请先围绕题干直接作答，再补充细节。',
      'Your response is completely off-topic, so this attempt has been scored as 0. The main issue is not language form but failing to address the prompt itself. Answer the prompt directly first, then add details.'
    )
  }

  if (normalizedRelevance.value <= 25) {
    return props.translate(
      '你的回答与题目要求明显不相关，当前主要问题不是语言形式，而是没有围绕题干作答。请先准确回应题目核心，再展开细节。',
      'Your response is clearly unrelated to the prompt. The main issue is not language form but failing to answer the prompt directly. Address the core requirement first, then expand with details.'
    )
  }

  if (normalizedRelevance.value <= 40) {
    return props.translate(
      '你的回答只有部分内容贴合题目，存在明显跑题。建议先紧扣题目核心要求，再补充例子和细节。',
      'Only part of your response matches the prompt, and it goes off-topic noticeably. Stay with the core requirement first, then add examples and details.'
    )
  }

  const feedback = normalizeFeedback(props.evaluationResult?.feedback)
  return feedback || props.translate('已完成评估，继续根据建议优化表达。', 'Evaluation completed. Keep refining your response based on the suggestions below.')
})
const normalizedSuggestions = computed(() => {
  const suggestions = normalizeSuggestions(props.evaluationResult?.suggestions)
  if (suggestions.length) {
    return suggestions
  }
  return [
    props.translate('先直接回应题目核心要求，再补充例子。', 'Answer the core prompt directly before adding examples.'),
    props.translate('多使用连接词提升连贯性。', 'Use more linking phrases to improve coherence.'),
    props.translate('复述时检查语法和时态准确性。', 'Review grammar and tense accuracy when you speak again.')
  ]
})

const shareVisible = computed({
  get: () => props.showShare,
  set: (value) => emit('update:showShare', value)
})
</script>

<style scoped>
.score-card {
  border-radius: 24px;
  text-align: center;
}

.feedback-text {
  background: var(--accent-fill);
  color: var(--text-color);
  padding: 16px;
  border-radius: 8px;
}
</style>
