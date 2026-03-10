<template>
  <div class="back-button-container flex justify-between items-center">
    <n-button secondary @click="emit('restart')" class="glass-btn">
      <template #icon><n-icon :component="RotateCcw" /></template>
      返回设置
    </n-button>
    <div class="flex items-center gap-3">
      <span v-if="showDraftSaved" class="text-xs text-green-400 opacity-80 animate-pulse">
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
  margin-bottom: 20px;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
}
</style>