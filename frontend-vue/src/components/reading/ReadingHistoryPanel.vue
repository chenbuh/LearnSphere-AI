<template>
  <section v-if="items.length > 0" class="history-section">
    <div class="history-heading">
      <div>
        <p class="history-kicker">阅读记录</p>
        <div class="section-title">
          <n-icon :component="History" /> 最近生成任务
        </div>
        <p class="history-caption">可继续打开最近生成的阅读任务。</p>
      </div>
      <span class="history-count">{{ total }} 条</span>
    </div>

    <div class="history-list">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="history-row"
        @click="emit('select', item)"
      >
        <div class="history-meta">
          <n-tag size="small" :bordered="false" type="success">{{ item.source }}</n-tag>
          <span class="history-mode">{{ item.difficulty }}</span>
        </div>
        <div class="history-copy">
          <h4 class="history-title">{{ item.title }}</h4>
          <div class="history-preview">
            {{ item.questions?.length || 0 }} 题 · {{ calculateWordCount(item.content) }} 词
          </div>
        </div>
        <div class="history-action">
          <span>载入文章</span>
          <n-icon :component="ArrowUpRight" />
        </div>
      </button>
    </div>

    <div v-if="total > 0" class="pagination-wrapper">
      <n-pagination
        :page="page"
        :item-count="total"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[6, 12, 18]"
        @update:page="emit('update:page', $event)"
        @update:page-size="emit('update:pageSize', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { NIcon, NPagination, NTag } from 'naive-ui'
import { ArrowUpRight, History } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  },
  calculateWordCount: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['select', 'update:page', 'update:pageSize'])
</script>

<style scoped>
.history-section {
  margin-top: 28px;
  padding: 24px 0 0;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
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
  color: #34d399;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-title {
  font-size: 1.16rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.history-count {
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-weight: 600;
}

.history-caption {
  margin: 8px 0 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.55;
}

.history-list {
  display: flex;
  flex-direction: column;
}

.history-row {
  display: grid;
  grid-template-columns: minmax(170px, 210px) minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: 100%;
  padding: 20px 4px;
  border: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  text-align: left;
  color: inherit;
  background: transparent;
}

.history-row:first-child {
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.history-row:hover {
  background: rgba(15, 23, 42, 0.14);
}

.history-row:hover .history-action {
  color: #34d399;
  transform: translateX(2px);
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.history-mode {
  color: var(--secondary-text);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.history-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.history-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 6px;
  line-height: 1.45;
}

.history-preview {
  color: var(--secondary-text);
  font-size: 0.85rem;
  line-height: 1.55;
}

.history-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
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

.pagination-wrapper :deep(.n-pagination) {
  min-width: max-content;
}

:global(html[data-theme='light'] .history-section) {
  border-top-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .history-row),
:global(html[data-theme='light'] .history-row:first-child) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .history-row:hover) {
  background: rgba(248, 250, 252, 0.9);
}

:global(html[data-theme='light'] .history-mode) {
  color: #475569;
}

@media (max-width: 900px) {
  .history-section {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 0;
  }

  .history-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 1.05rem;
  }

  .history-caption {
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .history-list {
    gap: 10px;
  }

  .history-row {
    grid-template-columns: 1fr;
    gap: 10px;
    border-radius: 16px;
    padding: 14px;
    border: 1px solid rgba(148, 163, 184, 0.1);
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.24)),
      radial-gradient(circle at top right, rgba(52, 211, 153, 0.06), transparent 40%);
  }

  :global(html[data-theme='light'] .history-row) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95)),
      radial-gradient(circle at top right, rgba(16, 185, 129, 0.08), transparent 40%);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  }

  .history-row:first-child {
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .history-action {
    justify-content: space-between;
  }

  .history-title {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .history-preview {
    font-size: 0.8rem;
    line-height: 1.45;
  }

  .pagination-wrapper {
    justify-content: flex-start;
    overflow-x: auto;
    margin-top: 16px;
  }

  .pagination-wrapper :deep(.n-pagination-item),
  .pagination-wrapper :deep(.n-base-selection-label) {
    min-width: 40px;
    min-height: 40px;
  }
}

@media (max-width: 480px) {
  .history-count {
    white-space: normal;
  }

  .history-row {
    gap: 8px;
    padding: 12px;
  }

  .history-action {
    gap: 6px;
    font-size: 0.72rem;
  }
}
</style>

