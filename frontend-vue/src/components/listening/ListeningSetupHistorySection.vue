<script setup>
import { NIcon, NPagination, NTag } from 'naive-ui'
import { ArrowUpRight, History } from 'lucide-vue-next'

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
  <div v-if="props.historyTotal > 0" class="history-section">
    <div class="history-heading">
      <div>
        <p class="history-kicker">{{ props.translate('历史记录', 'History') }}</p>
        <div class="section-title">
          <n-icon :component="History" /> {{ props.translate('最近生成', 'Recent Materials') }}
        </div>
      </div>
      <span class="history-count">{{ props.historyTotal }} {{ props.translate('条', 'items') }}</span>
    </div>

    <div class="history-list">
      <button
        v-for="item in props.paginatedHistory"
        :key="item.id"
        type="button"
        class="history-row"
        @click="emit('load-material', item)"
      >
        <div class="history-meta">
          <n-tag size="small" type="info" :bordered="false">{{ item.type?.toUpperCase?.() || 'LISTENING' }}</n-tag>
        </div>
        <div class="history-copy">
          <div class="history-title">{{ normalizedHistoryTitle(item) }}</div>
        </div>
        <div class="history-action">
          <span>{{ props.translate('载入材料', 'Load') }}</span>
          <n-icon :component="ArrowUpRight" />
        </div>
      </button>
    </div>

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
  margin-top: 40px;
}

.history-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.history-kicker {
  margin: 0 0 8px;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-title {
  font-size: 1.18rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.history-count {
  color: var(--secondary-text);
  font-size: 0.84rem;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-row {
  display: grid;
  grid-template-columns: minmax(120px, 150px) minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: 100%;
  padding: 18px 0;
  border: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  cursor: pointer;
  background: transparent;
  color: inherit;
  text-align: left;
  transition: background 0.2s ease, color 0.2s ease;
}

.history-row:first-child {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.history-row:hover {
  background: rgba(15, 23, 42, 0.14);
}

.history-row:hover .history-action {
  color: #fb923c;
  transform: translateX(2px);
}

.history-copy {
  min-width: 0;
}

.history-title {
  font-size: 1rem;
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-color);
}

.history-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.2s ease, transform 0.2s ease;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

:global(html[data-theme='light'] .history-row),
:global(html[data-theme='light'] .history-row:first-child) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .history-row:hover) {
  background: rgba(248, 250, 252, 0.72);
}

@media (max-width: 900px) {
  .history-section {
    margin-top: 32px;
  }

  .history-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .section-title {
    font-size: 1.08rem;
  }

  .history-list {
    gap: 10px;
  }

  .history-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.24)),
      radial-gradient(circle at top right, rgba(14, 165, 233, 0.06), transparent 40%);
  }

  :global(html[data-theme='light'] .history-row) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
      radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 40%);
  }

  .history-row:first-child {
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .history-title {
    font-size: 0.98rem;
    line-height: 1.5;
    -webkit-line-clamp: 2;
  }

  .history-action {
    justify-content: space-between;
  }

  .pagination-wrapper {
    margin-top: 18px;
    justify-content: flex-start;
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .history-section {
    margin-top: 24px;
  }

  .history-heading {
    gap: 6px;
    margin-bottom: 14px;
  }

  .history-kicker {
    margin-bottom: 6px;
    font-size: 0.66rem;
  }

  .section-title {
    gap: 8px;
    font-size: 1rem;
    line-height: 1.35;
  }

  .history-count {
    font-size: 0.78rem;
  }

  .history-list {
    gap: 8px;
  }

  .history-row {
    padding: 12px;
    gap: 8px;
    border-radius: 14px;
  }

  .history-title {
    font-size: 0.92rem;
    -webkit-line-clamp: 3;
  }

  .history-action {
    width: 100%;
    justify-content: space-between;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
  }

  .pagination-wrapper {
    margin-top: 14px;
    padding-bottom: 4px;
  }

  .pagination-wrapper :deep(.n-pagination) {
    min-width: max-content;
  }
}

@media (max-width: 360px) {
  .history-row {
    padding: 10px;
  }

  .section-title {
    font-size: 0.94rem;
  }

  .history-title {
    font-size: 0.88rem;
  }

  .history-action {
    font-size: 0.68rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .history-section {
    margin-top: 22px;
  }

  .history-row {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}
</style>
