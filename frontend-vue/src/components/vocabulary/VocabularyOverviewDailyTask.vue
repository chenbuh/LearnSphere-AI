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

const railColor = computed(() => (
  themeStore.isLight ? 'rgba(203, 213, 225, 0.9)' : 'rgba(255, 255, 255, 0.05)'
))
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
          <div class="task-value">今日进度 {{ props.dailyTask.completed }} / {{ props.dailyTask.target }}</div>
        </div>
      </div>
      <div class="task-percent">{{ taskProgress }}%</div>
    </div>
    <n-progress
      type="line"
      :percentage="taskProgress"
      :show-indicator="false"
      color="linear-gradient(90deg, #6366f1, #a855f7)"
      :rail-color="railColor"
      :height="6"
      border-radius="3px"
    />
  </div>
</template>

<style scoped>
.daily-task-panel {
  height: 100%;
  padding: 20px 22px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.22));
}

.task-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-icon-bg {
  width: 38px;
  height: 38px;
  background: rgba(245, 158, 11, 0.14);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
}

.task-kicker {
  color: #fdba74;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.task-value {
  margin-top: 4px;
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 700;
}

.task-percent {
  color: #fdba74;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

@media (max-width: 768px) {
  .daily-task-panel {
    padding: 16px 18px;
    border-radius: 20px;
  }

  :global(html[data-theme='light'] .daily-task-panel) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      radial-gradient(circle at top right, rgba(251, 191, 36, 0.14), transparent 34%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.97));
    box-shadow: 0 14px 28px rgba(148, 163, 184, 0.1);
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
    color: #0f172a;
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .daily-task-panel) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      radial-gradient(circle at top right, rgba(251, 191, 36, 0.14), transparent 34%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.97));
    box-shadow: 0 16px 34px rgba(148, 163, 184, 0.11);
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
    color: #0f172a;
  }
}
</style>
