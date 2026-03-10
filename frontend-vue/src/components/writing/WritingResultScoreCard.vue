<template>
  <n-card class="score-card-premium" :bordered="false">
    <div class="score-dial">
      <n-progress
        type="circle"
        :percentage="displayScore"
        :color="displayScore >= 80 ? '#10b981' : displayScore >= 60 ? '#6366f1' : '#f43f5e'"
        :stroke-width="8"
        class="score-circle"
      >
        <div class="score-inner">
          <span class="score-num">{{ displayScore }}</span>
          <span class="score-label">OVERALL</span>
        </div>
      </n-progress>
    </div>
    <div class="score-feedback">
      <div class="flex justify-between items-center mb-1">
        <h3>评估完成</h3>
        <div class="flex items-center gap-2">
          <n-button size="tiny" secondary type="primary" @click="emit('open-tutor')">
            <template #icon><n-icon :component="MessageCircle" /></template>
            问问 AI 助手
          </n-button>
          <AIFeedback v-if="analysisResult && analysisResult.logId" :log-id="analysisResult.logId" />
        </div>
      </div>
      <p v-if="displayScore >= 80">精彩的表现！你的文章逻辑清晰，词汇使用非常地道。</p>
      <p v-else-if="displayScore >= 60">良好的开端，你的表达很清晰，但在某些语法细节上仍有进步空间。</p>
      <p v-else>别担心，这是成长必经之路。参考下方的 AI 建议进行针对性修改。</p>
      <n-space justify="center" vertical :size="12" class="mt-4">
        <n-space justify="center">
          <n-button @click="emit('restart')" secondary round>重新开始</n-button>
          <n-button type="primary" round class="export-btn shadow-glow-indigo">保存报告</n-button>
        </n-space>
        <n-button secondary round @click="emit('update:show-share', true)" class="share-btn">
          <template #icon>
            <n-icon :component="Share2" />
          </template>
          分享学习成果
        </n-button>
      </n-space>
    </div>
  </n-card>
</template>

<script setup>
import { NButton, NCard, NIcon, NProgress, NSpace } from 'naive-ui'
import { MessageCircle, Share2 } from 'lucide-vue-next'
import AIFeedback from '@/components/AIFeedback.vue'

defineProps({
  displayScore: {
    type: Number,
    default: 0
  },
  analysisResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['restart', 'open-tutor', 'update:show-share'])
</script>

<style scoped>
.score-card-premium {
  background: var(--card-bg);
  border-radius: 24px;
  text-align: center;
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.score-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-num {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-color);
  line-height: 1;
}

.score-label {
  font-size: 0.75rem;
  color: var(--secondary-text);
  margin-top: 5px;
  font-weight: bold;
}

.score-feedback h3 {
  margin-bottom: 12px;
  font-size: 1.5rem;
  color: var(--text-color);
}

.score-feedback p {
  color: var(--secondary-text);
  line-height: 1.6;
}

.shadow-glow-indigo {
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

@media (max-width: 900px) {
  .score-card-premium {
    padding: 32px;
  }
}
</style>