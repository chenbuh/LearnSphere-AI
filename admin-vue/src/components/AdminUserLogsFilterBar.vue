<script setup>
import { NButton, NIcon, NInput, NPopconfirm, NSelect } from 'naive-ui'
import { RefreshCw, Search, Trash2 } from 'lucide-vue-next'

defineProps({
  filters: {
    type: Object,
    default: () => ({
      username: '',
      module: null,
      action: null,
      ip: '',
      status: null
    })
  },
  moduleOptions: {
    type: Array,
    default: () => []
  },
  actionOptions: {
    type: Array,
    default: () => []
  },
  statusOptions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['search', 'refresh', 'clear-all'])
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="emit('refresh')">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
    <n-popconfirm @positive-click="emit('clear-all')">
      <template #trigger>
        <n-button secondary type="error">
          <template #icon>
            <n-icon :component="Trash2" />
          </template>
          清空日志
        </n-button>
      </template>
      确定要清空所有日志吗？此操作不可恢复！
    </n-popconfirm>
  </Teleport>

  <div class="ls-filter">
    <n-input
      v-model:value="filters.username"
      placeholder="搜索用户名"
      clearable
      style="width: 200px"
      @keyup.enter="emit('search')"
    >
      <template #prefix>
        <n-icon :component="Search" />
      </template>
    </n-input>
    <n-input
      v-model:value="filters.ip"
      placeholder="搜索 IP"
      clearable
      style="width: 160px"
      @keyup.enter="emit('search')"
    />
    <n-select
      v-model:value="filters.module"
      placeholder="模块"
      clearable
      style="width: 140px"
      :options="moduleOptions"
      @update:value="emit('search')"
    />
    <n-select
      v-model:value="filters.action"
      placeholder="操作"
      clearable
      style="width: 140px"
      :options="actionOptions"
      @update:value="emit('search')"
    />
    <n-select
      v-model:value="filters.status"
      placeholder="状态"
      clearable
      style="width: 120px"
      :options="statusOptions"
      @update:value="emit('search')"
    />
    <n-button @click="emit('search')">搜索</n-button>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .ls-filter :deep(.n-input),
  .ls-filter :deep(.n-base-selection) {
    width: 100% !important;
  }

  .ls-filter > .n-select,
  .ls-filter > .n-input {
    width: 100% !important;
  }
}
</style>
