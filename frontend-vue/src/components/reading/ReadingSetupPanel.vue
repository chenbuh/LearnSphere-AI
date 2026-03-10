<template>
  <div class="setup-container">
    <n-card class="setup-card" :bordered="false" size="huge">
      <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
        <n-grid-item span="2">
          <div class="setting-section">
            <h3><n-icon :component="BookOpen" color="#6366f1" /> 阅读来源</h3>
            <div class="grid-options source-grid">
              <div
                v-for="src in sources"
                :key="src.value"
                class="option-card"
                :class="{ active: settings.source === src.value }"
                @click="emit('update-setting', 'source', src.value)"
              >
                <span class="option-icon">{{ src.icon }}</span>
                <span class="option-label">{{ src.label }}</span>
              </div>
            </div>
          </div>

          <div class="setting-section">
            <h3><n-icon :component="Target" color="#a855f7" /> 文章题材</h3>
            <div class="grid-options category-grid">
              <div
                v-for="cat in categories"
                :key="cat.value"
                class="option-card"
                :class="{ active: settings.category === cat.value }"
                @click="emit('update-setting', 'category', cat.value)"
              >
                <div class="option-icon">
                  <n-icon :component="cat.icon" />
                </div>
                <div class="option-label">{{ cat.label }}</div>
                <div class="option-desc">{{ cat.desc }}</div>
              </div>
            </div>
          </div>
        </n-grid-item>

        <n-grid-item>
          <div class="side-settings">
            <div class="setting-section">
              <h3><n-icon :component="Brain" color="#eab308" /> 难度等级</h3>
              <div class="pill-options">
                <div
                  v-for="diff in difficulties"
                  :key="diff.value"
                  class="pill-option"
                  :class="{ active: settings.difficulty === diff.value }"
                  @click="emit('update-setting', 'difficulty', diff.value)"
                >
                  {{ diff.label }}
                </div>
              </div>
            </div>

            <div class="setting-section">
              <h3><n-icon :component="FileText" color="#10b981" /> 文章篇幅</h3>
              <div class="pill-options">
                <div
                  v-for="len in lengths"
                  :key="len.value"
                  class="pill-option"
                  :class="{ active: settings.length === len.value }"
                  @click="emit('update-setting', 'length', len.value)"
                >
                  {{ len.label }}
                </div>
              </div>
            </div>

            <n-divider />

            <n-button
              type="primary"
              size="large"
              block
              round
              class="start-btn"
              :loading="isLoading"
              @click="emit('generate')"
            >
              <template #icon><n-icon :component="Rocket" /></template>
              生成阅读任务
            </n-button>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <ReadingHistoryPanel
      :items="items"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :calculate-word-count="calculateWordCount"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:page-size', $event)"
    />
  </div>
</template>

<script setup>
import { NButton, NCard, NDivider, NGrid, NGridItem, NIcon } from 'naive-ui'
import { BookOpen, Brain, FileText, Rocket, Target } from 'lucide-vue-next'
import ReadingHistoryPanel from '@/components/reading/ReadingHistoryPanel.vue'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  sources: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  lengths: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  calculateWordCount: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update-setting', 'generate', 'select', 'update:page', 'update:page-size'])
</script>

<style scoped>
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
}

.grid-options {
  display: grid;
  gap: 16px;
}

.source-grid,
.category-grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}

.option-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.option-card:hover {
  background: var(--accent-fill);
  transform: translateY(-2px);
}

.option-card.active {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
}

.option-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-label {
  font-weight: 600;
  font-size: 0.95rem;
}

.option-desc {
  font-size: 0.7rem;
  color: var(--secondary-text);
  margin-top: 4px;
  opacity: 0.8;
}

.side-settings {
  background: var(--accent-fill);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill-option {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: var(--theme-transition);
}

.pill-option.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>