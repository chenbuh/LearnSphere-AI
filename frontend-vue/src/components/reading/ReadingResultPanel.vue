<template>
  <div class="result-shell">
    <section class="report-surface">
      <div class="report-head">
        <div class="kicker-wrap">
          <span class="kicker-dot"></span>
          <p class="report-kicker">阅读成果汇报 · Reading Report</p>
        </div>
        <h2 class="report-title">本次精读练习已圆满完成</h2>
        <p class="report-summary">
          系统已根据你的答题节奏与正确率完成能力诊断，建议查阅逐题复盘定位长难句与干扰项。
        </p>
      </div>

      <div class="report-hero">
        <div class="score-circle-outer" :class="scoreColorClass">
          <div class="score-circle-inner">
            <span class="score-value">{{ score }}</span>
            <span class="score-label">正确率</span>
          </div>
        </div>

        <div class="hero-meta">
          <div class="meta-card">
            <span class="label">评定等级</span>
            <strong class="val">{{ scoreBand }}</strong>
          </div>
          <div class="meta-card">
            <span class="label">建议下一步</span>
            <strong class="val">{{ nextAction }}</strong>
          </div>
          <div class="meta-card">
            <span class="label">核心复盘点</span>
            <strong class="val">{{ focusPoint }}</strong>
          </div>
        </div>
      </div>

      <div v-if="currentLogId" class="feedback-row">
        <AIFeedback :log-id="currentLogId" />
      </div>
    </section>

    <aside class="action-rail">
      <div class="rail-card rail-card--focus">
        <div class="rail-kicker-badge">
          <n-icon :component="Sparkles" size="13" color="#34d399" />
          <span class="report-kicker">智能复盘引导</span>
        </div>
        <h3>巩固认知，转化真题战力</h3>
        <p>进入原文复盘可结合原文段落标记与 AI 助教定位失分陷阱。</p>
      </div>

      <div class="rail-card rail-card--actions">
        <n-button block type="primary" size="large" class="primary-act-btn" @click="emit('review')">
          <template #icon><n-icon :component="BookOpen" /></template>
          查看原文与逐题复盘
        </n-button>
        <n-button block secondary size="large" class="secondary-act-btn" @click="emit('restart')">
          <template #icon><n-icon :component="RotateCcw" /></template>
          开始下一篇阅读
        </n-button>
        <n-button block secondary size="large" class="share-btn" @click="shareVisible = true">
          <template #icon>
            <n-icon :component="Share2" />
          </template>
          分享精读成果
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
import { BookOpen, RotateCcw, Share2, Sparkles } from 'lucide-vue-next'
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
  set: value => emit('update:showShare', value)
})

const scoreBand = computed(() => {
  if (props.score >= 85) return '优秀 (Advanced)'
  if (props.score >= 70) return '良好 (Proficient)'
  if (props.score >= 60) return '合格 (Pass)'
  return '待加强 (Developing)'
})

const nextAction = computed(() => {
  if (props.score >= 80) return '提升阅读速读'
  if (props.score >= 60) return '重点回看错题'
  return '先做精读解析'
})

const focusPoint = computed(() => {
  if (props.score >= 80) return '保持正确率并缩短阅读停顿'
  if (props.score >= 60) return '定位干扰项和原文证据句'
  return '完整回看原文段落与答案依据'
})

const scoreColorClass = computed(() => {
  if (props.score >= 85) return 'grade-high'
  if (props.score >= 60) return 'grade-mid'
  return 'grade-low'
})
</script>

<style scoped>
.result-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: 24px;
  align-items: start;
}

.report-surface,
.rail-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.report-surface {
  display: grid;
  gap: 24px;
  padding: 30px;
}

.report-head {
  display: grid;
  gap: 8px;
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.report-kicker {
  margin: 0;
  color: var(--tone-emerald);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.report-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-color);
}

.report-summary {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
  font-size: 0.92rem;
}

.report-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 26px;
  align-items: center;
  padding: 12px 0;
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

.score-circle-outer.grade-mid {
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--text-color);
  line-height: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.score-label {
  font-size: 0.72rem;
  color: var(--secondary-text);
  font-weight: 700;
  margin-top: 4px;
}

.hero-meta {
  display: grid;
  gap: 10px;
}

.meta-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.meta-card .label {
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.meta-card .val {
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 700;
}

.action-rail {
  display: grid;
  gap: 18px;
}

.rail-card {
  padding: 24px;
}

.rail-card--focus h3 {
  margin: 8px 0 6px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-color);
}

.rail-card--focus p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.86rem;
  line-height: 1.55;
}

.rail-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.rail-card--actions {
  display: grid;
  gap: 12px;
}

.primary-act-btn {
  height: 48px;
  border-radius: var(--radius-lg);
  font-weight: 800;
  background: #34d399 !important;
  /* 实心亮绿底固定深色 ink，避免白字 1.6:1 */
  color: #04321f !important;
  border: none !important;
}

.secondary-act-btn,
.share-btn {
  height: 48px;
  border-radius: var(--radius-lg);
  font-weight: 700;
}

html[data-theme='light'] .report-surface,
html[data-theme='light'] .rail-card {
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .report-title,
html[data-theme='light'] .rail-card--focus h3 {
  color: var(--text-color);
}

html[data-theme='light'] .report-summary,
html[data-theme='light'] .rail-card--focus p {
  color: var(--secondary-text);
}

html[data-theme='light'] .score-circle-inner {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .score-value {
  color: var(--text-color);
}

html[data-theme='light'] .meta-card {
  background: #f8fafc;
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .meta-card .val {
  color: var(--text-color);
}

@media (max-width: 900px) {
  .result-shell {
    grid-template-columns: 1fr;
  }

  .report-surface {
    padding: 20px 18px;
  }

  .report-hero {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .hero-meta {
    width: 100%;
  }
}
</style>
