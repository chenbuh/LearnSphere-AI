<template>
  <div class="weakness-analysis">
    <n-card title="Learning Weakness Analysis">
      <template #header-extra>
        <n-button @click="refreshData" size="small" circle>
          <template #icon>
            <n-icon :component="RefreshCw" />
          </template>
        </n-button>
      </template>

      <div v-if="reviewSuggestions.length > 0" class="section">
        <h3>Priority Review Suggestions</h3>
        <div class="suggestions-grid">
          <n-card
            v-for="item in reviewSuggestions"
            :key="item.id"
            class="suggestion-card"
            hoverable
          >
            <div class="suggestion-header">
              <n-tag :type="getPriorityType(item.reviewPriority)" size="small">
                Priority {{ item.reviewPriority }}/10
              </n-tag>
              <n-tag type="warning" size="small">
                Accuracy {{ item.accuracy }}%
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
              <span>Practice {{ item.totalCount }} times</span>
              <span>Errors {{ item.errorCount }} times</span>
            </div>

            <div v-if="item.aiSuggestion" class="ai-suggestion">
              <n-icon :component="Lightbulb" color="#f59e0b" />
              <p>{{ item.aiSuggestion }}</p>
            </div>

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
                Related Topics
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
                AI Advice
              </n-button>
            </div>
          </n-card>
        </div>
      </div>

      <div class="section">
        <n-tabs type="line" animated>
          <n-tab-pane name="needsReview" tab="Needs Review">
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
                  <span>Last practice: {{ formatDate(item.lastPracticeTime) }}</span>
                </div>
              </div>
            </div>
          </n-tab-pane>

          <n-tab-pane name="all" tab="All">
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
                  <span>Accuracy: {{ item.accuracy }}%</span>
                  <span>Practice: {{ item.totalCount }} times</span>
                </div>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-card>

    <n-modal
      v-model:show="showRelatedModal"
      preset="card"
      title="Related Topics"
      class="related-topics-modal"
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
              Difficulty: {{ topic.difficultyLevel }}/5
            </n-tag>
          </div>
          <p>{{ topic.description }}</p>
          <div v-if="topic.prerequisiteTopics" class="prerequisites">
            <strong>Prerequisites:</strong> {{ topic.prerequisiteTopics }}
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

async function refreshData() {
  try {
    const suggestions = await aiApi.getReviewSuggestions(5)
    if (suggestions.code === 200) {
      reviewSuggestions.value = suggestions.data || []
    }

    const needsReview = await aiApi.getUserWeaknesses(true)
    if (needsReview.code === 200) {
      needsReviewList.value = needsReview.data || []
    }

    const all = await aiApi.getUserWeaknesses(null)
    if (all.code === 200) {
      allWeaknesses.value = all.data || []
    }
  } catch (error) {
    console.error('Failed to load weakness data:', error)
    message.error('Failed to load weakness data')
  }
}

function getPriorityType(priority) {
  if (priority >= 8) return 'error'
  if (priority >= 5) return 'warning'
  return 'info'
}

function getProgressColor(accuracy) {
  if (accuracy >= 80) return '#10b981'
  if (accuracy >= 60) return '#f59e0b'
  return '#ef4444'
}

async function viewRelatedTopics(topic) {
  try {
    const res = await aiApi.getRelatedTopics(topic)
    if (res.code === 200) {
      relatedTopics.value = res.data || []
      showRelatedModal.value = true
    }
  } catch (error) {
    console.error('Failed to load related topics:', error)
    message.error('Failed to load related topics')
  }
}

async function getLearningAdvice(topic) {
  try {
    loadingAdvice.value[topic] = true
    const res = await aiApi.getLearningAdvice(topic)
    if (res.code === 200) {
      const item = reviewSuggestions.value.find(i => i.topic === topic)
      if (item) {
        item.aiSuggestion = res.data
      }
      message.success('Learning advice generated')
    }
  } catch (error) {
    console.error('Failed to generate advice:', error)
    message.error('Failed to generate learning advice')
  } finally {
    loadingAdvice.value[topic] = false
  }
}

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
  min-width: 0;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.suggestion-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  min-width: 0;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.suggestion-card h4 {
  font-size: 16px;
  margin: 8px 0;
  color: #f9fafb;
  line-height: 1.45;
  word-break: break-word;
}

.stats {
  display: flex;
  justify-content: space-between;
  gap: 8px 14px;
  flex-wrap: wrap;
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
  flex-wrap: wrap;
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
  min-width: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.topic {
  font-weight: 600;
  color: #f9fafb;
  min-width: 0;
  word-break: break-word;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  gap: 6px 12px;
  flex-wrap: wrap;
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
  min-width: 0;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.related-item h4 {
  margin: 0;
  color: #f9fafb;
  min-width: 0;
  word-break: break-word;
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

:deep(.related-topics-modal .n-card) {
  width: min(600px, calc(100vw - 24px)) !important;
  max-width: calc(100vw - 24px) !important;
}

@media (max-width: 768px) {
  .weakness-analysis {
    padding: 14px 10px 20px;
  }

  .section {
    margin-bottom: 24px;
  }

  .section h3 {
    margin-bottom: 14px;
  }
}

@media (max-width: 480px) {
  .weakness-analysis {
    padding: 10px 6px 16px;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .suggestion-card,
  .weakness-item,
  .related-item {
    border-radius: 14px;
  }

  .suggestion-card h4,
  .related-item h4 {
    font-size: 15px;
  }

  .stats,
  .item-footer,
  .topic-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .actions > * {
    width: 100%;
  }

  .item-header {
    align-items: flex-start;
  }

  :deep(.n-tabs-nav-scroll-content) {
    width: 100%;
  }

  :deep(.n-tabs-tab) {
    flex: 1 1 0;
    justify-content: center;
  }

  :deep(.related-topics-modal .n-card) {
    width: min(600px, calc(100vw - 16px)) !important;
    max-width: calc(100vw - 16px) !important;
    border-radius: 18px !important;
  }

  :deep(.related-topics-modal .n-card__content) {
    padding: 14px 12px !important;
  }
}

@media (max-width: 360px) {
  .weakness-analysis {
    padding-right: max(4px, env(safe-area-inset-right));
    padding-left: max(4px, env(safe-area-inset-left));
  }

  .section h3 {
    font-size: 16px;
  }

  .suggestion-card h4,
  .topic,
  .related-item h4 {
    font-size: 14px;
  }

  .ai-suggestion,
  .related-item,
  .weakness-item {
    padding: 12px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .weakness-analysis {
    padding-bottom: 12px;
  }

  .section {
    margin-bottom: 20px;
  }
}
</style>
