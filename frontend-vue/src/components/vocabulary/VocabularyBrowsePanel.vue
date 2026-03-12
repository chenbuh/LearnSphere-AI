<script setup>
import VocabularyBrowseFilterBar from '@/components/vocabulary/VocabularyBrowseFilterBar.vue'
import VocabularyBrowseWordGrid from '@/components/vocabulary/VocabularyBrowseWordGrid.vue'

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
</script>

<template>
  <div class="browse-panel">
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
  </div>
</template>

<style scoped>
.browse-panel {
  width: 100%;
}
</style>