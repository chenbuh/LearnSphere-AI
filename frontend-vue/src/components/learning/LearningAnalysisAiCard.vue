<script setup>
import { Activity, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { NIcon, NSpin, NTag } from 'naive-ui'

defineProps({
  generating: {
    type: Boolean,
    default: false
  },
  formattedAnalysis: {
    type: String,
    required: true
  },
  displayedLength: {
    type: Number,
    default: 0
  },
  fullLength: {
    type: Number,
    default: 0
  },
  labels: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="ai-analysis-card">
    <div class="ai-header-content">
      <div class="ai-header-copy">
        <p class="ai-kicker">{{ labels.sectionLabel || 'AI Memo' }}</p>
        <div class="ai-header-title">
          <n-icon :component="Sparkles" size="20" color="#f8fafc" />
          <span>{{ labels.title }}</span>
        </div>
      </div>

      <div class="ai-header-side">
        <n-tag size="small" :bordered="false" class="ai-tag">
          <template #icon>
            <n-icon :component="ShieldCheck" :size="12" />
          </template>
          {{ labels.badge }}
        </n-tag>

        <div class="ai-refresh-hint">
          <n-icon
            :component="Activity"
            :size="14"
            :class="{ 'spin-icon': generating }"
          />
          <span>{{ generating ? labels.generatingHint : labels.readyHint }}</span>
        </div>
      </div>
    </div>

    <div class="ai-content">
      <n-spin :show="generating" :description="labels.spinDescription" size="small">
        <span v-html="formattedAnalysis"></span>
        <span v-if="displayedLength < fullLength && !generating" class="typing-cursor">|</span>
        <span v-if="generating" class="generating-text">{{ labels.generatingText }}</span>
      </n-spin>
    </div>

    <div class="ai-footer">
      <span>{{ labels.readyHint }}</span>
      <span>{{ displayedLength }} / {{ Math.max(displayedLength, fullLength) }}</span>
    </div>
  </section>
</template>

<style scoped>
.ai-analysis-card {
  position: relative;
  display: grid;
  gap: 18px;
  min-width: 0;
  padding: 22px 22px 20px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(9, 14, 26, 0.92), rgba(9, 14, 26, 0.76)),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 34%);
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.14);
  backdrop-filter: blur(8px);
}

.ai-analysis-card::before {
  content: '';
  position: absolute;
  inset: auto -80px -90px auto;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.1), transparent 70%);
  pointer-events: none;
}

.ai-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.ai-header-copy,
.ai-header-side {
  min-width: 0;
}

.ai-header-copy {
  display: grid;
  gap: 8px;
}

.ai-kicker {
  margin: 0;
  color: #38bdf8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ai-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f8fafc;
  font-size: 1.15rem;
  font-weight: 700;
}

.ai-header-side {
  display: grid;
  justify-items: end;
  gap: 10px;
}

.ai-refresh-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  color: #cbd5e1;
  font-size: 0.76rem;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 99px;
}

.ai-tag {
  color: #dbeafe;
  background: rgba(37, 99, 235, 0.16);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

.ai-content {
  position: relative;
  z-index: 1;
  min-height: 100px;
  max-height: min(460px, calc(100vh - 320px));
  overflow: auto;
  padding: 18px 18px 16px;
  color: #dbe4f0;
  font-size: 0.98rem;
  line-height: 1.9;
  white-space: pre-wrap;
  background: rgba(15, 23, 42, 0.38);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 22px;
}

.ai-content :deep(.ai-emphasis) {
  font-weight: 700;
  color: #7dd3fc;
}

.generating-text {
  color: #7dd3fc;
  font-style: italic;
  animation: pulse-text 1.5s ease-in-out infinite;
}

.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  color: #7dd3fc;
  font-size: 1.2em;
  font-weight: 700;
  animation: cursor-blink 1s infinite;
}

.ai-footer {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  color: #94a3b8;
  font-size: 0.78rem;
}

:global(html[data-theme='light'] .ai-analysis-card) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 34%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .ai-analysis-card::before) {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.08), transparent 70%);
}

:global(html[data-theme='light'] .ai-header-title) {
  color: #0f172a;
}

:global(html[data-theme='light'] .ai-refresh-hint) {
  color: #475569;
  background: rgba(255, 255, 255, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .ai-content) {
  color: #334155;
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .ai-content .ai-emphasis),
:global(html[data-theme='light'] .generating-text),
:global(html[data-theme='light'] .typing-cursor) {
  color: #0ea5e9;
}

:global(html[data-theme='light'] .ai-footer) {
  border-top-color: rgba(148, 163, 184, 0.14);
  color: #64748b;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

@keyframes cursor-blink {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.9);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .ai-analysis-card {
    padding: 20px 20px 18px;
    border-radius: 24px;
  }

  .ai-content {
    max-height: none;
  }
}

@media (max-width: 720px) {
  .ai-analysis-card {
    gap: 16px;
    padding: 18px 16px;
    border-radius: 20px;
  }

  .ai-header-content,
  .ai-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .ai-header-side {
    justify-items: start;
  }

  .ai-content {
    padding: 16px 15px 14px;
    border-radius: 18px;
    font-size: 0.92rem;
    line-height: 1.8;
  }
}
</style>
