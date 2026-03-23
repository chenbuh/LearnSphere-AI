<template>
  <section v-if="total > 0" class="history-section">
    <div class="history-heading">
      <div>
        <p class="history-kicker">{{ translate('练习记录', 'Practice History') }}</p>
        <div class="section-title">
          <n-icon :component="History" /> {{ translate('最近完成的话题', 'Recent Topics') }}
        </div>
        <p class="history-caption">{{ translate('可继续进入最近完成的话题。', 'Resume the topics you practiced most recently.') }}</p>
      </div>
      <span class="history-count">{{ total }} {{ translate('条', 'items') }}</span>
    </div>

    <div class="history-list">
      <button
        v-for="topic in topics"
        :key="topic.id"
        type="button"
        class="history-row"
        @click="emit('select', topic)"
      >
        <div class="history-meta">
          <n-tag size="small" type="warning" :bordered="false">{{ topic.type }}</n-tag>
          <span class="history-mode">{{ topic.difficulty }}</span>
        </div>
        <div class="history-copy">
          <h4 class="topic-title">{{ topic.topic }}</h4>
          <div v-if="showDate && formatDate(topic.createTime)" class="topic-date">
            {{ formatDate(topic.createTime) }}
          </div>
        </div>
        <div class="history-action">
          <span>{{ translate('继续练习', 'Continue') }}</span>
          <n-icon :component="ArrowUpRight" />
        </div>
      </button>
    </div>

    <div class="pagination-wrapper">
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
import { ArrowUpRight, History } from 'lucide-vue-next'
import { NIcon, NPagination, NTag } from 'naive-ui'

defineProps({
  topics: {
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
  translate: {
    type: Function,
    required: true
  },
  showDate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'update:page', 'update:pageSize'])

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
}
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

.history-copy {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.topic-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--text-color);
}

.topic-date {
  color: var(--secondary-text);
  font-size: 0.82rem;
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
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.06), transparent 40%);
  }

  .history-row:first-child {
    border-top: 1px solid rgba(148, 163, 184, 0.1);
  }

  .history-action {
    justify-content: space-between;
  }

  .pagination-wrapper {
    justify-content: flex-start;
    overflow-x: auto;
    margin-top: 16px;
  }

  :global(html[data-theme='light'] .history-row) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95)),
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 40%);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.06);
  }

  :global(html[data-theme='light'] .history-row:hover) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
  }
}

@media (min-width: 901px) {
  :global(html[data-theme='light'] .history-section) {
    border-top-color: rgba(203, 213, 225, 0.82);
  }

  :global(html[data-theme='light'] .history-row) {
    padding: 18px 18px;
    border: 1px solid rgba(226, 232, 240, 0.92);
    border-bottom-color: rgba(226, 232, 240, 0.92);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 10px 22px rgba(148, 163, 184, 0.07);
    margin-bottom: 10px;
  }

  :global(html[data-theme='light'] .history-row:first-child) {
    border-top-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .history-row:hover) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
  }
}
</style>

