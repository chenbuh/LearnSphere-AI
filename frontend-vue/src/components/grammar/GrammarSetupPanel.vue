<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NPagination, NTag } from 'naive-ui'
import { ArrowRight, CheckCircle2, History, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  grammarTopics: {
    type: Array,
    default: () => []
  },
  selectedTopic: {
    type: Number,
    default: 0
  },
  historyTotal: {
    type: Number,
    default: 0
  },
  historyPage: {
    type: Number,
    default: 1
  },
  historyPageSize: {
    type: Number,
    default: 6
  },
  paginatedHistory: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select-topic', 'load-history', 'update:history-page', 'update:history-page-size'])

const selectedTopicInfo = computed(
  () => props.grammarTopics.find(topic => topic.id === props.selectedTopic) || null
)
</script>

<template>
  <section class="setup-shell">
    <div class="setup-main">
      <div class="setup-intro">
        <div class="intro-left">
          <div class="intro-kicker">
            <span class="kicker-dot"></span>
            <span>核心语法考点拓扑库</span>
          </div>
          <h2>先选一个知识点，开启精准特训</h2>
        </div>
        <p class="intro-desc">
          AI 引擎将围绕考纲高频考点与典型真题句型，智能生成梯度作答题，稳步攻克易错语法盲区。
        </p>
      </div>

      <div class="topic-grid">
        <button
          v-for="topic in props.grammarTopics"
          :key="topic.id"
          type="button"
          class="topic-card"
          :class="{ active: props.selectedTopic === topic.id }"
          @click="$emit('select-topic', topic.id)"
        >
          <div class="card-glow-bg"></div>
          <div class="topic-top">
            <div class="topic-mark" :style="{ backgroundColor: topic.bg, color: topic.color }">
              <n-icon :component="topic.icon" size="20" />
            </div>
            <div class="topic-meta">
              <span class="topic-label">语法知识点</span>
              <strong>{{ topic.count }} <small>题库</small></strong>
            </div>
            <div v-if="props.selectedTopic === topic.id" class="topic-check-badge">
              <n-icon :component="CheckCircle2" size="16" />
            </div>
          </div>

          <div class="topic-body">
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.desc }}</p>
          </div>

          <div class="topic-foot">
            <span class="status-pill" :class="{ current: props.selectedTopic === topic.id }">
              {{ props.selectedTopic === topic.id ? '当前特训主题' : '点击切换' }}
            </span>
            <div class="arrow-wrap">
              <n-icon :component="ArrowRight" size="14" />
            </div>
          </div>
        </button>
      </div>
    </div>

    <aside class="setup-rail">
      <div class="rail-panel rail-panel--focus">
        <div class="rail-top-accent"></div>
        <div class="rail-heading">
          <n-icon :component="Sparkles" />
          <span>当前特训靶向</span>
        </div>
        <h3>{{ selectedTopicInfo?.title || '请选择一个语法主题' }}</h3>
        <p>
          {{
            selectedTopicInfo?.desc ||
            '从左侧挑一个更想强化的语法点，右侧配置会继续沿用你的训练节奏。'
          }}
        </p>
        <div class="rail-stats">
          <div class="rail-stat-card">
            <span>题库总量</span>
            <strong>{{ selectedTopicInfo?.count || 0 }} <small>道</small></strong>
          </div>
          <div class="rail-stat-card">
            <span>历史练习</span>
            <strong>{{ props.historyTotal }} <small>次</small></strong>
          </div>
        </div>
      </div>

      <div v-if="props.historyTotal > 0" class="rail-panel">
        <div class="rail-heading history">
          <n-icon :component="History" />
          <span>最近生成练习</span>
        </div>

        <div class="history-list">
          <button
            v-for="exercise in props.paginatedHistory"
            :key="exercise.id"
            type="button"
            class="history-item"
            @click="$emit('load-history', exercise)"
          >
            <div class="history-main">
              <strong>{{ exercise.topic || 'Grammar' }}</strong>
              <span
                >{{ exercise.questions?.length || 0 }} 题 ·
                {{ exercise.difficulty || 'medium' }}</span
              >
            </div>
            <n-tag size="small" :bordered="false" class="history-tag"> 载入 </n-tag>
          </button>
        </div>

        <n-pagination
          class="history-pagination"
          :page="props.historyPage"
          :item-count="props.historyTotal"
          :page-size="props.historyPageSize"
          simple
          @update:page="$emit('update:history-page', $event)"
          @update:page-size="$emit('update:history-page-size', $event)"
        />
      </div>
    </aside>
  </section>
</template>

<style scoped>
.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(290px, 0.75fr);
  gap: 24px;
  align-items: start;
}

.setup-main,
.rail-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
}

.setup-main {
  padding: 30px;
}

/* ================== 头部排版 (Intro) ================== */
.setup-intro {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  padding-bottom: 24px;
  margin-bottom: 26px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.intro-left {
  display: flex;
  flex-direction: column;
}

.intro-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: var(--tone-orange);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
  width: fit-content;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
  animation: pulseDot 2s ease-in-out infinite;
}

.setup-intro h2 {
  margin: 0;
  font-size: clamp(1.45rem, 2vw, 1.95rem);
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: -0.01em;
  background: none;
  color: inherit;
}

.intro-desc {
  max-width: 28rem;
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.65;
}

/* ================== 主题卡片网格 (Topic Grid) ================== */
.topic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.topic-card {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 20px 20px 18px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.025);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-glow-bg {
  position: absolute;
  inset: 0;
  background: transparent;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.topic-card:hover {
  transform: translateY(-3px);
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 255, 255, 0.045);
}

.topic-card:hover .card-glow-bg {
  opacity: 1;
}

.topic-card.active {
  border-color: rgba(249, 115, 22, 0.65);
  background: var(--card-bg);
  box-shadow:
    0 0 28px rgba(249, 115, 22, 0.22),
    inset 0 0 0 1px rgba(249, 115, 22, 0.45);
}

.topic-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.topic-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
}

.topic-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.topic-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--secondary-text);
}

.topic-meta strong {
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 800;
}

.topic-meta strong small {
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--secondary-text);
  margin-left: 2px;
}

.topic-check-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.2);
  border: 1px solid rgba(249, 115, 22, 0.4);
  color: var(--tone-orange);
}

.topic-body h3 {
  margin: 0 0 8px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-color);
}

.topic-body p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.6;
  min-height: 3.2em;
}

.topic-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.status-pill {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--secondary-text);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.status-pill.current {
  background: rgba(249, 115, 22, 0.2);
  color: var(--tone-orange);
  border-color: rgba(249, 115, 22, 0.4);
}

.arrow-wrap {
  display: flex;
  align-items: center;
  color: var(--secondary-text);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
}

.topic-card:hover .arrow-wrap {
  transform: translateX(3px);
  color: var(--tone-orange);
}

/* ================== 右侧信息栏 (Rail Panels) ================== */
.setup-rail {
  display: grid;
  gap: 20px;
}

.rail-panel {
  padding: 24px;
}

.rail-top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f97316;
}

.rail-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: var(--tone-orange);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-heading.history {
  color: var(--secondary-text);
}

.rail-panel h3 {
  margin: 0 0 10px;
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-color);
}

.rail-panel p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.65;
}

.rail-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.rail-stat-card {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.035);
}

.rail-stat-card span {
  display: block;
  margin-bottom: 4px;
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-stat-card strong {
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 900;
}

.rail-stat-card strong small {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--secondary-text);
  margin-left: 2px;
}

/* ================== 历史记录列表 (History) ================== */
.history-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.025);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.history-item:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.history-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.history-main strong {
  color: var(--text-color);
  font-size: 0.94rem;
  font-weight: 700;
}

.history-main span {
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.history-tag {
  background: rgba(249, 115, 22, 0.15) !important;
  color: var(--tone-orange) !important;
  border: 1px solid rgba(249, 115, 22, 0.25) !important;
  font-weight: 600;
}

.history-pagination {
  margin-top: 18px;
  justify-content: flex-start;
}

/* ================== 动效 (Keyframes) ================== */
@keyframes pulseDot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }
}

/* ================== 浅色模式适配 (Light Theme) ================== */
html[data-theme='light'] .setup-main,
html[data-theme='light'] .rail-panel {
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .setup-intro {
  border-color: rgba(148, 163, 184, 0.14);
}

html[data-theme='light'] .setup-intro h2 {
  background: none;
  color: inherit;
}

html[data-theme='light'] .topic-card {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.94);
}

html[data-theme='light'] .topic-card:hover {
  border-color: rgba(249, 115, 22, 0.35);
  background: #ffffff;
}

html[data-theme='light'] .topic-card.active {
  border-color: rgba(249, 115, 22, 0.55);
  box-shadow:
    0 0 24px rgba(249, 115, 22, 0.14),
    inset 0 0 0 1px rgba(249, 115, 22, 0.3);
}

html[data-theme='light'] .rail-stat-card,
html[data-theme='light'] .history-item {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(248, 250, 252, 0.92);
}

html[data-theme='light'] .status-pill {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1100px) {
  .setup-shell {
    grid-template-columns: 1fr;
  }

  .topic-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .setup-main,
  .rail-panel {
    border-radius: var(--radius-lg);
  }

  .setup-main {
    padding: 20px;
  }

  .setup-intro {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 18px;
  }

  .topic-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .topic-card {
    padding: 16px;
    border-radius: var(--radius-lg);
  }

  .rail-panel {
    padding: 20px;
  }
}
</style>
