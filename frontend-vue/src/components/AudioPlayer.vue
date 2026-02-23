<template>
  <div class="audio-player-enhanced">
    <!-- 音频波形可视化 -->
    <div class="waveform-visual">
      <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
      <div v-if="!isPlaying" class="play-overlay" @click="togglePlay">
        <n-icon :component="Play" size="48" color="#10b981" />
      </div>
    </div>

    <!-- 播放进度条 -->
    <div class="progress-section">
      <div class="progress-bar-container" ref="progressBar">
        <div
          class="progress-bar"
          :style="{ width: progressPercentage + '%' }"
        >
          <div class="progress-handle"></div>
        </div>
        <!-- 已播放部分高亮 -->
        <div
          class="progress-played"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>

      <!-- 时间显示 -->
      <div class="time-display">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="divider">/</span>
        <span class="duration">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls-section">
      <!-- 播放速度 -->
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

      <!-- 主控制按钮 -->
      <div class="main-controls">
        <!-- 后退 10 秒 -->
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

        <!-- 播放/暂停 -->
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

        <!-- 前进 10 秒 -->
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

      <!-- 辅助功能 -->
      <div class="auxiliary-controls">
        <!-- 书签 -->
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

        <!-- 笔记 -->
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

        <!-- 循环播放 -->
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

    <!-- 笔记输入对话框 -->
    <n-modal v-model:show="showNoteInput" preset="dialog" title="添加笔记">
      <n-input
        v-model:value="noteContent"
        type="textarea"
        placeholder="在此输入笔记内容..."
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
        <span>已听 {{ listenCount }} 次</span>
      </div>
      <div class="stat-item">
        <n-icon :component="Clock" size="14" color="#fbbf24" />
        <span>累计 {{ totalListenTime }} 分钟</span>
      </div>
    </div>

    <!-- 隐藏的音频元素 -->
    <audio
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
  StickyNote, Repeat, X, Headphones, Clock
} from 'lucide-vue-next'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  audioText: {
    type: String,
    default: ''
  },
  initialSpeed: {
    type: Number,
    default: 1.0
  }
})

const emit = defineEmits(['speed-change', 'position-change', 'bookmark-add', 'note-add'])

const message = useMessage()

// 音频元素
const audioRef = ref(null)

// 播放状态
const isPlaying = ref(false)
const isAudioBroken = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackSpeed = ref(props.initialSpeed)
const isLooping = ref(false)

// 进度条
const progressBar = ref(null)
const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 书签和笔记
const bookmarks = ref([])
const notes = ref([])
const showNoteInput = ref(false)
const noteContent = ref('')

// 波形画布
const waveformCanvas = ref(null)

// 学习统计
const listenCount = ref(0)
const totalListenTime = ref(0)
let sessionStartTime = null

// 播放速度选项
const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1.0x', value: 1.0 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 }
]

// 初始化音频
onMounted(() => {
  if (audioRef.value) {
    audioRef.value.playbackRate = playbackSpeed.value
  }
  // 初始化波形
  initWaveform()
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})

// 加载元数据
function handleLoadedMetadata() {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

// 时间更新
function handleTimeUpdate() {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    emit('position-change', currentTime.value)
  }
}

// 辅助：结束统计时长
function endSession() {
  if (sessionStartTime) {
    const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000)
    totalListenTime.value += Math.floor(sessionTime / 60)
    sessionStartTime = null
  }
}

// 播放状态处理
function handlePlay() {
  if (isAudioBroken.value) return
  isPlaying.value = true
  sessionStartTime = Date.now()
}

function handlePause() {
  if (isAudioBroken.value) return
  isPlaying.value = false
  endSession()
}

let currentUtterance = null

function handleError(e) {
  if (isAudioBroken.value) return
  
  const error = e.target.error
  let errorMessage = '未知音频错误'
  if (error) {
    switch (error.code) {
      case 1: errorMessage = '请求被中止'; break
      case 2: errorMessage = '网络错误，请检查网络连接'; break
      case 3: errorMessage = '音频解码失败'; break
      case 4: errorMessage = '播放源失效或格式不支持'; break
    }
  }
  
  console.error(`Audio playback error (${error?.code || 'N/A'}): ${errorMessage}`, e)
  isAudioBroken.value = true
  
  // 不要在 error 事件中直接调用 TTS，因为浏览器限制非用户交互环境无法触发语音合成
  if (isPlaying.value) {
    isPlaying.value = false
    endSession()
    if (props.audioText && props.audioText.trim().length > 0) {
      message.warning('音频加载失败，请再次点击播放按钮，将使用本地语音朗读')
    } else {
      message.error(`音频播放失败: ${errorMessage}`)
    }
  }
}

function playNativeTTS(text) {
  if (!window.speechSynthesis) {
    message.error('您的浏览器不支持语音合成')
    isPlaying.value = false
    return
  }

  try {
    window.speechSynthesis.cancel()
    
    // 延迟一小段时间再 speak，修复因为 cancel 和 speak 间隔过短导致的 interrupted 错误
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      currentUtterance = utterance
      utterance.lang = 'en-US'
      utterance.rate = playbackSpeed.value

      utterance.onstart = () => {
        console.log('[AudioPlayer] Native TTS started')
        isPlaying.value = true
        sessionStartTime = Date.now()
      }
      utterance.onend = () => {
        console.log('[AudioPlayer] Native TTS finished')
        isPlaying.value = false
        currentUtterance = null
        listenCount.value++
        endSession()
      }
      utterance.onerror = (err) => {
        console.error('[AudioPlayer] Native TTS error:', err)
        if (err.error !== 'interrupted') {
          message.error('本地语音合成尝试失败')
        }
        isPlaying.value = false
        currentUtterance = null
        endSession()
      }

      window.speechSynthesis.speak(utterance)
    }, 50)
  } catch (err) {
    console.error('[AudioPlayer] TTS initiation failed:', err)
    isPlaying.value = false
  }
}

// 播放结束
function handleEnded() {
  isPlaying.value = false
  if (!isLooping.value) {
    listenCount.value++
  }
}

// 切换播放/暂停
function togglePlay() {
  if (isAudioBroken.value && props.audioText && props.audioText.trim().length > 0) {
    if (isPlaying.value) {
      isPlaying.value = false
      endSession()
      if (window.speechSynthesis) window.speechSynthesis.cancel()
    } else {
      message.info('正在使用本地语音合成播放...')
      playNativeTTS(props.audioText)
    }
    return
  }

  if (!audioRef.value) return

  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(err => {
      console.error('Playback failed:', err)
      isAudioBroken.value = true
      // 如果播放尝试直接被 reject，并且配置了 audioText，则同步调用 TTS（此时仍处于用户的点击微任务上下文中，合法）
      if (props.audioText && props.audioText.trim().length > 0) {
        message.info('正在切换至本地语音合成播放...')
        playNativeTTS(props.audioText)
      } else {
        isPlaying.value = false
        message.error('音频加载或播放失败，且没有可朗读的文本。')
      }
    })
  }
}

// 调整播放速度
function handleSpeedChange(speed) {
  playbackSpeed.value = speed
  if (audioRef.value) {
    audioRef.value.playbackRate = speed
  }
  emit('speed-change', speed)
}

// 后退 10 秒
function seekBackward() {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
  }
}

// 前进 10 秒
function seekForward() {
  if (audioRef.value) {
    audioRef.value.currentTime = Math.min(duration.value, audioRef.value.currentTime + 10)
  }
}

// 跳转到指定时间
function seekTo(time) {
  if (audioRef.value) {
    audioRef.value.currentTime = time
  }
}

// 添加书签
function addBookmark() {
  const bookmark = {
    time: currentTime.value,
    note: '',
    timestamp: Date.now()
  }
  bookmarks.value.push(bookmark)
  emit('bookmark-add', bookmark)
}

// 删除书签
function removeBookmark(index) {
  bookmarks.value.splice(index, 1)
}

// 保存笔记
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

// 切换循环播放
function toggleLoop() {
  isLooping.value = !isLooping.value
}

// 格式化时间
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 初始化波形可视化
function initWaveform() {
  const canvas = waveformCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width = canvas.offsetWidth
  const height = canvas.height = canvas.offsetHeight

  // 生成模拟波形数据
  const bars = 100
  const barWidth = width / bars

  function drawWaveform() {
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < bars; i++) {
      const barHeight = Math.random() * height * 0.8
      const x = i * barWidth
      const y = (height - barHeight) / 2

      // 创建渐变
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
      gradient.addColorStop(0, '#10b981')
      gradient.addColorStop(0.5, '#059669')
      gradient.addColorStop(1, '#10b981')

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth - 2, barHeight)
    }

    // 动画效果
    if (isPlaying.value) {
      requestAnimationFrame(drawWaveform)
    }
  }

  drawWaveform()

  // 监听播放状态
  watch(isPlaying, (playing) => {
    if (playing) {
      drawWaveform()
    }
  })
}

// 监听 src 变化
watch(() => props.src, (newSrc) => {
  isAudioBroken.value = false
  if (audioRef.value) {
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

/* 波形可视化 */
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

/* 进度条 */
.progress-section {
  margin-bottom: 24px;
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

/* 控制区域 */
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

/* 书签列表 */
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

/* 学习统计 */
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

/* 动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 移动端适配 */
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
