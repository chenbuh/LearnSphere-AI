<script setup>
import { NButton, NIcon } from 'naive-ui'
import { Bell, RefreshCw, Sparkles } from 'lucide-vue-next'

defineProps({
  refreshing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['briefing', 'navigate', 'refresh'])
</script>

<template>
  <!-- 页面级操作按钮通过 Teleport 渲染到顶栏 -->
  <Teleport to="#page-actions" defer>
    <div class="hero-actions">
      <n-button class="action-btn action-btn--subtle" @click="emit('navigate', '/notifications')">
        <template #icon>
          <n-icon :component="Bell" />
        </template>
        通知
      </n-button>
      <n-button
        class="action-btn action-btn--subtle"
        :loading="refreshing"
        @click="emit('refresh')"
      >
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新
      </n-button>
      <n-button class="action-btn action-btn--primary" type="primary" @click="emit('briefing')">
        <template #icon>
          <n-icon :component="Sparkles" />
        </template>
        生成智能简报
      </n-button>
    </div>
  </Teleport>
</template>

<style scoped>
.hero-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  font-weight: 550;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn--subtle {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.action-btn--subtle:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

.action-btn--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.28) !important;
}

.action-btn--primary:hover {
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.38) !important;
  transform: translateY(-1px);
}
</style>
