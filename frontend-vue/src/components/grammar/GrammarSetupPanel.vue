<script setup>
import { NGrid, NGridItem, NIcon, NPagination, NTag } from 'naive-ui'
import { CheckCircle2, History } from 'lucide-vue-next'

const props = defineProps({
  grammarTopics: {
    type: Array,
    default: () => []
  },
  selectedTopic: {
    type: Number,
    default: 0
  },
  historyTotal: {
    type: Number,
    default: 0
  },
  historyPage: {
    type: Number,
    default: 1
  },
  historyPageSize: {
    type: Number,
    default: 6
  },
  paginatedHistory: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select-topic', 'load-history', 'update:history-page', 'update:history-page-size'])
</script>

<template>
  <div class="setup-panel">
    <div class="topics-grid-container">
      <n-grid x-gap="20" y-gap="20" cols="1 800:2 1200:3" responsive="screen">
        <n-grid-item v-for="topic in props.grammarTopics" :key="topic.id">
          <div
            class="topic-card"
            :class="{ active: props.selectedTopic === topic.id }"
            @click="$emit('select-topic', topic.id)"
          >
            <div class="card-top">
              <div class="icon-box" :style="{ backgroundColor: topic.bg, color: topic.color }">
                <n-icon :component="topic.icon" size="24" />
              </div>
              <div v-if="props.selectedTopic === topic.id" class="check-icon">
                <n-icon :component="CheckCircle2" color="#ec4899" />
              </div>
            </div>
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.desc }}</p>
            <div class="card-footer">
              <n-tag size="small" round :bordered="false" type="default">
                {{ topic.count }} Questions
              </n-tag>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
    </div>

    <div v-if="props.historyTotal > 0" class="history-section mt-12">
      <div class="section-title">
        <n-icon :component="History" /> 最近生成练习
      </div>
      <n-grid x-gap="20" y-gap="20" cols="1 600:2 1200:3">
        <n-grid-item v-for="exercise in props.paginatedHistory" :key="exercise.id">
          <div class="history-card" @click="$emit('load-history', exercise)">
            <div class="history-card-header">
              <n-tag size="small" type="warning" :bordered="false">{{ exercise.topic || 'Grammar' }}</n-tag>
              <n-tag size="tiny" :bordered="false">{{ exercise.difficulty || 'medium' }}</n-tag>
            </div>
            <div class="history-card-body">
              <span class="question-count">{{ exercise.questions?.length || 0 }} 题</span>
            </div>
          </div>
        </n-grid-item>
      </n-grid>
      <div class="pagination-wrapper mt-6">
        <n-pagination
          :page="props.historyPage"
          :item-count="props.historyTotal"
          :page-size="props.historyPageSize"
          show-size-picker
          :page-sizes="[6, 12, 18]"
          @update:page="$emit('update:history-page', $event)"
          @update:page-size="$emit('update:history-page-size', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.topics-grid-container {
  padding-bottom: 20px;
}

.topic-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: var(--theme-transition);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topic-card:hover {
  background: var(--accent-fill);
  transform: translateY(-2px);
}

.topic-card.active {
  border-color: #db2777;
  background: rgba(219, 39, 119, 0.1);
  box-shadow: 0 0 0 1px #db2777;
}

.card-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.icon-box {
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topic-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-color);
}

.topic-card p {
  font-size: 0.9rem;
  color: var(--secondary-text);
  line-height: 1.4;
  flex-grow: 1;
}

.card-footer {
  margin-top: 16px;
}

.history-section {
  margin-top: 48px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #e4e4e7;
}

.history-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
}

.history-card:hover {
  background: var(--accent-fill);
  transform: translateY(-2px);
  border-color: #db2777;
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-card-body {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.question-count {
  font-weight: 600;
  color: var(--text-color);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .topics-grid-container .n-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)) !important;
    gap: 12px !important;
  }

  .topic-card {
    padding: 12px !important;
    border-radius: 12px !important;
    min-height: 100px !important;
  }

  .topic-card h3 {
    font-size: 0.95rem !important;
    margin-bottom: 4px !important;
    line-height: 1.3 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .topic-card p {
    font-size: 0.75rem !important;
    line-height: 1.2 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
  }

  .card-top {
    margin-bottom: 8px !important;
  }

  .icon-box {
    padding: 6px !important;
  }

  .history-card {
    padding: 14px !important;
  }
}

@media (max-width: 480px) {
  .topic-card {
    padding: 12px !important;
    min-height: 110px !important;
  }

  .topic-card h3 {
    font-size: 1rem !important;
    line-height: 1.3 !important;
  }

  .topic-card p {
    font-size: 0.8rem !important;
    line-height: 1.4 !important;
  }

  .history-card {
    padding: 12px !important;
  }
}

@media (max-width: 360px) {
  .topic-card {
    padding: 10px !important;
    min-height: 95px !important;
  }

  .topic-card h3 {
    font-size: 0.95rem !important;
  }

  .topic-card p {
    font-size: 0.75rem !important;
  }
}
</style>
