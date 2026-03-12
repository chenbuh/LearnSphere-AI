<script setup>
import { NCard } from 'naive-ui'
import AdminUsersToolbar from '@/components/AdminUsersToolbar.vue'

defineProps({
  keyword: {
    type: String,
    default: ''
  },
  activeFilterCount: {
    type: Number,
    default: 0
  },
  selectedCount: {
    type: Number,
    default: 0
  },
  exportLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:keyword',
  'search',
  'open-filter',
  'clear-filter',
  'batch-vip',
  'batch-notify',
  'export'
])
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>用户管理</h1>
        <p>管理平台注册用户及 VIP 权限</p>
      </div>
    </header>

    <n-card class="search-card mb-4" :bordered="false">
      <AdminUsersToolbar
        :keyword="keyword"
        :active-filter-count="activeFilterCount"
        :selected-count="selectedCount"
        :export-loading="exportLoading"
        @update:keyword="emit('update:keyword', $event)"
        @search="emit('search')"
        @open-filter="emit('open-filter')"
        @clear-filter="emit('clear-filter')"
        @batch-vip="emit('batch-vip')"
        @batch-notify="emit('batch-notify')"
        @export="emit('export')"
      />
    </n-card>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.search-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
}
</style>
