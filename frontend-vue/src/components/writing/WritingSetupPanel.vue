<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import {
  GraduationCap,
  PenTool,
  Book,
  Award,
  Layers,
  Sparkles,
  Globe,
  BookOpen,
  CheckCircle2,
  FileText,
  Target,
  MessageSquare,
  Activity
} from 'lucide-vue-next'
import WritingHistoryPanel from '@/components/writing/WritingHistoryPanel.vue'
import WritingSetupSidePanel from '@/components/writing/WritingSetupSidePanel.vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  writingModes: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  selectedModeLabel: {
    type: String,
    default: ''
  },
  selectedDifficultyLabel: {
    type: String,
    default: ''
  },
  timeLimits: {
    type: Array,
    default: () => []
  },
  items: {
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
  }
})

const emit = defineEmits(['update-setting', 'generate', 'select', 'update:page', 'update:pageSize'])

const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.isLight)

const getExamTypeMeta = value => {
  const key = String(value || '').toLowerCase()
  if (key === 'primary') {
    return {
      sub: '小学基础',
      wordTarget: '~80 词',
      focus: '基础看图 · 简单句式',
      genres: ['看图说话', '情景短文'],
      accentColor: '#38bdf8',
      icon: Book
    }
  }
  if (key === 'middle') {
    return {
      sub: '中考统考',
      wordTarget: '~100 词',
      focus: '情景交际 · 结构清晰',
      genres: ['命题作文', '书信邮件'],
      accentColor: '#10b981',
      icon: GraduationCap
    }
  }
  if (key === 'high') {
    return {
      sub: '高考实战',
      wordTarget: '~150 词',
      focus: '要点覆盖 · 读后续写',
      genres: ['应用文写作', '读后续写/概要'],
      accentColor: '#f59e0b',
      icon: Award
    }
  }
  if (key === 'cet4' || key === 'cet-4') {
    return {
      sub: '大学四级',
      wordTarget: '120 ~ 180 词',
      focus: '图表阐述 · 论据充实',
      genres: ['现象阐释', '观点对比', '漫画作文'],
      accentColor: '#f97316',
      icon: Layers
    }
  }
  if (key === 'cet6' || key === 'cet-6') {
    return {
      sub: '大学六级',
      wordTarget: '150 ~ 200 词',
      focus: '社会思辨 · 高级句式',
      genres: ['名言哲理', '科技社会', '观点立论'],
      accentColor: '#2b7a60',
      icon: Sparkles
    }
  }
  if (key === 'ielts') {
    return {
      sub: '雅思学术',
      wordTarget: '150 / 250 词',
      focus: 'Task 1 图表 / Task 2 议论',
      genres: ['学术图表', '双向论证', '利弊分析'],
      accentColor: '#2b7a60',
      icon: Globe
    }
  }
  if (key === 'toefl') {
    return {
      sub: '托福学术',
      wordTarget: '150 ~ 300+ 词',
      focus: '综合写作 · 学术讨论',
      genres: ['学术课堂讨论', '听读综合论辩'],
      accentColor: '#3b82f6',
      icon: BookOpen
    }
  }
  return {
    sub: '官方考纲',
    wordTarget: '150 词',
    focus: '真题考纲 · 标准范文',
    genres: ['规范写作', '逻辑阐释'],
    accentColor: '#f97316',
    icon: GraduationCap
  }
}

const getWritingModeMeta = value => {
  const key = String(value || '').toLowerCase()
  if (key === 'essay') {
    return {
      sub: 'Argumentative & Essay',
      desc: '深入剖析现象成因，双向论证不同观点并确立自我主张',
      tags: ['现象剖析', '辩证论述', '观点立论'],
      icon: FileText
    }
  }
  if (key === 'chart') {
    return {
      sub: 'Data & Trend Analysis',
      desc: '精准归纳图表数据特征、提取走势规律并给出合理成因阐述',
      tags: ['数据对比', '趋势预测', '图表解读'],
      icon: Target
    }
  }
  if (key === 'letter') {
    return {
      sub: 'Practical & Letters',
      desc: '规范掌握正式与半正式书信格式，语气得体地传递交际意图',
      tags: ['建议投诉', '求职邀请', '感谢致歉'],
      icon: MessageSquare
    }
  }
  return {
    sub: 'Standard Writing',
    desc: '系统标准语篇写作训练',
    tags: ['结构规范', '流畅表达'],
    icon: FileText
  }
}
</script>

<template>
  <div class="setup-container">
    <section class="setup-shell" :class="{ 'setup-shell--light': isLightTheme }">
      <!-- 左侧：题目语境配置舞台 -->
      <div class="setup-stage" :class="{ 'setup-stage--light': isLightTheme }">
        <div class="setup-stage-intro">
          <div class="setup-kicker-badge">
            <span class="kicker-dot"></span>
            <span class="setup-kicker">题目准备 · 官方考纲语境</span>
          </div>
          <h2 class="setup-title">先确定写作语境，再开始正式写作</h2>
          <p class="setup-caption">
            根据备考目标选定官方考纲梯度与文体题材，系统将智能生成匹配标准的命题与批改模型。
          </p>
        </div>

        <div class="setup-sections">
          <!-- 模块一：考试类型材料库 -->
          <div class="setting-section">
            <div class="section-title-wrap">
              <div class="title-icon-box">
                <GraduationCap :size="18" class="title-icon" />
              </div>
              <h3 class="section-heading-title">考试类型与目标考纲</h3>
              <span class="section-badge-counter">{{ examTypes.length }} 个官方考纲</span>
            </div>

            <div class="exam-card-grid">
              <div
                v-for="exam in examTypes"
                :key="exam.value"
                class="exam-option-card"
                :class="{
                  active: settings.examType === exam.value,
                  'exam-option-card--light': isLightTheme
                }"
                :style="{
                  '--accent-color': getExamTypeMeta(exam.value).accentColor
                }"
                @click="emit('update-setting', 'examType', exam.value)"
              >
                <!-- 顶部流光微线 -->
                <div class="card-top-line"></div>

                <!-- 背景光晕 -->
                <div class="card-glow-bg"></div>

                <!-- 右上角角标 -->
                <div v-if="settings.examType === exam.value" class="card-check-badge">
                  <n-icon :component="CheckCircle2" size="14" />
                </div>
                <div v-else class="card-tag-badge">
                  {{ getExamTypeMeta(exam.value).wordTarget }}
                </div>

                <!-- 头部行：图标 + 名称 -->
                <div class="exam-card-head">
                  <div class="exam-icon-box">
                    <component :is="getExamTypeMeta(exam.value).icon" :size="20" />
                  </div>
                  <div class="exam-title-group">
                    <span class="exam-card-label">{{ exam.label }}</span>
                    <span class="exam-card-sub">{{ getExamTypeMeta(exam.value).sub }}</span>
                  </div>
                </div>

                <!-- 考评重点条 -->
                <div class="exam-focus-strip">
                  <Activity :size="11" class="focus-icon" />
                  <span>{{ getExamTypeMeta(exam.value).focus }}</span>
                </div>

                <!-- 题型体裁胶囊组 -->
                <div class="exam-genres-strip">
                  <span
                    v-for="(genre, gIdx) in getExamTypeMeta(exam.value).genres"
                    :key="gIdx"
                    class="genre-pill"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 模块二：写作题型与文体 -->
          <div class="setting-section">
            <div class="section-title-wrap">
              <div class="title-icon-box">
                <PenTool :size="18" class="title-icon" />
              </div>
              <h3 class="section-heading-title">写作题型与训练文体</h3>
              <span class="section-badge-counter">{{ writingModes.length }} 种常考文体</span>
            </div>

            <div class="mode-card-grid">
              <div
                v-for="mode in writingModes"
                :key="mode.value"
                class="mode-option-card"
                :class="{
                  active: settings.mode === mode.value,
                  'mode-option-card--light': isLightTheme
                }"
                @click="emit('update-setting', 'mode', mode.value)"
              >
                <!-- 顶部流光饰线 -->
                <div class="card-top-line"></div>

                <!-- 右上角状态胶囊 -->
                <div
                  class="mode-state-pill"
                  :class="{ 'is-selected': settings.mode === mode.value }"
                >
                  <n-icon v-if="settings.mode === mode.value" :component="CheckCircle2" size="13" />
                  <span>{{ settings.mode === mode.value ? '已选文体' : '选择' }}</span>
                </div>

                <!-- 图标与文案 -->
                <div class="mode-card-head">
                  <div class="mode-icon-box">
                    <component :is="getWritingModeMeta(mode.value).icon" :size="20" />
                  </div>
                  <div class="mode-copy">
                    <div class="mode-label">{{ mode.label }}</div>
                    <div class="mode-sub-en">{{ getWritingModeMeta(mode.value).sub }}</div>
                  </div>
                </div>

                <p class="mode-desc">{{ getWritingModeMeta(mode.value).desc }}</p>

                <!-- 特征标签胶囊组 -->
                <div class="mode-tags-strip">
                  <span
                    v-for="(tag, tIdx) in getWritingModeMeta(mode.value).tags"
                    :key="tIdx"
                    class="mode-tag-pill"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：会话控制边栏 -->
      <aside class="setup-sidebar">
        <WritingSetupSidePanel
          :settings="settings"
          :selected-mode-label="selectedModeLabel"
          :selected-difficulty-label="selectedDifficultyLabel"
          :difficulties="difficulties"
          :time-limits="timeLimits"
          @update-setting="(key, value) => emit('update-setting', key, value)"
          @generate="emit('generate')"
        />
      </aside>
    </section>

    <!-- 历史记录列表 -->
    <WritingHistoryPanel
      :items="items"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>

<style scoped>
.setup-container {
  width: 100%;
}

.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(330px, 0.75fr);
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

.setup-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  margin-bottom: 12px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
  animation: kicker-pulse 2s infinite ease-in-out;
}

@keyframes kicker-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

.setup-kicker {
  color: var(--tone-orange);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
  gap: 28px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.title-icon-box {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
}

.title-icon {
  color: var(--tone-orange);
}

.section-heading-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
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
}

/* ================== 考纲类型卡片网格 (Exam Grid) ================== */
.exam-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.exam-option-card {
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

.exam-option-card:hover {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.35);
  transform: translateY(-2px);
}

.exam-option-card:hover .card-glow-bg {
  opacity: 0.08;
}

.exam-option-card.active {
  background: var(--card-bg);
  border: 1.5px solid rgba(249, 115, 22, 0.8);
  box-shadow:
    0 12px 32px rgba(249, 115, 22, 0.2),
    inset 0 0 0 1px rgba(249, 115, 22, 0.4);
}

.exam-option-card.active .card-top-line {
  background: #f97316;
}

.exam-option-card.active .card-glow-bg {
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

.exam-option-card:hover .card-tag-badge {
  color: var(--tone-orange);
  border-color: rgba(249, 115, 22, 0.3);
}

.exam-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 32px;
}

.exam-icon-box {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--tone-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.exam-option-card:hover .exam-icon-box {
  transform: scale(1.05);
  color: var(--tone-orange);
  border-color: rgba(249, 115, 22, 0.35);
}

.exam-option-card.active .exam-icon-box {
  background: rgba(249, 115, 22, 0.22);
  border-color: rgba(249, 115, 22, 0.6);
  color: var(--tone-orange);
}

.exam-title-group {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.exam-card-label {
  font-weight: 800;
  font-size: 1.02rem;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.exam-card-sub {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exam-focus-strip {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.71rem;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
}

.focus-icon {
  color: var(--tone-orange);
}

.exam-genres-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.genre-pill {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 7px;
  border-radius: 4px;
}

.exam-option-card.active .genre-pill {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

/* ================== 写作题型卡片网格 (Mode Grid) ================== */
.mode-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.mode-option-card {
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
}

.mode-option-card:hover {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.35);
  transform: translateY(-2px);
}

.mode-option-card.active {
  background: var(--card-bg);
  border: 1.5px solid rgba(249, 115, 22, 0.8);
  box-shadow:
    0 12px 32px rgba(249, 115, 22, 0.2),
    inset 0 0 0 1px rgba(249, 115, 22, 0.4);
}

.mode-option-card.active .card-top-line {
  background: #f97316;
}

.mode-state-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.mode-state-pill.is-selected {
  background: #f97316;
  /* 实心橙底固定深色 ink（R4） */
  color: #40200a;
}

.mode-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 70px;
}

.mode-icon-box {
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

.mode-option-card:hover .mode-icon-box {
  transform: scale(1.05);
  color: var(--tone-orange);
}

.mode-option-card.active .mode-icon-box {
  background: rgba(249, 115, 22, 0.22);
  border-color: rgba(249, 115, 22, 0.6);
  color: var(--tone-orange);
}

.mode-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.mode-label {
  font-weight: 800;
  font-size: 1.02rem;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.mode-sub-en {
  font-size: 0.72rem;
  color: var(--secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mode-desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--secondary-text);
  line-height: 1.5;
}

.mode-tags-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.mode-tag-pill {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 7px;
  border-radius: 4px;
}

.mode-option-card.active .mode-tag-pill {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}

/* ================== 右侧边栏容器 (Sidebar) ================== */
.setup-sidebar {
  min-width: 0;
  position: sticky;
  top: 92px;
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

.setup-stage--light .section-heading-title {
  color: #0f172a;
}

.setup-stage--light .section-badge-counter {
  color: #475569;
  background: rgba(15, 23, 42, 0.05);
  border-color: rgba(148, 163, 184, 0.2);
}

.exam-option-card--light,
.mode-option-card--light {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

.exam-option-card--light:hover,
.mode-option-card--light:hover {
  background: #ffffff;
  border-color: rgba(249, 115, 22, 0.45);
}

.exam-option-card--light.active,
.mode-option-card--light.active {
  background: var(--card-bg);
  border-color: rgba(249, 115, 22, 0.7);
}

.exam-option-card--light .exam-card-label,
.mode-option-card--light .mode-label {
  color: #0f172a;
}

.exam-option-card--light .exam-card-sub,
.mode-option-card--light .mode-sub-en,
.mode-option-card--light .mode-desc {
  color: #475569;
}

.exam-option-card--light .card-tag-badge {
  color: var(--secondary-text);
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.exam-option-card--light .exam-icon-box,
.mode-option-card--light .mode-icon-box {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.2);
  color: var(--tone-orange);
}

.exam-option-card--light .exam-focus-strip {
  color: #334155;
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.exam-option-card--light .genre-pill,
.mode-option-card--light .mode-tag-pill {
  color: #475569;
  background: rgba(15, 23, 42, 0.035);
  border-color: rgba(148, 163, 184, 0.18);
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1080px) {
  .setup-shell {
    grid-template-columns: 1fr;
  }

  .exam-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .mode-card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .setup-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .setup-stage {
    padding: 20px 16px;
    border-radius: var(--radius-lg);
  }

  .exam-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .mode-card-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .exam-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
