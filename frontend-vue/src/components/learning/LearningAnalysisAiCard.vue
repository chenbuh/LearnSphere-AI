<script setup>
import { Activity, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { NCard, NIcon, NSpin, NTag } from 'naive-ui'

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
  <div class="ai-analysis-section">
    <n-card class="ai-analysis-card" :bordered="false">
      <template #header>
        <div class="ai-header-content">
          <div class="ai-header-title">
            <n-icon :component="Sparkles" size="22" color="#fbbf24" class="sparkle-icon" />
            <span>{{ labels.title }}</span>
            <n-tag type="success" size="small" :bordered="false" style="margin-left: 12px;">
              <template #icon>
                <n-icon :component="ShieldCheck" :size="12" />
              </template>
              {{ labels.badge }}
            </n-tag>
          </div>
          <div class="ai-refresh-hint">
            <n-icon
              v-if="generating"
              :component="Activity"
              :size="14"
              color="#a78bfa"
              class="spin-icon"
            />
            <span>{{ generating ? labels.generatingHint : labels.readyHint }}</span>
          </div>
        </div>
      </template>
      <div class="ai-content-wrapper">
        <div class="ai-content">
          <n-spin :show="generating" :description="labels.spinDescription" size="small">
            <span v-html="formattedAnalysis"></span>
            <span v-if="displayedLength < fullLength && !generating" class="typing-cursor">✍️</span>
            <span v-if="generating" class="generating-text">{{ labels.generatingText }}</span>
          </n-spin>
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.ai-analysis-section {
  margin-bottom: 24px;
}

.ai-analysis-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(139, 92, 246, 0.06));
  border: 1.5px solid rgba(251, 191, 36, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15);
  transition: all 0.3s ease;
}

.ai-analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(251, 191, 36, 0.25);
}

.ai-analysis-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%);
  animation: gentle-pulse 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes gentle-pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1) rotate(0deg);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.02) rotate(1deg);
  }
}

.ai-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ai-header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sparkle-icon {
  animation: sparkle-rotate 3s ease-in-out infinite;
}

@keyframes sparkle-rotate {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }

  25% {
    transform: rotate(10deg) scale(1.1);
  }

  75% {
    transform: rotate(-10deg) scale(1.05);
  }
}

.ai-refresh-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  color: #eab308;
  background: rgba(234, 179, 8, 0.15);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 99px;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.ai-content-wrapper {
  position: relative;
  z-index: 1;
}

.ai-content {
  position: relative;
  min-height: 100px;
  padding: 20px;
  font-family: 'Inter', 'system-ui', -apple-system, sans-serif;
  font-size: 1.05rem;
  line-height: 1.9;
  letter-spacing: 0.02em;
  color: #e4e4e7;
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.ai-content :deep(.ai-emphasis) {
  font-weight: 700;
  color: #fbbf24;
}

.generating-text {
  color: #fbbf24;
  font-style: italic;
  animation: pulse-text 1.5s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

.typing-cursor {
  display: inline-block;
  margin-left: 2px;
  font-size: 1.2em;
  font-weight: bold;
  color: #fbbf24;
  animation: cursor-blink 1s infinite;
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
</style>
