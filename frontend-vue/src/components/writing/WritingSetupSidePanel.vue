<template>
  <div class="side-settings" :class="{ 'side-settings--light': isLightTheme }">
    <div class="settings-top-accent"></div>

    <div class="rail-head">
      <div class="rail-kicker-badge">
        <Sparkles :size="13" />
        <span>生成入口</span>
      </div>
      <h3 class="rail-title">确认参数后开始这次写作</h3>
      <p class="rail-caption">校准限时与难度后，AI 将生成考试级实战作文题。</p>
    </div>

    <!-- 写作难度 -->
    <div class="setting-section">
      <div class="section-sub-head">
        <Gauge :size="15" class="sub-icon" />
        <h4>写作难度</h4>
      </div>
      <div class="pill-options">
        <button
          v-for="difficulty in difficulties"
          :key="difficulty.value"
          type="button"
          class="pill-option"
          :class="{
            active: settings.difficulty === difficulty.value,
            'pill-option--light': isLightTheme
          }"
          @click="emit('update-setting', 'difficulty', difficulty.value)"
        >
          {{ difficulty.label }}
        </button>
      </div>
    </div>

    <!-- 限时训练 -->
    <div class="setting-section">
      <div class="section-sub-head">
        <Clock :size="15" class="sub-icon" />
        <h4>限时训练</h4>
      </div>
      <div class="pill-options">
        <button
          v-for="time in timeLimits"
          :key="time.value"
          type="button"
          class="pill-option"
          :class="{
            active: settings.timeLimit === time.value,
            'pill-option--light': isLightTheme
          }"
          @click="emit('update-setting', 'timeLimit', time.value)"
        >
          {{ time.label }}
        </button>
      </div>
    </div>

    <!-- 新增：写作训练任务概览看板 (Session Briefing Card) -->
    <div class="session-briefing-card" :class="{ 'session-briefing-card--light': isLightTheme }">
      <div class="briefing-header">
        <span class="briefing-pulse-dot"></span>
        <span class="briefing-header-text">参数已就绪 · AI 出题引擎待命</span>
      </div>

      <div class="briefing-grid">
        <div class="briefing-item">
          <span class="briefing-item-label">目标考纲</span>
          <span class="briefing-item-value highlight">{{ selectedExamLabel }}</span>
        </div>
        <div class="briefing-item">
          <span class="briefing-item-label">写作题型</span>
          <span class="briefing-item-value">{{ selectedModeLabel || '议论文' }}</span>
        </div>
        <div class="briefing-item">
          <span class="briefing-item-label">挑战难度</span>
          <span class="briefing-item-value">{{ selectedDifficultyLabel }}</span>
        </div>
        <div class="briefing-item">
          <span class="briefing-item-label">训练节奏</span>
          <span class="briefing-item-value">{{ selectedTimeLabel }}</span>
        </div>
      </div>

      <div class="briefing-footer-hint">
        <Timer :size="13" />
        <span>智能精批涵盖词汇丰富度、语法准确性与逻辑结构</span>
      </div>
    </div>

    <!-- 主生成按键 -->
    <div class="action-footer">
      <button type="button" class="writing-start-btn glow-btn" @click="emit('generate')">
        <Rocket :size="18" class="rocket-icon" />
        <span>生成写作题目</span>
        <div class="btn-shimmer"></div>
      </button>
      <p class="rail-note">提交后 AI 将进行逐句语法精批、词汇升级与全维度评分。</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Gauge, Rocket, Sparkles, Timer } from 'lucide-vue-next'
import { getExamTypeLabel } from '@/constants/examTypes'
import { useThemeStore } from '@/stores/theme'

const emit = defineEmits(['update-setting', 'generate'])

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  selectedModeLabel: {
    type: String,
    default: ''
  },
  selectedDifficultyLabel: {
    type: String,
    default: '标准'
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  timeLimits: {
    type: Array,
    default: () => []
  }
})

const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.isLight)

const selectedTimeLabel = computed(
  () =>
    props.timeLimits.find(item => item.value === props.settings.timeLimit)?.label ||
    (props.settings.timeLimit > 0 ? `${props.settings.timeLimit} 分钟` : '不限时')
)

const selectedExamLabel = computed(() =>
  getExamTypeLabel(props.settings.examType, props.settings.examType?.toUpperCase?.() || 'CET-4')
)
</script>

<style scoped>
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
  gap: 6px;
  margin-bottom: 20px;
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

.rail-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.82rem;
  line-height: 1.5;
}

.setting-section {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.section-sub-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sub-icon {
  color: var(--tone-orange);
}

.section-sub-head h4 {
  margin: 0;
  font-size: 0.76rem;
  color: var(--secondary-text);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-option {
  flex: 1;
  min-width: 68px;
  text-align: center;
  padding: 9px 10px;
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

/* ================== 会话启动概览看板 (Briefing Card) ================== */
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
  line-height: 1.4;
}

/* ================== 主行动按钮 (Hero Button) ================== */
.action-footer {
  display: grid;
  gap: 10px;
  margin-top: auto;
}

.writing-start-btn {
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

.writing-start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.writing-start-btn:hover:not(:disabled) .rocket-icon {
  transform: translateY(-2px) rotate(-8deg);
}

.writing-start-btn:active:not(:disabled) {
  transform: translateY(0);
}

.rail-note {
  margin: 0;
  font-size: 0.74rem;
  color: var(--secondary-text);
  text-align: center;
  line-height: 1.45;
}

/* ================== 浅色模式适配 (Light Theme) ================== */
.side-settings--light {
  background: transparent;
  border-color: rgba(148, 163, 184, 0.22);
}

.side-settings--light .rail-title {
  color: #0f172a;
}

.side-settings--light .section-sub-head h4 {
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

.side-settings--light .briefing-footer-hint {
  border-top-color: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.side-settings--light .rail-note {
  color: var(--secondary-text);
}
</style>
