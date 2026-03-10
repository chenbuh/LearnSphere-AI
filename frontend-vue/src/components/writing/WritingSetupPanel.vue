<template>
  <div class="setup-container">
    <n-card class="setup-card" :bordered="false" size="huge">
      <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
        <n-grid-item span="2">
          <WritingSetupOptionSection
            title="考试类型"
            :icon="GraduationCap"
            icon-color="#6366f1"
            :items="examTypes"
            :model-value="settings.examType"
            grid-class="exam-grid"
            show-text-icon
            @select="emit('update-setting', 'examType', $event)"
          />

          <WritingSetupOptionSection
            title="写作题型"
            :icon="PenTool"
            icon-color="#a855f7"
            :items="writingModes"
            :model-value="settings.mode"
            grid-class="mode-grid"
            @select="emit('update-setting', 'mode', $event)"
          />
        </n-grid-item>

        <n-grid-item>
          <WritingSetupSidePanel
            :settings="settings"
            :time-limits="timeLimits"
            @update-setting="(key, value) => emit('update-setting', key, value)"
            @generate="emit('generate')"
          />
        </n-grid-item>
      </n-grid>
    </n-card>

    <WritingHistoryPanel
      :items="items"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>

<script setup>
import { NCard, NGrid, NGridItem } from 'naive-ui'
import { GraduationCap, PenTool } from 'lucide-vue-next'
import WritingHistoryPanel from '@/components/writing/WritingHistoryPanel.vue'
import WritingSetupOptionSection from '@/components/writing/WritingSetupOptionSection.vue'
import WritingSetupSidePanel from '@/components/writing/WritingSetupSidePanel.vue'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  writingModes: {
    type: Array,
    default: () => []
  },
  timeLimits: {
    type: Array,
    default: () => []
  },
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

const emit = defineEmits(['update-setting', 'generate', 'select', 'update:page', 'update:pageSize'])
</script>

<style scoped>
.setup-card {
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.setup-card :deep(.n-card) {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
  color: var(--text-color);
}

.exam-grid,
.mode-grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>