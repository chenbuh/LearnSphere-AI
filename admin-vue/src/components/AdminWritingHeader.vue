<script setup>
import { Plus } from 'lucide-vue-next'
import { NButton } from 'naive-ui'

defineEmits(['add'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button class="add-writing-btn" type="primary" @click="$emit('add')">
      <template #icon>
        <Plus :size="16" />
      </template>
      添加写作话题
    </n-button>
  </Teleport>
</template>

<style scoped>
.add-writing-btn {
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

.add-writing-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.38) !important;
}
</style>
