<script setup>
import { computed } from 'vue'
import { Brain, Target, TrendingUp, Zap } from 'lucide-vue-next'
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
  }
})

const secondaryItems = computed(() => [
  {
    key: 'growth',
    icon: TrendingUp,
    tone: 'positive',
    value: `${Number(props.stats.growth) > 0 ? '+' : ''}${props.stats.growth}%`,
    note: props.hints.growth || ''
  },
  {
    key: 'gap',
    icon: Target,
    tone: 'warning',
    value: `${props.stats.gap}%`,
    note: props.hints.gap || ''
  },
  {
    key: 'predict',
    icon: Zap,
    tone: 'info',
    value: Number(props.stats.predict) > 0 ? `${props.stats.predict}` : '--',
    suffix: Number(props.stats.predict) > 0 ? '/710' : '',
    note: props.hints.predict || ''
  }
])
</script>

<template>
  <section class="overview-section">
    <article class="overview-primary">
      <div class="overview-primary__head">
        <div>
          <p class="overview-kicker">{{ hints.primaryKicker || 'Capability Overview' }}</p>
          <h2 class="overview-primary__title">{{ labels.overall }}</h2>
        </div>
        <div class="overview-primary__icon">
          <n-icon :component="Brain" />
        </div>
      </div>

      <div class="overview-primary__value">
        {{ stats.overall }}
      </div>

      <p class="overview-primary__note">
        {{ hints.overall }}
      </p>

      <div class="overview-primary__track">
        <span :style="{ width: `${Math.max(8, Math.min(Number(stats.overall) || 0, 100))}%` }"></span>
      </div>
    </article>

    <div class="overview-secondary">
      <article
        v-for="item in secondaryItems"
        :key="item.key"
        class="overview-stat"
        :class="`overview-stat--${item.tone}`"
      >
        <div class="overview-stat__icon">
          <n-icon :component="item.icon" />
        </div>
        <div class="overview-stat__body">
          <span class="overview-stat__label">{{ labels[item.key] }}</span>
          <strong class="overview-stat__value">
            {{ item.value }}
            <small v-if="item.suffix">{{ item.suffix }}</small>
          </strong>
          <span class="overview-stat__note">{{ item.note }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.overview-section {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  gap: 20px;
  margin-bottom: 24px;
}

.overview-primary,
.overview-stat {
  min-width: 0;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.42), rgba(7, 14, 29, 0.2)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.05), transparent 40%);
}

.overview-primary {
  display: grid;
  gap: 14px;
  padding: 24px 26px;
  border-radius: 28px;
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.14);
}

.overview-primary__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.overview-kicker {
  margin: 0 0 8px;
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.overview-primary__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.28rem;
  font-weight: 700;
}

.overview-primary__icon,
.overview-stat__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 18px;
}

.overview-primary__icon {
  width: 58px;
  height: 58px;
  color: #7dd3fc;
  font-size: 28px;
  background: rgba(56, 189, 248, 0.12);
}

.overview-primary__value {
  color: #f8fafc;
  font-size: clamp(3rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.05em;
}

.overview-primary__note {
  max-width: 32rem;
  margin: 0;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.65;
}

.overview-primary__track {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(51, 65, 85, 0.7);
}

.overview-primary__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0ea5e9, #22c55e);
}

.overview-secondary {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.42), rgba(7, 14, 29, 0.2)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.05), transparent 40%);
  box-shadow: 0 16px 36px rgba(2, 6, 23, 0.12);
}

.overview-stat {
  display: flex;
  gap: 16px;
  padding: 20px 20px 18px;
  border: none;
  border-radius: 0;
  background: transparent;
  transition: transform 0.18s ease, background 0.18s ease;
}

.overview-stat + .overview-stat {
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.overview-stat::before {
  content: '';
  align-self: stretch;
  width: 1px;
  margin-right: 2px;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0), rgba(148, 163, 184, 0.16), rgba(148, 163, 184, 0));
}

.overview-stat:hover {
  transform: translateY(-2px);
  background: rgba(15, 23, 42, 0.24);
}

.overview-stat__icon {
  width: 44px;
  height: 44px;
  font-size: 22px;
}

.overview-stat--positive .overview-stat__icon {
  color: #34d399;
  background: rgba(16, 185, 129, 0.14);
}

.overview-stat--warning .overview-stat__icon {
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.14);
}

.overview-stat--info .overview-stat__icon {
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.14);
}

.overview-stat__body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.overview-stat__label {
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-stat__value {
  color: #f8fafc;
  font-size: 1.9rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}

.overview-stat__value small {
  margin-left: 4px;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 600;
}

.overview-stat__note {
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.5;
}

:global(html[data-theme='light'] .overview-primary),
:global(html[data-theme='light'] .overview-secondary) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), transparent 40%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .overview-primary__title),
:global(html[data-theme='light'] .overview-primary__value),
:global(html[data-theme='light'] .overview-stat__value) {
  color: #0f172a;
}

:global(html[data-theme='light'] .overview-primary__note),
:global(html[data-theme='light'] .overview-stat__label),
:global(html[data-theme='light'] .overview-stat__note),
:global(html[data-theme='light'] .overview-stat__value small) {
  color: #64748b;
}

:global(html[data-theme='light'] .overview-stat + .overview-stat) {
  border-top-color: rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='light'] .overview-stat:hover) {
  background: rgba(241, 245, 249, 0.76);
}

:global(html[data-theme='light'] .overview-primary__track) {
  background: rgba(148, 163, 184, 0.2);
}

@media (max-width: 1150px) {
  .overview-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .overview-section {
    gap: 14px;
    margin-bottom: 18px;
  }

  .overview-primary {
    padding: 20px 18px;
    border-radius: 22px;
  }

  .overview-primary__value {
    font-size: 2.75rem;
  }

  .overview-stat {
    padding: 16px;
  }

  .overview-secondary {
    border-radius: 22px;
  }

  .overview-stat::before {
    display: none;
  }

  .overview-stat__value {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .overview-section {
    gap: 12px;
    margin-bottom: 16px;
  }

  .overview-primary {
    gap: 12px;
    padding: 16px 14px;
    border-radius: 18px;
  }

  .overview-primary__head {
    gap: 12px;
  }

  .overview-primary__icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    font-size: 22px;
  }

  .overview-primary__title {
    font-size: 1.08rem;
  }

  .overview-primary__value {
    font-size: 2.35rem;
  }

  .overview-primary__note {
    font-size: 0.84rem;
    line-height: 1.55;
  }

  .overview-secondary {
    border-radius: 18px;
  }

  .overview-stat {
    gap: 12px;
    padding: 14px 13px;
  }

  .overview-stat__icon {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }

  .overview-stat__value {
    font-size: 1.42rem;
  }
}

@media (max-width: 360px) {
  .overview-primary__head,
  .overview-stat {
    align-items: flex-start;
  }

  .overview-stat {
    flex-direction: column;
  }

  .overview-stat__value {
    font-size: 1.3rem;
  }

  .overview-stat__note {
    font-size: 0.78rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .overview-primary {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .overview-stat {
    padding-top: 12px;
    padding-bottom: 12px;
  }
}
</style>
