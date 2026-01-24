<template>
  <div class="answer-history-view">
    <div class="header-section">
      <h1>📚 答题历史</h1>
      <p class="subtitle">查看你在各个模块的练习记录和答案</p>
    </div>

    <!-- Module Tabs -->
    <n-card>
      <n-tabs v-model:value="activeModule" type="line" animated>
        <n-tab-pane name="listening" tab="听力练习">
          <HistoryList 
            :module="'listening'" 
            :records="listeningRecords"
            :loading="loading"
            @load-more="loadListeningHistory"
          />
        </n-tab-pane>
        
        <n-tab-pane name="reading" tab="阅读理解">
          <HistoryList 
            :module="'reading'" 
            :records="readingRecords"
            :loading="loading"
            @load-more="loadReadingHistory"
          />
        </n-tab-pane>
        
        <n-tab-pane name="grammar" tab="语法练习">
          <HistoryList 
            :module="'grammar'" 
            :records="grammarRecords"
            :loading="loading"
            @load-more="loadGrammarHistory"
          />
        </n-tab-pane>
        
        <n-tab-pane name="speaking" tab="口语练习">
          <HistoryList 
            :module="'speaking'" 
            :records="speakingRecords"
            :loading="loading"
            @load-more="loadSpeakingHistory"
          />
        </n-tab-pane>
        
        <n-tab-pane name="writing" tab="写作练习">
          <HistoryList 
            :module="'writing'" 
            :records="writingRecords"
            :loading="loading"
            @load-more="loadWritingHistory"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const loadListeningHistory = async () => {
  loading.value = true
  try {
    const res = await learningApi.getAnswerHistory('listening', 1, 20)
    if (res.code === 200) {
      listeningRecords.value = res.data.records || res.data || []
    }
  } catch (e) {
    console.error('Failed to load listening history', e)
    message.error('加载听力历史失败')
  } finally {
    loading.value = false
  }
}

const loadReadingHistory = async () => {
  loading.value = true
  try {
    const res = await learningApi.getAnswerHistory('reading', 1, 20)
    if (res.code === 200) {
      readingRecords.value = res.data.records || res.data || []
    }
  } catch (e) {
    console.error('Failed to load reading history', e)
    message.error('加载阅读历史失败')
  } finally {
    loading.value = false
  }
}

const loadGrammarHistory = async () => {
  loading.value = true
  try {
    const res = await learningApi.getAnswerHistory('grammar', 1, 20)
    if (res.code === 200) {
      grammarRecords.value = res.data.records || res.data || []
    }
  } catch (e) {
    console.error('Failed to load grammar history', e)
    message.error('加载语法历史失败')
  } finally {
    loading.value = false
  }
}

const loadSpeakingHistory = async () => {
  loading.value = true
  try {
    const res = await learningApi.getAnswerHistory('speaking', 1, 20)
    if (res.code === 200) {
      speakingRecords.value = res.data.records || res.data || []
    }
  } catch (e) {
    console.error('Failed to load speaking history', e)
    message.error('加载口语历史失败')
  } finally {
    loading.value = false
  }
}

const loadWritingHistory = async () => {
  loading.value = true
  try {
    const res = await learningApi.getAnswerHistory('writing', 1, 20)
    if (res.code === 200) {
      writingRecords.value = res.data.records || res.data || []
    }
  } catch (e) {
    console.error('Failed to load writing history', e)
    message.error('加载写作历史失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadListeningHistory()
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
</style>
