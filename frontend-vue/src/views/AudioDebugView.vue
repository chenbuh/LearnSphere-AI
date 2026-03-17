<template>
  <div class="audio-debug-view">
    <n-card title="移动端音频播放诊断工具">
      <n-space vertical size="large">
        <!-- 设备信息 -->
        <n-card title="设备信息" size="small">
          <n-descriptions :column="1" label-placement="left">
            <n-descriptions-item label="User Agent">
              {{ deviceInfo.userAgent }}
            </n-descriptions-item>
            <n-descriptions-item label="是否移动端">
              {{ deviceInfo.isMobile ? '是' : '否' }}
            </n-descriptions-item>
            <n-descriptions-item label="平台">
              {{ deviceInfo.platform }}
            </n-descriptions-item>
            <n-descriptions-item label="屏幕尺寸">
              {{ deviceInfo.screenSize }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- 测试文本 -->
        <n-card title="测试配置" size="small">
          <n-space vertical>
            <n-input
              v-model:value="testText"
              type="textarea"
              placeholder="输入要测试的文本"
              :autosize="{ minRows: 3, maxRows: 5 }"
            />
            <n-select
              v-model:value="testVoice"
              :options="voiceOptions"
              placeholder="选择语音"
            />
          </n-space>
        </n-card>

        <!-- 测试按钮 -->
        <n-space>
          <n-button type="primary" @click="testDirectFetch">
            测试直接获取音频
          </n-button>
          <n-button type="info" @click="testAudioPlayer">
            测试 AudioPlayer 组件
          </n-button>
          <n-button type="warning" @click="testNativeTTS">
            测试原生 TTS
          </n-button>
          <n-button @click="clearLogs">清空日志</n-button>
        </n-space>

        <!-- 日志输出 -->
        <n-card title="诊断日志" size="small">
          <div class="log-container">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="['log-item', `log-${log.level}`]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </n-card>

        <!-- 音频播放器测试 -->
        <n-card v-if="showPlayer" title="AudioPlayer 测试" size="small">
          <AudioPlayer
            :audio-text="testText"
            :src="testAudioSrc"
          />
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NCard, NSpace, NButton, NInput, NSelect, NDescriptions, NDescriptionsItem, useMessage } from 'naive-ui'
import AudioPlayer from '@/components/AudioPlayer.vue'
import { fetchEdgeTtsAudioUrl, DEFAULT_EDGE_TTS_VOICE } from '@/utils/ttsAudio'
import { isMobilePlaybackBrowser, primeMobileAudioPlayback } from '@/utils/mobilePlayback'
import { useTextAudio } from '@/composables/useTextAudio'

const message = useMessage()
const logs = ref([])
const testText = ref('Hello, this is a test for mobile audio playback.')
const testVoice = ref(DEFAULT_EDGE_TTS_VOICE)
const testAudioSrc = ref('')
const showPlayer = ref(false)

const deviceInfo = ref({
  userAgent: '',
  isMobile: false,
  platform: '',
  screenSize: ''
})

const voiceOptions = [
  { label: 'Jenny (美音-女)', value: 'en-US-JennyNeural' },
  { label: 'Guy (美音-男)', value: 'en-US-GuyNeural' },
  { label: 'Sonia (英音-女)', value: 'en-GB-SoniaNeural' },
  { label: 'Ryan (英音-男)', value: 'en-GB-RyanNeural' }
]

const { playAudio: playTextAudio } = useTextAudio({
  logger: console,
  notifyWarning: (msg) => message.warning(msg)
})

function addLog(level, message) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
  logs.value.push({ level, message, time })
  console[level](`[AudioDebug] ${message}`)
}

function clearLogs() {
  logs.value = []
}

async function testDirectFetch() {
  addLog('info', '开始测试直接获取音频...')

  try {
    // 移动端先解锁音频
    if (isMobilePlaybackBrowser()) {
      addLog('info', '检测到移动端，先解锁音频上下文')
      await primeMobileAudioPlayback()
      addLog('info', '音频上下文解锁成功')
    }

    addLog('info', `请求 Edge TTS: text="${testText.value.substring(0, 50)}...", voice="${testVoice.value}"`)

    const audioUrl = await fetchEdgeTtsAudioUrl({
      text: testText.value,
      voice: testVoice.value,
      rate: 1.0,
      timeoutMs: 15000
    })

    if (!audioUrl) {
      addLog('error', 'Edge TTS 返回空 URL')
      message.error('获取音频失败')
      return
    }

    addLog('info', `获取到音频 Blob URL: ${audioUrl.substring(0, 50)}...`)

    // 尝试播放
    const audio = new Audio(audioUrl)
    audio.playsInline = true
    audio.setAttribute('playsinline', 'true')
    audio.setAttribute('webkit-playsinline', 'true')

    audio.onloadedmetadata = () => {
      addLog('info', `音频元数据加载成功，时长: ${audio.duration.toFixed(2)}s`)
    }

    audio.onplay = () => {
      addLog('info', '音频开始播放')
    }

    audio.onended = () => {
      addLog('info', '音频播放结束')
      URL.revokeObjectURL(audioUrl)
    }

    audio.onerror = (e) => {
      addLog('error', `音频播放错误: ${e.target.error?.message || '未知错误'}`)
    }

    addLog('info', '尝试播放音频...')
    await audio.play()
    addLog('info', '音频播放命令执行成功')
    message.success('音频播放成功')

  } catch (error) {
    addLog('error', `测试失败: ${error.message || error}`)
    message.error(`测试失败: ${error.message || error}`)
  }
}

function testAudioPlayer() {
  addLog('info', '显示 AudioPlayer 组件测试')
  showPlayer.value = true
  testAudioSrc.value = ''
  message.info('请点击播放按钮测试')
}

function testNativeTTS() {
  addLog('info', '开始测试原生 TTS...')

  playTextAudio(testText.value, {
    mode: 'native',
    nativeOptions: {
      lang: 'en-US',
      rate: 1.0
    },
    onStart: () => {
      addLog('info', '原生 TTS 开始播放')
      message.info('原生 TTS 开始播放')
    },
    onEnd: () => {
      addLog('info', '原生 TTS 播放结束')
      message.success('原生 TTS 播放结束')
    },
    onError: (error) => {
      addLog('error', `原生 TTS 错误: ${error.message || error}`)
      message.error(`原生 TTS 错误: ${error.message || error}`)
    }
  })
}

onMounted(() => {
  deviceInfo.value = {
    userAgent: navigator.userAgent,
    isMobile: isMobilePlaybackBrowser(),
    platform: navigator.platform,
    screenSize: `${window.innerWidth} x ${window.innerHeight}`
  }

  addLog('info', '音频诊断工具已加载')
  addLog('info', `设备类型: ${deviceInfo.value.isMobile ? '移动端' : '桌面端'}`)
})
</script>

<style scoped>
.audio-debug-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.log-container {
  max-height: 400px;
  overflow-y: auto;
  background: #1a1a1a;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-item {
  margin-bottom: 8px;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.log-time {
  color: #888;
  min-width: 80px;
}

.log-level {
  font-weight: bold;
  min-width: 60px;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-info .log-level {
  color: #3b82f6;
}

.log-info .log-message {
  color: #e5e7eb;
}

.log-error .log-level {
  color: #ef4444;
}

.log-error .log-message {
  color: #fca5a5;
}

.log-warn .log-level {
  color: #f59e0b;
}

.log-warn .log-message {
  color: #fcd34d;
}

.log-debug .log-level {
  color: #10b981;
}

.log-debug .log-message {
  color: #d1d5db;
}
</style>
