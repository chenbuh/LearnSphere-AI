<script setup>
import { NButton, NIcon } from 'naive-ui'
import { ArrowLeft, RotateCcw } from 'lucide-vue-next'

defineProps({
  translate: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['back', 'restart'])
</script>

<template>
  <div class="analysis-header">
    <n-button quaternary circle @click="emit('back')">
      <template #icon><n-icon :component="ArrowLeft" /></template>
    </n-button>
    <h2>{{ translate('详细解析汇报', 'Detailed Analysis Report') }}</h2>
    <n-button type="primary" secondary @click="emit('restart')">
      <template #icon><n-icon :component="RotateCcw" /></template>
      {{ translate('返回主页', 'Back to Home') }}
    </n-button>
  </div>
</template>

<style scoped>
.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 12px;
}
</style>