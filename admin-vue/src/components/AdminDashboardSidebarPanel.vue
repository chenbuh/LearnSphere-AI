<script setup>
import { NButton, NTimeline, NTimelineItem } from 'naive-ui'
import { ChevronRight, Clock, LayoutDashboard, MousePointer2 } from 'lucide-vue-next'

const props = defineProps({
  quickActions: {
    type: Array,
    default: () => []
  },
  retentionData: {
    type: Array,
    default: () => []
  },
  recentLogs: {
    type: Array,
    default: () => []
  },
  bindRetentionChartRef: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['navigate'])

const navigate = path => {
  emit('navigate', path)
}
</script>

<template>
  <div class="sidebar-stack">
    <div class="p-card mb-5">
      <div class="card-title"><LayoutDashboard :size="18" /><span>快速导航</span></div>
      <div class="grid grid-cols-2 gap-3 mt-4">
        <div
          v-for="action in quickActions"
          :key="action.label"
          class="action-item"
          @click="navigate(action.path)"
        >
          <div class="action-icon" :style="{ backgroundColor: `${action.color}20`, color: action.color }">
            <component :is="action.icon" :size="20" />
          </div>
          <span class="action-label">{{ action.label }}</span>
        </div>
      </div>
    </div>

    <div class="p-card mb-5">
      <div class="card-title"><MousePointer2 :size="18" /><span>用户留存分析</span></div>
      <div class="flex items-center gap-4 mt-6">
        <div class="retention-value">
          <div class="val">{{ retentionData[0]?.rate || 0 }}%</div>
          <div class="lab">次日留存</div>
        </div>
        <div :ref="bindRetentionChartRef" class="flex-1 h-20"></div>
      </div>
    </div>

    <div class="p-card flex-1 min-h-0 relative">
      <div class="card-title">
        <Clock :size="18" />
        <span>实时操作审计</span>
        <n-button quaternary circle size="tiny" class="ml-auto" @click="navigate('/logs')">
          <ChevronRight :size="14" />
        </n-button>
      </div>
      <div class="scroll-v mt-4 pr-2 max-h-[380px]">
        <n-timeline v-if="recentLogs.length">
          <n-timeline-item
            v-for="log in recentLogs"
            :key="log.id"
            :type="log.status === 1 ? 'success' : 'error'"
            :title="log.action"
            :content="`${log.adminUsername} @ ${log.module}`"
            :time="new Date(log.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })"
          />
        </n-timeline>
        <div v-else class="empty-state">暂无实时审计记录</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar-stack {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.p-card {
  background: rgba(24, 24, 27, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.p-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #e4e4e7;
  font-size: 15px;
  font-weight: 700;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 18px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
}

.action-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(1.05);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  color: #e4e4e7;
}

.retention-value .val {
  font-size: 28px;
  font-weight: 800;
  color: #8b5cf6;
}

.retention-value .lab {
  font-size: 11px;
  color: #a1a1aa;
}

.scroll-v {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.14) transparent;
}

.scroll-v::-webkit-scrollbar {
  width: 6px;
}

.scroll-v::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
}

.empty-state {
  padding: 20px 0;
  color: #71717a;
  font-size: 13px;
  text-align: center;
}
</style>
