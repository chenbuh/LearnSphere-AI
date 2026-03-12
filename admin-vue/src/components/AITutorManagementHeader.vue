<script setup>
import { NButton, NCard, NGrid, NGridItem, NPopconfirm, NSpace, NStatistic } from 'naive-ui'
import { Activity, AlertCircle, MessageSquare, RefreshCw, Trash, User } from 'lucide-vue-next'

defineProps({
  cleanupStats: {
    type: Object,
    default: () => ({
      expiredCount: 0,
      message: ''
    })
  },
  dashboardStats: {
    type: Object,
    default: () => ({
      totalMessages: 0,
      activeSessions: 0,
      todayQuestions: 0,
      sensitiveIntercepts: 0
    })
  }
})

const emit = defineEmits(['refresh', 'cleanup'])
</script>

<template>
  <header class="page-header">
    <div class="flex items-center gap-3">
      <div class="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
        <MessageSquare :size="24" />
      </div>
      <div>
        <h1 class="text-2xl font-bold">AI 助教管理</h1>
        <p class="text-zinc-500">监控用户与 AI 导师的实时对话，管理对话数据生命周期</p>
      </div>
    </div>
    <n-space>
      <n-button secondary @click="emit('refresh')">
        <template #icon><RefreshCw /></template>
        刷新数据
      </n-button>
      <n-popconfirm @positive-click="emit('cleanup')">
        <template #trigger>
          <n-button type="warning" ghost>
            <template #icon><Trash /></template>
            清理过期数据 ({{ cleanupStats.expiredCount }})
          </n-button>
        </template>
        确认要手动触发清理任务吗？将删除 30 天前的所有非关键记录。
      </n-popconfirm>
    </n-space>
  </header>

  <n-grid :cols="4" :x-gap="24" class="mb-6">
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="总消息数" :value="dashboardStats.totalMessages">
          <template #prefix><Activity :size="20" class="text-indigo-500" /></template>
        </n-statistic>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="活跃会话" :value="dashboardStats.activeSessions">
          <template #prefix><MessageSquare :size="20" class="text-emerald-500" /></template>
        </n-statistic>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="今日提问量" :value="dashboardStats.todayQuestions">
          <template #prefix><User :size="20" class="text-amber-500" /></template>
        </n-statistic>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <n-statistic label="敏感拦截" :value="dashboardStats.sensitiveIntercepts">
          <template #prefix><AlertCircle :size="20" class="text-rose-500" /></template>
        </n-statistic>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}
</style>
