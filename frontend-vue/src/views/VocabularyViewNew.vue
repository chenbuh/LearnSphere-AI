<template>
  <div class="vocabulary-view">
    <n-card title="📚 词汇学习" class="main-card">
      
      <!-- 筛选和搜索 -->
      <n-space class="filter-bar" align="center">
        <n-select
          v-model:value="filters.examType"
          :options="examOptions"
          class="filter-select filter-select--exam"
          @update:value="loadVocabulary"
        />
        <n-select
          v-model:value="filters.difficulty"
          :options="difficultyOptions"
          class="filter-select filter-select--difficulty"
          placeholder="难度"
          clearable
          @update:value="loadVocabulary"
        />
        <n-input
          v-model:value="filters.keyword"
          placeholder="搜索单词..."
          clearable
          class="filter-search"
          @update:value="handleSearch"
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        <n-button type="primary" class="filter-action-btn" @click="loadDailyWords">
          每日单词
        </n-button>
      </n-space>

      <!-- 词汇列表 -->
      <n-spin :show="loading">
        <n-grid cols="1 640:2 1024:3" :x-gap="16" :y-gap="16" class="vocabulary-grid">
          <n-grid-item v-for="word in vocabularyList" :key="word.id">
            <n-card
              hoverable
              class="word-card"
              @click="showWordDetail(word)"
            >
              <div class="word-header">
                <h3>{{ word.word }}</h3>
                <n-tag :type="getDifficultyType(word.difficulty)" size="small">
                  难度 {{ word.difficulty }}
                </n-tag>
              </div>
              <div class="word-phonetic">{{ word.phonetic }}</div>
              <div class="word-translation">{{ word.translation }}</div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <!-- 分页 -->
        <n-pagination
          v-model:page="pagination.page"
          :page-count="pagination.pageCount"
          :page-size="pagination.pageSize"
          show-size-picker
          :page-sizes="[12, 24, 48]"
          @update:page="loadVocabulary"
          @update:page-size="handlePageSizeChange"
          class="pagination"
        />
      </n-spin>

      <!-- 词汇详情弹窗 -->
      <n-modal
        v-model:show="showDetail"
        preset="card"
        title="词汇详情"
        class="detail-modal"
      >
        <div v-if="currentWord" class="word-detail">
          <div class="detail-header">
            <h2>{{ currentWord.word }}</h2>
            <n-button circle @click="playAudio(currentWord.word)">
              <template #icon>
                <Volume2 :size="20" />
              </template>
            </n-button>
          </div>
          
          <div class="detail-phonetic">{{ currentWord.phonetic }}</div>
          
          <n-divider />
          
          <div class="detail-section">
            <h4>释义</h4>
            <p>{{ currentWord.translation }}</p>
          </div>
          
          <div v-if="currentWord.definition" class="detail-section">
            <h4>英文释义</h4>
            <p>{{ currentWord.definition }}</p>
          </div>
          
          <div v-if="currentWord.example" class="detail-section">
            <h4>例句</h4>
            <p class="example-en">{{ currentWord.example }}</p>
            <p class="example-cn">{{ currentWord.exampleTranslation }}</p>
          </div>
          
          <n-divider />
          
          <n-space class="detail-actions">
            <n-button type="success" @click="markAsKnown(currentWord)">
              <template #icon>
                <Check :size="16" />
              </template>
              已掌握
            </n-button>
            <n-button type="warning" @click="addToReview(currentWord)">
              <template #icon>
                <Star :size="16" />
              </template>
              加入复习
            </n-button>
          </n-space>
        </div>
      </n-modal>

    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { Search, Volume2, Check, Star } from 'lucide-vue-next'
import { vocabularyApi } from '@/api/vocabulary'
import { learningApi } from '@/api/learning'
import { decryptPayload } from '@/utils/crypto'
import { useTextAudio } from '@/composables/useTextAudio'
import { useUserStore } from '@/stores/user'
import { VOCABULARY_EXAM_TYPE_OPTIONS, resolvePreferredExamType } from '@/constants/examTypes'

const message = useMessage()
const userStore = useUserStore()
const { playAudio: playTextAudio } = useTextAudio({
  notifyWarning: (content) => message.warning(content)
})

// 筛选条件
const filters = reactive({
  examType: resolvePreferredExamType(VOCABULARY_EXAM_TYPE_OPTIONS, userStore.examType),
  difficulty: null,
  keyword: ''
})

// 考试类型选项
const examOptions = VOCABULARY_EXAM_TYPE_OPTIONS

// 难度选项
const difficultyOptions = [
  { label: '简单', value: 1 },
  { label: '一般', value: 2 },
  { label: '中等', value: 3 },
  { label: '困难', value: 4 },
  { label: '很难', value: 5 }
]

// 词汇列表
const vocabularyList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 12,
  pageCount: 1,
  total: 0
})

// 词汇详情
const showDetail = ref(false)
const currentWord = ref(null)
const detailOpenedAt = ref(0)

const getDetailTimeSpent = () => {
  if (!detailOpenedAt.value) {
    return 10
  }

  return Math.max(10, Math.round((Date.now() - detailOpenedAt.value) / 1000))
}

// 加载词汇列表
const loadVocabulary = async () => {
  loading.value = true
  try {
    const response = await vocabularyApi.getVocabularyList({
      examType: filters.examType,
      difficulty: filters.difficulty,
      keyword: filters.keyword,
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    const decrypted = decryptPayload(response.data)
    vocabularyList.value = decrypted.records
    pagination.total = decrypted.total
    pagination.pageCount = Math.ceil(decrypted.total / pagination.pageSize)
    
  } catch (error) {
    message.error('加载词汇失败')
  } finally {
    loading.value = false
  }
}

// 加载每日单词
const loadDailyWords = async () => {
  loading.value = true
  try {
    const response = await vocabularyApi.getDailyWords({
      examType: filters.examType,
      count: pagination.pageSize
    })
    
    const decrypted = decryptPayload(response.data)
    vocabularyList.value = decrypted.records
    pagination.page = 1
    pagination.total = decrypted.total || decrypted.records.length
    pagination.pageCount = 1
    
    message.success('已加载每日单词')
  } catch (error) {
    message.error('加载每日单词失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
let searchTimer = null
const handleSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pagination.page = 1
    loadVocabulary()
  }, 500)
}

// 分页大小改变
const handlePageSizeChange = (newSize) => {
  pagination.pageSize = newSize
  pagination.page = 1
  loadVocabulary()
}

// 显示词汇详情
const showWordDetail = (word) => {
  currentWord.value = word
  showDetail.value = true
  detailOpenedAt.value = Date.now()
  playAudio(word.word, true)
}

// 播放发音
const playAudio = (text, isAuto = false) => {
  playTextAudio(text, {
    isAuto,
    mode: 'mixed',
    nativeOptions: {
      lang: 'en-US',
      rate: 0.9
    }
  })
}

// 获取难度标签类型
const getDifficultyType = (difficulty) => {
  const types = ['success', 'info', 'warning', 'error', 'error']
  return types[difficulty - 1] || 'default'
}

// 标记为已掌握
const markAsKnown = async (word) => {
  try {
    await learningApi.createRecord({
      contentId: word.id,
      contentType: 'vocabulary',
      isCorrect: 1,
      timeSpent: getDetailTimeSpent(),
      score: 100,
      answer: word.word,
      correctAnswer: word.word,
      masteryLevel: 5
    })
    message.success('已标记为掌握')
    showDetail.value = false
    detailOpenedAt.value = 0
  } catch (error) {
    message.error('操作失败')
  }
}

// 加入复习
const addToReview = async (word) => {
  try {
    await learningApi.createRecord({
      contentId: word.id,
      contentType: 'vocabulary',
      isCorrect: 0,
      timeSpent: getDetailTimeSpent(),
      score: 0,
      answer: '',
      correctAnswer: word.word,
      masteryLevel: 1
    })
    message.success('已加入复习列表')
    showDetail.value = false
    detailOpenedAt.value = 0
  } catch (error) {
    message.error('操作失败')
  }
}

// 初始化
onMounted(() => {
  loadVocabulary()
})
</script>

<style scoped>
.vocabulary-view {
  padding: 20px;
  padding-right: max(20px, env(safe-area-inset-right));
  padding-left: max(20px, env(safe-area-inset-left));
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  min-width: 0;
  box-sizing: border-box;
}

.main-card {
  max-width: 1400px;
  margin: 0 auto;
  min-width: 0;
  box-sizing: border-box;
}

.filter-bar {
  margin-bottom: 24px;
  min-width: 0;
}

.filter-select--exam {
  width: 200px;
}

.filter-select--difficulty {
  width: 150px;
}

.filter-search {
  width: min(100%, 420px);
}

.filter-action-btn,
.vocabulary-grid {
  min-width: 0;
}

.word-card {
  cursor: pointer;
  transition: all 0.3s;
  min-width: 0;
  box-sizing: border-box;
}

.word-card :deep(.n-card__content) {
  min-width: 0;
}

.vocabulary-grid {
  margin: 24px 0;
  min-height: 400px;
}

.word-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
  min-width: 0;
}

.word-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.word-phonetic {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  overflow-wrap: anywhere;
}

.word-translation {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.detail-modal {
  width: min(600px, calc(100vw - 32px));
}

.detail-modal :deep(.n-card) {
  max-width: 100%;
}

.detail-modal :deep(.n-card__content) {
  min-width: 0;
  box-sizing: border-box;
}

.word-detail {
  padding: 16px 0;
  min-width: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
  min-width: 0;
}

.detail-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-phonetic {
  color: #666;
  font-size: 16px;
  margin-bottom: 16px;
  overflow-wrap: anywhere;
}

.detail-section {
  margin: 16px 0;
  min-width: 0;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.detail-section p {
  margin: 0;
  line-height: 1.8;
  color: #666;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.example-en {
  font-style: italic;
  color: #333;
  margin-bottom: 4px;
}

.example-cn {
  color: #666;
}

.example-en,
.example-cn {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-actions {
  width: 100%;
  min-width: 0;
}

@media (max-width: 768px) {
  .vocabulary-view {
    padding: 14px 12px calc(18px + env(safe-area-inset-bottom));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-left: max(12px, env(safe-area-inset-left));
  }

  .filter-bar {
    gap: 12px !important;
  }

  .filter-bar :deep(.n-space-item) {
    width: 100%;
  }

  .filter-select--exam,
  .filter-select--difficulty,
  .filter-search,
  .filter-action-btn {
    width: 100%;
  }

  .vocabulary-grid {
    min-height: 0;
  }

  .word-header {
    gap: 8px;
    align-items: flex-start;
  }

  .word-card :deep(.n-card__content) {
    padding: 14px 14px 12px;
  }

  .detail-modal {
    width: min(600px, calc(100vw - 24px));
  }

  .detail-actions {
    width: 100%;
    gap: 10px !important;
  }

  .detail-actions :deep(.n-space-item) {
    flex: 1 1 0;
  }
}

@media (max-width: 480px) {
  .vocabulary-view {
    padding: 10px 10px calc(16px + env(safe-area-inset-bottom));
    padding-right: max(10px, env(safe-area-inset-right));
    padding-left: max(10px, env(safe-area-inset-left));
  }

  .pagination {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .pagination :deep(.n-pagination) {
    flex-wrap: nowrap;
  }

  .word-card :deep(.n-card__content) {
    padding: 12px;
  }

  .detail-header {
    align-items: flex-start;
    gap: 10px;
  }

  .detail-header h2 {
    font-size: 24px;
  }

  .detail-actions {
    gap: 10px !important;
  }

  .detail-actions :deep(.n-space-item) {
    width: 100%;
  }

  .detail-actions :deep(.n-button) {
    width: 100%;
    min-height: 44px;
  }

  .detail-modal {
    width: calc(100vw - 20px);
  }

  .detail-modal :deep(.n-card__content) {
    max-height: min(72svh, 560px);
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}

@media (max-width: 360px) {
  .word-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .word-header h3 {
    font-size: 18px;
  }

  .detail-header h2 {
    font-size: 21px;
  }

  .word-card :deep(.n-card__content) {
    padding: 10px;
  }

  .word-translation,
  .detail-section p {
    font-size: 13px;
    line-height: 1.6;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .vocabulary-view {
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }

  .vocabulary-grid {
    margin: 18px 0;
  }

  .detail-modal :deep(.n-card__content) {
    max-height: min(68svh, 520px);
    overflow-y: auto;
  }
}
</style>
