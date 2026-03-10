<template>
  <div class="practice-container">
    <div class="mb-4">
      <n-button secondary @click="emit('restart')">
        <template #icon><n-icon :component="RotateCcw" /></template>
        {{ translate('重新开始', 'Restart') }}
      </n-button>
    </div>

    <n-grid x-gap="24" cols="1 800:2" responsive="screen">
      <n-grid-item>
        <n-card class="topic-card" :title="translate('口语话题', 'Speaking Topic')" :bordered="false">
          <h2 class="text-xl font-bold mb-4">{{ topicData.topic || topicData.title }}</h2>
          <div class="question-box p-4 rounded-lg mb-4 text-lg leading-relaxed secure-content">
            {{ topicData.description || topicData.question }}
          </div>

          <div class="tips-section">
            <div class="text-gray-400 mb-2 text-sm">{{ translate('关键词与提示', 'KEYWORDS & TIPS') }}</div>
            <n-space>
              <n-tag v-for="k in (topicData.keywords || [])" :key="k" size="small" :bordered="false" type="info">{{ k }}</n-tag>
              <n-tag v-for="t in (topicData.hints || topicData.tips || [])" :key="t" size="small" :bordered="false" type="warning">{{ t }}</n-tag>
            </n-space>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card class="recorder-card" :bordered="false">
          <div class="recorder-ui flex flex-col items-center justify-center h-full min-h-[400px]">
            <div class="visualizer-container mb-8 relative">
              <div class="visualizer-circle" :style="{ transform: `scale(${1 + audioLevel / 100})`, opacity: isRecording ? 1 : 0.3, zIndex: 2 }">
                <n-icon :component="isRecording ? StopCircle : Mic" size="48" color="#fff" />
                <div v-if="isRecording" class="ripple"></div>
                <div v-if="isRecording" class="ripple delay-1"></div>
              </div>
              <canvas :ref="visualizerCanvas" width="200" height="80" class="absolute -bottom-12 opacity-50"></canvas>
            </div>

            <div class="timer text-4xl font-mono mb-8 font-bold">
              {{ formatTime(recordingTime) }}
            </div>

            <div class="controls mb-8">
              <n-button
                circle
                size="large"
                style="width: 80px; height: 80px;"
                :type="isRecording ? 'error' : 'primary'"
                @click="emit('toggle-recording')"
              >
                <template #icon>
                  <n-icon :component="isRecording ? StopCircle : Mic" size="40" />
                </template>
              </n-button>
              <p class="text-center text-gray-400 text-sm mt-3">
                {{ isRecording ? translate('点击停止录音', 'Click to stop recording') : translate('点击开始录音', 'Click to start recording') }}
              </p>
            </div>

            <div class="transcript-preview w-full p-2 rounded-lg text-sm h-40 mb-4 flex flex-col">
              <div class="text-xs text-gray-500 mb-1 flex justify-between">
                <span>{{ translate('实时转写（浏览器免费识别）：', 'Live transcription (free browser speech recognition):') }}</span>
                <span v-if="isRecording" class="text-blue-400 animate-pulse">{{ translate('录音中...', 'Recording...') }}</span>
              </div>
              <n-input
                :value="transcript"
                type="textarea"
                placeholder="..."
                :autosize="{ minRows: 4, maxRows: 6 }"
                class="flex-1"
                :bordered="false"
                @update:value="emit('update:transcript', $event)"
              />
            </div>

            <div class="w-full">
              <n-button
                type="success"
                block
                size="large"
                :disabled="!transcript && recordingTime < 2"
                @click="emit('submit')"
                :loading="isLoading"
              >
                <template #icon>
                  <n-icon :component="CheckCircle" />
                </template>
                {{ translate('提交评估', 'Submit for Evaluation') }}
              </n-button>
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { NButton, NCard, NGrid, NGridItem, NIcon, NInput, NSpace, NTag } from 'naive-ui'
import { CheckCircle, Mic, RotateCcw, StopCircle } from 'lucide-vue-next'

defineProps({
  topicData: {
    type: Object,
    required: true
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  transcript: {
    type: String,
    default: ''
  },
  recordingTime: {
    type: Number,
    default: 0
  },
  audioLevel: {
    type: Number,
    default: 0
  },
  visualizerCanvas: {
    type: Object,
    default: null
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  formatTime: {
    type: Function,
    required: true
  },
  translate: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['restart', 'toggle-recording', 'update:transcript', 'submit'])
</script>

<style scoped>
.topic-card {
  border-radius: 16px;
  min-height: 400px;
}

.recorder-card {
  border-radius: 16px;
  min-height: 400px;
}

.visualizer-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.3);
}

.ripple {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(249, 115, 22, 0.5);
  animation: ripple 1.5s infinite linear;
  opacity: 0;
}

.ripple.delay-1 {
  animation-delay: 0.5s;
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

.recorder-ui {
  padding: 20px;
}

.transcript-preview {
  font-family: monospace;
  line-height: 1.5;
  background: var(--accent-fill);
  color: var(--text-color);
  padding: 16px;
  border-radius: 8px;
}

.question-box {
  background: var(--accent-fill);
  color: var(--text-color);
  padding: 16px;
  border-radius: 8px;
}
</style>