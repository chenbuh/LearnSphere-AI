<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { useThemeStore } from '@/stores/theme'
import {
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Rocket,
  Sparkles,
  Target,
  Compass,
  Layers,
  Activity,
  Timer
} from 'lucide-vue-next'
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

const themeStore = useThemeStore()
const isLightTheme = computed(() => themeStore.isLight)

const getSourceMeta = (value) => {
  const key = String(value || '').toLowerCase()
  if (key === 'economist') {
    return {
      tag: '高频考源',
      desc: '政经前沿 · 严谨社论',
      target: '考研 / 雅思 / 高考',
      accentColor: '#10b981'
    }
  }
  if (key === 'nyt') {
    return {
      tag: '地道美语',
      desc: '深度特写 · 时代视点',
      target: '托福 / GRE / 精读',
      accentColor: '#2b7a60'
    }
  }
  if (key === 'sciam') {
    return {
      tag: '前沿科普',
      desc: '科学前沿 · 论述精辟',
      target: '大学四六级 / 托福',
      accentColor: '#3b82f6'
    }
  }
  if (key === 'natgeo') {
    return {
      tag: '自然探索',
      desc: '地理生态 · 生动纪实',
      target: '雅思学术 / 泛读拓展',
      accentColor: '#f59e0b'
    }
  }
  if (key === 'classic') {
    return {
      tag: '经典传世',
      desc: '文学典籍 · 结构考究',
      target: '文学赏析 · 词法精读',
      accentColor: '#2b7a60'
    }
  }
  if (key === 'novel') {
    return {
      tag: '当代叙事',
      desc: '现当代语篇 · 情感共鸣',
      target: '沉浸流利 · 语感培养',
      accentColor: '#b4543a'
    }
  }
  return {
    tag: '权威精选',
    desc: '经典外刊 · 地道语料',
    target: '通识阅读',
    accentColor: '#10b981'
  }
}

const getCategoryKeywords = (value) => {
  const key = String(value || '').toLowerCase()
  const map = {
    tech: ['AI大模型', '深空探索', '生物芯片'],
    business: ['全球市场', '宏观经济', '企业战略'],
    humanities: ['文明演进', '哲学思辨', '历史探微'],
    nature: ['生态气候', '海洋生物', '碳中和'],
    society: ['都市生活', '代际沟通', '社会变迁'],
    art: ['视觉设计', '建筑美学', '文学鉴赏'],
    health: ['神经科学', '现代医疗', '心身健康'],
    science: ['量子力学', '天体物理', '实验前沿']
  }
  return map[key] || ['前沿主题', '核心考点', '原版语篇']
}

const selectedSourceLabel = computed(() => props.sources.find(item => item.value === props.settings.source)?.label || '经济学人')
const selectedCategoryLabel = computed(() => props.categories.find(item => item.value === props.settings.category)?.label || '科技前沿')
const selectedDifficultyLabel = computed(() => props.difficulties.find(item => item.value === props.settings.difficulty)?.label || '进阶')
const selectedLengthLabel = computed(() => props.lengths.find(item => item.value === props.settings.length)?.label || '中篇')

const estimatedWordCount = computed(() => {
  const len = String(props.settings.length || '').toLowerCase()
  if (len === 'short') return '350 ~ 500 词'
  if (len === 'long') return '750 ~ 1100 词'
  return '500 ~ 750 词'
})

const estimatedDuration = computed(() => {
  const len = String(props.settings.length || '').toLowerCase()
  if (len === 'short') return '5 ~ 8'
  if (len === 'long') return '12 ~ 18'
  return '8 ~ 12'
})
</script>

<template>
  <div class="setup-container">
    <section class="setup-shell" :class="{ 'setup-shell--light': isLightTheme }">
      <!-- 左侧：来源、题材配置舞台 -->
      <div class="setup-stage" :class="{ 'setup-stage--light': isLightTheme }">
        <div class="setup-stage-intro">
          <div class="setup-kicker-badge">
            <span class="kicker-dot"></span>
            <span class="setup-kicker">全真外刊与题库 · 阅读实验室</span>
          </div>
          <h2 class="setup-title">先定来源、题材与篇幅，再开启深度精读</h2>
          <p class="setup-caption">根据备考目标与兴趣自由选定文章语料源，系统将智能提取标准篇章与对应深度理解试题。</p>
        </div>

        <div class="setup-sections">
          <!-- 语料来源 -->
          <div class="setting-section">
            <div class="section-title-wrap">
              <div class="title-icon-box">
                <n-icon :component="BookOpen" size="18" color="#34d399" />
              </div>
              <h3 class="section-heading-title">阅读语料来源</h3>
              <span class="section-badge-counter">{{ sources.length }} 个权威刊源</span>
            </div>

            <div class="source-grid">
              <div
                v-for="src in sources"
                :key="src.value"
                class="source-option-card"
                :class="{
                  active: settings.source === src.value,
                  'source-option-card--light': isLightTheme
                }"
                :style="{
                  '--accent-color': getSourceMeta(src.value).accentColor
                }"
                @click="emit('update-setting', 'source', src.value)"
              >
                <!-- 顶部流光微线 -->
                <div class="card-top-line"></div>

                <!-- 背景光晕 -->
                <div class="card-glow-bg"></div>

                <!-- 右上角角标 -->
                <div v-if="settings.source === src.value" class="card-check-badge">
                  <n-icon :component="CheckCircle2" size="14" />
                </div>
                <div v-else class="card-tag-badge">
                  {{ getSourceMeta(src.value).tag }}
                </div>

                <!-- 刊物头部行 -->
                <div class="source-card-head">
                  <div class="source-icon-box">
                    <span class="source-icon-emoji">{{ src.icon }}</span>
                  </div>
                  <div class="source-title-group">
                    <span class="source-card-label">{{ src.label }}</span>
                    <span class="source-card-sub">{{ getSourceMeta(src.value).desc }}</span>
                  </div>
                </div>

                <!-- 适用目标胶囊 -->
                <div class="source-target-strip">
                  <span class="target-pill">
                    <Compass :size="11" />
                    <span>{{ getSourceMeta(src.value).target }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 文章题材分类 -->
          <div class="setting-section">
            <div class="section-title-wrap">
              <div class="title-icon-box">
                <n-icon :component="Target" size="18" color="#10b981" />
              </div>
              <h3 class="section-heading-title">文章题材分类</h3>
              <span class="section-badge-counter">{{ categories.length }} 大核心专题</span>
            </div>

            <div class="category-grid">
              <div
                v-for="cat in categories"
                :key="cat.value"
                class="category-option-card"
                :class="{
                  active: settings.category === cat.value,
                  'category-option-card--light': isLightTheme
                }"
                @click="emit('update-setting', 'category', cat.value)"
              >
                <!-- 顶部微饰线 -->
                <div class="card-top-line"></div>

                <!-- 右上角状态胶囊 -->
                <div class="category-state-pill" :class="{ 'is-selected': settings.category === cat.value }">
                  <n-icon v-if="settings.category === cat.value" :component="CheckCircle2" size="13" />
                  <span>{{ settings.category === cat.value ? '已选题材' : '选择' }}</span>
                </div>

                <!-- 图标与文案 -->
                <div class="category-card-head">
                  <div class="category-icon-box">
                    <n-icon :component="cat.icon" size="20" />
                  </div>
                  <div class="category-copy">
                    <div class="category-label">{{ cat.label }}</div>
                    <div class="category-desc">{{ cat.desc }}</div>
                  </div>
                </div>

                <!-- 题材关键词胶囊组 -->
                <div class="category-keywords-strip">
                  <span
                    v-for="(kw, kIdx) in getCategoryKeywords(cat.value)"
                    :key="kIdx"
                    class="keyword-pill"
                  >
                    {{ kw }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：控制边栏 -->
      <aside class="setup-sidebar">
        <div class="side-settings" :class="{ 'side-settings--light': isLightTheme }">
          <div class="settings-top-accent"></div>

          <div class="rail-head">
            <div class="rail-kicker-badge">
              <n-icon :component="Sparkles" size="13" color="#34d399" />
              <span class="rail-kicker">配置核验</span>
            </div>
            <h3 class="rail-title">难度与篇幅校准</h3>
            <p class="rail-caption">校准阅读节奏后，即刻生成交互式沉浸考卷。</p>
          </div>

          <!-- 难度等级控制 -->
          <div class="setting-section compact">
            <div class="section-sub-head">
              <n-icon :component="Brain" size="15" color="#34d399" />
              <h4>难度等级</h4>
            </div>
            <div class="pill-options">
              <button
                v-for="diff in difficulties"
                :key="diff.value"
                type="button"
                class="pill-option"
                :class="{
                  active: settings.difficulty === diff.value,
                  'pill-option--light': isLightTheme
                }"
                @click="emit('update-setting', 'difficulty', diff.value)"
              >
                {{ diff.label }}
              </button>
            </div>
          </div>

          <!-- 文章篇幅控制 -->
          <div class="setting-section compact">
            <div class="section-sub-head">
              <n-icon :component="FileText" size="15" color="#34d399" />
              <h4>文章篇幅</h4>
            </div>
            <div class="pill-options">
              <button
                v-for="len in lengths"
                :key="len.value"
                type="button"
                class="pill-option"
                :class="{
                  active: settings.length === len.value,
                  'pill-option--light': isLightTheme
                }"
                @click="emit('update-setting', 'length', len.value)"
              >
                {{ len.label }}
              </button>
            </div>
          </div>

          <!-- 新增：精读任务配置概要小看板 (Session Briefing Card) -->
          <div class="session-briefing-card" :class="{ 'session-briefing-card--light': isLightTheme }">
            <div class="briefing-header">
              <span class="briefing-pulse-dot"></span>
              <span class="briefing-header-text">参数已就绪 · 篇章生成引擎待命</span>
            </div>

            <div class="briefing-grid">
              <div class="briefing-item">
                <span class="briefing-item-label">语料来源</span>
                <span class="briefing-item-value highlight">{{ selectedSourceLabel }}</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">文章题材</span>
                <span class="briefing-item-value">{{ selectedCategoryLabel }}</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">挑战难度</span>
                <span class="briefing-item-value">{{ selectedDifficultyLabel }}</span>
              </div>
              <div class="briefing-item">
                <span class="briefing-item-label">篇幅规格</span>
                <span class="briefing-item-value">{{ selectedLengthLabel }} ({{ estimatedWordCount }})</span>
              </div>
            </div>

            <div class="briefing-footer-hint">
              <Timer :size="13" />
              <span>预计阅读与答题耗时 <strong>{{ estimatedDuration }}</strong> 分钟 · 沉浸精读</span>
            </div>
          </div>

          <!-- 生成主按键 -->
          <div class="action-footer">
            <button
              type="button"
              class="reading-start-btn glow-btn"
              :class="{ 'is-loading': isLoading }"
              :disabled="isLoading"
              @click="emit('generate')"
            >
              <Rocket :size="18" class="rocket-icon" />
              <span>{{ isLoading ? '正在智能生成外刊篇章与试题...' : '生成阅读任务' }}</span>
              <div class="btn-shimmer"></div>
            </button>
            <p class="rail-note">生成后支持全屏沉浸阅读、实时段落批注与 AI 助教答疑。</p>
          </div>
        </div>
      </aside>
    </section>

    <!-- 历史记录列表 -->
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
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
  margin-bottom: 12px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  animation: kicker-pulse 2s infinite ease-in-out;
}

@keyframes kicker-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.setup-kicker {
  color: var(--tone-emerald);
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
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.25);
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

/* ================== 语料来源卡片网格 (Source Grid) ================== */
.source-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.source-option-card {
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
  min-height: 120px;
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
  background: #10b981;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.source-option-card:hover {
  background: var(--card-bg);
  border-color: rgba(52, 211, 153, 0.35);
  transform: translateY(-2px);
}

.source-option-card:hover .card-glow-bg {
  opacity: 0.08;
}

.source-option-card.active {
  background: var(--card-bg);
  border: 1.5px solid rgba(52, 211, 153, 0.8);
  box-shadow:
    0 12px 32px rgba(16, 185, 129, 0.2),
    inset 0 0 0 1px rgba(52, 211, 153, 0.4);
}

.source-option-card.active .card-top-line {
  background: #34d399;
}

.source-option-card.active .card-glow-bg {
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
  background: #10b981;
  /* 实心绿底固定深色 ink，深色主题下 var(--text-color) 仅 1.9:1 */
  color: #04321f;
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

.source-option-card:hover .card-tag-badge {
  /* 浅色 mint 在浅色主题白底仅 1.5:1，改语义绿色令牌 */
  color: var(--tone-emerald);
  border-color: rgba(52, 211, 153, 0.3);
}

.source-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 32px;
}

.source-icon-box {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.source-icon-emoji {
  font-size: 1.25rem;
}

.source-option-card:hover .source-icon-box {
  transform: scale(1.06);
  border-color: rgba(52, 211, 153, 0.35);
}

.source-option-card.active .source-icon-box {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(52, 211, 153, 0.6);
}

.source-title-group {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.source-card-label {
  font-weight: 800;
  font-size: 1.02rem;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.source-card-sub {
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-target-strip {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.target-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  /* R3：原 #a7f3d0 在浅色主题仅 1.3:1，改语义绿色令牌 */
  color: var(--tone-emerald);
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.2);
  padding: 2px 7px;
  border-radius: 4px;
}

/* ================== 题材卡片网格 (Category Grid) ================== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.category-option-card {
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

.category-option-card:hover {
  background: var(--card-bg);
  border-color: rgba(52, 211, 153, 0.35);
  transform: translateY(-2px);
}

.category-option-card.active {
  background: var(--card-bg);
  border: 1.5px solid rgba(52, 211, 153, 0.8);
  box-shadow:
    0 12px 32px rgba(16, 185, 129, 0.2),
    inset 0 0 0 1px rgba(52, 211, 153, 0.4);
}

.category-option-card.active .card-top-line {
  background: #34d399;
}

.category-state-pill {
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

.category-state-pill.is-selected {
  background: #10b981;
  /* 实心绿底固定深色 ink */
  color: #04321f;
}

.category-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 70px;
}

.category-icon-box {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--tone-emerald);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.category-option-card:hover .category-icon-box {
  transform: scale(1.05);
  color: var(--tone-emerald);
}

.category-option-card.active .category-icon-box {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(52, 211, 153, 0.6);
  color: var(--tone-emerald);
}

.category-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.category-label {
  font-weight: 800;
  font-size: 1.02rem;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.category-desc {
  font-size: 0.72rem;
  color: var(--secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-keywords-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.keyword-pill {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 2px 7px;
  border-radius: 4px;
}

.category-option-card.active .keyword-pill {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
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
  background: #34d399;
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
}

.rail-kicker {
  color: var(--tone-emerald);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.rail-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-color);
}

.rail-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.82rem;
  line-height: 1.5;
}

.section-sub-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.section-sub-head h4 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-color);
}

.pill-options {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
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
  border-color: rgba(52, 211, 153, 0.35);
  color: var(--text-color);
}

.pill-option.active {
  background: #10b981;
  /* 实心绿底固定深色 ink */
  color: #04321f;
  border-color: rgba(255, 255, 255, 0.25);
  font-weight: 800;
}

/* ================== 精读配置看板 (Session Briefing Card) ================== */
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
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
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
  color: var(--tone-emerald);
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
  /* R3：原 #a7f3d0 浅色主题 1.3:1 */
  color: var(--tone-emerald);
}

/* ================== 主行动按钮 (Hero Button) ================== */
.action-footer {
  display: grid;
  gap: 10px;
  margin-top: auto;
}

.reading-start-btn {
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
  /* 实心绿底固定深色 ink，两套主题均达标 */
  color: #04321f;
  background: #34d399;
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

.reading-start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.reading-start-btn:hover:not(:disabled) .rocket-icon {
  transform: translateY(-2px) rotate(-8deg);
}

.reading-start-btn:active:not(:disabled) {
  transform: translateY(0);
}

.reading-start-btn:disabled {
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

.source-option-card--light {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

.source-option-card--light:hover {
  background: #ffffff;
  border-color: rgba(16, 185, 129, 0.45);
}

.source-option-card--light.active {
  background: var(--card-bg);
  border-color: rgba(16, 185, 129, 0.7);
}

.source-option-card--light .source-card-label {
  color: #0f172a;
}

.source-option-card--light .source-card-sub {
  color: #475569;
}

.source-option-card--light .card-tag-badge {
  color: var(--secondary-text);
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(148, 163, 184, 0.2);
}

.source-option-card--light .source-icon-box {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
}

.source-option-card--light .target-pill {
  color: #065f46;
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25);
}

.category-option-card--light {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

.category-option-card--light:hover {
  background: #ffffff;
  border-color: rgba(16, 185, 129, 0.45);
}

.category-option-card--light.active {
  background: var(--card-bg);
  border-color: rgba(16, 185, 129, 0.7);
}

.category-option-card--light .category-label {
  color: #0f172a;
}

.category-option-card--light .category-desc {
  color: #475569;
}

.category-option-card--light .category-icon-box {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  color: var(--tone-emerald);
}

.category-option-card--light .keyword-pill {
  color: #475569;
  background: rgba(15, 23, 42, 0.035);
  border-color: rgba(148, 163, 184, 0.18);
}

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
  border-color: rgba(16, 185, 129, 0.4);
}

.side-settings--light .pill-option.active {
  background: #10b981;
  /* 实心绿底统一固定深色 ink */
  color: #04321f;
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
  color: var(--tone-emerald);
}

.side-settings--light .briefing-footer-hint {
  border-top-color: rgba(148, 163, 184, 0.2);
  color: #475569;
}

.side-settings--light .briefing-footer-hint strong {
  color: #047857;
}

.side-settings--light .rail-note {
  color: var(--secondary-text);
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1080px) {
  .setup-shell {
    grid-template-columns: 1fr;
  }

  .source-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .setup-stage {
    padding: 20px 16px;
    border-radius: var(--radius-lg);
  }

  .source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .category-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
