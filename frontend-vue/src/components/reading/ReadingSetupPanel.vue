<template>
  <div class="setup-container">
    <section class="setup-shell">
      <div class="setup-stage">
        <div class="setup-stage-intro">
          <p class="setup-kicker">阅读准备</p>
          <h2 class="setup-title">先定来源、题材与篇幅，再开始本次阅读练习</h2>
          <p class="setup-caption">先选择阅读来源、题材和题量，确认后开始本次练习。</p>
        </div>

        <div class="setup-sections">
          <div class="setting-section">
            <h3><n-icon :component="BookOpen" color="#34d399" /> 阅读来源</h3>
            <div class="grid-options source-grid">
              <button
                v-for="src in sources"
                :key="src.value"
                type="button"
                class="option-card option-card--source"
                :class="{ active: settings.source === src.value }"
                @click="emit('update-setting', 'source', src.value)"
              >
                <span class="option-icon">{{ src.icon }}</span>
                <span class="option-label">{{ src.label }}</span>
              </button>
            </div>
          </div>

          <div class="setting-section">
            <h3><n-icon :component="Target" color="#10b981" /> 文章题材</h3>
            <div class="grid-options category-grid">
              <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                class="option-card option-card--detail"
                :class="{ active: settings.category === cat.value }"
                @click="emit('update-setting', 'category', cat.value)"
              >
                <div class="option-icon option-icon--box">
                  <n-icon :component="cat.icon" />
                </div>
                <div class="option-copy">
                  <div class="option-label">{{ cat.label }}</div>
                  <div class="option-desc">{{ cat.desc }}</div>
                </div>
                <span class="option-state">{{ settings.category === cat.value ? '当前' : '选择' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside class="setup-sidebar">
        <div class="side-settings">
          <div class="rail-head">
            <p class="rail-kicker">开始练习</p>
            <h3 class="rail-title">确认难度和篇幅后开始生成任务</h3>
            <p class="rail-caption">确认设置后即可生成本次阅读任务。</p>
          </div>

          <div class="setting-section compact">
            <h3><n-icon :component="Brain" color="#34d399" /> 难度等级</h3>
            <div class="pill-options">
              <button
                v-for="diff in difficulties"
                :key="diff.value"
                type="button"
                class="pill-option"
                :class="{ active: settings.difficulty === diff.value }"
                @click="emit('update-setting', 'difficulty', diff.value)"
              >
                {{ diff.label }}
              </button>
            </div>
          </div>

          <div class="setting-section compact">
            <h3><n-icon :component="FileText" color="#34d399" /> 文章篇幅</h3>
            <div class="pill-options">
              <button
                v-for="len in lengths"
                :key="len.value"
                type="button"
                class="pill-option"
                :class="{ active: settings.length === len.value }"
                @click="emit('update-setting', 'length', len.value)"
              >
                {{ len.label }}
              </button>
            </div>
          </div>

          <div class="selection-summary">
            <div class="summary-row">
              <span>来源</span>
              <strong>{{ selectedSourceLabel }}</strong>
            </div>
            <div class="summary-row">
              <span>题材</span>
              <strong>{{ selectedCategoryLabel }}</strong>
            </div>
            <div class="summary-row">
              <span>难度</span>
              <strong>{{ selectedDifficultyLabel }}</strong>
            </div>
            <div class="summary-row">
              <span>篇幅</span>
              <strong>{{ selectedLengthLabel }}</strong>
            </div>
          </div>

          <p class="rail-note">生成后可直接查看原文、题目和当前进度。</p>

          <n-button
            type="primary"
            size="large"
            block
            class="start-btn"
            :loading="isLoading"
            @click="emit('generate')"
          >
            <template #icon><n-icon :component="Rocket" /></template>
            生成阅读任务
          </n-button>
        </div>
      </aside>
    </section>

    <ReadingHistoryPanel
      :items="items"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :calculate-word-count="calculateWordCount"
      @select="emit('select', $event)"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:page-size', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { BookOpen, Brain, FileText, Rocket, Target } from 'lucide-vue-next'
import ReadingHistoryPanel from '@/components/reading/ReadingHistoryPanel.vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  sources: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  lengths: {
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
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  calculateWordCount: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update-setting', 'generate', 'select', 'update:page', 'update:page-size'])

const selectedSourceLabel = computed(() => props.sources.find(item => item.value === props.settings.source)?.label || '未选择')
const selectedCategoryLabel = computed(() => props.categories.find(item => item.value === props.settings.category)?.label || '未选择')
const selectedDifficultyLabel = computed(() => props.difficulties.find(item => item.value === props.settings.difficulty)?.label || '未选择')
const selectedLengthLabel = computed(() => props.lengths.find(item => item.value === props.settings.length)?.label || '未选择')
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
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.06), transparent 42%);
}

.setup-stage-intro {
  margin-bottom: 22px;
}

.setup-kicker,
.rail-kicker {
  margin: 0 0 10px;
  color: #34d399;
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
.rail-note {
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

.grid-options {
  display: grid;
  gap: 12px;
}

.source-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.category-grid {
  grid-template-columns: 1fr;
}

.option-card {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  text-align: left;
  color: inherit;
  background: rgba(15, 23, 42, 0.22);
}

.option-card:hover {
  background: rgba(15, 23, 42, 0.34);
  border-color: rgba(52, 211, 153, 0.22);
  transform: translateY(-1px);
}

.option-card.active {
  background:
    linear-gradient(180deg, rgba(52, 211, 153, 0.14), rgba(16, 185, 129, 0.06)),
    rgba(15, 23, 42, 0.24);
  border-color: rgba(52, 211, 153, 0.45);
}

.option-card--source {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 62px;
}

.option-card--detail {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding-block: 18px;
}

.option-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.option-icon--box {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}

.option-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
  max-width: 38rem;
}

.option-label {
  font-weight: 600;
  font-size: 0.96rem;
  color: var(--text-color);
}

.option-desc {
  font-size: 0.76rem;
  color: var(--secondary-text);
  line-height: 1.55;
  opacity: 0.88;
}

.option-state {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.86;
}

.option-card.active .option-state {
  color: #6ee7b7;
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
  background: linear-gradient(135deg, #34d399, #10b981);
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
  background: linear-gradient(135deg, #34d399, #10b981) !important;
  box-shadow: none;
}

:global(html[data-theme='light'] .setup-stage),
:global(html[data-theme='light'] .side-settings) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(52, 211, 153, 0.08), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .option-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

:global(html[data-theme='light'] .option-card:hover) {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(52, 211, 153, 0.26);
}

:global(html[data-theme='light'] .option-card.active) {
  background:
    linear-gradient(180deg, rgba(220, 252, 231, 0.82), rgba(240, 253, 244, 0.72)),
    rgba(255, 255, 255, 0.94);
}

:global(html[data-theme='light'] .option-icon--box),
:global(html[data-theme='light'] .pill-option) {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .selection-summary) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .selection-summary),
:global(html[data-theme='light'] .side-settings) {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.76);
}

:global(html[data-theme='light'] .setup-title),
:global(html[data-theme='light'] .rail-title),
:global(html[data-theme='light'] .option-label),
:global(html[data-theme='light'] .summary-row strong) {
  color: #0f172a;
}

:global(html[data-theme='light'] .setup-caption),
:global(html[data-theme='light'] .rail-caption),
:global(html[data-theme='light'] .rail-note),
:global(html[data-theme='light'] .option-desc),
:global(html[data-theme='light'] .option-state),
:global(html[data-theme='light'] .summary-row),
:global(html[data-theme='light'] .pill-option) {
  color: #64748b;
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
  .rail-note {
    margin-top: 8px;
    font-size: 0.86rem;
    line-height: 1.55;
  }

  .source-grid,
  .category-grid {
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

  .option-card {
    padding: 12px 14px;
    border-radius: 16px;
  }

  .option-state {
    display: none;
  }

  .start-btn {
    height: 48px;
    font-size: 0.95rem;
  }
}
</style>

<style src="../../assets/learning-mobile.css" scoped></style>

