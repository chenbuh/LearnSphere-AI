<script setup>
import { computed } from 'vue'
import { NCard, NGrid, NGridItem, NNumberAnimation, NProgress } from 'naive-ui'
import { Brain, Layers, RotateCw, Target, Trophy } from 'lucide-vue-next'

const props = defineProps({
  dailyTask: {
    type: Object,
    default: null
  },
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

const taskProgress = computed(() => {
  if (!props.dailyTask?.target) return 0
  return Math.round((props.dailyTask.completed / props.dailyTask.target) * 100)
})
</script>

<template>
  <div class="overview-header">
    <div v-if="props.dailyTask" class="daily-task-premium">
      <div class="flex justify-between items-end mb-2">
        <div class="flex items-center gap-2">
          <div class="task-icon-bg">
            <Target :size="18" />
          </div>
          <div>
            <div class="text-xs uppercase tracking-widest text-indigo-400 font-bold">Daily Mission</div>
            <div class="text-sm text-white font-medium">Progress: {{ props.dailyTask.completed }} / {{ props.dailyTask.target }}</div>
          </div>
        </div>
        <div class="text-xs text-indigo-300 font-mono">{{ taskProgress }}%</div>
      </div>
      <n-progress
        type="line"
        :percentage="taskProgress"
        :show-indicator="false"
        color="linear-gradient(90deg, #6366f1, #a855f7)"
        rail-color="rgba(255, 255, 255, 0.05)"
        :height="6"
        border-radius="3px"
      />
    </div>

    <div class="stats-header">
      <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:4" responsive="screen">
        <n-grid-item>
          <n-card class="stat-card purple" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon purple"><Brain /></div>
              <div class="stat-info">
                <div class="stat-label">Today Learned</div>
                <div class="stat-value">
                  <n-number-animation :from="0" :to="props.stats?.todayCount || 0" />
                </div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card green" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon green"><Trophy /></div>
              <div class="stat-info">
                <div class="stat-label">Mastered</div>
                <div class="stat-value">
                  <n-number-animation :from="0" :to="props.stats?.totalMastered || 0" />
                </div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card blue" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon blue"><Layers /></div>
              <div class="stat-info">
                <div class="stat-label">Learning</div>
                <div class="stat-value">
                  <n-number-animation :from="0" :to="props.stats?.totalLearned || 0" />
                </div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card class="stat-card red" :bordered="false">
            <div class="stat-content">
              <div class="stat-icon red"><RotateCw /></div>
              <div class="stat-info">
                <div class="stat-label">Need Review</div>
                <div class="stat-value">
                  <n-number-animation :from="0" :to="props.stats?.totalFailed || 0" />
                </div>
              </div>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<style scoped>
.overview-header {
  margin-bottom: 24px;
}

.daily-task-premium {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 32px;
}

:global(.dark-mode) .daily-task-premium {
  background: rgba(30, 30, 35, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.task-icon-bg {
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.daily-task-premium .text-white {
  color: #18181b;
}

:global(.dark-mode) .daily-task-premium .text-white {
  color: #fff;
}

.daily-task-premium .text-indigo-400 {
  color: #6366f1;
}

:global(.dark-mode) .daily-task-premium .text-indigo-400 {
  color: #818cf8;
}

.daily-task-premium .text-indigo-300 {
  color: #818cf8;
}

:global(.dark-mode) .daily-task-premium .text-indigo-300 {
  color: #a5b4fc;
}

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
  .daily-task-premium {
    margin-bottom: 24px;
  }

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
