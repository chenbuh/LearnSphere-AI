<script setup>
import { NButton, NIcon } from 'naive-ui'
import { RefreshCw, Send } from 'lucide-vue-next'

defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh', 'send'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <div class="notifications-header-actions">
      <n-button class="notify-refresh-btn" secondary :loading="loading" @click="$emit('refresh')">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新
      </n-button>
      <n-button class="notify-send-btn" type="primary" @click="$emit('send')">
        <template #icon>
          <n-icon :component="Send" />
        </template>
        新建站内通知
      </n-button>
    </div>
  </Teleport>
</template>

<style scoped>
.notifications-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notify-refresh-btn {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-weight: 550;
  border-radius: 8px;
}

.notify-refresh-btn:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.notify-send-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.28) !important;
  font-weight: 600;
  border-radius: 8px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.notify-send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.38) !important;
}
</style>
