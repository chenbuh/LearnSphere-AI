<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { MessageCircleMore, Share2, Award, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  isEnglish: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['restart', 'view-analysis', 'share'])

const resultTitle = computed(() => {
  return props.isEnglish
    ? `Practice completed! Score: ${props.score}`
    : `练习已完成! 得分: ${props.score}`
})

const resultDescription = computed(() => {
  return props.score >= 60
    ? props.translate('表现优异！继续保持语感与听力节奏。', 'Great work, keep it up!')
    : props.translate(
        '听力技巧仍有提升空间，建议查阅精听解析。',
        'Keep practicing, review analysis to spot comprehension gaps.'
      )
})

const scoreGrade = computed(() => {
  if (props.score >= 85) return props.translate('优秀', 'Excellent')
  if (props.score >= 70) return props.translate('良好', 'Good')
  if (props.score >= 60) return props.translate('合格', 'Pass')
  return props.translate('待加强', 'Needs Work')
})

const scoreColorClass = computed(() => {
  if (props.score >= 85) return 'grade-high'
  if (props.score >= 60) return 'grade-mid'
  return 'grade-low'
})
</script>

<template>
  <section class="result-card">
    <div class="result-head">
      <div class="kicker-wrap">
        <span class="kicker-dot"></span>
        <p class="result-kicker">Listening Report · 成绩单</p>
      </div>
      <h2 class="result-title">{{ resultTitle }}</h2>
      <p class="result-description">{{ resultDescription }}</p>
    </div>

    <div class="result-hero">
      <div class="score-circle-wrap">
        <div class="score-circle-outer" :class="scoreColorClass">
          <div class="score-circle-inner">
            <span class="val">{{ score }}</span>
            <span class="unit">分</span>
          </div>
        </div>
      </div>

      <div class="result-meta">
        <div class="result-meta-item">
          <span class="meta-label">{{ props.translate('等级评定', 'Grade') }}</span>
          <strong class="meta-value">{{ scoreGrade }}</strong>
        </div>
        <div class="result-meta-item">
          <span class="meta-label">{{ props.translate('下一步建议', 'Next Step') }}</span>
          <strong class="meta-value">{{
            props.translate('查阅逐题精析', 'Review Analysis')
          }}</strong>
        </div>
      </div>
    </div>

    <div class="result-actions">
      <n-button type="primary" class="primary-btn" @click="emit('view-analysis')">
        <template #icon><n-icon :component="MessageCircleMore" /></template>
        {{ props.translate('查看详细解析', 'Detailed Analysis') }}
      </n-button>
      <n-button secondary class="action-btn" @click="emit('restart')">
        <template #icon><n-icon :component="RotateCcw" /></template>
        {{ props.translate('再练一次', 'Practice Again') }}
      </n-button>
      <n-button secondary @click="emit('share')" class="action-btn share-btn">
        <template #icon>
          <n-icon :component="Share2" />
        </template>
        {{ props.translate('分享学习成果', 'Share Learning Result') }}
      </n-button>
    </div>
  </section>
</template>

<style scoped>
.result-card {
  display: grid;
  gap: 24px;
  padding: 32px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.result-head {
  display: grid;
  gap: 8px;
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fb923c;
}

.result-kicker {
  margin: 0;
  color: var(--tone-orange);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.result-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.35;
}

.result-description {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
}

.result-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 28px;
  align-items: center;
  padding: 12px 0;
}

.score-circle-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-circle-outer {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.score-circle-outer.grade-high {
  background: var(--card-bg);
}

.score-circle-outer.grade-low {
  background: var(--card-bg);
}

.score-circle-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.85);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.score-circle-inner .val {
  font-size: 3.2rem;
  font-weight: 900;
  color: var(--text-color);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.score-circle-inner .unit {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--secondary-text);
  margin-left: 2px;
}

.result-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.result-meta-item {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.5);
}

.meta-label {
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-value {
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.35;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.primary-btn {
  background: #fb923c !important;
  /* 实心橙底固定深色 ink，修正白字 2:1 */
  color: #40200a !important;
  border: none !important;
  font-weight: 700;
  height: 42px;
  border-radius: var(--radius-md);
}

.action-btn {
  height: 42px;
  border-radius: var(--radius-md);
  font-weight: 600;
}

:global(html[data-theme='light'] .result-card) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .result-title) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .score-circle-inner) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .score-circle-inner .val) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .result-meta-item) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .meta-value) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .result-actions) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

@media (max-width: 900px) {
  .result-card {
    padding: 20px 18px;
    border-radius: var(--radius-lg);
  }

  .result-title {
    font-size: 1.18rem;
  }

  .result-hero {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .result-meta {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
  }

  .result-actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
