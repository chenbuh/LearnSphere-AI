<template>
  <header class="stage-header" :class="{ 'stage-header--compact': compact }">
    <div class="stage-main">
      <p class="stage-kicker">{{ kicker }}</p>
      <h1 class="stage-title">{{ title }}</h1>
      <p v-if="description" class="stage-description">{{ description }}</p>
    </div>

    <div class="stage-side">
      <div v-if="summaryItems.length" class="stage-summary">
        <div v-for="item in summaryItems" :key="item.label" class="summary-item">
          <div class="summary-top">
            <span class="summary-label">{{ item.label }}</span>
            <div v-if="item.icon" class="summary-icon-box">
              <component :is="item.icon" :size="14" />
            </div>
          </div>
          <strong class="summary-value">{{ item.value }}</strong>
        </div>
      </div>

      <div v-if="$slots.actions" class="stage-actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  kicker: {
    type: String,
    default: 'Learning Studio'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  summaryItems: {
    type: Array,
    default: () => []
  },
  accentStart: {
    type: String,
    default: '#fb923c'
  },
  accentEnd: {
    type: String,
    default: '#f97316'
  },
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.stage-header {
  --stage-accent-start: v-bind('props.accentStart');
  --stage-accent-end: v-bind('props.accentEnd');
  display: grid;
  grid-template-columns: minmax(0, 1.24fr) minmax(300px, 0.76fr);
  gap: 24px;
  align-items: end;
  margin-bottom: 28px;
  padding: 0 0 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.stage-main {
  min-width: 0;
}

.stage-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  padding: 4px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--stage-accent-start) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--stage-accent-start) 24%, transparent);
  /* 各页面传入的 accent 多为亮色，直接作文字色在浅色主题不足 3:1，正文改用令牌 */
  color: var(--text-color);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: none;
  width: fit-content;
}

.stage-kicker::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--stage-accent-start);
}

.stage-title {
  margin: 0 0 12px;
  font-size: clamp(2.2rem, 4vw, 3.2rem);
  font-weight: 850;
  line-height: 1.08;
  letter-spacing: -0.02em;
  background: none;
  color: inherit;
}

.stage-header--compact .stage-title {
  font-size: clamp(1.9rem, 3vw, 2.6rem);
}

.stage-description {
  max-width: 44rem;
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.95rem;
  line-height: 1.65;
}

.stage-side {
  display: grid;
  gap: 12px;
}

.stage-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-item {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--card-bg);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-item:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--stage-accent-start) 45%, transparent);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.summary-icon-box {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--stage-accent-start) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--stage-accent-start) 26%, transparent);
  color: var(--stage-accent-start);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.summary-item:hover .summary-icon-box {
  transform: scale(1.08);
  background: color-mix(in srgb, var(--stage-accent-start) 22%, transparent);
}

.summary-label {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-value {
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.stage-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:global(html[data-theme='light'] .stage-header) {
  border-bottom-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .stage-title) {
  background: none;
  color: inherit;
  filter: none;
}

:global(html[data-theme='light'] .summary-item) {
  border-color: rgba(226, 232, 240, 0.85);
}

html[data-theme='light'] .summary-value {
  color: var(--text-color);
}

html[data-theme='light'] .summary-label {
  color: var(--secondary-text);
}

html[data-theme='light'] .stage-description {
  color: var(--secondary-text);
}

@media (max-width: 1180px) {
  .stage-header {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .stage-side {
    max-width: 100%;
  }

  .stage-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 900px) {
  .stage-header {
    margin-bottom: 16px;
    padding: 6px 4px 0;
    border-bottom: 0;
  }

  .stage-title,
  .stage-header--compact .stage-title {
    font-size: 1.65rem;
    margin-bottom: 8px;
  }

  .stage-description {
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .stage-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .summary-item {
    padding: 12px;
    border-radius: var(--radius-lg);
  }

  .stage-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .stage-header {
    gap: 16px;
    margin-bottom: 14px;
    padding-left: 0;
    padding-right: 0;
  }

  .stage-title,
  .stage-header--compact .stage-title {
    font-size: 1.48rem;
  }

  .stage-summary {
    grid-template-columns: 1fr;
  }

  .stage-actions {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    gap: 10px;
  }

  :deep(.stage-actions > *) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stage-kicker {
    margin-bottom: 8px;
    font-size: 0.68rem;
  }

  .stage-title,
  .stage-header--compact .stage-title {
    font-size: 1.34rem;
    line-height: 1.08;
  }

  .stage-description {
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .summary-item {
    padding: 10px 12px;
    border-radius: var(--radius-lg);
  }

  .summary-label {
    font-size: 0.66rem;
  }

  .summary-value {
    font-size: 0.94rem;
  }
}

@media (max-width: 360px) {
  .stage-title,
  .stage-header--compact .stage-title {
    font-size: 1.2rem;
  }

  .summary-item {
    padding: 9px 10px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .stage-header {
    margin-bottom: 12px;
  }

  .stage-summary {
    gap: 6px;
  }
}
</style>
