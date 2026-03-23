<script setup>
import { NButton } from 'naive-ui'
import { Trophy } from 'lucide-vue-next'

defineProps({
  sessionStats: {
    type: Object,
    default: () => ({ correct: 0, wrong: 0 })
  }
})

const emit = defineEmits(['start-session'])
</script>

<template>
  <div class="complete-view">
    <div class="trophy-wrapper trophy-bounce">
      <Trophy :size="48" />
    </div>
    <h2 class="title-gradient">本轮学习完成</h2>
    <p>本轮已掌握 {{ sessionStats.correct }} 个单词，还有 {{ sessionStats.wrong }} 个需要继续复习。</p>

    <div class="result-stats-row">
      <div class="stat-box">
        <div class="val green">{{ sessionStats.correct }}</div>
        <div class="lbl">已掌握</div>
      </div>
      <div class="stat-box">
        <div class="val red">{{ sessionStats.wrong }}</div>
        <div class="lbl">待复习</div>
      </div>
    </div>

    <n-button type="primary" size="large" @click="emit('start-session')">再来一组</n-button>
  </div>
</template>

<style scoped>
.complete-view {
  text-align: center;
  animation: fadeIn 0.5s;
  padding-top: 40px;
}

.trophy-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border-radius: 50%;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.complete-view h2 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 8px;
}

.complete-view p {
  color: var(--secondary-text);
  margin-bottom: 40px;
  line-height: 1.7;
}

.result-stats-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 20px 40px;
  border-radius: 12px;
}

:global(.dark-mode) .stat-box {
  background: #1f1f23;
}

:global(html[data-theme='light'] .stat-box) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  border-color: rgba(203, 213, 225, 0.82);
  box-shadow: 0 12px 24px rgba(148, 163, 184, 0.08);
}

:global(html[data-theme='light'] .stat-box .lbl) {
  color: #64748b;
}

.stat-box .val {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-box .val.green {
  color: #4ade80;
}

.stat-box .val.red {
  color: #f87171;
}

.stat-box .lbl {
  font-size: 0.8rem;
  color: #71717a;
  text-transform: uppercase;
}

.trophy-bounce {
  animation: trophy-float 3s ease-in-out infinite;
}

.title-gradient {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes trophy-float {
  0%, 100% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

@media (max-width: 768px) {
  .complete-view {
    padding-top: 20px;
  }

  .stat-box {
    padding: 16px 20px;
  }

  .result-stats-row {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .complete-view h2 {
    font-size: 1.5rem;
  }

  .complete-view p {
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .trophy-wrapper {
    width: 68px;
    height: 68px;
    margin-bottom: 16px;
  }

  .stat-box {
    padding: 14px 16px;
  }

  .stat-box .val {
    font-size: 1.6rem;
  }

  .complete-view :deep(.n-button) {
    width: 100%;
  }
}
</style>
