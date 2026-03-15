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
    <h2 class="title-gradient">Session Complete!</h2>
    <p>You finished this session learned {{ sessionStats.correct }} new words, with {{ sessionStats.wrong }} to review.</p>

    <div class="result-stats-row">
      <div class="stat-box">
        <div class="val green">{{ sessionStats.correct }}</div>
        <div class="lbl">Correct</div>
      </div>
      <div class="stat-box">
        <div class="val red">{{ sessionStats.wrong }}</div>
        <div class="lbl">Need review</div>
      </div>
    </div>

    <n-button type="primary" size="large" @click="emit('start-session')">Start another set</n-button>
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
  color: #fff;
  margin-bottom: 8px;
}

.complete-view p {
  color: #a1a1aa;
  margin-bottom: 40px;
}

.result-stats-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
}

.stat-box {
  background: #f4f4f5;
  padding: 20px 40px;
  border-radius: 12px;
}

:global(.dark-mode) .stat-box {
  background: #1f1f23;
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
