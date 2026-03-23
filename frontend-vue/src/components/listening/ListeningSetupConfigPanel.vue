<script setup>
import { NButton, NCard, NDivider, NGrid, NGridItem, NIcon } from 'naive-ui'
import {
  Book,
  BookOpen,
  Clock,
  Globe,
  GraduationCap,
  Layers,
  MessageCircle,
  Mic,
  Rocket,
  RotateCcw,
  Target
} from 'lucide-vue-next'

const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  counts: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  speeds: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['clear-state', 'set-setting', 'generate'])

const getExamTypeIcon = (value) => {
  if (value === 'ted') return Mic
  if (value === 'bbc') return Globe
  if (value === 'dialog') return MessageCircle
  if (value === 'toefl') return GraduationCap
  if (value === 'ielts') return BookOpen
  return Book
}

const updateSetting = (key, value) => {
  emit('set-setting', { key, value })
}
</script>

<template>
  <n-card class="setup-card" :bordered="false" size="huge">
    <div class="setup-shell">
      <div class="setup-stage">
        <div class="setup-header">
          <div class="setup-intro">
            <p class="setup-kicker">听力练习</p>
            <h2 class="setup-title">{{ props.translate('先定听力语境，再开始本次听力练习', 'Set the listening context before starting this listening practice') }}</h2>
            <p class="setup-caption">{{ props.translate('先选择听力来源，再设置篇数、难度和语速。', 'Choose the listening source first, then set the passage count, difficulty, and speed.') }}</p>
          </div>
          <n-button size="tiny" quaternary @click="emit('clear-state')">
            <template #icon><n-icon :component="RotateCcw" /></template>
            {{ props.translate('重置练习状态', 'Reset Practice State') }}
          </n-button>
        </div>

        <div class="setting-section">
          <h3><n-icon :component="Target" color="#6366f1" /> {{ props.translate('听力来源', 'Listening Source') }}</h3>
          <div class="grid-options source-grid">
            <div
              v-for="examType in props.examTypes"
              :key="examType.value"
              class="option-card"
              :class="{ active: props.settings.examType === examType.value }"
              @click="updateSetting('examType', examType.value)"
            >
              <div class="icon-box">
                <n-icon :component="getExamTypeIcon(examType.value)" />
              </div>
              <span class="option-label">{{ examType.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <aside class="settings-box">
        <div class="rail-head">
          <p class="rail-kicker">{{ props.translate('开始前检查', 'Session Check') }}</p>
          <h3 class="rail-title">{{ props.translate('确认篇数、难度和语速', 'Review count, difficulty, and speed') }}</h3>
        </div>

        <n-grid x-gap="24" y-gap="20" cols="1">
          <n-grid-item>
            <div class="setting-sub-section">
              <h4><n-icon :component="Layers" size="16" /> {{ props.translate('篇章数量', 'Passage Count') }}</h4>
              <div class="pill-options">
                <div
                  v-for="count in props.counts"
                  :key="count.value"
                  class="pill-option"
                  :class="{ active: props.settings.count === count.value }"
                  @click="updateSetting('count', count.value)"
                >
                  {{ count.label }}
                </div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="setting-sub-section">
              <h4><n-icon :component="Target" size="16" /> {{ props.translate('难度等级', 'Difficulty') }}</h4>
              <div class="pill-options">
                <div
                  v-for="difficulty in props.difficulties"
                  :key="difficulty.value"
                  class="pill-option"
                  :class="{ active: props.settings.difficulty === difficulty.value }"
                  @click="updateSetting('difficulty', difficulty.value)"
                >
                  {{ difficulty.label }}
                </div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="setting-sub-section">
              <h4><n-icon :component="Clock" size="16" /> {{ props.translate('语速控制', 'Playback Speed') }}</h4>
              <div class="pill-options">
                <div
                  v-for="speed in props.speeds"
                  :key="speed.value"
                  class="pill-option"
                  :class="{ active: props.settings.speed === speed.value }"
                  @click="updateSetting('speed', speed.value)"
                >
                  {{ speed.label }}
                </div>
              </div>
            </div>
          </n-grid-item>
        </n-grid>

        <n-divider style="margin: 20px 0; opacity: 0.1" />

        <n-button
          type="primary"
          size="large"
          block
          class="start-btn"
          :loading="props.isLoading"
          @click="emit('generate')"
          color="#f97316"
        >
          <template #icon><n-icon :component="Rocket" /></template>
          {{ props.translate('生成听力材料', 'Generate Listening Materials') }}
        </n-button>
      </aside>
    </div>
  </n-card>
</template>

<style scoped>
.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.setup-stage {
  min-width: 0;
}

.setup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
}

.setup-intro {
  display: grid;
  gap: 8px;
}

.setup-kicker,
.rail-kicker {
  margin: 0;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.setup-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.42rem;
  line-height: 1.25;
}

.setup-caption,
.rail-title {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
}

.setup-card {
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.52), rgba(15, 23, 42, 0.26)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.07), transparent 42%);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.setup-card :deep(.n-card) {
  background: transparent !important;
  border: 0 !important;
  color: var(--text-color);
}

.setup-card :deep(.n-card__content) {
  color: var(--text-color);
}

.setting-section {
  margin-bottom: 0;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-color);
  font-weight: 700;
}

.grid-options.source-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.option-card {
  background: rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 18px 14px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 118px;
}

.option-card:hover {
  background: rgba(15, 23, 42, 0.3);
  transform: translateY(-1px);
}

.option-card.active {
  background:
    linear-gradient(180deg, rgba(251, 146, 60, 0.12), rgba(249, 115, 22, 0.04)),
    rgba(15, 23, 42, 0.24);
  border-color: rgba(249, 115, 22, 0.42);
  color: var(--text-color);
  box-shadow: none;
}

.icon-box {
  font-size: 2rem;
  margin-bottom: 12px;
  color: #7dd3fc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-card.active .icon-box {
  color: #fdba74;
}

.option-label {
  font-weight: 600;
  font-size: 1rem;
}

.settings-box {
  background: rgba(15, 23, 42, 0.22);
  border-radius: 22px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.rail-head {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}

.setting-sub-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: var(--secondary-text);
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.pill-option {
  flex: 1;
  min-width: 80px;
  text-align: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.24);
  border: 1px solid rgba(148, 163, 184, 0.1);
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: var(--theme-transition);
}

.pill-option:hover {
  background: rgba(15, 23, 42, 0.32);
}

.pill-option.active {
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: #fff;
  border-color: transparent;
  font-weight: 600;
  box-shadow: none;
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 16px;
}

:global(html[data-theme='light'] .setup-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.1), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .option-card),
:global(html[data-theme='light'] .settings-box),
:global(html[data-theme='light'] .pill-option) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

:global(html[data-theme='light'] .option-card:hover),
:global(html[data-theme='light'] .pill-option:hover) {
  background: rgba(255, 255, 255, 0.98);
}

:global(html[data-theme='light'] .option-card.active) {
  background:
    linear-gradient(180deg, rgba(255, 237, 213, 0.84), rgba(255, 247, 237, 0.76)),
    rgba(255, 255, 255, 0.94);
}

:global(html[data-theme='light'] .setup-title),
:global(html[data-theme='light'] .setting-section h3),
:global(html[data-theme='light'] .rail-title),
:global(html[data-theme='light'] .option-label) {
  color: #0f172a;
}

:global(html[data-theme='light'] .setup-caption),
:global(html[data-theme='light'] .setting-sub-section h4),
:global(html[data-theme='light'] .pill-option),
:global(html[data-theme='light'] .rail-kicker),
:global(html[data-theme='light'] .rail-title),
:global(html[data-theme='light'] .option-desc) {
  color: #64748b;
}

:global(html[data-theme='light'] .option-card.active .icon-box) {
  color: #f97316;
}

@media (max-width: 900px) {
  .setup-shell {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .setup-card {
    border-radius: 20px;
  }

  .setup-header {
    flex-direction: column;
    gap: 8px;
  }

  .setup-title {
    font-size: 1.05rem;
  }

  .setting-section {
    margin-bottom: 18px;
  }

  .setting-section h3 {
    font-size: 0.96rem;
    margin-bottom: 10px;
  }

  .grid-options.source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .option-card {
    min-height: 78px;
    padding: 12px 10px;
    border-radius: 14px;
    gap: 8px;
  }

  .icon-box {
    font-size: 1.35rem;
    margin-bottom: 0;
  }

  .option-label {
    font-size: 0.88rem;
    line-height: 1.3;
  }

  .settings-box {
    border-radius: 18px;
    padding: 14px 12px;
  }

  .setting-sub-section h4 {
    margin-bottom: 8px;
    font-size: 0.82rem;
  }

  .pill-options {
    gap: 8px;
  }

  .pill-option {
    flex: 1 1 calc(50% - 10px);
    min-width: 0;
    padding: 9px 10px;
    font-size: 0.86rem;
  }

  .start-btn {
    height: 48px;
    font-size: 0.95rem;
  }
}

@media (max-width: 520px) {
  .grid-options.source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .option-card {
    min-height: 72px;
    padding: 10px 8px;
  }

  .option-label {
    font-size: 0.84rem;
  }

  .pill-option {
    flex-basis: calc(50% - 8px);
  }
}
</style>
