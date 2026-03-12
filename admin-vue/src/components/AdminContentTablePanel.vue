<script setup>
import { NCard, NDataTable, NPagination, NTabPane, NTabs } from 'naive-ui'

defineProps({
  activeTab: {
    type: String,
    default: 'listening'
  },
  listeningList: {
    type: Array,
    default: () => []
  },
  readingList: {
    type: Array,
    default: () => []
  },
  grammarList: {
    type: Array,
    default: () => []
  },
  speakingList: {
    type: Array,
    default: () => []
  },
  listeningColumns: {
    type: Array,
    default: () => []
  },
  readingColumns: {
    type: Array,
    default: () => []
  },
  grammarColumns: {
    type: Array,
    default: () => []
  },
  speakingColumns: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  },
  pageCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tab-change', 'page-change'])
</script>

<template>
  <n-card class="content-card">
    <n-tabs :value="activeTab" type="segment" animated @update:value="emit('tab-change', $event)">
      <n-tab-pane name="listening" tab="🎧 听力材料">
        <n-data-table
          :columns="listeningColumns"
          :data="listeningList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>

      <n-tab-pane name="reading" tab="📖 阅读文章">
        <n-data-table
          :columns="readingColumns"
          :data="readingList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>

      <n-tab-pane name="grammar" tab="📝 语法练习">
        <n-data-table
          :columns="grammarColumns"
          :data="grammarList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>

      <n-tab-pane name="speaking" tab="🗣️ 口语话题">
        <n-data-table
          :columns="speakingColumns"
          :data="speakingList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>
    </n-tabs>

    <div class="pagination">
      <n-pagination
        :page="page"
        :page-count="pageCount"
        show-size-picker
        @update:page="emit('page-change', $event)"
      />
    </div>
  </n-card>
</template>

<style scoped>
.content-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
