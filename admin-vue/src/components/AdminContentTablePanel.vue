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
    <div class="panel-head">
      <div>
        <span class="panel-label">内容工作区</span>
        <h2>模块切换与素材清单</h2>
        <p>按模块切换数据表，保持编辑动作聚焦在当前内容类型。</p>
      </div>
    </div>
    <n-tabs :value="activeTab" type="segment" animated @update:value="emit('tab-change', $event)">
      <n-tab-pane name="listening" :tab="`听力材料 ${listeningList.length}`">
        <n-data-table
          :columns="listeningColumns"
          :data="listeningList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>

      <n-tab-pane name="reading" :tab="`阅读文章 ${readingList.length}`">
        <n-data-table
          :columns="readingColumns"
          :data="readingList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>

      <n-tab-pane name="grammar" :tab="`语法练习 ${grammarList.length}`">
        <n-data-table
          :columns="grammarColumns"
          :data="grammarList"
          :loading="loading"
          :bordered="false"
          :single-line="false"
        />
      </n-tab-pane>

      <n-tab-pane name="speaking" :tab="`口语话题 ${speakingList.length}`">
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
  background: linear-gradient(180deg, rgba(13, 20, 32, 0.94), rgba(10, 16, 26, 0.84));
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
}

.panel-head {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.panel-label {
  display: inline-block;
  margin-bottom: 6px;
  color: #8fe7dc;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.panel-head h2 {
  margin: 0;
  color: #f7fbff;
  font-size: 1.08rem;
  font-weight: 700;
}

.panel-head p {
  margin: 6px 0 0;
  color: #8ea1ba;
  font-size: 0.88rem;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
