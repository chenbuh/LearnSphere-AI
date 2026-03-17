<template>
  <div class="mobile-audio-test">
    <n-card title="移动端音频播放测试">
      <n-space vertical size="large">
        <!-- 设备信息 -->
        <n-alert type="info" title="设备信息">
          <div>浏览器：{{ deviceInfo.userAgent }}</div>
          <div>是否移动端：{{ deviceInfo.isMobile ? '是' : '否' }}</div>
          <div>屏幕：{{ deviceInfo.screenSize }}</div>
        </n-alert>

        <!-- 测试步骤 -->
        <n-steps :current="currentStep" :status="stepStatus">
          <n-step title="解锁音频上下文" description="点击按钮解锁" />
          <n-step title="获取 Edge TTS 音频" description="从服务器获取" />
          <n-step title="播放音频" description="测试播放" />
        </n-steps>

        <!-- 测试按钮 -->
        <n-space vertical>
          <n-button
            type="primary"
            size="large"
            block
            :loading="isUnlocking"
            :disabled="currentStep > 0"
            @click="unlockAudioContext"
          >
            步骤 1: 解锁音频上下文
          </n-button>

          <n-button
            type="info"
            size="large"
            block
            :loading="isFetching"
            :disabled="currentStep !== 1"
            @click="fetchAudio"
          >
            步骤 2: 获取音频
          </n-button>

          <n-button
            type="success"
            size="large"
            block
            :loading="isPlaying"
            :disabled="currentStep !== 2"
            @click="playAudio"
          >
            步骤 3: 播放音频
          </n-button>

          <n-button
            size="large"
            block
            @click="resetTest"
          >
            重置测试
          </n-button>
        </n-space>

        <!-- 测试文本 -->
        <n-input
          v-model:value="testText"
          type="textarea"
          placeholder="输入测试文本"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />

        <!-- 日志 -->
        <n-card title="测试日志" size="small">
          <div class="log-container">
            <div
              v-for="(log, index) in logs"
              :key="index"
              :class="['log-item', `log-${log.level}`]"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </n-card>

        <!-- 诊断建议 -->
        <n-alert v-if="diagnosticMessage" :type="diagnosticType" :title="diagnosticTitle">
          {{ diagnosticMessage }}
        </n-alert>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NCard, NSpace, NButton, NInput, NAlert, NSteps, NStep, useMessage } from 'naive-ui'
import { isMobilePlaybackBrowser, primeMobileAudioPlayback } from '@/utils/mobilePlayback'
import { fetchEdgeTtsAudioUrl, DEFAULT_EDGE_TTS_VOICE } from '@/utils/ttsAudio'

const message = useMessage()
const logs = ref([])
const testText = ref('Hello, this is a mobile audio playback test.')
const currentStep = ref(0)
const stepStatus = ref('process')
const isUnlocking = ref(false)
const isFetching = ref(false)
const isPlaying = ref(false)
const audioUrl = ref('')
const audioElement = ref(null)
const diagnosticMessage = ref('')
const diagnosticType = ref('info')
const diagnosticTitle = ref('')

const deviceInfo = ref({
  userAgent: '',
  isMobile: false,
  screenSize: ''
})

function addLog(level, message) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  logs.value.push({ level, message, time })
  console[level](`[MobileTest] ${message}`)
}

async function unlockAudioContext() {
  isUnlocking.value = true
  addLog('info', '开始解锁音频上下文...')

  try {
    if (!isMobilePlaybackBrowser()) {
      addLog('warn', '当前不是移动端浏览器，但仍会尝试解锁')
    }

    await primeMobileAudioPlayback()
    addLog('info', '✓ 音频上下文解锁成功')
    currentStep.value = 1
    stepStatus.value = 'process'
    diagnosticMessage.value = '音频上下文已解锁，可以继续下一步'
    diagnosticType.value = 'success'
    diagnosticTitle.value = '步骤 1 完成'
    message.success('音频上下文解锁成功')
  } catch (error) {
    addLog('error', `✗ 音频上下文解锁失败: ${error.message}`)
    stepStatus.value = 'error'
    diagnosticMessage.value = '音频上下文解锁失败，这可能导致后续播放失败。建议刷新页面重试。'
    diagnosticType.value = 'error'
    diagnosticTitle.value = '步骤 1 失败'
    message.error('音频上下文解锁失败')
  } finally {
    isUnlocking.value = false
  }
}

async function fetchAudio() {
  isFetching.value = true
  addLog('info', '开始获取 Edge TTS 音频...')
  addLog('info', `请求文本: "${testText.value.substring(0, 50)}..."`)

  try {
    const url = await fetchEdgeTtsAudioUrl({
      text: testText.value,
      voice: DEFAULT_EDGE_TTS_VOICE,
      rate: 1.0,
      timeoutMs: 15000,
      retries: 2
    })

    if (!url) {
      throw new Error('获取到空的音频 URL')
    }

    audioUrl.value = url
    addLog('info', `✓ 音频获取成功: ${url.substring(0, 50)}...`)
    currentStep.value = 2
    stepStatus.value = 'process'
    diagnosticMessage.value = '音频已成功获取，可以播放了'
    diagnosticType.value = 'success'
    diagnosticTitle.value = '步骤 2 完成'
    message.success('音频获取成功')
  } catch (error) {
    addLog('error', `✗ 音频获取失败: ${error.message}`)
    stepStatus.value = 'error'
    diagnosticMessage.value = `音频获取失败: ${error.message}。请检查：1) 后端服务是否正常运行 2) 网络连接是否正常 3) /api/tts/edge 接口是否可访问`
    diagnosticType.value = 'error'
    diagnosticTitle.value = '步骤 2 失败'
    message.error('音频获取失败')
  } finally {
    isFetching.value = false
  }
}

async function playAudio() {
  isPlaying.value = true
  addLog('info', '开始播放音频...')

  try {
    if (!audioUrl.value) {
      throw new Error('没有可用的音频 URL')
    }

    // 创建新的 audio 元素
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value = null
    }

    const audio = new Audio(audioUrl.value)
    audio.playsInline = true
    audio.setAttribute('playsinline', 'true')
    audio.setAttribute('webkit-playsinline', 'true')
    audioElement.value = audio

    audio.onloadedmetadata = () => {
      addLog('info', `音频元数据加载成功，时长: ${audio.duration.toFixed(2)}s`)
    }

    audio.onplay = () => {
      addLog('info', '✓ 音频开始播放')
    }

    audio.onended = () => {
      addLog('info', '✓ 音频播放完成')
      isPlaying.value = false
      stepStatus.value = 'finish'
      diagnosticMessage.value = '测试完成！音频播放成功。'
      diagnosticType.value = 'success'
      diagnosticTitle.value = '测试成功'
      message.success('音频播放成功')
    }

    audio.onerror = (e) => {
      const errorMsg = e.target.error?.message || '未知错误'
      addLog('error', `✗ 音频播放错误: ${errorMsg}`)
      isPlaying.value = false
      stepStatus.value = 'error'
      diagnosticMessage.value = `音频播放失败: ${errorMsg}。可能原因：1) 音频格式不支持 2) 音频文件损坏 3) 浏览器限制`
      diagnosticType.value = 'error'
      diagnosticTitle.value = '播放失败'
      message.error('音频播放失败')
    }

    await audio.play()
    addLog('info', 'play() 命令执行成功')
  } catch (error) {
    addLog('error', `✗ 播放失败: ${error.message}`)
    isPlaying.value = false
    stepStatus.value = 'error'
    diagnosticMessage.value = `播放失败: ${error.message}。这通常是因为浏览器阻止了自动播放。`
    diagnosticType.value = 'error'
    diagnosticTitle.value = '播放失败'
    message.error(`播放失败: ${error.message}`)
  }
}

function resetTest() {
  currentStep.value = 0
  stepStatus.value = 'process'
  audioUrl.value = ''
  diagnosticMessage.value = ''
  logs.value = []
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value = null
  }
  addLog('info', '测试已重置')
}

onMounted(() => {
  deviceInfo.value = {
    userAgent: navigator.userAgent,
    isMobile: isMobilePlaybackBrowser(),
    screenSize: `${window.innerWidth} x ${window.innerHeight}`
  }

  addLog('info', '移动端音频播放测试工具已加载')
  addLog('info', `设备类型: ${deviceInfo.value.isMobile ? '移动端' : '桌面端'}`)
  addLog('info', '请按顺序点击按钮进行测试')
})
</script>

<style scoped>
.mobile-audio-test {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background: #1a1a1a;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 6px;
  display: flex;
  gap: 8px;
}

.log-time {
  color: #888;
  min-width: 60px;
  font-size: 11px;
}

.log-message {
  flex: 1;
  word-break: break-word;
}

.log-info .log-message {
  color: #e5e7eb;
}

.log-error .log-message {
  color: #fca5a5;
}

.log-warn .log-message {
  color: #fcd34d;
}
</style>
