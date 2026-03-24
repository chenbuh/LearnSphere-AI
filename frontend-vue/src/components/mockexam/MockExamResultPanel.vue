<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Trophy, Share2 } from 'lucide-vue-next'

const props = defineProps({
  examResult: {
    type: Object,
    required: true
  }
})

defineEmits(['back-list', 'review', 'share'])

const spentMinutes = computed(() => Math.max(1, Math.ceil((props.examResult?.timeSpent || 0) / 60)))
const wrongCount = computed(() => Math.max((props.examResult?.totalCount || 0) - (props.examResult?.correctCount || 0), 0))
const accuracy = computed(() => {
  const total = props.examResult?.totalCount || 0
  if (!total) return 0
  return Math.round(((props.examResult?.correctCount || 0) / total) * 100)
})
const scoreBand = computed(() => {
  const score = props.examResult?.score || 0
  if (score >= 85) return '稳定发挥'
  if (score >= 70) return '基础扎实'
  if (score >= 60) return '还可提升'
  return '建议复盘'
})
const nextAction = computed(() => {
  const score = props.examResult?.score || 0
  if (score >= 85) return '继续刷整套模考保持节奏'
  if (score >= 70) return '优先复盘错题并巩固薄弱模块'
  if (score >= 60) return '先看解析，再补同类题'
  return '建议先进入试卷复盘'
})
const focusPoint = computed(() => {
  if (wrongCount.value === 0) return '本次答题状态很完整'
  if (wrongCount.value <= 3) return '重点看少量失分题的干扰项'
  return '集中看高频错题模块和题干定位'
})
</script>

<template>
  <div class="result-view">
    <section class="report-surface">
      <div class="report-head">
        <p class="report-kicker">模拟考试结果</p>
        <h2 class="report-title">本次模拟考试已完成</h2>
        <p class="report-summary">先看总分、正确率和下一步建议，再决定回到考试大厅还是进入逐题复盘。</p>
      </div>

      <div class="report-hero">
        <div class="score-circle">
          <Trophy :size="24" color="#60a5fa" />
          <span class="score-value">{{ examResult.score }}</span>
          <span class="score-label">总分</span>
        </div>

        <div class="hero-meta">
          <div class="meta-card">
            <span>正确率</span>
            <strong>{{ accuracy }}%</strong>
          </div>
          <div class="meta-card">
            <span>当前评价</span>
            <strong>{{ scoreBand }}</strong>
          </div>
          <div class="meta-card">
            <span>下一步</span>
            <strong>{{ nextAction }}</strong>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span>正确题目</span>
          <strong class="success">{{ examResult.correctCount }}</strong>
        </div>
        <div class="stat-card">
          <span>错误题目</span>
          <strong class="error">{{ wrongCount }}</strong>
        </div>
        <div class="stat-card">
          <span>总题数</span>
          <strong>{{ examResult.totalCount }}</strong>
        </div>
        <div class="stat-card">
          <span>所用时间</span>
          <strong>{{ spentMinutes }} 分钟</strong>
        </div>
      </div>
    </section>

    <aside class="action-rail">
      <div class="rail-card rail-card--focus">
        <p class="report-kicker">下一步建议</p>
        <h3>把成绩结果转成下一步动作</h3>
        <p>这里汇总本次模拟考的重点结论，方便你继续复盘并进入下一步练习。</p>
      </div>

      <div class="rail-card">
        <div class="rail-list">
          <div class="rail-item">
            <span>当前评价</span>
            <strong>{{ scoreBand }}</strong>
          </div>
          <div class="rail-item">
            <span>建议动作</span>
            <strong>{{ nextAction }}</strong>
          </div>
          <div class="rail-item">
            <span>复盘重点</span>
            <strong>{{ focusPoint }}</strong>
          </div>
        </div>
      </div>

      <div class="rail-card rail-card--actions">
        <n-button block @click="$emit('back-list')">
          返回考试大厅
        </n-button>
        <n-button block type="primary" @click="$emit('review')">
          进入试卷复盘
        </n-button>
        <n-button block secondary class="share-btn" @click="$emit('share')">
          <template #icon>
            <n-icon :component="Share2" />
          </template>
          分享考试成绩
        </n-button>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.result-view {
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
  color: #60a5fa;
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
  width: 152px;
  height: 152px;
  border-radius: 50%;
  border: 8px solid #60a5fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.16);
}

.score-value {
  font-size: 3.4rem;
  font-weight: 900;
  color: var(--text-color);
  line-height: 1;
}

.score-label {
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
.stat-card,
.rail-item {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.meta-card span,
.stat-card span,
.rail-item span {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-card strong,
.stat-card strong,
.rail-item strong {
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-card strong.success {
  color: #34d399;
}

.stat-card strong.error {
  color: #f87171;
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
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.14), transparent 40%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.24));
}

.rail-card--actions {
  display: grid;
  gap: 10px;
}

:global(html[data-theme='light'] .report-surface),
:global(html[data-theme='light'] .rail-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .rail-card--focus) {
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.12), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

:global(html[data-theme='light'] .meta-card),
:global(html[data-theme='light'] .stat-card),
:global(html[data-theme='light'] .rail-item) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

:global(html[data-theme='light'] .score-circle) {
  box-shadow: 0 0 26px rgba(96, 165, 250, 0.14);
  background: rgba(239, 246, 255, 0.74);
}

:global(html[data-theme='light'] .report-summary),
:global(html[data-theme='light'] .rail-card p),
:global(html[data-theme='light'] .meta-card span),
:global(html[data-theme='light'] .stat-card span),
:global(html[data-theme='light'] .rail-item span),
:global(html[data-theme='light'] .score-label) {
  color: #64748b;
}

:global(html[data-theme='light'] .report-title),
:global(html[data-theme='light'] .rail-card h3),
:global(html[data-theme='light'] .meta-card strong),
:global(html[data-theme='light'] .stat-card strong),
:global(html[data-theme='light'] .rail-item strong),
:global(html[data-theme='light'] .score-value) {
  color: #0f172a;
}

@media (max-width: 1080px) {
  .result-view {
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
  .hero-meta,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .score-circle {
    width: 118px;
    height: 118px;
    margin: 0 auto;
  }

  .score-value {
    font-size: 2.8rem;
  }
}

@media (max-width: 480px) {
  .result-view {
    gap: 16px;
  }

  .report-surface,
  .rail-card {
    padding: 14px 12px;
    border-radius: 18px;
  }

  .report-title {
    font-size: 1rem;
  }

  .report-summary,
  .rail-card p {
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .score-circle {
    width: 104px;
    height: 104px;
    border-width: 6px;
  }

  .score-value {
    font-size: 2.3rem;
  }

  .meta-card,
  .stat-card,
  .rail-item {
    padding: 12px;
    border-radius: 16px;
  }

  .meta-card strong,
  .stat-card strong,
  .rail-item strong {
    overflow-wrap: anywhere;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .result-view {
    gap: 16px;
  }

  .report-surface,
  .rail-card {
    padding: 16px 14px;
  }

  .report-hero {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 14px;
  }

  .hero-meta,
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .score-circle {
    width: 96px;
    height: 96px;
    border-width: 6px;
  }

  .score-value {
    font-size: 2.1rem;
  }

  .meta-card strong,
  .stat-card strong,
  .rail-item strong {
    overflow-wrap: anywhere;
  }
}
</style>

