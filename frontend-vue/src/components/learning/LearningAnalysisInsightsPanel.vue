<script setup>
import { computed } from 'vue'
import { AlertCircle, Sparkles, TrendingUp } from 'lucide-vue-next'
import { NIcon, NTag } from 'naive-ui'

const props = defineProps({
  weakPoints: {
    type: Array,
    default: () => []
  },
  trendDays: {
    type: Number,
    default: 7
  },
  labels: {
    type: Object,
    required: true
  },
  trendChartRefSetter: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['change-trend-days'])

const primaryWeakness = computed(() => props.weakPoints[0] || null)
const secondaryWeaknesses = computed(() => props.weakPoints.slice(1, 4))
</script>

<template>
  <section class="insights-board">
    <article class="insight-panel insight-panel--weakness">
      <div class="panel-head">
        <div>
          <p class="panel-kicker">{{ labels.weaknessKicker || 'Weakness Review' }}</p>
          <h3 class="panel-title">{{ labels.weaknessTitle }}</h3>
          <p class="panel-caption">{{ labels.weaknessCaption }}</p>
        </div>
        <n-tag v-if="primaryWeakness" size="small" :bordered="false" class="priority-tag">
          {{ labels.priorityTag }}
        </n-tag>
      </div>

      <div v-if="primaryWeakness" class="weakness-highlight">
        <div class="weakness-highlight__top">
          <div>
            <span class="weakness-highlight__label">{{ labels.priorityLabel }}</span>
            <strong class="weakness-highlight__title">{{ primaryWeakness.title }}</strong>
          </div>
          <div class="weakness-score">
            <span>{{ labels.score }}</span>
            <strong>{{ primaryWeakness.score }}</strong>
          </div>
        </div>

        <p class="weakness-highlight__advice">
          {{ primaryWeakness.advice }}
        </p>
      </div>

      <div v-if="secondaryWeaknesses.length" class="weakness-list">
        <article
          v-for="(wp, idx) in secondaryWeaknesses"
          :key="`${wp.title}-${idx}`"
          class="weakness-item"
        >
          <div class="weakness-item__head">
            <div class="weakness-item__title">
              <n-icon :component="AlertCircle" :color="wp.color || '#f97316'" :size="16" />
              <strong>{{ wp.title }}</strong>
            </div>
            <span class="weakness-item__score">{{ labels.score }} {{ wp.score }}</span>
          </div>
          <p class="weakness-item__advice">
            <span>{{ labels.advice }}:</span>
            {{ wp.advice }}
          </p>
        </article>
      </div>

      <div v-else-if="!primaryWeakness" class="weakness-empty">
        <n-icon :component="Sparkles" size="38" color="#22c55e" />
        <div class="empty-title">{{ labels.noWeaknessTitle }}</div>
        <div class="empty-desc">{{ labels.noWeaknessDesc }}</div>
      </div>
    </article>

    <article class="insight-panel insight-panel--trend">
      <div class="panel-head panel-head--trend">
        <div>
          <p class="panel-kicker">{{ labels.trendKicker || 'Trend Monitor' }}</p>
          <h3 class="panel-title">{{ labels.trendTitle }}</h3>
          <p class="panel-caption">{{ labels.trendCaption }}</p>
        </div>

        <div class="trend-tabs">
          <button
            type="button"
            :class="{ active: trendDays === 7 }"
            @click="emit('change-trend-days', 7)"
          >
            {{ labels.last7Days }}
          </button>
          <button
            type="button"
            :class="{ active: trendDays === 30 }"
            @click="emit('change-trend-days', 30)"
          >
            {{ labels.last30Days }}
          </button>
        </div>
      </div>

      <div class="trend-surface">
        <div class="trend-surface__badge">
          <n-icon :component="TrendingUp" :size="14" />
          <span>{{ labels.trendTitle }}</span>
        </div>
        <div :ref="trendChartRefSetter" class="trend-chart"></div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.insights-board {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
  gap: 24px;
  padding: 8px max(8px, env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom, 0px))
    max(8px, env(safe-area-inset-left));
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.insight-panel {
  min-width: 0;
  padding: 22px 22px 20px;
  border: none;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.12);
}

.insight-panel--trend {
  background: var(--card-bg);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-kicker {
  margin: 0 0 8px;
  color: var(--brand);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.24rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.panel-caption {
  max-width: 32rem;
  margin: 8px 0 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.priority-tag {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.1);
}

.weakness-highlight {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
  padding: 18px;
  border: 1px solid rgba(248, 113, 113, 0.14);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.weakness-highlight__top {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.weakness-highlight__label {
  display: block;
  margin-bottom: 6px;
  color: var(--tone-red);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.weakness-highlight__title {
  display: block;
  color: var(--text-color);
  font-size: 1.2rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.weakness-highlight__advice {
  margin: 0;
  color: var(--text-color);
  font-size: 0.92rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.weakness-score {
  display: grid;
  gap: 4px;
  justify-items: end;
  color: var(--tone-red);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.weakness-score strong {
  color: var(--text-color);
  font-size: 1.7rem;
  line-height: 1;
}

.weakness-list {
  display: grid;
  gap: 12px;
}

.weakness-item {
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
}

.weakness-item__head {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.weakness-item__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  min-width: 0;
  overflow-wrap: anywhere;
}

.weakness-item__score {
  color: var(--tone-red);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.weakness-item__advice {
  margin: 0;
  color: var(--text-color);
  font-size: 0.88rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.weakness-item__advice span {
  color: var(--secondary-text);
}

.weakness-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 214px;
  padding: 30px 20px;
  text-align: center;
  border: 1px dashed rgba(34, 197, 94, 0.16);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
}

.empty-title {
  color: var(--tone-emerald);
  font-size: 1.06rem;
  font-weight: 700;
}

.empty-desc {
  max-width: 28rem;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
}

.panel-head--trend {
  align-items: end;
}

.trend-tabs {
  display: flex;
  flex-wrap: wrap;
  padding: 3px;
  background: var(--surface-muted);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 999px;
  width: fit-content;
  max-width: 100%;
}

.trend-tabs button {
  min-width: 0;
  padding: 7px 12px;
  color: var(--secondary-text);
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 999px;
  background: transparent;
  transition: all 0.2s ease;
}

.trend-tabs button.active {
  color: var(--brand-ink);
  background: var(--brand);
}

.trend-tabs button:hover:not(.active) {
  color: var(--text-color);
}

.trend-surface {
  min-width: 0;
  padding: 14px 16px 10px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
}

.trend-surface__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--tone-blue);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trend-chart {
  width: 100%;
  height: 260px;
  min-width: 0;
}

:global(html[data-theme='light'] .insights-board) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .insight-panel) {
  background: var(--card-bg);
}

:global(html[data-theme='light'] .insight-panel--trend) {
  background: var(--card-bg);
}

:global(html[data-theme='light'] .panel-title),
:global(html[data-theme='light'] .weakness-highlight__title),
:global(html[data-theme='light'] .weakness-item__title) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .panel-caption),
:global(html[data-theme='light'] .weakness-item__advice span),
:global(html[data-theme='light'] .empty-desc) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .weakness-highlight) {
  border-color: rgba(248, 113, 113, 0.18);
}

:global(html[data-theme='light'] .weakness-highlight__advice),
:global(html[data-theme='light'] .weakness-item__advice) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .weakness-item) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.84);
}

:global(html[data-theme='light'] .weakness-empty) {
  border-color: rgba(34, 197, 94, 0.2);
  background: rgba(240, 253, 244, 0.8);
}

:global(html[data-theme='light'] .trend-tabs) {
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .trend-tabs button) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .trend-tabs button:hover:not(.active)) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .trend-surface) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
}

@media (max-width: 1150px) {
  .insights-board {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .insights-board {
    gap: 18px;
    padding: 0 max(env(safe-area-inset-right), 0px) env(safe-area-inset-bottom, 0px)
      max(env(safe-area-inset-left), 0px);
    border: none;
    border-radius: 0;
    background: none;
    box-shadow: none;
  }

  .insight-panel {
    padding: 18px 16px;
    border-radius: var(--radius-lg);
  }

  .panel-head,
  .panel-head--trend,
  .weakness-highlight__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .trend-tabs {
    width: 100%;
  }

  .trend-tabs button {
    flex: 1 1 0;
  }

  .weakness-score {
    justify-items: start;
  }

  .trend-chart {
    height: 224px;
  }
}

@media (max-width: 480px) {
  .insight-panel {
    padding: 16px 14px;
    border-radius: var(--radius-lg);
  }

  .panel-title {
    font-size: 1.08rem;
  }

  .panel-caption,
  .weakness-highlight__advice,
  .weakness-item__advice,
  .empty-desc {
    font-size: 0.82rem;
    line-height: 1.55;
  }

  .weakness-highlight {
    padding: 14px;
    border-radius: var(--radius-lg);
  }

  .weakness-highlight__title {
    font-size: 1.05rem;
  }

  .weakness-score strong {
    font-size: 1.44rem;
  }

  .weakness-item {
    padding: 12px 14px;
    border-radius: var(--radius-lg);
  }

  .weakness-item__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .trend-tabs {
    gap: 4px;
    padding: 4px;
    border-radius: var(--radius-lg);
  }

  .trend-tabs button {
    min-height: 40px;
    padding: 6px 10px;
    font-size: 0.72rem;
  }

  .trend-surface {
    padding: 12px 12px 8px;
    border-radius: var(--radius-lg);
  }

  .trend-chart {
    height: 196px;
  }
}

@media (max-width: 360px) {
  .insight-panel {
    padding: 14px 12px;
  }

  .panel-title {
    font-size: 1rem;
  }

  .panel-caption {
    font-size: 0.78rem;
  }

  .priority-tag {
    max-width: 100%;
  }

  .weakness-highlight {
    padding: 13px 12px;
  }

  .weakness-score strong {
    font-size: 1.28rem;
  }

  .weakness-item {
    padding: 11px 12px;
  }

  .trend-tabs {
    flex-direction: column;
    border-radius: var(--radius-lg);
  }

  .trend-tabs button {
    width: 100%;
  }

  .trend-chart {
    height: 176px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .insights-board {
    gap: 14px;
  }

  .panel-head--trend {
    align-items: flex-start;
  }

  .trend-chart {
    height: 184px;
  }
}
</style>
