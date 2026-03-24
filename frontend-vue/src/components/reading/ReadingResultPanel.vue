<template>
  <div class="result-shell">
    <section class="report-surface">
      <div class="report-head">
        <p class="report-kicker">阅读结果</p>
        <h2 class="report-title">本次阅读练习已完成</h2>
        <p class="report-summary">先看整体正确率和建议动作，再决定进入原文复盘还是直接开始下一篇。</p>
      </div>

      <div class="report-hero">
        <div class="score-circle">
          <span class="score-value">{{ score }}</span>
          <span class="score-label">正确率</span>
        </div>

        <div class="hero-meta">
          <div class="meta-card">
            <span>等级</span>
            <strong>{{ scoreBand }}</strong>
          </div>
          <div class="meta-card">
            <span>下一步</span>
            <strong>{{ nextAction }}</strong>
          </div>
          <div class="meta-card">
            <span>复盘重点</span>
            <strong>{{ focusPoint }}</strong>
          </div>
        </div>
      </div>

      <div v-if="currentLogId" class="feedback-row">
        <AIFeedback :log-id="currentLogId" />
      </div>
    </section>

    <aside class="action-rail">
      <div class="rail-card rail-card--focus">
        <p class="report-kicker">下一步建议</p>
        <h3>把结果转成下一步动作</h3>
        <p>根据结果继续复盘，或直接开始下一篇。</p>
      </div>

      <div class="rail-card">
        <div class="rail-list">
          <div class="rail-item">
            <span>建议动作</span>
            <strong>{{ nextAction }}</strong>
          </div>
          <div class="rail-item">
            <span>当前等级</span>
            <strong>{{ scoreBand }}</strong>
          </div>
          <div class="rail-item">
            <span>复盘重点</span>
            <strong>{{ focusPoint }}</strong>
          </div>
        </div>
      </div>

      <div class="rail-card rail-card--actions">
        <n-button block @click="emit('restart')">阅读下一篇</n-button>
        <n-button block type="primary" @click="emit('review')">查看原文解析</n-button>
        <n-button block secondary class="share-btn" @click="shareVisible = true">
          <template #icon>
            <n-icon :component="Share2" />
          </template>
          分享学习成果
        </n-button>
      </div>
    </aside>

    <ShareModal
      v-model:show="shareVisible"
      :title="shareContent.title"
      :description="shareContent.description"
      :url="shareContent.url"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Share2 } from 'lucide-vue-next'
import ShareModal from '@/components/ShareModal.vue'
import AIFeedback from '@/components/AIFeedback.vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0
  },
  currentLogId: {
    type: [Number, String],
    default: null
  },
  showShare: {
    type: Boolean,
    default: false
  },
  shareContent: {
    type: Object,
    default: () => ({ title: '', description: '', url: '' })
  }
})

const emit = defineEmits(['restart', 'review', 'update:showShare'])

const shareVisible = computed({
  get: () => props.showShare,
  set: (value) => emit('update:showShare', value)
})

const scoreBand = computed(() => {
  if (props.score >= 85) return '优秀'
  if (props.score >= 70) return '良好'
  if (props.score >= 60) return '合格'
  return '待加强'
})

const nextAction = computed(() => {
  if (props.score >= 80) return '继续提高速度'
  if (props.score >= 60) return '回看错题'
  return '先做解析复盘'
})

const focusPoint = computed(() => {
  if (props.score >= 80) return '保持正确率并缩短阅读停顿'
  if (props.score >= 60) return '定位干扰项和原文证据句'
  return '完整回看原文段落与答案依据'
})
</script>

<style scoped>
.result-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
  gap: 24px;
  align-items: start;
}

.report-surface,
.rail-card {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.58), rgba(15, 23, 42, 0.3)),
    rgba(15, 23, 42, 0.18);
}

.report-surface {
  display: grid;
  gap: 22px;
  padding: 24px;
}

.report-head {
  display: grid;
  gap: 8px;
}

.report-kicker {
  margin: 0;
  color: #34d399;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.report-title,
.rail-card h3 {
  margin: 0;
  color: var(--text-color);
}

.report-title {
  font-size: 1.4rem;
  line-height: 1.35;
}

.report-summary,
.rail-card p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.report-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 22px;
  align-items: center;
}

.score-circle {
  width: 132px;
  height: 132px;
  border-radius: 50%;
  border: 8px solid #10b981;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.16);
}

.score-value {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-color);
  line-height: 1;
}

.score-label {
  margin-top: 6px;
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-meta,
.rail-list {
  display: grid;
  gap: 10px;
}

.hero-meta {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.meta-card,
.rail-item {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.meta-card span,
.rail-item span {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-card strong,
.rail-item strong {
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.feedback-row {
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.action-rail {
  display: grid;
  gap: 16px;
}

.rail-card {
  padding: 20px;
}

.rail-card--focus {
  background:
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.14), transparent 40%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.24));
}

.rail-card--actions {
  gap: 10px;
  display: grid;
}

.rail-card--actions :deep(.n-button) {
  min-height: 44px;
}

:global(html[data-theme='light'] .report-surface),
:global(html[data-theme='light'] .rail-card) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .meta-card),
:global(html[data-theme='light'] .rail-item) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .rail-card--focus) {
  background:
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.12), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(240, 253, 244, 0.9));
}

:global(html[data-theme='light'] .score-circle) {
  background: rgba(236, 253, 245, 0.92);
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.12);
}

:global(html[data-theme='light'] .feedback-row) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

@media (max-width: 1080px) {
  .result-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .report-surface,
  .rail-card {
    padding: 18px 16px;
    border-radius: 22px;
  }

  .report-title {
    font-size: 1.08rem;
  }

  .report-hero,
  .hero-meta {
    grid-template-columns: 1fr;
  }

  .score-circle {
    width: 116px;
    height: 116px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .report-surface,
  .rail-card {
    padding: 16px 14px;
  }

  .score-circle {
    width: 104px;
    height: 104px;
    border-width: 6px;
  }

  .score-value {
    font-size: 2.35rem;
  }

  .meta-card,
  .rail-item {
    padding: 12px 14px;
  }
}
</style>

