<script setup>
import { computed } from 'vue'
import { Brain, Target, TrendingUp, Zap, Sparkles, Award, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-vue-next'
import { NIcon } from 'naive-ui'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  hints: {
    type: Object,
    default: () => ({})
  },
  strongest: {
    type: Object,
    default: null
  },
  weakest: {
    type: Object,
    default: null
  }
})

// 计算综合能力得分数值 (0~100)
const overallScore = computed(() => {
  const val = Number(props.stats.overall)
  return Number.isFinite(val) ? Math.max(0, Math.min(100, Math.round(val))) : 0
})

// 环形仪表盘参数 (SVG 半径 56, 周长 2 * PI * 56 ≈ 351.86)
const RADIUS = 56
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const strokeDashoffset = computed(() => {
  const progress = overallScore.value / 100
  return CIRCUMFERENCE * (1 - progress)
})

// 能力段位等级评定
const tierBadge = computed(() => {
  const s = overallScore.value
  if (s >= 85) return { name: '卓越精通 · L4', tone: 'master', desc: '全维度领先' }
  if (s >= 65) return { name: '熟练进阶 · L3', tone: 'advanced', desc: '基础扎实稳固' }
  if (s >= 40) return { name: '爬坡强化 · L2', tone: 'intermediate', desc: '处于快速上升期' }
  return { name: '起步建档 · L1', tone: 'beginner', desc: '等待持续积累' }
})

// 右侧 3 大指标配置
const secondaryItems = computed(() => {
  const growthNum = Number(props.stats.growth) || 0
  const gapNum = Number(props.stats.gap) || 0
  const predictNum = Number(props.stats.predict) || 0

  let growthStatus = '平稳'
  let GrowthStatusIcon = Minus
  if (growthNum > 0) {
    growthStatus = '上升'
    GrowthStatusIcon = ArrowUpRight
  } else if (growthNum < 0) {
    growthStatus = '回调'
    GrowthStatusIcon = ArrowDownRight
  }

  return [
    {
      key: 'growth',
      icon: TrendingUp,
      statusIcon: GrowthStatusIcon,
      tone: 'positive',
      badge: growthStatus,
      value: `${growthNum > 0 ? '+' : ''}${growthNum}%`,
      progress: Math.min(Math.abs(growthNum) * 2, 100),
      note: props.hints.growth || '对比近 7 天与前 7 天正确率'
    },
    {
      key: 'gap',
      icon: Target,
      tone: 'warning',
      badge: gapNum > 0 ? '需攻坚' : '已达成',
      value: `${gapNum}%`,
      progress: Math.max(0, 100 - gapNum),
      note: props.hints.gap || '离阶段目标线的差距'
    },
    {
      key: 'predict',
      icon: Zap,
      tone: 'info',
      badge: predictNum > 0 ? '全真推算' : '等待样本',
      value: predictNum > 0 ? `${predictNum}` : '--',
      suffix: predictNum > 0 ? '/710' : '',
      progress: predictNum > 0 ? Math.min(Math.round((predictNum / 710) * 100), 100) : 0,
      note: props.hints.predict || 'CET 分值区间估算'
    }
  ]
})
</script>

<template>
  <section class="overview-section">
    <!-- 左侧：综合能力值核心仪表看板 -->
    <article class="overview-primary">
      <div class="overview-primary__ambient"></div>

      <!-- 顶栏标题与段位徽章 -->
      <div class="overview-primary__head">
        <div class="overview-primary__heading">
          <div class="overview-kicker-wrap">
            <span class="overview-kicker-dot"></span>
            <p class="overview-kicker">{{ hints.primaryKicker || 'Capability Overview' }}</p>
          </div>
          <h2 class="overview-primary__title">{{ labels.overall }}</h2>
        </div>

        <div class="overview-primary__badge" :class="`overview-primary__badge--${tierBadge.tone}`">
          <n-icon :component="Award" :size="15" />
          <span>{{ tierBadge.name }}</span>
        </div>
      </div>

      <!-- 中间核心区：环形微光仪表盘 + 诊断解读 -->
      <div class="overview-primary__center">
        <!-- SVG 环形仪表盘 -->
        <div class="overview-gauge">
          <svg class="overview-gauge__svg" viewBox="0 0 140 140">
            <defs>
              <linearGradient id="primaryGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="50%" stop-color="#5fa88b" />
                <stop offset="100%" stop-color="#34d399" />
              </linearGradient>
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <!-- 仪表盘底环 -->
            <circle
              class="overview-gauge__track"
              cx="70"
              cy="70"
              :r="RADIUS"
            />
            <!-- 动态彩色进度环 -->
            <circle
              class="overview-gauge__fill"
              cx="70"
              cy="70"
              :r="RADIUS"
              :stroke-dasharray="CIRCUMFERENCE"
              :stroke-dashoffset="strokeDashoffset"
              filter="url(#gaugeGlow)"
            />
          </svg>

          <!-- 环心核心数值 -->
          <div class="overview-gauge__inner">
            <span class="overview-gauge__val">{{ overallScore }}</span>
            <span class="overview-gauge__scale">/ 100</span>
          </div>
        </div>

        <!-- 环侧解读与段位摘要 -->
        <div class="overview-primary__details">
          <div class="overview-primary__status-pill">
            <n-icon :component="Brain" :size="16" class="pill-brain-icon" />
            <span class="pill-text">{{ tierBadge.desc }}</span>
          </div>

          <p class="overview-primary__note">
            {{ hints.overall }}
          </p>

          <!-- 快速两极对照 -->
          <div class="overview-poles" v-if="strongest || weakest">
            <div class="pole-chip pole-chip--lead" v-if="strongest">
              <span class="pole-label">优势领跑</span>
              <span class="pole-val">{{ strongest.name }} ({{ strongest.current }})</span>
            </div>
            <div class="pole-chip pole-chip--focus" v-if="weakest">
              <span class="pole-label">优先聚焦</span>
              <span class="pole-val">{{ weakest.name }} ({{ weakest.current }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部科技微光进度条 -->
      <div class="overview-primary__footer">
        <div class="overview-primary__track">
          <span
            class="overview-primary__bar"
            :style="{ width: `${Math.max(6, Math.min(overallScore, 100))}%` }"
          >
            <span class="overview-primary__bar-glow"></span>
          </span>
        </div>
        <div class="overview-primary__track-labels">
          <span>0 起步</span>
          <span>50 进阶</span>
          <span>100 卓越</span>
        </div>
      </div>
    </article>

    <!-- 右侧：三大指标 Bento 晶体卡片 -->
    <div class="overview-secondary">
      <article
        v-for="item in secondaryItems"
        :key="item.key"
        class="overview-card"
        :class="`overview-card--${item.tone}`"
      >
        <div class="overview-card__header">
          <div class="overview-card__icon-box">
            <n-icon :component="item.icon" :size="20" />
          </div>
          <span class="overview-card__badge">
            <n-icon v-if="item.statusIcon" :component="item.statusIcon" :size="12" />
            {{ item.badge }}
          </span>
        </div>

        <div class="overview-card__body">
          <span class="overview-card__label">{{ labels[item.key] }}</span>
          <div class="overview-card__val-row">
            <strong class="overview-card__value">
              {{ item.value }}
              <small v-if="item.suffix">{{ item.suffix }}</small>
            </strong>
          </div>
          <p class="overview-card__note">{{ item.note }}</p>
        </div>

        <!-- 卡片底部微型态势条 -->
        <div class="overview-card__track">
          <span
            class="overview-card__bar"
            :style="{ width: `${Math.max(4, Math.min(item.progress, 100))}%` }"
          ></span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.overview-section {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(350px, 0.85fr);
  gap: 22px;
  margin-bottom: 24px;
}

/* ==========================================================================
   左侧：综合能力值核心仪表看板
   ========================================================================== */
.overview-primary {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
  padding: 26px 28px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: var(--card-bg);
}

.overview-primary__ambient {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.overview-primary__head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.overview-primary__heading {
  display: grid;
  gap: 6px;
}

.overview-kicker-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.overview-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--brand);
}

.overview-kicker {
  margin: 0;
  color: var(--brand);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.overview-primary__title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.36rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.overview-primary__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: var(--surface-muted);
}

.overview-primary__badge--master {
  color: var(--tone-emerald);
  border-color: rgba(52, 211, 153, 0.3);
  background: rgba(16, 185, 129, 0.12);
}

.overview-primary__badge--advanced {
  color: var(--brand);
  border-color: rgba(30, 107, 82, 0.3);
  background: rgba(30, 107, 82, 0.12);
}

.overview-primary__badge--intermediate {
  color: var(--tone-emerald);
  border-color: rgba(95, 168, 139, 0.3);
  background: rgba(30, 107, 82, 0.12);
}

.overview-primary__badge--beginner {
  color: var(--secondary-text);
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(148, 163, 184, 0.08);
}

/* 环形仪表盘 + 解读 */
.overview-primary__center {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 6px 0;
}

.overview-gauge {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.overview-gauge__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.overview-gauge__track {
  fill: none;
  stroke: rgba(148, 163, 184, 0.14);
  stroke-width: 9;
}

.overview-gauge__fill {
  fill: none;
  stroke: url(#primaryGaugeGradient);
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.overview-gauge__inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.overview-gauge__val {
  color: var(--text-color);
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-feature-settings: 'tnum';
}

.overview-gauge__scale {
  margin-top: 3px;
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.overview-primary__details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.overview-primary__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid rgba(30, 107, 82, 0.22);
  background: rgba(30, 107, 82, 0.08);
}

.pill-brain-icon {
  color: var(--brand);
}

.pill-text {
  color: var(--tone-blue);
  font-size: 0.8rem;
  font-weight: 700;
}

.overview-primary__note {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.92rem;
  line-height: 1.6;
}

.overview-poles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 2px;
}

.pole-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 0.76rem;
  background: var(--surface-muted);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.pole-chip--lead {
  border-color: rgba(52, 211, 153, 0.24);
}

.pole-chip--lead .pole-label {
  color: var(--tone-emerald);
  font-weight: 700;
}

.pole-chip--lead .pole-val {
  color: var(--text-color);
}

.pole-chip--focus {
  border-color: rgba(245, 158, 11, 0.24);
}

.pole-chip--focus .pole-label {
  color: var(--tone-amber);
  font-weight: 700;
}

.pole-chip--focus .pole-val {
  color: var(--text-color);
}

/* 底部进度条 */
.overview-primary__footer {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
}

.overview-primary__track {
  position: relative;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.8);
}

.overview-primary__bar {
  position: relative;
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--brand);
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.overview-primary__bar-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 100%;
  border-radius: 999px;
  background: #ffffff;
}

.overview-primary__track-labels {
  display: flex;
  justify-content: space-between;
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 600;
}

/* ==========================================================================
   右侧：三大指标 Bento 晶体卡片
   ========================================================================== */
.overview-secondary {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
}

.overview-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: var(--card-bg);
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.22s ease, box-shadow 0.22s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.3);
}

.overview-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.overview-card__icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.overview-card--positive .overview-card__icon-box {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.24);
}

.overview-card--warning .overview-card__icon-box {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(251, 191, 36, 0.24);
}

.overview-card--info .overview-card__icon-box {
  color: var(--tone-blue);
  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(96, 165, 250, 0.24);
}

.overview-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: var(--surface-muted);
  color: var(--secondary-text);
}

.overview-card--positive .overview-card__badge {
  color: var(--tone-emerald);
  border-color: rgba(52, 211, 153, 0.24);
  background: rgba(16, 185, 129, 0.1);
}

.overview-card--warning .overview-card__badge {
  color: var(--tone-amber);
  border-color: rgba(251, 191, 36, 0.24);
  background: rgba(245, 158, 11, 0.1);
}

.overview-card--info .overview-card__badge {
  color: var(--tone-blue);
  border-color: rgba(96, 165, 250, 0.24);
  background: rgba(59, 130, 246, 0.1);
}

.overview-card__body {
  display: grid;
  gap: 3px;
  margin: 8px 0;
}

.overview-card__label {
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-card__val-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.overview-card__value {
  color: var(--text-color);
  font-size: 1.72rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-feature-settings: 'tnum';
}

.overview-card__value small {
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 3px;
}

.overview-card__note {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.78rem;
  line-height: 1.45;
}

.overview-card__track {
  height: 4px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.7);
  overflow: hidden;
  margin-top: 4px;
}

.overview-card__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.6s ease;
}

.overview-card--positive .overview-card__bar {
  background: #10b981;
}

.overview-card--warning .overview-card__bar {
  background: #f59e0b;
}

.overview-card--info .overview-card__bar {
  background: #3b82f6;
}

/* ==========================================================================
   浅色模式高质感白金极光适配
   ========================================================================== */
:global(html[data-theme='light'] .overview-primary) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .overview-primary__title),
:global(html[data-theme='light'] .overview-gauge__val),
:global(html[data-theme='light'] .overview-card__value) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .overview-gauge__track) {
  stroke: rgba(148, 163, 184, 0.25);
}

:global(html[data-theme='light'] .overview-gauge__scale),
:global(html[data-theme='light'] .overview-primary__track-labels) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .overview-primary__note),
:global(html[data-theme='light'] .overview-card__label),
:global(html[data-theme='light'] .overview-card__note) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .overview-primary__status-pill) {
  border-color: rgba(30, 107, 82, 0.35);
  background: rgba(224, 242, 254, 0.7);
}

:global(html[data-theme='light'] .pill-text) {
  color: var(--tone-blue);
}

:global(html[data-theme='light'] .pole-chip) {
  background: var(--surface-muted);
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .pole-chip--lead .pole-val),
:global(html[data-theme='light'] .pole-chip--focus .pole-val) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .overview-primary__track) {
  background: rgba(226, 232, 240, 0.9);
}

:global(html[data-theme='light'] .overview-card) {
  border-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .overview-card:hover) {
  border-color: rgba(30, 107, 82, 0.4);
}

:global(html[data-theme='light'] .overview-card__track) {
  background: rgba(226, 232, 240, 0.85);
}

:global(html[data-theme='light'] .overview-card__value small) {
  color: var(--secondary-text);
}

/* ==========================================================================
   响应式断点适配
   ========================================================================== */
@media (max-width: 1100px) {
  .overview-section {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .overview-secondary {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
  }
}

@media (max-width: 768px) {
  .overview-secondary {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .overview-primary__center {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
  }

  .overview-gauge {
    align-self: center;
  }

  .overview-primary {
    padding: 22px 20px;
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 480px) {
  .overview-primary {
    padding: 18px 16px;
    border-radius: var(--radius-lg);
  }

  .overview-primary__title {
    font-size: 1.18rem;
  }

  .overview-gauge {
    width: 120px;
    height: 120px;
  }

  .overview-gauge__val {
    font-size: 2.3rem;
  }

  .overview-card {
    padding: 14px 16px;
  }

  .overview-card__value {
    font-size: 1.5rem;
  }
}
</style>

