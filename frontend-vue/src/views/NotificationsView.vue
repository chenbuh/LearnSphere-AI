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
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellDot,
  BellRing,
  CheckCheck,
  CheckCircle2,
  Compass,
  Inbox,
  Megaphone,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Zap
} from 'lucide-vue-next'
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
const hasActiveFilters = computed(
  () => selectedType.value !== 'all' || selectedReadStatus.value !== 'all'
)
const emptyDescription = computed(() =>
  selectedType.value !== 'all' || selectedReadStatus.value !== 'all'
    ? t('notifications.emptyFiltered')
    : t('notifications.empty')
)

const heroActivityStatus = computed(() => {
  const unread = notificationStore.unreadCount || 0
  if (unread === 0) {
    return {
      isClean: true,
      title: '信道畅通 · 消息已全量查阅',
      subtitle: '当前暂无待处理的新增系统公告或课务变动，学习进度与账号状态一切正常。',
      badge: '全部已读',
      tone: 'emerald'
    }
  }
  return {
    isClean: false,
    title: `发现 ${unread} 条重点动态待查收`,
    subtitle: '建议及时查看最新的系统更新、批改反馈与教务提醒，保持高效学习节奏。',
    badge: `${unread} 条未读`,
    tone: 'amber'
  }
})

const overviewStats = computed(() => {
  const unread = notificationStore.unreadCount || 0
  const tot = total.value
  return [
    {
      key: 'total',
      label: '累计接收',
      value: String(tot),
      badge: tot > 0 ? '历史归档' : '全新信箱',
      tone: 'cyan',
      icon: Inbox,
      caption: '全部历史消息汇总'
    },
    {
      key: 'unread',
      label: '未读动态',
      value: String(unread),
      badge: unread === 0 ? '完全掌握' : '待查收',
      tone: unread === 0 ? 'emerald' : 'rose',
      icon: BellDot,
      caption: unread === 0 ? '收件箱已全部清空' : '需及时关注的新动态'
    },
    {
      key: 'status',
      label: '实时推送',
      value: '在线',
      badge: '通道畅通',
      tone: 'indigo',
      icon: Radio,
      caption: '即时消息通道正常运行'
    }
  ]
})

const goToLearningHub = () => {
  router.push('/learning-hub')
}

const goToDailyTasks = () => {
  router.push('/daily-tasks')
}

const getTypeConfig = type => {
  switch (type) {
    case 'announcement':
      return {
        icon: Megaphone,
        tone: 'cyan',
        color: 'var(--tone-emerald)',
        bg: 'rgba(43, 122, 96, 0.12)'
      }
    case 'update':
      // R7：数据层颜色同时用于文字与边框，文字色改走主题令牌
      return {
        icon: Sparkles,
        tone: 'emerald',
        color: 'var(--tone-emerald)',
        bg: 'rgba(16, 185, 129, 0.12)'
      }
    case 'warning':
      return {
        icon: AlertTriangle,
        tone: 'rose',
        color: 'var(--tone-red)',
        bg: 'rgba(239, 68, 68, 0.12)'
      }
    case 'system':
    default:
      return {
        icon: Bell,
        tone: 'indigo',
        color: 'var(--tone-emerald)',
        bg: 'rgba(30, 107, 82, 0.12)'
      }
  }
}
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
const mobileFilterButtonLabel = computed(() =>
  hasActiveFilters.value
    ? `${t('notifications.filters.action')} (${activeFilterChips.value.length})`
    : t('notifications.filters.action')
)
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

const formatDateTime = value => {
  if (!value) {
    return t('notifications.permanent')
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString(locale.value || undefined)
}

const getTypeLabel = type => t(`notifications.types.${type || 'system'}`)

const getPriorityType = priority => {
  if (priority >= 2) {
    return 'error'
  }
  if (priority >= 1) {
    return 'warning'
  }
  return 'default'
}

const normalizeTypeValue = value => {
  const normalized = typeof value === 'string' ? value.trim() : ''
  return validTypes.includes(normalized) ? normalized : 'all'
}

const normalizeReadStatusValue = value => {
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

  const latest = notificationStore.notifications.find(
    item => item.id === activeNotification.value.id
  )
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
    const latest = notificationStore.notifications.find(
      item => item.id === activeNotification.value.id
    )
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

const handlePageChange = async page => {
  await fetchPage(page)
}

const handleFilterChange = async () => {
  await fetchPage(1)
}

/**
 * 切换筛选条件并重新加载列表。
 *
 * 原先在模板里写成 `@click="selectedType = opt.value; handleFilterChange()"`，
 * 多语句内联处理器会被 Prettier 拆成多行并丢掉分号，导致 Vue 模板编译失败。
 * 改为方法调用既避免该问题，也让模板更易读。
 */
const applyTypeFilter = async value => {
  selectedType.value = value
  await handleFilterChange()
}

const applyReadStatusFilter = async value => {
  selectedReadStatus.value = value
  await handleFilterChange()
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

const removeFilterChip = async key => {
  if (key === 'type') {
    selectedType.value = 'all'
  }
  if (key === 'readStatus') {
    selectedReadStatus.value = 'all'
  }
  syncDraftFilters()
  await fetchPage(1)
}

const handleMarkRead = async notificationId => {
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

    const target = notificationStore.notifications.find(
      item => String(item.id) === String(notificationId)
    )
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

watch([() => route.query.type, () => route.query.readStatus], async () => {
  const routeFilters = parseRouteFilters()
  if (
    routeFilters.type === selectedType.value &&
    routeFilters.readStatus === selectedReadStatus.value
  ) {
    return
  }

  selectedType.value = routeFilters.type
  selectedReadStatus.value = routeFilters.readStatus
  syncDraftFilters()
  await fetchPage(1, { syncRoute: false })
})

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
        <div class="hero-topline">
          <div class="notifications-hero__eyebrow">
            <BellRing :size="15" />
            <span>即时通讯 & 动态中心</span>
          </div>
          <div class="hero-status-pill" :class="`is-${heroActivityStatus.tone}`">
            <span class="status-dot"></span>
            <span>{{ heroActivityStatus.badge }}</span>
          </div>
        </div>

        <div class="hero-title-row">
          <div class="hero-mark">
            <Bell :size="26" />
          </div>
          <div class="hero-title-copy">
            <h1>{{ t('notifications.title') }}</h1>
            <p>{{ t('notifications.subtitle') }}</p>
          </div>
        </div>

        <div class="hero-mastery-strip" :class="`is-${heroActivityStatus.tone}`">
          <div class="mastery-copy">
            <div class="mastery-title-row">
              <component
                :is="heroActivityStatus.isClean ? CheckCircle2 : Sparkles"
                :size="18"
                class="mastery-icon"
              />
              <strong>{{ heroActivityStatus.title }}</strong>
            </div>
            <p>{{ heroActivityStatus.subtitle }}</p>
          </div>

          <div class="hero-action-group">
            <button
              type="button"
              class="hero-cta-btn is-primary"
              :disabled="notificationStore.loading"
              @click="handleRefresh"
            >
              <RefreshCw :size="15" :class="{ 'is-spinning': notificationStore.loading }" />
              <span>刷新最新消息</span>
            </button>
            <button
              type="button"
              class="hero-cta-btn is-secondary"
              :disabled="!notificationStore.hasUnread"
              @click="handleMarkAllAsRead"
            >
              <CheckCheck :size="15" />
              <span>全部设为已读</span>
            </button>
          </div>
        </div>
      </div>

      <div class="notifications-hero__stats">
        <article
          v-for="item in overviewStats"
          :key="item.key"
          class="bento-stat-card"
          :class="`tone-${item.tone}`"
        >
          <div class="bento-top">
            <span class="bento-icon-box">
              <component :is="item.icon" :size="18" />
            </span>
            <span class="bento-badge">{{ item.badge }}</span>
          </div>
          <div class="bento-metric">
            <span class="bento-label">{{ item.label }}</span>
            <strong class="bento-value">{{ item.value }}</strong>
          </div>
          <small class="bento-caption">{{ item.caption }}</small>
        </article>
      </div>
    </section>

    <section class="notifications-toolbar" :class="{ 'is-mobile': isMobile }">
      <template v-if="!isMobile">
        <div class="notifications-toolbar__filters">
          <div class="toolbar-pills-group">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              type="button"
              class="filter-pill"
              :class="{ 'is-active': selectedType === opt.value }"
              @click="applyTypeFilter(opt.value)"
            >
              <span class="pill-dot" :class="`pill-dot--${opt.value}`"></span>
              <span>{{ opt.label }}</span>
            </button>
          </div>

          <div class="toolbar-divider"></div>

          <div class="toolbar-pills-group">
            <button
              v-for="opt in readStatusOptions"
              :key="opt.value"
              type="button"
              class="filter-pill status-pill"
              :class="{ 'is-active': selectedReadStatus === opt.value }"
              @click="applyReadStatusFilter(opt.value)"
            >
              <span>{{ opt.label }}</span>
            </button>
          </div>
        </div>

        <div class="toolbar-actions">
          <button
            v-if="hasActiveFilters"
            type="button"
            class="clear-filter-btn"
            @click="clearAllFilters"
          >
            <RotateCcw :size="14" />
            <span>清空筛选</span>
          </button>
          <button
            type="button"
            class="refresh-icon-btn"
            :disabled="notificationStore.loading"
            @click="handleRefresh"
            title="刷新通知"
          >
            <RefreshCw :size="16" :class="{ 'is-spinning': notificationStore.loading }" />
          </button>
        </div>
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
          <n-button
            text
            type="primary"
            class="notifications-toolbar__clear"
            @click="clearAllFilters"
          >
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
              <div class="notification-card__icon-col">
                <span
                  class="notification-type-avatar"
                  :style="{
                    color: getTypeConfig(item.type).color,
                    background: getTypeConfig(item.type).bg
                  }"
                >
                  <component :is="getTypeConfig(item.type).icon" :size="20" />
                </span>
              </div>
              <div class="notification-card__main-info">
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

      <div v-else class="notifications-empty orbit-deck">
        <div class="orbit-badge-hub" :class="hasActiveFilters ? 'is-search' : 'is-clean'">
          <div class="orbit-ring orbit-ring--outer"></div>
          <div class="orbit-ring orbit-ring--inner"></div>
          <div class="orbit-icon-core">
            <Search v-if="hasActiveFilters" :size="32" />
            <Inbox v-else :size="32" />
          </div>
        </div>

        <div class="orbit-copy">
          <h3 class="orbit-title">{{ emptyDescription }}</h3>
          <p class="orbit-desc">
            {{
              hasActiveFilters
                ? '当前筛选条件下未检索到相关消息，可尝试切换类型或清空过滤条件。'
                : '当前收件箱没有待处理的通知或公告，你的学习进度与账号状态一切正常。'
            }}
          </p>
        </div>

        <div class="orbit-actions">
          <button
            v-if="hasActiveFilters"
            type="button"
            class="orbit-btn orbit-btn--primary"
            @click="clearAllFilters"
          >
            <RotateCcw :size="15" />
            <span>清空筛选条件</span>
          </button>
          <template v-else>
            <button type="button" class="orbit-btn orbit-btn--primary" @click="goToLearningHub">
              <span>前往学习中心</span>
              <ArrowRight :size="15" />
            </button>
            <button type="button" class="orbit-btn orbit-btn--secondary" @click="goToDailyTasks">
              <Compass :size="15" />
              <span>查看每日任务</span>
            </button>
            <button
              type="button"
              class="orbit-btn orbit-btn--ghost"
              :disabled="notificationStore.loading"
              @click="handleRefresh"
            >
              <RefreshCw :size="15" :class="{ 'is-spinning': notificationStore.loading }" />
              <span>刷新消息</span>
            </button>
          </template>
        </div>
      </div>
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
      <n-drawer-content
        :title="t('notifications.filters.title')"
        class="notification-filter-drawer"
      >
        <div class="notification-filter-sheet">
          <div class="notification-filter-sheet__group">
            <span>{{ t('notifications.filters.type') }}</span>
            <n-select v-model:value="draftType" :options="typeOptions" />
          </div>

          <div class="notification-filter-sheet__group">
            <span>{{ t('notifications.filters.status') }}</span>
            <n-select v-model:value="draftReadStatus" :options="readStatusOptions" />
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
      @update:show="show => !show && closeNotificationDetail()"
    >
      <n-drawer-content
        v-if="activeNotification"
        :title="activeNotification.title"
        class="notification-detail-drawer"
      >
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
            <n-tag
              size="small"
              round
              :type="activeNotification.isRead === 1 ? 'default' : 'success'"
            >
              {{
                activeNotification.isRead === 1
                  ? t('notifications.read')
                  : t('notifications.unread')
              }}
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

          <div
            v-if="isMobile && activeNotification.isRead !== 1"
            class="notification-detail__footer"
          >
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
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--text-color);
  --notif-panel-bg: rgba(255, 255, 255, 0.9);
  --notif-panel-strong: #ffffff;
  --notif-panel-border: rgba(226, 232, 240, 0.95);
  --notif-panel-shadow: 0 20px 48px -24px rgba(15, 23, 42, 0.08);
  --notif-title-color: #0f172a;
  --notif-muted: #475569;
  --notif-soft: rgba(30, 107, 82, 0.08);
  --notif-card-bg: #ffffff;
  --notif-card-border: rgba(226, 232, 240, 0.95);
  --notif-card-shadow: 0 16px 36px -18px rgba(15, 23, 42, 0.08);
  --notif-item-bg: rgba(248, 250, 252, 0.85);
  --notif-item-border: rgba(226, 232, 240, 0.95);
}

:global(html[data-theme='dark'] .notifications-page) {
  --notif-panel-bg: rgba(15, 23, 42, 0.72);
  --notif-panel-strong: rgba(30, 41, 59, 0.76);
  --notif-panel-border: rgba(148, 163, 184, 0.16);
  --notif-panel-shadow: 0 32px 56px -40px rgba(2, 6, 23, 0.72);
  --notif-title-color: #f8fafc;
  --notif-muted: #94a3b8;
  --notif-soft: rgba(30, 107, 82, 0.15);
  --notif-card-bg: rgba(15, 23, 42, 0.72);
  --notif-card-border: rgba(148, 163, 184, 0.16);
  --notif-card-shadow: 0 24px 48px -24px rgba(2, 6, 23, 0.7);
  --notif-item-bg: rgba(30, 41, 59, 0.55);
  --notif-item-border: rgba(148, 163, 184, 0.14);
}

/* ==========================================================================
   Hero 主舱
   ========================================================================== */
.notifications-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 1fr);
  gap: 20px;
  align-items: stretch;
}

.notifications-hero__copy,
.bento-stat-card {
  border: 1px solid var(--notif-panel-border);
  background: var(--card-bg);
}

.notifications-hero__copy {
  padding: 28px 30px;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}

.notifications-hero__copy::after {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.hero-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.notifications-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--notif-soft);
  /* R1：品牌深绿改为随主题切换的 emerald 令牌 */
  color: var(--tone-emerald);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid rgba(30, 107, 82, 0.18);
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: inherit;
  opacity: 0.6;
  animation: pulse-ring 2s infinite ease-out;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.hero-status-pill.is-emerald {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.hero-status-pill.is-emerald .status-dot {
  background: #10b981;
}

.hero-status-pill.is-amber {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.22);
}

.hero-status-pill.is-amber .status-dot {
  background: #f59e0b;
}

.hero-title-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.hero-mark {
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-emerald);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.hero-title-copy h1 {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 36px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--notif-title-color);
}

.hero-title-copy p {
  margin: 10px 0 0;
  max-width: 680px;
  line-height: 1.65;
  color: var(--notif-muted);
  font-size: 14px;
}

/* 态势条与黄金行动跳板 */
.hero-mastery-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(30, 107, 82, 0.2);
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.hero-mastery-strip.is-emerald {
  border-color: rgba(16, 185, 129, 0.24);
  background: var(--card-bg);
}

.hero-mastery-strip.is-amber {
  border-color: rgba(245, 158, 11, 0.24);
  background: var(--card-bg);
}

.mastery-copy {
  display: grid;
  gap: 4px;
}

.mastery-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--notif-title-color);
}

.hero-mastery-strip.is-emerald .mastery-icon {
  color: var(--tone-emerald);
}
.hero-mastery-strip.is-amber .mastery-icon {
  color: var(--tone-amber);
}

.mastery-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--notif-muted);
}

.hero-action-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hero-cta-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.22s ease;
}

.hero-cta-btn.is-primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.hero-cta-btn.is-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.hero-cta-btn.is-primary:disabled {
  /* R8：禁用态最低 0.75，保证按钮文字仍达 4.5:1 */
  opacity: 0.75;
  cursor: wait;
}

.hero-cta-btn.is-secondary {
  color: var(--notif-title-color);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--notif-panel-border);
}

:global(html[data-theme='dark'] .hero-cta-btn.is-secondary) {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.2);
}

.hero-cta-btn.is-secondary:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.4);
}

.hero-cta-btn.is-secondary:disabled {
  /* 不用 opacity 削弱文字：0.75 时只剩 3.6:1。
     改成显式次要色，并保留可读性以说明为何不可点。 */
  opacity: 1;
  color: var(--secondary-text);
  background: var(--surface-muted);
  border-color: var(--card-border);
  cursor: not-allowed;
}

/* ==========================================================================
   右侧 3 大 Bento 独立晶体卡片
   ========================================================================== */
.notifications-hero__stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.bento-stat-card {
  padding: 18px 22px;
  border-radius: var(--radius-lg);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.bento-stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.3);
}

.bento-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bento-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.bento-stat-card.tone-cyan .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(43, 122, 96, 0.12);
  border: 1px solid rgba(43, 122, 96, 0.25);
}

.bento-stat-card.tone-emerald .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.bento-stat-card.tone-rose .bento-icon-box {
  /* R5：亮红 accent 压同色低透明度底对比度不足，改用 pink 令牌 */
  color: var(--tone-pink);
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
}

.bento-stat-card.tone-indigo .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.bento-metric {
  display: grid;
  gap: 3px;
}

.bento-label {
  font-size: 12px;
  color: var(--notif-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.bento-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--notif-title-color);
  letter-spacing: -0.02em;
}

.bento-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.bento-stat-card.tone-cyan .bento-badge {
  color: var(--tone-cyan);
  background: rgba(43, 122, 96, 0.12);
  border: 1px solid rgba(43, 122, 96, 0.2);
}

.bento-stat-card.tone-emerald .bento-badge {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.bento-stat-card.tone-rose .bento-badge {
  color: var(--tone-pink);
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.bento-stat-card.tone-indigo .bento-badge {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.2);
}

.bento-caption {
  font-size: 12px;
  line-height: 1.45;
  color: var(--notif-muted);
  text-align: right;
  max-width: 140px;
}

/* ==========================================================================
   筛选控制台 (Toolbar)
   ========================================================================== */
.notifications-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  background: var(--notif-item-bg);
  border: 1px solid var(--notif-item-border);
}

.notifications-toolbar__filters {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.toolbar-pills-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-pill {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 1px solid var(--notif-panel-border);
  background: var(--notif-panel-strong);
  color: var(--notif-muted);
  transition: all 0.2s ease;
}

.filter-pill:hover {
  transform: translateY(-1px);
  color: var(--notif-title-color);
  border-color: rgba(30, 107, 82, 0.3);
}

.filter-pill.is-active {
  color: var(--brand-ink);
  background: var(--brand);
  border-color: transparent;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}

.pill-dot--all {
  background: #1e6b52;
}
.pill-dot--system {
  background: #5fa88b;
}
.pill-dot--announcement {
  background: #2b7a60;
}
.pill-dot--update {
  background: #10b981;
}
.pill-dot--warning {
  background: #ef4444;
}

.filter-pill.is-active .pill-dot {
  background: #ffffff;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--notif-panel-border);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.clear-filter-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(148, 163, 184, 0.1);
  color: var(--notif-muted);
  transition: all 0.2s ease;
}

.clear-filter-btn:hover {
  color: var(--notif-title-color);
  background: rgba(148, 163, 184, 0.2);
}

.refresh-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--notif-panel-border);
  background: var(--notif-panel-strong);
  color: var(--notif-title-color);
  transition: all 0.2s ease;
}

.refresh-icon-btn:hover:not(:disabled) {
  transform: rotate(45deg);
  border-color: var(--brand);
  color: var(--tone-emerald);
}

.refresh-icon-btn:disabled {
  /* R8：禁用态最低 0.75 */
  opacity: 0.75;
  cursor: wait;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ==========================================================================
   零通知启航舱 (Orbit Deck) 空状态
   ========================================================================== */
.notifications-empty.orbit-deck {
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: var(--radius-lg);
  background: var(--notif-item-bg);
  border: 1px dashed var(--notif-panel-border);
  margin-top: 10px;
}

.orbit-badge-hub {
  position: relative;
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.orbit-ring {
  position: absolute;
  border-radius: 999px;
  border: 1px dashed rgba(30, 107, 82, 0.3);
}

.orbit-ring--outer {
  inset: -14px;
  animation: rotate-slow 24s linear infinite;
}

.orbit-ring--inner {
  inset: -4px;
  border-style: solid;
  border-color: rgba(30, 107, 82, 0.18);
}

.orbit-icon-core {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-emerald);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.28);
  animation: float-gentle 4s ease-in-out infinite;
}

.orbit-badge-hub.is-search .orbit-icon-core {
  color: var(--tone-emerald);
  background: var(--card-bg);
  border-color: rgba(43, 122, 96, 0.28);
}

.orbit-badge-hub.is-search .orbit-ring {
  border-color: rgba(43, 122, 96, 0.28);
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.orbit-copy {
  max-width: 480px;
  margin-bottom: 24px;
}

.orbit-title {
  margin: 0 0 10px;
  font-size: 20px;
  font-weight: 800;
  color: var(--notif-title-color);
  letter-spacing: -0.01em;
}

.orbit-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--notif-muted);
}

.orbit-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.orbit-btn {
  height: 44px;
  padding: 0 22px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.22s ease;
}

.orbit-btn--primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.orbit-btn--primary:hover {
  transform: translateY(-2px);
}

.orbit-btn--secondary {
  color: var(--notif-title-color);
  background: var(--notif-card-bg);
  border: 1px solid var(--notif-card-border);
}

.orbit-btn--secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.4);
}

.orbit-btn--ghost {
  color: var(--notif-muted);
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid transparent;
}

.orbit-btn--ghost:hover:not(:disabled) {
  color: var(--notif-title-color);
  background: rgba(148, 163, 184, 0.2);
}

.orbit-btn--ghost:disabled {
  /* R8：禁用态最低 0.75 */
  opacity: 0.75;
  cursor: wait;
}

/* ==========================================================================
   通知卡片 (Notification Card)
   ========================================================================== */
.notifications-list {
  display: grid;
  gap: 16px;
  margin-top: 10px;
}

.notification-card {
  border-radius: var(--radius-lg);
  background: var(--notif-card-bg) !important;
  border: 1px solid var(--notif-card-border) !important;
  cursor: pointer;
  transition: all 0.25s ease;
}

.notification-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.3) !important;
}

.notification-card.is-unread {
  border-color: rgba(30, 107, 82, 0.35) !important;
}

.notification-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.notification-card__headline {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
}

.notification-type-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid currentColor;
}

.notification-card__main-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-size: 18px;
  font-weight: 700;
  color: var(--notif-title-color);
  overflow-wrap: anywhere;
}

.notification-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1e6b52;
  flex-shrink: 0;
  box-shadow: 0 0 0 5px rgba(30, 107, 82, 0.2);
}

.notification-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.notification-card__content {
  margin: 14px 0 0;
  color: var(--notif-muted);
  line-height: 1.75;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
}

.notification-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--notif-panel-border);
  font-size: 12px;
  color: var(--notif-muted);
}

.notifications-pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0 8px;
}

/* ==========================================================================
   详情抽屉 (Drawer)
   ========================================================================== */
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
  border-radius: var(--radius-lg);
  background: var(--notif-item-bg);
  border: 1px solid var(--notif-item-border);
}

.notification-detail__meta div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-detail__meta span {
  font-size: 12px;
  color: var(--notif-muted);
}

.notification-detail__meta strong {
  font-size: 14px;
  color: var(--notif-title-color);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.notification-detail__body {
  padding: 22px;
  border-radius: var(--radius-lg);
  background: var(--notif-card-bg);
  border: 1px solid var(--notif-card-border);
  color: var(--notif-title-color);
  line-height: 1.85;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-size: 15px;
}

.notification-detail__footer {
  position: sticky;
  bottom: 0;
  padding-top: 8px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background: var(--card-bg);
}

/* ==========================================================================
   响应式断点
   ========================================================================== */
@media (max-width: 1200px) {
  .notifications-hero {
    grid-template-columns: 1fr;
  }

  .notifications-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bento-stat-card {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 10px;
  }

  .bento-top {
    flex-direction: row;
    justify-content: center;
  }

  .bento-caption {
    text-align: center;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 16px 12px 32px;
  }

  .notifications-hero__copy {
    padding: 20px 18px;
    border-radius: var(--radius-lg);
  }

  .hero-mastery-strip {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .hero-action-group {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta-btn {
    width: 100%;
    justify-content: center;
  }

  .notifications-hero__stats {
    grid-template-columns: 1fr;
  }

  .bento-stat-card {
    grid-template-columns: auto 1fr auto;
    text-align: left;
  }

  .bento-top {
    flex-direction: column;
  }

  .bento-caption {
    text-align: right;
    max-width: 120px;
  }

  .notifications-toolbar {
    padding: 14px;
  }

  .notifications-toolbar__filters {
    width: 100%;
  }

  .toolbar-divider {
    display: none;
  }

  .toolbar-actions {
    width: 100%;
    justify-content: space-between;
  }

  .notification-card__header {
    flex-direction: column;
  }

  .notification-card__header :deep(.n-button) {
    width: 100%;
  }

  .orbit-badge-hub {
    width: 80px;
    height: 80px;
  }

  .orbit-icon-core {
    width: 60px;
    height: 60px;
  }

  .orbit-actions {
    flex-direction: column;
    width: 100%;
  }

  .orbit-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-mark {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
  }

  .hero-title-copy h1 {
    font-size: 22px;
  }

  .bento-stat-card {
    grid-template-columns: auto 1fr;
    gap: 12px;
  }

  .bento-caption {
    grid-column: 1 / -1;
    text-align: left;
    max-width: none;
  }

  .notification-type-avatar {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
  }
}
</style>
