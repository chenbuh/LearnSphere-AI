<script setup>
import { computed } from 'vue'
import { NCard, NNumberAnimation } from 'naive-ui'
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
    label: 'Today Learned',
    shortLabel: 'Today',
    theme: 'purple',
    value: props.stats?.todayCount || 0,
    icon: Brain
  },
  {
    key: 'totalMastered',
    label: 'Mastered',
    shortLabel: 'Mastered',
    theme: 'green',
    value: props.stats?.totalMastered || 0,
    icon: Trophy
  },
  {
    key: 'totalLearned',
    label: 'Learning',
    shortLabel: 'Learning',
    theme: 'blue',
    value: props.stats?.totalLearned || 0,
    icon: Layers
  },
  {
    key: 'totalFailed',
    label: 'Need Review',
    shortLabel: 'Review',
    theme: 'red',
    value: props.stats?.totalFailed || 0,
    icon: RotateCw
  }
])
</script>

<template>
  <div class="stats-header">
    <div class="stats-grid">
      <n-card v-for="item in statItems" :key="item.key" :class="['stat-card', item.theme]" :bordered="false">
        <div class="stat-content">
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
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  background:
    linear-gradient(180deg, rgba(39, 45, 63, 0.94), rgba(32, 37, 52, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 22px;
  min-height: 112px;
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.22);
}

.stat-card :deep(.n-card__content) {
  height: 100%;
  padding: 20px 22px;
}

:global(.dark-mode) .stat-card {
  background:
    linear-gradient(180deg, rgba(39, 45, 63, 0.94), rgba(32, 37, 52, 0.92));
}

.stat-card.purple {
  background: rgba(168, 85, 247, 0.1);
}

:global(.dark-mode) .stat-card.purple {
  background: rgba(88, 28, 135, 0.2);
}

.stat-card.green {
  background: rgba(74, 222, 128, 0.1);
}

:global(.dark-mode) .stat-card.green {
  background: rgba(6, 78, 59, 0.2);
}

.stat-card.blue {
  background: rgba(96, 165, 250, 0.1);
}

:global(.dark-mode) .stat-card.blue {
  background: rgba(30, 58, 138, 0.2);
}

.stat-card.red {
  background: rgba(251, 113, 133, 0.1);
}

:global(.dark-mode) .stat-card.red {
  background: rgba(136, 19, 55, 0.2);
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
  width: 48px;
  height: 48px;
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
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 6px;
  line-height: 1.35;
}

:global(.dark-mode) .stat-info .stat-label {
  color: #a1a1aa;
}

.stat-info .stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1;
}

:global(.dark-mode) .stat-info .stat-value {
  color: #fff;
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

  .stat-card {
    min-height: 92px;
  }

  .stat-card :deep(.n-card__content) {
    padding: 14px;
  }

  .stat-content {
    gap: 12px;
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
}

@media (max-width: 480px) {
  .stats-grid {
    gap: 10px;
  }

  .stat-card {
    min-height: 84px;
    border-radius: 14px;
  }

  .stat-card :deep(.n-card__content) {
    padding: 12px;
  }

  .stat-content {
    gap: 10px;
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

@media (max-width: 360px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
