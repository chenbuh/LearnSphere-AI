<script setup>
import AdminUsersHeader from '@/components/AdminUsersHeader.vue'
import AdminUsersModalHost from '@/components/AdminUsersModalHost.vue'
import AdminUsersTableCard from '@/components/AdminUsersTableCard.vue'
import AdminUsersToolbar from '@/components/AdminUsersToolbar.vue'
import { useAdminUsers } from '@/composables/useAdminUsers'

const { headerBindings, headerEvents, modalBindings, modalEvents, tableBindings, tableEvents } =
  useAdminUsers()
</script>

<template>
  <div class="users-page admin-page admin-page--wide">
    <AdminUsersHeader v-bind="headerBindings" />

    <section class="ls-panel">
      <AdminUsersToolbar
        :keyword="headerBindings.keyword"
        :active-filter-count="headerBindings.activeFilterCount"
        :selected-count="headerBindings.selectedCount"
        :export-loading="headerBindings.exportLoading"
        :total="headerBindings.total"
        v-on="headerEvents"
      />
      <AdminUsersTableCard v-bind="tableBindings" v-on="tableEvents" />
    </section>

    <AdminUsersModalHost v-bind="modalBindings" v-on="modalEvents" />
  </div>
</template>
