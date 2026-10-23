<script setup>
import { NButton, NDataTable, NIcon, NInput } from 'naive-ui'
import { Search } from 'lucide-vue-next'

defineProps({
  columns: {
    type: Array,
    required: true
  },
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  searchPattern: {
    type: String,
    default: '*'
  }
})

const emit = defineEmits(['update:search-pattern', 'search'])

// Built-in pagination keeps column sorting across the full result set
const pagination = {
  pageSize: 15,
  prefix: ({ startIndex, endIndex, itemCount }) =>
    itemCount ? `显示第 ${startIndex + 1} - ${endIndex + 1} 条，共 ${itemCount} 个键` : '第 0 - 0 条，共 0 条'
}
</script>

<template>
  <section class="ls-panel redis-table">
    <header class="ls-panel__head">
      <div class="redis-head-left">
        <h2 class="ls-panel__title">缓存键空间列表</h2>
        <span class="redis-count-badge">当前已扫描 {{ data.length }} 个 Key</span>
      </div>
    </header>

    <div class="ls-filter redis-filter-bar">
      <div class="redis-search-wrap">
        <n-input
          :value="searchPattern"
          placeholder="输入 Pattern 表达式，支持通配符 * (例如 ai:cache:*)"
          clearable
          style="width: 380px"
          @update:value="emit('update:search-pattern', $event)"
          @keyup.enter="emit('search')"
        >
          <template #prefix>
            <Search :size="15" class="search-icon" />
          </template>
        </n-input>
        <n-button type="primary" :loading="loading" @click="emit('search')">
          精确检索
        </n-button>
      </div>
      <span class="redis-filter-tip">默认通配符 * 检索全部键，可输入前缀快速定位</span>
    </div>

    <n-data-table
      :columns="columns"
      :data="data"
      :loading="loading"
      :bordered="false"
      :pagination="pagination"
      max-height="650"
    />
  </section>
</template>

<style scoped>
.redis-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.redis-count-badge {
  font-size: 11.5px;
  font-weight: 550;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.redis-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.redis-search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  color: #94a3b8;
}

.redis-filter-tip {
  color: #94a3b8;
  font-size: 12px;
}

.redis-table :deep(.n-data-table__pagination) {
  margin: 0;
  padding: 14px 22px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}

.redis-table :deep(.n-data-table__pagination .n-pagination) {
  flex: 1;
}

.redis-table :deep(.n-pagination-prefix) {
  margin-right: auto;
  color: #64748b;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .redis-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .redis-search-wrap :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
