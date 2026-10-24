<script setup>
import { NButton, NCard, NIcon, NList, NListItem, NSpace, NTag, NThing, NResult } from 'naive-ui'
import { MessageCircle, Trophy } from 'lucide-vue-next'

defineProps({
  score: {
    type: Number,
    default: 0
  },
  showAll: {
    type: Boolean,
    default: false
  },
  reviewQuestions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['go-home', 'open-ai-tutor', 'restart', 'toggle-show-all'])
</script>

<template>
  <div class="result-container">
    <n-card class="score-card" :bordered="false">
      <n-result status="success" title="测试完成" :description="`你的得分为：${score}`">
        <template #icon>
          <n-icon :component="Trophy" size="80" color="#eab308" />
        </template>
        <template #footer>
          <n-space justify="center">
            <n-button @click="emit('go-home')">返回首页</n-button>
            <n-button @click="emit('restart')">再测一次</n-button>
            <n-button type="primary" @click="emit('toggle-show-all')">
              {{ showAll ? '收起详情' : '查看详情' }}
            </n-button>
          </n-space>
        </template>
      </n-result>
    </n-card>

    <n-card
      v-if="reviewQuestions.length > 0"
      :title="showAll ? '全卷回顾' : '错题回顾'"
      class="wrong-answers-card"
      :bordered="false"
    >
      <n-list>
        <n-list-item v-for="question in reviewQuestions" :key="question.id">
          <n-thing :title="question.word">
            <template #description>
              <span class="phonetic">/{{ question.phonetic }}/</span>
            </template>
            <div class="wrong-detail secure-content">
              <div class="flex justify-between items-start gap-4">
                <div class="flex-grow">
                  <div class="your-answer">
                    你的答案:
                    <span :class="question.isCorrect ? 'success-text' : 'error-text'">
                      {{ question.userAnswerDisplay }}
                    </span>
                    <n-tag v-if="question.isCorrect" type="success" size="small" class="ml-2"
                      >正确</n-tag
                    >
                  </div>
                  <div v-if="!question.isCorrect" class="correct-answer">
                    正确释义: <span class="success-text">{{ question.correct }}</span>
                  </div>
                </div>
                <n-button
                  size="tiny"
                  secondary
                  type="primary"
                  @click="emit('open-ai-tutor', question.sourceIndex)"
                >
                  <template #icon><n-icon :component="MessageCircle" /></template>
                  问问 AI
                </n-button>
              </div>
            </div>
          </n-thing>
        </n-list-item>
      </n-list>
    </n-card>
  </div>
</template>

<style scoped>
.score-card {
  margin-bottom: 24px;
  padding: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: var(--card-bg) !important;
  text-align: center;
}

.wrong-answers-card {
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: var(--card-bg) !important;
}

.wrong-detail {
  margin-top: 8px;
  color: var(--secondary-text);
  font-size: 0.92rem;
}

.error-text {
  color: var(--tone-red);
  font-weight: 600;
}

.success-text {
  color: var(--tone-emerald);
  font-weight: 600;
}

html[data-theme='light'] .score-card {
  border-color: rgba(148, 163, 184, 0.2) !important;
}

html[data-theme='light'] .wrong-answers-card {
  background: #ffffff !important;
  border-color: rgba(148, 163, 184, 0.2) !important;
}
</style>
