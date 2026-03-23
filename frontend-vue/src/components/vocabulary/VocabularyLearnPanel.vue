<script setup>
import { computed } from 'vue'
import VocabularyLearnResultPanel from '@/components/vocabulary/VocabularyLearnResultPanel.vue'
import VocabularyLearnSessionPanel from '@/components/vocabulary/VocabularyLearnSessionPanel.vue'
import VocabularyLearnStartPanel from '@/components/vocabulary/VocabularyLearnStartPanel.vue'
import { getExamTypeLabel } from '@/constants/examTypes'

const props = defineProps({
  selectedExam: {
    type: String,
    default: 'cet4'
  },
  examOptions: {
    type: Array,
    default: () => []
  },
  sessionWords: {
    type: Array,
    default: () => []
  },
  sessionIndex: {
    type: Number,
    default: 0
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  sessionComplete: {
    type: Boolean,
    default: false
  },
  sessionStats: {
    type: Object,
    default: () => ({ correct: 0, wrong: 0 })
  },
  currentLearnWord: {
    type: Object,
    default: null
  },
  mnemonicText: {
    type: String,
    default: ''
  },
  mnemonicLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:selected-exam',
  'start-session',
  'flip-card',
  'play-audio',
  'get-mnemonic',
  'open-ai-tutor',
  'handle-result'
])

const selectedExamLabel = computed(() => (
  getExamTypeLabel(props.selectedExam, '未选择')
))
</script>

<template>
  <div class="learn-container">
    <section class="learn-main">
      <VocabularyLearnStartPanel
        v-if="sessionWords.length === 0 && !sessionComplete"
        :selected-exam="selectedExam"
        :exam-options="examOptions"
        @update:selected-exam="emit('update:selected-exam', $event)"
        @start-session="emit('start-session')"
      />

      <VocabularyLearnSessionPanel
        v-else-if="!sessionComplete"
        :selected-exam="selectedExam"
        :session-words="sessionWords"
        :session-index="sessionIndex"
        :is-flipped="isFlipped"
        :current-learn-word="currentLearnWord"
        :mnemonic-text="mnemonicText"
        :mnemonic-loading="mnemonicLoading"
        @flip-card="emit('flip-card')"
        @play-audio="emit('play-audio', $event)"
        @get-mnemonic="emit('get-mnemonic')"
        @open-ai-tutor="emit('open-ai-tutor')"
        @handle-result="emit('handle-result', $event)"
      />

      <VocabularyLearnResultPanel
        v-else
        :session-stats="sessionStats"
        @start-session="emit('start-session')"
      />
    </section>

    <aside class="learn-rail">
      <div class="rail-card">
        <span class="rail-kicker">学习概览</span>
        <h3>本轮学习</h3>
        <p>当前词库、本轮题数和掌握进度会在这里同步更新。</p>
      </div>

      <div class="rail-card">
        <div class="rail-metric">
          <span>词库</span>
          <strong>{{ selectedExamLabel }}</strong>
        </div>
        <div class="rail-metric">
          <span>本轮题数</span>
          <strong>{{ sessionWords.length || 15 }}</strong>
        </div>
        <div class="rail-metric">
          <span>已掌握</span>
          <strong>{{ sessionStats.correct }}</strong>
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.learn-container {
  width: 100%;
  padding: 8px 0 0;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) 280px;
  gap: 20px;
  align-items: start;
  min-height: 0;
}

.learn-main,
.rail-card {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.32), rgba(15, 23, 42, 0.18)),
    rgba(15, 23, 42, 0.16);
}

.learn-main {
  padding: 18px;
}

.learn-rail {
  display: grid;
  gap: 16px;
  align-content: start;
}

.rail-card {
  padding: 18px;
}

.rail-kicker {
  display: inline-block;
  margin-bottom: 10px;
  color: #fdba74;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.rail-card h3 {
  margin: 0 0 10px;
  color: var(--text-color);
  font-size: 1.08rem;
}

.rail-card p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.rail-metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.rail-metric:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.rail-metric span {
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-metric strong {
  color: var(--text-color);
}

@media (max-width: 1000px) {
  .learn-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .learn-container {
    padding: 6px 0 4px;
  }

  .learn-main,
  .rail-card {
    border-radius: 18px;
  }

  .learn-main {
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .learn-main {
    padding: 12px;
  }
}

@media (min-width: 901px) {
  :global(html[data-theme='light'] .learn-main),
  :global(html[data-theme='light'] .rail-card) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 40px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .rail-card:first-child) {
    background:
      radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 38%),
      linear-gradient(180deg, rgba(248, 250, 255, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .rail-metric) {
    border-bottom-color: rgba(226, 232, 240, 0.9);
  }
}
</style>
