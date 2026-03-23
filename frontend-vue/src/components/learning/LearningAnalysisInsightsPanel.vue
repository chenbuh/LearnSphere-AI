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
        <n-tag
          v-if="primaryWeakness"
          size="small"
          :bordered="false"
          class="priority-tag"
        >
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
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 32px;
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.4), rgba(7, 14, 29, 0.2)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.05), transparent 36%);
  box-shadow: 0 18px 38px rgba(2, 6, 23, 0.12);
}

.insight-panel {
  min-width: 0;
  padding: 22px 22px 20px;
  border: none;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.12);
}

.insight-panel--trend {
  background:
    linear-gradient(180deg, rgba(7, 14, 29, 0.32), rgba(7, 14, 29, 0.16)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 36%);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 18px;
}

.panel-kicker {
  margin: 0 0 8px;
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.panel-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.24rem;
  font-weight: 700;
}

.panel-caption {
  max-width: 32rem;
  margin: 8px 0 0;
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.6;
}

.priority-tag {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.14);
}

.weakness-highlight {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
  padding: 18px;
  border: 1px solid rgba(248, 113, 113, 0.14);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.22)),
    radial-gradient(circle at top right, rgba(239, 68, 68, 0.08), transparent 44%);
}

.weakness-highlight__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.weakness-highlight__label {
  display: block;
  margin-bottom: 6px;
  color: #fca5a5;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.weakness-highlight__title {
  display: block;
  color: #f8fafc;
  font-size: 1.2rem;
  line-height: 1.3;
}

.weakness-highlight__advice {
  margin: 0;
  color: #dbe4f0;
  font-size: 0.92rem;
  line-height: 1.7;
}

.weakness-score {
  display: grid;
  gap: 4px;
  justify-items: end;
  color: #fca5a5;
  font-size: 0.75rem;
}

.weakness-score strong {
  color: #f8fafc;
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
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.28);
}

.weakness-item__head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
}

.weakness-item__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f8fafc;
}

.weakness-item__score {
  color: #fca5a5;
  font-size: 0.78rem;
  font-weight: 700;
}

.weakness-item__advice {
  margin: 0;
  color: #dbe4f0;
  font-size: 0.88rem;
  line-height: 1.6;
}

.weakness-item__advice span {
  color: #94a3b8;
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
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.18);
}

.empty-title {
  color: #86efac;
  font-size: 1.06rem;
  font-weight: 700;
}

.empty-desc {
  max-width: 28rem;
  color: #94a3b8;
  font-size: 0.88rem;
  line-height: 1.6;
}

.panel-head--trend {
  align-items: end;
}

.trend-tabs {
  display: flex;
  padding: 3px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 999px;
}

.trend-tabs button {
  padding: 7px 12px;
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 999px;
  background: transparent;
  transition: all 0.2s ease;
}

.trend-tabs button.active {
  color: #f8fafc;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
}

.trend-tabs button:hover:not(.active) {
  color: #e2e8f0;
}

.trend-surface {
  min-width: 0;
  padding: 14px 16px 10px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.24);
}

.trend-surface__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #93c5fd;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trend-chart {
  width: 100%;
  height: 260px;
}

:global(html[data-theme='light'] .insights-board) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.95)),
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.08), transparent 36%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .insight-panel) {
  background: rgba(255, 255, 255, 0.72);
}

:global(html[data-theme='light'] .insight-panel--trend) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.9)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.1), transparent 36%);
}

:global(html[data-theme='light'] .panel-title),
:global(html[data-theme='light'] .weakness-highlight__title),
:global(html[data-theme='light'] .weakness-item__title) {
  color: #0f172a;
}

:global(html[data-theme='light'] .panel-caption),
:global(html[data-theme='light'] .weakness-item__advice span),
:global(html[data-theme='light'] .empty-desc) {
  color: #64748b;
}

:global(html[data-theme='light'] .weakness-highlight) {
  border-color: rgba(248, 113, 113, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(254, 242, 242, 0.92)),
    radial-gradient(circle at top right, rgba(239, 68, 68, 0.08), transparent 44%);
}

:global(html[data-theme='light'] .weakness-highlight__advice),
:global(html[data-theme='light'] .weakness-item__advice) {
  color: #334155;
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
  color: #64748b;
}

:global(html[data-theme='light'] .trend-tabs button:hover:not(.active)) {
  color: #334155;
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
    padding: 0;
    border: none;
    border-radius: 0;
    background: none;
    box-shadow: none;
  }

  .insight-panel {
    padding: 18px 16px;
    border-radius: 22px;
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
</style>
