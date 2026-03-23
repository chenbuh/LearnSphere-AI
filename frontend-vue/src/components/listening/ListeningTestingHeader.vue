<script setup>
import { NButton, NIcon, NProgress, NTag } from 'naive-ui'
import { ArrowLeft } from 'lucide-vue-next'

defineProps({
  translate: {
    type: Function,
    required: true
  },
  passageTitle: {
    type: String,
    default: ''
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  passagesLength: {
    type: Number,
    default: 0
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  currentGlobalIndex: {
    type: Number,
    default: 0
  },
  totalQuestionsCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['restart'])
</script>

<template>
  <div class="test-header">
    <div class="header-copy">
      <p class="header-kicker">{{ translate('听力作答', 'Listening Session') }}</p>
      <div class="passage-title">
        <h2>{{ passageTitle }}</h2>
        <n-tag size="small" type="primary">Passage {{ currentPassageIndex + 1 }} / {{ passagesLength }}</n-tag>
      </div>
    </div>

    <div class="header-tools">
      <div class="timer-box">
        <n-progress type="circle" :percentage="progressPercent" :show-indicator="false" :width="40" />
        <span class="count">{{ currentGlobalIndex + 1 }} / {{ totalQuestionsCount }}</span>
      </div>
      <n-button quaternary circle @click="$emit('restart')">
        <template #icon><n-icon :component="ArrowLeft" /></template>
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  padding: 18px 22px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.24)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.header-copy {
  min-width: 0;
}

.header-kicker {
  margin: 0 0 8px;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.passage-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.passage-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  min-width: 0;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 14px;
}

.timer-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer-box .count {
  font-weight: 700;
  font-family: monospace;
  color: #0ea5e9;
}

:global(html[data-theme='light'] .test-header) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
}

@media (max-width: 900px) {
  .test-header {
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
    flex-direction: column;
  }

  .passage-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .passage-title h2 {
    font-size: 1.02rem;
    line-height: 1.45;
  }

  .header-tools {
    width: 100%;
    justify-content: space-between;
  }

  .timer-box {
    justify-content: space-between;
  }
}
</style>
