<script setup>
import { NButton, NCard, NIcon } from 'naive-ui'
import { ArrowLeft } from 'lucide-vue-next'

defineProps({
  isStarted: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  }
})

defineEmits(['exit'])
</script>

<template>
  <n-card class="header-card" :bordered="false">
    <div class="header-content">
      <div>
        <h1>
          {{ isStarted ? (showResult ? '练习报告' : '语法特训中') : '语法专项特训' }}
        </h1>
        <p class="subtitle">
          {{ isStarted ? '保持专注，攻克难点' : '系统化梳理语法脉络' }}
        </p>
      </div>
      <div v-if="isStarted && !showResult">
        <n-button secondary @click="$emit('exit')">
          <template #icon><n-icon :component="ArrowLeft" /></template>
          退出练习
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.header-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  margin-bottom: 24px;
  border-radius: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(120deg, #c084fc, #db2777);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.header-content .subtitle {
  font-size: 0.9rem;
  color: var(--secondary-text);
}

@media (max-width: 768px) {
  .header-card {
    margin-bottom: 12px !important;
  }

  .header-card :deep(.n-card__content) {
    padding: 12px 16px !important;
  }

  .header-content h1 {
    font-size: 1.25rem !important;
  }
}

@media (max-width: 480px) {
  .header-content h1 {
    font-size: 1.15rem !important;
  }

  .header-content .subtitle {
    font-size: 0.8rem !important;
  }
}

@media (max-width: 360px) {
  .header-content h1 {
    font-size: 1rem !important;
  }

  .header-content .subtitle {
    font-size: 0.75rem !important;
  }
}
</style>
