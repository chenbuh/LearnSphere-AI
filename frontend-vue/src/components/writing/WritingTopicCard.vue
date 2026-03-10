<template>
  <n-card class="topic-card" :bordered="false">
    <div class="topic-header">
      <n-tag type="warning" round ghost>{{ settings.examType?.toUpperCase() }} Task</n-tag>
      <span class="word-req">建议字数: {{ selectedTopic?.minWords || 150 }}+</span>
    </div>
    <h2>{{ selectedTopic?.title }}</h2>
    <div class="topic-prompt-fancy" @click="isPromptTyping ? emit('prompt-skip') : null">
      <div class="prompt-decoration"></div>
      <div class="prompt-content">
        {{ displayedPrompt }}
        <span v-if="isPromptTyping" class="typing-cursor">_</span>
      </div>
    </div>
    <div class="topic-tips secure-content">
      <div class="flex items-center gap-2 mb-2 text-indigo-400 font-bold">
        <n-icon :component="BookOpen" /> 核心要点 / Hints
      </div>
      <ul class="fancy-list">
        <li v-for="(tip, idx) in selectedTopic?.tips || []" :key="idx">{{ tip }}</li>
      </ul>
    </div>
  </n-card>
</template>

<script setup>
import { NCard, NIcon, NTag } from 'naive-ui'
import { BookOpen } from 'lucide-vue-next'

defineProps({
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

const emit = defineEmits(['prompt-skip'])
</script>

<style scoped>
.topic-card {
  border-radius: 16px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.topic-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.word-req {
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-family: monospace;
}

.topic-card h2 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  line-height: 1.4;
  color: var(--text-color);
}

.topic-tips {
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.topic-tips ul {
  margin-top: 4px;
  padding-left: 20px;
}

.topic-prompt-fancy {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  border: 1px solid var(--card-border);
  cursor: pointer;
  overflow: hidden;
  transition: var(--theme-transition);
}

.prompt-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #6366f1, #a855f7);
}

.typing-cursor {
  display: inline-block;
  color: #6366f1;
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
  list-style: none;
  padding: 0;
}

.fancy-list li {
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 0.85rem;
  color: var(--secondary-text);
}

.fancy-list li::before {
  content: '→';
  margin-right: 8px;
  color: #6366f1;
}
</style>