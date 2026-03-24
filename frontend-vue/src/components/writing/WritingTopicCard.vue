<template>
  <section class="topic-card">
    <div class="topic-header">
      <div class="topic-meta">
        <n-tag type="warning" round ghost>{{ examTypeLabel }}</n-tag>
        <span class="word-req">建议字数: {{ selectedTopic?.minWords || 150 }}+</span>
      </div>
      <span class="topic-state">{{ isPromptTyping ? '题目展开中' : '题目已就绪' }}</span>
    </div>
    <h2>{{ selectedTopic?.title }}</h2>

    <div class="topic-prompt-fancy" @click="isPromptTyping ? emit('prompt-skip') : null">
      <div class="prompt-decoration"></div>
      <div class="prompt-content">
        {{ displayedPrompt }}
        <span v-if="isPromptTyping" class="typing-cursor">_</span>
      </div>
    </div>

    <div v-if="selectedTopic?.tips?.length" class="topic-tips secure-content">
      <div class="tips-header">
        <n-icon :component="BookOpen" /> 审题要点
      </div>
      <ul class="fancy-list">
        <li v-for="(tip, idx) in selectedTopic?.tips || []" :key="idx">
          <span class="tip-index">{{ String(idx + 1).padStart(2, '0') }}</span>
          <span>{{ tip }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { NIcon, NTag } from 'naive-ui'
import { BookOpen } from 'lucide-vue-next'
import { computed } from 'vue'
import { getExamTypeLabel } from '@/constants/examTypes'

const emit = defineEmits(['prompt-skip'])
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
  }
})

const examTypeLabel = computed(() => (
  getExamTypeLabel(props.settings.examType, '未选择')
))
</script>

<style scoped>
.topic-card {
  display: grid;
  gap: 16px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.topic-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.topic-state {
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.word-req {
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
}

.topic-card h2 {
  font-size: 1.42rem;
  margin: 0;
  line-height: 1.4;
  color: var(--text-color);
}

.topic-tips {
  display: grid;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #fb923c;
  font-weight: 700;
}

.topic-prompt-fancy {
  min-height: 0;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.24)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 40%);
  border-radius: 24px;
  padding: 24px 28px;
  position: relative;
  border: 1px solid rgba(148, 163, 184, 0.12);
  cursor: pointer;
  overflow: hidden;
}

.prompt-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #fb923c, #f97316);
}

.prompt-content {
  position: relative;
  z-index: 1;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.85;
  max-width: 76ch;
  white-space: pre-wrap;
}

.typing-cursor {
  display: inline-block;
  color: #fb923c;
  animation: blink 0.8s infinite;
  margin-left: 2px;
  font-weight: bold;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.fancy-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.fancy-list li {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  font-size: 0.85rem;
  color: var(--secondary-text);
  line-height: 1.55;
}

.tip-index {
  color: #fb923c;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-family: 'JetBrains Mono', monospace;
}

:global(html[data-theme='light'] .topic-card),
:global(html[data-theme='light'] .topic-tips) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .topic-prompt-fancy) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.1), transparent 40%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .word-req),
:global(html[data-theme='light'] .topic-state),
:global(html[data-theme='light'] .fancy-list li) {
  color: #475569;
}

@media (max-width: 900px) {
  .topic-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .topic-card h2 {
    font-size: 1.08rem;
  }

  .topic-tips {
    padding-top: 14px;
  }

  .topic-prompt-fancy {
    min-height: 0;
    padding: 18px 16px 18px 20px;
    border-radius: 18px;
  }

  .fancy-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .topic-card {
    gap: 12px;
    padding-bottom: 16px;
  }

  .topic-meta {
    gap: 8px;
  }

  .topic-state,
  .word-req {
    font-size: 0.74rem;
  }

  .topic-card h2 {
    font-size: 1rem;
  }

  .topic-prompt-fancy {
    padding: 14px 12px 14px 16px;
    border-radius: 16px;
  }

  .prompt-content {
    font-size: 0.9rem;
    line-height: 1.68;
  }

  .topic-tips {
    gap: 10px;
    padding-top: 12px;
    font-size: 0.82rem;
  }

  .fancy-list li {
    gap: 10px;
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .topic-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .prompt-content {
    font-size: 0.86rem;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .topic-card {
    padding-bottom: 12px;
  }
}
</style>

