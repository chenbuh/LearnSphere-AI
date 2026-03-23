<script setup>
import { computed } from 'vue'
import {
  ArrowRight, CalendarDays, CheckCircle2, Clock3, Flame, Sparkles
} from 'lucide-vue-next'
import { NButton, NIcon } from 'naive-ui'

const props = defineProps({
  streak: {
    type: Number,
    default: 0
  },
  todayTime: {
    type: [Number, String],
    default: 0
  },
  learnerName: {
    type: String,
    default: '同学'
  },
  todayLabel: {
    type: String,
    default: ''
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  totalTasks: {
    type: Number,
    default: 0
  },
  focusCard: {
    type: Object,
    default: () => ({})
  },
  quickActions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['focus-action', 'quick-action'])

const remainingTasks = computed(() => Math.max(props.totalTasks - props.completedTasks, 0))
const completionLabel = computed(() => (
  props.totalTasks > 0 ? `${props.completedTasks}/${props.totalTasks}` : '待开始'
))
const todayTimeDisplay = computed(() => (
  typeof props.todayTime === 'number' ? `${props.todayTime} 分钟` : (props.todayTime || '待累计')
))

const headerSummary = computed(() => {
  if (props.totalTasks <= 0) {
    return `${props.learnerName}，先选一个模块开始今天的学习。`
  }

  if (remainingTasks.value > 0) {
    return `${props.learnerName}，今天还差 ${remainingTasks.value} 项任务，先完成最关键的一项。`
  }

  return `${props.learnerName}，今日任务已完成，可以继续巩固当前薄弱项。`
})

const focusMeta = computed(() => props.focusCard?.meta || (
  props.totalTasks > 0 ? `今日任务 ${props.completedTasks}/${props.totalTasks}` : '准备开始今日学习'
))
</script>

<template>
  <section class="hub-hero">
    <div class="hero-intro">
      <div class="hero-meta">
        <span class="hero-meta-item">
          <n-icon :component="CalendarDays" size="14" />
          {{ todayLabel }}
        </span>
        <span class="hero-meta-item">
          <n-icon :component="CheckCircle2" size="14" />
          任务 {{ completionLabel }}
        </span>
      </div>
      <h1 class="hero-title">学习中心</h1>
      <p class="hero-subtitle">{{ headerSummary }}</p>
    </div>

    <div class="hero-focus">
      <div class="focus-copy">
        <span class="focus-label">今日重点</span>
        <h2 class="focus-title">{{ focusCard?.title || '安排今日学习' }}</h2>
        <p class="focus-description">
          {{ focusCard?.description || '从当前最值得推进的模块开始，保持今天的学习节奏。' }}
        </p>
        <div class="focus-meta">{{ focusMeta }}</div>
      </div>

      <n-button
        type="primary"
        size="large"
        class="focus-action"
        @click="emit('focus-action', focusCard)"
      >
        {{ focusCard?.ctaLabel || '开始学习' }}
        <template #icon>
          <n-icon :component="ArrowRight" size="16" />
        </template>
      </n-button>
    </div>

    <div class="hero-side">
      <div class="hero-metrics">
        <div class="metric-card">
          <span class="metric-icon metric-icon--streak">
            <n-icon :component="Flame" size="16" />
          </span>
          <div>
            <div class="metric-value">{{ streak }} 天</div>
            <div class="metric-label">连续学习</div>
          </div>
        </div>

        <div class="metric-card">
          <span class="metric-icon metric-icon--time">
            <n-icon :component="Clock3" size="16" />
          </span>
          <div>
            <div class="metric-value">{{ todayTimeDisplay }}</div>
            <div class="metric-label">今日投入</div>
          </div>
        </div>

        <div class="metric-card metric-card--tasks">
          <span class="metric-icon metric-icon--tasks">
            <n-icon :component="Sparkles" size="16" />
          </span>
          <div>
            <div class="metric-value">{{ completionLabel }}</div>
            <div class="metric-label">任务完成</div>
          </div>
        </div>
      </div>

      <div v-if="quickActions.length" class="quick-actions">
        <button
          v-for="action in quickActions"
          :key="action.key"
          type="button"
          class="quick-action"
          @click="emit('quick-action', action)"
        >
          <span class="quick-action-label">{{ action.label }}</span>
          <span class="quick-action-desc">{{ action.description }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hub-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
  padding: 30px;
  border-radius: 34px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background:
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.2), transparent 34%),
    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(2, 6, 23, 0.94));
  box-shadow: 0 24px 72px rgba(2, 6, 23, 0.34);
}

.hub-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.03), transparent 28%),
    linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.015));
  pointer-events: none;
}

.hub-hero::after {
  content: '';
  position: absolute;
  inset: auto 20px 20px auto;
  width: 144px;
  height: 144px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent 70%);
  pointer-events: none;
}

.hero-intro {
  position: relative;
  z-index: 1;
  max-width: 660px;
  margin-bottom: 24px;
}

.hero-side {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.hero-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.46);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.2rem, 4.2vw, 3.55rem);
  line-height: 0.96;
  font-weight: 850;
  letter-spacing: -0.03em;
  color: #f8fafc;
}

.hero-subtitle {
  max-width: 38rem;
  margin: 14px 0 0;
  color: #cbd5e1;
  font-size: 15px;
  line-height: 1.8;
}

.hero-metrics {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.48);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.metric-icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  flex-shrink: 0;
}

.metric-icon--streak {
  background: rgba(249, 115, 22, 0.18);
  color: #fb923c;
}

.metric-icon--time {
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
}

.metric-icon--tasks {
  background: rgba(45, 212, 191, 0.18);
  color: #2dd4bf;
}

.metric-value {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}

.metric-label {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 12px;
}

.hero-focus {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.6), rgba(7, 14, 29, 0.42)),
    radial-gradient(circle at top right, rgba(103, 232, 249, 0.08), transparent 38%);
  border: 1px solid rgba(125, 211, 252, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.hero-focus::before {
  content: '';
  position: absolute;
  inset: 18px auto 18px 18px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #67e8f9, rgba(45, 212, 191, 0.25));
  opacity: 0.7;
}

.focus-copy {
  min-width: 0;
  padding-left: 14px;
}

.focus-label {
  display: inline-flex;
  margin-bottom: 8px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.focus-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.3rem;
  line-height: 1.25;
}

.focus-description {
  margin: 8px 0 10px;
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.65;
}

.focus-meta {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.focus-action {
  flex-shrink: 0;
}

.quick-actions {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.quick-action {
  padding: 14px 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.34);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.quick-action:hover {
  transform: translateY(-2px);
  border-color: rgba(125, 211, 252, 0.34);
  background: rgba(15, 23, 42, 0.58);
}

.quick-action-label {
  display: block;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 700;
}

.quick-action-desc {
  display: block;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

:global(html[data-theme='light'] .hub-hero) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.12), transparent 32%),
    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.985), rgba(248, 250, 252, 0.96));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 20px 44px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .hub-hero::before) {
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.52), transparent 28%),
    linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.16));
}

:global(html[data-theme='light'] .hub-hero::after) {
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1), transparent 70%);
}

:global(html[data-theme='light'] .hero-meta-item) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(148, 163, 184, 0.16);
  color: #475569;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

:global(html[data-theme='light'] .hero-title),
:global(html[data-theme='light'] .metric-value),
:global(html[data-theme='light'] .focus-title),
:global(html[data-theme='light'] .quick-action-label) {
  color: #0f172a;
}

:global(html[data-theme='light'] .hero-subtitle),
:global(html[data-theme='light'] .focus-description),
:global(html[data-theme='light'] .questions-entry-copy) {
  color: #526171;
}

:global(html[data-theme='light'] .metric-card) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9));
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 12px 24px rgba(15, 23, 42, 0.05);
}

:global(html[data-theme='light'] .metric-label),
:global(html[data-theme='light'] .focus-meta),
:global(html[data-theme='light'] .quick-action-desc) {
  color: #64748b;
}

:global(html[data-theme='light'] .hero-focus) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(103, 232, 249, 0.1), transparent 38%);
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 16px 30px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .hero-focus::before) {
  background: linear-gradient(180deg, #14b8a6, rgba(45, 212, 191, 0.22));
}

:global(html[data-theme='light'] .focus-label) {
  color: #0f766e;
}

:global(html[data-theme='light'] .quick-action) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9));
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 10px 20px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .quick-action:hover) {
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(255, 255, 255, 0.96);
}

@media (min-width: 1280px) {
  .hub-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(336px, 0.84fr);
    gap: 22px 28px;
    align-items: stretch;
    padding: 38px 40px;
  }

  .hero-intro,
  .hero-focus {
    grid-column: 1;
    margin-bottom: 0;
  }

  .hero-side {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: stretch;
    padding: 10px;
    border-radius: 28px;
    background: linear-gradient(180deg, rgba(7, 14, 29, 0.4), rgba(7, 14, 29, 0.24));
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .hero-metrics {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 0;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    margin-top: 2px;
  }

  .quick-action {
    min-height: 82px;
    padding: 16px 14px;
  }

  .hero-focus {
    min-height: 190px;
    padding: 22px;
  }

  .focus-title {
    font-size: 1.42rem;
  }

  .focus-action {
    margin-top: auto;
  }
}

@media (min-width: 1100px) {
  :global(html[data-theme='light'] .hero-side) {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(241, 245, 249, 0.9));
    border-color: rgba(148, 163, 184, 0.18);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
  }
}

@media (max-width: 1279px) {
  .hub-hero {
    padding: 24px 22px;
    border-radius: 28px;
  }

  .hero-title {
    font-size: clamp(2rem, 5vw, 3rem);
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card--tasks {
    grid-column: 1 / -1;
  }

  .hero-focus {
    flex-direction: column;
    align-items: stretch;
  }

  .focus-action {
    width: 100%;
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) and (max-width: 1279px) {
  .hub-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.28fr) minmax(300px, 0.82fr);
    gap: 18px 22px;
    align-items: stretch;
  }

  .hero-intro,
  .hero-focus {
    grid-column: 1;
    margin-bottom: 0;
  }

  .hero-side {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: stretch;
    padding: 8px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(7, 14, 29, 0.4), rgba(7, 14, 29, 0.24));
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .hero-title {
    font-size: clamp(2rem, 3.7vw, 2.85rem);
  }

  .hero-metrics {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 0;
  }

  .metric-card--tasks {
    grid-column: auto;
  }

  .hero-focus {
    min-height: 160px;
    padding: 18px;
    flex-direction: row;
    align-items: flex-end;
  }

  .focus-action {
    width: auto;
    margin-top: auto;
  }

  .quick-actions {
    grid-template-columns: 1fr;
    margin-top: 2px;
  }

  .quick-action {
    min-height: 70px;
    padding: 14px 12px;
  }
}

@media (max-width: 900px) {
  .hub-hero {
    padding: 22px 18px;
    border-radius: 24px;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-card--tasks {
    grid-column: 1 / -1;
  }

  .hero-focus {
    flex-direction: column;
    align-items: stretch;
  }

  .focus-action {
    width: 100%;
  }

  .quick-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .hub-hero {
    margin-bottom: 20px;
    padding: 18px 14px;
    border-radius: 22px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    margin-top: 12px;
    font-size: 14px;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .metric-card {
    padding: 12px 14px;
    border-radius: 16px;
  }

  .hero-focus {
    padding: 16px;
    border-radius: 18px;
  }

  .focus-title {
    font-size: 1.12rem;
  }

  .focus-description {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .quick-actions {
    display: flex;
    gap: 8px;
    margin-right: -2px;
    padding-bottom: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .quick-action {
    flex: 0 0 148px;
    padding: 12px;
    border-radius: 16px;
  }

  .quick-actions::-webkit-scrollbar {
    display: none;
  }
}

@media (max-height: 900px) and (min-width: 901px) {
  .hub-hero {
    margin-bottom: 22px;
    padding: 24px 24px 22px;
  }

  .hero-intro {
    margin-bottom: 18px;
  }

  .hero-subtitle {
    margin-top: 10px;
    line-height: 1.65;
  }

  .hero-metrics {
    gap: 10px;
    margin-bottom: 14px;
  }

  .metric-card {
    padding: 12px 14px;
  }

  .hero-focus {
    padding: 16px 18px;
  }

  .focus-description {
    margin-bottom: 8px;
  }

  .quick-actions {
    gap: 8px;
  }

  .quick-action {
    min-height: 72px;
    padding: 12px;
  }
}

@media (max-height: 780px) and (min-width: 1280px) {
  .hub-hero {
    padding: 26px 28px;
  }

  .hero-title {
    font-size: clamp(1.95rem, 3.4vw, 2.8rem);
  }

  .hero-subtitle {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .hero-focus {
    min-height: 0;
  }

  .quick-action {
    min-height: 64px;
  }

  .quick-action-desc {
    margin-top: 4px;
  }
}
</style>
