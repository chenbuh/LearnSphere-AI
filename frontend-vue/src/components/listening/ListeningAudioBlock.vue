<script setup>
import { NIcon } from 'naive-ui'
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
  isMobileLayout: {
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
  }
})

const emit = defineEmits(['toggle-audio'])
</script>

<template>
  <div class="audio-block" :class="{ 'audio-block--mobile': props.isMobileLayout }" @click="emit('toggle-audio')">
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
</template>

<style scoped>
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
  0%, 100% { height: 10%; }
  50% { height: 100%; }
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

@media (max-width: 900px) {
  .audio-block {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    padding: 18px;
    border-radius: 18px;
    margin-bottom: 0;
  }

  .playback-controls {
    justify-content: space-between;
  }

  .play-btn {
    width: 72px;
    height: 72px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(168, 85, 247, 0.18));
    flex-shrink: 0;
  }

  .audio-info h4 {
    font-size: 1rem;
    line-height: 1.45;
  }

  .audio-info p {
    margin: 6px 0 10px;
    font-size: 0.85rem;
    line-height: 1.5;
  }

  .time-display {
    justify-content: space-between;
    gap: 10px;
  }
}
</style>
