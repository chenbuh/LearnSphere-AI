<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NBadge, NButton, NEmpty, NPopover, NSpin, NTag } from 'naive-ui'
import { Bell, CheckCheck, ChevronRight } from 'lucide-vue-next'
import { notificationApi } from '@/api/notification'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const { t, locale } = useI18n()
const notificationStore = useNotificationStore()
const popoverVisible = ref(false)
const previewNotifications = ref([])
const previewLoading = ref(false)

let refreshTimer = null

const displayCount = computed(() => (notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount))

const formatDateTime = (value) => {
  if (!value) {
    return t('notifications.permanent')
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString(locale.value || undefined)
}

const getTypeLabel = (type) => t(`notifications.types.${type || 'system'}`)

const getPriorityType = (priority) => {
  if (priority >= 2) {
    return 'error'
  }
  if (priority >= 1) {
    return 'warning'
  }
  return 'default'
}

const openNotificationCenter = async (notificationId = null) => {
  popoverVisible.value = false
  const nextQuery = {}
  if (notificationId) {
    nextQuery.notificationId = String(notificationId)
  }
  await router.push({ path: '/notifications', query: nextQuery })
}

const handleTriggerClick = async () => {
  if (props.isMobile) {
    await notificationStore.fetchUnreadCount({ silent: true })
    await openNotificationCenter()
  }
}

const handlePopoverUpdate = async (show) => {
  popoverVisible.value = show
  if (show) {
    previewLoading.value = true
    try {
      await notificationStore.fetchUnreadCount({ silent: true })
      const res = await notificationApi.getNotifications({ page: 1, size: 6 })
      previewNotifications.value = Array.isArray(res.data?.records) ? res.data.records : []
    } finally {
      previewLoading.value = false
    }
  }
}

const handleMarkRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId)
  previewNotifications.value = previewNotifications.value.map(item => (
    item.id === notificationId
      ? {
          ...item,
          isRead: 1,
          readTime: item.readTime || new Date().toISOString()
        }
      : item
  ))
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()
  previewNotifications.value = previewNotifications.value.map(item => ({
    ...item,
    isRead: 1,
    readTime: item.readTime || new Date().toISOString()
  }))
}

onMounted(() => {
  notificationStore.fetchUnreadCount({ silent: true })

  refreshTimer = window.setInterval(() => {
    notificationStore.fetchUnreadCount({ silent: true })
  }, 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<template>
  <n-popover
    v-if="!isMobile"
    v-model:show="popoverVisible"
    trigger="click"
    placement="bottom-end"
    :width="380"
    @update:show="handlePopoverUpdate"
  >
    <template #trigger>
      <n-badge :value="displayCount" :show="notificationStore.hasUnread" processing>
        <n-button quaternary circle class="notification-trigger" :aria-label="t('notifications.openCenter')">
          <template #icon>
            <Bell :size="20" />
          </template>
        </n-button>
      </n-badge>
    </template>

    <div class="notification-popover">
      <div class="notification-popover__header">
        <div>
          <div class="notification-popover__title">{{ t('notifications.latest') }}</div>
          <div class="notification-popover__meta">
            {{ t('notifications.unreadCount') }} {{ notificationStore.unreadCount }}
          </div>
        </div>
        <div class="notification-popover__header-actions">
          <n-button
            v-if="notificationStore.hasUnread"
            text
            type="primary"
            @click="handleMarkAllAsRead"
          >
            <template #icon>
              <CheckCheck :size="14" />
            </template>
            {{ t('notifications.allRead') }}
          </n-button>
          <n-button text type="primary" @click="openNotificationCenter()">
            {{ t('notifications.viewAll') }}
            <template #icon>
              <ChevronRight :size="14" />
            </template>
          </n-button>
        </div>
      </div>

      <n-spin :show="previewLoading">
        <div v-if="previewNotifications.length" class="notification-popover__list">
          <article
            v-for="item in previewNotifications"
            :key="item.id"
            class="notification-item"
            :class="{ 'is-unread': item.isRead !== 1 }"
            @click="openNotificationCenter(item.id)"
          >
            <div class="notification-item__top">
              <div class="notification-item__title-wrap">
                <span class="notification-item__title">{{ item.title }}</span>
                <span v-if="item.isRead !== 1" class="notification-item__dot" />
              </div>
              <n-tag size="small" round :type="getPriorityType(item.priority)">
                {{ t(`notifications.priorities.${item.priority ?? 0}`) }}
              </n-tag>
            </div>

            <div class="notification-item__type">
              <n-tag size="small" type="info" secondary round>
                {{ getTypeLabel(item.type) }}
              </n-tag>
              <span>{{ formatDateTime(item.createTime) }}</span>
            </div>

            <p class="notification-item__content">{{ item.content }}</p>

            <div class="notification-item__actions">
              <span class="notification-item__expire">
                {{ t('notifications.expireAt') }}: {{ formatDateTime(item.expireTime) }}
              </span>
              <n-button
                v-if="item.isRead !== 1"
                size="tiny"
                secondary
                type="primary"
                @click.stop="handleMarkRead(item.id)"
              >
                {{ t('notifications.markRead') }}
              </n-button>
            </div>
          </article>
        </div>

        <n-empty v-else :description="t('notifications.empty')" size="small" />
      </n-spin>
    </div>
  </n-popover>

  <n-badge v-else :value="displayCount" :show="notificationStore.hasUnread" processing>
    <n-button quaternary circle class="notification-trigger" :aria-label="t('notifications.openCenter')" @click="handleTriggerClick">
      <template #icon>
        <Bell :size="20" />
      </template>
    </n-button>
  </n-badge>
</template>

<style scoped>
.notification-trigger {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: var(--surface-muted);
  border: 1px solid var(--card-border);
  box-shadow: 0 12px 22px -18px var(--shadow-color);
  color: var(--secondary-text);
}

.notification-trigger:hover {
  color: var(--text-color);
  transform: translateY(-1px);
}

.notification-popover {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notification-popover__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.notification-popover__header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-wrap: wrap;
}

.notification-popover__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-color);
}

.notification-popover__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--secondary-text);
}

.notification-popover__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(68vh, 520px);
  overflow: auto;
  padding-right: 4px;
}

.notification-item {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  background: var(--card-bg);
  box-shadow: 0 14px 30px -28px var(--shadow-color);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.notification-item:hover {
  transform: translateY(-1px);
}

.notification-item.is-unread {
  border-color: rgba(99, 102, 241, 0.32);
  box-shadow: 0 18px 32px -28px rgba(99, 102, 241, 0.34);
}

.notification-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.notification-item__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.notification-item__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-color);
  overflow-wrap: anywhere;
}

.notification-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6366f1;
  flex-shrink: 0;
}

.notification-item__type {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--secondary-text);
}

.notification-item__content {
  margin: 12px 0 0;
  color: var(--text-color);
  font-size: 13px;
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-item__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
}

.notification-item__expire {
  font-size: 12px;
  color: var(--secondary-text);
  overflow-wrap: anywhere;
}

:global(html[data-theme='light'] .notification-trigger) {
  color: #475569;
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(203, 213, 225, 0.88);
}

:global(html[data-theme='light'] .notification-trigger:hover) {
  background: rgba(239, 246, 255, 0.96);
  border-color: rgba(148, 163, 184, 0.52);
}

:global(html[data-theme='light'] .notification-item) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.97));
  border-color: rgba(203, 213, 225, 0.86);
}

:global(html[data-theme='light'] .notification-item.is-unread) {
  border-color: rgba(99, 102, 241, 0.24);
  box-shadow: 0 18px 30px -26px rgba(99, 102, 241, 0.2);
}

@media (max-width: 480px) {
  .notification-trigger {
    width: 36px;
    height: 36px;
  }
}
</style>
