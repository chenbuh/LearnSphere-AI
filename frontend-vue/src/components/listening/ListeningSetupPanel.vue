<script setup>
import { NButton, NCard, NDivider, NGrid, NGridItem, NPagination, NTag } from 'naive-ui'
import {
  Book,
  BookOpen,
  Clock,
  Globe,
  GraduationCap,
  History,
  Layers,
  MessageCircle,
  Mic,
  Rocket,
  RotateCcw,
  Target
} from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  counts: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  speeds: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  historyTotal: {
    type: Number,
    default: 0
  },
  paginatedHistory: {
    type: Array,
    default: () => []
  },
  historyPage: {
    type: Number,
    default: 1
  },
  historyPageSize: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits([
  'clear-state',
  'set-setting',
  'generate',
  'load-material',
  'update:history-page',
  'update:history-page-size'
])

const getExamTypeIcon = (value) => {
  if (value === 'ted') return Mic
  if (value === 'bbc') return Globe
  if (value === 'dialog') return MessageCircle
  if (value === 'toefl') return GraduationCap
  if (value === 'ielts') return BookOpen
  return Book
}

const normalizedHistoryTitle = (item) => {
  if (item?.title && /[:]\d{2}[:]\d{2}/.test(item.title)) {
    return 'Listening Practice'
  }
  return item?.title
}

const updateSetting = (key, value) => {
  emit('set-setting', { key, value })
}
</script>

<template>
  <div class="setup-container">
    <n-card class="setup-card" :bordered="false" size="huge">
      <template #header>
        <div class="setup-header">
          <span>{{ props.translate('练耳空间 · 英语听力训练', 'Listening Lab · English Listening Practice') }}</span>
          <n-button size="tiny" quaternary @click="emit('clear-state')">
            <template #icon><n-icon :component="RotateCcw" /></template>
            {{ props.translate('重置练习状态', 'Reset Practice State') }}
          </n-button>
        </div>
      </template>

      <div class="setting-section">
        <h3><n-icon :component="Target" color="#6366f1" /> {{ props.translate('听力来源', 'Listening Source') }}</h3>
        <div class="grid-options source-grid">
          <div
            v-for="examType in props.examTypes"
            :key="examType.value"
            class="option-card"
            :class="{ active: props.settings.examType === examType.value }"
            @click="updateSetting('examType', examType.value)"
          >
            <div class="icon-box">
              <n-icon :component="getExamTypeIcon(examType.value)" />
            </div>
            <span class="option-label">{{ examType.label }}</span>
          </div>
        </div>
      </div>

      <div class="settings-box">
        <n-grid x-gap="40" y-gap="24" cols="1 800:3">
          <n-grid-item>
            <div class="setting-sub-section">
              <h4><n-icon :component="Layers" size="16" /> {{ props.translate('篇章数量', 'Passage Count') }}</h4>
              <div class="pill-options">
                <div
                  v-for="count in props.counts"
                  :key="count.value"
                  class="pill-option"
                  :class="{ active: props.settings.count === count.value }"
                  @click="updateSetting('count', count.value)"
                >
                  {{ count.label }}
                </div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="setting-sub-section">
              <h4><n-icon :component="Target" size="16" /> {{ props.translate('难度等级', 'Difficulty') }}</h4>
              <div class="pill-options">
                <div
                  v-for="difficulty in props.difficulties"
                  :key="difficulty.value"
                  class="pill-option"
                  :class="{ active: props.settings.difficulty === difficulty.value }"
                  @click="updateSetting('difficulty', difficulty.value)"
                >
                  {{ difficulty.label }}
                </div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="setting-sub-section">
              <h4><n-icon :component="Clock" size="16" /> {{ props.translate('语速控制', 'Playback Speed') }}</h4>
              <div class="pill-options">
                <div
                  v-for="speed in props.speeds"
                  :key="speed.value"
                  class="pill-option"
                  :class="{ active: props.settings.speed === speed.value }"
                  @click="updateSetting('speed', speed.value)"
                >
                  {{ speed.label }}
                </div>
              </div>
            </div>
          </n-grid-item>
        </n-grid>

        <n-divider style="margin: 24px 0; opacity: 0.1" />

        <n-button
          type="primary"
          size="large"
          block
          round
          class="start-btn"
          :loading="props.isLoading"
          @click="emit('generate')"
          color="#6366f1"
        >
          <template #icon><n-icon :component="Rocket" /></template>
          {{ props.translate('生成听力材料', 'Generate Listening Materials') }}
        </n-button>
      </div>
    </n-card>

    <div v-if="props.historyTotal > 0" class="history-section mt-12">
      <div class="section-title">
        <n-icon :component="History" /> {{ props.translate('最近生成', 'Recent Materials') }}
      </div>
      <n-grid x-gap="20" y-gap="20" cols="1 600:2 900:3">
        <n-grid-item v-for="item in props.paginatedHistory" :key="item.id">
          <n-card class="history-card-item" hoverable @click="emit('load-material', item)">
            <template #header>
              <n-tag size="small" :bordered="false" type="info" class="mb-2">{{ item.type }}</n-tag>
              <div class="history-title">{{ normalizedHistoryTitle(item) }}</div>
            </template>
            <template #footer>
              <div class="history-footer">
                <n-tag size="tiny" :bordered="false" :type="item.difficulty === 'fast' ? 'error' : 'success'">
                  {{ item.difficulty }}
                </n-tag>
                <span class="word-count">{{ Array.isArray(item.questions) ? item.questions.length : 0 }} {{ props.translate('题', 'questions') }}</span>
              </div>
            </template>
          </n-card>
        </n-grid-item>
      </n-grid>

      <div class="pagination-wrapper mt-8">
        <n-pagination
          :page="props.historyPage"
          :item-count="props.historyTotal"
          :page-size="props.historyPageSize"
          show-size-picker
          :page-sizes="[6, 12, 18]"
          @update:page="emit('update:history-page', $event)"
          @update:page-size="emit('update:history-page-size', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.setup-container {
  max-width: 1200px;
  margin: 0 auto;
}

.setup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setup-card {
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.setup-card :deep(.n-card) {
  background-color: var(--card-bg) !important;
  border: 1px solid var(--card-border) !important;
  color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
  color: var(--text-color);
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-color);
  font-weight: 700;
}

.grid-options.source-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.option-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: var(--theme-transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  aspect-ratio: 1;
}

.option-card:hover {
  background: var(--accent-fill);
  transform: translateY(-4px);
}

.option-card.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  color: var(--text-color);
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
}

.icon-box {
  font-size: 2.5rem;
  margin-bottom: 12px;
  color: #c4b5fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-card.active .icon-box {
  color: #fff;
}

.option-label {
  font-weight: 600;
  font-size: 1rem;
}

.settings-box {
  background: var(--accent-fill);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--card-border);
}

.setting-sub-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--secondary-text);
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pill-option {
  flex: 1;
  min-width: 80px;
  text-align: center;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: var(--theme-transition);
}

.pill-option:hover {
  background: var(--accent-fill);
}

.pill-option.active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
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
  color: var(--text-color);
}

.history-card-item {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
  height: 100%;
}

.history-card-item:hover {
  transform: translateY(-4px);
  border-color: #6366f1;
  background: var(--accent-fill);
}

.history-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  height: 2.8em;
  color: var(--text-color);
}

.history-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
}

.word-count {
  font-size: 0.85rem;
  color: var(--secondary-text);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
