<script setup>
import { Activity, RefreshCcw } from 'lucide-vue-next'
import { NButton } from 'naive-ui'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])
</script>

<template>
  <div class="header-wrap">
    <div>
      <h1 class="title">系统监控</h1>
      <p class="subtitle">
        <Activity :size="16" class="subtitle-icon" />
        查看服务器资源、JVM 使用和运行状态
      </p>
    </div>

    <n-button type="primary" secondary round size="large" :loading="loading" @click="emit('refresh')">
      <template #icon>
        <RefreshCcw />
      </template>
      立即刷新
    </n-button>
  </div>
</template>

<style scoped>
.header-wrap {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.title {
  margin: 0 0 8px;
  font-size: 1.875rem;
  font-weight: 800;
  color: #f8fafc;
}

.subtitle {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgb(161, 161, 170);
}

.subtitle-icon {
  color: #818cf8;
}
</style>
