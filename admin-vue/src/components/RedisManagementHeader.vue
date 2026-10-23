<script setup>
import { RefreshCw, Trash2 } from 'lucide-vue-next'
import { NButton, NIcon, NPopconfirm } from 'naive-ui'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  searchPattern: {
    type: String,
    default: '*'
  }
})

const emit = defineEmits(['refresh', 'clear'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <div class="redis-header-actions">
      <n-button class="redis-refresh-btn" secondary :loading="loading" @click="emit('refresh')">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新状态
      </n-button>

      <n-popconfirm @positive-click="emit('clear')">
        <template #trigger>
          <n-button class="redis-clear-btn" secondary type="error">
            <template #icon>
              <n-icon :component="Trash2" />
            </template>
            批量清理符合条件键
          </n-button>
        </template>
        确定要清理所有匹配 "{{ searchPattern }}" 的键吗？此操作不可逆！
      </n-popconfirm>
    </div>
  </Teleport>
</template>

<style scoped>
.redis-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.redis-refresh-btn {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-weight: 550;
  border-radius: 8px;
}

.redis-refresh-btn:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.redis-clear-btn {
  font-weight: 550;
  border-radius: 8px;
}
</style>
