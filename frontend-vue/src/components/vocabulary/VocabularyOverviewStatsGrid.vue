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
  gap: 14px;
  min-height: 88px;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2)),
    rgba(15, 23, 42, 0.18);
  border-radius: 22px;
}

.stat-row.purple {
  background:
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2));
}

.stat-row.green {
  background:
    radial-gradient(circle at top right, rgba(74, 222, 128, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2));
}

.stat-row.blue {
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2));
}

.stat-row.red {
  background:
    radial-gradient(circle at top right, rgba(251, 113, 133, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2));
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
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.purple {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
}

.stat-icon.green {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.stat-icon.blue {
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
}

.stat-icon.red {
  background: rgba(251, 113, 133, 0.2);
  color: #fb7185;
}

.stat-info .stat-label {
  font-size: 0.78rem;
  color: var(--secondary-text);
  margin-bottom: 6px;
  line-height: 1.35;
}

.stat-info .stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-color);
  line-height: 1.05;
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
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 12px 24px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .stat-row.purple) {
    background:
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }

  :global(html[data-theme='light'] .stat-row.green) {
    background:
      radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }

  :global(html[data-theme='light'] .stat-row.blue) {
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }

  :global(html[data-theme='light'] .stat-row.red) {
    background:
      radial-gradient(circle at top right, rgba(244, 63, 94, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
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
    border-radius: 16px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
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
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 14px 30px rgba(148, 163, 184, 0.1);
  }

  :global(html[data-theme='light'] .stat-row.purple) {
    background:
      radial-gradient(circle at top right, rgba(168, 85, 247, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }

  :global(html[data-theme='light'] .stat-row.green) {
    background:
      radial-gradient(circle at top right, rgba(34, 197, 94, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }

  :global(html[data-theme='light'] .stat-row.blue) {
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }

  :global(html[data-theme='light'] .stat-row.red) {
    background:
      radial-gradient(circle at top right, rgba(244, 63, 94, 0.1), transparent 36%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  }
}

</style>
