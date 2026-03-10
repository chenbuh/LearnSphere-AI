<template>
  <div class="vocabulary-view">
    <n-card title="📚 词汇学习" class="main-card">
      
      <!-- 筛选和搜索 -->
      <n-space class="filter-bar" align="center">
        <n-select
          v-model:value="filters.examType"
          :options="examOptions"
          style="width: 200px"
          @update:value="loadVocabulary"
        />
        <n-select
          v-model:value="filters.difficulty"
          :options="difficultyOptions"
          style="width: 150px"
          placeholder="难度"
          clearable
          @update:value="loadVocabulary"
        />
        <n-input
          v-model:value="filters.keyword"
          placeholder="搜索单词..."
          clearable
          @update:value="handleSearch"
        >
          <template #prefix>
            <Search :size="16" />
          </template>
        </n-input>
        <n-button type="primary" @click="loadDailyWords">
          每日单词
        </n-button>
      </n-space>

      <!-- 词汇列表 -->
      <n-spin :show="loading">
        <n-grid :cols="3" :x-gap="16" :y-gap="16" class="vocabulary-grid">
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
        style="width: 600px"
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
          
          <n-space>
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

const message = useMessage()
const { playAudio: playTextAudio } = useTextAudio({
  notifyWarning: (content) => message.warning(content)
})

// 筛选条件
const filters = reactive({
  examType: 'cet4',
  difficulty: null,
  keyword: ''
})

// 考试类型选项
const examOptions = [
  { label: '大学英语四级 (CET-4)', value: 'cet4' },
  { label: '大学英语六级 (CET-6)', value: 'cet6' },
  { label: '雅思 (IELTS)', value: 'ielts' },
  { label: '托福 (TOEFL)', value: 'toefl' },
  { label: 'GRE', value: 'gre' }
]

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
      timeSpent: 0,
      score: 100,
      answer: word.word,
      correctAnswer: word.word,
      masteryLevel: 5
    })
    message.success('已标记为掌握')
    showDetail.value = false
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
      timeSpent: 0,
      score: 0,
      answer: '',
      correctAnswer: word.word,
      masteryLevel: 1
    })
    message.success('已加入复习列表')
    showDetail.value = false
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
}

.main-card {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-bar {
  margin-bottom: 24px;
}

.vocabulary-grid {
  margin: 24px 0;
  min-height: 400px;
}

.word-card {
  cursor: pointer;
  transition: all 0.3s;
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
}

.word-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.word-phonetic {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.word-translation {
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.word-detail {
  padding: 16px 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detail-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.detail-phonetic {
  color: #666;
  font-size: 16px;
  margin-bottom: 16px;
}

.detail-section {
  margin: 16px 0;
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
}

.example-en {
  font-style: italic;
  color: #333;
  margin-bottom: 4px;
}

.example-cn {
  color: #666;
}
</style>
