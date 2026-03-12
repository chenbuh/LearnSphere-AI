<script setup>
import { NGrid, NGridItem, NPagination, NSpin } from 'naive-ui'
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
      <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:3 1200:4" responsive="screen">
        <n-grid-item
          v-for="(word, index) in paginatedBrowseWords"
          :key="word.id || `${word.word}-${index}`"
          class="animate-slide-up"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="word-card hover-lift shine-effect" @click="emit('open-word-detail', word)">
            <div class="word-card-top">
              <div class="word-main-info">
                <h3>{{ word.word }}</h3>
                <span class="phonetic">{{ word.phonetic }}</span>
              </div>
              <div class="play-btn" @click.stop="emit('play-audio', word.word)">
                <Volume2 :size="16" />
              </div>
            </div>
            <div class="word-meaning secure-content">{{ word.meaning }}</div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>

    <div v-if="total > 0" class="pagination-container">
      <n-pagination :page="page" :item-count="total" :page-size="pageSize" @update:page="emit('change-page', $event)" />
    </div>
  </n-spin>
</template>

<style scoped>
.word-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  height: 100%;
}

:global(.dark-mode) .word-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.word-card:hover {
  background: rgba(0, 0, 0, 0.06);
  border-color: #6366f1;
  transform: translateY(-2px);
}

:global(.dark-mode) .word-card:hover {
  background: rgba(255, 255, 255, 0.06);
}

.word-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.word-main-info h3 {
  font-size: 1.1rem;
  color: #18181b;
  font-weight: 700;
  margin: 0 0 2px 0;
}

:global(.dark-mode) .word-main-info h3 {
  color: #fff;
}

.word-main-info .phonetic {
  font-size: 0.8rem;
  color: #52525b;
  font-family: monospace;
}

:global(.dark-mode) .word-main-info .phonetic {
  color: #a1a1aa;
}

.play-btn {
  color: #52525b;
  transition: color 0.2s;
}

:global(.dark-mode) .play-btn {
  color: #71717a;
}

.word-card:hover .play-btn {
  color: #6366f1;
}

.word-meaning {
  font-size: 0.9rem;
  color: #3f3f46;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark-mode) .word-meaning {
  color: #d4d4d8;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.play-btn:active {
  transform: scale(0.85);
}
</style>