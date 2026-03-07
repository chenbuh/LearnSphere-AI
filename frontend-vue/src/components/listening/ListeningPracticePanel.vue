<script setup>
import { computed } from 'vue'
import { NButton, NCard, NSpace } from 'naive-ui'
import { Clock, PlayCircle, StopCircle } from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  isPlaying: {
    type: Boolean,
    default: false
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  hasAudioMetadata: {
    type: Boolean,
    default: false
  },
  audioProgressPercent: {
    type: Number,
    default: 0
  },
  audioProgress: {
    type: Number,
    default: 0
  },
  audioDuration: {
    type: Number,
    default: 0
  },
  formatAudioTime: {
    type: Function,
    required: true
  },
  currentGlobalIndex: {
    type: Number,
    default: 0
  },
  currentQuestion: {
    type: Object,
    default: null
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  currentQuestionInPassage: {
    type: Number,
    default: 0
  },
  totalQuestionsCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-audio', 'select-answer', 'prev-question', 'next-or-submit'])

const selectedAnswer = computed(() => {
  return props.answersPerPassage?.[props.currentPassageIndex]?.[props.currentQuestionInPassage]
})
</script>

<template>
  <div class="practice-panel">
    <div class="audio-block" @click="emit('toggle-audio')">
      <div class="playback-controls">
        <div class="play-btn">
          <n-icon :component="props.isPlaying ? StopCircle : PlayCircle" size="48" />
        </div>
        <div class="playback-visualizer" :class="{ isPlaying: props.isPlaying }">
          <div v-for="i in 8" :key="i" class="bar"></div>
        </div>
      </div>

      <div class="audio-info">
        <h4>{{ props.isPlaying ? props.translate('音频播放中...', 'Audio playing...') : props.translate('点击播放当前篇章音频', 'Click to play the current passage audio') }}</h4>
        <p>{{ props.translate('Passage', 'Passage') }} {{ props.currentPassageIndex + 1 }} {{ props.translate('正在朗读', 'is being read aloud') }}</p>

        <div v-if="props.hasAudioMetadata || props.isPlaying" class="audio-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${props.audioProgressPercent}%` }"></div>
          </div>
          <div class="time-display">
            <span class="current-time">{{ props.formatAudioTime(props.audioProgress) }}</span>
            <span class="separator">/</span>
            <span class="total-time">{{ props.formatAudioTime(props.audioDuration) }}</span>
          </div>
        </div>

        <div v-else class="audio-hint">
          <n-icon :component="Clock" size="14" />
          <span>{{ props.translate('时长待加载', 'Duration pending') }}</span>
        </div>
      </div>
    </div>

    <n-card class="question-card" :bordered="false">
      <div class="question-header">
        <span class="q-num">Question {{ props.currentGlobalIndex + 1 }}</span>
        <h3>{{ props.currentQuestion?.question || props.currentQuestion?.text || props.translate('题目内容加载失败', 'Failed to load question content') }}</h3>
      </div>
      <div class="options-grid">
        <div
          v-for="(option, idx) in props.currentQuestion?.options"
          :key="idx"
          class="option-item"
          :class="{ selected: selectedAnswer === idx }"
          @click="emit('select-answer', props.currentQuestionInPassage, idx)"
        >
          <span class="option-idx">{{ String.fromCharCode(65 + idx) }}</span>
          <span class="option-text">{{ option }}</span>
        </div>
      </div>
      <div class="nav-actions">
        <n-space justify="space-between" style="width: 100%">
          <n-button secondary @click="emit('prev-question')" :disabled="props.currentGlobalIndex === 0">
            {{ props.translate('上一题', 'Previous') }}
          </n-button>
          <n-button type="primary" @click="emit('next-or-submit')">
            {{ props.currentGlobalIndex === props.totalQuestionsCount - 1 ? props.translate('提交试卷', 'Submit') : props.translate('下一题', 'Next') }}
          </n-button>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.practice-panel {
  display: flex;
  flex-direction: column;
}

.audio-block {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  margin-bottom: 24px;
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.audio-block:hover {
  transform: translateY(-2px);
  border-color: #6366f1;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.playback-visualizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 32px;
  width: 40px;
}

.playback-visualizer .bar {
  width: 4px;
  background: #6366f1;
  border-radius: 2px;
  height: 10%;
  transition: height 0.3s;
}

.playback-visualizer.isPlaying .bar {
  animation: wave 1s infinite ease-in-out;
}

@keyframes wave {
  0%, 100% {
    height: 10%;
  }

  50% {
    height: 100%;
  }
}

.playback-visualizer .bar:nth-child(2n) {
  animation-delay: 0.2s;
}

.playback-visualizer .bar:nth-child(3n) {
  animation-delay: 0.4s;
}

.audio-info {
  flex: 1;
}

.audio-info h4 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.audio-info p {
  margin: 4px 0 8px;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.audio-progress {
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--secondary-text);
  font-family: monospace;
}

.current-time {
  color: #6366f1;
  font-weight: 600;
}

.separator {
  color: var(--secondary-text);
  opacity: 0.5;
}

.audio-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--secondary-text);
  opacity: 0.7;
}

.question-card {
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.q-num {
  color: #6366f1;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.question-header h3 {
  font-size: 1.5rem;
  margin-top: 8px;
  line-height: 1.4;
  color: var(--text-color);
}

.options-grid {
  display: grid;
  gap: 12px;
  margin: 32px 0;
}

.option-item {
  padding: 16px 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: var(--theme-transition);
}

.option-item:hover {
  background: var(--accent-fill);
}

.option-item.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.option-idx {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-fill);
  border-radius: 50%;
  font-weight: 700;
  color: var(--secondary-text);
}

.option-item.selected .option-idx {
  background: #6366f1;
  color: #fff;
}

.option-text {
  color: var(--text-color);
}

.nav-actions {
  margin-top: 24px;
}
</style>
