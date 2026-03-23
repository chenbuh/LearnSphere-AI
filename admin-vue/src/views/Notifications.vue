<script setup>
import AdminNotificationsHeader from '@/components/AdminNotificationsHeader.vue'
import AdminNotificationsSendModal from '@/components/AdminNotificationsSendModal.vue'
import AdminNotificationsTableCard from '@/components/AdminNotificationsTableCard.vue'
import { useAdminNotifications } from '@/composables/useAdminNotifications'

const {
  columns,
  fetchNotifications,
  formModel,
  handlePageChange,
  handleSend,
  loading,
  notifications,
  openSendModal,
  page,
  pageSize,
  showSendModal,
  total,
  typeOptions,
  updateShowSendModal
} = useAdminNotifications()
</script>

<template>
  <div class="admin-page admin-page--content">
    <AdminNotificationsHeader @refresh="fetchNotifications" @send="openSendModal" />

    <AdminNotificationsTableCard
      :columns="columns"
      :data="notifications"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total="total"
      @update:page="handlePageChange"
    />

    <AdminNotificationsSendModal
      :show="showSendModal"
      :loading="loading"
      :form-model="formModel"
      :type-options="typeOptions"
      @update:show="updateShowSendModal"
      @send="handleSend"
    />
  </div>
</template>
