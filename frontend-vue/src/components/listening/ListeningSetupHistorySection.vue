<script setup>
import { NCard, NGrid, NGridItem, NIcon, NPagination, NTag } from 'naive-ui'
import { History } from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  historyTotal: {
    type: Number,
    default: 0
  },
  paginatedHistory: {
    type: Array,
    default: () => []
  },
  historyPage: {
    type: Number,
    default: 1
  },
  historyPageSize: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits(['load-material', 'update:history-page', 'update:history-page-size'])

const normalizedHistoryTitle = (item) => {
  if (item?.title && /[:]\d{2}[:]\d{2}/.test(item.title)) {
    return 'Listening Practice'
  }
  return item?.title
}
</script>

<template>
  <div v-if="props.historyTotal > 0" class="history-section mt-12">
    <div class="section-title">
      <n-icon :component="History" /> {{ props.translate('最近生成', 'Recent Materials') }}
    </div>
    <n-grid x-gap="20" y-gap="20" cols="1 600:2 900:3">
      <n-grid-item v-for="item in props.paginatedHistory" :key="item.id">
        <n-card class="history-card-item" :bordered="false" hoverable @click="emit('load-material', item)">
          <n-tag size="small" type="info" :bordered="false">{{ item.type?.toUpperCase?.() || 'LISTENING' }}</n-tag>
          <div class="history-title">{{ normalizedHistoryTitle(item) }}</div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <div class="pagination-wrapper" v-if="props.historyTotal > props.historyPageSize">
      <n-pagination
        :page="props.historyPage"
        :item-count="props.historyTotal"
        :page-size="props.historyPageSize"
        show-size-picker
        :page-sizes="[6, 12, 18]"
        @update:page="emit('update:history-page', $event)"
        @update:page-size="emit('update:history-page-size', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.history-section {
  margin-top: 48px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.history-card-item {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
  height: 100%;
}

.history-card-item:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  background: var(--accent-fill);
}

.history-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>