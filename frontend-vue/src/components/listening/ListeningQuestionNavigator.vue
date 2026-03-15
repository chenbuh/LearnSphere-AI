<script setup>
import { NCard } from 'naive-ui'

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
  <n-card :title="translate('题目导航', 'Question Navigator')" :bordered="false" size="small">
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
  </n-card>
</template>

<style scoped>
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
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--theme-transition);
  color: var(--secondary-text);
}

.num-box.active {
  border-color: #6366f1;
  color: #6366f1;
  font-weight: 700;
  background: rgba(99, 102, 241, 0.1);
}

.num-box.answered {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

@media (max-width: 900px) {
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
