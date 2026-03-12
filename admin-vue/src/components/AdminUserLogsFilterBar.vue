<script setup>
import { NButton, NCard, NIcon, NInput, NPopconfirm, NSelect, NSpace } from 'naive-ui'
import { RotateCcw, Search, Trash2 } from 'lucide-vue-next'

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
  }
})

const emit = defineEmits(['search', 'refresh', 'clear-all'])
</script>

<template>
  <n-card :bordered="false" class="mb-4">
    <n-space justify="space-between">
      <n-space>
        <n-input v-model:value="filters.username" placeholder="搜索用户名" clearable style="width: 180px;" @keyup.enter="emit('search')" />
        <n-select
          v-model:value="filters.module"
          placeholder="选择模块"
          clearable
          style="width: 150px;"
          :options="moduleOptions"
          @update:value="emit('search')"
        />
        <n-select
          v-model:value="filters.action"
          placeholder="选择操作"
          clearable
          style="width: 150px;"
          :options="actionOptions"
          @update:value="emit('search')"
        />
        <n-input v-model:value="filters.ip" placeholder="搜索IP" clearable style="width: 150px;" @keyup.enter="emit('search')" />
        <n-select
          v-model:value="filters.status"
          placeholder="状态"
          clearable
          style="width: 120px;"
          :options="statusOptions"
          @update:value="emit('search')"
        />
        <n-button type="primary" @click="emit('search')">
          <template #icon>
            <n-icon><Search /></n-icon>
          </template>
          查询
        </n-button>
      </n-space>
      <n-space>
        <n-button @click="emit('refresh')">
          <template #icon>
            <n-icon><RotateCcw /></n-icon>
          </template>
          刷新
        </n-button>
        <n-popconfirm @positive-click="emit('clear-all')">
          <template #trigger>
            <n-button type="error" ghost>
              <template #icon>
                <n-icon><Trash2 /></n-icon>
              </template>
              清空日志
            </n-button>
          </template>
          确定要清空所有日志吗？此操作不可恢复！
        </n-popconfirm>
      </n-space>
    </n-space>
  </n-card>
</template>
