<template>
  <div class="question-navigator">
    <div class="navigator-header">
      <span class="navigator-title">题目导航</span>
      <span class="navigator-count">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
    </div>
    <div class="question-numbers">
      <div
        v-for="(question, index) in totalQuestions"
        :key="index"
        class="question-number"
        :class="{
          active: index === currentIndex,
          answered: answeredQuestions.includes(index)
        }"
        @click="$emit('goto', index)"
      >
        {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentIndex: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answeredQuestions: {
    type: Array,
    default: () => []
  }
})

defineEmits(['goto'])
</script>

<style scoped>
.question-navigator {
  background: rgba(30, 30, 35, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 20px;
}

.navigator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.navigator-title {
  font-weight: 600;
}

.navigator-count {
  color: #1e6b52;
  font-weight: 700;
}

.question-numbers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  gap: 8px;
}

.question-number {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-weight: 600;
  color: var(--secondary-text);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.question-number:hover {
  background: rgba(30, 107, 82, 0.2);
  border-color: #1e6b52;
  transform: translateY(-2px);
}

.question-number.active {
  background: #1e6b52;
  border-color: #1e6b52;
  color: #fff;
}

.question-number.answered:not(.active) {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  color: #22c55e;
}
</style>
