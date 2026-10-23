<script setup>
import { computed, h } from 'vue'
import { NDataTable, NPagination, NTabPane, NTabs } from 'naive-ui'
import { BookOpen, Headphones, Mic, PenTool } from 'lucide-vue-next'

const props = defineProps({
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
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tab-change', 'page-change'])

const tabs = [
  { name: 'listening', label: '听力材料', icon: Headphones },
  { name: 'reading', label: '阅读文章', icon: BookOpen },
  { name: 'grammar', label: '语法练习', icon: PenTool },
  { name: 'speaking', label: '口语话题', icon: Mic }
]

const current = computed(() => {
  const map = {
    listening: { data: props.listeningList, columns: props.listeningColumns },
    reading: { data: props.readingList, columns: props.readingColumns },
    grammar: { data: props.grammarList, columns: props.grammarColumns },
    speaking: { data: props.speakingList, columns: props.speakingColumns }
  }
  return map[props.activeTab] || map.listening
})

const pageRange = computed(() => {
  if (!props.total) return '0 - 0'
  const start = (props.page - 1) * props.pageSize + 1
  const end = Math.min(props.page * props.pageSize, props.total)
  return `${start} - ${end}`
})
</script>

<template>
  <section class="ls-panel content-panel">
    <div class="content-panel__head">
      <div class="content-panel__tabs">
        <n-tabs :value="activeTab" type="line" size="small" @update:value="emit('tab-change', $event)">
          <n-tab-pane v-for="tab in tabs" :key="tab.name" :name="tab.name">
            <template #tab>
              <div class="tab-item-content">
                <component :is="tab.icon" :size="15" />
                <span>{{ tab.label }}</span>
              </div>
            </template>
          </n-tab-pane>
        </n-tabs>
      </div>
      <span class="content-panel__count">本模块共 {{ total }} 条</span>
    </div>

    <n-data-table
      :key="activeTab"
      :columns="current.columns"
      :data="current.data"
      :loading="loading"
      :bordered="false"
      :scroll-x="900"
    />

    <div class="ls-panel__foot content-panel__foot">
      <span class="content-panel__range">显示第 {{ pageRange }} 条，共 {{ total }} 条数据</span>
      <n-pagination
        :page="page"
        :page-count="pageCount"
        @update:page="emit('page-change', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.content-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 22px 0 22px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.content-panel__tabs :deep(.n-tabs-nav) {
  margin-bottom: -1px;
}

.tab-item-content {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 550;
  font-size: 13.5px;
}

.content-panel__count {
  font-size: 12px;
  font-weight: 550;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
  margin-bottom: 6px;
}

.content-panel__foot {
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.content-panel__range {
  color: #64748b;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.content-panel :deep(.n-data-table-td[data-col-key='title']),
.content-panel :deep(.n-data-table-td[data-col-key='topic']) {
  color: #0f172a;
  font-weight: 600;
}
</style>
