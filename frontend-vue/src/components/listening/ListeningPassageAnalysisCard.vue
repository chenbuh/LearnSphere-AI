<script setup>
import { NButton, NCard, NDivider, NIcon, NTag } from 'naive-ui'
import { BookOpen, Brain, CheckCircle2, MessageCircle, XCircle } from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  passage: {
    type: Object,
    required: true
  },
  passageIndex: {
    type: Number,
    default: 0
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  getGlobalNum: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['open-ai-tutor'])
</script>

<template>
  <div class="passage-analysis-card">
    <n-card :title="`${translate('篇章', 'Passage')} ${passageIndex + 1}: ${passage.title}`" class="mb-6" style="border-radius: 16px;">
      <div class="script-box">
        <h4><n-icon :component="BookOpen" /> {{ translate('听力原文', 'Listening Transcript') }}</h4>
        <p class="script-text">{{ passage.script }}</p>
      </div>

      <n-divider title-placement="left">{{ translate('题目深度解析', 'In-Depth Question Analysis') }}</n-divider>

      <div class="analysis-questions">
        <div v-for="(question, questionIndex) in passage.questions" :key="questionIndex" class="analysis-q-item">
          <div class="q-header">
            <n-tag :type="answersPerPassage[passageIndex]?.[questionIndex] === question.correct ? 'success' : 'error'" size="small" round>
              {{ translate('题目', 'Question') }} {{ getGlobalNum(passageIndex, questionIndex) }}
            </n-tag>
            <span class="q-text">{{ question.question || question.text }}</span>
          </div>

          <div class="analysis-options">
            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="opt-item"
              :class="{
                correct: optionIndex === question.correct,
                wrong: optionIndex === answersPerPassage[passageIndex]?.[questionIndex] && optionIndex !== question.correct
              }"
            >
              <span class="opt-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
              <span class="opt-content">{{ option }}</span>
              <n-icon v-if="optionIndex === question.correct" :component="CheckCircle2" class="status-icon" color="#10b981" />
              <n-icon
                v-if="optionIndex === answersPerPassage[passageIndex]?.[questionIndex] && optionIndex !== question.correct"
                :component="XCircle"
                class="status-icon"
                color="#ef4444"
              />
            </div>
          </div>

          <div class="explanation-box">
            <div class="exp-title-row">
              <div class="exp-title">
                <n-icon :component="Brain" /> {{ translate('专家解析', 'Expert Explanation') }}
              </div>
              <n-button size="tiny" secondary type="primary" @click="emit('open-ai-tutor', { passageIndex, questionIndex })">
                <template #icon><n-icon :component="MessageCircle" /></template>
                {{ translate('问问 AI 助手', 'Ask AI Tutor') }}
              </n-button>
            </div>
            <p>{{ question.explanation || translate('该题目暂无详细解析内容，请根据原文理解。', 'No detailed explanation is available yet. Please refer to the transcript.') }}</p>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.passage-analysis-card {
  margin-bottom: 24px;
}

.script-box {
  background: var(--accent-fill);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  margin-bottom: 24px;
}

.script-box h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  color: #6366f1;
}

.script-text {
  line-height: 1.8;
  color: var(--text-color);
  font-size: 1.05rem;
  white-space: pre-wrap;
}

.analysis-q-item {
  background: var(--card-bg);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  margin-bottom: 20px;
}

.q-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.q-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.4;
}

.analysis-options {
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
}

.opt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--card-border);
  background: var(--accent-fill);
  position: relative;
}

.opt-item.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.opt-item.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.opt-label {
  font-weight: 700;
  color: var(--secondary-text);
  width: 24px;
}

.opt-content {
  flex: 1;
  color: var(--text-color);
}

.status-icon {
  font-size: 1.2rem;
}

.explanation-box {
  background: rgba(99, 102, 241, 0.05);
  border-left: 4px solid #6366f1;
  padding: 16px;
  border-radius: 0 8px 8px 0;
}

.exp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #6366f1;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.exp-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.explanation-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--secondary-text);
}
</style>
