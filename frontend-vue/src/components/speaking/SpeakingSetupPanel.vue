<template>
  <div class="setup-container">
    <section class="setup-shell">
      <div class="setup-stage">
        <div class="setup-stage-intro">
          <p class="setup-kicker">{{ translate('口语准备', 'Speaking Setup') }}</p>
          <h2 class="setup-title">{{ translate('先定话题方向和设备，再开始本次口语练习', 'Set the topic direction and device before starting this speaking practice') }}</h2>
          <p class="setup-caption">{{ translate('先选择口语话题和录音设置，再开始本次练习。', 'Choose the speaking topic and recording settings before you start.') }}</p>
        </div>

        <div class="setup-sections">
          <div class="setting-section">
            <h3><n-icon :component="Languages" color="#fb923c" /> {{ translate('话题类型', 'Topic Type') }}</h3>
            <div class="type-grid">
              <button
                v-for="t in topicTypes"
                :key="t.value"
                type="button"
                class="type-card"
                :class="{ active: settings.type === t.value }"
                @click="emit('update-setting', 'type', t.value)"
              >
                <span class="type-icon">{{ t.icon }}</span>
                <span class="type-copy">
                  <span class="type-label">{{ t.label }}</span>
                  <span class="type-state">{{ settings.type === t.value ? translate('当前选择', 'Selected') : translate('切换到此方向', 'Use this topic') }}</span>
                </span>
              </button>
            </div>
          </div>

          <div class="setting-section">
            <h3><n-icon :component="Mic" color="#fb923c" /> {{ translate('麦克风设备', 'Microphone Device') }}</h3>
            <div class="device-panel">
              <div class="device-copy">
                <span class="device-label">{{ translate('当前输入', 'Current Input') }}</span>
                <p class="device-caption">{{ translate('选择稳定的输入设备，避免录音前频繁切换。', 'Choose a stable input device before you start recording.') }}</p>
              </div>
              <div class="device-row">
                <n-select
                  :value="selectedAudioInputDeviceId"
                  :options="audioInputOptions"
                  :placeholder="translate('请选择麦克风', 'Select a microphone')"
                  :disabled="isLoading"
                  @update:value="emit('update:audio-input-device-id', $event)"
                />
                <n-button secondary :disabled="isLoading" @click="emit('refresh-audio-input-devices')">
                  {{ translate('刷新设备', 'Refresh Devices') }}
                </n-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside class="setup-sidebar">
        <div class="side-settings">
          <div class="rail-head">
            <p class="rail-kicker">{{ translate('开始练习', 'Start Practice') }}</p>
            <h3 class="rail-title">{{ translate('确认难度与设备后生成口语话题', 'Confirm difficulty and device before generating a topic') }}</h3>
            <p class="rail-caption">{{ translate('确认设置后即可生成本次口语话题。', 'Confirm your settings to generate this speaking topic.') }}</p>
          </div>

          <div class="setting-section compact">
            <h3><n-icon :component="Target" color="#fb923c" /> {{ translate('难度', 'Difficulty') }}</h3>
            <div class="pill-options">
              <button
                v-for="d in difficulties"
                :key="d.value"
                type="button"
                class="pill-option"
                :class="{ active: settings.difficulty === d.value }"
                @click="emit('update-setting', 'difficulty', d.value)"
              >
                {{ d.label }}
              </button>
            </div>
          </div>

          <div class="selection-summary">
            <div class="summary-row">
              <span>{{ translate('话题类型', 'Topic') }}</span>
              <strong>{{ selectedTypeLabel }}</strong>
            </div>
            <div class="summary-row">
              <span>{{ translate('难度', 'Difficulty') }}</span>
              <strong>{{ selectedDifficultyLabel }}</strong>
            </div>
            <div class="summary-row">
              <span>{{ translate('设备', 'Device') }}</span>
              <strong>{{ selectedInputLabel }}</strong>
            </div>
          </div>

          <p class="rail-note">{{ translate('进入练习后可直接录音、查看转写并提交答案。', 'Once inside practice, you can record, review the transcript, and submit your answer.') }}</p>

          <n-button type="primary" size="large" block class="start-btn" :loading="isLoading" @click="emit('generate')">
            {{ translate('生成话题', 'Generate Topic') }}
          </n-button>
        </div>
      </aside>
    </section>

    <SpeakingHistoryPanel
      :topics="topics"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :translate="translate"
      :show-date="true"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:page-size', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NSelect } from 'naive-ui'
import { Languages, Mic, Target } from 'lucide-vue-next'
import SpeakingHistoryPanel from '@/components/speaking/SpeakingHistoryPanel.vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  topicTypes: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  audioInputOptions: {
    type: Array,
    default: () => []
  },
  selectedAudioInputDeviceId: {
    type: String,
    default: ''
  },
  topics: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 6
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  translate: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'update-setting',
  'update:audio-input-device-id',
  'refresh-audio-input-devices',
  'generate',
  'select',
  'update:page',
  'update:page-size'
])

const selectedTypeLabel = computed(() => props.topicTypes.find(item => item.value === props.settings.type)?.label || '-')
const selectedDifficultyLabel = computed(() => props.difficulties.find(item => item.value === props.settings.difficulty)?.label || '-')
const selectedInputLabel = computed(() => props.audioInputOptions.find(item => item.value === props.selectedAudioInputDeviceId)?.label || props.translate('默认麦克风', 'Default microphone'))
</script>

<style scoped>
.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.setup-stage {
  min-width: 0;
  padding: 26px 28px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.24)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.06), transparent 42%);
}

.setup-stage-intro {
  margin-bottom: 22px;
}

.setup-kicker,
.rail-kicker {
  margin: 0 0 10px;
  color: #fb923c;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.setup-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.65rem;
  line-height: 1.18;
}

.setup-caption,
.rail-caption,
.rail-note,
.device-caption {
  margin: 12px 0 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.setup-sections {
  display: grid;
  gap: 0;
}

.setting-section {
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.setting-section:first-child {
  padding-top: 0;
  border-top: 0;
}

.setting-section.compact {
  padding-top: 0;
  border-top: 0;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  margin: 0 0 14px;
  color: var(--text-color);
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.type-card {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  text-align: left;
  color: inherit;
  background: rgba(15, 23, 42, 0.22);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.type-card:hover {
  background: rgba(15, 23, 42, 0.34);
  border-color: rgba(251, 146, 60, 0.22);
  transform: translateY(-1px);
}

.type-card.active {
  background:
    linear-gradient(180deg, rgba(251, 146, 60, 0.14), rgba(249, 115, 22, 0.06)),
    rgba(15, 23, 42, 0.24);
  border-color: rgba(251, 146, 60, 0.45);
}

.type-icon {
  font-size: 1.4rem;
  font-weight: 800;
}

.type-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.type-label {
  font-weight: 600;
  font-size: 0.96rem;
  color: var(--text-color);
}

.type-state {
  color: var(--secondary-text);
  font-size: 0.78rem;
  line-height: 1.45;
}

.device-panel {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.18);
}

.device-copy {
  display: grid;
  gap: 4px;
}

.device-label {
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 700;
}

.device-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.setup-sidebar {
  min-width: 0;
  position: sticky;
  top: 92px;
}

.side-settings {
  display: grid;
  gap: 18px;
  padding: 22px 20px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.rail-head {
  display: grid;
  gap: 8px;
}

.rail-title {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.35;
  color: var(--text-color);
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill-option {
  flex: 1;
  min-width: 88px;
  text-align: center;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.12);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.pill-option.active {
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: white;
  border-color: transparent;
}

.selection-summary {
  display: grid;
  gap: 10px;
  padding: 16px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.summary-row strong {
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 700;
}

.rail-note {
  margin: 0;
  padding-top: 2px;
  font-size: 0.88rem;
}

.start-btn {
  height: 56px;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 18px;
  background: linear-gradient(135deg, #fb923c, #f97316) !important;
  box-shadow: none;
}

@media (max-width: 900px) {
  .setup-shell {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .setup-stage {
    padding: 16px 14px;
    border-radius: 20px;
  }

  .setup-stage-intro {
    margin-bottom: 14px;
  }

  .setup-title {
    font-size: 1.12rem;
  }

  .setup-caption,
  .rail-caption,
  .rail-note,
  .device-caption {
    margin-top: 8px;
    font-size: 0.86rem;
    line-height: 1.55;
  }

  .type-grid {
    grid-template-columns: 1fr;
  }

  .device-row {
    grid-template-columns: 1fr;
  }

  .setup-sidebar {
    position: static;
    top: auto;
  }

  .side-settings {
    padding: 12px 10px;
    border-radius: 18px;
  }

  .type-card {
    padding: 12px 14px;
    border-radius: 16px;
  }

  .start-btn {
    height: 48px;
    font-size: 0.95rem;
  }

  :global(html[data-theme='light'] .setup-stage),
  :global(html[data-theme='light'] .side-settings) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 16px 30px rgba(148, 163, 184, 0.1);
  }

  :global(html[data-theme='light'] .side-settings) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.12), transparent 38%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .setting-section) {
    border-top-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .type-card),
  :global(html[data-theme='light'] .device-panel),
  :global(html[data-theme='light'] .pill-option) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    box-shadow: 0 8px 18px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .type-card.active) {
    background:
      linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98)),
      #ffffff;
    border-color: rgba(251, 146, 60, 0.44);
  }

  :global(html[data-theme='light'] .pill-option) {
    color: #475569;
  }

  :global(html[data-theme='light'] .selection-summary) {
    border-top-color: rgba(226, 232, 240, 0.92);
    border-bottom-color: rgba(226, 232, 240, 0.92);
  }
}

@media (min-width: 901px) {
  :global(html[data-theme='light'] .setup-stage),
  :global(html[data-theme='light'] .side-settings) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 40px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .side-settings) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.14), transparent 38%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .setting-section) {
    border-top-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .type-card),
  :global(html[data-theme='light'] .device-panel),
  :global(html[data-theme='light'] .pill-option) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    box-shadow: 0 10px 24px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .type-card:hover),
  :global(html[data-theme='light'] .pill-option:hover) {
    background: rgba(255, 247, 237, 0.97);
    border-color: rgba(251, 146, 60, 0.34);
  }

  :global(html[data-theme='light'] .type-card.active) {
    background:
      linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98)),
      #ffffff;
    border-color: rgba(251, 146, 60, 0.44);
  }

  :global(html[data-theme='light'] .pill-option) {
    color: #475569;
  }

  :global(html[data-theme='light'] .selection-summary) {
    border-top-color: rgba(226, 232, 240, 0.92);
    border-bottom-color: rgba(226, 232, 240, 0.92);
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

