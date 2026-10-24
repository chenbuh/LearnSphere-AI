<script setup>
import { NButton, NInput } from 'naive-ui'
import { Bell, Crown, FileText, Search, SlidersHorizontal, Trash2 } from 'lucide-vue-next'

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
  },
  total: {
    type: Number,
    default: 0
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
  <Teleport to="#page-actions" defer>
    <n-button class="export-btn" secondary :loading="exportLoading" @click="emit('export')">
      <template #icon><FileText :size="15" /></template>
      导出 Excel 报表
    </n-button>
  </Teleport>

  <header class="ls-panel__head">
    <div class="users-toolbar__left">
      <h2 class="ls-panel__title">用户管理列表</h2>
      <span class="users-toolbar__badge">共 {{ total }} 位学员</span>
    </div>
    <div class="ls-panel__tools">
      <span class="users-selected" :class="{ 'has-selected': selectedCount > 0 }">
        {{ selectedCount > 0 ? `已选中 ${selectedCount} 个账号` : '勾选学员后可执行批量操作' }}
      </span>
      <n-button
        size="small"
        :type="selectedCount > 0 ? 'warning' : 'default'"
        secondary
        :disabled="selectedCount === 0"
        @click="emit('batch-vip')"
      >
        <template #icon><Crown :size="14" /></template>
        批量 VIP
      </n-button>
      <n-button
        size="small"
        :type="selectedCount > 0 ? 'primary' : 'default'"
        secondary
        :disabled="selectedCount === 0"
        @click="emit('batch-notify')"
      >
        <template #icon><Bell :size="14" /></template>
        批量通知
      </n-button>
    </div>
  </header>

  <div class="ls-filter users-filter-row">
    <div class="users-search-wrap">
      <n-input
        :value="keyword"
        placeholder="搜索用户名、邮箱、昵称，回车快速查找..."
        clearable
        style="width: 320px"
        @update:value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <Search :size="15" class="search-prefix-icon" />
        </template>
      </n-input>
      <n-button type="primary" @click="emit('search')"> 查询 </n-button>
    </div>

    <div class="users-filter-actions">
      <n-button secondary @click="emit('open-filter')">
        <template #icon><SlidersHorizontal :size="14" /></template>
        高级筛选
        <span v-if="activeFilterCount > 0" class="users-filter-count">{{ activeFilterCount }}</span>
      </n-button>
      <n-button v-if="activeFilterCount > 0" quaternary type="error" @click="emit('clear-filter')">
        清除筛选
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.users-toolbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.users-toolbar__badge {
  font-size: 11.5px;
  font-weight: 550;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.users-selected {
  color: #94a3b8;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

.users-selected.has-selected {
  color: #4f46e5;
  font-weight: 600;
}

.users-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.users-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-prefix-icon {
  color: #94a3b8;
}

.users-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.users-filter-count {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 9px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.export-btn {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.export-btn:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

@media (max-width: 768px) {
  .users-filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  .users-search-wrap :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
