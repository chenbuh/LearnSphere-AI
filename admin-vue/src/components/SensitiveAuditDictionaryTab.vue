<script setup>
import { DatabaseBackup, Plus, RefreshCw, Search } from 'lucide-vue-next'
import {
  NButton,
  NDataTable,
  NIcon,
  NInput,
  NPagination,
  NSpace,
  NTabPane
} from 'naive-ui'

defineProps({
  wordKeyword: {
    type: String,
    default: ''
  },
  wordColumns: {
    type: Array,
    default: () => []
  },
  wordList: {
    type: Array,
    default: () => []
  },
  wordLoading: {
    type: Boolean,
    default: false
  },
  wordPage: {
    type: Number,
    default: 1
  },
  wordTotal: {
    type: Number,
    default: 0
  },
  wordPageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits([
  'update:word-keyword',
  'show-add-modal',
  'reload-words',
  'refresh-words',
  'update:word-page'
])

const handleSearchEnter = () => {
  emit('update:word-page', 1)
  emit('refresh-words')
}
</script>

<template>
  <n-tab-pane name="dictionary" tab="敏感词库管理">
    <div class="toolbar">
      <div class="actions">
        <n-button type="primary" @click="emit('show-add-modal')">
          <template #icon>
            <n-icon :component="Plus" />
          </template>
          添加敏感词
        </n-button>

        <n-button type="warning" @click="emit('reload-words')">
          <template #icon>
            <n-icon :component="DatabaseBackup" />
          </template>
          重载内存词库
        </n-button>
      </div>

      <n-space>
        <n-input
          :value="wordKeyword"
          placeholder="搜索敏感词..."
          clearable
          style="width: 250px"
          @update:value="emit('update:word-keyword', $event)"
          @keyup.enter="handleSearchEnter"
        >
          <template #prefix>
            <n-icon :component="Search" />
          </template>
        </n-input>

        <n-button secondary @click="emit('refresh-words')">
          <template #icon>
            <n-icon :component="RefreshCw" />
          </template>
        </n-button>
      </n-space>
    </div>

    <n-data-table
      :columns="wordColumns"
      :data="wordList"
      :loading="wordLoading"
      :bordered="false"
      striped
      remote
      size="large"
      :row-key="(row) => row.id"
    />

    <div class="pagination-wrapper">
      <n-pagination
        :page="wordPage"
        :item-count="wordTotal"
        :page-size="wordPageSize"
        @update:page="emit('update:word-page', $event)"
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

.actions {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
