<script setup>
import { computed } from 'vue'
import { NNumberAnimation } from 'naive-ui'
import { Brain, Layers, RotateCw, Trophy } from 'lucide-vue-next'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      todayCount: 0,
      totalMastered: 0,
      totalLearned: 0,
      totalFailed: 0
    })
  }
})

const statItems = computed(() => [
  {
    key: 'todayCount',
    label: '今日学习',
    shortLabel: '今日',
    theme: 'purple',
    value: props.stats?.todayCount || 0,
    icon: Brain
  },
  {
    key: 'totalMastered',
    label: '已掌握',
    shortLabel: '掌握',
    theme: 'green',
    value: props.stats?.totalMastered || 0,
    icon: Trophy
  },
  {
    key: 'totalLearned',
    label: '学习中',
    shortLabel: '学习中',
    theme: 'blue',
    value: props.stats?.totalLearned || 0,
    icon: Layers
  },
  {
    key: 'totalFailed',
    label: '待复习',
    shortLabel: '复习',
    theme: 'red',
    value: props.stats?.totalFailed || 0,
    icon: RotateCw
  }
])
</script>

<template>
  <div class="stats-grid">
    <div v-for="item in statItems" :key="item.key" :class="['stat-row', item.theme]">
      <div :class="['stat-icon', item.theme]">
        <component :is="item.icon" />
      </div>
      <div class="stat-info">
        <div class="stat-label">
          <span class="label-full">{{ item.label }}</span>
          <span class="label-compact">{{ item.shortLabel }}</span>
        </div>
        <div class="stat-value">
          <n-number-animation :from="0" :to="item.value" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 88px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-row:hover {
  transform: translateY(-2px);
}

.stat-row.purple {
  background: var(--card-bg);
}
.stat-row.purple:hover {
  border-color: rgba(43, 122, 96, 0.35);
}

.stat-row.green {
  background: var(--card-bg);
}
.stat-row.green:hover {
  border-color: rgba(34, 197, 94, 0.35);
}

.stat-row.blue {
  background: var(--card-bg);
}
.stat-row.blue:hover {
  border-color: rgba(30, 107, 82, 0.35);
}

.stat-row.red {
  background: var(--card-bg);
}
.stat-row.red:hover {
  border-color: rgba(244, 63, 94, 0.35);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 100%;
}

.stat-info {
  min-width: 0;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.stat-row:hover .stat-icon {
  transform: scale(1.08);
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.stat-icon.purple {
  background: rgba(43, 122, 96, 0.16);
  border: 1px solid rgba(43, 122, 96, 0.3);
  color: var(--brand);
}

.stat-icon.green {
  background: rgba(34, 197, 94, 0.16);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ade80;
}

.stat-icon.blue {
  background: rgba(30, 107, 82, 0.16);
  border: 1px solid rgba(30, 107, 82, 0.3);
  color: var(--brand);
}

.stat-icon.red {
  background: rgba(244, 63, 94, 0.16);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fb7185;
}

.stat-info .stat-label {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--secondary-text);
  margin-bottom: 4px;
  line-height: 1.35;
  letter-spacing: 0.04em;
}

.stat-info .stat-value {
  font-size: 1.45rem;
  font-weight: 850;
  color: var(--text-color);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.label-compact {
  display: none;
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-grid {
    gap: 12px;
  }

  .stat-row {
    min-height: 82px;
    padding: 14px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-info .stat-label {
    font-size: 0.76rem;
    margin-bottom: 4px;
  }

  .stat-info .stat-value {
    font-size: 1.25rem;
  }

  :global(html[data-theme='light'] .stat-row),
  :global(html[data-theme='light'] .stat-row.purple),
  :global(html[data-theme='light'] .stat-row.green),
  :global(html[data-theme='light'] .stat-row.blue),
  :global(html[data-theme='light'] .stat-row.red) {
    border-color: rgba(203, 213, 225, 0.78);
  }

  :global(html[data-theme='light'] .stat-row.purple) {
    background:
      radial-gradient(circle at top right, var(--tone-violet-soft), transparent 36%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .stat-row.green) {
    background:
      radial-gradient(circle at top right, var(--tone-emerald-soft), transparent 36%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .stat-row.blue) {
    background:
      radial-gradient(circle at top right, var(--tone-blue-soft), transparent 36%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .stat-row.red) {
    background:
      radial-gradient(circle at top right, var(--tone-red-soft), transparent 36%),
      var(--card-bg);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    gap: 10px;
    grid-template-columns: 1fr;
  }

  .stat-row {
    min-height: 76px;
    padding: 12px;
    border-radius: var(--radius-lg);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
  }

  .stat-icon svg {
    width: 18px;
    height: 18px;
  }

  .stat-info .stat-label {
    font-size: 0.72rem;
    margin-bottom: 2px;
  }

  .stat-info .stat-value {
    font-size: 1.1rem;
  }

  .label-full {
    display: none;
  }

  .label-compact {
    display: inline;
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .stat-row),
  :global(html[data-theme='light'] .stat-row.purple),
  :global(html[data-theme='light'] .stat-row.green),
  :global(html[data-theme='light'] .stat-row.blue),
  :global(html[data-theme='light'] .stat-row.red) {
    border-color: rgba(203, 213, 225, 0.8);
  }

  :global(html[data-theme='light'] .stat-row.purple) {
    background:
      radial-gradient(circle at top right, var(--tone-violet-soft), transparent 36%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .stat-row.green) {
    background:
      radial-gradient(circle at top right, var(--tone-emerald-soft), transparent 36%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .stat-row.blue) {
    background:
      radial-gradient(circle at top right, var(--tone-blue-soft), transparent 36%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .stat-row.red) {
    background:
      radial-gradient(circle at top right, var(--tone-red-soft), transparent 36%),
      var(--card-bg);
  }
}

</style>
