<template>
  <div class="answer-history-view">
    <div class="header-section">
      <h1>📚 答题历史</h1>
      <p class="subtitle">查看你在各个模块的练习记录和答案</p>
    </div>

    <!-- Module Tabs -->
    <n-card class="tabs-card">
      <n-tabs v-model:value="activeModule" type="line" animated>
        <n-tab-pane name="listening" tab="听力练习">
          <HistoryList 
            :module="'listening'" 
            :records="listeningRecords"
            :loading="loading"
            :page="paginationState.listening.page"
            :page-size="paginationState.listening.pageSize"
            :total="paginationState.listening.total"
            @update:page="handlePageChange('listening', $event)"
            @update:page-size="handlePageSizeChange('listening', $event)"
          />
        </n-tab-pane>
        
        <n-tab-pane name="reading" tab="阅读理解">
          <HistoryList 
            :module="'reading'" 
            :records="readingRecords"
            :loading="loading"
            :page="paginationState.reading.page"
            :page-size="paginationState.reading.pageSize"
            :total="paginationState.reading.total"
            @update:page="handlePageChange('reading', $event)"
            @update:page-size="handlePageSizeChange('reading', $event)"
          />
        </n-tab-pane>
        
        <n-tab-pane name="grammar" tab="语法练习">
          <HistoryList 
            :module="'grammar'" 
            :records="grammarRecords"
            :loading="loading"
            :page="paginationState.grammar.page"
            :page-size="paginationState.grammar.pageSize"
            :total="paginationState.grammar.total"
            @update:page="handlePageChange('grammar', $event)"
            @update:page-size="handlePageSizeChange('grammar', $event)"
          />
        </n-tab-pane>
        
        <n-tab-pane name="speaking" tab="口语练习">
          <HistoryList 
            :module="'speaking'" 
            :records="speakingRecords"
            :loading="loading"
            :page="paginationState.speaking.page"
            :page-size="paginationState.speaking.pageSize"
            :total="paginationState.speaking.total"
            @update:page="handlePageChange('speaking', $event)"
            @update:page-size="handlePageSizeChange('speaking', $event)"
          />
        </n-tab-pane>
        
        <n-tab-pane name="writing" tab="写作练习">
          <HistoryList 
            :module="'writing'" 
            :records="writingRecords"
            :loading="loading"
            :page="paginationState.writing.page"
            :page-size="paginationState.writing.pageSize"
            :total="paginationState.writing.total"
            @update:page="handlePageChange('writing', $event)"
            @update:page-size="handlePageSizeChange('writing', $event)"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { NCard, NTabs, NTabPane, useMessage } from 'naive-ui'
import HistoryList from '@/components/AnswerHistoryList.vue'
import { learningApi } from '@/api/learning'

const message = useMessage()

const activeModule = ref('listening')
const loading = ref(false)

// Records for each module
const listeningRecords = ref([])
const readingRecords = ref([])
const grammarRecords = ref([])
const speakingRecords = ref([])
const writingRecords = ref([])

// Pagination state for each module
const paginationState = ref({
  listening: { page: 1, pageSize: 10, total: 0 },
  reading: { page: 1, pageSize: 10, total: 0 },
  grammar: { page: 1, pageSize: 20, total: 0 },
  speaking: { page: 1, pageSize: 10, total: 0 },
  writing: { page: 1, pageSize: 10, total: 0 }
})

const getModuleRef = (module) => {
  switch (module) {
    case 'listening': return listeningRecords
    case 'reading': return readingRecords
    case 'grammar': return grammarRecords
    case 'speaking': return speakingRecords
    case 'writing': return writingRecords
    default: return null
  }
}

const loadHistory = async (module) => {
  const state = paginationState.value[module]
  const targetRef = getModuleRef(module)
  if (!targetRef) return

  loading.value = true
  try {
    const res = await learningApi.getAnswerHistory(module, state.page, state.pageSize)
    if (res.code === 200) {
      targetRef.value = res.data.records || []
      state.total = res.data.total || 0
      
      // 平滑滚动到底部/顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (e) {
    console.error(`Failed to load ${module} history`, e)
    message.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (module, page) => {
  paginationState.value[module].page = page
  loadHistory(module)
}

const handlePageSizeChange = (module, pageSize) => {
  const state = paginationState.value[module]
  state.pageSize = pageSize
  state.page = 1 // 重置到第一页
  loadHistory(module)
}

// 统一各个模块的初始加载入口
const loadListeningHistory = () => loadHistory('listening')
const loadReadingHistory = () => loadHistory('reading')
const loadGrammarHistory = () => loadHistory('grammar')
const loadSpeakingHistory = () => loadHistory('speaking')
const loadWritingHistory = () => loadHistory('writing')

// Auto-load data when switching tabs if empty
watch(activeModule, (newModule) => {
  const targetRef = getModuleRef(newModule)
  if (targetRef && targetRef.value.length === 0) {
    loadHistory(newModule)
  }
})

onMounted(() => {
  loadHistory('listening')
})
</script>

<style scoped>
.answer-history-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  margin-bottom: 32px;
  text-align: center;
}

.header-section h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 16px;
  color: #999;
}

.tabs-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .answer-history-view {
    padding: 12px;
  }

  .header-section {
    margin-bottom: 20px;
  }

  .header-section h1 {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 14px;
  }

  /* 适配 Naive UI Tabs 在移动端的水平滚动 */
  :deep(.n-tabs-nav-scroll-content) {
    padding: 0 4px !important;
  }

  :deep(.n-tabs-tab) {
    padding: 8px 12px !important;
  }

  :deep(.n-card__content) {
    padding: 12px !important;
  }
}
</style>
