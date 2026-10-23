<template>
  <section v-if="items.length > 0" class="history-section">
    <div class="history-heading">
      <div>
        <div class="kicker-wrap">
          <span class="kicker-dot"></span>
          <p class="history-kicker">阅读档案</p>
        </div>
        <div class="section-title">
          <n-icon :component="History" color="#34d399" />
          <span>最近生成任务</span>
        </div>
        <p class="history-caption">点击即可秒级载入历史生成的精读篇章与答题记录。</p>
      </div>
      <div class="history-count-pill">{{ total }} 条记录</div>
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
          <span class="source-tag">{{ item.source }}</span>
          <span class="diff-tag">{{ item.difficulty?.toUpperCase?.() || 'NORMAL' }}</span>
        </div>
        <div class="history-copy">
          <h4 class="history-title">{{ item.title }}</h4>
          <div class="history-preview">
            <span class="stat-badge">{{ item.questions?.length || 0 }} 题</span>
            <span class="dot-sep">•</span>
            <span class="stat-badge">{{ calculateWordCount(item.content) }} 词</span>
          </div>
        </div>
        <div class="history-action">
          <span>载入文章</span>
          <n-icon :component="ArrowUpRight" size="16" />
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
import { NIcon, NPagination } from 'naive-ui'
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
  margin-top: 36px;
  padding: 24px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.history-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.history-kicker {
  margin: 0;
  color: var(--tone-emerald);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
}

.history-caption {
  margin: 6px 0 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
}

.history-count-pill {
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--secondary-text);
  font-size: 0.82rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-row {
  display: grid;
  grid-template-columns: minmax(130px, 170px) minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  background: var(--card-bg);
  color: inherit;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.history-row:hover {
  background: var(--card-bg);
  border-color: rgba(52, 211, 153, 0.4);
  transform: translateY(-2px);
}

.history-row:hover .history-action {
  color: var(--tone-emerald);
  transform: translateX(4px);
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.source-tag {
  padding: 3px 8px;
  border-radius: 6px;
  /* R5：底色 alpha 0.15→0.10，4.74 边缘留出余量 */
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--tone-emerald);
  font-size: 0.74rem;
  font-weight: 700;
}

.diff-tag {
  font-size: 0.72rem;
  color: var(--secondary-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.history-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.history-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-color);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.history-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--secondary-text);
}

.stat-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.dot-sep {
  /* R8：分隔符是文本字符，去掉 0.4 透明度改用次级文字色 */
  color: var(--secondary-text);
}

.history-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--secondary-text);
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

html[data-theme='light'] .history-section {
  border-top-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .section-title,
html[data-theme='light'] .history-title {
  color: var(--text-color);
}

html[data-theme='light'] .history-caption {
  color: var(--secondary-text);
}

html[data-theme='light'] .history-count-pill {
  background: #f1f5f9;
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .history-row {
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .history-row:hover {
  background: #ffffff;
  border-color: rgba(16, 185, 129, 0.45);
}

@media (max-width: 900px) {
  .history-row {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }

  .history-action {
    justify-content: flex-end;
  }
}
</style>
