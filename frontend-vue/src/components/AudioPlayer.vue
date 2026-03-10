<template>
  <div class="audio-player-enhanced">
    <!-- 音频波形可视化 -->
    <div class="waveform-visual">
      <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
      <div v-if="!isPlaying" class="play-overlay" @click="togglePlay">
        <n-icon :component="Play" size="48" color="#10b981" />
      </div>
    </div>

    <!-- 播放进度 -->
    <div class="progress-section">
      <div v-if="isTTSMode && !isPlaying" class="tts-badge">
        <n-icon :component="Volume2" size="12" />
        <span>本地语音合成模式</span>
      </div>

      <div class="progress-bar-container" ref="progressBar">
        <div
          class="progress-played"
          :style="{ width: progressPercentage + '%' }"
        >
          <div class="progress-handle"></div>
        </div>
      </div>

      <div class="time-display">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="divider">/</span>
        <span class="duration">{{ isTTSMode ? formatTime(duration) + ' (估算)' : formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 控制区 -->
    <div class="controls-section">
      <div class="speed-control">
        <n-dropdown
          :options="speedOptions"
          @select="handleSpeedChange"
          trigger="click"
        >
          <n-button size="small" quaternary>
            <template #icon>
              <n-icon :component="Gauge" size="18" />
            </template>
            {{ playbackSpeed }}x
          </n-button>
        </n-dropdown>
      </div>

      <div class="main-controls">
        <n-button
          size="medium"
          quaternary
          circle
          @click="seekBackward"
          title="后退 10 秒"
        >
          <template #icon>
            <n-icon :component="RotateCcw" size="20" />
          </template>
        </n-button>

        <n-button
          size="large"
          :type="isPlaying ? 'warning' : 'primary'"
          circle
          @click="togglePlay"
        >
          <template #icon>
            <n-icon :component="isPlaying ? Pause : Play" size="24" />
          </template>
        </n-button>

        <n-button
          size="medium"
          quaternary
          circle
          @click="seekForward"
          title="前进 10 秒"
        >
          <template #icon>
            <n-icon :component="RotateCw" size="20" />
          </template>
        </n-button>
      </div>

      <div class="auxiliary-controls">
        <n-tooltip>
          <template #trigger>
            <n-button
              size="small"
              quaternary
              @click="addBookmark"
              title="添加书签"
            >
              <template #icon>
                <n-icon :component="Bookmark" size="18" />
              </template>
            </n-button>
          </template>
          添加书签
        </n-tooltip>

        <n-tooltip>
          <template #trigger>
            <n-button
              size="small"
              quaternary
              @click="showNoteInput = true"
              title="添加笔记"
            >
              <template #icon>
                <n-icon :component="StickyNote" size="18" />
              </template>
            </n-button>
          </template>
          添加笔记
        </n-tooltip>

        <n-tooltip>
          <template #trigger>
            <n-button
              size="small"
              quaternary
              :type="isLooping ? 'primary' : 'default'"
              @click="toggleLoop"
              title="循环播放"
            >
              <template #icon>
                <n-icon :component="Repeat" size="18" />
              </template>
            </n-button>
          </template>
          循环播放
        </n-tooltip>
      </div>
    </div>

    <!-- 书签列表 -->
    <transition name="slide-down">
      <div v-if="bookmarks.length > 0" class="bookmarks-list">
        <div class="bookmarks-header">
          <n-icon :component="Bookmark" size="14" />
          <span>书签 ({{ bookmarks.length }})</span>
        </div>
        <div class="bookmarks-items">
          <div
            v-for="(bookmark, index) in bookmarks"
            :key="index"
            class="bookmark-item"
          >
            <span class="bookmark-time">{{ formatTime(bookmark.time) }}</span>
            <span class="bookmark-note">{{ bookmark.note || '无备注' }}</span>
            <n-button
              size="tiny"
              quaternary
              type="primary"
              @click="seekTo(bookmark.time)"
            >
              跳转
            </n-button>
            <n-button
              size="tiny"
              quaternary
              type="error"
              @click="removeBookmark(index)"
            >
              <template #icon>
                <n-icon :component="X" size="12" />
              </template>
            </n-button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 笔记输入 -->
    <n-modal v-model:show="showNoteInput" preset="dialog" title="添加笔记">
      <n-input
        v-model:value="noteContent"
        type="textarea"
        placeholder="请输入笔记内容..."
        :autosize="{ minRows: 3, maxRows: 5 }"
      />
      <template #action>
        <n-button @click="showNoteInput = false">取消</n-button>
        <n-button type="primary" @click="saveNote">保存</n-button>
      </template>
    </n-modal>

    <!-- 学习统计 -->
    <div class="learning-stats">
      <div class="stat-item">
        <n-icon :component="Headphones" size="14" color="#60a5fa" />
        <span>已播放 {{ listenCount }} 次</span>
      </div>
      <div class="stat-item">
        <n-icon :component="Clock" size="14" color="#fbbf24" />
        <span>总收听 {{ totalListenTime }} 分钟</span>
      </div>
    </div>

    <audio
      v-if="src"
      ref="audioRef"
      :src="src"
      :loop="isLooping"
      @loadedmetadata="handleLoadedMetadata"
      @timeupdate="handleTimeUpdate"
      @ended="handleEnded"
      @play="handlePlay"
      @pause="handlePause"
      @error="handleError"
    ></audio>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  NButton, NIcon, NTooltip, NDropdown, NModal, NInput, useMessage
} from 'naive-ui'
import {
  Play, Pause, RotateCcw, RotateCw, Gauge, Bookmark,
  StickyNote, Repeat, X, Headphones, Clock, Volume2
} from 'lucide-vue-next'
import logger from '@/utils/logger'
import { useTextAudio } from '@/composables/useTextAudio'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  audioText: {
    type: String,
    default: ''
  },
  fallbackDuration: {
    type: Number,
    default: 0
  },
  initialSpeed: {
    type: Number,
    default: 1.0
  }
})

const emit = defineEmits(['speed-change', 'position-change', 'bookmark-add', 'note-add'])

const message = useMessage()
const { playAudio: playTextAudio, stopAudio: stopTextAudio } = useTextAudio({
  logger,
  notifyWarning: () => {}
})

const audioRef = ref(null)

const isPlaying = ref(false)
const isAudioBroken = ref(!props.src)
const currentTime = ref(0)
const duration = ref(0)
const playbackSpeed = ref(props.initialSpeed)
const isLooping = ref(false)
const isTTSMode = ref(false) // 是否处于本地 TTS 模式

const progressBar = ref(null)
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const bookmarks = ref([])
const notes = ref([])
const showNoteInput = ref(false)
const noteContent = ref('')

const waveformCanvas = ref(null)

const listenCount = ref(0)
const totalListenTime = ref(0)
let sessionStartTime = null
let ttsProgressInterval = null // TTS 进度更新定时器

function clearTTSProgress() {
  if (ttsProgressInterval) {
    clearInterval(ttsProgressInterval)
    ttsProgressInterval = null
  }
}

function startTTSProgress(startTime) {
  clearTTSProgress()
  ttsProgressInterval = setInterval(() => {
    if (!startTime || !isPlaying.value) return
    const elapsed = (Date.now() - startTime) / 1000
    currentTime.value = Math.min(elapsed, duration.value)
    emit('position-change', currentTime.value)
  }, 100)
}

const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 }
]

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.playbackRate = playbackSpeed.value
  }
  initWaveform()
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
  clearTTSProgress()
  stopTextAudio()
})

function handleLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
    isTTSMode.value = false
  }
}

function handleTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    emit('position-change', currentTime.value)
  }
}

function endSession() {
  if (sessionStartTime) {
    const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000)
    totalListenTime.value += Math.floor(sessionTime / 60)
    sessionStartTime = null
  }
}

function handlePlay() {
  if (isAudioBroken.value) return
  isPlaying.value = true
  isTTSMode.value = false
  sessionStartTime = Date.now()
}

function handlePause() {
  if (isAudioBroken.value) return
  isPlaying.value = false
  isTTSMode.value = false
  endSession()
}

function handleError(e) {
  if (isAudioBroken.value) return

  const error = e.target?.error
  let errorMessage = '音频加载失败'
  if (error) {
    switch (error.code) {
      case 1: errorMessage = '请求被中止'; break
      case 2: errorMessage = '网络错误，请检查连接'; break
      case 3: errorMessage = '音频解码失败，文件可能已损坏'; break
      case 4: errorMessage = '音频资源不可用或格式不受支持'; break
      default: errorMessage = '未知音频错误'; break
    }
  }

  if (props.audioText && props.audioText.trim().length > 0) {
    logger.info(`[AudioPlayer] 远程音频不可用 (${error?.code}): ${errorMessage} - 将切换到本地语音合成`)
  } else {
    logger.warn(`[AudioPlayer] 音频播放失败 (${error?.code}): ${errorMessage}`)
  }

  isAudioBroken.value = true

  if (isPlaying.value) {
    isPlaying.value = false
    endSession()
    if (props.audioText && props.audioText.trim().length > 0) {
      message.warning('音频播放失败，已自动切换为本地语音合成。')
    } else {
      message.error(`音频播放失败: ${errorMessage}`)
    }
  }
}

function playNativeTTS(text) {
  if (!text?.trim()) {
    isPlaying.value = false
    return
  }

  clearTTSProgress()
  isTTSMode.value = true

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const estimatedDuration = props.fallbackDuration > 0
    ? props.fallbackDuration
    : Math.max(30, Math.round((wordCount / 150) * 60 * (1 / playbackSpeed.value)))

  duration.value = estimatedDuration
  currentTime.value = 0

  let ttsStartTime = null

  playTextAudio(text, {
    mode: 'native',
    nativeOptions: {
      lang: 'en-US',
      rate: playbackSpeed.value
    },
    onStart: () => {
      logger.log('[AudioPlayer] Native TTS started')
      isPlaying.value = true
      sessionStartTime = Date.now()
      ttsStartTime = Date.now()
      startTTSProgress(ttsStartTime)
    },
    onEnd: () => {
      logger.log('[AudioPlayer] Native TTS finished')
      isPlaying.value = false
      listenCount.value++
      clearTTSProgress()
      currentTime.value = duration.value
      emit('position-change', currentTime.value)
      endSession()
    },
    onError: (err) => {
      if (err?.error !== 'interrupted') {
        logger.error('[AudioPlayer] Native TTS error:', err)
        message.error('本地语音合成播放失败')
      } else {
        logger.log('[AudioPlayer] Native TTS manually interrupted/cancelled')
      }
      isPlaying.value = false
      clearTTSProgress()
      endSession()
    }
  })
}

function handleEnded() {
  isPlaying.value = false
  if (!isLooping.value) {
    listenCount.value++
  }
}

function togglePlay() {
  if (isAudioBroken.value && props.audioText && props.audioText.trim().length > 0) {
    if (isPlaying.value) {
      isPlaying.value = false
      isTTSMode.value = false
      currentTime.value = 0
      endSession()
      clearTTSProgress()
      stopTextAudio()
    } else {
      message.info('开始本地语音合成播放...')
      playNativeTTS(props.audioText)
    }
    return
  }

  if (!audioRef.value) return

  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(err => {
      isAudioBroken.value = true
      if (props.audioText && props.audioText.trim().length > 0) {
        logger.info('[AudioPlayer] 远程音频播放失败，切换到本地语音合成')
        message.info('已切换为本地语音合成播放...')
        playNativeTTS(props.audioText)
      } else {
        logger.warn('Playback failed:', err)
        isPlaying.value = false
        message.error('Audio playback failed and no fallback text is available.')
      }
    })
  }
}

function handleSpeedChange(speed) {
  playbackSpeed.value = speed
  if (audioRef.value) {
    audioRef.value.playbackRate = speed
  }
  emit('speed-change', speed)
}

function seekBackward() {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
  }
}

function seekForward() {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.min(duration.value, audioRef.value.currentTime + 10)
  }
}

function seekTo(time) {
  if (audioRef.value) {
    audioRef.value.currentTime = time
  }
}

function addBookmark() {
  const bookmark = {
    time: currentTime.value,
    note: '',
    timestamp: Date.now()
  }
  bookmarks.value.push(bookmark)
  emit('bookmark-add', bookmark)
}

function removeBookmark(index) {
  bookmarks.value.splice(index, 1)
}

function saveNote() {
  if (noteContent.value.trim()) {
    const note = {
      time: currentTime.value,
      content: noteContent.value,
      timestamp: Date.now()
    }
    notes.value.push(note)
    emit('note-add', note)
    noteContent.value = ''
    showNoteInput.value = false
  }
}

function toggleLoop() {
  isLooping.value = !isLooping.value
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function initWaveform() {
  const canvas = waveformCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width = canvas.offsetWidth
  const height = canvas.height = canvas.offsetHeight

  const bars = 100
  const barWidth = width / bars

  function drawWaveform() {
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < bars; i++) {
      const barHeight = Math.random() * height * 0.8
      const x = i * barWidth
      const y = (height - barHeight) / 2

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
      gradient.addColorStop(0, '#10b981')
      gradient.addColorStop(0.5, '#059669')
      gradient.addColorStop(1, '#10b981')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    }

    if (isPlaying.value) {
      requestAnimationFrame(drawWaveform)
    }
  }

  drawWaveform()

  watch(isPlaying, (playing) => {
    if (playing) {
      drawWaveform()
    }
  })
}

watch(() => props.src, (newSrc) => {
  isAudioBroken.value = !newSrc
  if (audioRef.value && newSrc) {
    audioRef.value.load()
  }
})
</script>

<style scoped>
.audio-player-enhanced {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.waveform-visual {
  position: relative;
  width: 100%;
  height: 120px;
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
}

.waveform-canvas {
  width: 100%;
  height: 100%;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background 0.3s;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.4);
}

.progress-section {
  margin-bottom: 24px;
}

.tts-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #10b981;
  margin-bottom: 12px;
  width: fit-content;
}

.progress-bar-container {
  position: relative;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 12px;
}

.progress-played {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  pointer-events: none;
  transition: width 0.1s linear;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.progress-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.time-display {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  color: #9ca3af;
}

.current-time {
  font-weight: 600;
  color: #f9fafb;
}

.divider {
  color: #6b7280;
}

.controls-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.speed-control {
  flex-shrink: 0;
}

.main-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auxiliary-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.bookmarks-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.bookmarks-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #d4d4d8;
  margin-bottom: 12px;
}

.bookmarks-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bookmark-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  font-size: 13px;
}

.bookmark-time {
  color: #10b981;
  font-weight: 600;
  min-width: 50px;
}

.bookmark-note {
  flex: 1;
  color: #d4d4d8;
}

.learning-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .audio-player-enhanced {
    padding: 16px;
  }

  .controls-section {
    flex-direction: column;
    gap: 16px;
  }

  .main-controls {
    width: 100%;
    justify-content: center;
  }

  .learning-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

