<script setup>
import { defineAsyncComponent } from 'vue'

const UserDetailModal = defineAsyncComponent(() => import('@/components/UserDetailModal.vue'))
const UserVipModal = defineAsyncComponent(() => import('@/components/UserVipModal.vue'))
const UserProfileEditModal = defineAsyncComponent(() => import('@/components/UserProfileEditModal.vue'))
const UserPasswordResetModal = defineAsyncComponent(() => import('@/components/UserPasswordResetModal.vue'))
const UserBatchVipModal = defineAsyncComponent(() => import('@/components/UserBatchVipModal.vue'))
const UserBatchNotifyModal = defineAsyncComponent(() => import('@/components/UserBatchNotifyModal.vue'))
const UserAdvancedFilterModal = defineAsyncComponent(() => import('@/components/UserAdvancedFilterModal.vue'))

defineProps({
  showVipModal: {
    type: Boolean,
    default: false
  },
  showDetailModal: {
    type: Boolean,
    default: false
  },
  showEditModal: {
    type: Boolean,
    default: false
  },
  showPasswordModal: {
    type: Boolean,
    default: false
  },
  showBatchVipModal: {
    type: Boolean,
    default: false
  },
  showBatchNotifyModal: {
    type: Boolean,
    default: false
  },
  showFilterModal: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: () => ({})
  },
  selectedUserIds: {
    type: Array,
    default: () => []
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'update:show-vip-modal',
  'update:show-detail-modal',
  'update:show-edit-modal',
  'update:show-password-modal',
  'update:show-batch-vip-modal',
  'update:show-batch-notify-modal',
  'update:show-filter-modal',
  'user-updated',
  'batch-vip-updated',
  'batch-notify-updated',
  'filter-applied'
])
</script>

<template>
  <UserVipModal
    v-if="showVipModal"
    :show="showVipModal"
    :user="currentUser"
    @update:show="emit('update:show-vip-modal', $event)"
    @updated="emit('user-updated')"
  />

  <UserDetailModal
    v-if="showDetailModal"
    :show="showDetailModal"
    :user="currentUser"
    @update:show="emit('update:show-detail-modal', $event)"
  />

  <UserProfileEditModal
    v-if="showEditModal"
    :show="showEditModal"
    :user="currentUser"
    @update:show="emit('update:show-edit-modal', $event)"
    @updated="emit('user-updated')"
  />

  <UserPasswordResetModal
    v-if="showPasswordModal"
    :show="showPasswordModal"
    :user="currentUser"
    @update:show="emit('update:show-password-modal', $event)"
  />

  <UserBatchVipModal
    v-if="showBatchVipModal"
    :show="showBatchVipModal"
    :selected-user-ids="selectedUserIds"
    @update:show="emit('update:show-batch-vip-modal', $event)"
    @updated="emit('batch-vip-updated')"
  />

  <UserBatchNotifyModal
    v-if="showBatchNotifyModal"
    :show="showBatchNotifyModal"
    :selected-user-ids="selectedUserIds"
    @update:show="emit('update:show-batch-notify-modal', $event)"
    @updated="emit('batch-notify-updated')"
  />

  <UserAdvancedFilterModal
    v-if="showFilterModal"
    :show="showFilterModal"
    :page="page"
    :page-size="pageSize"
    @update:show="emit('update:show-filter-modal', $event)"
    @applied="emit('filter-applied', $event)"
  />
</template>
