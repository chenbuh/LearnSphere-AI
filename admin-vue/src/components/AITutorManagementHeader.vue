<script setup>
import { NButton, NCard, NGrid, NGridItem, NPopconfirm, NSpace, NStatistic } from 'naive-ui'
import { Activity, AlertCircle, MessageSquare, RefreshCw, Trash, User } from 'lucide-vue-next'

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
  <header class="page-header">
    <div class="title-wrap">
      <div class="header-icon">
        <MessageSquare :size="22" />
      </div>
      <div class="title-copy">
        <span class="eyebrow">助教会话</span>
        <h1>AI 助教管理</h1>
        <p>查看用户与 AI 助教对话，处理审计、提示词与会话清理任务。</p>
        <div class="meta-row">
          <span class="meta-pill">实时会话</span>
          <span class="meta-pill meta-pill--accent">含敏感审计</span>
        </div>
      </div>
    </div>

    <div class="action-shell">
      <div class="action-copy">
        <strong>会话维护</strong>
        <span>
          当前保留 {{ cleanupStats.retentionDays || 30 }} 天会话记录，
          {{ cleanupStats.autoCleanupEnabled ? '自动清理已开启。' : '自动清理已关闭。' }}
        </span>
      </div>
      <n-space :wrap="true">
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
          确认要手动触发清理任务吗？将删除超过 {{ cleanupStats.retentionDays || 30 }} 天的会话记录。
        </n-popconfirm>
      </n-space>
    </div>
  </header>

  <n-grid :cols="4" :x-gap="24" class="stats-grid">
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <div class="stat-top">
          <span>总消息数</span>
          <Activity :size="18" class="text-indigo-500" />
        </div>
        <n-statistic :value="dashboardStats.totalMessages" />
        <p>累计进入助教流水的消息总量。</p>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <div class="stat-top">
          <span>活跃会话</span>
          <MessageSquare :size="18" class="text-emerald-500" />
        </div>
        <n-statistic :value="dashboardStats.activeSessions" />
        <p>当前仍在持续写入或最近活跃的会话。</p>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <div class="stat-top">
          <span>今日提问量</span>
          <User :size="18" class="text-amber-500" />
        </div>
        <n-statistic :value="dashboardStats.todayQuestions" />
        <p>用来判断今日助教活跃度和峰值负载。</p>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card class="stat-card" :bordered="false">
        <div class="stat-top">
          <span>敏感拦截</span>
          <AlertCircle :size="18" class="text-rose-500" />
        </div>
        <n-statistic :value="dashboardStats.sensitiveIntercepts" />
        <p>提示近期是否需要回看审计规则和提示词策略。</p>
      </n-card>
    </n-grid-item>
  </n-grid>

  <div v-if="cleanupStats.message" class="ops-note">
    <strong>最近清理结果</strong>
    <span>{{ cleanupStats.message }}</span>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.title-wrap {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(92, 168, 255, 0.18), rgba(62, 207, 188, 0.12));
  border: 1px solid rgba(92, 168, 255, 0.2);
  color: #78bbff;
}

.title-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7ee6d8;
}

.title-copy h1 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.9rem;
  font-weight: 800;
}

.title-copy p {
  margin: 0;
  max-width: 52ch;
  color: #94a3b8;
  line-height: 1.6;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 600;
}

.meta-pill--accent {
  color: #7ee6d8;
  border-color: rgba(62, 207, 188, 0.22);
  background: rgba(62, 207, 188, 0.08);
}

.action-shell {
  min-width: min(100%, 420px);
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.44);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.action-copy {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-copy strong {
  color: #e2e8f0;
  font-size: 0.9rem;
  font-weight: 700;
}

.action-copy span {
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.5;
}

.stats-grid {
  margin-bottom: 20px;
}

.stat-card {
  min-height: 168px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stat-card p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.82rem;
  line-height: 1.55;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.ops-note {
  margin-bottom: 24px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(242, 186, 103, 0.18);
  background: rgba(242, 186, 103, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #f8fafc;
}

.ops-note strong {
  color: #f3c172;
}

.ops-note span {
  color: #d7e2f1;
}

@media (max-width: 900px) {
  .action-shell {
    width: 100%;
  }
}
</style>
