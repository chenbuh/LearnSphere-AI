<script setup>
import { NButton, NPopconfirm } from 'naive-ui'
import { Activity, AlertCircle, Archive, MessageSquare, RefreshCw, Trash, User } from 'lucide-vue-next'

defineProps({
  cleanupStats: {
    type: Object,
    default: () => ({
      expiredCount: 0,
      message: '',
      retentionDays: 30,
      autoCleanupEnabled: true
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
  <Teleport to="#page-actions" defer>
    <n-button secondary @click="emit('refresh')">
      <template #icon><RefreshCw :size="16" /></template>
      刷新
    </n-button>
    <n-popconfirm @positive-click="emit('cleanup')">
      <template #trigger>
        <n-button secondary>
          <template #icon><Trash :size="16" /></template>
          清理过期数据
        </n-button>
      </template>
      确认要手动触发清理任务吗？将删除超过 {{ cleanupStats.retentionDays || 30 }} 天的会话记录。
    </n-popconfirm>
  </Teleport>

  <section class="ls-stats" aria-label="助教概览">
    <div class="ls-stat">
      <span class="ls-stat__label"><Activity :size="14" />总消息数</span>
      <strong class="ls-stat__value">{{ dashboardStats.totalMessages }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><MessageSquare :size="14" />活跃会话</span>
      <strong class="ls-stat__value">{{ dashboardStats.activeSessions }}</strong>
    </div>
    <div class="ls-stat">
      <span class="ls-stat__label"><User :size="14" />今日提问</span>
      <strong class="ls-stat__value">{{ dashboardStats.todayQuestions }}</strong>
    </div>
    <div class="ls-stat" :class="{ 'ls-stat--danger': dashboardStats.sensitiveIntercepts > 0 }">
      <span class="ls-stat__label"><AlertCircle :size="14" />敏感拦截</span>
      <strong class="ls-stat__value">{{ dashboardStats.sensitiveIntercepts }}</strong>
    </div>
    <div
      class="ls-stat"
      :class="{ 'ls-stat--warn': cleanupStats.expiredCount > 0 }"
      :title="cleanupStats.message || undefined"
    >
      <span class="ls-stat__label"><Archive :size="14" />待清理会话</span>
      <strong class="ls-stat__value">{{ cleanupStats.expiredCount }}</strong>
      <span class="ls-stat__hint">保留 {{ cleanupStats.retentionDays || 30 }} 天</span>
    </div>
  </section>
</template>
