<script setup>
import { computed } from 'vue'
import VocabularyBrowseFilterBar from '@/components/vocabulary/VocabularyBrowseFilterBar.vue'
import VocabularyBrowseWordGrid from '@/components/vocabulary/VocabularyBrowseWordGrid.vue'
import { getExamTypeLabel } from '@/constants/examTypes'

const props = defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
  },
  examOptions: {
    type: Array,
    default: () => []
  },
  searchText: {
    type: String,
    default: ''
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  paginatedBrowseWords: {
    type: Array,
    default: () => []
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

const emit = defineEmits([
  'update:selected-exam',
  'update:search-text',
  'search',
  'change-page',
  'open-word-detail',
  'play-audio'
])

const selectedExamLabel = computed(() => (
  getExamTypeLabel(props.selectedExam, '未选择')
))
</script>

<template>
  <div class="browse-panel">
    <section class="browse-main">
      <VocabularyBrowseFilterBar
        :selected-exam="props.selectedExam"
        :exam-options="props.examOptions"
        :search-text="props.searchText"
        :total="props.total"
        @update:selected-exam="emit('update:selected-exam', $event)"
        @update:search-text="emit('update:search-text', $event)"
        @search="emit('search')"
      />

      <VocabularyBrowseWordGrid
        :loading="props.loading"
        :paginated-browse-words="props.paginatedBrowseWords"
        :total="props.total"
        :page="props.page"
        :page-size="props.pageSize"
        @change-page="emit('change-page', $event)"
        @open-word-detail="emit('open-word-detail', $event)"
        @play-audio="emit('play-audio', $event)"
      />
    </section>

    <aside class="browse-rail">
      <div class="rail-card">
        <span class="rail-kicker">浏览概览</span>
        <h3>词条浏览</h3>
        <p>按词库与关键词筛选，点击词条可查看详情和发音。</p>
      </div>

      <div class="rail-card">
        <div class="rail-metric">
          <span>当前词库</span>
          <strong>{{ selectedExamLabel }}</strong>
        </div>
        <div class="rail-metric">
          <span>结果总量</span>
          <strong>{{ props.total }}</strong>
        </div>
        <div class="rail-metric">
          <span>当前分页</span>
          <strong>{{ props.page }}</strong>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.browse-panel {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) 280px;
  gap: 20px;
}

.browse-main,
.rail-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.browse-main {
  padding: 22px;
}

.browse-rail {
  display: grid;
  gap: 16px;
  align-content: start;
}

.rail-card {
  padding: 20px;
  transition: all 0.25s ease;
}

.rail-card:hover {
  border-color: rgba(30, 107, 82, 0.25);
}

.rail-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--tone-amber);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rail-kicker::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f59e0b;
}

.rail-card h3 {
  margin: 0 0 10px;
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 750;
}

.rail-card p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.9rem;
  line-height: 1.6;
}

.rail-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.rail-metric:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.rail-metric span {
  color: var(--secondary-text);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rail-metric strong {
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1000px) {
  .browse-panel {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 901px) {
  :global(html[data-theme='light'] .browse-main),
  :global(html[data-theme='light'] .rail-card) {
    border-color: rgba(203, 213, 225, 0.82);
  }

  :global(html[data-theme='light'] .rail-card:first-child) {
    background:
      radial-gradient(circle at top right, var(--tone-orange-soft), transparent 38%),
      var(--card-bg);
  }

  :global(html[data-theme='light'] .rail-metric) {
    border-bottom-color: rgba(226, 232, 240, 0.9);
  }
}
</style>
