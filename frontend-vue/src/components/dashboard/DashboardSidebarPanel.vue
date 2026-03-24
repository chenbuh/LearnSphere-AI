<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NList, NListItem, NTag } from 'naive-ui'
import { Activity, Award, Book, Zap } from 'lucide-vue-next'

defineProps({
  leaderboard: {
    type: Array,
    default: () => []
  },
  recentActivity: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const router = useRouter()

const goToActivity = type => {
  const map = {
    vocab: '/vocabulary',
    vocabulary: '/vocabulary',
    grammar: '/grammar',
    reading: '/reading',
    listening: '/listening',
    exam: '/mock-exam'
  }

  router.push(map[type] || '/dashboard')
}

const goToHistory = () => {
  router.push('/answer-history')
}
</script>

<template>
  <div>
    <n-card :title="t('dashboard.leaderboard')" class="mb-6 chart-card" :bordered="false">
      <n-list>
        <n-list-item v-for="(user, index) in leaderboard" :key="user.id">
          <template #prefix>
            <div class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
          </template>
          <div class="leaderboard-user">
            <div class="user-avatar-small">{{ user.nickname?.charAt(0) }}</div>
            <div class="user-info">
              <div class="user-name">{{ user.nickname }}</div>
              <div class="user-points flex items-center">
                <n-icon :component="Zap" size="12" color="#eab308" class="mr-1" />
                <span>{{ user.points || 0 }} {{ t('dashboard.xp') }}</span>
              </div>
            </div>
          </div>
        </n-list-item>
      </n-list>
    </n-card>

    <n-card :title="t('dashboard.recentActivity')" class="h-full chart-card" :bordered="false">
      <n-list>
        <n-list-item v-for="(item, index) in recentActivity" :key="index" class="cursor-pointer hover:bg-white/5" @click="goToActivity(item.type)">
          <template #prefix>
            <div class="activity-icon bg-primary-soft">
              <n-icon :component="item.type === 'vocab' ? Book : item.type === 'exam' ? Award : Activity" />
            </div>
          </template>
          <div class="activity-content">
            <div class="activity-title">{{ item.title }}</div>
            <div class="activity-meta">
              <n-tag size="small" :type="item.score.includes('9') ? 'success' : 'info'" round>{{ item.score }}</n-tag>
              <span class="time">{{ item.time }}</span>
            </div>
          </div>
        </n-list-item>
      </n-list>
      <div class="mt-4 text-center">
        <n-button secondary type="primary" size="small" @click="goToHistory">{{ t('dashboard.viewHistory') }}</n-button>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.mb-6 {
  margin-bottom: 24px;
}

.mt-4 {
  margin-top: 16px;
}

.h-full {
  height: 100%;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.chart-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px;
}

:global(html[data-theme='light'] .chart-card) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    rgba(255, 255, 255, 0.9);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

.chart-card :deep(.n-card) {
  background-color: var(--card-bg) !important;
  border-color: var(--card-border) !important;
}

.chart-card :deep(.n-card__content) {
  background-color: transparent !important;
}

:global(html[data-theme='light'] .chart-card .n-card-header__main) {
  color: #182132 !important;
}

:global(html[data-theme='light'] .chart-card .n-list-item) {
  border-radius: 14px;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

:global(html[data-theme='light'] .chart-card .n-list-item:hover) {
  background: rgba(248, 250, 252, 0.92) !important;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-primary-soft {
  background: rgba(99, 102, 241, 0.1);
  color: #818cf8;
}

.activity-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-color);
}

.activity-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.time {
  font-size: 0.75rem;
  color: var(--secondary-text);
  white-space: nowrap;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3f3f46;
  color: #a1a1aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
}

:global(html[data-theme='light'] .rank-badge) {
  background: rgba(226, 232, 240, 0.92);
  color: #64748b;
}

.rank-1 {
  background: linear-gradient(135deg, #fcd34d, #f59e0b);
  color: #78350f;
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.4);
}

.rank-2 {
  background: linear-gradient(135deg, #e5e7eb, #9ca3af);
  color: #374151;
}

.rank-3 {
  background: linear-gradient(135deg, #fdba74, #fb923c);
  color: #7c2d12;
}

.leaderboard-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

:global(html[data-theme='light'] .user-avatar-small) {
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.16);
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.9rem;
  color: var(--text-color);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.user-points {
  font-size: 0.8rem;
  color: #fbbf24;
  font-weight: 600;
}

.mr-1 {
  margin-right: 4px;
}

.activity-content {
  min-width: 0;
}

.activity-title {
  overflow-wrap: anywhere;
}

@media (max-width: 480px) {
  .chart-card {
    padding: 14px 12px;
  }

  .chart-card :deep(.n-card-header) {
    padding-bottom: 12px;
  }

  .chart-card :deep(.n-list-item__prefix) {
    margin-right: 10px;
    align-self: flex-start;
  }

  .leaderboard-user {
    gap: 10px;
  }

  .activity-meta {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .activity-icon {
    width: 36px;
    height: 36px;
  }

  .rank-badge {
    width: 26px;
    height: 26px;
    font-size: 0.8rem;
  }

  .mt-4 :deep(.n-button) {
    width: 100%;
  }
}
</style>

