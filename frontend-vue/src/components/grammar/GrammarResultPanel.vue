<script setup>
import { computed } from 'vue'
import { NButton, NCard, NGrid, NGridItem, NSpace, NTag, NIcon } from 'naive-ui'
import { Award, MessageCircle, RotateCcw, Star, Target, Trophy, Sparkles, BookOpen } from 'lucide-vue-next'
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
  return percentage.value >= 0.6 ? '#f59e0b' : '#38bdf8'
})

const resultTitle = computed(() => {
  if (percentage.value >= 0.9) return '完美掌控 · 语法宗师！'
  if (percentage.value >= 0.6) return '特训达成 · 表现优异！'
  return '巩固完成 · 仍需强化！'
})

const resultSubtitle = computed(() => {
  return percentage.value >= 0.8
    ? '你的核心语法语感非常扎实，错题率极低，保持这种节奏！'
    : '已覆盖关键考点，建议回顾错题解析，彻底打通易混盲区。'
})
</script>

<template>
  <div class="result-container">
    <div class="result-card">
      <div class="result-halo-wrap">
        <div class="result-halo-ring"></div>
        <div class="result-icon-wrapper">
          <n-icon :component="resultIcon" size="64" :color="resultIconColor" />
        </div>
      </div>

      <div class="result-kicker">
        <Sparkles :size="14" />
        <span>特训报告总结</span>
      </div>

      <h2 class="result-title">{{ resultTitle }}</h2>
      <p class="result-subtitle">{{ resultSubtitle }}</p>

      <div v-if="props.currentLogId" class="feedback-wrapper">
        <AIFeedback :log-id="props.currentLogId" />
      </div>

      <div v-if="props.score > 0" class="stars-row">
        <n-icon
          v-for="i in 3"
          :key="i"
          :component="Star"
          :size="30"
          :color="i <= Math.ceil(percentage * 3) ? '#f59e0b' : '#334155'"
          :class="{ 'star-filled': i <= Math.ceil(percentage * 3) }"
        />
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value correct-rate">{{ Math.round(percentage * 100) }}%</div>
          <div class="stat-label">本次正确率</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">
            {{ props.score }} <span class="dim">/ {{ props.totalQuestions }}</span>
          </div>
          <div class="stat-label">得分 / 总题量</div>
        </div>
      </div>

      <div v-if="props.earnedXP > 0" class="xp-reward">
        <div class="xp-badge">+{{ props.earnedXP }} XP 经验增益</div>
      </div>

      <div v-if="props.relatedTopics && props.relatedTopics.length > 0" class="related-topics">
        <h4 class="related-title">
          <BookOpen :size="16" />
          <span>相关推荐进阶知识点</span>
        </h4>
        <div class="topics-tags-wrap">
          <n-tag
            v-for="t in props.relatedTopics"
            :key="t.id"
            round
            :bordered="false"
            class="topic-recommend-tag"
          >
            {{ t.topic }} <small>(难度 {{ t.difficultyLevel }}/5)</small>
          </n-tag>
        </div>
      </div>

      <div v-if="props.learningAdvice" class="advice-panel">
        <div class="advice-head">
          <Sparkles :size="16" />
          <span>AI 语法智能诊断建议</span>
        </div>
        <p class="advice-text">{{ props.learningAdvice }}</p>
      </div>

      <div class="ai-ask-bar">
        <n-button @click="emit('open-ai-tutor')" ghost size="large" class="ai-ask-btn">
          <template #icon><MessageCircle :size="18" /></template>
          对错题有疑问？召唤 AI 助教答疑
        </n-button>
      </div>

      <div class="result-actions">
        <n-button size="large" class="restart-btn" @click="emit('restart')">
          <template #icon><RotateCcw :size="16" /></template>
          返回重选主题
        </n-button>
        <n-button type="primary" size="large" class="review-btn glow-btn" @click="emit('review')">
          回顾详细解析
        </n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
}

.result-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 680px;
  text-align: center;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  padding: 44px 36px;
}

.result-halo-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-halo-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 1.5px dashed rgba(249, 115, 22, 0.35);
  animation: spinRing 24s linear infinite;
}

.result-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(249, 115, 22, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: var(--tone-orange);
  font-size: 0.76rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.result-title {
  font-size: clamp(1.6rem, 2.4vw, 2.1rem);
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 0 0 10px;
  background: none;
  color: inherit;
}

.result-subtitle {
  color: var(--secondary-text);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 24px;
}

.stars-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}

.star-filled {
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-lg);
  padding: 18px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--text-color);
  line-height: 1;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}

.stat-value.correct-rate {
  color: var(--tone-emerald);
}

.stat-label {
  font-size: 0.78rem;
  color: var(--secondary-text);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dim {
  font-size: 1.1rem;
  color: var(--secondary-text);
  font-weight: 500;
}

.xp-badge {
  display: inline-block;
  background: #fcd34d;
  color: #78350f;
  padding: 6px 18px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 0.95rem;
  margin-bottom: 24px;
}

.related-topics {
  text-align: left;
  margin-bottom: 20px;
  padding: 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.related-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--text-color);
}

.topics-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-recommend-tag {
  background: rgba(30, 107, 82, 0.12) !important;
  color: var(--brand) !important;
  border: 1px solid rgba(30, 107, 82, 0.2) !important;
  font-weight: 600;
}

.advice-panel {
  text-align: left;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background: transparent;
  border: 1px solid rgba(52, 211, 153, 0.18);
  margin-bottom: 24px;
}

.advice-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tone-emerald);
  font-size: 0.85rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.advice-text {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.92rem;
  line-height: 1.65;
}

.ai-ask-bar {
  margin-bottom: 26px;
}

.ai-ask-btn {
  border-radius: var(--radius-lg);
  font-weight: 700;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.restart-btn {
  min-width: 150px;
  height: 46px;
  border-radius: var(--radius-lg);
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-color);
}

.glow-btn {
  min-width: 160px;
  height: 46px;
  border-radius: var(--radius-lg);
  font-weight: 800;
  background: #f97316 !important;
  border: none !important;
  color: #40200a !important;
  transition: all 0.25s ease;
}

.glow-btn:hover {
  transform: translateY(-2px);
}

@keyframes spinRing {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes popIn {
  0% { transform: scale(0) rotate(-180deg); opacity: 0; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* ================== 浅色模式适配 (Light Theme) ================== */
html[data-theme='light'] .result-card {
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .result-title {
  background: none;
  color: inherit;
}

html[data-theme='light'] .result-subtitle {
  color: var(--secondary-text);
}

html[data-theme='light'] .stat-box,
html[data-theme='light'] .related-topics {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.92);
}

html[data-theme='light'] .stat-value,
html[data-theme='light'] .related-title {
  color: var(--text-color);
}

html[data-theme='light'] .advice-text {
  color: var(--secondary-text);
}

html[data-theme='light'] .restart-btn {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .result-card {
    padding: 24px 18px;
  }

  .result-actions {
    flex-direction: column;
    width: 100%;
  }

  .restart-btn,
  .glow-btn {
    width: 100%;
  }
}
</style>
