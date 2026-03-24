<template>
  <div class="practice-container">
    <div class="practice-toolbar">
      <n-button secondary @click="emit('restart')">
        <template #icon><n-icon :component="RotateCcw" /></template>
        {{ translate('重新开始', 'Restart') }}
      </n-button>
    </div>

    <div class="practice-shell">
      <section class="recorder-stage">
        <div class="stage-head">
          <div>
            <p class="stage-kicker">{{ translate('口语作答', 'Speaking Practice') }}</p>
            <h2 class="stage-title">{{ translate('请根据题目完成录音并提交作答', 'Record your response based on the prompt and submit when ready') }}</h2>
          </div>
          <p class="stage-caption">{{ translate('完成录音后可统一检查转写内容，并在确认后提交评估。', 'Review the transcript after recording, then submit when everything looks right.') }}</p>
        </div>

        <div class="device-panel">
          <div class="device-selector__label">
            {{ translate('当前麦克风', 'Current Microphone') }}
          </div>
          <div class="device-selector__controls">
            <n-select
              :value="selectedAudioInputDeviceId"
              :options="audioInputOptions"
              :placeholder="translate('请选择麦克风', 'Select a microphone')"
              :disabled="isRecording || isPreparingRecording"
              @update:value="emit('update:audio-input-device-id', $event)"
            />
            <n-button secondary :disabled="isRecording || isPreparingRecording" @click="emit('refresh-audio-input-devices')">
              {{ translate('刷新', 'Refresh') }}
            </n-button>
          </div>
        </div>

        <div class="recorder-core">
          <div class="visualizer-container">
            <div class="visualizer-circle" :style="{ transform: `scale(${1 + audioLevel / 100})`, opacity: isRecording ? 1 : 0.32, zIndex: 2 }">
              <n-icon :component="isRecording ? StopCircle : Mic" size="48" color="#fff" />
              <div v-if="isRecording" class="ripple"></div>
              <div v-if="isRecording" class="ripple delay-1"></div>
            </div>
            <canvas :ref="visualizerCanvas" width="200" height="80" class="visualizer-canvas"></canvas>
          </div>

          <div class="timer">{{ formatTime(recordingTime) }}</div>

          <div class="controls">
            <n-button
              circle
              size="large"
              class="record-btn"
              :type="isRecording ? 'default' : 'primary'"
              :loading="isPreparingRecording"
              :disabled="isPreparingRecording || isRecording"
              @click="emit('toggle-recording')"
            >
              <template #icon>
                <n-icon :component="isRecording ? StopCircle : Mic" size="40" />
              </template>
            </n-button>
            <p class="control-copy">
              {{ isPreparingRecording
                ? translate('正在准备录音与识别模型...', 'Preparing recorder and speech model...')
                : (isRecording
                  ? translate('录音中，请使用下方按钮结束并评估。', 'Recording. Use the button below to stop and evaluate.')
                  : translate('点击开始录音', 'Click to start recording')) }}
            </p>
          </div>
        </div>

        <div class="transcript-panel">
          <div class="transcript-head">
            <span>{{ translate('转写内容', 'Transcript') }}</span>
            <span v-if="isRecording" class="live-indicator">{{ translate('录音中...', 'Recording...') }}</span>
          </div>
          <n-input
            :value="transcript"
            type="textarea"
            placeholder="..."
            :autosize="{ minRows: 7, maxRows: 10 }"
            class="transcript-input"
            :bordered="false"
            @update:value="emit('update:transcript', $event)"
          />
        </div>

        <n-button
          type="success"
          block
          size="large"
          class="submit-btn"
          :disabled="isPreparingRecording || (!transcript && recordingTime < 2) || (isRecording && recordingTime < 3)"
          @click="emit('submit')"
          :loading="isLoading"
        >
          <template #icon>
            <n-icon :component="CheckCircle" />
          </template>
          {{ isRecording ? translate('停止并评估', 'Stop and Evaluate') : translate('提交评估', 'Submit for Evaluation') }}
        </n-button>
      </section>

      <aside class="topic-rail">
        <div class="rail-head">
          <p class="rail-kicker">{{ translate('Topic Context', 'Topic Context') }}</p>
          <h3 class="rail-title">{{ topicData.topic || topicData.title }}</h3>
        </div>

        <div class="question-box secure-content">
          {{ topicData.description || topicData.question }}
        </div>

        <div class="tips-section">
          <div class="tips-title">{{ translate('关键词与提示', 'Keywords & Tips') }}</div>
          <div class="tips-stack">
            <n-tag v-for="k in (topicData.keywords || [])" :key="k" size="small" :bordered="false" type="info">{{ k }}</n-tag>
            <n-tag v-for="t in (topicData.hints || topicData.tips || [])" :key="t" size="small" :bordered="false" type="warning">{{ t }}</n-tag>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { NButton, NIcon, NInput, NSelect, NTag } from 'naive-ui'
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
  isPreparingRecording: {
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
  audioInputOptions: {
    type: Array,
    default: () => []
  },
  selectedAudioInputDeviceId: {
    type: String,
    default: ''
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

const emit = defineEmits([
  'restart',
  'toggle-recording',
  'refresh-audio-input-devices',
  'update:audio-input-device-id',
  'update:transcript',
  'submit'
])
</script>

<style scoped>
.practice-toolbar {
  margin-bottom: 18px;
}

.practice-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: start;
}

.recorder-stage {
  display: grid;
  gap: 18px;
  padding: 24px 26px 26px;
  border-radius: 26px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.2)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.06), transparent 42%);
}

.stage-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.stage-kicker,
.rail-kicker {
  margin: 0 0 8px;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stage-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.2rem;
  line-height: 1.38;
}

.stage-caption {
  max-width: 22rem;
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  text-align: right;
}

.device-panel,
.topic-rail {
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.device-panel {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 18px;
}

.device-selector__label {
  font-size: 0.78rem;
  color: var(--secondary-text);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.device-selector__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.recorder-core {
  display: grid;
  justify-items: center;
  gap: 18px;
  padding: 18px 0 8px;
}

.visualizer-container {
  position: relative;
  display: grid;
  justify-items: center;
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

.visualizer-canvas {
  position: absolute;
  bottom: -48px;
  opacity: 0.5;
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

.timer {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-color);
  font-family: 'JetBrains Mono', monospace;
}

.controls {
  display: grid;
  justify-items: center;
  gap: 12px;
}

.record-btn {
  width: 80px;
  height: 80px;
}

.control-copy {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.86rem;
  line-height: 1.55;
  text-align: center;
}

.transcript-panel {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.transcript-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.live-indicator {
  color: #f97316;
}

.transcript-input {
  font-family: 'JetBrains Mono', monospace;
}

.submit-btn {
  height: 52px;
  border-radius: 18px;
  font-weight: 700;
}

.topic-rail {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 22px;
  position: sticky;
  top: 92px;
}

.rail-head {
  display: grid;
  gap: 4px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.rail-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.06rem;
  line-height: 1.45;
}

.question-box {
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.24);
  color: var(--text-color);
  line-height: 1.7;
}

.tips-section {
  display: grid;
  gap: 10px;
}

.tips-title {
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tips-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 900px) {
  .practice-shell {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .recorder-stage {
    padding: 16px 14px;
    border-radius: 22px;
  }

  .stage-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .stage-title {
    font-size: 1.02rem;
  }

  .stage-caption {
    max-width: none;
    text-align: left;
    font-size: 0.82rem;
  }

  .device-selector__controls {
    grid-template-columns: 1fr;
  }

  .topic-rail {
    position: static;
    top: auto;
  }

  .timer {
    font-size: 2rem;
  }

  .submit-btn {
    height: 48px;
  }

  :global(html[data-theme='light'] .recorder-stage),
  :global(html[data-theme='light'] .topic-rail) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 16px 30px rgba(148, 163, 184, 0.1);
  }

  :global(html[data-theme='light'] .topic-rail) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.12), transparent 36%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .stage-head),
  :global(html[data-theme='light'] .rail-head) {
    border-bottom-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .device-panel),
  :global(html[data-theme='light'] .transcript-panel) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    box-shadow: 0 8px 18px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .question-box) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
    color: #0f172a;
    border: 1px solid rgba(251, 191, 36, 0.2);
  }
}

@media (max-width: 480px) {
  .visualizer-circle {
    width: 104px;
    height: 104px;
  }

  .visualizer-canvas {
    width: 168px;
    height: 68px;
    bottom: -40px;
  }

  .record-btn {
    width: 68px;
    height: 68px;
  }

  .transcript-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .topic-rail,
  .question-box {
    padding: 14px;
  }
}

@media (min-width: 901px) {
  :global(html[data-theme='light'] .recorder-stage),
  :global(html[data-theme='light'] .topic-rail) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 40px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .topic-rail) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.14), transparent 36%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .stage-head),
  :global(html[data-theme='light'] .rail-head) {
    border-bottom-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .device-panel),
  :global(html[data-theme='light'] .transcript-panel) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.94);
    box-shadow: 0 10px 24px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .question-box) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.98));
    color: #0f172a;
    border: 1px solid rgba(251, 191, 36, 0.2);
  }
}
</style>

