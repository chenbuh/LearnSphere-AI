<template>
  <div class="result-container">
    <n-card v-if="evaluationResult" class="score-card" :bordered="false">
      <n-result
        status="success"
        :title="translate('评估完成', 'Evaluation Complete')"
        :description="`${translate('总分', 'Overall Score')}: ${evaluationResult.score}`"
      >
        <template #footer>
          <div class="flex justify-center mb-4">
            <AIFeedback v-if="evaluationResult.logId" :log-id="evaluationResult.logId" />
          </div>
          <n-space justify="center" size="large">
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="evaluationResult.fluency" color="#6366f1" :width="80">
                <span class="text-xs text-gray-400">{{ translate('流利度', 'Fluency') }}</span><br />
                <span class="text-lg font-bold">{{ evaluationResult.fluency }}</span>
              </n-progress>
            </div>
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="evaluationResult.vocabulary" color="#10b981" :width="80">
                <span class="text-xs text-gray-400">{{ translate('词汇', 'Vocab') }}</span><br />
                <span class="text-lg font-bold">{{ evaluationResult.vocabulary }}</span>
              </n-progress>
            </div>
            <div class="stat-item text-center">
              <n-progress type="circle" :percentage="evaluationResult.grammar" color="#f59e0b" :width="80">
                <span class="text-xs text-gray-400">{{ translate('语法', 'Grammar') }}</span><br />
                <span class="text-lg font-bold">{{ evaluationResult.grammar }}</span>
              </n-progress>
            </div>
          </n-space>
        </template>
      </n-result>

      <div class="feedback-text text-lg text-gray-200 mb-6 p-4 bg-white/5 rounded-lg secure-content">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-400">{{ translate('评语', 'FEEDBACK') }}</span>
          <n-button size="tiny" secondary type="primary" @click="emit('open-tutor')">
            <template #icon><n-icon :component="MessageCircle" /></template>
            {{ translate('咨询 AI 导师', 'Ask AI Tutor') }}
          </n-button>
        </div>
        {{ evaluationResult.feedback }}
      </div>

      <h3 class="text-indigo-400 mb-2 flex items-center gap-2"><n-icon :component="CheckCircle2" /> {{ translate('改进建议', 'Suggestions') }}</h3>
      <n-list class="secure-content">
        <n-list-item v-for="(suggestion, index) in evaluationResult.suggestions" :key="index">
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
import { NButton, NCard, NIcon, NList, NListItem, NProgress, NResult, NSpace } from 'naive-ui'
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
