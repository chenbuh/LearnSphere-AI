import request from '@/utils/request'

export const notificationApi = {
  getNotifications(params = {}) {
    return request.get('/notifications', { params })
  },

  getUnreadCount() {
    return request.get('/notifications/unread-count')
  },

  markAsRead(id) {
    return request.put(`/notifications/${id}/read`)
  },

  markAllAsRead() {
    return request.put('/notifications/read-all')
  }
}
