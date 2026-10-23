<script setup>
const props = defineProps({
  translate: {
    type: Function,
    required: true
  },
  passages: {
    type: Array,
    default: () => []
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  currentQuestionInPassage: {
    type: Number,
    default: 0
  },
  answersPerPassage: {
    type: Object,
    default: () => ({})
  },
  getGlobalNum: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['go-to-question'])

const handleGoToQuestion = (passageIndex, questionIndex) => {
  emit('go-to-question', passageIndex, questionIndex)
}
</script>

<template>
  <section class="navigator-panel">
    <div class="navigator-head">
      <div class="kicker-wrap">
        <span class="kicker-dot"></span>
        <p class="navigator-kicker">{{ translate('题目快速索引', 'Quick Navigator') }}</p>
      </div>
      <h3 class="navigator-title">{{ translate('题目作答导航', 'Question Navigator') }}</h3>
    </div>

    <div v-for="(passage, passageIndex) in props.passages" :key="passageIndex" class="nav-group">
      <div class="group-title">
        <span>Passage {{ passageIndex + 1 }}</span>
        <span class="q-count">{{ passage.questions?.length || 0 }} 题</span>
      </div>
      <div class="num-grid">
        <button
          v-for="(question, questionIndex) in passage.questions"
          :key="questionIndex"
          type="button"
          class="num-box"
          :class="{
            active: passageIndex === props.currentPassageIndex && questionIndex === props.currentQuestionInPassage,
            answered: props.answersPerPassage[passageIndex]?.[questionIndex] !== undefined
          }"
          @click="handleGoToQuestion(passageIndex, questionIndex)"
        >
          {{ props.getGlobalNum(passageIndex, questionIndex) }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.navigator-panel {
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.navigator-head {
  display: grid;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.kicker-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fb923c;
}

.navigator-kicker {
  margin: 0;
  color: var(--tone-orange);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.navigator-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.4;
}

.nav-group {
  margin-bottom: 8px;
}

.group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--secondary-text);
  text-transform: uppercase;
  margin-bottom: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.group-title .q-count {
  font-size: 0.7rem;
  color: var(--secondary-text);
}

.num-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.num-box {
  aspect-ratio: 1;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  cursor: pointer;
  touch-action: manipulation;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--secondary-text);
  font-weight: 700;
  padding: 0;
}

.num-box:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(30, 107, 82, 0.4);
  color: var(--text-color);
  transform: translateY(-1px);
}

.num-box.active {
  border-color: var(--brand);
  color: var(--brand-ink);
  font-weight: 800;
  background: var(--brand);
}

.num-box.answered:not(.active) {
  background: rgba(16, 185, 129, 0.15);
  color: var(--tone-emerald);
  border-color: rgba(16, 185, 129, 0.4);
}

:global(html[data-theme='light'] .navigator-panel) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .navigator-head) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .navigator-title) {
  color: var(--text-color);
}

:global(html[data-theme='light'] .num-box) {
  border-color: rgba(148, 163, 184, 0.2);
  background: #ffffff;
}

:global(html[data-theme='light'] .num-box:hover) {
  background: #f1f5f9;
  color: var(--tone-emerald);
}

:global(html[data-theme='light'] .num-box.active) {
  color: #ffffff;
}

:global(html[data-theme='light'] .num-box.answered:not(.active)) {
  /* 降低底色 alpha，文字改用深绿档，避免 059669 压浅绿底仅 3:1 */
  background: rgba(16, 185, 129, 0.1);
  color: var(--tone-emerald);
  border-color: rgba(16, 185, 129, 0.35);
}

@media (max-width: 900px) {
  .navigator-panel {
    padding: 16px;
    border-radius: var(--radius-lg);
  }

  .nav-group {
    margin-bottom: 12px;
  }

  .num-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }

  .num-box {
    font-size: 0.82rem;
    min-height: 36px;
  }
}
</style>
