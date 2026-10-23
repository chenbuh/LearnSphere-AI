<script setup>
import { RefreshCw } from 'lucide-vue-next'
import { NButton, NIcon } from 'naive-ui'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="emit('refresh')">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
  </Teleport>
</template>
