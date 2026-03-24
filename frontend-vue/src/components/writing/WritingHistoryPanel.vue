<template>
  <section v-if="total > 0" class="history-section">
    <div class="history-heading">
      <div>
        <p class="history-kicker">题目记录</p>
        <div class="section-title">
          <n-icon :component="History" /> 最近生成题目
        </div>
      </div>
      <span class="history-count">{{ total }} 条</span>
    </div>

    <div class="history-list">
      <button
        v-for="topic in items"
        :key="topic.id"
        type="button"
        class="history-row"
        @click="emit('select', topic)"
      >
        <div class="history-meta">
          <n-tag size="small" type="warning" :bordered="false">{{ getExamTypeLabel(topic.examType, '未选择') }}</n-tag>
          <span class="history-mode">{{ topic.mode }}</span>
          <span v-if="topic.difficulty" class="history-difficulty">{{ topic.difficulty }}</span>
        </div>
        <div class="history-copy">
          <h4 class="topic-title">{{ topic.title }}</h4>
          <div class="topic-preview">
            {{ topic.prompt?.length > 120 ? `${topic.prompt.substring(0, 120)}...` : topic.prompt }}
          </div>
        </div>
        <div class="history-action">
          <span>载入题目</span>
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
import { getExamTypeLabel } from '@/constants/examTypes'

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
  color: #fb923c;
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

.history-list {
  display: flex;
  flex-direction: column;
}

.history-row {
  display: grid;
  grid-template-columns: minmax(150px, 180px) minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: 100%;
  padding: 18px 0;
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
  background: rgba(15, 23, 42, 0.16);
}

.history-row:hover .history-action {
  color: #fb923c;
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

.history-difficulty {
  color: #fdba74;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.history-copy {
  min-width: 0;
}

.topic-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 6px;
  line-height: 1.45;
}

.topic-preview {
  color: var(--secondary-text);
  font-size: 0.85rem;
  line-height: 1.55;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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

:global(html[data-theme='light'] .history-difficulty) {
  color: #c2410c;
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
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.06), transparent 40%);
  }

  :global(html[data-theme='light'] .history-row) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95)),
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.09), transparent 40%);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  }

  .history-row:first-child {
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .history-action {
    justify-content: space-between;
  }

  .topic-title {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .topic-preview {
    font-size: 0.8rem;
    line-height: 1.45;
  }

  .pagination-wrapper {
    justify-content: flex-start;
    overflow-x: auto;
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .history-row {
    gap: 8px;
    padding: 12px;
    border-radius: 14px;
  }

  .history-meta {
    gap: 8px;
  }

  .history-action {
    width: 100%;
    font-size: 0.74rem;
  }

  .pagination-wrapper :deep(.n-pagination) {
    min-width: max-content;
  }
}

@media (max-width: 360px) {
  .history-section {
    margin-top: 22px;
    padding-top: 16px;
  }

  .section-title {
    gap: 8px;
    font-size: 0.98rem;
  }

  .history-row {
    padding: 10px;
  }

  .history-mode,
  .history-difficulty {
    font-size: 0.7rem;
  }

  .topic-title {
    font-size: 0.9rem;
  }

  .topic-preview {
    font-size: 0.76rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .history-section {
    margin-top: 20px;
  }

  .history-list {
    gap: 8px;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

