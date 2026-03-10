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
                    <n-tag v-if="question.isCorrect" type="success" size="small" class="ml-2">正确</n-tag>
                  </div>
                  <div v-if="!question.isCorrect" class="correct-answer">
                    正确释义: <span class="success-text">{{ question.correct }}</span>
                  </div>
                </div>
                <n-button size="tiny" secondary type="primary" @click="emit('open-ai-tutor', question.sourceIndex)">
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
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.03);
  text-align: center;
}

:global(.dark-mode) .score-card {
  background: #18181c;
}

.wrong-answers-card {
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark-mode) .wrong-answers-card {
  background: #18181c;
}

.wrong-detail {
  margin-top: 8px;
  color: #52525b;
  font-size: 0.9rem;
}

:global(.dark-mode) .wrong-detail {
  color: #a1a1aa;
}

.error-text {
  color: #ef4444;
}

.success-text {
  color: #10b981;
}
</style>
