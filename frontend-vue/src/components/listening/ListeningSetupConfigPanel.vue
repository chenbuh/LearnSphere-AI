<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
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
  Target,
  CheckCircle2,
  Sparkles,
  Headphones,
  Zap,
  Volume2,
  BookmarkCheck,
  Timer
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
const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.isLight)

const getExamTypeIcon = (value) => {
  const v = String(value || '').toLowerCase()
  if (v === 'ted') return Mic
  if (v === 'bbc') return Globe
  if (v === 'dialog') return MessageCircle
  if (v === 'toefl') return GraduationCap
  if (v === 'ielts') return BookOpen
  return Book
}

const getExamTypeSub = (value) => {
  const map = {
    primary: '基础启蒙 · 慢速短句与趣味情景',
    middle: '中考听力 · 校园生活与交际日常',
    high: '高考真题 · 考纲长文与思维理解',
    'cet-4': '大学四级 · 校园演讲与社会速递',
    cet4: '大学四级 · 校园演讲与社会速递',
    'cet-6': '大学六级 · 学术讲座与深度视点',
    cet6: '大学六级 · 学术讲座与深度视点',
    ielts: '雅思学术 · 国际原声与多元口音',
    toefl: '托福学术 · 北美课堂与教授答疑',
    ted: 'TED 演讲 · 深度前沿与思想风暴',
    bbc: 'BBC 新闻 · 标准英音与全球视野',
    dialog: '情境会话 · 真实高频地道口语'
  }
  return map[value?.toLowerCase()] || '权威官方考纲真题素材'
}

const getExamTypeMeta = (value) => {
  const key = String(value || '').toLowerCase()
  if (key === 'primary') {
    return {
      tag: '启蒙基础',
      wordCount: '~1,000 词',
      wpm: '90-110 WPM',
      genres: ['生活日常', '趣味故事', '情景短句'],
      accentColor: '#38bdf8'
    }
  }
  if (key === 'middle') {
    return {
      tag: '中考突破',
      wordCount: '~2,500 词',
      wpm: '110-130 WPM',
      genres: ['校园交际', '科普速递', '日常对话'],
      accentColor: '#10b981'
    }
  }
  if (key === 'high') {
    return {
      tag: '高考实战',
      wordCount: '~3,500 词',
      wpm: '130-150 WPM',
      genres: ['长对话理解', '短文推断', '独白大意'],
      accentColor: '#f59e0b'
    }
  }
  if (key === 'cet-4' || key === 'cet4') {
    return {
      tag: '大学四级',
      wordCount: '~4,500 词',
      wpm: '130-150 WPM',
      genres: ['短篇新闻', '长对话', '听力篇章'],
      accentColor: '#f97316'
    }
  }
  if (key === 'cet-6' || key === 'cet6') {
    return {
      tag: '大学六级',
      wordCount: '~6,000 词',
      wpm: '150-180 WPM',
      genres: ['长篇访谈', '学术讲座', '长对话'],
      accentColor: '#2b7a60'
    }
  }
  if (key === 'ielts') {
    return {
      tag: '雅思学术',
      wordCount: '~8,000+ 词',
      wpm: '160-200 WPM',
      genres: ['海外场景', '学术研讨', '多元口音'],
      accentColor: '#2b7a60'
    }
  }
  if (key === 'toefl') {
    return {
      tag: '托福学术',
      wordCount: '~8,000+ 词',
      wpm: '160-200 WPM',
      genres: ['北美课堂', '学术独白', '教授答疑'],
      accentColor: '#3b82f6'
    }
  }
  if (key === 'ted') {
    return {
      tag: 'TED 演讲',
      wordCount: '~7,000+ 词',
      wpm: '150-180 WPM',
      genres: ['前沿科技', '深度哲思', '名家演说'],
      accentColor: '#ef4444'
    }
  }
  if (key === 'bbc') {
    return {
      tag: 'BBC 原声',
      wordCount: '~6,500+ 词',
      wpm: '140-170 WPM',
      genres: ['标准英音', '全球要闻', '文化特写'],
      accentColor: '#b4543a'
    }
  }
  return {
    tag: '考纲精选',
    wordCount: '~4,500 词',
    wpm: '140 WPM',
    genres: ['标准原声', '真题精听', '理解测试'],
    accentColor: '#f97316'
  }
}

const currentExamTypeLabel = computed(() => {
  const current = props.examTypes.find((item) => item.value === props.settings.examType)
  return current?.label || props.settings.examType?.toUpperCase() || 'CET-4'
})

const currentExamMeta = computed(() => {
  return getExamTypeMeta(props.settings.examType)
})

const currentDifficultyLabel = computed(() => {
  const current = props.difficulties.find((item) => item.value === props.settings.difficulty)
  return current?.label || props.settings.difficulty
})

const currentSpeedLabel = computed(() => {
  const current = props.speeds.find((item) => item.value === props.settings.speed)
  return current?.label || props.settings.speed
})

const estimatedDuration = computed(() => {
  const count = Number(props.settings.count) || 2
  const min = count * 3
  const max = count * 5
  return `${min} ~ ${max}`
})

const updateSetting = (key, value) => {
  emit('set-setting', { key, value })
}
</script>

<template>
  <div class="listening-setup-wrapper">
    <div class="listening-setup-card" :class="{ 'listening-setup-card--light': isLightTheme }">
      <div class="listening-setup-shell" :class="{ 'listening-setup-shell--light': isLightTheme }">
        <!-- 左侧：语境与来源 -->
        <div class="listening-setup-stage">
          <div class="listening-setup-header">
            <div class="listening-setup-intro">
              <div class="listening-setup-kicker">
                <span class="kicker-dot"></span>
                <span>{{ props.translate('听力语境选择', 'Listening Context') }}</span>
              </div>
              <h2 class="listening-setup-title">
                {{ props.translate('设定听力语境，开启真实听觉沉浸', 'Set listening context for real auditory immersion') }}
              </h2>
              <p class="listening-setup-caption">
                {{ props.translate('选择匹配你备考梯度的听力来源，系统将根据篇数与语速生成真实考试级听力素材与高保真发音。', 'Select audio sources matching your exam target, then calibrate count, speed and level.') }}
              </p>
            </div>
            <button class="listening-reset-btn" @click="emit('clear-state')">
              <n-icon :component="RotateCcw" size="14" />
              <span>{{ props.translate('重置练习状态', 'Reset State') }}</span>
            </button>
          </div>

          <div class="listening-setting-section">
            <div class="section-title-wrap">
              <Headphones :size="18" class="title-icon" />
              <h3 class="listening-section-title">
                {{ props.translate('选择听力来源材料库', 'Select Listening Source') }}
              </h3>
              <span class="section-badge-counter">{{ props.examTypes.length }} 个官方考纲库</span>
            </div>

            <div class="listening-source-grid">
              <div
                v-for="examType in props.examTypes"
                :key="examType.value"
                class="listening-option-card"
                :class="{
                  'is-active': props.settings.examType === examType.value,
                  'listening-option-card--light': isLightTheme
                }"
                :style="{
                  '--accent-color': getExamTypeMeta(examType.value).accentColor
                }"
                @click="updateSetting('examType', examType.value)"
              >
                <!-- 顶部彩色流光条 -->
                <div class="card-top-line"></div>

                <!-- 背景微光辐射 -->
                <div class="card-glow-bg"></div>

                <!-- 右上角角标：选中或专属 Tag -->
                <div v-if="props.settings.examType === examType.value" class="card-check-badge">
                  <n-icon :component="CheckCircle2" size="14" />
                </div>
                <div v-else class="card-meta-tag">
                  {{ getExamTypeMeta(examType.value).tag }}
                </div>

                <!-- 图标与标题行 -->
                <div class="card-head-row">
                  <div class="listening-icon-box">
                    <n-icon :component="getExamTypeIcon(examType.value)" size="22" />
                  </div>
                  <div class="card-title-group">
                    <span class="listening-option-label">{{ examType.label }}</span>
                    <small class="listening-option-sub">{{ getExamTypeSub(examType.value) }}</small>
                  </div>
                </div>

                <!-- 考纲专属指标条（词汇体量 & 语速） -->
                <div class="card-stats-strip">
                  <div class="stat-pill">
                    <n-icon :component="BookmarkCheck" size="12" />
                    <span>{{ getExamTypeMeta(examType.value).wordCount }}</span>
                  </div>
                  <div class="stat-pill">
                    <n-icon :component="Zap" size="12" />
                    <span>{{ getExamTypeMeta(examType.value).wpm }}</span>
                  </div>
                </div>

                <!-- 考题体裁小标签组 -->
                <div class="card-genres-strip">
                  <span
                    v-for="(genre, gIdx) in getExamTypeMeta(examType.value).genres"
                    :key="gIdx"
                    class="genre-badge"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：开始前配置控制台 -->
        <aside class="listening-settings-box" :class="{ 'listening-settings-box--light': isLightTheme }">
          <div class="settings-top-accent"></div>
          <div class="listening-rail-head">
            <div class="rail-kicker-badge">
              <Sparkles :size="13" />
              <span>{{ props.translate('开始前检查', 'Session Setup') }}</span>
            </div>
            <h3 class="listening-rail-title">
              {{ props.translate('确认篇数、难度和语速', 'Verify Count, Level & Speed') }}
            </h3>
          </div>

          <div class="controls-stack">
            <!-- 篇章数量 -->
            <div class="listening-setting-sub-section">
              <h4 class="listening-sub-title">
                <n-icon :component="Layers" size="15" />
                <span>{{ props.translate('篇章数量', 'Passage Count') }}</span>
              </h4>
              <div class="listening-pill-options">
                <div
                  v-for="count in props.counts"
                  :key="count.value"
                  class="listening-pill-option"
                  :class="{
                    'is-active': props.settings.count === count.value,
                    'listening-pill-option--light': isLightTheme
                  }"
                  @click="updateSetting('count', count.value)"
                >
                  {{ count.label }}
                </div>
              </div>
            </div>

            <!-- 难度等级 -->
            <div class="listening-setting-sub-section">
              <h4 class="listening-sub-title">
                <n-icon :component="Target" size="15" />
                <span>{{ props.translate('难度等级', 'Difficulty') }}</span>
              </h4>
              <div class="listening-pill-options">
                <div
                  v-for="difficulty in props.difficulties"
                  :key="difficulty.value"
                  class="listening-pill-option"
                  :class="{
                    'is-active': props.settings.difficulty === difficulty.value,
                    'listening-pill-option--light': isLightTheme
                  }"
                  @click="updateSetting('difficulty', difficulty.value)"
                >
                  {{ difficulty.label }}
                </div>
              </div>
            </div>

            <!-- 语速控制 -->
            <div class="listening-setting-sub-section">
              <h4 class="listening-sub-title">
                <n-icon :component="Clock" size="15" />
                <span>{{ props.translate('语速控制', 'Playback Speed') }}</span>
              </h4>
              <div class="listening-pill-options">
                <div
                  v-for="speed in props.speeds"
                  :key="speed.value"
                  class="listening-pill-option"
                  :class="{
                    'is-active': props.settings.speed === speed.value,
                    'listening-pill-option--light': isLightTheme
                  }"
                  @click="updateSetting('speed', speed.value)"
                >
                  {{ speed.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- 新增：当前配置概要小看板 (Session Briefing Card) -->
          <div class="session-briefing-card" :class="{ 'session-briefing-card--light': isLightTheme }">
            <div class="briefing-header">
              <span class="briefing-pulse-dot"></span>
              <span class="briefing-header-text">{{ props.translate('就绪状态 · 参数已锁定', 'Ready to generate') }}</span>
            </div>

            <div class="briefing-grid">
              <div class="briefing-item">
                <span class="briefing-item-label">{{ props.translate('材料来源', 'Source') }}</span>
                <span class="briefing-item-value highlight">{{ currentExamTypeLabel }}</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">{{ props.translate('练习篇数', 'Passages') }}</span>
                <span class="briefing-item-value">{{ props.settings.count }} 篇精听</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">{{ props.translate('梯度难度', 'Difficulty') }}</span>
                <span class="briefing-item-value">{{ currentDifficultyLabel }}</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">{{ props.translate('播音倍率', 'Speed') }}</span>
                <span class="briefing-item-value">{{ currentSpeedLabel }}</span>
              </div>
            </div>

            <div class="briefing-footer-hint">
              <n-icon :component="Timer" size="13" />
              <span>预计耗时约 <strong>{{ estimatedDuration }}</strong> 分钟 · 深度听觉专注</span>
            </div>
          </div>

          <!-- 开始生成主行动按键 -->
          <div class="action-footer">
            <button
              class="listening-start-btn glow-btn"
              :class="{ 'is-loading': props.isLoading }"
              :disabled="props.isLoading"
              @click="emit('generate')"
            >
              <n-icon :component="Rocket" size="18" class="rocket-icon" />
              <span>
                {{
                  props.isLoading
                    ? props.translate('正在智能生成听力篇章与试题...', 'Generating Listening Materials...')
                    : props.translate('开始生成听力训练', 'Generate Listening Materials')
                }}
              </span>
              <div class="btn-shimmer"></div>
            </button>
            <p class="start-hint">
              {{ props.translate('AI 将智能生成匹配考纲原声的音频脚本与对应理解单选题', 'Audio scripts and comprehension questions will be generated.') }}
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.listening-setup-wrapper {
  width: 100%;
}

.listening-setup-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  padding: 32px;
}

.listening-setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 30px;
  align-items: start;
}

.listening-setup-stage {
  min-width: 0;
}

/* ================== 头部排版 (Intro) ================== */
.listening-setup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 26px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.listening-setup-intro {
  display: grid;
  gap: 8px;
}

.listening-setup-kicker {
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
  width: fit-content;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
}

.listening-setup-title {
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 1.85rem);
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.01em;
  background: none;
  color: inherit;
}

.listening-setup-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  max-width: 34rem;
}

.listening-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.listening-reset-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--tone-orange);
}

/* ================== 来源卡片网格 (Source Grid) ================== */
.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.title-icon {
  color: var(--tone-orange);
}

.listening-section-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-color);
}

.section-badge-counter {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 999px;
  margin-left: 2px;
}

.listening-source-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.listening-option-card {
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
  gap: 12px;
  text-align: left;
  min-height: 148px;
}

/* 卡片顶部饰线 */
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

.listening-option-card:hover {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.35);
  transform: translateY(-3px);
}

.listening-option-card:hover .card-glow-bg {
  opacity: 0.08;
}

.listening-option-card.is-active {
  background: var(--card-bg);
  border: 1.5px solid rgba(249, 115, 22, 0.8);
  box-shadow:
    0 12px 32px rgba(249, 115, 22, 0.2),
    inset 0 0 0 1px rgba(249, 115, 22, 0.4);
}

.listening-option-card.is-active .card-top-line {
  background: #f97316;
}

.listening-option-card.is-active .card-glow-bg {
  opacity: 0.14;
}

/* 右上角角标 */
.card-check-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f97316;
  /* 实心橙底固定深色 ink，避免深色主题浅字压亮底 */
  color: #40200a;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.card-meta-tag {
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

.listening-option-card:hover .card-meta-tag {
  color: var(--tone-orange);
  border-color: rgba(249, 115, 22, 0.3);
}

/* 图标与标题行 */
.card-head-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 28px;
}

.listening-icon-box {
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

.listening-option-card:hover .listening-icon-box {
  transform: scale(1.05);
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--tone-orange);
}

.listening-option-card.is-active .listening-icon-box {
  background: rgba(249, 115, 22, 0.22);
  border-color: rgba(249, 115, 22, 0.6);
  color: var(--tone-orange);
}

.card-title-group {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.listening-option-label {
  font-weight: 800;
  font-size: 1.05rem;
  color: var(--text-color);
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.listening-option-sub {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 词汇量与语速指标条 */
.card-stats-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 3px 8px;
  border-radius: 6px;
}

.listening-option-card.is-active .stat-pill {
  background: rgba(249, 115, 22, 0.1);
  border-color: rgba(249, 115, 22, 0.25);
  color: var(--tone-orange);
}

/* 题型体裁微胶囊 */
.card-genres-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.genre-badge {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

.listening-option-card.is-active .genre-badge {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

/* ================== 右侧配置控制台 (Settings Box) ================== */
.listening-settings-box {
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

.listening-rail-head {
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

.listening-rail-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.3;
}

.controls-stack {
  display: grid;
  gap: 18px;
  margin-bottom: 20px;
}

.listening-setting-sub-section {
  display: grid;
  gap: 10px;
}

.listening-sub-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: var(--secondary-text);
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.listening-pill-options {
  display: flex;
  gap: 8px;
}

.listening-pill-option {
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

.listening-pill-option:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--text-color);
}

.listening-pill-option.is-active {
  background: #f97316;
  /* 实心橙底固定深色 ink */
  color: #40200a;
  border-color: rgba(255, 255, 255, 0.25);
  font-weight: 800;
}

/* ================== 会话启动概要小看板 (Session Briefing) ================== */
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

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
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

/* ================== 动作按钮区 (Action Footer) ================== */
.action-footer {
  display: grid;
  gap: 10px;
  margin-top: auto;
}

.listening-start-btn {
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
  /* 实心橙底固定深色 ink，两套主题均达标 */
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
  0% { left: -100%; }
  40%, 100% { left: 200%; }
}

.rocket-icon {
  transition: transform 0.25s ease;
}

.listening-start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.listening-start-btn:hover:not(:disabled) .rocket-icon {
  transform: translateY(-2px) rotate(-8deg);
}

.listening-start-btn:active:not(:disabled) {
  transform: translateY(0);
}

.listening-start-btn:disabled {
  /* R8：整块 0.7 透明度会让墨色文字掉到 2.7:1，改为弱化底色 + 次级文字 */
  opacity: 1;
  background: var(--surface-muted);
  color: var(--secondary-text);
  cursor: not-allowed;
  filter: grayscale(0.2);
}

.start-hint {
  margin: 0;
  font-size: 0.74rem;
  color: var(--secondary-text);
  text-align: center;
  line-height: 1.45;
}

/* ================== 浅色模式适配 (Light Theme) ================== */
.listening-setup-card--light {
  border-color: rgba(148, 163, 184, 0.22);
  background: var(--card-bg);
}

.listening-setup-card--light .listening-setup-header {
  border-bottom-color: rgba(148, 163, 184, 0.16);
}

.listening-setup-card--light .listening-setup-title {
  background: none;
  color: inherit;
}

.listening-setup-card--light .listening-setup-caption {
  color: #475569;
}

.listening-setup-card--light .listening-reset-btn {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.25);
  color: #475569;
}

.listening-setup-card--light .listening-reset-btn:hover {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.4);
  color: var(--tone-orange);
}

.listening-setup-card--light .listening-section-title {
  color: #0f172a;
}

.listening-setup-card--light .section-badge-counter {
  color: #475569;
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(148, 163, 184, 0.2);
}

.listening-setup-card--light .listening-option-card {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

.listening-setup-card--light .listening-option-card:hover {
  background: #ffffff;
  border-color: rgba(249, 115, 22, 0.45);
}

.listening-setup-card--light .listening-option-card.is-active {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.7);
}

.listening-setup-card--light .listening-option-label {
  color: #0f172a;
}

.listening-setup-card--light .listening-option-sub {
  color: #475569;
}

.listening-setup-card--light .card-meta-tag {
  color: var(--secondary-text);
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.listening-setup-card--light .listening-icon-box {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.2);
  color: var(--tone-orange);
}

.listening-setup-card--light .stat-pill {
  color: #334155;
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.listening-setup-card--light .genre-badge {
  color: #475569;
  background: rgba(15, 23, 42, 0.035);
  border-color: rgba(148, 163, 184, 0.18);
}

.listening-setup-card--light .listening-settings-box {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.22);
}

.listening-setup-card--light .listening-rail-title {
  color: #0f172a;
}

.listening-setup-card--light .listening-sub-title {
  color: #475569;
}

.listening-setup-card--light .listening-pill-option {
  border-color: rgba(148, 163, 184, 0.22);
  background: #ffffff;
  color: #1e293b;
}

.listening-setup-card--light .listening-pill-option:hover {
  background: #f8fafc;
  border-color: rgba(249, 115, 22, 0.4);
}

.listening-setup-card--light .listening-pill-option.is-active {
  background: #f97316;
  /* 实心橙底统一用固定深色 ink */
  color: #40200a;
}

.listening-setup-card--light .session-briefing-card {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

.listening-setup-card--light .briefing-header-text {
  color: #475569;
}

.listening-setup-card--light .briefing-item-label {
  color: var(--secondary-text);
}

.listening-setup-card--light .briefing-item-value {
  color: #0f172a;
}

.listening-setup-card--light .briefing-item-value.highlight {
  color: var(--tone-orange);
}

.listening-setup-card--light .briefing-footer-hint {
  border-top-color: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.listening-setup-card--light .briefing-footer-hint strong {
  color: #c2410c;
}

.listening-setup-card--light .start-hint {
  color: var(--secondary-text);
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1100px) {
  .listening-setup-shell {
    grid-template-columns: 1fr;
  }

  .listening-source-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .listening-setup-card {
    padding: 20px 16px;
    border-radius: var(--radius-lg);
  }

  .listening-setup-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .listening-source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .listening-option-card {
    padding: 14px 12px;
    min-height: 130px;
  }
}

@media (max-width: 480px) {
  .listening-source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
