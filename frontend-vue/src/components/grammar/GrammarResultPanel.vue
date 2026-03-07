<script setup>
import { computed } from 'vue'
import { NButton, NCard, NGrid, NGridItem, NSpace, NTag } from 'naive-ui'
import { Award, MessageCircle, RotateCcw, Star, Target, Trophy } from 'lucide-vue-next'
import AIFeedback from '@/components/AIFeedback.vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  currentLogId: {
    type: [String, Number],
    default: null
  },
  earnedXP: {
    type: Number,
    default: 0
  },
  relatedTopics: {
    type: Array,
    default: () => []
  },
  learningAdvice: {
    type: [String, Object],
    default: null
  }
})

const emit = defineEmits(['restart', 'review', 'open-ai-tutor'])

const percentage = computed(() => {
  if (!props.totalQuestions) return 0
  return props.score / props.totalQuestions
})

const resultIcon = computed(() => {
  if (percentage.value >= 0.8) return Trophy
  if (percentage.value >= 0.6) return Award
  return Target
})

const resultIconColor = computed(() => {
  return percentage.value >= 0.6 ? '#f59e0b' : '#9ca3af'
})

const resultTitle = computed(() => {
  if (percentage.value >= 0.9) return '完美表现！'
  if (percentage.value >= 0.6) return '练习完成!'
  return '继续加油！'
})

const resultSubtitle = computed(() => {
  return percentage.value >= 0.8 ? '你的语法水平简直不可思议！' : '掌握度稳步提升中，再接再厉'
})
</script>

<template>
  <div class="result-container">
    <n-card class="result-card" :bordered="false">
      <div class="result-icon-wrapper">
        <n-icon :component="resultIcon" size="100" :color="resultIconColor" />
      </div>
      <h2 class="result-title">{{ resultTitle }}</h2>
      <p class="result-subtitle">{{ resultSubtitle }}</p>

      <div v-if="props.currentLogId" class="flex justify-center mb-4">
        <AIFeedback :log-id="props.currentLogId" />
      </div>

      <div v-if="props.score > 0" class="stars-row">
        <n-icon
          v-for="i in 3"
          :key="i"
          :component="Star"
          :size="32"
          :color="i <= Math.ceil(percentage * 3) ? '#f59e0b' : '#3f3f46'"
          :class="{ 'star-filled': i <= Math.ceil(percentage * 3) }"
        />
      </div>

      <n-grid x-gap="24" cols="2" class="stats-grid">
        <n-grid-item>
          <div class="stat-box">
            <div class="stat-value correct-rate">{{ Math.round(percentage * 100) }}%</div>
            <div class="stat-label">正确率</div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="stat-box">
            <div class="stat-value">{{ props.score }} <span class="dim">/{{ props.totalQuestions }}</span></div>
            <div class="stat-label">得分</div>
          </div>
        </n-grid-item>
      </n-grid>

      <div v-if="props.earnedXP > 0" class="xp-reward">
        <div class="xp-badge">+{{ props.earnedXP }} XP</div>
        <div class="xp-label">获得经验值</div>
      </div>

      <div v-if="props.relatedTopics && props.relatedTopics.length > 0" class="related-topics text-left mt-6" style="margin-top: 24px; text-align: left;">
        <h4 class="mb-2 related-title">📚 相关知识点推荐</h4>
        <n-space>
          <n-tag v-for="t in props.relatedTopics" :key="t.id" type="info" style="cursor: pointer;">
            {{ t.topic }} (难度: {{ t.difficultyLevel }}/5)
          </n-tag>
        </n-space>
      </div>

      <n-card
        v-if="props.learningAdvice"
        class="advice-card mt-4 mb-4 text-left"
        title="💡 AI 学习建议"
        size="small"
        :bordered="false"
        style="margin-top: 16px; margin-bottom: 16px; text-align: left; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);"
      >
        <p class="advice-text">{{ props.learningAdvice }}</p>
      </n-card>

      <div class="mt-4 mb-6" style="margin-top: 16px; margin-bottom: 24px;">
        <n-button @click="emit('open-ai-tutor')" type="primary" ghost size="large">
          <template #icon><n-icon :component="MessageCircle" /></template>
          需要进一步讲解？问问 AI 助手
        </n-button>
      </div>

      <n-space justify="center" size="large">
        <n-button size="large" @click="emit('restart')">
          <template #icon><n-icon :component="RotateCcw" /></template>
          返回首页
        </n-button>
        <n-button type="primary" color="#db2777" size="large" @click="emit('review')">
          回顾详细解析
        </n-button>
      </n-space>
    </n-card>
  </div>
</template>

<style scoped>
.result-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  width: 100%;
  max-width: 600px;
  text-align: center;
  background: var(--card-bg);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid var(--card-border);
}

.result-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.result-subtitle {
  color: #a1a1aa;
  margin-bottom: 40px;
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.star-filled {
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }

  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.stats-grid {
  margin-bottom: 40px;
}

.stat-box {
  background: var(--accent-fill);
  border-radius: 12px;
  padding: 20px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-value.correct-rate {
  color: #4ade80;
}

.stat-label {
  font-size: 0.8rem;
  color: #71717a;
  text-transform: uppercase;
}

.dim {
  font-size: 1.2rem;
  color: var(--secondary-text);
}

.xp-reward {
  text-align: center;
  margin: 20px 0;
}

.xp-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fcd34d, #f59e0b);
  color: #78350f;
  padding: 4px 16px;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  animation: slideUp 0.6s ease-out;
}

.xp-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-top: 4px;
}

@keyframes slideUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.related-title {
  font-size: 16px;
  margin-bottom: 12px;
  color: #f9fafb;
}

.advice-text {
  white-space: pre-wrap;
  font-size: 0.9em;
  color: #d1d5db;
  line-height: 1.8;
}

@media (max-width: 768px) {
  .result-card {
    padding: 20px !important;
  }

  .result-title {
    font-size: 1.5rem !important;
  }

  .stat-value {
    font-size: 2rem !important;
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 1.4rem !important;
  }

  .stat-label {
    font-size: 0.8rem !important;
  }
}
</style>
