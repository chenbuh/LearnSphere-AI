<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NPagination,
  NSelect,
  NSpace,
  NSpin,
  NTag
} from 'naive-ui'
import { Bell, CheckCheck, RefreshCw, SlidersHorizontal } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const validTypes = ['all', 'system', 'announcement', 'update', 'warning']
const validReadStatuses = ['all', '0', '1']

const selectedType = ref(notificationStore.query.type || 'all')
const selectedReadStatus = ref(notificationStore.query.readStatus || 'all')
const draftType = ref('all')
const draftReadStatus = ref('all')
const detailVisible = ref(false)
const activeNotification = ref(null)
const filterDrawerVisible = ref(false)
const isMobile = ref(false)

const currentPage = computed(() => notificationStore.pagination.page || 1)
const pageSize = computed(() => notificationStore.pagination.size || 10)
const total = computed(() => notificationStore.pagination.total || 0)
const hasActiveFilters = computed(() => selectedType.value !== 'all' || selectedReadStatus.value !== 'all')
const emptyDescription = computed(() => (
  selectedType.value !== 'all' || selectedReadStatus.value !== 'all'
    ? t('notifications.emptyFiltered')
    : t('notifications.empty')
))
const activeFilterChips = computed(() => {
  const chips = []

  if (selectedType.value !== 'all') {
    chips.push({
      key: 'type',
      text: `${t('notifications.filters.type')}: ${getTypeLabel(selectedType.value)}`
    })
  }

  if (selectedReadStatus.value !== 'all') {
    chips.push({
      key: 'readStatus',
      text: `${t('notifications.filters.status')}: ${selectedReadStatus.value === '0' ? t('notifications.unread') : t('notifications.read')}`
    })
  }

  return chips
})
const mobileFilterButtonLabel = computed(() => (
  hasActiveFilters.value
    ? `${t('notifications.filters.action')} (${activeFilterChips.value.length})`
    : t('notifications.filters.action')
))
const detailDrawerPlacement = computed(() => (isMobile.value ? 'bottom' : 'right'))
const detailDrawerWidth = computed(() => (isMobile.value ? undefined : 'min(100vw, 560px)'))
const detailDrawerHeight = computed(() => (isMobile.value ? 'min(86vh, 720px)' : undefined))
const filterDrawerHeight = computed(() => 'min(78vh, 420px)')

const typeOptions = computed(() => [
  { label: t('notifications.filterOptions.allTypes'), value: 'all' },
  { label: t('notifications.types.system'), value: 'system' },
  { label: t('notifications.types.announcement'), value: 'announcement' },
  { label: t('notifications.types.update'), value: 'update' },
  { label: t('notifications.types.warning'), value: 'warning' }
])

const readStatusOptions = computed(() => [
  { label: t('notifications.filterOptions.allStatus'), value: 'all' },
  { label: t('notifications.unread'), value: '0' },
  { label: t('notifications.read'), value: '1' }
])

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

const normalizeTypeValue = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return validTypes.includes(normalized) ? normalized : 'all'
}

const normalizeReadStatusValue = (value) => {
  const normalized = value === null || value === undefined ? '' : String(value).trim()
  return validReadStatuses.includes(normalized) ? normalized : 'all'
}

const parseRouteFilters = () => ({
  type: normalizeTypeValue(route.query.type),
  readStatus: normalizeReadStatusValue(route.query.readStatus)
})

const buildRouteQuery = (notificationId = null) => {
  const nextQuery = { ...route.query }

  if (selectedType.value !== 'all') {
    nextQuery.type = selectedType.value
  } else {
    delete nextQuery.type
  }

  if (selectedReadStatus.value !== 'all') {
    nextQuery.readStatus = String(selectedReadStatus.value)
  } else {
    delete nextQuery.readStatus
  }

  if (notificationId) {
    nextQuery.notificationId = String(notificationId)
  } else {
    delete nextQuery.notificationId
  }
  return nextQuery
}

const syncViewportState = () => {
  if (typeof window === 'undefined') {
    isMobile.value = false
    return
  }

  isMobile.value = window.innerWidth <= 640
}

const syncDraftFilters = () => {
  draftType.value = selectedType.value
  draftReadStatus.value = selectedReadStatus.value
}

const syncActiveNotification = () => {
  if (!activeNotification.value?.id) {
    return
  }

  const latest = notificationStore.notifications.find(item => item.id === activeNotification.value.id)
  if (latest) {
    activeNotification.value = { ...latest }
  }
}

const fetchPage = async (page = 1, options = {}) => {
  const { syncRoute = true } = options

  await notificationStore.refreshNotifications({
    page,
    size: pageSize.value,
    type: selectedType.value,
    readStatus: selectedReadStatus.value
  })

  if (activeNotification.value?.id) {
    const latest = notificationStore.notifications.find(item => item.id === activeNotification.value.id)
    if (latest) {
      activeNotification.value = { ...latest }
    } else {
      detailVisible.value = false
      activeNotification.value = null
    }
  }

  if (syncRoute) {
    const nextQuery = buildRouteQuery(detailVisible.value ? activeNotification.value?.id : null)
    if (JSON.stringify(route.query) !== JSON.stringify(nextQuery)) {
      await router.replace({ query: nextQuery })
    }
  }
}

const handlePageChange = async (page) => {
  await fetchPage(page)
}

const handleFilterChange = async () => {
  await fetchPage(1)
}

const handleRefresh = async () => {
  await fetchPage(currentPage.value)
}

const openFilterDrawer = () => {
  syncDraftFilters()
  filterDrawerVisible.value = true
}

const applyMobileFilters = async () => {
  selectedType.value = draftType.value
  selectedReadStatus.value = draftReadStatus.value
  filterDrawerVisible.value = false
  await fetchPage(1)
}

const clearAllFilters = async () => {
  draftType.value = 'all'
  draftReadStatus.value = 'all'
  selectedType.value = 'all'
  selectedReadStatus.value = 'all'
  filterDrawerVisible.value = false
  await fetchPage(1)
}

const removeFilterChip = async (key) => {
  if (key === 'type') {
    selectedType.value = 'all'
  }
  if (key === 'readStatus') {
    selectedReadStatus.value = 'all'
  }
  syncDraftFilters()
  await fetchPage(1)
}

const handleMarkRead = async (notificationId) => {
  await notificationStore.markAsRead(notificationId)

  if (activeNotification.value?.id === notificationId) {
    const latest = notificationStore.notifications.find(item => item.id === notificationId)
    activeNotification.value = latest
      ? { ...latest }
      : {
          ...activeNotification.value,
          isRead: 1,
          readTime: activeNotification.value.readTime || new Date().toISOString()
        }
  }
}

const handleMarkAllAsRead = async () => {
  await notificationStore.markAllAsRead()

  if (activeNotification.value) {
    activeNotification.value = {
      ...activeNotification.value,
      isRead: 1,
      readTime: activeNotification.value.readTime || new Date().toISOString()
    }
  }
}

const openNotificationDetail = async (item, options = {}) => {
  const { syncRoute = true } = options
  activeNotification.value = { ...item }
  detailVisible.value = true

  if (syncRoute) {
    await router.replace({ query: buildRouteQuery(item.id) })
  }
}

const closeNotificationDetail = async (options = {}) => {
  const { syncRoute = true } = options
  detailVisible.value = false
  activeNotification.value = null

  if (syncRoute && route.query.notificationId) {
    await router.replace({ query: buildRouteQuery() })
  }
}

watch(
  [() => route.query.notificationId, () => notificationStore.notifications],
  ([notificationId]) => {
    if (!notificationId) {
      return
    }

    const target = notificationStore.notifications.find(item => String(item.id) === String(notificationId))
    if (!target) {
      return
    }

    if (!detailVisible.value || activeNotification.value?.id !== target.id) {
      activeNotification.value = { ...target }
      detailVisible.value = true
      return
    }

    syncActiveNotification()
  },
  { deep: true }
)

watch(
  [() => route.query.type, () => route.query.readStatus],
  async () => {
    const routeFilters = parseRouteFilters()
    if (routeFilters.type === selectedType.value && routeFilters.readStatus === selectedReadStatus.value) {
      return
    }

    selectedType.value = routeFilters.type
    selectedReadStatus.value = routeFilters.readStatus
    syncDraftFilters()
    await fetchPage(1, { syncRoute: false })
  }
)

onMounted(async () => {
  syncViewportState()
  window.addEventListener('resize', syncViewportState)

  const routeFilters = parseRouteFilters()
  selectedType.value = routeFilters.type
  selectedReadStatus.value = routeFilters.readStatus
  syncDraftFilters()

  const initialPage = route.query.notificationId ? 1 : currentPage.value
  await fetchPage(initialPage, { syncRoute: false })
})

onUnmounted(() => {
  window.removeEventListener('resize', syncViewportState)
})
</script>

<template>
  <div class="notifications-page">
    <section class="notifications-hero">
      <div class="notifications-hero__copy">
        <div class="notifications-hero__eyebrow">
          <Bell :size="15" />
          <span>{{ t('notifications.trigger') }}</span>
        </div>
        <h1>{{ t('notifications.title') }}</h1>
        <p>{{ t('notifications.subtitle') }}</p>
      </div>

      <div class="notifications-hero__stats">
        <div class="notifications-stat">
          <span class="notifications-stat__label">{{ t('notifications.total') }}</span>
          <strong>{{ total }}</strong>
        </div>
        <div class="notifications-stat is-unread">
          <span class="notifications-stat__label">{{ t('notifications.unreadCount') }}</span>
          <strong>{{ notificationStore.unreadCount }}</strong>
        </div>
      </div>
    </section>

    <section class="notifications-toolbar" :class="{ 'is-mobile': isMobile }">
      <template v-if="!isMobile">
        <div class="notifications-toolbar__filters">
          <div class="notifications-toolbar__filter">
            <span>{{ t('notifications.filters.type') }}</span>
            <n-select
              v-model:value="selectedType"
              :options="typeOptions"
              size="small"
              @update:value="handleFilterChange"
            />
          </div>
          <div class="notifications-toolbar__filter">
            <span>{{ t('notifications.filters.status') }}</span>
            <n-select
              v-model:value="selectedReadStatus"
              :options="readStatusOptions"
              size="small"
              @update:value="handleFilterChange"
            />
          </div>
        </div>

        <n-space wrap>
          <n-button secondary @click="handleRefresh">
            <template #icon>
              <RefreshCw :size="16" />
            </template>
            {{ t('notifications.refresh') }}
          </n-button>
          <n-button
            type="primary"
            secondary
            :disabled="!notificationStore.hasUnread"
            @click="handleMarkAllAsRead"
          >
            <template #icon>
              <CheckCheck :size="16" />
            </template>
            {{ t('notifications.allRead') }}
          </n-button>
        </n-space>
      </template>

      <template v-else>
        <div class="notifications-toolbar__mobile-actions">
          <n-button secondary @click="openFilterDrawer">
            <template #icon>
              <SlidersHorizontal :size="16" />
            </template>
            {{ mobileFilterButtonLabel }}
          </n-button>
          <n-button secondary @click="handleRefresh">
            <template #icon>
              <RefreshCw :size="16" />
            </template>
            {{ t('notifications.refresh') }}
          </n-button>
          <n-button
            type="primary"
            secondary
            :disabled="!notificationStore.hasUnread"
            @click="handleMarkAllAsRead"
          >
            <template #icon>
              <CheckCheck :size="16" />
            </template>
            {{ t('notifications.allRead') }}
          </n-button>
        </div>

        <div v-if="hasActiveFilters" class="notifications-toolbar__chips">
          <n-tag
            v-for="chip in activeFilterChips"
            :key="chip.key"
            round
            closable
            type="info"
            @close="removeFilterChip(chip.key)"
          >
            {{ chip.text }}
          </n-tag>
          <n-button text type="primary" class="notifications-toolbar__clear" @click="clearAllFilters">
            {{ t('notifications.filters.clear') }}
          </n-button>
        </div>
      </template>
    </section>

    <n-spin :show="notificationStore.loading">
      <section v-if="notificationStore.notifications.length" class="notifications-list">
        <n-card
          v-for="item in notificationStore.notifications"
          :key="item.id"
          :bordered="false"
          class="notification-card"
          :class="{ 'is-unread': item.isRead !== 1 }"
          @click="openNotificationDetail(item)"
        >
          <div class="notification-card__header">
            <div class="notification-card__headline">
              <div class="notification-card__title-wrap">
                <h2>{{ item.title }}</h2>
                <span v-if="item.isRead !== 1" class="notification-card__dot" />
              </div>
              <div class="notification-card__tags">
                <n-tag size="small" type="info" secondary round>
                  {{ getTypeLabel(item.type) }}
                </n-tag>
                <n-tag size="small" round :type="getPriorityType(item.priority)">
                  {{ t(`notifications.priorities.${item.priority ?? 0}`) }}
                </n-tag>
                <n-tag size="small" round :type="item.isRead === 1 ? 'default' : 'success'">
                  {{ item.isRead === 1 ? t('notifications.read') : t('notifications.unread') }}
                </n-tag>
              </div>
            </div>

            <n-button
              v-if="item.isRead !== 1"
              type="primary"
              secondary
              size="small"
              @click.stop="handleMarkRead(item.id)"
            >
              <template #icon>
                <CheckCheck :size="14" />
              </template>
              {{ t('notifications.markRead') }}
            </n-button>
          </div>

          <p class="notification-card__content">{{ item.content }}</p>

          <div class="notification-card__meta">
            <span>{{ formatDateTime(item.createTime) }}</span>
            <span>{{ t('notifications.expireAt') }}: {{ formatDateTime(item.expireTime) }}</span>
            <span v-if="item.isRead === 1 && item.readTime">
              {{ t('notifications.readAt') }}: {{ formatDateTime(item.readTime) }}
            </span>
          </div>
        </n-card>
      </section>

      <n-empty v-else :description="emptyDescription" class="notifications-empty" />
    </n-spin>

    <div v-if="total > pageSize" class="notifications-pagination">
      <n-pagination
        :page="currentPage"
        :page-size="pageSize"
        :item-count="total"
        @update:page="handlePageChange"
      />
    </div>

    <n-drawer
      v-model:show="filterDrawerVisible"
      placement="bottom"
      :height="filterDrawerHeight"
      :trap-focus="false"
    >
      <n-drawer-content :title="t('notifications.filters.title')" class="notification-filter-drawer">
        <div class="notification-filter-sheet">
          <div class="notification-filter-sheet__group">
            <span>{{ t('notifications.filters.type') }}</span>
            <n-select
              v-model:value="draftType"
              :options="typeOptions"
            />
          </div>

          <div class="notification-filter-sheet__group">
            <span>{{ t('notifications.filters.status') }}</span>
            <n-select
              v-model:value="draftReadStatus"
              :options="readStatusOptions"
            />
          </div>

          <div class="notification-filter-sheet__footer">
            <n-button secondary @click="clearAllFilters">
              {{ t('notifications.filters.clear') }}
            </n-button>
            <n-button type="primary" @click="applyMobileFilters">
              {{ t('notifications.filters.apply') }}
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>

    <n-drawer
      v-model:show="detailVisible"
      :placement="detailDrawerPlacement"
      :width="detailDrawerWidth"
      :height="detailDrawerHeight"
      :trap-focus="false"
      @update:show="(show) => !show && closeNotificationDetail()"
    >
      <n-drawer-content v-if="activeNotification" :title="activeNotification.title" class="notification-detail-drawer">
        <template #header-extra>
          <n-button
            v-if="!isMobile && activeNotification.isRead !== 1"
            size="small"
            type="primary"
            secondary
            @click="handleMarkRead(activeNotification.id)"
          >
            <template #icon>
              <CheckCheck :size="14" />
            </template>
            {{ t('notifications.markRead') }}
          </n-button>
        </template>

        <div class="notification-detail">
          <div class="notification-detail__labels">
            <n-tag size="small" type="info" secondary round>
              {{ getTypeLabel(activeNotification.type) }}
            </n-tag>
            <n-tag size="small" round :type="getPriorityType(activeNotification.priority)">
              {{ t(`notifications.priorities.${activeNotification.priority ?? 0}`) }}
            </n-tag>
            <n-tag size="small" round :type="activeNotification.isRead === 1 ? 'default' : 'success'">
              {{ activeNotification.isRead === 1 ? t('notifications.read') : t('notifications.unread') }}
            </n-tag>
          </div>

          <div class="notification-detail__meta">
            <div>
              <span>{{ t('notifications.createdAt') }}</span>
              <strong>{{ formatDateTime(activeNotification.createTime) }}</strong>
            </div>
            <div>
              <span>{{ t('notifications.expireAt') }}</span>
              <strong>{{ formatDateTime(activeNotification.expireTime) }}</strong>
            </div>
            <div v-if="activeNotification.readTime">
              <span>{{ t('notifications.readAt') }}</span>
              <strong>{{ formatDateTime(activeNotification.readTime) }}</strong>
            </div>
          </div>

          <div class="notification-detail__body">
            {{ activeNotification.content }}
          </div>

          <div v-if="isMobile && activeNotification.isRead !== 1" class="notification-detail__footer">
            <n-button block type="primary" @click="handleMarkRead(activeNotification.id)">
              <template #icon>
                <CheckCheck :size="16" />
              </template>
              {{ t('notifications.markRead') }}
            </n-button>
          </div>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.notifications-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.9fr);
  gap: 18px;
  padding: 24px 26px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.22), transparent 38%),
    linear-gradient(135deg, rgba(22, 26, 41, 0.96), rgba(30, 41, 59, 0.88));
  border: 1px solid rgba(129, 140, 248, 0.2);
  box-shadow: 0 30px 50px -34px rgba(15, 23, 42, 0.54);
}

.notifications-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.18);
  color: #c7d2fe;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notifications-hero__copy h1 {
  margin: 16px 0 10px;
  font-size: clamp(28px, 3.2vw, 40px);
  line-height: 1.04;
  color: #f8fafc;
}

.notifications-hero__copy p {
  margin: 0;
  max-width: 56ch;
  color: rgba(226, 232, 240, 0.8);
  line-height: 1.75;
}

.notifications-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.notifications-stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-height: 116px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.34);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #e2e8f0;
}

.notifications-stat.is-unread {
  background: rgba(79, 70, 229, 0.22);
  border-color: rgba(129, 140, 248, 0.3);
}

.notifications-stat__label {
  font-size: 12px;
  color: rgba(226, 232, 240, 0.72);
}

.notifications-stat strong {
  font-size: clamp(30px, 4vw, 40px);
  line-height: 1;
}

.notifications-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.notifications-toolbar.is-mobile {
  gap: 12px;
}

.notifications-toolbar__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.notifications-toolbar__filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 176px;
}

.notifications-toolbar__filter span {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary-text);
}

.notifications-toolbar__filter :deep(.n-base-selection) {
  min-height: 40px;
  border-radius: 14px;
}

.notifications-toolbar__mobile-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}

.notifications-toolbar__mobile-actions :deep(.n-button) {
  width: 100%;
}

.notifications-toolbar__mobile-actions :deep(.n-button:nth-child(3)) {
  grid-column: 1 / -1;
}

.notifications-toolbar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.notifications-toolbar__clear {
  padding-inline: 0;
}

.notifications-list {
  display: grid;
  gap: 16px;
}

.notification-card {
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: 0 26px 48px -38px var(--shadow-color);
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 30px 52px -40px var(--shadow-color);
}

.notification-card.is-unread {
  border-color: rgba(99, 102, 241, 0.26);
  box-shadow: 0 26px 48px -38px rgba(99, 102, 241, 0.24);
}

.notification-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.notification-card__headline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.notification-card__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.notification-card__title-wrap h2 {
  margin: 0;
  font-size: 20px;
  color: var(--text-color);
  overflow-wrap: anywhere;
}

.notification-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6366f1;
  flex-shrink: 0;
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.14);
}

.notification-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notification-card__content {
  margin: 18px 0 0;
  color: var(--text-color);
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--card-border);
  font-size: 12px;
  color: var(--secondary-text);
}

.notifications-pagination {
  display: flex;
  justify-content: center;
  padding-bottom: 8px;
}

.notifications-empty {
  padding: 44px 0 28px;
}

.notification-filter-sheet {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.notification-filter-sheet__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-filter-sheet__group span {
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-text);
}

.notification-filter-sheet__group :deep(.n-base-selection) {
  min-height: 44px;
  border-radius: 16px;
}

.notification-filter-sheet__footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.notification-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notification-detail__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notification-detail__meta {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: var(--surface-muted);
  border: 1px solid var(--card-border);
}

.notification-detail__meta div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.notification-detail__meta span {
  font-size: 12px;
  color: var(--secondary-text);
}

.notification-detail__meta strong {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.notification-detail__body {
  padding: 22px;
  border-radius: 22px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-color);
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.notification-detail__footer {
  position: sticky;
  bottom: 0;
  padding-top: 4px;
  padding-bottom: calc(4px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(15, 23, 42, 0), rgba(15, 23, 42, 0.2) 24%, rgba(15, 23, 42, 0.92));
}

:global(html[data-theme='light'] .notifications-hero) {
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 36%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.98));
  border-color: rgba(191, 219, 254, 0.74);
  box-shadow: 0 28px 48px -34px rgba(15, 23, 42, 0.16);
}

:global(html[data-theme='light'] .notifications-hero__eyebrow) {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
}

:global(html[data-theme='light'] .notifications-hero__copy h1) {
  color: #182132;
}

:global(html[data-theme='light'] .notifications-hero__copy p) {
  color: #64748b;
}

:global(html[data-theme='light'] .notifications-stat) {
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(226, 232, 240, 0.88);
  color: #182132;
}

:global(html[data-theme='light'] .notifications-stat__label) {
  color: #64748b;
}

:global(html[data-theme='light'] .notifications-stat.is-unread) {
  background: rgba(238, 242, 255, 0.88);
  border-color: rgba(165, 180, 252, 0.5);
}

:global(html[data-theme='light'] .notification-card) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.97));
  border-color: rgba(226, 232, 240, 0.92);
}

:global(html[data-theme='light'] .notification-card:hover) {
  box-shadow: 0 30px 50px -38px rgba(15, 23, 42, 0.12);
}

:global(html[data-theme='light'] .notification-card.is-unread) {
  border-color: rgba(99, 102, 241, 0.22);
}

:global(html[data-theme='light'] .notification-detail__meta),
:global(html[data-theme='light'] .notification-detail__body) {
  border-color: rgba(226, 232, 240, 0.92);
}

:global(html[data-theme='light'] .notification-detail__meta) {
  background: rgba(248, 250, 252, 0.92);
}

:global(html[data-theme='light'] .notification-detail__footer) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(248, 250, 252, 0.7) 22%, rgba(248, 250, 252, 0.98));
}

@media (max-width: 900px) {
  .notifications-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .notifications-hero {
    padding: 18px;
    border-radius: 22px;
  }

  .notifications-toolbar__filters {
    width: 100%;
  }

  .notifications-toolbar__filter {
    flex: 1 1 0;
    min-width: 0;
  }

  .notifications-hero__stats {
    grid-template-columns: 1fr 1fr;
  }

  .notification-card__header {
    flex-direction: column;
  }

  .notification-card__header :deep(.n-button) {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .notifications-page {
    gap: 16px;
  }

  .notifications-hero__copy h1 {
    margin-top: 14px;
    font-size: 28px;
  }

  .notifications-hero__stats {
    grid-template-columns: 1fr;
  }

  .notifications-toolbar {
    justify-content: stretch;
  }

  .notifications-toolbar__mobile-actions {
    grid-template-columns: 1fr;
  }

  .notifications-toolbar__mobile-actions :deep(.n-button:nth-child(3)) {
    grid-column: auto;
  }

  .notifications-toolbar :deep(.n-space) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
  }

  .notifications-toolbar :deep(.n-button) {
    width: 100%;
  }

  .notifications-toolbar__filters {
    display: grid;
    grid-template-columns: 1fr;
  }

  .notification-card {
    border-radius: 20px;
  }

  .notification-card__title-wrap h2 {
    font-size: 18px;
  }

  .notification-filter-sheet__footer {
    grid-template-columns: 1fr;
  }

  .notification-detail__body,
  .notification-detail__meta {
    padding: 16px;
  }
}
</style>
