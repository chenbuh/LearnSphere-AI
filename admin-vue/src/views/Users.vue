<script setup>
import AdminUsersHeader from '@/components/AdminUsersHeader.vue'
import AdminUsersModalHost from '@/components/AdminUsersModalHost.vue'
import AdminUsersTableCard from '@/components/AdminUsersTableCard.vue'
import { useAdminUsers } from '@/composables/useAdminUsers'

const {
  headerBindings,
  headerEvents,
  modalBindings,
  modalEvents,
  tableBindings,
  tableEvents
} = useAdminUsers()
</script>

<template>
  <div class="users-page admin-page admin-page--wide">
    <AdminUsersHeader v-bind="headerBindings" v-on="headerEvents" />
    <AdminUsersTableCard v-bind="tableBindings" v-on="tableEvents" />
    <AdminUsersModalHost v-bind="modalBindings" v-on="modalEvents" />
  </div>
</template>

<style scoped>
.users-page {
  gap: 20px;
}
</style>
