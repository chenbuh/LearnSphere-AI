<template>
  <header class="stage-header" :class="{ 'stage-header--compact': compact }">
    <div class="stage-main">
      <p class="stage-kicker">{{ kicker }}</p>
      <h1 class="stage-title">{{ title }}</h1>
      <p v-if="description" class="stage-description">{{ description }}</p>
    </div>

    <div class="stage-side">
      <div v-if="summaryItems.length" class="stage-summary">
        <div
          v-for="item in summaryItems"
          :key="item.label"
          class="summary-item"
        >
          <span class="summary-label">{{ item.label }}</span>
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
  margin: 0 0 10px;
  color: var(--stage-accent-start);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: none;
}

.stage-title {
  margin: 0 0 12px;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  font-weight: 800;
  line-height: 0.98;
  background: linear-gradient(120deg, var(--stage-accent-start), var(--stage-accent-end) 55%, var(--stage-accent-end));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stage-header--compact .stage-title {
  font-size: clamp(1.9rem, 3vw, 2.6rem);
}

.stage-description {
  max-width: 44rem;
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.7;
}

.stage-side {
  display: grid;
  gap: 12px;
}

.stage-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.summary-item {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.3)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--stage-accent-start) 20%, transparent), transparent 42%);
}

.summary-label {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-value {
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
}

.stage-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:global(html[data-theme='light'] .stage-header) {
  border-bottom-color: rgba(148, 163, 184, 0.18);
}

:global(html[data-theme='light'] .summary-item) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, color-mix(in srgb, var(--stage-accent-start) 14%, transparent), transparent 46%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
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
    border-radius: 16px;
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
    border-radius: 14px;
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
