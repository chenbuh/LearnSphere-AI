<script setup>
import { ArrowRight } from 'lucide-vue-next'
import { NButton, NIcon, NTag } from 'naive-ui'
import AudioPlayer from '@/components/AudioPlayer.vue'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  currentAudioLesson: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'view-all',
  'speed-change',
  'position-change',
  'bookmark-add',
  'note-add',
  'select-answer'
])
</script>

<template>
  <section class="listening-section">
    <div class="section-header">
      <h2 class="section-title">听力练习</h2>
      <n-button text @click="emit('view-all')">
        全部课程
        <template #icon>
          <n-icon :component="ArrowRight" size="16" />
        </template>
      </n-button>
    </div>

    <SkeletonWrapper v-if="currentAudioLesson" :loading="loading" type="audio-player">
      <AudioPlayer
        :src="currentAudioLesson.url"
        :audio-text="currentAudioLesson.script || currentAudioLesson.title"
        :initial-speed="1.0"
        @speed-change="emit('speed-change', $event)"
        @position-change="emit('position-change', $event)"
        @bookmark-add="emit('bookmark-add', $event)"
        @note-add="emit('note-add', $event)"
      />
    </SkeletonWrapper>

    <div v-else-if="!loading" class="empty-state">
      今天可用的不重复听力素材已经取完
    </div>

    <div v-if="currentAudioLesson?.questions" class="listening-questions">
      <div
        v-for="(question, index) in currentAudioLesson.questions"
        :key="index"
        class="question-item"
      >
        <div class="question-header">
          <span class="question-number">题目 {{ index + 1 }}</span>
          <n-tag v-if="question.answered" :type="question.correct ? 'success' : 'error'">
            {{ question.correct ? '正确' : '错误' }}
          </n-tag>
        </div>
        <div class="question-content">{{ question.question }}</div>
        <div class="question-options">
          <div
            v-for="(option, optIndex) in question.options"
            :key="optIndex"
            :class="['question-option', {
              selected: question.userAnswer === optIndex,
              correct: question.answered && question.correctAnswer === optIndex,
              wrong: question.answered && question.userAnswer === optIndex && !question.correct
            }]"
            @click="emit('select-answer', index, optIndex)"
          >
            {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
}

.listening-questions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-state {
  padding: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9ca3af;
  text-align: center;
}

.question-item {
  padding: 20px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
}

.question-content {
  margin-bottom: 16px;
  font-size: 16px;
  color: #e5e7eb;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-option {
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  color: #d1d5db;
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-option:hover {
  border-color: rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.08);
}

.question-option.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}

.question-option.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.12);
}

.question-option.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
</style>
