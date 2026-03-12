<script setup>
import { Clock, Flame } from 'lucide-vue-next'
import { NIcon } from 'naive-ui'

defineProps({
  streak: {
    type: Number,
    default: 0
  },
  todayTime: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="page-header">
    <div class="header-content">
      <h1 class="page-title">学习中心</h1>
      <p class="page-subtitle">选择你想要练习的内容</p>
    </div>
    <div class="header-stats">
      <div class="stat-item">
        <n-icon :component="Flame" size="20" color="#f97316" />
        <span>{{ streak }} 天</span>
      </div>
      <div class="stat-item">
        <n-icon :component="Clock" size="20" color="#3b82f6" />
        <span>{{ todayTime }} 分钟</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 700;
  color: #f9fafb;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #9ca3af;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 14px;
  font-weight: 600;
  color: #d4d4d8;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 20px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
