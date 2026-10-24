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
  <div
    class="audio-block"
    :class="{ 'audio-block--mobile': props.isMobileLayout, 'is-playing': props.isPlaying }"
    @click="emit('toggle-audio')"
  >
    <div class="playback-controls">
      <div class="play-btn" :class="{ 'is-playing': props.isPlaying }">
        <n-icon :component="props.isPlaying ? StopCircle : PlayCircle" size="44" />
      </div>
      <div class="playback-visualizer" :class="{ isPlaying: props.isPlaying }">
        <div v-for="i in 8" :key="i" class="bar"></div>
      </div>
    </div>

    <div class="audio-info">
      <h4>
        {{
          props.isPlaying
            ? props.translate('音频播放中...', 'Audio playing...')
            : props.translate('点击播放当前篇章音频', 'Click to play the current passage audio')
        }}
      </h4>
      <p>
        {{ props.translate('Passage', 'Passage') }} {{ props.currentPassageIndex + 1 }}
        {{ props.translate('正在朗读', 'is being read aloud') }}
      </p>

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
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  cursor: pointer;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.audio-block:hover {
  transform: translateY(-2px);
  border-color: rgba(251, 146, 60, 0.35);
}

.audio-block.is-playing {
  border-color: rgba(30, 107, 82, 0.45);
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.3);
  color: var(--brand);
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.play-btn:hover {
  transform: scale(1.05);
  /* 深色主题专用浅蓝在浅色主题仅 1.6:1，改语义蓝色令牌 */
  color: var(--tone-blue);
}

.play-btn.is-playing {
  background: var(--card-bg);
  border-color: rgba(251, 146, 60, 0.4);
  color: var(--tone-orange);
  animation: play-pulse 2s infinite ease-in-out;
}

@keyframes play-pulse {
  0%,
  100% {
    border-color: rgba(251, 146, 60, 0.4);
  }
  50% {
    border-color: rgba(251, 146, 60, 0.8);
  }
}

.playback-visualizer {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 32px;
  width: 44px;
}

.playback-visualizer .bar {
  width: 4px;
  background: rgba(148, 163, 184, 0.3);
  border-radius: 2px;
  height: 15%;
  transition:
    height 0.3s,
    background 0.3s;
}

.playback-visualizer.isPlaying .bar {
  background: var(--brand);
  animation: wave 1s infinite ease-in-out;
}

@keyframes wave {
  0%,
  100% {
    height: 15%;
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
  font-size: 1.12rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.audio-info p {
  margin: 4px 0 8px;
  font-size: 0.88rem;
  color: var(--secondary-text);
}

.audio-progress {
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 9999px;
  transition: width 0.1s linear;
}

.time-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.4);
  font-size: 0.82rem;
  color: var(--secondary-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.current-time {
  color: var(--brand);
  font-weight: 700;
}

.separator {
  color: var(--secondary-text);
}

.total-time {
  color: var(--secondary-text);
}

.audio-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .audio-block) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .audio-info h4) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .audio-info p),
:global(html[data-theme='light'] .audio-hint) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .progress-bar) {
  background: rgba(226, 232, 240, 0.8);
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .time-display) {
  background: rgba(241, 245, 249, 0.8);
}

@media (max-width: 900px) {
  .audio-block {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;
    padding: 18px;
    border-radius: var(--radius-lg);
    margin-bottom: 0;
  }

  .playback-controls {
    justify-content: space-between;
  }

  .play-btn {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-lg);
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
