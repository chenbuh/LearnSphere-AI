<script setup>
import { NBadge, NButton, NInput } from 'naive-ui'
import { Crown, FileText, Search, SlidersHorizontal } from 'lucide-vue-next'

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
    <div class="query-zone">
      <n-input
        class="query-input"
        :value="keyword"
        placeholder="搜索用户名、邮箱、昵称"
        clearable
        @update:value="emit('update:keyword', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <Search :size="16" />
        </template>
      </n-input>

      <div class="query-actions">
        <n-button type="primary" @click="emit('search')">搜索用户</n-button>
        <n-button secondary @click="emit('open-filter')">
          <template #icon><SlidersHorizontal :size="16" /></template>
          高级筛选
        </n-button>
        <n-button v-if="activeFilterCount > 0" tertiary type="error" @click="emit('clear-filter')">
          清除筛选
        </n-button>
      </div>
    </div>

    <div class="action-zone">
      <div class="action-head">
        <span class="action-label">批量动作</span>
        <p class="action-note">
          {{ selectedCount > 0 ? `已选 ${selectedCount} 人，可直接执行批量操作。` : '先勾选目标账号，再执行批量操作。' }}
        </p>
      </div>

      <div class="action-grid">
        <n-badge :value="selectedCount" :show="selectedCount > 0">
          <n-button
            class="action-button"
            secondary
            type="warning"
            :disabled="selectedCount === 0"
            @click="emit('batch-vip')"
          >
            <template #icon><Crown :size="16" /></template>
            批量 VIP
          </n-button>
        </n-badge>

        <n-badge :value="selectedCount" :show="selectedCount > 0">
          <n-button
            class="action-button"
            secondary
            type="info"
            :disabled="selectedCount === 0"
            @click="emit('batch-notify')"
          >
            批量通知
          </n-button>
        </n-badge>
      </div>

      <n-button class="action-button action-button--full" secondary type="primary" :loading="exportLoading" @click="emit('export')">
        <template #icon><FileText :size="16" /></template>
        导出 Excel
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.toolbar-layout {
  display: grid;
  gap: 18px;
}

.query-zone,
.action-zone {
  display: grid;
  gap: 12px;
}

.query-zone {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.query-input {
  min-width: 0;
}

.query-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-head {
  display: grid;
  gap: 6px;
}

.action-label {
  color: #68809c;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.action-note {
  margin: 0;
  color: #8ea1ba;
  font-size: 0.82rem;
  line-height: 1.6;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.action-grid :deep(.n-badge) {
  display: block;
}

.action-button {
  width: 100%;
  min-height: 40px;
  justify-content: center;
}

.action-button--full {
  margin-top: 2px;
}

@media (max-width: 768px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
