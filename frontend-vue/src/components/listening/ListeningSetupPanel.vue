<script setup>
import ListeningSetupConfigPanel from '@/components/listening/ListeningSetupConfigPanel.vue'
import ListeningSetupHistorySection from '@/components/listening/ListeningSetupHistorySection.vue'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  counts: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  speeds: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
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

const emit = defineEmits([
  'clear-state',
  'set-setting',
  'generate',
  'load-material',
  'update:history-page',
  'update:history-page-size'
])
</script>

<template>
  <div class="setup-container">
    <ListeningSetupConfigPanel
      :translate="props.translate"
      :settings="props.settings"
      :exam-types="props.examTypes"
      :counts="props.counts"
      :difficulties="props.difficulties"
      :speeds="props.speeds"
      :is-loading="props.isLoading"
      @clear-state="emit('clear-state')"
      @set-setting="emit('set-setting', $event)"
      @generate="emit('generate')"
    />

    <ListeningSetupHistorySection
      :translate="props.translate"
      :history-total="props.historyTotal"
      :paginated-history="props.paginatedHistory"
      :history-page="props.historyPage"
      :history-page-size="props.historyPageSize"
      @load-material="emit('load-material', $event)"
      @update:history-page="emit('update:history-page', $event)"
      @update:history-page-size="emit('update:history-page-size', $event)"
    />
  </div>
</template>

<style scoped>
.setup-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>