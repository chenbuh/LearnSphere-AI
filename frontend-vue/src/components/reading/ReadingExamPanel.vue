<template>
  <div class="reading-container">
    <div class="back-button-container mb-6">
      <n-button secondary @click="emit('restart')">
        <template #icon>
          <n-icon :component="RotateCcw" />
        </template>
        返回设置
      </n-button>
    </div>

    <div class="reading-layout-container">
      <div class="sidebar">
        <div class="sticky-nav">
          <n-card class="nav-card mb-4" :bordered="false" title="题目导航" size="small">
            <div class="question-grid">
              <n-button
                v-for="(q, index) in article.questions"
                :key="index"
                circle
                class="nav-btn"
                :class="{ current: currentQuestionIndex === index, answered: answers[index] != null && currentQuestionIndex !== index }"
                :type="currentQuestionIndex === index ? 'primary' : (answers[index] != null ? 'success' : 'default')"
                :secondary="currentQuestionIndex !== index"
                @click="emit('update:current-question-index', index)"
              >
                {{ index + 1 }}
              </n-button>
            </div>
          </n-card>

          <div class="progress-card p-4">
            <div class="text-xs text-gray-400 mb-2 flex justify-between">
              <span>完成进度</span>
              <span>{{ Math.round(progressPercent) }}%</span>
            </div>
            <n-progress
              type="line"
              :percentage="progressPercent"
              :show-indicator="false"
              color="#10b981"
              rail-color="#3f3f46"
              :height="6"
            />
          </div>
        </div>
      </div>

      <div class="main-content-area">
        <n-card class="question-card" :bordered="false" size="large">
          <div class="article-header">
            <n-tag type="success" size="small">{{ settings.category.toUpperCase() }}</n-tag>
            <h2>{{ article.title }}</h2>
            <p class="meta">
              <span>{{ article.source }}</span>
              <span class="separator">•</span>
              <span><n-icon :component="Clock" size="14" /> {{ realWordCount }} 词</span>
            </p>
          </div>

          <n-divider />

          <div class="article-content secure-content" @click="isTyping ? emit('skip-typing') : null">
            <p v-for="(para, idx) in displayedText.split('\n')" :key="idx">
              {{ para }}
            </p>
            <div v-if="isTyping" class="typing-cursor"></div>
          </div>

          <n-divider />

          <div class="question-content">
            <h3 class="q-text">
              <span class="q-num">Q{{ currentQuestionIndex + 1 }}</span>
              {{ currentQuestion?.text }}
            </h3>

            <div class="options-container">
              <n-grid x-gap="20" y-gap="20" cols="1">
                <n-grid-item v-for="(option, idx) in currentQuestion?.options || []" :key="idx">
                  <div
                    class="answer-option"
                    :class="{ selected: answers[currentQuestionIndex] === idx }"
                    @click="emit('select-answer', idx)"
                  >
                    <span class="option-index">{{ ['A', 'B', 'C', 'D'][idx] }}</span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                </n-grid-item>
              </n-grid>
            </div>
          </div>

          <div class="actions-footer">
            <n-button v-if="currentQuestionIndex > 0" secondary @click="emit('prev-question')" class="mr-4">上一题</n-button>
            <n-button v-if="currentQuestionIndex < article.questions.length - 1" type="primary" @click="emit('next-question')">下一题</n-button>
            <n-button v-else type="success" @click="emit('submit')">提交答案</n-button>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NCard, NDivider, NGrid, NGridItem, NIcon, NProgress, NTag } from 'naive-ui'
import { Clock, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  displayedText: {
    type: String,
    default: ''
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  answers: {
    type: Array,
    default: () => []
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  realWordCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['restart', 'update:current-question-index', 'skip-typing', 'select-answer', 'prev-question', 'next-question', 'submit'])

const currentQuestion = computed(() => props.article?.questions?.[props.currentQuestionIndex] ?? null)
</script>

<style scoped>
.reading-layout-container {
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

.main-content-area {
  flex: 1;
  min-width: 0;
}

.back-button-container {
  margin-bottom: 24px;
}

.nav-card {
  border-radius: 16px;
  margin-bottom: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.progress-card {
  border: 1px solid var(--card-border);
  border-radius: 12px;
  background: var(--card-bg);
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.nav-btn {
  font-weight: bold;
  width: 36px;
  height: 36px;
  margin: 0 auto;
}

.question-card {
  border-radius: 24px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
}

.article-header h2 {
  font-size: 2rem;
  margin: 12px 0;
  color: var(--text-color);
  line-height: 1.4;
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.separator {
  opacity: 0.5;
}

.article-content {
  max-height: 45vh;
  overflow-y: auto;
  padding-right: 10px;
}

.article-content p {
  font-size: 1.05rem;
  line-height: 2;
  color: var(--text-color);
  margin-bottom: 1.5em;
}

.question-content {
  margin-top: 32px;
}

.q-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 24px;
}

.q-num {
  display: inline-flex;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  margin-right: 12px;
}

.answer-option {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: var(--theme-transition);
}

.answer-option:hover {
  background: var(--accent-fill);
}

.answer-option.selected {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

.option-index {
  width: 32px;
  height: 32px;
  background: var(--accent-fill);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-weight: 700;
  color: var(--secondary-text);
}

.answer-option.selected .option-index {
  background: #10b981;
  color: white;
}

.option-text {
  font-size: 1.05rem;
  color: var(--text-color);
}

.actions-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding: 0 20px 20px;
}

.typing-cursor {
  display: inline-block;
  width: 10px;
  height: 18px;
  background-color: #10b981;
  animation: blink 0.8s infinite;
  vertical-align: middle;
  margin-left: 4px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.article-content::-webkit-scrollbar { width: 6px; }
.article-content::-webkit-scrollbar-track { background: transparent; }
.article-content::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
.article-content::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

@media (max-width: 768px) {
  .reading-layout-container {
    flex-direction: column !important;
  }

  .sidebar {
    width: 100% !important;
    order: -1;
    margin-bottom: 20px;
  }

  .sticky-nav {
    position: static;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>