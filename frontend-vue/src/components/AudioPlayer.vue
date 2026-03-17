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
      v-if="effectiveAudioSrc"
      ref="audioRef"
      :src="effectiveAudioSrc"
      :loop="isLooping"
      playsinline
      webkit-playsinline="true"
      preload="auto"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  NButton, NDropdown, NIcon, NInput, NModal, NTooltip, useMessage
} from 'naive-ui'
import {
  Bookmark, Clock, Gauge, Headphones, Pause, Play,
  Repeat, RotateCcw, RotateCw, StickyNote, Volume2, X
} from 'lucide-vue-next'
import logger from '@/utils/logger'
import { isMobilePlaybackBrowser, primeMobileAudioPlayback } from '@/utils/mobilePlayback'
import { DEFAULT_EDGE_TTS_VOICE, fetchEdgeTtsAudioUrl } from '@/utils/ttsAudio'
import { useTextAudio } from '@/composables/useTextAudio'

const EDGE_TTS_TIMEOUT_MS = 15000
const EDGE_TTS_MOBILE_PLAY_TIMEOUT_MS = 4500
const EDGE_TTS_MOBILE_BACKGROUND_TIMEOUT_MS = 15000

const props = defineProps({
  src: {
    type: String,
    default: ''
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
const progressBar = ref(null)
const waveformCanvas = ref(null)
const showNoteInput = ref(false)
const noteContent = ref('')

const isPlaying = ref(false)
const isAudioBroken = ref(!(props.src || '').trim())
const isTTSMode = ref(false)
const isLooping = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackSpeed = ref(props.initialSpeed)
const bookmarks = ref([])
const notes = ref([])
const listenCount = ref(0)
const totalListenTime = ref(0)
const fallbackAudioSrc = ref('')

const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 }
]

const progressPercentage = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})

const effectiveAudioSrc = computed(() => {
  const primarySrc = (props.src || '').trim()
  if (primarySrc && !isAudioBroken.value) {
    return primarySrc
  }
  return fallbackAudioSrc.value
})

let sessionStartTime = null
let ttsProgressInterval = null
let waveformFrameId = null
let fallbackFetchController = null
let mobileUnlockedAudioElement = null

function revokeFallbackAudioSrc() {
  if (fallbackAudioSrc.value && fallbackAudioSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(fallbackAudioSrc.value)
  }
  fallbackAudioSrc.value = ''
}

function clearTTSProgress() {
  if (ttsProgressInterval) {
    clearInterval(ttsProgressInterval)
    ttsProgressInterval = null
  }
}

function endSession() {
  if (!sessionStartTime) return
  const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000)
  totalListenTime.value += Math.floor(sessionTime / 60)
  sessionStartTime = null
}

function resetPlaybackState({ keepDuration = false } = {}) {
  isPlaying.value = false
  currentTime.value = 0
  if (!keepDuration) {
    duration.value = 0
  }
}

function stopAllPlayback() {
  clearTTSProgress()
  stopTextAudio()
  if (fallbackFetchController) {
    fallbackFetchController.abort()
    fallbackFetchController = null
  }

  if (audioRef.value) {
    try {
      audioRef.value.pause()
      audioRef.value.currentTime = 0
    } catch (error) {
      logger.warn('[AudioPlayer] Failed to stop audio element', error)
    }
  }

  isTTSMode.value = false
  endSession()
  resetPlaybackState()
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

function estimateFallbackDuration() {
  if (props.fallbackDuration > 0) {
    return props.fallbackDuration
  }

  const wordCount = (props.audioText || '').trim().split(/\s+/).filter(Boolean).length
  if (!wordCount) return 0
  return Math.max(30, Math.round((wordCount / 150) * 60 * (1 / playbackSpeed.value)))
}

function playNativeTTS(text) {
  if (!text?.trim()) {
    resetPlaybackState()
    return
  }

  isTTSMode.value = true
  duration.value = estimateFallbackDuration()
  currentTime.value = 0

  let ttsStartTime = null
  playTextAudio(text, {
    mode: 'native',
    nativeOptions: {
      lang: 'en-US',
      rate: playbackSpeed.value,
      voiceSelector: (voices) => voices.find((voice) => voice.lang === 'en-US')
        || voices.find((voice) => voice.lang?.startsWith('en'))
        || voices[0]
    },
    onStart: () => {
      isPlaying.value = true
      sessionStartTime = Date.now()
      ttsStartTime = Date.now()
      startTTSProgress(ttsStartTime)
    },
    onEnd: () => {
      clearTTSProgress()
      endSession()
      isPlaying.value = false
      currentTime.value = duration.value
    },
    onError: (error) => {
      clearTTSProgress()
      endSession()
      isPlaying.value = false
      if ((error?.error || error?.message) !== 'interrupted') {
        logger.error('[AudioPlayer] Native TTS error:', error)
        message.error('音频播放失败，请稍后重试。')
      }
    }
  })
}

async function ensureFallbackAudioSource(timeoutMs = EDGE_TTS_TIMEOUT_MS) {
  if (fallbackAudioSrc.value) {
    return fallbackAudioSrc.value
  }

  const normalizedText = (props.audioText || '').trim()
  if (!normalizedText) {
    return null
  }

  if (fallbackFetchController) {
    fallbackFetchController.abort()
  }

  fallbackFetchController = new AbortController()
  try {
    logger.debug('[AudioPlayer] Fetching Edge TTS audio, timeout:', timeoutMs)
    const audioUrl = await fetchEdgeTtsAudioUrl({
      text: normalizedText,
      voice: DEFAULT_EDGE_TTS_VOICE,
      rate: playbackSpeed.value,
      timeoutMs,
      signal: fallbackFetchController.signal
    })

    if (!audioUrl) {
      logger.warn('[AudioPlayer] Edge TTS returned empty audio URL')
      return null
    }

    logger.debug('[AudioPlayer] Edge TTS audio URL obtained successfully')
    fallbackAudioSrc.value = audioUrl
    await nextTick()
    if (audioRef.value) {
      audioRef.value.load()
      audioRef.value.playbackRate = playbackSpeed.value
    }
    return audioUrl
  } catch (error) {
    if (error?.name !== 'AbortError') {
      logger.warn('[AudioPlayer] Edge TTS fetch failed:', error?.message || error)
    }
    return null
  } finally {
    fallbackFetchController = null
  }
}

async function preloadFallbackAudio() {
  const primarySrc = (props.src || '').trim()
  if (primarySrc && !isAudioBroken.value) return
  await ensureFallbackAudioSource()
}

async function primeFallbackAudioPlayback() {
  if (!isMobilePlaybackBrowser()) {
    return null
  }

  try {
    mobileUnlockedAudioElement = await primeMobileAudioPlayback(mobileUnlockedAudioElement)
  } catch (error) {
    logger.warn('[AudioPlayer] Failed to prime mobile audio playback', error)
  }

  return mobileUnlockedAudioElement
}

async function playFallbackAudio() {
  const normalizedText = (props.audioText || '').trim()
  const isMobileBrowser = isMobilePlaybackBrowser()

  logger.debug('[AudioPlayer] playFallbackAudio called, isMobile:', isMobileBrowser)

  if (isMobileBrowser && normalizedText) {
    logger.debug('[AudioPlayer] Priming mobile audio playback')
    await primeFallbackAudioPlayback()
  }

  const fallbackSrc = await ensureFallbackAudioSource(
    isMobileBrowser ? EDGE_TTS_MOBILE_PLAY_TIMEOUT_MS : EDGE_TTS_TIMEOUT_MS
  )

  if (fallbackSrc && audioRef.value) {
    isTTSMode.value = false
    try {
      logger.debug('[AudioPlayer] Attempting to play Edge TTS audio')
      audioRef.value.currentTime = 0
      await audioRef.value.play()
      logger.info('[AudioPlayer] Edge TTS audio playing successfully')
      return true
    } catch (error) {
      revokeFallbackAudioSrc()
      logger.warn('[AudioPlayer] Edge audio playback failed, fallback to native TTS', error)
      message.warning('音频播放失败，切换为本地语音合成')
    }
  }

  if (normalizedText) {
    if (isMobileBrowser && !fallbackAudioSrc.value) {
      logger.debug('[AudioPlayer] Mobile Edge audio is still warming, fallback to native TTS')
      void ensureFallbackAudioSource(EDGE_TTS_MOBILE_BACKGROUND_TIMEOUT_MS)
    }
    logger.info('[AudioPlayer] Using native TTS as fallback')
    message.info('已切换为本地语音合成播放...')
    playNativeTTS(normalizedText)
    return true
  }

  logger.error('[AudioPlayer] No audio source available and no text for TTS')
  return false
}

async function recoverFromAudioError(errorMessage) {
  if (!(props.audioText || '').trim()) {
    message.error(`音频播放失败: ${errorMessage}`)
    return
  }

  const switched = await playFallbackAudio()
  if (!switched) {
    message.error(`音频播放失败: ${errorMessage}`)
  }
}

function handleLoadedMetadata() {
  if (!audioRef.value) return
  duration.value = Number.isFinite(audioRef.value.duration) ? audioRef.value.duration : 0
  if (duration.value > 0) {
    isTTSMode.value = false
  }
}

function handleTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  emit('position-change', currentTime.value)
}

function handlePlay() {
  isPlaying.value = true
  isTTSMode.value = false
  sessionStartTime = Date.now()
}

function handlePause() {
  if (isTTSMode.value) return
  isPlaying.value = false
  endSession()
}

function handleEnded() {
  isPlaying.value = false
  currentTime.value = duration.value
  endSession()
  if (!isLooping.value) {
    listenCount.value += 1
  }
}

function handleError(event) {
  const error = event?.target?.error
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

  endSession()
  isPlaying.value = false

  const activeSrc = audioRef.value?.currentSrc || effectiveAudioSrc.value
  const usingFallbackAudio = Boolean(fallbackAudioSrc.value && activeSrc === fallbackAudioSrc.value)

  logger.warn(`[AudioPlayer] Playback failed: ${errorMessage}`)

  if (usingFallbackAudio) {
    revokeFallbackAudioSrc()
    if ((props.audioText || '').trim()) {
      message.info('Edge 音频播放失败，已切换为本地语音合成。')
      playNativeTTS(props.audioText)
      return
    }

    message.error(`音频播放失败: ${errorMessage}`)
    return
  }

  isAudioBroken.value = true
  void recoverFromAudioError(errorMessage)
}

async function togglePlay() {
  if (isPlaying.value) {
    if (isTTSMode.value) {
      clearTTSProgress()
      stopTextAudio()
      endSession()
      isTTSMode.value = false
      isPlaying.value = false
      currentTime.value = 0
      return
    }

    if (audioRef.value) {
      audioRef.value.pause()
    }
    return
  }

  if (effectiveAudioSrc.value && audioRef.value) {
    try {
      audioRef.value.playbackRate = playbackSpeed.value
      await audioRef.value.play()
      return
    } catch (error) {
      isAudioBroken.value = true
      logger.warn('[AudioPlayer] Primary audio play failed, trying fallback', error)
    }
  }

  const played = await playFallbackAudio()
  if (!played) {
    message.error('Audio playback failed and no fallback text is available.')
  }
}

function handleSpeedChange(speed) {
  playbackSpeed.value = speed
  if (audioRef.value && !isTTSMode.value) {
    audioRef.value.playbackRate = speed
  }

  if (fallbackAudioSrc.value) {
    revokeFallbackAudioSrc()
    void preloadFallbackAudio()
  }

  emit('speed-change', speed)
}

function seekBackward() {
  if (!audioRef.value || isTTSMode.value) return
  audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
}

function seekForward() {
  if (!audioRef.value || isTTSMode.value) return
  audioRef.value.currentTime = Math.min(duration.value || audioRef.value.duration || 0, audioRef.value.currentTime + 10)
}

function seekTo(time) {
  if (!audioRef.value || isTTSMode.value) return
  audioRef.value.currentTime = time
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
  if (!noteContent.value.trim()) return

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

function toggleLoop() {
  isLooping.value = !isLooping.value
}

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function drawWaveform() {
  const canvas = waveformCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width = canvas.offsetWidth
  const height = canvas.height = canvas.offsetHeight
  const bars = 100
  const barWidth = width / bars

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

  waveformFrameId = isPlaying.value ? requestAnimationFrame(drawWaveform) : null
}

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.playbackRate = playbackSpeed.value
  }
  drawWaveform()
  void preloadFallbackAudio()
})

onUnmounted(() => {
  if (waveformFrameId) {
    cancelAnimationFrame(waveformFrameId)
    waveformFrameId = null
  }
  stopAllPlayback()
  revokeFallbackAudioSrc()
})

watch(isPlaying, (playing) => {
  if (playing && !waveformFrameId) {
    drawWaveform()
    return
  }

  if (!playing && waveformFrameId) {
    cancelAnimationFrame(waveformFrameId)
    waveformFrameId = null
    drawWaveform()
  }
})

watch(() => props.src, async (newSrc, oldSrc) => {
  isAudioBroken.value = !(newSrc || '').trim()

  if (newSrc !== oldSrc) {
    stopAllPlayback()
    revokeFallbackAudioSrc()
    currentTime.value = 0
    duration.value = 0
  }

  await nextTick()
  if (audioRef.value && effectiveAudioSrc.value) {
    audioRef.value.load()
    audioRef.value.playbackRate = playbackSpeed.value
  }

  void preloadFallbackAudio()
})

watch(() => props.audioText, () => {
  stopAllPlayback()
  revokeFallbackAudioSrc()
  void preloadFallbackAudio()
})

watch(effectiveAudioSrc, async () => {
  await nextTick()
  if (audioRef.value && effectiveAudioSrc.value) {
    audioRef.value.load()
    audioRef.value.playbackRate = playbackSpeed.value
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



