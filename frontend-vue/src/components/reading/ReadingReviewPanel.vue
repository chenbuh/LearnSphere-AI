<script setup>
import { NButton, NCard, NDivider, NIcon, NList, NListItem, NThing } from 'naive-ui'
import { ArrowLeft, CheckCircle2, MessageCircle, XCircle } from 'lucide-vue-next'

defineProps({
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
</script>

<template>
  <div class="review-container">
    <div class="back-button-container">
      <n-button secondary @click="emit('back')">
        <template #icon><n-icon :component="ArrowLeft" /></template>
        返回报告
      </n-button>
    </div>

    <n-card v-if="article" class="review-card" title="详细解析" :bordered="false">
      <div class="article-preview mb-6 secure-content">
        <h3 class="text-white mb-2">{{ article.title }}</h3>
        <div class="preview-text p-4 bg-black/20 rounded-lg">
          <p v-for="(para, idx) in article.content.split('\n')" :key="idx" class="mb-2 text-zinc-400">
            {{ para }}
          </p>
        </div>
      </div>

      <n-divider />

      <n-list>
        <n-list-item v-for="(q, idx) in article.questions" :key="idx">
          <n-thing :title="`Q${idx + 1}`">
            <template #description>
              <p class="mb-2 text-white">{{ q.text }}</p>
            </template>
            <div class="review-detail">
              <div class="your-answer mb-1">
                你的选择:
                <span :class="answers[idx] === q.correct ? 'success-text' : 'error-text'">
                  {{ q.options[answers[idx]] || '未作答' }}
                </span>
                <n-icon v-if="answers[idx] === q.correct" :component="CheckCircle2" color="#10b981" />
                <n-icon v-else :component="XCircle" color="#ef4444" />
              </div>
              <div class="correct-answer mb-2">正确答案: <span class="success-text">{{ q.options[q.correct] }}</span></div>
              <div class="explanation p-3 bg-zinc-800/50 rounded text-zinc-300">
                <div class="flex justify-between items-center mb-2">
                  <strong>解析：</strong>
                  <n-button size="tiny" secondary type="primary" @click="emit('openAiTutor', idx)">
                    <template #icon><n-icon :component="MessageCircle" /></template>
                    问问 AI 助手
                  </n-button>
                </div>
                {{ q.explanation || '暂无详细解析。' }}
              </div>
            </div>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<style scoped>
.review-card {
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.preview-text {
  font-family: 'Georgia', serif;
  line-height: 1.6;
}

.error-text {
  color: #ef4444;
  font-weight: bold;
}

.success-text {
  color: #10b981;
  font-weight: bold;
}

.review-detail {
  margin-top: 12px;
}
</style>
