<script setup>
import { NButton } from 'naive-ui'
import { Bot, Plus } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    default: 'listening'
  },
  loading: {
    type: Boolean,
    default: false
  },
  moduleName: {
    type: String,
    default: '内容'
  }
})

const emit = defineEmits(['batch-audit', 'add'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <div class="content-header-actions">
      <n-button
        v-if="activeTab === 'listening' || activeTab === 'reading'"
        class="audit-btn"
        secondary
        :loading="loading"
        @click="emit('batch-audit')"
      >
        <template #icon>
          <Bot :size="15" />
        </template>
        AI 批量审查
      </n-button>
      <n-button class="add-btn" type="primary" @click="emit('add')">
        <template #icon>
          <Plus :size="16" />
        </template>
        添加{{ moduleName }}
      </n-button>
    </div>
  </Teleport>
</template>

<style scoped>
.content-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.audit-btn {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-weight: 550;
  border-radius: 8px;
}

.audit-btn:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.add-btn {
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

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.38) !important;
}
</style>
