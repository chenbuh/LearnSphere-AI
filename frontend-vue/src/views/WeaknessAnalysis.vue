<template>
  <div class="weakness-analysis">
    <n-card title="📊 学习薄弱点分析">
      <template #header-extra>
        <n-button @click="refreshData" size="small" circle>
          <template #icon>
            <n-icon :component="RefreshCw" />
          </template>
        </n-button>
      </template>

      <!-- 复习建议卡片 -->
      <div v-if="reviewSuggestions.length > 0" class="section">
        <h3>🎯 优先复习建议</h3>
        <div class="suggestions-grid">
          <n-card
            v-for="item in reviewSuggestions"
            :key="item.id"
            class="suggestion-card"
            hoverable
          >
            <div class="suggestion-header">
              <n-tag :type="getP riorityType(item.reviewPriority)" size="small">
                优先级: {{ item.reviewPriority }}/10
              </n-tag>
              <n-tag type="warning" size="small">
                正确率: {{ item.accuracy }}%
              </n-tag>
            </div>

            <h4>{{ item.topic }}</h4>
            <n-progress
              :percentage="item.accuracy"
              :color="getProgressColor(item.accuracy)"
              :height="8"
              :border-radius="4"
            />

            <div class="stats">
              <span>练习 {{ item.totalCount }} 次</span>
              <span>错误 {{ item.errorCount }} 次</span>
            </div>

            <!-- AI 学习建议 -->
            <div v-if="item.aiSuggestion" class="ai-suggestion">
              <n-icon :component="Lightbulb" color="#f59e0b" />
              <p>{{ item.aiSuggestion }}</p>
            </div>

            <!-- 相关知识点 -->
            <div class="actions">
              <n-button
                @click="viewRelatedTopics(item.topic)"
                size="small"
                type="primary"
                ghost
              >
                <template #icon>
                  <n-icon :component="Network" />
                </template>
                相关知识点
              </n-button>
              <n-button
                @click="getLearningAdvice(item.topic)"
                size="small"
                type="success"
                ghost
                :loading="loadingAdvice[item.topic]"
              >
                <template #icon>
                  <n-icon :component="Sparkles" />
                </template>
                AI 建议
              </n-button>
            </div>
          </n-card>
        </div>
      </div>

      <!-- 所有薄弱点列表 -->
      <div class="section">
        <n-tabs type="line" animated>
          <n-tab-pane name="needsReview" tab="需要复习">
            <div class="weakness-list">
              <div
                v-for="item in needsReviewList"
                :key="item.id"
                class="weakness-item"
              >
                <div class="item-header">
                  <span class="topic">{{ item.topic }}</span>
                  <n-tag size="small">{{ item.category }}</n-tag>
                </div>
                <n-progress
                  :percentage="item.accuracy"
                  :color="getProgressColor(item.accuracy)"
                />
                <div class="item-footer">
                  <span>最近练习: {{ formatDate(item.lastPracticeTime) }}</span>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="all" tab="全部">
            <div class="weakness-list">
              <div
                v-for="item in allWeaknesses"
                :key="item.id"
                class="weakness-item"
              >
                <div class="item-header">
                  <span class="topic">{{ item.topic }}</span>
                  <n-tag size="small">{{ item.category }}</n-tag>
                </div>
                <n-progress
                  :percentage="item.accuracy"
                  :color="getProgressColor(item.accuracy)"
                />
                <div class="item-footer">
                  <span>正确率: {{ item.accuracy }}%</span>
                  <span>练习: {{ item.totalCount }} 次</span>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-card>

    <!-- 相关知识点 Modal -->
    <n-modal
      v-model:show="showRelatedModal"
      preset="card"
      title="📚 相关知识点"
      style="width: 600px"
    >
      <div class="related-topics">
        <div
          v-for="topic in relatedTopics"
          :key="topic.id"
          class="related-item"
        >
          <div class="topic-header">
            <h4>{{ topic.topic }}</h4>
            <n-tag size="small" type="info">
              难度: {{ topic.difficultyLevel }}/5
            </n-tag>
          </div>
          <p>{{ topic.description }}</p>
          <div v-if="topic.prerequisiteTopics" class="prerequisites">
            <strong>前置知识:</strong> {{ topic.prerequisiteTopics }}
          </div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  NCard,
  NButton,
  NIcon,
  NTag,
  NProgress,
  NTabs,
  NTabPane,
  NModal,
  useMessage
} from 'naive-ui'
import {
  RefreshCw,
  Lightbulb,
  Network,
  Sparkles
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'

const message = useMessage()

const reviewSuggestions = ref([])
const needsReviewList = ref([])
const allWeaknesses = ref([])
const relatedTopics = ref([])
const showRelatedModal = ref(false)
const loadingAdvice = ref({})

// 获取数据
async function refreshData() {
  try {
    // 获取复习建议
    const suggestions = await aiApi.getReviewSuggestions(5)
    if (suggestions.code === 200) {
      reviewSuggestions.value = suggestions.data || []
    }

    // 获取需要复习的薄弱点
    const needsReview = await aiApi.getUserWeaknesses(true)
    if (needsReview.code === 200) {
      needsReviewList.value = needsReview.data || []
    }

    // 获取所有薄弱点
    const all = await aiApi.getUserWeaknesses(null)
    if (all.code === 200) {
      allWeaknesses.value = all.data || []
    }
  } catch (error) {
    console.error('Failed to load weakness data:', error)
    message.error('加载数据失败')
  }
}

// 获取优先级类型
function getPriorityType(priority) {
  if (priority >= 8) return 'error'
  if (priority >= 5) return 'warning'
  return 'info'
}

// 获取进度条颜色
function getProgressColor(accuracy) {
  if (accuracy >= 80) return '#10b981'
  if (accuracy >= 60) return '#f59e0b'
  return '#ef4444'
}

// 查看相关知识点
async function viewRelatedTopics(topic) {
  try {
    const res = await aiApi.getRelatedTopics(topic)
    if (res.code === 200) {
      relatedTopics.value = res.data || []
      showRelatedModal.value = true
    }
  } catch (error) {
    console.error('Failed to load related topics:', error)
    message.error('加载相关知识点失败')
  }
}

// 获取 AI 学习建议
async function getLearningAdvice(topic) {
  try {
    loadingAdvice.value[topic] = true
    const res = await aiApi.getLearningAdvice(topic)
    if (res.code === 200) {
      // 更新对应项的 AI 建议
      const item = reviewSuggestions.value.find(i => i.topic === topic)
      if (item) {
        item.aiSuggestion = res.data
      }
      message.success('已生成学习建议')
    }
  } catch (error) {
    console.error('Failed to generate advice:', error)
    message.error('生成学习建议失败')
  } finally {
    loadingAdvice.value[topic] = false
  }
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.weakness-analysis {
  padding: 20px;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #f9fafb;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.suggestion-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.suggestion-card h4 {
  font-size: 16px;
  margin: 8px 0;
  color: #f9fafb;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 13px;
  color: #9ca3af;
}

.ai-suggestion {
  background: rgba(245, 158, 11, 0.1);
  border-left: 3px solid #f59e0b;
  padding: 12px;
  margin: 12px 0;
  border-radius: 4px;
  display: flex;
  gap: 8px;
}

.ai-suggestion p {
  margin: 0;
  font-size: 13px;
  color: #d1d5db;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.weakness-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.weakness-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.topic {
  font-weight: 600;
  color: #f9fafb;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.related-topics {
  display: grid;
  gap: 16px;
}

.related-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.related-item h4 {
  margin: 0;
  color: #f9fafb;
}

.related-item p {
  margin: 8px 0;
  color: #d1d5db;
  font-size: 14px;
}

.prerequisites {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: #9ca3af;
}
</style>
