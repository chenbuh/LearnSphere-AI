<script setup>
import { computed } from 'vue'
import { NProgress } from 'naive-ui'
import { Target } from 'lucide-vue-next'

const props = defineProps({
  dailyTask: {
    type: Object,
    default: null
  }
})

const taskProgress = computed(() => {
  if (!props.dailyTask?.target) return 0
  return Math.round((props.dailyTask.completed / props.dailyTask.target) * 100)
})
</script>

<template>
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
</template>

<style scoped>
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

@media (max-width: 768px) {
  .daily-task-premium {
    margin-bottom: 24px;
  }
}
</style>
