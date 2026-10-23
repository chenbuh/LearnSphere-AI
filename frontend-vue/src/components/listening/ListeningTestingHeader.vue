<script setup>
import { NButton, NIcon, NProgress, NTag } from 'naive-ui'
import { ArrowLeft, Headphones } from 'lucide-vue-next'

defineProps({
  translate: {
    type: Function,
    required: true
  },
  passageTitle: {
    type: String,
    default: ''
  },
  currentPassageIndex: {
    type: Number,
    default: 0
  },
  passagesLength: {
    type: Number,
    default: 0
  },
  progressPercent: {
    type: Number,
    default: 0
  },
  currentGlobalIndex: {
    type: Number,
    default: 0
  },
  totalQuestionsCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['restart'])
</script>

<template>
  <div class="test-header">
    <div class="header-copy">
      <div class="header-kicker">
        <span class="kicker-dot"></span>
        <span class="kicker-text">{{ translate('听力作答 · 正在进行', 'Listening Session · Active') }}</span>
      </div>
      <div class="passage-title">
        <h2>{{ passageTitle || translate('听力篇章', 'Listening Passage') }}</h2>
        <span class="passage-badge">
          Passage {{ currentPassageIndex + 1 }} / {{ passagesLength }}
        </span>
      </div>
    </div>

    <div class="header-tools">
      <div class="progress-pill">
        <n-progress
          type="circle"
          :percentage="progressPercent"
          :show-indicator="false"
          :width="32"
          :stroke-width="10"
          status="info"
        />
        <div class="progress-nums">
          <span class="curr">{{ currentGlobalIndex + 1 }}</span>
          <span class="sep">/</span>
          <span class="tot">{{ totalQuestionsCount }}</span>
        </div>
      </div>
      <n-button quaternary circle class="back-btn" @click="$emit('restart')" :title="translate('退出练习', 'Exit Session')">
        <template #icon><n-icon :component="ArrowLeft" size="18" /></template>
      </n-button>
    </div>
  </div>
</template>

<style scoped>
.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px 26px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.header-copy {
  min-width: 0;
}

.header-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  padding: 3px 10px;
  border-radius: 9999px;
  background: rgba(251, 146, 60, 0.1);
  border: 1px solid rgba(251, 146, 60, 0.25);
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fb923c;
  animation: kicker-pulse 2s infinite ease-in-out;
}

@keyframes kicker-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.kicker-text {
  color: var(--tone-orange);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.passage-title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.passage-title h2 {
  margin: 0;
  font-size: 1.28rem;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.01em;
  min-width: 0;
}

.passage-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  background: rgba(30, 107, 82, 0.14);
  color: var(--brand);
  border: 1px solid rgba(30, 107, 82, 0.3);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 14px;
}

.progress-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px 6px 10px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.progress-nums {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
  font-size: 0.95rem;
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.progress-nums .curr {
  color: var(--brand);
}

.progress-nums .sep {
  color: var(--secondary-text);
  font-size: 0.8rem;
}

.progress-nums .tot {
  color: var(--secondary-text);
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--secondary-text);
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--tone-red);
}

:global(html[data-theme='light'] .test-header) {
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .progress-pill) {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(148, 163, 184, 0.2);
}

:global(html[data-theme='light'] .back-btn) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.2);
}

@media (max-width: 900px) {
  .test-header {
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    margin-bottom: 16px;
    flex-direction: column;
  }

  .passage-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .passage-title h2 {
    font-size: 1.08rem;
    line-height: 1.4;
  }

  .header-tools {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
