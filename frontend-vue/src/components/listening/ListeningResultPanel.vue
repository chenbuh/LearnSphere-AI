<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { MessageCircleMore, Share2 } from 'lucide-vue-next'

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
  return props.isEnglish ? `Practice completed! Score: ${props.score}` : `练习已完成! 得分: ${props.score}`
})

const resultDescription = computed(() => {
  return props.score >= 60
    ? props.translate('表现不错，继续保持！', 'Great work, keep it up!')
    : props.translate('还需要多加练习，加油！', 'Keep practicing, you can do it!')
})

const scoreGrade = computed(() => {
  if (props.score >= 85) return props.translate('优秀', 'Excellent')
  if (props.score >= 70) return props.translate('良好', 'Good')
  if (props.score >= 60) return props.translate('合格', 'Pass')
  return props.translate('待加强', 'Needs Work')
})
</script>

<template>
  <section class="result-card">
    <div class="result-head">
      <p class="result-kicker">Listening Report</p>
      <h2 class="result-title">{{ resultTitle }}</h2>
      <p class="result-description">{{ resultDescription }}</p>
    </div>

    <div class="result-hero">
      <div class="score-circle">
        <span class="val">{{ score }}</span>
      </div>

      <div class="result-meta">
        <div class="result-meta-item">
          <span class="meta-label">{{ props.translate('等级', 'Grade') }}</span>
          <strong class="meta-value">{{ scoreGrade }}</strong>
        </div>
        <div class="result-meta-item">
          <span class="meta-label">{{ props.translate('下一步', 'Next') }}</span>
          <strong class="meta-value">{{ props.translate('查看详细解析', 'Open detailed analysis') }}</strong>
        </div>
      </div>
    </div>

    <div class="result-actions">
      <n-button type="primary" class="primary-btn" @click="emit('view-analysis')">
        <template #icon><n-icon :component="MessageCircleMore" /></template>
        {{ props.translate('查看详细解析', 'Detailed Analysis') }}
      </n-button>
      <n-button secondary @click="emit('restart')">
        {{ props.translate('返回首页', 'Go Home') }}
      </n-button>
      <n-button secondary @click="emit('share')" class="share-btn">
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
  gap: 20px;
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.26)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
}

.result-head {
  display: grid;
  gap: 8px;
}

.result-kicker {
  margin: 0;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.result-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.32rem;
  line-height: 1.35;
}

.result-description {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.result-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border: 8px solid #0ea5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(14, 165, 233, 0.2);
}

.score-circle .val {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-color);
}

.result-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.result-meta-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.meta-label {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-value {
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.4;
}

.result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.primary-btn {
  background: linear-gradient(135deg, #fb923c, #f97316) !important;
  box-shadow: none;
}

.share-btn {
  min-width: 180px;
}

:global(html[data-theme='light'] .result-card),
:global(html[data-theme='light'] .result-meta-item) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .score-circle) {
  background: rgba(239, 246, 255, 0.76);
  box-shadow: 0 0 30px rgba(14, 165, 233, 0.14);
}

:global(html[data-theme='light'] .result-actions) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

@media (max-width: 900px) {
  .result-card {
    padding: 18px 16px;
    border-radius: 22px;
  }

  .result-title {
    font-size: 1.06rem;
  }

  .result-hero,
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
