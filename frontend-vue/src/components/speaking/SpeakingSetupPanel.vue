<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NSelect } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import {
  Languages,
  Mic,
  Target,
  MessageSquare,
  Briefcase,
  Compass,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Rocket,
  Timer,
  Radio,
  Volume2,
  Activity
} from 'lucide-vue-next'
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

const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.isLight)

const getTopicMeta = value => {
  const key = String(value || '').toLowerCase()
  if (key === 'daily') {
    return {
      titleEn: 'Daily Life & Socializing',
      tag: '高频核心',
      focus: '生活社交 · 快速敏捷反应',
      scenarios: ['休闲聚会', '餐厅咖啡', '日常问询'],
      accentColor: '#f97316',
      icon: MessageSquare
    }
  }
  if (key === 'work') {
    return {
      titleEn: 'Work & Professional',
      tag: '职场进阶',
      focus: '商务表达 · 结构化逻辑',
      scenarios: ['项目汇报', '业务沟通', '求职面试'],
      accentColor: '#3b82f6',
      icon: Briefcase
    }
  }
  if (key === 'travel') {
    return {
      titleEn: 'Travel & Exploration',
      tag: '海外生存',
      focus: '情景应对 · 实战问题解决',
      scenarios: ['机场值机', '酒店入住', '问路导览'],
      accentColor: '#10b981',
      icon: Compass
    }
  }
  if (key === 'academic') {
    return {
      titleEn: 'Academic & Discussion',
      tag: '高阶思辨',
      focus: '论据组织 · 学术严谨句式',
      scenarios: ['学术陈述', '课堂辩论', '观点论证'],
      accentColor: '#2b7a60',
      icon: GraduationCap
    }
  }
  return {
    titleEn: 'General Topic',
    tag: '口语特训',
    focus: '真实语境 · 地道口语表达',
    scenarios: ['情景交流', '观点表达'],
    accentColor: '#f97316',
    icon: MessageSquare
  }
}

const selectedTypeLabel = computed(() => {
  return (
    props.topicTypes.find(item => item.value === props.settings.type)?.label || props.settings.type
  )
})

const selectedTopicMeta = computed(() => {
  return getTopicMeta(props.settings.type)
})

const selectedDifficultyLabel = computed(() => {
  return (
    props.difficulties.find(item => item.value === props.settings.difficulty)?.label ||
    props.settings.difficulty
  )
})

const selectedInputLabel = computed(() => {
  return (
    props.audioInputOptions.find(item => item.value === props.selectedAudioInputDeviceId)?.label ||
    props.translate('浏览器默认麦克风', 'Default Microphone')
  )
})

const estimatedDuration = computed(() => {
  const diff = String(props.settings.difficulty || '').toLowerCase()
  if (diff === 'easy') return '2 ~ 3'
  if (diff === 'hard') return '4 ~ 6'
  return '3 ~ 5'
})
</script>

<template>
  <div class="setup-container">
    <section class="setup-shell" :class="{ 'setup-shell--light': isLightTheme }">
      <!-- 左侧：话题类型与录音设备舞台 -->
      <div class="setup-stage" :class="{ 'setup-stage--light': isLightTheme }">
        <div class="setup-stage-intro">
          <div class="setup-kicker">
            <span class="kicker-dot"></span>
            <span>{{ translate('口语准备', 'Speaking Setup') }}</span>
          </div>
          <h2 class="setup-title">
            {{
              translate(
                '先定话题方向和设备，再开始本次口语练习',
                'Set the topic direction and device before starting this speaking practice'
              )
            }}
          </h2>
          <p class="setup-caption">
            {{
              translate(
                '选择契合你提升诉求的真实口语情景，配置稳定降噪麦克风，AI 将生成考试级实战试题。',
                'Choose the speaking topic and recording settings before you start.'
              )
            }}
          </p>
        </div>

        <div class="setup-sections">
          <!-- 话题类型选择 -->
          <div class="setting-section">
            <div class="section-heading-wrap">
              <Languages :size="18" class="heading-icon" />
              <h3 class="section-title">
                {{ translate('话题方向与场景库', 'Topic Direction & Scenarios') }}
              </h3>
              <span class="section-counter-badge">{{ topicTypes.length }} 个实战大类</span>
            </div>

            <div class="type-grid">
              <div
                v-for="t in topicTypes"
                :key="t.value"
                class="type-card"
                :class="{
                  active: settings.type === t.value,
                  'type-card--light': isLightTheme
                }"
                :style="{
                  '--accent-color': getTopicMeta(t.value).accentColor
                }"
                @click="emit('update-setting', 'type', t.value)"
              >
                <!-- 顶部流光饰线 -->
                <div class="card-top-line"></div>

                <!-- 背景微光光晕 -->
                <div class="card-glow-bg"></div>

                <!-- 右上角角标 -->
                <div v-if="settings.type === t.value" class="card-check-badge">
                  <n-icon :component="CheckCircle2" size="14" />
                </div>
                <div v-else class="card-tag-badge">
                  {{ getTopicMeta(t.value).tag }}
                </div>

                <!-- 图标与标题行 -->
                <div class="card-header-row">
                  <div class="type-icon-box">
                    <component :is="getTopicMeta(t.value).icon" :size="22" />
                  </div>
                  <div class="type-title-group">
                    <span class="type-label">{{ t.label }}</span>
                    <span class="type-sub-en">{{ getTopicMeta(t.value).titleEn }}</span>
                  </div>
                </div>

                <!-- 考评重心条 -->
                <div class="card-focus-strip">
                  <Activity :size="12" class="focus-icon" />
                  <span>{{ getTopicMeta(t.value).focus }}</span>
                </div>

                <!-- 场景标签胶囊组 -->
                <div class="card-scenarios-strip">
                  <span
                    v-for="(scenario, sIdx) in getTopicMeta(t.value).scenarios"
                    :key="sIdx"
                    class="scenario-pill"
                  >
                    {{ scenario }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 麦克风设备面板 -->
          <div class="setting-section">
            <div class="section-heading-wrap">
              <Mic :size="18" class="heading-icon" />
              <h3 class="section-title">{{ translate('音频输入设备', 'Microphone Device') }}</h3>
            </div>

            <div class="device-panel" :class="{ 'device-panel--light': isLightTheme }">
              <div class="device-copy">
                <div class="device-label-row">
                  <span class="device-label">{{ translate('当前输入源', 'Current Input') }}</span>
                  <span class="device-status-badge">
                    <span class="pulse-indicator"></span>
                    <span>{{
                      selectedAudioInputDeviceId
                        ? translate('已捕获外置麦克风', 'External Mic Active')
                        : translate('系统默认设备就绪', 'Default Ready')
                    }}</span>
                  </span>
                </div>
                <p class="device-caption">
                  {{
                    translate(
                      '选择高保真稳定的输入设备，避免录音作答前频繁插拔或切换。',
                      'Choose a stable input device before you start recording.'
                    )
                  }}
                </p>
              </div>

              <div class="device-row">
                <n-select
                  :value="selectedAudioInputDeviceId"
                  :options="audioInputOptions"
                  :placeholder="translate('请选择麦克风', 'Select a microphone')"
                  :disabled="isLoading"
                  class="device-select"
                  @update:value="emit('update:audio-input-device-id', $event)"
                />
                <button
                  type="button"
                  class="device-refresh-btn"
                  :disabled="isLoading"
                  @click="emit('refresh-audio-input-devices')"
                >
                  <RefreshCw :size="14" class="refresh-icon" />
                  <span>{{ translate('刷新设备', 'Refresh') }}</span>
                </button>
              </div>

              <div class="device-engine-tip">
                <Radio :size="13" />
                <span>{{
                  translate(
                    '系统采用双核音频捕获引擎，支持本地 Vosk 离线与浏览器实时流式双重语音识别转写',
                    'Dual-engine speech recognition ready.'
                  )
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：会话控制与生成边栏 -->
      <aside class="setup-sidebar">
        <div class="side-settings" :class="{ 'side-settings--light': isLightTheme }">
          <div class="settings-top-accent"></div>

          <div class="rail-head">
            <div class="rail-kicker-badge">
              <Sparkles :size="13" />
              <span>{{ translate('开始练习', 'Start Practice') }}</span>
            </div>
            <h3 class="rail-title">
              {{
                translate(
                  '确认难度与设备后生成口语话题',
                  'Confirm difficulty and device before generating a topic'
                )
              }}
            </h3>
          </div>

          <!-- 难度等级控制 -->
          <div class="setting-section compact">
            <h4 class="rail-sub-title">
              <Target :size="14" />
              <span>{{ translate('挑战难度', 'Difficulty') }}</span>
            </h4>
            <div class="pill-options">
              <button
                v-for="d in difficulties"
                :key="d.value"
                type="button"
                class="pill-option"
                :class="{
                  active: settings.difficulty === d.value,
                  'pill-option--light': isLightTheme
                }"
                @click="emit('update-setting', 'difficulty', d.value)"
              >
                {{ d.label }}
              </button>
            </div>
          </div>

          <!-- 新增：口语训练参数概要小看板 (Session Briefing Card) -->
          <div
            class="session-briefing-card"
            :class="{ 'session-briefing-card--light': isLightTheme }"
          >
            <div class="briefing-header">
              <span class="briefing-pulse-dot"></span>
              <span class="briefing-header-text">{{
                translate('参数已锁定 · 录音引擎待命', 'Parameters Locked & Ready')
              }}</span>
            </div>

            <div class="briefing-grid">
              <div class="briefing-item">
                <span class="briefing-item-label">{{
                  translate('话题方向', 'Topic Direction')
                }}</span>
                <span class="briefing-item-value highlight">{{ selectedTypeLabel }}</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">{{ translate('梯度难度', 'Difficulty') }}</span>
                <span class="briefing-item-value">{{ selectedDifficultyLabel }}</span>
              </div>
              <div class="briefing-item full-row">
                <span class="briefing-item-label">{{
                  translate('麦克风设备', 'Input Device')
                }}</span>
                <span class="briefing-item-value truncate">{{ selectedInputLabel }}</span>
              </div>
              <div class="briefing-item full-row">
                <span class="briefing-item-label">{{ translate('AI 评测标准', 'Criteria') }}</span>
                <span class="briefing-item-value eval-tags">流利度 · 语法 · 切题度 · 词汇量</span>
              </div>
            </div>

            <div class="briefing-footer-hint">
              <Timer :size="13" />
              <span
                >预计作答时长约 <strong>{{ estimatedDuration }}</strong> 分钟 · 沉浸实战</span
              >
            </div>
          </div>

          <!-- 操作按钮区 -->
          <div class="action-footer">
            <button
              type="button"
              class="speaking-start-btn glow-btn"
              :class="{ 'is-loading': isLoading }"
              :disabled="isLoading"
              @click="emit('generate')"
            >
              <Rocket :size="18" class="rocket-icon" />
              <span>{{
                isLoading
                  ? translate('正在生成实战话题与录音环境...', 'Generating Topic...')
                  : translate('生成口语话题', 'Generate Speaking Topic')
              }}</span>
              <div class="btn-shimmer"></div>
            </button>
            <p class="rail-note">
              {{
                translate(
                  '进入练习后可直接开始录音、观察实时语音波形并在答题后获取多维度评分报告。',
                  'Once inside practice, you can record, review transcript, and get AI feedback.'
                )
              }}
            </p>
          </div>
        </div>
      </aside>
    </section>

    <!-- 历史记录面板 -->
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

<style scoped>
.setup-container {
  width: 100%;
}

.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 28px;
  align-items: start;
}

/* ================== 左侧舞台卡片 (Setup Stage) ================== */
.setup-stage {
  min-width: 0;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  padding: 30px;
}

.setup-stage-intro {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.setup-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: var(--tone-orange);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
}

.setup-title {
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 1.85rem);
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.01em;
  background: none;
  color: inherit;
}

.setup-caption {
  margin: 10px 0 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  max-width: 36rem;
}

.setup-sections {
  display: grid;
  gap: 26px;
}

.setting-section {
  padding-top: 24px;
  border-top: 1px solid var(--card-border);
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

.section-heading-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.heading-icon {
  color: var(--tone-orange);
}

.section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-color);
}

.section-counter-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
}

/* ================== 话题类型卡片网格 (Type Grid) ================== */
.type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.type-card {
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  min-height: 136px;
}

.card-top-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: all 0.3s ease;
}

.card-glow-bg {
  position: absolute;
  inset: 0;
  background: #f97316;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.type-card:hover {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.35);
  transform: translateY(-2px);
}

.type-card:hover .card-glow-bg {
  opacity: 0.08;
}

.type-card.active {
  background: var(--card-bg);
  border: 1.5px solid rgba(249, 115, 22, 0.8);
  box-shadow:
    0 12px 32px rgba(249, 115, 22, 0.2),
    inset 0 0 0 1px rgba(249, 115, 22, 0.4);
}

.type-card.active .card-top-line {
  background: #f97316;
}

.type-card.active .card-glow-bg {
  opacity: 0.14;
}

/* 右上角角标 */
.card-check-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f97316;
  /* 实心橙底固定深色 ink（R4） */
  color: #40200a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.card-tag-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 2px 7px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.type-card:hover .card-tag-badge {
  color: var(--tone-orange);
  border-color: rgba(249, 115, 22, 0.3);
}

/* 图标与标题行 */
.card-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 32px;
}

.type-icon-box {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--tone-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.type-card:hover .type-icon-box {
  transform: scale(1.05);
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--tone-orange);
}

.type-card.active .type-icon-box {
  background: rgba(249, 115, 22, 0.22);
  border-color: rgba(249, 115, 22, 0.6);
  color: var(--tone-orange);
}

.type-title-group {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.type-label {
  font-weight: 800;
  font-size: 1.02rem;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.type-sub-en {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 考评重心条 */
.card-focus-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 4px 8px;
  border-radius: 6px;
  width: fit-content;
}

.focus-icon {
  color: var(--tone-orange);
}

.type-card.active .card-focus-strip {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.25);
  color: var(--tone-orange);
}

/* 场景胶囊组 */
.card-scenarios-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.scenario-pill {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 7px;
  border-radius: 4px;
}

.type-card.active .scenario-pill {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

/* ================== 麦克风面板 (Device Panel) ================== */
.device-panel {
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.device-copy {
  display: grid;
  gap: 6px;
}

.device-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.device-label {
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 800;
}

.device-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  padding: 2px 8px;
  border-radius: 999px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s infinite ease-in-out;
}

.device-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.8rem;
  line-height: 1.5;
}

.device-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.device-refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--secondary-text);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.device-refresh-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.4);
  color: var(--tone-orange);
}

.device-refresh-btn:hover .refresh-icon {
  transform: rotate(90deg);
}

.refresh-icon {
  transition: transform 0.3s ease;
}

.device-engine-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.73rem;
  color: var(--secondary-text);
  padding-top: 4px;
}

/* ================== 右侧控制台 (Setup Sidebar) ================== */
.setup-sidebar {
  min-width: 0;
}

.side-settings {
  position: relative;
  overflow: hidden;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  display: flex;
  flex-direction: column;
}

.settings-top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f97316;
}

.rail-head {
  display: grid;
  gap: 8px;
  margin-bottom: 22px;
}

.rail-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tone-orange);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.35;
}

.rail-sub-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: var(--secondary-text);
  margin: 0 0 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pill-options {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
}

.pill-option {
  flex: 1;
  text-align: center;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.pill-option:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--text-color);
}

.pill-option.active {
  background: #f97316;
  /* 实心橙底固定深色 ink（R4） */
  color: #40200a;
  border-color: rgba(255, 255, 255, 0.25);
  font-weight: 800;
}

/* ================== 会话启动概要小看板 (Session Briefing Card) ================== */
.session-briefing-card {
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 14px 16px;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.briefing-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.briefing-pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-dot 2s infinite ease-in-out;
}

.briefing-header-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--secondary-text);
  letter-spacing: 0.04em;
}

.briefing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.briefing-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.briefing-item.full-row {
  grid-column: span 2;
}

.briefing-item-label {
  font-size: 0.7rem;
  color: var(--secondary-text);
  font-weight: 600;
}

.briefing-item-value {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-color);
}

.briefing-item-value.highlight {
  color: var(--tone-orange);
}

.briefing-item-value.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.briefing-item-value.eval-tags {
  font-size: 0.74rem;
  color: var(--secondary-text);
  font-weight: 600;
}

.briefing-footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
  font-size: 0.72rem;
  color: var(--secondary-text);
}

.briefing-footer-hint strong {
  color: var(--tone-orange);
}

/* ================== 主行动按钮 (Hero Start Button) ================== */
.action-footer {
  display: grid;
  gap: 10px;
  margin-top: auto;
}

.speaking-start-btn {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: 1.02rem;
  font-weight: 800;
  /* 实心橙底固定深色 ink（R4） */
  color: #40200a;
  background: #f97316;
  transition: all 0.25s ease;
}

.btn-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: var(--card-bg);
  transform: skewX(-20deg);
  animation: shimmer-btn 3.5s infinite ease-in-out;
}

@keyframes shimmer-btn {
  0% {
    left: -100%;
  }
  40%,
  100% {
    left: 200%;
  }
}

.rocket-icon {
  transition: transform 0.25s ease;
}

.speaking-start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.speaking-start-btn:hover:not(:disabled) .rocket-icon {
  transform: translateY(-2px) rotate(-8deg);
}

.speaking-start-btn:active:not(:disabled) {
  transform: translateY(0);
}

.speaking-start-btn:disabled {
  /* R8：整块 0.7 透明度会让墨色文字掉到 2.7:1，改为弱化底色 + 次级文字 */
  opacity: 1;
  background: var(--surface-muted);
  color: var(--secondary-text);
  cursor: not-allowed;
  filter: grayscale(0.2);
}

.rail-note {
  margin: 0;
  font-size: 0.74rem;
  color: var(--secondary-text);
  text-align: center;
  line-height: 1.45;
}

@keyframes pulse-dot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
}

/* ================== 浅色模式适配 (Light Theme) ================== */
.setup-stage--light {
  border-color: rgba(148, 163, 184, 0.22);
  background: var(--card-bg);
}

.setup-stage--light .setup-stage-intro {
  border-bottom-color: rgba(148, 163, 184, 0.16);
}

.setup-stage--light .setup-title {
  background: none;
  color: inherit;
}

.setup-stage--light .setup-caption {
  color: #475569;
}

.setup-stage--light .section-title {
  color: #0f172a;
}

.setup-stage--light .section-counter-badge {
  color: #475569;
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(148, 163, 184, 0.2);
}

.setup-stage--light .type-card {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

.setup-stage--light .type-card:hover {
  background: #ffffff;
  border-color: rgba(249, 115, 22, 0.45);
}

.setup-stage--light .type-card.active {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.7);
}

.setup-stage--light .type-label {
  color: #0f172a;
}

.setup-stage--light .type-sub-en {
  color: #475569;
}

.setup-stage--light .card-tag-badge {
  color: var(--secondary-text);
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.setup-stage--light .type-icon-box {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.2);
  color: var(--tone-orange);
}

.setup-stage--light .card-focus-strip {
  color: #334155;
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.setup-stage--light .scenario-pill {
  color: #475569;
  background: rgba(15, 23, 42, 0.035);
  border-color: rgba(148, 163, 184, 0.18);
}

.setup-stage--light .device-panel {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

.setup-stage--light .device-label {
  color: #0f172a;
}

.setup-stage--light .device-caption {
  color: #475569;
}

.setup-stage--light .device-refresh-btn {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.25);
  color: #334155;
}

.setup-stage--light .device-refresh-btn:hover {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.4);
  color: var(--tone-orange);
}

.setup-stage--light .device-engine-tip {
  color: var(--secondary-text);
}

.side-settings--light {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.22);
}

.side-settings--light .rail-title {
  color: #0f172a;
}

.side-settings--light .rail-sub-title {
  color: #475569;
}

.side-settings--light .pill-option {
  border-color: rgba(148, 163, 184, 0.22);
  background: #ffffff;
  color: #1e293b;
}

.side-settings--light .pill-option:hover {
  background: #f8fafc;
  border-color: rgba(249, 115, 22, 0.4);
}

.side-settings--light .pill-option.active {
  background: #f97316;
  /* 实心橙底统一固定深色 ink */
  color: #40200a;
}

.side-settings--light .session-briefing-card {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

.side-settings--light .briefing-header-text {
  color: #475569;
}

.side-settings--light .briefing-item-label {
  color: var(--secondary-text);
}

.side-settings--light .briefing-item-value {
  color: #0f172a;
}

.side-settings--light .briefing-item-value.highlight {
  color: var(--tone-orange);
}

.side-settings--light .briefing-item-value.eval-tags {
  color: #475569;
}

.side-settings--light .briefing-footer-hint {
  border-top-color: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.side-settings--light .briefing-footer-hint strong {
  color: #c2410c;
}

.side-settings--light .rail-note {
  color: var(--secondary-text);
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1080px) {
  .setup-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .setup-stage {
    padding: 20px 16px;
    border-radius: var(--radius-lg);
  }

  .type-grid {
    grid-template-columns: 1fr;
  }

  .device-row {
    grid-template-columns: 1fr;
  }
}
</style>
