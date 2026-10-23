<template>
  <div class="admin-page admin-page--wide">
    <AdminUserLogsOverview
      :stats="stats"
      :unique-ips="uniqueIps"
      :active-users="activeUsers"
      :mobile-rate="mobileRate"
    />

    <AdminUserLogsChartsCard ref="chartsCardRef" />

    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">日志列表 <span class="ls-panel__count">共 {{ pagination.itemCount || 0 }} 条</span></h2>
      </header>

      <AdminUserLogsFilterBar
        :filters="filters"
        :module-options="userLogModuleOptions"
        :action-options="userLogActionOptions"
        :status-options="userLogStatusOptions"
        :loading="loading"
        @search="loadLogs"
        @refresh="refresh"
        @clear-all="clearAll"
      />

      <AdminUserLogsTableCard
        :logs="logs"
        :loading="loading"
        :pagination="pagination"
        @view-detail="viewDetail"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </section>

    <AdminUserLogDetailModal
      v-model:show="showDetail"
      :log="currentLog"
    />
  </div>
</template>

<script setup>
import AdminUserLogDetailModal from '@/components/AdminUserLogDetailModal.vue'
import AdminUserLogsChartsCard from '@/components/AdminUserLogsChartsCard.vue'
import AdminUserLogsFilterBar from '@/components/AdminUserLogsFilterBar.vue'
import AdminUserLogsOverview from '@/components/AdminUserLogsOverview.vue'
import AdminUserLogsTableCard from '@/components/AdminUserLogsTableCard.vue'
import {
  userLogActionOptions,
  userLogModuleOptions,
  userLogStatusOptions
} from '@/utils/adminUserLogsConfig'
import { useUserLogs } from '@/composables/useUserLogs'

const {
  activeUsers,
  chartsCardRef,
  clearAll,
  currentLog,
  filters,
  handlePageChange,
  handlePageSizeChange,
  loadLogs,
  loading,
  logs,
  mobileRate,
  pagination,
  refresh,
  showDetail,
  stats,
  uniqueIps,
  viewDetail
} = useUserLogs()
</script>
