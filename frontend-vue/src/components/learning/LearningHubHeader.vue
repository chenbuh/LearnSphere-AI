<script setup>
import { computed } from 'vue'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flame,
  Sparkles,
  BookOpen,
  Headphones,
  MessageSquare,
  PenTool,
  Mic,
  Layers,
  Zap,
  Trophy,
  Target
} from 'lucide-vue-next'
import { NIcon } from 'naive-ui'

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
const completionLabel = computed(() =>
  props.totalTasks > 0 ? `${props.completedTasks}/${props.totalTasks}` : '0/4'
)

const todayTimeDisplayNum = computed(() => {
  if (typeof props.todayTime === 'number') return props.todayTime
  if (typeof props.todayTime === 'string') {
    const match = props.todayTime.match(/\d+/)
    return match ? match[0] : props.todayTime === '待累计' ? '0' : props.todayTime
  }
  return '0'
})

const todayTimeUnit = computed(() => {
  if (typeof props.todayTime === 'string' && props.todayTime.includes('h')) return 'h'
  return '分钟'
})

const headerSummary = computed(() => {
  if (props.totalTasks <= 0) {
    return `${props.learnerName}，先选一个模块开始吧。`
  }

  if (remainingTasks.value > 0) {
    return `${props.learnerName}，今天还差 ${remainingTasks.value} 项任务，先完成最关键的一项。`
  }

  return `${props.learnerName}，今日任务已全部搞定！可以继续巩固当前薄弱项。`
})

const focusMeta = computed(
  () =>
    props.focusCard?.meta ||
    (props.totalTasks > 0
      ? `今日任务 ${props.completedTasks}/${props.totalTasks}`
      : '准备开始今日学习')
)

const focusProgressValue = computed(() => {
  if (props.totalTasks > 0) {
    return Math.min(100, Math.round((props.completedTasks / props.totalTasks) * 100))
  }
  return 20
})

const focusModuleIcon = computed(() => {
  const title = (props.focusCard?.title || '').toLowerCase()
  if (title.includes('词汇') || title.includes('vocab')) return BookOpen
  if (title.includes('听力') || title.includes('listen')) return Headphones
  if (title.includes('语法') || title.includes('grammar')) return MessageSquare
  if (title.includes('阅读') || title.includes('read')) return BookOpen
  if (title.includes('写作') || title.includes('writ')) return PenTool
  if (title.includes('口语') || title.includes('speak')) return Mic
  return Sparkles
})

function getQuickActionIcon(key) {
  switch (key) {
    case 'challenge':
      return Target
    case 'modules':
      return Layers
    case 'flashcards':
      return Zap
    case 'listening':
      return Headphones
    case 'achievements':
      return Trophy
    default:
      return Sparkles
  }
}
</script>

<template>
  <section class="hub-hero">
    <!-- 头部顶栏：日期/任务状态胶囊 + 问候大标题 -->
    <div class="hero-topline">
      <div class="hero-intro">
        <div class="hero-meta">
          <span class="hero-meta-item">
            <n-icon :component="CalendarDays" :size="14" />
            <span>{{ todayLabel }}</span>
          </span>
          <span class="hero-meta-item hero-meta-item--accent">
            <n-icon :component="CheckCircle2" :size="14" />
            <span>任务进度 {{ completionLabel }}</span>
          </span>
        </div>
        <div class="hero-headline-wrap">
          <h1 class="hero-title">学习中心</h1>
        </div>
        <p class="hero-subtitle">{{ headerSummary }}</p>
      </div>

      <!-- 右上方状态徽章 -->
      <div class="hero-status-pill">
        <div class="pulse-dot"></div>
        <span>{{
          remainingTasks === 0 ? '今天的任务都完成了' : `今天还剩 ${remainingTasks} 项任务`
        }}</span>
      </div>
    </div>

    <!-- 核心主体双栏网格：左侧聚焦任务舱 vs 右侧全景仪表看板 -->
    <div class="hero-main-grid">
      <!-- 左侧：今日核心聚焦任务舱 (Prime Focus Chamber) -->
      <div class="hero-focus-chamber">
        <div class="focus-chamber-header">
          <div class="focus-tag">
            <n-icon :component="Sparkles" :size="14" />
            <span>今天先做这个</span>
          </div>
          <span class="focus-status-badge">{{ remainingTasks === 0 ? '已完成' : '优先' }}</span>
        </div>

        <div class="focus-chamber-body">
          <div class="focus-icon-capsule">
            <n-icon :component="focusModuleIcon" :size="28" />
          </div>
          <div class="focus-main-info">
            <div class="focus-title-row">
              <h2 class="focus-title">{{ focusCard?.title || '安排今日学习' }}</h2>
              <span class="focus-xp-pill">+10 XP</span>
            </div>
            <p class="focus-description">
              {{ focusCard?.description || '从上次停下的地方继续。' }}
            </p>
            <div class="focus-progress-wrapper">
              <div class="focus-progress-meta">
                <span class="progress-meta-label">{{ focusMeta }}</span>
                <span class="progress-meta-value">{{ focusProgressValue }}%</span>
              </div>
              <div class="focus-progress-track">
                <div class="focus-progress-fill" :style="{ width: `${focusProgressValue}%` }">
                  <div class="progress-light-sweep"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="focus-chamber-footer">
          <div class="focus-tips">
            <n-icon :component="Clock3" :size="14" />
            <span>大约需要 10–15 分钟</span>
          </div>
          <button type="button" class="focus-action-btn" @click="emit('focus-action', focusCard)">
            <span>{{ focusCard?.ctaLabel || '开始' }}</span>
            <n-icon :component="ArrowRight" :size="18" class="btn-arrow" />
          </button>
        </div>
      </div>

      <!-- 右侧：全景多维仪表看板 (Multi-metric Nexus Dashboard) -->
      <div class="hero-nexus-panel">
        <!-- 顶部：三大指标卡横向网格 -->
        <div class="hero-metrics-trio">
          <div class="nexus-metric-card nexus-metric--streak">
            <div class="nexus-metric-icon">
              <n-icon :component="Flame" :size="18" />
            </div>
            <div class="nexus-metric-data">
              <div class="metric-num">{{ streak }}<span class="metric-unit">天</span></div>
              <div class="metric-sub">连续学习</div>
            </div>
          </div>

          <div class="nexus-metric-card nexus-metric--time">
            <div class="nexus-metric-icon">
              <n-icon :component="Clock3" :size="18" />
            </div>
            <div class="nexus-metric-data">
              <div class="metric-num">
                {{ todayTimeDisplayNum }}<span class="metric-unit">{{ todayTimeUnit }}</span>
              </div>
              <div class="metric-sub">今日投入</div>
            </div>
          </div>

          <div class="nexus-metric-card nexus-metric--tasks">
            <div class="nexus-metric-icon">
              <n-icon :component="Sparkles" :size="18" />
            </div>
            <div class="nexus-metric-data">
              <div class="metric-num">{{ completionLabel }}</div>
              <div class="metric-sub">任务完成</div>
            </div>
          </div>
        </div>

        <!-- 底部：4 大快捷跳板 2x2 网格 -->
        <div v-if="quickActions.length" class="hero-jumpers-grid">
          <button
            v-for="action in quickActions"
            :key="action.key"
            type="button"
            class="jumper-card"
            :class="`jumper-card--${action.key}`"
            @click="emit('quick-action', action)"
          >
            <div class="jumper-icon-box">
              <n-icon :component="getQuickActionIcon(action.key)" :size="16" />
            </div>
            <div class="jumper-content">
              <div class="jumper-top">
                <span class="jumper-title">{{ action.label }}</span>
                <n-icon :component="ArrowRight" :size="13" class="jumper-arrow" />
              </div>
              <span class="jumper-desc">{{ action.description }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hub-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 28px;
  padding: 32px 36px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  box-shadow: 0 24px 72px rgba(2, 6, 23, 0.34);
  transition: all 0.3s ease;
}

/* 浅色主题容器外观 */
:global(html[data-theme='light'] .hub-hero) {
  border-color: rgba(203, 213, 225, 0.72) !important;
  background:
    radial-gradient(circle at top right, var(--tone-cyan-soft), transparent 32%),
    radial-gradient(circle at bottom left, var(--tone-blue-soft), transparent 28%),
    linear-gradient(180deg, var(--card-bg), var(--surface-muted));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 20px 44px rgba(15, 23, 42, 0.08);
}

/* --- 顶栏区域 --- */
.hero-topline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.hero-intro {
  flex: 1 1 500px;
  min-width: 0;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.hero-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--secondary-text);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero-meta-item--accent {
  background: rgba(30, 107, 82, 0.14);
  border-color: rgba(30, 107, 82, 0.28);
  color: #8cc3ad;
}

:global(html[data-theme='light'] .hero-meta-item) {
  background: rgba(255, 255, 255, 0.94) !important;
  border-color: rgba(203, 213, 225, 0.8) !important;
  color: var(--secondary-text);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

:global(html[data-theme='light'] .hero-meta-item--accent) {
  background: rgba(238, 242, 255, 0.95) !important;
  border-color: rgba(140, 195, 173, 0.5) !important;
  color: #1e6b52 !important;
}

.hero-headline-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 3.2vw, 2.75rem);
  font-weight: 850;
  letter-spacing: -0.025em;
  color: var(--text-color);
  line-height: 1.1;
}

:global(html[data-theme='light'] .hero-title) {
  color: var(--text-color);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.35);
  color: var(--tone-emerald);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

:global(html[data-theme='light'] .hero-badge) {
  border-color: #cfe3da !important;
  color: #174f3d !important;
}

.hero-subtitle {
  max-width: 38rem;
  margin: 10px 0 0;
  color: var(--secondary-text);
  font-size: 14px;
  line-height: 1.6;
}

:global(html[data-theme='light'] .hero-subtitle) {
  color: var(--secondary-text);
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--secondary-text);
  font-size: 12px;
  font-weight: 600;
}

:global(html[data-theme='light'] .hero-status-pill) {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(203, 213, 225, 0.8) !important;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.8;
  }
}

/* --- 主体双栏网格 --- */
.hero-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 1fr);
  gap: 22px;
  align-items: stretch;
}

/* --- 左侧聚焦任务舱 --- */
.hero-focus-chamber {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.24);
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

:global(html[data-theme='light'] .hero-focus-chamber) {
  border-color: rgba(30, 107, 82, 0.22) !important;
}

.hero-focus-chamber:hover {
  border-color: rgba(30, 107, 82, 0.4);
}

.focus-chamber-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.focus-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tone-emerald);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

:global(html[data-theme='light'] .focus-tag) {
  color: #1e6b52 !important;
}

.focus-status-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--tone-emerald);
  font-weight: 600;
}

:global(html[data-theme='light'] .focus-status-badge) {
  background: rgba(220, 252, 231, 0.95) !important;
  border-color: rgba(34, 197, 94, 0.3) !important;
  color: #15803d !important;
}

.focus-chamber-body {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 20px;
}

.focus-icon-capsule {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-emerald);
  flex-shrink: 0;
}

:global(html[data-theme='light'] .focus-icon-capsule) {
  border-color: rgba(30, 107, 82, 0.3) !important;
  color: #1e6b52 !important;
}

.focus-main-info {
  flex: 1;
  min-width: 0;
}

.focus-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.focus-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 750;
  color: var(--text-color);
  line-height: 1.3;
}

:global(html[data-theme='light'] .focus-title) {
  color: var(--text-color);
}

.focus-xp-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--tone-amber);
}

:global(html[data-theme='light'] .focus-xp-pill) {
  background: rgba(254, 243, 199, 0.95) !important;
  border-color: rgba(245, 158, 11, 0.35) !important;
  color: #b45309 !important;
}

.focus-description {
  margin: 0 0 14px;
  color: var(--secondary-text);
  font-size: 13.5px;
  line-height: 1.55;
}

:global(html[data-theme='light'] .focus-description) {
  color: var(--secondary-text);
}

.focus-progress-wrapper {
  margin-top: 8px;
}

.focus-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary-text);
  margin-bottom: 6px;
}

:global(html[data-theme='light'] .focus-progress-meta) {
  color: var(--secondary-text);
}

.progress-meta-value {
  color: var(--tone-emerald);
  font-weight: 700;
}

:global(html[data-theme='light'] .progress-meta-value) {
  color: #1e6b52 !important;
}

.focus-progress-track {
  width: 100%;
  height: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  position: relative;
}

:global(html[data-theme='light'] .focus-progress-track) {
  background: rgba(226, 232, 240, 0.8) !important;
}

.focus-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--brand);
  position: relative;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-light-sweep {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  animation: sweep 2.5s infinite;
}

@keyframes sweep {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.focus-chamber-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

:global(html[data-theme='light'] .focus-chamber-footer) {
  border-top-color: rgba(226, 232, 240, 0.8) !important;
}

.focus-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--secondary-text);
  font-size: 12px;
}

:global(html[data-theme='light'] .focus-tips) {
  color: var(--secondary-text);
}

.focus-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: var(--radius-lg);
  background: var(--brand);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--brand-ink);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.focus-action-btn:hover {
  transform: translateY(-2px);
}

.focus-action-btn:active {
  transform: translateY(0);
}

.focus-action-btn .btn-arrow {
  transition: transform 0.2s ease;
}

.focus-action-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* --- 右侧全景仪表看板 --- */
.hero-nexus-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: space-between;
}

/* --- 三大核心指标卡横向网格 --- */
.hero-metrics-trio {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.nexus-metric-card {
  padding: 14px 12px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

:global(html[data-theme='light'] .nexus-metric-card) {
  border-color: rgba(203, 213, 225, 0.72) !important;
}

.nexus-metric-card:hover {
  transform: translateY(-2px);
}

.nexus-metric-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nexus-metric--streak .nexus-metric-icon {
  background: rgba(249, 115, 22, 0.18);
  color: var(--tone-orange);
}

.nexus-metric--time .nexus-metric-icon {
  background: rgba(43, 122, 96, 0.18);
  color: var(--tone-emerald);
}

.nexus-metric--tasks .nexus-metric-icon {
  background: rgba(16, 185, 129, 0.18);
  color: var(--tone-emerald);
}

:global(html[data-theme='light'] .nexus-metric--streak .nexus-metric-icon) {
  background: #ffedd5 !important;
  color: #ea580c !important;
}

:global(html[data-theme='light'] .nexus-metric--time .nexus-metric-icon) {
  background: #e0f2fe !important;
  color: #0284c7 !important;
}

:global(html[data-theme='light'] .nexus-metric--tasks .nexus-metric-icon) {
  background: #dcfce7 !important;
  color: #16a34a !important;
}

.metric-num {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: baseline;
  gap: 3px;
}

:global(html[data-theme='light'] .metric-num) {
  color: var(--text-color);
}

.metric-unit {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .metric-unit) {
  color: var(--secondary-text);
}

.metric-sub {
  margin-top: 2px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .metric-sub) {
  color: var(--secondary-text);
}

/* --- 快捷跳板 2x2 网格 --- */
.hero-jumpers-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.jumper-card {
  padding: 12px 14px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(html[data-theme='light'] .jumper-card) {
  border-color: rgba(203, 213, 225, 0.72) !important;
}

.jumper-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.35);
}

.jumper-icon-box {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: rgba(30, 107, 82, 0.15);
  color: var(--tone-emerald);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

:global(html[data-theme='light'] .jumper-icon-box) {
  background: #eef5f1 !important;
  color: #1e6b52 !important;
}

.jumper-card:hover .jumper-icon-box {
  transform: scale(1.1);
}

.jumper-card--challenge .jumper-icon-box {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
}
:global(html[data-theme='light'] .jumper-card--challenge .jumper-icon-box) {
  background: #dcfce7 !important;
  color: #16a34a !important;
}

.jumper-card--modules .jumper-icon-box {
  background: rgba(30, 107, 82, 0.15);
  color: var(--brand);
}
:global(html[data-theme='light'] .jumper-card--modules .jumper-icon-box) {
  background: #e0f2fe !important;
  color: #0284c7 !important;
}

.jumper-card--flashcards .jumper-icon-box {
  background: rgba(245, 158, 11, 0.15);
  color: var(--tone-amber);
}
:global(html[data-theme='light'] .jumper-card--flashcards .jumper-icon-box) {
  background: #fef3c7 !important;
  color: #d97706 !important;
}

.jumper-card--listening .jumper-icon-box {
  background: rgba(43, 122, 96, 0.15);
  color: var(--brand);
}
:global(html[data-theme='light'] .jumper-card--listening .jumper-icon-box) {
  background: #f3e8ff !important;
  color: #9333ea !important;
}

.jumper-content {
  flex: 1;
  min-width: 0;
}

.jumper-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.jumper-title {
  font-size: 13.5px;
  font-weight: 750;
  color: var(--text-color);
}

:global(html[data-theme='light'] .jumper-title) {
  color: var(--text-color);
}

.jumper-arrow {
  color: var(--secondary-text);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.jumper-card:hover .jumper-arrow {
  transform: translateX(3px);
  color: var(--tone-emerald);
}

:global(html[data-theme='light'] .jumper-card:hover .jumper-arrow) {
  color: #1e6b52 !important;
}

.jumper-desc {
  display: block;
  font-size: 11.5px;
  color: var(--secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(html[data-theme='light'] .jumper-desc) {
  color: var(--secondary-text);
}

/* --- 响应式适配 --- */
@media (max-width: 1180px) {
  .hero-main-grid {
    grid-template-columns: 1fr;
  }

  .hero-focus-chamber {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .hub-hero {
    padding: 16px;
    border-radius: var(--radius-lg);
    margin-bottom: 20px;
  }

  .hero-topline {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 16px;
  }

  .hero-intro {
    flex: 0 0 auto;
  }

  .hero-status-pill {
    width: 100%;
    justify-content: center;
  }

  .focus-chamber-body {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }

  .focus-icon-capsule {
    width: 48px;
    height: 48px;
  }

  .focus-chamber-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .focus-action-btn {
    width: 100%;
    height: 44px;
  }

  .hero-metrics-trio {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .nexus-metric-card {
    padding: 10px 8px;
  }

  .metric-num {
    font-size: 1.1rem;
  }

  .hero-jumpers-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .nexus-metric-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .jumper-desc {
    display: none;
  }
}
</style>
