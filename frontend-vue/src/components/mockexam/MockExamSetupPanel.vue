<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NPagination, NTag } from 'naive-ui'
import { Brain, Clock, GraduationCap, History, Rocket, Target, Timer } from 'lucide-vue-next'
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

const selectedExamLabel = computed(() => props.examTypes.find(item => item.value === props.settings.examType)?.label || '未选择')
const selectedDifficultyLabel = computed(() => props.difficulties.find(item => item.value === props.settings.difficulty)?.label || '未选择')
const getDifficultyLabel = (value) => props.difficulties.find(item => item.value === value)?.label || '标准难度'
</script>

<template>
  <div class="setup-shell">
    <section class="setup-stage">
      <div class="setup-stage-intro">
        <p class="setup-kicker">考试准备</p>
        <h2 class="setup-title">先确定考试项目和难度，再开始本次模拟考</h2>
        <p class="setup-caption">先选择考试项目，再确认难度和时长后开始本次模拟考。</p>
      </div>

      <div class="setting-section">
        <h3><n-icon :component="GraduationCap" color="#60a5fa" /> 考试项目</h3>
        <div class="grid-options exam-grid">
          <button
            v-for="type in examTypes"
            :key="type.value"
            type="button"
            class="option-card"
            :class="{ active: settings.examType === type.value }"
            @click="$emit('update-setting', 'examType', type.value)"
          >
            <div class="option-badge" :style="{ color: type.color, background: type.bg }">
              {{ type.icon }}
            </div>
            <div class="option-copy">
              <span class="option-label">{{ type.label }}</span>
              <span class="option-desc">{{ type.desc }}</span>
            </div>
            <span class="option-state">{{ settings.examType === type.value ? '当前' : '选择' }}</span>
          </button>
        </div>
      </div>
    </section>

    <aside class="setup-sidebar">
      <div class="side-settings">
        <div class="rail-head">
          <p class="rail-kicker">考试控制</p>
          <h3 class="rail-title">确认难度后开始本次模拟考</h3>
          <p class="rail-caption">确认设置后即可进入本次模拟考。</p>
        </div>

        <div class="setting-section compact">
          <h3><n-icon :component="Brain" color="#818cf8" /> 难度等级</h3>
          <div class="pill-options">
            <button
              v-for="difficulty in difficulties"
              :key="difficulty.value"
              type="button"
              class="pill-option"
              :class="{ active: settings.difficulty === difficulty.value }"
              @click="$emit('update-setting', 'difficulty', difficulty.value)"
            >
              {{ difficulty.icon }} {{ difficulty.label }}
            </button>
          </div>
        </div>

        <div class="setting-section compact">
          <h3><n-icon :component="Clock" color="#60a5fa" /> 标准时长</h3>
          <div class="duration-box">
            <strong>{{ settings.duration }} 分钟</strong>
            <span>默认按完整模拟考节奏进行</span>
          </div>
        </div>

        <div class="selection-summary">
          <div class="summary-row">
            <span>考试项目</span>
            <strong>{{ selectedExamLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>难度</span>
            <strong>{{ selectedDifficultyLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>历史考卷</span>
            <strong>{{ exams.length }}</strong>
          </div>
        </div>

        <p class="rail-note">进入考场后即可查看题目、作答区和题号导航。</p>

        <n-button
          type="primary"
          size="large"
          block
          class="start-btn"
          :loading="generating"
          @click="$emit('generate')"
        >
          <template #icon><n-icon :component="Rocket" /></template>
          进入模拟考场
        </n-button>
      </div>
    </aside>
  </div>

  <section v-if="exams.length > 0" class="history-section">
    <div class="history-heading">
      <div>
        <p class="setup-kicker">考卷记录</p>
        <div class="section-title"><n-icon :component="History" /> 最近生成考卷</div>
      </div>
      <span class="history-count">{{ exams.length }} 条</span>
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
          <n-tag size="small" type="info" :bordered="false">{{ getExamTypeLabel(exam.examType, '未选择') }}</n-tag>
          <n-tag size="small" :bordered="false">{{ getDifficultyLabel(exam.difficulty) }}</n-tag>
          <span class="history-mode">{{ exam.duration }} 分钟</span>
        </div>
        <div class="history-copy">
          <h4 class="exam-title">{{ exam.title }}</h4>
          <div class="exam-preview">
            <span><Timer :size="14" /> {{ exam.duration }} 分钟</span>
            <span><Target :size="14" /> {{ exam.totalQuestions }} 题</span>
          </div>
        </div>
        <div class="history-action">
          <span>开始考试</span>
          <n-icon :component="Rocket" />
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
.setup-shell { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px; align-items: start; }
.setup-stage { min-width: 0; padding: 26px 28px; border-radius: 28px; border: 1px solid rgba(148,163,184,.1); background: linear-gradient(180deg, rgba(15,23,42,.5), rgba(15,23,42,.24)), radial-gradient(circle at top right, rgba(96,165,250,.06), transparent 42%); }
.setup-stage-intro { margin-bottom: 22px; }
.setup-kicker,.rail-kicker { margin: 0 0 10px; color: #60a5fa; font-size: .74rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.setup-title,.rail-title { margin: 0; color: var(--text-color); line-height: 1.2; }
.setup-title { font-size: 1.65rem; }
.setup-caption,.rail-caption,.rail-note { margin: 12px 0 0; color: var(--secondary-text); line-height: 1.65; }
.setting-section { padding-top: 24px; border-top: 1px solid rgba(148,163,184,.1); }
.setting-section:first-of-type,.setting-section.compact { padding-top: 0; border-top: 0; }
.setting-section h3,.section-title { display: flex; align-items: center; gap: 8px; margin: 0 0 14px; color: var(--text-color); }
.grid-options { display: grid; gap: 12px; }
.exam-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.option-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; min-height: 92px; padding: 18px 20px; border: 1px solid rgba(148,163,184,.1); border-radius: 20px; background: rgba(15,23,42,.22); color: var(--text-color); cursor: pointer; text-align: left; transition: .2s; }
.option-card:hover { background: rgba(15,23,42,.34); border-color: rgba(96,165,250,.22); transform: translateY(-1px); }
.option-card.active { background: linear-gradient(180deg, rgba(96,165,250,.14), rgba(99,102,241,.06)), rgba(15,23,42,.24); border-color: rgba(96,165,250,.45); }
.option-badge { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 14px; font-weight: 800; font-size: 1.18rem; }
.option-copy { display: grid; gap: 5px; min-width: 0; }
.option-label { font-weight: 700; font-size: 1rem; }
.option-desc { color: var(--secondary-text); font-size: .82rem; line-height: 1.45; }
.option-state { color: var(--secondary-text); font-size: .74rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.option-card.active .option-state { color: #bfdbfe; }
.setup-sidebar { position: sticky; top: 92px; min-width: 0; }
.side-settings { display: grid; gap: 18px; padding: 22px 20px; border-radius: 22px; border: 1px solid rgba(148,163,184,.1); background: rgba(15,23,42,.22); }
.rail-head { display: grid; gap: 8px; }
.pill-options { display: flex; flex-wrap: wrap; gap: 10px; }
.pill-option { flex: 1; min-width: 90px; padding: 10px 12px; border-radius: 999px; border: 1px solid rgba(148,163,184,.12); background: rgba(15,23,42,.3); color: var(--secondary-text); cursor: pointer; transition: .2s; }
.pill-option.active { background: linear-gradient(135deg, #60a5fa, #6366f1); color: #fff; border-color: transparent; }
.duration-box,.selection-summary { border-top: 1px solid rgba(148,163,184,.1); border-bottom: 1px solid rgba(148,163,184,.1); }
.duration-box { display: grid; gap: 4px; padding: 14px 0; }
.duration-box strong { color: var(--text-color); font-size: 1.15rem; }
.duration-box span,.summary-row { color: var(--secondary-text); font-size: .9rem; }
.selection-summary { display: grid; gap: 10px; padding: 16px 0; }
.summary-row { display: flex; justify-content: space-between; gap: 12px; }
.summary-row strong { color: var(--text-color); font-size: .95rem; }
.start-btn { height: 56px; border-radius: 18px; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #6366f1) !important; box-shadow: none; }
.history-section { margin-top: 28px; padding-top: 24px; border-top: 1px solid rgba(148,163,184,.12); }
.history-heading { display: flex; justify-content: space-between; align-items: end; gap: 16px; margin-bottom: 18px; }
.history-count { color: var(--secondary-text); font-size: .85rem; font-weight: 600; }
.history-list { display: flex; flex-direction: column; }
.history-row { display: grid; grid-template-columns: minmax(150px, 180px) minmax(0, 1fr) auto; gap: 18px; align-items: center; width: 100%; padding: 18px 0; border: 0; border-bottom: 1px solid rgba(148,163,184,.1); background: transparent; color: inherit; text-align: left; cursor: pointer; transition: .2s; }
.history-row:first-child { border-top: 1px solid rgba(148,163,184,.1); }
.history-row:hover { background: rgba(15,23,42,.16); }
.history-meta,.exam-preview,.history-action { display: flex; align-items: center; gap: 10px; }
.history-meta { flex-wrap: wrap; }
.history-mode,.history-action,.exam-preview { color: var(--secondary-text); font-size: .78rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.history-copy { min-width: 0; }
.exam-title { margin: 0 0 8px; color: var(--text-color); font-size: 1rem; line-height: 1.45; }
.history-row:hover .history-action { color: #60a5fa; transform: translateX(2px); }
.pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }

:global(html[data-theme='light'] .setup-stage),
:global(html[data-theme='light'] .side-settings) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.08), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .option-card),
:global(html[data-theme='light'] .pill-option) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

:global(html[data-theme='light'] .option-card:hover) {
  background: rgba(255, 255, 255, 1);
}

:global(html[data-theme='light'] .option-card.active) {
  background:
    linear-gradient(180deg, rgba(219, 234, 254, 0.86), rgba(239, 246, 255, 0.76)),
    rgba(255, 255, 255, 0.94);
}

:global(html[data-theme='light'] .selection-summary),
:global(html[data-theme='light'] .duration-box) {
  background: rgba(255, 255, 255, 0.62);
}

:global(html[data-theme='light'] .duration-box),
:global(html[data-theme='light'] .selection-summary),
:global(html[data-theme='light'] .history-row:first-child),
:global(html[data-theme='light'] .history-row) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .summary-row),
:global(html[data-theme='light'] .history-mode),
:global(html[data-theme='light'] .history-action),
:global(html[data-theme='light'] .exam-preview),
:global(html[data-theme='light'] .option-desc),
:global(html[data-theme='light'] .rail-caption),
:global(html[data-theme='light'] .rail-note),
:global(html[data-theme='light'] .duration-box span) {
  color: #64748b;
}

:global(html[data-theme='light'] .summary-row strong),
:global(html[data-theme='light'] .duration-box strong),
:global(html[data-theme='light'] .exam-title),
:global(html[data-theme='light'] .setup-title),
:global(html[data-theme='light'] .rail-title),
:global(html[data-theme='light'] .option-label) {
  color: #0f172a;
}

:global(html[data-theme='light'] .history-row:hover) {
  background: rgba(248, 250, 252, 0.88);
}

@media (max-width: 900px) {
  .setup-shell { grid-template-columns: 1fr; gap: 16px; }
  .setup-stage { padding: 16px 14px; border-radius: 20px; }
  .setup-title { font-size: 1.12rem; }
  .setup-caption,.rail-caption,.rail-note { margin-top: 8px; font-size: .86rem; line-height: 1.55; }
  .exam-grid { grid-template-columns: 1fr; }
  .option-card { grid-template-columns: auto minmax(0, 1fr); min-height: 82px; padding: 16px; }
  .option-state { grid-column: 2; }
  .setup-sidebar { position: static; top: auto; }
  .side-settings { padding: 12px 10px; border-radius: 18px; }
  .history-heading { flex-direction: column; align-items: flex-start; gap: 8px; }
  .history-row { grid-template-columns: 1fr; gap: 10px; padding: 14px; border-radius: 16px; border: 1px solid rgba(148,163,184,.1); background: linear-gradient(180deg, rgba(15,23,42,.42), rgba(15,23,42,.24)), radial-gradient(circle at top right, rgba(96,165,250,.06), transparent 40%); }
  .history-action { justify-content: space-between; }
  .pagination-wrapper { justify-content: flex-start; overflow-x: auto; }

  :global(html[data-theme='light'] .history-row) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
      radial-gradient(circle at top right, rgba(96, 165, 250, 0.08), transparent 40%);
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

