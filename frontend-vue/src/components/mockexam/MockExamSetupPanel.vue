<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NPagination, NTag } from 'naive-ui'
import {
  Award,
  Book,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  History,
  Layers,
  Rocket,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap
} from 'lucide-vue-next'
import { getExamTypeLabel } from '@/constants/examTypes'

const props = defineProps({
  settings: { type: Object, required: true },
  examTypes: { type: Array, required: true },
  difficulties: { type: Array, required: true },
  generating: { type: Boolean, default: false },
  exams: { type: Array, required: true },
  paginatedExams: { type: Array, required: true },
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true }
})

defineEmits(['update-setting', 'generate', 'start-exam', 'update:page', 'update:page-size'])

const examTypeMetaMap = {
  primary: {
    icon: Book,
    badge: '小学英语',
    vocabTarget: '基础 800+ 词',
    scoreStandard: '满分 100 分 · 40 分钟',
    sections: ['听力理解', '词汇连线', '看图单选', '趣味阅读'],
    focus: '基础词义与日常表达规范'
  },
  middle: {
    icon: GraduationCap,
    badge: '中考冲刺',
    vocabTarget: '考纲 1,600+ 词',
    scoreStandard: '满分 120 分 · 90 分钟',
    sections: ['听力填空', '完形填空', '任务阅读', '书面表达'],
    focus: '核心语法与主旨事实推断'
  },
  high: {
    icon: Award,
    badge: '高考真题',
    vocabTarget: '课标 3,500+ 词',
    scoreStandard: '满分 150 分 · 120 分钟',
    sections: ['听力短文', '阅读理解', '七选五', '语法填空', '读后续写'],
    focus: '长难句解析与逻辑论证思维'
  },
  cet4: {
    icon: Layers,
    badge: '大学四级 CET-4',
    vocabTarget: '大纲 4,500+ 词',
    scoreStandard: '常模 710 分 · 125 分钟',
    sections: ['长对话听力', '仔细阅读', '段落匹配', '段落汉译英'],
    focus: '学术社科速读与细节抓取'
  },
  cet6: {
    icon: Sparkles,
    badge: '大学六级 CET-6',
    vocabTarget: '大纲 5,500+ 词',
    scoreStandard: '常模 710 分 · 130 分钟',
    sections: ['讲座讲稿听力', '深度精读', '选词填空', '学术翻译'],
    focus: '深层观点归纳与复杂句式转化'
  },
  ielts: {
    icon: Globe,
    badge: '雅思学术类 (A类)',
    vocabTarget: '学术 7,000+ 词',
    scoreStandard: '9 分制 · 160 分钟',
    sections: ['Section 1-4 听力', '学术大篇章阅读', '图表及大作文'],
    focus: '学术图表分析与国际语境沟通'
  },
  toefl: {
    icon: BookOpen,
    badge: '新托福 iBT',
    vocabTarget: '学术 8,000+ 词',
    scoreStandard: '120 分制 · 120 分钟',
    sections: ['校园讲座听力', '长文多选阅读', '综合口语转写', '学术学术讨论写作'],
    focus: '北美学术高频逻辑与综合信息融合'
  },
  gre: {
    icon: Trophy,
    badge: 'GRE 语言推理',
    vocabTarget: '高阶 12,000+ 词',
    scoreStandard: '170 分制 · 110 分钟',
    sections: ['Text Completion', 'Sentence Equivalence', 'Reading Comprehension'],
    focus: '逻辑填空双三空与严密修辞批判'
  }
}

const getExamTypeMeta = (value) => {
  return examTypeMetaMap[value] || {
    icon: GraduationCap,
    badge: '综合考纲',
    vocabTarget: '考纲通用词汇',
    scoreStandard: '标准满分制',
    sections: ['听力训练', '阅读理解', '完形填空'],
    focus: '综合语言运用与逻辑理解'
  }
}

const selectedExamLabel = computed(() => props.examTypes.find(item => item.value === props.settings.examType)?.label || '未选择')
const selectedDifficultyLabel = computed(() => props.difficulties.find(item => item.value === props.settings.difficulty)?.label || '未选择')
const selectedExamMeta = computed(() => getExamTypeMeta(props.settings.examType))
const getDifficultyLabel = (value) => props.difficulties.find(item => item.value === value)?.label || '标准难度'
</script>

<template>
  <div class="setup-shell">
    <section class="setup-stage">
      <div class="setup-stage-intro">
        <div class="setup-kicker-pill">
          <span class="pulsing-dot"></span>
          <span>权威考场真题 · 全真节奏模拟</span>
        </div>
        <h2 class="setup-title">先确定考试项目和难度，再开始本次模拟考</h2>
        <p class="setup-caption">全面还原标准化全英文考卷规格与答题计时，帮助你在全真模拟环境中建立应试肌肉记忆。</p>
      </div>

      <div class="setting-section">
        <div class="section-title-wrap">
          <div class="section-title-left">
            <div class="section-icon-box">
              <GraduationCap :size="18" />
            </div>
            <h3>权威考试项目</h3>
          </div>
          <span class="section-badge-hint">共收录 8 大主流考纲体系</span>
        </div>

        <div class="exam-card-grid">
          <button
            v-for="type in examTypes"
            :key="type.value"
            type="button"
            class="exam-card"
            :class="{ active: settings.examType === type.value }"
            @click="$emit('update-setting', 'examType', type.value)"
          >
            <div class="exam-card-glow"></div>

            <div class="exam-card-header">
              <div class="exam-icon-badge" :style="{ color: type.color, background: type.bg }">
                <component :is="getExamTypeMeta(type.value).icon" :size="20" />
              </div>

              <div class="exam-identity">
                <div class="exam-name-row">
                  <span class="exam-name">{{ type.label }}</span>
                  <span class="exam-tag">{{ getExamTypeMeta(type.value).badge }}</span>
                </div>
                <span class="exam-desc">{{ type.desc }}</span>
              </div>

              <div class="exam-status-box">
                <div v-if="settings.examType === type.value" class="exam-check-badge">
                  <CheckCircle2 :size="16" />
                  <span>当前选择</span>
                </div>
                <span v-else class="exam-vocab-badge">{{ getExamTypeMeta(type.value).vocabTarget }}</span>
              </div>
            </div>

            <div class="exam-focus-strip">
              <span class="focus-label">考评重心</span>
              <span class="focus-text">{{ getExamTypeMeta(type.value).focus }}</span>
            </div>

            <div class="exam-sections-row">
              <span
                v-for="section in getExamTypeMeta(type.value).sections"
                :key="section"
                class="section-pill"
              >
                {{ section }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <aside class="setup-sidebar">
      <div class="side-settings">
        <div class="rail-head">
          <div class="rail-kicker-pill">
            <span class="pulsing-dot-blue"></span>
            <span>考务控制中心</span>
          </div>
          <h3 class="rail-title">配置考场挑战参数</h3>
          <p class="rail-caption">自由调节考卷梯度与答题限时，就绪后直接开启考试。</p>
        </div>

        <div class="setting-section compact">
          <div class="section-subhead">
            <div class="subhead-left">
              <Brain :size="15" />
              <span>挑战难度梯度</span>
            </div>
          </div>
          <div class="pill-options">
            <button
              v-for="difficulty in difficulties"
              :key="difficulty.value"
              type="button"
              class="pill-option"
              :class="{ active: settings.difficulty === difficulty.value }"
              @click="$emit('update-setting', 'difficulty', difficulty.value)"
            >
              <span class="pill-badge">{{ difficulty.icon }}</span>
              <span class="pill-label">{{ difficulty.label }}</span>
            </button>
          </div>
        </div>

        <div class="setting-section compact">
          <div class="section-subhead">
            <div class="subhead-left">
              <Clock :size="15" />
              <span>标准全真时长</span>
            </div>
          </div>
          <div class="duration-box">
            <div class="duration-main">
              <strong>{{ settings.duration }} 分钟</strong>
              <span class="duration-tag">标准考试时限</span>
            </div>
            <span class="duration-note">系统将严格按照官方真题计时节奏调度并提醒</span>
          </div>
        </div>

        <!-- 任务概览小看板 (Session Briefing Card) -->
        <div class="session-briefing-card">
          <div class="briefing-header">
            <div class="briefing-status">
              <span class="pulsing-green-dot"></span>
              <span>考卷已就绪 · 全真计时引擎待命</span>
            </div>
          </div>

          <div class="briefing-grid">
            <div class="briefing-item">
              <span class="item-label">目标考纲</span>
              <strong class="item-value">{{ selectedExamLabel }}</strong>
            </div>
            <div class="briefing-item">
              <span class="item-label">试卷难度</span>
              <strong class="item-value">{{ selectedDifficultyLabel }}</strong>
            </div>
            <div class="briefing-item">
              <span class="item-label">全真限时</span>
              <strong class="item-value">{{ settings.duration }} 分钟</strong>
            </div>
            <div class="briefing-item">
              <span class="item-label">历史模考</span>
              <strong class="item-value">{{ exams.length }} 套</strong>
            </div>
          </div>

          <div class="briefing-footer">
            <Zap :size="13" />
            <span>实时支持离线作答暂存 · 交卷后生成全维度成绩单</span>
          </div>
        </div>

        <n-button
          type="primary"
          size="large"
          block
          class="hero-start-btn"
          :loading="generating"
          @click="$emit('generate')"
        >
          <template #icon>
            <Rocket :size="18" />
          </template>
          <span>进入全真模拟考场</span>
        </n-button>
      </div>
    </aside>
  </div>

  <section v-if="exams.length > 0" class="history-section">
    <div class="history-heading">
      <div class="history-title-wrap">
        <div class="history-icon-box">
          <History :size="18" />
        </div>
        <div>
          <h3 class="history-main-title">最近生成考卷记录</h3>
          <p class="history-sub-title">可随时重温历史试卷答题记录或重新开启模考练习</p>
        </div>
      </div>
      <span class="history-count">{{ exams.length }} 套历史卷</span>
    </div>

    <div class="history-list">
      <button
        v-for="exam in paginatedExams"
        :key="exam.id"
        type="button"
        class="history-row"
        @click="$emit('start-exam', exam)"
      >
        <div class="history-meta">
          <n-tag size="small" type="info" :bordered="false" round class="exam-type-tag">
            {{ getExamTypeLabel(exam.examType, '未选择') }}
          </n-tag>
          <n-tag size="small" :bordered="false" round class="difficulty-tag">
            {{ getDifficultyLabel(exam.difficulty) }}
          </n-tag>
        </div>

        <div class="history-copy">
          <h4 class="exam-title">{{ exam.title }}</h4>
          <div class="exam-preview">
            <span><Timer :size="13" /> {{ exam.duration }} 分钟</span>
            <span><Target :size="13" /> {{ exam.totalQuestions }} 道题</span>
          </div>
        </div>

        <div class="history-action">
          <span>重新开启</span>
          <Rocket :size="14" />
        </div>
      </button>
    </div>

    <div v-if="exams.length > pageSize" class="pagination-wrapper">
      <n-pagination
        :page="currentPage"
        :page-count="Math.ceil(exams.length / pageSize)"
        :page-size="pageSize"
        show-size-picker
        :page-sizes="[6, 12, 18, 24]"
        @update:page="$emit('update:page', $event)"
        @update:page-size="$emit('update:page-size', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
}

.setup-stage {
  min-width: 0;
  padding: 30px 32px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.setup-stage-intro {
  margin-bottom: 26px;
}

.setup-kicker-pill,
.rail-kicker-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.setup-kicker-pill {
  background: rgba(96, 165, 250, 0.12);
  border: 1px solid rgba(96, 165, 250, 0.28);
  color: var(--tone-blue);
}

.rail-kicker-pill {
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.28);
  color: var(--tone-emerald);
}

.pulsing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #60a5fa;
  animation: pulse-glow 2s infinite;
}

.pulsing-dot-blue {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5fa88b;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.setup-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.setup-caption {
  margin: 10px 0 0;
  color: var(--secondary-text);
  font-size: 0.92rem;
  line-height: 1.6;
}

.setting-section {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.section-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: rgba(96, 165, 250, 0.12);
  color: var(--tone-blue);
  border: 1px solid rgba(96, 165, 250, 0.25);
}

.section-title-left h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.12rem;
  font-weight: 750;
}

.section-badge-hint {
  color: var(--secondary-text);
  font-size: 0.8rem;
  font-weight: 600;
}

/* 考纲自适应 2 列立体卡片 */
.exam-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.exam-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.45);
  cursor: pointer;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.exam-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.exam-card:hover {
  border-color: rgba(96, 165, 250, 0.35);
  background: rgba(15, 23, 42, 0.65);
  transform: translateY(-2px);
}

.exam-card:hover::before {
  opacity: 1;
}

.exam-card.active {
  border-color: rgba(96, 165, 250, 0.85);
  background: var(--card-bg);
  box-shadow: 0 12px 32px rgba(59, 130, 246, 0.22), inset 0 0 0 1px rgba(96, 165, 250, 0.4);
}

.exam-card.active::before {
  opacity: 1;
  background: #60a5fa;
}

.exam-card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  /* 窄卡片下名称与词量徽章会互相压住，允许换行 + 允许收缩 */
  flex-wrap: wrap;
  min-width: 0;
}

.exam-card-header > * {
  min-width: 0;
}

.exam-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.exam-card:hover .exam-icon-badge {
  transform: scale(1.08);
}

.exam-identity {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.exam-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.exam-name {
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 750;
  letter-spacing: -0.01em;
}

.exam-tag {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.14);
  color: var(--tone-blue);
  font-size: 0.72rem;
  font-weight: 700;
  border: 1px solid rgba(96, 165, 250, 0.28);
}

.exam-desc {
  color: var(--secondary-text);
  font-size: 0.8rem;
  line-height: 1.45;
}

.exam-status-box {
  flex-shrink: 0;
}

.exam-vocab-badge {
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.1);
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 600;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.exam-check-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.14);
  color: var(--tone-blue);
  font-size: 0.74rem;
  font-weight: 750;
  border: 1px solid rgba(96, 165, 250, 0.45);
}

.exam-focus-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.78rem;
}

.focus-label {
  color: var(--tone-blue);
  font-weight: 750;
  flex-shrink: 0;
}

.focus-text {
  color: var(--secondary-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exam-sections-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.section-pill {
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 550;
  transition: background 0.2s;
}

.exam-card.active .section-pill {
  background: rgba(96, 165, 250, 0.12);
  border-color: rgba(96, 165, 250, 0.24);
  color: var(--tone-blue);
}

/* 侧边栏 */
.setup-sidebar {
  position: sticky;
  top: 92px;
  min-width: 0;
}

.side-settings {
  display: grid;
  gap: 20px;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.rail-head {
  display: grid;
  gap: 6px;
}

.rail-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.22rem;
  font-weight: 750;
  line-height: 1.25;
}

.rail-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.85rem;
  line-height: 1.5;
}

.section-subhead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.subhead-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 0.88rem;
  font-weight: 700;
}

.subhead-left svg {
  color: var(--tone-emerald);
}

.pill-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.pill-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.5);
  color: var(--secondary-text);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.pill-option:hover {
  background: rgba(15, 23, 42, 0.75);
  border-color: rgba(30, 107, 82, 0.3);
  color: var(--text-color);
  transform: translateY(-1px);
}

.pill-option.active {
  background: #2563eb;
  color: #ffffff;
  border-color: transparent;
  font-weight: 700;
}

.pill-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-color);
}

/* 选中态徽章嵌在实心蓝底上：20% 白叠蓝 + 正文色 = 2.9:1。
   改成不透明白底 + 深色字，稳定达标。 */
.pill-option.active .pill-badge {
  background: rgba(255, 255, 255, 0.92);
  color: #1c2431;
}

.pill-label {
  font-size: 0.85rem;
}

.duration-box {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.duration-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.duration-main strong {
  color: var(--text-color);
  font-size: 1.18rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.duration-tag {
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.12);
  color: var(--tone-blue);
  font-size: 0.72rem;
  font-weight: 700;
}

.duration-note {
  color: var(--secondary-text);
  font-size: 0.78rem;
  line-height: 1.45;
}

/* 模拟考会话启动小看板 (Session Briefing Card) */
.session-briefing-card {
  padding: 16px;
  border-radius: var(--radius-lg);
  background: transparent;
  border: 1px solid rgba(96, 165, 250, 0.22);
  display: grid;
  gap: 12px;
}

.briefing-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tone-blue);
  font-size: 0.78rem;
  font-weight: 700;
}

.pulsing-green-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse-glow 2s infinite;
}

.briefing-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.briefing-item {
  display: grid;
  gap: 2px;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.item-label {
  color: var(--secondary-text);
  font-size: 0.72rem;
}

.item-value {
  color: var(--text-color);
  font-size: 0.88rem;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.briefing-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--secondary-text);
  font-size: 0.74rem;
  line-height: 1.45;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.08);
}

.briefing-footer svg {
  color: var(--tone-amber);
  flex-shrink: 0;
}

/* 52px 黄金主生成按键 */
.hero-start-btn {
  height: 52px;
  border-radius: var(--radius-lg);
  font-size: 1rem;
  font-weight: 750;
  letter-spacing: 0.02em;
  background: #3b82f6 !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-start-btn:hover {
  transform: translateY(-2px);
}

.hero-start-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: transparent;
  transform: skewX(-20deg);
  animation: shimmer-btn 3s infinite;
}

@keyframes shimmer-btn {
  0% { left: -100%; }
  35%, 100% { left: 150%; }
}

/* 历史考卷记录 */
.history-section {
  margin-top: 36px;
  padding: 28px 32px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
}

.history-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.history-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: rgba(96, 165, 250, 0.12);
  color: var(--tone-blue);
  border: 1px solid rgba(96, 165, 250, 0.25);
}

.history-main-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 750;
}

.history-sub-title {
  margin: 2px 0 0;
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.history-count {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.12);
  color: var(--tone-blue);
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(96, 165, 250, 0.25);
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-row {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr) auto;
  gap: 20px;
  align-items: center;
  width: 100%;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 23, 42, 0.4);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
}

.history-row:hover {
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(96, 165, 250, 0.35);
  transform: translateX(4px);
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.exam-type-tag {
  background: rgba(96, 165, 250, 0.14) !important;
  color: var(--tone-blue) !important;
}

.difficulty-tag {
  background: rgba(148, 163, 184, 0.12) !important;
  color: var(--secondary-text) !important;
}

.history-copy {
  min-width: 0;
}

.exam-title {
  margin: 0 0 4px;
  color: var(--text-color);
  font-size: 0.98rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exam-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 600;
}

.exam-preview span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.history-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.25);
  color: var(--tone-blue);
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s;
}

.history-row:hover .history-action {
  background: #2563eb;
  border-color: var(--tone-blue);
  color: #ffffff;
  transform: translateX(2px);
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* ====================================================
   浅色主题严格适配 (WCAG AA 级顶级对比度)
   ==================================================== */
html[data-theme='light'] .setup-stage,
html[data-theme='light'] .side-settings,
html[data-theme='light'] .history-section {
  border-color: rgba(148, 163, 184, 0.2);
}

html[data-theme='light'] .setup-title,
html[data-theme='light'] .rail-title,
html[data-theme='light'] .section-title-left h3,
html[data-theme='light'] .history-main-title,
html[data-theme='light'] .exam-title,
html[data-theme='light'] .subhead-left {
  color: var(--text-color);
}

html[data-theme='light'] .setup-caption,
html[data-theme='light'] .rail-caption,
html[data-theme='light'] .history-sub-title,
html[data-theme='light'] .duration-note,
html[data-theme='light'] .section-badge-hint {
  color: var(--secondary-text);
}

html[data-theme='light'] .exam-card {
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.9);
}

html[data-theme='light'] .exam-card:hover {
  background: #ffffff;
  border-color: rgba(59, 130, 246, 0.4);
}

html[data-theme='light'] .exam-card.active {
  border-color: rgba(37, 99, 235, 0.75);
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.15), inset 0 0 0 1px rgba(59, 130, 246, 0.3);
}

html[data-theme='light'] .exam-name {
  color: var(--text-color);
}

html[data-theme='light'] .exam-desc {
  color: var(--secondary-text);
}

html[data-theme='light'] .exam-focus-strip {
  background: rgba(241, 245, 249, 0.85);
  border-color: rgba(203, 213, 225, 0.6);
}

html[data-theme='light'] .focus-label {
  color: var(--tone-blue) !important;
}

html[data-theme='light'] .focus-text {
  color: var(--secondary-text);
}

html[data-theme='light'] .section-pill {
  background: rgba(241, 245, 249, 0.95);
  border-color: rgba(203, 213, 225, 0.8);
}

html[data-theme='light'] .exam-card.active .section-pill {
  background: rgba(219, 234, 254, 0.8);
  border-color: rgba(147, 197, 253, 0.8);
  color: var(--tone-blue);
}

html[data-theme='light'] .exam-vocab-badge {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.8);
}

html[data-theme='light'] .pill-option {
  background: rgba(241, 245, 249, 0.85);
  border-color: rgba(203, 213, 225, 0.7);
}

html[data-theme='light'] .pill-option:hover {
  background: #ffffff;
}

html[data-theme='light'] .pill-option.active {
  background: var(--tone-blue);
  border-color: transparent;
  color: #ffffff;
}

html[data-theme='light'] .duration-box {
  background: rgba(241, 245, 249, 0.7);
  border-color: rgba(203, 213, 225, 0.7);
}

html[data-theme='light'] .duration-main strong {
  color: var(--text-color);
}

html[data-theme='light'] .session-briefing-card {
  border-color: rgba(147, 197, 253, 0.6);
}

html[data-theme='light'] .briefing-status {
  color: var(--tone-blue) !important;
}

html[data-theme='light'] .briefing-item {
  background: #ffffff;
  border-color: rgba(203, 213, 225, 0.6);
}

html[data-theme='light'] .item-label {
  color: var(--secondary-text);
}

html[data-theme='light'] .item-value {
  color: var(--text-color);
}

html[data-theme='light'] .briefing-footer {
  border-top-color: rgba(203, 213, 225, 0.8);
}

html[data-theme='light'] .history-row {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(203, 213, 225, 0.6);
}

html[data-theme='light'] .history-row:hover {
  background: #ffffff;
  border-color: rgba(59, 130, 246, 0.4);
}

html[data-theme='light'] .exam-preview {
  color: var(--secondary-text);
}

html[data-theme='light'] .difficulty-tag {
  background: rgba(241, 245, 249, 0.9) !important;
}

/* 1024 档：旁栏固定 286px 会把主区压到 ~73px/卡，
   卡片标题与词量徽章必然重叠。因此侧栏提前在 1100px 折叠。 */
@media (max-width: 1100px) {
  .setup-shell {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .exam-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .setup-shell {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .setup-stage,
  .side-settings,
  .history-section {
    padding: 20px 18px;
    border-radius: var(--radius-lg);
  }

  .exam-card-grid {
    grid-template-columns: 1fr;
  }

  .setup-sidebar {
    position: static;
  }

  .history-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .history-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
