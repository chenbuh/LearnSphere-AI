<template>
  <div class="feedback-stack">
    <div class="feedback-head">
      <div>
        <p class="section-kicker">Feedback</p>
        <div class="section-badge">重点反馈</div>
      </div>
      <span class="feedback-count">{{ feedbackItems.length }} 条</span>
    </div>

    <div
      v-for="(fb, idx) in feedbackItems"
      :key="idx"
      class="feedback-item-premium secure-content"
      :class="'type-' + fb.type"
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

    <div v-if="feedbackItems.length === 0" class="feedback-empty">
      这次评估没有生成具体问题，可以继续修改后再次提交获得更详细反馈。
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
  display: grid;
  gap: 16px;
}

.feedback-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.section-kicker {
  margin: 0 0 8px;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-badge {
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--text-color);
}

.feedback-count {
  color: var(--secondary-text);
  font-size: 0.84rem;
  font-weight: 600;
}

.feedback-item-premium {
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  padding: 16px 0 0;
  display: flex;
  gap: 16px;
}

.type-grammar {
  border-top-color: rgba(244, 63, 94, 0.18);
}

.type-vocab {
  border-top-color: rgba(59, 130, 246, 0.18);
}

.fb-icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  background: rgba(15, 23, 42, 0.24);
}

.type-grammar .fb-icon {
  color: #f43f5e;
}

.type-vocab .fb-icon {
  color: #3b82f6;
}

.fb-type {
  font-size: 0.72rem;
  font-weight: 700;
  opacity: 0.72;
  margin-bottom: 6px;
  color: var(--secondary-text);
  letter-spacing: 0.08em;
}

.fb-text {
  font-size: 0.95rem;
  color: var(--text-color);
  line-height: 1.65;
}

.feedback-empty {
  padding: 18px 0 0;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  color: var(--secondary-text);
  line-height: 1.6;
}

:global(html[data-theme='light'] .feedback-head),
:global(html[data-theme='light'] .feedback-empty) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .feedback-item-premium) {
  border-top-color: rgba(148, 163, 184, 0.12);
}

:global(html[data-theme='light'] .fb-icon) {
  background: rgba(241, 245, 249, 0.9);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

@media (max-width: 900px) {
  .feedback-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .feedback-stack {
    gap: 12px;
  }

  .feedback-head {
    padding-bottom: 10px;
  }

  .section-badge {
    font-size: 1.02rem;
  }

  .feedback-item-premium {
    gap: 12px;
    padding-top: 12px;
  }

  .fb-icon {
    width: 34px;
    height: 34px;
    font-size: 0.94rem;
  }

  .fb-type {
    font-size: 0.68rem;
    margin-bottom: 4px;
  }

  .fb-text,
  .feedback-empty {
    font-size: 0.84rem;
    line-height: 1.55;
  }
}

@media (max-width: 360px) {
  .feedback-item-premium {
    flex-direction: column;
  }
}
</style>

