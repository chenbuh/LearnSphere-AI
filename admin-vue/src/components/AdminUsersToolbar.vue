<script setup>
import { NBadge, NButton, NInput, NSpace } from 'naive-ui'
import { Crown, FileText, Search } from 'lucide-vue-next'

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
  <div class="toolbar-layout">
    <n-space align="center" :size="12" wrap>
      <n-input
        :value="keyword"
        placeholder="搜索用户名、邮箱、昵称"
        style="width: 280px"
        clearable
        @update:value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <Search :size="16" />
        </template>
      </n-input>
      <n-button type="primary" @click="emit('search')">搜索</n-button>
      <n-button secondary @click="emit('open-filter')">高级筛选</n-button>
      <n-button v-if="activeFilterCount > 0" text type="error" @click="emit('clear-filter')">
        清除筛选 ({{ activeFilterCount }})
      </n-button>
    </n-space>

    <n-space align="center" :size="12" wrap>
      <n-badge :value="selectedCount" :show="selectedCount > 0">
        <n-button secondary type="warning" @click="emit('batch-vip')">
          <template #icon><Crown :size="16" /></template>
          批量赠送VIP
        </n-button>
      </n-badge>
      <n-badge :value="selectedCount" :show="selectedCount > 0">
        <n-button secondary type="info" @click="emit('batch-notify')">
          批量发送通知
        </n-button>
      </n-badge>
      <n-button secondary type="primary" :loading="exportLoading" @click="emit('export')">
        <template #icon><FileText :size="16" /></template>
        导出 Excel
      </n-button>
    </n-space>
  </div>
</template>

<style scoped>
.toolbar-layout {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>
