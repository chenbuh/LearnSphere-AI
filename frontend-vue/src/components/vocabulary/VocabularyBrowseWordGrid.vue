<script setup>
import { NPagination, NSpin } from 'naive-ui'
import { Volume2 } from 'lucide-vue-next'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  paginatedBrowseWords: {
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
    default: 12
  }
})

const emit = defineEmits(['change-page', 'open-word-detail', 'play-audio'])
</script>

<template>
  <n-spin :show="loading">
    <div class="word-grid-container">
      <div class="word-list">
        <div
          v-for="(word, index) in paginatedBrowseWords"
          :key="word.id || `${word.word}-${index}`"
          class="word-row"
          @click="emit('open-word-detail', word)"
        >
          <div class="word-leading">
            <div class="word-index">{{ String(index + 1 + ((page - 1) * pageSize)).padStart(2, '0') }}</div>
            <div class="word-main-info">
              <h3>{{ word.word }}</h3>
              <span class="phonetic">{{ word.phonetic }}</span>
            </div>
          </div>

          <div class="word-meaning secure-content">{{ word.meaning }}</div>

          <button type="button" class="play-btn" @click.stop="emit('play-audio', word.word)">
            <Volume2 :size="16" />
          </button>
        </div>
      </div>

      <div v-if="!paginatedBrowseWords.length && !loading" class="empty-state">
        <h3>没有找到匹配词条</h3>
        <p>换一个词库或关键词继续检索，列表会在这里直接更新。</p>
      </div>
    </div>

    <div v-if="total > 0" class="pagination-container">
      <n-pagination :page="page" :item-count="total" :page-size="pageSize" @update:page="emit('change-page', $event)" />
    </div>
  </n-spin>
</template>

<style scoped>
.word-list {
  display: grid;
  gap: 10px;
}

.word-row {
  display: grid;
  grid-template-columns: minmax(220px, 0.46fr) minmax(0, 1fr) auto;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.16);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.word-row:hover {
  transform: translateY(-1px);
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(15, 23, 42, 0.24);
}

.word-leading {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.word-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.12);
  color: #fdba74;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.word-main-info {
  min-width: 0;
}

.word-main-info h3 {
  font-size: 1.1rem;
  color: var(--text-color);
  font-weight: 700;
  margin: 0 0 2px 0;
}

.word-main-info .phonetic {
  font-size: 0.8rem;
  color: var(--secondary-text);
  font-family: monospace;
}

.play-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  color: var(--secondary-text);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.word-row:hover .play-btn {
  color: #fdba74;
  border-color: rgba(245, 158, 11, 0.32);
  background: rgba(245, 158, 11, 0.08);
}

.word-meaning {
  font-size: 0.92rem;
  color: var(--secondary-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.empty-state {
  padding: 34px 20px;
  text-align: center;
}

.empty-state h3 {
  margin: 0 0 8px;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--secondary-text);
}

.play-btn:active {
  transform: scale(0.85);
}

@media (max-width: 900px) {
  .word-row {
    grid-template-columns: 1fr auto;
  }

  .word-meaning {
    grid-column: 1 / -1;
    white-space: normal;
    line-height: 1.55;
  }
}

@media (max-width: 768px) {
  .word-row {
    padding: 14px;
    border-radius: 16px;
  }

  :global(html[data-theme='light'] .word-row) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 10px 22px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .word-row:hover) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
    border-color: rgba(251, 146, 60, 0.32);
  }

  :global(html[data-theme='light'] .word-index) {
    background: rgba(251, 191, 36, 0.12);
    color: #d97706;
  }

  :global(html[data-theme='light'] .play-btn) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.96);
    color: #64748b;
  }

  :global(html[data-theme='light'] .word-row:hover .play-btn) {
    background: rgba(255, 237, 213, 0.96);
    color: #c2410c;
  }
}

@media (max-width: 480px) {
  .word-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }

  .word-leading {
    gap: 10px;
  }

  .word-index {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 0.76rem;
  }

  .word-main-info h3 {
    font-size: 1rem;
  }

  .word-main-info .phonetic {
    word-break: break-word;
  }

  .word-meaning {
    font-size: 0.88rem;
  }

  .play-btn {
    width: 44px;
    height: 44px;
    justify-self: end;
  }

  .pagination-container {
    justify-content: flex-start;
    overflow-x: auto;
    margin-top: 18px;
    padding-bottom: 2px;
  }
}

@media (max-width: 360px) {
  .word-leading {
    align-items: flex-start;
  }

  .word-row {
    border-radius: 14px;
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .word-row) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 10px 24px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .word-row:hover) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
    border-color: rgba(251, 146, 60, 0.32);
  }

  :global(html[data-theme='light'] .word-index) {
    background: rgba(251, 191, 36, 0.12);
    color: #d97706;
  }

  :global(html[data-theme='light'] .play-btn) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.96);
    color: #64748b;
  }

  :global(html[data-theme='light'] .word-row:hover .play-btn) {
    background: rgba(255, 237, 213, 0.96);
    color: #c2410c;
  }
}
</style>
