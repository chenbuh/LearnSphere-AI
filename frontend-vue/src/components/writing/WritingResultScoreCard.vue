<template>
  <section class="score-card-premium">
    <div class="score-head">
      <p class="score-kicker">写作结果</p>
      <h2 class="score-title">本次写作评估已生成</h2>
      <p class="score-summary">
        {{ scoreSummary }}
      </p>
    </div>

    <div class="score-hero">
      <div class="score-dial">
        <n-progress
          type="circle"
          :percentage="displayScore"
          :color="displayScore >= 80 ? '#10b981' : displayScore >= 60 ? '#fb923c' : '#f43f5e'"
          :stroke-width="8"
          class="score-circle"
        >
          <div class="score-inner">
            <span class="score-num">{{ displayScore }}</span>
            <span class="score-label">总评</span>
          </div>
        </n-progress>
      </div>

      <div class="score-meta">
        <div class="score-meta-item">
          <span class="score-meta-label">等级</span>
          <strong class="score-meta-value">{{ scoreGrade }}</strong>
        </div>
        <div class="score-meta-item">
          <span class="score-meta-label">建议动作</span>
          <strong class="score-meta-value">{{ actionLabel }}</strong>
        </div>
      </div>
    </div>

    <div class="score-tools">
      <div class="score-tools-main">
        <n-button size="small" secondary type="primary" @click="emit('open-tutor')">
          <template #icon><n-icon :component="MessageCircle" /></template>
          问问 AI 助手
        </n-button>
        <AIFeedback v-if="analysisResult && analysisResult.logId" :log-id="analysisResult.logId" />
      </div>

      <div class="score-actions">
        <n-button @click="emit('restart')" secondary round>重新开始</n-button>
        <n-button type="primary" round class="export-btn">保存报告</n-button>
        <n-button secondary round @click="emit('update:show-share', true)" class="share-btn">
          <template #icon>
            <n-icon :component="Share2" />
          </template>
          分享学习成果
        </n-button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
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

const scoreSummary = computed(() => {
  if (displayScore >= 80) return '文章的结构与表达已经比较稳定，可以重点打磨语言细节和句式变化。'
  if (displayScore >= 60) return '整体表达已经成型，接下来更值得补的是语法稳定性与论证展开。'
  return '先把结构、句子完整度和论点展开补稳，再回头提升语言丰富度。'
})

const scoreGrade = computed(() => {
  if (displayScore >= 85) return '优秀'
  if (displayScore >= 70) return '良好'
  if (displayScore >= 60) return '合格'
  return '待加强'
})

const actionLabel = computed(() => {
  if (displayScore >= 80) return '继续精修表达'
  if (displayScore >= 60) return '补语法与展开'
  return '先稳住基本结构'
})
</script>

<style scoped>
.score-card-premium {
  display: grid;
  gap: 20px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.24)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
}

.score-head {
  display: grid;
  gap: 8px;
}

.score-kicker {
  margin: 0;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.score-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.28rem;
  line-height: 1.35;
}

.score-summary {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.score-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.score-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.score-meta-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.score-meta-label {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.score-meta-value {
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.4;
}

.score-tools {
  display: grid;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.score-tools-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.score-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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

.export-btn {
  background: linear-gradient(135deg, #fb923c, #f97316) !important;
  box-shadow: none;
}

:global(html[data-theme='light'] .score-card-premium),
:global(html[data-theme='light'] .score-meta-item) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .score-tools) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .score-circle .n-progress-circle__rail) {
  stroke: rgba(226, 232, 240, 0.95) !important;
}

@media (max-width: 900px) {
  .score-card-premium {
    padding: 18px 16px;
    border-radius: 22px;
  }

  .score-title {
    font-size: 1.06rem;
  }

  .score-hero {
    grid-template-columns: 1fr;
  }

  .score-meta {
    grid-template-columns: 1fr;
  }

  .score-actions {
    flex-direction: column;
  }

  .score-actions :deep(.n-button) {
    width: 100%;
  }
}
</style>

