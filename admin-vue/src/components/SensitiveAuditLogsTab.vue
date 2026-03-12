<script setup>
import { AlertTriangle, RefreshCw, Search, Trash } from 'lucide-vue-next'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NPagination,
  NPopconfirm,
  NSpace,
  NTabPane
} from 'naive-ui'

defineProps({
  total: {
    type: Number,
    default: 0
  },
  checkedRowKeys: {
    type: Array,
    default: () => []
  },
  keyword: {
    type: String,
    default: ''
  },
  columns: {
    type: Array,
    default: () => []
  },
  list: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
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
  'update:keyword',
  'refresh',
  'batch-delete',
  'update:checked-row-keys',
  'update:page'
])

const handleSearchEnter = () => {
  emit('update:page', 1)
  emit('refresh')
}
</script>

<template>
  <n-tab-pane name="logs" tab="拦截审计日志">
    <div class="toolbar">
      <div class="summary">
        <AlertTriangle :size="16" class="summary-icon" />
        当前共有 {{ total }} 条违规预警记录
      </div>

      <n-space>
        <n-popconfirm v-if="checkedRowKeys.length > 0" @positive-click="emit('batch-delete')">
          <template #trigger>
            <n-button type="error" secondary>
              <template #icon>
                <n-icon :component="Trash" />
              </template>
              批量删除 ({{ checkedRowKeys.length }})
            </n-button>
          </template>
          确定要删除选中的 {{ checkedRowKeys.length }} 条记录吗？
        </n-popconfirm>

        <n-input
          :value="keyword"
          placeholder="搜索用户名/内容/敏感词"
          clearable
          style="width: 250px"
          @update:value="emit('update:keyword', $event)"
          @keyup.enter="handleSearchEnter"
        >
          <template #prefix>
            <n-icon :component="Search" />
          </template>
        </n-input>

        <n-button secondary @click="emit('refresh')">
          <template #icon>
            <n-icon :component="RefreshCw" />
          </template>
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="columns"
      :data="list"
      :loading="loading"
      :bordered="false"
      striped
      remote
      size="large"
      :row-key="(row) => row.id"
      :checked-row-keys="checkedRowKeys"
      @update:checked-row-keys="emit('update:checked-row-keys', $event)"
    />

    <div class="pagination-wrapper">
      <n-pagination
        :page="page"
        :item-count="total"
        :page-size="pageSize"
        @update:page="emit('update:page', $event)"
      />
    </div>
  </n-tab-pane>
</template>

<style scoped>
.toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: rgb(161, 161, 170);
}

.summary-icon {
  color: #f59e0b;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
