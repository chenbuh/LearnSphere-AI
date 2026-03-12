<template>
  <div class="writing-container" :class="{ 'focus-mode': isFocusMode }">
    <WritingEditorToolbar
      :is-focus-mode="isFocusMode"
      :show-draft-saved="showDraftSaved"
      @restart="emit('restart')"
      @toggle-focus="emit('toggle-focus')"
    />

    <div class="writing-layout-container">
      <aside v-if="!isFocusMode" class="sidebar">
        <div class="sticky-nav">
          <n-card class="nav-card" :bordered="false" title="写作控制台" size="small">
            <div class="meta-stack">
              <div class="meta-row">
                <span>考试类型</span>
                <strong>{{ settings.examType?.toUpperCase() || 'N/A' }}</strong>
              </div>
              <div class="meta-row">
                <span>题型</span>
                <strong>{{ settings.mode || 'N/A' }}</strong>
              </div>
              <div class="meta-row">
                <span>建议字数</span>
                <strong>{{ minWordsTarget }}+</strong>
              </div>
              <div class="meta-row" v-if="settings.timeLimit > 0">
                <span>剩余时间</span>
                <strong :class="{ danger: timeLeft < 60 }">{{ timeLeftDisplay }}</strong>
              </div>
            </div>

            <n-divider />

            <div class="progress-card">
              <div class="progress-label">
                <span>完成进度</span>
                <span>{{ Math.round(progressPercent) }}%</span>
              </div>
              <n-progress
                type="line"
                :percentage="progressPercent"
                :show-indicator="false"
                color="#f97316"
                rail-color="#3f3f46"
                :height="6"
              />
            </div>

            <div class="stat-grid">
              <div class="stat-item">
                <span class="stat-label">WORDS</span>
                <span class="stat-value">{{ wordCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">HINTS</span>
                <span class="stat-value">{{ tipsCount }}</span>
              </div>
            </div>

            <n-button
              type="primary"
              size="large"
              block
              class="submit-btn"
              :loading="isLoading"
              :disabled="wordCount < 10"
              @click="emit('submit')"
            >
              提交 AI 深度分析
            </n-button>
          </n-card>
        </div>
      </aside>

      <div class="main-content-area">
        <n-card class="workspace-card" :bordered="false" size="large">
          <WritingTopicCard
            v-if="selectedTopic"
            :settings="settings"
            :selected-topic="selectedTopic"
            :displayed-prompt="displayedPrompt"
            :is-prompt-typing="isPromptTyping"
            @prompt-skip="emit('prompt-skip')"
          />

          <n-divider v-if="selectedTopic" />

          <WritingEditorCard
            class="editor-shell"
            :settings="settings"
            :essay-content="essayContent"
            :word-count="wordCount"
            :time-left="timeLeft"
            :time-left-display="timeLeftDisplay"
            :is-loading="isLoading"
            @update:essay-content="emit('update:essay-content', $event)"
            @submit="emit('submit')"
          />
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NCard, NDivider, NProgress } from 'naive-ui'
import WritingEditorCard from '@/components/writing/WritingEditorCard.vue'
import WritingEditorToolbar from '@/components/writing/WritingEditorToolbar.vue'
import WritingTopicCard from '@/components/writing/WritingTopicCard.vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  selectedTopic: {
    type: Object,
    default: null
  },
  displayedPrompt: {
    type: String,
    default: ''
  },
  isPromptTyping: {
    type: Boolean,
    default: false
  },
  isFocusMode: {
    type: Boolean,
    default: false
  },
  showDraftSaved: {
    type: Boolean,
    default: false
  },
  essayContent: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  timeLeft: {
    type: Number,
    default: 0
  },
  timeLeftDisplay: {
    type: String,
    default: '00:00'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['restart', 'toggle-focus', 'prompt-skip', 'update:essay-content', 'submit'])

const minWordsTarget = computed(() => Number(props.selectedTopic?.minWords || 150))
const tipsCount = computed(() => props.selectedTopic?.tips?.length || 0)
const progressPercent = computed(() => {
  if (!minWordsTarget.value) {
    return 0
  }
  return Math.min((props.wordCount / minWordsTarget.value) * 100, 100)
})
</script>

<style scoped>
.writing-layout-container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sticky-nav {
  position: sticky;
  top: 100px;
}

.nav-card,
.workspace-card {
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.main-content-area {
  flex: 1;
  min-width: 0;
}

.meta-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: var(--secondary-text);
  font-size: 0.92rem;
}

.meta-row strong {
  color: var(--text-color);
}

.meta-row .danger {
  color: #ef4444;
}

.progress-card {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  padding: 14px;
  border-radius: 14px;
  background: var(--accent-fill);
  border: 1px solid var(--card-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 0.68rem;
  color: var(--secondary-text);
  letter-spacing: 1px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-color);
  font-family: 'JetBrains Mono', monospace;
}

.submit-btn {
  height: 48px;
  font-weight: 700;
  border-radius: 14px;
}

.writing-container.focus-mode .editor-shell {
  max-width: none;
}

.workspace-card :deep(.n-card__content) {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (max-width: 768px) {
  .writing-layout-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    order: -1;
  }

  .sticky-nav {
    position: static;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>
