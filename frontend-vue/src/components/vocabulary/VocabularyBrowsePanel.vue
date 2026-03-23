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
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.32), rgba(15, 23, 42, 0.18)),
    rgba(15, 23, 42, 0.16);
}

.browse-main {
  padding: 18px;
}

.browse-rail {
  display: grid;
  gap: 16px;
  align-content: start;
}

.rail-card {
  padding: 18px;
}

.rail-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: #fdba74;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.rail-card h3 {
  margin: 0 0 10px;
  color: var(--text-color);
  font-size: 1.08rem;
}

.rail-card p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.rail-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.rail-metric:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.rail-metric span {
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-metric strong {
  color: var(--text-color);
  font-size: 1rem;
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
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 40px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .rail-card:first-child) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.14), transparent 38%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .rail-metric) {
    border-bottom-color: rgba(226, 232, 240, 0.9);
  }
}
</style>
