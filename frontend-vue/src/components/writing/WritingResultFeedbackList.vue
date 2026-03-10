<template>
  <div class="feedback-stack">
    <div class="section-badge">CRITICAL INSIGHTS</div>
    <div
      v-for="(fb, idx) in feedbackItems"
      :key="idx"
      class="feedback-item-premium secure-content"
      :class="'type-' + fb.type"
      :style="{ animationDelay: (idx * 0.1) + 's' }"
    >
      <div class="fb-icon">
        <n-icon v-if="fb.type === 'grammar'" :component="SpellCheck" />
        <n-icon v-else-if="fb.type === 'vocab'" :component="BookOpen" />
        <n-icon v-else :component="AlertTriangle" />
      </div>
      <div class="fb-info">
        <div class="fb-type">{{ fb.type?.toUpperCase() }}</div>
        <div class="fb-text">{{ fb.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { AlertTriangle, BookOpen, SpellCheck } from 'lucide-vue-next'

const props = defineProps({
  analysisResult: {
    type: Object,
    default: null
  }
})

const feedbackItems = computed(() => props.analysisResult?.feedback || [])
</script>

<style scoped>
.feedback-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-badge {
  font-size: 0.75rem;
  font-weight: 800;
  color: #6366f1;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.feedback-item-premium {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-left-width: 4px;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  animation: slide-in 0.5s forwards;
  opacity: 0;
  transition: var(--theme-transition);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.type-grammar {
  border-left-color: #f43f5e;
  background: linear-gradient(to right, rgba(244, 63, 94, 0.05), transparent);
}

.type-vocab {
  border-left-color: #3b82f6;
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent);
}

.fb-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: var(--accent-fill);
}

.type-grammar .fb-icon {
  color: #f43f5e;
}

.type-vocab .fb-icon {
  color: #3b82f6;
}

.fb-type {
  font-size: 0.7rem;
  font-weight: 700;
  opacity: 0.6;
  margin-bottom: 4px;
  color: var(--text-color);
}

.fb-text {
  font-size: 0.95rem;
  color: var(--text-color);
  line-height: 1.5;
}
</style>