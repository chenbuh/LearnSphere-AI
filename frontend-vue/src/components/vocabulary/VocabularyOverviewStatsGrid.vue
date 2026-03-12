<script setup>
import { computed } from 'vue'
import { NCard, NGrid, NGridItem, NNumberAnimation } from 'naive-ui'
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
    theme: 'purple',
    value: props.stats?.todayCount || 0,
    icon: Brain
  },
  {
    key: 'totalMastered',
    label: 'Mastered',
    theme: 'green',
    value: props.stats?.totalMastered || 0,
    icon: Trophy
  },
  {
    key: 'totalLearned',
    label: 'Learning',
    theme: 'blue',
    value: props.stats?.totalLearned || 0,
    icon: Layers
  },
  {
    key: 'totalFailed',
    label: 'Need Review',
    theme: 'red',
    value: props.stats?.totalFailed || 0,
    icon: RotateCw
  }
])
</script>

<template>
  <div class="stats-header">
    <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:4" responsive="screen">
      <n-grid-item v-for="item in statItems" :key="item.key">
        <n-card :class="['stat-card', item.theme]" :bordered="false">
          <div class="stat-content">
            <div :class="['stat-icon', item.theme]">
              <component :is="item.icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ item.label }}</div>
              <div class="stat-value">
                <n-number-animation :from="0" :to="item.value" />
              </div>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.stat-card {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  height: 100%;
}

:global(.dark-mode) .stat-card {
  background: rgba(30, 30, 35, 0.6);
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
  color: #52525b;
  margin-bottom: 2px;
}

:global(.dark-mode) .stat-info .stat-label {
  color: #a1a1aa;
}

.stat-info .stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #18181b;
  line-height: 1;
}

:global(.dark-mode) .stat-info .stat-value {
  color: #fff;
}

@media (max-width: 768px) {
  :deep(.stats-header .n-grid) {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }

  .stat-card {
    padding: 12px !important;
  }

  .stat-content {
    gap: 12px !important;
  }

  .stat-icon {
    width: 40px !important;
    height: 40px !important;
  }

  .stat-icon svg {
    width: 20px !important;
    height: 20px !important;
  }

  .stat-info .stat-label {
    font-size: 0.75rem !important;
  }

  .stat-info .stat-value {
    font-size: 1.25rem !important;
  }
}

@media (max-width: 480px) {
  :deep(.stats-header .n-grid) {
    grid-template-columns: 1fr !important;
  }
}
</style>
