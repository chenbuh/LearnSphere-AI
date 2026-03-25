import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notification'

const createPagination = (page = 1, size = 10, total = 0, pages = 0) => ({
  page,
  size,
  total,
  pages
})

const createQuery = () => ({
  type: 'all',
  readStatus: 'all'
})

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const unreadLoading = ref(false)
  const pagination = ref(createPagination())
  const query = ref(createQuery())
  const initialized = ref(false)

  const hasUnread = computed(() => unreadCount.value > 0)

  const fetchNotifications = async (options = {}) => {
    const {
      page = pagination.value.page || 1,
      size = pagination.value.size || 10,
      type = query.value.type,
      readStatus = query.value.readStatus,
      silent = false
    } = options

    if (!silent) {
      loading.value = true
    }

    try {
      const requestParams = {
        page,
        size
      }

      if (type && type !== 'all') {
        requestParams.type = type
      }

      if (readStatus !== 'all' && readStatus !== null && readStatus !== undefined && readStatus !== '') {
        requestParams.readStatus = Number(readStatus)
      }

      const res = await notificationApi.getNotifications(requestParams)
      const pageData = res.data || {}
      notifications.value = Array.isArray(pageData.records) ? pageData.records : []
      pagination.value = createPagination(
        Number(pageData.current) || page,
        Number(pageData.size) || size,
        Number(pageData.total) || 0,
        Number(pageData.pages) || 0
      )
      query.value = {
        type: type || 'all',
        readStatus: readStatus === undefined || readStatus === null || readStatus === '' ? 'all' : String(readStatus)
      }
      initialized.value = true
      return notifications.value
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  const fetchUnreadCount = async (options = {}) => {
    const { silent = true } = options

    if (!silent) {
      unreadLoading.value = true
    }

    try {
      const res = await notificationApi.getUnreadCount()
      unreadCount.value = Number(res.data || 0)
      return unreadCount.value
    } finally {
      if (!silent) {
        unreadLoading.value = false
      }
    }
  }

  const refreshNotifications = async (options = {}) => {
    const {
      page = pagination.value.page || 1,
      size = pagination.value.size || 10,
      type = query.value.type,
      readStatus = query.value.readStatus,
      silent = false
    } = options

    await Promise.all([
      fetchNotifications({ page, size, type, readStatus, silent }),
      fetchUnreadCount({ silent: true })
    ])
  }

  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      return
    }

    const target = notifications.value.find(item => item.id === notificationId)
    if (target?.isRead === 1) {
      return
    }

    await notificationApi.markAsRead(notificationId)

    if (target) {
      target.isRead = 1
      target.readTime = target.readTime || new Date().toISOString()
    }

    if (unreadCount.value > 0) {
      unreadCount.value -= 1
    }

    if (query.value.readStatus === '0') {
      await fetchNotifications({
        page: pagination.value.page || 1,
        size: pagination.value.size || 10,
        type: query.value.type,
        readStatus: query.value.readStatus,
        silent: true
      })
    }
  }

  const markAllAsRead = async () => {
    const res = await notificationApi.markAllAsRead()
    const affected = Number(res.data || 0)
    unreadCount.value = 0

    if (query.value.readStatus === '0') {
      await fetchNotifications({
        page: 1,
        size: pagination.value.size || 10,
        type: query.value.type,
        readStatus: query.value.readStatus,
        silent: true
      })
      return affected
    }

    notifications.value = notifications.value.map(item => ({
      ...item,
      isRead: 1,
      readTime: item.readTime || new Date().toISOString()
    }))

    return affected
  }

  const ensureUnreadCount = async () => {
    if (initialized.value && unreadCount.value >= 0) {
      return unreadCount.value
    }

    return fetchUnreadCount({ silent: true })
  }

  return {
    notifications,
    unreadCount,
    loading,
    unreadLoading,
    pagination,
    query,
    initialized,
    hasUnread,
    fetchNotifications,
    fetchUnreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    ensureUnreadCount
  }
})
