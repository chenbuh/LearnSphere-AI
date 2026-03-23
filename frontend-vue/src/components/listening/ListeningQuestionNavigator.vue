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
      <p class="navigator-kicker">{{ translate('导航', 'Navigator') }}</p>
      <h3 class="navigator-title">{{ translate('题目导航', 'Question Navigator') }}</h3>
    </div>

    <div v-for="(passage, passageIndex) in props.passages" :key="passageIndex" class="nav-group">
      <div class="group-title">Passage {{ passageIndex + 1 }}</div>
      <div class="num-grid">
        <div
          v-for="(question, questionIndex) in passage.questions"
          :key="questionIndex"
          class="num-box"
          :class="{
            active: passageIndex === props.currentPassageIndex && questionIndex === props.currentQuestionInPassage,
            answered: props.answersPerPassage[passageIndex]?.[questionIndex] !== undefined
          }"
          @click="handleGoToQuestion(passageIndex, questionIndex)"
        >
          {{ props.getGlobalNum(passageIndex, questionIndex) }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.navigator-panel {
  display: grid;
  gap: 18px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.navigator-head {
  display: grid;
  gap: 4px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.navigator-kicker {
  margin: 0;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.navigator-title {
  margin: 0;
  color: var(--text-color);
  font-size: 1rem;
  line-height: 1.4;
}

.nav-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--secondary-text);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.num-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.num-box {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--theme-transition);
  color: var(--secondary-text);
}

.num-box.active {
  border-color: #0ea5e9;
  color: #0ea5e9;
  font-weight: 700;
  background: rgba(14, 165, 233, 0.12);
}

.num-box.answered {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

:global(html[data-theme='light'] .navigator-panel) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 42%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .navigator-head) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .num-box) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.86);
}

:global(html[data-theme='light'] .num-box.active) {
  background: rgba(219, 234, 254, 0.88);
}

@media (max-width: 900px) {
  .navigator-panel {
    padding: 14px;
    border-radius: 18px;
  }

  .nav-group {
    margin-bottom: 16px;
  }

  .num-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }

  .num-box {
    font-size: 0.75rem;
    border-radius: 10px;
  }
}
</style>
