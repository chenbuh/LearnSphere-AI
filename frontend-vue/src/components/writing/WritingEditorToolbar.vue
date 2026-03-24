<template>
  <div class="back-button-container">
    <n-button secondary @click="emit('restart')" class="glass-btn">
      <template #icon><n-icon :component="RotateCcw" /></template>
      返回设置
    </n-button>

    <div class="toolbar-side">
      <span v-if="showDraftSaved" class="draft-indicator">
        已保存到草稿箱
      </span>
      <n-button secondary @click="emit('toggle-focus')" class="glass-btn">
        <template #icon><n-icon :component="Target" /></template>
        {{ isFocusMode ? '退出沉浸模式' : '开启沉浸模式' }}
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { NButton, NIcon } from 'naive-ui'
import { RotateCcw, Target } from 'lucide-vue-next'

defineProps({
  isFocusMode: {
    type: Boolean,
    default: false
  },
  showDraftSaved: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['restart', 'toggle-focus'])
</script>

<style scoped>
.back-button-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.toolbar-side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.draft-indicator {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #34d399;
  font-size: 0.76rem;
  font-weight: 700;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(148, 163, 184, 0.12) !important;
  border-radius: 999px !important;
}

:global(html[data-theme='light'] .back-button-container) {
  border-bottom-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .draft-indicator) {
  background: rgba(220, 252, 231, 0.92);
  color: #047857;
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.12);
}

:global(html[data-theme='light'] .glass-btn) {
  background: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(148, 163, 184, 0.18) !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

@media (max-width: 768px) {
  .back-button-container,
  .toolbar-side {
    align-items: stretch;
    flex-direction: column;
  }

  .glass-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .back-button-container {
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .toolbar-side {
    gap: 8px;
  }

  .draft-indicator {
    width: 100%;
    justify-content: center;
    padding: 8px 10px;
  }
}

@media (max-width: 360px) {
  .draft-indicator {
    font-size: 0.72rem;
  }
}
</style>

