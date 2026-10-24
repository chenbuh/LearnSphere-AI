<script setup>
import { computed } from 'vue'
import { NProgress } from 'naive-ui'
import { Target } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  dailyTask: {
    type: Object,
    default: null
  }
})

const themeStore = useThemeStore()

const taskProgress = computed(() => {
  if (!props.dailyTask?.target) return 0
  return Math.round((props.dailyTask.completed / props.dailyTask.target) * 100)
})

const railColor = computed(() =>
  themeStore.isLight ? 'rgba(203, 213, 225, 0.9)' : 'rgba(255, 255, 255, 0.05)'
)
</script>

<template>
  <div v-if="props.dailyTask" class="daily-task-panel">
    <div class="task-head">
      <div class="task-title">
        <div class="task-icon-bg">
          <Target :size="16" />
        </div>
        <div>
          <div class="task-kicker">今日任务</div>
          <div class="task-value">
            今日进度 {{ props.dailyTask.completed }} / {{ props.dailyTask.target }}
          </div>
        </div>
      </div>
      <div class="task-percent">{{ taskProgress }}%</div>
    </div>
    <n-progress
      type="line"
      :percentage="taskProgress"
      :show-indicator="false"
      color="#1e6b52"
      :rail-color="railColor"
      :height="6"
      border-radius="3px"
    />
  </div>
</template>

<style scoped>
.daily-task-panel {
  height: 100%;
  padding: 22px 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.daily-task-panel:hover {
  border-color: rgba(245, 158, 11, 0.3);
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.task-icon-bg {
  width: 44px;
  height: 44px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-amber);
}

.task-kicker {
  color: var(--tone-amber);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.task-value {
  margin-top: 4px;
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.task-percent {
  color: var(--tone-amber);
  font-size: 1.15rem;
  font-weight: 800;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}

@media (max-width: 768px) {
  .daily-task-panel {
    padding: 16px 18px;
    border-radius: var(--radius-lg);
  }

  :global(html[data-theme='light'] .daily-task-panel) {
    border-color: rgba(203, 213, 225, 0.82);
  }

  :global(html[data-theme='light'] .task-icon-bg) {
    background: rgba(251, 191, 36, 0.14);
    color: #d97706;
  }

  :global(html[data-theme='light'] .task-kicker),
  :global(html[data-theme='light'] .task-percent) {
    color: #c2410c;
  }

  :global(html[data-theme='light'] .task-value) {
    color: var(--text-color);
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .daily-task-panel) {
    border-color: rgba(203, 213, 225, 0.82);
  }

  :global(html[data-theme='light'] .task-icon-bg) {
    background: rgba(251, 191, 36, 0.14);
    color: #d97706;
  }

  :global(html[data-theme='light'] .task-kicker),
  :global(html[data-theme='light'] .task-percent) {
    color: #c2410c;
  }

  :global(html[data-theme='light'] .task-value) {
    color: var(--text-color);
  }
}
</style>
