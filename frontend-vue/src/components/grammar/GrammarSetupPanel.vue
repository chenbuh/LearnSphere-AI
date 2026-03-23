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

const selectedTopicInfo = computed(() => (
  props.grammarTopics.find(topic => topic.id === props.selectedTopic) || null
))
</script>

<template>
  <section class="setup-shell">
    <div class="setup-main">
      <div class="setup-intro">
        <div>
          <p class="eyebrow">语法主题</p>
          <h2>先选一个知识点，再开始本次语法练习</h2>
        </div>
        <p>
          先选择语法主题和练习范围，确认后即可开始本次练习。
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
          <div class="topic-top">
            <div class="topic-mark" :style="{ backgroundColor: topic.bg, color: topic.color }">
              <n-icon :component="topic.icon" size="20" />
            </div>
            <div class="topic-meta">
              <span class="topic-label">语法主题</span>
              <strong>{{ topic.count }} 题</strong>
            </div>
            <n-icon
              v-if="props.selectedTopic === topic.id"
              :component="CheckCircle2"
              class="topic-check"
            />
          </div>

          <div class="topic-body">
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.desc }}</p>
          </div>

          <div class="topic-foot">
            <n-tag size="small" :bordered="false" round>
              {{ props.selectedTopic === topic.id ? '当前主题' : '点击切换' }}
            </n-tag>
            <n-icon :component="ArrowRight" />
          </div>
        </button>
      </div>
    </div>

    <aside class="setup-rail">
      <div class="rail-panel rail-panel--focus">
        <div class="rail-heading">
          <n-icon :component="Sparkles" />
          <span>当前选择</span>
        </div>
        <h3>{{ selectedTopicInfo?.title || '请选择一个语法主题' }}</h3>
        <p>
          {{ selectedTopicInfo?.desc || '从左侧挑一个更想强化的语法点，右侧配置会继续沿用你的训练节奏。' }}
        </p>
        <div class="rail-stats">
          <div>
            <span>题量</span>
            <strong>{{ selectedTopicInfo?.count || 0 }}</strong>
          </div>
          <div>
            <span>历史练习</span>
            <strong>{{ props.historyTotal }}</strong>
          </div>
        </div>
      </div>

      <div v-if="props.historyTotal > 0" class="rail-panel">
        <div class="rail-heading">
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
              <span>{{ exercise.questions?.length || 0 }} 题 · {{ exercise.difficulty || 'medium' }}</span>
            </div>
            <n-tag size="small" :bordered="false" type="warning">
              载入
            </n-tag>
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
  grid-template-columns: minmax(0, 1.22fr) minmax(280px, 0.78fr);
  gap: 24px;
  align-items: start;
}

.setup-main,
.rail-panel {
  border: 1px solid rgba(148, 163, 184, 0.12);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.18)),
    rgba(15, 23, 42, 0.18);
  border-radius: 24px;
}

.setup-main {
  padding: 28px;
}

.setup-intro {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  padding-bottom: 22px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.eyebrow {
  margin: 0 0 10px;
  color: #fb923c;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.setup-intro h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.1;
  color: var(--text-color);
}

.setup-intro p:last-child {
  max-width: 30rem;
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.7;
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.topic-card {
  width: 100%;
  padding: 18px 18px 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.16);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.topic-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.36);
  background: rgba(15, 23, 42, 0.26);
}

.topic-card.active {
  border-color: rgba(249, 115, 22, 0.65);
  background:
    linear-gradient(180deg, rgba(249, 115, 22, 0.14), rgba(15, 23, 42, 0.18)),
    rgba(15, 23, 42, 0.2);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.25);
}

.topic-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.topic-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
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
  font-size: 0.95rem;
}

.topic-check {
  color: #fb923c;
}

.topic-body h3 {
  margin: 0 0 8px;
  font-size: 1.08rem;
  color: var(--text-color);
}

.topic-body p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
  min-height: 3.2em;
}

.topic-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  color: var(--secondary-text);
}

.setup-rail {
  display: grid;
  gap: 18px;
}

.rail-panel {
  padding: 22px;
}

.rail-panel--focus {
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.14), transparent 40%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.2));
}

.rail-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #fb923c;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-panel h3 {
  margin: 0 0 10px;
  font-size: 1.16rem;
  color: var(--text-color);
}

.rail-panel p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.rail-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.rail-stats div {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.16);
}

.rail-stats span {
  display: block;
  margin-bottom: 4px;
  color: var(--secondary-text);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-stats strong {
  color: var(--text-color);
  font-size: 1rem;
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 14px 0;
  border: 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.history-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.history-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.history-main strong {
  color: var(--text-color);
  font-size: 0.95rem;
}

.history-main span {
  color: var(--secondary-text);
  font-size: 0.84rem;
}

.history-pagination {
  margin-top: 18px;
  justify-content: flex-start;
}

:global(html[data-theme='light'] .setup-main),
:global(html[data-theme='light'] .rail-panel) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .setup-intro),
:global(html[data-theme='light'] .history-item) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .topic-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
}

:global(html[data-theme='light'] .topic-card:hover) {
  border-color: rgba(249, 115, 22, 0.28);
  background: rgba(255, 255, 255, 0.98);
}

:global(html[data-theme='light'] .topic-card.active) {
  background:
    linear-gradient(180deg, rgba(255, 237, 213, 0.84), rgba(255, 247, 237, 0.72)),
    rgba(255, 255, 255, 0.94);
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.18);
}

:global(html[data-theme='light'] .rail-panel--focus) {
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 40%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

:global(html[data-theme='light'] .rail-stats div) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.82);
}

:global(html[data-theme='light'] .history-item:hover) {
  background: rgba(248, 250, 252, 0.72);
}

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
    border-radius: 20px;
  }

  .setup-main {
    padding: 18px;
  }

  .setup-intro {
    flex-direction: column;
    align-items: start;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 18px;
  }

  .topic-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .topic-card {
    padding: 14px;
    border-radius: 16px;
  }

  .rail-panel {
    padding: 18px;
  }

  :global(html[data-theme='light'] .setup-main),
  :global(html[data-theme='light'] .rail-panel) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 16px 30px rgba(148, 163, 184, 0.1);
  }

  :global(html[data-theme='light'] .setup-intro),
  :global(html[data-theme='light'] .history-item) {
    border-color: rgba(203, 213, 225, 0.78);
  }

  :global(html[data-theme='light'] .topic-card) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 8px 18px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .topic-card.active) {
    background:
      linear-gradient(180deg, rgba(255, 237, 213, 0.9), rgba(255, 255, 255, 0.98)),
      #ffffff;
    border-color: rgba(251, 146, 60, 0.42);
  }

  :global(html[data-theme='light'] .rail-panel--focus) {
    background:
      radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 40%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .rail-stats div) {
    border-color: rgba(203, 213, 225, 0.76);
    background: rgba(248, 250, 252, 0.92);
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .setup-main),
  :global(html[data-theme='light'] .rail-panel) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 42px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .setup-intro) {
    border-bottom-color: rgba(203, 213, 225, 0.78);
  }

  :global(html[data-theme='light'] .topic-card) {
    border-color: rgba(203, 213, 225, 0.78);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.94));
    box-shadow: 0 10px 22px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .topic-card:hover) {
    background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 247, 237, 0.98));
    border-color: rgba(251, 146, 60, 0.34);
  }

  :global(html[data-theme='light'] .topic-card.active) {
    background:
      linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98)),
      #ffffff;
    border-color: rgba(251, 146, 60, 0.45);
    box-shadow: 0 0 0 1px rgba(251, 146, 60, 0.16), 0 18px 30px rgba(251, 146, 60, 0.12);
  }

  :global(html[data-theme='light'] .rail-panel--focus) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.16), transparent 40%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .rail-stats div) {
    border-color: rgba(203, 213, 225, 0.76);
    background: rgba(248, 250, 252, 0.92);
  }

  :global(html[data-theme='light'] .history-item) {
    border-bottom-color: rgba(226, 232, 240, 0.9);
  }

  :global(html[data-theme='light'] .history-item:hover) {
    background: rgba(248, 250, 252, 0.92);
  }
}
</style>

